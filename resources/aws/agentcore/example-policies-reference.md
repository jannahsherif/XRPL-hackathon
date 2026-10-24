

# Resource configuration for examples
<a name="example-policies-reference"></a>

The examples in this section are written against one illustrative gateway rather than against a gateway you already have. Nothing here exists in your account. `InsuranceAPI`, `ClaimsAgent`, and the three `Claims*` inference targets are invented names for an insurance-claims application, chosen so every example can share one set of tools, parameter types, and principals. Substitute your own gateway ARN, target names, and tool names when you adapt an example.

Every example authorizes requests to this gateway:

```
arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5
```

Replace this ARN with your own gateway’s ARN when you adapt an example. The gateway belongs to an insurance claims application and has five targets covering every target type that Policy in AgentCore authorizes: one Model Context Protocol (MCP) target, one AgentCore Runtime target, and three inference targets.

This page describes the action names, tool schemas, request bodies, and principals that the examples refer to. Read it once, and the rest of the examples need no further setup.

## Action names
<a name="example-policies-reference-actions"></a>

The action name you write in a policy depends on the type of target that serves the request. For everything except MCP, it also depends on the method and path the caller used.


| Target | Type | Action name | 
| --- | --- | --- | 
|  `InsuranceAPI`  | MCP |  `AgentCore::Action::"InsuranceAPI___file_claim"` (one action per tool) | 
|  `ClaimsAgent`  | AgentCore Runtime |  `AgentCore::Action::"ClaimsAgent___POST:/invocations"`  | 
|  `ClaimsChat`  | Inference |  `AgentCore::Action::"ClaimsChat___POST:/v1/chat/completions"`  | 
|  `ClaimsResponses`  | Inference |  `AgentCore::Action::"ClaimsResponses___POST:/v1/responses"`  | 
|  `ClaimsMessages`  | Inference |  `AgentCore::Action::"ClaimsMessages___POST:/v1/messages"`  | 

An MCP target produces one action per tool, so a policy can name a single tool. Every other target type produces one action per method and path combination, so a policy names the target and the path rather than an individual capability.

### Inference targets and API paths
<a name="example-policies-reference-inference-paths"></a>

An inference target is configured for one API shape, so a gateway that offers more than one inference API has one target per API. That is why the reference gateway has three. Each carries a different request body, so a policy written for one does not carry over to another.


| Target | API path | Envelope | 
| --- | --- | --- | 
|  `ClaimsChat`  |  `POST /v1/chat/completions`  | OpenAI Chat Completions | 
|  `ClaimsResponses`  |  `POST /v1/responses`  | OpenAI Responses | 
|  `ClaimsMessages`  |  `POST /v1/messages`  | Anthropic Messages | 

A gateway may also expose `GET /v1/models`, which lists available models. It carries no request body, so a policy on `ClaimsChat___GET:/v1/models` can match only on principal, action, and resource.

