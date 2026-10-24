

# Interactive Shells (Terminals)
<a name="runtime-get-started-command-shell"></a>

The `InvokeAgentRuntimeCommandShell` operation opens a persistent, interactive terminal session inside a running AgentCore Runtime session over WebSocket. Unlike one-shot command execution, shell sessions maintain state — environment variables, working directory, and command history carry across inputs. This enables debugging, environment inspection, and building terminal experiences in your application.

To call `InvokeAgentRuntimeCommandShell`, you need `bedrock-agentcore:InvokeAgentRuntimeCommandShell` permissions.

## How it works
<a name="runtime-command-shell-how-it-works"></a>

 `InvokeAgentRuntimeCommandShell` establishes a WebSocket connection to an interactive shell process running inside your agent’s session. The connection uses binary frames to stream terminal input and output in both directions.

 **Same agent, same session** 

 `InvokeAgentRuntimeCommandShell` operates on the same agent runtime as `InvokeAgentRuntime` and `InvokeAgentRuntimeCommand`. You don’t create separate resources. The agent you deployed with `CreateAgentRuntime` accepts shell connections on any active session.

**Note**  
You can pass a `session_id` to target a specific runtime session. If omitted, a new session is created for each connection. To use reconnection, you must store and reuse both `session_id` and `shellId`.

The connection supports:


| Feature | Description | 
| --- | --- | 
| Persistent state | Environment variables, working directory, and command history carry across inputs within the same session. | 
| Reconnection | Provide the same `session_id` and `shellId` to reconnect to the same shell after a disconnect. The service replays up to 256 KB of buffered output. | 
| Multiple concurrent shells | Up to 10 active shell sessions (terminals) per runtime. New connections are rejected when at capacity. | 

## Prerequisites
<a name="runtime-command-shell-prerequisites"></a>
+  `bedrock-agentcore:InvokeAgentRuntimeCommandShell` IAM permission
+ A valid AgentCore Runtime endpoint ARN with a runtime in READY state

**Note**  
Agents created after June 5, 2026 support interactive shells (terminals) automatically. If you deployed your agent before this date, you must redeploy it to update the agent runtime.

## Using the AgentCore CLI
<a name="runtime-command-shell-cli"></a>

For installation and setup instructions, see [Get started with the AgentCore CLI](runtime-get-started-cli.md).

The CLI provides a built-in interactive terminal experience. Pass a Runtime ID, not a Runtime ARN. For a Runtime in an AgentCore project, the Runtime ID is the last segment of the Runtime `arn` in the output of `agentcore status --json`:

