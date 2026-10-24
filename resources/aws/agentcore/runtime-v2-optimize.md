

# Optimize your agent for Amazon Bedrock AgentCore Runtime V2
<a name="runtime-v2-optimize"></a>

Amazon Bedrock AgentCore Runtime V2 starts your agent by restoring a snapshot. This changes how you structure your agent code. Work that your agent does at startup is captured in the snapshot and shared by every restored instance. Produce any value that must differ between requests, or that can expire, in your request handler instead. This topic describes how to structure your agent around startup work and per-request work so that it stays correct after each restore. For an overview of platform version V2, see [Platform versions](runtime-how-it-works.md#runtime-platform-versions).

Your agent has two execution contexts:

Startup  
Code that runs once as your process starts, before AgentCore Runtime takes the snapshot. AgentCore Runtime captures this code in the snapshot, and every instance inherits its results.

Request handling  
The code in your `/invocations` handler. This code runs on every request on every instance.

Use one rule to decide where code belongs. Compute a value at startup if it stays the same for the life of the snapshot. Compute it in your handler if it varies per request or can expire. AgentCore Runtime takes one snapshot per agent version and uses it until you create or update the agent, so the life of the snapshot is the life of that version.

## Initialize once at startup
<a name="_initialize_once_at_startup"></a>

Do expensive, reusable work as your process starts, before the snapshot. For example, import dependencies, load model weights, or read static configuration from your deployment bundle. With the AgentCore SDK, do this work at module scope, before you call `app.run()`. Your agent does not listen on port 8080 until `app.run()` runs, so no `/ping` can succeed and no snapshot can be taken until your startup work finishes. The snapshot captures a fully initialized agent by construction, and you do not need to gate `/ping`. Complete initialization within 120 seconds of startup. If your agent does not become healthy in time, the runtime fails its health check. For more information about the `/ping` and `/invocations` endpoints, see [Understand the AgentCore Runtime service contract](runtime-service-contract.md).

```
import json, pathlib

from bedrock_agentcore.runtime import BedrockAgentCoreApp

# Runs once at import, before app.run() starts the server and before the
# snapshot. Every restored instance inherits these objects.
MODEL = load_model_weights()
SETTINGS = json.loads((pathlib.Path(__file__).parent / "agent.json").read_text())

app = BedrockAgentCoreApp()

@app.entrypoint
def invoke(payload):
    # Per-request work runs here on every instance.
    ...

app.run()  # starts listening on 8080; the snapshot is taken after this
```

If your agent runs its own HTTP server instead of the AgentCore SDK, report a healthy status from `/ping` only after initialization completes, so that the snapshot captures a fully initialized agent.

Read only data at startup that is the same for every instance and does not expire. Handle time-sensitive values, such as short-lived credentials, in your handler.

**Note**  
Do not compute anything at startup that you change without redeploying. For example, a tool catalog fetched from AgentCore Gateway looks like an ideal startup value because it is slow and expensive to load, but caching it at startup freezes your agent’s tool inventory at the time of the snapshot.

## Keep per-request state fresh
<a name="_keep_per_request_state_fresh"></a>

The snapshot is captured once and shared by every restored instance, so any value that your agent generates at startup is identical across instances and fixed at the time of the snapshot. Handle values that the snapshot cannot carry in your `/invocations` handler. The following table describes values to compute in your handler instead of at startup.


| To do this | Do it in the handler | Reason | 
| --- | --- | --- | 
| Generate random values, identifiers, or tokens | Call `os.urandom()`, `secrets`, or `uuid.uuid4()` on each request |  `os.urandom()` returns fresh entropy only each time you call it after a restore. A value read at startup is copied into the snapshot and is identical on every instance, however good the entropy source was when it was read. The `random` module is likewise seeded at startup, so restored instances repeat the same sequence. | 
| Read the current time | Compute it for each request | A timestamp captured at startup is fixed at the time of the snapshot. | 
| Measure elapsed time | Take the reference timestamp in your handler |  `time.monotonic()` does not advance across a restore, so a duration measured from a startup reference is wrong without looking wrong. | 
| Use credentials or tokens | Refresh them when they expire | Credentials loaded at startup can expire before an instance starts. | 
| Identify the instance or worker | Generate an id per request; do not derive it from the host | Every restored instance reports the same hostname (`localhost`) and PID (`1`), so using either as an id collapses metrics, log streams, and lock owners across the fleet. | 

Build reusable clients at startup, and compute per-request values on each call.

```
import os, time

# Build reusable clients at startup, before the snapshot. Exercise them here too
# (for example, with a warm-up call) so the setup the client caches — endpoint and
# credential resolution, connection pool — is captured in the snapshot.
client = build_client()
warm_up(client)

@app.entrypoint
def invoke(payload):
    creds = get_credentials()          # refreshed when expired, not read at startup
    request_id = os.urandom(16).hex()  # unique per request
    now = time.time()                  # current time, not snapshot time
    # Handle the request.
```

## Use snapshot-safe cryptographic libraries
<a name="_use_snapshot_safe_cryptographic_libraries"></a>

When AgentCore Runtime restores instances from a snapshot, every instance created from that snapshot starts with an identical copy of the memory captured at snapshot time. This includes the internal state of random number generators inside cryptographic libraries, and any keys, tokens, or identifiers your agent created during initialization. Unless that state is refreshed after the restore, instances can produce the same "random" values.

 **Current limitation** 

On AgentCore Runtime, snapshot-safe builds of cryptographic libraries don’t reseed after a restore. This applies to both direct code deployments and container deployments.

 **Workarounds** 
+ Generate secrets, keys, tokens, and session identifiers while handling a request, not when your agent starts. This avoids using any values created before AgentCore Runtime takes the snapshot in each instance restored from that snapshot.
+ Even while handling a request, get random values directly from the operating system, for example Python’s `secrets` or `os.urandom`, Go’s `crypto/rand`, or reading `/dev/urandom`. Don’t use random values from a cryptographic library such as OpenSSL, because they can repeat across instances.

## Networking
<a name="_networking"></a>

Build clients at startup and expect a transparent reconnect  
The socket you open at startup does not survive a restore, but the setup your client library caches around it — service-model parsing, endpoint resolution, credential resolution, and the connection pool — does. Construct and exercise your clients at startup, and expect the first call after a restore to re-establish the connection transparently.

Do not use the hostname or PID as a unique instance identifier  
Every restored instance starts from the same snapshot and reports the same hostname and process ID. Generate a unique identifier in each request.

Avoid binding to a fixed source port  
After a restore, the connection held at snapshot time is re-established, and a fixed source port can collide with that replacement within the instance. Restored instances are separate microVMs with their own network namespaces, so the conflict is within an instance, not across them.

## Cross-account metrics and quotas
<a name="_cross_account_metrics_and_quotas"></a>

For a cross-account invocation, where a principal in one account invokes an agent runtime owned by another account through a resource-based policy, the CloudWatch metrics and the rate-limit quota usage for the invocation are attributed to the resource owner’s account. The resource owner is the account that owns the agent runtime.

You can also view the metrics that count toward your quota in the [Service Quotas](https://console.aws.amazon.com/servicequotas/home/services/bedrock-agentcore/quotas) console.