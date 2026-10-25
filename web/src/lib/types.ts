// The API contract (api/src/types.ts and the /state, /events shapes in api/README.md).
// Only the fields the screens read; the API is the source of truth.

export type TabStatus = "open" | "ordering" | "exit_detected" | "grace" | "reconciling" | "settled" | "held" | "closed_manually";

export const OPEN_STATUSES: TabStatus[] = ["open", "ordering", "exit_detected", "grace", "reconciling", "held"];

export interface TabItem {
  name: string;
  qty: number;
  priceCents: number;
}

export interface Escrow {
  seq: number | null;
  txHash: string | null;
  explorerUrl: string | null;
  submittedAt?: string;
  validatedAt?: string;
}

export interface Settlement {
  finishTxHash: string;
  refundTxHash: string | null;
  /** 2-decimal token string. */
  toVenue: string;
  /** 2-decimal token string. */
  toMember: string;
  elapsedMs: number;
  explorerUrls: string[];
  submittedAt?: string;
  validatedAt?: string;
  mode?: "batch" | "sequential" | "x402";
  batchTxHash?: string;
}

export interface Hold {
  reason: string;
  triggeredAt: string;
  source: "rules" | "agent" | "fallback" | "member" | "intent" | "ledger";
  code: string;
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
  /** 2-decimal token string. */
  allowance: string;
  escrow: Escrow;
  settlement: Settlement | null;
  hold: Hold | null;
  graceEndsAt: string | null;
  openedAt: string;
  mandate: unknown | null;
  ap4m: unknown | null;
}

export interface Member {
  id: string;
  name: string;
  tier: "standard" | "premier" | "founder";
  allowance: string;
  typicalSpendCents: number;
  history: { date: string; totalCents: number }[];
  fundedCents: number;
  credentialed: boolean;
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

export interface Mode {
  demo: boolean;
  ledger: "stub" | "module" | "ap4m";
  agent: "local" | "agentcore";
  intent: "on" | "off";
}

export interface SettleState {
  tabs: Tab[];
  members: Member[];
  metrics: Metrics;
  menu: MenuItem[];
  policy: Policy;
  mode: Mode;
}

export interface AgentDecision {
  action: "settle" | "split" | "hold";
  tipPct: number;
  reason: string;
  source: "rules" | "agent" | "fallback";
  code?: string;
}

export interface MemberPush {
  tabId: string;
  memberId: string;
  memberName: string;
  items: TabItem[];
  totalCents: number;
  suggestedTipPct: number;
  tipOptions: number[];
  graceEndsAt: string;
  secondsLeft: number;
}

export interface Balances {
  venue: string;
  members: Record<string, string>;
}

/** Every SSE message: the type is also the SSE event name. */
export interface SettleEvent<T = unknown> {
  type: string;
  at: string;
  data: T;
}
