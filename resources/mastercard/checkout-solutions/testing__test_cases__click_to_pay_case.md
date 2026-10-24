# Click to Pay
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/click_to_pay_case/index.md

As a prerequisite, familiarize yourself with [Click to Pay Use Cases](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md).

|                                                                      Scenarios                                                                      |                                       Description                                       |
|-----------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| [Scenario 1](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/click_to_pay_case/index.md#scenario-1) | New user adds card and completes checkout.                                              |
| [Scenario 2](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/click_to_pay_case/index.md#scenario-2) | Returning user on a new device, switches from mobile to email OTP to complete checkout. |
| [Scenario 3](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/click_to_pay_case/index.md#scenario-3) | Returning user on a new device, uses a passkey to complete identity validation.         |
| [Scenario 4](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/click_to_pay_case/index.md#scenario-4) | Returning user makes four consecutive incorrect attempts while entering OTP.            |
| [Scenario 5](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/click_to_pay_case/index.md#scenario-5) | Returning user on a recognized device selects 'Not You'.                                |
| [Scenario 6](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/click_to_pay_case/index.md#scenario-6) | Returning user selects a card that is eligible for payment installments.                |

## Scenario 1 {#scenario-1}

**Assumptions**

* No Click to Pay cookies are dropped in the browser from any network, [isRecognized()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md) call returns `false`.
* User does not have any Click to Pay profile with any network.

<br />

**When**
> On Integrator website, user selects Checkout with 'Click to Pay' and enters valid card details with *primaryAccountNumber* , *panExpirationMonth* , *panExpirationYear* , *cardSecurityCode* . Integrator creates encrypted card object and calls the [enrollCard()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/enroll-card/index.md) method.

```json
{
  "encryptedCard":"eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.MIq_v15_eowvwX8MRgrb_H1EevZKB9CZSMMD8-lcbTjQvPFwAyx1USZbZRDB3RGfA_of6aDggnbmQmgsUStPQEpzYMma5mxlv5-VT6ry94xyttBFuCjBV0hudmcOEHiQeIiwS5xBb1iBPFaXTEmMpgDv8lvAm_ncbJ0V5FFDUYYVhK0-SbaODY5OKMdP2N3Y9bCkqjLCAcmkkN3mkrJ6WbzJURmNdfPyL344Cxc14NLZW3fk_yHkmjXybIXJWnUUsdxwFWS5ImwaZGEhbeLGGdpsPTkTkwD86uZCYJlx_dsZi02Vbm9AIiPpKE4L8GS_ltmOQ3YfgfxS6UuzYzaxKw.Xi3KLm7BvjSQuPMSVwSepg.U6Yp-DXd55F6jqy8-LIbmxmExzLaZNCF9Rcmg0g7ViUN3ydm_G5IqJmCFgXg1aO50HYJvnxi5OWG_rs6uV-1I2rrpu3bkuSjkj03N82yhFJBbhr8W_ahlgAMv2FPu4k7aeGp5rWm5lEdvH2UpSvKG2Ae111iFtL842Pk0pgPLOv4jnxFaCrvAPZ4vTvHS1RU27XGW7qXfAOtqpZ38oUJFamYueCIycDrsvacPT650O_JM_QS0ReXkH49bgAt1Sog9r2PY7fjU22ff1oGno51uVK_D9EXyHWcD4I5LYdVd6NenPDfycuQZ_wA98nqMCTzrqx5yQjUQDNYOoDF8ztoKVpYsTJeIUcFTpGXfoLLPTWjoIUds3mIyrXtBWO46rqN8c2nQ6FKC04-CBK9RGbWr1q1ENgfmsBvfXPCIUZ5ACzM1UaU2LkgEYlyiaxn-I3MfauP1adsA3ZOhrDHwSNgA0aVejT_9OTOaBUmywKGtdD7E8PhP7JqbMTXH2gM_9xU7t7TRvntE5uXeALKv4EDurn0p5bASwsYie7xWbsMHGF8lN0aGqJhNKiHL_NFGnR0wzPWS3UXFP7wZFbLM9qSPw.XFMSREEcssFqUM5kIwChIA",
  "idToken" : "eyJraWQiOiIxNTEwOTMtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9"
  }
```

**Then**   
> **Step 1:**
> Mastercard returns `maskedCard` object and `srcCorrelationId` to the integrator during successful enrollment of the card in Click to Pay system.

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

> **Step 2:**
> Integrator uses the values returned above and calls the [checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) method, which loads the Mastercard DCF.
> Integrator can also request for **Transaction Authentication (TA)** while calling the checkout() method.
> User enters necessary consumer details.
* DSRP
* NONE

```DSRP
  {
      "idToken": "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MDg5NTEyLCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcwOTk0ODAsImlhdCI6MTY3NzA5ODU4MCwianRpIjoiZjFmOTJkMmUtNGZlMy00MWMyLWJhMjItNzUzMTE1NDZkNzcxIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.WK5FX_VweN0IDSii28S0SFYfCc3u4KpKvsygELlgRDuwgeRY66VW1CbojxT36vBx3fVgFq9Ipi0k67ud1mEXjK10VsfB1KThrx_kxGYtVIN_QCWKhNahkxv1099Bv8lS7Q5FAOH8NF7J2GrvnAKxnZsSpiGORWozQavWHdJRz9quDBzKaTPexZSFfGUCvWrLQf02cSKELwu_IfFPraQrUiu15Q_2TR09SO4YaNd_r7D4eiYzoTygvA9g-9OLEZjNQIWcwDC9NsHnfi1ZDBrvBfCMBpSHWExUC8Qxxc24pkf2LwycLbS746OwGMz3NO6ObxxkNfb3PdLQXhUbeinULw",
      "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
      "dpaData": {
          "dpaPresentationName": "Name"
      },
      "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
      "dpaTransactionOptions": {
          "transactionAmount": {
              "transactionAmount": "100.00",
              "transactionCurrencyCode": "USD"
          },
          "transactionType": "PURCHASE",
          "dpaBillingPreference": "FULL",
          "dpaShippingPreference": "FULL",
          "customInputData": {
              "com.mastercard.dcfExperience": "WITHIN_CHECKOUT"
          },
          "consumerNationalIdentifierRequested": false,
          "dpaAcceptedBillingCountries": [],
          "dpaAcceptedShippingCountries": [],
          "dpaLocale": "en_US",
          "consumerEmailAddressRequested": true,
          "consumerNameRequested": true,
          "consumerPhoneNumberRequested": true,
          "confirmPayment": false,
          "payloadTypeIndicatorCheckout": "PAYMENT",
          "payloadTypeIndicatorPayload": "PAYMENT",
          "paymentOptions": {
              "dpaDynamicDataTtlMinutes": 15,
              "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
        }
      }
}
```

```NONE
{
    "idToken": "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MDg5NTEyLCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcwOTk0ODAsImlhdCI6MTY3NzA5ODU4MCwianRpIjoiZjFmOTJkMmUtNGZlMy00MWMyLWJhMjItNzUzMTE1NDZkNzcxIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.WK5FX_VweN0IDSii28S0SFYfCc3u4KpKvsygELlgRDuwgeRY66VW1CbojxT36vBx3fVgFq9Ipi0k67ud1mEXjK10VsfB1KThrx_kxGYtVIN_QCWKhNahkxv1099Bv8lS7Q5FAOH8NF7J2GrvnAKxnZsSpiGORWozQavWHdJRz9quDBzKaTPexZSFfGUCvWrLQf02cSKELwu_IfFPraQrUiu15Q_2TR09SO4YaNd_r7D4eiYzoTygvA9g-9OLEZjNQIWcwDC9NsHnfi1ZDBrvBfCMBpSHWExUC8Qxxc24pkf2LwycLbS746OwGMz3NO6ObxxkNfb3PdLQXhUbeinULw",
    "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
    "dpaData": {
        "dpaPresentationName": "Name"
    },
    "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
    "dpaTransactionOptions": {
        "transactionAmount": {
            "transactionAmount": "100.00",
            "transactionCurrencyCode": "USD"
        },
        "transactionType": "PURCHASE",
        "dpaBillingPreference": "FULL",
        "dpaShippingPreference": "FULL",
        "customInputData": {
            "com.mastercard.dcfExperience": "WITHIN_CHECKOUT"
        },
        "consumerNationalIdentifierRequested": false,
        "dpaAcceptedBillingCountries": [],
        "dpaAcceptedShippingCountries": [],
        "dpaLocale": "en_US",
        "consumerEmailAddressRequested": true,
        "consumerNameRequested": true,
        "consumerPhoneNumberRequested": true,
        "confirmPayment": false,
        "payloadTypeIndicatorCheckout": "PAYMENT",
        "payloadTypeIndicatorPayload": "PAYMENT",
        "paymentOptions": {
            "dpaDynamicDataTtlMinutes": 15,
            "dynamicDataType": "NONE"
        }
    }
}
```

* TA

```TA
  {
      "srcCorrelationId": "a5fe8aeb-a0c4-45ce-8313-dde6bb5e6c3d",
      "srcDigitalCardId": "75fe8aeb-a0c4-45ce-8313-dde6bb5e6c4e",
      "dpaTransactionOptions": {
          "acquirerId": "545301",
          "acquirerBIN": "SRC3DS",
          "merchantCategoryCode": "06",
          "merchantCountryCode": "US"
          "authenticationPreferences":{
              "payloadRequested": "AUTHENTICATED",
          },
          "transactionAmount": {
              "transactionAmount": "250",
              "transactionCurrencyCode": "USD"
          },   
          "threeDsInputData": {
              "billingAddress": {
                 "name": "Coby Greenholt",
                 "line1": "49674 Gorczany Village",
                 "line2": "Hansen Circle",
                 "state": "CT",
                 "zip": "98410",
                 "countryCode": "US"
              }  
            }
          }  
  }
```

> **Step 3:**
> Integrator receives the `dcfActionCode`= `COMPLETE` along with `checkoutResponse`.
> Integrator shows the summary of consumer information returned in `checkoutResponse` on Order Review Screen (if applicable).   
>
> User clicks Place Order.

```json
  {
      "dcfActionCode": "COMPLETE",
      "unbindAppInstance": false,
      "checkoutResponseSignature": "eyJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpYXQiOjE2NzcwOTg1OTMsImFsZyI6IlJTMjU2IiwianRpIjoiYTdkNjMzNDctNjE2Mi00NzQ0LWIyZGMtOTQ4YzYxNWY1NjliIiwia2lkIjoiMTQ5MTI2LXNyYy1wYXlsb2FkLXZlcmlmaWNhdGlvbiJ9.eyJzcmNDb3JyZWxhdGlvbklkIjoiMzRmNGEwNGIuNTMzZmViNGUtZmU3Ni00NzU0LWEzZTUtNjU0MjE1MGE1YzRmIiwic3JjaVRyYW5zYWN0aW9uSWQiOiI1OWExMWViNS0xOWM5LTQ5ZWQtYTQ1NS1lMjk2MDJjYTUxNjciLCJtYXNrZWRDYXJkIjp7InNyY0RpZ2l0YWxDYXJkSWQiOiI3YjNkZTMwYS1iMTVlLTQ1NzgtYWI4OC1mZmE0MWQ5MTE5YmMiLCJwYW5CaW4iOiI1MTIwMzUiLCJwYW5MYXN0Rm91ciI6IjQ1NTIiLCJ0b2tlbkxhc3RGb3VyIjoiMjk0MCIsImRpZ2l0YWxDYXJkRGF0YSI6eyJzdGF0dXMiOiJBQ1RJVkUiLCJwcmVzZW50YXRpb25OYW1lIjoiVGVzdCBJc3N1ZXLDgsKuIiwiZGVzY3JpcHRvck5hbWUiOiJtYXN0ZXJjYXJkIiwiYXJ0VXJpIjoiaHR0cHM6Ly9zYnguYXNzZXRzLm1hc3RlcmNhcmQuY29tL2NhcmQtYXJ0L2NvbWJpbmVkLWltYWdlLWFzc2V0LzVmMjFmMDhlLTA0OTAtNDYwMy1iY2QxLWFjMGJlN2VhMGVjZC5wbmciLCJpc0NvQnJhbmRlZCI6ZmFsc2V9LCJwYW5FeHBpcmF0aW9uTW9udGgiOiIxMiIsInBhbkV4cGlyYXRpb25ZZWFyIjoiMjAyNCIsInBheW1lbnRDYXJkVHlwZSI6IkNSRURJVCIsIm1hc2tlZEJpbGxpbmdBZGRyZXNzIjp7ImFkZHJlc3NJZCI6ImI5YjRmMzFiLWUwZjYtNGU2MS04ZDUwLWFhNjk2YjlkYWM2NiIsIm5hbWUiOiJkYSoqKmwgaCoqKiIsImxpbmUxIjoiMSoqIDUqKiBBKioqKioiLCJjaXR5IjoiTmV3IFlvcmsiLCJzdGF0ZSI6Ik5ZIiwiY291bnRyeUNvZGUiOiJVUyIsInppcCI6IjEwMDExIn0sImRhdGVPZkNhcmRDcmVhdGVkIjoiMjAyMi0xMS0xOFQxNjozMjoxMC4xODVaIiwiZGF0ZU9mQ2FyZExhc3RVc2VkIjoiMjAyMy0wMi0yMlQxODoxMzo1MC4yMzVaIn0sIm1hc2tlZENvbnN1bWVyIjp7InNyY0NvbnN1bWVySWQiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJtYXNrZWRDb25zdW1lcklkZW50aXR5Ijp7ImlkZW50aXR5UHJvdmlkZXIiOiJTUkMiLCJpZGVudGl0eVR5cGUiOiJFTUFJTF9BRERSRVNTIn0sIm1hc2tlZEVtYWlsQWRkcmVzcyI6ImQqKioqKjdAZ21haWwuY29tIiwibWFza2VkTW9iaWxlTnVtYmVyIjp7ImNvdW50cnlDb2RlIjoiMSIsInBob25lTnVtYmVyIjoiKCoqKikgKioqLSoyNzQifSwiY291bnRyeUNvZGUiOiJVUyIsImxhbmd1YWdlQ29kZSI6ImVuIiwic3RhdHVzIjoiQUNUSVZFIiwibWFza2VkRmlyc3ROYW1lIjoiZCoqKioqIiwibWFza2VkTGFzdE5hbWUiOiJoKioqIiwibWFza2VkRnVsbE5hbWUiOiJkKioqKiogaCoqKiIsImRhdGVDb25zdW1lckFkZGVkIjoiMjAyMC0wMS0wOVQxNjoxNDoyOS4wMDVaIiwiZGF0ZUNvbnN1bWVyTGFzdFVzZWQiOiIyMDIzLTAyLTIyVDIwOjQzOjAwLjUwMVoifSwic2hpcHBpbmdBZGRyZXNzWmlwIjoiMTAwMTEiLCJzaGlwcGluZ0NvdW50cnlDb2RlIjoiVVMifQ.qYL2RSnMReMCTEV3tam2MRvOq64hutRED8l-6KdI4l8MtM394UONKlxtCZYQT_TAv-KdVbVRZfxOjPiF_mBVXrr_V88Jy1PZ4wNvO106t5WvX3bZY3Xb6TWFPezbl7GlEiHYh556GX0EMAJEOLttdZ8n_Epo20VQgylCLPe_s-4vw2mkfHvv7KcQP4cki-7qXmfe0bjj52uWIB-s4eS7cpWPpQ8DhVUXN1BHcWMWGhIJw88iy0CRFMnY29eeqtGg-bTmWi65jtwJNz40ItfmxvcB4H8y51EpUy2BEomCrV6RXCnKxkCvz0VY_c15P1IzxEEalvD-S1ujnEvbpEmsdg",
      "checkoutResponse": {
          "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
          "srciTransactionId": "59a11eb5-19c9-49ed-a455-e29602ca5167",
          "maskedCard": {
              "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
              "panBin": "512035",
              "panLastFour": "4552",
              "tokenLastFour": "2940",
              "digitalCardData": {
                  "status": "ACTIVE",
                  "presentationName": "Test Issuer",
                  "descriptorName": "mastercard",
                  "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
                  "isCoBranded": false
              },
              "panExpirationMonth": "12",
              "panExpirationYear": "2024",
              "paymentCardType": "CREDIT",
              "maskedBillingAddress": {
                  "addressId": "b9b4f31b-e0f6-4e61-8d50-aa696b9dac66",
                  "name": "ja***l d***",
                  "line1": "1** 5** A*****",
                  "city": "New York",
                  "state": "NY",
                  "countryCode": "US",
                  "zip": "10011"
              },
              "dateOfCardCreated": "2022-11-18T16:32:10.185Z",
              "dateOfCardLastUsed": "2023-02-22T18:13:50.235Z"
          },
          "maskedConsumer": {
              "srcConsumerId": "2899b782-633a-4ee0-88d9-555bf9d7c43d",
              "maskedConsumerIdentity": {
                  "identityProvider": "SRC",
                  "identityType": "EMAIL_ADDRESS"
              },
              "maskedEmailAddress": "j*****7@gmail.com",
              "maskedMobileNumber": {
                  "countryCode": "1",
                  "phoneNumber": "(***) ***-*123"
              },
              "countryCode": "US",
              "languageCode": "en",
              "status": "ACTIVE",
              "maskedFirstName": "j*****",
              "maskedLastName": "d***",
              "maskedFullName": "j***** d***",
              "dateConsumerAdded": "2020-01-09T16:14:29.005Z",
              "dateConsumerLastUsed": "2023-02-22T20:43:00.501Z"
          },
          "shippingAddressZip": "10011",
          "shippingCountryCode": "US"
      },
      "idToken": "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MDg5NTEyLCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcwOTk0ODAsImlhdCI6MTY3NzA5ODU4MCwianRpIjoiZjFmOTJkMmUtNGZlMy00MWMyLWJhMjItNzUzMTE1NDZkNzcxIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.WK5FX_VweN0IDSii28S0SFYfCc3u4KpKvsygELlgRDuwgeRY66VW1CbojxT36vBx3fVgFq9Ipi0k67ud1mEXjK10VsfB1KThrx_kxGYtVIN_QCWKhNahkxv1099Bv8lS7Q5FAOH8NF7J2GrvnAKxnZsSpiGORWozQavWHdJRz9quDBzKaTPexZSFfGUCvWrLQf02cSKELwu_IfFPraQrUiu15Q_2TR09SO4YaNd_r7D4eiYzoTygvA9g-9OLEZjNQIWcwDC9NsHnfi1ZDBrvBfCMBpSHWExUC8Qxxc24pkf2LwycLbS746OwGMz3NO6ObxxkNfb3PdLQXhUbeinULw"
  }
```

> **Step 4:**
> Integrator makes [POST transaction/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) call to retrieve payload.

```json
{
    "srcClientId": "5e0d4b84-189d-4c86-822d-590602f62062",
    "srcDpaId": "7a96bc0a-1a1e-4c62-996e-2153e3302291_systemtest",
    "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
    "srciTransactionId": "59a11eb5-19c9-49ed-a455-e29602ca5167",
    "payloadTypeIndicatorCheckout": "PAYMENT",
    "payloadTypeIndicatorPayload": "PAYMENT",
    "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
    "dpaTransactionOptions": {
        "transactionAmount": {
            "transactionAmount": 100,
            "transactionCurrencyCode": "USD"
        },
        "transactionType": "PURCHASE",
        "dpaBillingPreference": "FULL",
        "dpaAcceptedBillingCountries": [],
        "dpaShippingPreference": "FULL",
        "dpaAcceptedShippingCountries": [],
        "consumerEmailAddressRequested": true,
        "consumerNameRequested": true,
        "consumerPhoneNumberRequested": true,
        "threeDsPreference": "NONE",
        "dpaLocale": "en_US",
    }
}
```

```json
{
  "checkoutResponseJWS": "eyJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpYXQiOjE1NzA3Mzk3MzIsImFsZyI6IlJTMjU2IiwianRpIjoiMGNjODlkYTctMGZlNi00NDU1LWJjYWItZjU4Nzk0ZDY2NWY1Iiwia2lkIjoiMTQ5MDIzLXN0Zy1zcmMtcGF5bG9hZC12ZXJpZmljYXRpb24ifQ.eyJzcmNDb3JyZWxhdGlvbklkIjoiMzRmNGEwNGIuZmJhOTI2M2MtNzVmMS00YjgyLWIzOWItYjI5N2UzY2VlMDI3Iiwic3JjaVRyYW5zYWN0aW9uSWQiOiI1MjZlMWQzMS0xZmViLTQwMjYtYWJjZi1jYTZjZTg1ZWU5Y2IiLCJlbmNyeXB0ZWRQYXlsb2FkIjoiZXlKcmFXUWlPaUpIYjI5bmJHVlRVa00wUTB0bGVTSXNJbVZ1WXlJNklrRXhNamhIUTAwaUxDSmhiR2NpT2lKU1UwRXRUMEZGVUMweU5UWWlmUS5makdIN3BhRWZ3WHJWTDRhdm43TzJOZm9KUUFkbnBKak9nMXYxSGp3UmVVdFhERFF2MlkzZW9kMF9ZbUQ2VDlERVFreW9fTTRURlB4eXQ2SThCZXdNa3dBYVprNUpuYi1jUTVRZkdFVks5Uk94bHVzQWNWOHBGOFFrRktOM1N2dHZFM011MGMxbTNYUV9nUW96bnBYcU91QUxNRnZxNjVhYjBudzdnaGdIaGxqaXJuREZQdVRRVTFyZEJqd2ZVd2tadGtrQXVRLThHdkVFUTdhY3lNMllZX1NPZUpYZzIzX0JYa1BQY25IendERlQ2VWNGUUlNOEltaFJNMzI1NFVrcW4yREJDUWxzZlFXSGVMUVJPQV82SkotcU15OHFhVGUyRkdKemhTTXJaZEd1d1BpRkFaYmlXWFZia0M3Vi0tdzNIckxCcHN5NGhYU1dNSndsenRvUncuU1F5VDFfRXRUMnlDLU55cC5GeDBZUlByOVBncnVTWTdiMDJrMVgxS1ZaMFNtcHpqb0N5bUs1N0pmMW9Dbk5rMU84MzkxckhJVG5hTEFEc2FhZUZEaHdNTUl0NHJIelBic2RhVEJXcHpmQlNneUs0QWF3ZE13SEFZVlJnUmJNQmhlMXppYTVSTVpHYkJDTzN6c2dTRW5sZVRHSmVKYU81NlExRkFuQ3ZYblQwN293ekdPOXltc3JfZEhvWExKWVNnZGthUE5sRTZZOENOU2VJa0psTXdsU1o0YkhNckRRODNkNTdiR0dJT3Y3ZWZoZ2RqVGF3SVpsWmNKUXZhVWMyU09JYWU0MUpIellBeGhKSDZ4R3kxckhCZFR1dEV0UkhQNVdaSzVva1BLcG14Z1dPUGk4MW5KbHM3aVIzVEVKWktEMllwNTNPSENvdVZabjBZRFJqV19vR0t6UENmNnVMQ0VSb3RNZHNQXzBhSVBmSTk0LWxuM25WZnF1c1dSdGxIN253eEQ0eUF3VW1ndkVCLW5IYUFVb1RmdE9YMGUyQ2YtRWVHTjFmemZPQ1Bid2g3YWlXWmJLVnp2Tmg5clBBOXNRWUwyT1RtN1pPRmVOTXItZ01XWnZHUjZFVGl1OWwta3ZmVHdjMnpaZXRWbVFGVm5lazVKMGdhdmlZQ000WHZmNEZtVXktNTBtOVQxOWVhZnN1bXVlckJ6cDZaQ20xaTBmMmFSSVpXNGMwdXhMMXRQSlkwLVl2bFh4cEJNNERCdjJEc3h1MkxldDlpZV93c2RRd2NFTk1GWUxxbjY0ZmVWb2stUkVaeUt4V0tJR3pmWkloWkx3LTl4a0xDdEh3U2VCa2hMMC1pOVhqQXJnWEFteHVUYmhEV0NYMUFPQkFvOHJHOE0xSmJ2N2lzSk9mVENsQk5BQTFsWjlRcE9MOHViUFJOa3ZXeHhEWmFfYVVQWWt3aDZ4bFRwdXhzeXFYaTBHWnRqRi1jWkp4cVZSOExWcXN3WWo1cDdrTmpWMlpYMDRDS1ZjS0lZUjZ3dm9KUWM0T2FFV1FkSlhJb0NFZVNGVVpoaUNHZVljX1VCQ2tRcnplOHZoZUh2SmQzdFVLTHBqSzdXM2gyUHc0ZGhRNTVBUzhhMUNIMDJtNklQcU9FMVgyUmY5WEk5UUxKUzFyMXZwVE5fYjRzUnROaTUwR3MxODQ4LUxPb0U2RmJwaHdHVHZoc0pnWGxHakl2MHlucGJHRXMzX0lvVUc1dnpCZEdycHBUTEZaMjVEbXkwMzlVMG9neW4wRElia3l4S2dfbS1JVlVTdWdDckViZlFPV0swV3lscnpfYkVhZlFpUEJjMDJDeGNmQkJtcFNEUHBVVU1lZ1plRHc5eV9qbmx4X0R1ajFveU1pYzRvR1YxcEMtLUl5YVRGMWt6Z1hwUnlyUmd6NHlCVWFORlU4S0JVUmJ3cmJVd2hwX3BUSll1Q0lrTW53M1hqSEh0RHFEa1h1YWNLRWpVNGhvdjgzV1B4TnBiclV1VXUtVjZJSEY3b2R2MDE2R3pPbDVTVkxiNHNvN09MNzhWNDBjVWNQNVZJQnMzdzlyS0VnRVBBeFNVOHdzWjQxYkNGLVBDc2JMQTBmRE8zaUItOXh2bXpfNWJYUWdnLW5fLXcxVjV5NHd2ZnJNOTY5dk55VnJHX3NFeGtoNVN0QWp4Y2prN24yREZDVWM3UEFjU3hMYnVsbFVmdmFqZmI4Nm5FS0JnTjJtTGVCcjNtNnAyVlZGZ2c3bVlpS3BZY1dROHNHRG1Nei1lUlBITEl6TmFTZ1M0aC1fRVF5VnVWdWNUZklpTWJ5RGtfbXRJZG9rV1NXdmJqNjItMm5vd3VTVVE0RWtHbDYzSnlPODZWY21EbHJ1WFNWMmdydmpNZi1HVmY5WW9nakNPMURDb3JjcExTTk1DUUVUS251TEIyeWVIRkF3eldjSHlYN2hmeWVTcEx4X0l0WFItV3U5YlR0NmZidWNJSzk1dzVQNFZ6VTMwcUUxZExZdE41RWMuVDVZSHhTclU1RGpLYjNNY00xT2YwQSIsIm1hc2tlZENhcmQiOnsic3JjRGlnaXRhbENhcmRJZCI6ImJiN2I2ZjBiLWNmZDYtNGY0Yy1hNmIyLTdiYWNmM2RmZTcwYiIsInBhbkJpbiI6IjU0NTUwMyIsInBhbkxhc3RGb3VyIjoiNzQxNiIsImRpZ2l0YWxDYXJkRGF0YSI6eyJzdGF0dXMiOiJBQ1RJVkUiLCJwcmVzZW50YXRpb25OYW1lIjoiQ2l0aSBCYW5rIiwiZGVzY3JpcHRvck5hbWUiOiJtYXN0ZXJjYXJkIiwiYXJ0VXJpIjoiaHR0cHM6Ly9zdGFnZS5hc3NldHMubWFzdGVyY2FyZC5jb20vY2FyZC1hcnQvY29tYmluZWQtaW1hZ2UtYXNzZXQvOWQ0MmRmNTQtYzVmZC00MzhiLWE4ODYtZmYwYmQxZThmN2VjLnBuZyJ9LCJwYW5FeHBpcmF0aW9uTW9udGgiOiIwOCIsInBhbkV4cGlyYXRpb25ZZWFyIjoiMjAyMyIsIm1hc2tlZEJpbGxpbmdBZGRyZXNzIjp7ImFkZHJlc3NJZCI6ImI5MGVjYjM4LTg5N2QtNGY5NS1hYjQzLTE1NTY1ODkxOGE5NiIsIm5hbWUiOiJKKioqIEQqKiIsImxpbmUxIjoiMSoqIDUqKiBBKioqKioiLCJsaW5lMiI6IkYqKioqIDEqIiwiY2l0eSI6Ik5ldyBZb3JrIENpdHkiLCJzdGF0ZSI6Ik5ZIiwiY291bnRyeUNvZGUiOiJVUyIsInppcCI6IjEwMDExIiwiY3JlYXRlVGltZSI6IjIwMTktMTAtMTBUMjA6MzU6MTMuNTI2WiJ9LCJkY2YiOnsiYXBwbGljYXRpb25UeXBlIjoiV0VCX0JST1dTRVIiLCJ1cmkiOiJodHRwczovL3N0YWdlLnNyYy5tYXN0ZXJjYXJkLmNvbS9wYXkvIiwibG9nb1VyaSI6Imh0dHA6Ly9tYXN0ZXJjYXJkLmNvbS8iLCJuYW1lIjoibWFzdGVyY2FyZCJ9LCJkYXRlT2ZDYXJkQ3JlYXRlZCI6IjIwMTktMTAtMTBUMjA6MzU6MDMuODk1WiJ9LCJtYXNrZWRDb25zdW1lciI6eyJzcmNDb25zdW1lcklkIjoiODc2NjlkNTEtN2JlNC00MTk5LTkzMGItOTJjNjJhODk0ZmVjIiwibWFza2VkQ29uc3VtZXJJZGVudGl0eSI6eyJpZGVudGl0eVByb3ZpZGVyIjoiU1JDIiwiaWRlbnRpdHlUeXBlIjoiRU1BSUxfQUREUkVTUyIsIm1hc2tlZElkZW50aXR5VmFsdWUiOiJqKioqKio3QGR1bW15ZW1haWwuY29tIn0sIm1hc2tlZEVtYWlsQWRkcmVzcyI6ImoqKioqKjdAZHVtbXllbWFpbC5jb20iLCJtYXNrZWRNb2JpbGVOdW1iZXIiOnsiY291bnRyeUNvZGUiOiIxIiwicGhvbmVOdW1iZXIiOiIoKioqKSAqKiotKjg5NSJ9LCJtYXNrZWROYXRpb25hbElkZW50aWZpZXIiOiIqKioqKioqKioiLCJjb3VudHJ5Q29kZSI6IlVTIiwibGFuZ3VhZ2VDb2RlIjoiRU4iLCJtYXNrZWRGaXJzdE5hbWUiOiJqKioqIiwibWFza2VkTGFzdE5hbWUiOiJkKioiLCJtYXNrZWRGdWxsTmFtZSI6ImoqKiogZCoqIiwiZGF0ZUNvbnN1bWVyQWRkZWQiOiIyMDE5LTEwLTEwVDIwOjM0OjU3LjUzMloifSwic2hpcHBpbmdBZGRyZXNzWmlwIjoiMTAwMTEiLCJzaGlwcGluZ0NvdW50cnlDb2RlIjoiVVMifQ.JBqO5Y4HSNAwL6o6_-al7burrIU-5H6x-UxtK8jFxSQ5EsvDoGOEjRSxBu9dlHStodMQ2FndZhV29dCKVcw1cpmDVuFUevDFcnsD4oIwYLM-VgLocx_jF749RAI-4FyGXZoSPcZaOpI2N3thWU9S2XD2-sfxFnDfitUul0have4-mQWEVBm0h6PF8DVmjJMklk6rY4efP18RNTt73GFyP_g86TU5FxHhogXsWrBsQVXX8REh2wDfVNQPllhCmFElkjeUUmylgkbhioPddh3JtR2eLurZ4Ttuevvxk0fjeJtgNfkgXjk9zdpxRyjlf_jArjbU9dtE9dZT5Spx45hfSQ"
}
```

> **Step 5:**
> Mastercard system responds back with the payload.   
>
> If the Integrator opts for **Transaction Authentication (TA)** during the checkout method, they receive authenticated payload.
> Integrator decrypts the Payload and processes the transaction.
* DSRP
* PAN
* DSRP+PAN

```DSRP
// DSRP cryptogram in the dynamicData object
{
    "payload": {
        "card": null,
        "token": {
            "paymentToken": "************2940",
            "tokenExpirationMonth": "12",
            "tokenExpirationYear": "2025",
            "paymentAccountReference": "50011BEGA4H9ZWM5GNZGI1GX9H8QH"
        },
        "shippingAddress": {
            "addressId": "0919bced-6b36-440e-b09f-9d368a0c2eea",
            "name": "john doe",
            "line1": "114 5th Avenue",
            "city": "New York",
            "state": "NY",
            "countryCode": "US",
            "zip": "10011",
            "createTime": "2022-11-22T18:05:55.230Z",
            "lastUsedTime": "2023-02-22T15:42:27.191Z"
        },
        "consumerEmailAddress": "dchand1987@gmail.com",
        "consumerFirstName": "john",
        "consumerLastName": "doe",
        "consumerFullName": "john doe",
        "consumerMobileNumber": {
            "countryCode": "1",
            "phoneNumber": "9084039274"
        },
        "srcTokenResultsData": {
            "unpredictableNumber": "82ccb506"
        },
        "dynamicData": {
            "dynamicDataValue": "9F26083CD5A44BBBE0536F9F2701809F10120314A500000000000000001D8E5219ED00FF9F370482CCB5069F36020003950500000000009A030000009C01009F02060000000100005F2A020840820212809F1A020000",
            "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
        },
        "billingAddress": {
            "addressId": "b9b4f31b-e0f6-4e61-8d50-aa696b9dac66",
            "name": "daniel hand",
            "line1": "114 5th Avenue",
            "city": "New York",
            "state": "NY",
            "countryCode": "US",
            "zip": "10011",
            "createTime": "2022-11-18T16:33:07.296Z"
        }
    },
    "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
    "srciTransactionId": "59a11eb5-19c9-49ed-a455-e29602ca5167",
    "maskedCard": {
        "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
        "panBin": "512035",
        "panLastFour": "4552",
        "tokenBinRange": "222203",
        "tokenLastFour": "2940",
        "digitalCardData": {
            "status": "ACTIVE",
            "presentationName": "Test IssuerÂ®",
            "descriptorName": "mastercard",
            "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
            "isCoBranded": false
        },
        "panExpirationMonth": "12",
        "panExpirationYear": "2024",
        "paymentCardType": "CREDIT",
        "maskedBillingAddress": {
            "addressId": "b9b4f31b-e0f6-4e61-8d50-aa696b9dac66",
            "name": "da***l h***",
            "line1": "1** 5** A*****",
            "city": "New York",
            "state": "NY",
            "countryCode": "US",
            "zip": "10011",
            "createTime": "2022-11-18T16:33:07.296Z"
        },
        "serviceId": "SRC",
        "dateOfCardCreated": "2022-11-18T16:32:10.185Z",
        "dateOfCardLastUsed": "2023-02-22T18:13:50.235Z"
    },
    "maskedConsumer": {
        "srcConsumerId": "2899b782-633a-4ee0-88d9-555bf9d7c43d",
        "maskedConsumerIdentity": {
            "identityProvider": "SRC",
            "identityType": "EMAIL_ADDRESS",
            "maskedIdentityValue": "d*****7@gmail.com"
        },
        "maskedEmailAddress": "d*****7@gmail.com",
        "maskedMobileNumber": {
            "countryCode": "1",
            "phoneNumber": "(***) ***-*274"
        },
        "countryCode": "US",
        "languageCode": "en",
        "status": "ACTIVE",
        "maskedFirstName": "d*****",
        "maskedLastName": "h***",
        "maskedFullName": "d***** h***",
        "dateConsumerAdded": "2020-01-09T16:14:29.005Z",
        "dateConsumerLastUsed": "2023-02-22T20:43:00.501Z"
    },
    "shippingAddressZip": "10011",
    "shippingCountryCode": "US",
}
```

`// Contains the PAN card object
{
"payload": {
"card": {
"primaryAccountNumber": "5120350100064537",
"panExpirationMonth": "08",
"panExpirationYear": "23",
"cardholderFullName": "John Doe",
"cardholderFirstName": "John",
"cardholderLastName": "Doe",
"billingAddress": {
"addressId": "ace92264-46eb-4cd8-b9b5-f2eff15b5ad8",
"name": "John Doe",
"line1": "100 5th Avenue",
"line2": "Floor 10",
"city": "New York City",
"state": "NY",
"countryCode": "US",
"zip": "10011"
}
},
"paymentAccountReference": "5001a9f027e5629d11e3949a0800b"
},
"shippingAddress": {
"addressId": "20a3c19f-934d-4c9a-89c1-864e360da387",
"name": "John Doe",
"line1": "100 5th Avenue",
"line2": "Floor 10",
"city": "New York City",
"state": "NY",
"countryCode": "US",
"zip": "10011"
},
"consumerEmailAddress": "johndoe@dummyemail.com",
"consumerFirstName": "john",
"consumerLastName": "doe",
"consumerFullName": "john doe",
"consumerMobileNumber": {
"countryCode": "1",
"phoneNumber": "9912797895"
},
"billingAddress": {
"addressId": "ace92264-46eb-4cd8-b9b5-f2eff15b5ad8",
"name": "John doe",
"line1": "100 5th Avenue",
"line2": "Floor 10",
"city": "New York City",
"state": "NY",
"countryCode": "US",
"zip": "10011"
}
},
"srcCorrelationId": "34f4a04b.d2c795c2-8fda-471f-8670-cf2d65384824",
"srciTransactionId": "a56659c7-665c-4a67-88de-5e763fee225e",
"maskedCard": {
"srcDigitalCardId": "OlUgj8PoRkmXgfWal5HSxg000000000000US",
"panBin": "545503",
"panLastFour": "0337",
"digitalCardData": {
"status": "ACTIVE",
"presentationName": "Test IssuerÂ®",
"descriptorName": "mastercard",
"artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
"isCoBranded": false
},
"panExpirationMonth": "08",
"panExpirationYear": "2023",
"paymentCardDescriptor": "mastercard",
"paymentCardType": "CREDIT",
"maskedBillingAddress": {
"addressId": "83003276-05e0-4743-83fc-e5cbf095e4b2",
"line1": "1** 5** A*****",
"city": "New York",
"state": "NY",
"countryCode": "US",
"zip": "10011",
"createTime": "2023-10-06T11:17:30.574Z"
},
"serviceId": "SRC",
"dateOfCardCreated": "2023-10-06T11:16:15.931Z",
"dateOfCardLastUsed": "2023-10-06T11:19:21.050Z"
},
"maskedConsumer": {
"srcConsumerId": "0d10760d-c105-4ae7-89ee-3f1d822b072b",
"maskedConsumerIdentity": {
"identityProvider": "SRC",
"identityType": "EMAIL_ADDRESS",
"maskedIdentityValue": "johndoe@dummyemail.com"
},
"maskedEmailAddress": "johndoe@dummyemail.com",
"maskedMobileNumber": {
"countryCode": "44",
"phoneNumber": "(`***) ***-*895"
},
"countryCode": "US",
"languageCode": "en",
"status": "ACTIVE",
"maskedFirstName": "J***",
"maskedLastName": "D**",
"maskedFullName": "J** `* D**",
"dateConsumerAdded": "2023-10-06T11:17:30.29Z",
"dateConsumerLastUsed": "2023-10-06T11:22:48.967Z"
},
"shippingAddressZip": "10011",
"shippingCountryCode": "US",
}`

<br />

`
`


```DSRP+PAN
// Contains DSRP cryptogram in the dynamicData object and PAN in the card object
{
"payload": {
"card": {
"primaryAccountNumber": "5120350100064537",
"panExpirationMonth": "12",
"panExpirationYear": "2025",
"cardholderFullName": "John Doe",
"cardholderFirstName": "John",
"cardholderLastName": "Doe",
"billingAddress": {
"addressId": "4b870cd2-bc3f-46b1-952d-3da8f1b61907",
"name": "John Doe",
"line1": "150 5th Avenue",
"city": "New York",
"state": "NY",
"countryCode": "US",
"zip": "10011",
"createTime": "2024-06-28T09:58:21.799Z"
},
"paymentAccountReference": "5001CVSZVSHRWCG6YCKZD68DX3S43"
},
"token": {
"paymentToken": "***********2505",
"tokenExpirationMonth": "07",
"tokenExpirationYear": "2027",
"paymentAccountReference": "5001CVSZVSHRWCG6YCKZD68DX3S43",
"panSequenceNumber": "00"
},
"shippingAddress": {
"addressId": "78afb7ed-613e-4289-b7c4-633342d0d34c",
"name": "John Doe",
"line1": "1 Angel Lane",
"city": "London",
"countryCode": "GB",
"zip": "EC4R3AB",
"createTime": "2024-07-03T12:06:34.993Z",
"lastUsedTime": "2024-07-23T10:11:13.017Z"
},
"consumerEmailAddress": "john.doe@mastercard.com",
"consumerFirstName": "John",
"consumerLastName": "Doe",
"consumerFullName": "John Doe",
"consumerMobileNumber": {
"countryCode": "44",
"phoneNumber": "7966778607"
},
"srcTokenResultsData": {
"unpredictableNumber": "1410ba3f"
},
"dynamicData": {
"dynamicDataValue": "AIzSpM52zu+PABIUELo/AAADFA==",
"dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
},
"billingAddress": {
"addressId": "4b870cd2-bc3f-46b1-952d-3da8f1b61907",
"name": "John Doe",
"line1": "150 5th Avenue",
"city": "New York",
"state": "NY",
"countryCode": "US",
"zip": "10011",
"createTime": "2024-06-28T09:58:21.799Z"
}
},
"srcCorrelationId": "34f4a04b.e5bc7863-da34-4c59-8324-c154bed743f7",
"srciTransactionId": "d80d7e8e-8716-4063-b309-935096936df9",
"maskedCard": {
"srcDigitalCardId": "2v5VoZryQ7GwuN5QAPAA9A000000000000US",
"panBin": "520424",
"panLastFour": "8700",
"tokenBinRange": "520424",
"tokenLastFour": "2505",
"digitalCardData": {
"status": "ACTIVE",
"descriptorName": "Test Bank 2",
"artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/bde9ad2c-696e-4dee-97eb-984af8eefc93.png",
"isCoBranded": false,
"longDescription": "Test Bank for Mastercard MTF",
"foregroundColor": "ffffff",
"issuerName": "Test Issuer"
},
"panExpirationMonth": "12",
"panExpirationYear": "2025",
"paymentCardDescriptor": "mastercard",
"paymentCardType": "CREDIT",
"maskedBillingAddress": {
"addressId": "4b870cd2-bc3f-46b1-952d-3da8f1b61907",
"name": "Wi****m Ok*****e",
"line1": "1** 5* A*****",
"city": "New York",
"state": "NY",
"countryCode": "US",
"zip": "10011",
"createTime": "2024-06-28T09:58:21.799Z"
},
"serviceId": "SRC",
"dateOfCardCreated": "2024-06-28T09:57:59.346Z",
"dateOfCardLastUsed": "2024-07-23T10:11:12.190Z"
},
"maskedConsumer": {
"srcConsumerId": "cef8ce47-cb3c-477f-b871-24304a8ea00b",
"maskedConsumerIdentity": {
"identityProvider": "SRC",
"identityType": "EMAIL_ADDRESS",
"maskedIdentityValue": "j****[e@mastercard.com](mailto:e@mastercard.com)"
},
"maskedEmailAddress": "j****mailto:e@mastercard.com",
"maskedMobileNumber": {
"countryCode": "44",
"phoneNumber": "(*) ***-*607"
},
"countryCode": "US",
"languageCode": "en",
"status": "ACTIVE",
"maskedFirstName": "J***",
"maskedLastName": "D**",
"maskedFullName": "J* D**",
"dateConsumerAdded": "2024-03-21T16:17:37.64Z",
"dateConsumerLastUsed": "2024-07-23T10:16:19.081Z"
},
"shippingAddressZip": "EC4R3AB",
"shippingCountryCode": "GB",
}
```

<br />

```json
{
    "merchantTransactionId": "0a4e0d3.34f4a04b.e005240277106f93218a2dedc71450b2cc9f4801",
    "encryptedPayload": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.iVZZl1ZwQT09FsXlQFBeHcdm3WwiFoNO4UPyyMcoTWFS0ew2zFf_Mdmvs1ZASLomchFC1IiL-pR83svuA-DTnzGWatHtvO9d2NmJq5tT4qqbEPY_AM_4P79XHZ2bUjH9YoS84gbYQqEBXiMQiy0Up63myQFTut63RMbkMgMbRCAEOXh7re3z6OQo4aqzJHmaGMSuHG9DtBUXPfjqwmP8SWmKwX6mAqbOmYgLk-DFBOniTQrXp6qFOttengoj0ys--HZH2TWCFpw6Po0M9KpBy7-tuMjFD47K0FsXJTfazT1sUuE-noe3NdEaSOpdNznn2OmGmFQkpKZpNroKwHzkSA.oxavbMpPY-Yroi9yFIPm1w.hYN4KxadpHbDS_Xb5w0rbcyP_gIPGgM0jP5GW57vIyw9eh7LUNwniji40bTbezGtZsaxuCjJeVucG_I-CPdNxlGNuR5HCFWaWZUI_ipHQwLWTqxfD2cUbbYRbOi3-kvpg3MOK9LInAp-_vaSuxA8ZgxkZRJi4PSYAHQE1T07_Nzv2-TTLTRMy184cFH-zSY39Ml5UlToC49hONvqHH3zsRsYCcoGmwGwpvNnt_7d8TFlRBjIctRKzNxz3MSauBU_l3OuD8JwtaZfUcj4NMhaa1ZcK3r5zfn63K_LWiLEJLo7AMJvbDGJW80fppWsMlGLcc5BVXq2tO2Wdb4Vr2Wu1uwTN5wFMJb9M7QNqSYZ4jJNPpTHbHzIy6UVbvAxmH50RKuazVGIB6aUuJ1B1A87yqa0NeyecFIjPctCyXDb_tzlagfpA7PiHGN-rhfRhKWIn_JpDwoXv72IJM3jVr8U9vWzUM3pE8yrWD4pAen5T4g_EgDfsWPIrTJugN10uJPoyWXdhUPkWESqfVf_GrEe1ShI7AJ8hA1RgdU87X9Aqu0op2lJKoYb83HX-Nd9KF3VmwMBmD7oM3zuaAyWcBQd8yOSx1bkA52CcupizuCODSS2WTWG2IeRx-a3kCXRxBz7.KRVMRNt_uybn4krrXl60Qg",
    "correlationId": "64abb44f-cb10-492e-a321-dd89f34cb259",
    "assuranceData": {
        "verificationData": [
            {
                "verificationType": "CARDHOLDER",
                "verificationEntity": "02",
                "verificationMethod": "07",
                "verificationResults": "01",
                "verificationTimestamp": "1709586931874",
                "verificationEvents": [
                    "01"
                ]
            }
        ],
        "threeDsOutputData": {
            "dsTransID": "7dd640ac-1a35-4c60-5204-243750338567"
        },
        "eci": "02"
    },
    "maskedCard": {
        "srcDigitalCardId": "ga4LnQnrQduNbe1GTVSaUw000000000000GB",
        "panBin": "520424",
        "panLastFour": "9901",
        "digitalCardData": {
            "descriptorName": "Bank Rewards Mastercard",
            "artUri": "https://stage.assets.mastercard.com/card-art/combined-image-asset/HIGH-MASK-3x.png",
            "coBrandName": "Co brand partner",
            "isCoBranded": true
        },
        "panExpirationMonth": "08",
        "panExpirationYear": "2029",
        "maskedCardholderFullName": "J*** D**",
        "maskedCardholderFirstName": "J***",
        "maskedCardholderLastName": "D**",
        "paymentCardDescriptor": "mastercard",
        "paymentCardType": "DEBIT",
        "digitalCardFeatures": []
    },
    "maskedConsumer": {
        "maskedEmailAddress": "0*****0@mailinator.com",
        "maskedMobileNumber": {
            "countryCode": "1",
            "phoneNumber": "(***) ***-*556"
        }
    }
}
```

## Scenario 2 {#scenario-2}

**Assumptions**

* User has a Click to Pay profile with one or more enrolled cards and [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) returns `true`.
* No Click to Pay cookies are dropped in the browser from any network, [isRecognized()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md) call returns `false`.

<br />

**When**   
> On Integrator website, user selects Checkout with 'Click to Pay'.
> Integrator displays contact information form for user to enter email address or mobile number.
> Integrator calls the [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) method.

```Javascript
{
  "consumerIdentity":
    {
        "identityProvider": "SRC",
        "identityType": "EMAIL_ADDRESS",
        "identityValue": "jdoe@gmail.com"
    }
}
```

**Then**
> **Step 1:**
> Mastercard System returns response of [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) as `true` and sends the OTP on users requested channel (mobile or email).

```JavaScript
{
  "consumerPresent": true,
  "lastUsedCardTimestamp": "1677085095"
}
```

> **Step 2:**
> Integrator calls [initiateIdentityValidation()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/initiate-id-validation/index.md) method, which contains the User's opted OTP channel in the `requestedValidationChannelId` field.
> User decides to switch to different OTP channel (mobile phone number or email address ).

```json
{
"requestedValidationChannelId": "EMAIL_ADDRESS"
}
```

```json
// For Mastercard
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
    ],
  "network": "mastercard"
}
```

> **Step 3:**
> Integrator displays the OTP entry screen and allows user to enter the OTP received.
> Integrator calls the [completeIdentityValidation()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/complete-id-validation/index.md) method.

```json
{
  "validationData": "542856"
}
```

> On successful validation, Mastercard system responds with an `idToken` to the Integrator.

```json
{
  "idToken": "eyJraWQiOiIxNTEwOTMtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2ZTZlOWM4Yi02ODgwLTRhYTktOTMyOS04Zjc5YjdkNGU4NTUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImFtciI6WyJzbXNfb3RwIl0sImlzcyI6Imh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsInNyY19lbWFpbF9tYXNrIjoiZCoqKioqN0BnbWFpbC5jb20iLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOnRydWUsInNyY19waG9uZV9udW1iZXJfbWFzayI6IigqKiopICoqKi0qMjc0IiwiYXVkIjpbImh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsImh0dHBzOlwvXC93d3cudmlzYS5jb20iLCJodHRwczpcL1wvYW1lcmljYW5leHByZXNzLmNvbSIsImh0dHBzOlwvXC9zcmMuZGlzY292ZXIuY29tIl0sImF1dGhfdGltZSI6MTY3NzA5OTM1NSwicGhvbmVfbnVtYmVyIjoiXC9ENFdnb1MwVmloTno2MjN6eVN5ekFQamtaMGVlUTRMcmxrYW1ZVDk4S3c9IiwiZXhwIjoxNjc3MTAwMjU1LCJpYXQiOjE2NzcwOTkzNTUsImp0aSI6ImMzZDA5NDRkLWU5NzYtNGE4MC1iNmU0LWI0YzcwOTc2ZDkwOSIsImVtYWlsIjoiemZcL05UVis0OWhGV2lTRTFtaG1LQk9yWjFObmhBR3gxYTFuaDFJME0xbHM9In0.qwUJXABzc0UBa4fXoOv1dX9PUqeiP5yqdMulhYoQvpfiiVRVH_yuh3Kt2CkbP611D1SCXjG4f0y3BsZSoL7yXcd1wPazWszNU53mSO37BlF4PhCOwLUzPts5pxpXOM4qaUaUb3ZsC0T2-3Q37Zttuiad0VBlwsb4Ziq6vvxgAq35Fvf8OyQTvhqYbI2sO7gL5GttO1eRBTIhZANSQ_K83n2lKtplFjxWIhy-LTrB-4KV_r5cHZwYf3kwKJTUxf3NPqiDSK1l2OWtrYiOgO7KNao_Zro6rJqZPo4yruyy9g0o1BUcoDCi4faA3hmAW1sveZLUdDoq84uJ-fZtFjyeow"
}
```

> **Step 4:**
> Integrator retrieves the card details from profile by calling the [getSrcProfile()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/get-src-profile/index.md) and displays the cards to the user.
> User selects one of the cards from the card list.

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

> **Step 5:**
> Integrator calls the [checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) method, which loads the DCF.
> Integrator can also request for **Transaction Authentication (TA)** while calling the checkout method.
> User confirms the payment information on the DCF.
* BAU
* TA

```BAU
{
    "idToken": "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MDg5NTEyLCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcwOTk0ODAsImlhdCI6MTY3NzA5ODU4MCwianRpIjoiZjFmOTJkMmUtNGZlMy00MWMyLWJhMjItNzUzMTE1NDZkNzcxIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.WK5FX_VweN0IDSii28S0SFYfCc3u4KpKvsygELlgRDuwgeRY66VW1CbojxT36vBx3fVgFq9Ipi0k67ud1mEXjK10VsfB1KThrx_kxGYtVIN_QCWKhNahkxv1099Bv8lS7Q5FAOH8NF7J2GrvnAKxnZsSpiGORWozQavWHdJRz9quDBzKaTPexZSFfGUCvWrLQf02cSKELwu_IfFPraQrUiu15Q_2TR09SO4YaNd_r7D4eiYzoTygvA9g-9OLEZjNQIWcwDC9NsHnfi1ZDBrvBfCMBpSHWExUC8Qxxc24pkf2LwycLbS746OwGMz3NO6ObxxkNfb3PdLQXhUbeinULw",
    "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
    "dpaData": {
        "dpaPresentationName": "Name"
    },
    "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
    "dpaTransactionOptions": {
        "transactionAmount": {
            "transactionAmount": "100.00",
            "transactionCurrencyCode": "USD"
        },
        "transactionType": "PURCHASE",
        "dpaBillingPreference": "FULL",
        "dpaShippingPreference": "FULL",
        "customInputData": {
            "com.mastercard.dcfExperience": "WITHIN_CHECKOUT"
        },
        "consumerNationalIdentifierRequested": false,
        "dpaAcceptedBillingCountries": [],
        "dpaAcceptedShippingCountries": [],
        "dpaLocale": "en_US",
        "consumerEmailAddressRequested": true,
        "consumerNameRequested": true,
        "consumerPhoneNumberRequested": true,
        "confirmPayment": false,
        "payloadTypeIndicatorCheckout": "PAYMENT",
        "payloadTypeIndicatorPayload": "PAYMENT",
         "paymentOptions": {
            "dpaDynamicDataTtlMinutes": 15,
            "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
        }
    }
}
```

```TA
{
    "srcCorrelationId": "a5fe8aeb-a0c4-45ce-8313-dde6bb5e6c3d",
    "srcDigitalCardId": "75fe8aeb-a0c4-45ce-8313-dde6bb5e6c4e",
    "dpaTransactionOptions": {
        "acquirerId": "545301",
        "acquirerBIN": "SRC3DS", 
        "merchantCategoryCode": "06",
        "merchantCountryCode": "US"
        "authenticationPreferences":{
            "payloadRequested": "AUTHENTICATED",
        },
        "transactionAmount": {
            "transactionAmount": "250",
            "transactionCurrencyCode": "USD"
        },   
        "threeDsInputData": {
            "billingAddress": {
               "name": "Coby Greenholt",
               "line1": "49674 Gorczany Village",
               "line2": "Hansen Circle",
               "state": "CT",
               "zip": "98410",
               "countryCode": "US"
            }  
        }
    }
}
```

> Integrator receives the `checkoutActionCode`= `COMPLETE` along with `checkoutResponse`.  
>
> Integrator shows the summary of consumer information returned in `checkoutResponse` on Order Review Screen (if applicable).
> User clicks Place Order.

```json
{
   "dcfActionCode": "COMPLETE",
   "unbindAppInstance": false,
   "checkoutResponseSignature": "eyJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpYXQiOjE2NzcwOTg1OTMsImFsZyI6IlJTMjU2IiwianRpIjoiYTdkNjMzNDctNjE2Mi00NzQ0LWIyZGMtOTQ4YzYxNWY1NjliIiwia2lkIjoiMTQ5MTI2LXNyYy1wYXlsb2FkLXZlcmlmaWNhdGlvbiJ9.eyJzcmNDb3JyZWxhdGlvbklkIjoiMzRmNGEwNGIuNTMzZmViNGUtZmU3Ni00NzU0LWEzZTUtNjU0MjE1MGE1YzRmIiwic3JjaVRyYW5zYWN0aW9uSWQiOiI1OWExMWViNS0xOWM5LTQ5ZWQtYTQ1NS1lMjk2MDJjYTUxNjciLCJtYXNrZWRDYXJkIjp7InNyY0RpZ2l0YWxDYXJkSWQiOiI3YjNkZTMwYS1iMTVlLTQ1NzgtYWI4OC1mZmE0MWQ5MTE5YmMiLCJwYW5CaW4iOiI1MTIwMzUiLCJwYW5MYXN0Rm91ciI6IjQ1NTIiLCJ0b2tlbkxhc3RGb3VyIjoiMjk0MCIsImRpZ2l0YWxDYXJkRGF0YSI6eyJzdGF0dXMiOiJBQ1RJVkUiLCJwcmVzZW50YXRpb25OYW1lIjoiVGVzdCBJc3N1ZXLDgsKuIiwiZGVzY3JpcHRvck5hbWUiOiJtYXN0ZXJjYXJkIiwiYXJ0VXJpIjoiaHR0cHM6Ly9zYnguYXNzZXRzLm1hc3RlcmNhcmQuY29tL2NhcmQtYXJ0L2NvbWJpbmVkLWltYWdlLWFzc2V0LzVmMjFmMDhlLTA0OTAtNDYwMy1iY2QxLWFjMGJlN2VhMGVjZC5wbmciLCJpc0NvQnJhbmRlZCI6ZmFsc2V9LCJwYW5FeHBpcmF0aW9uTW9udGgiOiIxMiIsInBhbkV4cGlyYXRpb25ZZWFyIjoiMjAyNCIsInBheW1lbnRDYXJkVHlwZSI6IkNSRURJVCIsIm1hc2tlZEJpbGxpbmdBZGRyZXNzIjp7ImFkZHJlc3NJZCI6ImI5YjRmMzFiLWUwZjYtNGU2MS04ZDUwLWFhNjk2YjlkYWM2NiIsIm5hbWUiOiJkYSoqKmwgaCoqKiIsImxpbmUxIjoiMSoqIDUqKiBBKioqKioiLCJjaXR5IjoiTmV3IFlvcmsiLCJzdGF0ZSI6Ik5ZIiwiY291bnRyeUNvZGUiOiJVUyIsInppcCI6IjEwMDExIn0sImRhdGVPZkNhcmRDcmVhdGVkIjoiMjAyMi0xMS0xOFQxNjozMjoxMC4xODVaIiwiZGF0ZU9mQ2FyZExhc3RVc2VkIjoiMjAyMy0wMi0yMlQxODoxMzo1MC4yMzVaIn0sIm1hc2tlZENvbnN1bWVyIjp7InNyY0NvbnN1bWVySWQiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJtYXNrZWRDb25zdW1lcklkZW50aXR5Ijp7ImlkZW50aXR5UHJvdmlkZXIiOiJTUkMiLCJpZGVudGl0eVR5cGUiOiJFTUFJTF9BRERSRVNTIn0sIm1hc2tlZEVtYWlsQWRkcmVzcyI6ImQqKioqKjdAZ21haWwuY29tIiwibWFza2VkTW9iaWxlTnVtYmVyIjp7ImNvdW50cnlDb2RlIjoiMSIsInBob25lTnVtYmVyIjoiKCoqKikgKioqLSoyNzQifSwiY291bnRyeUNvZGUiOiJVUyIsImxhbmd1YWdlQ29kZSI6ImVuIiwic3RhdHVzIjoiQUNUSVZFIiwibWFza2VkRmlyc3ROYW1lIjoiZCoqKioqIiwibWFza2VkTGFzdE5hbWUiOiJoKioqIiwibWFza2VkRnVsbE5hbWUiOiJkKioqKiogaCoqKiIsImRhdGVDb25zdW1lckFkZGVkIjoiMjAyMC0wMS0wOVQxNjoxNDoyOS4wMDVaIiwiZGF0ZUNvbnN1bWVyTGFzdFVzZWQiOiIyMDIzLTAyLTIyVDIwOjQzOjAwLjUwMVoifSwic2hpcHBpbmdBZGRyZXNzWmlwIjoiMTAwMTEiLCJzaGlwcGluZ0NvdW50cnlDb2RlIjoiVVMifQ.qYL2RSnMReMCTEV3tam2MRvOq64hutRED8l-6KdI4l8MtM394UONKlxtCZYQT_TAv-KdVbVRZfxOjPiF_mBVXrr_V88Jy1PZ4wNvO106t5WvX3bZY3Xb6TWFPezbl7GlEiHYh556GX0EMAJEOLttdZ8n_Epo20VQgylCLPe_s-4vw2mkfHvv7KcQP4cki-7qXmfe0bjj52uWIB-s4eS7cpWPpQ8DhVUXN1BHcWMWGhIJw88iy0CRFMnY29eeqtGg-bTmWi65jtwJNz40ItfmxvcB4H8y51EpUy2BEomCrV6RXCnKxkCvz0VY_c15P1IzxEEalvD-S1ujnEvbpEmsdg",
   "checkoutResponse": {
       "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
       "srciTransactionId": "59a11eb5-19c9-49ed-a455-e29602ca5167",
       "maskedCard": {
           "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
           "panBin": "512035",
           "panLastFour": "4552",
           "tokenLastFour": "2940",
           "digitalCardData": {
               "status": "ACTIVE",
               "presentationName": "Test Issuer",
               "descriptorName": "mastercard",
               "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
               "isCoBranded": false
           },
           "panExpirationMonth": "12",
           "panExpirationYear": "2024",
           "paymentCardType": "CREDIT",
           "maskedBillingAddress": {
               "addressId": "b9b4f31b-e0f6-4e61-8d50-aa696b9dac66",
               "name": "ja***l d***",
               "line1": "1** 5** A*****",
               "city": "New York",
               "state": "NY",
               "countryCode": "US",
               "zip": "10011"
           },
           "dateOfCardCreated": "2022-11-18T16:32:10.185Z",
           "dateOfCardLastUsed": "2023-02-22T18:13:50.235Z"
       },
       "maskedConsumer": {
           "srcConsumerId": "2899b782-633a-4ee0-88d9-555bf9d7c43d",
           "maskedConsumerIdentity": {
               "identityProvider": "SRC",
               "identityType": "EMAIL_ADDRESS"
           },
           "maskedEmailAddress": "j*****7@gmail.com",
           "maskedMobileNumber": {
               "countryCode": "1",
               "phoneNumber": "(***) ***-*123"
           },
           "countryCode": "US",
           "languageCode": "en",
           "status": "ACTIVE",
           "maskedFirstName": "j*****",
           "maskedLastName": "d***",
           "maskedFullName": "j***** d***",
           "dateConsumerAdded": "2020-01-09T16:14:29.005Z",
           "dateConsumerLastUsed": "2023-02-22T20:43:00.501Z"
       },
       "shippingAddressZip": "10011",
       "shippingCountryCode": "US"
   },
   "idToken": "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MDg5NTEyLCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcwOTk0ODAsImlhdCI6MTY3NzA5ODU4MCwianRpIjoiZjFmOTJkMmUtNGZlMy00MWMyLWJhMjItNzUzMTE1NDZkNzcxIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.WK5FX_VweN0IDSii28S0SFYfCc3u4KpKvsygELlgRDuwgeRY66VW1CbojxT36vBx3fVgFq9Ipi0k67ud1mEXjK10VsfB1KThrx_kxGYtVIN_QCWKhNahkxv1099Bv8lS7Q5FAOH8NF7J2GrvnAKxnZsSpiGORWozQavWHdJRz9quDBzKaTPexZSFfGUCvWrLQf02cSKELwu_IfFPraQrUiu15Q_2TR09SO4YaNd_r7D4eiYzoTygvA9g-9OLEZjNQIWcwDC9NsHnfi1ZDBrvBfCMBpSHWExUC8Qxxc24pkf2LwycLbS746OwGMz3NO6ObxxkNfb3PdLQXhUbeinULw"
}
```

> **Step 6:**
> Integrator makes [POST transaction/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) call to retrieve payload.

```json
{
    "srcClientId": "5e0d4b84-189d-4c86-822d-590602f62062",
    "srcDpaId": "7a96bc0a-1a1e-4c62-996e-2153e3302291_systemtest",
    "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
    "srciTransactionId": "59a11eb5-19c9-49ed-a455-e29602ca5167",
    "payloadTypeIndicatorCheckout": "PAYMENT",
    "payloadTypeIndicatorPayload": "PAYMENT",
    "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
    "dpaTransactionOptions": {
        "transactionAmount": {
            "transactionAmount": 100,
            "transactionCurrencyCode": "USD"
        },
        "transactionType": "PURCHASE",
        "dpaBillingPreference": "FULL",
        "dpaAcceptedBillingCountries": [],
        "dpaShippingPreference": "FULL",
        "dpaAcceptedShippingCountries": [],
        "consumerEmailAddressRequested": true,
        "consumerNameRequested": true,
        "consumerPhoneNumberRequested": true,
        "threeDsPreference": "NONE",
        "dpaLocale": "en_US"
    }
}
```

```json
{
  "checkoutResponseJWS": "eyJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpYXQiOjE1NzA3Mzk3MzIsImFsZyI6IlJTMjU2IiwianRpIjoiMGNjODlkYTctMGZlNi00NDU1LWJjYWItZjU4Nzk0ZDY2NWY1Iiwia2lkIjoiMTQ5MDIzLXN0Zy1zcmMtcGF5bG9hZC12ZXJpZmljYXRpb24ifQ.eyJzcmNDb3JyZWxhdGlvbklkIjoiMzRmNGEwNGIuZmJhOTI2M2MtNzVmMS00YjgyLWIzOWItYjI5N2UzY2VlMDI3Iiwic3JjaVRyYW5zYWN0aW9uSWQiOiI1MjZlMWQzMS0xZmViLTQwMjYtYWJjZi1jYTZjZTg1ZWU5Y2IiLCJlbmNyeXB0ZWRQYXlsb2FkIjoiZXlKcmFXUWlPaUpIYjI5bmJHVlRVa00wUTB0bGVTSXNJbVZ1WXlJNklrRXhNamhIUTAwaUxDSmhiR2NpT2lKU1UwRXRUMEZGVUMweU5UWWlmUS5makdIN3BhRWZ3WHJWTDRhdm43TzJOZm9KUUFkbnBKak9nMXYxSGp3UmVVdFhERFF2MlkzZW9kMF9ZbUQ2VDlERVFreW9fTTRURlB4eXQ2SThCZXdNa3dBYVprNUpuYi1jUTVRZkdFVks5Uk94bHVzQWNWOHBGOFFrRktOM1N2dHZFM011MGMxbTNYUV9nUW96bnBYcU91QUxNRnZxNjVhYjBudzdnaGdIaGxqaXJuREZQdVRRVTFyZEJqd2ZVd2tadGtrQXVRLThHdkVFUTdhY3lNMllZX1NPZUpYZzIzX0JYa1BQY25IendERlQ2VWNGUUlNOEltaFJNMzI1NFVrcW4yREJDUWxzZlFXSGVMUVJPQV82SkotcU15OHFhVGUyRkdKemhTTXJaZEd1d1BpRkFaYmlXWFZia0M3Vi0tdzNIckxCcHN5NGhYU1dNSndsenRvUncuU1F5VDFfRXRUMnlDLU55cC5GeDBZUlByOVBncnVTWTdiMDJrMVgxS1ZaMFNtcHpqb0N5bUs1N0pmMW9Dbk5rMU84MzkxckhJVG5hTEFEc2FhZUZEaHdNTUl0NHJIelBic2RhVEJXcHpmQlNneUs0QWF3ZE13SEFZVlJnUmJNQmhlMXppYTVSTVpHYkJDTzN6c2dTRW5sZVRHSmVKYU81NlExRkFuQ3ZYblQwN293ekdPOXltc3JfZEhvWExKWVNnZGthUE5sRTZZOENOU2VJa0psTXdsU1o0YkhNckRRODNkNTdiR0dJT3Y3ZWZoZ2RqVGF3SVpsWmNKUXZhVWMyU09JYWU0MUpIellBeGhKSDZ4R3kxckhCZFR1dEV0UkhQNVdaSzVva1BLcG14Z1dPUGk4MW5KbHM3aVIzVEVKWktEMllwNTNPSENvdVZabjBZRFJqV19vR0t6UENmNnVMQ0VSb3RNZHNQXzBhSVBmSTk0LWxuM25WZnF1c1dSdGxIN253eEQ0eUF3VW1ndkVCLW5IYUFVb1RmdE9YMGUyQ2YtRWVHTjFmemZPQ1Bid2g3YWlXWmJLVnp2Tmg5clBBOXNRWUwyT1RtN1pPRmVOTXItZ01XWnZHUjZFVGl1OWwta3ZmVHdjMnpaZXRWbVFGVm5lazVKMGdhdmlZQ000WHZmNEZtVXktNTBtOVQxOWVhZnN1bXVlckJ6cDZaQ20xaTBmMmFSSVpXNGMwdXhMMXRQSlkwLVl2bFh4cEJNNERCdjJEc3h1MkxldDlpZV93c2RRd2NFTk1GWUxxbjY0ZmVWb2stUkVaeUt4V0tJR3pmWkloWkx3LTl4a0xDdEh3U2VCa2hMMC1pOVhqQXJnWEFteHVUYmhEV0NYMUFPQkFvOHJHOE0xSmJ2N2lzSk9mVENsQk5BQTFsWjlRcE9MOHViUFJOa3ZXeHhEWmFfYVVQWWt3aDZ4bFRwdXhzeXFYaTBHWnRqRi1jWkp4cVZSOExWcXN3WWo1cDdrTmpWMlpYMDRDS1ZjS0lZUjZ3dm9KUWM0T2FFV1FkSlhJb0NFZVNGVVpoaUNHZVljX1VCQ2tRcnplOHZoZUh2SmQzdFVLTHBqSzdXM2gyUHc0ZGhRNTVBUzhhMUNIMDJtNklQcU9FMVgyUmY5WEk5UUxKUzFyMXZwVE5fYjRzUnROaTUwR3MxODQ4LUxPb0U2RmJwaHdHVHZoc0pnWGxHakl2MHlucGJHRXMzX0lvVUc1dnpCZEdycHBUTEZaMjVEbXkwMzlVMG9neW4wRElia3l4S2dfbS1JVlVTdWdDckViZlFPV0swV3lscnpfYkVhZlFpUEJjMDJDeGNmQkJtcFNEUHBVVU1lZ1plRHc5eV9qbmx4X0R1ajFveU1pYzRvR1YxcEMtLUl5YVRGMWt6Z1hwUnlyUmd6NHlCVWFORlU4S0JVUmJ3cmJVd2hwX3BUSll1Q0lrTW53M1hqSEh0RHFEa1h1YWNLRWpVNGhvdjgzV1B4TnBiclV1VXUtVjZJSEY3b2R2MDE2R3pPbDVTVkxiNHNvN09MNzhWNDBjVWNQNVZJQnMzdzlyS0VnRVBBeFNVOHdzWjQxYkNGLVBDc2JMQTBmRE8zaUItOXh2bXpfNWJYUWdnLW5fLXcxVjV5NHd2ZnJNOTY5dk55VnJHX3NFeGtoNVN0QWp4Y2prN24yREZDVWM3UEFjU3hMYnVsbFVmdmFqZmI4Nm5FS0JnTjJtTGVCcjNtNnAyVlZGZ2c3bVlpS3BZY1dROHNHRG1Nei1lUlBITEl6TmFTZ1M0aC1fRVF5VnVWdWNUZklpTWJ5RGtfbXRJZG9rV1NXdmJqNjItMm5vd3VTVVE0RWtHbDYzSnlPODZWY21EbHJ1WFNWMmdydmpNZi1HVmY5WW9nakNPMURDb3JjcExTTk1DUUVUS251TEIyeWVIRkF3eldjSHlYN2hmeWVTcEx4X0l0WFItV3U5YlR0NmZidWNJSzk1dzVQNFZ6VTMwcUUxZExZdE41RWMuVDVZSHhTclU1RGpLYjNNY00xT2YwQSIsIm1hc2tlZENhcmQiOnsic3JjRGlnaXRhbENhcmRJZCI6ImJiN2I2ZjBiLWNmZDYtNGY0Yy1hNmIyLTdiYWNmM2RmZTcwYiIsInBhbkJpbiI6IjU0NTUwMyIsInBhbkxhc3RGb3VyIjoiNzQxNiIsImRpZ2l0YWxDYXJkRGF0YSI6eyJzdGF0dXMiOiJBQ1RJVkUiLCJwcmVzZW50YXRpb25OYW1lIjoiQ2l0aSBCYW5rIiwiZGVzY3JpcHRvck5hbWUiOiJtYXN0ZXJjYXJkIiwiYXJ0VXJpIjoiaHR0cHM6Ly9zdGFnZS5hc3NldHMubWFzdGVyY2FyZC5jb20vY2FyZC1hcnQvY29tYmluZWQtaW1hZ2UtYXNzZXQvOWQ0MmRmNTQtYzVmZC00MzhiLWE4ODYtZmYwYmQxZThmN2VjLnBuZyJ9LCJwYW5FeHBpcmF0aW9uTW9udGgiOiIwOCIsInBhbkV4cGlyYXRpb25ZZWFyIjoiMjAyMyIsIm1hc2tlZEJpbGxpbmdBZGRyZXNzIjp7ImFkZHJlc3NJZCI6ImI5MGVjYjM4LTg5N2QtNGY5NS1hYjQzLTE1NTY1ODkxOGE5NiIsIm5hbWUiOiJKKioqIEQqKiIsImxpbmUxIjoiMSoqIDUqKiBBKioqKioiLCJsaW5lMiI6IkYqKioqIDEqIiwiY2l0eSI6Ik5ldyBZb3JrIENpdHkiLCJzdGF0ZSI6Ik5ZIiwiY291bnRyeUNvZGUiOiJVUyIsInppcCI6IjEwMDExIiwiY3JlYXRlVGltZSI6IjIwMTktMTAtMTBUMjA6MzU6MTMuNTI2WiJ9LCJkY2YiOnsiYXBwbGljYXRpb25UeXBlIjoiV0VCX0JST1dTRVIiLCJ1cmkiOiJodHRwczovL3N0YWdlLnNyYy5tYXN0ZXJjYXJkLmNvbS9wYXkvIiwibG9nb1VyaSI6Imh0dHA6Ly9tYXN0ZXJjYXJkLmNvbS8iLCJuYW1lIjoibWFzdGVyY2FyZCJ9LCJkYXRlT2ZDYXJkQ3JlYXRlZCI6IjIwMTktMTAtMTBUMjA6MzU6MDMuODk1WiJ9LCJtYXNrZWRDb25zdW1lciI6eyJzcmNDb25zdW1lcklkIjoiODc2NjlkNTEtN2JlNC00MTk5LTkzMGItOTJjNjJhODk0ZmVjIiwibWFza2VkQ29uc3VtZXJJZGVudGl0eSI6eyJpZGVudGl0eVByb3ZpZGVyIjoiU1JDIiwiaWRlbnRpdHlUeXBlIjoiRU1BSUxfQUREUkVTUyIsIm1hc2tlZElkZW50aXR5VmFsdWUiOiJqKioqKio3QGR1bW15ZW1haWwuY29tIn0sIm1hc2tlZEVtYWlsQWRkcmVzcyI6ImoqKioqKjdAZHVtbXllbWFpbC5jb20iLCJtYXNrZWRNb2JpbGVOdW1iZXIiOnsiY291bnRyeUNvZGUiOiIxIiwicGhvbmVOdW1iZXIiOiIoKioqKSAqKiotKjg5NSJ9LCJtYXNrZWROYXRpb25hbElkZW50aWZpZXIiOiIqKioqKioqKioiLCJjb3VudHJ5Q29kZSI6IlVTIiwibGFuZ3VhZ2VDb2RlIjoiRU4iLCJtYXNrZWRGaXJzdE5hbWUiOiJqKioqIiwibWFza2VkTGFzdE5hbWUiOiJkKioiLCJtYXNrZWRGdWxsTmFtZSI6ImoqKiogZCoqIiwiZGF0ZUNvbnN1bWVyQWRkZWQiOiIyMDE5LTEwLTEwVDIwOjM0OjU3LjUzMloifSwic2hpcHBpbmdBZGRyZXNzWmlwIjoiMTAwMTEiLCJzaGlwcGluZ0NvdW50cnlDb2RlIjoiVVMifQ.JBqO5Y4HSNAwL6o6_-al7burrIU-5H6x-UxtK8jFxSQ5EsvDoGOEjRSxBu9dlHStodMQ2FndZhV29dCKVcw1cpmDVuFUevDFcnsD4oIwYLM-VgLocx_jF749RAI-4FyGXZoSPcZaOpI2N3thWU9S2XD2-sfxFnDfitUul0have4-mQWEVBm0h6PF8DVmjJMklk6rY4efP18RNTt73GFyP_g86TU5FxHhogXsWrBsQVXX8REh2wDfVNQPllhCmFElkjeUUmylgkbhioPddh3JtR2eLurZ4Ttuevvxk0fjeJtgNfkgXjk9zdpxRyjlf_jArjbU9dtE9dZT5Spx45hfSQ"
}
```

> **Step 7:**
> Mastercard system responds back with the payload.   
>
> If the Integrator opts for **Transaction Authentication (TA)** during the checkout method, they receive authenticated payload.
> Integrator decrypts the Payload and processes the transaction.
* BAU
* TA

```BAU
{
    "payload": {
        "token": {
            "paymentToken": "************2940",
            "tokenExpirationMonth": "12",
            "tokenExpirationYear": "2025",
            "paymentAccountReference": "50011BEGA4H9ZWM5GNZGI1GX9H8QH"
        },
        "shippingAddress": {
            "addressId": "0919bced-6b36-440e-b09f-9d368a0c2eea",
            "name": "daniel hand",
            "line1": "114 5th Avenue",
            "city": "New York",
            "state": "NY",
            "countryCode": "US",
            "zip": "10011",
            "createTime": "2022-11-22T18:05:55.230Z",
            "lastUsedTime": "2023-02-22T15:42:27.191Z"
        },
        "consumerEmailAddress": "dchand1987@gmail.com",
        "consumerFirstName": "daniel",
        "consumerLastName": "hand",
        "consumerFullName": "daniel hand",
        "consumerMobileNumber": {
            "countryCode": "1",
            "phoneNumber": "9084039274"
        },
        "srcTokenResultsData": {
            "unpredictableNumber": "82ccb506"
        },
        "dynamicData": {
            "dynamicDataValue": "9F26083CD5A44BBBE0536F9F2701809F10120314A500000000000000001D8E5219ED00FF9F370482CCB5069F36020003950500000000009A030000009C01009F02060000000100005F2A020840820212809F1A020000",
            "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
        },
        "billingAddress": {
            "addressId": "b9b4f31b-e0f6-4e61-8d50-aa696b9dac66",
            "name": "daniel hand",
            "line1": "114 5th Avenue",
            "city": "New York",
            "state": "NY",
            "countryCode": "US",
            "zip": "10011",
            "createTime": "2022-11-18T16:33:07.296Z"
        }
    },
    "assuranceData": {
        "cardVerificationEntity": "02",
        "cardVerificationMethod": "03",
        "cardVerificationResults": "01"
    },
    "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
    "srciTransactionId": "59a11eb5-19c9-49ed-a455-e29602ca5167",
    "maskedCard": {
        "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
        "panBin": "512035",
        "panLastFour": "4552",
        "tokenBinRange": "222203",
        "tokenLastFour": "2940",
        "digitalCardData": {
            "status": "ACTIVE",
            "presentationName": "Test IssuerÂ®",
            "descriptorName": "mastercard",
            "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
            "isCoBranded": false
        },
        "panExpirationMonth": "12",
        "panExpirationYear": "2024",
        "paymentCardType": "CREDIT",
        "maskedBillingAddress": {
            "addressId": "b9b4f31b-e0f6-4e61-8d50-aa696b9dac66",
            "name": "da***l h***",
            "line1": "1** 5** A*****",
            "city": "New York",
            "state": "NY",
            "countryCode": "US",
            "zip": "10011",
            "createTime": "2022-11-18T16:33:07.296Z"
        },
        "serviceId": "SRC",
        "dateOfCardCreated": "2022-11-18T16:32:10.185Z",
        "dateOfCardLastUsed": "2023-02-22T18:13:50.235Z"
    },
    "maskedConsumer": {
        "srcConsumerId": "2899b782-633a-4ee0-88d9-555bf9d7c43d",
        "maskedConsumerIdentity": {
            "identityProvider": "SRC",
            "identityType": "EMAIL_ADDRESS",
            "maskedIdentityValue": "d*****7@gmail.com"
        },
        "maskedEmailAddress": "d*****7@gmail.com",
        "maskedMobileNumber": {
            "countryCode": "1",
            "phoneNumber": "(***) ***-*274"
        },
        "countryCode": "US",
        "languageCode": "en",
        "status": "ACTIVE",
        "maskedFirstName": "d*****",
        "maskedLastName": "h***",
        "maskedFullName": "d***** h***",
        "dateConsumerAdded": "2020-01-09T16:14:29.005Z",
        "dateConsumerLastUsed": "2023-02-22T20:43:00.501Z"
    },
    "shippingAddressZip": "10011",
    "shippingCountryCode": "US",
    "customOutputData": {
        "authorizations": [
            {
                "type": "CROSS_PROGRAM_CARD_ENROLLMENT_TOKEN",
                "authorization": "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuY3BlY190b2tlbiIsImFsZyI6IlJTMjU2In0.eyJhdWQiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzY29wZURhdGEiOiJ7XCJzcmNDbGllbnRJZFwiOlwiNWUwZDRiODQtMTg5ZC00Yzg2LTgyMmQtNTkwNjAyZjYyMDYyXCIsXCJzcmNEaWdpdGFsQ2FyZElkXCI6XCI3YjNkZTMwYS1iMTVlLTQ1NzgtYWI4OC1mZmE0MWQ5MTE5YmNcIixcInNyY1Byb2dyYW1JZFwiOlwiU1JDXCIsXCJzcmNDb3JyZWxhdGlvbklkXCI6XCIzNGY0YTA0Yi41MzNmZWI0ZS1mZTc2LTQ3NTQtYTNlNS02NTQyMTUwYTVjNGZcIn0iLCJzY29wZXMiOlsiQ1JPU1NfUFJPR1JBTV9FTlJPTExNRU5UX0NBUkRfVE9LRU4iXSwiZXhwIjoxNjgwOTg2NTkzLCJpYXQiOjE2NzcwOTg1OTMsImp0aSI6ImNjMzkwOGI4LTY4M2MtNDdlNS04ZTZhLTk2NDlhYTRjYjQ1NSJ9.fz7R9kO4X6eg6tQl3GDG7KLxq5bnDgltXFcyyDeRYYltre87FIcOrqdBVIR7twkXghWnccBLYKdeYfLgdSXuSkAPz5L6KauO-M47CHr0KqEtMu-obaxl3DKvAUedibGVwUlq3PDep6s0cHk99FspwafokF3BKhh6b-Cxu06Z6lLj6EH3PiRO2zO-nMnS67a0JcSrEPp4pc1t4-gFGYRA7bfwvn9lTEcT29oMEBWsN2BmxG8beHvIp6RwJuR0atELC1C02vyE6OhPp6YzAywW-cPX3a93gNq1UFFdqfV-faYSKbuO0ww3tEi8GQfg5K1RDENPT2VqYoAvXT6vl-XBSQ"
            }
        ]
    }
}
```

```TA
{
    "merchantTransactionId": "0a4e0d3.34f4a04b.e005240277106f93218a2dedc71450b2cc9f4801",
    "encryptedPayload": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.iVZZl1ZwQT09FsXlQFBeHcdm3WwiFoNO4UPyyMcoTWFS0ew2zFf_Mdmvs1ZASLomchFC1IiL-pR83svuA-DTnzGWatHtvO9d2NmJq5tT4qqbEPY_AM_4P79XHZ2bUjH9YoS84gbYQqEBXiMQiy0Up63myQFTut63RMbkMgMbRCAEOXh7re3z6OQo4aqzJHmaGMSuHG9DtBUXPfjqwmP8SWmKwX6mAqbOmYgLk-DFBOniTQrXp6qFOttengoj0ys--HZH2TWCFpw6Po0M9KpBy7-tuMjFD47K0FsXJTfazT1sUuE-noe3NdEaSOpdNznn2OmGmFQkpKZpNroKwHzkSA.oxavbMpPY-Yroi9yFIPm1w.hYN4KxadpHbDS_Xb5w0rbcyP_gIPGgM0jP5GW57vIyw9eh7LUNwniji40bTbezGtZsaxuCjJeVucG_I-CPdNxlGNuR5HCFWaWZUI_ipHQwLWTqxfD2cUbbYRbOi3-kvpg3MOK9LInAp-_vaSuxA8ZgxkZRJi4PSYAHQE1T07_Nzv2-TTLTRMy184cFH-zSY39Ml5UlToC49hONvqHH3zsRsYCcoGmwGwpvNnt_7d8TFlRBjIctRKzNxz3MSauBU_l3OuD8JwtaZfUcj4NMhaa1ZcK3r5zfn63K_LWiLEJLo7AMJvbDGJW80fppWsMlGLcc5BVXq2tO2Wdb4Vr2Wu1uwTN5wFMJb9M7QNqSYZ4jJNPpTHbHzIy6UVbvAxmH50RKuazVGIB6aUuJ1B1A87yqa0NeyecFIjPctCyXDb_tzlagfpA7PiHGN-rhfRhKWIn_JpDwoXv72IJM3jVr8U9vWzUM3pE8yrWD4pAen5T4g_EgDfsWPIrTJugN10uJPoyWXdhUPkWESqfVf_GrEe1ShI7AJ8hA1RgdU87X9Aqu0op2lJKoYb83HX-Nd9KF3VmwMBmD7oM3zuaAyWcBQd8yOSx1bkA52CcupizuCODSS2WTWG2IeRx-a3kCXRxBz7.KRVMRNt_uybn4krrXl60Qg",
    "correlationId": "64abb44f-cb10-492e-a321-dd89f34cb259",
    "assuranceData": {
        "verificationData": [
            {
                "verificationType": "CARDHOLDER",
                "verificationEntity": "02",
                "verificationMethod": "07",
                "verificationResults": "01",
                "verificationTimestamp": "1709586931874",
                "verificationEvents": [
                    "01"
                ]
            }
        ],
        "threeDsOutputData": {
            "dsTransID": "7dd640ac-1a35-4c60-5204-243750338567"
        },
        "eci": "02"
    },
    "maskedCard": {
        "srcDigitalCardId": "ga4LnQnrQduNbe1GTVSaUw000000000000GB",
        "panBin": "520424",
        "panLastFour": "9901",
        "digitalCardData": {
            "descriptorName": "Bank Rewards Mastercard",
            "artUri": "https://stage.assets.mastercard.com/card-art/combined-image-asset/HIGH-MASK-3x.png",
            "coBrandName": "Co brand partner",
            "isCoBranded": true
        },
        "panExpirationMonth": "08",
        "panExpirationYear": "2029",
        "maskedCardholderFullName": "J*** D**",
        "maskedCardholderFirstName": "J***",
        "maskedCardholderLastName": "D**",
        "paymentCardDescriptor": "mastercard",
        "paymentCardType": "DEBIT",
        "digitalCardFeatures": []
    },
    "maskedConsumer": {
        "maskedEmailAddress": "0*****0@mailinator.com",
        "maskedMobileNumber": {
            "countryCode": "1",
            "phoneNumber": "(***) ***-*556"
        }
    }
}
```

## Scenario 3 {#scenario-3}

**Assumptions**

* User has a Click to Pay profile with one or more enrolled cards and [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) returns `true`.
* No Click to Pay cookies are dropped in the browser from any network, [isRecognized()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md) call returns `false`.
* A payment passkey exists for the current device and specified user identity.
* Integrator calls authenticate in Mastercard-hosted mode with merchant providing the iframe reference.

<br />

**When**   
> On Integrator website, user selects Checkout with 'Click to Pay'.
> Integrator displays contact information form for user to enter an email address or mobile number and calls the [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) method with `returnValidationChannels` set to `true`.

```Javascript
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

