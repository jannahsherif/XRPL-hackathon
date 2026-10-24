# Send a Single Account Batch Transaction

A [Batch transaction](/docs/references/protocol/transactions/types/batch) allows you to group multiple transactions together and execute them as a single atomic operation.

This tutorial shows you how to create a `Batch` transaction where a single account submits multiple transactions that either all succeed together or all fail together.

## Goals

By the end of this tutorial, you will be able to:

- Create a `Batch` transaction with multiple inner transactions, signed and submitted by a single account.
- Configure the `Batch` transaction to ensure atomicity, so that either all inner transactions succeed or they all fail.


## Prerequisites

To complete this tutorial, you should:

- Have a basic understanding of the XRP Ledger.
- Have an XRP Ledger client library set up in your development environment. This page provides examples for the following:
  - **JavaScript** with the [xrpl.js library](https://github.com/XRPLF/xrpl.js). See [Get Started Using JavaScript](/docs/tutorials/get-started/get-started-javascript) for setup steps.


## Source Code

You can find the complete source code for this tutorial's examples in the [code samples section of this website's repository](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/batch/).

## Steps

The example in this tutorial demonstrates a scenario where an account sends multiple payments that must be processed atomically in one `Batch` transaction.

### 1. Install dependencies

Javascript
From the code sample folder, use npm to install dependencies:

```bash
npm install xrpl
```

### 2. Set up client and accounts

To get started, import the client library and instantiate a client to connect to the XRPL. For this tutorial you need a funded account for the `Batch` transaction **sender**, and two other accounts to **receive** the payments.

Javascript
```js
import xrpl from "xrpl"

const client = new xrpl.Client("wss://s.devnet.rippletest.net:51233/")
await client.connect()

// Create and fund wallets
console.log("=== Funding new wallets from faucet... ===");
const [{ wallet: sender }, { wallet: wallet1 }, { wallet: wallet2 }] =
  await Promise.all([
    client.fundWallet(),
    client.fundWallet(),
    client.fundWallet(),
  ]);

console.log(`Sender: ${sender.address}, Balance: ${await client.getXrpBalance(sender.address)} XRP`)
console.log(`Wallet1: ${wallet1.address}, Balance: ${await client.getXrpBalance(wallet1.address)} XRP`)
console.log(`Wallet2: ${wallet2.address}, Balance: ${await client.getXrpBalance(wallet2.address)} XRP`)
```

### 3. Prepare inner transactions

Next, prepare the inner transactions that will be included in the batch.

Javascript
```js
// Create inner transactions  --------------------------------------------
// REQUIRED: Inner transactions MUST have the tfInnerBatchTxn flag (0x40000000).
// This marks them as part of a batch (requires Fee: 0 and empty SigningPubKey).

// Transaction 1
const payment1 = {
  TransactionType: "Payment",
  Account: sender.address,
  Destination: wallet1.address,
  Amount: xrpl.xrpToDrops(2),
  Flags: xrpl.GlobalFlags.tfInnerBatchTxn // THIS IS REQUIRED
}

// Transaction 2
const payment2 = {
  TransactionType: "Payment",
  Account: sender.address,
  Destination: wallet2.address,
  Amount: xrpl.xrpToDrops(5),
  Flags: xrpl.GlobalFlags.tfInnerBatchTxn // THIS IS REQUIRED
}
```

The first transaction sends a payment of 2 XRP from the sender to `wallet1`, and the second transaction sends 5 XRP from the sender to `wallet2`. Both transactions must include the `tfInnerBatchTxn` (0x40000000) flag to indicate that they are inner transactions of a batch.

Inner transactions must have a Fee of **0** and an empty string for the `SigningPubKey`. The outer `Batch` transaction handles the overall fee and signing for all inner transactions.

Note
The `Fee` and `SigningPubKey` fields are omitted as the client library's *autofill* functionality automatically populates these when submitting the `Batch` transaction.

You typically don't need to set these manually, but if you do, ensure `Fee` is set to 0 and `SigningPubKey` is an empty string.

### 4. Prepare Batch transaction

Create the `Batch` transaction and provide the inner transactions. The key fields to note are:

