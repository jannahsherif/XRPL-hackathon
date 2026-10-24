# Level 1 Agentic Commerce - Enable Agent Support with Minimal Changes
source: https://developer.mastercard.com/merchant-cloud/documentation/tutorials-and-guides/agentic-commerce-guide/21/index.md

## Level 1 Agentic Commerce - Overview {#level-1-agentic-commerce---overview}

Level 1 requires minimal changes. Only a few actions are required to unlock agentic commerce.

Level 1 agentic commerce requires minimal changes to your existing infrastructure. Agents interact with your website exactly as human users do - navigating pages, filling forms, and completing checkout through your standard flows. Most of the changes needed for agentic commerce enablement are currently undertaken by network, the agents and the issuers. Your primary tasks are to remove barriers that block legitimate agent traffic and ensure your site communicates clearly with automated systems.
Warning: AI traffic to US retail sites has increased by **4,700%** YoY in July 2025 (Adobe data), and nearly **47% of US shoppers** already use AI agents for at least one shopping activity (Visa, April 2026). Every major payment network --- Mastercard, Visa, and American Express --- now has dedicated agentic commerce programs, and Visa forecasts millions of agent-initiated transactions by the 2026 holiday season. Acting now positions your site to capture this rapidly growing channel.

This section covers the essential steps to unlock agentic commerce on your existing site.

## Handling Payment Credentials with Tokenized Payments {#handling-payment-credentials-with-tokenized-payments}

Agents never handle raw payment credentials. Instead, they submit tokens---cryptographically secure representations of payment methods that cannot be reverse-engineered or reused fraudulently. All verified agents participating in Mastercard Agent Pay, Visa Intelligent Commerce, and American Express ACE use tokenization by default, even at Level 1.

### How Tokenized Payments Work {#how-tokenized-payments-work}

The tokenization flow operates transparently to your existing checkout infrastructure:

1. **Consumer authenticates with the agent platform**: The consumer authenticates with their agent platform (ChatGPT, Claude, Gemini) and authorizes the agent to make purchases on their behalf.

2. **Platform provisions a token**: The agent platform requests a token from the payment network. This token represents the consumer's payment method but contains no actual card data. Tokens are scoped --- they may be single-use, merchant-specific, or time-limited depending on the authorization.

3. **Agent submits the token at checkout**: When the agent completes your checkout form, it enters the token in standard payment fields. From your form's perspective, the token looks like a standard card number.

4. **Your processor handles detokenization**: Your payment processor or payment gateway receives the token and exchanges it with the payment network for the actual payment credentials. The transaction then processes through standard network flows.

### What This Means for Your Implementation {#what-this-means-for-your-implementation}

You do not need to modify your payment processing logic to accept tokenized credentials. Your existing checkout forms and payment gateway handle tokens transparently.

**Your checkout forms work as-is.** Tokens use the same format as standard card numbers. Your form validation, field formatting, and submission logic require no changes.

**The network manages detokenization.** The token-to-credential exchange happens at the payment network level before reaching the issuer.

**PCI scope remains unchanged.** Since you never receive raw card data --- only tokens --- your PCI compliance posture does not change. The tokenization layer adds security without adding compliance burden.

### Security Benefits {#security-benefits}

Tokenization protects all parties in the transaction:

|         Benefit          |                                          Description                                          |
|--------------------------|-----------------------------------------------------------------------------------------------|
| **Credential isolation** | Agents never access raw card numbers. Even a compromised agent yields no usable payment data. |
| **Scoped authorization** | Tokens can be limited by merchant, amount, or time window, reducing exposure from misuse.     |
| **Replay prevention**    | Single-use tokens cannot be captured and resubmitted by attackers.                            |
| **Reduced PCI scope**    | Merchants and agent platforms avoid handling sensitive card data directly.                    |

### Cards on File and Agentic Tokens {#cards-on-file-and-agentic-tokens}

AI Agents cannot use consumers' existing cards on file with merchants, even when logging a consumer into their merchant account. Using stored credentials would prevent card issuers from recognizing the transaction as agentic --- without an Agentic Token, the network cannot apply appropriate risk controls or identify the flow correctly.

This restriction protects all parties from negative transaction outcomes. The agents manage this limitation; merchants do not need to take any action.

## Authenticating Legitimate Agent Traffic {#authenticating-legitimate-agent-traffic}

Not every AI agent should have permission to make purchases on behalf of consumers. To address this, global payment networks --- Mastercard, Visa, and American Express --- have established certification programs that verify agents meet strict security and privacy standards before they can participate in agentic commerce.

### How Agent Certification Works {#how-agent-certification-works}

Agents must comply with the requirements of their target payment network --- Mastercard Agent Pay, Visa Intelligent Commerce (Trusted Agent Protocol), or American Express ACE --- before transacting. The certification process verifies that each agent:

* **Authenticates consumers properly**: The agent confirms the consumer's identity and obtains explicit authorization before initiating purchases.
* **Handles payment credentials securely**: The agent uses tokenized credentials and never accesses or stores raw card data.
* **Captures consumer intent accurately**: The agent records and transmits exactly what the consumer requested, including product details, quantities, and constraints.
* **Follows data privacy standards**: The agent complies with applicable privacy regulations and network data handling requirements.

Once an agent passes certification, the payment network adds it to a trusted agent registry. Your systems can query this registry --- either directly or through your edge provider --- to verify an agent's legitimacy before processing requests.

### What This Means for Your Implementation {#what-this-means-for-your-implementation-1}

Agent certification shifts the verification burden from merchants to the payment networks. You benefit from this framework without building your own agent vetting process.

**You can trust certified agents.** When you verify an agent against the trusted registry (via Web Bot Auth signatures), you confirm that:

* The agent has been vetted by the schemes
* The agent follows network rules and standards for agentic commerce
* The transaction carries the same protections as standard commerce

**Your fraud protections remain active.** Standard fraud detection, chargeback rights, and dispute resolution processes apply to agentic transactions. Certification adds a layer of trust; it does not replace your existing risk management.

**Consumer-owned agents will not have scheme credentials --- and that is expected.** Traffic from agents like OpenClaw, Agent Zero, or Hermes Agent will not carry Mastercard Agent Pay, Visa TAP, or Amex ACE headers. The absence of scheme credentials does not make this traffic malicious. These are real consumers using open-source tools to shop. Apply the same card-not-present security measures you use for any online transaction (3-D Secure, AVS, CVV verification) and avoid blocking agents solely because they lack scheme registration. See the **Consumer-Owned Agents and Untrusted Traffic** section in the Overview for your tiered trust strategy.
Note: Mastercard has completed live agentic transactions in multiple markets, including Thailand (with Krungthai Card), Latin America (with Santander), and is expanding across Asia-Pacific. Visa launched **Intelligent Commerce Connect** in April 2026, currently in pilot with partners including AWS and Highnote, with general availability targeted for June 2026. American Express ACE includes industry-first **Agent Purchase Protection** --- coverage for cardmembers against losses due to agent error when using registered AI agents. These are no longer theoretical frameworks; certified agent transactions are processing in production today.

