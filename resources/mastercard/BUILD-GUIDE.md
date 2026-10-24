# Mastercard Agentic Payments: Build Guide

What you can build against today, how to authenticate, and where the specs are. Compiled 2026-10-24 from the docs in this folder.

> **Reality check for a hackathon**
> - **Agent Pay (card rail):** the dedicated Agent Pay developer page (`/mastercard-checkout-solutions/documentation/use-cases/agent-pay/`, live since 2025-10-16) now returns **404**, both on the web and through the MCP server. It is probably gated. Registration as an Agentic Token Requestor goes through a Mastercard representative.
> - **Checkout Solutions sandbox** (where MVCT / Agentic Tokens live) is **ordered via Mastercard Connect**, not instant self-serve. Request access on day 0.
> - **Agent Pay for Machines (AP4M)** buyer and seller APIs have been in **Early Access since 2026-10-20** (portal: `ap4m.build/info`, which redirects to mastercard.com). They are x402-based. Endpoint specs are not public yet.
> - **Fully open and buildable right now:** the Mastercard Developers MCP server (docs and OpenAPI specs), **Verifiable Intent** (open spec + Python reference implementation), **Web Bot Auth** (Cloudflare libs), and x402.

---

## 1. Pick a build track

| Track | What you build | Open today? | Key pieces |
|---|---|---|---|
| **A. Verifiable Intent agent** | An agent that issues and verifies the SD-JWT mandate chain (user → agent → merchant/network) | ✅ fully | `agent-intent/verifiable-intent` Python SDK |
| **B. Web Bot Auth merchant/agent** | Agent signs HTTP requests; merchant verifies against a key directory | ✅ fully | `cloudflare/web-bot-auth`, IETF draft |
| **C. Machine payments (AP4M-style)** | Agent pays 402-paywalled APIs under a budget; a seller verifies vouchers | ✅ x402 / ⏳ AP4M APIs (early access) | x402 v2 headers, AgentCore Payments, and XRPL as the rail |
| **D. Agentic Token checkout (card)** | Agent gets a virtual card token + one-time DTVC to fill a merchant form | ⏳ needs sandbox | Checkout Solutions MVCT API, OAuth 1.0a, JWE |
| **E. Docs-aware dev agent** | Agent that discovers Mastercard APIs and generates clients | ✅ fully | MCP server `developer.mcp.mastercard.com` |

Recommended combination for an XRPL hackathon: **A + C (+B)**. The user signs a Verifiable Intent mandate with a budget, the agent pays per call with XRPL (x402-style 402 → signed payment → retry), and every payment is checked against the mandate's constraints. Track D can be stubbed with the OpenAPI spec and sandbox example payloads until you have access.

---

## 2. Tooling (set up first)

### Mastercard Developers MCP (no auth)
```bash
claude mcp add --transport http mastercard-developers https://developer.mcp.mastercard.com
# or the plugin (bundles the "mastercard-best-practices" skill):
claude plugin marketplace add Mastercard/developers-agent-toolkit
claude plugin install mastercard-developers@mastercard-developers
```
Tools: `get-services-list`, `get-documentation`, `get-documentation-section-content`, `get-documentation-page`, `get-api-operation-list`, `get-api-operation-details`, `get-oauth10a-integration-guide`, `get-oauth20-integration-guide`, `get-openfinance-integration-guide`.

From a shell, use [tools/mc-mcp.sh](tools/mc-mcp.sh):
```bash
resources/mastercard/tools/mc-mcp.sh get-api-operation-details \
  '{"apiSpecificationPath":"/mastercard-checkout-solutions/swagger/checkout_mvct_v1.yaml","method":"POST","path":"/transaction/credentials"}'
```

### llms.txt
[llms.txt](llms.txt) (550 KB) indexes every product. Every docs page is fetchable as raw markdown by appending `index.md`, for example `https://developer.mastercard.com/<service>/documentation/<page>/index.md`.

---

## 3. Platform basics (all Mastercard REST APIs)

