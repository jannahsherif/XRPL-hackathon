# Send a Trust Line Token

This tutorial shows you how to send a [trust line token](/docs/concepts/tokens/fungible-tokens/trust-line-tokens) from one holder to another on the XRP Ledger.

Each account must create a trust line to the issuer before it can hold the token. Holders can send the token to each other through the issuer only if the issuer allows rippling on both of their trust lines, either on all of its trust lines by enabling the **Default Ripple** flag (recommended), or on individual trust lines. This indirect movement of funds is called [rippling](/docs/concepts/tokens/fungible-tokens/rippling).

## Goals

By the end of this tutorial, you will be able to:

- Check that a receiving account can accept a trust line token payment.
- Send a trust line token payment between two accounts.
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

### 2. Set up client and accounts

To get started, import the necessary libraries and instantiate a client to connect to the XRPL. This example imports:

JavaScript
- `xrpl`: Used for XRPL client connection, transaction submission, and wallet handling.
- `bignumber.js`: Used to compare token amounts without floating-point rounding.
- `fs`: Used to check for and load the tutorial setup data.
- `./sendTrustLineTokenSetup.js`: The tutorial set up script, imported and called directly.


```js
import xrpl from 'xrpl'
import BigNumber from 'bignumber.js'
import fs from 'fs'
import { setup } from './sendTrustLineTokenSetup.js'

// Set up client ----------------------
const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
await client.connect()
```

Python
- `xrpl`: Used for XRPL client connection, transaction submission, and wallet handling.
- `decimal`: Used to compare token amounts without floating-point rounding.
- `json`: Used for loading and formatting JSON data.
- `os` and `sys`: Used to check for setup data and exit on transaction failures.
- `send_trust_line_token_setup`: The tutorial set up script, imported and called directly.


```py
import json
import os
import sys
from decimal import ROUND_UP, Context, Decimal

from xrpl.clients import JsonRpcClient
from xrpl.models import AccountInfo, AccountLines
from xrpl.models.amounts import IssuedCurrencyAmount
from xrpl.models.transactions import Payment
from xrpl.transaction import submit_and_wait
from xrpl.wallet import Wallet

from send_trust_line_token_setup import setup

# Set up client ----------------------
client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
```

Go
- `xrpl-go`: Used for XRPL client connection, transaction submission, wallet handling, and ledger entry flag constants.
- `encoding/json` and `fmt`: Used for formatting and printing results to the console.
- `math` and `math/big`: Used to compare token amounts without floating-point rounding.
- `os` and `os/exec`: Used to run the tutorial setup script.


```go
package main

import (
	"encoding/json"
	"fmt"
	"math"
	"math/big"
	"os"
	"os/exec"

	ledger "github.com/Peersyst/xrpl-go/xrpl/ledger-entry-types"
	"github.com/Peersyst/xrpl-go/xrpl/queries/account"
	accounttypes "github.com/Peersyst/xrpl-go/xrpl/queries/account/types"
	"github.com/Peersyst/xrpl-go/xrpl/queries/common"
	"github.com/Peersyst/xrpl-go/xrpl/transaction"
	"github.com/Peersyst/xrpl-go/xrpl/transaction/types"
	"github.com/Peersyst/xrpl-go/xrpl/wallet"
	"github.com/Peersyst/xrpl-go/xrpl/websocket"
	wstypes "github.com/Peersyst/xrpl-go/xrpl/websocket/types"
)

// decimal parses a token value string into a big.Rat, which is exact. Token
// values can have up to 16 significant digits, so avoid float64.
func decimal(value string) *big.Rat {
	r, ok := new(big.Rat).SetString(value)
	if !ok {
		panic("invalid decimal value: " + value)
	}
	return r
}

// amountString formats a token amount with at most 16 significant digits, the
// ledger's precision, rounding up so a SendMax never falls short.
func amountString(x *big.Rat) string {
	s := new(big.Float).SetRat(x).Text('g', 16)
	if rounded := decimal(s); rounded.Cmp(x) < 0 {
		f, _ := x.Float64()
		unit := new(big.Rat).SetFloat64(math.Pow10(int(math.Floor(math.Log10(f))) - 15))
		s = new(big.Float).SetRat(rounded.Add(rounded, unit)).Text('g', 16)
	}
	return s
}

func main() {
	// Connect to the network ----------------------
	client := websocket.NewClient(
		websocket.NewClientConfig().
			WithHost("wss://s.altnet.rippletest.net:51233"),
	)
	defer client.Disconnect()

	if err := client.Connect(); err != nil {
		panic(err)
	}
```

