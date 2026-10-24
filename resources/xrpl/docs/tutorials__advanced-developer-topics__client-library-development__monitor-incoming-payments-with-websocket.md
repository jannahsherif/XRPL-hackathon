# Monitor Incoming Payments with WebSocket

This tutorial shows how to monitor for incoming [payments](/docs/concepts/payment-types) using the [WebSocket API](/docs/references/http-websocket-apis). Since all XRP Ledger transactions are public, anyone can monitor incoming payments to any address.

WebSocket follows a model where the client and server open one connection, then send messages both ways through the same connection, which stays open until explicitly closed (or until the connection fails). This is in contrast to the HTTP-based API model (including JSON-RPC and RESTful APIs), where the client opens and closes a new connection for each request.[¹](#footnote-1)

The examples in this page use JavaScript so that the examples can run natively in a web browser. If you are developing in JavaScript, you can also use the [xrpl.js library for JavaScript](https://js.xrpl.org/) to simplify some tasks. This tutorial shows how to monitor for transactions *without* using a xrpl.js so that you can translate the steps to other programming languages that don't have a native XRP Ledger client library.

## Prerequisites

- The examples in this page use JavaScript and the WebSocket protocol, which are available in all major modern browsers. If you have some JavaScript knowledge and expertise in another programming language with a WebSocket client, you can follow along while adapting the instructions to the language of your choice.
- You need a stable internet connection and access to an XRP Ledger server. The embedded examples connect to Ripple's pool of public servers. If you [run your own `xrpld` or Clio server](/docs/infrastructure/installation), you can also connect to that server locally.
- To properly handle XRP values without rounding errors, you need access to a number type that can do math on 64-bit unsigned integers. The examples in this tutorial use [big.js](https://github.com/MikeMcl/big.js/). If you are working with [tokens](/docs/concepts/tokens), you need even more precision. For more information, see [Currency Precision](/docs/references/protocol/data-types/currency-formats#xrp-precision).


script
script
script
// Helper stuff for this interactive tutorial specifically

function writeToConsole(console_selector, message) {
  let write_msg = "<div class='console-entry'>" + message + "</div>"
  $(console_selector).find(".placeholder").remove()
  $(console_selector).append(write_msg)
  // TODO: JSON pretty-printing, maybe w/ multiple input args?
}

## 1. Connect to the XRP Ledger

The first step of monitoring for incoming payments is to connect to the XRP Ledger, specifically an `xrpld` server.

The following JavaScript code connects to one of Ripple's public server clusters. It then logs a message to the console, sends a request using the [ping method](/docs/references/http-websocket-apis/public-api-methods/utility-methods/ping) and sets up a handler to log to the console again when it receives any message from the server side.

```js
const socket = new WebSocket('wss://s.altnet.rippletest.net:51233')
socket.addEventListener('open', (event) => {
  // This callback runs when the connection is open
  console.log("Connected!")
  const command = {
    "id": "on_open_ping_1",
    "command": "ping"
  }
  socket.send(JSON.stringify(command))
})
socket.addEventListener('message', (event) => {
  console.log('Got message from server:', event.data)
})
socket.addEventListener('close', (event) => {
  // Use this event to detect when you have become disconnected
  // and respond appropriately.
  console.log('Disconnected...')
})
```

The above example opens a secure connection (`wss://`) to one of Ripple's public API servers on the [Test Net](/resources/dev-tools/xrp-faucets). To connect to a locally-running `xrpld` server with the default configuration instead, open an *unsecured* connection (`ws://`) on port **6006** locally, using the following first line:

```js
const socket = new WebSocket('ws://localhost:6006')
```

By default, connecting to a local `xrpld` server gives you access to the full set of [admin methods](/docs/references/http-websocket-apis/admin-api-methods) and admin-only data in some responses such as [server_info](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_info), plus the [public methods](/docs/references/http-websocket-apis/public-api-methods) that are available when you connect to public servers over the internet.

Example:

Connect
Connect
Connection status:
Not connected

h5
Console:
div
span
(Log is empty)
script
let socket;
$("#connect-socket-button").click((event) => {
  socket = new WebSocket('wss://s.altnet.rippletest.net:51233')
  socket.addEventListener('open', (event) => {
    // This callback runs when the connection is open
    writeToConsole("#monitor-console-connect", "Connected!")
    $("#connection-status").text("Connected")
    const command = {
      "id": "on_open_ping_1",
      "command": "ping"
    }
    socket.send(JSON.stringify(command))

    complete_step("Connect")
    $("#connect-button").prop("disabled", "disabled")
    $("#enable_dispatcher").prop("disabled",false)
  })
  socket.addEventListener('close', (event) => {
    $("#connection-status").text("Disconnected")
    $("#connect-button").prop("disabled", false)
  })
  socket.addEventListener('message', (event) => {
    writeToConsole("#monitor-console-connect", "Got message from server: " +
          JSON.stringify(event.data))
  })
})

## 2. Dispatch Incoming Messages to Handlers

Since WebSocket connections can have several messages going each way and there is not a strict 1:1 correlation between requests and responses, you need to identify what to do with each incoming message. A good model for coding this is to set up a "dispatcher" function that reads incoming messages and relays each message to the correct code path for handling it. To help dispatch messages appropriately, the `xrpld` server provides a `type` field on every WebSocket message:

- For any message that is a direct response to a request from the client side, the `type` is the string `response`. In this case, the server also provides the following:
  - An `id` field that matches the `id` provided in the request this is a response for. (This is important because responses may arrive out of order.)
  - A `status` field that indicates whether the API successfully processed your request. The string value `success` indicates [a successful response](/docs/references/http-websocket-apis/api-conventions/response-formatting). The string value `error` indicates [an error](/docs/references/http-websocket-apis/api-conventions/error-formatting).
When submitting transactions, a `status` of `success` at the top level of the WebSocket message does not mean that the transaction itself succeeded. It only indicates that the server understood your request. For looking up a transaction's actual outcome, see [Look Up Transaction Results](/docs/concepts/transactions/finality-of-results/look-up-transaction-results).
- For follow-up messages from [subscriptions](/docs/references/http-websocket-apis/public-api-methods/subscription-methods/subscribe), the `type` indicates the type of follow-up message it is, such as the notification of a new transaction, ledger, or validation; or a follow-up to an ongoing [pathfinding request](/docs/references/http-websocket-apis/public-api-methods/path-and-order-book-methods/path_find). Your client only receives these messages if it subscribes to them.


The [xrpl.js library for JavaScript](https://js.xrpl.org/) handles this step by default. All asynchronous API requests use Promises to provide the response, and you can listen to streams using the `.on(event, callback)` method of the `Client`.

The following JavaScript code defines a helper function to make API requests into convenient asynchronous [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises), and sets up an interface to map other types of messages to global handlers:

```js
const AWAITING = {}
const handleResponse = function(data) {
  if (!data.hasOwnProperty("id")) {
    console.error("Got response event without ID:", data)
    return
  }
  if (AWAITING.hasOwnProperty(data.id)) {
    AWAITING[data.id].resolve(data)
  } else {
    console.warn("Response to un-awaited request w/ ID " + data.id)
  }
}

let autoid_n = 0
function api_request(options) {
  if (!options.hasOwnProperty("id")) {
    options.id = "autoid_" + (autoid_n++)
  }

  let resolveHolder;
  AWAITING[options.id] = new Promise((resolve, reject) => {
    // Save the resolve func to be called by the handleResponse function later
    resolveHolder = resolve
    try {
      // Use the socket opened in the previous example...
      socket.send(JSON.stringify(options))
    } catch(error) {
      reject(error)
    }
  })
  AWAITING[options.id].resolve = resolveHolder;
  return AWAITING[options.id]
}

const WS_HANDLERS = {
  "response": handleResponse
  // Fill this out with your handlers in the following format:
  // "type": function(event) { /* handle event of this type */ }
}
socket.addEventListener('message', (event) => {
  const parsed_data = JSON.parse(event.data)
  if (WS_HANDLERS.hasOwnProperty(parsed_data.type)) {
    // Call the mapped handler
    WS_HANDLERS[parsed_data.type](parsed_data)
  } else {
    console.log("Unhandled message from server", event)
  }
})

// Show api_request functionality
async function pingpong() {
  console.log("Ping...")
  const response = await api_request({command: "ping"})
  console.log("Pong!", response)
}
// Add pingpong() to the 'open' listener for socket
```

Dispatch Messages
Enable Dispatcher
Ping!

h5
Responses
div
span
(Log is empty)
script
const AWAITING = {}
const handleResponse = function(data) {
  if (!data.hasOwnProperty("id")) {
    writeToConsole("#monitor-console-ping", "Got response event without ID:", data)
    return
  }
  if (AWAITING.hasOwnProperty(data.id)) {
    AWAITING[data.id].resolve(data)
  } else {
    writeToConsole("#monitor-console-ping", "Response to un-awaited request w/ ID " + data.id)
  }
}

let autoid_n = 0
function api_request(options) {
  if (!options.hasOwnProperty("id")) {
    options.id = "autoid_" + (autoid_n++)
  }
  let resolveFunc;
  AWAITING[options.id] = new Promise((resolve, reject) => {
    // Save the resolve func to be called by the handleResponse function later
    resolveFunc = resolve
    try {
      // Use the socket opened in the previous example...
      socket.send(JSON.stringify(options))
    } catch(error) {
      reject(error)
    }
  })
  AWAITING[options.id].resolve = resolveFunc
  return AWAITING[options.id]
}

const WS_HANDLERS = {
  "response": handleResponse
}
$("#enable_dispatcher").click((clickEvent) => {
  socket.addEventListener('message', (event) => {
    const parsed_data = JSON.parse(event.data)
    if (WS_HANDLERS.hasOwnProperty(parsed_data.type)) {
      // Call the mapped handler
      WS_HANDLERS[parsed_data.type](parsed_data)
    } else {
      writeToConsole("#monitor-console-ping", "Unhandled message from server: " + event)
    }
  })
  complete_step("Dispatch Messages")
  $("#dispatch_ping").prop("disabled", false)
  $("#tx_subscribe").prop("disabled", false)
})

async function pingpong() {
  const response = await api_request({command: "ping"})
  writeToConsole("#monitor-console-ping", "Pong! " + JSON.stringify(response))
}

$("#dispatch_ping").click((event) => {
  pingpong()
})

## 3. Subscribe to the Account

To get a live notification whenever a transaction affects your account, you can subscribe to the account with the [subscribe method](/docs/references/http-websocket-apis/public-api-methods/subscription-methods/subscribe). In fact, it doesn't have to be your own account: since all transactions are public, you can subscribe to any account or even a combination of accounts.

After you subscribe to one or more accounts, the server sends a message with `"type": "transaction"` on each *validated* transaction that affects any of the specified accounts in some way. To confirm this, look for `"validated": true` in the transaction messages.

The following code sample subscribes to the Test Net Faucet's sending address. It logs a message on each such transaction by adding a handler to the dispatcher from the previous step.

```js
async function do_subscribe() {
  const sub_response = await api_request({
    command:"subscribe",
    accounts: ["rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"]
  })
  if (sub_response.status === "success") {
    console.log("Successfully subscribed!")
  } else {
    console.error("Error subscribing: ", sub_response)
  }
}
// Add do_subscribe() to the 'open' listener for socket

const log_tx = function(tx) {
  console.log(tx.transaction.TransactionType + " transaction sent by " +
              tx.transaction.Account +
              "\n  Result: " + tx.meta.TransactionResult +
              " in ledger " + tx.ledger_index +
              "\n  Validated? " + tx.validated)
}
WS_HANDLERS["transaction"] = log_tx
```

For the following example, try opening the [Transaction Sender](/resources/dev-tools/tx-sender) in a different window or even on a different device and sending transactions to the address you subscribed to:

Subscribe
Test Net Address:

Subscribe

h5
Transactions
div
span
(Log is empty)
script
async function do_subscribe() {
  const sub_address = $("#subscribe_address").val()
  const sub_response = await api_request({
    command:"subscribe",
    accounts: [sub_address]
  })
  if (sub_response.status === "success") {
    writeToConsole("#monitor-console-subscribe", "Successfully subscribed!")
  } else {
    writeToConsole("#monitor-console-subscribe",
                   "Error subscribing: " + JSON.stringify(sub_response))
  }
}
$("#tx_subscribe").click((event) => {
  do_subscribe()
  complete_step("Subscribe")
  $("#tx_read").prop("disabled", false)
})

const log_tx = function(tx) {
  writeToConsole("#monitor-console-subscribe",
                  tx.transaction.TransactionType + " transaction sent by " +
                  tx.transaction.Account +
                  "<br/>&nbsp;&nbsp;Result: " + tx.meta.TransactionResult +
                  " in ledger " + tx.ledger_index +
                  "<br/>&nbsp;&nbsp;Validated? " + tx.validated)
}
WS_HANDLERS["transaction"] = log_tx

## 4. Read Incoming Payments

When you subscribe to an account, you get messages for *all transactions to or from the account*, as well as *transactions that affect the account indirectly*, such as trading its [tokens](/docs/concepts/tokens). If your goal is to recognize when the account has received incoming payments, you must filter the transactions stream and process the payments based on the amount they actually delivered. Look for the following information:

- The **`validated` field** indicates that the transaction's outcome is [final](/docs/concepts/transactions/finality-of-results). This should always be the case when you subscribe to `accounts`, but if you *also* subscribe to `accounts_proposed` or the `transactions_proposed` stream then the server sends similar messages on the same connection for unconfirmed transactions. As a precaution, it's best to always check the `validated` field.
- The **`meta.TransactionResult` field** is the [transaction result](/docs/references/protocol/transactions/transaction-results). If the result is not `tesSUCCESS`, the transaction failed and cannot have delivered any value.
- The **`transaction.Account`** field is the sender of the transaction. If you are only looking for transactions sent by others, you can ignore any transactions where this field matches your account's address. (Keep in mind, it *is* possible to make a cross-currency payment to yourself.)
- The **`transaction.TransactionType` field** is the type of transaction. The transaction types that can possibly deliver currency to an account are as follows:
  - **[Payment transactions](/docs/references/protocol/transactions/types/payment)** can deliver XRP or [tokens](/docs/concepts/tokens). Filter these by the `transaction.Destination` field, which contains the address of the recipient, and always use the `meta.delivered_amount` to see how much the payment actually delivered. XRP amounts are [formatted as strings](/docs/references/protocol/data-types/basic-data-types#specifying-currency-amounts).
If you use the `transaction.Amount` field instead, you may be vulnerable to the [partial payments exploit](/docs/concepts/payment-types/partial-payments#partial-payments-exploit). Malicious users can use this exploit to trick you into allowing the malicious user to trade or withdraw more money than they paid you.
  - **[CheckCash transactions](/docs/references/protocol/transactions/types/checkcash)** allow an account to receive money authorized by a different account's [CheckCreate transaction](/docs/references/protocol/transactions/types/checkcreate). Look at the metadata of a **CheckCash transaction** to see how much currency the account received.
  - **[EscrowFinish transactions](/docs/references/protocol/transactions/types/escrowfinish)** can deliver XRP by finishing an [Escrow](/docs/concepts/payment-types/escrow) created by a previous [EscrowCreate transaction](/docs/references/protocol/transactions/types/escrowcreate). Look at the metadata of the **EscrowFinish transaction** to see which account received XRP from the escrow and how much.
  - **[OfferCreate transactions](/docs/references/protocol/transactions/types/offercreate)** can deliver XRP or tokens by consuming offers your account has previously placed in the XRP Ledger's [decentralized exchange](/docs/concepts/tokens/decentralized-exchange). If you never place offers, you cannot receive money this way. Look at the metadata to see what currency the account received, if any, and how much.
  - **[PaymentChannelClaim transactions](/docs/references/protocol/transactions/types/paymentchannelclaim)** can deliver XRP from a [payment channel](/docs/concepts/payment-types/payment-channels). Look at the metadata to see which accounts, if any, received XRP from the transaction.
  - **[PaymentChannelFund transactions](/docs/references/protocol/transactions/types/paymentchannelfund)** can return XRP from a closed (expired) payment channel to the sender.
- The **`meta` field** contains [transaction metadata](/docs/references/protocol/transactions/metadata), including exactly how much of which currency or currencies was delivered where. See [Look Up transaction Results](/docs/concepts/transactions/finality-of-results/look-up-transaction-results) for more information on how to understand transaction metadata.


The following sample code looks at transaction metadata of all the above transaction types to report how much XRP an account received:

```js
function CountXRPDifference(affected_nodes, address) {
  // Helper to find an account in an AffectedNodes array and see how much
  // its balance changed, if at all. Fortunately, each account appears at most
  // once in the AffectedNodes array, so we can return as soon as we find it.

  // Note: this reports the net balance change. If the address is the sender,
  // the transaction cost is deducted and combined with XRP sent/received

  for (let i=0; i<affected_nodes.length; i++) {
    if ((affected_nodes[i].hasOwnProperty("ModifiedNode"))) {
      // modifies an existing ledger entry
      let ledger_entry = affected_nodes[i].ModifiedNode
      if (ledger_entry.LedgerEntryType === "AccountRoot" &&
          ledger_entry.FinalFields.Account === address) {
        if (!ledger_entry.PreviousFields.hasOwnProperty("Balance")) {
          console.log("XRP balance did not change.")
        }
        // Balance is in PreviousFields, so it changed. Time for
        // high-precision math!
        const old_balance = new Big(ledger_entry.PreviousFields.Balance)
        const new_balance = new Big(ledger_entry.FinalFields.Balance)
        const diff_in_drops = new_balance.minus(old_balance)
        const xrp_amount = diff_in_drops.div(1e6)
        if (xrp_amount.gte(0)) {
          console.log("Received " + xrp_amount.toString() + " XRP.")
          return
        } else {
          console.log("Spent " + xrp_amount.abs().toString() + " XRP.")
          return
        }
      }
    } else if ((affected_nodes[i].hasOwnProperty("CreatedNode"))) {
      // created a ledger entry. maybe the account just got funded?
      let ledger_entry = affected_nodes[i].CreatedNode
      if (ledger_entry.LedgerEntryType === "AccountRoot" &&
          ledger_entry.NewFields.Account === address) {
        const balance_drops = new Big(ledger_entry.NewFields.Balance)
        const xrp_amount = balance_drops.div(1e6)
        console.log("Received " + xrp_amount.toString() + " XRP (account funded).")
        return
      }
    } // accounts cannot be deleted at this time, so we ignore DeletedNode
  }

  console.log("Did not find address in affected nodes.")
  return
}

function CountXRPReceived(tx, address) {
  if (tx.meta.TransactionResult !== "tesSUCCESS") {
    console.log("Transaction failed.")
    return
  }
  if (tx.tx_json.TransactionType === "Payment") {
    if (tx.tx_json.Destination !== address) {
      console.log("Not the destination of this payment.")
      return
    }
    if (typeof tx.meta.delivered_amount === "string") {
      const amount_in_drops = new Big(tx.meta.delivered_amount)
      const xrp_amount = amount_in_drops.div(1e6)
      console.log("Received " + xrp_amount.toString() + " XRP.")
      return
    } else {
      console.log("Received non-XRP currency.")
      return
    }
  } else if (["PaymentChannelClaim", "PaymentChannelFund", "OfferCreate",
          "CheckCash", "EscrowFinish"].includes(
          tx.tx_json.TransactionType)) {
    CountXRPDifference(tx.meta.AffectedNodes, address)
  } else {
    console.log("Not a currency-delivering transaction type (" +
                tx.tx_json.TransactionType + ").")
  }
}
```

Read Payments
Start Reading

h5
Transactions
div
span
(Log is empty)
script
function CountXRPDifference(affected_nodes, address) {
  // Helper to find an account in an AffectedNodes array and see how much
  // its balance changed, if at all. Fortunately, each account appears at most
  // once in the AffectedNodes array, so we can return as soon as we find it.

  // Note: this reports the net balance change. If the address is the sender,
  // any XRP balance changes combined with the transaction cost.

  for (let i=0; i<affected_nodes.length; i++) {
    if ((affected_nodes[i].hasOwnProperty("ModifiedNode"))) {
      // modifies an existing ledger entry
      let ledger_entry = affected_nodes[i].ModifiedNode
      if (ledger_entry.LedgerEntryType === "AccountRoot" &&
          ledger_entry.FinalFields.Account === address) {
        if (!ledger_entry.PreviousFields.hasOwnProperty("Balance")) {
          writeToConsole("#monitor-console-read", "XRP balance did not change.")
        }
        // Balance is in PreviousFields, so it changed. Time for
        // high-precision math!
        const old_balance = new Big(ledger_entry.PreviousFields.Balance)
        const new_balance = new Big(ledger_entry.FinalFields.Balance)
        const diff_in_drops = new_balance.minus(old_balance)
        const xrp_amount = diff_in_drops.div(1e6)
        if (xrp_amount.gte(0)) {
          writeToConsole("#monitor-console-read", "Received " + xrp_amount.toString()+" XRP.")
          return
        } else {
          writeToConsole("#monitor-console-read", "Spent " + xrp_amount.abs().toString() + " XRP.")
          return
        }
      }
    } else if ((affected_nodes[i].hasOwnProperty("CreatedNode"))) {
      // created a ledger entry. maybe the account got funded?
      let ledger_entry = affected_nodes[i].CreatedNode
      if (ledger_entry.LedgerEntryType === "AccountRoot" &&
          ledger_entry.NewFields.Account === address) {
        const balance_drops = new Big(ledger_entry.NewFields.Balance)
        const xrp_amount = balance_drops.div(1e6)
        writeToConsole("#monitor-console-read", "Received " + xrp_amount.toString() + " XRP (account funded).")
        return
      }
    } // accounts cannot be deleted at this time, so we ignore DeletedNode
  }

  writeToConsole("#monitor-console-read", "Did not find address in affected nodes.")
  return
}

function CountXRPReceived(tx, address) {
  if (tx.meta.TransactionResult !== "tesSUCCESS") {
    writeToConsole("#monitor-console-read", "Transaction failed.")
    return
  }
  if (tx.transaction.TransactionType === "Payment") {
    if (tx.transaction.Destination !== address) {
      writeToConsole("#monitor-console-read", "Not the destination of this payment. (We're " +
                      address + "; they're " + tx.transaction.Destination + ")")
      return
    }
    if (typeof tx.meta.delivered_amount === "string") {
      const amount_in_drops = new Big(tx.meta.delivered_amount)
      const xrp_amount = amount_in_drops.div(1e6)
      writeToConsole("#monitor-console-read", "Received " + xrp_amount.toString() + " XRP.")
      return
    } else {
      writeToConsole("#monitor-console-read", "Received non-XRP currency.")
      return
    }
  } else if (["PaymentChannelClaim", "PaymentChannelFund", "OfferCreate",
          "CheckCash", "EscrowFinish"].includes(
          tx.transaction.TransactionType)) {
    CountXRPDifference(tx.meta.AffectedNodes, address)
  } else {
    writeToConsole("#monitor-console-read", "Not a currency-delivering transaction type (" +
                tx.transaction.TransactionType + ").")
  }
}

$("#tx_read").click((event) => {
  // Wrap the existing "transaction" handler to do the old thing and also
  // do the CountXRPReceived thing
  const sub_address = $("#subscribe_address").val()
  const old_handler = WS_HANDLERS["transaction"]
  const new_handler = function(data) {
    old_handler(data)
    CountXRPReceived(data, sub_address)
  }
  WS_HANDLERS["transaction"] = new_handler
  // Disable the button so you can't stack up multiple levels of the new handler
  $("#tx_read").prop("disabled", "disabled")
  complete_step("Read Payments")
})

## Next Steps

- [Look Up Transaction Results](/docs/concepts/transactions/finality-of-results/look-up-transaction-results) to see exactly what a transaction did, and build your software to react appropriately.
- Try [Sending XRP](/docs/tutorials/payments/send-xrp) from your own address.
- Try monitoring for transactions of advanced types like [Escrows](/docs/concepts/payment-types/escrow), [Checks](/docs/concepts/payment-types/checks), or [Payment Channels](/docs/concepts/payment-types/payment-channels), and responding to incoming notifications.


## Other Programming Languages

Many programming languages have libraries for sending and receiving data over a WebSocket connection. If you want a head-start on communicating with `xrpld`'s WebSocket API in a language other than JavaScript, the following examples show how:

Go
```go
package main

// Connect to the XRPL Ledger using websocket and subscribe to an account
// translation from the JavaScript example to Go
// https://xrpl.org/monitor-incoming-payments-with-websocket.html
// This example uses the Gorilla websocket library to create a websocket client
// install: go get github.com/gorilla/websocket

import (
	"encoding/json"
	"flag"
	"log"
	"net/url"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/websocket"
)

// websocket address
var addr = flag.String("addr", "s.altnet.rippletest.net:51233", "http service address")

// Payload object
type message struct {
	Command  string   `json:"command"`
	Accounts []string `json:"accounts"`
}

func main() {
	flag.Parse()
	log.SetFlags(0)

	var m message

	// check for interrupts and cleanly close the connection
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	u := url.URL{Scheme: "ws", Host: *addr, Path: "/"}
	log.Printf("connecting to %s", u.String())

	// make the connection
	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		panic(err)
	}
	// on exit close
	defer c.Close()

	done := make(chan struct{})

	// send a subscribe command and a target XRPL account
	m.Command = "subscribe"
	m.Accounts = append(m.Accounts, "rUCzEr6jrEyMpjhs4wSdQdz4g8Y382NxfM")

	// struct to JSON marshalling
	msg, _ := json.Marshal(m)
	// write to the websocket
	err = c.WriteMessage(websocket.TextMessage, []byte(string(msg)))
	if err != nil {
		panic(err)
	}

	// read from the websocket
	_, message, err := c.ReadMessage()
	if err != nil {
		panic(err)
	}
	// print the response from the XRP Ledger
	log.Printf("recv: %s", message)

	// handle interrupt
	for {
		select {
		case <-done:
			return
		case <-interrupt:
			log.Println("interrupt")

			// Cleanly close the connection by sending a close message and then
			// waiting (with timeout) for the server to close the connection.
			err := c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			if err != nil {
				panic(err)
			}
			select {
			case <-done:
			case <-time.After(time.Second):
			}
			return
		}
	}
}
```

Python
```py
import asyncio
import websockets
import json

# Using client libraries for ASYNC functions and websockets are needed in python.
# To install, use terminal command 'pip install asyncio && pip install websockets'

# Handles incoming messages
async def handler(websocket):
    message = await websocket.recv()
    return message

# Use this to send API requests
async def api_request(options, websocket):
    try:
        await websocket.send(json.dumps(options))
        message = await websocket.recv()
        return json.loads(message)
    except Exception as e:
        return e

# Tests functionality of API_Requst
async def pingpong(websocket):
    command = {
        "id": "on_open_ping_1",
        "command": "ping"
    }
    value = await api_request(command, websocket)
    print(value)

async def do_subscribe(websocket):
    command = await api_request({
        'command': 'subscribe',
        'accounts': ['rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe']
        }, websocket)

    if command['status'] == 'success':
        print('Successfully Subscribed!')
    else:
        print("Error subscribing: ", command)
    print('Received message from server', await handler(websocket))


async def run():
    # Opens connection to ripple testnet
    async for websocket in websockets.connect('wss://s.altnet.rippletest.net:51233'):
        try:
           await pingpong(websocket)
           await do_subscribe(websocket)
        except websockets.ConnectionClosed:
            print('Disconnected...')

# Runs the webhook on a loop
def main():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(run())
    loop.close()
    print('Restarting Loop')

if __name__ == '__main__':
    main()
```

Don't see the programming language of your choice? Click the "Edit on GitHub" link at the top of this page and contribute your own sample code!

## Footnotes

[1.](#from-footnote-1)  In practice, when calling an HTTP-based API multiple times, the client and server may reuse the same connection for several requests and responses. This practice is called [HTTP persistent connection, or keep-alive](https://en.wikipedia.org/wiki/HTTP_persistent_connection). From a development standpoint, the code to use an HTTP-based API is the same regardless of whether the underlying connection is new or reused.

## See Also

- **Concepts:**
  - [Transactions](/docs/concepts/transactions)
  - [Finality of Results](/docs/concepts/transactions/finality-of-results) - How to know when a transaction's success or failure is final. (Short version: if a transaction is in a validated ledger, its outcome and metadata are final.)
- **Tutorials:**
  - [Reliable Transaction Submission](/docs/concepts/transactions/reliable-transaction-submission)
  - [Look Up Transaction Results](/docs/concepts/transactions/finality-of-results/look-up-transaction-results)
- **References:**
  - [Transaction Types](/docs/references/protocol/transactions/types)
  - [Transaction Metadata](/docs/references/protocol/transactions/metadata) - Summary of the metadata format and fields that appear in metadata
  - [Transaction Results](/docs/references/protocol/transactions/transaction-results) - Tables of all possible result codes for transactions.