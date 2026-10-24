

# Get started with Amazon Bedrock AgentCore
<a name="agentcore-get-started-cli"></a>

This quickstart gets you from zero to a running agent in a few minutes using the AgentCore CLI. You will install the CLI, scaffold a project, test locally, deploy to AWS, and invoke your agent.

Two ways to build an agent on AgentCore, same CLI:
+  **Managed harness**. You declare the agent in a config file (model, prompt, tools, memory) and AgentCore runs the loop for you. No framework, no orchestration code. Good path when you want the fastest route from idea to a running agent. [Learn more](harness.md).
+  **Code-based agent**. You write the agent loop in Python or TypeScript using a framework you already know (Strands, LangChain, or the Vercel AI SDK), and deploy it to AgentCore Runtime. Full control over orchestration logic.

This page walks through the code-based flow. For harness, see [What is the AgentCore harness](harness.md).

## Sign up for an AWS account
<a name="sign_up_for_an_shared_id_aws_account"></a>

### Sign up for an AWS account
<a name="sign-up-for-aws"></a>

To get started with AWS, you need an AWS account. For information about creating an AWS account, see [Getting started with an AWS account](https://docs.aws.amazon.com/accounts/latest/reference/getting-started.html) in the * AWS Account Management Reference Guide*.

## Prerequisites
<a name="agentcore-get-started-cli-prerequisites"></a>
+  **Node.js 20.12 or later.** The AgentCore CLI is distributed as an npm package. Check with `node --version`. Install from [nodejs.org](https://nodejs.org) if needed.
+  **npm.** Included with Node.js.
+  **An AWS account with credentials configured.** Configure via AWS CLI, environment variables, or an AWS profile. See [Configuring the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).
+  **Python 3.10 or later** (for agent code). Check with `python3 --version`.
+  **uv.** The generated Python project uses `uv` to install and manage dependencies. See [Installing uv](https://docs.astral.sh/uv/getting-started/installation/).
+  **IAM permissions.** Your identity needs permissions to make AgentCore API calls and to assume the CDK bootstrap roles used during deployment. See [Use the AgentCore CLI](runtime-permissions.md#runtime-permissions-cli).
+  **Model access.** Amazon Bedrock enables access to foundation models by default. Available models include Amazon Nova, Anthropic Claude, Meta Llama, and Mistral AI models. To use non-foundation models, follow the [model access steps](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html#model-access-sdk-step4).
+  **Container engine (for local container development only).** Docker, Podman, or Finch is required to run `agentcore dev` with the `agent-python-strands-container` template. Cloud container builds and deployments use AWS CodeBuild and do not require a local container engine. The `agent-python-strands` template in this quickstart uses a `CodeZip` build.

This quickstart uses Amazon Bedrock and AgentCore Memory. The CLI’s default recipe does not apply to China Regions. For the CLI-specific alternatives and restrictions, see [CLI project scope in China Regions](#agentcore-get-started-cli-china).

## Step 1: Install the AgentCore CLI
<a name="agentcore-get-started-cli-install"></a>

```
npm install -g @aws/agentcore
```

Verify:

```
agentcore --version
```

**Note**  
If this reports an error instead of a version number, an older Python `agentcore` command is shadowing the npm one on your `PATH`. This happens if you previously installed the `bedrock-agentcore-starter-toolkit` pip package, and is most common on Windows. Run `pip uninstall bedrock-agentcore-starter-toolkit`, then open a new terminal and try again.

To update later, rerun the install command or `agentcore update`. Source and issues: [agentcore-cli on GitHub](https://github.com/aws/agentcore-cli).

Run `agentcore` without arguments to browse commands interactively. Type to filter the list, then select a command to open its workflow or command-line help.

![Filtering the AgentCore CLI command picker.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/commands-home.gif)


## Step 2: Create your project
<a name="agentcore-get-started-cli-create"></a>

```
agentcore create \
  --name MyProject \
  --template agent-python-strands
```

The `--template agent-python-strands` option creates a code-based Python agent that uses the Strands Agents SDK and Amazon Bedrock. The CLI also:
+ Creates the `agent` Runtime and its application code.
+ Adds an AgentCore Memory resource.
+ Installs the CDK and Python dependencies with `npm install` and `uv sync`.
+ Initializes a Git repository.

Run `agentcore create` without flags to use the interactive wizard. The wizard defaults to a managed harness. For a code-based project, choose **code-based**, a template, and, for templates that support it, a model provider and model before reviewing the configuration. Passing only `--name` creates a managed harness project, so specify `--template` when creating a code-based project non-interactively.

![Creating a code-based project by choosing its name, type, template, model provider, and model.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/project-create-code.gif)


For all available commands and options, see [AgentCore CLI](agentcore-cli-way-to-interact.md).

### Build types
<a name="agentcore-get-started-cli-build-types"></a>

The `agent-python-strands` template creates a `CodeZip` Runtime. This build type packages your code in a zip file and does not require Docker.

To create the same Strands agent as a container image instead, use the container template:

```
agentcore create \
  --name MyProject \
  --template agent-python-strands-container
```

The CDK application uploads the container source and uses AWS CodeBuild to build the image and push it to Amazon ECR during deployment. You need a running Docker, Podman, or Finch engine only when testing this container locally with `agentcore dev`.

### Choose a Runtime model provider
<a name="agentcore-get-started-cli-model-providers"></a>

The Python Strands, Python Strands container, A2A Python Strands, AG-UI Python Strands, and TypeScript Strands templates support model-provider choices in the interactive `agentcore create` wizard. Run `agentcore create` without flags, choose **code-based**, and then choose the template, provider, model, and API-key file.

The noninteractive `agentcore create --template <template>` command uses the template’s default model provider. It does not accept model-provider flags. The `agentcore add runtime` command is for code that you write yourself. It does not select a model provider or generate model integration code.

The wizard supports the following model providers for templates that implement them:
+ Amazon Bedrock
+ Anthropic
+ OpenAI
+ Gemini
+ LiteLLM
+ OpenAI-compatible endpoints

TypeScript Strands does not support LiteLLM. Use an OpenAI-compatible endpoint instead. Amazon Bedrock uses AWS credentials. For providers that need an API key, select a local key file or stdin in the wizard. The CLI stores the key in `agentcore/.env.local`. Do not commit that file or the source key file.

An OpenAI-compatible provider requires an endpoint URL, an explicit model ID served by that endpoint, and an API key. Use only a trusted endpoint because it receives the API key. The wizard shows provider defaults and model-catalog links. Confirm model access with your provider.

Harness model configuration uses a different set of options. See [Models and instructions](harness-models.md).

### CLI project scope in China Regions
<a name="agentcore-get-started-cli-china"></a>

In `cn-north-1` and `cn-northwest-1`, this CLI release supports the following project additions:
+ Runtimes and runtime endpoints
+ Credentials
+ Gateways and nonconnector gateway targets

It blocks these project resources and templates:
+ Harnesses
+ Memory
+ Gateway connector targets
+ The `environment-python-bma` template

In the interactive create wizard, you can choose an OpenAI-compatible endpoint with an explicit endpoint, model ID, and key. With Python templates, you can also choose LiteLLM with an explicit model ID that does not use the `bedrock/` prefix. Provider-free templates such as `agent-python-minimal` and `mcp-python-fastmcp` are another alternative. The CLI omits default Memory when scaffolding an allowed template in a China Region.

You can also use `agentcore add runtime` to register Python or TypeScript code that you write yourself. Because the CLI does not generate or inspect your model integration, verify that your code calls a model or endpoint that is reachable from the target China Region.

These are CLI validation rules, not a guarantee of model or endpoint reachability from China or a complete list of regional service availability. Verify access to your chosen endpoint and the services that your application uses.

### Project structure
<a name="agentcore-get-started-cli-project-structure"></a>

The create command generates the following code-based project:

```
MyProject/
├── .gitignore
├── agentcore/
│   ├── .env.local
│   ├── agentcore.json
│   ├── aws-targets.json
│   └── cdk/
└── app/
    └── agent/
        ├── .gitignore
        ├── README.md
        ├── main.py
        ├── memory/
        │   ├── __init__.py
        │   └── session.py
        ├── model/
        │   ├── __init__.py
        │   └── load.py
        ├── parse.py
        └── pyproject.toml
```

Key files:
+  `agentcore/agentcore.json` - The project specification. It defines your runtimes, harnesses, memory stores, gateways, credentials, and other resources. The `agentcore add` and `agentcore remove` commands manage this file.
+  `agentcore/aws-targets.json` - The AWS accounts and Regions for deployment.
+  `agentcore/.env.local` - Local secrets, such as API keys for Runtime model providers and project-managed Harness credentials.
+  `agentcore/cdk/` - The CDK application that builds and deploys the project resources. See [Customize the project’s CDK code](customize-project-cdk-code.md) to add resources beyond the project specification.
+  `app/agent/main.py` - The Runtime entrypoint and Strands agent implementation.
+  `app/agent/model/load.py` - The model that the agent uses.
+  `app/agent/memory/session.py` - The AgentCore Memory session manager and retrieval settings.

## Step 3: Test locally
<a name="agentcore-get-started-cli-test"></a>

```
cd MyProject
agentcore dev --mode browser
```

The command starts the Runtime locally with hot reload and opens the **agent inspector** in your browser so you can chat with the agent and inspect local traces. The create command installed the dependencies and created the Python virtual environment in Step 2.

Without `--mode browser`, `agentcore dev` defaults to headless mode and streams the Runtime output to your terminal.

## Step 4: Deploy your agent
<a name="agentcore-get-started-cli-deploy"></a>

Build the deployable artifacts and validate the project before deploying:

```
agentcore build
```

Deploy the project:

```
agentcore deploy
```

The deploy command does the following:

1. Packages your code into a zip artifact

1. Uses AWS CDK under the hood to synthesize and provision resources

1. Creates an AgentCore Runtime endpoint for your agent

1. Configures CloudWatch logging and observability

First deploy takes a few minutes while CDK bootstraps your account. Subsequent deploys are faster.

Check status:

```
agentcore status
```

## Step 5: Invoke your deployed agent
<a name="agentcore-get-started-cli-invoke"></a>

```
agentcore invoke --runtime agent \
  --payload '{"prompt":"Hello, what can you do?"}'
```

To iterate, edit `app/agent/main.py`, test with `agentcore dev --mode browser`, deploy with `agentcore deploy`, and invoke with `agentcore invoke --runtime agent`.

## Add capabilities to your project
<a name="agentcore-get-started-cli-add-capabilities"></a>

 `agentcore add` manages resources in `agentcore.json`. Run it without arguments for the interactive menu, or target a resource directly. Each resource opens a wizard when you run it without options.

For example, `agentcore add runtime` prompts for a name, language, and protocol, and then displays the configuration for review. It registers a Runtime for code that you write yourself. The command creates `app/<name>/README.md` and `app/<name>/AGENTS.md` with the selected protocol contract, but it does not generate application code or dependencies and does not overwrite files already in the directory.

```
agentcore add memory    # Store conversation context
agentcore add runtime   # Add another Runtime
agentcore add gateway   # Connect APIs and tools through Gateway
```

To add a Runtime without the wizard, pass its language and protocol:

```
agentcore add runtime \
  --name worker \
  --language python \
  --protocol HTTP
```

The Runtime starts as a direct code (`CodeZip`) build with `main.py` for Python or `main.js` for TypeScript. Follow the generated README to add the entrypoint and dependency manifest. When you run `agentcore dev`, `agentcore build`, or `agentcore deploy`, the CLI synchronizes `agentcore.json` with the code. A `Dockerfile` switches the Runtime to a container build. For Python, `requires-python` in `pyproject.toml` constrains the managed runtime version and `[tool.agentcore].entrypoint` can select another entrypoint. For TypeScript, `engines.node` constrains the Node.js version and the CLI bundles `main.ts`.

To translate an existing agent from [Agents for Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html) into Amazon Bedrock AgentCore Runtime code, pass its agent ID instead. Do not pass `--language` or `--protocol` with an import.

Replace `<bedrock-agent-id>` with your agent ID and `<prepared-agent-alias-id>` with your prepared alias ID:

```
agentcore add runtime \
  --name imported_agent \
  --agent-id <bedrock-agent-id> \
  --agent-alias-id <prepared-agent-alias-id> \
  --framework strands
```

To add another kind of resource without its wizard, pass its options on the command line. Run `agentcore add <resource> --help` to see the options.

After adding resources, run `agentcore deploy` to provision them.

Deep dives for the capabilities you can attach:
+  [AgentCore Memory](memory.md) - short-term and long-term memory, retrieval strategies
+  [AgentCore Gateway](gateway.md) - governed connectivity to APIs and MCP servers
+  [AgentCore Browser](browser-tool.md) - managed web browsing for agents
+  [AgentCore Code Interpreter](code-interpreter-tool.md) - sandboxed code execution
+  [AgentCore Identity](identity.md) - OAuth, API key credential providers, workload identity
+  [AgentCore Observability](observability.md) - traces, logs, and metrics in CloudWatch
+  [AgentCore VPC](agentcore-vpc.md) - run agents inside your VPC
+  [AgentCore Payments](payments.md) - microtransaction payments for agents via x402

## View logs and traces
<a name="agentcore-get-started-cli-logs"></a>

```
# Stream Runtime logs
agentcore logs runtime

# Search a past window
agentcore logs runtime --since 30m --level error
agentcore logs runtime --since 1h --query "timeout"

# List recent Runtime traces
agentcore traces runtime list --since 30m

# Download a specific trace
agentcore traces runtime get <trace-id>
```

## Troubleshoot
<a name="agentcore-get-started-cli-troubleshoot"></a>

 **Permission denied errors**   
Verify your credentials with `aws sts get-caller-identity`. Make sure that your identity has the permissions in [Use the AgentCore CLI](runtime-permissions.md#runtime-permissions-cli).

 **Model access denied**   
Amazon Bedrock enables access to foundation models by default. To use a non-foundation model, follow the [model access steps](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html#model-access-sdk-step4).

 **Port already in use**   
Run `agentcore dev --port 8081` to use a different local port for the Runtime, or add `--ui-port` to change the Agent Inspector port. When you invoke locally, pass the same port with `agentcore invoke --runtime agent --local --port 8081`.

 **Deployment errors**   
Run `agentcore build --debug` to rebuild the deployable artifacts with debug logging before retrying `agentcore deploy --debug`.

 **Configuration validation errors**   
Run `agentcore build` to validate the project specification and build its deployable artifacts.

For more information, see [Troubleshoot Amazon Bedrock AgentCore Runtime](runtime-troubleshooting.md).

## Clean up
<a name="agentcore-get-started-cli-cleanup"></a>

```
agentcore remove all --yes
agentcore deploy --yes
```

 `remove all` removes every resource from the project specification. The follow-up deploy detects the empty state and tears down the project’s deployed stack. The `--yes` option confirms the teardown without an interactive prompt.

## Next steps
<a name="agentcore-get-started-cli-next-steps"></a>
+  [What is the AgentCore harness](harness.md) - the config-based path to a running agent. Use any model, connect to tools, persist state, deploy in your VPC, and graduate to code when you need it.
+  [AgentCore code samples](https://github.com/awslabs/amazon-bedrock-agentcore-samples) - end-to-end examples across frameworks and capabilities.