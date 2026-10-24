# XRPL Agentic Payments: Build Guide

What XRPL already gives agents, which ledger features map to agent-payment concepts, and how to wire it all together. Compiled 2026-10-24 from the docs in this folder.

> **TL;DR:** XRPL is ready for agent payments today.
> - **x402 on XRPL works now**: `pip install x402-xrpl` (by T54, reference implementation listed on xrpl.org) with **hosted testnet and mainnet facilitators**. It pays in XRP or RLUSD.
> - xrpl.org has an official **Agentic Transactions** section and **Claude skills** (Agent Wallet + Payments + Trading).
> - The native primitives map directly onto agent-payment concepts: **Payment Channels** (vouchers/streaming), **Credentials** (KYA), **Permission Delegation** (scoped agent keys), **Escrow** (conditional settlement), **Batch** (atomic multi-step), **SourceTag/Memos** (attribution/intent hash).

---

## 1. Environments

| Network | JSON-RPC | WebSocket | x402 network id |
|---|---|---|---|
| **Testnet** | `https://s.altnet.rippletest.net:51234/` | `wss://s.altnet.rippletest.net:51233/` | `xrpl:1` |
| Testnet (Clio) | `https://clio.altnet.rippletest.net:51234/` | `wss://clio.altnet.rippletest.net:51233/` | |
| Devnet (new amendments) | `https://s.devnet.rippletest.net:51234/` | `wss://s.devnet.rippletest.net:51233/` | |
| Mainnet | `https://xrplcluster.com/`, `https://s1.ripple.com:51234/` | `wss://xrplcluster.com/` | `xrpl:0` |