Next, load the sender wallet, and set the token to send and the receiver address. This example uses pre-configured data from the setup script, which funds the sender and buys TST for it on the [Decentralized Exchange (DEX)](/docs/concepts/tokens/decentralized-exchange), but you can replace these with your own values.

JavaScript
```js
// This step checks for the necessary setup data to run the tutorial.
// If missing, sendTrustLineTokenSetup.js will generate it.
if (!fs.existsSync('sendTrustLineTokenSetup.json')) {
  console.log(`\n=== Tutorial setup data doesn't exist. Running setup script... ===\n`)
  await setup()
}

// Load the preconfigured sender account.
const setupData = JSON.parse(fs.readFileSync('sendTrustLineTokenSetup.json', 'utf8'))
const sender = xrpl.Wallet.fromSeed(setupData.sender.seed)

// The token to send and who to send it to. TST is a test token on Testnet,
// and the receiver is a well-known account that already holds a TST trust
// line. You can replace these values with your own.
const issuerAddress = 'rP9jPyP5kyvFRb6ZiRghAGw5u8SGAmU4bd'
const currencyCode = 'TST'
const receiverAddress = 'rG6ZCtKCURU58DP2iiff4qziApBGSuvPqE'
const sendQuantity = '2'

// The highest transfer fee this script is willing to pay, as a percentage of
// the amount sent. Protects against approving a large fee by accident.
const maxTransferFeePercent = 10

console.log(`Issuer address:   ${issuerAddress}`)
console.log(`Sender address:   ${sender.address}`)
console.log(`Receiver address: ${receiverAddress}`)

// getTrustLine returns the trust line between `account` and `peer` for the
// given currency, or undefined if no such trust line exists.
async function getTrustLine(account, currency, peer) {
  const pages = await client.requestAll({
    command: 'account_lines',
    account,
    peer,
    ledger_index: 'validated'
  })
  return pages.flatMap(page => page.result.lines).find(line => line.currency === currency)
}
```

Python
```py
# This step checks for the necessary setup data to run the tutorial.
# If missing, send_trust_line_token_setup.py will generate it.
if not os.path.exists("send_trust_line_token_setup.json"):
    print("\n=== Tutorial setup data doesn't exist. Running setup script... ===\n")
    setup()

# Load the preconfigured sender account.
with open("send_trust_line_token_setup.json") as f:
    setup_data = json.load(f)

sender = Wallet.from_seed(setup_data["sender"]["seed"])

# The token to send and who to send it to. TST is a test token on Testnet,
# and the receiver is a well-known account that already holds a TST trust
# line. You can replace these values with your own.
issuer_address = "rP9jPyP5kyvFRb6ZiRghAGw5u8SGAmU4bd"
currency_code = "TST"
receiver_address = "rG6ZCtKCURU58DP2iiff4qziApBGSuvPqE"
send_quantity = "2"

# The highest transfer fee this script is willing to pay, as a percentage of
# the amount sent. Protects against approving a large fee by accident.
max_transfer_fee_percent = 10

# AccountRoot flags. See https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot
LSF_REQUIRE_AUTH = 0x00040000
LSF_DEFAULT_RIPPLE = 0x00800000

print(f"Issuer address:   {issuer_address}")
print(f"Sender address:   {sender.address}")
print(f"Receiver address: {receiver_address}")


# get_trust_line returns the trust line between `account` and `peer` for the
# given currency, or None if no such trust line exists.
def get_trust_line(account, currency, peer):
    marker = None
    while True:
        response = client.request(
            AccountLines(
                account=account,
                peer=peer,
                ledger_index="validated",
                marker=marker,
            )
        )
        for line in response.result["lines"]:
            if line["currency"] == currency:
                return line
        marker = response.result.get("marker")
        if marker is None:
            return None
