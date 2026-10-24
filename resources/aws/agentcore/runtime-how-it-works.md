

# microVMs
<a name="runtime-how-it-works"></a>

The Amazon Bedrock AgentCore Runtime handles scaling, session management, security isolation, and infrastructure management, allowing you to focus on building intelligent agent experiences rather than operational complexity. By leveraging the features and capabilities described here, you can build, deploy, and manage sophisticated AI agents that deliver value to your users while helping to maintain enterprise-grade security and reliability.

**Topics**
+ [Key components](#runtime-key-components)
+ [Platform versions](#runtime-platform-versions)
+ [Authentication and security](#runtime-auth-security)
+ [Additional features](#runtime-additional-features)
+ [Implementation overview](#runtime-implementation-overview)

## Key components
<a name="runtime-key-components"></a>

### AgentCore Runtime
<a name="runtime-agent-runtime"></a>

An AgentCore Runtime is the foundational component that hosts your AI agent or tool code. It represents a containerized application that processes user inputs, maintains context, and executes actions using AI capabilities. When you create an agent, you define its behavior, capabilities, and the tools it can access. For example, a customer support agent might answer product questions, process returns, and escalate complex issues to human representatives.

You can build and deploy agents to AgentCore Runtime using the [AgentCore CLI](develop-agents.md#agentcore-cli-configure-deploy) , the [AgentCore Python SDK](develop-agents.md#develop-agents-bedroock-agentcore-sdk) or directly through [AWS SDKs](develop-agents.md#develop-agents-bedrock-agentcore-aws-sdk) . With the AgentCore Python SDK, you can define your agent using [popular frameworks](using-any-agent-framework.md) like LangGraph, CrewAI, or Strands Agents. The SDK handles infrastructure complexities, allowing you to focus on the agent’s logic and capabilities.

Each AgentCore Runtime:
+ Has a unique identity
+ Is versioned to support controlled deployment and updates

### Versions
<a name="runtime-versions"></a>

Each AgentCore Runtime maintains immutable [versions](agent-runtime-versioning.md) that capture a complete snapshot of the configuration at a specific point in time:
+ When you create an AgentCore Runtime, Version 1 (V1) is automatically created
+ Each update to configuration (container image, protocol settings, network settings) creates a new version
+ Each version contains all necessary configuration needed for execution

This versioning system provides reliable deployment history and rollback capabilities.

### Endpoints
<a name="runtime-endpoints"></a>

 [Endpoints](agent-runtime-versioning.md) provide addressable access points to specific versions of your AgentCore Runtime. Each endpoint:
+ Has a unique ARN for invocation
+ References a specific version of your Agent Runtime
+ Provides stable access to your agent even as you update implementations

Key endpoint details:
+ The "DEFAULT" endpoint is automatically created when you call [CreateAgentRuntime](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreateAgentRuntime.html) and points to the latest version
+ When you update your AgentCore Runtime, a new version is created but the `DEFAULT` endpoint automatically updates to reference it
+ You can create custom endpoints with the [CreateAgentRuntimeEndpoint](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreateAgentRuntimeEndpoint.html) operation for different environments (dev, test, prod)
+ When a user makes a request to an endpoint, the request is resolved to the specific agent version referenced by that endpoint

Endpoints have distinct lifecycle states:
+  `CREATING` - Initial state during endpoint creation
+  `CREATE_FAILED` - Indicates creation failure due to permissions or other issues
+  `READY` - Endpoint is operational and accepting requests
+  `UPDATING` - Endpoint is being modified to reference a new version
+  `UPDATE_FAILED` - Indicates update operation failure

You can update endpoints without downtime, allowing for seamless version transitions and rollbacks.

### Sessions
<a name="runtime-sessions-overview"></a>

 [Sessions](runtime-sessions.md) represent individual interaction contexts between users and your AgentCore Runtime. Each session:
+ Is identified by a unique `runtimeSessionId` provided by your application, or by the Runtime itself in the first invocation if the `runtimeSessionId` is left empty
+ Runs in a dedicated microVM with completely isolated CPU, memory, and filesystem resources
+ Preserves context across multiple interactions within the same conversation
+ Can persist for up to 8 hours of total runtime

Session states include:
+  **Active** - Currently processing a request or executing background tasks
+  **Idle** - Not processing any requests but maintaining context while waiting for next interaction
+  **Terminated** - Session ended due to inactivity (15 minutes), reaching maximum lifetime (8 hours), or being deemed unhealthy

Important session characteristics:
+ After session termination, the entire microVM is terminated and memory is sanitized
+ A subsequent request with the same `runtimeSessionId` after termination will create a new execution environment
+ Session isolation prevents cross-session data contamination and ensures security
+ Session state is ephemeral and should not be used for long-term durability (use AgentCore Memory for context durability)

This complete isolation between sessions is crucial for enterprise security, particularly when dealing with non-deterministic AI processes.

## Platform versions
<a name="runtime-platform-versions"></a>

A platform version controls how AgentCore Runtime starts your agent. You set it with the `platformVersion` field (`V1` or `V2`) on each agent runtime. V1 is the default. The platform version applies to the agent runtime itself; it is separate from the [runtime versions](#runtime-versions) that capture your configuration history.

Amazon Bedrock AgentCore Runtime V2 starts your agent from a snapshot, which keeps cold starts fast and consistent regardless of concurrency or image size. AgentCore Runtime prepares your environment once and takes a snapshot of it, then restores that snapshot for each new instance instead of initializing your environment on each start.

Consistent cold starts  
V2 keeps cold-start latency consistent regardless of concurrency or image size, because each instance restores a prepared snapshot instead of initializing your environment. This matters most for large container images, which are otherwise slow to load on each cold start.

Lower cost for always-on or bursty agents  
V2 charges based on what your agent actively uses. AgentCore Runtime reclaims memory as your agent releases it, and reduces platform overhead.

**Note**  
Restoring from a snapshot changes how you structure your agent code. To learn how to optimize your agent and get the most out of platform version V2, see [Optimize your agent for AgentCore Runtime V2](runtime-v2-optimize.md).

### Supported Regions
<a name="runtime-platform-versions-regions"></a>

V2 is available in the following AWS Regions:
+ US East (N. Virginia), `us-east-1` 
+ US East (Ohio), `us-east-2` 
+ US West (Oregon), `us-west-2` 
+ Europe (Ireland), `eu-west-1` 
+ Asia Pacific (Tokyo), `ap-northeast-1` 

### Enable V2
<a name="runtime-enable-v2"></a>

You set the platform version for each agent runtime. Set it when you create a runtime, or update an existing runtime to move it between platform versions. If you omit `platformVersion` when you create a runtime, the runtime uses V1. If you omit it when you update a runtime, the runtime keeps its current platform version.

**Example**  

1. Open the Amazon Bedrock AgentCore console and choose **Runtime**.

1. On the **Runtime** page, choose **Create runtime**.

1. Enter a **Name** for the agent or tool.

1. For **Compute type**, choose **microVMs**.

1. Under **Agent/tool source**, choose your source type and provide the artifact, such as a container image URI or your code.

1. For **Platform version**, choose **V2**.

1. (Optional) Configure **Inbound auth**, **Advanced configurations**, and **Permissions**, such as the IAM execution role and KMS encryption key.

1. Choose **Create runtime**. AgentCore creates agent runtime version 1 and a `DEFAULT` endpoint that points to it.

1. Set `--platform-version V2` on the `create-agent-runtime` command.

   ```
   aws bedrock-agentcore-control create-agent-runtime \
     --agent-runtime-name "my-agent" \
     --role-arn "arn:aws:iam::111122223333:role/AgentExecutionRole" \
     --agent-runtime-artifact '{
       "containerConfiguration": {
         "containerUri": "111122223333.dkr.ecr.us-west-2.amazonaws.com/my-agent:latest"
       }
     }' \
     --network-configuration '{"networkMode": "PUBLIC"}' \
     --platform-version V2
   ```

1. To confirm the platform version, call `get-agent-runtime`.

   ```
   aws bedrock-agentcore-control get-agent-runtime \
     --agent-runtime-id my-agent-ABCDE12345 \
     --query platformVersion
   ```

1. The following example uses boto3 to create an agent runtime on V2.

   ```
   import boto3
   
   client = boto3.client("bedrock-agentcore-control", region_name="us-west-2")
   
   client.create_agent_runtime(
       agentRuntimeName="my-agent",
       roleArn="arn:aws:iam::111122223333:role/AgentExecutionRole",
       agentRuntimeArtifact={
           "containerConfiguration": {
               "containerUri": "111122223333.dkr.ecr.us-west-2.amazonaws.com/my-agent:latest"
           }
       },
       networkConfiguration={"networkMode": "PUBLIC"},
       platformVersion="V2",
   )
   ```

1. To confirm the platform version, call `get_agent_runtime`.

### What to expect
<a name="runtime-v2-what-to-expect"></a>

A V2 create or update operation prepares and snapshots your environment, so it behaves differently from V1.

Create and update take minutes  
On V1, a runtime reaches `READY` in seconds. On V2, preparing the snapshot adds a one-time cost, and create and update run for several minutes before the runtime reaches `READY`.

Your container must report healthy within 120 seconds  
AgentCore Runtime takes the snapshot on the first healthy `/ping` response. Report health from `/ping` only after initialization completes, so that the snapshot captures a fully initialized agent. If the runtime does not report healthy within 120 seconds of startup, creation fails with a health check error.

Poll for a terminal status  
The `create` and `update` operations return while the runtime is still `CREATING` or `UPDATING`. If you call `update` or `delete` before the runtime reaches a terminal state, the operation returns `ConflictException`. Poll `get_agent_runtime` until the status is `READY` or ends in `FAILED`, and allow several minutes for a V2 runtime to reach `READY`.  

```
import time

def wait_until_ready(client, agent_runtime_id):
    while True:
        status = client.get_agent_runtime(agentRuntimeId=agent_runtime_id)["status"]
        if status == "READY" or status.endswith("FAILED"):
            return status
        time.sleep(5)
```

**Note**  
V2 limits the total size of your agent’s environment variables to 1.5 KB for direct code deployments and 2.5 KB for container agents, compared to 4 KB on V1. If your configuration exceeds this limit, the request fails with a `ValidationException`. AgentCore Runtime will raise this limit to match V1.

### Snapshot lifecycle
<a name="runtime-v2-snapshot-lifecycle"></a>

On V2, AgentCore Runtime manages a snapshot for each runtime version that an endpoint points to. You do not create or delete snapshots directly. They follow your runtime and endpoint changes.

Created  
AgentCore Runtime prepares a snapshot when an endpoint points to a version. When you create a runtime, AgentCore Runtime hosts your version on the default endpoint and prepares its snapshot. A runtime can have more than one endpoint that points to different versions, so a runtime can have more than one snapshot at a time.

Updated  
When you update a runtime, AgentCore Runtime hosts the new version on the default endpoint and prepares a new snapshot. The previously hosted version is no longer referenced, so AgentCore Runtime marks its snapshot for deletion and removes it after existing sessions end.

Deleted  
AgentCore Runtime deletes a snapshot when no endpoint points to it. This occurs when you update a runtime, remove an endpoint’s reference to a version, or delete the runtime or a runtime endpoint. Deletion can take up to 8 hours, which is the maximum session lifetime, because sessions that are already running on the snapshot continue until they end.

## Authentication and security
<a name="runtime-auth-security"></a>

Inbound authentication controls who can access your agents through AWS Identity and Access Management or OAuth 2.0, validating bearer tokens from identity providers before allowing requests to proceed. Outbound authentication enables your agents to securely access third-party services using OAuth or API keys, with AgentCore Identity managing credentials in either user-delegated or autonomous modes. For more information, see [Authenticate and authorize with Inbound Auth and Outbound Auth](runtime-oauth.md).

### Inbound authentication
<a name="runtime-inbound-auth"></a>

Inbound Auth, powered by AgentCore Identity, controls who can access and invoke your agents or tools in AgentCore Runtime.

#### Authentication methods
<a name="runtime-auth-methods"></a>
+  ** AWS IAM** (SigV4): Uses AWS credentials for identity verification
+  **OAuth 2.0** : Integrates with external identity providers

#### OAuth configuration options
<a name="runtime-oauth-config"></a>
+  **Discovery URL** : Your identity provider’s OpenID Connect discovery endpoint
+  **Allowed Audiences** : List of valid audience values your tokens should contain
+  **Allowed Clients** : List of client identifiers that can access this agent

#### Authentication flow
<a name="runtime-auth-flow"></a>

1. End users authenticate with your identity provider (Amazon Cognito, Okta, Microsoft Entra ID)

1. Your client application receives a bearer token after successful authentication

1. The client passes this token in the authorization header when invoking the agent

1. AgentCore Runtime validates the token with the authorization server

1. If valid, the request is processed; if invalid, it’s rejected

This ensures only authenticated users with proper authorization can access your agents.

### Outbound authentication
<a name="runtime-outbound-auth"></a>

Outbound Auth, powered by Amazon Bedrock AgentCore Identity, lets your agents hosted on AgentCore Runtime securely access third-party services:

#### Authentication methods
<a name="runtime-outbound-auth-methods"></a>
+  **OAuth** : For services supporting OAuth flows
+  **API Keys** : For services using key-based authentication

#### Authentication modes
<a name="runtime-auth-modes"></a>
+  **User-delegated** : Acting on behalf of the end user with their credentials
+  **Autonomous** : Acting independently with service-level credentials

#### Supported services
<a name="runtime-supported-services"></a>
+ Enterprise systems such as Slack, Zoom, and GitHub
+  AWS services
+ Custom APIs and data sources

AgentCore Identity manages these credentials securely, preventing credential exposure in your agent code or logs.

## Additional features
<a name="runtime-additional-features"></a>

### Asynchronous processing
<a name="runtime-async-processing"></a>

AgentCore Runtime supports long-running workloads through:
+ Background task handling for operations that exceed request/response cycles
+ Automatic status tracking via the `/ping` endpoint
+ Support for operations up to 8 hours in duration

For more information, see [Handle asynchronous and long running agents with Amazon Bedrock AgentCore Runtime](runtime-long-run.md).

### Streaming responses
<a name="runtime-streaming-responses"></a>

Agents can stream partial results as they become available rather than waiting for complete processing. This lets you provide a more responsive user experience, especially for operations that generate large amounts of content or take significant time to complete. For more information, see [Stream agent responses](response-streaming.md).

### WebSocket API
<a name="runtime-websocket-api"></a>

The AgentCore Runtime provides [WebSocket](runtime-http-protocol-contract.md#ws-endpoint) support for real-time bidirectional streaming connections for interactive agent communication. This enables more responsive and interactive agent experiences. For more information, see [Get started with bidirectional streaming using WebSocket](runtime-get-started-websocket.md).

### Protocol support
<a name="runtime-protocol-support"></a>

AgentCore Runtime supports multiple communication protocols:
+  [HTTP](runtime-http-protocol-contract.md) : Direct REST API endpoints for traditional request/response patterns. For more information, see [Get started with the AgentCore CLI](runtime-get-started-cli.md).
+  [MCP](runtime-mcp-protocol-contract.md) : Model Context Protocol for tools and agent servers. For more information, see [Deploy MCP servers in AgentCore Runtime](runtime-mcp.md).
+  [A2A](runtime-a2a-protocol-contract.md) : Agent-to-Agent protocol for multi-agent communication and discovery. For more information, see [Deploy A2A servers in AgentCore Runtime](runtime-a2a.md).

## Implementation overview
<a name="runtime-implementation-overview"></a>

Here’s how to get started with the AgentCore Runtime. For the complete example, see [Get started with the AgentCore CLI](runtime-get-started-cli.md).

### Prepare your agent or tool code
<a name="runtime-prepare-code"></a>
+ Define your agent logic using any AI framework or custom code
+ Add the required HTTP endpoints using the AgentCore SDK or custom implementation
+ Package dependencies in a requirements.txt file

### Deploy your agent or tool
<a name="runtime-deploy-agent"></a>
+ Build and push a container image to Amazon ECR directly or via the AgentCore SDK
+ Create an AgentCore Runtime using the container image
+ The initial version (V1) and DEFAULT endpoint are created automatically

### Invoke your agent or tool
<a name="runtime-invoke-agent"></a>
+ Generate a unique session ID for each user conversation
+ Call the [InvokeAgentRuntime](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_InvokeAgentRuntime.html) or [InvokeAgentRuntimeWithWebSocketStream](runtime-get-started-websocket.md) operation with your agent’s ARN and session ID
+ Pass user input in the request payload

### Manage and observe sessions, and make updates
<a name="runtime-manage-observe"></a>
+ Use the same session ID for follow-up interactions to maintain context
+ Review logs, traces, and observability metrics
+ Deploy updates by modifying your AgentCore Runtime (creates new versions)
+ Control rollout by updating endpoints to point to new versions