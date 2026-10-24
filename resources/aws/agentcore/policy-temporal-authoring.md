

# Authoring temporal policies
<a name="policy-temporal-authoring"></a>

You author a temporal policy in the Dogwood policy language and add it to a policy engine, the same way you create any other policy for Policy in AgentCore. A temporal policy is a `permit` or `forbid` rule whose session-aware conditions are placed in a `temporal` block; the principal, action, and resource the rule applies to are written using the standard `(principal, action, resource)` scope, the same as any other policy. The following sections show how to create a temporal policy and walk through common patterns you can express.

**Topics**
+ [Create a temporal policy](#policy-temporal-authoring-create)
+ [Event schema: fields you can reference](#policy-temporal-authoring-event-schema)
+ [Example temporal policies](#policy-temporal-authoring-examples)

## Create a temporal policy
<a name="policy-temporal-authoring-create"></a>

You create a temporal policy with the `create-policy` operation, the same operation you use for other policies, and attach it to a policy engine. A temporal policy’s statement goes under `policy` in the definition, rather than under `cedar` as for a stateless Cedar policy.

The following example creates a temporal policy on a policy engine:

**Example**  

1. Save the statement to a file — for example `disburse_only_approved.dw`:

   ```
   permit (
     principal,
     action == AgentCore::Action::"InsuranceAPI___disburse_payment",
     resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
   )
   when temporal {
     formerly within 1h AgentCore::Action::"InsuranceAPI___approve_claim"::response{
       eventResource: resource,
       output.claimId: context.input.claimId
     }
   };
   ```

1. Add the policy to the project configuration and deploy:

   ```
   agentcore add policy --name DisburseOnlyApprovedClaim \
     --engine insurance_pe \
     --source disburse_only_approved.dw
   
   agentcore deploy --yes
   ```

    `agentcore add` only records the policy in `agentcore/agentcore.json`; `agentcore deploy` is what creates it.

1. Run the following code in a terminal to create the temporal policy using the AWS CLI:

   ```
   aws bedrock-agentcore-control create-policy \
     --policy-engine-id insurance_pe-a1b2c3d4e5 \
     --name DisburseOnlyApprovedClaim \
     --validation-mode FAIL_ON_ANY_FINDINGS \
     --definition '{
       "policy": {
         "statement": "permit (principal, action == AgentCore::Action::\"InsuranceAPI___disburse_payment\", resource == AgentCore::Gateway::\"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5\") when temporal { formerly within 1h AgentCore::Action::\"InsuranceAPI___approve_claim\"::response{ eventResource: resource, output.claimId: context.input.claimId } };"
       }
     }'
   ```

1. Run the following code to create the temporal policy using the AWS SDK for Python:

   ```
   import boto3
   
   client = boto3.client("bedrock-agentcore-control")
   
   GATEWAY_ARN = (
       "arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
   )
   
   statement = (
       'permit (principal, '
       'action == AgentCore::Action::"InsuranceAPI___disburse_payment", '
       f'resource == AgentCore::Gateway::"{GATEWAY_ARN}") '
       'when temporal { formerly within 1h '
       'AgentCore::Action::"InsuranceAPI___approve_claim"::response{ '
       'eventResource: resource, output.claimId: context.input.claimId } };'
   )
   
   response = client.create_policy(
       policyEngineId="insurance_pe-a1b2c3d4e5",
       name="DisburseOnlyApprovedClaim",
       validationMode="FAIL_ON_ANY_FINDINGS",
       definition={"policy": {"statement": statement}},
   )
   # CreatePolicy returns 202 - wait for the terminal status
   client.get_waiter("policy_active").wait(
       policyEngineId="insurance_pe-a1b2c3d4e5",
       policyId=response["policyId"],
   )
   print(response["policyId"])
   ```

This temporal policy depends on an authorized `approve_claim` request. Without a plain permit for that prerequisite action, deny-by-default prevents the request from running and no `response` event is recorded. Create a separate policy containing the following statement:

```
permit (
  principal,
  action == AgentCore::Action::"InsuranceAPI___approve_claim",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);
```

You can also create a temporal policy by describing it in natural language instead of writing the Dogwood statement yourself.

## Event schema: fields you can reference
<a name="policy-temporal-authoring-event-schema"></a>

Conditions inside a `temporal { }` block use *temporal event predicates* to match specific events that were recorded in the session so far (up to and including the action that is currently being authorized). A predicate names a time window, an action and event kind, and a set of field constraints on the matched event. The `create-policy` example in the previous section used one predicate, `formerly within 1h AgentCore::Action::"InsuranceAPI___approve_claim"::response{ eventResource: resource, output.claimId: context.input.claimId }`, which matches an `approve_claim` `response` recorded within the last hour whose `output.claimId` equals the current request’s `claimId`.

To write a predicate, you need to know which events an action produces and which fields each event carries, because those are the fields a predicate can constrain and correlate against. This section describes that event schema.

Each action produces up to three kinds of event, named after the event kind in the predicate (`::request`, `::response`, `::error`):
+  `request` — recorded for each authorized request. Carries the action’s input fields.
+  `response` — recorded when the tool returns successfully. Carries the action’s input and output fields.
+  `error` — recorded when the request is denied or the tool returns an error. Carries the action’s input fields. This event is history-only.

The temporal event schema defines these events for each action `A`. `…​inputs(A)` and `…​outputs(A)` expand to the action’s declared input and output fields:

```
// Recorded for each authorized request.
decision event <A>::request {
    ...inputs(A),
    eventPrincipal: principalType(A),
    eventResource:  resourceType(A),
    requestId:      String,
    pin sessionId:  String = context.sessionId,
}

// Recorded when the tool returns successfully; carries inputs and outputs.
event <A>::response {
    ...inputs(A),
    ...outputs(A),
    eventPrincipal: principalType(A),
    eventResource:  resourceType(A),
    requestId:      String,
    pin sessionId:  String = context.sessionId,
}

// Recorded when the request is denied or the tool returns an error; history-only.
event <A>::error {
    ...inputs(A),
    eventPrincipal: principalType(A),
    eventResource:  resourceType(A),
    requestId:      String,
    pin sessionId:  String = context.sessionId,
}
```

Within a predicate body, you can reference the following fields of the matched event:


| Field | Description | 
| --- | --- | 
|  `input.<name>`  | An input field of the action. Available on `request`, `response`, and `error` events. | 
|  `output.<name>`  | An output field of the action. Available on `response` events only. | 
|  `eventPrincipal`  | The principal that made the recorded request. | 
|  `eventResource`  | Always set this to `resource` (as `eventResource: resource`) so it refers to the resource in the policy scope, that is, the `resource` in the `permit` or `forbid` head. This scopes the match to the current request’s resource, and every temporal predicate must include it. | 

To correlate a recorded event with the current request, compare one of these fields against a value from the current request, such as `context.input.<name>`.

## Example temporal policies
<a name="policy-temporal-authoring-examples"></a>

For examples of each pattern temporal policies express — requiring a prior approval, expiring a stale prerequisite, capping a count or a running total, cool-downs, mutual exclusion, chains, and reacting to a prior denial — see [Temporal policy examples](example-policies-temporal.md) in [Policy authoring guide](policy-authoring-guide.md). Each example there is written against the same reference gateway as the rest of the policy examples, states which plain permits to pair it with, and gives the decision for each request sequence in a session.