/**
 * RLUSD on XRPL EVM has 18 decimals. Settle prices tabs in USD cents.
 *
 * The hackathon funds each team with a 20 RLUSD budget, so demo tabs are
 * scaled: with `usdPerRlusd = 100`, a $106.00 tab is 1.06 RLUSD. Production
 * uses `usdPerRlusd = 1` (RLUSD is a 1:1 USD stablecoin).
 */
const WEI_PER_RLUSD = 10n ** 18n;

export function centsToWei(cents: number, usdPerRlusd: number): bigint {
  if (!Number.isInteger(cents) || cents < 0) throw new Error(`cents must be a non-negative integer, got ${cents}`);
  if (!Number.isInteger(usdPerRlusd) || usdPerRlusd < 1) throw new Error(`usdPerRlusd must be a positive integer, got ${usdPerRlusd}`);
  return (BigInt(cents) * WEI_PER_RLUSD) / (100n * BigInt(usdPerRlusd));
}

export function weiToCents(wei: bigint, usdPerRlusd: number): number {
  return Number((wei * 100n * BigInt(usdPerRlusd)) / WEI_PER_RLUSD);
}

/** Human-readable RLUSD amount, trimmed to 6 decimals ("1.06"). */
export function formatRlusd(wei: bigint): string {
  const whole = wei / WEI_PER_RLUSD;
  const frac = (wei % WEI_PER_RLUSD).toString().padStart(18, "0").slice(0, 6).replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : `${whole}`;
}
