# Preparing for Agentic Commerce: Testing, Validation, and Reference Guide
source: https://developer.mastercard.com/merchant-cloud/documentation/tutorials-and-guides/agentic-commerce-guide/24/index.md

## Testing, Validation, and Reference Guide for Agentic Commerce {#testing-validation-and-reference-guide-for-agentic-commerce}

This section provides structured testing procedures and reference documentation for implementing agentic commerce solutions. You will find validation checklists for structured data, agent authentication, and payment processing, along with links to emerging standards and APIs. Use this resource to verify your implementation works reliably across different agent platforms and to stay current with evolving specifications.

## Testing and Validation {#testing-and-validation}

Thorough testing ensures your agentic commerce implementation works reliably across different agent platforms, browsers, and transaction scenarios. This section provides structured approaches to validate each component of your integration.

### Testing with Different Agents {#testing-with-different-agents}

Validate your implementation against multiple agent platforms to ensure broad compatibility. Each platform interprets pages differently, so test across the ecosystem.

#### Agent Platform Test Matrix {#agent-platform-test-matrix}

Test your site against these categories of agents:

|        Agent Category         |                     Examples                     |                                                             Testing Focus                                                             |
|-------------------------------|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| **AI Agent Platforms**        | ChatGPT, Claude, Gemini                          | Conversational commerce, product recommendations, checkout completion                                                                 |
| **Computer Use Models**       | ChatGPT Agent Mode (CUA), Anthropic Computer Use | Form filling, navigation, multi-step checkout flows (note: OpenAI Operator was sunsetted mid-2025 and folded into ChatGPT agent mode) |
| **Headless Browsers**         | Puppeteer, Playwright                            | DOM parsing, JavaScript rendering, form submission                                                                                    |
| **Agentic Browsers**          | Atlas, Comet                                     | Visual rendering, autonomous navigation, DOM parsing                                                                                  |
| **Accessibility-Tree Agents** | Vercel agent-browser, Playwright MCP             | ARIA labels, semantic HTML structure, accessibility tree completeness, stable element targeting                                       |

#### Testing Procedure {#testing-procedure}

For each agent platform, test the following scenarios based on your implementation level:

#### Level 1: Basic Agentic Enablement {#level-1-basic-agentic-enablement}

|        Test Area         |                                            Validation Steps                                            |
|--------------------------|--------------------------------------------------------------------------------------------------------|
| **Product discovery**    | Verify agents find and accurately describe products, pricing, and availability                         |
| **Cart operations**      | Add items, modify quantities, remove items                                                             |
| **Checkout completion**  | Complete full transaction including shipping selection and payment                                     |
| **Error handling**       | Trigger errors (invalid payment, out-of-stock) and verify graceful recovery                            |
| **Policy comprehension** | Confirm agents can access and interpret return policies and terms                                      |
| **Basic accessibility**  | Verify interactive elements have accessible names (aria-label) and semantic HTML5 elements are present |

#### Level 2: Optimized Agentic Experience {#level-2-optimized-agentic-experience}

|              Test Area              |                                               Validation Steps                                                |
|-------------------------------------|---------------------------------------------------------------------------------------------------------------|
| **Agent identification**            | Verify Web Bot Auth signatures are validated, and agents receive appropriate access                           |
| **Consumer recognition**            | Test ID token extraction, validation, and linking to customer accounts                                        |
| **Loyalty integration**             | Confirm loyalty benefits, personalized pricing, and rewards apply to agent transactions                       |
| **Payment credential verification** | Validate payment container signatures, nonce binding, and credential hash matching                            |
| **Structured data consistency**     | Compare JSON-LD markup against visible page content for accuracy                                              |
| **Agent-optimized checkout**        | Test dedicated checkout flow with reduced friction and clear form structure                                   |
| **Advanced ARIA**                   | Verify advanced ARIA attributes (aria-expanded, aria-live, aria-selected) communicate dynamic state to agents |
| **Post-purchase flows**             | Test order tracking, returns initiation, and dispute data capture via agent requests                          |

#### Level 3: Advanced Programmatic Checkout {#level-3-advanced-programmatic-checkout}

|               Test Area                |                                                  Validation Steps                                                  |
|----------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| **API endpoint availability**          | Verify dedicated agentic commerce API responds correctly to authenticated agent requests                           |
| **Intent registration and validation** | Test intent creation, constraint enforcement, and rejection of out-of-scope purchase requests                      |
| **Cryptographic credential exchange**  | Validate payment credential receipt, signature verification, and processing through payment gateway                |
| **Protocol compliance**                | Test UCP/ACP endpoint responses against protocol specifications; verify correct error codes                        |
| **Agent Card discovery**               | Verify `/.well-known/agent-card.json` is accessible, correctly populated, and returns proper capabilities          |
| **Verifiable Intent chain**            | Validate SD-JWT credential chain (L1→L2→L3) if participating in Mastercard Agent Pay                               |
| **Rate limiting and abuse prevention** | Confirm API rate limits are enforced and appropriate error responses returned for exceeded limits                  |
| **Error responses**                    | Verify API returns proper error codes and human-readable messages for invalid, malformed, or unauthorized requests |

