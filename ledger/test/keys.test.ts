import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { Wallet } from 'xrpl'
import { MEMBER_IDS, seedEnvKey } from '../src/config.ts'
import { RUNTIME_ROLES, loadWallets } from '../src/keys.ts'
import { createLedger } from '../src/ledger.ts'

// Throwaway keys and nothing on the network. Seeds come from process.env, as they do in AWS, and
// there is no .env file.
const wallets = Object.fromEntries(['issuer', ...RUNTIME_ROLES].map((role) => [role, Wallet.generate()]))
const accounts = {
  network: 'testnet',
  issuer: wallets.issuer.address,
  venue: wallets.venue.address,
  members: Object.fromEntries(MEMBER_IDS.map((id) => [id, wallets[id].address])),
}
const dir = mkdtempSync(path.join(tmpdir(), 'ledger-keys-'))
const accountsPath = path.join(dir, 'accounts.json')
writeFileSync(accountsPath, JSON.stringify(accounts))
const noEnvFile = path.join(dir, '.env')

const exportSeeds = (roles: string[]) => {
  for (const role of roles) process.env[seedEnvKey(role)] = wallets[role].seed
}

afterEach(() => {
  for (const role of Object.keys(wallets)) delete process.env[seedEnvKey(role)]
})

describe('runtime keys', () => {
  it('loads with only the venue and member seeds', async () => {
    exportSeeds(RUNTIME_ROLES)
    expect([...loadWallets(accounts, noEnvFile, RUNTIME_ROLES).keys()]).toEqual(RUNTIME_ROLES)
    const ledger = createLedger({ accountsPath, envPath: noEnvFile })
    await ledger.close()
  })

  it('still requires the issuer seed for setup and reset', () => {
    exportSeeds(RUNTIME_ROLES)
    expect(() => loadWallets(accounts, noEnvFile)).toThrow(/ISSUER_SEED/)
  })
})
