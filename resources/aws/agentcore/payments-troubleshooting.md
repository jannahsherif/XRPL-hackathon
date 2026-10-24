

# Troubleshooting AgentCore payments
<a name="payments-troubleshooting"></a>

This section provides solutions to common errors when using AWS Amazon Bedrock AgentCore payments.

## Validation errors
<a name="payments-troubleshooting-validation"></a>

When creating or updating payment resources, the service returns a `ValidationException`. The following table lists common validation errors and their resolutions.


| Error message | Resolution | 
| --- | --- | 
|  `roleArn must contain a valid account ID`  | The `roleArn` must be a valid IAM role ARN with a 12-digit account ID. Verify the format: `arn:aws:iam::<accountId>:role/<roleName>`. | 
|  `roleArn must belong to your account`  | The account ID in `roleArn` must match the caller’s account. Cross-account roles are not supported. | 
|  `Invalid role ARN: {roleArn}`  | The `roleArn` could not be parsed. Verify the ARN format. | 
|  `credentialProviderConfigurations list cannot be empty`  | Provide at least one credential provider configuration when creating or updating a payment connector. | 
|  `credentialProviderArn is required but not found in the request`  | Each credential provider configuration must include a `credentialProviderArn`. Create one first using [Create a Credential Provider](resource-providers.md). | 
|  `Connector type '{type}' does not match the provided credentialProviderConfiguration`  | The credential provider configuration variant must match the connector type. For example, a `CoinbaseCDP` connector requires the `coinbaseCDP` configuration, not `stripePrivy`. | 

Field naming constraints are also enforced:
+ Payment manager names must start with a letter and contain only alphanumeric characters (max 48 characters).
+ Payment connector names follow the same rules but also allow underscores.
+ Descriptions allow alphanumeric characters and spaces (max 4096 characters).

## Permission errors
<a name="payments-troubleshooting-permissions"></a>


| Error message | Resolution | 
| --- | --- | 
|  `Access denied due to account security restrictions. Contact AWS Support for assistance.`  | Your account has been restricted. Contact AWS Support to resolve. | 
|  `Access denied for {CREATE\|UPDATE} due to account security restrictions. Contact AWS Support for assistance.`  | Your account is in a limited access state. Read and list operations are allowed, but create and update operations are restricted until the restriction is resolved. | 
| IAM SigV4 authorization failures | Ensure the calling principal has the appropriate `bedrock-agentcore:` permissions. The service uses SigV4 signing with the `bedrock-agentcore` signing name. | 
| PassRole failures | When providing a `roleArn`, the caller must have `iam:PassRole` permission for the role. The role’s trust policy must allow `bedrock-agentcore.amazonaws.com` as a service principal. | 

## AWS Marketplace subscription errors
<a name="payments-troubleshooting-subscription"></a>

When you use Coinbase as a payment provider, your account must have an active subscription to the **Coinbase Wallets for AgentCore Payments** listing in AWS Marketplace. If the subscription is missing, the service returns a `SubscriptionRequiredException` with an HTTP 403 status code.

This error is enforced in two places:
+ When you create a Coinbase payment connector with `CreatePaymentConnector`.
+ When you perform a Coinbase wallet operation on the data plane, such as `CreatePaymentInstrument` or `ProcessPayment`.

The exception includes a `subscriptionUrl` field with a link to the AWS Marketplace listing and a `productName` field that identifies the product requiring a subscription.


