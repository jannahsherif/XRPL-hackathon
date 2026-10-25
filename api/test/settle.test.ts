import { afterEach, describe, expect, it } from "vitest";

import { parseDecision } from "../src/agent/settlementAgent.js";
import { buildApp } from "../src/app.js";
import { config } from "../src/config.js";
import { createStubLedger } from "../src/ledger/stub.js";
import { centsToDecimal, decimalToCents } from "../src/money.js";
import { SEED_POLICY } from "../src/seed.js";
import type { SettleEvent } from "../src/types.js";

const testConfig = { ...config, demo: true, graceSeconds: 1, ledgerMode: "stub" as const, agentMode: "local" as const };
const funds = { m1: "3000.00", m2: "1000.00", m3: "1000.00", m4: "500.00", m5: "1500.00" };

let close: (() => Promise<void>) | undefined;
afterEach(async () => close?.());

async function setup() {
  const built = await buildApp(testConfig, { ledger: createStubLedger(5, funds) });
  close = () => built.app.close();
  const events: SettleEvent[] = [];
  built.bus.subscribe((e) => events.push(e));
  const waitFor = (type: string, timeoutMs = 4000) =>
    new Promise<SettleEvent>((resolve, reject) => {
      const found = events.find((e) => e.type === type);
      if (found) return resolve(found);
      const timer = setTimeout(() => reject(new Error(`no ${type} event`)), timeoutMs);
      const off = built.bus.subscribe((e) => {
        if (e.type === type) {
          clearTimeout(timer);
          off();
          resolve(e);
        }
      });
    });
  return { ...built, events, waitFor };
}

describe("money", () => {
  it("round-trips cents and decimal strings", () => {
    expect(centsToDecimal(34218000)).toBe("342180.00");
    expect(centsToDecimal(5)).toBe("0.05");
    expect(decimalToCents("600.00")).toBe(60000);
    expect(decimalToCents("12.3")).toBe(1230);
    expect(() => decimalToCents("abc")).toThrow();
  });
});

describe("happy path", () => {
  it("opens, orders, exits, settles within the escrow and drops outstanding", async () => {
    const { service, events, waitFor } = await setup();
    const before = service.metrics().outstandingCents;

    const tab = await service.openTab("m2", "Table 9");
    expect(tab.escrow.txHash).toMatch(/^[0-9A-F]{64}$/);
    service.addItem(tab.id, "steak");
    service.addItem(tab.id, "martini", 2);
    expect(tab.status).toBe("ordering");
    expect(tab.totalCents).toBe(6800 + 3800);

    service.exit(tab.id);
    expect(tab.status).toBe("grace");
    expect(events.find((e) => e.type === "member.push")).toBeDefined();

    const settled = await waitFor("tab.settled");
    expect((settled.data as { tab: { status: string } }).tab.status).toBe("settled");
    expect(tab.tipCents).toBe(Math.round(10600 * 0.2));
    expect(tab.settlement?.toVenue).toBe(centsToDecimal(10600 + 2120));
    expect(tab.settlement?.toMember).toBe(centsToDecimal(60000 - 12720));

    const decision = events.find((e) => e.type === "agent.decision")!.data as { action: string };
    expect(decision.action).toBe("settle");
    const metrics = service.metrics();
    expect(metrics.outstandingCents).toBe(before - 12720);
    expect(metrics.settledCount).toBe(1);
    expect(events.some((e) => e.type === "tab.grace_tick")).toBe(true);
  });

  it("uses the member's tip choice", async () => {
    const { service, waitFor } = await setup();
    const tab = await service.openTab("m3");
    service.addItem(tab.id, "salmon");
    service.exit(tab.id);
    service.setTip(tab.id, 15);
    await waitFor("tab.settled");
    expect(tab.tipCents).toBe(Math.round(3800 * 0.15));
  });
});

