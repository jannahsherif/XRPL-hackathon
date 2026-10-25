# Settle

Settle is a simulated hospitality settlement app for Linden Park Club. It helps the club receive payment sooner, free working capital, and reduce manual reconciliation without making members feel rushed. The demo is frontend-only; no real money moves.

## Run locally

```sh
npm install
npm run dev
```

Open `http://localhost:3000`. The staff workspace is available at `/overview`; `/login` is a demo sign-in and does not verify credentials.

## Screens

- Staff workspace: `/overview`, `/tabs`, `/payments`, `/members`, `/collections`, `/agents`, `/reports`, `/settings`
- Demo surfaces: `/pos`, `/member`, `/manager`, `/present`
- In a demo surface, open the demo menu with `Cmd+.` or `?`. In the presenter view, use `1`, `2`, and `3` to switch acts.
- Use `Cmd+K` to open page navigation. Press `G` followed by `O`, `T`, `P`, `M`, or `C` to navigate.

The simulated store is the single state source for tabs, decisions, receipts, approvals, and demo resets. Settlement rules are deterministic and run locally. The live REST/SSE and XRP Ledger testnet adapters are optional integration points and are not enabled in this demo.

Headline business figures and the sample member/payment data are illustrative. Operational screens mark simulation and avoid presenting estimates as measured results.

## Validation

```sh
npm run typecheck
npm run build
npm run test:e2e
```
