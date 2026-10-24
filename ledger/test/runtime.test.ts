import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { Wallet } from 'xrpl'
import { MEMBER_IDS, TESTNET, seedEnvKey } from '../src/config.ts'
import { RUNTIME_ROLES, loadWallets, wsUrl } from '../src/keys.ts'
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
  delete process.env.XRPL_WS_URL
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

describe('escrowSeq', () => {
  it('rejects anything but a positive integer with INVALID_INPUT, before touching the network', async () => {
    exportSeeds(RUNTIME_ROLES)
    const ledger = createLedger({ accountsPath, envPath: noEnvFile, wsUrl: 'wss://unreachable.invalid' })
    for (const escrowSeq of ['abc', null, undefined, 1.5, -3, 0, '12a']) {
      const tab = { memberId: 'member-1', escrowSeq } as never
      await expect(ledger.settleTab({ tab, amount: '1', tipAmount: '0' })).rejects.toMatchObject({ code: 'INVALID_INPUT' })
      await expect(ledger.cancelTab({ tab })).rejects.toMatchObject({ code: 'INVALID_INPUT' })
    }
    // A numeric string is accepted, so this gets past validation and fails on the unreachable host.
    await expect(ledger.cancelTab({ tab: { memberId: 'member-1', escrowSeq: '42' } as never })).rejects.toMatchObject({
      code: 'LEDGER_TIMEOUT',
    })
    await ledger.close()
  })
})

describe('XRPL_WS_URL', () => {
  it('comes from the process environment first, then ledger/.env, then testnet', () => {
    const envFile = path.join(dir, 'ws.env')
    writeFileSync(envFile, 'XRPL_WS_URL=wss://from-file.example\n')
    process.env.XRPL_WS_URL = 'wss://from-process.example'
    expect(wsUrl(envFile)).toBe('wss://from-process.example')
    delete process.env.XRPL_WS_URL
    expect(wsUrl(envFile)).toBe('wss://from-file.example')
    expect(wsUrl(noEnvFile)).toBe(TESTNET.wsUrl)
  })
})
