

# Host agent or tools with Amazon Bedrock AgentCore Runtime
<a name="agents-tools-runtime"></a>

Amazon Bedrock AgentCore Runtime provides a secure, serverless and purpose-built hosting environment for deploying and running AI agents or tools. It offers the following benefits:

Framework agnostic  
AgentCore Runtime lets you transform any local agent code to cloud-native deployments with a few lines of code no matter the underlying framework. Works seamlessly with popular frameworks like LangGraph, Strands, and CrewAI. You can also leverage it with custom agents that don’t use a specific framework.

Model flexibility  
AgentCore Runtime works with any Large Language Model, such as models offered by Amazon Bedrock, Anthropic Claude, Google Gemini, and OpenAI.

Protocol support  
AgentCore Runtime lets agents communicate with other agents and tools via Model Context Protocol (MCP) or Agent to Agent (A2A).

Session isolation  
In AgentCore Runtime, each user session runs in a dedicated microVM with isolated CPU, memory, and filesystem resources. This helps create complete separation between user sessions, safeguarding stateful agent reasoning processes and helps prevent cross-session data contamination. After session completion, the entire microVM is terminated and memory is sanitized, delivering deterministic security even when working with non-deterministic AI processes.

Compute type choice  
AgentCore Runtime offers two compute types. Choose **microVMs** for fully managed, serverless sessions that start instantly and scale on demand, where you pay only for what you use. Choose **Instances** to run agents on AWS managed Amazon EC2 infrastructure in your own account. Instances support persistent, multi-day sessions, GPU-accelerated workloads, and multiple collaborating agents on a shared instance. For more information, see [Run agents on Instances with capacity providers](runtime-instances.md).

Extended execution time  
AgentCore Runtime supports both real-time interactions and long-running workloads, enabling complex agent reasoning and asynchronous workloads that might involve multi-agent collaboration or extended problem-solving sessions. Sessions run for up to 8 hours on microVMs, or up to 14 days on Instances. For more information, see [Configure Amazon Bedrock AgentCore lifecycle settings](runtime-lifecycle-settings.md).

Persistent filesystems  
Runtime supports persisting filesystem state across session stop/resume cycles. The agent’s files, installed packages, and build artifacts can survive session stops without external storage.

Consumption-based pricing model  
Runtime implements consumption-based pricing that charges only for resources actually consumed. Unlike allocation-based models that require pre-selecting resources, Runtime dynamically provisions what’s needed without requiring right-sizing. The service aligns CPU billing with actual active processing - typically eliminating charges during I/O wait periods when agents are primarily waiting for LLM responses - while continuously maintaining your session state.

Built-in authentication  
AgentCore Runtime, powered by AgentCore Identity, assigns distinct identities to AI agents and seamlessly integrates with your corporate identity provider such as Okta, Microsoft Entra ID, or Amazon Cognito, enabling your end users to authenticate into only the agents they have access to. In addition, Runtime lets outbound authentication flows to securely access third-party services like Slack, Zoom, and GitHub - whether operating on behalf of users or autonomously (using either OAuth or API keys).

Agent-specific observability  
AgentCore Runtime provides specialized built-in tracing that captures agent reasoning steps, tool invocations, and model interactions, providing clear visibility into agent decision-making processes, a critical capability for debugging and auditing AI agent behaviors.

Enhanced payload handling  
AgentCore Runtime can process 100MB payloads enabling seamless processing of multiple modalities (text, images, audio, video), with rich media content or large datasets.

Bidirectional streaming  
AgentCore Runtime supports both HTTP API calls and persistent WebSocket connections for real-time bidirectional streaming, enabling interactive applications with immediate response feedback and maintained conversation context.

Unified set of agent-specific capabilities  
AgentCore Runtime is delivered through a single, comprehensive SDK that provides streamlined access to the complete AgentCore capabilities including Memory, Tools, and Gateway. This integrated approach eliminates the integration work typically required when building equivalent agent infrastructure from disparate components.

**Note**  
A newer platform version, V2, is available. It starts your agent from a snapshot to keep cold starts fast and consistent regardless of concurrency or image size, and to lower cost for always-on or bursty agents. For more information, see [Platform versions](runtime-how-it-works.md#runtime-platform-versions).

**Topics**
+ [How it works](runtime-compute-how-it-works.md)
+ [Understand the AgentCore Runtime service contract](runtime-service-contract.md)
+ [IAM Permissions for AgentCore Runtime](runtime-permissions.md)
+ [Get started with AgentCore Runtime](runtime-getting-started.md)
+ [Optimize your agent for Amazon Bedrock AgentCore Runtime V2](runtime-v2-optimize.md)
+ [Use any agent framework](using-any-agent-framework.md)
+ [Use any foundation model](using-any-model.md)
+ [Deploy MCP servers in AgentCore Runtime](runtime-mcp.md)
+ [Stateful MCP server features](mcp-stateful-features.md)
+ [Deploy A2A servers in AgentCore Runtime](runtime-a2a.md)
+ [Deploy AG-UI servers in AgentCore Runtime](runtime-agui.md)
+ [Use isolated sessions for agents](runtime-sessions.md)
+ [File system configurations for AgentCore Runtime](runtime-filesystem-configurations.md)
+ [Handle asynchronous and long running agents with Amazon Bedrock AgentCore Runtime](runtime-long-run.md)
+ [Stream agent responses](response-streaming.md)
+ [Bidirectional streaming](runtime-bidirectional-streaming.md)
+ [Pass custom headers to Amazon Bedrock AgentCore Runtime](runtime-header-allowlist.md)
+ [Authenticate and authorize with Inbound Auth and Outbound Auth](runtime-oauth.md)
+ [AgentCore Runtime versioning and endpoints](agent-runtime-versioning.md)
+ [Invoke an AgentCore Runtime agent](runtime-invoke-agent.md)
+ [Shell execution](runtime-shell-execution.md)
+ [Observe agents in Amazon Bedrock AgentCore Runtime](runtime-observability.md)
+ [Security best practices for AgentCore Runtime](runtime-security-best-practices.md)
+ [Troubleshoot AgentCore Runtime](runtime-troubleshooting.md)