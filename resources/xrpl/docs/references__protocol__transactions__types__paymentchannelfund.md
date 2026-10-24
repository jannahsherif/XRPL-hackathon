# PaymentChannelFund

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/payment_channel/PaymentChannelFund.cpp)

Add an additional amount to an open [payment channel](/docs/concepts/payment-types/payment-channels), and optionally update the expiration time of the channel. Only the source account of the channel can use this transaction.

_Added by the [PayChan amendment](/resources/known-amendments#paychan). (Enabled: 2017-03-31)_

## Example  JSON

```json
{
    "Account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "TransactionType": "PaymentChannelFund",
    "Channel": "C1AE6DDDEEC05CF2978C0BAD6FE302948E9533691DC749DCDD3B9E5992CA6198",
    "Amount": "200000",
    "Expiration": 543171558
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Required? | Description |
|  --- | --- | --- | --- | --- |
| `Channel` | String - Hexadecimal | UInt256 | Yes | The unique ID of the channel to fund. |
| `Amount` | [Currency Amount](/docs/references/protocol/data-types/basic-data-types#specifying-currency-amounts) | Amount | Yes | Amount of XRP, in drops, to add to the channel. Must be a positive amount of XRP. |
| `Expiration` | Number | UInt32 | No | New expiration time to set for the channel, in [seconds since the Ripple Epoch](/docs/references/protocol/data-types/basic-data-types#specifying-time). This must be later than either the current time plus the `SettleDelay` of the channel, or the existing `Expiration` of the channel. After the `Expiration` time, any transaction that would access the channel closes the channel without taking its normal action. (`Expiration` is separate from the channel's immutable `CancelAfter` time.) For more information, see the [PayChannel ledger entry type](/docs/references/protocol/ledger-data/ledger-entry-types/paychannel). |


## Error Cases

Besides errors that can occur for all transactions,  transactions can result in the following [transaction result codes](/docs/references/protocol/transactions/transaction-results):

| Error Code | Description |
|  --- | --- |
| `tecINSUFFICIENT_RESERVE` | The sending account has less XRP than the [reserve requirement](/docs/concepts/accounts/reserves). |
| `tecNO_DST` | The destination account of the channel has been deleted. This is only possible if the payment channel was created before the [fixPayChanRecipientOwnerDir amendment](/resources/known-amendments#fixpaychanrecipientownerdir) became enabled (on 2020-05-01). |
| `tecNO_ENTRY` | The Payment Channel identified by the `Channel` field does not exist. |
| `tecNO_PERMISSION` | The sender of the transaction is not the source address for the channel. |
| `tecUNFUNDED` | The sending account does not have enough XRP or fungible tokens to fund the channel with the requested amount and still meet the [reserve requirement](/docs/concepts/accounts/reserves). |
| `temBAD_AMOUNT` | The `Amount` field of the transaction is invalid. The amount must either be XRP or fungible tokens and cannot be zero or negative. |
| `temBAD_EXPIRATION` | The `Expiration` field is invalid. |


## See Also

- [PayChannel entry](/docs/references/protocol/ledger-data/ledger-entry-types/paychannel)