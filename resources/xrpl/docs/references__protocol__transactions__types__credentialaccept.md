# CredentialAccept

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/credentials/CredentialAccept.cpp)

Accept a [credential](/docs/concepts/decentralized-storage/credentials), which makes the credential valid. Only the subject of the credential can do this.

_Added by the [Credentials amendment](/resources/known-amendments#credentials). (Enabled: 2025-09-04)_

## Example CredentialAccept JSON

```json
{
    "TransactionType" : "CredentialAccept",
    "Account": "rsUiUMpnrgxQp24dJYZDhmV4bE3aBtQyt8",
    "Issuer": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
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
| `Issuer` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | AccountID | Yes | The address of the issuer that created the credential. |
| `CredentialType` | String | Blob | Yes | Arbitrary data defining the type of credential. The minimum size is 1 byte and the maximum is 64 bytes. |


The `Account` field (the sender of this transaction) must be the subject of the credential.

The combination of `Account`, `Issuer`, and `CredentialType` must match a `Credential` ledger entry that exists in the ledger and has not already been accepted; otherwise, the transaction fails.

## Error Cases

| Error Code | Description |
|  --- | --- |
| `tecDUPLICATE` | The specified credential has already been accepted. |
| `tecEXPIRED` | The specified credential has an expiration time in the past. (In this case, the transaction also deletes the expired credentials from the ledger.) |
| `tecNO_ENTRY` | The credential uniquely identified by the `Account`, `Issuer`, and `CredentialType` fields of the transaction does not exist in the ledger. |
| `temDISABLED` | The related amendment is not enabled. |
| `temINVALID_ACCOUNT_ID` | The provided `Issuer` field is invalid. For example, it contains [ACCOUNT_ZERO](/docs/concepts/accounts/addresses#special-addresses). |
| `temINVALID_FLAG` | The transaction includes a [Flag](/docs/references/protocol/transactions/common-fields#flags-field) that does not exist, or includes a contradictory combination of flags. _Added by the [fixInvalidTxFlags amendment](/resources/known-amendments#fixinvalidtxflags). (Enabled: 2025-05-15)_ |


## See Also

- [Credential entry](/docs/references/protocol/ledger-data/ledger-entry-types/credential)