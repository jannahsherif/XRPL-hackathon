# Manage Credentials

This tutorial shows you how to manage the full lifecycle of [Credentials](/docs/concepts/decentralized-storage/credentials) on the XRP Ledger: issuing a credential to a subject, accepting the credential, and deleting it.

_Added by the [Credentials amendment](/resources/known-amendments#credentials). (Enabled: 2025-09-04)_

## Goals

By the end of this tutorial, you will be able to:

- Issue a credential to a subject account.
- Accept a credential as the subject.
- Delete a credential from the ledger.


## Prerequisites

To complete this tutorial, you should:

- Have a basic understanding of the XRP Ledger.
- Have an XRP Ledger client library set up in your development environment. This page provides examples for the following:
  - **Java** with the [xrpl4j library](https://github.com/XRPLF/xrpl4j). See [Get Started Using Java](/docs/tutorials/get-started/get-started-java) for setup steps.


## Source Code

You can find the complete source code for this tutorial's examples in the code samples section of this website's repository.

## Steps

### 1. Install dependencies

Java
From the code sample folder, use `mvn` to install dependencies.

```bash
mvn install
```

### 2. Set up client and fund accounts

To get started, import the necessary libraries and instantiate a client to connect to the XRPL Testnet. This example imports:

Java
- `xrpl4j`: Used for XRPL client connection, transaction submission, and wallet handling.
- `OkHttp`, `Guava`, `Jackson`: Used for HTTP URL construction, unsigned integer arithmetic, and JSON serialization.
- `java.util.concurrent`: Used for async operations.


```java
package com.example.xrpl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.common.primitives.UnsignedInteger;
import okhttp3.HttpUrl;
import org.xrpl.xrpl4j.client.JsonRpcClientErrorException;
import org.xrpl.xrpl4j.client.XrplClient;
import org.xrpl.xrpl4j.client.faucet.FaucetClient;
import org.xrpl.xrpl4j.client.faucet.FundAccountRequest;
import org.xrpl.xrpl4j.crypto.keys.KeyPair;
import org.xrpl.xrpl4j.crypto.keys.PrivateKey;
import org.xrpl.xrpl4j.crypto.keys.Seed;
import org.xrpl.xrpl4j.crypto.signing.SignatureService;
import org.xrpl.xrpl4j.crypto.signing.SingleSignedTransaction;
import org.xrpl.xrpl4j.crypto.signing.bc.BcSignatureService;
import org.xrpl.xrpl4j.model.client.Finality;
import org.xrpl.xrpl4j.model.client.FinalityStatus;
import org.xrpl.xrpl4j.model.client.accounts.AccountInfoRequestParams;
import org.xrpl.xrpl4j.model.client.accounts.AccountInfoResult;
import org.xrpl.xrpl4j.model.client.common.LedgerSpecifier;
import org.xrpl.xrpl4j.model.client.fees.FeeUtils;
import org.xrpl.xrpl4j.model.client.ledger.LedgerRequestParams;
import org.xrpl.xrpl4j.model.client.transactions.SubmitResult;
import org.xrpl.xrpl4j.model.client.transactions.TransactionRequestParams;
import org.xrpl.xrpl4j.model.client.transactions.TransactionResult;
import org.xrpl.xrpl4j.model.jackson.ObjectMapperFactory;
import org.xrpl.xrpl4j.model.transactions.Address;
import org.xrpl.xrpl4j.model.transactions.CredentialAccept;
import org.xrpl.xrpl4j.model.transactions.CredentialCreate;
import org.xrpl.xrpl4j.model.transactions.CredentialDelete;
import org.xrpl.xrpl4j.model.transactions.CredentialType;
import org.xrpl.xrpl4j.model.transactions.Transaction;
import org.xrpl.xrpl4j.model.transactions.TransactionResultCodes;
import org.xrpl.xrpl4j.model.transactions.XrpCurrencyAmount;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
```

```java
/**
 * This code sample demonstrates the Credential lifecycle on the XRPL.
 * It issues a credential to a subject, accepts the credential, and then deletes it.
 */
public class ManageCredentials {

  private static final HttpUrl NETWORK_URL = HttpUrl.get("https://s.altnet.rippletest.net:51234/");
  private static final HttpUrl FAUCET_URL = HttpUrl.get("https://faucet.altnet.rippletest.net");
  private static final String EXPLORER_BASE = "https://testnet.xrpl.org/transactions/";

  private static final CredentialType CREDENTIAL_TYPE = CredentialType.ofPlainText("kyc-trader");

  public static void main(String[] args) {
    try {
      run();
    } catch (Exception e) {
      // Unwrap CompletionException so async failures print the same clean message
      // as sync failures. CompletableFuture.join() wraps exceptions in CompletionException
      Throwable cause = (e instanceof CompletionException && e.getCause() != null)
        ? e.getCause() : e;
      System.err.println("Error: " + cause.getMessage());
      System.exit(1);
    }
  }

  private static void run() {

    // ----- Connect to Testnet and fund accounts -----
    XrplClient xrplClient = new XrplClient(NETWORK_URL);
    System.out.println("\n=== Funding issuer and subject accounts on Testnet ===\n");

    CompletableFuture<KeyPair> issuerFuture = CompletableFuture.supplyAsync(
      () -> createAndFundWallet(xrplClient));
    CompletableFuture<KeyPair> subjectFuture = CompletableFuture.supplyAsync(
      () -> createAndFundWallet(xrplClient));
    CompletableFuture.allOf(issuerFuture, subjectFuture).join();

    KeyPair issuer = issuerFuture.join();
    KeyPair subject = subjectFuture.join();
    Address issuerAddress = issuer.publicKey().deriveAddress();
    Address subjectAddress = subject.publicKey().deriveAddress();
    System.out.println("Issuer:  " + issuerAddress);
    System.out.println("Subject: " + subjectAddress);
```

The `createAndFundWallet()` helper generates an Ed25519 keypair, funds it from the Testnet faucet, and polls Testnet until the account is visible on a validated ledger.

```java
  // Generates a new Ed25519 keypair, funds it from the Testnet faucet, and
  // returns the keypair once the account is visible on a validated ledger.
  private static KeyPair createAndFundWallet(XrplClient xrplClient) {
    KeyPair keyPair = Seed.ed25519Seed().deriveKeyPair();
    Address address = keyPair.publicKey().deriveAddress();
    FaucetClient faucetClient = FaucetClient.construct(FAUCET_URL);
    faucetClient.fundAccount(FundAccountRequest.of(address));

    for (int attempt = 0; attempt < 20; attempt++) {
      try {
        xrplClient.accountInfo(AccountInfoRequestParams.builder()
          .account(address)
          .ledgerSpecifier(LedgerSpecifier.VALIDATED)
          .build());
        return keyPair;
      } catch (JsonRpcClientErrorException notYetVisible) {
        try {
          Thread.sleep(1_000L);
        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
          throw new RuntimeException("Account polling interrupted for " + address + ". " + e.getMessage(), e);
        }
      }
    }
    throw new IllegalStateException("Faucet funding for " + address + " did not confirm in time.");
  }
```

### 3. Prepare CredentialCreate transaction

Create the [CredentialCreate transaction](/docs/references/protocol/transactions/types/credentialcreate) object.

Java
```java
    // ----- Prepare CredentialCreate transaction -----
    System.out.println("\n=== Preparing CredentialCreate transaction ===\n");

    CredentialCreate createTx = CredentialCreate.builder()
      .account(issuerAddress)
      .subject(subjectAddress)
      .credentialType(CREDENTIAL_TYPE)
      .sequence(accountSequence(xrplClient, issuerAddress))
      .fee(recommendedFee(xrplClient))
      .lastLedgerSequence(lastLedgerSequence(xrplClient))
      .signingPublicKey(issuer.publicKey())
      .build();
    printTransactionJson(createTx);
```

The credential is identified by the issuer, subject, and credential type (written as a hexadecimal string).

### 4. Submit CredentialCreate transaction

Sign and submit the `CredentialCreate` transaction to the XRP Ledger.

Java
```java
    // ----- Sign, submit, and wait for CredentialCreate validation -----
    System.out.println("\n=== Submitting CredentialCreate transaction ===\n");

    TransactionResult<CredentialCreate> createResult = signSubmitAndWait(
      xrplClient, issuer, createTx, CredentialCreate.class);

    requireSuccess(createResult);
```

The `signSubmitAndWait()` helper signs a transaction, submits it, and polls Testnet until it reaches a validated ledger.

```java
  // Signs and submits a transaction, then polls the network until
  // the transaction reaches a validated state.
  private static <T extends Transaction> TransactionResult<T> signSubmitAndWait(
    XrplClient xrplClient,
    KeyPair signer,
    T transaction,
    Class<T> transactionType
  ) {
    SignatureService<PrivateKey> signatureService = new BcSignatureService();

    UnsignedInteger lastLedgerSequence = transaction.lastLedgerSequence()
      .orElseThrow(() -> new IllegalArgumentException(
        "Must set LastLedgerSequence for polling expiration"));

    try {
      SingleSignedTransaction<T> signed = signatureService.sign(signer.privateKey(), transaction);
      SubmitResult<T> submit = xrplClient.submit(signed);

      if (!TransactionResultCodes.TES_SUCCESS.equals(submit.engineResult())) {
        throw new IllegalStateException(
          "Submission rejected. " + submit.engineResult() + " — " + submit.engineResultMessage());
      }

      Finality finality;
      do {
        Thread.sleep(1_000L);
        finality = xrplClient.isFinal(
          signed.hash(),
          submit.validatedLedgerIndex(),
          lastLedgerSequence,
          transaction.sequence(),
          signer.publicKey().deriveAddress()
        );
      } while (finality.finalityStatus() == FinalityStatus.NOT_FINAL);

      if (finality.finalityStatus() != FinalityStatus.VALIDATED_SUCCESS) {
        throw new IllegalStateException(
          "Transaction failed with status " + finality.finalityStatus()
            + ". Result code: " + finality.resultCode().orElse("unknown"));
      }

      // Retrieve the transaction result; isFinal() only returns finality status
      return xrplClient.transaction(
        TransactionRequestParams.of(signed.hash()), transactionType);

    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new RuntimeException("Transaction polling interrupted. " + e.getMessage(), e);
    } catch (JsonRpcClientErrorException | JsonProcessingException e) {
      throw new RuntimeException("Transaction processing failed. " + e.getMessage(), e);
    }
  }
```

The `requireSuccess` helper verifies that the transaction succeeded with a `tesSUCCESS` result code and posts a link to the transaction metadata on the XRPL Explorer.

```java
  // Checks for a tesSUCCESS result code. If true, prints an explorer
  // link. Otherwise, throws an error.
  private static void requireSuccess(TransactionResult<?> result) {
    String code = result.metadata().get().transactionResult();
    String txType = result.transaction().transactionType().value();
    if (!TransactionResultCodes.TES_SUCCESS.equals(code)) {
      throw new IllegalStateException(txType + " failed with error code " + code);
    }
    System.out.println(txType + " succeeded!");
    System.out.println("Explorer: " + EXPLORER_BASE + result.hash());
  }
}
```

### 5. Prepare CredentialAccept transaction

Create the [CredentialAccept transaction](/docs/references/protocol/transactions/types/credentialaccept) object. The subject account must accept the credential to make it valid.

Java
```java
    // ----- Prepare CredentialAccept transaction -----
    System.out.println("\n=== Preparing CredentialAccept transaction ===\n");

    CredentialAccept acceptTx = CredentialAccept.builder()
      .account(subjectAddress)
      .issuer(issuerAddress)
      .credentialType(CREDENTIAL_TYPE)
      .sequence(accountSequence(xrplClient, subjectAddress))
      .fee(recommendedFee(xrplClient))
      .lastLedgerSequence(lastLedgerSequence(xrplClient))
      .signingPublicKey(subject.publicKey())
      .build();
    printTransactionJson(acceptTx);
```

### 6. Submit CredentialAccept transaction

Sign and submit the `CredentialAccept` transaction to the XRP Ledger.

Java
```java
    // ----- Sign, Submit, and wait for CredentialAccept validation -----
    System.out.println("\n=== Submitting CredentialAccept transaction ===\n");

    TransactionResult<CredentialAccept> acceptResult = signSubmitAndWait(
      xrplClient, subject, acceptTx, CredentialAccept.class);

    requireSuccess(acceptResult);
```

### 7. Prepare CredentialDelete transaction

Create the [CredentialDelete transaction](/docs/references/protocol/transactions/types/credentialdelete) object. Either the issuer or the subject can delete a credential.

Java
```java
    // ----- Prepare CredentialDelete transaction -----
    System.out.println("\n=== Preparing CredentialDelete transaction ===\n");

    CredentialDelete deleteTx = CredentialDelete.builder()
      .account(subjectAddress)
      .issuer(issuerAddress)
      .credentialType(CREDENTIAL_TYPE)
      .sequence(accountSequence(xrplClient, subjectAddress))
      .fee(recommendedFee(xrplClient))
      .lastLedgerSequence(lastLedgerSequence(xrplClient))
      .signingPublicKey(subject.publicKey())
      .build();
    printTransactionJson(deleteTx);
```

### 8. Submit CredentialDelete transaction

Sign and submit the `CredentialDelete` transaction to the XRP Ledger.

Java
```java
    // ----- Sign, Submit, and wait for CredentialDelete validation -----
    System.out.println("\n=== Submitting CredentialDelete transaction ===\n");

    TransactionResult<CredentialDelete> deleteResult = signSubmitAndWait(
      xrplClient, subject, deleteTx, CredentialDelete.class);

    requireSuccess(deleteResult);
  }
```

## See Also

**Concepts**:

- [Credentials](/docs/concepts/decentralized-storage/credentials)


**Tutorials**:

- [Verify Credentials](/docs/tutorials/compliance-features/verify-credentials)


**References**:

- [CredentialCreate transaction](/docs/references/protocol/transactions/types/credentialcreate)
- [CredentialAccept transaction](/docs/references/protocol/transactions/types/credentialaccept)
- [CredentialDelete transaction](/docs/references/protocol/transactions/types/credentialdelete)