# Checkout
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md

This method performs checkout using the specified card. If successful, the response contains summary checkout information.

This method is called after the consumer has chosen a MaskedCard for checkout (resulting via selection of a card from the Candidate List OR as a response to [enrollCard()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/enroll-card/index.md) method).
In the checkout() call, the integrator can update and override `DpaTransactionOptions` data that was sent in the [init()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/init/index.md) call.

In addition to primary use-case, this method also supports card being provided at checkout. When the combined flow is executed, the client should provide the encryptedCard object as input parameter instead of ID of digital card identifier. The card will be enrolled to Mastercard System and used for checkout.
>
> #### Applicable Products {#applicable-products}
>
[Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md)   

<br />

<br />

<br />

<br />

<br />

<br />

## Method Signature {#method-signature}

```javascript

checkout ({
   conditional String srcDigitalCardId; // conditional - required if encryptedCard is not passed
   conditional String <JWE> encryptedCard; // conditional - required if srcDigitalCardId is not passed
   conditional String <JWT> idToken;
   optional DpaTransactionOptions dpaTransactionOptions;
   conditional SrciActionCode srciActionCode;
   conditional Window windowRef;
   optional Consumer consumer;
   optional String payloadTypeIndicatorCheckout;
   optional ComplianceSettings complianceSettings: {
     optional ComplianceResources complianceResources;
    };
})

// Response
dictionary {
   required DcfActionCode dcfActionCode;
   conditional String <JWT> idToken;
   conditional String <JWT> recognitionToken;
   optional String <JWS> checkoutResponseSignature;
   conditional CheckoutResponse checkoutResponse;
}
```

## Code Sample {#code-sample}

```JavaScript
// window.SRCSDK_MASTERCARD.checkout returns a promise which will:

// Resolve to indicate success.
// Success Payload:
// {
//   dcfActionCode: DcfActionCode // required
//   idToken: JWT // conditional
//   checkoutResponseSignature: JWS // optional
//   checkoutResponse: CheckoutResponse // conditional
// }

// Reject to indicate an error was encountered
// The reject payload might include one of the reason codes listed below:
// CARD_MISSING The digital card ID or encrypted card object was required but is missing.
// CARD_ADD_FAILED Unable to add card when combined flow executed.
// CARD_SECURITY_CODE_MISSING Card security must be supplied when combined flow executed.
// CARD_INVALID Invalid card number when combined flow executed.
// CARD_NOT_RECOGNIZED The specified card was not recognized.
// CARD_EXP_INVALID Invalid card expiry date.
// MERCHANT_DATA_INVALID Merchant data is invalid.
// UNABLE_TO_CONNECT Unable to connect to / Launch DCF.
// AUTH_INVALID Invalid federated ID token.
// TERMS_AND_CONDITIONS_NOT_ACCEPTED Terms and Conditions not accepted.
// ACCT_INACCESSIBLE The account exists but is not currently accessible (e.g. is locked).
//  Or one of the standard errors included in the Standard Errors and Business Errors section

const sampleCheckoutParams = {
 srcDigitalCardId: String, // conditional
 // Identifies the card to be used for checkout.
 // Conditionality: Provided for checkout with existing digital card.

 encryptedCard: JWE<Card>, // conditional
 // An encrypted Card object describing the card to be enrolled with the Click to Pay System.
 // Encrypted using the public key of the target Click to Pay System.
// Conditionality: Provided for combined flow where card is enrolled during checkout.

 idToken: JWT, // conditional
 // Federated ID token formatted as a JWT.
 // Conditionality: Provided for combined flow where card is enrolled during checkout,
 // so the card can be added to the respective SRC Profile.

 dpaTransactionOptions: DpaTransactionOptions, // optional
 // May be supplied, if necessary, to update the DPA transaction options.

 srciActionCode: SrciActionCode, // conditional
 // Indicates the action code to be supplied to the DCF. SrciActionCode enum:
 // • NEW_USER: new-user flow
 // • AUTH_FAILED: consumer identity authentication was attempted but failed
 // • AUTH_SKIPPED: consumer identity authentication was initiated but was skipped
 // Conditionality: only supplied if one of the defined action codes applies for this transaction,
 // otherwise srciActionCode can be omitted.

 consumer : Consumer
//May be supplied, if necessary, to pass consumer data to DCF

 windowRef: Window, // conditional
 // This is the window handle required to open a custom URI in the pop-up/iframe window.

 srciTransactionId: String // optional
}

// Define response handlers
function promiseResolvedHandler (payload) {
  // add success handler logic here
}
function promiseRejectedHandler (payload) {
  // add error handler logic here
}

const checkoutPromise = window.SRCSDK_MASTERCARD.checkout(sampleCheckoutParams) //  returns a promise
checkoutPromise
  .then(promiseResolvedHandler)
  .catch(promiseRejectedHandler)
// Or
async function checkoutHandler () { // this method will return a promise
  try {
    const promiseResolvedPayload = await window.SRCSDK_MASTERCARD.checkout(sampleCheckoutParams)
    // add success handler logic here
    // or
    // promiseResolvedHandler(promiseResolvedPayload)
  } catch (promiseRejectedPayload) {
    // add error handler logic here
    // or
    // promiseRejectedHandler(promiseRejectedPayload)
  }
}
```

