# The Rails for Agentic Commerce
source: https://developer.mastercard.com/merchant-cloud/documentation/tutorials-and-guides/ai-revolution/14/index.md

## The Infrastructure Powering Agentic Commerce {#the-infrastructure-powering-agentic-commerce}

As AI agents begin shopping for consumers, new infrastructure is emerging to make these transactions safe and reliable. Three major initiatives are leading the way: payment networks are building the trust rails, AI platforms are creating the shopping experiences, and new standards are enabling everyone to work together.

## Mastercard Agent Pay, Visa Intelligent Commerce, and American Express ACE {#mastercard-agent-pay-visa-intelligent-commerce-and-american-express-ace}

Global payment networks like Mastercard, Visa, and American Express are building the foundation that lets AI agents make purchases safely. Think of it as the trust layer that protects both consumers and merchants when agents are involved.

### What these payment systems do for you {#what-these-payment-systems-do-for-you}

#### They verify and certify agents {#they-verify-and-certify-agents}

Only registered agents can transact through the network. Each agent goes through a security review before being certified. Once certified, agents are added to trusted agent lists. These lists are maintained by the payment networks. Merchants can check these lists to verify an agent's trustworthiness.

#### They help you verify that agents are legitimate {#they-help-you-verify-that-agents-are-legitimate}

Traditional bot security measures like CAPTCHAs and device fingerprinting were built to stop automated scrapers. But these protections may also block AI agents with legitimate shopping intent. That means your existing defenses might accidentally block an important source of commerce traffic.

