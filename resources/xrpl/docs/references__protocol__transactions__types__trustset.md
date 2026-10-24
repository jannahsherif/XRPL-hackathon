# TrustSet

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/token/TrustSet.cpp)

Create or modify a [trust line](/docs/concepts/tokens/fungible-tokens) linking two accounts.

## Example  JSON

```json
{
    "TransactionType": "TrustSet",
    "Account": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
    "Fee": "12",
    "Flags": 262144,
    "LastLedgerSequence": 8007750,
    "LimitAmount": {
      "currency": "USD",
      "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
      "value": "100"
    },
    "Sequence": 12
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Description |
|  --- | --- | --- | --- |
| `LimitAmount` | Object | Amount | Object defining the trust line to create or modify, in the format of a [Currency Amount](/docs/references/protocol/data-types/basic-data-types#specifying-currency-amounts). |
| `LimitAmount`.`currency` | String | (Amount.currency) | The currency for this trust line. Use a three-letter [ISO 4217 Currency Code](https://www.xe.com/iso4217.php) such as `USD` or a 160-bit hex value for a non-standard currency code such as `RLUSD`. See [currency formats](/docs/references/protocol/data-types/currency-formats) for more information. "XRP" is invalid. |
| `LimitAmount`.`value` | String | (Amount.value) | Quoted decimal representation of the limit to set on this trust line. |
| `LimitAmount`.`issuer` | String | (Amount.issuer) | The address of the account to extend trust to. |
| `QualityIn` | Number | UInt32 | *(Optional)* Value incoming balances on this trust line at the ratio of this number per 1,000,000,000 units. A value of `0` is shorthand for treating balances at face value. For example, if you set the value to 10,000,000, 1% of incoming funds remain with the sender. If an account sends 100 currency, the sender retains 1 currency unit and the destination receives 99 units. This option is included for parity: in practice, you are much more likely to set a `QualityOut` value. Note that this fee is separate and independent from token transfer fees. |
| `QualityOut` | Number | UInt32 | *(Optional)* Value outgoing balances on this trust line at the ratio of this number per 1,000,000,000 units. A value of `0` is shorthand for treating balances at face value.  For example, if you set the value to 10,000,000, 1% of outgoing funds would remain with the issuer.  If the sender sends 100 currency units, the issuer retains 1 currency unit and the destination receives 99 units. Note that this fee is separate and independent from token transfer fees. |


If the account specified in `LimitAmount.issuer` is blocking incoming trust lines, the transaction fails with the result code `tecNO_PERMISSION`. _Added by the [DisallowIncoming amendment](/resources/known-amendments#disallowincoming). (Enabled: 2023-08-21)_

Creating a trust line that already exists returns the result code `tecDUPLICATE` instead of succeeding. _The [fixCleanup3_4_0 amendment](/resources/known-amendments#fixcleanup3_4_0) updates this. (Open for Voting: 0.00%)_

## TrustSet Flags

Transactions of the TrustSet type support additional values in the [`Flags` field](/docs/references/protocol/transactions/common-fields#flags-field), as follows:

| Flag Name | Hex Value | Decimal Value | Description |
|  --- | --- | --- | --- |
| `tfSetfAuth` | `0x00010000` | 65536 | Authorize the other party to hold [currency issued by this account](/docs/concepts/tokens). (No effect unless using the [`asfRequireAuth` AccountSet flag](/docs/references/protocol/transactions/types/accountset#accountset-flags).) Cannot be unset. |
| `tfSetNoRipple` | `0x00020000` | 131072 | Enable the No Ripple flag, which blocks [rippling](/docs/concepts/tokens/fungible-tokens/rippling) between two trust lines of the same currency if this flag is enabled on both. |
| `tfClearNoRipple` | `0x00040000` | 262144 | Disable the No Ripple flag, allowing [rippling](/docs/concepts/tokens/fungible-tokens/rippling) on this trust line. |
| `tfSetFreeze` | `0x00100000` | 1048576 | [Freeze](/docs/concepts/tokens/fungible-tokens/freezes) the trust line. |
| `tfClearFreeze` | `0x00200000` | 2097152 | [Unfreeze](/docs/concepts/tokens/fungible-tokens/freezes) the trust line. |
| `tfSetDeepFreeze` | `0x00400000` | 4194304 | [Deep Freeze](/docs/concepts/tokens/fungible-tokens/freezes#deep-freeze) the trust line. |
| `tfClearDeepFreeze` | `0x00800000` | 8388608 | Clear the [Deep Freeze](/docs/concepts/tokens/fungible-tokens/freezes#deep-freeze) on the trust line. |


If a transaction tries to enable No Ripple but cannot, it fails with the result code `tecNO_PERMISSION`. Before the [fix1578 amendment](/resources/known-amendments#fix1578) became enabled, such a transaction would result in `tesSUCCESS` (making any other changes it could) instead.

The Auth flag of a trust line does not determine whether the trust line counts towards its owner's XRP reserve requirement. An issuer can pre-authorize a trust line with the `tfSetfAuth` flag only, even if the limit and balance of the trust line are 0.

## See Also

- [RippleState entry](/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate)