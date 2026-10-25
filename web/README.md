# Settle web

The demo frontend: staff dashboard, POS, member phone, manager phone and the stage view. Vite + React + TypeScript + Tailwind, against the API in `api/` (its README is the contract).

## Run

```bash
cd api && npm run dev            # API on :8080 (stub ledger, DEMO=1)
cd web && npm install && npm run dev   # http://localhost:5173
```

Against the real ledger, start the API with `LEDGER_MODE=module SEED_LIVE_ESCROWS=1 npm run dev` instead. Nothing changes in `web/`.

`npm run dev:mock` renders every screen from `src/fixtures/` with no API. `npm run fixture` re-captures those fixtures from a running stub API (it resets the demo first).

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | The API |
| `VITE_STAFF_TOKEN` | unset | Sent as `X-Staff-Token` (approve, reject, close, `/demo/reset`) when the API has `STAFF_TOKEN` set |
| `VITE_TOKEN_LABEL` | `TUSD` | Token label everywhere (`RLUSD` to match Rob's mocks) |
| `VITE_MOCK` | unset | `1` = fixtures, no API |
| `VITE_XRPL_WS` | `wss://s.altnet.rippletest.net:51233` | Testnet node for ledger index and fee by tx hash |

**`VITE_STAFF_TOKEN` is compiled into the JavaScript bundle**, so anyone who can load a build made with it can read the token. Use it only on the stage laptop against a local or private API. Never set it for a build served publicly; there, staff actions need real auth or a proxy that adds the header.

## Routes

| Route | Screen |
|---|---|
| `/dashboard` | Staff dashboard: tiles, live tabs, drawer (`?tab=t1` opens one) |
| `/pos` | Demo terminal: menu grid, open tab rail, tab selector and New tab |
| `/member/:tabId` | Member's lock screen: push, countdown, tip, dispute, settled receipt |
| `/manager` | Manager's phone: held tabs and approval (`?tab=t5` opens one) |
| `/present` | Stage view: dashboard or POS left, phone right |
| `/login` | Static sign-in page for the video (no auth) |

**`/present` keys:** `1` member phone, `2` manager phone, `D` dashboard, `P` POS, `R` reset the demo (`POST /demo/reset`, then reload). The member phone follows the latest activity and comes up on each push; a new hold opens on the manager phone.

## Where the data comes from

- `GET /state` arrives as the first SSE `snapshot`; every change after that is an event on `GET /events?replay=1`. The replay restores what only events carry (ledger index from `tab.opened`, exit and decision times) after a reload.
- Ledger index and fee are not in the API: the dashboard reads them from testnet by tx hash (module mode only; stub hashes are fake).
- Menu photos are `public/menu/<menu id>.jpg`, cropped from the POS mockup in `design/`; a missing one shows a Stone tile with the name.
