# Send a Multi-Purpose Token (MPT)

This tutorial shows you how to send a direct [Multi-Purpose Token (MPT)](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens) payment on the XRP Ledger.

Each account must authorize the MPT before it can hold the token. This is to prevent malicious users from spamming accounts with unwanted tokens that could negatively impact storage and XRP reserves. Holders can send the MPT to each other only if the issuance has the **Can Transfer** flag enabled, and both parties are authorized.

_Added by the [MPTokensV1 amendment](/resources/known-amendments#mptokensv1). (Enabled: 2025-10-01)_

## Goals

By the end of this tutorial, you will be able to:

- Authorize an account to hold a specific MPT.
- Send a payment of an MPT between two accounts.
- Verify the payment was successful.


## Prerequisites

To complete this tutorial, you should:

- Have a basic understanding of the XRP Ledger.
- Have an XRP Ledger client library set up in your development environment. This page provides examples for the following:
  - **JavaScript** with the [xrpl.js library](https://github.com/XRPLF/xrpl.js). See [Get Started Using JavaScript](/docs/tutorials/get-started/get-started-javascript) for setup steps.
  - **Python** with the [xrpl-py library](https://github.com/XRPLF/xrpl-py). See [Get Started Using Python](/docs/tutorials/get-started/get-started-python) for setup steps.
  - **Go** with the [xrpl-go library](https://github.com/XRPLF/xrpl-go). See [Get Started Using Go](/docs/tutorials/get-started/get-started-go) for setup steps.


## Source Code

You can find the complete source code for this tutorial's examples in the code samples section of this website's repository.

## Steps

### 1. Install dependencies

JavaScript
From the `js/` folder, use `npm` to install dependencies.

```sh
npm install
```

Python
From the `py/` folder, set up a virtual environment and use `pip` to install dependencies.

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Go
From the `go/` folder, use `go` to install dependencies.

```sh
go mod tidy
```

### 2. Set up client and accounts

To get started, import the necessary libraries and instantiate a client to connect to the XRPL. This example imports:

JavaScript
- `xrpl`: Used for XRPL client connection, transaction submission, and wallet handling.
- `fs`: Used to check for and load the tutorial setup data.
- `./sendMPTSetup.js`: The tutorial set up script, imported and called directly.


```js
import xrpl from 'xrpl'
import fs from 'fs'
import { setup } from './sendMPTSetup.js'

// Connect to the network ----------------------
const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
await client.connect()
```

Python
- `xrpl`: Used for XRPL client connection, transaction submission, and wallet handling.
- `json`: Used for loading and formatting JSON data.
- `os` and `sys`: Used to check for setup data and exit on transaction failures.
- `asyncio`: Used to run the async tutorial set up function.
- `send_mpt_setup`: The tutorial set up script, imported and called directly.


```py
import asyncio
import json
import os
import sys

from xrpl.clients import JsonRpcClient, XRPLRequestFailureException
from xrpl.models import LedgerEntry, MPTokenAuthorize, Payment
from xrpl.models.amounts import MPTAmount
from xrpl.models.requests.ledger_entry import MPToken
from xrpl.transaction import submit_and_wait
from xrpl.wallet import Wallet, generate_faucet_wallet

from send_mpt_setup import main as run_setup

# Set up client ----------------------
client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
```

Go
- `xrpl-go`: Used for XRPL client connection, transaction submission, and wallet handling.
- `encoding/json` and `fmt`: Used for formatting and printing results to the console.
- `os` and `os/exec`: Used to run the tutorial set up script.


```go
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"

	"github.com/Peersyst/xrpl-go/pkg/crypto"
	"github.com/Peersyst/xrpl-go/xrpl/faucet"
	"github.com/Peersyst/xrpl-go/xrpl/queries/common"
	"github.com/Peersyst/xrpl-go/xrpl/queries/version"
	"github.com/Peersyst/xrpl-go/xrpl/transaction"
	"github.com/Peersyst/xrpl-go/xrpl/transaction/types"
	"github.com/Peersyst/xrpl-go/xrpl/wallet"
	"github.com/Peersyst/xrpl-go/xrpl/websocket"
	wstypes "github.com/Peersyst/xrpl-go/xrpl/websocket/types"
)

// mptokenFilter targets an MPToken ledger entry by issuance ID and holder.
type mptokenFilter struct {
	MPTIssuanceID string `json:"mpt_issuance_id"`
	Account       string `json:"account"`
}

// ledgerEntryMPTRequest is a minimal ledger_entry request that looks up an
// MPToken entry directly. The xrpl-go SDK doesn't ship a typed wrapper for
// this lookup, so this implements the websocket Request interface inline.
type ledgerEntryMPTRequest struct {
	common.BaseRequest
	LedgerIndex common.LedgerSpecifier `json:"ledger_index,omitempty"`
	MPToken     mptokenFilter          `json:"mptoken"`
}

func (*ledgerEntryMPTRequest) Method() string  { return "ledger_entry" }
func (*ledgerEntryMPTRequest) Validate() error { return nil }
func (*ledgerEntryMPTRequest) APIVersion() int { return version.RippledAPIV2 }

func main() {
	// Connect to the network ----------------------
	client := websocket.NewClient(
		websocket.NewClientConfig().
			WithHost("wss://s.altnet.rippletest.net:51233").
			WithFaucetProvider(faucet.NewTestnetFaucetProvider()),
	)
	defer client.Disconnect()

	if err := client.Connect(); err != nil {
		panic(err)
	}
```

Next, provide the sender and receiver wallets, and the MPT issuance ID.

JavaScript
```js
// Load setup data ----------------------
// This step checks for the necessary setup data to run the tutorial.
// If missing, sendMPTSetup.js will generate it.
if (!fs.existsSync('sendMPTSetup.json')) {
  console.log(`\n=== Setup data doesn't exist. Running setup script... ===\n`)
  await setup()
}

// Load preconfigured sender wallet and MPT issuance ID.
const setupData = JSON.parse(fs.readFileSync('sendMPTSetup.json', 'utf8'))
const sender = xrpl.Wallet.fromSeed(setupData.sender.seed)
const mptIssuanceID = setupData.mptIssuanceID

console.log(`Sender address:   ${sender.address}`)
console.log(`MPT issuance ID:  ${mptIssuanceID}`)

// Fund a fresh receiver wallet from the faucet.
console.log(`\nCreating and funding receiver wallet...`)
const { wallet: receiver } = await client.fundWallet()
console.log(`Receiver address: ${receiver.address}`)
```

This example uses a preconfigured sender and MPT issuance from the `sendMPTSetup.js` script, but you can replace `sender` and `mptIssuanceID` with your own values.

Python
```py
# Load setup data ----------------------
# This step checks for the necessary setup data to run the tutorial.
# If missing, send_mpt_setup.py will generate it.
if not os.path.exists("send_mpt_setup.json"):
    print("\n=== Setup data doesn't exist. Running setup script... ===\n")
    asyncio.run(run_setup())

# Load sender wallet and MPT issuance ID.
with open("send_mpt_setup.json") as f:
    setup_data = json.load(f)

sender = Wallet.from_seed(setup_data["sender"]["seed"])
mpt_issuance_id = setup_data["mpt_issuance_id"]

print(f"Sender address:   {sender.address}")
print(f"MPT issuance ID:  {mpt_issuance_id}")

# Fund a fresh receiver wallet from the faucet.
print(f"\nCreating and funding receiver wallet...")
receiver = generate_faucet_wallet(client)
print(f"Receiver address: {receiver.address}")
```

This example uses a preconfigured sender and MPT issuance from the `send_mpt_setup.py` script, but you can replace `sender` and `mpt_issuance_id` with your own values.

Go
```go
	// Load setup data ----------------------
	// Check for setup data; run send-mpt-setup if missing
	if _, err := os.Stat("send-mpt-setup.json"); os.IsNotExist(err) {
		fmt.Printf("\n=== Setup data doesn't exist. Running setup script... ===\n\n")
		cmd := exec.Command("go", "run", "./send-mpt-setup")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		if err := cmd.Run(); err != nil {
			panic(err)
		}
	}

	// Load preconfigured sender wallet and MPT issuance ID.
	data, err := os.ReadFile("send-mpt-setup.json")
	if err != nil {
		panic(err)
	}
	var setup map[string]any
	if err := json.Unmarshal(data, &setup); err != nil {
		panic(err)
	}

	senderSeed := setup["sender"].(map[string]any)["seed"].(string)
	sender, err := wallet.FromSecret(senderSeed)
	if err != nil {
		panic(err)
	}
	mptIssuanceID := setup["mptIssuanceID"].(string)

	fmt.Printf("Sender address:   %s\n", sender.ClassicAddress)
	fmt.Printf("MPT issuance ID:  %s\n", mptIssuanceID)

	// Fund a fresh receiver wallet from the faucet.
	fmt.Printf("\nCreating and funding receiver wallet...\n")
	receiver, err := wallet.New(crypto.ED25519())
	if err != nil {
		panic(err)
	}
	if err := client.FundWallet(&receiver); err != nil {
		panic(err)
	}
	fmt.Printf("Receiver address: %s\n", receiver.ClassicAddress)
```

This example uses a preconfigured sender and MPT issuance from the `send-mpt-setup/main.go` script, but you can replace `sender` and `mptIssuanceID` with your own values.

### 3. Authorize the receiving account

Any account that wants to hold an MPT, whether sending or receiving, must opt in first. Submit an [MPTokenAuthorize transaction](/docs/references/protocol/transactions/types/mptokenauthorize), signed by the holder, to create an `MPToken` ledger entry on their account. In this tutorial, the setup script authorizes the sender before transferring it any tokens, so this step only runs for the receiver.

JavaScript
```js
// Authorize receiver to hold the MPT ----------------------
console.log(`\n=== Authorizing receiver to hold the MPT... ===\n`)
const authorizeTx = {
  TransactionType: 'MPTokenAuthorize',
  Account: receiver.address,
  MPTokenIssuanceID: mptIssuanceID
}
xrpl.validate(authorizeTx)
console.log(JSON.stringify(authorizeTx, null, 2))

const authorizeResponse = await client.submitAndWait(authorizeTx, {
  wallet: receiver,
  autofill: true
})
if (authorizeResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  const code = authorizeResponse.result.meta.TransactionResult
  console.error('Error: MPTokenAuthorize failed:', code)
  await client.disconnect()
  process.exit(1)
}
console.log('Receiver authorized to hold the MPT!')
console.log(`Explorer link: https://testnet.xrpl.org/transactions/${authorizeResponse.result.hash}`)
```

Python
```py
# Authorize receiver to hold the MPT ----------------------
print("\n=== Authorizing receiver to hold the MPT... ===\n")
authorize_tx = MPTokenAuthorize(
    account=receiver.address,
    mptoken_issuance_id=mpt_issuance_id,
)
print(json.dumps(authorize_tx.to_xrpl(), indent=2))

authorize_response = submit_and_wait(authorize_tx, client, receiver)
if authorize_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    code = authorize_response.result["meta"]["TransactionResult"]
    print(f"Error: MPTokenAuthorize failed: {code}")
    sys.exit(1)
print("Receiver authorized to hold the MPT!")
print(f"Explorer link: https://testnet.xrpl.org/transactions/{authorize_response.result['hash']}")
```

Go
```go
	// Authorize receiver to hold the MPT ----------------------
	fmt.Printf("\n=== Authorizing receiver to hold the MPT... ===\n\n")
	authorizeTx := transaction.MPTokenAuthorize{
		BaseTx: transaction.BaseTx{
			Account: receiver.ClassicAddress,
		},
		MPTokenIssuanceID: mptIssuanceID,
	}

	flatAuthorize := authorizeTx.Flatten()
	authorizeJSON, _ := json.MarshalIndent(flatAuthorize, "", "  ")
	fmt.Printf("%s\n", string(authorizeJSON))

	authorizeResponse, err := client.SubmitTxAndWait(flatAuthorize, &wstypes.SubmitOptions{
		Autofill: true,
		Wallet:   &receiver,
	})
	if err != nil {
		panic(err)
	}
	if authorizeResponse.Meta.TransactionResult != "tesSUCCESS" {
		fmt.Printf("Error: MPTokenAuthorize failed: %s\n", authorizeResponse.Meta.TransactionResult)
		os.Exit(1)
	}
	fmt.Printf("Receiver authorized to hold the MPT!\n")
	fmt.Printf("Explorer link: https://testnet.xrpl.org/transactions/%s\n", authorizeResponse.Hash.String())
```

A `tesSUCCESS` result confirms the receiver is now authorized to hold the MPT, and should have an `MPToken` ledger entry with a balance of zero.

Note
If the issuance uses allow-listing (the **Require Auth** flag), this step isn't enough on its own. After the holder opts in, the issuer typically must also approve the holder—usually by submitting its own [MPTokenAuthorize transaction](/docs/references/protocol/transactions/types/mptokenauthorize) with the `Holder` field set to the holder's address. **The token used in this tutorial doesn't use allow-listing, so no issuer approval is needed.**

### 4. Check initial balances

Before sending the payment, check each account's MPT holdings using the [ledger_entry method](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger_entry). Pass the holder's `account` and the `mpt_issuance_id` in the `mptoken` parameter to look up the `MPToken` entry directly. This avoids paginating through the account's owner directory and works reliably for accounts that own many ledger entries.

JavaScript
```js
// Check initial balances ----------------------
/**
 * Return the MPTAmount for the given MPT issuance held by an account.
 *
 * Looks up the holder's MPToken ledger entry directly via ledger_entry. 
 * Returns "0" if the entry doesn't exist or has no
 * MPTAmount.
 *
 * @param {string} address - Classic address of the account to query.
 * @param {string} mptIssuanceID - MPT issuance ID to look up.
 * @returns {Promise<string>} The MPT amount as a string, or "0".
 */
async function getMPTBalance(address, mptIssuanceID) {
  try {
    const response = await client.request({
      command: 'ledger_entry',
      ledger_index: 'validated',
      mptoken: {
        mpt_issuance_id: mptIssuanceID,
        account: address
      }
    })
    return response.result.node?.MPTAmount ?? '0'
  } catch (e) {
    if (e.data?.error === 'entryNotFound') {
      return '0'
    }
    throw e
  }
}

console.log(`\n=== Checking initial MPT balances for issuance ${mptIssuanceID}... ===\n`)
const senderBalanceBefore = await getMPTBalance(sender.address, mptIssuanceID)
const receiverBalanceBefore = await getMPTBalance(receiver.address, mptIssuanceID)
console.log(`Sender balance:   ${senderBalanceBefore}`)
console.log(`Receiver balance: ${receiverBalanceBefore}`)
```

Python
```py
# Check initial balances ----------------------
def get_mpt_balance(address, issuance_id):
    """Return the MPTAmount for the given MPT issuance held by an account.

    Looks up the holder's MPToken ledger entry directly via ledger_entry.
    Returns "0" if the entry doesn't exist or has no MPTAmount.
    """
    response = client.request(LedgerEntry(
        ledger_index="validated",
        mptoken=MPToken(mpt_issuance_id=issuance_id, account=address),
    ))
    if not response.is_successful():
        if response.result.get("error") == "entryNotFound":
            return "0"
        raise XRPLRequestFailureException(response.result)
    return response.result.get("node", {}).get("MPTAmount", "0")

print(f"\n=== Checking initial MPT balances for issuance {mpt_issuance_id}... ===\n")
sender_balance_before = get_mpt_balance(sender.address, mpt_issuance_id)
receiver_balance_before = get_mpt_balance(receiver.address, mpt_issuance_id)
print(f"Sender balance:   {sender_balance_before}")
print(f"Receiver balance: {receiver_balance_before}")
```

Go
```go
	// Check initial balances ----------------------
	// getMPTBalance returns the MPTAmount for the given MPT issuance held by
	// address. It looks up the holder's MPToken ledger entry directly via ledger_entry.
	// Returns "0" if the entry doesn't exist or has no MPTAmount.
	getMPTBalance := func(address types.Address, mptIssuanceID string) (string, error) {
		resp, err := client.Request(&ledgerEntryMPTRequest{
			LedgerIndex: common.Validated,
			MPToken: mptokenFilter{
				MPTIssuanceID: mptIssuanceID,
				Account:       string(address),
			},
		})
		if err != nil {
			if err.Error() == "entryNotFound" {
				return "0", nil
			}
			return "", err
		}

		node, ok := resp.Result["node"].(map[string]any)
		if !ok {
			return "0", nil
		}
		if amt, ok := node["MPTAmount"].(string); ok {
			return amt, nil
		}
		return "0", nil
	}

	fmt.Printf("\n=== Checking initial MPT balances for issuance %s... ===\n\n", mptIssuanceID)
	senderBalanceBefore, err := getMPTBalance(sender.ClassicAddress, mptIssuanceID)
	if err != nil {
		panic(err)
	}
	receiverBalanceBefore, err := getMPTBalance(receiver.ClassicAddress, mptIssuanceID)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Sender balance:   %s\n", senderBalanceBefore)
	fmt.Printf("Receiver balance: %s\n", receiverBalanceBefore)
```

### 5. Send the token payment

Specify an [MPT amount](/docs/references/protocol/data-types/currency-formats#mpt-amounts) to send to the receiver, then submit the [Payment transaction](/docs/references/protocol/transactions/types/payment).

JavaScript
```js
// Send MPT from sender to receiver ----------------------
console.log(`\n=== Sending MPT payment... ===\n`)
const paymentTx = {
  TransactionType: 'Payment',
  Account: sender.address,
  Destination: receiver.address,
  Amount: {
    mpt_issuance_id: mptIssuanceID,
    value: '100'
  }
}
xrpl.validate(paymentTx)
console.log(JSON.stringify(paymentTx, null, 2))

const paymentResponse = await client.submitAndWait(paymentTx, {
  wallet: sender,
  autofill: true
})
if (paymentResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  const code = paymentResponse.result.meta.TransactionResult
  console.error('Error: Payment failed:', code)
  await client.disconnect()
  process.exit(1)
}
console.log('Payment successful!')
console.log(`Explorer link: https://testnet.xrpl.org/transactions/${paymentResponse.result.hash}`)
```

Python
```py
# Send MPT from sender to receiver ----------------------
print("\n=== Sending MPT payment... ===\n")
payment_tx = Payment(
    account=sender.address,
    destination=receiver.address,
    amount=MPTAmount(
        mpt_issuance_id=mpt_issuance_id,
        value="100",
    ),
)
print(json.dumps(payment_tx.to_xrpl(), indent=2))

payment_response = submit_and_wait(payment_tx, client, sender)
if payment_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    code = payment_response.result["meta"]["TransactionResult"]
    print(f"Error: Payment failed: {code}")
    sys.exit(1)
print("Payment successful!")
print(f"Explorer link: https://testnet.xrpl.org/transactions/{payment_response.result['hash']}")
```

Go
```go
	// Send MPT from sender to receiver ----------------------
	fmt.Printf("\n=== Sending MPT payment... ===\n\n")
	paymentTx := transaction.Payment{
		BaseTx: transaction.BaseTx{
			Account: sender.ClassicAddress,
		},
		Destination: receiver.ClassicAddress,
		Amount: &types.MPTCurrencyAmount{
			MPTIssuanceID: mptIssuanceID,
			Value:         "100",
		},
	}
	flatPayment := paymentTx.Flatten()
	paymentJSON, _ := json.MarshalIndent(flatPayment, "", "  ")
	fmt.Printf("%s\n", string(paymentJSON))

	paymentResponse, err := client.SubmitTxAndWait(flatPayment, &wstypes.SubmitOptions{
		Autofill: true,
		Wallet:   &sender,
	})
	if err != nil {
		panic(err)
	}
	if paymentResponse.Meta.TransactionResult != "tesSUCCESS" {
		fmt.Printf("Error: Payment failed: %s\n", paymentResponse.Meta.TransactionResult)
		os.Exit(1)
	}
	fmt.Printf("Payment successful!\n")
	fmt.Printf("Explorer link: https://testnet.xrpl.org/transactions/%s\n", paymentResponse.Hash.String())
```

The MPT issuance in this example uses an [asset scale](/docs/references/protocol/data-types/currency-formats#mpt-precision) of `2`, so applications shift the displayed amount two decimal places. A *value* of `"100"` therefore shows as `1.00` units of the token.

The example MPT has a `TransferFee` of `0`, which means the sender's debit matches the payment value exactly. With a non-zero `TransferFee`, the sender would have to pay extra so the receiver gets the full value.

Caution
If the payment fails, it could be for one of the following reasons:

- `tecNO_AUTH`: the issuance does not have **Can Transfer** enabled, or (with allow-listing) the issuer hasn't approved the holder.
- `tecPATH_PARTIAL`: the sender doesn't have enough of the MPT to cover the payment. This can also occur if the issuance has a non-zero `TransferFee` and the sender doesn't have enough to cover it.
- `tecLOCKED`: the issuance, the sender, or the receiver is locked by the issuer (only possible if the issuance has the **Can Lock** flag enabled).


### 6. Verify updated balances

Check both accounts' MPT holdings again to confirm the transfer.

JavaScript
```js
// Verify balances ----------------------
console.log(`\n=== Checking final MPT balances for issuance ${mptIssuanceID}... ===\n`)
const senderBalanceAfter = await getMPTBalance(sender.address, mptIssuanceID)
const receiverBalanceAfter = await getMPTBalance(receiver.address, mptIssuanceID)
console.log(`Sender balance:   ${senderBalanceAfter}`)
console.log(`Receiver balance: ${receiverBalanceAfter}`)

await client.disconnect()
```

Python
```py
# Verify balances ----------------------
print(f"\n=== Checking final MPT balances for issuance {mpt_issuance_id}... ===\n")
sender_balance_after = get_mpt_balance(sender.address, mpt_issuance_id)
receiver_balance_after = get_mpt_balance(receiver.address, mpt_issuance_id)
print(f"Sender balance:   {sender_balance_after}")
print(f"Receiver balance: {receiver_balance_after}")
```

Go
```go
	// Verify balances ----------------------
	fmt.Printf("\n=== Checking final MPT balances for issuance %s... ===\n\n", mptIssuanceID)
	senderBalanceAfter, err := getMPTBalance(sender.ClassicAddress, mptIssuanceID)
	if err != nil {
		panic(err)
	}
	receiverBalanceAfter, err := getMPTBalance(receiver.ClassicAddress, mptIssuanceID)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Sender balance:   %s\n", senderBalanceAfter)
	fmt.Printf("Receiver balance: %s\n", receiverBalanceAfter)
}
```

The sender's `MPTAmount` should have decreased by the value you sent, and the receiver's should match it.

## See Also

**Concepts**:

- [Multi-Purpose Tokens (MPT)](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens)


**Tutorials**:

- [Issue a Multi-Purpose Token (MPT)](/docs/tutorials/tokens/mpts/issue-a-multi-purpose-token)


**References**:

- [MPTokenAuthorize transaction](/docs/references/protocol/transactions/types/mptokenauthorize)
- [Payment transaction](/docs/references/protocol/transactions/types/payment)
- [ledger_entry method](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger_entry)
- [MPToken entry](/docs/references/protocol/ledger-data/ledger-entry-types/mptoken)
- [MPTokenIssuance entry](/docs/references/protocol/ledger-data/ledger-entry-types/mptokenissuance)