# Get Started Using HTTP / WebSocket APIs

If you don't have or don't want to use a [client library](/docs/references/client-libraries) in your preferred programming language, you can access the XRP Ledger directly through the APIs of its core server software, [`xrpld`](/docs/concepts/networks-and-servers). The server provides APIs over JSON-RPC and WebSocket protocols. If you don't [run your own instance of `xrpld`](/docs/infrastructure/installation) you can still use a [public server](/docs/tutorials/public-servers).

You can dive right into the API with the [**WebSocket API Tool**](/resources/dev-tools/websocket-api-tool), or use the [XRP Ledger Explorer](https://livenet.xrpl.org/) to watch the progress of the ledger live.

## Differences Between JSON-RPC and WebSocket

Both JSON-RPC and WebSocket are HTTP-based protocols, and for the most part the data provided over both protocols is the same. The major differences are as follows:

- JSON-RPC uses individual HTTP requests and responses for each call, similar to a RESTful API. You can use any common HTTP client such as [curl](https://curl.se/), [Postman](https://www.postman.com/downloads/), or [Requests](https://requests.readthedocs.io/) to access this API.
- WebSocket uses a persistent connection that allows the server to push data to the client. Functions that require push messages, like [event subscriptions](/docs/references/http-websocket-apis/public-api-methods/subscription-methods/subscribe), are only available using WebSocket.


Both APIs can be served unencrypted (`http://` and `ws://`) or encrypted using TLS (`https://` and `wss://`). Unencrypted connections should not be served over open networks, but can be used when the client is on the same machine as the server.

## Admin Access

The API methods are divided into [Public Methods](/docs/references/http-websocket-apis/public-api-methods) and [Admin Methods](/docs/references/http-websocket-apis/admin-api-methods) so that organizations can offer public servers for the benefit of the community. To access admin methods, or admin functionality of public methods, you must connect to the API on a **port and IP address marked as admin** in the server's config file.

The [example config file](https://github.com/XRPLF/rippled/blob/release/3.4.x/cfg/xrpld-example.cfg#L1477-L1494) listens for connections on the local loopback network (127.0.0.1), with JSON-RPC (HTTP) on port 5005 and WebSocket (WS) on port 6006, and treats all connected clients as admin.

## WebSocket API

If you are looking to try out some methods on the XRP Ledger, you can skip writing your own WebSocket code and go straight to using the API at the [WebSocket API Tool](/resources/dev-tools/websocket-api-tool). Later on, when you want to connect to your own `xrpld` server, you can [build your own client](/docs/tutorials/advanced-developer-topics/client-library-development/monitor-incoming-payments-with-websocket) or use a [client library](/docs/references/client-libraries) with WebSocket support.

Example WebSocket API request:

```json
{
  "id": "my_first_request",
  "command": "server_info",
  "api_version": 1
}
```

The response shows you the current status of the server.

Read more: [Request Formatting >](/docs/references/http-websocket-apis/api-conventions/request-formatting) [Response Formatting >](/docs/references/http-websocket-apis/api-conventions/response-formatting) [About the server_info method >](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_info)

## JSON-RPC

You can use any HTTP client (like [RESTED for Firefox](https://addons.mozilla.org/en-US/firefox/addon/rested/), [Postman for Chrome](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en) or [Online HTTP client ExtendsClass](https://extendsclass.com/rest-client-online.html)) to make JSON-RPC calls an `xrpld` server. Most programming languages have a library for making HTTP requests built in. 

Example JSON-RPC request:

```json
POST http://s1.ripple.com:51234/
Content-Type: application/json

{
    "method": "server_info",
    "params": [
        {
            "api_version": 1
        }
    ]
}
```

The response shows you the current status of the server.

Read more: [Request Formatting >](/docs/references/http-websocket-apis/api-conventions/request-formatting#json-rpc-format) [Response Formatting >](/docs/references/http-websocket-apis/api-conventions/response-formatting) [About the server_info method >](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_info)

## Commandline

The commandline interface connects to the same service as the JSON-RPC one, so the public servers and server configuration are the same. By default, the commandline connects to an `xrpld` server running on the same machine.

Example commandline request:

```
xrpld --conf=/etc/xrpld/xrpld.cfg server_info
```

Read more: [Commandline Usage Reference >](/docs/infrastructure/commandline-usage)

The commandline interface is intended for administrative purposes only and is *not a supported API*.  New versions of `xrpld` may introduce breaking changes to the commandline API without warning!

## Available Methods

For a full list of API methods, see:

- [Public `xrpld` Methods](/docs/references/http-websocket-apis/public-api-methods): Methods available on public servers, including looking up data from the ledger and submitting transactions.
- [Admin `xrpld` Methods](/docs/references/http-websocket-apis/admin-api-methods): Methods for [managing](/docs/infrastructure/installation/install-xrpld-on-ubuntu) the `xrpld` server.


## See Also

- **Concepts:**
  - [XRP Ledger Overview](/about/)
  - [Client Libraries](/docs/references/client-libraries)
  - [Parallel Networks](/docs/concepts/networks-and-servers/parallel-networks)
- **Tutorials:**
  - [Get Started Using JavaScript](/docs/tutorials/get-started/get-started-javascript)
  - [Reliable Transaction Submission](/docs/concepts/transactions/reliable-transaction-submission)
  - [Manage the xrpld Server](/docs/infrastructure/installation/install-xrpld-on-ubuntu)
- **References:**
  - [xrpld API Reference](/docs/references/http-websocket-apis)