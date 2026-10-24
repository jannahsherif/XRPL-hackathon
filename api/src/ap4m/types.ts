import type { TypedDataDomain } from "ethers";

import type { Voucher } from "./voucher.js";

export type ChannelStatus = "open" | "closed";

/** One AP4M Channel: a funded spending lane from the Agent to one Merchant (the venue). */
export interface ChannelInfo {
  channelId: string;
  agent: string;
  merchantId: string;
  payout: string;
  capWei: bigint;
  redeemedWei: bigint;
  settledWei: bigint;
  status: ChannelStatus;
  validBefore: number;
}

/** A KYA record in the ParticipantRegistry. */
export interface Participant {
  role: "agent_principal" | "agent" | "merchant";
  id: string;
  address: string;
  attestedBy: string;
  status: "active" | "suspended";
  label: string;
}

export interface RedeemResult {
  claimId: string;
  txHash: string;
  voucherDigest: string;
  amountWei: bigint;
  cumulativeWei: bigint;
}

export interface SettleResult {
  settlementTxHash: string;
  payoutTxHash: string;
  amountWei: bigint;
  receiptUrl: string | null;
  claimsSettled: number;
}

/**
 * The AP4M surface Settle relies on. Two implementations: a simulated network
 * that enforces the same rules in memory, and the live XRPL EVM Testnet.
 */
export interface Ap4mNetwork {
  readonly mode: "simulated" | "live";
  readonly domain: TypedDataDomain;
  readonly network: string;
  readonly asset: string;
  agentAddress(): string;
  merchant(): { merchantId: string; payout: string };
  /** Open a funded Channel (Authorized Spend Limit) from the Agent to the venue. */
  openChannel(capWei: bigint): Promise<{ channel: ChannelInfo; txHash: string }>;
  getChannel(channelId: string): Promise<ChannelInfo>;
  /** The Agent signs a cumulative Voucher with its payment key (never the funding key). */
  signVoucher(voucher: Voucher): Promise<string>;
  /** The Merchant (payee facilitator) redeems an Agent-signed Voucher on PaymentLedger. */
  redeemVoucher(voucher: Voucher, agentSignature: string): Promise<RedeemResult>;
  /** Pay (redeemed - settled) RLUSD to the Merchant payout address. */
  settle(channelId: string): Promise<SettleResult>;
  /** Close the Channel; the unused cap returns to the Agent Principal's budget. */
  closeChannel(channelId: string): Promise<{ txHash: string }>;
  participants(): Promise<Participant[]>;
  budget(): Promise<{ depositWei: bigint; allocatedWei: bigint; availableWei: bigint } | null>;
}

export class Ap4mError extends Error {
  constructor(
    readonly code:
      | "KYA_REJECTED"
      | "OVER_CAP"
      | "BAD_SIGNATURE"
      | "STALE_VOUCHER"
      | "CHANNEL_CLOSED"
      | "CHANNEL_NOT_FOUND"
      | "BUDGET_EXCEEDED"
      | "CHALLENGE_REJECTED"
      | "SERVICE_ERROR",
    message: string,
  ) {
    super(message);
  }
}
