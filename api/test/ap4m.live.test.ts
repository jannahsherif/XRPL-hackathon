import { AbiCoder, getAddress, JsonRpcProvider, type JsonRpcPayload, type JsonRpcResult, Signature, Transaction, Wallet, id, keccak256, verifyMessage, verifyTypedData, zeroPadValue } from "ethers";
import { describe, expect, it } from "vitest";

import { LiveAp4mNetwork } from "../src/ap4m/liveNetwork.js";
import { AP4M_CONTRACTS } from "../src/ap4m/network.js";
import { Ap4mError } from "../src/ap4m/types.js";
import { VOUCHER_REDEEMED_SIGNATURE, recoverVoucherSigner } from "../src/ap4m/voucher.js";

const CHANNEL = "0x" + "ab".repeat(32);
const MERCHANT_ID = "0x" + "cd".repeat(32);
const PAYOUT = getAddress("0x00000000000000000000000000000000000000aa");
const API = "https://ap4m.test";

/** Minimal XRPL EVM node: answers the JSON-RPC calls ethers makes for reads, sends and receipts. */
class FakeNode extends JsonRpcProvider {
  sent: Transaction[] = [];
  channel = { cap: 6n * 10n ** 18n, redeemed: 0n, agent: "", status: 1 };
  revert = false;
  constructor() {
    super("http://fake", 1449000, { staticNetwork: true, batchMaxCount: 1 });
  }
  async _send(payload: JsonRpcPayload | JsonRpcPayload[]): Promise<JsonRpcResult[]> {
    const list = Array.isArray(payload) ? payload : [payload];
    return Promise.all(list.map(async (p) => ({ id: p.id, ...(await this.answer(p.method, p.params as unknown[])) }) as JsonRpcResult));
  }
  private async answer(method: string, params: unknown[]): Promise<{ result?: unknown; error?: unknown }> {
    switch (method) {
      case "eth_chainId":
        return { result: "0x161c28" };
      case "eth_blockNumber":
        return { result: "0x10" };
      case "eth_getTransactionCount":
        return { result: "0x0" };
      case "eth_estimateGas":
        if (this.revert) return { error: { code: 3, message: "execution reverted: over cap", data: "0x" } };
        return { result: "0x30000" };
      case "eth_gasPrice":
      case "eth_maxPriorityFeePerGas":
        return { result: "0x1" };
      case "eth_getBlockByNumber":
        return { result: { number: "0x10", hash: "0x" + "11".repeat(32), timestamp: "0x1", baseFeePerGas: "0x1", transactions: [], parentHash: "0x" + "00".repeat(32), gasLimit: "0x1c9c380", gasUsed: "0x0", miner: "0x" + "00".repeat(20), extraData: "0x", difficulty: "0x0", nonce: "0x0000000000000000" } };
      case "eth_sendRawTransaction": {
        const tx = Transaction.from(params[0] as string);
        this.sent.push(tx);
        return { result: tx.hash };
      }
      case "eth_getTransactionByHash":
        return { result: null };
      case "eth_getTransactionReceipt": {
        const hash = params[0] as string;
        const tx = this.sent.find((t) => t.hash === hash)!;
        const isRedeem = tx.to?.toLowerCase() === AP4M_CONTRACTS.paymentLedger.toLowerCase();
        return {
          result: {
            transactionHash: hash,
            transactionIndex: "0x0",
            blockHash: "0x" + "22".repeat(32),
            blockNumber: "0x10",
            from: tx.from,
            to: tx.to,
            cumulativeGasUsed: "0x1",
            gasUsed: "0x1",
            effectiveGasPrice: "0x1",
            contractAddress: null,
            logsBloom: "0x" + "00".repeat(256),
            status: "0x1",
            type: "0x2",
            logs: isRedeem
              ? [{ address: AP4M_CONTRACTS.paymentLedger, topics: [id(VOUCHER_REDEEMED_SIGNATURE), CHANNEL, "0x" + "c1".repeat(32)], data: "0x", blockNumber: "0x10", blockHash: "0x" + "22".repeat(32), transactionHash: hash, transactionIndex: "0x0", logIndex: "0x0", removed: false }]
              : [],
          },
        };
      }
      case "eth_call": {
        const c = this.channel;
        const b32 = (v: string) => zeroPadValue(v, 32);
        const result = AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes32", "bytes32", "bytes32", "bytes32", "bytes32", "bytes32", "uint256", "uint256", "address", "uint64", "uint8", "address", "uint64", "address", "uint64", "uint64", "uint64"],
          [b32("0x01"), b32("0x02"), b32("0x03"), b32("0x04"), b32("0x05"), MERCHANT_ID, b32("0x07"), c.cap, c.redeemed, c.agent, 1, c.status, PAYOUT, 1, PAYOUT, 1, 0, 2_000_000_000],
        );
        return { result };
      }
      default:
        return { error: { code: -32601, message: `fake node: ${method}` } };
    }
  }
}

