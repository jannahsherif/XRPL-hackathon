

# Add policies to the Policy Engine
<a name="add-policies-to-engine"></a>

You can create one or more policies in your policy engine to control how agents interact with your enterprise tools and data through Amazon Bedrock AgentCore Gateway.

**Note**  
Use the policy engine ID from the previous step. The validation mode controls how findings are handled. Schema checks always run regardless of the validation mode. `FAIL_ON_ANY_FINDINGS` runs both schema checks and semantic validation, rejecting the policy if either produces findings. `IGNORE_ALL_FINDINGS` runs only schema checks, and policies are accepted as long as they pass. For more information about validation and the types of findings, see [Validate and test policies](policy-validate-policies.md).

**Note**  
If the new policy is a temporal policy, adding it invalidates the engine’s active temporal policy sessions. In-flight sessions return an HTTP 409 `ConflictException` and must be restarted. For more information, see [Session invalidation](policy-temporal.md#policy-temporal-session-invalidation).

Select one of the following methods:

**Example**  

1. Run the following code in a terminal to create a policy using the AWS CLI:

   ```
   aws bedrock-agentcore-control create-policy \
     --policy-engine-id my-policy-engine-id \
     --name my_policy \
     --validation-mode FAIL_ON_ANY_FINDINGS \
     --description "My Policy" \
     --definition '{
       "cedar": {
         "statement": "my-cedar-policy-statement"
       }
     }'
   ```

1. The following Python code shows how to create a policy using the AWS Python SDK (Boto3):

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   response = client.create_policy(
       policyEngineId='my-policy-engine-id',
       name='my_policy',
       validationMode='FAIL_ON_ANY_FINDINGS',
       description='My Policy',
       definition={
           'cedar': {
               'statement': 'my-cedar-policy-statement'
           }
       }
   )
   print(f"Policy ID: {response['policyId']}")
   ```