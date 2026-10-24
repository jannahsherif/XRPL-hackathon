# Card Enrollment
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/card-enrollment-mvct/index.md

An Integrator enrolls a card into MVCT to generate a virtual card token for a PAN. This token is associated with a customer's profile. You can use this token in the API requests, such as [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) and [Card Notifications](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications).

There are two scenarios in which you can tokenize a consumer's card using the [Enroll Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) API:

|                                                                                         Scenario                                                                                          |                                                                                                      Details                                                                                                      |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**PAN Tokenization**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/card-enrollment-mvct/index.md#pan-tokenization)         | Create a token when a consumer provides a PAN by adding a new card to their profile.                                                                                                                              |
| [**TUR based Enrollment**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/card-enrollment-mvct/index.md#tur-based-enrollment) | Token Unique Reference (TUR) is an identifier associated with a token and is stored against a consumer's profile in a device wallet. Integrators can use the TUR data to enroll and initiate tokenization in MCS. |
| [**Push Account Receipt**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/card-enrollment-mvct/index.md#push-account-receipt) | Issuers as token requestors can enroll their account into MVCT using the `pushAccountReceipt` from the [MDES Token Connect API](https://developer.mastercard.com/mdes-token-connect/documentation/api-reference/) |

## PAN Tokenization {#pan-tokenization}

Enroll a PAN into the Virtual Card Token program in exchange of a unique token.
Diagram mvct-pan-tokenization

Detailed steps are explained below:

1. Consumer enters new card details and saves credentials with the Integrator.
2. Integrator prompts consumer to enroll their card into Virtual Card program.
3. Consumer provides consent to use the virtual card. The Integrator prompts consumer to perform authentication (PIN, biometric, password).
4. Upon successful authentication, Integrator sends an [Enroll Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) request with the encrypted PAN details. Refer to [Card Encryption](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/perform-encryption/index.md) tutorial for details on how to obtain the public keys and encrypt the card object. Use the `srcCorrelationId` to keep track of each unique request. Note: Mastercard recommends that you also populate cardSecurityCode (CVC2), `cardSource` (with the string `CARDHOLDER`) and include additional information in the `decisioningData` object to support the issuer's decision on tokenization.
5. Mastercard contacts the issuer to check eligibility for tokenization via Tokenize Authorization Request.
6. The issuer responds with an approved or declined tokenization decision.
7. Mastercard Checkout Solutions creates a unique token for a PAN.
8. If the tokenization request is successful, you will receive the card enrollment response with `srcDigitalCardId`. After receiving the Enroll response, an active token is provisioned. Associate the active token and `srcDigitalCardId` to the consumer's profile.

## TUR based Enrollment {#tur-based-enrollment}

Integrators use the Token Unique Reference (TUR) associated with a device wallet to enroll a card into MVCT:

* Right after a device token is provisioned with an Identification \& Verification (ID\&V)   
  **OR**
* With an existing device token and a Digital Secure Remote Payment (DSRP) cryptogram

This sequence diagram shows a typical successful scenario with the TUR based options in step 2:
Diagram mvct-tur-tokenization-combined

Detailed steps are explained below:

1. Consumer logs into their account on the device profile and enters new card details to their device wallet.
2. Integrator can choose only one of the options:
   1. **TUR + ID\&V**: MDES performs ID\&V on the card. After successful creation of a verified token, the card is loaded into the device wallet.
   2. **TUR + DSRP**: Integrator generates a DSRP cryptogram from a device token transaction. This DSRP cryptogram is validated during TUR enrollment as proof of previous MDES ID\&V.
3. Consumer provides consent to use the virtual card. The Integrator prompts the consumer to perform authentication (PIN, biometric, password).
4. Upon successful authentication, Integrator sends an [Enroll Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) request with the Token Unique Reference (TUR) data and ID\&V results or DSRP cryptogram. Use the `srcCorrelationId` to keep track of each unique request. Note: Mastercard recommends that you also populate cardSecurityCode (CVC2), `cardSource` (with the string `EXISTING_CREDENTIAL`) and include additional information in the `decisioningData` object to support the issuer's decision on tokenization.
5. Mastercard contacts the issuer to check eligibility for tokenization via Tokenize Authorization Request.
6. The issuer responds with an approved or declined tokenization decision.
7. Mastercard Checkout Solutions creates a unique token for a PAN.
8. If the tokenization request is successful, you will receive the card enrollment response with `srcDigitalCardId`. After receiving the Enroll response, an active token is provisioned. Associate and display the active token to the consumer's profile.

## Push Account Receipt {#push-account-receipt}

Enroll an account into the Virtual Card Token program leveraging the `pushAccountReceipt` from the MDES Token Connect API

![MVCT_Pushaccountreceipt_enrollment](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/mvct-push-acc-receipt-enroll.png "MVCT_Pushaccountreceipt_enrollment")

Detailed steps are explained below:

1. The consumer is logged in to their issuer's app or website and enrolls their account for the Virtual Card Token program.

2. Using the MDES Token Connect API, the issuer contacts MDES to request the push of the selected account for their MVCT program.

3. MDES generates and returns a `pushAccountReceipt` to the issuer.

4. The issuer as the integrator enrolls the account with the `pushAccountReceipt` into MVCT. The Integrator calls the [Enroll Card API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) with `enrolmentReferenceType` set to `PUSH_ACCOUNT_RECEIPT`.

5. If enrollment is successful, the `digitalCardData.status` is set to `ACTIVE` in the enroll card response returned to the Integrator.

6. Issuer as the integrator displays MVCT details to cardholder.


