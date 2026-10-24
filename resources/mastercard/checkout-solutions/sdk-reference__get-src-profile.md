# Get SRC Profile
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/get-src-profile/index.md

This method takes a list of `idTokens` and returns masked card and other account profile data to facilitate card selection.
>
> #### Applicable Products {#applicable-products}
>
> [Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md)

## Method Signature {#method-signature}

```javascript
getSrcProfile({
  optional List<JWT> idTokens;
})

// Response {
  optional List<SrcProfile> profiles;
  conditional String <UUID> srcCorrelationId;
}
```

## Code Sample {#code-sample}

This `getSrcProfile` method will accept an array of `idTokens`.

```JavaScript
// window.SRCSDK_MASTERCARD.getSrcProfile returns a promise which will:

// Resolve to indicate success.
// Success Payload:
// {
//   profiles: List<SrcProfile> // optional, only supplied if one or more SRC profiles are located
//   srcCorrelationId: String // conditional
// }

// Reject to indicate an error was encountered
// The reject payload might include one of the reason codes listed below:

// AUTH_INVALID Invalid federated ID token.
// ACCT_INACCESSIBLE The account exists but is not currently accessible (e.g. is locked).
//   Or one of the standard errors included in the Standard Errors and Business Errors section

const sampleGetSrcProfileParams = {
  idTokens: List<JWT>, // Optional
}

// Define response handlers
function promiseResolvedHandler (payload) {
  // add success handler logic here
}
function promiseRejectedHandler (payload) {
  // add error handler logic here
}

const getSrcProfilePromise = window.SRCSDK_MASTERCARD.getSrcProfile(sampleGetSrcProfileParams) //  returns a promise
getSrcProfilePromise
  .then(promiseResolvedHandler)
  .catch(promiseRejectedHandler)
// Or
async function getSrcProfileHandler () { // this method will return a promise
  try {
    const promiseResolvedPayload = await window.SRCSDK_MASTERCARD.getSrcProfile(sampleGetSrcProfileParams)
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
"idTokens": [
            "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MDg5NTEyLCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcwOTk0NzUsImlhdCI6MTY3NzA5ODU3NSwianRpIjoiNDJhMGY1ODEtMmY2NS00NzE5LWI4MWUtNTA4YTc5NWQyYTZjIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.qWB6CB7UJfJKIn-zbN96gYqe6e5rzTD_VCOXCbzMEv51xT9cMzozpFOMxKnz_yMkcmgvPXS_YSZWG2n1b8Yu2Q5Lu4ik56eE807QefciRF501BjWT_XA4tBUMlcRxSsWTJff18hd4YvAj-p3X8ZNMdXkQ58cR3tuUqAa4-fHENIZsKPFE9Z1OATfetRPldavGxhTV5XF81zVpXciB9Pq2MVgwMT_cgEK3XWkx5NgtzatKV5mID1UHt-m6u2_2SR63G1Q6Qy2EDRay6J_6CtFbb8R4VSpcsrVRIz1bZ63nOAHzkQK7SV2dIRNaTEj7elqvuydDVuedzR_GJN6Y90ekg"
  ]
}
```

### Request Parameters {#request-parameters}

