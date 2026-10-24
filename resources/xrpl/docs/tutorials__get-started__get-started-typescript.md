# Get Started Using TypeScript Library

This tutorial guides you through the basics of building an XRP Ledger-connected application in TypeScript using the [`xrpl.js`](https://github.com/XRPLF/xrpl.js/) client library in either Node.js or web browsers. Because `xrpl.js` ships its own type definitions, you get compile-time checking of your requests and transactions with no extra setup.

## Goals

In this tutorial, you'll learn:

- The basic building blocks of XRP Ledger-based applications.
- How to set up a TypeScript project that compiles and runs against the XRP Ledger.
- How to connect to the XRP Ledger using `xrpl.js`.
- How to get an account on the [Testnet](/resources/dev-tools/xrp-faucets) using `xrpl.js`.
- How to use the `xrpl.js` library to look up information about an account on the XRP Ledger.
- How to use the library's built-in types to build and validate a transaction from your own input values.
- How to put these steps together to create a TypeScript app or web-app.


## Prerequisites

To complete this tutorial, you should meet the following guidelines:

- Have some familiarity with writing code in TypeScript.
- Have installed Node.js **version 20** or later in your development environment.
- If you want to build a web application, any modern web browser with JavaScript support should work fine.


You don't need to install the TypeScript compiler globally; the steps below add it as a project dependency.

## Source Code

Click **Download** on the top right of the code preview panel to download the source code.

## Steps

Follow the steps to create a simple application with `xrpl.js` and TypeScript.

### 1. Install Dependencies

For a web app, you load `xrpl.js` at runtime and use the TypeScript compiler as a build tool. Create an `index.html` file that loads the library through an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) and runs your compiled script:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>xrpl.js TypeScript Base Example</title>
    <!-- @chunk {"steps": ["import-web-tag"]} -->
    <!-- The import map resolves the bare 'xrpl' specifier used in browser.ts
         to a browser-ready ES module build served from a CDN. -->
    <script type="importmap">
      { "imports": { "xrpl": "https://esm.sh/xrpl@4" } }
    </script>
    <!-- Load the compiled output of browser.ts (created by `npx tsc`). -->
    <script type="module" src="./dist/browser.js"></script>
    <!-- @chunk-end -->
  </head>
  <body>
    <h1>xrpl.js TypeScript Get Started</h1>
    <div id="output"></div>
  </body>
</html>
```

To get the type definitions and the compiler, install `xrpl` and `typescript` with [NPM](https://www.npmjs.com/):

```sh
npm install xrpl
npm install --save-dev typescript
```

### 1. Install Dependencies

Start a new project by creating an empty folder, then move into that folder and use [NPM](https://www.npmjs.com/) to install the latest version of `xrpl.js` along with the TypeScript compiler and the Node.js type definitions:

```sh
npm install xrpl
npm install --save-dev typescript @types/node
```

This updates your `package.json` file, or creates a new one if it didn't already exist.

Your `package.json` file should look something like this:

```json
{
  "name": "get-started-typescript",
  "description": "Example code for the Get Started Using TypeScript tutorial.",
  "dependencies": {
    "xrpl": "^4.4.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^22.0.0"
  },
  "type": "module"
}
```

### 2. Configure TypeScript

Add a `tsconfig.json` file to tell the compiler how to build your project. The settings below target modern JavaScript, enable `strict` type checking, and write the compiled output to a `dist` folder.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2020", "DOM"],
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["*.ts"]
}
```

### 3. Connect to the XRP Ledger

#### Connect to the XRP Ledger Testnet

