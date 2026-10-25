// L7 demo beat: the issuer deletes a member's CLUB_MEMBER credential, so that member can no longer
// open a tab. `npm run setup:credentials` issues it again.
//   npm run revoke:credential -- member-4
import { CREDENTIAL_CACHE_MS, CREDENTIAL_TYPE, CREDENTIAL_TYPE_HEX, SUBMIT_DEFAULTS } from '../src/config.ts'
import { ledgerCredentialLookup } from '../src/credentials.ts'
import { loadAccounts, loadWallets, wsUrl } from '../src/keys.ts'
import { explorerUrl } from '../src/ledger.ts'
import { connect, submitTx } from '../src/submit.ts'

const memberId = process.argv[2]
const accounts = loadAccounts()
const subject = accounts.members[memberId]
if (!subject) {
  console.error(`usage: npm run revoke:credential -- <memberId>  (one of ${Object.keys(accounts.members).join(', ')})`)
  process.exit(1)
}
const issuer = loadWallets(accounts, undefined, ['issuer']).get('issuer')!
const conn = connect(wsUrl())
try {
  if (!(await ledgerCredentialLookup(() => conn.ready(), accounts.issuer)(subject))) {
    console.log(`${memberId} holds no ${CREDENTIAL_TYPE} credential; nothing to revoke`)
  } else {
    const deleted = { TransactionType: 'CredentialDelete', Account: issuer.address, Subject: subject, CredentialType: CREDENTIAL_TYPE_HEX } as const
    const { tx, submittedAt, validatedAt } = await submitTx(conn, deleted, issuer, SUBMIT_DEFAULTS)
    console.log(`${memberId} CredentialDelete ${((validatedAt - submittedAt) / 1000).toFixed(1)}s  ${explorerUrl(tx.hash)}`)
    console.log(`a running API may still let ${memberId} open a tab for up to ${CREDENTIAL_CACHE_MS / 1000} s (cached check)`)
  }
} finally {
  await conn.close()
}
