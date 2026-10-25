import { useEffect, useState } from "react";

import { EXPLORER_TX } from "./config";
import type { Policy, Settlement, Tab, TabItem } from "./types";

/** "Eleanor Vance" -> "E. Vance", as on the mocks. */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length < 2 ? name : `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** "11:42:03" (no AM/PM, as on the mocks). */
export function clockTime(iso: string | number | Date, seconds = true): string {
  const s = new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", ...(seconds ? { second: "2-digit" } : {}), hour12: true });
  return s.replace(/\s?[AP]M$/, "");
}

/** "11:52 PM". */
export function clockTimeAmPm(iso: string | number | Date): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

/** "Sat Oct 24". */
export function shortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", "");
}

/** "Saturday, October 24". */
export function longDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

/** "09:48". */
export function countdown(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** "1 h 34 min", "26 min", "40 s". */
export function duration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

/** "4.2 s" between two ISO timestamps, or null when either is missing (the stub omits them). */
export function secondsBetween(from?: string, to?: string): string | null {
  if (!from || !to) return null;
  return `${((Date.parse(to) - Date.parse(from)) / 1000).toFixed(1)} s`;
}

export function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`;
}

/** "7E41…9B0A". */
export function shortHash(hash: string): string {
  return hash.length > 12 ? `${hash.slice(0, 4)}…${hash.slice(-4)}` : hash;
}

/** The explorer link the API sent for this hash, else the testnet explorer. */
export function explorerFor(hash: string, urls: string[] = []): string {
  return urls.find((u) => u.includes(hash)) ?? `${EXPLORER_TX}/${hash}`;
}

export function itemCount(tab: Tab): number {
  return tab.items.reduce((n, i) => n + i.qty, 0);
}

/** "2 Negroni · 2 Old Fashioned · Oysters". */
export function itemSummary(items: TabItem[]): string {
  return items.map((i) => (i.qty > 1 ? `${i.qty} ${i.name}` : i.name)).join(" · ");
}

/** "hold if > 3× typical or any item > allowance". */
export function policyLine(policy: Policy): string {
  const rules = [`> ${policy.holdIfTotalOverTypicalX}× typical`];
  if (policy.holdIfItemOverAllowance) rules.push("any item > allowance");
  return `hold if ${rules.join(" or ")}`;
}

export function settlementHashes(s: Settlement): { label: string; hash: string }[] {
  return [
    { label: "Finish", hash: s.finishTxHash },
    ...(s.refundTxHash ? [{ label: "Refund", hash: s.refundTxHash }] : []),
    ...(s.batchTxHash ? [{ label: "Batch", hash: s.batchTxHash }] : []),
  ];
}

export function hasEscrow(tab: Tab): boolean {
  return Boolean(tab.escrow.txHash || tab.escrow.seq !== null);
}

/** Re-renders every `ms` and returns now. */
export function useNow(ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/** "OVER_TYPICAL_SPEND" -> "Over typical spend". */
export function codeLabel(code: string): string {
  const s = code.toLowerCase().replace(/_/g, " ");
  return s[0].toUpperCase() + s.slice(1);
}