**Then**
> **Step 1:**
> Mastercard System returns response of [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) as `true` and provides a list of supported validation channels. Supported channels include `FIDO2`, indicating a passkey is available on the user's device.

```JavaScript
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
        "maskedValidationChannel": "",
        "identityType": "FIDO2" 
    }, 
  ]
}
```

> **Step 2:**
> Integrator calls [authenticate()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/index.md) method that contains the `authenticationMethodType` of `MANAGED_AUTHENTICATION` in the `authenticationMethod` field and the `windowRef` paramater with an iframe reference to host the authentication UI.

```javascript

authenticate ({
 "srciTransactionId" : "a5899431-5364-4682-be3d-aba123465a1b",
 "authenticationMethod": {
   "authenticationMethodType": ["MANAGED_AUTHENTICATION"],
   "authenticationSubject": " CONSUMER",
 },
 "accountReference": {
   "consumerIdentity": {
   "identityProvider": 'SRC'
   "identityType": 'MOBILE_PHONE_NUMBER' | 'EMAIL_ADDRESS'
   "identityValue": string 
 },
 "authenticationContext": {
   "authenticationReasons":["CONSUMER_IDENTITY_VALIDATION"],
   "srcDpaId" :"2971e7de-8de8-4e4a-85ef-4ad0bd9629f0"
 },
 "windowRef": [iframe object],
 "requestRecognition" : "true"
})
```

