import type { EscrowFinish, IssuedCurrencyAmount, LedgerEntry, Payment } from 'xrpl'
import { BatchFlags, GlobalFlags, isoTimeToRippleTime, rippleTimeToISOTime } from 'xrpl'
import { trustLineBalance } from './admin.ts'
import { assertAmount, isZero, refundFor, sub } from './amounts.ts'
import { SUBMIT_DEFAULTS, TAB_DEFAULTS, TESTNET, TOKEN, type TokenName, resolveToken } from './config.ts'
import { LedgerError } from './errors.ts'
import { loadAccounts, loadEnv, loadWallets, memberAddress } from './keys.ts'
import { type SubmitOptions, type Submitted, connect, submitTx } from './submit.ts'

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

// submittedAt is just before the first submit request; validatedAt is when the server announced
// the validated ledger holding the last transaction. Both ISO 8601.
type Timing = { submittedAt: string; validatedAt: string }

export type OpenTabResult = Timing & {
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

export type SettleTabResult = Settlement &
  Timing & {
    toVenue: string
    toMember: string
    elapsedMs: number // validatedAt - submittedAt
    explorerUrls: string[]
  }

export type CancelTabResult = {
  txHash: string
  explorerUrl: string
  // EscrowCancel once the escrow has expired; before that, finish to the venue + full refund.
  via: 'EscrowCancel' | 'refund'
}

export type Balances = { venue: string; members: Record<string, string> }

export function explorerUrl(hash: string, explorerBase = TESTNET.explorerBase): string {
  return `${explorerBase}/transactions/${hash}`
}

const iso = (epochMs: number) => new Date(epochMs).toISOString()

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

    const { tx, submittedAt, validatedAt } = await submitTx(
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
      submittedAt: iso(submittedAt),
      validatedAt: iso(validatedAt),
      allowance,
      finishAfter: rippleTimeToISOTime(finishAfter),
      cancelAfter: rippleTimeToISOTime(cancelAfter),
    }
  }

  // The tab's escrow as it stands on the last validated ledger. Only escrows of the configured
  // token from the member to our venue count as tabs.
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
    return { owner, allowance: amount.value, finishAfter: escrow.FinishAfter ?? 0, cancelAfter: escrow.CancelAfter ?? 0 }
  }

  async function validatedCloseTime(): Promise<number> {
    const client = await conn.ready()
    return (await client.request({ command: 'ledger', ledger_index: 'validated' })).result.ledger.close_time
  }

  // EscrowFinish only succeeds once a validated ledger has closed after FinishAfter. Ledger close
  // times have 10s resolution on testnet, so that can trail FinishAfter by up to ~10s.
  async function waitForCloseAfter(rippleTime: number): Promise<void> {
    const giveUpAt = Date.now() + 60_000
    for (;;) {
      const next = conn.nextValidatedLedger(4_000)
      // Past the cap, submit anyway and let the ledger give the verdict.
      if ((await validatedCloseTime()) > rippleTime || Date.now() > giveUpAt) return
      await next
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
    if ((await validatedCloseTime()) > escrow.cancelAfter) {
      throw new LedgerError('LEDGER_REJECTED', `escrow ${tab.escrowSeq} expired at ${rippleTimeToISOTime(escrow.cancelAfter)}; cancelTab returns it to the member`)
    }
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

    // Timed from the first submit request, even if that was a Batch that then failed.
    let submittedAt: number | undefined
    const onSubmit = (at: number) => {
      submittedAt ??= at
    }
    let settlement: (Settlement & { validatedAt: number }) | undefined
    if (refund && useBatch) {
      try {
        settlement = await settleInBatch(finish, refund, onSubmit)
      } catch (error) {
        opts.log(`Batch settle failed (${describe(error)}); falling back to sequential EscrowFinish then Payment`)
      }
    }
    settlement ??= await settleSequentially(finish, refund, onSubmit)

    const { validatedAt, ...hashes } = settlement
    const txHashes = [hashes.finishTxHash, hashes.refundTxHash, hashes.batchTxHash].filter((h) => h != null)
    return {
      ...hashes,
      toVenue,
      toMember,
      submittedAt: iso(submittedAt!),
      validatedAt: iso(validatedAt),
      elapsedMs: validatedAt - submittedAt!,
      explorerUrls: txHashes.map(urlFor),
    }
  }

  async function settleInBatch(finish: EscrowFinish, refund: Payment, onSubmit: (at: number) => void) {
    // submitTx checks every inner transaction and throws unless both succeeded.
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
    const [finished, refunded] = batch.inner
    return {
      finishTxHash: finished.hash,
      refundTxHash: refunded.hash,
      mode: 'batch' as const,
      batchTxHash: batch.tx.hash,
      validatedAt: batch.validatedAt,
    }
  }

  async function settleSequentially(finish: EscrowFinish, refund: Payment | null, onSubmit: (at: number) => void) {
    const finished = await submitTx(conn, finish, venue, opts, onSubmit)
    let refunded: Submitted | undefined
    if (refund) {
      try {
        refunded = await submitTx(conn, refund, venue, opts, onSubmit)
      } catch (error) {
        // The venue now holds the full allowance; say so, so the refund can be retried by hand.
        const { code = 'LEDGER_REJECTED', result } = error as Partial<LedgerError>
        throw new LedgerError(code, `escrow finished (${finished.tx.hash}) but the refund to the member failed: ${(error as Error).message}`, result)
      }
    }
    return {
      finishTxHash: finished.tx.hash,
      refundTxHash: refunded?.tx.hash ?? null,
      mode: 'sequential' as const,
      validatedAt: (refunded ?? finished).validatedAt,
    }
  }

  // L5: close a tab with nothing spent. An expired escrow (past CancelAfter) can only be cancelled,
  // which returns it to the member; before that, the venue finishes it and refunds it in full.
  async function cancelTab({ tab }: { tab: Tab }): Promise<CancelTabResult> {
    const escrow = await getTabEscrow(tab)
    if ((await validatedCloseTime()) > escrow.cancelAfter) {
      const { tx } = await submitTx(
        conn,
        { TransactionType: 'EscrowCancel', Account: venue.address, Owner: escrow.owner, OfferSequence: tab.escrowSeq },
        venue,
        opts,
      )
      return { txHash: tx.hash, explorerUrl: urlFor(tx.hash), via: 'EscrowCancel' }
    }
    const { refundTxHash } = await settleTab({ tab, amount: '0', tipAmount: '0' })
    return { txHash: refundTxHash!, explorerUrl: urlFor(refundTxHash!), via: 'refund' }
  }

  // L6: trust-line balances in the tab token. Tokens locked in open tabs are not included.
  async function getBalances(): Promise<Balances> {
    const client = await conn.ready()
    const balanceOf = async (address: string) => (await trustLineBalance(client, address, token)) ?? '0'
    const ids = Object.keys(accounts.members)
    const [venueBalance, ...memberBalances] = await Promise.all([
      balanceOf(venue.address),
      ...ids.map((id) => balanceOf(accounts.members[id])),
    ])
    return { venue: venueBalance, members: Object.fromEntries(ids.map((id, i) => [id, memberBalances[i]])) }
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

export type Ledger = ReturnType<typeof createLedger>

function describe(error: unknown): string {
  if (error instanceof LedgerError) return [error.code, error.result].filter(Boolean).join(' ')
  return (error as Error).message
}
