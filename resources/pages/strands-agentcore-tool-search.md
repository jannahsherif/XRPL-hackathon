# Strands plugin: AgentCore Tool Search (community)
Source: https://strandsagents.com/docs/integrations/plugins/agentcore-tool-search/ (summarized capture)

- **Semantic tool discovery** through AgentCore Gateway. Each invocation loads only the relevant tools, which matters when a gateway has hundreds.
- Setup: `bedrock-agentcore[strands-agents]`, an MCP client to the Gateway (IAM auth), then `Agent(plugins=[AgentCoreToolSearchPlugin(mcp_client)])`.
- Per invocation: before the model call, an **IntentProvider** turns the recent messages into an intent string. The gateway's semantic search returns matching tools, and the previously loaded tools are cleared.
- `StrandsIntentProvider` is the default. Write a custom one by subclassing `IntentProvider.derive_intent(messages, model)`.
- Prerequisites: a Gateway with semantic search enabled, and tool descriptions.
