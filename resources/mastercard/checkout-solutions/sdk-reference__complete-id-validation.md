# Complete Identity Validation
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/complete-id-validation/index.md

This method completes the validation of a Consumer Identifier, by evaluating supplied validation data, for example, an OTP.   

We recommend using [authenticate()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/index.md), which encapsulates the functionalities of [initiateIdentityValidation()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/initiate-id-validation/index.md) and [completeIdentityValidation()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/complete-id-validation/index.md) methods.
>
> #### Applicable Products {#applicable-products}
>
> [Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md)   

## Method Signature {#method-signature}

```javascript
completeIdentityValidation ({
   required String validationData;
   optional ComplianceSettings complianceSettings: {
     optional ComplianceResources complianceResources;
    };
})

// Response
dictionary {
   required String <JWT> idToken;
   conditional String <JWT> recognitionToken;
}
```

## Code Sample {#code-sample}

```JavaScript
// window.SRCSDK_MASTERCARD.completeIdentityValidation returns a promise which will:

// Resolve to indicate success.
// Success Payload:
// {
//    idToken: JWT // required
// }

// Reject to indicate an error was encountered
// The reject payload might include one of the reason codes listed below:

// VALDATA_MISSING The validation data was required but not supplied.
// CODE_INVALID The supplied OTP value was invalid. Try again.
// CODE_EXPIRED The OTP is expired. Regenerate the OTP and try again.
// RETRIES_EXCEEDED The limit for the number of retries for OTP generation was exceeded.
// ACCT_INACCESSIBLE The account exists but is not currently accessible (e.g. is locked).
// Or one of the standard errors included in the Standard Errors and Business Errors section

const sampleCompleteIdentityValidationParams = {
  validationData: String, // required, OTP value entered by the user.
}

// Define response handlers
function promiseResolvedHandler (payload) {
  // add success handler logic here
}
function promiseRejectedHandler (payload) {
  // add error handler logic here
}

const completeIdentityValidationPromise = window.SRCSDK_MASTERCARD.completeIdentityValidation(sampleCompleteIdentityValidationParams) //  returns a promise
completeIdentityValidationPromise
  .then(promiseResolvedHandler)
  .catch(promiseRejectedHandler)
// Or
async function completeIdentityValidationHandler () { // this method will return a promise
  try {
    const promiseResolvedPayload = await window.SRCSDK_MASTERCARD.completeIdentityValidation(sampleCompleteIdentityValidationParams)
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
  "validationData": "542856",
  "complianceSettings": {
    "complianceResources": [
      {
        "complianceType" : "REMEMBER_ME",
        "uri": "https://www.mastercard.com",
        "version": "1.0",
        "datePublished": "1679318465"
      }
     ]
   }
}
```

### Request Parameters {#request-parameters}

