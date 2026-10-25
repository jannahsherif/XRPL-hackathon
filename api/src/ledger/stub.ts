import { randomBytes } from "node:crypto";

import { centsToDecimal, decimalToCents } from "../money.js";
import type { Ledger, Tab } from "../types.js";

const EXPLORER = "https://testnet.xrpl.org/transactions";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const fakeHash = () => randomBytes(32).toString("hex").toUpperCase();

/** Real testnet transactions to hand out instead of random hashes (ledger/fixtures/happy-path.json). */
export interface ReplayFixture {
  openTab: { txHash: string; explorerUrl?: string; ledgerIndex?: number };
  settleTab: { finishTxHash: string; refundTxHash: string | null; explorerUrls?: string[] };
}

/**
 * Stand-in for Alex's ledger module with the same contract: returns fake
 * hashes after a delay so B1-B8 are testable before L4 lands. With a replay
 * fixture it returns that run's real hashes, so explorer links resolve; the
 * amounts are still the stub's own.
 */
export function createStubLedger(delayMs: number, members: Record<string, string>, fixture?: ReplayFixture): Ledger {
  const balances = new Map(Object.entries(members).map(([id, bal]) => [id, decimalToCents(bal)]));
  // Like the testnet accounts: every funded member holds a CLUB_MEMBER credential, nobody else does.
  const credentialed = new Set(balances.keys());
  let venueCents = 0;
  let seq = 1000;
  const urlFor = (hash: string, known: string[] = []) => known.find((u) => u.includes(hash)) ?? `${EXPLORER}/${hash}`;

  return {
    async openTab({ memberId, allowance }) {
      await sleep(delayMs);
      if (!credentialed.has(memberId)) throw Object.assign(new Error("member is not credentialed"), { code: "INVALID_INPUT" });
      const cents = decimalToCents(allowance);
      const balance = balances.get(memberId) ?? 0;
      if (balance < cents) throw Object.assign(new Error("Member balance below allowance"), { code: "INSUFFICIENT_FUNDS" });
      balances.set(memberId, balance - cents);
      const txHash = fixture?.openTab.txHash ?? fakeHash();
      seq++;
      const explorerUrl = urlFor(txHash, fixture?.openTab.explorerUrl ? [fixture.openTab.explorerUrl] : []);
      return { escrowSeq: seq, txHash, explorerUrl, ledgerIndex: fixture?.openTab.ledgerIndex ?? 9_000_000 + seq };
    },

    async settleTab({ tab, amount, tipAmount }) {
      const started = Date.now();
      const submittedAt = new Date(started).toISOString();
      await sleep(delayMs);
      if (!tab.escrow.seq) throw Object.assign(new Error("No escrow for tab"), { code: "ESCROW_NOT_FOUND" });
      const allowance = decimalToCents(tab.allowance);
      // Same contract as ledger/: amount excludes the tip; refund = allowance - amount - tip.
      const toVenue = decimalToCents(amount) + decimalToCents(tipAmount);
      if (toVenue > allowance) {
        throw Object.assign(new Error(`amount ${amount} + tip ${tipAmount} exceeds the escrowed allowance ${tab.allowance}`), { code: "INSUFFICIENT_FUNDS" });
      }
      const toMember = allowance - toVenue;
      venueCents += toVenue;
      balances.set(tab.memberId, (balances.get(tab.memberId) ?? 0) + toMember);
      const finishTxHash = fixture?.settleTab.finishTxHash ?? fakeHash();
      const refundTxHash = toMember > 0 ? (fixture?.settleTab.refundTxHash ?? fakeHash()) : null;
      return {
        finishTxHash,
        refundTxHash,
        toVenue: centsToDecimal(toVenue),
        toMember: centsToDecimal(toMember),
        elapsedMs: Date.now() - started,
        explorerUrls: [finishTxHash, refundTxHash].filter((h): h is string => Boolean(h)).map((h) => urlFor(h, fixture?.settleTab.explorerUrls)),
        submittedAt,
        validatedAt: new Date().toISOString(),
        mode: "sequential",
      };
    },

    async cancelTab({ tab }: { tab: Tab }) {
      await sleep(Math.min(delayMs, 1000));
      balances.set(tab.memberId, (balances.get(tab.memberId) ?? 0) + decimalToCents(tab.allowance));
      return { txHash: fakeHash() };
    },

    async getBalances() {
      return {
        venue: centsToDecimal(venueCents),
        members: Object.fromEntries([...balances].map(([id, cents]) => [id, centsToDecimal(cents)])),
        credentialed: Object.fromEntries([...credentialed].map((id) => [id, true])),
      };
    },
  };
}
