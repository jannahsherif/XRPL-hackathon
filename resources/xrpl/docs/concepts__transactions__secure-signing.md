# Secure Signing

To submit [transactions](/docs/concepts/transactions) to the XRP Ledger, you need a way to digitally sign them without compromising the security of your [secret keys](/docs/concepts/accounts/cryptographic-keys). (If others gain access to your secret keys, they have as much control over your accounts as you do, and can steal or destroy all your money.) This page summarizes how to set up such an environment so you can sign transactions securely.

If you are not submitting transactions to the network, you can safely use a trustworthy public server, such as the ones run by Ripple, to monitor for incoming transactions or read other network activity. All transactions, balances, and data in the XRP Ledger are public.

There are several configurations with varying levels of security that may be acceptable for your situation. Choose one of the following that best fits your needs:

- [Run `xrpld` locally](#run-xrpld-locally), or [in the same LAN](#run-xrpld-on-the-same-lan).
- [Use a client library](#use-a-client-library-with-local-signing) that can do local signing.
- [Use a dedicated signing device](#use-a-dedicated-signing-device) that supports XRP Ledger signatures.
- [Use a secure VPN to connect to a remote `xrpld` machine](#use-a-secure-vpn-with-a-remote-xrpld-server) you trust.


## Insecure Configurations

[](/assets/insecure-signing-options.2dc3d634de9f562fb69f0720e17cf9a2a33c41347e3ef667c71234fda24a467c.ac57e6ef.svg)

Any configuration in which outside sources may gain access to your secret key is dangerous, and is likely to result in a malicious user stealing all your XRP (and anything else your XRP Ledger address has). Examples of such configurations include ones where you use the [sign method](/docs/references/http-websocket-apis/admin-api-methods/signing-methods/sign) of someone else's `xrpld` server over the internet, or you send your secret key in plain text over the internet to your own server.

You should maintain the secrecy of your secret keys at all times, which includes things like not emailing them to yourself, not typing them visibly in public, and saving them encrypted—never in plain text—when you are not using them. The balance between security and convenience depends in part on the value of your addresses' holdings, so you may want to use multiple addresses with different security configurations for different purposes.

## Run xrpld Locally

[](/assets/secure-signing-local-xrpld.eee564828470d65e6066ccc3012f7db431c84d8cf59b041b1cc4a7aa83759a36.ac57e6ef.svg)

In this configuration, you run `xrpld` on the machine that generates the transactions.  Since the secret key never leaves your machine, no one without access to your machine can get access to the secret key. You should, of course, follow industry-standard practices for securing your machine. To use this configuration:

1. [Install `xrpld`](/docs/infrastructure/installation).
Be sure that your local machine meets the minimum [system requirements for `xrpld`](/docs/infrastructure/installation/system-requirements).
2. When you need to sign transactions, connect to your server on `localhost` or `127.0.0.1`. Use the [sign method](/docs/references/http-websocket-apis/admin-api-methods/signing-methods/sign) (for single signatures) or [sign_for method](/docs/references/http-websocket-apis/admin-api-methods/signing-methods/sign_for) (for multi-signatures).
The [example config file](https://github.com/XRPLF/rippled/blob/1599c1a672587a6797e6cd125bd8d319737d4418/cfg/xrpld-example.cfg#L1477-L1495) listens for connections on the local loopback network (127.0.0.1), with JSON-RPC (HTTP) on port 5005 and WebSocket (WS) on port 6006, and treats all connected clients as admin.
Using the [commandline API](/docs/references/http-websocket-apis/api-conventions/request-formatting#commandline-format) for signatures is less secure than [using the Websocket or JSON-RPC APIs](/docs/tutorials/get-started/get-started-http-websocket-apis) through non-commandline clients. When using the commandline syntax, your secret key may be visible to other users in the system's process listing, and your shell history may save the key in plain text.
3. Maintain the server to keep it running, updated, and in sync with the network while you're using it.
You *can* turn off your `xrpld` server when you're not sending transactions, but it can take up to 15 minutes to sync with the network when you start it up again.


## Run xrpld on the same LAN

[](/assets/secure-signing-lan-xrpld.4338d1073b8667f29a581401f887c60ad6bbb4b8f3861e09eaaf649797126cab.ac57e6ef.svg)

In this configuration, you run an `xrpld` server on a dedicated machine in the same private local area network (LAN) as the machine that generates the transactions to be signed. This configuration lets you assemble transaction instructions on one or more machines with very modest system specs, while using a single dedicated machine for running `xrpld`. This may appeal to you if you run your own datacenter or server room.

To use this configuration, set the `xrpld` server to accept `wss` and `https` connections within your LAN. You can use a self-signed certificate if you use [certificate pinning](https://en.wikipedia.org/wiki/Transport_Layer_Security#Certificate_pinning), or you can use a certificate signed by an in-house or well-known Certificate Authority. Some certificate authorities, such as [Let's Encrypt](https://letsencrypt.org/) issue certificates automatically for free.

As always, follow industry-standard practices for securing your machines, such as using a firewall, anti-virus, appropriate user permissions, and so on.

## Use a Client Library with Local Signing

[](/assets/secure-signing-client-library.b3cd25c60278c248c367b79c8eccbf42a147dc92beba0da7c4713fdda4782e8c.ac57e6ef.svg)

This configuration uses a client library with built-in signing, in the programming language you use. For a list of libraries that can perform local signing, see [Client Libraries](/docs/references/client-libraries).

### Security Best Practices for Signing Libraries

To optimize the security of your signing library:

* Make sure the signing library you use has properly and securely implemented its signing algorithm(s). For example, if the library uses the default ECDSA algorithm, it should also use deterministic nonces as described in [RFC-6979](https://tools.ietf.org/html/rfc6979).
All of the published libraries listed above follow industry best practices.
* Keep your client library updated to the latest stable version.
* For enhanced security, you can load your secret keys from a management tool such as [Vault](https://www.vaultproject.io/).


### Local Signing Example

Here are examples of how to sign transaction instructions locally using the following languages and libraries:

* **JavaScript** / **TypeScript** - [`xrpl.js`](https://github.com/XRPLF/xrpl.js)
* **Python** - [`xrpl-py`](https://github.com/XRPLF/xrpl-py)
* **Java** - [`xrpl4j`](https://github.com/XRPLF/xrpl4j)


JavaScript
```js
// Sample code demonstrating secure offline signing using xrpl.js library.
const xrpl = require('xrpl')

// Load seed value from an environment variable:
const my_wallet = xrpl.Wallet.fromSeed(process.env['MY_SEED'])

// For offline signing, you need to know your address's next Sequence number.
// Alternatively, you could use a Ticket in place of the Sequence number.
// This is useful when you need multiple signatures and may want to process transactions out-of-order.
// For details, see: https://xrpl.org/tickets.html
let my_seq = 21404872

// Provide *all* required fields before signing a transaction
const txJSON = {
  "Account": my_wallet.address,
  "TransactionType":"Payment",
  "Destination":"rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
  "DeliverMax":"13000000",
  "Flags":2147483648,
  "LastLedgerSequence":7835923, // Optional, but recommended.
  "Fee":"13",
  "Sequence": my_seq
}

const signed = my_wallet.sign(txJSON)

console.log("tx_blob is:", signed.tx_blob)
console.log("tx hash is:", signed.tx_json.hash)
```

Python
```py
# Define signer address
import os  
my_secret = os.getenv("MYSECRET")
from xrpl.wallet import Wallet
wallet = Wallet.from_seed(seed=my_secret)
print(wallet.address)  # "raaFKKmgf6CRZttTVABeTcsqzRQ51bNR6Q"

# For offline signing, you need to know your address's next Sequence number.
# Alternatively, you could use a Ticket in place of the Sequence number.
# This is useful when you need multiple signatures and may want to process transactions out-of-order.
# For details, see: https://xrpl.org/tickets.html
sequence = 0

from xrpl.models.transactions import Payment
from xrpl.utils import xrp_to_drops
my_payment = Payment(
    account=wallet.address,
    amount=xrp_to_drops(22),
    fee="10",
    destination="rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
    sequence=sequence,
)
print("Payment object:", my_payment)

# Sign transaction -------------------------------------------------------------
import xrpl.transaction 
signed = xrpl.transaction.sign(my_payment, wallet)
print("Signed transaction blob:", signed)
```

Java
```java
////////////////////////////////////////////////////////////////////////////
// Sign using a SingleKeySignatureService:
// This implementation of SignatureService signs Transactions using a
// supplied PrivateKey. This may be suitable for some applications, but is
// likely not secure enough for server side applications, as keys should not
// be stored in memory whenever possible.
////////////////////////////////////////////////////////////////////////////

// Create a random wallet
KeyPair randomKeyPair = Seed.ed25519Seed().deriveKeyPair();
PublicKey publicKey = randomKeyPair.publicKey();
PrivateKey privateKey = randomKeyPair.privateKey()

// Construct a SignatureService
SignatureService<PrivateKey> signatureService = new BcSignatureService();

// Construct and sign the Payment
Payment payment = Payment.builder()
  .account(publicKey.deriveAddress())
  .destination(Address.of("rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"))
  .amount(XrpCurrencyAmount.ofDrops(1000))
  .fee(XrpCurrencyAmount.ofDrops(10))
  .sequence(UnsignedInteger.valueOf(16126889))
  .signingPublicKey(publicKey)
  .build();
SingleSignedTransaction<Payment> signedPayment = signatureService.sign(privateKey, payment);
System.out.println("Signed Payment: " + signedPayment.signedTransaction());


////////////////////////////////////////////////////////////////////////////
// Sign using a DerivedKeysSignatureService:
// This implementation of SignatureService deterministically derives
// Private Keys from a secret value (likely a server secret) and a wallet
// identifier. That PrivateKey can then be used to sign transactions.
// The wallet identifier can be anything, but would likely be an existing ID
// tracked by a server side system.
//
// Though this implementation is more secure than SingleKeySignatureService
// and better suited for server-side applications, keys are still held
// in memory. For the best security, we suggest using a HSM-based
// implementation.
////////////////////////////////////////////////////////////////////////////

// Construct a DerivedKeysSignatureService with a server secret (in this case "shh")
SignatureService<PrivateKeyReference> derivedKeySignatureService = new BcDerivedKeySignatureService(
  () -> ServerSecret.of("shh".getBytes())
);

PrivateKeyReference privateKeyReference = new PrivateKeyReference() {
  @Override
  public KeyType keyType() {
    return KeyType.ED25519;
  }

  @Override
  public String keyIdentifier() {
    return "sample-keypair";
  }
};

// Get the public key and classic address for the given walletId
PublicKey publicKey = derivedKeySignatureService.derivePublicKey(privateKeyReference);
Address classicAddress = publicKey.deriveAddress();

// Construct and sign the Payment
Payment payment = Payment.builder()
  .account(classicAddress)
  .destination(Address.of("rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"))
  .amount(XrpCurrencyAmount.ofDrops(1000))
  .fee(XrpCurrencyAmount.ofDrops(10))
  .sequence(UnsignedInteger.valueOf(16126889))
  .signingPublicKey(publicKey)
  .build();

SingleSignedTransaction<Payment> signedPayment = derivedKeySignatureService.sign(privateKeyReference, payment);
System.out.println("Signed Payment: " + signedPayment.signedTransaction());
```

## Use a Dedicated Signing Device

[](/assets/secure-signing-dedicated-hardware.f350eea2904a27931ec5e72faef200b4c88c7f0305d13e1da49d93cbded62a52.ac57e6ef.svg)

Some companies sell dedicated signing devices, such as the [Ledger Nano S](https://www.ledger.com/products/ledger-nano-s), which are capable of signing XRP Ledger transactions using a secret key that never leaves the device. Some devices may not support all types of transactions.

Setting up this configuration depends on the specific device. You may need to run a "manager" application on your machine to interact with the signing device. See the manufacturer's instructions for how to set up and use such a device.

## Use a Secure VPN with a Remote xrpld Server

[](/assets/secure-signing-over-vpn.2d5c76c17db52931449a9b0d1fdb849b180dc065b9463756529e5e0c69ef0f05.ac57e6ef.svg)

This configuration uses an `xrpld` server hosted remotely, such as in a colocation facility or a distant datacenter, but connects to it securely using an encrypted VPN.

To use this configuration, follow the steps for [running `xrpld` on a private LAN](#run-xrpld-on-the-same-lan), but use a VPN to connect to the LAN of the remote `xrpld` server. Instructions for setting up the VPN are specific to your environment and are not described in this guide.

## See Also

- **Concepts:**
  - [Cryptographic Keys](/docs/concepts/accounts/cryptographic-keys)
  - [Multi-Signing](/docs/concepts/accounts/multi-signing)
- **Tutorials:**
  - [Install xrpld](/docs/infrastructure/installation)
  - [Assign a Regular Key Pair](/docs/tutorials/best-practices/key-management/assign-a-regular-key-pair)
  - [Reliable Transaction Submission](/docs/concepts/transactions/reliable-transaction-submission)
  - [Enable Public Signing](/docs/infrastructure/configuration/enable-public-signing)
- **References:**
  - [sign method](/docs/references/http-websocket-apis/admin-api-methods/signing-methods/sign)
  - [submit method](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/submit)
  - [xrpl.js Reference](https://js.xrpl.org/)
  - [`xrpl-py` Reference](https://xrpl-py.readthedocs.io/en/latest/index.html)
  - [`xrpl4j` Reference](https://javadoc.io/doc/org.xrpl/)