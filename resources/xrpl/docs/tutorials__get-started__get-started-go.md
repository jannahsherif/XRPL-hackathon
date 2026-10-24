# Get Started Using Go Library

This tutorial walks you through the basics of building an XRP Ledger-connected application using [`xrpl-go`](https://github.com/XRPLF/xrpl-go), a pure Go library built to interact with the XRP Ledger.

This tutorial is intended for beginners and should take no longer than 30 minutes to complete.

## Learning Goals

In this tutorial, you'll learn:

- The basic building blocks of XRP Ledger-based applications.
- How to connect to the XRP Ledger using `xrpl-go`.
- How to get an account on the [Testnet](/resources/dev-tools/xrp-faucets) using `xrpl-go`.
- How to use the `xrpl-go` library to look up information about an account on the XRP Ledger.


## Requirements

To follow this tutorial, you should have Go version `1.25.13` or later installed.
[Download latest Go version](https://go.dev/dl/).

## Installation

The [`xrpl-go` library](https://github.com/XRPLF/xrpl-go) is available on [pkg.go.dev](https://pkg.go.dev/github.com/Peersyst/xrpl-go).

Start a new project (or use an existing one) and install the `xrpl-go` library via Go modules:

```bash
# Initialize your module (if you haven't already)
go mod init your-module-name

# Fetch the latest version of xrpl-go
go get github.com/Peersyst/xrpl-go@latest
```

## Start Building

When you're working with the XRP Ledger, there are a few things you'll need to manage, whether you're adding XRP to your [account](/docs/concepts/accounts), integrating with the [decentralized exchange](/docs/concepts/tokens/decentralized-exchange), or [issuing tokens](/docs/concepts/tokens). This tutorial walks you through basic patterns common to getting started with all of these use cases and provides sample code for implementing them.

Here are the basic steps you'll need to cover for almost any XRP Ledger project:

1. [Connect to the XRP Ledger.](#1-connect-to-the-xrp-ledger)
2. [Get an account.](#2-get-account)
3. [Query the XRP Ledger.](#3-query-the-xrp-ledger)


### 1. Connect to the XRP Ledger

To make queries and submit transactions, you need to connect to the XRP Ledger. To do this with `xrpl-go`, you have two main options:

1. Via WebSocket:

```go
func main() {
	// Define the network client
	client := websocket.NewClient(websocket.NewClientConfig().
		WithHost("wss://s.altnet.rippletest.net:51233").
		WithFaucetProvider(faucet.NewTestnetFaucetProvider()),
	)

	// Disconnect the client when done. (Defer executes at the end of the function)
	defer client.Disconnect()

	// Connect to the network
	if err := client.Connect(); err != nil {
		panic(err)
	}

	// ... custom code goes here
}
```
2. Via RPC:

```go
func main() {
	// Define the network client configuration
	cfg, err := rpc.NewClientConfig(
		"https://s.altnet.rippletest.net:51234/",
		rpc.WithFaucetProvider(faucet.NewTestnetFaucetProvider()),
	)
	if err != nil {
		panic(err)
	}

	// Initiate the network client
	client := rpc.NewClient(cfg)

	// Ping the network (used to avoid Go unused variable error, but useful to check connectivity)
	_, err = client.Ping(&utility.PingRequest{})
	if err != nil {
		panic(err)
	}

	// ... custom code goes here
}
```


#### Connect to the production XRP Ledger

The sample code in the previous section shows you how to connect to the Testnet, which is a [parallel network](/docs/concepts/networks-and-servers/parallel-networks) for testing where the money has no real value. When you're ready to integrate with the production XRP Ledger, you'll need to connect to the Mainnet. You can do that in two ways:

- By [installing the core server](/docs/infrastructure/installation) (`xrpld`) and running a node yourself. The core server connects to the Mainnet by default, but you can [change the configuration to use Testnet or Devnet](/docs/infrastructure/configuration/connect-your-xrpld-to-the-xrp-test-net). [There are good reasons to run your own core server](/docs/concepts/networks-and-servers#reasons-to-run-your-own-server). If you run your own server, you can connect to it like so:

```go
import "github.com/Peersyst/xrpl-go/xrpl/websocket"

const MY_SERVER = "ws://localhost:6006/"

func main() {
  client := websocket.NewClient(websocket.NewClientConfig().WithHost(MY_SERVER))

  // ... custom code goes here
}
```
See the example [core server config file](https://github.com/XRPLF/rippled/blob/release/3.4.x/cfg/xrpld-example.cfg#L1469) for more information about default values.
- By using one of the available [public servers](/docs/tutorials/public-servers):

```go
import "github.com/Peersyst/xrpl-go/xrpl/websocket"

const PUBLIC_SERVER = "wss://xrplcluster.com/"

func main() {
  client := websocket.NewClient(websocket.NewClientConfig().WithHost(PUBLIC_SERVER))

  // ... custom code goes here
}
```


### 2. Get account

In `xrpl-go`, account creation and key management live in the `wallet` package, and on Testnet you can use the built-in faucet provider on your WebSocket (or RPC) client to fund a brand-new account immediately.

On Testnet, you can fund a new ED25519 account like this:

```go
w, err := wallet.New(crypto.ED25519())
if err != nil {
	fmt.Println(err)
	return
}
if err := client.FundWallet(&w); err != nil {
	fmt.Println(err)
	return
}
```

This constructor returns a Go `Wallet` value with the following fields:

```go
type Wallet struct {
    PublicKey      string          // the hex-encoded public key
    PrivateKey     string          // the hex-encoded private key
    ClassicAddress types.Address   // the XRPL “r…” address
    Seed           string          // the base58 seed
}
```

If you already have a seed encoded in [base58](/docs/references/protocol/data-types/base58-encodings), you can make a `Wallet` instance from it like this:

```go
  w, err := wallet.FromSeed("sn3nxiW7v8KXzPzAqzyHXbSSKNuN9", "")
```

### 3. Query the XRP Ledger

You can query the XRP Ledger to get information about [a specific account](/docs/references/http-websocket-apis/public-api-methods/account-methods), [a specific transaction](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/tx), the state of a [current or a historical ledger](/docs/references/http-websocket-apis/public-api-methods/ledger-methods), and [the XRP Ledger's decentralized exchange](/docs/references/http-websocket-apis/public-api-methods/path-and-order-book-methods). You need to make these queries, among other reasons, to look up account info to follow best practices for [reliable transaction submission](/docs/concepts/transactions/reliable-transaction-submission).

Use the Client's `Request()` method to access the XRP Ledger's [WebSocket API](/docs/references/http-websocket-apis/api-conventions/request-formatting). For example:

```go
	// Get the latest validated ledger
	led, err := client.GetLedger(&ledger.Request{
		Transactions: true,
		LedgerIndex:  common.Validated,
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("Latest validated ledger:", led)

	// Get the first transaction hash from the ledger
	if len(led.Ledger.Transactions) > 0 {
		txHash := led.Ledger.Transactions[0].(string) // type assertion may be needed

		// Query the transaction details
		txResp, err := client.Request(&transactions.TxRequest{
			Transaction: txHash,
		})
		if err != nil {
			panic(err)
		}
		fmt.Println("First transaction in the ledger:")
		fmt.Println(txResp)
	}
}
```

Or, use the getter methods from the [`websocket`](https://pkg.go.dev/github.com/Peersyst/xrpl-go/xrpl/websocket) or [`rpc`](https://pkg.go.dev/github.com/Peersyst/xrpl-go/xrpl/rpc) packages:

```go
	// Get info from the ledger about the address we just funded
	acc_info, err := client.GetAccountInfo(&account.InfoRequest{
		Account: w.GetAddress(),
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("Account Balance:", acc_info.AccountData.Balance)
	fmt.Println("Account Sequence:", acc_info.AccountData.Sequence)
```

## Keep on Building

Now that you know how to use `xrpl-go` to connect to the XRP Ledger, get an account, and look up information about it, you can also:

- [Send XRP](/docs/tutorials/payments/send-xrp).