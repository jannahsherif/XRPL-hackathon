# MPTokenIssuanceDestroy

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/token/MPTokenIssuanceDestroy.cpp)

Delete a [Multi-purpose Token (MPT)](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens) issuance. Only the issuer can delete an MPT issuance, and only if there are no holders of the MPT.

_Added by the [MPTokensV1 amendment](/resources/known-amendments#mptokensv1). (Enabled: 2025-10-01)_

## Example MPTokenIssuanceDestroy JSON

```json
{
    "TransactionType": "MPTokenIssuanceDestroy",
    "Account": "rNFta7UKwcoiCpxEYbhH2v92numE3cceB6",
    "MPTokenIssuanceID": "05EECEBC97A7D635DE2393068691A015FED5A89AD203F5AA",
    "Fee": "10",
    "Flags": 0,
    "Sequence": 99536573
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Description |
|  --- | --- | --- | --- |
| `MPTokenIssuanceID` | String | UInt192 | Identifies the `MPTokenIssuance` object to be removed by the transaction. |


## See Also

- [MPTokenIssuance entry](/docs/references/protocol/ledger-data/ledger-entry-types/mptokenissuance)