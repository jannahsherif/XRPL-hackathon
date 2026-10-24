// L3 spike (throwaway): prove a TUSD token escrow works on testnet with our flag setup, then
// de-risk L4 by finishing it inside a BatchV1_1 together with a partial refund payment.
import { BatchFlags, GlobalFlags, hashes, isoTimeToRippleTime, rippleTimeToISOTime } from 'xrpl'
import { SUBMIT_DEFAULTS, TESTNET, TOKEN, resolveToken } from '../src/config.ts'
import { loadAccounts, loadWallets } from '../src/keys.ts'
import { connect, lookupTx, resultCode, sleep, submitTx } from '../src/submit.ts'

const accounts = loadAccounts()
const wallets = loadWallets(accounts)
const token = resolveToken(TOKEN, accounts)
const member = wallets.get('member-4')!
const venue = wallets.get('venue')!
const conn = connect(TESTNET.wsUrl)
const opts = SUBMIT_DEFAULTS

try {
  const client = await conn.ready()
  const now = Date.now()
  const finishAfter = isoTimeToRippleTime(new Date(now + 5_000).toISOString())
  const cancelAfter = isoTimeToRippleTime(new Date(now + 8 * 3600_000).toISOString())

  console.log('--- EscrowCreate member-4 -> venue, 2 TUSD')
  const created = await submitTx(
    conn,
    {
      TransactionType: 'EscrowCreate',
      Account: member.address,
      Destination: venue.address,
      Amount: { currency: token.currency, issuer: token.issuer, value: '2' },
      FinishAfter: finishAfter,
      CancelAfter: cancelAfter,
    },
    member,
    opts,
  ).catch((error) => {
    console.error('EscrowCreate FAILED. Ledger returned:', error.result ?? error.message)
    throw error
  })
  const escrowSeq = created.tx_json.Sequence!
  console.log(`escrowSeq=${escrowSeq} ledger=${created.ledger_index}`)

  const entry = await client.request({
    command: 'ledger_entry',
    escrow: { owner: member.address, seq: escrowSeq },
    ledger_index: 'validated',
  })
  console.log('Escrow object:', JSON.stringify(entry.result.node))

  console.log('--- waiting for a validated ledger to close after FinishAfter')
  for (;;) {
    const { ledger } = (await client.request({ command: 'ledger', ledger_index: 'validated' })).result
    console.log(
      `validated ${ledger.ledger_index} close_time=${rippleTimeToISOTime(ledger.close_time)} ` +
        `resolution=${ledger.close_time_resolution}s finishAfter=${rippleTimeToISOTime(finishAfter)}`,
    )
    if (ledger.close_time > finishAfter) break
    await sleep(1000)
  }
  console.log(`ready ${((Date.now() - now) / 1000).toFixed(1)}s after building EscrowCreate`)

  console.log('--- Batch (venue): EscrowFinish + Payment 1.25 TUSD back to member-4')
  const started = performance.now()
  const batch = await submitTx(
    conn,
    {
      TransactionType: 'Batch',
      Account: venue.address,
      Flags: BatchFlags.tfAllOrNothing,
      RawTransactions: [
        {
          RawTransaction: {
            TransactionType: 'EscrowFinish',
            Account: venue.address,
            Owner: member.address,
            OfferSequence: escrowSeq,
            Flags: GlobalFlags.tfInnerBatchTxn,
          },
        },
        {
          RawTransaction: {
            TransactionType: 'Payment',
            Account: venue.address,
            Destination: member.address,
            Amount: { currency: token.currency, issuer: token.issuer, value: '1.25' },
            Flags: GlobalFlags.tfInnerBatchTxn,
          },
        },
      ],
    },
    venue,
    opts,
  )
  for (const { RawTransaction } of (batch.tx_json as any).RawTransactions) {
    const hash = hashes.hashSignedTx(RawTransaction)
    const inner = await lookupTx(client, hash)
    console.log(`inner ${RawTransaction.TransactionType} ${hash} ${inner ? resultCode(inner) : 'NOT FOUND'} ledger=${inner?.ledger_index}`)
  }
  console.log(`batch settle took ${Math.round(performance.now() - started)}ms (submit -> validated + inner lookups)`)
} finally {
  await conn.close()
}
