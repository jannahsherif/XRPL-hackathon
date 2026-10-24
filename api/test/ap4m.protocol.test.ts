import { Wallet, hexlify, randomBytes, parseUnits } from "ethers";
import { describe, expect, it } from "vitest";

import { AP4M_CONTRACTS, AP4M_NETWORK, AP4M_PSPS, addressUrl, txUrl } from "../src/ap4m/network.js";
import { centsToWei, formatRlusd, weiToCents } from "../src/ap4m/units.js";
import { VOUCHER_TYPES, recoverVoucherSigner, signVoucher, voucherDigest, voucherDomain } from "../src/ap4m/voucher.js";
import {
  X402_SCHEME,
  decodePaymentRequired,
  decodePaymentResponse,
  decodePaymentSignature,
  encodePaymentRequired,
  encodePaymentResponse,
  encodePaymentSignature,
} from "../src/ap4m/x402.js";
import { __test as live } from "../src/ap4m/liveNetwork.js";

const domain = voucherDomain(AP4M_NETWORK.chainId, AP4M_CONTRACTS.paymentLedger);
const channelId = hexlify(randomBytes(32));

describe("AP4M network config", () => {
  it("targets the XRPL EVM Testnet deployment from /public/config", () => {
    expect(AP4M_NETWORK.chainId).toBe(1449000);
    expect(AP4M_NETWORK.caip2).toBe("eip155:1449000");
    expect(AP4M_NETWORK.rpcUrl).toBe("https://rpc.testnet.xrplevm.org");
    for (const address of Object.values(AP4M_CONTRACTS)) expect(address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(AP4M_PSPS.map((p) => p.pspId)).toEqual(["mc-payer-psp", "mc-payee-psp"]);
  });

  it("builds explorer links", () => {
    expect(txUrl("0xabc")).toBe("https://explorer.testnet.xrplevm.org/tx/0xabc");
    expect(addressUrl("0xdef")).toBe("https://explorer.testnet.xrplevm.org/address/0xdef");
  });
});

describe("RLUSD units", () => {
  it.each([
    [10600, 100, "1060000000000000000"],
    [100, 100, "10000000000000000"],
    [60000, 100, "6000000000000000000"],
    [100, 1, "1000000000000000000"],
    [1, 1, "10000000000000000"],
    [0, 100, "0"],
  ])("%i cents at $%i/RLUSD = %s wei", (cents, rate, wei) => {
    expect(centsToWei(cents, rate).toString()).toBe(wei);
  });

  it("round-trips cents through wei", () => {
    for (const cents of [0, 1, 99, 12720, 100000, 34218000]) {
      expect(weiToCents(centsToWei(cents, 100), 100)).toBe(cents);
      expect(weiToCents(centsToWei(cents, 1), 1)).toBe(cents);
    }
  });

  it.each([
    [-1, 100],
    [1.5, 100],
    [100, 0],
    [100, 2.5],
  ])("rejects cents=%s rate=%s", (cents, rate) => {
    expect(() => centsToWei(cents, rate)).toThrow();
  });

  it.each([
    [parseUnits("1.272", 18), "1.272"],
    [parseUnits("10", 18), "10"],
    [parseUnits("0.000001", 18), "0.000001"],
    [0n, "0"],
  ])("formats %s as %s RLUSD", (wei, text) => {
    expect(formatRlusd(wei)).toBe(text);
  });

  it("live helpers convert decimal RLUSD strings exactly", () => {
    expect(live.formatUnits18(parseUnits("5", 18))).toBe("5");
    expect(live.formatUnits18(parseUnits("1.06", 18))).toBe("1.06");
    expect(live.parseUnits18("1.272")).toBe(parseUnits("1.272", 18));
    expect(live.parseUnits18("10")).toBe(parseUnits("10", 18));
  });
});

describe("EIP-712 Voucher", () => {
  it("uses the kit's domain and types exactly", () => {
    expect(domain).toEqual({ name: "AP4M Payment Ledger", version: "1", chainId: 1449000, verifyingContract: AP4M_CONTRACTS.paymentLedger });
    expect(VOUCHER_TYPES).toEqual({ Voucher: [{ name: "channelId", type: "bytes32" }, { name: "cumulativeAmount", type: "uint256" }] });
  });

  it("recovers the Agent that signed it", async () => {
    const agent = Wallet.createRandom();
    const voucher = { channelId, cumulativeAmount: parseUnits("1.06", 18) };
    const sig = await signVoucher(agent, domain, voucher);
    expect(recoverVoucherSigner(domain, voucher, sig)).toBe(agent.address);
  });

  it("binds the amount: a different cumulative amount recovers a different signer", async () => {
    const agent = Wallet.createRandom();
    const sig = await signVoucher(agent, domain, { channelId, cumulativeAmount: 100n });
    expect(recoverVoucherSigner(domain, { channelId, cumulativeAmount: 101n }, sig)).not.toBe(agent.address);
  });

  it("binds the chain and ledger (no cross-chain replay)", async () => {
    const agent = Wallet.createRandom();
    const voucher = { channelId, cumulativeAmount: 100n };
    const sig = await signVoucher(agent, domain, voucher);
    expect(recoverVoucherSigner(voucherDomain(1, AP4M_CONTRACTS.paymentLedger), voucher, sig)).not.toBe(agent.address);
    expect(recoverVoucherSigner(voucherDomain(1449000, AP4M_CONTRACTS.rlusdToken), voucher, sig)).not.toBe(agent.address);
  });

  it("has a stable domain-separated digest", () => {
    const voucher = { channelId, cumulativeAmount: 5n };
    expect(voucherDigest(domain, voucher)).toBe(voucherDigest(domain, { ...voucher }));
    expect(voucherDigest(domain, voucher)).not.toBe(voucherDigest(domain, { channelId, cumulativeAmount: 6n }));
    expect(voucherDigest(domain, voucher)).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("throws on a malformed signature", () => {
    expect(() => recoverVoucherSigner(domain, { channelId, cumulativeAmount: 1n }, "0x1234")).toThrow();
  });
});

describe("x402 headers", () => {
  const required = {
    x402Version: 2,
    error: "payment_required",
    resource: { url: "http://x/x402/tabs/t1/resource", description: "tab", mimeType: "application/json" },
    accepts: [
      {
        scheme: X402_SCHEME as typeof X402_SCHEME,
        network: "eip155:1449000",
        asset: AP4M_CONTRACTS.rlusdToken,
        amount: "1",
        payTo: "0x0000000000000000000000000000000000000001",
        maxTimeoutSeconds: 300,
        extra: { ledger: AP4M_CONTRACTS.paymentLedger, channelId, acceptedCumulativeAmount: "0", pricingMode: "fixed" as const, bindingVersion: "1" as const, merchantId: "0x1", invoiceId: "INV" },
      },
    ],
  };

  it("round-trips PAYMENT-REQUIRED, PAYMENT-SIGNATURE and PAYMENT-RESPONSE as base64 JSON", () => {
    const header = encodePaymentRequired(required);
    expect(header).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(decodePaymentRequired(header)).toEqual(required);
    const payment = { x402Version: 2, accepted: required.accepts[0], payload: { voucher: { channelId, cumulativeAmount: "1" }, agentSignature: "0xsig" } };
    expect(decodePaymentSignature(encodePaymentSignature(payment))).toEqual(payment);
    const response = { success: true, network: "eip155:1449000", transaction: "0xtx", payer: "0xp", claimId: "0xc", voucherDigest: "0xd" };
    expect(decodePaymentResponse(encodePaymentResponse(response))).toEqual(response);
  });

  it.each([undefined, null, "", "%%%not-base64%%%", Buffer.from("not json").toString("base64")])("rejects header %j", (header) => {
    expect(() => decodePaymentRequired(header as string)).toThrow(/PAYMENT-REQUIRED/);
  });
});
