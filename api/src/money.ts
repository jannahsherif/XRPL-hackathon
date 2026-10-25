/** Integer cents <-> decimal token strings ("12.34"). Never use floats for money. */

export function centsToDecimal(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

export function decimalToCents(value: string): number {
  const match = /^(-)?(\d+)(?:\.(\d{1,6}))?$/.exec(value.trim());
  if (!match) throw new Error(`Invalid decimal amount: ${value}`);
  const [, neg, whole, frac = ""] = match;
  const cents = Number(whole) * 100 + Math.round(Number(`0.${frac || "0"}`) * 100);
  return neg ? -cents : cents;
}

/** A ledger amount as a 2-decimal string ("74.4" -> "74.40", "5000" -> "5000.00"). Non-amounts ("n/a") pass through. */
export function toTwoDecimals(value: string): string {
  return /^-?\d+(\.\d{1,6})?$/.test(value.trim()) ? centsToDecimal(decimalToCents(value)) : value;
}

export function tipCentsFor(totalCents: number, pct: number): number {
  return Math.round((totalCents * pct) / 100);
}
