# PaymentChannelCreate

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/payment_channel/PaymentChannelCreate.cpp)

Create a [payment channel](/docs/concepts/payment-types/payment-channels) and fund it. The address sending this transaction becomes the "source address" of the payment channel.

_Added by the [PayChan amendment](/resources/known-amendments#paychan). (Enabled: 2017-03-31)_

## Example  JSON

```json
{
    "Account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "TransactionType": "PaymentChannelCreate",
    "Amount": "10000",
    "Destination": "rsA2LpzuawewSBQXkiju3YQTMzW13pAAdW",
    "SettleDelay": 86400,
    "PublicKey": "32D2471DB72B27E3310F355BB33E339BF26F8392D5A93D3BC0FC3B566612DA0F0A",
    "CancelAfter": 533171558,
    "DestinationTag": 23480,
    "SourceTag": 11747
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Required? | Description |
|  --- | --- | --- | --- | --- |
| `Amount` | [Currency Amount](/docs/references/protocol/data-types/basic-data-types#specifying-currency-amounts) | Amount | Yes | Amount of XRP, in drops, to deduct from the sender's balance and set aside in this channel. While the channel is open, the XRP can only go to the `Destination` address. When the channel closes, any unclaimed XRP is returned to the source account's balance. |
| `Destination` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | AccountID | Yes | The account that can receive money from this channel. This is also known as the "destination address" for the channel. Cannot be the same as the sender (`Account`). |
| `SettleDelay` | Number | UInt32 | Yes | Amount of time, in seconds, the source address must wait before closing the channel if it has unclaimed funds. |
| `PublicKey` | String - Hexadecimal | Blob | Yes | The 33-byte public key of the key pair the source will use to sign claims against this channel. This can be any secp256k1 or Ed25519 public key. For more information on key pairs, see [Key Derivation](/docs/concepts/accounts/cryptographic-keys#key-derivation)  |
| `CancelAfter` | Number | UInt32 | No | The time, in [seconds since the Ripple Epoch](/docs/references/protocol/data-types/basic-data-types#specifying-time), when this channel expires. Any transaction that would modify the channel after this time closes the channel without otherwise affecting it. This value is immutable; the channel can be closed earlier than this time but cannot remain open after this time. |
| `DestinationTag` | Number | UInt32 | No | Arbitrary tag to further specify the destination for this payment channel, such as a hosted recipient at the destination address. |


If the `Destination` account is blocking incoming payment channels, the transaction fails with result code `tecNO_PERMISSION`. _Added by the [DisallowIncoming amendment](/resources/known-amendments#disallowincoming). (Enabled: 2023-08-21)_

## See Also

- [PayChannel entry](/docs/references/protocol/ledger-data/ledger-entry-types/paychannel)