### Emerging Trust Layer: Verifiable Intent {#emerging-trust-layer-verifiable-intent}

In March 2026, Mastercard open-sourced **[Verifiable Intent](https://verifiableintent.dev)** --- a cryptographic framework co-developed with Google that creates a tamper-resistant record linking:

1. The consumer's verified identity
2. The specific instructions given to the AI agent
3. The resulting transaction outcome

Verifiable Intent uses **selective disclosure** --- each party in the transaction (merchant, issuer, dispute resolver) receives only the minimum data they need. Built on open standards from FIDO Alliance, EMVCo, IETF, and W3C, this framework provides the "proof of intent" needed for dispute resolution and fraud management in agentic commerce.

While Verifiable Intent does not require merchant action at Level 1, understanding it helps you anticipate how agentic transaction disputes will be resolved. Partners integrating Verifiable Intent include Google, Fiserv, IBM, Checkout.com, Adyen, and Worldpay.

### Recognizing Certified Agents {#recognizing-certified-agents}

The following section explores how to identify legitimate agent traffic.

## Identifying Agent Traffic with Web Bot Auth {#identifying-agent-traffic-with-web-bot-auth}

Your systems need to distinguish legitimate AI agents from malicious bots, scrapers, and unauthorized automation. Web Bot Auth provides cryptographic verification that a request originates from a certified agent participating in Mastercard Agent Pay, Visa Intelligent Commerce, or other trusted platforms.

### Why Traditional Bot Detection Falls Short {#why-traditional-bot-detection-falls-short}

Most websites identify automated traffic using IP addresses, User-Agent headers, or reverse DNS lookups. These methods have significant limitations:

|         Method         |                               Limitation                                |
|------------------------|-------------------------------------------------------------------------|
| **IP allowlisting**    | Agents operate from dynamic cloud infrastructure; IPs change frequently |
| **User-Agent parsing** | Easily spoofed; no cryptographic assurance of identity                  |
| **Reverse DNS**        | Slow, unreliable, and not designed for real-time verification           |
| **CAPTCHA challenges** | Blocks legitimate agents along with malicious bots                      |

Web Bot Auth solves these problems by attaching cryptographically signed credentials to HTTP requests. Each signature proves the agent's identity, ensures message integrity, and prevents replay attacks.
Note: Web Bot Auth is now an **official IETF Working Group** (chartered October 2025), with backing from Cloudflare, Google, AWS, Akamai, Vercel, and GoDaddy. The main specification --- "HTTP Message Signatures for automated traffic Architecture" --- is on the IETF standards track, lending Web Bot Auth significant weight as an industry standard rather than a single-vendor initiative.

### How Web Bot Auth Works {#how-web-bot-auth-works}

Web Bot Auth builds on RFC 9421 (HTTP Message Signatures) to authenticate automated traffic. Certified agents sign their requests using private keys registered with payment network directories. Your systems verify these signatures against published public keys.

#### Key registration and validation flow: {#key-registration-and-validation-flow}

1. **Registration**: During onboarding, the agent creates a key pair and registers its public key in the appropriate key directory (e.g., Mastercard Agent Pay, Visa Intelligent Commerce, or another trusted directory).

2. **Signing**: For each HTTP request, the agent signs critical request components using its private key.

3. **Delivery** : The agent sends the request with signature headers: `Signature-Input`, and `Signature`.

4. **Verification**: Your edge provider or backend retrieves the agent's public key from the directory and validates the signature.

5. **Access**: Valid signatures confirm the agent is certified; invalid or missing signatures trigger your bot policy.

### Understanding the Signature Headers {#understanding-the-signature-headers}

A Web Bot Auth request includes headers that together provide verifiable proof of agent identity:

**`Signature-Input`**: Defines which request components are signed and includes security parameters:

| Parameter |                                            Purpose                                            |
|-----------|-----------------------------------------------------------------------------------------------|
| `keyid`   | Identifies the public key for signature verification                                          |
| `alg`     | Cryptographic algorithm (e.g., `ed25519`, `ecdsa-p256-sha256`)                                |
| `created` | Timestamp when the signature was generated                                                    |
| `expires` | Timestamp when the signature becomes invalid                                                  |
| `nonce`   | Unique value preventing replay attacks                                                        |
| `tag`     | Identifies the interaction type: `Agent-pay-auth`, `agent-browser-auth` or `agent-payer-auth` |

**`Signature`**: Contains the Base64-encoded cryptographic signature.

#### Example request {#example-request}

```http
GET /products/widget-pro HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0 ...
Signature-Agent: "https://agentpay-key-directory.mastercard.com/"
Signature-Input: sig1=("@authority" "@path");
    created=1735689600;
    expires=1735693200;
    keyid="poqkLGiymh_W0uP6PZFw-dvez3QJT5SolqXBCW38r0U";
    alg="ed25519";
    nonce="e8N7S2MFd/qrd6T2R3tdfAuuANngKI7LFtKYI/vowzk4lAZyadIX6wW25MwG7DCT9RUKAJ0qVkU0mEeLElW1qg==";
    tag="Agent-pay-auth"
Signature: sig1=:jdq0SqOwHdyHr9+r5jw3iYZH6aNGKijYp/EstF4RQTQdi5N5YYKrD+mCT1HA1nZDsi6nJKuHxUi/5Syp3rLWBA==:
```

Notice the `tag` value changes based on the interaction. Payment-network-certified agents use scheme-specific tags:

* **Mastercard Agent Pay** : `Agent-pay-auth`
* **Visa Intelligent Commerce** : `agent-browser-auth` (browsing) and `agent-payer-auth` (checkout)

Other authenticated agents that implement Web Bot Auth independently --- such as ChatGPT --- use the generic `web-bot-auth` tag. Your verification logic should check for both scheme-specific and generic tags to support the full range of legitimate agents.

### Implementing Verification {#implementing-verification}

You have two options for verifying Web Bot Auth signatures: edge-level filtering through your CDN, or backend verification in your application code.

#### Option 1: Edge-Level Verification (Recommended) {#option-1-edge-level-verification-recommended}

Edge providers like Cloudflare, Akamai, and Fastly support Web Bot Auth verification at the network edge. This approach offers several advantages:

* **No code changes**: Configure through your CDN dashboard
* **Low latency**: Verification happens before requests reach your origin
* **Scalability**: Edge infrastructure handles signature validation at scale
* **Centralized policy**: Manage bot rules alongside other edge security

**Configure your edge provider:**

1. Enable Web Bot Auth verification in your CDN's bot management settings
2. If not handled automatically, add the payment network key directories to your trusted sources
3. If not handled automatically, create rules that allow requests with valid `Agent-pay-auth`, `agent-browser-auth` or `agent-payer-auth` signatures
4. Set fallback behavior for unsigned requests (block, challenge, or allow with logging)

Contact your edge provider for specific configuration steps. Most major CDNs have published setup guides for Web Bot Auth.

#### Option 2: Backend Verification {#option-2-backend-verification}

If you need application-level control or your edge provider does not support Web Bot Auth, implement verification in your backend.

#### Using Node.js with the web-bot-auth library: {#using-nodejs-with-the-web-bot-auth-library}

```javascript
import { verifySignature, fetchPublicKey } from 'web-bot-auth';

async function verifyAgentRequest(request) {
  const signatureInput = request.headers['signature-input'];
  const signature = request.headers['signature'];
  const signatureAgent = request.headers['signature-agent'];

  // Check for required headers
  if (!signatureInput || !signature) {
    return { valid: false, reason: 'Missing signature headers' };
  }

  // Parse the signature input to extract parameters
  const params = parseSignatureInput(signatureInput);
  
  // Validate tag indicates agentic commerce
  if (!['agent-browser-auth', 'agent-payer-auth'].includes(params.tag)) {
    return { valid: false, reason: 'Invalid or missing tag' };
  }

  // Validate timestamps
  const now = Math.floor(Date.now() / 1000);
  if (params.created > now || params.expires < now) {
    return { valid: false, reason: 'Signature expired or not yet valid' };
  }
  
  if (params.expires - params.created > 480) { // 8 minutes
    return { valid: false, reason: 'Signature validity window too large' };
  }

  // Check nonce for replay (implement your own nonce store)
  if (await isNonceUsed(params.nonce)) {
    return { valid: false, reason: 'Replay detected' };
  }

  // Fetch public key from directory
  const publicKey = await fetchPublicKey(signatureAgent, params.keyid);
  if (!publicKey) {
    return { valid: false, reason: 'Public key not found' };
  }

  // Verify the signature
  const isValid = await verifySignature(request, signature, publicKey);
  
  if (isValid) {
    await recordNonce(params.nonce, params.expires);
  }

  return { valid: isValid, reason: isValid ? 'OK' : 'Invalid signature' };
}
```

Install the verification library:

```bash
npm install web-bot-auth
```

### Verification Steps Reference {#verification-steps-reference}

Follow this checklist when verifying agent signatures:

| Step |                                                        Action                                                        |           On Failure            |
|------|----------------------------------------------------------------------------------------------------------------------|---------------------------------|
| 1    | Check for `Signature-Input` with `Agent-pay-auth`, `agent-browser-auth` or `agent-payer-auth` tag                    | Apply non-agent bot policy      |
| 2    | Verify all required fields are present (`@authority`, `@path`, `created`, `keyid`, `expires`, `tag`, `alg`, `nonce`) | Block request                   |
| 3    | Validate `created` timestamp is in the past                                                                          | Block request                   |
| 4    | Validate `expires` timestamp is in the future                                                                        | Block request                   |
| 5    | Confirm `expires - created` ≤ 8 minutes                                                                              | Block request                   |
| 6    | Check nonce against recent nonces (8-minute window)                                                                  | Block request (replay detected) |
| 7    | Retrieve public key for `keyid` from directory                                                                       | Block request                   |
| 8    | Verify cryptographic signature                                                                                       | Block request                   |
| 9    | Record nonce with expiration time                                                                                    | ---                             |

### Replay Attack Protection {#replay-attack-protection}

Replay attacks occur when an attacker captures a valid signed request and resubmits it. Web Bot Auth prevents replay attacks through three mechanisms:

**Timestamps** : Every signature includes `created` and `expires` timestamps. Reject requests where:

* `created` is in the future
* `expires` is in the past
* The window between `created` and `expires` exceeds 8 minutes

**Nonces** : Each request includes a unique `nonce` value. Maintain a cache of seen nonces for the past 8 minutes. Reject any request with a previously seen nonce. For production systems, it is recommended to use a distributed cache like Redis with automatic TTL expiration

### Where to Validate Signatures {#where-to-validate-signatures}

Validate agent signatures at each touchpoint in the commerce journey:

|     Touchpoint      |               Tag Value                |                             Purpose                             |
|---------------------|----------------------------------------|-----------------------------------------------------------------|
| **Browsing**        | `Agent-pay-auth`, `agent-browser-auth` | Verify identity before granting catalog access                  |
| **Personalization** | `Agent-pay-auth`, `agent-browser-auth` | Confirm trusted agent before accepting consumer identity tokens |
| **Checkout**        | `Agent-pay-auth`, `agent-payer-auth`   | Ensure payment data comes from a verified agent                 |

### Building a Layered Identification Strategy {#building-a-layered-identification-strategy}

Web Bot Auth provides strong verification for certified agents, but not all legitimate agents implement it yet. Build a layered approach to agent identification:

#### Layer 1: Web Bot Auth signatures {#layer-1-web-bot-auth-signatures}

Check for valid signatures first. A verified signature confirms the agent is certified by Mastercard, Visa, or another trusted party. Major agent platforms --- including ChatGPT (via Agent Mode) --- have implemented Web Bot Auth, so most commercial agents can be identified this way.

#### Layer 2: Known agent patterns {#layer-2-known-agent-patterns}

Some agentic browsers or other legitimate bots can be identified through User-Agent strings or behavioral fingerprints before they adopt Web Bot Auth.

#### Layer 3: Behavioral analysis {#layer-3-behavioral-analysis}

Monitor request patterns, navigation flows, and interaction timing to distinguish legitimate automation from malicious bots.

**Progressive trust**: Remove friction progressively based on trust signals. A verified Web Bot Auth signature warrants the highest trust level. Known agent patterns warrant moderate trust. Unknown automation should receive standard bot treatment.

    ┌─────────────────────────────────────────────┐
    │           Incoming Request                  │
    └─────────────────┬───────────────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────────┐
    │  Has valid Web Bot Auth signature?          │
    │  (agent-browser-auth / agent-payer-auth)    │
    └───────┬─────────────────────────┬───────────┘
            │ Yes                     │ No
            ▼                         ▼
    ┌───────────────────┐   ┌─────────────────────┐
    │ HIGH TRUST        │   │ Known agent pattern?│
    │ Allow with full   │   │ (User-Agent, etc.)  │
    │ access            │   └───────┬─────────┬───┘
    └───────────────────┘           │ Yes     │ No
                                    ▼         ▼
                        ┌───────────────┐ ┌───────────────┐
                        │ MEDIUM TRUST  │ │ Apply standard│
                        │ Allow with    │ │ bot policy    │
                        │ monitoring    │ │               │
                        └───────────────┘ └───────────────┘

### Real-World Example: Verifying ChatGPT Agent Mode {#real-world-example-verifying-chatgpt-agent-mode}

Here is what a signed request from ChatGPT's Agent Mode (formerly OpenAI Operator) looks like in practice:

```json
{
  "Signature": "sig1=:OxtIqCmhbdHV9oNRn2rCmSaMJFC83CrzTsgC6CaULImrbish5S1h5PwO+8tSNGG8GzSHpRl/E/mgy5vKvuD0DQ==:",
  "Signature-Input": "sig1=(\"@authority\" \"@method\" \"@path\" \"signature-agent\");created=1754053298;keyid=\"otMqcjr17mGyruktGvJU8oojQTSMHlVm7uO-lrcqbdg\";expires=1754056898;nonce=\"...\";tag=\"web-bot-auth\";alg=\"ed25519\"",
  "Signature-Agent": "\"https://chatgpt.com\"",
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 ..."
}
```

The `keyid` value `otMqcjr17mGyruktGvJU8oojQTSMHlVm7uO-lrcqbdg` matches the public key published by OpenAI. The `Signature-Agent` header identifies ChatGPT as the source, and the signature covers the HTTP method, path, authority, and agent fields.

To verify the request, we'll use Cloudflare's web-bot-auth [Node.js](https://www.npmjs.com/package/web-bot-auth) library, which provides helpers for signature parsing and verification.

```javascript
import { verify, HTTP_MESSAGE_SIGNATURES_DIRECTORY } from 'web-bot-auth';

async function verifyChatGPTRequest(request) {
  // Step 1: Extract the Signature-Agent header to locate the key directory.
  // ChatGPT sets this to "https://chatgpt.com", which tells us where to
  // fetch the public keys needed for verification.
  const signatureAgent = request.headers.get('Signature-Agent');
  if (!signatureAgent) {
    return { verified: false, reason: 'Missing Signature-Agent header' };
  }

  // Step 2: Fetch the public key directory from the agent's domain.
  // The well-known path /.well-known/http-message-signatures-directory
  // returns a JSON object containing the agent's registered public keys.
  const agentUrl = JSON.parse(signatureAgent).replace(/\/$/, '');
  const directoryUrl = `${agentUrl}${HTTP_MESSAGE_SIGNATURES_DIRECTORY}`;
  const directoryResponse = await fetch(directoryUrl);
  const directory = await directoryResponse.json();

  // Step 3: Create a verifier callback. The web-bot-auth library calls this
  // after parsing and validating the signature metadata (timestamps, tag,
  // keyid presence). Our job is to look up the correct public key from the
  // directory and perform the cryptographic check.
  const verifier = async (data, signature, params) => {
    // Find the key matching the keyid from the Signature-Input header
    const key = directory.keys.find(k => k.kid === params.keyid);
    if (!key) {
      throw new Error(`Key ${params.keyid} not found in directory`);
    }

    // Import the Ed25519 public key for verification
    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      { kty: key.kty, crv: key.crv, x: key.x },
      { name: 'Ed25519' },
      true,
      ['verify']
    );

    const isValid = await crypto.subtle.verify(
      'Ed25519',
      cryptoKey,
      signature,
      new TextEncoder().encode(data)
    );

    if (!isValid) {
      throw new Error('Invalid signature');
    }
  };

  // Step 4: Call verify(). The library automatically validates that:
  //   - The tag is "web-bot-auth" (matching ChatGPT's generic tag)
  //   - The created timestamp is not in the future
  //   - The expires timestamp has not passed
  //   - A keyid is present
  // Then it invokes our verifier callback for the cryptographic check.
  try {
    await verify(request, verifier);
    return { verified: true, agent: agentUrl };
  } catch (error) {
    return { verified: false, reason: error.message };
  }
}
```

Note the difference in `tag` values: ChatGPT uses the generic `web-bot-auth` tag, while payment-network-certified agents use scheme-specific tags (`Agent-pay-auth` for Mastercard, `agent-browser-auth` / `agent-payer-auth` for Visa). The `web-bot-auth` library's `verify` function validates against the generic `web-bot-auth` tag by default. For scheme-specific tag verification, use the approach shown in the backend verification example earlier in this section.

## Authentication and 3-D Secure {#authentication-and-3-d-secure}

Authentication requirements shift significantly in agentic commerce. Agents assume responsibility for consumer verification, while merchants must adapt their 3-D Secure handling to accommodate current technical limitations.

### How Agents Handle Authentication {#how-agents-handle-authentication}

Certified agents manage consumer authentication before initiating any purchase. Leading implementations use **Payment Passkeys** (FIDO-based biometric authentication) to verify consumers, replacing traditional passwords and one-time codes with more secure, frictionless authentication. In jurisdictions requiring two-factor authentication (2FA) or Strong Customer Authentication (SCA), agents must:

* **Verify cardholder identity**: Agents confirm the consumer's identity through their platform's authentication mechanisms before initiating payment.
* **Obtain explicit authorization**: Agents capture consumer consent for each transaction, including the specific merchant, amount, and purchase details.
* **Secure future transactions**: For scheduled, recurring, or delayed purchases, agents obtain cardholder verification before facilitating the transaction - not at the time of execution.

This authentication model places the verification burden on agent providers. Your merchant systems do not need to implement additional authentication logic for agentic transactions.

### 3-D Secure Limitations {#3-d-secure-limitations}

EMV 3-D Secure (3DS) authentication has limited support for agentic transactions today, though this is actively evolving. When your checkout flow triggers a standard 3DS challenge for an agentic payment, the authentication attempt typically fails because the agent cannot complete the interactive challenge on behalf of the cardholder.

However, the landscape continues to evolve:

* **EMV 3DS v2.3** is rolling out with enhanced **decoupled authentication** support, allowing cardholders to authenticate out-of-band (e.g., via a push notification in their banking app) --- a model well suited to agentic flows
* **EMVCo is actively developing specifications** for agentic payments interoperability, extending 3DS, Secure Remote Commerce (SRC), and Payment Tokenization to accommodate agent-initiated transactions
* **FIDO authentication** support in 3DS v2.3 enables biometric/passkey-based verification that could integrate with agentic authentication flows

#### What this means for your implementation: {#what-this-means-for-your-implementation-2}

|          Scenario          |                      Expected Behavior                       |                            Recommended Action                            |
|----------------------------|--------------------------------------------------------------|--------------------------------------------------------------------------|
| 3DS challenge triggered    | Standard challenge fails; returns non-authenticated response | Detect agentic transactions and bypass standard 3DS challenge initiation |
| 3DS attempted anyway       | Transaction proceeds without authentication                  | Handle gracefully; do not treat as fraud signal                          |
| Decoupled 3DS              | Cardholder authenticates via banking app push notification   | Monitor issuer support for decoupled auth in agentic flows               |
| Future 3DS agentic support | EMVCo actively developing agentic payments specs             | Monitor scheme communications and EMVCo announcements                    |

### Merchant Actions {#merchant-actions}

Take the following steps to handle authentication in agentic transactions:

1. **Identify agentic traffic**: Use Web Bot Auth signatures (covered earlier) to detect when a request originates from a certified agent.

2. **Adjust 3DS logic**: When you identify an agentic transaction, either skip 3DS initiation or anticipate a non-authenticated response. Do not block the transaction based on 3DS failure alone.

3. **Maintain fraud controls**: Continue applying your standard fraud detection and risk scoring. The absence of 3DS authentication does not indicate elevated risk for verified agent transactions.

4. **Monitor for updates**: Payment networks and EMVCo are actively developing authentication solutions for agentic commerce. Watch for announcements from Mastercard Agent Pay, Visa Intelligent Commerce, and American Express ACE regarding 3DS support and decoupled authentication for agentic flows.

## Screen Scraping Compatibility {#screen-scraping-compatibility}

AI agents interact with your website using three primary approaches, and your site must support all of them to ensure reliable agentic commerce.

### How Agents "See" Your Website {#how-agents-see-your-website}

**Visual interpretation (screenshot-based)** : Agents like ChatGPT Agent Mode (formerly OpenAI Operator), Atlas browser, and Anthropic's Claude computer use, navigate by capturing screenshots and interpreting them visually using multimodal AI models. The agent captures the browser viewport as an image, identifies UI elements (buttons, form fields, links), and outputs actions with pixel coordinates --- essentially "seeing" the page as a human would. OpenAI describes this approach in their [Building ChatGPT Atlas](https://openai.com/index/building-chatgpt-atlas/) article:
> "Our computer use model expects a single image of the screen as input. But some UI elements, like `<select>` dropdowns, render outside the tab's bounds in separate windows. In agent mode, we composite those popups back into the main page image at the correct coordinates so the model sees the full context in one frame."

After each action, the agent captures a new screenshot to verify the result and plan its next step. This enables iterative, multi-step workflows but is slower and more computationally expensive than the other approaches.

**DOM parsing (HTML-based)** : Other agents parse your HTML directly and navigate the DOM programmatically --- using the same techniques as screen readers, search engine crawlers, and browser automation tools like Puppeteer or Playwright. The agent receives raw HTML, builds a tree of elements, and identifies interactive targets by analyzing `name`, `id`, `class`, `type`, and `autocomplete` attributes. This is fast and precise for well-structured pages, but fragile to DOM structure changes.

**Accessibility tree querying** : A growing number of agent tools --- including Vercel's [agent-browser](https://agent-browser.dev/) CLI and Playwright's MCP (Model Context Protocol) server --- interact with your site through the browser's **accessibility tree** rather than the raw DOM. The accessibility tree is a simplified, semantic representation of the page originally built for screen readers. It exposes interactive elements with their roles (button, textbox, link), accessible names (from `aria-label`, `<label>`, or text content), and states (expanded, checked, disabled) --- stripping away decorative elements and visual noise. Agent tools that use this approach assign each interactive element a **stable reference** (e.g., `@e1`, `@e2`) and interact through those references rather than CSS selectors, making interactions resilient to layout changes and CSS class renaming. Crucially, the accessibility tree is far more compact than the full DOM --- typically 200--400 tokens versus 3,000--5,000 for a full page --- making it dramatically more efficient for AI agents with limited context windows.

Most production agents combine multiple approaches: they may use the accessibility tree for navigation and form filling, the DOM for structured data extraction, and screenshots for visual verification. Your site must present clear, accessible content through all three channels.

|        Approach         |                                  How It Works                                   |          Token Cost          |         Resilience to Change         |                   Key Agents                    |
|-------------------------|---------------------------------------------------------------------------------|------------------------------|--------------------------------------|-------------------------------------------------|
| **Screenshot / Visual** | Vision model interprets rendered page images; acts via pixel coordinates        | Very High (image processing) | Medium-High (visual layout stable)   | ChatGPT Agent Mode, Atlas, Claude computer use  |
| **DOM Parsing**         | Parse raw HTML tree; target elements by tag, ID, class, attributes              | High (full HTML tree)        | Medium (breaks on structure changes) | Puppeteer, Playwright headless, search crawlers |
| **Accessibility Tree**  | Query semantic representation (roles, labels, states); interact via stable refs | Low (compact semantic tree)  | High (survives layout changes)       | Vercel agent-browser, Playwright MCP            |

### Why Compatibility Matters {#why-compatibility-matters}

Agents reading your site do not necessarily wait for it to execute complex JavaScript interactions. They expect critical commerce data - product names, prices, availability, and checkout fields - to be present in the initial HTML response or rendered quickly with minimal JavaScript execution. Sites that fail to meet this expectation experience:

* **Failed product discovery**: Agents cannot find or recommend products they cannot parse
* **Abandoned checkouts**: Complex dynamic forms cause agents to fail mid-transaction
* **Lost revenue**: Consumers using agents will shop elsewhere when your site proves incompatible

### Common Barriers That Block Agents {#common-barriers-that-block-agents}

Review your site for these compatibility issues:

|                  Barrier                  |                                                                   Impact                                                                   |                                                                                                                                                                                               Solution                                                                                                                                                                                               |
|-------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Client-side rendering (CSR) only**      | Critical content loads after JavaScript execution; DOM-based agents see empty pages                                                        | Implement server-side rendering (SSR) or static site generation (SSG)                                                                                                                                                                                                                                                                                                                                |
| **Infinite scroll without pagination**    | Agents cannot access products beyond the initial viewport                                                                                  | Provide paginated alternatives or ensure scroll triggers load content into the DOM                                                                                                                                                                                                                                                                                                                   |
| **Content behind user interactions**      | Product details hidden in tabs, accordions, or modals require clicks to reveal                                                             | Include essential information in the initial DOM; use progressive enhancement                                                                                                                                                                                                                                                                                                                        |
| **Heavy JavaScript frameworks**           | Slow rendering delays content availability for both visual and DOM-based agents                                                            | Optimize bundle sizes; implement code splitting; prioritize critical content                                                                                                                                                                                                                                                                                                                         |
| **Dynamic pricing and availability**      | Prices injected via JavaScript may not render before agents attempt to read them                                                           | Include base pricing in HTML; use progressive enhancement for real-time updates                                                                                                                                                                                                                                                                                                                      |
| **Complex hover or gesture interactions** | Screenshot-based agents cannot trigger hover states or multi-touch gestures                                                                | Ensure critical information and actions are accessible via standard clicks                                                                                                                                                                                                                                                                                                                           |
| **Poor or missing ARIA attributes**       | Accessibility-tree-based agents see a sparse, unhelpful representation of the page; interactive elements lack identifiable names and roles | Add `aria-label` to all interactive elements; use semantic HTML (`<button>`, `<input>`, `<select>`) instead of custom div-based widgets. See the [Use Semantic HTML and Basic ARIA Labels](https://developer.mastercard.com/merchant-cloud/documentation/tutorials-and-guides/agentic-commerce-guide/21/index.md#use-semantic-html-and-basic-aria-labels) section below for implementation guidance. |

### Ensure Critical Content Renders Correctly {#ensure-critical-content-renders-correctly}

Agents access your pages through HTTP requests and expect the response to contain usable content. Verify that your server returns complete HTML for these critical elements:

**Product pages must include:**

* Product name and description
* Price (including sale prices and currency)
* Availability status
* Primary product images (with descriptive `alt` text)
* Add-to-cart functionality

**Category and search pages must include:**

* Product listings with names, prices, and availability
* Pagination controls
* Filter and sort options (functional without JavaScript)

**Checkout pages must include:**

* Form fields with proper labels
* Order summary
* Shipping and payment options
* Return policy, terms of service, and other critical legal documents

Test your pages using browser developer tools with JavaScript disabled or tools like `curl` to verify critical content appears in the raw HTML response. Any information missing from the server-rendered HTML can effectively be invisible to agents.

## Ensuring Agents Can Read Your Site {#ensuring-agents-can-read-your-site}

Most merchants assume that if a page renders correctly for a human visitor, AI agents can read it too. In practice, this assumption is frequently wrong. Agents rely on fetch pipelines --- HTTP clients, HTML parsers, content extractors --- that can be tripped up by common web development patterns. An agent may report that it has read a page, but its internal view of the content can be incomplete, garbled, or entirely empty.

The [Agent Reading Test](https://agentreadingtest.com/), designed by Zachary Carey, exposes exactly where these breakdowns occur. It uses a series of canary tokens --- unique strings hidden across 10 different web page challenges --- to prove which parts of a page an agent actually receives. Each challenge targets a specific failure mode that occurs in real-world websites. Run the test with any AI agent and you will likely see it struggle --- most agents score well below the maximum of 20 points. The failures it reveals are the same issues that prevent agents from reading your product pages, parsing your checkout forms, and completing purchases on your site.

### Common Agent Reading Failure Modes {#common-agent-reading-failure-modes}

The following failure modes are drawn from the Agent Reading Test and reflect real issues observed across production websites. Each represents a pattern that can silently prevent agents from reading your site content.

|             Failure Mode              |                                                                                                                                       What Happens                                                                                                                                        |                                                                                                                                                                              Merchant Action                                                                                                                                                                              |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Content truncation**                | Agents have context window limits for their initial fetch. Content placed deep in a long page --- beyond 75K or 130K characters --- may never be read. Critical commerce information buried at the bottom of lengthy pages is effectively invisible.                                      | Keep critical commerce content (product name, price, availability, add-to-cart) near the top of the page source. Paginate long content rather than relying on single long pages.                                                                                                                                                                                          |
| **Boilerplate burial**                | Massive amounts of inline CSS or JavaScript before the actual page content (sometimes 80K+ characters of styling code) cause agents to exhaust their context window before reaching any meaningful content. The agent may conclude the page is empty.                                     | Externalize CSS and JavaScript into separate files. Keep inline styles and scripts minimal. Ensure your `<body>` content starts as early as possible in the HTML source.                                                                                                                                                                                                  |
| **Client-side rendering (SPA shell)** | Single-page applications where content only appears after JavaScript executes leave agents looking at an empty loading spinner or shell. Many agent fetch tools do not execute JavaScript.                                                                                                | Implement server-side rendering (SSR) or static site generation (SSG) so that critical content is present in the initial HTML response. See the [Screen Scraping Compatibility](https://developer.mastercard.com/merchant-cloud/documentation/tutorials-and-guides/agentic-commerce-guide/21/index.md#screen-scraping-compatibility) section above for detailed guidance. |
| **Tabbed and hidden content**         | Product information hidden behind tabs, accordions, or language switchers requires user interaction to reveal. Agents that scrape only the first visible tab miss all other content --- including potentially critical details like specifications, sizing, or compatibility information. | Include all essential product information in the initial DOM. Use progressive enhancement so that tabs organize content visually, but the underlying HTML contains everything.                                                                                                                                                                                            |
| **Broken markup**                     | Unclosed HTML tags, broken markdown fences, or malformed code can swallow all subsequent page content. Everything after the broken element becomes invisible to the agent's parser.                                                                                                       | Validate your HTML regularly using tools like the [W3C Markup Validator](https://validator.w3.org/). Run linting in your CI/CD pipeline. Fix unclosed tags, unclosed quotes, and malformed elements.                                                                                                                                                                      |
| **Navigation chrome burial**          | Heavy navigation bars, sidebars, mega-menus, and promotional banners push the actual page content far down the DOM. Agents with limited context windows may process only the navigation elements and never reach the product content.                                                     | Use semantic HTML elements like `<main>` and `<article>` to clearly delineate primary content. Add skip-navigation links. Keep navigation markup as lean as possible.                                                                                                                                                                                                     |
| **Cross-host redirects**              | Many agent fetch tools do not follow HTTP 301 redirects that point to a different hostname. The agent sees the redirect response but never fetches the final destination.                                                                                                                 | Minimize redirects in your site architecture. Where redirects are necessary, keep them on the same host. Avoid chains of multiple redirects.                                                                                                                                                                                                                              |
| **Soft 404 pages**                    | A server returning HTTP 200 OK for a page that displays "page not found" content confuses agents into treating the error page as valid product content.                                                                                                                                   | Return correct HTTP status codes. Pages that do not exist should return 404. Permanent moves should return 301. Never serve error content with a 200 status code.                                                                                                                                                                                                         |
| **Content negotiation gaps**          | When a server offers both HTML and alternative formats (such as markdown or plain text) at the same URL, agents may not request the most structured or complete version.                                                                                                                  | Consider serving machine-friendly formats (markdown, plain text, or structured JSON) via content negotiation when agent user-agents are detected. Ensure the HTML version contains all critical information regardless.                                                                                                                                                   |

## Form Field Optimization {#form-field-optimization}

AI agents fill out your checkout forms programmatically by analyzing HTML structure, field names, labels, and attributes. Clear, semantic form markup enables agents to identify fields correctly and complete transactions successfully. Poorly structured forms cause agents to enter data in wrong fields, skip required information or abandon checkout entirely.

### Why Form Structure Matters for Agents {#why-form-structure-matters-for-agents}

Agents parse your forms differently than humans read them. While humans interpret visual layout and contextual cues, agents rely on:

* **Field names and IDs** : The `name` and `id` attributes tell agents what data each field expects
* **Labels** : Properly associated `<label>` elements provide semantic meaning
* **Input types** : The `type` attribute indicates data format (email, tel, number)
* **Autocomplete attributes** : The `autocomplete` attribute maps fields to standard data categories

When these elements are missing, inconsistent, or misleading, agents must guess field purposes based on position or surrounding text --- a process prone to errors.

### Use Semantic Field Names and IDs {#use-semantic-field-names-and-ids}

Choose field names that clearly describe their purpose. Agents match these names against known patterns to determine what data to enter.

#### Recommended naming conventions: {#recommended-naming-conventions}

|  Field Purpose  |               Recommended Names               |             Avoid             |
|-----------------|-----------------------------------------------|-------------------------------|
| Email address   | `email`, `customer-email`, `billing-email`    | `field1`, `input_23`, `e`     |
| Phone number    | `phone`, `telephone`, `mobile`                | `contact`, `number`, `ph`     |
| First name      | `first-name`, `given-name`, `fname`           | `name1`, `n1`, `customer_1`   |
| Last name       | `last-name`, `family-name`, `lname`           | `name2`, `n2`, `customer_2`   |
| Street address  | `street-address`, `address-line1`, `address1` | `addr`, `line1`, `field_addr` |
| City            | `city`, `locality`, `address-city`            | `loc`, `c`, `field_city`      |
| Postal code     | `postal-code`, `zip`, `zipcode`               | `code`, `pc`, `field_zip`     |
| Card number     | `card-number`, `cc-number`, `cardnumber`      | `payment`, `cc`, `num`        |
| Expiration date | `cc-exp`, `expiry`, `card-expiry`             | `date`, `exp`, `d`            |
| CVV/CVC         | `cc-csc`, `cvv`, `security-code`              | `code`, `sec`, `c`            |

### Associate Labels Correctly {#associate-labels-correctly}

Every form field must have a properly associated label. Agents use labels to understand field purpose when names are ambiguous.

#### Use explicit label association: {#use-explicit-label-association}

```html
<!-- Correct: Label explicitly associated via 'for' attribute -->
<label for="billing-email">Email Address</label>
<input type="email" id="billing-email" name="email" autocomplete="email">

<!-- Correct: Label wraps the input (implicit association) -->
<label>
  Email Address
  <input type="email" name="email" autocomplete="email">
</label>
```

#### Avoid disconnected labels: {#avoid-disconnected-labels}

```html
<!-- Incorrect: No association between label and input -->
<span class="label-text">Email Address</span>
<input type="email" name="email">

<!-- Incorrect: Placeholder is not a substitute for labels -->
<input type="email" name="email" placeholder="Email Address">
```

### Specify Input Types {#specify-input-types}

Use the correct `type` attribute to indicate expected data format. This helps agents validate data before submission and select appropriate input methods.

```html
<!-- Email field with email type -->
<input type="email" name="email" autocomplete="email">

<!-- Phone field with tel type -->
<input type="tel" name="phone" autocomplete="tel">

<!-- Numeric fields -->
<input type="text" inputmode="numeric" name="card-number" autocomplete="cc-number">
<input type="text" inputmode="numeric" name="postal-code" autocomplete="postal-code">
```

### Add Autocomplete Attributes {#add-autocomplete-attributes}

The `autocomplete` attribute maps form fields to standardized data categories defined in the HTML specification. Agents recognize these values and can fill fields accurately even when other markup is unclear.

#### Payment form example with autocomplete: {#payment-form-example-with-autocomplete}

```html
<form id="checkout-form" method="post">
  <!-- Billing information -->
  <input type="text" name="name" autocomplete="name" aria-label="Full name">
  <input type="email" name="email" autocomplete="email" aria-label="Email address">
  <input type="tel" name="phone" autocomplete="tel" aria-label="Phone number">
  
  <!-- Billing address -->
  <input type="text" name="address1" autocomplete="billing address-line1" aria-label="Street address">
  <input type="text" name="address2" autocomplete="billing address-line2" aria-label="Apartment, suite, etc.">
  <input type="text" name="city" autocomplete="billing address-level2" aria-label="City">
  <input type="text" name="state" autocomplete="billing address-level1" aria-label="State or province">
  <input type="text" name="postal" autocomplete="billing postal-code" aria-label="Postal code">
  <select name="country" autocomplete="billing country">
    <option value="US">United States</option>
    <!-- Additional countries -->
  </select>
  
  <!-- Payment details -->
  <input type="text" name="cardnumber" autocomplete="cc-number" aria-label="Card number">
  <input type="text" name="cardname" autocomplete="cc-name" aria-label="Name on card">
  <input type="text" name="expiry" autocomplete="cc-exp" aria-label="Expiration date">
  <input type="text" name="cvc" autocomplete="cc-csc" aria-label="Security code">
</form>
```

#### Common autocomplete values for commerce: {#common-autocomplete-values-for-commerce}

|      Value       |           Purpose            |
|------------------|------------------------------|
| `name`           | Full name                    |
| `given-name`     | First name                   |
| `family-name`    | Last name                    |
| `email`          | Email address                |
| `tel`            | Telephone number             |
| `address-line1`  | Street address               |
| `address-line2`  | Apartment, unit, building    |
| `address-level2` | City                         |
| `address-level1` | State, province, region      |
| `postal-code`    | ZIP or postal code           |
| `country`        | Country code                 |
| `cc-number`      | Payment card number          |
| `cc-name`        | Name on payment card         |
| `cc-exp`         | Card expiration date         |
| `cc-exp-month`   | Card expiration month        |
| `cc-exp-year`    | Card expiration year         |
| `cc-csc`         | Card security code (CVV/CVC) |

Prefix address fields with `billing` or `shipping` to distinguish between address types (e.g., `billing postal-code`, `shipping address-line1`).

### Avoid Common Anti-Patterns {#avoid-common-anti-patterns}

These patterns frequently cause agent failures:

|               Anti-Pattern                |                                     Problem                                     |                          Solution                           |
|-------------------------------------------|---------------------------------------------------------------------------------|-------------------------------------------------------------|
| **Custom input components**               | Agents cannot interact with non-standard elements                               | Use native `<input>`, `<select>`, and `<textarea>` elements |
| **Split fields without clear structure**  | Multiple inputs for single values (e.g., three fields for phone) confuse agents | Use single fields or group with `fieldset` and clear labels |
| **Hidden required fields**                | Fields revealed by JavaScript may not be visible to agents                      | Include all required fields in initial DOM                  |
| **Dynamic field IDs**                     | IDs like `input_a7x9k2` change between sessions                                 | Use stable, semantic IDs                                    |
| **Placeholder-only labels**               | Placeholders disappear on input and are not reliably parsed as labels           | Always include visible `<label>` elements                   |
| **CSS-hidden labels**                     | Labels hidden with `display: none` may be ignored                               | Use `sr-only` class that keeps labels accessible            |
| **Inline validation blocking submission** | Aggressive validation prevents form submission                                  | Allow submission; return clear errors                       |

### Structure Multi-Step Checkouts Clearly {#structure-multi-step-checkouts-clearly}

For multi-step checkout flows, ensure each step is clearly structured:

```html
<!-- Step indicator -->
<nav aria-label="Checkout progress">
  <ol>
    <li aria-current="step">Shipping</li>
    <li>Payment</li>
    <li>Review</li>
  </ol>
</nav>

<!-- Current step form -->
<form id="shipping-form" aria-labelledby="shipping-heading">
  <h2 id="shipping-heading">Shipping Information</h2>
  
  <!-- Form fields with proper labels and autocomplete -->
  
  <button type="submit">Continue to Payment</button>
</form>
```

### Provide Clear Error Messages {#provide-clear-error-messages}

When validation fails, return specific, actionable error messages that agents can parse:

```html
<!-- Associate errors with specific fields -->
<label for="email">Email Address</label>
<input type="email" id="email" name="email" aria-describedby="email-error" aria-invalid="true">
<span id="email-error" class="error" role="alert">Enter a valid email address (e.g., name@example.com)</span>

<!-- Label explicitly tied to input -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" autocomplete="email" required aria-invalid="false" aria-errormessage="email-error" aria-describedby="email-hint"/>

<!-- Optional hint, always available -->
<p id="email-hint" class="hint">This is the email we will send the order confirmation to (e.g., name@example.com)</p>

<!-- Error message -->
<p id="email-error" class="error" role="alert"> Enter a valid email address (e.g., name@example.com)</p>
```

#### Error message best practices: {#error-message-best-practices}

* Associate errors with specific fields using `aria-errormessage`
* Mark invalid fields with `aria-invalid="true"`
* Use `role="alert"` to announce errors to assistive technologies
* Provide specific guidance on how to fix the error
* Return error details in a structured format for programmatic parsing

### Test Form Compatibility {#test-form-compatibility}

Verify your forms work correctly with automated tools:

1. **Disable JavaScript**: Load your checkout page with JavaScript disabled. Confirm all form fields are present and properly labeled.

2. **Use browser autofill**: Test your forms with browser autofill. If browsers struggle to fill fields correctly, agents may too.

3. **Inspect HTML structure**: Review the raw HTML source. Verify labels are properly associated, autocomplete attributes are present, and field names are semantic.

4. **Test with automation tools**: Use tools like Puppeteer or Playwright to simulate form filling. Identify fields that fail programmatic interaction.

5. **Check render timing**: Use browser developer tools to measure time-to-content. Agents may timeout if critical content takes too long to render.

### Form Optimization Checklist {#form-optimization-checklist}

Use this checklist to verify your forms are agent-ready:

|                      Requirement                      | Verified |
|-------------------------------------------------------|----------|
| All fields have semantic `name` attributes            | ☐        |
| All fields have associated `<label>` elements         | ☐        |
| All fields have appropriate `autocomplete` attributes | ☐        |
| Input `type` attributes match expected data           | ☐        |
| Native HTML form elements used (no custom components) | ☐        |
| Error messages associated with specific fields        | ☐        |
| Form functions without JavaScript                     | ☐        |
| Field IDs are stable across sessions                  | ☐        |
| Multi-step flows have clear navigation                | ☐        |
| Browser autofill works correctly                      | ☐        |

## Use Semantic HTML and Basic ARIA Labels {#use-semantic-html-and-basic-aria-labels}

A growing number of AI agents --- including ChatGPT Atlas, Vercel's agent-browser, and Playwright MCP --- interact with your site through the browser's **accessibility tree** rather than raw HTML. The accessibility tree is a compact, semantic representation of your page that exposes each interactive element's role, name, and state. When your elements lack accessible names, these agents cannot reliably identify or interact with them.

You do not need to implement the full range of ARIA attributes at Level 1. Focus on these two foundational practices that enable accessibility-tree-based agents to work with your existing site.

### Add `aria-label` to Interactive Elements {#add-aria-label-to-interactive-elements}

Every button, link, form field, and dropdown should have a clear accessible name. For form fields with associated `<label>` elements (covered in the Form Field Optimization section above), the label provides the accessible name automatically. For elements without visible text --- icon buttons, image links, or custom controls --- add an explicit `aria-label`:

```html
<!-- Icon button: aria-label provides the accessible name -->
<button aria-label="Add to cart">
  <svg>...</svg>
</button>

<!-- Image link: aria-label clarifies the destination -->
<a href="/wishlist" aria-label="View wishlist">
  <img src="heart-icon.svg" alt="">
</a>

<!-- Form fields with labels already have accessible names -->
<label for="email">Email Address</label>
<input type="email" id="email" name="email" autocomplete="email">
```

When accessibility-tree-based agents visit your page, each labeled element appears as a named, actionable target. Without these names, the element is anonymous or invisible to the agent.

### Use Semantic HTML5 Elements {#use-semantic-html5-elements}

Wrap your page content in semantic HTML5 elements so agents can distinguish primary content from navigation, headers, and sidebars:

|   Element   |                 Purpose                  |                  Agent Benefit                   |
|-------------|------------------------------------------|--------------------------------------------------|
| `<main>`    | Primary page content                     | Agents skip navigation and focus on core content |
| `<nav>`     | Navigation links                         | Agents identify and skip navigation blocks       |
| `<article>` | Self-contained content (product, review) | Identifies discrete content units                |
| `<section>` | Thematic grouping with a heading         | Organizes related content logically              |
| `<header>`  | Introductory content                     | Distinguishes headers from body content          |
| `<footer>`  | Footer content                           | Identifies supplementary information             |

These elements require no additional attributes --- they carry implicit ARIA roles that agents recognize automatically. If your site already follows web accessibility best practices, you likely have these in place.
Tip: **Level 2 builds on this foundation.** The Level 2 section covers advanced ARIA attributes (`aria-expanded`, `aria-live`, `aria-selected`, `aria-invalid`) for richer agent interactions, along with detailed implementation checklists and testing guidance.
