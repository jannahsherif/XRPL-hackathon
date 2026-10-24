# Cancel an Expired Escrow

This tutorial demonstrates how to cancel an [escrow](/docs/concepts/payment-types/escrow) that has passed its expiration time. You can use this to reclaim funds that you escrowed but were never claimed by the recipient, or to remove an expired escrow that is stopping you from deleting your account.

## Goals

By following this tutorial, you should learn how to:

- Compare a timestamp from the ledger to the current time.
- Cancel an expired escrow.


## Prerequisites

To complete this tutorial, you should:

- Have a basic understanding of the XRP Ledger.
- Have an [XRP Ledger client library](/docs/references/client-libraries), such as **xrpl.js**, installed.
- Already know how to send a [timed](/docs/tutorials/payments/send-a-timed-escrow) or [conditional](/docs/tutorials/payments/send-a-conditional-escrow) escrow.


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

Python
```py
import json
from datetime import datetime, timedelta, UTC
from time import sleep

from xrpl.clients import JsonRpcClient
from xrpl.models import EscrowCreate, EscrowCancel
from xrpl.models.requests import AccountObjects, Ledger, Tx
from xrpl.transaction import submit_and_wait
from xrpl.utils import datetime_to_ripple_time, ripple_time_to_datetime, get_balance_changes
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

JavaScript
```js
import { Client, isoTimeToRippleTime, rippleTimeToISOTime, validate, getBalanceChanges } from 'xrpl'

const client = new Client('wss://s.altnet.rippletest.net:51233')
await client.connect()

console.log('Funding new wallet from faucet...')
const { wallet } = await client.fundWallet()
// const destinationAddress = 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe' // Testnet faucet
// Alternative: Get another account to send the escrow to. Use this if you get
// a tecDIR_FULL error trying to create escrows to the Testnet faucet.
const destinationAddress = (await client.fundWallet()).wallet.address
```

### 3. Create an escrow

For the purposes of this tutorial, you need an escrow to cancel, so create one that won't be finished before it expires. The sample code uses a conditional escrow with a made-up condition full of zeroes, so nobody knows the fulfillment, and an expiration time 30 seconds into the future. A timed escrow could also work, but it's possible someone else would finish the escrow between its maturity and expiration time.

Anyone can cancel *any* expired escrow; you don't have to be the sender or receiver. That said, the sender has the most financial incentive to do so, since they get the funds back.

JavaScript
```js
// Create an escrow that won't be finished -------------------------------------
const cancelDelay = 30
const cancelAfter = new Date()
cancelAfter.setSeconds(cancelAfter.getSeconds() + cancelDelay)
console.log('This escrow will expire after:', cancelAfter)
// Convert cancelAfter to seconds since the Ripple Epoch:
const cancelAfterRippleTime = isoTimeToRippleTime(cancelAfter.toISOString())
const conditionHex = 'A02580200000000000000000000000000000000000000000000000000000000000000000810120'

const escrowCreate = {
  TransactionType: 'EscrowCreate',
  Account: wallet.address,
  Destination: destinationAddress,
  Amount: '123456',
  Condition: conditionHex,
  CancelAfter: cancelAfterRippleTime
}
validate(escrowCreate)

console.log('Signing and submitting the EscrowCreate transaction.')
const response = await client.submitAndWait(escrowCreate, {
  wallet,
  autofill: true // Note: fee is higher based on condition size in bytes
})
console.log(JSON.stringify(response.result, null, 2))
const escrowCreateResultCode = response.result.meta.TransactionResult
if (escrowCreateResultCode !== 'tesSUCCESS') {
  console.error(`EscrowCreate failed with code ${escrowCreateResultCode}.`)
  client.disconnect()
  process.exit(1)
}
```

Python
```py
# Create an escrow that won't be finished --------------------------------------
cancel_delay = 30
cancel_after = datetime.now(tz=UTC) + timedelta(seconds=cancel_delay)
print("This escrow will expire after", cancel_after)
cancel_after_rippletime = datetime_to_ripple_time(cancel_after)
# Use a crypto-condition that nobody knows the fulfillment for
condition_hex = "A02580200000000000000000000000000000000000000000000000000000000000000000810120"
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

