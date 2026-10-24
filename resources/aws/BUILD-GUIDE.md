# AWS Agent Stack: Build Guide (AgentCore + Strands)

How to build, deploy and pay from agents on AWS, and where XRPL fits. Compiled 2026-10-24 from the docs in this folder.

> **Reality check**
> - **AgentCore Payments** (preview) only supports **ETHEREUM (Base) and SOLANA** instruments through **Coinbase CDP** or **Stripe Privy** wallets. **There is no XRPL connector.** XRPL payments have to be added at the agent/tool layer (section 6). That gap is the hackathon opportunity.
> - Everything else (Runtime, Harness, Gateway, Identity, Policy, Observability, Strands) is GA or self-serve with an AWS account.
> - Payments preview regions: us-east-1, us-west-2, eu-central-1, ap-southeast-2 (per press). Check [agentcore/agentcore-regions.md](agentcore/agentcore-regions.md).

---

## 1. Pieces

| Layer | What | Docs |
|---|---|---|
| **Strands Agents SDK** | Open-source agent loop (Python/TS): `Agent(model, system_prompt, tools, plugins)`, `@tool`, MCP, multi-agent (swarm/graph/agents-as-tools), hooks, interrupts | [strands/](strands/) |
| **Strands Harness** | Fully assembled agent (`create_harness()`), plus the `strands` CLI | [strands/user-guide__harness*.md](strands/) |
| **AgentCore Runtime** | Serverless, session-isolated hosting for your agent code. Protocols: HTTP, MCP, A2A, AG-UI. Runs up to 8 h | [agentcore/runtime*.md](agentcore/) |
| **AgentCore Harness** | Managed agent defined in YAML (model, prompt, tools, skills). No code | [agentcore/harness*.md](agentcore/) |
| **AgentCore Gateway** | Turns APIs (OpenAPI/Smithy), Lambdas and MCP servers into one MCP endpoint. Semantic tool search. Includes the x402 Bazaar | [agentcore/gateway*.md](agentcore/) |
| **AgentCore Identity** | Inbound auth (Cognito/Okta/Entra/JWT) and an outbound credential vault (API keys, OAuth, **payment credentials**) | [agentcore/identity*.md](agentcore/) |
| **AgentCore Payments** | `PaymentManager` → `PaymentConnector` (Coinbase/Privy) → `PaymentInstrument` (wallet) + `PaymentSession` (budget). `ProcessPayment` for x402 v1/v2 + MPP | [agentcore/payments*.md](agentcore/) |
| **Policy** | Cedar policies on Gateway tool calls, including **session-based temporal** rules (rate and count limits) and natural-language authoring | [agentcore/policy*.md](agentcore/) |
| **Observability / Evals** | OTEL traces in CloudWatch / X-Ray. LLM-as-judge evaluators | [agentcore/observability*.md](agentcore/) |
| **Agent Toolkit for AWS** | AWS MCP server + skills (including the **AgentCore Payments skill**) for your coding agent | [../pages/aws-agent-toolkit.md](../pages/aws-agent-toolkit.md) |

---

## 2. Setup (15 min)

```bash
# prerequisites: AWS creds (aws configure), Node 20.12+, uv, Bedrock model access (Claude)
npm install -g @aws/agentcore
pip install strands-agents strands-agents-tools 'bedrock-agentcore[strands-agents]'

# optional: give your coding agent AWS + AgentCore knowledge
/plugin install aws-core@claude-plugins-official      # in Claude Code
```
IAM: `BedrockAgentCoreFullAccess` + `AmazonBedrockFullAccess` for hacking. Payments roles: [agentcore/payments-iam-roles.md](agentcore/payments-iam-roles.md).

---

## 3. Hello agent, then deploy

