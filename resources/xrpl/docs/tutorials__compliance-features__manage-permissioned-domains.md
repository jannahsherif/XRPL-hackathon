# Manage Permissioned Domains

This tutorial shows how to create a [permissioned domain](/docs/concepts/tokens/decentralized-exchange/permissioned-domains), which can be used to grant access to specific other features like [Permissioned DEXes](/docs/concepts/tokens/decentralized-exchange/permissioned-dexes) and [Single Asset Vaults](/docs/concepts/tokens/single-asset-vaults). It also shows how to modify a domain to update its set of accepted credentials and how to delete a permissioned domain.

_Added by the [PermissionedDomains amendment](/resources/known-amendments#permissioneddomains). (Enabled: 2026-02-04)_

## Goals

By following this tutorial, you should learn how to:

- Create a permissioned domain.
- Modify or delete a permissioned domain.


## Prerequisites

To complete this tutorial, you should:

- Have a basic understanding of the XRP Ledger, including what [permissioned domains](/docs/concepts/tokens/decentralized-exchange/permissioned-domains) and [credentials](/docs/concepts/decentralized-storage/credentials) are.
- Have an [XRP Ledger client library](/docs/references/client-libraries), such as **xrpl.js**, installed.


Tip
This tutorial doesn't cover issuing and accepting credentials, which aren't necessary for creating and managing a permissioned domain. Valid credentials *are* necessary for actually using something that's gated by a permissioned domain. For examples of issuing and accepting credentials, see:

- [Manage Credentials](/docs/tutorials/compliance-features/manage-credentials)
- [Build a Credential Issuing Service in JavaScript](/docs/tutorials/sample-apps/credential-issuing-service-in-javascript) or [in Python](/docs/tutorials/sample-apps/credential-issuing-service-in-python)


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

To get started, import the client library and instantiate an API client. You also need an issuer address and credential type for the credential that will grant access to your domain. The credentials themselves don't have to be issued yet; you can do that separately before or after setting up the domain, or you can rely on credentials issued by a third party.

JavaScript
```js
import xrpl from 'xrpl'
import { stringToHex } from '@xrplf/isomorphic/dist/utils/index.js'
import fs from 'fs'

// Get issuer wallet and define constants -------------------------------------
const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
await client.connect()
console.log('Getting a new account from the faucet.')
const { wallet } = await client.fundWallet()
console.log(`Account funded:
  Address: ${wallet.address}
  Seed: ${wallet.seed}
`)

const issuerAddress = wallet.address // Can also use a third-party issuer
const credentialType = stringToHex("my-credential")
```

Python
```py
#!/usr/bin/env python
import json
import sys

from xrpl.clients import JsonRpcClient
from xrpl.models.transactions import PermissionedDomainSet
from xrpl.models.transactions.deposit_preauth import Credential
from xrpl.transaction import submit_and_wait
from xrpl.utils import str_to_hex
from xrpl.wallet import generate_faucet_wallet

# Get issuer wallet and define constants ---------------------------------------
client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
wallet = generate_faucet_wallet(client, debug=True)

issuer_address = wallet.address # Can also use a different credential issuer
credential_type = str_to_hex("my-credential")
```

### 3. Send PermissionedDomainSet transaction

To create a permissioned domain, send a [PermissionedDomainSet transaction](/docs/references/protocol/transactions/types/permissioneddomainset) omitting the `DomainID` field. In the `AcceptedCredentials` field, specify the credentials that grant access to the domain.

JavaScript
```js
// Create a domain ------------------------------------------------------------
const pDomainSet = {
  TransactionType: "PermissionedDomainSet",
  Account: wallet.address,
  AcceptedCredentials: [
    {
      Credential: {
        Issuer: issuerAddress,
        CredentialType: credentialType
      }
    }
  ]
}

console.log('Submitting transaction', JSON.stringify(pDomainSet, null, 2))
const response = await client.submitAndWait(pDomainSet, { wallet, autofill: true})
console.log(response)
const resultCode = response.result.meta.TransactionResult
if (resultCode !== 'tesSUCCESS') {
  console.error(`PermissionedDomainSet failed with code ${resultCode}`)
  client.disconnect()
  process.exit(2)
}

console.log('Successfully created permissioned domain.')
```

Python
```py
# Create a domain --------------------------------------------------------------
p_domain_set = PermissionedDomainSet(
    account=wallet.address,
    accepted_credentials=[
        Credential(
            issuer=issuer_address,
            credential_type=credential_type
        )
    ]
)
print("Submitting transaction", p_domain_set)
pds_response = submit_and_wait(p_domain_set, client=client, wallet=wallet)
if pds_response.status != "success":
    print("Transaction submission failed:", pds_response)
    sys.exit(1)
print(json.dumps(pds_response.result, indent=2))
result_code = pds_response.result["meta"]["TransactionResult"]
if result_code != "tesSUCCESS":
    print("Transaction failed with result code", result_code)
    sys.exit(2)
print("Successfully created permissioned domain.")
```

### 4. Find the Domain ID

To identify the permissioned domain later, you need its Domain ID. It is possible to calculate this using the [Permissioned Domain ID format](/docs/references/protocol/ledger-data/ledger-entry-types/permissioneddomain#permissioneddomain-id-format), but it is often easier to find it in the metadata of the transaction that created the domain. Look through the [transaction metadata](/docs/references/protocol/transactions/metadata) for a `CreatedNode` of type `PermissionedDomain`. The `LedgerIndex` field of that entry is the Domain ID.

JavaScript
```js
// Find Domain ID in metadata -------------------------------------------------
let domainID
for (const modifiedNode of response.result.meta.AffectedNodes) {
  if (modifiedNode.CreatedNode?.LedgerEntryType === 'PermissionedDomain') {
    domainID = modifiedNode.CreatedNode.LedgerIndex
    break
  }
}
if (!domainID) {
  console.error("Couldn't find a created PermissionedDomain in transaction "+
    "metadata. This is not typical.")
  client.disconnect()
  process.exit(3)
}
console.log('Domain ID of created domain:', domainID)

client.disconnect()
```

Python
```py
# Find Domain ID in metadata ---------------------------------------------------
# Look for a created ledger entry of type PermissionedDomain and get 
# its ledger entry ID from the AffectedNodes part of the metadata.
#
# Note, an alternative way to get the Domain ID is to calculate it as the
# SHA-512Half of the PermissionedDomain space key, owner's account ID, and the
# sequence number of the transaction that created it.

domain_id = None
for modified_node in pds_response.result["meta"]["AffectedNodes"]:
    if "CreatedNode" in modified_node.keys():
        if modified_node["CreatedNode"]["LedgerEntryType"] == "PermissionedDomain":
            domain_id = modified_node["CreatedNode"]["LedgerIndex"]
            break
if not domain_id:
    print("Couldn't find a created PermissionedDomain in transaction metadata."
          " This is not typical.")
    sys.exit(3)
print("Domain ID of created domain:", domain_id)
```

You need to know the Domain ID to modify or delete the domain, as well as when setting up a [permissioned DEX](/docs/concepts/tokens/decentralized-exchange/permissioned-dexes) or anything else that uses the permissioned domain for access.

Note
The sample code saves the domain owner account's address and seed, along with the configured issuer address and generated domain ID, to a JSON file for use with other sample scripts. Saving secret keys in plaintext on disk is not ideal from a security perspective, but it's acceptable for Testnet accounts with no real-world value. You should use a more robust system when working with Mainnet accounts.

## Other Tasks

Other tasks you might do with a permissioned domain include modifying it to change the set of accepted credentials, or deleting it. The code samples below omit the redundant setup steps for these tasks, but you can see the full source code for specifics.

### Modify a Permissioned Domain

To modify an existing domain, send a [PermissionedDomainSet transaction](/docs/references/protocol/transactions/types/permissioneddomainset) like the one that created it, except this time you actually *do* specify the `DomainID` field.

JavaScript
```js
// Modify a permissioned domain -----------------------------------------------
// To demonstrate updating the domain, this tutorial uses a different credential
// type (issued by the same issuer, unless you modified setup.json)
const credentialType = stringToHex("new-credential-type")

const pDomainSet = {
  TransactionType: "PermissionedDomainSet",
  Account: wallet.address,
  DomainID: domainID,
  AcceptedCredentials: [
    {
      Credential: {
        Issuer: issuerAddress,
        CredentialType: credentialType
      }
    }
  ]
}
console.log('Submitting transaction', JSON.stringify(pDomainSet, null, 2))
const response = await client.submitAndWait(pDomainSet, { wallet, autofill: true})
console.log(response)
const resultCode = response.result.meta.TransactionResult
if (resultCode !== 'tesSUCCESS') {
  console.error(`PermissionedDomainSet failed with code ${resultCode}`)
  client.disconnect()
  process.exit(3)
}
console.log('Successfully modified permissioned domain.')
client.disconnect()
```

Python
```py
# Modify a permissioned domain ------------------------------------------------
# To demonstrate updating the domain, this tutorial uses a different credential
# type (issued by the same issuer, unless you modified setup.json)
credential_type = str_to_hex("new-credential-type")

p_domain_set = PermissionedDomainSet(
    account=wallet.address,
    domain_id=domain_id,
    accepted_credentials=[
        Credential(
            issuer=issuer_address,
            credential_type=credential_type
        )
    ]
)
print("Submitting transaction", p_domain_set)
pds_response = submit_and_wait(p_domain_set, client=client, wallet=wallet)
if pds_response.status != "success":
    print("Transaction submission failed:", pds_response)
    sys.exit(1)
print(json.dumps(pds_response.result, indent=2))
result_code = pds_response.result["meta"]["TransactionResult"]
if result_code != "tesSUCCESS":
    print("Transaction failed with result code", result_code)
    sys.exit(3)
print("Successfully modified permissioned domain.")
```

### Delete a Permissioned Domain

To delete a permissioned domain that you own, send a [PermissionedDomainDelete transaction](/docs/references/protocol/transactions/types/permissioneddomaindelete) with the `DomainID` of the domain to delete.

JavaScript
```js
// Delete a permissioned domain -----------------------------------------------
const pDomainDel = {
  TransactionType: "PermissionedDomainDelete",
  Account: wallet.address,
  DomainID: domainID
}
console.log('Submitting transaction', JSON.stringify(pDomainDel, null, 2))
const response = await client.submitAndWait(pDomainDel, { wallet, autofill: true})
console.log(response)
const resultCode = response.result.meta.TransactionResult
if (resultCode !== 'tesSUCCESS') {
  console.error(`PermissionedDomainDelete failed with code ${resultCode}`)
  client.disconnect()
  process.exit(3)
}
console.log('Successfully deleted permissioned domain.')
client.disconnect()
```

Python
Make sure to import the correct transaction type first.

```py
from xrpl.models.transactions import PermissionedDomainDelete
```

```py
# Delete a permissioned domain ------------------------------------------------
p_domain_del = PermissionedDomainDelete(
    account=wallet.address,
    domain_id=domain_id
)
print("Submitting transaction", p_domain_del)
pdd_response = submit_and_wait(p_domain_del, client=client, wallet=wallet)
if pdd_response.status != "success":
    print("Transaction submission failed:", pdd_response)
    sys.exit(1)
print(json.dumps(pdd_response.result, indent=2))
result_code = pdd_response.result["meta"]["TransactionResult"]
if result_code != "tesSUCCESS":
    print("Transaction failed with result code", result_code)
    sys.exit(3)
print("Successfully deleted permissioned domain.")
```

## See Also

- **Concepts:**
  - [Credentials](/docs/concepts/decentralized-storage/credentials)
  - [Permissioned Domains](/docs/concepts/tokens/decentralized-exchange/permissioned-domains)
  - [Permissioned DEXes](/docs/concepts/tokens/decentralized-exchange/permissioned-dexes)
  - [Single Asset Vaults](/docs/concepts/tokens/single-asset-vaults)
- **Tutorials:**
  - [Manage Credentials](/docs/tutorials/compliance-features/manage-credentials)
  - [Build a Credential Issuing Service in JavaScript](/docs/tutorials/sample-apps/credential-issuing-service-in-javascript)
  - [Build a Credential Issuing Service in Python](/docs/tutorials/sample-apps/credential-issuing-service-in-python)
  - [Trade in the Decentralized Exchange](/docs/tutorials/defi/dex/trade-in-the-decentralized-exchange)
- **References:**
  - [PermissionedDomainSet transaction](/docs/references/protocol/transactions/types/permissioneddomainset)
  - [PermissionedDomainDelete transaction](/docs/references/protocol/transactions/types/permissioneddomaindelete)
  - [PermissionedDomain entry](/docs/references/protocol/ledger-data/ledger-entry-types/permissioneddomain)