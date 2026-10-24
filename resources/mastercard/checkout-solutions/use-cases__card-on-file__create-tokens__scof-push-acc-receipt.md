# Issuer-Initiated Token Creation
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/card-on-file/create-tokens/scof-push-acc-receipt/index.md

A cardholder can use their Issuer website or mobile banking app to add or push their cards to Integrators participating in Secure Card on File (SCOF).

The following use case explains how Integrators can enroll cards into Secure Card on File using `pushAccountReceipt`, which requires the Issuer to interact with Mastercard Digital Enablement Service (MDES).
Diagram complete_pushaccountreceipt

Detailed steps are explained below:

* **Cardholder adds card from Issuer website/app**

1. The cardholder logs in to their issuer's app or website.
2. They select the Secure Card on File Integrator (merchant in this use case) and the card to push.

* **Issuer requests card to be pushed to Integrator**

3. Issuer contacts the MDES using [MDES Token Connect API](https://developer.mastercard.com/mdes-digital-enablement/documentation/use-cases/push-provisioning-merchant-use-case/), and requests to push the selected card to the target Token Requester (the Integrator).
4. MDES generates and returns a `pushAccountReceipt` to the Issuer.
5. The Issuer interface selects the URI provided by the Integrator and appends the URI with the `pushAccountReceipt` of the card being pushed and the `callback URL`, which is the Issuer URL that the Token Requester must use to redirect the cardholder to the Issuer's interface once the tokenization is complete.
6. The Issuer interface invokes the Integrator's app or website with the appended URI.

* **Integrator initiates tokenization request for that card**

7. The Integrator interface may request the consumer to sign in or sign up.
8. Upon successful log in, Integrator enrolls the card with the `pushAccountReceipt` into Secure Card on File, and calls the [Enroll Card API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) with `enrolmentReferenceType` set to `PUSH_ACCOUNT_RECEIPT`.
9. If enrollment is successful, the `DigitalCardData.status` is set to `ACTIVE` in the enroll card response returned to the Integrator.
10. The Integrator includes the `pushAccountReceipt` with the respective results in the callback URL that the Issuer interface provided. The Integrator invokes the resulting URI, and the cardholder is taken back to the Issuer app or website.

### Understanding Tokenization Results {#understanding-tokenization-results}

**Successful Provisioning**

|                           Result                            |                                                                                                                                                                     Response and Details                                                                                                                                                                      |                                      Action for Integrator                                      |
|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| 200                                                         | Successful                                                                                                                                                                                                                                                                                                                                                    | No additional action is needed.                                                                 |
| 200 with Successful but *requires additional verification*. | You will receive a `200` response code. This is indicated with populating the `pendingEvents` object with the pending cardholder verification type, for example - `PENDING_SCA`, `PENDING_AVS` or `PENDING_CONSUMER_IDV`. In this instance, the token is provisioned in an active state, and can be treated as equivalent to an approved tokenization request | No additional action needed. Any further action to perform cardholder verification is optional. |

**Unsuccessful Provisioning**

| Result |                                                                                                Response and Details                                                                                                |                                                           Action for Integrator                                                            |
|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| 400    | Error with `ISSUER_DECLINE`. The PAN was not approved by the issuer for tokenization. Do not retry tokenization.                                                                                                   | If the CVC2 was provided, prompt the cardholder to provide the correct CVC2 value, and do not retry tokenization without sending the CVC2. |
| 400    | Error with `TOKENIZATION_INELIGIBLE` or `PAN_INELIGIBLE`. The PAN will not be tokenized if it is in an account range that has not yet been enabled by the issuer via Mastercard Digital Enablement Service (MDES). | The PAN provided is not yet tokenizable. Retry again in 3-6 months.                                                                        |