| Item | Value |
|---|---|
| Sandbox base | `https://sandbox.api.mastercard.com` |
| Prod base | `https://api.mastercard.com` |
| Default auth | **OAuth 1.0a** with RSA-SHA256 signature + **body hash** extension. Consumer key + `.p12` signing key from your Developers project |
| Alt auth | mTLS; OAuth 2.0 / FAPI 2.0 on some APIs |
| Payload encryption | JWE (RSA-OAEP-256 + A256GCM) for PAN and other sensitive fields. Use the `client-encryption-*` libs |
| Recommended client | Generate from the OpenAPI spec (openapi-generator) and plug in the signer interceptor |
| Test cards | [platform__test-cards.md](platform__test-cards.md) |

```bash
pip install mastercard-oauth1-signer mastercard-client-encryption
```
```python
from oauth1.oauth import OAuth
import oauth1.authenticationutils as authenticationutils

signing_key = authenticationutils.load_signing_key("sandbox.p12", "keystorepassword")
consumer_key = "<from developer portal>"
uri = "https://sandbox.api.mastercard.com/src/api/digital/payments/transaction/credentials"
payload = '{"srcClientId":"...","srcDigitalCardId":"...","dpaTransactionOptions":{...}}'
auth_header = OAuth.get_authorization_header(uri, "POST", payload, consumer_key, signing_key)
# requests.post(uri, data=payload, headers={"Authorization": auth_header, "Content-Type": "application/json"})
```
Full guides: [oauth1a-integration-guide-python.md](oauth1a-integration-guide-python.md), [oauth1a-integration-guide-typescript.md](oauth1a-integration-guide-typescript.md), [platform__authentication__using-oauth-1a-to-access-mastercard-apis.md](platform__authentication__using-oauth-1a-to-access-mastercard-apis.md), [platform__security-and-authentication__securing-sensitive-data-using-payload-encryption.md](platform__security-and-authentication__securing-sensitive-data-using-payload-encryption.md).

---

## 4. Track D: Agentic Tokens via Checkout Solutions (card rail)

The docs say: *"Mastercard Agent Pay integrators should utilize Mastercard Virtual Card Tokens (MVCT) when completing guest checkouts via the web, where the merchant acceptance interface is a simple form. Following user validation and consent for purchase, a one-time-use DTVC may be requested to populate the security code field."*

Agentic credential types: **DSRP** cryptograms (Digital Secure Remote Payment) for in-app/API checkout, and **DTVC** (one-time Dynamic Token Verification Code) for form-fill. Most agent platforms register as **Token Requestors**.

### Flow (MVCT)
1. **Enroll card**: `POST /cards` with a JWE-encrypted PAN, after consumer consent and authentication. Mastercard checks with the issuer and returns `srcDigitalCardId`.
2. **Checkout**: `POST /transaction/credentials` with `srcDigitalCardId`, `serviceId`, and `dpaTransactionOptions.paymentOptions.dynamicDataType = "DYNAMIC_CARD_SECURITY_CODE"`. The response contains the token PAN, expiry and a **one-time DTVC** (JWE-encrypted).
3. The agent fills the merchant form with the token + DTVC. The merchant's processor authorizes as normal, and Mastercard validates the DTVC and goes to the issuer.
4. **Notifications**: card lifecycle (`/notifications/card`) and push transaction details (`/notifications/transaction`) arrive at your webhook.
5. Delete or manage: `DELETE /cards/{cardId}`, `GET /cards/{cardId}/transactions`.

| Spec ([openapi/](openapi/)) | Ops |
|---|---|
| `card_v1.yaml` | `POST /cards`, `GET/DELETE /cards/{cardId}`, `GET /cards/{cardId}/transactions` |
| `checkout_mvct_v1.yaml` | `POST /transaction/credentials` (MVCT + DTVC) |
| `checkout_scof_v1.yaml` | `POST /transaction/credentials` (Secure Card on File, DSRP cryptogram) |
| `checkout_gc_v1.yaml` / `checkout_c2p_v1.yaml` / `checkout_qr_v1.yaml` | Guest-checkout / Click to Pay / QR variants |
| `authentication_v1.yaml` | Passkey / authenticator: `lookup`, `authenticators` (POST/DELETE), `authenticate` |
| `checkout1.0.yaml` | `POST /confirmations` (report the outcome back) |
| `dpa_registration_v1.yaml` | Register merchants (DPAs) in batch |
| `notifications_v1.yaml` | Webhooks you implement |
| `precheckout-b2b.yaml` | Identity lookup/validation, profile prepare |

