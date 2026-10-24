

# Deploy AG-UI servers in AgentCore Runtime
<a name="runtime-agui"></a>

Amazon Bedrock AgentCore Runtime lets you deploy and run Agent User Interface (AG-UI) servers in the AgentCore Runtime. This guide walks you through creating, testing, and deploying your first AG-UI server.

In this section, you learn:
+ How Amazon Bedrock AgentCore supports AG-UI
+ How to create an AG-UI server
+ How to test your server locally
+ How to deploy your server to AWS 
+ How to invoke your deployed server

For more information about AG-UI, see [AG-UI protocol contract](runtime-agui-protocol-contract.md).

**Topics**
+ [How Amazon Bedrock AgentCore supports AG-UI](#runtime-agui-how-agentcore-supports)
+ [Using AG-UI with AgentCore Runtime](#runtime-agui-steps)
+ [Appendix](#runtime-agui-appendix)

## How Amazon Bedrock AgentCore supports AG-UI
<a name="runtime-agui-how-agentcore-supports"></a>

Amazon Bedrock AgentCore’s AG-UI protocol support enables integration with agent user interface servers by acting as a proxy layer. When configured for AG-UI, Amazon Bedrock AgentCore expects containers to run servers on port `8080` at the `/invocations` path for HTTP/SSE or `/ws` for WebSocket connections. Although AG-UI uses the same port and paths as the HTTP protocol, the runtime distinguishes between them by the server protocol configured on the Runtime. With the AgentCore CLI, `agentcore add runtime --protocol AGUI` sets the Runtime’s `protocol` to `AGUI` in `agentcore/agentcore.json`.

Amazon Bedrock AgentCore acts as a proxy between clients and your AG-UI container. Requests from the [InvokeAgentRuntime](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_InvokeAgentRuntime.html) API are passed through to your container without modification. Amazon Bedrock AgentCore handles authentication (SigV4/OAuth 2.0), session isolation, and scaling.

Key differences from other protocols:

 **Port**   
AG-UI servers run on port 8080 (same as HTTP, vs 8000 for MCP, 9000 for A2A)

 **Path**   
AG-UI servers use `/invocations` for HTTP/SSE and `/ws` for WebSocket (same as HTTP protocol)

 **Message Format**   
Uses event streams via Server-Sent Events (SSE) for streaming, or WebSocket for bidirectional communication

 **Protocol Focus**   
Agent-to-User interaction (vs MCP for tools, A2A for agent-to-agent)

 **Authentication**   
Supports both SigV4 and OAuth 2.0 authentication schemes

For more information, see [https://docs.ag-ui.com/introduction](https://docs.ag-ui.com/introduction).

## Using AG-UI with AgentCore Runtime
<a name="runtime-agui-steps"></a>

In this tutorial you create, test, and deploy an AG-UI server.

For complete examples and framework-specific implementations, see [AG-UI Quickstart Documentation](https://docs.ag-ui.com/quickstart/introduction) and [AG-UI Dojo](https://dojo.ag-ui.com/).

**Topics**
+ [Prerequisites](#runtime-agui-prerequisites)
+ [Step 1: Create your AG-UI server](#runtime-agui-create-server)
+ [Step 2: Test your AG-UI server locally](#runtime-agui-test-locally)
+ [Step 3: Deploy your AG-UI server to Bedrock AgentCore Runtime](#runtime-agui-deploy)
+ [Step 4: Invoke your deployed AG-UI server](#runtime-agui-step-4)

### Prerequisites
<a name="runtime-agui-prerequisites"></a>
+ Python 3.12 or higher installed
+ The AgentCore CLI installed and configured. For instructions, see [Get started with the AgentCore CLI](runtime-get-started-cli.md).
+ An AWS account with appropriate permissions and local credentials configured
+ Understanding of the AG-UI protocol and event-based agent-to-user communication concepts
+ A Cognito user pool configured as described in [Set up Cognito user pool for authentication](#runtime-agui-appendix-a). Export `REGION`, `POOL_ID`, and `CLIENT_ID` from that setup before creating the project.

### Step 1: Create your AG-UI server
<a name="runtime-agui-create-server"></a>

AG-UI is supported by multiple agent frameworks. This tutorial uses AWS Strands for Python.

#### Scaffold the project
<a name="runtime-agui-install-packages"></a>

Create an empty project, register a Python AG-UI Runtime with Cognito authorization, and add the dependencies for this example:

```
agentcore create --name AguiProject --template empty
cd AguiProject
agentcore add runtime \
  --name AguiAgent \
  --language python \
  --protocol AGUI \
  --authorizer-type CUSTOM_JWT \
  --authorizer-configuration \
  "{\"customJwtAuthorizer\":{\"discoveryUrl\":\"https://cognito-idp.$REGION.amazonaws.com/$POOL_ID/.well-known/openid-configuration\",\"allowedClients\":[\"$CLIENT_ID\"]}}" \
  --request-header-allowlist Authorization
cd app/AguiAgent
uv init --bare
uv add \
  "ag-ui-protocol>=0.1.19,<0.2" \
  "ag-ui-strands>=0.3,<0.4" \
  "aws-opentelemetry-distro~=0.21.0" \
  "bedrock-agentcore[strands-agents]>=1.18.1,<2" \
  "botocore[crt]~=1.43.0" \
  "fastapi>=0.142,<1" \
  "strands-agents>=1.15,<2" \
  "uvicorn>=0.34.3,<1"
cd ../..
```

The CLI creates `README.md` and `AGENTS.md` with the AG-UI Runtime contract, but it does not generate application code. To use another model provider, configure the Strands `Agent` in your application code. For other frameworks, see the [AG-UI framework integrations](https://docs.ag-ui.com/introduction#supported-integrations).

#### Create your first AG-UI server
<a name="runtime-agui-create-first-server"></a>

Create `app/AguiAgent/main.py` with the following implementation. This example uses AWS Strands with AG-UI. The server listens on port `8080`, exposes `/invocations` for AG-UI traffic, and exposes `/ping` for health checks. AgentCore Runtime requires this contract for AG-UI containers.

```
# app/AguiAgent/main.py
import os

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from ag_ui_strands import StrandsAgent
from ag_ui.core import RunAgentInput
from ag_ui.encoder import EventEncoder
from strands import Agent

# Create a simple Strands agent
strands_agent = Agent(
    system_prompt="You are a helpful assistant.",
)

# Wrap with AG-UI protocol support
agui_agent = StrandsAgent(
    agent=strands_agent,
    name="my_agent",
    description="A helpful assistant",
)

# FastAPI server
app = FastAPI(telemetry={"auto_configure": False})

@app.post("/invocations")
async def invocations(input_data: dict, request: Request):
    """Main AG-UI endpoint that returns event streams."""
    accept_header = request.headers.get("accept")
    encoder = EventEncoder(accept=accept_header)

    async def event_generator():
        run_input = RunAgentInput(**input_data)
        async for event in agui_agent.run(run_input):
            yield encoder.encode(event)

    return StreamingResponse(
        event_generator(),
        media_type=encoder.get_content_type()
    )

@app.get("/ping")
async def ping():
    return JSONResponse({"status": "Healthy"})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))
```

For complete, framework-specific examples, see:
+  [LangGraph \+ AG-UI](https://docs.copilotkit.ai/langgraph/) 
+  [CrewAI \+ AG-UI](https://docs.copilotkit.ai/crewai-flows) 
+  [AWS Strands \+ AG-UI](https://docs.copilotkit.ai/aws-strands) 

Keep `telemetry={"auto_configure": False}` with the FastAPI version installed above. The OpenTelemetry distribution owns exporter configuration; this setting prevents FastAPI from also configuring an environment-driven exporter.

#### Understanding the code
<a name="runtime-agui-understanding-code"></a>

 **Event Streams**   
AG-UI uses Server-Sent Events (SSE) to stream typed events to the client

 **/invocations Endpoint**   
Primary endpoint for HTTP/SSE communication (same as HTTP protocol)

 **Port 8080**   
AG-UI servers run on port 8080 by default in AgentCore Runtime

### Step 2: Test your AG-UI server locally
<a name="runtime-agui-test-locally"></a>

Run and test your AG-UI server in a local development environment.

#### Start your AG-UI server
<a name="runtime-agui-start-server"></a>

Run your AG-UI server locally from the project directory:

```
agentcore dev
```

You should see output indicating the server is running on port `8080`.

#### Test the endpoint
<a name="runtime-agui-test-endpoint"></a>

Test the SSE endpoint with a properly formatted AG-UI request:

```
curl -N -X POST http://localhost:8080/invocations \
-H "Content-Type: application/json" \
-d '{
  "threadId": "test-123",
  "runId": "run-456",
  "state": {},
  "messages": [{"role": "user", "content": "Hello, agent!", "id": "msg-1"}],
  "tools": [],
  "context": [],
  "forwardedProps": {}
}'
```

You should see AG-UI event streams returned in SSE format, including `RUN_STARTED` , `TEXT_MESSAGE_CONTENT` , and `RUN_FINISHED` events.

### Step 3: Deploy your AG-UI server to Bedrock AgentCore Runtime
<a name="runtime-agui-deploy"></a>

Deploy your AG-UI server to AWS using the AgentCore CLI. You configured Cognito authorization when you added the Runtime in Step 1, so no further setup is needed before deployment.

#### Deploy to AWS
<a name="runtime-agui-deploy-aws"></a>

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

### Step 4: Invoke your deployed AG-UI server
<a name="runtime-agui-step-4"></a>

Invoke your deployed Amazon Bedrock AgentCore AG-UI server and interact with the event streams.

#### Set up environment variables
<a name="runtime-agui-setup-environment-variables"></a>

Set the following environment variables:

1. Export bearer token as an environment variable. For bearer token setup, see [Set up Cognito user pool for authentication](#runtime-agui-appendix-a).

   ```
   export BEARER_TOKEN="<BEARER_TOKEN>"
   ```

1. Export the agent ARN.

   ```
   export AGENT_ARN="arn:aws:bedrock-agentcore:us-west-2:accountId:runtime/AguiProject_default_AguiAgent-xyz123"
   ```

#### Invoke the AG-UI server
<a name="runtime-agui-invoke-example"></a>

To invoke the AG-UI server programmatically, choose the language that matches your client:

**Example**  

1. Install the required packages:

   ```
   pip install httpx httpx-sse
   ```

   Then use the following client code:

   ```
   import asyncio
   import json
   import os
   from urllib.parse import quote
   from uuid import uuid4
   
   import httpx
   from httpx_sse import aconnect_sse
   
   async def invoke_agui_agent(message: str):
       agent_arn = os.environ.get('AGENT_ARN')
       bearer_token = os.environ.get('BEARER_TOKEN')
       escaped_arn = quote(agent_arn, safe='')
   
       url = f"https://bedrock-agentcore.us-west-2.amazonaws.com/runtimes/{escaped_arn}/invocations?qualifier=DEFAULT"
       headers = {
           "Authorization": f"Bearer {bearer_token}",
           "X-Amzn-Bedrock-AgentCore-Runtime-Session-Id": str(uuid4()),
       }
       payload = {
           "threadId": str(uuid4()),
           "runId": str(uuid4()),
           "messages": [{"id": str(uuid4()), "role": "user", "content": message}],
           "state": {},
           "tools": [],
           "context": [],
           "forwardedProps": {},
       }
   
       async with httpx.AsyncClient(timeout=300) as client:
           async with aconnect_sse(client, "POST", url, headers=headers, json=payload) as sse:
               async for event in sse.aiter_sse():
                   data = json.loads(event.data)
                   event_type = data.get("type")
                   if event_type == "TEXT_MESSAGE_CONTENT":
                       print(data.get("delta", ""), end="", flush=True)
                   elif event_type == "RUN_ERROR":
                       print(f"Error: {data.get('code')} - {data.get('message')}")
   
   asyncio.run(invoke_agui_agent("Hello!"))
   ```

1. Install the required packages:

   ```
   npm install @ag-ui/client
   ```

   Then use the following client code:

   ```
   import { HttpAgent, AgentSubscriber } from "@ag-ui/client";
   import { randomUUID } from "crypto";
   
   async function invokeAguiAgent(message: string): Promise<void> {
     const agentArn = process.env.AGENT_ARN!;
     const bearerToken = process.env.BEARER_TOKEN!;
     const escapedArn = encodeURIComponent(agentArn);
   
     const agent = new HttpAgent({
       url: `https://bedrock-agentcore.us-west-2.amazonaws.com/runtimes/${escapedArn}/invocations?qualifier=DEFAULT`,
       headers: {
         Authorization: `Bearer ${bearerToken}`,
         "X-Amzn-Bedrock-AgentCore-Runtime-Session-Id": randomUUID(),
       },
     });
   
     agent.messages = [{ id: randomUUID(), role: "user", content: message }];
   
     const subscriber: AgentSubscriber = {
       onTextMessageContentEvent: ({ event }) => {
         process.stdout.write(event.delta);
       },
       onRunErrorEvent: ({ event }) => {
         console.error(`Error: ${event.code ?? "RUN_ERROR"} - ${event.message}`);
       },
     };
   
     await agent.runAgent({}, subscriber);
   }
   
   void invokeAguiAgent("Hello!");
   ```

For building full UI applications, see [CopilotKit](https://docs.copilotkit.ai/) or the [AG-UI TypeScript client SDK](https://docs.ag-ui.com/sdk/js/client/overview).

## Appendix
<a name="runtime-agui-appendix"></a>

**Topics**
+ [Set up Cognito user pool for authentication](#runtime-agui-appendix-a)
+ [Troubleshooting](#runtime-agui-troubleshooting)

### Set up Cognito user pool for authentication
<a name="runtime-agui-appendix-a"></a>

For detailed Cognito setup instructions, see [Set up Cognito user pool for authentication](runtime-mcp.md#runtime-mcp-appendix-a). The setup process is identical for AG-UI servers.

### Troubleshooting
<a name="runtime-agui-troubleshooting"></a>

 **Common AG-UI-specific issues** 

The following are common issues you might encounter:

Port conflicts  
AG-UI servers must run on port 8080 in the AgentCore Runtime environment

Authorization method mismatch  
Make sure your request uses the same authentication method (OAuth or SigV4) that the agent was configured with

Event format errors  
Ensure your events follow the AG-UI protocol specification. See [AG-UI Events Documentation](https://docs.ag-ui.com/concepts/events) 