| Field | Value |
|  --- | --- |
| TransactionType | The type of transaction, in this case `Batch`. |
| Account | The wallet address of the account that is sending the `Batch` transaction. |
| Flags | The flags for the `Batch` transaction. For this example the transaction is configured with the `tfAllOrNothing` (0x00010000) flag to ensure that either all inner transactions succeed or they all fail atomically. See [Batch Flags](/docs/references/protocol/transactions/types/batch#batch-flags) for other options. |
| RawTransactions | Contains the list of inner transactions to be applied. Must include a minimum of **2** transactions and a maximum of **8** transactions. These transactions can come from one account or multiple accounts. |


Javascript
```js
// Send Batch transaction --------------------------------------------
console.log("\n=== Creating Batch transaction... ===")
const batchTx = {
  TransactionType: "Batch",
  Account: sender.address,
  Flags: xrpl.BatchFlags.tfAllOrNothing, // tfAllOrNothing: All inner transactions must succeed
  // Must include a minimum of 2 transactions and a maximum of 8 transactions.
  RawTransactions: [
    { RawTransaction: payment1 }, 
    { RawTransaction: payment2 }
  ]
}
console.log(JSON.stringify(batchTx, null, 2))

// Validate the transaction structure before submitting
xrpl.validate(batchTx)
```

### 5. Submit Batch transaction

Now the sender can submit the `Batch` transaction:

Javascript
```js
// Submit and wait for validation
console.log("\n=== Submitting Batch transaction... ===")
const submitResponse = await client.submitAndWait(batchTx, {
  wallet: sender,
  // "autofill" will automatically add Fee: "0" and SigningPubKey: "" to inner transactions.
  autofill: true
})
```

Because `autofill` is set to `true`, the client library automatically fills in any missing fields, like the `Fee` and `SigningPubKey`, before submitting the batch.

### 6. Check Batch transaction result

To check the result of the `Batch` transaction submission:

Javascript
```js
// Check Batch transaction result --------------------------------
if (submitResponse.result.meta.TransactionResult !== "tesSUCCESS") {
  const resultCode = submitResponse.result.meta.TransactionResult
  console.warn(`\nTransaction failed with result code ${resultCode}`)
  await client.disconnect()
  process.exit(1)
}
console.log("\nBatch transaction submitted successfully!")
console.log("Result:\n", JSON.stringify(submitResponse.result, null, 2))
// View the batch transaction on the XRPL Explorer 
console.log(`\nBatch transaction URL:\nhttps://devnet.xrpl.org/transactions/${submitResponse.result.hash}`)
```

The code checks for a `tesSUCCESS` result and displays the response details.

Warning
A `tesSUCCESS` result indicates that the `Batch` transaction was processed successfully, but does not guarantee the inner transactions succeeded.

For example, see the [following transaction on the XRPL Explorer](https://devnet.xrpl.org/transactions/20CFCE5CF75E93E6D1E9C1E42F8E8C8C4CB1786A65BE23D2EA77EAAB65A455C5/simple).

Because the `Batch` transaction is configured with a `tfAllOrNothing` flag, if any inner transaction fails, **all** inner transactions wil fail, and only the `Batch` transaction fee is deducted from the **third-party wallet**.

### 7. Verify inner transactions

Since there is no way to check the status of inner transactions in the `Batch` transaction result, you need to calculate the inner transaction hashes and look them up on the ledger:

Javascript
```js
// Calculate and verify inner transaction hashes --------------------------------------------
console.log("\n=== Verifying inner transactions... ===")
const rawTransactions = submitResponse.result.tx_json.RawTransactions
let hasFailure = false

for (let i = 0; i < rawTransactions.length; i++) {
  const innerTx = rawTransactions[i].RawTransaction
  const hash = xrpl.hashes.hashSignedTx(innerTx)
  console.log(`\nTransaction ${i + 1} hash: ${hash}`)

  try {
    const tx = await client.request({ command: 'tx', transaction: hash })
    const status = tx.result.meta?.TransactionResult
    console.log(` - Status: ${status} (Ledger ${tx.result.ledger_index})`)
    console.log(` - Transaction URL: https://devnet.xrpl.org/transactions/${hash}`)
  } catch (error) {
    hasFailure = true
    console.log(` - Transaction not found: ${error}`)
  }
}
if (hasFailure) {
  console.error("\n--- Error: One or more inner transactions failed. ---")
  await client.disconnect()
  process.exit(1)
}
```

The code extracts the actual inner transactions from the batch response, calculates the hash of each inner transaction and looks up each transaction on the ledger using its hash.

### 8. Verify balances

You can also verify that the inner transactions executed successfully by checking the account balances to confirm the expected changes.

Javascript
```js
// Verify balances after transaction
console.log("\n=== Final balances ===")
console.log(`Sender: ${sender.address}, Balance: ${await client.getXrpBalance(sender.address)} XRP`)
console.log(`Wallet1: ${wallet1.address}, Balance: ${await client.getXrpBalance(wallet1.address)} XRP`)
console.log(`Wallet2: ${wallet2.address}, Balance: ${await client.getXrpBalance(wallet2.address)} XRP`)

await client.disconnect()
```

## See Also

- **Concepts**:
  - [Batch Transactions](/docs/concepts/transactions/batch-transactions)
- **Tutorials**:
  - [Send a Multi-Account Batch Transaction](/docs/tutorials/best-practices/transaction-sending/send-a-multi-account-batch-transaction)
- **References**:
  - [Batch Transaction](/docs/references/protocol/transactions/types/batch)