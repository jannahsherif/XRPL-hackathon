import { Ap4mError, type Ap4mNetwork } from "./types.js";
import {
  X402_SCHEME,
  X402_VERSION,
  decodePaymentRequired,
  decodePaymentResponse,
  encodePaymentSignature,
  type X402PaymentPayload,
  type X402PaymentRequired,
  type X402PaymentResponse,
} from "./x402.js";

/** Minimal HTTP client so the payer works over real HTTP or in-process (Fastify inject). */
export type X402Fetch = (
  url: string,
  headers: Record<string, string>,
) => Promise<{ status: number; header(name: string): string | undefined; body: unknown }>;

export interface PurchaseResult {
  challenge: X402PaymentRequired;
  payment: X402PaymentPayload;
  response: X402PaymentResponse;
  resource: unknown;
}

/**
 * The Agent side of the x402 exchange. Before signing anything it checks the
 * Merchant's challenge against its own authority, like the AP4M kit's
 * buyResource(): right network, asset, ledger and Channel, payTo equal to the
 * bound payout, and price within both the caller's maximum and the Channel cap.
 */
export async function payOverX402(args: {
  network: Ap4mNetwork;
  fetch: X402Fetch;
  resourceUrl: string;
  channelId: string;
  maximumAmountWei: bigint;
  mandateHash?: string;
  onChallenge?: (challenge: X402PaymentRequired) => void;
}): Promise<PurchaseResult> {
  const { network, channelId } = args;
  const first = await args.fetch(args.resourceUrl, { "X-AP4M-CHANNEL-ID": channelId });
  if (first.status !== 402) throw new Ap4mError("CHALLENGE_REJECTED", `Merchant must answer 402 Payment Required (got ${first.status})`);
  const challenge = decodePaymentRequired(first.header("PAYMENT-REQUIRED"));
  args.onChallenge?.(challenge);

  const channel = await network.getChannel(channelId);
  const accepted = challenge.accepts?.[0];
  const reasons: string[] = [];
  if (challenge.x402Version !== X402_VERSION) reasons.push("x402 version");
  if (challenge.accepts?.length !== 1 || !accepted) reasons.push("exactly one payment option");
  else {
    if (accepted.scheme !== X402_SCHEME) reasons.push("scheme");
    if (accepted.network !== network.network) reasons.push("network");
    if (accepted.asset.toLowerCase() !== network.asset.toLowerCase()) reasons.push("asset (RLUSD)");
    if (accepted.payTo.toLowerCase() !== channel.payout.toLowerCase()) reasons.push("payTo is not the Channel's bound payout");
    if (accepted.extra.ledger.toLowerCase() !== String(network.domain.verifyingContract).toLowerCase()) reasons.push("PaymentLedger");
    if (accepted.extra.channelId.toLowerCase() !== channelId.toLowerCase()) reasons.push("Channel");
    if (accepted.extra.acceptedCumulativeAmount !== channel.redeemedWei.toString()) reasons.push("cumulative watermark");
    if (channel.agent.toLowerCase() !== network.agentAddress().toLowerCase()) reasons.push("Channel belongs to another Agent");
    if (channel.status !== "open") reasons.push("Channel is not open");
    const amount = BigInt(accepted.amount);
    if (amount <= 0n) reasons.push("price must be positive");
    if (amount > args.maximumAmountWei) reasons.push("price above the authorized maximum");
    if (amount + channel.redeemedWei > channel.capWei) reasons.push("price exceeds the Channel cap");
  }
  if (reasons.length) throw new Ap4mError("CHALLENGE_REJECTED", `Merchant challenge exceeds the purchase authority: ${reasons.join(", ")}`);

  const voucher = { channelId, cumulativeAmount: channel.redeemedWei + BigInt(accepted!.amount) };
  const agentSignature = await network.signVoucher(voucher);
  const payment: X402PaymentPayload = {
    x402Version: X402_VERSION,
    accepted: accepted!,
    payload: {
      voucher: { channelId, cumulativeAmount: voucher.cumulativeAmount.toString() },
      agentSignature,
      ...(args.mandateHash ? { mandateHash: args.mandateHash } : {}),
    },
  };

  const second = await args.fetch(args.resourceUrl, { "X-AP4M-CHANNEL-ID": channelId, "PAYMENT-SIGNATURE": encodePaymentSignature(payment) });
  if (second.status !== 200) {
    const err = (second.body as { error?: string; detail?: string }) ?? {};
    throw new Ap4mError(
      (err.error as Ap4mError["code"]) && ["OVER_CAP", "KYA_REJECTED", "BAD_SIGNATURE", "STALE_VOUCHER", "CHANNEL_CLOSED"].includes(err.error!)
        ? (err.error as Ap4mError["code"])
        : "CHALLENGE_REJECTED",
      `Merchant refused the Voucher (HTTP ${second.status}): ${err.detail ?? err.error ?? ""}`,
    );
  }
  const response = decodePaymentResponse(second.header("PAYMENT-RESPONSE"));
  if (!response.success || response.network !== network.network) throw new Ap4mError("CHALLENGE_REJECTED", "Merchant result is not a confirmed redemption");
  return { challenge, payment, response, resource: (second.body as { resource?: unknown })?.resource };
}
