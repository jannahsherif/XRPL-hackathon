

# Policy sessions and identity propagation
<a name="policy-session-based-temporal"></a>

With temporal policies, you can define rules based on past events that have occurred within a session, not just the current request. You can enforce constraints such as:
+ "Allow at most 5 tool invocations per session"
+ "Block access to Tool B unless Tool A was called first in this session"
+ "Deny external API calls after sensitive data was accessed in this session"

A *policy session* groups multiple Gateway invocations into a single logical session. The session is the boundary over which temporal policy rules are evaluated.

**Topics**
+ [How it works](#policy-sbt-how)
+ [Passing the policy session ID](#policy-sbt-passing)
+ [Session lifecycle](#policy-sbt-lifecycle)
+ [Identity propagation in multi-hop scenarios](#policy-sbt-identity)
+ [Important considerations](#policy-sbt-considerations)
+ [Using the session ID with the SDKs](#policy-sbt-cli-sdk)
+ [Real-world customer use cases](#policy-sbt-use-cases)
+ [Choosing session scope: broad versus narrow sessions](#policy-sbt-scope)
+ [Header verification and non-Runtime deployments](#policy-sbt-verification)
+ [About the Workload Access Token (WAT)](#policy-sbt-wat)

## How it works
<a name="policy-sbt-how"></a>
+  **Your application passes a session identifier** on requests to the Gateway using the `x-amzn-bedrock-agentcore-policy-session-id` header.
+  **The Gateway binds the session** to the caller’s authenticated identity (principal).
+  **On each invocation**, the Gateway evaluates temporal policies against the accumulated history of actions in that session.
+  **In multi-hop scenarios** (Gateway → Runtime → Gateway), the platform propagates the session and caller identity automatically through a service-managed header, `X-Amz-Bedrock-AgentCore-Identity-WAT`. Your agent code does not need to manage this header — AgentCore handles it transparently.

**Important**  
Multi-hop scenarios work only within a single AWS account and Region. AgentCore does not support multi-hop scenarios that cross accounts or Regions.

## Passing the policy session ID
<a name="policy-sbt-passing"></a>

Include the `x-amzn-bedrock-agentcore-policy-session-id` header on your requests to the Gateway. You must generate the session ID and send it on every request, starting with your first request. The Gateway does not generate a session ID on your behalf. The value is a string that identifies the session, and we recommend a UUIDv4. Send the same ID with every request in the same session.

If you omit the header, or send an empty value, the Gateway does not establish a session. If the associated policy engine contains a temporal policy, requests without a session ID fail with a validation error.

For the accepted format and how the Gateway validates it, see [Header verification and non-Runtime deployments](#policy-sbt-verification).

 **First request (creates the session):** 

```
curl -X POST \
  https://mygateway-abcdefghij.gateway.bedrock-agentcore.us-west-2.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "x-amzn-bedrock-agentcore-policy-session-id: 12345678-1234-1234-1234-123456789012" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "PaymentTool___transfer_funds",
      "arguments": {
        "amount": 500,
        "recipient": "account-789"
      }
    }
  }'
```

 **Subsequent requests (continue the session):** 

```
curl -X POST \
  https://mygateway-abcdefghij.gateway.bedrock-agentcore.us-west-2.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "x-amzn-bedrock-agentcore-policy-session-id: 12345678-1234-1234-1234-123456789012" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "PaymentTool___transfer_funds",
      "arguments": {
        "amount": 600,
        "recipient": "account-456"
      }
    }
  }'
```

If your temporal policy limits each session to 1 transfer, the second request shown in the preceding example would be denied.

 **Python example:** 

```
import requests
import uuid

GATEWAY_URL = "https://mygateway-abcdefghij.gateway.bedrock-agentcore.us-west-2.amazonaws.com/mcp"
ACCESS_TOKEN = "YOUR_ACCESS_TOKEN"

# Generate or reuse a session ID for the conversation
session_id = str(uuid.uuid4())  # for example, "12345678-1234-1234-1234-123456789012"

def call_tool(tool_name, arguments, session_id):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "x-amzn-bedrock-agentcore-policy-session-id": session_id
    }

    payload = {
        "jsonrpc": "2.0",
        "id": "request-1",
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    }

    response = requests.post(GATEWAY_URL, headers=headers, json=payload)
    return response.json()


# First call - allowed
result1 = call_tool(
    "PaymentTool___transfer_funds",
    {"amount": 500, "recipient": "account-789"},
    session_id
)
print(result1)  # Success

# Second call in same session - may be denied by temporal policy
result2 = call_tool(
    "PaymentTool___transfer_funds",
    {"amount": 600, "recipient": "account-456"},
    session_id
)
print(result2)  # Denied if rate-limit policy applies
```

## Session lifecycle
<a name="policy-sbt-lifecycle"></a>


| Property | Value | 
| --- | --- | 
| Creation | Implicit on first request with the session ID | 
| Idle timeout | 24 hours from last activity | 
| Explicit close | Not supported; sessions expire naturally | 
| Maximum lifetime | Bounded by idle timeout | 

## Identity propagation in multi-hop scenarios
<a name="policy-sbt-identity"></a>

In agentic architectures, a request often flows through multiple AgentCore primitives:

```
User -> Gateway1 -> Runtime (agent) -> Gateway1 (tool call) -> Target
```

For temporal policies to work across these hops, the session identity must be preserved. AgentCore handles this automatically using the **Workload Identity Chain (WIC)**:
+  **At the origin Gateway**: The Gateway mints a Workload Access Token (WAT) that embeds the `sessionId` and `callerPrincipal` (the original caller’s identity).
+  **Gateway → Runtime**: The WAT is passed through the internal `X-Amz-Bedrock-AgentCore-Identity-WAT` header.
+  **Runtime → Gateway (tool call)**: Runtime exchanges the inbound WAT for a new WAT (chain extension), automatically preserving the `sessionId` and `callerPrincipal`. The extended WAT is stamped on the outbound request.
+  **Receiving Gateway**: Evaluates temporal policies against the same session, preserving continuity.

 **What this means for you:** 
+  **You only need to pass** `x-amzn-bedrock-agentcore-policy-session-id` **on the initial request to the Gateway.** The platform handles propagation to all downstream hops.
+  **Your agent code does not need to read, modify, or forward the** `X-Amz-Bedrock-AgentCore-Identity-WAT` **header.** This is managed by AgentCore infrastructure (Runtime, Gateway, and the AgentCore Identity service).
+  **The session ID rides inside the WAT** and cannot be spoofed or tampered with by intermediaries.

 **End-to-end flow:** 

```
User            Gateway1            Runtime            Gateway1            Target
 |  POST /mcp      |                   |                   |                  |
 |  + session-id X |                   |                   |                  |
 |  + Authorization|                   |                   |                  |
 |---------------->|                   |                   |                  |
 |                 | mint WAT1         |                   |                  |
 |                 | (sid=X, cpn=user) |                   |                  |
 |                 |  forward + WAT1   |                   |                  |
 |                 |------------------>|                   |                  |
 |                 |                   |exchange WAT1->WAT2|                  |
 |                 |                   | (sid=X preserved) |                  |
 |                 |                   | tool call + WAT2  |                  |
 |                 |                   |------------------>|                  |
 |                 |                   |                   | evaluate temporal|
 |                 |                   |                   | policy, session X|
 |                 |                   |                   |  forward         |
 |                 |                   |                   |----------------->|
```

## Important considerations
<a name="policy-sbt-considerations"></a>
+  **Session IDs are customer-managed.** You choose when to create a new session versus continue an existing one. A new session ID means a fresh temporal policy evaluation boundary.
+  **The** `X-Amz-Bedrock-AgentCore-Identity-WAT` **header is internal.** Do not set, modify, or strip this header in your agent code. AgentCore manages it end to end.
+  **Multi-gateway scenarios (Gateway1 → Runtime → Gateway2):** The session state propagates automatically through the WAT. Gateway2 evaluates its own temporal policies using the same session ID.
+  ** `authorizerType=NONE` gateways do not provide per-caller session isolation.** When no authentication is configured, the Gateway has no caller identity to bind the session to. All callers who supply the same session ID share a single temporal policy event stream. One caller’s actions count toward another’s rate limits or sequencing constraints. Temporal policy on unauthenticated gateways is advisory only: it can enforce global limits (for example, "at most 100 total calls to this tool per session") but cannot distinguish or isolate individual callers. For per-caller isolation, configure your gateway with `CUSTOM_JWT` or `AWS_IAM` authentication.

## Using the session ID with the SDKs
<a name="policy-sbt-cli-sdk"></a>

You can pass the policy session ID through any client that supports custom headers on Gateway requests. The following examples show how to include it when using the MCP Python SDK and Strands Agents.

Use the same session ID value across all calls in the same logical session. When a new conversation starts, generate a new session ID.

 **MCP client (Python SDK):** 

When you use the MCP Python SDK with a streamable HTTP transport, include the session ID in the connection headers:

```
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
import asyncio

SESSION_ID = "12345678-1234-1234-1234-123456789012"

async def call_with_session(gateway_url, token, tool_name, arguments):
    headers = {
        "Authorization": f"Bearer {token}",
        "x-amzn-bedrock-agentcore-policy-session-id": SESSION_ID
    }

    async with streamablehttp_client(url=gateway_url, headers=headers) as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool(name=tool_name, arguments=arguments)
            return result

result = asyncio.run(call_with_session(
    "https://mygateway-abcdefghij.gateway.bedrock-agentcore.us-west-2.amazonaws.com/mcp",
    "YOUR_TOKEN",
    "PaymentTool___transfer_funds",
    {"amount": 500, "recipient": "account-789"}
))
```

 **Strands Agents:** 

When you use Strands Agents with an AgentCore Gateway as the tool source, pass the session ID in the MCP client transport headers. All tool calls the agent makes during the session carry the same session, and temporal policies evaluate the full history.

```
from strands.tools.mcp.mcp_client import MCPClient
from mcp.client.streamable_http import streamablehttp_client

SESSION_ID = "12345678-1234-1234-1234-123456789012"

def create_transport(mcp_url, access_token):
    return streamablehttp_client(
        mcp_url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "x-amzn-bedrock-agentcore-policy-session-id": SESSION_ID
        }
    )

mcp_client = MCPClient(lambda: create_transport(gateway_url, token))
with mcp_client:
    result = mcp_client.call_tool_sync(
        tool_use_id="tool-1",
        name="PaymentTool___transfer_funds",
        arguments={"amount": 500, "recipient": "account-789"}
    )
```

## Real-world customer use cases
<a name="policy-sbt-use-cases"></a>

The following scenarios illustrate how temporal policies address common security and compliance challenges in agentic applications.

 **Financial services — transfer rate limiting** 

A fintech application allows end-users to initiate bank transfers through a conversational agent. Without temporal policy, a compromised or looping agent could execute unlimited transfers in a single session. With a session-scoped rate limit, the Gateway enforces a maximum number of transfers per session:

```
User: "Transfer $500 to Alice"      -> Allowed (1 of 3)
User: "Transfer $200 to Bob"        -> Allowed (2 of 3)
User: "Transfer $1000 to Charlie"   -> Allowed (3 of 3)
User: "Transfer $50 to Dave"        -> DENIED by temporal policy
```

Each user session uses its own session ID. The rate limit resets when a new session starts, because a new session ID creates a fresh evaluation boundary.

 **Healthcare — escalation controls** 

A healthcare agent accesses patient records and can also send messages to external notification systems. A temporal policy enforces that once patient data has been accessed, no external API calls are permitted for the remainder of the session. This prevents data exfiltration even if the agent’s prompts are manipulated mid-session:

```
Agent: calls PatientRecords___read_chart      -> Allowed
Agent: calls ExternalAPI___send_notification  -> DENIED (sensitive data was accessed in this session)
```

The constraint is not on the tool itself — `send_notification` is permitted in sessions that never access patient data. The policy considers what happened earlier in this particular session.

 **DevOps — sequencing constraints** 

A deployment agent must follow a mandatory sequence: tests must pass before deployment proceeds. A temporal policy enforces that `Deploy` can only be called after `RunTests` has been called in the same session:

```
Agent: calls Deploy___to_production   -> DENIED (RunTests not yet called in this session)
Agent: calls RunTests___execute       -> Allowed
Agent: calls Deploy___to_production   -> Allowed (RunTests was called earlier in this session)
```

This guarantees the deployment sequence regardless of how the agent is prompted or which orchestration framework controls it.

 **Multi-tenant SaaS — per-user budget enforcement** 

A SaaS platform hosts AI agents for multiple end-users behind a shared application credential (`CUSTOM_JWT` with per-user `sub` claims through On-Behalf-Of (OBO) flows). Each user’s session receives a unique session ID. Because the Gateway binds the session to both the session ID and the authenticated principal, different users' sessions are automatically isolated. A temporal policy enforces "at most $100 in tool calls per session" — evaluated independently per user, even though all traffic arrives through the same application credential.

## Choosing session scope: broad versus narrow sessions
<a name="policy-sbt-scope"></a>

The session ID you supply determines the evaluation boundary for temporal policies. Choosing the right scope affects both security and usability:


| Strategy | Session ID pattern | Pros | Cons | 
| --- | --- | --- | --- | 
| Per-conversation (recommended) | New UUID per user conversation | Natural boundary; rate limits reset between conversations; clear user mental model | Agent must start a new session for fresh limits | 
| Per-user (broad) | Stable ID per user (for example, hash of user ID) | Policies apply across all conversations; useful for daily budget enforcement | Limits never reset within the TTL (24h); shared across unrelated tasks | 
| Per-request (narrow) | New UUID per request | Every request is independent | Temporal policies are effectively disabled — no history to evaluate | 
| Per-task | UUID per logical task (for example, "process this order") | Policies scoped to a specific workflow; fits multi-step agent tasks | Application must manage task → session ID mapping | 

 **Guidance:** 
+ Start with per-conversation. This is the natural match for most interactive agent use cases.
+ Use per-user when you need cross-conversation enforcement (for example, "no more than 10 transfers per day regardless of how many conversations").
+ Never use per-request unless you intentionally want no temporal policy evaluation.
+ Avoid overly-broad sessions (for example, one session ID for all users) — this aggregates all callers' actions into a single event stream and makes per-user rate limits meaningless.

## Header verification and non-Runtime deployments
<a name="policy-sbt-verification"></a>

 **How the Gateway verifies the session ID** 

When the Gateway receives the `x-amzn-bedrock-agentcore-policy-session-id` header, it performs the following validation:
+  **Format check**: The value must be 1–128 characters, containing only alphanumeric characters and hyphens (`[A-Za-z0-9-]`). A malformed or oversized value is rejected with HTTP 400. The header is never used or reflected without passing this check.
+  **Principal binding**: On authenticated gateways (`CUSTOM_JWT` or `AWS_IAM`), the Gateway binds the session to the caller’s authenticated identity. Two different callers supplying the same session ID get isolated sessions — the identity is part of the session key.
+  **Implicit creation**: Sessions do not need to be pre-registered. The first request with a given session ID implicitly creates the session. No separate "create session" API call is required.

 **If you call the Gateway directly (without AgentCore Runtime)** 

When your application calls the Gateway endpoint directly — for example, a backend service making HTTP requests to the Gateway URL — you manage the session ID yourself:
+ Generate a session ID (we recommend `uuid4`) at the start of each logical conversation.
+ Include `x-amzn-bedrock-agentcore-policy-session-id: <your-session-id>` as an HTTP header on every request in that conversation.
+ Store the session ID client-side for the duration of the conversation so subsequent requests reference the same session.

No additional configuration, permissions, or API calls are needed. The Gateway creates the session on first use and expires it after 24 hours of inactivity.

 **If your requests flow through AgentCore Runtime** 

When calls traverse the path User → Gateway → Runtime (agent) → Gateway (tool call), you only need to pass the session ID on the initial request to the first Gateway. The platform embeds the session ID inside the Workload Access Token (WAT) and propagates it automatically through all downstream hops. Your agent code does not need to read, store, or forward the session ID — it arrives at the receiving Gateway transparently.

## About the Workload Access Token (WAT)
<a name="policy-sbt-wat"></a>

The Workload Access Token is an AWS-signed opaque token that carries the identity context of a request as it flows between AgentCore services. When temporal policy is active, the WAT contains:
+ The **session ID** — linking all hops in a multi-hop request to the same temporal policy session.
+ The **caller principal** — preserving the original caller’s identity so downstream Gateways can bind the session correctly.
+ The **workload chain** — an ordered list of AgentCore services the request has traversed (for example, `[Gateway, Runtime, Gateway]`).

The WAT is short-lived (15-minute TTL), cryptographically signed by the AgentCore Identity service, and opaque to all participants. It cannot be forged, tampered with, or decoded by callers or intermediaries.

You do not interact with the WAT directly. It is carried on the internal `X-Amz-Bedrock-AgentCore-Identity-WAT` header, which is managed entirely by the platform. This explanation is provided so you understand how session continuity works across hops — you do not need to take any action regarding the WAT.

For more details on workload identity and access tokens, see [Get workload access token](get-workload-access-token.md) and [Understanding workload identities](understanding-agent-identities.md).