**Important**  
To govern inference completely, write a policy for every inference action on the gateway. A policy naming only `ClaimsChat___POST:/v1/chat/completions` leaves the `/v1/responses` and `/v1/messages` targets unaddressed, and because the three envelopes place the prompt in different places, a condition written for one cannot be reused verbatim for another. For more information, see [Inference request bodies by path](#example-policies-reference-inference-bodies).

For the complete rules, including HTTP proxy targets, see [Action names by target type](policy-scope.md#policy-guardrails-action-naming).

## MCP tools on the InsuranceAPI target
<a name="example-policies-reference-tools"></a>

The `InsuranceAPI` target exposes eight tools. The Cedar type of each parameter follows from its JSON Schema type. That type determines which operators you can use on the parameter in a condition. For more information, see [Parameter types in conditions](#example-policies-types).

InsuranceAPI\_\_\_get\_contract  
Retrieve insurance contract details, such as coverage and term dates.  
 **Parameters:**   
+  `contractId` (string, required) - The insurance contract identifier

InsuranceAPI\_\_\_file\_claim  
File an insurance claim.  
 **Parameters:**   
+  `contractId` (string, required) - The insurance contract identifier
+  `claimType` (string, required) - Type of claim: `health`, `property`, or `auto` 
+  `amount` (number, required) - Claim amount
+  `policyTermMonths` (integer, required) - Length of the policy term, in months
+  `description` (string, optional) - Claim description

InsuranceAPI\_\_\_update\_coverage  
Update policy coverage.  
 **Parameters:**   
+  `contractId` (string, required) - The insurance contract identifier
+  `coverageType` (string, required) - Type of coverage, such as `liability` or `collision` 
+  `newLimit` (number, required) - New coverage limit

InsuranceAPI\_\_\_get\_claim\_status  
Check claim status.  
 **Parameters:**   
+  `claimId` (string, required) - The claim identifier

   **Returns:** `claimId` (string), `status` (string)

InsuranceAPI\_\_\_calculate\_premium  
Calculate an insurance premium.  
 **Parameters:**   
+  `coverageType` (string, required) - Type of coverage
+  `coverageAmount` (number, required) - Coverage amount
+  `riskFactors` (object, optional) - Risk assessment factors, with a `region` (string) member and a `priorClaims` (integer) member

InsuranceAPI\_\_\_approve\_claim  
Approve a filed claim. Temporal examples use this tool as the approval that must precede a disbursement.  
 **Parameters:**   
+  `claimId` (string, required) - The claim identifier
+  `approved` (boolean, required) - Whether the claim is approved
+  `approvedAmountCents` (integer, required) - Approved amount, in cents

   **Returns:** `claimId` (string), `approved` (boolean), `approvedAmountCents` (integer)

InsuranceAPI\_\_\_disburse\_payment  
Disburse payment for an approved claim.  
 **Parameters:**   
+  `claimId` (string, required) - The claim identifier
+  `amountCents` (integer, required) - Amount to disburse, in cents

   **Returns:** `claimId` (string), `status` (string), `amountCents` (integer)

InsuranceAPI\_\_\_delete\_claim  
Permanently delete a claim record. Examples use this tool as the sensitive operation that most principals must not reach.  
 **Parameters:**   
+  `claimId` (string, required) - The claim identifier

## Request body on the runtime target
<a name="example-policies-reference-bodies"></a>

A runtime target is authorized as one action, and `context.input` holds the request body rather than a set of declared tool arguments.

 `ClaimsAgent___POST:/invocations`   
An AgentCore Runtime target hosting a claims assistant.  
 **Request body:**   
+  `prompt` (string) - The user’s message to the agent
+  `sessionAttributes` (object, optional) - Caller-supplied attributes

   **Response body:** `completion` (string)

**Important**  
For a runtime target, the fields a policy can read come from the **OpenAPI schema declared on the gateway target**, not from what the runtime actually sends. A field the schema does not declare is not addressable — `context.output.<field>` works only for a response property the schema lists, and the same applies to `output.<field>` in a temporal predicate.  
If a condition on a runtime field is rejected as undeclared, check the target’s schema rather than the runtime’s code.

## Inference request bodies by path
<a name="example-policies-reference-inference-bodies"></a>

For an inference target, `context.input` holds the request body of the API the caller invoked. The three envelopes place the conversation text in different structures, which is the single most important thing to know before writing a condition or a guardrail data path against an inference target.

 `ClaimsChat___POST:/v1/chat/completions`   
OpenAI Chat Completions. The conversation is an array of message objects; a system prompt is a message with `role: system`.  

```
{
  "model": "openai.gpt-oss-120b-1:0",
  "messages": [
    { "role": "system", "content": "You are a claims assistant." },
    { "role": "user",   "content": "What is the status of claim C-1001?" }
  ]
}
```
 **Response body:** `choices` (array), each entry with a `message` object holding `role` and `content` 

 `ClaimsResponses___POST:/v1/responses`   
OpenAI Responses. The prompt is a single `input` member, which may be a bare string **or** a list of items each holding a `content` array. The system prompt is a separate `instructions` member.  

```
{
  "model": "openai.gpt-oss-120b-1:0",
  "instructions": "You are a claims assistant.",
  "input": "What is the status of claim C-1001?"
}
```
 **Response body:** `output` (array), each entry with a `content` array of blocks holding `text` 

 `ClaimsMessages___POST:/v1/messages`   
Anthropic Messages. The conversation is a `messages` array whose `content` may be a string or an array of typed blocks. The system prompt is a top-level `system` member, not a message.  

```
{
  "model": "anthropic.claude-sonnet-4-5-20250929-v1:0",
  "max_tokens": 1024,
  "system": "You are a claims assistant.",
  "messages": [
    { "role": "user", "content": "What is the status of claim C-1001?" }
  ]
}
```
 **Response body:** `content` (array) of blocks holding `text` 

### Text locations for each path
<a name="example-policies-reference-inference-fields"></a>

The following table gives the location of the conversation text on each path, for both directions. Use it whenever you need to point a guardrail at what a caller or a model actually said.


| API path | Inbound text | Outbound text | 
| --- | --- | --- | 
|  `/v1/chat/completions`  |  `messages[*].content`  |  `choices[*].message.content`  | 
|  `/v1/responses`  |  `input`, `input[*].content[*].text`, `instructions`  |  `output[*].content[*].text`  | 
|  `/v1/messages`  |  `messages[*].content`, `messages[*].content[*].text`, `system`  |  `content[*].text`  | 

Two paths list more than one inbound location because the wire format varies. On `/v1/responses`, `input` is either a bare string or a list of items, so the text is at `input` in one case and at `input[*].content[*].text` in the other. On `/v1/messages`, a message’s `content` is either a string or an array of typed blocks. Naming both shapes covers either wire form without your having to know which the caller sent.

**Important**  
These locations sit inside arrays and records, so you **cannot** reach them with a bare `context.input.<field>` path — `context.input.messages` is a `Set<record>`, not text, and Dogwood has no array-projection operator, so `messages[*].content` is a parse error in a field path. Guardrail data paths reach them with a `$`-prefixed JSONPath string instead. For more information, see [Reaching text inside arrays with a JSONPath](example-policies-guardrails.md#example-policies-guardrails-jsonpath).  
For an ordinary Cedar condition, only scalar members are usable — `context.input.model` is a `String` and works, while `context.input.messages` cannot be compared or pattern-matched at all.

## Principals
<a name="example-policies-reference-principals"></a>

The principal entity type depends on how the gateway authenticates inbound callers. The examples use whichever type the pattern calls for, and most patterns work with either.

AgentCore::OAuthUser  
The gateway uses a JWT authorizer. The entity ID is the token’s `sub` claim, and the token’s other claims are available as tags through `principal.hasTag("<claim>")` and `principal.getTag("<claim>")`. The examples use three claims: `username`, `role`, and `scope`.

AgentCore::IamEntity  
The gateway uses `AWS_IAM`. The entity ID is the caller’s ARN with any session name removed, so an assumed role appears as `arn:aws:sts::<account>:assumed-role/<role-name>`. That form is stable across sessions, so you can match it with `principal ==` or match a family of roles with `principal.id like`.

For the full list of principal attributes and how claims map to tags, see [Principal](policy-scope.md#policy-principal).

## Parameter types in conditions
<a name="example-policies-types"></a>

A tool parameter’s JSON Schema type determines its Cedar type, and the Cedar type determines which operators are valid on it. Getting this wrong produces a policy that either fails validation or denies every request at runtime, so check the parameter’s type before writing a condition on it.


| JSON Schema type | Cedar type | How to compare it | 
| --- | --- | --- | 
|  `string`  |  `String`  |  `==`, `!=`, `like`, and set membership with `.contains()`  | 
|  `integer`  |  `Long`  |  `==`, `<`, `⇐`, `>`, `>=` with an integer literal | 
|  `number`  |  `decimal`  | Only `.lessThan()`, `.lessThanOrEqual()`, `.greaterThan()`, `.greaterThanOrEqual()`, and `==`, each against a `decimal("…​")` literal. Cedar has no `<` or `>` operator for `decimal` and no floating point literal. | 
|  `boolean`  |  `Bool`  |  `==`, and direct use in a condition | 
|  `object`  |  `Record`  | Access members with `.`, and test for a member with `has`  | 
|  `array`  |  `Set`  |  `.contains()`, `.containsAll()`, `.containsAny()`  | 
|  `null`  |  `Entity`  | Not comparable. A `null` argument is omitted from `context.input`, so test for its absence with `!(context.input has <field>)`  | 

These are Cedar’s own type names, and they are the names the generated schema uses. For the full mapping including the notes on each conversion, see [Context](policy-schema-constraints.md#policy-context).

### Numeric parameters
<a name="example-policies-numeric"></a>

Numbers are where a condition is most likely to be written in a form the service rejects. Confirm the parameter’s type, and the operators that type supports, before you write the comparison.

 **An `integer` becomes a Cedar `Long`.** Compare it with the ordinary operators and an integer literal:

```
context.input.policyTermMonths >= 12
```

 **A `number` becomes a Cedar `decimal`.** Cedar defines no `<`, `⇐`, `>`, or `>=` operator for `decimal` and has no floating point literal, so use the comparison methods and a quoted `decimal("…​")` literal:

```
context.input.amount.greaterThan(decimal("1000.00"))
```

Both `context.input.amount > 1000.00` and `context.input.amount < 1000` are invalid. The first has no operator for the type; the second compares a `decimal` against a `Long`.

 **Inside a `temporal { }` block, ordering requires an `integer`.** A `decimal` is rejected in an ordering comparison, and so is a `string`. Summing has the same requirement: `sum` needs an `integer` summand. Equality (`==`, `!=`) is unrestricted, provided both sides are the same type. For more information, see [Temporal policy examples](example-policies-temporal.md).

The service reports a type error of any of these kinds when you create the policy. The message names the expected and actual type with a line and column pointer, such as `unexpected type: expected Long but saw decimal`, or `comparison requires numeric operands on both sides` inside a `temporal` block.

**Tip**  
Model any value a temporal policy has to total or threshold as an `integer` in your tool schema. This is why the reference gateway states money two ways. `file_claim` takes `amount` as a `number`, because its rules are point-in-time comparisons. `approve_claim` takes integer `approvedAmountCents` and `disburse_payment` takes integer `amountCents`, because the temporal examples aggregate them. Representing money as integer minor units is worth adopting for any tool whose values a temporal policy needs to total.

For the decimal precision limit and other schema constraints, see [Constraints and quotas](policy-schema-constraints.md).

Optional parameters are absent from `context.input` when the caller omits them, so test for a member with `has` before reading it:

```
context.input has description && context.input.description != ""
```

The guard is required rather than advisory. Reading an optional attribute without it fails policy creation with `unable to guarantee safety of access to optional attribute`, and the failure is asynchronous — a 202 followed by `CREATE_FAILED`. A parameter the schema marks required needs no guard.

Type mismatches fail the same way. `.contains(1)` on an array of strings reports `the types Long and String are not compatible`, with a line and column pointer.