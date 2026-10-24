

# HTTP passthrough targets
<a name="gateway-target-http-passthrough"></a>

You can add an HTTP passthrough target to route traffic through the gateway to any HTTP endpoint. The gateway forwards requests to the target endpoint without protocol translation, acting as a secure proxy layer. This makes passthrough targets ideal for fronting agent URLs, external APIs, or any HTTP service that you want to access through the gateway’s centralized authentication, policy enforcement, and observability.

Adding an HTTP passthrough target to your gateway is useful when you want to:
+ Front agent services (such as A2A agents, external MCP servers, or custom inference endpoints) behind a single gateway endpoint with unified access control.
+ Route traffic to external services while the gateway manages inbound authentication and outbound credential injection.
+ Apply gateway policies such as guardrails and access control to requests destined for external endpoints.
+ Use path-based routing (`/{targetName}/{path}`) to reach multiple external services through a single gateway.

**Topics**
+ [Target configuration](#gateway-target-http-passthrough-config)
+ [Creating an HTTP passthrough target](#gateway-target-http-passthrough-create)
+ [Invoking an HTTP passthrough target](#gateway-target-http-passthrough-invoke)
+ [Supported HTTP methods](#gateway-target-http-passthrough-methods)
+ [Outbound authorization](#gateway-target-http-passthrough-auth)

## Target configuration
<a name="gateway-target-http-passthrough-config"></a>

When you create an HTTP passthrough target, you provide the target endpoint URL and a protocol type that indicates the application protocol the target implements. The gateway uses the protocol type for observability and policy evaluation but does not perform protocol translation.

The target configuration for an HTTP passthrough target uses the following structure:

```
{
    "http": {
        "passthrough": {
            "endpoint": "https://partner-agent.example.com",
            "protocolType": "A2A"
        }
    }
}
```

The following example shows a passthrough target with a custom protocol and an explicit API schema:

```
{
    "http": {
        "passthrough": {
            "endpoint": "https://my-service.example.com",
            "protocolType": "CUSTOM",
            "schema": {
                "source": {
                    "s3": {
                        "uri": "s3://DOC-EXAMPLE-BUCKET/service-schema.yaml"
                    }
                }
            }
        }
    }
}
```
+  **endpoint** (required) – The HTTPS URL of the target service. The gateway forwards requests to this endpoint.
+  **protocolType** (required) – The application protocol that the target implements. Valid values:
  +  `MCP` – The target is an MCP server. Use this when routing to a single MCP server that you want to access directly (not aggregated with other MCP targets).
  +  `A2A` – The target implements the Agent-to-Agent (A2A) protocol.
  +  `INFERENCE` – The target is an inference endpoint.
  +  `CUSTOM` – The target implements a custom or proprietary protocol.
+  **schema** (optional) – The API schema that describes the passthrough target’s request and response structure. The gateway uses this schema to enable policy engine features such as guardrails. The schema format is auto-detected as either OpenAPI or Smithy.

  The schema requirement depends on the protocol type:
  + For `MCP` and `A2A` protocol types, a default schema is applied automatically. You don’t need to provide a schema unless you want to override the default.
  + For `INFERENCE` protocol types with well-known providers (OpenAI, Anthropic, or Amazon Bedrock), a default schema is applied based on the endpoint domain.
  + For `CUSTOM` protocol types, you must provide a schema to use guardrails.

    The `schema` object contains a `source` that specifies where the schema content is located:
  +  **s3** – An S3 URI pointing to the schema file (for example, `s3://DOC-EXAMPLE-BUCKET/service-schema.yaml`).
  +  **inlinePayload** – The schema content provided directly as a string.

To create a passthrough target with a schema, use the AWS CLI command `aws bedrock-agentcore-control create-gateway-target`, as shown in the AWS CLI tab of the following examples. The target is not part of the project, and `agentcore deploy` does not manage it. Before you remove the gateway from the project, delete this target with `aws bedrock-agentcore-control delete-gateway-target --gateway-identifier <GATEWAY_ID> --target-id <TARGET_ID>`. If the gateway is replaced, create the target again.

## Creating an HTTP passthrough target
<a name="gateway-target-http-passthrough-create"></a>

The following examples create a passthrough target that routes to different types of endpoints: an A2A agent, an external MCP server, an IAM-authenticated internal service, and an external API. The AgentCore CLI example passes the caller’s JWT to the external API, and the AWS CLI example uses an API key.

**Example**  

1. Passthrough targets need a gateway created without `--protocol-type MCP`. Create the gateway, and declare each OAuth credential that a target uses:

   ```
   agentcore add gateway \
     --name MyGateway \
     --authorizer-type CUSTOM_JWT \
     --authorizer-configuration '{
       "customJwtAuthorizer": {
         "discoveryUrl": "https://your-idp.example.com/.well-known/openid-configuration",
         "allowedClients": ["your-client-id"]
       }
     }'
   
   printf '%s' "$CLIENT_SECRET" | agentcore add credentials oauth \
     --name partner-oauth \
     --client-id <CLIENT_ID> \
     --discovery-url <DISCOVERY_URL> \
     --client-secret -
   ```

   Declare `slack-oauth` the same way. Route to an A2A agent using an OAuth credential:

   ```
   agentcore add gateway-target \
     --gateway MyGateway \
     --target-configuration '{
       "name": "partner-agent",
       "targetType": "passthrough",
       "passthrough": {
         "endpoint": "https://partner-agent.example.com",
         "protocolType": "A2A"
       },
       "outboundAuth": {
         "type": "OAUTH",
         "credentialName": "partner-oauth"
       }
     }'
   agentcore deploy
   ```

   Route to an external MCP server using an OAuth credential:

   ```
   agentcore add gateway-target \
     --gateway MyGateway \
     --target-configuration '{
       "name": "slack-mcp",
       "targetType": "passthrough",
       "passthrough": {
         "endpoint": "https://mcp-slack.example.com",
         "protocolType": "MCP"
       },
       "outboundAuth": {
         "type": "OAUTH",
         "credentialName": "slack-oauth"
       }
     }'
   agentcore deploy
   ```

   Route to an internal service using IAM (SigV4) role-based authentication with a `CUSTOM` protocol:

   ```
   agentcore add gateway-target \
     --gateway MyGateway \
     --target-configuration '{
       "name": "internal-service",
       "targetType": "passthrough",
       "passthrough": {
         "endpoint": "https://internal-service.example.com",
         "protocolType": "CUSTOM"
       },
       "outboundAuth": {
         "type": "GATEWAY_IAM_ROLE",
         "service": "execute-api",
         "region": "us-west-2"
       }
     }'
   agentcore deploy
   ```

   The AgentCore CLI configures SigV4 signing for this target. To let the gateway role call the service, create the gateway with `agentcore add gateway --role-arn` and a role that allows `execute-api:Invoke` on the internal API. For the role’s trust policy, see [AgentCore Gateway service role permissions](gateway-prerequisites-permissions.md#gateway-service-role-permissions).

   Route to an external API and pass the caller’s JWT:

   ```
   agentcore add gateway-target \
     --gateway MyGateway \
     --target-configuration '{
       "name": "external-api",
       "targetType": "passthrough",
       "passthrough": {
         "endpoint": "https://api.example.com",
         "protocolType": "CUSTOM"
       },
       "outboundAuth": {
         "type": "JWT_PASSTHROUGH"
       }
     }'
   agentcore deploy
   ```

1. Route to an A2A agent using an OAuth credential:

   ```
   aws bedrock-agentcore-control create-gateway-target --cli-input-json '{
       "gatewayIdentifier": "GATEWAY_ID",
       "name": "partner-agent",
       "targetConfiguration": {
           "http": {
               "passthrough": {
                   "endpoint": "https://partner-agent.example.com",
                   "protocolType": "A2A"
               }
           }
       },
       "credentialProviderConfigurations": [
           {
               "credentialProviderType": "OAUTH",
               "credentialProvider": {
                   "oauthCredentialProvider": {
                       "providerArn": "arn:aws:bedrock-agentcore:us-west-2:111122223333:token-vault/default/oauthcredentialprovider/partner-oauth",
                       "scopes": []
                   }
               }
           }
       ]
   }'
   ```

   Route to an external MCP server using an OAuth credential:

   ```
   aws bedrock-agentcore-control create-gateway-target --cli-input-json '{
       "gatewayIdentifier": "GATEWAY_ID",
       "name": "slack-mcp",
       "targetConfiguration": {
           "http": {
               "passthrough": {
                   "endpoint": "https://mcp-slack.example.com",
                   "protocolType": "MCP"
               }
           }
       },
       "credentialProviderConfigurations": [
           {
               "credentialProviderType": "OAUTH",
               "credentialProvider": {
                   "oauthCredentialProvider": {
                       "providerArn": "arn:aws:bedrock-agentcore:us-west-2:111122223333:token-vault/default/oauthcredentialprovider/slack-oauth",
                       "scopes": []
                   }
               }
           }
       ]
   }'
   ```

   Route to an internal service using IAM role-based authentication, with a `CUSTOM` protocol and an S3 schema. The gateway role must allow `execute-api:Invoke` on the internal API and `s3:GetObject` on the schema object:

   ```
   aws bedrock-agentcore-control create-gateway-target --cli-input-json '{
       "gatewayIdentifier": "GATEWAY_ID",
       "name": "internal-service",
       "targetConfiguration": {
           "http": {
               "passthrough": {
                   "endpoint": "https://internal-service.example.com",
                   "protocolType": "CUSTOM",
                   "schema": {
                       "source": {
                           "s3": {
                               "uri": "s3://DOC-EXAMPLE-BUCKET/internal-service-schema.yaml"
                           }
                       }
                   }
               }
           }
       },
       "credentialProviderConfigurations": [
           {
               "credentialProviderType": "GATEWAY_IAM_ROLE",
               "credentialProvider": {
                   "iamCredentialProvider": {
                       "service": "execute-api",
                       "region": "us-west-2"
                   }
               }
           }
       ]
   }'
   ```

   Route to an external API using an API key credential:

   ```
   aws bedrock-agentcore-control create-gateway-target --cli-input-json '{
       "gatewayIdentifier": "GATEWAY_ID",
       "name": "external-api",
       "targetConfiguration": {
           "http": {
               "passthrough": {
                   "endpoint": "https://api.example.com",
                   "protocolType": "CUSTOM"
               }
           }
       },
       "credentialProviderConfigurations": [
           {
               "credentialProviderType": "API_KEY",
               "credentialProvider": {
                   "apiKeyCredentialProvider": {
                       "providerArn": "arn:aws:bedrock-agentcore:us-west-2:111122223333:token-vault/default/apikeycredentialprovider/my-api-key",
                       "credentialParameterName": "x-api-key"
                   }
               }
           }
       ]
   }'
   ```

## Invoking an HTTP passthrough target
<a name="gateway-target-http-passthrough-invoke"></a>

To invoke an HTTP passthrough target through the gateway, send a request to the target using path-based routing. The URL format is:

```
https://{gatewayId}.gateway.bedrock-agentcore.{region}.amazonaws.com/{targetName}/{path}
```

The gateway forwards the request to `{endpoint}/{path}` on the target. Replace `{gatewayId}` with your gateway ID, `{region}` with the AWS Region, `{targetName}` with the target name, and `{path}` with the path to forward.

The following example sends an A2A message to a partner agent through the gateway:

```
curl -X POST https://gateway-id.gateway.bedrock-agentcore.us-west-2.amazonaws.com/partner-agent/invocations \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <token>" \
    -d '{
        "jsonrpc": "2.0",
        "id": "req-001",
        "method": "message/send",
        "params": {
            "message": {
                "role": "user",
                "parts": [{"kind": "text", "text": "What is the stock price of AMZN?"}],
                "messageId": "msg-001"
            }
        }
    }'
```

For a gateway in your AgentCore project, `agentcore invoke --gateway` sends the request to a path on the gateway and adds the authorization for you:

```
agentcore invoke --gateway MyGateway \
  --path /partner-agent/invocations \
  --bearer-token "$TOKEN" \
  --payload '{"jsonrpc":"2.0","id":"req-001","method":"message/send","params":{"message":{"role":"user","parts":[{"kind":"text","text":"What is the stock price of AMZN?"}],"messageId":"msg-001"}}}'
```

The following example calls an MCP server through the gateway:

```
curl -X POST https://gateway-id.gateway.bedrock-agentcore.us-west-2.amazonaws.com/slack-mcp/mcp \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <token>" \
    -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

## Supported HTTP methods
<a name="gateway-target-http-passthrough-methods"></a>

The gateway supports the HTTP methods used by the protocols that passthrough targets implement: MCP servers, A2A agents, and inference endpoints. These protocols rely on a specific subset of methods for invoking services and routing traffic.

The gateway supports the following HTTP methods:
+  `POST` – Used by all passthrough target protocols as the primary method. MCP uses POST for JSON-RPC messages, A2A uses POST for sending messages and managing tasks, and inference endpoints use POST for completions and chat requests.
+  `GET` – Used by MCP for SSE stream subscriptions, by A2A for retrieving task status and listing tasks, and by inference endpoints for listing models.
+  `DELETE` – Used by A2A for removing push notification configurations and by inference endpoints for deleting resources.

The gateway does not support `PATCH`, `PUT`, `HEAD`, or `OPTIONS` methods. Passthrough targets are designed for invoking services and routing traffic, and these methods are outside that scope.

If a client sends a request with an unsupported HTTP method, the gateway returns an error.

## Outbound authorization
<a name="gateway-target-http-passthrough-auth"></a>

HTTP passthrough targets support the following outbound authorization types:
+  **IAM (SigV4)** (`GATEWAY_IAM_ROLE`) – The gateway assumes the gateway service role to sign requests to the target.
+  **OAuth** (`OAUTH`) – The gateway retrieves OAuth tokens from credential providers configured in the target through the Amazon Bedrock AgentCore identity service.
+  **Caller IAM credentials** (`CALLER_IAM_CREDENTIALS`) – The gateway uses the IAM identity and permissions of the caller to sign requests to the target using SigV4. Only available for gateways with `AWS_IAM` or `AUTHENTICATE_ONLY` authorizer type.
+  **Token passthrough** (`JWT_PASSTHROUGH`) – The gateway validates the inbound token and passes it through to the target without modification.
+  **API key** (`API_KEY`) – The gateway retrieves an API key from a credential provider configured in the token vault and injects it into outbound requests as a specified request header.

The AgentCore CLI supports `GATEWAY_IAM_ROLE`, `OAUTH`, and `JWT_PASSTHROUGH` for passthrough targets. Use the AWS CLI for `API_KEY` or `CALLER_IAM_CREDENTIALS`.