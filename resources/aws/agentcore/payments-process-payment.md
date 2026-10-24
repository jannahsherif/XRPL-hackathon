

# Process a payment
<a name="payments-process-payment"></a>

To process a payment, you need two resources:
+  **Payment instrument** — An embedded crypto wallet with Coinbase or Stripe. See [Create a payment instrument](payments-create-instrument.md).
+  **Payment session** — A time-bounded session that optionally enforces a spending budget. See [Create a payment session](payments-create-session.md).

After both exist, call `ProcessPayment` with the payment session ID, payment instrument ID, and a payment payload. The service validates the request, checks the budget, signs the transaction on the appropriate blockchain, and returns a signed payment result. For the complete request and response schema, see [ProcessPayment](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_ProcessPayment.html) in the API Reference.

AgentCore payments supports two payment protocols, which you select with the `paymentType` parameter:
+  `CRYPTO_X402` — The x402 protocol. Provide the merchant’s x402 payment payload in `paymentInput.cryptoX402`, and the agent retries the request with the signed proof in the `X-PAYMENT` header.
+  `MPP` — The Machine Payments Protocol (MPP). Forward the merchant’s `WWW-Authenticate: Payment` challenge in `paymentInput.mpp`, and the agent retries the request with the returned credential in the `Authorization` header.

Choose the `paymentType` that matches the protocol the merchant used in its `402 Payment Required` response. For x402 request and response details, see [Pay an x402 payment request](#payments-process-payment-x402). For MPP request and response details, see [Pay an MPP challenge](#payments-process-payment-mpp).

**Tip**  
You can automate the steps on this page with the AgentCore Payments skill in the AWS agent toolkit. The skill is part of the **aws-agents** plugin and lets an AI coding agent create your Payment Manager, connector, and credential provider with the AgentCore CLI, create a payment instrument and session using the AgentCore SDK, and add a process payment tool to your agent. For details, see the [quickstart](payments-getting-started.md) and the [AWS agent toolkit on GitHub](https://github.com/aws/agent-toolkit-for-aws/tree/main).

Choose how to process a payment:

**Example**  
Invoke a payment-enabled Runtime with `agentcore invoke --runtime <name>`, passing the existing payment session and instrument IDs through `--header`. Your agent reads these application-defined headers and passes their values to `AgentCorePaymentsPluginConfig`. For the Python entrypoint and CLI commands, see [Process a payment with a Strands agent](payments-getting-started.md#payments-getting-started-step6).
Use the `PaymentManager` class to generate payment headers manually within any agent framework:  

```
import uuid
from bedrock_agentcore.payments import PaymentManager

manager = PaymentManager(
    payment_manager_arn=mgr["paymentManagerArn"],
    region_name="us-west-2"
)

# When you receive a 402 response, generate payment proof
payment_required_request = {
    "statusCode": 402,
    "headers": payment_required["headers"],
    "body": payment_required["body"],
}
payment_proof_headers = manager.generate_payment_header(
    user_id="test-user-123",
    payment_instrument_id=instrument["paymentInstrumentId"],
    payment_session_id=session["paymentSessionId"],
    payment_required_request=payment_required_request,
    client_token=str(uuid.uuid4()),
)
```
 `payment_proof_headers` contains the payment proof header. Include this header when retrying the request to the paid endpoint. You can also call the `process_payment` method of `PaymentManager` for more control over inputs.
The following example processes an x402 payment by passing the merchant’s payload in `paymentInput.cryptoX402`:  

```
aws bedrock-agentcore process-payment \
    --payment-manager-arn "arn:aws:bedrock-agentcore:us-west-2:123456789012:payment-manager/my-manager" \
    --payment-session-id "payment-session-abc123" \
    --payment-instrument-id "payment-instrument-xyz789" \
    --payment-type "CRYPTO_X402" \
    --payment-input '{
        "cryptoX402": {
            "version": "2",
            "payload": {
                "scheme": "exact",
                "network": "eip155:84532",
                "amount": "100000",
                "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
                "payTo": "0x99935f281d3ED1E804bF1413b76E0B03e1fed4F9",
                "maxTimeoutSeconds": 300,
                "extra": {"name": "USDC", "version": "2"}
            }
        }
    }' \
    --client-token "$(uuidgen)" \
    --region us-west-2
```
To learn how to build the `paymentInput` for each protocol, including the MPP ` AWS ` CLI example, see [Pay an x402 payment request](#payments-process-payment-x402) and [Pay an MPP challenge](#payments-process-payment-mpp).
The following example processes an x402 payment by calling `process_payment` with the merchant’s payload in `paymentInput.cryptoX402`:  

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
                "payTo": "0x99935f281d3ED1E804bF1413b76E0B03e1fed4F9",
                "maxTimeoutSeconds": 300,
                "extra": {"name": "USDC", "version": "2"},
            },
        }
    },
    clientToken=str(uuid.uuid4()),
)
```
Response:  

```
{
    "processPaymentId": "12345678-1234-1234-1234-123456789012",
    "paymentManagerArn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:payment-manager/my-manager-a1b2c3d4e5",
    "paymentSessionId": "payment-session-abc123def4567",
    "paymentInstrumentId": "payment-instrument-xyz789abc1234",
    "paymentType": "CRYPTO_X402",
    "status": "PROOF_GENERATED",
    "paymentOutput": {
        "cryptoX402": {
            "version": "2",
            "payload": {
                "...signed transaction proof..."
            }
        }
    },
    "createdAt": "2025-07-15T10:35:00Z",
    "updatedAt": "2025-07-15T10:35:02Z"
}
```
A `status` of `PROOF_GENERATED` indicates the transaction was signed and the payment proof is included in `paymentOutput`.  
To learn how to build the `paymentInput` for each protocol, including the MPP ` AWS ` SDK example and its response, see [Pay an x402 payment request](#payments-process-payment-x402) and [Pay an MPP challenge](#payments-process-payment-mpp).
The AgentCore payments plugin provides automated payment processing for Strands Agents. It supports the [x402 Payment Required](https://www.x402.org/) protocol, enabling agents to automatically handle HTTP 402 responses.  
 **Installation:**   

```
pip install 'bedrock-agentcore[strands-agents]'
```
 **Configure and use the plugin:**   

```
from strands import Agent
from strands_tools import http_request
from bedrock_agentcore.payments.integrations.config import AgentCorePaymentsPluginConfig
from bedrock_agentcore.payments.integrations.strands.plugin import AgentCorePaymentsPlugin