> **Step 3:**
> User validates their identity using the passkey on their device.
> On successful authentication, Mastercard system responds with confirmation the authentication status is `COMPLETE` and provides an `idToken` to the Integrator.

```json

{
  "authenticationStatus": "COMPLETE",
  "authenticationResult": "AUTHENTICATED",
  "assuranceData": {
    "verificationData": [{
      "verificationType": "CONSUMER",
      "verificationEntity": "02",
      "verificationMethod": "12",
      "verificationResults": "01",
      "verificationTimestamp": "2023-02-13T14:18:40.968Z",
      "additionalData": "eyJraWQiOiIxNDkwM... " // idToken
    }]
  },
  "authenticationSessionId" : "slkj456-tyrltkj456-45dtr5-44543m",
  "srciTransactionId" : "a5899431-5364-4682-be3d-aba123465a1b",
  "recognitionToken": "eyJraWQiOiIyMDIzMD.... ",
  "idToken": "eyJraWQiOiIxNTEwOTMtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2ZTZlOWM4Yi02ODgwLTRhYTktOTMyOS04Zjc5YjdkNGU4NTUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImFtciI6WyJzbXNfb3RwIl0sImlzcyI6Imh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsInNyY19lbWFpbF9tYXNrIjoiZCoqKioqN0BnbWFpbC5jb20iLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOnRydWUsInNyY19waG9uZV9udW1iZXJfbWFzayI6IigqKiopICoqKi0qMjc0IiwiYXVkIjpbImh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsImh0dHBzOlwvXC93d3cudmlzYS5jb20iLCJodHRwczpcL1wvYW1lcmljYW5leHByZXNzLmNvbSIsImh0dHBzOlwvXC9zcmMuZGlzY292ZXIuY29tIl0sImF1dGhfdGltZSI6MTY3NzA5OTM1NSwicGhvbmVfbnVtYmVyIjoiXC9ENFdnb1MwVmloTno2MjN6eVN5ekFQamtaMGVlUTRMcmxrYW1ZVDk4S3c9IiwiZXhwIjoxNjc3MTAwMjU1LCJpYXQiOjE2NzcwOTkzNTUsImp0aSI6ImMzZDA5NDRkLWU5NzYtNGE4MC1iNmU0LWI0YzcwOTc2ZDkwOSIsImVtYWlsIjoiemZcL05UVis0OWhGV2lTRTFtaG1LQk9yWjFObmhBR3gxYTFuaDFJME0xbHM9In0.qwUJXABzc0UBa4fXoOv1dX9PUqeiP5yqdMulhYoQvpfiiVRVH_yuh3Kt2CkbP611D1SCXjG4f0y3BsZSoL7yXcd1wPazWszNU53mSO37BlF4PhCOwLUzPts5pxpXOM4qaUaUb3ZsC0T2-3Q37Zttuiad0VBlwsb4Ziq6vvxgAq35Fvf8OyQTvhqYbI2sO7gL5GttO1eRBTIhZANSQ_K83n2lKtplFjxWIhy-LTrB-4KV_r5cHZwYf3kwKJTUxf3NPqiDSK1l2OWtrYiOgO7KNao_Zro6rJqZPo4yruyy9g0o1BUcoDCi4faA3hmAW1sveZLUdDoq84uJ-fZtFjyeow"
}
```

