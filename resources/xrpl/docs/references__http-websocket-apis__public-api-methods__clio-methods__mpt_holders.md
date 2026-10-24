# mpt_holders

[[Source]](https://github.com/XRPLF/clio/blob/develop/src/rpc/handlers/MPTHolders.cpp)

_Added by the [MPTokensV1 amendment](/resources/known-amendments#mptokensv1). (Enabled: 2025-10-01)_

For a given `MPTokenIssuanceID` and ledger sequence, `mpt_holders` returns all holders of that [MPT](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens) and their balance. This method likely returns very large data sets, so you should expect to implement paging via the `marker` field. This API is only available using Clio, not `xrpld`. New in: Clio v2.3.0

## Request Format

WebSocket
```json
{
  "command": "mpt_holders",
  "mpt_issuance_id": "05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA",
  "ledger_index": "validated"
}
```

JSON-RPC
```json
{
  "method": "mpt_holders",
  "params": [
    {
      "mpt_issuance_id": "05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA",
      "ledger_index": "validated"
    }
  ]
}
```

The request contains the following parameters:

| Field | Type | Required? | Description |
|  --- | --- | --- | --- |
| `mpt_issuance_id` | String | Yes | The `MPTokenIssuance` to query. |
| `ledger_index` | [Ledger Index](/docs/references/protocol/data-types/basic-data-types#ledger-index) | No | The [Ledger Index](/docs/references/protocol/data-types/basic-data-types#ledger-index) of the max ledger to use, or a shortcut string to choose a ledger automatically. You must specify either `ledger_index` or `ledger_hash`. See [Specifying Ledgers](/docs/references/protocol/data-types/basic-data-types#specifying-ledgers). |
| `ledger_hash` | String | No | A 32-byte hex string for the ledger version to use. You must specify either `ledger_index` or ledger_hash. See [Specifying Ledgers](/docs/references/protocol/data-types/basic-data-types#specifying-ledgers). |
| `marker` | [Marker](/docs/references/http-websocket-apis/api-conventions/markers-and-pagination) | No | Used to continue your query where it left off in paginating. |
| `limit` | Number (positive integer) | No | Specify a limit to the number of MPTs returned. |


## Response Format

WebSocket
```json
{
  "result": {
    "mpt_issuance_id": "05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA",
    "limit": 50,
    "ledger_index": 99563041,
    "mptokens": [
      {
        "account": "rsNw23ygZatXv7h8QVSgAE4jktY2uW1iZP",
        "flags": 0,
        "mpt_amount": "100",
        "mptoken_index": "081078D38E9C36647B4AD95ECB476F434B817753AD4F6B4B5EE0ED4C3185C80F"
      }
    ],
    "validated": true
  },
  "id": "example_mpt_holders",
  "status": "success",
  "type": "response",
  "warnings": [
    {
      "id": 2001,
      "message": "This is a clio server. clio only serves validated data. If you want to talk to rippled, include 'ledger_index':'current' in your request"
    }
  ]
}
```

JSON-RPC
```json
200 OK

{
  "result": {
    "mpt_issuance_id": "05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA",
    "limit": 50,
    "ledger_index": 99563067,
    "mptokens": [
      {
        "account": "rsNw23ygZatXv7h8QVSgAE4jktY2uW1iZP",
        "flags": 0,
        "mpt_amount": "100",
        "mptoken_index": "081078D38E9C36647B4AD95ECB476F434B817753AD4F6B4B5EE0ED4C3185C80F"
      }
    ],
    "validated": true,
    "status": "success"
  },
  "warnings": [
    {
      "id": 2001,
      "message": "This is a clio server. clio only serves validated data. If you want to talk to rippled, include 'ledger_index':'current' in your request"
    }
  ]
}
```

### Response Fields

The response follows the [standard format](/docs/references/http-websocket-apis/api-conventions/response-formatting), with the result containing the following fields:

| Field | Type | Description |
|  --- | --- | --- |
| `mpt_issuance_id` | String | The `MPTokenIssuance` queried. |
| `mptokens` | Array | An array of [MPTokens](#mptoken). Includes all relevant fields in the underlying `MPToken` object. |
| `marker` | [Marker](/docs/references/http-websocket-apis/api-conventions/markers-and-pagination) | Used to continue querying where we left off when paginating. Omitted if there are no more entries after this result. |
| `limit` | Number | The limit, as specified in the request. |
| `ledger_index` | [Ledger Index](/docs/references/protocol/data-types/basic-data-types#ledger-index) | The index of the ledger used. |
| `validated` | Boolean | If `true`, the ledger has been validated by the consensus process and is immutable. Otherwise, the contents of the ledger are not final and may change. In Clio, this is *always* true as Clio stores and returns validated ledger data. |


#### MPToken

An `MPToken` object has the following parameters:

| Field | Type | Description |
|  --- | --- | --- |
| `account` | String | The account address of the holder who owns the `MPToken`. |
| `flags` | Number | The flags assigned to the`MPToken` object. |
| `mpt_amount` | [String Number](/docs/references/protocol/data-types/currency-formats#string-numbers) | Specifies a positive amount of tokens currently held by the owner. |
| `mptoken_index` | String | Key of the `MPToken` object. |


## Possible Errors

- Any of the [universal error types](/docs/references/http-websocket-apis/api-conventions/error-formatting#universal-errors).
- `invalidParams` - One or more fields are specified incorrectly, or one or more required fields are missing.