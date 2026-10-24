# Compliance & Risk Notes

> **Not legal advice.** These are research notes to guide design decisions and questions for counsel. Verify against primary sources (12 CFR part 1006, the TCPA, state law) before launch.

## 1. Debt collection law: first-party vs third-party

- The **FDCPA** and the CFPB's **Regulation F** mainly regulate *third-party* debt collectors. A business collecting its own debts in its own name is generally outside the FDCPA. **However**, a creditor that collects under a *different name* can be treated as a debt collector, and many **state laws** (e.g. California's Rosenthal Act) cover first-party creditors too.
- **Design implication for Settle:** outreach should go out **in the operator's name and brand** (the club, hotel or restaurant), as the operator's own billing tool. Settle should not appear as a separate collection agency. This also fits the positioning: *"a better way for hospitality to get paid"* rather than *"collections."*
- Corporate and B2B balances (hotel city ledger, catering accounts) are generally outside consumer-debt rules. Member and guest balances are consumer accounts.

## 2. Communication rules worth adopting as defaults (Reg F best practice)

Even if they don't strictly apply, these make good product guardrails:

| Rule (Reg F, per secondary summaries) | Settle default |
|---|---|
| Email and text are permitted for collection communications | Email + SMS pay-link reminders |
| A clear opt-out in every electronic message (one-step unsubscribe; STOP for SMS) | Always included |
| No contact between 9pm and 8am in the recipient's local time | Send-window enforcement per recipient time zone |
| Call frequency cap: 7 calls per debt in 7 days | Cap on reminders per account per week |
| Reasonable procedures to reach the right person | Verified contact data from POS/PMS/club system only |

**SMS also triggers the TCPA**, which requires prior express consent for automated texts. Capture consent at member onboarding, booking or account setup.

## 3. Payments & data

- **PCI DSS:** never store PANs. Use processor tokenization or card-on-file tokens. Pay links should be hosted by the processor or rail.
- **Card-network rules:** chargeback-ratio thresholds apply per merchant ID. Monitor per location, since one location can put shared processing at risk.
- **Privacy:** member and guest PII and spend history. Disclose AI use, minimize data, and apply role-based access per location.
- **Stablecoin / XRPL rail (if used):** settlement in RLUSD or XRP raises KYC/AML, money-transmission and accounting questions. The cleanest model is the operator receiving funds directly into its own wallet or custodian, with Settle never holding funds (non-custodial).

## 4. AI-agent risks & mitigations

| Risk | Mitigation |
|---|---|
| The agent sends wrong-amount or duplicate reminders | Reconcile before recover: no outreach until the balance is matched against the POS/PMS and processor |
| Tone harms the relationship (e.g. a VIP member) | Per-segment tone policies; human approval for VIP or high-value accounts |
| Hallucinated policy or fees | Template + retrieval from the operator's actual T&Cs. No free-form fee statements |
| Over-automation of disputes | Escalate disputes to staff. The agent does not negotiate write-offs unless policy explicitly allows it |
| Agent payment misuse (agentic rails) | Hard spend caps, allowlisted payees, an audit trail (see AgentCore Policy, XRPL Delegation in the resources branch) |

## Sources
- [TSICO: Regulation F in 2026](https://tsico.com/?p=58472)
- [Sedric: CFPB Reg F 2026 operator's guide](https://www.sedric.ai/arm-resources/cfpb-reg-f-2026-operators-guide)
- [Experian: Reg F and digital communications](https://www.experian.com/blogs/data-quality/how-regulation-f-continues-to-shape-digital-debt-collection-communications/)
- [TCN: Regulation F guide](https://www.tcn.com/regulation-f-guide/)
- [Club Solutions Magazine: getting billing right (membership agreement and FDCPA note)](https://clubsolutionsmagazine.com/2020/03/getting-billing-right/)
