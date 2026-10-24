# Send a Conditional Escrow

This tutorial demonstrates how to send an [escrow](/docs/concepts/payment-types/escrow) that can be released when a specific crypto-condition is fulfilled. Essentially, a crypto-condition is like a random password that unlocks the escrow to be sent to its indicated destination. You can use this as part of an app that reveals the fulfillment only when specific actions take place.

This tutorial shows how to escrow XRP. If the [TokenEscrow amendment](/resources/known-amendments#tokenescrow) is enabled, you can also escrow tokens.

## Goals

By following this tutorial, you should learn how to:

- Convert a timestamp into the XRP Ledger's native format.
- Create a crypto-condition and fulfillment in the format needed for the XRP Ledger.
- Create and finish an escrow.


## Prerequisites

To complete this tutorial, you should:

- Have a basic understanding of the XRP Ledger.
- Have an [XRP Ledger client library](/docs/references/client-libraries), such as **xrpl.js**, installed.


## Source Code

You can find the complete source code for this tutorial's examples in the code samples section of this website's repository.

## Steps

### 1. Install dependencies

JavaScript
From the code sample folder, use `npm` to install dependencies:

```sh
npm i
```

Python
From the code sample folder, set up a virtual environment and use `pip` to install dependencies:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Set up client and account

To get started, import the client library and instantiate an API client. For this tutorial, you also need one account, which you can get from the faucet. You also need the address of another account to send the escrow to. You can fund a second account using the faucet, or use the address of an existing account like the faucet.

JavaScript
```js
import xrpl from 'xrpl'
import { PreimageSha256 } from 'five-bells-condition'
import { randomBytes } from 'crypto'

const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
await client.connect()

console.log('Funding new wallet from faucet...')
const { wallet } = await client.fundWallet()
// const destination_address = 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe' // Testnet faucet
// Alternative: Get another account to send the escrow to. Use this if you get
// a tecDIR_FULL error trying to create escrows to the Testnet faucet.
const destination_address = (await client.fundWallet()).wallet.address
```

Python
```py
import json
from datetime import datetime, timedelta, UTC
from os import urandom

from cryptoconditions import PreimageSha256
from xrpl.clients import JsonRpcClient
from xrpl.models import EscrowCreate, EscrowFinish
from xrpl.transaction import submit_and_wait
from xrpl.utils import datetime_to_ripple_time
from xrpl.wallet import generate_faucet_wallet

# Set up client and get a wallet
client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
print("Funding new wallet from faucet...")
wallet = generate_faucet_wallet(client, debug=True)
#destination_address = "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe" # Testnet faucet
# Alternative: Get another account to send the escrow to. Use this if you get
# a tecDIR_FULL error trying to create escrows to the Testnet faucet.
destination_address = generate_faucet_wallet(client, debug=True).address
```

### 3. Create a condition and fulfillment

Conditional escrows require a fulfillment and its corresponding condition in the format of a PREIMAGE-SHA-256 *crypto-condition*, represented as hexadecimal. To calculate these in the correct format, use a crypto-conditions library. Generally, you want to generate the fulfillment using at least 32 random bytes from a cryptographically secure source of randomness.

JavaScript
```js
// Create the crypto-condition for release ----------------------------------
const preimage = randomBytes(32)
const fulfillment = new PreimageSha256()
fulfillment.setPreimage(preimage)
const fulfillmentHex = fulfillment.serializeBinary().toString('hex').toUpperCase()
const conditionHex = fulfillment.getConditionBinary().toString('hex').toUpperCase()
console.log('Condition:', conditionHex)
console.log('Fulfillment:', fulfillmentHex)
```

Python
```py
# Create the crypto-condition for release -----------------------------------
preimage = urandom(32)
fulfillment = PreimageSha256(preimage=preimage)
condition_hex = fulfillment.condition_binary.hex().upper()
fulfillment_hex = fulfillment.serialize_binary().hex().upper()
print("Condition:", condition_hex)
print("Fulfillment:", fulfillment_hex)
```

### 4. Calculate the expiration time

Conditional escrows also need an expiration time, so that the escrow can be canceled if the correct fulfillment isn't provided by the scheduled time. This timestamp must be formatted as [seconds since the Ripple Epoch](/docs/references/protocol/data-types/basic-data-types#specifying-time). The sample code calculates an expiration time 30 seconds after the current time.

JavaScript
```js
// Set the escrow expiration ------------------------------------------------
const cancelDelay = 300 // Seconds in the future when the escrow should expire
const cancelAfter = new Date() // Current time
cancelAfter.setSeconds(cancelAfter.getSeconds() + cancelDelay)
console.log('This escrow will expire after:', cancelAfter)
// Convert cancelAfter to seconds since the Ripple Epoch:
const cancelAfterRippleTime = xrpl.isoTimeToRippleTime(cancelAfter.toISOString())
```

Python
```py
# Set the escrow expiration -------------------------------------------------
cancel_delay = 300
cancel_after = datetime.now(tz=UTC) + timedelta(seconds=cancel_delay)
print("This escrow will expire after", cancel_after)
cancel_after_rippletime = datetime_to_ripple_time(cancel_after)
```

### 5. Create the escrow

To send the escrow, construct an [EscrowCreate transaction](/docs/references/protocol/transactions/types/escrowcreate) and then submit it to the network. The fields of this transaction define the properties of the escrow. The sample code uses hard-coded values to send 0.123456 XRP back to the Testnet faucet:

JavaScript
```js
// Send EscrowCreate transaction --------------------------------------------
const escrowCreate = {
  TransactionType: 'EscrowCreate',
  Account: wallet.address,
  Destination: destination_address,
  Amount: '123456', // drops of XRP
  Condition: conditionHex,
  CancelAfter: cancelAfterRippleTime
}
xrpl.validate(escrowCreate)

console.log('Signing and submitting the transaction:',
  JSON.stringify(escrowCreate, null, 2))
const response = await client.submitAndWait(escrowCreate, {
  wallet,
  autofill: true // Note: fee is higher based on condition size in bytes
})

// Check result of submitting -----------------------------------------------
console.log(JSON.stringify(response.result, null, 2))
const escrowCreateResultCode = response.result.meta.TransactionResult
if (escrowCreateResultCode === 'tesSUCCESS') {
  console.log('Escrow created successfully.')
} else {
  console.error(`EscrowCreate failed with code ${escrowCreateResultCode}.`)
  client.disconnect()
  process.exit(1)
}
```

Python
```py
# Send EscrowCreate transaction ---------------------------------------------
escrow_create = EscrowCreate(
    account=wallet.address,
    destination=destination_address,
    amount="123456", # drops of XRP
    condition=condition_hex,
    cancel_after=cancel_after_rippletime
)

print("Signing and submitting the EscrowCreate transaction.")
response = submit_and_wait(escrow_create, client, wallet, autofill=True)
print(json.dumps(response.result, indent=2))

# Check result of submitting ------------------------------------------------
result_code = response.result["meta"]["TransactionResult"]
if result_code != "tesSUCCESS":
    print(f"EscrowCreate failed with result code {result_code}")
    exit(1)
```

### 6. Finish the escrow

Anyone with the correct fulfillment can immediately finish a conditional escrow (unless it's a timed conditinal escrow with a `FinishAfter` time). To do this, construct an [EscrowFinish transaction](/docs/references/protocol/transactions/types/escrowfinish), using the sequence number that you recorded when you created the escrow, and the matching condition and fulfillment for the escrow, then submit it to the network.

A conditional EscrowFinish requires a [higher than normal transaction cost](/docs/concepts/transactions/transaction-cost#special-transaction-costs) based on the size of the fulfillment in bytes. Most libraries should specify an appropriate amount of XRP when autofilling, but you should be mindful of this when specifying the `Fee` field manually.

JavaScript
```js
// Send EscrowFinish transaction --------------------------------------------
const escrowFinish = {
  TransactionType: 'EscrowFinish',
  Account: wallet.address,
  Owner: wallet.address,
  OfferSequence: escrowSeq,
  Condition: conditionHex,
  Fulfillment: fulfillmentHex
}
xrpl.validate(escrowFinish)

console.log('Signing and submitting the transaction:',
  JSON.stringify(escrowFinish, null, 2))
const response2 = await client.submitAndWait(escrowFinish, {
  wallet,
  autofill: true // Note: fee is higher based on fulfillment size in bytes
})
console.log(JSON.stringify(response2.result, null, 2))
if (response2.result.meta.TransactionResult === 'tesSUCCESS') {
  console.log('Escrow finished successfully.')
} else {
  console.log(`Failed with result code ${response2.result.meta.TransactionResult}`)
}

client.disconnect()
```

Python
```py
# Send EscrowFinish transaction ---------------------------------------------
escrow_finish = EscrowFinish(
    account=wallet.address,
    owner=wallet.address,
    offer_sequence=escrow_seq,
    condition=condition_hex,
    fulfillment=fulfillment_hex
)
print("Signing and submitting the EscrowFinish transaction.")
response2 = submit_and_wait(escrow_finish, client, wallet, autofill=True)
print(json.dumps(response2.result, indent=2))

result_code = response2.result["meta"]["TransactionResult"]
if result_code != "tesSUCCESS":
    print(f"EscrowFinish failed with result code {result_code}")
    exit(1)

print("Escrow finished successfully.")
```

## See Also

- [Crypto-Conditions Specification](https://tools.ietf.org/html/draft-thomas-crypto-conditions-04)
- **Concepts:**
  - [Escrow](/docs/concepts/payment-types/escrow)
  - [Look Up Transaction Results](/docs/concepts/transactions/finality-of-results/look-up-transaction-results)
  - [Reliable Transaction Submission](/docs/concepts/transactions/reliable-transaction-submission)
- **Tutorials:**
  - [Send XRP](/docs/tutorials/payments/send-xrp)
- **References:**
  - [EscrowCancel transaction](/docs/references/protocol/transactions/types/escrowcancel)
  - [EscrowCreate transaction](/docs/references/protocol/transactions/types/escrowcreate)
  - [EscrowFinish transaction](/docs/references/protocol/transactions/types/escrowfinish)
  - [Escrow entry](/docs/references/protocol/ledger-data/ledger-entry-types/escrow)