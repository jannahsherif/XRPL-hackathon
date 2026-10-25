import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadLedger } from "../src/ledger/index.js";
import { ConflictError, NotFoundError } from "../src/settleService.js";
import { TransitionError } from "../src/stateMachine.js";
import { fakeLedger, fixedAgent, flush, makeService, testConfig } from "./helpers.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-25T01:00:00Z"));
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** Opens a tab for m2 ($600 allowance) and adds a steak + 2 martinis = $106.00. */
async function openedTab(ctx = makeService()) {
  const tab = await ctx.service.openTab("m2", "Table 9");
  ctx.service.addItem(tab.id, "steak");
  ctx.service.addItem(tab.id, "martini", 2);
  return { ...ctx, tab };
}

const runGrace = async (seconds = 10) => {
  await vi.advanceTimersByTimeAsync(seconds * 1000);
  await flush();
};

describe("seed and snapshot", () => {
  it("starts with the seeded state", () => {
    const { service } = makeService();
    const state = service.snapshot();
    expect(state.tabs).toHaveLength(6);
    expect(state.members).toHaveLength(6);
    expect(state.menu.length).toBeGreaterThan(5);
    expect(state.policy.graceSeconds).toBe(10);
    expect(state.mode).toEqual({ demo: true, ledger: "stub", agent: "local", intent: "off" });
    expect(state.metrics).toEqual({ outstandingCents: 34_218_000, openTabs: 6, settledCount: 0, avgSettleMs: 0 });
  });

  it("computes seeded totals from items", () => {
    const { service } = makeService();
    const t1 = service.getTab("t1");
    expect(t1.totalCents).toBe(t1.items.reduce((s, i) => s + i.priceCents * i.qty, 0));
    expect(service.getTab("t3").totalCents).toBe(0);
  });

  it("gives seeded tabs placeholder escrows in stub mode only", () => {
    expect(makeService().service.getTab("t1").escrow.seq).not.toBeNull();
    expect(makeService({ config: { ledgerMode: "module" } }).service.getTab("t1").escrow.seq).toBeNull();
  });

  it("dates seeded tabs in the past", () => {
    const { service } = makeService();
    for (const tab of service.snapshot().tabs) expect(Date.parse(tab.openedAt)).toBeLessThan(Date.now());
  });

  it("throws NotFoundError for unknown tabs", () => {
    expect(() => makeService().service.getTab("nope")).toThrow(NotFoundError);
  });
});

describe("openTab", () => {
  it("escrows the member's tier allowance and emits tab.opened + metrics", async () => {
    const { service, ledger, ofType } = makeService();
    const tab = await service.openTab("m2", "Table 9");
    expect(ledger.openTab).toHaveBeenCalledWith({ memberId: "m2", allowance: "600.00" });
    expect(tab).toMatchObject({ memberId: "m2", memberName: "Marcus Hale", seat: "Table 9", status: "open", allowance: "600.00", totalCents: 0 });
    expect(tab.escrow.txHash).toMatch(/^[0-9A-F]{64}$/);
    expect(tab.escrow.explorerUrl).toContain(tab.escrow.txHash!);
    expect(ofType("tab.opened")[0].data).toMatchObject({ tab: { id: tab.id }, ledgerIndex: expect.any(Number) });
    expect(service.metrics().openTabs).toBe(7);
  });

  it("issues sequential ids starting at t101", async () => {
    const { service } = makeService();
    expect((await service.openTab("m1")).id).toBe("t101");
    expect((await service.openTab("m2")).id).toBe("t102");
  });

  it("defaults the seat", async () => {
    expect((await makeService().service.openTab("m3")).seat).toBe("Bar");
  });

  it("rejects unknown members without touching the ledger", async () => {
    const { service, ledger } = makeService();
    await expect(service.openTab("ghost")).rejects.toThrow(NotFoundError);
    expect(ledger.openTab).not.toHaveBeenCalled();
  });

  it("does not create a tab when the escrow fails", async () => {
    const ledger = fakeLedger({ openTab: vi.fn().mockRejectedValue(Object.assign(new Error("low"), { code: "INSUFFICIENT_FUNDS" })) });
    const { service } = makeService({ ledger });
    await expect(service.openTab("m2")).rejects.toMatchObject({ code: "INSUFFICIENT_FUNDS" });
    expect(service.snapshot().tabs).toHaveLength(6);
  });
});

