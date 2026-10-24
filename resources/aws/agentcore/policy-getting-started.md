

# Getting started with Policy in AgentCore
<a name="policy-getting-started"></a>

In this tutorial, you use the AgentCore CLI to set up Policy in AgentCore and attach it to an Amazon Bedrock AgentCore Gateway. You create a refund processing tool with Cedar policies that enforce business rules for refund amounts.

**Topics**
+ [Prerequisites](#policy-getting-started-prerequisites)
+ [Step 1: Setup and install](#policy-getting-started-setup)
+ [Step 2: Add a gateway with a policy engine](#policy-getting-started-create-script)
+ [Step 3: Deploy](#policy-getting-started-run-setup)
+ [Step 4: Add the policy and redeploy](#policy-getting-started-add-policy)
+ [Step 5: Test the policy](#policy-getting-started-test)
+ [What you’ve built](#policy-getting-started-results)
+ [Troubleshooting](#policy-getting-started-troubleshooting)
+ [Clean up](#policy-getting-started-cleanup)

## Prerequisites
<a name="policy-getting-started-prerequisites"></a>

Before starting, make sure you have the following:
+  ** AWS Account** with credentials configured. To configure credentials, you can install and use the AWS Command Line Interface by following the steps at [Getting started with the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html).
+  **Node.js 20\+** installed
+  **IAM permissions** for creating roles, Lambda functions, policy engines, and using Amazon Bedrock AgentCore
+  **A Lambda function** that processes refund requests. You can use an existing function or create one for this tutorial. Note the function ARN for use in Step 2.

During deployment, the AgentCore CLI checks the AWS CDK bootstrap stack. The CLI tells you if a bootstrap action is required.

## Step 1: Setup and install
<a name="policy-getting-started-setup"></a>

Install the AgentCore CLI:

```
npm install -g @aws/agentcore
```

Create an empty AgentCore project:

```
agentcore create --name PolicyDemo --template empty
cd PolicyDemo
```

The `cd` command moves into the project directory where subsequent commands must be run.

## Step 2: Add a gateway with a policy engine
<a name="policy-getting-started-create-script"></a>

Use the AgentCore CLI to add a gateway, a Lambda function target, and a policy engine to your project.

 **Add a gateway** 

Create a gateway with no inbound authorization for simplicity in this tutorial:

```
agentcore add gateway --name PolicyGateway --authorizer-type NONE
```

 **Add a Lambda function target with a refund tool** 

Register your Lambda function as a gateway target with a tool schema that defines a refund processing tool. Create a `refund_tools.json` file in your project directory with the following contents:

```
[
  {
    "name": "process_refund",
    "description": "Process a customer refund request for a given dollar amount",
    "inputSchema": {
      "type": "object",
      "description": "Input for processing a refund",
      "properties": {
        "amount": {
          "type": "integer",
          "description": "The refund amount in dollars"
        }
      },
      "required": ["amount"]
    }
  }
]
```

```
agentcore add gateway-target \
  --gateway PolicyGateway \
  --target-configuration '{
    "name": "RefundTarget",
    "targetType": "lambdaFunctionArn",
    "lambdaFunctionArn": {
      "lambdaArn": "<YOUR_LAMBDA_ARN>",
      "toolSchemaFile": "refund_tools.json"
    }
  }'
```

Replace `<YOUR_LAMBDA_ARN>` with the ARN of your Lambda function. The `refund_tools.json` file defines the tool schema for the refund tool.

 **Add a policy engine** 

Create a policy engine and attach it to the gateway in ENFORCE mode:

```
agentcore add policy-engine --name RefundPolicyEngine \
  --attach-to-gateways PolicyGateway \
  --attach-mode enforce
```

If your gateway isn’t part of an AgentCore project, see [Update existing gateway with Policy Engine](update-gateway-with-policy.md) and [Add policies to the Policy Engine](add-policies-to-engine.md) instead.

### Understanding the setup
<a name="policy-understanding-setup-script"></a>

The CLI commands in this tutorial configure several resources in your AgentCore project. Here’s a detailed explanation of each component.

**Topics**
+ [Create a Gateway](#policy-create-gateway)
+ [Add Lambda target](#policy-add-lambda-target)
+ [Create a Policy Engine](#policy-create-policy-engine)
+ [Create Cedar Policy](#policy-create-cedar-policy)
+ [Attach Policy to Gateway](#policy-attach-to-gateway)

#### Create a Gateway
<a name="policy-create-gateway"></a>

The `agentcore add gateway` command creates a gateway that acts as your MCP server endpoint. Setting `--authorizer-type NONE` disables inbound authorization for simplicity in this tutorial. In production, use IAM or JWT authorization to secure your gateway.

#### Add Lambda target
<a name="policy-add-lambda-target"></a>

The `agentcore add gateway-target` command registers a Lambda function as a target in the gateway. The tool schema file defines the inputs that agents can pass to the function, such as a refund amount.

#### Create a Policy Engine
<a name="policy-create-policy-engine"></a>

The `agentcore add policy-engine` command creates a policy engine, a collection of Cedar policies that evaluates and authorizes agent tool calls. The policy engine intercepts all requests at the gateway boundary and determines whether to allow or deny each action based on the defined policies. Authorization is deterministic and happens at the gateway, outside the agent’s code.

#### Create Cedar Policy
<a name="policy-create-cedar-policy"></a>

Cedar is an open-source policy language developed by AWS for writing authorization policies. The `agentcore add policy` command adds a Cedar policy to the project from an inline statement, a file, or standard input. Use `agentcore gateway policy generate` to generate a statement from natural language.

The following is an example Cedar policy that allows refunds under USD $1000:

```
permit(principal,
  action == AgentCore::Action::"RefundTarget___process_refund",
  resource == AgentCore::Gateway::"<gateway-arn>")
when {
  context.input.amount < 1000
};
```

The policy uses:
+  `permit` – Allows the action (Cedar also supports `forbid` to deny actions)
+  `principal` – The entity making the request
+  `action` – The specific tool being called (RefundTarget\_\_\_process\_refund)
+  `resource` – The gateway instance where the policy applies
+  `when` condition – Additional requirements (amount must be < USD $1000)

#### Attach Policy to Gateway
<a name="policy-attach-to-gateway"></a>

The `--attach-to-gateways` and `--attach-mode enforce` flags on `agentcore add policy-engine` attach the policy engine to the gateway in ENFORCE mode. In this mode:
+ Every tool call is intercepted and evaluated against all policies
+ By default, all actions are denied unless explicitly permitted
+ If any `forbid` policy matches, access is denied (forbid-wins semantics)
+ Policy decisions are logged to CloudWatch for monitoring and compliance

## Step 3: Deploy
<a name="policy-getting-started-run-setup"></a>

Deploy all resources to AWS:

```
agentcore deploy
```

The AgentCore CLI creates the gateway, registers the Lambda target, and provisions the policy engine. This takes approximately 2–3 minutes.

After deployment completes, you can verify the status of your resources:

```
agentcore status --json
```

## Step 4: Add the policy and redeploy
<a name="policy-getting-started-add-policy"></a>

A policy that names a specific action must also name a specific gateway ARN. The service rejects an unconstrained resource, so add the policy after the first deploy creates the gateway. Get the gateway ARN from the output of `agentcore status --json`.

You can write the Cedar statement yourself, or generate it from a description.

 **Write the policy** 

Create a `refund_policy.cedar` file in your project directory. Replace `<gateway-arn>` with the gateway ARN:

```
permit(principal,
  action == AgentCore::Action::"RefundTarget___process_refund",
  resource == AgentCore::Gateway::"<gateway-arn>")
when {
  context.input.amount < 1000
};
```

 **Generate the policy** 

Instead of writing the statement, you can generate it from a natural-language description. Policy generation calls an AWS API that uses the schema of the deployed gateway:

```
agentcore gateway policy generate \
  --gateway-id <gateway-arn> \
  --prompt "Only allow RefundTarget refunds under 1000 dollars" \
  > refund_policy.cedar
```

Review `refund_policy.cedar` before you add it. If the file has more than one statement, save each statement in its own file and add each one as a separate policy.

 **Add the policy** 

Add the policy to the project and deploy again:

```
agentcore add policy --name RefundLimit \
  --engine RefundPolicyEngine \
  --statement file://refund_policy.cedar
agentcore deploy
```

## Step 5: Test the policy
<a name="policy-getting-started-test"></a>

Test the policy by sending requests to the gateway with `agentcore invoke --gateway`. Because the gateway uses `--authorizer-type NONE` , you don’t need a bearer token.

 **Test 1: Refund USD $500 (should be allowed)** 

The refund amount of USD $500 is under the USD $1000 limit, so the policy engine permits the request:

```
agentcore invoke --gateway PolicyGateway \
  --path /mcp \
  --payload '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"RefundTarget___process_refund","arguments":{"amount":500}}}'
```

 **Test 2: Refund USD $2000 (should be denied)** 

The refund amount of USD $2000 exceeds the USD $1000 limit, so the policy engine denies the request:

```
agentcore invoke --gateway PolicyGateway \
  --path /mcp \
  --payload '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"RefundTarget___process_refund","arguments":{"amount":2000}}}'
```

## What you’ve built
<a name="policy-getting-started-results"></a>

Through this tutorial, you’ve created:
+  **MCP Server (Gateway)** – A managed endpoint for tools
+  **Lambda target** – A refund processing tool registered in the gateway
+  **Policy engine** – Cedar-based policy evaluation system
+  **Cedar policy** – Governance rule allowing refunds under USD $1000

## Troubleshooting
<a name="policy-getting-started-troubleshooting"></a>

If you encounter issues during setup or testing, refer to the following common problems and solutions:


| Issue | Solution | 
| --- | --- | 
| "AccessDeniedException" | Check IAM permissions for bedrock-agentcore:\* | 
| Gateway not responding | Wait 30–60 seconds after deployment for DNS propagation | 
| Deploy fails | Run `agentcore status --json` to check resource states and review error messages | 
| Policy not enforced | Verify that `policyEngineConfiguration.mode` for the gateway in `agentcore.json` is `ENFORCE`, then run `agentcore deploy`. To check the deployed gateway, run `agentcore gateway get --id <gateway-id>` and confirm that `policyEngineConfiguration.mode` is `ENFORCE`. The gateway ID is the last segment of the gateway ARN from `agentcore status --json`. | 
| Cedar validation error during deploy | Cedar policies must name a specific resource ARN. The service rejects wildcard resources, such as `permit(principal, action, resource);`. Use the gateway ARN from `agentcore status --json` in your Cedar policy’s `resource` field. | 
| Tool call denied unexpectedly | The policy engine is enforcing and the Cedar policy denied the request. Verify that the policy’s `action` and `resource` fields match the tool call being made. | 
| Deploy fails with policy validation error | The default validation mode `FAIL_ON_ANY_FINDINGS` runs both schema checks and semantic validation, rejecting the policy if either produces findings. You can pass `--validation-mode ignore-all-findings` to `agentcore add policy` to run only schema checks if you don’t need semantic validation. For production, fix the Cedar policy to pass both schema checks and semantic validation. | 

## Clean up
<a name="policy-getting-started-cleanup"></a>

To remove the resources created in this tutorial, remove both the gateway and the policy engine, then redeploy:

```
agentcore remove gateway --name PolicyGateway
agentcore remove policy-engine --name RefundPolicyEngine
agentcore deploy --yes
```

The project then declares no resources, so `agentcore deploy --yes` confirms removing the project’s stack.

Removing a gateway does not automatically remove its attached policy engine. You must remove the policy engine separately.