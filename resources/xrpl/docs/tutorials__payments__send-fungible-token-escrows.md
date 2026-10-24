# Send Fungible Token Escrows

This tutorial shows you how to create and finish escrows that hold fungible tokens on the XRP Ledger. It covers two types of fungible token escrows:

- **Conditional MPT escrow**: An escrow holding [Multi-Purpose Tokens](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens) that is released when a crypto-condition is fulfilled.
- **Timed trust line token escrow**: An escrow holding [trust line tokens](/docs/concepts/tokens/fungible-tokens/trust-line-tokens) that is released after a specified time.


Note
Though this tutorial covers these two specific scenarios, both fungible token types can be used in either conditional or timed escrows.

_Added by the [TokenEscrow amendment](/resources/known-amendments#tokenescrow). (Enabled: 2026-02-12)_

## Goals

By the end of this tutorial, you will be able to:

- Issue an MPT with escrow support enabled.
- Create and finish a conditional escrow that holds MPTs.
- Enable trust line token escrows on an issuer account.
- Create and finish a timed escrow that holds trust line tokens.


## Prerequisites

To complete this tutorial, you should:

- Have a basic understanding of the XRP Ledger.
- Have an XRP Ledger client library installed. This page provides examples for the following:
  - **JavaScript** with the [xrpl.js library](https://github.com/XRPLF/xrpl.js). See [Get Started Using JavaScript](/docs/tutorials/get-started/get-started-javascript) for setup steps.
  - **Python** with the [xrpl-py library](https://github.com/XRPLF/xrpl-py). See [Get Started Using Python](/docs/tutorials/get-started/get-started-python) for setup steps.
  - **Go** with the [xrpl-go library](https://github.com/XRPLF/xrpl-go). See [Get Started Using Go](/docs/tutorials/get-started/get-started-go) for setup steps.


## Source Code

You can find the complete source code for this tutorial's examples in the code samples section of this website's repository.

## Steps

### 1. Install dependencies

JavaScript
From the code sample folder, use `npm` to install dependencies.

```bash
npm install
```

Python
From the code sample folder, set up a virtual environment and use `pip` to install dependencies.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Go
From the code sample folder, use `go` to install dependencies.

```bash
go mod tidy
```

### 2. Set up client and fund accounts

Import the necessary libraries, instantiate a client to connect to the XRPL, and fund two new accounts (**Issuer** and **Escrow Creator**). This example imports:

JavaScript
- `xrpl`: Used for XRPL client connection, transaction submission, and wallet handling.
- `five-bells-condition` and `crypto`: Used to generate a crypto-condition.


```js
// This example demonstrates how to create escrows that hold fungible tokens.
// It covers MPTs and Trust Line Tokens, and uses conditional and timed escrows.

import xrpl from 'xrpl'
import { PreimageSha256 } from 'five-bells-condition'
import { randomBytes } from 'crypto'

const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
await client.connect()

// Fund an issuer account and an escrow creator account ----------------------
console.log(`\n=== Funding Accounts ===\n`)
const [
  { wallet: issuer },
  { wallet: creator }
] = await Promise.all([
  client.fundWallet(),
  client.fundWallet()
])
console.log(`Issuer: ${issuer.address}`)
console.log(`Escrow Creator: ${creator.address}`)
```

Python
- `xrpl`: Used for XRPL client connection, transaction submission, and wallet handling.
- `json`: Used for loading and formatting JSON data.
- `os` and `cryptoconditions`: Used to generate a crypto-condition.
- `datetime` and `time`: Used for time calculations.


```py
# This example demonstrates how to create escrows that hold fungible tokens.
# It covers MPTs and Trust Line Tokens, and uses conditional and timed escrows.

import json
from datetime import datetime, timedelta, UTC
from os import urandom
from time import sleep

from cryptoconditions import PreimageSha256
from xrpl.clients import JsonRpcClient
from xrpl.models import (
    AccountSet,
    EscrowCreate,
    EscrowFinish,
    MPTokenAuthorize,
    MPTokenIssuanceCreate,
    Payment,
    TrustSet,
)
from xrpl.models.amounts import IssuedCurrencyAmount, MPTAmount
from xrpl.models.requests import Ledger
from xrpl.models.transactions.account_set import AccountSetAsfFlag
from xrpl.models.transactions.mptoken_issuance_create import MPTokenIssuanceCreateFlag
from xrpl.transaction import submit_and_wait
from xrpl.utils import datetime_to_ripple_time, ripple_time_to_datetime
from xrpl.wallet import generate_faucet_wallet

client = JsonRpcClient("https://s.altnet.rippletest.net:51234")

# Fund an issuer account and an escrow creator account ----------------------
print("\n=== Funding Accounts ===\n")
issuer = generate_faucet_wallet(client, debug=True)
creator = generate_faucet_wallet(client, debug=True)
print(f"Issuer: {issuer.address}")
print(f"Escrow Creator: {creator.address}")
```

Go
- `xrpl-go`: Used for XRPL client connection, transaction submission, and wallet handling.
- `encoding/json`, `strings`, and `fmt`: Used for formatting and printing results to the console.
- `cryptoconditions`, `crypto/rand` and `encoding/hex`: Used to generate a crypto-condition.
- `time`: Used for time calculations.


```go
// This example demonstrates how to create escrows that hold fungible tokens.
// It covers MPTs and Trust Line Tokens, and uses conditional and timed escrows.

package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/Peersyst/xrpl-go/pkg/crypto"
	"github.com/Peersyst/xrpl-go/xrpl/faucet"
	"github.com/Peersyst/xrpl-go/xrpl/queries/account"
	"github.com/Peersyst/xrpl-go/xrpl/queries/common"
	ledgerreq "github.com/Peersyst/xrpl-go/xrpl/queries/ledger"
	xrpltime "github.com/Peersyst/xrpl-go/xrpl/time"
	"github.com/Peersyst/xrpl-go/xrpl/transaction"
	"github.com/Peersyst/xrpl-go/xrpl/transaction/types"
	"github.com/Peersyst/xrpl-go/xrpl/wallet"
	"github.com/Peersyst/xrpl-go/xrpl/websocket"
	wstypes "github.com/Peersyst/xrpl-go/xrpl/websocket/types"
	"github.com/go-interledger/cryptoconditions"
)

func main() {
	client := websocket.NewClient(
		websocket.NewClientConfig().
			WithHost("wss://s.altnet.rippletest.net:51233").
			WithFaucetProvider(faucet.NewTestnetFaucetProvider()),
	)
	defer client.Disconnect()

	if err := client.Connect(); err != nil {
		panic(err)
	}

	// Fund an issuer account and an escrow creator account ----------------------
	fmt.Printf("\n=== Funding Accounts ===\n\n")

	createAndFund := func(label string) wallet.Wallet {
		fmt.Printf("Funding %s account...\n", label)
		w, err := wallet.New(crypto.ED25519())
		if err != nil {
			panic(err)
		}
		if err := client.FundWallet(&w); err != nil {
			panic(err)
		}
		// Poll until account is validated on ledger
		funded := false
		for range 20 {
			_, err := client.Request(&account.InfoRequest{
				Account:     w.GetAddress(),
				LedgerIndex: common.Validated,
			})
			if err == nil {
				funded = true
				break
			}
			time.Sleep(time.Second)
		}
		if !funded {
			panic("Issue funding account: " + w.GetAddress().String())
		}
		return w
	}

	issuer := createAndFund("Issuer")
	creator := createAndFund("Escrow Creator")
	fmt.Printf("Issuer: %s\n", issuer.ClassicAddress)
	fmt.Printf("Escrow Creator: %s\n", creator.ClassicAddress)
```

### 3. Issue an MPT with escrow support

Construct an [MPTokenIssuanceCreate transaction](/docs/references/protocol/transactions/types/mptokenissuancecreate) with the `tfMPTCanEscrow` flag, which enables the token to be held in escrows. Then, retrieve the MPT issuance ID from the transaction result. This example creates an escrow that sends MPTs back to the original issuer. If you wanted to create an escrow for another account, the issuer would also have to set the `tfMPTCanTransfer` flag.

JavaScript
```js
// ====== Conditional MPT Escrow ======

// Issuer creates an MPT ----------------------
console.log('\n=== Creating MPT ===\n')
const mptCreateTx = {
  TransactionType: 'MPTokenIssuanceCreate',
  Account: issuer.address,
  MaximumAmount: '1000000',
  Flags: xrpl.MPTokenIssuanceCreateFlags.tfMPTCanEscrow
}

// Validate the transaction structure before submitting
xrpl.validate(mptCreateTx)
console.log(JSON.stringify(mptCreateTx, null, 2))

// Submit, sign, and wait for validation
console.log(`\nSubmitting MPTokenIssuanceCreate transaction...`)
const mptCreateResponse = await client.submitAndWait(mptCreateTx, {
  wallet: issuer,
  autofill: true
})
if (mptCreateResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  console.error(`MPTokenIssuanceCreate failed: ${mptCreateResponse.result.meta.TransactionResult}`)
  await client.disconnect()
  process.exit(1)
}

// Extract the MPT issuance ID from the transaction result
const mptIssuanceId = mptCreateResponse.result.meta.mpt_issuance_id
console.log(`MPT created: ${mptIssuanceId}`)
```

Python
```py
# ====== Conditional MPT Escrow ======

# Issuer creates an MPT ----------------------
print("\n=== Creating MPT ===\n")
mpt_create_tx = MPTokenIssuanceCreate(
    account=issuer.address,
    maximum_amount="1000000",
    flags=MPTokenIssuanceCreateFlag.TF_MPT_CAN_ESCROW,
)

print(json.dumps(mpt_create_tx.to_xrpl(), indent=2))

# Submit, sign, and wait for validation
print("\nSubmitting MPTokenIssuanceCreate transaction...")
mpt_create_response = submit_and_wait(mpt_create_tx, client, issuer)

if mpt_create_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    print(f"MPTokenIssuanceCreate failed: {mpt_create_response.result['meta']['TransactionResult']}")
    exit(1)

# Extract the MPT issuance ID from the transaction result
mpt_issuance_id = mpt_create_response.result["meta"]["mpt_issuance_id"]
print(f"MPT created: {mpt_issuance_id}")
```

Go
```go
	// ====== Conditional MPT Escrow ======

	// Issuer creates an MPT ----------------------
	fmt.Printf("\n=== Creating MPT ===\n\n")
	maxAmount := types.MPTAmount(1000000)
	mptCreateTx := transaction.MPTokenIssuanceCreate{
		BaseTx: transaction.BaseTx{
			Account: issuer.ClassicAddress,
			Flags:   transaction.TfMPTCanEscrow,
		},
		MaximumAmount: &maxAmount,
	}

	// Flatten() converts the struct to a map and adds the TransactionType field
	flatMptCreateTx := mptCreateTx.Flatten()
	mptCreateTxJSON, _ := json.MarshalIndent(flatMptCreateTx, "", "  ")
	fmt.Printf("%s\n", string(mptCreateTxJSON))

	// Submit, sign, and wait for validation
	fmt.Printf("\nSubmitting MPTokenIssuanceCreate transaction...\n")
	mptCreateResponse, err := client.SubmitTxAndWait(flatMptCreateTx, &wstypes.SubmitOptions{
		Autofill: true,
		Wallet:   &issuer,
	})
	if err != nil {
		panic(err)
	}
	if mptCreateResponse.Meta.TransactionResult != "tesSUCCESS" {
		fmt.Printf("MPTokenIssuanceCreate failed: %s\n", mptCreateResponse.Meta.TransactionResult)
		os.Exit(1)
	}

	// Extract the MPT issuance ID from the transaction result
	mptIssuanceID := string(*mptCreateResponse.Meta.MPTIssuanceID)
	fmt.Printf("MPT created: %s\n", mptIssuanceID)
```

### 4. Authorize the MPT

Before the escrow creator can hold the MPT, they must indicate their willingness to hold it with the [MPTokenAuthorize transaction](/docs/references/protocol/transactions/types/mptokenauthorize).

JavaScript
```js
// Escrow Creator authorizes the MPT ----------------------
console.log('\n=== Escrow Creator Authorizing MPT ===\n')
const mptAuthTx = {
  TransactionType: 'MPTokenAuthorize',
  Account: creator.address,
  MPTokenIssuanceID: mptIssuanceId
}

xrpl.validate(mptAuthTx)
console.log(JSON.stringify(mptAuthTx, null, 2))

console.log(`\nSubmitting MPTokenAuthorize transaction...`)
const mptAuthResponse = await client.submitAndWait(mptAuthTx, {
  wallet: creator,
  autofill: true
})
if (mptAuthResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  console.error(`MPTokenAuthorize failed: ${mptAuthResponse.result.meta.TransactionResult}`)
  await client.disconnect()
  process.exit(1)
}
console.log('Escrow Creator authorized for MPT.')
```

Python
```py
# Escrow Creator authorizes the MPT ----------------------
print("\n=== Escrow Creator Authorizing MPT ===\n")
mpt_auth_tx = MPTokenAuthorize(
    account=creator.address,
    mptoken_issuance_id=mpt_issuance_id,
)

print(json.dumps(mpt_auth_tx.to_xrpl(), indent=2))

print("\nSubmitting MPTokenAuthorize transaction...")
mpt_auth_response = submit_and_wait(mpt_auth_tx, client, creator)

if mpt_auth_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    print(f"MPTokenAuthorize failed: {mpt_auth_response.result['meta']['TransactionResult']}")
    exit(1)
print("Escrow Creator authorized for MPT.")
```

Go
```go
	// Escrow Creator authorizes the MPT ----------------------
	fmt.Printf("\n=== Escrow Creator Authorizing MPT ===\n\n")
	mptAuthTx := transaction.MPTokenAuthorize{
		BaseTx: transaction.BaseTx{
			Account: creator.ClassicAddress,
		},
		MPTokenIssuanceID: mptIssuanceID,
	}

	flatMptAuthTx := mptAuthTx.Flatten()
	mptAuthTxJSON, _ := json.MarshalIndent(flatMptAuthTx, "", "  ")
	fmt.Printf("%s\n", string(mptAuthTxJSON))

	fmt.Printf("\nSubmitting MPTokenAuthorize transaction...\n")
	mptAuthResponse, err := client.SubmitTxAndWait(flatMptAuthTx, &wstypes.SubmitOptions{
		Autofill: true,
		Wallet:   &creator,
	})
	if err != nil {
		panic(err)
	}
	if mptAuthResponse.Meta.TransactionResult != "tesSUCCESS" {
		fmt.Printf("MPTokenAuthorize failed: %s\n", mptAuthResponse.Meta.TransactionResult)
		os.Exit(1)
	}
	fmt.Printf("Escrow Creator authorized for MPT.\n")
```

### 5. Send MPTs to the escrow creator

Send MPTs from the issuer to the escrow creator using a [Payment transaction](/docs/references/protocol/transactions/types/payment).

JavaScript
```js
// Issuer sends MPTs to escrow creator ----------------------
console.log('\n=== Issuer Sending MPTs to Escrow Creator ===\n')
const mptPaymentTx = {
  TransactionType: 'Payment',
  Account: issuer.address,
  Destination: creator.address,
  Amount: {
    mpt_issuance_id: mptIssuanceId,
    value: '5000'
  }
}

xrpl.validate(mptPaymentTx)
console.log(JSON.stringify(mptPaymentTx, null, 2))

console.log(`\nSubmitting MPT Payment transaction...`)
const mptPaymentResponse = await client.submitAndWait(mptPaymentTx, {
  wallet: issuer,
  autofill: true
})
if (mptPaymentResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  console.error(`MPT Payment failed: ${mptPaymentResponse.result.meta.TransactionResult}`)
  await client.disconnect()
  process.exit(1)
}
console.log('Successfully sent 5000 MPTs to Escrow Creator.')
```

Python
```py
# Issuer sends MPTs to escrow creator ----------------------
print("\n=== Issuer Sending MPTs to Escrow Creator ===\n")
mpt_payment_tx = Payment(
    account=issuer.address,
    destination=creator.address,
    amount=MPTAmount(
        mpt_issuance_id=mpt_issuance_id,
        value="5000",
    ),
)

print(json.dumps(mpt_payment_tx.to_xrpl(), indent=2))

print("\nSubmitting MPT Payment transaction...")
mpt_payment_response = submit_and_wait(mpt_payment_tx, client, issuer)

if mpt_payment_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    print(f"MPT Payment failed: {mpt_payment_response.result['meta']['TransactionResult']}")
    exit(1)
print("Successfully sent 5000 MPTs to Escrow Creator.")
```

Go
```go
	// Issuer sends MPTs to escrow creator ----------------------
	fmt.Printf("\n=== Issuer Sending MPTs to Escrow Creator ===\n\n")
	mptPaymentTx := transaction.Payment{
		BaseTx: transaction.BaseTx{
			Account: issuer.ClassicAddress,
		},
		Destination: creator.ClassicAddress,
		Amount: types.MPTCurrencyAmount{
			MPTIssuanceID: mptIssuanceID,
			Value:         "5000",
		},
	}

	flatMptPaymentTx := mptPaymentTx.Flatten()
	mptPaymentTxJSON, _ := json.MarshalIndent(flatMptPaymentTx, "", "  ")
	fmt.Printf("%s\n", string(mptPaymentTxJSON))

	fmt.Printf("\nSubmitting MPT Payment transaction...\n")
	mptPaymentResponse, err := client.SubmitTxAndWait(flatMptPaymentTx, &wstypes.SubmitOptions{
		Autofill: true,
		Wallet:   &issuer,
	})
	if err != nil {
		panic(err)
	}
	if mptPaymentResponse.Meta.TransactionResult != "tesSUCCESS" {
		fmt.Printf("MPT Payment failed: %s\n", mptPaymentResponse.Meta.TransactionResult)
		os.Exit(1)
	}
	fmt.Printf("Successfully sent 5000 MPTs to Escrow Creator.\n")
```

### 6. Create a condition and fulfillment

Conditional escrows require a fulfillment and its corresponding condition in the format of a PREIMAGE-SHA-256 *crypto-condition*, represented as hexadecimal. To calculate these in the correct format, use a crypto-conditions library. Generally, you want to generate the fulfillment using at least 32 random bytes from a cryptographically secure source of randomness.

JavaScript
```js
// Escrow Creator creates a conditional MPT escrow ----------------------
console.log('\n=== Creating Conditional MPT Escrow ===\n')

// Generate crypto-condition
const preimage = randomBytes(32)
const fulfillment = new PreimageSha256()
fulfillment.setPreimage(preimage)
const fulfillmentHex = fulfillment.serializeBinary().toString('hex').toUpperCase()
const conditionHex = fulfillment.getConditionBinary().toString('hex').toUpperCase()
console.log(`Condition: ${conditionHex}`)
console.log(`Fulfillment: ${fulfillmentHex}\n`)
```

Python
```py
# Escrow Creator creates a conditional MPT escrow ----------------------
print("\n=== Creating Conditional MPT Escrow ===\n")

# Generate crypto-condition
preimage = urandom(32)
fulfillment = PreimageSha256(preimage=preimage)
fulfillment_hex = fulfillment.serialize_binary().hex().upper()
condition_hex = fulfillment.condition_binary.hex().upper()
print(f"Condition: {condition_hex}")
print(f"Fulfillment: {fulfillment_hex}\n")
```

Go
```go
	// Escrow Creator creates a conditional MPT escrow ----------------------
	fmt.Printf("\n=== Creating Conditional MPT Escrow ===\n\n")

	// Generate crypto-condition
	preimage := make([]byte, 32)
	if _, err := rand.Read(preimage); err != nil {
		panic(err)
	}
	fulfillment := cryptoconditions.NewPreimageSha256(preimage)
	fulfillmentBinary, err := fulfillment.Encode()
	if err != nil {
		panic(err)
	}
	conditionBinary, err := fulfillment.Condition().Encode()
	if err != nil {
		panic(err)
	}
	fulfillmentHex := strings.ToUpper(hex.EncodeToString(fulfillmentBinary))
	conditionHex := strings.ToUpper(hex.EncodeToString(conditionBinary))
	fmt.Printf("Condition: %s\n", conditionHex)
	fmt.Printf("Fulfillment: %s\n\n", fulfillmentHex)
```

### 7. Create the conditional MPT escrow

Create a conditional escrow using the generated crypto-condition. Fungible token escrows require an expiration date. This example sets an expiration time of five minutes. After creating the escrow, save the sequence number to reference it later.

JavaScript
```js
// Set expiration (300 seconds from now)
const cancelAfter = new Date()
cancelAfter.setSeconds(cancelAfter.getSeconds() + 300)
const cancelAfterRippleTime = xrpl.isoTimeToRippleTime(cancelAfter.toISOString())

const mptEscrowCreateTx = {
  TransactionType: 'EscrowCreate',
  Account: creator.address,
  Destination: issuer.address,
  Amount: {
    mpt_issuance_id: mptIssuanceId,
    value: '1000'
  },
  Condition: conditionHex,
  CancelAfter: cancelAfterRippleTime // Fungible token escrows require a CancelAfter time
}

xrpl.validate(mptEscrowCreateTx)
console.log(JSON.stringify(mptEscrowCreateTx, null, 2))

console.log(`\nSubmitting MPT EscrowCreate transaction...`)
const mptEscrowResponse = await client.submitAndWait(mptEscrowCreateTx, {
  wallet: creator,
  autofill: true
})
if (mptEscrowResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  console.error(`MPT EscrowCreate failed: ${mptEscrowResponse.result.meta.TransactionResult}`)
  await client.disconnect()
  process.exit(1)
}

// Save the sequence number to identify the escrow later
const mptEscrowSeq = mptEscrowResponse.result.tx_json.Sequence
console.log(`Conditional MPT escrow created. Sequence: ${mptEscrowSeq}`)
```

Python
```py
# Set expiration (300 seconds from now)
cancel_after = datetime.now(tz=UTC) + timedelta(seconds=300)
cancel_after_ripple_time = datetime_to_ripple_time(cancel_after)

mpt_escrow_create_tx = EscrowCreate(
    account=creator.address,
    destination=issuer.address,
    amount=MPTAmount(
        mpt_issuance_id=mpt_issuance_id,
        value="1000",
    ),
    condition=condition_hex,
    cancel_after=cancel_after_ripple_time,  # Fungible token escrows require a cancel_after time
)

print(json.dumps(mpt_escrow_create_tx.to_xrpl(), indent=2))

print("\nSubmitting MPT EscrowCreate transaction...")
mpt_escrow_response = submit_and_wait(mpt_escrow_create_tx, client, creator)

if mpt_escrow_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    print(f"MPT EscrowCreate failed: {mpt_escrow_response.result['meta']['TransactionResult']}")
    exit(1)

# Save the sequence number to identify the escrow later
mpt_escrow_seq = mpt_escrow_response.result["tx_json"]["Sequence"]
print(f"Conditional MPT escrow created. Sequence: {mpt_escrow_seq}")
```

Go
```go
	// Set expiration (300 seconds from now)
	cancelAfterRippleTime := xrpltime.UnixTimeToRippleTime(time.Now().Unix()) + 300

	mptEscrowCreateTx := transaction.EscrowCreate{
		BaseTx: transaction.BaseTx{
			Account: creator.ClassicAddress,
		},
		Destination: issuer.ClassicAddress,
		Amount: types.MPTCurrencyAmount{
			MPTIssuanceID: mptIssuanceID,
			Value:         "1000",
		},
		Condition:   conditionHex,
		CancelAfter: uint32(cancelAfterRippleTime), // Fungible token escrows require a CancelAfter time
	}

	flatMptEscrowCreateTx := mptEscrowCreateTx.Flatten()
	mptEscrowCreateTxJSON, _ := json.MarshalIndent(flatMptEscrowCreateTx, "", "  ")
	fmt.Printf("%s\n", string(mptEscrowCreateTxJSON))

	fmt.Printf("\nSubmitting MPT EscrowCreate transaction...\n")
	mptEscrowResponse, err := client.SubmitTxAndWait(flatMptEscrowCreateTx, &wstypes.SubmitOptions{
		Autofill: true,
		Wallet:   &creator,
	})
	if err != nil {
		panic(err)
	}
	if mptEscrowResponse.Meta.TransactionResult != "tesSUCCESS" {
		fmt.Printf("MPT EscrowCreate failed: %s\n", mptEscrowResponse.Meta.TransactionResult)
		os.Exit(1)
	}

	// Save the sequence number to identify the escrow later
	mptEscrowSeq := mptEscrowResponse.TxJSON.Sequence()
	fmt.Printf("Conditional MPT escrow created. Sequence: %d\n", mptEscrowSeq)
```

### 8. Finish the conditional MPT escrow

Finish the escrow by providing the original condition and its matching fulfillment.

JavaScript
```js
// Finish the conditional MPT escrow with the fulfillment ----------------------
console.log('\n=== Finishing Conditional MPT Escrow ===\n')
const mptEscrowFinishTx = {
  TransactionType: 'EscrowFinish',
  Account: creator.address,
  Owner: creator.address,
  OfferSequence: mptEscrowSeq,
  Condition: conditionHex,
  Fulfillment: fulfillmentHex
}

xrpl.validate(mptEscrowFinishTx)
console.log(JSON.stringify(mptEscrowFinishTx, null, 2))

console.log(`\nSubmitting EscrowFinish transaction...`)
const mptFinishResponse = await client.submitAndWait(mptEscrowFinishTx, {
  wallet: creator,
  autofill: true
})
if (mptFinishResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  console.error(`MPT EscrowFinish failed: ${mptFinishResponse.result.meta.TransactionResult}`)
  await client.disconnect()
  process.exit(1)
}
console.log(`Conditional MPT escrow finished successfully: https://testnet.xrpl.org/transactions/${mptFinishResponse.result.hash}`)
```

Python
```py
# Finish the conditional MPT escrow with the fulfillment ----------------------
print("\n=== Finishing Conditional MPT Escrow ===\n")
mpt_escrow_finish_tx = EscrowFinish(
    account=creator.address,
    owner=creator.address,
    offer_sequence=mpt_escrow_seq,
    condition=condition_hex,
    fulfillment=fulfillment_hex,
)

print(json.dumps(mpt_escrow_finish_tx.to_xrpl(), indent=2))

print("\nSubmitting EscrowFinish transaction...")
mpt_finish_response = submit_and_wait(mpt_escrow_finish_tx, client, creator)

if mpt_finish_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    print(f"MPT EscrowFinish failed: {mpt_finish_response.result['meta']['TransactionResult']}")
    exit(1)
print(f"Conditional MPT escrow finished successfully: https://testnet.xrpl.org/transactions/{mpt_finish_response.result['hash']}")
```

Go
```go
	// Finish the conditional MPT escrow with the fulfillment ----------------------
	fmt.Printf("\n=== Finishing Conditional MPT Escrow ===\n\n")
	mptEscrowFinishTx := transaction.EscrowFinish{
		BaseTx: transaction.BaseTx{
			Account: creator.ClassicAddress,
		},
		Owner:         creator.ClassicAddress,
		OfferSequence: mptEscrowSeq,
		Condition:     conditionHex,
		Fulfillment:   fulfillmentHex,
	}

	flatMptEscrowFinishTx := mptEscrowFinishTx.Flatten()
	mptEscrowFinishTxJSON, _ := json.MarshalIndent(flatMptEscrowFinishTx, "", "  ")
	fmt.Printf("%s\n", string(mptEscrowFinishTxJSON))

	fmt.Printf("\nSubmitting EscrowFinish transaction...\n")
	mptFinishResponse, err := client.SubmitTxAndWait(flatMptEscrowFinishTx, &wstypes.SubmitOptions{
		Autofill: true,
		Wallet:   &creator,
	})
	if err != nil {
		panic(err)
	}
	if mptFinishResponse.Meta.TransactionResult != "tesSUCCESS" {
		fmt.Printf("MPT EscrowFinish failed: %s\n", mptFinishResponse.Meta.TransactionResult)
		os.Exit(1)
	}
	fmt.Printf("Conditional MPT escrow finished successfully: https://testnet.xrpl.org/transactions/%s\n", mptFinishResponse.Hash)
```

### 9. Enable trust line token escrows

Token issuers enable trust line token escrows differently from MPTs. Unlike MPTs, which are escrowable at the token level, trust line tokens are escrowable at the account level. When an issuer enables the `asfAllowTrustLineLocking` flag on their account, *all* trust line tokens issued from that account are escrowable.

JavaScript
```js
// ====== Timed Trust Line Token Escrow ======

// Enable trust line token escrows on the issuer ----------------------
console.log('\n=== Enabling Trust Line Token Escrows on Issuer ===\n')
const accountSetTx = {
  TransactionType: 'AccountSet',
  Account: issuer.address,
  SetFlag: xrpl.AccountSetAsfFlags.asfAllowTrustLineLocking
}

xrpl.validate(accountSetTx)
console.log(JSON.stringify(accountSetTx, null, 2))

console.log(`\nSubmitting AccountSet transaction...`)
const accountSetResponse = await client.submitAndWait(accountSetTx, {
  wallet: issuer,
  autofill: true
})
if (accountSetResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  console.error(`AccountSet failed: ${accountSetResponse.result.meta.TransactionResult}`)
  await client.disconnect()
  process.exit(1)
}
console.log('Trust line token escrows enabled by issuer.')
```

Python
```py
# ====== Timed Trust Line Token Escrow ======

# Enable trust line token escrows on the issuer ----------------------
print("\n=== Enabling Trust Line Token Escrows on Issuer ===\n")
account_set_tx = AccountSet(
    account=issuer.address,
    set_flag=AccountSetAsfFlag.ASF_ALLOW_TRUSTLINE_LOCKING,
)

print(json.dumps(account_set_tx.to_xrpl(), indent=2))

print("\nSubmitting AccountSet transaction...")
account_set_response = submit_and_wait(account_set_tx, client, issuer)

if account_set_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    print(f"AccountSet failed: {account_set_response.result['meta']['TransactionResult']}")
    exit(1)
print("Trust line token escrows enabled by issuer.")
```

Go
```go
	// ====== Timed Trust Line Token Escrow ======

	// Enable trust line token escrows on the issuer ----------------------
	fmt.Printf("\n=== Enabling Trust Line Token Escrows on Issuer ===\n\n")
	accountSetTx := transaction.AccountSet{
		BaseTx: transaction.BaseTx{
			Account: issuer.ClassicAddress,
		},
		SetFlag: transaction.AsfAllowTrustLineLocking,
	}

	flatAccountSetTx := accountSetTx.Flatten()
	accountSetTxJSON, _ := json.MarshalIndent(flatAccountSetTx, "", "  ")
	fmt.Printf("%s\n", string(accountSetTxJSON))

	fmt.Printf("\nSubmitting AccountSet transaction...\n")
	accountSetResponse, err := client.SubmitTxAndWait(flatAccountSetTx, &wstypes.SubmitOptions{
		Autofill: true,
		Wallet:   &issuer,
	})
	if err != nil {
		panic(err)
	}
	if accountSetResponse.Meta.TransactionResult != "tesSUCCESS" {
		fmt.Printf("AccountSet failed: %s\n", accountSetResponse.Meta.TransactionResult)
		os.Exit(1)
	}
	fmt.Printf("Trust line token escrows enabled by issuer.\n")
```

### 10. Set up a trust line

Establish a trust line between the escrow creator and issuer using the [TrustSet transaction](/docs/references/protocol/transactions/types/trustset). The escrow creator submits this transaction to indicate their willingness to receive the token, defining the currency and maximum amount they're willing to hold.

JavaScript
```js
// Escrow Creator sets up a trust line to the issuer ----------------------
console.log('\n=== Setting Up Trust Line ===\n')
const currencyCode = 'IOU'

const trustSetTx = {
  TransactionType: 'TrustSet',
  Account: creator.address,
  LimitAmount: {
    currency: currencyCode,
    issuer: issuer.address,
    value: '10000000'
  }
}

xrpl.validate(trustSetTx)
console.log(JSON.stringify(trustSetTx, null, 2))

console.log(`\nSubmitting TrustSet transaction...`)
const trustResponse = await client.submitAndWait(trustSetTx, {
  wallet: creator,
  autofill: true
})
if (trustResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  console.error(`TrustSet failed: ${trustResponse.result.meta.TransactionResult}`)
  await client.disconnect()
  process.exit(1)
}
console.log(`Trust line successfully created for "${currencyCode}" tokens.`)
```

Python
```py
# Escrow Creator sets up a trust line to the issuer ----------------------
print("\n=== Setting Up Trust Line ===\n")
currency_code = "IOU"

trust_set_tx = TrustSet(
    account=creator.address,
    limit_amount=IssuedCurrencyAmount(
        currency=currency_code,
        issuer=issuer.address,
        value="10000000",
    ),
)

print(json.dumps(trust_set_tx.to_xrpl(), indent=2))

print("\nSubmitting TrustSet transaction...")
trust_response = submit_and_wait(trust_set_tx, client, creator)

if trust_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    print(f"TrustSet failed: {trust_response.result['meta']['TransactionResult']}")
    exit(1)
print(f'Trust line successfully created for "{currency_code}" tokens.')
```

Go
```go
	// Escrow Creator sets up a trust line to the issuer ----------------------
	fmt.Printf("\n=== Setting Up Trust Line ===\n\n")
	currencyCode := "IOU"

	trustSetTx := transaction.TrustSet{
		BaseTx: transaction.BaseTx{
			Account: creator.ClassicAddress,
		},
		LimitAmount: types.IssuedCurrencyAmount{
			Currency: currencyCode,
			Issuer:   issuer.ClassicAddress,
			Value:    "10000000",
		},
	}

	flatTrustSetTx := trustSetTx.Flatten()
	trustSetTxJSON, _ := json.MarshalIndent(flatTrustSetTx, "", "  ")
	fmt.Printf("%s\n", string(trustSetTxJSON))

	fmt.Printf("\nSubmitting TrustSet transaction...\n")
	trustResponse, err := client.SubmitTxAndWait(flatTrustSetTx, &wstypes.SubmitOptions{
		Autofill: true,
		Wallet:   &creator,
	})
	if err != nil {
		panic(err)
	}
	if trustResponse.Meta.TransactionResult != "tesSUCCESS" {
		fmt.Printf("TrustSet failed: %s\n", trustResponse.Meta.TransactionResult)
		os.Exit(1)
	}
	fmt.Printf("Trust line successfully created for \"%s\" tokens.\n", currencyCode)
```

### 11. Send IOU tokens to the escrow creator

Send IOU tokens from the issuer to the escrow creator using a [Payment transaction](/docs/references/protocol/transactions/types/payment).

JavaScript
```js
// Issuer sends IOU tokens to creator ----------------------
console.log('\n=== Issuer Sending IOU Tokens to Escrow Creator ===\n')
const iouPaymentTx = {
  TransactionType: 'Payment',
  Account: issuer.address,
  Destination: creator.address,
  Amount: {
    currency: currencyCode,
    value: '5000',
    issuer: issuer.address
  }
}

xrpl.validate(iouPaymentTx)
console.log(JSON.stringify(iouPaymentTx, null, 2))

console.log(`\nSubmitting Trust Line Token payment transaction...`)
const iouPayResponse = await client.submitAndWait(iouPaymentTx, {
  wallet: issuer,
  autofill: true
})
if (iouPayResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  console.error(`Trust Line Token payment failed: ${iouPayResponse.result.meta.TransactionResult}`)
  await client.disconnect()
  process.exit(1)
}
console.log(`Successfully sent 5000 ${currencyCode} tokens.`)
```

Python
```py
# Issuer sends IOU tokens to creator ----------------------
print("\n=== Issuer Sending IOU Tokens to Escrow Creator ===\n")
iou_payment_tx = Payment(
    account=issuer.address,
    destination=creator.address,
    amount=IssuedCurrencyAmount(
        currency=currency_code,
        value="5000",
        issuer=issuer.address,
    ),
)

print(json.dumps(iou_payment_tx.to_xrpl(), indent=2))

print("\nSubmitting Trust Line Token payment transaction...")
iou_pay_response = submit_and_wait(iou_payment_tx, client, issuer)

if iou_pay_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    print(f"Trust Line Token payment failed: {iou_pay_response.result['meta']['TransactionResult']}")
    exit(1)
print(f"Successfully sent 5000 {currency_code} tokens.")
```

Go
```go
	// Issuer sends IOU tokens to creator ----------------------
	fmt.Printf("\n=== Issuer Sending IOU Tokens to Escrow Creator ===\n\n")
	iouPaymentTx := transaction.Payment{
		BaseTx: transaction.BaseTx{
			Account: issuer.ClassicAddress,
		},
		Destination: creator.ClassicAddress,
		Amount: types.IssuedCurrencyAmount{
			Currency: currencyCode,
			Value:    "5000",
			Issuer:   issuer.ClassicAddress,
		},
	}

	flatIouPaymentTx := iouPaymentTx.Flatten()
	iouPaymentTxJSON, _ := json.MarshalIndent(flatIouPaymentTx, "", "  ")
	fmt.Printf("%s\n", string(iouPaymentTxJSON))

	fmt.Printf("\nSubmitting Trust Line Token payment transaction...\n")
	iouPayResponse, err := client.SubmitTxAndWait(flatIouPaymentTx, &wstypes.SubmitOptions{
		Autofill: true,
		Wallet:   &issuer,
	})
	if err != nil {
		panic(err)
	}
	if iouPayResponse.Meta.TransactionResult != "tesSUCCESS" {
		fmt.Printf("Trust Line Token payment failed: %s\n", iouPayResponse.Meta.TransactionResult)
		os.Exit(1)
	}
	fmt.Printf("Successfully sent 5000 %s tokens.\n", currencyCode)
```

### 12. Create a timed trust line token escrow

To make a timed escrow, set the maturity time of the escrow, which is a timestamp formatted as [seconds since the Ripple Epoch](/docs/references/protocol/data-types/basic-data-types#specifying-time). This example sets a maturity time of ten seconds from the time the code executes. Since it is a fungible token escrow, it also sets an expiration time of five minutes. After submitting the [EscrowCreate transaction](/docs/references/protocol/transactions/types/escrowcreate), save the sequence number from the transaction result.

JavaScript
```js
// Escrow Creator creates a timed trust line token escrow ----------------------
console.log('\n=== Creating Timed Trust Line Token Escrow ===\n')
const delay = 10 // seconds
const now = new Date()
const finishAfter = new Date(now.getTime() + delay * 1000)
const finishAfterRippleTime = xrpl.isoTimeToRippleTime(finishAfter.toISOString())
console.log(`Escrow will mature after: ${finishAfter.toLocaleString()}\n`)

const iouCancelAfter = new Date(now.getTime() + 300 * 1000)
const iouCancelAfterRippleTime = xrpl.isoTimeToRippleTime(iouCancelAfter.toISOString())

const iouEscrowCreateTx = {
  TransactionType: 'EscrowCreate',
  Account: creator.address,
  Destination: issuer.address,
  Amount: {
    currency: currencyCode,
    value: '1000',
    issuer: issuer.address
  },
  FinishAfter: finishAfterRippleTime,
  CancelAfter: iouCancelAfterRippleTime
}

xrpl.validate(iouEscrowCreateTx)
console.log(JSON.stringify(iouEscrowCreateTx, null, 2))

console.log(`\nSubmitting Trust Line Token EscrowCreate transaction...`)
const iouEscrowResponse = await client.submitAndWait(iouEscrowCreateTx, {
  wallet: creator,
  autofill: true
})
if (iouEscrowResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  console.error(`Trust Line Token EscrowCreate failed: ${iouEscrowResponse.result.meta.TransactionResult}`)
  await client.disconnect()
  process.exit(1)
}

// Save the sequence number to identify the escrow later
const iouEscrowSeq = iouEscrowResponse.result.tx_json.Sequence
console.log(`Trust Line Token escrow created. Sequence: ${iouEscrowSeq}`)
```

Python
```py
# Escrow Creator creates a timed trust line token escrow ----------------------
print("\n=== Creating Timed Trust Line Token Escrow ===\n")
delay = 10  # seconds
now = datetime.now(tz=UTC)
finish_after = now + timedelta(seconds=delay)
finish_after_ripple_time = datetime_to_ripple_time(finish_after)
mature_time = finish_after.astimezone().strftime("%m/%d/%Y, %I:%M:%S %p")
print(f"Escrow will mature after: {mature_time}\n")

iou_cancel_after = now + timedelta(seconds=300)
iou_cancel_after_ripple_time = datetime_to_ripple_time(iou_cancel_after)

iou_escrow_create_tx = EscrowCreate(
    account=creator.address,
    destination=issuer.address,
    amount=IssuedCurrencyAmount(
        currency=currency_code,
        value="1000",
        issuer=issuer.address,
    ),
    finish_after=finish_after_ripple_time,
    cancel_after=iou_cancel_after_ripple_time,
)

print(json.dumps(iou_escrow_create_tx.to_xrpl(), indent=2))

print("\nSubmitting Trust Line Token EscrowCreate transaction...")
iou_escrow_response = submit_and_wait(iou_escrow_create_tx, client, creator)

if iou_escrow_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    print(f"Trust Line Token EscrowCreate failed: {iou_escrow_response.result['meta']['TransactionResult']}")
    exit(1)

# Save the sequence number to identify the escrow later
iou_escrow_seq = iou_escrow_response.result["tx_json"]["Sequence"]
print(f"Trust Line Token escrow created. Sequence: {iou_escrow_seq}")
```

Go
```go
	// Escrow Creator creates a timed trust line token escrow ----------------------
	fmt.Printf("\n=== Creating Timed Trust Line Token Escrow ===\n\n")
	delay := 10 // seconds
	now := time.Now()
	finishAfterRippleTime := xrpltime.UnixTimeToRippleTime(now.Unix()) + int64(delay)
	matureTime := now.Add(time.Duration(delay) * time.Second).Format("01/02/2006, 03:04:05 PM")
	fmt.Printf("Escrow will mature after: %s\n\n", matureTime)

	iouCancelAfterRippleTime := xrpltime.UnixTimeToRippleTime(now.Unix()) + 300

	iouEscrowCreateTx := transaction.EscrowCreate{
		BaseTx: transaction.BaseTx{
			Account: creator.ClassicAddress,
		},
		Destination: issuer.ClassicAddress,
		Amount: types.IssuedCurrencyAmount{
			Currency: currencyCode,
			Value:    "1000",
			Issuer:   issuer.ClassicAddress,
		},
		FinishAfter: uint32(finishAfterRippleTime),
		CancelAfter: uint32(iouCancelAfterRippleTime),
	}

	flatIouEscrowCreateTx := iouEscrowCreateTx.Flatten()
	iouEscrowCreateTxJSON, _ := json.MarshalIndent(flatIouEscrowCreateTx, "", "  ")
	fmt.Printf("%s\n", string(iouEscrowCreateTxJSON))

	fmt.Printf("\nSubmitting Trust Line Token EscrowCreate transaction...\n")
	iouEscrowResponse, err := client.SubmitTxAndWait(flatIouEscrowCreateTx, &wstypes.SubmitOptions{
		Autofill: true,
		Wallet:   &creator,
	})
	if err != nil {
		panic(err)
	}
	if iouEscrowResponse.Meta.TransactionResult != "tesSUCCESS" {
		fmt.Printf("Trust Line Token EscrowCreate failed: %s\n", iouEscrowResponse.Meta.TransactionResult)
		os.Exit(1)
	}

	// Save the sequence number to identify the escrow later
	iouEscrowSeq := iouEscrowResponse.TxJSON.Sequence()
	fmt.Printf("Trust Line Token escrow created. Sequence: %d\n", iouEscrowSeq)
```

### 13. Wait for escrow to mature and finish

Wait for the escrow to mature. Before submitting the [EscrowFinish](/docs/references/protocol/transactions/types/escrowfinish) transaction, the code checks the current validated ledger to confirm the close time is after the escrow maturation time. This check ensures the escrow is matured on a validated ledger before trying to finish it.

JavaScript
```js
// Wait for the escrow to mature, then finish it --------------------
console.log(`\n=== Waiting For Timed Trust Line Token Escrow to Mature ===\n`)

// Sleep function to countdown delay until escrow matures
function sleep (delayInSeconds) {
  return new Promise((resolve) => setTimeout(resolve, delayInSeconds * 1000))
}
for (let i = delay; i >= 0; i--) {
  process.stdout.write(`\rWaiting for escrow to mature... ${i}s remaining...`)
  await sleep(1)
}
console.log('\rWaiting for escrow to mature... done.           ')

// Confirm latest validated ledger close time is after the FinishAfter time
let escrowReady = false
while (!escrowReady) {
  const validatedLedger = await client.request({
    command: 'ledger',
    ledger_index: 'validated'
  })
  const ledgerCloseTime = validatedLedger.result.ledger.close_time
  console.log(`Latest validated ledger closed at: ${new Date(xrpl.rippleTimeToISOTime(ledgerCloseTime)).toLocaleString()}`)
  if (ledgerCloseTime > finishAfterRippleTime) {
    escrowReady = true
    console.log('Escrow confirmed ready to finish.')
  } else {
    let timeDifference = finishAfterRippleTime - ledgerCloseTime
    if (timeDifference === 0) { timeDifference = 1 }
    console.log(`Escrow needs to wait another ${timeDifference}s.`)
    await sleep(timeDifference)
  }
}

// Finish the timed trust line token escrow --------------------
console.log('\n=== Finishing Timed Trust Line Token Escrow ===\n')
const iouEscrowFinishTx = {
  TransactionType: 'EscrowFinish',
  Account: creator.address,
  Owner: creator.address,
  OfferSequence: iouEscrowSeq
}

xrpl.validate(iouEscrowFinishTx)
console.log(JSON.stringify(iouEscrowFinishTx, null, 2))

console.log(`\nSubmitting EscrowFinish transaction...`)
const iouFinishResponse = await client.submitAndWait(iouEscrowFinishTx, {
  wallet: creator,
  autofill: true
})
if (iouFinishResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  console.error(`Trust Line Token EscrowFinish failed: ${iouFinishResponse.result.meta.TransactionResult}`)
  await client.disconnect()
  process.exit(1)
}
console.log(`Timed Trust Line Token escrow finished successfully: https://testnet.xrpl.org/transactions/${iouFinishResponse.result.hash}`)

await client.disconnect()
```

Python
```py
# Wait for the escrow to mature, then finish it --------------------
print("\n=== Waiting For Timed Trust Line Token Escrow to Mature ===\n")

# Countdown delay until escrow matures
for i in range(delay, -1, -1):
    print(f"Waiting for escrow to mature... {i}s remaining...", end="\r", flush=True)
    sleep(1)
print("Waiting for escrow to mature... done.           ")

# Confirm latest validated ledger close time is after the finish_after time
escrow_ready = False
while not escrow_ready:
    validated_ledger = client.request(Ledger(ledger_index="validated"))
    ledger_close_time = validated_ledger.result["ledger"]["close_time"]
    ledger_close_local = ripple_time_to_datetime(ledger_close_time).astimezone().strftime("%m/%d/%Y, %I:%M:%S %p")
    print(f"Latest validated ledger closed at: {ledger_close_local}")
    if ledger_close_time > finish_after_ripple_time:
        escrow_ready = True
        print("Escrow confirmed ready to finish.")
    else:
        time_difference = finish_after_ripple_time - ledger_close_time
        if time_difference == 0:
            time_difference = 1
        print(f"Escrow needs to wait another {time_difference}s.")
        sleep(time_difference)

# Finish the timed trust line token escrow --------------------
print("\n=== Finishing Timed Trust Line Token Escrow ===\n")
iou_escrow_finish_tx = EscrowFinish(
    account=creator.address,
    owner=creator.address,
    offer_sequence=iou_escrow_seq,
)

print(json.dumps(iou_escrow_finish_tx.to_xrpl(), indent=2))

print("\nSubmitting EscrowFinish transaction...")
iou_finish_response = submit_and_wait(iou_escrow_finish_tx, client, creator)

if iou_finish_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    print(f"Trust Line Token EscrowFinish failed: {iou_finish_response.result['meta']['TransactionResult']}")
    exit(1)
print(f"Timed Trust Line Token escrow finished successfully: https://testnet.xrpl.org/transactions/{iou_finish_response.result['hash']}")
```

Go
```go
	// Wait for the escrow to mature, then finish it --------------------
	fmt.Printf("\n=== Waiting For Timed Trust Line Token Escrow to Mature ===\n\n")

	// Countdown delay until escrow matures
	for i := delay; i >= 0; i-- {
		fmt.Printf("Waiting for escrow to mature... %ds remaining...\r", i)
		time.Sleep(time.Second)
	}
	fmt.Printf("Waiting for escrow to mature... done.           \n")

	// Confirm latest validated ledger close time is after the FinishAfter time
	escrowReady := false
	for !escrowReady {
		ledgerResp, err := client.GetLedger(&ledgerreq.Request{
			LedgerIndex: common.Validated,
		})
		if err != nil {
			panic(err)
		}
		ledgerCloseTime := int64(ledgerResp.Ledger.CloseTime)
		ledgerCloseLocal := time.Unix(xrpltime.RippleTimeToUnixTime(ledgerCloseTime)/1000, 0).Format("01/02/2006, 03:04:05 PM")
		fmt.Printf("Latest validated ledger closed at: %s\n", ledgerCloseLocal)
		if ledgerCloseTime > finishAfterRippleTime {
			escrowReady = true
			fmt.Printf("Escrow confirmed ready to finish.\n")
		} else {
			timeDifference := finishAfterRippleTime - ledgerCloseTime
			if timeDifference == 0 {
				timeDifference = 1
			}
			fmt.Printf("Escrow needs to wait another %ds.\n", timeDifference)
			time.Sleep(time.Duration(timeDifference) * time.Second)
		}
	}

	// Finish the timed trust line token escrow --------------------
	fmt.Printf("\n=== Finishing Timed Trust Line Token Escrow ===\n\n")
	iouEscrowFinishTx := transaction.EscrowFinish{
		BaseTx: transaction.BaseTx{
			Account: creator.ClassicAddress,
		},
		Owner:         creator.ClassicAddress,
		OfferSequence: iouEscrowSeq,
	}

	flatIouEscrowFinishTx := iouEscrowFinishTx.Flatten()
	iouEscrowFinishTxJSON, _ := json.MarshalIndent(flatIouEscrowFinishTx, "", "  ")
	fmt.Printf("%s\n", string(iouEscrowFinishTxJSON))

	fmt.Printf("\nSubmitting EscrowFinish transaction...\n")
	iouFinishResponse, err := client.SubmitTxAndWait(flatIouEscrowFinishTx, &wstypes.SubmitOptions{
		Autofill: true,
		Wallet:   &creator,
	})
	if err != nil {
		panic(err)
	}
	if iouFinishResponse.Meta.TransactionResult != "tesSUCCESS" {
		fmt.Printf("Trust Line Token EscrowFinish failed: %s\n", iouFinishResponse.Meta.TransactionResult)
		os.Exit(1)
	}
	fmt.Printf("Timed Trust Line Token escrow finished successfully: https://testnet.xrpl.org/transactions/%s\n", iouFinishResponse.Hash)
}
```

## See Also

**Concepts**:

- [Escrow](/docs/concepts/payment-types/escrow)
- [Multi-Purpose Tokens](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens)
- [Trust Line Tokens](/docs/concepts/tokens/fungible-tokens/trust-line-tokens)


**Tutorials**:

- [Look up Escrows](/docs/tutorials/payments/look-up-escrows)
- [Cancel an Expired Escrow](/docs/tutorials/payments/cancel-an-expired-escrow)


**References**:

- [EscrowCreate transaction](/docs/references/protocol/transactions/types/escrowcreate)
- [EscrowFinish transaction](/docs/references/protocol/transactions/types/escrowfinish)