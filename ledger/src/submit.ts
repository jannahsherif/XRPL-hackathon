// One persistent WebSocket client, and transaction submission on top of it.
//
// submitTx follows the same steps as xrpl.js submitAndWait (autofill, sign, submit, wait until
// validated or LastLedgerSequence passes), but it reads the preliminary result so it can retry
// tefPAST_SEQ immediately (submitAndWait would wait out LastLedgerSequence first), and it checks
// for validation when the server announces a validated ledger instead of on a polling timer.
import type { Batch, Client as XrplClient, SubmittableTransaction, TransactionMetadata, TxResponse, Wallet } from 'xrpl'
import { Client, hashes } from 'xrpl'
import { LedgerError, errorForResult } from './errors.ts'

// If no validated-ledger announcement arrives for this long (stream lost, say), check anyway.
const FALLBACK_CHECK_MS = 4_000

export type Connection = {
  client: XrplClient
  ready(): Promise<XrplClient>
  // Resolves with the index of the next validated ledger announced, or undefined after timeoutMs.
  nextValidatedLedger(timeoutMs: number): Promise<number | undefined>
  // When the server announced this ledger as validated (epoch ms), if this connection saw it.
  announcedAt(ledgerIndex: number): number | undefined
  close(): Promise<void>
}

// xrpl.js reconnects on its own after an unexpected close; ready() also covers the first connect
// and any window where a reconnect is still in flight.
export function connect(url: string): Connection {
  const client = new Client(url)
  const announced = new Map<number, number>()
  const wakers = new Set<(ledgerIndex?: number) => void>()
  let pending: Promise<void> | undefined

  client.on('ledgerClosed', (ledger) => {
    announced.set(ledger.ledger_index, Date.now())
    if (announced.size > 256) announced.delete(announced.keys().next().value!)
    for (const wake of [...wakers]) wake(ledger.ledger_index)
  })
  // Fires after the first connect and after every reconnect; xrpl.js does not restore subscriptions.
  client.on('connected', () => {
    client.request({ command: 'subscribe', streams: ['ledger'] }).catch(() => {
      // The fallback check in waitForValidation keeps things moving without the stream.
    })
  })

  return {
    client,
    async ready() {
      if (!client.isConnected()) {
        pending ??= client.connect().finally(() => (pending = undefined))
        try {
          await pending
        } catch (error) {
          throw new LedgerError('LEDGER_TIMEOUT', `could not connect to ${url}: ${(error as Error).message}`)
        }
      }
      return client
    },
    nextValidatedLedger(timeoutMs) {
      return new Promise((resolve) => {
        const wake = (ledgerIndex?: number) => {
          clearTimeout(timer)
          wakers.delete(wake)
          resolve(ledgerIndex)
        }
        const timer = setTimeout(wake, timeoutMs)
        wakers.add(wake)
      })
    },
    announcedAt: (ledgerIndex) => announced.get(ledgerIndex),
    async close() {
      if (client.isConnected()) await client.disconnect()
    },
  }
}

export type SubmitOptions = {
  ledgerOffset: number // LastLedgerSequence = latest validated ledger + ledgerOffset
  timeoutMs: number // wall-clock cap per attempt
  log: (line: string) => void
}

export type Validated = TxResponse['result']

export type Submitted = {
  tx: Validated
  // Batch only: each inner transaction's validated result, in order.
  inner: Validated[]
  submittedAt: number // epoch ms, just before the first submit request
  validatedAt: number // epoch ms, when the validated ledger holding it was announced
}

export function resultCode(tx: Validated): string {
  return (tx.meta as TransactionMetadata).TransactionResult
}

