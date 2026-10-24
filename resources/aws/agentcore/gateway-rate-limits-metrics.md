

# Rate limit metrics
<a name="gateway-rate-limits-metrics"></a>

Rate limit entries specify one or more metrics that define what is being measured and the time window for enforcement. Each metric type has specific constraints on supported periods and target types.

## Request rate limits
<a name="gateway-rate-limits-metrics-requests"></a>

Request rate limits control the number of API requests allowed within a time window.
+  **Supported periods:** `second`, `minute` 
+  **Supported target types:** All target types
+  **Setting rate to 0:** Blocks all matching requests once propagation completes (up to 30 seconds)

Request rate limits are evaluated synchronously before the request is forwarded to the target.

## Token rate limits
<a name="gateway-rate-limits-metrics-tokens"></a>

Token rate limits control the number of tokens (input \+ output) consumed within a time window. Token rate limits apply only to inference targets.
+  **Supported periods:** `minute` 
+  **Supported target types:** Inference targets only (connector targets and provider targets with known inference paths)
+  **Known inference paths:** `/v1/chat/completions`, `/v1/messages`, `/v1/responses` 

Token rate limits use budget-based enforcement:

1. The gateway estimates input token usage before forwarding the request.

1. The actual token count (input \+ output) is recorded after the response completes.

1. Due to response latency, the budget might temporarily exceed the configured rate before enforcement catches up.

**Note**  
For streaming chat completions requests (`/v1/chat/completions`), the gateway automatically adds `"stream_options": {"include_usage": true}` to the request body. This happens when a token rate limit is active and the option is not already present. It ensures accurate token counts are available in the streamed response for TPM enforcement.

## Connection rate limits
<a name="gateway-rate-limits-metrics-connections"></a>

Connection rate limits control the number of concurrent in-flight requests allowed at any given time. Each request occupies a connection slot from acceptance until the response completes. If a new request arrives and the number of active connections has reached the configured limit, the request is rejected with an HTTP 429 response.
+  **Supported periods:** `second` 
+  **Supported target types:** All target types (MCP, HTTP, Inference)
+  **Measurement:** Maximum concurrent in-flight requests

## Metric constraints
<a name="gateway-rate-limits-metrics-constraints"></a>


| Metric | Supported periods | Supported targets | 
| --- | --- | --- | 
|  `requests`  |  `second`, `minute`  | All | 
|  `tokens`  |  `minute`  | Inference targets only (connector, provider with known paths) | 
|  `connections`  |  `second`  | All | 

## Combined metrics
<a name="gateway-rate-limits-metrics-combined"></a>

A single rate limit entry can specify multiple metrics. When an entry has multiple metrics, all metrics are evaluated independently — the request is throttled if any single metric exceeds its limit.

The following example shows a rate limit that enforces both requests per minute and tokens per minute:

```
{
    "rateLimitId": "inference-rps-and-tpm",
    "dimensionKeys": ["targetName", "$.context.jwt.sub"],
    "entries": [
        {
            "dimensions": {
                "targetName": "my-inference-target",
                "$.context.jwt.sub": "*"
            },
            "requests": [{"rate": 300, "period": "minute"}],
            "tokens": [{"rate": 50000, "period": "minute"}]
        }
    ]
}
```

In this example, each caller is throttled if they exceed either 300 requests per minute or 50,000 tokens per minute to `my-inference-target`, whichever limit is reached first.