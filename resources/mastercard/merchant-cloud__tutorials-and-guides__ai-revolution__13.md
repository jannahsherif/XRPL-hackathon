# The Three Levels of Readiness for AI Shopping
source: https://developer.mastercard.com/merchant-cloud/documentation/tutorials-and-guides/ai-revolution/13/index.md

## Thinking in Stages {#thinking-in-stages}

You do not need to rebuild your entire business overnight. Agentic commerce works in stages. You can start simple and grow as the technology matures.

Think of it as three levels of readiness. Each level builds on the last. Most businesses should focus on the first two levels today.

### Level 1: Make your existing site work for agents {#level-1-make-your-existing-site-work-for-agents}

This is your starting point. It requires minimal changes to what you already have.

Agents access your website the same way humans do. They navigate product pages, fill out checkout forms, and submit payments. The difference is that an agent does this on behalf of a consumer.

What you need to do:

* Remove barriers that block legitimate agent access. For example, aggressive security checks (like CAPTCHAs) that mistake agents for harmful bots.
* Use clear labels on your forms. Make buttons and fields easy to understand.
* Work with your infrastructure provider to screen agent traffic using services like [Web Bot Auth](https://webbotauth.io/)(more on this in Level 2). Services like [Cloudflare](https://www.cloudflare.com/) or [Akamai](https://www.akamai.com/) can help you identify trusted agents.

How payments work: Agents submit secure payment tokens through your current checkout. The verification happens behind the scenes.

### Level 2: Optimize your site for agents {#level-2-optimize-your-site-for-agents}

Once you are comfortable with Level 1, you can make your site more agent-friendly. This means making it easier for agents to find information and complete tasks.

What you need to do:

* Add clear labels that AI shopping assistants can easily read such as putting price tags in a standard format (for example, structured data markup using the schema.org vocabulary as well as ARIA tags).
* Consider simplified checkout pages designed for agents to increase the agent's reliability.
* Make your policies easy for agents to understand. Your return rules, shipping terms, and warranty information should be clear and consistent.
* Leverage services like Web Bot Auth to recognize legitimate agents and give them smoother experiences.

How payments work: Same as Level 1, but with cleaner forms and fewer obstacles. You may create dedicated checkout paths for agents.

### Level 3: Build specialized systems for agents *(future state)* {#level-3-build-specialized-systems-for-agents-future-state}

Level 3 represents what is coming next. Purpose-built systems designed specifically for agents to interact with your business.

Agents would connect directly to your systems through specialized channels. No web pages required. This level will become more practical as industry standards mature.

What you would do:

* Build standardized API endpoints for product discovery, intent negotiation and checkout.
* Implement [MCP](https://modelcontextprotocol.io/) (Model Context Protocol) servers for agent-to-tool connectivity. MCP --- now governed by the Linux Foundation's Agentic AI Foundation with backing from Anthropic, OpenAI, Google, Microsoft, AWS, Block, and Cloudflare --- is the universal standard for connecting AI agents with tools and data sources.
* Implement [A2A](https://a2a-protocol.org/latest/) (Agent-to-Agent) protocol for multi-agent coordination. A2A, developed by Google, standardizes how autonomous agents discover, authenticate, and hand off tasks across organizational boundaries. It now has 50+ enterprise launch partners.
* Adopt Google's [Universal Commerce Protocol](https://ucp.dev/) (UCP) --- an open-source standard released in January 2026 for end-to-end agentic commerce. UCP is co-developed with Shopify, Walmart, Target, Mastercard, Visa, Stripe, and 20+ other partners, and defines common interfaces for checkout, identity linking, order management, and payment token exchange.

How payments work: Agents exchange payment tokens directly with your payment service provider via API. Everything is verified cryptographically.

## Agentic Commerce Matrix {#agentic-commerce-matrix}

|                      **Level of Readiness**                      |                                                                                **AI Assistant Platforms (ChatGPT, Gemini, Perplexity, Claude)**                                                                                 |                                                                                      **Agentic Browsers (Atlas, Comet)**                                                                                       |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Level 1: Make your existing site work for agents**             | AI assistants visit your website just like a person would. They read your pages and complete your checkout. Success depends on having clear information and simple processes. Remove barriers that block legitimate AI traffic. | These specialized browsers navigate your site more intelligently than traditional automation. They understand page structure better. They still need your site to be well-organized and consistent.            |
| **Level 2: Optimize your site for agents**                       | AI assistants work better when you add structured product information and simplify your checkout. You might create streamlined paths specifically for AI shoppers. This leads to more completed purchases.                      | These browsers benefit from enhanced page structure that clearly labels each element. Simplified flows designed for AI shoppers reduce errors and increase success rates. Both AI and human customers benefit. |
| **Level 3: Build specialized systems for agents (future state)** | AI assistants connect directly to your systems through dedicated channels. No webpage required. This enables faster transactions and richer product conversations. Industry standards are still maturing.                       | These browsers use emerging standards to interact efficiently with your specialized AI systems. Traditional webpage rendering becomes optional for many transactions. Focus on Levels 1 and 2 today.           |

## Where to focus now {#where-to-focus-now}

Start with **Level 1**. Make your current site accessible to agents. This protects your business while the market develops.

Move to **Level 2** when you see agent traffic growing. The investment pays off through potentially higher completion rates and fewer failed transactions.

**Level 3** will become more practical as standards mature and agent traffic justifies the investment.
