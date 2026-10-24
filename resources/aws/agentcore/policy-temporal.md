

# Temporal policies
<a name="policy-temporal"></a>

Policy in Amazon Bedrock AgentCore supports *temporal policies*: policies whose decisions depend on the history of an agent’s actions within a session, not on the current request alone. With them you can enforce rules that span multiple actions, such as requiring an approval before an action, limiting how many times an action runs within a time window, or keeping a running total under a threshold.

A temporal policy is a `permit` or `forbid` rule that contains one or more temporal operators. Each condition matches an earlier event recorded for the session by its action, principal, and the action’s input or output fields, and considers only events within a required time window. A condition can correlate a matched event with the current request, so a rule can require, for example, that the current request act on a resource that an earlier action already approved. The policy engine records each session’s events and evaluates these conditions on every request, so you express session-aware rules as policy instead of tracking events in your agent or tool code.

Temporal policies are written in Dogwood, which is compatible with Cedar and supports all existing Cedar policies. Standard Cedar policies are stateless and consider only the current request. Temporal policies follow the same deny-by-default model: a request is allowed only when a `permit` applies and no `forbid` overrides it. Temporal conditions are distinct from [time-based conditions](example-policies-time-based.md), which restrict access based on wall-clock time (`context.system.now`) rather than on session history. You can also run a temporal policy in `LOG_ONLY` mode to observe what it would decide before promoting it to `ENFORCE`; see [Policy enforcement modes](policy-enforcement-modes.md).

For more information about temporal policies that cover each pattern, see [Temporal policy examples](example-policies-temporal.md) in [Policy authoring guide](policy-authoring-guide.md).

