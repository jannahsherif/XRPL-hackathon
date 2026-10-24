// INSUFFICIENT_FUNDS, ESCROW_NOT_FOUND and LEDGER_TIMEOUT are the codes in the API contract.
// LEDGER_REJECTED (any other ledger failure) and INVALID_INPUT cover everything else.
export type LedgerErrorCode =
  | 'INSUFFICIENT_FUNDS'
  | 'ESCROW_NOT_FOUND'
  | 'LEDGER_TIMEOUT'
  | 'LEDGER_REJECTED'
  | 'INVALID_INPUT'

export class LedgerError extends Error {
  readonly code: LedgerErrorCode
  // XRPL engine result (e.g. "tecUNFUNDED") when the ledger returned one.
  readonly result?: string

  constructor(code: LedgerErrorCode, message: string, result?: string) {
    super(message)
    this.name = 'LedgerError'
    this.code = code
    this.result = result
  }
}

const INSUFFICIENT_FUNDS_RESULTS = new Set([
  'tecUNFUNDED',
  'tecUNFUNDED_PAYMENT',
  'tecINSUFFICIENT_FUNDS',
  'tecPATH_PARTIAL',
  'tecPATH_DRY',
  'tecINSUFFICIENT_RESERVE',
  'tecNO_LINE_INSUF_RESERVE',
])

export function errorForResult(result: string, txType: string): LedgerError {
  const message = `${txType} failed: ${result}`
  if (INSUFFICIENT_FUNDS_RESULTS.has(result)) return new LedgerError('INSUFFICIENT_FUNDS', message, result)
  if (result === 'tecNO_TARGET') return new LedgerError('ESCROW_NOT_FOUND', message, result)
  return new LedgerError('LEDGER_REJECTED', message, result)
}
