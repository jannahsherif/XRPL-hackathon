

# Add rules to a gateway
<a name="gateway-rules"></a>

Gateway rules let you control traffic routing and override target configurations on your gateway without redeploying targets. You create [configuration bundles](configuration-bundles.md) that override a target’s behavior, then use rules to control which bundle version applies to which traffic. Rules also support routing requests to different targets based on request path or caller identity.

Use gateway rules to accomplish the following goals:
+ Experiment with configuration bundle versions through A/B testing
+ Pin specific principals to a configuration bundle version for debugging
+ Route traffic to specific targets based on request path or caller identity
+ Set a default configuration bundle or target for all traffic

## How gateway rules work
<a name="gateway-rules-how-they-work"></a>

Each gateway rule contains the following components:


| Component | Description | 
| --- | --- | 
| Priority | An integer from 1 to 1,000,000. Lower numbers indicate higher precedence. Each priority value must be unique within a gateway. | 
| Conditions (optional) | Criteria that determine whether the rule matches a request. A rule without conditions acts as a catch-all that matches all traffic. | 
| Actions (required) | The action to take when the rule matches. You can override configuration bundles, route to specific targets, or both. | 
| Description (optional) | A text description of the rule’s purpose. | 

## Rule resolution
<a name="gateway-rules-resolution"></a>

The gateway evaluates rules in ascending priority order (lower numbers first). The gateway resolves each action type independently using first-match semantics.

The following table shows how the gateway resolves rules for a sample request. In this example, the QA role sends a request to `/my-target-canary/chat`.


| Priority | Conditions | Actions | Matches request? | Result | 
| --- | --- | --- | --- | --- | 
| 100 | QA role |  `configurationBundle`: bundle version A | Yes | Resolves `configurationBundle` to version A | 
| 200 | Path `/my-target-canary/*`  |  `routeToTarget`: `my-target-canary`  | Yes | Resolves `routeToTarget` to `my-target-canary`  | 
| 1000000 | None (catch-all) |  `configurationBundle`: bundle version B, `routeToTarget`: `my-target-primary`  | Yes | Both action types already resolved. Skipped. | 

 **Final result:** The request uses bundle version A and routes to `my-target-canary`.

**Tip**  
Leave gaps between priority numbers (for example, 100, 200, 300) so that you can insert rules later without renumbering existing rules.

## Conditions
<a name="gateway-rules-conditions"></a>

Conditions determine which requests a rule matches. A rule can have a maximum of 3 conditions, at most one of each type. A rule with no conditions matches all traffic.

The gateway supports the following condition types:

 **matchPrincipals**   
Matches requests based on the caller’s IAM principal. The `anyOf` list contains 1 to 100 entries. Each entry specifies an `iamPrincipal` with the following fields:  
+  `arn` — The IAM principal ARN to match.
+  `operator` (optional) — The comparison operator. Valid values are `StringEquals` (default) and `StringLike`. Use `StringLike` for wildcard matching.

 **matchPaths**   
Matches requests based on the request path. The `anyOf` list contains 1 to 10 entries. Each entry must use the format `/<targetName>/*`, where `<targetName>` matches the name of an existing HTTP target on the gateway. The target must be in `Ready` state. The `matchPaths` condition is supported only for gateways with HTTP targets. The following reserved path prefixes are not allowed: `/mcp`, `/a2a`, `/responses`, `/converse`, `/.well-known`.

 **matchModels**   
Matches inference requests based on the model the caller requested. The `anyOf` list contains 1 to 100 entries. Each entry has the following fields:  
+  `value` (required) — A model ID or glob pattern to match (for example, `gpt-5.5` or `gpt-5.*`), using the same model-ID-or-glob grammar that inference targets use for their `models`.
+  `operator` (optional) — The comparison operator. Valid values are `StringLike` (default) and `StringEquals`. Because `matchModels` values are glob patterns by intent, an omitted operator keeps `*` wildcards active; use `StringEquals` for an exact, literal match. This default differs from `matchPrincipals`, which defaults to `StringEquals`.

  Use `matchModels` with a `routeToTarget` action to pin which target serves a model, instead of relying on the default model-based routing when several targets match the same model. Add a `fallback` block to that action to turn the route into a fallback chain. For more information about model fallback, see [Add model fallback to a gateway](gateway-rules-fallback.md).

 **Condition evaluation logic** 
+  **Within a condition type:** The gateway uses OR logic. A request matches if it satisfies any entry in the `anyOf` list.
+  **Across condition types:** The gateway uses AND logic. If a rule has both `matchPrincipals` and `matchPaths`, the request must match at least one entry from each condition type.

## Actions
<a name="gateway-rules-actions"></a>

Actions define what the gateway does when a rule matches. A rule can have a maximum of 2 actions.

The gateway supports the following action types:

 **Configuration bundle overrides (`configurationBundle`)**   
Override the [configuration bundle](configuration-bundles.md) applied to matching traffic.  
+  `staticOverride` — Pins all matching traffic to a specific configuration bundle version. Specify the bundle ARN and version ID.
+  `weightedOverride` — Splits traffic between two configuration bundle versions. The `trafficSplit` list must contain exactly 2 entries with weights that sum to 100. The configuration bundle must be in the same account as the gateway.

 **Target routing (`routeToTarget`)**   
Routes matching traffic to a specific target that is in `Ready` state.  
+  `staticRoute` — Routes all matching traffic to a specific target by name.
+  `weightedRoute` — Splits traffic between two targets. The `trafficSplit` list must contain exactly 2 entries with weights that sum to 100. Traffic split entry names must be unique.

  For inference targets, a `staticRoute` (and each `weightedRoute` leg) can also pin the served `model` and carry an optional `fallback` block that defines an ordered chain of alternative destinations to try when the primary fails. For more information about model fallback, see [Add model fallback to a gateway](gateway-rules-fallback.md).

## Limits
<a name="gateway-rules-limits"></a>

The following table lists the limits for gateway rules.


| Resource | Limit | 
| --- | --- | 
| Rules per gateway | 20 | 
| Priority range | 1 to 1,000,000 | 
| Maximum conditions per rule | 3 (at most one of each type) | 
| Maximum actions per rule | 2 | 
|  `matchPrincipals.anyOf` maximum entries | 100 | 
|  `matchPaths.anyOf` maximum entries | 10 | 
|  `matchModels.anyOf` maximum entries | 100 | 
|  `trafficSplit` entries | Exactly 2 | 
|  `trafficSplit` weight range | 1 to 99 | 
|  `fallback.targetFallback` entries | 1 to 2 | 
|  `fallback.triggerOn.statusCodes` entries | 1 to 10 | 
|  `fallback.triggerOn.errors` entries | 1 to 3 | 
|  `firstByteTimeoutMilliseconds` range | 50 to 900,000 | 

**Topics**