/** Fake AP4M service implementing the participant endpoints from the kit. */
function fakeService(agent: Wallet) {
  const calls: { path: string; body: unknown; auth?: string }[] = [];
  let sessions = 0;
  let settleAttempts = 0;
  const challengeMessage = "Sign in to AP4M as Settle";
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    const path = url.pathname + url.search;
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const auth = (init?.headers as Record<string, string> | undefined)?.authorization;
    calls.push({ path, body, auth });
    if (path === "/public/participant/challenge") return reply(200, { challengeId: "ch-1", message: challengeMessage });
    if (path === "/public/participant/session") {
      if (verifyMessage(challengeMessage, body.signature) !== agent.address) return reply(401, { error: "bad signature" });
      sessions++;
      return reply(200, { token: `tok-${sessions}`, expiresInSeconds: 3600 });
    }
    if (auth !== `Bearer tok-${sessions}`) return reply(401, { error: "no session" });
    if (path === "/public/participant/channel-requests/prepare") return reply(200, { to: AP4M_CONTRACTS.pooledEscrowVault, data: "0x1234" });
    if (path === "/public/participant/channel-requests") return reply(200, { channel_id: CHANNEL, channel_status: "requested" });
    if (path === "/public/participant/channels") return reply(200, { channels: [{ channel_id: CHANNEL, channel_status: "open" }] });
    if (path === "/public/participant/record-redemption") return reply(200, { claim_id: "0xc1" });
    if (path === "/public/participant/settle") {
      settleAttempts++;
      if (settleAttempts === 1) return reply(202, { payout_tx: "0xpending" });
      return reply(200, { settlement_tx: "0xsettle", payout_tx: "0xpayout", amount_rlusd: "1.272", receipt_url: "/public/receipts/abc", claims_settled: 1 });
    }
    if (path.startsWith("/public/participant/close-channel-challenge")) {
      return reply(200, {
        checkpoint: { channelId: CHANNEL },
        typedData: {
          domain: { name: "AP4M Payment Ledger", version: "1", chainId: 1449000, verifyingContract: AP4M_CONTRACTS.paymentLedger },
          types: { CloseChannel: [{ name: "channelId", type: "bytes32" }, { name: "finalCumulativeAmount", type: "uint256" }, { name: "merchantPspSignerGeneration", type: "uint64" }, { name: "signedAt", type: "uint64" }] },
          value: { channelId: CHANNEL, finalCumulativeAmount: "1272000000000000000", merchantPspSignerGeneration: "1", signedAt: "1792900000" },
        },
      });
    }
    if (path === "/public/participant/close-channel") return reply(200, { tx_hash: "0xclose", channel_id: CHANNEL, final_cumulative_amount: "1.272" });
    return reply(404, { error: `unknown ${path}` });
  };
  return { fetchImpl, calls, sessions: () => sessions };
}

