

# Interactive shells (terminals)
<a name="harness-command-shell"></a>

The `InvokeAgentRuntimeCommandShell` operation opens a persistent, interactive terminal inside a running AgentCore harness session over WebSocket. The API identifies this harness session with a runtime session ID. Unlike one-shot command execution, an interactive shell maintains its environment variables, working directory, command history, and running processes across inputs.

Use an interactive shell for debugging, iterative development, or long-running processes when you need to preserve shell state across commands.

For SigV4 and SigV4 pre-signed requests, the caller needs `bedrock-agentcore:InvokeAgentRuntimeCommandShell` permission on the harness. Bearer-token requests must satisfy the harness inbound authorizer instead.

## How it works
<a name="harness-command-shell-how-it-works"></a>

 `InvokeAgentRuntimeCommandShell` establishes a WebSocket connection to an interactive shell process in the microVM that runs your harness session. The connection uses binary frames to stream terminal input and output in both directions.

If the harness uses the default environment, the shell runs in the managed harness environment. If the harness uses a custom container, the shell runs in that container. Harness interactive terminals run Bash.

The connection supports:


| Feature | Description | 
| --- | --- | 
| Persistent state | Environment variables, working directory, command history, and running processes persist within the same shell. | 
| Reconnection | Provide the same runtime session ID and `shellId` to reconnect to a detached shell. The service replays up to 256 KB of buffered output. | 
| Multiple concurrent shells | Open up to 10 active shell sessions on one harness session. Detached shells don’t count toward this limit. Each shell has an independent terminal process and shares the session filesystem. | 

## Prerequisites
<a name="harness-command-shell-prerequisites"></a>

Before you connect to an interactive shell, make sure that you have the following:
+ A harness in `READY` state
+ Authorization for the selected authentication method: `bedrock-agentcore:InvokeAgentRuntimeCommandShell` IAM permission for SigV4, or a bearer token accepted by the harness inbound authorizer
+ A WebSocket client that supports binary frames and either request headers or pre-signed URLs
+ For a custom container, Bash installed at `/bin/bash` 

