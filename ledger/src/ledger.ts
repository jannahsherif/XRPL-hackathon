import { isoTimeToRippleTime, rippleTimeToISOTime } from 'xrpl'
import { assertAmount } from './amounts.ts'
import { SUBMIT_DEFAULTS, TAB_DEFAULTS, TESTNET, TOKEN, type TokenName, resolveToken } from './config.ts'
import { loadAccounts, loadEnv, loadWallets, memberAddress } from './keys.ts'
import { type SubmitOptions, connect, submitTx } from './submit.ts'

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

  async function settleTab(_args: { tab: Tab; amount: string; tipAmount: string }): Promise<never> {
    throw new Error('settleTab lands in L4')
  }

  async function cancelTab(_args: { tab: Tab }): Promise<never> {
    throw new Error('cancelTab lands in L5')
  }

  async function getBalances(): Promise<never> {
    throw new Error('getBalances lands in L6')
  }

  return { openTab, settleTab, cancelTab, getBalances, explorerUrl: urlFor, token, close: () => conn.close() }
}

export type Ledger = ReturnType<typeof createLedger>
