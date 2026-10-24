# Create Passkey
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-mastercard/authentication-with-passkey/create-passkey/index.md

When a cardholder adds a new card, the Integrator tokenizes it. The cardholder then completes the Identity and Verification (ID\&V) challenge---either through the Integrator's proprietary UI or Mastercard's Authentication UI---and is prompted to create a passkey.

### ID\&V with 3DS {#idv-with-3ds}

![Passkey registration after ID&V in SCOF](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/createpasskey_afteridv2.png)

*Face ID® and the Apple-owned graphic symbols depicted in the UX screen are trademarks of Apple Inc.*

![Passkey registration after ID&V with 3DS in SCOF](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/createpasskey_afteridv3.png)

Receive the proof of ID\&V from Mastercard Checkout Solutions.
* 3DSIDV+PasskeyRegistration

```3DSIDV+PasskeyRegistration
{
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "01",
        "verificationResults": "01",
        "verificationTimestamp": "2023-07-13T19:52:44.551Z",
        "verificationEvents": ["02"],
        "additionalData": "(proof of 3DS ID&V JWT)"
      },
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "02",
        "verificationMethod": "07",
        "verificationResults": "01",
        "verificationTimestamp": "2023-07-13T19:52:44.551Z",
        "verificationEvents": ["64"],
        "additionalData": "(proof of Passkey Registration JWT)"
      }
    ]
  }
}
```

### ID\&V with MDES {#idv-with-mdes}

![Passkey registration after ID&V with 3DS in SCOF](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/scof_createPasskey_afterIDV_MDES.png)

*Face ID® and the Apple-owned graphic symbols depicted in the UX screen are trademarks of Apple Inc.*

![Passkey registration after ID&V with MDES in SCOF](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/mermaid_scof_passkeyafter_mdes.png)

Receive the proof of ID\&V from Mastercard Checkout Solutions.
* OTPIDV
* IssuerAppIDV
* RiskBasedIDV
* PasskeyRegistration

```OTPIDV
{
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "04",
        "verificationResults": "01",
        "verificationTimestamp": "2023-07-13T19:52:44.551Z",
        "verificationEvents": ["02"],
        "additionalData": "(proof of MDES ID&V JWT)"
      }
    ]
  }
}
```

```IssuerAppIDV
{
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "02",
        "verificationResults": "01",
        "verificationTimestamp": "2023-07-13T19:52:44.551Z",
        "verificationEvents": ["02"],
        "additionalData": "(proof of MDES ID&V JWT)"
      }
    ]
  }
}
```

```RiskBasedIDV
{
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "26",
        "verificationResults": "01",
        "verificationTimestamp": "2023-07-13T19:52:44.551Z",
        "verificationEvents": ["02"],
        "additionalData": "(proof of MDES ID&V JWT)"
      }
    ]
  }
}
```

```PasskeyRegistration
{
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "07",
        "verificationResults": "03",
        "verificationTimestamp": "2023-07-13T19:52:44.551Z",
        "verificationEvents": ["64"],
        "additionalData": "(proof of Passkey Registration JWT)"
      }
    ]
  }
}
```

For technical integration details, see the [Integrate with Secure Card on File](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md) tutorial.
When a cardholder adds a new card, the Integrator tokenizes it. The cardholder is then prompted in the Mastercard Authentication UI to create a passkey, followed by completing an Identity and Verification (ID\&V) challenge hosted by the Integrator in its proprietary UI.

### ID\&V with MDES {#idv-with-mdes}

![Passkey registration Before ID&V with MDES in SCOF](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/scof_createPasskey_beforeIDV_MDES_2.png)

![Passkey registration Before ID&V with MDES in SCOF](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/mermaid_scof_passkeybefore.png)

Receive the proof of ID\&V from Mastercard Checkout Solutions.
* OTPIDV
* IssuerAppIDV
* RiskBasedIDV
* PasskeyRegistration

```OTPIDV
{
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "04",
        "verificationResults": "01",
        "verificationTimestamp": "2023-07-13T19:52:44.551Z",
        "verificationEvents": ["02"],
        "additionalData": "(proof of MDES ID&V JWT)"
      }
    ]
  }
}
```

```IssuerAppIDV
{
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "02",
        "verificationResults": "01",
        "verificationTimestamp": "2023-07-13T19:52:44.551Z",
        "verificationEvents": ["02"],
        "additionalData": "(proof of MDES ID&V JWT)"
      }
    ]
  }
}
```

```RiskBasedIDV
{
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "26",
        "verificationResults": "01",
        "verificationTimestamp": "2023-07-13T19:52:44.551Z",
        "verificationEvents": ["02"],
        "additionalData": "(proof of MDES ID&V JWT)"
      }
    ]
  }
}
```

```PasskeyRegistration
{
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "07",
        "verificationResults": "03",
        "verificationTimestamp": "2023-07-13T19:52:44.551Z",
        "verificationEvents": ["64"],
        "additionalData": "(proof of Passkey Registration JWT)"
      }
    ]
  }
}
```

When the cardholder adds a new card/uses an existing card and completes the challenge on the Authentication UI for Transaction Authentication, a prompt appears to create a passkey.

![Passkey registration after Transaction Authentication in SCOF](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/createpasskey_afterta2.png)

*Face ID® and the Apple-owned graphic symbols depicted in the UX screen are trademarks of Apple Inc.*

![Passkey registration after Txn Auth in SCOF](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/mermiad_scof_createpasskey_txnauth2.png)

Receive the proof of transaction authentication from Mastercard Checkout Solutions. Pass this proof in the [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) API call.
* 3DSTransactionAuthentication+PasskeyRegistration

```3DSTransactionAuthentication+PasskeyRegistration
{
  "assuranceData": {
    "verificationData": [
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "03",
        "verificationMethod": "01",
        "verificationResults": "01",
        "verificationTimestamp": "2023-07-13T19:52:44.551Z",
        "verificationEvents": ["01"],
        "additionalData": "(Proof of 3DS Payment Authentication JWT)"
      },
      {
        "verificationType": "CARDHOLDER",
        "verificationEntity": "02",
        "verificationMethod": "07",
        "verificationResults": "01",
        "verificationTimestamp": "2023-07-13T19:52:44.551Z",
        "verificationEvents": ["64"],
        "additionalData": "(Proof of Passkey Registration JWT)"
      }
    ]
  }
}
```

For technical integration details, see the [Integrate with Secure Card on File](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis_scof/step5/index.md) tutorial.