function make() {
  const agent = Wallet.createRandom() as unknown as Wallet;
  const node = new FakeNode();
  node.channel.agent = agent.address;
  const service = fakeService(agent);
  const net = new LiveAp4mNetwork({
    apiUrl: API,
    teamName: "Settle",
    agentKey: agent.privateKey,
    merchantId: MERCHANT_ID,
    payout: PAYOUT,
    provider: node,
    fetch: service.fetchImpl,
    pollMs: 1,
  });
  return { agent, node, service, net };
}

describe("LiveAp4mNetwork (XRPL EVM Testnet client, faked node + service)", () => {
  it("binds the voucher domain to the deployed PaymentLedger on chain 1449000", () => {
    const { net } = make();
    expect(net.mode).toBe("live");
    expect(net.domain).toEqual({ name: "AP4M Payment Ledger", version: "1", chainId: 1449000, verifyingContract: AP4M_CONTRACTS.paymentLedger });
    expect(net.network).toBe("eip155:1449000");
  });

  it("signs in with a one-time challenge and reuses the session token", async () => {
    const { net, service } = make();
    await net.openChannel(6n * 10n ** 18n);
    await net.settle(CHANNEL);
    expect(service.sessions()).toBe(1);
    expect(service.calls[0]).toMatchObject({ path: "/public/participant/challenge", body: { teamName: "Settle" } });
  });

  it("opens a Channel: prepare -> vault tx from the Agent -> record -> poll until open", async () => {
    const { net, node, service, agent } = make();
    const { channel, txHash } = await net.openChannel(6n * 10n ** 18n);
    const prepare = service.calls.find((c) => c.path.endsWith("/prepare"))!;
    expect(prepare.body).toEqual({ cap_rlusd: "6", merchant_id: MERCHANT_ID });
    expect(node.sent[0].to).toBe(AP4M_CONTRACTS.pooledEscrowVault);
    expect(node.sent[0].data).toBe("0x1234");
    expect(node.sent[0].from).toBe(agent.address);
    expect(service.calls.find((c) => c.path === "/public/participant/channel-requests")!.body).toEqual({ tx_hash: txHash });
    expect(service.calls.some((c) => c.path === "/public/participant/channels")).toBe(true);
    expect(channel).toMatchObject({ channelId: CHANNEL, agent: agent.address, merchantId: MERCHANT_ID, payout: PAYOUT, capWei: 6n * 10n ** 18n, status: "open" });
  });

  it("reads Channel state from PaymentLedger.channels()", async () => {
    const { net, node, agent } = make();
    node.channel.redeemed = 10n ** 18n;
    const c = await net.getChannel(CHANNEL);
    expect(c).toMatchObject({ capWei: 6n * 10n ** 18n, redeemedWei: 10n ** 18n, agent: agent.address, status: "open", validBefore: 2_000_000_000 });
    node.channel.status = 2;
    expect((await net.getChannel(CHANNEL)).status).toBe("closed");
    node.channel.cap = 0n;
    await expect(net.getChannel(CHANNEL)).rejects.toMatchObject({ code: "CHANNEL_NOT_FOUND" });
  });

  it("redeems a Voucher on PaymentLedger, extracts the claimId and reports it", async () => {
    const { net, node, service, agent } = make();
    const voucher = { channelId: CHANNEL, cumulativeAmount: 1272n * 10n ** 15n };
    const sig = await net.signVoucher(voucher);
    expect(recoverVoucherSigner(net.domain, voucher, sig)).toBe(agent.address);
    const r = await net.redeemVoucher(voucher, sig);
    expect(node.sent.at(-1)!.to).toBe(AP4M_CONTRACTS.paymentLedger);
    expect(node.sent.at(-1)!.data.slice(0, 10)).toBe(id("redeemVoucher((bytes32,uint256),bytes)").slice(0, 10));
    expect(r).toMatchObject({ claimId: "0x" + "c1".repeat(32), amountWei: voucher.cumulativeAmount, cumulativeWei: voucher.cumulativeAmount });
    expect(r.txHash).toBe(node.sent.at(-1)!.hash);
    expect(service.calls.find((c) => c.path === "/public/participant/record-redemption")!.body).toEqual({ tx_hash: r.txHash });
  });

  it("refuses an over-cap Voucher before spending gas", async () => {
    const { net, node } = make();
    const voucher = { channelId: CHANNEL, cumulativeAmount: 7n * 10n ** 18n };
    await expect(net.redeemVoucher(voucher, await net.signVoucher(voucher))).rejects.toMatchObject({ code: "OVER_CAP" });
    expect(node.sent).toHaveLength(0);
  });

  it("maps a contract revert to SERVICE_ERROR", async () => {
    const { net, node } = make();
    node.revert = true;
    const voucher = { channelId: CHANNEL, cumulativeAmount: 10n ** 18n };
    const err = await net.redeemVoucher(voucher, await net.signVoucher(voucher)).catch((e) => e);
    expect(err).toBeInstanceOf(Ap4mError);
    expect(err.code).toBe("SERVICE_ERROR");
    expect(err.message).toMatch(/redeemVoucher reverted/);
  });

  it("settles, polling while the payout waits for confirmations, with an absolute receipt URL", async () => {
    const { net, service } = make();
    const s = await net.settle(CHANNEL);
    expect(service.calls.filter((c) => c.path === "/public/participant/settle")).toHaveLength(2);
    expect(s).toEqual({ settlementTxHash: "0xsettle", payoutTxHash: "0xpayout", amountWei: 1272n * 10n ** 15n, receiptUrl: "https://ap4m.test/public/receipts/abc", claimsSettled: 1 });
  });

  it("closes the Channel by signing the service's close checkpoint (r + yParityAndS)", async () => {
    const { net, service, agent } = make();
    const { txHash } = await net.closeChannel(CHANNEL);
    expect(txHash).toBe("0xclose");
    const body = service.calls.find((c) => c.path === "/public/participant/close-channel")!.body as Record<string, string>;
    const challenge = (await (await service.fetchImpl(`${API}/public/participant/close-channel-challenge?channel_id=${CHANNEL}`, { headers: { authorization: "Bearer tok-1" } })).json()) as {
      typedData: { domain: Record<string, unknown>; types: Record<string, { name: string; type: string }[]>; value: Record<string, string> };
    };
    const { domain, types, value } = challenge.typedData;
    const sig = Signature.from({ r: body.agent_signature_r, yParityAndS: body.agent_signature_vs });
    const recovered = verifyTypedData(domain, types, { ...value, finalCumulativeAmount: BigInt(value.finalCumulativeAmount), merchantPspSignerGeneration: 1n, signedAt: BigInt(value.signedAt) }, sig);
    expect(recovered).toBe(agent.address);
    expect(body.channel_id).toBe(CHANNEL);
  });

  it("surfaces service errors with the HTTP status", async () => {
    const agent = Wallet.createRandom() as unknown as Wallet;
    const net = new LiveAp4mNetwork({
      apiUrl: API,
      teamName: "Settle",
      agentKey: agent.privateKey,
      merchantId: MERCHANT_ID,
      payout: PAYOUT,
      provider: new FakeNode(),
      fetch: async () => new Response(JSON.stringify({ error: "team not approved" }), { status: 403 }),
    });
    await expect(net.settle(CHANNEL)).rejects.toThrow(/challenge failed \(403\): team not approved/);
  });

  it("never sends a private key to the service", async () => {
    const { net, service, agent } = make();
    await net.openChannel(6n * 10n ** 18n);
    await net.settle(CHANNEL);
    await net.closeChannel(CHANNEL);
    const everything = JSON.stringify(service.calls);
    expect(everything).not.toContain(agent.privateKey.slice(2));
    expect(keccak256("0x00")).toBeTruthy();
  });

  it("lists PSP-attested identities and leaves the budget to the portal", async () => {
    const { net } = make();
    expect((await net.participants()).map((p) => `${p.role}:${p.attestedBy}`)).toEqual(["agent:mc-payer-psp", "merchant:mc-payee-psp"]);
    expect(await net.budget()).toBeNull();
    expect(net.merchant()).toEqual({ merchantId: MERCHANT_ID, payout: PAYOUT });
  });
});
