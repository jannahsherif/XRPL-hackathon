# Model Context Protocol
source: https://developer.mastercard.com/platform/documentation/agent-toolkit/mcp-overview/index.md

The Mastercard Developers Model Context Protocol (MCP) server allows AI agents to access and understand Mastercard's extensive developer documentation, guides, and API specifications. This means developers using AI tools (e.g., Claude, ChatGPT, Cursor, Windsurf) can ask complex questions about Mastercard services and receive contextual, reliable answers pulled straight from the source.

## What it Does {#what-it-does}

The MCP is designed to enhance the developer experience by making Mastercard's vast documentation instantly accessible and actionable for AI tools. It offers the following capabilities:

### Accelerated Integration {#accelerated-integration}

* **Real-time Documentation**: Access up-to-date service documentation directly within your development environment
* **Dynamic Code Generation**: Generate accurate, working code examples based on current API specifications
* **Service Discovery**: Quickly identify which Mastercard services solve your specific use case

### Enhanced Developer Experience {#enhanced-developer-experience}

* **Context-Aware Assistance**: Your AI agent responds using live Mastercard Developers documentation and service context
* **Reduced Research Time**: No need to manually browse documentation or search for examples
* **Always Current**: Information is pulled directly from our platform, ensuring accuracy

## How it Works {#how-it-works}

The MCP acts as a layer between your AI agent and Mastercard Developers documentation. When you ask your AI agent a query, it uses the MCP to return the necessary information.

For example, if you ask an AI agent "How do I generate an access token for Open Finance?" your AI agent queries the MCP server behind the scenes. MCP then returns details such as authentication steps, request examples, and usage guidelines from Mastercard Developers to the AI agent. The AI agent processes the info returned and responds to you with an accurate and context-aware answer.

## Use Cases {#use-cases}

See how you can use MCP-powered AI tools to accelerate your work, from identifying the right Mastercard service, to retrieving documentation, to generating working code. These examples show how agentic assistants help streamline service discovery, prototyping, and implementation.

### Rapid Prototyping {#rapid-prototyping}

**Scenario**: Building an Open Finance integration

**Developer:** "I need to integrate Open Finance to verify account ownership and check balances for my fintech app"

How the agent handles this request:

1. Analyzes requirements using the toolkit
2. Recommends Mastercard Open Finance services
3. Provides current documentation for account verification APIs
4. Generates implementation code for account linking and balance retrieval
5. Suggests testing strategies with sandbox accounts

### Service Discovery {#service-discovery}

**Scenario**: Exploring fraud prevention options

**Developer:** "What fraud prevention tools does Mastercard offer?"

How the agent handles this request:

1. Uses `get-services-list` to find fraud-related APIs
2. Retrieves detailed documentation for each option
3. Compares features and use cases

### Code Generation {#code-generation}

**Scenario**: Authenticating with Open Finance APIs

**Developer:** "I want code that generates an access token so I can start calling Open Finance US APIs"

How the agent handles this request:

1. Uses `get-api-operations-details` to retrieve documentation for Open Finance authentication
2. Extracts technical details about the token generation endpoint
3. Generates a runnable code snippet to generate a token
4. Provides guidance on token usage

### Tools Available in Mastercard Developers Agent Toolkit {#tools-available-in-mastercard-developers-agent-toolkit}

The MCP server provides a set of tools (via endpoints) that let AI agents retrieve accurate, context-aware responses for service discovery, API integration, or troubleshooting.

