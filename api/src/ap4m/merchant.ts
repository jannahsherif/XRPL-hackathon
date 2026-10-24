import { Ap4mError, type Ap4mNetwork, type RedeemResult } from "./types.js";
import { voucherDigest } from "./voucher.js";
import {
  X402_SCHEME,
  X402_VERSION,
  decodePaymentSignature,
  encodePaymentRequired,
  encodePaymentResponse,
  type X402PaymentRequired,
  type X402Requirement,
} from "./x402.js";

export interface Invoice {
  tabId: string;
  invoiceId: string;
  channelId: string;
  amountWei: bigint;
  resourceUrl: string;
  content: Record<string, unknown>;
  redemption?: { digest: string; result: RedeemResult };
}

export interface X402Request {
  tabId: string;
  channelId?: string;
  paymentSignature?: string;
}

export interface X402Reply {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

const ERROR_STATUS: Record<string, number> = {
  KYA_REJECTED: 403,
  BAD_SIGNATURE: 401,
  OVER_CAP: 402,
  STALE_VOUCHER: 409,
  CHANNEL_CLOSED: 409,
  CHANNEL_NOT_FOUND: 404,
};

/**
 * The venue as an AP4M Merchant / payee facilitator: answers 402 with the price
 * of a tab, verifies the Agent-signed Voucher, redeems it on PaymentLedger and
 * releases the resource (the settled tab receipt). Retries are idempotent by
 * Voucher digest, so a payment is never redeemed twice.
 */
export class VenueMerchant {
  private readonly invoices = new Map<string, Invoice>();

  constructor(private readonly network: Ap4mNetwork) {}

  createInvoice(invoice: Omit<Invoice, "redemption">): Invoice {
    const created = { ...invoice };
    this.invoices.set(invoice.tabId, created);
    return created;
  }

  getInvoice(tabId: string): Invoice | undefined {
    return this.invoices.get(tabId);
  }

  async requirement(invoice: Invoice): Promise<X402PaymentRequired> {
    const channel = await this.network.getChannel(invoice.channelId);
    const accepted: X402Requirement = {
      scheme: X402_SCHEME,
      network: this.network.network,
      asset: this.network.asset,
      amount: invoice.amountWei.toString(),
      payTo: channel.payout,
      maxTimeoutSeconds: 300,
      extra: {
        ledger: String(this.network.domain.verifyingContract),
        channelId: invoice.channelId,
        acceptedCumulativeAmount: channel.redeemedWei.toString(),
        pricingMode: "fixed",
        bindingVersion: "1",
        merchantId: this.network.merchant().merchantId,
        invoiceId: invoice.invoiceId,
      },
    };
    return {
      x402Version: X402_VERSION,
      error: "payment_required",
      resource: { url: invoice.resourceUrl, description: `Settle tab ${invoice.tabId}`, mimeType: "application/json" },
      accepts: [accepted],
    };
  }

  async handle(req: X402Request): Promise<X402Reply> {
    const invoice = this.invoices.get(req.tabId);
    if (!invoice) return reply(404, { error: "no_invoice_for_tab" });
    if (!req.channelId || !/^0x[0-9a-fA-F]{64}$/.test(req.channelId)) return reply(400, { error: "invalid_channel_id" });
    if (req.channelId.toLowerCase() !== invoice.channelId.toLowerCase()) return reply(403, { error: "channel_not_bound_to_this_tab" });

    let channel;
    try {
      channel = await this.network.getChannel(invoice.channelId);
    } catch {
      return reply(404, { error: "channel_not_found" });
    }
    const { merchantId, payout } = this.network.merchant();
    if (channel.merchantId.toLowerCase() !== merchantId.toLowerCase() || channel.payout.toLowerCase() !== payout.toLowerCase()) {
      return reply(403, { error: "channel_for_another_merchant" });
    }

    if (!req.paymentSignature) {
      if (invoice.redemption) return this.released(invoice); // already paid; replay the result
      if (channel.status !== "open") return reply(409, { error: "channel_closed" });
      const required = await this.requirement(invoice);
      return { status: 402, headers: { "PAYMENT-REQUIRED": encodePaymentRequired(required) }, body: { x402Version: X402_VERSION, error: "payment_required" } };
    }

    let payload;
    try {
      payload = decodePaymentSignature(req.paymentSignature);
    } catch {
      return reply(400, { error: "invalid_payment" });
    }
    const voucher = { channelId: payload.payload?.voucher?.channelId, cumulativeAmount: BigInt(payload.payload?.voucher?.cumulativeAmount ?? 0) };
    if (!voucher.channelId || voucher.channelId.toLowerCase() !== invoice.channelId.toLowerCase()) return reply(400, { error: "voucher_for_another_channel" });

    const digest = voucherDigest(this.network.domain, voucher);
    if (invoice.redemption) {
      return invoice.redemption.digest === digest ? this.released(invoice) : reply(409, { error: "tab_already_paid" });
    }

    const accepted = payload.accepted;
    if (
      !accepted ||
      accepted.scheme !== X402_SCHEME ||
      accepted.amount !== invoice.amountWei.toString() ||
      accepted.extra?.channelId?.toLowerCase() !== invoice.channelId.toLowerCase() ||
      accepted.extra?.acceptedCumulativeAmount !== channel.redeemedWei.toString()
    ) {
      return reply(409, { error: "stale_or_altered_challenge" });
    }
    if (voucher.cumulativeAmount !== channel.redeemedWei + invoice.amountWei) return reply(409, { error: "voucher_amount_mismatch" });

    try {
      const result = await this.network.redeemVoucher(voucher, payload.payload.agentSignature);
      invoice.redemption = { digest, result };
      return this.released(invoice);
    } catch (err) {
      if (err instanceof Ap4mError) return reply(ERROR_STATUS[err.code] ?? 502, { error: err.code, detail: err.message });
      throw err;
    }
  }

  private released(invoice: Invoice): X402Reply {
    const { result, digest } = invoice.redemption!;
    const response = {
      success: true,
      network: this.network.network,
      transaction: result.txHash,
      payer: this.network.agentAddress(),
      claimId: result.claimId,
      voucherDigest: digest,
    };
    return {
      status: 200,
      headers: { "PAYMENT-RESPONSE": encodePaymentResponse(response) },
      body: { resource: { ...invoice.content, claimId: result.claimId, redemptionTx: result.txHash } },
    };
  }
}

function reply(status: number, body: unknown): X402Reply {
  return { status, headers: {}, body };
}
