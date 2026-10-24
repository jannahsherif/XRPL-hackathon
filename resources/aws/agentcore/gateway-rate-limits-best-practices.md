

# Rate limit best practices
<a name="gateway-rate-limits-best-practices"></a>

This topic provides guidance on designing, deploying, and operating rate limits effectively on your gateway.

## Design patterns
<a name="gateway-rate-limits-best-practices-design-patterns"></a>

 **Tiered access**   
Create multiple rate limits with the same dimension key (`$.context.jwt.sub` or `$.context.jwt.tier`) but different entries for each tier. Use exact entries for known premium users and a `*` entry as the default tier.

 **Defense in depth**   
Layer rate limits at multiple granularities. For example, combine a per-target RPS limit (protects backend capacity) with a per-caller RPM limit (prevents individual abuse) and a per-tool token limit (controls cost).

 **Infrastructure as Code with BatchPut**   
Use `BatchPutGatewayRateLimits` to declaratively manage your rate limit configuration. Batch put uses upsert semantics, making it safe to run repeatedly from CI/CD pipelines or infrastructure templates.

 **Gradual rollout**   
Start with generous rate limits and tighten them over time based on observed traffic patterns. Monitor the `aws.agentcore.gateway.throttle.customer.decision` OTEL span attribute and 429 response rates before reducing limits.

 **Emergency block**   
Use `rate: 0` entries to block specific callers, targets, or tools during an incident. The block takes effect once propagation completes (up to 30 seconds).

## Dimension key selection guidance
<a name="gateway-rate-limits-best-practices-dimension-keys"></a>

Choose dimension keys that produce a bounded, predictable number of rate buckets:


| Dimension key | Cardinality | Recommendation | 
| --- | --- | --- | 
|  `targetName`  | Low (known set) | Excellent choice. Use for per-target protection. | 
|  `toolName`  | Low-medium | Good choice for MCP gateways with known tool sets. | 
|  `qualifiedModelId`  | Low (known set) | Excellent for inference gateways. | 
|  `$.context.jwt.sub`  | Medium-high | Good for per-user limits. Cardinality bounded by your user base. | 
|  `$.context.jwt.team`  | Low | Excellent for per-team quotas. | 
|  `$.context.iam.principal`  | Medium | Good for per-role limits in IAM-authenticated setups. | 
|  `$.context.jwt.jti`  | Unbounded | Do not use. Creates a unique bucket per token. | 
|  `$.context.jwt.nonce`  | Unbounded | Do not use. Creates a unique bucket per request. | 

**Warning**  
Unbounded dimension keys (such as `$.context.jwt.jti` or request-scoped claims) create an infinite number of rate buckets. This wastes memory, degrades performance, and effectively disables rate limiting because each request gets its own bucket and is never throttled.

## Token rate limit considerations
<a name="gateway-rate-limits-best-practices-token-limits"></a>

Token rate limits require special consideration due to their budget-based enforcement model:
+  **Budget utilization:** The gateway estimates input tokens before forwarding and records actual usage after the response. Short-lived bursts might temporarily exceed the configured rate.
+  **Stream options:** For streaming chat completions requests (`/v1/chat/completions`), the gateway automatically adds `"stream_options": {"include_usage": true}` to the request body when a token rate limit is active and the option is not already present. This enables accurate token accounting for TPM enforcement.
+  **Supported paths:** Token rate limits apply only to requests on known inference paths (`/v1/chat/completions`, `/v1/messages`, `/v1/responses`). Requests to other paths are not subject to token limits.
+  **Pass-through targets:** If your target proxies to a model provider without using a known inference path, token rate limits do not apply. Consider using request rate limits or restructuring your target to use a supported path.

## Token rate limit FAQ
<a name="gateway-rate-limits-best-practices-tpm-faq"></a>

This section answers common questions about how token-per-minute (TPM) enforcement works in practice.

 **How does TPM enforcement work?**   
The gateway uses a budget-based enforcement model. When a request arrives, the gateway estimates the input token count and reserves that amount from your configured TPM budget. If the estimate exceeds the remaining budget, the request is rejected with an HTTP 429 response before it reaches the model. After a successful request completes, the gateway reconciles the budget by replacing the initial estimate with the actual token usage (input \+ output tokens) reported by the model provider.

 **How does TPM work with prompt caching?**   
