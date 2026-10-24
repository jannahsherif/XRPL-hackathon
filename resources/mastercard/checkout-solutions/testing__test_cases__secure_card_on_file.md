# Secure Card on File
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md

As a prerequisite, familiarize yourself with [Secure Card on File use cases](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/card-on-file/index.md).

|                                                                         Product                                                                         |                                                               Description                                                               |
|---------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| [Scenario 1](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-1)   | User successfully enrolls new card and completes checkout.                                                                              |
| [Scenario 2](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-2)   | New card enrollment failure.                                                                                                            |
| [Scenario 3](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-3)   | User successfully enrolls new card, but fails to complete a checkout.                                                                   |
| [Scenario 4](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-4)   | User successfully enrolls new card and completes checkout with FLS (Fraud Liability Protection).                                        |
| [Scenario 5](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-5)   | User retrieves an existing card stored on file and completes checkout with FLS (Fraud Liability Protection).                            |
| [Scenario 6](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-6)   | Integrator successfully deletes the binding between token and consumer device.                                                          |
| [Scenario 7](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-7)   | User selects/adds a card, authenticates the transaction using a passkey and completes a checkout.                                       |
| [Scenario 8](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-8)   | User has a card issued in India and requests to enroll it.                                                                              |
| [Scenario 9](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-9)   | User successfully enrolls new card, performs ID\&V by invoking Auth UI (using B2B APIs) and creates passkey.                            |
| [Scenario 10](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-10) | User selects an existing card saved on file, performs ID\&V and creates passkey.                                                        |
| [Scenario 11](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-11) | User selects an existing card saved on file, performs 3DS payment authentication with challenge, creates passkey and performs checkout. |
| [Scenario 12](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-12) | User selects an existing card saved on file, performs transaction authentication with passkey and performs checkout.                    |
| [Scenario 13](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-13) | User successfully verifies identity with MDES ID\&V and then creates and binds Mastercard passkey using B2B APIs.                       |
| [Scenario 14](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#scenario-14) | User successfully creates Mastercard passkey and then verifies identity with MDES ID\&V followed by binding the passkey using B2B APIs. |

Note: The `srcCorrelationId` is a unique identifier that correlates a series of two or more requests to a single session of activity. Capture this parameter in your logs to identify the context, and to track each unique request during troubleshooting sessions.

## Scenario 1 {#scenario-1}

**Assumptions**

* The Integrator is onboarded with Mastercard Card Checkout Solutions - Secure Card on File program to make API calls.
* The card used to enroll is token eligible.  

**When**   
> On Integrator website, user enters valid card details with *primaryAccountNumber* , *panExpirationMonth* , *panExpirationYear* , *cardSecurityCode* , and Integrator calls the [POST /EnrollCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) .

```json
{
    "srcClientId": "ab0af732-8a85-485f-a936-be6780487130",
    "srcDpaId": "40be90eb-f345-47ce-b8c3-b4fec24829e4",
    "serviceId": "SECURE_COF_MERCHANT_OBO#SRC4M-OBO-ALL4PETS#01",
    "encryptedCard": "eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.Y0AUY84a7SWhLYspSp_pL4yIjg2fghaM0lqTj4e5P4w5YIo7fW_MxOyNMc5pAV3y1HRt8RjMTKWub3hNmsJx4NSCfR_2mxjol08KExhzdLunBCeyhMPUuNUU1HgOw4rQ7LtgB945cagjj9JxFEcNls-ahY4NusriENKQyTjPcBxcEFeW18VApz2r1j6OEMv_GF2Zxmd7KfHcbk41MVJWGts3nFDdlI3KkswC3VoMzFF03Ks5i83TtyY0zWf7NebhF-uba5PFWZUgynOsGh8MVw0lLLcAFMy80imxIY7qPLSmgUSzrOjVjirtx8H7XcVLoN-2laLxaZdw2EJAMGNQlQ.E_vjb0lu2QE8jpEM.z3BWrtMzlc2qnuYsiRS4SGVQi8ShZaA87GQLzfXUiX31tCdImhUnufQgRuB_3aNWMme9N_EavXPU8C6xPGuF0bazhLtV9qp5WznQcZOP_Mb8Fjv6idNnFQk_t3Zzg8yBTX4epvmOyBlCAupHdwR0Sv1LiTFQiqZ9vpykBaKIetLKutvUw3umTXCun8bBO_kjbKjwO2A1riylXw87sK_1yO-NpdeRmGhljkj7U1DiOSzjcj46erGbRglBDlA-1Y4e8eOB4KM5xlyVSw0ImsAupgEYR3SRfRak96EiLBU6n9iO8oA.wNFPzC624A5TVcsNzrEbUg",
    "consumer": {
        "consumerIdentity": {
            "identityType": "EXTERNAL_ACCOUNT_ID",
            "identityValue": "f0c04b97-4dcb-485d-a4f4-7ae437a2e955"
        },
      },      
    "cardSource": "CARDHOLDER"
}
```

**Then**   
> **Step 1:**
> Mastercard responds with a response code of `200` , along with `srcDigitalCardId` and `maskedCard` data.

```json
{
  "srcCorrelationId": "779165e0-1905-4edd-89fa-be46497b5044",
  "maskedCard": {
    "dateOfCardCreated": "2021-11-25T14:51:03.811Z",
    "delegatedAuthenticationModels": [
      {
        "isSupported": true,
        "modelType": "AE_TYPE_3"
      }
    ],
    "digitalCardData": {
      "artUri": "https://assets.mastercard.com/card-art/combined-image-asset/MyBank-mastercard.png",
      "coBrandedName": "My Bank",
      "descriptorName": "Bank Rewards Mastercard",
      "isCoBranded": true,
      "pendingEvents": [
        "PENDING_SCA"
      ],
      "status": "ACTIVE",
      "issuerName": "Issuing Bank",
      "longDescription": "Bank Rewards Mastercard with the super duper rewards program",
      "foregroundColor": "FF5733"
    },
    "panBin": "520473",
    "panExpirationMonth": "05",
    "panExpirationYear": "2022",
    "panLastFour": "4601",
    "paymentAccountReference": "5001EUMYTT3AESCZGUEC77KPCLETI",
    "paymentCardDescriptor": "mastercard",
    "paymentCardType": "CREDIT",
    "serviceId": "#serviceId_providedbyMastercard",
    "srcDigitalCardId": "68bf50ec-0e8b-414f-8cfc-63e9c3fb9d48",
    "tokenLastFour": "7217",
    "tokenUniqueReference": "DM4MMC0000000001cd2826c715b7475bb089b7622366ebe4",
    "tokenExpirationMonth": "10",
    "tokenExpirationYear": "2022"
  }
}
```

> **Step 2:** Integrator makes the [POST /Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) call to retrieve payload using the `srcDigitalCardId`.  

```json
{
  "assuranceData": {
    "verificationData": [
      {
        "additionalData": "DA_AUTHENTICATOR_NOT_BOUND ",
        "verificationEntity": "01",
        "verificationEvents": [
          "01",
          "02"
        ],
        "verificationMethod": "01",
        "verificationResults": "01",
        "verificationTimestamp": "2021-10-07T13:44:45.385Z",
        "verificationType": "CARDHOLDER"
      }
    ]
  },
  "dpaTransactionOptions": {
    "merchantCategoryCode": "4444",
    "merchantCountryCode": "US",
    "paymentOptions": [
      {
        "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
      }
    ],
    "srcTokenRequestData": {
      "unpredictableNumber": "fa9e0426"
    },
    "transactionAmount": {
      "transactionAmount": 100.12,
      "transactionCurrencyCode": "USD"
    },
    "threeDsInputData": {
      "browser": {
        "acceptHeader": "application/json, text/plain, */*",
        "javaEnabled": true,
        "javascriptEnabled": true,
        "ip": "192.168.0.1",
        "language": "en-US",
        "colorDepth": "24",
        "screenHeight": "864",
        "screenWidth": "1000",
        "tz": "-2",
        "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0"
      },
      "acquirer": {
        "bin": "44444",
        "merchantID": "550e8400"
      },
      "billingAddress": {
        "addressId": "96636f7f-a5f5-4fed-ad43-5baf12511e2a",
        "name": "John Doe",
        "line1": "114 5th ave",
        "line2": "Lake Street",
        "line3": "",
        "city": "NYC",
        "state": "NY",
        "countryCode": "US",
        "zip": "10011",
        "createTime": "2021-10-07T13:44:45.385Z",
        "lastUsedTime": "2021-10-07T13:44:45.385Z"
      }
    }
  },
  "serviceId": "serviceId_providedbyMastercard",
  "srcClientId": "eccbf087-f159-4d69-b31d-00bec75c0474",
  "srcCorrelationId": "779165e0-1905-4edd-89fa-be46497b5044",
  "srcDigitalCardId": "297b379a-663c-4e31-a019-b3a48701b8ae",
  "srcDpaId": "297b379a-663c-4e31-a019-b3a48701b8ae",
  "srciTransactionId": "297b379a-663c-4e31-a019-b3a48701b8ae",
  "keyFingerprintId": "nwzNuN9upxolVsr6q0I/phcnfA/ZlaJ2gmAJiogMCwM"
}
```

> **Step 3:** Mastercard responds with the encrypted payload, which contains a token and a cryptogram, which can be viewed after decrypting the payload.  

```json
{
   "srcCorrelationId": "4f339be7.f9a29aec-f6b9-40e2-8179-a9044eaabf96",
   "encryptedPayload": "eyJraWQiOiJzcmM0bU9ib000c0VuY3J5cHRpb25LZXkiLCJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.aT7SA09Qs_dyrwhVb3e9-I7XVgQA3ckuCAStDrc028QIWdbcLOEDjeDHpFsqpfRs8RKS--iwiKHIxQG4zNd6mfT226TA_A-7KC1d7YYxbWX2GAKZyIpp4D9PwoS4QQ8REsmYZtuEJLzNyGQkqqWko82Rz0agFW8yjNHzSPxrSbCqElRxfAwtc7rjMsuF1aNng4iXonk7fyubDfhUuKTve_v5c-8xNhqR3Weg3YXzMxI7WrYegcxsvI82xWyj-h-Zp9d3LXZ75qXqsmHmRWYoDL27DMYjiOTS6Lody9NkTDupP3H06WdcWEOqR3SsS6m1rRArjuFqswLzBI5jR58fEA.0lQ5tbhSRzcU6WpL.aoLbYiNbS9n0EWJtqm2oqbd1_gp_awQlNeZHwYrY_WJHxM-aAal1e4LiSIBvmlBPORrjjP8KZylVOWVy21fcBqL49KMhgAiHshe4KTFbRO_WlRWC7fukHWKcfpun-yCPOUq5q2NI-Gx9dJJiD5h18jkLlE_I496b4pEirF4I93rElEU1U__XN7-9qfovLHNBuY7RcQ2zVUHp1oAR2D0_KL6LeuTtcBIG_cnDFU7bHzUU-msmHZ5g_hfHyhsA30BYOGJV2D50MQB1yJvOWLhifZj_0MeIBuMpKZAYC3rcwt56YPH2DGuTs7uhSdQjgs6A5AHE7R31sCYYil9v2GE1Q-4tHmW79iDwmA3pCCjz7QyoAsFeZNithrdrnL005InvjNrkfQR-cNW4kNffPiet5BuVRCfiw27Soo5gOy7yf4U_QS3ElkCOw91BhweICHS-vCP9_zjquJdTm1oQGt-DQ6pG9PHAIxcYWHUVeV3FtvMt6gl8nj0m6BqmYVu-W9dqcjs8KnCNsUeNIA-Yis11_HvOIQM1vnbL0d6VCpTG-fj4d7DfRaAf_PLwX9K3jyQjLDFWofWPawZAabLM8k86omClrElpN_uhom6HodqMkvF1vmaLu7gj4J1nGLw1D0JaGwLroYvfUw.hzlGatW2lsTJJbJZOUS_Vg",
   "decryptedPayload": {
       "consumerEmailAddress": "john.doe@gmail.com",
       "consumerFirstName": "John",
       "consumerLastName": "Doe",
       "token": {
           "paymentToken": "5447XXXXXXXX1326",
           "tokenExpirationMonth": "02",
           "tokenExpirationYear": "2026",
           "paymentAccountReference": "50014JNZMLZ9KT6XASOF6JDYZXDXW"
       },
       "srcTokenResultsData": {},
       "dynamicData": {
           "dynamicDataValue": "ACZIA8FR5jZyAAEUuDyoAAADFA==",
           "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
       }
   },
   "maskedCard": {
       "srcDigitalCardId": "afb06808-8e9b-4bfa-964d-b44b689e744e",
       "panBin": "533467",
       "panLastFour": "0922",
       "tokenBinRange": "544714",
       "tokenLastFour": "1326",
       "digitalCardData": {
           "status": "ACTIVE",
           "presentationName": "Axis Bank",
           "descriptorName": "mastercard",
           "artUri": "https://assets.mastercard.com/card-art/combined-image-asset/f3299b5c-644e-4859-8f2c-e887a69e87ee.png"
       },
       "panExpirationMonth": "02",
       "panExpirationYear": "2025",
       "paymentCardType": "CREDIT",
       "serviceId": "S***************************01",
       "dateOfCardCreated": "2023-01-31T15:13:02.711Z"
   },
   "maskedConsumer": {
       "srcConsumerId": "35711898-61f4-4f33-ad4b-a41315ac33ab",
       "maskedConsumerIdentity": {
           "identityType": "EXTERNAL_ACCOUNT_ID",
           "maskedIdentityValue": "john.doe@gmail.com"
       },
       "maskedEmailAddress": "j*****v@gmail.com",
       "maskedMobileNumber": {},
       "status": "ACTIVE",
       "maskedFirstName": "J*******",
       "maskedLastName": "d****",
       "maskedFullName": "J******* D****",
       "dateConsumerAdded": "2022-11-01T15:52:02.396Z"
   },
   "assuranceData": {
       "cardVerificationEntity": "02",
       "cardVerificationMethod": "03",
       "cardVerificationResults": "23"
   }
}
```

## Scenario 2 {#scenario-2}

**Assumptions**

* The Integrator is onboarded with Mastercard Card Checkout Solutions - Secure Card on File program to make API calls.   

**When**   
> On Integrator website, user enters card details with *primaryAccountNumber* , *panExpirationMonth* , *panExpirationYear* , *cardSecurityCode* , and Integrator calls the [POST /EnrollCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) .  

**Then**   
> If the card entered is not eligible to be enrolled, Mastercard will return a response with `422` status, reason as `INVALID_STATE` and error details as `TOKENIZATION_INELIGIBLE`.  

```json
{
 "status": 400,
 "reason": "INVALID_STATE",
 "message": "Request cannot be executed due to the incorrect field value",
 "errordetail": [
   {
     "message": "Tokenization Ineligible",
     "reason": "TOKENIZATION_INELIGIBLE",
     "source": "Card",
     "sourceType": "BODY"
   }
 ]
}
```

> Refer to the [Test Cards](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/secure_card_on_file/index.md#test-cards) section to obtain cards to test this scenario.  
>
> Refer to the [Code and Formats](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/code-and-formats/index.md) section to see the various errors that can be received on calling different APIs.

## Scenario 3 {#scenario-3}

**Assumptions**

* The Integrator is onboarded with Mastercard Checkout Solutions - Secure Card on File program to make API calls.
* The card used to enroll is token eligible.   

**When**   
> On Integrator website, user enters valid card details with *primaryAccountNumber* , *panExpirationMonth* , *panExpirationYear* , *cardSecurityCode* , and Integrator calls the [POST /EnrollCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) .

**Then**   
> **Step 1:** Mastercard responds with a response code of `200`, along with `srcDigitalCardId` and `maskedCard` data.

```json
{
  "srcCorrelationId": "779165e0-1905-4edd-89fa-be46497b5044",
  "maskedCard": {
    "dateOfCardCreated": "2021-11-25T14:51:03.811Z",
    "delegatedAuthenticationModels": [
      {
        "isSupported": true,
        "modelType": "AE_TYPE_3"
      }
    ],
    "digitalCardData": {
      "artUri": "https://assets.mastercard.com/card-art/combined-image-asset/MyBank-mastercard.png",
      "coBrandedName": "My Bank",
      "descriptorName": "Bank Rewards Mastercard",
      "isCoBranded": true,
      "pendingEvents": [
        "PENDING_SCA"
      ],
      "status": "ACTIVE",
      "issuerName": "Issuing Bank",
      "longDescription": "Bank Rewards Mastercard with the super duper rewards program",
      "foregroundColor": "FF5733"
    },
    "panBin": "520473",
    "panExpirationMonth": "05",
    "panExpirationYear": "2022",
    "panLastFour": "4601",
    "paymentAccountReference": "5001EUMYTT3AESCZGUEC77KPCLETI",
    "paymentCardDescriptor": "mastercard",
    "paymentCardType": "CREDIT",
    "serviceId": "#serviceId_providedbyMastercard",
    "srcDigitalCardId": "68bf50ec-0e8b-414f-8cfc-63e9c3fb9d48",
    "tokenLastFour": "7217",
    "tokenUniqueReference": "DM4MMC0000000001cd2826c715b7475bb089b7622366ebe4",
    "tokenExpirationMonth": "10",
    "tokenExpirationYear": "2022"
  }
}
```

> **Step 2:**
> Integrator makes the [POST /Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) call to retrieve payload using an INVALID `srcDigitalCardId`.  
>
> Mastercard will return a response with `400` status, stating reason as `INVALID_ARGUMENT` and error reason as `INVALID_VALUE`.  

```json
{
  "status": 400,
  "reason": "INVALID_ARGUMENT",
  "message": "Cannot process the request because it is malformed or has incorrect/missing fields or values.",
  "errordetail": [
    {
      "reason": "INVALID_VALUE",
      "message": "The supplied value cannot be null",
      "sourceType": "BODY",
      "source": "srcDigitalCardId"
    }
  ]
}
```

> Refer to the [Code and Formats](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/code-and-formats/index.md) section to see the various errors that can be received on calling different APIs.

## Scenario 4 {#scenario-4}

**Assumptions**

* The Integrator is onboarded with Mastercard Card Checkout Solutions - Secure Card on File program to make API calls.
* The card used to enroll is token eligible.
* Test card country and issuer are configured to be eligible for TAF Integrator's certified MFA method
* Issuer country is setup as FLS eligible and required MFA has been onboarded
* Client is associated with required MFA method
* Issuer country is enabled for 3DS   

**When**   
> On Integrator's website, user enters valid card details with *primaryAccountNumber* , *panExpirationMonth* , *panExpirationYear* , *cardSecurityCode* , and Integrator calls the [POST /EnrollCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) .

```json
{
  "cardSource": "CARDHOLDER",
  "consumer": {
    "consumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "identityValue": "9003290005"
    }
  },
  "encryptedCard": "eyJraWQiOiIxNDkxMjMtc3JjLWZwYW4tZW5jcnlwdGlvbiIsImVuYyI6IkExMjhHQ00iLCJhbGciOiJSU0EtT0FFUC0yNTYifQ.t7tkgd4CLzpCpfsvF1PpcSIw17LsVtDcocx8wtcfUNqamnN4-nylI9Qm_aZcMgh3McxGHoY7gJl-DP4prUEbQrOvaSJTtV8lLIWA_i5ixPh6RPeDBDrfu8Ef0xb7rxmWZwtTS8C5U3wo0WHYu7GNigvWWhxOqr1v1fLLaKkMfPJ_I0A86BzmTjVICsaaErHthidXZnep4-VUQr0PEe7aqQS43I4CZ7Ak0N8jrlD3UqO4wKnPKPLNNxFlCMZm8KvkOzo7dWWZi2DYJ5Ea2bkp26LKZ21Rr5Mhv14uf2BoThKHRI8rKFgTQ3mxsU6vfSv2sHdZBE631IvqX-H2RIWejg.dwkXT7-xNIDI3Vut.Yf_XqDTW4y3xuj36HCXNj_7GYkOSixpM12KHWeiqV662X3ta87mseetyPIVQP0KJ3zW_GmMYuycrXuekbye7N6UcOVQBENHsINkge4iUjcJp_1imNbPlNnaGHCPdXjjyh5FFvQFoucGquCyyoAqEXOEw1KFjs2x8r5fk4goNFxr5W8XdPnGkIdbzKo3-eMUZ_YZ0pePGB3VIdez6f7cBJk_6rZoaDS9k4OJsqjCuNEFC-_7ZU6zAveYaeGGAM3eMBPFgXMUY_xyd9B4VXHyUv1oSOp3do76x3xS8fLY5AkJtkIoIjgvvEiysoIzybxyS1I2vbOy1Ox-RW_dJ2jd_yLa3EOc.PvmkAIOJdBrcPQeKdxOsEw",
  "enrolmentReferenceData": {
    "authorization": "null",
    "enrolmentReferenceId": "DM4MMC000000000BGKEJIMXUMLORTSJ2NWTCSNSQP6I4RQ659",
    "enrolmentReferenceType": "SRC_DIGITAL_CARD_ID"
  },
  "serviceId": "#serviceId_providedbyMastercard",
  "srcClientId": "eccbf087-f159-4d69-b31d-00bec75c0474",
  "srcCorrelationId": "779165e0-1905-4edd-89fa-be46497b5044",
  "srcDpaId": "f0589e4f-10f3-4e2e-bab6-d22a3de576c0_ef6399d7-98d5-46aa-a50c-bbcf7a7fa846",
  "keyFingerprintId": "nwzNuN9upxolVsr6q0I/phcnfA/ZlaJ2gmAJiogMCwM",
  "srcTokenRequestData": {
    "additionalDataRequested": [
      {
        "paymentDataType": "TOKEN_PAYMENTDATA"
      }
    ],
    "decisioningData": {
      "accountIdHash": "aWH2WSnzB17XB5AF7QHSsn2OOQ9_2BezQhfWNyTiYmRVi_BCb4OqDCvJyGInYHin",
      "accountScore": "1",
      "deviceCurrentLocation": "40.73, 73.99",
      "deviceIpAddress": "192.0.2.1",
      "deviceScore": "1",
      "mobileNumberSuffix": "1234",
      "recommendation": "APPROVED",
      "recommendationAlgorithmVersion": "01",
      "recommendationReasons": [
        "RBA"
      ]
    }
  }
}
```

**Then**   
> **Step 1:** Mastercard responds with a response code of `200`, along with `srcDigitalCardId`, `mfaEligibility` in `maskedCard` and `authenticationMethods` in `digitalCardData` .

```json
{
  "encryptedAccountData": "eyJrZXlJZCI6IjE0OTA2NC1zdGctc3JjLWZwYW4tZW5jcnlwdGlvbiIsImlhdCI6IjE2MTQ5NDM4NTYiLCJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIn0.opsLh3JnMth_9remDrhVOsz74UN6kuyMcywoBCDJLulNAuTIHh6o3XgvZqMB3r01wBNkOIOfXaYkeR3ih4zBbBgVJDcbMNFY-QpqNnAVjv1VI_Sbv7yCSMnmrPWNbzMECCLgjXLYtCPp1zQrv2BiV7jqEuZlqzy0TP4zSwdezzF2De0mxJiAsOJKBffII8zoUKY5MDsKBsW-p6PMiHBzrGWfSK9BE0bkYFjD9sM5tUT4-N1trlJZJvk6q8pjMvoxMIuAtWp3UoC0NYx1eTYDXQnZHSpJtEAWlY4xh5h6njOED6I4tuycgqZ6oblbUa9_D8lSGnoxBqCO4opieC_kRA.ON3h7ZHvvTW6Adyx.2Kca-_bgidu9r_Be846vLgFN24JkdiA_33ZKnAvvmlp8JowrO13c1c0_NxE1juto7QjGf0R6gSDzVDcGcVQKhCyFG8byPMMKj0vQmuONtOKRFFiq60TE_W0Vh9N1gXMC4bT0soRrk6Ygc2dESoAtjsfpmALXxDw.dDYSvsWTLLsF6aDWYxmUPg",
  "keyFingerprintId": "nwzNuN9upxolVsr6q0I/phcnfA/ZlaJ2gmAJiogMCwM",
  "maskedCard": {
    "dateOfCardCreated": "2021-11-25T14:51:03.811Z",
    "delegatedAuthenticationModels": [
      {
        "isSupported": true,
        "modelType": "AE_TYPE_3"
      }
    ],
    "digitalCardData": {
      "artUri": "https://assets.mastercard.com/card-art/combined-image-asset/MyBank-mastercard.png",
      "coBrandedName": "My Bank",
      "descriptorName": "Bank Rewards Mastercard",
      "isCoBranded": true,
      "pendingEvents": [
        "PENDING_SCA"
      ],
      "status": "ACTIVE",
      "issuerName": "Issuing Bank",
      "longDescription": "Bank Rewards Mastercard with the super duper rewards program",
      "foregroundColor": "FF5733",
      "authenticationMethods": [
        {
          "authenticationMethodType": "3DS",
          "authenticationSubject": "CARDHOLDER",
          "uriData": {
            "uri": "https://sandbox.mastercard.com/"
          }
        }
      ]
    },
    "panBin": "520473",
    "panExpirationMonth": "05",
    "panExpirationYear": "2022",
    "panLastFour": "4601",
    "paymentAccountReference": "5001EUMYTT3AESCZGUEC77KPCLETI",
    "paymentCardDescriptor": "mastercard",
    "paymentCardType": "CREDIT",
    "serviceId": "#serviceId_providedbyMastercard",
    "srcDigitalCardId": "68bf50ec-0e8b-414f-8cfc-63e9c3fb9d48",
    "tokenLastFour": "7217",
    "tokenUniqueReference": "DM4MMC0000000001cd2826c715b7475bb089b7622366ebe4",
    "tokenExpirationMonth": "10",
    "tokenExpirationYear": "2022",
    "mfaEligibility": [
      {
        "authenticatingEntityId": "A3001",
        "certifiedMfaMethodId": "43SA5",
        "isMultiFactorAuthenticationSupported": true,
        "isLiabilityShiftEligible": true
      }
    ]
  },
  "maskedConsumer": {
    "dateConsumerAdded": "2021-11-25T14:51:03.811Z",
    "maskedConsumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "maskedIdentityValue": "90032****"
    }
  },
  "srcCorrelationId": "779165e0-1905-4edd-89fa-be46497b5044",
  "encryptedPaymentData": "eyJ0eXBlIjoiSldUIiwiYWxnIjoiUlMyNTYiLCJraWQiOiI4NTIxNDY4OCJ9.eyJzdWIiOiI1OTY3OGJmNS00ODcxLTQ5M2MtOWUwYi0"
}
```

> **Step 2:** Integrator calls the [authenticate()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/index.md) method.  

```json
{
    "authenticationContext": {
        "srciDpaId": "13435294-fa4e-4acb-8fe6-05ab66b08881_dpa3",
        "dpaTransactionOptions": {
            "transactionAmount": {
                "transactionAmount": 31.24,
                "transactionCurrencyCode": "USD"
            }
        },
        "authenticationReasons": [
            "ENROL_FINANCIAL_INSTRUMENT"
        ]
    },
    "authenticationMethod": {
        "authenticationMethodType": "3DS",
        "authenticationSubject": "CARDHOLDER",
        "uriData": {
            "uri": "https://stage.src.mastercard.com/auth",
            "uriType": "WEB_URI"
        }
    },
    "srcCorrelationId": "7e5ef390-f9d6-459d-9bed-95b4cccbbc79",
    "accountReference": {
        "srcDigitalCardId": "b540f19e-573d-4c78-b796-d84775be4166"
    },
    "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
    "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881"
}
```

> **Step 3:**   
>
> Mastercard invokes the [Authentication UI](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md) and presents the user challenge. After authentication is completed, Mastercard responds back with authentication result and status.  

```json
{
  "assuranceData": {
    "verificationData": [
        {
            "verificationType": "CARDHOLDER",
            "verificationEntity": "03",
            "verificationMethod": "01",
            "verificationResults": "01",
            "verificationTimestamp": "2023-04-20T17:02:08.944Z",
            "verificationEvents": [
                "02"
              ],
            "additionalData": "eyJraWQiOiIyMDIzMDEyNjExNDM0NS1zdGctbWMtbmV3LWlkZW50aXR5LXZlcmlmaWNhdGlvbi1zcmMtbWFzdGVyY2FyZC1pbnQiLCJ0eXAiOiJKV1QrZXh0LmNhcmRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJjYXJkSWQiOiJiNTQwZjE5ZS01NzNkLTRjNzgtYjc5Ni1kODQ3NzViZTQxNjYiLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJjb3JyZWxhdGlvbklkIjoiN2U1ZWYzOTAtZjlkNi00NTlkLTliZWQtOTViNGNjY2JiYzc5Iiwic2NvcGVEYXRhIjoie1wiYXV0aFNlc3Npb25JZFwiOlwiMTRkYTMwMWYtM2Y4Zi00ZGZjLWI4NTYtZDIxNGI1MDFhNjlhXCIsXCJhdXRoZW50aWNhdGlvblJlc3VsdFwiOlwiQVVUSEVOVElDQVRFRFwiLFwiYXV0aGVudGljYXRpb25NZXRob2RcIjpcIjNEU1wiLFwidGhyZWVEc1BBVmVyaWZpZWRcIjpcInRydWVcIixcImF1dGhlbnRpY2F0aW9uVGltZVwiOlwiMjAyMy0wNC0yMFQxNzowMjowOC45NDRaXCIsXCJzcmNDbGllbnRJZFwiOlwiMTM0MzUyOTQtZmE0ZS00YWNiLThmZTYtMDVhYjY2YjA4ODgxXCJ9Iiwic2NvcGVzIjpbIlRPS0VOX0JJTkQiXSwiZXhwIjoxNjgyMDEwNDI4LCJpYXQiOjE2ODIwMTAxMjgsImp0aSI6ImI0YTk5ZDA4LWRmZTktNGI1My1iOWQ3LThkMTRjNzdhZGIwNyJ9.DK1vFyW5vkWXW6up5hopUl7RavFewYnIHBFM9hmG3_U4NI3QsirZoOx2UkNn5AuEzJmx6h9QUvwqnxE0nlrUzI16ISWV9EiNPij3qRs-aexw3EQ4WJXZTr2I6cjAtf4GdQMod41NqbChQqShrU6hT3AF78_G7mkvPqBZ8gawi0C2RxXf8PZsEpd43SVm90WOk6G3TPPzuu0EDxMCdOMUaGWWEczRK3TugJh-fzuBO5tRxQTZkG5DsxzbvbLD1JQFdN607uDS0LC9954t2-aYiicAsnge7ujzPiAIjtdtKNo3h8DIdwp9Ci9eanUGuAMOtldOnGQKSNBt9a8Kc0kbjg"
        }
      ]
    },
    "authenticationStatus": "COMPLETE",
    "authenticationResult": "AUTHENTICATED",
    "srcCorrelationId": "7e5ef390-f9d6-459d-9bed-95b4cccbbc79"
}
```

> **Step 4:**   
>
> After successful authentication, consumer is redirected back to Integrator's site. Integrator can register consumer to MFA method and bind MFA with the consumer profile. Further, Integrator can request Mastercard to [bind](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) MFA ID with the consumer device by providing the proof of authentication.  

```json
{
  "srcClientId": "eccbf087-f159-4d69-b31d-00bec75c0474",
  "srcCorrelationId": "43d4c8e5-b57e-4794-ac9b-6a454c9325cb",
  "serviceId": "#serviceId_providedbyMastercard",
  "srcDigitalCardId": "51a977f3-bda4-498b-901d-b48ad4d97abv",
  "mfaMethod": {
    "type": "PROPRIETARY",
    "certifiedMfaMethodId": "43SA5",
    "externalMfaMethodInstanceId": "bf8c5b2b-28ce-48d8-acbc-cc82f51478c6",
    "mfaMethodInstanceId": "pd295b2b-66ce-48d8-acbc-cc82f51479d8"
  },
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "01",
        "verificationResults": "02",
        "verificationTimestamp": "1678294563",
        "verificationEvents": "04",
        "additionalData": "ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldNdGJtVjNMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgwTG1OaGNtUmZkRzlyWlc0aUxDSmhiR2NpT2lKU1V6STFOaUo5LmV5SmhkV1FpT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKallYSmtTV1FpT2lKaU1HSTFOMkUwWkMweVpUTTNMVFEyWkdNdE9UaG1NaTAyT1RZeU0yRmtaRFl4T1dJaUxDSnBjM01pT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKamIzSnlaV3hoZEdsdmJrbGtJam9pWmpjek56RTRNMkl0WlRaa1lpMDBOVGc0TFdFMlpUa3RNV0UyTVdNM056VTNNekkySWl3aWMyTnZjR1ZFWVhSaElqb2llMXdpWVhWMGFGTmxjM05wYjI1SlpGd2lPbHdpT1RJNU5qVm1aVFV0TmpjNFppMDBZbUZrTFdGaVptUXRPVFF4T0dSa01UaGpPV1ExWENJc1hDSmhkWFJvWlc1MGFXTmhkR2x2YmxKbGMzVnNkRndpT2x3aVFWVlVTRVZPVkVsRFFWUkZSRndpTEZ3aVlYVjBhR1Z1ZEdsallYUnBiMjVOWlhSb2IyUmNJanBjSWpORVUxd2lMRndpZEdoeVpXVkVjMUJCVm1WeWFXWnBaV1JjSWpwY0luUnlkV1ZjSWl4Y0ltRjFkR2hsYm5ScFkyRjBhVzl1VkdsdFpWd2lPbHdpTWpBeU15MHdOaTB5TjFReU1Eb3dNem95TlM0M05qbGFYQ0lzWENKemNtTkRiR2xsYm5SSlpGd2lPbHdpTldFNVpqaGpOVEV0TjJGa01TMDBNR00yTFdJNE1qZ3RZamMwTXpkaU9UTXpOR1kyWENKOUlpd2ljMk52Y0dWeklqcGJJbFJQUzBWT1gwSkpUa1FpWFN3aVpYaHdJam94TmpnM09EazJOVEExTENKcFlYUWlPakUyT0RjNE9UWXlNRFVzSW1wMGFTSTZJakpqTW1FeFkyWmlMV1k0WlRZdE5ERXhaUzA1TnpGakxUSTVNbUkzWXpGa09XVTFZaUo5LkFLVzJqMVM4YlNkZU9ZMjRpZTdEZUE1Q1dMdWVkUUV4NWtiaGh1QmhXZUFwWEttREdpZm00WkpNb1N3Q2dkbGhaSGNpXzFEekRhaDNsTmYwVmEydmpRV084cnpUbS1senExNmJ1MFpDeU91QjI4S0dBUEVxSUc4SW5RQ3VXZ0ZQaTFyal80QmxLUXR5a0N4U1FDLUFEa3V2WUVpRHEzMnZQZDE2LXZEWHQ3Vnk4N0psRVlsR0U5SFJvV1BoZHduSkZqZ2FOWmdtTERvUDVFdG14MWdPeG9INFFoXzlzeV9iRVhxYkg5UmNoeHRacEc5dGVKQXRTdmVFX2hGSUtQdmNVSlU1enVqc2lkRUFIeDRqTWM3NFU1X2c4OG1GQnlGcmVXeUk5YngzdExTalNoaHAweDNtNHVJNFlTTFBmMGltNzY2cnpUcUpORFRRVlQ4NGNhYXpqUQ=="
      }
    ]
  },
  "bindingAssertionJWT": "eyJ0eXAiOiJKV1QrZXh0LmJpbmRpbmdfYXNzZXJ0aW9uX3Rva2VuIiwiYWxnIjoiUlMyNTYifQ.eyJhdWQiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzdWIiOiJ0ZXN0Snd0U3ViamVjdCIsImV4dGVybmFsTWZhTWV0aG9kSW5zdGFuY2VJZCI6IjE1ZGM2Zjk0LTk0MWUtNDk3ZC1iOTUyLTEyYmIzNjllMDE1MCIsImlzcyI6Imh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsIm1mYU1ldGhvZENvbnNlbnRBdCI6IjE2ODc4OTYyNTg4MjEiLCJjZXJ0aWZpZWRNZmFNZXRob2RJZCI6IjUxYjA2YTMxLTQ2ZmUtNGI3Ni1iNzNjLTRlMmQzYTkyY2UzZCIsImV4cCI6MTY4Nzg5NzE1OCwiaWF0IjoxNjg3ODk2MjU4LCJqdGkiOiJmZjU3M2JkNS0wMzU3LTRjMjItYmU1Zi0wM2RkOTEwMmY3YWMifQ.KFAfUG62XeKQCC6Ax89jAXCPVl-ETa6ZvyVhu4eQf64fTAdAmHS0yjSA92QP285dLAs1Q9lyNym9eoaZDByvwQSIEhym6deu0bltLYe1we9Owd7ssoRdoFaYR3T59Ma5dPlC-POmy_-SCA8YX_6aKJn3ZUVI1cVystpPMLAtDfL0OHVwFkgkWj7HtxgtSImDL8bueYsxo-0d38VTfJ5tIvVzB6V8J-uNdhtNU6Mxywl8eKtO0pSl00bibM2JHbTYTaq6_o2FhvE5GHVl_PiJYhDRMyKuZDimwIBMi3UXIuzqCFgeFJL3h6XAhmOG0eFQW99QmaLVzU6Gj4CuCWYQfA"
}
```

> On successful bind, Mastercard responds back with `mfaMethodInstanceId`, `externalMfaMethodInstanceId`. `mfaMethodInstanceId` can be used in subsequent binding with same device for different card.
>
```json
{
  "MASTERCARD": {
      "body": {
        "srcCorrelationId": "7e5ef390-f9d6-459d-9bed-95b4cccbbc79",
        "externalMfaMethodInstanceId": "814ceb83-811f-4bfa-b4df-7cbd58a52ca3",
        "mfaMethodInstanceId": "d539d12d-dfd0-425d-a462-939f3f7920ec"
        },
      "headers": {
        "X-SRC-CX-FLOW-ID": "34f4a04b.497f1c48-0430-401e-8544-21eaee925968.1682011103"
        }
    }
}
```

> **Step 5:**   
>
> After successful binding, Integrator can request to [checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) with proof of MFA binding and authentication to obtain fraud liability protection.  

```json
{
    "body": {
  "assuranceData": {
    "verificationData": [
      {
        "additionalData": "eyJ0eXBlIjoiUFJPUFJJRVRBUlkiLCJjZXJ0aWZpZWRNZmFNZXRob2RJZCI6IjQzU0E1IiwiZXh0ZXJuYWxNZmFNZXRob2RJbnN0YW5jZUlkIjoiYmY4YzViMmItMjhjZS00OGQ4LWFjYmMtY2M4MmY1MTQ3OGM2IiwibWZhTWV0aG9kSW5zdGFuY2VJZCI6InBkMjk1YjJiLTY2Y2UtNDhkOC1hY2JjLWNjODJmNTE0NzlkOCIsImFzc2VydGlvbiI6ImV5SjBlWEFpT2lKS1YxUXJaWGgwTG1GemMyVnlkR2x2Ymw5MGIydGxiaUlzSW1Gc1p5STZJbEpUTWpVMkluMC5ld29nSUNKemRXSWlPaUFpWm1GbU5qZGtZVFV0Wm1Ga1pTMDBaR1JpTFdFeFlUVXRZVFEwTlRNd01UVTRZams0SWl3S0lDQWlZWFYwYUdWdWRHbGpZWFJwYjI1U1pYTjFiSFFpT2lBaU1ERWlMQW9nSUNKamIyMXdiR1YwWldSQmRDSTZJREUyT0RNd01EWTRNak1zQ2lBZ0ltTmxjblJwWm1sbFpFMUdRVTFsZEdodlpFbGtJam9nSWpRelUwRTFJaXdLSUNBaWFYTnpJam9nSW1oMGRIQnpPaTh2YldGemRHVnlZMkZ5WkM1amIyMGlMQW9nSUNKdFpYSmphR0Z1ZEU1aGJXVWlPaUFpYldWeVkyaGhiblJPWVcxbElpd0tJQ0FpWVhWa0lqb2dJbWgwZEhCek9pOHZiV0Z6ZEdWeVkyRnlaQzVqYjIwaUxBb2dJQ0poZFhSb1pXNTBhV05oZEdsdmJrMWxkR2h2WkNJNklDSXdOaUlzQ2lBZ0ltRjFkR2hsYm5ScFkyRjBhVzl1Um1GamRHOXljeUk2SUNJd01UQTFJaXdLSUNBaWRISmhibk5oWTNScGIyNUJiVzkxYm5RaU9pQWlNVEF1TURjaUxBb2dJQ0p6Y21ORWFXZHBkR0ZzUTJGeVpFbGtJam9nSW1JM1lUWmlOV1JqTFRrek5XTXROREkxWVMwNFpXSXdMV1JrWXpreE1HUmtZamswWVNJc0NpQWdJbVY0Y0NJNklERTJPRE13TURjM01qTXNDaUFnSW0xbVlVMWxkR2h2WkVsdWMzUmhibU5sU1dRaU9pQWljR1F5T1RWaU1tSXROalpqWlMwME9HUTRMV0ZqWW1NdFkyTTRNbVkxTVRRM09XUTRJaXdLSUNBaWFXRjBJam9nTVRZNE16QXdOamd5TXl3S0lDQWlhblJwSWpvZ0ltRmpZelJtWldZeUxXVTJNV1F0TkdaaU1pMWhZV1kxTFRNMk1tRXpZVEptT0dVeU9TSXNDaUFnSW1GMWRHaGxiblJwWTJGMGFXOXVVbVZoYzI5dWN5STZJRnNLSUNBZ0lDSlVVa0ZPVTBGRFZFbFBUbDlCVlZSSVJVNVVTVU5CVkVsUFRpSUtJQ0JkQ24wLjR5ZDVFMzltVTVFSFJMdXhWYUk2cjhMNmpzZ0pnb1RuZE1GalJ5NXNHdUkifQ== ",
        "verificationEntity": "01",
        "verificationEvents": [
          "01",
          "02"
        ],
        "verificationMethod": "01",
        "verificationResults": "01",
        "verificationTimestamp": "2021-10-07T13:44:45.385Z",
        "verificationType": "CARDHOLDER"
      }
    ]
  },
  "dpaData": {
    "dpaName": "Mastercard",
    "dpaPresentationName": "Mastercard Inc",
    "dpaUri": "www.mastercard.com"
  },
  "dpaTransactionOptions": {
    "merchantCategoryCode": "4444",
    "merchantCountryCode": "US",
    "paymentOptions": [
      {
        "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
      }
    ],
    "srcTokenRequestData": {
      "unpredictableNumber": "fa9e0426"
    },
    "transactionAmount": {
      "transactionAmount": 100.12,
      "transactionCurrencyCode": "USD"
    },
    "threeDsInputData": {
      "browser": {
        "acceptHeader": "application/json, text/plain, */*",
        "javaEnabled": true,
        "javascriptEnabled": true,
        "ip": "192.168.0.1",
        "language": "en-US",
        "colorDepth": "24",
        "screenHeight": "864",
        "screenWidth": "1000",
        "tz": "-2",
        "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0"
      },
      "acquirer": {
        "bin": "545301",
        "merchantID": "SRC3DS"
      },
      "billingAddress": {
        "addressId": "96636f7f-a5f5-4fed-ad43-5baf12511e2a",
        "name": "John Doe",
        "line1": "114 5th ave",
        "line2": "Lake Street",
        "line3": "",
        "city": "NYC",
        "state": "NY",
        "countryCode": "US",
        "zip": "10011",
        "createTime": "2021-10-07T13:44:45.385Z",
        "lastUsedTime": "2021-10-07T13:44:45.385Z"
      }
    }
  },
  "serviceId": "serviceId_providedbyMastercard",
  "srcClientId": "eccbf087-f159-4d69-b31d-00bec75c0474",
  "srcCorrelationId": "779165e0-1905-4edd-89fa-be46497b5044",
  "srcDigitalCardId": "61XJzB_BQ9qa29nGa7JZrQ000000000000US",
  "srcDpaId": "297b379a-663c-4e31-a019-b3a48701b8ae",
  "srciTransactionId": "297b379a-663c-4e31-a019-b3a48701b8ae",
  "keyFingerprintId": "nwzNuN9upxolVsr6q0I/phcnfA/ZlaJ2gmAJiogMCwM",
  "digitalAccountCredentials": {
    "digitalAccountReference": {
      "digitalAccountReferenceValue": "eyJraWQiOiIxNDkwNjQtc3RnLXNyYy1mcGFuLWVuY3J5cHRpb24iLCJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.iLovKOMnT11BKASjmkvqR5d_ApojucBiG9tAuH5Qt2hRAu31-oUiEiGC5ctJ2s2OM7UUSlnuB7DHqFxhCTSbUsQ0cyUTLQ4lR9-t1c4KamR-UDbreoGgDRjC7ZLhFOIrLBXaW9eMHJKT9BoqwlyfQVM_5LkQVDzjA5zMIrgpg8VcsXmDeTGeS63ee7Ibhpk7S5jqD856xgRERMuerh0iI1sLqVhDkF5Ququ46cIAt7OstgybWLTXyEoSHWQt_qGoaDDD2Coa4ESOUNAuViMK1JSRK3zG9CtNtnnlhjqU1smMDTCfW02ajZsBDRldv3OmJF3rr0M2zUEPMF03xfG9lQ.4ktI6_pukbVgiUmp.v30MLJGPf_GMD2ubjyf05TWI15FmC7vsVNdBRrsqMGev8N0dcANZqJkYNBvM0JwLMfQdIIJUNcFBNGsobDvRMaQSxK35EwQ-lyvTlpArP90pSq9q9oJRNJ9YSvsxI9UML-MppQC89Ck7vnjef-Df1Vo7AuGmD_2POE0LaRyh6KS4Jbk0pFt4qJnAcFPxXwB0K0ODOXrq3PaxUfKUt-gVcpN5iYWJcoJivUisbpEtDb5Asa4nQTMdEuxcynMslDB4FTn6Z0OrwnU1PJxVvjegQBWMjqcCVcSWHB6Fp8KyJdIKtdG63Ui5kNeRjXgGnl2uPd97_Q_1yEWzce21hvDnfZexKkbYn43tTtC3QdWbCj8nq41wzZR-w0541Z_3qrgPGf4cUU9sv_wPun6iEvVbn4lYNqBbRKtpWhY8oE6pgCU.KB4ME3pTkX3vt4L7cwdK9w",
      "digitalAccountReferenceType": "SRC_DIGITAL_CARD_ID"
    }
  }
},
    "headers": {
        "X-SRC-CX-FLOW-ID": "34f4a04b.7602af12-a18b-4023-a476-8231ddcaefe7.1621276711"
    }
}
```

> Mastercard sends back the response with ECI indicator 06 (Liability shift) and Verification result = 01( Verified) in encrypted payload, which can be viewed after decrypting the payload.
>
```json
{
  "checkoutResponseJWS": {
    "jose_header": {
      "alg": "RS256",
      "iat": "1311280970",
      "iss": "http://server.example.com",
      "jti": "06128d89fda9a0b037bad91e2b1b17da",
      "kid": "1e9gdk"
    },
    "jws_payload": {
      "assuranceData": {
        "verificationData": [
          {
            "additionalData": "eyJ0eXBlIjoiUFJPUFJJRVRBUlkiLCJjZXJ0aWZpZWRNZmFNZXRob2RJZCI6IjQzU0E1IiwiZXh0ZXJuYWxNZmFNZXRob2RJbnN0YW5jZUlkIjoiYmY4YzViMmItMjhjZS00OGQ4LWFjYmMtY2M4MmY1MTQ3OGM2IiwibWZhTWV0aG9kSW5zdGFuY2VJZCI6InBkMjk1YjJiLTY2Y2UtNDhkOC1hY2JjLWNjODJmNTE0NzlkOCIsImFzc2VydGlvbiI6ImV5SjBlWEFpT2lKS1YxUXJaWGgwTG1GemMyVnlkR2x2Ymw5MGIydGxiaUlzSW1Gc1p5STZJbEpUTWpVMkluMC5ld29nSUNKemRXSWlPaUFpWm1GbU5qZGtZVFV0Wm1Ga1pTMDBaR1JpTFdFeFlUVXRZVFEwTlRNd01UVTRZams0SWl3S0lDQWlZWFYwYUdWdWRHbGpZWFJwYjI1U1pYTjFiSFFpT2lBaU1ERWlMQW9nSUNKamIyMXdiR1YwWldSQmRDSTZJREUyT0RNd01EWTRNak1zQ2lBZ0ltTmxjblJwWm1sbFpFMUdRVTFsZEdodlpFbGtJam9nSWpRelUwRTFJaXdLSUNBaWFYTnpJam9nSW1oMGRIQnpPaTh2YldGemRHVnlZMkZ5WkM1amIyMGlMQW9nSUNKdFpYSmphR0Z1ZEU1aGJXVWlPaUFpYldWeVkyaGhiblJPWVcxbElpd0tJQ0FpWVhWa0lqb2dJbWgwZEhCek9pOHZiV0Z6ZEdWeVkyRnlaQzVqYjIwaUxBb2dJQ0poZFhSb1pXNTBhV05oZEdsdmJrMWxkR2h2WkNJNklDSXdOaUlzQ2lBZ0ltRjFkR2hsYm5ScFkyRjBhVzl1Um1GamRHOXljeUk2SUNJd01UQTFJaXdLSUNBaWRISmhibk5oWTNScGIyNUJiVzkxYm5RaU9pQWlNVEF1TURjaUxBb2dJQ0p6Y21ORWFXZHBkR0ZzUTJGeVpFbGtJam9nSW1JM1lUWmlOV1JqTFRrek5XTXROREkxWVMwNFpXSXdMV1JrWXpreE1HUmtZamswWVNJc0NpQWdJbVY0Y0NJNklERTJPRE13TURjM01qTXNDaUFnSW0xbVlVMWxkR2h2WkVsdWMzUmhibU5sU1dRaU9pQWljR1F5T1RWaU1tSXROalpqWlMwME9HUTRMV0ZqWW1NdFkyTTRNbVkxTVRRM09XUTRJaXdLSUNBaWFXRjBJam9nTVRZNE16QXdOamd5TXl3S0lDQWlhblJwSWpvZ0ltRmpZelJtWldZeUxXVTJNV1F0TkdaaU1pMWhZV1kxTFRNMk1tRXpZVEptT0dVeU9TSXNDaUFnSW1GMWRHaGxiblJwWTJGMGFXOXVVbVZoYzI5dWN5STZJRnNLSUNBZ0lDSlVVa0ZPVTBGRFZFbFBUbDlCVlZSSVJVNVVTVU5CVkVsUFRpSUtJQ0JkQ24wLjR5ZDVFMzltVTVFSFJMdXhWYUk2cjhMNmpzZ0pnb1RuZE1GalJ5NXNHdUkifQ== ",
            "verificationEntity": "01",
            "verificationEvents": [
              "01",
              "02"
            ],
            "verificationMethod": "01",
            "verificationResults": "01",
            "verificationTimestamp": "2021-10-07T13:44:45.385Z",
            "verificationType": "CARDHOLDER"
          }
        ]
      },
      "eci": "06",
      "encryptedPayload": {
        "dynamicData": {
          "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM",
          "dynamicDataValue": "jjoutwsdgfdou124354ljlsdhgout968957"
        },
        "srcTokenResultsData": {
          "unpredictableNumber": "fa9e0426"
        },
        "token": {
          "paymentAccountReference": "5001EUMYTT3AESCZGUEC77KPCLETI",
          "paymentToken": "5299920000000149",
          "tokenExpirationMonth": "10",
          "tokenExpirationYear": "2022",
          "panSequenceNumber": "01"
        }
      },
      "maskedCard": {
        "digitalCardData": {
          "artUri": "https://sandbox.assets.mastercard.com/card-art/combined-image-asset/MyBank-mastercard.png",
          "coBrandedName": "Citi",
          "descriptorName": "mastercard",
          "presentationName": "Citi Bank",
          "status": "ACTIVE",
          "issuerName": "Issuing Bank",
          "longDescription": "Bank Rewards Mastercard with the super duper rewards program",
          "foregroundColor": "FF5733"
        },
        "panBin": "520473",
        "panExpirationMonth": "05",
        "panExpirationYear": "2022",
        "panLastFour": "4601",
        "paymentAccountReference": "5001EUMYTT3AESCZGUEC77KPCLETI",
        "paymentCardDescriptor": "mastercard",
        "paymentCardType": "CREDIT",
        "serviceId": "#serviceId_providedbyMastercard",
        "srcDigitalCardId": "61XJzB_BQ9qa29nGa7JZrQ000000000000US",
        "tokenLastFour": "7217",
        "tokenUniqueReference": "DM4MMC0000000001cd2826c715b7475bb089b7622366ebe4"
      },
      "srcCorrelationId": "5759a64f-df84-4f0b-b105-67d5a8349bba",
      "srciTransactionId": "a5899431-5364-4682-be3d-aba123465a1b",
      "keyFingerprintId": "nwzNuN9upxolVsr6q0I/phcnfA/ZlaJ2gmAJiogMCwM"
    },
    "jws_signature": "eyJraWiOiIxNDkwNjQtc3RnLXNyYy1mcGFuLWVuY3J5ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦."
  }
}
```

## Scenario 5 {#scenario-5}

**Assumptions**

* The Integrator is onboarded with Mastercard Card Checkout Solutions - Secure Card on File program to make API calls.
* The card used to enroll is token eligible.
* Test card country and issuer are configured to be eligible for TAF Integrator's certified MFA method
* Issuer country is setup as FLS eligible and required MFA has been onboarded
* Client is associated with required MFA method
* Issuer country is enabled for 3DS   

**When**   
> On Integrator's website, user logs into the account and chooses a card for checkout. Integrator calls the [GET /cards/{cardId}](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) API to fetch the card details.

**Then**   
> **Step 1:**   
>
> Mastercard responds with a response code of `200`, along with card details including `mfaEligibility` in `maskedCard` and `authenticationMethods` in `digitalCardData` .

```json
{
  "encryptedPaymentData": {
    "paymentToken": {
      "paymentAccountReference": "5001EUMYTT3AESCZGUEC77KPCLETI",
      "paymentToken": "5972374364093457",
      "tokenExpirationMonth": "05",
      "tokenExpirationYear": "2022"
    }
  },
  "maskedCard": {
    "dateOfCardCreated": "2021-11-25T14:51:03.811Z",
    "delegatedAuthenticationModels": [
      {
        "isSupported": true,
        "modelType": "AE_TYPE_3"
      }
    ],
    "digitalCardData": {
      "artUri": "https://assets.mastercard.com/card-art/combined-image-asset/MyBank-mastercard.png",
      "coBrandedName": "My Bank",
      "descriptorName": "Bank Rewards Mastercard",
      "isCoBranded": true,
      "pendingEvents": [
        "PENDING_SCA"
      ],
      "status": "ACTIVE",
      "issuerName": "Issuing Bank",
      "longDescription": "Bank Rewards Mastercard with the super duper rewards program",
      "foregroundColor": "FF5733",
      "authenticationMethods": [
        {
          "authenticationMethodType": "3DS",
          "authenticationSubject": "CARDHOLDER",
          "uriData": {
            "uri": "https://sandbox.mastercard.com/"
          }
        }
      ]
    },
    "panBin": "520473",
    "panExpirationMonth": "05",
    "panExpirationYear": "2022",
    "panLastFour": "4601",
    "paymentAccountReference": "5001EUMYTT3AESCZGUEC77KPCLETI",
    "paymentCardDescriptor": "mastercard",
    "paymentCardType": "CREDIT",
    "serviceId": "#serviceId_providedbyMastercard",
    "srcDigitalCardId": "68bf50ec-0e8b-414f-8cfc-63e9c3fb9d48",
    "tokenLastFour": "7217",
    "tokenUniqueReference": "DM4MMC0000000001cd2826c715b7475bb089b7622366ebe4",
    "tokenExpirationMonth": "10",
    "tokenExpirationYear": "2022",
    "mfaEligibility": [
      {
        "authenticatingEntityId": "A3001",
        "certifiedMfaMethodId": "43SA5",
        "isMultiFactorAuthenticationSupported": true,
        "isLiabilityShiftEligible": true
      }
    ]
  },
  "maskedConsumer": {
    "dateConsumerAdded": "2021-11-25T14:51:03.811Z",
    "maskedConsumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "maskedIdentityValue": "90032****"
    }
  },
  "srcCorrelationId": "779165e0-1905-4edd-89fa-be46497b5044",
  "keyFingerprintId": "nwzNuN9upxolVsr6q0I/phcnfA/ZlaJ2gmAJiogMCwM"
}
```

> **Step 2:**   
>
> Integrator calls the [authenticate()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/index.md) method.  

```json
{
    "authenticationContext": {
        "srciDpaId": "13435294-fa4e-4acb-8fe6-05ab66b08881_dpa3",
        "dpaTransactionOptions": {
            "transactionAmount": {
                "transactionAmount": 31.24,
                "transactionCurrencyCode": "USD"
            }
        },
        "authenticationReasons": [
            "ENROL_FINANCIAL_INSTRUMENT"
        ]
    },
    "authenticationMethod": {
        "authenticationMethodType": "3DS",
        "authenticationSubject": "CARDHOLDER",
        "uriData": {
            "uri": "https://stage.src.mastercard.com/auth",
            "uriType": "WEB_URI"
        }
    },
    "srcCorrelationId": "7e5ef390-f9d6-459d-9bed-95b4cccbbc79",
    "accountReference": {
        "srcDigitalCardId": "b540f19e-573d-4c78-b796-d84775be4166"
    },
    "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
    "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881"
}
```

> **Step 3:**   
>
> Mastercard invokes the [Authentication UI](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md) and presents the user challenge.   
>
> User cancels the challenge.   
>
> Authentication is not completed and Mastercard responds back with authentication result and status.  

```json
{
  "authenticationStatus": "CANCELLED",
  "authenticationResult": "NOT_AUTHENTICATED",
  "srcCorrelationId": "6cb05dac-72ee-43a6-802d-3444354488bf",
  "srciTransactionId" : "3e73a481-d79c-4cb1-b648-52b70469e63a"
}
```

## Scenario 6 {#scenario-6}

**Assumptions**

* The Integrator is onboarded with Mastercard Card Checkout Solutions - Secure Card on File program to make API calls.
* The card used to enroll is token eligible.
* Test card country and issuer are configured to be eligible for TAF Integrator's certified MFA method.
* Issuer country is setup as FLS eligible and required MFA has been onboarded.
* Client is associated with required MFA method.
* Issuer country is enabled for 3DS.
* MFA is bound for the card.   

**When**   
> A consumer wants to delete the binding of MFA from the device, so the Integrator calls [Unbind MFA Method](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) API.

```json
{
  "mfaIdType" : "INTERNAL",
  "srcClientId": "51a977f3-bda4-498b-901d-b48ad4d97abv",
  "externalMfaMethodInstanceId" : "18df482e-31f2-4289-b0d7-4d768b72d3ed" ,
  "mfaMethodInstanceId": "18df482e-31f2-4289-b0d7-4d768b72d3ed"
}
```

**Then**   
> Mastercard responds with a response code of `200`.

```json
{
  "srcCorrelationId": "43d4c8e5-b57e-4794-ac9b-6a454c9325cb",
  "externalMfaMethodInstanceId": "2f4f9ca1-62da-4ec7-bf09-05f3e5c7d3a9",
  "mfaMethodInstanceId": "232a1862-0bb4-4df9-a0ef-f8bb9f07b904"
}
```

## Scenario 7 {#scenario-7}

**Assumptions**

* The Integrator is onboarded with Mastercard Card Checkout Solutions - Secure Card on File program to make API calls.
* The card used to enroll is token eligible.
* The Integrator, card, device, and browser used for transaction are configured to support Mastercard Passkeys.
* Issuer country is setup as FLS eligible.
* Test card country and Issuer are configured to be eligible for TAF Integrator's certified MFA method.
* Issuer country is enabled for 3DS.
* Issuer has not opted out of Passkeys.   

**When**   
> On Integrator's website, user enters valid card details with *primaryAccountNumber* , *panExpirationMonth* , *panExpirationYear* , *cardSecurityCode* , and Integrator calls the [POST /EnrollCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) .

```json
{
    "srcClientId": "ab0af732-8a85-485f-a936-be6780487130",
    "srcDpaId": "40be90eb-f345-47ce-b8c3-b4fec24829e4",
    "serviceId": "SECURE_COF_MERCHANT_OBO#SRC4M-OBO-ALL4PETS#01",
    "encryptedCard": "eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.Y0AUY84a7SWhLYspSp_pL4yIjg2fghaM0lqTj4e5P4w5YIo7fW_MxOyNMc5pAV3y1HRt8RjMTKWub3hNmsJx4NSCfR_2mxjol08KExhzdLunBCeyhMPUuNUU1HgOw4rQ7LtgB945cagjj9JxFEcNls-ahY4NusriENKQyTjPcBxcEFeW18VApz2r1j6OEMv_GF2Zxmd7KfHcbk41MVJWGts3nFDdlI3KkswC3VoMzFF03Ks5i83TtyY0zWf7NebhF-uba5PFWZUgynOsGh8MVw0lLLcAFMy80imxIY7qPLSmgUSzrOjVjirtx8H7XcVLoN-2laLxaZdw2EJAMGNQlQ.E_vjb0lu2QE8jpEM.z3BWrtMzlc2qnuYsiRS4SGVQi8ShZaA87GQLzfXUiX31tCdImhUnufQgRuB_3aNWMme9N_EavXPU8C6xPGuF0bazhLtV9qp5WznQcZOP_Mb8Fjv6idNnFQk_t3Zzg8yBTX4epvmOyBlCAupHdwR0Sv1LiTFQiqZ9vpykBaKIetLKutvUw3umTXCun8bBO_kjbKjwO2A1riylXw87sK_1yO-NpdeRmGhljkj7U1DiOSzjcj46erGbRglBDlA-1Y4e8eOB4KM5xlyVSw0ImsAupgEYR3SRfRak96EiLBU6n9iO8oA.wNFPzC624A5TVcsNzrEbUg",
    "consumer": {
        "consumerIdentity": {
            "identityType": "EXTERNAL_ACCOUNT_ID"
        },
      },      
    "cardSource": "CARDHOLDER"
}
```

**Then**   
> **Step 1:**   
>
> Mastercard responds with a response code of `200`, along with supported `authenticationMethods` in `digitalCardData`, `srcDigitalCardId` and `maskedCard` data.

```json
{
   "body": {
       "maskedCard": {
           "dateOfCardCreated": "2024-03-12T19:41:36.470Z",
           "digitalCardData": {
               "artUri": "https://stage.assets.mastercard.com/card-art/combined-image-asset/HIGH-MASK-3x.png",
               "coBrandedName": "Co brand partner",
               "descriptorName": "Issuing Bank",
               "isCoBranded": true,
               "pendingEvents": [
                   "PENDING_SCA"
               ],
               "status": "ACTIVE",
               "issuerName": "Issuing Bank",
               "longDescription": "Bank Rewards Mastercard with rewards program",
               "foregroundColor": "000000",
               "authenticationMethods": [
                   {
                       "authenticationMethodType": "3DS",
                       "authenticationSubject": "CARDHOLDER",
                       "uriData": {
                           "uri": "https://stage.src.mastercard.com/auth",
                           "uriType": "WEB_URI"
                       }
                   },
                   {
                       "authenticationMethodType": "MANAGED_AUTHENTICATION",
                       "authenticationSubject": "CARDHOLDER",
                       "uriData": {
                           "uri": "https://stage.src.mastercard.com/auth",
                           "uriType": "WEB_URI"
                       }
                   }
               ]
           },
           "panBin": "520799",
           "panExpirationMonth": "11",
           "panExpirationYear": "2024",
           "panLastFour": "4591",
           "paymentAccountReference": "5001a9f027e5629d11e3949a0800b",
           "paymentCardDescriptor": "mastercard",
           "paymentCardType": "DEBIT",
           "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
           "srcDigitalCardId": "q9tfeSelQyOt6WNsoICIiA000000000000US",
           "tokenLastFour": "8931",
           "tokenUniqueReference": "DM4MMC0000000002478f585f3be52c2e6a99e41bc8a6703a",
           "mfaEligibility": []
       },
       "maskedConsumer": {
           "dateConsumerAdded": "2024-03-12T19:41:35.428Z",
           "maskedConsumerIdentity": {
               "identityType": "EXTERNAL_ACCOUNT_ID",
               "maskedIdentityValue": "testfido33@mailinator.com"
           }
       },
       "srcCorrelationId": "2be8ed05-e95b-4541-88ec-30557a312bd4"
   }
}
```

> **Step 1a:**   
>
> For an already enrolled card, Integrator can call [Authentication Lookup](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#look-up-cardholder-authentication-methods) API to fetch available authentication methods.

```json
{
  "srcClientId": "eccbf087-f159-4d69-b31d-00bec75c0474",
  "serviceId": "SECURE_COF_MERCHANT#Mastercard#01",
  "srcCorrelationId": "43d4c8e5-b57e-4794-ac9b-6a454c9325cb",
  "accountReference": {
    "srcDigitalCardId": "51a977f3-bda4-498b-901d-b48ad4d97abv"
  },
  "authenticationContext": {
    "authenticationReasons": [
      "TRANSACTION_AUTHENTICATION"
    ]
  }
}
```

```json
{
  "srcCorrelationId": "43d4c8e5-b57e-4794-ac9b-6a454c9325cb",
  "srciTransactionId": "18df482e-31f2-4289-b0d7-4d768b72d3ed",
  "authenticationMethods": [
    {
      "authenticationMethodType": "3DS",
      "authenticationSubject": "CARDHOLDER",
      "uriData": {
        "uri": "https://sandbox.src.mastercard.com/auth",
        "uriType": "WEB_URI"
        },  
      "authenticationMethodType": "MANAGED_AUTHENTICATION",
      "authenticationSubject": "CARDHOLDER",
      "uriData": {
        "uri": "https://sandbox.src.mastercard.com/auth",
        "uriType": "WEB_URI"
       }
    }
  ]
}
```

> **Step 2:**   
>
> Integrator requests for authentication by following the [SDK](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md) or [URL](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md) approach to launch the Authentication UI.  

```json
{
  "authenticationContext":{
    "dpaTransactionOptions":{
      "transactionAmount":{
        "transactionAmount":0,
        "transactionCurrencyCode":"USD"
      },
      "threedsInputData":{
        "forceChallenge":true
      }
    },

    "authenticationReasons":[
      "TRANSACTION_AUTHENTICATION"
      ],
    "srciDpaId":"5e0d4b84-189d-4c86-822d-590602f62062_SCOF"
  },
  "authenticationMethod":{
    "authenticationMethodType":"MANAGED_AUTHENTICATION",
    "authenticationSubject":"CARDHOLDER",
  },
  "srcCorrelationId":"0354bc91-c62c-43d6-a029-4f2486aa959f",
  "accountReference":{
    "srcDigitalCardId":"9b_EqVuzTAOYI9ehjFVwLw000000000000US"
   },
   "serviceId":"SECURE_COF_COMMERCE_PLATFORM#DOCUMENTATION-UPN2#01",
   "srcClientId":"5e0d4b84-189d-4c86-822d-590602f62062"
}
```

> **Step 3:**   
>
> Mastercard invokes the [Authentication UI](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md).   
>
> If passkeys are not registered for a given card, and if Issuer requests for 3DS challenge, Authentication UI presents the challenge to the user. After 3DS challenge, user is prompted to create a passkey. On successful passkey registration, Mastercard responds back with authentication result and status.  

```json
{
  "assuranceData":{
    "verificationData":[
     {
        "verificationType":"CARDHOLDER",
        "verificationEntity":"03",
        "verificationMethod":"01",
        "verificationResults":"01",
        "verificationTimestamp":"1710781808901",
        "verificationEvents":[
        "02"
        ],  
        "additionalData":"ZXlKcmFXUWlPaUl5TURJek1ESXdPREE0TlRFMU55MXpZVzVrWW05NExXbGtaVzUwYVhSNUxYWmxjbWxtYVdOaGRHbHZiaTF6Y21NdGJXRnpkR1Z5WTJGeVpDMXBiblFpTENKMGVYQWlPaUpLVjFRclpYaDBMbU5oY21SZmRHOXJaVzRpTENKaGJHY2lPaUpTVXpJMU5pSjkuZXlKaGRXUWlPaUpvZEhSd2N6cGNMMXd2YldGemRHVnlZMkZ5WkM1amIyMGlMQ0pqWVhKa1NXUWlPaUk1WWw5RmNWWjFlbFJCVDFsSk9XVm9ha1pXZDB4M01EQXdNREF3TURBd01EQXdWVk1pTENKcGMzTWlPaUpvZEhSd2N6cGNMMXd2YldGemRHVnlZMkZ5WkM1amIyMGlMQ0pqYjNKeVpXeGhkR2x2Ymtsa0lqb2lNRE0xTkdKak9URXRZell5WXkwME0yUTJMV0V3TWprdE5HWXlORGcyWVdFNU5UbG1JaXdpYzJOdmNHVkVZWFJoSWpvaWUxd2lZWFYwYUZObGMzTnBiMjVKWkZ3aU9sd2lOakpoTkROak0yWXRPRFkwTVMwME1XTTVMV0U1WVRNdE5XRmpPRGxoT1RBM1pHTmpYQ0lzWENKaGRYUm9aVzUwYVdOaGRHbHZibEpsYzNWc2RGd2lPbHdpUVZWVVNFVk9WRWxEUVZSRlJGd2lMRndpWVhWMGFHVnVkR2xqWVhScGIyNU5aWFJvYjJSY0lqcGNJak5FVTF3aUxGd2lkR2h5WldWRWMxQkJWbVZ5YVdacFpXUmNJanBjSW5SeWRXVmNJaXhjSW1ObGNuUnBabWxsWkUxbVlVMWxkR2h2WkVsa1hDSTZYQ0l6TURBd01Wd2lMRndpWVhWMGFHVnVkR2xqWVhScGIyNVVhVzFsWENJNlhDSXhOekV3TnpneE9EQTRPVEF4WENJc1hDSnpjbU5EYkdsbGJuUkpaRndpT2x3aU5XVXdaRFJpT0RRdE1UZzVaQzAwWXpnMkxUZ3lNbVF0TlRrd05qQXlaall5TURZeVhDSXNYQ0poZFhSb1pXNTBhV05oZEdsdmJsSmxZWE52Ym5OY0lqcGJYQ0pGVGxKUFRGOUdTVTVCVGtOSlFVeGZTVTVUVkZKVlRVVk9WRndpWFgwaUxDSnpZMjl3WlhNaU9sc2lWRTlMUlU1ZlFrbE9SQ0pkTENKbGVIQWlPakUzTVRBM09ESXhNRGdzSW1saGRDSTZNVGN4TURjNE1UZ3dPQ3dpYW5ScElqb2lNRGswWmprNE1USXRNR1prWkMwME9UZG1MV0V6WXpVdFlqaG1OelJsTkRVME9UUXlJbjAuV2ZLeVJhTlZTM3hkWHF5SHNWTHBjUFlkQ1JkN2RvaEZ5M0w3LUVLRzRDRkoyd2JlZ1o1ZklrVXpHdWhWWnhCTFdnQnc3ZmVfZ0dheUswTG1RcTBUaExtOVhJQ1BtM0tpOWd6Rkg1clhkLXNBaUx2T1Ntem05RmNSTUpGQlRoY21QbWJicVI4ZzV6dmx4Rm13X1Q4WUhZUjV0cTNIN3FrcmRFTVQxXzc2Tjd3NjRiaUI2cHdTRWMtWmR4ejgwenpYUU56X2FlekF4b3J2NzRvd3ZjS1RCaGdCc2pELTBFV1M4MF9sNDQ4U3o1bGRCV2xoMFl6bXlTRDRRaTJmWGl1R1ljME9ENmZLeGtGS295cDFmZnROVHV4clVpZHlSaUdQX3VFN0xhVHpEMTlWZEg0S18xdW1oREJGc1JQVUM1RFlpQmdSREkyT3dlNkNaUjFRT0g5bXVn"
    }
   ],
 },
  "authenticationStatus": "COMPLETE",
  "authenticationResult":"AUTHENTICATED",
  "srcCorrelationId":"0354bc91-c62c-43d6-a029-4f2486aa959f",
}
```

> If passkeys are already registered, Mastercard invokes the [Authentication UI](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md) and presents passkeys verification screen.   
>
> After successful passkeys verification, Mastercard responds back with authentication result and status.

```json
{
  "assuranceData":{
    "verificationData":[
     {
      "verificationType":"CARDHOLDER",
      "verificationEntity":"02",
      "verificationMethod":"07",
      "verificationResults":"01",
      "verificationTimestamp":"1710787001221",
      "verificationEvents":[
      "01"
      ],
      "additionalData":"eyJ0eXBlIjoiRklETzIiLCJjZXJ0aWZpZWRNZmFNZXRob2RJZCI6IjIwMDAxIiwiZXh0ZXJuYWxNZmFNZXRob2RJbnN0YW5jZUlkIjoiMzk2YzU0ZjgtOTJhZi00NzRjLThmYWMtMjhlNDI5Njk2NmM1IiwiYXNzZXJ0aW9uIjoiZXlKcmFXUWlPaUl5TURJek1UQXlNREUwTXpRME9DMWtZWE10YldGakxYTnBaMjR0YlhSbUlpd2lkSGx3SWpvaVNsZFVJaXdpWVd4bklqb2lVbE15TlRZaWZRLmV5SnBjME5vWVd4c1pXNW5aVkJsY21admNtMWxaQ0k2ZEhKMVpTd2lZMjl0Y0d4bGRHVmtRWFFpT2pFM01UQTNPRGN3TURBc0ltRmpZMjkxYm5SU1pXWmxjbVZ1WTJVaU9uc2lkSGx3WlNJNklsTlNRMTlFU1VkSlZFRk1YME5CVWtSZlNVUWlMQ0oyWVd4MVpTSTZJamxpWDBWeFZuVjZWRUZQV1VrNVpXaHFSbFozVEhjd01EQXdNREF3TURBd01EQlZVeUo5TENKaGMzTmxjblJwYjI1VWVYQmxJam9pWVhWMGFHVnVkR2xqWVhScGIyNGlMQ0pqWlhKMGFXWnBaV1JOUmtGTlpYUm9iMlJKWkNJNklqSXdNREF4SWl3aWFYTnpJam9pYUhSMGNITTZYQzljTDNOaGJtUmliM2d1ZG1WeWFXWjVMbTFoYzNSbGNtTmhjbVF1WTI5dElpd2lZWFYwYUdWdWRHbGpZWFJwYjI1R1lXTjBiM0p6SWpvaU1ESXdRU0lzSW1GMVpDSTZJbWgwZEhCek9sd3ZYQzl0WVhOMFpYSmpZWEprTG1OdmJTSXNJbU5zYVdWdWRGTmxjM05wYjI1SlpDSTZJbVl4WkRObFpUazFMVFE0T0dJdE5HUmxaQzFoT0RBeUxUWTNNelF4TWpCaVpETXdaaUlzSW1GMWRHaGxiblJwWTJGMGFXOXVUV1YwYUc5a0lqb2lSa2xFVHpJaUxDSjBjbUZ1YzJGamRHbHZia0Z0YjNWdWRDSTZleUowY21GdWMyRmpkR2x2YmtGdGIzVnVkQ0k2TXpjdU5UUXNJblJ5WVc1ellXTjBhVzl1UTNWeWNtVnVZM2xEYjJSbElqb2lWVk5FSW4wc0ltUmhjMEYxZEdobGJuUnBZMkYwYjNKSmJuTjBZVzVqWlVsa0lqb2lNemsyWXpVMFpqZ3RPVEpoWmkwME56UmpMVGhtWVdNdE1qaGxOREk1TmprMk5tTTFJaXdpWlhod0lqb3hOekV3TnpnM09UQXdMQ0pwWVhRaU9qRTNNVEEzT0Rjd01EQXNJbUYxZEdobGJuUnBZMkYwYVc5dVVtVmhjMjl1Y3lJNld5SlVVa0ZPVTBGRFZFbFBUbDlCVlZSSVJVNVVTVU5CVkVsUFRpSmRmUS5sTXprRC13LTYyTTZVMWt0MkdaQll1Zkh0NzRGNGRMQXpER2RZcTZzRUlYYjhvdzlBQUE1SE56X2dVRlZIX3Ric0NuZlJQSWxZR0ZMZmxzbktKcm1YQjQxNUl0MkVuR0p4UkZCVXhsN1F1RXJBTXEtaHoyM05pRGdMVGlkUEI5Unpsa01ENGx5S3FnZDNib05UeGVQQldqaEFqaFdGaV9MQmJqMnB6bHdmSk13SnpYanExZ2szS1NOb2NONGUyRXdKVE1FS2VHQTI2bDh4N0pnTTZobkJlX1h1VUNHUlM1VTZtNGNWRnl3NXBfdjU4NktNWU9rcEFTeG1MaE5UN0lNMTY0bzVIX0tjN2VTOThNRUh1ZkhqajZ5aUJ0RW9NSzRCTkdXeFc2M3JPUGcwYXk2UFZBZWEwV1RnVFhKSllIU3VNWG9JdEdzOUphZUQ4WHM3S2J2bWciLCJmaWRvTWZhTWV0aG9kRGF0YSI6eyJyZWx5aW5nUGFydHkiOnsibmFtZSI6Im1hc3RlcmNhcmQuY29tIn0sImZpZG9Vc2VyTmFtZSI6Ik1hc3RlcmNhcmQgKE1hYyBPUyBDaHJvbWUpIiwiZmlkb0Rpc3BsYXlOYW1lIjoiTWFzdGVyY2FyZCAoTWFjIE9TIENocm9tZSkiLCJmaWRvVXNlcklkIjoiZjM1NzA3ODQtYjRhYi00OTE2LWE4YTYtYTkwMTcxNjMwNjU1IiwiaXNTcGNFbmFibGVkIjpmYWxzZX19"
    }
   ]
  },
  "authenticationStatus":"COMPLETE",
  "authenticationResult":"AUTHENTICATED",
  "srcCorrelationId":"f1d3ee95-488b-4ded-a802-6734120bd30f"
}
```

> **Step 4:**   
>
> After successful transaction authentication, Integrator can request to [checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) with proof of authentication for 3DS transaction authentication or passkeys verification.

```json
{
  "body":{
      "srcClientId":"5e0d4b84-189d-4c86-822d-590602f62062",
      "srcDpaId":"5e0d4b84-189d-4c86-822d-590602f62062_SCOF",
      "srcCorrelationId":"407c6dfc-0d41-4888-9e54-117996a2ebdf",
      "serviceId":"SECURE_COF_COMMERCE_PLATFORM#DOCUMENTATION-UPN2#01",
      "srcDigitalCardId":"XyveVfqcQv-SKljZYl3jyg000000000000NZ",
      "dpaTransactionOptions":{
          "transactionAmount":{
              "transactionAmount":46.99,
              "transactionCurrencyCode":"USD"
          }
        },
      "assuranceData":{
        "verificationData":[
        {
          "verificationType":"CARDHOLDER",
          "verificationEntity":"03",
          "verificationMethod":"01",
          "verificationResults":"01",
          "verificationTimestamp":"1710786517566",
          "additionalData":"ZXlKcmFXUWlPaUl5TURJek1ESXdPREE0TlRFMU55MXpZVzVrWW05NExXbGtaVzUwYVhSNUxYWmxjbWxtYVdOaGRHbHZiaTF6Y21NdGJXRnpkR1Z5WTJGeVpDMXBiblFpTENKMGVYQWlPaUpLVjFRclpYaDBMbU5oY21SZmRHOXJaVzRpTENKaGJHY2lPaUpTVXpJMU5pSjkuZXlKaGRXUWlPaUpvZEhSd2N6cGNMMXd2YldGemRHVnlZMkZ5WkM1amIyMGlMQ0pqWVhKa1NXUWlPaUpZZVhabFZtWnhZMUYyTFZOTGJHcGFXV3d6YW5sbk1EQXdNREF3TURBd01EQXdUbG9pTENKcGMzTWlPaUpvZEhSd2N6cGNMMXd2YldGemRHVnlZMkZ5WkM1amIyMGlMQ0pqYjNKeVpXeGhkR2x2Ymtsa0lqb2lOREEzWXpaa1ptTXRNR1EwTVMwME9EZzRMVGxsTlRRdE1URTNPVGsyWVRKbFltUm1JaXdpYzJOdmNHVkVZWFJoSWpvaWUxd2lZWFYwYUZObGMzTnBiMjVKWkZ3aU9sd2labUpsWldSa01qVXRNamxsTVMwME16ZGlMVGxrT0RNdE9ERmlPREJrTm1VeVpqZ3pYQ0lzWENKaGRYUm9aVzUwYVdOaGRHbHZibEpsYzNWc2RGd2lPbHdpUVZWVVNFVk9WRWxEUVZSRlJGd2lMRndpWVhWMGFHVnVkR2xqWVhScGIyNU5aWFJvYjJSY0lqcGNJak5FVTF3aUxGd2lkR2h5WldWRWMxQkJWbVZ5YVdacFpXUmNJanBjSW5SeWRXVmNJaXhjSW1ObGNuUnBabWxsWkUxbVlVMWxkR2h2WkVsa1hDSTZYQ0l6TURBd01Wd2lMRndpWVhWMGFHVnVkR2xqWVhScGIyNVVhVzFsWENJNlhDSXhOekV3TnpnMk5URTNOVFkyWENJc1hDSnpjbU5EYkdsbGJuUkpaRndpT2x3aU5XVXdaRFJpT0RRdE1UZzVaQzAwWXpnMkxUZ3lNbVF0TlRrd05qQXlaall5TURZeVhDSXNYQ0poZFhSb1pXNTBhV05oZEdsdmJsSmxZWE52Ym5OY0lqcGJYQ0pVVWtGT1UwRkRWRWxQVGw5QlZWUklSVTVVU1VOQlZFbFBUbHdpWFgwaUxDSnpZMjl3WlhNaU9sc2lWRTlMUlU1ZlFrbE9SQ0lzSWtGVlZFaEZUbFJKUTBGVVNVOU9VeUpkTENKbGVIQWlPakUzTVRBM09EWTRNVGNzSW1saGRDSTZNVGN4TURjNE5qVXhOeXdpYW5ScElqb2lNVGMzTnpJNVkySXRZemMwT0MwME1ETmtMVGc1TWpZdFpUTXhOVGxpTkRZMFpXRTBJbjAubU8wOVJEem1zbWl3ZHJFbTFCb3ZmUDROcHBzbC02Y1JWRWdSTE9XT2Z0eGlxNjE4QjVvTXdQa2hSUll1eHVweURBVkpoRHVJZU8ta24tWWQxMk9nRFZkT3o2MUduYmE2TWU1TllmZ0UxODhHZ0ZuWXFfTnloc3RyTllEZDhnNjlKVFBESi1NYmNsdkxUTjY0S3VHRzVZTTR1WWV4LUM2V19PLUhSSENPak1xSmxIeGJRaG5LOE15WWg2NFR6RnQ4VXJfNVVza0c2dG45LXo2b0c2cU9tYjR2dkF3OFkyOFJSYTFsZDhpWUpkT3Z3a1BGVDNsZDhZUjJiWHBHMHJMSThqWmJkRG1xY3pPeWNHWFFWX2ZRajNvRGpVZTV2b3p5UDZkUlAtTUF4SmMyQTRyS1BxWk5LQUZCQWpKcFU4UFRMcDdXMEV0TGlEaGppb0xESTBZTWxn",
          "verificationEvents":[
          "01"
          ]
        }
       ]
     }
   }
}
```

> Mastercard sends back the response with `eci` = 02 (AUTHENTICATED), `verificationResult`= 01 (Verified), along with `dsTrsanactionId`, `authenticationValue` in an encrypted payload, which can be viewed after decrypting the payload.
>
```json
{
  "checkoutResponseJWSPayload":{
      "srcCorrelationId":"407c6dfc-0d41-4888-9e54-117996a2ebdf",
      "encryptedPayload":"eyJraWQiOiJzdGFydFNCWEVuY0tleSIsImVuYyI6IkExMjhHQ00iLCJhbGciOiJSU0EtT0FFUC0yNTYifQ.bjYvL8yYySatS3RLxRH3po5uqfoxTaVSyNePqgaTcpDOvP0o3uU2kdYGNg4_VRBsDqBcNdFc21HfRyZ9v8lXk63jIqBdydc9hEqoHtRiE-KwjsMXFyTtSYF7_g2ktBUmpuKizMS1Xc3h1x6UPB9tYmsTRgWGZJ4JiaXNNHlU9zvnbMWaRld-rSzEtzUfGpCuQ0XUpbv-Y_MEWCIqt67rx3TVxcicOwB6ADNxJBSIutDffr3eOWVLEvpivPu3hiaXkzhdf_OrQOfHi3E28virmUkjQoBBsI_tNJjGZBPnQpZAwG22e4zCj2jevtwM25y-zZ6Mlr7Kr8UEbKeoAWeF1w.Lgfw8Yk5zh37lHcn.gsDOKtKp6fAtze3dUxcLYgdttR5bjyZQ7O9OZmu2SWvNo150976w4PwHefzm4tQalof2MK-_eOt_zh5p0txrJFSaIbEtXGfK_IOViFDs5Jg910JmbepWwE6NC6AY3bETBiQP69BmQqzRWD6mFTQ5RoTy8XeNbxDuiwFx7miusz8WTLu73e_AMWvhsHPlR9_oQkErxJXKcighnW4zgyUKnWAFHzX_ZoMEI6yq0ce-LNR-PiLAg8FjYmcf0wmRRn1rTCt7O-J2pjTsrWpfoJDIWL2qcbO5BcvD7SnjRn8t-A6HnwODgnRC8aNtfDOuD7XrtDjyUN3JnGSqmaqEX9YDVaBVeqa2Z0rE-spsj0ayjdOvcGt5yyxW1UL0FKF1UH8PC0vWc7rK30c6DNga671u7FBt0-jgNv1ck9ygAsCKH40LhgvwcHXeMlk_1gBwRuLHZW8U7_y4uojvsfZMgm2-7QPH-vPaWdpg69PrPnVZh3UnGC2w2Bz-ZGq1X5wLxtRZU0jHxcJsNyHeZKU82rTKeJE1o0rGjD8EncFB6dQa_NGIf8iNbd4ImZYGtZlUMOvBm2x8XQDN_Z5no1ic7EngqxvLTyemj09fatGwUrS6DQqK444Zws0lQHpq4T5FlgFWeErfg0Z8g0k0F_25Aw.zH0V67jgnxQ0RyutO3e4Cg",
      "maskedCard":{
            "srcDigitalCardId":"XyveVfqcQv-SKljZYl3jyg000000000000NZ",
            "panBin":"547350",
            "panLastFour":"4599",
            "tokenBinRange":"547350",
            "tokenLastFour":"8227",
            "digitalCardData":{
                "status":"ACTIVE",
                "descriptorName":"Mastercard Test Bank",
                "artUri":"https://sbx.assets.mastercard.com/card-art/combined-image-asset/6713d73d-a701-4bd2-bc9b-2e98940de9c7.png",
                "isCoBranded":false,
                "longDescription":"Test Bank for Mastercard MTF",
                "foregroundColor":"0F0F0F",
                "issuerName":"Test IssuerÂ®"
             },
            "panExpirationMonth":"11",
            "panExpirationYear":"2024",
            "paymentCardDescriptor":"mastercard",
            "paymentCardType":"CREDIT",
            "serviceId":"SECURE_COF_COMMERCE_PLATFORM#DOCUMENTATION-UPN2#01",
            "dateOfCardCreated":"2024-03-18T18:28:15.986Z"
        },
      "maskedConsumer":{
        "srcConsumerId":"2729f47b-3725-4f87-83ac-d761a1f76694",
        "maskedConsumerIdentity":{
            "identityType":"EXTERNAL_ACCOUNT_ID",
            "maskedIdentityValue":"testalert2@mailinator.com"
         },
         "maskedMobileNumber":{
         },
         "status":"ACTIVE",
         "maskedFullName":"",
         "dateConsumerAdded":"2024-03-18T17:09:45.653Z"
       },
      "customOutputData":{
          "remoteCommerceAcceptorIdentifier":"d3d3LnRlc3RkcGEyLmNvbQ=="
       },
       "assuranceData":{
          "cardVerificationEntity":"02",
          "cardVerificationMethod":"03",
          "cardVerificationResults":"23",
          "verificationData":[
          {
            "verificationType":"CARDHOLDER",
            "verificationEntity":"03",
            "verificationMethod":"01",
            "verificationResults":"01",
            "verificationTimestamp":"1710786517566",
            "verificationEvents":[
            "01"
            ]
          }
        ],
        "eci":"02"
      },
      "keyFingerprintId":"a28f0222ee06631fefdea53b61ece178a593725142df927889ddcd95680baab4",
  },
  "decryptedPayload":{
  "token":{
      "paymentToken":"************8227",
      "tokenExpirationMonth":"04",
      "tokenExpirationYear":"2027",
      "paymentAccountReference":"5001D7LT6PXN3CMQ3IZGT9ZHBVCDM",
      "panSequenceNumber":"00"
    },
  "srcTokenResultsData":{
      "unpredictableNumber":"76e73d4c"
    },
  "dynamicData":{
      "dynamicDataValue":"MFwitt6vpQSWAAF25z1MAAADFOA=",
      "dynamicDataType":"CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
    },
  "threeDsOutputData":{
      "dsTransID":"bb5bfdd8-daa9-4da1-8180-ea36b54f0655",
      "authenticationValue":"kBIYYgZV4JwMxxJb72+M+YQB3mNK"
    }
  }
}
```

## Scenario 8 {#scenario-8}

**Assumptions**

* The Integrator is onboarded with Mastercard Card Checkout Solutions - Secure Card on File program to make API calls.
* The card used to enroll is token eligible.
* Issuer country is India.
* Issuer country is enabled for 3DS.
* Cardholder authentication has been successfully performed
* Consent to tokenize and store the card on file has been obtained from the cardholder   

**When**   
> On an integrator website, user enters valid card details and the integrator calls the [POST /EnrollCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) and includes the `complianceSettings.tokenization` object (required to enrol India issued cards).

```json
{
  "srcDpaId": "srcDpaId_9080592894174",
  "serviceId": "SECURE_COF_MERCHANT_OBO#GUARD_ICT_TESTDATA-ICT_ITF_01#01",
  "srcClientId": "2ebbaf53-282c-4d81-8f28-0d1ad478f273",
  "srcCorrelationId": "c6f7eb2a-02d3-485c-affd-e3271955e227",
  "complianceSettings": {
    "tokenization": {
      "cardHolderConsentCaptured": true,
      "cardHolderConsentCapturedTimestamp": "2024-10-12T04:08:57.614Z",
      "authentication": {
        "authenticationPerformed": true
      }
    }
  },
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "05",
        "verificationMethod": "01",
        "verificationResults": "01",
        "verificationTimestamp": "1621368633",
        "additionalData": "ew0KICAiYXV0aFR5cGUiOiAiM0RTIiwNCiAgImF1dGhNZXRhRGF0YSI6IHsNCiAgICAiYWF2IjogImJXVnlZMmhoYm5SSlpHVnVkR2xtYVdWeSINCiAgfQ0KfQ==",
        "verificationEvents": [
          "02"
        ]
      }
    ]
  },
  "card": {
    "cardholderFirstName": "Lysanne",
    "paymentAccountReference": "6ed727d2-9a4b-4917-bff0-8711de5905e7@mailinator.com",
    "cardSecurityCode": "000",
    "cardholderFullName": "Lysanne Kemmer",
    "panExpirationYear": "2025",
    "primaryAccountNumber": "5208010200462339",
    "billingAddress": {
      "zip": "500001",
      "city": "Hyderabad",
      "countryCode": "IN",
      "name": "Lysanne Kemmer",
      "state": "AP",
      "line2": "837 Ratke Shoal",
      "line1": "Jenifer Lakes"
    },
    "cardholderLastName": "Kemmer",
    "panExpirationMonth": "10"
  },
  "consumer": {
    "firstName": "Brock",
    "lastName": "Dickens",
    "mobileNumber": {
      "phoneNumber": "1946233309",
      "countryCode": "+91"
    },
    "countryCode": "IN",
    "fullName": "Brock Dickens",
    "languageCode": "en",
    "consumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "identityValue": "6ed727d2-9a4b-4917-bff0-8711de5905e7@mailinator.com"
    }
  }
}
```

**Then**   
> Mastercard responds with a response code of `200`, along with `srcDigitalCardId` and `maskedCard` data.

```json
{

  "srcCorrelationId": "c6f7eb2a-02d3-485c-affd-e3271955e227",
  "maskedCard": {
    "srcDigitalCardId": "ouFEzuGsRB2CM0Vscccl_Q000000000000IN",
    "panBin": "520801",
    "panLastFour": "2339",
    "tokenUniqueReference": "DM4MMC1IN00000002b708c2089194314906c6de512fb8db2",
    "tokenLastFour": "9984",
    "digitalCardData": {
      "status": "ACTIVE",
      "descriptorName": "etwertretr",
      "artUri": "https://stage.assets.mastercard.com/card-art/combined-image-asset/HIGH-MASK-3x.png",
      "isCoBranded": "false",
      "issuerName": "ACH2",
      "foregroundColor": "000005"
    },
    "panExpirationMonth": "10",
    "panExpirationYear": "2025",
    "paymentCardDescriptor": "mastercard",
    "paymentCardType": "CREDIT",
    "serviceId": "SECURE_COF_MERCHANT_OBO#GUARD_ICT_TESTDATA-ICT_ITF_01#01",
    "dateOfCardCreated": "2025-05-29T13:11:53.063Z"
  },
  "maskedConsumer": {
    "srcConsumerId": "deb0c432-a9ee-4b10-9e2d-0c5289ef5c4d",
    "maskedConsumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "maskedIdentityValue": "6ed727d2-9a4b-4917-bff0-8711de5905e7@mailinator.com"
    },
    "dateConsumerAdded": "2025-05-29T13:11:52.437Z"
  }
}
```

## Scenario 9 {#scenario-9}

**Assumptions**

* The integrator is onboarded to the **Mastercard Card Checkout Solutions -- Secure Card on File** program and authorized to make API calls.
* The card being enrolled is **token eligible**.
* The **test card's country and issuer** are configured to be **eligible for Mastercard FIDO**.
* The client is **associated with the required Mastercard FIDO configuration**.
* The **issuer's country** is **enabled for 3-D Secure (3DS)** .   

**When**   
> On Integrator's website, user enters valid card details with `primaryAccountNumber`,`panExpirationMonth`,`panExpirationYear`,`cardSecurityCode`, and Integrator calls the [POST /EnrollCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card).

```json
{
  "srcClientId": "6aff5cba-3aac-4fe0-b0cd-a52fc948d0c6",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#E2E#01",
  "srcDpaId": "5e0d4b84-189d-4c86-822d-590602f62062_dpa1",
  "cardSource": "CARDHOLDER",
  "consumer": {
    "consumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "identityValue": "f0c04b97-4dcb-485d-a4f4-7ae437a2e955"
    }
  },
  "encryptedCard": "eyJraWQiOiIyMDIzMDIwNzIyMzUyMS1zYW5kYm94LWZwYW4tZW5jcnlwdGlvbi1zcmMtbWFzdGVyY2FyZC1pbnQiLCJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMTI4R0NNIn0.PyG31_2YRpHenM0NnJT2AiCF0RSqAwjVj8ETMOe-XWEISls5GtdX38epn4BGQUCVKRl7XjGPUl--U2_8HnWG7qQe2SAp7F0ZiUHczBMAdAh96aIe5RylBhBeha3bH7-EpqMYyyJwkUSck6mvhLP8XbM0ZRDeowebydrNaeWfD
```

**Then**   
> **Step 1:** Mastercard responds with a response code of `200`, along with `srcDigitalCardId`, `maskedCard` and `digitalCardData`.

```json
{
  "srcCorrelationId": "ff97ef9b-4b1e-40c2-b522-42197061dc5a",
  "maskedCard": {
    "srcDigitalCardId": "9ajNArkAR66zqYyHCn0rCA000000000000US",
    "panBin": "512034",
    "panLastFour": "0747",
    "tokenUniqueReference": "DM4MMC1US000000013a3b395556c420e85bfebe54b219e36",
    "digitalCardData": {
      "status": "ACTIVE",
      "descriptorName": "MasterCard Test Bank",
      "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
      "pendingEvents": [
        "PENDING_SCA"
      ],
      "isCoBranded": "false",
      "authenticationMethods": [
        {
          "authenticationMethodType": "3DS",
          "authenticationSubject": "CARDHOLDER",
          "uriData": {
            "uri": "https://stage.src.mastercard.com/auth",
            "uriType": "WEB_URI"
          }
        },
        {
          "authenticationMethodType": "MANAGED_AUTHENTICATION",
          "authenticationSubject": "CARDHOLDER",
          "uriData": {
            "uri": "https://stage.src.mastercard.com/auth",
            "uriType": "WEB_URI"
          }
        }
      ]
    },
    "panExpirationMonth": "12",
    "panExpirationYear": "2024",
    "paymentCardType": "CREDIT",
    "serviceId": "SECURE_COF_COMMERCE_PLATFORM#E2E#01",
    "paymentAccountReference": "50015018T6JE5ZORJON0QTP9HHMYN",
    "dateOfCardCreated": "2024-10-03T14:29:30.685Z"
  },
  "maskedConsumer": {
    "srcConsumerId": "a7c53e04-dae7-4da0-9b4a-b3d8e8399ebb",
    "maskedConsumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "maskedIdentityValue": "f0c04b97-4dcb-485d-a4f4-7ae437a2e955"
    },
    "status": "ACTIVE",
    "dateConsumerAdded": "2024-10-03T14:29:27.441Z"
  }
}
```

> **Step 2:** Integrator calls [Lookup Authentication Method API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#lookupAccountHolderAuthenticationProfile) with `authenticationReasons` and receives **MANAGED_AUTHENTICATION** as eligible method in response.

```json
{
  "srcDigitalCardId": "PLReJE1YR3KvC3jSgxP7Mg000000000000AR",
  "srcCorrelationId": "8e280f17-bdae-4b9f-8ff5-799d78d12776",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_API_STG#01",
  "srcClientId": "5a9f8c51-7ad1-40c6-b828-b7437b9334f6",
  "authenticationContext": {
    "authenticationReasons": [
      "ENROLL_FINANCIAL_INSTRUMENT"
    ]
  }
}
```

```json
{
  "srcCorrelationId": "8e280f17-bdae-4b9f-8ff5-799d78d12776",
  "authenticationMethods": [
    {
      "authenticationMethodType": "MANAGED_AUTHENTICATION",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "uriData": {},
      "authenticators": []
    }
  ]
}
```

> **Step 3:** Integrator calls [Authenticate API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#AccountHolderAuthenticationsAuthenticateProfile) and receives the Authentication UI URL to launch the challenge.

```json
{
  "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
  "srcCorrelationId": "e59b2feb-d149-4deb-aba8-0897d162a864",
  "srcDigitalCardId": "9ZtsqSdrQpikwY3aphMabg000000000000GB",
  "authenticationMethod": {
    "authenticationMethodType": "MANAGED_AUTHENTICATION",
    "authenticationSubject": "CARDHOLDER"
  },
  "authenticationContext": {
    "authenticationReasons": [
      "ENROL_FINANCIAL_INSTRUMENT"
    ],
    "dpaTransactionOptions": {
      "threeDsInputData": {
        "forceChallenge": false
      },
      "dpaLocale": "en_AE"
    },
    "callbackUri": {
      "uri": "https://eta-macs-test-tools.apps.stl.pcfstage00.mastercard.int/macstools/auth-processing?clientSessionId=1153f001-58a3-4183-b91b-9942c5365406",
      "uriType": "WEB_URI"
    }
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166836"
  }
}
```

```json
{
  "srcCorrelationId": "e59b2feb-d149-4deb-aba8-0897d162a864",
  "authenticationSessionId": "464f29b3-b155-4b6d-a56d-c0ecf3672883",
  "authenticationResult": "NOT_AUTHENTICATED",
  "authenticationStatus": "PENDING",
  "methodAttributes": {
    "uriData": {
      "uri": "https://stage.src.mastercard.com/auth?sav=ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldNdGJtVjNMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgwTG5ObGMzTnBiMjVwWkY5MGIydGxiaUlzSW1Gc1p5STZJbEpUTWpVMkluMC5leUpoZFdRaU9pSm9kSFJ3Y3pwY0wxd3ZiV0Z6ZEdWeVkyRnlaQzVqYjIwaUxDSmpiMjV6ZFcxbGNrbGtJam9pTVRNME16VXlPVFF0Wm1FMFpTMDBZV05pTFRobVpUWXRNRFZoWWpZMllqQTRPRGd4SWl3aWFYTnpJam9pYUhSMGNITTZYQzljTDIxaGMzUmxjbU5oY21RdVkyOXRJaXdpYzJOdmNHVkVZWFJoSWpvaWUxd2lZWFYwYUZObGMzTnBiMjVKWkZ3aU9sd2lORFkwWmpJNVlqTXRZakUxTlMwMFlqWmtMV0UxTm1RdFl6QmxZMll6TmpjeU9EZ3pYQ0lzWENKemNtTkRiR2xsYm5SSlpGd2lPbHdpTVRNME16VXlPVFF0Wm1FMFpTMDBZV05pTFRobVpUWXRNRFZoWWpZMllqQTRPRGd4WENJc1hDSnpjbU5EYjNKeVpXeGhkR2x2Ymtsa1hDSTZYQ0psTlRsaU1tWmxZaTFrTVRRNUxUUmtaV0l0WVdKaE9DMHdPRGszWkRFMk1tRTROalJjSW4waUxDSmxlSEFpT2pFM05UZ3hOall5TlRRc0ltbGhkQ0k2TVRjMU9ERTJOVGsxTkN3aWFuUnBJam9pTUdRek1UUm1Oall0TUdVeE1pMDBZVGsyTFRrNU1tUXRNV0prWldObU16VXhNbVJoSW4wLlNVcTc1VnF6aGR6ZjFOUmxjaUtITWJLNkhoS2EtUzVKblpkVDlaYzZEaTFoWFppaGkwdUd0MDNJWXdTN3BGc3hMMUcxV3NJMTk4QVVmcWlGNWl0Yzl2elRESHByd3plb3pOd25lUVZhLTM3T0FvdFpKWUJIUXRCTnVrQ0ExWl80SEN5ZU0yeW1kaUNBQXJOaUZWcXpYeFhxdkNodmpHcWxUbnRCTEtwS0xGTUw5U1Vqd0czMTFyaDhQeWROUGVHU1AzTnljMGpGUTRJUk9hbzlnU3ZmMGRLdE90ajdab2h5VDNRZXRCa0ZrbXJGNWVZU0k0WFJVM3IyRXZCWTdNMGp5VUZZZWE3ZjhBdExpV3FKWFlHZEtNMU9CeE1kZWFSSlNxejZEaVR1RHFJSGNvdG9ZOWtqYUZISmhYWHJlbnpJVGRuX0I2cXQxOGEtbnRHWUUtck5KZw==&traceId=34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166836",
      "uriType": "WEB_URI"
    }
  },
  "sessionAssuranceValue": "ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldNdGJtVjNMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgwTG5ObGMzTnBiMjVwWkY5MGIydGxiaUlzSW1Gc1p5STZJbEpUTWpVMkluMC5leUpoZFdRaU9pSm9kSFJ3Y3pwY0wxd3ZiV0Z6ZEdWeVkyRnlaQzVqYjIwaUxDSmpiMjV6ZFcxbGNrbGtJam9pTVRNME16VXlPVFF0Wm1FMFpTMDBZV05pTFRobVpUWXRNRFZoWWpZMllqQTRPRGd4SWl3aWFYTnpJam9pYUhSMGNITTZYQzljTDIxaGMzUmxjbU5oY21RdVkyOXRJaXdpYzJOdmNHVkVZWFJoSWpvaWUxd2lZWFYwYUZObGMzTnBiMjVKWkZ3aU9sd2lORFkwWmpJNVlqTXRZakUxTlMwMFlqWmtMV0UxTm1RdFl6QmxZMll6TmpjeU9EZ3pYQ0lzWENKemNtTkRiR2xsYm5SSlpGd2lPbHdpTVRNME16VXlPVFF0Wm1FMFpTMDBZV05pTFRobVpUWXRNRFZoWWpZMllqQTRPRGd4WENJc1hDSnpjbU5EYjNKeVpXeGhkR2x2Ymtsa1hDSTZYQ0psTlRsaU1tWmxZaTFrTVRRNUxUUmtaV0l0WVdKaE9DMHdPRGszWkRFMk1tRTROalJjSW4waUxDSmxlSEFpT2pFM05UZ3hOall5TlRRc0ltbGhkQ0k2TVRjMU9ERTJOVGsxTkN3aWFuUnBJam9pTUdRek1UUm1Oall0TUdVeE1pMDBZVGsyTFRrNU1tUXRNV0prWldObU16VXhNbVJoSW4wLlNVcTc1VnF6aGR6ZjFOUmxjaUtITWJLNkhoS2EtUzVKblpkVDlaYzZEaTFoWFppaGkwdUd0MDNJWXdTN3BGc3hMMUcxV3NJMTk4QVVmcWlGNWl0Yzl2elRESHByd3plb3pOd25lUVZhLTM3T0FvdFpKWUJIUXRCTnVrQ0ExWl80SEN5ZU0yeW1kaUNBQXJOaUZWcXpYeFhxdkNodmpHcWxUbnRCTEtwS0xGTUw5U1Vqd0czMTFyaDhQeWROUGVHU1AzTnljMGpGUTRJUk9hbzlnU3ZmMGRLdE90ajdab2h5VDNRZXRCa0ZrbXJGNWVZU0k0WFJVM3IyRXZCWTdNMGp5VUZZZWE3ZjhBdExpV3FKWFlHZEtNMU9CeE1kZWFSSlNxejZEaVR1RHFJSGNvdG9ZOWtqYUZISmhYWHJlbnpJVGRuX0I2cXQxOGEtbnRHWUUtck5KZw==",
  "authenticationSessionExpiry": "1758252354148",
  "headers": {
    "X-SRC-CX-FLOW-ID": "34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166854"
  }
}
```

> **Step 4:**   
>
> * The integrator launches or redirects the user to the Authentication UI URL.
> * Mastercard presents the 3DS challenge to the user.
> * Upon successful completion of the 3DS challenge, Mastercard prompts the user to create a passkey.
> * After the user completes all steps in the UI, Mastercard invokes the integrator's HTTPS callbackUri with the Base64-encoded authentication status.

**Launch UI and User Completes the Authentication**

    https://stage.src.mastercard.com/auth?sav=ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldNdGJtVjNMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgwTG5ObGMzTnBiMjVwWkY5MGIydGxiaUlzSW1Gc1p5STZJbEpUTWpVMkluMC5leUpoZFdRaU9pSm9kSFJ3Y3pwY0wxd3ZiV0Z6ZEdWeVkyRnlaQzVqYjIwaUxDSmpiMjV6ZFcxbGNrbGtJam9pTVRNME16VXlPVFF0Wm1FMFpTMDBZV05pTFRobVpUWXRNRFZoWWpZMllqQTRPRGd4SWl3aWFYTnpJam9pYUhSMGNITTZYQzljTDIxaGMzUmxjbU5oY21RdVkyOXRJaXdpYzJOdmNHVkVZWFJoSWpvaWUxd2lZWFYwYUZObGMzTnBiMjVKWkZ3aU9sd2lORFkwWmpJNVlqTXRZakUxTlMwMFlqWmtMV0UxTm1RdFl6QmxZMll6TmpjeU9EZ3pYQ0lzWENKemNtTkRiR2xsYm5SSlpGd2lPbHdpTVRNME16VXlPVFF0Wm1FMFpTMDBZV05pTFRobVpUWXRNRFZoWWpZMllqQTRPRGd4WENJc1hDSnpjbU5EYjNKeVpXeGhkR2x2Ymtsa1hDSTZYQ0psTlRsaU1tWmxZaTFrTVRRNUxUUmtaV0l0WVdKaE9DMHdPRGszWkRFMk1tRTROalJjSW4waUxDSmxlSEFpT2pFM05UZ3hOall5TlRRc0ltbGhkQ0k2TVRjMU9ERTJOVGsxTkN3aWFuUnBJam9pTUdRek1UUm1Oall0TUdVeE1pMDBZVGsyTFRrNU1tUXRNV0prWldObU16VXhNbVJoSW4wLlNVcTc1VnF6aGR6ZjFOUmxjaUtITWJLNkhoS2EtUzVKblpkVDlaYzZEaTFoWFppaGkwdUd0MDNJWXdTN3BGc3hMMUcxV3NJMTk4QVVmcWlGNWl0Yzl2elRESHByd3plb3pOd25lUVZhLTM3T0FvdFpKWUJIUXRCTnVrQ0ExWl80SEN5ZU0yeW1kaUNBQXJOaUZWcXpYeFhxdkNodmpHcWxUbnRCTEtwS0xGTUw5U1Vqd0czMTFyaDhQeWROUGVHU1AzTnljMGpGUTRJUk9hbzlnU3ZmMGRLdE90ajdab2h5VDNRZXRCa0ZrbXJGNWVZU0k0WFJVM3IyRXZCWTdNMGp5VUZZZWE3ZjhBdExpV3FKWFlHZEtNMU9CeE1kZWFSSlNxejZEaVR1RHFJSGNvdG9ZOWtqYUZISmhYWHJlbnpJVGRuX0I2cXQxOGEtbnRHWUUtck5KZw==&amp;traceId=34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166836

**HTTPS callbackUri**

    https://stage.mcsrcteststore.com/macstools/auth-processing?&res=eyJyZXN1bHQiOiJBVVRIRU5USUNBVElPTl9TVUNDRVNTIiwicmVxdWlyZUFkZGl0aW9uYWxBdXRoIjpmYWxzZSwiYXV0aGVudGljYXRpb25TZXNzaW9uSWQiOiJmYTY3Yjc4Yy1hMWZkLTQyYTQtYTg5MS1mZDdmODE1MDgxZmQifQ%3D%3D 

> **Step 5:** The Integrator calls the [Authenticate API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#AccountHolderAuthenticationsAuthenticateProfile).The response contains **proof of authentication `assuranceData`** , which includes:
> **Proof of EMV 3DS identity and validation**
> **Proof of passkey enrollment**

```json
{
  "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
  "srcCorrelationId": "e59b2feb-d149-4deb-aba8-0897d162a864",
  "srcDigitalCardId": "9ZtsqSdrQpikwY3aphMabg000000000000GB",
  "authenticationSessionId": "464f29b3-b155-4b6d-a56d-c0ecf3672883",
  "authenticationMethod": {
    "authenticationMethodType": "MANAGED_AUTHENTICATION",
    "authenticationSubject": "CARDHOLDER"
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166836"
  }
}
```

```json
{
  "srcCorrelationId": "e59b2feb-d149-4deb-aba8-0897d162a864",
  "authenticationSessionId": "464f29b3-b155-4b6d-a56d-c0ecf3672883",
  "authenticationResult": "AUTHENTICATED",
  "authenticationStatus": "COMPLETE",
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "01",
        "verificationResults": "01",
        "verificationTimestamp": "1758166014024",
        "verificationEvents": [
          "02"
        ],
        "additionalData": "ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldNdGJtVjNMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgwTG1OaGNtUmZkRzlyWlc0aUxDSmhiR2NpT2lKU1V6STFOaUo5LmV5SmhkV1FpT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKallYSmtTV1FpT2lJNVduUnpjVk5rY2xGd2FXdDNXVE5oY0doTllXSm5NREF3TURBd01EQXdNREF3UjBJaUxDSnBjM01pT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKamIzSnlaV3hoZEdsdmJrbGtJam9pWlRVNVlqSm1aV0l0WkRFME9TMDBaR1ZpTFdGaVlUZ3RNRGc1TjJReE5qSmhPRFkwSWl3aWMyTnZjR1ZFWVhSaElqb2llMXdpWVhWMGFGTmxjM05wYjI1SlpGd2lPbHdpTURKbFpEQm1aR1l0TVRWa015MDBPR1ExTFRnd01qa3RORGsxWkRCak9UZ3dORFpsWENJc1hDSmhkWFJvWlc1MGFXTmhkR2x2YmxKbGMzVnNkRndpT2x3aVFWVlVTRVZPVkVsRFFWUkZSRndpTEZ3aVlYVjBhR1Z1ZEdsallYUnBiMjVOWlhSb2IyUmNJanBjSWpORVUxd2lMRndpZEdoeVpXVkVjMUJCVm1WeWFXWnBaV1JjSWpwY0luUnlkV1ZjSWl4Y0ltTmxjblJwWm1sbFpFMW1ZVTFsZEdodlpFbGtYQ0k2WENJek1EQXdNVndpTEZ3aVlYVjBhR1Z1ZEdsallYUnBiMjVVYVcxbFhDSTZYQ0l4TnpVNE1UWTJNREUwTURJMFhDSXNYQ0p6Y21ORGJHbGxiblJKWkZ3aU9sd2lNVE0wTXpVeU9UUXRabUUwWlMwMFlXTmlMVGhtWlRZdE1EVmhZalkyWWpBNE9EZ3hYQ0lzWENKaGRYUm9aVzUwYVdOaGRHbHZibEpsWVhOdmJuTmNJanBiWENKRlRsSlBURjlHU1U1QlRrTkpRVXhmU1U1VFZGSlZUVVZPVkZ3aVhYMGlMQ0p6WTI5d1pYTWlPbHNpVkU5TFJVNWZRa2xPUkNKZExDSmxlSEFpT2pFM05UZ3hOall6TVRRc0ltbGhkQ0k2TVRjMU9ERTJOakF4TkN3aWFuUnBJam9pTW1KaE9EQmpNamN0WVRBME5TMDBZakJqTFdKaVlqSXROV1U0WldVeVpqZzJZMlkxSW4wLnAyN3pBM3o1bDQ4ZmVEd0ZySFNoTmdOdVY1X000N3VJVGVWc2tIcnlDNVhOQmxWSjVFWlA1RVVpTU5BNFN0TVZSN2FPOEctbi1VV0xvMlpDSzEtS1JSM18xek9jUS1rNmVtM21JYUJPNEhEOU5vOTFpNFY1LWhUb0lnUVFlMzJWSGFHaWVRTDlPZmp4amlYdjd1NHd5bHdSOFNuTkR1c2FlUnR5SkVjM0VlNXlOTmJNMXZzMjBLRW9ZWXBndFdrdXJqTVB2bENsQnlRb2dNYVJUS2txS2dYVjZSZS10aFdaWElWOTJmMTc2Mk9RMWpkRDhoYl9hNC01ampOLXJuMXhCd0tDalJkVGJXU1haSWZBSWZyOVdITWhmS3RoUS1iMWRXLW9KSndiS0ZyWVFTd2toa21tb1F3ci1KblFXTlJqZmZTaVJNTDFFOVFzb29faHhjdjZmdw=="
      },
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "02",
        "verificationMethod": "07",
        "verificationResults": "01",
        "verificationTimestamp": "1758166014038",
        "verificationEvents": [
          "64"
        ],
        "additionalData": "eyJ0eXBlIjoiRklETzIiLCJjZXJ0aWZpZWRNZmFNZXRob2RJZCI6IjIwMDAxIiwibWZhTWV0aG9kSW5zdGFuY2VJZCI6IlhhMjVpRUtHUjlxLWFtTWtSQWhkSEEwMDAwMDAwMDAwMTBVUyIsImFzc2VydGlvbiI6ImV5SnJhV1FpT2lJeU1ESXpNREV5TmpFeE5ETTBOUzF6ZEdjdGJXTXRibVYzTFdsa1pXNTBhWFI1TFhabGNtbG1hV05oZEdsdmJpMXpjbU10YldGemRHVnlZMkZ5WkMxcGJuUWlMQ0owZVhBaU9pSktWMVFyWlhoMExtTmhjbVJmZEc5clpXNGlMQ0poYkdjaU9pSlNVekkxTmlKOS5leUpoZFdRaU9pSm9kSFJ3Y3pwY0wxd3ZiV0Z6ZEdWeVkyRnlaQzVqYjIwaUxDSmpZWEprU1dRaU9pSTVXblJ6Y1ZOa2NsRndhV3QzV1ROaGNHaE5ZV0puTURBd01EQXdNREF3TURBd1IwSWlMQ0pwYzNNaU9pSm9kSFJ3Y3pwY0wxd3ZiV0Z6ZEdWeVkyRnlaQzVqYjIwaUxDSmpiM0p5Wld4aGRHbHZia2xrSWpvaVpUVTVZakptWldJdFpERTBPUzAwWkdWaUxXRmlZVGd0TURnNU4yUXhOakpoT0RZMElpd2ljMk52Y0dWRVlYUmhJam9pZTF3aVlYVjBhRk5sYzNOcGIyNUpaRndpT2x3aU56TmxOREkzWXpNdFptUXlNeTAwTWpRekxUbGtaV0l0TnpReE1XUmxPV1k1WVdKa1hDSXNYQ0poZFhSb1pXNTBhV05oZEdsdmJsSmxjM1ZzZEZ3aU9sd2lRVlZVU0VWT1ZFbERRVlJGUkZ3aUxGd2lZWFYwYUdWdWRHbGpZWFJwYjI1TlpYUm9iMlJjSWpwY0lrWkpSRTh5WENJc1hDSmpaWEowYVdacFpXUk5abUZOWlhSb2IyUkpaRndpT2x3aU1qQXdNREZjSWl4Y0ltRjFkR2hsYm5ScFkyRjBhVzl1VkdsdFpWd2lPbHdpTVRjMU9ERTJOakF4TkRBek9Gd2lMRndpYzNKalEyeHBaVzUwU1dSY0lqcGNJakV6TkRNMU1qazBMV1poTkdVdE5HRmpZaTA0Wm1VMkxUQTFZV0kyTm1Jd09EZzRNVndpTEZ3aVlYVjBhR1Z1ZEdsallYUnBiMjVTWldGemIyNXpYQ0k2VzF3aVJVNVNUMHhNWDBaSlRrRk9RMGxCVEY5SlRsTlVVbFZOUlU1VVhDSmRmU0lzSW5OamIzQmxjeUk2V3lKVVQwdEZUbDlDU1U1RUlsMHNJbVY0Y0NJNk1UYzFPREUyTmpNeE5Dd2lhV0YwSWpveE56VTRNVFkyTURFMExDSnFkR2tpT2lKbE5EVmlNelZpWWkxaFpHWmlMVFE0T0dZdE9XSmtOaTA1T0RJd016YzVOVFE1T1dJaWZRLk9HazR3MlNzSHM4MkNUaEp6QVk5bGhOZVI0Ry1Tak5QTTBBOXlxREpwUWtiYWlIelE3OUFVdWQ3SVc4RUU1bW1MeW5iUE5TVkRsam45M0gwMFJqZ3g0cl9MZzhIaF9tNGpmSEZHbVZlTFdGMzZ1dC1wV1F0d0szVUFFN0hxbWU5SWlqMzJQMFdGdzF0Wm8wSGxhcnl2NzhCZVZvQzVDMHBjS1FXNG9XTDNrMExreHI0cUhKNGpYV3FHUVc3a0ZlTlM5NU9qWVIwd3cyYVdreC15aW5fbTR0enM0Ui1vVDI0SlZ5SGVsZ2RsQ05wOHBsQlRidThoaERVZW1DMGtBb1FQeUlraDZLVVFkam9WTGhpVEFSTk5fVk1tMldBTF80aWhYLVVkckt0Q3RtTkxaUG5JY2xCdHNVQ0RLdTN3clVzcExVQVN4YU5OLVlXYUItZmZEYWl0dyJ9"
      }
    ]
  },
  "headers": {
    "X-SRC-CX-FLOW-ID": "34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166914"
  }
}
```

## Scenario 10 {#scenario-10}

**Assumptions**

* The integrator is onboarded to the **Mastercard Card Checkout Solutions -- Secure Card on File** program and authorized to make API calls.
* The **test card's country and issuer** are configured to be **eligible for Mastercard FIDO**.
* The client is **associated with the required Mastercard FIDO configuration**.
* The **issuer's country** is **enabled for 3-D Secure (3DS)** .   

**When**   
> On Integrator's website, user logs into the account and chooses a card for checkout, Integrator calls the [GET /cards/{cardId}](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) API to fetch the card details.

**Then**   
> **Step 1:** Mastercard responds with a response code of `200`, along with `srcDigitalCardId`, `maskedCard` and `digitalCardData`.

```json
{
  "srcCorrelationId": "ff97ef9b-4b1e-40c2-b522-42197061dc5a",
  "maskedCard": {
    "srcDigitalCardId": "9ajNArkAR66zqYyHCn0rCA000000000000US",
    "panBin": "512034",
    "panLastFour": "0747",
    "tokenUniqueReference": "DM4MMC1US000000013a3b395556c420e85bfebe54b219e36",
    "digitalCardData": {
      "status": "ACTIVE",
      "descriptorName": "MasterCard Test Bank",
      "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
      "pendingEvents": [
        "PENDING_SCA"
      ],
      "isCoBranded": "false",
      "authenticationMethods": [
        {
          "authenticationMethodType": "3DS",
          "authenticationSubject": "CARDHOLDER",
          "uriData": {
            "uri": "https://stage.src.mastercard.com/auth",
            "uriType": "WEB_URI"
          }
        },
        {
          "authenticationMethodType": "MANAGED_AUTHENTICATION",
          "authenticationSubject": "CARDHOLDER",
          "uriData": {
            "uri": "https://stage.src.mastercard.com/auth",
            "uriType": "WEB_URI"
          }
        }
      ]
    },
    "panExpirationMonth": "12",
    "panExpirationYear": "2024",
    "paymentCardType": "CREDIT",
    "serviceId": "SECURE_COF_COMMERCE_PLATFORM#E2E#01",
    "paymentAccountReference": "50015018T6JE5ZORJON0QTP9HHMYN",
    "dateOfCardCreated": "2024-10-03T14:29:30.685Z"
  },
  "maskedConsumer": {
    "srcConsumerId": "a7c53e04-dae7-4da0-9b4a-b3d8e8399ebb",
    "maskedConsumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "maskedIdentityValue": "f0c04b97-4dcb-485d-a4f4-7ae437a2e955"
    },
    "status": "ACTIVE",
    "dateConsumerAdded": "2024-10-03T14:29:27.441Z"
  }
}
```

> **Step 2:** Integrator calls [Lookup Authentication Method API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#lookupAccountHolderAuthenticationProfile) with `authenticationReasons` and receives **MANAGED_AUTHENTICATION** as an eligible method in response.

```json
{
  "srcDigitalCardId": "PLReJE1YR3KvC3jSgxP7Mg000000000000AR",
  "srcCorrelationId": "8e280f17-bdae-4b9f-8ff5-799d78d12776",
  "serviceId": " SECURE_COF_COMMERCE_PLATFORM#START_API_STG#01",
  "srcClientId": "5a9f8c51-7ad1-40c6-b828-b7437b9334f6",
  "authenticationContext": {
    "authenticationReasons": [
      "CONSUMER_IDENTITY_VALIDATION"
    ]
  }
}
```

```json
{
  "srcCorrelationId": "8e280f17-bdae-4b9f-8ff5-799d78d12776",
  "authenticationMethods": [
    {
      "authenticationMethodType": "MANAGED_AUTHENTICATION",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "CONSUMER_IDENTITY_VALIDATION"
      ],
      "uriData": {},
      "authenticators": []
    }
  ]
}
```

> **Step 3:** Integrator calls [Authenticate API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#AccountHolderAuthenticationsAuthenticateProfile) and receives the Authentication UI URL to launch the challenge.

```json
{
  "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
  "srcCorrelationId": "e59b2feb-d149-4deb-aba8-0897d162a864",
  "srcDigitalCardId": "9ZtsqSdrQpikwY3aphMabg000000000000GB",
  "authenticationMethod": {
    "authenticationMethodType": "MANAGED_AUTHENTICATION",
    "authenticationSubject": "CARDHOLDER"
  },
  "authenticationContext": {
    "authenticationReasons": [
      "CONSUMER_IDENTITY_VALIDATION"
    ],
    "dpaTransactionOptions": {
      "threeDsInputData": {
        "forceChallenge": false
      },
      "dpaLocale": "en_AE"
    },
    "callbackUri": {
      "uri": "https://eta-macs-test-tools.apps.stl.pcfstage00.mastercard.int/macstools/auth-processing?clientSessionId=1153f001-58a3-4183-b91b-9942c5365406",
      "uriType": "WEB_URI"
    }
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166836"
  }
}
```

```json
{
  "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
  "srcCorrelationId": "e59b2feb-d149-4deb-aba8-0897d162a864",
  "srcDigitalCardId": "9ZtsqSdrQpikwY3aphMabg000000000000GB",
  "authenticationMethod": {
    "authenticationMethodType": "MANAGED_AUTHENTICATION",
    "authenticationSubject": "CARDHOLDER"
  },
  "authenticationContext": {
    "authenticationReasons": [
      "CONSUMER_IDENTITY_VALIDATION"
    ],
    "dpaTransactionOptions": {
      "threeDsInputData": {
        "forceChallenge": false
      },
      "dpaLocale": "en_AE"
    },
    "callbackUri": {
      "uri": "https://eta-macs-test-tools.apps.stl.pcfstage00.mastercard.int/macstools/auth-processing?clientSessionId=1153f001-58a3-4183-b91b-9942c5365406",
      "uriType": "WEB_URI"
    }
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166836"
  }
}
```

> **Step 4:**   
>
> * The integrator launches or redirects the user to the Authentication UI URL.
> * Mastercard presents the 3DS challenge to the user.
> * Upon successful completion of the 3DS challenge, Mastercard prompts the user to create a passkey.
> * After the user completes all steps in the UI, Mastercard invokes the integrator's HTTPS callbackUri with the Base64-encoded authentication status.

**Launch UI and User Completes the Authentication**

    https://stage.src.mastercard.com/auth?sav=ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldNdGJtVjNMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgwTG5ObGMzTnBiMjVwWkY5MGIydGxiaUlzSW1Gc1p5STZJbEpUTWpVMkluMC5leUpoZFdRaU9pSm9kSFJ3Y3pwY0wxd3ZiV0Z6ZEdWeVkyRnlaQzVqYjIwaUxDSmpiMjV6ZFcxbGNrbGtJam9pTVRNME16VXlPVFF0Wm1FMFpTMDBZV05pTFRobVpUWXRNRFZoWWpZMllqQTRPRGd4SWl3aWFYTnpJam9pYUhSMGNITTZYQzljTDIxaGMzUmxjbU5oY21RdVkyOXRJaXdpYzJOdmNHVkVZWFJoSWpvaWUxd2lZWFYwYUZObGMzTnBiMjVKWkZ3aU9sd2lORFkwWmpJNVlqTXRZakUxTlMwMFlqWmtMV0UxTm1RdFl6QmxZMll6TmpjeU9EZ3pYQ0lzWENKemNtTkRiR2xsYm5SSlpGd2lPbHdpTVRNME16VXlPVFF0Wm1FMFpTMDBZV05pTFRobVpUWXRNRFZoWWpZMllqQTRPRGd4WENJc1hDSnpjbU5EYjNKeVpXeGhkR2x2Ymtsa1hDSTZYQ0psTlRsaU1tWmxZaTFrTVRRNUxUUmtaV0l0WVdKaE9DMHdPRGszWkRFMk1tRTROalJjSW4waUxDSmxlSEFpT2pFM05UZ3hOall5TlRRc0ltbGhkQ0k2TVRjMU9ERTJOVGsxTkN3aWFuUnBJam9pTUdRek1UUm1Oall0TUdVeE1pMDBZVGsyTFRrNU1tUXRNV0prWldObU16VXhNbVJoSW4wLlNVcTc1VnF6aGR6ZjFOUmxjaUtITWJLNkhoS2EtUzVKblpkVDlaYzZEaTFoWFppaGkwdUd0MDNJWXdTN3BGc3hMMUcxV3NJMTk4QVVmcWlGNWl0Yzl2elRESHByd3plb3pOd25lUVZhLTM3T0FvdFpKWUJIUXRCTnVrQ0ExWl80SEN5ZU0yeW1kaUNBQXJOaUZWcXpYeFhxdkNodmpHcWxUbnRCTEtwS0xGTUw5U1Vqd0czMTFyaDhQeWROUGVHU1AzTnljMGpGUTRJUk9hbzlnU3ZmMGRLdE90ajdab2h5VDNRZXRCa0ZrbXJGNWVZU0k0WFJVM3IyRXZCWTdNMGp5VUZZZWE3ZjhBdExpV3FKWFlHZEtNMU9CeE1kZWFSSlNxejZEaVR1RHFJSGNvdG9ZOWtqYUZISmhYWHJlbnpJVGRuX0I2cXQxOGEtbnRHWUUtck5KZw==&amp;traceId=34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166836 

**HTTPS callbackUri**

    https://stage.mcsrcteststore.com/macstools/auth-processing?&res=eyJyZXN1bHQiOiJBVVRIRU5USUNBVElPTl9TVUNDRVNTIiwicmVxdWlyZUFkZGl0aW9uYWxBdXRoIjpmYWxzZSwiYXV0aGVudGljYXRpb25TZXNzaW9uSWQiOiJmYTY3Yjc4Yy1hMWZkLTQyYTQtYTg5MS1mZDdmODE1MDgxZmQifQ%3D%3D 

> **Step 5:** The Integrator calls the [Authenticate API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#AccountHolderAuthenticationsAuthenticateProfile).The response contains **proof of authentication `assuranceData`** , which includes:
> **Proof of EMV 3DS identity and validation**
> **Proof of passkey enrollment**

```json
{
  "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
  "srcCorrelationId": "e59b2feb-d149-4deb-aba8-0897d162a864",
  "srcDigitalCardId": "9ZtsqSdrQpikwY3aphMabg000000000000GB",
  "authenticationSessionId": "464f29b3-b155-4b6d-a56d-c0ecf3672883",
  "authenticationMethod": {
    "authenticationMethodType": "MANAGED_AUTHENTICATION",
    "authenticationSubject": "CARDHOLDER"
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166836"
  }
}
```

```json
{
  "srcCorrelationId": "e59b2feb-d149-4deb-aba8-0897d162a864",
  "authenticationSessionId": "464f29b3-b155-4b6d-a56d-c0ecf3672883",
  "authenticationResult": "AUTHENTICATED",
  "authenticationStatus": "COMPLETE",
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "01",
        "verificationResults": "01",
        "verificationTimestamp": "1758166014024",
        "verificationEvents": ["02"],
        "additionalData": "ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldNdGJtVjNMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgwTG1OaGNtUmZkRzlyWlc0aUxDSmhiR2NpT2lKU1V6STFOaUo5LmV5SmhkV1FpT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKallYSmtTV1FpT2lJNVduUnpjVk5rY2xGd2FXdDNXVE5oY0doTllXSm5NREF3TURBd01EQXdNREF3UjBJaUxDSnBjM01pT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKamIzSnlaV3hoZEdsdmJrbGtJam9pWlRVNVlqSm1aV0l0WkRFME9TMDBaR1ZpTFdGaVlUZ3RNRGc1TjJReE5qSmhPRFkwSWl3aWMyTnZjR1ZFWVhSaElqb2llMXdpWVhWMGFGTmxjM05wYjI1SlpGd2lPbHdpTURKbFpEQm1aR1l0TVRWa015MDBPR1ExTFRnd01qa3RORGsxWkRCak9UZ3dORFpsWENJc1hDSmhkWFJvWlc1MGFXTmhkR2x2YmxKbGMzVnNkRndpT2x3aVFWVlVTRVZPVkVsRFFWUkZSRndpTEZ3aVlYVjBhR1Z1ZEdsallYUnBiMjVOWlhSb2IyUmNJanBjSWpORVUxd2lMRndpZEdoeVpXVkVjMUJCVm1WeWFXWnBaV1JjSWpwY0luUnlkV1ZjSWl4Y0ltTmxjblJwWm1sbFpFMW1ZVTFsZEdodlpFbGtYQ0k2WENJek1EQXdNVndpTEZ3aVlYVjBhR1Z1ZEdsallYUnBiMjVVYVcxbFhDSTZYQ0l4TnpVNE1UWTJNREUwTURJMFhDSXNYQ0p6Y21ORGJHbGxiblJKWkZ3aU9sd2lNVE0wTXpVeU9UUXRabUUwWlMwMFlXTmlMVGhtWlRZdE1EVmhZalkyWWpBNE9EZ3hYQ0lzWENKaGRYUm9aVzUwYVdOaGRHbHZibEpsWVhOdmJuTmNJanBiWENKRlRsSlBURjlHU1U1QlRrTkpRVXhmU1U1VFZGSlZUVVZPVkZ3aVhYMGlMQ0p6WTI5d1pYTWlPbHNpVkU5TFJVNWZRa2xPUkNKZExDSmxlSEFpT2pFM05UZ3hOall6TVRRc0ltbGhkQ0k2TVRjMU9ERTJOakF4TkN3aWFuUnBJam9pTW1KaE9EQmpNamN0WVRBME5TMDBZakJqTFdKaVlqSXROV1U0WldVeVpqZzJZMlkxSW4wLnAyN3pBM3o1bDQ4ZmVEd0ZySFNoTmdOdVY1X000N3VJVGVWc2tIcnlDNVhOQmxWSjVFWlA1RVVpTU5BNFN0TVZSN2FPOEctbi1VV0xvMlpDSzEtS1JSM18xek9jUS1rNmVtM21JYUJPNEhEOU5vOTFpNFY1LWhUb0lnUVFlMzJWSGFHaWVRTDlPZmp4amlYdjd1NHd5bHdSOFNuTkR1c2FlUnR5SkVjM0VlNXlOTmJNMXZzMjBLRW9ZWXBndFdrdXJqTVB2bENsQnlRb2dNYVJUS2txS2dYVjZSZS10aFdaWElWOTJmMTc2Mk9RMWpkRDhoYl9hNC01ampOLXJuMXhCd0tDalJkVGJXU1haSWZBSWZyOVdITWhmS3RoUS1iMWRXLW9KSndiS0ZyWVFTd2toa21tb1F3ci1KblFXTlJqZmZTaVJNTDFFOVFzb29faHhjdjZmdw=="
      },
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "02",
        "verificationMethod": "07",
        "verificationResults": "01",
        "verificationTimestamp": "1758166014038",
        "verificationEvents": ["64"],
        "additionalData": "eyJ0eXBlIjoiRklETzIiLCJjZXJ0aWZpZWRNZmFNZXRob2RJZCI6IjIwMDAxIiwibWZhTWV0aG9kSW5zdGFuY2VJZCI6IlhhMjVpRUtHUjlxLWFtTWtSQWhkSEEwMDAwMDAwMDAwMTBVUyIsImFzc2VydGlvbiI6ImV5SnJhV1FpT2lJeU1ESXpNREV5TmpFeE5ETTBOUzF6ZEdjdGJXTXRibVYzTFdsa1pXNTBhWFI1TFhabGNtbG1hV05oZEdsdmJpMXpjbU10YldGemRHVnlZMkZ5WkMxcGJuUWlMQ0owZVhBaU9pSktWMVFyWlhoMExtTmhjbVJmZEc5clpXNGlMQ0poYkdjaU9pSlNVekkxTmlKOS5leUpoZFdRaU9pSm9kSFJ3Y3pwY0wxd3ZiV0Z6ZEdWeVkyRnlaQzVqYjIwaUxDSmpZWEprU1dRaU9pSTVXblJ6Y1ZOa2NsRndhV3QzV1ROaGNHaE5ZV0puTURBd01EQXdNREF3TURBd1IwSWlMQ0pwYzNNaU9pSm9kSFJ3Y3pwY0wxd3ZiV0Z6ZEdWeVkyRnlaQzVqYjIwaUxDSmpiM0p5Wld4aGRHbHZia2xrSWpvaVpUVTVZakptWldJdFpERTBPUzAwWkdWaUxXRmlZVGd0TURnNU4yUXhOakpoT0RZMElpd2ljMk52Y0dWRVlYUmhJam9pZTF3aVlYVjBhRk5sYzNOcGIyNUpaRndpT2x3aU56TmxOREkzWXpNdFptUXlNeTAwTWpRekxUbGtaV0l0TnpReE1XUmxPV1k1WVdKa1hDSXNYQ0poZFhSb1pXNTBhV05oZEdsdmJsSmxjM1ZzZEZ3aU9sd2lRVlZVU0VWT1ZFbERRVlJGUkZ3aUxGd2lZWFYwYUdWdWRHbGpZWFJwYjI1TlpYUm9iMlJjSWpwY0lrWkpSRTh5WENJc1hDSmpaWEowYVdacFpXUk5abUZOWlhSb2IyUkpaRndpT2x3aU1qQXdNREZjSWl4Y0ltRjFkR2hsYm5ScFkyRjBhVzl1VkdsdFpWd2lPbHdpTVRjMU9ERTJOakF4TkRBek9Gd2lMRndpYzNKalEyeHBaVzUwU1dSY0lqcGNJakV6TkRNMU1qazBMV1poTkdVdE5HRmpZaTA0Wm1VMkxUQTFZV0kyTm1Jd09EZzRNVndpTEZ3aVlYVjBhR1Z1ZEdsallYUnBiMjVTWldGemIyNXpYQ0k2VzF3aVJVNVNUMHhNWDBaSlRrRk9RMGxCVEY5SlRsTlVVbFZOUlU1VVhDSmRmU0lzSW5OamIzQmxjeUk2V3lKVVQwdEZUbDlDU1U1RUlsMHNJbVY0Y0NJNk1UYzFPREUyTmpNeE5Dd2lhV0YwSWpveE56VTRNVFkyTURFMExDSnFkR2tpT2lKbE5EVmlNelZpWWkxaFpHWmlMVFE0T0dZdE9XSmtOaTA1T0RJd016YzVOVFE1T1dJaWZRLk9HazR3MlNzSHM4MkNUaEp6QVk5bGhOZVI0Ry1Tak5QTTBBOXlxREpwUWtiYWlIelE3OUFVdWQ3SVc4RUU1bW1MeW5iUE5TVkRsam45M0gwMFJqZ3g0cl9MZzhIaF9tNGpmSEZHbVZlTFdGMzZ1dC1wV1F0d0szVUFFN0hxbWU5SWlqMzJQMFdGdzF0Wm8wSGxhcnl2NzhCZVZvQzVDMHBjS1FXNG9XTDNrMExreHI0cUhKNGpYV3FHUVc3a0ZlTlM5NU9qWVIwd3cyYVdreC15aW5fbTR0enM0Ui1vVDI0SlZ5SGVsZ2RsQ05wOHBsQlRidThoaERVZW1DMGtBb1FQeUlraDZLVVFkam9WTGhpVEFSTk5fVk1tMldBTF80aWhYLVVkckt0Q3RtTkxaUG5JY2xCdHNVQ0RLdTN3clVzcExVQVN4YU5OLVlXYUItZmZEYWl0dyJ9"
      }
    ]
  },
  "headers": {
    "X-SRC-CX-FLOW-ID": "34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166914"
  }
}
```

## Scenario 11 {#scenario-11}

**Assumptions**   

* The integrator is onboarded to the **Mastercard Card Checkout Solutions -- Secure Card on File** program and authorized to make API calls.
* The **test card's country and issuer** are configured to be **eligible for Mastercard FIDO**.
* The client is **associated with the required Mastercard FIDO configuration**.
* The **issuer's country** is **enabled for 3-D Secure (3DS)** .   

**When**   
> On Integrator's website, user logs into the account and chooses a card on file to initiate checkout.

**Then**   
> **Step 1:** Integrator calls [Lookup Authentication Method API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#lookupAccountHolderAuthenticationProfile) with `authenticationReasons` and receives **MANAGED_AUTHENTICATION** as an eligible method in response.

```json
{
  "srcDigitalCardId": "PLReJE1YR3KvC3jSgxP7Mg000000000000AR",
  "srcCorrelationId": "8e280f17-bdae-4b9f-8ff5-799d78d12776",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_API_STG#01",
  "srcClientId": "5a9f8c51-7ad1-40c6-b828-b7437b9334f6",
  "authenticationContext": {
    "authenticationReasons": [
      "TRANSACTION_AUTHENTICATION"
    ]
  }
}
```

```json
{
  "srcCorrelationId": "8e280f17-bdae-4b9f-8ff5-799d78d12776",
  "authenticationMethods": [
    {
      "authenticationMethodType": "MANAGED_AUTHENTICATION",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "TRANSACTION_AUTHENTICATION"
      ],
      "uriData": {},
      "authenticators": []
    }
  ]
}
```

> **Step 2:** Integrator calls [Authenticate API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#AccountHolderAuthenticationsAuthenticateProfile) and receives the Authentication UI URL to launch the challenge.

```json
{
  "srcClientId": "5e0d4b84-189d-4c86-822d-590602f62062",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#DOCUMENTATION-UPN2#01",
  "srcCorrelationId": "ddc1a2da-3b46-4cee-ae67-1917d96b3fcf",
  "srcDigitalCardId": "0aqiyTxvQJ2JpjSuS4CxLA000000000000BR",
  "authenticationMethod": {
    "authenticationMethodType": "MANAGED_AUTHENTICATION",
    "authenticationSubject": "CARDHOLDER"
  },
  "authenticationContext": {
    "authenticationReasons": [
      "TRANSACTION_AUTHENTICATION"
    ],
    "dpaData": {
      "dpaPresentationName": "Mastercard MTT Integrated - DPA 3 COF",
      "dpaName": "dpa3_of_MTT Integrated SRCI COF",
      "acquirerId": "SRC3DS",
      "acquirerBin": "545301"
    },
    "dpaTransactionOptions": {
      "transactionAmount": {
        "transactionAmount": 12.12,
        "transactionCurrencyCode": "USD"
      },
      "merchantName": "START",
      "merchantCategoryCode": "0001",
      "merchantCountryCode": "840",
      "threeDsInputData": {
        "forceChallenge": false,
        "billingAddress": {}
      },
      "dpaLocale": "en_AE"
    },
    "consumerDeviceData": {
      "appInstanceId": "44288ab1-10e6-445a-8749-132e2fe76f3d",
      "spcEnabled": false
    },
    "callbackUri": {
      "uri": "https://stage.mcsrcteststore.com/macstools/auth-processing?clientSessionId=d38227f8-6d20-4d0a-8619-68dbab8f6847",
      "uriType": "WEB_URI"
    }
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.812f4db0-3456-4573-a266-e5ac5105a1f0.1758681884"
  }
}
```

```json
{
  "srcCorrelationId": "ddc1a2da-3b46-4cee-ae67-1917d96b3fcf",
  "authenticationSessionId": "7949c27e-883a-4100-a605-e0ac3f2ced6f",
  "authenticationResult": "NOT_AUTHENTICATED",
  "authenticationStatus": "PENDING",
  "methodAttributes": {
    "uriData": {
      "uri": "https://sandbox.src.mastercard.com/auth?sav=ZXlKcmFXUWlPaUl5TURJek1ESXdPREE0TlRFMU55MXpZVzVrWW05NExXbGtaVzUwYVhSNUxYWmxjbWxtYVdOaGRHbHZiaTF6Y21NdGJXRnpkR1Z5WTJGeVpDMXBiblFpTENKMGVYQWlPaUpLVjFRclpYaDBMbk5sYzNOcGIyNXBaRjkwYjJ0bGJpSXNJbUZzWnlJNklsSlRNalUySW4wLmV5SmhkV1FpT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKamIyNXpkVzFsY2tsa0lqb2lOV1V3WkRSaU9EUXRNVGc1WkMwMFl6ZzJMVGd5TW1RdE5Ua3dOakF5WmpZeU1EWXlJaXdpYVhOeklqb2lhSFIwY0hNNlhDOWNMMjFoYzNSbGNtTmhjbVF1WTI5dElpd2ljMk52Y0dWRVlYUmhJam9pZTF3aVlYVjBhRk5sYzNOcGIyNUpaRndpT2x3aU56azBPV015TjJVdE9EZ3pZUzAwTVRBd0xXRTJNRFV0WlRCaFl6Tm1NbU5sWkRabVhDSXNYQ0p6Y21ORGJHbGxiblJKWkZ3aU9sd2lOV1V3WkRSaU9EUXRNVGc1WkMwMFl6ZzJMVGd5TW1RdE5Ua3dOakF5WmpZeU1EWXlYQ0lzWENKemNtTkRiM0p5Wld4aGRHbHZia2xrWENJNlhDSmtaR014WVRKa1lTMHpZalEyTFRSalpXVXRZV1UyTnkweE9URTNaRGsyWWpObVkyWmNJbjBpTENKbGVIQWlPakUzTlRnMk9ERXpNVElzSW1saGRDSTZNVGMxT0RZNE1UQXhNaXdpYW5ScElqb2lPVGcyTlRFME9HSXRNR1k0T1MwMFlUZGpMVGd4WVdJdE1ETmxNMk5pTnpFeE9XVmpJbjAuRUpGVG4td3FmWDdVQzI2LVA1Sk1abmxJZ2lKV2dRcGMxaHl4UGl0dy1kbmJLVTAzemRoVmlZeUpzSmFTRXVTX0dYMmt0bXFEY1J1QVRobHpwZVp2dkFIQTRzaktFMlJDakJ1cmJBd2VNZEcyeVpiMmRrZGIwQ3hBdkFTVVBLV09VbF9LY1gwbFVLT0RNalI1OEJPdjdlLW11RjRDOWllRmZqbDRQd3NmQXpqRGpHT0dGNjNjc3YwM0dCWjFDOU5fQzRSRm53R29Ib0JFTnAxbXVxTlk1Q2VfWFpVaXJWUXVOSVlFVG5YdFFtblJGM3l4dWpMVmNNeFZzLUJiMmhOWUd5U3pRVzAxUFo1ZVRIdEtCdWxEVWlHMHU3U1NlT2FseTdxUDAzS1pRRkptSFlCdmRKUFY3d2J2bXVPYzR1UVlXeXVZWG9LTXAtQjRaWjROelN5Tm1n&amp;traceId=34f4a04b.812f4db0-3456-4573-a266-e5ac5105a1f0.1758681884",
      "uriType": "WEB_URI"
    }
  },
  "sessionAssuranceValue": "ZXlKcmFXUWlPaUl5TURJek1ESXdPREE0TlRFMU55MXpZVzVrWW05NExXbGtaVzUwYVhSNUxYWmxjbWxtYVdOaGRHbHZiaTF6Y21NdGJXRnpkR1Z5WTJGeVpDMXBiblFpTENKMGVYQWlPaUpLVjFRclpYaDBMbk5sYzNOcGIyNXBaRjkwYjJ0bGJpSXNJbUZzWnlJNklsSlRNalUySW4wLmV5SmhkV1FpT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKamIyNXpkVzFsY2tsa0lqb2lOV1V3WkRSaU9EUXRNVGc1WkMwMFl6ZzJMVGd5TW1RdE5Ua3dOakF5WmpZeU1EWXlJaXdpYVhOeklqb2lhSFIwY0hNNlhDOWNMMjFoYzNSbGNtTmhjbVF1WTI5dElpd2ljMk52Y0dWRVlYUmhJam9pZTF3aVlYVjBhRk5sYzNOcGIyNUpaRndpT2x3aU56azBPV015TjJVdE9EZ3pZUzAwTVRBd0xXRTJNRFV0WlRCaFl6Tm1NbU5sWkRabVhDSXNYQ0p6Y21ORGJHbGxiblJKWkZ3aU9sd2lOV1V3WkRSaU9EUXRNVGc1WkMwMFl6ZzJMVGd5TW1RdE5Ua3dOakF5WmpZeU1EWXlYQ0lzWENKemNtTkRiM0p5Wld4aGRHbHZia2xrWENJNlhDSmtaR014WVRKa1lTMHpZalEyTFRSalpXVXRZV1UyTnkweE9URTNaRGsyWWpObVkyWmNJbjBpTENKbGVIQWlPakUzTlRnMk9ERXpNVElzSW1saGRDSTZNVGMxT0RZNE1UQXhNaXdpYW5ScElqb2lPVGcyTlRFME9HSXRNR1k0T1MwMFlUZGpMVGd4WVdJdE1ETmxNMk5pTnpFeE9XVmpJbjAuRUpGVG4td3FmWDdVQzI2LVA1Sk1abmxJZ2lKV2dRcGMxaHl4UGl0dy1kbmJLVTAzemRoVmlZeUpzSmFTRXVTX0dYMmt0bXFEY1J1QVRobHpwZVp2dkFIQTRzaktFMlJDakJ1cmJBd2VNZEcyeVpiMmRrZGIwQ3hBdkFTVVBLV09VbF9LY1gwbFVLT0RNalI1OEJPdjdlLW11RjRDOWllRmZqbDRQd3NmQXpqRGpHT0dGNjNjc3YwM0dCWjFDOU5fQzRSRm53R29Ib0JFTnAxbXVxTlk1Q2VfWFpVaXJWUXVOSVlFVG5YdFFtblJGM3l4dWpMVmNNeFZzLUJiMmhOWUd5U3pRVzAxUFo1ZVRIdEtCdWxEVWlHMHU3U1NlT2FseTdxUDAzS1pRRkptSFlCdmRKUFY3d2J2bXVPYzR1UVlXeXVZWG9LTXAtQjRaWjROelN5Tm1n",
  "authenticationSessionExpiry": "1758767412101",
  "headers": {
    "X-SRC-CX-FLOW-ID": "34f4a04b.812f4db0-3456-4573-a266-e5ac5105a1f0.1758681912"
  }
}
```

> **Step 3:**   
>
> * The integrator launches or redirects the user to the Authentication UI URL.
> * Mastercard presents the 3DS challenge to the user.
> * Upon successful completion of the 3DS challenge, Mastercard prompts the user to create a passkey.
> * After the user completes all steps in the UI, Mastercard invokes the integrator's HTTPS callbackUri with the Base64-encoded authentication status.

**Launch UI and User Completes the Authentication**

    https://stage.src.mastercard.com/auth?sav=ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldNdGJtVjNMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgwTG5ObGMzTnBiMjVwWkY5MGIydGxiaUlzSW1Gc1p5STZJbEpUTWpVMkluMC5leUpoZFdRaU9pSm9kSFJ3Y3pwY0wxd3ZiV0Z6ZEdWeVkyRnlaQzVqYjIwaUxDSmpiMjV6ZFcxbGNrbGtJam9pTVRNME16VXlPVFF0Wm1FMFpTMDBZV05pTFRobVpUWXRNRFZoWWpZMllqQTRPRGd4SWl3aWFYTnpJam9pYUhSMGNITTZYQzljTDIxaGMzUmxjbU5oY21RdVkyOXRJaXdpYzJOdmNHVkVZWFJoSWpvaWUxd2lZWFYwYUZObGMzTnBiMjVKWkZ3aU9sd2lORFkwWmpJNVlqTXRZakUxTlMwMFlqWmtMV0UxTm1RdFl6QmxZMll6TmpjeU9EZ3pYQ0lzWENKemNtTkRiR2xsYm5SSlpGd2lPbHdpTVRNME16VXlPVFF0Wm1FMFpTMDBZV05pTFRobVpUWXRNRFZoWWpZMllqQTRPRGd4WENJc1hDSnpjbU5EYjNKeVpXeGhkR2x2Ymtsa1hDSTZYQ0psTlRsaU1tWmxZaTFrTVRRNUxUUmtaV0l0WVdKaE9DMHdPRGszWkRFMk1tRTROalJjSW4waUxDSmxlSEFpT2pFM05UZ3hOall5TlRRc0ltbGhkQ0k2TVRjMU9ERTJOVGsxTkN3aWFuUnBJam9pTUdRek1UUm1Oall0TUdVeE1pMDBZVGsyTFRrNU1tUXRNV0prWldObU16VXhNbVJoSW4wLlNVcTc1VnF6aGR6ZjFOUmxjaUtITWJLNkhoS2EtUzVKblpkVDlaYzZEaTFoWFppaGkwdUd0MDNJWXdTN3BGc3hMMUcxV3NJMTk4QVVmcWlGNWl0Yzl2elRESHByd3plb3pOd25lUVZhLTM3T0FvdFpKWUJIUXRCTnVrQ0ExWl80SEN5ZU0yeW1kaUNBQXJOaUZWcXpYeFhxdkNodmpHcWxUbnRCTEtwS0xGTUw5U1Vqd0czMTFyaDhQeWROUGVHU1AzTnljMGpGUTRJUk9hbzlnU3ZmMGRLdE90ajdab2h5VDNRZXRCa0ZrbXJGNWVZU0k0WFJVM3IyRXZCWTdNMGp5VUZZZWE3ZjhBdExpV3FKWFlHZEtNMU9CeE1kZWFSSlNxejZEaVR1RHFJSGNvdG9ZOWtqYUZISmhYWHJlbnpJVGRuX0I2cXQxOGEtbnRHWUUtck5KZw==&amp;traceId=34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166836 

**HTTPS callbackUri**

    https://stage.mcsrcteststore.com/macstools/auth-processing?&res=eyJyZXN1bHQiOiJBVVRIRU5USUNBVElPTl9TVUNDRVNTIiwicmVxdWlyZUFkZGl0aW9uYWxBdXRoIjpmYWxzZSwiYXV0aGVudGljYXRpb25TZXNzaW9uSWQiOiJmYTY3Yjc4Yy1hMWZkLTQyYTQtYTg5MS1mZDdmODE1MDgxZmQifQ%3D%3D

> **Step 4:** The Integrator calls the [Authenticate API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#AccountHolderAuthenticationsAuthenticateProfile).The response contains **proof of authentication `assuranceData`** , which includes:
> **Proof of EMV 3DS identity and validation**
> **Proof of passkey enrollment**

```json
{
  "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
  "srcCorrelationId": "e59b2feb-d149-4deb-aba8-0897d162a864",
  "srcDigitalCardId": "9ZtsqSdrQpikwY3aphMabg000000000000GB",
  "authenticationSessionId": "464f29b3-b155-4b6d-a56d-c0ecf3672883",
  "authenticationMethod": {
    "authenticationMethodType": "MANAGED_AUTHENTICATION",
    "authenticationSubject": "CARDHOLDER"
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166836"
  }
}
```

```json
{
  "srcCorrelationId": "ddc1a2da-3b46-4cee-ae67-1917d96b3fcf",
  "authenticationSessionId": "7949c27e-883a-4100-a605-e0ac3f2ced6f",
  "authenticationResult": "AUTHENTICATED",
  "authenticationStatus": "COMPLETE",
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "01",
        "verificationResults": "01",
        "verificationTimestamp": "1758681080606",
        "verificationEvents": ["01"],
        "additionalData": "ZXlKcmFXUWlPaUl5TURJek1ESXdPREE0TlRFMU55MXpZVzVrWW05NExXbGtaVzUwYVhSNUxYWmxjbWxtYVdOaGRHbHZiaTF6Y21NdGJXRnpkR1Z5WTJGeVpDMXBiblFpTENKMGVYQWlPaUpLVjFRclpYaDBMbU5oY21SZmRHOXJaVzRpTENKaGJHY2lPaUpTVXpJMU5pSjkuZXlKaGRXUWlPaUpvZEhSd2N6cGNMMXd2YldGemRHVnlZMkZ5WkM1amIyMGlMQ0pqWVhKa1NXUWlPaUl3WVhGcGVWUjRkbEZLTWtwd2FsTjFVelJEZUV4Qk1EQXdNREF3TURBd01EQXdRbElpTENKcGMzTWlPaUpvZEhSd2N6cGNMMXd2YldGemRHVnlZMkZ5WkM1amIyMGlMQ0pqYjNKeVpXeGhkR2x2Ymtsa0lqb2laR1JqTVdFeVpHRXRNMkkwTmkwMFkyVmxMV0ZsTmpjdE1Ua3hOMlE1Tm1JelptTm1JaXdpYzJOdmNHVkVZWFJoSWpvaWUxd2lZWFYwYUZObGMzTnBiMjVKWkZ3aU9sd2laalkzWW1SbU9XWXRaR1l3TmkwMFpESTFMV0prWkRjdE16a3hOMk15TjJVMlpEZzVYQ0lzWENKaGRYUm9aVzUwYVdOaGRHbHZibEpsYzNWc2RGd2lPbHdpUVZWVVNFVk9WRWxEUVZSRlJGd2lMRndpWVhWMGFHVnVkR2xqWVhScGIyNU5aWFJvYjJSY0lqcGNJak5FVTF3aUxGd2lkR2h5WldWRWMxQkJWbVZ5YVdacFpXUmNJanBjSW5SeWRXVmNJaXhjSW1ObGNuUnBabWxsWkUxbVlVMWxkR2h2WkVsa1hDSTZYQ0l6TURBd01Wd2lMRndpWVhWMGFHVnVkR2xqWVhScGIyNVVhVzFsWENJNlhDSXhOelU0TmpneE1EZ3dOakEzWENJc1hDSnpjbU5EYkdsbGJuUkpaRndpT2x3aU5XVXdaRFJpT0RRdE1UZzVaQzAwWXpnMkxUZ3lNbVF0TlRrd05qQXlaall5TURZeVhDSXNYQ0poZFhSb1pXNTBhV05oZEdsdmJsSmxZWE52Ym5OY0lqcGJYQ0pVVWtGT1UwRkRWRWxQVGw5QlZWUklSVTVVU1VOQlZFbFBUbHdpWFgwaUxDSnpZMjl3WlhNaU9sc2lWRTlMUlU1ZlFrbE9SQ0lzSWtGVlZFaEZUbFJKUTBGVVNVOU9VeUpkTENKbGVIQWlPakUzTlRnMk9ERXpPREFzSW1saGRDSTZNVGMxT0RZNE1UQTRNQ3dpYW5ScElqb2lNMlJqWWpJMk9USXRaV00zTXkwME1qTTFMVGxrTUdZdFlUazJNREZpTmpjMlpESmtJbjAubVEwYmlVN00tNXNaSTIxVGlsYzRwd3R0OGExcXJoSEs5YWxFTzZtTjdIUVBfcGp6X1VvVTZ4YVhibWhBbXpfX0hwUW0waGp3UWJDZHI5T2Q5N2pjR1VULVpKZURGdTZaeGU5QnRTb2hmMnNBcXhJWS1mc0FFczRUa0N6WHRpaUFEeElha3g1cXJnMHU1VFBNTEZoWUNNc1dfRnB2eE96RUNBMHY2UFdlYzlaV2lFdkNOWFFveDU1WGwySGc1NEE1N2RvTWpuYlc4aWlkQldDa1NtQW9oeDFoRWRUZW5mVnZwdlZiQlpoWEs3bTdLSlRnUzFDbzdfb2loTmI0eUlVc3pxUkJ6a0NMNkVRNVU5R2g3bl9Nc3lTX0pnUy0yakhLcU52SlB5LW0xVEFnV2xFR19TbndKZm1wdWQwY3gxN1p5ZjdYNUdHT2hPa0haV0Y5ZFhxRWVB"
      },
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "02",
        "verificationMethod": "07",
        "verificationResults": "01",
        "verificationTimestamp": "1758681080614",
        "verificationEvents": ["64"],
        "additionalData": "eyJ0eXBlIjoiRklETzIiLCJjZXJ0aWZpZWRNZmFNZXRob2RJZCI6IjIwMDAxIiwibWZhTWV0aG9kSW5zdGFuY2VJZCI6Ilg4bFJ3N1J4U3FpNVhQWVdlbDJPQncwMDAwMDAwMDAwMTBVUyIsImFzc2VydGlvbiI6ImV5SnJhV1FpT2lJeU1ESXpNREl3T0RBNE5URTFOeTF6WVc1a1ltOTRMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgwTG1OaGNtUmZkRzlyWlc0aUxDSmhiR2NpT2lKU1V6STFOaUo5LmV5SmhkV1FpT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKamIzSnlaV3hoZEdsdmJrbGtJam9pWkdSak1XRXlaR0V0TTJJME5pMDBZMlZsTFdGbE5qY3RNVGt4TjJRNU5tSXpabU5tSWl3aWMyTnZjR1ZFWVhSaElqb2llMXdpWVhWMGFGTmxjM05wYjI1SlpGd2lPbHdpTVRBMU5qSm1aakV0WXpCbU1pMDBaRE14TFdKak5tRXRPVGhoWVRBNU0yUmpNRGd6WENJc1hDSmhkWFJvWlc1MGFXTmhkR2x2YmxKbGMzVnNkRndpT2x3aVFWVlVTRVZPVkVsRFFWUkZSRndpTEZ3aVlYVjBhR1Z1ZEdsallYUnBiMjVOWlhSb2IyUmNJanBjSWtaSlJFOHlYQ0lzWENKalpYSjBhV1pwWldSTlptRk5aWFJvYjJSSlpGd2lPbHdpTWpBd01ERmNJaXhjSW1GMWRHaGxiblJwWTJGMGFXOXVWR2x0WlZ3aU9sd2lNVGMxT0RZNE1UQTRNRFl4TkZ3aUxGd2ljM0pqUTJ4cFpXNTBTV1JjSWpwY0lqVmxNR1EwWWpnMExURTRPV1F0TkdNNE5pMDRNakprTFRVNU1EWXdNbVkyTWpBMk1sd2lMRndpWVhWMGFHVnVkR2xqWVhScGIyNVNaV0Z6YjI1elhDSTZXMXdpVkZKQlRsTkJRMVJKVDA1ZlFWVlVTRVZPVkVsRFFWUkpUMDVjSWwxOUlpd2ljMk52Y0dWeklqcGJJbFJQUzBWT1gwSkpUa1FpWFN3aVpYaHdJam94TnpVNE5qZ3hNemd3TENKcFlYUWlPakUzTlRnMk9ERXdPREFzSW1wMGFTSTZJakE0T0RBelpqTmpMVGczWmprdE5HWTNZUzFpWXpNeExUWmpNR1l4TnpFMllqazFZU0o5LlZZVk5fR2tnQWlwY3diYU84d3hoeUR0MXlKeVZtMlJMblFjVFdab3cyd1g5Mm9lUUd1RUc1TXE4ZWxHLTk2SDlUMjJBVHU3c3pzenZPYzdVckY4ZVp0NG12R200c3VsTnI4TUUzdmxUQ21xV0pmZ0pBV2xfX0pTbE4wbTRicFpEaGF4QjhoZ1VTVTAxYkR4LU00aGxlUHZieXVDcWFMY2stSnBLYnNmU2lHVklJdVBEaWhvYko3RklGRzltMFBMQ1d1R09WcjNVZnJWZlZZeXYxSnFrenU4TEJmZXhmc2ZISFZON1pVN09Ub3dDUG1nYjh1d1U5X00xbWx6emU0c0JCZ3N3VE9jd2tkeUFRZGRjU2RvZTN1V3NXa2RyanU0ckdsSDVpREJzaFBUVmhjb255NUF1dGRranZhNnhnamFrMDhObDd4NnNveUFlSm1GUHRHRzh2USJ9"
      }
    ]
  },
  "headers": {
    "X-SRC-CX-FLOW-ID": "34f4a04b.812f4db0-3456-4573-a266-e5ac5105a1f0.1758681980"
  }
}
```

> **Step 5:** Integrator calls [Checkout API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) with proof of 3DS payment authentication assuranceData and receives cryptogram (if selected dynamicDataType as 'DSRP' for checkout), `eci`, `dsTransactionID` and `AAV` and receives encrypted checkout payload in response.

```json
{
  "srcClientId": "5e0d4b84-189d-4c86-822d-590602f62062",
  "srcDpaId": "5e0d4b84-189d-4c86-822d-590602f62062_SCOF",
  "srcCorrelationId": "ddc1a2da-3b46-4cee-ae67-1917d96b3fcf",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#DOCUMENTATION-UPN2#01",
  "srcDigitalCardId": "0aqiyTxvQJ2JpjSuS4CxLA000000000000BR",
  "dpaTransactionOptions": {
    "transactionAmount": {
      "transactionAmount": 12.12,
      "transactionCurrencyCode": "USD"
    }
  },
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "01",
        "verificationResults": "01",
        "verificationTimestamp": "1758681080606",
        "verificationEvents": ["01"],
        "additionalData": "ZXlKcmFXUWlPaUl5TURJek1ESXdPREE0TlRFMU55MXpZVzVrWW05NExXbGtaVzUwYVhSNUxYWmxjbWxtYVdOaGRHbHZiaTF6Y21NdGJXRnpkR1Z5WTJGeVpDMXBiblFpTENKMGVYQWlPaUpLVjFRclpYaDBMbU5oY21SZmRHOXJaVzRpTENKaGJHY2lPaUpTVXpJMU5pSjkuZXlKaGRXUWlPaUpvZEhSd2N6cGNMMXd2YldGemRHVnlZMkZ5WkM1amIyMGlMQ0pqWVhKa1NXUWlPaUl3WVhGcGVWUjRkbEZLTWtwd2FsTjFVelJEZUV4Qk1EQXdNREF3TURBd01EQXdRbElpTENKcGMzTWlPaUpvZEhSd2N6cGNMMXd2YldGemRHVnlZMkZ5WkM1amIyMGlMQ0pqYjNKeVpXeGhkR2x2Ymtsa0lqb2laR1JqTVdFeVpHRXRNMkkwTmkwMFkyVmxMV0ZsTmpjdE1Ua3hOMlE1Tm1JelptTm1JaXdpYzJOdmNHVkVZWFJoSWpvaWUxd2lZWFYwYUZObGMzTnBiMjVKWkZ3aU9sd2laalkzWW1SbU9XWXRaR1l3TmkwMFpESTFMV0prWkRjdE16a3hOMk15TjJVMlpEZzVYQ0lzWENKaGRYUm9aVzUwYVdOaGRHbHZibEpsYzNWc2RGd2lPbHdpUVZWVVNFVk9WRWxEUVZSRlJGd2lMRndpWVhWMGFHVnVkR2xqWVhScGIyNU5aWFJvYjJSY0lqcGNJak5FVTF3aUxGd2lkR2h5WldWRWMxQkJWbVZ5YVdacFpXUmNJanBjSW5SeWRXVmNJaXhjSW1ObGNuUnBabWxsWkUxbVlVMWxkR2h2WkVsa1hDSTZYQ0l6TURBd01Wd2lMRndpWVhWMGFHVnVkR2xqWVhScGIyNVVhVzFsWENJNlhDSXhOelU0TmpneE1EZ3dOakEzWENJc1hDSnpjbU5EYkdsbGJuUkpaRndpT2x3aU5XVXdaRFJpT0RRdE1UZzVaQzAwWXpnMkxUZ3lNbVF0TlRrd05qQXlaall5TURZeVhDSXNYQ0poZFhSb1pXNTBhV05oZEdsdmJsSmxZWE52Ym5OY0lqcGJYQ0pVVWtGT1UwRkRWRWxQVGw5QlZWUklSVTVVU1VOQlZFbFBUbHdpWFgwaUxDSnpZMjl3WlhNaU9sc2lWRTlMUlU1ZlFrbE9SQ0lzSWtGVlZFaEZUbFJKUTBGVVNVOU9VeUpkTENKbGVIQWlPakUzTlRnMk9ERXpPREFzSW1saGRDSTZNVGMxT0RZNE1UQTRNQ3dpYW5ScElqb2lNMlJqWWpJMk9USXRaV00zTXkwME1qTTFMVGxrTUdZdFlUazJNREZpTmpjMlpESmtJbjAubVEwYmlVN00tNXNaSTIxVGlsYzRwd3R0OGExcXJoSEs5YWxFTzZtTjdIUVBfcGp6X1VvVTZ4YVhibWhBbXpfX0hwUW0waGp3UWJDZHI5T2Q5N2pjR1VULVpKZURGdTZaeGU5QnRTb2hmMnNBcXhJWS1mc0FFczRUa0N6WHRpaUFEeElha3g1cXJnMHU1VFBNTEZoWUNNc1dfRnB2eE96RUNBMHY2UFdlYzlaV2lFdkNOWFFveDU1WGwySGc1NEE1N2RvTWpuYlc4aWlkQldDa1NtQW9oeDFoRWRUZW5mVnZwdlZiQlpoWEs3bTdLSlRnUzFDbzdfb2loTmI0eUlVc3pxUkJ6a0NMNkVRNVU5R2g3bl9Nc3lTX0pnUy0yakhLcU52SlB5LW0xVEFnV2xFR19TbndKZm1wdWQwY3gxN1p5ZjdYNUdHT2hPa0haV0Y5ZFhxRWVB"
      }
    ]
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.812f4db0-3456-4573-a266-e5ac5105a1f0.1758681884"
  }
}
```

```json
{
  "body": {
    "checkoutResponseJWS": "eyJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpYXQiOjE3NTgxNDE5NjUsImFsZyI6IlJTMjU2IiwianRpIjoiNzYyOGUzMTQtNjA5Zi00MDg4LTg3ZGYtM2MzNTY3ZGU2Y2QzIiwia2lkIjoiMjAyMzAxMjYxMTQ1MzAtc3RnLW1jLW5ldy1wYXlsb2FkLXZlcmlmaWNhdGlvbi1zcmMtbWFzdGVyY2FyZC1pbnQifQ.eyJzcmNDb3JyZWxhdGlvbklkIjoiYzNjM2ZjMzYtYmMzNy00MThmLWJiYmMtNTkxZGMyNzkxMTc4IiwiZW5jcnlwdGVkUGF5bG9hZCI6ImV5SnJhV1FpT2lKemRHRnlkRVZ1WXkweE16QXlNakF5TlNJc0ltVnVZeUk2SWtFeE1qaEhRMDBpTENKaGJHY2lPaUpTVTBFdFQwRkZVQzB5TlRZaWZRLlhxbERZVEpiaVdpSHlxaGFFSVBrOV9nU1V0cFJjNHg4RWVFTDZkM2QzcTl3Z084dmI1aXJCVDJQUHVCc2s3eHZTM0RzUGRtTnZYbEpCSk5aZDY3TXpfeTlPM1gxYTMwdmpHZEZ6QThuZUViU2ZuVVZqV2FoTzdVNjA0LTJ6dks0TkszNXJRb0NMTGl0S0F5aXlFcDNUMFRISFk4RnZwbTB3bUhpNnJDMHVxU0FpSHJUbVF6UU00Nzg3R0tpSTlxLTVORE5mNHlNeUFBQVFkanZzQ1BLcDNLM3FYRlFyZHRIdTM1Z3l1UWJZcEJ1Vkk1UFNGU0NlTEFXb3EzMnZzZkVvM2lXOXZIN0JKRkp2RV9wYWowdC1GbjljR2I5emVtZV9lNUM3Y3M5VTlzTUM4TGJlSi11TUZGTWxNX0IzMERnUk1fM0dNRVJOTzJBMWpEcjlzXzlYdy5QeFB5Tm1HdHN1YmJhb1NuLnlma1k0SnhNT0xBUHE0UG41SmlZT2hCVFpTMU5DSDAzdGFlUXF2UmNjekV6b3ZLekkzMVhEQTR3YjE4ekpyRmJsbTVNT3dSWnR6eERaMXdYNmwyZ2Yta2hiTmVkMWxsSFZOM2FNT0pPdjNyckpxempqS2hPTFF5ZnZ2Q0NJWmdJekZGczhLS3Zhb292cHczQ1lldmp1WWNZZUg1Z3hpT0hfN045S014Rkd3bEQ4dVNVUThrZzVvdkxBT3hmRTMzZTVZSzgwakQzUXA0LTdRWnZLV2RqQjhWUW4xRHZPZGZfTF84c0NWWDF2a1hFVlp6OVgxZDNXTm9HNGVUWXFROWtvUi0tSEtvcWRfZFVwdDgzOGVjN3RTbXg2Skpjcl9BSlh6Vl9iWHFhdnd1V2FqNk1QTk1wWnFkN3oxU1dFTEZVLWp6ak5qaHduQzNpQXNDNkEtTl9US2FIdk1peDNkVjdyd0YySTlxN0dNVDJMMk0wT3lqNDhreGpnYnZ3MlJqNDRkalJPTS1yZWhrcndPYXVxcXg2U3YxaURpcFE1N0dOWHF3cGYwTERZdkotd1JCbVJTRHp0NGw1Vm9oTnFIWHRUaU9CcHdpemZDeW5ZSVUzTWx3bjkzcEFFNm55dzJFQWJXdXJ5N05acTFuNmk2TnFVcnc3TjZSdWdGeGNCdVhQWGFuQ0FVcng1SEpVbmlLeWRaVmNpQlVkb0QwRTFvQWJvQ2JzMFA2Y2hFRXdueEFjVDdvb0JZb1V6V0NYdEZNQjBKaEpPMFVaajJNQ0RDTEd3V29pQVQydlNsMVZMZnJYRkxPVlBsemxXUlcxNmFnNVRVaElyWEQwRnlHTU1qOV90VFRwb0VCQVdLcFdvTTlnQzFaSGd1OC5PeDNvU3NOTmN2b1pmcnYxNUR4Z2pRIiwibWFza2VkQ2FyZCI6eyJzcmNEaWdpdGFsQ2FyZElkIjoiRVZuSG53YzVRQm16enhEd1lUSXNwQTAwMDAwMDAwMDAwMEdCIiwicGFuQmluIjoiNTIwNDI0IiwicGFuTGFzdEZvdXIiOiI5OTAxIiwidG9rZW5CaW5SYW5nZSI6IjUyMDQyNCIsInRva2VuTGFzdEZvdXIiOiI4NTY3IiwiZGlnaXRhbENhcmREYXRhIjp7InN0YXR1cyI6IkFDVElWRSIsImRlc2NyaXB0b3JOYW1lIjoiQmFuayBSZXdhcmRzIE1hc3RlcmNhcmQiLCJhcnRVcmkiOiJodHRwczovL3N0YWdlLmFzc2V0cy5tYXN0ZXJjYXJkLmNvbS9jYXJkLWFydC9jb21iaW5lZC1pbWFnZS1hc3NldC9hNjEzODVhMi0wYzFmLTQzNGUtYTYyMi1mNzRhZDg2MjM5ZmIucG5nIiwiY29CcmFuZGVkTmFtZSI6IkNvIGJyYW5kIHBhcnRuZXIiLCJpc0NvQnJhbmRlZCI6dHJ1ZSwibG9uZ0Rlc2NyaXB0aW9uIjoiQmFuayBSZXdhcmRzIE1hc3RlcmNhcmQgd2l0aCByZXdhcmRzIHByb2dyYW0iLCJmb3JlZ3JvdW5kQ29sb3IiOiIwMDAwMDAiLCJpc3N1ZXJOYW1lIjoiSXNzdWluZyBCYW5rIn0sInBhbkV4cGlyYXRpb25Nb250aCI6IjExIiwicGFuRXhwaXJhdGlvblllYXIiOiIyMDI5IiwicGF5bWVudENhcmREZXNjcmlwdG9yIjoibWFzdGVyY2FyZCIsInBheW1lbnRDYXJkVHlwZSI6IkNSRURJVCIsInNlcnZpY2VJZCI6IlNFQ1VSRV9DT0ZfQ09NTUVSQ0VfUExBVEZPUk0jU1RBUlRfQ1BEX1NURyMwMSIsImRhdGVPZkNhcmRDcmVhdGVkIjoiMjAyNS0wOS0xN1QyMDo0NDo1My41MDFaIn0sIm1hc2tlZENvbnN1bWVyIjp7InNyY0NvbnN1bWVySWQiOiJkNTRiMTlhNi0zMzU1LTRlOGItYTBmMi01ODU2N2ZmODI3OTUiLCJtYXNrZWRDb25zdW1lcklkZW50aXR5Ijp7ImlkZW50aXR5VHlwZSI6IkVYVEVSTkFMX0FDQ09VTlRfSUQiLCJtYXNrZWRJZGVudGl0eVZhbHVlIjoiYjBmY2Y3ZDAtNzZhZi00MmJiLTljODgtZDY3NDgwZmQ4OGQ0In0sIm1hc2tlZE1vYmlsZU51bWJlciI6e30sInN0YXR1cyI6IkFDVElWRSIsIm1hc2tlZEZ1bGxOYW1lIjoiIiwiZGF0ZUNvbnN1bWVyQWRkZWQiOiIyMDI1LTA5LTE3VDIwOjQ0OjUzLjQwNFoifSwiY3VzdG9tT3V0cHV0RGF0YSI6eyJyZW1vdGVDb21tZXJjZUFjY2VwdG9ySWRlbnRpZmllciI6ImFIUjBjRG92TDJOdmJYQmhibmwxY21reE16RXlNUzVqYjIwPSJ9LCJhc3N1cmFuY2VEYXRhIjp7ImNhcmRWZXJpZmljYXRpb25FbnRpdHkiOiIwMiIsImNhcmRWZXJpZmljYXRpb25NZXRob2QiOiIwMyIsImNhcmRWZXJpZmljYXRpb25SZXN1bHRzIjoiMDMiLCJ2ZXJpZmljYXRpb25EYXRhIjpbeyJ2ZXJpZmljYXRpb25UeXBlIjoiQ0FSREhPTERFUiIsInZlcmlmaWNhdGlvbkVudGl0eSI6IjAzIiwidmVyaWZpY2F0aW9uTWV0aG9kIjoiMDEiLCJ2ZXJpZmljYXRpb25SZXN1bHRzIjoiMDEiLCJ2ZXJpY2F0aW9uVGltZXN0YW1wIjoiMTc1ODE0MTk1ODA0MiIsInZlcmlmaWNhdGlvbkV2ZW50cyI6WyIwMSJdfV19LCJrZXlGaW5nZXJwcmludElkIjoiYzk0ZjY5MTFiYjE0ZGFiMmEyMWNjNTY0NzA5YzRlNjBkZDU1MmVlNWU3MThkNjBmOGMyZTQ2YjVmYWM3M2EwMCIsImVjaSI6IjAyIn0.JMOtDpSHOOtTy2yTT4RrkkrKxat_rJqO5ZmQHSCaZUvkxliXb7EqcraVrCj2TLI0X_gFwDJ4h6rmmFoUNQUowjZVk1AFFKlJ57tgVqE1Ov49Vn2vHFxUEHwIwjCTc71LS83QwQgLGDj9S9GYik2XVnxi2Sl8cP87S9B1_1W4ZHzN-jEMl96kxOWNqo0HJ48eItT5tNEoWNCEFQ8g18AEVDWLApf59AWZeqYYu1YcP-Jxifl7UtYTUdNHggmDA-FMud0TZHkGf0Y4N-cqtvSpTIYZVfqnMI-lCFE06j2EM1f2FhtZo63NE6o7iPdQiIiiTfwD-a7DAnGJDO-E3bRLBg"
  },
  "headers": {
    "X-SRC-CX-FLOW-ID": "[34f4a04b.c5deb17f-a130-4ba7-a000-5bf7c33c75db.1758142865]"
  }
}
```

```json
{
  "checkoutResponseJWSPayload": {
    "srcCorrelationId": "c3c3fc36-bc37-418f-bbbc-591dc2791178",
    "encryptedPayload": "eyJraWQiOiJzdGFydEVuYy0xMzAyMjAyNSIsImVuYyI6IkExMjhHQ00iLCJhbGciOiJSU0EtT0FFUC0yNTYifQ.XqlDYTJbiWiHyqhaEIPk9_gSUtpRc4x8EeEL6d3d3q9wgO8vb5irBT2PPuBsk7xvS3DsPdmNvXlJBJNZd67Mz_y9O3X1a30vjGdFzA8neEbSfnUVjWahO7U604-2zvK4NK35rQoCLLitKAyiyEp3T0THHY8Fvpm0wmHi6rC0uqSAiHrTmQzQM4787GKiI9q-5NDNf4yMyAAAQdjvsCPKp3K3qXFQrdtHu35gyuQbYpBuVI5PSFSCeLAWoq32vsfEo3iW9vH7BJFJvE_paj0t-Fn9cGb9zeme_e5C7cs9U9sMC8LbeJ-uMFFMlM_B30DgRM_3GMERNO2A1jDr9s_9Xw.PxPyNmGtsubbaoSn.yfkY4JxMOLAPq4Pn5JiYOhBTZS1NCH03taeQqvRcczEzovKzI31XDA4wb18zJrFblm5MOwRZtzxDZ1wX6l2gf-khbNed1llHVN3aMOJOv3rrJqzjjKhOLQyfvvCCIZgIzFFs8KKvaoovpw3CYevjuYcYeH5gxiOH_7N9KMxFGwlD8uSUQ8kg5ovLAOxfE33e5YK80jD3Qp4-7QZvKWdjB8VQn1DvOdf_L_8sCVX1vkXEVZz9X1d3WNoG4eTYqQ9koR--HKoqd_dUpt838ec7tSmx6JJcr_AJXzV_bXqavwuWaj6MPNMpZqd7z1SWELFU-jzjNjhwnC3iAsC6A-N_TKaHvMix3dV7rwF2I9q7GMT2L2M0Oyj48kxjgbvw2Rj44djROM-rehkrwOauqqx6Sv1iDipQ57GNXqwpf0LDYvJ-wRBmRSDzt4l5VohNqHXtTiOBpwizfCynYIU3Mlwn93pAE6nyw2EAbWury7NZq1n6i6NqUrw7N6RugFxcBuXPXanCAUrx5HJUniKydZVciBUdoD0E1oAboCbs0P6chEEwnxAcT7ooBYoUzWCXtFMB0JhJO0UZj2MCDCLGwWoiAT2vSl1VLfrXFLOVPlzlWRW16ag5TUhIrXD0FyGMMj9_tTTpoEBAWKpWoM9gC1ZHgu8.Ox3oSsNNcvoZfrv15DxgjQ",
    "maskedCard": {
      "srcDigitalCardId": "EVnHnwc5QBmzzxDwYTIspA000000000000GB",
      "panBin": "520424",
      "panLastFour": "9901",
      "tokenBinRange": "520424",
      "tokenLastFour": "8567",
      "digitalCardData": {
        "status": "ACTIVE",
        "descriptorName": "Bank Rewards Mastercard",
        "artUri": "https://stage.assets.mastercard.com/card-art/combined-image-asset/a61385a2-0c1f-434e-a622-f74ad86239fb.png",
        "coBrandedName": "Co brand partner",
        "isCoBranded": true,
        "longDescription": "Bank Rewards Mastercard with rewards program",
        "foregroundColor": "000000",
        "issuerName": "Issuing Bank"
      },
      "panExpirationMonth": "11",
      "panExpirationYear": "2029",
      "paymentCardDescriptor": "mastercard",
      "paymentCardType": "CREDIT",
      "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
      "dateOfCardCreated": "2025-09-17T20:44:53.501Z"
    },
    "maskedConsumer": {
      "srcConsumerId": "d54b19a6-3355-4e8b-a0f2-58567ff82795",
      "maskedConsumerIdentity": {
        "identityType": "EXTERNAL_ACCOUNT_ID",
        "maskedIdentityValue": "b0fcf7d0-76af-42bb-9c88-d67480fd88d4"
      },
      "maskedMobileNumber": {},
      "status": "ACTIVE",
      "maskedFullName": "",
      "dateConsumerAdded": "2025-09-17T20:44:53.404Z"
    },
    "customOutputData": {
      "remoteCommerceAcceptorIdentifier": "aHR0cDovL2NvbXBhbnl1cmkxMzEyMS5jb20="
    },
    "assuranceData": {
      "cardVerificationEntity": "02",
      "cardVerificationMethod": "03",
      "cardVerificationResults": "03",
      "verificationData": [
        {
          "verificationType": "CARDHOLDER",
          "verificationEntity": "03",
          "verificationMethod": "01",
          "verificationResults": "01",
          "verificationTimestamp": "1758141958042",
          "verificationEvents": [
            "01"
          ]
        }
      ],
      "eci": "02"
    },
    "keyFingerprintId": "c94f6911bb14dab2a21cc564709c4e60dd552ee5e718d60f8c2e46b5fac73a00",
    "eci": "02"
  },
  "decryptedPayload": {
    "token": {
      "paymentToken": "************8567",
      "tokenExpirationMonth": "05",
      "tokenExpirationYear": "2030",
      "paymentAccountReference": "5001a9f027e5629d11e3949a0800a",
      "panSequenceNumber": "00"
    },
    "srcTokenResultsData": {
      "unpredictableNumber": "74308263"
    },
    "dynamicData": {
      "dynamicDataValue": "MyUuJFCsX6dfiJ8LsobpFl5Ja1yDJCu1",
      "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
    },
    "threeDsOutputData": {
      "dsTransID": "a80b64dd-b10e-4555-8767-4a83ef9c8d84",
      "authenticationValue": "sjduwxiclotcscsvvseqdlitaamg"
    }
  }
}
```

## Scenario 12 {#scenario-12}

**Assumptions**

* The integrator is onboarded to the **Mastercard Card Checkout Solutions -- Secure Card on File** program and authorized to make API calls.
* Selected card is tokenized and **saved on file** with Integrator.
* The **test card's country and issuer** are configured to be **eligible for Mastercard FIDO**.
* The client is **associated with the required Mastercard FIDO configuration**.
* The **issuer's country** is **enabled for 3-D Secure (3DS)** .   

**When**   
> On Integrator's website, user logs into the account and chooses a card on file to initiate checkout.

**Then**   
> **Step 1:** Integrator calls [Lookup Authentication Method API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#lookupAccountHolderAuthenticationProfile) with `authenticationReasons` and receives **MANAGED_AUTHENTICATION** as an eligible method in response.

```json
{
  "srcDigitalCardId": "PLReJE1YR3KvC3jSgxP7Mg000000000000AR",
  "srcCorrelationId": "8e280f17-bdae-4b9f-8ff5-799d78d12776",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_API_STG#01",
  "srcClientId": "5a9f8c51-7ad1-40c6-b828-b7437b9334f6",
  "authenticationContext": {
    "authenticationReasons": [
      "TRANSACTION_AUTHENTICATION"
    ]
  }
}
```

```json
{
  "srcCorrelationId": "8e280f17-bdae-4b9f-8ff5-799d78d12776",
  "authenticationMethods": [
    {
      "authenticationMethodType": "MANAGED_AUTHENTICATION",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "TRANSACTION_AUTHENTICATION"
      ],
      "uriData": {},
      "authenticators": []
    }
  ]
}
```

> **Step 2:** Integrator calls [Authenticate API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#AccountHolderAuthenticationsAuthenticateProfile) and receives the Authentication UI URL to launch the challenge.

```json
{
  "srcClientId": "5e0d4b84-189d-4c86-822d-590602f62062",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#DOCUMENTATION-UPN2#01",
  "srcCorrelationId": "5542d7c5-87c8-47e2-a235-e7a298fc2c40",
  "srcDigitalCardId": "akFdIPFQS0-alRpvs4oDzA000000000000US",
  "authenticationMethod": {
    "authenticationMethodType": "MANAGED_AUTHENTICATION",
    "authenticationSubject": "CARDHOLDER"
  },
  "authenticationContext": {
    "authenticationReasons": [
      "TRANSACTION_AUTHENTICATION"
    ],
    "dpaData": {
      "dpaPresentationName": "Mastercard MTT Integrated - DPA 3 COF",
      "dpaName": "dpa3_of_MTT Integrated SRCI COF",
      "acquirerId": "SRC3DS",
      "acquirerBin": "545301"
    },
    "dpaTransactionOptions": {
      "transactionAmount": {
        "transactionAmount": 12.12,
        "transactionCurrencyCode": "USD"
      },
      "merchantName": "START",
      "merchantCategoryCode": "0001",
      "merchantCountryCode": "840",
      "threeDsInputData": {
        "forceChallenge": false,
        "billingAddress": {}
      },
      "dpaLocale": "en_AE"
    },
    "consumerDeviceData": {
      "appInstanceId": "e7ec59d8-b270-4e82-b9f4-bda3c0ba2f4a",
      "spcEnabled": false
    },
    "callbackUri": {
      "uri": "https://stage.mcsrcteststore.com/macstools/auth-processing?clientSessionId=c7b3c671-6ea9-4a78-af2c-d251b4a282e9",
      "uriType": "WEB_URI"
    }
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "4f339be7.7e5d95c4-f07e-4965-86d9-6cd540a437ed.1758921250"
  }
}
```

```json
{
  "srcCorrelationId": "5542d7c5-87c8-47e2-a235-e7a298fc2c40",
  "authenticationSessionId": "0f3045c6-774a-40c3-a11d-b162c216c057",
  "authenticationResult": "NOT_AUTHENTICATED",
  "authenticationStatus": "PENDING",
  "methodAttributes": {
    "uriData": {
      "uri": "https://sandbox.src.mastercard.com/auth?sav=ZXlKcmFXUWlPaUl5TURJek1ESXdPREE0TlRFMU55MXpZVzVrWW05NExXbGtaVzUwYVhSNUxYWmxjbWxtYVdOaGRHbHZiaTF6Y21NdGJXRnpkR1Z5WTJGeVpDMXBiblFpTENKMGVYQWlPaUpLVjFRclpYaDBMbk5sYzNOcGIyNXBaRjkwYjJ0bGJpSXNJbUZzWnlJNklsSlRNalUySW4wLmV5SmhkV1FpT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKamIyNXpkVzFsY2tsa0lqb2lOV1V3WkRSaU9EUXRNVGc1WkMwMFl6ZzJMVGd5TW1RdE5Ua3dOakF5WmpZeU1EWXlJaXdpYVhOeklqb2lhSFIwY0hNNlhDOWNMMjFoYzNSbGNtTmhjbVF1WTI5dElpd2ljMk52Y0dWRVlYUmhJam9pZTF3aVlYVjBhRk5sYzNOcGIyNUpaRndpT2x3aU1HWXpNRFExWXpZdE56YzBZUzAwTUdNekxXRXhNV1F0WWpFMk1tTXlNVFpqTURVM1hDSXNYQ0p6Y21ORGJHbGxiblJKWkZ3aU9sd2lOV1V3WkRSaU9EUXRNVGc1WkMwMFl6ZzJMVGd5TW1RdE5Ua3dOakF5WmpZeU1EWXlYQ0lzWENKemNtTkRiM0p5Wld4aGRHbHZia2xrWENJNlhDSTFOVFF5WkRkak5TMDROMk00TFRRM1pUSXRZVEl6TlMxbE4yRXlPVGhtWXpKak5EQmNJbjBpTENKbGVIQWlPakUzTlRnNU1qQTJOaklzSW1saGRDSTZNVGMxT0RreU1ETTJNaXdpYW5ScElqb2lNRGxoTkRjM1pqZ3RPR1V5TlMwME16WXdMVGt4WkRVdE56Y3paV0ZqWmpka05ESmxJbjAuZDNiQmZmbG9YcnFDajBxTW9ldVpzbmxvc3Z5UHhCX1NSdEdteHR4Y3pUWl9HbUR6MVRkWU9VY0FvRWNPR0t5WHJDUWExVzEtN3dpeFk3ZFpyb1FoVVkteTFFclpDOVVkSzVTcHFyMHhqbHVOQ2ZNclVIMUdJMmFfY0FPSWZWSXJ2NWN5a2hrSm5Fb1NIcnVwZDExeUgwcmlVRWJlX2l2cl91Yy1xOFlEUkw4ZGF6Zy1uQ21qd2p6dmtxdXkwQWVad1lGMUM4LVM4U1RSZXRzRW52aDZid3dFcm1QN2g5dk9HenppRzEtX0ZjRnZZNmJYSGlxc3lBM0Q1M1U4NndjVGItQm5mdVFLQ19hclppcE9kczNpQ3FpTFhxbU5UVTg3WGtYejA3d09PeXRFZVdrRWdCX0ZjZmg5RFdjelBPRUtWVDhxcF9LUXBKM3M0R0xRSkFBRjhR&amp;traceId=4f339be7.7e5d95c4-f07e-4965-86d9-6cd540a437ed.1758921250",
      "uriType": "WEB_URI"
    }
  },
  "sessionAssuranceValue": "ZXlKcmFXUWlPaUl5TURJek1ESXdPREE0TlRFMU55MXpZVzVrWW05NExXbGtaVzUwYVhSNUxYWmxjbWxtYVdOaGRHbHZiaTF6Y21NdGJXRnpkR1Z5WTJGeVpDMXBiblFpTENKMGVYQWlPaUpLVjFRclpYaDBMbk5sYzNOcGIyNXBaRjkwYjJ0bGJpSXNJbUZzWnlJNklsSlRNalUySW4wLmV5SmhkV1FpT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKamIyNXpkVzFsY2tsa0lqb2lOV1V3WkRSaU9EUXRNVGc1WkMwMFl6ZzJMVGd5TW1RdE5Ua3dOakF5WmpZeU1EWXlJaXdpYVhOeklqb2lhSFIwY0hNNlhDOWNMMjFoYzNSbGNtTmhjbVF1WTI5dElpd2ljMk52Y0dWRVlYUmhJam9pZTF3aVlYVjBhRk5sYzNOcGIyNUpaRndpT2x3aU1HWXpNRFExWXpZdE56YzBZUzAwTUdNekxXRXhNV1F0WWpFMk1tTXlNVFpqTURVM1hDSXNYQ0p6Y21ORGJHbGxiblJKWkZ3aU9sd2lOV1V3WkRSaU9EUXRNVGc1WkMwMFl6ZzJMVGd5TW1RdE5Ua3dOakF5WmpZeU1EWXlYQ0lzWENKemNtTkRiM0p5Wld4aGRHbHZia2xrWENJNlhDSTFOVFF5WkRkak5TMDROMk00TFRRM1pUSXRZVEl6TlMxbE4yRXlPVGhtWXpKak5EQmNJbjBpTENKbGVIQWlPakUzTlRnNU1qQTJOaklzSW1saGRDSTZNVGMxT0RreU1ETTJNaXdpYW5ScElqb2lNRGxoTkRjM1pqZ3RPR1V5TlMwME16WXdMVGt4WkRVdE56Y3paV0ZqWmpka05ESmxJbjAuZDNiQmZmbG9YcnFDajBxTW9ldVpzbmxvc3Z5UHhCX1NSdEdteHR4Y3pUWl9HbUR6MVRkWU9VY0FvRWNPR0t5WHJDUWExVzEtN3dpeFk3ZFpyb1FoVVkteTFFclpDOVVkSzVTcHFyMHhqbHVOQ2ZNclVIMUdJMmFfY0FPSWZWSXJ2NWN5a2hrSm5Fb1NIcnVwZDExeUgwcmlVRWJlX2l2cl91Yy1xOFlEUkw4ZGF6Zy1uQ21qd2p6dmtxdXkwQWVad1lGMUM4LVM4U1RSZXRzRW52aDZid3dFcm1QN2g5dk9HenppRzEtX0ZjRnZZNmJYSGlxc3lBM0Q1M1U4NndjVGItQm5mdVFLQ19hclppcE9kczNpQ3FpTFhxbU5UVTg3WGtYejA3d09PeXRFZVdrRWdCX0ZjZmg5RFdjelBPRUtWVDhxcF9LUXBKM3M0R0xRSkFBRjhR",
  "authenticationSessionExpiry": "1759006762169",
  "headers": {
    "X-SRC-CX-FLOW-ID": "4f339be7.7e5d95c4-f07e-4965-86d9-6cd540a437ed.1758921262"
  }
}
```

> **Step 3:**   
>
> * The integrator launches or redirects the user to the Authentication UI URL.
> * Mastercard initiates the passkey authentication flow.
> * The user completes authentication by providing their device's biometric input on the UI.
> * After authentication is completed, Mastercard invokes the integrator's HTTPS `callbackUri` with the Base64-encoded authentication status.

**Launch UI and User Completes the Authentication**

    https://sandbox.src.mastercard.com/auth?sav=ZXlKcmFXUWlPaUl5TURJek1ESXdPREE0TlRFMU55MXpZVzVrWW05NExXbGtaVzUwYVhSNUxYWmxjbWxtYVdOaGRHbHZiaTF6Y21NdGJXRnpkR1Z5WTJGeVpDMXBiblFpTENKMGVYQWlPaUpLVjFRclpYaDBMbk5sYzNOcGIyNXBaRjkwYjJ0bGJpSXNJbUZzWnlJNklsSlRNalUySW4wLmV5SmhkV1FpT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKamIyNXpkVzFsY2tsa0lqb2lOV1V3WkRSaU9EUXRNVGc1WkMwMFl6ZzJMVGd5TW1RdE5Ua3dOakF5WmpZeU1EWXlJaXdpYVhOeklqb2lhSFIwY0hNNlhDOWNMMjFoYzNSbGNtTmhjbVF1WTI5dElpd2ljMk52Y0dWRVlYUmhJam9pZTF3aVlYVjBhRk5sYzNOcGIyNUpaRndpT2x3aU1HWXpNRFExWXpZdE56YzBZUzAwTUdNekxXRXhNV1F0WWpFMk1tTXlNVFpqTURVM1hDSXNYQ0p6Y21ORGJHbGxiblJKWkZ3aU9sd2lOV1V3WkRSaU9EUXRNVGc1WkMwMFl6ZzJMVGd5TW1RdE5Ua3dOakF5WmpZeU1EWXlYQ0lzWENKemNtTkRiM0p5Wld4aGRHbHZia2xrWENJNlhDSTFOVFF5WkRkak5TMDROMk00TFRRM1pUSXRZVEl6TlMxbE4yRXlPVGhtWXpKak5EQmNJbjBpTENKbGVIQWlPakUzTlRnNU1qQTJOaklzSW1saGRDSTZNVGMxT0RreU1ETTJNaXdpYW5ScElqb2lNRGxoTkRjM1pqZ3RPR1V5TlMwME16WXdMVGt4WkRVdE56Y3paV0ZqWmpka05ESmxJbjAuZDNiQmZmbG9YcnFDajBxTW9ldVpzbmxvc3Z5UHhCX1NSdEdteHR4Y3pUWl9HbUR6MVRkWU9VY0FvRWNPR0t5WHJDUWExVzEtN3dpeFk3ZFpyb1FoVVkteTFFclpDOVVkSzVTcHFyMHhqbHVOQ2ZNclVIMUdJMmFfY0FPSWZWSXJ2NWN5a2hrSm5Fb1NIcnVwZDExeUgwcmlVRWJlX2l2cl91Yy1xOFlEUkw4ZGF6Zy1uQ21qd2p6dmtxdXkwQWVad1lGMUM4LVM4U1RSZXRzRW52aDZid3dFcm1QN2g5dk9HenppRzEtX0ZjRnZZNmJYSGlxc3lBM0Q1M1U4NndjVGItQm5mdVFLQ19hclppcE9kczNpQ3FpTFhxbU5UVTg3WGtYejA3d09PeXRFZVdrRWdCX0ZjZmg5RFdjelBPRUtWVDhxcF9LUXBKM3M0R0xRSkFBRjhR&amp;traceId=4f339be7.7e5d95c4-f07e-4965-86d9-6cd540a437ed.1758921250

**HTTPS callbackUri**

    https://sandbox.mcsrcteststore.com/macstools/auth-processing?&res=eyJyZXN1bHQiOiJBVVRIRU5USUNBVElPTl9TVUNDRVNTIiwicmVxdWlyZUFkZGl0aW9uYWxBdXRoIjpmYWxzZSwiYXV0aGVudGljYXRpb25TZXNzaW9uSWQiOiJmYTY3Yjc4Yy1hMWZkLTQyYTQtYTg5MS1mZDdmODE1MDgxZmQifQ%3D%3D 

> **Step 4:** The Integrator calls the [Authenticate API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#AccountHolderAuthenticationsAuthenticateProfile).The response contains **proof of authentication `assuranceData`** , which includes:
> **Proof of Passkey payment authentication**.

```json
{
  "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
  "srcCorrelationId": "e59b2feb-d149-4deb-aba8-0897d162a864",
  "srcDigitalCardId": "9ZtsqSdrQpikwY3aphMabg000000000000GB",
  "authenticationSessionId": "464f29b3-b155-4b6d-a56d-c0ecf3672883",
  "authenticationMethod": {
    "authenticationMethodType": "MANAGED_AUTHENTICATION",
    "authenticationSubject": "CARDHOLDER"
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.cd5b31a2-d132-42ad-b565-ebb1f941be1e.1758166836"
  }
}
```

```json
{
  "srcCorrelationId": "ddc1a2da-3b46-4cee-ae67-1917d96b3fcf",
  "authenticationSessionId": "7949c27e-883a-4100-a605-e0ac3f2ced6f",
  "authenticationResult": "AUTHENTICATED",
  "authenticationStatus": "COMPLETE",
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "02",
        "verificationMethod": "07",
        "verificationResults": "01",
        "verificationTimestamp": "1758313379228",
        "verificationEvents": [
          "01"
        ],
        "additionalData": "eyJ0eXBlIjoiRklETzIiLCJjZXJ0aWZpZWRNZmFNZXRob2RJZCI6IjIwMDAxIiwibWZhTWV0aG9kSW5zdGFuY2VJZCI6InM0eWRYdzQ3VExPYnNKS3VTZE9rT3cwMDAwMDAwMDAwMTBVUyIsImFzc2VydGlvbiI6ImV5SnJhV1FpT2lJeU1ESXpNREV5TmpFeE5ETTBOUzF6ZEdjdGJXTXRibVYzTFdsa1pXNTBhWFI1TFhabGNtbG1hV05oZEdsdmJpMXpjbU10YldGemRHVnlZMkZ5WkMxcGJuUWlMQ0owZVhBaU9pSktWMVFyWlhoMExtTmhjbVJmZEc5clpXNGlMQ0poYkdjaU9pSlNVekkxTmlKOS5leUpoZFdRaU9pSm9kSFJ3Y3pwY0wxd3ZiV0Z6ZEdWeVkyRnlaQzVqYjIwaUxDSmpZWEprU1dRaU9pSXlVVmh0WW1kcFZsTjVlVGxKYlMxTVlUUTFhVlZSTURBd01EQXdNREF3TURBd1ZWTWlMQ0pwYzNNaU9pSm9kSFJ3Y3pwY0wxd3ZiV0Z6ZEdWeVkyRnlaQzVqYjIwaUxDSmpiM0p5Wld4aGRHbHZia2xrSWpvaVpHRmxOMkUzTldNdFlUaG1aUzAwTkRZNUxUa3dZVGd0TmpZd016TmxORGM1T0dFMElpd2ljMk52Y0dWRVlYUmhJam9pZTF3aVlYVjBhR1Z1ZEdsallYUnBiMjVTWlhOMWJIUmNJanBjSWtGVlZFaEZUbFJKUTBGVVJVUmNJaXhjSW1selEyaGhiR3hsYm1kbFVHVnlabTl5YldWa1hDSTZYQ0owY25WbFhDSXNYQ0poZFhSb1pXNTBhV05oZEdsdmJrWmhZM1J2Y25OY0lqcGNJakF5TUVGY0lpeGNJbU5sY25ScFptbGxaRTFtWVUxbGRHaHZaRWxrWENJNlhDSXlNREF3TVZ3aUxGd2lZWFYwYUdWdWRHbGpZWFJwYjI1VWFXMWxYQ0k2WENJeE56VTRNekV6TXpjNU1qSTRYQ0lzWENKemNtTkRiR2xsYm5SSlpGd2lPbHdpTVRNME16VXlPVFF0Wm1FMFpTMDBZV05pTFRobVpUWXRNRFZoWWpZMllqQTRPRGd4WENJc1hDSnRabUZHVEZOUmRXRnNhV1pwWlhKY0lqcGNJblJ5ZFdWY0lpeGNJbUYxZEdoVFpYTnphVzl1U1dSY0lqcGNJbUl6WVdVeFl6VmxMVGN4TmpZdE5EQXhOaTA0T0ROaUxXUTNPVEkzTjJVeE4yWTNZVndpTEZ3aVlYQndTVzV6ZEdGdVkyVkpaRndpT2x3aVQwMXhXV1phUlZGU1JqSm5kVU5SYkZZdFZXUk5kekF3TURBd01EQXdNREF4TUZWVFhDSXNYQ0poZFhSb1pXNTBhV05oZEdsdVowVnVkR2wwZVVsa1hDSTZYQ0pCTWpBd01Gd2lMRndpWVhWMGFHVnVkR2xqWVhScGIyNU5aWFJvYjJSY0lqcGNJa1pKUkU4eVhDSXNYQ0owY21GdWMyRmpkR2x2YmtGdGIzVnVkRndpT2x3aU1USXdMalE1WENJc1hDSjBjbUZ1YzJGamRHbHZia04xY25KbGJtTjVRMjlrWlZ3aU9sd2lWVk5FWENJc1hDSnRabUZOWlhSb2IyUkpibk4wWVc1alpVbGtYQ0k2WENKek5IbGtXSGMwTjFSTVQySnpTa3QxVTJSUGEwOTNNREF3TURBd01EQXdNREV3VlZOY0lpeGNJbVJoWENJNlczdGNJbkJoY21GdFpYUmxjazVoYldWY0lqcGNJbVJsWm1GMWJIUmNJaXhjSW5CaGNtRnRaWFJsY2xaaGJIVmxYQ0k2WENKMGNuVmxYQ0o5TEh0Y0luQmhjbUZ0WlhSbGNrNWhiV1ZjSWpwY0lrRkZYMVJaVUVWZk0xd2lMRndpY0dGeVlXMWxkR1Z5Vm1Gc2RXVmNJanBjSW5SeWRXVmNJbjBzZTF3aWNHRnlZVzFsZEdWeVRtRnRaVndpT2x3aVFVVmZWRmxRUlY4MFhDSXNYQ0p3WVhKaGJXVjBaWEpXWVd4MVpWd2lPbHdpZEhKMVpWd2lmVjBzWENKaGRYUm9aVzUwYVdOaGRHbHZibEpsWVhOdmJuTmNJanBiWENKVVVrRk9VMEZEVkVsUFRsOUJWVlJJUlU1VVNVTkJWRWxQVGx3aVhYMGlMQ0p6WTI5d1pYTWlPbHNpVkU5TFJVNWZRa2xPUkNJc0lrRlZWRWhGVGxSSlEwRlVTVTlPVXlKZExDSmxlSEFpT2pFM05UZ3pNVE0yTnprc0ltbGhkQ0k2TVRjMU9ETXhNek0zT1N3aWFuUnBJam9pTVRCbE9ETmpZMkl0TldabE5pMDBNalF3TFRsaE5EUXRNakUyWWpoa01tWTNaamMxSW4wLlZJTUpIV0ZHLWM0M25oZFpMLWM4YzB2eU1fYlFrRjl5NTBqektqQlNvWl9IZWxxVWdrbTRDSjdhRUcwZ3VHX0N3aVlLQlFVZ3M3cVlZc3ZRNVAzOWNFRS1iUTdpY2NNaHhHMWFNY2pCbWtFYzdvMjRNNWRnNk9ITlJCejRqeVh0QzB2UlJJZW1YYnFtcEt6dGpJVFJVaHJlVHBLVW1OQmI2WWNrTmlpeVUtWnl6b1J3ZTMxd3pQMXhDam10TkFGOEpKeC1keld1UHFTcUZRUkVzMk8wX2p3WkFtZXpCeGcyZFVoOVdTRHRTcGc4bV9JSHVfTDBvcTVQaGI0RDA0TEV3cDQ3OE1qdThlQk1PeDJXZXpURVREZkptNGVzT1NfUHExUkM2LUlnME9KMzBGYllzR1BfOGNneU40aWlvd2ZRNEVGd3RwVFY1ZmltVS00aTJPa2dZdyJ9"
      }
    ]
  },
  "headers": {
    "X-SRC-CX-FLOW-ID": "34f4a04b.812f4db0-3456-4573-a266-e5ac5105a1f0.1758681980"
  }
}
```

> **Step 5** : Integrator calls the [Checkout API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) with proof of Passkey payment authentication `assuranceData` and receives the encrypted checkout payload in response. Upon decryption of this payload, the integrator obtains the `eci` and **DSRP-V3** data.

```json
{
  "srcClientId": "5e0d4b84-189d-4c86-822d-590602f62062",
  "srcDpaId": "5e0d4b84-189d-4c86-822d-590602f62062_SCOF",
  "srcCorrelationId": "5542d7c5-87c8-47e2-a235-e7a298fc2c40",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#DOCUMENTATION-UPN2#01",
  "srcDigitalCardId": "akFdIPFQS0-alRpvs4oDzA000000000000US",
  "dpaTransactionOptions": {
    "transactionAmount": {
      "transactionAmount": 12.12,
      "transactionCurrencyCode": "USD"
    }
  },
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "02",
        "verificationMethod": "07",
        "verificationResults": "01",
        "verificationTimestamp": "1758920382986",
        "additionalData": "eyJ0eXBlIjoiRklETzIiLCJjZXJ0aWZpZWRNZmFNZXRob2RJZCI6IjIwMDAxIiwibWZhTWV0aG9kSW5zdGFuY2VJZCI6ImRvVmZ1WHhoU3RDREdrREpQcXRqVHcwMDAwMDAwMDAwMTBVUyIsImFzc2VydGlvbiI6ImV5SnJhV1FpT2lJeU1ESXpNREl3T0RBNE5URTFOeTF6WVc1a1ltOTRMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgwTG1OaGNtUmZkRzlyWlc0aUxDSmhiR2NpT2lKU1V6STFOaUo5LmV5SmhkV1FpT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKallYSmtTV1FpT2lKaGEwWmtTVkJHVVZNd0xXRnNVbkIyY3pSdlJIcEJNREF3TURBd01EQXdNREF3VlZNaUxDSnBjM01pT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKamIzSnlaV3hoZEdsdmJrbGtJam9pTlRVME1tUTNZelV0T0Rkak9DMDBOMlV5TFdFeU16VXRaVGRoTWprNFptTXlZelF3SWl3aWMyTnZjR1ZFWVhSaElqb2llMXdpWVhWMGFHVnVkR2xqWVhScGIyNVNaWE4xYkhSY0lqcGNJa0ZWVkVoRlRsUkpRMEZVUlVSY0lpeGNJbWx6UTJoaGJHeGxibWRsVUdWeVptOXliV1ZrWENJNlhDSjBjblZsWENJc1hDSmhkWFJvWlc1MGFXTmhkR2x2YmtaaFkzUnZjbk5jSWpwY0lqQXlNRUZjSWl4Y0ltTmxjblJwWm1sbFpFMW1ZVTFsZEdodlpFbGtYQ0k2WENJeU1EQXdNVndpTEZ3aVlYVjBhR1Z1ZEdsallYUnBiMjVVYVcxbFhDSTZYQ0l4TnpVNE9USXdNemd5T1RnM1hDSXNYQ0p6Y21ORGJHbGxiblJKWkZ3aU9sd2lOV1V3WkRSaU9EUXRNVGc1WkMwMFl6ZzJMVGd5TW1RdE5Ua3dOakF5WmpZeU1EWXlYQ0lzWENKdFptRkdURk5SZFdGc2FXWnBaWEpjSWpwY0luUnlkV1ZjSWl4Y0ltRjFkR2hUWlhOemFXOXVTV1JjSWpwY0ltSmtPRGxrTVRBMExXRXhaVEF0TkdObU1pMDVNRGd3TFRVMU1XVTVOV05qWXprM1lsd2lMRndpWVhCd1NXNXpkR0Z1WTJWSlpGd2lPbHdpWVRoVlFtOUZTRk5TV2tOTVkzbG1MWGM0VGpSWlp6QXdNREF3TURBd01EQXhNRlZUWENJc1hDSmhkWFJvWlc1MGFXTmhkR2x1WjBWdWRHbDBlVWxrWENJNlhDSkJNakF3TUZ3aUxGd2lZWFYwYUdWdWRHbGpZWFJwYjI1TlpYUm9iMlJjSWpwY0lrWkpSRTh5WENJc1hDSjBjbUZ1YzJGamRHbHZia0Z0YjNWdWRGd2lPbHdpTVRJdU1USmNJaXhjSW5SeVlXNXpZV04wYVc5dVEzVnljbVZ1WTNsRGIyUmxYQ0k2WENKVlUwUmNJaXhjSW0xbVlVMWxkR2h2WkVsdWMzUmhibU5sU1dSY0lqcGNJbVJ2Vm1aMVdIaG9VM1JEUkVkclJFcFFjWFJxVkhjd01EQXdNREF3TURBd01UQlZVMXdpTEZ3aVpHRmNJanBiZTF3aWNHRnlZVzFsZEdWeVRtRnRaVndpT2x3aVpHVm1ZWFZzZEZ3aUxGd2ljR0Z5WVcxbGRHVnlWbUZzZFdWY0lqcGNJblJ5ZFdWY0luMHNlMXdpY0dGeVlXMWxkR1Z5VG1GdFpWd2lPbHdpUVVWZlZGbFFSVjh6WENJc1hDSndZWEpoYldWMFpYSldZV3gxWlZ3aU9sd2lkSEoxWlZ3aWZTeDdYQ0p3WVhKaGJXVjBaWEpPWVcxbFhDSTZYQ0pCUlY5VVdWQkZYelJjSWl4Y0luQmhjbUZ0WlhSbGNsWmhiSFZsWENJNlhDSjBjblZsWENKOVhTeGNJbUYxZEdobGJuUnBZMkYwYVc5dVVtVmhjMjl1YzF3aU9sdGNJbFJTUVU1VFFVTlVTVTlPWDBGVlZFaEZUbFJKUTBGVVNVOU9YQ0pkZlNJc0luTmpiM0JsY3lJNld5SlVUMHRGVGw5Q1NVNUVJaXdpUVZWVVNFVk9WRWxEUVZSSlQwNVRJbDBzSW1WNGNDSTZNVGMxT0RreU1EWTRNaXdpYVdGMElqb3hOelU0T1RJd016Z3lMQ0pxZEdraU9pSTVZMkl6TW1JNU1pMDJNakE1TFRRelpETXRPRFpqWkMwM04yTTRaRFEzT0Roa05UZ2lmUS5BZkZ5VUhSTVl2ZW5xbmptX080NktTTnhId3ZjV1dXX2VZN2ZpdFo1R1gyQmJZR29hNlMtZzVqVmJkR1Q3OHI5V1lHZmJiendrQ0hjNTNiQTMyVENDNnRjc0ZBNnVOWlhnOGZSSzlRdzI4R2R5bTRJeHFFTm44VFhULV9EdzBmdjRZejNlU0VXdldubVlzRFdzWjNKUmpVTjJxbVJ5TWlLMTE4ZkRBclJKWld4TEY1Z0FHRTNZeW5IT1dTVjlMa0xzS2h6UXhfYktFNkpKR1ZVRmxyMmw1b2hYVUFsZDZPVGF6VEVKb3RQaDJrLV9qWklyTUtBR1QzY09yODY3S0FBM2NpTXFwY0tSbWwzRUtxLXpiMk5OREpFakViQUY5VWdySElpX3EzR0lEellGUjc5MTBhTF9nVGhoeUtWaU1VamEyWHl4UlRmM2JWNks0QkFQT2hQZGcifQ==",
        "verificationEvents": [
          "01"
        ]
      }
    ]
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "4f339be7.7e5d95c4-f07e-4965-86d9-6cd540a437ed.1758921250"
  }
}
```

```json
{
  "checkoutResponseJWS": "eyJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpYXQiOjE3NTg5MjAzOTcsImFsZyI6IlJTMjU2IiwianRpIjoiYTg1MmMyZTUtYjE0MS00YmU4LWI1ZjctYmM3NDgxNWEyZTAzIiwia2lkIjoiMjAyMzAyMDcxNjQ2MTMtc2FuZGJveC1wYXlsb2FkLXZlcmlmaWNhdGlvbi1zcmMtbWFzdGVyY2FyZC1pbnQifQ.eyJzcmNDb3JyZWxhdGlvbklkIjoiNTU0MmQ3YzUtODdjOC00N2UyLWEyMzUtZTdhMjk4ZmMyYzQwIiwiZW5jcnlwdGVkUGF5bG9hZCI6ImV5SnJhV1FpT2lKemRHRnlkRk5oYm1SaWIzaEZibU10TVRNd01qSXdNalVpTENKbGJtTWlPaUpCTVRJNFIwTk5JaXdpWVd4bklqb2lVbE5CTFU5QlJWQXRNalUySW4wLkt6dFlzSnhtQVNNbDJ6UkpJY0ttU0RJWjFDS3JJNTg1VWhwanBoZ2pzTUVCbU1IaDMxaHRUTHdpdVhTbDRON1dudEdOYnVaQnJCUFpfbmlLc0UzODZDcTdfOWlaSkRDQkdaUE1HRE5RNFdkU2xjX2NjRmd2M0hnR1dzU0dFVDIzV0lRR1pSNHFDSlpLbDVfcHI1QmxfR0NwWU1WX3JMTTNpREZHV0tDdXBGYW9YX1ZpZmg0cV9na2U0M1hLaHB3ZFZDNm04anBwRlR2SHVwVGREVkN6VnZBcXRHVkp4WjB0R0RwNnA0cjVuMjdPc0Y4TVUyZGU1dFdlcDhsR1p2cFZqME0yWDR0b3BzY0cwMFk1NWZfMkphTG1xMUg4Q2hweEQ1T1E2MS0xVHAzYVdIUXY5cHlMV3ZDOXJxQ3pzTEhnMDVvbm5YQ0FET01xXzZCeG9lWTd1dy5hWlowTDBvaGdrV3l4Y0Y3LloydENLSXRwQTRTUm13Zk9rRWwyZ2NZSnhLUkx1YlhESnNJR2VzOTBBTkhER0VqRjRpcDZtQjN6bW5MZ1d3QmtqVGp0OExYVUU2bUYtNjRRWEVfOE83YVZMMVEzeE1kemV2NXVBTG5wRm9taDRZTzVTUkJxc3E5UjIyeXBWYV84ZFN3SHhqenRaMlNDVW1aelNodVQ2dWkwUi1McTlMTFFVRDRaQjZYT2piOHM3dEd6alZnX2pSNjlkRUpOdGVXZFN2N3hQdmFiMERyay1JejRvMDgyNmxkenFQNlZsVFhqdHZIWGc3c202NzVSLTB6LXM4Z3QxVDdUYzNCTUVHMm9MMldsWVNvNmVZSW1xN3lNcFY5M3JCblZNUExJT2xUeXp3b0stc3pRcjJoWHRqalotWm5CNVdFSTJwWGtDaWJfZXk3MEFpTllxZFg3YmhQS3hBQ3NoOXp4OWY2akNTMjFnWWNUNmtqUHNqOWhMSGJJTGRiaVcyVkJvRHFJOTJTdHJhclhkbmpHM00xYU55aUdNR1J3Wng0OThLRnp4dzJBSjdJXzE2Z3NpS1FITE9UblM2eUZBZjlOeU9kVWYzT2dGdXk0TlJocTVMRGJMdUZ3MGYtNXo2c09iYlhUUTdPQ1I3ZWwxMk9jaHcuZE8tNVdvOEpCM0g0UWV2akpBUGI5QSIsIm1hc2tlZENhcmQiOnsic3JjRGlnaXRhbENhcmRJZCI6ImFrRmRJUEZRUzAtYWxScHZzNG9EekEwMDAwMDAwMDAwMDBVUyIsInBhbkJpbiI6IjUyMDQ3MyIsInBhbkxhc3RGb3VyIjoiMDUwNiIsInRva2VuQmluUmFuZ2UiOiI1MjA0NzMiLCJ0b2tlbkxhc3RGb3VyIjoiNjI1NCIsImRpZ2l0YWxDYXJkRGF0YSI6eyJzdGF0dXMiOiJBQ1RJVkUiLCJkZXNjcmlwdG9yTmFtZSI6IlRlc3QgQmFuayAyIiwiYXJ0VXJpIjoiaHR0cHM6Ly9zYnguYXNzZXRzLm1hc3RlcmNhcmQuY29tL2NhcmQtYXJ0L2NvbWJpbmVkLWltYWdlLWFzc2V0LzQyZDMxZWFlLTk5NjEtNDViNi05ZmUzLTc2YWQ3MGEwYTUyNS5wbmciLCJpc0NvQnJhbmRlZCI6ZmFsc2UsImxvbmdEZXNjcmlwdGlvbiI6IlRlc3QgQmFuayBmb3IgTWFzdGVyQ2FyZCBNVEYiLCJmb3JlZ3JvdW5kQ29sb3IiOiIwZjBmMGYiLCJpc3N1ZXJOYW1lIjoiVGVzdCBJc3N1ZXIifSwicGFuRXhwaXJhdGlvbk1vbnRoIjoiMDgiLCJwYW5FeHBpcmF0aW9uWWVhciI6IjIwMjkiLCJwYXltZW50Q2FyZERlc2NyaXB0b3IiOiJtYXN0ZXJjYXJkIiwicGF5bWVudENhcmRUeXBlIjoiREVCSVQiLCJzZXJ2aWNlSWQiOiJTRUNVUkVfQ09GX0NPTU1FUkNFX1BMQVRGT1JNI0RPQ1VNRU5UQVRJT04tVVBOMiMwMSIsImRhdGVPZkNhcmRDcmVhdGVkIjoiMjAyNS0wOS0yNVQxOTozODozNS42MTFaIiwiZGF0ZU9mQ2FyZExhc3RVc2VkIjoiMjAyNS0wOS0yNVQxOTozOTo1NC41NzBaIiwiZGVsZWdhdGVkQXV0aGVudGljYXRpb25Nb2RlbHMiOlt7Im1vZGVsVHlwZSI6IkFFX1RZUEVfNCIsImlzU3VwcG9ydGVkIjp0cnVlfV19LCJtYXNrZWRDb25zdW1lciI6eyJzcmNDb25zdW1lcklkIjoiNmEzYjNhODgtNjQwOC00ZjEyLTlhZTEtODM4ZTgxNDFiM2QwIiwibWFza2VkQ29uc3VtZXJJZGVudGl0eSI6eyJpZGVudGl0eVR5cGUiOiJFWFRFUk5BTF9BQ0NPVU5UX0lEIiwibWFza2VkSWRlbnRpdHlWYWx1ZSI6ImExN2M0ZTA0LTI2ZjUtNDRhMC04ZjU1LWEzY2VkNTFhOWE5NyJ9LCJtYXNrZWRNb2JpbGVOdW1iZXIiOnt9LCJzdGF0dXMiOiJBQ1RJVkUiLCJtYXNrZWRGdWxsTmFtZSI6IiIsImRhdGVDb25zdW1lckFkZGVkIjoiMjAyNS0wOS0yNVQxOTozODozNS4xMjRaIn0sImN1c3RvbU91dHB1dERhdGEiOnsicmVtb3RlQ29tbWVyY2VBY2NlcHRvcklkZW50aWZpZXIiOiJhSFIwY0RvdkwzZDNkeTVOUlZKRFNFRk9SRWxUUlM1amIyMD0ifSwiYXNzdXJhbmNlRGF0YSI6eyJjYXJkVmVyaWZpY2F0aW9uRW50aXR5IjoiMDIiLCJjYXJkVmVyaWZpY2F0aW9uTWV0aG9kIjoiMDMiLCJjYXJkVmVyaWZpY2F0aW9uUmVzdWx0cyI6IjAzIiwidmVyaWZpY2F0aW9uRGF0YSI6W3sidmVyaWZpY2F0aW9uVHlwZSI6IkNBUkRIT0xERVIiLCJ2ZXJpZmljYXRpb25FbnRpdHkiOiIwMiIsInZlcmlmaWNhdGlvbk1ldGhvZCI6IjA3IiwidmVyaWZpY2F0aW9uUmVzdWx0cyI6IjAxIiwidmVyaWZpY2F0aW9uVGltZXN0YW1wIjoiMTc1ODkyMDM4Mjk4NiIsInZlcmlmaWNhdGlvbkV2ZW50cyI6WyIwMSJdfV0sImVjaSI6IjAyIn0sImtleUZpbmdlcnByaW50SWQiOiJiNTUzMTQ0ZWZjZGFlYTBkODIwZDZiYjBiMzNjYTJhYWQ0Yjc2ZmEzZTBkYzAyMGEyNGJjMGVkMjIyNDFmNDFlIiwiZWNpIjoiMDIifQ.fiYe5CzvNfuIDb2hI7UXMPu0Tb18K1tEwCqtVfsc8pL-0XLYgNLIk4XPbZ_g4mrP09svjknnMt4snZUA0KYGWELDaAkwe5FjNgHg0BAeemeRJph7JLS7HdF122u7zaL1BBajnT7xoOABpGaU4_efz6WRhHlibxZhAcqaHQkEgYOJIPLXDjurr9S80JMOT1-zuD3nPz3a29yWDkORA0twpAfB96E0tgnXi89e1jGqjtL4oPo0MEoFgawSfrK7RiJKDNiEEewCc-c6hggq2LANuHilIRKMFvNYFozbR9KPgwuTtOSY6YvR2tT5ZJygwZA13349KHjfsFTkVWjDGoUZBQ",
"headers": {
"X-SRC-CX-FLOW-ID": "[4f339be7.7e5d95c4-f07e-4965-86d9-6cd540a437ed.1758921298]"
}
}
```

```json
{
  "checkoutResponseJWSPayload": {
    "srcCorrelationId": "5542d7c5-87c8-47e2-a235-e7a298fc2c40",
    "encryptedPayload": "eyJraWQiOiJzdGFydFNhbmRib3hFbmMtMTMwMjIwMjUiLCJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.KztYsJxmASMl2zRJIcKmSDIZ1CKrI585UhpjphgjsMEBmMHh31htTLwiuXSl4N7WntGNbuZBrBPZ_niKsE386Cq7_9iZJDCBGZPMGDNQ4WdSlc_ccFgv3HgGWsSGET23WIQGZR4qCJZKl5_pr5Bl_GCpYMV_rLM3iDFGWKCupFaoX_Vifh4q_gke43XKhpwdVC6m8jppFTvHupTdDVCzVvAqtGVJxZ0tGDp6p4r5n27OsF8MU2de5tWep8lGZvpVj0M2X4topscG00Y55f_2JaLmq1H8ChpxD5OQ61-1Tp3aWHQv9pyLWvC9rqCzsLHg05onnXCADOMq_6BxoeY7uw.aZZ0L0ohgkWyxcF7.Z2tCKItpA4SRmwfOkEl2gcYJxKRLubXDJsIGes90ANHDGEjF4ip6mB3zmnLgWwBkjTjt8LXUE6mF-64QXE_8O7aVL1Q3xMdzev5uALnpFomh4YO5SRBqsq9R22ypVa_8dSwHxjztZ2SCUmZzShuT6ui0R-Lq9LLQUD4ZB6XOjb8s7tGzjVg_jR69dEJNteWdSv7xPvab0Drk-Iz4o0826ldzqP6VlTXjtvHXg7sm675R-0z-s8gt1T7Tc3BMEG2oL2WlYSo6eYImq7yMpV93rBnVMPLIOlTyzwoK-szQr2hXtjjZ-ZnB5WEI2pXkCib_ey70AiNYqdX7bhPKxACsh9zx9f6jCS21gYcT6kjPsj9hLHbILdbiW2VBoDqI92StrarXdnjG3M1aNyiGMGRwZx498KFzxw2AJ7I_16gsiKQHLOTnS6yFAf9NyOdUf3OgFuy4NRhq5LDbLuFw0f-5z6sObbXTQ7OCR7el12Ochw.dO-5Wo8JB3H4QevjJAPb9A",
    "maskedCard": {
      "srcDigitalCardId": "akFdIPFQS0-alRpvs4oDzA000000000000US",
      "panBin": "520473",
      "panLastFour": "0506",
      "tokenBinRange": "520473",
      "tokenLastFour": "6254",
      "digitalCardData": {
        "status": "ACTIVE",
        "descriptorName": "Test Bank 2",
        "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/42d31eae-9961-45b6-9fe3-76ad70a0a525.png",
        "isCoBranded": false,
        "longDescription": "Test Bank for MasterCard MTF",
        "foregroundColor": "0f0f0f",
        "issuerName": "Test Issuer"
      },
      "panExpirationMonth": "08",
      "panExpirationYear": "2029",
      "paymentCardDescriptor": "mastercard",
      "paymentCardType": "DEBIT",
      "serviceId": "SECURE_COF_COMMERCE_PLATFORM#DOCUMENTATION-UPN2#01",
      "dateOfCardCreated": "2025-09-25T19:38:35.611Z",
      "dateOfCardLastUsed": "2025-09-25T19:39:54.570Z",
      "delegatedAuthenticationModels": [
        {
          "modelType": "AE_TYPE_4",
          "isSupported": true
        }
      ]
    },
    "maskedConsumer": {
      "srcConsumerId": "6a3b3a88-6408-4f12-9ae1-838e8141b3d0",
      "maskedConsumerIdentity": {
        "identityType": "EXTERNAL_ACCOUNT_ID",
        "maskedIdentityValue": "a17c4e04-26f5-44a0-8f55-a3ced51a9a97"
      },
      "maskedMobileNumber": {},
      "status": "ACTIVE",
      "maskedFullName": "",
      "dateConsumerAdded": "2025-09-25T19:38:35.124Z"
    },
    "customOutputData": {
      "remoteCommerceAcceptorIdentifier": "aHR0cDovL3d3dy5NRVJDSEFORElTRS5jb20="
    },
    "assuranceData": {
      "cardVerificationEntity": "02",
      "cardVerificationMethod": "03",
      "cardVerificationResults": "03",
      "verificationData": [
        {
          "verificationType": "CARDHOLDER",
          "verificationEntity": "02",
          "verificationMethod": "07",
          "verificationResults": "01",
          "verificationTimestamp": "1758920382986",
          "verificationEvents": [
            "01"
          ]
        }
      ],
      "eci": "02"
    },
    "keyFingerprintId": "b553144efcdaea0d820d6bb0b33ca2aad4b76fa3e0dc020a24bc0ed22241f41e",
    "eci": "02"
  },
  "decryptedPayload": {
    "token": {
      "paymentToken": "************6254",
      "tokenExpirationMonth": "09",
      "tokenExpirationYear": "2028",
      "paymentAccountReference": "50018A4AJEOBUB9WYZWZFJ3FEG67C",
      "panSequenceNumber": "00"
    },
    "srcTokenResultsData": {
      "unpredictableNumber": "573dc961"
    },
    "dynamicData": {
      "dynamicDataValue": "MGWXYG9AbwEvAAJXPclhAAADFIA=",
      "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
    }
  }
}
```

## Scenario 13 {#scenario-13}

**Assumptions**   

* The integrator is onboarded to the **Mastercard Card Checkout Solutions -- Secure Card on File** program and authorized to make API calls.
* The card used for enrollment is **token-eligible**.
* The **test card's country and issuer** are configured to support **Mastercard FIDO and MDES Identity \& Verification (ID\&V)**.
* The client is **eligible to request Mastercard Passkey authentication.**
* The **issuer's country** is **enabled for MDES Identity \& Verification (ID\&V).** .   

**When**   
> On Integrator's website, user enters valid card details with` primaryAccountNumber`, `panExpirationMonth`,` panExpirationYear`, `cardSecurityCode`,and Integrator calls the [POST /EnrollCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card).

```json
{
  "srcClientId": "6aff5cba-3aac-4fe0-b0cd-a52fc948d0c6",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#E2E#01",
  "srcDpaId": "5e0d4b84-189d-4c86-822d-590602f62062_dpa1",
  "cardSource": "CARDHOLDER",
  "consumer": {
    "consumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "identityValue": "f0c04b97-4dcb-485d-a4f4-7ae437a2e955"
    }
  },
  "encryptedCard": "eyJraWQiOiIyMDIzMDIwNzIyMzUyMS1zYW5kYm94LWZwYW4tZW5jcnlwdGlvbi1zcmMtbWFzdGVyY2FyZC1pbnQiLCJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMTI4R0NNIn0.PyG31_2YRpHenM0NnJT2AiCF0RSqAwjVj8ETMOe-XWEISls5GtdX38epn4BGQUCVKRl7XjGPUl--U2_8HnWG7qQe2SAp7F0ZiUHczBMAdAh96aIe5RylBhBeha3bH7-EpqMYyyJwkUSck6mvhLP8XbM0ZRDeowebydrNaeWfDC8jFqblhXje-TSw4TV_VBQt_iPs2Btw52n89fSO1baVGkd3-jhqsZ1vwUJUlzWMBfyWQPfKZhNrC1xIbCJAz_Pxeqk5iT5tNdqa2BR1DZX6psQt4X2idGEo6EOUmYQFY_wG4caQj9lUzglypwyk2PXM_lFlUMN8lsshB6hgGrD5mg.VohUTeqfW_Jq7G-G.Tn1uGb3v25Aa7q1UgSHV5BVwHPjNfE5MdWidUTyzVfaB2f-Ov-tQGK31l4dNhkOEs4pmO2JW94teDrq4rQXyLoA66PDcET5_rqhFZO07-JRrwSj8iZLNCH3mB3x-ygHvGaFwgRpzQx24dQCB4B38oePkPnKlc7duQQysF5xp9oeR.lXWpTZO01Lqeeu7LWqknWg"
}
```

**Then**   
> **Step 1:** Mastercard responds with a response code of **200** , along with `srcDigitalCardId`, `maskedCard` and `digitalCardData`.

```json
{
  "srcCorrelationId": "ff97ef9b-4b1e-40c2-b522-42197061dc5a",
  "maskedCard": {
    "srcDigitalCardId": "9ajNArkAR66zqYyHCn0rCA000000000000US",
    "panBin": "512034",
    "panLastFour": "0747",
    "tokenUniqueReference": "DM4MMC1US000000013a3b395556c420e85bfebe54b219e36",
    "digitalCardData": {
      "status": "ACTIVE",
      "descriptorName": "MasterCard Test Bank",
      "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
      "pendingEvents": [
        "PENDING_SCA"
      ],
      "isCoBranded": "false",
      "authenticationMethods": [
        {
          "authenticationMethodType": "3DS",
          "authenticationSubject": "CARDHOLDER",
          "uriData": {
            "uri": "https://stage.src.mastercard.com/auth",
            "uriType": "WEB_URI"
          }
        },
        {
          "authenticationMethodType": "MANAGED_AUTHENTICATION",
          "authenticationSubject": "CARDHOLDER",
          "uriData": {
            "uri": "https://stage.src.mastercard.com/auth",
            "uriType": "WEB_URI"
          }
        }
      ]
    },
    "panExpirationMonth": "12",
    "panExpirationYear": "2024",
    "paymentCardType": "CREDIT",
    "serviceId": "SECURE_COF_COMMERCE_PLATFORM#E2E#01",
    "paymentAccountReference": "50015018T6JE5ZORJON0QTP9HHMYN",
    "dateOfCardCreated": "2024-10-03T14:29:30.685Z"
  },
  "maskedConsumer": {
    "srcConsumerId": "a7c53e04-dae7-4da0-9b4a-b3d8e8399ebb",
    "maskedConsumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "maskedIdentityValue": "f0c04b97-4dcb-485d-a4f4-7ae437a2e955"
    },
    "status": "ACTIVE",
    "dateConsumerAdded": "2024-10-03T14:29:27.441Z"
  }
}
```

> **Step 2:** Integrator calls [Lookup Authentication Method API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#lookupAccountHolderAuthenticationProfile) with `authenticationReasons` and receives one of the eligible MDES ID\&V methods in response.

```json
{
  "srcDigitalCardId": "PLReJE1YR3KvC3jSgxP7Mg000000000000AR",
  "srcCorrelationId": "8e280f17-bdae-4b9f-8ff5-799d78d12776",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_API_STG#01",
  "srcClientId": "5a9f8c51-7ad1-40c6-b828-b7437b9334f6",
  "authenticationContext": {
    "authenticationReasons": [
      "ENROLL_FINANCIAL_INSTRUMENT",
      "AUTHENTICATOR_REGISTRATION"
    ]
  }
}
```

```json
{
  "srcCorrelationId": "8e280f17-bdae-4b9f-8ff5-799d78d12776",
  "authenticationMethods": [
    {
      "authenticationMethodType": "SMS_OTP",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "uriData": {},
      "authenticators": []
    },
    {
      "authenticationMethodType": "EMAIL_OTP",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "uriData": {},
      "authenticators": []
    },
    {
      "authenticationMethodType": "APP_AUTHENTICATION",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "uriData": {},
      "authenticators": []
    },
    {
      "authenticationMethodType": "APP_PUSH_NOTIFICATION",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "uriData": {},
      "authenticators": []
    },
    {
      "authenticationMethodType": "ISSUER_RBA",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "uriData": {},
      "authenticators": []
    },
    {
      "authenticationMethodType": "FIDO2",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "AUTHENTICATOR_REGISTRATION",
        "TRANSACTION_AUTHENTICATION"
      ],
      "uriData": {},
      "authenticators": []
    }
  ]
}
```

> **Step 3:**   
>
> The integrator calls the [Authenticate API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#AccountHolderAuthenticationsAuthenticateProfile) and requests one of the following authentication methods:   
>
> * One-Time Password (OTP)   
> * App Authentication link   
> * App Push Notification   
> * Risk-Based Authentication (Issuer RBA)   
>   Ensure that all required fields are included in the request.   

```json
{
  "body": {
    "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881",
    "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
    "srcCorrelationId": "c3c3fc36-bc37-418f-bbbc-591dc2791178",
    "srcDigitalCardId": "EVnHnwc5QBmzzxDwYTIspA000000000000GB",
    "authenticationMethod": {
      "authenticationMethodType": "SMS_OTP",
      "authenticationSubject": "CARDHOLDER"
    },
    "authenticationContext": {
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "dpaData": {
        "dpaPresentationName": "Mastercard MTT Integrated - DPA 3 COF",
        "dpaName": "dpa3_of_MTT Integrated SRCI COF"
      },
      "dpaTransactionOptions": {
        "merchantName": "SAMPLE_MERCHANT",
        "dpaLocale": "en_AU"
      }
    }
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.c5deb17f-a130-4ba7-a000-5bf7c33c75db.1758142793"
  }
}
```

```json
{
  "body": {
    "srcCorrelationId": "c3c3fc36-bc37-418f-bbbc-591dc2791178",
    "authenticationSessionId": "8ac870af-e9f3-4af5-9a45-184e5086a221",
    "authenticationResult": "NOT_AUTHENTICATED",
    "authenticationStatus": "PENDING",
    "methodAttributes": {
      "uriData": {
        "uri": "https://stage.src.mastercard.com/auth?sav=ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldNdGJtVjNMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgw...",
        "uriType": "WEB_URI"
      }
    },
    "sessionAssuranceValue": "ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0..."
  },
  "headers": {
    "X-SRC-CX-FLOW-ID": "34f4a04b.c5deb17f-a130-4ba7-a000-5bf7c33c75db.1758142810"
  }
}
```

> **Step 4: Note: If `authenticationMethods.authenticationMethodType` = `ISSUER_RBA`, then skip this step.**   
>
> Integrator calls the [Authenticate API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#AccountHolderAuthenticationsAuthenticateProfile) again - once the Consumer has entered an OTP, or completed App Authentication, or Push Notification App Authentication to request proof of authentication and `assuranceData`.

```json
{
  "body": {
    "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881",
    "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
    "srcCorrelationId": "c3c3fc36-bc37-418f-bbbc-591dc2791178",
    "srcDigitalCardId": "EVnHnwc5QBmzzxDwYTIspA000000000000GB",
    "authenticationMethod": {
      "authenticationMethodType": "SMS_OTP",
      "authenticationSubject": "CARDHOLDER"
    },
    "authenticationContext": {
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "dpaData": {
        "dpaPresentationName": "Mastercard MTT Integrated - DPA 3 COF",
        "dpaName": "dpa3_of_MTT Integrated SRCI COF"
      },
      "dpaTransactionOptions": {
        "merchantName": "SAMPLE_MERCHANT",
        "dpaLocale": "en_AU"
      }
    }
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.c5deb17f-a130-4ba7-a000-5bf7c33c75db.1758142793"
  }
}
```

```json
{
  "srcCorrelationId": "4c50231e-2f43-44b1-81ee-a8e5be0af645",
  "srciTransactionId": "test-transaction-id",
  "authenticationSessionId": "4416a896-2e6c-42a9-8c49-531b4b1bc28c",
  "authenticationSessionExpiry": "4416a896-2e6c-42a9-8c49-531b4b1bc28c",
  "authenticationResult": "AUTHENTICATED | NOT_AUTHENTICATED",
  "authenticationStatus": "COMPLETE",
  "assuranceData": {
    "verificationType": "CARDHOLDER",
    "verificationEntity": "03",
    "verificationMethod": "04",
    "verificationResults": "01",
    "verificationTimestamp": "1678294563",
    "verificationEvents": "02",
    "additionalData": "=== Base64 Encoded AuthToken ==="
  }
}
```

> **Step 5:** Passkey Registration: Retrieve Authentication UI URL   
>
> * Call the **Authenticate API** to initiate passkey registration.   
> * Extract the `uri` value from the API response.   
> * The `uri` represents the **Authentication UI URL** that the integrator must launch or redirect the user to.   
>   Ensure that all required fields are included in the request before invoking the API.

```json
{
  "body": {
    "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881",
    "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
    "srcCorrelationId": "c3c3fc36-bc37-418f-bbbc-591dc2791178",
    "srcDigitalCardId": "EVnHnwc5QBmzzxDwYTIspA000000000000GB",
    "authenticationMethod": {
      "authenticationMethodType": "FIDO2",
      "authenticationSubject": "CARDHOLDER"
    },
    "authenticationContext": {
      "authenticationReasons": [
        "AUTHENTICATOR_REGISTRATION"
      ],
      "dpaData": {
        "dpaPresentationName": "Mastercard MTT Integrated - DPA 3 COF",
        "dpaName": "dpa3_of_MTT Integrated SRCI COF",
        "acquirerId": "550e8400",
        "acquirerBin": "44444"
      },
      "dpaTransactionOptions": {
        "merchantName": "START",
        "merchantCategoryCode": "0008",
        "merchantCountryCode": "US",
        "threeDsInputData": {
          "forceChallenge": false,
          "billingAddress": {}
        },
        "dpaLocale": "en_AU"
      },
      "consumerDeviceData": {
        "appInstanceId": "8c55b3bc-349c-4f0f-8daf-9f2787cb6d74",
        "spcEnabled": false
      },
      "callbackUri": {
        "uri": "https://eta-macs-test-tools.apps.stl.pcfstage00.mastercard.int/macstools/auth-processing?clientSessionId=a5132a4b-3578-41a8-8bbd-55ace74ea893",
        "uriType": "WEB_URI"
      }
    }
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.c5deb17f-a130-4ba7-a000-5bf7c33c75db.1758142793"
  }
}
```

```json
{
  "body": {
    "srcCorrelationId": "c3c3fc36-bc37-418f-bbbc-591dc2791178",
    "authenticationSessionId": "8ac870af-e9f3-4af5-9a45-184e5086a221",
    "authenticationResult": "NOT_AUTHENTICATED",
    "authenticationStatus": "PENDING",
    "methodAttributes": {
      "uriData": {
        "uri": "https://stage.src.mastercard.com/auth?sav=ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldNdGJtVjNMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgw...",
        "uriType": "WEB_URI"
      }
    },
    "sessionAssuranceValue": "ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0..."
  },
  "headers": {
    "X-SRC-CX-FLOW-ID": "34f4a04b.c5deb17f-a130-4ba7-a000-5bf7c33c75db.1758142810"
  }
}
```

> **Step 6:** Launch the Authentication UI
> Redirect the user to, or launch, the **Authentication UI URL (`uri`)** to complete **Passkey Registration** .
> The authentication result is returned asynchronously via the configured **HTTPS `callbackUri`**.

**Example Authentication URL:**

    https://sandbox.src.mastercard.com/auth?sav=ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldN

> **Step 7:**
> Once the callback status is received, call the **Authenticate API** again.Ensure that all required parameters are included in the request.   
>
> Retrieve the **proof of authentication** , specifically the `assuranceData` object.
> **Step 8:**   
>
> Integrator calls the [Bind API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication),and provides both the **proof of authentication** and the **`assuranceData`** .   
>
> Integrator completes Passkey binding to the consumer's device using the verified **ID\&V proof** .
> The Integrator now has a Mastercard Passkey enrolled which can be used for **subsequent transactions**.

## Scenario 14 {#scenario-14}

**Assumptions**   

* The integrator is onboarded to the **Mastercard Card Checkout Solutions -- Secure Card on File** program and authorized to make API calls.
* The card used for enrollment is **token-eligible**.
* The **test card's country and issuer** are configured to support **Mastercard FIDO and MDES Identity \& Verification (ID\&V)**.
* The client is **eligible to request Mastercard Passkey authentication.**
* The **issuer's country** is **enabled for MDES Identity \& Verification (ID\&V).** .   

**When**
> On Integrator's website, user enters valid card details with` primaryAccountNumber`, `panExpirationMonth`,` panExpirationYear`, `cardSecurityCode`,and Integrator calls the [POST /EnrollCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card).

```json
{
  "srcClientId": "6aff5cba-3aac-4fe0-b0cd-a52fc948d0c6",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#E2E#01",
  "srcDpaId": "5e0d4b84-189d-4c86-822d-590602f62062_dpa1",
  "cardSource": "CARDHOLDER",
  "consumer": {
    "consumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "identityValue": "f0c04b97-4dcb-485d-a4f4-7ae437a2e955"
    }
  },
  "encryptedCard": "eyJraWQiOiIyMDIzMDIwNzIyMzUyMS1zYW5kYm94LWZwYW4tZW5jcnlwdGlvbi1zcmMtbWFzdGVyY2FyZC1pbnQiLCJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMTI4R0NNIn0.PyG31_2YRpHenM0NnJT2AiCF0RSqAwjVj8ETMOe-XWEISls5GtdX38epn4BGQUCVKRl7XjGPUl--U2_8HnWG7qQe2SAp7F0ZiUHczBMAdAh96aIe5RylBhBeha3bH7-EpqMYyyJwkUSck6mvhLP8XbM0ZRDeowebydrNaeWfDC8jFqblhXje-TSw4TV_VBQt_iPs2Btw52n89fSO1baVGkd3-jhqsZ1vwUJUlzWMBfyWQPfKZhNrC1xIbCJAz_Pxeqk5iT5tNdqa2BR1DZX6psQt4X2idGEo6EOUmYQFY_wG4caQj9lUzglypwyk2PXM_lFlUMN8lsshB6hgGrD5mg.VohUTeqfW_Jq7G-G.Tn1uGb3v25Aa7q1UgSHV5BVwHPjNfE5MdWidUTyzVfaB2f-Ov-tQGK31l4dNhkOEs4pmO2JW94teDrq4rQXyLoA66PDcET5_rqhFZO07-JRrwSj8iZLNCH3mB3x-ygHvGaFwgRpzQx24dQCB4B38oePkPnKlc7duQQysF5xp9oeR.lXWpTZO01Lqeeu7LWqknWg"
}
```

**Then**
> **Step 1:** Mastercard responds with a response code of **200** , along with `srcDigitalCardId`, `maskedCard` and `digitalCardData`.

```json
{
  "srcCorrelationId": "ff97ef9b-4b1e-40c2-b522-42197061dc5a",
  "maskedCard": {
    "srcDigitalCardId": "9ajNArkAR66zqYyHCn0rCA000000000000US",
    "panBin": "512034",
    "panLastFour": "0747",
    "tokenUniqueReference": "DM4MMC1US000000013a3b395556c420e85bfebe54b219e36",
    "digitalCardData": {
      "status": "ACTIVE",
      "descriptorName": "MasterCard Test Bank",
      "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
      "pendingEvents": [
        "PENDING_SCA"
      ],
      "isCoBranded": "false",
      "authenticationMethods": [
        {
          "authenticationMethodType": "3DS",
          "authenticationSubject": "CARDHOLDER",
          "uriData": {
            "uri": "https://stage.src.mastercard.com/auth",
            "uriType": "WEB_URI"
          }
        },
        {
          "authenticationMethodType": "MANAGED_AUTHENTICATION",
          "authenticationSubject": "CARDHOLDER",
          "uriData": {
            "uri": "https://stage.src.mastercard.com/auth",
            "uriType": "WEB_URI"
          }
        }
      ]
    },
    "panExpirationMonth": "12",
    "panExpirationYear": "2024",
    "paymentCardType": "CREDIT",
    "serviceId": "SECURE_COF_COMMERCE_PLATFORM#E2E#01",
    "paymentAccountReference": "50015018T6JE5ZORJON0QTP9HHMYN",
    "dateOfCardCreated": "2024-10-03T14:29:30.685Z"
  },
  "maskedConsumer": {
    "srcConsumerId": "a7c53e04-dae7-4da0-9b4a-b3d8e8399ebb",
    "maskedConsumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "maskedIdentityValue": "f0c04b97-4dcb-485d-a4f4-7ae437a2e955"
    },
    "status": "ACTIVE",
    "dateConsumerAdded": "2024-10-03T14:29:27.441Z"
  }
}
```

> **Step 2:** Integrator calls [Lookup Authentication Method API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#lookupAccountHolderAuthenticationProfile) with `authenticationReasons` and receives one of the eligible MDES ID\&V methods in response.

```json
{
  "srcDigitalCardId": "PLReJE1YR3KvC3jSgxP7Mg000000000000AR",
  "srcCorrelationId": "8e280f17-bdae-4b9f-8ff5-799d78d12776",
  "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_API_STG#01",
  "srcClientId": "5a9f8c51-7ad1-40c6-b828-b7437b9334f6",
  "authenticationContext": {
    "authenticationReasons": [
      "ENROLL_FINANCIAL_INSTRUMENT",
      "AUTHENTICATOR_REGISTRATION"
    ]
  }
}
```

```json
{
  "srcCorrelationId": "8e280f17-bdae-4b9f-8ff5-799d78d12776",
  "authenticationMethods": [
    {
      "authenticationMethodType": "SMS_OTP",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "uriData": {},
      "authenticators": []
    },
    {
      "authenticationMethodType": "EMAIL_OTP",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "uriData": {},
      "authenticators": []
    },
    {
      "authenticationMethodType": "APP_AUTHENTICATION",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "uriData": {},
      "authenticators": []
    },
    {
      "authenticationMethodType": "APP_PUSH_NOTIFICATION",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "uriData": {},
      "authenticators": []
    },
    {
      "authenticationMethodType": "ISSUER_RBA",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "uriData": {},
      "authenticators": []
    },
    {
      "authenticationMethodType": "FIDO2",
      "authenticationSubject": "CARDHOLDER",
      "authenticationReasons": [
        "AUTHENTICATOR_REGISTRATION",
        "TRANSACTION_AUTHENTICATION"
      ],
      "uriData": {},
      "authenticators": []
    }
  ]
}
```

> **Step 3:** Passkey Registration: Retrieve Authentication UI URL   
>
> * Call the **Authenticate API** to initiate passkey registration.   
> * Extract the `uri` value from the API response.   
> * The `uri` represents the **Authentication UI URL** that the integrator must launch or redirect the user to.   
>   \> Ensure that all required fields are included in the request before invoking the API.

```json
{
  "body": {
    "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881",
    "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
    "srcCorrelationId": "c3c3fc36-bc37-418f-bbbc-591dc2791178",
    "srcDigitalCardId": "EVnHnwc5QBmzzxDwYTIspA000000000000GB",
    "authenticationMethod": {
      "authenticationMethodType": "FIDO2",
      "authenticationSubject": "CARDHOLDER"
    },
    "authenticationContext": {
      "authenticationReasons": [
        "AUTHENTICATOR_REGISTRATION"
      ],
      "dpaData": {
        "dpaPresentationName": "Mastercard MTT Integrated - DPA 3 COF",
        "dpaName": "dpa3_of_MTT Integrated SRCI COF",
        "acquirerId": "550e8400",
        "acquirerBin": "44444"
      },
      "dpaTransactionOptions": {
        "merchantName": "START",
        "merchantCategoryCode": "0008",
        "merchantCountryCode": "US",
        "threeDsInputData": {
          "forceChallenge": false,
          "billingAddress": {}
        },
        "dpaLocale": "en_AU"
      },
      "consumerDeviceData": {
        "appInstanceId": "8c55b3bc-349c-4f0f-8daf-9f2787cb6d74",
        "spcEnabled": false
      },
      "callbackUri": {
        "uri": "https://eta-macs-test-tools.apps.stl.pcfstage00.mastercard.int/macstools/auth-processing?clientSessionId=a5132a4b-3578-41a8-8bbd-55ace74ea893",
        "uriType": "WEB_URI"
      }
    }
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.c5deb17f-a130-4ba7-a000-5bf7c33c75db.1758142793"
  }
}
```

```json
{
  "body": {
    "srcCorrelationId": "c3c3fc36-bc37-418f-bbbc-591dc2791178",
    "authenticationSessionId": "8ac870af-e9f3-4af5-9a45-184e5086a221",
    "authenticationResult": "NOT_AUTHENTICATED",
    "authenticationStatus": "PENDING",
    "methodAttributes": {
      "uriData": {
        "uri": "https://stage.src.mastercard.com/auth?sav=ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldNdGJtVjNMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgw...",
        "uriType": "WEB_URI"
      }
    },
    "sessionAssuranceValue": "ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0..."
  },
  "headers": {
    "X-SRC-CX-FLOW-ID": "34f4a04b.c5deb17f-a130-4ba7-a000-5bf7c33c75db.1758142810"
  }
}
```

> **Step 4:** Launch the Authentication UI
> Redirect the user to, or launch, the **Authentication UI URL (`uri`)** to complete **Passkey Registration** .
> The authentication result is returned asynchronously via the configured **HTTPS `callbackUri`**.

**Example Authentication URL:**

    https://sandbox.src.mastercard.com/auth?sav=ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldN

> **Step 5:**
> Once the callback status is received, call the **Authenticate API** again.Ensure that all required parameters are included in the request.   
>
> Retrieve the **proof of authentication** , specifically the `assuranceData` object.
> **Step 6:**   
>
> The integrator calls the [Authenticate API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#AccountHolderAuthenticationsAuthenticateProfile) and requests one of the following authentication methods:   
>
> * One-Time Password (OTP)   
> * App Authentication link   
> * App Push Notification   
> * Risk-Based Authentication (Issuer RBA)   
>   \> Ensure that all required fields are included in the request.   

```json
{
  "body": {
    "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881",
    "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
    "srcCorrelationId": "c3c3fc36-bc37-418f-bbbc-591dc2791178",
    "srcDigitalCardId": "EVnHnwc5QBmzzxDwYTIspA000000000000GB",
    "authenticationMethod": {
      "authenticationMethodType": "SMS_OTP",
      "authenticationSubject": "CARDHOLDER"
    },
    "authenticationContext": {
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "dpaData": {
        "dpaPresentationName": "Mastercard MTT Integrated - DPA 3 COF",
        "dpaName": "dpa3_of_MTT Integrated SRCI COF"
      },
      "dpaTransactionOptions": {
        "merchantName": "SAMPLE_MERCHANT",
        "dpaLocale": "en_AU"
      }
    }
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.c5deb17f-a130-4ba7-a000-5bf7c33c75db.1758142793"
  }
}
```

```json
{
  "body": {
    "srcCorrelationId": "c3c3fc36-bc37-418f-bbbc-591dc2791178",
    "authenticationSessionId": "8ac870af-e9f3-4af5-9a45-184e5086a221",
    "authenticationResult": "NOT_AUTHENTICATED",
    "authenticationStatus": "PENDING",
    "methodAttributes": {
      "uriData": {
        "uri": "https://stage.src.mastercard.com/auth?sav=ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0YldNdGJtVjNMV2xrWlc1MGFYUjVMWFpsY21sbWFXTmhkR2x2YmkxemNtTXRiV0Z6ZEdWeVkyRnlaQzFwYm5RaUxDSjBlWEFpT2lKS1YxUXJaWGgw...",
        "uriType": "WEB_URI"
      }
    },
    "sessionAssuranceValue": "ZXlKcmFXUWlPaUl5TURJek1ERXlOakV4TkRNME5TMXpkR2N0..."
  },
  "headers": {
    "X-SRC-CX-FLOW-ID": "34f4a04b.c5deb17f-a130-4ba7-a000-5bf7c33c75db.1758142810"
  }
}
```

> **Step 7: Note: If `authenticationMethods.authenticationMethodType` = `ISSUER_RBA`, then skip this step.**   
>
> Integrator calls the [Authenticate API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#AccountHolderAuthenticationsAuthenticateProfile) again - once the Consumer has entered an OTP, or completed App Authentication, or Push Notification App Authentication to request proof of authentication and `assuranceData`.

```json
{
  "body": {
    "srcClientId": "13435294-fa4e-4acb-8fe6-05ab66b08881",
    "serviceId": "SECURE_COF_COMMERCE_PLATFORM#START_CPD_STG#01",
    "srcCorrelationId": "c3c3fc36-bc37-418f-bbbc-591dc2791178",
    "srcDigitalCardId": "EVnHnwc5QBmzzxDwYTIspA000000000000GB",
    "authenticationMethod": {
      "authenticationMethodType": "SMS_OTP",
      "authenticationSubject": "CARDHOLDER"
    },
    "authenticationContext": {
      "authenticationReasons": [
        "ENROLL_FINANCIAL_INSTRUMENT"
      ],
      "dpaData": {
        "dpaPresentationName": "Mastercard MTT Integrated - DPA 3 COF",
        "dpaName": "dpa3_of_MTT Integrated SRCI COF"
      },
      "dpaTransactionOptions": {
        "merchantName": "SAMPLE_MERCHANT",
        "dpaLocale": "en_AU"
      }
    }
  },
  "headers": {
    "X-Src-Cx-Flow-Id": "34f4a04b.c5deb17f-a130-4ba7-a000-5bf7c33c75db.1758142793"
  }
}
```

```json
{
  "srcCorrelationId": "4c50231e-2f43-44b1-81ee-a8e5be0af645",
  "srciTransactionId": "test-transaction-id",
  "authenticationSessionId": "4416a896-2e6c-42a9-8c49-531b4b1bc28c",
  "authenticationSessionExpiry": "4416a896-2e6c-42a9-8c49-531b4b1bc28c",
  "authenticationResult": "AUTHENTICATED | NOT_AUTHENTICATED",
  "authenticationStatus": "COMPLETE",
  "assuranceData": {
    "verificationType": "CARDHOLDER",
    "verificationEntity": "03",
    "verificationMethod": "04",
    "verificationResults": "01",
    "verificationTimestamp": "1678294563",
    "verificationEvents": "02",
    "additionalData": "=== Base64 Encoded AuthToken ==="
  }
}
```

> **Step 8:**   
>
> Integrator calls the [Bind API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication),and provides both the **proof of authentication** and the **`assuranceData`** .   
>
> Integrator completes Passkey binding to the consumer's device using the verified **ID\&V proof** .
> The Integrator now has a Mastercard Passkey enrolled which can be used for **subsequent transactions**.

## Test Cards {#test-cards}

Warning: If you are an Integrator in India, ensure to use the test cards dedicated to India region. Cards marked as 'Global' can be used for other countries/regions.

### Tokenization Eligible Test Cards {#tokenization-eligible-test-cards}

|   Card Number    | Expiry Date (MMYY) |      CVV       | Region |
|------------------|--------------------|----------------|--------|
| 2222690420064590 | *Any Future Date*  | *Any 3 digits* | Global |
| 2222690420064574 | *Any Future Date*  | *Any 3 digits* | Global |
| 2222690420064582 | *Any Future Date*  | *Any 3 digits* | Global |
| 5120350100064594 | *Any Future Date*  | *Any 3 digits* | Global |
| 2223520127577835 | *Any Future Date*  | *Any 3 digits* | India  |

<br />

### Tokenization Eligible Test Cards For Token Authentication Framework {#tokenization-eligible-test-cards-for-token-authentication-framework}

|   Card Number    | Expiry Date (MMYY) |      CVV       | Region |                               Authentication Outcome                                |
|------------------|--------------------|----------------|--------|-------------------------------------------------------------------------------------|
| 5453011910000148 | *Any Future Date*  | *Any 3 digits* | *AU*   | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5185600630000142 | *Any Future Date*  | *Any 3 digits* | *KW*   | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5186191950000143 | *Any Future Date*  | *Any 3 digits* | *FR*   | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5454051660000137 | *Any Future Date*  | *Any 3 digits* | *BY*   | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5186161910000137 | *Any Future Date*  | *Any 3 digits* | *DE*   | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5463070700000138 | *Any Future Date*  | *Any 3 digits* | *VN*   | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5186051910000130 | *Any Future Date*  | *Any 3 digits* | *BR*   | * Successful 3DS Challenge * Successful MDES OTP * Eligible for Mastercard Passkeys |
| 2223001870064586 | *Any Future Date*  | *Any 3 digits* | *US*   | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5204731620064595 | *Any Future Date*  | *Any 3 digits* | *US*   | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5204731620064587 | *Any Future Date*  | *Any 3 digits* | *US*   | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5120350261420361 | *Any Future Date*  | *Any 3 digits* | *GB*   | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5120350268376905 | *Any Future Date*  | *Any 3 digits* | *GB*   | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5120350283765454 | *Any Future Date*  | *Any 3 digits* | *GB*   | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5345310086434194 | *Any Future Date*  | *Any 3 digits* | *IND*  | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5345320030893593 | *Any Future Date*  | *Any 3 digits* | *IND*  | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5345310725769943 | *Any Future Date*  | *Any 3 digits* | *IND*  | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5345320684624112 | *Any Future Date*  | *Any 3 digits* | *IND*  | * Successful 3DS Challenge * Eligible for Mastercard Passkeys                       |
| 5345310270293919 | *Any Future Date*  | *Any 3 digits* | *IND*  | 3DS frictionless success                                                            |
| 5345320624042797 | *Any Future Date*  | *Any 3 digits* | *IND*  | 3DS frictionless success                                                            |
| 5506900481994787 | *Any Future Date*  | *Any 3 digits* | *US*   | 3DS frictionless success                                                            |
| 5120340000000244 | *Any Future Date*  | *Any 3 digits* | *US*   | 3DS frictionless success                                                            |
| 5345310135429062 | *Any Future Date*  | *Any 3 digits* | *IND*  | Failed 3DS Challenge                                                                |
| 5345320069019581 | *Any Future Date*  | *Any 3 digits* | *IND*  | Failed 3DS Challenge                                                                |
| 5506900487058777 | *Any Future Date*  | *Any 3 digits* | *US*   | Failed 3DS Challenge                                                                |
| 5506900487741018 | *Any Future Date*  | *Any 3 digits* | *US*   | Failed 3DS Challenge                                                                |
| 5578863131654396 | *Any Future Date*  | *Any 3 digits* | *AU*   | * Successful 3DS Challenge * Not Eligible for Mastercard Passkeys                   |
| 5578863117170664 | *Any Future Date*  | *Any 3 digits* | *BY*   | * Successful 3DS Challenge * Not Eligible for Mastercard Passkeys                   |

<br />

### Issuer Authentication Assurance Value Test Cards For Token Authentication Framework {#issuer-authentication-assurance-value-test-cards-for-token-authentication-framework}

|   Card Number    | Expiry Date (MMYY) |      CVV       | Region | Authentication Outcome |
|------------------|--------------------|----------------|--------|------------------------|
| 5120345250212472 | *Any Future Date*  | *Any 3 digits* | US     | Successful IAAV        |
| 5120345250610006 | *Any Future Date*  | *Any 3 digits* | US     | Successful IAAV        |
| 5120345255379466 | *Any Future Date*  | *Any 3 digits* | US     | Successful IAAV        |
| 5120350264888614 | *Any Future Date*  | *Any 3 digits* | GB     | Unsuccessful IAAV      |

<br />

### MDES ID\&V Test Cards For Token Authentication Framework {#mdes-idv-test-cards-for-token-authentication-framework}

|   Card Number    | Expiry Date (MMYY) |      CVV       | Region | Authentication Outcome |
|------------------|--------------------|----------------|--------|------------------------|
| 5450291016531468 | *Any Future Date*  | *Any 3 digits* | AR     | Successful MDES ID\&V  |
| 5450291017625459 | *Any Future Date*  | *Any 3 digits* | AR     | Successful MDES ID\&V  |
| 5204531050414538 | *Any Future Date*  | *Any 3 digits* | MX     | Successful MDES ID\&V  |
| 5204531058710572 | *Any Future Date*  | *Any 3 digits* | MX     | Successful MDES ID\&V  |

<br />

### Test Cards for Tokenization Declined by Issuer {#test-cards-for-tokenization-declined-by-issuer}

Use the following test cards to simulate a scenario where tokenization is declined by the issuer.

|   Card Number    | Expiry Date (MMYY) |      CVV       | Region |
|------------------|--------------------|----------------|--------|
| 5120340000000392 | *Any Future Date*  | *Any 3 digits* | Global |
| 5120350100000036 | *Any Future Date*  | *Any 3 digits* | Global |
| 5204731600012812 | *Any Future Date*  | *Any 3 digits* | India  |

<br />

### Non-Tokenizable Test Cards -- INVALID_STATE {#non-tokenizable-test-cards--invalid_state}

A PAN can trigger an INVALID_STATE enrollment error for the following reasons:

* PAN belongs to an account range that is not enabled for tokenization.
* PAN belongs to an ineligible region.
* PAN card type cannot be tokenized (for example: prepaid gift card).
* PAN belongs to an inactive card.
* PAN or associated PAN data is invalid.
* Issuer has declined the tokenization request.

<br />

View \`reason\` within the \`errordetail\` object to identify what has triggered the error.   
Note: For PAN_INELIGIBLE `errordetail`, check the submitted PAN data to confirm if it is correct. If a mistake is identified then retry after correcting it. Otherwise, do not retry tokenization.

|   Card Number    | Expiry Date (MMYY) |      CVV       | Region |
|------------------|--------------------|----------------|--------|
| 5460126128200800 | *Any Future Date*  | *Any 3 digits* | Global |
| 5207980000000102 | *Any Future Date*  | *Any 3 digits* | Global |

