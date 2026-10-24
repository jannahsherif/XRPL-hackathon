

# Quotas for Amazon Bedrock AgentCore
<a name="bedrock-agentcore-limits"></a>

Your AWS account has default quotas, formerly referred to as limits, for each AWS service. Unless otherwise noted, each quota is Region-specific. You can request increases for some quotas, and other quotas cannot be increased.

To request a quota increase, contact AWS support.

**Topics**
+ [AgentCore harness Service Quotas](#harness-service-limits)
+ [AgentCore Runtime Service Quotas](#runtime-service-limits)
+ [AgentCore Memory Service Quotas](#memory-limits)
+ [AgentCore Identity Service Quotas](#identity-service-limits)
+ [AgentCore Gateway Service Quotas](#gateway-endpoints-quotas)
+ [AgentCore Browser Service Quotas](#browser-service-limits)
+ [AgentCore Code Interpreter Service Quotas](#code-interpreter-service-limits)
+ [AgentCore Evaluations Service Quotas](#evaluation-service-limits)
+ [AgentCore Batch Evaluation Service Quotas](#optimization-batch-evaluation-limits)
+ [AgentCore AB Testing Service Quotas](#optimization-ab-testing-limits)
+ [AgentCore Recommendations Service Quotas](#optimization-recommendations-limits)
+ [AgentCore Configuration Bundle Service Quotas](#optimization-configuration-bundle-limits)
+ [AgentCore Policy Service Quotas](#policy-service-limits)
+ [AgentCore Resource Based Policies](#resource-based-policies-quotas)
+ [AWS Agent Registry Service Quotas](#registry-limits)

## AgentCore harness Service Quotas
<a name="harness-service-limits"></a>

AgentCore harness is a logical resource. Each harness you create is backed by a managed AgentCore Runtime that AgentCore provisions and operates on your behalf. Therefore, harness invocations are bound by the same service quotas that apply to AgentCore Runtime. These quotas include resource allocation, invocation, throttling, lifecycle, and session storage limits. For all applicable quotas, see [AgentCore Runtime Service Quotas](#runtime-service-limits).

For configurable per-invocation controls (such as iteration, timeout, and token caps), see [Control cost with limits](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/harness-operations.html#harness-limits).

## AgentCore Runtime Service Quotas
<a name="runtime-service-limits"></a>

When working with AgentCore Runtime, you need to be aware of the service limits that apply to your account. These limits help ensure service stability and availability for all users.

### Resource allocation limits
<a name="resource-allocation-limits"></a>

The following table describes the resource allocation limits for AgentCore Runtime. You can request increases for some quotas using the Service Quotas console.


| Limit | Default Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Active session workloads per account | 5,000 in US East (N. Virginia) and US West (Oregon), and 2,500 in other AWS Regions. | Yes | Can be increased via Service Quotas | 
| Total agents per account | 1,000 | Yes | Can be increased via Service Quotas | 
| Versions per agent | 1,000 | Yes | Can be increased via Service Quotas | 
| Endpoints (aliases) per agent | 10 | Yes | Can be increased via Service Quotas | 
| Maximum size for a Docker image in an AgentCore Runtime | 2 GB | No |  | 
| Maximum size for a direct code deployment package (compressed) | 250 MB | No | ZIP file size limit for direct code deployment | 
| Maximum size for a direct code deployment package (uncompressed) | 750 MB | No | Unzipped package size limit for direct code deployment | 
| Maximum hardware allocation per session | 2vCPU/8GB | No | The maximum memory/CPU usage and allocation per Runtime session | 
| Capacity providers per account | 1,000 | No | Applies to the Instances compute type in your account. Counts all capacity providers that you have not deleted, including those being created or deleted. | 
| Agents per capacity provider session | 20 | No | Applies to the Instances compute type. The maximum number of agents that you can run on a single capacity provider session. | 

For more information about service quotas and how to request increases, see [Requesting a quota increase](https://docs.aws.amazon.com/servicequotas/latest/userguide/request-quota-increase.html) in the *Service Quotas User Guide*.

**Note**  
Because the **Instances** compute type provisions Amazon EC2 resources in your own account, your account’s quotas for those resources apply in addition to the AgentCore quotas in the preceding table. AgentCore calls the following services on your behalf to provision and manage instances, which consumes your account’s quotas. For high-throughput workloads, you might need to request increases for the following:  
 **Amazon EC2** – the running instance count for the instance families you select, and the request rates for the instance operations that AgentCore calls, such as `RunInstances`, `CreateFleet`, `DescribeInstances`, `TerminateInstances`, and `CreateTags`. For more information, see [Amazon EC2 service quotas](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-resource-limits.html).
 **Amazon EBS** – the volume quotas for the volume types you use, and the request rates for the volume operations that AgentCore calls, such as `CreateVolume`, `AttachVolume`, `DetachVolume`, `DeleteVolume`, and `DescribeVolumes`. For more information, see [Quotas for Amazon EBS](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-resource-quotas.html).
 **Amazon VPC** – the number of network interfaces, and the request rates for the network interface operations that AgentCore calls, such as `AttachNetworkInterface` and `DescribeNetworkInterfaces`. For more information, see [Amazon VPC quotas](https://docs.aws.amazon.com/vpc/latest/userguide/amazon-vpc-limits.html).
 **Amazon EC2 Auto Scaling** – a single shared quota that applies to all Amazon EC2 Auto Scaling API calls, rather than to an individual operation. To request an increase to this quota, open an AWS Support case. For more information, see [Request throttling for the Amazon EC2 Auto Scaling API](https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-quotas.html#api-request-throttling).
To request an increase for a quota that is available in the Service Quotas console, see [Requesting a quota increase](https://docs.aws.amazon.com/servicequotas/latest/userguide/request-quota-increase.html) in the *Service Quotas User Guide*.

### Invocation limits
<a name="invocation-limits"></a>

The following table describes the invocation limits for AgentCore Runtime. You can request increases for some quotas using the Service Quotas console.


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Request timeout | 15 minutes | No | Maximum time for synchronous requests | 
| Maximum payload size | 100 MB | No | Maximum size for request/response payloads | 
| Streaming chunk size | 10 MB | No | Maximum size for individual chunks | 
| Streaming maximum duration | 60 mins | No | Maximum time for streaming connections (Response streaming, WebSocket connections) | 
| Asynchronous job maximum duration | 8 hours | No | Maximum execution time for asynchronous jobs | 
| WebSocket frame size | 64 KB | No | Maximum size for individual WebSocket frames | 

For more information about service quotas and how to request increases, see [Requesting a quota increase](https://docs.aws.amazon.com/servicequotas/latest/userguide/request-quota-increase.html) in the *Service Quotas User Guide*.

### Throttling limits
<a name="throttling-limits"></a>

The following table describes the rate limits for AgentCore Runtime after which you will be throttled. You can request increases for some quotas using the Service Quotas console.


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Data plane API request rate | 1,000 TPS | Yes | Transactions per second per account. This quota is shared across all data plane APIs and is not enforced for each API individually. It applies to the following APIs: `InvokeAgentRuntime`, `InvokeAgentRuntimeCommand`, `InvokeAgentRuntimeWithWebSocketStream`, `InvokeAgentRuntimeCommandShell`, `StopRuntimeSession`, `GetAgentCard`, `GetRuntimeProtectedResourceMetadata`. Additional `InvokeAgentRuntimeCommand` limits: command size 1 byte–64 KB, response size up to 100 MB, timeout 1–3600 seconds (default 300 seconds). Streaming chunk size is up to 64 KB for each event; session ID minimum is 33 characters. Additional `InvokeAgentRuntimeCommandShell` limits: maximum connection duration 1 hour, maximum frame payload 64 KB, up to 10 concurrent shell sessions per runtime, reconnection buffer 256 KB. | 
| New Runtime session creation rate | 25 TPS | Yes | Transactions per second per account. This quota is shared across all endpoints and is not enforced for each endpoint individually. It applies to new session creation for both container-image and direct code deployment agents. | 
| WebSocket frame rate per connection | 250 frames per second | No |  | 
| Control plane mutation API rate | 50 TPS | No | Transactions per second per account. This quota is shared across all control plane mutation APIs and is not enforced for each API individually. It applies to `CreateAgentRuntime`, `CreateAgentRuntimeEndpoint`, `UpdateAgentRuntime`, `UpdateAgentRuntimeEndpoint`, `DeleteAgentRuntime`, and `DeleteAgentRuntimeEndpoint`. | 
| Control plane Get API rate | 150 TPS | No | Transactions per second per account. This quota is shared across all control plane Get APIs and is not enforced for each API individually. It applies to `GetAgentRuntime` and `GetAgentRuntimeEndpoint`. | 
| Control plane List API rate | 25 TPS | No | Transactions per second per account. This quota is shared across all control plane List APIs and is not enforced for each API individually. It applies to `ListAgentRuntimes`, `ListAgentRuntimeEndpoints`, and `ListAgentRuntimeVersions`. | 

**Note**  
For a cross-account invocation, requests count against the resource owner’s per-account rate quotas. The resource owner is the account that owns the agent runtime.

For more information about service quotas and how to request increases, see [Requesting a quota increase](https://docs.aws.amazon.com/servicequotas/latest/userguide/request-quota-increase.html) in the *Service Quotas User Guide*.

### Lifetime session lifecycle parameters
<a name="lifetime-session-lifecycle"></a>

The following table describes the lifetime session lifecycle parameters for AgentCore Runtime:


| Phase | Timeout | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Idle session timeout | 15 minutes of inactivity | Yes, through the `idleRuntimeSessionTimeout` API parameter in the `LifecycleConfiguration` data type | When this limit is reached, the execution environment is terminated and a new one is created for the session | 
| Maximum session duration | 8 hrs | Yes, through the `maxLifetime` API parameter in the `LifecycleConfiguration` data type |  | 

### Session storage limits
<a name="session-storage-limits"></a>

The following table describes the limits for session storage:


| Limit | Value | Adjustable | Description | 
| --- | --- | --- | --- | 
| Maximum storage size | 1 GB | No | Maximum total storage size per session | 
| Maximum filesystem metadata | \~50 MB | No | Approximately 100,000–200,000 files | 
| Maximum directory depth | 200 levels | No | Maximum nested directory depth | 
| Maximum filename length | 255 bytes | No | Maximum length of a single filename | 
| Maximum symlink target length | 4,095 bytes | No | Maximum length of a symlink target path | 

## AgentCore Memory Service Quotas
<a name="memory-limits"></a>

The following table describes the lifetime session lifecycle parameters for AgentCore Memory:


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Maximum number of AgentCore Memory resources per AWS Region in an AWS account | 150 | Yes |  | 
| Maximum number of memory strategies per AgentCore Memory resource | 6 | No |  | 
| Maximum memory strategies per account | 900 | Yes |  | 
| Maximum CreateMemory requests | 3 | Yes | The maximum number of `CreateMemory` requests per second that you can perform in this AWS account in the current AWS Region. | 
| Maximum GetMemory requests | 50 | Yes | The maximum number of `GetMemory` requests per second that you can perform in this AWS account in the current AWS Region. | 
| Maximum DeleteMemory requests | 3 | Yes | The maximum number of `DeleteMemory` requests per second that you can perform in this AWS account in the current AWS Region. | 
| Maximum ListMemories requests | 5 | Yes | The maximum number of `ListMemories` requests per second that you can perform in this AWS account in the current AWS Region. | 
| Maximum UpdateMemory requests | 3 | Yes | The maximum number of `UpdateMemory` requests per second that you can perform in this AWS account in the current AWS Region. | 
| Minimum EventExpirationDuration days in a CreateEvent operation | 7 | No |  | 
| Maximum EventExpirationDuration days in a CreateEvent operation | 365 | No |  | 
| Maximum prompt size (AppendToPrompt) for custom memory strategy (Extraction/Consolidation) | 30 KB | No |  | 
| Maximum number of messages per CreateEvent operation | 100 | No |  | 
| Maximum message size in a CreateEvent operation | 100 KB | No |  | 
| Maximum event size in a CreateEvent operation | 10 MB | No |  | 
| Maximum number of payload items in an IngestData operation | 100 | No |  | 
| Maximum payload item size in an IngestData operation | 100 KB | No |  | 
| Maximum total payload size per IngestData request | 100 KB | No | The combined size of all payload items. | 
| Maximum CreateEvent requests | 200 | Yes | The maximum number of `CreateEvent` requests per second that you can perform in this AWS account in the current AWS Region. | 
| Maximum CreateEvent requests per actor, per session, including conversational payloads | 5 | No | The maximum number of `CreateEvent` requests per second, per actor, per session, including conversational payloads that you can perform in this AWS account in the current AWS Region. | 
| Maximum CreateEvent requests per actor, per session, not including conversational payloads | 10 | No | The maximum number of `CreateEvent` requests per second, per actor, per session, not including conversational payloads that you can perform in this AWS account in the current AWS Region. | 
| Maximum IngestData requests | 10 | No | The maximum number of `IngestData` requests per second that you can perform in this AWS account in the current AWS Region. | 
| Maximum IngestData requests per actor, per session, including conversational payloads | 5 | No | The maximum number of `IngestData` requests per second, per actor, per session, including conversational payloads that you can perform in this AWS account in the current AWS Region. | 
| Maximum IngestData requests per actor, per session, not including conversational payloads | 10 | No | The maximum number of `IngestData` requests per second, per actor, per session, not including conversational payloads that you can perform in this AWS account in the current AWS Region. | 
| Maximum DeleteEvent requests | 20 | Yes | The maximum number of `DeleteEvent` requests per second that you can perform in this AWS account in the current AWS Region. | 
| Maximum DeleteEvent requests per actor, per session | 5 | Yes | The maximum number of `DeleteEvent` requests per second, per actor, per session that you can perform in this AWS account in the current AWS Region. | 
| Maximum ListEvents requests | 200 | Yes | The maximum number of `ListEvents` requests per second that you can perform in this AWS account in the current AWS Region. | 
| Maximum ListEvents requests per actor, per session | 20 | No | The maximum number of `ListEvents` requests per second, per actor, per session that you can perform in this AWS account in the current AWS Region. | 
| Maximum RetrieveMemoryRecords requests | 30 | Yes | The maximum number of `RetrieveMemoryRecords` requests per second that you can perform in this AWS account in the current AWS Region. | 
| Maximum ListMemoryRecords requests | 30 | Yes | The maximum number of `ListMemoryRecords` requests per second that you can perform in this AWS account in the current AWS Region. | 
| Maximum requests for all other AgentCore Memory APIs | 20 | Yes | The maximum transactions per second (TPS) that can be processed in this AWS account in the current AWS Region for all other AgentCore Memory APIs. | 
| Maximum number of tokens per minute for long-term memory extraction | 150,000 | Yes | The maximum number of tokens per minute that can be processed for long-term memory extraction for built-in strategies in this AWS account in the current AWS Region. You can monitor token use through the [Amazon CloudWatch metric](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html) named `TokenCount` in the `Bedrock-AgentCore` namespace. You can request an increase to this limit through the Service Quotas console. | 
| Maximum number of tokens per minute for episodic long-term memory extraction per session | 50,000 | No | The per-session, tokens per minute limit that can be processed for episodic long-term memory extraction in this AWS account in the current AWS Region. | 

## AgentCore Identity Service Quotas
<a name="identity-service-limits"></a>

When working with AgentCore Identity, you need to be aware of the service limits that apply to your account. These limits help ensure service stability and availability for all users.

### Resource limits
<a name="identity-resource-limits"></a>

The following table describes the resource limits for AgentCore Identity. You can request increases for some quotas using the Service Quotas console.


| Limit | Default Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Workload identities | 11,000 | Yes | The maximum number of workload identities that you can create in this account in the current Region. | 
| Resource OAuth2 credential providers | 50 | Yes | The maximum number of OAuth2 credential providers for egress resources that you can create in this account in the current Region. | 
| Resource API key credential providers | 50 | Yes | The maximum number of API key credential providers for egress resources that you can create in this account in the current Region. | 
| Resource Payment credential providers | 50 | Yes | The maximum number of payment credential providers for egress resources that you can create in this account in the current Region. | 

### Throttling limits
<a name="identity-throttling-limits"></a>

The following table describes the rate limits for AgentCore Identity APIs after which you will be throttled. You can request increases for some quotas using the Service Quotas console.


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| CreateWorkloadIdentity API rate | 20 TPS | Yes | Transactions per second per account | 
| GetWorkloadIdentity API rate | 20 TPS | Yes | Transactions per second per account | 
| UpdateWorkloadIdentity API rate | 20 TPS | Yes | Transactions per second per account | 
| DeleteWorkloadIdentity API rate | 20 TPS | Yes | Transactions per second per account | 
| ListWorkloadIdentities API rate | 20 TPS | Yes | Transactions per second per account | 
| GetWorkloadAccessToken API rate | 200 TPS | Yes | Transactions per second per account | 
| GetWorkloadAccessTokenForJWT API rate | 200 TPS | Yes | Transactions per second per account | 
| GetWorkloadAccessTokenForUserId API rate | 200 TPS | Yes | Transactions per second per account | 
| CreateOauth2CredentialProvider API rate | 20 TPS | Yes | Transactions per second per account | 
| GetOauth2CredentialProvider API rate | 20 TPS | Yes | Transactions per second per account | 
| UpdateOauth2CredentialProvider API rate | 20 TPS | Yes | Transactions per second per account | 
| DeleteOauth2CredentialProvider API rate | 20 TPS | Yes | Transactions per second per account | 
| ListOauth2CredentialProviders API rate | 20 TPS | Yes | Transactions per second per account | 
| CreateApiKeyCredentialProvider API rate | 20 TPS | Yes | Transactions per second per account | 
| GetApiKeyCredentialProvider API rate | 20 TPS | Yes | Transactions per second per account | 
| UpdateApiKeyCredentialProvider API rate | 20 TPS | Yes | Transactions per second per account | 
| DeleteApiKeyCredentialProvider API rate | 20 TPS | Yes | Transactions per second per account | 
| ListApiKeyCredentialProviders API rate | 20 TPS | Yes | Transactions per second per account | 
| CreatePaymentCredentialProvider API rate | 20 TPS | Yes | Transactions per second per account | 
| GetPaymentCredentialProvider API rate | 20 TPS | Yes | Transactions per second per account | 
| UpdatePaymentCredentialProvider API rate | 20 TPS | Yes | Transactions per second per account | 
| DeletePaymentCredentialProvider API rate | 20 TPS | Yes | Transactions per second per account | 
| ListPaymentCredentialProviders API rate | 20 TPS | Yes | Transactions per second per account | 
| GetResourceOauth2Token API rate | 200 TPS | Yes | Transactions per second per account | 
| GetResourceApiKey API rate | 200 TPS | Yes | Transactions per second per account | 
| GetResourcePaymentToken API rate | 200 TPS | Yes | Transactions per second per account | 
| CompleteResourceTokenAuth API rate | 100 TPS | Yes | Transactions per second per account | 

For more information about service quotas and how to request increases, see [Requesting a quota increase](https://docs.aws.amazon.com/servicequotas/latest/userguide/request-quota-increase.html) in the *Service Quotas User Guide*.

## AgentCore Gateway Service Quotas
<a name="gateway-endpoints-quotas"></a>

This section provides information about Amazon Bedrock AgentCore Gateway endpoints and service limits.

### Endpoints
<a name="gateway-endpoints"></a>

Amazon Bedrock AgentCore Gateway provides AWS Region-specific endpoints for management operations and runtime access.

The Amazon Bedrock AgentCore Gateway control plane endpoints use the following format, where you can replace `<region>` with any of the AWS Regions listed in [Supported AWS Regions](agentcore-regions.md).

```
bedrock-agentcore-control.<region>.amazonaws.com
```

The AgentCore Gateway URLs for runtime access have the following format:

```
https://{gateway-Id}.gateway.bedrock-agentcore.{Region}.amazonaws.com
```

Where:
+  **{gateway-Id}** is the unique identifier for your gateway
+  **{Region}** is the AWS Region where your gateway is deployed

Gateway ARNs have the following format:

```
arn:${Partition}:bedrock-agentcore:${Region}:${Account}:gateway/${gateway-Id}
```

The AgentCore service principal is: `bedrock-agentcore.amazonaws.com` 

### Service quotas
<a name="gateway-quotas"></a>

Amazon Bedrock AgentCore Gateway has the following service quotas. You can request increases for some quotas using the Service Quotas console.


| Quota | Default value | Adjustable | 
| --- | --- | --- | 
| Number of gateways per account | 1000 | Yes | 
| Number of targets per gateway | 100 | Yes | 
| Number of tools per target | 1000 | Yes | 
| Timeout for a gateway invocation | 15 minutes | Yes | 
| Maximum inline schema size | 1 MB | Yes | 
| Maximum S3 payload schema size | 10 MB | Yes | 
| Tool name character limit | 256 characters | Yes | 
| CreateGateway API rate | 5 transactions per second | Yes | 
| UpdateGateway API rate | 5 transactions per second | Yes | 
| GetGateway API rate | 10 transactions per second | Yes | 
| ListGateways API rate | 10 transactions per second | Yes | 
| DeleteGateway API rate | 5 transactions per second | Yes | 
| CreateGatewayTarget API rate | 5 transactions per second | Yes | 
| UpdateGatewayTarget API rate | 5 transactions per second | Yes | 
| GetGatewayTarget API rate | 10 transactions per second | Yes | 
| ListGatewayTargets API rate | 10 transactions per second | Yes | 
| DeleteGatewayTarget API rate | 5 transactions per second | Yes | 
| Concurrent target operations (total of Create/Update/DeleteTarget) on same gateway | 5 | Yes | 
| tool-call/tool-list rate at gateway level | 200 transactions per second | Yes | 
| tool-call/tool-list rate at account level | 200 transactions per second | Yes | 
| tool-call/tool-list concurrent connections at gateway level | 5000 concurrent connections | Yes | 
| tool-call/tool-list concurrent connections at account level | 5000 concurrent connections | Yes | 
| Search-based tool-call rate | 25 transactions per minute | Yes | 
| Maximum tool-call/tool-list/tool-search payload size | 6 MB | Yes | 
| Rate of Web Search Tool requests | 10 transactions per second | Yes | 

For more information about service quotas and how to request increases, see [Requesting a quota increase](https://docs.aws.amazon.com/servicequotas/latest/userguide/request-quota-increase.html) in the *Service Quotas User Guide*.

## AgentCore Browser Service Quotas
<a name="browser-service-limits"></a>

The Browser tool has the following service quotas and considerations that apply to your account.


| Quota | Default Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Concurrent active sessions per account | 1000 | Yes | Can be increased via support ticket | 
| Total Browser tool configurations per account | 1000 | Yes | Can be increased via support ticket | 
| Hardware configuration per session | 1vCPU/4GB | No | The maximum memory/CPU usage and configuration per account | 

### Browser Invocation Limits
<a name="browser-invocation-limits"></a>

The following table describes the invocation limits for the Browser tool:


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Automation stream limit per session | 1 | No | Maximum number of automation streams per session | 
| Live view stream limit per session | 1 | No | Maximum number of live view streams per session | 
| Asynchronous command max duration | 8 hrs | No | Maximum execution time for asynchronous commands | 
| Disk size | 10 GB | No | Maximum disk space available per session | 

### Browser Extensions Limits
<a name="browser-extensions-limits"></a>

The following table describes the limits for browser extensions:


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Maximum file size per extension | 10 MB | Yes | Each extension ZIP file limit | 
| Maximum extensions per session | 10 | Yes | Total extensions per session | 

### Browser Profile Limitations
<a name="browser-profile-limits"></a>

The following table describes the limits for browser profiles:


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Maximum size per profile | 50 MB | Yes | The size limit applies to cookies and localStorage in total | 
| Maximum number of profiles per account | 100 | Yes | Can be increased via support ticket | 

### Browser Proxy Limits
<a name="browser-proxy-limits"></a>

The following table describes the limits for browser proxies:


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Maximum proxies per session | 5 | No | Total external proxies in proxyConfiguration | 
| Maximum domain patterns per proxy | 50 | No | domainPatterns array per proxy | 
| Maximum total domain patterns | 100 | No | Across all proxies and bypass | 
| Server hostname length | 253 characters | No | Standard DNS limit | 
| Domain pattern length | 253 characters | No | Standard DNS limit | 

### Browser Throttling Limits
<a name="browser-throttling-limits"></a>

The following table describes the rate limits for the Browser tool APIs after which you will be throttled:


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| CreateBrowser API rate | 5 TPS | Yes | Transactions per second per account | 
| GetBrowser API rate | 30 TPS | Yes | Transactions per second per account | 
| ListBrowsers API rate | 30 TPS | Yes | Transactions per second per account | 
| DeleteBrowser API rate | 5 TPS | Yes | Transactions per second per account | 
| StartBrowserSession API rate | 30 TPS | Yes | Transactions per second per account | 
| GetBrowserSession API rate | 30 TPS | Yes | Transactions per second per account | 
| ListBrowserSessions API rate | 30 TPS | Yes | Transactions per second per account | 
| StopBrowserSession API rate | 30 TPS | Yes | Transactions per second per account | 
| UpdateBrowserStream API rate | 30 TPS | Yes | Transactions per second per account | 
| ConnectBrowserAutomationStream API rate | 30 TPS | Yes | Transactions per second per account | 
| ConnectBrowserLiveViewStream API rate | 30 TPS | Yes | Transactions per second per account | 
| InvokeBrowser API rate | 5 TPS | Yes | Transactions per second per account | 
| SaveBrowserSessionProfile API rate | 10 TPS | Yes | Transactions per second per account | 
| CreateBrowserProfile API rate | 5 TPS | Yes | Transactions per second per account | 
| GetBrowserProfile API rate | 30 TPS | Yes | Transactions per second per account | 
| ListBrowserProfiles API rate | 30 TPS | Yes | Transactions per second per account | 
| DeleteBrowserProfile API rate | 5 TPS | Yes | Transactions per second per account | 

## AgentCore Code Interpreter Service Quotas
<a name="code-interpreter-service-limits"></a>

The Code Interpreter tool has the following service quotas and considerations that apply to your account.


| Quota | Default Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Concurrent active sessions per account | 1000 | Yes | Can be increased via support ticket | 
| Total Code Interpreter tool configurations per account | 1000 | Yes | Can be increased via support ticket | 
| Hardware configuration per session | 2vCPU/8GB | No | The maximum memory/CPU usage and configuration per account | 

### Code Interpreter Invocation Limits
<a name="code-interpreter-invocation-limits"></a>

The following table describes the invocation limits for the Code Interpreter tool:


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Request timeout | 15 mins | No | Maximum time for synchronous requests | 
| Max payload size | 100 MB | No | Maximum size for request/response payloads | 
| Asynchronous command max duration | 8 hrs | No | Maximum execution time for asynchronous commands | 
| Disk size | 10 GB | No | Maximum disk space available per session | 

### Code Interpreter Throttling Limits
<a name="code-interpreter-throttling-limits"></a>

The following table describes the rate limits for the Code Interpreter tool APIs after which you will be throttled:


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| CreateCodeInterpreter API rate | 5 TPS | Yes | Transactions per second per account | 
| GetCodeInterpreter API rate | 30 TPS | Yes | Transactions per second per account | 
| ListCodeInterpreters API rate | 30 TPS | Yes | Transactions per second per account | 
| DeleteCodeInterpreter API rate | 5 TPS | Yes | Transactions per second per account | 
| StartCodeInterpreterSession API rate | 30 TPS | Yes | Transactions per second per account | 
| GetCodeInterpreterSession API rate | 30 TPS | Yes | Transactions per second per account | 
| ListCodeInterpreterSessions API rate | 30 TPS | Yes | Transactions per second per account | 
| StopCodeInterpreterSession API rate | 30 TPS | Yes | Transactions per second per account | 
| InvokeCodeInterpreter API rate | 30 TPS | Yes | Transactions per second per account | 

## AgentCore Evaluations Service Quotas
<a name="evaluation-service-limits"></a>

The following table describes the service quotas for AgentCore Evaluations:


| Limit | Default Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Input tokens per minute for built-in evaluators | 1,000,000 | Yes | Applies to on-demand evaluations. | 
| Evaluations per minute for built-in evaluators | 1,200 | No | Applies to on-demand evaluations. Asia Pacific (Mumbai) and Asia Pacific (Singapore) have a limit of 200 per minute. | 
| Spans per on-demand evaluation | 20,000 | No |  | 
| On-demand evaluation payload size (in MB) | 200 | No |  | 
| Evaluators per on-demand evaluation | 1 | No |  | 
| Input tokens per evaluation | 200,000 | No |  | 
| Spans evaluated per sampled session | 20,000 | No |  | 
| Size of all spans in a sampled session (in MB) | 200 | No |  | 
| Online evaluation configurations per account | 1,000 | Yes |  | 
| Evaluators per online evaluation configuration | 25 | No |  | 
| Custom evaluators per account | 10,000 | Yes |  | 
| Dimensions per multi-dimension evaluator | 50 | No |  | 

## AgentCore Batch Evaluation Service Quotas
<a name="optimization-batch-evaluation-limits"></a>

The following are the service quotas for AgentCore Batch Evaluation. These quotas ensure service stability and availability.

### Throttling limits
<a name="batch-evaluation-throttling-limits"></a>

The following table describes the rate quotas for AgentCore Batch Evaluation APIs. Requests exceeding these quotas are throttled.


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| CreateBatchEvaluation API rate | 3 TPS | No | Transactions per second per account | 
| StopBatchEvaluation API rate | 3 TPS | No | Transactions per second per account | 
| DeleteBatchEvaluation API rate | 3 TPS | No | Transactions per second per account | 
| GetBatchEvaluation API rate | 60 TPS | No | Transactions per second per account | 
| ListBatchEvaluations API rate | 60 TPS | No | Transactions per second per account | 

### Resource limits
<a name="batch-evaluation-resource-limits"></a>


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Active evaluations per account | 5 | Yes | Maximum concurrent batch evaluations running | 
| Maximum batch evaluations per account | 2,000 | No | Total batch evaluations that can exist. To create more, delete existing batch evaluations. | 
| Sessions per evaluation job | 500 | Yes | Maximum number of sessions per batch evaluation job | 
| Evaluators per job | 10 | No | Maximum number of evaluators per batch evaluation job | 

## AgentCore AB Testing Service Quotas
<a name="optimization-ab-testing-limits"></a>

The following are the service quotas for AgentCore AB Testing. These quotas ensure service stability and availability.

### Throttling limits
<a name="ab-testing-throttling-limits"></a>

The following table describes the rate quotas for AgentCore AB Testing APIs. Requests exceeding these quotas are throttled.


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| CreateABTest API rate | 3 TPS | No | Transactions per second per account | 
| UpdateABTest API rate | 3 TPS | No | Transactions per second per account | 
| DeleteABTest API rate | 3 TPS | No | Transactions per second per account | 
| GetABTest API rate | 60 TPS | No | Transactions per second per account | 
| ListABTests API rate | 60 TPS | No | Transactions per second per account | 

### Resource limits
<a name="ab-testing-resource-limits"></a>


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Active AB tests per account | 20 | Yes | AB tests with execution status of PAUSED or RUNNING | 
| Maximum AB tests per gateway | 1 | No |  | 
| Treatments per AB test | 2 | No | Control and one treatment variant | 
| Maximum AB tests per account | 2,000 | No | Total AB tests that can exist. To create more, delete existing AB tests. | 

## AgentCore Recommendations Service Quotas
<a name="optimization-recommendations-limits"></a>

The following are the service quotas for AgentCore Recommendations. These quotas ensure service stability and availability.

### Throttling limits
<a name="recommendations-throttling-limits"></a>

The following table describes the rate quotas for AgentCore Recommendations APIs. Requests exceeding these quotas are throttled.


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| StartRecommendation API rate | 3 TPS | No | Transactions per second per account | 
| DeleteRecommendation API rate | 3 TPS | No | Transactions per second per account | 
| GetRecommendation API rate | 60 TPS | No | Transactions per second per account | 
| ListRecommendations API rate | 60 TPS | No | Transactions per second per account | 

### Resource limits
<a name="recommendations-resource-limits"></a>


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Active recommendations per account | 5 | Yes | Maximum concurrent recommendations running | 
| Maximum recommendations per account | 2,000 | No | Total recommendations that can exist. To create more, delete existing recommendations. | 
| Sessions per recommendation | 20 | No | Number of sessions sampled per recommendation | 
| Spans per request (inline) | 1,000 | No | Maximum size of sessionSpans list when using inline input | 
| Inline payload size | 15 MB | No | Maximum size of the entire request body when using inline option | 
| Prompt size | 20,000 characters | No | Maximum prompt size for both inline and configuration bundle paths | 

## AgentCore Configuration Bundle Service Quotas
<a name="optimization-configuration-bundle-limits"></a>

The following are the service quotas for AgentCore Configuration Bundles. These quotas ensure service stability and availability.

### Throttling limits
<a name="configuration-bundle-throttling-limits"></a>

The following table describes the rate quotas for AgentCore Configuration Bundle APIs. Requests exceeding these quotas are throttled.


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| GetConfigBundleVersion API rate | 500 TPS | No | Transactions per second per account | 
| CreateConfigBundle API rate | 3 TPS | No | Transactions per second per account | 
| UpdateConfigBundle API rate | 3 TPS | No | Transactions per second per account | 
| DeleteConfigBundle API rate | 3 TPS | No | Transactions per second per account | 
| GetConfigBundle API rate | 60 TPS | No | Transactions per second per account | 
| ListConfigBundles API rate | 60 TPS | No | Transactions per second per account | 

### Resource limits
<a name="configuration-bundle-resource-limits"></a>


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Maximum configuration bundles per account | 1,000 | Yes |  | 
| Maximum bundle versions per configuration bundle | 10,000 | No |  | 
| Maximum payload (JSON) size | 5 MB | No |  | 

## AgentCore Policy Service Quotas
<a name="policy-service-limits"></a>

When working with AgentCore Policy, you need to be aware of the service limits that apply to your account. These limits help ensure service stability and availability for all users.

### Resource limits
<a name="policy-resource-limits"></a>


| Quota | Default value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Policy engines per account per Region | 1,000 | No |  | 
| Policies per policy engine | 1,000 | No |  | 
| Generated policies (7-day rolling window) per policy engine | 50,000 | No |  | 
| Maximum policy size | 10 KB | No | Per individual policy | 
| Maximum total policy size per resource | 200 KB | No | Combined size of all policies per resource within a policy engine | 
| Cedar schema size | 400 KB | No | Per policy engine schema. This limit applies to the combined Cedar schema generated from all tools across all gateways associated with the policy engine. The schema size grows with the number of tools and the complexity of their input parameters, not just the tool count. If the schema exceeds this limit, consider using separate policy engines for different gateways or removing unused tools. | 
| Temporal policies per policy engine | 20 | No | Temporal policies count toward the 1,000 policies per policy engine quota. Of those 1,000 policies, no more than 20 can be temporal. | 
| Temporal operators per policy | 3 | No | A single policy can combine at most three temporal operators, such as `formerly within` or `since within`, each of which looks for past events within a given time window. For more information, see [The past operators and their windows](https://dogwood-policy.github.io/dogwood/guide/04-temporal-expressions.html#the-past-operators-and-their-windows) in the Dogwood language guide on the Dogwood Policy website. | 
| Maximum time window per temporal condition | 24 hours | No | The time window a temporal condition looks back over, such as the `1h` in `formerly within 1h`, can’t exceed 24 hours. | 

### Throttling limits
<a name="policy-throttling-limits"></a>

The following table describes the rate limits for AgentCore Policy APIs after which you will be throttled.


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| CreatePolicyEngine API rate | 1 TPS | No | Transactions per second per account | 
| GetPolicyEngine API rate | 5 TPS | No | Transactions per second per account | 
| UpdatePolicyEngine API rate | 1 TPS | No | Transactions per second per account | 
| ListPolicyEngines API rate | 5 TPS | No | Transactions per second per account | 
| DeletePolicyEngine API rate | 1 TPS | No | Transactions per second per account | 
| CreatePolicy API rate | 5 TPS | No | Transactions per second per account | 
| GetPolicy API rate | 5 TPS | No | Transactions per second per account | 
| UpdatePolicy API rate | 5 TPS | No | Transactions per second per account | 
| ListPolicies API rate | 5 TPS | No | Transactions per second per account | 
| DeletePolicy API rate | 5 TPS | No | Transactions per second per account | 
| StartPolicyGeneration API rate | 1 TPS | No | Transactions per second per account | 
| GetPolicyGeneration API rate | 5 TPS | No | Transactions per second per account | 
| ListPolicyGenerations API rate | 5 TPS | No | Transactions per second per account | 
| ListPolicyGenerationAssets API rate | 5 TPS | No | Transactions per second per account | 

## AgentCore Resource Based Policies
<a name="resource-based-policies-quotas"></a>

The following table describes the quotas for resource-based policies:


| Quota | Default value | Adjustable | 
| --- | --- | --- | 
| Maximum policy size | 20 KB | No | 
| Maximum statements per policy | 100 | No | 

## AWS Agent Registry Service Quotas
<a name="registry-limits"></a>

### Resource limits
<a name="registry-resource-limits"></a>


| Quota | Default value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| Maximum registries per account per Region | 10 | Yes |  | 

### Throttling limits
<a name="registry-throttling-limits"></a>

The following table describes the rate limits for AgentCore Registry APIs after which you will be throttled. You can request increases for some quotas using the Service Quotas console.


| Limit | Value | Adjustable | Notes | 
| --- | --- | --- | --- | 
| CreateRegistry API rate | 5 TPS | Yes | Transactions per second per account | 
| GetRegistry API rate | 5 TPS | Yes | Transactions per second per account | 
| UpdateRegistry API rate | 5 TPS | Yes | Transactions per second per account | 
| DeleteRegistry API rate | 5 TPS | Yes | Transactions per second per account | 
| ListRegistries API rate | 5 TPS | Yes | Transactions per second per account | 
| CreateRegistryRecord API rate | 5 TPS | Yes | Transactions per second per account | 
| GetRegistryRecord API rate | 10 TPS | Yes | Transactions per second per account | 
| UpdateRegistryRecord API rate | 5 TPS | Yes | Transactions per second per account | 
| DeleteRegistryRecord API rate | 10 TPS | Yes | Transactions per second per account | 
| ListRegistryRecords API rate | 10 TPS | Yes | Transactions per second per account | 
| SubmitRegistryRecordForApproval API rate | 10 TPS | Yes | Transactions per second per account | 
| UpdateRegistryRecordStatus API rate | 10 TPS | Yes | Transactions per second per account | 
| SearchDiscoverableRegistryRecords API rate | 10 TPS | Yes | Transactions per second per account | 
| ListDiscoverableRegistryRecords API rate | 10 TPS | Yes | Transactions per second per account | 
| BatchGetDiscoverableRegistryRecord API rate | 10 TPS | Yes | Transactions per second per account | 