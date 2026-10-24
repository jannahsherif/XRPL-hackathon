# EscrowCreate

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/escrow/EscrowCreate.cpp)

Set aside funds in an [escrow](/docs/concepts/payment-types/escrow) that delivers them to a predetermined recipient when certain conditions are met. If the escrow has an expiration, the funds can also be returned to the sender after it expires.

Note
To escrow fungible tokens you must take note of the following:

- Trust Line Tokens must have the **Allow Trust Line Locking** flag enabled on the issuer's account.
- Multi-Purpose-Tokens (MPTs) must have both the **Can Escrow** and **Can Transfer** flags enabled.
- If the token requires **authorization**, both sender and recipient must be pre-authorized by the issuer.


_Updated by the [TokenEscrow amendment](/resources/known-amendments#tokenescrow). (Enabled: 2026-02-12)_

## Example  JSON

```json
{
    "Account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "TransactionType": "EscrowCreate",
    "Amount": "10000",
    "Destination": "rsA2LpzuawewSBQXkiju3YQTMzW13pAAdW",
    "CancelAfter": 533257958,
    "FinishAfter": 533171558,
    "Condition": "A0258020E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855810100",
    "DestinationTag": 23480,
    "SourceTag": 11747
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Description |
|  --- | --- | --- | --- |
| `Amount` | Object or String | Amount | Amount of XRP, in drops, or fungible tokens to deduct from the sender's balance and escrow. Once escrowed, the payment can either go to the `Destination` address (after the `FinishAfter` time) or be returned to the sender (after the `CancelAfter` time). _Updated by the [TokenEscrow amendment](/resources/known-amendments#tokenescrow). (Enabled: 2026-02-12)_ |
| `Destination` | String | AccountID | Address to receive escrowed funds. |
| `CancelAfter` | Number | UInt32 | *(Optional)* The time, in [seconds since the Ripple Epoch](/docs/references/protocol/data-types/basic-data-types#specifying-time), when this escrow expires. This value is immutable; the funds can only be returned to the sender after this time. |
| `FinishAfter` | Number | UInt32 | *(Optional)* The time, in [seconds since the Ripple Epoch](/docs/references/protocol/data-types/basic-data-types#specifying-time), when the escrowed funds can be released to the recipient. This value is immutable, and the funds can't be accessed until this time. |
| `Condition` | String | Blob | *(Optional)* Hex value representing a [PREIMAGE-SHA-256 crypto-condition](https://tools.ietf.org/html/draft-thomas-crypto-conditions-02#section-8.1). The funds can only be delivered to the recipient if this condition is fulfilled. If the condition is not fulfilled before the expiration time specified in the `CancelAfter` field, the funds can only revert to the sender. |
| `DestinationTag` | Number | UInt32 | *(Optional)* Arbitrary tag to further specify the destination for this escrowed payment, such as a hosted recipient at the destination address. |


You must specify one of the following combinations of fields:

| Summary | `FinishAfter` | `Condition` | `CancelAfter` |
|  --- | --- | --- | --- |
| Time-based (XRP only) | ✅ |  |  |
| Time-based with expiration | ✅ |  | ✅ |
| Timed conditional (XRP only) | ✅ | ✅ |  |
| Timed conditional with expiration | ✅ | ✅ | ✅ |
| Conditional with expiration |  | ✅ | ✅ |


It is not possible to create a conditional escrow with no expiration, but you can specify an expiration that is very far in the future.

## Error Cases

Besides errors that can occur for all transactions,  transactions can result in the following [transaction result codes](/docs/references/protocol/transactions/transaction-results):

| Error Code | Description |
|  --- | --- |
| `tecNO_PERMISSION` | The transaction failed because the necessary permissions for token escrow are not in place. For example, the issuer hasn't enabled the Allow Trust Line Locking flag for a Trust Line Token. |
| `tecNO_AUTH` | The transaction failed because authorization requirements for the token were not met. For example, the sender lacks authorization when creating the escrow. |
| `tecUNFUNDED` | The sender lacks sufficient spendable balance. For Trust Line Tokens, this means the sender's trust line with the issuer has insufficient available balance. For XRP escrows, this means the sender doesn't have enough XRP. |
| `tecOBJECT_NOT_FOUND` | The sender does not hold the MPT. |
| `tecFROZEN` | The token is frozen (for Trust Line Tokens) or locked (for MPTs) for the sender. |


## See Also

- [Escrow entry](/docs/references/protocol/ledger-data/ledger-entry-types/escrow)