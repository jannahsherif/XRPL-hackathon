

# Policy authoring guide
<a name="policy-authoring-guide"></a>

This section is the central collection of example policies for Policy in Amazon Bedrock AgentCore. Every example uses the single gateway described in [Resource configuration for examples](example-policies-reference.md). You can therefore read any two examples side by side, and combine them on one policy engine without renaming actions or adjusting a schema.

The examples are grouped by what the policy matches on. [Principal-scoped policies](example-policies-principal.md) decide from who is calling — a JWT identity or an IAM caller. [Action and resource scoped policies](example-policies-action-resource.md) decide from what is being called: which action, on which gateway, carrying which input values. That section ends with [Combined policies](example-policies-action-resource.md#example-policies-action-resource-combined), where the two are constrained together, and with the rules that decide how policies on one engine interact.

 [Time-based policies](example-policies-time-based.md) decide from wall-clock time. They read `context.system.now` in an ordinary `when` clause, so like the two preceding sections they stay within plain Cedar.

Two further sections cover conditions that plain Cedar cannot express. [Guardrail policy examples](example-policies-guardrails.md) decide from a signal that a guardrail computes at evaluation time, such as a content-safety or prompt-attack score, and [Temporal policy examples](example-policies-temporal.md) decide from what has already happened earlier in the same session.

All of them share one authorization model. A request is allowed only when a `permit` policy applies to it and no `forbid` policy overrides it, so a policy engine with no policies denies everything. The kinds also compose: a single policy can combine a principal condition, an input condition, a guardrail signal, and session history.

You author policies for Policy in AgentCore in [Dogwood](https://dogwood-policy.github.io/dogwood/index.html), an open source policy language that is compatible with [Cedar](https://www.cedarpolicy.com/en). Dogwood adds the condition forms that guardrail and temporal policies need — `when guardrails { …​ }` and `when temporal { …​ }` — which plain Cedar cannot express. Every valid Cedar policy is also a valid Dogwood policy, so policies you already wrote in Cedar keep working without changes, and Cedar is fully supported. The principal-scoped, action-scoped and time-based examples deliberately use only constructs that are also valid Cedar, while the guardrail and temporal examples use Dogwood conditions.

For language syntax, see the [Dogwood language guide](https://dogwood-policy.github.io/dogwood/index.html) on the Dogwood Policy website and the [Cedar policy language](https://www.cedarpolicy.com/en) website. For the schema that Policy in AgentCore generates from your gateway’s tools, and the limits that apply to it, see [Constraints and quotas](policy-schema-constraints.md).

**Topics**
+ [Resource configuration for examples](example-policies-reference.md)
+ [Principal-scoped policies](example-policies-principal.md)
+ [Action and resource scoped policies](example-policies-action-resource.md)
+ [Time-based policies](example-policies-time-based.md)
+ [Guardrail policy examples](example-policies-guardrails.md)
+ [Temporal policy examples](example-policies-temporal.md)