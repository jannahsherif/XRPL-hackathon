

# Rate limit enforcement
<a name="gateway-rate-limits-enforcement"></a>

This topic describes how the gateway evaluates and enforces rate limits at runtime, including interaction with other gateway features, throttled response formats, and observability.

## Interaction with gateway rules
<a name="gateway-rate-limits-enforcement-rules-interaction"></a>

The gateway evaluates rate limits **before** gateway rules. If a rate limit throttles a request, the request never reaches the rule evaluation stage.

## Stacking semantics
<a name="gateway-rate-limits-enforcement-stacking"></a>

When multiple rate limits apply to a request, the gateway uses AND logic — all rate limits must pass for the request to proceed. If any single rate limit denies the request, the gateway throttles it.

## Entry matching and specificity
<a name="gateway-rate-limits-enforcement-entry-matching"></a>

When a rate limit has multiple entries, the gateway selects the most specific matching entry for the resolved dimension values:
+ An exact value match takes precedence over a `*` entry.
+ The `*` value means "apply this rate to all values of this dimension" — it acts as a default entry.
+ For multi-dimension rate limits, the gateway uses progressive trailing fallback: it first attempts a full exact match, then replaces trailing dimensions with `*` one at a time until a match is found.

The following example shows how entries are matched for a rate limit with `dimensionKeys: ["targetName", "toolName"]` when the resolved values are `["my-target", "readData"]`:


| Entry dimensions | Matches? | Why | 
| --- | --- | --- | 
|  `{"targetName": "my-target", "toolName": "readData"}`  | Yes (checked first) | Exact match on both dimensions. Most specific. | 
|  `{"targetName": "my-target", "toolName": "*"}`  | Yes (checked second) | Exact match on first dimension, `*` on second. | 
|  `{"targetName": "", "toolName": ""}`  | Yes (checked last) | Default entry. Least specific. | 

The first matching entry wins. If no entry matches (and no `*` default exists), the rate limit is skipped for that request.

## Evaluation order
<a name="gateway-rate-limits-enforcement-evaluation-order"></a>

The gateway evaluates rate limits in the following order:

1. The gateway evaluates rate limits with more dimension keys first (more specific limits take priority).

1. Within the same number of dimensions, the gateway evaluates rate limits with tighter (lower) rates first.

1. Evaluation short-circuits on the first denial — the gateway does not evaluate remaining rate limits.

## Interaction with service-managed limits
<a name="gateway-rate-limits-enforcement-service-limits"></a>

The gateway enforces both customer-defined rate limits and service-managed limits. The effective rate for any request is the minimum of both:
+ The gateway evaluates customer-defined rate limits first.
+ If the request passes customer limits, service-managed limits are evaluated.
+ A denial from either source results in throttling.

## Throttled responses
<a name="gateway-rate-limits-enforcement-throttled-responses"></a>

When a request is throttled, the gateway returns a protocol-specific error response containing the `retryAfter` value in the response body.

 **HTTP protocol:** 

```
{
    "error": "Rate limit exceeded",
    "success": false,
    "limitKey": "rl-abc123/targetName=my-target",
    "metric": "requests",
    "retryAfter": 1
}
```

 **MCP protocol (JSON-RPC):** 

```
{
    "jsonrpc": "2.0",
    "id": "request-1",
    "error": {
        "code": -32003,
        "message": "Rate limit exceeded",
        "data": {
            "limitKey": "rl-abc123/targetName=my-target",
            "metric": "requests",
            "retryAfter": 1
        }
    }
}
```

 **OpenAI-compatible protocol:** 

```
{
    "error": {
        "message": "Rate limit exceeded",
        "type": "rate_limit_error",
        "code": "429",
        "limitKey": "rl-abc123/qualifiedModelId=anthropic.claude-3-sonnet",
        "metric": "tokens",
        "retryAfter": 60
    }
}
```

 **Anthropic-compatible protocol:** 

```
{
    "type": "error",
    "error": {
        "type": "rate_limit_error",
        "message": "Rate limit exceeded",
        "limitKey": "rl-abc123/qualifiedModelId=anthropic.claude-3-sonnet",
        "metric": "tokens",
        "retryAfter": 60
    }
}
```

The `retryAfter` field indicates how many seconds the caller should wait before retrying. Use this value directly in your client-side retry logic.

## Propagation timing
<a name="gateway-rate-limits-enforcement-propagation"></a>

Rate limit changes (create, update, delete) propagate to the data plane within 30 seconds. During propagation:
+ New rate limits are not enforced until propagation completes.
+ Updated rate limits continue enforcing the previous configuration until the update propagates.
+ Deleted rate limits continue enforcing until the deletion propagates.

