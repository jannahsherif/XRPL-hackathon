# Click to Pay
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/ref-app-ctp/index.md

The reference application is a simple Spring Boot Application created using Java Spring Boot and Maven OpenAPI client plugin. It provides API Client capabilities with OAuth 1.0a and JWE-based encryption/decryption for accessing Mastercard Click to Pay service endpoints.
>
> ### What you will learn: {#what-you-will-learn}
>
> * How to use the application to test common Click to Pay use cases
> * How to encrypt or decrypt requests and responses
Note: For information on prerequisites, see [Reference Applications](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/index.md). For information on how to set up and build the app, see [App Setup and Configuration](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/ref-app/ref-app-config/index.md).

## Use the Application {#use-the-application}

To start the application, enter *localhost:8080* in your browser. The reference application home screen displays:

![Click to Pay home](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/refapp_ctp_home.png "Click to Pay home")

Select any of the APIs to start using the application.

For ease of use, some forms are prepopulated with a functioning request, such as the SDK **init()** example below. Modify the values as needed.

![Initialize JS Library](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/refapp_ctp_SDK_init_SRC.png "Initialize JS Library")

Once you initialize the SDK, the Call Logs display below the form to show the SDK request and associated response.

![Initialize SDK Call Log](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/refapp_ctp_call_log.png "Initialize SDK Call Log")

You can then test specific API calls using the credentials generated during the user flow, for example, the Checkout API.

![Checkout API Form](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/refapp_ctp_checkout_api.png "Checkout API Form")

Submitting the form calls the respective APIs, while the original request and any related responses display below the form.

![Checkout API Request Response](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/refapp_ctp_request_response.png "Checkout API Request Response")

## Encryption of Requests {#encryption-of-requests}

Use Mastercard generated keys for encrypting some parameters before you send them in a request. You encrypt them using the `src-fpan-encryption` public key. Mastercard then decrypts using the private part. For more details on how to obtain these public keys, see the [API Keys](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md#public-keys-mastercard-provides) tutorial.

Code snippets are available in the Reference App in *MasterCardCommonService.java* under `/src/main/java/com/mastercard/mcs/clicktopay/service` and are preconfigured to download the latest Mastercard Client Encryption JWK Sets.
[POST /Cards](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card): Code snippets are available in the Reference App in *CardController.java* under `/src/main/java/com/mastercard/mcs/clicktopay/controller`, which details how to encrypt the sensitive data in requests.

## Decryption of Response {#decryption-of-response}

Some responses contain sensitive data that are encrypted by Mastercard. Use the [Payload Encryption Key](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/add-encryption-key/index.md) to decrypt sensitive data in these responses.
[POST /transaction/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout): The checkout response is a JWS signed by the Mastercard Click to Pay program for Integrators to validate the integrity of the data in the checkout response. Checkout response data is *encoded* , digitally signed and wrapped in a JWS structure. The `checkoutResponseJWS` should be decoded from BASE64. You can use [jwt.io](https://jwt.io/) for quick reference. After decoding, it will consist of a header and a body in clear text and a signature hash. Sensitive data in body is still encrypted in the `encryptedPayload` field. For more information, see [Decrypt the payload](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step8/index.md) in the Integrate with Click to Pay tutorial.

Code snippets are available in the Reference App in *MasterCardC2PCheckoutService* under `/src/main/java/com/mastercard/mcs/clicktopay/service`, which details how to decrypt this `encryptedPayload` value.

## Use Cases {#use-cases}

Use the Click to Pay reference app to test the following APIs and use cases:

### APIs {#apis}

* [Merchant Registration API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#registration)
* [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#click-to-pay)
* [Confirmations](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#confirmations)

### Use Cases {#use-cases-1}

* [Repeat User on Recognized Device](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/returninguser_recognized/index.md)
* [Repeat User on Unrecognized Device](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/repeatuser_newdevice/index.md)
* [First Time Users](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/firsttimeuser_usecase/index.md)
