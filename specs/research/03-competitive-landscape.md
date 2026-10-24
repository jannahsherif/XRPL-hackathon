# Competitive Landscape

Settle sits between **hospitality systems of record** (which hold the balances) and **horizontal AR/collections automation** (which isn't built for hospitality).

## 1. Systems of record (integrate with them; don't compete)

| Vendor | Segment | AR-relevant features | Notes |
|---|---|---|---|
| **Jonas Club Software** | Private clubs (dominant at high-end clubs) | Member AR, statements, minimums, dues billing, AR aging | Described as one of two dominant NA club platforms |
| **Clubessential** | Private clubs | Club management, billing | The other dominant platform. 4.3/5 on Capterra (~25 reviews) |
| **Northstar** | Private clubs | Split receivables, member minimums, profile billing, recurring dues | 4.0/5 on Capterra |
| **Oracle OPERA Cloud** (+ MICROS Simphony POS) | Hotels | Folios, city ledger | OHIP APIs (OAuth 2.0, sandbox, business events) |
| **Mews** | Hotels | F&B posts straight to the folio, open API | Positions itself against OPERA |
| **Toast** (and other restaurant POS) | Restaurants | Sales, house accounts, payouts | API not covered in this research |

**Implication:** these platforms *store* AR and produce aging reports. None of the sources show them acting proactively: forecasting late payers, reconciling across locations and processors, or running outreach. That is Settle's wedge.

## 2. Horizontal AR / collections automation

| Vendor | Focus | Gap for hospitality |
|---|---|---|
| **HighRadius** | Enterprise B2B invoice-to-cash, cash application, deductions | Enterprise-heavy, B2B-invoice centric, no member/folio model |
| **Tesorio** | Mid-market B2B AR + cash forecasting | B2B invoices. Not POS/PMS-native |
| **Upflow, Peakflo, etc.** | SMB/mid-market AR, AI voice and email agents | Generic. Vendor claims (DSO −15–25 days, collection cost −60–75%) are unverified |
| **Flywire** | Payments with ACH + e-signature guarantee (e.g. Driftwood Hospitality) | A payments rail, not an agent that reconciles and forecasts |

## 3. Adjacent: chargeback / dispute tools
Chargeflow, orders.co dispute automation, CMSPI (fee and dispute consulting). They cover the card-dispute slice only.

## Positioning map

```
                    Hospitality-native
                           ▲
     Jonas / Northstar /   │        ★ SETTLE
     Clubessential /       │   (multi-location, proactive,
     OPERA / Mews / Toast  │    forecast + reconcile + recover,
     (store AR, passive)   │    relationship-safe)
  Passive ─────────────────┼──────────────────▶ Proactive / agentic
                           │   HighRadius / Tesorio /
                           │   Upflow / Peakflo
                           │   (generic B2B AR agents)
                           ▼
                       Horizontal
```

## Settle's differentiation
1. **Hospitality data model.** Member house accounts, F&B minimums, folios and city ledger, banquet deposits, house accounts and catering.
2. **Multi-location roll-up.** One view across properties and systems (club + POS + PMS + processor + bank).
3. **Forecasting.** Not just 30/60/90 aging but a predicted likelihood and date of payment per account.
4. **Relationship-safe recovery.** Tone and timing tuned to members, guests and corporate clients, with nudges *before* minimum-period close.
5. **Cheaper settlement rails.** Pay links via ACH, card-on-file, or stablecoin (XRPL RLUSD) for large balances. See [06-opportunity-and-positioning.md](06-opportunity-and-positioning.md).

## Sources
- [Supergood: Jonas Club Software API report card](https://supergood.ai/api-report-card/jonas-club-software)
- [Jonas Club: club accounting](https://jonasclub.com/club-accounting)
- [Northstar: what is club accounting software](https://www.globalnorthstar.com/our-blogs/what-is-club-accounting-software-a-complete-guide-for-private-country-clubs)
- [Capterra: Northstar vs Clubessential](https://www.capterra.com/compare/87109-151992/Northstar-Club-Management-vs-Clubessential)
- [Oracle Hospitality Integration Platform](https://www.oracle.com/anz/hospitality/integration-platform/)
- [Mews vs OPERA Cloud](https://www.mews.com/en/compare/mews-vs-opera)
- [Moveo: best AI agents 2026](https://moveo.ai/blog/best-ai-agents)
- [Peakflo: AI voice agents for AR](https://peakflo.co/blog/ai-voice-agents-accounts-receivable-collection)
- [Lodging Magazine: Driftwood + Flywire](https://lodgingmagazine.com/driftwood-hospitality-management-expands-partnership-with-flywire/)
- [CMSPI: restaurant savings case study](https://cmspi.com/casestudy/harnessing-the-power-of-data-to-deliver-savings-in-restaurants/)
