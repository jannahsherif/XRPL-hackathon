# Tokenization of Multiple Existing Cards
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/card-on-file/create-tokens/tokenization-of-existing-cards/index.md

When an Integrator starts using Secure Card on File, they may have many payment credentials stored, but no network tokens. The Integrator can replace all these payment credentials with tokens, without the cardholder present.

Batch Processing for Secure Card on File allows Merchants, Commerce Platforms, and Payment Service Providers to enroll and tokenize large volumes of cards asynchronously to replace the payment credentials already stored in the card-on-file repository.

Integrators will receive a `srcDigitalCardId` for each payment credential that has been successfully enrolled into Secure Card on File.
Note: A payment credential can be a Primary Account Number (PAN) or a Token Unique Reference (TUR) which the Integrator wants to tokenize.

## Submitting Batch Tokenization Request {#submitting-batch-tokenization-request}

The [Cards Batch Enroll](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#cards-batch-enrollment) API allows Integrators to send up to 250 PANs (or TURs) in a single request to Mastercard for Secure Card on File enrollment. These PANs/TURs are tokenized asynchronously, and Integrators receive a new Batch Enrollment Notification (on a per-card basis) as each PAN/TUR is processed.
Diagram existing-card-tokenization-batch-enrollment

Detailed steps are explained below:

* **Integrator initiates tokenization request**

1. Integrator submits a Cards Batch Enroll request (with upto 250 PANs) containing the cardData (PAN number and expiry), a unique `externalEnrollmentReferenceId` for each card, and optional `decisioningData` to support the Issuer's digitization decision.

2. Integrator receives a response from Mastercard Checkout Solutions containing a `batchId`.

3. Mastercard Checkout Solutions adds the request to the Batch Processing queue and processes the cards asynchronously, offline.

* **Mastercard sends card to Issuer for tokenization decisioning**

4. Mastercard contacts the Issuer to check tokenization eligibility via Tokenize Authorization Request.
5. The Issuer responds with an approved or declined tokenization decision.
6. Mastercard Checkout Solutions creates a unique token for the PAN.

* **Integrator receives tokenization results**

7. As each PAN/TUR in the batch is processed, you will receive Batch Enrollment Notification (per-card) containing a `srcDigitalCardId` and associated card metadata for successful enrollments, or an error for unsuccessful enrollments.

### Key Considerations {#key-considerations}

* Integrator must pass a unique `externalBatchId` for each Cards Batch Enroll API request to ensure that the requests are not ignored by the Batch Processing system.   

* It is the Integrator's responsibility to ensure that the `externalBatchId` provided is unique. Mastercard does not confirm the uniqueness of a batch request and relies on the `externalBatchId` sent by the Integrator to identify duplicate requests.   

* Integrator must pass unique `externalEnrollmentReferenceId` for each PAN/TUR. The `externalEnrollmentReferenceId` must be unique in order to map the correct `srcDigitalCardId` (or errors) for a given enrollment record.   

* To prevent cross-batch mapping errors, check the `batchId` upon receiving a per-card enrollment notification. Next, use `externalEnrollmentReferenceId` to map to the correct `srcDigitalCardId` (or errors).

* PANs must be randomized -- Integrator must not create Cards Batch Enroll requests with PANs in Issuer/BIN range sequence.   

* Every Cards Batch Enroll API request must be limited to one `serviceId`.   

* The Cards Batch Enroll API supports M4M to SCOF migration. For more details, view the [Move from M4M to Secure Card on File](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/m4m_migration/index.md) tutorial.

* Cards Batch Enroll API requests must contain only PANs or only TURs. You must not send mixed batch payloads.

## Receiving Batch Enrollment Notifications {#receiving-batch-enrollment-notifications}

For each record submitted in a [Cards Batch Enroll](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#cards-batch-enrollment) API, Mastercard sends a notification to the Integrator via [Batch Enrollment Notification API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications) on a per-card basis.

For successful enrollments, the notification contains a `srcDigitalCardId` and associated card metadata. For unsuccessful enrollments, the notification contains an error reason.

Use the `batchId` (provided by Mastercard) and `externalEnrollmentReferenceId` (stored in your system) to track batch enrollment notifications. Mastercard recommends to map `srcDigitalCardId` and card metadata to the corresponding `externalEnrollmentReferenceId` to understand provisioning results.

To learn more about retry policy if a Batch Enrollment Notification request fails, refer to [Retry Policy for Notifications](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/code-and-formats/index.md#retry-policy-for-notifications).
Tip: To prevent cross-batch mapping errors,

1. Check the `batchId` upon receiving a per-card enrollment notification.   
2. Use `externalEnrollmentReferenceId` to map to the correct `srcDigitalCardId` (or errors).

Next, use the tokenized credential (`srcDigitalCardId`) to retrieve transacation payload, outlined in [Make Payments](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/card-on-file/making-payments/index.md).
Diagram existing-card-tokenization-batch-enrollment-notification   

## Retrieving Status of Batch Tokenization Requests {#retrieving-status-of-batch-tokenization-requests}

The [Get Batch Enroll Status](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#cards-batch-enrollment) API allows you to retrieve the results of each record enrolled to Secure Card on File within a batch.

Use this API only if Mastercard misses to send the Batch Enrollment Notification for an enrollment record. The recommendation is to call Get Batch Enroll Status API 10 minutes after receiving the first Batch Enrollment Notification. If the batch is not completed, retry at a later time.
Diagram existing-card-tokenization-batch-status

Detailed steps are explained below:

* **Integrator initiates tokenization request**

1. Integrator calls [Cards Batch Enroll](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#cards-batch-enrollment) API (with upto 250 cards) containing the cardData (PAN number and expiry), a unique `externalEnrollmentReferenceId` for each card, and optional `decisioningData` to support the Issuer's digitization decision.
2. Integrator receives a response from Mastercard Checkout Solutions containing a `batchId`.
3. Mastercard Checkout Solutions adds the request to the Batch Processing queue and processes the cards asynchronously, offline.

* **Mastercard sends card to Issuer for tokenization decisioning**

4. Mastercard contacts the Issuer to check tokenization eligibility via Tokenize Authorization Request.
5. The Issuer responds with an approved or declined tokenization decision.
6. Mastercard Checkout Solutions creates a unique token for the PAN.

* **Integrator receives tokenization results**

7. On successful tokenization, you will receive Batch Enrollment Notification (per-card) containing a `srcDigitalCardId` and associated card metadata for successful enrollments, or an error for unsuccessful enrollments.
8. Integrator must track the Batch Enrollment Notification for each `externalEnrollmentReferenceId` within a batch.

* **Integrator retrieves batch status**


9. Integrator calls [Get Batch Enroll Status](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#cards-batch-enrollment) API with `batchId`, `srcClientId`, and `serviceId` to retrieve the status of the batch enrollment.
10. Mastercard Checkout Solutions responds with the batch status per `externalBatchId`.

<br />

### Understanding Tokenization Results {#understanding-tokenization-results}

**Successful Provisioning**

|                           Result                            |                                                                                                                                                                     Response and Details                                                                                                                                                                      |                                      Action for Integrator                                      |
|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| 200                                                         | Successful                                                                                                                                                                                                                                                                                                                                                    | No additional action is needed.                                                                 |
| 200 with Successful but *requires additional verification*. | You will receive a `200` response code. This is indicated with populating the `pendingEvents` object with the pending cardholder verification type, for example - `PENDING_SCA`, `PENDING_AVS` or `PENDING_CONSUMER_IDV`. In this instance, the token is provisioned in an active state, and can be treated as equivalent to an approved tokenization request | No additional action needed. Any further action to perform cardholder verification is optional. |

**Unsuccessful Provisioning**
Note: The Integrator must decide whether to store the PAN or request another card to tokenize, based on PCI-DSS considerations.

| Result |                                                                                                Response and Details                                                                                                |                                                    Action for Integrator                                                    |
|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| 400    | Error with `ISSUER_DECLINE`. The PAN was not approved by the Issuer for tokenization.                                                                                                                              | Prompt the cardholder to provide the correct CVC2 value. Ensure to use the correct CVC2 value before retrying tokenization. |
| 400    | Error with `TOKENIZATION_INELIGIBLE` or `PAN_INELIGIBLE`. The PAN will not be tokenized if it is in an account range that has not yet been enabled by the Issuer via Mastercard Digital Enablement Service (MDES). | The PAN provided is not yet tokenizable. Retry again in 3-6 months.                                                         |

