# Identity Lookup
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md

This method checks whether a specified Consumer Identity (email address or mobile phone number) is known to the Mastercard System.
>
> #### Applicable Products {#applicable-products}
>
> [Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md)

## Method Signature {#method-signature}

```javascript
identityLookup({
   required ConsumerIdentity consumerIdentity;
   optional Boolean returnValidationChannels;
})

// Response
dictionary{
   required Boolean consumerPresent;
   optional String lastUsedCardTimestamp;
   optional IdentityValidationChannel[] supportedValidationChannels
}
```

## Code Sample {#code-sample}

```JavaScript
// window.SRCSDK_MASTERCARD.identityLookup returns a promise which will:

// Resolve to indicate success.
// Success Payload:
// {
//   consumerPresent: Boolean  // required, indicates if the consumer is present in the Click to Pay System.
// }

// Reject to indicate an error was encountered
// The reject payload might include one of the reason codes listed below:

// CONSUMER_ID_MISSING The consumer identity was required but not supplied.
// FRAUD The user account was locked or disabled.
// ID_FORMAT_UNSUPPORTED Unsupported Id format
// ACCT_INACCESSIBLE The account exists but is not currently accessible (e.g. is locked).
//  Or one of the standard errors included in the Standard Errors and Business Errors section

const sampleIdentityLookupParams = {
  consumerIdentity: ConsumerIdentity, //  required
  returnValidationChannels: true, // returns available authentication validation channels
}

// Define response handlers
function promiseResolvedHandler (payload) {
  // add success handler logic here
}
function promiseRejectedHandler (payload) {
  // add error handler logic here
}

const identityLookupPromise = window.SRCSDK_MASTERCARD.identityLookup(sampleIdentityLookupParams) //  returns a promise
identityLookupPromise
  .then(promiseResolvedHandler)
  .catch(promiseRejectedHandler)
// Or
async function identityLookupHandler () { // this method will return a promise
  try {
    const promiseResolvedPayload = await window.SRCSDK_MASTERCARD.identityLookup(sampleIdentityLookupParams)
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
  "consumerIdentity":
    {
        "identityProvider": "SRC",
        "identityType": "EMAIL_ADDRESS",
        "identityValue": "jdoe@gmail.com"
    },
  "returnValidationChannels": true
}
```

### Request Parameters {#request-parameters}

|             Name             |                                                                           Type                                                                           | Mandate  |                                                                                                                                                                                                Description                                                                                                                                                                                                 |
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **consumerIdentity**         | [ConsumerIdentity](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#consumer-identity) | Required | Primary verifiable consumer identifier within a Click to Pay Profile. It can be email address or mobile phone number.                                                                                                                                                                                                                                                                                      |
| **returnValidationChannels** | Boolean                                                                                                                                                  | Optional | Indicates whether to return all authentication validation channels that are available for this Click to Pay profile. Allows the Integrator to understand which consumer authentication flows will potentially run when calling [authenticate()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_clicktopay/index.md). Default : false |

## Response Example and Parameters {#response-example-and-parameters}

### Response Example {#response-example}

```json
{
  "consumerPresent": true,
  "lastUsedCardTimestamp": "1677085095",
  "supportedValidationChannels": [
    {
        "maskedValidationChannel": "j*****7@gmail.com", 
        "identityType": "EMAIL_ADDRESS"
    }, 
    { 
        "maskedValidationChannel": "+1(***) ***-*123", 
        "identityType": "MOBILE_PHONE_NUMBER" 
    },
    { 
        "maskedValidationChannel": "", // empty value as it is FIDO2 based 
        "identityType": "FIDO2" 
    }, 
  ]
}
```

### Response Parameters {#response-parameters}

|              Name               |                                                                                         Type                                                                                         | Mandate  |                                                                                                                                                                                                                                                                                                                                              Description                                                                                                                                                                                                                                                                                                                                              |
|---------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **consumerPresent**             | Boolean                                                                                                                                                                              | Required | This indicates if the consumer is present in the Mastercard System.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **lastUsedCardTimestamp**       | String                                                                                                                                                                               | Optional | A timestamp for when the last card associated with the consumer was used. This timestamp is returned as a string representing a UTC time in Unix epoch format. An integrator uses this timestamp to select the card network to execute [initiateIdentityValidation()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/initiate-id-validation/index.md) based on the last card used at checkout. The timestamp is updated every time a new payload is generated by any of the cards under a profile. If one or more participating networks return a lastUsedCardTimestamp, the network with the most recent timestamp must be used for identity validation. |
| **supportedValidationChannels** | List [\<IdentityValidationChannel\>](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#identity-validation-channel) | Optional | List of supported validation channels along with channel type (SMS, EMAIL, FIDO2). This will be returned by the Click to Pay System to indicate the channels supported.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

## Application errors {#application-errors}

|        Reason Code        |                              Description                              |                                                                                    Example                                                                                    |
|---------------------------|-----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **CONSUMER_ID_MISSING**   | The consumer identity was required but not supplied.                  | * Javascript ```javascript { "reason": "CONSUMER_ID_MISSING", "status": "400", "message": "Missing parameter" } ```                                                           |
| **FRAUD**                 | The user account was locked or disabled.                              | * Javascript ```javascript { "reason": "FRAUD", "status": "400", "message": "Missing parameter" } ```                                                                         |
| **ID_FORMAT_UNSUPPORTED** | Incorrect Identity Type passed.                                       | * Javascript ```javascript { "reason": "ID_FORMAT_UNSUPPORTED", "status": "400", "message": "Id format unsupported." } ```                                                    |
| **ACCT_INACCESSIBLE**     | The account exists but is not currently accessible (e.g., is locked). | * Javascript ```javascript { "reason": "ACCT_INACCESSIBLE", "status": "403", "message": "Access is denied to the requested resource. The user account has been locked." } ``` |

