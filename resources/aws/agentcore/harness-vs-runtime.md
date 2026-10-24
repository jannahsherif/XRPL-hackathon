

# AgentCore harness vs. Runtime
<a name="harness-vs-runtime"></a>

AgentCore harness and AgentCore Runtime solve different parts of the same problem. This page explains the conceptual difference and provides a feature-by-feature comparison to help you choose between them.

## Conceptual difference
<a name="_conceptual_difference"></a>

 **AgentCore Runtime** is a *serverless hosting environment*. You bring agent code - written in any framework or no framework - wrap it with the AgentCore SDK’s `BedrockAgentCoreApp` entrypoint, package it into an ARM64 container, push it to Amazon ECR, and deploy. *The orchestration loop is yours.* To use any other AgentCore primitive (Memory, Gateway, Browser, Code Interpreter, outbound Identity), you call it from your code, typically through the AgentCore SDK. Runtime provides the infrastructure - isolation, scaling, sessions, auth gating, and observability plumbing - while the agent logic is code you write.

 **AgentCore harness** is a *managed agent harness* - the orchestration loop itself is provided, powered by [Strands Agents](https://strandsagents.com). You declare what the agent is (model, system prompt, tools, memory, limits) as configuration, and AgentCore runs the loop. Most features are a single config field: switching a model or adding a tool is a config change, not a redeploy. The harness is a managed abstraction that runs inside Runtime - CloudTrail records harness operations under `AWS::BedrockAgentCore::Runtime`.

For nearly every feature, the pattern is the same:
+  **Harness** - configuration, no code.
+  **Runtime** - you write code, usually with the AgentCore SDK plus your framework.

The grid below makes the per-feature exceptions explicit.

## Feature grid
<a name="_feature_grid"></a>

The **Supported?** columns use the following legend:
+  **Yes** (`✅ Yes`) – Supported with no custom code required.
+  **Custom** (`🔵 Custom`) – Supported, but you must maintain your own implementation.
+  **Mixed** (`🟣 Mixed`) – Configuration enables it, but code is required to fully use it.
+  **No** (`❌ No`) – Not supported.


| Feature / Capability | Harness: supported? | Harness: customer code required? | Runtime: supported? | Runtime: customer code required? | 
| --- | --- | --- | --- | --- | 
| Model selection (Bedrock / OpenAI / Gemini / LiteLLM) | ✅ Yes | No | 🔵 Custom | Yes | 
| Switch model provider mid-session | ✅ Yes | No | 🔵 Custom | Yes | 
| Built-in shell and `file_operations` tools | ✅ Yes | No | 🔵 Custom | Yes | 
| Agent Skills | ✅ Yes | No | 🔵 Custom | Yes | 
| Observability | ✅ Yes | No | 🔵 Custom | Yes | 
| AgentCore Memory - short-term | ✅ Yes | No | 🔵 Custom | Yes | 
| AgentCore Memory - long-term (semantic, summarization, user-pref, episodic) | ✅ Yes | No | 🔵 Custom | Yes | 
| Per-user memory scoping (actor ID) | ✅ Yes | No | 🔵 Custom | Yes | 
| AgentCore Gateway | ✅ Yes | No | 🔵 Custom | Yes | 
| AgentCore Browser | ✅ Yes | No | 🔵 Custom | Yes | 
| AgentCore Code Interpreter | ✅ Yes | No | 🔵 Custom | Yes | 
| MCP server tools (remote) | ✅ Yes | No | 🔵 Custom | Yes | 
| Inline / client-side tools | 🔵 Custom | Yes | 🔵 Custom | Yes | 
| Context-window truncation | ✅ Yes | No | 🔵 Custom | Yes | 
| Custom container image / environment | 🟣 Mixed | Mixed | 🟣 Mixed | Mixed | 
| Execution limits (`maxIterations`, `timeoutSeconds`, `maxTokens`, idle/lifetime) | ✅ Yes | No | 🔵 Custom | Yes | 
| Filesystem - service-managed session storage | ✅ Yes | No | ✅ Yes | No | 
| Filesystem - EFS access point | ✅ Yes | No | ✅ Yes | No | 
| Filesystem - S3 Files access point | ✅ Yes | No | ✅ Yes | No | 
| Environment variables | ✅ Yes | No | ✅ Yes | No | 
| Direct shell command execution (`InvokeAgentRuntimeCommand` API) | ✅ Yes | No | ✅ Yes | No | 
| Interactive shell sessions (`InvokeAgentRuntimeCommandShell` API) | ✅ Yes | No | ✅ Yes | No | 
| Inbound auth - IAM (SigV4) | ✅ Yes | No | ✅ Yes | No | 
| Inbound auth - OAuth | ✅ Yes | No | ✅ Yes | No | 
| Outbound auth / Identity token vault (OAuth and API keys) | ✅ Yes | No | 🔵 Custom | Yes | 
| Session isolation | ✅ Yes | No | ✅ Yes | No | 
| VPC networking | ✅ Yes | No | ✅ Yes | No | 
| Streaming responses | ✅ Yes | No | 🔵 Custom | Yes | 
| Versioning and endpoints | ✅ Yes | No | ✅ Yes | No | 
| Choice of agent framework | ❌ No | N/A | 🔵 Custom | Yes | 
| Bidirectional streaming | ❌ No | N/A | 🔵 Custom | Yes | 
| Non-agent-loop patterns (graph, workflow style) | ❌ No | N/A | 🔵 Custom | Yes | 
| Lifecycle hooks | 🟣 Mixed | Mixed | 🔵 Custom | Yes | 

## Related topics
<a name="_related_topics"></a>
+  [Get started](harness-get-started.md) – Create and invoke your first harness
+  [Models and instructions](harness-models.md) – Configure agents, models, and providers
+  [Tools](harness-tools.md) – Connect tools to your harness
+  [Lifecycle hooks](harness-lifecycle-hooks.md) – Configure hooks to validate invocations and tool calls
+  [Environment and filesystem](harness-environment.md) – Bring a custom container image or environment
+  [Interactive shells](harness-command-shell.md) – Open an interactive terminal in a harness session