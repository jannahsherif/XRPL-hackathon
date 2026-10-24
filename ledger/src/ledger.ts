import type { Batch, EscrowFinish, IssuedCurrencyAmount, LedgerEntry, Payment } from 'xrpl'
import { BatchFlags, GlobalFlags, hashes, isoTimeToRippleTime, rippleTimeToISOTime } from 'xrpl'
import { assertAmount, isZero, refundFor, sub } from './amounts.ts'
import { SUBMIT_DEFAULTS, TAB_DEFAULTS, TESTNET, TOKEN, type TokenName, resolveToken } from './config.ts'
import { LedgerError } from './errors.ts'
import { loadAccounts, loadEnv, loadWallets, memberAddress } from './keys.ts'
import { type SubmitOptions, connect, lookupTx, resultCode, sleep, submitTx } from './submit.ts'

// Everything here is optional; seeds are never passed in, they stay in ledger/.env.
export type LedgerConfig = {
  wsUrl?: string
  token?: TokenName
  envPath?: string
  accountsPath?: string
  explorerBase?: string
  finishAfterSeconds?: number
  cancelAfterSeconds?: number
  useBatch?: boolean
  ledgerOffset?: number
  timeoutMs?: number
  log?: (line: string) => void
}

export type OpenTabResult = {
  escrowSeq: number
  txHash: string
  explorerUrl: string
  ledgerIndex: number
  // Beyond the contract, for display: the escrowed amount and its time window (ISO 8601).
  allowance: string
  finishAfter: string
  cancelAfter: string
}

// "Whatever openTab returned plus memberId". Only memberId and escrowSeq are relied on.
export type Tab = Partial<OpenTabResult> & { memberId: string; escrowSeq: number }

type Settlement = {
  finishTxHash: string
  refundTxHash: string | null // null when nothing is left to refund
  // Beyond the contract: how the tab settled, and the outer Batch hash when it was batched.
  mode: 'batch' | 'sequential'
  batchTxHash?: string
}

export type SettleTabResult = Settlement & {
  toVenue: string
  toMember: string
  elapsedMs: number
  explorerUrls: string[]
}

export function explorerUrl(hash: string, explorerBase = TESTNET.explorerBase): string {
  return `${explorerBase}/transactions/${hash}`
}

