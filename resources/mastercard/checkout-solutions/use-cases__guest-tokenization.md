# Guest Checkout Tokenization
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/guest-tokenization/index.md

Warning: Guest Checkout Tokenization is currently available only in India and will be rolled out to other markets in the future. Please contact your [Mastercard representative](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/support/index.md#get-help) for more details on market expansion.

Guest Checkout Tokenization allows merchants and Payment Service Providers to tokenize PANs entered by consumers when performing guest checkout. Guest Checkout allows cardholders to make a purchase without the need to create an account or save their payment details with the merchant.

[Learn more](https://developer.mastercard.com/mastercard-checkout-services/product/guest-checkout-tokenization/) about the key benefits of using Guest Checkout Tokenization.

## Participants and Interactions {#participants-and-interactions}

Learn about the roles of the different participants and their interactions to facilitate the Guest Checkout Tokenization experience in the following diagram.

![Participants and Interactions](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/guestcheckouttokenization7.png "Participants and Interactions")

|            Participant            |                                                                                              Description                                                                                               |              Participant Examples               |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| **Consumer**                      | Consumer chooses to perform guest checkout at a merchant site. Consumer's PAN details are not stored on file.                                                                                          | Cardholder                                      |
| **Integrator**                    | Initiates request for tokenization of consumer's PAN. Passes encrypted PAN data to Mastercard Checkout Solutions in return for a token and cryptogram.                                                 | * Merchants * PSPs * Payment Gateway * Acquirer |
| **Mastercard Checkout Solutions** | Serves as an integration point for merchants/PSPs to offer Guest Checkout Tokenization. Tokenizes guest checkout transactions and sends back an encrypted payload containing the token and cryptogram. | Mastercard                                      |

## Use Case {#use-case}

|                                                                                       Use Case                                                                                       |                                   Description                                    |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| [Tokenize Guest Checkout Transactions](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/guest-tokenization/guestcheckouttokenization/index.md) | Generate token and cryptogram for PANs provided for guest checkout transactions. |

## Applicable APIs {#applicable-apis}

|                                                                       API                                                                        | Merchant |   PSP    |
|--------------------------------------------------------------------------------------------------------------------------------------------------|----------|----------|
| [DPA Registration](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#registration)        | N/A      | Required |
| [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#guest-checkout-tokenization) | Required | Required |

## Next Steps {#next-steps}

Review the use cases in detail to understand the API calls you need to make in order to provide Guest Checkout Tokenization.

If you are already familiar with the use cases, you can refer to the [Tutorials and Guides](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/tutorials-and-guides/index.md) section to understand the steps to onboard, integrate and test.
