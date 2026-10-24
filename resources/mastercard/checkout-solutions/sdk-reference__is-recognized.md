# Is Recognized
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md

Determine if the user is recognized (e.g., by detecting the presence of a local cookie in the browser environment or by validating a recognition token) and, if so, obtain federated ID token (JWT). If the user is recognized, a federated ID token will be returned, and the Integrator (SRCI) may then use this in the [getSrcProfile](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/get-src-profile/index.md) method.

In the event of a customer not being recognized (e.g if the relevant cookie is not found in the browser environment) the call is expected to fail, and the customer should be offered the opportunity to login to or create a new profile.
>
> #### Applicable Products {#applicable-products}
>
> [Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md)

## Method Signature {#method-signature}

```javascript
isRecognized({
  optional List<JWT> recognitionTokens
}

)

// Response
dictionary {
  required Boolean recognized;
  conditional List<JWT> idTokens;
}
```

## Code Sample {#code-sample}

```JavaScript
// window.SRCSDK_MASTERCARD.isRecognized returns a promise which will:
// Resolve to indicate success.
// Success Payload:
// {
//   recognized: Boolean // required
//   idTokens: List <JWT> // conditional
// }

// Reject to indicate an error was encountered
// The reject payload might include one of the reason codes listed below:

// ACCT_INACCESSIBLE The account exists but is not currently accessible (e.g. is locked).
// one of the standard errors included Standard Errors and Business Errors section

// Define response handlers
function promiseResolvedHandler (payload) {
  // add success handler logic here
}
function promiseRejectedHandler (payload) {
  // add error handler logic here
}

const isRecognizedPromise = window.SRCSDK_MASTERCARD.isRecognized() //  returns a promise
isRecognizedPromise
  .then(promiseResolvedHandler)
  .catch(promiseRejectedHandler)
// Or
async function isRecognizedHandler () { // this method will return a promise
  try {
    const promiseResolvedPayload = await window.SRCSDK_MASTERCARD.isRecognized()
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

The isRecognized() method should be called as an asynchronous task as soon as possible after init().

### Request Example {#request-example}

```json
{
  "recognitionTokens":[
    "eyJraWQiOiIyMDIzMDIyNzEzNTMzMC1wcm9kLWlkZW50aXR5LXZlcmlmaWNhdGlvbi1zcmMtbWFzdGVyY2FyZC1pbnQiLCJ0eXAiOiJKV1QrZXh0LnJlY29nbml0aW9uX3Rva2VuIiwiYWxnIjoiUlMyNTYifQ.eyJhcHBJbnN0YW5jZUlkIjoiZmUxN2FmNmEtODNkZi00ODk0LWE4YjAtZmVhMWE5MzZkYzU0IiwiYXVkIjoiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiY29uc3VtZXJJZCI6ImUwMTM3MTI0LTJhNzQtNDk1Ni04ZGU5LWFjNzViYzE1NzcxMCIsInNyY2lDbGllbnRJZCI6IjVlNjM5OWNmLTMwYzQtNDMxNi04MzI0LTkzZGEwYzlhODBmNSIsImlzcyI6Imh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsInNjb3BlcyI6WyJERUZBVUxUIl0sImV4cCI6MTc0MDMxODk1MCwiaWF0IjoxNzI0NzY2OTUwLCJqdGkiOiJiNzY0MWE4My1hYWUzLTQ2NGEtYmFjMC1lNzQxYmY5MWMxMzIiLCJwcm9ncmFtSWQiOiJTUkMifQ.VaN80IPqMqSImsaMKbB4N7alaePGzq3Aa1IHv6bt3Sl4ivPzoP-HSOhtdjKOyoqCa0WvM6CkXbVh5_1iPNRaPYw84_6E7whmUtmi1_GGQfeojLMP9YLoOLWuceMKc7StFDhliWNvMl0RScaacgOBvfteFXgP-SFtV3R68D-xnCgOGze8FYjN5lsC8lAxrrisuUUq1NR3SB5Kf0f8EMlvKJ9ispSxAa_LsIG9BgMoNd7tQ3ioOKAyqpPu4tJhjhlBRfzLXus6K2ZbW34NH498b-sheTgsLR0lGx-vg78x7DTQpPv4SNbFzuIkms2mnfpS6cfTxd3lI9OGeK3qFa1kFQ"
    ]
}
```

### Request Parameters {#request-parameters}

|         Name          |     Type     | Mandate  |                                        Description                                        |
|-----------------------|--------------|----------|-------------------------------------------------------------------------------------------|
| **recognitionTokens** | List \<JWT\> | Optional | A JWT containing the recognition token that the Integrator stored on a device or browser. |

## Response Example and Parameters {#response-example-and-parameters}

### Response Example {#response-example}

```json
{
 "recognized": true,
 "idTokens": [
      "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MDg5NTEyLCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcwOTk0NzUsImlhdCI6MTY3NzA5ODU3NSwianRpIjoiNDJhMGY1ODEtMmY2NS00NzE5LWI4MWUtNTA4YTc5NWQyYTZjIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.qWB6CB7UJfJKIn-zbN96gYqe6e5rzTD_VCOXCbzMEv51xT9cMzozpFOMxKnz_yMkcmgvPXS_YSZWG2n1b8Yu2Q5Lu4ik56eE807QefciRF501BjWT_XA4tBUMlcRxSsWTJff18hd4YvAj-p3X8ZNMdXkQ58cR3tuUqAa4-fHENIZsKPFE9Z1OATfetRPldavGxhTV5XF81zVpXciB9Pq2MVgwMT_cgEK3XWkx5NgtzatKV5mID1UHt-m6u2_2SR63G1Q6Qy2EDRay6J_6CtFbb8R4VSpcsrVRIz1bZ63nOAHzkQK7SV2dIRNaTEj7elqvuydDVuedzR_GJN6Y90ekg"
          ]
}
```

### Response Parameters {#response-parameters}

|                                                                 Name                                                                  |                                                                              Type                                                                              |   Mandate   |                                                                               Description                                                                               |
|---------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **recognized**                                                                                                                        | Boolean                                                                                                                                                        | Required    | This indicates if the user is recognized/ identified by the Mastercard.                                                                                                 |
| [idToken](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md#id-token) | List \<String\> [(JWT)](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md#json-web-tokens-jwt) | Conditional | A list of consumer authorization tokens is returned only for the recognized user/ application. *Conditionality:* only supplied if one or more SRC profiles are located. |

## ID Token {#id-token}

Identity token provides a single unified Click to Pay experience across multiple Click to Pay Systems (card networks) and Integrator. It identifies a Click to Pay consumer and allows Click to Pay Systems to communicate with each other the Click to Pay user's identity verification (performed via email ID or phone number).

### ID Token Generation in Click to Pay: {#id-token-generation-in-click-to-pay}

Diagram fed_id **Issuing Click to Pay System** - The Click to Pay System which generates the encrypted ID token upon request from an Integrator.
>
>
> **Target Click to Pay System** - The Click to Pay System which receives the ID token from the Integrator and uses the data in it in the context of the use case.

1. The Integrator requests the ID token and intermediates between the Click to Pay Systems (example, Mastercard, Visa, Amex, Discover) to request, receive, and transmit an ID token based on the use case (example - First-time user enrollment, recognized user on a trusted device or a recognized user on a new device).
2. The issuing Click to Pay System creates the ID token, and sends the token to the requesting Integrator.
3. The Integrator receives the ID token, and sends it to one or more target Click to Pay Systems.
4. The target Click to Pay System decrypts the data in the ID token, validates and processes the data to match existing user profiles, decides whether to trust the validation (for example, Email or mobile OTP verification), which has been performed by the issuing Click to Pay System.
5. The target Click to Pay System uses the data in the context of the use case flow [(see scenarios below)](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md#id-tokens-are-used-in-the-following-scenarios), and responds to the Integrator.

### ID tokens are used in the following scenarios: {#id-tokens-are-used-in-the-following-scenarios}

* New user registration (user already registered with one Click to Pay System) - `idTokens` are used to communicate the consumer identity verification which was used with one Click to Pay System to the other Click to Pay System. This allows for consumer's profile creation with the other Click to Pay System.

* Returning user on new device - `idTokens` are used to retrieve cards based on the authentication performed in the session.

* Returning user on trusted browser - `idTokens` are used to retrieve cards based on the authentication performed on the browser.

## JSON Web Tokens (JWT) {#json-web-tokens-jwt}

JWT consists of three parts: a header, payload, and signature. The header, payload and signature are encoded separately using Base64url Encoding, and concatenated using periods to produce the JWT:

    const token = base64urlEncoding(header) + . + base64urlEncoding(payload) + . + base64urlEncoding(signature).

|     Part      |                                                                                                                                                                                                                                                Description                                                                                                                                                                                                                                                |                                                                              Example                                                                              |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **header**    | Identifies which algorithm is used to generate the signature. RS256 indicates that this token is signed using RSA signature with SHA-256 (RS256).                                                                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                   |
| **payload**   | Contains a set of claims. The JWT specification defines seven Registered Claim Names which are the standard fields commonly included in tokens. Custom claims are usually also included, depending on the purpose of the token.                                                                                                                                                                                                                                                                           | ``` “srcCorrelationId”: “39a9af3f-e27c-49f2-b924-26b74938d013”, “srciTransactionId”: “0a4e0d316891e3080a3750ab8ba51cd0d64365ad35dc60c”, “encryptedPayload”: … ``` |
| **signature** | This signature should be used to securely validate the token. The signature is calculated by encoding the header and payload using Base64url Encoding and concatenating the two together with a period separator. That string is then run through the cryptographic algorithm specified in the header (alg), in this case RS256, using Mastercard's private [Payload Signing Key](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/add-signing-key/index.md) (kid). | RS256( base64urlEncoding(header) + . + base64urlEncoding(payload), secret)                                                                                        |

## Application errors {#application-errors}

|      Reason Code      |                                          Description                                          |                                                                                    Example                                                                                    |
|-----------------------|-----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **ACCT_INACCESSIBLE** | The account exists but is not currently accessible (e.g., is locked).                         | * Javascript ```javascript { "reason": "ACCT_INACCESSIBLE", "status": "403", "message": "Access is denied to the requested resource. The user account has been locked." } ``` |
| **NOT_FOUND**         | There is no account associated with the request cookie, or the account is in a deleted state. | * Javascript ```javascript { "reason": "NOT_FOUND", "status": "404", "message": "Not found" } ```                                                                             |
| **INVALID_STATE**     | The account exists but is not in an "active" status for this program.                         | * Javascript ```javascript { "reason": "INVALID_STATE", "status": "400", "message": "Request cannot be executed due to incorrect field value." } ```                          |

