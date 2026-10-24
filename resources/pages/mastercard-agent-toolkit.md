# Mastercard Developers Agent Toolkit
Source: https://developer.mastercard.com/platform/documentation/agent-toolkit/ (summarized capture, 2026-10-24)

- Connects AI assistants/IDEs to Mastercard Developers via **MCP**. The server exposes product docs, API specs and guides as tools (Q&A, API operation discovery, code generation).
- **Components:** prebuilt MCP server; **SDK** for building a custom MCP server over Mastercard docs/metadata.
- **Remote server (recommended):** `https://developer.mcp.mastercard.com`, no auth.
  - Claude Code: `claude mcp add --transport http mastercard-developers https://developer.mcp.mastercard.com`
- **Local server:** `npx -y @mastercard/developers-mcp`, or Claude Desktop extension `mastercard-developers-mcp-0.1.0.dxt`.
- Clients: Claude Desktop/Code, VS Code, Cursor, ChatGPT (custom connector), any MCP client.
- Individual tool names are not listed on the page.
- Links: [SDK guide](https://developer.mastercard.com/platform/documentation/agent-toolkit/install-mcp-sdk/index.md) · [MCP overview](https://developer.mastercard.com/platform/documentation/agent-toolkit/mcp-overview/index.md)