result_code = response.result["meta"]["TransactionResult"]
if result_code != "tesSUCCESS":
    print(f"EscrowCreate failed with result code {result_code}")
    exit(1)
```

For a more detailed explanation of creating an escrow, see [Send a Timed Escrow](/docs/tutorials/payments/send-a-timed-escrow) or [Send a Conditional Escrow](/docs/tutorials/payments/send-a-conditional-escrow).

### 4. Wait for the escrow to expire

An escrow can only be canceled after it has expired, so you have to wait until its `CancelAfter` (expiration) time has passed. Since the expiration time is compared to the official close time of the previous ledger, which may be rounded up to 10 seconds, waiting an extra 10 seconds makes it very likely that the escrow has officially expired.

JavaScript
```js
// Wait for the escrow to expire -----------------------------------------------
// Since ledger close times can be rounded by up to 10 seconds, wait an extra
// 10 seconds to make sure the escrow has officially expired.
console.log(`Waiting ${cancelDelay + 10} seconds for the escrow to expire...`)
await sleep(cancelDelay + 10)

/* Sleep function that can be used with await */
function sleep (delayInSeconds) {
  const delayInMs = delayInSeconds * 1000
  return new Promise((resolve) => setTimeout(resolve, delayInMs))
}
```

Python
```py
# Wait for the escrow to expire ------------------------------------------------
# Since ledger close times can be rounded by up to 10 seconds, wait an extra
# 10 seconds to make sure the escrow has officially expired.
print(f"Waiting {cancel_delay + 10} seconds for the escrow to expire.")
sleep(cancel_delay + 10)
```

### 5. Look up the official close time of the latest validated ledger

Use the [ledger method](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger) to get the official close time of the most recently validated ledger version. You can use this number to confirm when an escrow has officially expired.

JavaScript
```js
// Look up the official close time of the validated ledger ---------------------
const ledger = await client.request({
  command: 'ledger',
  ledger_index: 'validated'
})
if (ledger.error) {
  console.error(`Error looking up validated ledger: ${ledger.error}`)
  client.disconnect()
  process.exit(1)
}
const closeTime = ledger.result.ledger.close_time
console.log('Latest validated ledger closed at',
  rippleTimeToISOTime(closeTime)
)
const ledgerHash = ledger.result.ledger.ledger_hash
```

Python
```py
# Look up the official close time of the validated ledger ----------------------
validated_ledger = client.request(Ledger(ledger_index="validated"))
close_time = validated_ledger.result["ledger"]["close_time"]
print("Latest validated ledger closed at", 
    ripple_time_to_datetime(close_time)
)
ledger_hash = validated_ledger.result["ledger"]["ledger_hash"]
```

### 6. Look for expired escrows by account

This is one of several ways to find expired escrows. Use the [account_objects method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_objects) to look up escrows linked to your account. (This includes both incoming and outgoing escrows, potentially.) You may need to look through multiple [paginated](/docs/references/http-websocket-apis/api-conventions/markers-and-pagination) results if you have a lot of objects linked to your account.

JavaScript
```js
// Look up escrows connected to the account, handling pagination ---------------
let marker
let expiredEscrow
while (true) {
  console.log(`Requesting page of account_objects with marker ${marker}`)
  const resp = await client.request({
    command: 'account_objects',
    account: wallet.address,
    ledger_hash: ledgerHash,
    type: 'escrow',
    marker
  })
  if (resp.error) {
    console.error('account_objects failed with error', resp)
    client.disconnect()
    process.exit(1)
  }

  // Add new escrows to the full list
  for (const escrow of resp.result.account_objects) {
    if (!escrow.hasOwnProperty('CancelAfter')) {
      console.log('This escrow does not have an expiration.')
    } else if (escrow.CancelAfter < closeTime) {
      console.log('This escrow has expired.')
      expiredEscrow = escrow
      break
    } else {
      const expirationTime = rippleTimeToISOTime(escrow.CancelAfter)
      console.log('This escrow expires at', expirationTime)
    }
  }

  if (expiredEscrow) {
    // Found an expired escrow, stop paginating
    break
  }

  // If there's a marker, loop and fetch the next page of results
  if (resp.result.marker) {
    marker = resp.result.marker
  } else {
    break
  }
}

