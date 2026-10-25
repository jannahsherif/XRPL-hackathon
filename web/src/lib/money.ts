import { TOKEN } from "./config";

// All money formatting lives here. Fields ending in Cents are integer cents; allowance, toVenue,
// toMember and /balances amounts are 2-decimal token strings ("600.00"). Never use floats for sums.

const grouped = (n: number) => n.toLocaleString("en-US");

/** "600.00" -> 60000. */
export function toCents(value: string): number {
  const match = /^(-)?(\d+)(?:\.(\d{1,6}))?$/.exec(value.trim());
  if (!match) return 0;
  const [, neg, whole, frac = ""] = match;
  const cents = Number(whole) * 100 + Math.round(Number(`0.${frac || "0"}`) * 100);
  return neg ? -cents : cents;
}

function amount(cents: number, trimZeroCents: boolean): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  const whole = grouped(Math.floor(abs / 100));
  const rest = abs % 100;
  return trimZeroCents && rest === 0 ? `${sign}${whole}` : `${sign}${whole}.${String(rest).padStart(2, "0")}`;
}

/** Cents as dollars: "$1,234.56". `trim` drops ".00" ("$900"). */
export function usd(cents: number, opts: { trim?: boolean } = {}): string {
  const s = amount(cents, opts.trim ?? false);
  return s.startsWith("-") ? `-$${s.slice(1)}` : `$${s}`;
}

/** A token amount (decimal string or cents) with the label: "170.40 TUSD", "200 TUSD". */
export function tokens(value: string | number, opts: { label?: boolean } = {}): string {
  const cents = typeof value === "number" ? value : toCents(value);
  const s = amount(cents, true);
  return opts.label === false ? s : `${s} ${TOKEN}`;
}

/** XRP fee from drops: "0.000024 XRP". */
export function xrp(drops: number): string {
  return `${(drops / 1_000_000).toFixed(6).replace(/0+$/, "").replace(/\.$/, "")} XRP`;
}

/** Same rounding as the API (money.ts tipCentsFor). */
export function tipCentsFor(totalCents: number, pct: number): number {
  return Math.round((totalCents * pct) / 100);
}

/** The tip the API will actually charge: never more than the escrow holds. */
export function cappedTipCents(totalCents: number, pct: number, allowance: string): number {
  return Math.max(0, Math.min(tipCentsFor(totalCents, pct), toCents(allowance) - totalCents));
}
