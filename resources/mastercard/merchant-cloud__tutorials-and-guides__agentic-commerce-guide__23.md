# Level 3 Agentic Commerce - Advanced Programmatic Checkout
source: https://developer.mastercard.com/merchant-cloud/documentation/tutorials-and-guides/agentic-commerce-guide/23/index.md

## Level 3 Agentic Commerce - Overview {#level-3-agentic-commerce---overview}

> **Evolving Guidance**: This section describes capabilities that are maturing rapidly. Several protocols and products discussed here --- including Google's Universal Commerce Protocol (UCP), Mastercard's Verifiable Intent, and payment network agentic payment systems --- are now live or in advanced standardization. However, the ecosystem remains dynamic and subject to change. We recommend building on your Level 1 and Level 2 foundations before pursuing Level 3 integrations, and monitoring payment network communications for the latest implementation guidance.

## Why Programmatic Checkout Matters {#why-programmatic-checkout-matters}

Levels 1 and 2 rely on agents navigating your existing web interfaces---parsing HTML, filling forms, and interacting with pages designed for human users. While effective, this approach introduces friction:

|           Challenge            |                                                   Impact                                                    |
|--------------------------------|-------------------------------------------------------------------------------------------------------------|
| **Bot detection conflicts**    | Agents must navigate CAPTCHAs, rate limiters, and anti-automation measures designed to block malicious bots |
| **Screen scraping fragility**  | Page layout changes can break agent workflows without warning                                               |
| **Parsing overhead**           | Agents spend computational resources extracting structured data from unstructured HTML                      |
| **Inconsistent success rates** | Complex JavaScript interactions and dynamic content cause unpredictable failures                            |

Level 3 eliminates these barriers by providing interfaces purpose-built for machine consumption. Instead of scraping web pages, agents interact directly with structured APIs, exchange payment credentials programmatically, and negotiate purchases through standardized protocols.

## What Level 3 Enables {#what-level-3-enables}

A fully programmatic checkout architecture provides:

* **Dedicated agentic endpoints**: APIs optimized for product discovery, inventory queries, and transaction processing
* **Intent negotiation**: Structured protocols for agents to communicate consumer preferences, constraints, and purchase authorization
* **Direct credential exchange**: Payment tokens flow through API calls rather than form submissions, reducing parsing errors and PCI scope complexity
* **Higher reliability**: Purpose-built interfaces eliminate the fragility of screen scraping

## Current State and Expectations {#current-state-and-expectations}

While agents can scrape existing web interfaces to gather merchant, product, and service information, AI output quality improves significantly when you provide data in machine-readable, AI-optimized formats.

Merchants, marketplaces, and merchant service providers gain measurable value by offering interfaces specifically designed for agentic commerce. When you direct agents to use dedicated interfaces---through `robots.txt` instructions, `agents.txt` declarations, or other discovery mechanisms --- certified agents are expected to use those interfaces for browsing, validating intent, and completing transactions.

The Mastercard Agent Pay Acceptance Framework provides detailed specifications for these concepts as they mature. Monitor payment network communications for updates on standardized protocols and implementation timelines.

## Technical Architecture {#technical-architecture}

A Level 3 implementation replaces web-based interactions with purpose-built machine interfaces. This architecture includes four core components: product discovery, intent validation, cart operations, and payment processing. Optionally consider endpoints for post-purchase operations. The implementation will likely involve a combination of agentic API endpoints, MCP server capabilities, and agent-to-agent communication (e.g., A2A). Each component serves a specific role in enabling reliable, high-throughput agent transactions.

### Agentic API Endpoints {#agentic-api-endpoints}

Design dedicated REST API endpoints that agents can query directly without rendering HTML. These endpoints return structured JSON responses optimized for machine consumption.

#### Conceptual endpoint structure: {#conceptual-endpoint-structure}

```javascript
// filepath: conceptual-api-structure.js
// Agentic Commerce API - Conceptual Structure

// Product Discovery
GET  /api/v1/agentic/products              // Browse catalog with filters and search
GET  /api/v1/agentic/products/{sku}        // Retrieve product details

// Cart Operations
POST   /api/v1/agentic/cart              // Create cart (returns cart_id)
PUT    /api/v1/agentic/cart/{id}         // Update cart (add/remove items)
GET    /api/v1/agentic/cart/{id}         // Retrieve cart contents
DELETE /api/v1/agentic/cart/{id}         // Cancel or abandon cart

// Transaction Processing
POST /api/v1/agentic/checkout              // Complete transaction
GET  /api/v1/agentic/order/{id}            // Query order status

// Post-Purchase Operations (optional)
POST /api/v1/agentic/returns               // Initiate return process
GET  /api/v1/agentic/support               // Access customer support resources
```

**Document your endpoints using OpenAPI/Swagger specifications.** It is well known that agents are exceptional at consuming machine-readable API definitions and writing code to call those APIs. This enables agents to discover and understand your API programmatically. Reference your OpenAPI specification in `robots.txt` and `agents.txt` to facilitate agent discovery.

### Agent Authorization Flow {#agent-authorization-flow}

