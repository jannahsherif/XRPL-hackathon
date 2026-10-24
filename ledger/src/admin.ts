// Issuer-side helpers shared by scripts/issue-token.ts and demo:reset.
import type { Client, Wallet } from 'xrpl'
import { compare, isZero, sub } from './amounts.ts'
import type { Token } from './config.ts'
import { type Connection, type SubmitOptions, submitTx } from './submit.ts'

// The holder's balance on its trust line to the token issuer, or null if there is no line.
export async function trustLineBalance(client: Client, holder: string, token: Token): Promise<string | null> {
  const { result } = await client.request({
    command: 'account_lines',
    account: holder,
    peer: token.issuer,
    ledger_index: 'validated',
  })
  const line = result.lines.find((l) => l.currency === token.currency)
  return line ? line.balance : null
}

// Moves the holder's balance to exactly `target`: the issuer pays in any shortfall, and the holder
// returns any excess to the issuer (which takes it out of circulation).
export async function setBalance(
  conn: Connection,
  opts: SubmitOptions,
  issuer: Wallet,
  holder: Wallet,
  token: Token,
  target: string,
): Promise<void> {
  const current = (await trustLineBalance(await conn.ready(), holder.address, token)) ?? '0'
  const diff = sub(target, current)
  if (isZero(diff)) return
  const [from, to, value] =
    compare(diff, '0') > 0 ? [issuer, holder.address, diff] : [holder, issuer.address, sub('0', diff)]
  await submitTx(
    conn,
    {
      TransactionType: 'Payment',
      Account: from.address,
      Destination: to,
      Amount: { currency: token.currency, issuer: token.issuer, value },
    },
    from,
    opts,
  )
}
