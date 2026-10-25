/**
 * Ledger <-> backend integration (offline, runs in CI).
 *
 *  1. The real ledger package loads through the API's loader and adapter.
 *  2. Alex's real createLedger() runs behind the API with throwaway wallets:
 *     everything it validates before the network (member ids, amounts,
 *     escrowSeq) surfaces through our HTTP error mapping.
 *  3. A ledger with Alex's exact contract (his real amount math and errors)
 *     drives every backend flow end to end over HTTP and SSE.
 *
 * The live testnet suite is ledger.live.test.ts (opt-in).
 */
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { buildApp } from "../../src/app.js";
import { loadLedger } from "../../src/ledger/index.js";
import { adaptTeamLedger, fromLedgerMemberId, toLedgerMemberId } from "../../src/ledger/teamLedger.js";
import { decimalToCents } from "../../src/money.js";
import { SEED_MEMBERS } from "../../src/seed.js";
import type { SettlementAgent } from "../../src/agent/settlementAgent.js";
import type { Ledger, SettleEvent, Tab } from "../../src/types.js";
import { fixedAgent, testConfig } from "../helpers.js";
import { ACCOUNTS, LEDGER_ENTRY, contractLedger, importAmounts, importLedger, offlineLedgerConfig } from "./ledgerKit.js";

type Built = Awaited<ReturnType<typeof buildApp>>;
const opened: Built[] = [];
afterEach(async () => {
  await Promise.all(opened.splice(0).map((b) => b.app.close()));
});

async function apiWith(ledger: Ledger, config = {}, agent: SettlementAgent = fixedAgent()) {
  const built = await buildApp(testConfig({ graceSeconds: 1, ledgerMode: "module", ...config }), { ledger, agent });
  built.app.log.level = "silent";
  opened.push(built);
  const events: SettleEvent[] = [];
  built.bus.subscribe((e) => events.push(e));
  const inject = (method: "GET" | "POST", url: string, payload?: object) => built.app.inject({ method, url, payload });
  const waitFor = async (type: string, tabId?: string, timeoutMs = 8000) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const hit = events.find((e) => e.type === type && (!tabId || JSON.stringify(e.data).includes(`"${tabId}"`)));
      if (hit) return hit;
      await new Promise((r) => setTimeout(r, 25));
    }
    throw new Error(`no ${type} for ${tabId}; saw ${events.map((e) => e.type).join(",")}`);
  };
  return { built, events, inject, waitFor };
}

describe("member id mapping", () => {
  it.each([
    ["m1", "member-1"],
    ["m5", "member-5"],
    ["m12", "member-12"],
    ["member-3", "member-3"],
    ["guest", "guest"],
  ])("%s <-> %s", (api, ledger) => {
    expect(toLedgerMemberId(api)).toBe(ledger);
    expect(fromLedgerMemberId(ledger)).toBe(api.startsWith("member-") ? `m${api.slice(7)}` : api);
  });

  it("every seeded member maps to an account in ledger/accounts.json", () => {
    for (const m of SEED_MEMBERS) expect(ACCOUNTS.members[toLedgerMemberId(m.id)]).toMatch(/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/);
  });
});

describe("1. the real ledger package loads through the API", () => {
  it("exports the contract functions and createLedger", async () => {
    const ledger = await importLedger();
    for (const fn of ["openTab", "settleTab", "cancelTab", "getBalances", "createLedger"] as const) expect(typeof ledger[fn]).toBe("function");
    expect(new ledger.LedgerError("INVALID_INPUT", "x")).toMatchObject({ code: "INVALID_INPUT", name: "LedgerError" });
  });

  it("LEDGER_MODE=module with LEDGER_MODULE=../ledger/src/index.ts loads and adapts it without touching the network", async () => {
    const ledger = await loadLedger(testConfig({ ledgerMode: "module", ledgerModule: path.relative(process.cwd(), LEDGER_ENTRY) }));
    for (const fn of ["openTab", "settleTab", "cancelTab", "getBalances"] as const) expect(typeof ledger[fn]).toBe("function");
  });

  it("the default LEDGER_MODULE points at the TypeScript entry", () => {
    expect(testConfig().ledgerModule).toBe("../ledger/src/index.ts");
  });
});

