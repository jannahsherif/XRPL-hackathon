// The only place seeds are read. Seeds come from ledger/.env (parsed privately, not copied into
// process.env) with process.env as a fallback for deployed environments.
import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { Wallet } from 'xrpl'
import { MEMBER_IDS, paths, seedEnvKey } from './config.ts'
import { LedgerError } from './errors.ts'

export type Accounts = {
  network: string
  issuer: string
  venue: string
  members: Record<string, string>
}

export function loadAccounts(path = paths.accounts): Accounts {
  return JSON.parse(readFileSync(path, 'utf8')) as Accounts
}

export function loadEnv(path = paths.env): Record<string, string | undefined> {
  return existsSync(path) ? parseEnv(readFileSync(path, 'utf8')) : {}
}

// Tabs only ever sign as the venue or a member. The issuer key is for setup:token and demo:reset,
// so the runtime never asks for it and it never has to be deployed.
export const RUNTIME_ROLES = ['venue', ...MEMBER_IDS]
export const ALL_ROLES = ['issuer', ...RUNTIME_ROLES]

export function loadWallets(accounts: Accounts, envPath = paths.env, roles = ALL_ROLES): Map<string, Wallet> {
  const env = loadEnv(envPath)
  const wallets = new Map<string, Wallet>()
  const expected: Record<string, string> = { issuer: accounts.issuer, venue: accounts.venue, ...accounts.members }
  for (const role of roles) {
    const seed = env[seedEnvKey(role)] ?? process.env[seedEnvKey(role)]
    if (!seed) throw new Error(`missing ${seedEnvKey(role)} (run npm run setup:accounts, or see .env.example)`)
    const wallet = Wallet.fromSeed(seed)
    if (wallet.address !== expected[role]) {
      throw new Error(`${seedEnvKey(role)} is for ${wallet.address}, but accounts.json says ${role} is ${expected[role]}`)
    }
    wallets.set(role, wallet)
  }
  return wallets
}

export function memberAddress(accounts: Accounts, memberId: string): string {
  const address = accounts.members[memberId]
  if (!address) throw new LedgerError('INVALID_INPUT', `unknown memberId ${JSON.stringify(memberId)}`)
  return address
}
