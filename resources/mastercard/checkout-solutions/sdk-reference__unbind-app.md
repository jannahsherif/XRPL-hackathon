# Unbind AppInstance
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/unbind-app/index.md

This method disassociates the Consumer application / Consumer Device from the Consumer's Profile. Following are the two scenarios that unbind consumer's profile from their device:

* If the consumer clears the **Remember me for faster checkouts?** on the DCF screen, the action unbinds the consumer from the device. DCF via the Mastercard JavaScript library, will communicate to Integrator with `unbindAppInstance` set to true, and the `idToken` of the current profile. Based on the response from DCF, the Integrator calls `unbindAppInstance(<idToken>)` for each Mastercard SDK.

* If the consumer clicks **Not You?** , the action will exit the DCF screen and unbind the consumer from the device. DCF via the Mastercard JavaScript library, will communicate to Integrator a `dcfActionCode` of `SWITCH_CONSUMER`, along with `unbindAppInstance` set to true, and the `idToken` of the current profile. Based on the response from DCF, the Integrator calls `unbindAppInstance(<idToken>)` for each Mastercard SDK.

> #### Applicable Products {#applicable-products}
>
> [Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md)

## Method Signature {#method-signature}

```javascript

//Request
unbindAppInstance ({
  optional String <JWT> idToken;
  optional List <JWT> recognitionTokens
})

// Response
dictionary {
   required String <UUID> srcCorrelationId;
}
```

## Code Sample {#code-sample}

```JavaScript
// window.SRCSDK_MASTERCARD.unbindAppInstance returns a promise which will:

// Resolve to indicate success.
// Success Payload:
// {
//   srcCorrelationId: String // required
// }

// Reject to indicate an error was encountered
// The reject payload might include one of the reason codes listed below:

// AUTH_INVALID Invalid federated ID token.
// ACCT_INACCESSIBLE The account exists but is not currently accessible (e.g. is locked).
// Or one of the standard errors included in the Standard Errors and Business Errors section

// Define response handlers
function promiseResolvedHandler (payload) {
  // add success handler logic here
}
function promiseRejectedHandler (payload) {
  // add error handler logic here
}

const unbindAppInstancePromise = window.SRCSDK_MASTERCARD.unbindAppInstance({idToken: 'sample idToken Value'}) //  returns a promise
unbindAppInstancePromise
  .then(promiseResolvedHandler)
  .catch(promiseRejectedHandler)
// Or
async function unbindAppInstanceHandler () { // this method will return a promise
  try {
    const promiseResolvedPayload = await window.SRCSDK_MASTERCARD.unbindAppInstance({idToken: 'sample idToken Value'})
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
 "idToken": "eyJraWQiOiIxNTEwOTMtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiMjMwZGRiZC1lMGRkLTQwNmQtOGVlNC03OWQ1OTI2YWM5ZGIiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MTAxNzQ5LCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcxMDI3MTEsImlhdCI6MTY3NzEwMTgxMSwianRpIjoiNjkwNzkzZDctNGJiYy00ZWE3LWE4ZjctNDhmNzM0NDg0YjIxIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.qPz5rZ5KL_1xUDXFsCqFgnZC6TSOszHg5B-izeNBgoShtWjnq2zt05qGE_uQboGWNecxJzXe514095JxDdcpGlQn4Isjbjsn1AA965q5JdQaR0OI-vADLTwzBp-kaxzVvdvKtexNoUoHJjzWbuBstUpsbg1eHSI7ZyLyAEgXq69cqDtmCbKe_0BaY8NER3oOutv_X_SfILvU9VyHf3kkNSZEK7dcvCozQvlj0O5QcwUcxY9-3ORzrARKMItIdkxVTiUQicRU0-47W62K1P2xGqWJZhqJESjH0Fb4LEl24UX4TLnR1v5Tna4h3XUpGN1U5lSzNIvnm82WdHHdjJug6A",
 "recognitionTokens":[
  "eyJraWQiOiIyMDIzMDIyNzEzNTMzMC1wcm9kLWlkZW50aXR5LXZlcmlmaWNhdGlvbi1zcmMtbWFzdGVyY2FyZC1pbnQiLCJ0eXAiOiJKV1QrZXh0LnJlY29nbml0aW9uX3Rva2VuIiwiYWxnIjoiUlMyNTYifQ.eyJhcHBJbnN0YW5jZUlkIjoiZmUxN2FmNmEtODNkZi00ODk0LWE4YjAtZmVhMWE5MzZkYzU0IiwiYXVkIjoiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiY29uc3VtZXJJZCI6ImUwMTM3MTI0LTJhNzQtNDk1Ni04ZGU5LWFjNzViYzE1NzcxMCIsInNyY2lDbGllbnRJZCI6IjVlNjM5OWNmLTMwYzQtNDMxNi04MzI0LTkzZGEwYzlhODBmNSIsImlzcyI6Imh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsInNjb3BlcyI6WyJERUZBVUxUIl0sImV4cCI6MTc0MDMxODk1MCwiaWF0IjoxNzI0NzY2OTUwLCJqdGkiOiJiNzY0MWE4My1hYWUzLTQ2NGEtYmFjMC1lNzQxYmY5MWMxMzIiLCJwcm9ncmFtSWQiOiJTUkMifQ.VaN80IPqMqSImsaMKbB4N7alaePGzq3Aa1IHv6bt3Sl4ivPzoP-HSOhtdjKOyoqCa0WvM6CkXbVh5_1iPNRaPYw84_6E7whmUtmi1_GGQfeojLMP9YLoOLWuceMKc7StFDhliWNvMl0RScaacgOBvfteFXgP-SFtV3R68D-xnCgOGze8FYjN5lsC8lAxrrisuUUq1NR3SB5Kf0f8EMlvKJ9ispSxAa_LsIG9BgMoNd7tQ3ioOKAyqpPu4tJhjhlBRfzLXus6K2ZbW34NH498b-sheTgsLR0lGx-vg78x7DTQpPv4SNbFzuIkms2mnfpS6cfTxd3lI9OGeK3qFa1kFQ"
 ]
}
```

