// L2: issue TUSD from our issuer. Enables Default Ripple (so venue->member payments can ripple
// through the issuer) and Allow Trust Line Locking (so TUSD can be held in a token escrow), opens
// trust lines from the venue and every member, then seeds member balances. Safe to re-run.
import { AccountSetAsfFlags, LedgerEntry } from 'xrpl'
import { setBalance, trustLineBalance } from '../src/admin.ts'
import { MEMBER_IDS, SEED_BALANCES, SUBMIT_DEFAULTS, TOKEN, TRUST_LIMIT, resolveToken } from '../src/config.ts'
import { loadAccounts, loadWallets, wsUrl } from '../src/keys.ts'
import { connect, submitTx } from '../src/submit.ts'

const { lsfDefaultRipple, lsfAllowTrustLineLocking } = LedgerEntry.AccountRootFlags
const { asfDefaultRipple, asfAllowTrustLineLocking } = AccountSetAsfFlags

const accounts = loadAccounts()
const wallets = loadWallets(accounts)
const token = resolveToken(TOKEN, accounts)
if (token.issuer !== accounts.issuer) {
  console.error(`TOKEN is ${token.name}, which our issuer does not issue; nothing to set up.`)
  process.exit(1)
}

const opts = SUBMIT_DEFAULTS
const conn = connect(wsUrl())
const issuer = wallets.get('issuer')!
try {
  const client = await conn.ready()

  // Default Ripple has to be on before any trust lines exist, so these run first, in order.
  const { result } = await client.request({ command: 'account_info', account: issuer.address, ledger_index: 'validated' })
  const flagsToSet: [number, number, string][] = [
    [lsfDefaultRipple, asfDefaultRipple, 'Default Ripple'],
    [lsfAllowTrustLineLocking, asfAllowTrustLineLocking, 'Allow Trust Line Locking'],
  ]
  for (const [lsf, asf, name] of flagsToSet) {
    if (result.account_data.Flags & lsf) {
      console.log(`issuer already has ${name}`)
      continue
    }
    await submitTx(conn, { TransactionType: 'AccountSet', Account: issuer.address, SetFlag: asf }, issuer, opts)
  }

  // Trust lines from different accounts don't share a sequence, so they can go in parallel.
  await Promise.all(
    ['venue', ...MEMBER_IDS].map(async (role) => {
      const holder = wallets.get(role)!
      if ((await trustLineBalance(client, holder.address, token)) !== null) {
        console.log(`${role} already trusts ${token.name}`)
        return
      }
      await submitTx(
        conn,
        {
          TransactionType: 'TrustSet',
          Account: holder.address,
          LimitAmount: { currency: token.currency, issuer: token.issuer, value: TRUST_LIMIT },
        },
        holder,
        opts,
      )
    }),
  )

  // Top-ups are issuer payments, so these run one at a time on the issuer's sequence.
  for (const [role, balance] of Object.entries(SEED_BALANCES)) {
    await setBalance(conn, opts, issuer, wallets.get(role)!, token, balance)
  }

  for (const role of ['venue', ...MEMBER_IDS]) {
    const balance = await trustLineBalance(client, wallets.get(role)!.address, token)
    console.log(`${role.padEnd(9)} ${balance} ${token.name}`)
  }
} finally {
  await conn.close()
}
