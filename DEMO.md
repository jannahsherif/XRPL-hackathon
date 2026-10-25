# Demo recording script (real ledger)

Walked step by step on `main` against the stub; the testnet-only differences are marked **(testnet)**. Names are the current seed: t1 = **E. Vance · Bar 3**, t5 = **J. Pike · Library 2**.

**Hands-free option:** after pre-flight, `cd web && npm run demo:autopilot` drives sections 1 and 2 in its own 1920×1080 Chrome window (visible cursor, click ripples, hotkey badges), waiting for each settle and pausing at the narration points. Record that window. Add `-- --step` to advance each narration point with Enter, or `-- --pause 1.5` for longer pauses. It refuses to start unless t1 and t5 are fresh and escrowed.

## 0. Pre-flight (≈2 min)

1. Stop any running API (Ctrl-C in its terminal; `lsof -iTCP:8080 -sTCP:LISTEN` shows nothing) → port 8080 is free.
2. `cd ledger && npm run demo:reset` → ends with `venue 0 TUSD` … `member-5 1200 TUSD` (≈30–60 s).
3. `cd api && DEMO=1 LEDGER_MODE=module LEDGER_MODULE=../ledger/src/index.ts SEED_LIVE_ESCROWS=1 HOST=127.0.0.1 npm run dev` → `settle backend up`, then two `[ledger] EscrowCreate … tesSUCCESS` lines (≈15 s).
4. Wait 30 s after the second EscrowCreate → FinishAfter has passed for t1 and t5.
5. `cd web && npm run dev`, open **http://localhost:5173/present**, full screen at 1920×1080 → dashboard left, phone right showing "Nothing yet".
6. `curl -s http://127.0.0.1:8080/state | jq -r '.tabs[] | select(.id=="t1" or .id=="t5") | "\(.id) \(.memberName): \(if .escrow.txHash then "escrowed" else "NOT escrowed" end)"'` → both say **escrowed**. Badge reads **Settlement · XRPL LIVE**; Open tabs tile says **2 of 6 escrowed**.
7. Pre-open in other tabs: venue https://testnet.xrpl.org/accounts/racCSEur13ufSxQozezdFKrvykwyWnjGE3 and member-1 https://testnet.xrpl.org/accounts/rNNmUJNWVvnwyzwiR5SuohEX5VKVuTZani.
8. Start the screen recording (1920×1080, the /present window).

## 1. Scenario A: E. Vance walks out (≈45 s)

1. Press **P** → POS; the rail is already on **E. Vance · Bar 3 · $62.00** (Martini ×2, Oysters).
2. Tap **Old Fashioned**, wait 1 s, tap **Old Fashioned** again → rail "Old Fashioned × 2 · $40.00" (taps closer than 0.6 s count once).
3. Tap **Club Burger**, then **Truffle Fries** → **Total $142.00**, "858 TUSD headroom in escrow". *Pause: no card, no pre-auth.*
4. Press **1** → phone "E. Vance's phone": "You're checked in at The House. Your tab is $142.00 so far · 7 items."
5. Press **D**, click the **E. Vance · Bar 3** row → drawer "TAB · E. VANCE", Escrow card: 1,000 TUSD, EscrowCreate, ledger #, tx, **validated · N s** (testnet). *Pause: the allowance sits in escrow on XRPL.*
6. Click **Simulate exit · DEMO** (drawer, bottom right) → phone: "Looks like you've left The House. We'll settle your tab for **$142.00** in **00:10**." with tips 15 / 18 / **20** / 22 / Other, "Your standing rule 20% · $28.40", **Total $170.40** (≈0.3 s).
7. Let the countdown run 00:10 → 00:00 → phone "Settling… $170.40", row "Agent reconciling" (10 s). *Narrate the tip/dispute window.*
8. Wait → phone "**$170.40** Settled with The House · 829.60 TUSD went back to you · Receipt · **Batch** … · validated in N s"; toast top right; row flashes; tile **$342,180 → $342,009.60** "↓ $170.40 · never became a receivable" (≈5–7 s, testnet).
9. Point at the drawer, now "SETTLEMENT · E. VANCE": Exit detected → Agent reconciled ("7 items vs POS ✓ · tip rule 20% applied · no anomaly") → **Settled on XRPL · Batch · ledger N**; **To venue 170.40 TUSD**, **Back to member 829.60 TUSD**, Ledger fee (≈1–3 s to fill), Finish / Refund / Batch hashes, **View on testnet explorer**, **validated · N s**. Optional: click the explorer link, show it, come back.

## 2. Scenario B: the $900 bottle (≈40 s)

