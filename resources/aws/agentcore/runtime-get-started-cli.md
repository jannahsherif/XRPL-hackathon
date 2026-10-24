

# Get started with AgentCore Runtime using the AgentCore CLI
<a name="runtime-get-started-cli"></a>

This page provides a concise workflow for creating and deploying a code-based Strands agent to AgentCore Runtime. For CLI installation, complete prerequisites, project structure, capabilities, observability, and cleanup, see [Get started with Amazon Bedrock AgentCore](agentcore-get-started-cli.md).

## Create and test your agent
<a name="runtime-get-started-cli-create"></a>

Create a Python project that uses the Strands Agents SDK and Amazon Bedrock:

```
agentcore create \
  --name MyProject \
  --template agent-python-strands
```

The template creates a Python `CodeZip` Runtime named `agent`, adds an AgentCore Memory resource, and installs the project dependencies.

You can also run `agentcore` with no arguments to open the interactive menu. Outside a project, the menu offers create. Inside a project, it offers deploy, invoke, and status. Choosing dev from the menu starts the local server in headless mode. To open the Agent Inspector, run `agentcore dev --mode browser`.

To choose the template interactively, run `agentcore create` without options:

![Creating a Python Strands project with the interactive wizard.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/project-create-code.gif)


Start the Runtime locally and open the Agent Inspector:

```
cd MyProject
agentcore dev --mode browser
```

Without `--mode browser`, `agentcore dev` defaults to headless mode and streams the Runtime output to your terminal.

## Build and deploy your agent
<a name="runtime-get-started-cli-deploy"></a>

```
agentcore build
agentcore deploy
```

Check the deployed resources:

```
agentcore status
```

Invoke the deployed Runtime:

```
agentcore invoke --runtime agent \
  --payload '{"prompt":"Hello, what can you do?"}'
```

Iterate on `app/agent/main.py`, test locally, and deploy again when you are ready.

## Troubleshoot
<a name="common-issues"></a>

For common CLI installation, deployment, configuration, and observability issues, see [Troubleshoot](agentcore-get-started-cli.md#agentcore-get-started-cli-troubleshoot).

## Next steps
<a name="runtime-get-started-cli-next-steps"></a>
+  [Get started with Amazon Bedrock AgentCore](agentcore-get-started-cli.md) - use the complete AgentCore CLI workflow.