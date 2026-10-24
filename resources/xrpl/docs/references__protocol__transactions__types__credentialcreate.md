# CredentialCreate

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/credentials/CredentialCreate.cpp)

Provisionally issue a [credential](/docs/concepts/decentralized-storage/credentials) in the ledger. The credential is not valid until the subject of the credential accepts it with a [CredentialAccept transaction](/docs/references/protocol/transactions/types/credentialaccept).

_Added by the [Credentials amendment](/resources/known-amendments#credentials). (Enabled: 2025-09-04)_

## Example CredentialCreate JSON

```json
{
    "TransactionType" : "CredentialCreate",
    "Account": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
    "Subject": "rsUiUMpnrgxQp24dJYZDhmV4bE3aBtQyt8",
    "CredentialType": "6D795F63726564656E7469616C",
    "Fee": "10",
    "Flags": 0,
    "Sequence": 234200
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Required? | Description |
|  --- | --- | --- | --- | --- |
| `Subject` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | AccountID | Yes | The subject of the credential. |
| `CredentialType` | String - Hexadecimal | Blob | Yes | Arbitrary data defining the type of credential this entry represents. The minimum length is 1 byte and the maximum length is 64 bytes. |
| `Expiration` | Number | UInt32 | No | Time after which this credential expires, in [seconds since the Ripple Epoch](/docs/references/protocol/data-types/basic-data-types#specifying-time). |
| `URI` | String - Hexadecimal | Blob | No | Arbitrary additional data about the credential, such as the URL where users can look up an associated Verifiable Credential document. If present, the minimum length is 1 byte and the maximum is 256 bytes. |


The `Account` field (the sender) of the transaction is the issuer of the credential. It is possible for the issuer and the subject to be the same account.

## Error Cases

Besides errors that can occur for all transactions, CredentialCreate transactions can result in the following [transaction result codes](/docs/references/protocol/transactions/transaction-results):

| Error Code | Description |
|  --- | --- |
| `tecDUPLICATE` | A credential with the same subject, issuer, and credential type already exists in the ledger. |
| `tecEXPIRED` | The credential's expiration time is in the past. |
| `tecNO_TARGET` | The account specified in the `Subject` field is not a funded account in the ledger. |
| `temDISABLED` | The related amendment is not enabled. |
| `temINVALID_ACCOUNT_ID` | The provided `Subject` field is invalid. For example, it contains [ACCOUNT_ZERO](/docs/concepts/accounts/addresses#special-addresses). |
| `temINVALID_FLAG` | The transaction includes a [Flag](/docs/references/protocol/transactions/common-fields#flags-field) that does not exist, or includes a contradictory combination of flags. _Added by the [fixInvalidTxFlags amendment](/resources/known-amendments#fixinvalidtxflags). (Enabled: 2025-05-15)_ |


## See Also

- [Credential entry](/docs/references/protocol/ledger-data/ledger-entry-types/credential)