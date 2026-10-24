# Get Started Using Python Library

This tutorial walks you through the basics of building an XRP Ledger-connected application using the [`xrpl-py`](https://github.com/XRPLF/xrpl-py) client library, a pure [Python](https://www.python.org) library built to interact with the XRP Ledger using native Python models and methods.

This tutorial is intended for beginners and should take no longer than 30 minutes to complete.

## Goals

In this tutorial, you'll learn:

- The basic building blocks of XRP Ledger-based applications.
- How to connect to the XRP Ledger using `xrpl-py`.
- How to get an account on the [Testnet](/resources/dev-tools/xrp-faucets) using `xrpl-py`.
- How to use the `xrpl-py` library to look up information about an account on the XRP Ledger.
- How to put these steps together to create a Python app.


## Prerequisites

To complete this tutorial, you should meet the following guidelines:

- Have a basic understanding of Python.
- Have installed [Python 3.7](https://www.python.org/downloads/) or later.


## Source Code

Click **Download** on the top right of the code preview panel to download the source code.

## Steps

Follow the steps to create a simple application with `xrpl-py`.

### 1. Install Dependencies

Start a new project by creating an empty folder, then move into that folder and set up a Python virtual environment with the necessary dependencies:

```sh
# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate

# Install the xrpl-py library
pip install xrpl-py
```

Alternatively, if you're using the downloaded source code, you can install all dependencies from the `requirements.txt` file:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Connect to the XRP Ledger

#### Connect to the XRP Ledger Testnet

To make queries and submit transactions, you need to connect to the XRP Ledger. To do this with `xrpl-py`, use the [`xrp.clients` module](https://xrpl-py.readthedocs.io/en/latest/source/xrpl.clients.html).

Note
The standard approach with `xrpl-py` is to use the JSON-RPC client. While a WebSocket client is available, it requires you to use `async`/`await` throughout your code. For most use cases, stick with JSON-RPC to avoid the complexity of asynchronous programming.

The sample code shows you how to connect to the Testnet, which is one of the available [parallel networks](/docs/concepts/networks-and-servers/parallel-networks).

#### Connect to the XRP Ledger Mainnet

The sample code in the previous section shows you how to connect to the Testnet, which is a [parallel network](/docs/concepts/networks-and-servers/parallel-networks) for testing where the money has no real value. When you're ready to integrate with the production XRP Ledger, you'll need to connect to the Mainnet. You can do that in two ways:

- By [installing the core server](/docs/infrastructure/installation) (`xrpld`) and running a node yourself. The core server connects to the Mainnet by default, but you can [change the configuration to use Testnet or Devnet](/docs/infrastructure/configuration/connect-your-xrpld-to-the-xrp-test-net). [There are good reasons to run your own core server](/docs/concepts/networks-and-servers#reasons-to-run-your-own-server). If you run your own server, you can connect to it like so:

```python
from xrpl.clients import JsonRpcClient
JSON_RPC_URL = "http://localhost:5005/"
client = JsonRpcClient(JSON_RPC_URL)
```
See the example [core server config file](https://github.com/XRPLF/rippled/blob/release/3.4.x/cfg/xrpld-example.cfg#L1469) for more information about default values.
- By using one of the available [public servers](/docs/tutorials/public-servers):

```python
from xrpl.clients import JsonRpcClient
JSON_RPC_URL = "https://s2.ripple.com:51234/"
client = JsonRpcClient(JSON_RPC_URL)
```


### 3. Get account

To store value and execute transactions on the XRP Ledger, you need an account: a [set of keys](/docs/concepts/accounts/cryptographic-keys#key-components) and an [address](/docs/concepts/accounts/addresses) that's been [funded with enough XRP](/docs/concepts/accounts#creating-accounts) to meet the [account reserve](/docs/concepts/accounts/reserves). The address is the identifier of your account and you use the [private key](/docs/concepts/accounts/cryptographic-keys#private-key) to sign transactions that you submit to the XRP Ledger.

Tip
For testing and development purposes, you can use the [XRP Faucets](/resources/dev-tools/xrp-faucets) to generate keys and fund the account on the Testnet or Devnet. For production purposes, you should take care to store your keys and set up a [secure signing method](/docs/concepts/transactions/secure-signing). Another difference in production is that XRP has real worth, so you can't get it for free from a faucet.

To create and fund an account on the Testnet, `xrpl-py` provides the [`generate_faucet_wallet`](https://xrpl-py.readthedocs.io/en/latest/source/xrpl.wallet.html#xrpl.wallet.generate_faucet_wallet) method. This method returns a [`Wallet` instance](https://xrpl-py.readthedocs.io/en/latest/source/xrpl.wallet.html#xrpl.wallet.Wallet).

### 4. Query the XRP Ledger

You can query the XRP Ledger to get information about [a specific account](/docs/references/http-websocket-apis/public-api-methods/account-methods), [a specific transaction](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/tx), the state of a [current or a historical ledger](/docs/references/http-websocket-apis/public-api-methods/ledger-methods), and [the XRP Ledger's decentralized exchange](/docs/references/http-websocket-apis/public-api-methods/path-and-order-book-methods). You need to make these queries, among other reasons, to look up account info to follow best practices for [reliable transaction submission](/docs/concepts/transactions/reliable-transaction-submission).

Use the [account_info method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_info) to look up information about the account you got in the previous step. Use a request model like `AccountInfo` to validate the request format and catch errors sooner.

### 5. Run the Application

Finally, in your terminal, run the application like so:

```sh
python get-acct-info.py
```

You should see output similar to this example:

```sh
Creating a new wallet and funding it with Testnet XRP...
Attempting to fund address ravbHNootpSNQkxyEFCWevSkHsFGDHfyop
Faucet fund successful.
Wallet: ravbHNootpSNQkxyEFCWevSkHsFGDHfyop
Account Testnet Explorer URL: 
 https://testnet.xrpl.org/accounts/ravbHNootpSNQkxyEFCWevSkHsFGDHfyop

Getting account info...
Response Status:  ResponseStatus.SUCCESS
{
    "account_data": {
        "Account": "ravbHNootpSNQkxyEFCWevSkHsFGDHfyop",
        "Balance": "100000000",
        "Flags": 0,
        "LedgerEntryType": "AccountRoot",
        "OwnerCount": 0,
        "PreviousTxnID": "3DACF2438AD39F294C4EFF6132D5D88BCB65D2F2261C7650F40AC1F6A54C83EA",
        "PreviousTxnLgrSeq": 12039759,
        "Sequence": 12039759,
        "index": "148E6F4B8E4C14018D679A2526200C292BDBC5AB77611BC3AE0CB97CD2FB84E5"
    },
    "account_flags": {
        "allowTrustLineClawback": false,
        "defaultRipple": false,
        "depositAuth": false,
        "disableMasterKey": false,
        "disallowIncomingCheck": false,
        "disallowIncomingNFTokenOffer": false,
        "disallowIncomingPayChan": false,
        "disallowIncomingTrustline": false,
        "disallowIncomingXRP": false,
        "globalFreeze": false,
        "noFreeze": false,
        "passwordSpent": false,
        "requireAuthorization": false,
        "requireDestinationTag": false
    },
    "ledger_hash": "CA624D717C4FCDD03BAD8C193F374A77A14F7D2566354A4E9617A8DAD896DE71",
    "ledger_index": 12039759,
    "validated": true
}
```

The response fields that you want to inspect in most cases are:

- `account_data.Balance` — This is the account's balance of [XRP, in drops](/docs/references/protocol/data-types/basic-data-types#specifying-currency-amounts). You can use this to confirm that you have enough XRP to send (if you're making a payment) and to meet the [current transaction cost](/docs/concepts/transactions/transaction-cost#current-transaction-cost) for a given transaction.
- `validated` — Indicates whether the returned data is from a [validated ledger](/docs/concepts/ledgers/open-closed-validated-ledgers). When inspecting transactions, it's important to confirm that [the results are final](/docs/concepts/transactions/finality-of-results) before further processing the transaction. If `validated` is `true` then you know for sure the results won't change. For more information about best practices for transaction processing, see [Reliable Transaction Submission](/docs/concepts/transactions/reliable-transaction-submission).


For a detailed description of every response field, see [account_info](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_info#response-format).

## See Also

- **Concepts:**
  - [XRP Ledger Overview](/about/)
  - [Client Libraries](/docs/references/client-libraries)
- **Tutorials:**
  - [Send XRP](/docs/tutorials/payments/send-xrp)
  - [Issue a Fungible Token](/docs/tutorials/tokens/fungible-tokens/issue-a-fungible-token)
  - [Set up Secure Signing](/docs/concepts/transactions/secure-signing)
- **References:**
  - [`xrpl-py` Reference](https://xrpl-py.readthedocs.io/en/latest/)
  - [Public API Methods](/docs/references/http-websocket-apis/public-api-methods)
  - [API Conventions](/docs/references/http-websocket-apis/api-conventions)
    - [base58 Encodings](/docs/references/protocol/data-types/base58-encodings)
  - [Transaction Formats](/docs/references/protocol/transactions)