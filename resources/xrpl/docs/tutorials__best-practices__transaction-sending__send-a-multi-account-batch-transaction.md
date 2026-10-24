# Send a Multi-Account Batch Transaction

This tutorial shows you how to create a [Batch transaction](/docs/references/protocol/transactions/types/batch) containing transactions from multiple accounts, where each account must sign the `Batch` transaction. Any account, even one not involved in the inner transactions, can submit the batch.

## Goals

By the end of this tutorial, you will be able to:

- Create a `Batch` transaction with multiple inner transactions, signed by multiple accounts, and submitted by a third party account.
- Configure the `Batch` transaction to ensure atomicity, so that either all inner transactions succeed or they all fail.


## Prerequisites

To complete this tutorial, you should:

- Have a basic understanding of the XRP Ledger.
- Have an XRP Ledger client library set up in your development environment. This page provides examples for the following:
  - **JavaScript** with the [xrpl.js library](https://github.com/XRPLF/xrpl.js). See [Get Started Using JavaScript](/docs/tutorials/get-started/get-started-javascript) for setup steps.


## Source Code

You can find the complete source code for this tutorial's examples in the [code samples section of this website's repository](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/batch/).

## Steps

The example in this tutorial demonstrates a scenario where Bob and Charlie both owe Alice 50 XRP each, and a third-party (such as a payment processor) submits the `Batch` transaction atomically to ensure Alice is paid by both parties.

### 1. Install dependencies

Javascript
From the code sample folder, use npm to install dependencies:

```bash
npm install xrpl
```

### 2. Set up client and accounts

To get started, import the client library and instantiate a client to connect to the XRPL. Then, create the accounts for Alice, Bob, Charlie, and the third-party.

Javascript
```js
import xrpl from "xrpl"

const client = new xrpl.Client("wss://s.devnet.rippletest.net:51233/")
await client.connect()

// Create and fund wallets
console.log("=== Funding new wallets from faucet... ===");
const [
  { wallet: alice },
  { wallet: bob },
  { wallet: charlie },
  { wallet: thirdPartyWallet },
] = await Promise.all([
  client.fundWallet(),
  client.fundWallet(),
  client.fundWallet(),
  client.fundWallet(),
]);

console.log(`Alice: ${alice.address}, Balance: ${await client.getXrpBalance(alice.address)} XRP`)
console.log(`Bob: ${bob.address}, Balance: ${await client.getXrpBalance(bob.address)} XRP`)
console.log(`Charlie: ${charlie.address}, Balance: ${await client.getXrpBalance(charlie.address)} XRP`)
console.log(`Third-party wallet: ${thirdPartyWallet.address}, Balance: ${await client.getXrpBalance(thirdPartyWallet.address)} XRP`)
```

### 3. Prepare inner transactions

Next, prepare the inner transactions that will be included in the batch.

Javascript
```js
// Create inner transactions  --------------------------------------------
// REQUIRED: Inner transactions MUST have the tfInnerBatchTxn flag (0x40000000).
// This marks them as part of a batch (requires Fee: 0 and empty SigningPubKey).

// Transaction 1: Charlie pays Alice
const charliePayment = {
  TransactionType: "Payment",
  Account: charlie.address,
  Destination: alice.address,
  Amount: xrpl.xrpToDrops(50),
  Flags: xrpl.GlobalFlags.tfInnerBatchTxn // THIS IS REQUIRED
}

// Transaction 2: Bob pays Alice
const bobPayment = {
  TransactionType: "Payment",
  Account: bob.address,
  Destination: alice.address,
  Amount: xrpl.xrpToDrops(50),
  Flags: xrpl.GlobalFlags.tfInnerBatchTxn // THIS IS REQUIRED
}
```

The first transaction sends a payment of 50 XRP from Charlie to Alice, and the second sends a payment of 50 XRP from Bob to Alice. Both transactions must include the `tfInnerBatchTxn` (0x40000000) flag to indicate that they are inner transactions of a batch.

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
| BatchSigners | The list of signatures required for the `Batch` transaction. This is required because there are multiple accounts' transactions included in the batch. |


