import type { TabMeta } from "./store";
import type { Tab } from "./types";

/** Seconds left in grace: the last live tab.grace_tick, else derived from graceEndsAt. */
export function graceLeft(tab: Tab, meta: TabMeta | undefined, now: number): number {
  if (meta?.secondsLeft !== undefined) return meta.secondsLeft;
  return tab.graceEndsAt ? Math.max(0, Math.ceil((Date.parse(tab.graceEndsAt) - now) / 1000)) : 0;
}

export function inGrace(tab: Tab): boolean {
  return tab.status === "exit_detected" || tab.status === "grace";
}

export function canOrder(tab: Tab): boolean {
  return tab.status === "open" || tab.status === "ordering";
}

/** Newest first, so a tab keeps its row as its status changes. */
export function byOpenedDesc(a: Tab, b: Tab): number {
  return Date.parse(b.openedAt) - Date.parse(a.openedAt);
}

/** The line a rules hold is about: the largest one (the $900 bottle). Disputes and ledger holds have none. */
export function anomalyLine(tab: Tab): number {
  if (!tab.hold || !["rules", "agent", "fallback"].includes(tab.hold.source) || tab.items.length === 0) return -1;
  let best = 0;
  tab.items.forEach((item, i) => {
    if (item.priceCents * item.qty > tab.items[best].priceCents * tab.items[best].qty) best = i;
  });
  return best;
}
