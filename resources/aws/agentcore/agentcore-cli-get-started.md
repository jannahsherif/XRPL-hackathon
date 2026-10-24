

# Tutorial: Build, deploy, and operate an agent
<a name="agentcore-cli-get-started"></a>

In this tutorial, you build, deploy, and operate a production AI agent from your terminal. You start with one project and progressively add memory, tools, policy controls, evaluations, and operational workflows across seven sections. Complete the sections in order because each section builds on the resources and code from the previous section.

## 1. Install
<a name="_1_install"></a>

Install the AgentCore CLI and configure the AWS Region that you use throughout this tutorial.

### Prerequisites
<a name="_prerequisites"></a>


| Tool | Version | Check | 
| --- | --- | --- | 
| Node.js | 20.12 or newer |  `node --version`  | 
| uv | Any |  `uv --version`  | 
| Python | 3.10 or newer |  `python3 --version`  | 
|  AWS credentials | Configured in your environment |  `aws sts get-caller-identity`  | 

Docker isn’t required. The `agent-python-strands` template used in this tutorial deploys a `CodeZip` Runtime.

### Install the CLI
<a name="_install_the_cli"></a>

```
npm install -g @aws/agentcore
```

Set the AWS Region that every section uses.

```
export AWS_REGION=us-west-2
```

### Verify the installation
<a name="_verify_the_installation"></a>

```
agentcore --version
```

The command returns the installed version number.

Running `agentcore` without arguments opens the terminal user interface (TUI). Every TUI workflow also has a command-line form, and this tutorial uses command-line options so that you can run the commands as written.

Type to filter the command picker, then press Enter to open a command’s workflow or command-line help:

![Filtering the AgentCore CLI command picker.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/commands-home.gif)


## 2. Create and deploy
<a name="_2_create_and_deploy"></a>

Create a Strands agent, run it locally, and deploy it to your AWS account.

### Create the project
<a name="_create_the_project"></a>

Create a project from the Python Strands template.

```
agentcore create --name TripPlanner --template agent-python-strands
cd TripPlanner
```

The `app/agent/` directory contains your application code. The `agentcore/agentcore.json` file declares every resource that the CLI deploys. The template declares one Runtime and one Memory.

### Run the agent locally
<a name="_run_the_agent_locally"></a>

Start the local development server. The server reloads when you change the application files.

```
agentcore dev
```

From a second terminal, invoke the local agent. The reply streams as server-sent events from an Amazon Bedrock model invocation.

```
agentcore invoke --runtime agent --local \
  --payload '{"prompt":"Plan two days in Lisbon in one paragraph."}'
```

The response resembles the following:

```
data: {"event": {"contentBlockDelta": {"delta": {"text": "Start your"}, ...}}}
...
data: {"event": {"messageStop": {"stopReason": "end_turn"}}}
```

### Deploy the project
<a name="_deploy_the_project"></a>

Stop the development server with `Ctrl+C`, and then deploy the project. The first deployment bootstraps AWS CDK and can take several minutes.

```
agentcore deploy
```

The output resembles the following:

```
Created default deployment target: account 123456789012, region us-west-2
Deploying AgentCore-TripPlanner-default
Deployed project 'TripPlanner' to target 'default'
```

Invoke the deployed Runtime.

```
agentcore invoke --runtime agent \
  --payload '{"prompt":"Plan two days in Lisbon in one paragraph."}'
```

### Verify the deployment
<a name="_verify_the_deployment"></a>

```
agentcore status --json
```

The response includes the deployed Runtime and Memory:

```
{
  "projectName": "TripPlanner",
  "target": "default",
  "region": "us-west-2",
  "resources": [
    {
      "resourceType": "runtime",
      "name": "agent",
      "deploymentState": "deployed",
      "arn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/TripPlanner_default_agent-PGgpqs8dg5"
    },
    {
      "resourceType": "memory",
      "name": "agentMemory",
      "deploymentState": "deployed",
      "arn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:memory/TripPlanner_default_agentMemory-ONPlNgHMeg"
    }
  ]
}
```

Later sections use resource IDs such as `runtime-id`. The resource ID is the final segment of the ARN shown by `agentcore status`.

Without options, `agentcore status` opens the project’s linked resources in the TUI.