if (!expiredEscrow) {
  console.error('Did not find any expired escrows.')
  process.exit(1)
}
```

Python
```py
# Look up escrows connected to the account, handling pagination ----------------
expired_escrow = None
marker = None
while True:
    try:
        response = client.request(AccountObjects(
            account=wallet.address,
            ledger_hash=ledger_hash,
            type="escrow",
            marker=marker
        ))
    except Exception as e:
        print(f"Error: account_objects failed: {e}")
        exit(1)

    for escrow in response.result["account_objects"]:
        if "CancelAfter" not in escrow:
            print("This escrow does not have an expiration")
        elif escrow["CancelAfter"] < close_time:
            print("This escrow has expired.")
            expired_escrow = escrow
            break
        else:
            expiration_time = ripple_time_to_datetime(escrow["CancelAfter"])
            print(f"This escrow expires at {expiration_time}.")
    
    if expired_escrow:
        # Found an expired escrow, stop paginating
        break
    
    if "marker" in response.result.keys():
        marker=marker
    else:
        # This is the last page of results
        break

if not expired_escrow:
    print("Did not find any expired escrows.")
    exit(1)
```

### 7. Find the sequence number of the expired escrow

To cancel an escrow, you need to know its owner and the sequence number of the transaction that created it. If you already know the sequence number (for example, you saved it when you created the escrow) you can skip this step. The sample code shows how you can look it up for an unknown escrow using the escrow ledger entry's transaction history.

The `PreviousTxnID` field contains the identifying hash of the last transaction to modify the escrow. Generally, this is the EscrowCreate transaction, so you can look up that transaction, using the [tx method](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/tx) to get the sequence number from the `Sequence` field. If the transaction used a [Ticket](/docs/concepts/accounts/tickets), then the `Sequence` field has a value of `0` and you need to use value of the `TicketSequence` field instead.

The [fixIncludeKeyletFields](/resources/known-amendments#fixincludekeyletfields) (Enabled: 2026-01-27) adds a `Sequence` field to new Escrow ledger entries. For any escrow created after that amendment goes live, you can get the sequence number directly from that field.

In the case that the previous transaction is not an EscrowCreate transaction, you can use *that* transaction's metadata to find the prior value of the same escrow's `PreviousTxnID`, and repeat the process until you find the actual EscrowCreate. In the current XRP Ledger protocol (as of late 2025), this case is extremely rare to impossible, so the sample code does not demonstrate this process.

JavaScript
```js
// Find the sequence number of the expired escrow ------------------------------
let escrow_seq
const txResp = await client.request({
  command: 'tx',
  transaction: expiredEscrow.PreviousTxnID
})
if (txResp.error) {
  console.error("Couldn't get transaction. Maybe this server doesn't have",
    'enough transaction history available?')
  client.disconnect()
  process.exit(1)
}

if (txResp.result.tx_json.TransactionType === 'EscrowCreate') {
  // Save this sequence number for canceling the escrow
  escrow_seq = txResp.result.tx_json.Sequence
  if (escrow_seq === 0) {
    // This transaction used a Ticket, so use TicketSequence instead.
    escrow_seq = response.result.tx_json.TicketSequence
  }
} else {
  console.error("This escrow's previous transaction wasn't EscrowCreate!")
  client.disconnect()
  process.exit(1)
}
```

Python
```py
# Find the sequence number of the expired escrow -------------------------------
response = client.request(Tx(transaction=expired_escrow["PreviousTxnID"]))
if not response.is_successful():
    print("Couldn't get transaction. Maybe this server doesn't have enough "
            "transaction history available?")
    exit(1)

