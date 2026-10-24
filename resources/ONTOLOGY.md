# Agentic Payments Stack: Rough Ontology

A first-pass map of the concepts in the hackathon resources: Mastercard Agent Pay, AWS Bedrock AgentCore and Strands Agents. Built from the READMEs in [raw/](raw/) and the page captures in [pages/](pages/). It is rough: names follow the vendor docs, and relations marked `?` are inferred.

## 1. Layers

```
┌──────────────────────────────────────────────────────────────────────┐
│ L5  Developer tooling   AgentCore CLI · Agent Toolkit for AWS ·      │
│                         Mastercard Agent Toolkit (MCP) · Strands CLI │
├──────────────────────────────────────────────────────────────────────┤
│ L4  Agent framework     Strands Agents SDK (py/ts) · Harness ·       │
│                         Tools · Plugins · Hooks · Multi-agent        │
├──────────────────────────────────────────────────────────────────────┤
│ L3  Agent platform      Bedrock AgentCore: Runtime · Gateway ·       │
│                         Memory · Identity · Policy · Observability · │
│                         Code Interpreter · Browser · Eval · Payments │
├──────────────────────────────────────────────────────────────────────┤
│ L2  Trust & payment     KYA · Agentic Token · Verifiable Intent ·    │
│     protocols           Web Bot Auth · x402 · MPP · AP2 · ACP        │
├──────────────────────────────────────────────────────────────────────┤
│ L1  Settlement rails    Card network · Bank accounts · Stablecoins / │
│                         blockchains (Base, Solana, Polygon, XRPL?)   │
├──────────────────────────────────────────────────────────────────────┤
│ ⟂  Safety (cross-cut)   Strands Box · Strands Shell · Dogwood/Cedar  │
│                         policy · PaymentSession limits · Guardrails  │
└──────────────────────────────────────────────────────────────────────┘
```

## 2. Core classes

### Actors
| Class | Definition | Examples |
|---|---|---|
| `Principal` | A human or organization that delegates authority | consumer, business operator |
| `Agent` | Software acting for a Principal. Model + system prompt + tools | Strands `Agent`, AgentCore Harness |
| `AgentPlatform` | Hosts or builds agents and registers them for payments | AgentCore, Claude, ChatGPT |
| `Merchant` / `ServiceProvider` | Sells goods, APIs, data or content to agents | x402-paywalled API, MCP server |
| `Issuer` | Bank that issues the Principal's card | — |
| `Acquirer` / `Processor` | Merchant-side payment handling | Adyen, Stripe, Checkout.com |
| `WalletProvider` | Custodies keys and signs payments | Coinbase CDP, Stripe Privy |
| `Network` | Clears and settles | Mastercard, a blockchain |

### Trust and authorization (Mastercard)
| Class | Definition |
|---|---|
| `KnowYourAgent` (KYA) | Registration and verification of an Agent. Required before it can get a token |
| `AgenticToken` | Network-scoped card token bound to one Agent. Hides the PAN, is revocable, enforces spend scope |
| `VerifiableIntent` / `IntentArtifact` | Signed record of the Principal's mandate. Transactions reference it |
| `PaymentPasskey` | Biometric consent from the Principal |
| `AcceptanceFramework` | How merchants recognize agents, using `WebBotAuth` (signed HTTP) |
| `Permission` (AP4M) | Spend limits and rules granted to an agent, recorded **on-chain** |
| `VIMandate` L1/L2/L3a/L3b | Verifiable Intent SD-JWT chain: issuer→user (L1), user→agent constraints (L2), agent→network payment (L3a), agent→merchant checkout (L3b) |
| `VIMode` | `Immediate` (2 layers, user confirms) · `Autonomous` (3 layers, agent key bound via `cnf.jwk`) |
| `MVCT` / `DTVC` / `DSRP` | Virtual Card Token + one-time security code (form-fill) / cryptogram (API checkout): the concrete Agentic Token credentials |
| `TokenRequestor` | The role an agent platform registers as to obtain Agentic Tokens |
| `Voucher` (AP4M) | Signed promise-to-pay within a limit, verified off-chain, batch-redeemed later (≈ XRPL Payment Channel claim) |

