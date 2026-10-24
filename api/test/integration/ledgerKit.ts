/**
 * Shared helpers for the ledger <-> backend integration tests. These load the
 * team's real ledger package (../../ledger) so the tests exercise Alex's code,
 * not a re-implementation of it.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { vi } from "vitest";

import { centsToDecimal } from "../../src/money.js";
import type { TeamLedgerModule, TeamLedgerTab } from "../../src/ledger/teamLedger.js";

export const LEDGER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../ledger");
export const LEDGER_ENTRY = path.join(LEDGER_DIR, "src/index.ts");
export const ACCOUNTS = JSON.parse(readFileSync(path.join(LEDGER_DIR, "accounts.json"), "utf8")) as {
  issuer: string;
  venue: string;
  members: Record<string, string>;
};

/** The real ledger package entry point (index.ts: createLedger, LedgerError, top-level functions). */
export async function importLedger() {
  return (await import(pathToFileURL(LEDGER_ENTRY).href)) as {
    createLedger: (config?: Record<string, unknown>) => TeamLedgerModule & { close(): Promise<void> | void; token: unknown };
    LedgerError: new (code: string, message: string) => Error & { code: string };
    openTab: TeamLedgerModule["openTab"];
    settleTab: TeamLedgerModule["settleTab"];
    cancelTab: TeamLedgerModule["cancelTab"];
    getBalances: TeamLedgerModule["getBalances"];
  };
}

/** The real amount math from ledger/src/amounts.ts. */
export async function importAmounts() {
  return (await import(pathToFileURL(path.join(LEDGER_DIR, "src/amounts.ts")).href)) as {
    refundFor(allowance: string, amount: string, tipAmount: string): string;
    sub(a: string, b: string): string;
    add(a: string, b: string): string;
    assertAmount(value: unknown, field: string, opts?: { positive?: boolean }): string;
  };
}

/** xrpl.js as the ledger package resolves it (the API itself does not depend on xrpl). */
export function ledgerRequire() {
  return createRequire(path.join(LEDGER_DIR, "package.json"));
}

/**
 * A throwaway ledger config: fresh wallets for venue + member-1..5 in a temp
 * .env and accounts.json, pointed at an unreachable node. Everything the
 * ledger validates before touching the network runs for real.
 */
export function offlineLedgerConfig() {
  const { Wallet } = ledgerRequire()("xrpl") as { Wallet: { generate(): { address: string; seed: string } } };
  const dir = mkdtempSync(path.join(tmpdir(), "settle-ledger-it-"));
  const roles = ["venue", "member-1", "member-2", "member-3", "member-4", "member-5"];
  const wallets = Object.fromEntries(roles.map((r) => [r, Wallet.generate()]));
  const issuer = Wallet.generate();
  const accounts = {
    network: "testnet",
    issuer: issuer.address,
    venue: wallets.venue.address,
    members: Object.fromEntries(roles.slice(1).map((r) => [r, wallets[r].address])),
  };
  const envKey = (role: string) => `${role.replace("-", "_").toUpperCase()}_SEED`;
  writeFileSync(path.join(dir, "accounts.json"), JSON.stringify(accounts));
  writeFileSync(path.join(dir, ".env"), roles.map((r) => `${envKey(r)}=${wallets[r].seed}`).join("\n") + "\n");
  return {
    envPath: path.join(dir, ".env"),
    accountsPath: path.join(dir, "accounts.json"),
    wsUrl: "ws://127.0.0.1:9", // nothing listens here
    timeoutMs: 1500,
    log: () => {},
  };
}

/**
 * A ledger module with Alex's exact contract, built on his real amount code and
 * LedgerError: top-level { memberId, escrowSeq } tabs, member-N ids from the
 * committed accounts.json, amount excludes the tip, INSUFFICIENT_FUNDS past the
 * allowance, ESCROW_NOT_FOUND once finished, settlement timing + mode.
 */
