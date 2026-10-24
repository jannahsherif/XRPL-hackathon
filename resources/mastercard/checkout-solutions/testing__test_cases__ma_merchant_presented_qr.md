# Mastercard Merchant Presented QR: SRC
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/ma_merchant_presented_qr/index.md

As a prerequisite, familiarize yourself with [Mastercard Merchant Presented QR: SRC](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/index.md).

|                                                                          Product                                                                           |                              Description                              |
|------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| [Scenario 1](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/ma_merchant_presented_qr/index.md#scenario-1) | User successfully enrolls new card and completes checkout.            |
| [Scenario 2](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/ma_merchant_presented_qr/index.md#scenario-2) | New card enrollment failure.                                          |
| [Scenario 3](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/ma_merchant_presented_qr/index.md#scenario-3) | User successfully enrolls new card, but fails to complete a checkout. |

## Scenario 1 {#scenario-1}

**Assumptions**

* The Integrator has onboarded with Mastercard Checkout Solutions SQR program to be eligible to make API calls.
* Consumer has enrolled their card with the Wallet for tokenization.   
* Consumer's device supports scanning of a QR code.   
* The card used to enroll is token eligible.  
* The Merchant/PSP offers consumers QR based checkout capability.   

**When**   
> Consumer enters valid card details with *primaryAccountNumber* , *panExpirationMonth* , *panExpirationYear* , *cardSecurityCode* . Integrator provides unique consumer identifier, a valid `srcClientID` and `serviceID` to call [POST /cards](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) API.

```json
{
    "srcClientId": "ab0af732-8a85-485f-a936-be6780487130",
    "serviceId": "SQR#MVEEPAY#01",
    "encryptedCard": "eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.Y0AUY84a7SWhLYspSp_pL4yIjg2fghaM0lqTj4e5P4w5YIo7fW_MxOyNMc5pAV3y1HRt8RjMTKWub3hNmsJx4NSCfR_2mxjol08KExhzdLunBCeyhMPUuNUU1HgOw4rQ7LtgB945cagjj9JxFEcNls-ahY4NusriENKQyTjPcBxcEFeW18VApz2r1j6OEMv_GF2Zxmd7KfHcbk41MVJWGts3nFDdlI3KkswC3VoMzFF03Ks5i83TtyY0zWf7NebhF-uba5PFWZUgynOsGh8MVw0lLLcAFMy80imxIY7qPLSmgUSzrOjVjirtx8H7XcVLoN-2laLxaZdw2EJAMGNQlQ.E_vjb0lu2QE8jpEM.z3BWrtMzlc2qnuYsiRS4SGVQi8ShZaA87GQLzfXUiX31tCdImhUnufQgRuB_3aNWMme9N_EavXPU8C6xPGuF0bazhLtV9qp5WznQcZOP_Mb8Fjv6idNnFQk_t3Zzg8yBTX4epvmOyBlCAupHdwR0Sv1LiTFQiqZ9vpykBaKIetLKutvUw3umTXCun8bBO_kjbKjwO2A1riylXw87sK_1yO-NpdeRmGhljkj7U1DiOSzjcj46erGbRglBDlA-1Y4e8eOB4KM5xlyVSw0ImsAupgEYR3SRfRak96EiLBU6n9iO8oA.wNFPzC624A5TVcsNzrEbUg",
    "consumer": {
        "consumerIdentity": {
            "identityType": "EXTERNAL_ACCOUNT_ID",
            "identityValue": "9003290005"
        },
        "emailAddress": "john.doe@gmail.com",
        "firstName": "John",
        "lastName": "Doe"
    },
    "srcTokenRequestData": {
    },
    "cardSource": "CARDHOLDER"
}
```

**Then:**   
> **Step 1** :
> Mastercard responds with a response code of `200` , along with `srcDigitalCardId` , `maskedCard` data.

```json
{
  "srcCorrelationId": "779165e0-1905-4edd-89fa-be46497b5044",
  "maskedCard": {
    "dateOfCardCreated": "2021-11-25T14:51:03.811Z",
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
    "serviceId": "#SQR#MVEEPAY#01",
    "srcDigitalCardId": "68bf50ec-0e8b-414f-8cfc-63e9c3fb9d48",
    "tokenLastFour": "7217",
    "tokenUniqueReference": "DM4MMC0000000001cd2826c715b7475bb089b7622366ebe4",
    "tokenExpirationMonth": "10",
    "tokenExpirationYear": "2022"
  }
}
```

> **Step 2**   
>
> Merchant presents QR code for checkout at point of sale to the consumer.
> Integrator makes the [POST /Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) call to send payload to acquirer/PSP using the `srcDigitalCardId`.  

```json
{
  "srcClientId": "6098bdd6-566a-452d-8c55-e61c68d1af4c",
  "recipientIdCheckout": "22755fe7-bf9c-4288-9fbc-94b9a8764a56",
  "srciTransactionId": "526e1d31-1feb-4026-abcf-ca6ce85ee9cb",
  "srcDpaId": "2c26439e-2ea9-11ed-a261-0242ac120002",
  "serviceId": "SQR#MVEEPAY#01",
  "srcDigitalCardId": "41085851-3295-48be-bb7a-969a83c1586d",
  "acceptanceChannelRelatedData": {
    "acceptanceChannelType": "EMV_MERCHANT_PRESENTED_MODE",
    "acceptanceChannelTechnology": "QR_CODE",
    "acceptanceChannelData": {
      "consumerData": {
        "billNumber": "543215465132123",
        "mobileNumber": "5557778888",
        "storeLabel": "string",
        "loyaltyNumber": "string",
        "referenceLabel": "string",
        "customerLabel": "string",
        "terminalLabel": "34f4a04b",
        "purposeOftransaction": "string",
        "emailId": "string",
        "phoneNumber": "string",
        "address": "1st Some Avenue, The Causeway, NYC, NY 10011"
      },
    "sellerData": {
      "qrCodeData": "000201010211051904151234567890123455204502453038405405100.05802US5913TestMerchant6008New York6208030412346304570E"
    }
  }
},
    "dpaData": {
        "dpaName": "Test Merchant Inc",
        "dpaPresentationName": "Test Merchant NYC",
        "dpaUri": "www.testmerchant.com"
    },

  "dpaTransactionOptions": {
  "threeDsPreference": "NONE",
  "merchantCategoryCode": "4444",
  "merchantCountryCode": "US",
  "transactionAmount" : {
      "transactionAmount": 100,
      "transactionCurrencyCode": "USD"
  },
  "paymentOptions":[{
    "dynamicDataType":"CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
  }]
  }
}
```

> **Step 3**   
>
> Mastercard validates the digital wallet, the merchant identifier (srcDpaId) and confirms the acquirer for the transaction, prepares and encrypts the payload.
> Mastercard responds to the integrator with `maskedCard` and `maskedConsumer` information for a successful checkout request.
> The response for the checkout call will be a summary checkout response without the `encryptedPayload`.

```json
{
  "iss": "https://mastercard.com",
  "iat": 1679592150,
  "alg": "RS256",
  "jti": "0b8bc890-5370-4fa3-97b9-cc91ecf5ef55",
  "kid": "20230207164613-sandbox-payload-verification-src-mastercard-int"
}
PAYLOAD:DATA

{
  "srcCorrelationId": "34f4a04b.a5b77a3b-34ab-458f-85fa-9510b58270bf",
  "srciTransactionId": "526e1d31-1feb-4026-abcf-ca6ce85ee9cb",
  "maskedCard": {
    "srcDigitalCardId": "41085851-3295-48be-bb7a-969a83c1586d",
    "panBin": "520473",
    "panLastFour": "3711",
    "tokenBinRange": "520473",
    "tokenLastFour": "4317",
    "digitalCardData": {
      "status": "ACTIVE",
      "presentationName": "Test IssuerÂ®",
      "descriptorName": "mastercard",
      "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
      "isCoBranded": false
    },
    "panExpirationMonth": "10",
    "panExpirationYear": "2023",
    "paymentCardType": "CREDIT",
    "serviceId": "SQR#MVEEPAY#01",
    "dateOfCardCreated": "2022-09-16T12:30:45.290Z",
    "dateOfCardLastUsed": "2022-09-16T12:31:15.883Z"
  },
  "maskedConsumer": {
    "srcConsumerId": "3e3f99b8-4c72-4c53-a08e-5af582dddeb1",
    "maskedConsumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "maskedIdentityValue": "cbf60a56-968b-4daf-9594-7f7f8d0ed9ef"
    },
    "maskedMobileNumber": {
      "countryCode": "1",
      "phoneNumber": "(***) ***-*799"
    },
    "countryCode": "US",
    "languageCode": "en",
    "status": "ACTIVE",
    "maskedFirstName": "t***",
    "maskedLastName": "t***",
    "maskedFullName": "t*** t***",
    "dateConsumerAdded": "2022-09-16T12:30:40.631Z"
  },
  "assuranceData": {
    "cardVerificationEntity": "02",
    "cardVerificationMethod": "03",
    "cardVerificationResults": "03"
  },
  "keyFingerprintId": "xwkvqORBFH8jmt7Ypt/Gu2VBkb+nM3P/LSkvCnyGvOc"
}
```

> **Step 4**   
>
>
> Mastercard pushes the encrypted payload to the acquirer through the [Make Payments API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications).
> Merchant/PSP respond with a `200` on successfully receiving the payload.  

```json
{
  "srcCorrelationId": "34f4a04b.a5b77a3b-34ab-458f-85fa-9510b58270bf",
  "srciTransactionId": "526e1d31-1feb-4026-abcf-ca6ce85ee9cb",
  "encryptedPayload": "eyJraWQiOiJzcXJQYXltZW50RW5jcnlwdGlvbktleSIsImVuYyI6IkExMjhHQ00iLCJhbGciOiJSU0EtT0FFUC0yNTYifQ.0NSJQS3uLAiLp-eye5fbIHs1IzhkL_T05TBORmmB0gsnM6SR_iWO7YqJYIUAkdJeGJSldiHDvv_umWHYzAYQPdehHcdP323JA3DhkrP09eWaxoNgKnHwZma5UrfybUP8hL3sjh1Q1pDq3m-q82rxOh8k9tkwrhFS_1pOVHP5FWeHz33QFXdHIF5kNb6xXa5rBM7nF0CPlVqR_AYOh-zDHei41UqQUIiRonJITRzU4RUvkGqybyyxIJzUzb6vNBibzVfpwoiW7RyrJu9iVNgquJvsdB9c5GwotAGDC7T2Z4IjjchLwT2KnhuYrpGBueR0g9p2vzwgNu40DcvuYhWRjA.mt7iHTmGowBt_hsX.1xt21Dg1n48rEaUoeTHw7F0iXezmRO3wf5n6wUGjsL-LMxlXtofE395w_x0cirEJRgdgLTKWBC85NQ6JwIBL2snpABdmddsR-rIrYI4Q4VQ9WoSBb3vbjyGdSCu91Lsh6_BK51Iw3j7MXdcI4m4g24cOo0hUxQQWqJaUNERNbOzTsld5u0OJiKoMWdxb3uyQqwdhSWXAilTxBAYhwu4B_1pUsBmcPU5A9m6eZdxzKrtIK6chbCocDM6cDxWMmY5Cz21sfnQ5fVPj8TovDjvk6yheI3OH_15oFbyYLHG6xZK6vhYYsyo4FCY9NKv7YIkl3wKJA9qdLB6PfNO_QyYshKDsfzt8U-Ey-m7HB4bJ2RCUGu4IK4SM3udZEBq6Zd0AKtCu9k6kT9_OrJ6jIDvRx2spsMkf9NYxfTs_gSzzNM7OC9BKxMqNDvueTR0X0suEhpLNCB0K.Qv7QXobot09Vy-3c_dCzzg",
  "maskedCard": {
    "srcDigitalCardId": "41085851-3295-48be-bb7a-969a83c1586d",
    "panBin": "520473",
    "panLastFour": "3711",
    "tokenBinRange": "520473",
    "tokenLastFour": "4317",
    "digitalCardData": {
      "status": "ACTIVE",
      "presentationName": "Test IssuerÂ®",
      "descriptorName": "mastercard",
      "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
      "isCoBranded": false
    },
    "panExpirationMonth": "10",
    "panExpirationYear": "2023",
    "paymentCardType": "CREDIT",
    "serviceId": "SQR#MVEEPAY#01",
    "dateOfCardCreated": "2022-09-16T12:30:45.290Z",
    "dateOfCardLastUsed": "2022-09-16T12:31:15.883Z"
  },
  "maskedConsumer": {
    "srcConsumerId": "3e3f99b8-4c72-4c53-a08e-5af582dddeb1",
    "maskedConsumerIdentity": {
      "identityType": "EXTERNAL_ACCOUNT_ID",
      "maskedIdentityValue": "cbf60a56-968b-4daf-9594-7f7f8d0ed9ef"
    },
    "maskedMobileNumber": {
      "countryCode": "1",
      "phoneNumber": "(***) ***-*799"
    },
    "countryCode": "US",
    "languageCode": "en",
    "status": "ACTIVE",
    "maskedFirstName": "t***",
    "maskedLastName": "t***",
    "maskedFullName": "t*** t***",
    "dateConsumerAdded": "2022-09-16T12:30:40.631Z"
  },
  "assuranceData": {
    "cardVerificationEntity": "02",
    "cardVerificationMethod": "03",
    "cardVerificationResults": "03"
  },
  "acceptanceChannelRelatedData": {
    "acceptanceChannelType": "EMV_MERCHANT_PRESENTED_MODE",
    "acceptanceChannelTechnology": "QR_CODE",
    "acceptanceChannelData": {
      "consumerData": {
        "billNumber": "543215465132123",
        "mobileNumber": "5557778888",
        "storeLabel": "string",
        "loyaltyNumber": "string",
        "referenceLabel": "string",
        "customerLabel": "string",
        "terminalLabel": "34f4a04b",
        "purposeOftransaction": "string",
        "emailId": "string",
        "phoneNumber": "string",
        "address": "1st Some Avenue, The Causeway, NYC, NY 10011"
      },
      "sellerData": {
        "qrCodeData": "000201010211051904151234567890123455204502453038405405100.05802US5913TestMerchant6008New York6208030412346304570E"
      }
    }
  },
  "keyFingerprintId": "xwkvqORBFH8jmt7Ypt/Gu2VBkb+nM3P/LSkvCnyGvOc",
  "srcDpaId": "2c26439e-2ea9-11ed-a261-0242ac120002",
  "dpaData": {
    "dpaPresentationName": "Test Merchant NYC",
    "dpaName": "Test Merchant Inc",
    "dpaUri": "www.testmerchant.com"
  },
  "dpaTransactionOptions": {
    "transactionAmount": {
      "transactionAmount": 100,
      "transactionCurrencyCode": "USD"
    },
    "merchantCategoryCode": "4444",
    "merchantCountryCode": "US",
    "threeDsPreference": "NONE",
    "paymentOptions": [
      {
        "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
      }
    ]
  }
}
```

## Scenario 2 {#scenario-2}

* The Wallet and Merchant/PSP have onboarded with Mastercard Checkout Solutions SQR program to be eligible to make API calls.
* Consumer has enrolled their card with the Wallet for tokenization.   
* The card used to enroll is token eligible.  
* The Merchant/PSP offers consumers QR based checkout capability.   
* Consumers device supports scanning of a QR code.   

**When**   
> Consumer enters valid card details with *primaryAccountNumber* , *panExpirationMonth* , *panExpirationYear* , *cardSecurityCode* ,unique consumer identifier, a **invalid** `srcClientID` and `serviceID` and Wallet calls the [POST /cards](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card).

**Then**   
> If the `srcClientID` is **invalid** , Mastercard will return a response with `403` status, reason as `PERMISSION_DENIED`.   

```json
{
  "status": 403,
  "reason": "PERMISSION_DENIED",
  "message": "Access is denied to the requested resource. Client does not have sufficient permission or has been locked",
  "errordetail": [
    {
      "message": "Permission denied",
      "reason": "PERMISSION_DENIED",
      "source": "Card",
      "sourceType": "BODY"
    }
  ]
}
```

> Refer to the [Code and Formats](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/code-and-formats/index.md) section to see the various errors that can be received on calling different APIs.

## Scenario 3 {#scenario-3}

**Assumptions**

* The Wallet and Merchant/PSP have onboarded with Mastercard Checkout Solutions SQR program to be eligible to make API calls.
* Consumer has enrolled their card with the Wallet for tokenization.   
* The card used to enroll is token eligible.  
* The Merchant/PSP offers consumers QR based checkout capability.   
* Consumers device supports scanning of a QR code.   

**When**   
> Consumer enters valid card details with *primaryAccountNumber* , *panExpirationMonth* , *panExpirationYear* , *cardSecurityCode* ,unique consumer identifier, a valid `srcClientID` and `serviceID` and Wallet calls the [POST /cards](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) .

```json
{
    "srcClientId": "ab0af732-8a85-485f-a936-be6780487130",
    "serviceId": "SQR#MVEEPAY#01",
    "encryptedCard": "eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.Y0AUY84a7SWhLYspSp_pL4yIjg2fghaM0lqTj4e5P4w5YIo7fW_MxOyNMc5pAV3y1HRt8RjMTKWub3hNmsJx4NSCfR_2mxjol08KExhzdLunBCeyhMPUuNUU1HgOw4rQ7LtgB945cagjj9JxFEcNls-ahY4NusriENKQyTjPcBxcEFeW18VApz2r1j6OEMv_GF2Zxmd7KfHcbk41MVJWGts3nFDdlI3KkswC3VoMzFF03Ks5i83TtyY0zWf7NebhF-uba5PFWZUgynOsGh8MVw0lLLcAFMy80imxIY7qPLSmgUSzrOjVjirtx8H7XcVLoN-2laLxaZdw2EJAMGNQlQ.E_vjb0lu2QE8jpEM.z3BWrtMzlc2qnuYsiRS4SGVQi8ShZaA87GQLzfXUiX31tCdImhUnufQgRuB_3aNWMme9N_EavXPU8C6xPGuF0bazhLtV9qp5WznQcZOP_Mb8Fjv6idNnFQk_t3Zzg8yBTX4epvmOyBlCAupHdwR0Sv1LiTFQiqZ9vpykBaKIetLKutvUw3umTXCun8bBO_kjbKjwO2A1riylXw87sK_1yO-NpdeRmGhljkj7U1DiOSzjcj46erGbRglBDlA-1Y4e8eOB4KM5xlyVSw0ImsAupgEYR3SRfRak96EiLBU6n9iO8oA.wNFPzC624A5TVcsNzrEbUg",
    "consumer": {
        "consumerIdentity": {
            "identityType": "EXTERNAL_ACCOUNT_ID",
            "identityValue": "9003290005"
        },
        "emailAddress": "john.doe@gmail.com",
        "firstName": "John",
        "lastName": "Doe"
    },
    "cardSource": "CARDHOLDER"
}
```

**Then:**   
> **Step 1** :
> Mastercard responds with a response code of `200`, along with `srcDigitalCardId`, `maskedCard` data.

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
    "serviceId": "SQR#MVEEPAY#01",
    "srcDigitalCardId": "68bf50ec-0e8b-414f-8cfc-63e9c3fb9d48",
    "tokenLastFour": "7217",
    "tokenUniqueReference": "DM4MMC0000000001cd2826c715b7475bb089b7622366ebe4",
    "tokenExpirationMonth": "10",
    "tokenExpirationYear": "2022"
  }
}
```

> **Step 2**   
>
> Merchant presents QR code for checkout at point of sale to the consumer.
> Integrator makes the [POST /Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) call to send payload to acquirer/PSP using an **invalid** `srcDigitalCardId`.  

```json
{
  "srcClientId": "6098bdd6-566a-452d-8c55-e61c68d1af4c",
  "recipientIdCheckout": "22755fe7-bf9c-4288-9fbc-94b9a8764a56",
  "srciTransactionId": "526e1d31-1feb-4026-abcf-ca6ce85ee9cb",
  "srcDpaId": "2c26439e-2ea9-11ed-a261-0242ac120002",
  "serviceId": "SQR#MVEEPAY#01",
  "srcDigitalCardId": "41085851-3295-48be-bb7a-969a83c15862",
  "acceptanceChannelRelatedData": {
    "acceptanceChannelType": "EMV_MERCHANT_PRESENTED_MODE",
    "acceptanceChannelTechnology": "QR_CODE",
    "acceptanceChannelData": {
      "consumerData": {
        "billNumber": "543215465132123",
        "mobileNumber": "5557778888",
        "storeLabel": "string",
        "loyaltyNumber": "string",
        "referenceLabel": "string",
        "customerLabel": "string",
        "terminalLabel": "34f4a04b",
        "purposeOftransaction": "string",
        "emailId": "string",
        "phoneNumber": "string",
        "address": "1st Some Avenue, The Causeway, NYC, NY 10011"
      },
    "sellerData": {
      "qrCodeData": "000201010211051904151234567890123455204502453038405405100.05802US5913TestMerchant6008New York6208030412346304570E"
    }
  }
},
    "dpaData": {
        "dpaName": "Test Merchant Inc",
        "dpaPresentationName": "Test Merchant NYC",
        "dpaUri": "www.testmerchant.com"
    },

  "dpaTransactionOptions": {
  "threeDsPreference": "NONE",
  "merchantCategoryCode": "4444",
  "merchantCountryCode": "US",
  "transactionAmount" : {
      "transactionAmount": 100,
      "transactionCurrencyCode": "USD"
  },
  "paymentOptions":[{
    "dynamicDataType":"CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
  }]
  }
}
```

> **Step 3**   
>
> Mastercard responds with a `400` error with reason as `INVALID_ARGUMENT`.  

```json
{
"status": 400,
"reason": "INVALID_ARGUMENT",
"message": "Cannot process the request because it is malformed or has incorrect/missing fields or values.",
"errordetail": [
  {
   "message": "The format is not correct",
   "reason": "INVALID_FORMAT",
   "source": "srcDigitalCardId",
   "sourceType": "BODY"
  }
  ]
}
```

> Refer to the [Code and Formats](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/code-and-formats/index.md) section to see the various errors that can be received on calling different APIs.

## Test Cards {#test-cards}

### Tokenization Eligible Test Cards {#tokenization-eligible-test-cards}

|   Card Number    | Expiry Date (MMYY) |      CVV       | Region |
|------------------|--------------------|----------------|--------|
| 2223001850064564 | *Any Future Date*  | *Any 3 digits* | Global |
| 2222690420064574 | *Any Future Date*  | *Any 3 digits* | Global |
| 2222690420064582 | *Any Future Date*  | *Any 3 digits* | Global |
| 5120350100000069 | *Any Future Date*  | *Any 3 digits* | Global |
| 5120340000000293 | *Any Future Date*  | *Any 3 digits* | Global |
|                  |                    |                |        |

### Tokenization Ineligible Test Cards - TOKENIZATION_INELIGIBLE {#tokenization-ineligible-test-cards---tokenization_ineligible}

If the PAN (Primary Account Number) being enrolled is in an account range that has not yet been enabled by the issuer for Secure Card on File, the PAN will not be enrolled and Secure Card on File will return a `TOKENIZATION_INELIGIBLE` response.

You can use the following test cards to simulate the `TOKENIZATION_INELIGIBLE` scenario:

|   Card Number    | Expiry Date (MMYY) |      CVV       | Region |
|------------------|--------------------|----------------|--------|
| 5186009200935811 | *Any Future Date*  | *Any 3 digits* | Global |
| 5204731940398145 | *Any Future Date*  | *Any 3 digits* | Global |

<br />

### Tokenization Ineligible Test Cards - PAN_INELIGIBLE {#tokenization-ineligible-test-cards---pan_ineligible}

If FPAN is not enabled for the country of issuer, Secure Card on File returns a `PAN_INELIGIBLE`. You can use the following test cards that are not enabled in the U.S. to simulate the `PAN_INELIGIBLE` scenario:

|   Card Number    | Expiry Date (MMYY) |      CVV       | Region |
|------------------|--------------------|----------------|--------|
| 5460126128200800 | *Any Future Date*  | *Any 3 digits* | Global |
| 5207980000000102 | *Any Future Date*  | *Any 3 digits* | Global |

<br />

### Test Cards for Tokenization Declined by Issuer {#test-cards-for-tokenization-declined-by-issuer}

Use the following test cards to simulate a scenario where tokenization is declined by the issuer.

|   Card Number    | Expiry Date (MMYY) |      CVV       | Region |
|------------------|--------------------|----------------|--------|
| 5120340000000392 | *Any Future Date*  | *Any 3 digits* | Global |
| 5120350100000036 | *Any Future Date*  | *Any 3 digits* | Global |

