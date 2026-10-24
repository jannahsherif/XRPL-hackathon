# Mastercard Installments Services
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/value-added-services/installments-services/index.md

Mastercard's Installments Services lets consumers split large purchases into fixed monthly payments using existing cards in their Click to Pay profile, without relying on third‑party Buy Now, Pay Later services. The service works through participating card issuers, enabling eligible cardholders to access installment options directly at checkout. Merchants receive full payment upfront, while issuers manage the consumer's installment plan according to the terms selected.

![Userflow for carded installments](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/carded_installments_user_flow.png "Userflow for carded installments")

The following section outlines the SDK flow and checkout experience for a returning consumer whose existing cards qualify for installment payments. If a consumer is enrolling a new card, installment plans are not available.

## Installment Eligibility {#installment-eligibility}

To check if an installment plan is available for a consumer's profile, Merchants must complete the following steps as part of the SDK initialization:

1. Integrator calls [init()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/init/index.md) and includes the final [transactionAmount](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#transaction-amount) in the [dpaTransactionOptions](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#dpa-transaction-options) object. For example:

   ```json
   {
     "transactionAmount": {
       "transactionAmount": "250.00",
       "transactionCurrencyCode": "USD"
     }
   }  
   ```

2. Per the standard Click to Pay user flow, Integrator calls [isRecognized()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md) to check if the consumer is recognized by any of the participating SRC networks.

   * If the consumer is recognized, the [response](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md#response-example-and-parameters) includes a federated ID token.
   * If the consumer is not recognized, Integrator initiates [identity lookup](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) and [authentication](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/index.md). On successful validation, the authentication response includes a federated ID token.
3. Integrator calls [getSrcProfile()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/get-src-profile/index.md) with the idToken.

4. Response returns the consumer's profile and associated cards. If a card is eligble for carded installments, the [digitalCardFeature](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#digital-card-feature) object includes [cardFeature](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#card-feature) value of `PAY_WITH_INSTALLMENTS` and the corresponding [installmentData](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#installment-data), which specifies the minimum and maximum transaction amounts for the purchase to qualify. For example:

   ```json
   {
     "digitalCardFeature": [ 
       { 
         "content": "Installment", 
         "contentType": "TEXT_STRING",
         "style": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css", 
         "width": "5", 
         "height": "5",
         "cardFeature": "PAY_WITH_INSTALLMENTS", 
         "installmentData": { 
           "minTransactionAmount": "100.00", 
           "maxTransactionAmount": "500.00", 
           "currencyCode": "USD" 
         } 
       }
     ]
   }
   ```

## List Installment Plans {#list-installment-plans}

Integrators may use either Mastercard's UI components or their own custom designs to display the card list that includes installment data. The built‑in option shows all cards, indicating which ones are eligible for installments.

1. Integrator displays card list, including those that have installment plans available.
2. Consumer selects the card they want to use for the transaction and the usual [checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) flow continues.
3. The checkout UI displays the installment plans available for the selected card. Consumer selects an installment plan from the list or has the option to pay in full.
4. Issuer sets up the payment plan on the eligible card. Once the checkout is complete, the merchant submits the order and displays the order confirmation screen to the consumer.

Diagram carded-installments

## Next Steps {#next-steps}

Review the installments [test scenario](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/testing/test_cases/click_to_pay_case/index.md#scenario-6).
