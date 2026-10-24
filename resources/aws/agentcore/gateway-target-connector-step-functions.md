

# AWS Step Functions as Connector Target
<a name="gateway-target-connector-step-functions"></a>

 AWS Step Functions is a workflow service that coordinates AWS services, your own code, and HTTP APIs as a series of steps called a state machine. Step Functions provides built-in retries and error handling, and it passes data between steps. For Standard workflows, it also records every step in an execution history. To learn more, see [What is Step Functions?](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html) in the * AWS Step Functions Developer Guide*.

Amazon Bedrock AgentCore Gateway includes a built-in Step Functions connector. You create a gateway target that uses the connector and choose which Step Functions operations to expose as tools. Your agents discover and call these tools through the Model Context Protocol (MCP). The gateway creates the tool schemas and authenticates to Step Functions with the gateway service role. You don’t write a Lambda function or an MCP server, and you don’t define the tools yourself. If you already use Step Functions, you can expose your existing Standard and Express state machines without changing them.

Use a Step Functions target when a task must run the same steps in the same order every time. The agent decides when to run the workflow and what input to pass. The state machine decides which steps run and in what order, so the agent can’t skip or reorder them. This helps when a process must follow an approved sequence, or when you need a record of each step for audit. Standard workflows keep that record in the execution history, and they can run for up to one year, so work can continue after the agent’s session ends.

The connector exposes ten operations. Four of them act on a state machine that you pin to the operation when you create the target: `StartExecution`, `StartSyncExecution`, `ListExecutions`, and `DescribeStateMachine`. The agent doesn’t see the pinned state machine and can’t change it. The gateway rejects any call that tries. Each operation takes one pin in a target, so to expose several state machines for the same operation, create a target for each one.

The other six operations act on an execution Amazon Resource Name (ARN) or a task token that the agent provides: `DescribeExecution`, `StopExecution`, `GetExecutionHistory`, `SendTaskSuccess`, `SendTaskFailure`, and `SendTaskHeartbeat`. They aren’t limited to the pinned state machine. The gateway service role’s IAM (Identity and Access Management) policy controls what they can reach. You can limit `DescribeExecution`, `StopExecution`, and `GetExecutionHistory` by scoping that policy to the execution ARNs of the state machines you expose. Because IAM can’t limit `SendTaskSuccess`, `SendTaskFailure`, and `SendTaskHeartbeat` to specific executions, any agent with a valid task token can complete that task. Treat task tokens as secrets and send them only to the agent that should act on them.