### Testing with Agentic Browsers {#testing-with-agentic-browsers}

Agentic browsers like Atlas and Comet navigate your site autonomously using visual interpretation, DOM parsing, and accessibility tree querying. Test all three rendering modes to ensure compatibility.

#### Visual Rendering Tests {#visual-rendering-tests}

Verify your pages render correctly for screenshot-based agents:

1. **Critical content visibility**: Ensure product names, prices, and add-to-cart buttons appear above the fold
2. **No overlapping elements**: Confirm modals, pop-ups, or chat widgets do not obscure purchase actions
3. **Responsive design**: Test various viewport sizes to ensure mobile and desktop layouts are agent-friendly

#### DOM Parsing Tests {#dom-parsing-tests}

Validate your HTML structure for agents that parse the DOM directly. Example validation commands:

```bash
# Fetch page without JavaScript execution and display critical elements
curl -s https://www.example.com/products/widget-pro | grep -E "(price|availability|add-to-cart)"

# Verify autocomplete attributes exist in raw HTML
curl -s https://www.example.com/checkout | grep -o '<input.*autocomplete='
```

#### JavaScript Dependency Testing {#javascript-dependency-testing}

Test page functionality with JavaScript disabled:

1. Open browser developer tools
2. Disable JavaScript execution (ctrl+shift+j → ctrl+shift+p → "Disable JavaScript")
3. Navigate to product and checkout pages
4. Verify all critical content and form fields are present
5. Confirm form submission works (server-side validation)

#### Accessibility Tree Tests {#accessibility-tree-tests}

Validate that your pages produce a useful accessibility tree for agents that use this interaction method. The accessibility tree is the compact, semantic representation of your page that tools like Vercel's agent-browser and Playwright's MCP server use to navigate and interact.

##### Using browser developer tools: {#using-browser-developer-tools}

1. Open Chrome DevTools (F12) and navigate to the **Accessibility** tab in the Elements panel
2. Inspect your checkout page and verify that every interactive element (buttons, form fields, links, dropdowns) has a clear **Name** and **Role**
3. Check that decorative elements are excluded (marked with `aria-hidden="true"` or absent from the tree)
4. Verify that form fields show required/invalid states when applicable

##### Using Playwright's accessibility snapshot: {#using-playwrights-accessibility-snapshot}