```

Go
```go
	// This step checks for the necessary setup data to run the tutorial.
	// If missing, send-trust-line-token-setup will generate it.
	if _, err := os.Stat("send-trust-line-token-setup.json"); os.IsNotExist(err) {
		fmt.Printf("\n=== Tutorial setup data doesn't exist. Running setup script... ===\n\n")
		cmd := exec.Command("go", "run", "./send-trust-line-token-setup")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		if err := cmd.Run(); err != nil {
			panic(err)
		}
	}

	// Load the preconfigured sender account.
	data, err := os.ReadFile("send-trust-line-token-setup.json")
	if err != nil {
		panic(err)
	}
	var setup map[string]any
	if err := json.Unmarshal(data, &setup); err != nil {
		panic(err)
	}
	sender, err := wallet.FromSecret(setup["sender"].(map[string]any)["seed"].(string))
	if err != nil {
		panic(err)
	}

	// The token to send and who to send it to. TST is a test token on Testnet,
	// and the receiver is a well-known account that already holds a TST trust
	// line. You can replace these values with your own.
	const (
		issuerAddress   = "rP9jPyP5kyvFRb6ZiRghAGw5u8SGAmU4bd"
		currencyCode    = "TST"
		receiverAddress = "rG6ZCtKCURU58DP2iiff4qziApBGSuvPqE"
		sendQuantity    = "2"

		// The highest transfer fee this command is willing to pay, as a percentage
		// of the amount sent. Protects against approving a large fee by accident.
		maxTransferFeePercent = 10

		// TransferRate is in billionths; this value (or unset) means no fee.
		noTransferFee = 1000000000
	)

	fmt.Printf("Issuer address:   %s\n", issuerAddress)
	fmt.Printf("Sender address:   %s\n", sender.ClassicAddress)
	fmt.Printf("Receiver address: %s\n", receiverAddress)

	// getTrustLine returns the trust line between `addr` and `peer` for the
	// given currency, or nil if no such trust line exists.
	getTrustLine := func(addr, peer types.Address, currency string) *accounttypes.TrustLine {
		req := &account.LinesRequest{
			Account:     addr,
			Peer:        peer,
			LedgerIndex: common.Validated,
		}
		for {
			resp, err := client.GetAccountLines(req)
			if err != nil {
				panic(err)
			}
			for _, line := range resp.Lines {
				if line.Currency == currency {
					return &line
				}
			}
			if resp.Marker == nil {
				return nil
			}
			req.Marker = resp.Marker
		}
	}
```

TST is a test token available on Testnet, and the receiver is an account that already holds a TST trust line.

The `getTrustLine` helper uses the [account_lines method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_lines) to look up the trust line between an account and the issuer, and the remaining steps use it to read balances. The response is paginated, and an account that owns many ledger entries can return a first page with no matching lines and a `marker`, so the helper follows the markers until it finds the line.

### 3. Check the sender's balance

Before sending the payment, check the sender's balance using the [account_lines method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_lines). The sender should have an initial balance from the setup script, and at least enough to cover the payment plus any [transfer fee](/docs/concepts/tokens/fungible-tokens/transfer-fees) the issuer charges.

JavaScript
```js
// Check sender balance ----------------------
// Confirm the sender holds enough of the token to make the payment, including
// the issuer's transfer fee, which the sender pays on top of the amount sent.
console.log(`\n=== Checking sender's ${currencyCode} balance... ===\n`)
const issuerInfo = await client.request({
  command: 'account_info',
  account: issuerAddress,
  ledger_index: 'validated'
})
// parseAccountRootFlags turns the Flags bitmask into an object of booleans.
const issuerFlags = xrpl.parseAccountRootFlags(issuerInfo.result.account_data.Flags)

// If the issuer charges a transfer fee, the sender pays more than the
// receiver gets. Work out the SendMax needed and refuse unreasonable fees.
// TransferRate is a multiplier in billionths, e.g. 1005000000 = 1.005 = 0.5% fee.
const transferRate = issuerInfo.result.account_data.TransferRate ?? 1000000000
const transferFee = new BigNumber(xrpl.transferRateToDecimal(transferRate))
const transferFeePercent = transferFee.times(100)
if (transferFeePercent.gt(maxTransferFeePercent)) {
  console.error(`Error: Transfer fee of ${transferFeePercent}% exceeds the ${maxTransferFeePercent}% limit.`)
  await client.disconnect()
  process.exit(1)
}
let sendMax
if (transferFeePercent.gt(0)) {
  // Token amounts have at most 16 significant digits. Round up so SendMax
  // never falls short of the exact cost.
  sendMax = new BigNumber(sendQuantity).times(transferFee.plus(1)).precision(16, BigNumber.ROUND_UP).toString()
  console.log(`✓ Transfer fee is ${transferFeePercent}%; sender will pay up to ${sendMax} ${currencyCode}`)
} else {
  console.log('✓ No transfer fee')
}