> **Step 4:**
> Integrator retrieves the card details from profile by calling the [getSrcProfile()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/get-src-profile/index.md) and displays the cards to the user.
> User selects one of the cards from the card list.

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

> **Step 5:** Integrator calls the [checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) method, which loads the DCF.
> Integrator can also request for **Transaction Authentication (TA)** while calling the checkout method.
> User confirms the payment information on the DCF.
* BAU
* TA

```BAU
{
    "idToken": "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MDg5NTEyLCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcwOTk0ODAsImlhdCI6MTY3NzA5ODU4MCwianRpIjoiZjFmOTJkMmUtNGZlMy00MWMyLWJhMjItNzUzMTE1NDZkNzcxIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.WK5FX_VweN0IDSii28S0SFYfCc3u4KpKvsygELlgRDuwgeRY66VW1CbojxT36vBx3fVgFq9Ipi0k67ud1mEXjK10VsfB1KThrx_kxGYtVIN_QCWKhNahkxv1099Bv8lS7Q5FAOH8NF7J2GrvnAKxnZsSpiGORWozQavWHdJRz9quDBzKaTPexZSFfGUCvWrLQf02cSKELwu_IfFPraQrUiu15Q_2TR09SO4YaNd_r7D4eiYzoTygvA9g-9OLEZjNQIWcwDC9NsHnfi1ZDBrvBfCMBpSHWExUC8Qxxc24pkf2LwycLbS746OwGMz3NO6ObxxkNfb3PdLQXhUbeinULw",
    "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
    "dpaData": {
        "dpaPresentationName": "Name"
    },
    "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
    "dpaTransactionOptions": {
        "transactionAmount": {
            "transactionAmount": "100.00",
            "transactionCurrencyCode": "USD"
        },
        "transactionType": "PURCHASE",
        "dpaBillingPreference": "FULL",
        "dpaShippingPreference": "FULL",
        "customInputData": {
            "com.mastercard.dcfExperience": "WITHIN_CHECKOUT"
        },
        "consumerNationalIdentifierRequested": false,
        "dpaAcceptedBillingCountries": [],
        "dpaAcceptedShippingCountries": [],
        "dpaLocale": "en_US",
        "consumerEmailAddressRequested": true,
        "consumerNameRequested": true,
        "consumerPhoneNumberRequested": true,
        "confirmPayment": false,
        "payloadTypeIndicatorCheckout": "PAYMENT",
        "payloadTypeIndicatorPayload": "PAYMENT",
         "paymentOptions": {
            "dpaDynamicDataTtlMinutes": 15,
            "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
        }
    }
}
```

