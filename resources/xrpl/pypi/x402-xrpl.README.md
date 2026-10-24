# x402 XRPL Python SDK

This package provides a small, spec‑aligned SDK for working with x402 payments over XRPL in this repository. It is designed to be reusable by both **buyer clients** (creating `PAYMENT-SIGNATURE` headers) and **seller/resource servers** (verifying and settling via a facilitator).

**Note**: The XRPL `exact` flow in this repo is the **presigned `Payment` tx blob** scheme.

For an overview of the scheme and end-to-end flow, see: `app/docs/xrpl-exact/presigned-payment/README.md`.

---

## Install (PyPI)

Requires Python 3.11+.

```bash
pip install x402-xrpl
```

Note: the PyPI name uses a hyphen, but the import name uses an underscore:

```python
import x402_xrpl
```

---

## Quickstart: Buyer Client (requests-style)

If you want the UX of `x402_requests(...)` (auto-handle 402), use `x402_xrpl.clients.requests`:

Buyer clients call the protected resource URL and use XRPL RPC plus optional filters. They do not take a facilitator URL.

```python
import requests
from xrpl.wallet import Wallet

from x402_xrpl.clients.requests import x402_requests
from x402_xrpl.clients.base import decode_payment_response

XRPL_RPC = "https://s.altnet.rippletest.net:51234/"
RESOURCE_URL = "http://127.0.0.1:8080/xrpl-demo/resource"

wallet = Wallet.from_seed("…demo seed…")

session: requests.Session = x402_requests(
    wallet,
    rpc_url=XRPL_RPC,
    # Optional filters so most users don't write a custom selector:
    network_filter="xrpl:1",
    scheme_filter="exact",
)

resp = session.get(RESOURCE_URL, timeout=180)
print(resp.status_code, resp.text)

if "PAYMENT-RESPONSE" in resp.headers:
    settlement = decode_payment_response(resp.headers["PAYMENT-RESPONSE"])
    print("settled tx:", settlement.get("transaction"))
```

### Safe retries for verify-stage outages

When the resource server returns a typed transient response with HTTP 503,
`retryable=true`, `phase=verify`, and `settlementAttempted=false`, the buyer session
reuses the same invoice and `PAYMENT-SIGNATURE` for at most two retries while the
payment requirement remains within `maxTimeoutSeconds`. `Retry-After` controls the
delay. It never retries a response where settlement may have been attempted.

FastAPI/Starlette resource servers using `require_payment` propagate facilitator
verify-stage 408, 429, 5xx, and transport timeouts as this typed 503 response. The
response includes `retryAfter`, `correlationId`, and the two safety fields above. This
is fail-closed: the protected handler and `/settle` are not called. Policy denials and
other 4xx responses remain non-retryable.

## Cross-currency payments (opt-in)

By default the payer funds the exact quoted asset: an XRP quote is paid in XRP (no `SendMax`),
and an IOU quote is paid with a same-asset `SendMax` equal to `Amount`. When the merchant
advertises `extra["crossCurrency"] = True`, you may fund from a **different** asset by passing
`pay_with` to `prepare_payment` as an XRP drops string or an `IssuedCurrencyAmount`:

```python
# XRP -> IOU: fund a USD quote with XRP (a drops-string SendMax)
payer.prepare_payment(req, pay_with="1000000")

# IOU -> XRP, or IOU -> a different IOU: fund with an issued-currency SendMax
from xrpl.models.amounts import IssuedCurrencyAmount
payer.prepare_payment(req, pay_with=IssuedCurrencyAmount(currency="USD", issuer="rISSUER", value="5"))
```

The destination `Amount` is always pinned to the quote (cross-currency only relaxes the
`SendMax` asset). The signed `SendMax` is your own spend ceiling. Before signing, the client
refuses: a `pay_with` when the merchant did not opt in, a drops-string `pay_with` for an XRP
destination (XRP→XRP is not cross-currency), and any non-positive or malformed `SendMax` —
matching the facilitator's verifier so a bad value never wastes a signed transaction.

## Quickstart: Protecting a FastAPI Route with `require_payment` (recommended)

To protect a route (e.g. `/ai-news`) with XRPL x402 payments using an ergonomic wrapper:

```python
from fastapi import FastAPI

from x402_xrpl.server import require_payment

app = FastAPI()

app.middleware("http")(
    require_payment(
        path="/ai-news",
        price="1000",  # XRP drops; for IOUs use the XRPL value string (e.g. "1.25")
        pay_to_address="rhaDe3NBxgUSLL12N5Sxpii2xy8vSyXNG6",
        network="xrpl:1",
        asset="XRP",
        facilitator_url="http://127.0.0.1:8011",
        resource="demo:ai-news",
        description="AI news feed (paid)",
    )
)
```

