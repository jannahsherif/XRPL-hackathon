

# Build your first authenticated agent
<a name="identity-getting-started-cognito"></a>

This getting started tutorial walks you through building a complete authenticated agent from the ground up using Amazon Bedrock AgentCore Identity and will help you get started with implementing identity features in your agent applications. You’ll learn how to set up your development environment, create authentication infrastructure with Cognito, deploy your agent to AgentCore Runtime, and test the full authentication workflow.

By the end of this tutorial, you’ll have a fully deployed agent that can authenticate users through OAuth2 flows, obtain access tokens securely, and demonstrate the complete identity management lifecycle. Your agent will be running on AgentCore Runtime with proper IAM permissions, creating a test lab environment where you can demonstrate and test the integration capabilities.

**Topics**
+ [Prerequisites](#identity-quick-start-prerequisites)
+ [Step 1: Create a Cognito user pool (Optional)](#identity-quick-start-cognito)
+ [Step 2: Create a credential provider](#identity-quick-start-credential-provider)
+ [Step 2.5: Add the callback URL to your OAuth 2.0 authorization server](#identity-update-credential-provider)
+ [Step 3: Create a sample agent that initiates an OAuth 2.0 flow](#identity-quick-start-agent)
+ [Step 4: Deploy the agent to AgentCore Runtime](#identity-quick-start-deploy)
+ [Step 5: Invoke the agent](#identity-quick-start-invoke)
+ [Clean up](#identity-quick-start-cleanup)
+ [Security best practices](#identity-quick-start-security)

## Prerequisites
<a name="identity-quick-start-prerequisites"></a>

Before you begin, ensure you have:
+ An AWS account with appropriate permissions
+ Python 3.10\+ installed
+  [Uv](https://docs.astral.sh/uv/getting-started/installation/) installed
+ The latest AWS CLI and `jq` installed
+ Node.js 20\+ installed (for the AgentCore CLI)
+  AWS credentials and region configured ( `aws configure` )

This tutorial requires that you have an OAuth 2.0 authorization server. If you do not have one, Step 1 will create one for you using Amazon Cognito user pools. If you have an OAuth 2.0 authorization server with a client id, client secret, and a user configured, you may proceed to step 2. This authorization server will act as a resource credential provider, representing the authority that grants the agent an outbound OAuth 2.0 access token.

### Install the SDK and dependencies
<a name="identity-quick-start-install"></a>

Make a folder for this guide, create a Python virtual environment, and install the AgentCore SDK and the AWS Python SDK (boto3).

```
mkdir agentcore-identity-quickstart
cd agentcore-identity-quickstart
python3 -m venv .venv
source .venv/bin/activate
pip install bedrock-agentcore boto3 strands-agents pyjwt
```

## Step 1: Create a Cognito user pool (Optional)
<a name="identity-quick-start-cognito"></a>

This tutorial requires an OAuth 2.0 authorization server. If you do not have one available for testing, or if you want to keep your test separate from your authorization server, this script will use your AWS credentials to set up an Amazon Cognito instance for you to use as an authorization server. The script will create:
+ A Cognito user pool
+ An OAuth 2.0 client, and client secret for that user pool
+ A test user and password in that Cognito user pool

Deleting the Cognito user pool AgentCoreIdentityQuickStartPool will delete the associated client\_id and user as well.

You may choose to save this script as create\_cognito.sh and execute it from your command line, or paste the script into your command line.

```
#!/bin/bash

REGION=$(aws configure get region)

# Create user pool
USER_POOL_ID=$(aws cognito-idp create-user-pool \
  --pool-name AgentCoreIdentityQuickStartPool \
  --query 'UserPool.Id' \
  --no-cli-pager \
  --output text)

# Create user pool domain
DOMAIN_NAME="agentcore-quickstart-$(LC_ALL=C tr -dc 'a-z0-9' < /dev/urandom | head -c 5)"
aws cognito-idp create-user-pool-domain \
  --domain $DOMAIN_NAME \
  --no-cli-pager \
  --user-pool-id $USER_POOL_ID > /dev/null

# Create user pool client with secret and hosted UI settings
CLIENT_RESPONSE=$(aws cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name AgentCoreQuickStart \
  --generate-secret \
  --allowed-o-auth-flows "code" \
  --allowed-o-auth-scopes "openid" "profile" "email" \
  --allowed-o-auth-flows-user-pool-client \
  --supported-identity-providers "COGNITO" \
  --query 'UserPoolClient.{ClientId:ClientId,ClientSecret:ClientSecret}' \
  --output json)

CLIENT_ID=$(echo $CLIENT_RESPONSE | jq -r '.ClientId')
CLIENT_SECRET=$(echo $CLIENT_RESPONSE | jq -r '.ClientSecret')

# Generate random username and password
USERNAME="AgentCoreTestUser$(printf "%04d" $((RANDOM % 10000)))"
PASSWORD="$(LC_ALL=C tr -dc 'A-Za-z0-9!@#$%^&*()_+-=[]{}|;:,.<>?' < /dev/urandom | head -c 16)$(LC_ALL=C tr -dc '0-9' < /dev/urandom | head -c 1)"

# Create user with permanent password
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username $USERNAME \
  --output text > /dev/null

aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username $USERNAME \
  --password $PASSWORD \
  --output text > /dev/null \
  --permanent

# Get region

ISSUER_URL="https://cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID/.well-known/openid-configuration"
HOSTED_UI_URL="https://$DOMAIN_NAME.auth.$REGION.amazoncognito.com"

# Output results
echo "User Pool ID: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
echo "Client Secret: $CLIENT_SECRET"
echo "Issuer URL: $ISSUER_URL"
echo "Hosted UI URL: $HOSTED_UI_URL"
echo "Test User: $USERNAME"
echo "Test Password: $PASSWORD"

echo ""
echo "# Copy and paste these exports to set environment variables for later use:"
echo "export USER_POOL_ID='$USER_POOL_ID'"
echo "export CLIENT_ID='$CLIENT_ID'"
echo "export CLIENT_SECRET='$CLIENT_SECRET'"
echo "export ISSUER_URL='$ISSUER_URL'"
echo "export HOSTED_UI_URL='$HOSTED_UI_URL'"
echo "export COGNITO_USERNAME='$USERNAME'"
echo "export COGNITO_PASSWORD='$PASSWORD'"
```

## Step 2: Create a credential provider
<a name="identity-quick-start-credential-provider"></a>

Credential providers are how your agent accesses external services. Create a credential provider and configure it with an OAuth 2.0 client for your authorization server.

If you are using your own authorization server, set the environment variables `ISSUER_URL` , `CLIENT_ID` , and `CLIENT_SECRET` with their appropriate values from your authorization server. If you are using the previous script to create an authorization server for you with Cognito, copy the EXPORT statements from the output into your terminal to set the environment variables.

This credential provider will be used by your agent’s code to get access tokens to act on behalf of your user.

**Example**  

1. Create the credential provider directly. The command returns the callback URL that you need in the next step. The AgentCore CLI accepts secrets from a file or standard input, not as inline arguments.

   ```
   OAUTH2_CALLBACK_URL=$(printf '%s' "$CLIENT_SECRET" | agentcore identity oauth2-credential-provider create \
     --name AgentCoreIdentityQuickStartProvider \
     --vendor CustomOauth2 \
     --discovery-url "$ISSUER_URL" \
     --client-id "$CLIENT_ID" \
     --client-secret - \
     | jq -r '.callbackUrl')
   
   echo "OAuth2 Callback URL: $OAUTH2_CALLBACK_URL"
   ```

1. 

   ```
   #!/bin/bash
   # ISSUER_URL must be the full URL, including .well-known/openid-configuration
   OAUTH2_CREDENTIAL_PROVIDER_RESPONSE=$(aws bedrock-agentcore-control create-oauth2-credential-provider \
     --name "AgentCoreIdentityQuickStartProvider" \
     --credential-provider-vendor "CustomOauth2" \
     --oauth2-provider-config-input '{
       "customOauth2ProviderConfig": {
         "oauthDiscovery": {
           "discoveryUrl": "'$ISSUER_URL'"
         },
         "clientId": "'$CLIENT_ID'",
         "clientSecret": "'$CLIENT_SECRET'"
       }
     }' \
     --output json)
   
   OAUTH2_CALLBACK_URL=$(echo $OAUTH2_CREDENTIAL_PROVIDER_RESPONSE | jq -r '.callbackUrl')
   
   echo "OAuth2 Callback URL: $OAUTH2_CALLBACK_URL"
   ```

## Step 2.5: Add the callback URL to your OAuth 2.0 authorization server
<a name="identity-update-credential-provider"></a>

To prevent unauthorized redirects, add the callback URL retrieved from [CreateOauth2CredentialProvider](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreateOauth2CredentialProvider.html) or [GetOauth2CredentialProvider](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_GetOauth2CredentialProvider.html) to your OAuth 2.0 authorization server.

If you are using the previous script to create an authorization server with Cognito, copy the EXPORT statements from the output into your terminal to set the environment variables and update the Cognito user pool client with the OAuth2 credential provider callback URL.

```
#!/bin/bash
aws cognito-idp update-user-pool-client \
    --user-pool-id $USER_POOL_ID \
    --client-id $CLIENT_ID \
    --client-name AgentCoreQuickStart \
    --allowed-o-auth-flows "code" \
    --allowed-o-auth-scopes "openid" "profile" "email" \
    --allowed-o-auth-flows-user-pool-client \
    --supported-identity-providers "COGNITO" \
    --callback-urls "$OAUTH2_CALLBACK_URL"
```

## Step 3: Create a sample agent that initiates an OAuth 2.0 flow
<a name="identity-quick-start-agent"></a>

In this step, we will create an agent that initiates an OAuth 2.0 authorization flow to get tokens to act on behalf of the user. For simplicity, the agent will not make actual calls to external services on behalf of a user, but will prove to us that it has obtained consent to act on behalf of our test user.

### Agent code
<a name="identity-quick-start-agent-code"></a>

Create a file named `agentcoreidentityquickstart.py` , and save this code.

The `callback_url` passed to `requires_access_token` is the URL in your application that completes the session-binding flow. For local testing, this tutorial uses the callback server that you create after the agent code. Set its URL:

```
export SESSION_BINDING_CALLBACK_URL="http://localhost:8081/oauth2/callback"
```

For production, use your application’s HTTPS callback endpoint instead.

```
"""
AgentCore Identity Outbound Token Agent

This agent demonstrates the USER_FEDERATION OAuth 2.0 flow.

It handles the OAuth 2.0 user consent flow and inspects the resulting OAuth 2.0 access token.
"""

from bedrock_agentcore.runtime import BedrockAgentCoreApp
from bedrock_agentcore.identity import requires_access_token
import asyncio
import jwt
import logging
import os

app = BedrockAgentCoreApp()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def decode_jwt(token):
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded
    except Exception as e:
        return {"error": f"Error decoding JWT: {str(e)}"}

class StreamingQueue:
    def __init__(self):
        self.finished = False
        self.queue = asyncio.Queue()

    async def put(self, item):
        await self.queue.put(item)

    async def finish(self):
        self.finished = True
        await self.queue.put(None)

    async def stream(self):
        while True:
            item = await self.queue.get()
            if item is None and self.finished:
                break
            yield item

queue = StreamingQueue()

async def handle_auth_url(url):
    await queue.put(f"Authorization URL, please copy to your preferred browser: {url}")

@requires_access_token(
    provider_name="AgentCoreIdentityQuickStartProvider",
    scopes=["openid"],
    auth_flow="USER_FEDERATION",
    on_auth_url=handle_auth_url, # streams authorization URL to client
    force_authentication=True,
    callback_url=os.environ["SESSION_BINDING_CALLBACK_URL"],
)
async def introspect_with_decorator(*, access_token: str):
    """Introspect token using decorator"""
    logger.info("Inside introspect_with_decorator - decorator succeeded")
    await queue.put({
        "message": "Successfully received an access token to act on behalf of your user!",
        "token_claims": decode_jwt(access_token),
        "token_length": len(access_token),
        "token_preview": f"{access_token[:50]}...{access_token[-10:]}"
    })
    await queue.finish()

@app.entrypoint
async def agent_invocation(payload, context):
    """Handler that uses only the decorator approach"""
    logger.info("Agent invocation started")

    # Start the agent task and immediately begin streaming
    task = asyncio.create_task(introspect_with_decorator())

    # Stream items as they come in
    async for item in queue.stream():
        yield item

    # Wait for task completion
    await task

if __name__ == "__main__":
    app.run()
```

### Local callback server
<a name="identity-quick-start-callback-server"></a>

After the user signs in, AgentCore Identity redirects the browser to `SESSION_BINDING_CALLBACK_URL` with a `session_id` query parameter. The callback server then calls `CompleteResourceTokenAuth` with the same user ID that the agent invocation used. Step 5 invokes the agent with `--user-id SampleUserID`, so this server completes the flow for that user ID. It uses your AWS credentials, which need permission for `bedrock-agentcore:CompleteResourceTokenAuth`.

Create a file named `oauth2_callback_server.py` in the `agentcore-identity-quickstart` folder, and save this code:

```
"""
Local OAuth 2.0 callback server for the AgentCore Identity quick start.

It completes session binding for the user ID that Step 5 passes with --user-id.
"""

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

import boto3
from bedrock_agentcore.services.identity import IdentityClient, UserIdIdentifier

USER_ID = "SampleUserID"
identity_client = IdentityClient(region=boto3.Session().region_name)


class CallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = urlparse(self.path)
        session_id = parse_qs(url.query).get("session_id", [""])[0]
        if url.path != "/oauth2/callback" or not session_id:
            self.send_error(400, "Expected /oauth2/callback?session_id=...")
            return
        try:
            identity_client.complete_resource_token_auth(
                session_uri=session_id,
                user_identifier=UserIdIdentifier(user_id=USER_ID),
            )
        except Exception as error:
            self.send_error(500, f"CompleteResourceTokenAuth failed: {error}")
            return
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Authorization complete. You can close this window.")


HTTPServer(("127.0.0.1", 8081), CallbackHandler).serve_forever()
```

**Important**  
This server completes every request for the fixed `SampleUserID`. Use it only for local testing. In production, your callback must confirm that the signed-in user of your application is the user who started the flow before it calls `CompleteResourceTokenAuth`. For more information, see [OAuth 2.0 authorization URL session binding](oauth2-authorization-url-session-binding.md).

## Step 4: Deploy the agent to AgentCore Runtime
<a name="identity-quick-start-deploy"></a>

Use the AgentCore CLI to host this agent on AgentCore Runtime.

The AgentCore CLI creates the agent’s execution role during deployment. The credential provider from Step 2 is not part of the project, so the role doesn’t include permissions to get its OAuth 2.0 tokens. The `--additional-policies` option attaches a policy document to the role. A relative path is resolved from the Runtime’s code directory, `app/IdentityAgent`.

From your terminal, install the AgentCore CLI, create an empty project, and register a Python HTTP Runtime:

```
npm install -g @aws/agentcore
agentcore create --name IdentityQuickstart --template empty
cd IdentityQuickstart
agentcore add runtime \
  --name IdentityAgent \
  --language python \
  --protocol HTTP \
  --environment-variables \
  "{\"SESSION_BINDING_CALLBACK_URL\":\"$SESSION_BINDING_CALLBACK_URL\"}" \
  --additional-policies agentcore-identity-policy.json
```

Copy your agent script into the Runtime directory as its entrypoint:

```
cp ../agentcoreidentityquickstart.py app/IdentityAgent/main.py
```

Initialize the Python project and add the Runtime dependencies:

```
cd app/IdentityAgent
uv init --bare
uv add \
  "aws-opentelemetry-distro~=0.21.0" \
  "bedrock-agentcore>=1.18.1,<2" \
  pyjwt
cd ../..
```

### Create the policy for token vault and client secret access
<a name="identity-quick-start-iam-policy"></a>

Create the policy document that allows the agent to get tokens from the token vault and read the client secret. This script gets your account and Region from the AWS CLI:

```
#!/bin/bash

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)

cat > app/IdentityAgent/agentcore-identity-policy.json << EOF
{
"Version": "2012-10-17",		 	 	 
  "Statement": [
    {
      "Sid": "AccessTokenVault",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:GetResourceOauth2Token",
        "secretsmanager:GetSecretValue"
      ],
      "Resource": ["arn:aws:bedrock-agentcore:$REGION:$AWS_ACCOUNT:workload-identity-directory/default/workload-identity/*",
        "arn:aws:bedrock-agentcore:$REGION:$AWS_ACCOUNT:token-vault/default/oauth2credentialprovider/AgentCoreIdentityQuickStartProvider",
        "arn:aws:bedrock-agentcore:$REGION:$AWS_ACCOUNT:workload-identity-directory/default",
        "arn:aws:bedrock-agentcore:$REGION:$AWS_ACCOUNT:token-vault/default",
        "arn:aws:secretsmanager:$REGION:$AWS_ACCOUNT:secret:bedrock-agentcore-identity!default/oauth2/AgentCoreIdentityQuickStartProvider*"
      ]
    }
  ]
}
EOF
```

### Deploy the project
<a name="identity-quick-start-deploy-project"></a>

```
agentcore deploy
```

The CLI synthesizes a AWS CDK stack and deploys your agent to AgentCore Runtime with the policy attached to its execution role. This takes approximately 2–3 minutes.

### Register the callback URL on the agent’s workload identity
<a name="identity-quick-start-register-callback"></a>

AgentCore Identity redirects only to return URLs that are registered on the agent’s workload identity. AgentCore Runtime creates this workload identity when you deploy the agent. Register `SESSION_BINDING_CALLBACK_URL` on it. Your AWS credentials need permission for `bedrock-agentcore:UpdateWorkloadIdentity`:

```
RUNTIME_ARN=$(agentcore status --json \
  | jq -r '.resources[] | select(.resourceType == "runtime" and .name == "IdentityAgent") | .arn')

WORKLOAD_IDENTITY_NAME=$(aws bedrock-agentcore-control get-agent-runtime \
  --agent-runtime-id "${RUNTIME_ARN##*/}" \
  --query workloadIdentityDetails.workloadIdentityArn \
  --output text | awk -F'/' '{print $NF}')

aws bedrock-agentcore-control update-workload-identity \
  --name "$WORKLOAD_IDENTITY_NAME" \
  --allowed-resource-oauth2-return-urls "$SESSION_BINDING_CALLBACK_URL"
```

## Step 5: Invoke the agent
<a name="identity-quick-start-invoke"></a>

In a separate terminal, start the callback server from the `agentcore-identity-quickstart` folder:

```
source .venv/bin/activate
python oauth2_callback_server.py
```

Invoke the agent with your IAM credentials. Pass `--user-id` and `--session-id` when using IAM authentication.

```
agentcore invoke --runtime IdentityAgent \
  --payload '"TestPayload"' \
  --user-id "SampleUserID" \
  --session-id "ALongThirtyThreeCharacterMinimumSessionIdYouCanChangeThisAsYouNeed"
```

The agent returns an authorization URL. Open the URL in a browser. The browser opens your authorization server’s sign-in page. The `--user-id` parameter is the user ID you are presenting to AgentCore Identity. The `--session-id` parameter is the session ID, which must be at least 33 characters long.

**Important**  
The `--user-id` parameter uses the `GetWorkloadAccessTokenForUserId` API path, which treats the userId as an opaque string without verifying it against an authenticated end-user identity. This is appropriate for quickstart and development scenarios where you don’t have an IdP token available. For production deployments where you have a JWT identifying the end user, use the JWT-based authentication path (`GetWorkloadAccessTokenForJWT`) instead, which validates the token’s issuer, signature, and expiry. For more information, see [Get workload access token](get-workload-access-token.md).

Enter the username and password for your user on your authorization server when prompted on your browser, or use your preferred authentication method you have configured. If you used the script from Step 1 to create a Cognito instance, you can retrieve this from your terminal history.

Your browser then redirects to the local callback server, which completes the [session binding flow](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/oauth2-authorization-url-session-binding.html) and shows `Authorization complete`. The agent then receives the access token and returns its claims.

**Note**  
If you interrupt an invocation without completing authorization, you may need to request a new URL using a new session ID ( `--session-id` parameter).

### Debugging
<a name="identity-quick-start-debugging"></a>

If you see errors, stream the Runtime’s CloudWatch logs:

```
agentcore logs runtime --name IdentityAgent --tail
```

## Clean up
<a name="identity-quick-start-cleanup"></a>

After you’re done, run `agentcore remove all --yes` and then `agentcore deploy --yes` from your project directory to tear down the deployed project resources. Delete the OAuth credential provider with `agentcore identity oauth2-credential-provider delete --name AgentCoreIdentityQuickStartProvider`. Then delete the Amazon Cognito user pool.

## Security best practices
<a name="identity-quick-start-security"></a>

When working with identity information:

1.  **Never hardcode credentials** in your agent code

1.  **Use AWS Secrets Manager or AgentCore Identity credential providers** for sensitive information

1.  **Apply least privilege principle** when configuring IAM permissions

1.  **Regularly rotate credentials** for external services

1.  **Audit access logs** to monitor agent activity

1.  **Implement proper error handling** for authentication failures