```python
# main.py: Strands agent served on AgentCore Runtime
from bedrock_agentcore import BedrockAgentCoreApp
from strands import Agent, tool

app = BedrockAgentCoreApp()

@tool
def quote(symbol: str) -> str:
    """Return a price quote for a symbol."""
    return f"{symbol}: 0.52"

agent = Agent(system_prompt="You are a payments agent.", tools=[quote])

@app.entrypoint
async def handler(request):
    prompt = request.get("prompt")
    if not isinstance(prompt, str):
        raise ValueError("prompt must be a string")
    async for event in agent.stream_async(prompt):
        yield event

app.run()
```
```bash
agentcore create --name XrplAgent --template agent-python-strands   # or: add runtime for BYO code
cd XrplAgent
agentcore dev                       # local; --mode browser for Agent Inspector
agentcore deploy                    # CDK under the hood (agentcore/cdk/)
agentcore invoke --prompt "quote XRP"
agentcore logs / agentcore traces
agentcore add memory | identity | gateway | evaluator | online-eval
```
Project files: `agentcore/agentcore.json` (spec), `agentcore/aws-targets.json` (account/region), `agentcore/cdk/`. Secrets for model keys go in `agentcore/.env.local` and are provisioned as Identity credentials. CLI reference: [agentcore/agentcore-get-started-cli.md](agentcore/agentcore-get-started-cli.md), [../raw/aws_agentcore-cli.README.md](../raw/aws_agentcore-cli.README.md).

No-code alternative: `agentcore add harness --name MyAssistant`, then `agentcore deploy`, then `agentcore invoke --harness MyAssistant --prompt "..."`.

---

## 4. AgentCore Payments (EVM/Solana x402, for reference and side-by-side)

**Resources:** `PaymentManager` (authorizer `AWS_IAM` | `CUSTOM_JWT`) → `PaymentConnector` (`CoinbaseCDP` quick-create OAuth, or `StripePrivy` manual) → per-user `PaymentInstrument` (embedded wallet, `network: ETHEREUM|SOLANA`, starts at 0 USDC, and the user funds it and grants the agent permission in the wallet hub) + `PaymentSession` (`maxSpendAmount`, `currency`, expiry).

```bash
agentcore create --name PaymentsQuickstart --template empty
agentcore add runtime ...
agentcore add payment-manager ...
agentcore add payment-connector ...          # Coinbase: deploy prints an authorize URL
agentcore deploy && agentcore status --json   # → PAYMENT_MANAGER_ARN
agentcore payment instrument ... / session ...
```
**Strands plugin (auto-handles 402):**
```python
from strands import Agent
from strands_tools import http_request
from bedrock_agentcore.payments.integrations.config import AgentCorePaymentsPluginConfig
from bedrock_agentcore.payments.integrations.strands.plugin import AgentCorePaymentsPlugin

plugin = AgentCorePaymentsPlugin(config=AgentCorePaymentsPluginConfig(
    payment_manager_arn=PAYMENT_MANAGER_ARN, user_id="u1",
    payment_instrument_id=INSTRUMENT_ID, payment_session_id=SESSION_ID,
    region="us-west-2", network_preferences_config=["eip155:8453", "solana-mainnet"],
))
agent = Agent(tools=[http_request], plugins=[plugin])
agent("fetch https://paid.example.com/data")   # 402 → ProcessPayment → retry with X-PAYMENT
```
- Failures surface as **interrupts** (`payment-failure-*`, `PaymentSessionConfigurationRequired`, …), so handle them with `result.stop_reason == "interrupt"`. Set `auto_payment=False` for human-in-the-loop.
- Lower-level: `PaymentManager.generate_payment_header(...)` or `dp_client.process_payment(paymentType="CRYPTO_X402", paymentInput={"cryptoX402": {"version": "2", "payload": {...}}})`.
- MPP: forward `WWW-Authenticate: Payment` in `paymentInput.mpp` and retry with `Authorization: Payment <token>`.
- Discovery: the **Coinbase x402 Bazaar** as a Gateway target ([payments-connect-bazaar.md](agentcore/payments-connect-bazaar.md)). Paywalled sites: [payments-browser.md](agentcore/payments-browser.md).
- Coinbase frontend template: `github.com/coinbase/cdp-agentcore-template`. Privy: `github.com/privy-io/aws-agentcore-sdk`.

Docs: [payments-getting-started.md](agentcore/payments-getting-started.md) → [payments-process-payment.md](agentcore/payments-process-payment.md) → [payments-framework-integrations.md](agentcore/payments-framework-integrations.md) → [payments-troubleshooting.md](agentcore/payments-troubleshooting.md).

---

## 5. Gateway, Identity and Policy (the guardrails)