describe("2. Alex's real createLedger() behind the API (offline wallets, no node)", () => {
  async function realLedger() {
    const { createLedger } = await importLedger();
    const instance = createLedger(offlineLedgerConfig());
    return { instance, ledger: adaptTeamLedger(instance) };
  }
  const baseTab = (overrides: Partial<Tab> = {}): Tab => ({
    id: "t101",
    memberId: "m2",
    memberName: "Marcus Hale",
    seat: "Bar",
    status: "reconciling",
    items: [],
    totalCents: 10600,
    tipCents: 2120,
    allowance: "600.00",
    escrow: { seq: 4242, txHash: null, explorerUrl: null },
    settlement: null,
    hold: null,
    graceEndsAt: null,
    openedAt: "",
    mandate: null,
    ap4m: null,
    ...overrides,
  });

  it("rejects a member the ledger does not know (INVALID_INPUT)", async () => {
    const { ledger, instance } = await realLedger();
    await expect(ledger.openTab({ memberId: "m9", allowance: "100.00" })).rejects.toMatchObject({ code: "INVALID_INPUT", message: expect.stringMatching(/member-9/) });
    await instance.close();
  });

  it.each(["0", "abc", "-5", "1,000.00"])("rejects allowance %j (INVALID_INPUT)", async (allowance) => {
    const { ledger, instance } = await realLedger();
    await expect(ledger.openTab({ memberId: "m1", allowance })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await instance.close();
  });

  it("rejects bad settlement amounts before the network (INVALID_INPUT)", async () => {
    const { ledger, instance } = await realLedger();
    await expect(ledger.settleTab({ tab: baseTab(), amount: "1,06", tipAmount: "0" })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(ledger.settleTab({ tab: baseTab(), amount: "106.00", tipAmount: "-1" })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await instance.close();
  });

  it("the adapter sends a top-level escrowSeq the real ledger validates", async () => {
    const { ledger, instance } = await realLedger();
    await expect(ledger.settleTab({ tab: baseTab({ escrow: { seq: 1.5, txHash: null, explorerUrl: null } }), amount: "1.00", tipAmount: "0" })).rejects.toMatchObject({
      code: "INVALID_INPUT",
      message: expect.stringMatching(/escrowSeq/),
    });
    await instance.close();
  });

  it("display-only tabs (seq: null) never reach the ledger", async () => {
    const { ledger, instance } = await realLedger();
    await expect(ledger.cancelTab({ tab: baseTab({ escrow: { seq: null, txHash: null, explorerUrl: null } }) })).rejects.toMatchObject({ code: "ESCROW_NOT_FOUND" });
    await instance.close();
  });

  it("over HTTP: an unreachable ledger fails POST /tabs cleanly and creates no tab", async () => {
    const { ledger, instance } = await realLedger();
    const { inject } = await apiWith(ledger);
    const res = await inject("POST", "/tabs", { memberId: "m2" });
    expect(res.statusCode).toBeGreaterThanOrEqual(500);
    expect((await inject("GET", "/state")).json().tabs).toHaveLength(6);
    await instance.close();
  }, 20_000);
});

describe("3. backend flows against the ledger contract (Alex's amount math + errors)", () => {
  it("the backend's settlement amounts always satisfy the ledger's refundFor (amount excludes tip)", async () => {
    const { refundFor } = await importAmounts();
    const { mod } = await contractLedger();
    const { inject, waitFor } = await apiWith(adaptTeamLedger(mod));
    // A spread of tabs, tips and allowances, including ones where the tip must be trimmed.
    const cases = [
      { memberId: "m2", items: ["steak", "martini", "martini"], tip: 20 },
      { memberId: "m3", items: ["salmon"], tip: 15 },
      { memberId: "m4", items: ["steak", "steak", "steak", "salmon"], tip: 30 }, // trimmed to fit $300
      { memberId: "m1", items: ["oysters", "espresso"], tip: 0 },
    ];
    for (const c of cases) {
      const tab = (await inject("POST", "/tabs", { memberId: c.memberId })).json();
      for (const menuItemId of c.items) await inject("POST", `/tabs/${tab.id}/items`, { menuItemId });
      await inject("POST", `/tabs/${tab.id}/exit`);
      await inject("POST", `/tabs/${tab.id}/tip`, { pct: c.tip });
      await waitFor("tab.settled", tab.id);
      const call = mod.settleTab.mock.calls.at(-1)![0];
      const settled = (await inject("GET", `/tabs/${tab.id}`)).json() as Tab;
      expect(call.amount).toBe((settled.totalCents / 100).toFixed(2)); // tip NOT included
      expect(call.tipAmount).toBe((settled.tipCents / 100).toFixed(2));
      const allowance = SEED_MEMBERS.find((m) => m.id === c.memberId)!.allowance;
      expect(Number(refundFor(allowance, call.amount, call.tipAmount))).toBeCloseTo(Number(settled.settlement!.toMember), 2);
      expect(decimalToCents(settled.settlement!.toVenue)).toBe(settled.totalCents + settled.tipCents);
    }
  }, 30_000);

  it("/state keeps settlement.explorerUrls and the open's escrow timestamps, not just the events", async () => {
    const { mod } = await contractLedger({ finishAfterMs: 300 });
    const { inject, waitFor } = await apiWith(adaptTeamLedger(mod));
    const opened = (await inject("POST", "/tabs", { memberId: "m2" })).json() as Tab;
    expect(opened.escrow).toMatchObject({ submittedAt: expect.any(String), validatedAt: expect.any(String) });
    await inject("POST", `/tabs/${opened.id}/items`, { menuItemId: "steak" });
    await inject("POST", `/tabs/${opened.id}/exit`);
    const event = (await waitFor("tab.settled", opened.id)).data as { explorerUrls: string[] };

    const tab = ((await inject("GET", "/state")).json() as { tabs: Tab[] }).tabs.find((t) => t.id === opened.id)!;
    expect(tab.settlement!.explorerUrls).toEqual(event.explorerUrls);
    expect(tab.settlement!.explorerUrls).toContain(`https://testnet.xrpl.org/transactions/${tab.settlement!.finishTxHash}`);
    expect(tab.escrow).toEqual(opened.escrow);
  });

  it("happy path over HTTP: member-N ids, top-level escrowSeq, and settlement timing pass through", async () => {
    const { mod, balances } = await contractLedger({ finishAfterMs: 300 });
    const { inject, waitFor } = await apiWith(adaptTeamLedger(mod));
    const tab = (await inject("POST", "/tabs", { memberId: "m1", seat: "Bar 3" })).json() as Tab;
    expect(mod.openTab).toHaveBeenCalledWith({ memberId: "member-1", allowance: "1000.00" });
    expect(tab.escrow.seq).toBeGreaterThan(4000);
    expect(balances["member-1"]).toBe("4000");
    for (const id of ["martini", "martini", "oysters", "fries", "espresso"]) await inject("POST", `/tabs/${tab.id}/items`, { menuItemId: id });
    await inject("POST", `/tabs/${tab.id}/exit`);
    const settledEvent = await waitFor("tab.settled", tab.id);

    expect(mod.settleTab).toHaveBeenCalledWith({ tab: { memberId: "member-1", escrowSeq: tab.escrow.seq, txHash: tab.escrow.txHash }, amount: "82.00", tipAmount: "16.40" });
    const settled = (await inject("GET", `/tabs/${tab.id}`)).json() as Tab;
    expect(settled.status).toBe("settled");
    expect(settled.settlement).toMatchObject({ toVenue: "98.40", toMember: "901.60", mode: "batch", batchTxHash: expect.stringMatching(/^[0-9A-F]{64}$/), elapsedMs: 4200 });
    expect(Date.parse(settled.settlement!.validatedAt!) - Date.parse(settled.settlement!.submittedAt!)).toBe(4200);
    expect((settledEvent.data as { settlement: Tab["settlement"] }).settlement).toMatchObject({ mode: "batch", submittedAt: expect.any(String), validatedAt: expect.any(String) });
    // Refund landed back with the member; outstanding dropped by what reached the venue.
    expect(balances["member-1"]).toBe("4901.6");
    expect((await inject("GET", "/metrics")).json().outstandingCents).toBe(34218000 - 9840);
  }, 20_000);

  it("anomaly path: $900 bottle held, manager approval settles with no refund (sequential)", async () => {
    const { createSettlementAgent } = await import("../../src/agent/settlementAgent.js");
    const { mod, balances } = await contractLedger();
    const { inject, waitFor } = await apiWith(adaptTeamLedger(mod), {}, createSettlementAgent(testConfig()));
    const tab = (await inject("POST", "/tabs", { memberId: "m5" })).json() as Tab;
    await inject("POST", `/tabs/${tab.id}/items`, { menuItemId: "bottle-900" });
    await inject("POST", `/tabs/${tab.id}/exit`);
    await waitFor("tab.held", tab.id);
    expect(mod.settleTab).not.toHaveBeenCalled();
    const approved = (await inject("POST", `/tabs/${tab.id}/approve`)).json() as Tab;
    expect(mod.settleTab).toHaveBeenCalledWith(expect.objectContaining({ tab: expect.objectContaining({ memberId: "member-5" }), amount: "900.00", tipAmount: "100.00" }));
    expect(approved.settlement).toMatchObject({ toVenue: "1000.00", toMember: "0.00", refundTxHash: null, mode: "sequential" });
    expect(balances["member-5"]).toBe("200");
  }, 20_000);

  it("INSUFFICIENT_FUNDS from the ledger holds the tab instead of failing silently", async () => {
    const { mod } = await contractLedger();
    // A ledger whose escrow is smaller than the backend believes (e.g. allowance changed on-chain).
    const ledger = adaptTeamLedger({ ...mod, settleTab: async (args) => mod.settleTab({ ...args, amount: "5000.00" }) });
    const { inject, waitFor } = await apiWith(ledger);
    const tab = (await inject("POST", "/tabs", { memberId: "m3" })).json() as Tab;
    await inject("POST", `/tabs/${tab.id}/items`, { menuItemId: "salmon" });
    await inject("POST", `/tabs/${tab.id}/exit`);
    await waitFor("tab.held", tab.id);
    const held = (await inject("GET", `/tabs/${tab.id}`)).json() as Tab;
    expect(held.hold!.reason).toMatch(/^Ledger error \(INSUFFICIENT_FUNDS\)/);
  }, 20_000);

  it("opening a tab the member cannot fund returns 402 with the ledger code", async () => {
    const { mod } = await contractLedger({ balances: { "member-1": "10", "member-2": "800", "member-3": "800", "member-4": "500", "member-5": "1200" } });
    const { inject } = await apiWith(adaptTeamLedger(mod));
    const res = await inject("POST", "/tabs", { memberId: "m1" });
    expect(res.statusCode).toBe(402);
    expect(res.json()).toMatchObject({ code: "INSUFFICIENT_FUNDS" });
  });

  it("a second settlement of the same escrow is ESCROW_NOT_FOUND (finished escrows are gone)", async () => {
    const { mod } = await contractLedger();
    const ledger = adaptTeamLedger(mod);
    const opened = await ledger.openTab({ memberId: "m2", allowance: "600.00" });
    const tab = { id: "tX", memberId: "m2", allowance: "600.00", escrow: { seq: opened.escrowSeq, txHash: opened.txHash, explorerUrl: null } } as Tab;
    await ledger.settleTab({ tab, amount: "10.00", tipAmount: "2.00" });
    await expect(ledger.settleTab({ tab, amount: "10.00", tipAmount: "2.00" })).rejects.toMatchObject({ code: "ESCROW_NOT_FOUND" });
  });

  it("manual close cancels the escrow with a full refund", async () => {
    const { mod, balances } = await contractLedger();
    const { inject } = await apiWith(adaptTeamLedger(mod));
    const tab = (await inject("POST", "/tabs", { memberId: "m2" })).json() as Tab;
    expect(balances["member-2"]).toBe("200");
    const closed = (await inject("POST", `/tabs/${tab.id}/close`)).json() as Tab;
    expect(closed.status).toBe("closed_manually");
    expect(mod.cancelTab).toHaveBeenCalledWith({ tab: { memberId: "member-2", escrowSeq: tab.escrow.seq, txHash: tab.escrow.txHash } });
    expect(balances["member-2"]).toBe("800");
  });

  it("dispute then reject returns the escrow", async () => {
    const { mod, balances } = await contractLedger();
    const { inject } = await apiWith(adaptTeamLedger(mod));
    const tab = (await inject("POST", "/tabs", { memberId: "m3" })).json() as Tab;
    await inject("POST", `/tabs/${tab.id}/items`, { menuItemId: "steak" });
    await inject("POST", `/tabs/${tab.id}/dispute`, { note: "not mine" });
    expect((await inject("POST", `/tabs/${tab.id}/reject`)).json().status).toBe("closed_manually");
    expect(balances["member-3"]).toBe("800");
  });

  it("/demo/reset cancels live escrows only (display-only seeded tabs are skipped)", async () => {
    const { mod } = await contractLedger();
    const { inject } = await apiWith(adaptTeamLedger(mod));
    await inject("POST", "/tabs", { memberId: "m2" });
    await inject("POST", "/tabs", { memberId: "m3" });
    await inject("POST", "/demo/reset");
    expect(mod.cancelTab).toHaveBeenCalledTimes(2);
    expect(mod.cancelTab.mock.calls.map((c) => c[0].tab.memberId).sort()).toEqual(["member-2", "member-3"]);
  });

  it("SEED_LIVE_ESCROWS=1 opens escrows for exactly m1's and m5's stage tabs", async () => {
    const { mod } = await contractLedger();
    const { built } = await apiWith(adaptTeamLedger(mod), { seedLiveEscrows: true });
    for (let i = 0; i < 40 && mod.openTab.mock.calls.length < 2; i++) await new Promise((r) => setTimeout(r, 25));
    expect(mod.openTab.mock.calls.map((c) => c[0])).toEqual([
      { memberId: "member-1", allowance: "1000.00" },
      { memberId: "member-5", allowance: "1000.00" },
    ]);
    const tabs = built.service.snapshot().tabs;
    expect(tabs.filter((t) => t.escrow.seq !== null).map((t) => t.id)).toEqual(["t1", "t5"]);
  });

  it("SEED_LIVE_ESCROWS=1: /demo/reset cancels the stage escrows and returns t1 and t5 with new ones", async () => {
    const { mod, balances } = await contractLedger();
    const { built, inject } = await apiWith(adaptTeamLedger(mod), { seedLiveEscrows: true });
    for (let i = 0; i < 40 && !built.service.getTab("t5").escrow.txHash; i++) await new Promise((r) => setTimeout(r, 25));
    const booted = built.service.snapshot().tabs.filter((t) => t.escrow.seq !== null).map((t) => t.escrow.seq);
    const state = (await inject("POST", "/demo/reset")).json() as { tabs: Tab[] };
    expect(mod.cancelTab.mock.calls.map((c) => c[0].tab.escrowSeq)).toEqual(booted);
    const live = state.tabs.filter((t) => t.escrow.seq !== null);
    expect(live.map((t) => t.id)).toEqual(["t1", "t5"]);
    expect(live.map((t) => t.escrow.seq)).not.toEqual(booted);
    expect(balances).toMatchObject({ "member-1": "4000", "member-5": "200" });
  });

  it("seeded stage tabs with live escrows settle through the ledger", async () => {
    const { mod } = await contractLedger();
    const { built, inject, waitFor } = await apiWith(adaptTeamLedger(mod), { seedLiveEscrows: true });
    for (let i = 0; i < 40 && !built.service.getTab("t1").escrow.txHash; i++) await new Promise((r) => setTimeout(r, 25));
    await inject("POST", "/tabs/t1/exit");
    await waitFor("tab.settled", "t1");
    expect(mod.settleTab.mock.calls[0][0].tab).toEqual({ memberId: "member-1", escrowSeq: built.service.getTab("t1").escrow.seq, txHash: built.service.getTab("t1").escrow.txHash });
  });

  it("display-only seeded tabs hold with ESCROW_NOT_FOUND instead of calling the ledger", async () => {
    const { mod } = await contractLedger();
    const { inject, waitFor } = await apiWith(adaptTeamLedger(mod));
    await inject("POST", "/tabs/t2/exit");
    await waitFor("tab.held", "t2");
    expect((await inject("GET", "/tabs/t2")).json().hold).toMatchObject({ source: "ledger", code: "ESCROW_NOT_FOUND" });
    expect(mod.settleTab).not.toHaveBeenCalled();
  });

  it("getBalances maps member-N back to the API's member ids", async () => {
    const { mod } = await contractLedger();
    const balances = await adaptTeamLedger(mod).getBalances();
    expect(Object.keys(balances.members).sort()).toEqual(["m1", "m2", "m3", "m4", "m5"]);
    expect(balances.members.m5).toBe("1200");
  });
});

describe("HTTP status mapping for ledger error codes", () => {
  it.each([
    ["INVALID_INPUT", 400],
    ["INSUFFICIENT_FUNDS", 402],
    ["ESCROW_NOT_FOUND", 409],
    ["LEDGER_REJECTED", 502],
    ["LEDGER_TIMEOUT", 504],
  ])("%s -> %i on POST /tabs", async (code, status) => {
    const { LedgerError } = await importLedger();
    const { mod } = await contractLedger();
    const { inject } = await apiWith(adaptTeamLedger({ ...mod, openTab: async () => Promise.reject(new LedgerError(code, `boom ${code}`)) }));
    const res = await inject("POST", "/tabs", { memberId: "m2" });
    expect(res.statusCode).toBe(status);
    expect(res.json()).toEqual({ error: `boom ${code}`, code });
  });
});
