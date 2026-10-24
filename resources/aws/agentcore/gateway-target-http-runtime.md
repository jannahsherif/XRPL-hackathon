

# Amazon Bedrock AgentCore Runtime targets
<a name="gateway-target-http-runtime"></a>

You can add an Amazon Bedrock AgentCore Runtime agent as a gateway target. The gateway sends traffic directly to the runtime agent without aggregation or protocol translation. Unlike MCP targets that combine tool capabilities into a unified virtual MCP server, the AgentCore Runtime target forwards requests and responses between clients and the runtime agent without modification.

Adding an AgentCore Runtime target to your gateway is useful when you want to:
+ Provide centralized access management for your runtime agents through a single gateway endpoint.
+ Use the gateway’s built-in authentication and observability for your runtime agents.
+ Route requests to specific runtime agents using path-based routing when multiple targets are attached to a gateway.
+ Optimize your agent’s performance by using Amazon Bedrock AgentCore optimization to generate recommendations from agent traces, A/B test changes with live traffic through the gateway, and deploy winning configurations. For more information, see [AgentCore optimization](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/optimization.html).

**Topics**
+ [Key considerations and limitations](#gateway-target-http-runtime-considerations)
+ [Target configuration](#gateway-target-http-runtime-config)
+ [Invoking an AgentCore Runtime target](#gateway-target-http-runtime-invoke)
+ [Outbound authorization](#gateway-target-http-runtime-auth)
+ [Enforcing traffic through the gateway](#gateway-target-http-runtime-source-validation)
+ [Capability comparison with MCP targets](#gateway-target-http-runtime-comparison)

## Key considerations and limitations
<a name="gateway-target-http-runtime-considerations"></a>

When working with AgentCore Runtime targets, be aware of the following considerations:
+ The gateway sends traffic directly to AgentCore Runtime targets without aggregating capabilities.
+ AgentCore Runtime targets can be added to gateways that don’t have a protocol type set. They cannot be added to MCP protocol type gateways.
+ No capability synchronization or semantic tool search is available for AgentCore Runtime targets. Clients must address each target individually through path-based routing.
+ Server-Sent Events (SSE) streaming is supported for AgentCore Runtime targets.
+ Request and response interceptor Lambda functions are supported in buffered mode only.

## Target configuration
<a name="gateway-target-http-runtime-config"></a>

When you create an AgentCore Runtime target, you provide the runtime ARN and an optional qualifier. The gateway resolves the runtime endpoint internally, so you don’t need to construct the runtime URL yourself.

The target configuration for an AgentCore Runtime target uses the following structure:

```
{
    "http": {
        "agentcoreRuntime": {
            "arn": "arn:aws:bedrock-agentcore:us-west-2:111122223333:runtime/RUNTIME_ID",
            "qualifier": "DEFAULT",
            "schema": {
                "source": {
                    "s3": {
                        "uri": "s3://DOC-EXAMPLE-BUCKET/agent-schema.yaml"
                    }
                }
            }
        }
    }
}
```
+  **arn** (required) – The ARN of the Amazon Bedrock AgentCore Runtime agent.
+  **qualifier** (optional) – The runtime qualifier. Defaults to `DEFAULT`.
+  **schema** (optional) – The API schema that describes the runtime target’s request and response structure. The gateway uses this schema to enable policy engine features such as guardrails. The schema format is auto-detected as either OpenAPI or Smithy.

  For runtime agents that use MCP or A2A protocols, a default schema is applied automatically and you don’t need to provide one. For runtime agents that use the HTTP protocol, you must provide a schema to use guardrails.

  The `schema` object contains a `source` that specifies where the schema content is located:
  +  **s3** – An S3 URI pointing to the schema file (for example, `s3://DOC-EXAMPLE-BUCKET/agent-schema.yaml`).
  +  **inlinePayload** – The schema content provided directly as a string.

**Note**  
If your runtime agent uses the HTTP protocol and you want to apply guardrails through the gateway’s policy engine, you must provide a schema. For runtime agents that use MCP or A2A protocols, a default schema is applied automatically.

If the Runtime and gateway are in the same AgentCore project and you don’t need a schema, add the Runtime target by name. The gateway must be created without `--protocol-type MCP`:

```
agentcore add gateway-target \
  --gateway MyGateway \
  --name MyRuntimeTarget \
  --runtime MyRuntime

agentcore deploy
```

To add an HTTP Runtime target with a schema for guardrails, deploy the Runtime and gateway first. Then run the AWS CLI command `aws bedrock-agentcore-control create-gateway-target` with a `--target-configuration` that includes `http.agentcoreRuntime.schema`, as shown in [Add the Runtime target with a schema](policy-guardrails-getting-started.md#policy-guardrails-getting-started-target). Before you create the target, grant the gateway’s execution role `bedrock-agentcore:InvokeAgentRuntime` on the Runtime and `s3:GetObject` on the schema object in `agentcore/cdk/lib/cdk-stack.ts`, as shown in [Add a policy engine and gateway](policy-guardrails-getting-started.md#policy-guardrails-getting-started-wire), and run `agentcore deploy`. The target is not part of the project, and `agentcore deploy` does not manage it. Before you remove the gateway from the project, delete this target with `aws bedrock-agentcore-control delete-gateway-target --gateway-identifier <GATEWAY_ID> --target-id <TARGET_ID>`. Otherwise the next `agentcore deploy` can fail to delete the gateway or leave the target behind. If the gateway is replaced, create the target again.

## Invoking an AgentCore Runtime target
<a name="gateway-target-http-runtime-invoke"></a>

To invoke an AgentCore Runtime target through the gateway, send a POST request to the target’s invocation URL. The URL format is:

```
https://{gatewayId}.gateway.bedrock-agentcore.{region}.amazonaws.com/{targetName}/invocations
```

Replace `{gatewayId}` with your gateway ID, `{region}` with the AWS Region, and `{targetName}` with the name of the target.

The following example uses curl to invoke an AgentCore Runtime target:

```
curl -X POST https://gateway-id.gateway.bedrock-agentcore.us-west-2.amazonaws.com/my-target/invocations \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <token>" \
    -d '{"input": {"prompt": "Hello"}}'
```

For a target on a gateway in your AgentCore project, `agentcore invoke --gateway` builds the URL from the target path. Add `--bearer-token` for a `CUSTOM_JWT` gateway. Omit it for an `AWS_IAM` or `NONE` gateway:

```
agentcore invoke --gateway MyGateway \
  --path /MyRuntimeTarget/invocations \
  --payload '{"input": {"prompt": "Hello"}}'
```

You can also use the AWS CLI with an endpoint URL override:

```
aws bedrock-agentcore invoke-agent-runtime \
    --endpoint-url https://gateway-id.gateway.bedrock-agentcore.us-west-2.amazonaws.com/my-target \
    --agent-runtime-arn arn:aws:bedrock-agentcore:us-west-2:111122223333:runtime/RUNTIME_ID \
    --content-type application/json \
    --payload '{"input": {"prompt": "Hello"}}' \
    --cli-binary-format raw-in-base64-out \
    response.json
```

## Outbound authorization
<a name="gateway-target-http-runtime-auth"></a>

AgentCore Runtime targets support the following outbound authorization types:
+  **IAM (SigV4)** – The gateway assumes the gateway service role to obtain credentials for signing requests to the runtime target. When you configure IAM authorization, you can use IAM policies to restrict access exclusively to the gateway role, ensuring all runtime requests flow through the gateway.
+  **Caller IAM credentials** – The gateway uses the caller’s IAM credentials to sign requests to the runtime target. The gateway assumes a role on behalf of the caller and signs the outbound request with the caller’s identity.
+  **OAuth (JWT)** – The gateway retrieves OAuth tokens from credential providers configured in the target through the Amazon Bedrock AgentCore identity service.
+  **Token passthrough** – The gateway validates the inbound token and passes it through to the runtime target without modification. This is useful when the runtime handles its own authorization.

## Enforcing traffic through the gateway
<a name="gateway-target-http-runtime-source-validation"></a>

Front your AgentCore Runtime with an AgentCore Gateway so that the gateway is the only entry point. The gateway applies policy-based authorization, Amazon Bedrock Guardrails, request and response interceptors, and observability. For the rationale, see [Front your runtime with an AgentCore Gateway](runtime-security-best-practices.md#security-bp-front-with-gateway). To stop callers from bypassing the gateway, restrict the runtime to gateway traffic. This works for both IAM (SigV4) and OAuth (JWT) inbound authorization.

You configure this restriction on the runtime. The gateway stamps the source of every request it forwards, and the runtime validates that source on the way in. The specific mechanism depends on the runtime’s inbound authorization type:
+  **IAM (SigV4) runtimes** – Attach a resource-based policy that restricts invocation to your gateway’s execution role. For the policy and the trust-policy hardening it requires, see [Restrict IAM (SigV4) inbound invocation to your gateway](runtime-oauth.md#runtime-restrict-iam-gateway).
+  **OAuth (JWT) runtimes** – Configure `allowedWorkloadConfiguration` on the runtime’s `customJWTAuthorizer` to allow only your gateway’s workload. For the configuration and field reference, see [Restrict invocation to your gateway](runtime-oauth.md#deploy-agent-allowed-workload).

## Capability comparison with MCP targets
<a name="gateway-target-http-runtime-comparison"></a>

You can integrate MCP servers with the Amazon Bedrock AgentCore gateway using two approaches: using the MCP target type in aggregation mode, or using the AgentCore Runtime target type. The following table compares the capabilities of each approach.


| Capability | MCP gateway with MCP targets | AgentCore Runtime target | 
| --- | --- | --- | 
| Tool/capability aggregation | Aggregates capabilities from all MCP targets into a single unified virtual MCP server. Clients see one consolidated `tools/list` response. | Operates in isolation. The gateway sends traffic directly to the target without merging capabilities. Clients must address each target individually through path-based routing. | 
| Semantic tool search | Indexes tool descriptions and enables discovery through natural-language queries. | Not available. The gateway does not ingest or index capabilities. Clients must know exact tool names or use the server’s own `tools/list`. | 
| Response interceptor Lambda | Supports both request and response interceptors for non-streaming MCP operations. | Supports both request and response interceptor Lambda functions in buffered mode only. | 