

# Getting started with guardrails
<a name="policy-guardrails-getting-started"></a>

Guardrails let you add content filtering to your agent’s gateway. When a guardrail detects content your policy forbids, such as violent content, the gateway blocks the request before it reaches your agent.

This guide walks through setting up a policy with a guardrail that blocks violent content on an HTTP gateway with a runtime target. The AgentCore CLI drives the whole flow in one project, so the following steps lead with it. Each step that maps to a control-plane API also shows the equivalent AWS CLI and boto3 code. For reference details on the guardrail types, categories, effects, and thresholds, see [Guardrails in policies](policy-guardrails-in-policies.md).

**Topics**
+ [Prerequisites](#policy-guardrails-getting-started-prerequisites)
+ [Step 1: Create a project](#policy-guardrails-getting-started-create)
+ [Step 2: Add a policy engine and gateway](#policy-guardrails-getting-started-wire)
+ [Step 3: Deploy infrastructure first](#policy-guardrails-getting-started-deploy-infra)
+ [Step 4: Add the Runtime target with a schema](#policy-guardrails-getting-started-target)
+ [Step 5: Add the guardrail policy](#policy-guardrails-getting-started-add-policy)
+ [Step 6: Deploy the policies](#policy-guardrails-getting-started-deploy-policy)
+ [Step 7: Invoke through the gateway](#policy-guardrails-getting-started-invoke)
+ [Available guardrail categories](#policy-guardrails-getting-started-categories)
+ [Policy effects](#policy-guardrails-getting-started-effects)
+ [Step 8: Clean up](#policy-guardrails-getting-started-cleanup)

## Prerequisites
<a name="policy-guardrails-getting-started-prerequisites"></a>

Before starting, make sure you have the following:
+  ** AWS credentials** configured.
+  **An Amazon S3 bucket** where you can upload the runtime target’s OpenAPI schema.

During deployment, the AgentCore CLI checks the AWS CDK bootstrap stack. The CLI tells you if a bootstrap action is required.

Install the AgentCore CLI:

```
npm install -g @aws/agentcore
```

Verify the installation:

```
agentcore --version
```

## Step 1: Create a project
<a name="policy-guardrails-getting-started-create"></a>

```
agentcore create --name MyAgent --template empty
cd MyAgent
agentcore add runtime --name MyAgent --language python --protocol HTTP
cd app/MyAgent
uv init --bare
uv add \
  "aws-opentelemetry-distro~=0.21.0" \
  "bedrock-agentcore[strands-agents]>=1.18.1,<2" \
  "botocore[crt]~=1.43.0" \
  "strands-agents>=1.15,<2"
cd ../..
```

Create `app/MyAgent/main.py` with a simple HTTP Runtime entrypoint:

```
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from strands import Agent

app = BedrockAgentCoreApp()
agent = Agent()


@app.entrypoint
def invoke(payload):
    return {"response": str(agent(payload.get("prompt", "Hello")))}


if __name__ == "__main__":
    app.run()
```

## Step 2: Add a policy engine and gateway
<a name="policy-guardrails-getting-started-wire"></a>

**Example**  

1. 

   ```
   # Policy engine
   agentcore add policy-engine --name MyPolicyEngine
   
   # Gateway (protocol None = HTTP, with policy engine in ENFORCE mode)
   agentcore add gateway --name MyGateway \
     --authorizer-type AWS_IAM \
     --policy-engine-name MyPolicyEngine \
     --policy-engine-mode enforce
   ```

1. Create the policy engine:

   ```
   aws bedrock-agentcore-control create-policy-engine --name MyPolicyEngine
   ```

1. Create the gateway with the engine attached in `ENFORCE` mode. The request takes the engine ARN returned earlier. For the full request, see [Create gateway with Policy Engine](create-gateway-with-policy.md).

1. Create the policy engine:

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   engine = client.create_policy_engine(name='MyPolicyEngine')
   client.get_waiter('policy_engine_active').wait(
       policyEngineId=engine['policyEngineId']
   )
   print(engine['policyEngineId'], engine['policyEngineArn'])
   ```

1. Pass `policyEngineConfiguration={'arn': engine['policyEngineArn'], 'mode': 'ENFORCE'}` to `create_gateway`. For more information, see [Create gateway with Policy Engine](create-gateway-with-policy.md).

Step 4 connects the gateway to the Runtime through a target that you create with the AWS CLI. The AgentCore CLI grants the gateway’s execution role permissions only for targets in the project, so grant the role access to the Runtime and to the target’s schema in `agentcore/cdk/lib/cdk-stack.ts`. Add the following after the line that creates the `AgentCoreApplication`, and replace `<BUCKET_NAME>` with the name of the bucket for the schema:

```
const gateway = this.application.gateway('MyGateway');
const runtime = this.application.runtime('MyAgent');
gateway.grant(
  ['bedrock-agentcore:InvokeAgentRuntime'],
  [runtime.runtimeArn, `${runtime.runtimeArn}/runtime-endpoint/*`],
);
gateway.grant(['s3:GetObject'], ['arn:aws:s3:::<BUCKET_NAME>/agent-schema.yaml']);
```

## Step 3: Deploy infrastructure first
<a name="policy-guardrails-getting-started-deploy-infra"></a>

```
agentcore deploy
```

The `agentcore deploy` command deploys the Runtime, gateway, and policy engine, and grants the gateway’s execution role access to the Runtime and the schema. Record the Runtime ARN and Gateway ARN from `agentcore status --json`. The Gateway ID is the last segment of the Gateway ARN.

## Step 4: Add the Runtime target with a schema
<a name="policy-guardrails-getting-started-target"></a>

An HTTP Runtime target must have an API schema before a policy can reference request fields such as `context.input.prompt`. Save the following schema as `agent-schema.yaml`:

```
openapi: 3.0.0
info:
  title: Agent invocation
  version: 1.0.0
paths:
  /invocations:
    post:
      operationId: invokeAgent
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - prompt
              properties:
                prompt:
                  type: string
      responses:
        "200":
          description: Successful invocation
```

Upload the schema to Amazon S3:

```
export SCHEMA_BUCKET="<BUCKET_NAME>"
export SCHEMA_S3_URI="s3://$SCHEMA_BUCKET/agent-schema.yaml"
aws s3 cp agent-schema.yaml "$SCHEMA_S3_URI"
```

Create the target with the AWS CLI so that it uses the schema. Set the identifiers from `agentcore status --json`, then create the target:

```
export GATEWAY_ID="<GATEWAY_ID>"
export RUNTIME_ARN="<RUNTIME_ARN>"

TARGET_ID=$(aws bedrock-agentcore-control create-gateway-target \
  --gateway-identifier "$GATEWAY_ID" \
  --name MyTarget \
  --target-configuration '{
    "http": {
      "agentcoreRuntime": {
        "arn": "'"$RUNTIME_ARN"'",
        "qualifier": "DEFAULT",
        "schema": {
          "source": {
            "s3": {
              "uri": "'"$SCHEMA_S3_URI"'"
            }
          }
        }
      }
    }
  }' \
  --credential-provider-configurations '[{"credentialProviderType":"GATEWAY_IAM_ROLE"}]' \
  --query targetId \
  --output text)

export TARGET_ID
agentcore gateway target get \
  --gateway-id "$GATEWAY_ID" \
  --target-id "$TARGET_ID"
```

Wait until the target status is `READY` before adding the policy. The target is not part of the project, and `agentcore deploy` does not manage it. Step 8 deletes it.

## Step 5: Add the guardrail policy
<a name="policy-guardrails-getting-started-add-policy"></a>

**Example**  

1. Create a Cedar statement for the guardrail:

   ```
   forbid (principal,
     action == AgentCore::Action::"MyTarget___POST:/invocations",
     resource == AgentCore::Gateway::"<gateway-arn>")
   when guardrails {
     BedrockGuardrails::ContentFilter(
       ["VIOLENCE"],
       [context.input.prompt]
     )["VIOLENCE"].confidenceScore.greaterThan(decimal("0.7"))
   };
   ```
Save the statement as `block_violence.cedar`, replacing `<gateway-arn>` with the gateway ARN from `agentcore status --json`. Then add it to the project:  

```
agentcore add policy --name BlockViolence \
  --engine MyPolicyEngine \
  --statement file://block_violence.cedar \
  --validation-mode ignore-all-findings \
  --enforcement-mode active
```
\+ This policy blocks requests when the violence confidence score is greater than `0.7`.    
 AWS CLI  

1. On this surface, you write the statement yourself and must name the deployed gateway’s ARN. AgentCore rejects a statement that names a specific action unless the resource is also a specific gateway. Take the ARN from `agentcore project status --json` or `get-gateway`:

   ```
   aws bedrock-agentcore-control create-policy \
     --policy-engine-id MyPolicyEngine-a1b2c3d4e5 \
     --name BlockViolence \
     --validation-mode IGNORE_ALL_FINDINGS \
     --enforcement-mode ACTIVE \
     --definition '{
       "policy": {
         "statement": "forbid (principal, action == AgentCore::Action::\"MyTarget___POST:/invocations\", resource == AgentCore::Gateway::\"<gateway-arn>\") when guardrails { BedrockGuardrails::ContentFilter([\"VIOLENCE\"], [context.input.prompt])[\"VIOLENCE\"].confidenceScore.greaterThan(decimal(\"0.7\")) };"
       }
     }'
   ```  
 AWS Python SDK (Boto3)  

1. Create the same policy using the AWS SDK for Python:

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   GATEWAY_ARN = '<gateway-arn>'  # from agentcore project status --json or get_gateway
   
   statement = (
       'forbid (principal, '
       'action == AgentCore::Action::"MyTarget___POST:/invocations", '
       f'resource == AgentCore::Gateway::"{GATEWAY_ARN}") '
       'when guardrails { BedrockGuardrails::ContentFilter('
       '["VIOLENCE"], [context.input.prompt])["VIOLENCE"]'
       '.confidenceScore.greaterThan(decimal("0.7")) };'
   )
   
   response = client.create_policy(
       policyEngineId='MyPolicyEngine-a1b2c3d4e5',
       name='BlockViolence',
       validationMode='IGNORE_ALL_FINDINGS',
       enforcementMode='ACTIVE',
       definition={'policy': {'statement': statement}},
   )
   # CreatePolicy returns 202 - wait for the terminal status
   client.get_waiter('policy_active').wait(
       policyEngineId='MyPolicyEngine-a1b2c3d4e5',
       policyId=response['policyId'],
   )
   print(response['policyId'])
   ```

This creates a policy that blocks requests with violent content.

### Step 5b: Add a permissive policy
<a name="policy-guardrails-getting-started-add-permissive"></a>

Because a policy engine in ENFORCE mode denies all actions unless explicitly permitted, add a permissive policy so benign requests can pass through and reach your agent:

**Example**  

1. 

   ```
   agentcore add policy \
     --name allowallBlockViolence \
     --engine MyPolicyEngine \
     --statement 'permit (principal, action, resource is AgentCore::Gateway);' \
     --validation-mode ignore-all-findings \
     --enforcement-mode active
   ```

1. 

   ```
   aws bedrock-agentcore-control create-policy \
     --policy-engine-id MyPolicyEngine-a1b2c3d4e5 \
     --name allowallBlockViolence \
     --validation-mode IGNORE_ALL_FINDINGS \
     --enforcement-mode ACTIVE \
     --definition '{
       "policy": {
         "statement": "permit (principal, action, resource is AgentCore::Gateway);"
       }
     }'
   ```

1. 

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   response = client.create_policy(
       policyEngineId='MyPolicyEngine-a1b2c3d4e5',
       name='allowallBlockViolence',
       validationMode='IGNORE_ALL_FINDINGS',
       enforcementMode='ACTIVE',
       definition={'policy': {'statement':
           'permit (principal, action, resource is AgentCore::Gateway);'}},
   )
   # CreatePolicy returns 202 - wait for the terminal status
   client.get_waiter('policy_active').wait(
       policyEngineId='MyPolicyEngine-a1b2c3d4e5',
       policyId=response['policyId'],
   )
   print(response['policyId'])
   ```

## Step 6: Deploy the policies
<a name="policy-guardrails-getting-started-deploy-policy"></a>

```
agentcore deploy
```

This step is specific to the AgentCore CLI: `agentcore add` only edits the project configuration, and `deploy` is what calls `CreatePolicy`. On the AWS CLI and boto3 the policies were already created in Step 4.

## Step 7: Invoke through the gateway
<a name="policy-guardrails-getting-started-invoke"></a>

```
# Tripping prompt - should be blocked
agentcore invoke --gateway MyGateway \
  --path /MyTarget/invocations \
  --method POST \
  --content-type application/json \
  --payload '{"prompt":"i will kill you"}'

# Benign control prompt - should succeed
agentcore invoke --gateway MyGateway \
  --path /MyTarget/invocations \
  --method POST \
  --content-type application/json \
  --payload '{"prompt":"hello"}'
```

Expected blocked result (`forbid` \+ `ACTIVE`):

```
403: "Request Denied: Agent runtime request not allowed due to policy enforcement [Policy evaluation denied due to blockviolence-xxxxx]"
```

## Available guardrail categories
<a name="policy-guardrails-getting-started-categories"></a>


| Category | Filters | Description | 
| --- | --- | --- | 
|  `contentFilter`  |  `VIOLENCE`, `HATE`, `SEXUAL`, `MISCONDUCT`, `INSULTS`  | Content safety filters | 
|  `promptAttack`  |  `JAILBREAK`, `PROMPT_INJECTION`, `PROMPT_LEAKAGE`  | Prompt security filters | 
|  `sensitiveInformation`  |  `ADDRESS`, `EMAIL`, `PHONE`, `CREDIT_DEBIT_CARD_NUMBER`, and [more](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-sensitive-filters.html)  | PII detection | 

## Policy effects
<a name="policy-guardrails-getting-started-effects"></a>


| Effect | Behavior | 
| --- | --- | 
|  `forbid`  | Block requests that exceed the confidence threshold | 
|  `permit`  | Allow only requests below the threshold | 
|  `suppressOutput`  | Block the model’s response (output phase) when it exceeds the threshold | 

## Step 8: Clean up
<a name="policy-guardrails-getting-started-cleanup"></a>

**Example**  

1. 

   ```
   aws bedrock-agentcore-control delete-gateway-target \
     --gateway-identifier "$GATEWAY_ID" \
     --target-id "$TARGET_ID"
   ```
Wait until `agentcore gateway target get` fails to find the target. Delete the lines that you added to `agentcore/cdk/lib/cdk-stack.ts` in Step 2, because they refer to the gateway and Runtime that the next commands remove. Then remove the project resources:  

```
agentcore remove all --yes
agentcore deploy --yes
```  
 AWS CLI  

1. Detach the engine from the gateway first. To construct the `update-gateway` request, see [Update existing gateway with Policy Engine](update-gateway-with-policy.md), and omit `policyEngineConfiguration`.

1. Delete the policies, then the engine. An engine that still contains policies cannot be deleted:

   ```
   aws bedrock-agentcore-control delete-policy \
     --policy-engine-id MyPolicyEngine-a1b2c3d4e5 --policy-id BlockViolence-a1b2c3d4e5
   aws bedrock-agentcore-control delete-policy \
     --policy-engine-id MyPolicyEngine-a1b2c3d4e5 --policy-id allowallBlockViolence-f6g7h8i9j0
   aws bedrock-agentcore-control delete-policy-engine \
     --policy-engine-id MyPolicyEngine-a1b2c3d4e5
   ```  
 AWS Python SDK (Boto3)  

1. 

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   ENGINE_ID = 'MyPolicyEngine-a1b2c3d4e5'
   GATEWAY_ID = 'MyGateway-a1b2c3d4e5'
   
   # 1. Detach the engine - an attached engine cannot be deleted.
   #    Resend the required gateway settings, but omit policyEngineConfiguration.
   gateway = client.get_gateway(gatewayIdentifier=GATEWAY_ID)
   update_request = {
       'gatewayIdentifier': GATEWAY_ID,
       'name': gateway['name'],
       'roleArn': gateway['roleArn'],
       'authorizerType': gateway['authorizerType'],
   }
   for field in ('protocolType', 'authorizerConfiguration'):
       if field in gateway:
           update_request[field] = gateway[field]
   client.update_gateway(**update_request)
   
   # 2. Delete every policy - an engine that still holds policies cannot be deleted.
   for policy in client.list_policy_summaries(
       policyEngineId=ENGINE_ID
   )['policySummaries']:
       client.delete_policy(policyEngineId=ENGINE_ID, policyId=policy['policyId'])
       client.get_waiter('policy_deleted').wait(
           policyEngineId=ENGINE_ID, policyId=policy['policyId']
       )
   
   # 3. Delete the engine
   client.delete_policy_engine(policyEngineId=ENGINE_ID)
   client.get_waiter('policy_engine_deleted').wait(policyEngineId=ENGINE_ID)
   ```

   Omitting `policyEngineConfiguration` from `update_gateway` detaches the engine, because the call replaces the gateway’s configuration rather than merging into it.