```TA
{
    "srcCorrelationId": "a5fe8aeb-a0c4-45ce-8313-dde6bb5e6c3d",
    "srcDigitalCardId": "75fe8aeb-a0c4-45ce-8313-dde6bb5e6c4e",
    "dpaTransactionOptions": {
        "acquirerId": "545301",
        "acquirerBIN": "SRC3DS", 
        "merchantCategoryCode": "06",
        "merchantCountryCode": "US"
        "authenticationPreferences":{
            "payloadRequested": "AUTHENTICATED",
        },
        "transactionAmount": {
            "transactionAmount": "250",
            "transactionCurrencyCode": "USD"
        },   
        "threeDsInputData": {
            "billingAddress": {
               "name": "Coby Greenholt",
               "line1": "49674 Gorczany Village",
               "line2": "Hansen Circle",
               "state": "CT",
               "zip": "98410",
               "countryCode": "US"
            }  
        }
    }
}
```

> Integrator receives the `checkoutActionCode`= `COMPLETE` along with `checkoutResponse`.  
>
> Integrator shows the summary of consumer information returned in `checkoutResponse` on Order Review Screen (if applicable).
> User clicks Place Order.

```json
{
   "dcfActionCode": "COMPLETE",
   "unbindAppInstance": false,
   "checkoutResponseSignature": "eyJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpYXQiOjE2NzcwOTg1OTMsImFsZyI6IlJTMjU2IiwianRpIjoiYTdkNjMzNDctNjE2Mi00NzQ0LWIyZGMtOTQ4YzYxNWY1NjliIiwia2lkIjoiMTQ5MTI2LXNyYy1wYXlsb2FkLXZlcmlmaWNhdGlvbiJ9.eyJzcmNDb3JyZWxhdGlvbklkIjoiMzRmNGEwNGIuNTMzZmViNGUtZmU3Ni00NzU0LWEzZTUtNjU0MjE1MGE1YzRmIiwic3JjaVRyYW5zYWN0aW9uSWQiOiI1OWExMWViNS0xOWM5LTQ5ZWQtYTQ1NS1lMjk2MDJjYTUxNjciLCJtYXNrZWRDYXJkIjp7InNyY0RpZ2l0YWxDYXJkSWQiOiI3YjNkZTMwYS1iMTVlLTQ1NzgtYWI4OC1mZmE0MWQ5MTE5YmMiLCJwYW5CaW4iOiI1MTIwMzUiLCJwYW5MYXN0Rm91ciI6IjQ1NTIiLCJ0b2tlbkxhc3RGb3VyIjoiMjk0MCIsImRpZ2l0YWxDYXJkRGF0YSI6eyJzdGF0dXMiOiJBQ1RJVkUiLCJwcmVzZW50YXRpb25OYW1lIjoiVGVzdCBJc3N1ZXLDgsKuIiwiZGVzY3JpcHRvck5hbWUiOiJtYXN0ZXJjYXJkIiwiYXJ0VXJpIjoiaHR0cHM6Ly9zYnguYXNzZXRzLm1hc3RlcmNhcmQuY29tL2NhcmQtYXJ0L2NvbWJpbmVkLWltYWdlLWFzc2V0LzVmMjFmMDhlLTA0OTAtNDYwMy1iY2QxLWFjMGJlN2VhMGVjZC5wbmciLCJpc0NvQnJhbmRlZCI6ZmFsc2V9LCJwYW5FeHBpcmF0aW9uTW9udGgiOiIxMiIsInBhbkV4cGlyYXRpb25ZZWFyIjoiMjAyNCIsInBheW1lbnRDYXJkVHlwZSI6IkNSRURJVCIsIm1hc2tlZEJpbGxpbmdBZGRyZXNzIjp7ImFkZHJlc3NJZCI6ImI5YjRmMzFiLWUwZjYtNGU2MS04ZDUwLWFhNjk2YjlkYWM2NiIsIm5hbWUiOiJkYSoqKmwgaCoqKiIsImxpbmUxIjoiMSoqIDUqKiBBKioqKioiLCJjaXR5IjoiTmV3IFlvcmsiLCJzdGF0ZSI6Ik5ZIiwiY291bnRyeUNvZGUiOiJVUyIsInppcCI6IjEwMDExIn0sImRhdGVPZkNhcmRDcmVhdGVkIjoiMjAyMi0xMS0xOFQxNjozMjoxMC4xODVaIiwiZGF0ZU9mQ2FyZExhc3RVc2VkIjoiMjAyMy0wMi0yMlQxODoxMzo1MC4yMzVaIn0sIm1hc2tlZENvbnN1bWVyIjp7InNyY0NvbnN1bWVySWQiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJtYXNrZWRDb25zdW1lcklkZW50aXR5Ijp7ImlkZW50aXR5UHJvdmlkZXIiOiJTUkMiLCJpZGVudGl0eVR5cGUiOiJFTUFJTF9BRERSRVNTIn0sIm1hc2tlZEVtYWlsQWRkcmVzcyI6ImQqKioqKjdAZ21haWwuY29tIiwibWFza2VkTW9iaWxlTnVtYmVyIjp7ImNvdW50cnlDb2RlIjoiMSIsInBob25lTnVtYmVyIjoiKCoqKikgKioqLSoyNzQifSwiY291bnRyeUNvZGUiOiJVUyIsImxhbmd1YWdlQ29kZSI6ImVuIiwic3RhdHVzIjoiQUNUSVZFIiwibWFza2VkRmlyc3ROYW1lIjoiZCoqKioqIiwibWFza2VkTGFzdE5hbWUiOiJoKioqIiwibWFza2VkRnVsbE5hbWUiOiJkKioqKiogaCoqKiIsImRhdGVDb25zdW1lckFkZGVkIjoiMjAyMC0wMS0wOVQxNjoxNDoyOS4wMDVaIiwiZGF0ZUNvbnN1bWVyTGFzdFVzZWQiOiIyMDIzLTAyLTIyVDIwOjQzOjAwLjUwMVoifSwic2hpcHBpbmdBZGRyZXNzWmlwIjoiMTAwMTEiLCJzaGlwcGluZ0NvdW50cnlDb2RlIjoiVVMifQ.qYL2RSnMReMCTEV3tam2MRvOq64hutRED8l-6KdI4l8MtM394UONKlxtCZYQT_TAv-KdVbVRZfxOjPiF_mBVXrr_V88Jy1PZ4wNvO106t5WvX3bZY3Xb6TWFPezbl7GlEiHYh556GX0EMAJEOLttdZ8n_Epo20VQgylCLPe_s-4vw2mkfHvv7KcQP4cki-7qXmfe0bjj52uWIB-s4eS7cpWPpQ8DhVUXN1BHcWMWGhIJw88iy0CRFMnY29eeqtGg-bTmWi65jtwJNz40ItfmxvcB4H8y51EpUy2BEomCrV6RXCnKxkCvz0VY_c15P1IzxEEalvD-S1ujnEvbpEmsdg",
   "checkoutResponse": {
       "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
       "srciTransactionId": "59a11eb5-19c9-49ed-a455-e29602ca5167",
       "maskedCard": {
           "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
           "panBin": "512035",
           "panLastFour": "4552",
           "tokenLastFour": "2940",
           "digitalCardData": {
               "status": "ACTIVE",
               "presentationName": "Test Issuer",
               "descriptorName": "mastercard",
               "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
               "isCoBranded": false
           },
           "panExpirationMonth": "12",
           "panExpirationYear": "2024",
           "paymentCardType": "CREDIT",
           "maskedBillingAddress": {
               "addressId": "b9b4f31b-e0f6-4e61-8d50-aa696b9dac66",
               "name": "ja***l d***",
               "line1": "1** 5** A*****",
               "city": "New York",
               "state": "NY",
               "countryCode": "US",
               "zip": "10011"
           },
           "dateOfCardCreated": "2022-11-18T16:32:10.185Z",
           "dateOfCardLastUsed": "2023-02-22T18:13:50.235Z"
       },
       "maskedConsumer": {
           "srcConsumerId": "2899b782-633a-4ee0-88d9-555bf9d7c43d",
           "maskedConsumerIdentity": {
               "identityProvider": "SRC",
               "identityType": "EMAIL_ADDRESS"
           },
           "maskedEmailAddress": "j*****7@gmail.com",
           "maskedMobileNumber": {
               "countryCode": "1",
               "phoneNumber": "(***) ***-*123"
           },
           "countryCode": "US",
           "languageCode": "en",
           "status": "ACTIVE",
           "maskedFirstName": "j*****",
           "maskedLastName": "d***",
           "maskedFullName": "j***** d***",
           "dateConsumerAdded": "2020-01-09T16:14:29.005Z",
           "dateConsumerLastUsed": "2023-02-22T20:43:00.501Z"
       },
       "shippingAddressZip": "10011",
       "shippingCountryCode": "US"
   },
   "idToken": "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyODk5Yjc4Mi02MzNhLTRlZTAtODhkOS01NTViZjlkN2M0M2QiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MDg5NTEyLCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcwOTk0ODAsImlhdCI6MTY3NzA5ODU4MCwianRpIjoiZjFmOTJkMmUtNGZlMy00MWMyLWJhMjItNzUzMTE1NDZkNzcxIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.WK5FX_VweN0IDSii28S0SFYfCc3u4KpKvsygELlgRDuwgeRY66VW1CbojxT36vBx3fVgFq9Ipi0k67ud1mEXjK10VsfB1KThrx_kxGYtVIN_QCWKhNahkxv1099Bv8lS7Q5FAOH8NF7J2GrvnAKxnZsSpiGORWozQavWHdJRz9quDBzKaTPexZSFfGUCvWrLQf02cSKELwu_IfFPraQrUiu15Q_2TR09SO4YaNd_r7D4eiYzoTygvA9g-9OLEZjNQIWcwDC9NsHnfi1ZDBrvBfCMBpSHWExUC8Qxxc24pkf2LwycLbS746OwGMz3NO6ObxxkNfb3PdLQXhUbeinULw"
}
```