|      Category      |              Tool Name              |                                                                  Description                                                                  |
|--------------------|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| Service Discovery  | `get-services-list`                 | Retrieves metadata for all Mastercard services, including each service's title, description, and unique service ID.                           |
| API Operations     | `get-api-operation-list`            | Retrieves all API operations for a specified Mastercard API specification. Includes HTTP methods, paths, titles, and descriptions.            |
|                    | `get-api-operations-details`        | Retrieves detailed metadata for a specified API operation. Includes request parameters, responses, and technical specifications.              |
| Documentation      | `get-documentation`                 | Retrieves a list of all documentation sections for a given Mastercard service.                                                                |
|                    | `get-documentation-section-content` | Retrieves the full content of a specific documentation section including code samples and text.                                               |
|                    | `get-documentation-page`            | Retrieves the complete content of a full documentation page, including formatting.                                                            |
| Integration Guides | `get-oauth10a-integration-guide`    | Returns a complete integration guide for implementing OAuth 1.0a, including setup steps, code samples, and usage best practices.              |
|                    | `get-openfinance-integration-guide` | Retrieves the complete integration guide for Open Finance (previously known as Open Banking). Includes setup instructions and usage examples. |
|                    | `get-oauth20-integration-guide`     | Returns a complete integration guide for implementing OAuth 2.0, including setup steps, code samples, and usage best practices.               |

### Integration with MCP Clients {#integration-with-mcp-clients}

MCP-compatible clients (like Claude Desktop or custom AI tools) typically read from a configuration file that defines how to launch MCP servers.
Alert: This is only available for the local MCP server.

### Configuration Options {#configuration-options}

You can launch the MCP server with specific context to limit the scope to one Mastercard service or API. This helps AI agents focus only on what's relevant.

|        Option         |                                      What it does                                       |                                              Example                                               |
|-----------------------|-----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `--service`           | Tells the MCP server to focus on a single service's documentation                       | `--service https://developer.mastercard.com/mdes-customer-service/documentation`                   |
| `--api-specification` | Provides a raw OpenAPI/Swagger spec URL, overriding the service config if both are used | `--api-specification https://static.developer.mastercard.com/content/match/swagger/match-pro.yaml` |

Alert: If you provide both, `--api-specification` takes priority.

### Best Practices {#best-practices}

#### Effective Prompting {#effective-prompting}

Writing clear, focused prompts helps AI agents retrieve the most relevant and actionable information from the MCP. This section shares tips to help you phrase your queries for maximum accuracy and usefulness.

##### Be Specific About Requirements: {#be-specific-about-requirements}

* Instead of: "Help me with payments"
* Try: "I need to process recurring payments for a subscription service"

##### Ask for Complete Solutions: {#ask-for-complete-solutions}

* Instead of: "Show me the API"
* Try: "Give me the documentation and a working example for processing refunds"

##### Leverage Service Discovery: {#leverage-service-discovery}

* Instead of: "How do I verify a bank account?"
* Try: "What Mastercard services would help me verify account ownership and check balances?"

#### Default Mastercard MCP Server (All Tools) {#default-mastercard-mcp-server-all-tools}

* Launches the full default server

* Includes all tools in Mastercard's MCP tooling list

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

#### For a Specific Service Only {#for-a-specific-service-only}

* Scopes the context to a single service documentation page

* Reduces noise and focuses the agent on Open Finance (US) only

```JSON
{
  "mcpServers": {
    "mastercard-developers": {
      "command": "npx",
      "args": [
        "-y",
        "@mastercard/developers-mcp",
        "--service=https://developer.mastercard.com/open-banking-us/documentation/"
      ]
    }
  }
}
```

#### For a Specific API Specification (Overrides Service) {#for-a-specific-api-specification-overrides-service}

* Connects directly to the OpenAPI spec

* This gives the agent precise access to endpoints, parameters, and models

* `--api-specification` always takes priority over `--service` if both are used

```json
{
  "mcpServers": {
    "mastercard-developers": {
      "command": "npx",
      "args": [
        "-y",
        "@mastercard/developers-mcp",
        "--api-specification=https://developer.mastercard.com/open-banking-us/swagger/openbanking-us.yaml"
      ]
    }
  }
}
```

Once connected, you can ask the agent to generate code samples, or guide you through integration steps. For tips on how to phrase your prompts effectively, see the [Effective Prompting](https://developer.mastercard.com/platform/documentation/agent-toolkit/mcp-overview/index.md#effective-prompting) section.

## What's Next {#whats-next}

Want more control? Head to the [Use the MCP SDK](https://developer.mastercard.com/platform/documentation/agent-toolkit/install-mcp-sdk/index.md) section to embed the server in your own application or customize its behavior.
