# Enroll Card
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/enroll-card/index.md

This method enrolls a new PAN to the Mastercard Checkout Solutions during checkout. The PAN may be enrolled to an existing / identified Click to Pay Profile, or to a newly-created Click to Pay Profile, or may not be added to an Click to Pay Profile at all, in the case of guest checkout.   
The PAN must be encrypted using the steps outlined in the \[Card Encryption\](/tutorial/perform-encryption/) tutorial.
>
> #### Applicable Products {#applicable-products}
>
> [Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md)

## Method Signature {#method-signature}

```javascript
enrollCard ({
   required String <JWE> encryptedCard;
   conditional String <JWT> idToken;
})

// Response
dictionary {
   required MaskedCard maskedCard;
   conditional String <UUID> srcCorrelationId;
}
```

## Code Sample {#code-sample}

```JavaScript
// window.SRCSDK_MASTERCARD.enrollCard returns a promise which will:

// Resolve to indicate success.
// Success Payload:
{
  maskedCard: MaskedCard // required
  srcCorrelationId: String // conditional
}

// Reject to indicate an error was encountered
// The reject payload might include one of the reason codes listed below:

// CARD_MISSING The encrypted card data is missing.
// CARD_ADD_FAILED Unable to add card.
// CARD_SECURITY_CODE_MISSING Card security must be supplied.
// CARD_INVALID Invalid card number.
// CARD_EXP_INVALID Invalid card expiry date.
// AUTH_INVALID Invalid federated ID token.
// ACCT_INACCESSIBLE The account exists but is not currently accessible (e.g. is locked).
//  Or one of the standard errors included in the Standard Errors and Business Errors section.

const sampleEnrollCardParams = {
  encryptedCard: JWE<Card>, // required,
  // An encrypted Card object describing the card to be enrolled with the Click to Pay System.
  // Encrypted using the public key of the target Click to Pay System.

  idToken: JWT // conditional
  // Federated ID token formatted as a JWT. In case a 3rd party federated identity
  // token is supplied, this may be used to provide the consumer hints in the
  // DCF UX to enter their identity credentials consistently across Click to Pay Systems.
  // Conditionality: provided when required (e.g. to enroll a card to one of a range
  // of identified SRC Profiles).

}

// Define response handlers
function promiseResolvedHandler (payload) {
  // add success handler logic here
}
function promiseRejectedHandler (payload) {
  // add error handler logic here
}

const enrollCardPromise = window.SRCSDK_MASTERCARD.enrollCard(sampleEnrollCardParams) //  returns a promise
enrollCardPromise
  .then(promiseResolvedHandler)
  .catch(promiseRejectedHandler)
// Or
async function enrollCardHandler () { // this method will return a promise
  try {
    const promiseResolvedPayload = await window.SRCSDK_MASTERCARD.enrollCard(sampleEnrollCardParams)
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
"encryptedCard":"eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.MIq_v15_eowvwX8MRgrb_H1EevZKB9CZSMMD8-lcbTjQvPFwAyx1USZbZRDB3RGfA_of6aDggnbmQmgsUStPQEpzYMma5mxlv5-VT6ry94xyttBFuCjBV0hudmcOEHiQeIiwS5xBb1iBPFaXTEmMpgDv8lvAm_ncbJ0V5FFDUYYVhK0-SbaODY5OKMdP2N3Y9bCkqjLCAcmkkN3mkrJ6WbzJURmNdfPyL344Cxc14NLZW3fk_yHkmjXybIXJWnUUsdxwFWS5ImwaZGEhbeLGGdpsPTkTkwD86uZCYJlx_dsZi02Vbm9AIiPpKE4L8GS_ltmOQ3YfgfxS6UuzYzaxKw.Xi3KLm7BvjSQuPMSVwSepg.U6Yp-DXd55F6jqy8-LIbmxmExzLaZNCF9Rcmg0g7ViUN3ydm_G5IqJmCFgXg1aO50HYJvnxi5OWG_rs6uV-1I2rrpu3bkuSjkj03N82yhFJBbhr8W_ahlgAMv2FPu4k7aeGp5rWm5lEdvH2UpSvKG2Ae111iFtL842Pk0pgPLOv4jnxFaCrvAPZ4vTvHS1RU27XGW7qXfAOtqpZ38oUJFamYueCIycDrsvacPT650O_JM_QS0ReXkH49bgAt1Sog9r2PY7fjU22ff1oGno51uVK_D9EXyHWcD4I5LYdVd6NenPDfycuQZ_wA98nqMCTzrqx5yQjUQDNYOoDF8ztoKVpYsTJeIUcFTpGXfoLLPTWjoIUds3mIyrXtBWO46rqN8c2nQ6FKC04-CBK9RGbWr1q1ENgfmsBvfXPCIUZ5ACzM1UaU2LkgEYlyiaxn-I3MfauP1adsA3ZOhrDHwSNgA0aVejT_9OTOaBUmywKGtdD7E8PhP7JqbMTXH2gM_9xU7t7TRvntE5uXeALKv4EDurn0p5bASwsYie7xWbsMHGF8lN0aGqJhNKiHL_NFGnR0wzPWS3UXFP7wZFbLM9qSPw.XFMSREEcssFqUM5kIwChIA",
"idToken" : "eyJraWQiOiIxNTEwOTMtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9"
}
```

