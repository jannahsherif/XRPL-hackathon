# DelegateSet

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/delegate/DelegateSet.cpp)

[Delegate permissions](/docs/concepts/accounts/permission-delegation) to another account to send transactions on your behalf. This transaction type can grant, change, or revoke permissions; it creates, modifies, or deletes a [Delegate ledger entry](/docs/references/protocol/ledger-data/ledger-entry-types/delegate) accordingly.

_Requires the [PermissionDelegationV1_1 amendment](/resources/known-amendments#permissiondelegationv1_1). (Open for Voting: 62.86%)_

Warning
Until the [fixCleanup3_4_0 amendment](/resources/known-amendments#fixcleanup3_4_0) is enabled, it is recommended not to delegate the `PaymentBurn` granular permission. Before the fix, a delegate with the `PaymentBurn` granular permission can also mint new fungible tokens ([trust line tokens](/docs/concepts/tokens/fungible-tokens/trust-line-tokens) or [MPTs](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens)) in certain circumstances. Other granular permissions are unaffected.

## Example  JSON

```json
{
    "TransactionType": "DelegateSet",
    "Account": "rw81qtsfF9rws4RbmYepf5394gp81TQv5Y",
    "Authorize": "r9GAKojMTyexqvy8DXFWYq63Mod5k5wnkT",
    "Fee": "1",
    "Flags": 0,
    "LastLedgerSequence": 4747822,
    "Permissions": [
        {
            "Permission": {
                "PermissionValue": "AccountDomainSet"
            }
        }
    ],
    "Sequence": 4747802
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | Required? | JSON Type | Internal Type | Description |
|  --- | --- | --- | --- | --- |
| `Authorize` | Yes | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | AccountID | The account being granted permissions, also called the *delegate*. |
| `Permissions` | Yes | Array | Array | A list of up to 10 [Permission objects](#permission-objects) each specifying a different permission granted to the delegate. The delegate's permissions are updated to match this set of permissions exactly. To revoke all permissions, use an empty array; this is only valid when a [Delegate ledger entry](/docs/references/protocol/ledger-data/ledger-entry-types/delegate) already exists for the delegate. |


If a [Delegate ledger entry](/docs/references/protocol/ledger-data/ledger-entry-types/delegate) does not exist to record the granted permissions, this transaction creates one. If it already exists, the transaction updates the set of permissions to match the list in the transaction: any permissions not listed are revoked. If all permissions are revoked, the transaction deletes the Delegate ledger entry. An empty `Permissions` list is only valid for deleting an existing Delegate ledger entry; if no such entry exists, the transaction fails with `tecNO_ENTRY`.

Tip
If you want to delegate more than 10 permissions, consider using [multi-signing](/docs/concepts/accounts/multi-signing) instead.

### Permission Objects

Each item in the `Permissions` array is an inner object with the following nested field:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Required? | Description |
|  --- | --- | --- | --- | --- |
| `PermissionValue` | String or Number | UInt32 | Yes | A permission to grant to the delegate, which can be either a transaction type or a granular permission. See [Permission Values](/docs/references/protocol/data-types/permission-values) for a full list. |


## Error Cases

Besides errors that can occur for all transactions,  transactions can result in the following [transaction result codes](/docs/references/protocol/transactions/transaction-results):

| Error Code | Description |
|  --- | --- |
| `tecNO_ENTRY` | The `Permissions` list is empty but no [Delegate ledger entry](/docs/references/protocol/ledger-data/ledger-entry-types/delegate) exists for the delegate. An empty list is only valid for deleting an existing entry. |
| `tecNO_TARGET` | The account specified in the `Authorize` field does not exist in the ledger. |
| `tecPSEUDO_ACCOUNT` | The `Authorize` account is a [pseudo-account](/docs/concepts/accounts/pseudo-accounts). |
| `temARRAY_TOO_LARGE` | The `Permissions` list is too large. It cannot contain more than 10 entries. |
| `temMALFORMED` | The transaction was invalid. For example:The `Authorize` account is the same as the sender of the transactionThe `Permissions` list contains duplicate entriesOne of the permissions can't be delegated. See: [List of Non-Delegable Permissions](/docs/references/protocol/data-types/permission-values#list-of-non-delegable-permissions). |
| `temBAD_SIGNER` | `Delegate` is the same as `Account`. |


## See Also

- [Delegate ledger entry](/docs/references/protocol/ledger-data/ledger-entry-types/delegate)