# account_mptokens

[[Source]](https://github.com/XRPLF/clio/blob/develop/src/rpc/handlers/AccountMPTokens.cpp)

The `account_mptokens` method returns information about the [MPTs](/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens) held by an account, including their balance. This method may return large data sets, so you should expect to implement [pagination](/docs/references/http-websocket-apis/api-conventions/markers-and-pagination). New in: Clio v2.7.0

This method is only available using Clio, not `xrpld`.

## Request Format

WebSocket
```json
{
  "command": "account_mptokens",
  "account": "rLEw4taUYTNLs3ZCv3vyXGmct8PagQ9GcF",
  "ledger_index": "validated"
}
```

JSON-RPC
```json
{
  "method": "account_mptokens",
  "params": [
    {
      "account": "rLEw4taUYTNLs3ZCv3vyXGmct8PagQ9GcF",
      "ledger_index": "validated"
    }
  ]
}
```

The request contains the following parameters:

| Field | Type | Required? | Description |
|  --- | --- | --- | --- |
| `account` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | Yes | Look up MPTs held by this account. |
| `ledger_index` | [Ledger Index](/docs/references/protocol/data-types/basic-data-types#ledger-index) | No | The [Ledger Index](/docs/references/protocol/data-types/basic-data-types#ledger-index) of the ledger to use, or a shortcut string to choose a ledger automatically. See [Specifying Ledgers](/docs/references/protocol/data-types/basic-data-types#specifying-ledgers). |
| `ledger_hash` | String | No | A 32-byte hex string for the ledger version to use. See [Specifying Ledgers](/docs/references/protocol/data-types/basic-data-types#specifying-ledgers). |
| `marker` | [Marker](/docs/references/http-websocket-apis/api-conventions/markers-and-pagination) | No | Used to continue your query where it left off in paginating. |
| `limit` | Number (positive integer) | No | Specify a limit to the number of MPTs returned. Must be within the inclusive range 10 to 400. Positive values outside this range are replaced with the closest valid option. The default is 200. |


## Response Format

WebSocket
```json
{
  "result": {
    "account": "rLEw4taUYTNLs3ZCv3vyXGmct8PagQ9GcF",
    "ledger_hash": "6CAA8A6A2B5EB20B0D2C8DE5B54B63BA4D8FE54266EBB3A7DA9B3F60B009778B",
    "ledger_index": 105503030,
    "validated": true,
    "limit": 200,
    "mptokens": [
      {
        "mpt_id": "CC043159A7647CDB51F41C1DF4985D654CD1635A62299B2522B9E184D8A0573F",
        "account": "rLEw4taUYTNLs3ZCv3vyXGmct8PagQ9GcF",
        "mpt_issuance_id": "062B590488AF241E0720C1D54DD12798D8B0A05E7B147EE0",
        "mpt_amount": 2412500,
        "mpt_authorized": true
      }
    ]
  },
  "id": "example_account_mptokens",
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
    "account": "rLEw4taUYTNLs3ZCv3vyXGmct8PagQ9GcF",
    "ledger_hash": "6CAA8A6A2B5EB20B0D2C8DE5B54B63BA4D8FE54266EBB3A7DA9B3F60B009778B",
    "ledger_index": 105503030,
    "validated": true,
    "limit": 200,
    "mptokens": [
      {
        "mpt_id": "CC043159A7647CDB51F41C1DF4985D654CD1635A62299B2522B9E184D8A0573F",
        "account": "rLEw4taUYTNLs3ZCv3vyXGmct8PagQ9GcF",
        "mpt_issuance_id": "062B590488AF241E0720C1D54DD12798D8B0A05E7B147EE0",
        "mpt_amount": 2412500,
        "mpt_authorized": true
      }
    ],
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

The response follows the [standard format](/docs/references/http-websocket-apis/api-conventions/response-formatting), with the result containing the following fields:

| Field | Type | Description |
|  --- | --- | --- |
| `account` | [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | The account whose MPTokens were queried. |
| `mptokens` | Array | An array of [MPT objects](#mpt-objects) held by the account. |
| `marker` | [Marker](/docs/references/http-websocket-apis/api-conventions/markers-and-pagination) | Used to continue querying where we left off when paginating. Omitted if there are no more entries after this result. |
| `limit` | Number | The limit, as specified in the request. |
| `ledger_hash` | [Hash](/docs/references/protocol/data-types/basic-data-types#hashes) | The hash of the ledger version used to generate this response. |
| `ledger_index` | [Ledger Index](/docs/references/protocol/data-types/basic-data-types#ledger-index) | The index of the ledger version used to generate this response. |
| `validated` | Boolean | If `true`, the ledger has been validated by the consensus process and is immutable. Otherwise, the contents of the ledger are not final and may change. In Clio, this is *always* true as Clio stores and returns validated ledger data. |


### MPT objects

Each MPT object has the following fields:

| Field | Type | Description |
|  --- | --- | --- |
| `mpt_id` | String | The [ledger entry ID](/docs/references/protocol/ledger-data/common-fields#ledger-entry-id) of the `MPToken` ledger entry for this MPT. |
| `account` | [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | The holder of this MPT. |
| `mpt_issuance_id` | String | The 192-bit `MPTokenIssuanceID`, as hexadecimal, of the [MPTokenIssuance entry](/docs/references/protocol/ledger-data/ledger-entry-types/mptokenissuance) that this `MPToken` is associated with. |
| `mpt_amount` | Number | The amount of tokens currently held by the account for this issuance. |
| `locked_amount` | Number | *(May be omitted)* The amount of tokens currently held in [escrow](/docs/concepts/payment-types/escrow). Omitted if the `MPToken` has no escrowed balance. |
| `mpt_locked` | Boolean | *(May be omitted)* If `true`, the issuer has frozen the holder's balance of this token, so the holder can't send it. This is unrelated to `locked_amount`. Omitted if not frozen. |
| `mpt_authorized` | Boolean | *(May be omitted)* If `true`, the holder is authorized to hold this token. Omitted if not authorized. |


## Possible Errors

- Any of the [universal error types](/docs/references/http-websocket-apis/api-conventions/error-formatting#universal-errors).
- `invalidParams` - One or more fields are specified incorrectly, or one or more required fields are missing.
- `actMalformed` - The [Address](/docs/references/protocol/data-types/basic-data-types#addresses) specified in the `account` field of the request is not a valid account address.
- `actNotFound` - The [Address](/docs/references/protocol/data-types/basic-data-types#addresses) specified in the `account` field of the request does not correspond to an account in the ledger.
- `lgrNotFound` - The ledger specified by the `ledger_hash` or `ledger_index` does not exist, or the server does not have it.