

# AgentCore harness versioning and endpoints
<a name="harness-versioning"></a>

Amazon Bedrock AgentCore implements automatic versioning for AgentCore harnesses and lets you manage different configurations using endpoints. Harness versioning works the same way as [AgentCore Runtime versioning](agent-runtime-versioning.md) - harness is a managed abstraction over Runtime - but you manage it through the harness control plane APIs.

Each harness in Amazon Bedrock AgentCore is automatically versioned:
+ When you create a harness, AgentCore automatically creates version 1 (V1)
+ Each update to the harness creates a new version with a complete, self-contained configuration
+ Versions are immutable once created
+ Each version contains all the configuration needed for execution: model, system prompt, tools, memory, limits, and environment

## How endpoints reference versions
<a name="harness-endpoint-versioning"></a>

Endpoints provide a way to reference specific versions of your harness:
+ The `DEFAULT` endpoint automatically points to the latest version of your harness
+ Endpoints can point to specific versions, allowing you to maintain different environments (e.g., development, staging, production)
+ When you update a harness, the `DEFAULT` endpoint is automatically updated to point to the new version
+ Endpoints must be explicitly updated to point to new versions

 **Example Updating an endpoint to a new version** 

**Example**  

```
import boto3

control_client = boto3.client('bedrock-agentcore-control', region_name='us-west-2')

response = control_client.update_harness_endpoint(
    harnessId='MyHarness-UuFdkQoXSL',
    endpointName='production-endpoint',
    targetVersion='2',
    description='Updated production endpoint'
)

print(response)
```
Or with the AWS CLI:  

```
aws bedrock-agentcore-control update-harness-endpoint \
  --harness-id "MyHarness-UuFdkQoXSL" \
  --endpoint-name "production-endpoint" \
  --target-version "2" \
  --description "Updated production endpoint"
```

```
agentcore harness endpoint update \
  --id MyHarness-UuFdkQoXSL \
  --qualifier production-endpoint \
  --target-version 2
```
Use `--qualifier` for the existing endpoint’s name. To invoke that endpoint, pass `--qualifier production-endpoint` to `agentcore harness invoke --id MyHarness-UuFdkQoXSL`.

## Versioning scenarios
<a name="harness-versioning-scenarios"></a>

The following table illustrates how versioning and endpoints interact during the lifecycle of a harness:


| Change Type | Version Creation Behavior | Latest Version | Endpoint Behavior | 
| --- | --- | --- | --- | 
| Initial Creation | Creates Version 1 (V1) automatically | V1 | DEFAULT points to V1 | 
| Model Change | Creates a new version with the updated model selection | V2 | DEFAULT automatically updates to V2 | 
| Create "PROD" endpoint with V2 | No new version created | V2 | PROD endpoint points to V2 | 
| Tool or Skill Update | Creates a new version with the updated tool configuration | V3 | DEFAULT updates to V3, PROD remains on V2 | 
| Update "PROD" to V3 | No new version created | V3 | PROD updates to V3 | 
| Limits or Environment Modification | Creates a new version with updated execution parameters | V4 | DEFAULT updates to V4, PROD remains on V3 | 

## Endpoint lifecycle states
<a name="harness-endpoint-lifecycle"></a>

Harness endpoints go through various states during their lifecycle:

CREATING  
Initial state when an endpoint is being created

CREATE\_FAILED  
Indicates creation failure due to permissions, configuration, or other issues

READY  
Endpoint is ready to accept requests

UPDATING  
Endpoint is being updated to a new version

UPDATE\_FAILED  
Indicates update operation failure

## Creating an endpoint
<a name="harness-creating-endpoints"></a>

Create a named endpoint to pin an environment to a specific harness version. If you omit `targetVersion`, the endpoint points to the latest version at creation time.

**Example**  

```
import boto3

control_client = boto3.client('bedrock-agentcore-control', region_name='us-west-2')

response = control_client.create_harness_endpoint(
    harnessId='MyHarness-UuFdkQoXSL',
    endpointName='production-endpoint',
    targetVersion='2',
    description='Production endpoint pinned to V2'
)

print(response)
```
Or with the AWS CLI:  

```
aws bedrock-agentcore-control create-harness-endpoint \
  --harness-id "MyHarness-UuFdkQoXSL" \
  --endpoint-name "production-endpoint" \
  --target-version "2" \
  --description "Production endpoint pinned to V2"
```

```
agentcore harness endpoint create \
  --id MyHarness-UuFdkQoXSL \
  --name production-endpoint \
  --target-version 2
```
Creation uses `--name`; the commands for an existing endpoint use `--qualifier`. If you omit `--target-version`, the new endpoint points to the latest version at creation time.

## Listing harness versions and endpoints
<a name="harness-listing-versions"></a>

You can list all versions of a harness by calling the `ListHarnessVersions` operation. To list the endpoints for a harness, call `ListHarnessEndpoints`.

**Example**  

```
import boto3

control_client = boto3.client('bedrock-agentcore-control', region_name='us-west-2')

# List all versions of a harness
versions = control_client.list_harness_versions(
    harnessId='MyHarness-UuFdkQoXSL'
)
for version in versions['harnessVersions']:
    print(version)

# List all endpoints for a harness
endpoints = control_client.list_harness_endpoints(
    harnessId='MyHarness-UuFdkQoXSL'
)
for endpoint in endpoints['endpoints']:
    print(endpoint)
```
Or with the AWS CLI:  

```
aws bedrock-agentcore-control list-harness-versions \
  --harness-id "MyHarness-UuFdkQoXSL"

aws bedrock-agentcore-control list-harness-endpoints \
  --harness-id "MyHarness-UuFdkQoXSL"
```
Both operations support pagination through `maxResults` and `nextToken`. To retrieve the configuration of a single endpoint, call `GetHarnessEndpoint`; to remove one, call `DeleteHarnessEndpoint`.
These resource commands work without an AgentCore project:  

```
agentcore harness version list --id MyHarness-UuFdkQoXSL
agentcore harness endpoint list --id MyHarness-UuFdkQoXSL

# Retrieve a version's configuration
agentcore harness version get --id MyHarness-UuFdkQoXSL --version 2

# Retrieve an endpoint's configuration
agentcore harness endpoint get \
  --id MyHarness-UuFdkQoXSL \
  --qualifier production-endpoint
```
The list commands accept `--max-results` and `--next-token` for pagination. To remove a named endpoint:  

```
agentcore harness endpoint delete \
  --id MyHarness-UuFdkQoXSL \
  --qualifier production-endpoint
```

## Related topics
<a name="_related_topics"></a>
+  [Get started](harness-get-started.md) - create and invoke your first harness
+  [Models and instructions](harness-models.md) - configure agents, models, and providers
+  [Observability and cost controls](harness-operations.md) - observability, cost controls, and tags
+  [AgentCore Runtime versioning and endpoints](agent-runtime-versioning.md) - versioning and endpoints for AgentCore Runtime