Server for card + checkout: `https://sandbox.api.mastercard.com/src/api/digital/payments`.
Sample IDs in the spec: `srcClientId`, `srcCorrelationId`, `serviceId: "AUTOFILL#MACS_MVCT_TESTING#01"`, `srcDigitalCardId`.

Docs: [checkout-solutions/use-cases__virtual-card-tokens*.md](checkout-solutions/), [checkout-solutions/gettingstarted.md](checkout-solutions/gettingstarted.md), [checkout-solutions/api-basics.md](checkout-solutions/api-basics.md), [checkout-solutions/token-authentication*.md](checkout-solutions/) (passkeys), [checkout-solutions/testing__test_cases__mastercard_virtualcard_tokens.md](checkout-solutions/testing__test_cases__mastercard_virtualcard_tokens.md).

---

## 5. Track A: Verifiable Intent (open, Python)

Spec v0.1, maintained by Mastercard (co-launched with Google, March 2026). It defines a **layered SD-JWT delegation chain**:

| Layer | Issuer → Holder | Contains | Lifetime |
|---|---|---|---|
| **L1** SD-JWT | Credential Provider (issuer) → User | identity, `pan_last_four`, scheme, `cnf.jwk` = user device key | ~1 yr |
| **L2** KB-SD-JWT | User → Agent | *Immediate:* final checkout + payment. *Autonomous:* **constraints** + `cnf.jwk` = agent key | 15 min / 24 h–30 d |
| **L3a** | Agent → Network | final payment, `transaction_id`, `payment_instrument` | ~5 min |
| **L3b** | Agent → Merchant | final checkout `checkout_jwt`, `checkout_hash` | ~5 min |

Constraint types include the amount range, allowed line items, approved merchants/payees, and more (see [constraints.md](github/verifiable-intent-spec/constraints.md)). L3a `transaction_id` must equal L3b `checkout_hash`.

```bash
git clone https://github.com/agent-intent/verifiable-intent && cd verifiable-intent
uv venv .venv && source .venv/bin/activate && uv pip install -e ".[dev]"
python examples/autonomous_flow.py      # 3-layer delegated purchase
python examples/constraint_checking.py  # all constraint types
python examples/network_validation.py   # network-side validation pipeline
```
Spec: [github/verifiable-intent-spec/](github/verifiable-intent-spec/). **XRPL idea:** use L2 Autonomous constraints as the budget/payee policy for XRPL payments, and anchor `checkout_hash` / mandate hashes in an XRPL `Memo`, or use XRPL Credentials as the L1 issuer anchor.

---

## 6. Track B: Web Bot Auth (agent identity on HTTP)

The agent signs each request (HTTP Message Signatures, RFC 9421) with an Ed25519 key published in a key directory. The merchant/CDN verifies the `Signature`, `Signature-Input` and `Signature-Agent` headers. This is what Mastercard Agent Pay's Acceptance Framework builds on.
- Repo: `cloudflare/web-bot-auth` ([README](github/cloudflare_web-bot-auth.README.md)). IETF WG: https://datatracker.ietf.org/wg/webbotauth/about/
- Merchant-side implementation and verification steps: [merchant-cloud__tutorials-and-guides__agentic-commerce-guide__21.md](merchant-cloud__tutorials-and-guides__agentic-commerce-guide__21.md) §"Identifying Agent Traffic with Web Bot Auth".

---

## 7. Track C: Agent Pay for Machines / x402

**Model:** *"Authorize once. Transact many times. Guarantee payment now. Settle later."*
1. **Mandate:** the business sets the task and spend limit (permissions recorded on-chain).
2. **Discovery:** the agent finds registered providers and proposes a plan, which the business approves.
3. The seller returns **HTTP 402** with `PAYMENT-REQUIRED` (x402 v2).
4. The agent sends a signed **voucher** in `PAYMENT-SIGNATURE`. The seller verifies it off-chain and serves the request.
5. The seller **batch-redeems** vouchers later, and settlement happens on-chain (Base in the demo). BVNK / Mastercard Global Money Platform converts fiat ↔ stablecoin.

