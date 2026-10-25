// L7: credential every member as a CLUB_MEMBER. The issuer sends CredentialCreate (no expiration)
// and the member accepts it with CredentialAccept. Members who already hold an accepted credential
// are skipped, so this is safe to re-run; it also re-issues one removed by revoke:credential.
import { CREDENTIAL_TYPE, CREDENTIAL_TYPE_HEX, MEMBER_IDS, SUBMIT_DEFAULTS } from '../src/config.ts'
import { isValidCredential, ledgerCredentialLookup } from '../src/credentials.ts'
import { loadAccounts, loadWallets, wsUrl } from '../src/keys.ts'
import { explorerUrl } from '../src/ledger.ts'
import { type Submitted, connect, submitTx } from '../src/submit.ts'

const accounts = loadAccounts()
const wallets = loadWallets(accounts)
const issuer = wallets.get('issuer')!
const conn = connect(wsUrl())
const lookup = ledgerCredentialLookup(() => conn.ready(), accounts.issuer)
const report = (id: string, { tx, submittedAt, validatedAt }: Submitted) =>
  console.log(`${id.padEnd(9)} ${tx.tx_json.TransactionType!.padEnd(16)} ${((validatedAt - submittedAt) / 1000).toFixed(1)}s  ${explorerUrl(tx.hash)}`)

try {
  // Members are independent; the issuer's CredentialCreates queue on its sequence inside submitTx.
  await Promise.all(
    MEMBER_IDS.map(async (id) => {
      const member = wallets.get(id)!
      const entry = await lookup(member.address)
      if (isValidCredential(entry)) {
        console.log(`${id.padEnd(9)} already holds an accepted ${CREDENTIAL_TYPE} credential`)
        return
      }
      if (!entry) {
        const create = { TransactionType: 'CredentialCreate', Account: issuer.address, Subject: member.address, CredentialType: CREDENTIAL_TYPE_HEX } as const
        report(id, await submitTx(conn, create, issuer, SUBMIT_DEFAULTS))
      }
      const accept = { TransactionType: 'CredentialAccept', Account: member.address, Issuer: issuer.address, CredentialType: CREDENTIAL_TYPE_HEX } as const
      report(id, await submitTx(conn, accept, member, SUBMIT_DEFAULTS))
    }),
  )
} finally {
  await conn.close()
}
