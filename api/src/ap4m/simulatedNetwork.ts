import { Wallet, hexlify, id, keccak256, randomBytes, toUtf8Bytes, type TypedDataDomain } from "ethers";

import { AP4M_CONTRACTS, AP4M_NETWORK, AP4M_PSPS } from "./network.js";
import { Ap4mError, type Ap4mNetwork, type ChannelInfo, type Participant, type RedeemResult, type SettleResult } from "./types.js";
import { recoverVoucherSigner, signVoucher, voucherDigest, voucherDomain, type Voucher } from "./voucher.js";

interface SimulatedOptions {
  agentWallet?: Wallet;
  budgetWei: bigint;
  merchantId?: string;
  payout?: string;
  /** Channel lifetime; real Channels close at the end of the event. */
  channelLifetimeSeconds?: number;
  now?: () => number;
}

export interface LedgerEvent {
  name: "ChannelOpened" | "VoucherRedeemed" | "ClaimPaid" | "SettlementRecorded" | "ChannelClosed";
  txHash: string;
  blockNumber: number;
  args: Record<string, string | number>;
}

/**
 * In-memory ParticipantRegistry + PaymentLedger + PooledEscrowVault with the
 * AP4M rules: KYA-gated Channels, caps funded from the vault, real EIP-712
 * signature checks, and `settled <= redeemed <= cap`. Vouchers it accepts are
 * byte-for-byte the ones the live PaymentLedger accepts (same domain and types).
 */
export class SimulatedAp4mNetwork implements Ap4mNetwork {
  readonly mode = "simulated" as const;
  readonly domain: TypedDataDomain;
  readonly network = AP4M_NETWORK.caip2;
  readonly asset = AP4M_CONTRACTS.rlusdToken;
  readonly events: LedgerEvent[] = [];

  private readonly agent: Wallet;
  private readonly merchantId: string;
  private readonly payout: string;
  private readonly channels = new Map<string, ChannelInfo>();
  private readonly claims = new Map<string, { channelId: string; amountWei: bigint; settled: boolean }>();
  private readonly registry = new Map<string, Participant>();
  private readonly depositWei: bigint;
  private allocatedWei = 0n;
  private block = 9_100_000;
  private readonly lifetime: number;
  private readonly now: () => number;

  constructor(opts: SimulatedOptions) {
    this.agent = opts.agentWallet ?? (Wallet.createRandom() as unknown as Wallet);
    this.merchantId = opts.merchantId ?? id("settle-venue-merchant");
    this.payout = opts.payout ?? Wallet.createRandom().address;
    this.depositWei = opts.budgetWei;
    this.lifetime = opts.channelLifetimeSeconds ?? 12 * 3600;
    this.now = opts.now ?? (() => Math.floor(Date.now() / 1000));
    this.domain = voucherDomain(AP4M_NETWORK.chainId, AP4M_CONTRACTS.paymentLedger);

    // PSP-sponsored onboarding (Know Your Agent): payer PSP attests the principal and agent, payee PSP the merchant.
    const [payer, payee] = AP4M_PSPS;
    this.register({ role: "agent_principal", id: id("settle-principal"), address: Wallet.createRandom().address, attestedBy: payer.pspId, status: "active", label: "Members' club (Agent Principal)" });
    this.register({ role: "agent", id: id(`agent:${this.agent.address}`), address: this.agent.address, attestedBy: payer.pspId, status: "active", label: "Settle settlement agent" });
    this.register({ role: "merchant", id: this.merchantId, address: this.payout, attestedBy: payee.pspId, status: "active", label: "Venue (Merchant payout)" });
  }

  agentAddress(): string {
    return this.agent.address;
  }

  merchant() {
    return { merchantId: this.merchantId, payout: this.payout };
  }

  register(p: Participant): void {
    this.registry.set(p.address.toLowerCase(), p);
  }

  /** Demo hook: suspend a participant to show KYA enforcement. */
  setStatus(address: string, status: Participant["status"]): void {
    const p = this.registry.get(address.toLowerCase());
    if (p) p.status = status;
  }

  async participants() {
    return [...this.registry.values()];
  }

  async budget() {
    return { depositWei: this.depositWei, allocatedWei: this.allocatedWei, availableWei: this.depositWei - this.allocatedWei };
  }