|          Name          |                                                                             Type                                                                             | Mandate  |          Description           |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|--------------------------------|
| **validationData**     | String                                                                                                                                                       | Required | OTP value entered by the user. |
| **complianceSettings** | [ComplianceSettings](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#compliance-settings) | Optional | Consumer compliance settings.  |

## Response Example and Parameters {#response-example-and-parameters}

### Response Example {#response-example}

```json
{
  "idToken": "eyJraWQiOiIxNTEwOTMtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2ZTZlOWM4Yi02ODgwLTRhYTktOTMyOS04Zjc5YjdkNGU4NTUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImFtciI6WyJzbXNfb3RwIl0sImlzcyI6Imh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsInNyY19lbWFpbF9tYXNrIjoiZCoqKioqN0BnbWFpbC5jb20iLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOnRydWUsInNyY19waG9uZV9udW1iZXJfbWFzayI6IigqKiopICoqKi0qMjc0IiwiYXVkIjpbImh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsImh0dHBzOlwvXC93d3cudmlzYS5jb20iLCJodHRwczpcL1wvYW1lcmljYW5leHByZXNzLmNvbSIsImh0dHBzOlwvXC9zcmMuZGlzY292ZXIuY29tIl0sImF1dGhfdGltZSI6MTY3NzA5OTM1NSwicGhvbmVfbnVtYmVyIjoiXC9ENFdnb1MwVmloTno2MjN6eVN5ekFQamtaMGVlUTRMcmxrYW1ZVDk4S3c9IiwiZXhwIjoxNjc3MTAwMjU1LCJpYXQiOjE2NzcwOTkzNTUsImp0aSI6ImMzZDA5NDRkLWU5NzYtNGE4MC1iNmU0LWI0YzcwOTc2ZDkwOSIsImVtYWlsIjoiemZcL05UVis0OWhGV2lTRTFtaG1LQk9yWjFObmhBR3gxYTFuaDFJME0xbHM9In0.qwUJXABzc0UBa4fXoOv1dX9PUqeiP5yqdMulhYoQvpfiiVRVH_yuh3Kt2CkbP611D1SCXjG4f0y3BsZSoL7yXcd1wPazWszNU53mSO37BlF4PhCOwLUzPts5pxpXOM4qaUaUb3ZsC0T2-3Q37Zttuiad0VBlwsb4Ziq6vvxgAq35Fvf8OyQTvhqYbI2sO7gL5GttO1eRBTIhZANSQ_K83n2lKtplFjxWIhy-LTrB-4KV_r5cHZwYf3kwKJTUxf3NPqiDSK1l2OWtrYiOgO7KNao_Zro6rJqZPo4yruyy9g0o1BUcoDCi4faA3hmAW1sveZLUdDoq84uJ-fZtFjyeow",
  "recognitionToken":"eyJraWQiOiIyMDIzMDIyNzEzNTMzMC1wcm9kLWlkZW50aXR5LXZlcmlmaWNhdGlvbi1zcmMtbWFzdGVyY2FyZC1pbnQiLCJ0eXAiOiJKV1QrZXh0LnJlY29nbml0aW9uX3Rva2VuIiwiYWxnIjoiUlMyNTYifQ.eyJhcHBJbnN0YW5jZUlkIjoiZmUxN2FmNmEtODNkZi00ODk0LWE4YjAtZmVhMWE5MzZkYzU0IiwiYXVkIjoiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiY29uc3VtZXJJZCI6ImUwMTM3MTI0LTJhNzQtNDk1Ni04ZGU5LWFjNzViYzE1NzcxMCIsInNyY2lDbGllbnRJZCI6IjVlNjM5OWNmLTMwYzQtNDMxNi04MzI0LTkzZGEwYzlhODBmNSIsImlzcyI6Imh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsInNjb3BlcyI6WyJERUZBVUxUIl0sImV4cCI6MTc0MDQwNDYxMywiaWF0IjoxNzI0ODUyNjEzLCJqdGkiOiJkODNiYzEwYi1kOTFjLTRkYzQtYjFkMS0xODhmMWQyMzkyYmMiLCJwcm9ncmFtSWQiOiJTUkMifQ.iXL14zp12-W9qZBqzQ1lDTnLUxQY983NqNmZNq6Y0xRtJkkOX4w52_uwW2g5ikOQOZkiKLpFdvIZN_GzIE-X8frKhyGPlFl46bNKhAEzrI0iZDaZpAJDaLxgjdOLXcpISEiu51nePcQE54PzDuIWn67eCl-36OWzYtqGkx4H9cSultUKGtKuIAPIS6zVZwV1af6TDdu7lxZooyo1CIUmD10r6wHclC4fN7SdKXC_rtvo5iR82UhNkrwRD7FvSn_2qnlfnYgRJWctHRs9XuZVnAOdUr1la5tkJkcpOnkE-KrkwH60Y-mLFx2ORj4xAldVPzhqSn5kMiO2uLQPLZp5Yg"
}
```

### Response Parameters {#response-parameters}

|         Name         |      Type      |   Mandate   |                                                                                                                                                                                                           Description                                                                                                                                                                                                            |
|----------------------|----------------|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **idToken**          | String         | Required    | [Federated ID token](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md#id-token) created by the Mastercard System after successful consumer identifier validation.                                                                                                                                                                                               |
| **recognitionToken** | String \<JWT\> | Conditional | A JWT containing the recognition token. Note: It is recommended to store/drop the recognition token as a first party cookie on the device/browser. Integrator must manage the security aspects and ensure that the following security measures are in place: * Expiration Date - Cookies should have a maximum lifespan of 180 days * Secure * httpOnly (only applicable for server-side tokens) * sameSite= strict * Value= JWT |

## Application Errors {#application-errors}

|      Reason Code      |                              Description                              |                                                                                           Example                                                                                            |
|-----------------------|-----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **VALDATA_MISSING**   | The validation data was required but not supplied.                    | * Javascript ```javascript { "reason": "VALDATA_MISSING", "status": "400", "message": "Missing parameter" } ```                                                                              |
| **CODE_INVALID**      | The supplied OTP value was invalid. Try again.                        | * Javascript ```javascript { "reason": "CODE_INVALID", "status": "400", "message": "Client specified an invalid argument. Check error message and error details for more information." } ``` |
| **CODE_EXPIRED**      | The OTP is expired. Regenerate the OTP and try again.                 | * Javascript ```javascript { "reason": "CODE_EXPIRED", "status": "400", "message": "Code expired." } ```                                                                                     |
| **RETRIES_EXCEEDED**  | The limit for the number of retries for OTP generation was exceeded.  | * Javascript ```javascript { "reason": "RETRIES_EXCEEDED", "status": "400", "message": "Retries exceeded." } ```                                                                             |
| **ACCT_INACCESSIBLE** | The account exists but is not currently accessible (e.g., is locked). | * Javascript ```javascript { "reason": "ACCT_INACCESSIBLE", "status": "403", "message": "Access is denied to the requested resource. The user account has been locked." } ```                |

