// Acceptance test: openTab -> wait for FinishAfter -> settleTab on testnet, printing hashes, amounts
// and elapsed ms. Exits non-zero if anything fails or the balances don't move by the right amounts.
// On a pass it writes fixtures/happy-path.json (hashes, timestamps, steps), which the API's stub
// ledger replays so the stub demo shows explorer links to real testnet transactions.
import { mkdirSync, writeFileSync } from 'node:fs'
import { add, refundFor, sub } from '../src/amounts.ts'
import { createLedger } from '../src/index.ts'

const memberId = 'member-1'
const allowance = '150'
const amount = '86.40'
const tipAmount = '12.96'

const ledger = createLedger()
const token = ledger.token.name
const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`
const between = (from: string, to: string) => Date.parse(to) - Date.parse(from)

try {
  const before = await ledger.getBalances()
  console.log(`before    ${memberId} ${before.members[memberId]} ${token}, venue ${before.venue} ${token}`)

  console.log(`openTab   ${memberId}, allowance ${allowance} ${token}`)
  const opened = await ledger.openTab({ memberId, allowance })
  console.log(`          escrowSeq ${opened.escrowSeq}, ledger ${opened.ledgerIndex}`)
  console.log(`          submitted ${opened.submittedAt} -> validated ${opened.validatedAt} (${secs(between(opened.submittedAt, opened.validatedAt))})`)
  console.log(`          ${opened.explorerUrl}`)
  const tab = { ...opened, memberId }

  console.log(`waiting   for a validated ledger to close after FinishAfter ${opened.finishAfter} ...`)
  let t = performance.now()
  await ledger.waitForFinishAfter(tab)
  const finishableAt = new Date().toISOString()
  console.log(`          finishable after ${secs(performance.now() - t)}`)

  console.log(`settleTab amount ${amount} + tip ${tipAmount}`)
  t = performance.now()
  const settled = await ledger.settleTab({ tab, amount, tipAmount })
  const callMs = Math.round(performance.now() - t)
  console.log(`          mode          ${settled.mode}`)
  console.log(`          toVenue       ${settled.toVenue} ${token}`)
  console.log(`          toMember      ${settled.toMember} ${token}`)
  console.log(`          finishTxHash  ${settled.finishTxHash}`)
  console.log(`          refundTxHash  ${settled.refundTxHash}`)
  if (settled.batchTxHash) console.log(`          batchTxHash   ${settled.batchTxHash}`)
  for (const url of settled.explorerUrls) console.log(`          ${url}`)
  console.log(`          submittedAt   ${settled.submittedAt}`)
  console.log(`          validatedAt   ${settled.validatedAt}`)
  console.log(`          elapsedMs     ${settled.elapsedMs} (first submit -> validated ledger announced)`)
  console.log(`          settleTab()   ${callMs}ms wall, including escrow lookup and signing`)

  const after = await ledger.getBalances()
  console.log(`after     ${memberId} ${after.members[memberId]} ${token}, venue ${after.venue} ${token}`)

  const spent = add(amount, tipAmount)
  const checks: [string, boolean][] = [
    ['toMember = allowance - amount - tip', settled.toMember === refundFor(allowance, amount, tipAmount)],
    ['toVenue = amount + tip', settled.toVenue === spent],
    ['elapsedMs = validatedAt - submittedAt', settled.elapsedMs === between(settled.submittedAt, settled.validatedAt)],
    ['member balance down by amount + tip', sub(before.members[memberId], after.members[memberId]) === spent],
    ['venue balance up by amount + tip', sub(after.venue, before.venue) === spent],
  ]
  for (const [name, ok] of checks) console.log(`check     ${ok ? 'ok  ' : 'FAIL'} ${name}`)
  if (checks.some(([, ok]) => !ok)) throw new Error('checks failed')

  const fixture = new URL('../fixtures/happy-path.json', import.meta.url)
  mkdirSync(new URL('.', fixture), { recursive: true })
  const { allowance: _a, finishAfter: _f, cancelAfter: _c, ...openTab } = opened
  writeFileSync(
    fixture,
    `${JSON.stringify(
      {
        source: 'ledger demo:happy-path',
        network: 'testnet',
        capturedAt: new Date().toISOString(),
        memberId,
        openTab,
        settleTab: settled,
        events: [
          { at: opened.submittedAt, event: 'EscrowCreate submitted' },
          { at: opened.validatedAt, event: 'EscrowCreate validated', txHash: opened.txHash },
          { at: finishableAt, event: 'FinishAfter passed' },
          { at: settled.submittedAt, event: `settle submitted (${settled.mode})` },
          { at: settled.validatedAt, event: 'settle validated', txHash: settled.batchTxHash ?? settled.finishTxHash },
        ],
      },
      null,
      2,
    )}\n`,
  )
  console.log(`fixture   ${fixture.pathname}`)
  console.log(`PASS      validated in ${settled.elapsedMs}ms (${settled.elapsedMs < 5000 ? 'under' : 'over'} 5s)`)
} catch (error) {
  const { code, result } = error as { code?: string; result?: string }
  console.error(`FAIL      ${[code, result].filter(Boolean).join(' ')} ${(error as Error).message}`)
  process.exitCode = 1
} finally {
  await ledger.close()
}
