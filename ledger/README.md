# ledger

Settle's XRPL layer. Puts real transactions on XRPL Testnet: a tab opens as a token escrow from the
member to the venue, and settling finishes that escrow and refunds what wasn't spent. Nothing
outside `ledger/` touches a private key.

## Run it

```bash
cd ledger && npm install

npm run setup:accounts   # faucet-funds issuer, venue, member-1..5; seeds -> .env (gitignored), addresses -> accounts.json
                         # creates only accounts missing from .env and appends their seeds; existing keys are never
                         # rewritten (pass -- --force to replace every account)
npm run setup:token      # issues TUSD, opens trust lines, sets balances to SEED_BALANCES. Idempotent
npm run setup:credentials  # issues and accepts a CLUB_MEMBER credential for member-1..5. Idempotent
npm run revoke:credential -- member-4  # deletes one member's credential (demo beat)
npm run check:rlusd      # does the testnet RLUSD issuer allow trust-line locking? (prints yes/no)

npm run demo:reset       # closes every open tab escrow, then sets every balance back to SEED_BALANCES
npm run demo:happy-path  # openTab -> wait for FinishAfter -> settleTab, prints hashes, amounts, timings

npm test                 # amount math, runtime keys, escrowSeq validation, credential check (no network)
npm run typecheck
```

`SEED_BALANCES` in `src/config.ts` is the one place balances are set, sized to cover the API's
allowances with headroom (member-1 has two seeded tabs, 2,000 together; all six seeded tabs total 4,500):

| account | venue | member-1 | member-2 | member-3 | member-4 | member-5 |
|---|---|---|---|---|---|---|
| TUSD | 0 | 5000 | 800 | 800 | 500 | 1200 |

To add a member, append its ID to `MEMBER_IDS` and `SEED_BALANCES`, then run `setup:accounts` and
`setup:token`.

Every transaction is logged as one line: `[ledger] <TransactionType> <hash> <result> ledger=<index>`.

## Credentials

**Pitch:** membership is an XRPL Credential. The club issues each member a `CLUB_MEMBER` credential
on the ledger, the member accepts it, and only a credentialed member can open a tab.

- `npm run setup:credentials`: the issuer sends a `CredentialCreate` (type `CLUB_MEMBER`, hex
  `434C55425F4D454D424552`, no expiration) to member-1..5 and each member sends `CredentialAccept`.
  Members who already hold an accepted credential are skipped; re-running restores a revoked one.
- `npm run revoke:credential -- member-4`: the issuer sends `CredentialDelete`. member-4 can no
  longer open a tab: `openTab` throws `INVALID_INPUT` "member is not credentialed", and the API
  answers `403 {code: "NOT_CREDENTIALED"}`.
- `openTab` looks up the credential (`ledger_entry`) before the EscrowCreate and needs it accepted
  and unexpired. A confirmed credential is trusted for 60 s; a refusal is re-checked every time,
  so a re-issued credential counts at once, while a revoked one can still pass for up to 60 s if
  that member opened a tab in the last minute. `getBalances()` reports `credentialed` per member.

## Pre-demo checklist

1. `npm run setup:credentials` so every member is credentialed again after any rehearsal revoke.
2. `npm run demo:happy-path`, then `npm run demo:reset`: one green run against testnet, then
   balances back to `SEED_BALANCES` with no open escrows.
3. Start the API on the laptop: `cd ../api && LEDGER_MODE=module SEED_LIVE_ESCROWS=1 npm run dev`,
   and wait for the two `escrow_opened` events (t1, t5) before going on stage.
4. On stage, don't exit a tab opened live within 30 s; the settle would just wait for FinishAfter.

## Why TUSD, not RLUSD

Token escrow (TokenEscrow / XLS-85, enabled on testnet) only works for trust-line tokens whose issuer
has the **Allow Trust Line Locking** flag (`lsfAllowTrustLineLocking`). The testnet RLUSD issuer
`rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV` does not have it (checked 2026-10-24; `npm run check:rlusd`
re-checks). So we issue our own `TUSD` from our issuer with that flag (and Default Ripple) set.
The token is one value, `TOKEN` in `src/config.ts`; set it to `'RLUSD'` if the flag is ever enabled.

## Using it from api/

```ts
import { openTab, settleTab, cancelTab, getBalances, explorerUrl, createLedger } from '../ledger/src/index.ts'
```

The top-level functions share one instance configured from `ledger/.env`. `createLedger(config)`
builds your own; every field is optional: `wsUrl`, `token`, `envPath`, `accountsPath`,
`explorerBase`, `finishAfterSeconds` (20), `cancelAfterSeconds` (8h), `useBatch` (true),
`ledgerOffset`, `timeoutMs`, `log`. Seeds are never passed in. They're read from `ledger/.env`, or
from the environment when there's no file. Addresses come from the committed `accounts.json`.

