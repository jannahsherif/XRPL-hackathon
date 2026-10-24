# Multi-Signing

Multi-signing in the XRP Ledger is a method of [authorizing transactions](/docs/concepts/transactions#authorizing-transactions) for the XRP Ledger by using a combination of multiple secret keys. You can have any combination of authorization methods enabled for your address, including multi-signing, a [master key pair](/docs/concepts/accounts/cryptographic-keys#master-key-pair), and a [regular key pair](/docs/concepts/accounts/cryptographic-keys#regular-key-pair). (The only requirement is that *at least one* method must be enabled.)

Benefits of multi-signing include:

- You can require keys from different devices, so that a malicious actor must compromise multiple machines to send transactions on your behalf.
- You can share custody of an address between multiple people, each of whom only has one of several keys necessary to send transactions from that address.
- You can delegate the power to send transactions from your address to a group of people, who can control your address if you are unavailable or unable to sign normally.


## Signer Lists

Before you can multi-sign, you must create a list of which addresses can sign for you.

The [SignerListSet transaction](/docs/references/protocol/transactions/types/signerlistset) defines a *signer list*, a set of addresses that can authorize transactions from your address. You can include 1 to 32 addresses in a signer list. The list cannot include your address and there can be no duplicate entries. You can control how many signatures are needed, in which combinations, by using the *Signer Weight* and *Quorum* settings in the list.

_Updated by the [ExpandedSignerList amendment](/resources/known-amendments#expandedsignerlist). (Enabled: 2022-10-13)_

### Signer Weight

You assign a weight to each signer in the list. The weight represents the authority of the signer relative to other signers on the list. The higher the value, the more authority. Individual weight values cannot exceed 216-1.

### Quorum

The quorum value of a list is the minimum weight total required to authorize a transaction. The quorum must be greater than 0 but less than or equal to the sum of the weight values in the signer list: meaning, it must be possible to achieve a quorum with the given signer weights.

### Wallet Locator

You can also add up to 256 bits of arbitrary data to each signer's entry in the list. This data is not required or used by the network, but can be used by smart contracts or other applications to identify or confirm other data about the signers.

_Added by the [ExpandedSignerList amendment](/resources/known-amendments#expandedsignerlist). (Enabled: 2022-10-13)_

### Examples Using Signer Weight and Quorum

The weights and quorum allow you to set an appropriate level of oversight for each transaction, based on the relative trust and authority relegated to responsible participants who manage the account.

For a shared account use case, you might create a list with a quorum of 1, then give all participants a weight of 1. A single approval from any one of them is all that is required to approve a transaction.

For a very important account, you might set the quorum to 3, with 3 participants that have a weight of 1. All of the participants must agree and approve each transaction.

Another account might also have a quorum of 3. You assign your CEO a weight of 3, 3 Vice Presidents a weight of 2 each, and 3 Directors a weight of 1 each. To approve a transaction for this account requires the approval of all 3 Directors (total weight of 3), 1 Vice President and 1 Director (total weight of 3), 2 Vice Presidents (total weight of 4), or the CEO (total weight of 3). 

In each of the previous three use cases, you would disable the master key without configuring a regular key, so that multi-signing is the only way of [authorizing transactions](/docs/concepts/transactions#authorizing-transactions).

There might be a scenario where you create a multi-signing list as a "backup plan." The account owner normally uses a regular key for their transactions (not a multi-signing key). For safety, the owner adds a signer list containing 3 friends, each with a weight of 1, and a quorum of 3. If the account owner were to lose the private key, they can ask their friends to multi-sign a transaction to replace the regular key.

## Sending Multi-Signed Transactions

To successfully submit a multi-signed transaction, you must do all of the following:

* The address sending the transaction (specified in the `Account` field) must have a [`SignerList` object in the ledger](/docs/references/protocol/ledger-data/ledger-entry-types/signerlist). For instructions on how to do this, see [Set Up Multi-Signing](/docs/tutorials/best-practices/key-management/set-up-multi-signing).
* The transaction must include the `SigningPubKey` field as an empty string.
* The transaction must include a [`Signers` field](/docs/references/protocol/transactions/common-fields#signers-field) containing an array of signatures.
* The signatures present in the `Signers` array must match signers defined in the `SignerList`.
* For the provided signatures, the total weight associated with those signers must be equal or greater than the quorum for the `SignerList`.
* The [transaction cost](/docs/concepts/transactions/transaction-cost) (specified in the `Fee` field) must be at least (N+1) times the normal transaction cost, where N is the number of signatures provided.
* All fields of the transaction must be defined before collecting signatures. You cannot [auto-fill](/docs/references/protocol/transactions/common-fields#auto-fillable-fields) any fields.
* If presented in binary form, the `Signers` array must be sorted based on the numeric value of the signer addresses, with the lowest value first. (If submitted as JSON, the [submit_multisigned method](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/submit_multisigned) handles this automatically.)


## See Also

- **Tutorials:**
  - [Set Up Multi-Signing](/docs/tutorials/best-practices/key-management/set-up-multi-signing)
  - [Send a Multi-Signed Transaction](/docs/tutorials/best-practices/key-management/send-a-multi-signed-transaction)
- **Concepts:**
  - [Cryptographic Keys](/docs/concepts/accounts/cryptographic-keys)
  - [Special Transaction Cost for Multi-signed transactions](/docs/concepts/transactions/transaction-cost#special-transaction-costs)
- **References:**
  - [SignerListSet transaction](/docs/references/protocol/transactions/types/signerlistset)
  - [SignerList object](/docs/references/protocol/ledger-data/ledger-entry-types/signerlist)
  - [sign_for method](/docs/references/http-websocket-apis/admin-api-methods/signing-methods/sign_for)
  - [submit_multisigned method](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/submit_multisigned)