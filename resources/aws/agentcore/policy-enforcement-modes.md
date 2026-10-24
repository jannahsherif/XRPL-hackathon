

# Policy enforcement modes
<a name="policy-enforcement-modes"></a>

Enforcement mode defines how the gateway applies policy decisions. The policy engine supports two modes:
+ In `LOG_ONLY` mode, the policy engine evaluates and logs whether the action would be allowed or denied without enforcing the decision
+ In `ENFORCE` mode, the policy engine evaluates the action and enforces decisions by allowing or denying agent operations.

## Restrict permission to change enforcement mode
<a name="policy-enforcement-modes-security"></a>

If you have the `bedrock-agentcore:UpdateGateway` permission, you can change a Gateway’s `policyEngineConfiguration.mode` from `ENFORCE` to `LOG_ONLY`. In `LOG_ONLY` mode, all policies are evaluated but not enforced, and every tool call succeeds regardless of forbid policies. The same permission can set `policyEngineConfiguration` to `null`, which removes the policy engine entirely. No separate action or condition key protects the `mode` field beyond `bedrock-agentcore:UpdateGateway`, so grant this permission only to trusted principals.