| Error message | Resolution | 
| --- | --- | 
|  `SubscriptionRequiredException` (HTTP 403) | Your account does not have an active AWS Marketplace subscription for Coinbase. To resolve:1.  Open the AWS Marketplace listing at the `subscriptionUrl` returned in the error, or go to the [Coinbase Wallets for AgentCore Payments](https://aws.amazon.com/marketplace/pp/prodview-ia2zd5puqyi7g) listing. <br />2.  Subscribe to the listing. The subscribing identity needs the `AWSMarketplaceManageSubscriptions` permissions. <br />3.  After the subscription is active, retry the operation. <br />For more information, see [Subscribe to Coinbase Wallets for AgentCore Payments in AWS Marketplace](payments-marketplace-subscription.md). | 

## Quick create authorization errors
<a name="payments-troubleshooting-quick-create"></a>

Quick create lets you set up a Coinbase payment connector without managing credentials yourself. When you call `CreatePaymentConnector`, the service returns an `authorizationUrl`. Open the URL (or provide it to your application’s users) to complete the Coinbase authorization. During this flow, the connector moves through the following Quick-create-specific statuses:
+  `PENDING_AUTHENTICATION` — The connector is waiting for you (or your application’s user) to complete the Coinbase authorization.
+  `PROVISIONING` — The authorization is complete and the service is provisioning the connector.
+  `AUTHENTICATION_EXPIRED` — The `authorizationUrl` expired before the authorization was completed.
+  `AUTHENTICATION_FAILED` — The Coinbase authorization did not succeed.

The following table lists common Quick create authorization issues and their resolutions.


| Connector status | Resolution | 
| --- | --- | 
| Connector stuck in `PENDING_AUTHENTICATION`  | The Quick create authorization has not been completed. To resolve:1.  Open the `authorizationUrl` returned by `CreatePaymentConnector`. <br />2.  Sign in and complete the Coinbase authorization.  | 
| Connector in `AUTHENTICATION_EXPIRED`  | The `authorizationUrl` expired, which happens about 10 minutes after `CreatePaymentConnector` returns it. To resolve:1.  Re-create the connector with `CreatePaymentConnector` to get a fresh `authorizationUrl`. <br />2.  Open the new `authorizationUrl` and complete the Coinbase authorization promptly.  | 

## Resource not found errors
<a name="payments-troubleshooting-not-found"></a>


| Error message | Resolution | 
| --- | --- | 
|  `Payment manager not found: {managerId}`  | The specified payment manager does not exist. Verify the ID by calling `ListPaymentManagers`. | 
|  `Payment connector not found: connectorId={connectorId}, managerId={managerId}`  | The specified connector does not exist under the given manager. Verify both IDs using `ListPaymentConnectors`. | 
| Resource not found during `CreatePaymentConnector`  | The parent payment manager does not exist. Create the payment manager first. | 

## Conflict errors
<a name="payments-troubleshooting-conflict"></a>

The service returns a `ConflictException` when two requests modify the same resource at the same time, or when creating a resource that already exists. Retry the request. Create and update operations support a `clientToken` for safe retries.

## Service quota errors
<a name="payments-troubleshooting-quota"></a>

The service returns `"{limitType} limit exceeded for account {accountId}"` when you reach the maximum number of payment managers or connectors for your account. Delete unused resources or contact AWS Support to request a limit increase.

## Throttling errors
<a name="payments-troubleshooting-throttling"></a>

The service returns `"Rate exceeded"` when the request rate exceeds the allowed limit. Implement exponential backoff with jitter in your retry logic. If you consistently hit limits, contact AWS Support.

## Payment processing errors
<a name="payments-troubleshooting-processing"></a>

If an external payment provider rejects the signing request, the service returns an `AccessDeniedException` or `ValidationException`. Payment processing also fails with a `SubscriptionRequiredException` if your account does not have an active AWS Marketplace subscription for Coinbase. The following table lists common errors and their resolutions.


| Error message | Resolution | 
| --- | --- | 
|  `Delegated signing grant is not active for the end user wallet. Please redirect end user to the WalletHub to grant the permissions.`  | You haven’t granted the delegation permission that allows your agent to sign transactions on your behalf, or you previously revoked it. To resolve:1.  Retrieve the WalletHub URL from the `CreatePaymentInstrument` or `GetPaymentInstrument` response body (`paymentInstrument.paymentInstrumentDetails.embeddedCryptoWallet.redirectUrl`). <br />2.  Redirect the user to the WalletHub. <br />3.  Sign in and grant signing permissions to the agent. <br />For more information about a frontend implementation that handles the delegation grant flow, see the [Coinbase AgentCore template](https://github.com/coinbase/cdp-agentcore-template) on the GitHub website. For more information about funding the wallet, see [Funding the wallet](payments-how-it-works.md#payments-how-it-works-funding-wallet). | 
|  `Delegated signing is not enabled for your Coinbase project. Please enable delegated signing in your Coinbase project policies.`  | Your Coinbase Developer Platform project does not have delegated signing configured. To resolve:1.  Sign in to the [Coinbase Developer Platform](https://docs.cdp.coinbase.com/api-reference/v2/authentication) on the Coinbase website. <br />2.  Navigate to your project’s **Policies** settings. <br />3.  Enable the **Delegated Signing** toggle. <br />You must complete this step before your agent can sign transactions on behalf of users. | 
|  `Privy credentials are invalid. Please verify the credential configuration.`  | Your credential provider has invalid or expired Privy wallet authorization keys. To resolve:1.  Sign in to the [Privy Dashboard](https://docs.privy.io/authentication/overview#api-authentication) on the Privy website. <br />2.  Navigate to your app’s settings and verify the authorization keys are active. <br />3.  Update the credential provider in AgentCore Identity with the current keys. To do this, call `UpdatePaymentConnector` or update the secret in AWS Secrets Manager. <br />For more information about credential configuration, see the [Privy AgentCore SDK](https://github.com/privy-io/aws-agentcore-sdk) on the GitHub website. | 
|  `SubscriptionRequiredException` (HTTP 403) | Your account does not have an active AWS Marketplace subscription for Coinbase. Processing a payment against a Coinbase wallet requires an active subscription, so this error can occur if the subscription was never created or was later cancelled. To resolve:1.  Subscribe to the [Coinbase Wallets for AgentCore Payments](https://aws.amazon.com/marketplace/pp/prodview-ia2zd5puqyi7g) listing, or open the AWS Marketplace listing at the `subscriptionUrl` returned in the error. <br />2.  After the subscription is active, retry the payment. <br />For more information, see [Subscribe to Coinbase Wallets for AgentCore Payments in AWS Marketplace](payments-marketplace-subscription.md) and [AWS Marketplace subscription errors](#payments-troubleshooting-subscription). | 

## x402 payment request errors
<a name="payments-troubleshooting-x402"></a>

When you process a payment with the x402 protocol, the service validates the payment payload that you forward in `paymentInput.cryptoX402` before it holds budget or signs. If the payload is malformed or unsupported, the service returns a `ValidationException` and consumes no budget. The following table lists common x402 payment request errors and their resolutions. A few rows describe runtime or settlement failures, such as a rejected Permit2 allowance transaction, that can occur after signing begins rather than during pre-signing validation.


| Error message | Resolution | 
| --- | --- | 
|  `X402 Payload for signing is invalid.`  | The x402 payment payload could not be parsed or validated. Copy the merchant’s x402 payload from the `402 Payment Required` response into `paymentInput.cryptoX402` exactly as received, without modification. | 
|  `Payment instrument network is required`  | The payment instrument does not specify a network. Create the payment instrument with a network that matches the merchant’s payment payload. | 
|  `Network mismatch '{network}' is not supported for paymentNetwork '{paymentNetwork}'. Supported networks: {networks}`  | The payment instrument’s network does not match the network in the payload. Use a payment instrument whose network matches the merchant’s payment request. | 
|  `Payment currency is required`  | The payload does not specify a currency. Forward the merchant’s payload verbatim. If the error persists, the merchant’s payload is malformed; contact the merchant. | 
|  `Currency '{currency}' is not supported. Supported currencies: {currencies}`  | The payload requests an unsupported currency. Use a merchant endpoint that requests a supported currency. | 
|  `Payment amount is required`  | The payload does not specify an amount. Forward the merchant’s payload verbatim. If the error persists, the merchant’s payload is malformed; contact the merchant. | 
|  `Payment amount must be a positive number. Received: {value}`  | The payload amount is not a positive number. Forward the merchant’s payload verbatim; do not modify the amount. | 
|  `Payment amount exceeds maximum allowed value. Received: {value}, Maximum: {max}`  | The payload amount is above the maximum allowed value. Use a merchant endpoint whose amount is within the allowed range. | 
|  `Payment asset is required`  | The payload does not specify an asset. Forward the merchant’s payload verbatim. If the error persists, the merchant’s payload is malformed; contact the merchant. | 
|  `Payment asset address is invalid. Expected valid address format for the specified network. Received: {value}`  | The payload asset address is not a valid address for the network. Forward the merchant’s payload verbatim; do not modify the asset address. | 
|  `Payment asset is not a supported USDC token address for network '{network}'. Received: {value}. Expected: {expected}`  | The payload requests a token other than the canonical USDC for the network. Use a merchant endpoint that requests canonical USDC, and verify that the payment instrument’s network matches the payload. | 
|  `Payment scheme is required`  | The payload does not specify a scheme. Forward the merchant’s payload verbatim. If the error persists, the merchant’s payload is malformed; contact the merchant. | 
|  `Payment scheme not supported. Supported scheme: {scheme}`  | The payload requests an unsupported scheme. AgentCore payments supports the `exact` and `upto` schemes. See [Pay an x402 payment request](payments-process-payment.md#payments-process-payment-x402). | 
|  `Payment scheme 'upto' is only supported on x402 protocol version 2`  | The `upto` scheme requires x402 protocol version 2. Set `version` to `2` in `paymentInput.cryptoX402`, or use a merchant endpoint that supports version 2. | 
|  `Payment scheme 'upto' is only supported on EVM networks. Received network: {network}`  | The `upto` scheme is supported only on EVM networks. Use a merchant endpoint on an EVM network for the `upto` scheme. | 
|  `permit2AllowanceLimit is only supported for payment scheme 'upto'. Received scheme: {scheme}`  | You set `permit2AllowanceLimit` for a scheme other than `upto`. Set `permit2AllowanceLimit` only for the `upto` scheme. See [Permit2 allowance for upto payments](payments-process-payment.md#payments-process-payment-x402-permit2). | 
|  `permit2AllowanceLimit must be a positive integer in the asset’s smallest denomination. Received: {value}`  | The `permit2AllowanceLimit` value is not a positive integer. Provide the allowance as a positive integer in the asset’s smallest denomination. For example, `1000000` grants 1 USDC at 6 decimals, and `115792089237316195423570985008687907853269984665640564039457584007913129639935` (the maximum `uint256` value) grants an unlimited allowance. | 
| The payment provider rejected the Permit2 allowance transaction. | When `ProcessPayment` broadcasts the `approve` transaction for an `upto` payment, the wallet provider can reject it. For example, the provider can reject it if delegated signing is not granted, or if a prior transaction from the same wallet has not yet confirmed. To resolve:1.  Confirm the end user has granted the agent signing permission in the WalletHub. See the delegated-signing grant error earlier in this section and [Fund the wallet and grant agent permissions](payments-fund-wallet.md). <br />2.  If the wallet was just funded or used, wait a few seconds for the prior transaction to confirm, then retry with a new `clientToken`. <br />3.  If the wallet is already approved for Permit2, omit `permit2AllowanceLimit` on subsequent calls so that no new `approve` transaction is broadcast.  | 
|  `Payment payTo address is required`  | The payload does not specify a `payTo` address. Forward the merchant’s payload verbatim. If the error persists, the merchant’s payload is malformed; contact the merchant. | 
|  `Payment payTo address is invalid. Expected valid address format for the specified network. Received: {value}`  | The payload `payTo` address is not a valid address for the network. Forward the merchant’s payload verbatim; do not modify the `payTo` address. | 
|  `Payment maxTimeoutSeconds is required`  | The payload does not specify `maxTimeoutSeconds`. Forward the merchant’s payload verbatim. If the error persists, the merchant’s payload is malformed; contact the merchant. | 
|  `Payment maxTimeoutSeconds must be positive. Received: {value}`  | The payload `maxTimeoutSeconds` value is not positive. Forward the merchant’s payload verbatim; do not modify the value. | 
|  `Payment maxTimeoutSeconds {value} exceeds maximum allowed value of {max}`  | The payload `maxTimeoutSeconds` value is above the maximum allowed value. Use a merchant endpoint whose timeout is within the allowed range. | 
|  `Payment feePayer is required for SVM payments`  | The payload for a Solana (SVM) payment does not specify `feePayer`. Forward the merchant’s payload verbatim. If the error persists, the merchant’s payload is malformed; contact the merchant. | 
|  `Payment extra field is required`  | The payload does not include the required `extra` field. Forward the merchant’s payload verbatim. If the error persists, the merchant’s payload is malformed; contact the merchant. | 
|  `Payment extra.name is required for EVM payments`  | The payload for an EVM payment does not include `extra.name`. Forward the merchant’s payload verbatim. If the error persists, the merchant’s payload is malformed; contact the merchant. | 
|  `Payment extra.version is required for EVM payments`  | The payload for an EVM payment does not include `extra.version`. Forward the merchant’s payload verbatim. If the error persists, the merchant’s payload is malformed; contact the merchant. | 
|  `Payment extra.facilitatorAddress is required for the upto scheme`  | The `upto` scheme payload does not include `extra.facilitatorAddress`. Forward the merchant’s payload verbatim. If the error persists, the merchant’s payload is malformed; contact the merchant. | 
|  `Payment extra.facilitatorAddress is invalid. Expected valid address format for the specified network. Received: {value}`  | The payload `extra.facilitatorAddress` is not a valid address for the network. Forward the merchant’s payload verbatim; do not modify the address. | 

## MPP challenge errors
<a name="payments-troubleshooting-mpp"></a>

When you process a payment with the Machine Payments Protocol (MPP), the service validates the `WWW-Authenticate: Payment` challenge that you forward in `paymentInput.mpp`. It validates the challenge before it holds budget or signs. If the challenge is malformed, unsupported, or expired, the service returns a `ValidationException` and consumes no budget. The following table lists common MPP challenge errors and their resolutions. Some rows describe runtime or access errors, such as insufficient wallet balance, MPP access not enabled, or a credential build failure, rather than pre-signing validation errors.


| Error message | Resolution | 
| --- | --- | 
|  `MPP wwwAuthenticateHeaders is required and must contain exactly one WWW-Authenticate header.`  | Provide the `wwwAuthenticateHeaders` field with exactly one header. Copy the merchant’s `WWW-Authenticate: Payment` challenge verbatim; do not send multiple headers. | 
|  `WWW-Authenticate header is not a 'Payment' challenge.`  | The forwarded header is not a `Payment` challenge. Forward the `WWW-Authenticate` header from the merchant’s `402 Payment Required` response without modifying its scheme. | 
|  `MPP challenge is missing required field: {field}`  | The challenge is missing a required field. For the `evm` method, both `methodDetails.chainId` and `realm` are required. Verify that the merchant’s challenge includes the named field before you forward it. | 
|  `MPP challenge 'request' is not valid base64url: {value}`  | The challenge `request` value is not valid base64url. Forward the challenge exactly as the merchant returned it. Do not decode, re-encode, or modify the value. | 
|  `MPP challenge 'request' is not valid JSON: {value}`  | The decoded challenge `request` is not valid JSON. Forward the challenge verbatim. If the error persists, the merchant’s challenge is malformed; contact the merchant. | 
|  `MPP challenge 'id' exceeds the maximum allowed length of {max} characters. Received length: {length}.`  | The challenge `id` is too long. Forward the challenge unmodified. If the error persists, the merchant’s challenge is malformed; contact the merchant. | 
|  `MPP challenge methodDetails.chainId must be a JSON integer, not a string or decimal. Received: {value}`  | The `methodDetails.chainId` in the challenge must be a JSON integer. Forward the challenge verbatim; do not quote or reformat the value. | 
|  `MPP challenge 'request' JSON contains a duplicate key, which is not allowed (RFC 8785 JCS requires unique member names): {key}`  | The challenge `request` JSON contains a duplicate key. Forward the challenge verbatim. If the error persists, the merchant’s challenge is malformed; contact the merchant. | 
|  `MPP challenge WWW-Authenticate header contains a duplicate auth-param: {param}`  | The `WWW-Authenticate` header contains a duplicate parameter. Forward the header verbatim. If the error persists, the merchant’s challenge is malformed; contact the merchant. | 
|  `MPP challenge field '{field}' contains a disallowed control character (0x{code}).`  | A challenge field contains a disallowed control character. Forward the challenge verbatim. If the error persists, the merchant’s challenge is malformed; contact the merchant. | 
|  `MPP supports only the 'charge' intent. Received: {intent}`  | The challenge requests an unsupported intent. AgentCore payments supports only the `charge` intent for MPP. | 
|  `MPP supports only the 'evm', 'tempo', and 'solana' methods. Received: {method}`  | The challenge requests an unsupported payment method. AgentCore payments supports only the `evm`, `tempo`, and `solana` methods for MPP. | 
|  `MPP supports only pull mode; challenge supportedModes did not include 'pull'.`  | The challenge does not offer pull mode. AgentCore payments supports only pull mode for MPP. | 
|  `MPP version is required.`  | Provide the `version` field in `paymentInput.mpp`. | 
|  `MPP EVM/Tempo charge supports only the canonical USDC token on network '{network}'. Received currency: {currency}`  | The challenge requests a token other than the canonical USDC for the network. Use a challenge that requests canonical USDC. Verify that the payment instrument’s network matches the challenge method. | 
|  `This MPP challenge does not offer seller-sponsored network fees (methodDetails.feePayer=false), so the blockchain network (gas) fees would be charged to the buyer’s wallet in addition to the payment amount. Set buyerPaysGasFees=true to authorize paying them, or obtain a challenge whose seller sponsors the fees.`  | The seller does not sponsor gas fees for this challenge. Set `buyerPaysGasFees=true` in `paymentInput.mpp` to authorize paying gas from the buyer’s wallet, or obtain a challenge whose seller sponsors the fees. This is required for the `tempo` method when the seller does not sponsor fees. | 
|  `MPP challenge has expired ('expires' is in the past). Obtain a fresh challenge and retry.`  | The challenge is short-lived and has expired. Request the paid resource again to obtain a fresh challenge, then retry. No budget is consumed for an expired challenge. | 
|  `MPP Solana charge supports only the 'mainnet' and 'devnet' networks. Received: {network}`  | The Solana challenge requests an unsupported network. AgentCore payments supports only `mainnet` and `devnet` for Solana MPP charges. | 
|  `MPP Solana charge currently supports only server-sponsored fees (methodDetails.feePayer=true). Client-paid fees (feePayer=false) are not yet supported.`  | The Solana challenge requests client-paid fees. The `solana` method supports only server-sponsored fees. Use a challenge whose seller sponsors the fees. | 
|  `Solana MPP payments are not supported for Coinbase-managed payment instruments.`  | The `solana` method is not supported for Coinbase CDP payment instruments. Use a Stripe (Privy) payment instrument for Solana MPP charges. See the provider support for each method in [Process a payment](payments-process-payment.md). | 
|  `Insufficient balance in the payer wallet to cover the token transfer and gas fee.`  | The buyer’s wallet does not have enough balance to cover both the payment amount and the network (gas) fee. Fund the wallet with additional USDC. See [Fund the wallet and grant agent permissions](payments-fund-wallet.md). | 
|  `Access to MPP (Machine Payments Protocol) payment processing is not enabled for this account. Contact AWS Support for access.`  | MPP payment processing is not enabled for your account. Contact AWS Support to request access. | 
|  `Failed to build MPP payment credential: {reason}`  | The service could not build the payment credential from the challenge. Verify that you forwarded the challenge verbatim. If the error persists, contact AWS Support with the request ID from the `x-amzn-requestid` response header. | 

## Server errors
<a name="payments-troubleshooting-server"></a>

The service returns `"Something went wrong in processing your request"` for internal errors. Retry the request after a brief delay. If the error persists, contact AWS Support with the request ID from the `x-amzn-requestid` response header.