- **Gateway:** `agentcore add gateway`, then add targets: OpenAPI ([gateway-add-target-api.md](agentcore/gateway-add-target-api.md)), Lambda ([gateway-add-target-lambda.md](agentcore/gateway-add-target-lambda.md)), MCP server ([gateway-target-MCPservers.md](agentcore/gateway-target-MCPservers.md)), HTTP passthrough. Agents connect through MCP with IAM/JWT. Use the `AgentCoreToolSearchPlugin` when there are many tools ([strands/integrations__plugins__agentcore-tool-search.md](strands/integrations__plugins__agentcore-tool-search.md)).
- **Identity (outbound):** keep the XRPL signing seed / API keys in an Identity credential provider backed by Secrets Manager, not in env vars ([identity-outbound-credential-provider.md](agentcore/identity-outbound-credential-provider.md)).
- **Policy (Cedar):** permit or forbid tool calls by principal, tool and arguments, e.g. forbid `xrpl_pay` when `amount > 5 RLUSD`, plus **temporal** limits (`policy-session-based-temporal.md`, `policy-temporal-authoring.md`). This acts as a spend guardrail **outside the LLM**, enforced at the Gateway.

---

## 6. XRPL on AWS: integration patterns

AgentCore Payments has no XRPL connector, so pick one of these (in increasing effort):

| # | Pattern | How | Effort |
|---|---|---|---|
| **1** | **x402-xrpl inside a Strands tool** | `@tool def pay_and_fetch(url)` uses `x402_xrpl.clients.requests.x402_requests(wallet, rpc_url)`. Deploy on Runtime. The seed comes from Identity/Secrets Manager | ⭐ |
| **2** | **XRPL Strands plugin mirroring `AgentCorePaymentsPlugin`** | Hook `AfterToolCallEvent`: when an `http_request` tool returns 402 with `network: xrpl:*`, sign with xrpl-py, retry with `PAYMENT-SIGNATURE`, and enforce your own session budget (`maxSpend`, expiry). Raise interrupts on failure, the same way the AWS plugin does | ⭐⭐ |
| **3** | **XRPL tools behind Gateway + Cedar Policy** | Lambda target exposing `xrpl_pay`, `xrpl_balance`, `channel_claim`. Cedar policy caps amounts and destinations. Observability traces every payment | ⭐⭐ |
| **4** | **XRPL merchant on AWS** | FastAPI + `x402_xrpl.server.require_payment` on Lambda / App Runner / a Runtime HTTP target, so other agents (and Bazaar-style discovery) pay you in XRP/RLUSD | ⭐⭐ |
| **5** | **Payment-channel streaming payer** | Agent opens an XRPL PayChannel once (the budget), then signs off-ledger claims per request (AP4M "voucher" model). The seller verifies with `channel_verify` and redeems in batches | ⭐⭐⭐ |

Sketch for pattern 1:
```python
import os
from strands import Agent, tool
from xrpl.wallet import Wallet
from x402_xrpl.clients.requests import x402_requests

wallet = Wallet.from_seed(os.environ["XRPL_SEED"])     # load from Identity/Secrets Manager in prod
session = x402_requests(wallet, rpc_url="https://s.altnet.rippletest.net:51234/",
                        network_filter="xrpl:1", scheme_filter="exact")

@tool
def paid_get(url: str) -> str:
    """GET a URL, automatically paying any x402 (XRPL) paywall."""
    r = session.get(url, timeout=180)
    return f"{r.status_code}\n{r.text[:4000]}"

agent = Agent(system_prompt="Buy data only when needed; budget 0.01 XRP/call.", tools=[paid_get])
```

---

## 7. Files in this folder

| Path | What |
|---|---|
| [agentcore-llms.txt](agentcore-llms.txt) | Full AgentCore dev-guide index (585 pages) |
| [agentcore/](agentcore/) | 306 pages: overview, get-started, harness, runtime, gateway, identity, **payments (all)**, policy, CLI |
| [strands-llms.txt](strands-llms.txt) | Full Strands docs index |
| [strands/](strands/) | 139 pages: harness, quickstart, agents, tools, MCP, plugins/hooks/interrupts, multi-agent, deploy (AgentCore/Lambda/Fargate/…), Box, Shell, A2A, observability |
| [../raw/](../raw/) | READMEs: bedrock-agentcore-sdk-python, agentcore-cli, agentcore-samples, strands-agents/* |