- **Faucet:** https://xrpl.org/resources/dev-tools/xrp-faucets. In code, use `xrpl.wallet.generate_faucet_wallet(client)` (py) or `client.fundWallet()` (js).
- **RLUSD:** currency hex `524C555344000000000000000000000000000000`. Testnet issuer `rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV`, mainnet issuer `rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De` ([verify](https://docs.ripple.com/products/stablecoin/developer-resources/rlusd-on-the-xrpl)). Holding it requires a `TrustSet` to the issuer first.
- **x402 facilitators (T54):** testnet `https://xrpl-facilitator-testnet.t54.ai`, mainnet `xrpl-facilitator-mainnet.t54.ai`. Docs: https://xrpl-x402.t54.ai/docs/quickstart
- Reserves: base + owner reserve per object (channels, trust lines, credentials, …). See [docs/concepts__accounts__reserves.md](docs/concepts__accounts__reserves.md).

```bash
pip install xrpl-py x402-xrpl       # Python 3.11+ for x402-xrpl
npm install xrpl                    # JS/TS
```

---

## 2. Claude skills (install into this repo)

```bash
npx skills add https://github.com/XRPLF/xrpl-dev-portal/tree/master/.claude/skills/xrpl-skills/xrpl-agent-wallet --agent claude-code
npx skills add https://github.com/XRPLF/xrpl-dev-portal/tree/master/.claude/skills/xrpl-skills/xrpl-payments    --agent claude-code
npx skills add https://github.com/XRPLF/xrpl-dev-portal/tree/master/.claude/skills/xrpl-skills/xrpl-trading     --agent claude-code   # optional
```
- **Agent Wallet**: shared signing layer. Wallet creation (seed goes to `.env`, never into chat), then **autofill → preview → confirm → sign → submit**. Supports an external signer (KMS/HSM) and **OWS** (Open Wallet Standard, a policy-gated local vault). Stamps the starter-kit **SourceTag `20260530`**.
- **Payments**: XRP/token payments, trust lines, escrow, RLUSD, error handling.

Local copies for reading: [skills/](skills/). Tutorial: [docs/agents__getting-started-with-agentic-transactions.md](docs/agents__getting-started-with-agentic-transactions.md).

---

## 3. x402 on XRPL (pay-per-request HTTP)

**Flow:** the agent requests a resource. The merchant returns **402** with `PAYMENT-REQUIRED` (price, payTo, network, asset, facilitator). The agent **presigns an XRPL `Payment`** and retries with `PAYMENT-SIGNATURE`. The merchant/facilitator verifies, submits and settles (finality in 3–5 s), and responds 200 with a `PAYMENT-RESPONSE` header (settled tx hash).

**Merchant:**
```python
from fastapi import FastAPI
from x402_xrpl.server import require_payment
app = FastAPI()
app.middleware("http")(require_payment(
    path="/hello", price="1000",                       # drops (IOU: value string, e.g. "0.05")
    pay_to_address="rYourAddress", network="xrpl:1", asset="XRP",
    facilitator_url="https://xrpl-facilitator-testnet.t54.ai",
    description="Paid hello", extra={"sourceTag": 20260601},
))
@app.get("/hello")
async def hello(): return {"message": "paid!"}
```
**Payer agent:**
```python
from xrpl.wallet import Wallet
from x402_xrpl.clients.requests import x402_requests
from x402_xrpl.clients.base import decode_payment_response
session = x402_requests(Wallet.from_seed(SEED), rpc_url="https://s.altnet.rippletest.net:51234/",
                        network_filter="xrpl:1", scheme_filter="exact")
r = session.get("http://localhost:8000/hello", timeout=180)
print(r.status_code, decode_payment_response(r.headers.get("PAYMENT-RESPONSE", "")))
```
- Scheme `exact` = presigned Payment tx blob. **Cross-currency** is opt-in (`extra["crossCurrency"]=True`, payer `pay_with=`): for example, pay a RLUSD quote with XRP via `SendMax`.
- Security: treat the 402 body as **untrusted input**. Never let server-declared fields other than amount/payTo/tag reach a signed tx unreviewed, and cap the amount client-side.
- Community TS implementations: `XRPLJapan/x402-xrpl` (client + server + self-hosted facilitator), `mpcp-protocol/x402-xrpl` (x402 v2 adapter). Spec: [github/coinbase_x402.README.md](github/coinbase_x402.README.md).

Docs: [docs/agents__agentic-payments-x402.md](docs/agents__agentic-payments-x402.md), [pypi/x402-xrpl.README.md](pypi/x402-xrpl.README.md).

---

## 4. XRPL primitives mapped to agent-payment concepts

| Agent-payment concept (Mastercard / AWS) | XRPL primitive | Key tx / API | Docs |
|---|---|---|---|
| **Voucher / "authorize once, settle later"** (AP4M) | **Payment Channel**: fund once, sign off-ledger claims, the payee redeems the highest claim | `PaymentChannelCreate`, then sign a claim off-ledger (xrpl-py `encode_for_signing_claim` + `keypairs.sign`; the docs' `channel_authorize` is admin-only), `channel_verify`, `PaymentChannelClaim`, `PaymentChannelFund`, `account_channels` | [concepts](docs/concepts__payment-types__payment-channels.md), [tutorial](docs/tutorials__payments__use-payment-channels.md) |
| **Spend limit / PaymentSession budget** | Channel `Amount` + `Expiration`/`CancelAfter`, `SendMax`, or a dedicated sub-account | | |
| **Know Your Agent / Agent registration** | **Credentials**: an issuer attests to the agent account (`CredentialType`, e.g. "KYA-verified"), and the agent accepts | `CredentialCreate`, `CredentialAccept`, `CredentialDelete` | [concepts](docs/concepts__decentralized-storage__credentials.md), [manage](docs/tutorials__compliance-features__manage-credentials.md), [verify](docs/tutorials__compliance-features__verify-credentials.md), [Python issuer service](docs/tutorials__sample-apps__credential-issuing-service-in-python.md) |
| **Agent identity document** | **DID** ledger entry | `DIDSet` | [did](docs/references__protocol__ledger-data__ledger-entry-types__did.md) |
| **Scoped agent key / Agentic Token scope** | **Permission Delegation**: the owner grants the agent account only specific tx types (e.g. `Payment`) | `DelegateSet` (+ `Delegate` field on txs) | [concepts](docs/concepts__accounts__permission-delegation.md), [values](docs/references__protocol__data-types__permission-values.md) |
| **Merchant allowlist / accept only verified agents** | **DepositAuth + Credentials**, or a **Permissioned Domain** | `PermissionedDomainSet` | [domains](docs/concepts__tokens__decentralized-exchange__permissioned-domains.md) |
| **Conditional / deferred settlement** | **Escrow** (time or crypto-condition), incl. token escrow | `EscrowCreate`, `EscrowFinish`, `EscrowCancel` | [concepts](docs/concepts__payment-types__escrow.md), [conditional](docs/tutorials__payments__send-a-conditional-escrow.md) |
| **Multi-step checkout, all-or-nothing** | **Batch** (up to 8 txs atomically, multi-account) | `Batch` | [concepts](docs/concepts__transactions__batch-transactions.md) |
| **Stablecoin settlement rail** | RLUSD (trust line) / **MPTs** | `TrustSet`, `Payment`, `MPTokenAuthorize` | [stablecoins](docs/concepts__tokens__fungible-tokens__stablecoins.md), [MPT](docs/concepts__tokens__fungible-tokens__multi-purpose-tokens.md) |
| **Verifiable Intent anchoring / audit** | **Memos** (e.g. hash of the VI L2 mandate / `checkout_hash`) + **SourceTag** (app attribution) + **DestinationTag** (invoice) | `Memos`, `SourceTag` on any tx; `subscribe`, `account_tx` | [track agent behavior](docs/agents__track-agent-behavior.md), [tags](docs/concepts__transactions__source-and-destination-tags.md) |
| **Human-approval threshold** | **Multi-signing** (agent + human co-sign above N) | `SignerListSet`, `submit_multisigned` | [multi-signing](docs/concepts__accounts__multi-signing.md) |
| **Fee sponsorship** (agent has no XRP) | Sponsored fees and reserves | | [sponsored](docs/concepts__accounts__sponsored-fees-and-reserves.md) |

Note: Permission Delegation, Batch, Credentials, Permissioned Domains, token escrow and sponsored fees depend on **amendments**. Check that each is enabled on Testnet/Mainnet before relying on it (use Devnet otherwise).

---

## 5. Payment channel voucher (the AP4M-on-XRPL core)

```python
from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet
from xrpl.models.transactions import PaymentChannelCreate, PaymentChannelClaim
from xrpl.transaction import submit_and_wait
from xrpl.core.binarycodec import encode_for_signing_claim
from xrpl.core.keypairs import sign, is_valid_message

c = JsonRpcClient("https://s.altnet.rippletest.net:51234/")
agent, seller = generate_faucet_wallet(c), generate_faucet_wallet(c)

# 1. Authorize once: lock the budget (1 XRP) in a channel to the seller
tx = PaymentChannelCreate(account=agent.address, destination=seller.address,
                          amount="1000000", settle_delay=3600, public_key=agent.public_key)
res = submit_and_wait(tx, c, agent)
channel_id = ...  # from res.result meta CreatedNode PayChannel LedgerIndex (or account_channels)

# 2. Transact many times: sign cumulative claims off-ledger (no fee, instant)
def voucher(cumulative_drops: str) -> str:
    return sign(bytes.fromhex(encode_for_signing_claim({"channel": channel_id, "amount": cumulative_drops})),
                agent.private_key)

# 3. The seller verifies each voucher (offline, or with the channel_verify RPC)
# 4. Settle later: the seller redeems the highest claim in one tx
PaymentChannelClaim(account=seller.address, channel=channel_id, balance="250000",
                    amount="250000", signature=voucher("250000"), public_key=agent.public_key)
```
Wrap steps 2–3 as an x402 **`scheme: "xrpl-paychan"`**: the 402 carries `channelRequired`/price, and `PAYMENT-SIGNATURE` carries `{channel, amount, signature}`. The seller verifies with no on-ledger round-trip per request, which gives sub-cent, high-frequency agent payments.

---

## 6. Reference architecture (Mastercard × AWS × XRPL)

```
User ──signs VI L2 mandate (budget, payees)──▶ Agent (Strands on AgentCore Runtime)
  │                                               │  tools via AgentCore Gateway (Cedar caps)
  │ CredentialCreate "KYA" ─▶ agent r-address     │  seed in AgentCore Identity / KMS signer
  ▼                                               ▼
XRPL: DelegateSet(Payment only)        x402 / paychan voucher ──▶ Merchant API (x402-xrpl middleware)
      PaymentChannelCreate(budget)          Memo = sha256(VI mandate)     │ verifies Credential + voucher
                                                                          ▼
                                                   PaymentChannelClaim / Payment (RLUSD|XRP) settles
```

---

## 7. Libraries

| | Python | JS/TS |
|---|---|---|
| Core | `xrpl-py` ([README](github/XRPLF_xrpl-py.README.md)), docs https://xrpl-py.readthedocs.io | `xrpl` ([README](github/XRPLF_xrpl.js.README.md)), docs https://js.xrpl.org |
| x402 | `x402-xrpl` | `XRPLJapan/x402-xrpl`, `mpcp-protocol/x402-xrpl` (community) |
| Get started | [docs/tutorials__get-started__get-started-python.md](docs/tutorials__get-started__get-started-python.md) | [docs/tutorials__get-started__get-started-typescript.md](docs/tutorials__get-started__get-started-typescript.md) |

Key tutorials: [send XRP](docs/tutorials__payments__send-xrp.md), [send trust-line token](docs/tutorials__payments__send-a-trust-line-token.md), [reliable submission](docs/concepts__transactions__reliable-transaction-submission.md), [secure signing](docs/concepts__transactions__secure-signing.md), [monitor payments via WebSocket](docs/tutorials__advanced-developer-topics__client-library-development__monitor-incoming-payments-with-websocket.md), [tec codes](docs/references__protocol__transactions__transaction-results__tec-codes.md).

---

## 8. Files in this folder

| Path | What |
|---|---|
| [xrpl-llms.txt](xrpl-llms.txt) | Full xrpl.org index (every page available as `.md`) |
| [opensource-ripple-llms.txt](opensource-ripple-llms.txt) | opensource.ripple.com index |
| [docs/](docs/) | 123 pages: agentic transactions, payment channels, credentials, delegation, escrow, batch, MPT/stablecoins, tags, tx/ledger-entry references, tutorials |
| [skills/](skills/) | XRPL Claude skills (agent-wallet, payments, trading), as read-only copies |
| [pypi/x402-xrpl.README.md](pypi/x402-xrpl.README.md) | x402-xrpl SDK README |
| [github/](github/) | READMEs: xrpl-py, xrpl.js, coinbase/x402, XRPL-Standards |
