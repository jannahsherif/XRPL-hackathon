

# Policy create and update: per-policy engine validation
<a name="policy-create-update-validation"></a>

When creating or updating policies directly (not through generation), validation and analysis takes into account the new policy as well as its interactions with **all preexisting policies** in the policy engine.

## How it works
<a name="policy-create-update-validation-how"></a>

1. The policy is checked against the Cedar schema for **all gateways** associated with the policy engine. Schema checks always run regardless of the validation mode.

1. If the validation mode is set to `FAIL_ON_ANY_FINDINGS`, semantic validation runs in the context of the **entire policy engine**, checking for overly permissive, overly restrictive, and ineffective policies. If either schema checks or semantic validation produces findings, the policy is rejected. For details on each check, see [Validation and analysis overview](policy-validation-overview.md).

**Note**  
With `IGNORE_ALL_FINDINGS`, only schema checks run. Policies are accepted as long as they pass the schema checks. For more information, see [Add policies to the Policy Engine](add-policies-to-engine.md).

## Example: Create a policy with validation
<a name="policy-create-validation-example"></a>

Create a policy with strict validation that rejects policies with any findings:

**Example**  

1. This example assumes an AgentCore project with a policy engine named `MyEngine` attached to a deployed gateway named `my-gateway`, for example from `agentcore add policy-engine --name MyEngine --attach-to-gateways my-gateway` followed by `agentcore deploy`. Save the statement to a file, for example `restrict_refunds.cedar`, and use that gateway’s ARN from `agentcore status --json` in it:

   ```
   forbid (
     principal,
     action == AgentCore::Action::"RefundTool___process_refund",
     resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/my-gateway-a1b2c3d4e5"
   )
   when {
     context.input.amount > 1000
   };
   ```

1. Add the policy and deploy:

   ```
   agentcore add policy --name RestrictRefunds \
     --engine MyEngine \
     --source restrict_refunds.cedar \
     --validation-mode FAIL_ON_ANY_FINDINGS
   
   agentcore deploy
   ```

1. Run the following code in a terminal to create the policy using the AWS CLI:

   ```
   aws bedrock-agentcore-control create-policy \
     --policy-engine-id MyEngine-abc123defg \
     --name RestrictRefunds \
     --validation-mode FAIL_ON_ANY_FINDINGS \
     --definition '{
       "policy": {
         "statement": "forbid (principal, action == AgentCore::Action::\"RefundTool___process_refund\", resource == AgentCore::Gateway::\"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/my-gateway-a1b2c3d4e5\") when { context.input.amount > 1000 };"
       }
     }'
   ```

1. Run the following code to create the policy using the AWS SDK for Python:

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   GATEWAY_ARN = (
       'arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/my-gateway-a1b2c3d4e5'
   )
   
   statement = (
       'forbid (principal, '
       'action == AgentCore::Action::"RefundTool___process_refund", '
       f'resource == AgentCore::Gateway::"{GATEWAY_ARN}") '
       'when { context.input.amount > 1000 };'
   )
   
   response = client.create_policy(
       policyEngineId='MyEngine-abc123defg',
       name='RestrictRefunds',
       validationMode='FAIL_ON_ANY_FINDINGS',
       definition={'policy': {'statement': statement}},
   )
   print(response['policyId'], response['status'])
   ```

The response indicates the policy is being created:

```
{
  "policyId": "RestrictRefunds-ghi789jklm",
  "status": "CREATING"
}
```

Check the policy status to confirm validation passed:

**Example**  

1. Show the deployed state of the resources in the project:

   ```
   agentcore status
   ```

   To inspect a single policy’s status and findings, use the AWS CLI or an SDK.

1. Run the following code in a terminal to get the policy using the AWS CLI:

   ```
   aws bedrock-agentcore-control get-policy \
     --policy-engine-id MyEngine-abc123defg \
     --policy-id RestrictRefunds-ghi789jklm
   ```

1. Run the following code to wait for the policy to become active using the AWS SDK for Python:

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   client.get_waiter('policy_active').wait(
       policyEngineId='MyEngine-abc123defg',
       policyId='RestrictRefunds-ghi789jklm',
   )
   
   policy = client.get_policy(
       policyEngineId='MyEngine-abc123defg',
       policyId='RestrictRefunds-ghi789jklm',
   )
   print(policy['status'], policy.get('statusReasons'))
   ```

When validation passes, the policy becomes active:

```
{
  "policyId": "RestrictRefunds-ghi789jklm",
  "status": "ACTIVE",
  "statusReasons": []
}
```

## Example: Validation failure
<a name="policy-validation-failure-example"></a>

If a policy references an action that doesn’t exist in any associated gateway’s schema, validation fails. Note that this failure is **asynchronous**: the create call returns HTTP 202 with `CREATING`, and the policy then settles into `CREATE_FAILED`.

**Example**  

1. A policy that fails validation fails the whole deploy, not just that resource:

   ```
   agentcore add policy --name InvalidPolicy \
     --engine MyEngine \
     --statement 'permit (principal, action == AgentCore::Action::"RefundTool___nonExistentTool", resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/my-gateway-a1b2c3d4e5");'
   
   agentcore deploy
   ```

   The deploy reports the underlying `CREATE_FAILED` reason. Remove the bad policy with `agentcore remove policy --engine MyEngine --name InvalidPolicy` and deploy again.

1. Run the following code in a terminal to create a policy that references an undefined action:

   ```
   aws bedrock-agentcore-control create-policy \
     --policy-engine-id MyEngine-abc123defg \
     --name InvalidPolicy \
     --validation-mode FAIL_ON_ANY_FINDINGS \
     --definition '{
       "policy": {
         "statement": "permit (principal, action == AgentCore::Action::\"RefundTool___nonExistentTool\", resource == AgentCore::Gateway::\"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/my-gateway-a1b2c3d4e5\");"
       }
     }'
   ```

1. Check the status to see the validation failure:

   ```
   aws bedrock-agentcore-control get-policy \
     --policy-engine-id MyEngine-abc123defg \
     --policy-id InvalidPolicy-jkl012mnop
   ```

1. Run the following code to create the policy and read the failure reason using the AWS SDK for Python:

   ```
   import time
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   GATEWAY_ARN = (
       'arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/my-gateway-a1b2c3d4e5'
   )
   
   response = client.create_policy(
       policyEngineId='MyEngine-abc123defg',
       name='InvalidPolicy',
       validationMode='FAIL_ON_ANY_FINDINGS',
       definition={'policy': {'statement': (
           'permit (principal, '
           'action == AgentCore::Action::"RefundTool___nonExistentTool", '
           f'resource == AgentCore::Gateway::"{GATEWAY_ARN}");'
       )}},
   )
   
   # The 202 above is not success - poll for the terminal status
   while True:
       policy = client.get_policy(
           policyEngineId='MyEngine-abc123defg',
           policyId=response['policyId'],
       )
       if policy['status'] != 'CREATING':
           break
       time.sleep(4)
   
   print(policy['status'], policy.get('statusReasons'))
   ```

When you check the policy status, the response shows the validation failure:

```
{
  "policyId": "InvalidPolicy-jkl012mnop",
  "status": "CREATE_FAILED",
  "statusReasons": [
    "Validation failed: Action 'nonExistentTool' is not defined in the schema for any associated gateway"
  ]
}
```