// onSubmit runs right before each `submit` request, so callers can time from the first submit.
export async function submitTx(
  conn: Connection,
  tx: SubmittableTransaction,
  wallet: Wallet,
  opts: SubmitOptions,
  onSubmit?: (at: number) => void,
): Promise<Submitted> {
  const type = tx.TransactionType
  let submittedAt: number | undefined
  for (let attempt = 1; ; attempt++) {
    const { hash, inner, preliminary, lastLedger } = await serialize(tx.Account, async () => {
      const client = await conn.ready()
      // autofill mutates Batch inner transactions, so every attempt starts from a fresh copy. The
      // placeholder LastLedgerSequence stops autofill fetching its own; ours is set just below.
      const [validatedLedger, filled] = await Promise.all([
        client.getLedgerIndex(),
        client.autofill({ ...structuredClone(tx), LastLedgerSequence: 0 }),
      ])
      filled.LastLedgerSequence = validatedLedger + opts.ledgerOffset
      const { tx_blob, hash } = wallet.sign(filled)
      // Inner Batch transactions are unsigned, so their hashes are known before submitting.
      const inner =
        filled.TransactionType === 'Batch'
          ? (filled as Batch).RawTransactions.map(({ RawTransaction }) => ({
              type: RawTransaction.TransactionType,
              hash: hashes.hashSignedTx(RawTransaction),
            }))
          : []
      const at = Date.now()
      submittedAt ??= at
      onSubmit?.(at)
      const { result } = await client.request({ command: 'submit', tx_blob })
      return { hash, inner, preliminary: result.engine_result, lastLedger: filled.LastLedgerSequence }
    })

    if (preliminary === 'tefPAST_SEQ' && attempt === 1) {
      opts.log(`${type} ${hash} ${preliminary} (retrying with a fresh sequence)`)
      continue
    }
    if (/^(tem|tef|tel)/.test(preliminary)) {
      opts.log(`${type} ${hash} ${preliminary}`)
      throw errorForResult(preliminary, type)
    }

    const hashesToCheck = [hash, ...inner.map((i) => i.hash)]
    const outcome = await waitForValidation(conn, hashesToCheck, lastLedger, Date.now() + opts.timeoutMs)
    if (!outcome) {
      // Past LastLedgerSequence, so this hash can never apply and a fresh submit can't double up.
      if (preliminary === 'terQUEUED' && attempt === 1) {
        opts.log(`${type} ${hash} ${preliminary} expired (retrying)`)
        continue
      }
      opts.log(`${type} ${hash} expired (preliminary ${preliminary})`)
      throw new LedgerError('LEDGER_TIMEOUT', `${type} ${hash} was not validated by ledger ${lastLedger}`, preliminary)
    }

    const [validated, ...innerResults] = outcome.results
    const code = resultCode(validated!)
    opts.log(`${type} ${hash} ${code} ledger=${validated!.ledger_index}`)
    const innerCodes = innerResults.map((r) => (r ? resultCode(r) : 'not applied'))
    inner.forEach((i, n) => opts.log(`${i.type} ${i.hash} ${innerCodes[n]} (in Batch ${hash})`))
    if (code !== 'tesSUCCESS') throw errorForResult(code, type)
    // The outer Batch is tesSUCCESS even when its inner transactions fail, so each is checked too.
    if (innerCodes.some((c) => c !== 'tesSUCCESS')) {
      throw new LedgerError('LEDGER_REJECTED', `Batch ${hash} inner transactions: ${innerCodes.join(', ')}`)
    }
    return { tx: validated!, inner: innerResults as Validated[], submittedAt: submittedAt!, validatedAt: outcome.validatedAt }
  }
}

// One account's transactions are prepared and submitted one at a time, so concurrent calls (two
// tabs settling at once) never autofill the same Sequence. Waiting for validation stays concurrent.
const accountQueues = new Map<string, Promise<unknown>>()

function serialize<T>(account: string, fn: () => Promise<T>): Promise<T> {
  const next = (accountQueues.get(account) ?? Promise.resolve()).then(fn, fn)
  accountQueues.set(account, next.catch(() => {}))
  return next
}

// Checks after every validated-ledger announcement. Resolves with the results for `hashes` (the
// first is the submitted transaction; the rest, Batch inner transactions, are null if not applied),
// or null once the ledger is past lastLedger without the transaction.
async function waitForValidation(
  conn: Connection,
  hashes: string[],
  lastLedger: number,
  deadline: number,
): Promise<{ results: (Validated | null)[]; validatedAt: number } | null> {
  while (Date.now() < deadline) {
    // Listen before checking, so an announcement that lands mid-check still wakes the next round.
    const next = conn.nextValidatedLedger(FALLBACK_CHECK_MS)
    let inAnnouncedLedger = false
    try {
      const client = await conn.ready()
      const [validatedLedger, ...found] = await Promise.all([
        client.getLedgerIndex(),
        ...hashes.map((hash) => lookupTx(client, hash)),
      ])
      const tx = found[0]
      if (tx?.validated) {
        const validatedAt = conn.announcedAt(tx.ledger_index!) ?? Date.now()
        return { results: found.map((r) => (r?.validated ? r : null)), validatedAt }
      }
      if (validatedLedger > lastLedger) {
        // It may have landed in lastLedger itself after the lookup above ran.
        const last = await lookupTx(client, hashes[0])
        if (!last?.validated) return null
        continue
      }
      // The server can announce a ledger a moment before `tx` reports it validated.
      inAnnouncedLedger = tx?.ledger_index != null && conn.announcedAt(tx.ledger_index) != null
    } catch (error) {
      // A dropped socket is retried on the next round; anything else is a real error.
      if (conn.client.isConnected()) throw error
    }
    await (inAnnouncedLedger ? sleep(100) : next)
  }
  throw new LedgerError('LEDGER_TIMEOUT', `no validated result for ${hashes[0]} before the timeout`)
}

async function lookupTx(client: XrplClient, hash: string): Promise<Validated | null> {
  try {
    return (await client.request({ command: 'tx', transaction: hash })).result
  } catch (error) {
    if ((error as { data?: { error?: string } }).data?.error === 'txnNotFound') return null
    throw error
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