> **Step 6:**
> Integrator makes [POST transaction/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) call to retrieve payload.

```json
{
    "srcClientId": "5e0d4b84-189d-4c86-822d-590602f62062",
    "srcDpaId": "7a96bc0a-1a1e-4c62-996e-2153e3302291_systemtest",
    "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
    "srciTransactionId": "59a11eb5-19c9-49ed-a455-e29602ca5167",
    "payloadTypeIndicatorCheckout": "PAYMENT",
    "payloadTypeIndicatorPayload": "PAYMENT",
    "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
    "dpaTransactionOptions": {
        "transactionAmount": {
            "transactionAmount": 100,
            "transactionCurrencyCode": "USD"
        },
        "transactionType": "PURCHASE",
        "dpaBillingPreference": "FULL",
        "dpaAcceptedBillingCountries": [],
        "dpaShippingPreference": "FULL",
        "dpaAcceptedShippingCountries": [],
        "consumerEmailAddressRequested": true,
        "consumerNameRequested": true,
        "consumerPhoneNumberRequested": true,
        "threeDsPreference": "NONE",
        "dpaLocale": "en_US"
    }
}
```

```json
{
  "checkoutResponseJWS": "eyJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpYXQiOjE1NzA3Mzk3MzIsImFsZyI6IlJTMjU2IiwianRpIjoiMGNjODlkYTctMGZlNi00NDU1LWJjYWItZjU4Nzk0ZDY2NWY1Iiwia2lkIjoiMTQ5MDIzLXN0Zy1zcmMtcGF5bG9hZC12ZXJpZmljYXRpb24ifQ.eyJzcmNDb3JyZWxhdGlvbklkIjoiMzRmNGEwNGIuZmJhOTI2M2MtNzVmMS00YjgyLWIzOWItYjI5N2UzY2VlMDI3Iiwic3JjaVRyYW5zYWN0aW9uSWQiOiI1MjZlMWQzMS0xZmViLTQwMjYtYWJjZi1jYTZjZTg1ZWU5Y2IiLCJlbmNyeXB0ZWRQYXlsb2FkIjoiZXlKcmFXUWlPaUpIYjI5bmJHVlRVa00wUTB0bGVTSXNJbVZ1WXlJNklrRXhNamhIUTAwaUxDSmhiR2NpT2lKU1UwRXRUMEZGVUMweU5UWWlmUS5makdIN3BhRWZ3WHJWTDRhdm43TzJOZm9KUUFkbnBKak9nMXYxSGp3UmVVdFhERFF2MlkzZW9kMF9ZbUQ2VDlERVFreW9fTTRURlB4eXQ2SThCZXdNa3dBYVprNUpuYi1jUTVRZkdFVks5Uk94bHVzQWNWOHBGOFFrRktOM1N2dHZFM011MGMxbTNYUV9nUW96bnBYcU91QUxNRnZxNjVhYjBudzdnaGdIaGxqaXJuREZQdVRRVTFyZEJqd2ZVd2tadGtrQXVRLThHdkVFUTdhY3lNMllZX1NPZUpYZzIzX0JYa1BQY25IendERlQ2VWNGUUlNOEltaFJNMzI1NFVrcW4yREJDUWxzZlFXSGVMUVJPQV82SkotcU15OHFhVGUyRkdKemhTTXJaZEd1d1BpRkFaYmlXWFZia0M3Vi0tdzNIckxCcHN5NGhYU1dNSndsenRvUncuU1F5VDFfRXRUMnlDLU55cC5GeDBZUlByOVBncnVTWTdiMDJrMVgxS1ZaMFNtcHpqb0N5bUs1N0pmMW9Dbk5rMU84MzkxckhJVG5hTEFEc2FhZUZEaHdNTUl0NHJIelBic2RhVEJXcHpmQlNneUs0QWF3ZE13SEFZVlJnUmJNQmhlMXppYTVSTVpHYkJDTzN6c2dTRW5sZVRHSmVKYU81NlExRkFuQ3ZYblQwN293ekdPOXltc3JfZEhvWExKWVNnZGthUE5sRTZZOENOU2VJa0psTXdsU1o0YkhNckRRODNkNTdiR0dJT3Y3ZWZoZ2RqVGF3SVpsWmNKUXZhVWMyU09JYWU0MUpIellBeGhKSDZ4R3kxckhCZFR1dEV0UkhQNVdaSzVva1BLcG14Z1dPUGk4MW5KbHM3aVIzVEVKWktEMllwNTNPSENvdVZabjBZRFJqV19vR0t6UENmNnVMQ0VSb3RNZHNQXzBhSVBmSTk0LWxuM25WZnF1c1dSdGxIN253eEQ0eUF3VW1ndkVCLW5IYUFVb1RmdE9YMGUyQ2YtRWVHTjFmemZPQ1Bid2g3YWlXWmJLVnp2Tmg5clBBOXNRWUwyT1RtN1pPRmVOTXItZ01XWnZHUjZFVGl1OWwta3ZmVHdjMnpaZXRWbVFGVm5lazVKMGdhdmlZQ000WHZmNEZtVXktNTBtOVQxOWVhZnN1bXVlckJ6cDZaQ20xaTBmMmFSSVpXNGMwdXhMMXRQSlkwLVl2bFh4cEJNNERCdjJEc3h1MkxldDlpZV93c2RRd2NFTk1GWUxxbjY0ZmVWb2stUkVaeUt4V0tJR3pmWkloWkx3LTl4a0xDdEh3U2VCa2hMMC1pOVhqQXJnWEFteHVUYmhEV0NYMUFPQkFvOHJHOE0xSmJ2N2lzSk9mVENsQk5BQTFsWjlRcE9MOHViUFJOa3ZXeHhEWmFfYVVQWWt3aDZ4bFRwdXhzeXFYaTBHWnRqRi1jWkp4cVZSOExWcXN3WWo1cDdrTmpWMlpYMDRDS1ZjS0lZUjZ3dm9KUWM0T2FFV1FkSlhJb0NFZVNGVVpoaUNHZVljX1VCQ2tRcnplOHZoZUh2SmQzdFVLTHBqSzdXM2gyUHc0ZGhRNTVBUzhhMUNIMDJtNklQcU9FMVgyUmY5WEk5UUxKUzFyMXZwVE5fYjRzUnROaTUwR3MxODQ4LUxPb0U2RmJwaHdHVHZoc0pnWGxHakl2MHlucGJHRXMzX0lvVUc1dnpCZEdycHBUTEZaMjVEbXkwMzlVMG9neW4wRElia3l4S2dfbS1JVlVTdWdDckViZlFPV0swV3lscnpfYkVhZlFpUEJjMDJDeGNmQkJtcFNEUHBVVU1lZ1plRHc5eV9qbmx4X0R1ajFveU1pYzRvR1YxcEMtLUl5YVRGMWt6Z1hwUnlyUmd6NHlCVWFORlU4S0JVUmJ3cmJVd2hwX3BUSll1Q0lrTW53M1hqSEh0RHFEa1h1YWNLRWpVNGhvdjgzV1B4TnBiclV1VXUtVjZJSEY3b2R2MDE2R3pPbDVTVkxiNHNvN09MNzhWNDBjVWNQNVZJQnMzdzlyS0VnRVBBeFNVOHdzWjQxYkNGLVBDc2JMQTBmRE8zaUItOXh2bXpfNWJYUWdnLW5fLXcxVjV5NHd2ZnJNOTY5dk55VnJHX3NFeGtoNVN0QWp4Y2prN24yREZDVWM3UEFjU3hMYnVsbFVmdmFqZmI4Nm5FS0JnTjJtTGVCcjNtNnAyVlZGZ2c3bVlpS3BZY1dROHNHRG1Nei1lUlBITEl6TmFTZ1M0aC1fRVF5VnVWdWNUZklpTWJ5RGtfbXRJZG9rV1NXdmJqNjItMm5vd3VTVVE0RWtHbDYzSnlPODZWY21EbHJ1WFNWMmdydmpNZi1HVmY5WW9nakNPMURDb3JjcExTTk1DUUVUS251TEIyeWVIRkF3eldjSHlYN2hmeWVTcEx4X0l0WFItV3U5YlR0NmZidWNJSzk1dzVQNFZ6VTMwcUUxZExZdE41RWMuVDVZSHhTclU1RGpLYjNNY00xT2YwQSIsIm1hc2tlZENhcmQiOnsic3JjRGlnaXRhbENhcmRJZCI6ImJiN2I2ZjBiLWNmZDYtNGY0Yy1hNmIyLTdiYWNmM2RmZTcwYiIsInBhbkJpbiI6IjU0NTUwMyIsInBhbkxhc3RGb3VyIjoiNzQxNiIsImRpZ2l0YWxDYXJkRGF0YSI6eyJzdGF0dXMiOiJBQ1RJVkUiLCJwcmVzZW50YXRpb25OYW1lIjoiQ2l0aSBCYW5rIiwiZGVzY3JpcHRvck5hbWUiOiJtYXN0ZXJjYXJkIiwiYXJ0VXJpIjoiaHR0cHM6Ly9zdGFnZS5hc3NldHMubWFzdGVyY2FyZC5jb20vY2FyZC1hcnQvY29tYmluZWQtaW1hZ2UtYXNzZXQvOWQ0MmRmNTQtYzVmZC00MzhiLWE4ODYtZmYwYmQxZThmN2VjLnBuZyJ9LCJwYW5FeHBpcmF0aW9uTW9udGgiOiIwOCIsInBhbkV4cGlyYXRpb25ZZWFyIjoiMjAyMyIsIm1hc2tlZEJpbGxpbmdBZGRyZXNzIjp7ImFkZHJlc3NJZCI6ImI5MGVjYjM4LTg5N2QtNGY5NS1hYjQzLTE1NTY1ODkxOGE5NiIsIm5hbWUiOiJKKioqIEQqKiIsImxpbmUxIjoiMSoqIDUqKiBBKioqKioiLCJsaW5lMiI6IkYqKioqIDEqIiwiY2l0eSI6Ik5ldyBZb3JrIENpdHkiLCJzdGF0ZSI6Ik5ZIiwiY291bnRyeUNvZGUiOiJVUyIsInppcCI6IjEwMDExIiwiY3JlYXRlVGltZSI6IjIwMTktMTAtMTBUMjA6MzU6MTMuNTI2WiJ9LCJkY2YiOnsiYXBwbGljYXRpb25UeXBlIjoiV0VCX0JST1dTRVIiLCJ1cmkiOiJodHRwczovL3N0YWdlLnNyYy5tYXN0ZXJjYXJkLmNvbS9wYXkvIiwibG9nb1VyaSI6Imh0dHA6Ly9tYXN0ZXJjYXJkLmNvbS8iLCJuYW1lIjoibWFzdGVyY2FyZCJ9LCJkYXRlT2ZDYXJkQ3JlYXRlZCI6IjIwMTktMTAtMTBUMjA6MzU6MDMuODk1WiJ9LCJtYXNrZWRDb25zdW1lciI6eyJzcmNDb25zdW1lcklkIjoiODc2NjlkNTEtN2JlNC00MTk5LTkzMGItOTJjNjJhODk0ZmVjIiwibWFza2VkQ29uc3VtZXJJZGVudGl0eSI6eyJpZGVudGl0eVByb3ZpZGVyIjoiU1JDIiwiaWRlbnRpdHlUeXBlIjoiRU1BSUxfQUREUkVTUyIsIm1hc2tlZElkZW50aXR5VmFsdWUiOiJqKioqKio3QGR1bW15ZW1haWwuY29tIn0sIm1hc2tlZEVtYWlsQWRkcmVzcyI6ImoqKioqKjdAZHVtbXllbWFpbC5jb20iLCJtYXNrZWRNb2JpbGVOdW1iZXIiOnsiY291bnRyeUNvZGUiOiIxIiwicGhvbmVOdW1iZXIiOiIoKioqKSAqKiotKjg5NSJ9LCJtYXNrZWROYXRpb25hbElkZW50aWZpZXIiOiIqKioqKioqKioiLCJjb3VudHJ5Q29kZSI6IlVTIiwibGFuZ3VhZ2VDb2RlIjoiRU4iLCJtYXNrZWRGaXJzdE5hbWUiOiJqKioqIiwibWFza2VkTGFzdE5hbWUiOiJkKioiLCJtYXNrZWRGdWxsTmFtZSI6ImoqKiogZCoqIiwiZGF0ZUNvbnN1bWVyQWRkZWQiOiIyMDE5LTEwLTEwVDIwOjM0OjU3LjUzMloifSwic2hpcHBpbmdBZGRyZXNzWmlwIjoiMTAwMTEiLCJzaGlwcGluZ0NvdW50cnlDb2RlIjoiVVMifQ.JBqO5Y4HSNAwL6o6_-al7burrIU-5H6x-UxtK8jFxSQ5EsvDoGOEjRSxBu9dlHStodMQ2FndZhV29dCKVcw1cpmDVuFUevDFcnsD4oIwYLM-VgLocx_jF749RAI-4FyGXZoSPcZaOpI2N3thWU9S2XD2-sfxFnDfitUul0have4-mQWEVBm0h6PF8DVmjJMklk6rY4efP18RNTt73GFyP_g86TU5FxHhogXsWrBsQVXX8REh2wDfVNQPllhCmFElkjeUUmylgkbhioPddh3JtR2eLurZ4Ttuevvxk0fjeJtgNfkgXjk9zdpxRyjlf_jArjbU9dtE9dZT5Spx45hfSQ"
}
```