describe("anomaly path", () => {
  it("holds a $900 bottle on a low-spend member, then settles on manager approval", async () => {
    const { service, waitFor } = await setup();
    const tab = await service.openTab("m5");
    service.addItem(tab.id, "bottle-900");
    service.exit(tab.id);

    const held = await waitFor("tab.held");
    expect(tab.status).toBe("held");
    expect(tab.hold?.reason).toMatch(/typical/);
    expect((await waitFor("agent.decision")).data).toMatchObject({ action: "hold", source: "rules" });

    await service.approve(tab.id);
    expect(held).toBeDefined();
    expect(tab.status).toBe("settled");
    // Tip is trimmed so the charge never exceeds the $1,000 escrow.
    expect(decimalToCents(tab.settlement!.toVenue)).toBeLessThanOrEqual(100000);
  });

  it("holds an item above the allowance", async () => {
    const { service, waitFor } = await setup();
    const tab = await service.openTab("m4");
    service.addItem(tab.id, "bottle-900");
    service.exit(tab.id);
    await waitFor("tab.held");
    expect(tab.hold?.reason).toMatch(/above the escrowed allowance/);
  });

  it("dispute during grace holds the tab and stops the timer", async () => {
    const { service, events } = await setup();
    const tab = await service.openTab("m2");
    service.addItem(tab.id, "burger");
    service.exit(tab.id);
    service.dispute(tab.id, "Not my burger");
    await new Promise((r) => setTimeout(r, 1300));
    expect(tab.status).toBe("held");
    expect(events.some((e) => e.type === "tab.settled")).toBe(false);
  });

  it("reject returns the escrow and closes the tab", async () => {
    const { service, waitFor } = await setup();
    const tab = await service.openTab("m5");
    service.addItem(tab.id, "bottle-900");
    service.exit(tab.id);
    await waitFor("tab.held");
    await service.reject(tab.id);
    expect(tab.status).toBe("closed_manually");
  });
});

describe("state machine guards", () => {
  it("rejects items after exit and approval of a non-held tab", async () => {
    const { service } = await setup();
    const tab = await service.openTab("m1");
    service.exit(tab.id);
    expect(() => service.addItem(tab.id, "fries")).toThrow(/Cannot add items/);
    await expect(service.approve(tab.id)).rejects.toThrow(/Only held tabs/);
  });
});

describe("agent output parsing", () => {
  it("accepts valid decisions and clamps the tip", () => {
    expect(parseDecision('{"action":"settle","tipPct":50,"reason":"ok"}', SEED_POLICY)).toMatchObject({ action: "settle", tipPct: 30 });
    expect(() => parseDecision('{"action":"refund"}', SEED_POLICY)).toThrow();
  });
});

describe("HTTP contract", () => {
  it("serves the state snapshot and validates input", async () => {
    const { app } = await setup();
    const state = await app.inject({ method: "GET", url: "/state" });
    expect(state.statusCode).toBe(200);
    const body = state.json();
    expect(body.tabs).toHaveLength(6);
    expect(body.members).toHaveLength(5);
    expect(body.metrics.outstandingCents).toBe(34218000);
    expect(body.menu.some((m: { priceCents: number }) => m.priceCents === 90000)).toBe(true);
    expect(Object.keys(body.tabs[0]).sort()).toEqual(
      ["allowance", "ap4m", "escrow", "graceEndsAt", "hold", "id", "items", "mandate", "memberId", "memberName", "openedAt", "seat", "settlement", "status", "tipCents", "totalCents"].sort(),
    );

    expect((await app.inject({ method: "POST", url: "/tabs", payload: {} })).statusCode).toBe(400);
    expect((await app.inject({ method: "POST", url: "/tabs/nope/exit" })).statusCode).toBe(404);
    const opened = await app.inject({ method: "POST", url: "/tabs", payload: { memberId: "m3" } });
    expect(opened.statusCode).toBe(201);
    const id = opened.json().id;
    expect((await app.inject({ method: "POST", url: `/tabs/${id}/items`, payload: { menuItemId: "espresso" } })).json().totalCents).toBe(600);
    expect((await app.inject({ method: "POST", url: `/tabs/${id}/approve` })).statusCode).toBe(409);

    const reset = await app.inject({ method: "POST", url: "/demo/reset" });
    expect(reset.json().tabs).toHaveLength(6);
  });
});
