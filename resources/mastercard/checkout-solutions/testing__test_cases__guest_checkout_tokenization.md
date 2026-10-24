# Guest Checkout Tokenization
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/guest_checkout_tokenization/index.md

As a prerequisite, familiarize yourself with [Guest Checkout Tokenization Use Case](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/guest-tokenization/index.md).

|                                                                           Scenarios                                                                           |                           Description                           |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| [Scenario 1](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/guest_checkout_tokenization/index.md#scenario-1) | Integrator sends an encrypted card with CVC                     |
| [Scenario 2](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/guest_checkout_tokenization/index.md#scenario-2) | Integrator sends an encrypted card without CVC                  |
| [Scenario 3](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/guest_checkout_tokenization/index.md#scenario-3) | Integrator sends an encrypted card to receive a DSRP Cryptogram |

## Scenario 1 {#scenario-1}

**Assumptions**

* DPA is registered with Guest Checkout Tokenization Program
* Integrator is enrolled in Guest Checkout Tokenization Program
* Integrator sends an encrypted card with CVC
* Integrator sends `digitalAccountReferenceType` as `ENCRYPTED_CARD`

**When**   
> Integrator initiates checkout

```json
{
   "acceptanceChannelRelatedData":null,
   "recipientIdPayload":null,
   "keyFingerprintId":null,
   "digitalAccountCredentials":{
      "digitalAccountReference":{
         "digitalAccountReferenceValue":"eyJraWQiOiIxNDkwNjQtc3RnLXNyYy1mcGFuLWVuY3J5cHRpb24iLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.L6hGkKrr8UWUf5ypGx-KErVaA6o8-1rtId4k21dvGViDmxsxZQzsl73A7c6xBanWZ7TsTPVfqRd30ELH4jNXz4a-53w6jhCGJlORpyIb8NbYoaXVJJTgEcONGjtXIVGauREPZK4XeVWbwheYhkBtWr5okMq0QOMv4dBlLm5fjBX2v90NRr8lVcZgXY-QFiEaodljSK_pEX3GziKYfWo2X06uMAsC5gQWY25OpsIO0lH2XDF-4WgtBGzqrtZqTnOhrJJrT-1JBTS5UXMVDk9e8BAhy0HNORsDdzT0bN0REx1K14A5D---44sb6KMfrFzDi_6KY8cR61U393vI6jBkUQ.Qgg7TzCkHs5ZP4Uy.JbflGua-7FZzeRqN6ZwqzMeggNU5Occ8znpzaXXuiHmdkjpvUO04OHDaDkP0_ps0GH9cdNfJzwyG5v9UcN8Ho98NeZT21NVNH9SM9tM31nz5NRpWwg9y-1fKYUVxQ0PPWTznvAm8GuKdaFexyjQYF6Hp4PXg0ih7TguNLe0OkLdcbsTpreoLNvY-wkfOV9Yh0cuDJ5OC4F6dnWFndUFtJhXbl3TosMfnq5AEM-ar7879VzCGNRVu_j9i4IyfxQcYunoQbZ1uOfsaCJ_ItJQ6C_RSNkdI-PfuT3Ws3LHniefPau8WKSjg4vJzP2OA2_ULo7UPfXw0jiIjXkpFYPtDH8VyOY9kSZ_aQsS3uT2QhqFmzSw9ZnmG7mmf0S6-HZYYGCBm_CGIQ0_Pn88jYcWuEJDjUj5lNDzEdc8Wn8x7nJTnUWdcm3kwGiirPO70YtxvyinMT_SnVlAGsDLTL8qDa_aGStexGfRMH_0L39mob41e84Jc6wMMvtntm-dTm_5q4SHEuaq11DguUitI-AddmA7gAjlKH-Iy6EMFotdBUH5aeAJtrOSPwlI5TggRQ6V13O1v3q-18SR4a-Cp95dqodU2UXjV4RhgbOzGUrUiMNMTAH1WyMYkR1mz_sPsvFQ0pQNkWjcmH0Mpdv4B3qhqC
9gEhY7TZdmLr77dKazGkI16OH7K-bqKt5Nkq6D3un0LpF1wfPP9NcOHacXe_g.6CVANgTmfqmfL-j_HORCSg",
         "digitalAccountReferenceType":"ENCRYPTED_CARD"
      }
   },
   "srcDpaId":"SRC_DPA_ID_8632",
   "payloadTypeIndicatorCheckout":"FULL",
   "dpaTransactionOptions":{
      "orderType":null,
      "dpaAcceptedShippingCountries":[
         "US"
      ],
      "consumerEmailAddressRequested":true,
      "merchantCountryCode":null,
      "consumerNameRequested":true,
      "threeDsInputData":null,
      "customInputData":null,
      "merchantOrderId":"21d05adf-cab3-4150-8aca-52b57df6bca6",
      "dpaBillingPreference":null,
      "transactionType":"PURCHASE",
      "threeDsPreference":null,
      "dpaShippingPreference":"FULL",
      "paymentOptions":[
         {
            "dynamicDataType":"CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM",
            "dpaDynamicDataTtlMinutes":null
         }
      ],
      "transactionAmount":{
         "transactionAmount":150,
         "transactionCurrencyCode":"USD"
      },
      "consumerPhoneNumberRequested":true,
      "merchantCategoryCode":null,
      "dpaAcceptedBillingCountries":[
         "US"
      ],
      "dpaLocale":null,
      "srcTokenRequestData":null
   },
   "recipientIdCheckout":null,
   "shippingAddressId":null,
   "complianceSettings":null,
   "srcClientId":"c749b675-6a30-45d0-adb6-f5d9f5c8156d",
   "assuranceData":null,
   "srciTransactionId":"0b08b425-daef-4dd0-b53f-10a8e3956ae8",
   "shippingAddress":null,
   "srcDigitalCardId":null,
   "dpaData":{
      "dpaSupportEmailAddress":null,
      "dpaPhoneNumber":null,
      "applicationType":null,
      "dpaPresentationName":"Dpa_Presentation_Name_5357",
      "dpaEmailAddress":null,
      "dpaSupportPhoneNumber":null,
      "dpaName":"DPA_NAME_1869",
      "dpaLogoUri":null,
      "dpaSupportUri":null,
      "dpaUri":"http://dpaUri_749.com",
      "dpaAddress":null
   },
   "payloadTypeIndicatorPayload":"FULL",
   "serviceId":"GUEST_CHECKOUT_TOKENIZATION#MASTERCARDS_GUEST_CHECKOUT_TOKENIZATION#01",
   "srcCorrelationId":"2d6b3bf2-1b7e-4923-a2d4-d18bcb74a123"
}
```

**Then**   

```json
{
  "checkoutResponseJWS":"eyJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpYXQiOjE2NzA0ODEzNDIsImFsZyI6IlJTMjU2IiwianRpIjoiM2IyZDBmYmQtYWM0ZC00NDZkLWFiYWEtZTk2OGEzMTc3NzVmIiwia2lkIjoiMTQ5MDIzLXN0Zy1zcmMtcGF5bG9hZC12ZXJpZmljYXRpb24ifQ.eyJzcmNDb3JyZWxhdGlvbklkIjoiMmQ2YjNiZjItMWI3ZS00OTIzLWEyZDQtZDE4YmNiNzRhMTIzIiwic3JjaVRyYW5zYWN0aW9uSWQiOiIwYjA4YjQyNS1kYWVmLTRkZDAtYjUzZi0xMGE4ZTM5NTZhZTgiLCJlbmNyeXB0ZWRQYXlsb2FkIjoiZXlKcmFXUWlPaUpwWW5SVGRHRm5aV1V5WlNJc0ltVnVZeUk2SWtFeE1qaEhRMDBpTENKaGJHY2lPaUpTVTBFdFQwRkZVQzB5TlRZaWZRLk1ZcjFBTGdZODJRb1N6TG9DZ1FVZnZzeEo3NVJEMnRac1hmYTBQRWtuemdCOE10dmdfMEZaWGpWLUtfa3V5VmxsMVFLSWVSN3lxekZzRVJfbjVBQTMxOEpBTS12NkRGeEhiTHI2UW44clh3SmgyWDgtZVhVNzRkaWhwMFh0Q2tqejVLVXowZjRoazBGY3N0RHRBdnRFcF9Ic21Kc0ZpalZTX0xLZU5idDhXUE1Ud0ZlYWNkN0lkeEU5SnRfXzdSNHJFRTRXemZyeUdwcWZLX3AycE52UGJqS3ZKdF9wTnZCdjRWd1FxSWJGRm5iVXMwcUJHQzdmVWRIeUhQb2VYcG9vNXRkTkhJVDFwMW1PNWNhR2pQYVRwUHlwNlJnUHRmYnJmNzZqaFMwSWU5NjRPSERST1ZkaUFxazhRUzZ5cUpVamJFUmVKc0NWdlg4VDBkLTBVVHg5dy51OTY5VEhaZFNqMVBELXhzLjJSdTRZaHZGZjFNZHo5MzNZTnZWV0ZtV2ZWLVg0ZEtFYlZMaVlDaFdlUF9QMG0yOG9pQzkzaVRZOFItby1PX1RxMkRXN29UNWNrcTVkai1zQ2pnWS0tVnlVR29tQWZjUmQ3eXFNRWltb2p2VHY0c05tWXNtWEttNDdqdk5WRG82blpiSGJrSHJiUTVPZWhWYXhiR2NmcXd1QWZvWlVWcFRHVG1peGZmSU5mQjdBYXhzNkxDMVF6VlRlLTU2dUJZaUIzTjlwanB0VmFLV2t1cnM2MWlrMzJUelNMWnJScF8zdUZZbGNlOG9mSGoyQ3VBZGcxakJxNFZ1OUd2d3NwSl9RMjVncHYwSnJKQ0lVWlpIMWpNd3ktdEF4SXJwaU12NEk1TXNBSF9LRF8xUUtZaWZmTVQwemtCV2R2UmNHczM2c2JDSExJSVJ4dm1pZkEwZ3JyUEExZVZGMkloU2hIRG1valp4UkJQQkY0U3p4WGNGN0I4N1RMeGlJZ2FXN0FaVndSdTJlTkJoNzk4d29iZGxvNm5nbVZDOHJQTVBrTUJRNVF6dU0tOW9keFZsRDVZRF8ya2pfMkVYRC1YRl9FcWI3VWpUYXh6MkFUU1hVM1E2eEQ1Vmk5eE9fbktJdFZnQmV3ZjNWbnNHX1pUSEptOWlqSThXdGVwazJUb2VKUGczTE5BVERUbXFIOEpjY0Rsa21MdFZqSjNhc2F3c1NGWkp1dEtHbkprTUktdTdlbHFMZUJJMDZKNVZCQXRpZVVkTGtmdlNFN3lwdmNBd1VhNjRTTmEtTjFBNDZYQWNRRGtfc3Mta1ZvWWtMejREY3VHSXUtMkFEd2ZZcS1hdEJ0Qmc0WDBKVFc2Wm5ySllOR0FqLUxhNk4tMmMza0tiYVVfTEtCZEZQMmc0MG5PMFNxNjVDZy5kZFU1bWpvRm9Qc0JuQW9NZXdPS0pnIiwibWFza2VkQ2FyZCI6eyJzcmNEaWdpdGFsQ2FyZElkIjoiYjc0ZmYxYmMtNTRhMy00MWU5LWE5ZjQtODkyZDBjNzBiNTMwIiwicGFuQmluIjoiNTQ1NTAzIiwicGFuTGFzdEZvdXIiOiIxMDYxIiwidG9rZW5CaW5SYW5nZSI6IjU0NTUwMyIsInRva2VuTGFzdEZvdXIiOiIyNjA4IiwiZGlnaXRhbENh
  cmREYXRhIjp7InN0YXR1cyI6IkFDVElWRSIsInByZXNlbnRhdGlvbk5hbWUiOiJJc3N1aW5nIEJhbmsiLCJkZXNjcmlwdG9yTmFtZSI6Im1hc3RlcmNhcmQiLCJhcnRVcmkiOiJodHRwczovL3N0YWdlLmFzc2V0cy5tYXN0ZXJjYXJkLmNvbS9jYXJkLWFydC9jb21iaW5lZC1pbWFnZS1hc3NldC9ISUdILU1BU0stM3gucG5nIiwiY29CcmFuZGVkTmFtZSI6IkNvIGJyYW5kIHBhcnRuZXIiLCJpc0NvQnJhbmRlZCI6dHJ1ZX0sInBhbkV4cGlyYXRpb25Nb250aCI6IjA5IiwicGFuRXhwaXJhdGlvblllYXIiOiIyMDIzIiwicGF5bWVudENhcmRUeXBlIjoiQ1JFRElUIiwibWFza2VkQmlsbGluZ0FkZHJlc3MiOnsibmFtZSI6Ik1hKioqKm8gT3IqKnogRCoqIiwibGluZTEiOiI5KioqIFIqKiogQyoqKioqIiwibGluZTIiOiJSKioqKiogVSoqKioiLCJjaXR5IjoiSHVkc29uc2lkZSIsInN0YXRlIjoiUmFqYXN0aGFuIiwiY291bnRyeUNvZGUiOiJJTiIsInppcCI6IjMxNzc1NyJ9LCJzZXJ2aWNlSWQiOiJHVUVTVF9DSEVDS09VVF9UT0tFTklaQVRJT04jTUFTVEVSQ0FSRFNfR1VFU1RfQ0hFQ0tPVVRfVE9LRU5JWkFUSU9OIzAxIiwiZGF0ZU9mQ2FyZENyZWF0ZWQiOiIyMDIyLTEyLTA4VDA2OjM1OjQyLjE0MFoifSwiYXNzdXJhbmNlRGF0YSI6eyJjYXJkVmVyaWZpY2F0aW9uRW50aXR5IjoiMDIiLCJjYXJkVmVyaWZpY2F0aW9uTWV0aG9kIjoiMDMiLCJjYXJkVmVyaWZpY2F0aW9uUmVzdWx0cyI6IjIzIn0sImtleUZpbmdlcnByaW50SWQiOiJkYjU0YzQwZTdkZWIzNWRkZDdhNzIxYjNlZTE5ZjJlMTkxYTdiZTc3NzdkOGU1YzUwNWVkNTI2MzRhYThlMDk5In0.FWiP1Dl-NE_zV1eMqBWcZBpPyX5-3krvWecsqivcMm0ftVr7m901msdhHDa8lwz1x_KJxHsv71my8ZGanefy9pS31lcU--_m1SeRxFElfHf6QlGQkW05fAvj2k1VlJUbuVuQRIaeb2GdKnvT6FtoAQmZqgSk7VJ-3hJQuZulkV6VZiPkeUat0PFHKwSrvPufMPRHQB_OMDTtYpUPhUmbvAxFsiZOBqcrhqww1fZmrQVUJe8_hQtjosxkFRAXoTSohurYSBi6z3Vwj5H-MxYZi035HgwAOOagV_DdAD9Ik2N55smkP_wYdSQZHG-c3n70Wzdv_JqmdEbkl4MxJlk1OA"
}
```

## Scenario 2 {#scenario-2}

**Assumptions**

* DPA is registered with Guest Checkout Tokenization Program
* Integrator is enrolled in Guest Checkout Tokenization Program
* Integrator sends an encrypted card without a CVC
* Integrator sends `digitalAccountReferenceType` as `ENCRYPTED_CARD`

**When**   
> Integrator initiates checkout.

```Javascript

{
  "acceptanceChannelRelatedData":null,
  "recipientIdPayload":null,
  "keyFingerprintId":null,
  "digitalAccountCredentials":{
  "digitalAccountReference":{
      "digitalAccountReferenceValue":"eyJraWQiOiIxNDkwNjQtc3RnLXNyYy1mcGFuLWVuY3J5cHRpb24iLCJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.J9PPELMtWzNB7HA1STOnOWegeAg_0Khb9TyY-5IyVA5J3h450R6A3F-XujsR02AZCdIXtTvirLNStsvXejDGIlAV2-mgrQG_jNoG1v6hJEsBbeTKJZx11cAJqLGR6iPL6hlTbjcQ61XCgBZ7RN3mZO6tXSkt8NmQUzGWd7oyrBCvGzzI2b8j-FCCoAqHbT_f3Z-wSFg2utkiFrm8xdBuMwo80d6OBCHizIa7JrKpzgs4EEgt3gegB7K8RZYD4-SKBTC3dSPNQgLgwHHOtt82vGEXafUNdTZS7eYlT7zsCEfAqt-j02AiDjjnJiZY0hrOBnqi1TWVTqczv_53H6EnIQ.anK-pP7-AhD6A5oy.CUA9Y3w3_uy9ZFNKrfz3LI0T4aGY07XVaDDQs4lCNtSwFVPIv-x6BiQ9isnGOt0K4FGdkmg_pUXvRWx-abIknlVtzqDtiptochcOLL8x_ZEHFkAVASgm0EE8FJeiARIdYL0YpFYYjlv_QT-oCzjDxiF_xDzluIX4Q0_EzkHJPIKn7NZSKHyCOYOOZBUa_hU8aO0jaMz8R1VY6scxt4YlaHSEe4I9fiX2kkIeXZri1q_PYND9nx6sRuf_QWA2vsUitAV_m4mXQNh3wt1IKaLHCiypPifeotpS-BKIuqB6zIXB6QTqv_PUs6VJ03mUYFXk09KNmXIt5rH1ljJQP_D46iAeKiuFFEbi5LNsAsqZlpiz5rjAISSyl8jnCe4fWBEllJRw4uvpTw.pSkOnYo8s6jpYrl5LlLe8A",
      "digitalAccountReferenceType":"ENCRYPTED_CARD"
      }
    },
  "srcDpaId":"SRC_DPA_ID_8632",
  "payloadTypeIndicatorCheckout":"FULL",
  "dpaTransactionOptions":{
      "orderType":null,
      "dpaAcceptedShippingCountries":[
        "US"
        ],
      "consumerEmailAddressRequested":true,
      "merchantCountryCode":null,
      "consumerNameRequested":true,
      "threeDsInputData":null,
      "customInputData":null,
      "merchantOrderId":"21d05adf-cab3-4150-8aca-52b57df6bca6",
      "dpaBillingPreference":null,
      "transactionType":"PURCHASE",
      "threeDsPreference":null,
      "dpaShippingPreference":"FULL",
      "paymentOptions":[
        {
        "dynamicDataType":"CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM",
        "dpaDynamicDataTtlMinutes":null
        }
        ],
      "transactionAmount":{
        "transactionAmount":150,
        "transactionCurrencyCode":"USD"
        },
      "consumerPhoneNumberRequested":true,
      "merchantCategoryCode":null,
      "dpaAcceptedBillingCountries":[
        "US"
        ],
      "dpaLocale":null,
      "srcTokenRequestData":null
  },
  "recipientIdCheckout":null,
  "shippingAddressId":null,
  "complianceSettings":null,
  "srcClientId":"c749b675-6a30-45d0-adb6-f5d9f5c8156d",
  "assuranceData":null,
  "srciTransactionId":"0b08b425-daef-4dd0-b53f-10a8e3956ae8",
  "shippingAddress":null,
  "srcDigitalCardId":null,
  "dpaData":{
    "dpaSupportEmailAddress":null,
    "dpaPhoneNumber":null,
    "applicationType":null,
    "dpaPresentationName":"Dpa_Presentation_Name_5357",
    "dpaEmailAddress":null,
    "dpaSupportPhoneNumber":null,
    "dpaName":"DPA_NAME_1869",
    "dpaLogoUri":null,
    "dpaSupportUri":null,
    "dpaUri":"http://dpaUri_749.com",
    "dpaAddress":null
   },
  "payloadTypeIndicatorPayload":"FULL",
  "serviceId":"GUEST_CHECKOUT_TOKENIZATION#MASTERCARDS_GUEST_CHECKOUT_TOKENIZATION#01",
  "srcCorrelationId":"2d6b3bf2-1b7e-4923-a2d4-d18bcb74a123"
}
```

**Then**:

```JavaScript
{
  "checkoutResponseJWS": "eyJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpYXQiOjE2Nzk2NjQ3MDksImFsZyI6IlJTMjU2IiwianRpIjoiMGVjYmM5ZTQtYTdhYS00YWZiLWE4NzctOTNlNGNhMjM0OThiIiwia2lkIjoiMjAyMzAxMjYxMTQ1MzAtc3RnLW1jLW5ldy1wYXlsb2FkLXZlcmlmaWNhdGlvbi1zcmMtbWFzdGVyY2FyZC1pbnQifQ.eyJzcmNDb3JyZWxhdGlvbklkIjoiMzRmNGEwNGIuZmQzZWM3OGItMzE0ZS00Yjk1LTk1NzUtN2IzYTdhZDg2ZjVkIiwiZW5jcnlwdGVkUGF5bG9hZCI6ImV5SnJhV1FpT2lJeU1ESXpNREV5TkRFeU1ESXlNQzF6ZEdjdGJXTXRibVYzTFhCaGVXeHZZV1F0Wlc1amNubHdkR2x2YmkxemNtTnBMVzFoYzNSbGNtTmhjbVF0YVc1MElpd2laVzVqSWpvaVFURXlPRWREVFNJc0ltRnNaeUk2SWxKVFFTMVBRVVZRTFRJMU5pSjkuMkVqSTlaZHJDMGlDVkdwRjg4SmlMbEhmcDcwdUY3WXFucnNIcmQzWC03WTVHSlhpMVMwQmVvV0VwUGt1RlluUU9WM2pGZmZZcTMtTEhsdHJhakJMek9VYVBibDBMT01vaFNMbVNwRncyR0tiekZMZzk1WlFQQXMyRUNJbmw2V0xtU19WNXBTRVVGcTFwanMwdF8ycHJteHRJZVROOWNsdWt5UlNIQW9kS2w0Q19BMjNYSV9GNG1mQWd3YUhIcDA1Skp1aURNNXY2dFlDWUNqbUhQZjBldGlxWmdvUUNrWTNYbHVxOGY0ODVJR3B2RHhFWFJYb2Y1anRnWkZJcmlsTkRwM2otcjE4NGtneEZfTmwxcWhwVTZvNGh3YktiVXJHWGh4WjhhUWNiazg0QlNScTJ1ZzVmZWQ0ZlpzZ2FnMjFrTi1TMXFBZzRsTy10ZlNWSkxpbkNRLjB1QkE1ZV9zN1VNTnFudVQuVEk1Y3RYaE1mSG82el9WZHV5ZG9jZnZl
  NEVaWjJUVVJDbFZlRlg2X3RUVzFVOXdKT1h5WDJPcGxZQ21MRmxzMWp2VFRqVnppLXpWWVdSN2hFQ3hNWjY5WS1BM2RJUzdKc2IxNU03cm5RbVd6QzdpRjBtbDBoUm1hSklVZjFKSDhHX3p6MmF2VEh2Mmw2VVVTcnFJaFd4SGJtc052dFdxTnVkNEk4ekFiVXA5cmZ6UjJtazZZSGVZMEN3aWhxMHE0bkVzNFBCUXdlZXdUczFGanhKR0lSYVRZOU1XMnUwd0h1b0w2dkp0RHFVTGIxZDJrXzRsbk1SVDY2eWNVbTFNZW5tT2ZjenZ2N1NiWXFjN1JGcC1SdGtpbGFQV0VULVQyMTJ3VHJGbkdnYmZmdkJUR3g3YVdnUzJrMmMxSkNJeTItb05YQXRpNlQ1cjctVFA2eXltYUlmSDV5Y094UmtvWmVnRUtHODNVVXZ6b19HaEVMeGpTeDNWWHM3YkI5Yno0ckYxLU1aTk9RQ05IMndaWTdEWFUyZ1NzQ3dHaDg5cHkzVkk3ZUVPZXc0VUhBYzFiMk5oaU1SaGJTc1JrWTN6Y0RaYXgzNUJpd2dscmJKRl9XYzhCdlBtSHBJR2tTZWdMMGktVlpOdExiYkxNN0JYYThDQVAxODhlektESUw5d05rbXNIREpDeHNSRGdNWjM4emMxOW5nRUN4NTRrTkRFVER0c1hETFZfdlNWUUJMNWNQLVlTNE5xRW01TG5QTFdyZjdpV096c2dHX3VPOThYYm1ncFNXeWVYemJ4NDliMElRNnpyeWRFU1VwX19MV05MdXAwV0E5WTNMc0g1YlhLR2w2ZDVFWHpJX2tqdTZVb0ctZkoyLnM5MXRLWE1jcHF4NFVDb3VMSy00aGciLCJtYXNrZWRDYXJkIjp7InNyY0RpZ2l0YWxDYXJkSWQiOiIzMGE5ODlkYy04YzEzLTQxZjYtODJmZS0zZjA1NTI5NDkxZjMiLCJwYW5CaW4iOiI1NjU2MTEiLCJwYW5MYXN0Rm91ciI6IjQ5NDkiLCJ0b2tlbkJpblJhbmdlIjoiNTY1NjExIiwidG9rZW5MYXN0Rm91ciI6IjAwMjgiLCJkaWdpdGFsQ2FyZERhdGEiOnsic3RhdHVzIjoiQUNUSVZFIiwicHJlc2VudGF0aW9uTmFtZSI6Iklzc3VpbmcgQmFuayIsImRlc2NyaXB0b3JOYW1lIjoibWFzdGVyY2FyZCIsImFydFVyaSI6Imh0dHBzOi8vc3RhZ2UuYXNzZXRzLm1hc3RlcmNhcmQuY29tL2NhcmQtYXJ0L2NvbWJpbmVkLWltYWdlLWFzc2V0L0hJR0gtTUFTSy0zeC5wbmciLCJjb0JyYW5kZWROYW1lIjoiQ28gYnJhbmQgcGFydG5lciIsImlzQ29CcmFuZGVkIjp0cnVlfSwicGFuRXhwaXJhdGlvbk1vbnRoIjoiMTAiLCJwYW5FeHBpcmF0aW9uWWVhciI6IjIwMjkiLCJwYXltZW50Q2FyZFR5cGUiOiJDUkVESVQiLCJtYXNrZWRCaWxsaW5nQWRkcmVzcyI6eyJuYW1lIjoiSioqKiBEKioiLCJsaW5lMSI6IjYqIGgqKioqKiIsImxpbmUyIjoiaioqKioqIGMqKioiLCJjaXR5IjoiamVyc2V5IEhlaWdodCIsInN0YXRlIjoiTkoiLCJjb3VudHJ5Q29kZSI6IlVTIiwiemlwIjoiMDczMDcifSwic2VydmljZUlkIjoiR1VFU1RfQ0hFQ0tPVVRfVE9LRU5JWkFUSU9OI01BU1RFUkNBUkRTX0dVRVNUX0NIRUNLT1VUX1RPS0VOSVpBVElPTiMwMSIsImRhdGVPZkNhcmRDcmVhdGVkIjoiMjAyMy0wMy0yNFQxMzozMTo0OS4xNDNaIn0sImFzc3VyYW5jZURhdGEiOnsiY2FyZFZlcmlmaWNhdGlvbkVudGl0eSI6IjAyIiwiY2FyZFZlcmlmaWNhdGlvbk1ldGhvZCI6IjAzIiwiY2FyZFZlcmlmaWNhdGlvblJlc3VsdHMiOiIyMyJ9LCJrZXlGaW5nZXJwcmludElkIjoiMGYzMmUxODcwYjczNTE0ODhmNGEzMzY2MTQ4YmU4NTkxNjdlMDMwZmJhNjBjNGQwM2U4OWNhMzIxZWQ1Y2Y5ZCJ9.kz4Jtv0sxyGw6HUDrB3xK-18C8knlPDf1TMcUfSBqBAN9vETIKoeKFEA_ejCyCwIo2zkw3do47H1_tvUPD7WlAcPUG3UgfppijEOpnKripJ53dgjgWuKhyJb7if5lOdCa7dFHENdPbruGuUSHS6x2_aYiyJWNk1V_ljbLxUh2XtBWOZ8J6Lca_--s8qeqtcz-YJq-wmTqEC5Se2I-kW2gouyX5U7zPnxZXsSuwTE8HNlmuEp85h1OEYBOyPygzJYJsZv6CIs5kwBeqCT5YOiN6OgE_IvUo8Tm2WA3CB5E4MkW_F5j1Z3tn_1rfTkivBtPGp6hfQX6zp6SbTKtVVu9A"
}
```

## Scenario 3 {#scenario-3}

**Assumptions**

* DPA is registered with Guest Checkout Tokenization Program
* Integrator is enrolled in Guest Checkout Tokenization Program
* Integrator sends an encrypted card to receive a valid DSRP cryptogram in response
* Integrator sends `dynamicDataType` as `CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM`
* Integrator sends `digitalAccountReferenceType` as `ENCRYPTED_CARD`

**When**   
> Integrator initiates the checkout .

```Javascript
{
   "acceptanceChannelRelatedData":null,
   "recipientIdPayload":null,
   "keyFingerprintId":null,
   "digitalAccountCredentials":{
      "digitalAccountReference":{
         "digitalAccountReferenceValue":"eyJraWQiOiIxNDkwNjQtc3RnLXNyYy1mcGFuLWVuY3J5cHRpb24iLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.L6hGkKrr8UWUf5ypGx-KErVaA6o8-1rtId4k21dvGViDmxsxZQzsl73A7c6xBanWZ7TsTPVfqRd30ELH4jNXz4a-53w6jhCGJlORpyIb8NbYoaXVJJTgEcONGjtXIVGauREPZK4XeVWbwheYhkBtWr5okMq0QOMv4dBlLm5fjBX2v90NRr8lVcZgXY-QFiEaodljSK_pEX3GziKYfWo2X06uMAsC5gQWY25OpsIO0lH2XDF-4WgtBGzqrtZqTnOhrJJrT-1JBTS5UXMVDk9e8BAhy0HNORsDdzT0bN0REx1K14A5D---44sb6KMfrFzDi_6KY8cR61U393vI6jBkUQ.Qgg7TzCkHs5ZP4Uy.JbflGua-7FZzeRqN6ZwqzMeggNU5Occ8znpzaXXuiHmdkjpvUO04OHDaDkP0_ps0GH9cdNfJzwyG5v9UcN8Ho98NeZT21NVNH9SM9tM31nz5NRpWwg9y-1fKYUVxQ0PPWTznvAm8GuKdaFexyjQYF6Hp4PXg0ih7TguNLe0OkLdcbsTpreoLNvY-wkfOV9Yh0cuDJ5OC4F6dnWFndUFtJhXbl3TosMfnq5AEM-ar7879VzCGNRVu_j9i4IyfxQcYunoQbZ1uOfsaCJ_ItJQ6C_RSNkdI-PfuT3Ws3LHniefPau8WKSjg4vJzP2OA2_ULo7UPfXw0jiIjXkpFYPtDH8VyOY9kSZ_aQsS3uT2QhqFmzSw9ZnmG7mmf0S6-HZYYGCBm_CGIQ0_Pn88jYcWuEJDjUj5lNDzEdc8Wn8x7nJTnUWdcm3kwGiirPO70YtxvyinMT_SnVlAGsDLTL8qDa_aGStexGfRMH_0L39mob41e84Jc6wMMvtntm-dTm_5q4SHEuaq11DguUitI-AddmA7gAjlKH-Iy6EMFotdBUH5aeAJtrOSPwlI5TggRQ6V13O1v3q-18SR4a-Cp95dqodU2UXjV4RhgbOzGUrUiMNMTAH1WyMYkR1mz_sPsvFQ0pQNkWjcmH0Mpdv4B3qhqC9gEhY7TZdmLr77dKazGkI16OH7K-bqKt5Nkq6D3un0LpF1wfPP9NcOHacXe_g.6CVANgTmfqmfL-j_HORCSg",
         "digitalAccountReferenceType":"ENCRYPTED_CARD"
      }
   },
   "srcDpaId":"SRC_DPA_ID_8632",
   "payloadTypeIndicatorCheckout":"FULL",
   "dpaTransactionOptions":{
      "orderType":null,
      "dpaAcceptedShippingCountries":[
         "US"
      ],
      "consumerEmailAddressRequested":true,
      "merchantCountryCode":null,
      "consumerNameRequested":true,
      "threeDsInputData":null,
      "customInputData":null,
      "merchantOrderId":"21d05adf-cab3-4150-8aca-52b57df6bca6",
      "dpaBillingPreference":null,
      "transactionType":"PURCHASE",
      "threeDsPreference":null,
      "dpaShippingPreference":"FULL",
      "paymentOptions":[
         {
            "dynamicDataType":"CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM",
            "dpaDynamicDataTtlMinutes":null
         }
      ],
      "transactionAmount":{
         "transactionAmount":150,
         "transactionCurrencyCode":"USD"
      },
      "consumerPhoneNumberRequested":true,
      "merchantCategoryCode":null,
      "dpaAcceptedBillingCountries":[
         "US"
      ],
      "dpaLocale":null,
      "srcTokenRequestData":null
   },
   "recipientIdCheckout":null,
   "shippingAddressId":null,
   "complianceSettings":null,
   "srcClientId":"c749b675-6a30-45d0-adb6-f5d9f5c8156d",
   "assuranceData":null,
   "srciTransactionId":"0b08b425-daef-4dd0-b53f-10a8e3956ae8",
   "shippingAddress":null,
   "srcDigitalCardId":null,
   "dpaData":{
      "dpaSupportEmailAddress":null,
      "dpaPhoneNumber":null,
      "applicationType":null,
      "dpaPresentationName":"Dpa_Presentation_Name_5357",
      "dpaEmailAddress":null,
      "dpaSupportPhoneNumber":null,
      "dpaName":"DPA_NAME_1869",
      "dpaLogoUri":null,
      "dpaSupportUri":null,
      "dpaUri":"http://dpaUri_749.com",
      "dpaAddress":null
   },
   "payloadTypeIndicatorPayload":"FULL",
   "serviceId":"GUEST_CHECKOUT_TOKENIZATION#MASTERCARDS_GUEST_CHECKOUT_TOKENIZATION#01",
   "srcCorrelationId":"2d6b3bf2-1b7e-4923-a2d4-d18bcb74a123"
}
```

**Then**:

```JavaScript
{
  "checkoutResponseJWS": "eyJpc3MiOiJodHRwczpcL1wvbWFzdGVyY2FyZC5jb20iLCJpYXQiOjE2NzA0ODEzNDIsImFsZyI6IlJTMjU2IiwianRpIjoiM2IyZDBmYmQtYWM0ZC00NDZkLWFiYWEtZTk2OGEzMTc3NzVmIiwia2lkIjoiMTQ5MDIzLXN0Zy1zcmMtcGF5bG9hZC12ZXJpZmljYXRpb24ifQ.eyJzcmNDb3JyZWxhdGlvbklkIjoiMmQ2YjNiZjItMWI3ZS00OTIzLWEyZDQtZDE4YmNiNzRhMTIzIiwic3JjaVRyYW5zYWN0aW9uSWQiOiIwYjA4YjQyNS1kYWVmLTRkZDAtYjUzZi0xMGE4ZTM5NTZhZTgiLCJlbmNyeXB0ZWRQYXlsb2FkIjoiZXlKcmFXUWlPaUpwWW5SVGRHRm5aV1V5WlNJc0ltVnVZeUk2SWtFeE1qaEhRMDBpTENKaGJHY2lPaUpTVTBFdFQwRkZVQzB5TlRZaWZRLk1ZcjFBTGdZODJRb1N6TG9DZ1FVZnZzeEo3NVJEMnRac1hmYTBQRWtuemdCOE10dmdfMEZaWGpWLUtfa3V5VmxsMVFLSWVSN3lxekZzRVJfbjVBQTMxOEpBTS12NkRGeEhiTHI2UW44clh3SmgyWDgtZVhVNzRkaWhwMFh0Q2tqejVLVXowZjRoazBGY3N0RHRBdnRFcF9Ic21Kc0ZpalZTX0xLZU5idDhXUE1Ud0ZlYWNkN0lkeEU5SnRfXzdSNHJFRTRXemZyeUdwcWZLX3AycE52UGJqS3ZKdF9wTnZCdjRWd1FxSWJGRm5iVXMwcUJHQzdmVWRIeUhQb2VYcG9vNXRkTkhJVDFwMW1PNWNhR2pQYVRwUHlwNlJnUHRmYnJmNzZqaFMwSWU5NjRPSERST1ZkaUFxazhRUzZ5cUpVamJFUmVKc0NWdlg4VDBkLTBVVHg5dy51OTY5VEhaZFNqMVBELXhzLjJSdTRZaHZGZjFNZHo5MzNZTnZWV0ZtV2ZWLVg0ZEtFYlZMaVlDaFdlUF9QMG0yOG9pQzkzaVRZOFItby1PX1RxMkRXN29UNWNrcTVkai1zQ2pnWS0tVnlVR29tQWZjUmQ3eXFNRWltb2p2VHY0c05tWXNtWEttNDdqdk5WRG82blpiSGJrSHJiUTVPZWhWYXhiR2NmcXd1QWZvWlVWcFRHVG1peGZmSU5mQjdBYXhzNkxDMVF6VlRlLTU2dUJZaUIzTjlwanB0VmFLV2t1cnM2MWlrMzJUelNMWnJScF8zdUZZbGNlOG9mSGoyQ3VBZGcxakJxNFZ1OUd2d3NwSl9RMjVncHYwSnJKQ0lVWlpIMWpNd3ktdEF4SXJwaU12NEk1TXNBSF9LRF8xUUtZaWZmTVQwemtCV2R2UmNHczM2c2JDSExJSVJ4dm1pZkEwZ3JyUEExZVZGMkloU2hIRG1valp4UkJQQkY0U3p4WGNGN0I4N1RMeGlJZ2FXN0FaVndSdTJlTkJoNzk4d29iZGxvNm5nbVZDOHJQTVBrTUJRNVF6dU0tOW9keFZsRDVZRF8ya2pfMkVYRC1YRl9FcWI3VWpUYXh6MkFUU1hVM1E2eEQ1Vmk5eE9fbktJdFZnQmV3ZjNWbnNHX1pUSEptOWlqSThXdGVwazJUb2VKUGczTE5BVERUbXFIOEpjY0Rsa21MdFZqSjNhc2F3c1NGWkp1dEtHbkprTUktdTdlbHFMZUJJMDZKNVZCQXRpZVVkTGtmdlNFN3lwdmNBd1VhNjRTTmEtTjFBNDZYQWNRRGtfc3Mta1ZvWWtMejREY3VHSXUtMkFEd2ZZcS1hdEJ0Qmc0WDBKVFc2Wm5ySllOR0FqLUxhNk4tMmMza0tiYVVfTEtCZEZQMmc0MG5PMFNxNjVDZy5kZFU1bWpvRm9Qc0JuQW9NZXdPS0pnIiwibWFza2VkQ2FyZCI6eyJzcmNEaWdpdGFsQ2FyZElkIjoiYjc0ZmYxYmMtNTRhMy00MWU5LWE5ZjQtODkyZDBjNzBiNTMwIiwicGFuQmluIjoiNTQ1NTAzIiwicGFuTGFzdEZvdXIiOiIxMDYxIiwidG9rZW5CaW5SYW5nZSI6IjU0NTUwMyIsInRva2VuTGFzdEZvdXIiOiIyNjA4IiwiZGlnaXRhbENhcmREYXRhIjp7InN0YXR1cyI6IkFDVElWRSIsInByZXNlbnRhdGlvbk5hbWUiOiJJc3N1aW5nIEJhbmsiLCJkZXNjcmlwdG9yTmFtZSI6Im1hc3RlcmNhcmQiLCJhcnRVcmkiOiJodHRwczovL3N0YWdlLmFzc2V0cy5tYXN0ZXJjYXJkLmNvbS9jYXJkLWFydC9jb21iaW5lZC1pbWFnZS1hc3NldC9ISUdILU1BU0stM3gucG5nIiwiY29CcmFuZGVkTmFtZSI6IkNvIGJyYW5kIHBhcnRuZXIiLCJpc0NvQnJhbmRlZCI6dHJ1ZX0sInBhbkV4cGlyYXRpb25Nb250aCI6IjA5IiwicGFuRXhwaXJhdGlvblllYXIiOiIyMDIzIiwicGF5bWVudENhcmRUeXBlIjoiQ1JFRElUIiwibWFza2VkQmlsbGluZ0FkZHJlc3MiOnsibmFtZSI6Ik1hKioqKm8gT3IqKnogRCoqIiwibGluZTEiOiI5KioqIFIqKiogQyoqKioqIiwibGluZTIiOiJSKioqKiogVSoqKioiLCJjaXR5IjoiSHVkc29uc2lkZSIsInN0YXRlIjoiUmFqYXN0aGFuIiwiY291bnRyeUNvZGUiOiJJTiIsInppcCI6IjMxNzc1NyJ9LCJzZXJ2aWNlSWQiOiJHVUVTVF9DSEVDS09VVF9UT0tFTklaQVRJT04jTUFTVEVSQ0FSRFNfR1VFU1RfQ0hFQ0tPVVRfVE9LRU5JWkFUSU9OIzAxIiwiZGF0ZU9mQ2FyZ
  ENyZWF0ZWQiOiIyMDIyLTEyLTA4VDA2OjM1OjQyLjE0MFoifSwiYXNzdXJhbmNlRGF0YSI6eyJjYXJkVmVyaWZpY2F0aW9uRW50aXR5IjoiMDIiLCJjYXJkVmVyaWZpY2F0aW9uTWV0aG9kIjoiMDMiLCJjYXJkVmVyaWZpY2F0aW9uUmVzdWx0cyI6IjIzIn0sImtleUZpbmdlcnByaW50SWQiOiJkYjU0YzQwZTdkZWIzNWRkZDdhNzIxYjNlZTE5ZjJlMTkxYTdiZTc3NzdkOGU1YzUwNWVkNTI2MzRhYThlMDk5In0.FWiP1Dl-NE_zV1eMqBWcZBpPyX5-3krvWecsqivcMm0ftVr7m901msdhHDa8lwz1x_KJxHsv71my8ZGanefy9pS31lcU--_m1SeRxFElfHf6QlGQkW05fAvj2k1VlJUbuVuQRIaeb2GdKnvT6FtoAQmZqgSk7VJ-3hJQuZulkV6VZiPkeUat0PFHKwSrvPufMPRHQB_OMDTtYpUPhUmbvAxFsiZOBqcrhqww1fZmrQVUJe8_hQtjosxkFRAXoTSohurYSBi6z3Vwj5H-MxYZi035HgwAOOagV_DdAD9Ik2N55smkP_wYdSQZHG-c3n70Wzdv_JqmdEbkl4MxJlk1OA"
}
```

## Test Cards {#test-cards}

You can test your integration in **Sandbox** using the test cards listed below.

### Tokenization of Eligible Test Cards {#tokenization-of-eligible-test-cards}

You can use any of the following test cards to simulate a successful card tokenization scenario.

|   Card Number    | Expiry Date (MMYYYY) | CVV | Region |
|------------------|----------------------|-----|--------|
| 5299920970259709 | *Any Future Date*    | 000 | India  |
| 5299920971763089 | *Any Future Date*    | 000 | India  |
| 5299920972920142 | *Any Future Date*    | 000 | India  |
| 2223520122351442 | *Any Future Date*    | 000 | India  |
| 2223520125783427 | *Any Future Date*    | 000 | India  |
| 2223520126339369 | *Any Future Date*    | 000 | India  |

### PAN Ineligible Cards {#pan-ineligible-cards}

If PAN is not enabled for the country of issuer, Guest Checkout Tokenization will return a PAN_INELIGIBLE response.
You can use the following test cards to simulate the PAN_INELIGIBLE scenario:

|   Card Number    | Expiry Date (MMYYYY) |      CVV       | Region |
|------------------|----------------------|----------------|--------|
| 5220810400000027 | *Any Future Date*    | *Any 3 digits* | India  |
| 5220810400000035 | *Any Future Date*    | *Any 3 digits* | India  |

### Tokenization of Ineligible Cards {#tokenization-of-ineligible-cards}

The PAN will not be tokenized if an issuer hasn't enabled the account for Guest Checkout Tokenization. In that case, Guest Checkout Tokenization will return a TOKENIZATION_INELIGIBLE response against that payment credential linked with the disabled account. You can use the following test cards to simulate the TOKENIZATION_INELIGIBLE scenario:

|   Card Number    | Expiry Date (MMYYYY) |      CVV       | Region |
|------------------|----------------------|----------------|--------|
| 5299920870000013 | *Any Future Date*    | *Any 3 digits* | India  |
| 5299920870000021 | *Any Future Date*    | *Any 3 digits* | India  |

