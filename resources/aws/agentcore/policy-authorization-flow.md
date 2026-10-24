

# Authorization flow
<a name="policy-authorization-flow"></a>

Amazon Bedrock AgentCore Gateway evaluates Cedar policies against incoming requests. This section explains how authorization information flows from the request to policy evaluation.

## Request processing
<a name="policy-request-processing"></a>

Amazon Bedrock AgentCore Gateway processes two key pieces of information from each request:

1.  **JWT Token** - Contains OAuth claims about the user:

   ```
   {
     "sub": "12345678-1234-1234-1234-123456789012",
     "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Vg2efaoGO",
     "username": "refund-agent",
     "scope": "aws.cognito.signin.user.admin refund:write",
     "role": "admin",
     "department": "finance"
   }
   ```

1.  **MCP Tool Call Request** - The actual tool invocation:

   ```
   {
     "jsonrpc": "2.0",
     "id": 1,
     "method": "tools/call",
     "params": {
       "name": "RefundTool___process_refund",
       "arguments": {
         "orderId": "12345",
         "amount": 450,
         "reason": "Defective product"
       }
     }
   }
   ```

## Cedar authorization request
<a name="policy-cedar-authorization-request"></a>

The Gateway extracts information from both sources and constructs a Cedar authorization request.

 **Complete Authorization Request:** 

```
{
  "principal": "AgentCore::OAuthUser::\"12345678-1234-1234-1234-123456789012\"",
  "action": "AgentCore::Action::\"RefundTool___process_refund\"",
  "resource": "AgentCore::Gateway::\"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/refund-gateway\"",
  "context": {
    "input": {
      "orderId": "12345",
      "amount": 450,
      "reason": "Defective product"
    }
  }
}
```

 **Components:** 

Principal  
Created from the JWT token’s sub claim:  

```
AgentCore::OAuthUser::"12345678-1234-1234-1234-123456789012"
```

Action  
Extracted from the tool name:  

```
AgentCore::Action::"RefundTool___process_refund"
```

Resource  
The Gateway instance:  

```
AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/refund-gateway"
```

Context  
Contains the tool arguments:  

```
{
  "input": {
    "orderId": "12345",
    "amount": 450,
    "reason": "Defective product"
  }
}
```

 **Entity Store** - The JWT claims are stored as tags on the OAuthUser entity:

```
{
  "uid": {
    "type": "AgentCore::OAuthUser",
    "id": "12345678-1234-1234-1234-123456789012"
  },
  "attrs": {
    "id": "12345678-1234-1234-1234-123456789012"
  },
  "tags": {
    "username": "refund-agent",
    "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Vg2efaoGO",
    "scope": "aws.cognito.signin.user.admin refund:write",
    "role": "admin",
    "department": "finance"
  }
}
```

## Session context for temporal policies
<a name="policy-flow-session-context"></a>

When a `x-amzn-bedrock-agentcore-policy-session-id` header is present, the Gateway includes the session context in the authorization request passed to the policy engine. The session context provides the accumulated action history for the current session. Temporal policy rules evaluate constraints over time using this history.

```
{
  "principal": "AgentCore::OAuthUser::\"12345678-1234-1234-1234-123456789012\"",
  "action": "AgentCore::Action::\"PaymentTool___transfer_funds\"",
  "resource": "AgentCore::Gateway::\"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/my-gateway\"",
  "context": {
    "input": {
      "amount": 500,
      "recipient": "account-789"
    }
  },
  "sessionId": "12345678-1234-1234-1234-123456789012"
}
```

The `sessionId` field links the current request to its session history. The policy engine resolves the session state and evaluates all applicable temporal rules against the accumulated action chain.

For details on supplying the session ID, the session lifecycle, and how identity propagates across multi-hop calls, see [Policy sessions and identity propagation](policy-session-based-temporal.md).

## Policy evaluation
<a name="policy-evaluation"></a>

Cedar evaluates:

1.  **Principal check:** Is the principal an OAuthUser? ✓ (matches)

1.  **Action check:** Is the action RefundTool\_\_\_process\_refund? ✓ (matches)

1.  **Resource check:** Is the resource the refund gateway? ✓ (matches)

1.  **Condition checks:** 
   + Does principal have username tag? ✓ (yes, from JWT)
   + Is username = "refund-agent"? ✓ (yes)
   + Is context.input.amount < 500? ✓ (450 < 500)

 **Result:** ALLOW - All checks pass, the refund is authorized.