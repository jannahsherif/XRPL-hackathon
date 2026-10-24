

# Create an AgentCore gateway using the CLI
<a name="gateway-create-cli"></a>

You can use the AgentCore CLI to add a gateway to the current project. The CLI creates a gateway service role when you don’t provide one. Set the inbound authorization with `--authorizer-type`.

To use the interactive wizard, run `agentcore add gateway` with no options. Enter the gateway name, choose `NONE`, `AWS_IAM`, or `CUSTOM_JWT` (for `CUSTOM_JWT`, enter the discovery URL and allowed client IDs), choose whether to turn on semantic search, and confirm.

Create a gateway without authorization:

```
agentcore add gateway \
  --name MyGateway \
  --authorizer-type NONE
agentcore deploy
```

Add a project Runtime as an HTTP target. Runtime targets need a gateway created without `--protocol-type MCP`. This example assumes that the project has a Runtime named `MyAgent`, for example one added with `agentcore add runtime --name MyAgent --language python --protocol HTTP`:

```
agentcore add gateway-target \
  --gateway MyGateway \
  --name MyAgentTarget \
  --runtime MyAgent
```

Create a gateway with JWT authorization:

```
agentcore add gateway \
  --name MyJwtGateway \
  --authorizer-type CUSTOM_JWT \
  --authorizer-configuration '{
    "customJwtAuthorizer": {
      "discoveryUrl": "https://your-idp.example.com/.well-known/openid-configuration",
      "allowedAudience": ["your-audience"]
    }
  }'
agentcore deploy
```

Semantic search is disabled by default. To enable it for an MCP gateway, use both `--protocol-type MCP` and `--enable-semantic-search`. An MCP gateway accepts only MCP targets, so you can’t add a `--runtime` target to it:

```
agentcore add gateway \
  --name MyMcpGateway \
  --protocol-type MCP \
  --enable-semantic-search
agentcore deploy
```

After creating the gateway, add targets using `agentcore add gateway-target` or `agentcore add gateway-connector`. For more information, see the [Get started with AgentCore Gateway](gateway-quick-start.md).