![Viewing a project’s resources and deployment state.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/project-status.gif)


 `agentcore build` prepares the project’s deployable artifacts. `agentcore deploy` reports progress while provisioning the declared resources:

![Building a project’s deployable artifacts.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/project-build.gif)


![Deploying a project and verifying successful completion.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/project-deploy.gif)


Run `agentcore invoke` without a resource option to choose an invocable resource. Selecting a resource opens its interactive invocation screen:

![Selecting a project resource and invoking it interactively.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/project-invoke-picker.gif)


## 3. Memory
<a name="_3_memory"></a>

Configure the agent to remember a preference from one session and apply it in a new session.

### Configure memory retrieval
<a name="_configure_memory_retrieval"></a>

The template retrieves only memories that have a relevance score of at least `0.5`. Short preference statements can score lower. In `app/agent/memory/session.py`, replace the `retrieval_config` value with the following configuration. It lowers the threshold to `0.3` and points the summaries lookup to the namespace that the Memory writes.

```
retrieval_config = {
    f"/users/{actor_id}/facts": RetrievalConfig(top_k=3, relevance_score=0.3),
    f"/users/{actor_id}/preferences": RetrievalConfig(top_k=3, relevance_score=0.3),
    f"/episodes/{actor_id}/{session_id}": RetrievalConfig(top_k=5, relevance_score=0.3),
    f"/summaries/{actor_id}/{session_id}": RetrievalConfig(top_k=3, relevance_score=0.3),
}
```

Deploy the change.

```
agentcore deploy
```

### Store a preference
<a name="_store_a_preference"></a>

Tell the agent about the traveler’s preferences. Runtime session IDs must contain at least 33 characters.

```
agentcore invoke --runtime agent \
  --session-id trip-planner-preference-session-0001 \
  --payload '{"prompt":"I am Dana. I always want a window seat and I only eat vegetarian food."}'
```

Long-term memory extraction runs after the session and can take a few minutes. List the preference records to confirm that extraction finished. The Memory ID is the final segment of the Memory ARN shown by `agentcore status`.

```
agentcore memory record list \
  --id {{memory-id}} \
  --namespace /users/default/preferences
```

If the list is empty, wait a minute and run the command again. When extraction finishes, the response resembles the following:

```
{
  "memoryRecordSummaries": [
    {
      "content": {
        "text": "{\"preference\":\"Always wants a window seat when traveling\", ...}"
      }
    },
    {
      "content": {
        "text": "{\"preference\":\"Only eats vegetarian food\", ...}"
      }
    }
  ]
}
```

The actor is `default` because the requests in this tutorial don’t include an `actorId` field. The template reads `actorId` from the payload and falls back to `default`. Until you send an actor ID in the payload or derive one from an identity token, every caller shares the same actor’s memory.

### Recall the preference
<a name="_recall_the_preference"></a>

Start a new session and ask the agent to apply the preferences without repeating them.

```
agentcore invoke --runtime agent \
  --session-id trip-planner-memory-recall-session-0002 \
  --payload '{"prompt":"I am flying to Porto next week. Which seat should I book and where should I eat?"}'
```

The reply streams as server-sent events. The text of the reply uses the preferences from the previous session and resembles the following:

```
Book a window seat. You've indicated you always prefer a window seat ...
Look for vegetarian restaurants ...
```

In the TUI, `agentcore memory` opens the Memory browser. You can inspect actors, sessions, events, and records.

![Browsing Memory commands.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/memory-menu.gif)


Use `agentcore memory list` to select a Memory and inspect its configuration:

![Selecting a Memory and viewing its configuration.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/memory-list.gif)


Events contain the conversation turns written to short-term memory. Choose a Memory, actor, session, and event to inspect the event payload:

![Opening a conversation event and inspecting its payload.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/memory-event.gif)


Records contain information extracted by long-term strategies. Choose a namespace scope, then select a record to inspect its content:

![Listing long-term memory records and opening a record’s content.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/memory-record.gif)


You can also browse sessions before selecting their events:

![Selecting a Memory session and browsing its events.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/memory-session.gif)


## 4. Tools
<a name="_4_tools"></a>

Connect the agent to an external API through AgentCore Gateway, with the API key stored by AgentCore Identity.

### Add a Gateway
<a name="_add_a_gateway"></a>

