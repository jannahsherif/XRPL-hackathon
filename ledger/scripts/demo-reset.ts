// demo:reset: put testnet back to the demo's starting state so the demo can be rerun. Closes every
// open tab escrow (cancelled if expired, otherwise finished and refunded in full), then sets the
// venue and every member back to SEED_BALANCES. Safe to re-run.
import type { LedgerEntry } from 'xrpl'
import { setBalance } from '../src/admin.ts'
import { MEMBER_IDS, SEED_BALANCES, SUBMIT_DEFAULTS } from '../src/config.ts'
import { createLedger } from '../src/index.ts'
import { loadAccounts, loadWallets, wsUrl } from '../src/keys.ts'
import { connect } from '../src/submit.ts'

const accounts = loadAccounts()
const wallets = loadWallets(accounts)
const ledger = createLedger()
const conn = connect(wsUrl())
let failures = 0

try {
  const client = await conn.ready()
  for (const memberId of MEMBER_IDS) {
    const { result } = await client.request({
      command: 'account_objects',
      account: accounts.members[memberId],
      type: 'escrow',
      ledger_index: 'validated',
    })
    for (const escrow of result.account_objects as LedgerEntry.Escrow[]) {
      // Newer Escrow entries carry their Sequence; otherwise it's on the EscrowCreate that made them.
      const escrowSeq =
        (escrow as { Sequence?: number }).Sequence ??
        (await client.request({ command: 'tx', transaction: escrow.PreviousTxnID })).result.tx_json.Sequence!
      try {
        const closed = await ledger.cancelTab({ tab: { memberId, escrowSeq } })
        console.log(`closed    ${memberId} escrow ${escrowSeq} via ${closed.via}: ${closed.explorerUrl}`)
      } catch (error) {
        failures++
        console.error(`skipped   ${memberId} escrow ${escrowSeq}: ${(error as Error).message}`)
      }
    }
  }

  const issuer = wallets.get('issuer')!
  for (const [role, balance] of Object.entries(SEED_BALANCES)) {
    await setBalance(conn, SUBMIT_DEFAULTS, issuer, wallets.get(role)!, ledger.token, balance)
  }

  const { venue, members } = await ledger.getBalances()
  console.log(`balances  venue ${venue} ${ledger.token.name}`)
  for (const [id, balance] of Object.entries(members)) console.log(`          ${id} ${balance} ${ledger.token.name}`)
} finally {
  await conn.close()
  await ledger.close()
}
if (failures) process.exitCode = 1
