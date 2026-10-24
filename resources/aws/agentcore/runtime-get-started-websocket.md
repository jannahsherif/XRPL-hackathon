

# Get started with bidirectional streaming using WebSocket
<a name="runtime-get-started-websocket"></a>

Amazon Bedrock AgentCore Runtime lets you deploy agents that support WebSocket streaming for real-time bidirectional communication. This guide walks you through creating, testing, and deploying your first bidirectional streaming agent using WebSocket.

In this section, you learn:
+ How AgentCore Runtime supports WebSocket connections
+ How to create an agent application with bidirectional streaming capabilities
+ How to test your agent locally
+ How to deploy your agent to AWS 
+ How to invoke your deployed agent
+ How to use sessions with WebSocket connections

For more information about the WebSocket protocol, see [WebSocket RFC 6455](https://tools.ietf.org/html/rfc6455).

**Topics**
+ [How AgentCore Runtime supports WebSocket connections](#websocket-support-overview)
+ [Using WebSocket with AgentCore Runtime](#using-websocket-with-runtime)
+ [Session management](#websocket-session-management)
+ [Observability](#websocket-observability)
+ [Custom Headers](#websocket-custom-headers)
+ [Appendix](#websocket-appendix)

## How AgentCore Runtime supports WebSocket connections
<a name="websocket-support-overview"></a>

AgentCore Runtime’s WebSocket support enables persistent, bidirectional streaming connections between clients and agents. AgentCore Runtime expects containers to implement WebSocket endpoints on port `8080` at the `/ws` path, which aligns with standard WebSocket server practices.

AgentCore Runtime’s WebSocket support provides the same serverless, session isolation, identity, and observability capabilities as `InvokeAgentRuntime` . Additionally, it enables low-latency, real-time bidirectional streaming of messages through WebSocket connections using SigV4 or OAuth 2.0 authentication, making it ideal for applications such as real-time conversational voice agents.

### Supported WebSocket libraries
<a name="websocket-supported-libraries"></a>

Bidirectional streaming using WebSockets on AgentCore Runtime supports applications using any WebSocket language library. The only requirements are that clients connect to the service endpoint with a WebSocket protocol connection:

```
wss://bedrock-agentcore.<region>.amazonaws.com/runtimes/<agentRuntimeArn>/ws
```

using one of the supported authentication methods (SigV4 headers, SigV4 pre-signed URL, or OAuth 2.0) and that the agent application implements the WebSocket service contract as specified in [HTTP protocol contract](runtime-http-protocol-contract.md).

This flexibility allows you to use your preferred WebSocket implementation across different programming languages and frameworks, ensuring compatibility with existing codebases and development workflows.

## Using WebSocket with AgentCore Runtime
<a name="using-websocket-with-runtime"></a>

In this getting started tutorial you will create, test, and deploy an agent application that supports bidirectional streaming using the **bedrock-agentcore Python SDK** and the **AgentCore CLI**.

**Topics**
+ [Prerequisites](#websocket-prerequisites)
+ [Step 1: Create an AgentCore project](#setup-websocket-project)
+ [Step 2: Create your bidirectional streaming agent](#create-websocket-agent)
+ [Step 3: Test your bidirectional streaming agent locally](#step-2-test-websocket-locally)
+ [Step 4: Deploy your bidirectional streaming agent to AgentCore Runtime](#step-3-deploy-websocket-to-aws)
+ [Step 5: Invoke your deployed bidirectional streaming agent](#step-4-invoke-deployed-websocket)

### Prerequisites
<a name="websocket-prerequisites"></a>

Before you start, make sure you have:
+ Complete the [AgentCore CLI prerequisites](agentcore-get-started-cli.md#agentcore-get-started-cli-prerequisites).
+  [Install the AgentCore CLI](agentcore-get-started-cli.md#agentcore-get-started-cli-install).

### Step 1: Create an AgentCore project
<a name="setup-websocket-project"></a>

Create a code-based Python project from the minimal Runtime template:

```
agentcore create \
  --name WebSocketProject \
  --template agent-python-minimal
cd WebSocketProject
```

The template creates a `CodeZip` Runtime in `app/agent/` and installs its Python dependencies, including the Amazon Bedrock AgentCore SDK. The SDK includes the Python `websockets` dependency used in this tutorial.

### Step 2: Create your bidirectional streaming agent
<a name="create-websocket-agent"></a>

Replace the contents of `app/agent/main.py` with the following code:

#### Bidirectional streaming agent implementation (main.py)
<a name="websocket-agent-code"></a>

```
from bedrock_agentcore.runtime import BedrockAgentCoreApp

app = BedrockAgentCoreApp()

@app.websocket
async def websocket_handler(websocket, context):
    """Simple echo WebSocket handler."""
    await websocket.accept()

    try:
        data = await websocket.receive_json()
        # Echo back
        await websocket.send_json({"echo": data})
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    app.run(log_level="info")
```

#### Understanding the code
<a name="understanding-websocket-code"></a>
+  **BedrockAgentCoreApp** : Creates an agent application that extends Starlette for AI agent deployment, providing WebSocket support, HTTP routing, middleware, and exception handling capabilities
+  **WebSocket Decorator** : The `@app.websocket` decorator automatically handles connections at the `/ws` path on port 8080
+  **Echo Logic** : Sends back received data using `{"echo": data}` 
+  **Error Handling** : Uses try/except/finally structure to ensure proper error logging and graceful connection closure.

### Step 3: Test your bidirectional streaming agent locally
<a name="step-2-test-websocket-locally"></a>

#### Start your bidirectional streaming agent
<a name="start-websocket-server"></a>

Open a terminal window and start your bidirectional streaming agent with the following command:

```
agentcore dev
```

You should see output indicating the server is running on port 8080.

#### Test WebSocket connection
<a name="test-websocket-connection"></a>

In `app/agent/`, create a local WebSocket client named `websocket_agent_client.py` :

##### Local WebSocket client (websocket\_agent\_client.py)
<a name="websocket-test-client"></a>

```
import asyncio
import websockets
import json

async def local_websocket():
    uri = "ws://localhost:8080/ws"

    try:
        async with websockets.connect(uri) as websocket:
            # Send a message
            await websocket.send(json.dumps({"inputText": "Hello WebSocket!"}))

            # Receive the echo response
            response = await websocket.recv()
            print(f"Received: {response}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(local_websocket())
```

Test your bidirectional streaming agent locally. Open another terminal window, and run the client from the `WebSocketProject` directory:

```
cd app/agent
uv run python websocket_agent_client.py
```

 **Success:** You should see a response like `Received: {"echo":{"inputText":"Hello WebSocket!"}}` . In the terminal window that’s running the agent, enter `Ctrl+C` to stop the agent.

### Step 4: Deploy your bidirectional streaming agent to AgentCore Runtime
<a name="step-3-deploy-websocket-to-aws"></a>

#### Build and deploy to AWS
<a name="configure-and-deploy"></a>

```
agentcore deploy
```

Optionally, run `agentcore build` first to synthesize and check the project without deploying.

Get the deployed Runtime ARN:

```
agentcore status --json
```

The Runtime resource’s `arn` field contains an ARN that looks like:

```
arn:aws:bedrock-agentcore:us-west-2:accountId:runtime/WebSocketProject_default_agent-xyz123
```

Save this ARN as you’ll need it to invoke your deployed agent.

### Step 5: Invoke your deployed bidirectional streaming agent
<a name="step-4-invoke-deployed-websocket"></a>

Run the Python client examples in this section from the generated application directory. From the `WebSocketProject` directory, run:

```
cd app/agent
```

#### Set up environment variables
<a name="setup-environment-variables"></a>

Set up the required environment variables:

1. Export your agent ARN:

   ```
   export AGENT_ARN="arn:aws:bedrock-agentcore:us-west-2:accountId:runtime/WebSocketProject_default_agent-xyz123"
   ```

1. If using OAuth, export your bearer token:

   ```
   export BEARER_TOKEN="your_oauth_token_here"
   ```

#### Authentication methods
<a name="websocket-authentication-methods"></a>

The `InvokeAgentRuntimeWithWebSocketStream` API action establishes a WebSocket connection that supports bidirectional streaming between the client and agent. You can authenticate WebSocket connections using the following methods:
+  ** AWS Signature Version 4 headers** : Sign the WebSocket handshake request headers using your AWS credentials
+  ** AWS Signature Version 4 Pre-signed URL** : Create a presigned WebSocket URL with SigV4 signature provided as query parameters
+  **OAuth Bearer token** : Pass an OAuth token in the Authorization header for external identity provider integration

**Tip**  
Make sure that you have `bedrock-agentcore:InvokeAgentRuntimeWithWebSocketStream` permissions.

#### Connect using SigV4 signed headers
<a name="websocket-sigv4-headers"></a>

The following example shows how to establish a WebSocket connection and communicate with an agent runtime using SigV4 signed headers:

##### WebSocket client with SigV4 headers (websocket\_agent\_client\_sigv4\_headers.py)
<a name="websocket-sigv4-example"></a>

```
from bedrock_agentcore.runtime import AgentCoreRuntimeClient
import websockets
import asyncio
import json
import os

async def main():
    # Get runtime ARN from environment variable
    runtime_arn = os.getenv('AGENT_ARN')
    if not runtime_arn:
        raise ValueError("AGENT_ARN environment variable is required")

    # Initialize client
    client = AgentCoreRuntimeClient(region="us-west-2")

    # Generate WebSocket connection with authentication
    ws_url, headers = client.generate_ws_connection(
        runtime_arn=runtime_arn
    )

    try:
        async with websockets.connect(ws_url, additional_headers=headers) as ws:
            # Send message
            await ws.send(json.dumps({"inputText": "Hello!"}))

            # Receive response
            response = await ws.recv()
            print(f"Received: {response}")
    except websockets.exceptions.InvalidStatus as e:
        print(f"WebSocket handshake failed with status code: {e.response.status_code}")
        print(f"Response headers: {e.response.headers}")
        print(f"Response body: {e.response.body.decode()}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
```

Run the client to test your deployed agent:

```
uv run python websocket_agent_client_sigv4_headers.py
```

 **Success:** You should see a response like:

```
Received: {"echo":{"inputText":"Hello!"}}
```

#### Connect using pre-signed URL (SigV4 via query parameters)
<a name="websocket-sigv4-presigned"></a>

The following example shows how to create a WebSocket URL with SigV4 query parameters and establish a connection:

##### WebSocket client with pre-signed URL (websocket\_agent\_client\_sigv4\_presigned\_url.py)
<a name="websocket-presigned-example"></a>

```
from bedrock_agentcore.runtime import AgentCoreRuntimeClient
import websockets
import asyncio
import json
import os

async def main():
    runtime_arn = os.getenv('AGENT_ARN')
    if not runtime_arn:
        raise ValueError("AGENT_ARN environment variable is required")

    client = AgentCoreRuntimeClient(region="us-west-2")

    # Generate WebSocket pre-signed URL (with SigV4 via query parameters)
    # wss://...amazonaws.com/runtimes/.../ws?X-Amz-Algorithm=AWS4-HMAC-SHA256
    #   &X-Amz-Credential=...&X-Amz-Date=...&X-Amz-Expires=300
    #   &X-Amz-SignedHeaders=...&X-Amz-Signature=...
    sigv4_url = client.generate_presigned_url(
        runtime_arn=runtime_arn,
        expires=300  # 5 minutes
    )

    try:
        async with websockets.connect(sigv4_url) as ws:
            await ws.send(json.dumps({"inputText": "Hello!"}))
            response = await ws.recv()
            print(f"Received: {response}")
    except websockets.exceptions.InvalidStatus as e:
        print(f"WebSocket handshake failed with status code: {e.response.status_code}")
        print(f"Response headers: {e.response.headers}")
        print(f"Response body: {e.response.body.decode()}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
```

Run the client to test your deployed agent:

```
uv run python websocket_agent_client_sigv4_presigned_url.py
```

 **Success:** You should see a response like:

```
Received: {"echo":{"inputText":"Hello!"}}
```

#### Connect using OAuth
<a name="websocket-oauth"></a>

AgentCore Runtime supports OAuth Bearer token authentication for WebSocket connections. To use OAuth authentication, you need to configure your agent runtime with JWT authorization as described in the [JWT inbound authorization and OAuth outbound access sample](runtime-oauth.md#oauth-sample-overview) section of [Authenticate and authorize with Inbound Auth and Outbound Auth](runtime-oauth.md).

Once you have completed the OAuth setup and obtained a bearer token following [Step 4: Use bearer token to invoke your agent](runtime-oauth.md#oauth-invoke-agent) in the OAuth guide, you can use that token to establish WebSocket connections.

##### Python client with OAuth
<a name="websocket-oauth-python"></a>

The following example shows how to establish a WebSocket connection from Python using OAuth:

##### WebSocket client with OAuth authentication (websocket\_agent\_client\_oauth.py)
<a name="websocket-oauth-example"></a>

```
from bedrock_agentcore.runtime import AgentCoreRuntimeClient
import websockets
import asyncio
import json
import os

async def main():
    # Get runtime ARN from environment variable
    runtime_arn = os.getenv('AGENT_ARN')
    if not runtime_arn:
        raise ValueError("AGENT_ARN environment variable is required")

    # Get OAuth bearer token from environment variable
    bearer_token = os.getenv('BEARER_TOKEN')
    if not bearer_token:
        raise ValueError("BEARER_TOKEN environment variable required for OAuth")

    # Initialize client
    client = AgentCoreRuntimeClient(region="us-west-2")

    # Generate WebSocket connection with OAuth
    ws_url, headers = client.generate_ws_connection_oauth(
        runtime_arn=runtime_arn,
        bearer_token=bearer_token
    )

    try:
        async with websockets.connect(ws_url, additional_headers=headers) as ws:
            # Send message
            await ws.send(json.dumps({"inputText": "Hello!"}))

            # Receive response
            response = await ws.recv()
            print(f"Received: {response}")
    except websockets.exceptions.InvalidStatus as e:
        print(f"WebSocket handshake failed with status code: {e.response.status_code}")
        print(f"Response headers: {e.response.headers}")
        print(f"Response body: {e.response.body.decode()}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
```

Run the client to test your deployed agent:

```
uv run python websocket_agent_client_oauth.py
```

 **Success:** You should see a response like:

```
Received: {"echo":{"inputText":"Hello!"}}
```

##### Browser JavaScript client with OAuth
<a name="websocket-oauth-browser"></a>

The browser’s native WebSocket API does not provide a method to set custom headers during the handshake. To support OAuth authentication from browsers, AgentCore Runtime accepts the bearer token embedded in the `Sec-WebSocket-Protocol` header during the WebSocket handshake.

The token must be base64url-encoded and prefixed with `base64UrlBearerAuthorization.` , followed by the sentinel subprotocol `base64UrlBearerAuthorization`.

The following example shows how to establish a WebSocket connection from browser JavaScript using OAuth:

##### Browser WebSocket client with OAuth (index.html)
<a name="websocket-oauth-browser-example"></a>

```
<!DOCTYPE html>
<html>
<body>
    <button onclick="connect()">Connect</button>
    <div id="output"></div>

    <script>
        function connect() {
            const bearerToken = "your_oauth_token_here";
            const runtimeArn = "arn:aws:bedrock-agentcore:us-west-2:accountId:runtime/agent-xyz123";

            // Base64url encode token
            const base64url = btoa(bearerToken)
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');

            const ws = new WebSocket(
                `wss://bedrock-agentcore.us-west-2.amazonaws.com/runtimes/${runtimeArn}/ws`,
                [`base64UrlBearerAuthorization.${base64url}`, "base64UrlBearerAuthorization"]
            );

            ws.onopen = () => ws.send(JSON.stringify({ inputText: "Hello!" }));
            ws.onmessage = (e) => document.getElementById("output").innerText = e.data;
        }
    </script>
</body>
</html>
```

**Note**  
This authentication method is for browser-based clients where setting custom headers is not possible. For non-browser clients (Python, Node.js servers, etc.), use OAuth header authentication shown in [Python client with OAuth](#websocket-oauth-python).

**Note**  
Use `base64UrlBearerAuthorization` as the WebSocket subprotocol.

**Important**  
This is a reference example. It is not recommended to hardcode tokens in production code.

## Session management
<a name="websocket-session-management"></a>

Providing a `session_id` ( `X-Amzn-Bedrock-AgentCore-Runtime-Session-Id` ) on the WebSocket connection (as either a URL query parameter or request header) routes the connection to an isolated runtime session. The agent can access conversation context stored within that session, to implement continuity for a conversation by referencing previous interactions. Different session IDs access separate isolated contexts, ensuring complete isolation between users or conversations.

For comprehensive session lifecycle management including tracking, cleanup, and error handling, see [Use isolated sessions for agents](runtime-sessions.md).

### Using sessions with WebSocket connections
<a name="websocket-with-sessions"></a>

To use sessions with WebSocket connections, generate a unique session ID for each user or conversation and pass it when establishing the connection. A session ID must be at least 33 characters long. The following examples generate a UUID:

**Example**  

1. 

   ```
   from bedrock_agentcore.runtime import AgentCoreRuntimeClient
   import websockets
   import asyncio
   import json
   import os
   import uuid
   
   async def websocket_with_session():
       client = AgentCoreRuntimeClient(region="us-west-2")
       session_id = str(uuid.uuid4())
       runtime_arn = os.getenv('AGENT_ARN')
   
       ws_url, headers = client.generate_ws_connection(
           runtime_arn=runtime_arn,
           session_id=session_id
       )
   
       try:
           async with websockets.connect(ws_url, additional_headers=headers) as ws:
               await ws.send(json.dumps({"inputText": "Hello!"}))
               response = await ws.recv()
               print(f"Response: {response}")
       except websockets.exceptions.InvalidStatus as e:
           print(f"WebSocket handshake failed with status code: {e.response.status_code}")
           print(f"Response headers: {e.response.headers}")
           print(f"Response body: {e.response.body.decode()}")
       except Exception as e:
           print(f"Connection failed: {e}")
   
   asyncio.run(websocket_with_session())
   ```

1. 

   ```
   from bedrock_agentcore.runtime import AgentCoreRuntimeClient
   import websockets
   import asyncio
   import json
   import os
   import uuid
   
   async def websocket_with_session():
       client = AgentCoreRuntimeClient(region="us-west-2")
       session_id = str(uuid.uuid4())
       runtime_arn = os.getenv('AGENT_ARN')
   
       presigned_url = client.generate_presigned_url(
           runtime_arn=runtime_arn,
           session_id=session_id,
           expires=300
       )
   
       try:
           async with websockets.connect(presigned_url) as ws:
               await ws.send(json.dumps({"inputText": "Hello!"}))
               response = await ws.recv()
               print(f"Response: {response}")
       except websockets.exceptions.InvalidStatus as e:
           print(f"WebSocket handshake failed with status code: {e.response.status_code}")
           print(f"Response headers: {e.response.headers}")
           print(f"Response body: {e.response.body.decode()}")
       except Exception as e:
           print(f"Connection failed: {e}")
   
   asyncio.run(websocket_with_session())
   ```

1. 

   ```
   from bedrock_agentcore.runtime import AgentCoreRuntimeClient
   import websockets
   import asyncio
   import json
   import os
   import uuid
   
   async def websocket_with_session():
       client = AgentCoreRuntimeClient(region="us-west-2")
       session_id = str(uuid.uuid4())
       runtime_arn = os.getenv('AGENT_ARN')
       bearer_token = os.getenv('BEARER_TOKEN')
   
       ws_url, headers = client.generate_ws_connection_oauth(
           runtime_arn=runtime_arn,
           session_id=session_id,
           bearer_token=bearer_token
       )
   
       try:
           async with websockets.connect(ws_url, additional_headers=headers) as ws:
               await ws.send(json.dumps({"inputText": "Hello!"}))
               response = await ws.recv()
               print(f"Response: {response}")
       except websockets.exceptions.InvalidStatus as e:
           print(f"WebSocket handshake failed with status code: {e.response.status_code}")
           print(f"Response headers: {e.response.headers}")
           print(f"Response body: {e.response.body.decode()}")
       except Exception as e:
           print(f"Connection failed: {e}")
   
   asyncio.run(websocket_with_session())
   ```

**Tip**  
For best results, use a UUID or other unique identifier for your session IDs to avoid collisions between different users or conversations.

By using the same session ID for related WebSocket connections, you ensure that context is maintained across the same conversation, allowing your agent to provide coherent responses that build on previous interactions.

### Session lifecycle with WebSocket connections
<a name="websocket-session-lifecycle"></a>

For WebSocket connections, the session’s idle timeout is reset each time there is message activity between the client and agent. This includes any WebSocket message exchange such as sending data from client to agent, receiving responses from agent to client, or WebSocket ping/pong frames. This means that active WebSocket conversations will keep the session alive as long as messages continue to flow, preventing premature session termination during ongoing interactions.

For more information about configuring lifecycle settings, see [Configure Amazon Bedrock AgentCore lifecycle settings](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-lifecycle-settings.html) . For more direct control of session lifecycle through agent health status, see [Runtime session lifecycle management](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-long-run.html#runtime-long-run-session-lifecycle).

### Stop runtime session
<a name="websocket-stop-session"></a>

To stop a running session before the configurable `IdleRuntimeSessionTimeout` (defaulted at 15 minutes), see [Stop a running session](runtime-stop-session.md).

## Observability
<a name="websocket-observability"></a>

 [Amazon Bedrock AgentCore Observability](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability.html) helps you trace, debug, and monitor agents that you host in Amazon Bedrock AgentCore Runtime. First enable CloudWatch Transaction Search by following the instructions at [Enabling Amazon Bedrock AgentCore runtime observability](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-configure.html#observability-configure-builtin) . To observe your agent, see [View observability data for your Amazon Bedrock AgentCore agents](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-view.html).

For WebSocket connections, a trace represents the complete connection session rather than individual message exchanges.

## Custom Headers
<a name="websocket-custom-headers"></a>

Custom headers let you pass contextual information from your application directly to your agent code on the initial WebSocket connection. For complete information about custom header support, configuration, and limitations, see [Pass custom headers to Amazon Bedrock AgentCore Runtime](runtime-header-allowlist.md).

Additionally, headers prefixed with `X-Amzn-Bedrock-AgentCore-Runtime-Custom-` can be passed as URL query parameters in WebSocket connections.

For example, you can pass custom headers as query parameters in the WebSocket URL:

```
wss://bedrock-agentcore.<region>.amazonaws.com/runtimes/<agentRuntimeArn>/ws?X-Amzn-Bedrock-AgentCore-Runtime-Custom-TestHeader=query-param-test-value
```

The agent application container will receive these as headers:

```
"headers": {
    "x-amzn-bedrock-agentcore-runtime-custom-testheader": "query-param-test-value"
  }
```

## Appendix
<a name="websocket-appendix"></a>

**Topics**
+ [Security considerations](#security-considerations)
+ [Troubleshooting](#websocket-troubleshooting)
+ [WebSocket vs other protocols](#websocket-vs-other-protocols)
+ [Additional getting started examples](#websocket-additional-examples)

### Security considerations
<a name="security-considerations"></a>

**Tip**  
For a consolidated view of all Runtime security recommendations, see [Security best practices for AgentCore Runtime](runtime-security-best-practices.md).

Authentication  
All WebSocket connections require proper AWS authentication through SigV4 or OAuth 2.0

Session Isolation  
Each session runs in isolated execution environments with dedicated resources

Transport Security  
All connections use WSS (WebSocket Secure) over HTTPS for encrypted communication

Access Control  
IAM policies control WebSocket connection permissions and access to specific agents

### Troubleshooting
<a name="websocket-troubleshooting"></a>

#### Common WebSocket-specific issues
<a name="common-websocket-issues"></a>

The following are common issues you might encounter:

Connection failures  
Verify that your agent application processes connection requests at `/ws` 

Authentication method mismatch  
Ensure your client uses the same authentication method (OAuth or SigV4) that the agent was configured with

Connection closed due to limit exceeded  
Connections are automatically closed if limits are exceeded, such as message frame rate or message frame size limits. For complete limit information, see [Quotas for Amazon Bedrock AgentCore](bedrock-agentcore-limits.md) 

Message frame size exceeded  
Configure message frame fragmentation or implement chunking to stay below the 32KB frame size limit. Split large messages into smaller chunks before sending

Health check failures  
Ensure your agent container implements the `/ping` endpoint as specified in [HTTP protocol contract](runtime-http-protocol-contract.md) . This endpoint verifies that your agent is operational and ready to handle requests, enabling service monitoring and automated recovery

#### Error handling
<a name="websocket-error-handling"></a>

WebSocket errors surface in two phases, depending on when they occur.

 **Connection establishment (before the WebSocket upgrade)** 

Opening the connection is a standard HTTP request. The HTTP status code reflects the exception, and the `x-amzn-ErrorType` response header carries the exception name. The service can return any of the following errors before it establishes the WebSocket connection.


| HTTP Error Code | Runtime Exception (`x-amzn-ErrorType`) | Description | 
| --- | --- | --- | 
| 400 | ValidationException | Invalid request data or parameters | 
| 401 | UnauthorizedException | Authentication required or invalid credentials (OAuth-configured agents) | 
| 402 | ServiceQuotaExceededException | Request would exceed a service quota | 
| 403 | AccessDeniedException | Insufficient permissions for the requested operation | 
| 404 | ResourceNotFoundException | Requested resource does not exist | 
| 409 | ConflictException | Resource conflict - Resource already exists | 
| 409 | RetryableConflictException | Session operation in progress, please retry | 
| 424 | RuntimeClientError | Your agent’s container returned a 4xx or 5xx error - check your CloudWatch logs | 
| 429 | ThrottlingException | Too many requests - the request rate limit was exceeded | 
| 500 | InternalServerException | An unexpected error occurred while processing the request | 

**Note**  
The service returns `RetryableConflictException` (HTTP 409, `Session operation in progress, please retry`) when you open a WebSocket connection to a session that the service is provisioning or tearing down. This condition is transient and retryable. Retry with short exponential backoff. This applies to concurrent invokes targeting the same session. Already-running sessions are not affected.

 **Active connection (after the WebSocket upgrade)** 

Once the WebSocket is established, errors are communicated with standard WebSocket close codes rather than HTTP status codes. Common close codes include:
+  `1000` - Normal closure
+  `1001` - Going away
+  `1008` - Policy violated (limit exceeded)
+  `1009` - Message too big (message frame size limit exceeded)
+  `1011` - Server error

### WebSocket vs other protocols
<a name="websocket-vs-other-protocols"></a>

 **When to use WebSocket** :
+ Real-time voice conversations with immediate audio streaming for natural conversation flow
+ Bidirectional audio/text/binary data flow (streaming data chunks from client to agent and vice versa)
+ Interrupt handling (user can interrupt agent mid-conversation)

 **When to use HTTP** :
+ HTTP for request-response patterns without bidirectional streaming needs

### Additional getting started examples
<a name="websocket-additional-examples"></a>

For additional examples using WebSocket bidirectional streaming with AgentCore Runtime, see the [WebSocket bidirectional streaming GitHub samples](https://github.com/awslabs/amazon-bedrock-agentcore-samples/tree/main/01-features/02-host-your-agent/01-runtime/03-advanced/03-bidirectional-streaming) :
+  **Sonic implementation (Python)** : Native Amazon Nova Sonic WebSocket implementation with real-time audio conversations, voice selection, and interruption support
+  **Strands implementation (Python)** : Framework-based implementation using the Strands BidiAgent for simplified real-time audio conversations with automatic session management and tool integration
+  **Echo implementation (Python)** : Simple echo server for testing WebSocket connectivity and authentication