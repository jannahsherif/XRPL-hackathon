# Authentication with 3DS
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-mastercard/authentication-with-3ds/index.md

Mastercard also supports 3DS for transaction authentication. No passkey is created in this case.

![Passkey authentication in SCOF](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/3DS_authentication_scof.png)

To initiate authentication, you must retrieve the list of authentication methods applicable for a payment card.

Use [Lookup Cardholder Authentication Methods](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) API to retrieve the supported authentication methods.
Diagram taf-lookup-auth-methods

The possible values for `authenticationMethodType` are SMS_OTP, EMAIL_OTP, ONBEHALF_ISSUER_IDV, MANAGED_AUTHENTICATION, FIDO2, and 3DS.

For example, `authenticationMethodType`= SMS_OTP indicates that you can perform authentication for this card with Issuer-facilitated OTP sent over SMS (via MDES).
Diagram authentication_using_3ds_cof

Receive the proof of authentication from Mastercard Checkout Solutions. Pass this proof in the [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) API call.

```javascript
{
 "assuranceData ":
  {				
	 "verificationData":
    [
      {			
       "verificationType":"CARDHOLDER",
       "verificationEntity": "03",		
       "verificationMethod": "01",		
       "verificationResults": "01",
       "verificationTimestamp": "2023-07-13T19:52:44.551Z",
       "verificationEvents": ["01"],		
       "additionalData": "Proof of 3DS Transaction Authentication"
     }
   ]
  }
  "eci": "02",
}
```

Refer to the technical integration details [here](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md).