1. Press **P**, pick **J. Pike · Library 2 · $44.00** in the rail selector.
2. Tap **Dom Pérignon P2 (bottle)** **once** → Total **$944.00**, "56 TUSD headroom"; the tile dims to "$900 · already on this tab".
3. Press **D**, click the **J. Pike** row, click **Simulate exit · DEMO** → phone push "…your tab for **$944.00** in 00:10."
4. Wait the 10 s → row turns terracotta **Held · manager review / OVER_TYPICAL_SPEND · rules**; phone: "A manager is taking a quick look… Nothing has moved: your 1,000 TUSD is still in escrow until a human approves."
5. Press **2** → manager phone: **HELD FOR REVIEW · J. Pike · Library 2** "Agent paused settlement N s ago", bottle row highlighted, Total $944.00, Why: "Tab total $944.00 is over 3x Jordan's typical $120.00; largest line is Dom Pérignon P2 (bottle)", "Policy: hold if > 3× typical or any item > allowance". *Pause: nothing moves on-ledger until a human approves.*
6. Tap **Approve** → button "Settling on XRPL…", row "Agent reconciling" at once.
7. Wait → **APPROVED · SETTLED ON XRPL** "1,000 TUSD to the venue (incl. $56.00 tip) · 0 TUSD back · N s"; tile ↓ $1,000 to **$341,009.60** (≈5–7 s, testnet). Tip trimmed to what the escrow holds.
8. Stop recording. **Do not press R.** The next take starts at section 0 (member-5 now has 200 TUSD).

## 3. Optional AP4M beat — skip if 3001 isn't up

Needs an API on 3001 in `LEDGER_MODE=ap4m AP4M_NETWORK=live` with funded agent and submitter wallets (the agent `0x742d…097b` had **0 XRP** at last check; faucet https://faucet.testevm.ripple.com). Run a second web: `cd web && VITE_API_URL=http://localhost:3001 npx vite --port 5174`, open http://localhost:5174/present.

1. P → `+` → member Eleanor Vance → **Open tab** → rail "Opening tab… escrowing allowance", then the new tab (channel open on XRPL EVM; time unverified live).
2. Tap Old Fashioned, Club Burger → D → click the new row → Simulate exit → settled after grace (≈12 s simulated; live unverified). Badge reads **Settlement · AP4M**.
3. The EVM links are the drawer's **explorer** links next to Finish / Refund (live mode sends explorer.testnet.xrplevm.org URLs; checked in code, not live). Safer on camera: `curl -s localhost:3001/tabs/<id> | jq .ap4m` shows channel, voucher and payout hashes.

## 4. Recovery

- **Slow testnet mid-settle:** "Settling…" or "Settling on XRPL…" stays up. Keep talking and don't click; the card arrives late (each tx waits up to 45 s). Over 60 s, or the row goes **Held · LEDGER_TIMEOUT**: cut and restart the take.
- **Red toast with 409** (double exit, item after exit, double approve): ignore it; the first action stands. **ESCROW_NOT_FOUND** means pre-flight was skipped: restart.
- **Restart a take (≈2 min):** stop recording → Ctrl-C the API → section 0 steps 2–6 → Cmd-R the /present tab.
- **Page suddenly unstyled:** Ctrl-C and restart `npm run dev` in `web/`.

## 5. Timing (testnet, from the audit runs)

| Step | Seconds |
|---|---|
| Open a tab (not needed: t1 and t5 are pre-escrowed) | ≈5 |
| Exit → push | <0.5 |
| Exit → reconciling (grace) | 10 |
| Reconciling → settled (Batch) | 5–7 (measured 5.6) |
| Exit → held (scenario B) | 10 |
| Approve → settled | 5–7; up to 30 if the escrow is younger than 30 s |
| Ledger fee and ledger # fill in | 1–3 |
| Toast stays up | 10 |

## Known cosmetic things (don't stop for them)

- Phone shows "Nothing yet" until the first order; the tip card's eyebrow reads "EXPANDED · TIP"; tips are 15/18/20/22.
- Sancerre tile is darker than its neighbours; the Ribeye photo is a strip.
- "validated · N s" is ledger time only, not the 10 s window.
- After Approve the row says "Agent reconciling" while it settles.
- Settled tile reads "1 ledger" (Batch, or one EscrowFinish).
- B's timeline shows "tip 6% · $56.00": the 20% trimmed to the escrow.
- Outstanding balances start from the seeded $342,180.
- AP4M beat: the drawer still says "Settled on XRPL · EscrowFinish", amounts are labelled TUSD (AP4M pays 1/100 in RLUSD), and the ledger # stays "—".
