# Developer Playbook on Preparing for Agentic Commerce
source: https://developer.mastercard.com/merchant-cloud/documentation/tutorials-and-guides/agentic-commerce-guide/index.md

## About This Guide {#about-this-guide}

This guide helps **merchants, developers, and technical integrators** understand the agentic commerce landscape and take actionable steps to prepare their systems for AI-driven shopping experiences.

### Terminology Used in This Guide {#terminology-used-in-this-guide}

|         Term         |                              Definition                              |
|----------------------|----------------------------------------------------------------------|
| **Merchant**         | The business selling goods or services                               |
| **Agent**            | An AI system acting on behalf of a consumer                          |
| **Consumer**         | The end customer who authorizes the agent                            |
| **Agentic commerce** | Commerce mediated or executed by an agent                            |
| **Readiness levels** | Level 1 (Enable), Level 2 (Optimize), Level 3 (Direct agent systems) |

### Scope and Applicability {#scope-and-applicability}

This document addresses the **current landscape of agentic commerce** as it exists today. The guidance falls into two categories:

|        Category        |                                                                  Description                                                                  |                                                     Examples                                                      |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| **Broadly Applicable** | Technical concepts and best practices that apply regardless of payment scheme. Based on current agent implementations and observed behavior.  | Structuring product pages for agent visibility, optimizing checkout flows, semantic HTML practices                |
| **Scheme-Specific**    | Implementation details based on publicly available information from payment networks. Subject to change as schemes release detailed guidance. | Payment credential verification via Web Bot Auth, cryptographic header validation, agent identification protocols |

### Payment Scheme Context {#payment-scheme-context}

Three major payment networks have announced frameworks to support agentic commerce:

