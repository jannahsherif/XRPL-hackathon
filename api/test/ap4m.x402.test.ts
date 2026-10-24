import { Wallet, parseUnits } from "ethers";
import { beforeEach, describe, expect, it } from "vitest";

import { VenueMerchant } from "../src/ap4m/merchant.js";
import { payOverX402, type X402Fetch } from "../src/ap4m/payer.js";
import { SimulatedAp4mNetwork } from "../src/ap4m/simulatedNetwork.js";
import { Ap4mError } from "../src/ap4m/types.js";
import { signVoucher } from "../src/ap4m/voucher.js";
import { decodePaymentRequired, decodePaymentResponse, decodePaymentSignature, encodePaymentRequired, encodePaymentSignature } from "../src/ap4m/x402.js";

const rlusd = (v: string) => parseUnits(v, 18);
const URL_ = "http://127.0.0.1/x402/tabs/t1/resource";

let net: SimulatedAp4mNetwork;
let merchant: VenueMerchant;
let channelId: string;

/** Routes the payer's requests straight into the merchant handler, recording them. */
function wire(rewrite?: (h: Record<string, string>, status: number, headers: Record<string, string>) => Record<string, string>) {
  const calls: { headers: Record<string, string>; status: number }[] = [];
  const fetcher: X402Fetch = async (_url, headers) => {
    const out = await merchant.handle({ tabId: "t1", channelId: headers["X-AP4M-CHANNEL-ID"], paymentSignature: headers["PAYMENT-SIGNATURE"] });
    const outHeaders = rewrite ? rewrite(headers, out.status, out.headers) : out.headers;
    calls.push({ headers, status: out.status });
    return { status: out.status, header: (n) => outHeaders[n] ?? outHeaders[n.toUpperCase()], body: out.body };
  };
  return { fetcher, calls };
}

beforeEach(async () => {
  net = new SimulatedAp4mNetwork({ budgetWei: rlusd("20"), agentWallet: Wallet.createRandom() as unknown as Wallet });
  merchant = new VenueMerchant(net);
  channelId = (await net.openChannel(rlusd("6"))).channel.channelId;
  merchant.createInvoice({ tabId: "t1", invoiceId: "INV-1", channelId, amountWei: rlusd("1.272"), resourceUrl: URL_, content: { receipt: { tabId: "t1" } } });
});

describe("Merchant challenge (HTTP 402)", () => {
  it("answers 402 with a single batch-settlement requirement bound to the Channel", async () => {
    const out = await merchant.handle({ tabId: "t1", channelId });
    expect(out.status).toBe(402);
    const required = decodePaymentRequired(out.headers["PAYMENT-REQUIRED"]);
    expect(required.x402Version).toBe(2);
    expect(required.resource.url).toBe(URL_);
    expect(required.accepts).toHaveLength(1);
    expect(required.accepts[0]).toMatchObject({
      scheme: "batch-settlement",
      network: "eip155:1449000",
      asset: net.asset,
      amount: rlusd("1.272").toString(),
      payTo: net.merchant().payout,
      extra: { channelId, acceptedCumulativeAmount: "0", pricingMode: "fixed", bindingVersion: "1", ledger: net.domain.verifyingContract, invoiceId: "INV-1" },
    });
  });

  it.each([
    [{ tabId: "nope", channelId: "0x" + "1".repeat(64) }, 404, "no_invoice_for_tab"],
    [{ tabId: "t1" }, 400, "invalid_channel_id"],
    [{ tabId: "t1", channelId: "0x12" }, 400, "invalid_channel_id"],
    [{ tabId: "t1", channelId: "0x" + "2".repeat(64) }, 403, "channel_not_bound_to_this_tab"],
  ])("rejects %j with %i", async (req, status, error) => {
    const out = await merchant.handle(req as never);
    expect(out.status).toBe(status);
    expect(out.body).toMatchObject({ error });
  });

  it("refuses a Channel bound to another merchant", async () => {
    const other = new SimulatedAp4mNetwork({ budgetWei: rlusd("5"), agentWallet: Wallet.createRandom() as unknown as Wallet });
    const otherMerchant = new VenueMerchant({ ...net, merchant: () => other.merchant(), getChannel: net.getChannel.bind(net), domain: net.domain, network: net.network, asset: net.asset } as never);
    otherMerchant.createInvoice({ tabId: "t1", invoiceId: "X", channelId, amountWei: 1n, resourceUrl: URL_, content: {} });
    expect((await otherMerchant.handle({ tabId: "t1", channelId })).status).toBe(403);
  });
});