  async openChannel(capWei: bigint) {
    if (capWei <= 0n) throw new Ap4mError("OVER_CAP", "Channel cap must be positive");
    this.requireActive(this.agent.address, "agent");
    this.requireActive(this.payout, "merchant");
    if (this.allocatedWei + capWei > this.depositWei) {
      throw new Ap4mError("BUDGET_EXCEEDED", "Channel cap exceeds the funded budget in PooledEscrowVault");
    }
    this.allocatedWei += capWei;
    const channelId = hexlify(randomBytes(32));
    const channel: ChannelInfo = {
      channelId,
      agent: this.agent.address,
      merchantId: this.merchantId,
      payout: this.payout,
      capWei,
      redeemedWei: 0n,
      settledWei: 0n,
      status: "open",
      validBefore: this.now() + this.lifetime,
    };
    this.channels.set(channelId, channel);
    const txHash = this.emit("ChannelOpened", { channelId, capWei: capWei.toString(), agent: this.agent.address, payout: this.payout });
    return { channel: { ...channel }, txHash };
  }

  async getChannel(channelId: string) {
    return { ...this.channel(channelId) };
  }

  async signVoucher(voucher: Voucher) {
    return signVoucher(this.agent, this.domain, voucher);
  }

  async redeemVoucher(voucher: Voucher, agentSignature: string): Promise<RedeemResult> {
    const channel = this.channel(voucher.channelId);
    if (channel.status !== "open" || this.now() >= channel.validBefore) throw new Ap4mError("CHANNEL_CLOSED", "Channel is not open");
    let signer: string;
    try {
      signer = recoverVoucherSigner(this.domain, voucher, agentSignature);
    } catch {
      throw new Ap4mError("BAD_SIGNATURE", "Voucher signature is malformed");
    }
    if (signer.toLowerCase() !== channel.agent.toLowerCase()) {
      throw new Ap4mError("BAD_SIGNATURE", "Voucher is not signed by the Channel's registered Agent");
    }
    this.requireActive(signer, "agent");
    if (voucher.cumulativeAmount <= channel.redeemedWei) throw new Ap4mError("STALE_VOUCHER", "Voucher does not advance the redeemed watermark");
    if (voucher.cumulativeAmount > channel.capWei) throw new Ap4mError("OVER_CAP", "Voucher exceeds the Channel cap (redeemed must never exceed cap)");

    const amountWei = voucher.cumulativeAmount - channel.redeemedWei;
    channel.redeemedWei = voucher.cumulativeAmount;
    const digest = voucherDigest(this.domain, voucher);
    const claimId = keccak256(toUtf8Bytes(`${voucher.channelId}:${digest}`));
    this.claims.set(claimId, { channelId: voucher.channelId, amountWei, settled: false });
    const txHash = this.emit("VoucherRedeemed", {
      channelId: voucher.channelId,
      claimId,
      voucherDigest: digest,
      cumulativeAmount: voucher.cumulativeAmount.toString(),
      amount: amountWei.toString(),
    });
    return { claimId, txHash, voucherDigest: digest, amountWei, cumulativeWei: voucher.cumulativeAmount };
  }

  async settle(channelId: string): Promise<SettleResult> {
    const channel = this.channel(channelId);
    const amountWei = channel.redeemedWei - channel.settledWei;
    const pending = [...this.claims.entries()].filter(([, c]) => c.channelId === channelId && !c.settled);
    pending.forEach(([, c]) => (c.settled = true));
    channel.settledWei = channel.redeemedWei;
    const payoutTxHash = this.emit("ClaimPaid", { channelId, payout: channel.payout, amount: amountWei.toString() });
    const settlementTxHash = this.emit("SettlementRecorded", { channelId, settled: channel.settledWei.toString(), claims: pending.length });
    return { settlementTxHash, payoutTxHash, amountWei, receiptUrl: null, claimsSettled: pending.length };
  }

  async closeChannel(channelId: string) {
    const channel = this.channel(channelId);
    if (channel.status === "closed") throw new Ap4mError("CHANNEL_CLOSED", "Channel already closed");
    channel.status = "closed";
    const unused = channel.capWei - channel.redeemedWei;
    this.allocatedWei -= unused; // unused cap returns to the budget; redeemed value stays spent
    const txHash = this.emit("ChannelClosed", { channelId, finalCumulativeAmount: channel.redeemedWei.toString(), returned: unused.toString() });
    return { txHash };
  }

  private channel(channelId: string): ChannelInfo {
    const channel = this.channels.get(channelId);
    if (!channel) throw new Ap4mError("CHANNEL_NOT_FOUND", `Unknown Channel ${channelId}`);
    return channel;
  }

  private requireActive(address: string, role: Participant["role"]): void {
    const p = this.registry.get(address.toLowerCase());
    if (!p || p.role !== role || p.status !== "active") {
      throw new Ap4mError("KYA_REJECTED", `${address} is not an active Mastercard-verified ${role} in the ParticipantRegistry`);
    }
  }

  private emit(name: LedgerEvent["name"], args: LedgerEvent["args"]): string {
    const txHash = keccak256(toUtf8Bytes(`${name}:${++this.block}:${JSON.stringify(args)}`));
    this.events.push({ name, txHash, blockNumber: this.block, args });
    return txHash;
  }
}
