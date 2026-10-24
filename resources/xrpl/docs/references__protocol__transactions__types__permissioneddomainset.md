# PermissionedDomainSet

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/permissioned_domain/PermissionedDomainSet.cpp)

Create a [permissioned domain](/docs/concepts/tokens/decentralized-exchange/permissioned-domains), or modify one that you own.

_Added by the [PermissionedDomains amendment](/resources/known-amendments#permissioneddomains). (Enabled: 2026-02-04)_

## Example  JSON

```json
{
  "TransactionType": "PermissionedDomainSet",
  "Account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
  "Fee": "10",
  "Sequence": 390,
  "AcceptedCredentials": [
    {
        "Credential": {
            "Issuer": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
            "CredentialType": "6D795F63726564656E7469616C"
        }
    }
  ]
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Required? | Description |
|  --- | --- | --- | --- | --- |
| `DomainID` | String - [Hash](/docs/references/protocol/data-types/basic-data-types#hashes) | UInt256 | No | The ledger entry ID of an existing permissioned domain to modify. If omitted, creates a new permissioned domain. |
| `AcceptedCredentials` | Array | Array | Yes | A list of 1 to 10 [**Accepted Credentials objects**](#acceptedcredentials-objects) that grant access to this domain. The list does not need to be sorted, but it cannot contain duplicates. When modifying an existing domain, this list replaces the existing list. |


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

There are no flags defined for  transactions.

## Error Cases

Besides errors that can occur for all transactions,  transactions can result in the following [transaction result codes](/docs/references/protocol/transactions/transaction-results):

| Error Code | Description |
|  --- | --- |
| `tecDIR_FULL` | The transaction would create a new PermissionedDomain, but the sender's owner directory is full.This error is effectively impossible to receive if [fixDirectoryLimit](/resources/known-amendments#fixdirectorylimit) (Enabled: 2025-12-18) is enabled. |
| `tecINSUFFICIENT_RESERVE` | The transaction would create a new PermissionedDomain, but the sender does not have enough XRP to meet the increased owner reserve. |
| `tecNO_ENTRY` | The transaction attempted to modify a Domain that does not exist. Check the `DomainID` field of the transaction. |
| `tecNO_ISSUER` | At least one of the issuers specified in the `AcceptedCredentials` field is does not exist in the XRP Ledger. Check the `Issuer` field of each member of the array. |
| `tecNO_PERMISSION` | The transaction attempted to modify an existing Domain, but the sender of the transaction is not the owner of the specified Domain. |
| `temDISABLED` | Either the `PermissionedDomains` amendment is not enabled, or the `Credentials` amendment is not enabled. |


## See Also

- [PermissionedDomain entry](/docs/references/protocol/ledger-data/ledger-entry-types/permissioneddomain)