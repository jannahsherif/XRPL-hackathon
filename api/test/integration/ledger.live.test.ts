/**
 * Ledger <-> backend integration against the REAL XRPL testnet (opt-in).
 *
 *   cd ledger && npm install            # once
 *   cp <Alex's .env> ledger/.env        # testnet seeds, never commit
 *   cd api && npm run test:ledger-live
 *
 * Runs the API with LEDGER_MODE=module and LEDGER_MODULE=../ledger/src/index.ts,
 * then drives tabs over HTTP: real EscrowCreate, EscrowFinish (+ refund Payment,
 * batched when possible) and cancel, checked against on-chain balances.
 * Each test takes 20-40 s (validation, plus FinishAfter ~5-15 s after open).
 * Afterwards, `npm run demo:reset` in ledger/ restores balances.
 */
import { existsSync } from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "../../src/app.js";
import type { SettleEvent, Tab } from "../../src/types.js";
import { testConfig } from "../helpers.js";
import { LEDGER_DIR, LEDGER_ENTRY } from "./ledgerKit.js";

const LIVE = process.env.LEDGER_LIVE === "1" && existsSync(path.join(LEDGER_DIR, ".env"));
const FINISH_AFTER_MARGIN_MS = 16_000; // FinishAfter = open + 5 s, close times round to 10 s
const HASH = /^[0-9A-F]{64}$/;

describe.skipIf(!LIVE)("ledger module on XRPL testnet, driven through the API", () => {
  let built: Awaited<ReturnType<typeof buildApp>>;
  const events: SettleEvent[] = [];
  const inject = (method: "GET" | "POST", url: string, payload?: object) => built.app.inject({ method, url, payload });
  const balances = async () => (await inject("GET", "/balances")).json() as { venue: string; members: Record<string, string> };

  const waitFor = async (type: string, tabId: string, timeoutMs = 90_000) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const hit = events.find((e) => e.type === type && JSON.stringify(e.data).includes(`"${tabId}"`));
      if (hit) return hit;
      await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error(`timed out waiting for ${type} on ${tabId}`);
  };

  async function openTab(memberId: string, items: string[]) {
    const res = await inject("POST", "/tabs", { memberId });
    expect(res.statusCode, res.body).toBe(201);
    const tab = res.json() as Tab;
    const openedAt = Date.now();
    for (const menuItemId of items) await inject("POST", `/tabs/${tab.id}/items`, { menuItemId });
    return { tab, openedAt };
  }

  /** Don't exit before FinishAfter has passed on a validated ledger (Alex: >= 15 s after open). */
  const waitFinishAfter = async (openedAt: number) => {
    const wait = openedAt + FINISH_AFTER_MARGIN_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  };

  beforeAll(async () => {
    built = await buildApp(
      testConfig({ ledgerMode: "module", ledgerModule: path.relative(process.cwd(), LEDGER_ENTRY), graceSeconds: 3, agentMode: "local", intentMode: "off" }),
    );
    built.app.log.level = "warn";
    built.bus.subscribe((e) => events.push(e));
  });

  afterAll(async () => {
    await built?.app.close();
  });

  it("happy path: EscrowCreate -> items -> exit -> EscrowFinish + refund, balances move by exactly the tab", async () => {
    const before = await balances();
    const { tab, openedAt } = await openTab("m2", ["steak", "martini", "martini"]); // $106.00, allowance $600
    expect(tab.escrow.seq).toBeGreaterThan(0);
    expect(tab.escrow.txHash).toMatch(HASH);
    expect(tab.escrow.explorerUrl).toMatch(/^https:\/\/testnet\.xrpl\.org\/transactions\//);

    await waitFinishAfter(openedAt);
    await inject("POST", `/tabs/${tab.id}/exit`);
    await waitFor("tab.settled", tab.id);
    const settled = (await inject("GET", `/tabs/${tab.id}`)).json() as Tab;
    const s = settled.settlement!;

    expect(settled.status).toBe("settled");
    expect(s.finishTxHash).toMatch(HASH);
    expect(s.refundTxHash).toMatch(HASH);
    expect(["batch", "sequential"]).toContain(s.mode);
    if (s.mode === "batch") expect(s.batchTxHash).toMatch(HASH);
    expect(Number(s.toVenue)).toBeCloseTo(127.2, 2); // 106.00 + 20% tip
    expect(Number(s.toMember)).toBeCloseTo(472.8, 2);
    expect(Date.parse(s.validatedAt!)).toBeGreaterThan(Date.parse(s.submittedAt!));
    expect(s.elapsedMs).toBeGreaterThan(0);

    const after = await balances();
    expect(Number(after.members.m2) - Number(before.members.m2)).toBeCloseTo(-127.2, 2);
    expect(Number(after.venue) - Number(before.venue)).toBeCloseTo(127.2, 2);
  }, 180_000);

  it("anomaly path: $900 bottle is held off-ledger, approval settles the full allowance with no refund", async () => {
    const { tab, openedAt } = await openTab("m5", ["bottle-900"]); // allowance $1,000
    await waitFinishAfter(openedAt);
    await inject("POST", `/tabs/${tab.id}/exit`);
    await waitFor("tab.held", tab.id);
    expect(events.some((e) => e.type === "tab.settled" && JSON.stringify(e.data).includes(`"${tab.id}"`))).toBe(false);

    const approved = await inject("POST", `/tabs/${tab.id}/approve`);
    expect(approved.statusCode, approved.body).toBe(200);
    const s = (approved.json() as Tab).settlement!;
    expect(Number(s.toVenue)).toBeCloseTo(1000, 2); // 900 + tip trimmed to fit the escrow
    expect(Number(s.toMember)).toBe(0);
    expect(s.refundTxHash).toBeNull();
    expect(s.mode).toBe("sequential");
  }, 180_000);

  it("manual close returns the full allowance (refund before expiry)", async () => {
    const before = await balances();
    const { tab, openedAt } = await openTab("m3", []);
    const during = await balances();
    expect(Number(during.members.m3) - Number(before.members.m3)).toBeCloseTo(-600, 2); // locked in escrow
    await waitFinishAfter(openedAt);
    const closed = await inject("POST", `/tabs/${tab.id}/close`);
    expect(closed.statusCode, closed.body).toBe(200);
    expect((closed.json() as Tab).status).toBe("closed_manually");
    const after = await balances();
    expect(Number(after.members.m3)).toBeCloseTo(Number(before.members.m3), 2);
  }, 180_000);

  it("the ledger's INSUFFICIENT_FUNDS reaches the client as 402", async () => {
    // member-4 holds 500; two $300 allowances cannot both be escrowed.
    const first = await openTab("m4", []);
    const second = await inject("POST", "/tabs", { memberId: "m4" });
    expect(second.statusCode).toBe(402);
    expect(second.json()).toMatchObject({ code: "INSUFFICIENT_FUNDS" });
    await waitFinishAfter(first.openedAt);
    await inject("POST", `/tabs/${first.tab.id}/close`);
  }, 180_000);
});

describe.skipIf(LIVE)("ledger live suite", () => {
  it("is skipped: set LEDGER_LIVE=1 and provide ledger/.env to run it against XRPL testnet", () => {
    expect(LIVE).toBe(false);
  });
});