const senderLine = await getTrustLine(sender.address, currencyCode, issuerAddress)
if (!senderLine) {
  console.error(`Error: Sender has no ${currencyCode} trust line with the issuer.`)
  await client.disconnect()
  process.exit(1)
}
console.log(`Sender's balance: ${senderLine.balance}`)
if (new BigNumber(senderLine.balance).lt(sendMax ?? sendQuantity)) {
  console.error(`Error: Sender's balance is less than the ${sendMax ?? sendQuantity} ${currencyCode} to send.`)
  await client.disconnect()
  process.exit(1)
}
```

Python
```py
# Check sender balance ----------------------
# Confirm the sender holds enough of the token to make the payment, including
# the issuer's transfer fee, which the sender pays on top of the amount sent.
print(f"\n=== Checking sender's {currency_code} balance... ===\n")
issuer_info = client.request(
    AccountInfo(account=issuer_address, ledger_index="validated")
)
issuer_flags = issuer_info.result["account_data"]["Flags"]

# If the issuer charges a transfer fee, the sender pays more than the
# receiver gets. Work out the SendMax needed and refuse unreasonable fees.
# TransferRate is a multiplier in billionths, e.g. 1005000000 = 1.005 = 0.5% fee.
transfer_rate = issuer_info.result["account_data"].get("TransferRate", 1000000000)
transfer_fee_percent = Decimal(transfer_rate - 1000000000) / Decimal(10000000)
if transfer_fee_percent > max_transfer_fee_percent:
    print(f"Error: Transfer fee of {transfer_fee_percent}% exceeds the {max_transfer_fee_percent}% limit.")
    sys.exit(1)
send_max = None
if transfer_fee_percent > 0:
    # Token amounts have at most 16 significant digits. Round up so SendMax
    # never falls short of the exact cost.
    send_max = str(Context(prec=16, rounding=ROUND_UP).divide(Decimal(send_quantity) * Decimal(transfer_rate), Decimal(1000000000)))
    print(f"✓ Transfer fee is {transfer_fee_percent}%; sender will pay up to {send_max} {currency_code}")
else:
    print("✓ No transfer fee")

sender_line = get_trust_line(sender.address, currency_code, issuer_address)
if sender_line is None:
    print(f"Error: Sender has no {currency_code} trust line with the issuer.")
    sys.exit(1)
print(f"Sender's balance: {sender_line['balance']}")
if Decimal(sender_line["balance"]) < Decimal(send_max or send_quantity):
    print(f"Error: Sender's balance is less than the {send_max or send_quantity} {currency_code} to send.")
    sys.exit(1)
```

Go
```go
	// Check sender balance ----------------------
	// Confirm the sender holds enough of the token to make the payment, including
	// the issuer's transfer fee, which the sender pays on top of the amount sent.
	fmt.Printf("\n=== Checking sender's %s balance... ===\n\n", currencyCode)
	issuerInfo, err := client.GetAccountInfo(&account.InfoRequest{
		Account:     issuerAddress,
		LedgerIndex: common.Validated,
	})
	if err != nil {
		panic(err)
	}
	issuerFlags := issuerInfo.AccountData.Flags

	// If the issuer charges a transfer fee, the sender pays more than the
	// receiver gets. Work out the SendMax needed and refuse unreasonable fees.
	// TransferRate is a multiplier in billionths, e.g. 1005000000 = 1.005 = 0.5% fee.
	transferRate := issuerInfo.AccountData.TransferRate
	if transferRate == 0 {
		transferRate = noTransferFee
	}
	transferFeePercent := float64(transferRate-noTransferFee) / 10000000
	if transferFeePercent > maxTransferFeePercent {
		fmt.Printf("Error: Transfer fee of %g%% exceeds the %d%% limit.\n", transferFeePercent, maxTransferFeePercent)
		os.Exit(1)
	}
	sendMax := ""
	if transferFeePercent > 0 {
		rate := new(big.Rat).SetFrac64(int64(transferRate), noTransferFee)
		sendMax = amountString(new(big.Rat).Mul(decimal(sendQuantity), rate))
		fmt.Printf("✓ Transfer fee is %g%%; sender will pay up to %s %s\n", transferFeePercent, sendMax, currencyCode)
	} else {
		fmt.Println("✓ No transfer fee")
	}
	needed := sendQuantity
	if sendMax != "" {
		needed = sendMax
	}

	senderLine := getTrustLine(sender.ClassicAddress, issuerAddress, currencyCode)
	if senderLine == nil {
		fmt.Printf("Error: Sender has no %s trust line with the issuer.\n", currencyCode)
		os.Exit(1)
	}
	fmt.Printf("Sender's balance: %s\n", senderLine.Balance)
	if decimal(senderLine.Balance).Cmp(decimal(needed)) < 0 {
		fmt.Printf("Error: Sender's balance is less than the %s %s to send.\n", needed, currencyCode)
		os.Exit(1)
	}