For more information about the complete harness permissions model, see [Required IAM permissions for callers](harness-security.md#harness-iam-permissions).

## Open a Harness shell with the AgentCore CLI
<a name="harness-command-shell-cli"></a>

Use the Harness ID, not its managed Runtime ID. This resource command does not require an AgentCore project:

```
agentcore harness shell --id <harness-id>
```

Without `--qualifier`, the CLI prompts you to choose an endpoint. To select an endpoint and an existing Harness session directly:

```
agentcore harness shell \
  --id <harness-id> \
  --qualifier DEFAULT \
  --session-id <runtime-session-id> \
  --region us-west-2
```

The CLI signs IAM-authorized requests with your AWS credentials. For a Harness configured with `CUSTOM_JWT`, supply a token accepted by its inbound authorizer:

```
agentcore harness shell \
  --id <harness-id> \
  --qualifier DEFAULT \
  --bearer-token file://token.txt
```

After connecting, the CLI prints the runtime session ID, shell ID, and a complete reconnect command. Press `Ctrl+]` to detach the local terminal while keeping the remote shell running:

```
Connected
Session ID: <runtime-session-id>
Shell ID: <shell-id>
Ctrl+D or 'exit' to close · Ctrl+] to detach
To reconnect: agentcore harness shell --id <harness-id> --qualifier DEFAULT --session-id <runtime-session-id> --shell-id <shell-id> --region us-west-2
```

Run the printed command to reconnect to the same Harness shell:

```
agentcore harness shell \
  --id <harness-id> \
  --qualifier DEFAULT \
  --session-id <runtime-session-id> \
  --shell-id <shell-id> \
  --region us-west-2
```

The `--shell-id` option requires `--session-id`. For a CUSTOM\_JWT harness, pass `--bearer-token` again when reconnecting. The CLI does not include secrets in the printed command.

The command requires an interactive terminal on stdin and stdout and does not support `--json`, stdin bearer tokens, or custom endpoint URLs. Enter `exit` or press Ctrl\+D to close the remote shell permanently. Press `Ctrl+]` to detach and reconnect later. The CLI waits for initialization before handing control to your terminal.

## Connect through the WebSocket API
<a name="harness-command-shell-connect"></a>

Open a WebSocket connection to the following URL:

```
wss://bedrock-agentcore.<region>.amazonaws.com/runtimes/<url-encoded-harness-arn>/ws/shells
```

Use the harness ARN, not the ARN of its managed Runtime. URL-encode the complete harness ARN before putting it in the path. A harness ARN has the following format:

```
arn:aws:bedrock-agentcore:<region>:<accountId>:harness/<harnessId>
```

Send the following values with the WebSocket upgrade request:


| Value | Required | Description | 
| --- | --- | --- | 
| Authentication | Yes | Sign the request with Signature Version 4 (SigV4), use a SigV4 pre-signed URL, or send the bearer token configured by the harness inbound authorizer in the `Authorization` header. The SigV4 service name is `bedrock-agentcore`. | 
|  `X-Amzn-Bedrock-AgentCore-Runtime-Session-Id` header or query parameter | No | Targets an existing harness session or creates one with the supplied ID. The value must contain at least 33 characters. If you omit it, the service creates a runtime session ID and returns it in the response. | 
|  `Sec-WebSocket-Protocol`  | No | For SigV4 connections, optionally offer `v1.command.agentcore.aws.dev` to identify the command-shell binary protocol. Bearer-token connections use the authentication subprotocols described after this table instead. | 
|  `shellId` query parameter | No | Reconnects to an existing shell. Use it with the same runtime session ID that created the shell. | 

For a browser client that cannot set an `Authorization` header, base64url-encode the bearer token and offer both `base64UrlBearerAuthorization.<encoded-token>` and the `base64UrlBearerAuthorization` sentinel through `Sec-WebSocket-Protocol`. Do not also offer `v1.command.agentcore.aws.dev` on a bearer-token connection.

The `101 Switching Protocols` response returns the runtime session ID and shell ID in the `X-Amzn-Bedrock-AgentCore-Runtime-Session-Id` and `X-Amzn-Bedrock-AgentCore-Shell-Id` headers. Clients that cannot read WebSocket upgrade response headers can read the shell ID from the first `STATUS` frame. The frame doesn’t contain the runtime session ID, so these clients must generate and retain a runtime session ID before connecting. When you create a pre-signed URL, include the runtime session ID as a query parameter before signing the URL.

The WebSocket upgrade timeout applies only until the service returns `101 Switching Protocols`. Shell and custom-container initialization can continue after the upgrade. Wait for the initial `STATUS` frame before treating the shell as ready, apply a separate application timeout while waiting, and handle close code `1011` as a shell initialization or server failure.

The following Python example uses a generic WebSocket client and `botocore` only to sign the upgrade request. It doesn’t use an AgentCore SDK shell helper.

```
pip install "boto3>=1.34" "websockets>=15"
```

```
import asyncio
import json
import urllib.parse
import uuid

import botocore.session
import websockets
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
from websockets.exceptions import ConnectionClosed


REGION = "us-west-2"
HARNESS_ARN = (
    "arn:aws:bedrock-agentcore:us-west-2:123456789012:"
    "harness/MyHarness-a1b2c3d4e5"
)
SESSION_ID = str(uuid.uuid4())  # 36 characters


def signed_headers(url):
    request = AWSRequest(
        method="GET",
        url=url,
        headers={
            "X-Amzn-Bedrock-AgentCore-Runtime-Session-Id": SESSION_ID,
        },
    )
    credentials = botocore.session.Session().get_credentials()
    SigV4Auth(credentials, "bedrock-agentcore", REGION).add_auth(request)
    return dict(request.headers)


async def wait_for_initial_status(websocket):
    while True:
        frame = await websocket.recv()
        if isinstance(frame, str) or not frame:
            continue
        channel, payload = frame[0], frame[1:]
        if channel in (0x01, 0x02):
            print(payload.decode("utf-8", errors="replace"), end="")
        elif channel == 0x03:
            status = json.loads(payload)
            shell_id = status.get("metadata", {}).get("shellId")
            if status.get("status") != "Success" or not shell_id:
                raise RuntimeError(f"Shell initialization failed: {status}")
            return shell_id


async def main():
    encoded_arn = urllib.parse.quote(HARNESS_ARN, safe="")
    host = f"bedrock-agentcore.{REGION}.amazonaws.com"
    path = f"/runtimes/{encoded_arn}/ws/shells"
    https_url = f"https://{host}{path}"
    websocket_url = f"wss://{host}{path}"

    async with websockets.connect(
        websocket_url,
        additional_headers=signed_headers(https_url),
        open_timeout=330,
    ) as websocket:
        try:
            shell_id = await asyncio.wait_for(
                wait_for_initial_status(websocket), timeout=330
            )
        except asyncio.TimeoutError as exc:
            raise RuntimeError("Timed out waiting for shell initialization") from exc
        except ConnectionClosed as exc:
            raise RuntimeError("Shell closed before initialization completed") from exc
        print(f"Connected to shell {shell_id}")

        # Channel 0x00 carries terminal input.
        await websocket.send(b"\x00echo 'Hello from my harness'\n")
        await websocket.send(b"\x00exit\n")

        async for frame in websocket:
            if isinstance(frame, str) or not frame:
                continue

            channel, payload = frame[0], frame[1:]
            if channel == 0x01:  # PTY output (command stdout and stderr)
                print(payload.decode("utf-8", errors="replace"), end="")
            elif channel == 0x02:  # Service or platform diagnostics
                print(payload.decode("utf-8", errors="replace"), end="")
            elif channel == 0x03:  # STATUS
                status = json.loads(payload)
                shell_id = status.get("metadata", {}).get("shellId", shell_id)
                print(f"\nStatus: {status}")


asyncio.run(main())
```

This IAM example, like the AgentCore CLI client, uses signed headers without offering a WebSocket subprotocol. It waits for a successful initialization `STATUS` with a shell ID before sending terminal input.

## Binary frame protocol
<a name="harness-command-shell-protocol"></a>

Every application-level message is a binary WebSocket frame. The first byte identifies the channel, and the remaining bytes are the payload.


| Channel | Direction | Payload | 
| --- | --- | --- | 
|  `0x00` - STDIN | Client to service | Raw terminal input. | 
|  `0x01` - STDOUT | Service to client | Raw PTY output. The PTY combines command stdout and stderr on this channel. | 
|  `0x02` - STDERR | Service to client | Service or platform diagnostics. Command stderr is part of the `0x01` PTY output. | 
|  `0x03` - STATUS | Service to client | UTF-8 JSON containing connection metadata or the shell exit status. | 
|  `0x04` - RESIZE | Client to service | UTF-8 JSON in the form `{"width":120,"height":40}`. Each dimension must be from 1 through 1,000. | 
|  `0x05` - HEARTBEAT | Both directions | Optional application heartbeat. The service echoes the payload. WebSocket ping frames are also supported. | 
|  `0xFF` - CLOSE | Both directions | Ends the shell session. | 

Text frames aren’t part of the protocol. The service ignores isolated text frames and closes the connection with code `1003` after five consecutive text frames.

The first `STATUS` frame confirms the connection and includes metadata similar to the following:

```
{
  "kind": "Status",
  "apiVersion": "v1",
  "metadata": {
    "shellId": "my-shell",
    "reconnected": false
  },
  "status": "Success"
}
```

When the shell exits with a nonzero status, the final `STATUS` frame includes an `ExitCode` cause in `details.causes`.

## Reconnect to a shell
<a name="harness-command-shell-reconnect"></a>

Store both the runtime session ID and the shell ID. To reconnect, use the same runtime session ID header and add the URL-encoded shell ID as a query parameter:

```
wss://bedrock-agentcore.<region>.amazonaws.com/runtimes/<url-encoded-harness-arn>/ws/shells?shellId=<shell-id>
```

The shell process continues running while the connection is detached. On reconnection, the service replays up to 256 KB of buffered output. The connection `STATUS` frame sets `metadata.reconnected` to `true` and includes `metadata.bytesDropped` if the detached shell produced more output than the replay buffer could retain.

Opening another connection with the same shell ID replaces the existing connection. The replaced client receives close code `4000`.

## Common use cases
<a name="harness-command-shell-use-cases"></a>

Interactive shells support the following use cases:

Interactive debugging  
Inspect installed packages, files, processes, and environment configuration in the same environment as the harness agent.

Custom environment validation  
For a harness with a custom container, verify installed dependencies and filesystem mounts from inside that container.

Coding agent terminal access  
Provide a persistent execution environment for coding agents that need to create files, run tests, inspect output, and iterate.

Long-running processes  
Start a process, detach from the WebSocket, and reconnect later to check progress or provide input.

## Security considerations
<a name="harness-command-shell-security"></a>

**Important**  
A principal that can open a Harness shell has interactive command access to the harness session. Restrict `bedrock-agentcore:InvokeAgentRuntimeCommandShell` to trusted principals and specific harness ARNs.

The shell can access customer-provided data, files, and secrets in the selected environment or on mounted filesystems. It can also connect to network destinations that the session can reach. The shell environment uses an allowlist and doesn’t inject AgentCore platform or workload credentials. The shell remains inside the session’s isolated microVM and cannot access another customer’s workload.

AgentCore sends the request ID and connection metadata to the harness Runtime log group in Amazon CloudWatch Logs. The service doesn’t log terminal input or output.

 AWS CloudTrail records `InvokeAgentRuntimeCommandShell` API calls, including the caller identity, timestamp, source IP address, resolved Runtime resource, and response status. CloudTrail doesn’t log terminal input or output.

For more Harness security guidance, see [Security and access controls](harness-security.md).

## Error handling
<a name="harness-command-shell-errors"></a>

The WebSocket upgrade can return the following errors:

 **ValidationException**   
The request parameters are invalid. Verify that the runtime session ID contains at least 33 characters, the shell ID is valid, and the feature is available in the target Region. Use the URL-encoded harness ARN in the request path; direct use of the managed Runtime ARN is rejected.

 **AccessDeniedException**   
The caller doesn’t have `bedrock-agentcore:InvokeAgentRuntimeCommandShell` permission on the harness.

 **ResourceNotFoundException**   
The specified harness doesn’t exist. Verify that the URL contains the URL-encoded harness ARN.

 **ServiceQuotaExceededException (429)**   
The maximum of 10 active shells is already open. End an active shell or detach it, and then retry.

 **RuntimeClientError (424)**   
The runtime couldn’t be reached.

 **ThrottlingException**   
The request exceeded the API rate limit. Retry with exponential backoff.

 **RetryableConflictException (409)**   
The service is provisioning or tearing down the target session. Retry with short exponential backoff.

Once connected, the following close codes indicate why the connection ended:


| Code | Meaning | Client action | 
| --- | --- | --- | 
|  `1000`  | The shell exited cleanly. | Treat as normal termination. | 
|  `1003`  | The client sent five consecutive text frames to the binary-only protocol. | Switch to binary frames. Don’t automatically reconnect with the same behavior. | 
|  `1006`  | The connection ended without a close frame because of a network failure or service interruption. | Reconnect with the stored shell ID. | 
|  `1008`  | The one-hour connection duration expired, the frame rate exceeded 250 frames per second, or the write buffer overflowed. | Reconnect for duration expiry. For rate or buffer violations, back off before reconnecting. | 
|  `1009`  | A frame payload exceeded 64 KB. | Split the payload into frames smaller than 64 KB, then reconnect. | 
|  `1011`  | An unexpected server failure occurred. | Retry with exponential backoff. | 
|  `4000`  | Another client connected with the same shell ID. | Don’t automatically reconnect. Inform the user that another client attached to the shell. | 

## Best practices
<a name="harness-command-shell-best-practices"></a>

Follow these best practices when you use interactive shells:
+ Generate and retain a unique shell ID for each logical terminal.
+ Retain the runtime session ID with the shell ID. Both values are required for reconnection.
+ Read output promptly so that the connection write buffer doesn’t fill.
+ Split large input into binary frames smaller than 64 KB.
+ Reconnect before or after the one-hour connection limit if the shell must remain available longer.
+ End shells explicitly when they are no longer needed. Detached shells don’t count toward the 10-active-shell limit. The service retains at most 20 active and detached shell entries and evicts the oldest detached shell when necessary.
+ Use an upgrade timeout of at least 330 seconds when a connection can start a cold harness session. Apply a separate timeout while waiting for the initial `STATUS` frame after the upgrade.

## Quotas and limits
<a name="harness-command-shell-limits"></a>


| Limit | Value | Description | 
| --- | --- | --- | 
| Maximum frame payload | 64 KB | Larger frames result in close code `1009`. | 
| Frame rate | 250 frames per second | Exceeding the limit results in close code `1008`. | 
| Maximum connection duration | 1 hour | Reconnect with the same runtime session ID and shell ID to continue. | 
| Concurrent active shells per harness session | 10 | New connections are rejected when 10 shells are active. Detached shells don’t count toward this limit. | 
| Retained active and detached shell entries | 20 | When the limit is reached, the service evicts the oldest detached shell before creating another shell. | 
| Reconnection buffer | 256 KB | Maximum output replayed after reconnection. | 

For complete service limits, see [Quotas for Amazon Bedrock AgentCore](bedrock-agentcore-limits.md).

## Related topics
<a name="_related_topics"></a>
+  [Environment and filesystem](harness-environment.md) - configure the default environment or a custom container
+  [Security and access controls](harness-security.md) - control access to the harness and its execution environment
+  [Observability and cost controls](harness-operations.md) - monitor Harness activity and costs
+  [Interactive shells for AgentCore Runtime](runtime-get-started-command-shell.md) 