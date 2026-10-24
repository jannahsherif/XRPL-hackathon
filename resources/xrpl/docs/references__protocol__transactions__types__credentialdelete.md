# CredentialDelete

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/credentials/CredentialDelete.cpp)

Remove a [credential](/docs/concepts/decentralized-storage/credentials) from the ledger, effectively revoking it. Users may also want to delete an unwanted credential to reduce their [reserve requirement](/docs/concepts/accounts/reserves).

_Added by the [Credentials amendment](/resources/known-amendments#credentials). (Enabled: 2025-09-04)_

## Example CredentialDelete JSON

```json
{
    "TransactionType" : "CredentialDelete",
    "Account": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
    "Subject": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "CredentialType": "6D795F63726564656E7469616C",
    "Fee": "10",
    "Flags": 0,
    "Sequence": 234203
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Required? | Description |
|  --- | --- | --- | --- | --- |
| `CredentialType` | String - Hexadecimal | Blob | Yes | Arbitrary data defining the type of credential to delete. The minimum length is 1 byte and the maximum length is 256 bytes. |
| `Subject` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | AccountID | No | The subject of the credential to delete. If omitted, use the `Account` (sender of the transaction) as the subject of the credential. |
| `Issuer` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | AccountID | No | The issuer of the credential to delete. If omitted, use the `Account` (sender of the transaction) as the issuer of the credential. |


You must provide the `Subject` field, `Issuer` field, or both.

This transaction looks for a [Credential ledger entry](/docs/references/protocol/ledger-data/ledger-entry-types/credential) with the specified subject, issuer, and credential type, and deletes that entry if the sender of the transaction has permission to. The holder or issuer of a credential can delete it at any time. If the credential is expired, anyone can delete it.

## Error Cases

| Error Code | Description |
|  --- | --- |
| `temDISABLED` | The related amendment is not enabled. |
| `temINVALID_ACCOUNT_ID` | A provided `Subject` or `Issuer` field is invalid. For example, it contains [ACCOUNT_ZERO](/docs/concepts/accounts/addresses#special-addresses). |
| `tecNO_PERMISSION` | The sender is neither the issuer nor subject of the credential, and the credential is not expired. |
| `tecNO_ENTRY` | The specified credential does not exist in the ledger. |
| `temINVALID_FLAG` | The transaction includes a [Flag](/docs/references/protocol/transactions/common-fields#flags-field) that does not exist, or includes a contradictory combination of flags. _Added by the [fixInvalidTxFlags amendment](/resources/known-amendments#fixinvalidtxflags). (Enabled: 2025-05-15)_ |


## See Also

- [Credential entry](/docs/references/protocol/ledger-data/ledger-entry-types/credential)