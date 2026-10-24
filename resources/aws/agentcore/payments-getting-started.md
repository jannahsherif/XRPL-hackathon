

# AgentCore payments quick start
<a name="payments-getting-started"></a>

This tutorial walks you through setting up AgentCore payments and processing your first microtransaction. By the end, your agent will pay for a resource using the x402 protocol on a test network.

You can set up payments in two ways:
+  [Using the AgentCore Payments skill](#payments-getting-started-skill) — An automated setup experience that provisions all resources through a guided conversation with AI coding agents like Kiro, Claude Code, or Codex. The skill handles CLI commands, SDK scripts, and framework wiring for you.
+  [Using CLI, SDK, or Boto3](#payments-getting-started-manual) — A step-by-step manual setup using the AgentCore CLI, AWS SDK, or AWS CLI directly.

You can provide credentials in two ways when you create a Coinbase connector. With **Quick create** (recommended), you authorize through Coinbase and AgentCore payments provisions and stores the credentials for you — no keys to generate or paste. With **Manual**, you supply Coinbase API keys that you generated yourself. Stripe (Privy) uses the manual flow only. With Quick create, you skip Steps 1 and 2 of the manual setup.

## Using the AgentCore Payments skill
<a name="payments-getting-started-skill"></a>

The AgentCore Payments skill automates the entire setup process through an interactive, guided experience. It provisions the following resources:
+  **PaymentCredentialProvider** — Stores payment provider credentials in AgentCore Identity.
+  **Payment Manager** — The top-level resource that coordinates payment operations.
+  **Payment Connector** — Links the manager to your credentials via the AgentCore CLI.
+  **Payment Instrument** — A crypto wallet that your agent uses to pay merchants on behalf of a user.
+  **Payment Session** — A time-bounded context with spending limits.

The skill also wires payments into your agent with a framework-agnostic tool, so it works with Strands, LangGraph, OpenAI Agents SDK, or any Python framework.

### Prerequisites
<a name="payments-getting-started-skill-prereqs"></a>

Before starting, make sure you have:
+  ** AWS Account** with credentials configured (`aws configure`)
+  **An AWS Region where AgentCore payments is available** — See [Supported AWS Regions](agentcore-regions.md).
+  **A Coinbase AWS Marketplace subscription** (Coinbase only) — If you use Coinbase as your payment provider, you must subscribe to the [Coinbase Wallets for AgentCore Payments](https://aws.amazon.com/marketplace/pp/prodview-ia2zd5puqyi7g) listing in AWS Marketplace. With this subscription, your Coinbase wallet usage charges are consolidated into your monthly AWS bill based on Coinbase’s [pricing](https://docs.cdp.coinbase.com/wallets/pricing) on the Coinbase website. See [Subscribe to Coinbase Wallets for AgentCore Payments in AWS Marketplace](payments-marketplace-subscription.md).
+  **Node.js 20.12 or later** installed (the skill installs the AgentCore CLI automatically)
+  **An agent that accesses a paid endpoint** — The skill enables your agent to pay for x402-protected APIs. For testing, you can use the sandbox endpoint `https://sandbox.node4all.com/v1/x402-test`.
+  **The [Agent Toolkit for AWS](https://github.com/aws/agent-toolkit-for-aws) `aws-agents` plugin** installed in your AI coding agent:  
**Example**  

------
#### [ Claude Code ]

  ```
  /plugin marketplace add aws/agent-toolkit-for-aws
  /plugin install aws-agents@agent-toolkit-for-aws
  ```

------
#### [ Codex ]

  The plugin is discovered automatically from the marketplace manifest. To add the marketplace, run the following command:

  ```
  codex plugin marketplace add aws/agent-toolkit-for-aws
  ```

------

### Invoke the skill
<a name="payments-getting-started-skill-invoke"></a>

The payments skill is part of the `agents-build` skill in the [Agent Toolkit for AWS](https://github.com/aws/agent-toolkit-for-aws). To trigger it, describe your intent in your AI coding agent. For example:
+ "Add payments to my agent using `agents-build` skill in `aws-agents` plugin"
+ "Set up microtransactions for my agent using `agents-build` skill in `aws-agents` plugin"
+ "I need to handle 402 Payment Required responses using `agents-build` skill in `aws-agents` plugin"
+ "Wire my agent to pay for x402-protected APIs using `agents-build` skill in `aws-agents` plugin"

The skill detects payment-related intent and loads the payments workflow automatically.

### What the skill does
<a name="payments-getting-started-skill-flow"></a>

The skill runs an automated process that provisions your payment infrastructure end-to-end. The skill runs most steps automatically and pauses twice for your input:

1. Verifies or installs the AgentCore CLI and sets up the project

1. Creates the payment manager

1.  **Pauses**: You add a payment connector. For **Coinbase with Quick Create** (recommended), you authorize through Coinbase and AgentCore payments provisions the credentials for you.

1. Deploys resources to your AWS account (`agentcore deploy`)

1. Wires a framework-agnostic payment tool (`x402_payment_tool.py`) into your agent

1. Creates a per-user wallet (instrument) and budget-bounded session via the SDK

1.  **Pauses**: You authorize the wallet (delegation) and fund it with testnet USDC from the [Circle faucet](https://faucet.circle.com/) website

1. Sets environment variables and runs a test payment against a paid endpoint

If you use the **manual** flow (Coinbase manual or Stripe Privy), obtain credentials from your provider before adding the connector. With Coinbase **Quick create**, you skip this step. You authorize through Coinbase instead of entering API keys manually.
+  **Coinbase CDP** (manual only) — API Key ID, API Key Secret, and Wallet Secret from the [Coinbase Developer Platform](https://docs.cdp.coinbase.com/api-reference/v2/authentication#1-create-client-api-key) website (with Delegated signing enabled). Coinbase also requires an active AWS Marketplace subscription to the **Coinbase Wallets for AgentCore Payments** listing. See [Subscribe to Coinbase Wallets for AgentCore Payments in AWS Marketplace](payments-marketplace-subscription.md).
+  **Stripe Privy** — App ID, App Secret, Authorization ID, and Authorization Private Key from the [Privy dashboard](https://dashboard.privy.io/) website.

A successful run shows the agent calling `x402_fetch`, detecting a `402`, settling payment via the AgentCore SDK, and the retry returning `200` with paid content.

## Using CLI, SDK, or Boto3
<a name="payments-getting-started-manual"></a>

This section walks you through each step manually using the AgentCore CLI, AWS CLI, or AWS SDK (Boto3).

### Prerequisites
<a name="payments-getting-started-manual-prereqs"></a>

Before starting, make sure you have:
+  ** AWS Account** with credentials configured (`aws configure`)
+  **Python 3.10\+** installed
+  **A Coinbase AWS Marketplace subscription** (Coinbase only) — If you use Coinbase as your payment provider, you must subscribe to the [Coinbase Wallets for AgentCore Payments](https://aws.amazon.com/marketplace/pp/prodview-ia2zd5puqyi7g) listing in AWS Marketplace. With this subscription, your Coinbase wallet usage charges are consolidated into your monthly AWS bill based on Coinbase’s [pricing](https://docs.cdp.coinbase.com/wallets/pricing) on the Coinbase website. See [Subscribe to Coinbase Wallets for AgentCore Payments in AWS Marketplace](payments-marketplace-subscription.md).
+  **An AWS Region where AgentCore payments is available** — See [Supported AWS Regions](agentcore-regions.md).

Install the required packages:

```
pip install boto3 bedrock-agentcore[strands-agents] strands-agents strands-agents-tools
```

Verify your credentials are configured:

```
aws sts get-caller-identity
```

**Tip**  
If you have the AgentCore CLI installed (`npm install -g @aws/agentcore`), you can use it in Steps 3 and 6 and in the cleanup section. To look up payment resources, use `agentcore payment instrument get` and `agentcore payment session get`.

### Step 1: Obtain payment provider credentials (manual flow)
<a name="payments-getting-started-provider-credentials"></a>

Steps 1 and 2 apply to the **manual** credential flow — Coinbase (manual) or Stripe (Privy).

**Note**  
 **Using Quick create for Coinbase (recommended).** Skip Steps 1 and 2 and see [Step 3](#payments-getting-started-step3). AgentCore payments provisions the Coinbase credentials for you after you authorize through Coinbase — you do not obtain or store any keys.

AgentCore payments connects to an external payment provider for wallet operations. You need credentials from one of the supported providers before proceeding.

**Example**  

1. Log in to the [Coinbase Developer Platform](https://docs.cdp.coinbase.com/api-reference/v2/authentication#1-create-client-api-key) and create or log in to your account. Select a project.

1. Navigate to your **API Keys dashboard**, choose **Create secret API Key**, and note the API Key ID and API Key Secret. Go back to your project.

1. Under **Products** > **Wallets** > **Non-custodial Wallet** > **Security**, choose **Generate new** under **Generate Wallet secret** and note the Wallet Secret.

1. Under **Products** > **Wallets** > **Non-custodial Wallet** > **Security**, enable **Delegated signing**.
You will use these values in the next step:  


| Credential | Description | 
| --- | --- | 
|  `API Key ID`  | Public identifier for your CDP project | 
|  `API Key Secret`  | Private secret for signing API requests | 
|  `Wallet Secret`  | Secret for cryptographic wallet operations (deriving addresses, signing transactions) | 

1. Create a **dedicated** Privy app at [dashboard.privy.io](https://dashboard.privy.io/). Do not reuse apps that serve other purposes.

1. Copy the **App ID** and **App Secret** from your app settings.

1. Navigate to **Wallet Infrastructure** > **Authorization** and choose **New Key** to generate a P-256 key pair.
You will use these four values in the next step:  


| Credential | Description | 
| --- | --- | 
|  `App ID`  | Your Privy application identifier | 
|  `App Secret`  | Secret for server-to-server Basic Auth | 
|  `Authorization ID`  | Public key identifier from the P-256 key pair | 
|  `Authorization Private Key`  | Private key from the P-256 key pair | 

For full details including security best practices and credential rotation, see [Prerequisites](payments-prerequisites.md).

### Step 2: Store credentials in AgentCore Identity (manual flow)
<a name="payments-getting-started-step2"></a>

Store your payment provider credentials as a PaymentCredentialProvider. This keeps secrets in AWS Secrets Manager rather than in your application code. If you are using Coinbase **Quick create**, skip this step. AgentCore payments creates and stores the credential provider for you in Step 3.

**Example**  

```
import boto3

client = boto3.client("bedrock-agentcore-control", region_name="us-west-2")

credential_provider = client.create_payment_credential_provider(
    name="my-coinbase-credentials",
    credentialProviderVendor="CoinbaseCDP",
    providerConfigurationInput={
        "coinbaseCdpConfiguration": {
            "apiKeyId": "<YOUR_CDP_API_KEY_ID>",
            "apiKeySecret": "<YOUR_CDP_API_KEY_SECRET>",
            "walletSecret": "<YOUR_CDP_WALLET_SECRET>"
        }
    }
)
CREDENTIAL_PROVIDER_ARN = credential_provider["credentialProviderArn"]
print(f"Credential provider created: {CREDENTIAL_PROVIDER_ARN}")
```

```
import boto3

client = boto3.client("bedrock-agentcore-control", region_name="us-west-2")

credential_provider = client.create_payment_credential_provider(
    name="my-privy-credentials",
    credentialProviderVendor="StripePrivy",
    providerConfigurationInput={
        "stripePrivyConfiguration": {
            "appId": "<YOUR_PRIVY_APP_ID>",
            "appSecret": "<YOUR_PRIVY_APP_SECRET>",
            "authorizationId": "<YOUR_PRIVY_AUTHORIZATION_ID>",
            "authorizationPrivateKey": "<YOUR_PRIVY_PRIVATE_KEY_BASE64>"
        }
    }
)
CREDENTIAL_PROVIDER_ARN = credential_provider["credentialProviderArn"]
print(f"Credential provider created: {CREDENTIAL_PROVIDER_ARN}")
```

For the complete request and response schema, see [CreatePaymentCredentialProvider](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreatePaymentCredentialProvider.html) in the API Reference.

#### CLI alternative: Store credentials
<a name="payments-getting-started-step2-cli"></a>

With the AgentCore CLI, you add the credential provider with `agentcore add credentials payment` in the manual connector sections of Step 3. Skip this step if you plan to use the CLI path.

### Step 3: Create a Payment Manager and Connector
<a name="payments-getting-started-step3"></a>

A Payment Manager is the top-level resource that coordinates payment operations. A Payment Connector links the manager to your payment provider credentials. Before creating these resources, set up the required IAM roles as described in [IAM roles for AgentCore payments](payments-iam-roles.md).

First, create the **Payment Manager** (common to all providers):

**Example**  

1. Open the [Amazon Bedrock AgentCore console](https://console.aws.amazon.com/bedrock-agentcore/).

1. In the navigation pane, under **Build**, choose **Payments**.

1. Choose **Create Payment Manager**, enter a **Name**, and under **Permissions** choose **Create and use a new service role** (or select an existing role).

1. Under **Inbound Auth**, choose **Use IAM username**.

1. Choose **Create Payment Manager**. You add the connector in the provider section below.
For the full console walkthrough including JWT authorization and custom claims, see [Create a Payment Manager and Connector](payments-create-manager.md).
If you don’t have an AgentCore CLI project, install the CLI and create a project with a Runtime for Step 6. The Runtime must allow the two payment headers that Step 6 sends. For details, see [Pass custom headers to Amazon Bedrock AgentCore Runtime](runtime-header-allowlist.md):  

```
npm install -g @aws/agentcore
agentcore create --name PaymentsQuickstart --template empty
cd PaymentsQuickstart
agentcore add runtime \
  --name MyRuntime \
  --language python \
  --protocol HTTP \
  --request-header-allowlist X-Amzn-Bedrock-AgentCore-Runtime-Custom-Payment-Session-Id X-Amzn-Bedrock-AgentCore-Runtime-Custom-Payment-Instrument-Id
cd app/MyRuntime
uv init --bare
uv add \
  "aws-opentelemetry-distro~=0.21.0" \
  "bedrock-agentcore[strands-agents]>=1.18.1,<2" \
  "botocore[crt]~=1.43.0" \
  "strands-agents>=1.15,<2"
cd ../..
```
The `add runtime` command creates the Runtime documentation but doesn’t generate application code. Before your first deployment, save the Runtime entrypoint from Step 6 as `app/MyRuntime/main.py`. Then add the Payment Manager:  

```
agentcore add payment-manager \
  --name MyPaymentManager \
  --default-spend-limit 5.00
```
Add the connector in the provider section below, then run `agentcore deploy`. After the deployment, run `agentcore status --json`. Use the payment-manager `arn` as `PAYMENT_MANAGER_ARN` and the `id` of the payment-connector under its `children` as `PAYMENT_CONNECTOR_ID` in Steps 4 and 5.

```
from bedrock_agentcore.payments.client import PaymentClient

payment_client = PaymentClient(region_name="us-west-2")

manager = payment_client.create_payment_manager(
    name="MyPaymentManager",
    authorizer_type="AWS_IAM",
    role_arn="<YOUR_SERVICE_ROLE_ARN>",
    wait_for_ready=True,
)
PAYMENT_MANAGER_ID = manager["paymentManagerId"]
PAYMENT_MANAGER_ARN = manager["paymentManagerArn"]
```
Use `PAYMENT_MANAGER_ID` with `payment_client` to create the connector in the provider section below.

```
aws bedrock-agentcore-control create-payment-manager \
  --name "MyPaymentManager" \
  --authorizer-type AWS_IAM \
  --role-arn "<YOUR_SERVICE_ROLE_ARN>" \
  --region us-west-2
```
Wait for the manager to reach `READY`, then create the connector in the provider section below.

```
import time

manager = client.create_payment_manager(
    name="MyPaymentManager",
    authorizerType="AWS_IAM",
    roleArn="<YOUR_SERVICE_ROLE_ARN>"
)
PAYMENT_MANAGER_ID = manager["paymentManagerId"]
PAYMENT_MANAGER_ARN = manager["paymentManagerArn"]

while client.get_payment_manager(paymentManagerId=PAYMENT_MANAGER_ID)["status"] != "READY":
    time.sleep(5)
```

Then create a **Payment Connector** for your provider. Choose the **Coinbase** section (Quick create or Manual) or the **Stripe (Privy)** section.

#### Coinbase — Quick create (recommended)
<a name="payments-getting-started-step3-coinbase-quickcreate"></a>

With Quick create, you do not obtain or store Coinbase credentials. In the console, you complete this by choosing **Quick Create with Coinbase**. With the AWS CLI, AWS SDK, AgentCore CLI, or AgentCore SDK, pass `provisionMode=QUICK_CREATE` with an empty credential list. The connector starts in `PENDING_AUTHENTICATION` and returns an `authorizationUrl`. You open the returned `authorizationUrl` in a browser. After you authorize through Coinbase, AgentCore payments provisions the credentials and moves the connector to `READY`.

**Example**  

1. In the **Payment connector** section, choose **Add outbound auth** > **Create payment auth**, and for **Payment provider** choose **Coinbase**.

1. Choose **Quick create configurations - recommended**, then choose **Create payment auth**.

1. A Coinbase window opens — sign in or sign up and authorize (link) your Coinbase CDP account.

1. AgentCore payments provisions the Coinbase CDP API key and Wallet secret and stores them for you. The connector moves from `PENDING_AUTHENTICATION` to `READY`.

```
agentcore add payment-connector \
  --manager MyPaymentManager \
  --name my_coinbase_connector \
  --quick-create

agentcore deploy
```
 `agentcore deploy` prints `Authorize payment connector "<name>": <url>`. Open the URL in a browser and authorize through Coinbase. The service then provisions the credentials and the connector reaches `READY`.

```
connector = payment_client.create_payment_connector(
    payment_manager_id=PAYMENT_MANAGER_ID,
    name="my_coinbase_connector",
    connector_type="CoinbaseCDP",
    credential_provider_configurations=[],
    provision_mode="QUICK_CREATE",
)
PAYMENT_CONNECTOR_ID = connector["paymentConnectorId"]
# Open connector["authorizationUrl"], authorize through Coinbase,
# then poll get_payment_connector until status == "READY".
```

```
aws bedrock-agentcore-control create-payment-connector \
  --payment-manager-id "<PAYMENT_MANAGER_ID>" \
  --name "my_coinbase_connector" \
  --type CoinbaseCDP \
  --credential-provider-configurations '[]' \
  --provision-mode QUICK_CREATE \
  --region us-west-2
```
The response includes `status: PENDING_AUTHENTICATION` and an `authorizationUrl`. Open the URL in a browser and complete the Coinbase authorization, then poll until the connector is `READY`:  

```
aws bedrock-agentcore-control get-payment-connector \
  --payment-manager-id "<PAYMENT_MANAGER_ID>" \
  --payment-connector-id "<PAYMENT_CONNECTOR_ID>" \
  --region us-west-2
```

```
connector = client.create_payment_connector(
    paymentManagerId=PAYMENT_MANAGER_ID,
    name="my_coinbase_connector",
    type="CoinbaseCDP",
    credentialProviderConfigurations=[],
    provisionMode="QUICK_CREATE",
)
PAYMENT_CONNECTOR_ID = connector["paymentConnectorId"]
print(connector["status"], connector.get("authorizationUrl"))
# PENDING_AUTHENTICATION  https://...
# Open the authorizationUrl, authorize, then poll get_payment_connector until READY.
```

#### Coinbase — Manual
<a name="payments-getting-started-step3-coinbase-manual"></a>

Use Coinbase CDP credentials that you generated yourself (Steps 1–2). Create the credential provider, then create the connector referencing its ARN. For the **Console** or **AgentCore CLI** manual walkthrough, see [Create a Payment Manager and Connector](payments-create-manager.md).

**Example**  
Add the credential provider, then add the connector that uses it. Pass each secret as a `file://` path or as `-` to read it from stdin. The CLI rejects inline secret values.  

```
agentcore add credentials payment \
  --name my_coinbase_credentials \
  --provider CoinbaseCDP \
  --api-key-id <YOUR_CDP_API_KEY_ID> \
  --api-key-secret file://cdp-api-key-secret.txt \
  --wallet-secret file://cdp-wallet-secret.txt

agentcore add payment-connector \
  --manager MyPaymentManager \
  --name my_coinbase_connector \
  --credential my_coinbase_credentials

agentcore deploy
```

```
connector = payment_client.create_payment_connector(
    payment_manager_id=PAYMENT_MANAGER_ID,
    name="my_coinbase_connector",
    connector_type="CoinbaseCDP",
    credential_provider_configurations=[
        {"coinbaseCDP": {"credentialProviderArn": CREDENTIAL_PROVIDER_ARN}}
    ],
)
PAYMENT_CONNECTOR_ID = connector["paymentConnectorId"]
```

```
aws bedrock-agentcore-control create-payment-connector \
  --payment-manager-id "<PAYMENT_MANAGER_ID>" \
  --name "my_coinbase_connector" \
  --type CoinbaseCDP \
  --credential-provider-configurations '[{"coinbaseCDP":{"credentialProviderArn":"<CREDENTIAL_PROVIDER_ARN>"}}]' \
  --region us-west-2
```

```
connector = client.create_payment_connector(
    paymentManagerId=PAYMENT_MANAGER_ID,
    name="my_coinbase_connector",
    type="CoinbaseCDP",
    credentialProviderConfigurations=[{"coinbaseCDP": {"credentialProviderArn": CREDENTIAL_PROVIDER_ARN}}],
)
PAYMENT_CONNECTOR_ID = connector["paymentConnectorId"]
```

#### Stripe (Privy) — Manual
<a name="payments-getting-started-step3-stripe"></a>

Stripe (Privy) uses the manual flow only. Create the credential provider from your Privy credentials (Steps 1–2), then create the connector referencing its ARN. For the **Console** or **AgentCore CLI** manual walkthrough, see [Create a Payment Manager and Connector](payments-create-manager.md).

**Example**  
Add the credential provider, then add the connector that uses it. Pass each secret as a `file://` path or as `-` to read it from stdin. The CLI rejects inline secret values.  

```
agentcore add credentials payment \
  --name my_privy_credentials \
  --provider StripePrivy \
  --app-id <YOUR_PRIVY_APP_ID> \
  --app-secret file://privy-app-secret.txt \
  --authorization-private-key file://privy-authorization-private-key.txt \
  --authorization-id <YOUR_PRIVY_AUTHORIZATION_ID>

agentcore add payment-connector \
  --manager MyPaymentManager \
  --name my_privy_connector \
  --credential my_privy_credentials

agentcore deploy
```

```
connector = payment_client.create_payment_connector(
    payment_manager_id=PAYMENT_MANAGER_ID,
    name="my_privy_connector",
    connector_type="StripePrivy",
    credential_provider_configurations=[
        {"stripePrivy": {"credentialProviderArn": CREDENTIAL_PROVIDER_ARN}}
    ],
)
PAYMENT_CONNECTOR_ID = connector["paymentConnectorId"]
```

```
aws bedrock-agentcore-control create-payment-connector \
  --payment-manager-id "<PAYMENT_MANAGER_ID>" \
  --name "my_privy_connector" \
  --type StripePrivy \
  --credential-provider-configurations '[{"stripePrivy":{"credentialProviderArn":"<CREDENTIAL_PROVIDER_ARN>"}}]' \
  --region us-west-2
```

```
connector = client.create_payment_connector(
    paymentManagerId=PAYMENT_MANAGER_ID,
    name="my_privy_connector",
    type="StripePrivy",
    credentialProviderConfigurations=[{"stripePrivy": {"credentialProviderArn": CREDENTIAL_PROVIDER_ARN}}],
)
PAYMENT_CONNECTOR_ID = connector["paymentConnectorId"]
```

If you do not have a service role, see [IAM roles for AgentCore payments](payments-iam-roles.md) for instructions on creating one. The console can also create a role on your behalf. For the complete request and response schemas, see [CreatePaymentManager](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreatePaymentManager.html) and [CreatePaymentConnector](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreatePaymentConnector.html) in the Amazon Bedrock AgentCore Control API Reference.

### Step 4: Create a payment instrument
<a name="payments-getting-started-step4"></a>

A payment instrument is an embedded crypto wallet that your agent uses to pay merchants on behalf of a user. Each instrument is associated with a specific blockchain network.

**Example**  

```
from bedrock_agentcore.payments import PaymentManager

manager = PaymentManager(
    payment_manager_arn=PAYMENT_MANAGER_ARN,
    region_name="us-west-2"
)

instrument = manager.create_payment_instrument(
    user_id="test-user-123",
    payment_connector_id=PAYMENT_CONNECTOR_ID,
    payment_instrument_type="EMBEDDED_CRYPTO_WALLET",
    payment_instrument_details={
        "embeddedCryptoWallet": {
            "network": "ETHEREUM",
            "linkedAccounts": [{"email": {"emailAddress": "your-email@example.com"}}]
        }
    },
)
INSTRUMENT_ID = instrument["paymentInstrumentId"]
REDIRECT_URL = instrument["paymentInstrumentDetails"]["embeddedCryptoWallet"]["redirectUrl"]
print(f"Instrument created: {INSTRUMENT_ID}")
print(f"Fund the wallet at: {REDIRECT_URL}")
```

```
aws bedrock-agentcore create-payment-instrument \
    --payment-manager-arn "$PAYMENT_MANAGER_ARN" \
    --payment-connector-id "$PAYMENT_CONNECTOR_ID" \
    --user-id "test-user-123" \
    --payment-instrument-type "EMBEDDED_CRYPTO_WALLET" \
    --payment-instrument-details '{
        "embeddedCryptoWallet": {
            "network": "ETHEREUM",
            "linkedAccounts": [{"email": {"emailAddress": "your-email@example.com"}}]
        }
    }' \
    --client-token "$(uuidgen)" \
    --region us-west-2
```
Save `paymentInstrument.paymentInstrumentId` and `paymentInstrument.paymentInstrumentDetails.embeddedCryptoWallet.redirectUrl` from the response.

```
import uuid

dp_client = boto3.client("bedrock-agentcore", region_name="us-west-2",
    endpoint_url="https://bedrock-agentcore.us-west-2.amazonaws.com")

response = dp_client.create_payment_instrument(
    userId="test-user-123",
    paymentManagerArn=PAYMENT_MANAGER_ARN,
    paymentConnectorId=PAYMENT_CONNECTOR_ID,
    paymentInstrumentType="EMBEDDED_CRYPTO_WALLET",
    paymentInstrumentDetails={
        "embeddedCryptoWallet": {
            "network": "ETHEREUM",
            "linkedAccounts": [{"email": {"emailAddress": "your-email@example.com"}}]
        }
    },
    clientToken=str(uuid.uuid4()),
)
instrument = response["paymentInstrument"]
INSTRUMENT_ID = instrument["paymentInstrumentId"]
REDIRECT_URL = instrument["paymentInstrumentDetails"]["embeddedCryptoWallet"]["redirectUrl"]
print(f"Instrument created: {INSTRUMENT_ID}")
print(f"Fund the wallet at: {REDIRECT_URL}")
```

For the complete request and response schema, see [CreatePaymentInstrument](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_CreatePaymentInstrument.html) in the API Reference.

#### Fund the wallet and grant permissions
<a name="payments-getting-started-step4-fund"></a>

Before the agent can transact, the end user must fund the wallet and grant signing permissions. Open the `redirectUrl` from the response above in a browser. From the wallet hub, the user can:
+ Top up the wallet using crypto transfer, credit/debit card, Apple Pay, Google Pay, or ACH
+ Grant the agent permission to sign transactions on their behalf

For a test environment, fund the wallet with testnet USDC.

After funding, poll the instrument status until it becomes `ACTIVE`:

**Example**  

```
instrument = manager.get_payment_instrument(
    user_id="test-user-123",
    payment_instrument_id=INSTRUMENT_ID
)
print(f"Status: {instrument['status']}")
```

```
aws bedrock-agentcore get-payment-instrument \
    --payment-manager-arn "$PAYMENT_MANAGER_ARN" \
    --payment-instrument-id "$INSTRUMENT_ID" \
    --region us-west-2
```

```
while True:
    inst_status = dp_client.get_payment_instrument(
        paymentManagerArn=PAYMENT_MANAGER_ARN,
        paymentInstrumentId=INSTRUMENT_ID
    )["paymentInstrument"]
    if inst_status["status"] == "ACTIVE":
        print("Instrument is active and funded.")
        break
    print(f"Instrument status: {inst_status['status']}... waiting for funding")
    time.sleep(10)
```

For more details on funding flows by provider, see [Funding the wallet](payments-how-it-works.md#payments-how-it-works-funding-wallet).

### Step 5: Create a payment session
<a name="payments-getting-started-step5"></a>

A payment session is a time-bounded context with optional spending limits. When the session expires or the budget is exhausted, the agent cannot make further payments within that session.

**Example**  

```
from bedrock_agentcore.payments import PaymentManager

manager = PaymentManager(
    payment_manager_arn=PAYMENT_MANAGER_ARN,
    region_name="us-west-2"
)

session = manager.create_payment_session(
    user_id="test-user-123",
    limits={"maxSpendAmount": {"value": "5.00", "currency": "USD"}},
    expiry_time_in_minutes=60
)
SESSION_ID = session["paymentSessionId"]
print(f"Session created: {SESSION_ID} (expires in 60 minutes, $5.00 limit)")
```

```
aws bedrock-agentcore create-payment-session \
    --payment-manager-arn "$PAYMENT_MANAGER_ARN" \
    --user-id "test-user-123" \
    --expiry-time-in-minutes 60 \
    --limits '{"maxSpendAmount": {"value": "5.00", "currency": "USD"}}' \
    --client-token "$(uuidgen)" \
    --region us-west-2
```

```
session = dp_client.create_payment_session(
    userId="test-user-123",
    paymentManagerArn=PAYMENT_MANAGER_ARN,
    expiryTimeInMinutes=60,
    limits={"maxSpendAmount": {"value": "5.00", "currency": "USD"}},
    clientToken=str(uuid.uuid4()),
)["paymentSession"]
SESSION_ID = session["paymentSessionId"]
print(f"Session created: {SESSION_ID} (expires in 60 minutes, $5.00 limit)")
```
For the complete request and response schema, see [CreatePaymentSession](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_CreatePaymentSession.html) in the API Reference.

Save the returned payment session ID. In the next step, pass this ID and the payment instrument ID from Step 4 when invoking your agent.

### Step 6: Process a payment with a Strands agent
<a name="payments-getting-started-step6"></a>

With all resources in place, create a Strands agent that handles x402 payments automatically. When the agent calls a paid endpoint and receives an HTTP 402 response, the payments plugin signs the transaction and retries the request.

**Example**  
Update your Python agent with `AgentCorePaymentsPlugin` using the **AgentCore SDK** example in this step. Deploy the updated agent from your project directory:  

```
agentcore deploy
```
In the entrypoint, replace `os.environ["PAYMENT_MANAGER_ARN"]` with `os.environ["AGENTCORE_PAYMENT_MYPAYMENTMANAGER_MANAGER_ARN"]`. `agentcore deploy` sets this variable on the Python HTTP Runtimes in the project and grants their execution roles payment access to the manager.  
Set `SESSION_ID` and `INSTRUMENT_ID` to the IDs from the preceding steps. Invoke the agent with these values as request headers. The Runtime passes the headers to the agent only if its request header allowlist includes them, as set up in Step 3. Replace `MyRuntime` with your project’s Runtime name.  

```
agentcore invoke --runtime MyRuntime \
    --payload '{"prompt":"Access the premium endpoint at https://example-x402-merchant.com/paid-api"}' \
    --header "X-Amzn-Bedrock-AgentCore-Runtime-Custom-Payment-Session-Id: $SESSION_ID" \
    --header "X-Amzn-Bedrock-AgentCore-Runtime-Custom-Payment-Instrument-Id: $INSTRUMENT_ID"
```
These are application-defined headers. The entrypoint in the AgentCore SDK example reads them and supplies their values to the payment plugin. The CLI’s `--session-id` option identifies a Runtime session, not a payment session.
Add `bedrock-agentcore[strands-agents]` to your agent’s dependencies. If you don’t deploy the Runtime with the AgentCore CLI, set `PAYMENT_MANAGER_ARN` in the Runtime’s environment to the manager ARN from Step 3, and make sure that its execution role can access that manager. The Runtime must also allow the two payment headers in its request header allowlist. This IAM example uses `test-user-123`, the payment user from the preceding steps.  
The following Runtime entrypoint reads the payment headers and configures a Strands agent for each request. The plugin provides the HTTP request tool and handles its x402 responses.  

```
import os

from strands import Agent
from bedrock_agentcore.payments.integrations.strands import (
    AgentCorePaymentsPlugin,
    AgentCorePaymentsPluginConfig,
)
from bedrock_agentcore.runtime import BedrockAgentCoreApp, RequestContext

app = BedrockAgentCoreApp()
HEADER_PREFIX = "x-amzn-bedrock-agentcore-runtime-custom-"


@app.entrypoint
def invoke(payload: dict, context: RequestContext) -> dict:
    headers = {
        key.lower(): value
        for key, value in (context.request_headers or {}).items()
    }
    session_id = headers.get(HEADER_PREFIX + "payment-session-id", "").strip()
    instrument_id = headers.get(HEADER_PREFIX + "payment-instrument-id", "").strip()
    if not session_id or not instrument_id:
        raise ValueError("Payment session and instrument headers are required.")

    config = AgentCorePaymentsPluginConfig(
        payment_manager_arn=os.environ["PAYMENT_MANAGER_ARN"],
        user_id="test-user-123",
        payment_session_id=session_id,
        payment_instrument_id=instrument_id,
        region="us-west-2",
        payment_tool_allowlist=["http_request"],
    )
    agent = Agent(plugins=[AgentCorePaymentsPlugin(config=config)])
    return {"result": str(agent(payload["prompt"]))}


if __name__ == "__main__":
    app.run()
```
For standalone Strands agents and payment-error handling, see [Strands Agents](payments-framework-integrations.md#payments-framework-strands). To handle payment proof and retries yourself, see [Process a payment](payments-process-payment.md).
Call `process-payment` directly with an x402 payload (used when you handle payment orchestration yourself):  

```
aws bedrock-agentcore process-payment \
    --payment-manager-arn "$PAYMENT_MANAGER_ARN" \
    --payment-session-id "$SESSION_ID" \
    --payment-instrument-id "$INSTRUMENT_ID" \
    --payment-type "CRYPTO_X402" \
    --payment-input '{
        "cryptoX402": {
            "version": "2",
            "payload": {
                "scheme": "exact",
                "network": "eip155:84532",
                "amount": "100000",
                "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
                "payTo": "0xMERCHANT_ADDRESS",
                "maxTimeoutSeconds": 300,
                "extra": {"name": "USDC", "version": "2"}
            }
        }
    }' \
    --client-token "$(uuidgen)" \
    --region us-west-2
```
For the complete request and response schema, see [ProcessPayment](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_ProcessPayment.html) in the API Reference.
If your application handles the merchant’s HTTP 402 response directly, call `process_payment` with its payment requirements. Replace the example requirements below with those returned by the merchant.  

```
import uuid

payment = dp_client.process_payment(
    userId="test-user-123",
    paymentManagerArn=PAYMENT_MANAGER_ARN,
    paymentSessionId=SESSION_ID,
    paymentInstrumentId=INSTRUMENT_ID,
    paymentType="CRYPTO_X402",
    paymentInput={
        "cryptoX402": {
            "version": "2",
            "payload": {
                "scheme": "exact",
                "network": "eip155:84532",
                "amount": "100000",
                "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
                "payTo": "0xMERCHANT_ADDRESS",
                "maxTimeoutSeconds": 300,
                "extra": {"name": "USDC", "version": "2"},
            },
        }
    },
    clientToken=str(uuid.uuid4()),
)
print(payment["paymentOutput"])
```
For the complete request and response schema of the underlying API call, see [ProcessPayment](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_ProcessPayment.html) in the API Reference.

### Verify the payment
<a name="payments-getting-started-verify"></a>

After the agent processes a payment, check the session to confirm the transaction was recorded:

**Example**  

```
session = manager.get_payment_session(
    user_id="test-user-123",
    payment_session_id=SESSION_ID
)
available = session["availableLimits"]["availableSpendAmount"]
print(f"Remaining: {available['value']} {available['currency']}")
```
You can also check the instrument balance:  

```
balance = manager.get_payment_instrument_balance(
    user_id="test-user-123",
    payment_connector_id=PAYMENT_CONNECTOR_ID,
    payment_instrument_id=INSTRUMENT_ID,
    chain="BASE_SEPOLIA",
    token="USDC",
)
token_balance = balance["tokenBalance"]
print(f"Wallet balance: {token_balance['amount']} {token_balance['token']}")
```

```
aws bedrock-agentcore get-payment-session \
    --payment-manager-arn "$PAYMENT_MANAGER_ARN" \
    --payment-session-id "$SESSION_ID" \
    --region us-west-2

aws bedrock-agentcore get-payment-instrument-balance \
    --payment-manager-arn "$PAYMENT_MANAGER_ARN" \
    --payment-connector-id "$PAYMENT_CONNECTOR_ID" \
    --payment-instrument-id "$INSTRUMENT_ID" \
    --user-id "test-user-123" \
    --chain BASE_SEPOLIA \
    --token USDC \
    --region us-west-2
```

```
from decimal import Decimal

session = dp_client.get_payment_session(
    paymentManagerArn=PAYMENT_MANAGER_ARN,
    paymentSessionId=SESSION_ID
)["paymentSession"]
limit = session["limits"]["maxSpendAmount"]
available = session["availableLimits"]["availableSpendAmount"]
spent = Decimal(limit["value"]) - Decimal(available["value"])
print(f"Amount spent: {spent} {limit['currency']}")
```
You can also check the instrument balance:  

```
balance = dp_client.get_payment_instrument_balance(
    paymentManagerArn=PAYMENT_MANAGER_ARN,
    paymentConnectorId=PAYMENT_CONNECTOR_ID,
    paymentInstrumentId=INSTRUMENT_ID,
    chain="BASE_SEPOLIA",
    token="USDC",
)
token_balance = balance["tokenBalance"]
print(f"Wallet balance: {token_balance['amount']} {token_balance['token']}")
```

## Troubleshooting
<a name="payments-getting-started-troubleshooting"></a>

The following issues apply to both the skill-based and manual setup paths.


| Issue | Solution | 
| --- | --- | 
| Payment Manager stuck in CREATING | Wait up to 2 minutes. If it moves to CREATE\_FAILED, check that your service role ARN and permissions are correct. | 
| "PaymentInstrument not active" | The end user must fund the wallet and grant signing permissions through the redirect URL before the agent can transact. | 
| "Session expired or budget exceeded" | Create a new payment session with a longer expiry or higher spending limit. | 
| "CredentialProvider not found" | Verify the credential provider ARN matches what you created in Step 2. Ensure the region is consistent across all calls. | 
| ProcessPayment returns FAILED | Check that the wallet has sufficient USDC balance for the transaction amount plus gas fees. | 

## Cleanup
<a name="payments-getting-started-cleanup"></a>

Delete the resources you created during this tutorial:

**Example**  

```
agentcore remove payment-manager --name MyPaymentManager
agentcore remove credential --name my_coinbase_credentials
agentcore deploy
```
Removing the payment manager also removes its connectors. If you used the manual flow, remove the credential you added in Step 3 (`my_coinbase_credentials` or `my_privy_credentials`). Quick create adds no credential to your project, so skip that command. The `remove` commands update the local configuration. The follow-up `deploy` tears down the payment infrastructure in your account.

```
from bedrock_agentcore.payments.client import PaymentClient

payment_client = PaymentClient(region_name="us-west-2")

payment_client.delete_payment_manager(
    payment_manager_id="<paymentManagerId>"
)

print("Payment Manager deleted.")
```

```
aws bedrock-agentcore delete-payment-instrument \
    --payment-manager-arn "$PAYMENT_MANAGER_ARN" \
    --payment-connector-id "$PAYMENT_CONNECTOR_ID" \
    --payment-instrument-id "$INSTRUMENT_ID" \
    --region us-west-2

aws bedrock-agentcore-control delete-payment-connector \
    --payment-manager-id "$PAYMENT_MANAGER_ID" \
    --payment-connector-id "$PAYMENT_CONNECTOR_ID" \
    --region us-west-2

aws bedrock-agentcore-control delete-payment-manager \
    --payment-manager-id "$PAYMENT_MANAGER_ID" \
    --region us-west-2

# Manual flow only: delete the credential provider from Step 2 (my-privy-credentials for Privy)
aws bedrock-agentcore-control delete-payment-credential-provider \
    --name "my-coinbase-credentials" \
    --region us-west-2
```

```
# Delete payment instrument
dp_client.delete_payment_instrument(
    paymentManagerArn=PAYMENT_MANAGER_ARN,
    paymentConnectorId=PAYMENT_CONNECTOR_ID,
    paymentInstrumentId=INSTRUMENT_ID
)

# Delete payment connector
client.delete_payment_connector(
    paymentManagerId=PAYMENT_MANAGER_ID,
    paymentConnectorId=PAYMENT_CONNECTOR_ID
)

# Delete payment manager
client.delete_payment_manager(
    paymentManagerId=PAYMENT_MANAGER_ID
)

# Manual flow only: delete the credential provider from Step 2 (my-privy-credentials for Privy)
client.delete_payment_credential_provider(name="my-coinbase-credentials")

print("All payment resources deleted.")
```

## What you’ve built
<a name="payments-getting-started-what-youve-built"></a>

Through this tutorial, you created:
+  **PaymentCredentialProvider** — Payment provider credentials stored in AgentCore Identity
+  **PaymentManager** — Top-level resource coordinating payment operations
+  **PaymentConnector** — Integration between your manager and the external payment provider
+  **PaymentInstrument** — An embedded crypto wallet, funded and authorized by the end user
+  **PaymentSession** — A time-bounded, budget-limited payment context
+  **Strands Agent** — An AI agent that handles x402 payments automatically

## Next steps
<a name="payments-getting-started-next-steps"></a>
+  [Connect to Coinbase x402 Bazaar](payments-connect-bazaar.md) to discover 10,000\+ paid MCP tools.
+  [Integrate with Browser Tool](payments-browser.md) to access paywalled websites.
+  [Enable observability](payments-observability.md) to monitor payment operations in CloudWatch.
+  [Review IAM roles](payments-iam-roles.md) to configure least-privilege access for production.