Add a Gateway that uses AWS Identity and Access Management (IAM) authorization. AgentCore Gateway provides a managed Model Context Protocol (MCP) server. During deployment, the CLI grants the Runtime permission to call it.

```
agentcore add gateway --name tools --authorizer-type AWS_IAM
```

### Store the API key
<a name="_store_the_api_key"></a>

NASA accepts `DEMO_KEY` for its Astronomy Picture of the Day API without registration. The CLI rejects inline secret values, so pass the key on standard input.

```
printf 'DEMO_KEY' | agentcore add credentials api-key \
  --name nasa \
  --api-key -
```

### Define the API
<a name="_define_the_api"></a>

Create `schemas/nasa-apod.json` with the following OpenAPI schema. Each OpenAPI operation becomes a tool. The `operationId` becomes the tool name, and the operation description helps the model decide when to use it.

```
{
  "openapi": "3.0.3",
  "info": {
    "title": "NASA Astronomy Picture of the Day",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://api.nasa.gov"
    }
  ],
  "paths": {
    "/planetary/apod": {
      "get": {
        "operationId": "getAstronomyPictureOfTheDay",
        "description": "Returns the title, explanation, and image URL of NASA's Astronomy Picture of the Day for a date. Omit the date for today's picture.",
        "parameters": [
          {
            "name": "date",
            "in": "query",
            "description": "The date of the picture in YYYY-MM-DD format. Defaults to today.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "The picture of the day"
          }
        }
      }
    }
  }
}
```

Keep the `date` property as a string. The next section writes an authorization policy against this input.

### Add the Gateway target
<a name="_add_the_gateway_target"></a>

Add the API as a target. The target uses the `nasa` credential that you stored earlier and sends the key in the `x-api-key` header.

```
agentcore add gateway-target \
  --gateway tools \
  --target-configuration \
  '{"name":"nasa","targetType":"openApiSchema","schemaSource":{"inline":{"path":"schemas/nasa-apod.json"}},"outboundAuth":{"type":"API_KEY","credentialName":"nasa"}}'
```

### Connect the agent
<a name="_connect_the_agent"></a>

Deployment sets `AGENTCORE_GATEWAY_TOOLS_URL` on the Runtime. Create `app/agent/gateway_client.py` with the following client, which signs each MCP request with the Runtime’s AWS credentials.

```
import os

import httpx
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
from botocore.session import Session
from mcp.client.streamable_http import streamablehttp_client
from strands.tools.mcp import MCPClient

GATEWAY_URL = os.getenv("AGENTCORE_GATEWAY_TOOLS_URL")
REGION = os.getenv("AWS_REGION")


class GatewayAuth(httpx.Auth):
    requires_request_body = True

    def __init__(self, region: str):
        self._credentials = Session().get_credentials()
        self._region = region

    def auth_flow(self, request: httpx.Request):
        signed = AWSRequest(
            method=request.method,
            url=str(request.url),
            data=request.content,
            headers={
                "host": request.url.host,
                "content-type": request.headers.get("content-type", ""),
            },
        )
        SigV4Auth(
            self._credentials.get_frozen_credentials(),
            "bedrock-agentcore",
            self._region,
        ).add_auth(signed)
        request.headers.update(dict(signed.headers))
        yield request


def get_gateway_client() -> MCPClient | None:
    if not GATEWAY_URL:
        return None
    return MCPClient(
        lambda: streamablehttp_client(
            GATEWAY_URL,
            auth=GatewayAuth(REGION),
        )
    )
```

Import the client in `app/agent/main.py`.

```
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from model.load import load_model
from parse import parse_payload
from memory.session import get_memory_session_manager
from gateway_client import get_gateway_client
```

Register the Gateway next to the template’s example tool.

```
tools.append(add_numbers)

gateway = get_gateway_client()
if gateway:
    tools.append(gateway)


def _make_conversation_manager():
```

Deploy the changes.

```
agentcore deploy
```

Ask the agent for information that requires the external API.

```
agentcore invoke --runtime agent \
  --session-id trip-planner-gateway-tools-session-0003 \
  --payload '{"prompt":"What is the NASA astronomy picture of the day? Provide the title and a one-sentence description."}'
```

The streamed response includes a tool invocation and the model’s answer:

