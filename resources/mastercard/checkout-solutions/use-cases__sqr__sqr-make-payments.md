# Making Payments
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/sqr-make-payments/index.md

After a successful [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) call, Mastercard uses the [Make Payment](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications) endpoint to send the payload information for authorization directly to a payment processor/Acquirer. The request is a JWS signed by Mastercard to validate the integrity of the data in the Make Payment request. The data is encoded, digitally signed and wrapped in a JWS structure.

Further, Mastercard uses the [Push Transaction Notifications](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications) endpoint to notify the Digital Wallet about the status of the transaction, if transaction is eligible.
Diagram sqr_makingpayments_mcs

Detailed steps are explained below:

1. Merchant presents QR code to consumer.
2. Consumer logs into digital wallet and scans the QR.
3. Digital Wallet displays card list and allows consumer to select card for transaction.
4. Consumer selects card, enters transaction amount and confirms transaction.
5. Digital Wallet Operator makes a checkout [(POST /transaction/credentials)](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) request with `srcDigitalCardId`, the merchant identifier (DPA ID), transaction amount, as well as SQR specific information within the `acceptanceChannelRelatedData` object.

<!-- -->

6. Mastercard Checkout Solutions validates the Digital Wallet, the merchant identifier (DPA ID) and confirms the acquirer for the transaction.
7. Mastercard Checkout Solutions prepares and encrypts the payload.
8. Mastercard Checkout Solutions responds to the Digital Wallet with `maskedCard` and `maskedConsumer` information for a successful checkout request. The response for the checkout call will be a summary checkout response without the encryptedPayload.
9. Mastercard Checkout Solutions pushes the encrypted payload to the acquirer through the outbound Make Payment API -- [POST /transaction/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications).
10. PSP/Payment Processor submits payment to acquirer.
11. Acquirer notifies merchant of a successful transaction.
12. Mastercard Checkout Solutions sends transaction notifications to Digital Wallet Operator via [POST /notifications/transactions](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications) if the transaction is eligible, provided the Issuer of the card used to make payment supports Transaction Detail Service (TDS).