The gateway accounts for tokens based on the `input_tokens` and `output_tokens` values that the model provider returns in the inference response. The gateway does not independently track or adjust for prompt caching. Whether cached tokens are included in `input_tokens` depends on how your model provider reports usage — this behavior varies between providers. Consult your model provider’s documentation to understand how prompt caching affects reported token counts and your effective TPM consumption.

 **If my TPM limit is 50 and the tokenizer estimates 51 input tokens, is the request throttled?**   
Yes. The gateway evaluates the tokenizer’s estimate against the remaining TPM budget before forwarding the request. If the estimate exceeds the available budget, the request is rejected with an HTTP 429 response. The response includes a `retryAfter` field indicating when sufficient budget will be available.

 **If a long-running request consumes more tokens than initially estimated, is the response throttled?**   
No. Once the gateway accepts and forwards a request, the response is always delivered in full. The gateway reserves estimated tokens at request time, and other requests continue to be evaluated against the remaining budget while the request is in flight. When the response completes, the gateway reconciles actual usage against the estimate. If the actual consumption was higher, the budget is adjusted — this may cause subsequent requests to be throttled, but the original response is never interrupted.

 **How does token accounting work with streaming responses?**   
The gateway uses the final response chunk as the source of truth for token reconciliation. Not all model providers report token usage in every streamed chunk — some include it only in the final chunk. The gateway waits for the complete response before reconciling the TPM budget. For OpenAI Chat Completions streaming, the gateway automatically adds `"stream_options": {"include_usage": true}` to the request body when a token rate limit is active and this option is not already present, ensuring accurate token counts are available in the final chunk.

## Operational considerations
<a name="gateway-rate-limits-best-practices-operational"></a>

 **Propagation timing**   
Rate limit changes take up to 30 seconds to propagate. Plan for this delay during incidents — a block entry (`rate: 0`) is not immediate.

 **Rate zero behavior**   
A rate of 0 blocks all matching traffic. Use this deliberately for emergency blocking. Double-check entry dimension values before setting `rate: 0` to avoid accidentally blocking legitimate traffic.

 **Immutable dimension keys**   
You cannot change the `dimensionKeys` of an existing rate limit. If you need different dimensions, delete the existing rate limit and create a new one. Plan your dimension key structure before creating production rate limits.

**Important**  
Rate limits use fail-open behavior. If the rate limit service is temporarily unavailable, traffic is allowed through. Do not use rate limits as your sole security mechanism. Combine them with authentication, authorization, gateway rules, and WAF for defense in depth.

## Monitoring
<a name="gateway-rate-limits-best-practices-monitoring"></a>

Use the following signals to monitor rate limit effectiveness:

 **Throttled response signals:** 
+ Monitor HTTP 429 responses from your gateway.
+ Parse the `limitKey` field in throttled responses to identify which rate limit is triggering.
+ Use the `retryAfter` value to understand the enforcement window.

 **OpenTelemetry span attributes:** 


| Attribute | What to monitor | 
| --- | --- | 
|  `aws.agentcore.gateway.throttle.customer.decision = throttled`  | Count of throttled requests. Alert on unexpected spikes. | 
|  `aws.agentcore.gateway.throttle.customer.limit_key`  | Identify which rate limits are most active. Look for imbalanced enforcement. | 
|  `aws.agentcore.gateway.throttle.customer.metric`  | Determine whether requests, tokens, or connections are the bottleneck. | 
|  `aws.agentcore.gateway.throttle.customer.matched_entry`  | Identify which callers or targets are hitting limits most frequently. | 
|  `aws.agentcore.gateway.throttle.customer.evaluated`  | Ordered list of all checked buckets. Useful for understanding which limits applied to a specific request. | 

 **Example monitoring queries:** 

Use Amazon CloudWatch Logs Insights on the `aws/spans` log group to query your gateway’s OTEL spans. The following examples help identify throttling patterns.

Count throttled requests by rate limit:

```
filter attributes.`aws.agentcore.gateway.throttle.customer.decision` = "throttled"
| stats count(*) as throttle_count by attributes.`aws.agentcore.gateway.throttle.customer.limit_key`
| sort throttle_count desc
```

Identify which callers are being throttled most:

```
filter attributes.`aws.agentcore.gateway.throttle.customer.decision` = "throttled"
| stats count(*) as throttle_count by attributes.`aws.agentcore.gateway.throttle.customer.matched_entry`
| sort throttle_count desc
| limit 20
```

