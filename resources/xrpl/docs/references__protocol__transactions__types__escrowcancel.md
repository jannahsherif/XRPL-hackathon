# EscrowCancel

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/escrow/EscrowCancel.cpp)

Return funds from an expired [escrow](/docs/concepts/payment-types/escrow) to its sender.

## Example  JSON

```json
{
    "Account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "TransactionType": "EscrowCancel",
    "Owner": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "OfferSequence": 7
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Description |
|  --- | --- | --- | --- |
| `Owner` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | AccountID | The account that funded the escrow payment. |
| `OfferSequence` | Number | UInt32 | Transaction sequence (or [Ticket](/docs/concepts/accounts/tickets) number) of [EscrowCreate transaction](/docs/references/protocol/transactions/types/escrowcreate) that created the escrow to cancel. |


Any account may submit an EscrowCancel transaction.

* If the corresponding [EscrowCreate transaction](/docs/references/protocol/transactions/types/escrowcreate) did not specify a `CancelAfter` time, the EscrowCancel transaction fails.
* Otherwise the EscrowCancel transaction fails if the `CancelAfter` time is after the close time of the most recently-closed ledger.


## Error Cases

Besides errors that can occur for all transactions,  transactions can result in the following [transaction result codes](/docs/references/protocol/transactions/transaction-results):

| Error Code | Description |
|  --- | --- |
| `tecNO_AUTH` | The transaction failed because authorization requirements were not met. For example, the issuer requires authorization and the sender is not authorized. |
| `tecNO_LINE` | The sender does not have a trust line with the issuer. For Trust Line Tokens only. |
| `tecNO_ENTRY` | The sender does not hold the MPT. |
| `tecINSUFFICIENT_RESERVE` | Unable to create a trust line or MPToken due to lack of reserves. |
| `tecNO_LINE_INSUF_RESERVE` | The sender doesn't have a trust line with the issuer nor enough reserve to create one. |


## See Also

- [Escrow entry](/docs/references/protocol/ledger-data/ledger-entry-types/escrow)