

# Understand the available interfaces for using Amazon Bedrock AgentCore
<a name="develop-agents"></a>

Amazon Bedrock AgentCore supports various interfaces for developing and deploying your agent code. The simplest approach is to use the AgentCore Python SDK to create your agent code and use the AgentCore CLI to deploy your agent.

To call the full set of AgentCore operations, use the AWS SDK.

**Topics**
+ [AgentCore CLI](#agentcore-cli-configure-deploy)
+ [AgentCore Python SDK](#develop-agents-bedroock-agentcore-sdk)
+ [Amazon Bedrock AgentCore MCP server](#develop-agents-bedroock-agentcore-mcp-server)
+ [AWS SDK](#develop-agents-bedrock-agentcore-aws-sdk)
+ [Amazon Bedrock AgentCore console](#develop-agents-console)
+ [AWS Command Line Interface](#bedrock-agentcore-configure-deploy-cli)

## AgentCore CLI
<a name="agentcore-cli-configure-deploy"></a>

The [AgentCore CLI](https://github.com/aws/agentcore-cli) is a Node.js command-line tool for creating, configuring, deploying, and managing agents on Amazon Bedrock AgentCore. It requires Node.js 20.12 or later.

Install the AgentCore CLI globally with npm:

```
npm install -g @aws/agentcore
```

The AgentCore CLI provides the following key commands:
+  *agentcore create* : Set up a project from a code or managed harness template
+  *agentcore deploy* : Deploy the resources declared by the project
+  *agentcore dev* : Run a project Runtime locally, or deploy a project Harness and test it through the Agent Inspector
+  *agentcore invoke* : Invoke a deployed Runtime, harness, or Gateway in the project, or an existing one by ID or ARN
+  *agentcore status* : Check the deployment status of project resources

Configuration is managed through JSON files in the `agentcore/` directory of your project. These files include `agentcore.json` for project settings and `aws-targets.json` for AWS deployment targets. Each harness is configured in a `harness.yaml` file in its application directory.

Under the hood, the AgentCore CLI uses AWS CDK constructs from the `@aws/agentcore-cdk` package to provision and manage AWS resources.

For step-by-step instructions, see [Get started with the AgentCore CLI](runtime-get-started-cli.md).

To add AWS resources, permissions, or configuration beyond what `agentcore.json` declares, edit the generated CDK stack in `agentcore/cdk/lib/cdk-stack.ts`. For details, see [Customize the project’s CDK code](customize-project-cdk-code.md).

For Runtime provider selection, see [Choose a Runtime model provider](agentcore-get-started-cli.md#agentcore-get-started-cli-model-providers). For cloud-backed Harness testing, see [Test a Harness with the Agent Inspector](harness-get-started.md#harness-development).

## AgentCore Python SDK
<a name="develop-agents-bedroock-agentcore-sdk"></a>

The [AgentCore Python SDK](https://github.com/aws/bedrock-agentcore-sdk-python) provides Python primitives for agent development with built-in support for:
+  *Runtime* : A lightweight wrapper over the AgentCore operations in the AWS SDK for writing agent code in Python.
+  *Memory* : Persistent storage for conversation history and agent context
+  *Tools* : Built-in clients for code interpretation and browser automation
+  *Identity* : Secure authentication and access management
+  *AgentCore Evaluations* : Automated assessment tools for measuring agent performance

The AgentCore Python SDK supports multiple frameworks, such as Strands Agents and LangGraph. If you are using other AWS services, you’ll need to use the AWS SDK to integrate those services into your agent, alongside your AgentCore Python SDK code.

## Amazon Bedrock AgentCore MCP server
<a name="develop-agents-bedroock-agentcore-mcp-server"></a>

The AgentCore Model Context Protocol (MCP) server helps you transform, deploy, and test AgentCore-compatible agents directly from your preferred development environment. With built-in support for runtime integration, gateway connectivity, and agent lifecycle management, the MCP server simplifies moving from local development to production deployment on AgentCore services.

The MCP server works with popular MCP clients including Kiro, Cursor, Claude Code, and Amazon Q CLI, providing conversational commands to automate complex agent development workflows.

For more information, see [Amazon Bedrock AgentCore MCP Server: Vibe coding with your coding assistant](mcp-getting-started.md).

## AWS SDK
<a name="develop-agents-bedrock-agentcore-aws-sdk"></a>

You can use the AWS SDK to achieve the same results as the AgentCore Python SDK, and to call any other AgentCore operation. You’ll need to use the AWS SDK to interact with other AWS services such as AWS Lambda and Amazon S3. You also need the AWS SDK if you don’t use Python.

To configure and deploy an agent, you use the [AgentCore control plane API](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/Welcome.html) . For example, you can create an AgentCore Runtime or create an AgentCore Memory.

At runtime, you use the [AgentCore data plane API](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/Welcome.html) for tasks such as adding a memory event to an AgentCore Memory. The client code that calls your agent uses the `InvokeAgentRuntime` data plane operation to invoke an agent that you have hosted in an AgentCore Runtime.

## Amazon Bedrock AgentCore console
<a name="develop-agents-console"></a>

You can use the AgentCore console to create and manage the AgentCore services that your agent code uses. You can get code snippets that show how to call an agent hosted in AgentCore Runtime. You can also test your agent in the agent sandbox. Open the console at [https://console.aws.amazon.com/bedrock-agentcore/home\#](https://console.aws.amazon.com/bedrock-agentcore/home#).

## AWS Command Line Interface
<a name="bedrock-agentcore-configure-deploy-cli"></a>

You can use the AWS CLI with the AgentCore services that you use. Use [control plane api](https://docs.aws.amazon.com/cli/latest/reference/bedrock-agentcore-control/) to create and manage services. For example you can create an AgentCore Memory or update the endpoint for an AgentCore Runtime. You can also perform runtime actions with the [data plane API](https://docs.aws.amazon.com/cli/latest/reference/bedrock-agentcore/) , which can be useful for testing an agent.