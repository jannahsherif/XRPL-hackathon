import type { SettlementAgent } from "./agent/settlementAgent.js";
import type { Config } from "./config.js";
import type { EventBus } from "./events.js";
import { ledgerErrorCode } from "./ledger/index.js";
import { centsToDecimal, decimalToCents, tipCentsFor } from "./money.js";
import { SEED_MEMBERS, SEED_MENU, SEED_POLICY, SEED_TABS } from "./seed.js";
import { OPEN_STATUSES, assertTransition } from "./stateMachine.js";
import type { AgentDecision, Ledger, Member, MenuItem, Metrics, Policy, Tab, TabStatus } from "./types.js";

export class NotFoundError extends Error {
  readonly statusCode = 404;
}

export class ConflictError extends Error {
  readonly statusCode = 409;
}

interface GraceTimer {
  tick: NodeJS.Timeout;
  expiry: NodeJS.Timeout;
}

/** Owns all tab state (in memory), the grace timers, and the settlement flow. */
export class SettleService {
  private members = new Map<string, Member>();
  private menu: MenuItem[] = [];
  private tabs = new Map<string, Tab>();
  private policy: Policy = { ...SEED_POLICY };
  private outstandingCents = 0;
  private settleDurations: number[] = [];
  private timers = new Map<string, GraceTimer>();
  private decisions = new Map<string, Promise<AgentDecision>>();
  private memberTipPct = new Map<string, number>();
  private tabCounter = 100;

  constructor(
    private readonly ledger: Ledger,
    private readonly agent: SettlementAgent,
    private readonly bus: EventBus,
    private readonly config: Config,
  ) {
    this.seed();
  }

  // Read model ---------------------------------------------------------------

  snapshot() {
    return {
      tabs: [...this.tabs.values()],
      members: [...this.members.values()],
      metrics: this.metrics(),
      menu: this.menu,
      policy: this.policy,
      mode: { demo: this.config.demo, ledger: this.config.ledgerMode, agent: this.config.agentMode },
    };
  }

  metrics(): Metrics {
    const open = [...this.tabs.values()].filter((t) => OPEN_STATUSES.includes(t.status)).length;
    const avg = this.settleDurations.length
      ? Math.round(this.settleDurations.reduce((a, b) => a + b, 0) / this.settleDurations.length)
      : 0;
    return {
      outstandingCents: this.outstandingCents,
      openTabs: open,
      settledCount: this.settleDurations.length,
      avgSettleMs: avg,
    };
  }

  getTab(id: string): Tab {
    const tab = this.tabs.get(id);
    if (!tab) throw new NotFoundError(`Unknown tab ${id}`);
    return tab;
  }

  updatePolicy(patch: Partial<Policy>): Policy {
    const next = { ...this.policy };
    if (patch.graceSeconds !== undefined) next.graceSeconds = clampInt(patch.graceSeconds, 3, 600);
    if (patch.defaultTipPct !== undefined) next.defaultTipPct = clampInt(patch.defaultTipPct, 0, 30);
    if (patch.holdIfTotalOverTypicalX !== undefined) next.holdIfTotalOverTypicalX = Math.max(1, Number(patch.holdIfTotalOverTypicalX));
    if (patch.holdIfItemOverAllowance !== undefined) next.holdIfItemOverAllowance = Boolean(patch.holdIfItemOverAllowance);
    if (patch.splitBySeat !== undefined) next.splitBySeat = Boolean(patch.splitBySeat);
    this.policy = next;
    return next;
  }

  // Commands -----------------------------------------------------------------

