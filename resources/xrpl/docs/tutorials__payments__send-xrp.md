# Send XRP

This tutorial explains how to send a direct XRP Payment using `xrpl.js` for JavaScript, `xrpl-py` for Python, `xrpl4j` for Java or `XRPL_PHP` for PHP. First, we step through the process with the [XRP Ledger Testnet](/docs/concepts/networks-and-servers/parallel-networks). Then, we compare that to the additional requirements for doing the equivalent in production.

Check out the [Code Samples](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples) for a complete version of the code used in this tutorial.

## Prerequisites

script
script
To interact with the XRP Ledger, you need to set up a dev environment with the necessary tools. This tutorial provides examples using the following options:

- **JavaScript** with the [xrpl.js library](https://github.com/XRPLF/xrpl.js/). See [Get Started Using JavaScript](/docs/tutorials/get-started/get-started-javascript) for setup steps.
- **Python** with the [`xrpl-py` library](https://xrpl-py.readthedocs.io/). See [Get Started using Python](/docs/tutorials/get-started/get-started-python) for setup steps.
- **Java** with the [xrpl4j library](https://github.com/XRPLF/xrpl4j). See [Get Started Using Java](/docs/tutorials/get-started/get-started-java) for setup steps.
- **PHP** with the [XRPL_PHP library](https://github.com/AlexanderBuzz/xrpl-php). See [Get Started Using PHP](/docs/tutorials/get-started/get-started-php) for setup steps.
- **Go** with the [xrpl-go library](https://github.com/XRPLF/xrpl-go). See [Get Started Using Go](/docs/tutorials/get-started/get-started-go) for setup steps.


## Send a Payment on the Test Net

### 1. Get Credentials

To transact on the XRP Ledger, you need an address and secret key, and some XRP. The address and secret key look like this:

JavaScript
```js
// Example credentials
const wallet = xrpl.Wallet.fromSeed("sn3nxiW7v8KXzPzAqzyHXbSSKNuN9")
console.log(wallet.address) // rMCcNuTcajgw7YTgBy1sys3b89QqjUrMpH
```

Python
```py
# Example Credentials ----------------------------------------------------------
from xrpl.wallet import Wallet
from xrpl.constants import CryptoAlgorithm
test_wallet = Wallet.from_seed(seed="sn3nxiW7v8KXzPzAqzyHXbSSKNuN9", algorithm=CryptoAlgorithm.SECP256K1)
print(test_wallet.address) # "rMCcNuTcajgw7YTgBy1sys3b89QqjUrMpH"
```

Java
```java
// Create a KeyPair
KeyPair randomKeyPair = Seed.ed25519Seed().deriveKeyPair();

// Get the Classic address from testWallet
Address classicAddress = randomKeyPair.publicKey().deriveAddress();
```

PHP
```php
// Example credentials
$wallet = Wallet::fromSeed("sEd7zwWAu7vXMCBkkzokJHEXiKw2B2s");
print_r('Wallet Address: ' . $wallet->getAddress() .PHP_EOL); // rMCcNuTcajgw7YTgBy1sys3b89QqjUrMpH
```

Go
```go
	// Example credentials
	// A fresh test wallet avoids shared accounts with disabled master keys.
	w, err := wallet.New(crypto.ED25519())
	if err != nil {
		panic(err)
	}
```

The secret key shown here is for example only. For development purposes, you can get your own credentials, pre-funded with XRP, on the Testnet using the following interface:

Get Testnet credentials

div
Ripple provides the [Testnet and Devnet](/docs/concepts/networks-and-servers/parallel-networks) for testing purposes only, and sometimes resets the state of these test networks along with all balances. As a precaution, **do not** use the same addresses on Testnet/Devnet and Mainnet.

When you're building production-ready software, you should use an existing account, and manage your keys using a [secure signing configuration](/docs/concepts/transactions/secure-signing).

### 2. Connect to a Testnet Server

First, you must connect to an XRP Ledger server so you can get the current status of your account and the shared ledger. You can use this information to [automatically fill in some required fields of a transaction](/docs/references/protocol/transactions/common-fields#auto-fillable-fields). You also must be connected to the network to submit transactions to it.

The following code connects to a public Testnet servers:

JavaScript
```js
// You can also use a <script> tag in browsers or require('xrpl') in Node.js
import xrpl from 'xrpl'

// Define the network client
const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
await client.connect()

// ... custom code goes here

// Disconnect when done (If you omit this, Node.js won't end the process)
client.disconnect()
```

Python
```py
# Connect ----------------------------------------------------------------------
import xrpl
testnet_url = "https://s.altnet.rippletest.net:51234"
client = xrpl.clients.JsonRpcClient(testnet_url)
```

Java
```java
// Connect --------------------------------------------------------------------
HttpUrl rippledUrl = HttpUrl.get("https://s.altnet.rippletest.net:51234/");
XrplClient xrplClient = new XrplClient(rippledUrl);
```

PHP
```php
// Create a client using the Testnet
$client = new JsonRpcClient("https://s.altnet.rippletest.net:51234");
```

Go
```go
func main() {
	client := websocket.NewClient(
		websocket.NewClientConfig().
			WithHost("wss://s.altnet.rippletest.net:51233").
			WithFaucetProvider(faucet.NewTestnetFaucetProvider()),
	)
	defer client.Disconnect()

	if err := client.Connect(); err != nil {
		panic(err)
	}
```

For this tutorial, click the following button to connect:

Connect to Testnet

div
strong
Connection status: 
span
Not connected
### 3. Prepare Transaction

Typically, we create XRP Ledger transactions as objects in the JSON [transaction format](/docs/references/protocol/transactions). The following example shows a minimal Payment specification:

```json
{
  "TransactionType": "Payment",
  "Account": "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
  "DeliverMax": "2000000",
  "Destination": "rUCzEr6jrEyMpjhs4wSdQdz4g8Y382NxfM"
}
```

The bare minimum set of instructions you must provide for an XRP Payment is:

- An indicator that this is a payment. (`"TransactionType": "Payment"`)
- The sending address. (`"Account"`)
- The address that should receive the XRP (`"Destination"`). This can't be the same as the sending address.
- The amount of XRP to send (`"DeliverMax"`). Typically, this is specified as an integer in "drops" of XRP, where 1,000,000 drops equals 1 XRP.


Technically, a transaction must contain some additional fields, and certain optional fields such as `LastLedgerSequence` are strongly recommended. Some other language-specific notes:

- If you're using `xrpl.js` for JavaScript, you can use the [`Client.autofill()` method](https://js.xrpl.org/classes/Client.html#autofill) to automatically fill in good defaults for the remaining fields of a transaction. In TypeScript, you can also use the transaction models like `xrpl.Payment` to enforce the correct fields.
- With `xrpl-py` for Python, you can use the models in `xrpl.models.transactions` to construct transactions as native Python objects.
- With xrpl4j for Java, you can use the model objects in the `xrpl4j-model` module to construct transactions as Java objects.
  - Unlike the other libraries, you must provide the account `sequence` and the `signingPublicKey` of the source
account of a `Transaction` at the time of construction, as well as a `fee`.


Here's an example of preparing the above payment:

JavaScript
```js
  // Prepare transaction -------------------------------------------------------
  const prepared = await client.autofill({
    "TransactionType": "Payment",
    "Account": wallet.address,
    "DeliverMax": xrpl.xrpToDrops("22"),
    "Destination": "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"
  })
  const max_ledger = prepared.LastLedgerSequence
  console.log("Prepared transaction instructions:", prepared)
  console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP")
  console.log("Transaction expires after ledger:", max_ledger)
```

Python
```py
# Prepare transaction ----------------------------------------------------------
my_payment = xrpl.models.transactions.Payment(
    account=test_wallet.address,
    amount=xrpl.utils.xrp_to_drops(22),
    destination="rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
)
print("Payment object:", my_payment)
```

Java
```java
// Prepare transaction --------------------------------------------------------
// Look up your Account Info
AccountInfoRequestParams requestParams = AccountInfoRequestParams.builder()
  .account(classicAddress)
  .ledgerSpecifier(LedgerSpecifier.VALIDATED)
.build();
AccountInfoResult accountInfoResult = xrplClient.accountInfo(requestParams);
UnsignedInteger sequence = accountInfoResult.accountData().sequence();

// Request current fee information from rippled
FeeResult feeResult = xrplClient.fee();
XrpCurrencyAmount openLedgerFee = feeResult.drops().openLedgerFee();

// Get the latest validated ledger index
LedgerIndex validatedLedger = xrplClient.ledger(
  LedgerRequestParams.builder()
  .ledgerSpecifier(LedgerSpecifier.VALIDATED)
  .build()
)
  .ledgerIndex()
  .orElseThrow(() -> new RuntimeException("LedgerIndex not available."));

// LastLedgerSequence is the current ledger index + 4
UnsignedInteger lastLedgerSequence = validatedLedger.plus(UnsignedInteger.valueOf(4)).unsignedIntegerValue();

// Construct a Payment
Payment payment = Payment.builder()
  .account(classicAddress)
  .amount(XrpCurrencyAmount.ofXrp(BigDecimal.ONE))
  .destination(Address.of("rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"))
  .sequence(sequence)
  .fee(openLedgerFee)
  .signingPublicKey(randomKeyPair.publicKey())
  .lastLedgerSequence(lastLedgerSequence)
  .build();
System.out.println("Constructed Payment: " + payment);
```

PHP
```php
// Transaction definition
$paymentTx = [
    "TransactionType" => "Payment",
    "Account" => $wallet->getAddress(),
    "Amount" => xrpToDrops('50'),
    "Destination" => "rfmMDuKPsXUgpkCvJeS132wtfXWujjHqiW",
    "DestinationTag" => 12345
];

// Autofill mandatory values like Sequence, Fee and LastLedgerSequence
$preparedTx = $client->autofill($paymentTx);
print_r("Prepared tx: " . PHP_EOL);
print_r($preparedTx);
```

Go
```go
	// Prepare a payment transaction
	p := &transaction.Payment{
		BaseTx: transaction.BaseTx{
			Account: types.Address(w.GetAddress()),
		},
		Destination: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
		Amount:      types.XRPCurrencyAmount(xrpAmountInt),
		DeliverMax:  types.XRPCurrencyAmount(xrpAmountInt),
	}

	flattenedTx := p.Flatten()

	if err := client.Autofill(&flattenedTx); err != nil {
		panic(err)
	}
```

Prepare
div
div
span
Send: 
input
div
span
XRP
button
Prepare
  example transaction
div
### 4. Sign the Transaction Instructions

Signing a transaction uses your credentials to authorize the transaction on your behalf. The input to this step is a completed set of transaction instructions (usually JSON), and the output is a binary blob containing the instructions and a signature from the sender.

- **JavaScript:** Use the [`sign()` method of a `Wallet` instance](https://js.xrpl.org/classes/Wallet.html#sign) to sign the transaction with `xrpl.js`.
- **Python:** Use the [`xrpl.transaction.safe_sign_transaction()` method](https://xrpl-py.readthedocs.io/en/latest/source/xrpl.transaction.html#xrpl.transaction.safe_sign_transaction) with a model and `Wallet` object.
- **Java:** Use a [`SignatureService`](https://javadoc.io/doc/org.xrpl/xrpl4j-crypto-core/latest/org/xrpl/xrpl4j/crypto/signing/SignatureService.html) instance to sign the transaction. For this tutorial, use the [`SingleKeySignatureService`](https://javadoc.io/doc/org.xrpl/xrpl4j-crypto-bouncycastle/latest/org/xrpl/xrpl4j/crypto/signing/SingleKeySignatureService.html).
- **PHP:** Use a [`sign()` method of a `Wallet` instance](https://alexanderbuzz.github.io/xrpl-php-docs/wallet.html#signing-a-transaction) instance to sign the transaction. The input to this step is a completed array of transaction instructions.
- **Go:** Use the [`Sign()` method of the `Wallet` package](https://pkg.go.dev/github.com/Peersyst/xrpl-go/xrpl/wallet) to sign the transaction.


JavaScript
```js
  // Sign prepared instructions ------------------------------------------------
  const signed = wallet.sign(prepared)
  console.log("Identifying hash:", signed.hash)
  console.log("Signed blob:", signed.tx_blob)
```

Python
```py
# Sign transaction -------------------------------------------------------------
signed_tx = xrpl.transaction.autofill_and_sign(
        my_payment, client, test_wallet)
max_ledger = signed_tx.last_ledger_sequence
tx_id = signed_tx.get_hash()
print("Signed transaction:", signed_tx)
print("Transaction cost:", xrpl.utils.drops_to_xrp(signed_tx.fee), "XRP")
print("Transaction expires after ledger:", max_ledger)
print("Identifying hash:", tx_id)
```

Java
```java
// Sign transaction -----------------------------------------------------------
// Construct a SignatureService to sign the Payment
SignatureService<PrivateKey> signatureService = new BcSignatureService();

// Sign the Payment
SingleSignedTransaction<Payment> signedPayment = signatureService.sign(randomKeyPair.privateKey(), payment);
System.out.println("Signed Payment: " + signedPayment.signedTransaction());
```

PHP
```php
// Sign prepared transaction
$signedTx = $wallet->sign($preparedTx);
print_r("Identifying hash: " . $signedTx['hash'] . PHP_EOL);
print_r("Signed blob: " . $signedTx['tx_blob'] . PHP_EOL);
```

Go
```go
	// Sign the transaction using the wallet
	txBlob, _, err := w.Sign(flattenedTx)
	if err != nil {
		panic(err)
	}
```

The result of the signing operation is a transaction object containing a signature. Typically, XRP Ledger APIs expect a signed transaction to be the hexadecimal representation of the transaction's canonical [binary format](/docs/references/protocol/binary-format), called a "blob".

- In `xrpl.js`, the signing API also returns the transaction's ID, or identifying hash, which you can use to look up the transaction later. This is a 64-character hexadecimal string that is unique to this transaction.
- In `xrpl-py`, you can get the transaction's hash in the response to submitting it in the next step.
- In xrpl4j, `SignatureService.sign` returns a `SignedTransaction`, which contains the transaction's hash, which you can use to look up the transaction later.
- In `XRPL_PHP`, the signing API also returns the transaction's ID, or identifying hash, which you can use to look up the transaction later. This is a 64-character hexadecimal string that is unique to this transaction.
- In `xrpl-go`, the signing API also returns the transaction's ID, or identifying hash, which you can use to look up the transaction later. This is a 64-character hexadecimal string that is unique to this transaction.


Sign
Sign
example transaction

div
### 5. Submit the Signed Blob

Now that you have a signed transaction, you can submit it to an XRP Ledger server, which relays it through the network. It's also a good idea to take note of the latest validated ledger index before you submit. The earliest ledger version that your transaction could get into as a result of this submission is one higher than the latest validated ledger when you submit it. Of course, if the same transaction was previously submitted, it could already be in a previous ledger. (It can't succeed a second time, but you may not realize it succeeded if you aren't looking in the right ledger versions.)

- **JavaScript:** Use the [`submitAndWait()` method of the Client](https://js.xrpl.org/classes/Client.html#submitAndWait) to submit a signed transaction to the network and wait for the response, or use [`submitSigned()`](https://js.xrpl.org/classes/Client.html#submitSigned) to submit a transaction and get only the preliminary response.
- **Python:** Use the [`xrpl.transaction.submit_and_wait()` method](https://xrpl-py.readthedocs.io/en/stable/source/xrpl.transaction.html#xrpl.transaction.submit_and_wait) to submit a transaction to the network and wait for a response.
- **Java:** Use the [`XrplClient.submit(SignedTransaction)` method](https://javadoc.io/doc/org.xrpl/xrpl4j-client/latest/org/xrpl/xrpl4j/client/XrplClient.html#submit(org.xrpl.xrpl4j.crypto.signing.SignedTransaction)) to submit a transaction to the network. Use the [`XrplClient.ledger()`](https://javadoc.io/doc/org.xrpl/xrpl4j-client/latest/org/xrpl/xrpl4j/client/XrplClient.html#ledger(org.xrpl.xrpl4j.model.client.ledger.LedgerRequestParams)) method to get the latest validated ledger index.
- **PHP:** Use the [`submitAndWait()` method of the Client](https://alexanderbuzz.github.io/xrpl-php-docs/client.html) to submit a transaction to the network and wait for the response.
- **Go:** Use [`SubmitTxAndWait()` or `SubmitTxBlobAndWait()` methods of the Client](https://pkg.go.dev/github.com/Peersyst/xrpl-go/xrpl/websocket#Client.SubmitTxAndWait) to submit a transaction to the network and wait for the response.


JavaScript
```js
  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(signed.tx_blob)
```

Python
```py
# Submit transaction -----------------------------------------------------------
try:
    tx_response = xrpl.transaction.submit_and_wait(signed_tx, client)
except xrpl.transaction.XRPLReliableSubmissionException as e:
    exit(f"Submit failed: {e}")
```

Java
```java
// Submit transaction ---------------------------------------------------------
SubmitResult<Payment> paymentSubmitResult = xrplClient.submit(signedPayment);
System.out.println(paymentSubmitResult);
```

PHP
```php
 // Submit signed blob and wait for validation
$txResponse = $client->submitAndWait($signedTx['tx_blob']);
```

Go
```go
	// Submit the transaction and wait for the result
	res_blob, err := client.SubmitTxBlobAndWait(txBlob, false)
	if err != nil {
		panic(err)
	}

	// Example with SubmitTxAndWait
	flattenedTx2 := p.Flatten()
	res_flat, err := client.SubmitTxAndWait(flattenedTx2, &wstypes.SubmitOptions{
		Autofill: true,
		Wallet:   &w,
	})
	if err != nil {
		panic(err)
	}
```

This method returns the **tentative** result of trying to apply the transaction to the open ledger. This result *can* change when the transaction is included in a validated ledger: transactions that succeed initially might ultimately fail, and transactions that fail initially might ultimately succeed. Still, the tentative result often matches the final result, so it's OK to get excited if you see `tesSUCCESS` here. 😁

If you see any other result, you should check the following:

- Are you using the correct addresses for the sender and destination?
- Did you forget any other fields of the transaction, skip any steps, or make any other typos?
- Do you have enough Test XRP to send the transaction? The amount of XRP you can send is limited by the [reserve requirement](/docs/concepts/accounts/reserves), which is currently 1 XRP with an additional 0.2 XRP for each "object" you own in the ledger. (If you generated a new address with the Testnet Faucet, you don't own any objects.)
- Are you connected to a server on the test network?


See the full list of [transaction results](/docs/references/protocol/transactions/transaction-results) for more possibilities.

Submit
Submit
example transaction

div
### 6. Wait for Validation

Most transactions are accepted into the next ledger version after they're submitted, which means it may take 4-7 seconds for a transaction's outcome to be final. If the XRP Ledger is busy or poor network connectivity delays a transaction from being relayed throughout the network, a transaction may take longer to be confirmed. (For more information on expiration of unconfirmed transactions, see [Reliable Transaction Submission](/docs/concepts/transactions/reliable-transaction-submission).)

- **JavaScript:**  If you used the [`.submitAndWait()` method](https://js.xrpl.org/classes/Client.html#submitAndWait), you can wait until the returned Promise resolves. Other, more asynchronous approaches are also possible.
- **Python:** If you used the [`xrpl.transaction.submit_and_wait()` method](https://xrpl-py.readthedocs.io/en/stable/source/xrpl.transaction.html#xrpl.transaction.submit_and_wait), you can wait for the function to return. Other approaches, including asynchronous ones using the WebSocket client, are also possible.
- **Java** Poll the [`XrplClient.transaction()` method](https://javadoc.io/doc/org.xrpl/xrpl4j-client/latest/org/xrpl/xrpl4j/client/XrplClient.html#transaction(org.xrpl.xrpl4j.model.client.transactions.TransactionRequestParams,java.lang.Class)) to see if your transaction has a final result. Periodically check that the latest validated ledger index has not passed the `LastLedgerIndex` of the transaction using the [`XrplClient.ledger()`](https://javadoc.io/doc/org.xrpl/xrpl4j-client/latest/org/xrpl/xrpl4j/client/XrplClient.html#ledger(org.xrpl.xrpl4j.model.client.ledger.LedgerRequestParams)) method.
- **PHP:**  If you used the [`.submitAndWait()` method](https://alexanderbuzz.github.io/xrpl-php-docs/client.html), you can wait until the returned Promise resolves. Other, more asynchronous approaches are also possible.
- **Go:** If you used the `SubmitTxAndWait()` or `SubmitTxBlobAndWait()` methods, the client will handle submission and wait until the transaction is confirmed in a ledger. Internally, these methods use a polling mechanism, querying the transaction status with the client's `Request()` method and a `TxRequest`.


JavaScript
```js
  // Wait for validation -------------------------------------------------------
  // submitAndWait() handles this automatically, but it can take 4-7s.
```

Python
```py
# Wait for validation ----------------------------------------------------------
# submit_and_wait() handles this automatically, but it can take 4-7s.
```

Java
```java
// Wait for validation --------------------------------------------------------
TransactionResult<Payment> transactionResult = null;

boolean transactionValidated = false;
boolean transactionExpired = false;
while (!transactionValidated && !transactionExpired) {
  Thread.sleep(4 * 1000);

  LedgerIndex latestValidatedLedgerIndex = xrplClient.ledger(
    LedgerRequestParams.builder()
    .ledgerSpecifier(LedgerSpecifier.VALIDATED)
    .build()
  )
    .ledgerIndex()
    .orElseThrow(() -> new RuntimeException("Ledger response did not contain a LedgerIndex."));

  transactionResult = xrplClient.transaction(TransactionRequestParams.of(signedPayment.hash()), Payment.class);

  if (transactionResult.validated()) {
    System.out.println("Payment was validated with result code " + transactionResult.metadata().get().transactionResult());
    transactionValidated = true;
  } else {
    boolean lastLedgerSequenceHasPassed = FluentCompareTo.is(latestValidatedLedgerIndex.unsignedIntegerValue())
      .greaterThan(UnsignedInteger.valueOf(lastLedgerSequence.intValue()));
    if (lastLedgerSequenceHasPassed) {
      System.out.println("LastLedgerSequence has passed. Last tx response: " + transactionResult);
      transactionExpired = true;
    } else {
      System.out.println("Payment not yet validated.");
    }
}
```

PHP
```php
// Wait for validation
// submitAndWait() handles this automatically, but it can take 4-7s.
```

Go
```go
	// Wait for validation -------------------------------------------------------
	// SubmitTxBlobAndWait() handles this automatically, but it can take 4-7s.
```

table
tbody
tr
th
Transaction ID:
td
(None)
tr
th
Latest Validated Ledger Index:
td
(Not connected)
tr
th
Ledger Index at Time of Submission:
td
(Not submitted)
tr
th
Transaction 
code
LastLedgerSequence
:
td
(Not prepared)
tr
### 7. Check Transaction Status

To know for sure what a transaction did, you must look up the outcome of the transaction when it appears in a validated ledger version.

- **JavaScript:** Use the response from `submitAndWait()` or call the [tx method](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/tx) using [`Client.request()`](https://js.xrpl.org/classes/Client.html#request).
In **TypeScript** you can pass a [`TxRequest`](https://js.xrpl.org/interfaces/TxRequest.html) to the [`Client.request()`](https://js.xrpl.org/classes/Client.html#request) method.
- **Python:** Use the response from [`submit_and_wait()`](https://xrpl-py.readthedocs.io/en/stable/source/xrpl.transaction.html#xrpl.transaction.submit_and_wait) or call the [`xrpl.transaction.get_transaction_from_hash()` method](https://xrpl-py.readthedocs.io/en/latest/source/xrpl.transaction.html#xrpl.transaction.get_transaction_from_hash). (See the [tx method response format](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/tx#response-format) for a detailed reference of the fields this can contain.)
- **Java:** Use the [`XrplClient.transaction()`](https://javadoc.io/doc/org.xrpl/xrpl4j-client/latest/org/xrpl/xrpl4j/client/XrplClient.html#transaction(org.xrpl.xrpl4j.model.client.transactions.TransactionRequestParams,java.lang.Class)) method to check the status of a transaction.
- **PHP:** Use the response from `submitAndWait()` or call the `tx method` using [`$client->syncRequest()`](https://alexanderbuzz.github.io/xrpl-php-docs/client.html).
- **Go:** Use the response from `SubmitTxAndWait()` or `SubmitTxBlobAndWait()`, or manually query the transaction status using a `TxRequest` with the client's `Request()` method.


JavaScript
```js
  // Check transaction results -------------------------------------------------
  console.log("Transaction result:", tx.result.meta.TransactionResult)
  console.log("Balance changes:", JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))
```

Python
```py
# Check transaction results ----------------------------------------------------
import json
print(json.dumps(tx_response.result, indent=4, sort_keys=True))
print(f"Explorer link: https://testnet.xrpl.org/transactions/{tx_id}")
metadata = tx_response.result.get("meta", {})
if metadata.get("TransactionResult"):
    print("Result code:", metadata["TransactionResult"])
if metadata.get("delivered_amount"):
    print("XRP delivered:", xrpl.utils.drops_to_xrp(
                metadata["delivered_amount"]))
```

Java
```java
// Check transaction results --------------------------------------------------
System.out.println(transactionResult);
System.out.println("Explorer link: https://testnet.xrpl.org/transactions/" + signedPayment.hash());
transactionResult.metadata().ifPresent(metadata -> {
  System.out.println("Result code: " + metadata.transactionResult());
  metadata.deliveredAmount().ifPresent(deliveredAmount ->
    System.out.println("XRP Delivered: " + ((XrpCurrencyAmount) deliveredAmount).toXrp()));
  }
);
```

PHP
```php
// Check transaction results
$result = $txResponse->getResult();
print_r("Transaction result:" . $result['meta']['TransactionResult'] . PHP_EOL);

print_r("You can check wallets/accounts and transactions on https://test.bithomp.com"  . PHP_EOL . PHP_EOL);
```

Go
```go
	// Check transaction results -------------------------------------------------
	fmt.Printf("Hash: %s\n", res_blob.Hash)
	fmt.Printf("Meta: %+v\n", res_blob.Meta)
	res, _ := client.Request(&transactions.TxRequest{
		Transaction: res_flat.Hash.String(),
	})
	fmt.Printf("Result: %s\n", res.Result)
}
```

XRP Ledger APIs may return tentative results from ledger versions that have not yet been validated. For example, in [tx method](/docs/references/http-websocket-apis/public-api-methods/transaction-methods/tx) response, be sure to look for `"validated": true` to confirm that the data comes from a validated ledger version. Transaction results that are not from a validated ledger version are subject to change. For more information, see [Finality of Results](/docs/concepts/transactions/finality-of-results).

Check
Check transaction status

div
## Differences for Production

To send an XRP payment on the production XRP Ledger, the steps you take are largely the same. However, there are some key differences in the necessary setup:

- [Getting real XRP isn't free.](#getting-a-real-xrp-account)
- [You must connect to a server that's synced with the production XRP Ledger network.](#connecting-to-the-production-xrp-ledger)


### Getting a Real XRP Account

This tutorial uses a button to get an address that's already funded with Test Net XRP, which only works because Test Net XRP is not worth anything. For actual XRP, you need to get XRP from someone who already has some. (For example, you might buy it on an exchange.) You can generate an address and secret that'll work on either production or the Testnet as follows:

JavaScript
```js
const wallet = new xrpl.Wallet()
console.log(wallet.address) // Example: rGCkuB7PBr5tNy68tPEABEtcdno4hE6Y7f
console.log(wallet.seed) // Example: sp6JS7f14BuwFY8Mw6bTtLKWauoUs
```

Python
```py
from xrpl.wallet import Wallet
my_wallet = Wallet.create()
print(my_wallet.address) # Example: rGCkuB7PBr5tNy68tPEABEtcdno4hE6Y7f
print(my_wallet.seed)            # Example: sp6JS7f14BuwFY8Mw6bTtLKWauoUs
```

Java
```java
WalletFactory walletFactory = DefaultWalletFactory.getInstance();
SeedWalletGenerationResult generationResult = walletFactory.randomWallet(false);
Wallet wallet = generationResult.wallet();
System.out.println(wallet.classicAddress()); // Example: rGCkuB7PBr5tNy68tPEABEtcdno4hE6Y7f
System.out.println(generationResult.seed()); // Example: sp6JS7f14BuwFY8Mw6bTtLKWauoUs
```

PHP
```php
use XRPL_PHP\Wallet\Wallet;

$wallet = Wallet::generate();

print_r("Address: " . $wallet->getAddress());  // Example: rGCkuB7PBr5tNy68tPEABEtcdno4hE6Y7f
print_r("Seed: " . $wallet->getSeed()); // Example: sp6JS7f14BuwFY8Mw6bTtLKWauoUs
```

Go
```go
wallet, err := wallet.New(crypto.ED25519())
fmt.Println("Classic Address:", wallet.ClassicAddress) // Example: r9ESeQQswbTxV8neiDTLTHXbXfUwiihyJk
fmt.Println("Seed:", wallet.Seed) // Example: sEd7XGFGSWteam777HQHvw7vHypEWy2
```

You should only use an address and secret that you generated securely, on your local machine. If another computer generated the address and secret and sent it to you over a network, it's possible that someone else on the network may see that information. If they do, they'll have as much control over your XRP as you do. It's also recommended not to use the same address for the Testnet and Mainnet, because transactions that you created for use on one network could also be valid to execute on the other network, depending on the parameters you provided.

Generating an address and secret doesn't get you XRP directly; you're only choosing a random number. You must also receive XRP at that address to [fund the account](/docs/concepts/accounts#creating-accounts). A common way to acquire XRP is to buy it from an exchange, then withdraw it to your own address.

### Connecting to the Production XRP Ledger

When you instantiate your client's connect to the XRP Ledger, you must specify a server that's synced with the appropriate [network](/docs/concepts/networks-and-servers/parallel-networks). For many cases, you can use [public servers](/docs/tutorials/public-servers), such as in the following example:

JavaScript
```js
const xrpl = require('xrpl')
const api = new xrpl.Client('wss://xrplcluster.com')
api.connect()
```

Python
```py
from xrpl.clients import JsonRpcClient
client = JsonRpcClient("https://xrplcluster.com")
```

Java
```java
final HttpUrl rippledUrl = HttpUrl.get("https://xrplcluster.com");
XrplClient xrplClient = new XrplClient(rippledUrl);
```

PHP
```
use XRPL_PHP\Client\JsonRpcClient;

$client = new JsonRpcClient("https://xrplcluster.com");
```

Go
```go
client := websocket.NewClient(
  websocket.NewClientConfig().
    WithHost("wss://xrplcluster.com")
)
if err := client.Connect(); err != nil {
  fmt.Println(err)
  return
}
```

If you [install `xrpld`](/docs/infrastructure/installation) yourself, it connects to the production network by default. (You can also [configure it to connect to the test net](/docs/infrastructure/configuration/connect-your-xrpld-to-the-xrp-test-net) instead.) After the server has synced (typically within about 15 minutes of starting it up), you can connect to it locally, which has [various benefits](/docs/concepts/networks-and-servers). The following example shows how to connect to a server running the default configuration:

JavaScript
```js
const xrpl = require('xrpl')
const api = new xrpl.Client('ws://localhost:6006')
api.connect()
```

Python
```py
from xrpl.clients import JsonRpcClient
client = JsonRpcClient("http://localhost:5005")
```

Java
```java
final HttpUrl rippledUrl = HttpUrl.get("http://localhost:5005");
XrplClient xrplClient = new XrplClient(rippledUrl);
```

PHP
```php
use XRPL_PHP\Client\JsonRpcClient;

$client = new JsonRpcClient("http://localhost:5005");
```

Go
```go
client := websocket.NewClient(
  websocket.NewClientConfig().
    WithHost("ws://localhost:6006")
)
if err := client.Connect(); err != nil {
  fmt.Println(err)
  return
}
```

The local connection uses an unencrypted protocol (`ws` or `http`) rather than the TLS-encrypted version (`wss` or `https`). This is secure only because the communications never leave the same machine, and is easier to set up because it does not require a TLS certificate. For connections on an outside network, always use `wss` or `https`.

## Next Steps

After completing this tutorial, you may want to try the following:

- [Issue a token](/docs/tutorials/tokens/fungible-tokens/issue-a-fungible-token) on the XRP Ledger Testnet.
- [Trade in the Decentralized Exchange](/docs/tutorials/defi/dex/trade-in-the-decentralized-exchange).
- Build [Reliable transaction submission](/docs/concepts/transactions/reliable-transaction-submission) for production systems.
- Check your [client library](/docs/references/client-libraries)'s API reference for the full range of XRP Ledger functionality.
- Learn how [Transaction Metadata](/docs/references/protocol/transactions/metadata) describes the outcome of a transaction in detail.
- Explore more [Payment Types](/docs/concepts/payment-types) such as Escrows and Payment Channels.