**Topics**
+ [Key concepts](#policy-temporal-concepts)
+ [Supported AWS Regions](#policy-temporal-regions)
+ [Considerations](#policy-temporal-limitations)
+ [Quotas](#policy-temporal-limits)
+ [Observability](#policy-temporal-observability)
+ [Security considerations](#policy-temporal-security)
+ [Policy sessions and identity propagation](policy-session-based-temporal.md)
+ [Authoring temporal policies](policy-temporal-authoring.md)

## Key concepts
<a name="policy-temporal-concepts"></a>

Temporal policies build on two things: the Dogwood policy language, which expresses session-aware rules, and the policy session, which scopes the history a rule can see.

### The Dogwood policy language
<a name="policy-temporal-dogwood"></a>

Temporal policies are written in Dogwood, an open-source policy language for session-aware authorization - authorization decisions that factor in prior events, not just the current request. Dogwood extends the authorization model of Cedar, adding stateful, session-aware conditions and additional policy information providers, such as Amazon Bedrock Guardrails. You write `permit` and `forbid` rules over a principal, action, and resource. A request is allowed only when a `permit` applies and no `forbid` overrides it. Your existing point-in-time policies written in Dogwood or Cedar continue to work without changes. You add temporal conditions only where a rule must consider more than the current request.

With Dogwood, you express session-aware rules declaratively as policy instead of implementing event-tracking logic in your agent or tool code. The policy engine records the relevant events and evaluates the condition on each request. For example, the following policy permits disbursing a payment only when an approval for the same claim arrived within the previous hour:

```
permit (
    principal,
    action == AgentCore::Action::"InsuranceAPI___disburse_payment",
    resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when temporal {
    formerly within 1h AgentCore::Action::"InsuranceAPI___approve_claim"::response{
        eventResource:   resource,
        input.claimId:   context.input.claimId,
        output.approved: true
    }
};
```

Dogwood provides temporal operators for the common patterns: `formerly within` (a matching event occurred earlier in the window), `since within` (a condition has held since an anchor event), and the aggregations `count` and `sum` over the matching events in the window.

For the complete temporal syntax, see the [Dogwood language guide](https://dogwood-policy.github.io/dogwood/index.html) on the Dogwood Policy website.

### Policy sessions and the session ID
<a name="policy-temporal-sessions"></a>

Temporal policies evaluate against a *policy session*: a sequence of related Gateway invocations grouped under one session ID. Temporal history is scoped to the session, so a condition considers only the events recorded for the same session as the request being authorized. You generate the session ID and send it on each request in the `x-amzn-bedrock-agentcore-policy-session-id` header, starting with your first request. The Gateway does not generate a session ID on your behalf. If you omit the header, or send an empty value, the Gateway does not establish a session. If the associated policy engine contains a temporal policy, requests without a session ID fail with a validation error.

For details on passing the session ID, the session lifecycle, and how identity propagates across multi-hop calls, see [Policy sessions and identity propagation](policy-session-based-temporal.md).

#### Session invalidation
<a name="policy-temporal-session-invalidation"></a>

A temporal policy decides whether to allow an action by looking at what happened earlier in the same session. That history is only meaningful against the temporal policies that were in effect when the session started. If you change the engine’s temporal policies while a session is open, the recorded history no longer matches the current rules, so the service ends the session instead of making a decision against inconsistent data.

Adding or updating a temporal policy on the engine invalidates the engine’s active temporal policy sessions. After such a change, the next request that reuses an invalidated session fails with an HTTP 409 `ConflictException`.

To recover, start a new session and send the request again. The new session starts with an empty history and is evaluated against your updated policies.

## Supported AWS Regions
<a name="policy-temporal-regions"></a>

Temporal policies are available in the AWS Regions marked in the following table.


| Region name | Temporal policies | 
| --- | --- | 
| Asia Pacific (Hyderabad) | No | 
| Asia Pacific (Malaysia) | No | 
| Asia Pacific (Mumbai) | ✓ Yes | 
| Asia Pacific (Seoul) | ✓ Yes | 
| Asia Pacific (Singapore) | ✓ Yes | 
| Asia Pacific (Sydney) | ✓ Yes | 
| Asia Pacific (Thailand) | No | 
| Asia Pacific (Tokyo) | ✓ Yes | 
| Canada (Central) | ✓ Yes | 
| Europe (Frankfurt) | ✓ Yes | 
| Europe (Ireland) | ✓ Yes | 
| Europe (London) | ✓ Yes | 
| Europe (Milan) | No | 
| Europe (Paris) | ✓ Yes | 
| Europe (Spain) | ✓ Yes | 
| Europe (Stockholm) | ✓ Yes | 
| South America (São Paulo) | ✓ Yes | 
| US East (N. Virginia) | ✓ Yes | 
| US East (Ohio) | ✓ Yes | 
| US West (N. California) | No | 
| US West (Oregon) | ✓ Yes | 

## Considerations
<a name="policy-temporal-limitations"></a>

### Cross-account and cross-Region requests
<a name="policy-temporal-cross-account-region"></a>

Temporal policy sessions do not support cross-Region or cross-account propagation. Temporal policies do not control requests between AgentCore Gateways and their Runtime targets when those resources reside in different accounts or different AWS Regions. For temporal policies to control your agent’s actions, the gateway and all its targets must reside in the same AWS account and AWS Region.

Temporal policies enforce access only when the Workload Access Token (WAT) travels through the request chain (see [Policy sessions and identity propagation](policy-session-based-temporal.md)). When your request chain consists entirely of AgentCore Gateway and Runtime components, AgentCore propagates the WAT header automatically from one hop to the next. This propagation occurs within a single AWS Region and account. Temporal policies apply throughout the chain. A chain such as Gateway to Runtime to Gateway to Runtime carries the token end to end with no additional work on your part.

Chains that include non-Gateway or Runtime components behave differently. A request might pass through infrastructure you operate yourself, such as a third-party API gateway or a Kubernetes cluster. That component must forward the WAT header, and you must add custom logic to propagate the WAT through those hops. The physical location of those non-AgentCore components does not affect regional and account scope. They can run anywhere, provided the AgentCore components on either side return to the same AWS account and AWS Region where temporal policies apply.

### Required IAM permissions
<a name="policy-temporal-iam-permissions"></a>

Temporal policies also carry an IAM prerequisite. The IAM role configured for the Gateway must permit the `bedrock-agentcore:GetWorkloadAccessToken` action. This requirement holds even when you use IAM for your outbound authorization. The WAT allows temporal policies to correlate an agent’s actions across a session. The Gateway must be able to obtain the WAT regardless of how you authenticate outbound calls. If the role is missing this permission, temporal policy enforcement fails. Grant `bedrock-agentcore:GetWorkloadAccessToken` to the Gateway role when you configure temporal policies. For the complete permission policy, including the resource ARNs and workload-identity directory scoping, see [IAM permissions for temporal policies](policy-permissions.md#policy-permissions-session-temporal).

### Self-referential conditions include the current request
<a name="policy-temporal-self-referential"></a>

When a temporal condition references the same action that is being authorized, the current request’s own event is included in the evaluation. For example, a condition that counts how many times an action occurred within a window counts the current invocation as well.

### A prior action must be permitted to be recorded as a response
<a name="policy-temporal-previous"></a>

The session history records each action as an event whose kind reflects the outcome: a permitted action that completes is recorded as a `response` event, and an action that a policy denies is recorded as an `error` event. A temporal condition matches only events of the kind it names, so a condition that matches a `response` event considers only prior actions that were permitted. Make sure the prior action a temporal policy relies on is itself allowed by a policy; if it is denied, it is recorded as an `error` rather than a `response`, and a `response` condition never matches it.

### Sequencing actions that depend on a prior response
<a name="policy-temporal-response-delay"></a>

The session history records each action’s `response` event once the action completes. When a policy depends on a prior action’s response in the same session, such as an output field or a `since` condition, issue the dependent request after you receive the prior action’s response. Completing each action before you start the one that relies on it keeps your workflow’s sequence aligned with the history the policy evaluates.

## Quotas
<a name="policy-temporal-limits"></a>

The following quotas apply to temporal policies:


| Quota | Value | 
| --- | --- | 
| Temporal policies per policy engine | 20 | 
| Temporal operators per policy | 3 | 
| Maximum time window per temporal condition | 24 hours | 

## Observability
<a name="policy-temporal-observability"></a>

Amazon Bedrock AgentCore publishes metrics and span data that let you observe temporal policy evaluation. Metrics are published to the `AWS/Bedrock-AgentCore` CloudWatch namespace by default. Span data becomes available after you enable traces for the attached AgentCore Gateway resource, and can be found in the CloudWatch `aws/spans` log group.

The following signals are specific to temporal policies:
+  `TemporalLatency` (metric): time spent evaluating temporal policies, in milliseconds. One sample is emitted for each temporal evaluation, so you can use the `SampleCount` statistic to count evaluations.
+  `aws.agentcore.policy.temporal.latency_ms` (span attribute): time spent evaluating temporal policies for the request, in milliseconds.
+  `aws.agentcore.policy.temporal.evaluation_invoked` (span attribute): whether temporal evaluation ran for the request. This does not indicate that a temporal policy matched or determined the decision.
+  `aws.agentcore.policy.temporal.event_timestamp_ns` (span attribute): the exact event timestamp the evaluator used to order the request event, in nanoseconds.

For the complete list of policy metrics, dimensions, and span attributes, see [AgentCore generated policy observability data](observability-policy-metrics.md). That page also explains how to enable observability.

## Security considerations
<a name="policy-temporal-security"></a>

Rate limiting with temporal policies applies within a single session. Because temporal history is scoped to a session and the session ID is supplied by the caller, a `count`-based limit such as "at most N calls per session" counts only the events recorded for that session. Starting a new session begins a new count, so a temporal rate limit constrains activity within a session rather than across all of a caller’s sessions.