```

A trust line is a bidirectional relationship with a single, shared balance that is positive from one account's perspective and negative from the other's. Querying `account_lines` on a holder with `peer` set to the issuer returns the positive value.

### 4. Check that the receiver can receive the payment

A payment between two holders can fail for reasons that have nothing to do with the sender. Check the receiver's trust line and the issuer's settings before submitting, so you can tell the user why a payment can't go through instead of letting it fail on the ledger.

First, request the receiver's trust line with `account_lines`.

JavaScript
```js
// Check receiver ----------------------
// Confirm the receiver can accept the payment before sending it.
console.log(`\n=== Checking receiver can receive ${currencyCode}... ===\n`)
const receiverLine = await getTrustLine(receiverAddress, currencyCode, issuerAddress)
```

Python
```py
# Check receiver ----------------------
# Confirm the receiver can accept the payment before sending it.
print(f"\n=== Checking receiver can receive {currency_code}... ===\n")
receiver_line = get_trust_line(receiver_address, currency_code, issuer_address)
```

Go
```go
	// Check receiver ----------------------
	// Confirm the receiver can accept the payment before sending it.
	fmt.Printf("\n=== Checking receiver can receive %s... ===\n\n", currencyCode)
	receiverLine := getTrustLine(receiverAddress, issuerAddress, currencyCode)
```

Then, run the following checks:

JavaScript
```js
// 1. The receiver must have a trust line to the issuer for this currency.
if (!receiverLine) {
  console.error(`Error: Receiver has no ${currencyCode} trust line with the issuer.`)
  await client.disconnect()
  process.exit(1)
}
console.log('✓ Receiver has a trust line to the issuer')

// 2. The issuer must allow rippling on at least one of the two trust lines, since
//    a payment between holders moves through the issuer. Default Ripple on the
//    issuer is the usual way to allow this, but check the lines themselves.
if (senderLine.no_ripple_peer && receiverLine.no_ripple_peer) {
  console.error('Error: The issuer has disabled rippling on both the sender and receiver trust lines.')
  await client.disconnect()
  process.exit(1)
}
const defaultRipple = issuerFlags.lsfDefaultRipple === true
console.log(`✓ Rippling is allowed (issuer Default Ripple: ${defaultRipple})`)

// 3. The receiver's limit must cover their current balance plus the payment.
if (new BigNumber(receiverLine.balance).plus(sendQuantity).gt(receiverLine.limit)) {
  console.error(`Error: Payment would exceed the receiver's limit of ${receiverLine.limit} ${currencyCode}.`)
  await client.disconnect()
  process.exit(1)
}
console.log(`✓ Receiver's limit covers the payment`)

// 4. If the issuer requires authorization, the receiver's line must be authorized.
const requireAuth = issuerFlags.lsfRequireAuth === true
if (requireAuth && !receiverLine.peer_authorized) {
  console.error('Error: The issuer requires authorization and has not authorized the receiver.')
  await client.disconnect()
  process.exit(1)
}
console.log(`✓ Authorization OK (issuer Require Auth: ${requireAuth})`)

console.log(`\nBalances before payment:`)
console.log(`  Sender:   ${senderLine.balance} ${currencyCode}`)
console.log(`  Receiver: ${receiverLine.balance} ${currencyCode}`)
```

Python
```py
# 1. The receiver must have a trust line to the issuer for this currency.
if receiver_line is None:
    print(f"Error: Receiver has no {currency_code} trust line with the issuer.")
    sys.exit(1)
print("✓ Receiver has a trust line to the issuer")

