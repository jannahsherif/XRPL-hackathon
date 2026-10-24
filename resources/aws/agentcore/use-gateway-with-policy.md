

# Use an AgentCore Gateway with Policy in AgentCore
<a name="use-gateway-with-policy"></a>

Follow the gateway authorization and authentication guide to obtain the credentials needed for gateway access.

**MCP tools only**  
Policy evaluation applies only to MCP tools. Regardless of the policy evaluation mode, the gateway always allows MCP prompts (`prompts/list`, `prompts/get`) and resources (`resources/list`, `resources/read`, `resources/templates/list`).

**Topics**
+ [List AgentCore Gateway Tools with Policy in AgentCore](#list-gateway-tools)
+ [Call gateway tools with policy](#call-gateway-tools)
+ [Passing the policy session ID for temporal policies](#use-gateway-policy-session-id)
+ [Policy responses](#policy-responses)

## List AgentCore Gateway Tools with Policy in AgentCore
<a name="list-gateway-tools"></a>

Tool listing is treated as a **meta action** . When a principal lists available tools, the policy engine does not evaluate the full context of a specific tool invocation (for example, input parameters).

A principal is only allowed to see tools in the listing that they would be permitted to call by policy. Because the full context of a tool call is not available during listing, this means a principal is allowed to list a tool **if there exists any set of circumstances under which a call to that tool would be permitted**.

As a result, a tool appearing in the list does not guarantee that a subsequent call to that tool will be authorized. The authorization decision for an actual tool invocation is evaluated separately using the full request context, including input parameters.

Select one of the following methods:

**Example**  

1. 

   ```
   curl -X POST \
     https://mygateway-abcdefghij.gateway.bedrock-agentcore.us-west-2.amazonaws.com/mcp \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -d '{
       "jsonrpc": "2.0",
       "id": "list-tools-request",
       "method": "tools/list"
     }'
   ```

1. 

   ```
   import requests
   import json
   
   def list_tools(gateway_url, access_token):
       headers = {
           "Content-Type": "application/json",
           "Authorization": f"Bearer {access_token}"
       }
   
       payload = {
           "jsonrpc": "2.0",
           "id": "list-tools-request",
           "method": "tools/list"
       }
   
       response = requests.post(gateway_url, headers=headers, json=payload)
       return response.json()
   
   # Example usage
   gateway_url = "https://mygateway-abcdefghij.gateway.bedrock-agentcore.us-west-2.amazonaws.com/mcp"
   access_token = "YOUR_ACCESS_TOKEN"
   tools = list_tools(gateway_url, access_token)
   print(json.dumps(tools, indent=2))
   ```

   The response returns only the tools that your policies allow you to see. Tools that are denied by policies will not appear in the list.

## Call gateway tools with policy
<a name="call-gateway-tools"></a>

Make tool calls to your gateway. Policy evaluation determines whether the call is allowed or denied.

Select one of the following methods:

**Example**  

1. 

   ```
   # Call a tool to test policy enforcement
   curl -X POST \
     https://mygateway-abcdefghij.gateway.bedrock-agentcore.us-west-2.amazonaws.com/mcp \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -d '{
       "jsonrpc": "2.0",
       "id": "test-policy",
       "method": "tools/call",
       "params": {
         "name": "tool_name",
         "arguments": {"orderId": "12345"}
       }
     }'
   ```

1. 

   ```
   import requests
   import json
   
   def call_gateway_tool(gateway_url, access_token, tool_name, arguments):
       headers = {
           "Content-Type": "application/json",
           "Authorization": f"Bearer {access_token}"
       }
   
       payload = {
           "jsonrpc": "2.0",
           "id": "test-policy",
           "method": "tools/call",
           "params": {
               "name": tool_name,
               "arguments": arguments
           }
       }
   
       response = requests.post(gateway_url, headers=headers, json=payload)
       return response.json()
   
   # Example usage
   gateway_url = "https://mygateway-abcdefghij.gateway.bedrock-agentcore.us-west-2.amazonaws.com/mcp"
   access_token = "YOUR_ACCESS_TOKEN"
   result = call_gateway_tool(
       gateway_url,
       access_token,
       "RefundTool___process_refund",
       {
           "orderId": "12345",
           "amount": 450,
           "reason": "Defective product"
       }
   )
   print(json.dumps(result, indent=2))
   ```

## Passing the policy session ID for temporal policies
<a name="use-gateway-policy-session-id"></a>

To enable temporal policy evaluation, include the `x-amzn-bedrock-agentcore-policy-session-id` header in your requests. This groups multiple invocations into a single session for session-aware policy enforcement.

```
curl -X POST \
  https://mygateway-abcdefghij.gateway.bedrock-agentcore.us-west-2.amazonaws.com/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-amzn-bedrock-agentcore-policy-session-id: YOUR_SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-temporal-policy",
    "method": "tools/call",
    "params": {
      "name": "tool_name",
      "arguments": {"orderId": "12345"}
    }
  }'
```

The Gateway does not generate a session ID on your behalf. You must generate the session ID and send it on every request, starting with your first request. If you omit the header, or send an empty value, the Gateway does not establish a session. If the associated policy engine contains a temporal policy, requests without a session ID fail with a validation error. Send the same ID with every request in the same session.

## Policy responses
<a name="policy-responses"></a>

When a policy allows the request:

```
{
  "jsonrpc": "2.0",
  "id": "test-policy",
  "result": {
    "isError": false,
    "content": [
      {
        "type": "text",
        "text": "ToolResult"
      }
    ]
  }
}
```

When a policy denies the request:

```
{
  "jsonrpc": "2.0",
  "id": "test-policy",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "AuthorizeActionException - Tool Execution Denied: Tool call not allowed due to policy enforcement [No policy applies to the request (denied by default).]"
      }
    ],
    "isError": true
  }
}
```