## Enforcement accuracy and eventual consistency
<a name="gateway-rate-limits-enforcement-accuracy"></a>

Rate limit enforcement is **eventually consistent** rather than exact. Enforcement accuracy is approximate in the moments after a limit begins receiving traffic, and it improves as traffic continues. The accuracy you observe therefore depends on your traffic pattern.

The following behaviors are expected:
+  **Cold limits over-admit at first.** A cold limit is one that is newly created or that has had no recent traffic. For a short initial period, the gateway might over-admit (allow more requests than the configured rate) before enforcement converges. Once a limit is under continuous traffic, accuracy improves and the observed throttle rate settles close to the configured rate.
+  **Sustained traffic enforces accurately, but short bursts might not.** A brief burst against a cold limit can pass through without being throttled. The same rate sent as sustained traffic is enforced, because accuracy improves as a limit warms up. To observe or demonstrate enforcement, send sustained traffic to the limit for several minutes rather than a single short burst. For example, for a limit of 4 requests per second, the gateway might not throttle the 5th request in the first second. If you send 5 requests per second continuously, you will consistently see the extra request throttled after the limit warms up.
+  **Very low rates are less accurate.** Rates below roughly 1 request per second (for example, a small requests-per-minute limit) are harder to enforce precisely and will show more variability. Prefer higher rates where precise enforcement matters, and treat very low limits as approximate.
+  **Token limits converge more slowly.** Token-per-minute limits update (reconcile) the tracked usage total only after the model responds. A request that is in flight for several seconds or minutes holds only its estimated cost against the budget until it completes. This extends the window during which the gateway might over-admit requests, relative to request limits. See [Token rate limit FAQ](gateway-rate-limits-best-practices.md#gateway-rate-limits-best-practices-tpm-faq) for details.

Design your limits around fair usage and backend protection. This means smoothing bursts and protecting targets from noisy neighbors over a sustained window, rather than blocking an exact request number the instant a threshold is crossed. Rate limits are not a precise, request-exact gate. Rate limits are also not a security boundary, as explained in the following section.

## Fail-open behavior
<a name="gateway-rate-limits-enforcement-fail-open"></a>

The gateway uses fail-open semantics for rate limit evaluation. The following table describes behavior when the rate limit system encounters errors:


| Scenario | Decision | Rationale | 
| --- | --- | --- | 
| Rate limit service timeout | Allow | Availability takes precedence over enforcement. | 
| Dimension key unresolvable from request | Skip (allow) | The rate limit does not apply to this request type. | 
| Rate limit cache refresh failure | Retry with stale data | Last known configuration is used until cache recovers. | 

**Important**  
Because of fail-open behavior, do not rely solely on rate limits as a security boundary. Use rate limits for traffic management and quality of service, and use authentication, authorization, and WAF rules for security enforcement.

## Tracing with OpenTelemetry spans
<a name="gateway-rate-limits-enforcement-tracing"></a>

The gateway emits OpenTelemetry (OTEL) span attributes on the server span for every request where customer rate limits are evaluated. Use these attributes for debugging and monitoring.


| Attribute | Description | Example | 
| --- | --- | --- | 
|  `aws.agentcore.gateway.throttle.customer.decision`  | The enforcement decision for this request. |  `allowed` or `throttled`  | 
|  `aws.agentcore.gateway.throttle.customer.limit_key`  | The `rateLimitId` of the rate limit that rejected the request. Only present when decision is `throttled`. |  `per-target-rps`  | 
|  `aws.agentcore.gateway.throttle.customer.metric`  | The metric type that was exhausted. Only present when decision is `throttled`. |  `requests`  | 
|  `aws.agentcore.gateway.throttle.customer.matched_entry`  | Comma-separated resolved dimension values of the entry that triggered the throttle. Only present when decision is `throttled`. |  `my-target,alice`  | 
|  `aws.agentcore.gateway.throttle.customer.resolved_values`  | Comma-separated actual dimension values resolved from the request that triggered the throttle, in `dimensionKeys` order. Unlike `matched_entry` (which reflects the matched entry’s configured values, including any `*`), this attribute reflects the concrete values resolved at runtime. Only present when decision is `throttled`. |  `my-target,alice`  | 
|  `aws.agentcore.gateway.throttle.customer.evaluated`  | Ordered list of all rate limit buckets checked for this request. Each entry shows the rate limit ID, metric, and resolved dimension values. Present for both `allowed` and `throttled` decisions. |  `["per-target-rps:requests:my-target", "per-caller-rpm:requests:alice"]`  | 

The `evaluated` attribute is useful for understanding which rate limits applied to a request, even when it was allowed. Each entry in the list follows the format `{rateLimitId}:{metric}:{resolvedDimVal1,dimVal2,…​}`.