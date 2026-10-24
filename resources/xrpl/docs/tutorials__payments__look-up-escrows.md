# Look up Escrows

This tutorial shows how to look up outstanding [escrows](/docs/concepts/payment-types/escrow) in the XRP Ledger by their sender or recipient's address.

For escrows that were created *before* the [fix1523 amendment](/resources/known-amendments#fix1523) was enabled on 2017-11-14, you can only look up those escrows by sender address, not by the recipient's address.

## Goals

By following this tutorial, you should learn how to:

- Read a paginated response from the [account_objects method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_objects).
- Identify when an escrow is mature or if it has expired.


## Prerequisites

To complete this tutorial, you should:

- Have a basic understanding of the XRP Ledger.
- Have an [XRP Ledger client library](/docs/references/client-libraries), such as **xrpl.js**, installed.


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

To get started, import the client library and instantiate an API client. For this tutorial, you also need the address of an account that has one or more pending escrows. The sample code uses a Mainnet address that has been set up with at least one incoming and one outgoing escrow that should remain in place until 2035 at least.

JavaScript
```js
import { Client, dropsToXrp, rippleTimeToISOTime } from 'xrpl'

// Set up client and address
const address = 'rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn'
console.log('Connecting to Mainnet...')
const client = new Client('wss://xrplcluster.com/')
await client.connect()
```

Python
```py
from xrpl.clients import JsonRpcClient
from xrpl.models.requests import AccountObjects, Ledger
from xrpl.utils import ripple_time_to_datetime, drops_to_xrp

address = "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"
client = JsonRpcClient("https://xrplcluster.com/")
```

### 3. Get the latest validated ledger

To know if escrows have matured or expired, you need to know the official close time of the most recently validated ledger. Use the [ledger method](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger) to get the latest validated ledger, and save its `close_time` and `ledger_hash` values to use when looking up escrows.

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
const close_time = ledger.result.ledger.close_time
const ledger_hash = ledger.result.ledger.ledger_hash
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

### 4. Look up escrows linked to the account

To get a list of all escrows linked to an account, use the [account_objects method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_objects) with the results filtered to the escrow type. The list may be [paginated](/docs/references/http-websocket-apis/api-conventions/markers-and-pagination), so you may need to make multiple requests to get them all, depending on how many objects are linked to the account. Due to the way filtering works, some pages may be empty even if there are more escrows on later pages.

JavaScript
```js
// Look up objects filtered to escrows, handling pagination --------------------
let marker
const escrows = []
while (true) {
  console.log(`Requesting page of account_objects with marker ${marker}`)
  const resp = await client.request({
    command: 'account_objects',
    account: address,
    ledger_hash, // Caution: if you use a shortcut
    // such as "validated", the ledger may
    // change during iteration, leading to
    // inconsistent results.
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
    escrows.push(escrow)
  }

  // If there's a marker, loop and fetch the next page of results
  if (resp.result.marker) {
    marker = resp.result.marker
  } else {
    break
  }
}
```

Python
```py
# Look up objects filtered to escrows, handling pagination ---------------------
escrows = []
marker = None
while True:
    try:
        response = client.request(AccountObjects(
            account=address,
            ledger_hash=ledger_hash, # Caution: if you use a shortcut such as
                                     # ledger_index="validated", the ledger may
                                     # change during iteration, leading to
                                     # inconsistent results.
            type="escrow",
            marker=marker
        ))
    except Exception as e:
        print(f"Error: account_objects failed: {e}")
        exit(1)

    # Concatenate escrows from this page to the full list
    escrows += response.result["account_objects"]

    # If there's a marker, loop and fetch the next page of results
    if "marker" in response.result.keys():
        marker=marker
    else:
        break
```

### 5. Define helper function for displaying amounts

With [TokenEscrow](/resources/known-amendments#tokenescrow) (Enabled: 2026-02-12), escrows can send three types of funds: XRP, [trust line tokens](/docs/concepts/tokens/fungible-tokens/trust-line-tokens), or [multi-purpose tokens](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens). To help handle all three types of amount object, create a function that takes an unknown amount value from the ledger and returns a string containing a display value that is more human-readable.

This sample function provides only the most basic level of formatting for currency amounts. Better user interfaces can and should provide a higher level of parsing, including normalizing currency codes and looking up MPT information.

JavaScript
```js
// Define helper function for displaying amounts -------------------------------
function display_amount (amount) {
  if (typeof amount === 'string') {
    // amount is drops of XRP.
    const decimal_xrp = dropsToXrp(amount)
    return `${decimal_xrp} XRP`
  } else if (amount.hasOwnProperty('mpt_issuance_id')) {
    // amount is an MPT.
    // More info may be available, but that would require looking it up.
    return `${amount.value} units of MPT ${amount.mpt_issuance_id}`
  } else if (amount.hasOwnProperty('issuer')) {
    // amount is a trust line token.
    // Currency may be 3 chars or hex. For guidelines parsing hex codes,
    // see "Normalize Currency Codes" code sample.
    return `${amount.value} ${amount.currency} issued by ${amount.issuer}`
  }
  console.error(`Unexpected type of amount: ${amount}`)
  client.disconnect()
  process.exit(1)
}
```

Python
```py
# Define helper function for displaying amounts --------------------------------
def display_amount(amount):
    if type(amount) == str:
        # amount is drops of XRP
        decimal_xrp = drops_to_xrp(amount)
        return f"{decimal_xrp} XRP"
    elif "mpt_issuance_id" in amount.keys():
        # amount is an MPT.
        # More info may be available, but that would require looking it up.
        return f"{amount['value']} units of MPT {amount['mpt_issuance_id']}"
    elif "issuer" in amount.keys():
        # amount is a trust line token.
        # Currency may be 3 chars or hex. For guidelines parsing hex codes,
        # see "Normalize Currency Codes" code sample.
        return f"{amount['value']} {amount['currency']} issued by {amount['issuer']}"
    
    print(f"Unexpected type of amount: {amount}")
    exit(1)
```

### 6. Display information about the escrows

Each entry in the list you built earlier should be an [Escrow entry](/docs/references/protocol/ledger-data/ledger-entry-types/escrow) sent either to or from the account whose address you specified when looking them up. Use the fields of those objects to display more information about the escrows.

For the `FinishAfter` (maturity time) and `CancelAfter` (expiration time) fields, compare them to the official close time of the most recently validated ledger to see if the escrow has matured or expired, respectively. These fields are formatted natively as [seconds since the Ripple Epoch](/docs/references/protocol/data-types/basic-data-types#specifying-time), so be sure to convert them to a more human-readable format for display.

JavaScript
```js
// Summarize results -----------------------------------------------------------
console.log(`Found ${escrows.length} escrow(s).`)

for (const escrow of escrows) {
  if (escrow.Account === address) {
    console.log(`Outgoing escrow to ${escrow.Destination}`)
  } else if (escrow.Destination === address) {
    console.log(`Incoming escrow from ${escrow.Account}`)
  } else {
    console.log('Neither incoming nor outgoing? This is unexexpected.')
  }

  console.log(`  Amount: ${display_amount(escrow.Amount)}`)

  if (escrow.hasOwnProperty('Condition')) {
    console.log(`  Condition: ${escrow.Condition}`)
  }

  if (escrow.FinishAfter) {
    const mature_time_display = rippleTimeToISOTime(escrow.FinishAfter)
    if (escrow.FinishAfter < close_time) {
      console.log(`  Matured at ${mature_time_display}`)
    } else {
      console.log(`  Will mature at ${mature_time_display}`)
    }
  }

  if (escrow.hasOwnProperty('CancelAfter')) {
    const cancel_time_display = rippleTimeToISOTime(escrow.CancelAfter)
    if (escrow.CancelAfter < close_time) {
      console.log(`  EXPIRED at ${cancel_time_display}`)
    } else {
      console.log(`  Expires at ${cancel_time_display}`)
    }
  }
}

client.disconnect()
```

When done, disconnect the WebSocket client.

Python
```py
# Summarize results ------------------------------------------------------------
print(f"Found {len(escrows)} escrow(s).")

for escrow in escrows:
    if escrow['Account'] == address:
        print(f"Outgoing escrow to {escrow['Destination']}")
    elif escrow['Destination'] == address:
        print(f"Incoming escrow from {escrow['Account']}")
    else:
        print("Neither incoming nor outgoing? This is unexpected.")
    
    if "Condition" in escrow.keys():
        print(f"  Condition: {escrow['Condition']}")
    
    if "FinishAfter" in escrow.keys():
        mature_time_display = ripple_time_to_datetime(escrow['FinishAfter'])
        if escrow["FinishAfter"] < close_time:
            print("  Matured at", mature_time_display)
        else:
            print("  Will mature at", mature_time_display)

    if "CancelAfter" in escrow.keys():
        cancel_time_display = ripple_time_to_datetime(escrow['CancelAfter'])
        if escrow["CancelAfter"] < close_time:
            print("  EXPIRED AT", cancel_time_display)
        else:
            print("  Expires at", cancel_time_display)
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
  - [tx method](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/tx)
  - [Escrow entry](/docs/references/protocol/ledger-data/ledger-entry-types/escrow)