```
data: {"event": {"contentBlockStart": {"start": {"toolUse": {"name": "nasa___getAstronomyPictureOfTheDay", ...}}}}}
...
data: {"event": {"contentBlockDelta": {"delta": {"text": "The title is ..."}}}}
```

### Verify the Gateway target
<a name="_verify_the_gateway_target"></a>

Call the MCP `tools/list` method on the Gateway directly.

```
agentcore invoke --gateway tools \
  --path /mcp \
  --payload '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

The response lists the NASA tool:

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "nasa___getAstronomyPictureOfTheDay",
        "description": "Returns the title, explanation, and image URL ...",
        "inputSchema": {}
      }
    ]
  }
}
```

Run `agentcore invoke --gateway tools` without `--payload` to open a JSON console for the Gateway.

If Amazon Web Search is available in your account, you can add it as a second tool:

```
agentcore add gateway-connector \
  --gateway tools \
  --name search \
  --connector web-search
```

### Browse Gateways interactively
<a name="_browse_gateways_interactively"></a>

Run `agentcore gateway` to browse the operations for deployed Gateways:

![Browsing Gateway commands.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/gateway-menu.gif)


 `agentcore gateway list` opens the Gateway list:

![Selecting a Gateway and viewing its details.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/gateway-list.gif)


Use the JSON console to invoke a Gateway and inspect the response. The following recording uses a separate demonstration Gateway with no Targets, so `tools/list` returns an empty list:

![Invoking a Gateway with a tools-list request and reading the response.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/gateway-invoke.gif)


The Target and connector menus expose operations for the tools attached to a Gateway:

![Browsing Gateway Target operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/gateway-target.gif)


![Browsing Gateway connector operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/gateway-connector.gif)


The Rule menu exposes operations for inspecting Gateway routing rules:

![Browsing Gateway Rule operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/gateway-rule.gif)


## 5. Guard the tools
<a name="_5_guard_the_tools"></a>

Use a Cedar policy to decide which tool calls the Gateway executes without changing the agent code.

### Add a Policy Engine
<a name="_add_a_policy_engine"></a>

Add a Policy Engine to the Gateway. In `enforce` mode, every tool call is denied unless a policy permits it.

```
agentcore add policy-engine \
  --name guard \
  --attach-to-gateways tools
```

### Write the policy
<a name="_write_the_policy"></a>

Create `policies/recent-pictures-only.cedar`. The policy permits the NASA tool only for dates from 2000 through 2099.

The `context.input` value contains the tool arguments, which are typed from the OpenAPI schema. Cedar doesn’t define ordering for strings, so the policy uses a `like` pattern. The `has` condition comes first because the validator rejects access to attributes that might be absent.

Tool-specific policies must identify the Gateway resource. Copy the Gateway ARN from `agentcore status` and replace the example ARN.

```
permit (
    principal,
    action == AgentCore::Action::"nasa___getAstronomyPictureOfTheDay",
    resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/tripplanner-default-tools-abcdefghij"
)
when {
    context.input has date && context.input.date like "20*"
};
```

### Add and deploy the policy
<a name="_add_and_deploy_the_policy"></a>

Add the policy to the project, and then deploy it.

```
agentcore add policy \
  --engine guard \
  --name RecentPicturesOnly \
  --statement file://policies/recent-pictures-only.cedar

agentcore deploy
```

The service validates the statement against the Gateway’s tool schema. A statement that could permit every request fails deployment with a validation finding.

If you change a target schema and its policy together, deploy the schema first. Otherwise, the service validates the policy against the schema that is already deployed.

### Test the policy
<a name="_test_the_policy"></a>

Ask for one picture that the policy denies and one that it permits.

```
agentcore invoke --runtime agent \
  --session-id trip-planner-tool-policy-session-0004 \
  --payload '{"prompt":"Show me the NASA picture for 1999-12-31, then for 2024-07-04. Provide one sentence for each."}'
```

The reply streams as server-sent events. The text of the reply resembles the following:

```
I was unable to retrieve the picture for 1999-12-31 due to a policy restriction,
but here's the one from 2024-07-04:
A Beautiful Trifid: The Trifid Nebula (M20) ...
```

### Verify the authorization decision
<a name="_verify_the_authorization_decision"></a>

