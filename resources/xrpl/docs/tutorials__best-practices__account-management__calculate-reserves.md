# Calculate Account Reserves

This tutorial demonstrates how to look up and calculate the [reserve requirements](/docs/concepts/accounts/reserves) for an XRP Ledger account. Reserves are the minimum amount of XRP an account must hold based on its activity on the ledger.

## Goals

By the end of this tutorial, you should be able to:

- Look up an account's current [base](/docs/concepts/accounts/reserves#base-reserve-and-owner-reserve) and incremental reserve values.
- Determine an account's [owner reserve](/docs/concepts/accounts/reserves#owner-reserves).
- Calculate an account's total reserve requirement.


## Prerequisites

To complete this tutorial, you need:

- A basic understanding of the XRP Ledger.
- An XRP Ledger [client library](/docs/references/client-libraries) set up.


## Source Code

You can find this tutorial's example source code in the [code samples section of this website's repository](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/calculate-reserves).

## Steps

### 1. Install dependencies

Install dependencies for your language from the code sample folder.

JavaScript
```bash
npm install xrpl
```

Python
```bash
pip install xrpl-py
```

Go
```bash
go mod tidy
```

### 2. Set up client

Import the XRPL library and create a client connection.

JavaScript
```js
// Set up client ----------------------

import xrpl from 'xrpl'

const client = new xrpl.Client('wss://xrplcluster.com')
await client.connect()
```

Python
```py
# Set up client ----------------------

client = JsonRpcClient("https://xrplcluster.com")
```

Go
```go
/ Set up client ----------------------

package main

import (
	"fmt"
	"strconv"

	"github.com/Peersyst/xrpl-go/xrpl/currency"
	"github.com/Peersyst/xrpl-go/xrpl/queries/account"
	"github.com/Peersyst/xrpl-go/xrpl/queries/server"
	"github.com/Peersyst/xrpl-go/xrpl/transaction/types"
	"github.com/Peersyst/xrpl-go/xrpl/websocket"
)

func main() {
	client := websocket.NewClient(
		websocket.NewClientConfig().
			WithHost("wss://xrplcluster.com"),
	)
	defer client.Disconnect()

	if err := client.Connect(); err != nil {
		panic(err)
	}
```

### 3. Look up reserve values

Retrieve the base and incremental reserve values using the [`server_info`](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_info) or [`server_state`](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_state) method. This example uses `server_state` to return reserve values as integer drops, avoiding floating-point precision issues.

JavaScript
```js
// Look up reserve values ----------------------

const serverState = await client.request({ command: 'server_state' })
const validatedLedger = serverState.result.state.validated_ledger

const baseReserveDrops = validatedLedger.reserve_base
const reserveIncDrops = validatedLedger.reserve_inc

console.log(`Base reserve: ${xrpl.dropsToXrp(baseReserveDrops)} XRP`)
console.log(`Incremental reserve: ${xrpl.dropsToXrp(reserveIncDrops)} XRP`)
```

Python
```py
# Look up reserve values ----------------------

response = client.request(ServerState())
validated_ledger = response.result["state"]["validated_ledger"]

base_reserve = validated_ledger["reserve_base"]
reserve_inc = validated_ledger["reserve_inc"]

print(f"Base reserve: {drops_to_xrp(str(base_reserve))} XRP")
print(f"Incremental reserve: {drops_to_xrp(str(reserve_inc))} XRP")
```

Go
```go
	// Look up reserve values ----------------------

	res, err := client.Request(&server.StateRequest{})
	if err != nil {
		panic(err)
	}
	var serverState server.StateResponse
	if err := res.GetResult(&serverState); err != nil {
		panic(err)
	}

	baseReserve := serverState.State.ValidatedLedger.ReserveBase
	reserveInc := serverState.State.ValidatedLedger.ReserveInc
	if reserveInc == nil {
		panic("server_state did not return reserve_inc")
	}

	baseReserveXrp, err := currency.DropsToXrp(strconv.FormatUint(uint64(baseReserve), 10))
	if err != nil {
		panic(err)
	}
	reserveIncXrp, err := currency.DropsToXrp(strconv.FormatUint(*reserveInc, 10))
	if err != nil {
		panic(err)
	}

	fmt.Printf("Base reserve: %v XRP\n", baseReserveXrp)
	fmt.Printf("Incremental reserve: %v XRP\n", reserveIncXrp)
```

### 4. Look up owner count

Call [`account_info`](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_info) and take `account_data.OwnerCount` to retrieve an account's total number of objects.

JavaScript
```js
// Look up owner count ----------------------

const address = 'rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn' // replace with any address
const accountInfo = await client.request({ command: 'account_info', account: address })
const ownerCount = accountInfo.result.account_data.OwnerCount
```

Python
```py
# Look up owner count ----------------------

address = "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"  # replace with any address
response = client.request(AccountInfo(account=address))
owner_count = response.result["account_data"]["OwnerCount"]
```

Go
```go
	// Look up owner count ----------------------

	address := types.Address("rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn") // replace with any address
	accountInfo, err := client.GetAccountInfo(&account.InfoRequest{Account: address})
	if err != nil {
		panic(err)
	}

	ownerCount := accountInfo.AccountData.OwnerCount
```

### 5. Calculate total reserve

Once you have the owner count, you can calculate the account's total reserve. The total reserve is the base reserve plus the incremental reserve multiplied by the owner count.

JavaScript
```js
// Calculate total reserve ----------------------

const totalReserveDrops = baseReserveDrops + (ownerCount * reserveIncDrops)
console.log(`Owner count: ${ownerCount}`)
console.log(`Total reserve: ${xrpl.dropsToXrp(totalReserveDrops)} XRP`)

await client.disconnect()
```

Python
```py
# Calculate total reserve ----------------------

total_reserve = base_reserve + (owner_count * reserve_inc)
print(f"Owner count: {owner_count}")
print(f"Total reserve: {drops_to_xrp(str(total_reserve))} XRP")
```

Go
```go
	// Calculate total reserve ----------------------

	totalReserve := uint64(baseReserve) + (uint64(ownerCount) * *reserveInc)

	totalReserveXrp, err := currency.DropsToXrp(strconv.FormatUint(uint64(totalReserve), 10))
	if err != nil {
		panic(err)
	}

	fmt.Printf("Owner count: %v\n", ownerCount)
	fmt.Printf("Total reserve: %v XRP\n", totalReserveXrp)
}
```

## See Also

Concepts:

- [Reserves](/docs/concepts/accounts/reserves)


Tutorials:

- [Calculate and Display the Reserve Requirement (Python)](/docs/tutorials/sample-apps/build-a-desktop-wallet-in-python#3-display-an-account)


References:

- [`server_info`](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_info)
- [`server_state`](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_state)
- [`account_info`](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_info)