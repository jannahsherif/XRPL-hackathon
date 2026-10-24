# Use the MCP SDK
source: https://developer.mastercard.com/platform/documentation/agent-toolkit/install-mcp-sdk/index.md

Use the Mastercard Developers MCP SDK if you want to embed the MCP server in your own application or customize the behavior.

The SDK is open source and available on [GitHub](https://github.com/mastercard/developers-agent-toolkit)

1. Install the SDK in your project. You can then use the included `MastercardDevelopersAgentToolkit` class to serve your content over stdio.

   ```bash
   npm install --save @mastercard/developers-agent-toolkit
   ```

2. To launch an MCP server that communicates via standard input/output (stdio), create a file called server.mjs and paste in the following code:

   ```JS

   import { MastercardDevelopersAgentToolkit } from "@mastercard/developers-agent-toolkit/mcp";
   import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

   const server = new MastercardDevelopersAgentToolkit({});

   async function main() {
     const transport = new StdioServerTransport();
     await server.connect(transport);
     console.error("Mastercard Developers MCP Server running on stdio");
   }

   main().catch((error) => {
     console.error("Fatal error in main():", error);
     process.exit(1);
   });
   ```

3. Run the server.

   ```bash
   node server.mjs
   ```

4. You'll see a message like - `Mastercard Developers MCP Server running on stdio`

   At this point, your server is live and ready to be connected to any MCP-compatible client.

## Integration with MCP Clients {#integration-with-mcp-clients}

You can connect this SDK-hosted server to any MCP-compatible client (such as Claude Desktop, Cursor, or VS Code). Integration steps may vary depending on the client, but most tools support launching the server via a config file, for example, tools like Cursor use a file called `mcp.config.json`.

### Configuration Options {#configuration-options}

You can launch the MCP server with specific context to limit the scope to one Mastercard service or API. This helps AI agents focus only on what's relevant.

|       Option       |                                      What it does                                       |                                    Example                                     |
|--------------------|-----------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| `service`          | Tells the MCP server to focus on a single service's documentation                       | `https://developer.mastercard.com/mdes-customer-service/documentation `        |
| `apiSpecification` | Provides a raw OpenAPI/Swagger spec URL, overriding the service config if both are used | `https://static.developer.mastercard.com/content/match/swagger/match-pro.yaml` |

Alert: If you specify service or api-specification then the get-services-list tool will be disabled.

## FAQs {#faqs}


This MCP is exclusively for Mastercard Developers. The MCP toolkit is completely free to use. Yes. You can install and run the MCP server locally using Node.js. This gives you full control over configuration and integration.

<br />

### Support {#support}

Can't find the answer you're looking for?

<br />