|     Name     |                                                                        Type                                                                        | Mandate  |                                                                                                                                                                    Description                                                                                                                                                                     |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **idTokens** | List \<String\>[(JWT)](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md#id-token) | Optional | Integrators can provide one or more idTokens received from one or more Click to Pay Systems based on consumer recognition performed via OTP (for unrecognized flow) or cookie (for recognized flow). integrator aggregates `idTokens` from multiple Click to Pay Systems and provides these to individual Click to Pay Systems to fetch card list. |

## Response Example and Parameters {#response-example-and-parameters}

### Response Example {#response-example}

A successful `getSrcProfile` call containing one or more ID tokens will result in a response object in JSON with all the profiles and the associated cards, including the scenario where the ID tokens may have different email IDs. The below JSON example shows the result when `getSrcProfile` call is made with one ID token :

```json
{
    "profiles": [
        {
            "authorization": "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MDg5NTEyLCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcwOTk0ODAsImlhdCI6MTY3NzA5ODU4MCwianRpIjoiZjFmOTJkMmUtNGZlMy00MWMyLWJhMjItNzUzMTE1NDZkNzcxIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.WK5FX_VweN0IDSii28S0SFYfCc3u4KpKvsygELlgRDuwgeRY66VW1CbojxT36vBx3fVgFq9Ipi0k67ud1mEXjK10VsfB1KThrx_kxGYtVIN_QCWKhNahkxv1099Bv8lS7Q5FAOH8NF7J2GrvnAKxnZsSpiGORWozQavWHdJRz9quDBzKaTPexZSFfGUCvWrLQf02cSKELwu_IfFPraQrUiu15Q_2TR09SO4YaNd_r7D4eiYzoTygvA9g-9OLEZjNQIWcwDC9NsHnfi1ZDBrvBfCMBpSHWExUC8Qxxc24pkf2LwycLbS746OwGMz3NO6ObxxkNfb3PdLQXhUbeinULw",
            "maskedCards": [
                {
                    "srcDigitalCardId": "e1deba24-ff08-4445-a3a0-976488956a86",
                    "srcPaymentCardId": null,
                    "panBin": "518600",
                    "panLastFour": "0055",
                    "tokenLastFour": null,
                    "digitalCardData": {
                        "status": "ACTIVE",
                        "presentationName": "",
                        "descriptorName": "",
                        "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/HIGH-MASK-3x.png",
                        "artHeight": null,
                        "artWidth": null,
                        "pendingEvents": null,
                        "coBrandedName": null,
                        "isCoBranded": false
                    },
                    "digitalCardFeatures": [],
                    "panExpirationMonth": "12",
                    "panExpirationYear": "2022",
                    "digitalCardRelatedData": null,
                    "countryCode": "US",
                    "dcf": {
                        "type": "BROWSER",
                        "uri": "https://sandbox.src.mastercard.com/pay/",
                        "logoUri": "http://mastercard.com/",
                        "name": "mastercard"
                    },
                    "dateOfCardCreated": "2021-05-04T19:06:08.888Z",
                    "dateOfCardLastUsed": "2022-05-09T17:17:32.352Z",
                    "paymentCardDescriptor": "mastercard",
                    "paymentCardType": "PREPAID",
                    "tokenBinRange": null,
                    "maskedBillingAddress": {
                        "name": "j**n d**",
                        "line1": "1** f**** a*****",
                        "line2": null,
                        "line3": null,
                        "city": "new york",
                        "state": "NY",
                        "countryCode": "US",
                        "zip": "10011",
                        "addressId": "c2a1b746-dce8-49fe-8140-a3979ab6e1d8"
                    }
                }
            ],
            "maskedConsumer": {
                "srcConsumerId": "2899b782-633a-4ee0-88d9-555bf9d7c43d",
                "maskedConsumerIdentity": {
                    "identityProvider": "SRC",
                    "identityType": "EMAIL_ADDRESS",
                    "maskedIdentityValue": ""
                },
                "maskedEmailAddress": "j*****7@gmail.com",
                "maskedConsumerMobileNumber": {
                    "countryCode": "1",
                    "phoneNumber": "(***) ***-*123"
                },
                "maskedNationalIdentifier": null,
                "complianceSettings": {
                    "privacy": {
                        "latestVersion": "4.0",
                        "latestVersionUri": "https://www.mastercard.com/global/click-to-pay/en-gb/privacy-notice.html",
                        "acceptedVersion": "4.0"
                    },
                    "tnc": {
                        "latestVersion": "2.2",
                        "latestVersionUri": "https://www.mastercard.com/global/click-to-pay/en-gb/terms-of-use.html",
                        "acceptedVersion": "2.2"
                    }
                },
                "countryCode": "US",
                "languageCode": "en",
                "status": "ACTIVE",
                "maskedFirstName": "j*****",
                "maskedLastName": "d**",
                "dateConsumerAdded": "2020-01-09T16:14:29.005Z"
            },
            "maskedShippingAddresses": [
                {
                    "name": "jo**n d**",
                    "line1": "1** 5** A*****",
                    "line2": null,
                    "line3": null,
                    "city": "New York",
                    "state": "NY",
                    "countryCode": "US",
                    "zip": "10011",
                    "createTime": "2022-11-22T18:05:55.230Z",
                    "lastUsedTime": "2023-02-22T15:42:27.191Z",
                    "addressId": "0919bced-6b36-440e-b09f-9d368a0c2eea"
                }
            ]
        }
    ],
    "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f"
}
```

### Response Parameters {#response-parameters}

|         Name         |                                                                         Type                                                                         |   Mandate   |                                                                                                                                                                                             Description                                                                                                                                                                                             |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **profiles**         | List[\<SrcProfile\>](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#src-profile) | Optional    | SRC Profiles associated to each recognized user. Conditionality: only supplied if one or more SRC profiles are located.                                                                                                                                                                                                                                                                             |
| **srcCorrelationId** | String                                                                                                                                               | Conditional | A unique identifier generated by the Mastercard System. `srcCorrelationId` is used to link any SDK/API calls for a specific transaction. For example, the `srcCorrelationId` in this response will be used in the [POST /transaction/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) call for the same transaction. |

## Application errors {#application-errors}

|      Reason Code      |                             Description                              |                                                                                    Example                                                                                    |
|-----------------------|----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **AUTH_INVALID**      | Invalid federated ID token.                                          | * Javascript ```javascript { "reason": "AUTH_INVALID", "status": "401", "message": "Not found." } ```                                                                         |
| **ACCT_INACCESSIBLE** | The account exists but is not currently accessible (e.g. is locked). | * Javascript ```javascript { "reason": "ACCT_INACCESSIBLE", "status": "403", "message": "Access is denied to the requested resource. The user account has been locked." } ``` |

