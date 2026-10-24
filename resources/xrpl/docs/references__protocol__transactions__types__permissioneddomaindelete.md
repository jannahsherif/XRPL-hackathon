# PermissionedDomainDelete

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/permissioned_domain/PermissionedDomainDelete.cpp)

Delete a [permissioned domain](/docs/concepts/tokens/decentralized-exchange/permissioned-domains) that you own.

_Added by the [PermissionedDomains amendment](/resources/known-amendments#permissioneddomains). (Enabled: 2026-02-04)_

## Example  JSON

```json
{
  "TransactionType": "PermissionedDomainDelete",
  "Account": "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
  "Fee": "10",
  "Sequence": 392,
  "DomainID": "77D6234D074E505024D39C04C3F262997B773719AB29ACFA83119E4210328776"
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Required? | Description |
|  --- | --- | --- | --- | --- |
| `DomainID` | String - [Hash](/docs/references/protocol/data-types/basic-data-types#hashes) | UInt256 | Yes | The ledger entry ID of the Permissioned Domain entry to delete. |


##  Flags

There are no flags defined for  transactions.

## Error Cases

Besides errors that can occur for all transactions,  transactions can result in the following [transaction result codes](/docs/references/protocol/transactions/transaction-results):

| Error Code | Description |
|  --- | --- |
| `tecNO_ENTRY` | The permissioned domain specified in the `DomainID` field doesn't exist in the ledger. |
| `temDISABLED` | The `PermissionedDomains` amendment is not enabled. |


## See Also

- [PermissionedDomain entry](/docs/references/protocol/ledger-data/ledger-entry-types/permissioneddomain)