export function createLedger(config: LedgerConfig = {}) {
  const accounts = loadAccounts(config.accountsPath)
  const wallets = loadWallets(accounts, config.envPath)
  const token = resolveToken(config.token ?? TOKEN, accounts)
  const explorerBase = config.explorerBase ?? TESTNET.explorerBase
  const conn = connect(config.wsUrl ?? loadEnv(config.envPath).XRPL_WS_URL ?? TESTNET.wsUrl)
  const opts: SubmitOptions = {
    ledgerOffset: config.ledgerOffset ?? SUBMIT_DEFAULTS.ledgerOffset,
    timeoutMs: config.timeoutMs ?? SUBMIT_DEFAULTS.timeoutMs,
    log: config.log ?? SUBMIT_DEFAULTS.log,
  }
  const finishAfterSeconds = config.finishAfterSeconds ?? TAB_DEFAULTS.finishAfterSeconds
  const cancelAfterSeconds = config.cancelAfterSeconds ?? TAB_DEFAULTS.cancelAfterSeconds
  const useBatch = config.useBatch ?? true
  const venue = wallets.get('venue')!

  const tokenAmount = (value: string) => ({ currency: token.currency, issuer: token.issuer, value })
  const urlFor = (hash: string) => explorerUrl(hash, explorerBase)

  // L3: escrow `allowance` from the member to the venue. Token escrows must expire, so CancelAfter
  // is set to close of night; FinishAfter lets the venue claim it a few seconds after opening.
  async function openTab({ memberId, allowance }: { memberId: string; allowance: string }): Promise<OpenTabResult> {
    memberAddress(accounts, memberId)
    assertAmount(allowance, 'allowance', { positive: true })
    const member = wallets.get(memberId)!
    const now = Date.now()
    const finishAfter = isoTimeToRippleTime(new Date(now + finishAfterSeconds * 1000).toISOString())
    const cancelAfter = isoTimeToRippleTime(new Date(now + cancelAfterSeconds * 1000).toISOString())

    const tx = await submitTx(
      conn,
      {
        TransactionType: 'EscrowCreate',
        Account: member.address,
        Destination: venue.address,
        Amount: tokenAmount(allowance),
        FinishAfter: finishAfter,
        CancelAfter: cancelAfter,
      },
      member,
      opts,
    )
    return {
      escrowSeq: tx.tx_json.Sequence!,
      txHash: tx.hash,
      explorerUrl: urlFor(tx.hash),
      ledgerIndex: tx.ledger_index!,
      allowance,
      finishAfter: rippleTimeToISOTime(finishAfter),
      cancelAfter: rippleTimeToISOTime(cancelAfter),
    }
  }

  // The tab's escrow as it stands on the last validated ledger. Only TUSD (the configured token)
  // escrows from the member to our venue count as tabs.
  async function getTabEscrow(tab: Tab) {
    const owner = memberAddress(accounts, tab.memberId)
    const client = await conn.ready()
    let escrow: LedgerEntry.Escrow
    try {
      const { result } = await client.request({
        command: 'ledger_entry',
        escrow: { owner, seq: tab.escrowSeq },
        ledger_index: 'validated',
      })
      escrow = result.node as LedgerEntry.Escrow
    } catch (error) {
      if ((error as { data?: { error?: string } }).data?.error !== 'entryNotFound') throw error
      throw new LedgerError('ESCROW_NOT_FOUND', `no open escrow ${tab.escrowSeq} for ${tab.memberId}: already settled, cancelled, or never created`)
    }
    // xrpl.js types Escrow.Amount as XRP drops; token escrows hold an issued-currency object.
    const amount = escrow.Amount as unknown as IssuedCurrencyAmount
    if (escrow.Destination !== venue.address || amount.currency !== token.currency || amount.issuer !== token.issuer) {
      throw new LedgerError('ESCROW_NOT_FOUND', `escrow ${tab.escrowSeq} for ${tab.memberId} is not a ${token.name} tab with this venue`)
    }
    return { owner, allowance: amount.value, finishAfter: escrow.FinishAfter ?? 0 }
  }

  // EscrowFinish only succeeds once a validated ledger has closed after FinishAfter. Ledger close
  // times have 10s resolution on testnet, so that can trail FinishAfter by up to ~10s.
  async function waitForCloseAfter(rippleTime: number): Promise<void> {
    const giveUpAt = Date.now() + 60_000
    for (;;) {
      const client = await conn.ready()
      const { ledger } = (await client.request({ command: 'ledger', ledger_index: 'validated' })).result
      // Past the cap, submit anyway and let the ledger give the verdict.
      if (ledger.close_time > rippleTime || Date.now() > giveUpAt) return
      await sleep(500)
    }
  }

  async function waitForFinishAfter(tab: Tab): Promise<void> {
    await waitForCloseAfter((await getTabEscrow(tab)).finishAfter)
  }

  // L4: the venue finishes the escrow (the full allowance goes to the venue), then pays the unspent
  // remainder back to the member. Both go in one all-or-nothing Batch when possible; if the Batch
  // fails for any reason they go as two transactions, each waited on until validated.
  async function settleTab({ tab, amount, tipAmount }: { tab: Tab; amount: string; tipAmount: string }): Promise<SettleTabResult> {
    assertAmount(amount, 'amount')
    assertAmount(tipAmount, 'tipAmount')
    const escrow = await getTabEscrow(tab)
    const toMember = refundFor(escrow.allowance, amount, tipAmount)
    const toVenue = sub(escrow.allowance, toMember)
    await waitForCloseAfter(escrow.finishAfter)

    const finish: EscrowFinish = {
      TransactionType: 'EscrowFinish',
      Account: venue.address,
      Owner: escrow.owner,
      OfferSequence: tab.escrowSeq,
    }
    const refund: Payment | null = isZero(toMember)
      ? null
      : { TransactionType: 'Payment', Account: venue.address, Destination: escrow.owner, Amount: tokenAmount(toMember) }

    // elapsedMs runs from the first `submit` request to the last validation.
    let started: number | undefined
    const onSubmit = () => {
      started ??= performance.now()
    }
    let settlement: Settlement | undefined
    if (refund && useBatch) {
      try {
        settlement = await settleInBatch(finish, refund, onSubmit)
      } catch (error) {
        opts.log(`Batch settle failed (${describe(error)}); falling back to sequential EscrowFinish then Payment`)
      }
    }
    settlement ??= await settleSequentially(finish, refund, onSubmit)
    const elapsedMs = Math.round(performance.now() - started!)

    const txHashes = [settlement.finishTxHash, settlement.refundTxHash, settlement.batchTxHash].filter((h) => h != null)
    return { ...settlement, toVenue, toMember, elapsedMs, explorerUrls: txHashes.map(urlFor) }
  }

  async function settleInBatch(finish: EscrowFinish, refund: Payment, onSubmit: () => void): Promise<Settlement> {
    const batch = await submitTx(
      conn,
      {
        TransactionType: 'Batch',
        Account: venue.address,
        Flags: BatchFlags.tfAllOrNothing,
        RawTransactions: [finish, refund].map((tx) => ({ RawTransaction: { ...tx, Flags: GlobalFlags.tfInnerBatchTxn } })),
      },
      venue,
      opts,
      onSubmit,
    )
    // The outer Batch is tesSUCCESS even when its inner transactions fail, so check each by hash.
    const inner = (batch.tx_json as Batch).RawTransactions.map(({ RawTransaction }) => RawTransaction)
    const innerHashes = inner.map((tx) => hashes.hashSignedTx(tx))
    const client = await conn.ready()
    const results = await Promise.all(innerHashes.map((hash) => lookupTx(client, hash)))
    const codes = results.map((r) => (r?.validated ? resultCode(r) : 'not applied'))
    inner.forEach((tx, i) => opts.log(`${tx.TransactionType} ${innerHashes[i]} ${codes[i]} (in Batch ${batch.hash})`))
    if (codes.some((code) => code !== 'tesSUCCESS')) {
      throw new LedgerError('LEDGER_REJECTED', `Batch ${batch.hash} inner transactions: ${codes.join(', ')}`)
    }
    return { finishTxHash: innerHashes[0], refundTxHash: innerHashes[1], mode: 'batch', batchTxHash: batch.hash }
  }

  async function settleSequentially(finish: EscrowFinish, refund: Payment | null, onSubmit: () => void): Promise<Settlement> {
    const finished = await submitTx(conn, finish, venue, opts, onSubmit)
    if (!refund) return { finishTxHash: finished.hash, refundTxHash: null, mode: 'sequential' }
    try {
      const refunded = await submitTx(conn, refund, venue, opts, onSubmit)
      return { finishTxHash: finished.hash, refundTxHash: refunded.hash, mode: 'sequential' }
    } catch (error) {
      // The venue now holds the full allowance; say so, so the refund can be retried by hand.
      const { code = 'LEDGER_REJECTED', result } = error as Partial<LedgerError>
      throw new LedgerError(code, `escrow finished (${finished.hash}) but the refund to the member failed: ${(error as Error).message}`, result)
    }
  }

  async function cancelTab(_args: { tab: Tab }): Promise<never> {
    throw new Error('cancelTab lands in L5')
  }

  async function getBalances(): Promise<never> {
    throw new Error('getBalances lands in L6')
  }

  return {
    openTab,
    settleTab,
    cancelTab,
    getBalances,
    waitForFinishAfter,
    explorerUrl: urlFor,
    token,
    close: () => conn.close(),
  }
}

function describe(error: unknown): string {
  if (error instanceof LedgerError) return [error.code, error.result].filter(Boolean).join(' ')
  return (error as Error).message
}

export type Ledger = ReturnType<typeof createLedger>
