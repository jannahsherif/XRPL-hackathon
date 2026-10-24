// Acceptance test: openTab -> wait for FinishAfter -> settleTab on testnet, printing hashes, amounts
// and elapsed ms. Exits non-zero if anything fails or the balances don't move by the right amounts.
import { trustLineBalance } from '../src/admin.ts'
import { add, refundFor, sub } from '../src/amounts.ts'
import { loadAccounts } from '../src/keys.ts'
import { createLedger } from '../src/index.ts'

const memberId = 'member-1'
const allowance = '150'
const amount = '86.40'
const tipAmount = '12.96'

const accounts = loadAccounts()
const ledger = createLedger()
const token = ledger.token
const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`

// Balances are read through a second connection so the demo doesn't lean on getBalances (L6).
const { Client } = await import('xrpl')
const reader = new Client('wss://s.altnet.rippletest.net:51233')
await reader.connect()
const balances = async () => ({
  member: (await trustLineBalance(reader, accounts.members[memberId], token)) ?? '0',
  venue: (await trustLineBalance(reader, accounts.venue, token)) ?? '0',
})

try {
  const before = await balances()
  console.log(`before    ${memberId} ${before.member} ${token.name}, venue ${before.venue} ${token.name}`)

  console.log(`openTab   ${memberId}, allowance ${allowance} ${token.name}`)
  let t = performance.now()
  const opened = await ledger.openTab({ memberId, allowance })
  console.log(`          escrowSeq ${opened.escrowSeq}, ledger ${opened.ledgerIndex}, ${secs(performance.now() - t)}`)
  console.log(`          ${opened.explorerUrl}`)
  const tab = { ...opened, memberId }

  console.log(`waiting   for a validated ledger to close after FinishAfter ${opened.finishAfter} ...`)
  t = performance.now()
  await ledger.waitForFinishAfter(tab)
  console.log(`          finishable after ${secs(performance.now() - t)}`)

  console.log(`settleTab amount ${amount} + tip ${tipAmount}`)
  t = performance.now()
  const settled = await ledger.settleTab({ tab, amount, tipAmount })
  const callMs = Math.round(performance.now() - t)
  console.log(`          mode          ${settled.mode}`)
  console.log(`          toVenue       ${settled.toVenue} ${token.name}`)
  console.log(`          toMember      ${settled.toMember} ${token.name}`)
  console.log(`          finishTxHash  ${settled.finishTxHash}`)
  console.log(`          refundTxHash  ${settled.refundTxHash}`)
  if (settled.batchTxHash) console.log(`          batchTxHash   ${settled.batchTxHash}`)
  for (const url of settled.explorerUrls) console.log(`          ${url}`)
  console.log(`          elapsedMs     ${settled.elapsedMs} (first submit -> last validation)`)
  console.log(`          settleTab()   ${callMs}ms wall, including escrow lookup and signing`)

  const after = await balances()
  console.log(`after     ${memberId} ${after.member} ${token.name}, venue ${after.venue} ${token.name}`)

  const spent = add(amount, tipAmount)
  const checks: [string, boolean][] = [
    ['toMember = allowance - amount - tip', settled.toMember === refundFor(allowance, amount, tipAmount)],
    ['toVenue = amount + tip', settled.toVenue === spent],
    ['member balance down by amount + tip', sub(before.member, after.member) === spent],
    ['venue balance up by amount + tip', sub(after.venue, before.venue) === spent],
  ]
  for (const [name, ok] of checks) console.log(`check     ${ok ? 'ok  ' : 'FAIL'} ${name}`)
  if (checks.some(([, ok]) => !ok)) throw new Error('balance checks failed')
  console.log(`PASS      settled in ${settled.elapsedMs}ms (${settled.elapsedMs < 5000 ? 'under' : 'OVER'} the 5s target)`)
} catch (error) {
  const { code, result } = error as { code?: string; result?: string }
  console.error(`FAIL      ${[code, result].filter(Boolean).join(' ')} ${(error as Error).message}`)
  process.exitCode = 1
} finally {
  await reader.disconnect()
  await ledger.close()
}
