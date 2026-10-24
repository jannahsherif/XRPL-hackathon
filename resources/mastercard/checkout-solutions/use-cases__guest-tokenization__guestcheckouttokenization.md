# Tokenize Guest Checkout Transactions
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/guest-tokenization/guestcheckouttokenization/index.md

The following use case describes a successful guest checkout transaction flow.

1. Cardholder enters their payment details and initiates a guest checkout transaction on a merchant's website.
2. Merchant needs to use Mastercard provided public key to encrypt the card object before calling [POST transaction/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout). Merchant encrypts the card object using the `src-fpan-encryption` public key. Mastercard will then decrypt the card using the private part of the `src-fpan-encryption` key. Refer to [Card Encryption](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/perform-encryption/index.md) tutorial for details on how to obtain the public keys and encrypt the card object.
3. Merchant calls the [POST transaction/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) API with `DigitalAccountReferenceType` as `ENCRYPTED_CARD` and `DigitalAccountReferenceValue` with the encrypted card value to retrieve payload.
4. Mastercard Checkout Solutions contacts the issuer to check eligibility for tokenization. The issuer then responds with an approved tokenization decision.
5. Mastercard Checkout Solutions creates a unique token for the PAN provided by the customer, and generates a cryptogram for this transaction.
6. Mastercard Checkout Solutions encrypts the payload using the public Payload Encryption key provided by the merchant during onboarding. Note: When a Guest Checkout token is generated for an FPAN, a 1-1 mapping exists between the FPAN and the Guest Checkout token. So if a consumer shops with the same FPAN at Merchant A and Merchant B, and both Merchants use the same PSP, there's only one Guest Checkout Token assigned to the FPAN.
7. Merchant receives the `checkoutResponseJWS` and decodes it to extract the `encryptedPayload`. Merchant then decrypts the `encryptedPayload` using the private payload encryption key (from the public/private Payload Encryption key pair) to extract the token and cryptogram .

Warning: A merchant cannot process a transaction with just the Guest Checkout Token. Merchant needs to send the cryptogram along with the token to process the transaction. Diagram tokenize_guestcheckout
