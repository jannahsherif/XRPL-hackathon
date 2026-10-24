import { Wallet } from "ethers";
import { describe, expect, it } from "vitest";

import { fundFromCard, MAX_TOP_UP_CENTS } from "../src/funding/cardFunding.js";
import {
  IntentService,
  MANDATE_VCT,
  canonical,
  cartHash,
  paymentRecordHash,
  sha256,
  signJws,
  verifyJws,
  verifyPaymentRecord,
  type MandatePayload,
} from "../src/intent/mandate.js";
import { SEED_MEMBERS } from "../src/seed.js";
import type { Tab } from "../src/types.js";

const PAYEE = "0xmerchant";
const tab = (overrides: Partial<Tab> = {}): Tab => ({
  id: "t101",
  memberId: "m2",
  memberName: "Marcus Hale",
  seat: "Bar",
  status: "reconciling",
  items: [{ name: "Steak", qty: 1, priceCents: 6800 }],
  totalCents: 6800,
  tipCents: 1360,
  allowance: "600.00",
  escrow: { seq: 1, txHash: "H", explorerUrl: null },
  settlement: null,
  hold: null,
  graceEndsAt: null,
  openedAt: "",
  mandate: null,
  ap4m: null,
  ...overrides,
});

function setup(now = { t: Date.UTC(2026, 9, 25, 1) }) {
  const agent = Wallet.createRandom() as unknown as Wallet;
  const intent = new IntentService(agent, PAYEE, () => now.t);
  const t = tab();
  t.mandate = intent.issue(t).mandate;
  return { agent, intent, t, now };
}

describe("canonical JSON and hashes", () => {
  it("sorts keys recursively so hashes ignore key order", () => {
    expect(canonical({ b: 1, a: { d: [2, { z: 1, y: 2 }], c: null } })).toBe('{"a":{"c":null,"d":[2,{"y":2,"z":1}]},"b":1}');
    expect(sha256(canonical({ a: 1, b: 2 }))).toBe(sha256(canonical({ b: 2, a: 1 })));
  });

  it("cart hash changes when the cart changes", () => {
    expect(cartHash(tab())).toBe(cartHash(tab()));
    expect(cartHash(tab())).not.toBe(cartHash(tab({ items: [{ name: "Steak", qty: 2, priceCents: 6800 }] })));
  });
});

describe("JWS (ES256)", () => {
  it("signs and verifies with the member's P-256 key", () => {
    const intent = new IntentService(Wallet.createRandom() as unknown as Wallet, PAYEE);
    const keys = intent.memberKey("m1");
    const jws = signJws({ hello: "world" }, keys.privateKey);
    expect(jws.split(".")).toHaveLength(3);
    expect(JSON.parse(Buffer.from(jws.split(".")[0], "base64url").toString())).toEqual({ alg: "ES256", typ: "vi+jwt" });
    expect(verifyJws(jws, keys.publicKey)).toEqual({ hello: "world" });
  });

  it("rejects a tampered payload or another member's key", () => {
    const intent = new IntentService(Wallet.createRandom() as unknown as Wallet, PAYEE);
    const jws = signJws({ max: "600.00" }, intent.memberKey("m1").privateKey);
    const [h, , s] = jws.split(".");
    const tampered = `${h}.${Buffer.from(JSON.stringify({ max: "6000.00" })).toString("base64url")}.${s}`;
    expect(() => verifyJws(tampered, intent.memberKey("m1").publicKey)).toThrow(/does not verify/);
    expect(() => verifyJws(jws, intent.memberKey("m2").publicKey)).toThrow(/does not verify/);
    expect(() => verifyJws("not-a-jws", intent.memberKey("m1").publicKey)).toThrow(/malformed/);
  });

  it("keeps one stable key per member and exports a public JWK", () => {
    const intent = new IntentService(Wallet.createRandom() as unknown as Wallet, PAYEE);
    expect(intent.memberKey("m1")).toBe(intent.memberKey("m1"));
    expect(intent.publicJwk("m1")).toMatchObject({ kty: "EC", crv: "P-256" });
    expect(intent.publicJwk("m1")).not.toHaveProperty("d");
  });
});

describe("mandate issue (member -> agent, autonomous mode)", () => {
  it("binds max amount, payee, tab, agent key and expiry", () => {
    const { agent, intent, t } = setup();
    const jws = intent.getJws(t.mandate!.hash)!;
    const payload = verifyJws<MandatePayload>(jws, intent.memberKey("m2").publicKey);
    expect(payload).toMatchObject({
      vct: MANDATE_VCT,
      mode: "autonomous",
      iss: "member:m2",
      sub: `agent:${agent.address}`,
      aud: PAYEE,
      cnf: { agent: agent.address },
      constraints: { max_amount: { value: "600.00", currency: "USD" }, payees: [PAYEE], purpose: "food-and-beverage-tab", tab_id: "t101" },
    });
    expect(payload.exp - payload.iat).toBe(12 * 3600);
    expect(t.mandate).toMatchObject({ maxAmount: "600.00", payee: PAYEE, agent: agent.address, status: "active", paymentRecordHash: null });
    expect(t.mandate!.hash).toBe(sha256(jws));
  });

  it("issues unique mandates", () => {
    const { intent, t } = setup();
    const other = intent.issue(t).mandate;
    expect(other.id).not.toBe(t.mandate!.id);
    expect(other.hash).not.toBe(t.mandate!.hash);
  });
});

