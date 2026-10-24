

# Schema constraints
<a name="policy-schema-constraints"></a>

Policies for Amazon Bedrock AgentCore Gateway must validate against a specific Cedar schema that is automatically generated from the Gateway’s MCP tool manifest. This schema defines what’s possible in your policies.

**Topics**
+ [Principal Types](#policy-principal-type)
+ [Resource Type](#policy-resource-type)
+ [Actions](#policy-actions)
+ [Context](#policy-context)
+ [What You Cannot Do](#policy-limitations)

## Principal Types
<a name="policy-principal-type"></a>

The principal type depends on the authentication method configured for your AgentCore Gateway:

 `AgentCore::OAuthUser`   
+ Used for OAuth-authenticated gateways
+ Has an `id` attribute (from JWT sub claim)
+ Supports tags for OAuth claims (username, scope, role, etc.)

 `AgentCore::IamEntity`   
+ Used for IAM-authenticated gateways (AWS\_IAM authorizer)
+ Has an `id` attribute containing the caller’s IAM ARN
+ Use pattern matching on `principal.id` for access control

## Resource Type
<a name="policy-resource-type"></a>
+ Must be `AgentCore::Gateway` 
+ Represents the MCP Gateway instance
+ Can be matched by type ( `is` ) or specific ARN ( `==` )
+ Must use specific ARNs to refer to specific actions

## Actions
<a name="policy-actions"></a>
+ Each MCP tool becomes an action: `AgentCore::Action::"ToolName"` 
+ All tool actions inherit from CallTool → Mcp hierarchy
+ Example: `Action::"RefundTool___process_refund"` is a CallTool

## Context
<a name="policy-context"></a>
+ Only available context is `context.input` 
+ Contains the tool’s input parameters as defined in the MCP manifest
+ Each tool has a typed input structure (e.g., RefundTool\_\_\_process\_refundInput)
+ Parameter types are automatically mapped from the action schema to Cedar types.

The following table shows the correspondence between the 7 basic JSON Schema types and Cedar types:


| JSON Schema | Cedar | Notes | 
| --- | --- | --- | 
|  `string`  |  `String`  |  | 
|  `integer`  |  `Long`  |  | 
|  `boolean`  |  `Bool`  |  | 
|  `number`  |  `Decimal`  | Decimal is an extension type in Cedar, which does not exactly match IEEE floating point numbers, so numbers will be truncated to the Cedar representation | 
|  `object`  |  `Record`  | The type correspondence is applied recursively to properties, and the list of `required` properties is used to decide which properties of the record are required | 
|  `array`  |  `Set`  | Cedar `Set` does not have a notion of item order, so the order of items in the JSON array does not get translated to Cedar | 
|  `null`  |  `Entity`  | Because Cedar does not have a 1:1 match for a type that is solely `null`, schemas will contain a unique entity to represent each `null`-type | 

Treat this table as a high-level overview. For more information about detailed and nuanced use cases, see [the open-source MCP schema generator on GitHub](https://github.com/cedar-policy/cedar-for-agents/tree/main/rust/cedar-policy-mcp-schema-generator).

## What You Cannot Do
<a name="policy-limitations"></a>
+ Cannot reference entity types outside AgentCore namespace
+ Cannot access context fields other than `context.input` (`context.output` can only be used with guardrails)
+ Cannot use custom attributes on OAuthUser (use tags instead)
+ Cannot define new entity types in policies
+ Cannot use floating-point numbers. Cedar has no float type, so express fractional values as `decimal("…​")`, which supports no more than 4 decimal places
+ Cannot use regular expressions. Pattern matching is limited to the `like` operator with `*` wildcards. For more information, see [Where wildcards work](example-policies-action-resource.md#example-policies-action-resource-wildcards) 