> **Step 7:**
> Mastercard system responds back with the payload.   
>
> If the Integrator opts for **Transaction Authentication (TA)** during the checkout method, they receive authenticated payload.
> Integrator decrypts the Payload and processes the transaction.
* BAU
* TA

```BAU
{
    "payload": {
        "token": {
            "paymentToken": "************2940",
            "tokenExpirationMonth": "12",
            "tokenExpirationYear": "2025",
            "paymentAccountReference": "50011BEGA4H9ZWM5GNZGI1GX9H8QH"
        },
        "shippingAddress": {
            "addressId": "0919bced-6b36-440e-b09f-9d368a0c2eea",
            "name": "daniel hand",
            "line1": "114 5th Avenue",
            "city": "New York",
            "state": "NY",
            "countryCode": "US",
            "zip": "10011",
            "createTime": "2022-11-22T18:05:55.230Z",
            "lastUsedTime": "2023-02-22T15:42:27.191Z"
        },
        "consumerEmailAddress": "dchand1987@gmail.com",
        "consumerFirstName": "daniel",
        "consumerLastName": "hand",
        "consumerFullName": "daniel hand",
        "consumerMobileNumber": {
            "countryCode": "1",
            "phoneNumber": "9084039274"
        },
        "srcTokenResultsData": {
            "unpredictableNumber": "82ccb506"
        },
        "dynamicData": {
            "dynamicDataValue": "9F26083CD5A44BBBE0536F9F2701809F10120314A500000000000000001D8E5219ED00FF9F370482CCB5069F36020003950500000000009A030000009C01009F02060000000100005F2A020840820212809F1A020000",
            "dynamicDataType": "CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM"
        },
        "billingAddress": {
            "addressId": "b9b4f31b-e0f6-4e61-8d50-aa696b9dac66",
            "name": "daniel hand",
            "line1": "114 5th Avenue",
            "city": "New York",
            "state": "NY",
            "countryCode": "US",
            "zip": "10011",
            "createTime": "2022-11-18T16:33:07.296Z"
        }
    },
    "assuranceData": {
        "cardVerificationEntity": "02",
        "cardVerificationMethod": "03",
        "cardVerificationResults": "01"
    },
    "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f",
    "srciTransactionId": "59a11eb5-19c9-49ed-a455-e29602ca5167",
    "maskedCard": {
        "srcDigitalCardId": "7b3de30a-b15e-4578-ab88-ffa41d9119bc",
        "panBin": "512035",
        "panLastFour": "4552",
        "tokenBinRange": "222203",
        "tokenLastFour": "2940",
        "digitalCardData": {
            "status": "ACTIVE",
            "presentationName": "Test IssuerÂ®",
            "descriptorName": "mastercard",
            "artUri": "https://sbx.assets.mastercard.com/card-art/combined-image-asset/5f21f08e-0490-4603-bcd1-ac0be7ea0ecd.png",
            "isCoBranded": false
        },
        "panExpirationMonth": "12",
        "panExpirationYear": "2024",
        "paymentCardType": "CREDIT",
        "maskedBillingAddress": {
            "addressId": "b9b4f31b-e0f6-4e61-8d50-aa696b9dac66",
            "name": "da***l h***",
            "line1": "1** 5** A*****",
            "city": "New York",
            "state": "NY",
            "countryCode": "US",
            "zip": "10011",
            "createTime": "2022-11-18T16:33:07.296Z"
        },
        "serviceId": "SRC",
        "dateOfCardCreated": "2022-11-18T16:32:10.185Z",
        "dateOfCardLastUsed": "2023-02-22T18:13:50.235Z"
    },
    "maskedConsumer": {
        "srcConsumerId": "2899b782-633a-4ee0-88d9-555bf9d7c43d",
        "maskedConsumerIdentity": {
            "identityProvider": "SRC",
            "identityType": "EMAIL_ADDRESS",
            "maskedIdentityValue": "d*****7@gmail.com"
        },
        "maskedEmailAddress": "d*****7@gmail.com",
        "maskedMobileNumber": {
            "countryCode": "1",
            "phoneNumber": "(***) ***-*274"
        },
        "countryCode": "US",
        "languageCode": "en",
        "status": "ACTIVE",
        "maskedFirstName": "d*****",
        "maskedLastName": "h***",
        "maskedFullName": "d***** h***",
        "dateConsumerAdded": "2020-01-09T16:14:29.005Z",
        "dateConsumerLastUsed": "2023-02-22T20:43:00.501Z"
    },
    "shippingAddressZip": "10011",
    "shippingCountryCode": "US",
    "customOutputData": {
        "authorizations": [
            {
                "type": "CROSS_PROGRAM_CARD_ENROLLMENT_TOKEN",
                "authorization": "eyJraWQiOiIxNDkxMjUtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuY3BlY190b2tlbiIsImFsZyI6IlJTMjU2In0.eyJhdWQiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzY29wZURhdGEiOiJ7XCJzcmNDbGllbnRJZFwiOlwiNWUwZDRiODQtMTg5ZC00Yzg2LTgyMmQtNTkwNjAyZjYyMDYyXCIsXCJzcmNEaWdpdGFsQ2FyZElkXCI6XCI3YjNkZTMwYS1iMTVlLTQ1NzgtYWI4OC1mZmE0MWQ5MTE5YmNcIixcInNyY1Byb2dyYW1JZFwiOlwiU1JDXCIsXCJzcmNDb3JyZWxhdGlvbklkXCI6XCIzNGY0YTA0Yi41MzNmZWI0ZS1mZTc2LTQ3NTQtYTNlNS02NTQyMTUwYTVjNGZcIn0iLCJzY29wZXMiOlsiQ1JPU1NfUFJPR1JBTV9FTlJPTExNRU5UX0NBUkRfVE9LRU4iXSwiZXhwIjoxNjgwOTg2NTkzLCJpYXQiOjE2NzcwOTg1OTMsImp0aSI6ImNjMzkwOGI4LTY4M2MtNDdlNS04ZTZhLTk2NDlhYTRjYjQ1NSJ9.fz7R9kO4X6eg6tQl3GDG7KLxq5bnDgltXFcyyDeRYYltre87FIcOrqdBVIR7twkXghWnccBLYKdeYfLgdSXuSkAPz5L6KauO-M47CHr0KqEtMu-obaxl3DKvAUedibGVwUlq3PDep6s0cHk99FspwafokF3BKhh6b-Cxu06Z6lLj6EH3PiRO2zO-nMnS67a0JcSrEPp4pc1t4-gFGYRA7bfwvn9lTEcT29oMEBWsN2BmxG8beHvIp6RwJuR0atELC1C02vyE6OhPp6YzAywW-cPX3a93gNq1UFFdqfV-faYSKbuO0ww3tEi8GQfg5K1RDENPT2VqYoAvXT6vl-XBSQ"
            }
        ]
    }
}
```

```TA
{
    "merchantTransactionId": "0a4e0d3.34f4a04b.e005240277106f93218a2dedc71450b2cc9f4801",
    "encryptedPayload": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.iVZZl1ZwQT09FsXlQFBeHcdm3WwiFoNO4UPyyMcoTWFS0ew2zFf_Mdmvs1ZASLomchFC1IiL-pR83svuA-DTnzGWatHtvO9d2NmJq5tT4qqbEPY_AM_4P79XHZ2bUjH9YoS84gbYQqEBXiMQiy0Up63myQFTut63RMbkMgMbRCAEOXh7re3z6OQo4aqzJHmaGMSuHG9DtBUXPfjqwmP8SWmKwX6mAqbOmYgLk-DFBOniTQrXp6qFOttengoj0ys--HZH2TWCFpw6Po0M9KpBy7-tuMjFD47K0FsXJTfazT1sUuE-noe3NdEaSOpdNznn2OmGmFQkpKZpNroKwHzkSA.oxavbMpPY-Yroi9yFIPm1w.hYN4KxadpHbDS_Xb5w0rbcyP_gIPGgM0jP5GW57vIyw9eh7LUNwniji40bTbezGtZsaxuCjJeVucG_I-CPdNxlGNuR5HCFWaWZUI_ipHQwLWTqxfD2cUbbYRbOi3-kvpg3MOK9LInAp-_vaSuxA8ZgxkZRJi4PSYAHQE1T07_Nzv2-TTLTRMy184cFH-zSY39Ml5UlToC49hONvqHH3zsRsYCcoGmwGwpvNnt_7d8TFlRBjIctRKzNxz3MSauBU_l3OuD8JwtaZfUcj4NMhaa1ZcK3r5zfn63K_LWiLEJLo7AMJvbDGJW80fppWsMlGLcc5BVXq2tO2Wdb4Vr2Wu1uwTN5wFMJb9M7QNqSYZ4jJNPpTHbHzIy6UVbvAxmH50RKuazVGIB6aUuJ1B1A87yqa0NeyecFIjPctCyXDb_tzlagfpA7PiHGN-rhfRhKWIn_JpDwoXv72IJM3jVr8U9vWzUM3pE8yrWD4pAen5T4g_EgDfsWPIrTJugN10uJPoyWXdhUPkWESqfVf_GrEe1ShI7AJ8hA1RgdU87X9Aqu0op2lJKoYb83HX-Nd9KF3VmwMBmD7oM3zuaAyWcBQd8yOSx1bkA52CcupizuCODSS2WTWG2IeRx-a3kCXRxBz7.KRVMRNt_uybn4krrXl60Qg",
    "correlationId": "64abb44f-cb10-492e-a321-dd89f34cb259",
    "assuranceData": {
        "verificationData": [
            {
                "verificationType": "CARDHOLDER",
                "verificationEntity": "02",
                "verificationMethod": "07",
                "verificationResults": "01",
                "verificationTimestamp": "1709586931874",
                "verificationEvents": [
                    "01"
                ]
            }
        ],
        "threeDsOutputData": {
            "dsTransID": "7dd640ac-1a35-4c60-5204-243750338567"
        },
        "eci": "02"
    },
    "maskedCard": {
        "srcDigitalCardId": "ga4LnQnrQduNbe1GTVSaUw000000000000GB",
        "panBin": "520424",
        "panLastFour": "9901",
        "digitalCardData": {
            "descriptorName": "Bank Rewards Mastercard",
            "artUri": "https://stage.assets.mastercard.com/card-art/combined-image-asset/HIGH-MASK-3x.png",
            "coBrandName": "Co brand partner",
            "isCoBranded": true
        },
        "panExpirationMonth": "08",
        "panExpirationYear": "2029",
        "maskedCardholderFullName": "J*** D**",
        "maskedCardholderFirstName": "J***",
        "maskedCardholderLastName": "D**",
        "paymentCardDescriptor": "mastercard",
        "paymentCardType": "DEBIT",
        "digitalCardFeatures": []
    },
    "maskedConsumer": {
        "maskedEmailAddress": "0*****0@mailinator.com",
        "maskedMobileNumber": {
            "countryCode": "1",
            "phoneNumber": "(***) ***-*556"
        }
    }
}
```