Early Access (2026-10-20) has v1 buyer and seller APIs, a toolkit, a sandbox and docs. There are no public endpoint specs. Pilots included Cloudflare (Monetization Gateway), Coinbase CDP, Base, BVNK, Ant International, AIsa and Hype.

**XRPL build:** implement the same buyer/seller roles on XRPL:
- **Voucher = XRPL Payment Channel claim.** This maps almost exactly: the agent funds a channel once (authorize once), signs off-ledger claims per request (guarantee now), and the seller redeems the highest claim later (settle later). Use `PaymentChannelCreate`, then sign claims off-ledger, then `PaymentChannelClaim`.
- The budget is the channel amount, plus the VI L2 constraints. RLUSD works via IOU / MPT where supported, otherwise XRP.
- Wrap it as an x402 `scheme` so standard 402 clients (AgentCore Payments, the Strands payments plugin) can be extended.

---

## 8. Merchant-side context (the "levels" playbook)

Mastercard's Developer Playbook for agentic commerce:
- **Level 1:** minimal changes. Accept tokenized credentials, recognize certified agents, Web Bot Auth, 3DS, agent-readable forms (autocomplete, semantic fields). [guide 21](merchant-cloud__tutorials-and-guides__agentic-commerce-guide__21.md)
- **Level 2:** user recognition via identity tokens (Agent Pay / Visa VIC / Amex ACE), JSON-LD, ARIA, agent-optimized checkout, **WebMCP**, payment-container signing. [guide 22](merchant-cloud__tutorials-and-guides__agentic-commerce-guide__22.md)
- **Level 3:** programmatic checkout through agentic API endpoints, an MCP server, **UCP**, intent capture/validation, and the payment object structure. [guide 23](merchant-cloud__tutorials-and-guides__agentic-commerce-guide__23.md)
- **Testing and reference** (agent browsers, checklists, glossary): [guide 24](merchant-cloud__tutorials-and-guides__agentic-commerce-guide__24.md)
- Landscape (Agent Pay vs Visa Intelligent Commerce vs Amex ACE, ACP, UCP): [ai-revolution__14](merchant-cloud__tutorials-and-guides__ai-revolution__14.md)

---

## 9. Files in this folder

| Path | What |
|---|---|
| [llms.txt](llms.txt) | Full Mastercard Developers product/doc index |
| [mcp-services-list.md](mcp-services-list.md) | `get-services-list` output (all services + doc trees) |
| [openapi/](openapi/) | 12 Checkout Solutions OpenAPI specs |
| [checkout-solutions/](checkout-solutions/) | 91 Checkout Solutions doc pages (MVCT, SCOF, Click to Pay, TAS/passkeys, testing) |
| `merchant-cloud__*.md` | Agentic commerce explainers + the L1–L3 developer playbook |
| `platform__*.md` | Auth, credentials, encryption, dev tools, test cards, Agent Toolkit |
| [github/](github/) | READMEs: developers-agent-toolkit, verifiable-intent (+ spec/), oauth1-signer (py/node), client-encryption-python, web-bot-auth |
| [tools/mc-mcp.sh](tools/mc-mcp.sh) | Shell client for the Mastercard MCP server |

## Sources (non-Mastercard-docs)
AP4M early access: [The Block](https://www.theblock.co/news/business/2026-10-20-mastercard-opens-early-access-to-ai-agent-payments-following-pilots-with-coinbase-base-and-cloudflare-421406) · [CoinMarketCap](https://coinmarketcap.com/academy/article/mastercard-agent-pay-machines-early-access) · [Stablecoin Insider](https://stablecoininsider.org/mastercard-agent-pay-for-machines/) · [TechTimes](https://www.techtimes.com/articles/329316/20261021/mastercard-opens-developer-apis-ai-agent-payments-built-x402-protocol.htm)
