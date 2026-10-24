

# Get started with AgentCore Runtime using the AgentCore CLI in TypeScript
<a name="runtime-get-started-cli-typescript"></a>

This page provides a concise workflow for creating and deploying a code-based TypeScript Strands agent to AgentCore Runtime. For CLI installation, complete prerequisites, project capabilities, observability, and cleanup, see [Get started with Amazon Bedrock AgentCore](agentcore-get-started-cli.md).

## Prerequisites
<a name="ts-prerequisites"></a>
+ Install the AgentCore CLI as described in [Install the AgentCore CLI](agentcore-get-started-cli.md#agentcore-get-started-cli-install).
+ Configure your AWS credentials and permissions as described in [Prerequisites](agentcore-get-started-cli.md#agentcore-get-started-cli-prerequisites).
+ Install Node.js 22 or later.

## Create your agent project
<a name="ts-create-agent"></a>

Create a TypeScript project that uses the Strands Agents SDK and Amazon Bedrock:

```
agentcore create \
  --name MyTsProject \
  --template agent-typescript-strands
```

The template creates a Node.js 22 `CodeZip` Runtime, adds an AgentCore Memory resource, and installs the project dependencies.

For other model providers and the CLI’s China Region restrictions, see [Choose a Runtime model provider](agentcore-get-started-cli.md#agentcore-get-started-cli-model-providers) and [CLI project scope in China Regions](agentcore-get-started-cli.md#agentcore-get-started-cli-china). TypeScript Strands supports the `openai_compatible` provider but not `lite_llm`.

You can also run `agentcore` with no arguments to open the interactive menu. Outside a project, the menu offers create. Inside a project, it offers deploy, invoke, and status. Choosing dev from the menu starts the local server in headless mode. To open the Agent Inspector, run `agentcore dev --mode browser`.

## Test your agent locally
<a name="ts-test-locally"></a>

Start the Runtime locally and open the Agent Inspector:

```
cd MyTsProject
agentcore dev --mode browser
```

Without `--mode browser`, `agentcore dev` defaults to headless mode and streams the Runtime output to your terminal.

## Build and deploy your agent
<a name="ts-deploy-runtime"></a>

```
agentcore build
agentcore deploy
```

Check the deployed resources:

```
agentcore status
```

## Invoke your deployed agent
<a name="ts-test-deployed-agent"></a>

```
agentcore invoke --runtime agent \
  --payload '{"prompt":"Hello, what can you do?"}'
```

Iterate on `app/agent/main.ts`, test locally, and deploy again when you are ready.

## Troubleshoot
<a name="ts-common-issues"></a>

For common CLI installation, deployment, configuration, and observability issues, see [Troubleshoot](agentcore-get-started-cli.md#agentcore-get-started-cli-troubleshoot).

## Next steps
<a name="runtime-get-started-cli-typescript-next-steps"></a>
+  [Get started with Amazon Bedrock AgentCore](agentcore-get-started-cli.md) - use the complete AgentCore CLI workflow.