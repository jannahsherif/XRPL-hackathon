

# Get started
<a name="harness-get-started"></a>

You can use the harness through the [AgentCore CLI](https://github.com/aws/agentcore-cli) or directly with AWS SDKs such as `boto3`. The CLI is the fastest path for most developers; SDKs are for programmatic use from your own application.

## Prerequisites
<a name="harness-prerequisites"></a>
+  AWS credentials configured in one of the [supported regions](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agentcore-regions.html).
+ For the CLI: Install and configure the AgentCore CLI as described in [Get started with the AgentCore CLI](runtime-get-started-cli.md).
+ For the SDK/boto3: Python 3.10\+, [`boto3` installed](https://docs.aws.amazon.com/boto3/latest/guide/quickstart.html), and an IAM execution role the harness can assume. See the [execution role policy](harness-security.md#harness-execution-role-policy) for minimum permissions.

## Get started
<a name="harness-get-started-options"></a>

**Example**  
Create the harness with a name and execution role:  

```
aws bedrock-agentcore-control create-harness \
  --harness-name "MyHarness" \
  --execution-role-arn "arn:aws:iam::123456789012:role/MyHarnessRole"
```
Poll `get-harness` until `"status": "READY"`. Note the `arn` in the response.  

```
aws bedrock-agentcore-control get-harness \
  --harness-id "MyHarness-XyZ1234567"
```
Invoke from Python. If you don’t specify a model, the harness defaults to Anthropic Claude Sonnet 4.6 on Amazon Bedrock:  

```
import boto3

client = boto3.client("bedrock-agentcore", region_name="us-west-2")

response = client.invoke_harness(
    harnessArn="arn:aws:bedrock-agentcore:us-west-2:123456789012:harness/MyHarness-XyZ1234567",  # Replace with your harness ARN
    runtimeSessionId="1234abcd-12ab-34cd-56ef-1234567890ab",
    messages=[{
        "role": "user",
        "content": [{"text": "Research three tropical vacation options under USD $3,000, within five hours of New York City."}]
    }],
)

for event in response["stream"]:
    if "contentBlockDelta" in event:
        delta = event["contentBlockDelta"].get("delta", {})
        if "text" in delta:
            print(delta["text"], end="", flush=True)
    elif "runtimeClientError" in event:
        print(f"\nError: {event['runtimeClientError']['message']}")
```
Create a harness project. The CLI sets the harness model to Anthropic Claude Sonnet 5.5 on Amazon Bedrock (`global.anthropic.claude-sonnet-5-5`):  

```
agentcore create --name MyResearchAgent
cd MyResearchAgent
```
Deploy and invoke:  

```
agentcore deploy
agentcore invoke --harness MyResearchAgent \
  --session-id "$(uuidgen)" \
  --prompt 'Research three tropical vacation options under USD $3,000, within five hours of New York City.'
```
With `--prompt`, the CLI collects the response stream and prints the completed transcript and session information as JSON. Reuse the same `--session-id` across invocations to continue the conversation in the same environment.  
Omit `--prompt` to open interactive chat, where the response appears incrementally:  

```
agentcore invoke --harness MyResearchAgent --session-id "$(uuidgen)"
```
For project names of up to 15 characters, the harness has the same name as the project. For longer names, run `agentcore status` to see the harness name.  
To add another harness to an existing project, use `agentcore add harness`.
Run `agentcore create` without flags to launch the interactive wizard:  

```
agentcore create
```
Enter a project name, choose **config-based**, choose a model provider and model, and confirm the configuration. The wizard scaffolds the default harness project.  

![Creating a config-based project by choosing its name, model provider, and model.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/project-create-harness.gif)

After creation, change to the generated project directory and run:  

```
agentcore deploy
agentcore invoke
```
Select the harness from the list to open the interactive harness experience. The harness has the same name as the project when the project name is 15 characters or fewer. For a longer project name, the CLI shortens the harness name and adds a hash. The harness name is listed under `harnesses` in `agentcore/agentcore.json`. Check deployment details at any time with `agentcore status`.  
The response streams into the chat. Reuse the session to continue the conversation:  

![Invoking a deployed harness and reading its streamed response.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/project-invoke-chat.gif)

To create a standalone harness without a project, run `agentcore harness create`. Review the model, memory, tools, and system prompt before confirming. The following recording stops at the review screen:  

![Configuring a standalone harness and reviewing its model, memory, tools, and system prompt.](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/tui/harness-create.gif)


That’s all you need to get a harness running. The following sections cover everything you can configure.

**Note**  
The `runtimeSessionId` must be at least 33 characters. Use a UUID or similar identifier. Reuse the same session ID across invocations to continue a conversation in the same environment.

## Supply an end-user ID
<a name="harness-invoke-user-id"></a>

Use `--user-id` when your application needs to send an end-user identifier with a Harness invocation. It is separate from `--session-id` and the Memory configuration’s `actorId`. If you omit it, the CLI sends no Harness user ID. The value does not replace inbound authentication.

For a project Harness:

```
agentcore invoke --harness MyResearchAgent \
  --user-id user-123 \
  --session-id "$(uuidgen)" \
  --prompt "Summarize my research."
```

For a deployed Harness by ID, no project is required. The same option works in interactive chat when you omit `--prompt`:

```
agentcore harness invoke --id <harness-id> \
  --user-id user-123 \
  --session-id "$(uuidgen)"
```

## Test a Harness with the Agent Inspector
<a name="harness-development"></a>

For a Harness project, `agentcore dev --mode browser` deploys the project and opens a local Agent Inspector that invokes the deployed Harness in AWS. It does not run the Harness locally. Deployment can create or update project resources, and cloud invocations can incur charges.

Run this command from the project root:

```
agentcore dev --mode browser
```

To use the deployed configuration without deploying again:

```
agentcore dev --mode browser --skip-deploy
```

Use `--target` to select an entry in `agentcore/aws-targets.json`, and `--ui-port` to choose the local Inspector port. In a project containing both Runtimes and Harnesses, use `--agent` to select one:

```
agentcore dev --agent MyResearchAgent \
  --mode browser \
  --target default \
  --ui-port 8082
```

Harness requests use the selected deployment target’s Region and credentials. Without `--mode browser`, the default headless mode deploys unless you pass `--skip-deploy`, prints invocation guidance, and exits. It does not start a local server or chat session.

Runtime-only `--port` and `--no-traces` options do not apply to Harness development. This path does not start a local Runtime or OpenTelemetry collector. Use [Harness operations](harness-operations.md) for cloud observability, or [open a Harness shell](harness-command-shell.md#harness-command-shell-cli) to inspect its execution environment.

## API Documentation
<a name="api-documentation"></a>

For additional details, see the API Reference:
+  [CreateHarness API](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreateHarness.html) 
+  [GetHarness API](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_GetHarness.html) 
+  [UpdateHarness API](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_UpdateHarness.html) 
+  [DeleteHarness API](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_DeleteHarness.html) 
+  [ListHarnesses API](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_ListHarnesses.html) 
+  [ListHarnessVersions API](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_ListHarnessVersions.html) 
+  [InvokeHarness API](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_InvokeHarness.html) 
+  [InvokeAgentRuntimeCommand API](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_InvokeAgentRuntimeCommand.html) 
+  [CreateHarnessEndpoint API](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreateHarnessEndpoint.html) 
+  [GetHarnessEndpoint API](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_GetHarnessEndpoint.html) 
+  [UpdateHarnessEndpoint API](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_UpdateHarnessEndpoint.html) 
+  [DeleteHarnessEndpoint API](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_DeleteHarnessEndpoint.html) 
+  [ListHarnessEndpoints API](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_ListHarnessEndpoints.html) 

## Streaming response format
<a name="harness-streaming-format"></a>

 `InvokeHarness` returns a stream of events. The key event types are:
+  `messageStart` - beginning of a new message (includes `role`)
+  `contentBlockStart` - beginning of a content block (text, `toolUse`, or `toolResult`)
+  `contentBlockDelta` - incremental content (`text`, `toolUse` input, `toolResult` content, `reasoningContent`)
+  `contentBlockStop` - end of a content block
+  `messageStop` - end of the message (includes `stopReason`)
+  `metadata` - token usage and latency metrics
+  `hookEvent` - a configured lifecycle hook fired. Lambda hook events include the applied decision and optional reason. See [Lifecycle hooks](harness-lifecycle-hooks.md).
+  `runtimeClientError` - error during execution

The `stopReason` in `messageStop` indicates why the current streamed message ended:
+  `end_turn` - the agent finished normally
+  `tool_use` - the model requested one or more tools. The harness can continue with harness-executed tools. If this is the final `messageStop` in the completed response stream, the harness is waiting for an inline function result.
+  `tool_result` - the harness streamed one or more tool results; additional model output can follow
+  `max_tokens` - the model’s per-turn token limit was reached
+  `max_iterations_exceeded` - the `maxIterations` limit was hit
+  `timeout_exceeded` - the `timeoutSeconds` limit was hit
+  `max_output_tokens_exceeded` - the `maxTokens` budget was exhausted
+  `hook_stopped` - a `deny` decision from a `before_invocation` or `after_tool_call` Lambda hook stopped the invocation