When a consumer has credentials for your site, delegate API access to their agent using OAuth 2.1. This approach lets consumers control what agents can do on their behalf while keeping credentials secure.

#### Authorization flow: {#authorization-flow}

1. **Consumer authenticates** with your site using their existing credentials (username/password, SSO, passkey)
2. **Consumer authorizes the agent** by granting scoped permissions through your OAuth consent screen
3. **Your authorization server issues an access token** to the agent with limited scope and expiry
4. **Agent includes the token** in API requests via the `Authorization` header
5. **Your API validates the token** and enforces scope restrictions on each request

#### Scoped permissions to consider: {#scoped-permissions-to-consider}

|       Scope        |                  Capabilities Granted                  | Risk Level |
|--------------------|--------------------------------------------------------|------------|
| `browse`           | Read product catalog, check inventory, view prices     | Low        |
| `cart:write`       | Create and modify shopping baskets                     | Low        |
| `cart:read`        | View basket contents                                   | Low        |
| `checkout`         | Complete purchases using agent-provided payment tokens | High       |
| `orders:read`      | View order history and status                          | Medium     |
| `profile:read`     | Access saved addresses and preferences                 | Medium     |
| `returns:initiate` | Start return or refund requests                        | High       |
| `returns:read`     | View return status and history                         | Medium     |

### MCP Server Implementation {#mcp-server-implementation}

MCP (Model Context Protocol) servers provide a standardized interface for agents to discover and interact with your commerce capabilities. An MCP server exposes your business logic as callable tools that agents can invoke directly.

An MCP server can build upon your agentic API endpoints, wrapping them in tool definitions that specify input and output schemas. This allows agents to call your commerce functions with minimal overhead.
Tip: **MCP Server vs. WebMCP** : Server-side MCP (covered here) and browser-native WebMCP (covered in the Level 2 section) are complementary. WebMCP lets you expose tools through your existing web pages via `navigator.modelContext`, while MCP servers provide dedicated server-side tool endpoints for deeper integration. Many tool definitions can be reused across both approaches. Start with WebMCP for Level 2 optimization, then add a server-side MCP implementation as you mature toward Level 3.

#### MCP server manifest example: {#mcp-server-manifest-example}

```javascript
// Example MCP Tool Definitions for Agentic Commerce. Directional and conceptual only.

import { z } from 'zod';

// Product Discovery Tools
server.registerTool(
  'search-products',
  {
    title: 'Product Search',
    description: 'Search product catalog by keyword, category, or attributes',
    inputSchema: {
      query: z.string().optional(),
      category: z.string().optional(),
      price_max: z.number().optional(),
      in_stock_only: z.boolean().default(true)
    },
    outputSchema: {
      products: z.array(z.object({
        sku: z.string(),
        name: z.string(),
        price: z.number(),
        currency: z.string(),
        in_stock: z.boolean()
      })),
      total_results: z.number()
    }
  },
  async ({ query, category, price_max, in_stock_only }) => {
    // Fetch products from catalog based on search criteria
  }
);

server.registerTool(
  'get-product-details',
  {
    title: 'Product Details',
    description: 'Retrieve complete product information including availability and variants',
    inputSchema: {
      sku: z.string()
    },
    outputSchema: {
      sku: z.string(),
      name: z.string(),
      description: z.string(),
      price: z.number(),
      currency: z.string(),
      in_stock: z.boolean(),
      quantity_available: z.number(),
      variants: z.array(z.object({
        sku: z.string(),
        attributes: z.record(z.string())
      })).optional()
    }
  },
  async ({ sku }) => {
    // Fetch product details from catalog
  }
);

// Cart Operations Tools
server.registerTool(
  'create-cart',
  {
    title: 'Create Cart',
    description: 'Create a new shopping cart and return cart identifier',
    inputSchema: {
      currency: z.string().optional().default('USD')
    },
    outputSchema: {
      cart_id: z.string(),
      created_at: z.string()
    }
  },
  async () => {
    // Initialize new cart session
  }
);

server.registerTool(
  'add-to-cart',
  {
    title: 'Add to Cart',
    description: 'Add product to existing cart',
    inputSchema: {
      cart_id: z.string(),
      sku: z.string(),
      quantity: z.number().int().positive(),
      shipping_address: z.object({
        recipient_name: z.string(),
        address_line1: z.string(),
        address_line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postal_code: z.string(),
        country: z.string()
      }).optional(),
      selected_fulfillment: z.object({
        method: z.enum(['standard', 'express', 'overnight', 'pickup']),
        pickup_location_id: z.string().optional().describe('Required when method is pickup')
      }).optional(),
    },
    outputSchema: {
      cart_id: z.string(),
      items: z.array(z.object({
        sku: z.string(),
        quantity: z.number(),
        unit_price: z.number()
      })),
      subtotal: z.number(),
      taxes: z.number(),
      order_total: z.number(),
      fulfillment_options: z.array(z.object({
        method: z.enum(['standard', 'express', 'overnight', 'pickup']),
        estimated_delivery: z.string(),
        cost: z.number()
      }))
    }
  },
  async ({ cart_id, sku, quantity }) => {
    // Add item to cart
  }
);

// Checkout Tool
server.registerTool(
  'create-checkout',
  {
    title: 'Create Checkout',
    description: 'Initiate checkout with cart, payment token and verified intent. Intent must be validated before processing payment.',
    inputSchema: {
      cart_id: z.string(),
      intent: z.object({
        intentId: z.string().describe('Mastercard-generated unique identifier for the intent'),
        intentSummary: z.string().describe('Agent-generated text summarizing consumer instructions'),
        orders: z.array(z.object({
          orderId: z.string().describe('Mastercard-generated unique order identifier'),
          orderExecutionType: z.enum(['IMMEDIATE', 'DEFERRED']),
          orderExpiry: z.number().describe('UTC epoch seconds when authorization expires'),
          orderTotalAmount: z.object({
            amount: z.string(),
            currency: z.string()
          }),
          items: z.array(z.object({
            itemId: z.string().describe('SKU or merchant-provided ID'),
            itemName: z.string(),
            itemDescription: z.string().optional(),
            itemUnitPrice: z.object({
              amount: z.string(),
              currency: z.string()
            }),
            itemQuantity: z.number().int().positive(),
            itemDeliveryMethod: z.enum(['SHIPPING', 'PICKUP', 'DIGITAL']),
            itemUrl: z.string().url().optional(),
            itemImageUrl: z.string().url().optional(),
            itemMetadata: z.record(z.string()).optional().describe('Additional attributes like size, color, weight')
          })),
          merchants: z.array(z.object({
            srcDpaId: z.string().describe('Mastercard-generated unique merchant identifier'),
            merchantName: z.string(),
            merchantUrl: z.string().url().optional()
          })),
          orderDeliveryDetails: z.object({
            recipientName: z.string(),
            addressLine1: z.string(),
            addressLine2: z.string().optional(),
            city: z.string(),
            state: z.string(),
            postalCode: z.string(),
            country: z.string(),
            contactEmail: z.string().email().optional(),
            contactPhone: z.string().optional()
          }).optional()
        }))
      }).describe('Consumer purchase intent registered with Mastercard Intent API'),
      payment_token: z.object({
        type: z.enum(['network_token', 'cryptogram', 'device_token']),
        cryptogram: z.string().optional().describe('One-time dynamic security code for transaction authentication'),
      }),
    },
    outputSchema: {
      order_id: z.string(),
      status: z.enum(['completed', 'pending', 'failed', 'requires_action']),
      total: z.number(),
      currency: z.string(),
      intent_validation: z.object({
        intentId: z.string(),
        validated: z.boolean(),
        validation_errors: z.array(z.string()).optional()
      }).describe('Result of intent validation against cart contents')
    }
  },
  async ({ cart_id, intent, payment_token }) => {
    // Validate intent before processing checkout
    // Compare cart contents against intent orders and items
    // Process checkout with provided details
  }
);

// Additional tools for order tracking, returns, etc. can be defined similarly
```