# 2. The issuer must allow rippling on at least one of the two trust lines, since
#    a payment between holders moves through the issuer. Default Ripple on the
#    issuer is the usual way to allow this, but check the lines themselves.
if sender_line.get("no_ripple_peer") and receiver_line.get("no_ripple_peer"):
    print("Error: The issuer has disabled rippling on both the sender and receiver trust lines.")
    sys.exit(1)
default_ripple = bool(issuer_flags & LSF_DEFAULT_RIPPLE)
print(f"✓ Rippling is allowed (issuer Default Ripple: {default_ripple})")

# 3. The receiver's limit must cover their current balance plus the payment.
if Decimal(receiver_line["balance"]) + Decimal(send_quantity) > Decimal(receiver_line["limit"]):
    print(f"Error: Payment would exceed the receiver's limit of {receiver_line['limit']} {currency_code}.")
    sys.exit(1)
print("✓ Receiver's limit covers the payment")

# 4. If the issuer requires authorization, the receiver's line must be authorized.
require_auth = bool(issuer_flags & LSF_REQUIRE_AUTH)
if require_auth and not receiver_line.get("peer_authorized"):
    print("Error: The issuer requires authorization and has not authorized the receiver.")
    sys.exit(1)
print(f"✓ Authorization OK (issuer Require Auth: {require_auth})")

print("\nBalances before payment:")
print(f"  Sender:   {sender_line['balance']} {currency_code}")
print(f"  Receiver: {receiver_line['balance']} {currency_code}")
```

Go
```go
	// 1. The receiver must have a trust line to the issuer for this currency.
	if receiverLine == nil {
		fmt.Printf("Error: Receiver has no %s trust line with the issuer.\n", currencyCode)
		os.Exit(1)
	}
	fmt.Println("✓ Receiver has a trust line to the issuer")

	// 2. The issuer must allow rippling on at least one of the two trust lines, since
	//    a payment between holders moves through the issuer. Default Ripple on the
	//    issuer is the usual way to allow this, but check the lines themselves.
	if senderLine.NoRipplePeer && receiverLine.NoRipplePeer {
		fmt.Println("Error: The issuer has disabled rippling on both the sender and receiver trust lines.")
		os.Exit(1)
	}
	defaultRipple := issuerFlags&ledger.LsfDefaultRipple != 0
	fmt.Printf("✓ Rippling is allowed (issuer Default Ripple: %t)\n", defaultRipple)

	// 3. The receiver's limit must cover their current balance plus the payment.
	newBalance := new(big.Rat).Add(decimal(receiverLine.Balance), decimal(sendQuantity))
	if newBalance.Cmp(decimal(receiverLine.Limit)) > 0 {
		fmt.Printf("Error: Payment would exceed the receiver's limit of %s %s.\n", receiverLine.Limit, currencyCode)
		os.Exit(1)
	}
	fmt.Println("✓ Receiver's limit covers the payment")

	// 4. If the issuer requires authorization, the receiver's line must be authorized.
	requireAuth := issuerFlags&ledger.LsfRequireAuth != 0
	if requireAuth && !receiverLine.PeerAuthorized {
		fmt.Println("Error: The issuer requires authorization and has not authorized the receiver.")
		os.Exit(1)
	}
	fmt.Printf("✓ Authorization OK (issuer Require Auth: %t)\n", requireAuth)

	fmt.Println("\nBalances before payment:")
	fmt.Printf("  Sender:   %s %s\n", senderLine.Balance, currencyCode)
	fmt.Printf("  Receiver: %s %s\n", receiverLine.Balance, currencyCode)
```

1. **Trust line exists**: The receiver has a trust line to the issuer for this currency.
2. **Rippling is allowed**: The issuer hasn't set `no_ripple_peer` on **both** the sender's and receiver's lines.
3. **Limit covers the payment**: The receiver's `limit` is at least their `balance` plus the amount.
4. **Authorization**: If the issuer requires auth, the receiver's line has `peer_authorized` set.


### 5. Send the token payment

Once the checks pass, the sender can send the token to the receiver with a [Payment transaction](/docs/references/protocol/transactions/types/payment). Provide the [issued currency amount](/docs/references/protocol/data-types/currency-formats#token-amounts) object that specifies the currency code, the issuer's address, and the value to send.

JavaScript
```js
// Send payment ----------------------
// The sender pays the receiver with the token. Amount is what the receiver
// gets; SendMax (if set) is the most the sender is willing to spend.
console.log(`\n=== Sending ${sendQuantity} ${currencyCode} to receiver... ===\n`)
const paymentTx = {
  TransactionType: 'Payment',
  Account: sender.address,
  Destination: receiverAddress,
  Amount: {
    currency: currencyCode,
    issuer: issuerAddress,
    value: sendQuantity
  }
}
if (sendMax) {
  paymentTx.SendMax = {
    currency: currencyCode,
    issuer: issuerAddress,
    value: sendMax
  }
}
xrpl.validate(paymentTx)
console.log(JSON.stringify(paymentTx, null, 2))

