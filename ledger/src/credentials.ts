// L7: is a member credentialed? An accepted, unexpired CLUB_MEMBER Credential from our issuer.
import type { Client, LedgerEntry } from 'xrpl'
import { rippleTimeToUnixTime } from 'xrpl'
import { CREDENTIAL_CACHE_MS, CREDENTIAL_TYPE_HEX } from './config.ts'
import { LedgerError } from './errors.ts'

// lsfAccepted: the subject has accepted the credential; until then it isn't valid.
const LSF_ACCEPTED = 0x00010000

export type CredentialEntry = Pick<LedgerEntry.Credential, 'Flags' | 'Expiration'>
export type CredentialLookup = (subject: string) => Promise<CredentialEntry | null>

// The issuer's CLUB_MEMBER credential for `subject` on the last validated ledger, or null.
export function ledgerCredentialLookup(client: () => Promise<Client>, issuer: string): CredentialLookup {
  return async (subject) => {
    try {
      const { result } = await (await client()).request({
        command: 'ledger_entry',
        // rippled wants credential_type; xrpl.js types it as credentialType, which rippled rejects.
        credential: { subject, issuer, credential_type: CREDENTIAL_TYPE_HEX } as never,
        ledger_index: 'validated',
      })
      return result.node as LedgerEntry.Credential
    } catch (error) {
      if ((error as { data?: { error?: string } }).data?.error === 'entryNotFound') return null
      throw error
    }
  }
}

export function isValidCredential(entry: CredentialEntry | null, nowMs = Date.now()): boolean {
  if (!entry || (Number(entry.Flags) & LSF_ACCEPTED) === 0) return false
  return entry.Expiration === undefined || rippleTimeToUnixTime(entry.Expiration) > nowMs
}

// Only confirmed credentials are cached, so a re-issued one counts on the next open; a revoked one
// stops counting within CREDENTIAL_CACHE_MS.
export function credentialChecker(lookup: CredentialLookup, ttlMs = CREDENTIAL_CACHE_MS, now = Date.now) {
  const confirmed = new Map<string, number>()

  async function refresh(subject: string): Promise<boolean> {
    const ok = isValidCredential(await lookup(subject), now())
    if (ok) confirmed.set(subject, now())
    else confirmed.delete(subject)
    return ok
  }

  async function isCredentialed(subject: string): Promise<boolean> {
    const at = confirmed.get(subject)
    return (at !== undefined && now() - at < ttlMs) || refresh(subject)
  }

  async function assertCredentialed(subject: string): Promise<void> {
    if (!(await isCredentialed(subject))) throw new LedgerError('INVALID_INPUT', 'member is not credentialed')
  }

  return { isCredentialed, assertCredentialed, refresh }
}
