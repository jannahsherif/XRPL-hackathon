

# Security in Amazon Bedrock AgentCore payments
<a name="payments-security-best-practices"></a>

The following best practices can help you prevent security incidents when using Amazon Bedrock AgentCore payments. Preventative controls stop unsafe actions before they happen. Detective controls surface unexpected activity so you can respond to it.

## Preventative controls
<a name="payments-security-preventative"></a>

Use these controls to constrain what your agent can do and to keep sensitive material out of its reach.

### Enforce least privilege with the five-role IAM pattern
<a name="payments-security-least-privilege"></a>

AgentCore payments separates the control plane from the data plane by using distinct IAM roles. Set up IAM permissions based on the persona that matches each role. With this pattern, no single role can both raise a budget and spend against it.


| \# | Role | Purpose | 
| --- | --- | --- | 
| 1 |  `ControlPlaneRole`  | Administers the service. | 
| 2 |  `ManagementRole`  | Configures sessions. This role is explicitly denied `ProcessPayment`. | 
| 3 |  `ProcessPaymentRole`  | Executes payments. | 
| 4 |  `ResourceRetrievalRole`  | Service-assumed. Fetches session and credential state. | 
| 5 |  `AWSMarketplaceManageSubscriptions` (on `ControlPlaneRole`) | For Coinbase, subscribes the account to the Marketplace listing. An AWS managed policy on the administrator, not a separate assumable role. | 

For more information, see [IAM roles for AgentCore payments](payments-iam-roles.md).

### Store credentials in AgentCore Identity
<a name="payments-security-credentials"></a>

Never embed wallet provider credentials in agent code or environment variables.
+ Store Coinbase CDP or Stripe (Privy) credentials as a `PaymentCredentialProvider` in AgentCore Identity.
+ The service retrieves them at runtime by using `ResourceRetrievalRole`.
+ Rotate credentials on the wallet provider’s recommended schedule. If a credential is compromised, revoke it immediately.
+ For a Coinbase connector created with **Quick create**, the credentials are service-managed. Rotate them with `RotatePaymentConnectorCredentials` instead of generating keys in the Coinbase Developer Platform. For more information, see the next section.

For more information, see [AgentCore Identity](identity.md).

### Rotate service-managed connector credentials
<a name="payments-rotate-connector-credentials"></a>

When you create a Coinbase connector with **Quick create**, AgentCore payments issues the Coinbase CDP API key and Wallet secret for you and stores them as a payment credential provider in AgentCore Identity, which holds the secret material in AWS Secrets Manager. Because the service owns these credentials, you can replace them on demand with `RotatePaymentConnectorCredentials`, without signing in to the Coinbase Developer Platform or handling key material yourself.