describe("addItem (fake POS)", () => {
  it("moves open -> ordering, totals the tab and reports headroom", async () => {
    const { service, ofType } = makeService();
    const tab = await service.openTab("m2");
    service.addItem(tab.id, "steak");
    expect(tab.status).toBe("ordering");
    expect(tab.totalCents).toBe(6800);
    expect(ofType("tab.item_added")[0].data).toMatchObject({ headroomCents: 60000 - 6800, item: { id: "steak", qty: 1 } });
  });

  it("merges repeat items into one line", async () => {
    const { service } = makeService();
    const tab = await service.openTab("m2");
    service.addItem(tab.id, "martini");
    service.addItem(tab.id, "martini", 2);
    expect(tab.items).toEqual([{ name: "House Martini", qty: 3, priceCents: 1900 }]);
    expect(tab.totalCents).toBe(5700);
  });

  it.each([
    [0, 1],
    [-3, 1],
    [2.6, 3],
    [50, 20],
  ])("clamps qty %s to %i", async (qty, expected) => {
    const { service } = makeService();
    const tab = await service.openTab("m2");
    service.addItem(tab.id, "espresso", qty);
    expect(tab.items[0].qty).toBe(expected);
  });

  it("rejects non-numeric qty", async () => {
    const { service } = makeService();
    const tab = await service.openTab("m2");
    expect(() => service.addItem(tab.id, "espresso", "two" as unknown as number)).toThrow(ConflictError);
  });

  it("rejects unknown menu items", async () => {
    const { service } = makeService();
    const tab = await service.openTab("m2");
    expect(() => service.addItem(tab.id, "caviar")).toThrow(NotFoundError);
  });

  it("can push headroom negative (the hold rules catch it at exit)", async () => {
    const { service, ofType } = makeService();
    const tab = await service.openTab("m4"); // $300
    service.addItem(tab.id, "steak", 5); // $340
    expect((ofType("tab.item_added")[0].data as { headroomCents: number }).headroomCents).toBe(30000 - 34000);
  });

  it.each(["grace", "held", "settled", "closed_manually"])("refuses items once the tab is %s", async (status) => {
    const { service, tab } = await openedTab();
    tab.status = status as typeof tab.status;
    expect(() => service.addItem(tab.id, "fries")).toThrow(/Cannot add items/);
  });
});

describe("exit and grace", () => {
  it("emits exit_detected, member.push and starts the countdown", async () => {
    const { service, tab, ofType } = await openedTab();
    service.exit(tab.id);
    expect(tab.status).toBe("grace");
    expect(tab.graceEndsAt).toBe(new Date(Date.now() + 10_000).toISOString());
    expect(ofType("tab.exit_detected")).toHaveLength(1);
    expect(ofType("member.push")[0].data).toMatchObject({
      tabId: tab.id,
      memberName: "Marcus Hale",
      totalCents: 10600,
      suggestedTipPct: 20,
      tipOptions: [15, 18, 20, 22],
      secondsLeft: 10,
    });
  });

  it("ticks once a second with seconds left", async () => {
    const { service, tab, ofType } = await openedTab();
    service.exit(tab.id);
    await vi.advanceTimersByTimeAsync(3000);
    expect(ofType("tab.grace_tick").map((e) => (e.data as { secondsLeft: number }).secondsLeft)).toEqual([9, 8, 7]);
  });

  it("counts down to 0, and the 0 arrives before reconciling", async () => {
    const { service, tab, events, ofType } = await openedTab();
    service.exit(tab.id);
    await runGrace();
    expect(ofType("tab.grace_tick").map((e) => (e.data as { secondsLeft: number }).secondsLeft)).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
    const zero = events.findIndex((e) => e.type === "tab.grace_tick" && (e.data as { secondsLeft: number }).secondsLeft === 0);
    const reconciling = events.findIndex((e) => e.type === "tab.updated" && (e.data as { change: string }).change === "reconciling");
    expect(zero).toBeGreaterThan(-1);
    expect(zero).toBeLessThan(reconciling);
  });

  it("asks the agent during grace, not after", async () => {
    const agent = fixedAgent();
    const { service, tab } = await openedTab(makeService({ agent }));
    service.exit(tab.id);
    expect(agent.decide).toHaveBeenCalledTimes(1);
    expect(agent.decide.mock.calls[0][0]).toMatchObject({ id: tab.id, totalCents: 10600 });
  });

  it("does not settle before the grace period ends", async () => {
    const { service, tab, ledger } = await openedTab();
    service.exit(tab.id);
    await vi.advanceTimersByTimeAsync(9_900);
    expect(tab.status).toBe("grace");
    expect(ledger.settleTab).not.toHaveBeenCalled();
  });

  it("uses the policy grace time", async () => {
    const { service, tab } = await openedTab();
    service.updatePolicy({ graceSeconds: 3 });
    service.exit(tab.id);
    await runGrace(3);
    expect(tab.status).toBe("settled");
  });

  it("can exit straight from open (no items)", async () => {
    const { service } = makeService();
    const tab = await service.openTab("m3");
    service.exit(tab.id);
    await runGrace();
    expect(tab.status).toBe("settled");
    expect(tab.settlement?.toVenue).toBe("0.00");
  });

  it("cannot exit twice", async () => {
    const { service, tab } = await openedTab();
    service.exit(tab.id);
    expect(() => service.exit(tab.id)).toThrow(TransitionError);
  });
});

