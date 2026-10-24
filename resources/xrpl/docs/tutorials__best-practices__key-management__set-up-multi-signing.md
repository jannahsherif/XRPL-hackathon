# Set Up Multi-Signing

This tutorial shows up how to set up [multi-signing](/docs/concepts/accounts/multi-signing) on your XRP Ledger account, which allows you to authorize transactions using signatures from a combination of keys. Various configurations are possible, but this tutorial shows a straightforward configuration requiring 2 of 3 signers to authorize a transaction.

## Goals

By following this tutorial, you should learn how to:

- Generate key pairs you can use for multi-signing.
- Add or update a signer list on your account.
- Look up the signer list associated with an account, including its configured weights and quorum.


## Prerequisites

To complete this tutorial, you should:

- Have a basic understanding of the XRP Ledger.
- Have an [XRP Ledger client library](/docs/references/client-libraries), such as **xrpl.js**, installed.
- Have a basic understanding of [Cryptographic Keys](/docs/concepts/accounts/cryptographic-keys) and [Multi-Signing](/docs/concepts/accounts/multi-signing).


## Source Code

You can find the complete source code for this tutorial's examples in the code samples section of this website's repository.

## Steps

### 1. Install dependencies

JavaScript
From the code sample folder, use `npm` to install dependencies:

```sh
npm i
```

Python
From the code sample folder, set up a virtual environment and use `pip` to install dependencies:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Connect and get account(s)

To get started, import the client library and instantiate an API client. For this tutorial, you need one account, which the sample code funds using the Testnet faucet; you could also use an existing account.

JavaScript
```js
import xrpl from 'xrpl'

const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
await client.connect()

console.log('Funding new wallet from faucet...')
const { wallet } = await client.fundWallet()
console.log(`Funded. Master key pair:
  Address: ${wallet.address}
  Seed: ${wallet.seed}
`)
```

Python
```py
import json
from xrpl.clients import JsonRpcClient
from xrpl.models.requests import AccountInfo
from xrpl.models.transactions import SignerEntry, SignerListSet
from xrpl.wallet import generate_faucet_wallet, Wallet
from xrpl.transaction import submit_and_wait

client = JsonRpcClient("https://s.altnet.rippletest.net:51234")

print("Funding new wallet from faucet...")
wallet = generate_faucet_wallet(client)
print(f"""Funded. Master key pair:
  Address: {wallet.address}
  Seed: {wallet.seed}
""")
```

### 3. Prepare signer keys

Each signer on your list needs a key pair they can use to sign transactions. As the account owner, you only need to know the addresses, not the secret keys, of each signer. One party knowing all the secret keys might defeat the purpose of multi-signing, depending on your use case. These addresses *can* have funded accounts in the ledger, but they don't have to.

Each signer should securely generate and store their own key pair, as you would any time you generate keys for an XRP Ledger account.

JavaScript
```js
// Generate key pairs to use as signers ----------------------------------------
// If each signer represents a separate person, they should generate their own
// key pairs and send you just the address. These key pairs don't need to be
// funded accounts in the ledger.
const algorithm = 'ed25519'
const signerAddresses = []
for (let i = 0; i < 3; i++) {
  const signer = xrpl.Wallet.generate(algorithm)
  console.log(`Generated key pair for signer ${i + 1}:
  Address: ${signer.address}
  Seed: ${signer.seed}
  Algorithm: ${algorithm}
`)
  signerAddresses.push(signer.address)
}
```

Python
```py
# Generate key pairs to use as signers -----------------------------------------
# If each signer represents a separate person, they should generate their own
# key pairs and send you just the address. These key pairs don't need to be
# funded accounts in the ledger.
algorithm = "ed25519"
signer_addresses = []
for i in range(3):
    signer = Wallet.create(algorithm=algorithm)
    print(f"""Generated key pair for signer {i + 1}:
  Address: {signer.address}
  Seed: {signer.seed}
  Algorithm: {algorithm}
""")
    signer_addresses.append(signer.address)
```

For purposes of this tutorial, the sample code generates three key pairs and saves their addresses into an array.

### 4. Send SignerListSet transaction

Use a [SignerListSet transaction](/docs/references/protocol/transactions/types/signerlistset) to assign a multi-signing list to your account. For this transaction, you set the total weight needed for a quorum in the `SignerQuorum` field, and the list of signers with their individual weights in the `SignerEntries` field. For 2-of-3 multi-signing, give each of the three signers a weight of `1` and set the quorum to `2`. Note that each object in the `SignerEntries` array must be a wrapper object with a single `SignerEntry` field.

JavaScript
```js
// Send SignerListSet transaction ----------------------------------------------
// This example sets up a 2-of-3 requirement with all signers weighted equally
const signerEntries = []
for (const signerAddress of signerAddresses) {
  signerEntries.push({
    SignerEntry: {
      Account: signerAddress,
      SignerWeight: 1
    }
  })
}
const signerListSetTx = {
  TransactionType: 'SignerListSet',
  Account: wallet.address,
  SignerQuorum: 2,
  SignerEntries: signerEntries
}
xrpl.validate(signerListSetTx)

console.log('Signing and submitting the SignerListSet transaction:',
  JSON.stringify(signerListSetTx, null, 2))
const response = await client.submitAndWait(signerListSetTx, { wallet, autofill: true })

// Check result of the SignerListSet transaction -------------------------------
console.log(JSON.stringify(response.result, null, 2))
const listSetResultCode = response.result.meta.TransactionResult
if (listSetResultCode === 'tesSUCCESS') {
  console.log('Signer list set successfully.')
} else {
  console.error(`SignerListSet failed with code ${listSetResultCode}.`)
  client.disconnect()
  process.exit(1)
}
```

