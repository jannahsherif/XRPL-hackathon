import { describe, expect, it, vi } from 'vitest'
import { unixTimeToRippleTime } from 'xrpl'
import { CREDENTIAL_TYPE_HEX } from '../src/config.ts'
import { type CredentialEntry, credentialChecker, isValidCredential } from '../src/credentials.ts'

const ACCEPTED = 0x00010000
const T0 = Date.parse('2026-10-25T02:00:00Z')

// A lookup backed by a map the test edits, and a clock the test moves.
function fixture(entries: Record<string, CredentialEntry | null> = {}) {
  let now = T0
  const lookup = vi.fn(async (subject: string) => entries[subject] ?? null)
  const checker = credentialChecker(lookup, 60_000, () => now)
  return { entries, lookup, checker, tick: (ms: number) => (now += ms) }
}

describe('CREDENTIAL_TYPE_HEX', () => {
  it('is CLUB_MEMBER as uppercase hex', () => {
    expect(CREDENTIAL_TYPE_HEX).toBe('434C55425F4D454D424552')
  })
})

describe('isValidCredential', () => {
  it('needs the entry, lsfAccepted, and no past expiration', () => {
    expect(isValidCredential(null, T0)).toBe(false)
    expect(isValidCredential({ Flags: 0 }, T0)).toBe(false)
    expect(isValidCredential({ Flags: ACCEPTED }, T0)).toBe(true)
    expect(isValidCredential({ Flags: ACCEPTED, Expiration: unixTimeToRippleTime(T0 + 60_000) }, T0)).toBe(true)
    expect(isValidCredential({ Flags: ACCEPTED, Expiration: unixTimeToRippleTime(T0 - 1_000) }, T0)).toBe(false)
  })
})

describe('credentialChecker', () => {
  it('lets an accepted member through and caches it for 60 s', async () => {
    const { lookup, checker, tick } = fixture({ rMember: { Flags: ACCEPTED } })
    await checker.assertCredentialed('rMember')
    tick(59_000)
    await checker.assertCredentialed('rMember')
    expect(lookup).toHaveBeenCalledTimes(1)
    tick(2_000)
    await checker.assertCredentialed('rMember')
    expect(lookup).toHaveBeenCalledTimes(2)
  })

  it.each([
    ['missing', null],
    ['not yet accepted', { Flags: 0 }],
  ])('refuses a %s credential with INVALID_INPUT', async (_label, entry) => {
    const { checker } = fixture({ rMember: entry })
    await expect(checker.assertCredentialed('rMember')).rejects.toMatchObject({ code: 'INVALID_INPUT', message: 'member is not credentialed' })
  })

  it('does not cache a refusal, so a re-issued credential counts on the next open', async () => {
    const { entries, lookup, checker } = fixture()
    await expect(checker.assertCredentialed('rMember')).rejects.toMatchObject({ code: 'INVALID_INPUT' })
    entries.rMember = { Flags: ACCEPTED }
    await checker.assertCredentialed('rMember')
    expect(lookup).toHaveBeenCalledTimes(2)
  })

  it('refresh looks up fresh, so a revocation shows up without waiting out the cache', async () => {
    const { entries, checker } = fixture({ rMember: { Flags: ACCEPTED } })
    await checker.assertCredentialed('rMember')
    entries.rMember = null
    expect(await checker.refresh('rMember')).toBe(false)
    await expect(checker.assertCredentialed('rMember')).rejects.toMatchObject({ code: 'INVALID_INPUT' })
  })

  it('propagates lookup failures instead of treating them as uncredentialed', async () => {
    const checker = credentialChecker(async () => Promise.reject(new Error('socket closed')))
    await expect(checker.assertCredentialed('rMember')).rejects.toThrow('socket closed')
  })
})