## Scenario 4 {#scenario-4}

**Assumptions**

* User has a Click to Pay profile with one or more enrolled cards and [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) returns `true`.
* No Click to Pay cookies are dropped in the browser from any network, [getSrcProfile()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/get-src-profile/index.md) returns with `false`.

<br />

**When**   
> On Integrator website, user selects Checkout with 'Click to Pay'.  
>
> Integrator displays contact information form for user to enter an email address or mobile number.
> User enters an email that is registered with their Click to Pay profile.  
>
> Integrator calls the [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) method.

```json
{
  "consumerIdentity":
    {
        "identityProvider": "SRC",
        "identityType": "EMAIL_ADDRESS",
        "identityValue": "jdoe@gmail.com"
    }
}
```

**Then**
> **Step 1:**
> Mastercard System returns response of [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) as `true` and sends the OTP on user's requested channel (mobile or email).

```json
{
  "consumerPresent": true,
  "lastUsedCardTimestamp": "1677085095"
}
```

> **Step 2:**
> Integrator calls [initiateIdentityValidation()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/initiate-id-validation/index.md) method, which contains the user's opted OTP channel in the `requestedValidationChannelId` field.

```json
{
 "requestedValidationChannelId": "EMAIL_ADDRESS"
}
```

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

> **Step 3:**
> Integrator displays the OTP entry screen and allows user to enter the OTP received on the requested validation channel (email address or mobile number).  
>
> On the OTP Screen, user enters the incorrect OTP.
> User repeats this three more times.   
>
> An error message displays "***Too many attempts to access your Click to Pay Profile. Please checkout as a guest.***"
> Integrator MUST redirect the user to the alternative checkout option allowing them to enter their card information and checkout as guest.

## Scenario 5 {#scenario-5}

**Assumptions**

* DPA registered with Click to Pay system and accepts Mastercard.
* Click to Pay cookies are dropped in the browser from any network, [isRecognized()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md) call returns `true`.

<br />

**When**   
> Integrator retrieves the card details from the profile (single card details) by calling [getSrcProfile()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/get-src-profile/index.md) and passing the idToken received in response of the **isRecognized()** call with Mastercard.

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

**Then**   
> **Step 1:**   
>
> Integrator makes the [checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) call with the selected masked card information. The Mastercard DCF screen loads.  
> **Step 2:**   
>
> User clicks "Not You" CTA at the bottom of the screen.
> DCF responds to the checkout method with `dcfActionCode`=`SWITCH_CONSUMER`, along with `unbindAppInstance` set to `true` and the `idToken` of the profile.  

```json
{
    "dcfActionCode": "SWITCH_CONSUMER",
    "unbindAppInstance": true,
    "idToken": "eyJraWQiOiIxNTEwOTMtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiMjMwZGRiZC1lMGRkLTQwNmQtOGVlNC03OWQ1OTI2YWM5ZGIiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MTAxNzQ5LCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcxMDI3MTEsImlhdCI6MTY3NzEwMTgxMSwianRpIjoiNjkwNzkzZDctNGJiYy00ZWE3LWE4ZjctNDhmNzM0NDg0YjIxIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.qPz5rZ5KL_1xUDXFsCqFgnZC6TSOszHg5B-izeNBgoShtWjnq2zt05qGE_uQboGWNecxJzXe514095JxDdcpGlQn4Isjbjsn1AA965q5JdQaR0OI-vADLTwzBp-kaxzVvdvKtexNoUoHJjzWbuBstUpsbg1eHSI7ZyLyAEgXq69cqDtmCbKe_0BaY8NER3oOutv_X_SfILvU9VyHf3kkNSZEK7dcvCozQvlj0O5QcwUcxY9-3ORzrARKMItIdkxVTiUQicRU0-47W62K1P2xGqWJZhqJESjH0Fb4LEl24UX4TLnR1v5Tna4h3XUpGN1U5lSzNIvnm82WdHHdjJug6A"
}
```

> **Step 3:**   
>
> Integrator calls [unbindAppInstance()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/unbind-app/index.md) method with the `idToken`.  

```json
{
   "idToken": "eyJraWQiOiIxNTEwOTMtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiMjMwZGRiZC1lMGRkLTQwNmQtOGVlNC03OWQ1OTI2YWM5ZGIiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYW1yIjpbImVtYWlsX290cCJdLCJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJzcmNfZW1haWxfbWFzayI6ImQqKioqKjdAZ21haWwuY29tIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwic3JjX3Bob25lX251bWJlcl9tYXNrIjoiKCoqKikgKioqLSoyNzQiLCJhdWQiOlsiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiaHR0cHM6XC9cL3d3dy52aXNhLmNvbSIsImh0dHBzOlwvXC9hbWVyaWNhbmV4cHJlc3MuY29tIiwiaHR0cHM6XC9cL3NyYy5kaXNjb3Zlci5jb20iXSwiYXV0aF90aW1lIjoxNjc3MTAxNzQ5LCJwaG9uZV9udW1iZXIiOiJcL0Q0V2dvUzBWaWhOejYyM3p5U3l6QVBqa1owZWVRNExybGthbVlUOThLdz0iLCJleHAiOjE2NzcxMDI3MTEsImlhdCI6MTY3NzEwMTgxMSwianRpIjoiNjkwNzkzZDctNGJiYy00ZWE3LWE4ZjctNDhmNzM0NDg0YjIxIiwiZW1haWwiOiJ6ZlwvTlRWKzQ5aEZXaVNFMW1obUtCT3JaMU5uaEFHeDFhMW5oMUkwTTFscz0ifQ.qPz5rZ5KL_1xUDXFsCqFgnZC6TSOszHg5B-izeNBgoShtWjnq2zt05qGE_uQboGWNecxJzXe514095JxDdcpGlQn4Isjbjsn1AA965q5JdQaR0OI-vADLTwzBp-kaxzVvdvKtexNoUoHJjzWbuBstUpsbg1eHSI7ZyLyAEgXq69cqDtmCbKe_0BaY8NER3oOutv_X_SfILvU9VyHf3kkNSZEK7dcvCozQvlj0O5QcwUcxY9-3ORzrARKMItIdkxVTiUQicRU0-47W62K1P2xGqWJZhqJESjH0Fb4LEl24UX4TLnR1v5Tna4h3XUpGN1U5lSzNIvnm82WdHHdjJug6A"
}
```

> Integrator should redirect the User to 'new user' checkout screen.   
>
> Mastercard responds with `true`.  

```json
{
  "srcCorrelationId": "4f339be7.e7939104-8888-41a6-82b1-85f9c04e91ae"
}
```

## Scenario 6 {#scenario-6}

**Assumptions**

* SRCi has opted into the Mastercard Installments Services feature.
* User has a Click to Pay profile with one or more enrolled cards, [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) returns `true`.
* No Click to Pay cookies are dropped in the browser from any network, [isRecognized()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md) call returns `false`.

<br />

**When**   
> On Merchant website, user selects Checkout with 'Click to Pay'.

**Then**
> **Step 1:** Merchant calls init() method with their allocated DPA IDs and `dpaTransactionOptions`, which includes the final amount for checkout and the currency of the transaction (for example, 250.00 USD).

```javascript
{
    srcInitiatorId: "oxfgkjkdjdkdj...",
    srciDpaId: "fghy=djkjdu45985966...",
    srciTransactionId: "39859489jksjdksjd=93...".
    dpaTransactionOptions:{
        dpaLocale: "en_US",
        transactionAmount: {
            transactionAmount: "250.00",
            transactionCurrencyCode: "USD"
        }
    }
}
```

> **Step 2:** Merchant displays a contact information form for user to enter an email address or mobile number. User enters an email that is registered with their Click to Pay profile.
> **Step 3:** Merchant calls the [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) method. (Optionally, to check if Passkey authentication is available for the user, include the `returnValidationChannels` parameter with a value `true`. See [Scenario 3](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/click_to_pay_case/index.md#scenario-3) for full authentication flow.)

```Json
{
  "consumerIdentity":
    {
      "identityProvider": "SRC",
      "identityType": "EMAIL_ADDRESS",
      "identityValue": "jdoe@gmail.com"
    }
}
```

> **Step 4:** Mastercard System returns response of [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) as `true` and sends the OTP on user's requested channel (mobile or email).

```json
{
  "consumerPresent": true,
  "lastUsedCardTimestamp": "1677085095"
}
```

> **Step 5:** Integrator calls [initiateIdentityValidation()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/initiate-id-validation/index.md) method, which contains the user's opted OTP channel in the `requestedValidationChannelId` field.

```json
{
 "requestedValidationChannelId": "EMAIL_ADDRESS"
}
```

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

> **Step 6:** Integrator displays the OTP entry screen and allows user to enter the OTP received.
> Integrator calls the [completeIdentityValidation()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/complete-id-validation/index.md) method.

```json
{
  "validationData": "542856"
}
```

> On successful validation, Mastercard system responds with an `idToken` to the Integrator.

```json
{
  "idToken": "eyJraWQiOiIxNTEwOTMtc3JjLWlkZW50aXR5LXZlcmlmaWNhdGlvbiIsInR5cCI6IkpXVCtleHQuaWRfdG9rZW4iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2ZTZlOWM4Yi02ODgwLTRhYTktOTMyOS04Zjc5YjdkNGU4NTUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImFtciI6WyJzbXNfb3RwIl0sImlzcyI6Imh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsInNyY19lbWFpbF9tYXNrIjoiZCoqKioqN0BnbWFpbC5jb20iLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOnRydWUsInNyY19waG9uZV9udW1iZXJfbWFzayI6IigqKiopICoqKi0qMjc0IiwiYXVkIjpbImh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsImh0dHBzOlwvXC93d3cudmlzYS5jb20iLCJodHRwczpcL1wvYW1lcmljYW5leHByZXNzLmNvbSIsImh0dHBzOlwvXC9zcmMuZGlzY292ZXIuY29tIl0sImF1dGhfdGltZSI6MTY3NzA5OTM1NSwicGhvbmVfbnVtYmVyIjoiXC9ENFdnb1MwVmloTno2MjN6eVN5ekFQamtaMGVlUTRMcmxrYW1ZVDk4S3c9IiwiZXhwIjoxNjc3MTAwMjU1LCJpYXQiOjE2NzcwOTkzNTUsImp0aSI6ImMzZDA5NDRkLWU5NzYtNGE4MC1iNmU0LWI0YzcwOTc2ZDkwOSIsImVtYWlsIjoiemZcL05UVis0OWhGV2lTRTFtaG1LQk9yWjFObmhBR3gxYTFuaDFJME0xbHM9In0.qwUJXABzc0UBa4fXoOv1dX9PUqeiP5yqdMulhYoQvpfiiVRVH_yuh3Kt2CkbP611D1SCXjG4f0y3BsZSoL7yXcd1wPazWszNU53mSO37BlF4PhCOwLUzPts5pxpXOM4qaUaUb3ZsC0T2-3Q37Zttuiad0VBlwsb4Ziq6vvxgAq35Fvf8OyQTvhqYbI2sO7gL5GttO1eRBTIhZANSQ_K83n2lKtplFjxWIhy-LTrB-4KV_r5cHZwYf3kwKJTUxf3NPqiDSK1l2OWtrYiOgO7KNao_Zro6rJqZPo4yruyy9g0o1BUcoDCi4faA3hmAW1sveZLUdDoq84uJ-fZtFjyeow"
}
```

> **Step 7:** Integrator retrieves the card details from profile by calling the [getSrcProfile()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/get-src-profile/index.md) and displays the cards to the user.
> User selects one of the cards from the card list. The card data includes the installments eligibility of each card, containing minimum amount, maximum amount and currency allowed for the installments (for example, 100.00 to 500.00 USD). The checkout transaction amount of 250.00 USD falls within the minimum and maximum transaction amount for the checkout, making the selected card eligible for installments.

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
                    "digitalCardFeatures": [
                      { 
                        "content": "Installment",
                        "contentType": "TEXT_STRING", 
                        "style": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css", 
                        "width": "5", 
                        "height": "5", 
                        "cardFeature": "PAY_WITH_INSTALLMENTS", 
                        "installmentData": { 
                            "minTransactionAmount": "100.00", 
                            "maxTransactionAmount": "500.00", 
                            "currencyCode": "USD" 
                            }
                      }
                    ],
                    "panExpirationMonth": "12",
                    "panExpirationYear": "2028",
                    "digitalCardRelatedData": null,
                    "countryCode": "US",
                    "dcf": {
                        "type": "BROWSER",
                        "uri": "https://sandbox.src.mastercard.com/pay/",
                        "logoUri": "http://mastercard.com/",
                        "name": "mastercard"
                    },
                    "dateOfCardCreated": "2025-05-04T19:06:08.888Z",
                    "dateOfCardLastUsed": "2026-03-09T17:17:32.352Z",
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
                "dateConsumerAdded": "2024-01-09T16:14:29.005Z"
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
                    "createTime": "2024-11-22T18:05:55.230Z",
                    "lastUsedTime": "2026-02-22T15:42:27.191Z",
                    "addressId": "0919bced-6b36-440e-b09f-9d368a0c2eea"
                }
            ]
        }
    ],
    "srcCorrelationId": "34f4a04b.533feb4e-fe76-4754-a3e5-6542150a5c4f"
}
```

## Test Cards {#test-cards}

You can test your integration in sandbox using the Mastercard test cards listed below.

**Test Cards to Receive PAN Data - Cards that use PAN data for transactions**

|   Card Number    |    Expiry Date    |      CVV       |
|------------------|-------------------|----------------|
| 5186001700008785 | *Any Future Date* | *Any 3 digits* |
| 5186001700009726 | *Any Future Date* | *Any 3 digits* |
| 5186001700009908 | *Any Future Date* | *Any 3 digits* |
| 5186001700008876 | *Any Future Date* | *Any 3 digits* |
| 5186001700001434 | *Any Future Date* | *Any 3 digits* |

**Test Cards to Receive Token Data - Cards that use secure tokens for transactions**

|   Card Number    |    Expiry Date    |      CVV       |
|------------------|-------------------|----------------|
| 5120350100064537 | *Any Future Date* | *Any 3 digits* |
| 5120350100064545 | *Any Future Date* | *Any 3 digits* |
| 5120350100064552 | *Any Future Date* | *Any 3 digits* |
| 5120350100064560 | *Any Future Date* | *Any 3 digits* |
| 5120350100064578 | *Any Future Date* | *Any 3 digits* |

**Test cards with 2-series BINs**

|   Card Number    |    Expiry Date    |      CVV       |
|------------------|-------------------|----------------|
| 2223001850114872 | *Any Future Date* | *Any 3 digits* |
| 2223001851474275 | *Any Future Date* | *Any 3 digits* |
| 2223001852998447 | *Any Future Date* | *Any 3 digits* |
| 2223001854227407 | *Any Future Date* | *Any 3 digits* |
| 2223001854601379 | *Any Future Date* | *Any 3 digits* |

**Tokenization Eligible Test Cards For Token Authentication Framework**

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
| 5506900487058777 | *Any Future Date*  | *Any 3 digits* | *US*   | Failed 3DS Challenge                                                                |
| 5506900487741018 | *Any Future Date*  | *Any 3 digits* | *US*   | Failed 3DS Challenge                                                                |
| 5578863131654396 | *Any Future Date*  | *Any 3 digits* | *AU*   | * Successful 3DS Challenge * Not Eligible for Mastercard Passkeys                   |
| 5578863117170664 | *Any Future Date*  | *Any 3 digits* | *BY*   | * Successful 3DS Challenge * Not Eligible for Mastercard Passkeys                   |

**Test cards eligible for card installments**

|   Card Number    |    Expiry Date    |      CVV       | Installment Range |
|------------------|-------------------|----------------|-------------------|
| 2303770000093755 | *Any Future Date* | *Any 3 digits* | 100.00-500.00     |
| 2303770000092229 | *Any Future Date* | *Any 3 digits* | 100.00-500.00     |
| 2303770000091460 | *Any Future Date* | *Any 3 digits* | 100.00-500.00     |
| 2303770000099174 | *Any Future Date* | *Any 3 digits* | 100.00-500.00     |
| 2303770000097293 | *Any Future Date* | *Any 3 digits* | 100.00-500.00     |
| 2303770000094985 | *Any Future Date* | *Any 3 digits* | 100.00-500.00     |
| 2303770000096725 | *Any Future Date* | *Any 3 digits* | 100.00-500.00     |
| 2303770000090645 | *Any Future Date* | *Any 3 digits* | 100.00-500.00     |
| 2303770000090900 | *Any Future Date* | *Any 3 digits* | 100.00-500.00     |
| 2303770000090421 | *Any Future Date* | *Any 3 digits* | 100.00-500.00     |