#### Current MCP status and considerations: {#current-mcp-status-and-considerations}

MCP is now governed by the **Agentic AI Foundation (AAIF)**, a Linux Foundation initiative backed by Anthropic, OpenAI, Google, Microsoft, AWS, Block, and Cloudflare. The protocol has reached massive scale --- over 97 million monthly SDK downloads and 10,000+ public MCP servers --- and is integrated into Claude, ChatGPT, Gemini, Microsoft Copilot, and VS Code.

|         Consideration          |                                                                   Current Status                                                                   |                                                                    Action                                                                    |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| **Discovery**                  | Registry and catalog support is on the 2026 roadmap (not yet standardized). Currently, agents must be configured with your MCP server URL manually | Distribute your MCP server URL through your channels; monitor AAIF registry developments                                                     |
| **Authentication**             | OAuth 2.1 has official support in the MCP specification                                                                                            | Implement OAuth 2.1 flow per MCP protocol specification                                                                                      |
| **Context window consumption** | Tool definitions and responses consume LLM context                                                                                                 | Keep tool descriptions concise and paginate large responses; offer agentic endpoint alternatives for agents with code execution capabilities |
| **Evolving specification**     | MCP protocol is under active development with formal governance (AAIF technical steering committees, RFC/voting processes)                         | Monitor specification updates via AAIF; version your implementation                                                                          |
| **Scalability**                | The 2026 roadmap prioritizes stateless transport (SEP-1442) for horizontal scaling behind load balancers                                           | Design implementations with stateless request handling in mind                                                                               |

### Universal Commerce Protocol (UCP) {#universal-commerce-protocol-ucp}

Google's **Universal Commerce Protocol (UCP)** is an open-source, cross-platform standard for agentic commerce released in January 2026. Co-developed with over 20 partners --- including Shopify, Walmart, Target, Wayfair, Etsy, Mastercard, Visa, Stripe, American Express, and Adyen --- UCP addresses the "N × N integration problem" by providing a single protocol that enables merchants to integrate once and support agents across multiple AI platforms.

UCP defines common interfaces for:

|         Interface          |                                   Purpose                                    |
|----------------------------|------------------------------------------------------------------------------|
| **Checkout**               | Standardized checkout flows for agent-initiated purchases                    |
| **Identity Linking**       | OAuth 2.0-based account linking for loyalty, preferences, and member pricing |
| **Order Management**       | Post-purchase tracking, modifications, and returns                           |
| **Payment Token Exchange** | Secure credential exchange between agents, merchants, and payment networks   |