Warning: Playwright's legacy `page.accessibility.snapshot()` API is deprecated. As of Playwright v1.59, use `page.ariaSnapshot({ mode: "ai" })` instead --- this is Playwright's modern, AI-optimized replacement that provides structured accessibility tree data designed for agent consumption. Alternatively, for CLI-based agent testing, Vercel's [agent-browser](https://agent-browser.dev/) provides accessibility tree snapshots via `agent-browser snapshot -i`. For WCAG compliance testing, use `@axe-core/playwright`.

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.example.com/checkout');
  
  // Modern approach (Playwright v1.59+) --- AI-optimized accessibility snapshot
  const snapshot = await page.ariaSnapshot({ mode: 'ai' });
  console.log(JSON.stringify(snapshot, null, 2));

  // Legacy approach (deprecated) --- avoid in new code
  // const snapshot = await page.accessibility.snapshot();
  
  await browser.close();
})();
```

Review the snapshot output and verify:

|           Check           |                                     What to Look For                                     |
|---------------------------|------------------------------------------------------------------------------------------|
| **Named elements**        | Every button, input, link, and select has a non-empty `name` property                    |
| **Correct roles**         | Elements have appropriate roles (`button`, `textbox`, `combobox`, `link`)                |
| **No anonymous controls** | No interactive elements appear with `role` but without `name`                            |
| **Minimal noise**         | Decorative images, spacers, and layout elements are absent from the tree                 |
| **State properties**      | Required fields show `required: true`; expanded/collapsed sections show `expanded` state |

|     Page Type      |                                 Required Without JavaScript                                  |
|--------------------|----------------------------------------------------------------------------------------------|
| **Product pages**  | Name, price, description, images, availability status, variant selection, add-to-cart button |
| **Category pages** | Product listings, pagination, filters \& search                                              |
| **Cart**           | Item list, quantities, totals, checkout link                                                 |
| **Checkout**       | All form fields, shipping, order summary, submit button, policy links                        |

### Verification Checklists {#verification-checklists}

Use these checklists to validate the core components of your agentic commerce implementation.

#### Structured Data {#structured-data}

|                                          Requirement                                           | Status |
|------------------------------------------------------------------------------------------------|--------|
| JSON-LD present on all product and policy pages                                                | ☐      |
| Markup values match visible page content (price, name, availability)                           | ☐      |
| No validation errors in Schema.org validator or Google Rich Results Test                       | ☐      |
| Semantic HTML5 elements used (`<main>`, `<nav>`, `<article>`) (level 1)                        | ☐      |
| Basic `aria-label` on all interactive elements (level 1)                                       | ☐      |
| Advanced ARIA attributes implemented (`aria-expanded`, `aria-live`, `aria-selected`) (level 2) | ☐      |
| robots.txt and agents.txt configured to guide agent behavior (level 2)                         | ☐      |
| Dedicated agentic API endpoints available (level 3)                                            | ☐      |

#### Agent Authentication {#agent-authentication}

|                           Requirement                           | Status |
|-----------------------------------------------------------------|--------|
| Valid Web Bot Auth signatures grant appropriate access          | ☐      |
| Invalid, expired, or replayed signatures are rejected           | ☐      |
| Consumer ID tokens are validated and linked to customer records | ☐      |

#### Payment Processing {#payment-processing}

|                             Requirement                              | Status |
|----------------------------------------------------------------------|--------|
| Tokenized credentials accepted and processed through payment gateway | ☐      |
| Payment container signature and nonce binding validated (Level 2)    | ☐      |
| Credential hash matches form-submitted values (Level 2)              | ☐      |
| Intent validated against cart contents before checkout (Level 3)     | ☐      |
| Accept cryptographic payment credentials (level 3)                   | ☐      |

#### Security and Compliance {#security-and-compliance}

|                          Requirement                           | Status |
|----------------------------------------------------------------|--------|
| Prompt injection mitigation in place for 3rd party information | ☐      |
| Registered as a trusted merchant by your PSP (level 2)         | ☐      |

#### Observability {#observability}

|                                       Requirement                                       | Status |
|-----------------------------------------------------------------------------------------|--------|
| Agent requests tagged and tracked separately from human traffic                         | ☐      |
| Conversion funnel metrics captured for agents (browse → cart → checkout → confirmation) | ☐      |
| Alerts configured for agent signature failures, payment errors, and traffic anomalies   | ☐      |
| Agent transaction context stored for dispute resolution                                 | ☐      |

## Staying Current with Emerging Standards {#staying-current-with-emerging-standards}

Monitor announcements from these key sources to stay ahead of changes:

**Payment Networks:**

* [Mastercard Agent Pay](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/agent-pay/)
* [Visa Intelligent Commerce](https://developer.visa.com/use-cases/visa-intelligent-commerce-for-agents)
* [Visa Intelligent Commerce Connect (Acceptance Portal)](https://developer.visaacceptance.com/products/intelligent_commerce.html)
* [American Express ACE Developer Kit](https://developer.americanexpress.com)

**Commerce Protocols:**

* [Universal Commerce Protocol (UCP)](https://ucp.dev)
* [Agentic Commerce Protocol (ACP)](https://developers.openai.com/commerce)
* [Verifiable Intent Specification](https://verifiableintent.dev)

**Agent Infrastructure Standards:**

* [Agentic AI Foundation (AAIF / MCP)](https://aaif.io)
* [A2A Protocol](https://a2aproject.io)
* [IETF Web Bot Auth Working Group](https://datatracker.ietf.org/wg/webbotauth/about/)

## Reference Documentation and APIs {#reference-documentation-and-apis}

Use these resources when implementing agentic commerce capabilities.

### Web Bot Auth Documentation {#web-bot-auth-documentation}

Web Bot Auth extends RFC 9421 (HTTP Message Signatures) to authenticate AI agent traffic. Web Bot Auth is now an **official IETF Working Group** (chartered October 2025), supported by major CDN, cloud, and platform providers.

#### Implementation resources: {#implementation-resources}

|           Resource           |                                                               URL                                                                |                                          Description                                           |
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| IETF Web Bot Auth WG         | [datatracker.ietf.org/wg/webbotauth](https://datatracker.ietf.org/wg/webbotauth/about/)                                          | Official IETF Working Group --- charter, drafts, and mailing list                              |
| Cloudflare Web Bot Auth      | [developers.cloudflare.com](https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/)                     | Edge-level verification configuration                                                          |
| GitHub Repository            | [github.com/cloudflare/web-bot-auth](https://github.com/cloudflare/web-bot-auth)                                                 | Node.js library for signature verification                                                     |
| Akamai Web Bot Auth          | [akamai.com/blog](https://www.akamai.com/blog/security/redefine-trust-web-bot-authentication)                                    | Enterprise CDN integration guide                                                               |
| AWS Bedrock AgentCore        | [docs.aws.amazon.com/bedrock-agentcore](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/browser-web-bot-auth.html) | Web Bot Auth for AWS agent infrastructure; agents bypass CAPTCHAs via authenticated signatures |
| npm Package                  | [npmjs.com/package/web-bot-auth](https://www.npmjs.com/package/web-bot-auth)                                                     | JavaScript library documentation                                                               |
| TAP Reference Implementation | [github.com/visa/trusted-agent-protocol](https://github.com/visa/trusted-agent-protocol)                                         | Visa's Trusted Agent Protocol reference implementation                                         |

#### RFC references: {#rfc-references}

* [RFC 9421](https://www.rfc-editor.org/rfc/rfc9421.html): HTTP Message Signatures
* [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519.html): JSON Web Token (JWT)

### Schema.org Vocabulary Reference {#schemaorg-vocabulary-reference}

Use Schema.org vocabularies to provide machine-readable product and policy information.

#### E-commerce vocabularies: {#e-commerce-vocabularies}

|         Type         |                                    URL                                     |             Use Case              |
|----------------------|----------------------------------------------------------------------------|-----------------------------------|
| Product              | [schema.org/Product](https://schema.org/Product)                           | Product pages, catalog items      |
| Offer                | [schema.org/Offer](https://schema.org/Offer)                               | Pricing, availability, conditions |
| Organization         | [schema.org/Organization](https://schema.org/Organization)                 | Merchant information              |
| MerchantReturnPolicy | [schema.org/MerchantReturnPolicy](https://schema.org/MerchantReturnPolicy) | Return and refund policies        |
| ShippingDeliveryTime | [schema.org/ShippingDeliveryTime](https://schema.org/ShippingDeliveryTime) | Delivery timeframes               |

#### Validation tools: {#validation-tools}

* [Schema Markup Validator](https://validator.schema.org/): Official Schema.org validator
* [Google Rich Results Test](https://search.google.com/test/rich-results): Test e-commerce structured data for Google Search rich results (note: Google is narrowing scope --- not all schema types are tested; use the Schema Markup Validator above as your primary validation tool for comprehensive coverage)
* [JSON-LD Playground](https://json-ld.org/playground/): Interactive JSON-LD experimentation

### Emerging Standards (Draft) {#emerging-standards-draft}

These standards are at various stages of development and adoption. Monitor for updates before implementing:

|              Standard               |                                                      URL                                                       |                                                                                       Status                                                                                        |
|-------------------------------------|----------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| agents.txt                          | [agentstxt.dev](https://agentstxt.dev)                                                                         | IETF draft expired April 10, 2026; fragmented landscape with 11+ competing proposals (agent-manifest.txt, agents-brief.txt, etc.); no ratified standard                             |
| llms.txt                            | [llmstxt.org](https://llmstxt.org)                                                                             | Community standard; \~1,200 site adoptions but major AI platforms (OpenAI, Google, Anthropic) have not committed to honoring it; voluntary and non-binding                          |
| Model Context Protocol              | [modelcontextprotocol.io](https://modelcontextprotocol.io)                                                     | De facto industry standard; governed by Linux Foundation's Agentic AI Foundation (AAIF); 97M+ monthly SDK downloads; integrated into ChatGPT, Claude, Gemini, and Microsoft Copilot |
| A2A (Agent-to-Agent)                | [a2aproject.io](https://a2aproject.io)                                                                         | Google-led open protocol; 50+ enterprise launch partners; agent discovery via `/.well-known/agent-card.json`; deep integration with Google ADK                                      |
| UCP (Universal Commerce Protocol)   | [ucp.dev](https://ucp.dev)                                                                                     | Google-led open standard; co-developed with 20+ partners including Mastercard, Visa, Shopify, Stripe; defines checkout, identity, order, and payment token interfaces               |
| ACP (Agentic Commerce Protocol)     | [github.com/agentic-commerce-protocol](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol) | OpenAI/Stripe open standard for conversational commerce; live in ChatGPT; supported by Shopify, Walmart, PayPal                                                                     |
| AP2 (Agent Payments Protocol)       | Google Developer Docs                                                                                          | Google protocol for agent-initiated payment flows; works alongside UCP and A2A                                                                                                      |
| Verifiable Intent                   | [verifiableintent.dev](https://verifiableintent.dev)                                                           | Mastercard/Google open-source cryptographic protocol; SD-JWT credential chains for proving agent actions match user authorization; Apache 2.0 license                               |
| AGENTS.md                           | [AAIF GitHub](https://github.com/anthropics/agents-md)                                                         | OpenAI proposal under AAIF governance for documenting agent behavior expectations; early stage                                                                                      |
| WebMCP (Web Model Context Protocol) | [webmachinelearning.github.io/webmcp](https://webmachinelearning.github.io/webmcp/)                            | Browser-native API for exposing structured tools to agents; Google/Microsoft collaboration; W3C Web ML Community Group incubation; Chrome 146+ early preview (Feb 2026)             |

### Agent Browser Tooling and Accessibility References {#agent-browser-tooling-and-accessibility-references}

These resources are relevant for understanding how agents interact with your site through accessibility trees and browser automation:

|           Resource           |                                              URL                                               |                                                                                                               Description                                                                                                               |
|------------------------------|------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Vercel agent-browser         | [agent-browser.dev](https://agent-browser.dev/)                                                | Leading AI-native browser automation CLI (25K+ GitHub stars, 310K+ weekly npm downloads); uses accessibility refs (@e1, @e2) instead of CSS selectors for 94% reduction in token usage; 50+ commands for navigation, forms, screenshots |
| Playwright MCP Server        | [github.com/anthropics/playwright-mcp](https://github.com/anthropics/playwright-mcp)           | MCP server enabling AI agents to interact with web pages through Playwright's browser automation; accessibility tree navigation support                                                                                                 |
| W3C ARIA Authoring Practices | [w3.org/WAI/ARIA/apg](https://www.w3.org/WAI/ARIA/apg/)                                        | Authoritative guide for implementing ARIA patterns correctly                                                                                                                                                                            |
| Playwright Accessibility API | [playwright.dev/docs/accessibility-testing](https://playwright.dev/docs/accessibility-testing) | Browser automation framework; use `page.ariaSnapshot({ mode: "ai" })` (v1.59+) for AI-optimized accessibility snapshots, or `@axe-core/playwright` for WCAG compliance (legacy `page.accessibility.snapshot()` is deprecated)           |

*** ** * ** ***

## Glossary of Terms {#glossary-of-terms}

|                  Term                   |                                                                                                                                                                                                                 Definition                                                                                                                                                                                                                 |
|-----------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **3-D Secure (3DS)**                    | An authentication protocol for online card payments that adds a verification step between the cardholder and issuer. Historically designed for human authentication. EMVCo and major payment networks are developing delegated authentication models for trusted AI agents, and risk-based frictionless flows may approve agent transactions meeting issuer criteria, but explicit 3DS support for agentic transactions is still emerging. |
| **A2A (Agent-to-Agent Protocol)**       | Google-developed open protocol for inter-agent communication and discovery. Agents advertise capabilities via Agent Cards (`/.well-known/agent-card.json`). 50+ enterprise launch partners; deeply integrated with Google's Agent Development Kit (ADK).                                                                                                                                                                                   |
| **AAIF (Agentic AI Foundation)**        | Linux Foundation entity governing the Model Context Protocol (MCP) and related agentic AI standards. Co-founded by Anthropic, OpenAI, and Block, with backing from Google, Microsoft, and AWS.                                                                                                                                                                                                                                             |
| **ACE (Agentic Commerce Experiences)**  | American Express developer kit providing APIs for agent registration, account enablement, intent intelligence, payment credentials, and cart context in agentic commerce. Includes Agent Purchase Protection™.                                                                                                                                                                                                                             |
| **ACP (Agentic Commerce Protocol)**     | Open standard co-developed by OpenAI and Stripe for programmatic e-commerce between AI agents and merchants. Powers ChatGPT shopping experiences. Supported by Shopify, Walmart, PayPal, and others.                                                                                                                                                                                                                                       |
| **Accessibility Tree**                  | A simplified, semantic representation of a webpage constructed by the browser from HTML elements and ARIA attributes. Originally designed for assistive technologies like screen readers, the accessibility tree is increasingly used by AI agents as a compact, resilient interface for page interaction. It exposes element roles, accessible names, and states while filtering out decorative content.                                  |
| **Agent**                               | An AI system that performs tasks autonomously on behalf of a user, including browsing websites, gathering information, and completing purchases.                                                                                                                                                                                                                                                                                           |
| **Agent Certification**                 | The process by which payment networks (Mastercard, Visa) verify that an AI agent meets security, privacy, and operational standards before participating in agentic commerce.                                                                                                                                                                                                                                                              |
| **Agent Browser CLI**                   | A command-line tool designed for AI agent-browser interaction using accessibility tree snapshots and stable element references rather than CSS selectors. Optimized for token efficiency and interaction reliability (e.g., Vercel agent-browser).                                                                                                                                                                                         |
| **Agent Card**                          | A JSON file hosted at `/.well-known/agent-card.json` that advertises an agent's capabilities, authentication requirements, supported communication modalities, and available skills per the A2A protocol. Enables dynamic agent discovery without hard-coded integrations.                                                                                                                                                                 |
| **Agent Pay**                           | Mastercard's framework for enabling certified AI agents to conduct secure commerce transactions on behalf of consumers. See also: Mastercard Agent Pay.                                                                                                                                                                                                                                                                                    |
| **Agent Purchase Protection**           | American Express coverage for eligible cardmembers against losses from agent errors when transacting through registered AI agents on the Amex network. Industry-first consumer protection for agentic commerce.                                                                                                                                                                                                                            |
| **Agent User Identity Object**          | A data structure in Mastercard Agent Pay containing consumer identity information, including a signed JWT token and cryptographic binding to the message signature.                                                                                                                                                                                                                                                                        |
| **Agentic Browser**                     | A web browser designed for AI agents that navigates sites autonomously using visual interpretation, DOM parsing, and accessibility tree querying (e.g., Atlas, Comet).                                                                                                                                                                                                                                                                     |
| **Agentic Commerce**                    | Commerce transactions initiated or completed by AI agents acting on behalf of consumers, encompassing product discovery, checkout, and post-purchase support.                                                                                                                                                                                                                                                                              |
| **Agentic Consumer Recognition Object** | A data structure in Visa Intelligent Commerce containing consumer identity tokens, device identifiers, and contextual data for user recognition.                                                                                                                                                                                                                                                                                           |
| **Agentic Payment Container**           | A cryptographically signed object in Visa Intelligent Commerce containing payment credentials, nonce binding, and signature verification data.                                                                                                                                                                                                                                                                                             |
| **Agentic Token**                       | A tokenized payment credential specifically provisioned for agent-initiated transactions, enabling issuers to identify and authorize agentic commerce flows.                                                                                                                                                                                                                                                                               |
| **AP2 (Agent Payments Protocol)**       | Google protocol for agent-initiated payment flows, designed to work alongside UCP and A2A. Handles payment orchestration in multi-agent commerce scenarios.                                                                                                                                                                                                                                                                                |
| **agents.txt**                          | A proposed configuration file for declaring agentic commerce capabilities, endpoints, and policies. The IETF draft expired in April 2026, and the landscape is fragmented with multiple competing proposals (agent-manifest.txt, agents-brief.txt, etc.). No ratified standard exists. Sites that deployed it can keep the file, but future compatibility is uncertain.                                                                    |
| **Answer Engine Optimization (AEO)**    | The practice of optimizing content for discovery by AI agents and large language models, focusing on structured data, factual accuracy, and machine-readable formats.                                                                                                                                                                                                                                                                      |
| **ARIA**                                | Accessible Rich Internet Applications; HTML attributes (`aria-label`, `aria-describedby`, `role`) that improve accessibility for assistive technologies and AI agents.                                                                                                                                                                                                                                                                     |
| **Asynchronous Commerce**               | A commerce pattern where consumers instruct agents to monitor conditions (price drops, restocking) and complete purchases when criteria are met, without real-time involvement.                                                                                                                                                                                                                                                            |
| **Autocomplete Attribute**              | An HTML attribute that maps form fields to standardized data categories (e.g., `autocomplete="cc-number"`), helping agents identify field purposes accurately.                                                                                                                                                                                                                                                                             |
| **Autonomous Agentic Commerce**         | Advanced agentic commerce where agents complete purchases based on prior consumer instructions without requiring secondary confirmation at checkout time.                                                                                                                                                                                                                                                                                  |
| **Computer Use Model**                  | An AI model capable of interacting with computer interfaces primarily through screenshot-based visual interpretation, interpreting rendered images to identify UI elements and outputting simulated mouse and keyboard actions at specific screen coordinates.                                                                                                                                                                             |
| **Consumer Intent**                     | See: Intent.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Credential Hash**                     | A cryptographic hash of payment credentials included in agent requests, allowing merchants to verify that form-submitted values match the agent's intended payment data.                                                                                                                                                                                                                                                                   |
| **Cryptogram**                          | A one-time dynamic security code generated for transaction authentication in tokenized payments, providing proof of credential validity without exposing card data.                                                                                                                                                                                                                                                                        |
| **CUA (Computer-Using Agent)**          | OpenAI's model combining vision and advanced reasoning to interact with computer interfaces by analyzing screenshots and generating mouse/keyboard actions at specific screen coordinates. Powers ChatGPT's agent mode.                                                                                                                                                                                                                    |
| **Deferred Commerce**                   | See: Asynchronous Commerce.                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Detokenization**                      | The process by which a payment processor exchanges a token for actual payment credentials at the network level during transaction authorization.                                                                                                                                                                                                                                                                                           |
| **DOM Parsing**                         | The technique agents use to read and interpret HTML document structure programmatically, extracting content and identifying interactive elements.                                                                                                                                                                                                                                                                                          |
| **DSRP Cryptogram**                     | Digital Secure Remote Payment cryptogram; a Mastercard-specific one-time security code for authenticating tokenized transactions.                                                                                                                                                                                                                                                                                                          |
| **Edge-Level Verification**             | Signature validation performed at the CDN or edge network layer (Cloudflare, Akamai) before requests reach the origin server.                                                                                                                                                                                                                                                                                                              |
| **EMVCo**                               | The standards body managing EMV specifications for chip cards, tokenization, and secure remote commerce, including 3-D Secure.                                                                                                                                                                                                                                                                                                             |
| **HTTP Message Signatures**             | See: RFC 9421.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **ID Token**                            | A signed JSON Web Token (JWT) identifying a consumer, issued by a payment network and transmitted by agents to enable user recognition and personalization.                                                                                                                                                                                                                                                                                |
| **In-Situ Consumer Commerce**           | Agentic commerce where consumers discover products and complete purchases directly within the agent's interface without navigating to merchant websites.                                                                                                                                                                                                                                                                                   |
| **Intent**                              | A structured record of what a consumer authorized an agent to purchase, including product details, quantities, budget constraints, merchant specifications, and delivery requirements.                                                                                                                                                                                                                                                     |
| **Intent API**                          | Mastercard's API for registering, validating, and managing consumer purchase intents in agentic commerce transactions.                                                                                                                                                                                                                                                                                                                     |
| **Intent Validation**                   | The process of comparing checkout contents against a registered consumer intent to verify the agent is purchasing exactly what was authorized.                                                                                                                                                                                                                                                                                             |
| **JSON-LD**                             | JavaScript Object Notation for Linked Data; a format for encoding structured data (Schema.org markup) in web pages that agents can extract without parsing HTML.                                                                                                                                                                                                                                                                           |
| **JWT**                                 | JSON Web Token; a compact, URL-safe token format (RFC 7519) used for transmitting claims between parties, including consumer identity in agentic commerce.                                                                                                                                                                                                                                                                                 |
| **Key Directory**                       | A registry maintained by payment networks containing public keys for certified agents, used to verify Web Bot Auth signatures.                                                                                                                                                                                                                                                                                                             |
| **keyid**                               | The identifier in a Web Bot Auth signature referencing the specific public key to use for verification.                                                                                                                                                                                                                                                                                                                                    |
| **Level 1 (Agentic Commerce)**          | Basic agentic enablement where agents interact with existing web interfaces through screen scraping and form filling, requiring minimal merchant changes including basic semantic HTML and ARIA labels.                                                                                                                                                                                                                                    |
| **Level 2 (Agentic Commerce)**          | Optimized agentic experience with structured data, advanced ARIA attributes, agent-aware authentication, payment verification, and dedicated checkout flows for improved success rates.                                                                                                                                                                                                                                                    |
| **Level 3 (Agentic Commerce)**          | Fully programmatic agentic commerce with dedicated APIs, intent negotiation, and direct credential exchange without web interface rendering.                                                                                                                                                                                                                                                                                               |
| **llms.txt**                            | A proposed file format for providing LLM-friendly content summaries to AI systems. An emerging standard with limited adoption.                                                                                                                                                                                                                                                                                                             |
| **Mastercard Agent Pay**                | Mastercard's comprehensive framework for agentic commerce, including agent certification, Web Bot Auth, consumer identity, payment credentials, and intent management.                                                                                                                                                                                                                                                                     |
| **MCP**                                 | Model Context Protocol; an industry standard governed by the Linux Foundation's Agentic AI Foundation (AAIF) for AI agents to discover and interact with external tools and services through structured tool definitions. Supported by 97M+ monthly SDK downloads and integrated into all major AI platforms.                                                                                                                              |
| **MCP Server**                          | A server implementing the Model Context Protocol that exposes business logic as callable tools for AI agents.                                                                                                                                                                                                                                                                                                                              |
| **Merchant Registration**               | The process of registering with payment networks or agent platforms to receive verified agent traffic and participate in agentic commerce programs.                                                                                                                                                                                                                                                                                        |
| **Network Token**                       | A payment credential issued by a card network that represents the consumer's payment method without exposing actual card data, scoped by merchant, channel, or time.                                                                                                                                                                                                                                                                       |
| **Nonce**                               | A unique value included in Web Bot Auth signatures to prevent replay attacks. Each nonce can only be used once within its validity window.                                                                                                                                                                                                                                                                                                 |
| **Nonce Binding**                       | The cryptographic link between a message signature and associated data objects (payment container, identity object) using a shared nonce value.                                                                                                                                                                                                                                                                                            |
| **OAuth 2.1**                           | An authorization framework enabling consumers to delegate scoped API access to agents without sharing credentials directly.                                                                                                                                                                                                                                                                                                                |
| **OpenAPI**                             | A specification for describing REST APIs in a machine-readable format, enabling agents to discover and understand API endpoints programmatically.                                                                                                                                                                                                                                                                                          |
| **Operator**                            | OpenAI's Computer-Using Agent (CUA) technology, now integrated into ChatGPT as agent mode. Originally launched as a standalone preview in early 2025, it was folded into ChatGPT in mid-2025. Uses vision and reasoning to navigate websites autonomously via a cloud-hosted browser on behalf of users.                                                                                                                                   |
| **Payment Container**                   | See: Agentic Payment Container.                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Payment Data Object**                 | A cryptographically signed structure in Mastercard Agent Pay containing payment credentials or credential hashes bound to the message signature.                                                                                                                                                                                                                                                                                           |
| **PCI Scope**                           | The systems and processes subject to Payment Card Industry Data Security Standard compliance requirements based on handling of cardholder data.                                                                                                                                                                                                                                                                                            |
| **Programmatic Checkout**               | Level 3 checkout where agents submit payment credentials through APIs rather than filling web forms, eliminating screen scraping dependencies.                                                                                                                                                                                                                                                                                             |
| **Prompt Injection**                    | An attack where malicious text embedded in content (ads, descriptions, images) causes AI agents to execute unintended actions or reveal sensitive information.                                                                                                                                                                                                                                                                             |
| **Replay Attack**                       | An attack where a valid signed request is captured and resubmitted. Web Bot Auth prevents this through timestamp validation and nonce uniqueness.                                                                                                                                                                                                                                                                                          |
| **RFC 7519**                            | The IETF standard defining JSON Web Token (JWT) format and processing rules.                                                                                                                                                                                                                                                                                                                                                               |
| **RFC 9421**                            | The IETF standard for HTTP Message Signatures, which Web Bot Auth extends for authenticating AI agent traffic.                                                                                                                                                                                                                                                                                                                             |
| **robots.txt**                          | A standard file at the domain root instructing web crawlers and agents which pages to access, with optional sitemaps and crawl-delay directives.                                                                                                                                                                                                                                                                                           |
| **SCA**                                 | Strong Customer Authentication; regulatory requirement in jurisdictions like the EU for two-factor authentication on electronic payments.                                                                                                                                                                                                                                                                                                  |
| **Schema.org**                          | A collaborative vocabulary for structured data markup on web pages, used to provide machine-readable product, organization, and policy information.                                                                                                                                                                                                                                                                                        |
| **Screen Scraping**                     | The technique agents use to extract information from web pages by parsing HTML, querying the accessibility tree, or interpreting visual screenshots. Modern agents increasingly combine these methods.                                                                                                                                                                                                                                     |
| **Semantic HTML**                       | HTML markup using elements that convey meaning and structure (`<main>`, `<article>`, `<section>`, `<nav>`) rather than purely presentational elements.                                                                                                                                                                                                                                                                                     |
| **Signature-Agent Header**              | An HTTP header in Web Bot Auth requests identifying the key directory URL for retrieving the agent's public key.                                                                                                                                                                                                                                                                                                                           |
| **Signature-Input Header**              | An HTTP header in Web Bot Auth requests specifying which components are signed and including security parameters (keyid, algorithm, timestamps, nonce, tag).                                                                                                                                                                                                                                                                               |
| **srcDpaId**                            | A Mastercard-generated unique identifier for merchants participating in agentic commerce.                                                                                                                                                                                                                                                                                                                                                  |
| **SSR**                                 | Server-Side Rendering; generating HTML on the server before sending to clients, ensuring content is available to agents without JavaScript execution.                                                                                                                                                                                                                                                                                      |
| **Synchronous Commerce**                | Real-time agentic commerce where consumers shop with agent assistance and confirm purchases within the same session.                                                                                                                                                                                                                                                                                                                       |
| **TAP**                                 | Trusted Agent Protocol; Visa's specification for agent authentication, consumer recognition, and payment credential exchange in agentic commerce.                                                                                                                                                                                                                                                                                          |
| **Tag (Web Bot Auth)**                  | A parameter in the Signature-Input header identifying the interaction type: `agent-pay-auth` (Mastercard), `agent-browser-auth` (Visa browsing), or `agent-payer-auth` (Visa checkout).                                                                                                                                                                                                                                                    |
| **Tokenization**                        | The process of replacing sensitive payment data with a non-sensitive token that cannot be reverse-engineered, reducing PCI scope and fraud risk.                                                                                                                                                                                                                                                                                           |
| **Trusted Agent Registry**              | A directory maintained by payment networks listing certified agents authorized to participate in agentic commerce.                                                                                                                                                                                                                                                                                                                         |
| **UCP (Universal Commerce Protocol)**   | Open-source, cross-platform standard for agentic commerce co-developed by Google and 20+ partners (Shopify, Walmart, Mastercard, Visa, Stripe). Defines common interfaces for checkout, identity linking, order management, and payment token exchange. Available at ucp.dev.                                                                                                                                                              |
| **User-Agent String**                   | An HTTP header identifying the client software making a request, sometimes used to identify agent traffic before Web Bot Auth verification.                                                                                                                                                                                                                                                                                                |
| **Verifiable Intent**                   | Open-source cryptographic protocol (Mastercard/Google) using SD-JWT credential chains to prove an AI agent's commercial action matched the user's explicit authorization. Uses selective disclosure so each party sees only minimum necessary data. Built on FIDO Alliance, EMVCo, IETF, and W3C standards.                                                                                                                                |
| **VIC**                                 | Visa Intelligent Commerce; Visa's framework for agentic commerce enabling AI agents to conduct secure transactions on behalf of consumers.                                                                                                                                                                                                                                                                                                 |
| **Visual Interpretation**               | The technique screenshot-based agents use to understand web pages by analyzing rendered images rather than parsing HTML directly.                                                                                                                                                                                                                                                                                                          |
| **Web Bot Auth**                        | A protocol extending RFC 9421 (HTTP Message Signatures) for cryptographically authenticating AI agent traffic, distinguishing certified agents from malicious bots.                                                                                                                                                                                                                                                                        |
| **WebMCP** (Web Model Context Protocol) | A browser-native API (via `navigator.modelContext`) that allows websites to expose structured, callable tools directly to AI agents. Developed by Google and Microsoft, incubated in the W3C Web Machine Learning Community Group. Supports declarative (HTML form annotations) and imperative (JavaScript `registerTool()`) APIs. Available in Chrome 146+ early preview (February 2026).                                                 |

> #### DISCLAIMER {#disclaimer}
>
> All products, services, platforms, and examples mentioned in this guide are provided for informational purposes only. Their inclusion does not constitute any endorsement, recommendation, or guarantee of suitability. Merchants and readers are solely responsible for independently evaluating the appropriateness, reliability, and compliance of any solution for their specific business needs before adoption or implementation.  
>
> This guide may contain forward-looking statements regarding technologies, trends, or potential future developments. These statements are based on current expectations and assumptions and are subject to risks and uncertainties. Actual outcomes may differ materially from those expressed or implied. No assurance is given that any described features, capabilities, or timelines will occur as anticipated. Readers should not rely on these statements for decision-making and should conduct their own due diligence.
