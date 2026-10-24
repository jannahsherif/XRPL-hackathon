# Mastercard Virtual Card Tokens
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/index.md

Mastercard Virtual Card Tokens (MVCT) is a Mastercard tokenization program that converts PANs into virtual card tokens and allows Integrators to perform a checkout using these tokens.

A consumer can use these virtual card tokens in any e-commerce interface (browsers or applications) where a merchant already accepts Mastercard Credit, Debit, or Maestro credentials for completing a purchase. The virtual card tokens can be accompanied by a one-time-use Dynamic Token Validation Code (DTVC) for enhanced transaction assurance.

To learn more about about the key benefits and metrics, see the [Mastercard Virtual Card Tokens](https://developer.mastercard.com/mastercard-checkout-services/product/mastercard-virtual-card-tokens/) home page.
Note: **Mastercard Agent Pay** integrators should utilize Mastercard Virtual Card Tokens (MVCT) when completing guest checkouts via the web, where the merchant acceptance interface is a simple form. Following user validation and consent for purchase, a one-time-use DTVC may be requested to populate the security code field.

## Participants and Interactions {#participants-and-interactions}

Explore about the roles of the different participants and their interactions to facilitate the tokenization and checkout in the following diagram.

![How it works-MVCT](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/mvct_participants_and_interactions7.png "How it works-MVCT")

|            Participant            |                                                                            Description                                                                             |                           Participant Examples                            |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| **Consumer**                      | * Shares PAN details with the Integrator. * Provides consent to convert PAN data into a virtual card token.                                                        | Cardholder                                                                |
| **Integrator**                    | * Passes the PAN data to receive a virtual card token. * Allows the consumer to select their virtual card token and request a one-time-use DTVC during a checkout. | * Web browser * Browser extension * Application * Digital Wallet * Issuer |
| **Mastercard Checkout Solutions** | * Serves as an integration point for Integrators to offer Mastercard Virtual Card Tokens. * Tokenizes transaction credentials, generates and validates DTVC.       | Mastercard                                                                |

## Use Cases {#use-cases}

Integrators can achieve the following functions listed as use cases in MVCT:

|                                                                          Use Cases                                                                          |                                                                                         Description                                                                                         |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Card Enrollment](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/card-enrollment-mvct/index.md) | Enroll a PAN into MVCT to generate a unique virtual card token.                                                                                                                             |
| [Managing Tokens](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/managing-tokens-mvct/index.md) | Receive lifecycle management notifications relating to a token or the underlying payment account, such as updates on card details, PAN expiration, card suspension/un-suspension, and more. |
| [Making Payments](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/making-payments-mvct/index.md) | Request a one-time-use DTVC for a given virtual card token to use transaction credentials on the checkout form for the consumer.                                                            |

## Applicable APIs {#applicable-apis}

|                                                                        API                                                                         | Mandate  |
|----------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| [Enroll Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)                       | Required |
| [Delete Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)                       | Required |
| [Get Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)                          | Optional |
| [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout)                      | Required |
| [Get Transaction History](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)           | Optional |
| [Card Notifications](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications)       | Required |
| [Push Transaction Details](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications) | Optional |

## Next Steps {#next-steps}

Take a look at the [Use Cases](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/card-enrollment-mvct/index.md) to understand how Mastercard Checkout Solution APIs facilitate card enrollment and checkout.

Further, refer to the [Tutorials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/tutorials-and-guides/index.md) section to understand the steps to onboard, integrate and test.
