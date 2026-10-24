# API Reference
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/index.md

Tip: You can disregard any additional fields identified in Requests or Responses or API specs that are not defined as part of documentation.

Prior to calling Mastercard APIs, you will need an API Signing Key to authenticate API calls.

* To obtain signing keys for Sandbox environment, refer to [Creating Keys](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/add-signing-key/index.md)
* To upload signing keys to Production environment, refer to [Access Production Environment](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-production/index.md)

You can find more details about this in [Key Management](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md) tutorial.

## API Endpoints {#api-endpoints}

Mastercard Checkout Solutions offers the following APIs.

|                                                           *Registration_ API*                                                            |                                                   Description                                                   |
|------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| [Submit DPA Data](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#registration) | To register a new DPA (or batch of DPAs); or update or delete existing DPA records.                             |
| [Check Status](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#registration)    | To check the status of a batch registration job based on the *{batch-id}* received in response of above method. |

|                                                         **Card* API*                                                         |                                                                                                                             Description                                                                                                                              |
|------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Enroll Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) | To enroll a card into Mastercard by tokenizing the card so that the consumer can use the token for subsequent checkouts. The card enrollment also results in the creation of a new profile (if the profile doesn't exist already) and links the card to the profile. |
| [Delete Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) | To delete a previously enrolled card and the associated token.                                                                                                                                                                                                       |
| [Get Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)    | To retrieve masked card details and optionally the token for the specified card identifier.                                                                                                                                                                          |

|                                                                         *Authentication* API                                                                         |                                                                                                                                Description                                                                                                                                |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Look Up Cardholder Authentication Methods](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) | Look up the supported authentication method for a given card ID or TUR (token unique reference). Retrieve a list of supported authentication methods relevant to supplied criteria specified by the client, including authentication reason, and account holder identity. |
| [Bind MFA Method](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication)                           | Create a binding between the verified token and an instance of the MFA method linked to the consumer's device.                                                                                                                                                            |
| [Unbind MFA Method](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication)                         | Delete the binding between a verified token and an MFA method instance.                                                                                                                                                                                                   |

|                                                               *Checkout* API                                                               |                                                                                                                                   Description                                                                                                                                    |
|--------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout)              | To obtain the encrypted transaction credentials for an enrolled card so that it can be submitted for authorization processing and the consumer can complete the purchase. In the Secure Card on File QR use case, the encrypted payload will be sent directly to the Integrator. |
| [Confirmations](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#confirmations)    | For token requesters to notify Mastercard about the outcome of an action performed after receiving the payload. **Applicable for Click to Pay use cases only**.                                                                                                                  |
| [Get Transaction History](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)\* | To obtain a list of recent transactions for a given card id.                                                                                                                                                                                                                     |

|                                                                    *Outbound* API                                                                    |                                                                               Description                                                                                |
|------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Card Notifications](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications)         | Outbound card status update notifications endpoint exposed by client system to receive card lifecycle updates generated by Issuer and returned by Mastercard.            |
| [Push Transaction Details](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications)\* | Outbound transaction notifications endpoint exposed by client system to receive transaction authorization status updates generated by Issuer and returned by Mastercard. |
| [Make Payment](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications)               | Outbound transaction endpoint exposed by client system to receive payload generated by Mastercard.                                                                       |
| [DPA Status Notifications](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications)   | Outbound DPA enrollment status endpoint exposed by client system to receive notifications generated by Mastercard.                                                       |

Note: Outbound API endpoints are required to receive notifications and to allow to push payload information to Mastercard Checkout Solutions for authorization purposes. These API calls are sent from Mastercard to notify the Integrator that events such as card activation, suspension, expiration, cancellation have occurred.

To be able to receive notifications related to the tokenized card and transactions from Mastercard, you will need to:

* Have a listener application that exposes an endpoint to receive the notifications.
* Ensure the API is implemented as per the specifications defined in this page.
* Share the URL that you would want Mastercard to use to push notifications to.
* Set up MTLS (Mutual Transport Layer Security) connectivity. You will need access to the Key Management Portal (KMP) application on Mastercard Connect to be able to request certificates. KMP application provides an inventory of all PKI for Business Partners keys and certificates that have been exchanged between Mastercard and customers. Your [Mastercard representative](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/support/index.md#get-help) will guide you through this process.

<br />

Mastercard supports encryption of [Card Notifications](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card-notifications) and [Push Transaction Details](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#push-transaction-details) API endpoints, if required. Reach out to your Mastercard representative for more details.

\* Applicable for transactions with eligible Issuers only.