* **Mastercard** : Introduced Mastercard [Agent Pay](https://www.mastercard.com/global/en/business/artificial-intelligence/mastercard-agent-pay.html) for secure agentic transactions.
* **Visa** : Announced [Visa Intelligent Commerce](https://developer.visa.com/capabilities/visa-intelligent-commerce/overview) including the [Trusted Agent Protocol](https://developer.visa.com/capabilities/trusted-agent-protocol/overview) (TAP) for AI-powered payment experiences and cryptographic agent verification.
* **American Express** : Launched [Agentic Commerce Experiences (ACE)](https://www.americanexpress.com/en-us/company/agentic-commerce/) Developer Kit with Agent Purchase Protection™, enabling registered AI agents to transact securely on behalf of cardholders.

The scheme-specific instructions in this guide reflect **currently available public information** and may evolve as these networks release more detailed technical specifications. Monitor official scheme documentation for the latest implementation requirements.
Note: Non-scheme technical guidance - such as making your product pages visible to agents - is based on current agent behavior and implementations observed across platforms like ChatGPT's agent mode, Anthropic's computer use, and agentic browsers like Atlas and Comet.

## The Shift to Machine-Readable Commerce {#the-shift-to-machine-readable-commerce}

AI agents are becoming the primary interface for product discovery and commerce. Google's Shopping Agent within Gemini, ChatGPT's native shopping experience, and agentic browsers like Atlas and Comet are transforming how consumers find and purchase products online. Your website must now communicate effectively with machines, not just humans. This guide shows you how to prepare your systems for this shift.

### From Web Pages to Machine-Readable Experiences {#from-web-pages-to-machine-readable-experiences}

Traditional digital optimization focuses on user experience, search engine optimization, and conversion rates for human visitors. AI agents operate differently. They query structured data, consume APIs, and interpret semantic layers to fulfill user requests as quickly as possible.

This shift moves the competition from search rankings to data accessibility and trust. Agents select which brands to recommend based on the quality, structure, and reliability of accessible data. Your goal is to structure and activate data that represents your brand accurately when agents make decisions on behalf of consumers.

## Types of Agentic Commerce {#types-of-agentic-commerce}

Three primary categories of agentic commerce are emerging:

* **Agentic Platforms**: Consumers discover products and complete purchases within AI agent platform interfaces. Agents can surface products from major retailers and complete end-to-end purchases via the Universal Commerce Protocol (UCP) and the Agentic Commerce Protocol (ACP). The key is that merchants integrate with agents to reach consumers where they chat.
* **Agentic Browsers**: Specialized browsers like Atlas (OpenAI) and Comet (Perplexity) navigate websites autonomously, handling product discovery and checkout flows on behalf of users.
* **Consumer-Owned Agents**: Open-source and personal AI agents that run on the consumer's own device and navigate merchant websites autonomously. Examples include OpenClaw (the most widely adopted, with millions of users and deep shopping automation via its ClawHub skill marketplace), Claude Code and Claude Cowork (Anthropic's code-focused and desktop-workspace agents), Agent Zero (MIT-licensed autonomous framework with full browser, shell, and code execution), and Hermes Agent (Nous Research's self-improving agent with persistent memory and a learned skill system). These agents interact with your site using browser automation, accessibility-tree parsing, screen scraping, or by writing and executing code. They represent real consumers with genuine purchase intent, but they operate outside payment network trust programs --- making them a significant and growing traffic source that merchants must plan for.

All of the above agentic experiences support different interaction models. Some product categories, such as repeat purchases or low-value items, benefit from full automation. Others, like high-consideration purchases, work better with human-agent collaboration where the agent assists discovery, but the human verifies and confirms.

## Synchronous and Asynchronous Commerce {#synchronous-and-asynchronous-commerce}

Agents support two commerce patterns based on timing and user involvement:

### Synchronous (Real-time) Commerce {#synchronous-real-time-commerce}

The consumer shops with agent assistance in real time. They select products displayed in the agent's interface, whether on web, mobile app, or chat and voice channels, and complete the purchase within that session. The consumer provides confirmation immediately before checkout.

### Asynchronous (Deferred) Commerce {#asynchronous-deferred-commerce}

The consumer instructs the agent to monitor for specific conditions: a price drop, an item returning to stock, or a limited-release product becoming available. The agent watches data sources and notifies the consumer when conditions are met. Currently, the consumer must return to complete the purchase. Future implementations may allow agents to complete checkout autonomously within consumer-defined constraints.

## Autonomous Agentic Commerce {#autonomous-agentic-commerce}

Autonomous agentic commerce represents the next evolution, where agents complete purchases based on prior instructions without requiring secondary confirmation. Consider these examples:

* A consumer works with an agent to create a nutrition plan. The agent generates weekly recipes and meal preparation guides, then purchases groceries for automatic delivery. The consumer and agent agree on a budget and adjust plans during regular check-ins.
* A consumer's favorite artist announces a concert tour with tickets releasing at 10 AM. The consumer will be unavailable at that time, so they instruct the agent to purchase tickets when they go live. The agent confirms budget limits, preferred ticket merchants, and seating preferences before acting.

## Readiness Levels Overview {#readiness-levels-overview}

Prepare for agentic commerce incrementally across three levels:

|                       Level                       |                                                                                                                         AI Agent Platforms                                                                                                                          |                                                                                                         Agentic Browsers                                                                                                          |
|---------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Level 1: Enable your existing site for agents** | AI agents visit your website like a human would. They read pages and complete checkout. Ensure clear information, simple processes, remove barriers blocking legitimate AI traffic, and add basic accessibility labels so agents can identify interactive elements. | Agentic browsers navigate your site more intelligently than traditional automation. They understand page structure better but still require well-organized, consistent site architecture with semantic HTML and labeled elements. |
| **Level 2: Optimize your site for agents**        | Add structured product information and simplify checkout. Create streamlined paths for AI shoppers with advanced ARIA attributes, agent-optimized flows, and richer page structure to increase completed purchases.                                                 | Enhance page structure with advanced state attributes and dedicated agent checkout flows. Simplified AI-optimized flows reduce errors and improve success rates for both AI and human customers.                                  |
| **Level 3: Build dedicated agent systems**        | AI agents connect directly to your systems through standardized protocols like UCP and ACP. Early adopters are integrating currently. Standards continue to evolve --- focus on Levels 1 and 2 for broadest immediate impact.                                       | Agentic browsers use emerging standards to interact with your specialized AI systems. Traditional webpage rendering becomes optional. Focus on Levels 1 and 2 today.                                                              |

## Getting Started: Practical Recommendations {#getting-started-practical-recommendations}

Take an evolutionary approach to agentic commerce:

1. **Start small**: The landscape is maturing rapidly. Begin with incremental changes rather than complete overhauls.
2. **Enable core flows first**: Unlock basic agentic commerce by ensuring agents can complete your existing checkout process.
3. **Optimize iteratively**: Once enabled, rethink and optimize your channels and business model for AI interactions.
4. **Follow consumer behavior**: Monitor which agent platforms your customers use. This data informs which agents visit your site and which flows need optimization first.
5. **Prepare for all agent types** : Your site will receive traffic from both certified agents (verified through payment network programs) and consumer-owned agents (built on open-source frameworks like OpenClaw, Agent Zero, or Hermes Agent). Consumer-owned agents represent real customers with genuine purchase intent --- do not block them. Design a tiered trust strategy: streamlined flows for certified agents, standard checkout friction for unverified agents, and rate limiting for suspicious traffic. See the **Consumer-Owned Agents and Untrusted Traffic** section below for detailed guidance.

Note: The legal landscape around agentic commerce is evolving. In March 2026, a federal court ruled in Amazon v. Perplexity that user consent does not equal platform authorization --- merchants retain the right to control which AI agents access their systems. Monitor legal developments as they may affect your agent access policies.

## Consumer-Owned Agents and Untrusted Traffic {#consumer-owned-agents-and-untrusted-traffic}

### The Rise of Consumer-Owned Agents {#the-rise-of-consumer-owned-agents}

A new category of AI agent is driving a significant share of agentic traffic to merchant websites: **consumer-owned agents**. Unlike platform agents (ChatGPT, Gemini) or agentic browsers (Atlas, Comet), these agents are installed and operated directly by consumers on their own devices. They are typically open-source, privacy-focused, and run locally --- giving the consumer full control over their data and behavior.

The adoption curve is steep. OpenClaw, the most widely used consumer agent, has a large and growing global user base --- adoption accelerated significantly in Asia after Baidu integrated it into consumer search apps with broad reach. Agent Zero has emerged as a popular open-source autonomous agent framework, and Hermes Agent (Nous Research) gained rapid traction shortly after release.

These agents are not experiments --- they are mainstream consumer tools.

### Purchase Intent from Untrusted Agents {#purchase-intent-from-untrusted-agents}

The critical distinction for merchants: consumer-owned agents represent real customers with genuine purchase intent. A consumer running OpenClaw to find a birthday gift for their partner, or using Hermes Agent to restock household supplies, is a legitimate buyer --- even though their agent carries no payment network credentials or platform identity.

This creates both opportunity and risk:

#### The Opportunity {#the-opportunity}

* Consumer-owned agents represent a rapidly growing traffic channel --- and these visitors are primed to buy
* Agents that successfully complete purchases on your site will return repeatedly, creating loyal automated customers
* Early merchant support for consumer agents builds competitive advantage as this channel scales

#### The Risk {#the-risk}

* No identity verification means you cannot distinguish a legitimate consumer's agent from a malicious actor using the same framework
* Consumer agents may inadvertently trigger fraud detection systems designed for traditional bot traffic
* Agents operating without scheme-level trust (no Mastercard Agent Pay, Visa TAP, or Amex ACE credentials) lack the dispute resolution and purchase protection that certified agents provide
* Scalping, inventory manipulation, and competitive intelligence scraping can use the same open-source tools

### Merchant Strategy: Handling Untrusted Agent Traffic {#merchant-strategy-handling-untrusted-agent-traffic}

The worst response to consumer-owned agents is to block them indiscriminately. That is the equivalent of blocking mobile browsers in 2010 --- you lose real customers to competitors who adapted faster. Instead, apply a tiered trust strategy:

#### 1. Allow browsing and discovery freely {#1-allow-browsing-and-discovery-freely}

Product pages, search, and category browsing should be open to all agents. This is where purchase intent forms. Blocking agents at the discovery stage means they never recommend your products.

#### 2. Apply progressive friction at checkout {#2-apply-progressive-friction-at-checkout}

For agents that cannot present scheme credentials (Web Bot Auth signatures, Mastercard Agent Pay headers, Visa TAP tokens), add proportional verification. Different measures are appropriate based on the risk profile of the transaction:

* Apply rate limiting to prevent abuse while allowing legitimate agents to shop
* Require user to sign into an account to complete checkout, allowing you to link the agent session to a known consumer identity
* Require email verification or SMS confirmation for new agent sessions
* Apply standard 3-D Secure authentication for payment
* Set purchase limits for unverified agent sessions
* Use address verification and CVV checks as you would for any card-not-present transaction

#### 3. Use Web Bot Auth for differentiation {#3-use-web-bot-auth-for-differentiation}

Agents that support Web Bot Auth can cryptographically identify themselves, even if they do not carry payment scheme credentials. This lets you distinguish self-identified agents from completely anonymous traffic. See the Web Bot Auth section in Level 1 for implementation details.

#### 4. Monitor and learn {#4-monitor-and-learn}

Track agent traffic patterns as a distinct analytics channel:

* Which consumer agents visit most frequently?
* What is their conversion rate compared to human visitors and platform agents?
* Which products do agents browse versus purchase?
* Where in your checkout flow do agents fail?

This data informs your optimization strategy and helps you understand this new customer channel.

### The Trust Spectrum {#the-trust-spectrum}

Not all agents carry the same level of risk. Design your strategy around a trust spectrum:

|             Trust Level              |                                     Examples                                      |                                          Characteristics                                           |                             Recommended Handling                              |
|--------------------------------------|-----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| **Certified**                        | Mastercard Agent Pay, Visa TAP, Amex ACE registered agents                        | Verified identity, scheme-backed credentials, purchase protection, dispute resolution              | Full access. Streamlined checkout. Reduced friction.                          |
| **Platform-Identified**              | ChatGPT agent mode, Gemini Shopping, Atlas, Comet                                 | Identifiable via User-Agent or Web Bot Auth. Known operator. No scheme credentials.                | Standard access. Normal checkout with payment authentication.                 |
| **Consumer-Owned (Self-Identified)** | OpenClaw, Agent Zero, Hermes Agent using Web Bot Auth or known User-Agent strings | Self-reported identity. Open-source framework. No scheme credentials. Real purchase intent likely. | Open discovery. Standard checkout friction. Monitor behavior.                 |
| **Anonymous**                        | Unknown agents, custom scripts, unidentified automation                           | No identity signals. Could be legitimate consumer agent or malicious bot.                          | Open discovery. Higher checkout friction. Rate limiting. Behavioral analysis. |
| **Malicious**                        | Scrapers, scalping bots, credential stuffers                                      | Identified bad behavior patterns. Violates rate limits or ToS.                                     | Block. Report.                                                                |

Tip: The goal is not to verify every agent before allowing access --- it is to let purchase intent flow freely while applying proportional security at the point of transaction. Think of it like a physical store: anyone can walk in and browse, but payment requires identification.

## Understanding the Three Levels of Agentic Commerce {#understanding-the-three-levels-of-agentic-commerce}

Agentic commerce operates across three distinct implementation levels. Each level represents a different level of merchant adaptation and agent optimization. Use this framework to identify your starting point and plan your path toward full agentic integration.

## Level 1: Navigating Existing Web Interfaces {#level-1-navigating-existing-web-interfaces}

### What It Is {#what-it-is}

Level 1 represents the entry point for agentic commerce with minimal merchant work required. Agents use headless browsing or screen scraping techniques to interact with your standard e-commerce website exactly as a human would. They navigate your existing checkout forms, product pages, and flows without requiring dedicated agentic interfaces.

### How It Works {#how-it-works}

Agentic browsers like Atlas and Comet, agent modes in AI platforms like ChatGPT's agent mode (powered by the CUA model) or Anthropic's Claude computer use, consumer-owned agents like OpenClaw, Agent Zero, and Hermes Agent, accessibility-tree-based tools like Vercel's agent-browser, or headless browsers like Puppeteer and Playwright, visit your standard website and perform these actions:

* Parse HTML to extract product information, pricing, and availability
* Query the accessibility tree to identify interactive elements by their semantic roles and labels
* Capture and visually interpret screenshots to understand page layout and verify actions
* Navigate through your existing checkout process
* Fill out form fields programmatically
* Submit payment credentials through standard web forms

Most agents combine multiple perception methods --- for example, using the accessibility tree for navigation and form filling while checking screenshots to confirm the result. See the Screen Scraping Compatibility section below for details on each approach.

### Merchant Requirements {#merchant-requirements}

Focus on making your existing checkout accessible to agents.

#### Optimize Form Fields {#optimize-form-fields}

* Use clear, semantic HTML form field names (`email`, `shipping-address`, `card-number`)
* Add descriptive labels to all form inputs
* Add `aria-label` to interactive elements without visible text (icon buttons, image links)
* Avoid custom input components that obscure standard form functionality
* Ensure form validation provides clear error messages

#### Use Semantic HTML {#use-semantic-html}

* Wrap primary content in `<main>`, navigation in `<nav>`, and use `<article>` and `<section>` for content structure
* Use native HTML elements (`<button>`, `<input>`, `<select>`) instead of custom div-based widgets

#### Minimize Bot Blockers {#minimize-bot-blockers}

* Avoid aggressive CAPTCHAs that prevent legitimate agent access
* Implement Web Bot Auth (covered below) to distinguish legitimate agents from malicious bots
* Use rate limiting instead of blanket bot blocking

#### Ensure Screen Scraping Compatibility {#ensure-screen-scraping-compatibility}

* Avoid excessive JavaScript that makes content unavailable until after complex interactions
* Ensure critical commerce information is included in the initial Document Object Model (DOM), not only injected dynamically by JavaScript.

### Payment Handling {#payment-handling}

In Level 1, agents fill out your standard checkout forms exactly as humans do. When an agent uses Mastercard Agent Pay or Visa Intelligent Commerce:

1. The agent submits tokenized payment credentials in standard form fields through your website
2. Hash verification data arrives in HTTP headers (see agent identification below)
3. Your backend optionally validates the hash but processes the checkout through existing flows

### Limitations {#limitations}

* **Lower success rates**: Agents may struggle with complex page layouts, dynamic content, or unclear form structures
* **No dedicated optimization**: Your site is not optimized for agent navigation, leading to potential failures
* **Security concerns**: Hidden fields and client-side validation can confuse agents or create security gaps
* **Limited agent intelligence**: Agents must infer page structure and field purposes

### When to Use Level 1 {#when-to-use-level-1}

Choose Level 1 when:

* You want to support agentic commerce immediately without major changes
* Your site already follows web accessibility best practices
* You are testing the waters before committing to deeper integration
* You have a simple, standardized checkout flow

## Level 2: Bot-Friendly Web Interfaces {#level-2-bot-friendly-web-interfaces}

### What It Is {#what-it-is-1}

Level 2 represents a partial agentic interface where you actively optimize your website to be more agent-friendly while maintaining web-based interactions. This level provides dedicated agent-optimized experiences that increase success rates and reduce friction without requiring full API integration.

### How It Works {#how-it-works-1}

Create enhanced web experiences specifically designed for agent consumption by:

* Serving agent-optimized versions of existing pages
* Exposing simplified checkout flows for identified agent traffic
* Structuring content in agent-friendly formats (Markdown, clean HTML)
* Removing unnecessary elements that confuse agents

### Key Optimizations {#key-optimizations}

#### Streamline Page Structure {#streamline-page-structure}

* Use semantic HTML5 elements (`<main>`, `<article>`, `<section>`, `<nav>`) --- building on the basic semantic markup from Level 1
* Extend ARIA attributes beyond the basic `aria-label` coverage in Level 1. Use `aria-required` and `aria-invalid` on form fields so agents know which fields are mandatory and which have errors. Use `aria-expanded` on collapsible sections so agents know whether content is visible. Use `aria-live` on regions that update dynamically (price changes, stock alerts, order confirmations) so agents can detect updates without re-parsing the entire page. These advanced attributes give accessibility-tree-based agents richer interaction capabilities.
* Create dedicated landing pages with minimal navigation for agent traffic
* Reduce page complexity by removing carousels, pop-ups, and dynamic overlays

#### Simplify Checkout Flows {#simplify-checkout-flows}

* Offer guest checkout without account creation requirements
* Reduce the checkout steps
* Pre-populate fields where possible based on agent-provided data
* Provide clear progress indicators and error recovery paths

#### Improve Content Accessibility {#improve-content-accessibility}

* Serve clean HTML or Markdown responses for agent user-agents
* Structure product data with schema.org markup
* Provide machine-readable pricing, availability, and shipping information
* Maintain consistent URL structures and predictable navigation paths

### Mastercard Agent Pay, Visa Intelligent Commerce, and Amex ACE {#mastercard-agent-pay-visa-intelligent-commerce-and-amex-ace}

Mastercard, Visa, and American Express have introduced protocols to facilitate secure agentic commerce transactions. Level 2 implementations leverage these protocols to enhance security, distinguish legitimate agents, and improve checkout success rates.

Mastercard's Agent Pay and Visa's Trusted Agent Protocol (TAP) provides the cryptographic handshake between approved AI agents and merchants. Based on WebBotAuth, they establish a signed digital "handshake" that verifies the agent is authorized and trustworthy. Key partners like Cloudflare will provide edge-level verification.

For Level 2 implementations, you can identify legitimate agent traffic using cryptographic verification. The Protocol Implementation section covers this in detail. Key capabilities include:

* **Cryptographic verification**: Verify agents using headers included in their requests
* **Payment credential validation**: Validate payment credential hashes sent in headers
* **Request integrity**: Validate agent HTTP header signatures to ensure request integrity
* **Replay attack prevention**: Use header timestamps to prevent replay attacks
* **Rate limiting**: Apply rate limiting based on verified agent identity
* **User recognition**: Identify the user behind the agent by inspecting the user ID header

Note: Merchants should register with agent platforms to receive verified agent traffic. See the Merchant Validation section for details.

### When to Use Level 2 {#when-to-use-level-2}

Choose Level 2 when:

* You are seeing significant agent traffic and want to improve success rates
* You can identify agent traffic through Web Bot Auth or user-agent strings
* You want better control over the agent experience without full API development
* You want Agent optimized checkout flows

### Success Metrics {#success-metrics}

Monitor these metrics for Level 2 implementations:

* Agent checkout completion rates
* Average time to complete agent transactions
* Error rates in agent flows
* Agent traffic volume and trends

## Level 3: Fully Agentic APIs and Protocols {#level-3-fully-agentic-apis-and-protocols}

Note: Level 3 protocols are actively emerging. Early implementations like Google's Universal Commerce Protocol (UCP) and OpenAI's Agentic Commerce Protocol (ACP) are live with major retailers, but the ecosystem is still evolving. Merchants should monitor developments while focusing on Levels 1 and 2 for broadest immediate impact.

### What It Is {#what-it-is-2}

Level 3 represents the most advanced approach: purpose-built APIs and standardized protocols designed specifically for agent-to-merchant interaction. This level moves beyond web interfaces entirely, providing programmatic access to product catalogs, inventory, pricing, and checkout flows optimized for machine consumption.

### How It Works {#how-it-works-2}

Instead of navigating web pages, agents interact directly with standardized API endpoints and protocols to:

* Query structured product data through dedicated APIs
* Negotiate intent through protocol-defined mechanisms
* Exchange payment credentials programmatically without form filling
* Receive real-time inventory and pricing updates

Key protocols emerging in this space include:

* **Universal Commerce Protocol (UCP)**: Google's open-source standard, built on REST/JSON-RPC and OAuth 2.0. Adopted by Walmart, Target, Shopify, Etsy, and integrated with Visa, Mastercard, and Stripe. Enables end-to-end commerce within Gemini and other AI surfaces.
* **Agentic Commerce Protocol (ACP)**: OpenAI's framework, co-developed with Stripe. Powers commerce within ChatGPT apps, enabling merchants to maintain branded checkout experiences.
* **Model Context Protocol (MCP)**: Enables agent-to-system communication, allowing agents to interact with merchant tools and data sources.
* **Agent-to-Agent (A2A) Protocol**: Supports agent interoperability, enabling multi-agent orchestration across platforms.

### Intent Negotiation Mechanisms {#intent-negotiation-mechanisms}

Level 3 enables sophisticated intent capture:

* **Budget constraints**: Agents negotiate purchases within predefined budgets
* **Multi-merchant orchestration**: Agents coordinate purchases across multiple merchants for complex needs
* **Deferred purchase flows**: Agents register conditions (price drops, restocking) and complete purchases when conditions are met

Note: Fully autonomous deferred purchase flows are in early stages. Some protocol support exists (UCP supports order lifecycle management), but end-to-end autonomous purchasing without human confirmation remains limited.

### Advantages of Level 3 {#advantages-of-level-3}

* **Highest success rates**: Purpose-built APIs or other interfaces eliminate parsing and navigation errors
* **Scalability**: Handle high volumes of agent requests efficiently
* **Security**: Apply cryptographic verification at every step without form scraping vulnerabilities
* **Rich context**: Access full consumer context, preferences, and purchase history
* **Real-time updates**: Keep inventory, pricing, and availability always current

### Before You Invest in Level 3 {#before-you-invest-in-level-3}

Evaluate these factors before committing to Level 3 development:

* **Evaluate platforms**: Which agent platforms are your customers using?
* **Start small**: Implement Levels 1 and 2 first to understand agent behavior
* **Plan migration**: Build Level 2 implementations that can evolve into Level 3

### When to Consider Level 3 {#when-to-consider-level-3}

Choose Level 3 when:

* You are processing significant volumes of agent transactions
* Industry standards have matured and stabilized
* You have development resources for custom API implementation
* You want to support advanced agent capabilities like autonomous commerce and deferred purchases

## What is Next {#what-is-next}

In the following sections we will explore what you need to do to get ready for the different levels of agentic commerce.
