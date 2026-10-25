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
  /** Additive (ledger): when the EscrowCreate was submitted and when it was validated (ISO 8601). */
  submittedAt?: string;
  validatedAt?: string;
}

export interface Settlement {
  finishTxHash: string;
  refundTxHash: string | null;
  toVenue: string;
  toMember: string;
  elapsedMs: number;
  /** Additive: explorer links for the finish, the refund (if any) and the Batch (if batched). */
  explorerUrls: string[];
  /** Additive (ledger): when the first transaction was submitted and when the last was validated (ISO 8601). */
  submittedAt?: string;
  validatedAt?: string;
  /** Additive (ledger): "batch" (one all-or-nothing Batch), "sequential" (finish then refund), or "x402" (AP4M). */
  mode?: "batch" | "sequential" | "x402";
  batchTxHash?: string;
}

export interface Hold {
  reason: string;
  triggeredAt: string;
}

/** AP4M (Mastercard Agent Pay for Machines) Channel and payment proof for a tab. Null outside LEDGER_MODE=ap4m. */
export interface Ap4mTabInfo {
  mode: "simulated" | "live";
  network: string;
  channelId: string;
  capWei: string;
  capRlusd: string;
  agent: string;
  merchantId: string;
  payout: string;
  openTxHash: string;
  payment: {
    amountWei: string;
    amountRlusd: string;
    claimId: string;
    voucherDigest: string;
    redemptionTxHash: string;
    settlementTxHash: string;
    payoutTxHash: string;
    closeTxHash: string | null;
    receiptUrl: string | null;
    explorerUrls: string[];
  } | null;
}

/** Verifiable Intent mandate the member signed for their agent when the tab opened. */
export interface TabMandate {
  id: string;
  hash: string;
  maxAmount: string;
  currency: "USD";
  payee: string;
  agent: string;
  expiresAt: string;
  status: "active" | "used" | "violated";
  paymentRecordHash: string | null;
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
  /** Additive (Mastercard integration): Verifiable Intent mandate, null when INTENT_MODE=off. */
  mandate: TabMandate | null;
  /** Additive (Mastercard integration): AP4M Channel + Voucher proof, null unless LEDGER_MODE=ap4m. */
  ap4m: Ap4mTabInfo | null;
}

export interface CardOnFile {
  brand: "Mastercard";
  last4: string;
  /** Mastercard Checkout Solutions srcDigitalCardId (virtual card token). */
  srcDigitalCardId: string;
}

export interface Member {
  id: string;
  name: string;
  tier: "standard" | "premier" | "founder";
  allowance: string;
  typicalSpendCents: number;
  history: { date: string; totalCents: number }[];
  card: CardOnFile;
  /** Prefunded balance from card top-ups (SIMULATED Mastercard funding rail). */
  fundedCents: number;
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
  | "tab.updated"
  // Additive (Mastercard integration).
  | "intent.mandate_signed"
  | "intent.verified"
  | "intent.violation"
  | "funding.completed"
  | "ap4m.channel_opened"
  | "x402.payment_required"
  | "x402.paid"
  | "ap4m.settled"
  | "ap4m.rejected";

export interface SettleEvent {
  type: EventType;
  at: string;
  data: unknown;
}

// Ledger module (Alex -> Liam). Amounts are decimal strings in token units.
export interface OpenTabResult {
  escrowSeq: number;
  txHash: string;
  explorerUrl: string | null;
  ledgerIndex: number;
  submittedAt?: string;
  validatedAt?: string;
  ap4m?: Omit<Ap4mTabInfo, "payment">;
}

export interface SettleTabResult {
  finishTxHash: string;
  refundTxHash: string | null;
  toVenue: string;
  toMember: string;
  elapsedMs: number;
  explorerUrls: string[];
  submittedAt?: string;
  validatedAt?: string;
  mode?: Settlement["mode"];
  batchTxHash?: string;
  ap4m?: NonNullable<Ap4mTabInfo["payment"]>;
}

export interface Ledger {
  openTab(args: { memberId: string; allowance: string }): Promise<OpenTabResult>;
  /** `amount` is the tab total WITHOUT the tip; the member gets back allowance - amount - tipAmount. */
  settleTab(args: { tab: Tab; amount: string; tipAmount: string }): Promise<SettleTabResult>;
  cancelTab(args: { tab: Tab }): Promise<{ txHash: string }>;
  getBalances(): Promise<{ venue: string; members: Record<string, string> }>;
}

export type LedgerErrorCode = "INSUFFICIENT_FUNDS" | "ESCROW_NOT_FOUND" | "LEDGER_TIMEOUT" | "LEDGER_REJECTED" | "INVALID_INPUT";
