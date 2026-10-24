# Public API Methods

Communicate directly with an [XRP Ledger server](/docs/concepts/networks-and-servers) using the public API methods. Public methods are not necessarily meant for the general public, but they are used by any client attached to the server. Think of public methods as being for members or customers of the organization running the server.

## [Account Methods](/docs/references/http-websocket-apis/public-api-methods/account-methods)

An account in the XRP Ledger represents a holder of XRP and a sender of transactions. Use these methods to work with account info.

* **[`account_channels`](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_channels)** - Get a list of payment channels where the account is the source of the channel.
* **[`account_currencies`](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_currencies)** - Get a list of currencies an account can send or receive.
* **[`account_info`](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_info)** - Get basic data about an account.
* **[`account_lines`](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_lines)** - Get info about an account's trust lines.
* **[`account_nfts`](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_nfts)** - Get a list of non-fungible tokens owned by an account.
* **[`account_objects`](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_objects)** - Get all ledger objects owned by an account.
* **[`account_offers`](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_offers)** - Get info about an account's currency exchange offers.
* **[`account_tx`](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_tx)** - Get info about an account's transactions.
* **[`gateway_balances`](/docs/references/http-websocket-apis/public-api-methods/account-methods/gateway_balances)** - Calculate total amounts issued by an account.
* **[`noripple_check`](/docs/references/http-websocket-apis/public-api-methods/account-methods/noripple_check)** - Get recommended changes to an account's Default Ripple and No Ripple settings.


## [Ledger Methods](/docs/references/http-websocket-apis/public-api-methods/ledger-methods)

A ledger version contains a header, a transaction tree, and a state tree, which contain account settings, trust lines, balances, transactions, and other data. Use these methods to retrieve ledger info.

* **[`ledger`](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger)** - Get info about a ledger version.
* **[`ledger_closed`](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger_closed)** - Get the latest closed ledger version.
* **[`ledger_current`](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger_current)** - Get the current working ledger version.
* **[`ledger_data`](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger_data)** - Get the raw contents of a ledger version.
* **[`ledger_entry`](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger_entry)** - Get one element from a ledger version.


## [Transaction Methods](/docs/references/http-websocket-apis/public-api-methods/transaction-methods)

Transactions are the only thing that can modify the shared state of the XRP Ledger. All business on the XRP Ledger takes the form of transactions. Use these methods to work with transactions.

* **[`submit`](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/submit)** - Send a transaction to the network.
* **[`submit_multisigned`](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/submit_multisigned)** - Send a multi-signed transaction to the network.
* **[`transaction_entry`](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/transaction_entry)** - Retrieve info about a transaction from a particular ledger version.
* **[`tx`](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/tx)** - Retrieve info about a transaction from all the ledgers on hand.


By default, the following methods are [admin-only](/docs/references/http-websocket-apis/admin-api-methods). They can be used as public methods if the server admin has [enabled public signing](/docs/infrastructure/configuration/enable-public-signing).

* **[`sign`](/docs/references/http-websocket-apis/admin-api-methods/signing-methods/sign)** - Cryptographically sign a transaction.
* **[`sign_for`](/docs/references/http-websocket-apis/admin-api-methods/signing-methods/sign_for)** - Contribute to a multi-signature.


## [Path and Order Book Methods](/docs/references/http-websocket-apis/public-api-methods/path-and-order-book-methods)

Paths define a way for payments to flow through intermediary steps on their way from sender to receiver. Paths enable cross-currency payments by connecting sender and receiver through order books. Use these methods to work with paths and other books.

* **[`amm_info`](/docs/references/http-websocket-apis/public-api-methods/path-and-order-book-methods/amm_info)** - Get info about an Automated Market Maker (AMM).
* **[`book_offers`](/docs/references/http-websocket-apis/public-api-methods/path-and-order-book-methods/book_offers)** - Get info about offers to exchange two currencies.
* **[`deposit_authorized`](/docs/references/http-websocket-apis/public-api-methods/path-and-order-book-methods/deposit_authorized)** - Look up whether one account is authorized to send payments directly to another.
* **[`nft_buy_offers`](/docs/references/http-websocket-apis/public-api-methods/path-and-order-book-methods/nft_buy_offers)** - Retrieve a list of buy offers for a specified NFToken object.
* **[`nft_sell_offers`](/docs/references/http-websocket-apis/public-api-methods/path-and-order-book-methods/nft_sell_offers)** - Retrieve a list of sell offers for a specified NFToken object.
* **[`path_find`](/docs/references/http-websocket-apis/public-api-methods/path-and-order-book-methods/path_find)** - Find a path for a payment between two accounts and receive updates.
* **[`ripple_path_find`](/docs/references/http-websocket-apis/public-api-methods/path-and-order-book-methods/ripple_path_find)** - Find a path for payment between two accounts, once.


## [Payment Channel Methods](/docs/references/http-websocket-apis/public-api-methods/payment-channel-methods)

