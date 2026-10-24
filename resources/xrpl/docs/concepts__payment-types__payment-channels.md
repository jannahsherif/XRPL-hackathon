# Payment Channels

Payment Channels are an advanced feature for sending "asynchronous" XRP payments that can be divided into very small increments and settled later.

The XRP for a payment channel is set aside temporarily. The sender creates *Claims* against the channel, which the recipient verifies without sending an XRP Ledger transaction or waiting for a new ledger version to be approved by [consensus](/docs/concepts/consensus-protocol). (This is an *asynchronous* process because it happens separate from the usual pattern of getting transactions approved by consensus.) At any time, the recipient can *redeem* a Claim to receive an amount of XRP authorized by that Claim. Settling a Claim like this uses a standard XRP Ledger transaction, as part of the usual consensus process. This single transaction can encompass any number of transactions guaranteed by smaller Claims.

Because Claims can be verified individually but settled in bulk later, payment channels make it possible to conduct transactions at a rate only limited by the participants' ability to create and verify the digital signatures of those Claims. This limit is primarily based on the speed of the participants' hardware and the complexity of the signature algorithms. For maximum speed, use Ed25519 signatures, which are faster than the XRP Ledger's default secp256k1 ECDSA signatures. Research has [demonstrated the ability to create over Ed25519 100,000 signatures per second and to verify over 70,000 per second](https://ed25519.cr.yp.to/ed25519-20110926.pdf) on commodity hardware in 2011.

## Why Use Payment Channels

The process of using a payment channel always involves two parties, a payer and a payee. The payer is an individual person or institution using the XRP Ledger who is a customer of the payee. The payee is a person or business who receives XRP as payment for goods or services.

Payment Channels do not intrinsically specify anything about what you can buy and sell with them. However, the types of goods and services that are a good fit for payment channels are:

- Things that can be transmitted near-instantly, like digital items
- Inexpensive things, where the cost of processing a transaction is a non-trivial part of the price
- Things normally bought in bulk, where the exact quantity desired is not known in advance


## Payment Channel Lifecycle

The following diagram summarizes the lifecycle of a payment channel:

[](/assets/paychan-flow.1f3109831c3e58f32136c4f198c2b0461ff2ea2c4716567d66e3e135d4e7da21.ac57e6ef.svg)

## See Also

- **Related Concepts:**
  - [Escrow](/docs/concepts/payment-types/escrow), a similar feature for higher-value, lower-speed conditional payments.
- **Tutorials and Use Cases:**
  - [Use Payment Channels](/docs/tutorials/payments/use-payment-channels), a tutorial stepping through the process of using a payment channel.
- **References:**
  - [channel_authorize method](/docs/references/http-websocket-apis/admin-api-methods/signing-methods/channel_authorize)
  - [channel_verify method](/docs/references/http-websocket-apis/public-api-methods/payment-channel-methods/channel_verify)
  - [PayChannel object](/docs/references/protocol/ledger-data/ledger-entry-types/paychannel)
  - [PaymentChannelClaim transaction](/docs/references/protocol/transactions/types/paymentchannelclaim)
  - [PaymentChannelCreate transaction](/docs/references/protocol/transactions/types/paymentchannelcreate)
  - [PaymentChannelFund transaction](/docs/references/protocol/transactions/types/paymentchannelfund)