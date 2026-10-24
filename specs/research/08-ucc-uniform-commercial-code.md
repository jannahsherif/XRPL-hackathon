# UCC & Commercial Law: What Attaches to Settle

> **Not legal advice.** These are research notes compiled 2026-10-24. The UCC is **state law**: each state enacts its own version, sometimes with non-uniform changes. Confirm the governing state (usually the operator's) with counsel.

The UCC governs the *commercial* side of what Settle does: the sale of F&B (Art. 2), checks (Art. 3/4), commercial bank transfers (Art. 4A), receivables as property (Art. 9), and digital assets like XRP and RLUSD (Art. 12, from the 2022 amendments). Consumer EFTs fall under Reg E instead (see [07](07-us-regulatory-landscape-blockchain-agentic.md)); Article 4A expressly excludes transfers governed by the EFTA.

## Article-by-article map

| UCC Article | Covers | How it touches Settle |
|---|---|---|
| **Art. 1** (General; 2022 amendments) | Definitions, good faith; 2022 update replaces "writing" with "record" and modernizes "sign" | Electronic statements, pay links and authorizations can satisfy UCC record/signature requirements |
| **Art. 2** (Sale of goods) | Food and drink served for value is generally a **sale of goods** (implied warranty of merchantability covers food). Seller's **action for the price** (§2-709). **4-year statute of limitations** (§2-725) | The legal basis for an unpaid F&B balance. **Recovery must respect limitation periods:** Settle should flag balances approaching the SOL (state "open account"/account-stated SOLs may also apply) and never threaten action on time-barred debt (also a UDAP/FDCPA issue) |
| **Art. 2 (2022): hybrid transactions** | Mixed goods + services (e.g. banquet = food + venue + staff) are classified by the predominant purpose | Event/banquet balances may be partly services, so the applicable law and SOL can differ |
| **Art. 3** (Negotiable instruments) | Checks | Member and corporate checks; bounced-check rights; "**payment in full**" checks (§3-311 accord and satisfaction). Settle should flag partial payments marked "paid in full" before staff deposit them |
| **Art. 4** (Bank deposits & collections) | Check collection, returns, midnight deadline | Reconciling returned checks and deposit timing |
| **Art. 4A** (Funds transfers) | **Commercial** wires and commercial ACH; loss allocation turns on the **commercially reasonable security procedure** agreed between customer and bank | B2B: hotel city-ledger and corporate accounts paid by wire/ACH. **Agentic angle:** if a corporate client's *AI agent* initiates a wire, Article 4A loss allocation depends on whether the order passed the agreed security procedure, not on whether a human approved it. Agent credentials must sit inside the bank's security procedure. Also beware **business email compromise** (fake "updated remittance details"): Settle should never change payee bank details by email |
| **Art. 9** (Secured transactions) | Security interests in, and **sales of**, accounts, payment intangibles and chattel paper. Covers **factoring** and AR financing | (1) Operators' lenders often hold a **blanket lien on receivables**, so Settle's recovery proceeds are collateral and loan covenants may require AR reporting. (2) A future Settle **AR financing / early-payout** product = buying accounts, which is an Art. 9 sale (file UCC-1, perfection, priority). (3) **Notification of assignment (§9-406):** once notified, the account debtor must pay the assignee. Pay links must route to the correct party |
| **Art. 9 (2022): controllable accounts / controllable payment intangibles** | Receivables **evidenced by a controllable electronic record** can be perfected **by control** and take priority over filing | If Settle **tokenizes receivables** on-chain (e.g. an XRPL MPT or record representing a member/corporate balance), Art. 9 + Art. 12 govern who owns and has priority in it. That enables on-chain receivables financing |
| **Art. 12** (Controllable electronic records, 2022) | New property type for digital assets: **CERs** (crypto, stablecoins in some cases, tokenized records). **"Control"** (the power to use the asset's benefit, the exclusive power to prevent others from using it or to transfer control, and the ability to identify oneself) works like possession. A **qualifying purchaser** (value, good faith, no notice) takes **free of competing property claims** | XRP and RLUSD on XRPL are likely CERs. **The wallet key-holder has control.** An operator receiving RLUSD gets clean title as a qualifying purchaser. **Agent wallets:** whoever controls the keys (operator, agent platform, custodian) is the legal controller, so design key custody deliberately. Art. 12 **does not** decide securities/commodities status, money transmission or AML |
| **Art. 9 (2022): money / electronic money** | "Money" now excludes pre-existing crypto. A **central-bank digital currency** would be "electronic money," perfected by control | Stablecoins are generally *not* "money" under the UCC, so treat them as CERs, not cash, in liens and accounting |

## State adoption
- The ALI and ULC approved the 2022 amendments (Arts. 1, 2, 9, 12, and others). States enact them individually, sometimes non-uniformly.
- **New York adopted** the 2022 amendments in 2026 (per a June 2026 law-firm alert; verify). This matters because so much commercial law is governed by NY law.
- Many states have adopted; others haven't. Use the **Loeb & Loeb state tracker** or the ULC enactment page for the current list. Where Art. 12 hasn't been enacted, digital-asset transfer and priority fall back to old Art. 9 "general intangible" rules (less certain).

## Related non-UCC commercial law
| Law | Relevance |
|---|---|
| **UETA §14 / E-SIGN** | Contracts formed by **electronic agents** are enforceable when the agent's actions are **attributable** to the person bound. That supports agent-accepted payment terms and agent-initiated B2B payments. UETA/E-SIGN cover *formation*, not liability for erroneous agent orders. **New York** uses its own ESRA instead of UETA |
| **Agency law** (Restatement) | Whether an AI agent's acts bind its principal (apparent authority, ratification) is unsettled. Keep explicit, scoped mandates |
| **State SOLs for open accounts / account stated** | Govern how long unpaid house-account balances are collectible |

## Design implications for Settle
1. **Track statute of limitations** per balance and state. Suppress any messaging that implies legal action on time-barred balances.
2. **Detect "paid in full" partial payments** (Art. 3-311) and route them to staff before deposit.
3. **Respect Art. 9 lender liens and notices of assignment.** Make the payee configurable per account; never redirect payments silently.
4. **B2B wires/ACH:** support the bank's **security procedures**. Remittance-detail changes require out-of-band verification (BEC defense; Art. 4A loss allocation).
5. **Key custody = legal control (Art. 12).** Operator-controlled XRPL wallets (or a qualified custodian); Settle stays non-custodial.
6. **Future product: tokenized receivables.** Art. 9 controllable accounts + Art. 12 control enable on-chain AR financing for hospitality operators (a possible "Settle Advance").
7. **Agent actions must be attributable** (UETA/E-SIGN): log the mandate, scope and approver for every agent action.

## Sources
- [Wolters Kluwer: UCC amended to address emerging technologies (Jan 2026)](https://www.wolterskluwer.com/es/expert-insights/uniform-commercial-code-ucc-amended-to-address-emerging-technologies)
- [KJK: New York adopts 2022 UCC amendments (Jun 2026)](https://kjk.com/2026/06/18/new-york-adopts-2022-ucc-amendments-what-you-need-to-know/)
- [Loeb & Loeb: UCC 2022 amendments state adoption tracker](https://datawrapper.dwcdn.net/uPWMA/2)
- [Lexplug: UCC Article 4A outline](https://www.lexplug.com/outlines/payment-systems-ucc-3-4-4a/wholesale-funds-transfers-ucc-article-4a)
- [Delaware Code: Article 4A (security procedure; EFTA exclusion)](https://legis.delaware.gov/SessionLaws/Chapter?id=21772)
- [Washington State SB 5077 bill report (2022 UCC amendments)](https://lawfilesext.leg.wa.gov/biennium/2023-24/Htm/Bill%20Reports/House/5077-S%20HBR%20CRJ%2023.htm)
- [Promise Legal: agency law, e-signatures and AI agents](https://blog.promise.legal/startup-central/copilot-committed-ad-ai-agent-liability-agency-law/)
- [Miles Mediation: E-Sign and UETA](https://milesmediation.com/blog/20555/)
- [Stellagent: legal liability in AI agent purchasing](https://stellagent.ai/insights/agentic-commerce-legal-liability)
- [American Legal Blogger: E-SIGN and UETA in electronic contracting (May 2026)](https://www.americanlegalblogger.com/2026/05/point-of-sale-finance-series-getting-e-sign-and-ueta-right-in-electronic-contracting/)
