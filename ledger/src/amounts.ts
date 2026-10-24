// Token amounts are decimal strings. Math runs on scaled BigInts so no value passes through a float.
import { LedgerError } from './errors.ts'

const DECIMAL = /^-?\d+(\.\d+)?$/
const NON_NEGATIVE = /^\d+(\.\d+)?$/

type Scaled = { units: bigint; scale: number }

function parse(value: string): Scaled {
  if (typeof value !== 'string' || !DECIMAL.test(value)) {
    throw new LedgerError('INVALID_INPUT', `not a decimal string: ${JSON.stringify(value)}`)
  }
  const negative = value.startsWith('-')
  const [int, frac = ''] = value.replace('-', '').split('.')
  const units = BigInt(int + frac)
  return { units: negative ? -units : units, scale: frac.length }
}

function align(a: Scaled, b: Scaled): [bigint, bigint, number] {
  const scale = Math.max(a.scale, b.scale)
  return [a.units * 10n ** BigInt(scale - a.scale), b.units * 10n ** BigInt(scale - b.scale), scale]
}

function format(units: bigint, scale: number): string {
  const negative = units < 0n
  const digits = (negative ? -units : units).toString().padStart(scale + 1, '0')
  const int = digits.slice(0, digits.length - scale)
  const frac = digits.slice(digits.length - scale).replace(/0+$/, '')
  const text = frac ? `${int}.${frac}` : int
  return negative && text !== '0' ? `-${text}` : text
}

export function add(a: string, b: string): string {
  const [x, y, scale] = align(parse(a), parse(b))
  return format(x + y, scale)
}

export function sub(a: string, b: string): string {
  const [x, y, scale] = align(parse(a), parse(b))
  return format(x - y, scale)
}

export function compare(a: string, b: string): -1 | 0 | 1 {
  const [x, y] = align(parse(a), parse(b))
  return x < y ? -1 : x > y ? 1 : 0
}

export function isZero(a: string): boolean {
  return compare(a, '0') === 0
}

// Validates an amount coming in from the API: a non-negative decimal string (positive if required).
export function assertAmount(value: unknown, field: string, { positive = false } = {}): string {
  if (typeof value !== 'string' || !NON_NEGATIVE.test(value)) {
    throw new LedgerError('INVALID_INPUT', `${field} must be a non-negative decimal string, got ${JSON.stringify(value)}`)
  }
  if (positive && isZero(value)) throw new LedgerError('INVALID_INPUT', `${field} must be greater than zero`)
  return value
}

// What the member gets back when a tab settles: allowance − amount − tip.
export function refundFor(allowance: string, amount: string, tipAmount: string): string {
  const refund = sub(sub(allowance, amount), tipAmount)
  if (compare(refund, '0') < 0) {
    throw new LedgerError(
      'INSUFFICIENT_FUNDS',
      `amount ${amount} + tip ${tipAmount} exceeds the escrowed allowance ${allowance}`,
    )
  }
  return refund
}
