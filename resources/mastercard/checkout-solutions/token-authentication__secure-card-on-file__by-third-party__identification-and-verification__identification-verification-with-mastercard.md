# ID&V facilitated by Mastercard
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/identification-and-verification/identification-verification-with-mastercard/index.md

Identification \& Verification (ID\&V) is an authentication mechanism through which an Integrator can validate that a cardholder is the owner of a payment card stored with a particular merchant/wallet.

To perform cardholder verification, use an authentication method (OTP via SMS or Email, 3DS) retrieved from the [fetch authentication methods](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/fetch-authentication-methods/index.md) section to present a challenge to the cardholder.

Choose from the following:   

* [ID\&V with MDES Authentication](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/identification-and-verification/identification-verification-with-mastercard/index.md#idv-with-mdes-authentication)   
* [ID\&V with 3DS](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/identification-and-verification/identification-verification-with-mastercard/index.md#idv-with-3ds)

Diagram taf-id\&v-authentication

## ID\&V with MDES Authentication {#idv-with-mdes-authentication}

In this Mastercard-generated SMS/Email OTP authentication, the Integrator launches Mastercard's Authentication UI to present a challenge to the cardholder for verification.

![ID&V using MDES](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/mastercard_id&v_1.png "ID&V for TAF")
Note:   

* In the above image, **Step 2** denotes a channel selection for the cardholder. Pass `authenticationMethodType`= ONBEHALF_ISSUER_IDV for this experience.

* To present a single authentication channel to enter the OTP code, pass `authenticationMethodType`= SMS_OTP or EMAIL_OTP.

### Detailed steps {#detailed-steps}

1. Fetch the `authenticationMethods` available in the response of [Lookup Authentication Method](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) API endpoint.

2. Invoke the Authentication UI using either [SDK](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md#option-1-sdk-based-authentication-invocation) or [URL](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md#option-2-url-based-authentication-invocation) based approach. Pass the following required parameters:   

   * `AuthenticationMethod.authenticationMethodType`= SMS_OTP or EMAIL_OTP or ONBEHALF_ISSUER_IDV   
   * `AuthenticationContext.authenticationReasons` = ENROL_FINANCIAL_INSTRUMENT or CONSUMER_IDENTITY_VERIFICATION   
   * `AccountReference`
3. Create a Window object and use a [center-aligned pop-up](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md).

4. Mastercard launches the Authentication UI within the window object to present the challenge to the cardholder.

<!-- -->

5. Cardholder successfully passes the challenge for authentication.

<!-- -->

6. Mastercard sends the proof of ID\&V authentication to the Integrator with the fields such as `verificationResults`= 01 and `verificationMethod`= 04 in [assuranceData](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#assurance-data).

   ```Json
   "assuranceData"
   {
     "verificationData":[
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "04",
        "verificationResults": "01",
        "verificationTimestamp": "1721996998678",
        "verificationEvents": [
          "02"
         ],
         "additionalData":"ZXlKcmFXUWlPaUl5TURJek1ESXhOekUxTVRVMU1DMXBkR1l0YVdSbGJuUnBkSGt0ZG1WeWFXWnBZMkYwYVc5dUxYTnlZeTF0WVhOMFpYSmpZWEprTFdsdWRDSXNJblI1Y0NJNklrcFhWQ3RsZUhRdVkyRnlaRjkwYjJ0bGJpSXNJbUZzWnlJNklsSlRNalUySW4wLmV5SmhkV1FpT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKallYSmtTV1FpT2lKdWQycERaVlptWlZSWWFUUmhSazUwTmtObFZWVm5NREF3TURBd01EQXdNREF3UVZJaUxDSnBjM01pT2lKb2RIUndjenBjTDF3dmJXRnpkR1Z5WTJGeVpDNWpiMjBpTENKamIzSnlaV3hoZEdsdmJrbGtJam9pTmpReFlUazVNamN0TTJKa1l5MDBabUU0TFRCa09EY3RNamsyT0dFNE5HUmtORGhpSWl3aWMyTnZjR1ZFWVhSaElqb2llMXdpWVhWMGFGTmxjM05wYjI1SlpGd2lPbHdpWWpObE5XTmhOakl0T1dWak1TMDBNMlZoTFdKbVlXTXRabU00WkRRNE1tWXlPR1F6WENJc1hDSmhkWFJvWlc1MGFXTmhkR2x2YmxKbGMzVnNkRndpT2x3aVFWVlVTRVZPVkVsRFFWUkZSRndpTEZ3aVlYVjBhR1Z1ZEdsallYUnBiMjVOWlhSb2IyUmNJanBjSWxOTlUxOVBWRkJjSWl4Y0ltRjFkR2hsYm5ScFkyRjBhVzl1VkdsdFpWd2lPbHdpTVRjeU1UazVOamd5TVRFek0xd2lMRndpYzNKalEyeHBaVzUwU1dSY0lqcGNJakkzTW1RMU1UTXdMVFJpT1dZdE5ERmpaaTFpT0dNeUxUaGpPR0kxWXpJNU1qWTVPRndpTEZ3aVlYVjBhR1Z1ZEdsallYUnBiMjVTWldGemIyNXpYQ0k2VzF3aVJVNVNUMHhmUmtsT1FVNURTVUZNWDBsT1UxUlNWVTFGVGxSY0lsMTlJaXdpYzJOdmNHVnpJanBiSWxSUFMwVk9YMEpKVGtRaVhTd2laWGh3SWpveE56SXhPVGszTVRJeExDSnBZWFFpT2pFM01qRTVPVFk0TWpFc0ltcDBhU0k2SW1NeU1qWTJZVGhoTFdVNFpqRXROR05oTlMxaU5tWTJMVFF5TkRjNFkyRmxZelU1WWlKOS5zb0k4SHlBcnFXMWdnaFVGelNVT2FRZ2NHRzdPM3lXbllZSENnUDZsOXYzTjIzTkk0cm9rUWZoOXFqLUhnM0c0bTY3X0F1LU1sZ2M1aTBacVlIT2RNSmNldGZYRU4tdkQ1S2JhVnNod0dISEtQbGczZll4QjBXQmlVZEFWUEp5NFpxQXFfXzNTT2E3QUF2Ml83bEVJNGJ6dHYxUTBUeUNIcG9PWllZNFRYZmg5TnlnMl9feVA2U0hQMkE0dzZwck42NzJkbTU3ZnZXVnFqMUJIUHBFdmdMMU9IUm50c1NVcmdwckFrRTZ2Nm1RSXE5RGFiWVdDbmd2Z0V2ZGxXQ25rTi1DSlpZZmxrVXVYVWxqV1VpRU1sT2QyU1lNSTl0eWhtVEVlNG0xNG0wQjlDVHV5akw0SFdrX0pTU1hNMHRGX2dOelRGZzRlSGFsQnMzMmx0N0ZXR0E="
       }
     ]
   }
   ```

## ID\&V with 3DS {#idv-with-3ds}

In this ID\&V mechanism, Integrator launches Mastercard's Authentication UI to present a challenge to the cardholder for verification. The Issuer generates and delivers the challenge on the Authentication UI.

![ID&V using 3DS](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/mastercard_id&v_3ds.png "ID&V for TAF")

### Detailed steps {#detailed-steps-1}

1. Fetch the `authenticationMethods` available in the response of [Lookup Authentication Method](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) API endpoint.

2. Invoke the Authentication UI using either [SDK](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md#option-1-sdk-based-authentication-invocation) or [URL](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md#option-2-url-based-authentication-invocation) based approach.   

   * For [SDK](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md#option-1-sdk-based-authentication-invocation) approach, pass the relevant values in [authenticate()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/index.md) method:   

     * Under [dpatransactionOptions](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#dpa-transaction-options) object,   
       * `TransactionAmount`
       * `MerchantCategoryCode`
       * `MerchantCountryCode`
       * [`ThreeDsInputData`](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#threeds-input-data)
       * `ThreeDsInputData.forceChallenge`= *true*   
     * `AuthenticationMethod.authenticationMethodType` = 3DS   
     * `AuthenticationContext.authenticationReasons` = ENROL_FINANCIAL_INSTRUMENT or CONSUMER_IDENTITY_VERIFICATION
   * For [URL](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md#option-2-url-based-authentication-invocation) approach, pass the relevant values for:   

     * Under dpatransactionOptions object,   
       * `TransactionAmount`
       * `MerchantCategoryCode`
       * `MerchantCountryCode`
       * `ThreeDsInputData`
       * `ThreeDsInputData.forceChallenge`= *true*   
     * `AuthenticationMethod.authenticationMethodType`= 3DS   
     * `AuthenticationContext.authenticationReasons` = ENROL_FINANCIAL_INSTRUMENT or CONSUMER_IDENTITY_VERIFICATION   
     * `AccountReference`
3. Create a Window object and use a [center-aligned pop-up](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md).

4. Mastercard launches the Authentication UI within the window object to present the challenge to the cardholder.

<!-- -->

5. Cardholder successfully passes the challenge for authentication.

<!-- -->

6. Mastercard sends the proof of ID\&V authentication to the Integrator with the fields such as `verificationResults`= 01 and `verificationMethod`= 01 in [assuranceData](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#assurance-data).

   ```Json
   "assuranceData"
   {
     "verificationData": [
      {
         "verificationType": "CARDHOLDER",
         "verificationEntity": "03",
         "verificationMethod": "01",
         "verificationResults": "01",
         "verificationTimestamp": "2023-02-13T14:18:40.968Z",
         "verificationEvents": ["02"],
         "additionalData": "ZXlKcmFXUWlPaUl4TkRrd01qUXRjM1JuTFhOeVl5MXBaR1Z1ZEdsMGVTMTJaWEpwWm1sallYUnBiMjRpTENKMGVYQWlPaUpLVjFRclpYaDBMbU5oY21SZmRHOXJaVzRpTENKaGJHY2lPaUpTVXpJMU5pSjkuZXlKaGRXUWlPaUpvZEhSd2N6cGNMMXd2YldGemRHVnlZMkZ5WkM1amIyMGlMQ0pqWVhKa1NXUWlPaUkzTldabE9HRmxZaTFoTUdNMExUUTFZMlV0T0RNeE15MWtaR1UyWW1JMVpUWmpOR1VpTENKcGMzTWlPaUpvZEhSd2N6cGNMMXd2YldGemRHVnlZMkZ5WkM1amIyMGlMQ0pqYjNKeVpXeGhkR2x2Ymtsa0lqb2lObU5pTURWa1lXTXROekpsWlMwME0yRTJMVGd3TW1RdE16UTBORE0xTkRRNE9HSm1JaXdpYzJOdmNHVkVZWFJoSWpvaWUxd2lZWFYwYUZObGMzTnBiMjVKWkZ3aU9sd2lOMlJpTUdReU16VXRORFF3WlMwMFpUZGpMV0k1TkRBdE5HSmhZMll4TURjNE16RmlYQ0lzWENKaGRYUm9aVzUwYVdOaGRHbHZibEpsYzNWc2RGd2lPbHdpUVZWVVNFVk9WRWxEUVZSRlJGd2lMRndpWVhWMGFHVnVkR2xqWVhScGIyNU5aWFJvYjJSY0lqcGNJak5FVTF3aUxGd2ljM0pqYVVOc2FXVnVkRWxrWENJNlhDSmpaVGd4TWpKaFpTMDRPR0ppTFRRMU16Y3RPRGRtWlMwNFpUVTJaamswTnpWallqUmNJaXhjSW5Sb2NtVmxSSE5RUVZabGNtbG1hV1ZrWENJNlhDSjBjblZsWENJc1hDSmhkWFJvWlc1MGFXTmhkR2x2YmxScGJXVmNJanBjSWpJd01qTXRNREl0TVROVU1UUTZNVGc2TkRBdU9UYzJXbHdpTEZ3aVlYVjBhR1Z1ZEdsallYUnBiMjVTWldGemIyNXpYQ0k2VzF3aVJVNVNUMHhmUmtsT1FVNURTVUZNWDBsT1UxUlNWVTFGVGxSY0lsMTlJaXdpWlhod0lqb3hOamMyTWprNE1qSXdMQ0pwWVhRaU9qRTJOell5T1RjNU1qQXNJbXAwYVNJNklqTXlNekEwTm1NNExUTXlNalF0TkdFM1ppMDRORE0zTFRBMk9HSTVabUU1TW1KbE1DSjkudG80amxEZDNDRlBNX3VjQjlqYkNQOF9pMHhGQ0ZMQ09aaEhqYWRPMFZaM2tlT3ViMGs0Zm1uX2ZMdzFYWkc1VTBCOENaTVhkc1dTX3dqQmdKNGphaXZfblZGLS1pXzI5LVl5ZVE3QlBnNm9JUEdwRVhERWhxeGw0WmVlWTdxdU1yTWhoMm5idXBrY0hjeUIzNmRDSzI4NUQtQkxoVnRYaGVkNFMxS0stcXI2cWNPSjc2cW5EWmxETlN4MnJJdlh3Q2hzbFhCWEZ3cFBpajlKeGpLY2p2NVJXTDBxQVVYTXhLUUU4R2YwWm5CX2JWWlF4UkR6dy0xQ1doS01JeVNoemFob0RKSTlkUnpLU3YtYzF4d3p6NXdUbjZGaGN0R0FPazBTZDZLc1VJckNCdzNXM01YZDB1V1FYRE9odnVZQTBhWlg5R01SRnBPUDVwZW5tWk5sVWFB"
       }
     ]
   }
   ```

### Consumer Cancels The Challenge {#consumer-cancels-the-challenge}

If a consumer cancels the challenge on the Authentication UI, Mastercard responds with `authenticationStatus`= *CANCELLED*.

Here, the cardholder is not verified and Mastercard does not provide fraud liability protection to the Integrator.

```json
{
  "authenticationStatus": "CANCELLED",
  "authenticationResult": "NOT_AUTHENTICATED",
  "srcCorrelationId": "6cb05dac-72ee-43a6-802d-3444354488bf",
  "srciTransactionId": "3e73a481-d79c-4cb1-b648-52b70469e63a"
}
```

