# Pain Points by Segment

What breaks today in getting hospitality paid for F&B, mapped to Settle's four capabilities: **Monitor · Forecast · Reconcile · Recover**.

## Private / country clubs

| Pain | Evidence | Settle capability |
|---|---|---|
| Charges fail to post correctly from F&B POS to member accounts. End-of-shift manual reconciliation | Northstar blog (vendor view) | Reconcile |
| Collections are labor-intensive. Clubs struggle with the time needed and with finding the right person | Club Solutions Magazine | Recover |
| Billing, reconciliation and collections follow-up are bundled into one coordinator role | Club billing-coordinator job postings | Monitor / Recover |
| F&B **minimum shortfalls** are billed as use-it-or-lose-it lump sums ($50/mo to thousands/yr), which frustrates members and leads to disputes | Private Club Marketing 2026 | Forecast (warn members before period end) |
| Past-due members are often caught only at check-in, if the system flags them | Club Solutions Magazine | Monitor |
| Delicate relationship: members are customers *and* owners, so heavy-handed collection hurts retention | Industry context | Recover (tone-aware outreach) |

## Hotels & resorts

| Pain | Evidence | Settle capability |
|---|---|---|
| F&B and banquet charges move to the **city ledger** after checkout and age there. One account executive owns billing *and* collections | Wikipedia city ledger; SetupMyHotel SOP | Monitor / Recover |
| Sales staff waive or relax deposits, and payment is later delayed | Hotel-Online finance column (illustrative case) | Forecast (risk-score accounts) |
| "Groups that refuse to pay are not as rare as you might think." Weak contract enforcement | Hotel Management | Recover |
| Chargebacks should be turned around within 48 hours. Unusual transfers between city-ledger accounts are a red flag | Hospitality Net AR controls | Reconcile (anomaly detection) |
| Deposits are tiered by lead time (25% / 50% / 100%). Tracking them manually across events is error-prone | Hotel group T&Cs | Monitor / Forecast |
| Bank-to-GL matching is still manual at many properties | HB / hospitality tech (AI smart matching) | Reconcile |

## Multi-location restaurant groups

| Pain | Evidence | Settle capability |
|---|---|---|
| Card fees are typically the **#3 expense** after food and labor | Olo | Recover (cheaper rails, e.g. ACH or stablecoin) |
| Chargebacks ≈ 1.6 bps of transactions / 6.5 bps of value. 70–80% end as merchant liability, and ~50% are fraud-coded | Kansas City Fed (2016, dated) | Reconcile / Recover |
| Total cost of a dispute is ~$3.75–4.61 per $1 disputed (retail estimate) | Chargeflow (vendor) | Recover |
| One location's chargeback ratio can put shared processing at risk for the whole group | Chargeflow | Monitor (per-location ratios) |
| House accounts and catering invoices are tracked in spreadsheets outside the POS | Industry context | Monitor |
| Processor deposits don't match POS sales because of batching, fees and tips | Industry context (no hard stat found) | Reconcile |

## Cross-cutting

1. **Fragmented systems.** POS, PMS, club system, processor and bank don't agree, and every location runs its own close.
2. **No forward view.** Operators see aging (30/60/90) but not *who is likely to pay late next month*.
3. **Collections is no one's full-time job.** The talent shortage means it gets deprioritized, and balances age into bad debt.
4. **Relationship risk.** Hospitality depends on repeat guests and members, so recovery must protect the relationship. This is Settle's positioning: *"a better way to get paid," not "chasing deadbeats."*
5. **Expensive, slow rails.** Card fees plus multi-day settlement on large balances (events, corporate accounts).

## Data gaps (to validate in customer interviews)
- DSO / aging benchmarks for clubs, hotel city ledgers, and restaurant house accounts. HFTP may have these.
- Hours per week spent on reconciliation per location.
- Bad-debt write-off rates for F&B specifically.
- Share of member balances >60 days.

## Sources
- [Northstar: F&B POS for private clubs](https://www.globalnorthstar.com/our-blogs/fb-pos-systems-for-private-clubs-what-sets-club-specific-solutions-apart)
- [Club Solutions Magazine: getting billing right](https://clubsolutionsmagazine.com/2020/03/getting-billing-right/)
- [Private Club Marketing: F&B minimums 2026](https://privateclubmarketing.com/food-beverage-minimums-explained-2026/)
- [iHire: membership billing coordinator](https://www.ihireaccounting.com/jobs/view/523878871)
- [City ledger (Wikipedia)](https://en.wikipedia.org/wiki/City_ledger)
- [SetupMyHotel: guest ledger & city ledger SOP](https://setupmyhotel.com/hotel-sop-standard-operating-procedures/finance-accounting-sop/sop-finance-and-accounting-guest-ledger-and-city-ledger/)
- [Hospitality Net: Top 10 AR controls](https://www.hospitalitynet.org/opinion/4122676.html)
- [Hotel-Online: Page Three of the Aging](https://www.hotel-online.com/news/hospitality-financial-leadership-page-three-of-the-aging)
- [Hotel Management: 10 ways to make sure your hotel gets paid](https://www.hotelmanagement.net/operate/10-ways-to-make-sure-your-hotel-gets-paid)
- [Conference Hotel Group: contractual T&Cs](https://www.conferencehotelgroup.com/img/hotels/files/1256/Contractual%20terms%20and%20conditions.pdf)
- [Hotel Business: AI for hotel accounting](https://hotelbusiness.com/hb-exclusive-unleashing-the-power-of-ai-for-hotel-accounting/)
- [Olo: credit card fees](https://www.olo.com/blog/what-restaurants-should-know-about-credit-card-fees)
- [Kansas City Fed: chargebacks working paper](https://www.kansascityfed.org/research/research-working-papers/chargebacks-payment-card-cost-merchants-2016/)
- [Chargeflow: retail chargebacks](https://www.chargeflow.io/es/blog/retail-chargebacks)
