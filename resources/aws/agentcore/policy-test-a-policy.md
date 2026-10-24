

# Test a policy in LOG\_ONLY mode
<a name="policy-test-a-policy"></a>

Using the policy-level enforcement mode, you can toggle between `ACTIVE` and `LOG_ONLY` to answer the question: "What would this policy do to my traffic if it was applied?" Per policy `LOG_ONLY` mode lets you test a policy on real traffic without affecting authorization decisions. The policy evaluates every request as if it were enforced, but only writes results to logs. Nothing is blocked or permitted as a result of a policy whose enforcement mode is `LOG_ONLY`. Once you trust the results, promote it to `ACTIVE`.

**Topics**
+ [How LOG\_ONLY mode works](#how-log-only-mode-works)
+ [LOG\_ONLY policies and LOG\_ONLY policy engines](#log-only-policies-and-log-only-policy-engines)
+ [Set the enforcement mode of a policy](#set-the-enforcement-mode-of-a-policy)
+ [Observe LOG\_ONLY results](#observe-log-only-results)
+ [Promote a policy to enforcement](#promote-a-policy-to-enforcement)
+ [Choosing a threshold with LOG\_ONLY mode](#choosing-a-threshold-with-log-only-mode)
+ [Considerations and limitations](#policy-log-only-considerations-and-limitations)

## How LOG\_ONLY mode works
<a name="how-log-only-mode-works"></a>

Every policy in a policy engine has an enforcement mode of either `ACTIVE` or `LOG_ONLY`. The default is `ACTIVE`, so existing policies, and any new policy you create without specifying the field, continue to enforce as before. When the policy engine evaluates a request, it evaluates your `ACTIVE` policies and your `LOG_ONLY` policies side by side, but only enforces on your `ACTIVE` policies.

 `ACTIVE` policies determine the decision that is returned to the AgentCore Gateway and enforced. The policy engine applies "default-deny" and "forbid-wins" semantics, which means that a request is allowed only if a policy permits it, and a single forbid from any active policy denies it.

 `LOG_ONLY` policies are evaluated against the same request, but their outcomes are kept separate. They are reported in traces and emitted as Amazon CloudWatch metrics. They are never combined into the enforced decision.


| Enforcement Mode | Evaluated on each request? | Affects the returned decision? | 
| --- | --- | --- | 
|  `ACTIVE` (default) | Yes | Yes | 
|  `LOG_ONLY`  | Yes | No | 

A request is evaluated in two stages:

1. The policy engine computes a decision. Only `ACTIVE` policies contribute to it. `LOG_ONLY` policies are evaluated and reported separately, but are never factored in.

1. If the engine is associated to a gateway in `ENFORCE` mode, the Gateway either allows or denies the action according to the policy engine’s decision. If the engine is associated to a gateway in `LOG_ONLY` mode, the Gateway takes no action; the decision is recorded but not enforced.

 `ACTIVE` and `LOG_ONLY` are treated as two isolated sets; a `LOG_ONLY` policy can never change what your callers experience. The decision a request receives is not impacted by any `LOG_ONLY` policies.

In addition to recording the `LOG_ONLY` policies that matched on a request, the policy engine reports which of those policies would have changed the decision if they were `ACTIVE`. This is a key signal to use when assessing a policy’s efficacy and safety (i.e., whether it can be promoted to `ACTIVE`). For example, a `LOG_ONLY` policy that matches frequently and appears in the decision-flipping set would have blocked your traffic during the observation window. Each `LOG_ONLY` policy is evaluated independent of all other `LOG_ONLY` policies to determine the set of decision-flipping policies. However, each `LOG_ONLY` policy evaluation does consider all current `ACTIVE` policies.

## LOG\_ONLY policies and LOG\_ONLY policy engines
<a name="log-only-policies-and-log-only-policy-engines"></a>

Policy in AgentCore has two separate controls that both use the value LOG\_ONLY. They operate at different layers and answer different questions, so it is important to understand which one you are setting.

 **Policy engine enforcement mode:** controls the overall behavior of the engine. When set to `LOG_ONLY`, no policy in the engine is enforced, regardless of its individual policy mode. All decisions are logged. This is set using the `mode` field of the `policyEngineConfiguration` when you associate a policy engine with a gateway using the `CreateGateway` or `UpdateGateway` operations. The two values that `mode` accepts are `ENFORCE` (default) and `LOG_ONLY`.

Policy mode controls the behavior of a single policy within an enforcing engine. When set to LOG\_ONLY, that policy is still evaluated, but its decision is logged rather than enforced. All other `ACTIVE` policies in the engine continue to enforce normally. The two values that `enforcementMode` accepts are `ACTIVE` (default) and `LOG_ONLY`.

Use policy-level LOG\_ONLY to shadow-test a new guardrail in production without affecting traffic. Use engine-level LOG\_ONLY to observe the behavior of all policies before enabling enforcement.


<table>
<tbody>
  <tr><td rowspan="2" colspan="2"></td><td colspan="2"> <b>Policy Enforcement Mode</b> </td></tr>
  <tr><td> <code>ACTIVE</code> </td><td> <code>LOG_ONLY</code> </td></tr>
  <tr><td rowspan="2"> <b>Policy Engine Enforcement Mode</b> </td><td> <code>ENFORCE</code> </td><td>Evaluated and enforced. May block or modify requests.</td><td>Evaluated but not enforced. Decision is logged only; other <code>ACTIVE</code> policies in the engine still enforce.</td></tr>
  <tr><td> <code>LOG_ONLY</code> </td><td>Evaluated but not enforced. Decision is logged only.</td><td>Evaluated but not enforced. Decision is logged only.</td></tr>
</tbody>
</table>


**Note**  
Policy engine enforcement mode takes precedence. When a policy engine is associated in LOG\_ONLY mode, no policy can deny a Gateway action — not even a policy in `ACTIVE` enforcement mode — because the Gateway does not act on the policy engine’s decision at all. The engine still computes the decision and you still receive `LOG_ONLY` telemetry; the decision is simply not enforced.

## Set the enforcement mode of a policy
<a name="set-the-enforcement-mode-of-a-policy"></a>

You can set the `enforcementMode` field on a policy when you create or update the policy (i.e., `CreatePolicy` and `UpdatePolicy`), and it is returned by `GetPolicy` and `ListPolicies`.

 **Create a policy in `LOG_ONLY` mode** Create a policy in `LOG_ONLY` mode by setting `enforcementMode` to `LOG_ONLY` in the `CreatePolicy` request. The following example creates a policy with a guardrail that forbids violent content above a confidence threshold, but only observes it. For more information, see [Guardrails in policies](policy-guardrails-in-policies.md).

**Example**  

1. Save the statement to `log_only_violence.dw`, then add it with `LOG_ONLY` enforcement and deploy:

   ```
   agentcore add policy --name LogOnlyViolenceFilter \
     --engine my_policy_engine \
     --source log_only_violence.dw \
     --enforcement-mode LOG_ONLY \
     --validation-mode IGNORE_ALL_FINDINGS
   
   agentcore deploy --yes
   ```

1. Run the following code in a terminal to create the policy in `LOG_ONLY` mode using the AWS CLI:

   ```
   aws bedrock-agentcore-control create-policy \
     --policy-engine-id my_policy_engine-a1b2c3d4e5 \
     --name LogOnlyViolenceFilter \
     --enforcement-mode LOG_ONLY \
     --validation-mode IGNORE_ALL_FINDINGS \
     --definition '{"policy":{"statement":"forbid (principal, action == AgentCore::Action::\"MyTarget___send_message\", resource == AgentCore::Gateway::\"arn:aws:bedrock-agentcore:us-east-1:111122223333:gateway/my-gateway-a1b2c3d4e5\") when guardrails { BedrockGuardrails::ContentFilter([\"VIOLENCE\"], [context.input.userMessage])[\"VIOLENCE\"].confidenceScore.greaterThan(decimal(\"0.7\")) };"}}'
   ```

1. Run the following code to create the policy in `LOG_ONLY` mode using the AWS SDK for Python:

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   GATEWAY_ARN = 'arn:aws:bedrock-agentcore:us-east-1:111122223333:gateway/my-gateway-a1b2c3d4e5'
   
   statement = (
       'forbid (principal, '
       'action == AgentCore::Action::"MyTarget___send_message", '
       f'resource == AgentCore::Gateway::"{GATEWAY_ARN}") '
       'when guardrails { BedrockGuardrails::ContentFilter('
       '["VIOLENCE"], [context.input.userMessage])["VIOLENCE"]'
       '.confidenceScore.greaterThan(decimal("0.7")) };'
   )
   
   response = client.create_policy(
       policyEngineId='my_policy_engine-a1b2c3d4e5',
       name='LogOnlyViolenceFilter',
       enforcementMode='LOG_ONLY',
       validationMode='IGNORE_ALL_FINDINGS',
       definition={'policy': {'statement': statement}},
   )
   print(response['policyId'], response['enforcementMode'])
   ```

The response echoes the policy with "enforcementMode": "LOG\_ONLY". The policy begins evaluating against traffic and from that point its matches appear in traces and CloudWatch metrics — without affecting any decision.

 **List policies and their enforcement modes** 

ListPolicies returns `enforcementMode` in each policy summary, so you can see at a glance which policies are observing and which are enforcing.

**Example**  

1. Show the deployed policies the project manages and their state:

   ```
   agentcore status
   ```

    `agentcore status` covers only this project’s resources. Use the AWS CLI or an SDK to list every policy in an engine.

1. Run the following code in a terminal to list policies and their enforcement modes using the AWS CLI:

   ```
   aws bedrock-agentcore-control list-policies \
     --policy-engine-id my_policy_engine-a1b2c3d4e5 \
     --query 'policies[].{name:name,enforcementMode:enforcementMode,status:status}'
   ```

1. Run the following code to list policies and their enforcement modes using the AWS SDK for Python:

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   paginator = client.get_paginator('list_policies')
   for page in paginator.paginate(policyEngineId='my_policy_engine-a1b2c3d4e5'):
       for policy in page['policies']:
           print(policy['name'], policy['enforcementMode'], policy['status'])
   ```

 **response** 

```
[
  { "name": "LogOnlyViolenceFilter", "enforcementMode": "LOG_ONLY", "status": "ACTIVE" },
  { "name": "RefundLimit",           "enforcementMode": "ACTIVE",   "status": "ACTIVE" }
]
```

## Observe LOG\_ONLY results
<a name="observe-log-only-results"></a>

When a caller makes a tools/call request through the AgentCore Gateway, the gateway evaluates all policies — including `LOG_ONLY` policies — before returning the MCP response to the caller. The caller’s response is never affected by `LOG_ONLY` policies; those results are reported through observability only.

You observe `LOG_ONLY` policy behavior through traces and Amazon CloudWatch metrics:

 **Traces and spans:** When you enable tracing on your gateway, policy evaluation spans include `LOG_ONLY` match information. You can inspect these spans in the AgentCore Observability console to see which `LOG_ONLY` policies fired on a given request and whether they would have flipped the decision. For more information, see [Observe your agent applications on Amazon Bedrock AgentCore Observability](observability.md).

 **CloudWatch metrics:** Policy in AgentCore emits metrics under the AWS/Bedrock-AgentCore namespace. The following metrics are specific to `LOG_ONLY` evaluation:


| Metric | What it tells you | 
| --- | --- | 
|  `ConfidenceScore` (with PolicyEnforcementMode=`LOG_ONLY`) | The confidence score the guardrail returned for a matched `LOG_ONLY` policy. Use this to understand your traffic’s score distribution when choosing a threshold. | 
|  `ConfidenceThreshold` (with `PolicyEnforcementMode=LOG_ONLY`) | The threshold configured on the `LOG_ONLY` policy. Useful when comparing score against threshold across policies. | 
|  `LogOnlyMatches`  | The count of requests where a `LOG_ONLY` policy fired. Emitted per policy and as a group rollup across all `LOG_ONLY` policies on the engine. | 
|  `LogOnlyDecisionFlips`  | The count of requests where a `LOG_ONLY` policy would have changed the decision if promoted. This is the key promotion signal: a sustained zero means promoting the policy will not block current traffic. | 
|  `LogOnlyEvalIncomplete`  | Emitted when `LOG_ONLY` evaluation was partial. Use this to alarm on a sustained rate of incomplete evaluations. | 

All metrics include PolicyEngine and OperationName dimensions for filtering. Per-policy metrics additionally include a Policy dimension with the policy ID.

For more information about viewing metrics for your AgentCore resources, see [Observe your agent applications on Amazon Bedrock AgentCore Observability](observability.md).

## Promote a policy to enforcement
<a name="promote-a-policy-to-enforcement"></a>

When you are confident in a `LOG_ONLY` policy, promote it to enforcement with `UpdatePolicy`, setting `enforcementMode` to `ACTIVE`. No other change is required, and the policy keeps its ID, name, and definition.

**Example**  

1. Change the policy’s enforcement mode in the project and deploy:

   ```
   agentcore add policy --name LogOnlyViolenceFilter \
     --engine my_policy_engine \
     --source log_only_violence.dw \
     --enforcement-mode ACTIVE \
     --validation-mode IGNORE_ALL_FINDINGS
   
   agentcore deploy --yes
   ```

1. Run the following code in a terminal to promote the policy using the AWS CLI:

   ```
   aws bedrock-agentcore-control update-policy \
     --policy-engine-id my_policy_engine-a1b2c3d4e5 \
     --policy-id LogOnlyViolenceFilter-a1b2c3d4e5 \
     --enforcement-mode ACTIVE
   ```

1. Run the following code to promote the policy using the AWS SDK for Python:

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   client.update_policy(
       policyEngineId='my_policy_engine-a1b2c3d4e5',
       policyId='LogOnlyViolenceFilter-a1b2c3d4e5',
       enforcementMode='ACTIVE',
   )
   ```

The reverse is also supported: you can move an `ACTIVE` policy back to `LOG_ONLY` to take it out of enforcement while keeping it in place and continuing to observe it.

A typical lifecycle is therefore to create a policy in `LOG_ONLY`, observe traffic and metrics, and then promote it to `ACTIVE` — and, if needed, demote it back to `LOG_ONLY` without deleting and recreating the policy.

## Choosing a threshold with LOG\_ONLY mode
<a name="choosing-a-threshold-with-log-only-mode"></a>

 `LOG_ONLY` mode is particularly useful for guardrails, where you need to select a confidence-score threshold that balances security against disruption to legitimate traffic. A threshold that is too low blocks legitimate requests; one that is too high may let threats through.

 **The recommended workflow:** Deploy the policy in `LOG_ONLY` mode with a threshold you believe is reasonable (for example, 0.7). The policy evaluates every request and emits a confidence score to CloudWatch metrics, but never blocks traffic.

Accumulate data over a representative window — days or weeks of real production traffic. The ConfidenceScore metric (with PolicyEnforcementMode=LOG\_ONLY) gives you the distribution of scores your traffic produces.

Analyze the scores against ground truth. If you have a labeled test set (prompts marked as benign or malicious), you can compute precision and recall at each threshold value and select the one that best meets your goals. If you do not have labeled data, sample prompts from the high-score range (for example, 0.8–1.0), the low-score range (0–0.2), and the ambiguous middle zone (0.4–0.7), then classify each sample to build confidence in your threshold choice. Update the policy with your chosen threshold and promote it to `ACTIVE`:

**Example**  

1. Edit the threshold in `log_only_violence.dw`, then re-add the policy with `ACTIVE` enforcement and deploy:

   ```
   agentcore add policy --name LogOnlyViolenceFilter \
     --engine my_policy_engine \
     --source log_only_violence.dw \
     --enforcement-mode ACTIVE \
     --validation-mode IGNORE_ALL_FINDINGS
   
   agentcore deploy --yes
   ```

1. Run the following code in a terminal to update the threshold and promote the policy using the AWS CLI:

   ```
   aws bedrock-agentcore-control update-policy \
     --policy-engine-id my_policy_engine-a1b2c3d4e5 \
     --policy-id LogOnlyViolenceFilter-a1b2c3d4e5 \
     --enforcement-mode ACTIVE \
     --definition '{"policy":{"statement":"forbid (principal, action == AgentCore::Action::\"MyTarget___send_message\", resource == AgentCore::Gateway::\"arn:aws:bedrock-agentcore:us-east-1:111122223333:gateway/my-gateway-a1b2c3d4e5\") when guardrails { BedrockGuardrails::ContentFilter([\"VIOLENCE\"], [context.input.userMessage])[\"VIOLENCE\"].confidenceScore.greaterThan(decimal(\"0.65\")) };"}}'
   ```

1. Run the following code to update the threshold and promote the policy using the AWS SDK for Python:

   ```
   import boto3
   
   client = boto3.client('bedrock-agentcore-control')
   
   GATEWAY_ARN = 'arn:aws:bedrock-agentcore:us-east-1:111122223333:gateway/my-gateway-a1b2c3d4e5'
   
   statement = (
       'forbid (principal, '
       'action == AgentCore::Action::"MyTarget___send_message", '
       f'resource == AgentCore::Gateway::"{GATEWAY_ARN}") '
       'when guardrails { BedrockGuardrails::ContentFilter('
       '["VIOLENCE"], [context.input.userMessage])["VIOLENCE"]'
       '.confidenceScore.greaterThan(decimal("0.65")) };'
   )
   
   client.update_policy(
       policyEngineId='my_policy_engine-a1b2c3d4e5',
       policyId='LogOnlyViolenceFilter-a1b2c3d4e5',
       enforcementMode='ACTIVE',
       definition={'policy': {'statement': statement}},
   )
   ```

This workflow ensures the threshold reflects your actual traffic patterns rather than a generic default.

## Considerations and limitations
<a name="policy-log-only-considerations-and-limitations"></a>

 `LOG_ONLY` policies never affect decisions. A `LOG_ONLY` policy cannot cause an action to be allowed or denied. The decision a request receives is identical to the decision it would receive if the `LOG_ONLY` policy did not exist. This is the core guarantee of the feature.

Changes are eventually consistent. Creating, updating, or promoting a policy is applied to the evaluation path within a few seconds. Plan your observation windows and promotion steps accordingly rather than expecting an instantaneous switch.

Result lists are bounded. `LOG_ONLY` match and decision-flipping lists are each capped at 1,000 entries per request. For engines with very large numbers of `LOG_ONLY` policies, rely on the CloudWatch metrics for complete aggregate counts.

Evaluation can be partial. When `LOG_ONLY` evaluation is incomplete for a request, the `LOG_ONLY` signals for that request might be missing entries. The enforced decision is never affected.