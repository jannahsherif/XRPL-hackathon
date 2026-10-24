

# Update existing gateway with Policy Engine
<a name="update-gateway-with-policy"></a>

Associate a policy engine with an existing gateway:

**Example**  

1. In an AgentCore project that already contains the gateway, attach the engine to it:

   ```
   agentcore add policy-engine --name my_policy_engine \
     --attach-to-gateways my-gateway \
     --attach-mode enforce
   ```

1. Deploy to apply the change:

   ```
   agentcore deploy
   ```

   The CLI issues the `UpdateGateway` call for you and preserves the gateway’s other settings. To change only the mode on an already-attached engine, set `mode` to `LOG_ONLY` or `ENFORCE` in the gateway’s `policyEngineConfiguration` in `agentcore/agentcore.json`, and deploy again.

1. Run the following code in a terminal to update a gateway with a Policy Engine using the AWS CLI:

   ```
   aws bedrock-agentcore-control update-gateway \
     --gateway-identifier my-gateway-id \
     --name my-gateway-name \
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

1. The following Python code shows how to update a gateway with a Policy Engine using the AWS Python SDK (Boto3):

   ```
   import boto3
   
   gateway_client = boto3.client('bedrock-agentcore-control')
   
   response = gateway_client.update_gateway(
       gatewayIdentifier='my-gateway-id',
       name='my-gateway-name',
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