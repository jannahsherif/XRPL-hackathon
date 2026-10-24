# Sponsor a Transaction with a Pre-funded Pool

This tutorial shows how to use the pre-funded [sponsorship](/docs/concepts/accounts/sponsored-fees-and-reserves#how-sponsorship-works) flow, where a sponsor allocates XRP upfront that a sponsee draws on for fees and reserves. In this example, a sponsor onboards a new user who holds no XRP, then sets up a pool the user can spend without further approval.

Use the default pre-funded flow when sponsees must be able to transact without waiting on the sponsor. If the sponsor needs to review each transaction without setting up a pool, use [co-signing](/docs/tutorials/best-practices/account-management/sponsor-a-transaction-by-co-signing) instead.

_Requires the [Sponsor amendment](/resources/known-amendments#sponsor). (Open for Voting: 17.14%)_

## Goals

By the end of this tutorial, you should be able to:

- Create a pre-funded sponsorship pool for a sponsee.
- Submit a sponsored transaction that draws on the pool.
- Confirm what the pool spent on fees and reserves.


## Prerequisites

To complete this tutorial, you should:

- Have a basic understanding of the XRP Ledger and [Sponsored Fees and Reserves](/docs/concepts/accounts/sponsored-fees-and-reserves).
- Have an XRP Ledger client library set up in your development environment. This page provides examples for the following:
  - **JavaScript** with the [xrpl.js library](https://github.com/XRPLF/xrpl.js). See [Get Started Using JavaScript](/docs/tutorials/get-started/get-started-javascript) for setup steps.
  - **Python** with the [xrpl-py library](https://github.com/XRPLF/xrpl-py). See [Get Started Using Python](/docs/tutorials/get-started/get-started-python) for setup steps.


## Source Code

You can find the complete source code for this tutorial's example in the [code samples section of this website's repository](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/sponsored-fees-and-reserves).

## Steps

### 1. Install dependencies

JavaScript
From the code sample folder, use `npm` to install dependencies:

```bash
npm install
```

Python
From the code sample folder, set up a virtual environment and use `pip` to install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Set up the client

Import the necessary libraries and instantiate a client to connect to the XRPL. This example imports:

JavaScript
- `xrpl`: Used for XRPL client connection, transaction submission, and wallet handling.


```js
import {
  Client,
  PaymentFlags,
  SponsorFlags,
  Wallet,
  addPreFundedSponsor,
  validate
} from 'xrpl'

// Connect to the network ----------------------
const client = new Client('wss://s.devnet.rippletest.net:51233')
await client.connect()
```

Python
- `xrpl`: Used for XRPL client connection, transaction submission, and wallet handling.
- `json`: Used for formatting JSON data.
- `sys`: Used to exit on transaction failures.


```py
import json
import sys

from xrpl.clients import JsonRpcClient
from xrpl.models import (
    DepositPreauth,
    Payment,
    PaymentFlag,
    SponsorFlag,
    SponsorshipSet,
)
from xrpl.transaction import submit_and_wait
from xrpl.wallet import Wallet, generate_faucet_wallet

# Set up client ----------------------
client = JsonRpcClient("https://s.devnet.rippletest.net:51234")
```

### 3. Create the wallets

Fund the sponsor and generate a key pair for the sponsee. Only the sponsor needs XRP, because it covers every cost in this example.

JavaScript
```js
// Create the sponsor and sponsee wallets ----------------------
console.log(`\n=== Creating the sponsor and sponsee wallets... ===`)
const { wallet: sponsor } = await client.fundWallet()
const sponsee = Wallet.generate()

console.log(`Sponsor address: ${sponsor.address}`)
console.log(`Sponsee address: ${sponsee.address}`)
```

Python
```py
# Create the sponsor and sponsee wallets ----------------------
print("\n=== Creating the sponsor and sponsee wallets... ===")
sponsor = generate_faucet_wallet(client)
sponsee = Wallet.create()

print(f"Sponsor address: {sponsor.address}")
print(f"Sponsee address: {sponsee.address}")
```

### 4. Create the sponsee's account

Create a [Payment transaction](/docs/references/protocol/transactions/types/payment) with the `tfSponsorCreatedAccount` flag enabled to create the sponsee's account. The flag makes the sponsor responsible for the new account's reserve, so the payment only needs to deliver the smallest possible XRP amount.

JavaScript
```js
// Prepare Payment transaction to create the sponsee's account ----------------------
console.log(`\n=== Preparing Payment transaction to create the sponsee's account... ===`)
const createAccountTx = {
  TransactionType: 'Payment',
  Account: sponsor.address,
  Destination: sponsee.address,
  Amount: '1',
  Flags: PaymentFlags.tfSponsorCreatedAccount
}
validate(createAccountTx)
console.log(JSON.stringify(createAccountTx, null, 2))

// Submit the Payment transaction ----------------------
console.log(`\n=== Submitting Payment transaction... ===`)
const createAccountResponse = await client.submitAndWait(createAccountTx, {
  wallet: sponsor,
  autofill: true
})

if (createAccountResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  const resultCode = createAccountResponse.result.meta.TransactionResult
  console.error(`Error: Unable to create the sponsee's account:`, resultCode)
  await client.disconnect()
  process.exit(1)
}
console.log('Sponsee account created successfully!')
console.log(`Transaction URL: https://devnet.xrpl.org/transactions/${createAccountResponse.result.hash}`)
```

Python
```py
# Prepare Payment transaction to create the sponsee's account ----------------------
print("\n=== Preparing Payment transaction to create the sponsee's account... ===")
create_account_tx = Payment(
    account=sponsor.address,
    destination=sponsee.address,
    amount="1",
    flags=PaymentFlag.TF_SPONSOR_CREATED_ACCOUNT,
)

print(json.dumps(create_account_tx.to_xrpl(), indent=2))

# Submit the Payment transaction ----------------------
print("\n=== Submitting Payment transaction... ===")
create_account_response = submit_and_wait(create_account_tx, client, sponsor)

if create_account_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    result_code = create_account_response.result["meta"]["TransactionResult"]
    print(f"Error: Unable to create the sponsee's account: {result_code}")
    sys.exit(1)

print("Sponsee account created successfully!")
print(f"Transaction URL: https://devnet.xrpl.org/transactions/{create_account_response.result['hash']}")
```

### 5. Prepare the SponsorshipSet transaction

To create the pre-funded pool ([Sponsorship entry](/docs/references/protocol/ledger-data/ledger-entry-types/sponsorship)), prepare a [SponsorshipSet transaction](/docs/references/protocol/transactions/types/sponsorshipset).

JavaScript
```js
// Prepare SponsorshipSet transaction ----------------------
console.log(`\n=== Preparing SponsorshipSet transaction... ===`)
const sponsorshipSetTx = {
  TransactionType: 'SponsorshipSet',
  Account: sponsor.address,
  Sponsee: sponsee.address,
  FeeAmountDelta: '1000000',
  MaxFee: '1000',
  RemainingOwnerCountDelta: 5
}
validate(sponsorshipSetTx)
console.log(JSON.stringify(sponsorshipSetTx, null, 2))
```

Python
```py
# Prepare SponsorshipSet transaction ----------------------
print("\n=== Preparing SponsorshipSet transaction... ===")
sponsorship_set_tx = SponsorshipSet(
    account=sponsor.address,
    sponsee=sponsee.address,
    fee_amount_delta="1000000",
    max_fee="1000",
    remaining_owner_count_delta=5,
)
print(json.dumps(sponsorship_set_tx.to_xrpl(), indent=2))
```

Tip
Set `MaxFee` with enough headroom for changes in the network's required [transaction cost](/docs/concepts/transactions/transaction-cost). A cap near the current minimum can block the sponsee's transactions when the cost rises. Monitor the pool's `FeeAmount` so it can be topped up before it runs out.

The `FeeAmountDelta` field represents the drops available for fees, `MaxFee` caps what the pool pays for any single transaction, and `RemainingOwnerCountDelta` is the number of owner reserves the sponsor covers.

The two delta fields are amounts to add to the pool's current values (`FeeAmount` and `RemainingOwnerCount`), not replacements. For this example, the pool is new so each delta becomes its starting value. Both fields also accept a *negative* value:

- A negative `FeeAmountDelta` returns the unspent XRP to the sponsor.
- A negative `RemainingOwnerCountDelta` lowers how many owner reserves the pool covers.


A negative delta is a subtraction, so neither field goes below zero. If you subtract more than a field has left, that field drops to zero instead, as long as the other one stays positive. A subtraction that would leave both at zero fails with `tecNO_PERMISSION`.

### 6. Submit the SponsorshipSet transaction

Sign and submit the SponsorshipSet transaction.

JavaScript
```js
// Submit the SponsorshipSet transaction ----------------------
console.log(`\n=== Submitting SponsorshipSet transaction... ===`)
const sponsorshipResponse = await client.submitAndWait(sponsorshipSetTx, {
  wallet: sponsor,
  autofill: true
})

if (sponsorshipResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  const resultCode = sponsorshipResponse.result.meta.TransactionResult
  console.error('Error: Unable to create the sponsorship:', resultCode)
  await client.disconnect()
  process.exit(1)
}

// Extract the Sponsorship entry from the transaction result ----------------------
const sponsorshipNode = sponsorshipResponse.result.meta.AffectedNodes.find(
  node => node.CreatedNode?.LedgerEntryType === 'Sponsorship'
)
console.log('Sponsorship created successfully!')
console.log(`Sponsorship ID: ${sponsorshipNode.CreatedNode.LedgerIndex}`)
console.log(`Transaction URL: https://devnet.xrpl.org/transactions/${sponsorshipResponse.result.hash}`)
```

Python
```py
# Submit the SponsorshipSet transaction ----------------------
print("\n=== Submitting SponsorshipSet transaction... ===")
sponsorship_response = submit_and_wait(sponsorship_set_tx, client, sponsor)

if sponsorship_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    result_code = sponsorship_response.result["meta"]["TransactionResult"]
    print(f"Error: Unable to create the sponsorship: {result_code}")
    sys.exit(1)

# Extract the Sponsorship entry from the transaction result ----------------------
sponsorship_node = next(
    node for node in sponsorship_response.result["meta"]["AffectedNodes"]
    if node.get("CreatedNode", {}).get("LedgerEntryType") == "Sponsorship"
)
print("Sponsorship created successfully!")
print(f"Sponsorship ID: {sponsorship_node['CreatedNode']['LedgerIndex']}")
print(f"Transaction URL: https://devnet.xrpl.org/transactions/{sponsorship_response.result['hash']}")
```

The sponsor pays the `FeeAmountDelta` up front and must also meet the reserve requirement for the new Sponsorship entry. If it can't cover those costs, the transaction fails with `tecUNFUNDED`.

Each pool is a single Sponsorship entry that serves one sponsee. To fund several sponsees, the sponsor must create a pool for each one and hold an owner reserve for every pool.

Note
By default, the sponsee can spend from the pool without further sponsor approval. A sponsor can also require a signature on each use by enabling the `tfSponsorshipSetRequireSignForFee` and `tfSponsorshipSetRequireSignForReserve` flags. In that variation, transactions still draw from the pre-funded pool, but each sponsored transaction must also include the sponsor's signature.

### 7. Sponsor a transaction

Submit the sponsored transaction and wait for validation.

JavaScript
The `addPreFundedSponsor` helper adds the `Sponsor` and `SponsorFlags` fields for a transaction that draws from an existing pre-funded Sponsorship entry.

```js
// Prepare the sponsored DepositPreauth transaction ----------------------
console.log(`\n=== Preparing sponsored DepositPreauth transaction... ===`)
const depositPreauthTx = addPreFundedSponsor(
  {
    TransactionType: 'DepositPreauth',
    Account: sponsee.address,
    Authorize: sponsor.address
  },
  sponsor.address,
  SponsorFlags.spfSponsorFee | SponsorFlags.spfSponsorReserve
)
validate(depositPreauthTx)
console.log(JSON.stringify(depositPreauthTx, null, 2))

// Submit the sponsored DepositPreauth transaction ----------------------
console.log(`\n=== Submitting sponsored DepositPreauth transaction... ===`)
const submitResponse = await client.submitAndWait(depositPreauthTx, {
  wallet: sponsee,
  autofill: true
})

if (submitResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  const resultCode = submitResponse.result.meta.TransactionResult
  console.error('Error: Unable to create the preauthorization:', resultCode)
  await client.disconnect()
  process.exit(1)
}

// The transaction carries no SponsorSignature, which is what distinguishes the
// pre-funded flow from the co-signed flow.
if (submitResponse.result.tx_json.SponsorSignature !== undefined) {
  console.error('Error: A pre-funded sponsorship should not need a SponsorSignature')
  await client.disconnect()
  process.exit(1)
}

console.log('Transaction sponsored successfully!')
console.log(`Transaction URL: https://devnet.xrpl.org/transactions/${submitResponse.result.hash}`)
```

Python
```py
# Prepare the sponsored DepositPreauth transaction ----------------------
print("\n=== Preparing sponsored DepositPreauth transaction... ===")
deposit_preauth_tx = DepositPreauth(
    account=sponsee.address,
    authorize=sponsor.address,
    sponsor=sponsor.address,
    sponsor_flags=SponsorFlag.SPF_SPONSOR_FEE | SponsorFlag.SPF_SPONSOR_RESERVE,
)
print(json.dumps(deposit_preauth_tx.to_xrpl(), indent=2))

# Submit the sponsored DepositPreauth transaction ----------------------
print("\n=== Submitting sponsored DepositPreauth transaction... ===")
submit_response = submit_and_wait(deposit_preauth_tx, client, sponsee)

if submit_response.result["meta"]["TransactionResult"] != "tesSUCCESS":
    result_code = submit_response.result["meta"]["TransactionResult"]
    print(f"Error: Unable to create the preauthorization: {result_code}")
    sys.exit(1)

# The transaction carries no SponsorSignature, which is what distinguishes the
# pre-funded flow from the co-signed flow.
if "SponsorSignature" in submit_response.result["tx_json"]:
    print("Error: A pre-funded sponsorship should not need a SponsorSignature")
    sys.exit(1)

print("Transaction sponsored successfully!")
print(f"Transaction URL: https://devnet.xrpl.org/transactions/{submit_response.result['hash']}")
```

In this example, the sponsee submits a [DepositPreauth transaction](/docs/references/protocol/transactions/types/depositpreauth) without a signature from the sponsor. The transaction draws its transaction fee and the new ledger entry's reserve from the pool. Many other transaction types can also be sponsored; see [SponsorFlags field](/docs/references/protocol/transactions/common-fields#sponsorflags-field) to learn more.

### 8. Validate the sponsorship

Inspect the affected nodes to verify the `Sponsor` field is on the new [DepositPreauth entry](/docs/references/protocol/ledger-data/ledger-entry-types/depositpreauth), and compare the Sponsorship entry's fields before and after to see what the pool spent.

JavaScript
```js
// Extract sponsorship information from the transaction result ----------------------
console.log(`\n=== Sponsorship Pool information ===`)
const preauthNode = submitResponse.result.meta.AffectedNodes.find(
  node => node.CreatedNode?.LedgerEntryType === 'DepositPreauth'
)
console.log(`DepositPreauth ID: ${preauthNode.CreatedNode.LedgerIndex}`)
console.log(`DepositPreauth reserve sponsored by: ${preauthNode.CreatedNode.NewFields.Sponsor}`)

// The Sponsorship entry shows the fee drops and owner reserves the pool spent.
const sponsorshipPool = submitResponse.result.meta.AffectedNodes.find(
  node => node.ModifiedNode?.LedgerEntryType === 'Sponsorship'
)
const fields = sponsorshipPool.ModifiedNode.FinalFields
const previous = sponsorshipPool.ModifiedNode.PreviousFields
const feePaid = BigInt(previous.FeeAmount) - BigInt(fields.FeeAmount)

console.log(`\nFee spent from the pool: ${feePaid} drops`)
console.log(`Fee remaining in the pool: ${fields.FeeAmount} drops`)
console.log(`Owner reserves spent: ${previous.RemainingOwnerCount - fields.RemainingOwnerCount}`)
console.log(`Owner reserves remaining: ${fields.RemainingOwnerCount}`)

await client.disconnect()
```

Python
```py
# Extract sponsorship information from the transaction result ----------------------
print("\n=== Sponsorship Pool information ===")
preauth_node = next(
    node for node in submit_response.result["meta"]["AffectedNodes"]
    if node.get("CreatedNode", {}).get("LedgerEntryType") == "DepositPreauth"
)
print(f"DepositPreauth ID: {preauth_node['CreatedNode']['LedgerIndex']}")
print(f"DepositPreauth reserve sponsored by: {preauth_node['CreatedNode']['NewFields']['Sponsor']}")

# The Sponsorship entry shows the fee drops and owner reserves the pool spent.
sponsorship_pool = next(
    node for node in submit_response.result["meta"]["AffectedNodes"]
    if node.get("ModifiedNode", {}).get("LedgerEntryType") == "Sponsorship"
)
fields = sponsorship_pool["ModifiedNode"]["FinalFields"]
previous = sponsorship_pool["ModifiedNode"]["PreviousFields"]
fee_paid = int(previous["FeeAmount"]) - int(fields["FeeAmount"])
owner_reserves_spent = int(previous["RemainingOwnerCount"]) - int(fields["RemainingOwnerCount"])

print(f"\nFee spent from the pool: {fee_paid} drops")
print(f"Fee remaining in the pool: {fields['FeeAmount']} drops")
print(f"Owner reserves spent: {owner_reserves_spent}")
print(f"Owner reserves remaining: {fields['RemainingOwnerCount']}")
```

## See Also

- **Concepts:**
  - [Sponsored Fees and Reserves](/docs/concepts/accounts/sponsored-fees-and-reserves)
  - [Reserves](/docs/concepts/accounts/reserves)
- **Tutorials:**
  - [Sponsor a Transaction by Co-Signing](/docs/tutorials/best-practices/account-management/sponsor-a-transaction-by-co-signing)
  - [Manage a Sponsorship Pool](/docs/tutorials/best-practices/account-management/manage-a-sponsorship-pool)
  - [Transfer a Reserve Sponsorship](/docs/tutorials/best-practices/account-management/transfer-a-reserve-sponsorship)
- **References:**
  - [SponsorshipSet transaction](/docs/references/protocol/transactions/types/sponsorshipset)
  - [DepositPreauth transaction](/docs/references/protocol/transactions/types/depositpreauth)
  - [Sponsorship ledger entry](/docs/references/protocol/ledger-data/ledger-entry-types/sponsorship)
  - [Common Fields](/docs/references/protocol/transactions/common-fields#sponsorflags-field)