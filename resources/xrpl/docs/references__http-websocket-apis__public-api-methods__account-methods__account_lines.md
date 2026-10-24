# account_lines

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/xrpld/rpc/handlers/account/AccountLines.cpp)

The `account_lines` method returns information about an account's trust lines, which contain balances in all non-XRP currencies and assets. All information retrieved is relative to a particular version of the ledger.

## Request Format

An example of the request format:

WebSocket
```json
{
  "id": "example_account_lines",
  "command": "account_lines",
  "account": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
  "api_version": 2
}
```

JSON-RPC
```json
{
    "method": "account_lines",
    "params": [
        {
            "account": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
            "api_version": 2
        }
    ]
}
```

Commandline
```sh
#Syntax: account_lines <account> [<peer>] [<ledger_index>|<ledger_hash>]
xrpld account_lines r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59
```

The request accepts the following parameters:

| Field | Type | Required? | Description |
|  --- | --- | --- | --- |
| `account` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | Yes | Look up trust lines connected to this account, from this account's perspective. |
| `ignore_default` | Boolean | No | If `true`, don't return trust lines where this account's side is in the default state. The default is `false`. |
| `ledger_hash` | String - [Hash](/docs/references/protocol/data-types/basic-data-types#hashes) | No | The unique hash of the ledger version to use. (See [Specifying Ledgers](/docs/references/protocol/data-types/basic-data-types#specifying-ledgers)) |
| `ledger_index` | [Ledger Index](/docs/references/protocol/data-types/basic-data-types#ledger-index) | No | The [ledger index](/docs/references/protocol/data-types/basic-data-types#ledger-index) of the ledger to use, or a shortcut string to choose a ledger automatically. (See [Specifying Ledgers](/docs/references/protocol/data-types/basic-data-types#specifying-ledgers)) |
| `limit` | Number | No | Limit the number of trust lines to retrieve. The server may return less than the specified limit, even if there are more pages of results. Must be within the inclusive range 10 to 400.  Positive values outside this range are replaced with the closest valid option. The default is 200. |
| `marker` | [Marker](/docs/references/http-websocket-apis/api-conventions/markers-and-pagination) | No | Value from a previous paginated response. Resume retrieving data where that response left off. |
| `peer` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | No | A second account; if provided, filter results to trust lines connecting the two accounts. |


The following parameters are deprecated and may be removed without further notice: `ledger` and `peer_index`.

## Response Format

An example of a successful response:

WebSocket
```json
{
  "api_version": 2,
  "id": "example_account_lines",
  "result": {
    "account": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
    "ledger_current_index": 95348097,
    "lines": [
      {
        "account": "r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z",
        "balance": "0",
        "currency": "ASP",
        "limit": "0",
        "limit_peer": "10",
        "no_ripple": false,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z",
        "balance": "0",
        "currency": "XAU",
        "limit": "0",
        "limit_peer": "0",
        "no_ripple": true,
        "no_ripple_peer": true,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
        "balance": "5",
        "currency": "USD",
        "limit": "5",
        "limit_peer": "0",
        "no_ripple": true,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rHpXfibHgSb64n8kK9QWDpdbfqSpYbM9a4",
        "balance": "481.992867407479",
        "currency": "MXN",
        "limit": "1000",
        "limit_peer": "0",
        "no_ripple": false,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun",
        "balance": "0.793598266778297",
        "currency": "EUR",
        "limit": "1",
        "limit_peer": "0",
        "no_ripple": true,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK",
        "balance": "0",
        "currency": "CNY",
        "limit": "3",
        "limit_peer": "0",
        "no_ripple": true,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rGwUWgN5BEg3QGNY3RX2HfYowjUTZdid3E",
        "balance": "1.336889190631542",
        "currency": "DYM",
        "limit": "3",
        "limit_peer": "0",
        "no_ripple": false,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
        "balance": "0.3488146605801446",
        "currency": "CHF",
        "limit": "0",
        "limit_peer": "0",
        "no_ripple": false,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
        "balance": "0",
        "currency": "BTC",
        "limit": "3",
        "limit_peer": "0",
        "no_ripple": false,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
        "balance": "11.68225001668339",
        "currency": "USD",
        "limit": "5000",
        "limit_peer": "0",
        "no_ripple": false,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rpgKWEmNqSDAGFhy5WDnsyPqfQxbWxKeVd",
        "balance": "-0.00111",
        "currency": "BTC",
        "limit": "0",
        "limit_peer": "10",
        "no_ripple": false,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rBJ3YjwXi2MGbg7GVLuTXUWQ8DjL7tDXh4",
        "balance": "-0.0008744482690504699",
        "currency": "BTC",
        "limit": "0",
        "limit_peer": "10",
        "no_ripple": false,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun",
        "balance": "0",
        "currency": "USD",
        "limit": "1",
        "limit_peer": "0",
        "no_ripple": false,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA",
        "balance": "9.07619790068559",
        "currency": "CNY",
        "limit": "100",
        "limit_peer": "0",
        "no_ripple": true,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
        "balance": "7.292695098901099",
        "currency": "JPY",
        "limit": "0",
        "limit_peer": "0",
        "no_ripple": true,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z",
        "balance": "0",
        "currency": "AUX",
        "limit": "0",
        "limit_peer": "0",
        "no_ripple": true,
        "no_ripple_peer": true,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "r9vbV3EHvXWjSkeQ6CAcYVPGeq7TuiXY2X",
        "balance": "0.0004557360418801623",
        "currency": "USD",
        "limit": "1",
        "limit_peer": "0",
        "no_ripple": true,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
        "balance": "12.41688780720394",
        "currency": "EUR",
        "limit": "100",
        "limit_peer": "0",
        "no_ripple": true,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rfF3PNkwkq1DygW2wum2HK3RGfgkJjdPVD",
        "balance": "35",
        "currency": "USD",
        "limit": "500",
        "limit_peer": "0",
        "no_ripple": true,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rwUVoVMSURqNyvocPCcvLu3ygJzZyw8qwp",
        "balance": "-5",
        "currency": "JOE",
        "limit": "0",
        "limit_peer": "50",
        "no_ripple": false,
        "no_ripple_peer": true,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2",
        "balance": "0",
        "currency": "USD",
        "limit": "0",
        "limit_peer": "100",
        "no_ripple": false,
        "no_ripple_peer": true,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2",
        "balance": "0",
        "currency": "JOE",
        "limit": "0",
        "limit_peer": "100",
        "no_ripple": false,
        "no_ripple_peer": true,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rs9M85karFkCRjvc6KMWn8Coigm9cbcgcx",
        "balance": "0",
        "currency": "015841551A748AD2C1F76FF6ECB0CCCD00000000",
        "limit": "10.01037626125837",
        "limit_peer": "0",
        "no_ripple": true,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      },
      {
        "account": "rEhDDUUNxpXgEHVJtC2cjXAgyx5VCFxdMF",
        "balance": "0",
        "currency": "USD",
        "limit": "0",
        "limit_peer": "1",
        "no_ripple": false,
        "no_ripple_peer": false,
        "quality_in": 0,
        "quality_out": 0
      }
    ],
    "validated": false,
    "_nodepref": "nonfh"
  },
  "status": "success",
  "type": "response"
}
```

JSON-RPC
```json
200 OK

{
    "result": {
      "account": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
      "ledger_current_index": 95348091,
      "lines": [
        {
          "account": "r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z",
          "balance": "0",
          "currency": "ASP",
          "limit": "0",
          "limit_peer": "10",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z",
          "balance": "0",
          "currency": "XAU",
          "limit": "0",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": true,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
          "balance": "5",
          "currency": "USD",
          "limit": "5",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rHpXfibHgSb64n8kK9QWDpdbfqSpYbM9a4",
          "balance": "481.992867407479",
          "currency": "MXN",
          "limit": "1000",
          "limit_peer": "0",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun",
          "balance": "0.793598266778297",
          "currency": "EUR",
          "limit": "1",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK",
          "balance": "0",
          "currency": "CNY",
          "limit": "3",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rGwUWgN5BEg3QGNY3RX2HfYowjUTZdid3E",
          "balance": "1.336889190631542",
          "currency": "DYM",
          "limit": "3",
          "limit_peer": "0",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          "balance": "0.3488146605801446",
          "currency": "CHF",
          "limit": "0",
          "limit_peer": "0",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          "balance": "0",
          "currency": "BTC",
          "limit": "3",
          "limit_peer": "0",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          "balance": "11.68225001668339",
          "currency": "USD",
          "limit": "5000",
          "limit_peer": "0",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rpgKWEmNqSDAGFhy5WDnsyPqfQxbWxKeVd",
          "balance": "-0.00111",
          "currency": "BTC",
          "limit": "0",
          "limit_peer": "10",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rBJ3YjwXi2MGbg7GVLuTXUWQ8DjL7tDXh4",
          "balance": "-0.0008744482690504699",
          "currency": "BTC",
          "limit": "0",
          "limit_peer": "10",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun",
          "balance": "0",
          "currency": "USD",
          "limit": "1",
          "limit_peer": "0",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA",
          "balance": "9.07619790068559",
          "currency": "CNY",
          "limit": "100",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          "balance": "7.292695098901099",
          "currency": "JPY",
          "limit": "0",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z",
          "balance": "0",
          "currency": "AUX",
          "limit": "0",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": true,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "r9vbV3EHvXWjSkeQ6CAcYVPGeq7TuiXY2X",
          "balance": "0.0004557360418801623",
          "currency": "USD",
          "limit": "1",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          "balance": "12.41688780720394",
          "currency": "EUR",
          "limit": "100",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rfF3PNkwkq1DygW2wum2HK3RGfgkJjdPVD",
          "balance": "35",
          "currency": "USD",
          "limit": "500",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rwUVoVMSURqNyvocPCcvLu3ygJzZyw8qwp",
          "balance": "-5",
          "currency": "JOE",
          "limit": "0",
          "limit_peer": "50",
          "no_ripple": false,
          "no_ripple_peer": true,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2",
          "balance": "0",
          "currency": "USD",
          "limit": "0",
          "limit_peer": "100",
          "no_ripple": false,
          "no_ripple_peer": true,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2",
          "balance": "0",
          "currency": "JOE",
          "limit": "0",
          "limit_peer": "100",
          "no_ripple": false,
          "no_ripple_peer": true,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rs9M85karFkCRjvc6KMWn8Coigm9cbcgcx",
          "balance": "0",
          "currency": "015841551A748AD2C1F76FF6ECB0CCCD00000000",
          "limit": "10.01037626125837",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rEhDDUUNxpXgEHVJtC2cjXAgyx5VCFxdMF",
          "balance": "0",
          "currency": "USD",
          "limit": "0",
          "limit_peer": "1",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        }
      ],
      "status": "success",
      "validated": false
    }
}
```

Commandline
```json
Loading: "/etc/xrpld/xrpld.cfg"
2025-Apr-09 21:10:16.085500844 UTC HTTPClient:NFO Connecting to 127.0.0.1:5005

{
    "result": {
      "account": "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
      "ledger_current_index": 95348091,
      "lines": [
        {
          "account": "r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z",
          "balance": "0",
          "currency": "ASP",
          "limit": "0",
          "limit_peer": "10",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z",
          "balance": "0",
          "currency": "XAU",
          "limit": "0",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": true,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
          "balance": "5",
          "currency": "USD",
          "limit": "5",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rHpXfibHgSb64n8kK9QWDpdbfqSpYbM9a4",
          "balance": "481.992867407479",
          "currency": "MXN",
          "limit": "1000",
          "limit_peer": "0",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun",
          "balance": "0.793598266778297",
          "currency": "EUR",
          "limit": "1",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK",
          "balance": "0",
          "currency": "CNY",
          "limit": "3",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rGwUWgN5BEg3QGNY3RX2HfYowjUTZdid3E",
          "balance": "1.336889190631542",
          "currency": "DYM",
          "limit": "3",
          "limit_peer": "0",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          "balance": "0.3488146605801446",
          "currency": "CHF",
          "limit": "0",
          "limit_peer": "0",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          "balance": "0",
          "currency": "BTC",
          "limit": "3",
          "limit_peer": "0",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          "balance": "11.68225001668339",
          "currency": "USD",
          "limit": "5000",
          "limit_peer": "0",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rpgKWEmNqSDAGFhy5WDnsyPqfQxbWxKeVd",
          "balance": "-0.00111",
          "currency": "BTC",
          "limit": "0",
          "limit_peer": "10",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rBJ3YjwXi2MGbg7GVLuTXUWQ8DjL7tDXh4",
          "balance": "-0.0008744482690504699",
          "currency": "BTC",
          "limit": "0",
          "limit_peer": "10",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun",
          "balance": "0",
          "currency": "USD",
          "limit": "1",
          "limit_peer": "0",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA",
          "balance": "9.07619790068559",
          "currency": "CNY",
          "limit": "100",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          "balance": "7.292695098901099",
          "currency": "JPY",
          "limit": "0",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z",
          "balance": "0",
          "currency": "AUX",
          "limit": "0",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": true,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "r9vbV3EHvXWjSkeQ6CAcYVPGeq7TuiXY2X",
          "balance": "0.0004557360418801623",
          "currency": "USD",
          "limit": "1",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          "balance": "12.41688780720394",
          "currency": "EUR",
          "limit": "100",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rfF3PNkwkq1DygW2wum2HK3RGfgkJjdPVD",
          "balance": "35",
          "currency": "USD",
          "limit": "500",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rwUVoVMSURqNyvocPCcvLu3ygJzZyw8qwp",
          "balance": "-5",
          "currency": "JOE",
          "limit": "0",
          "limit_peer": "50",
          "no_ripple": false,
          "no_ripple_peer": true,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2",
          "balance": "0",
          "currency": "USD",
          "limit": "0",
          "limit_peer": "100",
          "no_ripple": false,
          "no_ripple_peer": true,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2",
          "balance": "0",
          "currency": "JOE",
          "limit": "0",
          "limit_peer": "100",
          "no_ripple": false,
          "no_ripple_peer": true,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rs9M85karFkCRjvc6KMWn8Coigm9cbcgcx",
          "balance": "0",
          "currency": "015841551A748AD2C1F76FF6ECB0CCCD00000000",
          "limit": "10.01037626125837",
          "limit_peer": "0",
          "no_ripple": true,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        },
        {
          "account": "rEhDDUUNxpXgEHVJtC2cjXAgyx5VCFxdMF",
          "balance": "0",
          "currency": "USD",
          "limit": "0",
          "limit_peer": "1",
          "no_ripple": false,
          "no_ripple_peer": false,
          "quality_in": 0,
          "quality_out": 0
        }
      ],
      "status": "success",
      "validated": false
    }
}
```

The response follows the [standard format](/docs/references/http-websocket-apis/api-conventions/response-formatting), with a successful result containing the address of the account and an array of trust line objects. Specifically, the result object contains the following fields:

| Field | Type | Required? | Description |
|  --- | --- | --- | --- |
| `account` | String | Yes | Unique [Address](/docs/references/protocol/data-types/basic-data-types#addresses) of the account this request corresponds to. This is the "perspective account" for purpose of the trust lines. |
| `lines` | Array | Yes | Array of trust line objects, as described below. If the number of trust lines is large, only returns up to the `limit` at a time. |
| `ledger_current_index` | [Ledger Index](/docs/references/protocol/data-types/basic-data-types#ledger-index) | No | The ledger index that was used when retrieving this data. This field is only provided when using an open ledger version. |
| `ledger_index` | [Ledger Index](/docs/references/protocol/data-types/basic-data-types#ledger-index) | No | The ledger index that was used when retrieving this data. This field is only provided when using a closed ledger version. |
| `ledger_hash` | String - [Hash](/docs/references/protocol/data-types/basic-data-types#hashes) | No | The identifying hash the ledger version that was used when retrieving this data. This field is only provided when using a closed ledger version. |
| `marker` | [Marker](/docs/references/http-websocket-apis/api-conventions/markers-and-pagination) | No | Server-defined value indicating the response is paginated. Pass this to the next call to resume where this call left off. Omitted when there are no additional pages after this one. |
| `limit` | Number | No | The maximum number of trust lines retrieved. The server may return fewer than the specified limit, even if more results are available. If no limit was specified in the request, use a default limit of 200. |


Each trust line object has some combination of the following fields:

| Field | Type | Required? | Description |
|  --- | --- | --- | --- |
| `account` | String - [Address](/docs/references/protocol/data-types/basic-data-types#addresses) | Yes | The counterparty to this trust line. |
| `balance` | [String Number](/docs/references/protocol/data-types/currency-formats#string-numbers) | Yes | Representation of the numeric balance currently held against this line. A positive balance means that the perspective account holds value; a negative balance means that the perspective account owes value. |
| `currency` | String - [Currency Code](/docs/references/protocol/data-types/currency-formats#currency-codes) | Yes | The currency code of the token this trust line can hold. |
| `limit` | [String Number](/docs/references/protocol/data-types/currency-formats#string-numbers) | Yes | The maximum amount of the given currency that this account is willing to owe the peer account |
| `limit_peer` | [String Number](/docs/references/protocol/data-types/currency-formats#string-numbers) | Yes | The maximum amount of currency that the counterparty account is willing to owe the perspective account |
| `quality_in` | Number | Yes | Rate at which the account values incoming balances on this trust line, as a ratio of this value per 1 billion units. (For example, a value of 500 million represents a 0.5:1 ratio.) As a special case, 0 is treated as a 1:1 ratio. |
| `quality_out` | Number | Yes | Rate at which the account values outgoing balances on this trust line, as a ratio of this value per 1 billion units. (For example, a value of 500 million represents a 0.5:1 ratio.) As a special case, 0 is treated as a 1:1 ratio. |
| `no_ripple` | Boolean | No | If `true`, this account has enabled the [No Ripple flag](/docs/concepts/tokens/fungible-tokens/rippling) for this trust line. If present and `false`, this account has disabled the No Ripple flag, but, because the account also has the Default Ripple flag disabled, that is not considered [the default state](/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate#contributing-to-the-owner-reserve). If omitted, the account has the No Ripple flag disabled for this trust line and Default Ripple enabled. |
| `no_ripple_peer` | Boolean | No | If `true`, the peer account has enabled the [No Ripple flag](/docs/concepts/tokens/fungible-tokens/rippling) for this trust line. If present and `false`, this account has disabled the No Ripple flag, but, because the account also has the Default Ripple flag disabled, that is not considered [the default state](/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate#contributing-to-the-owner-reserve). If omitted, the account has the No Ripple flag disabled for this trust line and Default Ripple enabled. |
| `authorized` | Boolean | No | If `true`, the perspective account has [authorized this trust line](/docs/concepts/tokens/fungible-tokens/authorized-trust-lines). The default is `false`. |
| `peer_authorized` | Boolean | No | If `true`, the counterparty has [authorized this trust line](/docs/concepts/tokens/fungible-tokens/authorized-trust-lines). The default is `false`. |
| `freeze` | Boolean | No | If `true`, the perspective account has [frozen](/docs/concepts/tokens/fungible-tokens/freezes) this trust line. The default is `false`. |
| `freeze_peer` | Boolean | No | If `true`, the counterparty has [frozen](/docs/concepts/tokens/fungible-tokens/freezes) this trust line. The default is `false`. |


## Possible Errors

* Any of the [universal error types](/docs/references/http-websocket-apis/api-conventions/error-formatting#universal-errors).
* `invalidParams` - One or more fields are specified incorrectly, or one or more required fields are missing.
* `actNotFound` - The [Address](/docs/references/protocol/data-types/basic-data-types#addresses) specified in the `account` field of the request does not correspond to an account in the ledger.
* `lgrNotFound` - The ledger specified by the `ledger_hash` or `ledger_index` does not exist, or it does exist but the server does not have it.
* `actMalformed` - If the `marker` field provided is not acceptable.