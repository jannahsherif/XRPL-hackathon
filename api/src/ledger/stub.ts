import { randomBytes } from "node:crypto";

import { centsToDecimal, decimalToCents } from "../money.js";
import type { Ledger, Tab } from "../types.js";

const EXPLORER = "https://testnet.xrpl.org/transactions";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const fakeHash = () => randomBytes(32).toString("hex").toUpperCase();

/**
 * Stand-in for Alex's ledger module with the same contract: returns fake
 * hashes after a delay so B1-B8 are testable before L4 lands.
 */
export function createStubLedger(delayMs: number, members: Record<string, string>): Ledger {
  const balances = new Map(Object.entries(members).map(([id, bal]) => [id, decimalToCents(bal)]));
  let venueCents = 0;
  let seq = 1000;

  return {
    async openTab({ memberId, allowance }) {
      await sleep(delayMs);
      const cents = decimalToCents(allowance);
      const balance = balances.get(memberId) ?? 0;
      if (balance < cents) throw Object.assign(new Error("Member balance below allowance"), { code: "INSUFFICIENT_FUNDS" });
      balances.set(memberId, balance - cents);
      const txHash = fakeHash();
      return { escrowSeq: ++seq, txHash, explorerUrl: `${EXPLORER}/${txHash}`, ledgerIndex: 9_000_000 + seq };
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
      const finishTxHash = fakeHash();
      const refundTxHash = toMember > 0 ? fakeHash() : null;
      return {
        finishTxHash,
        refundTxHash,
        toVenue: centsToDecimal(toVenue),
        toMember: centsToDecimal(toMember),
        elapsedMs: Date.now() - started,
        explorerUrls: [finishTxHash, refundTxHash].filter(Boolean).map((h) => `${EXPLORER}/${h}`),
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
      };
    },
  };
}
