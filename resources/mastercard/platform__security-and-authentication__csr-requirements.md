# Requirements for Certificate Signing Requests (CSR)
source: https://developer.mastercard.com/platform/documentation/security-and-authentication/csr-requirements/index.md

## Overview {#overview}

Mastercard Developers allows users to create API keys by submitting Certificate Signing Requests (CSR). With this method, the CSR is signed with a private key generated and secured within your own system.

This page lists the requirements CSR must meet. If you are not familiar with Mastercard API keys, please refer to [Getting Keys for Your Application](https://developer.mastercard.com/platform/documentation/security-and-authentication/using-oauth-1a-to-access-mastercard-apis/index.md#getting-keys-for-your-application).

## Requirements {#requirements}

### Format {#format}

The specification and syntax for CSR can be found in [PKCS #10: Certification Request Syntax Specification](https://tools.ietf.org/html/rfc2986).
> *A certification request consists of three parts: "certification request information," a signature algorithm identifier, and a digital signature on the certification request information.*

### Subject Fields {#subject-fields}

The certification request information contains an entity's distinguished name (DN) which must have the following attributes:

* Common Name (CN)

### Signature Algorithms {#signature-algorithms}

Note: Mastercard Developers' CSR‑based credential generation supports RSA and EC keys.

* For OAuth 2.0, choose the key type that best fits your cryptographic and compliance requirements
* For OAuth 1.0a, only RSA keys are supported

The CSR must use one of the following algorithm identifiers:

**PKCS#1 1.5 RSA Encryption**

* `sha1WithRSAEncryption`
* `sha256WithRSAEncryption`
* `sha512WithRSAEncryption`   

**ECDSA**

* `ecdsa-with-sha1`
* `ecdsa-with-sha256`
* `ecdsa-with-sha512`

## Useful Commands {#useful-commands}

### Generating a CSR for an Existing Key Pair (PKCS#12) {#generating-a-csr-for-an-existing-key-pair-pkcs12}

To generate a CSR from pre-existing public/private keys, you can use the commands below:
* OpenSSL
* Keytool

```OpenSSL
openssl pkcs12 -in existing_key.p12 -nocerts -out existing_key.pem
openssl req -out csr.pem -key existing_key.pem -new
```

```Keytool
keytool -certreq -alias keyalias -keyalg RSA -file csr.pem -keystore existing_key.p12
```

