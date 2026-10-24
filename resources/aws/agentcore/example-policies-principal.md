

# Principal-scoped policies
<a name="example-policies-principal"></a>

The policies in this section decide from **who is calling**. They match on the principal — a JWT identity or an IAM caller — and leave the action and input either unconstrained or only loosely constrained.

Use these patterns to express who a gateway serves: which roles may reach which class of tool, which account is excluded, and which agent gets which subset of the inventory. For rules that turn on **what** is being called or **what values** it carries, see [Action and resource scoped policies](example-policies-action-resource.md).

Every example authorizes the gateway described in [Resource configuration for examples](example-policies-reference.md). These policies use only constructs that are valid in both Dogwood and Cedar.

**Note**  
The resource you write depends on whether you name specific actions. A policy that names one or more specific actions must use a specific gateway ARN with `resource ==`. A policy that leaves the action unconstrained must use a type test, `resource is AgentCore::Gateway`. A policy that leaves the resource entirely unconstrained is rejected when you create it. For details, see [Resource specificity requirements](policy-scope.md#policy-resource-specificity).

## OAuth principals
<a name="example-policies-principal-oauth"></a>

These patterns apply when your gateway uses a JWT authorizer, so the principal is an `AgentCore::OAuthUser`. The entity ID is the token’s `sub` claim, and the token’s other claims are available as tags.

**Important**  
Every JWT claim becomes a **string** tag on the principal, whatever its type in the token. A numeric claim such as `exp` becomes the string `"1735689600"`, and a boolean becomes `"true"`. An array or object claim becomes its JSON text, so an array-valued `scope` claim becomes the string `["insurance:claim","insurance:view"]`. Compare tags with string operators, and match multi-valued claims with `like` rather than `.contains()`. A claim whose value is `null` produces no tag at all, so `hasTag` returns `false` for it.

### Require an OAuth scope
<a name="example-policies-principal-scope-claim"></a>

 **Intent:** Allow filing a claim only for principals whose `scope` claim includes `insurance:claim`.

Test with `hasTag` before reading a tag with `getTag`; reading a tag that does not exist is an error that denies the request. The `like` operator matches the scope wherever it appears in the claim, which is what you want because the `scope` claim holds several values. That holds whether the token delivers them space-separated or as a JSON array.

```
permit(
  principal is AgentCore::OAuthUser,
  action == AgentCore::Action::"InsuranceAPI___file_claim",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  principal.hasTag("scope") &&
  principal.getTag("scope") like "*insurance:claim*"
};
```

Because `like` matches substrings, choose the pattern carefully: `*insurance:claim*` also matches `insurance:claim:admin`. Match the delimiters as well if you need an exact value.

### Permit a specific user
<a name="example-policies-principal-username"></a>

 **Intent:** Allow the user `clare` to update coverage.

If the identity you want to match is the token subject, match the entity directly in the policy scope with `principal == AgentCore::OAuthUser::"<sub>"` instead. That needs no condition at all, and is cheaper to evaluate.

```
permit(
  principal is AgentCore::OAuthUser,
  action == AgentCore::Action::"InsuranceAPI___update_coverage",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  principal.hasTag("username") &&
  principal.getTag("username") == "clare"
};
```

### Permit a set of roles
<a name="example-policies-principal-role-permit"></a>

 **Intent:** Allow only administrators and managers to delete a claim.

```
permit(
  principal is AgentCore::OAuthUser,
  action == AgentCore::Action::"InsuranceAPI___delete_claim",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  principal.hasTag("role") &&
  (principal.getTag("role") == "admin" || principal.getTag("role") == "manager")
};
```

### Forbid everyone except a set of roles
<a name="example-policies-principal-role-forbid"></a>

 **Intent:** Block coverage updates unless the principal is a senior adjuster or a manager.

This reaches a similar outcome to the previous example by the opposite route, and the difference matters. A `permit` grants access that another `permit` could also grant independently. A `forbid …​ unless` denies access that no `permit` can restore, because `forbid` always wins. Use `forbid …​ unless` for a restriction you want to hold regardless of what other policies the engine contains.

```
forbid(
  principal is AgentCore::OAuthUser,
  action == AgentCore::Action::"InsuranceAPI___update_coverage",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
unless {
  principal.hasTag("role") &&
  (principal.getTag("role") == "senior-adjuster" || principal.getTag("role") == "manager")
};
```

### Block a user everywhere on the gateway
<a name="example-policies-principal-block-user"></a>

 **Intent:** Revoke all access for a suspended account immediately.

Because the action is unconstrained, the resource is written as the type test `resource is AgentCore::Gateway` rather than a specific ARN. This policy applies to every gateway the policy engine is attached to, and to every target type on them — MCP tools, runtime invocations, and inference calls alike.

```
forbid(
  principal is AgentCore::OAuthUser,
  action,
  resource is AgentCore::Gateway
)
when {
  principal.hasTag("username") &&
  principal.getTag("username") == "suspended-user"
};
```

## IAM principals
<a name="example-policies-principal-iam"></a>

These patterns apply when your gateway uses `AWS_IAM`, so the principal is an `AgentCore::IamEntity`. The entity ID is the caller’s ARN with the session name removed, which makes an assumed role appear as `arn:aws:sts::<account>:assumed-role/<role-name>` and lets you match it reliably across sessions.

### Permit any IAM caller
<a name="example-policies-principal-iam-any"></a>

 **Intent:** Allow any IAM-authenticated caller to read a contract.

Use this only when authenticating as any IAM identity is a sufficient authorization decision. The gateway’s resource policy and its execution role already limit who can reach it.

```
permit(
  principal is AgentCore::IamEntity,
  action == AgentCore::Action::"InsuranceAPI___get_contract",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);
```

### Permit one specific IAM role
<a name="example-policies-principal-iam-role"></a>

 **Intent:** Allow only the claims-processing service to disburse payments.

Matching with `principal ==` in the policy scope is the most precise form and needs no condition. Write the ARN without a session name; the service removes the session name before evaluation.

```
permit(
  principal == AgentCore::IamEntity::"arn:aws:sts::123456789012:assumed-role/ClaimsProcessorRole",
  action == AgentCore::Action::"InsuranceAPI___disburse_payment",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);
```

### Match a family of IAM roles
<a name="example-policies-principal-iam-pattern"></a>

 **Intent:** Allow any claims-processing role, in any account, to read claim status.

Use `principal.id like` when one policy must cover several roles. Two other useful patterns:
+  `principal.id like "arn:aws:sts::123456789012:assumed-role/*"` matches any role in one account.
+  `principal.id like "*:123456789012:*"` matches any IAM ARN from one account, whatever its form.

```
permit(
  principal is AgentCore::IamEntity,
  action == AgentCore::Action::"InsuranceAPI___get_claim_status",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  principal.id like "arn:aws:sts::*:assumed-role/ClaimsProcessor*"
};
```

A `like` pattern with no wildcard is equivalent to `principal ==` but costs a condition, so prefer `principal ==` for a single role.

### Forbid an account
<a name="example-policies-principal-iam-forbid-account"></a>

 **Intent:** Block a vendor account from every action on the gateway.

The pattern `*:444455556666:*` matches any ARN containing that account ID, in any of the forms an IAM caller can take. Because `forbid` wins over every `permit`, this holds no matter what else the engine allows.

```
forbid(
  principal is AgentCore::IamEntity,
  action,
  resource is AgentCore::Gateway
)
when {
  principal.id like "*:444455556666:*"
};
```

### Forbid a read-only role from write operations
<a name="example-policies-principal-iam-forbid-role"></a>

 **Intent:** Prevent a role intended for reads from reaching any tool that changes state.

A `forbid` that lists the write actions fails safe in one direction only. Adding a new read tool needs no policy change. Adding a new write tool requires you to extend the list, or the new tool goes unprotected. If you prefer the opposite bias, write a `permit` that lists the read actions instead, so a newly added tool is denied until you deliberately allow it.

```
forbid(
  principal == AgentCore::IamEntity::"arn:aws:sts::123456789012:assumed-role/ReadOnlyAgentRole",
  action in [
    AgentCore::Action::"InsuranceAPI___file_claim",
    AgentCore::Action::"InsuranceAPI___update_coverage",
    AgentCore::Action::"InsuranceAPI___approve_claim",
    AgentCore::Action::"InsuranceAPI___disburse_payment",
    AgentCore::Action::"InsuranceAPI___delete_claim"
  ],
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);
```

### Give each agent its own tool set
<a name="example-policies-principal-iam-multi-agent"></a>

 **Intent:** Let a triage agent read claims while a processing agent both reads and disburses.

Several agents can share one gateway and one policy engine while seeing different tools. Each agent’s `tools/list` response contains only the tools its principal is authorized to call, so an agent is not told about tools it cannot use.

```
// Triage agent: read only
permit(
  principal == AgentCore::IamEntity::"arn:aws:sts::123456789012:assumed-role/TriageAgentRole",
  action in [
    AgentCore::Action::"InsuranceAPI___get_contract",
    AgentCore::Action::"InsuranceAPI___get_claim_status"
  ],
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);

// Processing agent: read, approve, and disburse
permit(
  principal == AgentCore::IamEntity::"arn:aws:sts::123456789012:assumed-role/ProcessingAgentRole",
  action in [
    AgentCore::Action::"InsuranceAPI___get_contract",
    AgentCore::Action::"InsuranceAPI___get_claim_status",
    AgentCore::Action::"InsuranceAPI___approve_claim",
    AgentCore::Action::"InsuranceAPI___disburse_payment"
  ],
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);
```