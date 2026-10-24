# Authentication with Passkey
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/click-to-pay/use-case1/index.md

Mastercard offers transaction authentication\*\* to Integrators during Click to Pay checkout for enhanced payment security.

\*\* The authentication methods are available based on regions, the type of device, and account.
Note: The below UX depicts Recognized User scenario and is for illustration purpose only.

* For rest of the scenarios, see [Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md) section.   
* For details on transaction authentication, see [Product Guide](https://trc-techresource.mastercard.com/r/bundle/m_tas_pg_en-us/page/d/en-US/tai1746675386084.html).
When the cardholder adds a new card, the Integrator tokenizes it. The cardholder then completes the challenge on the Authentication UI and views a prompt to create a passkey.

### IDV with 3DS {#idv-with-3ds}

![Passkey authentication for a new consumer](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/clicktopay_newuser_passkey5.png "Passkey authentication for a new consumer")

*Face ID® and the Apple-owned graphic symbols depicted in the UX screen are trademarks of Apple Inc.*

![Passkey authentication for a new consumer](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/mermiad_c2p_createpasskey_3ds.png "Mermaid Passkey authentication for a new consumer")

### IDV with MDES {#idv-with-mdes}

![Passkey authentication for a new consumer](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/c2p_createPasskey_2.png "Passkey authentication for a new consumer")

*Face ID® and the Apple-owned graphic symbols depicted in the UX screen are trademarks of Apple Inc.*

For technical integration details, see the [Integrate with Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step5/index.md) tutorial.

## Use Passkey {#use-passkey}

When the cardholder uses a card for checkout, Mastercard utilizes an existing passkey to authenticate the transaction.

Passkey creation is a pre-requisite to use them for transaction authentication.
Note: If a cardholder logs in to Click to Pay with a Mastercard passkey and selects a linked Mastercard payment card on that device, the payment is authenticated automatically, with no need to use the passkey again. For more information on Click to Pay login, see [User Recognized through Email/ Mobile Lookup](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/repeatuser_newdevice/index.md#step-2-look-up-and-validate-consumers-identity).

![Passkey authentication on a recognized device](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/clicktopay_recognizeduser_authentication_with_passkey1.png "Passkey authentication on a recognized device")

*Face ID® and the Apple-owned graphic symbols depicted in the UX screen are trademarks of Apple Inc.*

Preview the `assuranceData` example below.

```json
{
 "assuranceData": {
   "verificationData": [
    {
      "verificationType":"CARDHOLDER",
      "verificationEntity": "02",
      "verificationEvents": [
         "01",
         ],
       "verificationMethod": "07 - FIDO2 authentication",
       "verificationResults": "01",
       "verificationTimestamp": "2023-07-13T19:52:44.551Z",
       "verificationEvents": ["01"],
       "additionalData": "proof of passkeys authentication"
     }
   ]
   "eci": "02"
 }
}
```

For technical integration details, see the [Integrate with Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step5/index.md) tutorial.
Note:   

**Data Retention Policy** :   

Mastercard may retain FIDO attestation data, OS-attested app instance data and/or PKI key attestation data to perform the verification of device binding and transaction authentication when processing the checkout.   

If a consumer does not authenticate/use the passkey for **13 months** , Mastercard may delete all data related to the device instance, the passkey (FIDO), public key (PKI) attestation, `srcDigitalCardId` along with its corresponding FPAN and the `externalCredentialId`.   

The authenticating entity/Integrator must perform a new ID\&V process to create a new device binding and provide the required data, where applicable, to Mastercard.
