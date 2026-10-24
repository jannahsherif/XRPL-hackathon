

# Create a policy engine
<a name="policy-create-engine"></a>

A policy engine is a collection of policies that evaluates and authorizes agent tool calls. When associated with a gateway, the policy engine intercepts all agent requests and determines whether to allow or deny each action based on the defined policies.

**Topics**
+ [Prerequisites](#policy-engine-prerequisites)
+ [Create a policy engine](#create-policy-engine-methods)
+ [Identifiers you need afterwards](#policy-engine-arn-usage)

## Prerequisites
<a name="policy-engine-prerequisites"></a>

Before creating a policy engine, set up a gateway. For more information, see [Set up an Amazon Bedrock AgentCore gateway](gateway-building.md).

## Create a policy engine
<a name="create-policy-engine-methods"></a>

The following shows how to create a policy engine.

A policy engine name must match `[A-Za-z][A-Za-z0-9_]*` and be at most 48 characters: it starts with a letter, and after that only letters, digits, and underscores are allowed. **Hyphens are not valid in a name**. Use `my_policy_engine`, not `my-policy-engine`. The same rule applies to policy names. With the AgentCore CLI, the deployed engine name is `<project>_<target>_<name>`, and that full name must be at most 48 characters.

**Example**  

1. In an AgentCore project, add a policy engine to the project configuration:

   ```
   agentcore add policy-engine \
     --name my_policy_engine \
     --description "My Policy Engine" \
     --attach-to-gateways my-gateway \
     --attach-mode log-only
   ```

1. Deploy the project to create it in your account:

   ```
   agentcore deploy
   ```

    `agentcore add` only records the engine in `agentcore/agentcore.json`. `agentcore deploy` creates it. The deploy output includes the engine ID and ARN. `--attach-to-gateways` and `--attach-mode` attach the engine to a gateway in the same step. Start with `log-only` so that an engine with no policies does not deny live traffic. To encrypt the engine with your own KMS key, add `--encryption-key-arn`. For more information, see [Customize your policy engine’s encryption](policy-encryption.md).

1. Run the following code in a terminal to create a policy engine using the AWS CLI:

   ```
   aws bedrock-agentcore-control create-policy-engine \
     --name my_policy_engine \
     --description "My Policy Engine"
   ```

   The response contains both `policyEngineId` and `policyEngineArn`. Keep both. They are used in different places, as described in [Identifiers you need afterwards](#policy-engine-arn-usage).

1. The following Python code shows how to create a policy engine using the AWS Python SDK (Boto3):

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   response = client.create_policy_engine(
       name='my_policy_engine',
       description='My Policy Engine'
   )
   
   print(f"Policy Engine ID: {response['policyEngineId']}")
   print(f"Policy Engine ARN: {response['policyEngineArn']}")
   ```

## Identifiers you need afterwards
<a name="policy-engine-arn-usage"></a>

Creating an engine returns two identifiers, and they are not interchangeable:

 `policyEngineId`   
Used by every policy operation: `CreatePolicy`, `ListPolicies`, `UpdatePolicy`, and `DeletePolicy`. It looks like `my_policy_engine-a1b2c3d4e5`: the engine name, plus a generated ten-character suffix. Passing an ARN where an ID is expected is rejected as a validation error. The `--engine` option of `agentcore add policy` and `agentcore remove policy` takes the engine name from the project instead. An engine that the AgentCore CLI deploys is named `<project>_<target>_<name>`.

 `policyEngineArn`   
Used to attach the engine to a gateway, as `policyEngineConfiguration.arn` on `CreateGateway` or `UpdateGateway`, alongside a `mode` of `LOG_ONLY` or `ENFORCE`. The AgentCore CLI resolves this for you when you pass `--attach-to-gateways`.

For more information about creating policies, see [Create a policy](policy-create-policies.md). For attaching an engine and switching modes, see [Policy enforcement modes](policy-enforcement-modes.md).