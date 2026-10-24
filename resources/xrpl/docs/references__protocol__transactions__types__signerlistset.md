# SignerListSet

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/account/SignerListSet.cpp)

Create, replace, or remove a list of signers that can be used to [multi-sign](/docs/concepts/accounts/multi-signing) a transaction.

_Added by the [MultiSign amendment](/resources/known-amendments#multisign). (Enabled: 2016-06-27)_

## Example  JSON

```json
{
    "Flags": 0,
    "TransactionType": "SignerListSet",
    "Account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "Fee": "12",
    "SignerQuorum": 3,
    "SignerEntries": [
        {
            "SignerEntry": {
                "Account": "rsA2LpzuawewSBQXkiju3YQTMzW13pAAdW",
                "SignerWeight": 2
            }
        },
        {
            "SignerEntry": {
                "Account": "rUpy3eEg8rqjqfUoLeBnZkscbKbFsKXC3v",
                "SignerWeight": 1
            }
        },
        {
            "SignerEntry": {
                "Account": "raKEEVSGnKSD9Zyvxu4z6Pqpm4ABH8FS6n",
                "SignerWeight": 1
            }
        }
    ]
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Description |
|  --- | --- | --- | --- |
| `SignerQuorum` | Number | UInt32 | A target number for the signer weights. A multi-signature from this list is valid only if the sum weights of the signatures provided is greater than or equal to this value. To delete a signer list, use the value `0`. |
| `SignerEntries` | Array | Array | *(Omitted when deleting)* Array of [`SignerEntry` objects](/docs/references/protocol/ledger-data/ledger-entry-types/signerlist#signer-entry-object), indicating the addresses and weights of signers in this list. This signer list must have at least 1 member and no more than 32 members. No address may appear more than once in the list, nor may the `Account` submitting the transaction appear in the list. *(Updated by the [ExpandedSignerList amendment](/resources/known-amendments#expandedsignerlist).)* |


A successful SignerListSet transaction replaces the account's [`SignerList` object](/docs/references/protocol/ledger-data/ledger-entry-types/signerlist) in the ledger, or adds one if it did not exist before. An account may not have more than one signer list. To delete a signer list, you must set `SignerQuorum` to `0` *and* omit the `SignerEntries` field. Otherwise, the transaction fails with the error [`temMALFORMED`](/docs/references/protocol/transactions/transaction-results/tem-codes). A transaction to delete a signer list is considered successful even if there was no signer list to delete.

You cannot create a signer list such that the `SignerQuorum` could never be met. The `SignerQuorum` must be greater than 0 but less than or equal to the sum of the `SignerWeight` values in the list. Otherwise, the transaction fails with the error [`temMALFORMED`](/docs/references/protocol/transactions/transaction-results/tem-codes).

You can create, update, or remove a signer list using the master key, regular key, or the current signer list, if those methods of signing transactions are available.

You cannot remove the last method of signing transactions from an account. If an account's master key is disabled (the account has the [`lsfDisableMaster` flag](/docs/references/protocol/ledger-data/ledger-entry-types/accountroot#accountroot-flags) enabled) and the account does not have a [Regular Key](/docs/concepts/accounts/cryptographic-keys) configured, then you cannot delete the signer list from the account. Instead, the transaction fails with the error [`tecNO_ALTERNATIVE_KEY`](/docs/references/protocol/transactions/transaction-results/tec-codes).

Creating or replacing a signer list enables the `lsfOneOwnerCount` flag on the [SignerList object](/docs/references/protocol/ledger-data/ledger-entry-types/signerlist). Lists that were created before the [MultiSignReserve amendment](/resources/known-amendments#multisignreserve) became enabled do not have this flag and have a higher [owner reserve](/docs/concepts/accounts/reserves#owner-reserves). You can decrease the owner reserve for these lists by replacing the list with the same list. For more information, see [SignerList Flags](/docs/references/protocol/ledger-data/ledger-entry-types/signerlist#signerlist-flags).

## See Also

- [SignerList entry](/docs/references/protocol/ledger-data/ledger-entry-types/signerlist)