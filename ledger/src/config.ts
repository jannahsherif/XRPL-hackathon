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

export const MEMBER_IDS = ['member-1', 'member-2', 'member-3', 'member-4']

export const paths = {
  env: fileURLToPath(new URL('../.env', import.meta.url)),
  accounts: fileURLToPath(new URL('../accounts.json', import.meta.url)),
}

// "member-1" -> "MEMBER_1_SEED"
export function seedEnvKey(role: string): string {
  return `${role.toUpperCase().replace(/-/g, '_')}_SEED`
}
