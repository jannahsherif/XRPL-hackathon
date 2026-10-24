

# Lifecycle hooks
<a name="harness-lifecycle-hooks"></a>

Lifecycle hooks send an event to an AWS Lambda function, Amazon SNS topic, or Amazon EventBridge event bus at a defined point in the harness agent loop. Use hooks to validate an invocation or tool call, record activity in another system, or start an asynchronous workflow.

You configure hooks on a harness with `CreateHarness` or `UpdateHarness`. Hook configuration is not available as an `InvokeHarness` override. A harness supports up to 20 hooks, and each hook name must be unique within the harness.

## Choose a lifecycle event
<a name="harness-hook-events"></a>

The event type determines when the hook runs, the context sent to the target, and the effect of a Lambda `deny` decision.


| Event | Context | Effect of a Lambda `deny` decision | 
| --- | --- | --- | 
|  `before_invocation`  | The ordered `messages` supplied in the current `InvokeHarness` request, before the harness restores session state. | Stops the invocation before the agent starts. The response stream emits a `messageStop` event with `stopReason` set to `hook_stopped`. | 
|  `before_tool_call`  | The tool name, tool type, tool-use ID, and model-generated tool input. | Skips the tool call. The agent loop continues. | 
|  `after_tool_call`  | The tool name, tool type, tool-use ID, tool result, and an error string when a tool executed by the harness raised an exception. | Keeps the completed tool result, then stops the invocation. The response stream emits a `messageStop` event with `stopReason` set to `hook_stopped`. | 
|  `after_invocation`  | The invocation stop reason and input and output token counts. | Reports the decision in the response stream. The invocation has already completed, so the hook cannot retract streamed output. | 

### Use tool-call hooks with inline functions
<a name="harness-hook-inline-functions"></a>

Tool-call hooks also run for `inline_function` tools. The harness invokes `before_tool_call` after the model generates the tool request and before the harness hands the pending call off for client-side execution. Consume the complete response stream, then process the inline call only if the last `messageStop` event has `stopReason` set to `tool_use`. The model-generated request can appear in earlier stream events before the hook decision; `before_tool_call` controls execution, not visibility in the stream.

