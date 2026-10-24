# Ticket

[[Source]](https://github.com/XRPLF/rippled/blob/a5d238e7d4fa6ef2b539b759d58744d0a1c33c0c/include/xrpl/protocol/detail/ledger_entries.macro#L117-L123)

A `Ticket` entry type represents a [Ticket](/docs/concepts/accounts/tickets), which tracks an account [sequence number](/docs/references/protocol/data-types/basic-data-types#account-sequence) that has been set aside for future use. You can create new tickets with a [TicketCreate transaction](/docs/references/protocol/transactions/types/ticketcreate).

_Added by the [TicketBatch amendment](/resources/known-amendments#ticketbatch). (Enabled: 2021-11-18)_

## Example  JSON

```json
{
  "Account": "rEhxGqkqPPSxQ3P25J66ft5TwpzV14k2de",
  "Flags": 0,
  "LedgerEntryType": "Ticket",
  "OwnerNode": "0000000000000000",
  "PreviousTxnID": "F19AD4577212D3BEACA0F75FE1BA1644F2E854D46E8D62E9C95D18E9708CBFB1",
  "PreviousTxnLgrSeq": 4,
  "TicketSequence": 3
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/ledger-data/common-fields),  entries have the following fields:

| Name | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Required? | Description |
|  --- | --- | --- | --- | --- |
| `Account` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | AccountID | Yes | The [account](/docs/concepts/accounts) that owns this Ticket. |
| `OwnerNode` | String - Hexadecimal | UInt64 | Yes | A hint indicating which page of the owner directory links to this entry, in case the directory consists of multiple pages. |
| `PreviousTxnID` | String - [Hash](/docs/references/protocol/data-types/basic-data-types#hashes) | UInt256 | Yes | The identifying hash of the [transaction](/docs/concepts/transactions) that most recently modified this entry. |
| `PreviousTxnLgrSeq` | Number | UInt32 | Yes | The [index of the ledger](/docs/references/protocol/data-types/basic-data-types#ledger-index) that contains the transaction that most recently modified this entry. |
| `TicketSequence` | Number | UInt32 | Yes | The [Sequence Number](/docs/references/protocol/data-types/basic-data-types#account-sequence) this Ticket sets aside. |


##  Reserve

entries count as one item towards the owner reserve of the account that placed the created it, as long as the entry is in the ledger. Using the ticket frees up the reserve.

##  Flags

There are no flags defined for  entries.

##  ID Format

The ID of a Ticket object is the SHA-512Half of the following values, concatenated in order:

* The Ticket space key (`0x0054`)
* The AccountID of the owner of the Ticket
* The `TicketSequence` number of the Ticket


## See Also

- **Transactions:**
  - [TicketCreate transaction](/docs/references/protocol/transactions/types/ticketcreate)