# Tokenization of Existing Token
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/card-on-file/create-tokens/tokenization-of-existing-token/index.md

Integrators can use an existing token to generate a new Secure Card on File token, without needing to retokenize the FPAN - reducing cardholder friction and allowing Integrators to seamlessly and securely save the card.

For example, a token provisioned through [Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/index.md) or [Mastercard Virtual Card Tokens](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/index.md) can be used to derive a Secure Card on File token.
Note: In the [Enroll API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#cards) request, the `cardSource` must be set to `EXISTING_CREDENTIAL` by the integrator, if the integrator knows an existing token is being used, rather than an FPAN.

## Click-to-Pay Static Token to Secure Card on File Token {#click-to-pay-static-token-to-secure-card-on-file-token}

The cardholder checks out with a Click to Pay merchant and, after a successful transaction, may choose to save their card with the merchant.
To support this, integrators can use the Click to Pay static token from the checkout to generate a Card on File token, enabling secure storage of the card for future use.


Note: For this use case, Integrators must support dual payload and provide `dynamicDataType` as `CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM` during [init()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/init/index.md) or [checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md). Contact your Mastercard representative to configure your checkout response to support dual payload. Diagram existing-token-tokenization-c2p-new

<br />

**Important considerations:**

1. Merchant initiates a [Click to Pay checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) and [receives a dual payload](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step8/index.md).  
   * Merchant will [decrypt the payload](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step8/index.md) and obtain first payment credentials and submits them for payment authorization:
     * **Cloud Token** in `token` object.
     * **DSRP cryptogram** in `dynamicData` object.
   * Obtain the second payment credential, **Static token** from the `card` object to generate a Card on File token.
2. Merchant initiates tokenization request to generate a Card on File token by calling [Enroll Card API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#cards) and passing :
   * The **static token** in the `card` object.   
     * Token number in `card.primaryAccountNumber`   
     * Token expiry month in `card.panExpirationMonth`   
     * Token expiry year in `card.panExpirationYear`   
   * `cardSource` = `EXISTING_CREDENTIAL`, when it is known that an existing Click to Pay token is being tokenized in to a Card on File token.
3. On successful tokenization and token provisioning, Merchant will receive the card enrollment response with `srcDigitalCardId` referencing the generated card on file token.

## Mastercard Virtual Card Token to Secure Card on File Token {#mastercard-virtual-card-token-to-secure-card-on-file-token}

A [Mastercard Virtual Card Token](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/index.md) can be provisioned either via an Issuer wallet app or through a browser autofill experience, depending on the integrator. This token is usable across standard online checkout forms and can be saved on file. When saved with a participating Secure Card on File customer, the standard tokenization for that program will follow.
Diagram existing-token-tokenization-mvct-new

**Important considerations:**

1. The cardholder adds their card details to the browser's payment interface, which [generates a Mastercard Virtual Card Static Token](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/card-enrollment-mvct/index.md) representing the virtual card to [complete a payment](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/making-payments-mvct/index.md) on a merchant's website or app.
2. The integrator submits an [Enroll Card API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#cards) request with the following parameters:
   * The virtual card token.
   * Token expiry information.
   * `cardSource` = `EXISTING_CREDENTIAL`,when it is known that an existing virtual card token is being tokenized in to a card on file token.
3. On successful tokenization and token provisioning, Merchant will receive the card enrollment response with `srcDigitalCardId` referencing the generated card on file token/ existing FPAN.

Note: Token behavior---including usage, expiration, and lifecycle management---follows standard Card on File policies. The sole distinction lies in the method of converting alternate token credentials into a Secure Card on File token.

## Tokenization across On-Behalf-Of Integrations {#tokenization-across-on-behalf-of-integrations}

When an **On-Behalf-Of** Integrator tokenizes for a Merchant, those tokens (using the Token Unique Reference) can be tokenized by another **On-Behalf-Of** Integrator. This gives Merchants the flexibility to work with multiple Integrators for tokenization without having to re-tokenize cards (FPANs) with each Integrator.
Note: This use case is applicable to [On-Behalf-Of program types](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/card-on-file/index.md#who-is-secure-card-on-file-for) only.

For example, a Merchant working with Integrator A may also choose to work with Integrator B. In this case, Integrator B can create new tokens from the Merchant's existing tokens with Integrator A (using the Token Unique Reference), and both sets of tokens will remain active for use.

Diagram enable_token_portability

Detailed steps are explained below:

1. **Agreement** -- Merchant and Integrator A agree to pass the Merchant's Token Unique Reference (TUR) to Integrator B.
2. **Notification to Mastercard** -- Merchant informs their Mastercard representative that:
   * They are working with both Integrator A and Integrator B, and Integrator A has agreed to share the TUR.
   * They wish to share TUR from Integrator A to Integrator B.
3. **Token Sharing** -- Merchant's TUR generated with Integrator A are shared with Integrator B.
4. **Initiate Request** -- Integrator B initiates a tokenization request.
5. **Enroll Card** -- Integrator B sends an [Enroll Card request](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) by passing:
   * The **TUR** from Integrator A in the `enrolmentReferenceData` object:

     * TUR in `enrolmentReferenceData.enrolmentReferenceId`   
     * Populate the `enrolmentReferenceData.enrolmentReferenceType` = `TOKEN_UNIQUE_REFERENCE`   
   * `cardSource` = `EXISTING_CREDENTIAL`.  

     **Note: If Integrator B is processing a large volume of tokens, the [Cards Batch Enroll API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#cards-batch-enrollment) can be used to accelerate the process.**

6. **Receive Tokenization Results** -- Integrator B receives the tokenization results, including the card enrollment response with the new token (`srcDigitalCardId`).
