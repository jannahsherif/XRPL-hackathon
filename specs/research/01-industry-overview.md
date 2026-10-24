# Industry Overview

Research for **Settle** ([../SETTLE.md](../SETTLE.md)). Compiled 2026-10-24 from web research. Every figure is tagged with its source and a confidence level.

## Segments that carry F&B balances

Settle's problem space is **money already owed for F&B that hasn't landed yet**. It shows up differently in each segment:

| Segment | How the F&B balance arises | Who owes it | Typical ledger |
|---|---|---|---|
| **Private / country clubs** | Members sign for food and drink, which posts to their house account. **F&B minimums** add a shortfall charge | Members (consumers) | Member AR in the club management system (Jonas, Northstar, Clubessential) |
| **Hotels & resorts** | Room-charged F&B, banquets/events, and corporate direct-bill accounts move to the **city ledger** after checkout | Corporate clients, groups, event hosts, travel agencies | PMS city ledger (OPERA, Mews) |
| **Multi-location restaurant groups** | House accounts, catering and corporate orders, plus card **chargebacks** and processor settlement gaps | Corporate customers, card networks/processors | POS + accounting (Toast, etc.) |
| **Event / banquet venues** | Deposits, final balances, post-event incidentals | Event hosts, planners | Sales/catering system + accounting |

## Market size (directional)

| Metric | Value | Source | Confidence |
|---|---|---|---|
| US golf courses & country clubs revenue (2026) | ~$35.3bn | IBISWorld, Jul 2026 (includes public courses) | Medium |
| US golf courses & country clubs, number of businesses | ~8,645 | IBISWorld 2026 | Medium |
| US private clubs | ~5,659 | CMAA economic impact report (2023 data) | Medium |
| Revenue of private clubs >$1M (2023) | ~$32.6bn across 3,887 clubs | CMAA | Medium |
| F&B share of club revenue | "~74%" | Private-club marketing blog, unsourced | **Low: verify** |
| Clubs that subsidize F&B | "~55%" | Same blog | **Low** |
| Card processing fees paid by US merchants (2025) | >$198bn | National Restaurant Association filing | Medium |
| Average interchange | 2.35% (2025), up from 2.26% (2023) | Industry source | Medium |
| AR automation market | ~$5.8bn by 2029 (attributed to IDC) | Secondary blog | **Low: unverified** |
| AI-in-collections market | ~$4.2bn by 2028 (attributed to Forrester) | Secondary blog | **Low: unverified** |

**Rough TAM framing for a pitch:** ~5.7k US private clubs plus thousands of full-service hotels and multi-unit restaurant groups. Even at a few hundred dollars a month per location, Settle has a credible niche SaaS market before counting payment-volume revenue. Treat this as a hypothesis, not a sourced number.

## Macro trends that help Settle

1. **Finance talent shortage.** 61% of finance leaders report shortages of accounting talent (Corporate Finance & Accounting Talent Study 2026). That stretches close cycles and leaves collections under-worked.
2. **Hospitality understaffing.** More than half of hotels report being understaffed (AHLA).
3. **AI agents moving into back office.** AHLA/HTNG name RPA and AI agents as drivers of internal productivity in 2026. Mews expects autonomous finance workflows.
4. **Payment-cost pressure.** Interchange is rising and the swipe-fee settlement is contested. Operators are looking for cheaper rails: ACH (e.g. Driftwood + Flywire), and eventually stablecoins.
5. **Agentic payments infrastructure is arriving.** Visa and Mastercard agent programs, x402, and XRPL agentic transactions. See [../../resources/ONTOLOGY.md](../../resources/ONTOLOGY.md) on the `resources/hackathon-docs` branch.
6. **F&B minimums under board scrutiny.** Clubs are rethinking minimums ("kill, keep, or repackage"), which changes how shortfall balances are billed and collected.

## Sources
- [IBISWorld: Golf Courses & Country Clubs (US)](https://www.ibisworld.com/united-states/market-research-reports/golf-courses-country-clubs-industry/)
- [CMAA Economic Impact Report: executive summary](https://cmaa.org/media/01hnzs2i/economic-impact-report_executive-summary.pdf)
- [Private Club Marketing: F&B minimums explained 2026](https://privateclubmarketing.com/food-beverage-minimums-explained-2026/)
- [Private Club Marketing: summer F&B strategy](https://privateclubmarketing.com/summer-fb-strategy-outdoor-dining-profitable-program/)
- [National Restaurant Association: RI Senate testimony (2026)](https://www.rilegislature.gov/senators/SenateComDocs/2026%20Commerce/S2344%20National%20Restaurant%20Association.pdf)
- [Olo: what restaurants should know about credit card fees](https://www.olo.com/blog/what-restaurants-should-know-about-credit-card-fees)
- [Controllers Council: accounting talent shortage](https://controllerscouncil.org/is-the-accounting-talent-shortage-becoming-permanent/)
- [AHLA/HTNG T100 Top Technology Challenges 2026](https://www.ahla.com/sites/default/files/2026-03/AHLA-HTNG-T100-Top-Industry-Technology-Challenges.pdf)
- [Mews Trends Report 2026](https://mews.com/en/resources/research/trends-report-2026)
- [Lodging Magazine: Driftwood + Flywire ACH](https://lodgingmagazine.com/driftwood-hospitality-management-expands-partnership-with-flywire/)
- [StealthAgents: AI AR automation statistics 2026](https://stealthagents.com/research/ai-accounts-receivable-automation-statistics-2026)
