

# Understand the AgentCore Runtime service contract
<a name="runtime-service-contract"></a>

The AgentCore Runtime service contract defines the standardized communication protocol that your agent application must implement to integrate with the Amazon Bedrock agent hosting infrastructure. This contract ensures seamless communication between your custom agent code and AWS's managed hosting environment.

**Topics**
+ [Supported protocols](#supported-protocols)
+ [Compare supported protocols](#protocol-comparison)
+ [HTTP protocol contract](runtime-http-protocol-contract.md)
+ [MCP protocol contract](runtime-mcp-protocol-contract.md)
+ [A2A protocol contract](runtime-a2a-protocol-contract.md)
+ [AG-UI protocol contract](runtime-agui-protocol-contract.md)

## Supported protocols
<a name="supported-protocols"></a>

The AgentCore Runtime service contract supports the following communication protocols:
+  [HTTP](runtime-http-protocol-contract.md) : Direct REST API endpoints for traditional request/response patterns
+  [MCP](runtime-mcp-protocol-contract.md) : Model Context Protocol for tools and agent servers
+  [A2A](runtime-a2a-protocol-contract.md) : Agent-to-Agent protocol for multi-agent communication and discovery
+  [AG-UI](runtime-agui-protocol-contract.md) : Agent-to-User Interface protocol for interactive agent experiences with UI rendering

## Compare supported protocols
<a name="protocol-comparison"></a>

Compare the HTTP, MCP, A2A, and AG-UI protocols to understand the differences and use cases.


| Feature | HTTP Protocol | MCP Protocol | A2A Protocol | AG-UI Protocol | 
| --- | --- | --- | --- | --- | 
|  **Port**  | 8080 | 8000 | 9000 | 8080 | 
|  **Mount Path**  | /invocations (HTTP), /ws (WebSocket) | /mcp | / (root) | /invocations (SSE), /ws (WebSocket) | 
|  **Message Format**  | REST JSON/SSE, WebSocket (text/binary) | JSON-RPC | JSON-RPC 2.0 | Event streams (SSE/WebSocket) | 
|  **Discovery**  | N/A | Tool listing | Agent Cards | N/A | 
|  **Authentication**  | SigV4, OAuth 2.0; WebSocket supports SigV4 by headers and query params | SigV4, OAuth 2.0 | SigV4, OAuth 2.0 | SigV4, OAuth 2.0 | 
|  **Use Case**  | Direct API calls, real-time streaming | Tool servers | Agent-to-agent communication | Interactive UI experiences | 