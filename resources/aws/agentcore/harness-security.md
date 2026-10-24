

# Security and access controls
<a name="harness-security"></a>

The harness gives you the same security primitives as the rest of AgentCore, wired in by configuration.
+  **Isolated execution.** Every session runs in its own Firecracker microVM in [AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-how-it-works.html). No shared state, no shared filesystem.
+  **IAM execution role.** The harness assumes an IAM role you own, configurable to include Bedrock, ECR, CloudWatch, and the AgentCore primitives it touches. See sample [execution role policy](#harness-execution-role-policy) below.
+  **IAM permissions model.** Harness APIs require permissions on both the harness resource and the underlying [AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-how-it-works.html) resource. For example, calling `InvokeHarness` requires both `bedrock-agentcore:InvokeHarness` and `bedrock-agentcore:InvokeAgentRuntime` permissions on the harness ARN. The same pattern applies to control plane operations: `UpdateHarness` requires `bedrock-agentcore:UpdateAgentRuntime`, `DeleteHarness` requires `bedrock-agentcore:DeleteAgentRuntime`, and so on. See [execution role policy](#harness-execution-role-policy) for the full list.
+  **Inbound OAuth.** Harnesses configured with a JWT authorizer require callers to present a valid JWT issued by a configured identity provider before they can invoke the harness. [AgentCore Identity](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html) threads the end-user identity through the agent, so downstream tools can call APIs with scoped user credentials instead of a shared service account.
+  **VPC.** Connect harness sessions to your VPC for private access to internal resources.
+  **Policies on Gateway.** When tools are served through [AgentCore Gateway](gateway.md), [policies](policy.md) written in Dogwood or Cedar can be configured to gate every call: which agentic actions a caller can invoke, under which conditions, with which arguments.

**Note**  
 **SigV4 and per-user identity.** When callers authenticate with SigV4 (AWS IAM), the harness does not propagate per-user identity into downstream tool calls. This means per-user credential scoping features in [AgentCore Identity](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html) Token Vault - such as user-scoped OAuth token storage and on-behalf-of token exchange - are only available when callers authenticate with a Bearer JWT via the OAuth inbound path. If your use case requires per-user credential scoping for downstream tools, configure inbound OAuth on the harness.

## Shared responsibility model
<a name="harness-shared-responsibility"></a>

The harness is built on AgentCore Runtime and the security boundary is the same: IAM or JWT authentication combined with microVM isolation. Any principal that passes that gate reaches the tools and capabilities configured on the harness, which makes caller authorization and input validation a customer responsibility.

**AWS responsibilities:**
+ Secure infrastructure and microVM isolation at the hardware level
+ OS kernel patching
+ Language runtime patching for direct code deployments
+ Managed harness runtime code, including validation of the request structure `InvokeHarness` accepts
+ Network infrastructure security
+ Service availability and resilience

**Your responsibilities:**
+ Agent code security and dependency management
+ IAM access controls and resource policies
+ Security of commands executed in runtime sessions
+ Session-to-user mapping enforcement
+ Input validation and prompt injection prevention - including validating all `InvokeHarness` input (see [Trust boundary and input validation](#harness-trust-boundary))
+ Model configuration validation - such as `additionalParams`, `apiBase`, and `modelId` fields (see [Model configuration parameters](#harness-model-params-security))
+ Skill and instruction sources - ensuring that S3 buckets, Git repositories, and URLs used for skills contain trusted content (see [Skills and instructions](#harness-skills-security))
+ Container image updates (for container deployments) - rebuild with the latest secure base image regularly
+ Network configuration (security groups, VPC endpoints, route tables)

For the full AgentCore Runtime shared responsibility model, see [Security best practices for AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-security-best-practices.html#security-bp-shared-responsibility).

### Trust boundary and input validation
<a name="harness-trust-boundary"></a>

Any principal that passes the IAM or JWT authentication and authorization gate has access to the full microVM session, including the tools and capabilities configured on the harness. The harness validates the structure of the request it accepts, but it does not inspect the meaning of prompts, screen content, or enforce behavioral constraints on the agent.

If you expose the harness to end users you do not fully trust (employees, external consumers, or third-party integrations), validate and sanitize messages in your application layer before passing them to `InvokeHarness`. This includes stripping content-block types or model configuration fields you do not want dispatched. This is the same pattern as any service that accepts payloads from authorized callers, such as Lambda, Amazon API Gateway, and Amazon SQS.

**Note**  
The harness rejects `toolUse` blocks in the final message server-side, as shown in the following example. For **AgentCore Runtime** deployments (non-harness), AgentCore Runtime provides no server-side protection. Your agent entrypoint must validate that the prompt field is a string and reject or strip `toolUse` content blocks before passing input to the agent framework. See [Security best practices for AgentCore Runtime](runtime-security-best-practices.md).

Tools run only as a result of model reasoning. The harness does not accept a [toolUse](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_HarnessToolUseBlock.html) block in the final message of an `InvokeHarness` request, so a caller cannot name a tool and have it dispatched directly.

The following example shows a request that the harness is configured to reject. The final message contains a `toolUse` block naming the built-in `shell` tool:

```
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    messages=[{
      "role": "assistant",
      "content": [
        {
          "toolUse": {
            "toolUseId": TOOL_USE_ID,
            "name": "shell",
            "input": {
              "command": "pwd",
            }
          }
        }
      ]
    }],
)
```

The harness does not evaluate which tool the block names, so this applies to built-in server-side tools and to inline functions supplied on the call.

Returning a tool result is still supported. The harness accepts a [toolResult](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_HarnessToolResultBlock.html) block in the final message, and the model resumes reasoning over that result. For [inline function tools](harness-tools.md#harness-inline-functions), the harness stores the model-generated `toolUse` and pending execution in the session. Send only the matching `toolResult` in a later `InvokeHarness` request that uses the same `runtimeSessionId`. A result without a matching pending handoff cannot resume the inline function.

### Model configuration parameters
<a name="harness-model-params-security"></a>

The `model` field in `InvokeHarness` accepts `additionalParams` for Bedrock, OpenAI, Gemini, and LiteLLM configurations. These parameters are passed through to the underlying model provider unchanged. The harness does not validate, filter, or restrict these parameters.

Callers who can set `additionalParams` can:
+  **Redirect requests to arbitrary endpoints** - LiteLLM’s `aws_bedrock_runtime_endpoint` parameter overrides the Bedrock endpoint URL. A caller can route the signed request, including the SigV4 signature and session credentials, to any endpoint the caller specifies.
+  **Override HTTP headers** - OpenAI’s `extra_headers` parameter injects or overrides HTTP headers on the outbound request to the model provider, including the `Authorization` header.
+  **Attempt IAM role assumption** - LiteLLM’s `aws_role_name` parameter instructs the runtime to assume a different IAM role before calling the model provider. The attempt succeeds or fails based on the execution role’s `sts:AssumeRole` permissions.
+  **Change the target model or region** - The `modelId` and `apiBase` fields can redirect inference to a different model, region, or provider entirely.

If your application exposes `InvokeHarness` capabilities to callers you do not fully trust, consider implementing input validation in your application layer. Examples include:
+ Stripping or allowlisting the `model` field before forwarding requests
+ Validating or removing `additionalParams`, `apiBase`, and `modelId` 
+ Denying `sts:AssumeRole` on the execution role if role switching is not required
+ Scoping the harness network access using VPC security groups

### Skills and instructions
<a name="harness-skills-security"></a>

Skills are bundles of markdown and scripts that the harness fetches from Amazon S3 or Git at invocation time and injects into the agent’s context. The harness treats all skill content as trusted input. It does not validate, sanitize, or inspect the content or source of skills before providing them to the agent.

You are responsible for:
+ Ensuring that skill sources (S3 buckets, Git repositories, URLs) are trusted and access-controlled
+ Reviewing skill content - including markdown instructions and any embedded scripts - before configuring them on the harness
+ Controlling which principals can override the `skills` field per invocation, since callers can point the harness at arbitrary S3 or Git sources

Skills can be overridden per `InvokeHarness` call. If your application forwards caller-supplied input to `InvokeHarness`, a caller can supply their own skill sources containing arbitrary instructions or scripts. Examples of mitigations include:
+ Stripping or ignoring the `skills` field from caller-supplied requests
+ Allowlisting permitted S3 prefixes or Git repositories

### Observability and trace correlation
<a name="harness-observability-security"></a>

The harness automatically propagates correlation identifiers to downstream AgentCore primitives (Gateway, Memory, Code Interpreter, Browser) to enable unified trace views in CloudWatch. These identifiers are used for observability only - they are never used for authorization or data access decisions.

## Network configuration
<a name="harness-network-config"></a>

By default, harness sessions run on the public network. To access private resources (databases, internal APIs, private subnets), deploy the harness in your VPC.

**Example**  

```
aws bedrock-agentcore-control create-harness \
  --harness-name "VpcHarness" \
  --execution-role-arn "arn:aws:iam::123456789012:role/MyHarnessRole" \
  --environment '{"agentCoreRuntimeEnvironment": {"networkConfiguration": {"networkMode": "VPC", "networkModeConfig": {"securityGroups": ["sg-0abc1234def56789a"], "subnets": ["subnet-0abc1234def56789a"]}}}}'
```

```
agentcore add harness \
  --name internal_agent \
  --network-mode VPC \
  --network-config '{"subnets":["subnet-0abc1234def56789a"],"securityGroups":["sg-0abc1234def56789a"]}'

agentcore deploy
```

**Important**  
In VPC mode, the harness pulls its managed application container from a private Amazon ECR repository in the harness Region at the start of each session. Your VPC does not need a NAT gateway or internet access for this pull. Instead, create interface VPC endpoints for `com.amazonaws.<region>.ecr.dkr` and `com.amazonaws.<region>.ecr.api`, and a gateway VPC endpoint for `com.amazonaws.<region>.s3`, so the image and its layers resolve inside your VPC. If your agent calls Amazon Bedrock for inference, also create an interface endpoint for `com.amazonaws.<region>.bedrock-runtime`. Without the required endpoints, sessions fail to start due to image pull timeouts. The execution role must allow pulling from the private repository. See the [execution role policy](#harness-execution-role-policy).

For additional network configuration guidance, see [Configure AgentCore Runtime and built-in tools VPC configuration](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agentcore-vpc.html). For inbound API connectivity via PrivateLink, see [VPC interface endpoints](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/vpc-interface-endpoints.html).

## Inbound OAuth
<a name="_inbound_oauth"></a>

Require callers to present a valid JWT issued by a configured identity provider before they can invoke the harness. [AgentCore Identity](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html) threads the end-user identity through the agent, so downstream tools can call APIs with scoped user credentials instead of a shared service account.

**Example**  

```
aws bedrock-agentcore-control create-harness \
  --harness-name "OAuthHarness" \
  --execution-role-arn "arn:aws:iam::123456789012:role/MyHarnessRole" \
  --authorizer-configuration '{"customJWTAuthorizer": {"discoveryUrl": "https://cognito-idp.us-west-2.amazonaws.com/<POOL_ID>/.well-known/openid-configuration", "allowedClients": ["<CLIENT_ID>"]}}'
```
Invoke with a Bearer token instead of SigV4 credentials:  

```
curl -X POST "https://bedrock-agentcore.us-west-2.amazonaws.com/harnesses/invoke?harnessArn=${HARNESS_ARN}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ID_TOKEN}" \
  -H "X-Amzn-Bedrock-AgentCore-Runtime-Session-Id: $(uuidgen)" \
  -d '{"messages": [{"role": "user", "content": [{"text": "Hi"}]}]}'
```

```
agentcore add harness \
  --name MyJwtHarness \
  --authorizer-type CUSTOM_JWT \
  --authorizer-configuration \
  '{"customJwtAuthorizer":{"discoveryUrl":"https://cognito-idp.us-west-2.amazonaws.com/<POOL_ID>/.well-known/openid-configuration","allowedClients":["<CLIENT_ID>"]}}'

agentcore deploy
```
To invoke the harness with a Bearer token, send the request over HTTPS as shown in the preceding tab.  
When your identity provider’s OIDC discovery endpoint is reachable only over PrivateLink, include a private endpoint in the authorizer JSON. To use a service-managed VPC endpoint:  

```
agentcore add harness \
  --name MyManagedVpcHarness \
  --authorizer-type CUSTOM_JWT \
  --authorizer-configuration \
  '{"customJwtAuthorizer":{"discoveryUrl":"https://cognito-idp.us-west-2.amazonaws.com/<POOL_ID>/.well-known/openid-configuration","allowedClients":["<CLIENT_ID>"],"privateEndpoint":{"managedVpcResource":{"vpcIdentifier":"vpc-0abc1234def56789a","subnetIds":["subnet-0abc1234def56789a","subnet-0def5678abc12349b"],"endpointIpAddressType":"IPV4","securityGroupIds":["sg-0abc1234def56789a"]}}}}'

agentcore deploy
```
Or point at an existing VPC Lattice resource configuration instead of a managed VPC endpoint:  

```
agentcore add harness \
  --name MyLatticeHarness \
  --authorizer-type CUSTOM_JWT \
  --authorizer-configuration \
  '{"customJwtAuthorizer":{"discoveryUrl":"https://cognito-idp.us-west-2.amazonaws.com/<POOL_ID>/.well-known/openid-configuration","allowedClients":["<CLIENT_ID>"],"privateEndpoint":{"selfManagedLatticeResource":{"resourceConfigurationIdentifier":"rcfg-0abc1234def56789a"}}}}'

agentcore deploy
```
Configure exactly one of `managedVpcResource` or `selfManagedLatticeResource`. A managed VPC resource requires `vpcIdentifier`, `subnetIds`, and `endpointIpAddressType` (`IPV4` or `IPV6`).
See [inbound JWT authorizer](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/inbound-jwt-authorizer.html) for the full OAuth setup flow.

Learn more: [AgentCore Identity](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html) · [inbound JWT authorizer](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/inbound-jwt-authorizer.html) · [outbound credentials](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity-outbound-credential-provider.html) 

## Gateway policies
<a name="_gateway_policies"></a>

When tools are served through [AgentCore Gateway](gateway.md), [policies](policy.md) written in Dogwood or Cedar gate every call: which agentic actions a caller can invoke, under which conditions, with which arguments.

Learn more: [AgentCore Policy](policy.md) · [Policy authoring guide](policy-authoring-guide.md) 

## Execution role policy
<a name="harness-execution-role-policy"></a>

The harness assumes an IAM execution role you provide. The role’s trust policy must allow the AgentCore service principal to assume it:

```
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "bedrock-agentcore.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
```

### Required IAM permissions for callers
<a name="harness-iam-permissions"></a>

Harness APIs require permissions on both the harness resource and the underlying [AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-how-it-works.html) and optional [AgentCore Memory](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html) resources. The following table lists the required actions for each API:


| API | Required IAM actions | 
| --- | --- | 
|  `InvokeHarness`  |  `bedrock-agentcore:InvokeHarness`, `bedrock-agentcore:InvokeAgentRuntime`  | 
|  `InvokeAgentRuntimeCommand`  |  `bedrock-agentcore:InvokeAgentRuntimeCommand`, `bedrock-agentcore:InvokeAgentRuntime`  | 
|  `InvokeAgentRuntimeCommandShell`  |  `bedrock-agentcore:InvokeAgentRuntimeCommandShell`  | 
|  `CreateHarness`  |  `bedrock-agentcore:CreateHarness`, `bedrock-agentcore:CreateAgentRuntime`, `bedrock-agentcore:CreateMemory`  | 
|  `UpdateHarness`  |  `bedrock-agentcore:UpdateHarness`, `bedrock-agentcore:UpdateAgentRuntime`, `bedrock-agentcore:UpdateMemory`  | 
|  `DeleteHarness`  |  `bedrock-agentcore:DeleteHarness`, `bedrock-agentcore:DeleteAgentRuntime`, `bedrock-agentcore:DeleteMemory`  | 
|  `GetHarness`  |  `bedrock-agentcore:GetHarness`  | 
|  `ListHarnesses`  |  `bedrock-agentcore:ListHarnesses`  | 
|  `CreateHarnessEndpoint`  |  `bedrock-agentcore:CreateHarnessEndpoint`, `bedrock-agentcore:CreateAgentRuntimeEndpoint`  | 
|  `UpdateHarnessEndpoint`  |  `bedrock-agentcore:UpdateHarnessEndpoint`, `bedrock-agentcore:UpdateAgentRuntimeEndpoint`  | 
|  `DeleteHarnessEndpoint`  |  `bedrock-agentcore:DeleteHarnessEndpoint`, `bedrock-agentcore:DeleteAgentRuntimeEndpoint`  | 
|  `GetHarnessEndpoint`  |  `bedrock-agentcore:GetHarnessEndpoint`  | 
|  `ListHarnessEndpoints`  |  `bedrock-agentcore:ListHarnessEndpoints`  | 
|  `ListHarnessVersions`  |  `bedrock-agentcore:ListHarnessVersions`  | 

Most actions use the harness ARN as the resource scope: `arn:aws:bedrock-agentcore:<region>:<accountId>:harness/<id>`. Endpoint actions also use the harness endpoint ARN: `arn:aws:bedrock-agentcore:<region>:<accountId>:harness/<id>/harness-endpoint/<endpointName>`.

The `GetHarnessEndpoint`, `UpdateHarnessEndpoint`, and `DeleteHarnessEndpoint` actions require both the harness ARN and the endpoint ARN. `CreateHarnessEndpoint` requires only the harness ARN. The endpoint doesn’t exist yet, so no endpoint ARN is needed. When you invoke a custom endpoint, `InvokeHarness` and `InvokeAgentRuntimeCommand` require both the harness ARN and the endpoint ARN.

### Sample execution role policy
<a name="_sample_execution_role_policy"></a>

The following sample covers a harness on the public network, which pulls its managed container image from Amazon ECR Public. A harness in VPC mode pulls the managed image from a private Amazon ECR repository in the harness Region, so its execution role also needs private ECR pull permissions. Add the statements in [VPC mode: managed image pull from private ECR](#harness-vpc-managed-ecr) to the execution role for a VPC-mode harness.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockModelInvocation",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/*",
        "arn:aws:bedrock:<region>:<accountId>:*"
      ]
    },
    {
      "Sid": "EcrPublicTokenAccess",
      "Effect": "Allow",
      "Action": [
        "ecr-public:GetAuthorizationToken"
      ],
      "Resource": "*"
    },
    {
      "Sid": "StsForEcrPublicPull",
      "Effect": "Allow",
      "Action": [
        "sts:GetServiceBearerToken"
      ],
      "Resource": "*"
    },
    {
      "Sid": "XRayTracingAccess",
      "Effect": "Allow",
      "Action": [
        "xray:PutTraceSegments",
        "xray:PutTelemetryRecords",
        "xray:GetSamplingRules",
        "xray:GetSamplingTargets"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchLogsGroup",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:<region>:<accountId>:log-group:/aws/bedrock-agentcore/runtimes/*"
    },
    {
      "Sid": "CloudWatchLogsDescribeGroups",
      "Effect": "Allow",
      "Action": [
        "logs:DescribeLogGroups"
      ],
      "Resource": "arn:aws:logs:<region>:<accountId>:log-group:*"
    },
    {
      "Sid": "CloudWatchLogsStream",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:<region>:<accountId>:log-group:/aws/bedrock-agentcore/runtimes/*:log-stream:*"
    },
    {
      "Sid": "CloudWatchLogsPutResourcePolicy",
      "Effect": "Allow",
      "Action": [
        "logs:PutResourcePolicy"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchMetricsPublish",
      "Effect": "Allow",
      "Resource": "*",
      "Action": "cloudwatch:PutMetricData",
      "Condition": {
        "StringEquals": {
          "cloudwatch:namespace": "bedrock-agentcore"
        }
      }
    },
    {
      "Sid": "AgentCoreWorkloadIdentity",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:GetWorkloadAccessToken",
        "bedrock-agentcore:GetWorkloadAccessTokenForJWT"
      ],
      "Resource": [
        "arn:aws:bedrock-agentcore:<region>:<accountId>:workload-identity-directory/default",
        "arn:aws:bedrock-agentcore:<region>:<accountId>:workload-identity-directory/default/workload-identity/harness_<agentName>-*"
      ]
    },
    {
      "Sid": "AgentCoreBrowserDefault",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:StartBrowserSession",
        "bedrock-agentcore:StopBrowserSession",
        "bedrock-agentcore:GetBrowserSession",
        "bedrock-agentcore:ListBrowserSessions",
        "bedrock-agentcore:UpdateBrowserStream",
        "bedrock-agentcore:ConnectBrowserAutomationStream",
        "bedrock-agentcore:ConnectBrowserLiveViewStream"
      ],
      "Resource": "arn:aws:bedrock-agentcore:<region>:aws:browser/*"
    },
    {
      "Sid": "AgentCoreCodeInterpreterDefault",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:StartCodeInterpreterSession",
        "bedrock-agentcore:StopCodeInterpreterSession",
        "bedrock-agentcore:GetCodeInterpreterSession",
        "bedrock-agentcore:ListCodeInterpreterSessions",
        "bedrock-agentcore:InvokeCodeInterpreter"
      ],
      "Resource": "arn:aws:bedrock-agentcore:<region>:aws:code-interpreter/*"
    },
    {
      "Sid": "AgentCoreMemory",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:CreateEvent",
        "bedrock-agentcore:DeleteEvent",
        "bedrock-agentcore:GetEvent",
        "bedrock-agentcore:ListEvents",
        "bedrock-agentcore:RetrieveMemoryRecords"
      ],
      "Resource": "arn:aws:bedrock-agentcore:<region>:<accountId>:memory/harness_<agentNameAbbrv>_*"
    }
  ]
}
```

When you deploy a harness project without specifying an execution role, the AgentCore CLI’s CDK stack creates the role and grants permissions for supported configured features. Review supplemental permissions such as [VPC managed-image pull access](#harness-vpc-managed-ecr), which are not automatically added for that case. The policy above is for cases where you provide the role yourself. Imported execution roles are immutable to the generated CDK application; their owner must attach the required policies.

**Note**  
The `BedrockModelInvocation` sample statement above allows invocation of all foundation models across all regions and all Bedrock resources in your account. To scope this down, replace the resource ARNs with specific [inference profiles](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles.html), which let you route requests across models and regions with a single ARN. For example: `arn:aws:bedrock:<destination_regions>:<accountId>:inference-profile/<profileId>` paired with all allowed regions `arn:aws:bedrock:<region>:<accountId>:foundation-model/<modelId>`.

For production workloads, scope `Resource` values down to the specific ARNs your harness needs rather than using `"*"`.

### Additional permissions for optional features
<a name="_additional_permissions_for_optional_features"></a>

Below are sample policies you can append to your execution role based on the features your harness uses. Follow the principle of least privilege - grant your harness agent only the specific tools and credentials it needs for inference. See [Placeholder reference](#harness-optional-placeholders) for placeholder definitions.

#### Lifecycle hook targets
<a name="harness-lifecycle-hook-permissions"></a>

Add the permissions for each Lambda, SNS, or EventBridge target configured in [Lifecycle hooks](harness-lifecycle-hooks.md).

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "InvokeLifecycleHookLambda",
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "<hookFunctionArn>"
    },
    {
      "Sid": "PublishLifecycleHookSns",
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "<hookTopicArn>"
    },
    {
      "Sid": "PublishLifecycleHookEventBridge",
      "Effect": "Allow",
      "Action": "events:PutEvents",
      "Resource": "<hookEventBusArn>"
    }
  ]
}
```

Replace each resource with the exact target ARN from the hook configuration, including a Lambda version or alias qualifier when present. Remove statements for target types that the harness does not use. For a cross-account target, also configure the target’s resource-based policy to allow the harness execution role.

#### Private ECR access (custom container images)
<a name="harness-custom-container-ecr"></a>

Add this policy when your harness uses a private ECR image for a custom container.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRImageAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "arn:aws:ecr:<ecrRegion>:<ecrAccountId>:repository/<ecrRepoName>"
    },
    {
      "Sid": "ECRTokenAccess",
      "Effect": "Allow",
      "Action": "ecr:GetAuthorizationToken",
      "Resource": "*"
    }
  ]
}
```

#### VPC mode: managed image pull from private ECR
<a name="harness-vpc-managed-ecr"></a>

Add this policy when your harness runs in VPC mode. In VPC mode, the harness pulls its managed application container from a private Amazon ECR repository in the harness Region (named `harness-<region>`). This pull uses private ECR instead of Amazon ECR Public, so the execution role needs private ECR pull permissions. This policy is separate from the [custom container image permissions](#harness-custom-container-ecr)—it applies to the AWS managed image even when you do not supply your own container.

The repository is owned by an AWS service account, so the account in the repository ARN is wildcarded. The pull permissions are scoped to the harness Region.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EcrManagedImagePull",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchCheckLayerAvailability"
      ],
      "Resource": "arn:aws:ecr:<region>:*:repository/harness-*"
    },
    {
      "Sid": "EcrManagedImageToken",
      "Effect": "Allow",
      "Action": "ecr:GetAuthorizationToken",
      "Resource": "*"
    }
  ]
}
```

Make sure the required VPC endpoints exist in your VPC (see [Network configuration](#harness-network-config)): interface endpoints for `com.amazonaws.<region>.ecr.dkr` and `com.amazonaws.<region>.ecr.api`, and a gateway endpoint for `com.amazonaws.<region>.s3`.

For a CLI-created execution role, add these supplemental statements in `agentcore/cdk/lib/cdk-stack.ts`. Add the IAM import at the top of the file:

```
import * as iam from 'aws-cdk-lib/aws-iam';
```

After creating `this.application`, use the logical Harness name from your project:

```
const harness = this.application.harness('my_agent');
harness.addToPolicy(new iam.PolicyStatement({
  actions: [
    'ecr:BatchGetImage',
    'ecr:GetDownloadUrlForLayer',
    'ecr:BatchCheckLayerAvailability',
  ],
  resources: [`arn:${this.partition}:ecr:${this.region}:*:repository/harness-*`],
}));
harness.addToPolicy(new iam.PolicyStatement({
  actions: ['ecr:GetAuthorizationToken'],
  resources: ['*'],
}));
```

Run `agentcore deploy` from the project root to apply the policy. If the Harness uses an imported execution role, have its owner attach the JSON policy above instead. For general stack extension guidance, see [Customize the project’s CDK code](customize-project-cdk-code.md).

#### AgentCore Memory
<a name="_agentcore_memory"></a>

Add this policy when your harness uses a customer-owned memory instance.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AgentCoreMemory",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:CreateEvent",
        "bedrock-agentcore:DeleteEvent",
        "bedrock-agentcore:GetEvent",
        "bedrock-agentcore:ListEvents",
        "bedrock-agentcore:RetrieveMemoryRecords"
      ],
      "Resource": "arn:aws:bedrock-agentcore:<region>:<accountId>:memory/<memoryId>"
    }
  ]
}
```

#### AgentCore Browser (custom)
<a name="_agentcore_browser_custom"></a>

Add this policy when your harness uses a customer-owned custom browser resource.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AgentCoreBrowserCustom",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:StartBrowserSession",
        "bedrock-agentcore:StopBrowserSession",
        "bedrock-agentcore:GetBrowserSession",
        "bedrock-agentcore:ListBrowserSessions",
        "bedrock-agentcore:UpdateBrowserStream",
        "bedrock-agentcore:ConnectBrowserAutomationStream",
        "bedrock-agentcore:ConnectBrowserLiveViewStream"
      ],
      "Resource": "arn:aws:bedrock-agentcore:<region>:<accountId>:browser-custom/<browserCustomId>"
    }
  ]
}
```

#### AgentCore Code Interpreter (custom)
<a name="_agentcore_code_interpreter_custom"></a>

Add this policy when your harness uses a customer-owned custom code interpreter.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AgentCoreCodeInterpreterCustom",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:StartCodeInterpreterSession",
        "bedrock-agentcore:StopCodeInterpreterSession",
        "bedrock-agentcore:GetCodeInterpreterSession",
        "bedrock-agentcore:ListCodeInterpreterSessions",
        "bedrock-agentcore:InvokeCodeInterpreter"
      ],
      "Resource": "arn:aws:bedrock-agentcore:<region>:<accountId>:code-interpreter-custom/<codeInterpreterCustomId>"
    }
  ]
}
```

#### AgentCore Gateway
<a name="_agentcore_gateway"></a>

Add this policy when your harness uses a gateway configured with SigV4 inbound authentication.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AgentCoreGatewayAccess",
      "Effect": "Allow",
      "Action": "bedrock-agentcore:InvokeGateway",
      "Resource": "arn:aws:bedrock-agentcore:<region>:<accountId>:gateway/<gatewayId>"
    }
  ]
}
```

#### Skill sources in Amazon S3 and Git
<a name="_skill_sources_in_amazon_s3_and_git"></a>

Add this policy when your harness fetches a skill from an Amazon S3 source. The execution role lists and downloads the skill objects under the bucket prefix.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AgentCoreSkillS3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::<skillBucket>",
        "arn:aws:s3:::<skillBucket>/*"
      ]
    }
  ]
}
```

To fetch a skill from a private Git repository, the harness reads a personal access token from an API key credential provider. Grant the **API key credential provider** policy shown below for the credential provider that holds the token.

#### API key credential provider (OpenAI, Gemini, LiteLLM, or MCP header ARN references)
<a name="_api_key_credential_provider_openai_gemini_litellm_or_mcp_header_arn_references"></a>

Add this policy when your harness uses an API key credential provider for model providers such as OpenAI, Gemini, or LiteLLM.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AgentCoreApiKeyTokenVaultDefault",
      "Effect": "Allow",
      "Action": "bedrock-agentcore:GetResourceApiKey",
      "Resource": [
        "arn:aws:bedrock-agentcore:<region>:<accountId>:token-vault/default",
        "arn:aws:bedrock-agentcore:<region>:<accountId>:workload-identity-directory/default",
        "arn:aws:bedrock-agentcore:<region>:<accountId>:workload-identity-directory/default/workload-identity/harness_<agentName>-*"
      ]
    },
    {
      "Sid": "AgentCoreApiKeyTokenVaultPerKey",
      "Effect": "Allow",
      "Action": "bedrock-agentcore:GetResourceApiKey",
      "Resource": "arn:aws:bedrock-agentcore:<region>:<accountId>:token-vault/default/apikeycredentialprovider/<apiKeyName>"
    },
    {
      "Sid": "AgentCoreApiKeySecret",
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:<region>:<accountId>:secret:bedrock-agentcore-identity!default/apikey/<apiKeyName>-*"
    }
  ]
}
```

#### OAuth2 credential provider (OAuth-protected Gateway)
<a name="_oauth2_credential_provider_oauth_protected_gateway"></a>

Add this policy when your harness uses an OAuth2 credential provider for OAuth-protected gateway tools.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AgentCoreOAuth2TokenVaultDefault",
      "Effect": "Allow",
      "Action": "bedrock-agentcore:GetResourceOauth2Token",
      "Resource": [
        "arn:aws:bedrock-agentcore:<region>:<accountId>:token-vault/default",
        "arn:aws:bedrock-agentcore:<region>:<accountId>:workload-identity-directory/default",
        "arn:aws:bedrock-agentcore:<region>:<accountId>:workload-identity-directory/default/workload-identity/harness_<agentName>-*"
      ]
    },
    {
      "Sid": "AgentCoreOAuth2TokenVaultPerProvider",
      "Effect": "Allow",
      "Action": "bedrock-agentcore:GetResourceOauth2Token",
      "Resource": "arn:aws:bedrock-agentcore:<region>:<accountId>:token-vault/default/oauth2credentialprovider/<oauthProviderName>"
    },
    {
      "Sid": "AgentCoreOAuth2Secret",
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:<region>:<accountId>:secret:bedrock-agentcore-identity!default/oauth2/<oauthProviderName>-*"
    }
  ]
}
```

#### Placeholder reference
<a name="harness-optional-placeholders"></a>

Replace the following placeholders in the policies above with values specific to your environment:


| Placeholder | Description | 
| --- | --- | 
|  `<region>`  | The AWS Region where your resource is deployed. | 
|  `<accountId>`  | Your AWS account ID. | 
|  `<agentName>`  | The name of your harness agent. | 
|  `<agentNameAbbrv>`  | The abbreviated form of your harness agent name used in default AgentCore Memory resource names. | 
|  `<memoryId>`  | The ID of your AgentCore memory resource. | 
|  `<browserCustomId>`  | The ID of your custom browser resource. | 
|  `<codeInterpreterCustomId>`  | The ID of your custom code interpreter resource. | 
|  `<gatewayId>`  | The ID of your AgentCore Gateway resource. | 
|  `<apiKeyName>`  | The name of your API key credential provider. | 
|  `<skillBucket>`  | The name of the S3 bucket that holds your skill files. | 
|  `<oauthProviderName>`  | The name of your OAuth2 credential provider. | 
|  `<ecrRegion>`  | The region where your ECR repository is hosted. | 
|  `<ecrAccountId>`  | The AWS account ID that owns the ECR repository. | 
|  `<ecrRepoName>`  | The name of your ECR repository. | 
|  `<hookFunctionArn>`  | The ARN of a Lambda lifecycle hook target, including a version or alias qualifier when present. | 
|  `<hookTopicArn>`  | The ARN of an SNS lifecycle hook target. | 
|  `<hookEventBusArn>`  | The ARN of an EventBridge lifecycle hook target. | 

**Note**  
The trailing `-*` on Secrets Manager resources accounts for the random suffix that Secrets Manager appends to secret ARNs.

#### Related topics
<a name="_related_topics"></a>
+  [Tools](harness-tools.md) – Review tool types and `allowedTools` patterns
+  [Lifecycle hooks](harness-lifecycle-hooks.md) – Configure hooks to validate invocations and tool calls
+  [Environment and filesystem](harness-environment.md) – Configure custom environments and ECR permissions
+  [Interactive shells](harness-command-shell.md) – Open an interactive terminal in a harness session
+  [Control cost with limits](harness-operations.md#harness-limits) – Set execution limits to control cost
+  [API Documentation](harness-get-started.md#api-documentation) 