#### UCP provides two checkout modes: {#ucp-provides-two-checkout-modes}

* **Native checkout**: The AI platform handles the checkout UI, offering a streamlined experience within the agent interface. Best for straightforward transactions.
* **Embedded checkout**: The merchant maintains a custom checkout flow (via IFrame), preserving branded experiences and complex checkout logic. Best for merchants with differentiated checkout experiences.

#### Why UCP matters for Level 3: {#why-ucp-matters-for-level-3}

UCP is directly aligned with the Level 3 vision of purpose-built machine interfaces. Rather than building proprietary agentic APIs from scratch, merchants can implement UCP-compliant endpoints that work across Google Gemini, and potentially other AI platforms that adopt the open standard. UCP interoperates with MCP (for agent-to-tool connections), A2A (for agent-to-agent communication), and Google's Agent Payments Protocol (AP2) for payment flows.

**Current availability:** UCP-powered agentic checkout is live for eligible US merchants on Google AI Mode in Search and the Gemini app, with international expansion planned throughout 2026.

|        Resource        |                                                                              URL                                                                              |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| UCP Developer Guide    | [developers.google.com/merchant/ucp](https://developers.google.com/merchant/ucp/)                                                                             |
| UCP Specification      | [ucp.dev](https://ucp.dev/)                                                                                                                                   |
| Google Developers Blog | [developers.googleblog.com/under-the-hood-universal-commerce-protocol-ucp](https://developers.googleblog.com/under-the-hood-universal-commerce-protocol-ucp/) |

Tip: **Consider UCP alongside custom APIs and MCP.** For merchants with Google ecosystem presence, UCP may provide a faster path to Level 3 capabilities than building bespoke agentic endpoints. UCP, MCP, and custom REST APIs are complementary approaches --- you may implement multiple based on which agent platforms your customers use.

### The Emerging Protocol Ecosystem {#the-emerging-protocol-ecosystem}

Level 3 agentic commerce is supported by a rapidly maturing ecosystem of complementary protocols. Understanding how these protocols relate to each other helps inform your implementation strategy:

|                Protocol                 |                        Role                        |              Developer              |                          Status                          |
|-----------------------------------------|----------------------------------------------------|-------------------------------------|----------------------------------------------------------|
| **MCP** (Model Context Protocol)        | Agent ↔ Tool/Data connectivity                     | Anthropic → AAIF (Linux Foundation) | Production; 97M+ monthly SDK downloads                   |
| **A2A** (Agent-to-Agent)                | Agent ↔ Agent interoperability                     | Google                              | Production; 50+ enterprise launch partners               |
| **UCP** (Universal Commerce Protocol)   | Standardized commerce flows                        | Google + 20 partners                | Live for US merchants                                    |
| **ACP** (Agentic Commerce Protocol)     | ChatGPT commerce integration                       | OpenAI + Stripe                     | Active; pivoted to retailer app model                    |
| **AP2** (Agent Payments Protocol)       | Agent-initiated payment flows                      | Google                              | Active; works alongside UCP and A2A                      |
| **MPP** (Machine Payments Protocol)     | Machine-to-machine payments                        | Stripe                              | Active                                                   |
| **Web Bot Auth**                        | Cryptographic agent identity verification          | IETF Working Group                  | Nearing standards-track; IESG review expected April 2026 |
| **WebMCP** (Web Model Context Protocol) | Browser-native tool exposure for agent interaction | Google + Microsoft (W3C incubation) | Early preview; Chrome 146+ Canary                        |

**Infrastructure platforms** also play an increasingly important role: **Amazon Bedrock AgentCore** provides serverless orchestration for building production AI agents with persistent memory, identity controls, and composable blueprints for retail, travel, and B2B commerce. Visa Intelligent Commerce is available as APIs and blueprints within AgentCore.

## Intent Capture and Validation {#intent-capture-and-validation}

In agentic commerce, ensuring alignment between consumer instructions and agent actions is critical. The intent provides a mechanism for agents to capture, register, and transmit consumer purchase instructions in a structured format that merchants and issuers can validate.

### Why Intent Matters {#why-intent-matters}

Intent data captures exactly what the consumer authorized the agent to purchase. This data serves multiple purposes:

|           Purpose            |                              Benefit                               |
|------------------------------|--------------------------------------------------------------------|
| **Transaction verification** | Merchants can compare cart contents against consumer authorization |
| **Fraud prevention**         | Issuers can validate that transactions match registered intent     |
| **Dispute resolution**       | Intent records provide evidence of consumer authorization          |
| **Agent accuracy**           | Merchants can challenge agents when intent validation fails        |

### How Intent Works {#how-intent-works}

When a consumer instructs an agent to make a purchase, the agent captures the consumer's instructions in the intent:

1. **Agent captures intent**: The agent records product details, merchant information, budget constraints, and purchase conditions
2. **Mastercard registers intent** : The Intent API validates and stores the intent, returning an `intentId`
3. **Agent receives credentials**: Mastercard returns tokenized payment credentials alongside the intent record
4. **Agent transmits intent at checkout**: The agent includes the intent object when submitting payment to the merchant
5. **Merchant validates intent**: The merchant verifies the intent signature and compares order details against the intent

### Intent Data Structure {#intent-data-structure}

Each intent object contains one or more orders, each representing a purchase from a specific merchant:

#### Intent object - key elements: {#intent-object---key-elements}

|            Field            |                         Description                          |
|-----------------------------|--------------------------------------------------------------|
| `intentId`                  | Mastercard-generated unique identifier for the intent        |
| `intentSummary`             | Agent-generated text summarizing the consumer's instructions |
| `intentStatus`              | Current status of the intent (dynamically updated)           |
| `orders`                    | List of orders under this intent, each linked to a merchant  |
| `consumer`                  | Identifier for the consumer who authorized the intent        |
| `digitalAccountCredentials` | Tokenized credentials for fulfilling checkouts               |

#### Order object - key elements: {#order-object---key-elements}

|         Field          |                            Description                             |
|------------------------|--------------------------------------------------------------------|
| `orderId`              | Mastercard-generated unique order identifier within the intent     |
| `orderExecutionType`   | Defines execution timing: `IMMEDIATE` or `DEFERRED`                |
| `orderStatus`          | Current status of the order                                        |
| `orderExpiry`          | Timestamp when the order authorization expires (UTC epoch seconds) |
| `orderTotalAmount`     | Total order amount including items, shipping, tax, and discounts   |
| `items`                | List of items to be purchased                                      |
| `merchants`            | Merchant designated to fulfill the order                           |
| `orderDeliveryDetails` | Delivery address and contact information                           |

#### Item object - key elements: {#item-object---key-elements}

|        Field         |                          Description                          |
|----------------------|---------------------------------------------------------------|
| `itemId`             | Unique identifier (SKU or merchant-provided ID)               |
| `itemName`           | Product name from merchant or extracted by agent              |
| `itemDescription`    | Product description                                           |
| `itemUnitPrice`      | Price per unit before tax and shipping                        |
| `itemQuantity`       | Number of units                                               |
| `itemDeliveryMethod` | Fulfillment method: shipping, pickup, or digital delivery     |
| `itemUrl`            | URL of the product page                                       |
| `itemImageUrl`       | URL of the product image                                      |
| `itemMetadata`       | Additional attributes (size, color, weight) and terms of sale |

#### Merchant object - key elements: {#merchant-object---key-elements}

|       Field       |                   Description                   |
|-------------------|-------------------------------------------------|
| `srcDpaId`        | Mastercard-generated unique merchant identifier |
| `merchantName`    | Display name of the merchant                    |
| `merchantUrl`     | URL of the merchant's online store              |
| `merchantLogoUrl` | URL of the merchant's logo                      |

### Validating Intent at Checkout {#validating-intent-at-checkout}

When an agent submits a checkout request with an intent, you must validate the intent before processing payment:

1. Validate the intent signature (see Intent Validation section above)
2. Verify the intent status is `ACTIVE`
3. Confirm the intent has not expired
4. Check that your merchant identifier matches the intent's merchant specification

Then, cross-reference the checkout payload against the intent:

|         Check         |                           Action on Mismatch                            |
|-----------------------|-------------------------------------------------------------------------|
| **Total amount**      | Reject if checkout total exceeds `orderTotalAmount`                     |
| **Merchant identity** | Reject if your `srcDpaId` differs from intent specification             |
| **Product SKUs**      | Flag for review if items differ from intent `items` list                |
| **Quantities**        | Flag for review if quantities exceed intent specification               |
| **Shipping address**  | Flag for review if delivery address differs from `orderDeliveryDetails` |
| **Shipping time**     | Flag for review if delivery timeframe differs from intent               |

When intent validation fails, you have options:

* **Reject the checkout**: Return an error indicating the specific validation failure
* **Challenge the agent**: If your interface supports it, request additional context from the agent
* **Escalate to consumer**: For deferred orders, require the agent to explicitly obtain consumer confirmation before proceeding

### Intent for Immediate vs. Deferred Orders {#intent-for-immediate-vs-deferred-orders}

Intent validation differs based on order execution type:

#### Immediate orders (agent-assisted commerce): {#immediate-orders-agent-assisted-commerce}

* Consumer is present during the transaction
* Validate that cart contents match the intent exactly
* Process the transaction if validation succeeds

#### Deferred orders (autonomous agentic commerce): {#deferred-orders-autonomous-agentic-commerce}

* Consumer authorized the purchase in advance
* Determine whether the intent provides sufficient consent
* Consider requiring explicit consumer confirmation for high-value transactions

### Verifiable Intent --- Cryptographic Trust Layer {#verifiable-intent--cryptographic-trust-layer}

In March 2026, Mastercard and Google co-released **Verifiable Intent** --- an open-source cryptographic framework that adds a tamper-resistant audit trail to intent data. This framework addresses a critical challenge in agentic commerce: proving that a transaction was explicitly authorized by the consumer and faithfully executed by the agent.

#### What Verifiable Intent provides: {#what-verifiable-intent-provides}

|        Capability        |                                                                     Description                                                                     |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| **Cryptographic proof**  | Links the consumer's verified identity, the agent's original instructions, and the transaction outcome in a tamper-evident chain                    |
| **Selective disclosure** | Each party (consumer, merchant, issuer) sees only the minimum data needed for their role --- privacy by design                                      |
| **Protocol agnostic**    | Works with Google's Agent Payments Protocol (AP2), Universal Commerce Protocol (UCP), OpenAI's Agentic Commerce Protocol (ACP), and other protocols |
| **Standards-based**      | Built on FIDO Alliance, EMVCo, IETF, and W3C standards                                                                                              |

#### How Verifiable Intent strengthens your validation: {#how-verifiable-intent-strengthens-your-validation}

Verifiable Intent augments the intent validation described above by providing cryptographic signatures that merchants and issuers can independently verify. When an agent submits checkout with a Verifiable Intent-signed intent object, you can:

1. Verify the cryptographic signature to confirm the intent has not been altered since the consumer authorized it
2. Use selective disclosure to access only the fields relevant to your validation (e.g., order amounts, merchant identity) without receiving unnecessary consumer data
3. Store the signed intent as non-repudiable evidence for dispute resolution

The specification is open source under Apache-2.0 license and available at [verifiableintent.dev](https://verifiableintent.dev) and on [GitHub](https://github.com/agent-intent/verifiable-intent).

## Payment Processing {#payment-processing}

In Level 3, agents submit cryptographic payment tokens directly through your agentic API endpoints rather than filling web forms. Your transaction processing endpoint must support enhanced security features to verify agent and consumer authenticity before completing the purchase.

### How Level 3 Payment Processing Differs {#how-level-3-payment-processing-differs}

|           Aspect            |                    Level 1 \& 2                    |                    Level 3                     |
|-----------------------------|----------------------------------------------------|------------------------------------------------|
| **Token submission**        | Agent fills form fields with tokenized credentials | Agent submits tokens via API request body      |
| **Credential verification** | Hash comparison against form-submitted values      | Direct validation of payment object in request |
| **Intent validation**       | Optional verification against captured intent      | Required validation before checkout proceeds   |
| **Security binding**        | Payment container linked to message signature      | Payment token bound to verified intent ID      |

### Required Validation Steps {#required-validation-steps}

Before processing any Level 3 checkout request, validate these elements:

#### Step 1: Verify agent identity {#step-1-verify-agent-identity}

Validate the Web Bot Auth signature on the incoming request. Confirm the agent is certified and the request has not been tampered with. See the Level 1 documentation for complete signature verification procedures.
> **Note:** Web Bot Auth is progressing through the IETF standards process --- the main draft specification is expected for IESG review by April 30, 2026. The protocol uses RFC 9421 (HTTP Message Signatures) with Ed25519 cryptographic signatures and is supported by Cloudflare, Google, AWS, Akamai, Vercel, and GoDaddy. Amazon Bedrock AgentCore already uses Web Bot Auth to authenticate agents and bypass CAPTCHAs for verified bots.

#### Step 2: Validate the intent {#step-2-validate-the-intent}

See the Intent Validation section above.

Reject the checkout if intent validation fails. Do not process payments against invalid, expired, or missing intents.

#### Step 3: Validate the payment token {#step-3-validate-the-payment-token}

Verify the cryptographic payment token included in the checkout request:

1. **Check required fields** : Verify the payment object contains all mandatory fields (`paymentToken`, `expirationMonth`, `expirationYear`, `dynamicData` if applicable)

2. **Validate nonce binding**: If a message signature was present, confirm the nonce in the payment object matches the nonce from the message signature headers

3. **Retrieve the public key** : Fetch the public key for the `kid` field from the payment network's key directory

4. **Build the signature base string**: Create a canonical representation of all fields in the payment object (excluding the signature itself) in the order received

5. **Verify the signature**: Use your cryptographic library to validate the signature against the base string and public key

If signature validation fails, the payment object may have been tampered with. Do not process the payment.

### Payment Object Structure {#payment-object-structure}

The payment object structure varies by payment network:

#### Mastercard Agent Pay: {#mastercard-agent-pay}

Tokenized payload containing DSRP cryptogram and card metadata. The cryptogram provides one-time dynamic security data for transaction authentication without increasing PCI scope.

#### Visa Intelligent Commerce: {#visa-intelligent-commerce}

Encrypted payload containing:

|         Field          |                       Description                        |
|------------------------|----------------------------------------------------------|
| `paymentToken`         | Network token representing the consumer's payment method |
| `expirationMonth`      | Token expiration month                                   |
| `expirationYear`       | Token expiration year                                    |
| `cardholderName`       | Name on the payment method                               |
| `dynamicData`          | One-time cryptogram for transaction authentication       |
| `shippingAddress`      | Delivery address object                                  |
| `billingAddress`       | Billing address object                                   |
| `consumerEmailAddress` | Consumer's email for order confirmation                  |

The payload is encrypted using the merchant's public key when the payment network knows the exact processing method.

#### American Express ACE (Agentic Commerce Experiences): {#american-express-ace-agentic-commerce-experiences}

Launched April 2026, the ACE Developer Kit provides five core services for agent-initiated transactions on the American Express network:

|         Service         |                                          Description                                           |
|-------------------------|------------------------------------------------------------------------------------------------|
| **Agent Registration**  | Register and verify AI agents authorized to transact on the Amex network                       |
| **Account Enablement**  | Cardmembers link cards with AI agents and personalize agentic experiences                      |
| **Intent Intelligence** | Capture and validate purchase intent for authentication, authorization, and dispute resolution |
| **Payment Credentials** | Tokenized, secure payment execution by registered agents                                       |
| **Cart Context**        | Share shopping cart details for transaction validation (under development)                     |

American Express also introduced **Agent Purchase Protection** --- an industry-first program that covers eligible cardmembers against losses due to AI agent errors when using registered agents. This protection, combined with Amex's closed-loop network structure, provides enhanced dispute management and fraud reduction for agent-initiated transactions.

#### Multi-Protocol Payment Integration --- Visa Intelligent Commerce Connect: {#multi-protocol-payment-integration--visa-intelligent-commerce-connect}

In April 2026, Visa launched **Intelligent Commerce Connect** --- a network-, protocol-, and token vault-agnostic gateway that simplifies multi-protocol agentic payment acceptance. With a single integration through the Visa Acceptance Platform, merchants can process agent-initiated payments across:

* Visa Trusted Agent Protocol (TAP)
* Stripe Machine Payments Protocol (MPP)
* OpenAI Agentic Commerce Protocol (ACP)
* Google Universal Commerce Protocol (UCP)
* Crypto-native agent payments (e.g., Coinbase x402)

Intelligent Commerce Connect supports both Visa and non-Visa cards and manages PCI compliance on behalf of merchants. This approach addresses a key Level 3 challenge: as the protocol ecosystem diversifies, merchants need a way to accept agent payments without implementing each protocol independently.

## Visibility Across the Payment Ecosystem {#visibility-across-the-payment-ecosystem}

Beyond secure payment exchange, Level 3 implementations benefit from enhanced visibility throughout the transaction lifecycle. Payment networks are building systems to share transaction intent data with all ecosystem participants.

### What Visibility Enables {#what-visibility-enables}

When a transaction is flagged as agent-initiated, every participant in the payment chain gains context:

|     Participant      |                          Visibility Benefit                           |
|----------------------|-----------------------------------------------------------------------|
| **Merchants**        | Verify basket contents against consumer intent; detect manipulation   |
| **Issuers**          | Apply agentic-specific authorization logic; validate consumer consent |
| **Payment networks** | Monitor agent behavior; enforce certification requirements            |
| **Consumers**        | Review agent actions; dispute unauthorized transactions               |

### How Visibility Works {#how-visibility-works}

Both Mastercard and Visa implement systems that flag agent-initiated transactions:

1. **Transaction tagging**: Agent-initiated transactions carry metadata identifying the certified agent
2. **Intent transmission**: Consumer intent data flows alongside payment credentials
3. **Ecosystem awareness**: All parties can see that an agent was involved and access the original consumer instructions

This visibility creates a new layer of trust. Merchants can verify that purchases match consumer intent. Issuers can apply appropriate risk controls. Consumers retain full visibility into agent actions.

### Benefits for Merchants {#benefits-for-merchants}

With intent data available at checkout, you can:

* **Verify basket contents**: Compare what the agent is purchasing against what the consumer authorized
* **Detect manipulation**: Identify if an agent has been compromised (e.g., prompt injection attacks causing unauthorized purchases)
* **Improve success rates**: Understand consumer constraints and preferences to guide agents toward successful completion
* **Manage risk**: Apply dynamic risk scoring based on how well the transaction matches stated intent
* **Resolve disputes**: Use intent records as evidence when handling chargebacks

Tip: **Learn more:** Consult the [Mastercard Agent Pay Acceptance Framework](https://www.mastercard.com/global/en/business/artificial-intelligence/mastercard-agent-pay.html) for the complete Intent API specification and implementation details.

## ChatGPT Shopping and the Agentic Commerce Protocol {#chatgpt-shopping-and-the-agentic-commerce-protocol}

> **Important Update (March 2026):** OpenAI discontinued ChatGPT Instant Checkout in March 2026. The Agentic Commerce Protocol (ACP) continues to evolve but has pivoted from direct in-chat purchases to powering retailer app integrations. This section has been updated to reflect the current state and the lessons learned from the first major Level 3 implementation attempt.

### Background: The Rise and Discontinuation of Instant Checkout {#background-the-rise-and-discontinuation-of-instant-checkout}

In September 2025, OpenAI launched **Instant Checkout** --- allowing US ChatGPT users to purchase products directly within conversations without leaving the chat interface. This was the first production-level attempt at fully programmatic, in-agent checkout.

**Why Instant Checkout was discontinued:**

|             Challenge             |                                                                                             Outcome                                                                                              |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Merchant onboarding**           | Only approximately a dozen merchants successfully onboarded out of millions, due to complex technical integration requirements (real-time inventory sync, payment integration, fraud prevention) |
| **Data freshness**                | Maintaining up-to-date pricing, inventory, and shipping data at scale proved more difficult than anticipated, leading to stale product information and transaction errors                        |
| **User behavior**                 | While users valued ChatGPT for product research and comparison, the majority preferred completing purchases through familiar, trusted merchant checkout flows                                    |
| **Platform-specific integration** | The bespoke integration model required dedicated API development that worked only with ChatGPT, creating a poor return on investment for merchants                                               |

These challenges highlight core Level 3 difficulties: building universal checkout infrastructure across diverse merchant backends, maintaining real-time data accuracy, and establishing consumer trust in novel purchase flows.

### ChatGPT's Current Commerce Model {#chatgpts-current-commerce-model}

ChatGPT (with a large and rapidly growing user base) now functions as a **consideration engine** for commerce:

1. **Product discovery**: Consumers research, compare, and select products within ChatGPT conversations
2. **Recommendation**: ChatGPT surfaces relevant products ranked by feed quality --- product titles, images, descriptions, prices, and real-time availability determine visibility (not paid ads or bidding)
3. **Handoff to merchant**: Consumers are routed to the merchant's own website or integrated retailer app (e.g., Walmart, Instacart, Target, Expedia) to complete checkout and payment

This model preserves the merchant's control over the checkout experience, customer relationship, and payment processing while leveraging ChatGPT's reach for product discovery.

### What Is the Agentic Commerce Protocol? {#what-is-the-agentic-commerce-protocol}

The Agentic Commerce Protocol (ACP) is an open standard co-developed by OpenAI and Stripe (with PayPal support). ACP continues to serve as the technical backbone for AI-assisted commerce in the ChatGPT ecosystem, though its scope has evolved:

#### Current ACP model: {#current-acp-model}

|         Aspect         |                                                                                                Description                                                                                                |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Integration model**  | Merchants provide structured product feeds; transactions complete through retailer apps or merchant websites --- not directly within the ChatGPT chat interface                                           |
| **Product feeds**      | CSV, JSON, TSV, or XML feeds with product data (identifiers, descriptions, pricing, inventory, media); updates supported as frequently as every 15 minutes                                                |
| **Retailer apps**      | Major retailers (Walmart, Instacart, Target, Expedia, Booking.com) have built branded shopping experiences within ChatGPT using ACP, with account linking and native checkout in the retailer environment |
| **Monetization**       | Merchants pay for traffic and discovery, not for per-transaction fees (changed from the original 4% Instant Checkout model)                                                                               |
| **Merchant of record** | Merchant retains full ownership of customer relationship, checkout, and fulfillment                                                                                                                       |

**Key integrations:** Shopify (automatic product surfacing), Walmart (branded ChatGPT app with account linking and loyalty), Target, Sephora, Nordstrom, Best Buy, The Home Depot, Wayfair.

### Lessons for Level 3 Implementation {#lessons-for-level-3-implementation}

The Instant Checkout experience provides valuable insights for any Level 3 programmatic checkout initiative:

|              Lesson               |                                                                                                                                   Implication                                                                                                                                   |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Universal checkout is hard**    | Building a single checkout flow that works across diverse merchant backends, payment providers, and product types requires significant infrastructure. Industry protocols like UCP and payment network standards may provide more viable paths than platform-specific solutions |
| **Data freshness is critical**    | Real-time inventory and pricing synchronization must be robust. Stale data erodes trust and increases failed transactions                                                                                                                                                       |
| **Consumer trust takes time**     | Users prefer familiar checkout flows. New purchase experiences need time, proven security, and clear consumer protections (like Amex's Agent Purchase Protection) to gain adoption                                                                                              |
| **Discovery has immediate value** | Even without in-agent checkout, optimizing for AI-powered product discovery delivers measurable traffic and conversion benefits                                                                                                                                                 |

### What Merchants Should Do Today {#what-merchants-should-do-today}

Rather than building direct ChatGPT checkout integrations, focus on:

1. **Product feed optimization**: Provide high-quality structured product data through ACP feeds. Feed quality (not advertising spend) determines product visibility in ChatGPT
2. **Level 1 and 2 readiness**: Ensure your existing checkout flow is navigable by ChatGPT's browsing capabilities (Level 1) and your structured data is optimized for accurate product representation (Level 2)
3. **Retailer app partnerships**: If you sell through major retailers, those retailers' ChatGPT app integrations already surface your products
4. **Monitor cross-platform protocols**: Evaluate UCP, MCP, and payment network protocols (Mastercard Agent Pay, Visa Intelligent Commerce, Amex ACE) as they mature --- these offer cross-platform Level 3 capabilities

### Technical Resources {#technical-resources}

|            Resource            |                                                URL                                                 |
|--------------------------------|----------------------------------------------------------------------------------------------------|
| Agentic Commerce Protocol Spec | [agenticcommerce.dev](https://agenticcommerce.dev)                                                 |
| GitHub Repository              | [github.com/openai/agentic-commerce-protocol](https://github.com/openai/agentic-commerce-protocol) |
| OpenAI Documentation           | [openai.com/index/agentic-commerce-protocol](https://openai.com/index/agentic-commerce-protocol/)  |

