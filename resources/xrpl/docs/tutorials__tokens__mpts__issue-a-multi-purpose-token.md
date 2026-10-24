# Issue a Multi-Purpose Token (MPT)

A [Multi-Purpose Token (MPT)](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens) lets you quickly access powerful, built-in tokenization features on the XRP Ledger with minimal code.

This tutorial shows you how to issue an MPT with on-chain metadata, such as the token's ticker, name, or description, encoded according to the MPT [metadata schema](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens#metadata-schema) defined in [XLS-89](https://xls.xrpl.org/xls/XLS-0089-multi-purpose-token-metadata-schema.html). It then shows you how to update the token's [mutable properties](/docs/concepts/tokens/fungible-tokens/mutable-mpts) and how to declare a property immutable.

_The [DynamicMPT amendment](/resources/known-amendments#dynamicmpt) updates this. (Open for Voting: 31.43%)_

## Goals

By the end of this tutorial, you will be able to:

- Issue a new MPT on the XRP Ledger.
- Encode and decode token metadata according to the XLS-89 standard.
- Modify token properties after issuance.


## Prerequisites

To complete this tutorial, you should:

- Have a basic understanding of the XRP Ledger.
- Have an XRP Ledger client library set up in your development environment. This page provides examples for the following:
  - **JavaScript** with the [xrpl.js library](https://github.com/XRPLF/xrpl.js). See [Get Started Using JavaScript](/docs/tutorials/get-started/get-started-javascript) for setup steps.
  - **Python** with the [xrpl-py library](https://github.com/XRPLF/xrpl-py). See [Get Started Using Python](/docs/tutorials/get-started/get-started-python) for setup steps.


## Source Code

You can find the complete source code for this tutorial's example in the [code samples section of this website's repository](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/issue-mpt-with-metadata).

## Steps

The example in this tutorial demonstrates how to issue a sample [US Treasury bill (T-bill)](https://www.treasurydirect.gov/research-center/history-of-marketable-securities/bills/t-bills-indepth/) as an MPT on the XRP Ledger.

### 1. Install dependencies

JavaScript
From the code sample folder, use npm to install dependencies:

```bash
npm install xrpl
```

Python
From the code sample folder, install dependencies using pip:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Set up client and account

Import the client library, instantiate a client to connect to the XRPL, and fund a new wallet to act as the token issuer.

JavaScript
```js
import {
  MPTokenIssuanceCreateFlags,
  MPTokenIssuanceCreateImmutableFlags,
  MPTokenIssuanceSetFlags,
  Client,
  encodeMPTokenMetadata,
  decodeMPTokenMetadata
} from 'xrpl'

// Connect to network and get a wallet
const client = new Client('wss://s.devnet.rippletest.net:51233')
await client.connect()

console.log('=== Funding new wallet from faucet...===')
const { wallet: issuer } = await client.fundWallet()
console.log(`Issuer address: ${issuer.address}`)
```

Python
```py
import json
from xrpl.utils import encode_mptoken_metadata, decode_mptoken_metadata
from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet
from xrpl.transaction import submit_and_wait
from xrpl.models import (
    LedgerEntry,
    MPTokenIssuanceCreate,
    MPTokenIssuanceCreateFlag,
    MPTokenIssuanceImmutableFlag,
    MPTokenIssuanceSet,
    MPTokenIssuanceSetFlag,
)

# Set up client and get a wallet
client = JsonRpcClient("https://s.devnet.rippletest.net:51234")
print("=== Funding new wallet from faucet... ===")
issuer = generate_faucet_wallet(client, debug=True)
```

Note
The ledger entry that defines an MPT issuance counts as one object towards the issuer's [owner reserve](/docs/concepts/accounts/reserves#owner-reserves), so the issuer needs to set aside **0.2 XRP** per MPT issuance.

### 3. Define and encode MPT metadata

The metadata you provide is what distinguishes your token from other MPTs. Define the JSON metadata as shown in the following code snippet:

JavaScript
```js
// Define metadata as JSON
const mptMetadata = {
  ticker: 'TBILL',
  name: 'T-Bill Yield Token',
  desc: 'A yield-bearing stablecoin backed by short-term U.S. Treasuries and money market instruments.',
  icon: 'https://example.org/tbill-icon.png',
  asset_class: 'rwa',
  asset_subclass: 'treasury',
  issuer_name: 'Example Yield Co.',
  uris: [
    {
      uri: 'https://exampleyield.co/tbill',
      category: 'website',
      title: 'Product Page'
    },
    {
      uri: 'https://exampleyield.co/docs',
      category: 'docs',
      title: 'Yield Token Docs'
    }
  ],
  additional_info: {
    interest_rate: '5.00%',
    interest_type: 'variable',
    yield_source: 'U.S. Treasury Bills',
    maturity_date: '2045-06-30',
    cusip: '912796RX0'
  }
}
```

Python
```py
# Define metadata as JSON 
mpt_metadata = {
    "ticker": "TBILL",
    "name": "T-Bill Yield Token",
    "desc": "A yield-bearing stablecoin backed by short-term U.S. Treasuries and money market instruments.",
    "icon": "https://example.org/tbill-icon.png",
    "asset_class": "rwa",
    "asset_subclass": "treasury",
    "issuer_name": "Example Yield Co.",
    "uris": [
        {
            "uri": "https://exampleyield.co/tbill",
            "category": "website",
            "title": "Product Page"
        },
        {
            "uri": "https://exampleyield.co/docs",
            "category": "docs",
            "title": "Yield Token Docs"
        }
    ],
    "additional_info": {
        "interest_rate": "5.00%",
        "interest_type": "variable",
        "yield_source": "U.S. Treasury Bills",
        "maturity_date": "2045-06-30",
        "cusip": "912796RX0"
    }
}
```

The metadata schema supports both long field names (`ticker`, `name`, `desc`) and compact short keys (`t`, `n`, `d`). To save space on the ledger, it’s recommended to use short key names. This is because the metadata field has a 1024-byte limit, so using compact keys allows you to include more information.

The SDK libraries provide utility functions to encode or decode the metadata for you, so you don't have to. If long field names are provided in the JSON, the **encoding utility function** automatically shortens them to their compact key equivalents before encoding. Similarly, when decoding, the **decoding utility function** converts the short keys back to their respective long names.

To encode the metadata:

JavaScript
```js
// Encode the metadata.
// The encodeMPTokenMetadata function shortens standard MPTokenMetadata
// field names to a compact key, then converts the JSON metadata object into a
// hex-encoded string, following the XLS-89 standard.
// https://xls.xrpl.org/xls/XLS-0089-multi-purpose-token-metadata-schema.html
console.log('\n=== Encoding metadata...===')
const mptMetadataHex = encodeMPTokenMetadata(mptMetadata)
console.log('Encoded mptMetadataHex: ', mptMetadataHex)
```

Python
```py
# Encode the metadata.
# The encode_mptoken_metadata function shortens standard MPTokenMetadata
# field names to a compact key, then converts the JSON metadata object into a
# hex-encoded string, following the XLS-89 standard.
# https://xls.xrpl.org/xls/XLS-0089-multi-purpose-token-metadata-schema.html
print("\n=== Encoding metadata...===")
mpt_metadata_hex = encode_mptoken_metadata(mpt_metadata)
print("Encoded mpt_metadata_hex:", mpt_metadata_hex)
```

Caution
The encoding function raises an error if the input isn't a valid JSON object.

### 4. Prepare the MPTokenIssuanceCreate transaction

To issue the MPT, create an `MPTokenIssuanceCreate` transaction object with the following fields:

| Field | Value |
|  --- | --- |
| `TransactionType` | The type of transaction. In this case, `MPTokenIssuanceCreate`. |
| `Account` | The wallet address of the account that is issuing the MPT. In this case, the `issuer`. |
| `AssetScale` | Where to put the decimal place when displaying amounts of this MPT. This is set to `4` for this example. |
| `MaximumAmount` | The maximum supply of the token to be issued. |
| `TransferFee` | The transfer fee to charge for transferring the token. In this example it is set to `0`. |
| `Flags` | Flags to set token permissions. For this example, the following flags are configured: **Can Transfer**: A holder can transfer the T-bill MPT to another account.**Can Lock**: The issuer can lock individual balances of the T-bill MPT, or the entire issuance.See [MPTokenIssuanceCreate Flags](/docs/references/protocol/transactions/types/mptokenissuancecreate#mptokenissuancecreate-flags) for all available flags. |
| `ImmutableFlags` | Flags declaring which fields and MPT issuance flags can never be changed. This example declares **Can Clawback** immutable, so the issuer can never gain the power to claw back tokens from holders. See [MPTokenIssuanceCreate Immutable Flags](/docs/references/protocol/transactions/types/mptokenissuancecreate#mptokenissuancecreate-immutable-flags) for all available flags. |
| `MPTokenMetadata` | The hex-encoded metadata for the token. |


JavaScript
```js
// Define the transaction, including other MPT parameters
const mptIssuanceCreate = {
  TransactionType: 'MPTokenIssuanceCreate',
  Account: issuer.address,
  AssetScale: 4,
  MaximumAmount: '50000000',
  TransferFee: 0,
  Flags:
    MPTokenIssuanceCreateFlags.tfMPTCanTransfer |
    MPTokenIssuanceCreateFlags.tfMPTCanLock,
  ImmutableFlags: MPTokenIssuanceCreateImmutableFlags.tifMPTCanClawback,
  MPTokenMetadata: mptMetadataHex
}
```

Python
```py
# Define the transaction, including other MPT parameters
mpt_issuance_create = MPTokenIssuanceCreate(
    account=issuer.address,
    asset_scale=4,
    maximum_amount="50000000",
    transfer_fee=0,
    flags=MPTokenIssuanceCreateFlag.TF_MPT_CAN_TRANSFER |
          MPTokenIssuanceCreateFlag.TF_MPT_CAN_LOCK,
    immutable_flags=MPTokenIssuanceImmutableFlag.TIF_MPT_CAN_CLAWBACK,
    mptoken_metadata=mpt_metadata_hex
)
```

### 5. Submit the transaction and check the result

Some important considerations about token metadata when you submit the transaction:

- If you provide metadata that exceeds the 1024-byte limit, the transaction fails with an error.
- If the metadata does not conform to the XLS-89 standards, the transaction still succeeds, but your token may not be compatible with wallets and applications that expect valid MPT metadata. The SDK libraries provide a warning to help you diagnose why your metadata may not be compliant. For example:

```sh
MPTokenMetadata is not properly formatted as JSON as per the XLS-89d standard. 
While adherence to this standard is not mandatory, such non-compliant MPToken's 
might not be discoverable by Explorers and Indexers in the XRPL ecosystem.
- ticker/t: should have uppercase letters (A-Z) and digits (0-9) only. Max 6 characters recommended.
- name/n: should be a non-empty string.
- icon/i: should be a non-empty string.
- asset_class/ac: should be one of rwa, memes, wrapped, gaming, defi, other.
```


Sign and submit the `MPTokenIssuanceCreate` transaction to the ledger, then verify that it succeeded and retrieve the MPT issuance ID.

Caution
The `AssetScale` and `MaximumAmount` values are fixed for the life of the token, as is anything you declare in `ImmutableFlags`. Review these settings carefully before submitting. The metadata and transfer fee stay mutable unless you declare them immutable. Capability flags can also be enabled later if they weren't declared immutable, but enabled flags can't be disabled.

JavaScript
```js
// Sign and submit the transaction
console.log('\n=== Sending MPTokenIssuanceCreate transaction...===')
console.log(JSON.stringify(mptIssuanceCreate, null, 2))
const submitResponse = await client.submitAndWait(mptIssuanceCreate, {
  wallet: issuer,
  autofill: true
})

// Check transaction results
console.log('\n=== Checking MPTokenIssuanceCreate results... ===')
if (submitResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  const resultCode = submitResponse.result.meta.TransactionResult
  console.warn(`Transaction failed with result code ${resultCode}.`)
  await client.disconnect()
  process.exit(1)
}

const issuanceId = submitResponse.result.meta.mpt_issuance_id
console.log(
  `\n- MPToken created successfully with issuance ID: ${issuanceId}`
)
// View the MPT issuance on the XRPL Explorer
console.log(`- Explorer URL: https://devnet.xrpl.org/mpt/${issuanceId}`)
```

Python
```py
# Sign and submit the transaction
print("\n=== Sending MPTokenIssuanceCreate transaction...===")
print(json.dumps(mpt_issuance_create.to_xrpl(), indent=2))
response = submit_and_wait(mpt_issuance_create, client, issuer, autofill=True)

# Check transaction results
print("\n=== Checking MPTokenIssuanceCreate results... ===")
result_code = response.result["meta"]["TransactionResult"]
if result_code != "tesSUCCESS":
    print(f"Transaction failed with result code {result_code}.")
    exit(1)

issuance_id = response.result["meta"]["mpt_issuance_id"]
print(f"\n- MPToken created successfully with issuance ID: {issuance_id}")
print(f"- Explorer URL: https://devnet.xrpl.org/mpt/{issuance_id}")
```

A `tesSUCCESS` result indicates that the transaction is successful and the token has been created.

### 6. Confirm MPT issuance and decode metadata

Look up the MPT issuance entry in the validated ledger and decode the metadata to verify it matches your original input.

JavaScript
```js
// Look up MPT Issuance entry in the validated ledger
console.log('\n=== Confirming MPT Issuance metadata in the validated ledger... ===')
const ledgerEntryResponse = await client.request({
  command: 'ledger_entry',
  mpt_issuance: issuanceId,
  ledger_index: 'validated'
})

// Decode the metadata.
// The decodeMPTokenMetadata function takes a hex-encoded string representing MPT metadata,
// decodes it to a JSON object, and expands any compact field names to their full forms.
const metadataBlob = ledgerEntryResponse.result.node.MPTokenMetadata
const decodedMetadata = decodeMPTokenMetadata(metadataBlob)
console.log('Decoded MPT metadata:\n', decodedMetadata)
```

Python
```py
# Look up MPT Issuance entry in the validated ledger
print("\n=== Confirming MPT Issuance metadata in the validated ledger... ===")
ledger_entry_response = client.request(LedgerEntry(
    mpt_issuance=issuance_id,
    ledger_index="validated"
))

# Decode the metadata.
# The decode_mptoken_metadata function takes a hex-encoded string representing MPT metadata,
# decodes it to a JSON object, and expands any compact field names to their full forms.
metadata_blob = ledger_entry_response.result["node"]["MPTokenMetadata"]
decoded_metadata = decode_mptoken_metadata(metadata_blob)
print("Decoded MPT metadata:\n", json.dumps(decoded_metadata, indent=2))
```

The decoding utility function converts the metadata back to a JSON object and expands the compact key names back to their respective long names.

### 7. (Optional) Modify the token after issuance

Your token is now issued and ready to use. The `MPTokenMetadata` and `TransferFee` fields stay mutable, and unset [MPT issuance flags](/docs/references/protocol/ledger-data/ledger-entry-types/mptokenissuance#mptokenissuance-flags) can still be enabled, so you can adjust the issuance as your business needs evolve. Use an [MPTokenIssuanceSet transaction](/docs/references/protocol/transactions/types/mptokenissuanceset) to update these properties, enable capability flags, or declare them immutable with the `ImmutableFlags` field.

The following example updates the interest rate in the token's metadata, sets a 0.01% transfer fee, enables **Can Trade**, and makes the metadata immutable, all in a single transaction:

JavaScript
```js
// Update the mutable properties, then make the metadata immutable.
// MPTokenMetadata and TransferFee were not declared immutable at issuance, so a
// single MPTokenIssuanceSet transaction can update both. Metadata updates
// replace the whole field, so encode the complete object, not just the changes.
const updatedMetadata = {
  ...mptMetadata,
  additional_info: { ...mptMetadata.additional_info, interest_rate: '4.75%' }
}

console.log('\n=== Sending MPTokenIssuanceSet transaction to update properties...===')
const mptIssuanceUpdate = {
  TransactionType: 'MPTokenIssuanceSet',
  Account: issuer.address,
  MPTokenIssuanceID: issuanceId,
  MPTokenMetadata: encodeMPTokenMetadata(updatedMetadata),
  // A non-zero TransferFee requires the Can Transfer flag, set at issuance.
  TransferFee: 10,
  // Enable Can Trade after issuance.
  Flags: MPTokenIssuanceSetFlags.tfMPTSetCanTrade,
  // The metadata update above still applies; immutability takes effect after it.
  // ImmutableFlags is additive, so tifMPTMetadata is added to the
  // tifMPTCanClawback bit declared at issuance rather than replacing it.
  ImmutableFlags: MPTokenIssuanceCreateImmutableFlags.tifMPTMetadata
}
console.log(JSON.stringify(mptIssuanceUpdate, null, 2))
const updateResponse = await client.submitAndWait(mptIssuanceUpdate, {
  wallet: issuer,
  autofill: true
})
if (updateResponse.result.meta.TransactionResult !== 'tesSUCCESS') {
  const resultCode = updateResponse.result.meta.TransactionResult
  console.warn(`Update failed with result code ${resultCode}.`)
  await client.disconnect()
  process.exit(1)
}
```

Python
```py
# Update the mutable properties, then make the metadata immutable.
# MPTokenMetadata and TransferFee were not declared immutable at issuance, so a
# single MPTokenIssuanceSet transaction can update both. Metadata updates
# replace the whole field, so encode the complete object, not just the changes.
updated_metadata = {
    **mpt_metadata,
    "additional_info": {**mpt_metadata["additional_info"], "interest_rate": "4.75%"}
}

print("\n=== Sending MPTokenIssuanceSet transaction to update properties...===")
mpt_issuance_update = MPTokenIssuanceSet(
    account=issuer.address,
    mptoken_issuance_id=issuance_id,
    mptoken_metadata=encode_mptoken_metadata(updated_metadata),
    # A non-zero transfer_fee requires the Can Transfer flag, set at issuance.
    transfer_fee=10,
    # Enable Can Trade after issuance.
    flags=MPTokenIssuanceSetFlag.TF_MPT_SET_CAN_TRADE,
    # The metadata update above still applies; immutability takes effect after it.
    # immutable_flags is additive, so TIF_MPT_METADATA is added to the
    # TIF_MPT_CAN_CLAWBACK bit declared at issuance rather than replacing it.
    immutable_flags=MPTokenIssuanceImmutableFlag.TIF_MPT_METADATA
)
print(json.dumps(mpt_issuance_update.to_xrpl(), indent=2))
update_response = submit_and_wait(mpt_issuance_update, client, issuer, autofill=True)
result_code = update_response.result["meta"]["TransactionResult"]
if result_code != "tesSUCCESS":
    print(f"Update failed with result code {result_code}.")
    exit(1)
```

Note the following:

- A metadata update replaces the whole field, so encode the complete object, not only the parts you changed.
- A single transaction can update a property, enable a capability flag, and declare a property immutable. Here, the metadata updates to a 4.75% interest rate, and any later attempts to change it will fail with `tecNO_PERMISSION`.
- `ImmutableFlags` is additive, so each declaration adds to the ones already on the issuance instead of replacing them.
- A non-zero `TransferFee` requires the **Can Transfer** flag, which this example enabled at issuance. See [Transfer Fee Rules](/docs/references/protocol/transactions/types/mptokenissuanceset#transfer-fee-rules).
- Capability flags, such as **Can Trade**, can be enabled at issuance or later, but once enabled, no later transaction can disable them.
- You can't combine these updates with a `Holder` field, `tfMPTLock`, or `tfMPTUnlock`. Locking holders' balances is a separate operation.


Look up the issuance entry again to confirm the changes:

JavaScript
```js
// Confirm the updated MPT Issuance entry
console.log('\n=== Confirming the updated MPT Issuance in the validated ledger... ===')
const updatedEntryResponse = await client.request({
  command: 'ledger_entry',
  mpt_issuance: issuanceId,
  ledger_index: 'validated'
})
const updatedNode = updatedEntryResponse.result.node
console.log('TransferFee:', updatedNode.TransferFee)
console.log('ImmutableFlags:', updatedNode.ImmutableFlags)
console.log('Decoded MPT metadata:\n', decodeMPTokenMetadata(updatedNode.MPTokenMetadata))
```

Python
```py
# Confirm the updated MPT Issuance entry
print("\n=== Confirming the updated MPT Issuance in the validated ledger... ===")
updated_entry_response = client.request(LedgerEntry(
    mpt_issuance=issuance_id,
    ledger_index="validated"
))
updated_node = updated_entry_response.result["node"]
print("TransferFee:", updated_node.get("TransferFee"))
print("ImmutableFlags:", updated_node.get("ImmutableFlags"))
print("Decoded MPT metadata:\n", json.dumps(
    decode_mptoken_metadata(updated_node["MPTokenMetadata"]), indent=2
))
```

## See Also

- **Concepts**:
  - [Multi-Purpose Tokens (MPT)](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens)
  - [Mutable MPTs](/docs/concepts/tokens/fungible-tokens/mutable-mpts)
- **Tutorials**:
  - [Send a Multi-Purpose Token (MPT)](/docs/tutorials/payments/send-an-mpt)
- **References**:
  - [MPTokenIssuance entry](/docs/references/protocol/ledger-data/ledger-entry-types/mptokenissuance)
  - [MPTokenIssuanceCreate transaction](/docs/references/protocol/transactions/types/mptokenissuancecreate)
  - [MPTokenIssuanceDestroy transaction](/docs/references/protocol/transactions/types/mptokenissuancedestroy)
  - [MPTokenIssuanceSet transaction](/docs/references/protocol/transactions/types/mptokenissuanceset)