

# Example: Authorization for a gateway created with the AgentCore CLI
<a name="gateway-using-auth-ex-starter"></a>

When you add a gateway, set the inbound authorizer with `--authorizer-type`. If you omit it, the gateway uses `NONE` and accepts unauthenticated requests. To use JWT authorization, set up an identity provider first. When you add a target, configure outbound authorization if the target requires it.

For example, add a gateway that validates tokens issued by an existing OpenID Connect (OIDC) provider:

```
agentcore add gateway \
  --name MyGateway \
  --protocol-type MCP \
  --authorizer-type CUSTOM_JWT \
  --authorizer-configuration '{
    "customJwtAuthorizer": {
      "discoveryUrl": "https://your-idp.example.com/.well-known/openid-configuration",
      "allowedClients": ["your-client-id"]
    }
  }'
```

Declare the OAuth credential for the target in the project, then add an external MCP server target that uses it:

```
printf '%s' "$CLIENT_SECRET" | agentcore add credentials oauth \
  --name MyOauthCredential \
  --client-id <CLIENT_ID> \
  --discovery-url <DISCOVERY_URL> \
  --scopes tools.read \
  --client-secret -

agentcore add gateway-target \
  --gateway MyGateway \
  --name MyTarget \
  --endpoint https://your-mcp-server.example.com/mcp \
  --outbound-auth oauth \
  --credential-name MyOauthCredential \
  --scope tools.read

agentcore deploy
```

To invoke the gateway with the CLI, obtain a bearer token from your identity provider and run:

```
agentcore invoke --gateway MyGateway \
  --path /mcp \
  --method POST \
  --content-type application/json \
  --bearer-token <BEARER_TOKEN> \
  --payload '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

For an `AWS_IAM` gateway, omit `--bearer-token`. `agentcore invoke --gateway` signs the request with your AWS credentials, which need the `bedrock-agentcore:InvokeGateway` permission.