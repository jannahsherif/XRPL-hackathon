

# Create a payment instrument
<a name="payments-create-instrument"></a>

A payment instrument represents an embedded crypto wallet that an agent uses to pay merchants on behalf of a user. Each instrument is associated with a specific blockchain network. The `ETHEREUM` network value covers Ethereum mainnet and all supported EVM-compatible Layer 2 networks (Base, Arbitrum, and others). For the complete request and response schema, see [CreatePaymentInstrument](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_CreatePaymentInstrument.html) in the API Reference.

**Tip**  
You can automate the steps on this page with the AgentCore Payments skill in the AWS agent toolkit. The skill is part of the **aws-agents** plugin and lets an AI coding agent create your Payment Manager, connector, and credential provider with the AgentCore CLI, create a payment instrument and session using the AgentCore SDK, and add a process payment tool to your agent. For details, see the [quickstart](payments-getting-started.md) and the [AWS agent toolkit on GitHub](https://github.com/aws/agent-toolkit-for-aws/tree/main).

**Example**  

```
from bedrock_agentcore.payments import PaymentManager

manager = PaymentManager(
    payment_manager_arn=PAYMENT_MANAGER_ARN,
    region_name="us-west-2"
)

# Create payment instrument (Ethereum)
instrument = manager.create_payment_instrument(
    user_id="test-user-123",
    payment_connector_id=PAYMENT_CONNECTOR_ID,
    payment_instrument_type="EMBEDDED_CRYPTO_WALLET",
    payment_instrument_details={"embeddedCryptoWallet": {"network": "ETHEREUM",
    "linkedAccounts": [{
                "email": {
                    "emailAddress": "myemail@example.com"
                }
            }]
   }},
)
```
For Solana compatible chain, use enum `SOLANA` for network input.

```
aws bedrock-agentcore create-payment-instrument \
    --payment-manager-arn "arn:aws:bedrock-agentcore:us-west-2:123456789012:payment-manager/my-manager" \
    --payment-connector-id "my-connector-id" \
    --user-id "test-user-123" \
    --payment-instrument-type "EMBEDDED_CRYPTO_WALLET" \
    --payment-instrument-details '{
        "embeddedCryptoWallet": {
            "network": "ETHEREUM",
            "linkedAccounts": [{"email": {"emailAddress": "myemail@example.com"}}]
        }
    }' \
    --client-token "$(uuidgen)" \
    --region us-west-2
```
For Solana compatible chain, use `"network": "SOLANA"`.

```
import boto3
import uuid

dp_client = boto3.client("bedrock-agentcore", region_name="us-west-2",
    endpoint_url="https://bedrock-agentcore.us-west-2.amazonaws.com")

# Create payment instrument (Ethereum)
instrument = dp_client.create_payment_instrument(
    userId="test-user-123",
    paymentManagerArn=PAYMENT_MANAGER_ARN,
    paymentConnectorId=PAYMENT_CONNECTOR_ID,
    paymentInstrumentType="EMBEDDED_CRYPTO_WALLET",
    paymentInstrumentDetails={
        "embeddedCryptoWallet": {
            "network": "ETHEREUM",
            "linkedAccounts": [{
                "email": {
                    "emailAddress": "myemail@example.com"
                }
            }]
        },
    },
    clientToken=str(uuid.uuid4()),
)
```
For Solana compatible chain, use enum `SOLANA` for network input.

**Note**  
Once the payment instrument is created, the end user must fund the instrument and grant signing permissions before the agent can process payments. For detailed instructions, see [Fund the wallet and grant agent permissions](payments-fund-wallet.md).

## Get a payment instrument
<a name="payments-create-instrument-get"></a>

**Example**  

```
instrument = manager.get_payment_instrument(
    user_id="test-user-123",
    payment_instrument_id="payment-instrument-abc123"
)
print(f"Status: {instrument['status']}")
```

```
aws bedrock-agentcore get-payment-instrument \
    --payment-manager-arn "arn:aws:bedrock-agentcore:us-west-2:123456789012:payment-manager/my-manager" \
    --payment-instrument-id "payment-instrument-abc123" \
    --user-id "test-user-123" \
    --region us-west-2
```

```
response = dp_client.get_payment_instrument(
    paymentManagerArn=PAYMENT_MANAGER_ARN,
    paymentInstrumentId="payment-instrument-abc123"
)
instrument = response["paymentInstrument"]
print(f"Status: {instrument['status']}, Network: {instrument['paymentInstrumentDetails']['embeddedCryptoWallet']['network']}")
```

## List payment instruments
<a name="payments-create-instrument-list"></a>

**Example**  

```
instruments = manager.list_payment_instruments(
    user_id="test-user-123"
)
for inst in instruments['paymentInstruments']:
    print(f"{inst['paymentInstrumentId']} - {inst['status']}")
```

```
aws bedrock-agentcore list-payment-instruments \
    --payment-manager-arn "arn:aws:bedrock-agentcore:us-west-2:123456789012:payment-manager/my-manager" \
    --user-id "test-user-123" \
    --region us-west-2
```

```
response = dp_client.list_payment_instruments(
    paymentManagerArn=PAYMENT_MANAGER_ARN,
    userId="test-user-123"
)
for inst in response['paymentInstruments']:
    print(f"{inst['paymentInstrumentId']} - {inst['status']}")
```

## Check instrument balance
<a name="payments-create-instrument-balance"></a>

**Example**  

```
balance = manager.get_payment_instrument_balance(
    user_id="test-user-123",
    payment_connector_id=PAYMENT_CONNECTOR_ID,
    payment_instrument_id="payment-instrument-abc123",
    chain="BASE_SEPOLIA",
    token="USDC",
)
token_balance = balance["tokenBalance"]
print(f"Balance: {token_balance['amount']} {token_balance['token']} on {token_balance['chain']}")
```

```
aws bedrock-agentcore get-payment-instrument-balance \
    --payment-manager-arn "arn:aws:bedrock-agentcore:us-west-2:123456789012:payment-manager/my-manager" \
    --payment-connector-id "my-connector-id" \
    --payment-instrument-id "payment-instrument-abc123" \
    --user-id "test-user-123" \
    --chain BASE_SEPOLIA \
    --token USDC \
    --region us-west-2
```

```
response = dp_client.get_payment_instrument_balance(
    userId="test-user-123",
    paymentManagerArn=PAYMENT_MANAGER_ARN,
    paymentConnectorId=PAYMENT_CONNECTOR_ID,
    paymentInstrumentId="payment-instrument-abc123",
    chain="BASE_SEPOLIA",
    token="USDC",
)
token_balance = response["tokenBalance"]
print(f"Balance: {token_balance['amount']} {token_balance['token']} on {token_balance['chain']}")
```

## Delete a payment instrument
<a name="payments-create-instrument-delete"></a>

**Example**  

```
manager.delete_payment_instrument(
    user_id="test-user-123",
    payment_connector_id=PAYMENT_CONNECTOR_ID,
    payment_instrument_id="payment-instrument-abc123"
)
```

```
aws bedrock-agentcore delete-payment-instrument \
    --payment-manager-arn "arn:aws:bedrock-agentcore:us-west-2:123456789012:payment-manager/my-manager" \
    --payment-connector-id "my-connector-id" \
    --payment-instrument-id "payment-instrument-abc123" \
    --region us-west-2
```

```
dp_client.delete_payment_instrument(
    paymentManagerArn=PAYMENT_MANAGER_ARN,
    paymentConnectorId=PAYMENT_CONNECTOR_ID,
    paymentInstrumentId="payment-instrument-abc123"
)
```