describe("full x402 exchange", () => {
  it("402 -> Agent-signed Voucher -> redeemed -> 200 with PAYMENT-RESPONSE and the resource", async () => {
    const { fetcher, calls } = wire();
    const result = await payOverX402({ network: net, fetch: fetcher, resourceUrl: URL_, channelId, maximumAmountWei: rlusd("1.272"), mandateHash: "sha256:abc" });
    expect(calls.map((c) => c.status)).toEqual([402, 200]);
    expect(calls[1].headers["PAYMENT-SIGNATURE"]).toBeDefined();
    const payment = decodePaymentSignature(calls[1].headers["PAYMENT-SIGNATURE"]);
    expect(payment.payload.voucher).toEqual({ channelId, cumulativeAmount: rlusd("1.272").toString() });
    expect(payment.payload.mandateHash).toBe("sha256:abc");
    expect(result.response).toMatchObject({ success: true, network: "eip155:1449000", payer: net.agentAddress() });
    expect(result.resource).toMatchObject({ receipt: { tabId: "t1" }, claimId: result.response.claimId });
    expect((await net.getChannel(channelId)).redeemedWei).toBe(rlusd("1.272"));
  });

  it("is idempotent: replaying the same payment returns the same result and redeems once", async () => {
    const { fetcher, calls } = wire();
    await payOverX402({ network: net, fetch: fetcher, resourceUrl: URL_, channelId, maximumAmountWei: rlusd("2") });
    const replay = await merchant.handle({ tabId: "t1", channelId, paymentSignature: calls[1].headers["PAYMENT-SIGNATURE"] });
    expect(replay.status).toBe(200);
    expect(decodePaymentResponse(replay.headers["PAYMENT-RESPONSE"]).claimId).toBeDefined();
    expect(net.events.filter((e) => e.name === "VoucherRedeemed")).toHaveLength(1);
    // Asking again without a signature also replays rather than charging twice.
    expect((await merchant.handle({ tabId: "t1", channelId })).status).toBe(200);
  });

  it("refuses a second, different payment for an already-paid tab", async () => {
    const { fetcher } = wire();
    await payOverX402({ network: net, fetch: fetcher, resourceUrl: URL_, channelId, maximumAmountWei: rlusd("2") });
    const required = await merchant.requirement(merchant.getInvoice("t1")!);
    const voucher = { channelId, cumulativeAmount: rlusd("2.544") };
    const out = await merchant.handle({
      tabId: "t1",
      channelId,
      paymentSignature: encodePaymentSignature({ x402Version: 2, accepted: required.accepts[0], payload: { voucher: { channelId, cumulativeAmount: voucher.cumulativeAmount.toString() }, agentSignature: await net.signVoucher(voucher) } }),
    });
    expect(out.status).toBe(409);
    expect(out.body).toMatchObject({ error: "tab_already_paid" });
  });

  it("refuses a Voucher whose amount does not match the price", async () => {
    const challenge = decodePaymentRequired((await merchant.handle({ tabId: "t1", channelId })).headers["PAYMENT-REQUIRED"]);
    const voucher = { channelId, cumulativeAmount: rlusd("0.5") }; // underpays
    const out = await merchant.handle({
      tabId: "t1",
      channelId,
      paymentSignature: encodePaymentSignature({ x402Version: 2, accepted: challenge.accepts[0], payload: { voucher: { channelId, cumulativeAmount: voucher.cumulativeAmount.toString() }, agentSignature: await net.signVoucher(voucher) } }),
    });
    expect(out.status).toBe(409);
    expect(out.body).toMatchObject({ error: "voucher_amount_mismatch" });
  });

  it("refuses an altered challenge (amount rewritten by the payer)", async () => {
    const challenge = decodePaymentRequired((await merchant.handle({ tabId: "t1", channelId })).headers["PAYMENT-REQUIRED"]);
    const accepted = { ...challenge.accepts[0], amount: "1" };
    const voucher = { channelId, cumulativeAmount: 1n };
    const out = await merchant.handle({
      tabId: "t1",
      channelId,
      paymentSignature: encodePaymentSignature({ x402Version: 2, accepted, payload: { voucher: { channelId, cumulativeAmount: "1" }, agentSignature: await net.signVoucher(voucher) } }),
    });
    expect(out.status).toBe(409);
    expect(out.body).toMatchObject({ error: "stale_or_altered_challenge" });
  });

  it("refuses an impostor's signature with 401", async () => {
    const challenge = decodePaymentRequired((await merchant.handle({ tabId: "t1", channelId })).headers["PAYMENT-REQUIRED"]);
    const voucher = { channelId, cumulativeAmount: rlusd("1.272") };
    const sig = await signVoucher(Wallet.createRandom(), net.domain, voucher);
    const out = await merchant.handle({
      tabId: "t1",
      channelId,
      paymentSignature: encodePaymentSignature({ x402Version: 2, accepted: challenge.accepts[0], payload: { voucher: { channelId, cumulativeAmount: voucher.cumulativeAmount.toString() }, agentSignature: sig } }),
    });
    expect(out.status).toBe(401);
    expect(out.body).toMatchObject({ error: "BAD_SIGNATURE" });
  });

  it("returns 400 for a garbled PAYMENT-SIGNATURE and a voucher for another channel", async () => {
    expect((await merchant.handle({ tabId: "t1", channelId, paymentSignature: "@@@" })).status).toBe(400);
    const other = "0x" + "3".repeat(64);
    const out = await merchant.handle({ tabId: "t1", channelId, paymentSignature: encodePaymentSignature({ x402Version: 2, accepted: {} as never, payload: { voucher: { channelId: other, cumulativeAmount: "1" }, agentSignature: "0x" } }) });
    expect(out.body).toMatchObject({ error: "voucher_for_another_channel" });
  });

  it("refuses payment on a closed Channel", async () => {
    await net.closeChannel(channelId);
    expect((await merchant.handle({ tabId: "t1", channelId })).status).toBe(409);
  });
});