# Configure the plugin
config = AgentCorePaymentsPluginConfig(
    payment_manager_arn="arn:aws:bedrock-agentcore:us-west-2:123456789012:payment-manager/pm-abc123",
    user_id="test-user-123",
    payment_instrument_id="payment-instrument-XJU4RSQP9VO0ler",
    payment_session_id="payment-session-xuzrnUCd7RT725G",
    region="us-west-2",
)

# Create the plugin
plugin = AgentCorePaymentsPlugin(config=config)

# Create agent with the plugin
agent = Agent(
    system_prompt="You are a helpful assistant that can access paid APIs.",
    tools=[http_request],
    plugins=[plugin],
)

# Use the agent -- 402 responses are automatically handled
agent("access https://drvd12nxpcyd5.cloudfront.net/market-recap")
```
The AgentCore payments plugin intercepts x402 payment requests automatically, processes the payment, and retries the request with payment proof for the agent.
The AgentCore payments middleware provides automated payment processing for LangGraph agents. It supports the [x402 Payment Required](https://www.x402.org/) protocol, enabling agents to automatically handle HTTP 402 responses.  
 **Installation:**   

```
pip install 'bedrock-agentcore[langgraph]'
```
 **Configure and use the middleware:**   

```
from langchain.agents import create_agent
from bedrock_agentcore.payments.integrations.langgraph import (
    AgentCorePaymentsConfig,
    AgentCorePaymentsMiddleware,
)

config = AgentCorePaymentsConfig(
    payment_manager_arn="arn:aws:bedrock-agentcore:us-west-2:123456789012:payment-manager/pm-abc123",
    user_id="test-user-123",
    payment_instrument_id="payment-instrument-XJU4RSQP9VO0ler",
    region="us-west-2",
    auto_session=True,
)

payments = AgentCorePaymentsMiddleware(config)

agent = create_agent(
    model="us.anthropic.claude-sonnet-4-20250514-v1:0",
    tools=[],
    middleware=[payments],
)

