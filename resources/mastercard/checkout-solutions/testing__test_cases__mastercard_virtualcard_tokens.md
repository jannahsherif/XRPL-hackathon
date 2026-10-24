# Mastercard Virtual Card Tokens
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/mastercard_virtualcard_tokens/index.md

As a prerequisite, familiarize yourself with [Mastercard Virtual Card Tokens](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/index.md).

|                                                                             Product                                                                             |                                                             Description                                                             |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| [Scenario 1](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/mastercard_virtualcard_tokens/index.md#scenario-1) | User successfully enrolls new card and completes checkout. (PAN based enrollment)                                                   |
| [Scenario 2](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/mastercard_virtualcard_tokens/index.md#scenario-2) | User successfully enrolls new card with ID\&V and existing MDES token (Done immediately within 5 mins of Device Token Provisioning) |
| [Scenario 3](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/mastercard_virtualcard_tokens/index.md#scenario-3) | User successfully enrolls new card with DSRP and existing MDES token                                                                |
| [Scenario 4](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/mastercard_virtualcard_tokens/index.md#scenario-4) | User tries to checkout at an unsupported merchant                                                                                   |

Note: An Integrator can participate in PAN-based enrollment, device token-based enrollment, or both.

## Scenario 1 {#scenario-1}

**Assumptions**

* The Integrator has onboarded with Mastercard Virtual Card Tokens program to be eligible to make API calls.   
* Consumer has a profile or will create a profile with the Integrator.   
* The card used to enroll is token eligible.   
* Checkout will be done at a supported merchant.

**When**   
> On a merchant's website on a browser (Integrator), the cardholder is prompted to enroll their virtual card at checkout.   
>
> The cardholder confirms they'd like to enroll and is prompted to complete a platform verification step (PIN, biometric, password, etc.).   
>
> Valid card details to enroll the virtual card include `primaryAccountNumber`, `panExpirationMonth`, `panExpirationYear`, `cardSecurityCode`. The Integrator then calls the [POST /cards](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card).

```json
{
  "srcClientId":"ab123c45-0d6e-7d89-0ff1-2d3456be7ff8",
  "srcCorrelationId":"7733567a-b1db-55e7-a6ed-5a78p8ab6789",
  "serviceId":"MVCT#Integrator#01",
  "encryptedCard":
    {
      "primaryAccountNumber": "1234123412341234",
      "panExpirationMonth": "09",
      "panExpirationYear": "2026",
      "cardSecurityCode": "789"
    },
  "consumer": {
    "consumerIdentity":
    {
    "identityType": "EXTERNAL_ACCOUNT_ID",
    "identityValue": "d10ae777-914e-4c6f-1245-acc654310548"
    }
  }
}
```

**Then:**   
> **Step 1** :
> Mastercard responds with a response code of `200` , along with `srcDigitalCardId` and `maskedCard` data. The static token is returned to the Integrator.

```json
{
  "srcCorrelationId":"7733567a-b1db-55e7-a6ed-5a78p8ab6789",
  "maskedCard":
  {
      "srcDigitalCardId":"d4789e3d-a1b2-214f-f5f2-c4a899ab123f",
      "panBin":"123412",
      "panLastFour":"1234",
      "tokenUniqueReference":"DM4MMC000000000YGVU8IH0QR9BB5GDXYJS71GBJLESS6GF63",
      "tokenLastFour":"0002",
      "digitalCardData":
      {
        "status":"ACTIVE",
        "descriptorName":"Bank Rewards Mastercard",
        "artUri":"https://stage.assets.mastercard.com/card-art/combined-image-asset/79a04b0d-cb11-47bd-9e14-49f122262688.svg",
        "isCoBranded":"true",
        "coBrandedName":"Co brand partner"
      },
        "panExpirationMonth":"09",
        "panExpirationYear":"2026",
        "paymentCardDescriptor":"mastercard",
        "paymentCardType":"CREDIT",
        "serviceId":"MVCT#Integrator#01",
        "paymentAccountReference":"44050304507824796907290139851",
        "dateOfCardCreated":"2022-05-04T13:39:25.845Z"
  },

"maskedConsumer":
  {
    "srcConsumerId":"13f0cbf0-a731-485e-b64e-df3f4cf02758",
    "maskedConsumerIdentity": {
    "identityType":"EXTERNAL_ACCOUNT_ID",
    "maskedIdentityValue":"b92cc776-142f-4f2f-8239-deb648136749"
    },
    "status":"ACTIVE",
    "dateConsumerAdded":"2022-05-04T13:39:24.411Z"
  },
"keyFingerprintId":"string"
}
```

> **Step 2**   
>
> Integrator makes the [POST /transaction/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout). call with the `srcDigitalCardId` and `dpaTransactionOptions.paymentOptions.dynamicDataType` set to `DYNAMIC_CARD_SECURITY_CODE`.

```json
{
  "srcClientId":"ab123c45-0d6e-7d89-0ff1-2d3456be7ff8",
  "srcCorrelationId":"7733567a-b1db-55e7-a6ed-5a78p8ab6789",
  "serviceId":"MVCT#Integrator#01",
  "srciTransactionId":"27f7f379-c3b9-4acd-9032-c4502c401f44",
  "srcDigitalCardId":"d4789e3d-a1b2-214f-f5f2-c4a899ab123f",
  "srcDpaId":"7a96bc0a-1a1e-4c62-996e-2153e3302291_systemtest",
  "dpaTransactionOptions": {
      "transactionAmount": {
      "transactionAmount":100,
      "transactionCurrencyCode":"USD"
      },
  "paymentOptions": [
      {
      "dynamicDataType":"DYNAMIC_CARD_SECURITY_CODE"
      }
    ],
  "threeDsPreference":"NONE",
  "dpaData": {
      "dpaName":"TestMerchant",
      "dpaUri":"http://test.com"
    }
  }
}
```

> **Step 3**   
>
> Mastercard generates a unique, one-time Dynamic Token Verification Code (DTVC), and returns it in checkout response with the virtual card token including the static token number and the static token expiration date.  
>
> The virtual card token will be viewable by the cardholder on the Integrator browser interface, along with the associated underlying card art.

```json
{
 "srcCorrelationId": "7733567a-b1db-55e7-a6ed-5a78p8ab6789",
 "srciTransactionId":"27f7f379-c3b9-4acd-9032-c4502c401f44",
 "encryptedPayload":{
     "token": {
         "paymentToken":"5480983162311596",
         "tokenExpirationMonth":"12",
         "tokenExpirationYear":"2031",
         "paymentAccountReference":"5001AK9FG2W3XUUI6R2XA5RT341KZ"
         },
     "dynamicData": {
         "dynamicDataValue":"123",
         "dynamicDataType":"DYNAMIC_CARD_SECURITY_CODE",
         "dynamicDataExpiration":"1651872476"
     }
 }
 "maskedCard": {
    "srcDigitalCardId":"d4789e3d-a1b2-214f-f5f2-c4a899ab123f",
    "panBin":"123412",
    "panLastFour":"1234",
    "tokenBinRange":"548098",
    "tokenLastFour":"0002",
    "digitalCardData": {
        "status":"ACTIVE",
        "descriptorName":"Bank Rewards Mastercard",
        "artUri":"https://stage.assets.mastercard.com/card-art/combined-image-asset/79a04b0d-cb11-47bd-9e14-49f122262688.svg",
        "coBrandedName":"Co brand partner",
        "isCoBranded":true
     },
    "panExpirationMonth":"09",
    "panExpirationYear":"2026",
    "paymentCardDescriptor":"mastercard",
    "paymentCardType":"CREDIT",
    "dateOfCardCreated":"2022-05-04T13:44:58.027Z"
 },
 "maskedConsumer": {
 "srcConsumerId": "13f0cbf0-a731-485e-b64e-df3f4cf02758",
  "maskedConsumerIdentity": {
    "identityType":"EXTERNAL_ACCOUNT_ID",
    "maskedIdentityValue":"b92cc776-142f-4f2f-8239-deb648136749"
    },
    "status":"ACTIVE",
    "dateConsumerAdded":"2022-05-04T13:44:56.349Z"

 }   

}
```

## Scenario 2 {#scenario-2}

* The Integrator has onboarded with Mastercard Virtual Card Tokens program to be eligible to make API calls.   
* Consumer has a profile or will create a profile with the Integrator.   
* The card used to enroll is token eligible.   
* Cardholder has a device wallet associated with the Integrator.   
* The Integrator device wallet is a Secure Element, MCBP (Mastercard Cloud-Based Payment), or Trusted Execution Environment (TEE) Device Wallet.   
* Card is getting enrolled immediately within 5 mins of Device Token Provisioning.

**When**   
> A cardholder adds a new card to their device wallet:   
>
> 1. A device token is generated upon Identification \& Verification done on the card/cardholder.  
> 2. The Integrator then calls the [POST /cards](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) with the device TUR data and ID\&V details within **5 mins** of device token provisioning.

```json
{

  "srcClientId":"13435294-fa4e-4acb-8fe6-05ab66b08881",
  "srcCorrelationId":"cbbafd96-24e6-439e-8fa3-9d481eaad97e",
  "serviceId":"MVCT#Integrator#01",
  "cardSource":"EXISTING_CREDENTIAL",
  "enrolmentReferenceData": {
      "enrolmentReferenceType": "TOKEN_UNIQUE_REFERENCE",
      "enrolmentReferenceId": "DAPLMC00001441361ac692b044f046ee9451003182bad3da"
  },
  "consumer": {
      "consumerIdentity": {
          "identityType":"EXTERNAL_ACCOUNT_ID",
          "identityValue":"868bd158-4aa9-452e-8193-899433e68450"
      }
  },
  "assuranceData": {
      "verificationData": [
      {
          "verificationType":"CARDHOLDER",
          "verificationEntity":"01",
          "verificationMethod":"21",
          "verificationResults":"01",
          "verificationTimestamp":"2021-04-22T04:08:57.614Z",
          "verificationEvents": [
              "02"
          ]
      }
      ]
     }
}
```

**Then**   
> **Step 1** :   
>
> Mastercard responds with a response code of `200`, along with `srcDigitalCardId` and `maskedCard` data. The static token is returned to the Integrator.

```json
{
  "srcCorrelationId":"cbbafd96-24e6-439e-8fa3-9d481eaad97e",
  "maskedConsumer": {
      "srcConsumerId":"eccbf087-f159-4d69-b31d-00bec75c0474",
      "maskedConsumerIdentity": {
          "identityType":"EXTERNAL_ACCOUNT_ID",
          "maskedIdentityValue":"868bd158-4aa9-452e-8193-899433e68450"
    },
    "dateConsumerAdded":"2021-04-21T19:41:00.178Z",
    "status":"ACTIVE"
    },
  "maskedCard": {
      "srcDigitalCardId":"61673f54-2dd0-4e3e-9a4e-c613bcf5a185",
      "tokenLastFour":"0002",
      "tokenBinRange":"0011",
      "panExpirationMonth":"10",
      "panExpirationYear":"2023",
      "panLastFour":"3746",
      "paymentCardDescriptor":"Mastercard",
      "paymentCardType":"CREDIT",
      "digitalCardData": {
          "status":"ACTIVE",
          "presentationName":"Issuing Bank",
          "descriptorName":"mastercard",
          "artUri":"https://stage.assets.mastercard.com/card-art/combined-image-asset/HIGH-MASK-3x.png",
          "isCoBranded":false,
          "coBrandedName":"",
          "issuerName":"ISSUER"
      },
      "countryCode":"US",
      "serviceId":"MVCT#Integrator#01",
      "paymentAccountReference":"5001a9f027e5629d11e3949a0800a",
      "dateOfCardCreated":"2021-04-22T04:08:57.614Z",
      "dateOfCardLastUsed":"2021-04-22T04:08:57.614Z",
      "tokenUniqueReference":"DWSPMC000000000132d72d4fcb2f4136a0532d3093ff1a45"
    }
}
```

> **Step 2**   
>
> Integrator makes the [POST /transaction/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) call with the `srcDigitalCardId` and `dpaTransactionOptions.paymentOptions.dynamicDataType` set to `DYNAMIC_CARD_SECURITY_CODE`.   
>
> Mastercard generates a unique, one-time Dynamic Token Verification Code (DTVC), and returns it in checkout response with the virtual card token including the static token number and the static token expiration date.  
>
> The virtual card token will be viewable by the cardholder on the Integrator browser interface, along with the associated underlying card art.

## Scenario 3 {#scenario-3}

**Assumptions**

* The Integrator has onboarded with Mastercard Virtual Card Tokens program to be eligible to make API calls.   
* Consumer has a profile or will create a profile with the Integrator.  
* The card used to enroll is token eligible.   
* Cardholder has a device wallet associated with the Integrator.   
* The Integrator device wallet is a Secure Element, MCBP (Mastercard Cloud-Based Payment), or Trusted Execution Environment (TEE) Device Wallet.   
* Cardholder has an existing MDES device token.   

**When**   
> A cardholder adds a new card to their device wallet:   
>
> 1. The Integrator generates a Digital Secure Remote Payment (DSRP) cryptogram for the given MDES device token.   
> 2. The Integrator calls the [POST /cards](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) with the device TUR data and DSRP cryptogram.

```json
{
  "srcClientId":"13435294-fa4e-4acb-8fe6-05ab66b08881",
  "srcCorrelationId":"cbbafd96-24e6-439e-8fa3-9d481eaad97e",
  "serviceId":"MVCT#Integrator#01",
  "cardSource":"EXISTING_CREDENTIAL",
  "enrolmentReferenceData": {
      "enrolmentReferenceType": "TOKEN_UNIQUE_REFERENCE",
      "enrolmentReferenceId": "DAPLMC00001441361ac692b044f046ee9451003182bad3da"
  },
  "consumer": {
          "consumerIdentity": {
          "identityType":"EXTERNAL_ACCOUNT_ID",
          "identityValue":"868bd158-4aa9-452e-8193-899433e68450"
      }
  },
  "assuranceData": {
      "verificationData": [
        {
          "verificationType":"CARDHOLDER",
          "verificationEntity":"01",
          "verificationMethod":"22",
          "verificationResults":"01",
          "verificationTimestamp":"2021-04-22T04:08:57.614Z",
          "additionalData": "ewogICJ0b2tlblVuaXF1ZVJlZmVyZW5jZSI6ICJEV1NQTUMwMDAwMDAwMDBlNDJhNTk1NmNmMWI0ODk5OTQyZjVlNzRjODFkNWQ0ZiIsCiAgImRzcnBDcnlwdG9ncmFtIjogIkFJcnFiM1haU2JncEFBbDJsUWVER2dBREZBPT0iCn0=",
          "verificationEvents": [
              "02"
            ]
        }
      ]
    }
}
```

**Then:**   
> **Step 1** :   
>
> Mastercard responds with a response code of `200`, along with `srcDigitalCardId` and `maskedCard data`. The static token is returned to the Integrator.

```json
{
  "srcCorrelationId":"cbbafd96-24e6-439e-8fa3-9d481eaad97e",
  "maskedConsumer": {
      "srcConsumerId":"eccbf087-f159-4d69-b31d-00bec75c0474",
      "maskedConsumerIdentity": {
          "identityType":"EXTERNAL_ACCOUNT_ID",
          "maskedIdentityValue":"868bd158-4aa9-452e-8193-899433e68450"
      },
      "dateConsumerAdded":"2021-04-21T19:41:00.178Z",
      "status":"ACTIVE"
    },
  "maskedCard": {
      "srcDigitalCardId":"61673f54-2dd0-4e3e-9a4e-c613bcf5a185",
      "tokenLastFour":"0002",
      "tokenBinRange":"0011",
      "panExpirationMonth":"10",
      "panExpirationYear":"2026",
      "panLastFour":"5678",
      "paymentCardDescriptor":"Mastercard",
      "paymentCardType":"CREDIT",
          "digitalCardData": {
          "status":"ACTIVE",
          "presentationName":"Issuing Bank",
          "descriptorName":"mastercard",
          "artUri":"https://stage.assets.mastercard.com/card-art/combined-image-asset/HIGH-MASK-3x.png",
          "isCoBranded":false,
          "coBrandedName":"",
          "issuerName":"Issuer"
        },
      "countryCode":"US",
      "serviceId":"MVCT#Integrator#01",
      "paymentAccountReference":"5001a9f027e5629d11e3949a0800a",
      "dateOfCardCreated":"2021-04-22T04:08:57.614Z",
      "dateOfCardLastUsed":"2021-04-22T04:08:57.614Z",
      "tokenUniqueReference":"DWSPMC000000000132d72d4fcb2f4136a0532d3093ff1a45"
    }
}
```

> **Step 2**   
>
> Integrator makes the [POST /transaction/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) call with the `srcDigitalCardId` and `dpaTransactionOptions.paymentOptions.dynamicDataType` set to `DYNAMIC_CARD_SECURITY_CODE`.   
>
> Mastercard generates a unique, one-time Dynamic Token Verification Code (DTVC), and returns it in checkout response with the virtual card token including the static token number and the static token expiration date.  
>
> The virtual card token will be viewable by the cardholder on the Integrator browser interface, along with the associated underlying card art.

## Scenario 4 {#scenario-4}

**Assumptions**

* The Integrator has onboarded with Mastercard Virtual Card Tokens program to be eligible to make API calls.   
* The card used to enroll is token eligible.   
* The merchant has provided Mastercard with a preference to receive only PANs, and not receive Mastercard Virtual Card Token credentials.   

**When**   
> An Integrator requests for a Virtual Card Token and DTVC by calling the Checkout service for a merchant web domain with preference for the PANs indicated.   
>
> Mastercard will return an error and indicate to the browser that the merchant prefers not to receive Virtual Card Tokens.   
>
> The Integrator and/or the browser interface may indicate merchant preference as the reason for failure to the Consumer.

```Javascript
{
  "message": "Access is denied to the requested resource. The user account has been locked.",
  "reason": "LOCKED",
  "status": 403,
  "errordetail": [
          {
           "reason": "RESTRICTED",
           "message": "The Merchant has been restricted to receive requested credentials.",
           "sourceType": "BODY",
           "source": "<< path to dpaURI in request>>"
           }
      ]
}
```

## Test Cards {#test-cards}

Reach out to your [Mastercard representative](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/support/index.md#get-help) for enabling test cards.
