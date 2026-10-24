# Mastercard Developers Agent Toolkit
source: https://developer.mastercard.com/platform/documentation/agent-toolkit/index.md

## Overview {#overview}

The Mastercard Developers Agent Toolkit connects AI assistants and IDEs to Mastercard Developers via the Model Context Protocol (MCP). The Mastercard Developers MCP server exposes product docs, API specs, and guides on Mastercard Developers as structured tools, so assistants can answer questions, discover operations, and generate code with the latest information. Start with the prebuilt server for Claude Desktop, VS Code, or Cursor, or use the SDK to run a server customized to your stack.

## What's in the Mastercard Developers Agent Toolkit? {#whats-in-the-mastercard-developers-agent-toolkit}

PREBUILT Mastercard Developers MCP Server

Run a ready-to-use MCP server that works with Claude, Cursor, and other MCP clients.

[Quickstart →](https://developer.mastercard.com/platform/documentation/agent-toolkit/index.md#mastercard-developers-remote-mcp-server)
SDK Model Context Protocol (MCP) SDK

Build your own MCP server to expose Mastercard docs and metadata to any agent.

[SDK Guide →](https://developer.mastercard.com/platform/documentation/agent-toolkit/install-mcp-sdk/index.md)

## MCP Server {#mcp-server}

Mastercard Developers provides two options for setting up an MCP Server:

1. **Remote (recommended):** The remote option is easier to set up, requires minimal configuration, and does not require running an additional local process or installing dependencies such as Node or npx.

2. **Local:** The local option is better suited for agent developers or environments that need integration with local tools, more granular service access, or additional customization.

### Mastercard Developers Remote MCP Server {#mastercard-developers-remote-mcp-server}

Select the option that suits your setup to install the the remote MCP Server for your client.

If you'd like to first learn how Mastercard Developers MCP server works and understand the use cases, read [Model Context Protocol](https://developer.mastercard.com/platform/documentation/agent-toolkit/mcp-overview/index.md).
To add MCP to Claude code, run the following command.

```html
claude mcp add --transport http mastercard-developers https://developer.mcp.mastercard.com  
```

To learn more, see the Claude Code  [documentation](https://code.claude.com/docs/en/mcp#configure-mcp-servers).
Click **Add to VS Code** to install the MCP in Cursor.
Add to VS Code

Optionally, add the following to your  `.vscode/mcp.json`  file:

```JSON
{ 
  "servers": { 
    "mastercard-developers": { 
      "type": "http", 
      "url": "https://developer.mcp.mastercard.com" 
    } 
  } 
} 
```

To learn more, see the VS Code  [documentation](https://code.visualstudio.com/docs/agent-customization/mcp-servers).
Click **Add to Cursor** to install the MCP in Cursor.
Add to Cursor

<br />

Optionally, add the following to your `~/.cursor/mcp.json` file:

```JSON

{ 
  "mcpServers": { 
    "mastercard-developers": { 
      "url": "https://developer.mcp.mastercard.com" 
    } 
  } 
} 
```

To learn more, see the Cursor [documentation](https://docs.cursor.com/context/model-context-protocol).
Enable ChatGPT if you have a Pro, Plus, Business, Enterprise or Education account by following the  [OpenAI documentation](https://platform.openai.com/docs/guides/developer-mode) for instructions using the following parameters when setting up your custom connector:

* The server url is  <https://developer.mcp.mastercard.com>.
* Use "No Authentication" as the connection mechanism.
MCP is an open protocol supported by many applications. Your specific application documentation can advise you how to connect.

Use the server url  <https://developer.mcp.mastercard.com> and "no Authentication" if prompted.

### Setup a Local MCP Server {#setup-a-local-mcp-server}

Select the option that suits your setup and install the prebuilt Mastercard Developers MCP server for your client.  

If you'd like to first learn how Mastercard Developers MCP server works and understand the use cases, read [Model Context Protocol](https://developer.mastercard.com/platform/documentation/agent-toolkit/mcp-overview/index.md).
If you're using Claude Desktop, the fastest way to start is by installing the MCP server via a prebuilt `.dxt` file:

1. Download the [mastercard-developers-mcp-0.1.0.dxt](https://static.developer.mastercard.com/content/platform/uploads/mastercard-developers-mcp-0.1.0.dxt) (173KB) file.
2. Double-click the file to open with Claude Desktop.
3. Click **Install**.
4. Open Claude desktop, go to **Settings** \> **Extensions** and confirm that **Mastercard Developers MCP** appears in the list of installed extensions.

Optionally, add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mastercard-developers": {
      "command": "npx",
      "args": ["-y", "@mastercard/developers-mcp"]
    }
  }
}
```

Click a button below to open VS Code, then click **Install** to add the Mastercard Developers MCP server.

VS Code NPM

<br />

Optionally, add the following to your `.vscode/mcp.json file in your workspace:`

<br />

```JSON
{
  "servers": {
    "mastercard-developers": {
      "command": "npx",
      "args": ["-y", "@mastercard/developers-mcp"]
    }
  }
}
```

Click **Add to Cursor** to install the MCP server in Cursor.

Add to Cursor

<br />

Optionally, add the following to your `~/.cursor/mcp.json` file:

```JSON

 {
  "mcpServers": {
    "mastercard-developers": {
      "command": "npx",
      "args": ["-y", "@mastercard/developers-mcp"]
    }
  }
}
```

Add the following to your client's MCP configuration:

```JSON
{
  "mcpServers": {
    "mastercard-developers": {
      "command": "npx",
      "args": ["-y", "@mastercard/developers-mcp"]
    }
  }
}
```