  async openTab(memberId: string, seat?: string): Promise<Tab> {
    const member = this.members.get(memberId);
    if (!member) throw new NotFoundError(`Unknown member ${memberId}`);
    const escrow = await this.ledger.openTab({ memberId, allowance: member.allowance });
    const tab: Tab = {
      id: `t${++this.tabCounter}`,
      memberId,
      memberName: member.name,
      seat: seat ?? "Bar",
      status: "open",
      items: [],
      totalCents: 0,
      tipCents: 0,
      allowance: member.allowance,
      escrow: { seq: escrow.escrowSeq, txHash: escrow.txHash, explorerUrl: escrow.explorerUrl },
      settlement: null,
      hold: null,
      graceEndsAt: null,
      openedAt: new Date().toISOString(),
    };
    this.tabs.set(tab.id, tab);
    this.bus.publish("tab.opened", { tab, ledgerIndex: escrow.ledgerIndex });
    this.publishMetrics();
    return tab;
  }

  addItem(tabId: string, menuItemId: string, qty = 1): Tab {
    const tab = this.getTab(tabId);
    if (tab.status !== "open" && tab.status !== "ordering") {
      throw new ConflictError(`Cannot add items to a tab that is ${tab.status}`);
    }
    const menuItem = this.menu.find((m) => m.id === menuItemId);
    if (!menuItem) throw new NotFoundError(`Unknown menu item ${menuItemId}`);
    const count = clampInt(qty, 1, 20);
    const existing = tab.items.find((i) => i.name === menuItem.name);
    if (existing) existing.qty += count;
    else tab.items.push({ name: menuItem.name, qty: count, priceCents: menuItem.priceCents });
    tab.totalCents = totalOf(tab);
    if (tab.status === "open") tab.status = "ordering";
    const headroomCents = decimalToCents(tab.allowance) - tab.totalCents;
    this.bus.publish("tab.item_added", { tab, item: { ...menuItem, qty: count }, headroomCents });
    return tab;
  }

  exit(tabId: string): Tab {
    const tab = this.getTab(tabId);
    this.move(tab, "exit_detected");
    this.bus.publish("tab.exit_detected", { tab });

    const graceSeconds = this.policy.graceSeconds;
    const endsAt = Date.now() + graceSeconds * 1000;
    tab.graceEndsAt = new Date(endsAt).toISOString();
    this.move(tab, "grace");

    // Decide during the grace period so the timer absorbs LLM latency.
    this.decisions.set(tab.id, this.decide(tab));

    this.bus.publish("member.push", {
      tabId: tab.id,
      memberId: tab.memberId,
      memberName: tab.memberName,
      items: tab.items,
      totalCents: tab.totalCents,
      suggestedTipPct: this.policy.defaultTipPct,
      tipOptions: [15, 18, 20, 22],
      graceEndsAt: tab.graceEndsAt,
      secondsLeft: graceSeconds,
    });

    const tick = setInterval(() => {
      const secondsLeft = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      this.bus.publish("tab.grace_tick", { tabId: tab.id, secondsLeft });
    }, 1000);
    const expiry = setTimeout(() => {
      this.clearTimer(tab.id);
      void this.reconcile(tab.id);
    }, graceSeconds * 1000);
    this.timers.set(tab.id, { tick, expiry });
    return tab;
  }

  setTip(tabId: string, pct: number): Tab {
    const tab = this.getTab(tabId);
    if (!["open", "ordering", "exit_detected", "grace"].includes(tab.status)) {
      throw new ConflictError(`Tip can only change before settlement (tab is ${tab.status})`);
    }
    const tipPct = clampInt(pct, 0, 30);
    this.memberTipPct.set(tab.id, tipPct);
    tab.tipCents = tipCentsFor(tab.totalCents, tipPct);
    this.bus.publish("tab.updated", { tab, change: "tip", tipPct });
    return tab;
  }

  dispute(tabId: string, note?: string): Tab {
    const tab = this.getTab(tabId);
    if (!["open", "ordering", "exit_detected", "grace"].includes(tab.status)) {
      throw new ConflictError(`Cannot dispute a tab that is ${tab.status}`);
    }
    this.clearTimer(tab.id);
    this.decisions.delete(tab.id);
    this.hold(tab, note ? `Member disputed: ${note}` : "Member disputed the tab");
    return tab;
  }