describe("settlement", () => {
  it("settles total + agent tip and records the settlement", async () => {
    const { service, tab, ledger, ofType } = await openedTab(makeService({ agent: fixedAgent({ tipPct: 18 }) }));
    service.exit(tab.id);
    await runGrace();

    // Ledger contract: amount excludes the tip.
    expect(ledger.settleTab).toHaveBeenCalledWith(expect.objectContaining({ amount: "106.00", tipAmount: "19.08" }));
    expect(tab.status).toBe("settled");
    expect(tab.tipCents).toBe(1908);
    expect(tab.settlement).toMatchObject({ toVenue: "125.08", toMember: "474.92", elapsedMs: 1234 });
    expect(tab.graceEndsAt).toBeNull();
    expect(ofType("agent.decision")[0].data).toMatchObject({ tabId: tab.id, action: "settle", tipPct: 18 });
    expect(ofType("tab.settled")[0].data).toMatchObject({ tab: { id: tab.id }, decision: { action: "settle" } });
  });

  it("passes a snapshot of the tab to the ledger, not the live object", async () => {
    const { service, tab, ledger } = await openedTab();
    service.exit(tab.id);
    await runGrace();
    const passed = ledger.settleTab.mock.calls[0][0].tab;
    expect(passed).not.toBe(tab);
    expect(passed.id).toBe(tab.id);
  });

  it("prefers the member's tip over the agent's", async () => {
    const { service, tab, ledger } = await openedTab(makeService({ agent: fixedAgent({ tipPct: 25 }) }));
    service.exit(tab.id);
    service.setTip(tab.id, 15);
    await runGrace();
    expect(ledger.settleTab).toHaveBeenCalledWith(expect.objectContaining({ tipAmount: "15.90" }));
  });

  it("treats split like settle in v1", async () => {
    const { service, tab } = await openedTab(makeService({ agent: fixedAgent({ action: "split" }) }));
    service.exit(tab.id);
    await runGrace();
    expect(tab.status).toBe("settled");
  });

  it("drops outstanding by exactly what reached the venue", async () => {
    const { service, tab } = await openedTab();
    service.exit(tab.id);
    await runGrace();
    expect(service.metrics().outstandingCents).toBe(34_218_000 - 12720);
  });

  it("never lets outstanding go negative", async () => {
    const { service, tab } = await openedTab(makeService({ config: { outstandingSeedCents: 100 } }));
    service.exit(tab.id);
    await runGrace();
    expect(service.metrics().outstandingCents).toBe(0);
  });

  it("averages settle time across settlements", async () => {
    let elapsed = 1000;
    const base = fakeLedger();
    const ledger = fakeLedger({
      settleTab: vi.fn(async (args) => ({ ...(await base.settleTab(args)), elapsedMs: (elapsed += 1000) })),
    });
    const ctx = makeService({ ledger });
    const a = await ctx.service.openTab("m2");
    const b = await ctx.service.openTab("m3");
    ctx.service.exit(a.id);
    ctx.service.exit(b.id);
    await runGrace();
    expect(ctx.service.metrics()).toMatchObject({ settledCount: 2, avgSettleMs: 2500 });
  });

  it("trims the tip so the charge never exceeds the escrow", async () => {
    const { service, ledger } = makeService();
    const tab = await service.openTab("m4"); // $300 allowance, typical $90 -> 3x = $270
    service.addItem(tab.id, "steak", 3); // $204
    service.addItem(tab.id, "salmon", 1); // +$38 = $242
    service.exit(tab.id);
    service.setTip(tab.id, 30); // $72.60 would exceed $300
    await runGrace();
    expect(ledger.settleTab).toHaveBeenCalledWith(expect.objectContaining({ amount: "242.00", tipAmount: "58.00" }));
    expect(tab.settlement?.toMember).toBe("0.00");
  });

  it("moves to held with the ledger error code when settlement fails", async () => {
    const ledger = fakeLedger({ settleTab: vi.fn().mockRejectedValue(Object.assign(new Error("slow"), { code: "LEDGER_TIMEOUT" })) });
    const { service, tab, ofType } = await openedTab(makeService({ ledger }));
    service.exit(tab.id);
    await runGrace();
    expect(tab.status).toBe("held");
    expect(tab.hold?.reason).toBe("Ledger error (LEDGER_TIMEOUT): slow");
    expect(ofType("tab.held")).toHaveLength(1);
    expect(service.metrics().settledCount).toBe(0);
  });

  it("lets a manager retry a ledger failure with approve", async () => {
    const settleTab = vi.fn().mockRejectedValueOnce(Object.assign(new Error("x"), { code: "LEDGER_TIMEOUT" }));
    const base = fakeLedger();
    settleTab.mockImplementation(base.settleTab);
    const { service, tab } = await openedTab(makeService({ ledger: fakeLedger({ settleTab }) }));
    service.exit(tab.id);
    await runGrace();
    expect(tab.status).toBe("held");
    await service.approve(tab.id);
    expect(tab.status).toBe("settled");
    expect(tab.hold).toBeNull();
  });
});

