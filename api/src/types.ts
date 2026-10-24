// Shapes from the frozen interface contract (Settle Engineering Plan).
// Change only after telling all three engineers in the group chat.

export type TabStatus =
  | "open"
  | "ordering"
  | "exit_detected"
  | "grace"
  | "reconciling"
  | "settled"
  | "held"
  | "closed_manually";

export interface TabItem {
  name: string;
  qty: number;
  priceCents: number;
}

export interface Escrow {
  seq: number | null;
  txHash: string | null;
  explorerUrl: string | null;
}

export interface Settlement {
  finishTxHash: string;
  refundTxHash: string | null;
  toVenue: string;
  toMember: string;
  elapsedMs: number;
}

export interface Hold {
  reason: string;
  triggeredAt: string;
}

export interface Tab {
  id: string;
  memberId: string;
  memberName: string;
  seat: string;
  status: TabStatus;
  items: TabItem[];
  totalCents: number;
  tipCents: number;
  /** Escrowed allowance as a decimal string in token units, e.g. "500.00" (same units as the ledger). */
  allowance: string;
  escrow: Escrow;
  settlement: Settlement | null;
  hold: Hold | null;
  graceEndsAt: string | null;
  openedAt: string;
}

export interface Member {
  id: string;
  name: string;
  tier: "standard" | "premier" | "founder";
  allowance: string;
  typicalSpendCents: number;
  history: { date: string; totalCents: number }[];
}

export interface MenuItem {
  id: string;
  name: string;
  priceCents: number;
  category: "food" | "drink" | "bottle";
}

export interface Policy {
  graceSeconds: number;
  defaultTipPct: number;
  holdIfTotalOverTypicalX: number;
  holdIfItemOverAllowance: boolean;
  splitBySeat: boolean;
}

export interface Metrics {
  outstandingCents: number;
  openTabs: number;
  settledCount: number;
  avgSettleMs: number;
}

export type AgentAction = "settle" | "split" | "hold";

export interface AgentDecision {
  action: AgentAction;
  tipPct: number;
  reason: string;
  /** "rules" when a hard rule decided before the model, "agent" when the LLM decided, "fallback" when the LLM was unavailable. */
  source: "rules" | "agent" | "fallback";
}

export type EventType =
  | "tab.opened"
  | "tab.item_added"
  | "tab.exit_detected"
  | "member.push"
  | "tab.grace_tick"
  | "agent.decision"
  | "tab.held"
  | "tab.settled"
  | "metrics.updated"
  // Additive: every other state transition (reconciling, tip, approve, close, reset).
  | "tab.updated";

export interface SettleEvent {
  type: EventType;
  at: string;
  data: unknown;
}

// Ledger module (Alex -> Liam). Amounts are decimal strings in token units.
export interface OpenTabResult {
  escrowSeq: number;
  txHash: string;
  explorerUrl: string;
  ledgerIndex: number;
}

export interface SettleTabResult {
  finishTxHash: string;
  refundTxHash: string | null;
  toVenue: string;
  toMember: string;
  elapsedMs: number;
  explorerUrls: string[];
}

export interface Ledger {
  openTab(args: { memberId: string; allowance: string }): Promise<OpenTabResult>;
  settleTab(args: { tab: Tab; amount: string; tipAmount: string }): Promise<SettleTabResult>;
  cancelTab(args: { tab: Tab }): Promise<{ txHash: string }>;
  getBalances(): Promise<{ venue: string; members: Record<string, string> }>;
}

export type LedgerErrorCode = "INSUFFICIENT_FUNDS" | "ESCROW_NOT_FOUND" | "LEDGER_TIMEOUT";