A connector has two service-managed secrets, and you rotate each one for different reasons. Rotate the API key as routine maintenance. Rotate the Wallet secret only when it is compromised or lost. For more information, see [Choose which credentials to rotate](#payments-rotate-secrets).

**Note**  
Rotate credentials from the console, the AgentCore CLI (`agentcore payment connector rotate-credentials`), the AWS CLI, or the AWS SDKs.

#### Check whether a connector is eligible
<a name="payments-rotate-eligibility"></a>

Rotation applies only to connectors whose credentials the service manages. The connector’s `provisionMode` field tells you which case you are in:


|  `provisionMode`  | How to rotate | 
| --- | --- | 
|  `QUICK_CREATE`  | Amazon Bedrock AgentCore provisioned the credentials, so they are service-managed. Call `RotatePaymentConnectorCredentials`. | 
|  `MANUAL`  | You provided the credentials, so you own them. Rotate them with the payment provider first, and then call `UpdatePaymentCredentialProvider` with the new values. | 

 `GetPaymentConnector` and `ListPaymentConnectors` return `provisionMode` and are the authoritative source for it. `GetPaymentConnector` also returns `credentialsUpdatedAt`, the timestamp when the connector’s current service-managed credentials took effect. The service seeds this timestamp with the initial provisioning time and updates it on each rotation. Use it to track credential age. It is absent for `MANUAL` connectors.

In the console, `provisionMode` appears as the **Creation type** column, which shows **Quick Create** or **Manual**. You can find it in the following places:
+ On the **Payments** page, expand a Payment Manager row to list its connectors, and then check the **Creation type** column for the connector.
+ On the Payment Manager details page, in the **Payment connectors** section, check the **Creation type** column.
+ On the connector details page, in the **Payment auth** section, check **Creation type**. This section also shows **Last credentials rotated date**, which is the console equivalent of `credentialsUpdatedAt`.

#### Choose which credentials to rotate
<a name="payments-rotate-secrets"></a>

For a Coinbase CDP connector, `credentialsToRotate` takes the `coinbaseCDP` member with one or both of the following secrets. The two secrets serve different purposes and carry different risk, so rotate them separately and for different reasons.


| Secret | When to rotate it | What it affects | 
| --- | --- | --- | 
|  `API_KEY`  | Rotate the Coinbase CDP API key ID and API key secret as routine maintenance, on a regular schedule, and immediately if you suspect that the key was exposed. | The API key authenticates requests to Coinbase. Amazon Bedrock AgentCore registers the replacement key before it removes the previous one, so payment processing is not interrupted. | 
|  `WALLET_SECRET`  | Rotate the Wallet secret only if it is compromised or lost. It is not part of routine maintenance. | The Wallet secret signs wallet write operations, so rotating it affects transaction signing. Coinbase replaces the Wallet secret in place rather than adding a second one, so expect up to one minute during which `ProcessPayment` calls can fail. A Coinbase CDP project has a single Wallet secret, so rotation affects every connector that uses the same project. | 

Rotation replaces the secret on the connector’s payment credential provider. Every connector that uses the same payment auth is affected, not only the connector that you named in the request.

#### How rotation works
<a name="payments-rotate-how"></a>

Rotation is synchronous. The operation finishes the rotation before it returns a response, and it rotates only one set of credentials at a time for a given connector. When a secret rotates successfully, the new secret takes effect immediately and the connector stays in the `READY` state. When a secret fails to rotate, the response includes an error and the secret keeps its current value. You can retry the request.

The response returns the connector’s identifiers, its `status` (which is `READY` after a successful rotation), and `lastUpdatedAt`:

```
{
  "paymentManagerId": "<paymentManagerId>",
  "paymentConnectorId": "<paymentConnectorId>",
  "status": "READY",
  "lastUpdatedAt": "2025-11-04T18:22:41.507000+00:00"
}
```

After a rotation, call `GetPaymentConnector` and confirm that `credentialsUpdatedAt` advanced. Then replace any copy of the previous secret that you use outside Amazon Bedrock AgentCore.

 `RotatePaymentConnectorCredentials` is idempotent. Supply a `clientToken` when you want to retry a request safely, for example from an automated rotation job. Retrying with the same token returns the result of the original rotation instead of issuing another secret.

#### Rotate the API key
<a name="payments-rotate-api-key"></a>

Rotate the API key as routine maintenance. Amazon Bedrock AgentCore registers the replacement key with Coinbase before it removes the previous one, so payment processing continues while the rotation runs.

**Example**  

1. Open the [Amazon Bedrock AgentCore console](https://console.aws.amazon.com/bedrock-agentcore/).

1. In the navigation pane, under **Build**, choose **Payments**.

1. Choose the Payment Manager that owns the connector. In the **Payment connectors** section, choose the connector.

1. On the connector details page, choose **Rotate credentials**, and then choose **Rotate API secrets**.
**Note**  
 **Rotate credentials** appears only for connectors that were created with **Quick create**. If the connector uses credentials that you provided, rotate them with Coinbase instead. For more information, see [Check whether a connector is eligible](#payments-rotate-eligibility).

1. In the **Rotate API secrets** dialog box, review the warning. Rotation deletes the current API secrets and creates new ones by using the Coinbase account that you linked with this payment auth. All connectors that use this payment auth are also affected.

1. Choose **Rotate**. The console displays a message that rotation can take up to one minute. When rotation finishes, a success message confirms that the API secrets were rotated.
Confirm that the connector is eligible, and note its current `credentialsUpdatedAt` value:  

```
aws bedrock-agentcore-control get-payment-connector \
  --payment-manager-id <paymentManagerId> \
  --payment-connector-id <paymentConnectorId> \
  --region us-east-1
```
Rotate the API key:  

```
aws bedrock-agentcore-control rotate-payment-connector-credentials \
  --payment-manager-id <paymentManagerId> \
  --payment-connector-id <paymentConnectorId> \
  --credentials-to-rotate '{"coinbaseCDP": {"secrets": ["API_KEY"]}}' \
  --region us-east-1
```
After checking [connector eligibility](#payments-rotate-eligibility), rotate its service-managed API key:  

```
agentcore payment connector rotate-credentials \
  --manager-id <paymentManagerId> \
  --connector-id <paymentConnectorId> \
  --secrets API_KEY \
  --region us-east-1
```
 `--secrets` selects credential kinds, not new secret values. The service creates the replacement.

```
import boto3

client = boto3.client("bedrock-agentcore-control", region_name="us-east-1")

connector = client.get_payment_connector(
    paymentManagerId="<paymentManagerId>",
    paymentConnectorId="<paymentConnectorId>"
)

# Rotation applies only to connectors with service-managed credentials.
if connector.get("provisionMode") != "QUICK_CREATE":
    raise RuntimeError(
        "This connector uses credentials that you provided. Rotate them with the "
        "payment provider, and then call update_payment_credential_provider."
    )

response = client.rotate_payment_connector_credentials(
    paymentManagerId="<paymentManagerId>",
    paymentConnectorId="<paymentConnectorId>",
    credentialsToRotate={"coinbaseCDP": {"secrets": ["API_KEY"]}}
)

print(f"Status: {response['status']}")
print(f"Rotation completed at: {response['lastUpdatedAt']}")
```

#### Rotate the Wallet secret
<a name="payments-rotate-wallet-secret"></a>

Rotate the Wallet secret only if it is compromised or lost. A Coinbase CDP project holds a single Wallet secret and Coinbase replaces it in place, so rotation affects transaction signing for every connector that uses the same Coinbase CDP project.

**Important**  
Expect up to one minute of downtime for the `ProcessPayment` API while the Wallet secret rotates. Plan the rotation for a period of low payment activity, and make sure that your agent handles failed payments gracefully.

**Example**  

1. Open the [Amazon Bedrock AgentCore console](https://console.aws.amazon.com/bedrock-agentcore/).

1. In the navigation pane, under **Build**, choose **Payments**.

1. Choose the Payment Manager that owns the connector. In the **Payment connectors** section, choose the connector.

1. On the connector details page, choose **Rotate credentials**, and then choose **Rotate wallet secrets**.

1. In the **Rotate wallet secrets** dialog box, review the warning. Rotation deletes the current Wallet secret and creates a new one by using the Coinbase account that you linked with this payment auth. All connectors that use this payment auth are also affected. Expect up to one minute of downtime for the `ProcessPayment` API.

1. Choose **Rotate**. The console displays a message that rotation can take up to one minute. When rotation finishes, a success message confirms that the Wallet secret was rotated.

```
aws bedrock-agentcore-control rotate-payment-connector-credentials \
  --payment-manager-id <paymentManagerId> \
  --payment-connector-id <paymentConnectorId> \
  --credentials-to-rotate '{"coinbaseCDP": {"secrets": ["WALLET_SECRET"]}}' \
  --region us-east-1
```
Confirm that payments succeed after the rotation, because the Wallet secret signs every wallet write operation.

```
agentcore payment connector rotate-credentials \
  --manager-id <paymentManagerId> \
  --connector-id <paymentConnectorId> \
  --secrets WALLET_SECRET \
  --region us-east-1
```
The same eligibility and downtime requirements apply. Confirm that payments succeed after the rotation.

```
response = client.rotate_payment_connector_credentials(
    paymentManagerId="<paymentManagerId>",
    paymentConnectorId="<paymentConnectorId>",
    credentialsToRotate={"coinbaseCDP": {"secrets": ["WALLET_SECRET"]}}
)

print(f"Status: {response['status']}")
print(f"Rotation completed at: {response['lastUpdatedAt']}")
```

#### Rotate both secrets in one request
<a name="payments-rotate-both"></a>

You can also list both secrets in a single request. Amazon Bedrock AgentCore then rotates them one after another in the same request, starting with the API key and followed by the Wallet secret. The same downtime consideration for the Wallet secret applies.

Because the two rotations run in sequence, a failure partway through can leave the API key already rotated while the Wallet secret keeps its current value. The response reports the error. Retry the request to finish the remaining secret.

To keep the two rotations independent, send a separate request for each secret. This is what the console does.

**Example**  

```
aws bedrock-agentcore-control rotate-payment-connector-credentials \
  --payment-manager-id <paymentManagerId> \
  --payment-connector-id <paymentConnectorId> \
  --credentials-to-rotate '{"coinbaseCDP": {"secrets": ["API_KEY", "WALLET_SECRET"]}}' \
  --region us-east-1
```

```
agentcore payment connector rotate-credentials \
  --manager-id <paymentManagerId> \
  --connector-id <paymentConnectorId> \
  --secrets API_KEY WALLET_SECRET \
  --region us-east-1
```
Pass the credential kinds as space-separated values. You can add `--client-token <token>` for idempotent retries; reuse that token only when retrying the same request.

```
response = client.rotate_payment_connector_credentials(
    paymentManagerId="<paymentManagerId>",
    paymentConnectorId="<paymentConnectorId>",
    credentialsToRotate={
        "coinbaseCDP": {"secrets": ["API_KEY", "WALLET_SECRET"]}
    }
)
```

#### Errors
<a name="payments-rotate-errors"></a>


| Error | Cause | 
| --- | --- | 
|  `ValidationException`  | The request is not valid for this connector. This includes selecting a secret that the connector does not use, passing an empty secret list, and calling the operation on a connector whose credentials you provided yourself. | 
|  `ConflictException`  | A rotation is already running for this connector, or the connector is not in a state that accepts a rotation. Wait for the connector to return to `READY` and retry. | 
|  `ResourceNotFoundException`  | The payment manager or the payment connector does not exist in this account and AWS Region. | 
|  `AccessDeniedException`  | The caller is not authorized to call `RotatePaymentConnectorCredentials` on the payment manager. See [IAM roles for AgentCore payments](payments-iam-roles.md). | 
|  `ThrottlingException`  | The request was throttled. Retry with exponential backoff. | 

For the complete request and response schema, see [RotatePaymentConnectorCredentials](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_RotatePaymentConnectorCredentials.html) in the API Reference.

### Set the UserId header correctly
<a name="payments-security-userid-header"></a>

On an IAM-configured inbound authorization payment manager, your backend asserts the `X-Amzn-Bedrock-AgentCore-Payments-User-Id` header, and AgentCore payments does **not** verify it. You are responsible for setting this value correctly.

AgentCore payments verifies the IAM caller and the JWT (when using OAuth), but the correctness of the `UserId` header on API calls is your responsibility. Do not let end users or agents influence this header directly.

### Secure multi-tenant deployments
<a name="payments-security-multi-tenant"></a>

For multi-tenant deployments that serve multiple end users, use the `CUSTOM_JWT` (OAuth) authorization type in the payment manager. This provides the service with a verified end-user identity. With the IAM-configured payment manager, AgentCore payments does not verify end-user identity.

### Require explicit end-user consent and delegation
<a name="payments-security-consent"></a>

Funding and delegation are two separate end-user decisions, and both are made out-of-band from the agent:
+  **Funding** – The end user deposits funds through the wallet provider portal. The agent has no API access to funding and must never prompt for it or auto-initiate it.
+  **Delegation** – The end user grants permission through Coinbase Spend Permissions or Privy Delegated Actions. Do not assume delegation is permanent, because users can revoke it at any time. Handle revoked delegation gracefully.

### Keep the agent isolated from payment instruments
<a name="payments-security-isolation"></a>

The agent must never access card numbers, CVV values, bank details, or wallet private keys. The agent’s view stops at "a permission to spend from a user-owned wallet."
+ Wallet keys are held by the provider in self-custody—not by AWS or the developer.
+ Never pass payment instrument details through prompts, tool inputs, or context windows.

### Scope tool access with Policy in AgentCore
<a name="payments-security-policy"></a>

For tool-level authorization, expose paid endpoints through Amazon Bedrock AgentCore Gateway. Every call through the Gateway is intercepted by Policy in AgentCore, a Cedar-based engine that evaluates the request—including the agent’s identity, the tool name, and the parameters—and decides whether to allow it.

Policy and payment sessions cover different decisions:
+  **Policy** controls *who* calls *which tool* with *what parameters*.
+  **Payment sessions** control *how much* can be spent and *for how long*.

Together, they give you orthogonal levers for tool access and spend amount.
+ Write Cedar policies scoped by agent identity, user group, and request parameters.
+ Deny access to high-cost tools for agents that don’t require them.
+ Review and audit policies regularly as your tool catalog changes.

For more information, see [Policy in AgentCore](policy.md).

### Use payment sessions with budget limits and TTL
<a name="payments-security-sessions"></a>

Every payment runs inside a payment session that has a maximum spend amount and an expiry time. The infrastructure layer enforces these limits, so prompt injection and model non-determinism cannot override them.
+ Set `maxSpendAmount` to the minimum needed for the task, and set a short TTL.
+ Start with conservative budgets and raise them only as the agent proves reliable.
+ Failed signings automatically roll back budget deductions.

For more information, see [Create a payment session](payments-create-session.md).

### Validate and restrict payTo addresses
<a name="payments-security-payto"></a>

The `payTo` address specifies the recipient wallet. AgentCore payments does not enforce `payTo` restrictions server-side, so your application must validate the address before calling the `ProcessPayment` API.
+  **Maintain an allowlist** of pre-verified merchant addresses, and reject unknown addresses.
+  **Never let the model generate payTo addresses.** They must come from a trusted source, such as an x402 payment request or a verified registry.
+  **Validate against the expected merchant** when processing x402 responses.
+  **Prefer AgentCore Gateway** for endpoint discovery, because it provides verified `payTo` addresses through the x402 Bazaar.
+  **Apply Cedar policies** to constrain which addresses an agent can pay.
+  **Don’t cache addresses across sessions.** Always use the current merchant-provided address, validated against your allowlist.
+  **Recipient screening.** Session limits bound how much an agent can spend, not who it can pay. Use a wallet policy to deny payments to specific recipients. For Stripe (Privy), follow the [sanctions screening for payments](https://docs.privy.io/recipes/agent-integrations/x402-sanctions-screening) guidance on the Privy website. Coinbase automatically screens all transactions against the OFAC sanctions list.
+  **Use payment provider policies** to restrict wallet actions such as signing and transfer. For more information, see the [Stripe (Privy) policies documentation](https://docs.privy.io/controls/policies/overview) on the Privy website and the [Coinbase security and policies documentation](https://docs.cdp.coinbase.com/wallets/security-and-policies/security-overview) on the Coinbase website.

### Secure network access
<a name="payments-security-network"></a>
+ Use VPC endpoints to keep traffic off the public internet.
+ Apply endpoint policies and IAM conditions (`aws:sourceVpc`, `aws:sourceVpce`) to restrict origins.
+ Enable AWS CloudTrail for all AgentCore payments API calls.

### Design for payment failure and rollback
<a name="payments-security-failure"></a>
+ Implement idempotency to prevent duplicate payments on retries.
+ Handle payment failures with clear fallback behavior. Don’t retry indefinitely.
+ Monitor for partial failures and implement compensating transactions.

## Detective controls
<a name="payments-security-detective"></a>

Use these controls to observe payment activity and surface anomalies so you can respond to them.

### Enable observability and audit logging
<a name="payments-security-observability"></a>

AgentCore payments provides automatic observability through Amazon CloudWatch:
+  **Vended logs** – Every data plane call is logged (who, what, how much, and to whom).
+  **Vended spans** – Full payment lifecycle traces are available in AWS X-Ray.
+ Set alarms for anomalous spending patterns, such as payments to unlisted addresses, an unusually large number of distinct recipients, or sudden address changes for known merchants.
+ Retain logs according to your compliance requirements.
+ Don’t rely on agent code to log its own actions.

For more information, see [Observability with Amazon CloudWatch](payments-observability.md).

### Regularly review configurations
<a name="payments-security-review"></a>
+ Audit budgets and reduce limits for agents that underspend.
+ Review Cedar policies and IAM roles quarterly.
+ Monitor wallet provider dashboards for unexpected delegation or funding activity.