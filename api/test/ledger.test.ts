import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { ledgerErrorCode, loadLedger } from "../src/ledger/index.js";
import { createStubLedger } from "../src/ledger/stub.js";
import type { Tab } from "../src/types.js";
import { testConfig } from "./helpers.js";

const tab = (overrides: Partial<Tab> = {}): Tab => ({
  id: "t1",
  memberId: "m1",
  memberName: "A",
  seat: "Bar",
  status: "reconciling",
  items: [],
  totalCents: 0,
  tipCents: 0,
  allowance: "500.00",
  escrow: { seq: 7, txHash: "H", explorerUrl: null },
  settlement: null,
  hold: null,
  graceEndsAt: null,
  openedAt: "",
  mandate: null,
  ap4m: null,
  ...overrides,
});

describe("stub ledger (contract-identical)", () => {
  it("openTab returns a 64-char hash, a sequence, an explorer URL and a ledger index", async () => {
    const ledger = createStubLedger(0, { m1: "1000.00" });
    const result = await ledger.openTab({ memberId: "m1", allowance: "500.00" });
    expect(result.txHash).toMatch(/^[0-9A-F]{64}$/);
    expect(result.explorerUrl).toBe(`https://testnet.xrpl.org/transactions/${result.txHash}`);
    expect(result.escrowSeq).toBeGreaterThan(0);
    expect(result.ledgerIndex).toBeGreaterThan(0);
  });

  it("issues increasing escrow sequences and unique hashes", async () => {
    const ledger = createStubLedger(0, { m1: "5000.00" });
    const a = await ledger.openTab({ memberId: "m1", allowance: "100.00" });
    const b = await ledger.openTab({ memberId: "m1", allowance: "100.00" });
    expect(b.escrowSeq).toBeGreaterThan(a.escrowSeq);
    expect(b.txHash).not.toBe(a.txHash);
  });

  it("fails with INSUFFICIENT_FUNDS when the member cannot cover the allowance", async () => {
    const ledger = createStubLedger(0, { m1: "100.00" });
    await expect(ledger.openTab({ memberId: "m1", allowance: "500.00" })).rejects.toMatchObject({ code: "INSUFFICIENT_FUNDS" });
  });

  it("locks the allowance out of the member balance while the tab is open", async () => {
    const ledger = createStubLedger(0, { m1: "1000.00" });
    await ledger.openTab({ memberId: "m1", allowance: "600.00" });
    expect((await ledger.getBalances()).members.m1).toBe("400.00");
  });

  it("settleTab sends the amount to the venue and refunds the remainder", async () => {
    const ledger = createStubLedger(0, { m1: "1000.00" });
    const result = await ledger.settleTab({ tab: tab(), amount: "127.20", tipAmount: "21.20" });
    expect(result).toMatchObject({ toVenue: "127.20", toMember: "372.80" });
    expect(result.finishTxHash).toMatch(/^[0-9A-F]{64}$/);
    expect(result.refundTxHash).toMatch(/^[0-9A-F]{64}$/);
    expect(result.explorerUrls).toHaveLength(2);
    const balances = await ledger.getBalances();
    expect(balances.venue).toBe("127.20");
    expect(balances.members.m1).toBe("1372.80");
  });

  it("has no refund transaction when the whole allowance is spent", async () => {
    const ledger = createStubLedger(0, {});
    const result = await ledger.settleTab({ tab: tab(), amount: "500.00", tipAmount: "0.00" });
    expect(result.toMember).toBe("0.00");
    expect(result.refundTxHash).toBeNull();
    expect(result.explorerUrls).toHaveLength(1);
  });

  it("never releases more than the allowance", async () => {
    const ledger = createStubLedger(0, {});
    const result = await ledger.settleTab({ tab: tab(), amount: "900.00", tipAmount: "0.00" });
    expect(result.toVenue).toBe("500.00");
  });

  it("fails with ESCROW_NOT_FOUND for a tab without an escrow", async () => {
    const ledger = createStubLedger(0, {});
    await expect(
      ledger.settleTab({ tab: tab({ escrow: { seq: null, txHash: null, explorerUrl: null } }), amount: "1.00", tipAmount: "0.00" }),
    ).rejects.toMatchObject({ code: "ESCROW_NOT_FOUND" });
  });

  it("cancelTab returns the allowance to the member", async () => {
    const ledger = createStubLedger(0, { m1: "1000.00" });
    await ledger.openTab({ memberId: "m1", allowance: "500.00" });
    const { txHash } = await ledger.cancelTab({ tab: tab() });
    expect(txHash).toMatch(/^[0-9A-F]{64}$/);
    expect((await ledger.getBalances()).members.m1).toBe("1000.00");
  });

  it("reports elapsed time of at least the configured delay", async () => {
    const ledger = createStubLedger(30, {});
    const result = await ledger.settleTab({ tab: tab(), amount: "1.00", tipAmount: "0.00" });
    expect(result.elapsedMs).toBeGreaterThanOrEqual(25);
  });
});