The module only needs `VENUE_SEED` and `MEMBER_1_SEED` … `MEMBER_5_SEED`. `ISSUER_SEED` is for
`setup:token` and `demo:reset`; don't deploy it. `XRPL_WS_URL` is optional and resolves from the
process environment first, then `ledger/.env`, then public testnet.

It's plain TypeScript with `.ts` imports, so it runs under `tsx` or Node ≥ 22.18 (built-in type stripping).
`xrpl` resolves from `ledger/node_modules`, so run `npm install` (or `npm ci --omit=dev`) here.

Member IDs are `member-1` … `member-5`. Amounts are decimal strings in token units (`"86.40"`).
Times are ISO 8601 strings.

### `openTab({ memberId, allowance })`

Escrows `allowance` from the member to the venue, if the member holds an accepted `CLUB_MEMBER`
credential (see Credentials). `FinishAfter` = now + 20 s, `CancelAfter` = now + 8 h.
rippled rejects an EscrowCreate with `tecNO_PERMISSION` if `FinishAfter` has already passed when it
lands, and a transaction lands 3.5–7 s after submit with close times rounded to 10 s; 20 s leaves room.

| field | |
|---|---|
| `escrowSeq` | the escrow's sequence; with `memberId` it identifies the tab |
| `txHash`, `explorerUrl`, `ledgerIndex` | the validated EscrowCreate |
| `submittedAt`, `validatedAt` | see Timing |
| `allowance`, `finishAfter`, `cancelAfter` | what was escrowed and its time window |

### `settleTab({ tab, amount, tipAmount })`

`tab` needs only `{ memberId, escrowSeq }` (the openTab result plus `memberId` works); `escrowSeq`
must be a positive integer (a numeric string is accepted). `amount` is
the spend *excluding* the tip. The allowance is read from the escrow on the ledger. The venue
finishes the escrow and refunds `allowance − amount − tipAmount` in one all-or-nothing Batch; if the
Batch fails for any reason it falls back to EscrowFinish then Payment, each waited on until validated.
If called before FinishAfter has passed on a validated ledger, it logs `waiting …` and waits, up to
about 30 s after open (not counted in `elapsedMs`); being early never makes it fail.

| field | |
|---|---|
| `finishTxHash` | the EscrowFinish |
| `refundTxHash` | the refund Payment; `null` when nothing is left to refund |
| `toVenue`, `toMember` | `amount + tipAmount`, and the refund |
| `elapsedMs` | `validatedAt − submittedAt` |
| `submittedAt`, `validatedAt` | see Timing |
| `explorerUrls` | finish, refund (if any), Batch (if batched) |
| `mode` | `'batch'` or `'sequential'` |
| `batchTxHash` | the outer Batch, when `mode` is `'batch'` |

### `cancelTab({ tab })`

Closes a tab with nothing spent. Past `CancelAfter`, an EscrowCancel; before that, the venue finishes
the escrow and refunds it in full. Returns `{ txHash, explorerUrl, via }`; `txHash` is the
EscrowCancel (`via: 'EscrowCancel'`) or the refund Payment (`via: 'refund'`).

### `getBalances()`

`{ venue, members: { 'member-1': '5000', … }, credentialed: { 'member-1': true, … } }`: trust-line
balances on the last validated ledger (tokens locked in open tabs are not included), and whether
each member holds an accepted `CLUB_MEMBER` credential, looked up fresh.

### `explorerUrl(hash)`

`https://testnet.xrpl.org/transactions/<hash>`.

## Errors

Failures are thrown as `LedgerError` with a `code` (and `result`, the XRPL result code, when the
ledger returned one). An unexpected client error, such as a malformed request, can still surface as
a plain `Error` without a `code`.

| code | when |
|---|---|
| `INSUFFICIENT_FUNDS` | member can't cover the allowance, or `amount + tipAmount` exceeds it |
| `ESCROW_NOT_FOUND` | no open escrow for that `memberId` + `escrowSeq` (already settled/cancelled) |
| `LEDGER_TIMEOUT` | not validated before `LastLedgerSequence` (~35–45 s), or no connection |
| `INVALID_INPUT` | unknown `memberId`, a member without a `CLUB_MEMBER` credential ("member is not credentialed"), an `escrowSeq` that isn't a positive integer, or an amount that isn't a plain decimal string |
| `LEDGER_REJECTED` | any other ledger failure, including settling an expired escrow (use `cancelTab`) |

## Timing

`submittedAt` is taken just before the first `submit` request; `validatedAt` is when the server
announced the validated ledger holding the last transaction (we listen on the ledger stream).
`elapsedMs` is measured to that **validated** ledger, not to a closed or proposed one. On testnet
that's typically 3.5–7 s: ledgers validate every ~3.3 s and a new transaction usually lands two
ledgers past the last validated one. Ledger close times have 10 s resolution, so an escrow can
become finishable up to ~10 s after its `FinishAfter`.
