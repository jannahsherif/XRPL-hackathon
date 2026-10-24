# Settle backend

Liam's layer (Epic 2): one service that owns the tab state machine, fakes the POS, runs the settlement agent, handles manager approval, tracks metrics, and pushes every change to the frontend over Server-Sent Events. It calls Alex's `ledger` module behind the frozen interface contract and never touches XRPL directly.

- Architecture, AWS resources and diagrams: [ARCHITECTURE.md](ARCHITECTURE.md)
- Seed snapshot for the frontend (same shape as `GET /state`): [seed.json](seed.json)
- Mastercard integration (AP4M x402 Vouchers, Verifiable Intent, card funding): [../submission/MASTERCARD.md](../submission/MASTERCARD.md)
- AWS write-up (AgentCore + x402/RLUSD): [../submission/AWS.md](../submission/AWS.md)

## Mastercard integration

| Feature | Turn on | Routes and events |
|---|---|---|
| **AP4M settlement rail**: a Channel per tab (cap = allowance), x402 + EIP-712 Voucher, RLUSD settle and close | `LEDGER_MODE=ap4m`, `AP4M_NETWORK=simulated \| live` | `GET /ap4m`, `GET /x402/tabs/:id/resource`, `POST /demo/ap4m/over-cap/:id`, `POST /demo/ap4m/unverified-agent/:id`; events `ap4m.channel_opened`, `x402.payment_required`, `x402.paid`, `ap4m.settled`, `ap4m.rejected` |
| **Verifiable Intent**: member-signed mandate per tab, checked before every payment | `INTENT_MODE=on` (default) | `GET /intent/tabs/:id`, `POST /intent/verify-payment-record`; events `intent.mandate_signed`, `intent.verified`, `intent.violation` |
| **Card funding** (SIMULATED): top up from the Mastercard card on file | always | `POST /members/:id/fund {amountCents}`; event `funding.completed` |

Tabs gain two additive fields, `mandate` and `ap4m`. Both are null when their feature is off. Members gain `card` and `fundedCents`.

## Run locally

```bash
cd api
npm ci
npm run dev          # DEMO=1: 10 s grace, wireframe seed, stub ledger, local agent fallback
npm test             # all TypeScript tests
npm run test:coverage  # same, plus coverage report and thresholds (CI runs this)
npm run test:agent   # Python agent tests (pip install -r agent/requirements-dev.txt)
```

### Tests

| Suite | Covers |
|---|---|
| `test/money.test.ts` | Cents and decimal conversion, round-trips, rejected formats, tip maths |
| `test/rules.test.ts` | Hard hold rules (item over allowance, N× typical, total over escrow, boundaries) and the fallback decision |
| `test/stateMachine.test.ts` | Every allowed and disallowed transition (all 64 pairs), terminal states |
| `test/events.test.ts` | Event bus fan-out, unsubscribe, bounded replay history |
| `test/ledger.test.ts` | Stub ledger against the contract (hashes, balances, refunds, error codes) and loading Alex's module |
| `test/settlementAgent.test.ts` | AgentCore invocation with the SDK mocked: payload, session ids, timeout, invalid output, fallback |
| `test/settleService.test.ts` | Tab lifecycle with fake timers: grace ticks, settle, tip trimming, hold/approve/reject, dispute, close, reset, policy, race conditions |
| `test/http.test.ts` | Every REST route, status codes (400/404/409/500), CORS |
| `test/sse.test.ts` | `/events` over a real socket: headers, snapshot, event order, broadcast, disconnect, replay |
| `test/env.test.ts` | Ledger-secret expansion and config parsing |
| `test/seed.test.ts` | Seed integrity and the anomaly-demo setup |
| `test/settle.test.ts` | End-to-end happy path and anomaly path with the real stub ledger |
| `agent/tests/` (pytest) | Settlement agent payload validation, structured output, fallback to hold, schema limits |

Then open `http://localhost:8080/state` and stream `curl -N http://localhost:8080/events`.

| Variable | Default | Meaning |
|---|---|---|
| `DEMO` | `1` with `npm run dev` | Grace 10 s plus seed data (a flag, not a branch) |
| `GRACE_SECONDS` | 10 in demo, else 120 | Override the grace timer |
| `LEDGER_MODE` | `stub` | `stub` returns fake hashes after `LEDGER_STUB_DELAY_MS` (3000); `module` imports `LEDGER_MODULE` (`../ledger/index.js`) |
| `SEED_LIVE_ESCROWS` | `0` | With `module`, opens real escrows for the six seeded tabs at boot |
| `AGENT_MODE` | `local` | `agentcore` calls the deployed settlement agent (`AGENT_RUNTIME_ARN`, `AGENT_QUALIFIER=live`) |
| `AGENT_TIMEOUT_MS` | `8000` | After this, the deterministic fallback decides |
| `CORS_ORIGIN` | `*` | Comma-separated origins for the frontend |

See [.env.example](.env.example).

### Plugging in Alex's ledger

Put the module at the repo root as `ledger/index.js`, exporting `openTab`, `settleTab`, `cancelTab` and `getBalances` (named exports or a default object). Then run with `LEDGER_MODE=module`. The loader checks that all four functions exist at boot. Ledger errors that carry a `code` (`INSUFFICIENT_FUNDS`, `ESCROW_NOT_FOUND`, `LEDGER_TIMEOUT`) move the tab to `held` with that code in the reason, so a manager can retry with approve.