describe("verifyAndRecord (agent pays within the mandate)", () => {
  it("passes a settlement within the mandate and signs an L3 payment record", async () => {
    const { agent, intent, t } = setup();
    const result = await intent.verifyAndRecord(t, 8160);
    expect(result).toMatchObject({ ok: true, violations: [] });
    expect(result.record).toMatchObject({
      mandate_hash: t.mandate!.hash,
      tab_id: "t101",
      cart_hash: cartHash(t),
      amount: { value: "81.60", currency: "USD" },
      payee: PAYEE,
      agent: agent.address,
    });
    expect(verifyPaymentRecord(result.record!)).toBe(true);
    expect(paymentRecordHash(result.record!)).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("allows exactly the maximum", async () => {
    const { intent, t } = setup();
    expect((await intent.verifyAndRecord(t, 60000)).ok).toBe(true);
  });

  it("refuses an amount above the mandate", async () => {
    const { intent, t } = setup();
    const r = await intent.verifyAndRecord(t, 60001);
    expect(r.ok).toBe(false);
    expect(r.violations[0]).toMatch(/exceeds the mandate maximum \$600\.00/);
    expect(r.record).toBeNull();
  });

  it("refuses an unapproved payee", async () => {
    const { intent, t } = setup();
    expect((await intent.verifyAndRecord(t, 100, "0xsomeone-else")).violations).toContain("Payee is not on the member's approved list");
  });

  it("refuses after expiry", async () => {
    const { intent, t, now } = setup();
    now.t += 12 * 3600_000;
    expect((await intent.verifyAndRecord(t, 100)).violations).toContain("Mandate has expired");
  });

  it("refuses a mandate presented for another tab", async () => {
    const { intent, t } = setup();
    expect((await intent.verifyAndRecord({ ...t, id: "t999" }, 100)).violations).toContain("Mandate is for a different tab");
  });

  it("refuses a mandate claimed by another member", async () => {
    const { intent, t } = setup();
    const r = await intent.verifyAndRecord({ ...t, memberId: "m1" }, 100);
    expect(r.ok).toBe(false);
  });

  it("refuses payment by a different agent than the one delegated to", async () => {
    const { intent, t } = setup();
    const otherAgent = new IntentService(Wallet.createRandom() as unknown as Wallet, PAYEE);
    // Same mandate hash, presented to a service whose agent key differs.
    (otherAgent as unknown as { mandates: Map<string, unknown> }).mandates = (intent as unknown as { mandates: Map<string, unknown> }).mandates;
    (otherAgent as unknown as { memberKeys: Map<string, unknown> }).memberKeys = (intent as unknown as { memberKeys: Map<string, unknown> }).memberKeys;
    expect((await otherAgent.verifyAndRecord(t, 100)).violations).toContain("Paying agent is not the one the member delegated to");
  });

  it("refuses tabs with no mandate or an unknown mandate", async () => {
    const { intent, t } = setup();
    expect((await intent.verifyAndRecord({ ...t, mandate: null }, 100)).violations).toEqual(["No Verifiable Intent mandate for this tab"]);
    expect((await intent.verifyAndRecord({ ...t, mandate: { ...t.mandate!, hash: "sha256:nope" } }, 100)).violations).toEqual(["Mandate not found"]);
  });

  it("detects a forged or altered payment record", async () => {
    const { intent, t } = setup();
    const { record } = await intent.verifyAndRecord(t, 8160);
    expect(verifyPaymentRecord({ ...record!, amount: { value: "1.00", currency: "USD" } })).toBe(false);
    expect(verifyPaymentRecord({ ...record!, signature: "0x00" })).toBe(false);
  });
});

describe("card funding (SIMULATED Mastercard rail)", () => {
  const member = () => structuredClone(SEED_MEMBERS[1]);

  it("charges the virtual card token, never a PAN, and on-ramps to RLUSD", () => {
    const m = member();
    const r = fundFromCard(m, 25000);
    expect(r).toMatchObject({
      memberId: "m2",
      amountCents: 25000,
      rail: "mastercard-card",
      simulated: true,
      card: { brand: "Mastercard", last4: "5204", tokenType: "Mastercard Virtual Card Token" },
      request: { method: "POST", path: "/src/api/digital/payments/transaction/credentials" },
      response: { status: "APPROVED", dynamicDataType: "DYNAMIC_CARD_SECURITY_CODE" },
      onRamp: { to: "RLUSD", status: "SIMULATED" },
      fundedCents: 25000,
    });
    expect(r.request.body).toMatchObject({ srcDigitalCardId: m.card.srcDigitalCardId, dpaTransactionOptions: { transactionAmount: { transactionAmount: 250, transactionCurrencyCode: "USD" } } });
    expect(JSON.stringify(r)).not.toMatch(/\b5[1-5]\d{14}\b/); // no PAN-shaped numbers anywhere
    expect(r.response.dtvc).toMatch(/^\d{3}$/);
  });

  it("accumulates top-ups", () => {
    const m = member();
    fundFromCard(m, 10000);
    expect(fundFromCard(m, 5000).fundedCents).toBe(15000);
  });

  it.each([0, 99, -100, 12.5, MAX_TOP_UP_CENTS + 1, Number.NaN])("rejects %s cents", (amount) => {
    expect(() => fundFromCard(member(), amount)).toThrow(/amountCents/);
  });
});
