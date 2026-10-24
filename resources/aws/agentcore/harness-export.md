

# Export harness to code
<a name="harness-export"></a>

Export harness to code takes a managed harness configuration and generates a runtime agent from it as editable Python source code using the Strands framework. The generated agent is a normal AgentCore runtime agent: you own the code, can modify it freely, and deploy it like any other agent. The generated agent carries over the harness’s model, execution limits, filesystem mounts, and the tools, skills, and memory configuration that export supports. Export records configuration that it cannot map in `EXPORT_NOTES.md`.

## When to Use Export
<a name="_when_to_use_export"></a>

Use export when you have a working harness and want to:
+  **Customize beyond what the harness config allows** – Add custom tool logic, change the agent loop, inject custom middleware or framework-specific hooks, or integrate libraries the harness doesn’t expose
+  **Own the code** - move from a declarative config to source code you control, review, and version like the rest of your application.
+  **Graduate a prototype** - start fast with a harness, then export when you’re ready to invest in a hand-maintained agent.

If the harness configuration already does everything you need, you don’t have to export - keep running it as a harness.

## What export supports
<a name="_what_export_supports"></a>
+  **Framework** - Strands
+  **Language** - Python only
+  **Build type** - CodeZip

Harness features carried into the generated agent:
+ Model provider and configuration, including the model ID and API key references (Bedrock, OpenAI, Gemini, or LiteLLM)
+ Tools - Remote MCP tools, inline function tools, and the built-in `shell` and `file_operations` tools. Export omits Gateway, AgentCore Browser, and AgentCore Code Interpreter tools and lists them in `EXPORT_NOTES.md`. Wire them into the generated agent yourself.
+ Memory - a project memory that the harness references by name. Export does not wire managed memory, which the AgentCore CLI enables by default, or a memory that the harness references by ARN. `EXPORT_NOTES.md` lists the manual steps for these. To export memory, add a project memory with `agentcore add memory`, reference it from the harness by name, and export again.
+ Execution limits
+ Conversation truncation
+ Skills (S3, Git). Export rejects a harness that uses path skills. Export omits AWS skills and lists them in `EXPORT_NOTES.md`.
+ Filesystem mounts (session storage, and EFS and S3 Files for VPC harnesses)
+ Authorizer configuration

## CLI Usage
<a name="_cli_usage"></a>

### Command Syntax
<a name="_command_syntax"></a>

```
agentcore export harness --arn <arn> [options]
```

### Options
<a name="_options"></a>


| Flag | Description | Default | 
| --- | --- | --- | 
|  `--arn <arn>`  | ARN of a deployed harness to fetch and export. Inside a project, adds a Runtime to that project. Outside a project, creates a new project in the current directory. |  `arn` or `name` required | 
|  `--name <name>`  | Name of a harness in the current CLI project. Requires an existing project. |  `arn` or `name` required | 
|  `--project-name <name>`  | Name of the new destination project. Available only when exporting by ARN outside an existing project. |  `Export` followed by the harness name without underscores, truncated to 23 characters | 
|  `--target-agent-name <name>`  | Name for the generated runtime agent | Derived from the harness name with an `Agent` suffix, shortened as needed to fit resource-name limits | 
|  `--json`  | Output results as JSON | False | 

### Examples
<a name="_examples"></a>

Export into an existing project:

```
# Export a deployed harness into the current project
agentcore export harness --arn arn:aws:bedrock-agentcore:us-east-1:123456789012:harness/MyHarness-AbCdEf1234

# Export a harness declared in the current project
agentcore export harness --name MyHarness

# Export with a custom agent name
agentcore export harness \
  --name MyHarness \
  --target-agent-name MyProductionAgent
```

Export by ARN from a directory outside any AgentCore project:

```
agentcore export harness \
  --arn arn:aws:bedrock-agentcore:us-east-1:123456789012:harness/MyHarness-AbCdEf1234 \
  --project-name ExportedHarness \
  --target-agent-name MyProductionAgent
cd ExportedHarness
```

The new project’s default deployment target uses the source ARN’s account and Region. Review `agentcore/aws-targets.json` before deploying to a different destination. The CLI refuses an existing destination directory instead of overwriting it; choose a different `--project-name` or working directory. Inside a project, it also refuses a colliding Runtime name or application directory.

### After export
<a name="_after_export"></a>

From the destination project root, review the generated code and `EXPORT_NOTES.md`, then build and deploy:

```
agentcore build
agentcore deploy
```

 `agentcore build` checks that the project synthesizes without deploying. In an existing project, the exported agent is added as a normal Runtime and deploys alongside the project’s other resources. For a standalone export, change to the new project directory first, as shown above.

## EXPORT\_NOTES.md
<a name="_export_notes_md"></a>

Every export writes `EXPORT_NOTES.md` in the generated agent directory. The file records configuration that could not be mapped automatically. When no manual follow-up is needed, it states that no manual steps are required. Always review `EXPORT_NOTES.md` before deploying.

## Deployment Options
<a name="_deployment_options"></a>

After exporting, you can deploy your agent to multiple hosting environments:
+  **AgentCore Runtime (managed)** - Use `agentcore deploy` to host in the AgentCore Runtime, which manages infrastructure, scaling, and credential provisioning automatically.
+  **Self-hosted** - Deploy the generated Python agent anywhere that supports Python 3.12\+:
  +  AWS services: Lambda, ECS/Fargate, EC2
  + Kubernetes clusters
  + On-premise servers
  + Any containerized environment