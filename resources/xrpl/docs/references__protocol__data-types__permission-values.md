# Permission Values

[Permission delegation](/docs/concepts/accounts/permission-delegation) defines permissions that can be granted to other accounts. These permissions fall into the following categories:

- **Transaction Type Permissions** - Permission to send transactions with the specified [transaction type](/docs/references/protocol/transactions/types).
- **Granular Permissions** - Permission to send transactions with a specific subset of functionality.


_Requires the [PermissionDelegationV1_1 amendment](/resources/known-amendments#permissiondelegationv1_1). (Open for Voting: 62.86%)_

Warning
Until the [fixCleanup3_4_0 amendment](/resources/known-amendments#fixcleanup3_4_0) is enabled, it is recommended not to delegate the `PaymentBurn` granular permission. Before the fix, a delegate with the `PaymentBurn` granular permission can also mint new fungible tokens ([trust line tokens](/docs/concepts/tokens/fungible-tokens/trust-line-tokens) or [MPTs](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens)) in certain circumstances. Other granular permissions are unaffected.

## Numeric and String Values

In the [canonical binary format](/docs/references/protocol/binary-format) for transactions and ledger data, permission values are stored in a numeric form (specifically, as a 32-bit unsigned integer). However, in JSON they can be specified and returned in string format for convenience, similar to how transaction type names (`TransactionType` fields) work.

When specifying a permission value in JSON, you can use either the numeric value or the string value. When serving data, the server supplies the string value if it is known, and falls back to the numeric value otherwise.

Caution
Not all client libraries support numeric PermissionValue types. In most cases, you should use the string names of the permissions you want to grant.

- For **transaction type permissions**, the string is the name of the transaction type exactly (case-sensitive). For example, a permission value of `"PaymentChannelClaim"` grants permission to send [PaymentChannelClaim transactions](/docs/references/protocol/transactions/types/paymentchannelclaim).
- For **granular permissions**, the string is the name of the granular permission (case-sensitive). For example, a permission value of `"TrustlineAuthorize"` grants permission to send TrustSet transactions that authorize trust lines (but not ones that modify other settings such as the trust line limit or freeze status).


The numeric value `0` is reserved for "full permissions", meaning permission to send transactions of all types, but it is not possible to delegate full permissions.

## Transaction Type Permissions

Transaction Type Permissions have numeric values from 1 to 65536 (that is, 216), inclusive. They correspond with known transaction types, except you add 1 when specifying a transaction type as a permission value. For example, the string `"Payment"` corresponds to a `TransactionType` value of `0`, but a `PermissionValue` value of `1`. To grant permissions to make Payment transactions, you can specify either `"PermissionValue": "Payment"` or `"PermissionValue": 1`.

For a mapping of transaction types known by a server and their corresponding numeric transaction type values, check the `TRANSACTION_TYPES` field in the [server_definitions method](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_definitions).

### List of Non-Delegable Permissions

Some transaction types can't be delegated. If you attempt to grant these permissions to a delegate, the transaction fails with a [result code](/docs/references/protocol/transactions/transaction-results) such as `tecNO_PERMISSION`. This includes all transaction types that can be used to grant other permissions to different key pairs or accounts. Additionally, all [pseudo-transaction types](/docs/references/protocol/transactions/pseudo-transaction-types/pseudo-transaction-types) can't be delegated since they can't be sent by normal accounts anyway.

The following permissions cannot be delegated:

| Transaction Type | Permission Value |
|  --- | --- |
| [AccountDelete](/docs/references/protocol/transactions/types/accountdelete) | `22` |
| [AccountSet](/docs/references/protocol/transactions/types/accountset) | `4` |
| [Batch](/docs/references/protocol/transactions/types/batch) | `72` |
| [ConfidentialMPTConvert](/docs/references/protocol/transactions/types/confidentialmptconvert) _Requires the [ConfidentialTransfer amendment](/resources/known-amendments#confidentialtransfer). (Open for Voting: 31.43%)_ | `86` |
| [DelegateSet](/docs/references/protocol/transactions/types/delegateset) | `65` |
| [EnableAmendment](/docs/references/protocol/transactions/pseudo-transaction-types/enableamendment) | `101` |
| [LedgerStateFix](/docs/references/protocol/transactions/types/ledgerstatefix) | `54` |
| [LoanBrokerCoverClawback](/docs/references/protocol/transactions/types/loanbrokercoverclawback) _Requires the [LendingProtocol amendment](/resources/known-amendments#lendingprotocol). (Open for Voting: 37.14%)_ | `79` |
| [LoanBrokerCoverDeposit](/docs/references/protocol/transactions/types/loanbrokercoverdeposit) _Requires the [LendingProtocol amendment](/resources/known-amendments#lendingprotocol). (Open for Voting: 37.14%)_ | `77` |
| [LoanBrokerCoverWithdraw](/docs/references/protocol/transactions/types/loanbrokercoverwithdraw) _Requires the [LendingProtocol amendment](/resources/known-amendments#lendingprotocol). (Open for Voting: 37.14%)_ | `78` |
| [LoanBrokerDelete](/docs/references/protocol/transactions/types/loanbrokerdelete) _Requires the [LendingProtocol amendment](/resources/known-amendments#lendingprotocol). (Open for Voting: 37.14%)_ | `76` |
| [LoanBrokerSet](/docs/references/protocol/transactions/types/loanbrokerset) _Requires the [LendingProtocol amendment](/resources/known-amendments#lendingprotocol). (Open for Voting: 37.14%)_ | `75` |
| [LoanDelete](/docs/references/protocol/transactions/types/loandelete) _Requires the [LendingProtocol amendment](/resources/known-amendments#lendingprotocol). (Open for Voting: 37.14%)_ | `82` |
| [LoanManage](/docs/references/protocol/transactions/types/loanmanage) _Requires the [LendingProtocol amendment](/resources/known-amendments#lendingprotocol). (Open for Voting: 37.14%)_ | `83` |
| [LoanPay](/docs/references/protocol/transactions/types/loanpay) _Requires the [LendingProtocol amendment](/resources/known-amendments#lendingprotocol). (Open for Voting: 37.14%)_ | `85` |
| [LoanSet](/docs/references/protocol/transactions/types/loanset) _Requires the [LendingProtocol amendment](/resources/known-amendments#lendingprotocol). (Open for Voting: 37.14%)_ | `81` |
| [SetFee](/docs/references/protocol/transactions/pseudo-transaction-types/setfee) | `102` |
| [SetRegularKey](/docs/references/protocol/transactions/types/setregularkey) | `6` |
| [SignerListSet](/docs/references/protocol/transactions/types/signerlistset) | `13` |
| [SponsorshipTransfer](/docs/references/protocol/transactions/types/sponsorshiptransfer) _Requires the [Sponsor amendment](/resources/known-amendments#sponsor). (Open for Voting: 17.14%)_ | `91` |
| [VaultClawback](/docs/references/protocol/transactions/types/vaultclawback) _Requires the [SingleAssetVault amendment](/resources/known-amendments#singleassetvault). (Open for Voting: 45.71%)_ | `71` |
| [VaultCreate](/docs/references/protocol/transactions/types/vaultcreate) _Requires the [SingleAssetVault amendment](/resources/known-amendments#singleassetvault). (Open for Voting: 45.71%)_ | `66` |
| [VaultDelete](/docs/references/protocol/transactions/types/vaultdelete) _Requires the [SingleAssetVault amendment](/resources/known-amendments#singleassetvault). (Open for Voting: 45.71%)_ | `68` |
| [VaultDeposit](/docs/references/protocol/transactions/types/vaultdeposit) _Requires the [SingleAssetVault amendment](/resources/known-amendments#singleassetvault). (Open for Voting: 45.71%)_ | `69` |
| [VaultSet](/docs/references/protocol/transactions/types/vaultset) _Requires the [SingleAssetVault amendment](/resources/known-amendments#singleassetvault). (Open for Voting: 45.71%)_ | `67` |
| [VaultWithdraw](/docs/references/protocol/transactions/types/vaultwithdraw) _Requires the [SingleAssetVault amendment](/resources/known-amendments#singleassetvault). (Open for Voting: 45.71%)_ | `70` |
| [UNLModify](/docs/references/protocol/transactions/pseudo-transaction-types/unlmodify) | `103` |


Note
The `Batch` transaction itself is non-delegable, but a delegate *can* send inner transactions if they have permissions.

## Granular Permissions

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/include/xrpl/protocol/detail/permissions.macro)

Granular Permissions have numeric types of 65537 and up, corresponding to specific names of permissions. Values that are not defined are not allowed. Each granular permission is a subset of a single transaction type's functionality.

| Numeric Value | Name | Transaction Type | Description |
|  --- | --- | --- | --- |
| `65537` | `TrustlineAuthorize` | [TrustSet](/docs/references/protocol/transactions/types/trustset) | Can [authorize individual trust lines](/docs/concepts/tokens/fungible-tokens/authorized-trust-lines). |
| `65538` | `TrustlineFreeze` | [TrustSet](/docs/references/protocol/transactions/types/trustset) | Can [freeze individual trust lines](/docs/concepts/tokens/fungible-tokens/freezes). |
| `65539` | `TrustlineUnfreeze` | [TrustSet](/docs/references/protocol/transactions/types/trustset) | Can [unfreeze individual trust lines](/docs/concepts/tokens/fungible-tokens/freezes). |
| `65540` | `AccountDomainSet` | [AccountSet](/docs/references/protocol/transactions/types/accountset) | Can set the `Domain` field of the account. |
| `65541` | `AccountEmailHashSet` | [AccountSet](/docs/references/protocol/transactions/types/accountset) | Can set the `EmailHash` field of the account. |
| `65542` | `AccountMessageKeySet` | [AccountSet](/docs/references/protocol/transactions/types/accountset) | Can set the `MessageKey` field of the account. |
| `65543` | `AccountTransferRateSet` | [AccountSet](/docs/references/protocol/transactions/types/accountset) | Can set the [transfer fee of fungible tokens issued by the account](/docs/concepts/tokens/transfer-fees). |
| `65544` | `AccountTickSizeSet` | [AccountSet](/docs/references/protocol/transactions/types/accountset) | Can set the [tick size of fungible tokens issued by the account](/docs/concepts/tokens/decentralized-exchange/ticksize). |
| `65545` | `PaymentMint` | [Payment](/docs/references/protocol/transactions/types/payment) | Can send payments that mint new fungible tokens or MPTs. |
| `65546` | `PaymentBurn` | [Payment](/docs/references/protocol/transactions/types/payment) | Can send payments that burn fungible tokens or MPTs, but not past a zero balance. _The [fixCleanup3_4_0 amendment](/resources/known-amendments#fixcleanup3_4_0) updates this. (Open for Voting: 0.00%)_ **Warning:** Don't delegate this permission until the [fixCleanup3_4_0 amendment](/resources/known-amendments#fixcleanup3_4_0) is enabled. Before the fix, a delegate can sometimes mint new fungible tokens in certain circumstances. |
| `65547` | `MPTokenIssuanceLock` | [MPTokenIssuanceSet](/docs/references/protocol/transactions/types/mptokenissuanceset) | Can lock the balances of a particular MPT issued by the account. _Added by the [MPTokensV1 amendment](/resources/known-amendments#mptokensv1). (Enabled: 2025-10-01)_ |
| `65548` | `MPTokenIssuanceUnlock` | [MPTokenIssuanceSet](/docs/references/protocol/transactions/types/mptokenissuanceset) | Can unlock the balances of a particular MPT issued by the account. _Added by the [MPTokensV1 amendment](/resources/known-amendments#mptokensv1). (Enabled: 2025-10-01)_ |


### Limitations to Granular Permissions

The set of granular permissions is hard-coded. No custom configurations are allowed. For example, you cannot add permissions based on specific currencies. Adding a new granular permission requires an amendment.