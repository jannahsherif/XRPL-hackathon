

# Action and resource scoped policies
<a name="example-policies-action-resource"></a>

The policies in this section are matched on **what is being called** — which action, on which gateway, with which input values — rather than on who is calling. They do not govern which principals may take the action; any caller the gateway authenticates is in scope.

For rules based on the caller’s identity, see [Principal-scoped policies](example-policies-principal.md). The [Combined policies](#example-policies-action-resource-combined) section at the end shows the two kinds working together.

Every example authorizes the gateway described in [Resource configuration for examples](example-policies-reference.md). These policies use only constructs that are valid in both Dogwood and Cedar.

## Requirements for the action and resource scope
<a name="example-policies-action-resource-pairing"></a>

Two requirements apply to every policy on this page, and a policy that breaks either one is rejected when you create it.

 **The action scope and the resource scope have to agree.** Which resource form you write follows from whether you named specific actions:


| If the action scope is | The resource scope must be | 
| --- | --- | 
| One or more specific actions — `action == …` or `action in […]`  | A specific gateway — `resource == AgentCore::Gateway::"<arn>"`  | 
| Unconstrained — a bare `action`  | A type test — `resource is AgentCore::Gateway`  | 

 **The resource can never be left unconstrained.** A bare `resource` is rejected with `a wildcard resource was detected`, whichever action scope you used.

Naming a specific action therefore means knowing the gateway ARN, which you only have once the gateway exists. For details, see [Resource specificity requirements](policy-scope.md#policy-resource-specificity).

## Where wildcards work
<a name="example-policies-action-resource-wildcards"></a>

 `*` means different things in different parts of a policy, and it is not accepted everywhere.

 **Not in an action name.** Cedar has no wildcard for action names, so `AgentCore::Action::"InsuranceAPI___get*"` is not valid. List the actions with `action in [ …​ ]`, or scope the policy to the whole target with `action in AgentCore::Action::"<TargetName>"`, which also picks up tools added to that target later. For more information, see [Multiple actions](policy-scope.md#policy-action-wildcards).

 **Not in a resource.** A bare `resource` is rejected. Use a specific gateway ARN or the type test `resource is AgentCore::Gateway`, as described in the previous section.

 **Yes in a string comparison.** Inside a condition, `like` takes a pattern in which `*` matches any run of characters — this is the one place a wildcard applies:

```
context.input.coverageType like "auto*"
```

Anchor the pattern where you can: `auto*` matches values beginning with `auto`, while `*auto*` would also match `semi-auto-salvage`.

## Selecting actions
<a name="example-policies-action-resource-scope"></a>

### Permit several actions at once
<a name="example-policies-action-resource-multi-action"></a>

 **Intent:** Allow reading contract details and claim status.

Grouping related read operations with `action in [ …​ ]` avoids one policy per tool. Each action is named explicitly because action names take no wildcard — see [Where wildcards work](#example-policies-action-resource-wildcards).

 **We recommend scoping to the target when you want the whole tool set.** Writing `action in AgentCore::Action::"<TargetName>"` covers every tool the target exposes, including tools added later, so the policy does not need editing each time the target gains a tool. The trade-off is that a target-scoped policy cannot carry a condition on tool input, because the input differs per tool. For more information, see [Multiple actions](policy-scope.md#policy-action-wildcards).

```
permit(
  principal,
  action in [
    AgentCore::Action::"InsuranceAPI___get_contract",
    AgentCore::Action::"InsuranceAPI___get_claim_status"
  ],
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);
```

### Permit a runtime target invocation
<a name="example-policies-action-resource-runtime"></a>

 **Intent:** Allow invoking the claims assistant.

An AgentCore Runtime target is authorized as a single action, named for the target and the method and path it is invoked with. It is not one action per tool the agent might use internally. For a runtime target that path is always `/invocations`. Whatever tools the agent calls behind that boundary are outside this policy’s reach, so govern those on their own gateway.

```
permit(
  principal,
  action == AgentCore::Action::"ClaimsAgent___POST:/invocations",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);
```

### Permit inference requests on every path
<a name="example-policies-action-resource-inference"></a>

 **Intent:** Allow all three inference APIs the gateway exposes.

Each inference target is one action, and a gateway has one target per API shape, so a policy must name every path you intend to allow. Naming only one leaves the others denied — or, for a `forbid`, unscreened.

```
permit(
  principal,
  action in [
    AgentCore::Action::"ClaimsChat___POST:/v1/chat/completions",
    AgentCore::Action::"ClaimsResponses___POST:/v1/responses",
    AgentCore::Action::"ClaimsMessages___POST:/v1/messages"
  ],
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);
```

### Restrict which model may be invoked
<a name="example-policies-action-resource-model"></a>

 **Intent:** Allow chat completions only against an approved model family.

 `model` is a scalar string in every inference envelope, so an ordinary condition reads it directly. This works the same way in Dogwood, because Dogwood accepts every Cedar condition.

```
permit(
  principal,
  action == AgentCore::Action::"ClaimsChat___POST:/v1/chat/completions",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  context.input.model like "openai.gpt-oss-*"
};
```

The `model` value carries both the provider and the model, in the form `<provider>.<model>`. Match it exactly to pin one model, as in `"openai.gpt-oss-120b-1:0"`. Anchor a `like` pattern on the provider prefix to allow that provider’s models only, as in `like "openai.*"`. Repeat the policy for `ClaimsResponses` and `ClaimsMessages` with their own approved values.

**Important**  
 **A Cedar condition cannot read the conversation itself — use a guardrail for that.**   
Conditions on an inference target reach only the **scalar** members of the request body, such as `model` or `max_tokens`. They cannot reach the message text. `context.input.messages` is a `Set<record>`, and no Dogwood or Cedar operator reads a string out of one. Set operators such as `isEmpty` apply to the set itself. However, neither Cedar nor Dogwood has array-projection syntax for the strings inside it.  
To act on what was actually said, write a guardrail whose data path is a JSONPath into the message array. For a policy you can copy for each inference API, see [Reaching text inside arrays with a JSONPath](example-policies-guardrails.md#example-policies-guardrails-jsonpath).

## Conditions on tool input
<a name="example-policies-action-resource-input"></a>

 `context.input` holds the parameters of the call being authorized. For an MCP tool it holds the tool arguments; for a runtime or inference target it holds the request body. The operators available on a parameter follow from its type — see [Parameter types in conditions](example-policies-reference.md#example-policies-types).

### String equality
<a name="example-policies-action-resource-string"></a>

 **Intent:** Allow filing a claim only for the claim types the business supports.

```
permit(
  principal,
  action == AgentCore::Action::"InsuranceAPI___file_claim",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  (context.input.claimType == "health" ||
   context.input.claimType == "property" ||
   context.input.claimType == "auto")
};
```

### Set membership
<a name="example-policies-action-resource-set"></a>

 **Intent:** Express the same rule against a list of accepted values.

A set literal with `.contains()` reads better than a chain of `||` comparisons as the list grows, and the two forms are equivalent. Note the direction: the set is the receiver and the value is the argument.

```
permit(
  principal,
  action == AgentCore::Action::"InsuranceAPI___file_claim",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  ["health", "property", "auto"].contains(context.input.claimType)
};
```

### Pattern matching
<a name="example-policies-action-resource-pattern"></a>

 **Intent:** Allow premium calculation for any automotive coverage type.

In a `like` pattern `*` matches any run of characters, so `auto`, `auto-liability`, and `auto-collision` all match. This is the only place in a policy where a wildcard applies — not in action names or resources. For more information, see [Where wildcards work](#example-policies-action-resource-wildcards).

```
permit(
  principal,
  action == AgentCore::Action::"InsuranceAPI___calculate_premium",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  context.input.coverageType like "auto*"
};
```

### Integer comparison
<a name="example-policies-action-resource-integer"></a>

 **Intent:** Allow filing a claim only against a policy term of at least twelve months.

 `policyTermMonths` is an `integer` in the tool schema, so it is a Cedar `Long` and the ordered operators `<`, `⇐`, `>`, and `>=` apply directly.

```
permit(
  principal,
  action == AgentCore::Action::"InsuranceAPI___file_claim",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  context.input.policyTermMonths >= 12
};
```

### Decimal comparison
<a name="example-policies-action-resource-decimal"></a>

 **Intent:** Allow a claim to be filed only for amounts below 1,000.

```
permit(
  principal,
  action == AgentCore::Action::"InsuranceAPI___file_claim",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  context.input.amount.lessThan(decimal("1000.00"))
};
```

**Important**  
Before writing a comparison on a numeric parameter, confirm which operators its type supports. `amount` is a `number` in the tool schema, so it is a Cedar `decimal`: compare it with `lessThan`, `lessThanOrEqual`, `greaterThan`, or `greaterThanOrEqual` against a quoted `decimal("…​")` literal. An `integer` parameter is a Cedar `Long` and uses the ordinary `<` and `>` operators instead.  
For more information about the operators each numeric type accepts, see [Numeric parameters](example-policies-reference.md#example-policies-numeric), which also covers the extra restriction inside a `temporal { }` block, and how the type error is reported.

### Boolean condition
<a name="example-policies-action-resource-boolean"></a>

 **Intent:** Allow an approval to be recorded only when it is affirmative.

A `boolean` parameter is used directly as a condition. To require the opposite, write `!context.input.approved`. Ordered operators do not apply — `context.input.approved > true` fails creation with `expected datetime, or duration, or Long`.

```
permit(
  principal,
  action == AgentCore::Action::"InsuranceAPI___approve_claim",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  context.input.approved
};
```

### Nested object members
<a name="example-policies-action-resource-record"></a>

 **Intent:** Allow premium calculation only for policies with no prior claims in a supported region.

An `object` parameter becomes a Cedar record, a set of named members you reach with a dot. Test each level with `has` before reading it: because `riskFactors` is optional, omitting either guard fails policy creation with `unable to guarantee safety of access to optional attribute`. Records nest to a maximum depth of 64 levels; a deeper `context.input` is rejected at runtime with `Cannot determine input entity type`.

```
permit(
  principal,
  action == AgentCore::Action::"InsuranceAPI___calculate_premium",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  context.input has riskFactors &&
  context.input.riskFactors has priorClaims &&
  context.input.riskFactors.priorClaims == 0 &&
  context.input.riskFactors has region &&
  ["us-west", "us-east"].contains(context.input.riskFactors.region)
};
```

### Require an optional parameter
<a name="example-policies-action-resource-optional"></a>

 **Intent:** Require a description on every filed claim, even though the tool schema makes it optional.

An optional parameter is one the tool schema does not list as required, so a caller may omit it. On the reference gateway’s MCP tools, `description` on `file_claim` and `riskFactors` on `calculate_premium` are the only optional parameters; the runtime target also takes an optional `sessionAttributes`.

There are two ways to write this, and they behave differently. **We recommend the `forbid` form shown second**, because it holds no matter which other policies apply. The `permit` form comes first because it is the one readers reach for, and it does not have that property. A `permit` grants access when the field is present:

```
permit(
  principal,
  action == AgentCore::Action::"InsuranceAPI___file_claim",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  context.input has description
};
```

A `forbid` makes the field mandatory no matter which other policies apply:

```
forbid(
  principal,
  action == AgentCore::Action::"InsuranceAPI___file_claim",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
unless {
  context.input has description
};
```

Prefer the `forbid` form for a business rule you want to hold unconditionally, because another `permit` cannot override it.

**Important**  
 `has` is **mandatory** for an optional parameter — not merely defensive. Reading an optional attribute without guarding it fails policy creation:  

```
unable to guarantee safety of access to optional attribute `input.riskFactors`
```
The guard is required rather than advisory — omitting it fails policy creation. A **required** parameter needs no guard, so `has` is only needed where the tool schema marks the field optional.

## Operational patterns
<a name="example-policies-action-resource-operational"></a>

These policies are tools for running a gateway rather than expressions of a business rule. Because they are broad, add them deliberately and remove them when the situation that called for them has passed.

### Stop all tool calls
<a name="example-policies-action-resource-shutdown"></a>

 **Intent:** Halt every action on the gateway during an incident.

This denies every request to every gateway attached to the policy engine, overriding all `permit` policies. Adding it takes effect without changing any other policy, and deleting it restores normal operation.

```
forbid(
  principal,
  action,
  resource is AgentCore::Gateway
);
```

**Warning**  
Verify the engine’s enforcement mode before you rely on this policy. If the gateway’s `policyEngineConfiguration.mode` is `LOG_ONLY`, the decision is recorded but not enforced and every tool call still succeeds. For more information, see [Policy enforcement modes](policy-enforcement-modes.md).

### Disable one tool
<a name="example-policies-action-resource-disable-tool"></a>

 **Intent:** Deny access to a single tool without affecting the rest of the gateway.

The tool disappears from `tools/list` for every caller while this policy is in place, so agents stop attempting it rather than calling it and being denied.

```
forbid(
  principal,
  action == AgentCore::Action::"InsuranceAPI___disburse_payment",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);
```

## Combined policies
<a name="example-policies-action-resource-combined"></a>

The two preceding sections separate policies by what they match on. A rule often constrains both. These examples combine a principal condition with an action and input condition in one policy.

### Constrain a job title and its input together
<a name="example-policies-action-resource-combined-authority"></a>

 **Intent:** Allow coverage updates only for supported coverage types, and only when a new limit is supplied and stays within the authority the caller’s job title carries.

One policy can constrain the principal and the input together, and doing so in a single `permit` is what makes the conditions **conjunctive**. Where a parameter is optional, put its `has` test before the read it protects.

```
permit(
  principal is AgentCore::OAuthUser,
  action == AgentCore::Action::"InsuranceAPI___update_coverage",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  principal.hasTag("role") &&
  principal.getTag("role") == "senior-adjuster" &&
  ["liability", "collision"].contains(context.input.coverageType) &&
  context.input.newLimit.lessThanOrEqual(decimal("50000.00"))
};
```

### Give two roles different limits on one tool
<a name="example-policies-action-resource-combined-tiers"></a>

 **Intent:** Let adjusters disburse small amounts and managers disburse large ones.

Tiered authority takes one `permit` per tier, each pairing the job title with its own ceiling. Because the two policies are alternatives, a manager is not restricted by the adjuster policy. `amountCents` is an `integer`, so it uses ordinary ordered operators rather than `decimal` methods.

```
// Adjusters: up to 1,000.00
permit(
  principal is AgentCore::OAuthUser,
  action == AgentCore::Action::"InsuranceAPI___disburse_payment",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  principal.hasTag("role") &&
  principal.getTag("role") == "adjuster" &&
  context.input.amountCents <= 100000
};

// Managers: up to 25,000.00
permit(
  principal is AgentCore::OAuthUser,
  action == AgentCore::Action::"InsuranceAPI___disburse_payment",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  principal.hasTag("role") &&
  principal.getTag("role") == "manager" &&
  context.input.amountCents <= 2500000
};
```

## How these policies combine
<a name="example-policies-action-resource-layering"></a>

Policies on one engine are evaluated together, and the result is not the sum of what each policy allows. Three rules decide every request:

 **Deny by default**   
A request is allowed only if some `permit` matches it. An engine with no policies denies everything.

 **Forbid wins**   
If any `forbid` matches, the request is denied, even when a `permit` matches it too. This is what makes [Stop all tool calls](#example-policies-action-resource-shutdown) reliable, and why a `forbid …​ unless` restriction cannot be overridden by adding a `permit`.

 **Permits do not intersect**   
Two `permit` policies for the same action are alternatives, not requirements. If one `permit` allows `update_coverage` for managers and another allows it for liability changes, then a manager changing anything is allowed and anyone changing liability is allowed. To require both conditions, put them in one `permit` as [Constrain a job title and its input together](#example-policies-action-resource-combined-authority) does, or express the restriction as a `forbid …​ unless`.

Note that a `permit` cannot narrow another `permit`. The following three policies apply to the `update_coverage` action:
+  [Permit a specific user](example-policies-principal.md#example-policies-principal-username) permits `clare`.
+  [Forbid everyone except a set of roles](example-policies-principal.md#example-policies-principal-role-forbid) denies anyone who is not a senior adjuster or manager.
+  [Constrain a job title and its input together](#example-policies-action-resource-combined-authority) permits senior adjusters changing liability or collision within their limit.

A request from `clare`, who is neither a senior adjuster nor a manager, is **denied**: the first policy permits it but the second forbids it. A request from a senior adjuster raising a liability limit to 40,000 is **allowed** by the third policy, and the second does not forbid it. A senior adjuster changing a `comprehensive` coverage type is **denied**, because no `permit` covers that coverage type.

To check your reasoning against the deployed engine before you enforce it, run the request through [Test a policy in LOG\_ONLY mode](policy-test-a-policy.md), or attach the engine in `LOG_ONLY` mode and read the decision from the policy log.