### Request Parameters {#request-parameters}

|                                                                 Name                                                                  |                                                                      Type                                                                       |   Mandate   |                                                                                                                                                                                                                                            Description                                                                                                                                                                                                                                            |
|---------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **encryptedCard**                                                                                                                     | String \<JWE [Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#card) \> | Required    | An encrypted Card object (see below) describing the card to be enrolled with the Mastercard System. Refer to [Card Encryption](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/perform-encryption/index.md) tutorial for details on how to obtain the public keys and encrypt the card object, using Mastercard's [FPAN Encryption Key](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md#public-keys-mastercard-provides). |
| [idToken](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md#id-token) | String \<JWT\>                                                                                                                                  | Conditional | Federated ID token formatted as a JWT. In case a 3rd party federated identity token is supplied, this may be used to provide the consumer hints in the DCF UX to enter their identity credentials consistently across Click to Pay Systems. *Conditionality:* provided when required, e.g., to enroll a card to one of a range of identified SRC Profiles.                                                                                                                                        |

## Response Example and Parameters {#response-example-and-parameters}

### Response Example {#response-example}

```json
{
  "maskedCard": {
    "srcDigitalCardId": "111c5734-9fc5-4c69-9518-a4d3fe0e4fda",
    "srcPaymentCardId": null,
    "panBin": "546297",
    "panLastFour": "6705",
    "tokenLastFour": null,
    "digitalCardData": {
      "status": "ACTIVE",
      "presentationName": null,
      "descriptorName": "mastercard",
      "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/HIGH-MASK-3x.png",
      "artHeight": null,
      "artWidth": null
    },
    "panExpirationMonth": "11",
    "panExpirationYear": "2022",
    "digitalCardRelatedData": null,
    "countryCode": null,
    "dcf": {
      "type": "BROWSER",
      "uri": "https://sandbox.src.mastercard.com/dcf/",
      "logoUri": "http://mastercard.com/",
      "name": "mastercard"
    },
    "dateOfCardCreated": "2019-09-27T15:41:22.050Z",
    "dateOfCardLastUsed": null,
    "tokenBinRange": null,
    "maskedBillingAddress": null
  },
  "srcCorrelationId": "34f4a04b.f7b700c5-58af-4518-8e01-7bfbde003498"
}
```

### Response Parameters {#response-parameters}

|         Name         |                                                                     Type                                                                     |   Mandate   |                  Description                  |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------|
| **maskedCard**       | [MaskedCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#masked-card) | Required    | Masked card display and status data.          |
| **srcCorrelationId** | String                                                                                                                                       | Conditional | Correlation ID returned by Mastercard System. |

## Application errors {#application-errors}

|          Reason Code           |                             Description                              |                                                                                                               Example                                                                                                                |
|--------------------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **CARD_MISSING**               | The encrypted card data is missing.                                  | * Javascript ```javascript { "reason": "CARD_MISSING", "status": "400", "message": "Card missing." "errorDetail" [ { "reason": "CARD_MISSING", "message": "Card missing", "status": "400", "sourceType": "CARD_ENROLLMENT" } ] } ``` |
| **CARD_ADD_FAILED**            | Unable to add card.                                                  | * Javascript ```javascript { "reason": "CARD_ADD_FAILED", "status": "400", "message": "Card add failed." } ```                                                                                                                       |
| **CARD_SECURITY_CODE_MISSING** | Card security must be supplied.                                      | * Javascript ```javascript { "reason": "CARD_SECURITY_CODE_MISSING", "status": "400", "message": "Missing parameter." } ```                                                                                                          |
| **CARD_INVALID**               | Invalid card number.                                                 | * Javascript ```javascript { "reason": "CARD_INVALID", "status": "400", "message": "Card invalid." } ```                                                                                                                             |
| **CARD_EXP_INVALID**           | Invalid card expiry date.                                            | * Javascript ```javascript { "reason": "CARD_EXP_INVALID", "status": "400", "message": "Card expiration invalid." } ```                                                                                                              |
| **AUTH_INVALID**               | Invalid federated ID token.                                          | * Javascript ```javascript { "reason": "AUTH_INVALID", "status": "401", "message": "Request not authenticated due to missing, invalid, or expired Auth token." } ```                                                                 |
| **ACCT_INACCESSIBLE**          | The account exists but is not currently accessible (e.g. is locked). | * Javascript ```javascript { "reason": "ACCT_INACCESSIBLE", "status": "403", "message": "Access is denied to the requested resource. The user account has been locked." } ```                                                        |