describe("loadLedger", () => {
  const writeModule = (source: string) => {
    const dir = mkdtempSync(path.join(tmpdir(), "settle-ledger-"));
    const file = path.join(dir, "index.mjs");
    writeFileSync(file, source);
    return file;
  };

  it("returns the stub by default", async () => {
    const ledger = await loadLedger(testConfig({ ledgerStubDelayMs: 0 }));
    const result = await ledger.openTab({ memberId: "m1", allowance: "100.00" });
    expect(result.txHash).toMatch(/^[0-9A-F]{64}$/);
  });

  it("imports a module with named exports", async () => {
    const file = writeModule(`
      export async function openTab() { return { escrowSeq: 42, txHash: "REAL", explorerUrl: "u", ledgerIndex: 1 }; }
      export async function settleTab() { return {}; }
      export async function cancelTab() { return { txHash: "C" }; }
      export async function getBalances() { return { venue: "0", members: {} }; }
    `);
    const ledger = await loadLedger(testConfig({ ledgerMode: "module", ledgerModule: file }));
    expect((await ledger.openTab({ memberId: "m1", allowance: "1.00" })).escrowSeq).toBe(42);
  });

  it("imports a module with a default export object", async () => {
    const file = writeModule(`
      export default {
        openTab: async () => ({ escrowSeq: 7, txHash: "D", explorerUrl: "u", ledgerIndex: 1 }),
        settleTab: async () => ({}), cancelTab: async () => ({ txHash: "C" }), getBalances: async () => ({}),
      };
    `);
    const ledger = await loadLedger(testConfig({ ledgerMode: "module", ledgerModule: file }));
    expect((await ledger.openTab({ memberId: "m1", allowance: "1.00" })).txHash).toBe("D");
  });

  it("refuses a module that is missing part of the contract", async () => {
    const file = writeModule(`export async function openTab() {} export async function settleTab() {}`);
    await expect(loadLedger(testConfig({ ledgerMode: "module", ledgerModule: file }))).rejects.toThrow(/missing cancelTab\(\)/);
  });

  it("fails loudly when the module path does not exist", async () => {
    await expect(loadLedger(testConfig({ ledgerMode: "module", ledgerModule: "/nope/ledger.js" }))).rejects.toThrow();
  });
});

describe("ledgerErrorCode", () => {
  it("reads the contract error code", () => {
    expect(ledgerErrorCode(Object.assign(new Error("x"), { code: "LEDGER_TIMEOUT" }))).toBe("LEDGER_TIMEOUT");
  });

  it("falls back to LEDGER_ERROR", () => {
    expect(ledgerErrorCode(new Error("x"))).toBe("LEDGER_ERROR");
    expect(ledgerErrorCode(undefined)).toBe("LEDGER_ERROR");
  });
});