Call the Gateway directly to inspect the denial.

```
agentcore invoke --gateway tools \
  --path /mcp \
  --payload '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"nasa___getAstronomyPictureOfTheDay","arguments":{"date":"1999-12-31"}}}'
```

The Gateway returns a denied-by-default error:

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32002,
    "message": "Tool Execution Denied: No policy applies to the request (denied by default)."
  }
}
```

You can also draft a policy from a natural-language prompt. Replace `gateway-arn` with the Gateway ARN from `agentcore status`.

```
agentcore gateway policy generate \
  --gateway-id {{gateway-arn}} \
  --prompt "Permit the NASA picture tool only for dates from 2000 through 2099."
```

A generated draft can contain more than one Cedar statement. Each `agentcore add policy` command adds one statement.

Run `agentcore gateway policy generate` without options to select a Gateway and enter a policy-generation prompt. The Gateway must have a Policy Engine attached. The following recording stops before submitting the prompt:

![Selecting a Gateway and entering a policy-generation prompt.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/gateway-policy.gif)


## 6. Evaluate
<a name="_6_evaluate"></a>

Create an LLM-as-a-judge evaluator that scores the agent’s sessions against criteria that you define.

### Add an evaluator
<a name="_add_an_evaluator"></a>

Add an evaluator with instructions and a rating scale. The service replaces `{context}` with the session transcript.

```
agentcore add evaluator llm-as-a-judge \
  --name TripQuality \
  --level SESSION \
  --model us.anthropic.claude-sonnet-4-5-20250929-v1:0 \
  --rating-scale 1-5-quality \
  --instructions 'Judge from {context} whether the trip planner gave concrete, useful travel advice that respected the preferences the traveler stated.'
```

### Add an online evaluation
<a name="_add_an_online_evaluation"></a>

Create an online evaluation that samples every live Runtime session and runs the custom evaluator and the built-in helpfulness evaluator after each session becomes inactive.

```
agentcore add online-eval \
  --name TripMonitor \
  --agent agent \
  --evaluators TripQuality Builtin.Helpfulness \
  --sampling-rate 100

agentcore deploy
```

Generate a session to score.

```
agentcore invoke --runtime agent \
  --session-id trip-planner-evaluation-session-0005 \
  --payload '{"prompt":"I am going to Kyoto for three days in November. Plan each day for me."}'
```

### Verify the evaluation
<a name="_verify_the_evaluation"></a>

Traces can take about a minute to become searchable. To score the session immediately instead of waiting for the online evaluation, use an on-demand evaluation.

The Runtime, evaluator, and online evaluation IDs are the final segments of the ARNs shown by `agentcore status`.

```
agentcore eval ondemand evaluate \
  --agent {{runtime-id}} \
  --evaluators {{evaluator-id}} Builtin.Helpfulness \
  --session-ids trip-planner-evaluation-session-0005 \
  --lookback-days 1
```

The response resembles the following:

```
{
  "sessionsEvaluated": 1,
  "results": [
    {
      "evaluatorName": "TripPlanner_default_TripQuality",
      "value": 3,
      "label": "Fair",
      "explanation": "... the itinerary repeatedly includes vegetarian-specific recommendations ... not based on the user's stated preferences ..."
    },
    {
      "evaluatorName": "Builtin.Helpfulness",
      "value": 0.83,
      "label": "Very Helpful",
      "explanation": "..."
    }
  ]
}
```

The custom evaluator marks the session down for vegetarian recommendations that the user didn’t state in the evaluated session. The agent retrieved that preference from Memory, but the evaluator sees only the current session transcript. Account for that context when you write evaluation criteria.

Use the following command to view the online evaluation status and the CloudWatch log group where results appear:

```
agentcore eval online-eval get --id {{online-evaluation-id}}
```

### Browse evaluations interactively
<a name="_browse_evaluations_interactively"></a>

Run `agentcore eval` to browse evaluation and optimization commands:

![Browsing evaluation and optimization commands.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/eval-menu.gif)


The evaluator and dataset menus expose operations for inspecting and managing these resources:

![Browsing evaluator operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/eval-evaluator.gif)


![Browsing dataset operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/eval-dataset.gif)


Use the batch-evaluation menu for dataset evaluation jobs and the online-eval menu for live-traffic evaluation configurations:

![Browsing batch evaluation operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/eval-batch-evaluation.gif)


![Browsing online evaluation operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/eval-online-eval.gif)


Batch insights identify themes across sessions. The recommendation menu exposes the recommendations produced by these runs:

![Browsing batch insight operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/eval-batch-insights.gif)


![Browsing recommendation operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/eval-recommendation.gif)


## 7. Operate
<a name="_7_operate"></a>

Inspect the deployed agent’s traces and logs, open a shell in its Runtime, and remove the tutorial resources.

### Inspect traces
<a name="_inspect_traces"></a>

Every invocation produces one trace. List recent traces.

```
agentcore traces runtime list --since 2h
```

The response resembles the following:

```
TRACE ID                          TIMESTAMP             SESSION ID
6aa17cf501b3bb917bca787834a9b759  2026-09-09 15:36:34Z  trip-planner-evaluation-session-0005
6aa17be2059d2dd11a5a73cc69dc9a97  2026-09-09 15:31:59Z  trip-planner-tool-policy-session-0004
```

Download a trace to inspect the model input and tool calls.

```
agentcore traces runtime get {{trace-id}}
```

### Inspect logs
<a name="_inspect_logs"></a>

Search recent error logs or stream new log records.

```
agentcore logs runtime --since 1h --level error