To make queries and submit transactions, you need to connect to the XRP Ledger. To do this with `xrpl.js`, you create an instance of the [`Client`](https://js.xrpl.org/classes/Client.html) class and use the [`connect()`](https://js.xrpl.org/classes/Client.html#connect) method. Because you import the class directly, TypeScript infers the correct type for your `client`.

Many network functions in `xrpl.js` use [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to return values asynchronously. The code samples here use the [`async/await` pattern](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await) to wait for the actual result of the Promises.

The sample code shows you how to connect to the Testnet, which is one of the available [parallel networks](/docs/concepts/networks-and-servers/parallel-networks).

#### Connect to the XRP Ledger Mainnet

When you're ready to move to production, you'll need to connect to the XRP Ledger Mainnet. You can do that in two ways:

- By [installing the core server](/docs/infrastructure/installation) (`xrpld`) and running a node yourself. The core server connects to the Mainnet by default, but you can [change the configuration to use Testnet or Devnet](/docs/infrastructure/configuration/connect-your-xrpld-to-the-xrp-test-net). [There are good reasons to run your own core server](/docs/concepts/networks-and-servers#reasons-to-run-your-own-server). If you run your own server, you can connect to it like so:

```typescript
const MY_SERVER = 'ws://localhost:6006/'
const client = new Client(MY_SERVER)
await client.connect()
```
See the example [core server config file](https://github.com/XRPLF/rippled/blob/release/3.4.x/cfg/xrpld-example.cfg#L1469) for more information about default values.
- By using one of the available [public servers](/docs/tutorials/public-servers):

```typescript
const PUBLIC_SERVER = 'wss://xrplcluster.com/'
const client = new Client(PUBLIC_SERVER)
await client.connect()
```


### 4. Get Account

#### Create and Fund a Wallet

The `xrpl.js` library has a [`Wallet`](https://js.xrpl.org/classes/Wallet.html) class for handling the keys and address of an XRP Ledger account. On Testnet, you can fund a new account as shown in the example. Annotating the result with the `Wallet` type lets the compiler check every property you access.

#### (Optional) Generate a Wallet Only

If you want to generate a wallet without funding it, you can create a new [`Wallet`](https://js.xrpl.org/classes/Wallet.html) instance. Keep in mind that you need to send XRP to the wallet for it to be a valid account on the ledger.

#### (Optional) Use Your Own Wallet Seed

To use an existing wallet seed encoded in [base58](/docs/references/protocol/data-types/base58-encodings), you can create a [`Wallet`](https://js.xrpl.org/classes/Wallet.html) instance from it.

### 5. Query the XRP Ledger

Use the Client's [`request()`](https://js.xrpl.org/classes/Client.html#request) method to access the XRP Ledger's [WebSocket API](/docs/references/http-websocket-apis/api-conventions/request-formatting). Typing the request as an `AccountInfoRequest` verifies the command name and its fields, and the library infers the matching `AccountInfoResponse` for the result so you get autocomplete on the response too.

### 6. Build and Validate a Transaction

One of the biggest advantages of TypeScript is turning your own input into a well-formed transaction. Typing an object as a [`Payment`](/docs/references/protocol/transactions/types/payment) makes the compiler require every field and reject values of the wrong type *before* you run the code. The [`xrpToDrops()`](https://js.xrpl.org/functions/xrpToDrops.html) helper converts an XRP amount into the drops string the ledger expects, and [`validate()`](https://js.xrpl.org/functions/validate.html) runs the same structural checks the server does at runtime.

This example then signs and submits the transaction in one call with [`submitAndWait()`](https://js.xrpl.org/classes/Client.html#submitAndWait), which waits for the network to validate it and returns the result. Before submitting real transactions, read [Set up Secure Signing](/docs/concepts/transactions/secure-signing).

### 7. Listen for Events

You can set up handlers for various types of events in `xrpl.js`, such as whenever the XRP Ledger's [consensus process](/docs/concepts/consensus-protocol) produces a new [ledger version](/docs/concepts/ledgers). To do that, first call the [subscribe method](/docs/references/http-websocket-apis/public-api-methods/subscription-methods/subscribe) to get the type of events you want, then attach an event handler using the [`on(eventType, callback)`](https://js.xrpl.org/classes/Client.html#on) method of the client. The callback's `ledger` argument is typed for you, so fields like `ledger_index` and `txn_count` are checked as you use them.

### 8. Disconnect

Call the [`disconnect()`](https://js.xrpl.org/classes/Client.html#disconnect) function so Node.js can end the process. The example code waits 10 seconds before disconnecting to allow time for the ledger event listener to receive and display events.

### 8. Disconnect

Call the [`disconnect()`](https://js.xrpl.org/classes/Client.html#disconnect) function to disconnect from the ledger when done. The example code waits 10 seconds before disconnecting to allow time for the ledger event listener to receive and display events.

### 9. Compile and Run the Application

Finally, in your terminal, compile the TypeScript to JavaScript and run the result:

```sh
npx tsc
node dist/get-acct-info.js
```

TypeScript is compiled, not run directly. Whenever you change a `.ts` file, re-run `npx tsc` to recompile before running the app again.

You should see output similar to the following:

```sh
Connected to Testnet

Creating a new wallet and funding it with Testnet XRP...
Wallet: rKTfqsMZTPWNYWrzFjUwDNLa8XTeA45wvB
Balance: 100
Account Testnet Explorer URL:
  https://testnet.xrpl.org/accounts/rKTfqsMZTPWNYWrzFjUwDNLa8XTeA45wvB

Getting account info...
{
  "api_version": 2,
  "id": 4,
  "result": {
    "account_data": {
      "Account": "rKTfqsMZTPWNYWrzFjUwDNLa8XTeA45wvB",
      "Balance": "100000000",
      "Flags": 0,
      "LedgerEntryType": "AccountRoot",
      "OwnerCount": 0,
      "PreviousTxnID": "C791975AB1FA811DD7C2A958F71629C3EB830545B25C11F488249D0AEADAA04C",
      "PreviousTxnLgrSeq": 18910118,
      "Sequence": 18910118,
      "index": "0553BF36D48179C15297E1087002B6D33E076D71CAFEA7F0BB1362B9502C851D"
    },
    "ledger_hash": "CC057AE6CF43485107EA0E4184DE48D73DC4C8A742577964462AB49EDA8EC84E",
    "ledger_index": 18910118,
    "validated": true
  },
  "type": "response"
}

Built and validated a Payment transaction:
{
  "TransactionType": "Payment",
  "Account": "rKTfqsMZTPWNYWrzFjUwDNLa8XTeA45wvB",
  "Amount": "22000000",
  "Destination": "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"
}

Submitted the transaction:
{
  "hash": "84AF8035CD41B0E411968FC9BDD52254C662197DB2BE669640F6DF25D79A7E0A",
  "ledger_index": 19257811,
  "meta": {
    "TransactionResult": "tesSUCCESS",
    "delivered_amount": "22000000"
  },
  "validated": true
}

Listening for ledger close events...
Ledger #18910119 validated with 0 transactions!
Ledger #18910120 validated with 1 transactions!
Ledger #18910121 validated with 1 transactions!

Disconnected
```

### 9. Compile and Run the Application

Compile the TypeScript to JavaScript, then open the `index.html` file in a web browser:

```sh
npx tsc
```

TypeScript is compiled, not run directly. Whenever you change a `.ts` file, re-run `npx tsc` to recompile before reloading the page.

You should see output similar to the following:

```text
Connected to Testnet
Creating a new wallet and funding it with Testnet XRP...
Wallet: rf7CWJdNssSzQk2GtypYLVhyvGe8oHS3S
Balance: 100
View account on XRPL Testnet Explorer: rf7CWJdNssSzQk2GtypYLVhyvGe8oHS3S

Getting account info...
{
  "api_version": 2,
  "id": 5,
  "result": {
    "account_data": {
      "Account": "rf7CWJdNssSzQk2GtypYLVhyvGe8oHS3S",
      "Balance": "100000000",
      "Flags": 0,
      "LedgerEntryType": "AccountRoot",
      "OwnerCount": 0,
      "PreviousTxnID": "96E4B44F93EC0399B7ADD75489630C6A8DCFC922F20F6810D25490CC0D3AA12E",
      "PreviousTxnLgrSeq": 9949610,
      "Sequence": 9949610,
      "index": "B5D2865DD4BF8EEDFEE2FD95DE37FC28D624548E9BBC42F9FBF61B618E98FAC8"
    },
    "ledger_hash": "7692673B8091899C3EEE6807F66B65851D3563F483A49A5F03A83608658473D6",
    "ledger_index": 9949610,
    "validated": true
  },
  "type": "response"
}

Built and validated a Payment transaction:
{
  "TransactionType": "Payment",
  "Account": "rf7CWJdNssSzQk2GtypYLVhyvGe8oHS3S",
  "Amount": "22000000",
  "Destination": "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"
}

Submitted the transaction:
{
  "hash": "84AF8035CD41B0E411968FC9BDD52254C662197DB2BE669640F6DF25D79A7E0A",
  "ledger_index": 19257811,
  "meta": {
    "TransactionResult": "tesSUCCESS",
    "delivered_amount": "22000000"
  },
  "validated": true
}

Listening for ledger close events...
Ledger #9949611 validated with 0 transactions
Ledger #9949612 validated with 1 transactions
Ledger #9949613 validated with 0 transactions

Disconnected
```

## See Also

- **Concepts:**
  - [XRP Ledger Overview](/about/)
  - [Client Libraries](/docs/references/client-libraries)
- **Tutorials:**
  - [Get Started Using JavaScript](/docs/tutorials/get-started/get-started-javascript)
  - [Send XRP](/docs/tutorials/payments/send-xrp)
  - [Issue a Fungible Token](/docs/tutorials/tokens/fungible-tokens/issue-a-fungible-token)
  - [Set up Secure Signing](/docs/concepts/transactions/secure-signing)
- **References:**
  - [`xrpl.js` Reference](https://js.xrpl.org/)
  - [Public API Methods](/docs/references/http-websocket-apis/public-api-methods)
  - [API Conventions](/docs/references/http-websocket-apis/api-conventions)
    - [base58 Encodings](/docs/references/protocol/data-types/base58-encodings)
  - [Transaction Formats](/docs/references/protocol/transactions)