### XRPL SourceTag (analytics)

By default, this SDK issues `PaymentRequirements.extra["sourceTag"] = 804681468` and buyer clients will sign XRPL `Payment` transactions with `SourceTag = 804681468` (so XRPL can query/aggregate these payments on-ledger).

To override the tag for your app, pass your own value in `extra`:

```python
app.middleware("http")(
    require_payment(
        # ...
        extra={"sourceTag": 123},
    )
)
```

---

**IOU notes** (non-XRP assets):

- Set `reqs.asset` to the XRPL currency code (**MUST** be 3 chars or 40-hex).
- Provide the issuer as `reqs.extra["issuer"]` (classic address).
- Set `reqs.amount` to the XRPL issued-currency `value` string (e.g. `"1"`, `"1.25"`).

For RLUSD, raw payment requirements should use `524C555344000000000000000000000000000000` as `reqs.asset` and include the
issuer in `reqs.extra["issuer"]`.

If you want a human-friendly display string (or an opt-in conversion of a symbol like `"RLUSD"` into a 40-hex code), use the currency helpers:

```python
from x402_xrpl.xrpl_currency import display_currency_code, resolve_currency_code

asset = "524C555344000000000000000000000000000000"
print(display_currency_code(asset))  # "RLUSD" (best-effort)

# Opt-in convenience (only use if your app has a trusted mapping/intent):
asset_hex = resolve_currency_code("RLUSD", allow_utf8_symbol=True)
```

## Optional X402 Secure / Verifiable Intent

Buyer clients can attach a Verifiable Intent L1-L3 chain through the `verifiable_intent_provider` seam. When the
hosted XRPL Facilitator receives `extensions.x402Secure`, it calls X402 Secure and Trustline before settlement. Plain
XRPL x402 payments without the extension remain on the normal path.

Use `RemoteIssuerProvider` when the agent cannot hold the Trustline issuer secret. The remote endpoint only issues L1;
the SDK still signs L2 with the owner key and L3 with the agent key locally:

```python
from x402_xrpl.vi import RemoteIssuerProvider, RemoteIssuerSource

provider = RemoteIssuerProvider(
    issuer=RemoteIssuerSource(
        endpoint="https://agent.example/api/vi/issue-l1",
        headers=lambda: {"authorization": f"Bearer {short_lived_issuer_token}"},
    ),
    issue_request={
        "subject": owner_account_ref,
        "ownerPublicJwk": owner_public_jwk,
        "allowedChains": ["xrpl"],
        "allowedAssets": ["XRP"],
        "spendingCeiling": "0.001",
        "validitySeconds": 3600,
        "ownerProof": owner_proof,
    },
    owner_private_jwk=owner_private_jwk,
    owner_kid=owner_kid,
    agent_private_jwk=agent_private_jwk,
    agent_public_jwk=agent_public_jwk,
    agent_kid=agent_kid,
    constraints={"allowed_chains": ["xrpl"], "allowed_assets": ["XRP"], "per_transaction_max": "0.001"},
)
```

Do not put Trustline API keys, issuer secrets, wallet seeds, owner private keys, or agent private keys into the x402
payment payload.

## Payment safety

- Before signing, the payer requires its configured network, quote network, RPC
  `server_info.info.network_id`, and any autofilled network ID to agree. Missing RPC network
  information is rejected. Explicit invoice IDs must match the quote when both are present.
- Set `max_fee_drops` on the payer options, `x402_requests`, or `x402_purchase` to choose your
  application's fee ceiling. The default is `10000` drops (0.01 XRP), checked after autofill and
  before signing. Existing `signedTxBlob` payloads and default `both` invoice binding are preserved.
- Header helpers and payer methods accept optional `resource`; high-level clients forward the
  advertised resource. Existing custom header factories without this parameter still work.
- `isValid` and `success` must be JSON booleans. `x402_purchase` returns `settle_failed` for a
  valid `success: false`. A malformed settlement header or unavailable paid-request response
  returns `settlement_unknown`, with `retryable=False` and original transaction recovery metadata
  when available. Query the original transaction before attempting another payment; this lookup
  is the application's responsibility. A true flag alone is not independent ledger proof.
- Facilitator HTTP exception messages contain status and a validated request ID instead of
  the response body or request URL. The original response is still available explicitly.

---

