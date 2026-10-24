# TicketCreate

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/libxrpl/tx/transactors/system/TicketCreate.cpp)

Set aside one or more [sequence numbers](/docs/references/protocol/data-types/basic-data-types#account-sequence) as [tickets](/docs/concepts/accounts/tickets).

_Added by the [TicketBatch amendment](/resources/known-amendments#ticketbatch). (Enabled: 2021-11-18)_

## Example  JSON

```json
{
    "TransactionType": "TicketCreate",
    "Account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "Fee": "10",
    "Sequence": 381,
    "TicketCount": 10
}
```

##  Fields

In addition to the [common fields](/docs/references/protocol/transactions/common-fields),  transactions use the following fields:

| Field | JSON Type | [Internal Type](/docs/references/protocol/binary-format) | Description |
|  --- | --- | --- | --- |
| `TicketCount` | Number | UInt32 | How many Tickets to create. This must be a positive number and cannot cause the account to own more than 250 Tickets after executing this transaction. |


If the transaction cannot create *all* of the requested Tickets (either due to the 250-Ticket limit or the [owner reserve](/docs/concepts/accounts/reserves)), it fails and creates no Tickets. To look up how many Tickets an account currently owns, use the [account_info method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_info) and check the `account_data.TicketCount` field.

This transaction increases the sending account's [sequence number](/docs/references/protocol/data-types/basic-data-types#account-sequence) by 1 *plus* the number of tickets created (`TicketCount`). This is the only transaction that increases an account's sequence number by more than 1.

## Error Cases

Besides errors that can occur for all transactions,  transactions can result in the following [transaction result codes](/docs/references/protocol/transactions/transaction-results):

| Error Code | Description |
|  --- | --- |
| `temINVALID_COUNT` | The `TicketCount` field is invalid. It must be an integer from 1 to 250. |
| `tecDIR_FULL` | This transaction would cause the account to own more than the limit of 250 Tickets at a time, or more than the maximum number of ledger objects in general.The maximum ledger objects error is effectively impossible to receive if [fixDirectoryLimit](/resources/known-amendments#fixdirectorylimit) (Enabled: 2025-12-18) is enabled. |
| `tecINSUFFICIENT_RESERVE` | The sending account does not have enough XRP to meet the [owner reserve](/docs/concepts/accounts/reserves) of all the requested Tickets. |


## See Also

- [Ticket entry](/docs/references/protocol/ledger-data/ledger-entry-types/ticket)