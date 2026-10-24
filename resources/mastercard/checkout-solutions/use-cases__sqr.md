# Mastercard Merchant Presented QR: SRC
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/index.md

Warning: The product concept in this page has not been tested or commercialized and is not currently available in your market. The content in this page is for information purposes only and is undergoing legal and regulatory review and is subject to changes. Mastercard will not be responsible for any action you take as a result of the content in this page, or any inaccuracies, inconsistencies, formatting errors, or omissions in this page.

Mastercard Merchant Presented QR: SRC (SQR) provides a streamlined method for accepting card payments at the point of sale via merchant-presented QR codes, leveraging EMVCo QR and messaging Secure Remote Commerce API standards. Consumers store cards in digital wallets, the wallet initiates transactions when the consumer scans QR codes at the merchant, and the merchant's acquirer/PSP receives transaction payloads to complete payment.

[Learn more](https://developer.mastercard.com/mastercard-checkout-services/product/mastercard-merchant-presented-qr-src/) about the key benefits of using Mastercard Merchant Presented QR: SRC.

## Participants and Interactions {#participants-and-interactions}

This diagram shows how SQR orchestrates the card enrollment and checkout, allowing digital wallets and acquirers/PSPs to participate without making direct connections to one-another.

![How it works-SQR](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/sqr_how-it-works4.png "How it works-SQR")

|            Participant            |                                                                                                           Description                                                                                                           |          Participant Examples          |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| **Consumer**                      | * Enrolls their card into Mastercard System through digital wallet * Scans the merchant QR code * Selects card from card list to be used for the transaction * Enters transaction amount                                        | Cardholder                             |
| **Digital Wallet Operator**       | * Enrolls card into Mastercard System through their application * Allows consumer to select card from card list to be used for the transaction * Initiates SQR checkout request when consumer scans the QR code at the merchant | Digital Wallet                         |
| **Merchants**                     | * Presents QR code to consumer * Receives acknowledgment from acquirer for completed transactions                                                                                                                               | Merchants                              |
| **Mastercard Checkout Solutions** | * Serves as an integration point between Digital Wallets and Acquirers to perform tokenization, checkout and payload authorization                                                                                              | Mastercard                             |
| **Acquirers / PSPs**              | * Provides QR codes to merchants that includes the merchant IDs * Accepts payload from Mastercard System * Submits authorization and receives authorization decision * Notifies merchant of completed transaction               | * PSPs * Payment Processor * Acquirers |

## Use Cases {#use-cases}

Integrators can achieve the following functions listed as use cases:

|                                                                              Use Case                                                                               |                                                                                                  Description                                                                                                  |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Generate QR Codes for Merchants**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/generate-qr-codes/index.md)        | Acquirer/ PSP can use the Software Development Kits (SDKs) to generate the QR codes for the digital wallet to scan, parse and verify QR codes.                                                                |
| [**Card Enrollment**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/sqr-card-enroll/index.md)                          | Enroll a card into SQR and tokenize the PAN by replacing it with a unique token, which represents the PAN but provides additional security benefits.                                                          |
| [**Manage Tokens**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/sqr-manage-tokens/index.md)                          | Receive change notifications relating to a token or the underlying payment account.                                                                                                                           |
| [**Display Tokenized PAN Details**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/sqr-display-tokenized-pans/index.md) | Display the most up-to-date token state for the PAN associated with a consumer's profile.                                                                                                                     |
| [**Making Payments**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/sqr-make-payments/index.md)                        | Digital Wallets to initiate a transaction using a tokenized PAN. Acquirer/ PSP to receive payload from Mastercard System, submit the payload for authorization, and notify merchants with transaction status. |

## Applicable APIs {#applicable-apis}

|                                                                            API                                                                            | Mandate  |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| [Enroll Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)                              | Required |
| [Delete Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)                              | Required |
| [Get Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)                                 | Optional |
| [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#mastercard-merchant-presented-qr-src) | Required |
| [Card Notifications](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications)              | Required |
| [Push Transaction Details](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications)        | Optional |
| [Make Payment](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications)                    | Required |
| [Get Transaction History](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)                  | Optional |

Note: [Card Notifications](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications), [Push Transaction Details](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications), and [Make Payment](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications) are outbound API endpoints. These endpoints are required to receive notifications and to allow to push payload information to Mastercard Checkout Solutions for authorization purposes.

To be able to receive notifications related to the tokenized card and transactions from Mastercard, you will need to:

* Have a listener application that exposes an endpoint to receive the notifications.
* Ensure the API is implemented as per the specifications defined in this page.
* Share the URL that you would want Mastercard to use to push notifications to.
* Set up MTLS (Mutual Transport Layer Security) connectivity. You will need access to the Key Management Portal (KMP) application on Mastercard Connect to be able to request certificates. KMP application provides an inventory of all PKI for Business Partners keys and certificates that have been exchanged between Mastercard and customers. Your [Mastercard representative](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/support/index.md#get-help) will guide you through this process.

## Next steps {#next-steps}

Review the [Use Cases](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/generate-qr-codes/index.md) in detail to understand the consumer scenarios and the SDK and API calls you need to make in order to provide SQR based checkout experience for your consumers.

You should work with your [Mastercard representative](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/support/index.md#get-help) to complete all the onboarding activities.