result = agent.invoke({"messages": [{"role": "user", "content": "access https://drvd12nxpcyd5.cloudfront.net/market-recap"}]})
print(result)
```
The AgentCore payments middleware intercepts x402 payment requests automatically, processes the payment, and retries the request with payment proof for the agent.

## Pay an x402 payment request
<a name="payments-process-payment-x402"></a>

When a merchant responds with an x402 payment payload in its `402 Payment Required` response, you forward that payload to AgentCore payments, and AgentCore payments returns a signed proof. You copy the merchant’s payload into `paymentInput.cryptoX402`, and AgentCore payments checks the budget, signs the transaction with the wallet, and returns the signed proof. You attach the proof to the `X-PAYMENT` header and retry the original request.

### Request and response
<a name="_request_and_response"></a>

Provide the following fields in `paymentInput.cryptoX402`:
+  `version` — The x402 protocol version (for example, `1` or `2`). Required.
+  `payload` — The merchant’s x402 payment requirements, passed as a JSON object. This specifies the `scheme`, `network`, `maxAmountRequired`, `asset`, `payTo`, and other fields from the merchant’s `402` response. Required.
+  `permit2AllowanceLimit` — The maximum on-chain Permit2 allowance to grant, in the asset’s smallest denomination. Optional. Set this only for the `upto` (metered) scheme, which settles through the Permit2 contract; supplying it for the `exact` scheme is a validation error. See [Permit2 allowance for upto payments](#payments-process-payment-x402-permit2).

The response returns the following fields in `paymentOutput.cryptoX402`:
+  `version` — The x402 protocol version.
+  `payload` — The signed transaction proof, as a JSON object. Attach it to the `X-PAYMENT` header and retry the original request.

A `status` of `PROOF_GENERATED` indicates that the transaction was signed and the payment proof is included in `paymentOutput`.

### Schemes
<a name="_schemes"></a>

An x402 payload names a `scheme`. AgentCore payments supports the following schemes:
+  `exact` — Pays a fixed amount specified in the merchant’s payload. This is the default scheme, and it requires no allowance handling.
+  `upto` — Pays a metered amount up to a ceiling. This scheme settles through the Permit2 contract, so the payer wallet must have granted a Permit2 allowance. See [Permit2 allowance for upto payments](#payments-process-payment-x402-permit2).

### Permit2 allowance for upto payments
<a name="payments-process-payment-x402-permit2"></a>

The `upto` scheme settles through the Permit2 contract, which moves funds with `transferFrom`. The payer wallet must first grant Permit2 an ERC-20 allowance, or settlement fails with a Permit2-allowance precondition error. This grant follows the same on-chain approval model as any direct Permit2 approval. For more information, see [Uniswap Permit2](https://docs.uniswap.org/contracts/permit2/overview) on the Uniswap website and the [x402 upto scheme specification](https://github.com/coinbase/x402/blob/main/specs/schemes/upto/README.md) on the GitHub website.

To handle this, set `permit2AllowanceLimit` to the maximum allowance in the asset’s smallest denomination (for example, `1000000` = 1 USDC at 6 decimals). To grant an unlimited allowance, pass the maximum `uint256` value as a string: `115792089237316195423570985008687907853269984665640564039457584007913129639935`. When you set this field, AgentCore payments submits an on-chain `approve` transaction before signing. This transaction **incurs blockchain network (gas) fees** paid from the wallet’s native token balance.

Because `approve` sets, rather than adds to, the wallet’s allowance, set `permit2AllowanceLimit` only when the wallet needs approving (for example, its first `upto` payment) to avoid a redundant on-chain transaction. Omit the field to skip allowance handling entirely. This field applies only to the `upto` scheme; supplying it for the `exact` scheme is a validation error.

The following example processes an `upto` payment and grants an allowance of 1 USDC to Permit2. For `upto`, `maxAmountRequired` carries the ceiling the merchant advertises in its `402` response, and `extra.facilitatorAddress` is the settlement facilitator from that same response.

**Example**  

```
aws bedrock-agentcore process-payment \
    --payment-manager-arn "arn:aws:bedrock-agentcore:us-west-2:123456789012:payment-manager/my-manager" \
    --payment-session-id "payment-session-abc123" \
    --payment-instrument-id "payment-instrument-xyz789" \
    --payment-type "CRYPTO_X402" \
    --payment-input '{
        "cryptoX402": {
            "version": "2",
            "payload": {
                "scheme": "upto",
                "network": "eip155:8453",
                "maxAmountRequired": "3495",
                "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
                "payTo": "0x99935f281d3ED1E804bF1413b76E0B03e1fed4F9",
                "maxTimeoutSeconds": 300,
                "extra": {"name": "USDC", "version": "2", "facilitatorAddress": "0x8581784D3E598cCa3482375CFF2409Ac9DD8c402"}
            },
            "permit2AllowanceLimit": "1000000"
        }
    }' \
    --client-token "$(uuidgen)" \
    --region us-west-2