  async approve(tabId: string): Promise<Tab> {
    const tab = this.getTab(tabId);
    if (tab.status !== "held") throw new ConflictError(`Only held tabs can be approved (tab is ${tab.status})`);
    const tipPct = this.memberTipPct.get(tab.id) ?? this.policy.defaultTipPct;
    await this.settle(tab, { action: "settle", tipPct, reason: "Approved by manager", source: "rules" });
    return tab;
  }

  async reject(tabId: string): Promise<Tab> {
    const tab = this.getTab(tabId);
    if (tab.status !== "held") throw new ConflictError(`Only held tabs can be rejected (tab is ${tab.status})`);
    // Rejecting returns the escrow to the member; staff settle the tab by hand.
    return this.closeManually(tab, "Rejected by manager");
  }

  async close(tabId: string): Promise<Tab> {
    return this.closeManually(this.getTab(tabId), "Closed manually by staff");
  }

  async reset(): Promise<void> {
    for (const id of this.timers.keys()) this.clearTimer(id);
    const live = [...this.tabs.values()].filter((t) => OPEN_STATUSES.includes(t.status) && t.escrow.txHash);
    await Promise.allSettled(live.map((tab) => this.ledger.cancelTab({ tab })));
    this.bus.clear();
    this.seed();
    this.bus.publish("tab.updated", { change: "reset", state: this.snapshot() });
    this.publishMetrics();
  }

  /** Optionally replace the seeded tabs' placeholder escrows with real ones (LEDGER_MODE=module). */
  async openSeedEscrows(): Promise<void> {
    for (const tab of this.tabs.values()) {
      if (tab.escrow.txHash) continue;
      try {
        const escrow = await this.ledger.openTab({ memberId: tab.memberId, allowance: tab.allowance });
        tab.escrow = { seq: escrow.escrowSeq, txHash: escrow.txHash, explorerUrl: escrow.explorerUrl };
        this.bus.publish("tab.updated", { tab, change: "escrow_opened" });
      } catch (err) {
        console.warn(`seed escrow for ${tab.id} failed: ${ledgerErrorCode(err)}`);
      }
    }
  }

  // Settlement flow ----------------------------------------------------------

  private async decide(tab: Tab): Promise<AgentDecision> {
    const member = this.members.get(tab.memberId)!;
    return this.agent.decide(structuredClone(tab), member, this.policy);
  }

  private async reconcile(tabId: string): Promise<void> {
    const tab = this.tabs.get(tabId);
    if (!tab || tab.status !== "grace") return;
    this.move(tab, "reconciling");
    this.bus.publish("tab.updated", { tab, change: "reconciling" });

    const decision = await (this.decisions.get(tab.id) ?? this.decide(tab));
    this.decisions.delete(tab.id);
    // A reset or manual action may have happened while the agent was thinking.
    if (this.tabs.get(tabId) !== tab || (tab.status as TabStatus) !== "reconciling") return;
    this.bus.publish("agent.decision", { tabId: tab.id, ...decision });

    if (decision.action === "hold") {
      this.hold(tab, decision.reason);
      return;
    }
    await this.settle(tab, decision);
  }

  private async settle(tab: Tab, decision: AgentDecision): Promise<void> {
    if (tab.status !== "reconciling") this.move(tab, "reconciling");
    const allowanceCents = decimalToCents(tab.allowance);
    if (tab.totalCents > allowanceCents) {
      this.hold(tab, `Total $${centsToDecimal(tab.totalCents)} is above the escrowed $${tab.allowance}; settle the difference manually`);
      return;
    }
    const tipPct = this.memberTipPct.get(tab.id) ?? decision.tipPct;
    // Never charge more than the escrow holds: trim the tip if needed.
    tab.tipCents = Math.min(tipCentsFor(tab.totalCents, tipPct), allowanceCents - tab.totalCents);
    const amount = centsToDecimal(tab.totalCents + tab.tipCents);

    try {
      const result = await this.ledger.settleTab({ tab: structuredClone(tab), amount, tipAmount: centsToDecimal(tab.tipCents) });
      tab.settlement = {
        finishTxHash: result.finishTxHash,
        refundTxHash: result.refundTxHash,
        toVenue: result.toVenue,
        toMember: result.toMember,
        elapsedMs: result.elapsedMs,
      };
      tab.hold = null;
      tab.graceEndsAt = null;
      this.move(tab, "settled");
      this.outstandingCents = Math.max(0, this.outstandingCents - decimalToCents(result.toVenue));
      this.settleDurations.push(result.elapsedMs);
      this.bus.publish("tab.settled", { tab, settlement: tab.settlement, explorerUrls: result.explorerUrls, decision });
      this.publishMetrics();
    } catch (err) {
      this.hold(tab, `Ledger error (${ledgerErrorCode(err)}): ${(err as Error).message}`);
    }
  }

