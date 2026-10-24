

# Policy scope
<a name="policy-scope"></a>

The scope defines what the policy applies to. Every Cedar policy specifies three components:

**Topics**
+ [Entities and namespaces](#policy-entities-namespaces)
+ [Principal](#policy-principal)
+ [Action](#policy-action)
+ [Resource](#policy-resource)

```
permit(
  principal is AgentCore::OAuthUser,    // WHO is making the request
  action == AgentCore::Action::"...",   // WHAT they want to do
  resource is AgentCore::Gateway::"..." // WHICH resource they want to access
)
```

## Entities and namespaces
<a name="policy-entities-namespaces"></a>

Cedar uses entities to represent principals, actions, and resources. All entities in AgentCore Gateway use the AgentCore namespace.

Entity format: `Namespace::EntityType::"identifier"` 

## Principal
<a name="policy-principal"></a>

The principal identifies the entity making the authorization request. The principal type depends on how your AgentCore Gateway is configured for authentication.

### OAuth User Principal
<a name="policy-principal-oauth"></a>

When using OAuth authorization, the principal is an `AgentCore::OAuthUser` :

```
principal is AgentCore::OAuthUser
```

Components:
+  `principal` - The entity making the authorization request
+  `AgentCore::OAuthUser` - Entity type representing OAuth-authenticated users
+  `is` - Type check operator (matches any OAuthUser entity)

Principals are OAuth-authenticated users. Each user has a unique ID from the JWT sub claim.

### IAM Entity Principal
<a name="policy-principal-iam"></a>

When using AWS\_IAM authorization, the principal is an `AgentCore::IamEntity` :

```
principal is AgentCore::IamEntity
```

Components:
+  `principal` - The entity making the authorization request
+  `AgentCore::IamEntity` - Entity type representing IAM-authenticated callers
+  `is` - Type check operator (matches any IamEntity)

IAM principals have an `id` attribute containing the caller’s IAM ARN. You can use pattern matching on this attribute to implement account-based or role-based access control.

## Action
<a name="policy-action"></a>

The action specifies the operation being requested:

```
action == AgentCore::Action::"RefundTool___process_refund"
```

Components:
+  `action` - The operation being requested
+  `AgentCore::Action::"RefundTool___process_refund"` - Specific action entity
+  `==` - Exact match operator (only this specific action)

Actions represent tool calls in the MCP AgentCore Gateway. Each tool has a corresponding action entity.

### Action names by target type
<a name="policy-guardrails-action-naming"></a>

The action identifier in your policy depends on the target type configured on your gateway:


| Target type | Action format | Example | 
| --- | --- | --- | 
| MCP |  `<TargetName>___<ToolName>`  |  `NotesTool___manage_notes`  | 
| AgentCore Runtime |  `<TargetName>___<METHOD>:/invocations`  |  `StrandsAgentTarget___POST:/invocations`  | 
| Proxy (HTTP) |  `<TargetName>___<METHOD>:<uri>`  |  `MyAPI___POST:/inference/v1/chat/completions`  | 

### Multiple actions
<a name="policy-action-wildcards"></a>

Cedar does **not** support wildcard actions. Each action must be referenced explicitly using the exact action identifier ( `AgentCore::Action::"ToolName___operation"` ). To group multiple tools under a single rule, use a **Gateway Target** (an Action Group) and write policies against that target.

For example, to allow access only to tools whose names start with Read, you can create a Gateway Target called ReadToolsTarget that includes each such tool, and then write a policy like:

```
permit(
  principal,
  action in AgentCore::Action::"ReadToolsTarget",
  resource == AgentCore::Gateway::"<gateway-arn>"
);
```

This will permit all tools included in that target depending on the policy’s effect.

## Resource
<a name="policy-resource"></a>

The resource identifies the target of the request:

```
resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/refund-gateway"
```

Components:
+  `resource` - The target of the request
+  `AgentCore::Gateway` - Entity type representing gateway instances
+  `==` - Exact match operator (matches this specific AgentCore Gateway)

The AgentCore Gateway is the MCP server that routes tool calls.

### Resource specificity requirements
<a name="policy-resource-specificity"></a>

When specifying one or more specific actions, you must use specific AgentCore Gateway ARNs:

```
// Required: Specific Gateway ARN for specific action(s)
resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/refund-gateway"
```

This applies to:
+ Single action: `action == AgentCore::Action::"ToolName"` 
+ Multiple specific actions: `action in [AgentCore::Action::"Tool1", AgentCore::Action::"Tool2"]` 

Use type checks only when matching any action:

```
// For policies covering any action (not specific tools)
resource is AgentCore::Gateway
```

Examples:

```
// Blocks all actions
forbid(principal, action, resource);

// Allow any CallTool action
permit(principal, action in AgentCore::Action::"CallTool", resource is AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/refund-gateway");
```

Specific AgentCore Gateway ARNs provide:
+ Security isolation between AgentCore Gateway instances
+ Separation of production and development environments
+ Fine-grained access control per AgentCore Gateway