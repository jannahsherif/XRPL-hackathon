// One persistent WebSocket client, and transaction submission on top of it.
//
// submitTx follows the same steps as xrpl.js submitAndWait (autofill, sign, submit, poll `tx` until
// validated or LastLedgerSequence passes), but it reads the preliminary result so it can retry
// tefPAST_SEQ immediately (submitAndWait would wait out LastLedgerSequence first) and polls every
// 250ms instead of every second.
import type { Client as XrplClient, SubmittableTransaction, TransactionMetadata, TxResponse, Wallet } from 'xrpl'
import { Client } from 'xrpl'
import { LedgerError, errorForResult } from './errors.ts'

const POLL_MS = 250

export type Connection = {
  client: XrplClient
  ready(): Promise<XrplClient>
  close(): Promise<void>
}

// xrpl.js reconnects on its own after an unexpected close; ready() also covers the first connect
// and any window where a reconnect is still in flight.
export function connect(url: string): Connection {
  const client = new Client(url)
  let pending: Promise<void> | undefined
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

export function resultCode(tx: Validated): string {
  return (tx.meta as TransactionMetadata).TransactionResult
}

// onSubmit runs right before each `submit` request, so callers can time from the first submit.
export async function submitTx(
  conn: Connection,
  tx: SubmittableTransaction,
  wallet: Wallet,
  opts: SubmitOptions,
  onSubmit?: () => void,
): Promise<Validated> {
  const type = tx.TransactionType
  for (let attempt = 1; ; attempt++) {
    const client = await conn.ready()
    // autofill mutates Batch inner transactions, so every attempt starts from a fresh copy. The
    // placeholder LastLedgerSequence stops autofill fetching its own; ours is set just below.
    const [validatedLedger, filled] = await Promise.all([
      client.getLedgerIndex(),
      client.autofill({ ...structuredClone(tx), LastLedgerSequence: 0 }),
    ])
    filled.LastLedgerSequence = validatedLedger + opts.ledgerOffset
    const { tx_blob, hash } = wallet.sign(filled)
    onSubmit?.()
    const preliminary = (await client.request({ command: 'submit', tx_blob })).result.engine_result

    if (preliminary === 'tefPAST_SEQ' && attempt === 1) {
      opts.log(`${type} ${hash} ${preliminary} (retrying with a fresh sequence)`)
      continue
    }
    if (/^(tem|tef|tel)/.test(preliminary)) {
      opts.log(`${type} ${hash} ${preliminary}`)
      throw errorForResult(preliminary, type)
    }

    const validated = await waitForValidation(conn, hash, filled.LastLedgerSequence!, Date.now() + opts.timeoutMs)
    if (!validated) {
      // Past LastLedgerSequence, so this hash can never apply and a fresh submit can't double up.
      if (preliminary === 'terQUEUED' && attempt === 1) {
        opts.log(`${type} ${hash} ${preliminary} expired (retrying)`)
        continue
      }
      opts.log(`${type} ${hash} expired (preliminary ${preliminary})`)
      throw new LedgerError('LEDGER_TIMEOUT', `${type} ${hash} was not validated by ledger ${filled.LastLedgerSequence}`, preliminary)
    }

    const code = resultCode(validated)
    opts.log(`${type} ${hash} ${code}`)
    if (code !== 'tesSUCCESS') throw errorForResult(code, type)
    return validated
  }
}

// Resolves with the validated tx, or null once the ledger is past lastLedger without it.
async function waitForValidation(
  conn: Connection,
  hash: string,
  lastLedger: number,
  deadline: number,
): Promise<Validated | null> {
  while (Date.now() < deadline) {
    try {
      const client = await conn.ready()
      const [tx, validatedLedger] = await Promise.all([lookupTx(client, hash), client.getLedgerIndex()])
      if (tx?.validated) return tx
      if (validatedLedger > lastLedger) {
        // It may have landed in lastLedger itself after the lookup above ran.
        const last = await lookupTx(client, hash)
        return last?.validated ? last : null
      }
    } catch (error) {
      // A dropped socket is retried on the next poll; anything else is a real error.
      if (conn.client.isConnected()) throw error
    }
    await sleep(POLL_MS)
  }
  throw new LedgerError('LEDGER_TIMEOUT', `no validated result for ${hash} before the timeout`)
}

export async function lookupTx(client: XrplClient, hash: string): Promise<Validated | null> {
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
