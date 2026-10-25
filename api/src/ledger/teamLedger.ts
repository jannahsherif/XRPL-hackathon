import type { Ledger, OpenTabResult, SettleTabResult, Tab } from "../types.js";

/**
 * Alex's ledger module (ledger/src/index.ts) as it is actually called. It differs
 * from the backend's Tab-shaped interface in three ways this adapter absorbs:
 *
 *  - member ids: the ledger knows member-1..member-5, the backend m1..m5
 *  - tabs: the ledger reads a top-level { memberId, escrowSeq }; our Tab keeps it in tab.escrow.seq
 *  - settlement: the ledger also returns submittedAt / validatedAt / mode / batchTxHash
 */
export interface TeamLedgerTab {
  memberId: string;
  escrowSeq: number;
  txHash?: string;
}

export interface TeamLedgerModule {
  openTab(args: { memberId: string; allowance: string }): Promise<OpenTabResult>;
  settleTab(args: { tab: TeamLedgerTab; amount: string; tipAmount: string }): Promise<SettleTabResult>;
  cancelTab(args: { tab: TeamLedgerTab }): Promise<{ txHash: string }>;
  getBalances(): Promise<{ venue: string; members: Record<string, string>; credentialed?: Record<string, boolean> }>;
}

/** m1 -> member-1. Anything else passes through unchanged. */
export function toLedgerMemberId(memberId: string): string {
  const m = /^m(\d+)$/.exec(memberId);
  return m ? `member-${m[1]}` : memberId;
}

/** member-1 -> m1. Anything else passes through unchanged. */
export function fromLedgerMemberId(memberId: string): string {
  const m = /^member-(\d+)$/.exec(memberId);
  return m ? `m${m[1]}` : memberId;
}

function ledgerTab(tab: Tab): TeamLedgerTab {
  if (!tab.escrow.seq) {
    // Display-only seeded tabs have no escrow; the ledger would have nothing to finish.
    throw Object.assign(new Error(`Tab ${tab.id} has no escrow on the ledger`), { code: "ESCROW_NOT_FOUND" });
  }
  return { memberId: toLedgerMemberId(tab.memberId), escrowSeq: tab.escrow.seq, ...(tab.escrow.txHash ? { txHash: tab.escrow.txHash } : {}) };
}

export function adaptTeamLedger(mod: TeamLedgerModule): Ledger {
  return {
    // async so a bad tab always rejects (never throws synchronously into Promise.allSettled callers).
    openTab: async ({ memberId, allowance }) => mod.openTab({ memberId: toLedgerMemberId(memberId), allowance }),
    settleTab: async ({ tab, amount, tipAmount }) => mod.settleTab({ tab: ledgerTab(tab), amount, tipAmount }),
    cancelTab: async ({ tab }) => mod.cancelTab({ tab: ledgerTab(tab) }),
    async getBalances() {
      const { venue, members, credentialed } = await mod.getBalances();
      const byApiId = <T>(map: Record<string, T>) => Object.fromEntries(Object.entries(map).map(([id, v]) => [fromLedgerMemberId(id), v]));
      return { venue, members: byApiId(members), ...(credentialed ? { credentialed: byApiId(credentialed) } : {}) };
    },
  };
}
