

# Manage Policies and Policy Engines
<a name="manage-policies-engines"></a>

Use these operations to manage your Policy Engines and policies.

The AWS CLI and the AWS SDKs can act on any policy engine in your account. The AgentCore CLI is scoped to a single AgentCore project: it can delete the engines and policies that project manages, and `agentcore status` shows their deployed state, but it has no equivalent for reading or updating a resource it did not create. Use the AWS CLI or an SDK for those.

**Topics**
+ [List Policy Engines](#list-policy-engines)
+ [List summaries without decrypting](#list-summaries)
+ [Get Policy Engine](#get-policy-engine)
+ [List policies in a Policy Engine](#list-policies-in-engine)
+ [Get Policy](#get-policy)
+ [Update existing policies](#update-existing-policies)
+ [Delete policies](#delete-policies)
+ [Delete Policy Engine](#delete-policy-engine)

## List Policy Engines
<a name="list-policy-engines"></a>

View all Policy Engines in your account.

Select one of the following methods:

**Example**  

1. 

   ```
   aws bedrock-agentcore-control list-policy-engines
   ```

1. 

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   response = client.list_policy_engines()
   for engine in response['policyEngines']:
       print(f"Policy Engine: {engine['name']} (ID: {engine['policyEngineId']})")
       print(f"Status: {engine['status']}")
       print(f"Created: {engine['createdAt']}")
       print(f"ARN: {engine['policyEngineArn']}")
   ```

## List summaries without decrypting
<a name="list-summaries"></a>

Alongside `ListPolicyEngines` and `ListPolicies`, the service offers summaries that return identifiers, names, and status but omit the encrypted content. A policy engine’s summary carries no description, and a policy’s summary carries no `definition`.

```
aws bedrock-agentcore-control list-policy-engine-summaries

aws bedrock-agentcore-control list-policy-summaries \
  --policy-engine-id my_policy_engine-a1b2c3d4e5
```

Use them when you need an inventory rather than the statements themselves. You can also use them to enumerate what exists while a customer managed key is unusable. The full list and get operations verify the key and decrypt before returning, so they fail while the key is disabled, deleted, or has its grant revoked. The summaries do neither. For more information, see [Key unavailable: you cannot list or read your policies](policy-encryption.md#policy-encryption-error-key-unavailable).

## Get Policy Engine
<a name="get-policy-engine"></a>

Retrieve detailed information about a specific Policy Engine:

**Example**  

1. 

   ```
   aws bedrock-agentcore-control get-policy-engine --policy-engine-id my_policy_engine-a1b2c3d4e5
   ```

1. 

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   response = client.get_policy_engine(
       policyEngineId='my_policy_engine-a1b2c3d4e5'
   )
   
   print(f"Policy Engine: {response['name']}")
   print(f"ID: {response['policyEngineId']}")
   print(f"ARN: {response['policyEngineArn']}")
   print(f"Status: {response['status']}")
   print(f"Created: {response['createdAt']}")
   print(f"Updated: {response['updatedAt']}")
   ```

## List policies in a Policy Engine
<a name="list-policies-in-engine"></a>

View all policies within a specific Policy Engine:

**Example**  

1. 

   ```
   aws bedrock-agentcore-control list-policies --policy-engine-id my_policy_engine-a1b2c3d4e5
   ```

1. 

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   response = client.list_policies(
       policyEngineId='my_policy_engine-a1b2c3d4e5'
   )
   
   for policy in response['policies']:
       print(f"Policy: {policy['name']} (ID: {policy['policyId']})")
       print(f"Status: {policy['status']}")
       print(f"Description: {policy.get('description', 'No description')}")
       print(f"Created: {policy['createdAt']}")
   ```

## Get Policy
<a name="get-policy"></a>

Retrieve detailed information about a specific policy:

**Example**  

1. 

   ```
   aws bedrock-agentcore-control get-policy --policy-engine-id my_policy_engine-a1b2c3d4e5 --policy-id my_policy-a1b2c3d4e5
   ```

1. 

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   response = client.get_policy(
       policyId='my_policy-a1b2c3d4e5',
       policyEngineId='my_policy_engine-a1b2c3d4e5'
   )
   
   print(f"Policy: {response['name']}")
   print(f"ID: {response['policyId']}")
   print(f"ARN: {response['policyArn']}")
   print(f"Status: {response['status']}")
   print(f"Created: {response['createdAt']}")
   print(f"Updated: {response['updatedAt']}")
   print(f"Cedar Statement: {response['definition']['policy']['statement']}")
   ```

## Update existing policies
<a name="update-existing-policies"></a>

 `UpdatePolicy` is an in-place replacement, so send the complete statement you want.

Validation happens in two phases. A malformed statement is rejected on the call with a `ValidationException`. An unconstrained `resource` is one cause: constrain it either to a specific gateway with `resource ==`, or to the type with `resource is AgentCore::Gateway`. A statement that parses but does not type-check returns HTTP 202 and settles into `UPDATE_FAILED`, so wait for `ACTIVE` rather than treating the response as success.

**Note**  
If the updated policy is a temporal policy, or the update adds or removes temporal expressions, updating it invalidates the engine’s active temporal policy sessions. In-flight sessions return an HTTP 409 `ConflictException` and must be restarted. For more information, see [Session invalidation](policy-temporal.md#policy-temporal-session-invalidation).

**Example**  

1. 

   ```
   aws bedrock-agentcore-control update-policy \
     --policy-id my_policy-a1b2c3d4e5 \
     --policy-engine-id my_policy_engine-a1b2c3d4e5 \
     --definition '{
       "policy": {
         "statement": "permit (principal, action == AgentCore::Action::\"RefundTool___process_refund\", resource == AgentCore::Gateway::\"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/my-gateway-a1b2c3d4e5\");"
       }
     }'
   ```

1. 

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   client.update_policy(
       policyId='my_policy-a1b2c3d4e5',
       policyEngineId='my_policy_engine-a1b2c3d4e5',
       definition={
           'policy': {
               'statement': (
                   'permit (principal, '
                   'action == AgentCore::Action::"RefundTool___process_refund", '
                   'resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/my-gateway-a1b2c3d4e5");'
               )
           }
       }
   )
   
   waiter = client.get_waiter('policy_active')
   waiter.wait(policyEngineId='my_policy_engine-a1b2c3d4e5', policyId='my_policy-a1b2c3d4e5')
   ```

## Delete policies
<a name="delete-policies"></a>

Delete a policy from the Policy Engine.

**Example**  

1. For a policy your AgentCore project manages, remove it from the project and deploy:

   ```
   agentcore remove policy --name my_policy --engine my_policy_engine --yes
   agentcore deploy --yes
   ```

    `agentcore remove` only edits the project configuration; the policy is deleted from your account on the next `agentcore deploy`.

1. 

   ```
   aws bedrock-agentcore-control delete-policy --policy-engine-id my_policy_engine-a1b2c3d4e5 --policy-id my_policy-a1b2c3d4e5
   ```

1. 

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   client.delete_policy(policyId='my_policy-a1b2c3d4e5', policyEngineId='my_policy_engine-a1b2c3d4e5')
   waiter = client.get_waiter('policy_deleted')
   waiter.wait(policyEngineId='my_policy_engine-a1b2c3d4e5', policyId='my_policy-a1b2c3d4e5')
   ```

## Delete Policy Engine
<a name="delete-policy-engine"></a>

Delete an entire Policy Engine and all its policies.

**Note**  
You cannot delete a policy engine that is currently attached to a gateway. Detach it first by updating the gateway configuration; see [Update existing gateway with Policy Engine](update-gateway-with-policy.md).
You cannot delete a policy engine that still has policies in it. Delete every policy first, then delete the engine.

**Example**  

1. For an engine your AgentCore project manages, remove it from the project and deploy:

   ```
   agentcore remove policy-engine --name my_policy_engine --yes
   agentcore deploy --yes
   ```

   Removing a gateway does not remove the policy engine attached to it; remove the engine separately.

1. 

   ```
   aws bedrock-agentcore-control delete-policy-engine --policy-engine-id my_policy_engine-a1b2c3d4e5
   ```

1. 

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   client.delete_policy_engine(policyEngineId='my_policy_engine-a1b2c3d4e5')
   ```