Python
```py
# Send SignerListSet transaction -----------------------------------------------
# This example sets up a 2-of-3 requirement with all signers weighted equally
signer_list_set_tx = SignerListSet(
    account=wallet.address,
    signer_quorum=2,
    signer_entries=[
        SignerEntry(account=signer_address, signer_weight=1)
        for signer_address in signer_addresses
    ],
)

print(
    "Signing and submitting the SignerListSet transaction:",
    json.dumps(signer_list_set_tx.to_xrpl(), indent=2),
)
try:
    response = submit_and_wait(signer_list_set_tx, client, wallet)
except Exception as err:
    print("Submitting SignerListSet transaction failed with error", err)
    exit(1)

# Check result of the SignerListSet transaction --------------------------------
print(json.dumps(response.result, indent=2))
signer_list_set_result_code = response.result["meta"]["TransactionResult"]
if signer_list_set_result_code == "tesSUCCESS":
    print("Signer list set successfully.")
else:
    print(f"SignerListSet failed with code {signer_list_set_result_code}.")
    exit(1)
```

Tip: Replacing Signer Lists
If you already have a multi-signing list configured for your account, you can use this same process to replace it with a new list. You can even use the old list to authorize the transaction.

### 5. Confirm that the signer list is assigned to your account

If the SignerListSet transaction succeeded, the list should now be associated with your account. For further confirmation, you can look up the list using the [account_info method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_info).

JavaScript
```js
// Confirm signer list ---------------------------------------------------------
const accountInfoResp = await client.request({
  command: 'account_info',
  account: wallet.address,
  ledger_index: 'validated',
  signer_lists: true
})
if (accountInfoResp.error) {
  console.error('Error looking up account:', accountInfoResp.error)
  client.disconnect()
  process.exit(1)
}

if (accountInfoResp.result.signer_lists) {
  const lists = accountInfoResp.result.signer_lists
  console.log(`Account has ${lists.length} signer list(s):`)
  for (const l of lists) {
    console.log(`  List #${l.SignerListID} Quorum = ${l.SignerQuorum}`)
    for (const SEWrapper of l.SignerEntries) {
      const se = SEWrapper.SignerEntry
      console.log(`    Signer ${se.Account} Weight = ${se.SignerWeight}`)
    }
  }
} else {
  console.error(`No signer lists associated with ${wallet.address}`)
  client.disconnect()
  process.exit(1)
}

client.disconnect()
```

Python
```py
# Confirm signer list ----------------------------------------------------------
try:
    account_info_resp = client.request(
        AccountInfo(account=wallet.address, ledger_index="validated", signer_lists=True)
    )
except Exception as err:
    print("Error requesting account_info:", err)
    exit(1)
if not account_info_resp.is_successful():
    print("Error looking up account:", account_info_resp.result)
    exit(1)

if account_info_resp.result.get("signer_lists"):
    lists = account_info_resp.result["signer_lists"]
    print(f"Account has {len(lists)} signer list(s):")
    for l in lists:
        print(f"  List #{l['SignerListID']} Quorum = {l['SignerQuorum']}")
        for se_wrapper in l["SignerEntries"]:
            se = se_wrapper["SignerEntry"]
            print(f"    Signer {se['Account']} Weight = {se['SignerWeight']}")
else:
    print(f"No signer lists associated with {wallet.address}")
    exit(1)
```

Note
There currently is no way to have more than one multi-signing list assigned to your account, but the protocol is built to be expandable; every signer list has an ID number of `0`, so that a future [amendment](/docs/concepts/networks-and-servers/amendments) could allow lists with other IDs. This is why the `signer_lists` field is an array in the `account_info` response.

## Next Steps

At this point, you can [send a multi-signed transaction](/docs/tutorials/best-practices/key-management/send-a-multi-signed-transaction). You may also want to:

* [Disable the master key pair](/docs/tutorials/best-practices/key-management/disable-master-key-pair).
* [Remove the regular key pair](/docs/tutorials/best-practices/key-management/remove-a-regular-key-pair) (if you previously set one)


## See Also

- **Concepts:**
  - [Cryptographic Keys](/docs/concepts/accounts/cryptographic-keys)
  - [Multi-Signing](/docs/concepts/accounts/multi-signing)
  - [Reliable Transaction Submission](/docs/concepts/transactions/reliable-transaction-submission)
- **Tutorials:**
  - [Send a Multi-signed Transaction](/docs/tutorials/best-practices/key-management/send-a-multi-signed-transaction)
  - [Assign a Regular Key Pair](/docs/tutorials/best-practices/key-management/assign-a-regular-key-pair)
  - [Disable Master Key Pair](/docs/tutorials/best-practices/key-management/disable-master-key-pair)
- **References:**
  - [account_info method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_info)
  - [SignerListSet transaction](/docs/references/protocol/transactions/types/signerlistset)
  - [SignerList entry](/docs/references/protocol/ledger-data/ledger-entry-types/signerlist)