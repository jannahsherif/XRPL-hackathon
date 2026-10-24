# Binding
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-mastercard/authentication-with-passkey/binding/index.md

After the cardholder successfully completes **Identity and Verification (ID\&V)** and creates a **Mastercard Passkey**, the Integrator initiates the device binding process.

During this process, a token (`srcDigitalCardId`, associated with the card) is linked to a **Multi-Factor Authentication (MFA)** method instance (associated with the consumer's device). This linkage enables **cardholder authentication** (for example, via device biometrics) in future transactions.

The device binding process leverages the **ID\&V assurance data** generated during Cardholder ID\&V to securely bind the Mastercard Passkey to the consumer's device and biometric credentials.

### Pre-requisites {#pre-requisites}

1. Complete [Cardholder Identification \& Verification (ID\&V)](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-mastercard/authentication-with-passkey/create-passkey/index.md) to obtain the **ID\&V proof**.
2. Create a **Mastercard Passkey** for the customer with the authentication reason set to **`Authenticator Registration`**.

![Passkey binding](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/mermaid_scof_passkey_binding.png "Passkey binding")

### Detailed Steps {#detailed-steps}

The Integrator provides the following parameters in the [Bind API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication):

* `srcClientId`

* `srcCorrelationId`

* `srcDpaId`

* `assuranceData`  

  This should include proofs from both **ID\&V** and **Passkey Registration** , each in their separate objects with their respective `additionalData`.

  Tip:   
  * For new binding, `externalCredentialId` is required.

  * For existing binding any one of the identifiers must be available:

    * `externalCredentialId` or
    * `credentialId`
  * For a complete sample, see **EXAMPLE - 3P FIDO MFA with MDES IDV Binding** in [Bind](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) API.   