agentcore logs runtime --tail
```

For local development, `agentcore dev --mode browser` opens the Agent Inspector, where you can inspect local traces.

### Open a Runtime shell
<a name="_open_a_runtime_shell"></a>

Replace `runtime-id` with the final segment of the Runtime ARN shown by `agentcore status`.

```
agentcore runtime shell --id {{runtime-id}}
```

From the shell, you can inspect the running process and call the Runtime health endpoint:

```
[agentcore-runtime-user@localhost /]$ ps -eo pid,args | grep main.py
    341 /opt/aws/agentcore-runtime/python/versions/3.14.2/bin/python /var/task/main.py
[agentcore-runtime-user@localhost /]$ curl -s localhost:8080/ping
{"status":"Healthy","time_of_last_update":1788970978}
```

### Browse resources interactively
<a name="_browse_resources_interactively"></a>

Before removing the tutorial resources, you can also inspect them through the TUI. Run `agentcore runtime` to browse Runtime operations:

![Browsing Runtime operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/runtime-menu.gif)


![Viewing the Runtimes in the current Region.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/runtime-list.gif)


 `agentcore runtime shell` prompts you to select a Runtime:

![Selecting a Runtime for a shell session.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/runtime-shell.gif)


The harness menu exposes operations for deployed harnesses:

![Browsing harness operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/harness-menu.gif)


![Viewing deployed harnesses.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/harness-list.gif)


Versions and endpoints let you associate a stable endpoint with a harness version:

![Browsing harness version operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/harness-version.gif)


![Browsing harness endpoint operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/harness-endpoint.gif)


 `agentcore harness exec` opens a shell in a harness environment:

![Running a shell command in a harness environment.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/harness-exec.gif)


For standalone harnesses, `agentcore harness delete` prompts you to select a harness before confirming deletion. The recording stops at selection. For project-managed resources, use `agentcore remove` and `agentcore deploy`, as shown in the cleanup steps below:

![Selecting a harness for deletion without confirming deletion.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/harness-delete.gif)


Use the Identity menu to inspect credential provider operations:

![Browsing Identity credential provider operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/identity-menu.gif)


![Browsing OAuth2 credential provider operations.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/identity-oauth2.gif)


### Clean up
<a name="_clean_up"></a>

Remove every resource from the project specification, and deploy the empty specification. The CLI removes the stack and its deployed resources. Your local application code, schemas, and policies remain on disk.

```
agentcore remove all --yes
agentcore deploy --yes
```

The output resembles the following:

```
Removing stack AgentCore-TripPlanner-default
Removed project 'TripPlanner' from target 'default'
```

You built a Strands agent on AgentCore Runtime with long-term Memory, a Gateway whose API key is stored by AgentCore Identity, a Cedar policy that controls tool use, and an evaluator that scores sessions. For all available commands and options, see the [AgentCore CLI command reference](https://github.com/aws/agentcore-cli/blob/HEAD/command.md).