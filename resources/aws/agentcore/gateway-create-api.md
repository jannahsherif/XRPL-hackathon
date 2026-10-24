

# Create an AgentCore gateway using the API
<a name="gateway-create-api"></a>

To create a AgentCore gateway using the API, make a [CreateGateway](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreateGateway.html) request with one of the [AgentCore control plane endpoints](https://docs.aws.amazon.com/general/latest/gr/bedrock_agentcore.html#bedrock_agentcore_cp).

Minimally, you must specify the following fields:
+  `name` – The name of the gateway.
+  `roleArn` – The ARN of the gateway service role. For more information, see [AgentCore Gateway service role permissions](gateway-prerequisites-permissions.md#gateway-service-role-permissions).
+  `authorizerType` – The type of authorizer to use for the gateway. Depends on the inbound authorization that you set up. For more information, see [Set up inbound authorization for your gateway](gateway-inbound-auth.md).

The following optional fields add metadata to your gateway:
+  `protocolType` – The protocol type for the gateway. If you set this to `MCP`, the gateway operates in aggregation mode and can only have MCP targets. If you omit this field, the gateway can have both MCP and HTTP targets.
+  `description` – A description of the gateway.
+  `tags` – A dictionary of key-value pairs specifying tags that you can use to label your gateway for monitoring purposes.

The remaining fields depend on your gateway configuration and whether you want to toggle custom features for your gateway:
+  `clientToken` – A client token value to ensure that a request completes no more than once. If you don’t include this token, one is randomly generated for you. For more information, see [Ensuring idempotency](https://docs.aws.amazon.com/ec2/latest/devguide/ec2-api-idempotency.html).
+  `authorizerConfiguration` – If your authorizer type is `CUSTOM_JWT` , you must include this field to specify the gateway authorization and authentication parameters. For more information, see [The authorizer configuration](#gateway-create-api-authorizer-config).
+  `kmsKeyArn` – To encrypt your gateway with a KMS key include the ARN of the key in this field. For more information, see [Encrypt your AgentCore gateway with a customer-managed KMS key](gateway-encryption.md).
+  `exceptionLevel` – To turn on debugging messages when invoking the gateway, set this value to `DEBUG` . For more information, see [Turn on debugging messages](gateway-debug-messages.md) . For examples of creating a gateway with this setting, see [Create a gateway with debugging messages](#gateway-create-ex-debug).
+  `interceptorConfigurations` – To turn on custom code that is run when invoking your gateway, include this field. For more information, see [Using interceptors with Gateway](gateway-interceptors.md) . For examples of creating a gateway with interceptors, see [Create a gateway with interceptor configurations](#gateway-create-ex-basic-interceptors).
+  `protocolConfiguration` – To include customizations for the gateway protocol, configure the settings in this field. For options in this configuration, see [GatewayProtocolConfiguration](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_GatewayProtocolConfiguration.html).
  + One example option is the addition of a tool search tool in your gateway. For more information, see [Search for tools in your AgentCore gateway with a natural language query](gateway-using-mcp-semantic-search.md) . For examples of creating a gateway with this search tool, see [Create a gateway with semantic search](#gateway-create-ex-semantic).

## The authorizer configuration
<a name="gateway-create-api-authorizer-config"></a>

If your authorizer type is `CUSTOM_JWT` , you must also include an authorizer configuration in the `authorizerConfiguration` field. The basic structure of the authorizer configuration is as follows:

```
{
  "customJWTAuthorizer": {
    "discoveryUrl": "string",
    "allowedAudience": ["string"],
    "allowedClients": ["string"],
    "allowedScopes": ["string"],
    "customClaims": see below
  }
}
```

You must provide the discovery URL for the authentication token. The remaining fields define restrictions for the authentication claims:
+  `allowedAudience` – The audiences or services that can handle the JWT.
+  `allowedClients` – The clients that are allowed to create a JWT.
+  `allowedScopes` – The scopes of that limit the set of claims.
+  `customClaims` – An array of objects that allows you to define custom fields and values that limit the claims to be authenticated. Each object is a `CustomClaimValidationsType` object contains the following fields:
  +  `inboundTokenClaimName` – The name of the custom claim field to check.
  +  `inboundTokenClaimValueType` – The data type of the claim value to check for.
  +  `authorizingClaimMatchValue` – Defines the value to match the claim value to. Contains the following fields:
    +  `claimMatchOperator` – Defines the relationship to look for between the match value and claim value.
    +  `claimMatchValue` – An object that contains only one of the following fields:
      + matchValueString – Used in the following situations:
        + If the `inboundTokenClaimValueType` is `STRING` and the `claimMatchOperator` is `EQUALS` , specify a string that you want the claim value to match with for authentication.
        + If the `inboundTokenClaimValueType` is `STRING_ARRAY` and the `claimMatchOperator` is `CONTAINS` , specify a string that you want the claim value array to contain for authentication.
      +  `matchValueStringList` – If the `inboundTokenClaimValueType` is `STRING_ARRAY` and the `claimMatchOperator` is `CONTAINS_ANY` , specify an array of values that you want to check for authentication. If any of the values in the claim value array matches any of the values in the `matchValueStringList` , the claim can be authenticated.

The following examples show the structure of the CustomClaimValidationsType objects that you can specify:

**Example**  

1. 

   ```
   {
     "inboundTokenClaimName": "string",
     "inboundTokenClaimValueType": "STRING",
     "authorizingClaimMatchValue": {
       "claimMatchValue": {
         "matchValueString": "string"
       },
       "claimMatchOperator": "EQUALS"
     }
   }
   ```

1. 

   ```
   {
     "inboundTokenClaimName": "string",
     "inboundTokenClaimValueType": "STRING_ARRAY",
     "authorizingClaimMatchValue": {
       "claimMatchValue": {
         "matchValueString": "string"
       },
       "claimMatchOperator": "CONTAINS"
     }
   }
   ```

1. 

   ```
   {
     "inboundTokenClaimName": "string",
     "inboundTokenClaimValueType": "STRING_ARRAY",
     "authorizingClaimMatchValue": {
       "claimMatchValue": {
         "matchValueStringList": ["string"]
       },
       "claimMatchOperator": "CONTAINS_ANY"
     }
   }
   ```

To see examples of how to create a gateway, expand the section that corresponds to your use case:

**Topics**

## Create a gateway: basic example (Custom JWT authorization)
<a name="gateway-create-ex-basic-jwt"></a>

This section provides basic examples of creating a gateway.

**Note**  
The values for the authorization configuration are from when you set up [inbound authorization](gateway-inbound-auth.md).
If you choose an option that involves specifying an overt gateway service role ARN, ensure that you specify an existing one that you’ve set up. For more information, see [AgentCore Gateway service role permissions](gateway-prerequisites-permissions.md#gateway-service-role-permissions).

Select one of the following methods:

**Example**  

1. Use the AgentCore CLI to declare a gateway in your project and deploy it.

   To add the gateway, use `agentcore add gateway`. The CLI creates a gateway service role when you don’t provide one. To use JWT authorization, set up an identity provider first and pass its discovery URL and allowed clients with `--authorizer-configuration`.

    **Using default arguments** 

   Run the following command in a terminal to create a gateway with no authorization (the default). To add Custom JWT authorization, specify the authorizer flags as shown in the next example:

   ```
   agentcore add gateway --name my-gateway
   ```

    **Specifying arguments** 

   The following command shows how to create a gateway with Custom JWT authorization and explicit configuration:

   ```
   agentcore add gateway \
     --name my-gateway \
     --authorizer-type CUSTOM_JWT \
     --authorizer-configuration '{
       "customJwtAuthorizer": {
         "discoveryUrl": "https://cognito-idp.us-west-2.amazonaws.com/some-user-pool/.well-known/openid-configuration",
         "allowedAudience": ["api.example.com"]
       }
     }'
   agentcore deploy
   ```

   After deployment, run `agentcore status --json` to get the gateway ARN. The gateway ID is the last segment of the ARN. To call the gateway, get an access token from your identity provider and run `agentcore invoke --gateway my-gateway --bearer-token <ACCESS_TOKEN>`.

1. From your AgentCore project directory, run `agentcore add gateway`.

1. Enter the gateway name and press **Enter**.

1. Select **CUSTOM\_JWT**. Enter the discovery URL and the allowed client IDs, separated by commas, when prompted.

1. Choose whether to turn on semantic search and press **Enter**.

1. Review the configuration and press **Enter** to add the gateway to `agentcore.json`.

1. Press **Ctrl\+C** to exit the TUI, then run `agentcore deploy` to provision the gateway.

1. Run the following code in a terminal to create a basic gateway with the AWS CLI:

   ```
   aws bedrock-agentcore-control create-gateway \
     --name my-gateway \
     --role-arn arn:aws:iam::123456789012:role/my-gateway-service-role \
     --protocol-type MCP \
     --authorizer-type CUSTOM_JWT \
     --authorizer-configuration '{
       "customJWTAuthorizer": {
         "discoveryUrl": "https://cognito-idp.us-west-2.amazonaws.com/some-user-pool/.well-known/openid-configuration",
         "allowedClients": ["clientId"]
       }
     }'
   ```

   The `gatewayUrl` in the response is the endpoint to use when you invoke the gateway.

1. The following Python code shows how to create a basic gateway with the AWS Python SDK (Boto3):

   ```
   import boto3
   
   # Initialize the AgentCore client
   client = boto3.client('bedrock-agentcore-control')
   
   # Create a gateway
   gateway = client.create_gateway(
     name="my-gateway",
     roleArn="arn:aws:iam::123456789012:role/my-gateway-service-role",
     protocolType="MCP",
     authorizerType="CUSTOM_JWT",
     authorizerConfiguration={
         "customJWTAuthorizer": {
             "discoveryUrl": "https://cognito-idp.us-west-2.amazonaws.com/some-user-pool/.well-known/openid-configuration",
             "allowedClients": ["clientId"]
         }
     }
   )
   
   print(f"MCP Endpoint: {gateway['gatewayUrl']}")
   ```

## Create a gateway: basic example (IAM authorization)
<a name="gateway-create-ex-basic-iam"></a>

This section provides basic examples of creating a gateway using IAM authorization. With IAM authorization, you don’t need an authorizer configuration.

Select one of the following methods:

**Example**  

1. Run the following commands in your AgentCore project. The CLI creates a gateway service role when you don’t provide one:

   ```
   agentcore add gateway \
     --name my-gateway \
     --authorizer-type AWS_IAM
   agentcore deploy
   ```

1. Run the following in a terminal:

   ```
   aws bedrock-agentcore-control create-gateway \
   --name my-gateway \
   --role-arn arn:aws:iam::123456789012:role/MyAgentCoreServiceRole \
   --protocol-type MCP \
   --authorizer-type AWS_IAM
   ```

1. 

   ```
   import boto3
   
   # Create the AgentCore client
   agentcore_client = boto3.client('bedrock-agentcore-control')
   
   # Create a gateway
   gateway = agentcore_client.create_gateway(
     name="my-gateway",
     roleArn="arn:aws:iam::123456789012:role/MyAgentCoreServiceRole",
     protocolType="MCP",
     authorizerType="AWS_IAM"
   )
   ```

## Create a gateway: basic example (NONE authorizer)
<a name="gateway-create-ex-basic-none-auth"></a>

This section provides basic examples of creating a gateway with a NONE authorizer type. This represents a gateway that will not perform authentication or authorization for any incoming requests.

**Note**  
The NONE authorizer type represents a gateway that will not perform authentication or authorization for any incoming requests. See [inbound authorization](gateway-inbound-auth.md) for security concerns and details around using this configuration.
If you choose an option that involves specifying an overt gateway service role ARN, ensure that you specify an existing one that you’ve set up. For more information, see [AgentCore Gateway service role permissions](gateway-prerequisites-permissions.md#gateway-service-role-permissions).

Select one of the following methods:

**Example**  

1. Use the AgentCore CLI to create a gateway with the NONE authorizer type:

   ```
   agentcore add gateway \
     --name my-gateway \
     --authorizer-type NONE
   agentcore deploy
   ```

   After deployment, run `agentcore status --json` to get the gateway ARN. The gateway ID is the last segment of the ARN. To call the gateway, run `agentcore invoke --gateway my-gateway`.

1. From your AgentCore project directory, run `agentcore add gateway`.

1. Enter the gateway name and press **Enter**.

1. Select **NONE** as the authorizer type and press **Enter**.

1. Choose whether to turn on semantic search and press **Enter**.

1. Review the configuration and press **Enter** to add the gateway to `agentcore.json`.

1. Press **Ctrl\+C** to exit the TUI, then run `agentcore deploy` to provision the gateway.

1. Run the following code in a terminal to create a gateway with NONE authorizer type using the AWS CLI:

   ```
   aws bedrock-agentcore-control create-gateway \
     --name my-gateway \
     --role-arn arn:aws:iam::111122223333:role/my-gateway-service-role \
     --protocol-type MCP \
     --authorizer-type NONE
   ```

   The `gatewayUrl` in the response is the endpoint to use when you invoke the gateway.

1. The following Python code shows how to create a gateway with NONE authorizer type using the AWS Python SDK (Boto3):

   ```
   import boto3
   
   # Initialize the AgentCore client
   client = boto3.client('bedrock-agentcore-control')
   
   # Create a gateway
   gateway = client.create_gateway(
     name="my-gateway",
     roleArn="arn:aws:iam::111122223333:role/my-gateway-service-role",
     protocolType="MCP",
     authorizerType="NONE"
   )
   
   print(f"MCP Endpoint: {gateway['gatewayUrl']}")
   ```

## Create a gateway: basic example (AUTHENTICATE\_ONLY authorization)
<a name="gateway-create-ex-basic-authenticate-only"></a>

This section provides examples of creating a gateway with `AUTHENTICATE_ONLY` authorization. With this authorizer type, the gateway verifies the caller’s SigV4 signature but makes no authorization decision. This is useful when you want the gateway to verify that the caller is authenticated while delegating authorization decisions to the target service or to a policy engine. To forward the caller’s identity to the target, use [Caller IAM credentials](gateway-building-adding-targets-authorization.md#gateway-building-adding-targets-authorization-caller-iam) outbound authorization.

**Note**  
The `AUTHENTICATE_ONLY` authorizer type doesn’t use an authorizer configuration. If you choose an option that involves specifying an overt gateway service role ARN, ensure that you specify an existing one that you’ve set up. For more information, see [AgentCore Gateway service role permissions](gateway-prerequisites-permissions.md#gateway-service-role-permissions).

Select one of the following methods:

**Example**  

1. Run the following command to create a gateway with `AUTHENTICATE_ONLY` authorization:

   ```
   aws bedrock-agentcore-control create-gateway \
     --name my-gateway \
     --role-arn arn:aws:iam::111122223333:role/my-gateway-service-role \
     --authorizer-type AUTHENTICATE_ONLY
   ```

   The `gatewayUrl` in the response is the endpoint to use when you invoke the gateway.

1. The following Python code shows how to create a gateway with `AUTHENTICATE_ONLY` authorization:

   ```
   import boto3
   
   # Initialize the AgentCore client
   client = boto3.client('bedrock-agentcore-control')
   
   # Create a gateway
   gateway = client.create_gateway(
     name="my-gateway",
     roleArn="arn:aws:iam::111122223333:role/my-gateway-service-role",
     authorizerType="AUTHENTICATE_ONLY"
   )
   
   print(f"Gateway URL: {gateway['gatewayUrl']}")
   ```

## Create a gateway with semantic search
<a name="gateway-create-ex-semantic"></a>

This section provides basic examples of creating a gateway with a tool to allow you to semantically search for relevant tools. To learn how to use this tool, see [Search for tools in your AgentCore gateway with a natural language query](gateway-using-mcp-semantic-search.md).

Select one of the following methods:

**Example**  

1. Semantic search is disabled by default. To enable it, create an MCP gateway and pass `--enable-semantic-search`:

   ```
   agentcore add gateway \
     --name my-gateway \
     --protocol-type MCP \
     --enable-semantic-search
   agentcore deploy
   ```

1. From your AgentCore project directory, run `agentcore add gateway`.

1. Enter the gateway name and press **Enter**.

1. Select an authorizer type. For **CUSTOM\_JWT**, enter the discovery URL and the allowed client IDs, separated by commas, when prompted.

1. Select **on** to enable semantic search and press **Enter**. This also restricts the gateway to MCP targets.

1. Review the configuration and press **Enter** to add the gateway to `agentcore.json`.

1. Press **Ctrl\+C** to exit the TUI, then run `agentcore deploy` to provision the gateway.

1. Turn on semantic search when creating a gateway in the AWS CLI by specifying `searchType` as `SEMANTIC` in the `--protocol-configuration` object, as in the following example:

   ```
   aws bedrock-agentcore-control create-gateway \
     --name my-gateway \
     --role-arn arn:aws:iam::123456789012:role/my-gateway-service-role \
     --protocol-type MCP \
     --authorizer-type CUSTOM_JWT \
     --authorizer-configuration '{
       "customJWTAuthorizer": {
         "discoveryUrl": "https://cognito-idp.us-west-2.amazonaws.com/some-user-pool/.well-known/openid-configuration",
         "allowedClients": ["clientId"]
       }
     }' \
     --protocol-configuration '{
       "mcp": {
           "searchType": "SEMANTIC"
       }
     }'
   ```

   The `gatewayUrl` in the response is the endpoint to use when you invoke the gateway.

1. Turn on semantic search when creating a gateway using the AWS Python SDK (Boto3) by specifying `searchType` as `SEMANTIC` in the `protocolConfiguration` object, as in the following example:

   ```
   import boto3
   
   # Initialize the AgentCore client
   client = boto3.client('bedrock-agentcore-control')
   
   # Create a gateway
   gateway = client.create_gateway(
     name="my-gateway",
     roleArn="arn:aws:iam::123456789012:role/my-gateway-service-role",
     protocolType="MCP",
     authorizerType="CUSTOM_JWT",
     authorizerConfiguration={
         "customJWTAuthorizer": {
             "discoveryUrl": "https://cognito-idp.us-west-2.amazonaws.com/some-user-pool/.well-known/openid-configuration",
             "allowedClients": ["clientId"]
         }
     },
     protocolConfiguration={
       "mcp": {
           "searchType": "SEMANTIC"
       }
     }
   )
   
   print(f"MCP Endpoint: {gateway['gatewayUrl']}")
   ```

## Create a gateway with debugging messages
<a name="gateway-create-ex-debug"></a>

You can create a gateway with debugging messages by specifying the `exceptionLevel` value as `DEBUG` . This section provides examples of creating a gateway with debugging messages. To learn more, see [Turn on debugging messages](gateway-debug-messages.md).

**Note**  
The AgentCore CLI sets `exceptionLevel` to `NONE` by default. To turn on debugging messages, pass the `--exception-level debug` flag when you create the gateway. To turn off debugging messages, set `exceptionLevel` to `NONE` for the gateway in `agentcore.json` and run `agentcore deploy`.

Select one of the following methods:

**Example**  

1. When you create a gateway using the AgentCore CLI, pass the `--exception-level` flag to enable debugging messages:

   ```
   agentcore add gateway --name my-gateway --exception-level debug
   agentcore deploy
   ```

1. Run the following code in a terminal to create a gateway with debugging messages turned on in the AWS CLI:

   ```
   aws bedrock-agentcore-control create-gateway \
     --name my-gateway \
     --role-arn arn:aws:iam::123456789012:role/my-gateway-service-role \
     --protocol-type MCP \
     --authorizer-type CUSTOM_JWT \
     --authorizer-configuration '{
       "customJWTAuthorizer": {
         "discoveryUrl": "https://cognito-idp.us-west-2.amazonaws.com/some-user-pool/.well-known/openid-configuration",
         "allowedClients": ["clientId"]
       }
     }' \
     --exception-level DEBUG
   ```

   The `gatewayUrl` in the response is the endpoint to use when you invoke the gateway.

1. The following Python code shows how to create a basic gateway with the AWS Python SDK (Boto3):

   ```
   import boto3
   
   # Initialize the AgentCore client
   client = boto3.client('bedrock-agentcore-control')
   
   # Create a gateway
   gateway = client.create_gateway(
     name="my-gateway",
     roleArn="arn:aws:iam::123456789012:role/my-gateway-service-role",
     protocolType="MCP",
     authorizerType="CUSTOM_JWT",
     authorizerConfiguration={
         "customJWTAuthorizer": {
             "discoveryUrl": "https://cognito-idp.us-west-2.amazonaws.com/some-user-pool/.well-known/openid-configuration",
             "allowedClients": ["clientId"]
         }
     },
     exceptionLevel="DEBUG"
   )
   
   print(f"MCP Endpoint: {gateway['gatewayUrl']}")
   ```

## Create a gateway with interceptor configurations
<a name="gateway-create-ex-basic-interceptors"></a>

This section provides examples of creating a gateway that has interceptors configured. Interceptors will be invoked at runtime of the gateway for each request.

**Note**  
If you choose an option that involves specifying an overt gateway service role ARN, ensure that you specify an existing one that you’ve set up and that it allows `lambda:InvokeFunction` on the interceptor function. For more information, see [AgentCore Gateway service role permissions](gateway-prerequisites-permissions.md#gateway-service-role-permissions).

Select one of the following methods:

**Example**  

1. Add the gateway to your project:

   ```
   agentcore add gateway \
     --name my-gateway \
     --authorizer-type CUSTOM_JWT \
     --authorizer-configuration '{
       "customJwtAuthorizer": {
         "discoveryUrl": "https://cognito-idp.us-west-2.amazonaws.com/some-user-pool/.well-known/openid-configuration",
         "allowedAudience": ["api.example.com"]
       }
     }'
   ```

   The project configuration has no interceptor field, so declare the interceptor in `agentcore/cdk/lib/cdk-stack.ts`. Add `aws_bedrockagentcore` and `aws_lambda` to the `aws-cdk-lib` import:

   ```
   import { Stack, type StackProps, aws_bedrockagentcore as bedrockagentcore, aws_lambda as lambda } from 'aws-cdk-lib';
   ```

   Then add the interceptor after the line that creates the `AgentCoreApplication`:

   ```
   const interceptor = lambda.Function.fromFunctionArn(
     this, 'Interceptor',
     'arn:aws:lambda:us-west-2:123456789012:function:my-interceptor-lambda',
   );
   this.application.gateway('my-gateway').resource.addInterceptor(
     bedrockagentcore.LambdaInterceptor.forRequest(interceptor),
   );
   ```

   The interceptor grants the gateway service role `lambda:InvokeFunction` on the function. Deploy the project:

   ```
   agentcore deploy
   ```

1. From your AgentCore project directory, run `agentcore add gateway`.

1. Enter the gateway name and press **Enter**.

1. Select **CUSTOM\_JWT**. Enter the discovery URL and the allowed client IDs, separated by commas, when prompted.

1. Choose whether to turn on semantic search and press **Enter**.

1. Review the configuration and press **Enter** to add the gateway to `agentcore.json`.

1. Press **Ctrl\+C** to exit the TUI, then declare the interceptor in `agentcore/cdk/lib/cdk-stack.ts` as shown in the AgentCore CLI tab.

1. Run `agentcore deploy` to provision the gateway with the interceptor.

1. Run the following code in a terminal to create a gateway with interceptor configurations using the AWS CLI:

   ```
   aws bedrock-agentcore-control create-gateway \
     --name my-gateway \
     --role-arn arn:aws:iam::123456789012:role/my-gateway-service-role \
     --protocol-type MCP \
     --authorizer-type CUSTOM_JWT \
     --authorizer-configuration '{
       "customJWTAuthorizer": {
         "discoveryUrl": "https://cognito-idp.us-west-2.amazonaws.com/some-user-pool/.well-known/openid-configuration",
         "allowedClients": ["clientId"]
       }
     }' \
     --interceptor-configurations '[{
         "interceptor": {
             "lambda": {
               "arn":"arn:aws:lambda:us-west-2:123456789012:function:my-interceptor-lambda"
             }
         },
         "interceptionPoints": ["REQUEST"]
     }]'
   ```

   The `gatewayUrl` in the response is the endpoint to use when you invoke the gateway.

1. The following Python code shows how to create a gateway with interceptor configurations using the AWS Python SDK (Boto3):

   ```
   import boto3
   
   # Initialize the AgentCore client
   client = boto3.client('bedrock-agentcore-control')
   
   # Create a gateway
   gateway = client.create_gateway(
     name="my-gateway",
     roleArn="arn:aws:iam::123456789012:role/my-gateway-service-role",
     protocolType="MCP",
     authorizerType="CUSTOM_JWT",
     authorizerConfiguration={
         "customJWTAuthorizer": {
             "discoveryUrl": "https://cognito-idp.us-west-2.amazonaws.com/some-user-pool/.well-known/openid-configuration",
             "allowedClients": ["clientId"]
         }
     },
     interceptorConfigurations=[{
         "interceptor": {
             "lambda": {
               "arn":"arn:aws:lambda:us-west-2:123456789012:function:my-interceptor-lambda"
             }
         },
         "interceptionPoints": ["REQUEST"]
     }]
   )
   
   print(f"MCP Endpoint: {gateway['gatewayUrl']}")
   ```

## Create a gateway with a policy engine configuration
<a name="gateway-create-ex-policy-engine"></a>

You can create a gateway with a policy engine configuration. A policy engine is a collection of policies that evaluates and authorizes agent tool calls. When associated with a gateway, the policy engine intercepts all agent requests and determines whether to allow or deny each action based on the defined policies. The enforcement `mode` specifies whether to test policies ( `LOG_ONLY` ) or enforce them ( `ENFORCE` ).

**Example**  

1. First, add a policy engine to your project. Then, create a gateway that references the policy engine:

   ```
   agentcore add policy-engine \
     --name MyPolicyEngine
   
   agentcore add gateway \
     --name MyGateway \
     --authorizer-type CUSTOM_JWT \
     --authorizer-configuration '{
       "customJwtAuthorizer": {
         "discoveryUrl": "https://cognito-idp.us-west-2.amazonaws.com/pool-id/.well-known/openid-configuration",
         "allowedClients": ["clientId"]
       }
     }' \
     --policy-engine-name MyPolicyEngine \
     --policy-engine-mode log-only
   
   agentcore deploy
   ```

   To enforce policies instead of only logging decisions, change `--policy-engine-mode` to `enforce`.

1. Run the following command to create a gateway with a policy engine configuration using the AWS CLI:

   ```
   aws bedrock-agentcore-control create-gateway \
     --name my-gateway \
     --role-arn arn:aws:iam::123456789012:role/my-gateway-service-role \
     --protocol-type MCP \
     --authorizer-type CUSTOM_JWT \
     --authorizer-configuration '{
       "customJWTAuthorizer": {
         "discoveryUrl": "https://cognito-idp.us-west-2.amazonaws.com/pool-id/.well-known/openid-configuration",
         "allowedClients": ["clientId"]
       }
     }' \
     --policy-engine-configuration '{
       "arn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:policy-engine/policy-id",
       "mode": "LOG_ONLY"
     }' \
     --exception-level DEBUG
   ```

   The `gatewayUrl` in the response is the endpoint to use when you invoke the gateway.