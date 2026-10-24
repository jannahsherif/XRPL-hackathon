# API Basics
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-basics/index.md

## API Security {#api-security}

### Client Authentication {#client-authentication}

To prioritize API security, Mastercard supports two authenticating protocols to verify the identity of the user who is calling our [APIs](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md).

|           Authentication protocol           |                                                                                                                                                                                                                                                                                                                                         Details                                                                                                                                                                                                                                                                                                                                          |
|---------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [OAuth 1.0a](https://oauth.net/core/1.0a/)  | This is the **default authentication mechanism** used by most APIs on Mastercard Developers. Mastercard uses OAuth 1.0a with a body hash extension for authenticating the API clients. OAuth 1.0a is an authentication and authorization protocol that guarantees the integrity and authenticity of incoming API calls and allows for non-repudiation of requests.                                                                                                                                                                                                                                                                                                                       |
| [MTLS](https://tools.ietf.org/html/rfc5246) | Mutual TLS Authentication is a two-way authentication mechanism based on Transport Layer Security (TLS) that uses digital certificates signed using Public Key Infrastructure framework. Work with your [Mastercard representative](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/support/index.md#get-help) for details. * Sandbox-Global * Production-Global * Sandbox-India * Production-India ```Sandbox-Global https://mtf.services.mastercard.com ``` ```Production-Global https://services.mastercard.com ``` ```Sandbox-India https://mtf.digital.services.mastercard.co.in ``` ```Production-India https://digital.services.mastercard.co.in ``` |

#### OAuth Requirements {#oauth-requirements}

OAuth requires every request that you send to Mastercard to be signed with an RSA private key. A private-public RSA key pair must be generated consisting of:  

1. A **private key** for the OAuth signature for API requests. It is recommended to keep the private key in a password-protected or hardware keystore. Data encrypted using a public key can only be decrypted using the corresponding private key.  
2. A **public key** that is certified by Mastercard. It is provided in a [PKCS #12](https://tools.ietf.org/html/rfc7292) format key store file, with a .p12 suffix, and is password protected.

<br />

* Requests with a body must be signed using the [Google Request Body Hash](https://tools.ietf.org/id/draft-eaton-oauth-bodyhash-00.html) extension for OAuth.
* To access Mastercard Checkout APIs, you need to authenticate your API requests using the API Signing Key and Consumer Key. Learn more about these keys in [Key Management](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md).

Tip: To learn more about the authentication scheme that Mastercard uses, refer to the following guides:

* [Using OAuth 1.0a to Access Mastercard APIs](https://developer.mastercard.com/platform/documentation/security-and-authentication/using-oauth-1a-to-access-mastercard-apis/)
* [Using MTLS to Access Mastercard APIs](https://developer.mastercard.com/platform/documentation/security-and-authentication/using-mtls-to-access-mastercard-apis/)

### Encryption {#encryption}

#### Transport Encryption {#transport-encryption}

The transport between client applications and Mastercard is secured using [TLS/SSL](https://en.wikipedia.org/wiki/Transport_Layer_Security), which means data is encrypted by default when transmitted across networks. Mastercard uses end-to-end payload encryption to secure sensitive data such as Personal Identifiable Information (PII).

Encryption involves 2048-bit [RSA](https://en.wikipedia.org/wiki/RSA_(cryptosystem)) public/private key pairs. Mastercard Checkout Solutions encrypt sensitive data returned in responses for your application. Data encrypted using a public key can only be decrypted using the corresponding private key.
Tip: To learn more about the authentication scheme that Mastercard uses, refer to the following guides:

* To learn more about Encryption Keys used to encrypt or decrypt a payload, refer to [Key Management](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md).  
* To learn more about encryption schemes that Mastercard uses, refer to [Securing Sensitive Data Using Payload Encryption](https://developer.mastercard.com/platform/documentation/security-and-authentication/securing-sensitive-data-using-payload-encryption/) guide.

#### JWE {#jwe}

JSON Web Encryption (JWE) represents encrypted content using JSON-based data structures [RFC7159](https://datatracker.ietf.org/doc/html/rfc7159) and base64url encoding. Mastercard uses [JWE compact serialization](https://datatracker.ietf.org/doc/html/rfc7516#section-7.1) for the encryption of sensitive data and supports both field level encryption and entire payload encryption.

* Visit our [JWE Encryption Guide](https://developer.mastercard.com/platform/documentation/authentication/securing-sensitive-data-using-payload-encryption/#jwe-encryption) to learn more about JWE encryption.

#### Encryption Libraries {#encryption-libraries}

Mastercard has abstracted the encryption scheme into our client [encryption libraries](https://github.com/Mastercard?&q=client-encryption), which are available in several programming languages. We recommend utilizing these libraries to encrypt the sensitive data and to perform payload decryption.

## Environment Descriptions {#environment-descriptions}

The table below describes the different environments that are available.

| **Environment** |                                                                                         **Description**                                                                                         |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Sandbox         | The pre-production test environment where developers can experiment with API calls without affecting real data or systems, ensuring any errors or issues can be safely identified and resolved. |
| Production      | The live environment setting where the API interacts with actual users and data. Once all testing is complete and you are ready to go live, you can request access to our live Production.      |

## How to Use Mastercard APIs? {#how-to-use-mastercard-apis}

### Generating an Open API Client {#generating-an-open-api-client}

Create customizable API clients from using an [OpenAPI Generator](https://openapi-generator.tech/), and let Mastercard open-source client libraries supporting multiple languages and frameworks, handle the authentication for you. This approach offers more flexibility and is strongly recommended.   

Follow the steps in [Generating and Configuring a Mastercard API Client](https://developer.mastercard.com/platform/documentation/security-and-authentication/generating-and-configuring-a-mastercard-api-client/) to generate an API client to use Mastercard APIs, enable authentication, and perform encryption/decryption.

## Next Steps {#next-steps}

Now that you have an understanding of the authentication services and encryption, learn more about the Mastercard Checkout Solutions [products](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md).
