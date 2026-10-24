

# Create gateway with Policy Engine
<a name="create-gateway-with-policy"></a>

This section provides examples of creating a gateway with a policy engine associated for policy enforcement.

**Note**  
Use the values for the authorization configuration that you specified when you set up inbound authorization. For a JWT authorizer, use the discovery URL of your identity provider and the client IDs you allow. For how these are chosen, see [Set up inbound authorization for your gateway](gateway-inbound-auth.md).
Where you specify an explicit gateway service role ARN, it must be a role you have already created. For more information, see [Set up permissions for AgentCore Gateway](gateway-prerequisites-permissions.md).

Select one of the following methods:

**Example**  

1. In an AgentCore project, add the policy engine:

   ```
   agentcore add policy-engine --name my_policy_engine
   ```

1. Add a gateway and name the policy engine it should enforce:

   ```
   agentcore add gateway --name my-gateway \
     --protocol-type MCP \
     --authorizer-type CUSTOM_JWT \
     --discovery-url https://cognito-idp.us-west-2.amazonaws.com/some-user-pool/.well-known/openid-configuration \
     --allowed-clients clientId \
     --policy-engine my_policy_engine \
     --policy-engine-mode ENFORCE
   ```

1. Deploy to create both resources in your account:

   ```
   agentcore deploy
   ```

   Add the policy engine to the project with `agentcore add policy-engine` before you run `agentcore add gateway`. The CLI resolves the engine ARN. Run `agentcore status` after deploying to read the gateway ARN.

1. Run the following code in a terminal to create a gateway with a Policy Engine using the AWS CLI:

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
     --policy-engine-configuration '{
       "mode": "ENFORCE",
       "arn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:policy-engine/my_policy_engine-a1b2c3d4e5"
     }'
   ```

   The `gatewayUrl` in the response is the endpoint to use when you invoke the gateway.

1. The following Python code shows how to create a gateway with a Policy Engine using the AWS Python SDK (Boto3):

   ```
   import boto3
   
   gateway_client = boto3.client('bedrock-agentcore-control')
   
   response = gateway_client.create_gateway(
       name='my-gateway',
       protocolType='MCP',
       authorizerType='CUSTOM_JWT',
       authorizerConfiguration={
           'customJWTAuthorizer': {
               'allowedClients': ['clientId'],
               'discoveryUrl': 'https://cognito-idp.us-west-2.amazonaws.com/some-user-pool/.well-known/openid-configuration'
           }
       },
       roleArn='arn:aws:iam::123456789012:role/my-gateway-service-role',
       policyEngineConfiguration={
           'mode': 'ENFORCE',
           'arn': 'arn:aws:bedrock-agentcore:us-west-2:123456789012:policy-engine/my_policy_engine-a1b2c3d4e5'
       }
   )
   print(f"GATEWAY ARN: {response['gatewayArn']}")
   print(f"GATEWAY URL: {response['gatewayUrl']}")
   ```

   The `gatewayUrl` in the response is the endpoint to use when you invoke the gateway.