### Payment execution (AWS / open protocols)
| Class | Definition |
|---|---|
| `PaymentProtocol` | HTTP-native negotiation: `x402`, `MPP` (both use HTTP 402) |
| `PaymentRequirement` | The merchant's 402 response: price, asset, payTo |
| `PaymentProof` | Signed payment that the agent sends back on retry |
| `PaymentSession` | Budget (`maxSpendAmount`, currency) + expiry. The guardrail |
| `PaymentCredentialProvider` | Wallet secrets stored in AgentCore Identity |
| `PaymentManager`? | AgentCore resource managed by `agentcore payment` |
| `x402Bazaar` | Discovery catalog of paid endpoints, exposed as a Gateway target |
| `SettlementRail` | `CardRail` · `AccountRail` · `StablecoinRail` |

### Agent runtime (AgentCore)
| Class | Definition |
|---|---|
| `Project` | `agentcore/agentcore.json` + CDK app + `aws-targets.json` |
| `Harness` | Managed agent configured in YAML (model, prompt, tools, skills) |
| `Runtime` | Agent code you own. Protocols: `HTTP` · `MCP` · `A2A` · `AGUI`. CodeZip or container build |
| `Gateway` | Turns APIs/Lambdas into MCP tools. Has semantic tool search |
| `Memory` | Persistent memory across sessions |
| `Identity` | Inbound/outbound auth, credential vault (IdPs: Cognito, Okta, Entra) |
| `Policy` | Cedar-based fine-grained access control |
| `Observability` | OpenTelemetry traces/logs into CloudWatch/X-Ray |
| `Evaluator` / `OnlineEval` | LLM-as-judge evaluation, on demand or continuous |
| `BuiltInTool` | Code Interpreter, Browser, Web Search |

### Agent framework (Strands)
| Class | Definition |
|---|---|
| `AgentLoop` | Repeats: read context, plan, call tool, observe, until done |
| `ModelProvider` | Bedrock (default), Anthropic, OpenAI, Gemini, Ollama, LiteLLM… |
| `Tool` | `@tool` function, MCP tool, or agent-as-tool. Library: `strands-agents-tools` |
| `Plugin` | Hooks into the loop, e.g. `AgentCoreToolSearchPlugin`, AgentCore Payments plugin |
| `IntentProvider` | Derives an intent string for semantic tool search |
| `Hook` / `SteeringHandler` / `Guardrail` | Intercept, validate or redirect steps |
| `MultiAgentPattern` | `Swarm` · `Graph` · `Supervisor` (agents-as-tools) · `Hierarchical` · `Workflow` |
| `AgentSOP` | Natural-language runbook (`.sop.md`, RFC 2119 MUST/SHOULD/MAY) |
| `EvalExperiment` | strands-evals cases + evaluators, trajectory scoring, red-team, chaos |

### Safety and sandboxing
| Class | Definition |
|---|---|
| `Box` | Local OS sandbox (`box.toml`, Seatbelt) + `DogwoodPolicy` (`policy.dw`, deny by default, temporal) |
| `EgressGateway` | Terminates TLS, checks policy per request, injects credentials |
| `MCPBroker` | Runs each local MCP server in its own sandbox |
| `StrandsShell` | In-process VFS shell with a URL allowlist and injected secrets |
| `DecisionRecord` | OTLP JSON record of each permit or deny |

### Developer tooling
| Class | Definition |
|---|---|
| `MCPServer` | Mastercard Developers MCP (`developer.mcp.mastercard.com`), AWS MCP Server (`aws-mcp.us-east-1.api.aws/mcp`) |
| `AgentSkill` | On-demand instruction package (AWS: aws-serverless, AgentCore Payments, …) |
| `AgentPlugin` (IDE) | MCP config + skills bundle (aws-core, aws-agents) |
| `CLI` | `agentcore` (create/add/dev/deploy/invoke/payment/eval), `strands`, `strands-evals` |