## API (contract)

| Method and path | Does |
|---|---|
| `GET /state` | Full snapshot: tabs, members, metrics, menu, policy, mode |
| `POST /tabs {memberId, seat?}` | Opens a tab and escrows the member's tier allowance (`201`) |
| `POST /tabs/:id/items {menuItemId, qty}` | Adds a line item (fake POS) |
| `POST /tabs/:id/exit` | Starts grace and emits `member.push` |
| `POST /tabs/:id/tip {pct}` | Member picks a tip during grace (0–30) |
| `POST /tabs/:id/dispute {note?}` | Moves the tab to held |
| `POST /tabs/:id/approve` / `/reject` | Manager decision on a held tab; reject returns the escrow and closes the tab |
| `POST /tabs/:id/close` | Manual close by staff (escrow cancelled) |
| `POST /demo/reset` | Reseeds everything and cancels open escrows |
| `GET /events` | SSE stream (`?replay=1` replays recent events) |
| Extras | `GET /tabs/:id`, `GET /metrics`, `GET`/`PATCH /policy`, `GET /health` |

Errors return `{error}` with `400` (bad input), `404` (unknown tab, member or menu item) or `409` (illegal state transition).

**Events.** Each SSE message uses its type as the SSE `event:` name, so use `es.addEventListener("tab.settled", ...)`. The data is `{type, at, data}`. On connect the stream sends one `snapshot` event with the full state.

| Event | `data` |
|---|---|
| `tab.opened` | `{tab, ledgerIndex}` |
| `tab.item_added` | `{tab, item, headroomCents}` |
| `tab.exit_detected` | `{tab}` |
| `member.push` | `{tabId, memberId, memberName, items, totalCents, suggestedTipPct, tipOptions, graceEndsAt, secondsLeft}` |
| `tab.grace_tick` | `{tabId, secondsLeft}` |
| `agent.decision` | `{tabId, action, tipPct, reason, source: rules \| agent \| fallback}` |
| `tab.held` | `{tab, hold}` |
| `tab.settled` | `{tab, settlement, explorerUrls, decision}` |
| `metrics.updated` | `{outstandingCents, openTabs, settledCount, avgSettleMs}` |
| `tab.updated` *(additive)* | `{tab, change}` for reconciling, tip, close, reset and escrow_opened |

Notes on the contract:

- `allowance` is a decimal string in token units (`"600.00"`), the same units the ledger uses. Every `*Cents` field is an integer number of cents.
- The tab object has exactly the fields in the contract. `tab.updated` is the one additive event type.
- Outstanding balances start at $342,180.00 and drop by `toVenue` on every settle.

## Deploy to AWS

**One time, by an account admin:**

```bash
aws cloudformation deploy --stack-name settle-bootstrap \
  --template-file api/infra/bootstrap.yaml --capabilities CAPABILITY_NAMED_IAM
aws cloudformation describe-stacks --stack-name settle-bootstrap --query "Stacks[0].Outputs"
```

Then set these GitHub repository **variables** (Settings → Secrets and variables → Actions → Variables):

| Variable | Value |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `DeployRoleArn` output |
| `ARTIFACT_BUCKET` | `ArtifactBucketName` output |
| `AWS_REGION` | for example `us-east-1` (any region with AgentCore Runtime) |
| `MODEL_ID` *(optional)* | Bedrock model or inference-profile ID for the agent. The default `anthropic.claude-opus-5-5` may need a regional inference-profile prefix; check the Bedrock console |
| `LEDGER_MODE`, `DEMO`, `CORS_ORIGIN` *(optional)* | Defaults are `stub`, `1`, `*` |

Also enable model access for that model in the Bedrock console.

**Deploys happen only when a GitHub Release is published.** Pushes and PRs run the tests but never touch AWS.

```bash
gh release create v0.1.0-rc1 --target liam-v1 --prerelease --generate-notes   # deploys stage dev
gh release create v0.1.0 --target main --generate-notes                        # deploys stage prod
```

Or use **Releases → Draft a new release** in GitHub; tick "Set as a pre-release" for `dev`. Drafts don't deploy until they are published. The release tag versions the agent zip (`agent/<stage>/<tag>.zip`) and the image (`settle-api:<tag>`), so redeploying an older release rolls back. The job summary prints the HTTPS API URL. The first deploy takes about 10–15 minutes because CloudFront is created. To require approval before `prod`, add required reviewers to the `prod` environment under Settings → Environments.

**Ledger keys:** once Alex's module is in `ledger/`, store its env vars and switch modes:

```bash
aws secretsmanager put-secret-value --secret-id settle/dev/ledger-env \
  --secret-string '{"VENUE_SEED":"s...","ISSUER_ADDRESS":"r..."}'   # whatever keys ledger/ reads
# then set the GitHub variable LEDGER_MODE=module and publish a new release
```

**From a laptop:** `STAGE=dev ARTIFACT_BUCKET=<bucket> api/scripts/deploy.sh` runs the same four steps. It needs Docker, `uv` and the AWS CLI.

**Tear down:** delete `settle-<stage>-api`, then `settle-<stage>-agent`. The ledger secret and the bootstrap bucket and ECR repo are retained on purpose.

## Cost (rough, per stage while running)

Roughly $35–45 a month: one Fargate ARM task about $15, ALB about $18, plus small amounts for CloudFront, Secrets Manager and logs. AgentCore and Bedrock are billed per use. Tear the API stack down after the event.