```

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
                "scheme": "upto",
                "network": "eip155:8453",
                "maxAmountRequired": "3495",
                "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
                "payTo": "0x99935f281d3ED1E804bF1413b76E0B03e1fed4F9",
                "maxTimeoutSeconds": 300,
                "extra": {"name": "USDC", "version": "2", "facilitatorAddress": "0x8581784D3E598cCa3482375CFF2409Ac9DD8c402"},
            },
            "permit2AllowanceLimit": "1000000",
        }
    },
    clientToken=str(uuid.uuid4()),
)
```

### Limitations
<a name="_limitations"></a>
+ The `permit2AllowanceLimit` field is valid only for the `upto` scheme. Supplying it for the `exact` scheme returns a `ValidationException`.

For x402 payment request validation errors and their resolutions, see [x402 payment request errors](payments-troubleshooting.md#payments-troubleshooting-x402). For payment processing errors and their resolutions, see [Payment processing errors](payments-troubleshooting.md#payments-troubleshooting-processing).

## Pay an MPP challenge
<a name="payments-process-payment-mpp"></a>

When a merchant returns a `WWW-Authenticate: Payment` challenge in its `402 Payment Required` response, forward the challenge verbatim in `paymentInput.mpp`. AgentCore payments parses the challenge, checks the budget, signs with the wallet, and returns a ready-to-send `Authorization` header value. AgentCore payments handles the header parsing, base64url decoding, and signing, so you do not need to perform these operations.

### Request and response
<a name="_request_and_response_2"></a>

Provide the following fields in `paymentInput.mpp`:
+  `version` — The MPP protocol version (for example, `1`). Required.
+  `wwwAuthenticateHeaders` — The raw `WWW-Authenticate: Payment` header value from the merchant’s `402` response, passed verbatim. Provide exactly one header. Required.
+  `buyerPaysGasFees` — Whether to authorize paying blockchain network (gas) fees from the buyer’s wallet when the seller does not sponsor them. Optional. Omitted or `false` means the buyer declines. See [Network fee consent](#payments-process-payment-mpp-fees).

The response returns the following fields in `paymentOutput.mpp`:
+  `version` — The MPP protocol version.
+  `selectedPaymentId` — The `id` of the challenge that AgentCore payments paid, echoed from the input challenge so that you can correlate the result without decoding the credential.
+  `paymentCredential` — The ready-to-send `Authorization` header value, in the form `Payment <base64url-token>`. Attach it as the `Authorization` header and retry the original request.

**Important**  
Do not decode or modify `paymentCredential`. It embeds the original challenge and the signed payload, and the merchant’s HMAC binds to those exact bytes. Attach the value as returned.

The following example processes an MPP challenge. Set `--payment-type "MPP"` and forward the merchant’s `WWW-Authenticate: Payment` challenge verbatim in `paymentInput.mpp.wwwAuthenticateHeaders` (exactly one header).

**Example**  

```
aws bedrock-agentcore process-payment \
    --payment-manager-arn "arn:aws:bedrock-agentcore:us-west-2:123456789012:payment-manager/my-manager" \
    --payment-session-id "payment-session-abc123" \
    --payment-instrument-id "payment-instrument-xyz789" \
    --payment-type "MPP" \
    --payment-input '{
        "mpp": {
            "version": "1",
            "wwwAuthenticateHeaders": [
                "Payment id=\"c1\", realm=\"seller.example.com\", method=\"evm\", intent=\"charge\", request=\"eyJhbW91bnQiOiIxMDAwMDAifQ\""
            ]
        }
    }' \
    --client-token "$(uuidgen)" \
    --region us-west-2
```

```
import uuid

payment = dp_client.process_payment(
    userId="test-user-123",
    paymentManagerArn=PAYMENT_MANAGER_ARN,
    paymentSessionId=SESSION_ID,
    paymentInstrumentId=INSTRUMENT_ID,
    paymentType="MPP",
    paymentInput={
        "mpp": {
            "version": "1",
            "wwwAuthenticateHeaders": [
                'Payment id="c1", realm="seller.example.com", method="evm", '
                'intent="charge", request="eyJhbW91bnQiOiIxMDAwMDAifQ"'
            ],
        }
    },
    clientToken=str(uuid.uuid4()),
)
```
Response:  

```
{
    "processPaymentId": "12345678-1234-1234-1234-123456789012",
    "paymentManagerArn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:payment-manager/my-manager-a1b2c3d4e5",
    "paymentSessionId": "payment-session-abc123def4567",
    "paymentInstrumentId": "payment-instrument-xyz789abc1234",
    "paymentType": "MPP",
    "status": "PROOF_GENERATED",
    "paymentOutput": {
        "mpp": {
            "version": "1",
            "selectedPaymentId": "c1",
            "paymentCredential": "Payment <base64url-token>"
        }
    },
    "createdAt": "2025-07-15T10:35:00Z",
    "updatedAt": "2025-07-15T10:35:02Z"
}
```
A `status` of `PROOF_GENERATED` indicates the credential was signed and is included in `paymentOutput.mpp.paymentCredential`.

### Methods and tokens
<a name="_methods_and_tokens"></a>

An MPP challenge names a payment `method`. AgentCore payments supports the following methods for the `charge` intent:
+  `evm` — Canonical USDC only. The challenge must include `methodDetails.chainId` and `realm`.
+  `tempo` — Any Tempo chain, selected by `methodDetails.chainId`, using the network’s recognized USDC-equivalent token.
+  `solana` — The `mainnet` and `devnet` networks, with server-sponsored fees only.

The payment instrument’s blockchain network must match the challenge method. Provider support depends on the connector type:


| Method | Coinbase CDP | Stripe (Privy) | 
| --- | --- | --- | 
|  `evm`  | Supported | Supported | 
|  `tempo`  | Supported | Supported | 
|  `solana`  | Not supported | Supported | 

### Network fee consent
<a name="payments-process-payment-mpp-fees"></a>

Blockchain network (gas) fees are separate from the challenge amount. A challenge advertises who sponsors them through its `methodDetails.feePayer` flag:
+  `methodDetails.feePayer=true` — The seller sponsors the network fees. `buyerPaysGasFees` has no effect.
+  `methodDetails.feePayer=false` or absent — The buyer pays the network fees from the paying wallet, in addition to the payment amount. Because that cost is not visible in the challenge amount, AgentCore payments signs only if you set `buyerPaysGasFees=true`; otherwise it returns a `ValidationException`. For the `tempo` method, this consent is required whenever the seller does not sponsor fees.

The `evm` method needs no fee consent, because the facilitator broadcasts the transaction and pays the gas. The `solana` method supports only server-sponsored fees.

### Limitations
<a name="_limitations_2"></a>
+ AgentCore payments fulfills exactly one challenge per `ProcessPayment` call. Provide a single header in `wwwAuthenticateHeaders`.
+ Only the `charge` intent and pull mode are supported.
+ MPP challenges are short-lived. If the challenge has expired, AgentCore payments returns a `ValidationException` and consumes no budget. Request the paid resource again to obtain a fresh challenge, then retry.

For MPP challenge validation errors and their resolutions, see [MPP challenge errors](payments-troubleshooting.md#payments-troubleshooting-mpp).

## Framework integrations
<a name="_framework_integrations"></a>

For full reference documentation including error handling, configuration options, and built-in tools, see [Framework integrations](payments-framework-integrations.md).


| Framework | Integration type | Reference | 
| --- | --- | --- | 
|  [Strands Agents](payments-framework-integrations.md#payments-framework-strands)  | Plugin (hook-based) | Interrupt handling, config options, built-in tools | 
|  [LangGraph](payments-framework-integrations.md#payments-framework-langgraph)  | Middleware (wraps tool calls) | Error callbacks, allowlists, async support, config options | 