const paymentResponse = await client.submitAndWait(paymentTx, {
  wallet: sender,
  autofill: true
})
if (paymentResponse.result.meta?.TransactionResult !== 'tesSUCCESS') {
  const resultCode = paymentResponse.result.meta?.TransactionResult
  console.error('Error: Unable to send token:', resultCode)
  await client.disconnect()
  process.exit(1)
}
console.log('Payment successful!')
console.log(`Explorer link: https://testnet.xrpl.org/transactions/${paymentResponse.result.hash}`)
```

Python
```py
# Send payment ----------------------
# The sender pays the receiver with the token. Amount is what the receiver
# gets; SendMax (if set) is the most the sender is willing to spend.
print(f"\n=== Sending {send_quantity} {currency_code} to receiver... ===\n")
payment_tx = Payment(
    account=sender.address,
    destination=receiver_address,
    amount=IssuedCurrencyAmount(
        currency=currency_code,
        issuer=issuer_address,
        value=send_quantity,
    ),
    send_max=(
        IssuedCurrencyAmount(
            currency=currency_code,
            issuer=issuer_address,
            value=send_max,
        )
        if send_max
        else None
    ),
)
print(json.dumps(payment_tx.to_xrpl(), indent=2))

payment_response = submit_and_wait(payment_tx, client, sender)
if payment_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    result_code = payment_response.result["meta"]["TransactionResult"]
    print(f"Error: Unable to send token: {result_code}")
    sys.exit(1)
print("Payment successful!")
print(f"Explorer link: https://testnet.xrpl.org/transactions/{payment_response.result['hash']}")
```

Go
```go
	// Send payment ----------------------
	// The sender pays the receiver with the token. Amount is what the receiver
	// gets; SendMax (if set) is the most the sender is willing to spend.
	fmt.Printf("\n=== Sending %s %s to receiver... ===\n\n", sendQuantity, currencyCode)
	paymentTx := transaction.Payment{
		BaseTx:      transaction.BaseTx{Account: sender.ClassicAddress},
		Destination: receiverAddress,
		Amount: types.IssuedCurrencyAmount{
			Currency: currencyCode,
			Issuer:   issuerAddress,
			Value:    sendQuantity,
		},
	}
	if sendMax != "" {
		paymentTx.SendMax = types.IssuedCurrencyAmount{
			Currency: currencyCode,
			Issuer:   issuerAddress,
			Value:    sendMax,
		}
	}

	// Flatten() converts the struct to a map and adds the TransactionType field
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
		fmt.Printf("Error: Unable to send token: %s\n", paymentResponse.Meta.TransactionResult)
		os.Exit(1)
	}
	fmt.Println("Payment successful!")
	fmt.Printf("Explorer link: https://testnet.xrpl.org/transactions/%s\n", paymentResponse.Hash)
```

The TST issuer doesn't charge a transfer fee, so the sender's balance decreases by the same amount the receiver gains. If you replace the issuer with one that has a non-zero `TransferRate`, the sender's balance decreases by more than the receiver gains. The `SendMax` field set in step 3 covers the difference.

Caution
If the payment fails, it could be for one of the following reasons:

- `tecPATH_PARTIAL`: the sender doesn't have enough balance to cover the payment. This can also occur if the issuer has configured a non-zero `TransferRate` and the sender doesn't have enough to cover the payment plus the transfer fee.
- `tecPATH_DRY`: no path could deliver any amount at all. This commonly happens when the receiver has no trust line for the token, the issuer doesn't allow rippling, or the receiver's trust line isn't authorized.


### 6. Verify updated balances

Check the account balances again to confirm the transfer.

JavaScript
```js
// Verify balances ----------------------
// Check both balances again to confirm the transfer.
console.log(`\n=== Checking final ${currencyCode} balances... ===\n`)

