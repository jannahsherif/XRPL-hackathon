

# Deploy A2A servers in AgentCore Runtime
<a name="runtime-a2a"></a>

Amazon Bedrock AgentCore Runtime lets you deploy and run Agent-to-Agent (A2A) servers in the AgentCore Runtime. This guide walks you through creating, testing, and deploying your first A2A server.

In this section, you learn:
+ How Amazon Bedrock AgentCore supports A2A
+ How to create an A2A server with agent capabilities
+ How to test your server locally
+ How to deploy your server to AWS 
+ How to invoke your deployed server
+ How to retrieve agent cards for discovery

For more information about A2A, see [A2A protocol contract](runtime-a2a-protocol-contract.md).

**Topics**
+ [How Amazon Bedrock AgentCore supports A2A](#runtime-a2a-how-agentcore-supports)
+ [Using A2A with AgentCore Runtime](#runtime-a2a-steps)
+ [Appendix](#runtime-a2a-appendix)

## How Amazon Bedrock AgentCore supports A2A
<a name="runtime-a2a-how-agentcore-supports"></a>

Amazon Bedrock AgentCore acts as a proxy between clients and your A2A server. When configured for A2A, Amazon Bedrock AgentCore expects containers to run stateless, streamable HTTP servers on port `9000` at the root path ( `0.0.0.0:9000/` ), which aligns with the default A2A server configuration.

The service provides session isolation while maintaining protocol transparency - JSON-RPC payloads from the [InvokeAgentRuntime](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_InvokeAgentRuntime.html) API are passed through directly to the A2A container without modification. This architecture preserves the standard A2A protocol features like built-in agent discovery through Agent Cards at `/.well-known/agent-card.json` and JSON-RPC communication, while adding authentication (SigV4/OAuth 2.0) and scalability.

Key differences from other protocols:

 **Port**   
A2A servers run on port 9000 (vs 8080 for HTTP, 8000 for MCP)

 **Path**   
A2A servers are mounted at `/` (vs `/invocations` for HTTP, `/mcp` for MCP)

 **Agent Cards**   
A2A provides built-in agent discovery through Agent Cards at `/.well-known/agent-card.json` 

 **Protocol**   
Uses JSON-RPC for agent-to-agent communication

 **Authentication**   
Supports both SigV4 and OAuth 2.0 authentication schemes

For more information, see [https://a2a-protocol.org/](https://a2a-protocol.org/).

## Using A2A with AgentCore Runtime
<a name="runtime-a2a-steps"></a>

In this tutorial you create, test, and deploy an A2A server.

**Topics**
+ [Prerequisites](#runtime-a2a-prerequisites)
+ [Step 1: Create your A2A project](#runtime-a2a-create-server)
+ [Step 2: Test your A2A server locally](#runtime-a2a-test-locally)
+ [Step 3: Deploy your A2A server to Bedrock AgentCore Runtime](#runtime-a2a-deploy)
+ [Step 4: Get the agent card](#runtime-a2a-step-4)
+ [Step 5: Invoke your deployed A2A server](#runtime-a2a-step-5)

### Prerequisites
<a name="runtime-a2a-prerequisites"></a>
+ Python 3.10 or higher installed and basic understanding of Python
+ The AgentCore CLI installed and configured. For instructions, see [Get started with the AgentCore CLI](runtime-get-started-cli.md).
+ An AWS account with appropriate permissions and local credentials configured
+ Understanding of the A2A protocol and agent-to-agent communication concepts
+ A Cognito user pool configured as described in [Set up Cognito user pool for authentication](runtime-mcp.md#runtime-mcp-appendix-a). Source the setup script so that `REGION`, `POOL_ID`, and `CLIENT_ID` are available in your shell.

### Step 1: Create your A2A project
<a name="runtime-a2a-create-server"></a>

This example uses Strands with the A2A protocol.

#### Scaffold the project
<a name="runtime-a2a-scaffold-project"></a>

Run the following command:

```
agentcore create --name A2AProject --template empty
cd A2AProject
agentcore add runtime \
  --name A2AAgent \
  --language python \
  --protocol A2A \
  --authorizer-type CUSTOM_JWT \
  --authorizer-configuration \
  "{\"customJwtAuthorizer\":{\"discoveryUrl\":\"https://cognito-idp.$REGION.amazonaws.com/$POOL_ID/.well-known/openid-configuration\",\"allowedClients\":[\"$CLIENT_ID\"]}}" \
  --request-header-allowlist Authorization
cd app/A2AAgent
uv init --bare
uv add \
  "a2a-sdk[all]~=0.3.26" \
  "aws-opentelemetry-distro~=0.21.0" \
  "bedrock-agentcore[a2a,strands-agents]~=1.24.0" \
  "botocore[crt]~=1.43.107" \
  "strands-agents~=1.57.2"
cd ../..
```

The CLI registers a Python A2A Runtime with Cognito authorization and creates `README.md` and `AGENTS.md` in its code directory. The commands above initialize the dependencies used by this example. To use another model provider, configure the Strands `Agent` in your application code.

Create `app/A2AAgent/main.py` with the following A2A server:

```
from strands import Agent, tool
from strands.multiagent.a2a.executor import StrandsA2AExecutor
from bedrock_agentcore.runtime import serve_a2a

@tool
def add_numbers(a: int, b: int) -> int:
    """Return the sum of two numbers."""
    return a + b

tools = [add_numbers]

def create_agent(_context_id: str) -> Agent:
    return Agent(
        name="A2AAgent",
        system_prompt="You are a helpful assistant. Use tools when appropriate.",
        tools=tools,
    )

if __name__ == "__main__":
    serve_a2a(StrandsA2AExecutor(agent_factory=create_agent))
```

#### Understanding the code
<a name="runtime-a2a-understanding-code"></a>

 **Strands Agent**   
Creates an agent with specific tools and capabilities

 **StrandsA2AExecutor**   
Uses `agent_factory=create_agent` to create a context-scoped Strands agent for the A2A interaction

 **serve\_a2a**   
The Amazon Bedrock AgentCore SDK helper that starts a Bedrock-compatible A2A server. It handles the `/ping` health endpoint, Agent Card serving, `AGENTCORE_RUNTIME_URL` environment variable, Bedrock header propagation, and runs on port 9000 by default.

 **Port 9000**   
A2A servers run on port 9000 by default in AgentCore Runtime

To customize this agent, replace the `add_numbers` tool with your own tools and update the system prompt.

### Step 2: Test your A2A server locally
<a name="runtime-a2a-test-locally"></a>

Run and test your A2A server in a local development environment.

#### Start your A2A server
<a name="runtime-a2a-start-server"></a>

Start your A2A server locally using the AgentCore CLI:

```
agentcore dev --mode browser
```

This opens the AgentCore agent inspector in your web browser. Run `agentcore dev` without `--mode browser` for headless local development.

You should see output indicating the server is running on port `9000`.

#### Invoke agent
<a name="runtime-a2a-invoke-agent"></a>

```
curl -X POST http://localhost:9000/ \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0",
  "id": "req-001",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "what is 101 * 11?"
        }
      ],
      "messageId": "12345678-1234-1234-1234-123456789012"
    }
  }
}' | jq .
```

#### Test agent card retrieval
<a name="runtime-a2a-test-agent-card"></a>

You can test the agent card endpoint locally:

```
curl http://localhost:9000/.well-known/agent-card.json | jq .
```

You can also test your deployed server using the A2A Inspector as described in [Remote testing with A2A inspector](https://github.com/a2aproject/a2a-inspector).

### Step 3: Deploy your A2A server to Bedrock AgentCore Runtime
<a name="runtime-a2a-deploy"></a>

#### Deploy to AWS
<a name="runtime-a2a-deploy-aws"></a>

Build and deploy your agent:

```
agentcore build
agentcore deploy
```

After deployment, get the Runtime ARN:

```
agentcore status --json
```

The Runtime resource’s `arn` field contains its ARN.

### Step 4: Get the agent card
<a name="runtime-a2a-step-4"></a>

Agent Cards are JSON metadata documents that describe an A2A server’s identity, capabilities, skills, service endpoint, and authentication requirements. They enable automatic agent discovery in the A2A ecosystem.

#### Set up environment variables
<a name="runtime-a2a-step-4-setup-environment-variables"></a>

Set the following environment variables:

1. Export bearer token as an environment variable. For bearer token setup, see [Bearer token setup](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-mcp.html#runtime-mcp-appendix).

   ```
   export BEARER_TOKEN="<BEARER_TOKEN>"
   ```

1. Export the agent ARN.

   ```
   export AGENT_ARN="arn:aws:bedrock-agentcore:us-west-2:accountId:runtime/A2AProject_default_A2AAgent-xyz123"
   ```

#### Retrieve agent card
<a name="retrieve-agent-card"></a>

```
import os
import json
import requests
from uuid import uuid4
from urllib.parse import quote

def fetch_agent_card():
    # Get environment variables
    agent_arn = os.environ.get('AGENT_ARN')
    bearer_token = os.environ.get('BEARER_TOKEN')

    if not agent_arn:
        print("Error: AGENT_ARN environment variable not set")
        return

    if not bearer_token:
        print("Error: BEARER_TOKEN environment variable not set")
        return

    # URL encode the agent ARN
    escaped_agent_arn = quote(agent_arn, safe='')

    # Construct the URL
    url = f"https://bedrock-agentcore.us-west-2.amazonaws.com/runtimes/{escaped_agent_arn}/invocations/.well-known/agent-card.json"

    # Generate a unique session ID
    session_id = str(uuid4())
    print(f"Generated session ID: {session_id}")

    # Set headers
    headers = {
        'Accept': '*/*',
        'Authorization': f'Bearer {bearer_token}',
        'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': session_id
    }

    try:
        # Make the request
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        # Parse and pretty print JSON
        agent_card = response.json()
        print(json.dumps(agent_card, indent=2))

        return agent_card

    except requests.exceptions.RequestException as e:
        print(f"Error fetching agent card: {e}")
        return None

if __name__ == "__main__":
    fetch_agent_card()
```

After you get the URL from the Agent Card, export `AGENTCORE_RUNTIME_URL` as an environment variable:

```
export AGENTCORE_RUNTIME_URL="https://bedrock-agentcore.us-west-2.amazonaws.com/runtimes/<ARN>/invocations/"
```

### Step 5: Invoke your deployed A2A server
<a name="runtime-a2a-step-5"></a>

Create client code to invoke your deployed Amazon Bedrock AgentCore A2A server and send messages to test the functionality.

Create a new file `my_a2a_client_remote.py` to invoke your deployed A2A server:

```
import asyncio
import logging
import os
from uuid import uuid4

import httpx
from a2a.client import A2ACardResolver, ClientConfig, ClientFactory
from a2a.types import Message, Part, Role, TextPart

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT = 300  # set request timeout to 5 minutes

def create_message(*, role: Role = Role.user, text: str) -> Message:
    return Message(
        kind="message",
        role=role,
        parts=[Part(TextPart(kind="text", text=text))],
        message_id=uuid4().hex,
    )

async def send_sync_message(message: str):
    # Get runtime URL from environment variable
    runtime_url = os.environ.get('AGENTCORE_RUNTIME_URL')

    # Generate a unique session ID
    session_id = str(uuid4())
    print(f"Generated session ID: {session_id}")

    # Add authentication headers for Amazon Bedrock AgentCore
    headers = {"Authorization": f"Bearer {os.environ.get('BEARER_TOKEN')}",
        'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': session_id}

    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT, headers=headers) as httpx_client:
        # Get agent card from the runtime URL
        resolver = A2ACardResolver(httpx_client=httpx_client, base_url=runtime_url)
        agent_card = await resolver.get_agent_card()

        # Agent card contains the correct URL (same as runtime_url in this case)
        # No manual override needed - this is the path-based mounting pattern

        # Create client using factory
        config = ClientConfig(
            httpx_client=httpx_client,
            streaming=False,  # Use non-streaming mode for sync response
        )
        factory = ClientFactory(config)
        client = factory.create(agent_card)

        # Create and send message
        msg = create_message(text=message)

        # With streaming=False, this will yield exactly one result
        async for event in client.send_message(msg):
            if isinstance(event, Message):
                logger.info(event.model_dump_json(exclude_none=True, indent=2))
                return event
            elif isinstance(event, tuple) and len(event) == 2:
                # (Task, UpdateEvent) tuple
                task, update_event = event
                logger.info(f"Task: {task.model_dump_json(exclude_none=True, indent=2)}")
                if update_event:
                    logger.info(f"Update: {update_event.model_dump_json(exclude_none=True, indent=2)}")
                return task
            else:
                # Fallback for other response types
                logger.info(f"Response: {str(event)}")
                return event

# Usage - Uses AGENTCORE_RUNTIME_URL environment variable
asyncio.run(send_sync_message("what is 101 * 11"))
```

## Appendix
<a name="runtime-a2a-appendix"></a>

**Topics**
+ [Set up Cognito user pool for authentication](#runtime-a2a-setup-cognito-appendix)
+ [Remote testing with A2A inspector](#runtime-a2a-remote-testing)
+ [Troubleshooting](#runtime-a2a-troubleshooting)

### Set up Cognito user pool for authentication
<a name="runtime-a2a-setup-cognito-appendix"></a>

For detailed Cognito setup instructions, see [Set up Cognito user pool for authentication](runtime-mcp.md#runtime-mcp-appendix-a).

### Remote testing with A2A inspector
<a name="runtime-a2a-remote-testing"></a>

See [https://github.com/a2aproject/a2a-inspector](https://github.com/a2aproject/a2a-inspector).

### Troubleshooting
<a name="runtime-a2a-troubleshooting"></a>

 **Common A2A-specific issues** 

The following are common issues you might encounter:

Port conflicts  
A2A servers must run on port 9000 in the AgentCore Runtime environment

JSON-RPC errors  
Check that your client is sending properly formatted JSON-RPC 2.0 messages

Authorization method mismatch  
Make sure your request uses the same authentication method (OAuth or SigV4) that the agent was configured with

 **Exception handling** 

A2A specifications for Error handling: [https://a2a-protocol.org/latest/specification/#81-standard-json-rpc-errors](https://a2a-protocol.org/latest/specification/#81-standard-json-rpc-errors) 

A2A servers return most errors as standard JSON-RPC error responses. The service returns authentication and authorization failures (for example, `AccessDeniedException`) as native HTTP errors with their own status codes, as shown in the following table. The service automatically translates internal runtime errors to JSON-RPC internal errors to maintain protocol compliance.

The service provides A2A-compliant error responses with standardized JSON-RPC error codes:


| JSON-RPC Error Code | Runtime Exception | HTTP Error Code | JSON-RPC Error Message | 
| --- | --- | --- | --- | 
| Not applicable |  `AccessDeniedException`  | 403 | Access denied (returned as a standard HTTP error, not a JSON-RPC error) | 
| -32051 |  `ResourceNotFoundException`  | 404 | Resource not found – Requested resource does not exist | 
| -32052 |  `ValidationException`  | 400 | Validation error – Invalid request data | 
| -32053 |  `ThrottlingException`  | 429 | Rate limit exceeded – Too many requests | 
| -32053 |  `ServiceQuotaExceededException`  | 429 | Rate limit exceeded – Too many requests | 
| -32054 |  `ConflictException`  | 409 | Resource conflict – Resource already exists | 
| -32054 |  `RetryableConflictException`  | 409 | Session operation in progress, please retry | 
| -32055 |  `RuntimeClientError`  | 424 | Runtime client error – Check your CloudWatch logs for more information. | 
| -32603 |  `Any other exception`  | 500 | Internal error - An unexpected error occurred while processing the request | 