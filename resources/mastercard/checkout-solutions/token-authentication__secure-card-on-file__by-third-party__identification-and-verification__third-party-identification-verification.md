# ID&V facilitated by Integrator
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/identification-and-verification/third-party-identification-verification/index.md

Apart from Mastercard, a previously-onboarded Authenticating Entity can also perform cardholder identification using the following verification methods:

* [ID\&V with MDES Authentication](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/identification-and-verification/third-party-identification-verification/index.md#idv-with-mdes-authentication)
* [ID\&V with 3DS](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/identification-and-verification/third-party-identification-verification/index.md#idv-with-3ds)
* [ID\&V with Issuer (IAAV)](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/identification-and-verification/third-party-identification-verification/index.md#idv-with-issuer)

Note: In certain use cases, an Integrator may have a separate entity as an Authenticating Entity. Work with your Mastercard Representative to understand if this is valid for your implementation.

## ID\&V with MDES Authentication {#idv-with-mdes-authentication}

The Integrator hosts the Authentication UI and uses the [Authenticate](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) API to initiate and complete the cardholder verification. Mastercard sends the challenge via Email or SMS to the cardholder.  

This authentication experience is only available for `authenticationMethodType`= SMS_OTP or EMAIL_OTP.
Diagram taf-id\&v-authentication-api

### Detailed Steps {#detailed-steps}

1. Call [Lookup Authentication Method](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) API with `authenticationReasons` = ENROL_FINANCIAL_INSTRUMENT or CONSUMER_IDENTITY_VERIFICATION to fetch the `authenticationMethods`.

2. Call [Authenticate](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) API with the following parameters to generate an authentication code:

   * `authenticationReasons` = ENROL_FINANCIAL_INSTRUMENT or CONSUMER_IDENTITY_VERIFICATION   
   * `authenticationMethodType`= SMS_OTP or EMAIL_OTP   
   * `srcDigitalCardId`

   Tip: For a complete sample, see **EXAMPLE - MDES IDV Initiate Authentication** in [Authenticate](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) API.
3. Mastercard provides the authentication code. Integrator presents the OTP screen to the cardholder.

4. Once cardholder enters the authentication code, call [Authenticate](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) API for Mastercard to validate the authentication code:

   * `authenticationSessionId`
   * `srcDigitalCardId`  
   * `otpValue`

   Tip: For a complete sample, see **EXAMPLE - MDES IDV Complete Authentication** in [Authenticate](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) API.
5. Mastercard sends the proof of ID\&V authentication to the Integrator with the fields such as `verificationResults`= 01 and `verificationMethod`= 04 in `assuranceData`.

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

   ```Json
   //Decoded additionalData
   "Header"
   {
     "kid": "20230217151550-itf-identity-verification-src-mastercard-int",
     "typ": "JWT+ext.card_token",
     "alg": "RS256"
   }
   "Payload"
   {
     "aud": "https://mastercard.com",
     "cardId": "nwjCeVfeTXi4aFNt6CeUUg000000000000AR",
     "iss": "https://mastercard.com",
     "correlationId": "641a9927-3bdc-4fa8-0d87-2968a84dd48b",
     "scopeData":
     "{
        \"authSessionId\":\"b3e5ca62-9ec1-43ea-bfac-fc8d482f28d3\",
        \"authenticationResult\":\"AUTHENTICATED\",
        \"authenticationMethod\":\"SMS_OTP\",
        \"authenticationTime\":\"1721996821133\",
        \"srcClientId\":\"272d5130-4b9f-41cf-b8c2-8c8b5c292698\",
        \"authenticationReasons\":[\"ENROL_FINANCIAL_INSTRUMENT\"]
     }",
     "scopes": [
       "TOKEN_BIND"
     ],
     "exp": 1721997121,
     "iat": 1721996821,
     "jti": "c2266a8a-e8f1-4ca5-b6f6-42478caec59b"
   }
   ```

## ID\&V with 3DS {#idv-with-3ds}

The Authenticating Entity facilitates the cardholder verification using EMV® 3-D Secure through an Issuer challenge on the cardholder's device.

On successful verification, the Authenticating Entity provides the ID\&V proof (`assuranceData`) to the Integrator. Next, the Integrator must use this ID\&V proof in the [token binding](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/token-binding-unbinding/index.md) use case.

```json
{
  "assuranceData": [
    "verificationData"
    {
      "verificationType": "CARDHOLDER",
      "verificationEntity": "01",
      "verificationMethod": "01",
      "verificationResults": "01",
      "verificationTimestamp": "1678294563",
      "verificationEvents": "02/04",
      "additionalData": "Base64Encoded-ExtAuthData-Json-Object"
    }
  ]
}
```

## ID\&V with Issuer {#idv-with-issuer}

The Authenticating Entity facilitates the cardholder verification using an Issuer-generated challenge on cardholder's device through an Issuer proprietary channel.
On successful verification, the Issuer generates and shares the Issuer Authentication Assurance Value (IAAV) with the Authenticating Entity, who provides the ID\&V proof (IAAV as part of the [`assuranceData`](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#assurance-data)) to the Integrator.

```json
{
  "assuranceData": [
    "verificationData"
    {
      "verificationType": "CARDHOLDER",
      "verificationEntity": "03",
      "verificationMethod": "06",
      "verificationResults": "01",
      "verificationTimestamp": "1678294563",
      "verificationEvents": "04",
      "additionalData": "Base64Encoded-ExtAuthData-Json-Object"
    }
  ]
}
```

<br />

Cardholder verification must be successfully completed before the [token binding](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/token-binding-unbinding/index.md) process.

Note: The IAAV can also be used as the proof of [Issuer transaction authentication](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/ta-with-3rdparty/index.md#issuer-authentication), and in such cases the Integrator can use it directly during checkout.
