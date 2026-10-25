# XRPL-hackathon
Building autonomous financial agents on the XRP Ledger | XRPL Hackathon NYC 2026

**Settle**: a member's bar or restaurant tab is escrowed on XRPL when it opens, and an AI agent settles it the moment they leave. Three parts:

| Folder | What it is | Docs |
|---|---|---|
| `ledger/` | XRPL testnet layer: token escrow per tab, credentials, balances | [ledger/README.md](ledger/README.md) |
| `api/` | Tab state machine, settlement agent, manager approval, live events (SSE) | [api/README.md](api/README.md) |
| `web/` | Staff dashboard, POS, member and manager phones, the stage view | [web/README.md](web/README.md) |

## Run the demo

You need Node 24 (22.18 or later), npm, and `ledger/.env` with the testnet seeds (ask Alex; it is gitignored, never commit it). Install once:

```bash
(cd ledger && npm install) && (cd api && npm install) && (cd web && npm install)
```

Then, in this order, with three terminals:

**1. Reset testnet** (terminal 1). Closes any open tab escrows and puts every balance back to the demo's starting amounts. Do this before the API boots, never while it runs.

```bash
cd ledger && npm run demo:reset
```

It ends by printing `venue 0`, `member-1 5000` … `member-5 1200` (TUSD).

**2. Boot the API on the real ledger** (terminal 2):

```bash
cd api && LEDGER_MODE=module SEED_LIVE_ESCROWS=1 npm run dev
```

Wait for `settle backend up`. It then opens real escrows for the two stage tabs: t1 (Eleanor Vance, Bar 3) and t5 (Jordan Pike, Library 2). Each escrow can only be finished 20 s after it opens (FinishAfter, rounded up to the next ledger close), so **wait 30 s** before step 4's exits.

**3. Start the web app** (terminal 3):

```bash
cd web && npm run dev
```

**4. Open http://localhost:5173/present** on the projector (full screen, 1920×1080). The badge top right should read **Settlement · XRPL LIVE** and the Open tabs tile **2 of 6 escrowed**.

Keys in `/present`: `D` dashboard, `P` POS, `1` member phone, `2` manager phone, `R` reset (see the checklist before pressing it).

### Scenario 1: the member walks out and the tab settles itself

1. Press `P`. In the rail's tab selector pick **E. Vance · Bar 3** (t1). Tap a couple of drinks; they stream to the dashboard.
2. Press `D`, click the **E. Vance · Bar 3** row, press **Simulate exit · DEMO**.
3. The member phone shows the push with a 10 s countdown (tip 18/20/25 works here).
4. At 0 the agent reconciles, the escrow finishes on XRPL (about 5 s), the toast and the drawer show the timeline, the settlement (to venue, back to member, ledger fee) and the explorer links. Outstanding balances tick down.

Opening a brand-new tab instead (POS, `+`) works too, but it must be at least 30 s old before you exit it.

### Scenario 2: the $900 bottle is held for a human

1. Press `P`, pick **J. Pike · Library 2** (t5), tap **Dom Pérignon** ($900, anomaly trigger).
2. Press `D`, click the **J. Pike** row, **Simulate exit · DEMO**. After the countdown the row turns terracotta: **Held · manager review**, `OVER_TYPICAL_SPEND · rules` (3× his typical $120).
3. Press `2`. The manager phone shows the hold, the highlighted bottle and why the agent held it. Press **Approve**: it settles on XRPL (1,000 TUSD to the venue; the tip is trimmed to what the escrow holds).

### Pre-demo checklist

- [ ] **Reset before boot, never within 30 s after.** `npm run demo:reset` only with the API stopped. Don't press `R` in the first 30 s after the API boots (or after a previous `R`): it has to cancel escrows that are still too fresh, and it just waits.
- [ ] **Don't exit a tab within 30 s of opening it.** The settle waits for FinishAfter; on stage that looks like a hang.
- [ ] **To rerun scenario 2, restart from step 1.** Approving the $900 tab leaves member-5 with 200 TUSD, so `R` can't re-open t5's 1,000 escrow. Stop the API (Ctrl-C), `npm run demo:reset`, boot again, wait 30 s.
- [ ] **Credentials are already issued.** Never run `setup:accounts`, `setup:token` or `setup:credentials` before the demo.
- [ ] **Pre-open the explorer tabs** (XRPL testnet):
  - Venue: https://testnet.xrpl.org/accounts/racCSEur13ufSxQozezdFKrvykwyWnjGE3
  - Member-1 (Eleanor Vance): https://testnet.xrpl.org/accounts/rNNmUJNWVvnwyzwiR5SuohEX5VKVuTZani
  - Member-5 (Jordan Pike): https://testnet.xrpl.org/accounts/rE3UB34tKGhyJ34zqMsBrpSpzchYe7DQbs
  - TUSD issuer: https://testnet.xrpl.org/accounts/r2GfPNjV5vW1Gz2W9n4szD9nXJLduVEwe
- [ ] **Fallback if testnet is slow:** stop the API and run `cd api && npm run dev` (stub ledger). Same screens; the badge reads **Settlement · STUB**.
- [ ] **Rehearse the run with no UI:** `cd web && npm run acceptance` drives both scenarios and prints every event. Boot the API **without** `SEED_LIVE_ESCROWS` for it (the script opens its own m5 tab, and t5's seed escrow would already hold 1,000 of member-5's 1,200), and run `npm run demo:reset` in `ledger/` afterwards.