## 3. Key relations

```
Principal      ──delegates──▶       Agent
Agent          ──verifiedBy──▶      KnowYourAgent
Agent          ──holds──▶           AgenticToken      ──scopedBy──▶  Permission
Agent          ──actsUnder──▶       VerifiableIntent  ──signedBy──▶  Principal
Permission     ──recordedOn──▶      Blockchain (AP4M)
Agent          ──requests──▶        ServiceProvider   ──responds──▶  PaymentRequirement (HTTP 402)
Agent          ──payVia──▶          PaymentProtocol (x402 | MPP)
PaymentSession ──bounds──▶          Agent spend
WalletProvider ──signs──▶           PaymentProof      ──settlesOn──▶ SettlementRail
Issuer         ──validates──▶       VerifiableIntent  (card path)

Strands Agent  ──deployedTo──▶      AgentCore Runtime
Strands Agent  ──discoversToolsVia──▶ Gateway (semantic search, IntentProvider)
Gateway        ──exposes──▶         x402Bazaar | Lambda | OpenAPI as MCP tools
Identity       ──stores──▶          PaymentCredentialProvider
Observability  ──traces──▶          AgentLoop, PaymentSession
Box/Dogwood    ──constrains──▶      Agent egress, tools, credentials
```

## 4. Two payment paths

| | **Card path** (Agent Pay) | **Machine path** (AP4M / AgentCore Payments) |
|---|---|---|
| Typical value | Consumer checkout ($–$$$) | Micropayments (cents to sub-cent) |
| Human present | At consent (Passkey) | No; rules are set ahead of time |
| Credential | Agentic Token | Wallet key + on-chain permission |
| Negotiation | Merchant checkout + Web Bot Auth | HTTP 402: x402 / MPP |
| Rail | Card network | Stablecoins, accounts, cards |
| Guardrail | Token scope, issuer intent check | PaymentSession budget/expiry, on-chain permissions |

## 5. XRPL angle (hackathon hooks)

- **RippleX** is a named AP4M ecosystem participant, so XRPL is a plausible AP4M settlement and permission ledger, but this is unconfirmed.
- **x402 already runs on XRPL**: `x402-xrpl` (T54) has hosted testnet and mainnet facilitators, scheme `exact` (a presigned Payment), and supports XRP and RLUSD. xrpl.org has an Agentic Transactions section and Claude skills. See [xrpl/BUILD-GUIDE.md](xrpl/BUILD-GUIDE.md).
- The documented AgentCore Payments instruments (`ETHEREUM`/`SOLANA` via Coinbase CDP or Privy) and the AP4M launch chains (Base, Solana, Polygon) do **not** list XRPL. That leaves an opening for:
  - an **XRPL payment-channel x402 scheme** (AP4M-style vouchers: authorize once, sign many claims off-ledger, redeem later);
  - a **Strands plugin** like the AgentCore Payments plugin that signs XRPL payments under a `PaymentSession`-style budget;
  - **on-chain agent permissions** on XRPL (e.g. Credentials / DID amendments) to model AP4M `Permission` and KYA attestations;
  - an **AgentCore Gateway target** that wraps XRPL services as paid MCP tools.

## 6. Open questions / gaps
- The dedicated Agent Pay docs page is now 404 (gated?). The closest public specs are the Checkout Solutions MVCT/SCOF APIs; see [mastercard/BUILD-GUIDE.md](mastercard/BUILD-GUIDE.md). AP4M buyer/seller API specs are Early Access only.
- AgentCore `payment` resource schema (PaymentManager?) — check `agentcore payment --help`.
- The workshop content was not captured (see [pages/aws-workshop.md](pages/aws-workshop.md)).
- Do AP4M on-chain permissions use a standard (e.g. ERC-7710/7715-style delegations)?
