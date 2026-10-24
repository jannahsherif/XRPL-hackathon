# Use Tickets

[Tickets](/docs/concepts/accounts/tickets) let you reserve Sequence numbers in advance so you can send transactions out of order. This is useful when collecting signatures on multi-signed transactions while normal account activity continues, or queuing transactions for later submission.

This tutorial walks through creating a batch of Tickets, using one in a transaction, and applying the same pattern to multi-signed workflows.

_Added by the [TicketBatch amendment](/resources/known-amendments#ticketbatch). (Enabled: 2021-11-18)_

## Goals

By the end of this tutorial, you will be able to:

- Create Tickets to reserve Sequence numbers for future use.
- Use a Ticket to send a transaction outside the normal Sequence order.


## Prerequisites

To complete this tutorial, you need:

- A basic understanding of the XRP Ledger.
- A basic understanding of how [Sequence numbers](/docs/references/protocol/data-types/basic-data-types#account-sequence) work in transactions.
- An XRP Ledger [client library](/docs/references/client-libraries) set up.
- (Optional) A basic understanding of [multi-signing](/docs/concepts/accounts/multi-signing), if you plan to combine it with Tickets.


## Source Code

You can find the complete source code for this tutorial's examples in the code samples section of this website's repository.

## Steps

### 1. Install dependencies

Install dependencies for your language from the code sample folder.

JavaScript
```sh
npm install
```

Python
```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Go
```sh
go mod download
```

### 2. Set up client and account

Import the XRPL client library, connect to the network, and generate a test account funded by the [Testnet](/docs/concepts/networks-and-servers/parallel-networks) faucet. Using a live test network lets you submit transactions without risking real XRP.

JavaScript
```js
import xrpl from 'xrpl'

// Set up client and account
const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
await client.connect()

// Fund wallet --------------------------------------------------------------
console.log('Getting a wallet from the faucet...')
const { wallet } = await client.fundWallet()
console.log("Wallet address:", wallet.address)
```

Python
```py
from xrpl.clients import JsonRpcClient
from xrpl.models.requests import AccountObjects, AccountObjectType
from xrpl.models.transactions import AccountSet, TicketCreate
from xrpl.transaction import submit_and_wait
from xrpl.wallet import generate_faucet_wallet

# Set up client and account
JSON_RPC_URL = "https://s.altnet.rippletest.net:51234/"
client = JsonRpcClient(JSON_RPC_URL)

# Fund wallet
print("Getting a wallet from the faucet...")
wallet = generate_faucet_wallet(client=client)
print(f"Wallet address: {wallet.address}")
```

Go
```go
package main

import (
	"fmt"

	"github.com/Peersyst/xrpl-go/pkg/crypto"
	"github.com/Peersyst/xrpl-go/xrpl/faucet"
	"github.com/Peersyst/xrpl-go/xrpl/queries/account"
	"github.com/Peersyst/xrpl-go/xrpl/transaction"
	"github.com/Peersyst/xrpl-go/xrpl/wallet"
	"github.com/Peersyst/xrpl-go/xrpl/websocket"
)

func main() {
	// Set up client and account
	client := websocket.NewClient(
		websocket.NewClientConfig().
			WithHost("wss://s.altnet.rippletest.net:51233").
			WithFaucetProvider(faucet.NewTestnetFaucetProvider()).
			WithMaxRetries(30),
	)
	defer client.Disconnect()

	if err := client.Connect(); err != nil {
		panic(err)
	}

	// Fund wallet
	w, err := wallet.New(crypto.ED25519())
	if err != nil {
		panic(err)
	}
	fmt.Println("Getting a wallet from the faucet...")
	if err := client.FundWallet(&w); err != nil {
		panic(err)
	}
	fmt.Printf("Wallet address: %s\n", w.GetAddress())
	fmt.Println()
```

Note
When you're building production-ready software, use an existing account and manage your keys using a [secure signing configuration](/docs/concepts/transactions/secure-signing).

### 3. Create Tickets

Send a [TicketCreate transaction](/docs/references/protocol/transactions/types/ticketcreate) and set the `TicketCount` field to the number of Tickets you want to create (up to 250 per account). Each new Ticket reserves a future [Sequence Number](/docs/references/protocol/data-types/basic-data-types#account-sequence) you can use later. Each Ticket also counts toward your account's [owner reserve](/docs/concepts/accounts/reserves), which is released when the Ticket is used. Tickets stay reserved on the ledger until you consume them, regardless of any other transactions your account sends.

Submit the transaction and wait for validation. For example, to create 10 Tickets:

JavaScript
```js
// Create Tickets -----------------------------------------------------------
console.log('\nSubmitting TicketCreate transaction...')
const ticketCreateResult = await client.submitAndWait({
  TransactionType: 'TicketCreate',
  Account: wallet.address,
  TicketCount: 10
}, { wallet, autofill: true })
console.log(`TicketCreate hash: ${ticketCreateResult.result.hash}, validated: ${ticketCreateResult.result.validated}`)
```

Python
```py
# Create Tickets
ticket_create = TicketCreate(
    account=wallet.address,
    ticket_count=10,
)
print("\nSubmitting TicketCreate transaction...")
ticket_create_result = submit_and_wait(ticket_create, client, wallet)
print(f"TicketCreate hash: {ticket_create_result.result['hash']}, validated: {ticket_create_result.result['validated']}")
```

Go
```go
	// Create Tickets
	ticketCreate := &transaction.TicketCreate{
		BaseTx: transaction.BaseTx{
			Account: w.GetAddress(),
		},
		TicketCount: 10,
	}
	flatTc := ticketCreate.Flatten()
	if err := client.Autofill(&flatTc); err != nil {
		panic(err)
	}
	blob, _, err := w.Sign(flatTc)
	if err != nil {
		panic(err)
	}
	fmt.Println("Submitting TicketCreate transaction...")
	tcResult, err := client.SubmitTxBlobAndWait(blob, false)
	if err != nil {
		panic(err)
	}
	fmt.Printf("TicketCreate hash: %s, validated: %t\n", tcResult.Hash, tcResult.Validated)
	fmt.Println()
```

Note
A transaction is not final until it is validated by [consensus](/docs/concepts/consensus-protocol), which typically occurs 4-7 seconds after submission. The submit-and-wait call above blocks until validation completes, so the validated result is already available.

For production code that needs to handle longer waits or transaction expiration, see [Reliable Transaction Submission](/docs/concepts/transactions/reliable-transaction-submission).

### 4. Check available Tickets

To send a Ticketed transaction, you need a Ticket Sequence number. Use the [account_objects method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_objects) to list your Tickets. See the method's [Response Format](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_objects#response-format) for the response shape.

JavaScript
```js
// Check Available Tickets --------------------------------------------------
console.log('\nChecking available tickets...')
const ticketsResponse = await client.request({
  command: 'account_objects',
  account: wallet.address,
  type: 'ticket'
})
const tickets = ticketsResponse.result.account_objects
console.log(`Found ${tickets.length} Tickets`)

// Choose an arbitrary Ticket to use
const useTicket = tickets[0].TicketSequence
console.log(`Using Ticket Sequence: ${useTicket}`)
```

Python
```py
# Check Available Tickets
print("\nChecking available tickets...")
tickets_response = client.request(AccountObjects(
    account=wallet.address,
    type=AccountObjectType.TICKET,
))
tickets = tickets_response.result["account_objects"]
print(f"Found {len(tickets)} Tickets")

# Choose an arbitrary Ticket to use
use_ticket = tickets[0]["TicketSequence"]
print(f"Using Ticket Sequence: {use_ticket}")
```

Go
```go
	// Check Available Tickets
	fmt.Println("Checking available tickets...")
	objects, err := client.GetAccountObjects(&account.ObjectsRequest{
		Account: w.GetAddress(),
		Type:    account.TicketObject,
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("Found %d Tickets\n", len(objects.AccountObjects))

	// Choose an arbitrary Ticket to use
	useTicket := uint32(objects.AccountObjects[0]["TicketSequence"].(float64))
	fmt.Printf("Using Ticket Sequence: %d\n", useTicket)
	fmt.Println()
```

You can repeat the next step as long as you have unused Tickets.

### 5. Use a Ticket

Now that you have a Ticket available, you can use it in a transaction. This can be any [type of transaction](/docs/references/protocol/transactions/types). You can use Tickets in any order, but each can only be used once. For the multi-signing variant, see [With Multi-Signing](#with-multi-signing) below.

The Ticket pattern
For any transaction that uses a Ticket, set the `Sequence` field to `0` and include a `TicketSequence` field with one of your available Ticket Sequence numbers.

The following example uses an [AccountSet transaction](/docs/references/protocol/transactions/types/accountset) with no fields set, making it a no-op that requires no setup. Ticketed transactions go through the same [consensus](/docs/concepts/consensus-protocol) process as Sequenced transactions.

JavaScript
```js
// Use a Ticket -------------------------------------------------------------
console.log('\nSubmitting ticketed AccountSet transaction...')
const ticketedResult = await client.submitAndWait({
  TransactionType: 'AccountSet',
  Account: wallet.address,
  TicketSequence: useTicket,
  Sequence: 0
}, { wallet, autofill: true })
console.log(`Ticketed AccountSet hash: ${ticketedResult.result.hash}, validated: ${ticketedResult.result.validated}`)

// Recheck Available Tickets ------------------------------------------------
console.log('\nRechecking available tickets...')
const ticketsAfterResponse = await client.request({
  command: 'account_objects',
  account: wallet.address,
  type: 'ticket'
})
console.log(`Found ${ticketsAfterResponse.result.account_objects.length} Tickets`)

// Disconnect when done (If you omit this, Node.js won't end the process)
await client.disconnect()
```

Python
```py
# Use a Ticket
ticketed_tx = AccountSet(
    account=wallet.address,
    ticket_sequence=use_ticket,
    sequence=0,
)
print("\nSubmitting ticketed AccountSet transaction...")
ticketed_result = submit_and_wait(ticketed_tx, client, wallet)
print(f"Ticketed AccountSet hash: {ticketed_result.result['hash']}, validated: {ticketed_result.result['validated']}")

# Recheck Available Tickets
print("\nRechecking available tickets...")
tickets_after_response = client.request(AccountObjects(
    account=wallet.address,
    type=AccountObjectType.TICKET,
))
print(f"Found {len(tickets_after_response.result['account_objects'])} Tickets")
```

Go
```go
	// Use a Ticket
	ticketedTx := &transaction.AccountSet{
		BaseTx: transaction.BaseTx{
			Account:        w.GetAddress(),
			Sequence:       0,
			TicketSequence: useTicket,
		},
	}
	flatAs := ticketedTx.Flatten()
	if err := client.Autofill(&flatAs); err != nil {
		panic(err)
	}
	blob, _, err = w.Sign(flatAs)
	if err != nil {
		panic(err)
	}
	fmt.Println("Submitting ticketed AccountSet transaction...")
	ticketedResult, err := client.SubmitTxBlobAndWait(blob, false)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Ticketed AccountSet hash: %s, validated: %t\n", ticketedResult.Hash, ticketedResult.Validated)
	fmt.Println()

	// Recheck Available Tickets
	fmt.Println("Rechecking available tickets...")
	objectsAfter, err := client.GetAccountObjects(&account.ObjectsRequest{
		Account: w.GetAddress(),
		Type:    account.TicketObject,
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("Found %d Tickets\n", len(objectsAfter.AccountObjects))
}
```

After the transaction is validated, the Ticket is consumed and removed from the ledger. The available Ticket count drops by one.

Tip
You can use this same pattern to cancel an unused Ticket — just send a no-op AccountSet using the Ticket you no longer need.

## With Multi-Signing

Reserve a Ticket for each [multi-signed transaction](/docs/concepts/accounts/multi-signing) to hold its slot while you collect signatures. Then submit each transaction as soon as its signatures are complete, in any order.

In this scenario, [step 5: Use a Ticket](#5-use-a-ticket) becomes a multi-step process: prepare the transaction, circulate it among signers, and combine their signatures. See [Send a Multi-Signed Transaction](/docs/tutorials/best-practices/key-management/send-a-multi-signed-transaction) for more details.

For complete working examples that combine Tickets and multi-signing, see `use-tickets-multisig.js` (JavaScript) or `use-tickets-to-multisign.py` (Python) in the [code samples directory](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/use-tickets/). A Go variant isn't currently available.

You can prepare multiple multi-signed transactions simultaneously, each using a different Ticket.

Tip
For this scenario, omit the `LastLedgerSequence` field so that the transaction does not expire while you collect signatures. How you do this varies by library:

- **xrpl.js:** Specify `"LastLedgerSequence": null` when auto-filling the transaction.
- **xrpl-py:** Set `last_ledger_sequence=None` on the transaction.
- **xrpl-go:** Leave the field unset before signing.
- **`xrpld` directly:** Omit the field from the prepared instructions. The server doesn't provide a default.


## See Also

- **Concepts:**
  - [Tickets](/docs/concepts/accounts/tickets)
  - [Multi-Signing](/docs/concepts/accounts/multi-signing)
  - [Reliable Transaction Submission](/docs/concepts/transactions/reliable-transaction-submission)
- **Tutorials:**
  - [Set Up Multi-Signing](/docs/tutorials/best-practices/key-management/set-up-multi-signing)
  - [Send a Multi-Signed Transaction](/docs/tutorials/best-practices/key-management/send-a-multi-signed-transaction)
- **References:**
  - [account_objects method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_objects)
  - [TicketCreate transaction](/docs/references/protocol/transactions/types/ticketcreate)
  - [Transaction Common Fields](/docs/references/protocol/transactions/common-fields)