### Request Parameters {#request-parameters}

|                                                                 Name                                                                  |     Type     | Mandate  |                                                                                                                           Description                                                                                                                           |
|---------------------------------------------------------------------------------------------------------------------------------------|--------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [idToken](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md#id-token) | List\<JWT\>  | Optional | Federated ID token formatted as a JWT. When provided, it indicates which profile and Click to Pay System the app instance should be unbound from. If not provided, the app instance should be unbound from all linked profiles across all Click to Pay Systems. |
| **recognitionTokens**                                                                                                                 | List \<JWT\> | Optional | A JWT containing the recognition token that the Integrator stored on a device or browser.                                                                                                                                                                       |

## Response Example and Parameters {#response-example-and-parameters}

### Response Example {#response-example}

```json
{
  "srcCorrelationId": "4f339be7.e7939104-8888-41a6-82b1-85f9c04e91ae"
 }
```

### Response Parameters {#response-parameters}

|         Name         |  Type  |  R/C/O   |                    Description                    |
|----------------------|--------|----------|---------------------------------------------------|
| **srcCorrelationId** | String | Required | SRC Correlation ID returned by Mastercard System. |

## Application Errors {#application-errors}

|      Reason Code      |                             Description                              |                                                                                    Example                                                                                    |
|-----------------------|----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **AUTH_INVALID**      | Invalid federated ID token.                                          | * Javascript ```javascript { "reason": "AUTH_INVALID", "status": "401", "message": "Request not authenticated due to missing, invalid, or expired Auth token." } ```          |
| **ACCT_INACCESSIBLE** | The account exists but is not currently accessible (e.g. is locked). | * Javascript ```javascript { "reason": "ACCT_INACCESSIBLE", "status": "403", "message": "Access is denied to the requested resource. The user account has been locked." } ``` |

