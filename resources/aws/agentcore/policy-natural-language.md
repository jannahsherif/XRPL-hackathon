

# Writing policies in natural language
<a name="policy-natural-language"></a>

Policy in AgentCore will automatically select the optimal region within your geography to process your inference requests made through Policy authoring service. This maximizes available compute resources, model availability, and delivers the best customer experience. Your data will remain stored only in the region where the request originated, however, input prompts and output results may be processed outside that region. All data will be transmitted encrypted across Amazon’s secure network.

Policy in AgentCore will securely route your inference requests to available compute resources within the geographic area where the request originated, as follows:
+ Inference requests originating in European Union will be processed within the European Union.
+ Inference requests originating in the United States will be processed within the United States.
+ Inference requests originating in APAC will be processed within APAC.

**Topics**
+ [Overview](#nl2cedar-overview)
+ [Example](#nl2cedar-example)
+ [Policy effects](#nl2cedar-policy-effects)
+ [Authorization semantics](#nl2cedar-authorization-semantics)
+ [Policy elements](#nl2cedar-policy-elements)
+ [Policy examples](#nl2cedar-policy-examples)
+ [Condition syntax](#nl2cedar-condition-syntax)
+ [Combining conditions](#nl2cedar-combining-conditions)
+ [Common pitfalls](#nl2cedar-common-pitfalls)

## Overview
<a name="nl2cedar-overview"></a>

Cedar provides precise access control, but requires learning formal syntax. NL2Cedar enables you to:

1. Write authorization requirements in natural language

1. Automatically convert to Cedar syntax

1. Verify generated policies match your requirements

**Note**  
Natural language policy generation requires a deployed AgentCore Gateway and policy engine. The service uses the AgentCore Gateway schema to generate valid Cedar policies. See [Getting started with Policy in AgentCore](policy-getting-started.md) for setup instructions.

**Note**  
Natural language is flexible, but precision is essential for security. Policies must be clear and unambiguous.

## Example
<a name="nl2cedar-example"></a>

The refund policy from the previous section can be expressed in natural language:

 **Natural language:** 

Allow principal with username "refund-agent" to process refunds when the refund amount is less than $500.

 **Converts to Cedar:** 

```
permit(
  principal is AgentCore::OAuthUser,
  action == AgentCore::Action::"RefundTool___process_refund",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/refund-gateway"
)
when {
  principal.hasTag("username") &&
  principal.getTag("username") == "refund-agent" &&
  context.input.amount < 500
};
```

## Policy effects
<a name="nl2cedar-policy-effects"></a>

Authorization policies have two possible effects: permit and forbid.

**Topics**
+ [Permit policies](#nl2cedar-permit-policies)
+ [Forbid policies](#nl2cedar-forbid-policies)

### Permit policies
<a name="nl2cedar-permit-policies"></a>

Permit policies specify what users can do:
+ "Allow user refund-agent to process refunds"
+ "Permit users with role director to approve decisions"
+ "Authorize users with scope admin:write to update coverage"

### Forbid policies
<a name="nl2cedar-forbid-policies"></a>

Forbid policies specify what users cannot do:
+ "Block users from accessing high-sensitivity models"
+ "Deny junior underwriters from approving decisions"
+ "Forbid users from processing refunds when risk validation is pending"

## Authorization semantics
<a name="nl2cedar-authorization-semantics"></a>

Understanding how Cedar evaluates policies is crucial for writing effective authorization rules. Cedar follows three fundamental principles:
+  **By default, everything is denied** - If no policy explicitly permits an action, it’s automatically blocked
+  **Forbid always wins** - If any forbid policy matches, access is denied even if permit policies also match
+  **At least one permit required** - For access to be granted, at least one permit policy must match AND no forbid policies can match

 **Why use forbid policies if everything is denied by default?** 

Forbid policies ensure that specific actions cannot be mistakenly permitted. Even if someone writes a broader permit policy, the forbid policy takes precedence and blocks access.

 **Example scenario:** 

```
// Broad permit policy - allows all users to view model results
permit(
  principal is AgentCore::OAuthUser,
  action == AgentCore::Action::"ModelAPI___view_results",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/model"
);

// Forbid policy - blocks access to high-sensitivity results
forbid(
  principal is AgentCore::OAuthUser,
  action == AgentCore::Action::"ModelAPI___view_results",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/model"
)
when {
  context.input.sensitivity == "high"
};
```

 **Result:** Users can view low and medium sensitivity results (permit applies), but high sensitivity results are always blocked (forbid wins).

Use forbid policies for:
+ Explicit security restrictions that must never be overridden
+ Compliance requirements
+ Emergency shutdowns
+ Creating exceptions to broader permit policies

## Policy elements
<a name="nl2cedar-policy-elements"></a>

Authorization policies require three key elements:

1.  **Who** - Which users or roles can perform the action

1.  **What** - Which operations or tools they can use

1.  **When** - Under what conditions or constraints

**Topics**
+ [Principal specification](#nl2cedar-principal-specification)
+ [Action specification](#nl2cedar-action-specification)
+ [Condition specification](#nl2cedar-condition-specification)

### Principal specification
<a name="nl2cedar-principal-specification"></a>

The principal identifies which users, roles, or groups the policy applies to.

Flexible expressions:
+ "Allow the user refund-agent to…​"
+ "Permit users with username refund-agent to…​"
+ "Users with role insurance-agent may…​"
+ "Anyone with the refund:write scope is authorized to…​"
+ "All users can…​"

Be specific about identity:

Incomplete: ❌ "Allow processing refunds under $500"

Complete: ✓ "Allow refund-agent to process refunds under $500"

### Action specification
<a name="nl2cedar-action-specification"></a>

The "what" identifies which operations, tools, or actions the policy controls.

Flexible action verbs:
+ "Allow users to process refunds"
+ "Permit refund processing"
+ "Users can create applications"
+ "Authorize viewing audit logs"

Be specific about the tool:

Vague: ❌ "Allow users to access models"

Clear: ✓ "Allow data-science team to access the analytics model"

### Condition specification
<a name="nl2cedar-condition-specification"></a>

The "when" specifies under what circumstances the policy applies.

Flexible conditional expressions:
+ "…​when the amount is less than $500"
+ "…​if the region is US, CA, or UK"
+ "…​only when approval status is approved-by-manager"
+ "…​provided that the risk score has been submitted"

Be precise with conditions:

Vague: ❌ "Allow transfers when the amount is reasonable"

Precise: ✓ "Allow transfers when the amount is less than $10,000"

## Policy examples
<a name="nl2cedar-policy-examples"></a>

The following examples demonstrate how to structure natural language policies with clear principals, actions, and conditions.

**Topics**
+ [Example 1: Simple User-Based Policy](#nl2cedar-example-1)
+ [Example 2: Role-Based with Multiple Conditions](#nl2cedar-example-2)
+ [Example 3: Scope-Based Access](#nl2cedar-example-3)
+ [Example 4: Everyone with Constraints](#nl2cedar-example-4)

### Example 1: Simple User-Based Policy
<a name="nl2cedar-example-1"></a>

Allow user refund-agent to process refunds when the amount is less than $500.

Elements:
+  **Who:** user refund-agent
+  **What:** process refunds
+  **When:** amount is less than $500

### Example 2: Role-Based with Multiple Conditions
<a name="nl2cedar-example-2"></a>

Allow users with role insurance-agent to update coverage when the coverage type is liability or collision and the policy is active.

Elements:
+  **Who:** users with role insurance-agent
+  **What:** update coverage
+  **When:** coverage type is liability or collision AND policy is active

### Example 3: Scope-Based Access
<a name="nl2cedar-example-3"></a>

Allow users with scope travel:book to create flight bookings when the region is not EU and the product is eligible.

Elements:
+  **Who:** users with scope travel:book
+  **What:** create flight bookings
+  **When:** region is not EU AND product is eligible

### Example 4: Everyone with Constraints
<a name="nl2cedar-example-4"></a>

Allow all users to view model results when the data sensitivity is low or medium and the result type is risk-score.

Elements:
+  **Who:** all users
+  **What:** view model results
+  **When:** data sensitivity is low or medium AND result type is risk-score

## Condition syntax
<a name="nl2cedar-condition-syntax"></a>

Conditions are where policies often become ambiguous. Here’s how to write clear, testable conditions.

**Topics**
+ [Numeric Comparisons](#nl2cedar-numeric-comparisons)
+ [String Matching](#nl2cedar-string-matching)
+ [Boolean Conditions](#nl2cedar-boolean-conditions)
+ [Field Existence](#nl2cedar-field-existence)

### Numeric Comparisons
<a name="nl2cedar-numeric-comparisons"></a>

Good examples:
+ "when the amount is less than $500"
+ "when the coverage amount is under 5 million"
+ "when the claim exceeds $10,000,000"
+ "when the passenger count is exactly 2"

Avoid vague terms:
+ ❌ "when the amount is small"
+ ❌ "when the coverage is high"

### String Matching
<a name="nl2cedar-string-matching"></a>

Exact match:
+ "when the region is US"
+ "when the payment method is credit-card"
+ "when the status is approved"

Multiple options:
+ "when the region is US or CA or UK"
+ "when the decision type is approve or refer"

Pattern matching:
+ "when the email contains @example.com"
+ "when the scope contains admin:write"

Negation:
+ "when the region is not EU"
+ "when the classification is not restricted"

### Boolean Conditions
<a name="nl2cedar-boolean-conditions"></a>

Direct checks:
+ "when the product is eligible"
+ "when the risk score is submitted"
+ "when express shipping is requested"

Negation:
+ "when the product is not eligible"
+ "when the risk score is not submitted"

### Field Existence
<a name="nl2cedar-field-existence"></a>

Requiring fields:
+ "when a reason is provided"
+ "when an application ID exists"
+ "when the return date is specified"

## Combining conditions
<a name="nl2cedar-combining-conditions"></a>

Real policies often need multiple conditions. Use clear logical connectors.

**Topics**
+ [AND Logic (All Must Be True)](#nl2cedar-and-logic)
+ [OR Logic (At Least One Must Be True)](#nl2cedar-or-logic)
+ [Complex Logic](#nl2cedar-complex-logic)

### AND Logic (All Must Be True)
<a name="nl2cedar-and-logic"></a>

Use words like: "and", "also", "additionally", "while", "with"

Example:

Allow applications when the region is US and the product is eligible and the territory is active.

### OR Logic (At Least One Must Be True)
<a name="nl2cedar-or-logic"></a>

Use words like: "or", "alternatively", "either"

Example:

Allow approval when the claim exceeds $10,000,000 or the risk level is high or critical.

### Complex Logic
<a name="nl2cedar-complex-logic"></a>

For complex conditions, use clear structure:

Example:

Allow finalization when the workflow stage is review-complete or approved, and the compliance status is passed, and the authority is manager or director.

## Common pitfalls
<a name="nl2cedar-common-pitfalls"></a>

Avoid these common mistakes when writing natural language policies to ensure they convert correctly to Cedar syntax.

**Topics**
+ [Mistake 1: Vague Principals](#nl2cedar-mistake-1)
+ [Mistake 2: Ambiguous Actions](#nl2cedar-mistake-2)
+ [Mistake 3: Subjective Conditions](#nl2cedar-mistake-3)
+ [Mistake 4: Missing Conditions](#nl2cedar-mistake-4)
+ [Mistake 5: Unclear Logic](#nl2cedar-mistake-5)

### Mistake 1: Vague Principals
<a name="nl2cedar-mistake-1"></a>

Bad: "Allow access to the refund tool"

Good: "Allow user refund-agent to access the refund tool"

### Mistake 2: Ambiguous Actions
<a name="nl2cedar-mistake-2"></a>

Bad: "Allow users to access data"

Good: "Allow users to view patient records"

### Mistake 3: Subjective Conditions
<a name="nl2cedar-mistake-3"></a>

Bad: "Allow transfers when the amount is reasonable"

Good: "Allow transfers when the amount is less than $10,000"

### Mistake 4: Missing Conditions
<a name="nl2cedar-mistake-4"></a>

Bad: "Allow users with scope admin:write to update coverage"

Good: "Allow users with scope admin:write to update coverage when the policy is active and the coverage type is liability or collision"

### Mistake 5: Unclear Logic
<a name="nl2cedar-mistake-5"></a>

Bad: "Allow when A or B and C"

Good: "Allow when (A or B) and C" or "Allow when A or (B and C)"