

# Create a Payment Manager and Connector
<a name="payments-create-manager"></a>

A Payment Manager is the top-level resource that coordinates payment operations for your AWS account. When you create a Payment Manager, you specify an authorizer type and an IAM role, and the service provisions a corresponding workload identity in AgentCore Identity.

This guide walks you through creating a Payment Manager and attaching a Payment Connector with the console, the AgentCore CLI, the AgentCore SDK, the AWS CLI, or the AWS SDK. For the complete request and response schemas, see [CreatePaymentManager](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreatePaymentManager.html) and [CreatePaymentConnector](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreatePaymentConnector.html) in the API Reference.

**Tip**  
You can automate the steps on this page with the AgentCore Payments skill in the AWS agent toolkit. The skill is part of the **aws-agents** plugin and lets an AI coding agent create your Payment Manager, connector, and credential provider with the AgentCore CLI, create a payment instrument and session using the AgentCore SDK, and add a process payment tool to your agent. For details, see the [quickstart](payments-getting-started.md) and the [AWS agent toolkit on GitHub](https://github.com/aws/agent-toolkit-for-aws/tree/main).

Before you begin, ensure you have:
+ Completed the [Prerequisites](payments-prerequisites.md) (account, credentials, provider keys).
+ Set up the required [IAM roles](payments-iam-roles.md) (administrator role and service role).

**Important**  
To create a Coinbase payment connector, your account must have an active AWS Marketplace subscription to the [Coinbase Wallets for AgentCore Payments](https://aws.amazon.com/marketplace/pp/prodview-ia2zd5puqyi7g) listing. With this subscription, your Coinbase wallet usage charges are consolidated into your monthly AWS bill based on Coinbase’s [pricing](https://docs.cdp.coinbase.com/wallets/pricing) on the Coinbase website. There are no additional charges or obligations for the subscription. If the subscription is missing, `CreatePaymentConnector` fails with a `SubscriptionRequiredException` (HTTP 403). This requirement applies only to Coinbase; other providers, such as Stripe (Privy), are not affected. For more information, see [Subscribe to Coinbase Wallets for AgentCore Payments in AWS Marketplace](payments-marketplace-subscription.md).

## Create a Payment Manager
<a name="payments-create-manager-create"></a>

**Example**  
<a name="payments-setup-pm-console-step1"></a> **Step 1: Open the Payments page**   

1. Open the [Amazon Bedrock AgentCore console](https://console.aws.amazon.com/bedrock-agentcore/).

1. In the navigation pane, under **Build**, choose **Payments**.

1. In the **Payment Managers** section, choose **Create Payment Manager**.
<a name="payments-setup-pm-console-step2"></a> **Step 2: Configure Payment Manager details**   

1. For **Name**, enter a name for your Payment Manager. The name must start with a letter. Valid characters are `a–z`, `A–Z`, `0–9`. The name can have up to 48 characters.

1. (Optional) Choose **Description** to expand the section, and then enter a description to help identify this Payment Manager.
<a name="payments-setup-pm-console-step3"></a> **Step 3: Configure permissions**   
The **Permissions** section specifies the permissions for this Payment Manager and the AWS resources that the payment can access.  
For **IAM Permissions**, choose one of the following options:  
+  **Create and use a new service role** — Amazon Bedrock AgentCore payments creates a new service role on your behalf. A default service role name is generated automatically. For more information, see [Service role permissions](payments-iam-roles.md#payments-iam-service-role).
+  **Use an existing service role** — Use a service role that you have already created. If you choose this option, select a role from the dropdown list.
<a name="payments-setup-pm-console-step4"></a> **Step 4: Configure inbound authorization**   
Inbound authorization controls who can access this Payment Manager. In the **Inbound Auth** section, for **Inbound Auth type**, choose one of the following options:  
 **To use IAM authorization:**   

1. Choose **Use IAM username**. This uses the IAM username that you used to sign in to the AWS console.
 **To use JWT authorization with Amazon Cognito:**   

1. Choose **Use JSON Web Tokens (JWT)**.

1. For **JWT schema configuration**, choose **Quick create configurations with Cognito - recommended**. Amazon Bedrock AgentCore payments creates the inbound authorization configurations on your behalf using Amazon Cognito as the identity provider. No additional configuration is required.
 **To use JWT authorization with an existing identity provider:**   

1. Choose **Use JSON Web Tokens (JWT)**.

1. For **JWT schema configuration**, choose **Use existing Identity provider configurations**. This option lets you bring existing inbound authorization configurations from any identity provider to enable OAuth 2.0.

1. For **Discovery URL**, enter the discovery URL from your identity provider (for example, Okta or Cognito), typically found in that provider’s documentation. This allows your agent or tool to fetch login, downstream resource token, and verification settings. For example, `https://accounts.cognito.com/.well-known/openid-configuration`.

1. For **Allowed audiences**, enter client IDs that are registered with identity providers or any arbitrary string in the JWT audience claim that the authorizer must verify. Choose **\+ Add audience** to add additional audiences.

1. For **Allowed clients**, enter client IDs that are registered with identity providers or any arbitrary string in the JWT audience claim that the authorizer must verify. Choose **\+ Add client** to add additional clients.

1. For **Allowed scopes**, enter the required scopes. Access is allowed only if the token contains at least one of the required scopes configured here. Choose **\+ Add scope** to add additional scopes.

1. (Optional) For **Custom claims**, define rules that match specific claims in the incoming token against predefined values. For each rule, specify the claim **Name**, **String type**, **Operator**, and **Value**. Choose **\+ Add claim** to add additional claims.
<a name="payments-setup-pm-console-step5"></a> **Step 5: Add a payment connector (optional)**   
Payment connectors store the credentials and configuration needed to connect with payment service providers. Adding a connector during creation is optional, but a connector is required for the service to process payments.  

1. In the **Payment connector: New Connector** section, for **Name**, enter a name for the connector. Valid characters are `a–z`, `A–Z`, `0–9`, and `_` (underscore). The name can have up to 48 characters.

1. (Optional) Choose **Description** to expand the section, and then enter a description for the connector.

1. In the **Payment auth** section, if you want to reuse a payment auth (payment credential provider) previously created in [AgentCore Identity](resource-providers.md#payment-credential-provider), select an existing payment auth from the dropdown; or choose **create a new one** to create a new payment auth. If you choose to create a new one, see **Create payment auth**.

1. (Optional) To add additional connectors, choose **\+ Add connector** and repeat the steps above.

1. (Optional) Decide how you will rotate this connector’s credentials. If you create the payment auth with Coinbase **Quick create**, the credentials are service-managed and you can rotate them on demand from the connector details page or with the `RotatePaymentConnectorCredentials` operation. If you provide your own credentials, you rotate them with the payment provider. For more information, see [Rotate service-managed connector credentials](payments-security-best-practices.md#payments-rotate-connector-credentials).
<a name="payments-setup-pm-console-outbound-auth"></a> **Create payment auth**   
When you choose **create a new one** in the connector’s **Payment auth** section, the **Create payment auth** panel opens. In this panel, you configure a new payment auth — a payment credential provider that is stored in AgentCore Identity.  

1. For **Payment auth name**, enter a name for the payment auth. Valid characters are `a–z`, `A–Z`, `0–9`, `_` (underscore), and `-` (hyphen).

1. For **Payment provider**, select a payment provider from the dropdown. The available providers are **Coinbase** and **Stripe (Privy)**.
If you choose **Coinbase**, choose how to provide the credentials for the payment auth:  
+  **Quick create configurations - recommended** — Quick create allows you to link to your Coinbase CDP account and let AgentCore payments create the credentials for you without leaving the AgentCore console. It opens a window to sign up or sign in to your Coinbase CDP account. The service then provisions the Coinbase CDP API key and Wallet secret and stores them as a payment auth on your behalf. You do not generate or paste any keys.
+  **Use existing configurations** — Provide Coinbase CDP credentials that you generated yourself in the [Coinbase Developer Platform](https://docs.cdp.coinbase.com/api-reference/v2/authentication#1-create-client-api-key).
 **Use Quick create**   
If you select **Quick create configurations - recommended**, AgentCore payments creates the payment auth for you after you authorize access through Coinbase. Complete the following steps:  

1. Select **Quick create configurations - recommended**.

1. Choose **Create payment auth**. A Coinbase window opens and displays **Coinbase connection in progress**.

1. In the Coinbase window, sign in or sign up with your email address and phone number, and then select or create a Coinbase CDP project.

1. Review the requested access, and then authorize AgentCore payments to create and manage credentials for your Coinbase CDP project.

1. When authorization finishes, the Coinbase window displays **Coinbase connected** and closes. AgentCore payments provisions the Coinbase CDP API key and Wallet secret. The service stores them securely in AWS Secrets Manager and creates the payment auth on your behalf.
Use Quick create with a Coinbase project that has no Wallet Secret. If the Coinbase project that you authorize already has a Wallet Secret, AgentCore payments stops without rotating it. Instead, select **Use existing configurations** and provide your credentials manually.
Because Quick create provisions the credentials for you, they are service-managed and you can replace them at any time without generating keys in Coinbase. For more information, see [Rotate service-managed connector credentials](payments-security-best-practices.md#payments-rotate-connector-credentials).  
 **Use existing configurations**   
If you select **Use existing configurations**, complete the following fields under **Payment provider configurations**, and then choose **Create payment auth**:  

1. For **API key ID**, enter the unique identifier for your Coinbase CDP account credentials.

1. For **API key secret**, enter the private key used to authenticate and sign requests to Coinbase CDP.

1. For **Wallet secret**, enter the asymmetric private key used to authenticate sensitive wallet write operations.
If you select **Coinbase** as the provider, your account must have an active AWS Marketplace subscription to the [Coinbase Wallets for AgentCore Payments](https://aws.amazon.com/marketplace/pp/prodview-ia2zd5puqyi7g) listing. This is a one-time subscription for an AWS account. With this subscription, your Coinbase wallet usage charges are consolidated into your monthly AWS bill based on Coinbase’s [pricing](https://docs.cdp.coinbase.com/wallets/pricing) on the Coinbase website. Otherwise, connector creation fails with a `SubscriptionRequiredException` (HTTP 403). If you are not subscribed, the console displays a **Subscribe to Coinbase to enable billing through AWS ** alert with a **Subscribe** button that you can use to subscribe without leaving the wizard. For more information, see [Subscribe to Coinbase Wallets for AgentCore Payments in AWS Marketplace](payments-marketplace-subscription.md).
If you choose **Stripe (Privy)**, complete the following fields under **Payment provider configurations**, and then choose **Create payment auth**:  

1. For **App ID**, enter the unique identifier for your Privy account credentials.

1. For **App secret**, enter the private key used to authenticate and sign requests to the Privy application.

1. For **Authorization ID**, enter the unique identifier for the authorization entity.

1. For **Authorization private key**, enter the private key used to sign authorization requests.
<a name="payments-setup-pm-console-step6"></a> **Step 6: Create the Payment Manager**   

1. Review your configuration, and then choose **Create Payment Manager**.
After you choose **Create Payment Manager**, the console navigates to the Payment Manager details page. A success banner confirms that the Payment Manager was created and provides the following next steps:  

1. Set up payment instrument and session, optionally specify the budget.

1. Integrate the Payment Manager into your agent framework.

1. Discover paid MCP tools and endpoints.

1. Enable log deliveries and traces to view metrics in the observability dashboard.
The Payment Manager details page includes sections for **Payment connectors**, **Integration code templates**, **Inbound Auth**, **Observability** metrics, and **Log deliveries and tracing** configuration.
The AgentCore CLI can declare a Payment Manager and add a connector from an AgentCore project.  
To use wizards, run `agentcore add payment-manager` in a terminal to open the payment manager wizard. Run `agentcore add credentials payment` to enter provider credentials in a wizard. Then run `agentcore add payment-connector` to add a Quick create connector or reuse a payment credential. Run `agentcore deploy` afterward.  
To use flags instead, first add the Payment Manager:  

```
agentcore add payment-manager \
  --name MyPaymentManager \
  --default-spend-limit 10.00
```
Then add a connector. Use Quick create for Coinbase, or add your own Coinbase or Stripe (Privy) credentials.  
 **Coinbase, Quick create (recommended):**   
Quick create provisions the Coinbase credential provider for you, so you do not pass any API keys:  

```
agentcore add payment-connector \
  --manager MyPaymentManager \
  --name CoinbaseConnector \
  --quick-create

agentcore deploy
```
 `agentcore deploy` prints `Authorize payment connector "<name>": <url>`. Open the URL in a browser and authorize through Coinbase. The service then provisions the credentials and the connector reaches `READY`.  
 **Coinbase, manual setup:**   
Add a payment credential with your Coinbase CDP keys, then add a connector that uses it. Pass each secret as a `file://` path or as `-` to read it from stdin. The CLI rejects inline secret values.  

```
agentcore add credentials payment \
  --name CoinbaseCreds \
  --provider CoinbaseCDP \
  --api-key-id <apiKeyId> \
  --api-key-secret file://cdp-api-key-secret.txt \
  --wallet-secret file://cdp-wallet-secret.txt

agentcore add payment-connector \
  --manager MyPaymentManager \
  --name CoinbaseConnector \
  --credential CoinbaseCreds

agentcore deploy
```
 **Stripe (Privy), manual setup:**   

```
agentcore add credentials payment \
  --name PrivyCreds \
  --provider StripePrivy \
  --app-id <appId> \
  --app-secret file://privy-app-secret.txt \
  --authorization-private-key file://privy-authorization-private-key.txt \
  --authorization-id <authorizationId>

agentcore add payment-connector \
  --manager MyPaymentManager \
  --name PrivyConnector \
  --credential PrivyCreds

agentcore deploy
```
The AgentCore SDK supports Coinbase **Quick create** (shown first) and manual provisioning. The manual examples that follow pass provider credentials directly. The IAM examples use the convenience method `create_payment_manager_with_connector`, which creates the Payment Manager, credential provider, and connector in a single call. This method does not accept an authorizer configuration, so the JWT examples create each resource separately.  
 **Coinbase, Quick create (recommended):**   
With Quick create, you create the connector with an empty `credential_provider_configurations` list and `provision_mode="QUICK_CREATE"`. The connector returns status `PENDING_AUTHENTICATION` and an authorization URL. After you authorize through Coinbase, the service provisions the credential provider and the connector reaches `READY`.  

```
import time
import webbrowser

from bedrock_agentcore.payments.client import PaymentClient

payment_client = PaymentClient(region_name="us-east-1")

connector = payment_client.create_payment_connector(
    payment_manager_id="<paymentManagerId>",
    name="CoinbaseConnector",
    connector_type="CoinbaseCDP",
    credential_provider_configurations=[],
    provision_mode="QUICK_CREATE",
)

# Authorize through Coinbase using the returned URL.
webbrowser.open(connector["authorizationUrl"])

# Terminal states that mean provisioning did not succeed.
TERMINAL_FAILURES = {
    "AUTHENTICATION_EXPIRED",
    "AUTHENTICATION_FAILED",
    "AWS_MARKETPLACE_SUBSCRIPTION_REQUIRED",
    "CREATE_FAILED",
}

# Poll until the connector reaches READY or fails.
while True:
    response = payment_client.get_payment_connector(
        payment_manager_id="<paymentManagerId>",
        payment_connector_id=connector["paymentConnectorId"],
    )
    status = response["status"]
    if status == "READY":
        break
    if status in TERMINAL_FAILURES:
        raise RuntimeError(f"Connector provisioning failed: {status}")
    time.sleep(5)
```
The authorization URL is valid for about 10 minutes. If it expires, the connector transitions to `AUTHENTICATION_EXPIRED` and you re-create it.  
 **Coinbase CDP with IAM authorization:**   

```
from bedrock_agentcore.payments.client import PaymentClient

payment_client = PaymentClient(region_name="us-east-1")

response = payment_client.create_payment_manager_with_connector(
    payment_manager_name="MyPaymentManager",
    payment_manager_description="Payment manager for my agent.",
    authorizer_type="AWS_IAM",
    role_arn="arn:aws:iam::123456789012:role/MyPaymentRole",
    payment_connector_config={
        "name": "CoinbaseConnector",
        "description": "Coinbase CDP connector",
        "payment_credential_provider_config": {
            "name": "MyCoinbaseProvider",
            "credential_provider_vendor": "CoinbaseCDP",
            "credentials": {
                "api_key_id": "your-api-key-id",
                "api_key_secret": "your-api-key-secret",
                "wallet_secret": "your-wallet-secret",
            },
        },
    },
    wait_for_ready=True,
    max_wait=300,
    poll_interval=5,
)

payment_manager = response.get("paymentManager", {})
payment_connector = response.get("paymentConnector", {})
credential_provider = response.get("credentialProvider", {})

payment_manager_arn = payment_manager.get("paymentManagerArn")
payment_connector_id = payment_connector.get("paymentConnectorId")

print(f"Payment Manager ARN: {payment_manager_arn}")
print(f"Connector ID: {payment_connector_id}")
```
 **Coinbase CDP with JWT authorization:**   

```
from bedrock_agentcore.payments.client import PaymentClient
from bedrock_agentcore.services.identity import IdentityClient

payment_client = PaymentClient(region_name="us-east-1")
identity_client = IdentityClient(region="us-east-1")

manager = payment_client.create_payment_manager(
    name="CoinbasePaymentManagerJWT",
    description="Coinbase Payment Manager (JWT auth)",
    authorizer_type="CUSTOM_JWT",
    role_arn="arn:aws:iam::123456789012:role/BedrockAgentCoreFullAccess",
    authorizer_configuration={
        "customJWTAuthorizer": {
            "discoveryUrl": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_EXAMPLE/.well-known/openid-configuration",
            "allowedClients": ["your-client-id"],
        }
    },
    wait_for_ready=True,
)

provider = identity_client.create_payment_credential_provider(
    name="my-coinbase-provider-jwt",
    credential_provider_vendor="CoinbaseCDP",
    provider_configuration_input={
        "coinbaseCdpConfiguration": {
            "apiKeyId": "your-api-key-id",
            "apiKeySecret": "your-api-key-secret",
            "walletSecret": "your-wallet-secret",
        }
    },
)

connector = payment_client.create_payment_connector(
    payment_manager_id=manager["paymentManagerId"],
    name="coinbase_connector_jwt",
    description="Coinbase Connector (JWT)",
    connector_type="CoinbaseCDP",
    credential_provider_configurations=[
        {"coinbaseCDP": {"credentialProviderArn": provider["credentialProviderArn"]}}
    ],
    wait_for_ready=True,
)

manager_arn = manager["paymentManagerArn"]
connector_id = connector["paymentConnectorId"]
provider_arn = provider["credentialProviderArn"]
```
 **Stripe (Privy) with IAM authorization:**   

```
from bedrock_agentcore.payments.client import PaymentClient

payment_client = PaymentClient(region_name="us-east-1")

response = payment_client.create_payment_manager_with_connector(
    payment_manager_name="StripePaymentManager",
    payment_manager_description="Stripe + Privy Payment Manager (IAM auth)",
    authorizer_type="AWS_IAM",
    role_arn="arn:aws:iam::123456789012:role/BedrockAgentCoreFullAccess",
    payment_connector_config={
        "name": "stripe_privy_connector",
        "description": "Stripe + Privy Connector",
        "payment_credential_provider_config": {
            "name": "my-stripe-privy-provider",
            "credential_provider_vendor": "StripePrivy",
            "credentials": {
                "app_id": "your-privy-app-id",
                "app_secret": "your-privy-app-secret",
                "authorization_private_key": "your-authorization-private-key",
                "authorization_id": "your-authorization-id",
            },
        },
    },
    wait_for_ready=True,
)

manager_arn = response["paymentManager"]["paymentManagerArn"]
connector_id = response["paymentConnector"]["paymentConnectorId"]
provider_arn = response["credentialProvider"]["credentialProviderArn"]
```
 **Stripe (Privy) with JWT authorization:**   

```
from bedrock_agentcore.payments.client import PaymentClient
from bedrock_agentcore.services.identity import IdentityClient

payment_client = PaymentClient(region_name="us-east-1")
identity_client = IdentityClient(region="us-east-1")

manager = payment_client.create_payment_manager(
    name="StripePaymentManagerJWT",
    description="Stripe + Privy Payment Manager (JWT auth)",
    authorizer_type="CUSTOM_JWT",
    role_arn="arn:aws:iam::123456789012:role/BedrockAgentCoreFullAccess",
    authorizer_configuration={
        "customJWTAuthorizer": {
            "discoveryUrl": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_EXAMPLE/.well-known/openid-configuration",
            "allowedClients": ["your-client-id"],
        }
    },
    wait_for_ready=True,
)

provider = identity_client.create_payment_credential_provider(
    name="my-stripe-privy-provider-jwt",
    credential_provider_vendor="StripePrivy",
    provider_configuration_input={
        "stripePrivyConfiguration": {
            "appId": "your-privy-app-id",
            "appSecret": "your-privy-app-secret",
            "authorizationPrivateKey": "your-authorization-private-key",
            "authorizationId": "your-authorization-id",
        }
    },
)

connector = payment_client.create_payment_connector(
    payment_manager_id=manager["paymentManagerId"],
    name="stripe_privy_connector_jwt",
    description="Stripe + Privy Connector (JWT)",
    connector_type="StripePrivy",
    credential_provider_configurations=[
        {"stripePrivy": {"credentialProviderArn": provider["credentialProviderArn"]}}
    ],
    wait_for_ready=True,
)

manager_arn = manager["paymentManagerArn"]
connector_id = connector["paymentConnectorId"]
provider_arn = provider["credentialProviderArn"]
```
Create a Payment Manager with IAM authorization:  

```
aws bedrock-agentcore-control create-payment-manager \
  --name "MyPaymentManager" \
  --authorizer-type AWS_IAM \
  --role-arn "arn:aws:iam::123456789012:role/AgentCorePaymentsResourceRetrievalRole" \
  --region us-east-1
```
Create a Payment Manager with JWT authorization:  

```
aws bedrock-agentcore-control create-payment-manager \
  --name "MyPaymentManager" \
  --authorizer-type CUSTOM_JWT \
  --role-arn "arn:aws:iam::123456789012:role/AgentCorePaymentsResourceRetrievalRole" \
  --authorizer-configuration '{
    "customJWTAuthorizer": {
      "discoveryUrl": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_EXAMPLE/.well-known/openid-configuration",
      "allowedAudience": ["your-client-id"],
      "allowedClients": ["your-client-id"]
    }
  }' \
  --region us-east-1
```
The Payment Manager status starts as `CREATING` and transitions to `READY` when provisioning completes.  
 **Coinbase, Quick create (recommended):**   
With Quick create, you create the connector with an empty credential-provider-configurations list and `--provision-mode QUICK_CREATE`. You do not create a credential provider first.  

```
aws bedrock-agentcore-control create-payment-connector \
  --payment-manager-id <paymentManagerId> \
  --name "CoinbaseConnector" \
  --type CoinbaseCDP \
  --credential-provider-configurations '[]' \
  --provision-mode QUICK_CREATE \
  --region us-east-1
```
The response has status `PENDING_AUTHENTICATION` and an `authorizationUrl`. Open the URL, authorize through Coinbase, and then poll `get-payment-connector` until the status is `READY`. The URL is valid for about 10 minutes; if it expires, the connector transitions to `AUTHENTICATION_EXPIRED` and you re-create it.  
The credentials that Quick create provisions are service-managed, so you can replace them on demand with `rotate-payment-connector-credentials`. For more information, see [Rotate service-managed connector credentials](payments-security-best-practices.md#payments-rotate-connector-credentials).  
 **Manual flow:** With the manual flow, you create a payment credential provider and then reference its ARN when you create the connector. This is the only flow for Stripe (Privy).  
After the Payment Manager is ready, [create a payment credential provider](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/resource-providers.html#payment-credential-provider):  
The following example creates a payment credential provider for Coinbase CDP:  

```
aws bedrock-agentcore-control create-payment-credential-provider \
  --name "coinbase-provider" \
  --credential-provider-vendor CoinbaseCDP \
  --provider-configuration-input '{
    "coinbaseCdpConfiguration": {
      "apiKeyId": "your-coinbase-api-key-id",
      "apiKeySecret": "your-coinbase-api-key-secret",
      "walletSecret": "your-coinbase-wallet-secret"
    }
  }' \
  --region us-east-1
```
The following example creates a payment credential provider for Stripe Privy:  

```
aws bedrock-agentcore-control create-payment-credential-provider \
  --name "stripe-privy-provider" \
  --credential-provider-vendor StripePrivy \
  --provider-configuration-input '{
    "stripePrivyConfiguration": {
      "appId": "your-stripe-privy-app-id",
      "appSecret": "your-stripe-privy-app-secret",
      "authorizationPrivateKey": "your-stripe-privy-authorization-private-key",
      "authorizationId": "your-stripe-privy-authorization-id"
    }
  }' \
  --region us-east-1
```
After the credential provider is ready, create a connector:  

```
aws bedrock-agentcore-control create-payment-connector \
  --payment-manager-id <paymentManagerId> \
  --name "CoinbaseConnector" \
  --type CoinbaseCDP \
  --credential-provider-configurations '[{
    "coinbaseCDP": {
      "credentialProviderArn": "arn:aws:bedrock-agentcore:us-east-1:123456789012:token-vault/default/paymentcredentialprovider/my-cdp-provider"
    }
  }]' \
  --region us-east-1
```
Create a Payment Manager with IAM authorization:  

```
import boto3

client = boto3.client("bedrock-agentcore-control", region_name="us-east-1")

# Create PaymentManager with IAM authorization
payment_manager = client.create_payment_manager(
    name="MyPaymentManager",
    authorizerType="AWS_IAM",
    roleArn="arn:aws:iam::123456789012:role/AgentCorePaymentsResourceRetrievalRole"
)

print(f"Payment Manager ID: {payment_manager['paymentManagerId']}")
```
Create a Payment Manager with JWT authorization:  

```
payment_manager = client.create_payment_manager(
    name="MyPaymentManager",
    authorizerType="CUSTOM_JWT",
    roleArn="arn:aws:iam::123456789012:role/AgentCorePaymentsResourceRetrievalRole",
    authorizerConfiguration={
        "customJWTAuthorizer": {
            "discoveryUrl": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_EXAMPLE/.well-known/openid-configuration",
            "allowedAudience": ["your-client-id"],
            "allowedClients": ["your-client-id"],
            "allowedScopes": ["payments:write"],
            "customClaims": [
                {
                    "inboundTokenClaimName": "tenant_id",
                    "inboundTokenClaimValueType": "STRING",
                    "authorizingClaimMatchValue": {
                        "claimMatchValue": {"matchValueString": "your-unique-tenant-id"},
                        "claimMatchOperator": "EQUALS"
                    }
                }
            ]
        }
    }
)
```
 **Coinbase, Quick create (recommended):**   
With Quick create, you create the connector with an empty `credentialProviderConfigurations` list and `provisionMode="QUICK_CREATE"`. You do not create a credential provider first.  

```
# Create a Coinbase connector with Quick create
connector = client.create_payment_connector(
    paymentManagerId=payment_manager["paymentManagerId"],
    name="CoinbaseConnector",
    type="CoinbaseCDP",
    credentialProviderConfigurations=[],
    provisionMode="QUICK_CREATE"
)

print(f"Status: {connector['status']}")
print(f"Authorization URL: {connector.get('authorizationUrl')}")
```
The connector returns status `PENDING_AUTHENTICATION` and an `authorizationUrl`. Open the URL, authorize through Coinbase, and then poll `get_payment_connector` until the status is `READY`. The URL is valid for about 10 minutes; if it expires, the connector transitions to `AUTHENTICATION_EXPIRED` and you re-create it.  
The credentials that Quick create provisions are service-managed, so you can replace them on demand with `rotate_payment_connector_credentials`. For more information, see [Rotate service-managed connector credentials](payments-security-best-practices.md#payments-rotate-connector-credentials).  
 **Manual flow:** With the manual flow, you create a payment credential provider and then reference its ARN when you create the connector. This is the only flow for Stripe (Privy).  
After the Payment Manager reaches `READY` status, create a payment credential provider:  
The following example configures a provider for Coinbase CDP:  

```
import boto3

client = boto3.client("bedrock-agentcore-control", region_name="us-east-1")

coinbase_provider = client.create_payment_credential_provider(
    name="coinbase-provider",
    credentialProviderVendor="CoinbaseCDP",
    providerConfigurationInput={
        "coinbaseCdpConfiguration": {
            "apiKeyId": "your-coinbase-api-key-id",
            "apiKeySecret": "your-coinbase-api-key-secret",
            "walletSecret": "your-coinbase-wallet-secret"
        }
    }
)
```
The following example configures a provider for Stripe Privy:  

```
import boto3

client = boto3.client("bedrock-agentcore-control", region_name="us-east-1")

stripe_privy_provider = client.create_payment_credential_provider(
    name="stripe-privy-provider",
    credentialProviderVendor="StripePrivy",
    providerConfigurationInput={
        "stripePrivyConfiguration": {
            "appId": "your-stripe-privy-app-id",
            "appSecret": "your-stripe-privy-app-secret",
            "authorizationPrivateKey": "your-stripe-privy-authorization-private-key",
            "authorizationId": "your-stripe-privy-authorization-id"
        }
    }
)
```
After creating payment credential provider, create a connector:  

```
# Create PaymentConnector for Coinbase CDP
payment_connector = client.create_payment_connector(
    paymentManagerId=payment_manager["paymentManagerId"],
    name="CoinbaseConnector",
    type="CoinbaseCDP",
    credentialProviderConfigurations=[
        {
            "coinbaseCDP": {
                "credentialProviderArn": "arn:aws:bedrock-agentcore:us-east-1:123456789012:token-vault/default/paymentcredentialprovider/my-cdp-provider"
            }
        }
    ]
)

print(f"Connector ID: {payment_connector['paymentConnectorId']}")
```
For Stripe (Privy), use the `stripePrivy` configuration variant:  

```
# Create PaymentConnector for Stripe (Privy)
payment_connector = client.create_payment_connector(
    paymentManagerId=payment_manager["paymentManagerId"],
    name="StripePrivyConnector",
    type="StripePrivy",
    credentialProviderConfigurations=[
        {
            "stripePrivy": {
                "credentialProviderArn": "arn:aws:bedrock-agentcore:us-east-1:123456789012:token-vault/default/paymentcredentialprovider/my-privy-provider"
            }
        }
    ]
)
```

## Lifecycle states
<a name="payments-setup-pm-lifecycle"></a>

After creation, the Payment Manager transitions through the following states:


| State | Description | 
| --- | --- | 
|  `CREATING`  | Initial state during provisioning. | 
|  `READY`  | Payment Manager is operational and accepting connector configurations. | 
|  `UPDATING`  | A configuration change is being applied. | 
|  `CREATE_FAILED`  | Provisioning failure. | 
|  `UPDATE_FAILED`  | Update operation failure. | 

## Payment Connector lifecycle states
<a name="payments-setup-connector-lifecycle"></a>

A Payment Connector transitions through the following states. The `PENDING_AUTHENTICATION`, `PROVISIONING`, `AUTHENTICATION_EXPIRED`, and `AUTHENTICATION_FAILED` states apply to the Coinbase **Quick create** flow.


| State | Description | 
| --- | --- | 
|  `CREATING`  | Initial state while the connector is being provisioned. | 
|  `PENDING_AUTHENTICATION`  | Quick create only. The connector is waiting for you to authorize through Coinbase using the returned `authorizationUrl`. | 
|  `PROVISIONING`  | Quick create only. Authorization succeeded and the service is provisioning the credential provider. | 
|  `READY`  | The connector is operational and can process payments. | 
|  `UPDATING`  | A configuration change is being applied. | 
|  `AUTHENTICATION_EXPIRED`  | Quick create only. The `authorizationUrl` expired (about 10 minutes) before authorization completed. Re-create the connector to get a fresh URL. | 
|  `AUTHENTICATION_FAILED`  | Quick create only. Authorization through Coinbase did not complete successfully. | 
|  `AWS_MARKETPLACE_SUBSCRIPTION_REQUIRED`  | Coinbase requires an active AWS Marketplace subscription. Subscribe to the **Coinbase Wallets for AgentCore Payments** listing and retry. | 
|  `CREATE_FAILED`  | Provisioning failure. | 
|  `UPDATE_FAILED`  | Update operation failure. | 
|  `DELETE_FAILED`  | Delete operation failure. | 

## Get a Payment Manager
<a name="payments-setup-pm-get"></a>

**Example**  

```
agentcore payment manager get --id <paymentManagerId>
```
For a Payment Manager in your project, run `agentcore status --json`. The Payment Manager ID is the last segment of its `arn`, and the connector IDs are under its `children`.

```
from bedrock_agentcore.payments.client import PaymentClient

payment_client = PaymentClient(region_name="us-east-1")
response = payment_client.get_payment_manager(
    payment_manager_id="<paymentManagerId>"
)
print(f"Status: {response['status']}")
```

```
aws bedrock-agentcore-control get-payment-manager \
  --payment-manager-id <paymentManagerId> \
  --region us-east-1
```

```
response = client.get_payment_manager(
    paymentManagerId="<paymentManagerId>"
)
print(f"Status: {response['status']}")
```

## List Payment Managers
<a name="_list_payment_managers"></a>

**Example**  

```
agentcore payment manager list
```

```
from bedrock_agentcore.payments.client import PaymentClient

payment_client = PaymentClient(region_name="us-east-1")
response = payment_client.list_payment_managers()
for pm in response['paymentManagers']:
    print(f"{pm['name']} - {pm['status']}")
```

```
aws bedrock-agentcore-control list-payment-managers \
  --region us-east-1
```

```
response = client.list_payment_managers()
for pm in response['paymentManagers']:
    print(f"{pm['name']} - {pm['status']}")
```

## Delete a Payment Manager
<a name="_delete_a_payment_manager"></a>

**Example**  

```
agentcore remove payment-manager --name MyPaymentManager
agentcore remove credential --name CoinbaseCreds
agentcore deploy
```
Removing the Payment Manager also removes its connectors. If you added a payment credential for a manual connector, remove it too (`CoinbaseCreds` or `PrivyCreds`). Quick create adds no credential to your project, so skip that command. The `remove` commands update local configuration. The follow-up `deploy` tears down the payment infrastructure in your account.

```
from bedrock_agentcore.payments.client import PaymentClient

payment_client = PaymentClient(region_name="us-east-1")
payment_client.delete_payment_manager(
    payment_manager_id="<paymentManagerId>"
)
```

```
aws bedrock-agentcore-control delete-payment-manager \
  --payment-manager-id <paymentManagerId> \
  --region us-east-1
```

```
client.delete_payment_manager(
    paymentManagerId="<paymentManagerId>"
)
```

## Next steps
<a name="_next_steps"></a>

After creating your Payment Manager, you can:

1.  **Set up payment instruments and sessions** — Configure payment instruments and sessions to start processing transactions. See [Create a payment instrument](payments-create-instrument.md).

1.  **Integrate with your agent framework** — Use the integration code templates to connect the Payment Manager to your agentic workflow. See [Processing payments](payments-processing.md).

1.  **Discover paid MCP tools and endpoints** — Connect to ready-to-use MCP servers with pay-per-use endpoints or bring your own merchant endpoints. See [Coinbase Bazaar via AgentCore Gateway](payments-connect-bazaar.md).

1.  **Enable observability** — Configure log deliveries and tracing to monitor sessions, API invocations, transactions, and error rates. See [Observability](payments-observability.md).

1.  **Plan credential rotation** — If you used Quick create, schedule rotation of the connector’s service-managed credentials. See [Rotate service-managed connector credentials](payments-security-best-practices.md#payments-rotate-connector-credentials).