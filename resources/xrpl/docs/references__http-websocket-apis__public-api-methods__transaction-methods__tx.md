# tx

[Source](https://github.com/XRPLF/rippled/blob/release/3.4.x/src/xrpld/rpc/handlers/transaction/Tx.cpp)

The `tx` method retrieves information on a single [transaction](/docs/references/protocol/transactions), by its [identifying hash](/docs/concepts/transactions#identifying-transactions) or its [CTID](/docs/references/http-websocket-apis/api-conventions/ctid).

## Request Format

An example of the request format:

WebSocket (Hash)
```json
{
  "id": "example_tx_hash",
  "command": "tx",
  "transaction": "C53ECF838647FA5A4C780377025FEC7999AB4182590510CA461444B207AB74A9",
  "binary": false,
  "api_version": 2
}
```

WebSocket (CTID)
```json
{
  "id": "example_tx_ctid",
  "command": "tx",
  "ctid": "C363B1DD00000000",
  "binary": false,
  "api_version": 2
}
```

JSON-RPC (Hash)
```json
{
    "method": "tx",
    "params": [
        {
            "transaction": "C53ECF838647FA5A4C780377025FEC7999AB4182590510CA461444B207AB74A9",
            "binary": false,
            "api_version": 2
        }
    ]
}
```

JSON-RPC (CTID)
```json
{
    "method": "tx",
    "params": [
        {
            "ctid": "C363B1DD00000000",
            "binary": false,
            "api_version": 2
        }
    ]
}
```

Commandline
```sh
#Syntax: tx transaction [binary]
xrpld tx C53ECF838647FA5A4C780377025FEC7999AB4182590510CA461444B207AB74A9 false
```

The request includes the following parameters:

| Field | Type | Required? | Description |
|  --- | --- | --- | --- |
| `ctid` | String | No | The [compact transaction identifier](/docs/references/http-websocket-apis/api-conventions/ctid) of the transaction to look up. Must use uppercase hexadecimal only. New in: rippled 1.12.0 *(Not supported in Clio v2.0 and earlier)* |
| `transaction` | String | No | The 256-bit hash of the transaction to look up, as hexadecimal. |
| `binary` | Boolean | No | If `true`, return transaction data and metadata as binary [serialized](/docs/references/protocol/binary-format) to hexadecimal strings. If `false`, return transaction data and metadata as JSON. The default is `false`. |
| `min_ledger` | Number | No | Use this with `max_ledger` to specify a range of up to 1000 [ledger indexes](/docs/references/protocol/data-types/basic-data-types#ledger-index), starting with this ledger (inclusive). If the server [cannot find the transaction](#not-found-response), it confirms whether it was able to search all the ledgers in this range. |
| `max_ledger` | Number | No | Use this with `min_ledger` to specify a range of up to 1000 [ledger indexes](/docs/references/protocol/data-types/basic-data-types#ledger-index), ending with this ledger (inclusive). If the server [cannot find the transaction](#not-found-response), it confirms whether it was able to search all the ledgers in the requested range. |


You must provide *either* `ctid` or `transaction`, but not both.

This command may successfully find the transaction even if it is included in a ledger *outside* the range of `min_ledger` to `max_ledger`.

## Response Format

An example of a successful response:

WebSocket
```json
{
  "result": {
    "tx_json": {
      "Account": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
      "Fee": "12",
      "Flags": 0,
      "LastLedgerSequence": 56865248,
      "OfferSequence": 5037708,
      "Sequence": 5037710,
      "SigningPubKey": "03B51A3EDF70E4098DA7FB053A01C5A6A0A163A30ED1445F14F87C7C3295FCB3BE",
      "TakerGets": "15000000000",
      "TakerPays": {
        "currency": "CNY",
        "issuer": "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",
        "value": "20160.75"
      },
      "TransactionType": "OfferCreate",
      "TxnSignature": "3045022100A5023A0E64923616FCDB6D664F569644C7C9D1895772F986CD6B981B515B02A00220530C973E9A8395BC6FE2484948D2751F6B030FC7FB8575D1BFB406368AD554D9",
      "ledger_index": 56865245,
      "ctid": "C363B1DD00000000",
      "date": 648248020
    },
    "hash": "C53ECF838647FA5A4C780377025FEC7999AB4182590510CA461444B207AB74A9",
    "meta": {
      "AffectedNodes": [
        {
          "ModifiedNode": {
            "FinalFields": {
              "ExchangeRate": "4f04c66806cf7400",
              "Flags": 0,
              "RootIndex": "02BAAC1E67C1CE0E96F0FA2E8061020536CEDD043FEB0FF54F04C66806CF7400",
              "TakerGetsCurrency": "0000000000000000000000000000000000000000",
              "TakerGetsIssuer": "0000000000000000000000000000000000000000",
              "TakerPaysCurrency": "000000000000000000000000434E590000000000",
              "TakerPaysIssuer": "CED6E99370D5C00EF4EBF72567DA99F5661BFB3A"
            },
            "LedgerEntryType": "DirectoryNode",
            "LedgerIndex": "02BAAC1E67C1CE0E96F0FA2E8061020536CEDD043FEB0FF54F04C66806CF7400"
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Account": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
              "Balance": "10404767991",
              "Flags": 0,
              "OwnerCount": 3,
              "Sequence": 5037711
            },
            "LedgerEntryType": "AccountRoot",
            "LedgerIndex": "1DECD9844E95FFBA273F1B94BA0BF2564DDF69F2804497A6D7837B52050174A2",
            "PreviousFields": {
              "Balance": "10404768003",
              "Sequence": 5037710
            },
            "PreviousTxnID": "4DC47B246B5EB9CCE92ABA8C482479E3BF1F946CABBEF74CA4DE36521D5F9008",
            "PreviousTxnLgrSeq": 56865244
          }
        },
        {
          "DeletedNode": {
            "FinalFields": {
              "Account": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
              "BookDirectory": "02BAAC1E67C1CE0E96F0FA2E8061020536CEDD043FEB0FF54F04C66806CF7400",
              "BookNode": "0",
              "Flags": 0,
              "OwnerNode": "0",
              "PreviousTxnID": "8F5FF57B404827F12BDA7561876A13C3E3B3095CBF75334DBFB5F227391A660C",
              "PreviousTxnLgrSeq": 56865244,
              "Sequence": 5037708,
              "TakerGets": "15000000000",
              "TakerPays": {
                "currency": "CNY",
                "issuer": "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",
                "value": "20160.75"
              }
            },
            "LedgerEntryType": "Offer",
            "LedgerIndex": "26AAE6CA8D29E28A47C92ADF22D5D96A0216F0551E16936856DDC8CB1AAEE93B"
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Flags": 0,
              "IndexNext": "0",
              "IndexPrevious": "0",
              "Owner": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
              "RootIndex": "47FAF5D102D8CE655574F440CDB97AC67C5A11068BB3759E87C2B9745EE94548"
            },
            "LedgerEntryType": "DirectoryNode",
            "LedgerIndex": "47FAF5D102D8CE655574F440CDB97AC67C5A11068BB3759E87C2B9745EE94548"
          }
        },
        {
          "CreatedNode": {
            "LedgerEntryType": "Offer",
            "LedgerIndex": "8BAEE3C7DE04A568E96007420FA11ABD0BC9AE44D35932BB5640E9C3FB46BC9B",
            "NewFields": {
              "Account": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
              "BookDirectory": "02BAAC1E67C1CE0E96F0FA2E8061020536CEDD043FEB0FF54F04C66806CF7400",
              "Sequence": 5037710,
              "TakerGets": "15000000000",
              "TakerPays": {
                "currency": "CNY",
                "issuer": "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",
                "value": "20160.75"
              }
            }
          }
        }
      ],
      "TransactionIndex": 0,
      "TransactionResult": "tesSUCCESS"
    },
    "validated": true,
    "ledger_index": 56865245,
    "ledger_hash": "793E56131D8D4ABFB27FA383BFC44F2978B046E023FF46C588D7E0C874C2472A",
    "close_time_iso": "2020-07-16T20:53:40Z",
    "ctid": "C363B1DD00000000"
  },
  "id": "example_tx_hash",
  "api_version": 2,
  "status": "success",
  "type": "response"
}
```

JSON-RPC
```json
200 OK

{
  "result": {
    "tx_json": {
      "Account": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
      "Fee": "12",
      "Flags": 0,
      "LastLedgerSequence": 56865248,
      "OfferSequence": 5037708,
      "Sequence": 5037710,
      "SigningPubKey": "03B51A3EDF70E4098DA7FB053A01C5A6A0A163A30ED1445F14F87C7C3295FCB3BE",
      "TakerGets": "15000000000",
      "TakerPays": {
        "currency": "CNY",
        "issuer": "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",
        "value": "20160.75"
      },
      "TransactionType": "OfferCreate",
      "TxnSignature": "3045022100A5023A0E64923616FCDB6D664F569644C7C9D1895772F986CD6B981B515B02A00220530C973E9A8395BC6FE2484948D2751F6B030FC7FB8575D1BFB406368AD554D9",
      "ledger_index": 56865245,
      "ctid": "C363B1DD00000000",
      "date": 648248020
    },
    "hash": "C53ECF838647FA5A4C780377025FEC7999AB4182590510CA461444B207AB74A9",
    "meta": {
      "AffectedNodes": [
        {
          "ModifiedNode": {
            "FinalFields": {
              "ExchangeRate": "4f04c66806cf7400",
              "Flags": 0,
              "RootIndex": "02BAAC1E67C1CE0E96F0FA2E8061020536CEDD043FEB0FF54F04C66806CF7400",
              "TakerGetsCurrency": "0000000000000000000000000000000000000000",
              "TakerGetsIssuer": "0000000000000000000000000000000000000000",
              "TakerPaysCurrency": "000000000000000000000000434E590000000000",
              "TakerPaysIssuer": "CED6E99370D5C00EF4EBF72567DA99F5661BFB3A"
            },
            "LedgerEntryType": "DirectoryNode",
            "LedgerIndex": "02BAAC1E67C1CE0E96F0FA2E8061020536CEDD043FEB0FF54F04C66806CF7400"
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Account": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
              "Balance": "10404767991",
              "Flags": 0,
              "OwnerCount": 3,
              "Sequence": 5037711
            },
            "LedgerEntryType": "AccountRoot",
            "LedgerIndex": "1DECD9844E95FFBA273F1B94BA0BF2564DDF69F2804497A6D7837B52050174A2",
            "PreviousFields": {
              "Balance": "10404768003",
              "Sequence": 5037710
            },
            "PreviousTxnID": "4DC47B246B5EB9CCE92ABA8C482479E3BF1F946CABBEF74CA4DE36521D5F9008",
            "PreviousTxnLgrSeq": 56865244
          }
        },
        {
          "DeletedNode": {
            "FinalFields": {
              "Account": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
              "BookDirectory": "02BAAC1E67C1CE0E96F0FA2E8061020536CEDD043FEB0FF54F04C66806CF7400",
              "BookNode": "0",
              "Flags": 0,
              "OwnerNode": "0",
              "PreviousTxnID": "8F5FF57B404827F12BDA7561876A13C3E3B3095CBF75334DBFB5F227391A660C",
              "PreviousTxnLgrSeq": 56865244,
              "Sequence": 5037708,
              "TakerGets": "15000000000",
              "TakerPays": {
                "currency": "CNY",
                "issuer": "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",
                "value": "20160.75"
              }
            },
            "LedgerEntryType": "Offer",
            "LedgerIndex": "26AAE6CA8D29E28A47C92ADF22D5D96A0216F0551E16936856DDC8CB1AAEE93B"
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Flags": 0,
              "IndexNext": "0",
              "IndexPrevious": "0",
              "Owner": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
              "RootIndex": "47FAF5D102D8CE655574F440CDB97AC67C5A11068BB3759E87C2B9745EE94548"
            },
            "LedgerEntryType": "DirectoryNode",
            "LedgerIndex": "47FAF5D102D8CE655574F440CDB97AC67C5A11068BB3759E87C2B9745EE94548"
          }
        },
        {
          "CreatedNode": {
            "LedgerEntryType": "Offer",
            "LedgerIndex": "8BAEE3C7DE04A568E96007420FA11ABD0BC9AE44D35932BB5640E9C3FB46BC9B",
            "NewFields": {
              "Account": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
              "BookDirectory": "02BAAC1E67C1CE0E96F0FA2E8061020536CEDD043FEB0FF54F04C66806CF7400",
              "Sequence": 5037710,
              "TakerGets": "15000000000",
              "TakerPays": {
                "currency": "CNY",
                "issuer": "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",
                "value": "20160.75"
              }
            }
          }
        }
      ],
      "TransactionIndex": 0,
      "TransactionResult": "tesSUCCESS"
    },
    "validated": true,
    "ledger_index": 56865245,
    "ledger_hash": "793E56131D8D4ABFB27FA383BFC44F2978B046E023FF46C588D7E0C874C2472A",
    "close_time_iso": "2020-07-16T20:53:40Z",
    "ctid": "C363B1DD00000000",
    "status": "success"
  }
}
```

Commandline
```json
Loading: "/etc/xrpld/xrpld.cfg"
2025-Dec-19 03:16:00.638871262 UTC HTTPClient:NFO Connecting to 127.0.0.1:5005

{
  "result": {
    "tx_json": {
      "Account": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
      "Fee": "12",
      "Flags": 0,
      "LastLedgerSequence": 56865248,
      "OfferSequence": 5037708,
      "Sequence": 5037710,
      "SigningPubKey": "03B51A3EDF70E4098DA7FB053A01C5A6A0A163A30ED1445F14F87C7C3295FCB3BE",
      "TakerGets": "15000000000",
      "TakerPays": {
        "currency": "CNY",
        "issuer": "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",
        "value": "20160.75"
      },
      "TransactionType": "OfferCreate",
      "TxnSignature": "3045022100A5023A0E64923616FCDB6D664F569644C7C9D1895772F986CD6B981B515B02A00220530C973E9A8395BC6FE2484948D2751F6B030FC7FB8575D1BFB406368AD554D9",
      "ledger_index": 56865245,
      "ctid": "C363B1DD00000000",
      "date": 648248020
    },
    "hash": "C53ECF838647FA5A4C780377025FEC7999AB4182590510CA461444B207AB74A9",
    "meta": {
      "AffectedNodes": [
        {
          "ModifiedNode": {
            "FinalFields": {
              "ExchangeRate": "4f04c66806cf7400",
              "Flags": 0,
              "RootIndex": "02BAAC1E67C1CE0E96F0FA2E8061020536CEDD043FEB0FF54F04C66806CF7400",
              "TakerGetsCurrency": "0000000000000000000000000000000000000000",
              "TakerGetsIssuer": "0000000000000000000000000000000000000000",
              "TakerPaysCurrency": "000000000000000000000000434E590000000000",
              "TakerPaysIssuer": "CED6E99370D5C00EF4EBF72567DA99F5661BFB3A"
            },
            "LedgerEntryType": "DirectoryNode",
            "LedgerIndex": "02BAAC1E67C1CE0E96F0FA2E8061020536CEDD043FEB0FF54F04C66806CF7400"
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Account": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
              "Balance": "10404767991",
              "Flags": 0,
              "OwnerCount": 3,
              "Sequence": 5037711
            },
            "LedgerEntryType": "AccountRoot",
            "LedgerIndex": "1DECD9844E95FFBA273F1B94BA0BF2564DDF69F2804497A6D7837B52050174A2",
            "PreviousFields": {
              "Balance": "10404768003",
              "Sequence": 5037710
            },
            "PreviousTxnID": "4DC47B246B5EB9CCE92ABA8C482479E3BF1F946CABBEF74CA4DE36521D5F9008",
            "PreviousTxnLgrSeq": 56865244
          }
        },
        {
          "DeletedNode": {
            "FinalFields": {
              "Account": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
              "BookDirectory": "02BAAC1E67C1CE0E96F0FA2E8061020536CEDD043FEB0FF54F04C66806CF7400",
              "BookNode": "0",
              "Flags": 0,
              "OwnerNode": "0",
              "PreviousTxnID": "8F5FF57B404827F12BDA7561876A13C3E3B3095CBF75334DBFB5F227391A660C",
              "PreviousTxnLgrSeq": 56865244,
              "Sequence": 5037708,
              "TakerGets": "15000000000",
              "TakerPays": {
                "currency": "CNY",
                "issuer": "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",
                "value": "20160.75"
              }
            },
            "LedgerEntryType": "Offer",
            "LedgerIndex": "26AAE6CA8D29E28A47C92ADF22D5D96A0216F0551E16936856DDC8CB1AAEE93B"
          }
        },
        {
          "ModifiedNode": {
            "FinalFields": {
              "Flags": 0,
              "IndexNext": "0",
              "IndexPrevious": "0",
              "Owner": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
              "RootIndex": "47FAF5D102D8CE655574F440CDB97AC67C5A11068BB3759E87C2B9745EE94548"
            },
            "LedgerEntryType": "DirectoryNode",
            "LedgerIndex": "47FAF5D102D8CE655574F440CDB97AC67C5A11068BB3759E87C2B9745EE94548"
          }
        },
        {
          "CreatedNode": {
            "LedgerEntryType": "Offer",
            "LedgerIndex": "8BAEE3C7DE04A568E96007420FA11ABD0BC9AE44D35932BB5640E9C3FB46BC9B",
            "NewFields": {
              "Account": "rhhh49pFH96roGyuC4E5P4CHaNjS1k8gzM",
              "BookDirectory": "02BAAC1E67C1CE0E96F0FA2E8061020536CEDD043FEB0FF54F04C66806CF7400",
              "Sequence": 5037710,
              "TakerGets": "15000000000",
              "TakerPays": {
                "currency": "CNY",
                "issuer": "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",
                "value": "20160.75"
              }
            }
          }
        }
      ],
      "TransactionIndex": 0,
      "TransactionResult": "tesSUCCESS"
    },
    "validated": true,
    "ledger_index": 56865245,
    "ledger_hash": "793E56131D8D4ABFB27FA383BFC44F2978B046E023FF46C588D7E0C874C2472A",
    "close_time_iso": "2020-07-16T20:53:40Z",
    "ctid": "C363B1DD00000000",
    "status": "success"
  }
}
```

API v2
The response follows the [standard format](/docs/references/http-websocket-apis/api-conventions/response-formatting), with a successful result containing the fields of the [Transaction object](/docs/references/protocol/transactions) as well as the following additional fields:

| `Field` | Type | Description |
|  --- | --- | --- |
| `ctid` | String | The transaction's [compact transaction identifier](/docs/references/http-websocket-apis/api-conventions/ctid). New in: rippled 1.12.0 *(Not supported in Clio v2.0 and earlier.)* |
| `close_time_iso` | String | The time the ledger containing this transaction was closed, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format. |
| `date` | Number | The [close time](/docs/concepts/ledgers/ledger-close-times) of the ledger in which the transaction was applied, in [seconds since the Ripple Epoch](/docs/references/protocol/data-types/basic-data-types#specifying-time). |
| `hash` | String | The unique [identifying hash](/docs/concepts/transactions#identifying-transactions) of the transaction |
| `inLedger` | Number | *(Deprecated)* Alias for `ledger_index`. |
| `ledger_index` | Number | The [ledger index](/docs/references/protocol/data-types/basic-data-types#ledger-index) of the ledger that includes this transaction. |
| `meta` | Object (JSON) | (JSON mode) [Transaction metadata](/docs/references/protocol/transactions/metadata), which describes the results of the transaction. |
| `meta_blob` | String (binary) | (Binary mode) [Transaction metadata](/docs/references/protocol/transactions/metadata), which describes the results of the transaction, represented as a hex string. |
| `tx_blob` | String (binary) | (Binary mode) The transaction data represented as a hex string. |
| `tx_json` | Object (JSON) | The transaction data represented in JSON. |
| `validated` | Boolean | If `true`, this data comes from a validated ledger version; if omitted or set to `false`, this data is not final. |


API v1
The response follows the [standard format](/docs/references/http-websocket-apis/api-conventions/response-formatting), with a successful result containing the fields of the [Transaction object](/docs/references/protocol/transactions) as well as the following additional fields:

| `Field` | Type | Description |
|  --- | --- | --- |
| `ctid` | String | The transaction's [compact transaction identifier](/docs/references/http-websocket-apis/api-conventions/ctid). New in: rippled 1.12.0 *(Not supported in Clio v2.0 and earlier.)* |
| `date` | Number | The [close time](/docs/concepts/ledgers/ledger-close-times) of the ledger in which the transaction was applied, in [seconds since the Ripple Epoch](/docs/references/protocol/data-types/basic-data-types#specifying-time). |
| `hash` | String | The unique [identifying hash](/docs/concepts/transactions#identifying-transactions) of the transaction |
| `inLedger` | Number | *(Deprecated)* Alias for `ledger_index`. |
| `ledger_index` | Number | The [ledger index](/docs/references/protocol/data-types/basic-data-types#ledger-index) of the ledger that includes this transaction. |
| `meta` | Object (JSON) or String (binary) | [Transaction metadata](/docs/references/protocol/transactions/metadata), which describes the results of the transaction. |
| `tx` | String (binary) | (Binary mode) The transaction data represented as a hex string. |
| `validated` | Boolean | If `true`, this data comes from a validated ledger version; if omitted or set to `false`, this data is not final. |
| (Various) | (Various) | Other fields from the [Transaction object](/docs/references/protocol/transactions) |


### Not Found Response

If the server does not find the transaction, it returns a `txnNotFound` error, which could mean two things:

- The transaction has not been included in any ledger version, and has not been executed.
- The transaction was included in a ledger version that the server does not have available.


This means that a `txnNotFound` on its own is not enough to know the [final outcome of a transaction](/docs/concepts/transactions/finality-of-results).

To further narrow down the possibilities, you can provide a range of ledgers to search using the `min_ledger` and `max_ledger` fields in the request. If you provide **both** of those fields, the `txnNotFound` response includes the following field:

| Field | Type | Description |
|  --- | --- | --- |
| `searched_all` | Boolean | *(Omitted unless the request provided `min_ledger` and `max_ledger`)* If `true`, the server was able to search all of the specified ledger versions, and the transaction was in none of them. If `false`, the server did not have all of the specified ledger versions available, so it is not sure if one of them might contain the transaction. |


An example of a `txnNotFound` response that fully searched a requested range of ledgers:

WebSocket
```json
{
  "error": "txnNotFound",
  "error_code": 29,
  "error_message": "Transaction not found.",
  "id": 1,
  "request": {
    "binary": false,
    "command": "tx",
    "id": 1,
    "max_ledger": 54368673,
    "min_ledger": 54368573,
    "transaction": "E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7"
  },
  "searched_all": true,
  "status": "error",
  "type": "response"
}
```

JSON-RPC
```json
200 OK

{
  "result": {
    "error": "txnNotFound",
    "error_code": 29,
    "error_message": "Transaction not found.",
    "request": {
      "binary": false,
      "command": "tx",
      "max_ledger": 54368673,
      "min_ledger": 54368573,
      "transaction": "E08D6E9754025BA2534A78707605E0601F03ACE063687A0CA1BDDACFCD1698C7"
    },
    "searched_all": true,
    "status": "error"
  }
}
```

## Possible Errors

* Any of the [universal error types](/docs/references/http-websocket-apis/api-conventions/error-formatting#universal-errors).
* `invalidParams` - One or more fields are specified incorrectly, or one or more required fields are missing.
* `txnNotFound` - Either the transaction does not exist, or it was part of an ledger version that `xrpld` does not have available.
* `excessiveLgrRange` - The `min_ledger` and `max_ledger` fields of the request are more than 1000 apart.
* `invalidLgrRange` - The specified `min_ledger` is larger than the `max_ledger`, or one of those parameters is not a valid ledger index.