Return the matching `toolResult` in a later `InvokeHarness` request that uses the same `runtimeSessionId`. The harness resumes the pending call, invokes `after_tool_call` with the client-supplied result, and continues the agent loop if the hook allows the result. For the complete callback flow, see [Inline function calls](harness-tools.md#harness-inline-functions).

Tools in one model response retain sequential execution order. For harness-executed tool A, inline function B, and harness-executed tool C, the harness executes A before handing off B and waits for B’s result before executing C. The follow-up request is a new invocation, so invocation hooks run again; `before_tool_call` for the pending inline function is not repeated, and `after_tool_call` runs once with the submitted result.

You can submit the pending result and any immediately following inline results in one follow-up request. The harness processes their `before_tool_call` and `after_tool_call` hooks sequentially. If your client requires an `allow` decision before each external action, return one inline result per handoff. A later request can appear in the stream before its hook runs.

If `before_tool_call` denies B, the harness skips B and continues with C without handing B to the client. If `after_tool_call` denies B after the client returns its result, the harness retains B’s result and stops before C.

**Validate client-supplied results**  
An `after_tool_call` event for an inline function confirms that the harness processed a result supplied by the client. It does not attest that the client performed the external action represented by that result. Authenticate the caller and validate the result before using the event as an authorization or audit signal.

## Choose a target
<a name="harness-hook-targets"></a>

Hooks support the following target types.


| Target | Delivery | Decision behavior | 
| --- | --- | --- | 
|  AWS Lambda | The harness invokes the function synchronously with `RequestResponse` and waits up to `timeoutSeconds`. | The function must return `allow` or `deny`. Lambda is the only target type that can change agent-loop behavior. | 
| Amazon SNS | The harness publishes the hook payload as the SNS `Message`. Publishing does not block the agent loop. | Notification only. SNS does not return a hook decision. | 
| Amazon EventBridge | The harness sends the hook payload in `detail`, with source `bedrock-agentcore.harness` and detail type `Harness Lifecycle Hook`. Sending does not block the agent loop. | Notification only. EventBridge does not return a hook decision. | 

The harness schedules SNS and EventBridge delivery without waiting for a response. A delivery error does not stop the invocation. For an SNS FIFO topic, the harness derives the message group ID from the harness ARN and session ID. This preserves publish order within that session. Standard SNS topics and EventBridge do not guarantee lifecycle event order.

Grant the harness execution role permission to call each target. For an example policy, see [Lifecycle hook targets](harness-security.md#harness-lifecycle-hook-permissions).

## Configure hooks
<a name="harness-hook-configure"></a>

The following example configures a Lambda decision hook before each invocation, an SNS notification after each tool call, and an EventBridge notification after each invocation. Define the hooks in `hooks.json`:

```
[
  {
    "beforeInvocation": {
      "name": "validate_request",
      "target": {
        "lambda": {
          "arn": "arn:aws:lambda:us-west-2:123456789012:function:validate-harness-request",
          "timeoutSeconds": 5,
          "failureMode": "deny"
        }
      }
    }
  },
  {
    "afterToolCall": {
      "name": "record_tool_result",
      "target": {
        "sns": {
          "arn": "arn:aws:sns:us-west-2:123456789012:harness-tool-events"
        }
      }
    }
  },
  {
    "afterInvocation": {
      "name": "record_invocation",
      "target": {
        "eventBridge": {
          "arn": "arn:aws:events:us-west-2:123456789012:event-bus/harness-events"
        }
      }
    }
  }
]
```

**Example**  
Apply the hooks:  

```
aws bedrock-agentcore-control update-harness \
  --harness-id "MyHarness-UuFdkQoXSL" \
  --hooks file://hooks.json
```
Load and apply the same configuration:  

```
import json
import boto3

client = boto3.client("bedrock-agentcore-control")

with open("hooks.json", encoding="utf-8") as hooks_file:
    hooks = json.load(hooks_file)

client.update_harness(
    harnessId="MyHarness-UuFdkQoXSL",
    hooks=hooks,
)
```

When you pass `hooks` to `UpdateHarness`, the supplied list replaces the existing hook configuration. Pass an empty list to remove all hooks. Omit `hooks` to retain the existing configuration.

## Return a Lambda decision
<a name="harness-hook-lambda"></a>

A Lambda target receives the hook payload directly. It must return a JSON object with a `decision` value of `allow` or `deny`. It can also return a `reason`. The harness includes this reason in the `hookEvent` response stream event and limits it to 1,024 characters.

The following handler denies a `before_invocation` event when the target cannot evaluate the complete hook context. Replace this logic with the rules for your application.

```
def lambda_handler(event, _context):
    hook_context = event["context"]

    if event["event"] == "before_invocation" and hook_context.get("truncated"):
        return {
            "decision": "deny",
            "reason": "The request context exceeded the evaluation limit.",
        }

    return {"decision": "allow"}
```

For Lambda targets, `timeoutSeconds` defaults to 60 seconds and accepts values from 1 through 900 seconds. `failureMode` determines the decision when the function times out, returns an error, or returns an invalid response:
+  `deny` – Apply a deny decision. This is the default.
+  `allow` – Apply an allow decision.

**Configure long-running hook connections**  
A synchronous hook can keep an `InvokeHarness` stream idle until the hook returns or reaches `timeoutSeconds`. Configure the SDK read timeout to exceed the longest expected idle period. For a hook configured for 900 seconds, the following example uses a 1,000-second read timeout to provide additional margin:  

```
import boto3
from botocore.config import Config

client = boto3.client(
    "bedrock-agentcore",
    config=Config(
        read_timeout=1000,
        tcp_keepalive=True,
    ),
)
```
If the connection passes through a NAT gateway, interface VPC endpoint, or Network Load Balancer, also configure the operating system TCP keepalive idle time to less than 350 seconds. On Linux, this is `TCP_KEEPIDLE`, configured by `net.ipv4.tcp_keepalive_time`. Setting `tcp_keepalive=True` alone enables TCP keepalive but does not shorten the operating system’s default idle time. For more information, see [Connection timeout or reset on long-running or idle connections](https://docs.aws.amazon.com/bedrock/latest/userguide/troubleshooting-api-error-codes.html).

Context truncation does not activate `failureMode`. The Lambda function receives the truncated context and must return a decision.

When multiple Lambda hooks use the same event type, the harness invokes them concurrently. Any `deny` decision applies the event’s deny behavior. If more than one hook denies the event, the first denying hook in the configured list supplies the reason.

## Process the hook payload
<a name="harness-hook-payload"></a>

Every target receives the following common fields:

```
{
  "hookEventId": "1234abcd-12ab-34cd-56ef-1234567890ab",
  "name": "validate_request",
  "event": "before_invocation",
  "harnessArn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:harness/MyHarness-UuFdkQoXSL",
  "sessionId": "12345678-1234-5678-9abc-123456789012",
  "context": {
    "messageCount": 1,
    "messages": [
      {
        "role": "user",
        "content": [{"text": "Summarize this report."}]
      }
    ]
  }
}
```

The `context` fields depend on the event type.



- **  `before_invocation`  **
  - **Field:**  `messageCount`  / **Description:** Number of messages in the current `InvokeHarness` request before hook-context truncation.
  - **Field:**  `messages`  / **Description:** Ordered messages from the current `InvokeHarness` request.
  - **Field:**  `truncated`  / **Description:** Present and set to `true` when the context exceeded 64 KiB.

- **  `before_tool_call`  **
  - **Field:**  `toolName`  / **Description:** Model-facing tool name.
  - **Field:**  `toolType`  / **Description:** Harness tool type, such as `builtin`, `remote_mcp`, `agentcore_gateway`, or `inline_function`.
  - **Field:**  `toolInput`  / **Description:** Model-generated input for the tool.
  - **Field:**  `toolUseId`  / **Description:** ID that correlates the tool request with its result.

- **  `after_tool_call`  **
  - **Field:**  `toolName`  / **Description:** Model-facing tool name.
  - **Field:**  `toolType`  / **Description:** Harness tool type.
  - **Field:**  `toolResult`  / **Description:** Result observed by the harness. For an inline function, this is the client-supplied result.
  - **Field:**  `toolUseId`  / **Description:** ID that correlates the tool request with its result.
  - **Field:**  `error`  / **Description:** Error text when a tool executed by the harness raised an exception. Omitted when no such exception occurred.

- **  `after_invocation`  **
  - **Field:**  `stopReason`  / **Description:** Final invocation stop reason.
  - **Field:**  `usage`  / **Description:** Object containing `inputTokens` and `outputTokens`.



The `before_invocation` context does not include messages that the harness restores from session state after the hook runs. An `after_tool_call` Lambda deny decision does not remove the completed tool result.

### Handle context truncation
<a name="harness-hook-context-limit"></a>

The harness limits each hook `context` object to 64 KiB.

For `before_invocation`, the harness keeps the newest contiguous sequence of complete messages that fits within the limit. The payload preserves `messageCount` and keeps `messages` as a list. It also adds `"truncated": true` to the context. If the newest message alone exceeds the limit, `messages` is an empty list.

For other event types, the harness replaces the largest context fields until the context fits. Each replaced field uses the following form:

```
{
  "truncated": true,
  "preview": "<prefix of the serialized field>"
}
```

Check truncation markers before using a field. A Lambda target that requires complete context can return `deny` when it receives a truncation marker. An SNS or EventBridge consumer can record the event and obtain additional data from its own system of record.

## Read hook events from the response stream
<a name="harness-hook-stream"></a>

 `InvokeHarness` emits a `hookEvent` for each configured hook that fires. A Lambda event includes the applied decision and optional reason:

```
{
  "hookEvent": {
    "hookEventId": "1234abcd-12ab-34cd-56ef-1234567890ab",
    "name": "validate_request",
    "type": "before_invocation",
    "decision": "allow",
    "reason": "Request accepted."
  }
}
```

For SNS and EventBridge targets, `decision` and `reason` are absent. Their `hookEvent` confirms that the harness scheduled the dispatch. It does not confirm that the target received the event.

Continue reading until the event stream closes. When the stream includes a terminal `messageStop`, any `hookEvent` with `type` set to `after_invocation` follows it. Some error paths emit `after_invocation` without a `messageStop`.

## Related topics
<a name="_related_topics"></a>
+  [Tools](harness-tools.md) – Configure tools and inline functions
+  [Observability and cost controls](harness-operations.md) – Monitor harness invocations
+  [Security and access controls](harness-security.md) – Configure the harness execution role and control tool access
+  [API Documentation](harness-get-started.md#api-documentation) 