// The metadata's delivered_amount is the amount the receiver actually got.
// Always read this field rather than the transaction's Amount, because a
// partial payment can succeed while delivering less than Amount.
const deliveredAmount = paymentResponse.result.meta.delivered_amount
console.log(`  Delivered amount: ${deliveredAmount.value} ${deliveredAmount.currency}`)

const senderLineAfter = await getTrustLine(sender.address, currencyCode, issuerAddress)
const receiverLineAfter = await getTrustLine(receiverAddress, currencyCode, issuerAddress)
console.log(`  Sender:   ${senderLineAfter.balance} ${currencyCode}`)
console.log(`  Receiver: ${receiverLineAfter.balance} ${currencyCode}`)

await client.disconnect()
```

Python
```py
# Verify balances ----------------------
# Check both balances again to confirm the transfer.
print(f"\n=== Checking final {currency_code} balances... ===\n")

# The metadata's delivered_amount is the amount the receiver actually got.
# Always read this field rather than the transaction's Amount, because a
# partial payment can succeed while delivering less than Amount.
delivered_amount = payment_response.result["meta"]["delivered_amount"]
print(f"  Delivered amount: {delivered_amount['value']} {delivered_amount['currency']}")

sender_line_after = get_trust_line(sender.address, currency_code, issuer_address)
receiver_line_after = get_trust_line(receiver_address, currency_code, issuer_address)
print(f"  Sender:   {sender_line_after['balance']} {currency_code}")
print(f"  Receiver: {receiver_line_after['balance']} {currency_code}")
```

Go
```go
	// Verify balances ----------------------
	// Check both balances again to confirm the transfer.
	fmt.Printf("\n=== Checking final %s balances... ===\n\n", currencyCode)

	// The metadata's delivered_amount is the amount the receiver actually got.
	// Always read this field rather than the transaction's Amount, because a
	// partial payment can succeed while delivering less than Amount.
	deliveredAmount := paymentResponse.Meta.DeliveredAmount.(map[string]any)
	fmt.Printf("  Delivered amount: %s %s\n", deliveredAmount["value"], deliveredAmount["currency"])

	senderLineAfter := getTrustLine(sender.ClassicAddress, issuerAddress, currencyCode)
	receiverLineAfter := getTrustLine(receiverAddress, issuerAddress, currencyCode)
	fmt.Printf("  Sender:   %s %s\n", senderLineAfter.Balance, currencyCode)
	fmt.Printf("  Receiver: %s %s\n", receiverLineAfter.Balance, currencyCode)
}
```

The code first prints the **delivered amount** from the transaction metadata, which is the amount the receiver actually got. Always read this field when processing incoming payments, because a [partial payment](/docs/concepts/payment-types/partial-payments) can return `tesSUCCESS` while delivering less than `Amount`.

Note
If either trust line has a non-default [Quality setting](/docs/concepts/tokens/fungible-tokens/trust-line-tokens#trust-line-settings), that can also affect the amounts each side sees.

The sender's balance should have decreased by the amount sent plus the transfer fee, while the receiver's balance should have increased by only the delivered amount.

## See Also

- **Concepts**:
  - [Trust Line Tokens](/docs/concepts/tokens/fungible-tokens/trust-line-tokens)
  - [Rippling](/docs/concepts/tokens/fungible-tokens/rippling)
  - [Authorized Trust Lines](/docs/concepts/tokens/fungible-tokens/authorized-trust-lines)
  - [Transfer Fees](/docs/concepts/tokens/fungible-tokens/transfer-fees)
- **Tutorials**:
  - [Issue a Fungible Token](/docs/tutorials/tokens/fungible-tokens/issue-a-fungible-token)
  - [Trade in the Decentralized Exchange](/docs/tutorials/defi/dex/trade-in-the-decentralized-exchange)
- **References**:
  - [Payment transaction](/docs/references/protocol/transactions/types/payment)
  - [TrustSet transaction](/docs/references/protocol/transactions/types/trustset)
  - [account_lines method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_lines)
  - [account_info method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_info)
  - [RippleState entry](/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate)
  - [AccountRoot entry](/docs/references/protocol/ledger-data/ledger-entry-types/accountroot)