For an environment managed by a Harness, use `agentcore harness shell --id <harness-id>` instead of the managed Runtime’s ID. See [Open a Harness shell with the AgentCore CLI](harness-command-shell.md#harness-command-shell-cli).

```
agentcore runtime shell --id <runtime-id>
```

Without `--qualifier`, the CLI prompts you to choose an endpoint. To select an endpoint directly:

```
agentcore runtime shell \
  --id <runtime-id> \
  --qualifier DEFAULT \
  --region us-west-2
```

Use `--session-id` to open the shell in a specific Runtime session:

```
agentcore runtime shell \
  --id <runtime-id> \
  --qualifier DEFAULT \
  --session-id <runtime-session-id>
```

After connecting, the CLI prints the Runtime session ID, shell ID, and a complete reconnect command. Press `Ctrl+]` to detach the local terminal while keeping the remote shell running:

```
Connected
Session ID: <runtime-session-id>
Shell ID: <shell-id>
Ctrl+D or 'exit' to close · Ctrl+] to detach
To reconnect: agentcore runtime shell --id <runtime-id> --qualifier DEFAULT --session-id <runtime-session-id> --shell-id <shell-id> --region us-west-2
```

Run the printed command to reconnect to the same shell. When constructing the command yourself, `--shell-id` requires `--session-id`:

```
agentcore runtime shell \
  --id <runtime-id> \
  --qualifier DEFAULT \
  --session-id <runtime-session-id> \
  --shell-id <shell-id> \
  --region us-west-2
```

For a Runtime configured with CUSTOM\_JWT authorization, also pass its bearer token:

```
agentcore runtime shell \
  --id <runtime-id> \
  --qualifier DEFAULT \
  --bearer-token file://token.txt
```

The reconnect command never includes a bearer token. Pass `--bearer-token` again when reconnecting to a CUSTOM\_JWT Runtime.

Enter `exit` or press `Ctrl+D` to close the remote shell permanently. Press `Ctrl+]` when you want to detach and reconnect later.

To run a single command without opening a shell, use `agentcore runtime exec`:

```
agentcore runtime exec \
  --id <runtime-id> \
  --command "ls -la /tmp"
```

For additional CLI examples, see [AgentCore samples](https://github.com/awslabs/agentcore-samples) on GitHub.

## Using the AgentCore SDK
<a name="runtime-command-shell-sdk"></a>

Install the Python SDK:

```
pip install bedrock-agentcore
```

**Example**  

1. The following example shows how to open a shell session using default AWS credentials.

   ```
   import asyncio
   from bedrock_agentcore.runtime import AgentCoreRuntimeClient, ShellChannel
   
   async def main():
       runtime_arn = "arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent"
       client = AgentCoreRuntimeClient(region="us-west-2")
   
       async with client.open_shell(runtime_arn) as shell:
           print(f"Connected. Shell ID: {shell.shell_id}")
   
           # Send a command
           await shell.send("echo Hello from AgentCore Shell\n")
   
           # Read output frames
           async for frame in shell:
               if frame.channel == ShellChannel.STDOUT:
                   print(frame.text, end="")
                   if "Hello from AgentCore Shell" in frame.text:
                       break
   
   asyncio.run(main())
   ```

1. The following example shows how to open a shell session using a pre-signed URL.

   ```
   import asyncio
   from bedrock_agentcore.runtime import AgentCoreRuntimeClient, PresignedAuth, ShellChannel
   
   async def main():
       runtime_arn = "arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent"
       client = AgentCoreRuntimeClient(region="us-west-2")
   
       async with client.open_shell(runtime_arn, auth=PresignedAuth(expires=120)) as shell:
           await shell.send("whoami\n")
   
           async for frame in shell:
               if frame.channel == ShellChannel.STDOUT:
                   print(frame.text, end="")
                   break
   
   asyncio.run(main())
   ```

1. The following example shows how to open a shell session using an OAuth bearer token.

   ```
   import asyncio
   from bedrock_agentcore.runtime import AgentCoreRuntimeClient, OAuthAuth, ShellChannel
   
   async def main():
       runtime_arn = "arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent"
       bearer_token = "your_oauth_token_here"
       client = AgentCoreRuntimeClient(region="us-west-2")
   
       async with client.open_shell(runtime_arn, auth=OAuthAuth(bearer_token=bearer_token)) as shell:
           await shell.send("echo oauth-connected\n")
   
           async for frame in shell:
               if frame.channel == ShellChannel.STDOUT:
                   print(frame.text, end="")
                   if "oauth-connected" in frame.text:
                       break
   
   asyncio.run(main())
   ```

 **Reconnection** 

A common pattern is to use `shellId` to reconnect to a shell after a disconnect, preserving all session state.

```
import asyncio

from bedrock_agentcore.runtime import AgentCoreRuntimeClient

async def main():
    client = AgentCoreRuntimeClient(region="us-west-2")
    runtime_arn = "arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent"
    session_id = "my-session-0000000000000000000000"
    shell_id = "my-shell"

    shell = await client.open_shell(
        runtime_arn,
        session_id=session_id,
        shell_id=shell_id,
    ).__aenter__()
    print(f"connected (reconnected={shell.reconnected})")
    await shell.send("export GREETING='hello'\n")
    await asyncio.sleep(1)

    async with client.open_shell(
        runtime_arn,
        session_id=session_id,
        shell_id=shell_id,
    ) as shell2:
        print(f"reconnected (reconnected={shell2.reconnected})")
        assert shell2.reconnected


if __name__ == "__main__":
    asyncio.run(main())
```

 **Auto-reconnect** 

The SDK can also automatically reconnect when the WebSocket connection drops. Use `ReconnectConfig` to enable this:

```
import asyncio
from bedrock_agentcore.runtime import AgentCoreRuntimeClient, ReconnectConfig, ShellChannel

async def on_reconnect():
    print("Reconnected")

async def main():
    runtime_arn = "arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent"
    shell_id = "my-persistent-shell"
    config = ReconnectConfig(max_retries=5, base_delay=0.5, on_reconnect=on_reconnect)

    client = AgentCoreRuntimeClient(region="us-west-2")
    async with client.open_shell(runtime_arn, shell_id=shell_id, reconnect_config=config) as shell:
        # If the connection drops, the SDK retries automatically
        await shell.send("long-running-command\n")
        async for frame in shell:
            if frame.channel == ShellChannel.STDOUT:
                print(frame.text, end="")

asyncio.run(main())
```

For additional SDK examples, see [AgentCore samples](https://github.com/awslabs/agentcore-samples) on GitHub.

## Common use cases
<a name="runtime-command-shell-use-cases"></a>

Interactive debugging  
Open a shell to inspect your agent’s runtime environment — check installed packages, read log files, examine the filesystem, or test commands before adding them to your agent code.  

```
python --version && pip list | head -20
```

Environment inspection  
Verify environment variables, network connectivity, available tools, and filesystem state. Useful when diagnosing agent failures or validating deployment configuration.  

```
env | grep AWS && curl -s http://169.254.169.254/latest/meta-data/
```

Coding agent terminal access  
AI coding agents use interactive shells (terminals) as their execution environment. When a coding agent needs to run code, install packages, or run tests, it opens a shell session to the AgentCore Runtime and executes commands directly — the same way a developer would use a terminal. For example, Claude Code, Amazon Kiro, and OpenAI Codex each connect to a shell session where they can iteratively write code, run it, observe output, and fix errors in a loop. The persistent state means the agent can run a sequence of commands without losing context between steps.  

```
# A coding agent opens a shell and iterates on code
async with client.open_shell(runtime_arn, shell_id="agent-workspace") as shell:
    await shell.send("cd /workspace && git clone https://github.com/user/repo.git\n")
    await shell.send("cd repo && pip install -r requirements.txt\n")
    await shell.send("python -m pytest tests/ -v\n")
    # Agent reads test output, fixes failures, re-runs — all in the same shell
```

Long-running processes  
Start processes that outlive a single HTTP request. Use reconnection to check on progress or provide additional input over time.  

```
nohup python train.py > /tmp/train.log 2>&1 &
```

## Key design choices
<a name="runtime-command-shell-design"></a>

Persistent interactive sessions  
Each connection maps to a long-lived shell process. You can send multiple commands without re-establishing the connection, and state accumulated by earlier commands (exported variables, `cd` changes) is available to later ones.

Binary framing over WebSocket  
Terminal I/O is streamed as binary WebSocket frames. This supports raw terminal control sequences, colors, cursor movement, and full-screen applications without encoding overhead.

Reconnection with output replay  
When you reconnect using the same `shellId`, the service replays up to 256 KB of recent output. This lets you recover from network interruptions without losing context. The shell process continues running during disconnection.

Session limit  
When 10 shell sessions (terminals) are already open on a runtime, new connections are rejected with an error. You must close an existing session before opening a new one.

## Security considerations
<a name="runtime-command-shell-security"></a>

**Tip**  
For a consolidated view of all Runtime security recommendations, see [Security best practices for AgentCore Runtime](runtime-security-best-practices.md).

**Important**  
Under the AWS shared responsibility model, you are responsible for the commands you run in your AgentCore Runtime sessions. AWS provides the secure infrastructure and isolation at the microVM level. You are responsible for the commands you execute, the data you process, and the access controls you configure.

The security boundary for shell sessions (terminals) is the microVM. Each AgentCore Runtime session runs in an isolated microVM with its own kernel, memory, and filesystem. Shell sessions cannot access other customers' workloads or escape the VM boundary. However, within your VM, shell commands have full access to the container filesystem and any credentials or secrets you have configured.

 **Auditing with CloudWatch Logs** 

AgentCore Runtime sends the request ID and connection metadata to your agent’s Amazon CloudWatch Logs log group. You can use these logs to monitor shell connection activity and maintain an audit trail. Terminal I/O content (stdin/stdout) is streamed to your client and is not logged by the service.

 **Auditing with CloudTrail** 

 AWS CloudTrail records `InvokeAgentRuntimeCommandShell` API calls in your account. Each record includes metadata such as the caller identity, timestamp, source IP address, and response status. CloudTrail does not log the request or response payload. Use CloudTrail to audit who opened shell sessions and when, then correlate with CloudWatch Logs using the request ID for connection details.

For sensitive workloads, consider implementing additional controls such as:
+ Using IAM policies to restrict which principals can call `InvokeAgentRuntimeCommandShell` 
+ Configuring VPC endpoints to keep traffic within your network
+ Setting up CloudWatch Logs metric filters and alarms to detect unexpected connection patterns
+ Reviewing CloudTrail logs regularly for unauthorized access attempts

## Error handling
<a name="runtime-command-shell-error-handling"></a>

When establishing a shell session connection, you might encounter the following errors during the WebSocket upgrade:

If the CLI reports `Server rejected WebSocket connection: HTTP 400` and the Runtime is managed by a Harness, use the Harness shell command with the Harness ID. Other HTTP 400 responses can have different causes; verify the resource and request rather than assuming every rejection identifies a Harness.

 **ValidationException**   
Occurs when the request parameters are invalid. This can happen if the session ID is less than 33 characters, the feature is not enabled in the target region, or the agent is not in READY state.

 **AccessDeniedException**   
Occurs when you don’t have the necessary permissions. Ensure that your IAM policy includes the `bedrock-agentcore:InvokeAgentRuntimeCommandShell` permission.

 **ResourceNotFoundException**   
Occurs when the specified agent runtime cannot be found. Verify that the runtime ARN is correct.

 **RuntimeClientError (424)**   
Occurs in several scenarios: (1) Maximum concurrent shell sessions (terminals) reached (10 open) — close an existing session and retry. (2) Shell ID format invalid — must be 1-128 alphanumeric characters, underscores, or hyphens. (3) Runtime unreachable — retry after backoff. Parse the response body JSON `error` field to distinguish causes.

 **ThrottlingException**   
Occurs when you exceed the API rate limit. Implement exponential backoff and retry logic.

 **ConflictException**   
Another connection is claiming the same `shellId` simultaneously. Retry after 1 second. This is a narrow race condition (not a persistent state) and resolves immediately on retry.

 **RetryableConflictException (409)**   
Occurs when you open a shell session connection while the service is provisioning or tearing down the target session. The message is `Session operation in progress, please retry`. This condition is transient and retryable. The window is brief and already-running sessions are not affected. Retry with short exponential backoff. Because `InvokeAgentRuntimeCommandShell` is a WebSocket API, the AWS SDKs do not auto-retry it. Retry it yourself.

Once connected, the following close codes indicate why a connection was terminated:


| Code | Meaning | Client Action | 
| --- | --- | --- | 
|  `1000`  | Normal closure — shell exited cleanly or graceful disconnect | Display "disconnected". Normal termination. | 
|  `1001`  | Going away — server deploying or shutting down | Auto-reconnect with stored `shellId`. | 
|  `1003`  | Unsupported data — sent after 5 consecutive text frames (binary only protocol) | Do NOT auto-reconnect. Switch to binary frames. | 
|  `1006`  | Abnormal closure — synthesized locally when no close frame is received (network death, TCP RST) | Auto-reconnect with stored `shellId`. | 
|  `1008`  | Policy violation — connection TTL expired (1 hour), frame rate limit exceeded (250 frames/sec), or write buffer overflow | Auto-reconnect for TTL expiration (fresh TTL on reconnect). For rate limit: back off, then reconnect. | 
|  `1009`  | Message too big — frame payload exceeded 64 KB | Reduce frame size (chunk to <64 KB), then reconnect. Session is still alive. | 
|  `1011`  | Server error — unexpected internal failure | Retry with backoff. | 
|  `4000`  | Replaced — another client connected with the same `shellId`  | Do NOT auto-reconnect. Display "session attached from another client". | 

## Best practices
<a name="runtime-command-shell-best-practices"></a>

Follow these best practices when using `InvokeAgentRuntimeCommandShell`:
+ Use a unique `shellId` (such as a UUID) for each logical session to enable reconnection. Store the `shellId` on the client side.
+ Use `ReconnectConfig` in the SDK to automatically handle transient network interruptions without manual reconnection logic.
+ Read output frames promptly. If the client falls behind, the server’s write buffer fills and the connection closes with code `1008`.
+ For large input (such as pasting a file), split the content into chunks under 64 KB per frame to avoid close code `1009`.
+ Set appropriate connection timeouts. The maximum connection duration is 1 hour — reconnect with the same `shellId` to continue beyond that.
+ Close sessions explicitly when done. Detached sessions count toward the 10-session limit.

## Quotas and limits
<a name="runtime-command-shell-limits"></a>


| Limit | Value | Description | 
| --- | --- | --- | 
| Maximum frame payload size | 64 KB | Frames exceeding this limit result in close code `1009`. | 
| Frame rate | 250 frames/sec | Exceeding this triggers close code `1008`. | 
| Maximum connection duration | 1 hour | The connection closes with code `1008`. Reconnect using the same `shellId` to continue. | 
| Concurrent shell sessions (terminals) per runtime | 10 | New connections are rejected if 10 sessions are already open. Close an existing session and retry. | 
| Reconnection buffer | 256 KB | Maximum output replayed when reconnecting to a shell. | 

For complete service limits, see [Quotas for Amazon Bedrock AgentCore](bedrock-agentcore-limits.md).