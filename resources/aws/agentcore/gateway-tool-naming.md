

# Understand how AgentCore Gateway tools are named
<a name="gateway-tool-naming"></a>

The name of a tool in your gateway is dependent on the name of the target through which the tool can be accessed. Tool names are constructed in the following pattern:

```
${target_name}___${tool_name}
```

For example, if your target’s name is `LambdaUsingSDK` and you have a tool named `get_order_tool` that is accessible at that target, the tool name that is visible through the Model Context Protocol (MCP) is `LambdaUsingSDK___get_order_tool`.

You should ensure that your application code accounts for the discrepancy between the tool name visible through the MCP and the tool name itself.

For an example of a Lambda handler function that strips the target name prefix from the tool name before passing it to a handler function, see [Lambda function input format](gateway-add-target-lambda.md#gateway-building-lambda-input).