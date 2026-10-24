# Send a Timed Escrow

This tutorial shows how to send an [escrow](/docs/concepts/payment-types/escrow) whose only condition for release is that a specific time has passed. You can use this to set aside money for yourself or others so that it absolutely cannot be used until the specified time.

This tutorial shows how to escrow XRP. If the [TokenEscrow amendment](/resources/known-amendments#tokenescrow) is enabled, you can also escrow tokens.

## Goals

By following this tutorial, you should learn how to:

- Convert a timestamp into the XRP Ledger's native format.
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
from time import sleep

from xrpl.clients import JsonRpcClient
from xrpl.models import EscrowCreate, EscrowFinish
from xrpl.models.requests import Ledger
from xrpl.transaction import submit_and_wait
from xrpl.utils import datetime_to_ripple_time, ripple_time_to_datetime
from xrpl.wallet import generate_faucet_wallet

# Set up client and get a wallet
client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
print("Funding new wallet from faucet...")
wallet = generate_faucet_wallet(client, debug=True)
# destination_address = "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe" # Testnet faucet
# Alternative: Get another account to send the escrow to. Use this if you get
# a tecDIR_FULL error trying to create escrows to the Testnet faucet.
destination_address = generate_faucet_wallet(client, debug=True).address
```

### 3. Calculate the finish time

To make a timed escrow, you need to set the maturity time of the escrow, which is a timestamp after which the escrow can be finished, formatted as [seconds since the Ripple Epoch](/docs/references/protocol/data-types/basic-data-types#specifying-time). You can calculate the maturity time by adding a delay to the current time and then using the client library's conversion function. The sample code uses a delay of 30 seconds:

JavaScript
```js
// Set the escrow finish time -----------------------------------------------
const delay = 30 // Seconds in the future when the escrow should mature
const finishAfter = new Date() // Current time
finishAfter.setSeconds(finishAfter.getSeconds() + delay)
console.log('This escrow will finish after:', finishAfter)
// Convert finishAfter to seconds since the Ripple Epoch:
const finishAfterRippleTime = xrpl.isoTimeToRippleTime(finishAfter.toISOString())
```

Python
```py
# Set the escrow finish time ------------------------------------------------
delay = 30
finish_after = datetime.now(tz=UTC) + timedelta(seconds=delay)
print("This escrow will mature after", finish_after)
finish_after_rippletime = datetime_to_ripple_time(finish_after)
```

If you use a UNIX time without converting to the equivalent Ripple time first, that sets the maturity time to an extra **30 years** in the future!

If you want your escrow to have an expiration time, after which it can only be canceled, you can calculate it the same way.

### 4. Create the escrow

To send the escrow, construct an [EscrowCreate transaction](/docs/references/protocol/transactions/types/escrowcreate) and then submit it to the network. The fields of this transaction define the properties of the escrow. The sample code uses hard-coded values to send 0.123456 XRP back to the Testnet faucet:

JavaScript
```js
// Send EscrowCreate transaction --------------------------------------------
const escrowCreate = {
  TransactionType: 'EscrowCreate',
  Account: wallet.address,
  Destination: destination_address,
  Amount: '123456', // drops of XRP
  FinishAfter: finishAfterRippleTime
}
xrpl.validate(escrowCreate)

console.log('Signing and submitting the transaction:',
  JSON.stringify(escrowCreate, null, 2))
const response = await client.submitAndWait(escrowCreate, {
  wallet,
  autofill: true
})
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
    finish_after=finish_after_rippletime
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

To give the escrow an expiration time, add a `CancelAfter` field to the transaction. An expiration time is optional for timed XRP escrows but required for token escrows. This time must be after the maturity time (`FinishAfter`).

Save the sequence number of the `EscrowCreate` transaction. You need this sequence number to identify the escrow when you want to finish (or cancel) it later. In this example, the sequence number is autofilled.

JavaScript
```js
// Save the sequence number so you can identify the escrow later.
const escrowSeq = response.result.tx_json.Sequence
console.log(`Escrow sequence is ${escrowSeq}.`)
```

Python
```py
# Save the sequence number so you can identify the escrow later
escrow_seq = response.result["tx_json"]["Sequence"]
print(f"Escrow sequence is {escrow_seq}.")
```

### 5. Wait for the escrow

With the escrow successfully created, the funds are now locked up until the maturity time. Since this tutorial used a delay of 30 seconds, have the script sleep for that long:

JavaScript
```js
// Wait for the escrow to be finishable -------------------------------------
console.log(`Waiting ${delay} seconds for the escrow to mature...`)
await sleep(delay)
```

JavaScript doesn't have a native `sleep(...)` function, but you can implement one to be used with `await`, as a convenience:

```js
/* Sleep function that can be used with await */
function sleep (delayInSeconds) {
  const delayInMs = delayInSeconds * 1000
  return new Promise((resolve) => setTimeout(resolve, delayInMs))
}
```

Python
```py
# Wait for the escrow to be finishable --------------------------------------
sleep(delay)
```

At this point, the escrow should be mature, but that depends on the official close time of the previous ledger. Ledger close times can vary based on the consensus process, and [are rounded](/docs/concepts/ledgers/ledger-close-times) by up to 10 seconds. To account for this variance, use an approach such as the following:

1. Check the official close time of the most recent validated ledger.
2. Wait a number of seconds based on the difference between that close time and the maturity time of the escrow.
3. Repeat until the escrow is mature.


JavaScript
```js
// Check if escrow can be finished -------------------------------------------
let escrowReady = false
while (!escrowReady) {
  // Check the close time of the latest validated ledger.
  // Close times are rounded by about 10 seconds, so the exact time the escrow
  // is ready to finish may vary by +/- 10 seconds.
  const validatedLedger = await client.request({
    command: 'ledger',
    ledger_index: 'validated'
  })
  const ledgerCloseTime = validatedLedger.result.ledger.close_time
  console.log('Latest validated ledger closed at',
    xrpl.rippleTimeToISOTime(ledgerCloseTime))
  if (ledgerCloseTime > finishAfterRippleTime) {
    escrowReady = true
    console.log('Escrow is mature.')
  } else {
    let timeDifference = finishAfterRippleTime - ledgerCloseTime
    if (timeDifference === 0) { timeDifference = 1 }
    console.log(`Waiting another ${timeDifference} second(s).`)
    await sleep(timeDifference)
  }
}
```

Python
```py
# Check if escrow can be finished -------------------------------------------
escrow_ready = False
while not escrow_ready:
    validated_ledger = client.request(Ledger(ledger_index="validated"))
    ledger_close_time = validated_ledger.result["ledger"]["close_time"]
    print("Latest validated ledger closed at", 
        ripple_time_to_datetime(ledger_close_time)
    )
    if ledger_close_time > finish_after_rippletime:
        escrow_ready = True
        print("Escrow is mature.")
    else:
        time_difference = finish_after_rippletime - ledger_close_time
        if time_difference == 0:
            time_difference = 1
        print(f"Waiting another {time_difference} seconds.")
        sleep(time_difference)
```

### 6. Finish the escrow

Now that the escrow is mature, you can finish it. Construct an [EscrowFinish transaction](/docs/references/protocol/transactions/types/escrowfinish), using the sequence number that you recorded when you created the escrow, then submit it to the network.

Anyone can finish a timed escrow when it is ready. Regardless of who does so—the sender, receiver, or even a third party—the escrow delivers the funds to its intended recipient.

JavaScript
In xrpl.js, you can use the [`getBalanceChanges(metadata)`](https://js.xrpl.org/functions/getBalanceChanges.html) utility to parse the validated transaction's metadata for a simplified list of balance changes.

```js
// Send EscrowFinish transaction --------------------------------------------
const escrowFinish = {
  TransactionType: 'EscrowFinish',
  Account: wallet.address,
  Owner: wallet.address,
  OfferSequence: escrowSeq
}
xrpl.validate(escrowFinish)

console.log('Signing and submitting the transaction:',
  JSON.stringify(escrowFinish, null, 2))
const response2 = await client.submitAndWait(escrowFinish, {
  wallet,
  autofill: true
})
console.log(JSON.stringify(response2.result, null, 2))
if (response2.result.meta.TransactionResult === 'tesSUCCESS') {
  console.log('Escrow finished successfully. Balance changes:')
  console.log(
    JSON.stringify(xrpl.getBalanceChanges(response2.result.meta), null, 2)
  )
}

client.disconnect()
```

Python
In xrpl-py, you can use the [`get_balance_changes(metadata)`](https://xrpl-py.readthedocs.io/en/stable/source/xrpl.utils.html#xrpl.utils.get_balance_changes) utility to parse the validated transaction's metadata for a simplified list of balance changes.

```py
# Send EscrowFinish transaction ---------------------------------------------
escrow_finish = EscrowFinish(
    account=wallet.address,
    owner=wallet.address,
    offer_sequence=escrow_seq
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

- **Concepts:**
  - [Escrow](/docs/concepts/payment-types/escrow)
  - [Ledger Close Times](/docs/concepts/ledgers/ledger-close-times)
  - [Look Up Transaction Results](/docs/concepts/transactions/finality-of-results/look-up-transaction-results)
  - [Reliable Transaction Submission](/docs/concepts/transactions/reliable-transaction-submission)
- **Tutorials:**
  - [Send XRP](/docs/tutorials/payments/send-xrp)
- **References:**
  - [EscrowCancel transaction](/docs/references/protocol/transactions/types/escrowcancel)
  - [EscrowCreate transaction](/docs/references/protocol/transactions/types/escrowcreate)
  - [EscrowFinish transaction](/docs/references/protocol/transactions/types/escrowfinish)
  - [Escrow entry](/docs/references/protocol/ledger-data/ledger-entry-types/escrow)