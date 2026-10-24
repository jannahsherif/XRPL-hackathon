# US Regulatory Landscape: Reg E, Blockchain & Agentic Finance

> **Not legal advice.** These are research notes compiled 2026-10-24 to frame design choices and questions for counsel. Several items are moving quickly; each one is tagged with its status and how confident we are in it.

Settle touches three regulatory zones:
1. **Collecting money owed**: covered in [04-compliance-and-risk.md](04-compliance-and-risk.md) (FDCPA, Reg F, TCPA).
2. **Moving money electronically**: Reg E, Nacha, card-network rules.
3. **Blockchain rails and AI agents**: GENIUS Act, FinCEN/BSA, OFAC, tax, accounting, and state AI laws.

---

## 1. Regulation E (Electronic Fund Transfer Act)

**What it is:** Reg E (12 CFR 1005) protects *consumers* making electronic fund transfers from accounts held at *financial institutions*. It covers debit cards, ACH, P2P, and potentially some digital wallets.

**Core protections:**
- **Unauthorized transfers:** consumer liability is capped at **$50** if reported within 2 business days, **$500** after that, and is unlimited for transfers more than 60 days after the statement is sent.
- **Error resolution:** the institution must investigate (typically 10 business days, extendable to 45/90 with provisional credit).
- **Anti-waiver:** liability can't be shifted to the consumer by contract.
- **"Unauthorized"** means initiated by someone *without actual authority*. Courts have read this narrowly.

**Does it apply to Settle?**

| Scenario | Reg E exposure |
|---|---|
| Member pays the operator by debit card or ACH via a processor | The **member's bank** carries Reg E duties. Settle and the operator are the payee. Expect disputes to arrive as returns or chargebacks, so Settle must reconcile them |
| **Settle stores credentials and initiates recurring ACH/debit pulls** | Preauthorized-transfer rules apply (written authorization, a copy to the consumer, the right to stop payment). Nacha rules also apply (below) |
| Settle holds consumer funds in a wallet/account | Settle could become a **"financial institution"** under Reg E. **Avoid: stay non-custodial** |
| **An AI agent initiates payment on a consumer's behalf** | **Unresolved.** It's unclear whether a payment made by an agent within preauthorized parameters has "actual authority." EFTA (1978) assumed a human authorizes each transfer. Commentators call this the main agentic liability gap |
| Stablecoin / XRPL payments | Reg E generally doesn't reach on-chain transfers from self-hosted wallets. The CFPB's **Jan 2025 proposed interpretive rule** sought to extend EFTA/Reg E to some digital payment providers, possibly including crypto. **Status: unconfirmed; verify** |

**Design rules for Settle:**
- Never custody consumer funds. The operator's processor or the payer's own wallet holds them.
- For any agent-initiated pull: get **explicit, scoped, revocable authorization** (amount cap, payee, frequency, expiry), keep the evidence, and provide stop-payment and revocation. This maps directly onto Mastercard's *Verifiable Intent* mandates and AgentCore payment-session limits.
- Use **human-in-the-loop confirmation** for consumer payments by default; the agent *proposes* and the member *approves* via a pay link.

---

## 2. Other money-movement rules

| Rule | Why it matters | Status / confidence |
|---|---|---|
| **Nacha Operating Rules** | ACH debits need proper authorization; WEB-debit account validation; **fraud-monitoring rules phasing in during 2026** for originators and ODFIs | Active; verify phase dates |
| **Card-network rules** (Visa/Mastercard) | Chargeback-ratio thresholds per MID, card-on-file and stored-credential rules, agentic token programs | Active |
| **PCI DSS v4.x** | Never store PANs; use tokenization | Active |
| **Reg Z / TILA** (Truth in Lending) | If a club **house account charges finance charges or is payable in >4 installments**, it may be open-end credit, which brings disclosure duties. Late fees and interest on member balances need review | Active; ask counsel how house accounts are structured |
| **UDAAP** (CFPA §1031 + state UDAP) | Misleading reminders, surprise fees, and aggressive tone can be unfair, deceptive or abusive. Applies to AI-written messages | Active |
| **CFPB §1033 open banking** | Relevant if Settle pulls bank data for reconciliation | Rule was being reconsidered; **status unconfirmed** |

---

## 3. Blockchain / stablecoin rules

### GENIUS Act (federal payment-stablecoin law, signed July 2025)
- Regulates **issuers** of payment stablecoins: reserves, redemption, capital, custody, AML.
- **OCC final rule issued 2026-10-21 (Bulletin 2026-50), effective 2027-01-18.** The FDIC, Fed, NCUA and Treasury (FinCEN/OFAC AML) rules are still in progress.
- **Impact on Settle:** Settle isn't an issuer. Operationally, prefer **GENIUS-compliant / regulated stablecoins** (e.g. RLUSD, issued under a NYDFS trust charter) for operator settlement. Note that the Act **does not address agent payments at all**.

