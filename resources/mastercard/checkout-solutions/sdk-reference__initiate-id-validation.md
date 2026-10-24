# Initiate Identity Validation
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/initiate-id-validation/index.md

This method initiates Consumer Identifier validation via an appropriate mechanism, e.g., sending an OTP to the Consumer's email address or mobile phone number.   

We recommend using [authenticate()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/index.md), which encapsulates the functionalities of [initiateIdentityValidation()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/initiate-id-validation/index.md) and [completeIdentityValidation()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/complete-id-validation/index.md) methods.
>
> #### Applicable Products {#applicable-products}
>
> [Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md)   

## Method Signature {#method-signature}

```javascript
initiateIdentityValidation ({
   optional String requestedValidationChannelId;
})

// Response
dictionary {
   required String maskedValidationChannel;
   optional String validationMessage;
   required List<IdentityValidationChannel> supportedValidationChannels;
}
```

## Code Sample {#code-sample}

```JavaScript
// window.SRCSDK_MASTERCARD.initiateIdentityValidation returns a promise which will:

// Resolve to indicate success.
// Success Payload:
// {
//   maskedValidationChannel: String // required
//   Masked value of the channel used to deliver the Validation code (like OTP).
//   Channel can be masked Email/Phone

//   validationMessage: String // optional
//   Optional display message which may contain a locale- specific advisory to the
//   consumer about the identity validation process.

//   supportedValidationChannels: List<IdentityValidationChannel> // required
// }

// Reject to indicate an error was encountered
// The reject payload might include one of the reason codes listed below:

// OTP_SEND_FAILED The OTP could not be sent to the recipient.
// RETRIES_EXCEEDED The limit for the number of retries for OTP generation was exceeded.
// SESSION_ID_INVALID Invalid session ID.
// ACCT_INACCESSIBLE The account exists but is not currently accessible (e.g. is locked).
//  Or one of the standard errors included in the Standard Errors and Business Errors section

const sampleInitiateIdentityValidationParams = {
  requestedValidationChannelId: String, //  optional
  // Identifies the requested channel-type over which the identity validation
  // should be initiated.
}

// Define response handlers
function promiseResolvedHandler (payload) {
  // add success handler logic here
}
function promiseRejectedHandler (payload) {
  // add error handler logic here
}

const initiateIdentityValidationPromise = window.SRCSDK_MASTERCARD.initiateIdentityValidation(sampleInitiateIdentityValidationParams) //  returns a promise
initiateIdentityValidationPromise
  .then(promiseResolvedHandler)
  .catch(promiseRejectedHandler)
// Or
async function initiateIdentityValidationHandler () { // this method will return a promise
  try {
    const promiseResolvedPayload = await window.SRCSDK_MASTERCARD.initiateIdentityValidation(sampleInitiateIdentityValidationParams)
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
    "requestedValidationChannelId": "EMAIL_ADDRESS"
}
```

### Request Parameters {#request-parameters}

|               Name               |  Type  | Mandate  |                                          Description                                          |
|----------------------------------|--------|----------|-----------------------------------------------------------------------------------------------|
| **requestedValidationChannelId** | String | Optional | Identifies the requested channel-type over which the identity validation should be initiated. |

## Response Example and Parameters {#response-example-and-parameters}

### Response Example {#response-example}

```json
{
    "maskedValidationChannel": "+1(***) ***-*123",
    "supportedValidationChannels": [
        {
            "maskedValidationChannel": "j*****7@gmail.com",
            "identityType": "EMAIL_ADDRESS"
        },
        {
            "maskedValidationChannel": "+1(***) ***-*123",
            "identityType": "MOBILE_PHONE_NUMBER"
        }
    ]
}
```

### Response Parameters {#response-parameters}

|              Name               |                                                                                         Type                                                                                         | Mandate  |                                                                           Description                                                                            |
|---------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **maskedValidationChannel**     | String                                                                                                                                                                               | Required | Masked value of the channel used to deliver the Validation code (like OTP). It can be either a masked email address or phone number.                             |
| **validationMessage**           | String                                                                                                                                                                               | Optional | Message to provide advice to the consumer about the identity validation process, which is specific to their locale.                                              |
| **supportedValidationChannels** | List [\<IdentityValidationChannel\>](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#identity-validation-channel) | Required | List of supported validation channels along with channel type (SMS, EMAIL). This will be returned by the Click to Pay System to indicate the channels supported. |

## Application errors {#application-errors}

|      Reason Code       |                              Description                              |                                                                                    Example                                                                                    |
|------------------------|-----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **OTP_SEND_FAILED**    | The OTP could not be sent to the recipient.                           | * Javascript ```javascript { "reason": "OTP_SEND_FAILED", "status": "400", "message": "Failed to send OTP." } ```                                                             |
| **RETRIES_EXCEEDED**   | The limit for the number of retries for OTP generation was exceeded.  | * Javascript ```javascript { "reason": "RETRIES_EXCEEDED", "status": "400", "message": "Retries exceeded" } ```                                                               |
| **SESSION_ID_INVALID** | Invalid session ID.                                                   | * Javascript ```javascript { "reason": "SESSION_ID_INVALID", "status": "400", "message": "Service error" } ```                                                                |
| **ACCT_INACCESSIBLE**  | The account exists but is not currently accessible (e.g., is locked). | * Javascript ```javascript { "reason": "ACCT_INACCESSIBLE", "status": "403", "message": "Access is denied to the requested resource. The user account has been locked." } ``` |

