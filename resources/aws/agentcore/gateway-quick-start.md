

# Get started with AgentCore Gateway
<a name="gateway-quick-start"></a>

In this quick start guide you’ll learn how to set up a gateway and integrate it into your agents using the AgentCore CLI. For more comprehensive guides and examples, see the [Amazon Bedrock AgentCore Gateway GitHub repository](https://github.com/awslabs/amazon-bedrock-agentcore-samples/tree/main/01-features/07-centralize-and-govern-your-ai-infrastructure/01-gateway).

**Note**  
For the full AWS SDK API reference, see [AgentCore Control Plane operations](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock-agentcore-control.html).

**Topics**
+ [Prerequisites](#gateway-quick-start-prereqs)
+ [Step 1: Setup and install](#gateway-quick-start-setup)
+ [Step 2: Create gateway](#gateway-quick-start-create-gateway-setup)
+ [Step 3: Run the setup](#gateway-quick-start-run-setup)
+ [Step 4: Use the gateway with an agent](#gateway-quick-start-use-gateway-with-agents)
+ [What you’ve built](#gateway-quick-start-what-youve-built)
+ [Troubleshooting](#gateway-quick-start-troubleshooting)
+ [Quick validation](#gateway-quick-start-quick-validation)
+ [Cleanup](#gateway-quick-start-cleanup)
+ [Next steps](#gateway-quick-start-next-steps)

## Prerequisites
<a name="gateway-quick-start-prereqs"></a>

Before starting, make sure you have the following:
+  ** AWS Account** with credentials configured. To configure credentials, you can install and use the AWS Command Line Interface by following the steps at [Getting started with the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html).
+  **Node.js 20\+** installed (for the AgentCore CLI).
+  **Python 3.10\+** installed (for the agent script).
+  **IAM permissions** for creating roles, Lambda functions, and using Amazon Bedrock AgentCore.
+  **A Lambda function** that implements the `get_weather` and `get_time` tools. Step 2 shows a sample handler. Note the function ARN for use in Step 2.
+  **Model access.** Amazon Bedrock enables access to foundation models by default. To use a non-foundation model, follow the [model access steps](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html#model-access-sdk-step4).

## Step 1: Setup and install
<a name="gateway-quick-start-setup"></a>

Install the AgentCore CLI globally:

```
npm install -g @aws/agentcore
```

Create a new AgentCore project:

```
agentcore create --name MyGatewayProject --template empty
cd MyGatewayProject
```

The agent in this tutorial runs on your computer, so the project holds only the gateway and its target.

## Step 2: Create gateway
<a name="gateway-quick-start-create-gateway-setup"></a>

If you don’t have a Lambda function for this tutorial, create a Python function with the following handler. It returns test data for both tools. For the input that the gateway sends, see [Lambda function input format](gateway-add-target-lambda.md#gateway-building-lambda-input).

```
def lambda_handler(event, context):
    tool_name = context.client_context.custom["bedrockAgentCoreToolName"]
    tool = tool_name.split("___", 1)[1]
    if tool == "get_weather":
        return {"location": event["location"], "weather": "72°F, Sunny"}
    if tool == "get_time":
        return {"timezone": event["timezone"], "time": "2:30 PM"}
    return {"error": f"Unknown tool: {tool}"}
```

Save the following tool schema as `tools.json` in your project directory:

```
[
  {
    "name": "get_weather",
    "description": "Get weather for a location",
    "inputSchema": {
      "type": "object",
      "properties": {
        "location": {
          "type": "string",
          "description": "the location e.g. seattle, wa"
        }
      },
      "required": ["location"]
    }
  },
  {
    "name": "get_time",
    "description": "Get time for a timezone",
    "inputSchema": {
      "type": "object",
      "properties": {
        "timezone": {
          "type": "string"
        }
      },
      "required": ["timezone"]
    }
  }
]
```

Add a gateway and a Lambda function target to your project. Replace `<YOUR_LAMBDA_ARN>` with the ARN of your Lambda function:

```
# Add a gateway with no inbound auth (simplest for getting started)
agentcore add gateway --name TestGateway --authorizer-type NONE

# Add a Lambda function target
agentcore add gateway-target \
  --gateway TestGateway \
  --target-configuration '{
    "name": "TestLambdaTarget",
    "targetType": "lambdaFunctionArn",
    "lambdaFunctionArn": {
      "lambdaArn": "<YOUR_LAMBDA_ARN>",
      "toolSchemaFile": "tools.json"
    }
  }'
```

You can also run `agentcore add gateway` without options to add the gateway in an interactive wizard.

To use JWT-based authorization instead, provide the project authorizer configuration for an existing OIDC provider:

```
agentcore add gateway \
  --name TestGateway \
  --authorizer-type CUSTOM_JWT \
  --authorizer-configuration '{
    "customJwtAuthorizer": {
      "discoveryUrl": "https://cognito-idp.us-east-1.amazonaws.com/<POOL_ID>/.well-known/openid-configuration",
      "allowedAudience": ["<CLIENT_ID>"]
    }
  }'
```

Create the identity provider and application client before you run this command.

## Step 3: Run the setup
<a name="gateway-quick-start-run-setup"></a>

Deploy your project to AWS:

```
agentcore deploy
```

The CLI synthesizes a AWS CDK stack and deploys your gateway and its target to Amazon Bedrock AgentCore. This takes about 2-3 minutes.

## Step 4: Use the gateway with an agent
<a name="gateway-quick-start-use-gateway-with-agents"></a>

Retrieve your gateway ARN using the AgentCore CLI. The gateway ID is the last segment of the ARN:

```
agentcore status --json
```

Build the gateway URL from the gateway ID and your Region: `https://<gateway-id>.gateway.bedrock-agentcore.<region>.amazonaws.com/mcp`.

Create a new file called `run_agent.py` and insert the following code. Install the Python dependencies first:

```
pip install strands-agents mcp
```

```
"""
Agent script to test the Gateway
Run this after setup: python run_agent.py
"""

from strands import Agent
from strands.models import BedrockModel
from strands.tools.mcp.mcp_client import MCPClient
from mcp.client.streamable_http import streamablehttp_client
import json
import os
import sys

def create_streamable_http_transport(mcp_url: str):
    # Set GATEWAY_BEARER_TOKEN only for a CUSTOM_JWT gateway
    token = os.environ.get("GATEWAY_BEARER_TOKEN")
    headers = {"Authorization": f"Bearer {token}"} if token else None
    return streamablehttp_client(mcp_url, headers=headers)

def get_full_tools_list(client):
    """Get all tools with pagination support"""
    more_tools = True
    tools = []
    pagination_token = None
    while more_tools:
        tmp_tools = client.list_tools_sync(pagination_token=pagination_token)
        tools.extend(tmp_tools)
        if tmp_tools.pagination_token is None:
            more_tools = False
        else:
            more_tools = True
            pagination_token = tmp_tools.pagination_token
    return tools

def run_agent():
    # Build the gateway URL from the gateway ID in agentcore status --json
    gateway_url = "<YOUR_GATEWAY_URL>"

    # Model configuration - change if needed
    model_id = "anthropic.claude-3-7-sonnet-20250219-v1:0"

    print("Starting AgentCore Gateway Test Agent")
    print(f"Gateway URL: {gateway_url}")
    print(f"Model: {model_id}")
    print("-" * 60)

    # Setup Bedrock model
    bedrockmodel = BedrockModel(
        model_id=model_id,
        streaming=True,
    )

    # Setup MCP client
    mcp_client = MCPClient(lambda: create_streamable_http_transport(gateway_url))

    with mcp_client:
        # List available tools
        tools = get_full_tools_list(mcp_client)
        print(f"\nAvailable tools: {[tool.tool_name for tool in tools]}")
        print("-" * 60)

        # Create agent
        agent = Agent(model=bedrockmodel, tools=tools)

        # Interactive loop
        print("\nInteractive Agent Ready!")
        print("Try asking: 'What's the weather in Seattle?'")
        print("Type 'exit', 'quit', or 'bye' to end.\n")

        while True:
            user_input = input("You: ")
            if user_input.lower() in ["exit", "quit", "bye"]:
                print("Goodbye!")
                break

            print("\nThinking...\n")
            response = agent(user_input)
            print(f"\nAgent: {response.message.get('content', response)}\n")

if __name__ == "__main__":
    run_agent()
```

### Run your agent
<a name="gateway-quick-start-run-agent"></a>

Test your gateway by running the agent and interacting with the tools.

```
python run_agent.py
```

If you created the gateway with `CUSTOM_JWT`, get an access token for your application client from your identity provider and set it before you run the script:

```
export GATEWAY_BEARER_TOKEN="<ACCESS_TOKEN>"
python run_agent.py
```

The agent starts. Ask questions such as the following:
+ "What’s the weather in Seattle?"
+ "What time is it in New York?"

## What you’ve built
<a name="gateway-quick-start-what-youve-built"></a>

Through this getting started tutorial, you’ve created the following resources:
+  **MCP Server (Gateway)** : A managed endpoint at `https://gateway-id.gateway.bedrock-agentcore.region.amazonaws.com/mcp` 
+  **Lambda tools** : The `get_weather` and `get_time` tools from your Lambda function. The sample handler returns test data (weather: "72°F, Sunny", time: "2:30 PM")
+  **AI agent** : Claude-powered assistant that can discover and use your tools

## Troubleshooting
<a name="gateway-quick-start-troubleshooting"></a>

The following table shows some possible issues and their solutions:


| Issue | Solution | 
| --- | --- | 
| "No module named 'strands'" | Run: `pip install strands-agents`  | 
| "Model access denied" | Amazon Bedrock enables access to foundation models by default. For a non-foundation model, follow the [model access steps](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html#model-access-sdk-step4). | 
| "AccessDeniedException" | Check IAM permissions for bedrock-agentcore:\* | 
| Gateway not responding | Wait 30-60 seconds after creation for DNS propagation | 

## Quick validation
<a name="gateway-quick-start-quick-validation"></a>

Run the following command in a terminal to check that your gateway is working.

```
# List available tools
agentcore invoke --gateway TestGateway \
  --path /mcp \
  --payload '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

For a JWT-authorized gateway, add `--bearer-token "$BEARER_TOKEN"` to the invoke command.

## Cleanup
<a name="gateway-quick-start-cleanup"></a>

To remove the gateway and its targets from your project and from AWS:

```
agentcore remove gateway --name TestGateway
agentcore deploy --yes
```

The gateway is the only resource in the project, so `agentcore deploy --yes` confirms removing the project’s stack.

## Next steps
<a name="gateway-quick-start-next-steps"></a>
+  **Custom Lambda Tools** : Create Lambda functions with your business logic
+  **Add Your Own APIs** : Extend your Gateway with OpenAPI specifications for real services
+  **Production Setup** : Configure VPC endpoints, custom domains, and monitoring