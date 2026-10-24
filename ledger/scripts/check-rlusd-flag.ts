// L2: can testnet RLUSD be held in a token escrow (TokenEscrow / XLS-85)?
// Trust line tokens are escrowable only if the issuer account has lsfAllowTrustLineLocking set.
import { Client, LedgerEntry } from 'xrpl'
import { RLUSD_TESTNET, TESTNET } from '../src/config.ts'

const client = new Client(TESTNET.wsUrl)
await client.connect()
try {
  const { result } = await client.request({
    command: 'account_info',
    account: RLUSD_TESTNET.issuer,
    ledger_index: 'validated',
  })
  const flags = result.account_data.Flags
  const allowsLocking = (flags & LedgerEntry.AccountRootFlags.lsfAllowTrustLineLocking) !== 0

  // Sanity check that this address really issues RLUSD on testnet.
  const balances = await client.request({
    command: 'gateway_balances',
    account: RLUSD_TESTNET.issuer,
    ledger_index: 'validated',
  })
  const outstanding = balances.result.obligations?.[RLUSD_TESTNET.currency] ?? 'none'

  console.log(`RLUSD testnet issuer: ${RLUSD_TESTNET.issuer}`)
  console.log(`validated ledger:     ${result.ledger_index}`)
  console.log(`Flags:                0x${flags.toString(16).padStart(8, '0')}`)
  console.log(`RLUSD outstanding:    ${outstanding}`)
  console.log(`Allow Trust Line Locking: ${allowsLocking ? 'yes' : 'no'}`)
} finally {
  await client.disconnect()
}