Agents and workflows can work together in two ways. In the first, the agent starts a workflow, checks its progress, and stops it if needed. In the second, a workflow pauses and waits for the agent to complete a task. The workflow uses a task with the [callback pattern](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html#connect-wait-token) (`.waitForTaskToken`), and Step Functions creates a task token. Your workflow must deliver the token and the task details to the agent’s application, for example through an Amazon SQS queue or an Activity that the application polls. The agent does the work, then calls `SendTaskSuccess` with the result or `SendTaskFailure` if it can’t finish. For long tasks, the agent calls `SendTaskHeartbeat` to show it’s still working. This pattern works only with Standard workflows, because Express workflows don’t support the callback pattern.

The following sections walk through how the connector works, common use cases, how to set up a target, the differences between Standard and Express workflows, and the tool schemas.

**Topics**
+ [How it works](#gateway-target-connector-step-functions-how-it-works)
+ [Use cases](#gateway-target-connector-step-functions-use-cases)
+ [Set up a Step Functions target](#gateway-target-connector-step-functions-setup)
+ [Pin state machines to operations](#gateway-target-connector-step-functions-pinning)
+ [Standard and Express workflows](#gateway-target-connector-step-functions-standard-express)
+ [Configure the Gateway Service Role](#gateway-target-connector-step-functions-service-role)
+ [Invoke the tools](#gateway-target-connector-step-functions-invoke)
+ [Input schemas](#gateway-target-connector-step-functions-input-schema)
+ [Response format](#gateway-target-connector-step-functions-response-format)
+ [Availability](#gateway-target-connector-step-functions-availability)

## How it works
<a name="gateway-target-connector-step-functions-how-it-works"></a>

The Step Functions connector is a built-in **connector**. The Gateway handles schema management, parameter governance, endpoint resolution, and service authentication. A typical flow works as follows:

1.  **Gateway setup** — Create a Gateway and add a Step Functions target using `connectorId: "states"`. In `configurations`, choose which operations become tools and pin a `stateMachineArn` on each operation that supports it. The Gateway snapshots the tool schemas and provisions the integration.

1.  **Tool discovery** — Your agent calls `tools/list` on the Gateway endpoint and discovers one tool for each configured operation. Pinned parameters don’t appear in the tool schemas. For example, `StartExecution` advertises only `input`.

1.  **Tool invocation** — Your agent calls `tools/call`, for example to start a workflow with a JSON input. The Gateway merges the pinned parameters with the agent’s arguments, authenticates to Step Functions with the Gateway service role, and routes the request.

1.  **Results** — The tool returns the Step Functions API response, such as the new execution’s ARN, as JSON inside the tool result’s text content.

1.  **Follow-up calls** — Your agent chains tools. A typical sequence is `StartExecution`, then `DescribeExecution` with the returned ARN to check status, then `GetExecutionHistory` to inspect the steps.

## Use cases
<a name="gateway-target-connector-step-functions-use-cases"></a>
+  **Trigger business workflows from conversation** — Let an agent kick off an order-fulfillment, onboarding, or data-processing workflow and report back the execution status.
+  **Human-in-the-loop and long-running tasks** — A Standard workflow pauses on a `.waitForTaskToken` task and sends the task token to the agent’s application. When the work is done, the agent calls `SendTaskSuccess` or `SendTaskFailure` to resume the workflow.
+  **Operational assistants** — Ask an agent what executions ran recently, why one failed, or to stop an execution that is misbehaving.
+  **Synchronous request-response** — Call an Express workflow with `StartSyncExecution` and get the result back in the same tool call.

## Set up a Step Functions target
<a name="gateway-target-connector-step-functions-setup"></a>

For setup examples that use Boto3, the AWS CLI, and the AgentCore CLI, see [Set up a Step Functions target](gateway-add-target-api-target-config.md#gateway-add-target-api-connector-step-functions-setup).

## Pin state machines to operations
<a name="gateway-target-connector-step-functions-pinning"></a>

Only the four operations that take a `stateMachineArn` can be pinned. The other six identify their target by an execution ARN or a task token, which belong to a specific execution rather than a state machine, so the agent supplies them.

Pinnable (you set `stateMachineArn`)  
 `StartExecution`, `StartSyncExecution`, `ListExecutions`, and `DescribeStateMachine`.

Not pinnable (your agent supplies the identifier)  
 `DescribeExecution`, `StopExecution`, and `GetExecutionHistory` take an `executionArn`. `SendTaskHeartbeat`, `SendTaskSuccess`, and `SendTaskFailure` take a `taskToken`.

You set pins for each operation, so one target can point `StartExecution` at a Standard state machine and `StartSyncExecution` at an Express one. The Gateway removes a pinned parameter from the tool schema and enforces it on every call. If an agent passes `stateMachineArn` anyway, the Gateway rejects the call with `Invalid request parameters: cannot set parameter(s): [/stateMachineArn]`.

Always set `parameterValues.stateMachineArn` on each pinnable operation that you include. If you leave it out, the Gateway can still create the target, but the tool fails on every call because no state machine is supplied.

Because only the Gateway service role bounds the six unpinned operations, scope that role’s IAM policy as tightly as the operations allow. You can limit `DescribeExecution`, `StopExecution`, and `GetExecutionHistory` to the execution ARNs of the state machines you expose instead of granting `states:*`.

 `SendTaskSuccess`, `SendTaskFailure`, and `SendTaskHeartbeat` have no resource-level permissions in IAM, so you must grant them on `"*"`. The task token is the only control, so treat task tokens as secrets. Pinning and IAM are complementary controls, not alternatives. See [Configure the Gateway Service Role](gateway-add-target-api-target-config.md#gateway-add-target-api-connector-step-functions-service-role).

## Standard and Express workflows
<a name="gateway-target-connector-step-functions-standard-express"></a>

Step Functions has two workflow types, and some operations only work with one of them. Step Functions returns these errors. They aren’t connector failures.


| Operation | Works with | What happens otherwise | 
| --- | --- | --- | 
|  `StartSyncExecution`  | Express only | Fails on a Standard state machine. Use `StartExecution` and poll with `DescribeExecution` instead. | 
|  `ListExecutions`  | Standard only | Fails with `StateMachineTypeNotSupported` on an Express state machine. | 
|  `DescribeExecution`, `GetExecutionHistory`, `StopExecution`  | Standard executions only | Fail with `InvalidArn` on an Express execution ARN, because Express executions cannot be addressed by ARN after they start. | 
|  `StartExecution`, `DescribeStateMachine`, `SendTaskSuccess`, `SendTaskFailure`, `SendTaskHeartbeat`  | Both | Not applicable | 

If you need both types behind one target, pin `StartSyncExecution` to an Express state machine and the other pinnable operations to a Standard one. The tool descriptions returned by `tools/list` state these constraints so the agent can choose the right tool.

## Configure the Gateway Service Role
<a name="gateway-target-connector-step-functions-service-role"></a>

The Gateway needs a service role that allows the AgentCore service to call Step Functions on your behalf. For the required IAM permissions and policy configuration, see [Configure the Gateway Service Role](gateway-add-target-api-target-config.md#gateway-add-target-api-connector-step-functions-service-role) in the target configuration guide.

## Invoke the tools
<a name="gateway-target-connector-step-functions-invoke"></a>

After you create the target, your agent discovers the tools with `tools/list` and calls them with `tools/call`. Each tool name is prefixed with the target name, in the form `<target-name>_<operation>_StartExecution`).

The following JSON-RPC request starts a workflow on the pinned state machine. The agent passes only the input:

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "orders___StartExecution",
    "arguments": {
      "input": "{\"orderId\": \"12345\"}"
    }
  }
}
```

The result contains the `executionArn`. To check on the execution, the agent passes that ARN to `DescribeExecution`. By default, the response contains metadata only. The following JSON-RPC request sets `includedData` to `ALL_DATA` to include the execution’s input and output:

```
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "orders___DescribeExecution",
    "arguments": {
      "executionArn": "arn:aws:states:us-east-1:123456789012:execution:OrderWorkflow:3c1a...",
      "includedData": "ALL_DATA"
    }
  }
}
```

The following JSON-RPC request resumes a workflow that’s waiting on a task token. The agent passes the token it received and the task output:

```
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "orders___SendTaskSuccess",
    "arguments": {
      "taskToken": "AQCEAAAAKgAAAAMAAAAA...",
      "output": "{\"approved\": true}"
    }
  }
}
```

## Input schemas
<a name="gateway-target-connector-step-functions-input-schema"></a>

The schema returned by `tools/list` for each tool is the set of fields the agent can set. Pinned parameters are omitted. By default, each tool shows only the fields in the **Default fields** column. To let the agent set a field from the **Fields you can expose** column, add it to `parameterOverrides` on that operation’s configuration entry with `visible` set to `true`. The `parameterOverrides` format is the same as for other connectors. For details, see [Control which parameters the agent can set](gateway-add-target-api-target-config.md#gateway-add-target-api-connector-managed-kb-parameters). The following table applies to connector version `1.0.0`.


| Operation | Default fields | Fields you can expose | Notes | 
| --- | --- | --- | --- | 
|  `StartExecution`  |  `input`  |  `name`, `traceHeader`  |  `input` is a JSON string. Returns `executionArn` and `startDate`. | 
|  `StartSyncExecution`  |  `input`  |  `name`, `traceHeader`  | Express only. Returns the execution’s `status`, `output`, and timing in the same call. | 
|  `DescribeExecution`  |  `executionArn` (required), `includedData`  | None |  `includedData` defaults to `METADATA_ONLY`. Set `ALL_DATA` to include input and output. | 
|  `StopExecution`  |  `executionArn` (required) |  `error`, `cause`  | None | 
|  `GetExecutionHistory`  |  `executionArn` (required) |  `includeExecutionData`, `maxResults`, `reverseOrder`, `nextToken`  | Returns the event list for the execution. Expose `maxResults` and `nextToken` to let the agent page through long histories. | 
|  `ListExecutions`  |  `statusFilter`  |  `maxResults`, `nextToken`  |  `statusFilter` is one of `RUNNING`, `SUCCEEDED`, `FAILED`, `TIMED_OUT`, `ABORTED`, `PENDING_REDRIVE`. Standard only. | 
|  `DescribeStateMachine`  |  `includedData`  | None | Defaults to `METADATA_ONLY`. Set `ALL_DATA` to include the state machine definition. | 
|  `SendTaskSuccess`  |  `taskToken` (required), `output` (required) | None |  `output` is a JSON string. | 
|  `SendTaskFailure`  |  `taskToken` (required), `error`, `cause`  | None | None | 
|  `SendTaskHeartbeat`  |  `taskToken` (required) | None | None | 

You can’t expose `stateMachineArn` with `parameterOverrides`. You set it only by pinning.

For the shape of each field and of the responses, see the corresponding operation in the [AWS Step Functions API Reference](https://docs.aws.amazon.com/step-functions/latest/apireference/API_Operations.html).

## Response format
<a name="gateway-target-connector-step-functions-response-format"></a>

Each tool returns an MCP `tools/call` result wrapped in a JSON-RPC envelope. The `text` field contains the serialized Step Functions API response:

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "isError": false,
    "content": [
      {
        "type": "text",
        "text": "{\"executionArn\":\"arn:aws:states:us-east-1:123456789012:execution:OrderWorkflow:3c1a...\",\"startDate\":1.7596E9}"
      }
    ]
  }
}
```

When Step Functions returns an error, the result has `isError` set to `true` and the `text` field names the Step Functions error, for example `ExecutionDoesNotExist` or `StateMachineTypeNotSupported`.

## Availability
<a name="gateway-target-connector-step-functions-availability"></a>

The Step Functions connector is available in all AWS Regions where Amazon Bedrock AgentCore Gateway is available. The Gateway calls the Step Functions endpoint in the same Region as the Gateway.