  private hold(tab: Tab, reason: string): void {
    this.move(tab, "held");
    tab.hold = { reason, triggeredAt: new Date().toISOString() };
    this.bus.publish("tab.held", { tab, hold: tab.hold });
    this.publishMetrics();
  }

  private async closeManually(tab: Tab, reason: string): Promise<Tab> {
    assertTransitionOrThrow(tab.status, "closed_manually");
    this.clearTimer(tab.id);
    let cancelTxHash: string | null = null;
    if (tab.escrow.txHash) {
      try {
        cancelTxHash = (await this.ledger.cancelTab({ tab: structuredClone(tab) })).txHash;
      } catch (err) {
        throw new ConflictError(`Could not cancel escrow (${ledgerErrorCode(err)})`);
      }
    }
    this.move(tab, "closed_manually");
    tab.graceEndsAt = null;
    this.bus.publish("tab.updated", { tab, change: "closed_manually", reason, cancelTxHash });
    this.publishMetrics();
    return tab;
  }

  // Helpers ------------------------------------------------------------------

  private move(tab: Tab, to: TabStatus): void {
    assertTransition(tab.status, to);
    tab.status = to;
  }

  private clearTimer(tabId: string): void {
    const timer = this.timers.get(tabId);
    if (timer) {
      clearInterval(timer.tick);
      clearTimeout(timer.expiry);
      this.timers.delete(tabId);
    }
  }

  private publishMetrics(): void {
    this.bus.publish("metrics.updated", this.metrics());
  }

  private seed(): void {
    this.members = new Map(SEED_MEMBERS.map((m) => [m.id, structuredClone(m)]));
    this.menu = structuredClone(SEED_MENU);
    this.policy = { ...SEED_POLICY, graceSeconds: this.config.graceSeconds };
    this.outstandingCents = this.config.outstandingSeedCents;
    this.settleDurations = [];
    this.decisions.clear();
    this.memberTipPct.clear();
    this.tabCounter = 100;
    const stub = this.config.ledgerMode === "stub";
    this.tabs = new Map(
      SEED_TABS.map((seed, i) => {
        const member = this.members.get(seed.memberId)!;
        const tab: Tab = {
          id: seed.id,
          memberId: seed.memberId,
          memberName: member.name,
          seat: seed.seat,
          status: seed.status,
          items: structuredClone(seed.items),
          totalCents: 0,
          tipCents: 0,
          allowance: member.allowance,
          // Seeded tabs carry placeholder escrows; the stub accepts them, a real ledger needs SEED_LIVE_ESCROWS=1.
          escrow: { seq: stub ? 500 + i : null, txHash: null, explorerUrl: null },
          settlement: null,
          hold: null,
          graceEndsAt: null,
          openedAt: new Date(Date.now() - seed.minutesAgo * 60_000).toISOString(),
        };
        tab.totalCents = totalOf(tab);
        return [tab.id, tab];
      }),
    );
  }
}

function assertTransitionOrThrow(from: TabStatus, to: TabStatus): void {
  try {
    assertTransition(from, to);
  } catch (err) {
    throw new ConflictError((err as Error).message);
  }
}

function totalOf(tab: Tab): number {
  return tab.items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
}

function clampInt(value: unknown, min: number, max: number): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) throw new ConflictError(`Expected a number, got ${String(value)}`);
  return Math.min(Math.max(n, min), max);
}
