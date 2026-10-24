# Opportunity & Positioning

## The pitch, sharpened by research

> Hospitality runs on trust: members sign, guests charge to the room, corporate clients get billed later. That trust creates balances, and those balances are managed by understaffed finance teams across disconnected systems. **Settle is an AI agent that watches every balance across every location, predicts what's going to be late, reconciles what came in, and makes paying effortless for the member or client.** The result is lower outstanding balances, a faster close, and lower payment costs, without damaging the relationship.

**Say:** "get paid," "settle up," "reconcile," "forecast cash," "frictionless payment."
**Avoid:** "deadbeats," "skip-outs," "debt collection," "chasing members."

## Why now
1. Finance talent shortage (61% of finance leaders report shortages) plus hospitality understaffing.
2. AI agents are entering hospitality back offices (AHLA/HTNG 2026, Mews 2026).
3. Payment costs are rising (2.35% average interchange; card fees are a restaurant's #3 cost), so operators want cheaper rails.
4. Agentic and stablecoin payment rails are now real: Mastercard Agent Pay, x402, XRPL agentic transactions, AgentCore Payments.

## Target customer (beachhead)
**Multi-location private club groups and hospitality management companies** (e.g. 3–50 properties):
- The balances are large and recurring (member house accounts, minimums, events)
- One finance team covers many properties, which is where multi-location roll-up matters most
- Relationship-sensitive, which rewards Settle's tone-aware approach

Expansion: hotel management companies (city ledger, banquets), then multi-unit restaurant groups (house accounts, catering, chargebacks).

## Value hypotheses to validate
| Hypothesis | Metric |
|---|---|
| Proactive nudges before minimum-period and statement close reduce aged balances | % of balance >60 days, DSO |
| Automated matching cuts reconciliation hours per location | Hours/week, match rate |
| Pay links on cheaper rails reduce payment cost on large balances | Effective fee % |
| Forecasting improves cash planning | Forecast accuracy (MAPE) |
| Per-location chargeback monitoring prevents processor risk | Chargeback ratio |

## Business model options
- SaaS per location per month (Monitor/Forecast/Reconcile)
- Plus a performance or payment component: a small fee on volume settled through Settle pay links
- Enterprise tier: multi-property roll-up, custom integrations

## Hackathon angle: Settle × XRPL × Mastercard × AWS
Ties into the research on the `resources/hackathon-docs` branch:

| Settle step | Tech |
|---|---|
| Agent runtime, tools, guardrails | **AWS Bedrock AgentCore + Strands** (Gateway tools for POS/PMS data, Policy caps, Memory per account) |
| Pay link for a large balance (event, corporate, member) | **XRPL RLUSD/XRP payment**: near-instant finality, fees well under a cent, settles straight to the operator's wallet (non-custodial). The destination tag maps to the Settle account/invoice, which makes reconciliation trivial |
| Reconciliation | XRPL tx hash + DestinationTag + Memo (invoice id), so the payment matches deterministically |
| Card payers | Mastercard rails (tokenized card-on-file / Click to Pay) remain the default; Settle routes by payer preference and cost |
| Agent-to-agent B2B settlement | A corporate client's AP agent pays the hotel's Settle invoice endpoint via **x402 on XRPL** |
| Trust / verification | XRPL Credentials for verified corporate payers; Verifiable Intent for agent-initiated payments |

**Demo story (3 min):** a group of 3 clubs with $X outstanding across systems.
1. Settle surfaces at-risk balances and forecasts end-of-month cash.
2. It auto-reconciles yesterday's deposits and flags 2 exceptions.
3. It sends a friendly, on-brand pay link before a member's minimum period closes.
4. The member pays in RLUSD on XRPL, which settles in seconds and auto-matches by destination tag.
5. The dashboard updates.

## Open questions
- Which club and PMS systems have usable APIs for a pilot (Jonas and Clubessential partner access)?
- Will members or corporate clients actually pay in stablecoin, or is it an operator-side rail (e.g. paying in card or ACH and settling the operator in RLUSD)?
- Pricing tolerance per location?
- Real DSO and bad-debt baselines from HFTP or pilot customers.