## Request Example and Parameters {#request-example-and-parameters}

### Request Example {#request-example}

```json
{
    "idToken": "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MDg5NTEyLCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcwOTk0ODAsImlhdCI6MTY3NzA5ODU4MCwianRpIjoiZjFmOTJkMmUtNGZlMy00MWMyLWJhMjItNzUzMTE1NDZkNzcxIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.WK5FX_VweN0IDSii28S0SFYfCc3u4KpKvsygELlgRDuwgeRY66VW1CbojxT36vBx3fVgFq9Ipi0k67ud1mEXjK10VsfB1KThrx_kxGYtVIN_QCWKhNahkxv1099Bv8lS7Q5FAOH8NF7J2GrvnAKxnZsSpiGORWozQavWHdJRz9quDBzKaTPexZSFfGUCvWrLQf02cSKELwu_IfFPraQrUiu15Q_2TR09SO4YaNd_r7D4eiYzoTygvA9g-9OLEZjNQIWcwDC9NsHnfi1ZDBrvBfCMBpSHWExUC8Qxxc24pkf2LwycLbS746OwGMz3NO6ObxxkNfb3PdLQXhUbeinULw",
    "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
    "dpaData": {
        "dpaPresentationName": "Name"
    },
    "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
    "payloadTypeIndicatorCheckout": "FULL",
    "dpaTransactionOptions": {
        "transactionAmount": {
            "transactionAmount": "100.00",
            "transactionCurrencyCode": "USD"
        },
        "transactionType": "PURCHASE",
        "dpaBillingPreference": "FULL",
        "dpaShippingPreference": "FULL",
        "customInputData": {
            "com.mastercard.dcfExperience": "WITHIN_CHECKOUT"
        },
        "consumerNationalIdentifierRequested": false,
        "dpaAcceptedBillingCountries": [],
        "dpaAcceptedShippingCountries": [],
        "dpaLocale": "en_US",
        "acquirerMerchantId": "SRC3DS",
        "acquirerBIN": "545301",
        "consumerEmailAddressRequested": true,
        "consumerNameRequested": true,
        "consumerPhoneNumberRequested": true,
        "confirmPayment": false,
        "paymentOptions": {
            "dpaDynamicDataTtlMinutes": 15,
            "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_LONG_FORM"
        },
        "authenticationPreferences":{
            "payloadRequested": "AUTHENTICATED",
        },
    },
    "complianceSettings": {
      "complianceResources": [
        {
          "complianceType": "REMEMBER_ME",
          "uri": "https://...",
          "version": "1.0",
          "datePublished": "1679318465",
        }
      ]
  }
}
```

### Request Parameters {#request-parameters}

