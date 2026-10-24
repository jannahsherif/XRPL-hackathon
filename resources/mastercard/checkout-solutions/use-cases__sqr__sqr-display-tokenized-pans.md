# Display Tokenized PAN Details
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/sqr-display-tokenized-pans/index.md

Fetch and display the most up-to-date token state for the PAN (Primary Account Number).

* Use the [GET /cards/{cardId}](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) endpoint to fetch the most up-to-date token state for a specific PAN.  
* An Integrator should update any internal state they maintain for this `srcDigitalCardId` to ensure that its internal system state has not got out of sync with Mastercard Checkout Solutions due to network outages, etc.
Diagram getcard-by-cardid-mcs-sqr
