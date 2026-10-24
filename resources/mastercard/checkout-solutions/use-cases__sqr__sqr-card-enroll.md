# Card Enrollment
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/sqr-card-enroll/index.md

Enroll a card to generate a relevant token for the PAN. You can use this token and a digital card ID (`srcdigitalcardId`) in the API requests; this token is associated with a customer's profile.
Diagram sqr-card-enrollment-mcs

Detailed steps are explained below:

1. Cardholder logs into digital wallet.
2. Digital wallet presents list of cards with an option for cardholder to push their card into Mastercard Checkout Solutions.
3. Cardholder selects the card to be enrolled into Mastercard Checkout Solutions.
4. Digital wallet sends an **Enroll Card** ([**POST /cards**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/index.md#enroll-card)) request with encrypted PAN details. Refer to [Card Encryption](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/perform-encryption/index.md) tutorial for details on how to obtain the public keys and encrypt the card object.
5. Mastercard Checkout Solutions contacts the issuer to check eligibility for tokenization.
6. The issuer then responds with a tokenization decision.
7. If tokenization is approved, Mastercard Checkout Solutions will return the `srcDigitialCardId` in the response and the `DigitalCardData.status` is ACTIVE in the enroll card response.
8. Consumer receives card enrollment confirmation.

Note: The enrollment and tokenization process may take a few seconds to complete. To avoid latency in tokenization during the consumer checkout flow, proceed with the PAN for the first consumer transaction and initiate the tokenization process following a successful card add and checkout. Once the consumer's PAN is tokenized, use the token for subsequent transactions.

**Understanding Tokenization Results:**

|                      Result                       |                                                                                                                                                                           Details                                                                                                                                                                            |
|---------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Successful but *requires additional verification* | You will receive a `200` response code. This is indicated with populating the `pendingEvents` object with the pending consumer verification type, for example - `PENDING_SCA`, `PENDING_AVS` or `PENDING_CONSUMER_IDV`. In this instance, the token is provisioned in an active state, and can be treated as equivalent to an approved tokenization request. |
| Declined                                          | You will receive a `400` error code in the response and will not be able to tokenize the PAN. You will need to proceed with the full PAN and re-try the tokenization process at a later stage.                                                                                                                                                               |

