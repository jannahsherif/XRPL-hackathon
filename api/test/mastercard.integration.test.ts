import { afterEach, describe, expect, it, vi } from "vitest";

import { buildApp } from "../src/app.js";
import { decodePaymentRequired } from "../src/ap4m/x402.js";
import { verifyPaymentRecord } from "../src/intent/mandate.js";
import type { SettlementAgent } from "../src/agent/settlementAgent.js";
import type { SettleEvent } from "../src/types.js";
import { fixedAgent, testConfig } from "./helpers.js";

type Built = Awaited<ReturnType<typeof buildApp>>;
let built: Built;
let events: SettleEvent[];

async function start(overrides = {}, agent: SettlementAgent = fixedAgent()) {
  built = await buildApp(
    testConfig({ ledgerMode: "ap4m", ap4mNetwork: "simulated", intentMode: "on", graceSeconds: 1, ap4mSimBudgetRlusd: 20, usdPerRlusd: 100, ...overrides }),
    { agent },
  );
  built.app.log.level = "silent";
  events = [];
  built.bus.subscribe((e) => events.push(e));
  return built;
}

const inject = (method: "GET" | "POST", url: string, payload?: object) => built.app.inject({ method, url, payload });
const types = () => events.map((e) => e.type);
const waitFor = async (type: string) => {
  for (let i = 0; i < 200; i++) {
    const e = events.find((x) => x.type === type);
    if (e) return e;
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error(`no ${type}; saw ${types().join(",")}`);
};

afterEach(async () => {
  await built?.app.close();
});

async function openWithItems(memberId: string, items: string[]) {
  const tab = (await inject("POST", "/tabs", { memberId, seat: "Table 9" })).json();
  for (const menuItemId of items) await inject("POST", `/tabs/${tab.id}/items`, { menuItemId });
  return tab as { id: string; ap4m: { channelId: string; capRlusd: string }; mandate: { hash: string; maxAmount: string } };
}

describe("Mastercard trusted payment loop (LEDGER_MODE=ap4m, simulated network)", () => {
  it("REGISTER: exposes PSP-attested identities, contracts and the EIP-712 domain", async () => {
    await start();
    const body = (await inject("GET", "/ap4m")).json();
    expect(body.mode).toBe("simulated");
    expect(body.network.chainId).toBe(1449000);
    expect(body.eip712Domain).toMatchObject({ name: "AP4M Payment Ledger", version: "1" });
    expect(body.participants.map((p: { role: string; attestedBy: string }) => `${p.role}:${p.attestedBy}`)).toEqual([
      "agent_principal:mc-payer-psp",
      "agent:mc-payer-psp",
      "merchant:mc-payee-psp",
    ]);
    expect(body.budget.availableWei).toBe((20n * 10n ** 18n).toString());
    expect(body.usdPerRlusd).toBe(100);
  });

  it("FUND: opening a tab opens a Channel capped at the allowance and a Verifiable Intent mandate", async () => {
    await start();
    const tab = await openWithItems("m2", []);
    expect(tab.ap4m).toMatchObject({ mode: "simulated", network: "eip155:1449000", capRlusd: "6", capWei: (6n * 10n ** 18n).toString(), payment: null });
    expect(tab.ap4m.channelId).toMatch(/^0x[0-9a-f]{64}$/);
    expect(tab.mandate).toMatchObject({ maxAmount: "600.00", status: "active" });
    expect(types()).toEqual(expect.arrayContaining(["ap4m.channel_opened", "intent.mandate_signed", "tab.opened"]));
    const budget = (await inject("GET", "/ap4m")).json().budget;
    expect(budget.allocatedWei).toBe((6n * 10n ** 18n).toString());
  });

  it("PAY + SETTLE: x402 Voucher payment settles in RLUSD with a receipt and returns the remainder", async () => {
    await start();
    const tab = await openWithItems("m2", ["steak", "martini", "martini"]); // $106.00
    await inject("POST", `/tabs/${tab.id}/exit`);
    await waitFor("tab.settled");
    const settled = (await inject("GET", `/tabs/${tab.id}`)).json();

    expect(settled.status).toBe("settled");
    expect(settled.settlement).toMatchObject({ toVenue: "127.20", toMember: "472.80" });
    expect(settled.ap4m.payment).toMatchObject({ amountRlusd: "1.272", amountWei: "1272000000000000000", closeTxHash: expect.any(String) });
    expect(settled.ap4m.payment.claimId).toMatch(/^0x[0-9a-f]{64}$/);
    expect(settled.ap4m.payment.voucherDigest).toMatch(/^0x[0-9a-f]{64}$/);
    expect(settled.settlement.finishTxHash).toBe(settled.ap4m.payment.redemptionTxHash);
    expect(settled.mandate.status).toBe("used");
    expect(settled.mandate.paymentRecordHash).toMatch(/^sha256:/);

    const order = types().filter((t) => ["intent.verified", "x402.payment_required", "x402.paid", "ap4m.settled", "tab.settled"].includes(t));
    expect(order).toEqual(["intent.verified", "x402.payment_required", "x402.paid", "ap4m.settled", "tab.settled"]);
    const challenge = events.find((e) => e.type === "x402.payment_required")!.data as { challenge: { accepts: { amount: string; scheme: string }[] } };
    expect(challenge.challenge.accepts[0]).toMatchObject({ scheme: "batch-settlement", amount: "1272000000000000000" });
    const verified = events.find((e) => e.type === "intent.verified")!.data as { record: Parameters<typeof verifyPaymentRecord>[0] };
    expect(verifyPaymentRecord(verified.record)).toBe(true);
    expect(verified.record.amount.value).toBe("127.20");

    // Unused allowance (6 - 1.272 RLUSD) went back to the budget.
    expect((await inject("GET", "/ap4m")).json().budget.allocatedWei).toBe("1272000000000000000");
    expect((await inject("GET", "/metrics")).json().outstandingCents).toBe(34218000 - 12720);
  });

  it("CONTROL: the $900 bottle is held, then the manager approval settles exactly at the cap", async () => {
    const { createSettlementAgent } = await import("../src/agent/settlementAgent.js");
    await start({}, createSettlementAgent(testConfig()));
    const tab = await openWithItems("m5", ["bottle-900"]);
    await inject("POST", `/tabs/${tab.id}/exit`);
    await waitFor("tab.held");
    expect(events.some((e) => e.type === "x402.payment_required")).toBe(false); // nothing paid while held
    const approved = (await inject("POST", `/tabs/${tab.id}/approve`)).json();
    expect(approved.status).toBe("settled");
    expect(approved.ap4m.payment.amountRlusd).toBe("10");
    expect(approved.settlement.toVenue).toBe("1000.00");
  });

  it("CONTROL: an over-cap attempt is rejected by the Agent and by the PaymentLedger", async () => {
    await start();
    const tab = await openWithItems("m3", ["salmon"]);
    const res = (await inject("POST", `/demo/ap4m/over-cap/${tab.id}`)).json();
    expect(res.agentRefused).toMatch(/exceeds the Channel cap/);
    expect(res.ledgerRefused).toMatch(/exceeds the Channel cap/);
    expect(types()).toContain("ap4m.rejected");
    // The tab still settles normally afterwards.
    await inject("POST", `/tabs/${tab.id}/exit`);
    await waitFor("tab.settled");
  });

  it("CONTROL: a Voucher from an unverified agent is refused (KYA)", async () => {
    await start();
    const tab = await openWithItems("m3", ["salmon"]);
    const res = (await inject("POST", `/demo/ap4m/unverified-agent/${tab.id}`)).json();
    expect(res.merchantStatus).toBe(401);
    expect(res.merchantResponse).toMatchObject({ error: "BAD_SIGNATURE" });
    expect(res.impostor).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it("CONTROL: a Verifiable Intent violation holds the tab before any money moves", async () => {
    await start();
    const tab = await openWithItems("m2", ["steak"]);
    // Expire every mandate: jump the intent clock past the 12 h validity.
    const realNow = Date.now;
    vi.spyOn(Date, "now").mockImplementation(() => realNow() + 13 * 3600_000);
    await inject("POST", `/tabs/${tab.id}/exit`);
    await waitFor("tab.held");
    vi.restoreAllMocks();
    const held = (await inject("GET", `/tabs/${tab.id}`)).json();
    expect(held.hold.reason).toMatch(/Verifiable Intent check failed: Mandate has expired/);
    expect(held.mandate.status).toBe("violated");
    expect(types()).toContain("intent.violation");
    expect(types()).not.toContain("x402.paid");
  });

  it("closing a tab closes its Channel and frees the budget", async () => {
    await start();
    const tab = await openWithItems("m2", ["steak"]);
    await inject("POST", `/tabs/${tab.id}/close`);
    expect((await inject("GET", "/ap4m")).json().budget.allocatedWei).toBe("0");
  });

  it("refuses to open tabs beyond the funded budget (20 RLUSD)", async () => {
    await start();
    await openWithItems("m1", []); // 10 RLUSD
    await openWithItems("m5", []); // 10 RLUSD
    const res = await inject("POST", "/tabs", { memberId: "m3" });
    expect(res.statusCode).toBe(500);
    expect(res.json().error).toMatch(/exceeds the funded budget/);
  });
});

describe("x402 endpoint over HTTP", () => {
  it("answers 402 with PAYMENT-REQUIRED once an invoice exists, and validates the channel header", async () => {
    await start();
    const tab = await openWithItems("m2", ["steak"]);
    built.mastercard.ap4m!.merchant.createInvoice({ tabId: tab.id, invoiceId: "INV", channelId: tab.ap4m.channelId, amountWei: 5n, resourceUrl: "http://x/r", content: {} });
    const res = await built.app.inject({ method: "GET", url: `/x402/tabs/${tab.id}/resource`, headers: { "x-ap4m-channel-id": tab.ap4m.channelId } });
    expect(res.statusCode).toBe(402);
    expect(res.headers["cache-control"]).toBe("no-store, private");
    expect(decodePaymentRequired(res.headers["payment-required"] as string).accepts[0].amount).toBe("5");
    expect((await built.app.inject({ method: "GET", url: `/x402/tabs/${tab.id}/resource` })).statusCode).toBe(400);
    expect((await built.app.inject({ method: "GET", url: `/x402/tabs/nope/resource`, headers: { "x-ap4m-channel-id": tab.ap4m.channelId } })).statusCode).toBe(404);
  });

  it("is 404 when AP4M is off", async () => {
    await start({ ledgerMode: "stub" });
    expect((await inject("GET", "/ap4m")).statusCode).toBe(404);
    expect((await inject("GET", "/x402/tabs/t1/resource")).statusCode).toBe(404);
    expect((await inject("POST", "/demo/ap4m/over-cap/t1")).statusCode).toBe(404);
    expect((await inject("POST", "/demo/ap4m/unverified-agent/t1")).statusCode).toBe(404);
  });
});

describe("Verifiable Intent and funding routes", () => {
  it("publishes the mandate JWS and member public key so anyone can verify it", async () => {
    await start();
    const tab = await openWithItems("m2", []);
    const body = (await inject("GET", `/intent/tabs/${tab.id}`)).json();
    expect(body.jws.split(".")).toHaveLength(3);
    expect(body.memberKey).toMatchObject({ kty: "EC", crv: "P-256" });
    expect(body.mandate.hash).toBe(tab.mandate.hash);
  });

  it("issues mandates for seeded tabs too", async () => {
    await start();
    expect((await inject("GET", "/state")).json().tabs.every((t: { mandate: unknown }) => t.mandate)).toBe(true);
  });

  it("verifies L3 payment records", async () => {
    await start();
    const tab = await openWithItems("m2", ["steak"]);
    await inject("POST", `/tabs/${tab.id}/exit`);
    const verified = (await waitFor("intent.verified")).data as { record: object };
    expect((await inject("POST", "/intent/verify-payment-record", { record: verified.record })).json()).toEqual({ valid: true });
    expect((await inject("POST", "/intent/verify-payment-record", { record: { ...verified.record, payee: "x" } })).json()).toEqual({ valid: false });
    expect((await inject("POST", "/intent/verify-payment-record", {})).statusCode).toBe(400);
  });

  it("404s intent lookups when INTENT_MODE=off", async () => {
    await start({ intentMode: "off" });
    expect((await inject("GET", "/intent/tabs/t1")).statusCode).toBe(404);
    expect((await inject("GET", "/state")).json().tabs[0].mandate).toBeNull();
  });

  it("funds a member from their card on file", async () => {
    await start();
    const res = await inject("POST", "/members/m2/fund", { amountCents: 60000 });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ rail: "mastercard-card", simulated: true, fundedCents: 60000 });
    expect((await inject("GET", "/state")).json().members.find((m: { id: string }) => m.id === "m2").fundedCents).toBe(60000);
    expect(types()).toContain("funding.completed");
  });

  it("validates funding requests", async () => {
    await start();
    expect((await inject("POST", "/members/m2/fund", {})).statusCode).toBe(400);
    expect((await inject("POST", "/members/m2/fund", { amountCents: 5 })).statusCode).toBe(400);
    expect((await inject("POST", "/members/ghost/fund", { amountCents: 1000 })).statusCode).toBe(404);
  });
});