Compare allowed vs throttled requests over time:

```
filter ispresent(attributes.`aws.agentcore.gateway.throttle.customer.decision`)
| stats count(*) as total,
        sum(attributes.`aws.agentcore.gateway.throttle.customer.decision` = "throttled") as throttled
  by bin(5m)
```

If a single rate limit accounts for most throttle events, consider whether the configured rate is too restrictive or whether the traffic pattern indicates abuse.

## Creating alarms from rate limit spans
<a name="gateway-rate-limits-best-practices-alarms"></a>

You can convert rate limit OTEL span attributes into CloudWatch metrics and alarms to proactively monitor throttling behavior. This requires enabling gateway observability (see [Enabling observability for AgentCore gateway resources](observability-configure.md#observability-configure-cloudwatch)).

### Step 1: Enable gateway spans
<a name="_step_1_enable_gateway_spans"></a>

Ensure your gateway has observability enabled. Gateway spans are exported to CloudWatch and are viewable in CloudWatch Transaction Search and the generative AI observability page.

### Step 2: Create a CloudWatch metric filter
<a name="_step_2_create_a_cloudwatch_metric_filter"></a>

Create a metric filter on the `aws/spans` log group to extract throttle events as a custom metric. The following example creates a metric that counts throttled requests per rate limit:

```
{
  "filterPattern": "{ $.attributes.aws\\.agentcore\\.gateway\\.throttle\\.customer\\.decision = \"throttled\" }",
  "metricTransformations": [
    {
      "metricName": "GatewayRateLimitThrottleCount",
      "metricNamespace": "AgentCore/Gateway/RateLimits",
      "metricValue": "1",
      "defaultValue": 0,
      "dimensions": {
        "LimitKey": "$.attributes.aws\\.agentcore\\.gateway\\.throttle\\.customer\\.limit_key"
      }
    }
  ]
}
```

### Step 3: Create a CloudWatch alarm
<a name="_step_3_create_a_cloudwatch_alarm"></a>

After the metric filter is in place, create an alarm that triggers when the throttle rate exceeds a threshold.

**Example**  

1. Run the following command:

   ```
   aws cloudwatch put-metric-alarm \
       --alarm-name "GatewayRateLimitThrottleSpike" \
       --namespace "AgentCore/Gateway/RateLimits" \
       --metric-name "GatewayRateLimitThrottleCount" \
       --statistic Sum \
       --period 300 \
       --evaluation-periods 1 \
       --threshold 100 \
       --comparison-operator GreaterThanThreshold \
       --alarm-description "Alert when rate limit throttles exceed 100 in 5 minutes" \
       --alarm-actions "arn:aws:sns:us-west-2:123456789012:my-alarm-topic"
   ```

1. 

   ```
   import boto3
   
   cloudwatch = boto3.client("cloudwatch", region_name="us-west-2")
   
   cloudwatch.put_metric_alarm(
       AlarmName="GatewayRateLimitThrottleSpike",
       Namespace="AgentCore/Gateway/RateLimits",
       MetricName="GatewayRateLimitThrottleCount",
       Statistic="Sum",
       Period=300,
       EvaluationPeriods=1,
       Threshold=100,
       ComparisonOperator="GreaterThanThreshold",
       AlarmDescription="Alert when rate limit throttles exceed 100 in 5 minutes",
       AlarmActions=["arn:aws:sns:us-west-2:123456789012:my-alarm-topic"],
   )
   
   print("Alarm created successfully")
   ```

### Step 4: Build a dashboard
<a name="_step_4_build_a_dashboard"></a>

Create a CloudWatch dashboard to visualize throttle rates over time. The following widget configuration shows throttle counts grouped by rate limit:

```
{
  "metrics": [
    [
      "AgentCore/Gateway/RateLimits",
      "GatewayRateLimitThrottleCount",
      "LimitKey", "per-target-rps"
    ],
    [
      "AgentCore/Gateway/RateLimits",
      "GatewayRateLimitThrottleCount",
      "LimitKey", "per-caller-rpm"
    ]
  ],
  "period": 60,
  "stat": "Sum",
  "title": "Rate Limit Throttles by Limit"
}
```

**Tip**  
You can also use the built-in `Throttles` metric (available by default under gateway invocation metrics) for a total throttle count without per-limit granularity. Use custom metric filters on span attributes when you need per-limit or per-caller visibility.