describe("Agent-side authority checks (before signing anything)", () => {
  const tamper = (mutate: (accepted: Record<string, unknown>, extra: Record<string, unknown>) => void) =>
    wire((_h, status, headers) => {
      if (status !== 402) return headers;
      const required = decodePaymentRequired(headers["PAYMENT-REQUIRED"]);
      mutate(required.accepts[0] as never, required.accepts[0].extra as never);
      return { "PAYMENT-REQUIRED": encodePaymentRequired(required) };
    });

  const refusal = async (fetcher: X402Fetch, max = rlusd("5")) => {
    try {
      await payOverX402({ network: net, fetch: fetcher, resourceUrl: URL_, channelId, maximumAmountWei: max });
      return "paid";
    } catch (err) {
      expect(err).toBeInstanceOf(Ap4mError);
      return (err as Error).message;
    }
  };

  it.each([
    ["payTo is not the Channel's bound payout", (a: Record<string, unknown>) => (a.payTo = Wallet.createRandom().address)],
    ["network", (a: Record<string, unknown>) => (a.network = "eip155:8453")],
    ["asset (RLUSD)", (a: Record<string, unknown>) => (a.asset = "0x0000000000000000000000000000000000000bad")],
    ["scheme", (a: Record<string, unknown>) => (a.scheme = "exact")],
    ["PaymentLedger", (_a: Record<string, unknown>, e: Record<string, unknown>) => (e.ledger = "0x0000000000000000000000000000000000000bad")],
    ["cumulative watermark", (_a: Record<string, unknown>, e: Record<string, unknown>) => (e.acceptedCumulativeAmount = "7")],
    ["price exceeds the Channel cap", (a: Record<string, unknown>) => (a.amount = rlusd("7").toString())],
  ])("refuses a challenge with a bad %s", async (reason, mutate) => {
    const { fetcher, calls } = tamper(mutate);
    expect(await refusal(fetcher, rlusd("100"))).toContain(reason);
    expect(calls).toHaveLength(1); // never sent a signature
  });

  it("refuses a price above the caller's maximum", async () => {
    const { fetcher, calls } = wire();
    expect(await refusal(fetcher, rlusd("1"))).toContain("price above the authorized maximum");
    expect(calls).toHaveLength(1);
  });

  it("refuses when the Merchant does not answer 402", async () => {
    const fetcher: X402Fetch = async () => ({ status: 200, header: () => undefined, body: {} });
    expect(await refusal(fetcher)).toContain("must answer 402");
  });

  it("surfaces the Merchant's refusal of the Voucher", async () => {
    const { fetcher } = wire((h, status, headers) => headers);
    net.setStatus(net.agentAddress(), "suspended");
    try {
      await payOverX402({ network: net, fetch: fetcher, resourceUrl: URL_, channelId, maximumAmountWei: rlusd("5") });
      expect.unreachable();
    } catch (err) {
      expect((err as Ap4mError).code).toBe("KYA_REJECTED");
    }
  });
});
