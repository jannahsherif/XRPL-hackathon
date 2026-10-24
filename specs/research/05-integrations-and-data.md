# Integrations & Data Model

Settle is only as good as the balances it can see. This file lists where the data lives and the minimum data model.

## Source systems

| Category | Systems | Data Settle needs | Access (as researched) |
|---|---|---|---|
| Club management | Jonas, Clubessential, Northstar | Member accounts, charges, minimums, statements, AR aging | Vendor APIs or partner programs. Expect CSV/SFTP exports as a fallback |
| Hotel PMS | Oracle OPERA Cloud, Mews | Folios, city ledger accounts, deposits, payments | **OHIP**: OAuth 2.0, sandbox, business events, specs on GitHub. **Mews**: open API, F&B posts to the folio |
| F&B POS | MICROS Simphony, Toast, club POS | Checks, tenders, house-account charges, tips, voids | POS APIs (not verified in this research) |
| Payment processor | Stripe, Adyen, Fiserv, Flywire… | Settlements, fees, chargebacks, payouts | Processor APIs and webhooks |
| Bank | Operating accounts | Deposits for matching | Open banking (Plaid, Mastercard Open Finance) or BAI2/CSV |
| Accounting / GL | QuickBooks, Sage Intacct, NetSuite | AR control accounts, write-offs | Accounting APIs |
| Sales & catering | Delphi, Tripleseat, PMS S&C | Event contracts, deposit schedules | APIs or exports |

**Hackathon MVP:** use **synthetic CSV data** shaped like these sources (3 locations × POS + PMS/club + processor + bank) rather than live integrations.

## Core data model (draft)

```
Location ── has many ──▶ Account (member | guest folio | corporate/city ledger | house account | event)
Account  ── has many ──▶ Charge (date, amount, outlet, source_system, source_id, category=F&B/minimum/banquet)
Account  ── has many ──▶ Payment (date, amount, rail=card|ACH|cash|stablecoin, processor_ref, fees)
Charge  ◀── matched by ──▶ Payment / Settlement / BankDeposit   (Reconciliation record + confidence)
Account  ── has ──▶ RiskScore (p_late, expected_pay_date, drivers)
Account  ── has many ──▶ Outreach (channel, template, sent_at, outcome, consent_ref)
Dispute / Chargeback ── links ──▶ Charge, Payment
```

## Key derived metrics
- Outstanding balance by location / segment / age bucket (0–30, 31–60, 61–90, 90+)
- **DSO** per location and segment
- Forecasted cash-in (next 7/30 days) and at-risk balance
- Reconciliation match rate and unmatched exceptions
- Chargeback ratio per merchant ID / location
- Recovery rate and time-to-pay after outreach
- Effective payment cost by rail (card vs ACH vs stablecoin)

## Sources
- [Oracle Hospitality Integration Platform](https://www.oracle.com/anz/hospitality/integration-platform/)
- [Supergood: Oracle Hospitality API report card](https://supergood.ai/api-report-card/oracle-hospitality)
- [Supergood: Jonas Club Software API report card](https://supergood.ai/api-report-card/jonas-club-software)
- [Mews vs OPERA Cloud](https://www.mews.com/en/compare/mews-vs-opera)
- [Innspire: OPERA / Mews integrations](https://innspire.com/integrations/oracle-opera)