describe("hold path", () => {
  it("holds when the agent says hold and does not touch the ledger", async () => {
    const { service, tab, ledger, ofType } = await openedTab(makeService({ agent: fixedAgent({ action: "hold", reason: "Odd order" }) }));
    service.exit(tab.id);
    await runGrace();
    expect(tab.status).toBe("held");
    expect(tab.hold).toEqual({ reason: "Odd order", triggeredAt: expect.any(String), source: "agent", code: "AGENT_HOLD" });
    expect(ofType("tab.held")[0].data).toMatchObject({ hold: { reason: "Odd order" } });
    expect(ledger.settleTab).not.toHaveBeenCalled();
  });

  it("holds the $900 bottle on the low-spend member via real hard rules", async () => {
    const { createSettlementAgent } = await import("../src/agent/settlementAgent.js");
    const { testConfig } = await import("./helpers.js");
    const { service, ofType } = makeService({ agent: createSettlementAgent(testConfig()) });
    const tab = await service.openTab("m5");
    service.addItem(tab.id, "bottle-900");
    service.exit(tab.id);
    await runGrace();
    expect(tab.status).toBe("held");
    expect(ofType("agent.decision")[0].data).toMatchObject({ action: "hold", source: "rules", code: "OVER_TYPICAL_SPEND" });
    expect(tab.hold).toMatchObject({ source: "rules", code: "OVER_TYPICAL_SPEND" });
  });

  it("a ledger failure after a settle decision holds with source ledger and the ledger's code", async () => {
    const ledger = fakeLedger({ settleTab: vi.fn().mockRejectedValue(Object.assign(new Error("not validated"), { code: "LEDGER_TIMEOUT" })) });
    const { service, tab, ofType } = await openedTab(makeService({ ledger }));
    service.exit(tab.id);
    await runGrace();
    expect(ofType("agent.decision")[0].data).toMatchObject({ action: "settle" });
    expect(tab.status).toBe("held");
    expect(tab.hold).toMatchObject({ source: "ledger", code: "LEDGER_TIMEOUT" });
  });

  it("a dispute holds with source member and code DISPUTED", async () => {
    const { service, tab } = await openedTab();
    service.dispute(tab.id, "Not my round");
    expect(tab.hold).toMatchObject({ source: "member", code: "DISPUTED", reason: "Member disputed: Not my round" });
  });

  it("approve settles a held tab with the default tip, trimmed to the escrow", async () => {
    const { service, ledger } = makeService({ agent: fixedAgent({ action: "hold" }) });
    const tab = await service.openTab("m5"); // $1,000
    service.addItem(tab.id, "bottle-900");
    service.exit(tab.id);
    await runGrace();
    await service.approve(tab.id);
    expect(ledger.settleTab).toHaveBeenCalledWith(expect.objectContaining({ amount: "900.00", tipAmount: "100.00" }));
    expect(tab.status).toBe("settled");
  });

  it("approve keeps a tab held if its items alone exceed the escrow", async () => {
    const { service, ledger } = makeService({ agent: fixedAgent({ action: "hold" }) });
    const tab = await service.openTab("m4"); // $300
    service.addItem(tab.id, "steak", 5); // $340
    service.exit(tab.id);
    await runGrace();
    await service.approve(tab.id);
    expect(tab.status).toBe("held");
    expect(tab.hold?.reason).toMatch(/above the escrowed \$300\.00/);
    expect(ledger.settleTab).not.toHaveBeenCalled();
  });

  it.each(["open", "ordering", "grace", "settled"])("approve refuses a tab that is %s", async (status) => {
    const { service, tab } = await openedTab();
    tab.status = status as typeof tab.status;
    await expect(service.approve(tab.id)).rejects.toThrow(/Only held tabs can be approved/);
  });

  it("reject cancels the escrow and closes the tab", async () => {
    const { service, tab, ledger, ofType } = await openedTab(makeService({ agent: fixedAgent({ action: "hold" }) }));
    service.exit(tab.id);
    await runGrace();
    await service.reject(tab.id);
    expect(ledger.cancelTab).toHaveBeenCalledTimes(1);
    expect(tab.status).toBe("closed_manually");
    expect(ofType("tab.updated").at(-1)?.data).toMatchObject({ change: "closed_manually", reason: "Rejected by manager", cancelTxHash: expect.any(String) });
  });

  it("reject refuses a tab that is not held", async () => {
    const { service, tab } = await openedTab();
    await expect(service.reject(tab.id)).rejects.toThrow(/Only held tabs can be rejected/);
  });
});

