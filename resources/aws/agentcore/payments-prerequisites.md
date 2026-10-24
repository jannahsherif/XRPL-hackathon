

# Prerequisites for AgentCore payments
<a name="payments-prerequisites"></a>

Complete the prerequisites on this page before you use AgentCore payments.

**Tip**  
You can automate the steps on this page with the AgentCore Payments skill in the AWS agent toolkit. The skill is part of the **aws-agents** plugin and lets an AI coding agent create your Payment Manager, connector, and credential provider with the AgentCore CLI, create a payment instrument and session using the AgentCore SDK, and add a process payment tool to your agent. For details, see the [quickstart](payments-getting-started.md) and the [AWS agent toolkit on GitHub](https://github.com/aws/agent-toolkit-for-aws/tree/main).

## AWS account and credentials
<a name="payments-prereq-account"></a>

You need an AWS account with credentials configured. To configure credentials, install and use the AWS Command Line Interface by following the steps at [Getting started with the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

```
# Verify installation
aws --version  # Should show version 2.x
```

## Python and AWS SDK
<a name="payments-prereq-python"></a>

To access your AWS credentials and configure them for use with SDKs, follow the steps at [Using IAM Identity Center to authenticate AWS SDK and Tools](https://docs.aws.amazon.com/sdkref/latest/guide/access-sso.html). If you plan to use the AWS Python SDK (Boto3) to interact with AgentCore payments programmatically:

1. Install **Python 3.10\+**.

1. Install the AWS SDK: `pip install boto3` 

1. Verify your credentials are configured: `aws sts get-caller-identity` 

For more information on how to set up and use the AWS SDK, see [AWS Builder Tools](https://aws.amazon.com/developer/tools/).

## Payment provider credentials
<a name="payments-prereq-provider-credentials"></a>

AgentCore payments connects to external payment providers for cryptocurrency wallet operations. You must obtain credentials from at least one supported provider before creating a PaymentConnector.

### Coinbase CDP credentials
<a name="payments-prereq-coinbase"></a>

If you plan to use Coinbase CDP as your payment provider for developer-managed wallets, obtain the following credentials from the [Coinbase Developer Platform](https://docs.cdp.coinbase.com/api-reference/v2/authentication). The [Coinbase AgentCore template on GitHub](https://github.com/coinbase/cdp-agentcore-template) provides a reference frontend for onramping funds and granting agent permissions.

**Note**  
Obtaining the credentials in this section applies to the Coinbase **manual** flow and to Stripe (Privy). If you use Coinbase **Quick create**, which is the recommended default for Coinbase, you can skip obtaining and generating Coinbase API keys. With Quick create, you authorize through Coinbase, and the service provisions the credential provider for you.

**Note**  
To use Coinbase as a payment provider, you must also subscribe to the **Coinbase Wallets for AgentCore Payments** listing in AWS Marketplace. This subscription is required for Coinbase regardless of whether you use Quick create or the manual flow. This requires the AWS managed policy [AWSMarketplaceManageSubscriptions](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSMarketplaceManageSubscriptions.html). With this subscription, your Coinbase wallet usage charges are consolidated into your monthly AWS bill based on Coinbase’s [pricing](https://docs.cdp.coinbase.com/wallets/pricing) on the Coinbase website. There are no additional charges or obligations for the subscription. For more information, see [Subscribe to Coinbase Wallets for AgentCore Payments in AWS Marketplace](payments-marketplace-subscription.md).

1. Log in to the [Coinbase Developer Platform](https://portal.cdp.coinbase.com/) and create or log in to your account. Select a project.

1.  Navigate to your [**API Keys**](https://portal.cdp.coinbase.com/projects/api-keys) dashboard, choose **Create secret API Key**, and note the following values. Go back to your project.


<table>
<thead>
  <tr><th>Credential</th><th>Description</th></tr>
</thead>
<tbody>
  <tr><td> <code>API Key ID</code> </td><td>The public identifier for your CDP project</td></tr>
  <tr><td> <code>API Key Secret</code> </td><td>The private secret used to sign API requests to the CDP control plane</td></tr>
</tbody>
</table>
  
![Coinbase CDP API key generation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/payments/coinbase-api-key.png)

1.  Under **Products** > **Wallets** > **Non-custodial Wallet** > **Security**, choose **Generate new** under **Generate Wallet secret** and note the following value:


<table>
<thead>
  <tr><th>Credential</th><th>Description</th></tr>
</thead>
<tbody>
  <tr><td> <code>Wallet Secret</code> </td><td>A specialized secret for cryptographic wallet operations such as deriving addresses and signing transactions</td></tr>
</tbody>
</table>
  
![Coinbase CDP Wallet secret generation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/payments/coinbase-wallet-secret.png)

1. Under **Products** > **Wallets** > **Non-custodial Wallet** > **Security**, enable **Delegated signing**.

![Coinbase dashboard for Delegation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/payments/coinbase-delegation.png)


### Privy credentials
<a name="payments-prereq-privy"></a>

If you plan to use Privy for user-owned embedded wallet flows, obtain the following credentials from the [Privy Dashboard](https://docs.privy.io/authentication/overview#api-authentication). The [Privy AgentCore SDK on GitHub](https://github.com/privy-io/aws-agentcore-sdk) provides a reference frontend for onramping funds and granting agent permissions.

1. Create a **dedicated** Privy app for AgentCore operations at [dashboard.privy.io](https://dashboard.privy.io/). Do not reuse Privy apps that serve other purposes.

1. Copy the **App ID** and **App Secret** from your app settings.

1. In your Privy app, navigate to **Wallet Infrastructure** > **Authorization** and choose **New Key** to generate a P-256 key pair. Note the following values:


<table>
<thead>
  <tr><th>Credential</th><th>Description</th></tr>
</thead>
<tbody>
  <tr><td> <code>App ID</code> </td><td>Your Privy application identifier, sent as the <code>privy-app-id</code> header on API calls</td></tr>
  <tr><td> <code>App Secret</code> </td><td>Secret credential paired with the App ID, used for server-to-server Basic Auth</td></tr>
  <tr><td> <code>Authorization ID</code> (Signer ID)</td><td>The public key identifier from the generated P-256 key pair</td></tr>
  <tr><td> <code>Authorization Private Key</code> </td><td>The private key from the generated P-256 key pair, used for signing wallet operations.</td></tr>
</tbody>
</table>


![Privy key dialog for AgentCore payments](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/images/payments/privy-keys.png)


#### Security best practices for Privy credentials
<a name="_security_best_practices_for_privy_credentials"></a>

 **Create a dedicated Privy app for AgentCore** 

Create a separate Privy app that is used exclusively for AgentCore payments. This reduces the scope of credentials and simplifies auditing of wallet operations.

 **Restrict secret access to AgentCore services** 

When you store your Privy `App Secret` in AgentCore Identity as a PaymentCredentialProvider, ensure that only the AgentCore payments service role can retrieve the secret. Do not grant access to the underlying secret in AWS Secrets Manager to any other IAM principals. The following resource policy on the secret restricts access to the AgentCore service role:

```
{
    "Version": "2012-10-17",		 	 	 
    "Statement": [
        {
            "Effect": "Deny",
            "Principal": "*",
            "Action": "secretsmanager:GetSecretValue",
            "Resource": "*",
            "Condition": {
                "StringNotEquals": {
                    "aws:PrincipalArn": "arn:aws:iam::111122223333:role/AgentCorePaymentsResourceRetrievalRole"
                }
            }
        }
    ]
}
```

**Warning**  
If Privy secrets are accessible to principals beyond the AgentCore service role, a compromised IAM identity could retrieve the secrets and execute unauthorized wallet operations outside of AgentCore’s budget enforcement and audit controls.

 **Rotate secrets regularly** 

Rotate your Privy credentials on a regular schedule to reduce the window of exposure for any compromised secret.


| Credential | Recommended rotation frequency | 
| --- | --- | 
|  `App Secret`  | Every 90 days | 
|  `Authorization Private Key`  | Every 90 days | 
|  `App ID`  | Does not require rotation (public identifier) | 
|  `Authorization ID`  | Rotates automatically when you generate a new key pair | 

To rotate credentials:

1. Generate a new key pair or App Secret in the Privy Dashboard.

1. Update the PaymentCredentialProvider in AgentCore Identity with the new values.

1. Verify that payment operations succeed with the new credentials.

1. Revoke the old credentials in the Privy Dashboard.

**Note**  
Plan for a brief overlap period where both old and new credentials are active. This prevents downtime during rotation.

After you obtain credentials from your provider, you store them in AgentCore Identity as a PaymentCredentialProvider. For instructions, see [Configure payment credential providers](resource-providers.md). For the complete request and response schema, see [CreatePaymentCredentialProvider](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreatePaymentCredentialProvider.html) in the API Reference.

## (Optional) Identity provider for JWT authorization
<a name="payments-prereq-jwt"></a>

If you plan to use JWT authorization for inbound access to your Payment Manager (to enable consumers to access the Payment Manager using non-IAM identities), set up Amazon Cognito or your own identity provider before creating the Payment Manager:

1.  **Create a Cognito User Pool** (or use your existing identity provider).

1.  **Register an App Client** and note the Client ID.

1.  **Create a test user** with a username and password.

Alternatively, you can choose **Quick create configurations with Cognito** during Payment Manager creation, and AgentCore payments creates the authorization configurations on your behalf.

For detailed instructions, see [Configure inbound JWT authorizer](inbound-jwt-authorizer.md).