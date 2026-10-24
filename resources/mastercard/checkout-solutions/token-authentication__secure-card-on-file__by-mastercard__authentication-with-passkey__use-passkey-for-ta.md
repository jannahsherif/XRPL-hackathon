# Use Passkey
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-mastercard/authentication-with-passkey/use-passkey-for-ta/index.md

When the cardholder uses a card for checkout, Mastercard utilizes an existing passkey to authenticate the transaction.

Passkey creation is a pre-requisite to use them for transaction authentication.

![Passkey authentication in SCOF](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/usepasskey_forta2.png)

*Face ID® and the Apple-owned graphic symbols depicted in the UX screen are trademarks of Apple Inc.*
Diagram authentication_using_passkeys_cof_b2b_authenticate_api   

Receive the proof of authentication from Mastercard Checkout Solutions. Pass this proof in the [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) API call.


```javascript
{
 "assuranceData ":
  {				
	 "verificationData":
    [
      {			
       "verificationType":"CARDHOLDER",
       "verificationEntity": "02",		
       "verificationMethod": "07",		
       "verificationResults": "01",
       "verificationTimestamp": "2023-07-13T19:52:44.551Z",
       "verificationEvents": ["01"],		
       "additionalData": "Proof of Passkey Payment Authentication"
     }
   ]
  }
}
```

For technical integration details, see the [Integrate with Secure Card on File](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md) tutorial.

<br />

