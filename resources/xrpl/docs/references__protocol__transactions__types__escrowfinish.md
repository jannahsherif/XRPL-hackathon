# EscrowFinish

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/escrow/EscrowFinish.cpp)

Deliver funds from an [escrow](/docs/concepts/payment-types/escrow) to the recipient.

## Example  JSON

```json
{
    "Account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "TransactionType": "EscrowFinish",
    "Owner": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "OfferSequence": 7,
    "Condition": "A0258020E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855810100",
    "Fulfillment": "A0028000"
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Required? | Description |
|  --- | --- | --- | --- | --- |
| `Owner` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | AccountID | Yes | The source account that funded the escrow. |
| `OfferSequence` | Number | UInt32 | Yes | Transaction sequence of [EscrowCreate transaction](/docs/references/protocol/transactions/types/escrowcreate) that created the escrow to finish. |
| `Condition` | String - Hexadecimal | Blob | No | The (previously-supplied) [PREIMAGE-SHA-256 crypto-condition](https://tools.ietf.org/html/draft-thomas-crypto-conditions-02#section-8.1) of the escrow. |
| `CredentialIDs` | Array of Strings | Vector256 | No | Set of Credentials to authorize a deposit made by this transaction. Each member of the array must be the ledger entry ID of a Credential entry in the ledger. For details, see [Credential IDs](/docs/references/protocol/transactions/types/payment#credential-ids). |
| `Fulfillment` | String - Hexadecimal | Blob | No | The [PREIMAGE-SHA-256 crypto-condition fulfillment](https://tools.ietf.org/html/draft-thomas-crypto-conditions-02#section-8.1.4) matching the escrow's `Condition`. |


Any account may submit an EscrowFinish transaction.

- If the escrow has a `FinishAfter` time, you cannot execute it before this time. Specifically, if the corresponding [EscrowCreate transaction](/docs/references/protocol/transactions/types/escrowcreate) specified a `FinishAfter` time that is after the close time of the most recently-closed ledger, the EscrowFinish transaction fails.
- If the escrow has a `Condition`, you cannot execute it unless you provide a matching `Fulfillment` for the condition.
- You cannot execute an escrow after it has expired. Specifically, if the corresponding [EscrowCreate transaction](/docs/references/protocol/transactions/types/escrowcreate) specified a `CancelAfter` time that is before the close time of the most recently-closed ledger, the EscrowFinish transaction fails.


The minimum [transaction cost](/docs/concepts/transactions/transaction-cost) to submit an EscrowFinish transaction increases if it contains a fulfillment. If the transaction has no fulfillment, the transaction cost is the standard ledger base fee, typically 10 drops. If the transaction contains a fulfillment, the transaction cost is 330 [drops of XRP](/docs/references/protocol/data-types/basic-data-types#specifying-currency-amounts) plus another 10 drops for every 16 bytes in size of the preimage. Should the validators vote to increase or lower the base fee, the cost per 16 bytes is adjusted accordingly.

In [non-production networks](/docs/concepts/networks-and-servers/parallel-networks), it may be possible [to delete](/docs/concepts/accounts/deleting-accounts) the destination account of a pending escrow. In this case, an attempt to finish the escrow fails with the result `tecNO_TARGET`, but the escrow object remains unless it has expired normally. If another payment re-creates the destination account, the escrow can be finished successfully. The destination account of an escrow can only be deleted if the escrow was created before the [fix1523 amendment](/resources/known-amendments#fix1523) became enabled. No such escrows exist in the production XRP Ledger, so this edge case is not possible on the production XRP Ledger. This edge case is also not possible in test networks that enable both fix1523 and Escrow amendments at the same time, which is the default when you [start a new genesis ledger](/docs/infrastructure/testing-and-auditing/start-a-new-genesis-ledger-in-stand-alone-mode).

## Error Cases

Besides errors that can occur for all transactions,  transactions can result in the following [transaction result codes](/docs/references/protocol/transactions/transaction-results):

| Error Code | Description |
|  --- | --- |
| `tecNO_AUTH` | The transaction failed because authorization requirements were not met. For example, the issuer requires authorization and the destination is not authorized. |
| `tecNO_LINE` | The destination account does not have a trust line with the issuer. For Trust Line Tokens only. |
| `tecNO_ENTRY` | The destination account does not hold the MPT. |
| `tecINSUFFICIENT_RESERVE` | Unable to create a trust line or MPToken due to lack of reserves. |
| `tecFROZEN` | The token is deep frozen (Trust Line Tokens) or locked (for MPTs). |
| `tecNO_LINE_INSUF_RESERVE` | The destination doesn't have a trust line with the issuer nor enough reserve to create one. |


## See Also

- [Escrow entry](/docs/references/protocol/ledger-data/ledger-entry-types/escrow)