Javascript
```js
// Send Batch transaction --------------------------------------------
console.log("\n=== Creating Batch transaction... ===")
const batchTx = {
  TransactionType: "Batch",
  Account: thirdPartyWallet.address,
  Flags: xrpl.BatchFlags.tfAllOrNothing, // tfAllOrNothing: All inner transactions must succeed
  // Must include a minimum of 2 transactions and a maximum of 8 transactions.
  RawTransactions: [
    { RawTransaction: charliePayment },
    { RawTransaction: bobPayment },
  ]
}
console.log(JSON.stringify(batchTx, null, 2))

// Validate the transaction structure
xrpl.validate(batchTx)

// Set the expected number of signers, which is 2 (Bob and Charlie) in this case, for this transaction. 
// "autofill" will automatically add Fee: "0" and SigningPubKey: "" to inner transactions.
const autofilledBatchTx = await client.autofill(batchTx, 2)
```

Because we used `autofill`, the client library automatically fills in any missing fields, like `Fee` and `SigningPubKey`. Additionally, we specify the expected number of signers (2 in this case).

### 5. Gather batch signatures

To add the `BatchSigners` field, you need to collect signatures from each account that's sending a transaction within the batch. In this case we need two signatures, one from Charlie and one from Bob. Each sender must sign the `Batch` transaction to authorize their payment.

Javascript
The **xrpl.js** library provides a helper function, `signMultiBatch()`, to sign the `Batch` transaction for each account.

Then, to combine the signatures into a single signed `Batch` transaction, use the `combineBatchSigners()` utility function.

```js
// Gather batch signatures --------------------------------
// Each signer needs their own tx copy because signMultiBatch modifies the object.
// Charlie signs the Batch transaction
const charlieBatch = { ...autofilledBatchTx }
xrpl.signMultiBatch(charlie, charlieBatch)

// Bob signs the Batch transaction
const bobBatch = { ...autofilledBatchTx }
xrpl.signMultiBatch(bob, bobBatch)

// Combine inner transaction signatures.
// This returns a signed transaction blob (hex string) ready for submission.
const combinedSignedTx = xrpl.combineBatchSigners([charlieBatch, bobBatch])
```

### 6. Submit Batch transaction

With all the required signatures gathered, the third-party wallet can now submit the `Batch` transaction.

Javascript
```js
// Submit the signed blob with the third-party's wallet
console.log("\n=== Submitting Batch transaction... ===")
const submitResponse = await client.submitAndWait(combinedSignedTx, 
  { wallet: thirdPartyWallet }
)
```

### 7. Check Batch transaction result

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
// View the transaction on the XRPL Explorer 
console.log(`\nBatch transaction URL:\nhttps://devnet.xrpl.org/transactions/${submitResponse.result.hash}`)
```

The code checks for a `tesSUCCESS` result and displays the response details.

Warning
A `tesSUCCESS` result indicates that the `Batch` transaction was processed successfully, but does not guarantee the inner transactions succeeded. For example, see the [following transaction on the XRPL Explorer](https://devnet.xrpl.org/transactions/20CFCE5CF75E93E6D1E9C1E42F8E8C8C4CB1786A65BE23D2EA77EAAB65A455C5/simple).

Because the `Batch` transaction is configured with a `tfAllOrNothing` flag, if any inner transaction fails, **all** inner transactions wil fail, and only the `Batch` transaction fee is deducted from the **third-party wallet**.

### 8. Verify inner transactions

Since there is no way to check the status of inner transactions in the `Batch` transaction result, you need to calculate the inner transaction hashes and look them up on the ledger:

Javascript
```js
// Calculate and verify inner transaction hashes --------------------------------------------
console.log("\n=== Verifying inner transactions ===")
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

### 9. Verify balances

You can also verify that the inner transactions executed successfully by checking the account balances to confirm the expected changes.

Javascript
```js
// Verify balances after transaction
console.log("\n=== Final balances ===")
console.log(`Alice: ${alice.address}, Balance: ${await client.getXrpBalance(alice.address)} XRP`)
console.log(`Bob: ${bob.address}, Balance: ${await client.getXrpBalance(bob.address)} XRP`)
console.log(`Charlie: ${charlie.address}, Balance: ${await client.getXrpBalance(charlie.address)} XRP`)
console.log(`Third-party wallet: ${thirdPartyWallet.address}, Balance: ${await client.getXrpBalance(thirdPartyWallet.address)} XRP`)

await client.disconnect()
```

## See Also

- **Concepts**:
  - [Batch Transactions](/docs/concepts/transactions/batch-transactions)
- **Tutorials**:
  - [Send a Single Account Batch Transaction](/docs/tutorials/best-practices/transaction-sending/send-a-single-account-batch-transaction)
- **References**:
  - [Batch Transaction](/docs/references/protocol/transactions/types/batch)