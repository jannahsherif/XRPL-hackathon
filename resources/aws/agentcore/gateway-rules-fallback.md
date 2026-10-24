

# Model routing and fallback
<a name="gateway-rules-fallback"></a>

When you route inference traffic through a gateway, a request can fail when the target that serves the requested model is throttled, out of capacity, or unreachable. With model fallback, you define an ordered chain of alternative destinations, and the gateway automatically tries the next one when the primary fails. Fallback gives you higher availability and more control over cost and model coverage, without each calling client implementing its own fallback logic.

You configure both model routing and fallback on a [gateway rule](gateway-rules.md), and they apply to inference targets. This topic starts with a routing rule, then adds a fallback chain to it.

**Topics**
+ [Route a model to a target](#gateway-rules-fallback-route)
+ [Add a fallback chain](#gateway-rules-fallback-chain)
+ [Fallback triggers](#gateway-rules-fallback-triggers)
+ [Circuit breaker](#gateway-rules-fallback-breaker)
+ [Fallback with weighted routes](#gateway-rules-fallback-weighted)
+ [Validation rules for fallback chains](#gateway-rules-fallback-rules)
+ [Observability and billing](#gateway-rules-fallback-observability)

## Route a model to a target
<a name="gateway-rules-fallback-route"></a>

Start with a rule that routes a model to a specific target, without fallback. Use a `routeToTarget` rule to override the gateway’s default [model-based routing](gateway-target-inference-connector.md#gateway-target-inference-connector-routing) for the models it matches. A `matchModels` condition specifies which requests the rule applies to, and a `routeToTarget` action with a `staticRoute` specifies the target that serves the matched requests. When several targets match the same model, default routing can send the request to any of them; a rule pins it to the target you choose.

The following AWS CLI command creates a rule that routes `gpt-5.5` to the `bedrock-mantle` target:

```
aws bedrock-agentcore-control create-gateway-rule \
    --gateway-identifier my-gateway-abc1234567 \
    --priority 100 \
    --description "Route gpt-5.5 to bedrock-mantle" \
    --conditions '[
        {
            "matchModels": {
                "anyOf": [
                    {"value": "gpt-5.5"}
                ]
            }
        }
    ]' \
    --actions '[
        {
            "routeToTarget": {
                "staticRoute": {
                    "targetName": "bedrock-mantle"
                }
            }
        }
    ]'
```

The `staticRoute` can also pin a served `model`, so the target serves a different model than the one the caller requested; omit `model` to serve the requested model. For the full `matchModels` and `routeToTarget` reference, see [Add rules to a gateway](gateway-rules.md).

## Add a fallback chain
<a name="gateway-rules-fallback-chain"></a>

To protect that route, add a `fallback` block to the `routeToTarget` action. The block declares an ordered list of alternative destinations and the conditions for leaving a destination. A destination is a target, optionally with a specific model.
+  **Primary** – The `staticRoute` (or each `weightedRoute` leg). It optionally pins a `model`, so the served model can differ from the requested one; omit `model` to serve the requested model on that target. The primary’s own leave conditions sit on the `fallback` block.
+  ** `targetFallback` ** – An ordered list of 1 to 2 alternative destinations to try, in order, when the primary fails. Each entry names a `targetName` and an optional `model`, and carries its own optional leave conditions.
+  ** `triggerOn` ** – The conditions under which the gateway leaves a destination and tries the next one. A response that matches none of them returns to the caller unchanged.
+  ** `firstByteTimeoutMilliseconds` ** – How long to wait for a destination’s first response byte before giving up and moving to the next destination. This makes fallback work when a provider stalls instead of returning a clean error.
+  ** `circuitBreaker` ** – Turns the circuit breaker on or off for this route (`ENABLED` by default). The circuit breaker skips a destination that is currently failing so that requests go straight to a healthy one. For more information, see [Circuit breaker](#gateway-rules-fallback-breaker).

The gateway walks the chain in order. For each destination it checks the circuit breaker, attempts the destination once, and either returns the response to the caller or, if a trigger fires, advances to the next destination. If every destination fails, the caller receives the last error.

Once a streaming response has started, the gateway can no longer fall back; the caller receives the partial response and an error, and must retry.

The following AWS CLI command creates a rule that routes `gpt-5.5` to `bedrock-mantle` and adds a fallback chain. It tries `gpt-5.5` on `bedrock-mantle` first. If that fails, it tries `gpt-5.5` on `openai`. Only if neither can serve the request does it degrade to `gpt-5.4` on `bedrock-mantle`. The primary falls back on `429` and `5XX`, on a connection error or first-byte timeout, and on an unroutable target, with a 5-second first-byte timeout. The two fallback destinations take the service defaults.

```
aws bedrock-agentcore-control create-gateway-rule \
    --gateway-identifier my-gateway-abc1234567 \
    --priority 100 \
    --description "Prefer gpt-5.5 on bedrock-mantle, fall back to OpenAI, then degrade to gpt-5.4" \
    --conditions '[
        {
            "matchModels": {
                "anyOf": [
                    {"value": "gpt-5.5"}
                ]
            }
        }
    ]' \
    --actions '[
        {
            "routeToTarget": {
                "staticRoute": {
                    "targetName": "bedrock-mantle",
                    "model": "gpt-5.5",
                    "fallback": {
                        "circuitBreaker": {"mode": "ENABLED"},
                        "triggerOn": {
                            "statusCodes": ["5XX", "429"],
                            "errors": ["CONNECTION_ERROR", "FIRST_BYTE_TIMEOUT", "UNROUTABLE"]
                        },
                        "firstByteTimeoutMilliseconds": 5000,
                        "targetFallback": [
                            {"targetName": "openai"},
                            {"targetName": "bedrock-mantle", "model": "gpt-5.4"}
                        ]
                    }
                }
            }
        }
    ]'
```

**Note**  
The target and model names in this example are illustrative. Use the target names configured on your gateway and model IDs that your targets serve. To create the inference targets that a rule references, see [Inference targets](gateway-targets-inference.md). Model providers might deprecate or remove a model over time.

## Fallback triggers
<a name="gateway-rules-fallback-triggers"></a>

The `triggerOn` object lists the conditions that cause fallback. You can set it on the `fallback` block (for the primary) and on each `targetFallback` entry (for that destination). It has two fields:

 **statusCodes**   
1 to 10 HTTP error status codes or class patterns. Each value is an exact code or a class in the form `NXX`, bounded to the 4xx and 5xx ranges — for example, `429`, `503`, or `5XX`. Fallback applies only to error responses; `2xx` and `3xx` responses are never fallback-eligible.

 **errors**   
1 to 3 connection-level or routing conditions, from the following values:  
+  `CONNECTION_ERROR` — The gateway could not establish a connection to the destination (connection refused, reset, or timed out). The attempt never reached the provider.
+  `FIRST_BYTE_TIMEOUT` — The destination accepted the connection but did not return the first response byte within `firstByteTimeoutMilliseconds`.
+  `UNROUTABLE` — The gateway could not route to a serving target (the target is missing, or it does not support the request’s API path). This is a deterministic, gateway-side condition: it advances the chain but does not feed the circuit breaker.

## Circuit breaker
<a name="gateway-rules-fallback-breaker"></a>

The circuit breaker skips a destination that is currently failing, so requests go straight to a healthy destination instead of paying a failed attempt first. This lowers both latency and cost during an outage. The breaker is on by default. To turn it off, set `circuitBreaker.mode` to `DISABLED` — for example, to keep using a cheaper primary rather than failing fast to a costlier secondary. With the breaker off, the chain still walks in the order you declared.

The breaker moves through three states automatically. The following table shows how each state affects a request and what you are billed. Each outbound attempt the gateway makes is billed as one gateway invocation (see [Observability and billing](#gateway-rules-fallback-observability)).


| Breaker state | What happens to a request | Billing | 
| --- | --- | --- | 
|  **Closed** (healthy) | The gateway sends the request to the primary. If the primary returns a fallback trigger (for example, a `500` response), the gateway falls back to the next destination in the chain. | Every attempt is billed as a gateway invocation, including the failed primary attempt before fallback. | 
|  **Open** (failing) | The gateway skips the primary and sends the request straight to the next destination in the chain, so the request avoids the failed attempt and returns faster. | The gateway does not bill the skipped primary. Each destination the gateway attempts is billed as a gateway invocation. | 
|  **Half-open** (recovering) | The gateway lets a small portion of requests through to the primary to check whether it has recovered; the rest skip the primary and go to the next destination. If the requests allowed through succeed, the breaker closes and all traffic returns to the primary. If they fail, the breaker stays open. | A request allowed through to the primary is billed as a gateway invocation for that attempt. Other requests are billed as in the open state. | 

## Fallback with weighted routes
<a name="gateway-rules-fallback-weighted"></a>

When the primary is a `weightedRoute`, you configure fallback for each leg: each traffic-split entry carries its own optional `fallback` block, and the `weightedRoute` itself has no route-level fallback. A leg with no `fallback` returns the error to the caller when it fails. The circuit breaker is per destination and independent of the weights.

## Validation rules for fallback chains
<a name="gateway-rules-fallback-rules"></a>
+ Every destination in a rule must be distinct. The primary and each fallback destination must name a different combination of target and model; the gateway rejects a rule that repeats one.
+ A `fallback` block must list at least one `targetFallback` entry.
+ A `matchModels` condition must list at least one entry, and each entry’s `value` must not be blank.
+ Fallback applies to inference targets.

## Observability and billing
<a name="gateway-rules-fallback-observability"></a>

The gateway records fallback and routing decisions in the routing logs it vends. These logs attribute the destination that actually served each request and note when the circuit breaker skipped a destination, so you can confirm routing and see why a destination is being skipped.

**Important**  
Each outbound attempt the gateway makes counts as a gateway invocation and is billed at gateway rates. A request that falls back across multiple destinations therefore counts as one gateway invocation for each attempt, and the circuit breaker reduces this cost by skipping destinations that are already failing. The model and inference cost of each attempt is billed separately by Amazon Bedrock or the model provider, not by the gateway.

From the calling client’s perspective, fallback is transparent: the client sends one request and receives one response, from whichever destination served it. The gateway adds no caller-facing indicator of which destination was used.