### CLARITY Act (digital-asset market structure)
- Passed the House July 2025 (294–134). Senate Banking advanced its version May 2026 (15–9). Floor cloture was reportedly scheduled for Sept 2026. **Current status unconfirmed.**
- Mostly concerns SEC/CFTC jurisdiction over tokens, so it has low direct impact on Settle if Settle only uses stablecoins and XRP as a payment rail.

### FinCEN / Bank Secrecy Act (money transmission)
- FinCEN 2019 CVC guidance (FIN-2019-G001): **hosted/custodial wallet providers are generally MSBs** (money transmitters), **unhosted wallet software providers generally are not**, and **users** (e.g. a merchant accepting crypto for its own goods) are not MSBs.
- **Impact:** if Settle receives payer funds and forwards them to operators, it is likely a **money transmitter** (FinCEN MSB registration plus **state money-transmitter licenses**, and **NY BitLicense** for NY). **Design: payments go directly payer → operator wallet; Settle only generates the invoice and pay link and reconciles.**

### OFAC sanctions
- Applies to everyone, on-chain included. Screen payer wallet addresses (blockchain analytics) before accepting or crediting, especially for open XRPL payments. This was not covered in detail by the search; consult OFAC's virtual-currency guidance.

### Tax
- **Form 1099-DA**: broker reporting of digital-asset sales began with 2025. 2026 instructions add de minimis rules (e.g. qualifying **stablecoin sales ≤ $10,000** and **payment-processor (PDAP) sales ≤ $600** need not be reported). Relevant if Settle or a partner acts as a processor of digital-asset payments.
- **Form 8300**: digital assets were added to "cash" for the $10,000+ reporting rule, but the **IRS says businesses don't need to include digital assets until regulations are issued**. **Status unconfirmed for 2026.** Large event or corporate balances paid in stablecoin could trigger this later.
- Receiving XRP (a non-stablecoin) has income/basis implications for operators; RLUSD minimizes that.

### Accounting
- **ASU 2023-08** (effective for fiscal years beginning after 2024-12-15): in-scope crypto is measured at **fair value through earnings**. Fiat-backed stablecoins are **likely out of scope** (redeemable claim), and whether they count as **cash equivalents is debated**. For operators: auto-convert or hold RLUSD and document the policy; XRP held would be fair-valued.

---

## 4. Agentic AI rules

| Item | What it says | Status |
|---|---|---|
| **No dedicated US agentic-payments framework** | Authorization, consent and liability for autonomous agents aren't defined in Reg E, the GENIUS Act or elsewhere | Gap (as of Oct 2026) |
| **Fed/OCC/FDIC revised model-risk guidance (Apr 2026)** | Reportedly *excludes* generative/agentic AI from its scope as "novel and rapidly evolving" | Secondary source; verify |
| **Colorado AI Act** | Originally covered high-risk AI in consequential decisions (incl. financial services). Replacement law (SB 26-189, signed May 2026 per one source) narrows it to disclosure/transparency, **effective 2027-01-01**. Enforcement of the original law was stayed amid xAI litigation | In flux |
| **California CPPA ADMT regulations** (automated decision-making under the CCPA) | Notice, opt-out and risk-assessment duties for significant automated decisions | Not covered by search; verify |
| **ECOA / Reg B** | If Settle's risk scores were used to **deny or limit credit** (e.g. suspend a member's charging privileges), adverse-action and fair-lending rules may apply | Design: keep scores as *collection prioritization*, not credit decisions, or treat them as credit decisions with explanations |
| **FTC Act §5** | Deceptive AI claims; unfair data practices | Active |
| **Card-network agent programs** | Mastercard Agent Pay (KYA, agentic tokens, Verifiable Intent) and Visa Intelligent Commerce set *private* rules for agent transactions | Active; see resources branch |

---

## 5. Settle compliance-by-design checklist

- [ ] **Non-custodial:** Settle never holds operator or payer funds (avoids MSB, money-transmitter, Reg E FI status)
- [ ] Outreach in the **operator's name** (first-party collection posture; see file 04)
- [ ] **Human confirms payment** by default; agent-initiated pulls only under a scoped, revocable, logged mandate (Reg E, Nacha, Verifiable Intent)
- [ ] TCPA consent + Reg F-style contact windows and opt-outs
- [ ] PCI: tokenized card-on-file only
- [ ] Stablecoin rail: regulated stablecoin (RLUSD), **OFAC wallet screening**, direct payer→operator settlement, Destination Tag/Memo for reconciliation
- [ ] Track the $10k threshold for future Form 8300 digital-asset reporting
- [ ] Risk scores used for prioritization only; document them. If used to restrict charging privileges, apply ECOA/Reg B adverse-action logic
- [ ] AI disclosure in member communications (Colorado/California trend)
- [ ] Audit log of every agent action (supports disputes, Reg E error resolution, UDAAP defense)

