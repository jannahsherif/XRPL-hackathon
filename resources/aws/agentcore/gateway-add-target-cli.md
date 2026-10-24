

# Add a target using the CLI
<a name="gateway-add-target-cli"></a>

You can use the AgentCore CLI to add targets to a gateway in the current project.

Run `agentcore add gateway-target` without options to choose a gateway and add an external MCP server or a Runtime in the project as a target in an interactive wizard. Run `agentcore add gateway-connector` without options to add a web search or Amazon Bedrock knowledge base connector. Other target types use `--target-configuration`.

Add an external MCP server target:

```
agentcore add gateway-target \
  --gateway MyGateway \
  --name MyMCPTarget \
  --endpoint https://your-mcp-server.example.com/mcp
agentcore deploy
```

Add a Lambda function target:

```
agentcore add gateway-target \
  --gateway MyGateway \
  --target-configuration '{
    "name": "MyLambdaTarget",
    "targetType": "lambdaFunctionArn",
    "lambdaFunctionArn": {
      "lambdaArn": "arn:aws:lambda:us-east-1:123456789012:function:MyFunction",
      "toolSchemaFile": "tools.json"
    }
  }'
agentcore deploy
```

Add an OpenAPI schema target that authenticates with an API key. The target references a credential declared in the project:

```
printf '%s' "$API_KEY" | agentcore add credentials api-key \
  --name MyApiKey \
  --api-key -
agentcore add gateway-target \
  --gateway MyGateway \
  --target-configuration '{
    "name": "MyOpenAPITarget",
    "targetType": "openApiSchema",
    "schemaSource": {
      "inline": {
        "path": "path/to/openapi-spec.json"
      }
    },
    "outboundAuth": {
      "type": "API_KEY",
      "credentialName": "MyApiKey"
    }
  }'
agentcore deploy
```

Add a Connector target with Web Search Tool:

```
agentcore add gateway-connector \
  --gateway MyGateway \
  --connector web-search \
  --name MyWebSearchToolTarget
agentcore deploy
```

For complete target configurations, you can pass JSON inline, from a file with `file://path`, or from standard input with `-`.

For more CLI examples, see the [Get started with AgentCore Gateway](gateway-quick-start.md).