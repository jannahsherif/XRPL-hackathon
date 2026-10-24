# Freeze a Trust Line

This tutorial shows the steps to [freeze an individual trust line](/docs/concepts/tokens/fungible-tokens/freezes#individual-freeze). The issuer of a token in the XRP Ledger may freeze the trust line to a particular counterparty if that account is engaged in suspicious activity.

As a reminder, freezes only apply to issued tokens, not XRP.

## Prerequisites

- You need a connection to the XRP Ledger network. As shown in this tutorial, you can use public servers for testing.
- You should be familiar with the Getting Started instructions for your preferred client library. This page provides examples for the following:
  - **JavaScript** with the [xrpl.js library](https://github.com/XRPLF/xrpl.js/). See [Get Started Using JavaScript](/docs/tutorials/get-started/get-started-javascript) for setup steps.
- This tutorial assumes **you have already [issued a token](/docs/tutorials/tokens/fungible-tokens/issue-a-fungible-token)** in the XRP Ledger.
- You **cannot** have enabled the [No Freeze setting](/docs/concepts/tokens/fungible-tokens/freezes#no-freeze), which gives up your ability to freeze individual trust lines.


script
script
## Example Code

Complete sample code for all of the steps of this tutorial is available under the [MIT license](https://github.com/XRPLF/xrpl-dev-portal/blob/master/LICENSE).

- See [Code Samples: Freeze](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/freeze/) in the source repository for this website.


## Steps

### 1. Get Credentials

To transact on the XRP Ledger, you need an address and secret key, and some XRP. If you use the best practice of having separate ["cold" and "hot" addresses](/docs/concepts/accounts/account-types), you need the keys to the *cold address*, which is the **issuer** of the token.

Get Testnet credentials

div
Ripple provides the [Testnet and Devnet](/docs/concepts/networks-and-servers/parallel-networks) for testing purposes only, and sometimes resets the state of these test networks along with all balances. As a precaution, **do not** use the same addresses on Testnet/Devnet and Mainnet.

### 2. Connect to the Network

You must be connected to the network to submit transactions to it. The following code shows how to connect to a public XRP Ledger Testnet server using a supported [client library](/docs/references/client-libraries):

JavaScript
```js
// You can also use a <script> tag in browsers or require('xrpl') in Node.js
import xrpl from 'xrpl'

// Define the network client
const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
await client.connect()

// ... custom code goes here

// Disconnect when done (If you omit this, Node.js won't end the process)
client.disconnect()
```

WebSocket
```
(Connect to wss:// URL of an XRP Ledger server using your preferred client.)
```

For purposes of this tutorial, use the following interface to connect and perform setup:

Connect to Testnet

div
strong
Connection status: 
span
Not connected
### 3. Choose Trust Line

You can only freeze one trust line per transaction, so you need to know which trust line you want. Each of your trust lines is uniquely identified by these 3 things:

- Your own address.
- The address of the account linked to yours via the trust line.
- The currency code of the trust line.


There can be multiple [trust lines](/docs/concepts/tokens/fungible-tokens) between two accounts, each for a different currency. If you suspect a particular account is behaving maliciously, you may want to freeze all the trust lines between your accounts, one at a time. Use the [account_lines method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_lines) with a pair of accounts to find all trust lines between those accounts, then choose a trust line to freeze from among the results. For example:

JavaScript
```js
  // Look up current trust lines -----------------------------------------------
  const issuing_address = wallet.address
  const address_to_freeze = 'rhPuJPcd9kcSRCGHWudV3tjUuTvvysi6sv'
  const currency_to_freeze = 'FOO'

  console.log('Looking up', currency_to_freeze, 'trust line from',
              issuing_address, 'to', address_to_freeze)
  const account_lines = await client.request({
    "command": "account_lines",
    "account": issuing_address,
    "peer": address_to_freeze,
    "ledger_index": "validated"
  })
  const trustlines = account_lines.result.lines
  console.log("Found lines:", trustlines)

  // Find the trust line for our currency_to_freeze ----------------------------
  let trustline = null
  for (let i = 0; i < trustlines.length; i++) {
    if(trustlines[i].currency === currency_to_freeze) {
      trustline = trustlines[i]
      break
    }
  }

  if (trustline === null) {
    console.error(`Couldn't find a ${currency_to_freeze} trustline between
                  ${issuing_address} and ${address_to_freeze}`)
    return
  }
```

WebSocket
```json
Example Request:

{
  "id": "example_look_up_trust_lines",
  "command": "account_lines",
  "account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
  "peer": "rsA2LpzuawewSBQXkiju3YQTMzW13pAAdW",
  "ledger_index": "validated"
}

// Example Response:

{
  "id": "example_look_up_trust_lines",
  "result": {
    "account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "ledger_hash": "AF5C6E6FBC44183D8662C7F5BF88D52F99738A0E66FF07FC7B5A516AC8EA1B37",
    "ledger_index": 67268474,
    "lines": [
      {
        "account": "rsA2LpzuawewSBQXkiju3YQTMzW13pAAdW",
        "balance": "0",
        "currency": "USD",
        "limit": "0",
        "limit_peer": "110",
        "quality_in": 0,
        "quality_out": 0
      }
    ],
    "validated": true
  },
  "status": "success",
  "type": "response"
}
```

For purposes of this tutorial, a second test address has created a trust line to the test address for the currency "FOO", which you can see in the following example:

Choose Trust Line
div
img
Waiting for setup to complete...
input
button
Choose Trust Line
div
img
Looking...
div
### 4. Send TrustSet Transaction to Freeze the Trust Line

To enable or disable an Individual Freeze on a specific trust line, send a [TrustSet transaction](/docs/references/protocol/transactions/types/trustset) with the [`tfSetFreeze` flag enabled](/docs/references/protocol/transactions/types/trustset#trustset-flags). The fields of the transaction should be as follows:

| Field | Value | Description |
|  --- | --- | --- |
| `Account` | String | Your issuing account's address. |
| `TransactionType` | String | `TrustSet` |
| `LimitAmount` | Object | Object defining the trust line to freeze. |
| `LimitAmount`.`currency` | String | Currency of the trust line (cannot be XRP) |
| `LimitAmount`.`issuer` | String | The XRP Ledger address of the counterparty to freeze |
| `LimitAmount`.`value` | String | The amount of currency you trust this counterparty to issue to you, as a quoted number. As an issuer, this is typically `"0"`. |
| `Flags` | Number | To enable a freeze, turn on the `tfSetFreeze` bit (`0x00100000`). |


As always, to send a transaction, you *prepare* it by filling in all the necessary fields, *sign* it with your cryptographic keys, and *submit* it to the network. For example:

JavaScript
```js
  // Send a TrustSet transaction to set an individual freeze -------------------
  // Construct a TrustSet, preserving our existing limit value
  const trust_set = {
    "TransactionType": 'TrustSet',
    "Account": issuing_address,
    "LimitAmount": {
      "value": trustline.limit,
      "currency": trustline.currency,
      "issuer": trustline.account
    },
    "Flags": xrpl.TrustSetFlags.tfSetFreeze
  }

  // Best practice for JavaScript users: use validate(tx_json) to confirm
  // that a transaction is well-formed or throw ValidationError if it isn't.
  xrpl.validate(trust_set)

  console.log('Submitting TrustSet tx:', trust_set)
  const result = await client.submitAndWait(trust_set, { wallet: wallet })
  console.log("Transaction result:", result)

  // Confirm trust line status -------------------------------------------------
  const account_lines_2 = await client.request({
    "command": "account_lines",
    "account": issuing_address,
    "peer": address_to_freeze,
    "ledger_index": "validated"
  })
  const trustlines_2 = account_lines_2.result.lines

  let line = null
  for (let i = 0; i < trustlines_2.length; i++) {
    if(trustlines_2[i].currency === currency_to_freeze) {
      line = trustlines_2[i]
      console.log(`Status of ${currency_to_freeze} line between
          ${issuing_address} and ${address_to_freeze}:
          ${JSON.stringify(line, null, 2)}`)
      if (line.freeze === true) {
        console.log(`✅ Line is frozen.`)
      } else {
        console.error(`❌ Line is NOT FROZEN.`)
      }
    }
  }
  if (line === null) {
    console.error(`Couldn't find a ${CURRENCY_TO_FREEZE} line between
        ${issuing_address} and ${address_to_freeze}.`)
  }
```

WebSocket
```json
{
  "id": "example_freeze_individual_line",
  "command": "submit",
  "tx_json": {
    "TransactionType": "TrustSet",
    "Account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "Fee": "12",
    "Flags": 1048576,
    "LastLedgerSequence": 18103014,
    "LimitAmount": {
      "currency": "USD",
      "issuer": "rsA2LpzuawewSBQXkiju3YQTMzW13pAAdW",
      "value": "0"
    },
    "Sequence": 340
  },
  "secret": "s████████████████████████████"
}
```

Send TrustSet to Freeze
Send TrustSet (Freeze)

div
If you want to freeze multiple trust lines in different currencies with the same counterparty, repeat this step for each trust line. It is possible to send several transactions in a single ledger if you use a different [sequence number](/docs/references/protocol/data-types/basic-data-types#account-sequence) for each transaction. 

### 5. Wait for Validation

Most transactions are accepted into the next ledger version after they're submitted, which means it may take 4-7 seconds for a transaction's outcome to be final. If the XRP Ledger is busy or poor network connectivity delays a transaction from being relayed throughout the network, a transaction may take longer to be confirmed. (For information on how to set an expiration for transactions, see [Reliable Transaction Submission](/docs/concepts/transactions/reliable-transaction-submission).)

table
tbody
tr
th
Transaction ID:
td
(None)
tr
th
Latest Validated Ledger Index:
td
(Not connected)
tr
th
Ledger Index at Time of Submission:
td
(Not submitted)
tr
th
Transaction 
code
LastLedgerSequence
:
td
(Not prepared)
tr
### 6. Check Trust Line Freeze Status

At this point, the trust line from the counterparty should be frozen. You can check the freeze status of any trust line using the [account_lines method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_lines) with the following fields:

| Field | Value | Description |
|  --- | --- | --- |
| `account` | String | Your address. (In this case, the issuing address.) |
| `peer` | String | The address of the counterparty. |


The response includes *all* trust lines between the two accounts. (Each different currency code uses a different trust line.) Be sure to check the one for the right token.

In the response, the field `"freeze": true` indicates that the account from the request has enabled an Individual Freeze on that trust line. The field `"freeze_peer": true` indicates that the counterparty (`peer`) from the request has frozen the trust line. For example:

JavaScript
```js
  // Confirm trust line status -------------------------------------------------
  const account_lines_2 = await client.request({
    "command": "account_lines",
    "account": issuing_address,
    "peer": address_to_freeze,
    "ledger_index": "validated"
  })
  const trustlines_2 = account_lines_2.result.lines

  let line = null
  for (let i = 0; i < trustlines_2.length; i++) {
    if(trustlines_2[i].currency === currency_to_freeze) {
      line = trustlines_2[i]
      console.log(`Status of ${currency_to_freeze} line between
          ${issuing_address} and ${address_to_freeze}:
          ${JSON.stringify(line, null, 2)}`)
      if (line.freeze === true) {
        console.log(`✅ Line is frozen.`)
      } else {
        console.error(`❌ Line is NOT FROZEN.`)
      }
    }
  }
  if (line === null) {
    console.error(`Couldn't find a ${CURRENCY_TO_FREEZE} line between
        ${issuing_address} and ${address_to_freeze}.`)
  }
```

WebSocket
```json
Example Request:

{
  "id": "example_check_individual_freeze",
  "command": "account_lines",
  "account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
  "ledger_index": "validated",
  "peer": "rsA2LpzuawewSBQXkiju3YQTMzW13pAAdW"
}

Example Response:

{
  "id": "example_check_individual_freeze",
  "status": "success",
  "type": "response",
  "result": {
    "account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "lines": [
      {
        "account": "rsA2LpzuawewSBQXkiju3YQTMzW13pAAdW",
        "balance": "10",
        "currency": "USD",
        "freeze": true,
        "limit": "0",
        "limit_peer": "110",
        "quality_in": 0,
        "quality_out": 0
      }
    ]
  }
}
```

Check Freeze Status
Check Trust Line

div
### 7. (Optional) Send TrustSet Transaction to End the Freeze

If you decide that the trust line no longer needs to be frozen (for example, you investigated and decided that the suspicious activity was benign), you can end the individual freeze in almost the same way that you froze the trust line in the first place. To end an individual freeze, send a [TrustSet transaction](/docs/references/protocol/transactions/types/trustset) with the [`tfClearFreeze` flag enabled](/docs/references/protocol/transactions/types/trustset#trustset-flags). The other fields of the transaction should be the same as when you froze the trust line:

| Field | Value | Description |
|  --- | --- | --- |
| `Account` | String | Your issuing account's address. |
| `TransactionType` | String | `TrustSet` |
| `LimitAmount` | Object | Object defining the trust line to unfreeze. |
| `LimitAmount`.`currency` | String | Currency of the trust line (cannot be XRP) |
| `LimitAmount`.`issuer` | String | The XRP Ledger address of the counterparty to unfreeze |
| `LimitAmount`.`value` | String | The amount of currency you trust this counterparty to issue to you, as a quoted number. As an issuer, this is typically `"0"`. |
| `Flags` | Number | To end an individual freeze, turn on the `tfClearFreeze` bit (`0x00200000`) |


As always, to send a transaction, you *prepare* it by filling in all the necessary fields, *sign* it with your cryptographic keys, and *submit* it to the network. For example:

JavaScript
```js
  // Clear the individual freeze -----------------------------------------------
  // We're reusing our TrustSet transaction from earlier with a different flag.
  trust_set.Flags = xrpl.TrustSetFlags.tfClearFreeze

  // Submit a TrustSet transaction to clear an individual freeze ---------------
  console.log('Submitting TrustSet tx:', trust_set)
  const result2 = await client.submitAndWait(trust_set, { wallet: wallet })
  console.log("Transaction result:", result2)

  console.log("Finished submitting. Now disconnecting.")
  await client.disconnect()
```

WebSocket
```json
{
  "id": "example_end_individual_freeze",
  "command": "submit",
  "tx_json": {
    "TransactionType": "TrustSet",
    "Account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "Fee": "12",
    "Flags": 2097152,
    "LastLedgerSequence": 18105115,
    "LimitAmount": {
      "currency": "USD",
      "issuer": "rsA2LpzuawewSBQXkiju3YQTMzW13pAAdW",
      "value": "0"
    },
    "Sequence": 341
  },
  "secret": "s████████████████████████████"
}
```

Send TrustSet to End Freeze
Send TrustSet (End Freeze)

div
### 8. Wait for Validation

As before, wait for the transaction to be validated by consensus.

table
tbody
tr
th
Transaction ID:
td
(None)
tr
th
Latest Validated Ledger Index:
td
(Not connected)
tr
th
Ledger Index at Time of Submission:
td
(Not submitted)
tr
th
Transaction 
code
LastLedgerSequence
:
td
(Not prepared)
tr
## See Also

- **Concepts:**
  - [Freezing Issued Currencies](/docs/concepts/tokens/fungible-tokens/freezes)
  - [Trust Lines](/docs/concepts/tokens/fungible-tokens)
- **Tutorials:**
  - [Enable No Freeze](/docs/tutorials/tokens/fungible-tokens/enable-no-freeze)
  - [Enact Global Freeze](/docs/tutorials/tokens/fungible-tokens/enact-global-freeze)
  - [Remove a Regular Key Pair](/docs/tutorials/best-practices/key-management/remove-a-regular-key-pair)
- **References:**
  - [account_lines method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_lines)
  - [account_info method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_info)
  - [AccountSet transaction](/docs/references/protocol/transactions/types/accountset)
  - [TrustSet transaction](/docs/references/protocol/transactions/types/trustset)
  - [AccountRoot Flags](/docs/references/protocol/ledger-data/ledger-entry-types/accountroot#accountroot-flags)
  - [RippleState (trust line) Flags](/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate#ripplestate-flags)