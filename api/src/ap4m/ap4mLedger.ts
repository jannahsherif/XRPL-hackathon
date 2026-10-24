import type { EventType, Ledger, OpenTabResult, SettleTabResult, Tab } from "../types.js";
import { centsToDecimal, decimalToCents } from "../money.js";
import { VenueMerchant } from "./merchant.js";
import { txUrl } from "./network.js";
import { payOverX402, type X402Fetch } from "./payer.js";
import { Ap4mError, type Ap4mNetwork } from "./types.js";
import { centsToWei, formatRlusd, weiToCents } from "./units.js";

export interface Ap4mLedgerOptions {
  network: Ap4mNetwork;
  usdPerRlusd: number;
  /** Absolute URL of a tab's x402 resource, e.g. https://api.example/x402/tabs/t101/resource */
  resourceUrl: (tabId: string) => string;
  publish?: (type: EventType, data: unknown) => void;
}

/**
 * Implements the team's ledger contract (openTab / settleTab / cancelTab /
 * getBalances) on Mastercard AP4M:
 *
 *   openTab   -> open a funded Channel whose cap is the tab allowance (Funded ASL)
 *   settleTab -> x402: venue answers 402, the Agent signs a cumulative EIP-712
 *                Voucher, the venue redeems it on PaymentLedger, then settle()
 *                pays RLUSD to the venue payout and closeChannel() returns the rest
 *   cancelTab -> close the Channel with nothing redeemed
 */
export class Ap4mLedger implements Ledger {
  readonly merchant: VenueMerchant;
  private fetcher: X402Fetch | null = null;

  constructor(private readonly opts: Ap4mLedgerOptions) {
    this.merchant = new VenueMerchant(opts.network);
  }

  get network(): Ap4mNetwork {
    return this.opts.network;
  }

  /** The HTTP client the Agent uses to reach the venue's x402 endpoint (set once the app is built). */
  setFetch(fetcher: X402Fetch): void {
    this.fetcher = fetcher;
  }

  private publish(type: EventType, data: unknown) {
    this.opts.publish?.(type, data);
  }

  private explorer(hash: string): string | null {
    return this.opts.network.mode === "live" ? txUrl(hash) : null;
  }

  async openTab({ allowance }: { memberId: string; allowance: string }): Promise<OpenTabResult> {
    const capWei = centsToWei(decimalToCents(allowance), this.opts.usdPerRlusd);
    const { channel, txHash } = await this.opts.network.openChannel(capWei);
    const info = {
      mode: this.opts.network.mode,
      network: this.opts.network.network,
      channelId: channel.channelId,
      capWei: channel.capWei.toString(),
      capRlusd: formatRlusd(channel.capWei),
      agent: channel.agent,
      merchantId: channel.merchantId,
      payout: channel.payout,
      openTxHash: txHash,
    };
    this.publish("ap4m.channel_opened", info);
    return { escrowSeq: 0, txHash, explorerUrl: this.explorer(txHash), ledgerIndex: 0, ap4m: info };
  }