describe("tip", () => {
  it("sets tipCents from the current total", async () => {
    const { service, tab, ofType } = await openedTab();
    service.setTip(tab.id, 20);
    expect(tab.tipCents).toBe(2120);
    expect(ofType("tab.updated").at(-1)?.data).toMatchObject({ change: "tip", tipPct: 20 });
  });

  it.each([
    [-10, 0],
    [45, 30],
  ])("clamps %i%% to %i%%", async (pct, expected) => {
    const { service, tab, ofType } = await openedTab();
    service.setTip(tab.id, pct);
    expect((ofType("tab.updated").at(-1)?.data as { tipPct: number }).tipPct).toBe(expected);
  });

  it("refuses to change the tip after settlement", async () => {
    const { service, tab } = await openedTab();
    service.exit(tab.id);
    await runGrace();
    expect(() => service.setTip(tab.id, 15)).toThrow(/Tip can only change before settlement/);
  });
});

describe("dispute", () => {
  it("holds the tab during grace and cancels the timer", async () => {
    const { service, tab, ledger, ofType } = await openedTab();
    service.exit(tab.id);
    await vi.advanceTimersByTimeAsync(4000);
    service.dispute(tab.id, "Not my steak");
    const ticksAtDispute = ofType("tab.grace_tick").length;
    await runGrace(20);
    expect(tab.status).toBe("held");
    expect(tab.hold?.reason).toBe("Member disputed: Not my steak");
    expect(ofType("tab.grace_tick")).toHaveLength(ticksAtDispute);
    expect(ofType("agent.decision")).toHaveLength(0);
    expect(ledger.settleTab).not.toHaveBeenCalled();
  });

  it("uses a default reason without a note", async () => {
    const { service, tab } = await openedTab();
    service.dispute(tab.id);
    expect(tab.hold?.reason).toBe("Member disputed the tab");
  });

  it("refuses to dispute a settled tab", async () => {
    const { service, tab } = await openedTab();
    service.exit(tab.id);
    await runGrace();
    expect(() => service.dispute(tab.id)).toThrow(/Cannot dispute a tab that is settled/);
  });

  it("refuses to dispute a tab that is already held", async () => {
    const { service, tab } = await openedTab();
    service.dispute(tab.id);
    expect(() => service.dispute(tab.id)).toThrow(ConflictError);
  });
});

