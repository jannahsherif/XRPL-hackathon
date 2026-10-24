import { describe, expect, it } from 'vitest'
import { add, assertAmount, compare, refundFor, sub } from '../src/amounts.ts'

describe('amount math on decimal strings', () => {
  it('adds and subtracts without float error', () => {
    expect(add('0.1', '0.2')).toBe('0.3')
    expect(sub('100', '37.25')).toBe('62.75')
    expect(sub('5', '5.000')).toBe('0')
    expect(sub('1.5', '2')).toBe('-0.5')
    expect(compare('10.10', '10.1')).toBe(0)
  })

  it('computes the refund as allowance − amount − tip', () => {
    expect(refundFor('100', '37.25', '5.5')).toBe('57.25')
    expect(refundFor('50', '45', '5')).toBe('0')
    expect(refundFor('0.3', '0.1', '0.1')).toBe('0.1')
  })

  it('rejects spend over the allowance with INSUFFICIENT_FUNDS', () => {
    expect(() => refundFor('100', '95', '5.01')).toThrow(expect.objectContaining({ code: 'INSUFFICIENT_FUNDS' }))
  })

  it('rejects amounts that are not plain non-negative decimal strings', () => {
    for (const bad of ['1e3', '-5', '12.', '', ' 1', 10]) {
      expect(() => assertAmount(bad, 'amount')).toThrow(expect.objectContaining({ code: 'INVALID_INPUT' }))
    }
    expect(() => assertAmount('0', 'allowance', { positive: true })).toThrow(/greater than zero/)
    expect(assertAmount('0', 'tipAmount')).toBe('0')
  })
})