## Open questions for counsel
1. Are club house accounts "credit" under Reg Z if late fees or interest apply?
2. Is Settle a "debt collector" under any state law if it sends messages in the operator's name?
3. Status of the CFPB's 2025 digital-payments interpretive rule and §1033.
4. Exact FinCEN/state treatment if Settle offers an optional *hosted* settlement or conversion service.
5. Form 8300 digital-asset regulations: issued yet?

## Sources
- [Winston & Strawn: Understanding Reg E, a primer](https://www.winston.com/en/blogs-and-podcasts/the-reg-e-reader/understanding-reg-e-a-primer)
- [JD Supra: Regulation E topics](https://www.jdsupra.com/topics/regulation-e/payment-systems/)
- [Payments Dive: CFPB digital payments interpretive rule proposal](https://www.paymentsdive.com/news/cfpb-chopra-digital-payments-interpretive-rule-proposal/737929)
- [Prove: CFPB Reg E update](https://www.prove.com/blog/cfpb-regulation-e-update-onus-on-banks-for-better-fraud-prevention)
- [The American Prospect: Reg E and scams](https://prospect.org/power/smallest-regulations-make-big-difference-cfpb-banks-financial-scams/)
- [OCC Bulletin 2026-50: GENIUS Act final rule](https://occ.gov/news-issuances/bulletins/2026/bulletin-2026-50.html)
- [The Block: OCC first to finalize GENIUS rule](https://theblock.co/news/regulation/2026-10-21-occ-final-rule-implementing-trump-signed-genius-act-421470)
- [Decrypt: OCC finalizes GENIUS Act rules](https://decrypt.co/381502/occ-finalizes-genius-act-stablecoin-rules-ahead-of-january-deadline)
- [Chapman: GENIUS Act rulemaking tracker](https://www.chapman.com/assets/htmldocuments/Chapman-GENIUS-Act-Rulemaking-and-Reporting-Tracker-060526.pdf)
- [Forkast: agent payments don't exist in the law](https://forkast.news/the-genius-act-deadline-is-8-days-away-the-fed-still-hasnt-published-its-rules-and-agent-payments-dont-exist-in-the-law/)
- [Tech Insider: CLARITY Act status (Aug 2026)](https://tech-insider.org/clarity-act-2026-status/)
- [Mugglehead: CLARITY cloture filing](https://mugglehead.com/?p=1446776)
- [Jones Day: FinCEN consolidates CVC guidance](https://www.jonesday.com/en/insights/2019/06/fincen-consolidates-guidance)
- [Debevoise: applying the BSA framework to CVC](https://www.debevoise.com/insights/publications/2019/05/applying-the-bank-secrecy-act-framework)
- [Seward & Kissel: digital assets and Form 8300](https://skrypto.sewkis.com/insights/irs-says-digital-assets-are-not-yet-subject-to-cash-reporting-obligations/)
- [Sovos: 2026 Form 1099-DA instructions](https://sovos.com/regulatory-updates/trr/irs-releases-2026-form-1099-da-instructions/)
- [Crowe: FASB crypto fair value guidance](https://www.crowe.com/insights/take-into-account/fasb-to-finalize-fair-value-guidance-for-crypto-assets)
- [Deloitte: ASU 2023-08 FAQ](https://dart.deloitte.com/USDART/home/publications/deloitte/heads-up/2024/faq-fasb-crypto-assets-standard-asu-2023-08)
- [Bloomberg Law: crypto's rules are here, 2026](https://news.bloomberglaw.com/crypto/cryptos-rules-are-here-2026-will-be-about-making-them-work)
- [Proskauer: Colorado AI law on ice](https://www.proskauer.com/blog/major-developments-put-colorados-ai-law-on-ice-ahead-of-implementation)
- [Hunton: Colorado AI Act amended and delayed](https://www.hunton.com/privacy-and-cybersecurity-law-blog/colorado-ai-act-amended-and-effective-date-delayed)
- [Clifford Chance: agentic payments roundtable (Aug 2026)](https://www.cliffordchance.com/content/dam/cliffordchance/briefings/2026/08/roundtable-on-agentic-payments-and-the-emerging-regulatory-landscape.pdf)
- [Freshfields: agentic AI in the payments chain](https://www.freshfields.com/ja/our-thinking/briefings/2026/05/agentic-ai-in-the-payments-chain-regulatory-challenges-for-financial-institutions)
- [Backbase: agentic payments liability gap](https://www.backbase.com/insights/agentic-payments-and-the-liability-gap-regulators-havent-closed)
