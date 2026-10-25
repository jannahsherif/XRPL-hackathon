import { fileURLToPath } from 'node:url'

export const TESTNET = {
  wsUrl: 'wss://s.altnet.rippletest.net:51233',
  explorerBase: 'https://testnet.xrpl.org',
}

// Ripple's published testnet issuer for RLUSD (currency code is "RLUSD" as 40-char hex).
// https://docs.ripple.com/products/stablecoin/developer-resources/rlusd-on-the-xrpl
export const RLUSD_TESTNET = {
  currency: '524C555344000000000000000000000000000000',
  issuer: 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV',
}

export type TokenName = 'TUSD' | 'RLUSD'
export type Token = { name: TokenName; currency: string; issuer: string }

// The token tabs are denominated in. RLUSD's testnet issuer does not have Allow Trust Line
// Locking set (scripts/check-rlusd-flag.ts), so we issue our own TUSD until it does.
export const TOKEN: TokenName = 'TUSD'

// Currency codes longer than 3 characters must be 40-char hex: "TUSD" padded with zeros.
const TUSD_HEX = '5455534400000000000000000000000000000000'

export function resolveToken(name: TokenName, accounts: { issuer: string }): Token {
  return name === 'RLUSD' ? { name, ...RLUSD_TESTNET } : { name, currency: TUSD_HEX, issuer: accounts.issuer }
}

export const MEMBER_IDS = ['member-1', 'member-2', 'member-3', 'member-4', 'member-5']

// The token balances setup:token and demo:reset put every account back to. They cover the API's
// allowances with headroom: member-1 is the demo member and has two seeded tabs (2,000 together).
export const SEED_BALANCES: Record<string, string> = {
  venue: '0',
  'member-1': '5000',
  'member-2': '800',
  'member-3': '800',
  'member-4': '500',
  'member-5': '1200',
}

export const TRUST_LIMIT = '1000000'

export const TAB_DEFAULTS = {
  // rippled rejects an EscrowCreate whose FinishAfter isn't after the parent ledger's close time
  // (tecNO_PERMISSION). A transaction lands 3.5-7 s after submit and close times round to 10 s,
  // so 5 s occasionally failed; 20 s leaves room.
  finishAfterSeconds: 20,
  cancelAfterSeconds: 8 * 60 * 60,
}

export const SUBMIT_DEFAULTS = {
  ledgerOffset: 10, // ~35s of testnet ledgers before a submission is definitively expired
  timeoutMs: 45_000,
  log: (line: string) => console.log(`[ledger] ${line}`),
}

export const paths = {
  env: fileURLToPath(new URL('../.env', import.meta.url)),
  accounts: fileURLToPath(new URL('../accounts.json', import.meta.url)),
}

// "member-1" -> "MEMBER_1_SEED"
export function seedEnvKey(role: string): string {
  return `${role.toUpperCase().replace(/-/g, '_')}_SEED`
}