if response.result["tx_json"]["TransactionType"] == "EscrowCreate":
    # Save this sequence number for canceling the escrow
    escrow_seq = response.result["tx_json"]["Sequence"]
    if escrow_seq == 0:
        # This transaction used a Ticket, so use the TicketSequence instead.
        escrow_seq = response.result["tx_json"]["TicketSequence"]
else:
    # Currently, this is impossible since no current transaction can update
    # an escrow without finishing or canceling it. But in the future, if
    # that becomes possible, you would have to look at the transaction
    # metadata to find the previous transaction and repeat until you found
    # the transaction that created the escrow.
    print("The escrow's previous transaction wasn't EscrowCreate!")
    exit(1)
```

### 8. Cancel the escrow

Once you have all the necessary information, send an [EscrowCancel transaction](/docs/references/protocol/transactions/types/escrowcancel) to cancel the escrow. If the transaction succeeds, it deletes the escrow entry and returns the escrowed funds to their source.

JavaScript
In xrpl.js, you can use the [`getBalanceChanges(metadata)`](https://js.xrpl.org/functions/getBalanceChanges.html) utility to parse the validated transaction's metadata for a simplified list of balance changes.

```js
// Send EscrowCancel transaction -----------------------------------------------
const escrowCancel = {
  TransactionType: 'EscrowCancel',
  Account: wallet.address,
  Owner: expiredEscrow.Account,
  OfferSequence: escrow_seq
}
validate(escrowCancel)

console.log('Signing and submitting the EscrowCancel transaction.')
const cancelResponse = await client.submitAndWait(escrowCancel, {
  wallet,
  autofill: true
})
console.log(JSON.stringify(cancelResponse.result, null, 2))
const cancelResultCode = cancelResponse.result.meta.TransactionResult
if (cancelResultCode !== 'tesSUCCESS') {
  console.error(`EscrowCancel failed with result code ${cancelResultCode}`)
  client.disconnect()
  process.exit(1)
}

console.log('Escrow canceled. Balance changes:')
console.log(JSON.stringify(getBalanceChanges(cancelResponse.result.meta), null, 2))

client.disconnect()
```

Python
In xrpl-py, you can use the [`get_balance_changes(metadata)`](https://xrpl-py.readthedocs.io/en/stable/source/xrpl.utils.html#xrpl.utils.get_balance_changes) utility to parse the validated transaction's metadata for a simplified list of balance changes.

```py
# Send EscrowCancel transaction ------------------------------------------------
escrow_cancel = EscrowCancel(
    account=wallet.address,
    owner=expired_escrow["Account"],
    offer_sequence=escrow_seq
)
print("Signing and submitting the EscrowCancel transaction.")
response2 = submit_and_wait(escrow_cancel, client, wallet, autofill=True)
print(json.dumps(response2.result, indent=2))

result_code = response2.result["meta"]["TransactionResult"]
if result_code != "tesSUCCESS":
    print(f"EscrowCancel failed with result code {result_code}")
    exit(1)

print("Escrow canceled. Balance changes:")
print(json.dumps(get_balance_changes(response2.result["meta"]), indent=2))
```

## See Also

- **Concepts:**
  - [Escrow](/docs/concepts/payment-types/escrow)
- **Tutorials:**
  - [Send XRP](/docs/tutorials/payments/send-xrp)
  - [Look Up Transaction Results](/docs/concepts/transactions/finality-of-results/look-up-transaction-results)
  - [Reliable Transaction Submission](/docs/concepts/transactions/reliable-transaction-submission)
- **References:**
  - [EscrowCancel transaction](/docs/references/protocol/transactions/types/escrowcancel)
  - [EscrowCreate transaction](/docs/references/protocol/transactions/types/escrowcreate)
  - [EscrowFinish transaction](/docs/references/protocol/transactions/types/escrowfinish)
  - [account_objects method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_objects)
  - [ledger method](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger)
  - [tx method](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/tx)
  - [Escrow entry](/docs/references/protocol/ledger-data/ledger-entry-types/escrow)