  async settleTab({ tab, amount, tipAmount }: { tab: Tab; amount: string; tipAmount: string }): Promise<SettleTabResult> {
    const started = Date.now();
    const channelId = tab.ap4m?.channelId;
    if (!channelId) throw Object.assign(new Error("Tab has no AP4M Channel"), { code: "ESCROW_NOT_FOUND" });
    if (!this.fetcher) throw Object.assign(new Error("x402 client not configured"), { code: "LEDGER_ERROR" });

    // Ledger contract: `amount` excludes the tip, so the Voucher covers amount + tip.
    const amountCents = decimalToCents(amount) + decimalToCents(tipAmount);
    const amountWei = centsToWei(amountCents, this.opts.usdPerRlusd);
    const submittedAt = new Date(started).toISOString();
    const resourceUrl = this.opts.resourceUrl(tab.id);
    this.merchant.createInvoice({
      tabId: tab.id,
      invoiceId: `INV-${tab.id}-${Date.now()}`,
      channelId,
      amountWei,
      resourceUrl,
      content: {
        receipt: {
          tabId: tab.id,
          memberId: tab.memberId,
          seat: tab.seat,
          items: tab.items,
          totalCents: tab.totalCents,
          tipCents: decimalToCents(tipAmount),
          amountUsd: centsToDecimal(amountCents),
          amountRlusd: formatRlusd(amountWei),
          mandateHash: tab.mandate?.hash ?? null,
        },
      },
    });

    const purchase = await payOverX402({
      network: this.opts.network,
      fetch: this.fetcher,
      resourceUrl,
      channelId,
      maximumAmountWei: amountWei,
      mandateHash: tab.mandate?.hash,
      onChallenge: (challenge) => this.publish("x402.payment_required", { tabId: tab.id, challenge }),
    });
    const claim = this.merchant.getInvoice(tab.id)!.redemption!.result;
    this.publish("x402.paid", { tabId: tab.id, claimId: claim.claimId, voucherDigest: claim.voucherDigest, redemptionTxHash: claim.txHash, response: purchase.response });

    const settled = await this.opts.network.settle(channelId);
    // Return the unused allowance to the member's budget (the "remainder back to member").
    const closed = await this.opts.network.closeChannel(channelId).catch(() => null);
    this.publish("ap4m.settled", { tabId: tab.id, channelId, ...settled, amountWei: settled.amountWei.toString(), closeTxHash: closed?.txHash ?? null });

    const allowanceCents = decimalToCents(tab.allowance);
    const toVenueCents = weiToCents(claim.amountWei, this.opts.usdPerRlusd);
    const hashes = [claim.txHash, settled.payoutTxHash, settled.settlementTxHash, closed?.txHash].filter(Boolean) as string[];
    return {
      finishTxHash: claim.txHash,
      refundTxHash: closed?.txHash ?? null,
      toVenue: centsToDecimal(toVenueCents),
      toMember: centsToDecimal(allowanceCents - toVenueCents),
      elapsedMs: Date.now() - started,
      explorerUrls: this.opts.network.mode === "live" ? hashes.map(txUrl) : [],
      submittedAt,
      validatedAt: new Date().toISOString(),
      mode: "x402",
      ap4m: {
        amountWei: claim.amountWei.toString(),
        amountRlusd: formatRlusd(claim.amountWei),
        claimId: claim.claimId,
        voucherDigest: claim.voucherDigest,
        redemptionTxHash: claim.txHash,
        settlementTxHash: settled.settlementTxHash,
        payoutTxHash: settled.payoutTxHash,
        closeTxHash: closed?.txHash ?? null,
        receiptUrl: settled.receiptUrl,
        explorerUrls: this.opts.network.mode === "live" ? hashes.map(txUrl) : [],
      },
    };
  }

  async cancelTab({ tab }: { tab: Tab }): Promise<{ txHash: string }> {
    const channelId = tab.ap4m?.channelId;
    if (!channelId) throw Object.assign(new Error("Tab has no AP4M Channel"), { code: "ESCROW_NOT_FOUND" });
    return this.opts.network.closeChannel(channelId);
  }

  async getBalances() {
    const budget = await this.opts.network.budget();
    return { venue: "n/a", members: {}, ...(budget ? { budgetRlusd: formatRlusd(budget.availableWei) } : {}) };
  }

  /**
   * Demo proof for judges: try to spend past the Channel cap. The Agent refuses
   * to sign, and the PaymentLedger refuses a Voucher signed anyway.
   */
  async attemptOverCap(tab: Tab): Promise<{ agentRefused: string; ledgerRefused: string }> {
    const channelId = tab.ap4m?.channelId;
    if (!channelId) throw new Ap4mError("CHANNEL_NOT_FOUND", "Tab has no AP4M Channel");
    const channel = await this.opts.network.getChannel(channelId);
    const overWei = channel.capWei - channel.redeemedWei + 1n;
    this.merchant.createInvoice({
      tabId: `${tab.id}-overcap`,
      invoiceId: `OVERCAP-${tab.id}`,
      channelId,
      amountWei: overWei,
      resourceUrl: this.opts.resourceUrl(`${tab.id}-overcap`),
      content: { note: "over-cap probe" },
    });
    let agentRefused = "";
    try {
      await payOverX402({ network: this.opts.network, fetch: this.fetcher!, resourceUrl: this.opts.resourceUrl(`${tab.id}-overcap`), channelId, maximumAmountWei: overWei });
    } catch (err) {
      agentRefused = (err as Error).message;
    }
    let ledgerRefused = "";
    try {
      const voucher = { channelId, cumulativeAmount: channel.capWei + 1n };
      await this.opts.network.redeemVoucher(voucher, await this.opts.network.signVoucher(voucher));
    } catch (err) {
      ledgerRefused = (err as Error).message;
    }
    this.publish("ap4m.rejected", { tabId: tab.id, attemptedWei: (channel.capWei + 1n).toString(), capWei: channel.capWei.toString(), agentRefused, ledgerRefused });
    return { agentRefused, ledgerRefused };
  }
}
