# PermissionedDomain

[[Source]](https://github.com/XRPLF/rippled/blob/a5d238e7d4fa6ef2b539b759d58744d0a1c33c0c/include/xrpl/protocol/detail/ledger_entries.macro#L453-L460)

A `PermissionedDomain` ledger entry describes a single [permissioned domain](/docs/concepts/tokens/decentralized-exchange/permissioned-domains) instance. You can create a permissioned domain by sending a [PermissionedDomainSet transaction](/docs/references/protocol/transactions/types/permissioneddomainset).

_Added by the [PermissionedDomains amendment](/resources/known-amendments#permissioneddomains). (Enabled: 2026-02-04)_

## Example  JSON

```json
{
  "LedgerEntryType": "PermissionedDomain",
  "Fee": "10",
  "Flags": 0,
  "Owner": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
  "OwnerNode": "0000000000000000",
  "Sequence": 390,
  "AcceptedCredentials": [
    {
        "Credential": {
            "Issuer": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
            "CredentialType": "6D795F63726564656E7469616C"
        }
    }
  ],
  "PreviousTxnID": "E7E3F2BBAAF48CF893896E48DC4A02BDA0C747B198D5AE18BC3D7567EE64B904",
  "PreviousTxnLgrSeq": 8734523,
  "index": "3DFA1DDEA27AF7E466DE395CCB16158E07ECA6BC4EB5580F75EBD39DE833645F"
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/ledger-data/common-fields),  entries have the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Required? | Description |
|  --- | --- | --- | --- | --- |
| `AcceptedCredentials` | Array | Array | Yes | A list of 1 to 10 [Credential](#acceptedcredentials-objects) objects that grant access to this domain. The array is stored sorted by issuer. |
| `Owner` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | AccountID | Yes | The address of the account that owns this domain. |
| `OwnerNode` | String | UInt64 | Yes | A hint indicating which page of the owner directory links to this entry, in case the directory consists of multiple pages. |
| `PreviousTxnID` | String - [Hash](/docs/references/protocol/data-types/basic-data-types#hashes) | UInt256 | Yes | The identifying hash of the transaction that most recently modified this entry. |
| `PreviousTxnLgrSeq` | Number | UInt32 | Yes | The [index of the ledger](/docs/references/protocol/data-types/basic-data-types#ledger-index) that contains the transaction that most recently modified this object. |
| `Sequence` | Number | UInt32 | Yes | The `Sequence` value of the transaction that created this entry. |


### AcceptedCredentials Objects

Each member of the `AcceptedCredentials` array is an inner object named `Credential` with the following nested fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Required? | Description |
|  --- | --- | --- | --- | --- |
| `Issuer` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | AccountID | Yes | The issuer of the credential. |
| `CredentialType` | String | Blob | Yes | The type of credential, as hexadecimal. This is an arbitrary value from 1 to 64 bytes that the issuer sets when they issue a credential. |


Note
In the usual JSON format, inner objects are wrapped in an object with one field, whose name defines the inner object type. In this case, the wrapping field is named `Credential`. For example:

```json
"AcceptedCredentials": [
    {
        "Credential": {
            "Issuer": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
            "CredentialType": "6D795F63726564656E7469616C"
        }
    },
    // ... additional Credential inner objects ...
]
```

##  Flags

There are no flags defined for  entries.

##  Reserve

Each  entry counts as 1 item toward its owner's reserve requirement.

A  entry is a deletion blocker, meaning an account cannot be deleted if it owns any  entries.

##  ID Format

The ID of a  entry is the [SHA-512Half](/docs/references/protocol/data-types/basic-data-types#hashes) of the following values, concatenated in order:

1. The  space key (`0x0082`).
2. The AccountID of the 's owner.
3. The Sequence number of the transaction that created the .


## See Also

- **Transactions:**
  - [PermissionedDomainDelete transaction](/docs/references/protocol/transactions/types/permissioneddomaindelete)
  - [PermissionedDomainSet transaction](/docs/references/protocol/transactions/types/permissioneddomainset)