describe("manual close", () => {
  it("cancels the escrow and closes an ordering tab", async () => {
    const { service, tab, ledger } = await openedTab();
    await service.close(tab.id);
    expect(ledger.cancelTab).toHaveBeenCalledTimes(1);
    expect(tab.status).toBe("closed_manually");
    expect(service.metrics().openTabs).toBe(6);
  });

  it("stops a running grace timer", async () => {
    const { service, tab, ledger } = await openedTab();
    service.exit(tab.id);
    await service.close(tab.id);
    await runGrace(20);
    expect(tab.status).toBe("closed_manually");
    expect(ledger.settleTab).not.toHaveBeenCalled();
  });

  it("skips the ledger for tabs without a real escrow", async () => {
    const { service, ledger } = makeService();
    await service.close("t1"); // seeded placeholder escrow (no txHash)
    expect(ledger.cancelTab).not.toHaveBeenCalled();
    expect(service.getTab("t1").status).toBe("closed_manually");
  });

  it("stays open and reports a conflict when the escrow cannot be cancelled", async () => {
    const ledger = fakeLedger({ cancelTab: vi.fn().mockRejectedValue(Object.assign(new Error("x"), { code: "ESCROW_NOT_FOUND" })) });
    const { service, tab } = await openedTab(makeService({ ledger }));
    await expect(service.close(tab.id)).rejects.toThrow(/Could not cancel escrow \(ESCROW_NOT_FOUND\)/);
    expect(tab.status).toBe("ordering");
  });

  it("refuses to close a settled tab", async () => {
    const { service, tab } = await openedTab();
    service.exit(tab.id);
    await runGrace();
    await expect(service.close(tab.id)).rejects.toThrow(ConflictError);
  });
});

describe("race conditions", () => {
  it("ignores a slow agent decision after the tab was disputed", async () => {
    let release!: (d: unknown) => void;
    const agent = { decide: vi.fn(() => new Promise((r) => (release = r))) };
    const { service, tab, ledger, ofType } = await openedTab(makeService({ agent: agent as never }));
    service.exit(tab.id);
    await runGrace(); // timer fires, reconcile waits on the agent
    expect(tab.status).toBe("reconciling");
    release({ action: "settle", tipPct: 20, reason: "late", source: "agent" });
    await flush();
    expect(tab.status).toBe("settled"); // reconciling tabs cannot be disputed, so it settles
    expect(ledger.settleTab).toHaveBeenCalledTimes(1);
    expect(ofType("agent.decision")).toHaveLength(1);
  });

  it("ignores a slow agent decision after a demo reset", async () => {
    let release!: (d: unknown) => void;
    const agent = { decide: vi.fn(() => new Promise((r) => (release = r))) };
    const { service, tab, ledger } = await openedTab(makeService({ agent: agent as never }));
    service.exit(tab.id);
    await runGrace();
    await service.reset();
    release({ action: "settle", tipPct: 20, reason: "late", source: "agent" });
    await flush();
    expect(ledger.settleTab).not.toHaveBeenCalled();
    expect(() => service.getTab(tab.id)).toThrow(NotFoundError);
  });

  it("settles many tabs concurrently", async () => {
    const { service } = makeService();
    const tabs = await Promise.all(["m1", "m2", "m3", "m4", "m5"].map((m) => service.openTab(m)));
    tabs.forEach((t) => service.addItem(t.id, "espresso"));
    tabs.forEach((t) => service.exit(t.id));
    await runGrace();
    expect(tabs.every((t) => t.status === "settled")).toBe(true);
    expect(service.metrics().settledCount).toBe(5);
  });
});