export async function contractLedger(opts: { balances?: Record<string, string>; finishAfterMs?: number; batch?: boolean } = {}) {
  const { LedgerError } = await importLedger();
  const { refundFor, sub, add, assertAmount } = await importAmounts();
  const balances: Record<string, string> = { ...(opts.balances ?? { "member-1": "5000", "member-2": "800", "member-3": "800", "member-4": "500", "member-5": "1200" }) };
  let venue = "0";
  let seq = 4000;
  let n = 0;
  const hash = () => (++n).toString(16).toUpperCase().padStart(64, "0");
  const escrows = new Map<number, { memberId: string; allowance: string; openedAt: number; open: boolean }>();

  const member = (memberId: string) => {
    if (!ACCOUNTS.members[memberId]) throw new LedgerError("INVALID_INPUT", `unknown memberId ${JSON.stringify(memberId)}`);
    return memberId;
  };
  const escrowFor = (tab: TeamLedgerTab) => {
    member(tab.memberId);
    if (typeof tab.escrowSeq !== "number" || !Number.isSafeInteger(tab.escrowSeq) || tab.escrowSeq <= 0) {
      throw new LedgerError("INVALID_INPUT", `escrowSeq must be a positive integer, got ${JSON.stringify(tab.escrowSeq)}`);
    }
    const escrow = escrows.get(tab.escrowSeq);
    if (!escrow || !escrow.open || escrow.memberId !== tab.memberId) {
      throw new LedgerError("ESCROW_NOT_FOUND", `no open escrow ${tab.escrowSeq} for ${tab.memberId}`);
    }
    return escrow;
  };

  const mod = {
    openTab: vi.fn(async ({ memberId, allowance }: { memberId: string; allowance: string }) => {
      member(memberId);
      assertAmount(allowance, "allowance", { positive: true });
      if (Number(balances[memberId]) < Number(allowance)) throw new LedgerError("INSUFFICIENT_FUNDS", "EscrowCreate failed: tecUNFUNDED");
      balances[memberId] = sub(balances[memberId], allowance);
      const escrowSeq = ++seq;
      escrows.set(escrowSeq, { memberId, allowance, openedAt: Date.now(), open: true });
      const txHash = hash();
      const now = new Date().toISOString();
      return { escrowSeq, txHash, explorerUrl: `https://testnet.xrpl.org/transactions/${txHash}`, ledgerIndex: 9_000_000 + escrowSeq, submittedAt: now, validatedAt: now };
    }),
    settleTab: vi.fn(async ({ tab, amount, tipAmount }: { tab: TeamLedgerTab; amount: string; tipAmount: string }) => {
      assertAmount(amount, "amount");
      assertAmount(tipAmount, "tipAmount");
      const escrow = escrowFor(tab);
      const toMember = refundFor(escrow.allowance, amount, tipAmount); // throws INSUFFICIENT_FUNDS past the allowance
      const toVenue = sub(escrow.allowance, toMember);
      const wait = escrow.openedAt + (opts.finishAfterMs ?? 0) - Date.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait)); // EscrowFinish waits for FinishAfter
      const submittedAt = new Date();
      escrow.open = false;
      venue = add(venue, toVenue);
      balances[tab.memberId] = add(balances[tab.memberId], toMember);
      const finishTxHash = hash();
      const refundTxHash = Number(toMember) > 0 ? hash() : null;
      const batch = opts.batch !== false && refundTxHash !== null;
      const validatedAt = new Date(submittedAt.getTime() + 4200);
      return {
        finishTxHash,
        refundTxHash,
        mode: batch ? ("batch" as const) : ("sequential" as const),
        ...(batch ? { batchTxHash: hash() } : {}),
        toVenue,
        toMember,
        submittedAt: submittedAt.toISOString(),
        validatedAt: validatedAt.toISOString(),
        elapsedMs: 4200,
        explorerUrls: [finishTxHash, refundTxHash].filter(Boolean).map((h) => `https://testnet.xrpl.org/transactions/${h}`),
      };
    }),
    cancelTab: vi.fn(async ({ tab }: { tab: TeamLedgerTab }) => {
      const escrow = escrowFor(tab);
      escrow.open = false;
      balances[tab.memberId] = add(balances[tab.memberId], escrow.allowance);
      const txHash = hash();
      return { txHash, explorerUrl: `https://testnet.xrpl.org/transactions/${txHash}`, via: "refund" as const };
    }),
    getBalances: vi.fn(async () => ({ venue, members: { ...balances } })),
  };
  return { mod, balances, venue: () => venue, escrows };
}

export const usd = (cents: number) => centsToDecimal(cents);
