# Secure Card on File
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/ref-app-cof/index.md

The reference application is a simple Spring Boot Application created using Java Spring Boot and Maven OpenAPI client plugin. It provides API Client capabilities with OAuth 1.0a and JWE-based encryption/decryption for accessing Mastercard Secure Card on File (SCOF) service endpoints.
>
> ### What you will learn: {#what-you-will-learn}
>
> * How to use the application to test common SCOF use cases
> * How to encrypt or decrypt requests and responses
Note: For information on prerequisites, see [Reference Applications](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/index.md). For information on how to set up and build the app, see [App Setup and Configuration](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/ref-app-config/index.md).

## Use the Application {#use-the-application}

To start the application, enter *localhost:8080* in your browser. The reference application home screen displays:

![Select API](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/refapp_SCOF_home.png "Select API")

Select any of the APIs to start using the application.

For ease of use, the form is prepopulated with a functioning request. Modify the values as needed.

![Card Details](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/refapp_SCOF_encrypt_card_popup.png "Card Details")

Submitting the form calls the respective Mastercard Secure Card on File APIs. Also, the original request and any related responses are available for viewing below the forms.

![Enroll Card Request Response](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/refapp_SCOF_request_response.png "Enroll Card Request Response")

## Encryption of Requests {#encryption-of-requests}

Use Mastercard generated keys for encrypting some parameters before you send them in a request. You encrypt them using the `src-fpan-encryption` public key. Mastercard then decrypts using the private part. For more details on how to obtain these public keys, see the [API Keys](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md#public-keys-mastercard-provides) tutorial.

Code snippets are available in the Reference App in *MasterCardCardService.java* under `/src/main/java/com/mastercard/mcs/securecardonfile_reference_app/service` and are preconfigured to download the latest Mastercard Client Encryption JWK Sets.
[POST /Cards](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card): Code snippets are available in the Reference App in *CardController.java* under `/src/main/java/com/mastercard/mcs/securecardonfile_reference_app/controller`, which details how to encrypt the sensitive data in requests.

## Decryption of Response {#decryption-of-response}

Some responses contain sensitive data that are encrypted by Mastercard. Use the [Payload Encryption Key](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/add-encryption-key/index.md) to decrypt sensitive data in these responses.
[POST /transaction/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout): The checkout response is a JWS signed by the Mastercard Secure Card on File program for Integrators to validate the integrity of the data in the checkout response. Checkout response data is *encoded* , digitally signed and wrapped in a JWS structure. The `checkoutResponseJWS` should be decoded from BASE64. You can use [jwt.io](https://jwt.io/) for quick reference. After decoding, it will consist of a header and a body in clear text and a signature hash. Sensitive data in body is still encrypted in the `encryptedPayload` field. For more information, see [Decrypt the payload](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step8/index.md) in the Integrate with Click to Pay tutorial.

Code snippets are available in the Reference App in *MasterCardScofCheckoutService.java* under `/src/main/java/com/mastercard/mcs/securecardonfile_reference_app/service`, which details how to decrypt this `encryptedPayload` value.

## Use Cases {#use-cases}

Use the SCOF reference app to test the following APIs and use cases:

### APIs {#apis}

* [Merchant Registration API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#registration)
* [Cards API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)
* [Checkout API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout)
* [Authentication by Mastercard (TAS)](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-mastercard/index.md)

### Use Cases {#use-cases-1}

* [Register Entities to Create Tokens](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/card-on-file/register_entities/index.md)
* [Create Tokens](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/card-on-file/create-tokens/index.md)
* [Make Payments](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/card-on-file/making-payments/index.md)
* [Manage Tokens](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/card-on-file/managing-tokens/index.md)
* [Display Tokenized PAN Details](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/card-on-file/displaying-tokenized-pan-details/index.md)
* [Perform Authentication](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/card-on-file/token-auth-framework/index.md)
