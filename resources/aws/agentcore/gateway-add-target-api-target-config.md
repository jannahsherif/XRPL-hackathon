

# Define the gateway target configuration
<a name="gateway-add-target-api-target-config"></a>

The target configuration depends on the target type that you’re adding to the gateway. For more information about supported gateway target types, see [Supported targets for Amazon Bedrock AgentCore gateways](gateway-supported-targets.md).

Select a topic to see examples of adding a target type:

**Topics**
+ [Add a Lambda target](#gateway-add-target-api-lambda)
+ [Add an API Gateway stage target](#gateway-add-target-api-gateway)
+ [Add an OpenAPI target](#gateway-add-target-api-openapi)
+ [Add a Smithy target](#gateway-add-target-api-smithy)
+ [Add an HTTP runtime target](#gateway-add-target-api-http-runtime)
+ [Add an MCP server target](#gateway-add-target-api-MCPserver)
+ [Add a Connector target with Amazon Bedrock Managed Knowledge Bases](#gateway-add-target-api-connector-managed-kb)
+ [Add a Connector target with Web Search Tool](#gateway-add-target-api-connector-web-search)
+ [Add a Connector target with AWS Step Functions](#gateway-add-target-api-connector-step-functions)

## Add a Lambda target
<a name="gateway-add-target-api-lambda"></a>

You can add a Lambda target to your gateway using the AgentCore CLI by passing a `--target-configuration` with `"targetType": "lambdaFunctionArn"`, the Lambda ARN, and a tool schema file.

 **Target configuration** 

The target configuration (or payload) for a Lambda function contains the following fields:
+  **lambdaArn** – The ARN of the Lambda function to use as your target.
+  **toolSchema** – The tool schema for the gateway target.

For more information about Lambda targets, see [AWS Lambda function targets](gateway-add-target-lambda.md).

Select one of the following methods:

**Example**  

1. Add a Lambda function target with a complete target configuration. The tool schema file path is relative to the project:

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

   For the AgentCore Python SDK and Boto3, provide the tool schema with `inlinePayload`.

1. With the AgentCore Python SDK, you can create an AWS Lambda target with default configurations.

   ```
   # Import dependencies
   from bedrock_agentcore_starter_toolkit.operations.gateway.client import GatewayClient
   
   # Initialize the client
   client = GatewayClient(region_name="us-east-1")
   
   # Create a lambda target.
   lambda_target = client.create_mcp_gateway_target(
       gateway=gateway,
       name=None, # If you don't set one, one will be generated.
       target_type="lambda",
       target_payload=None, # Define your own lambda if you pre-created one. Otherwise leave this as None and one will be created for you.
       credentials=None, # If you leave this as None, one will be created for you
   )
   ```

   The following is an example argument you can provide for the `target_payload` . If you omit the `target_payload` argument, this payload is used:

   ```
   {
       "lambdaArn": "<insert your lambda arn>",
       "toolSchema": {
           "inlinePayload": [
               {
                   "name": "get_weather",
                   "description": "Get weather for a location",
                   "inputSchema": {
                       "type": "object",
                       "properties": {
                           "location": {
                               "type": "string",
                               "description": "the location e.g. seattle, wa"
                           }
                       },
                       "required": [
                           "location"
                       ]
                   }
               },
               {
                   "name": "get_time",
                   "description": "Get time for a timezone",
                   "inputSchema": {
                       "type": "object",
                       "properties": {
                           "timezone": {
                               "type": "string"
                           }
                       },
                       "required": [
                           "timezone"
                       ]
                   }
               }
           ]
       }
   }
   ```

1. The following Python code shows how to add a Lambda target using the AWS Python SDK (Boto3):

   ```
   import boto3
   
   # Create the agentcore client
   agentcore_client = boto3.client('bedrock-agentcore-control')
   
   # Create a Lambda target
   target = agentcore_client.create_gateway_target(
       gatewayIdentifier="your-gateway-id",
       name="LambdaTarget",
       targetConfiguration={
           "mcp": {
               "lambda": {
                   "lambdaArn": "arn:aws:lambda:us-west-2:123456789012:function:YourLambdaFunction",
                   "toolSchema": {
                       "inlinePayload": [
                           {
                               "name": "get_weather",
                               "description": "Get weather for a location",
                               "inputSchema": {
                                   "type": "object",
                                   "properties": {"location": {"type": "string"}},
                                   "required": ["location"],
                               },
                           },
                           {
                               "name": "get_time",
                               "description": "Get time for a timezone",
                               "inputSchema": {
                                   "type": "object",
                                   "properties": {"timezone": {"type": "string"}},
                                   "required": ["timezone"],
                               },
                           },
                       ]
                   }
               }
           }
       },
       credentialProviderConfigurations=[
           {
               "credentialProviderType": "GATEWAY_IAM_ROLE"
           }
       ]
   )
   ```

## Add an API Gateway stage target
<a name="gateway-add-target-api-gateway"></a>

To add a stage of an API Gateway REST API as a target, specify the REST API ID and stage name, and define settings to filter tools in the API gateway or to override names and descriptions of tools in the gateway:

The following examples show how to add an API Gateway target. The following configurations are also applied:
+ The tools filtered for are the GET and POST methods for the `/products` path.
+ GET /products is renamed as `get_items`.

Select one of the following methods:

**Example**  

1. Add an API Gateway REST API stage as a target with a complete target configuration:

   ```
   agentcore add gateway-target \
     --gateway MyGateway \
     --target-configuration '{
       "name": "MyAPIGatewayTarget",
       "targetType": "apiGateway",
       "apiGateway": {
         "restApiId": "your-rest-api-id",
         "stage": "your-stage",
         "apiGatewayToolConfiguration": {
           "toolFilters": [
             {
               "filterPath": "/products",
               "methods": ["GET", "POST"]
             }
           ],
           "toolOverrides": [
             {
               "name": "get_items",
               "path": "/products",
               "method": "GET"
             }
           ]
         }
       }
     }'
   agentcore deploy
   ```

1. The following command uses the AWS CLI:

   ```
   aws bedrock-agentcore-control create-gateway-target \
       --gateway-identifier "your-gateway-id" \
       --name "SearchAPITarget" \
       --target-configuration '{
           "mcp": {
               "apiGateway": {
                   "restApiId": "your-rest-api-id",
                   "stage": "your-stage",
                   "apiGatewayToolConfiguration": {
                       "toolFilters": [
                           {
                               "filterPath": "/products",
                               "methods": [
                                   "GET",
                                   "POST"
                               ]
                           }
                       ],
                       "toolOverrides": [
                           {
                               "path": "/products",
                               "method": "GET",
                               "name": "get_items",
                               "description": "Gets information for items in the list of products."
                           }
                       ]
                   }
               }
           }
       }' \
       --credential-provider-configurations '[
           {
               "credentialProviderType": "GATEWAY_IAM_ROLE"
           }
       ]'
   ```

1. The following code uses the AWS Python SDK (Boto3):

   ```
   import boto3
   
   # Create the client
   agentcore_client = boto3.client('bedrock-agentcore-control')
   
   # Create an API gateway REST API target with gateway service role authentication
   target = agentcore_client.create_gateway_target(
       gatewayIdentifier="your-gateway-id",
       name="SearchAPITarget",
       targetConfiguration={
           "mcp": {
               "apiGateway": {
                   "restApiId": "your-rest-api-id",
                   "stage": "your-stage",
                   "apiGatewayToolConfiguration": {
                       "toolFilters": [
                           {
                               "filterPath": "/products",
                               "methods": [
                                   "GET",
                                   "POST"
                               ]
                           }
                       ],
                       "toolOverrides": [
                           {
                               "path": "/products",
                               "method": "GET",
                               "name": "get_item",
                               "description": "Gets information for a specific item in the product list."
                           }
                       ]
                   }
               }
           }
       },
       credentialProviderConfigurations=[
           {
               "credentialProviderType": "GATEWAY_IAM_ROLE"
           }
       ]
   )
   ```

## Add an OpenAPI target
<a name="gateway-add-target-api-openapi"></a>

Select one of the following methods:

**Example**  

1. Add an API key credential to the project, then add an OpenAPI schema target that references it:

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

1. The following Python code shows how to add an OpenAPI target using the AWS Python SDK (Boto3). The schema has been uploaded to an S3 location whose URI is referenced in the `target_payload` . Outbound authorization for the target is through an API key.

   ```
   import boto3
   
   # Create the client
   agentcore_client = boto3.client('bedrock-agentcore-control')
   
   # Create an OpenAPI target with API Key authentication
   target = agentcore_client.create_gateway_target(
       gatewayIdentifier="your-gateway-id",
       name="SearchAPITarget",
       targetConfiguration={
           "mcp": {
               "openApiSchema": {
                   "s3": {
                       "uri": "s3://your-bucket/path/to/open-api-spec.json",
                       "bucketOwnerAccountId": "123456789012"
                   }
               }
           }
       },
       credentialProviderConfigurations=[
           {
               "credentialProviderType": "API_KEY",
               "credentialProvider": {
                   "apiKeyCredentialProvider": {
                       "providerArn": "arn:aws:agent-credential-provider:us-east-1:123456789012:token-vault/default/apikeycredentialprovider/abcdefghijk",
                       "credentialLocation": "HEADER",
                       "credentialParameterName": "X-API-Key"
                   }
               }
           }
       ]
   )
   ```

## Add a Smithy target
<a name="gateway-add-target-api-smithy"></a>

Select one of the following methods:

**Example**  

1. Add a Smithy model target and provide the path to the model file:

   ```
   agentcore add gateway-target \
     --gateway MyGateway \
     --target-configuration '{
       "name": "MySmithyTarget",
       "targetType": "smithyModel",
       "schemaSource": {
         "inline": {
           "path": "path/to/smithy-model.json"
         }
       }
     }'
   agentcore deploy
   ```

1. The following Python code shows how to add a Smithy model target using the AWS Python SDK (Boto3):

   ```
   import boto3
   
   # Create the agentcore client
   agentcore_client = boto3.client('bedrock-agentcore-control')
   
   # Create a Smithy model target
   target = agentcore_client.create_gateway_target(
       gatewayIdentifier="your-gateway-id",
       name="DynamoDBTarget",
       targetConfiguration={
           "mcp": {
               "smithyModel": {
                   "s3": {
                       "uri": "s3://your-bucket/path/to/smithy-model.json",
                       "bucketOwnerAccountId": "123456789012"
                   }
               }
           }
       },
       credentialProviderConfigurations=[
           {
               "credentialProviderType": "GATEWAY_IAM_ROLE"
           }
       ]
   )
   ```

## Add an HTTP runtime target
<a name="gateway-add-target-api-http-runtime"></a>

You can add an Amazon Bedrock AgentCore Runtime agent as an HTTP target to your gateway. The gateway sends traffic directly to the runtime agent without aggregation or protocol translation.

For more information about HTTP targets, see [Amazon Bedrock AgentCore Runtime targets](gateway-target-http-runtime.md).

Select one of the following methods:

**Example**  

1. Add a runtime from your project as a target. Create the gateway without `--protocol-type MCP`. Declare the runtime first, for example with `agentcore add runtime --name MyAgent --language python --protocol HTTP`:

   ```
   agentcore add gateway-target \
     --gateway MyGateway \
     --name MyRuntimeTarget \
     --runtime MyAgent
   agentcore deploy
   ```

1. The following command creates an HTTP runtime target with IAM authorization:

   ```
   aws bedrock-agentcore-control create-gateway-target \
       --gateway-identifier "your-gateway-id" \
       --name "MyRuntimeTarget" \
       --description "Runtime gateway target" \
       --target-configuration '{
           "http": {
               "agentcoreRuntime": {
                   "arn": "arn:aws:bedrock-agentcore:us-west-2:111122223333:runtime/RUNTIME_ID"
               }
           }
       }' \
       --credential-provider-configurations '[{
           "credentialProviderType": "GATEWAY_IAM_ROLE"
       }]'
   ```

1. The following Python code shows how to add an HTTP runtime target using the AWS Python SDK (Boto3):

   ```
   import boto3
   
   agentcore_client = boto3.client('bedrock-agentcore-control')
   
   target = agentcore_client.create_gateway_target(
       gatewayIdentifier="your-gateway-id",
       name="MyRuntimeTarget",
       description="Runtime gateway target",
       targetConfiguration={
           "http": {
               "agentcoreRuntime": {
                   "arn": "arn:aws:bedrock-agentcore:us-west-2:111122223333:runtime/RUNTIME_ID"
               }
           }
       },
       credentialProviderConfigurations=[
           {
               "credentialProviderType": "GATEWAY_IAM_ROLE"
           }
       ]
   )
   ```

## Add an MCP server target
<a name="gateway-add-target-api-MCPserver"></a>

You can add an MCP server target using the AgentCore CLI or AWS Python SDK (Boto3). The following examples show how to create an MCP server target with different outbound authorization types.

 **MCP server with IAM (SigV4) authorization** 

The following example creates an MCP server target with IAM authorization. The gateway signs requests to the MCP server using SigV4 with the gateway service role’s credentials. You must specify the `service` name for signing. The `region` is optional and defaults to the gateway’s Region.

The value of `service` depends on where your MCP server is hosted. The following are common values:
+  `bedrock-agentcore` – For MCP servers hosted on Amazon Bedrock AgentCore, such as the runtime (see [Deploy MCP servers in AgentCore Runtime](runtime-mcp.md) ) or another gateway.
+  `execute-api` – For MCP servers behind Amazon API Gateway.
+  `lambda` – For MCP servers behind Lambda Function URLs.

Select one of the following methods:

**Example**  

1. 

   ```
   aws bedrock-agentcore-control create-gateway-target \
       --gateway-identifier "your-gateway-id" \
       --name "MyMCPTarget" \
       --target-configuration '{
           "mcp": {
               "mcpServer": {
                   "endpoint": "https://my-server.bedrock-agentcore.us-west-2.api.aws"
               }
           }
       }' \
       --credential-provider-configurations '[{
           "credentialProviderType": "GATEWAY_IAM_ROLE",
           "credentialProvider": {
               "iamCredentialProvider": {
                   "service": "bedrock-agentcore",
                   "region": "us-west-2"
               }
           }
       }]'
   ```

1. 

   ```
   import boto3
   
   agentcore_client = boto3.client('bedrock-agentcore-control')
   
   target = agentcore_client.create_gateway_target(
       gatewayIdentifier="your-gateway-id",
       name="MyMCPTarget",
       targetConfiguration={
           "mcp": {
               "mcpServer": {
                   "endpoint": "https://my-server.bedrock-agentcore.us-west-2.api.aws"
               }
           }
       },
       credentialProviderConfigurations=[
           {
               "credentialProviderType": "GATEWAY_IAM_ROLE",
               "credentialProvider": {
                   "iamCredentialProvider": {
                       "service": "bedrock-agentcore",
                       "region": "us-west-2"
                   }
               }
           }
       ]
   )
   ```

 **MCP server with OAuth authorization** 

The following example creates an MCP server target with OAuth (client credentials) authorization.

The OAuth application must support the `client_credentials` grant. An application configured only for the authorization code (`code`) grant cannot be used for gateway outbound authorization. For Amazon Cognito, create a resource server scope and configure the app client with `--allowed-o-auth-flows client_credentials` and that custom scope:

```
aws cognito-idp create-user-pool-client \
  --user-pool-id <USER_POOL_ID> \
  --client-name gateway-client \
  --generate-secret \
  --allowed-o-auth-flows client_credentials \
  --allowed-o-auth-scopes "<RESOURCE_SERVER_IDENTIFIER>/<SCOPE_NAME>" \
  --allowed-o-auth-flows-user-pool-client \
  --supported-identity-providers COGNITO
```

Select one of the following methods:

**Example**  

1. 

   ```
   aws bedrock-agentcore-control create-gateway-target \
       --gateway-identifier "your-gateway-id" \
       --name "MyMCPTarget" \
       --target-configuration '{
           "mcp": {
               "mcpServer": {
                   "endpoint": "https://my-mcp-server.example.com"
               }
           }
       }' \
       --credential-provider-configurations '[{
           "credentialProviderType": "OAUTH",
           "credentialProvider": {
               "oauthCredentialProvider": {
                   "providerArn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:token-vault/default/oauth2credentialprovider/my-oauth-provider",
                   "scopes": []
               }
           }
       }]'
   ```

1. Declare the OAuth credential in the project, then reference it when you add the MCP server target:

   ```
   printf '%s' "$CLIENT_SECRET" | agentcore add credentials oauth \
     --name MyOauthCredential \
     --vendor CustomOauth2 \
     --client-id my-client \
     --discovery-url https://auth.example.com/.well-known/openid-configuration \
     --client-secret -
   
   agentcore add gateway-target \
     --gateway MyGateway \
     --name MyMCPTarget \
     --endpoint https://my-mcp-server.example.com \
     --outbound-auth oauth \
     --credential-name MyOauthCredential
   agentcore deploy
   ```

1. 

   ```
   import boto3
   
   agentcore_client = boto3.client('bedrock-agentcore-control')
   
   target = agentcore_client.create_gateway_target(
       gatewayIdentifier="your-gateway-id",
       name="MyMCPTarget",
       targetConfiguration={
           "mcp": {
               "mcpServer": {
                   "endpoint": "https://my-mcp-server.example.com"
               }
           }
       },
       credentialProviderConfigurations=[
           {
               "credentialProviderType": "OAUTH",
               "credentialProvider": {
                   "oauthCredentialProvider": {
                       "providerArn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:token-vault/default/oauth2credentialprovider/my-oauth-provider",
                       "scopes": []
                   }
               }
           }
       ]
   )
   ```

 **MCP server with API key authorization** 

The following example creates an MCP server target with API key authorization.

Select one of the following methods:

**Example**  

1. 

   ```
   aws bedrock-agentcore-control create-gateway-target \
       --gateway-identifier "your-gateway-id" \
       --name "MyMCPTarget" \
       --target-configuration '{
           "mcp": {
               "mcpServer": {
                   "endpoint": "https://my-mcp-server.example.com"
               }
           }
       }' \
       --credential-provider-configurations '[{
           "credentialProviderType": "API_KEY",
           "credentialProvider": {
               "apiKeyCredentialProvider": {
                   "providerArn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:token-vault/default/apikeycredentialprovider/my-api-key",
                   "credentialLocation": "HEADER",
                   "credentialParameterName": "x-api-key",
                   "credentialPrefix": ""
               }
           }
       }]'
   ```

1. 

   ```
   import boto3
   
   agentcore_client = boto3.client('bedrock-agentcore-control')
   
   target = agentcore_client.create_gateway_target(
       gatewayIdentifier="your-gateway-id",
       name="MyMCPTarget",
       targetConfiguration={
           "mcp": {
               "mcpServer": {
                   "endpoint": "https://my-mcp-server.example.com"
               }
           }
       },
       credentialProviderConfigurations=[
           {
               "credentialProviderType": "API_KEY",
               "credentialProvider": {
                   "apiKeyCredentialProvider": {
                       "providerArn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:token-vault/default/apikeycredentialprovider/my-api-key",
                       "credentialLocation": "HEADER",
                       "credentialParameterName": "x-api-key",
                       "credentialPrefix": ""
                   }
               }
           }
       ]
   )
   ```

## Add a Connector target with Amazon Bedrock Managed Knowledge Bases
<a name="gateway-add-target-api-connector-managed-kb"></a>

You can add the Amazon Bedrock Managed Knowledge Bases connector as a target to your gateway.

For more information about the Amazon Bedrock Managed Knowledge Bases connector, see [Amazon Bedrock Managed Knowledge Bases](gateway-target-connector-managed-kb.md).

### Set up a managed knowledge base
<a name="gateway-add-target-api-connector-managed-kb-setup"></a>

The connector exposes two tools, each named after its backend operation: `AgenticRetrieveStream` (multi-step, streaming agentic retrieval) and `Retrieve` (a single hybrid search). You add a configuration entry per tool.

For `AgenticRetrieveStream`, set `retrievers` (the managed knowledge bases to query) and `agenticRetrieveConfiguration` in `parameterValues`. Both are required — omitting `agenticRetrieveConfiguration` causes a runtime error. It can be an empty object (`{}`) to accept service-managed defaults, but specifying `foundationModelType` and `rerankingModelType` makes the configuration explicit. The agent does not supply knowledge base IDs at call time. For `Retrieve`, set the `knowledgeBaseId` in `parameterValues`; it is required.

The connector supports only managed knowledge bases. Connector targets support only the `GATEWAY_IAM_ROLE` credential provider type.

**Example**  

1. The following Python code shows how to create a Gateway Target with the Amazon Bedrock Managed Knowledge Bases connector configuration using the AWS Python SDK (Boto3):

   ```
   import boto3
   
   gateway_client = boto3.client("bedrock-agentcore-control", region_name="<REGION>")
   
   gateway_client.create_gateway_target(
       name="managed-kb",
       gatewayIdentifier="<GATEWAY_ID>",
       targetConfiguration={
           "mcp": {
               "connector": {
                   "source": {"connectorId": "bedrock-knowledge-bases"},
                   "configurations": [
                       {
                           "name": "AgenticRetrieveStream",
                           "parameterValues": {
                               "retrievers": [
                                   {
                                       "description": "Product documentation",
                                       "configuration": {"knowledgeBase": {"knowledgeBaseId": "<KB_ID_1>"}},
                                   },
                                   {
                                       "description": "Engineering runbooks",
                                       "configuration": {"knowledgeBase": {"knowledgeBaseId": "<KB_ID_2>"}},
                                   },
                               ],
                               "agenticRetrieveConfiguration": {
                                   "foundationModelType": "MANAGED",
                                   "rerankingModelType": "MANAGED",
                               },
                           },
                       },
                       {
                           "name": "Retrieve",
                           "parameterValues": {"knowledgeBaseId": "<KB_ID>"},
                       },
                   ],
               }
           }
       },
       credentialProviderConfigurations=[
           {"credentialProviderType": "GATEWAY_IAM_ROLE"}
       ],
   )
   ```

1. The following command creates a Gateway Target with the Amazon Bedrock Managed Knowledge Bases connector configuration using the AWS CLI:

   ```
   aws bedrock-agentcore-control create-gateway-target \
     --gateway-identifier "<GATEWAY_ID>" \
     --name "managed-kb" \
     --target-configuration '{
       "mcp": {
         "connector": {
           "source": {
             "connectorId": "bedrock-knowledge-bases"
           },
           "configurations": [
             {
               "name": "AgenticRetrieveStream",
               "parameterValues": {
                 "retrievers": [
                   {
                     "description": "Product documentation",
                     "configuration": {"knowledgeBase": {"knowledgeBaseId": "<KB_ID_1>"}}
                   },
                   {
                     "description": "Engineering runbooks",
                     "configuration": {"knowledgeBase": {"knowledgeBaseId": "<KB_ID_2>"}}
                   }
                 ],
                 "agenticRetrieveConfiguration": {
                   "foundationModelType": "MANAGED",
                   "rerankingModelType": "MANAGED"
                 }
               }
             },
             {
               "name": "Retrieve",
               "parameterValues": {
                 "knowledgeBaseId": "<KB_ID>"
               }
             }
           ]
         }
       }
     }' \
     --credential-provider-configurations '[{"credentialProviderType": "GATEWAY_IAM_ROLE"}]' \
     --region "<REGION>"
   ```

1. Add a managed knowledge base connector target:

   ```
   agentcore add gateway-connector \
     --gateway MyGateway \
     --connector bedrock-knowledge-bases \
     --name MyKnowledgeBaseTarget \
     --knowledge-base <KB_ID>
   agentcore deploy
   ```

   This shortcut configures only the `Retrieve` tool. To also configure `AgenticRetrieveStream`, pass a complete target with `agentcore add gateway-connector --gateway MyGateway --connector-configuration file://kb-target.json`. In the file, set `name`, set `targetType` to `connector` and `connectorId` to `bedrock-knowledge-bases`, and use the same two `configurations` entries shown in the other tabs: `AgenticRetrieveStream` with `retrievers` and `agenticRetrieveConfiguration`, and `Retrieve` with `knowledgeBaseId`.

After you call `CreateGatewayTarget`, the Gateway validates the configuration asynchronously (typically within about 30 seconds), which includes a `GetKnowledgeBase` check on each bound knowledge base. Poll `GetGatewayTarget` until `status` is `READY`; a `FAILED` status includes a reason describing the problem.

To customize agentic retrieval — for example, to cap planning iterations or attach a guardrail — add the optional fields to `agenticRetrieveConfiguration`. If you omit them, service-managed defaults apply. For all accepted values, see [Configuration reference](gateway-target-connector-managed-kb.md#gateway-target-connector-managed-kb-config-reference).

```
{
  "name": "AgenticRetrieveStream",
  "parameterValues": {
    "retrievers": [
      { "configuration": { "knowledgeBase": { "knowledgeBaseId": "<KB_ID>" } } }
    ],
    "agenticRetrieveConfiguration": {
      "maxAgentIteration": 5,
      "policyConfiguration": {
        "guardrailConfiguration": {
          "guardrailId": "<GUARDRAIL_ID>",
          "guardrailVersion": "1"
        }
      }
    }
  }
}
```

### Control which parameters the agent can set
<a name="gateway-add-target-api-connector-managed-kb-parameters"></a>

Each tool configuration entry accepts two parameter controls that determine what the calling agent sees and what the Gateway sends to the knowledge base:
+  `parameterValues` — administrator-set values sent to the knowledge base on every call, such as the bound `knowledgeBaseId` or a default `numberOfResults`. These are used unless the agent overrides a field you have exposed.
+  `parameterOverrides` — a list that controls which request fields the agent can see and set at call time. Each entry has:
  +  `path` — the field in the `Retrieve` request, for example `$.retrievalQuery.text` or `$.retrievalConfiguration.managedSearchConfiguration.numberOfResults`.
  +  `description` — optional text shown to the agent describing the field.
  +  `visible` — set to `true` to expose the field to the agent, or `false` to hide it while still sending any administrator-configured default.

Bind `knowledgeBaseId` in `parameterValues` and do not expose it.

The following configuration entry binds the knowledge base, sets a default of 10 results, and exposes the query text and result count to the agent:

```
{
  "name": "Retrieve",
  "description": "Search the knowledge base for relevant documents.",
  "parameterValues": {
    "knowledgeBaseId": "<KB_ID>",
    "retrievalConfiguration": {
      "managedSearchConfiguration": {
        "numberOfResults": 10
      }
    }
  },
  "parameterOverrides": [
    {
      "path": "$.retrievalQuery.text",
      "description": "The search query. Use specific keywords for best results.",
      "visible": true
    },
    {
      "path": "$.retrievalConfiguration.managedSearchConfiguration.numberOfResults",
      "description": "Number of results to retrieve (1-100).",
      "visible": true
    }
  ]
}
```

### Configure the Gateway Service Role
<a name="gateway-add-target-api-connector-managed-kb-service-role"></a>

This connector uses the **gateway execution role** — the IAM role ARN you pass to `CreateGateway`, which the AgentCore service assumes to call the backend on your behalf. This is a role you create, not a service-linked role. For the Amazon Bedrock Managed Knowledge Bases connector, it needs the following permissions:
+  `bedrock:GetKnowledgeBase` — to validate the bound knowledge base when the target is created. Scoped to the managed knowledge base resource.
+  `bedrock:Retrieve` — for the `Retrieve` tool. Scoped to the managed knowledge base resource.
+  `bedrock:AgenticRetrieveStream` — for the `AgenticRetrieveStream` tool. This action is not scoped to a managed knowledge base resource, so grant it on `*`.

The Gateway signs the backend calls as the `bedrock` service. Include `bedrock:GetKnowledgeBase` regardless of which tools you add; if you add only one tool, include only that tool’s retrieval action.

**Note**  
 `bedrock-agentcore:InvokeGateway` is not part of the execution role. That permission belongs to the **caller** — the agent or application invoking the Gateway — not to the role the Gateway assumes.

Add a policy with the following content to the execution role attached to the Gateway:

```
{
  "Version": "2012-10-17", 
  "Statement": [
    {
      "Sid": "ValidateKnowledgeBase",
      "Effect": "Allow",
      "Action": "bedrock:GetKnowledgeBase",
      "Resource": "arn:aws:bedrock:<REGION>:<ACCOUNT_ID>:knowledge-base/<KB_ID>"
    },
    {
      "Sid": "RetrieveFromKnowledgeBase",
      "Effect": "Allow",
      "Action": "bedrock:Retrieve",
      "Resource": "arn:aws:bedrock:<REGION>:<ACCOUNT_ID>:knowledge-base/<KB_ID>"
    },
    {
      "Sid": "AgenticRetrieveStream",
      "Effect": "Allow",
      "Action": "bedrock:AgenticRetrieveStream",
      "Resource": "*"
    }
  ]
}
```

The service role must also trust the AgentCore service so that it can assume the role. Attach the following trust policy, scoping it to your account and Gateway with the `aws:SourceAccount` and `aws:SourceArn` conditions:

```
{
  "Version": "2012-10-17", 
  "Statement": [
    {
      "Sid": "AllowAgentCoreToAssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "bedrock-agentcore.amazonaws.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "aws:SourceAccount": "<ACCOUNT_ID>"
        },
        "ArnLike": {
          "aws:SourceArn": "arn:aws:bedrock-agentcore:<REGION>:<ACCOUNT_ID>:gateway/*"
        }
      }
    }
  ]
}
```

## Add a Connector target with Web Search Tool
<a name="gateway-add-target-api-connector-web-search"></a>

You can add a built-in connector as a target to your gateway. The Web Search Tool connector provides managed web search capabilities without requiring custom infrastructure or API keys.

For more information about the Web Search Tool connector, see [Web Search Tool](gateway-target-connector-web-search-tool.md).

### Set up Web Search Tool
<a name="gateway-add-target-api-connector-web-search-setup"></a>

You can optionally pin the target to a specific connector version by including `version` in the `source` field. If you omit `version`, the target uses the connector’s current default version. For more information about connector versions, see [Connector versions](gateway-target-connector-versions.md).

**Example**  

1. The following Python code shows how to create a Gateway Target with the Web Search Tool connector configuration using the AWS Python SDK (Boto3):

   ```
   import boto3
   
   gateway_client = boto3.client("bedrock-agentcore-control", region_name="<REGION>")
   
   gateway_client.create_gateway_target(
       name="web-search-tool",
       gatewayIdentifier="<GATEWAY_ID>",
       targetConfiguration={
           "mcp": {
               "connector": {
                   "source": {"connectorId": "web-search", "version": "1.1.0"},
                   "configurations": [{"name": "WebSearch", "parameterValues": {}}],
               }
           }
       },
       credentialProviderConfigurations=[
           {"credentialProviderType": "GATEWAY_IAM_ROLE"}
       ],
   )
   ```

1. The following command creates a Gateway Target with the Web Search Tool connector configuration using the AWS CLI:

   ```
   aws bedrock-agentcore-control create-gateway-target \
     --gateway-identifier "<GATEWAY_ID>" \
     --name "web-search-tool" \
     --target-configuration '{
       "mcp": {
         "connector": {
           "source": {
             "connectorId": "web-search",
             "version": "1.1.0"
           },
           "configurations": [
             {
               "name": "WebSearch",
               "parameterValues": {}
             }
           ]
         }
       }
     }' \
     --credential-provider-configurations '[{"credentialProviderType": "GATEWAY_IAM_ROLE"}]' \
     --region "<REGION>"
   ```

1. Add a Web Search Tool target:

   ```
   agentcore add gateway-connector \
     --gateway MyGateway \
     --connector web-search \
     --name MyWebSearchTarget
   agentcore deploy
   ```

### Configure domain filtering
<a name="gateway-add-target-api-connector-web-search-domain-filtering"></a>

You can restrict which domains the Web Search Tool is allowed to query by configuring a domain include or an exclude list. This is useful for administrators who want to prevent agents from returning results from specific websites.
+  **Target-level domain exclude list** — A list of domains excluded from all searches on a target, set at target creation using `parameterValues.domainFilter.exclude`. The exclude list is enforced server-side and hidden from the calling agent.
+  **Target-level domain include list (connector version `1.2.0` and later)** — In addition to the exclude list, you can configure `parameterValues.domainFilter.include` to restrict searches to a specific set of domains.

Request-level filters (domain include/exclude and published-date range) are available to the calling agent in connector version `1.2.0` and later. Request-level filters compose with the target-level exclude and include lists: the target-level exclusions and inclusions always apply, and the agent cannot relax them.

The following examples create a Web Search Tool target pinned to version `1.2.0` with both domain include and exclude lists:

**Example**  

1. The following Python code shows how to create a Web Search Tool target with domain filtering using the AWS Python SDK (Boto3):

   ```
   import boto3
   
   gateway_client = boto3.client("bedrock-agentcore-control", region_name="<REGION>")
   
   gateway_client.create_gateway_target(
       name="web-search-tool",
       gatewayIdentifier="<GATEWAY_ID>",
       targetConfiguration={
           "mcp": {
               "connector": {
                   "source": {"connectorId": "web-search", "version": "1.2.0"},
                   "configurations": [
                       {
                           "name": "WebSearch",
                           "parameterValues": {
                               "domainFilter": {
                                   "include": ["allowed-website-1.com", "allowed-website-2.com"],
                                   "exclude": ["blocked-website-1.com", "blocked-website-2.com"]
                               }
                           },
                       }
                   ],
               }
           }
       },
       credentialProviderConfigurations=[
           {"credentialProviderType": "GATEWAY_IAM_ROLE"}
       ],
   )
   ```

1. The following command creates a Web Search Tool target with domain filtering using the AWS CLI:

   ```
   aws bedrock-agentcore-control create-gateway-target \
     --gateway-identifier "<GATEWAY_ID>" \
     --name "web-search-tool" \
     --target-configuration '{
       "mcp": {
         "connector": {
           "source": {
             "connectorId": "web-search",
             "version": "1.2.0"
           },
           "configurations": [
             {
               "name": "WebSearch",
               "parameterValues": {
                 "domainFilter": {
                   "include": ["allowed-website-1.com", "allowed-website-2.com"],
                   "exclude": ["blocked-website-1.com", "blocked-website-2.com"]
                 }
               }
             }
           ]
         }
       }
     }' \
     --credential-provider-configurations '[{"credentialProviderType": "GATEWAY_IAM_ROLE"}]' \
     --region "<REGION>"
   ```

1. Pass a complete connector configuration to exclude domains:

   ```
   agentcore add gateway-connector \
     --gateway MyGateway \
     --connector-configuration '{
       "name": "MyWebSearchTarget",
       "targetType": "connector",
       "connectorId": "web-search",
       "configurations": [
         {
           "name": "WebSearch",
           "parameterValues": {
             "domainFilter": {
               "exclude": [
                 "blocked-website-1.com",
                 "blocked-website-2.com"
               ]
             }
           }
         }
       ]
     }'
   agentcore deploy
   ```

You can also update an existing target to add or modify domain filtering using `UpdateGatewayTarget`.

### Configure the Gateway Service Role
<a name="gateway-add-target-api-connector-web-search-service-role"></a>

The Gateway needs a service role that allows the AgentCore service to perform actions on your behalf. For the Web Search Tool, the role needs the following permissions:
+  `bedrock-agentcore:InvokeGateway` — to invoke the Gateway
+  `bedrock-agentcore:InvokeWebSearch` — to authorize web search invocations, checked per-request against the service-owned ARN `arn:aws:bedrock-agentcore:<region>:aws:tool/web-search.v1` 

Add a policy with the following content to the service role attached to the Gateway:

```
{
  "Version": "2012-10-17", 
  "Statement": [
    {
      "Sid": "InvokeGateway",
      "Effect": "Allow",
      "Action": "bedrock-agentcore:InvokeGateway",
      "Resource": "arn:aws:bedrock-agentcore:<REGION>:<ACCOUNT_ID>:gateway/*"
    },
    {
      "Sid": "InvokeWebSearch",
      "Effect": "Allow",
      "Action": "bedrock-agentcore:InvokeWebSearch",
      "Resource": "arn:aws:bedrock-agentcore:<REGION>:aws:tool/web-search.v1"
    }
  ]
}
```

## Add a Connector target with AWS Step Functions
<a name="gateway-add-target-api-connector-step-functions"></a>

You can add a built-in connector as a target to your gateway. With the Step Functions connector, agents can start, monitor, and stop state machine executions and complete task-token callbacks without any integration code.

For more information about the Step Functions connector, see [AWS Step Functions as Connector Target](gateway-target-connector-step-functions.md).

### Set up a Step Functions target
<a name="gateway-add-target-api-connector-step-functions-setup"></a>

In `configurations`, list each operation you want to expose as a tool. For the four operations that act on a state machine — `StartExecution`, `StartSyncExecution`, `ListExecutions`, and `DescribeStateMachine` — set `parameterValues.stateMachineArn` to pin the state machine. Always set this pin. An entry without `parameterValues` can pass target creation, but its tool fails on every call. The remaining operations take an execution Amazon Resource Name (ARN) or a task token from the agent and have no `parameterValues`.

You can optionally pin the target to a specific connector version by including `version` in the `source` field. If you omit `version`, the target uses the connector’s current default version. For more information about connector versions, see [Connector versions](gateway-target-connector-versions.md).

The following examples expose a Standard state machine for starting and inspecting executions, and the execution-level operations the agent needs to follow up. In the examples, replace the following values:

 `<ACCOUNT_ID>`   
The AWS account ID that owns the state machine.

 `<GATEWAY_ID>`   
The identifier of your gateway.

 `<REGION>`   
The AWS Region of your gateway.

**Example**  

1. The following Python code shows how to create a Gateway Target with the Step Functions connector configuration using the AWS Python SDK (Boto3):

   ```
   import boto3
   
   gateway_client = boto3.client("bedrock-agentcore-control", region_name="<REGION>")
   
   state_machine_arn = "arn:aws:states:<REGION>:<ACCOUNT_ID>:stateMachine:OrderWorkflow"
   
   gateway_client.create_gateway_target(
       name="orders",
       gatewayIdentifier="<GATEWAY_ID>",
       targetConfiguration={
           "mcp": {
               "connector": {
                   "source": {"connectorId": "states", "version": "1.0.0"},
                   "configurations": [
                       {"name": "StartExecution", "parameterValues": {"stateMachineArn": state_machine_arn}},
                       {"name": "ListExecutions", "parameterValues": {"stateMachineArn": state_machine_arn}},
                       {"name": "DescribeStateMachine", "parameterValues": {"stateMachineArn": state_machine_arn}},
                       {"name": "DescribeExecution"},
                       {"name": "GetExecutionHistory"},
                       {"name": "StopExecution"},
                   ],
               }
           }
       },
       credentialProviderConfigurations=[
           {"credentialProviderType": "GATEWAY_IAM_ROLE"}
       ],
   )
   ```

1. The following command creates a Gateway Target with the Step Functions connector configuration using the AWS CLI:

   ```
   aws bedrock-agentcore-control create-gateway-target \
     --gateway-identifier "<GATEWAY_ID>" \
     --name "orders" \
     --target-configuration '{
       "mcp": {
         "connector": {
           "source": {
             "connectorId": "states",
             "version": "1.0.0"
           },
           "configurations": [
             {
               "name": "StartExecution",
               "parameterValues": {
                 "stateMachineArn": "arn:aws:states:<REGION>:<ACCOUNT_ID>:stateMachine:OrderWorkflow"
               }
             },
             {
               "name": "ListExecutions",
               "parameterValues": {
                 "stateMachineArn": "arn:aws:states:<REGION>:<ACCOUNT_ID>:stateMachine:OrderWorkflow"
               }
             },
             {
               "name": "DescribeStateMachine",
               "parameterValues": {
                 "stateMachineArn": "arn:aws:states:<REGION>:<ACCOUNT_ID>:stateMachine:OrderWorkflow"
               }
             },
             { "name": "DescribeExecution" },
             { "name": "GetExecutionHistory" },
             { "name": "StopExecution" }
           ]
         }
       }
     }' \
     --credential-provider-configurations '[{"credentialProviderType": "GATEWAY_IAM_ROLE"}]' \
     --region "<REGION>"
   ```

1. To add a Step Functions target, run `agentcore add gateway-target` with `--type connector --connector states`:

   ```
   agentcore add gateway-target \
     --name orders \
     --type connector \
     --connector states \
     --gateway MyGateway
   agentcore deploy
   ```

After the target reaches `READY`, call `tools/list` on the Gateway. The pinned `stateMachineArn` doesn’t appear in any tool schema. For example, `orders___StartExecution` advertises only `input`.

You can add an Express state machine to the same target for synchronous calls. Add a `StartSyncExecution` entry pinned to the Express state machine’s ARN. You set pins for each operation, so one target can mix Standard and Express state machines. For which operations work with each workflow type, see [Standard and Express workflows](gateway-target-connector-step-functions.md#gateway-target-connector-step-functions-standard-express).

To expose the task-token operations, add `SendTaskSuccess`, `SendTaskFailure`, and `SendTaskHeartbeat` entries without `parameterValues`. These operations aren’t scoped to a state machine. Add them once for each gateway, on a separate target, instead of on every target.

To change the pinned state machines or the exposed operations later, call `UpdateGatewayTarget` with the new `configurations` list. Existing targets also pick up updated tool descriptions and schemas when you update them.

### Configure the Gateway Service Role
<a name="gateway-add-target-api-connector-step-functions-service-role"></a>

The Gateway needs a service role that allows the AgentCore service to call Step Functions on your behalf. Scope the role to the state machines you expose. The policy needs three statements because the Step Functions resource types differ:
+ State-machine operations (`StartExecution`, `StartSyncExecution`, `ListExecutions`, `DescribeStateMachine`) are authorized on the state machine ARN.
+ Execution operations (`DescribeExecution`, `StopExecution`, `GetExecutionHistory`) are authorized on the execution ARN, which is a separate resource type. These operations work only with Standard executions.
+ Task-token operations (`SendTaskSuccess`, `SendTaskFailure`, `SendTaskHeartbeat`) have no resource-level permissions in IAM and must be granted on `"*"`.

Each statement in the following policy uses the minimal scope that IAM supports for its operations, following least-privilege guidance:
+ The execution ARN ends in a `*` wildcard because Step Functions generates execution names when each execution starts, so you can’t list them in advance. The wildcard covers only executions of `OrderWorkflow`, not executions of other state machines.
+ The task-token operations are granted on `"*"` because IAM doesn’t support resource-level permissions for these actions. A caller also needs a valid task token from one of your executions.

The following JSON policy grants the permissions for all ten connector operations. Attach it to the Gateway’s service role:

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "StateMachineOperations",
      "Effect": "Allow",
      "Action": [
        "states:StartExecution",
        "states:StartSyncExecution",
        "states:ListExecutions",
        "states:DescribeStateMachine"
      ],
      "Resource": [
        "arn:aws:states:<REGION>:<ACCOUNT_ID>:stateMachine:OrderWorkflow",
        "arn:aws:states:<REGION>:<ACCOUNT_ID>:stateMachine:OrderLookupExpress"
      ]
    },
    {
      "Sid": "ExecutionOperations",
      "Effect": "Allow",
      "Action": [
        "states:DescribeExecution",
        "states:StopExecution",
        "states:GetExecutionHistory"
      ],
      "Resource": [
        "arn:aws:states:<REGION>:<ACCOUNT_ID>:execution:OrderWorkflow:*"
      ]
    },
    {
      "Sid": "TaskTokenOperations",
      "Effect": "Allow",
      "Action": [
        "states:SendTaskSuccess",
        "states:SendTaskFailure",
        "states:SendTaskHeartbeat"
      ],
      "Resource": "*"
    }
  ]
}
```

In the policy, replace the following values:

 `<ACCOUNT_ID>`   
The AWS account ID that owns the state machines.

 `OrderLookupExpress`   
The name of your Express state machine. If you don’t expose an Express state machine, remove its ARN from the policy.

 `OrderWorkflow`   
The name of your Standard state machine.

 `<REGION>`   
The AWS Region of your gateway and state machines.

Only the four state-machine operations can be pinned on the target. For the other six, this policy is the only boundary on which executions the agent can inspect, stop, or complete. Don’t grant `states:*` on `Resource: "*"`. If different workflows need different IAM boundaries, use separate Gateways, because all targets on a Gateway share its service role.

The service role’s trust policy must allow the `bedrock-agentcore.amazonaws.com` service principal to assume it, as for any Gateway service role. For more information, see [Trust permissions](gateway-prerequisites-permissions.md#gateway-service-role-permissions-trust).