describe("reset", () => {
  it("cancels open live escrows, reseeds and clears metrics", async () => {
    const { service, ledger, bus } = makeService();
    const a = await service.openTab("m2");
    await service.openTab("m3");
    service.exit(a.id);
    await runGrace();
    await service.reset();
    // a is settled (not cancelled); the other open live tab is cancelled. Seeded placeholders are skipped.
    expect(ledger.cancelTab).toHaveBeenCalledTimes(1);
    expect(service.snapshot().tabs.map((t) => t.id)).toEqual(["t1", "t2", "t3", "t4", "t5", "t6"]);
    expect(service.metrics()).toEqual({ outstandingCents: 34_218_000, openTabs: 6, settledCount: 0, avgSettleMs: 0 });
    expect((await service.openTab("m1")).id).toBe("t101");
    expect(bus.history().some((e) => e.type === "tab.opened")).toBe(true);
  });

  it("still resets when a cancel fails", async () => {
    const ledger = fakeLedger({ cancelTab: vi.fn().mockRejectedValue(new Error("down")) });
    const { service } = makeService({ ledger });
    await service.openTab("m2");
    await expect(service.reset()).resolves.toBeUndefined();
    expect(service.snapshot().tabs).toHaveLength(6);
  });

  it("stops every grace timer", async () => {
    const { service, tab, ledger } = await openedTab();
    service.exit(tab.id);
    await service.reset();
    await runGrace(20);
    expect(ledger.settleTab).not.toHaveBeenCalled();
  });

  it("restores the policy", async () => {
    const { service } = makeService();
    service.updatePolicy({ defaultTipPct: 5 });
    await service.reset();
    expect(service.snapshot().policy.defaultTipPct).toBe(20);
  });

  it("emits a reset event with the new state", async () => {
    const { service, ofType } = makeService();
    await service.reset();
    expect(ofType("tab.updated").at(-1)?.data).toMatchObject({ change: "reset", state: { tabs: expect.any(Array) } });
  });
});

describe("policy", () => {
  it("updates and clamps fields", () => {
    const { service } = makeService();
    expect(service.updatePolicy({ graceSeconds: 1, defaultTipPct: 50, holdIfTotalOverTypicalX: 0.5 })).toMatchObject({
      graceSeconds: 3,
      defaultTipPct: 30,
      holdIfTotalOverTypicalX: 1,
    });
    expect(service.updatePolicy({ graceSeconds: 10_000 }).graceSeconds).toBe(600);
  });

  it("coerces booleans and leaves unspecified fields alone", () => {
    const { service } = makeService();
    const policy = service.updatePolicy({ splitBySeat: 0 as unknown as boolean });
    expect(policy.splitBySeat).toBe(false);
    expect(policy.holdIfItemOverAllowance).toBe(true);
    expect(policy.defaultTipPct).toBe(20);
  });

  it("rejects non-numeric values", () => {
    expect(() => makeService().service.updatePolicy({ graceSeconds: "soon" as unknown as number })).toThrow(ConflictError);
  });

  it("applies the new tip default to the next decision via member.push", async () => {
    const { service, tab, ofType } = await openedTab();
    service.updatePolicy({ defaultTipPct: 18 });
    service.exit(tab.id);
    expect(ofType("member.push")[0].data).toMatchObject({ suggestedTipPct: 18 });
  });
});

describe("openSeedEscrows (LEDGER_MODE=module)", () => {
  it("opens real escrows only for the two stage tabs (m1 demo, m5 anomaly)", async () => {
    const { service, ledger, ofType } = makeService({ config: { ledgerMode: "module" } });
    await service.openSeedEscrows();
    expect(ledger.openTab).toHaveBeenCalledTimes(2);
    expect(ledger.openTab.mock.calls.map((c) => c[0].memberId)).toEqual(["m1", "m5"]);
    const live = service.snapshot().tabs.filter((t) => t.escrow.txHash).map((t) => t.id);
    expect(live).toEqual(["t1", "t5"]);
    expect(service.snapshot().tabs.filter((t) => !t.escrow.txHash).every((t) => t.escrow.seq === null)).toBe(true);
    expect(ofType("tab.updated").filter((e) => (e.data as { change: string }).change === "escrow_opened")).toHaveLength(2);
  });

  it("keeps going when one escrow fails", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const base = fakeLedger();
    const openTab = vi.fn(base.openTab).mockRejectedValueOnce(Object.assign(new Error("x"), { code: "INSUFFICIENT_FUNDS" }));
    const { service } = makeService({ ledger: fakeLedger({ openTab }), config: { ledgerMode: "module" } });
    await service.openSeedEscrows();
    expect(service.snapshot().tabs.filter((t) => t.escrow.txHash)).toHaveLength(1);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("INSUFFICIENT_FUNDS"));
  });
});