Payment channels are a tool for facilitating repeated, unidirectional payments, or temporary credit between two parties. Use these methods to work with payment channels.

* **[`channel_verify`](/docs/references/http-websocket-apis/public-api-methods/payment-channel-methods/channel_verify)** - Check a payment channel claim's signature.


By default, the following method is [admin-only](/docs/references/http-websocket-apis/admin-api-methods). It can be used as a public method if the server admin has [enabled public signing](/docs/infrastructure/configuration/enable-public-signing).

* **[`channel_authorize`](/docs/references/http-websocket-apis/admin-api-methods/signing-methods/channel_authorize)** - Sign a claim for money from a payment channel.


## [Subscription Methods](/docs/references/http-websocket-apis/public-api-methods/subscription-methods)

Use these methods to enable the server to push updates to your client when various events happen, so that you can know and react right away. *WebSocket API only.*

* **[`subscribe`](/docs/references/http-websocket-apis/public-api-methods/subscription-methods/subscribe)** - Listen for updates about a particular subject.
* **[`unsubscribe`](/docs/references/http-websocket-apis/public-api-methods/subscription-methods/unsubscribe)** - Stop listening for updates about a particular subject.


## [Server Info Methods](/docs/references/http-websocket-apis/public-api-methods/server-info-methods)

Use these methods to retrieve information about the current state of the `xrpld` server.

* **[`fee`](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/fee)** - Get information about transaction cost.
* **[`feature`](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/feature)** - Returns information about amendments this server knows about.
* **[`server_info`](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_info)** - Retrieve status of the server in human-readable format.
* **[`server_state`](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_state)** - Retrieve status of the server in machine-readable format.
* **[`server_definitions`](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/server_definitions)** - Retrieve a list of types and fields used for the XRPL's canonical binary format.
* **[`manifest`](/docs/references/http-websocket-apis/public-api-methods/server-info-methods/manifest)** - Retrieve the latest ephemeral public key information about a known validator.


## [Clio Methods](/docs/references/http-websocket-apis/public-api-methods/clio-methods)

Use these methods to retrieve information using Clio server APIs.

* **[`server_info`](/docs/references/http-websocket-apis/public-api-methods/clio-methods/server_info-clio)** - Retrieve status of the Clio server.
* **[`ledger`](/docs/references/http-websocket-apis/public-api-methods/clio-methods/ledger-clio)** - Get info about a ledger version using Clio server's `ledger` API.
* **[`nft_info`](/docs/references/http-websocket-apis/public-api-methods/clio-methods/nft_info)** - Retrieve information about the specified NFT using Clio server's `nft_info` API.
* **[`nft_history`](/docs/references/http-websocket-apis/public-api-methods/clio-methods/nft_history)** - Retrieve the history of ownership and transfers for the specified NFT.
* **[`nfts_by_issuer`](/docs/references/http-websocket-apis/public-api-methods/clio-methods/nfts_by_issuer)** - Returns a list of NFTokens that are issued by the specified account.
* **[`mpt_holders`](/docs/references/http-websocket-apis/public-api-methods/clio-methods/mpt_holders)** - Returns all holders of a given MPT issuance and their balances.
* **[`account_mptokens`](/docs/references/http-websocket-apis/public-api-methods/clio-methods/account_mptokens)** - Returns the MPTokens held by the specified account and their balances.
* **[`account_mptoken_issuances`](/docs/references/http-websocket-apis/public-api-methods/clio-methods/account_mptoken_issuances)** - Returns the MPTokenIssuances created by the specified account.


## [Utility Methods](/docs/references/http-websocket-apis/public-api-methods/utility-methods)

Use these methods to perform convenient tasks, such as ping and random number generation.

* **[`json`](/docs/references/http-websocket-apis/public-api-methods/utility-methods/json)** - Use as a proxy to running other commands. Accepts the parameters for the command as a JSON value. *Commandline only.*
* **[`ping`](/docs/references/http-websocket-apis/public-api-methods/utility-methods/ping)** - Confirm connectivity with the server.
* **[`random`](/docs/references/http-websocket-apis/public-api-methods/utility-methods/random)** - Generate a random number.


## [Vault Methods](/docs/references/http-websocket-apis/public-api-methods/vault-methods)

Use these methods to retrieve vault information.

* **[`vault_info`](/docs/references/http-websocket-apis/public-api-methods/vault-methods/vault_info)** - Get information about a specific vault.


## Deprecated Methods

The following methods are deprecated and either have been removed, or may be removed without further notice:

* **`owner_info`** - Use [`account_objects`](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_objects) instead.
* **[`tx_history`](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/tx_history)** - Use either the [account_tx method](/docs/references/http-websocket-apis/public-api-methods/account-methods/account_tx), or the [ledger method](/docs/references/http-websocket-apis/public-api-methods/ledger-methods/ledger) with the `transactions` field set to `true`.