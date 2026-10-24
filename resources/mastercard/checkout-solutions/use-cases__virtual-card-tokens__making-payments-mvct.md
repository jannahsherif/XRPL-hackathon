# Making Payments
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/making-payments-mvct/index.md

You can facilitate a consumer to complete a purchase by retrieving the payload containing a virtual card token and DTVC from Mastercard Checkout Solutions. Mastercard further submits the transaction details to the Issuer for payment authorization.

This sequence diagram shows a typical successful scenario:
Diagram mvct-making-payments-NEW

Detailed steps are explained below:

1. Integrator makes a [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) request using `srcDigitalCardId` for the token associated with the chosen card and `dpaTransactionOptions.paymentOptions.dynamicDataType` = `DYNAMIC_CARD_SECURITY_CODE`.
2. Mastercard generates a unique, one-time use DTVC and returns the checkout response with the virtual card token (comprised of the static token number), token expiration date, and newly generated DTVC.
3. Integrator presents the virtual card token and DTVC to the cardholder.
4. Cardholder confirms their purchase and transaction details (and may manually copy and paste the credential where applicable) in the merchant checkout form.
5. Once the cardholder confirms their purchase and transaction details, the merchant/payment processor sends payload with virtual card token credentials to Mastercard for payment authorization.
6. Mastercard performs the token processing and validates the unique DTVC associated with the transaction.
7. Further, Mastercard sends the authorization request to the Issuer to indicate if DTVC validation was performed.
8. The Issuer responds with an approved or declined transaction decision.
9. If approved, the transaction is successful and Mastercard notifies the Integrator via [Push Transaction Details](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications) API. The notification only goes out if the transaction is eligible and if the Issuer of the card used to make payment supports Transaction Detail Service (TDS).