Mastercard, Visa and American Express build upon a standard called [Web Bot Auth](https://webbotauth.io/). Now an official IETF (Internet Engineering Task Force) Working Group effort, this standard lets agents prove who they are using cryptographic signatures. Instead of trying to detect suspicious behavior, it confirms an agent's identity. Think of it as a digital ID card that agents can show when they visit your site. Web Bot Auth is supported by major infrastructure providers including Cloudflare, GoDaddy, Google, and AWS.

##### Here is how it works in practice: {#here-is-how-it-works-in-practice}

The agent signs its request with a private key when it visits your site. Your system verifies the signature using a trusted registry of agent identities. If the signature checks out and the agent is on the approved list, you know it is legitimate.

#### They protect your customers' payment information {#they-protect-your-customers-payment-information}

Card numbers are never exposed to agents. Instead, agents use secure tokens. Even if something goes wrong, your customers' card details stay safe. This happens even in tier 1 agentic commerce (as defined [above](https://developer.mastercard.com/merchant-cloud/documentation/tutorials-and-guides/ai-revolution/13/index.md#thinking-in-stages). All verified agents with Visa and Mastercard use tokenization.

##### This is how a typical flow works: {#this-is-how-a-typical-flow-works}

1. The consumer authenticates with their agent platform and authorizes payment
2. The platform provisions a token --- a one-time or limited-use credential that represents the consumer's payment method
3. When checking out at your site, the agent submits this token instead of card numbers
4. Your payment processor detokenizes and processes the payment through standard networks

#### They ensure the customer approved the purchase {#they-ensure-the-customer-approved-the-purchase}

Beyond secure payment exchange, the payment networks are building systems to share transaction intent data throughout the payment ecosystem. This creates unprecedented transparency and new opportunities for fraud prevention.

When a consumer authorizes an agent to make a purchase, the agent captures intent data --- what the consumer asked for, budget constraints, merchant preferences, delivery expectations, and more. This intent data is authenticated by the consumer and can be shared downstream to issuers and merchants. Issuers can see that a transaction originated from a certified agent, apply appropriate authorization logic.

In March 2026, Mastercard and Google open-sourced **[Verifiable Intent](https://verifiableintent.dev)** --- a cryptographic framework that links three elements for every agent transaction: the user's verified identity, the exact instructions given to the agent, and the transaction outcome. It uses selective disclosure so each party (consumer, merchant, issuer) sees only the minimum data necessary for their role. Partners include Google, IBM, Fiserv, Checkout.com, Worldpay, and Adyen.

Merchants will receive intent data as part of the transaction flow. This lets you:

* Compare what the agent is purchasing against what the consumer authorized.
* Understand consumer constraints and preferences to guide the agent toward successful completion. The Merchant can also use the intent to remind agents of any product choices which need to be captured.
* Identify if an agent has been tricked or compromised (e.g., prompt injection attacks).
* Apply dynamic risk scoring based on how well the transaction matches stated intent.

Note: The exchange of intent information between the Agent and Merchant is future facing and part of level 3 agentic commerce.

This visibility creates a new layer of trust: everyone in the transaction knows an agent was involved, has access to the consumer intent, and can verify authenticity at their point in the flow.

#### Establishes clear standards {#establishes-clear-standards}

Global payment networks are creating protocols for how agents and merchants exchange information. This makes it easier for you to work with any certified agent, regardless of which AI platform it comes from.

Mastercard has also launched its **Agent Suite** --- a platform for banks, merchants, and enterprises to adopt agentic AI with built-in compliance and security. Mastercard has completed live agentic transactions in multiple markets, including Thailand (with Krungthai Card) and Latin America (with Santander), and is expanding across Asia-Pacific.

American Express introduced the **ACE Developer Kit** in April 2026 --- providing Agent Registration, Account Enablement, Intent Intelligence, Payment Credentials, and Cart Context services. Amex also launched **Agent Purchase Protection**, an industry-first commitment to cover eligible cardmembers against losses due to agent error when using registered AI agents.

In April 2026, Visa launched **Intelligent Commerce Connect** --- a network-, protocol-, and token vault-agnostic gateway that simplifies multi-protocol agentic payment acceptance. With a single integration through the Visa Acceptance Platform, merchants can process agent-initiated payments across multiple protocols including Visa TAP, UCP, ACP, and others.

### Why this matters to your business {#why-this-matters-to-your-business}

Agentic commerce enables agents to shop with you reliably:

* More purchases complete successfully because checkout is smoother
* Fewer customers abandon their carts
* Your fraud protection stays strong while reducing friction for legitimate purchases
* You can work with any approved AI platform without building custom connections for each one

For your customers, it means their agents can shop confidently. They know their transactions have controls, their card numbers stay private, and any disputes can be resolved fairly.

These initiatives by global payment networks --- Mastercard Agent Pay, Visa Intelligent Commerce, and American Express ACE --- represent the foundational infrastructure for agentic commerce.

Your customers may use different AI assistants. The payment infrastructure is designed to work with all of them. You build once and support many platforms.

If you want to accept agent purchases, you are closer than you think. Many capabilities can be enabled through your existing Payment Services Provider. Often, you just need to make a few adjustments to your website.
Note: Merchants should be registered to participate in Mastercard Agent Pay, Visa Intelligent Commerce, and American Express ACE. This registration is typically handled by your acquirer or Payment Service Provider (PSP). Contact your PSP representative to ask about their readiness for agentic commerce and to request registration for your business. Tip:   
Learn more: [Mastercard Agent Pay](https://www.mastercard.com/global/en/business/artificial-intelligence/mastercard-agent-pay.html)  

Learn more: [Visa Intelligent Commerce](https://developer.visa.com/use-cases/visa-intelligent-commerce-for-agents)  

Learn more: [American Express ACE](https://www.americanexpress.com/en-us/company/agentic-commerce/)

## ChatGPT Shopping and the Agentic Commerce Protocol {#chatgpt-shopping-and-the-agentic-commerce-protocol}

ChatGPT has a large and growing user base. OpenAI has positioned ChatGPT as a powerful product discovery and consideration engine for consumers.

OpenAI initially launched "Instant Checkout" in September 2025. This let US users buy products directly inside the chat. However, in March 2026 OpenAI discontinued Instant Checkout and pivoted to a discovery-first model. Consumers now research, compare, and select products inside ChatGPT. They are then routed to the merchant's own website or app to complete checkout and payment.

This evolution is important context. It shows that the agentic commerce space is still maturing. Even major platforms are adjusting their approach based on what consumers and merchants actually need.

### How ChatGPT shopping works today {#how-chatgpt-shopping-works-today}

When someone asks ChatGPT for *"running shoes under $100,"* it shows rich, image-based product cards with comparison tables and filters. ChatGPT surfaces results based on what matches the customer's question. Results are not sponsored.

The underlying infrastructure is the **Agentic Commerce Protocol (ACP)** --- an open standard co-developed by OpenAI and Stripe (with PayPal support). ACP powers product discovery within ChatGPT, enabling merchants to provide structured product feeds and surface products to consumers. Checkout happens on the merchant's own website or through integrated retailer apps. Merchants upload product data (CSV, JSON, TSV, or XML feeds, images, stock) to OpenAI endpoints, updated as frequently as every 15 minutes.

Major integrations already include Shopify, Walmart, Instacart, Target, Expedia, Booking.com, Sephora, Nordstrom, Best Buy, The Home Depot, and Wayfair.

### Key takeaways for merchants {#key-takeaways-for-merchants}

You remain the merchant throughout the entire journey. That means:

* You own the customer relationship
* You handle checkout, fulfillment, returns, and support
* ChatGPT helps consumers discover and choose your products
* Checkout happens on your site, where you control the experience

Your visibility in ChatGPT depends on the quality and completeness of your product feeds. Titles, images, descriptions, prices, and real-time availability all affect how prominently your products appear.

If your business wants to participate in ChatGPT shopping, get in touch with us. We will help provide information about it.
Tip: Learn more: [Agentic Commerce Protocol Documentation](https://openai.com/index/agentic-commerce-protocol/)