describe("reset with SEED_LIVE_ESCROWS=1 (LEDGER_MODE=module)", () => {
  const live = { ledgerMode: "module", seedLiveEscrows: true } as const;

  /** The API's stub ledger (testnet balances, 1 s per call) behind spies. */
  async function stubLedger() {
    const stub = await loadLedger(testConfig({ ledgerStubDelayMs: 1000 }));
    return fakeLedger({
      openTab: vi.fn(stub.openTab),
      settleTab: vi.fn(stub.settleTab),
      cancelTab: vi.fn(stub.cancelTab),
      getBalances: vi.fn(stub.getBalances),
    });
  }

  /** Lets a ledger-backed call finish under fake timers. */
  const drain = async <T>(p: Promise<T>) => {
    await vi.advanceTimersByTimeAsync(10_000);
    return p;
  };

  it("re-opens the stage tabs' escrows, so t1 settles again after a reset", async () => {
    const ledger = await stubLedger();
    const { service, ofType } = makeService({ ledger, config: live });
    await drain(service.openSeedEscrows()); // what boot does
    const before = { t1: service.getTab("t1").escrow, t5: service.getTab("t5").escrow };
    service.exit("t1");
    await runGrace(12);
    expect(service.getTab("t1").status).toBe("settled");

    await drain(service.reset());

    // t5 was still open, so its escrow is cancelled; t1's already finished.
    expect(ledger.cancelTab.mock.calls.map((c) => c[0].tab.id)).toEqual(["t5"]);
    const tabs = service.snapshot().tabs;
    expect(tabs.filter((t) => t.escrow.txHash).map((t) => t.id)).toEqual(["t1", "t5"]);
    expect(tabs.filter((t) => !t.escrow.txHash).every((t) => t.escrow.seq === null)).toBe(true);
    expect(service.getTab("t1").escrow.seq).not.toBe(before.t1.seq);
    expect(service.getTab("t5").escrow.seq).not.toBe(before.t5.seq);
    // One t5 escrow is locked, not two: the old one came back before the new one opened.
    expect((await ledger.getBalances()).members.m5).toBe("200.00");
    // The reset snapshot goes out first; the escrows follow as tab.updated escrow_opened.
    const changes = ofType("tab.updated").map((e) => (e.data as { change: string }).change);
    expect(changes.slice(changes.lastIndexOf("reset"))).toEqual(["reset", "escrow_opened", "escrow_opened"]);

    service.exit("t1");
    await runGrace(12);
    expect(service.getTab("t1").status).toBe("settled");
    expect(ledger.settleTab.mock.calls.at(-1)![0].tab.escrow.seq).toBe(service.getTab("t1").escrow.seq);
  });

  it.each([
    ["the stub ledger", { ledgerMode: "stub", seedLiveEscrows: true }],
    ["SEED_LIVE_ESCROWS unset", { ledgerMode: "module", seedLiveEscrows: false }],
  ] as const)("opens nothing on reset with %s", async (_label, config) => {
    const ledger = await stubLedger();
    const { service } = makeService({ ledger, config });
    await drain(service.reset());
    expect(service.seedsLiveEscrows).toBe(false);
    expect(ledger.openTab).not.toHaveBeenCalled();
    expect(service.getTab("t1").escrow.txHash).toBeNull();
  });

  it("a second reset while one is running joins it instead of opening the escrows twice", async () => {
    const ledger = await stubLedger();
    const { service } = makeService({ ledger, config: live });
    await drain(service.openSeedEscrows());
    const first = service.reset();
    const second = service.reset();
    expect(second).toBe(first);
    await drain(first);
    expect(ledger.cancelTab).toHaveBeenCalledTimes(2);
    expect(ledger.openTab).toHaveBeenCalledTimes(4);
    expect((await ledger.getBalances()).members).toMatchObject({ m1: "4000.00", m5: "200.00" });
  });

  it("a reset during boot seeding waits for those escrows and cancels them", async () => {
    const ledger = await stubLedger();
    const { service } = makeService({ ledger, config: live });
    const boot = service.openSeedEscrows();
    await drain(Promise.all([boot, service.reset()]));
    expect(ledger.cancelTab.mock.calls.map((c) => c[0].tab.id)).toEqual(["t1", "t5"]);
    expect(ledger.openTab).toHaveBeenCalledTimes(4);
    expect((await ledger.getBalances()).members).toMatchObject({ m1: "4000.00", m5: "200.00" });
    expect(service.snapshot().tabs.filter((t) => t.escrow.txHash).map((t) => t.id)).toEqual(["t1", "t5"]);
  });
});