|               Name               |                                                                                Type                                                                                 |   Mandate   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **srcDigitalCardId**             | String                                                                                                                                                              | Conditional | Identifies the card to be used for checkout. *Conditionality*: Provided for checkout with existing digital card.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **encryptedCard**                | String \<JWE [Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#card)\>                      | Conditional | An encrypted Card object describing the card to be enrolled with the Click to Pay System. Encrypted using the public key of the target Click to Pay System. *Conditionality*: Provided for combined flow where card is enrolled during checkout.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **idToken**                      | String \<JWT\>                                                                                                                                                      | Conditional | [Federated ID token](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md#id-token) formatted as a JWT. *Conditionality*: Provided for combined flow where card is enrolled during checkout, so the card can be added to the respective SRC Profile.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **payloadTypeIndicatorCheckout** | String                                                                                                                                                              | Optional    | Type of payload to return as part of the checkout response. Valid values are: * `SUMMARY` - Returns payload containing [maskedCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#masked-card) and [maskedConsumer](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#masked-consumer) information. * `FULL` - Returns a full payload, with [checkoutResponse](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md#checkoutresponse) containing payload in addition to [maskedCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#masked-card) and [maskedConsumer](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#masked-consumer) information.                                                   |
| **dpaTransactionOptions**        | [DpaTransactionOptions](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#dpa-transaction-options) | Conditional | May be supplied, if necessary, to update the DPA (aka DSA) transaction options.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **srciActionCode**               | String                                                                                                                                                              | Conditional | Indicates the action code to be supplied to the DCF. Values can be: * `NEW_USER`: new-user flow * `AUTH_FAILED`: consumer identity authentication was attempted but failed * `AUTH_SKIPPED`: consumer identity authentication was initiated but was "skipped". *Conditionality:* only supplied if one of the defined action codes applies for this transaction, otherwise srciActionCode can be omitted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **windowRef**                    | Object                                                                                                                                                              | Conditional | This is the window handle required to open a custom URI in the center-aligned pop-up/iFrame window. When an SRCI gives the control to DCF, `windowRef` determines the position of the DCF window on the screen. It is recommended for SRCIs to provide `windowRef` pop-up (center-Aligned) in checkout to display the DCF window optimally on the screen. In general the DCF will render responsively inside the iframe size that it is given. We currently support the following values: * Optimal: 480px (width) x 600px (height) * Minimum: 392px (width) x 600px (height) *for a visible non mobile / full-screen iframe* Nested iFrames are not supported as they cause security concerns and user experience issues. **Note:** For [transaction authentication](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/tas_c2p/use-case1/index.md), you must open the `windowRef` pop-up (center-aligned): * Suggested: 480px (width) x 700px (height) * Minimum: 465px (width) x 700px (height) |
| **consumer**                     | [Consumer](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#consumer)                             | Optional    | Consumer data can be supplied to the DCF in checkout call for DCF to populate the consumer information without the need for the consumer to re-enter the same details.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **complianceSettings**           | [ComplianceSettings](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#compliance-settings)        | Optional    | Consumer compliance settings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

## Response Example and Parameters {#response-example-and-parameters}

### Response Example {#response-example}

```json
{
    "dcfActionCode": "COMPLETE",
    "unbindAppInstance": false,
    "checkoutResponseSignature": "eyJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpYXQiOjE2NzcwOTg1OTMsImFsZyI6IlJTMjU2IiwianRpIjoiYTdkNjMzNDctNjE2Mi00NzQ0LWIyZGMtOTQ4YzYxNWY1NjliIiwia2lkIjoiMTQ5MTI2LXNyYy1wYXlsb2FkLXZlcmlmaWNhdGlvbiJ9.eyJzcmNDb3JyZWxhdGlvbklkIjoiMzRmNGEwNGIuNTMzZmViNGUtZmU3Ni00NzU0LWEzZTUtNjU0MjE1MGE1YzRmIiwic3JjaVRyYW5zYWN0aW9uSWQiOiI1OWExMWViNS0xOWM5LTQ5ZWQtYTQ1NS1lMjk2MDJjYTUxNjciLCJtYXNrZWRDYXJkIjp7InNyY0RpZ2l0YWxDYXJkSWQiOiI3YjNkZTMwYS1iMTVlLTQ1NzgtYWI4OC1mZmE0MWQ5MTE5YmMiLCJwYW5CaW4iOiI1MTIwMzUiLCJwYW5MYXN0Rm91ciI6IjQ1NTIiLCJ0b2tlbkxhc3RGb3VyIjoiMjk0MCIsImRpZ2l0YWxDYXJkRGF0YSI6eyJzdGF0dXMiOiJBQ1RJVkUiLCJwcmVzZW50YXRpb25OYW1lIjoiVGVzdCBJc3N1ZXLDgsKuIiwiZGVzY3JpcHRvck5hbWUiOiJtYXN0ZXJjYXJkIiwiYXJ0VXJpIjoiaHR0cHM6Ly9zYnguYXNzZXRzLm1hc3RlcmNhcmQuY29tL2NhcmQtYXJ0L2NvbWJpbmVkLWltYWdlLWFzc2V0LzVmMjFmMDhlLTA0OTAtNDYwMy1iY2QxLWFjMGJlN2VhMGVjZC5wbmciLCJpc0NvQnJhbmRlZCI6ZmFsc2V9LCJwYW5FeHBpcmF0aW9uTW9udGgiOiIxMiIsInBhbkV4cGlyYXRpb25ZZWFyIjoiMjAyNCIsInBheW1lbnRDYXJkVHlwZSI6IkNSRURJVCIsIm1hc2tlZEJpbGxpbmdBZGRyZXNzIjp7ImFkZHJlc3NJZCI6ImI5YjRmMzFiLWUwZjYtNGU2MS04ZDUwLWFhNjk2YjlkYWM2NiIsIm5hbWUiOiJkYSoqKmwgaCoqKiIsImxpbmUxIjoiMSoqIDUqKiBBKioqKioiLCJjaXR5IjoiTmV3IFlvcmsiLCJzdGF0ZSI6Ik5ZIiwiY291bnRyeUNvZGUiOiJVUyIsInppcCI6IjEwMDExIn0sImRhdGVPZkNhcmRDcmVhdGVkIjoiMjAyMi0xMS0xOFQxNjozMjoxMC4xODVaIiwiZGF0ZU9mQ2FyZExhc3RVc2VkIjoiMjAyMy0wMi0yMlQxODoxMzo1MC4yMzVaIn0sIm1hc2tlZENvbnN1bWVyIjp7InNyY0NvbnN1bWVySWQiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJtYXNrZWRDb25zdW1lcklkZW50aXR5Ijp7ImlkZW50aXR5UHJvdmlkZXIiOiJTUkMiLCJpZGVudGl0eVR5cGUiOiJFTUFJTF9BRERSRVNTIn0sIm1hc2tlZEVtYWlsQWRkcmVzcyI6ImQqKioqKjdAZ21haWwuY29tIiwibWFza2VkTW9iaWxlTnVtYmVyIjp7ImNvdW50cnlDb2RlIjoiMSIsInBob25lTnVtYmVyIjoiKCoqKikgKioqLSoyNzQifSwiY291bnRyeUNvZGUiOiJVUyIsImxhbmd1YWdlQ29kZSI6ImVuIiwic3RhdHVzIjoiQUNUSVZFIiwibWFza2VkRmlyc3ROYW1lIjoiZCoqKioqIiwibWFza2VkTGFzdE5hbWUiOiJoKioqIiwibWFza2VkRnVsbE5hbWUiOiJkKioqKiogaCoqKiIsImRhdGVDb25zdW1lckFkZGVkIjoiMjAyMC0wMS0wOVQxNjoxNDoyOS4wMDVaIiwiZGF0ZUNvbnN1bWVyTGFzdFVzZWQiOiIyMDIzLTAyLTIyVDIwOjQzOjAwLjUwMVoifSwic2hpcHBpbmdBZGRyZXNzWmlwIjoiMTAwMTEiLCJzaGlwcGluZ0NvdW50cnlDb2RlIjoiVVMifQ.qYL2RSnMReMCTEV3tam2MRvOq64hutRED8l-6KdI4l8MtM394UONKlxtCZYQT_TAv-KdVbVRZfxOjPiF_mBVXrr_V88Jy1PZ4wNvO106t5WvX3bZY3Xb6TWFPezbl7GlEiHYh556GX0EMAJEOLttdZ8n_Epo20VQgylCLPe_s-4vw2mkfHvv7KcQP4cki-7qXmfe0bjj52uWIB-s4eS7cpWPpQ8DhVUXN1BHcWMWGhIJw88iy0CRFMnY29eeqtGg-bTmWi65jtwJNz40ItfmxvcB4H8y51EpUy2BEomCrV6RXCnKxkCvz0VY_c15P1IzxEEalvD-S1ujnEvbpEmsdg",
    "checkoutResponse": {
        "payload": "eyJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2....",
        "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
        "srciTransactionId": "59a11eb5-19c9-49ed-a455-e29602ca5167",
        "maskedCard": {
            "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
            "panBin": "512035",
            "panLastFour": "4552",
            "tokenLastFour": "2940",
            "digitalCardData": {
                "status": "ACTIVE",
                "presentationName": "Test Issuer",
                "descriptorName": "mastercard",
                "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
                "isCoBranded": false
            },
            "panExpirationMonth": "12",
            "panExpirationYear": "2024",
            "paymentCardType": "CREDIT",
            "maskedBillingAddress": {
                "addressId": "b9b4f31b-e0f6-4e61-8d50-aa696b9dac66",
                "name": "ja***l d***",
                "line1": "1** 5** A*****",
                "city": "New York",
                "state": "NY",
                "countryCode": "US",
                "zip": "10011"
            },
            "dateOfCardCreated": "2022-11-18T16:32:10.185Z",
            "dateOfCardLastUsed": "2023-02-22T18:13:50.235Z"
        },
        "maskedConsumer": {
            "srcConsumerId": "2899b782-633a-4ee0-88d9-555bf9d7c43d",
            "maskedConsumerIdentity": {
                "identityProvider": "SRC",
                "identityType": "EMAIL_ADDRESS"
            },
            "maskedEmailAddress": "j*****7@gmail.com",
            "maskedMobileNumber": {
                "countryCode": "1",
                "phoneNumber": "(***) ***-*123"
            },
            "countryCode": "US",
            "languageCode": "en",
            "status": "ACTIVE",
            "maskedFirstName": "j*****",
            "maskedLastName": "d***",
            "maskedFullName": "j***** d***",
            "dateConsumerAdded": "2020-01-09T16:14:29.005Z",
            "dateConsumerLastUsed": "2023-02-22T20:43:00.501Z"
        },
        "shippingAddressZip": "10011",
        "shippingCountryCode": "US"
    },
    "idToken": "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MDg5NTEyLCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcwOTk0ODAsImlhdCI6MTY3NzA5ODU4MCwianRpIjoiZjFmOTJkMmUtNGZlMy00MWMyLWJhMjItNzUzMTE1NDZkNzcxIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.WK5FX_VweN0IDSii28S0SFYfCc3u4KpKvsygELlgRDuwgeRY66VW1CbojxT36vBx3fVgFq9Ipi0k67ud1mEXjK10VsfB1KThrx_kxGYtVIN_QCWKhNahkxv1099Bv8lS7Q5FAOH8NF7J2GrvnAKxnZsSpiGORWozQavWHdJRz9quDBzKaTPexZSFfGUCvWrLQf02cSKELwu_IfFPraQrUiu15Q_2TR09SO4YaNd_r7D4eiYzoTygvA9g-9OLEZjNQIWcwDC9NsHnfi1ZDBrvBfCMBpSHWExUC8Qxxc24pkf2LwycLbS746OwGMz3NO6ObxxkNfb3PdLQXhUbeinULw",
    "recognitionToken":"eyJraWQiOiIyMDIzMDIyNzEzNTMzMC1wcm9kLWlkZW50aXR5LXZlcmlmaWNhdGlvbi1zcmMtbWFzdGVyY2FyZC1pbnQiLCJ0eXAiOiJKV1QrZXh0LnJlY29nbml0aW9uX3Rva2VuIiwiYWxnIjoiUlMyNTYifQ.eyJhcHBJbnN0YW5jZUlkIjoiZmUxN2FmNmEtODNkZi00ODk0LWE4YjAtZmVhMWE5MzZkYzU0IiwiYXVkIjoiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiY29uc3VtZXJJZCI6ImUwMTM3MTI0LTJhNzQtNDk1Ni04ZGU5LWFjNzViYzE1NzcxMCIsInNyY2lDbGllbnRJZCI6IjVlNjM5OWNmLTMwYzQtNDMxNi04MzI0LTkzZGEwYzlhODBmNSIsImlzcyI6Imh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsInNjb3BlcyI6WyJERUZBVUxUIl0sImV4cCI6MTc0MDQwNzcyOSwiaWF0IjoxNzI0ODU1NzI5LCJqdGkiOiJmZGQ2NjQzZS1mNWMwLTRlN2UtODE1Yi04NGQwMTQ2NzlmNjMiLCJwcm9ncmFtSWQiOiJTUkMifQ.XgDDwnu4IVXCNF2Ce5mpita55LI6SdGKJxCiKl2o6zvH-FzQ6YkdtH4ZA8jvotl8F0d5Seflgb_H_mmvy7goTgxCgqwI8OCif3PsBPaFm5Hg0pcb6Vbn_hnN4uj4SNkkXrGt_Wyyma5mYwpNLI2AHEdH0RPv0IJJh4gSrm4rW_YkQh67dVOqRCgF1_8LB1gXg_n-TLETMKEYw3W5sAGY0zA5ji3wL5d6T6UAB8-aBPLgrgs-Z-wFMclRLjwK-hgF6IwMikj7XzCnlWk9CmIYegi_xrVYND6v0EIB6qtldt9GW-1TFt-q-HWo-7VJjDmqd6-f_ncklXEljZiV5TpIvw"
}
```

### Response Parameters {#response-parameters}

|                                                                 Name                                                                  |                                                                           Type                                                                           |   Mandate   |                                                                                                                                                                                                           Description                                                                                                                                                                                                            |
|---------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **dcfActionCode**                                                                                                                     | String                                                                                                                                                   | Required    | Indicates the action code received from the DCF. Value can be: * `COMPLETE`: DCF processing completed normally * `CHANGE_CARD`: consumer wishes to select an alternative card * `ADD_CARD`: consumer wishes to add a new card * `SWITCH_CONSUMER`: consumer wishes to change account profile / identity * `CANCEL`: consumer wishes to cancel the flow * `ERROR`: an error was detected and the DCF processing cannot continue.  |
| **checkoutResponse**                                                                                                                  | [CheckoutResponse](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md#checkoutresponse) | Conditional | Wrapper containing data generated as result of checkout operation. Contains a JWE payload signed by the SRC system if `payloadTypeIndicatorCheckout` in the request is set to FULL. *Conditionality:* Only supplied in case the dcfActionCode is COMPLETE.                                                                                                                                                                       |
| **checkoutResponseSignature**                                                                                                         | String \<JWS\>                                                                                                                                           | Optional    | Cryptographic signature of the checkout response.                                                                                                                                                                                                                                                                                                                                                                                |
| [idToken](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md#id-token) | String \<JWT\>                                                                                                                                           | Conditional | ID Token obtained by DCF during checkout session. *Conditionality:* only supplied if obtained by the DCF during its processing of the checkout session, e.g., DCF requesting identity validation on the Mastercard System.                                                                                                                                                                                                       |
| **recognitionToken**                                                                                                                  | String \<JWT\>                                                                                                                                           | Conditional | A JWT containing the recognition token. Note: It is recommended to store/drop the recognition token as a first party cookie on the device/browser. Integrator must manage the security aspects and ensure that the following security measures are in place: * Expiration Date - Cookies should have a maximum lifespan of 180 days * Secure * httpOnly (only applicable for server-side tokens) * sameSite= strict * Value= JWT |

The `CheckoutResponse` type is a complex JSON wrapper object containing following set of attributes. The object may be optionally signed cryptographically by the Mastercard System.

### CheckoutResponse {#checkoutresponse}

|             Name             |                                                                         Type                                                                         |   Mandate   |                                                                                                                                                                                  Description                                                                                                                                                                                  |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **payload**                  | String                                                                                                                                               | Conditional | Payload data in JWE format that contains payment and/or consumer data. Once decrypted, the data will consist of a JSON document with relevant payment and consumer data. *Conditionality:* Only included if `payloadTypeIndicatorCheckout` is set to FULL.                                                                                                                    |
| **srcCorrelationId**         | String                                                                                                                                               | Required    | This is the unique identifier generated by Mastercard System to track and link SRC messages. This will be used as the transaction identifier assigned by the Mastercard System for this particular transaction. This should be sent to your integrator back end (using your own process) so that the back end can complete the transaction by requesting the payment payload. |
| **maskedCard**               | [MaskedCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#masked-card)         | Required    | Masked card display and status data.                                                                                                                                                                                                                                                                                                                                          |
| **maskedConsumer**           | [MaskedConsumer](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#masked-consumer) | Conditional | Masked consumer display and status data may be supplied if known to the Mastercard System. *Conditionality:* only supplied in case the consumer data was available for the associated card/profile.                                                                                                                                                                           |
| **shippingAddressZip**       | String                                                                                                                                               | Conditional | Unmasked shipping address postal code / ZIP. *Conditionality:* only supplied in case a shipping address was requested by the merchant.                                                                                                                                                                                                                                        |
| **shippingCountryCode**      | String                                                                                                                                               | Conditional | Unmasked shipping address country code. *Conditionality:* only supplied in case a shipping address was requested by the merchant.                                                                                                                                                                                                                                             |
| **threeDsOutputData**        | List                                                                                                                                                 | Conditional | 3DS output data. *Conditionality:* only supplied in case 3DS was performed by the Mastercard System.                                                                                                                                                                                                                                                                          |
| **networkSpecificOututData** | List                                                                                                                                                 | Optional    | Network-specific output data.                                                                                                                                                                                                                                                                                                                                                 |
| **assuranceData**            | [AssuranceData](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#assurance-data)   | Conditional | May be supplied to support risk management. *Conditionality:* only supplied if available to the Mastercard System.                                                                                                                                                                                                                                                            |
| **eventHistory**             | Object                                                                                                                                               | Conditional | May be supplied to support service management. *Conditionality:* only supplied if available to the Mastercard System.                                                                                                                                                                                                                                                         |
| **unbindAppInstance**        | Boolean                                                                                                                                              | Conditional | Set to `true` if the DCF wants integrator to unbind linked Click to Pay profile across Mastercard System. Checkout the scenarios when integrator calls the [unbindAppInstance](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/unbind-app/index.md) method.                                                                        |

## Application Errors {#application-errors}

|              Reason Code              |                                Description                                |                                                                                                               Example                                                                                                                |
|---------------------------------------|---------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **CARD_MISSING**                      | The digital card ID or encrypted card object was required but is missing. | * Javascript ```javascript { "reason": "CARD_MISSING", "status": "400", "message": "Card missing." "errorDetail" [ { "reason": "CARD_MISSING", "message": "Card missing", "status": "400", "sourceType": "CARD_ENROLLMENT" } ] } ``` |
| **CARD_ADD_FAILED**                   | Unable to add card when combined flow executed.                           | * Javascript ```javascript { "reason": "CARD_ADD_FAILED", "status": "400", "message": "Card add failed." } ```                                                                                                                       |
| **CARD_SECURITY_CODE_MISSING**        | Card security must be supplied when combined flow executed.               | * Javascript ```javascript { "reason": "CARD_SECURITY_CODE_MISSING", "status": "400", "message": "Missing parameter." } ```                                                                                                          |
| **CARD_INVALID**                      | Invalid card number when combined flow executed.                          | * Javascript ```javascript { "reason": "CARD_INVALID", "status": "400", "message": "Card invalid." } ```                                                                                                                             |
| **CARD_EXP_INVALID**                  | Invalid card expiry date.                                                 | * Javascript ```javascript { "reason": "CARD_EXP_INVALID", "status": "400", "message": "Card expiration invalid." } ```                                                                                                              |
| **CARD_NOT_RECOGNIZED**               | The specified card was not recognized.                                    | * Javascript ```javascript { "reason": "CARD_NOT_RECOGNIZED", "status": "400", "message": "Card not recognized." } ```                                                                                                               |
| **MERCHANT_DATA_INVALID**             | Merchant data is invalid.                                                 | * Javascript ```javascript { "reason": "MERCHANT_DATA_INVALID", "status": "400", "message": "Merchant data invalid." } ```                                                                                                           |
| **UNABLE_TO_CONNECT**                 | Unable to connect to / Launch DCF.                                        | * Javascript ```javascript { "reason": "UNABLE_TO_CONNECT", "status": "400", "message": "Service error" } ```                                                                                                                        |
| **TERMS_AND_CONDITIONS_NOT_ACCEPTED** | Terms and Conditions not accepted.                                        | * Javascript ```javascript { "reason": "TERMS_AND_CONDITIONS_NOT_ACCEPTED", "status": "400", "message": "Service error" } ```                                                                                                        |
| **AUTH_INVALID**                      | Invalid federated ID token.                                               | * Javascript ```javascript { "reason": "AUTH_INVALID", "status": "401", "message": "Request not authenticated due to missing, invalid, or expired Auth token." } ```                                                                 |
| **ACCT_INACCESSIBLE**                 | The account exists but is not currently accessible (e.g. is locked).      | * Javascript ```javascript { "reason": "ACCT_INACCESSIBLE", "status": "403", "message": "Access is denied to the requested resource. The user account has been locked." } ```                                                        |

