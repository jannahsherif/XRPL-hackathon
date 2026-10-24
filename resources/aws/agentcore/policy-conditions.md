

# Policy conditions
<a name="policy-conditions"></a>

Conditions add fine-grained logic to policies using `when` and `unless` clauses:

```
when {
  principal.hasTag("username") &&
  principal.getTag("username") == "refund-agent" &&
  context.input.amount < 500
}
```

## Condition types
<a name="policy-condition-types"></a>
+  `when { …​ }` - Policy applies only if the condition is true
+  `unless { …​ }` - Policy applies only if the condition is false
+  `when guardrails { …​ }` - Policy applies only if the condition asserted on the output(s) of one or more guardrails evaluates to true
+  `unless guardrails { …​ }` - Policy applies only if the condition asserted on the output(s) of one or more guardrails evaluates to false

## Tool arguments
<a name="policy-tool-arguments"></a>

 `context.input` contains the arguments passed to the tool call:

```
context.input.amount < 500
```

When a user calls `RefundTool___process_refund` with arguments like:

```
{
  "orderId": "12345",
  "amount": 450,
  "reason": "Defective product"
}
```

The policy can access these values:
+  `context.input.orderId` → "12345"
+  `context.input.amount` → 450
+  `context.input.reason` → "Defective product"

Policies can make decisions based on specific tool call parameters.

## Principal attributes
<a name="policy-principal-attributes"></a>

Principal attributes differ based on the authentication type configured for your AgentCore Gateway.

### OAuth claims (tags)
<a name="policy-oauth-claims"></a>

For OAuth-authenticated gateways, JWT claims from the OAuth token are stored as tags on the OAuthUser entity. Example JWT claims:

```
{
  "sub": "user-123",
  "username": "refund-agent",
  "scope": "refund:write admin:read",
  "role": "admin"
}
```

These claims become tags on the principal entity. Check if a tag exists:

```
principal.hasTag("username")
```

Get a tag value:

```
principal.getTag("username") == "refund-agent"
```

Pattern matching:

```
principal.getTag("scope") like "*refund:write*"
```

### IAM entity attributes
<a name="policy-iam-attributes"></a>

For IAM-authenticated gateways, the principal has an `id` attribute containing the caller’s IAM ARN. IAM principals do not support tags.

#### Principal entity format
<a name="policy-iam-principal-format"></a>

The Cedar principal for IAM-authenticated gateways is `AgentCore::IamEntity`. The `principal.id` attribute contains the caller’s IAM ARN.

For callers authenticating via an assumed IAM role, the `principal.id` and Cedar entity ID use the format:

 `arn:aws:sts::<account-id>:assumed-role/<role-name>` 

For example, if a caller assumes the role `MyServiceRole`, the Cedar entity ID is:

 `AgentCore::IamEntity::"arn:aws:sts::123456789012:assumed-role/MyServiceRole"` 

This format is stable across invocations, so you can use `principal ==` for exact role matching.

#### Pattern matching with `like`
<a name="policy-iam-pattern-matching"></a>

You can also use the `like` operator with wildcards for broader matching:

```
// Match any role in a specific account
principal.id like "arn:aws:sts::123456789012:assumed-role/*"

// Match specific AWS account (any ARN format)
principal.id like "*:123456789012:*"

// Match a specific IAM role name across any account
principal.id like "arn:aws:sts::*:assumed-role/AdminRole"
```

## Logical operators
<a name="policy-logical-operators"></a>

Combine multiple conditions using logical operators:
+  `&&` - AND (all conditions must be true)
+  `||` - OR (at least one condition must be true)
+  `!` - NOT (negates a condition)

Example:

```
principal.hasTag("username") &&              // User must have username tag
principal.getTag("username") == "refund-agent" &&  // Username must be "refund-agent"
context.input.amount < 500                   // Amount must be less than $500
```