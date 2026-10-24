# Manage Tokens
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/managing-tokens-mvct/index.md

Manage the tokens generated in the following scenarios:

|                                                                                                          Scenario                                                                                                           |                                          Details                                          |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [Events which Trigger a Notification](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/managing-tokens-mvct/index.md#events-which-trigger-a-notification)         | Card and token notifications when their status changes to Cancelled, Suspended or Active. |
| [Consumer Deletes a Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/managing-tokens-mvct/index.md#consumer-deletes-a-card)                                 | Delete the token associated with the PAN when consumer deletes a card.                    |
| [Get Transactions List for a Given Token](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/virtual-card-tokens/managing-tokens-mvct/index.md#get-transactions-list-for-a-given-token) | Retrieve recent transactions for the specified card identifier using an API.              |

## Events which Trigger a Notification {#events-which-trigger-a-notification}

Lifecycle management events are triggered when an issuer suspends or un-suspends the card, or issues a new card before expiration, or a cardholder updates the card details.   

Additionally, an issuer can initiate an account update within the account range or across another account range based on the following events:

* FPAN replacement within the same account range.

* FPAN replacement in a different account range.

* Routine issuer maintenance, such as moving from a 6 to 8-digit BIN, which may update the token number (even if underlying PAN does not change).

* Token expiry extension.

Use the **Card Notification** ([POST /notifications/card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications)) endpoint to keep your customers informed with token lifecycle updates and improve your transaction approval rates.

In these events, Mastercard Checkout Solutions also updates the PAN it associates with a consumer's token, and you receive change notifications relating to a token or the underlying payment account.

Build an endpoint capable of receiving token lifecycle updates from the request URI associated with **Card Notification** ([POST /notifications/card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications)) endpoint to support the following updates:

### Reason Code Updates {#reason-code-updates}

|    Reason Code     |                   Description                   |                                                                                                                                                                                                                                                                                                                                                                     Action required from Integrator                                                                                                                                                                                                                                                                                                                                                                     |
|--------------------|-------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| TOKEN_REFRESH      | The token and/or token expiry may have changed. | Fetch the new token and token expiry from the **Get Card** ([GET /cards/{cardId}](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)) API \& DTVC from the **Checkout** ([POST /transaction/credentials/](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout)) API. Update the [maskedCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#masked-card) object for the associated token with the new `panLastFour`, `panExpirationYear`, `panExpirationMonth`, `tokenLastFour`, `tokenExpirationMonth`,`tokenExpirationYear` and other parameters that may have changed. |
| Other reason codes | Any reason code other than TOKEN_REFRESH        | Update the [maskedCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#masked-card) object for the associated token with the new status and other parameters that may have changed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

Warning: Failure to fetch the new token and other token related information after receiving a **TOKEN_REFRESH** notification may cause future transactions to fail. It is important to call **Get Card** ([GET /cards/{cardId}](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)) to retrieve the latest token information before attempting to perform another transaction.

### Status Updates {#status-updates}

|  Status   |                                       Description                                       |                                                                                                                                 Action required from Integrator                                                                                                                                  |
|-----------|-----------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ACTIVE    | The card/token information has changed and is active to use for transactions.           | Update the stored token's status to ACTIVE and save the token details in the [maskedCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#masked-card) object.                                                                |
| SUSPENDED | The issuer suspends the card and the card cannot be used for transactions.              | Update the stored token's status to SUSPENDED and temporarily block the token until you receive an ACTIVE status update.                                                                                                                                                                         |
| CANCELLED | The issuer deletes the card and you must remove the token information from your system. | Update the stored token's status to CANCELLED and archive all information related to this token. Based on your internal policies and regulatory requirements, you should specify a time after which all archived information about the card and token information should be permanently deleted. |

Note: Notifications are not sent for Integrator initiated lifecycle events, for example, Delete.

This sequence diagram shows a typical successful scenario:
Diagram issuer-initiated-status-updates

Detailed steps are explained below:

1. Issuer sends a PAN update to Mastercard Checkout Solutions.
2. Mastercard Checkout Solutions updates the token mapping.
3. Your server receives a **Card Notification** ([**POST /notifications/card**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications)) request from Mastercard Checkout Solutions.
4. Respond to the Mastercard Checkout Solutions server with a 200 OK HTTP response.
5. Update the token or token details in the [maskedCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#masked-card) object based on the reason received from Card Notification request.
6. In the case of an event where reason= **TOKEN_REFRESH** , delete the old cryptogram, call **Get Card** ([GET /cards/{cardId}](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)) to update the token (`paymentToken`), token expiry (`tokenExpirationMonth` and `tokenExpirationYear`) and **Checkout** ([POST /transaction/credentials/](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout)) API to fetch DTVC (`dynamicData`).

Note: After receiving the notification update from Mastercard Checkout Solutions, Integrator should send an acknowledgement response to Mastercard Checkout Solutions.

To learn more about retry policy if a card notification request fails, refer to [Retry Policy for Notifications](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/code-and-formats/index.md#retry-policy-for-notifications).

## Consumer Deletes a Card {#consumer-deletes-a-card}

You must send a **Delete Card** ([**DELETE /cards/{cardId}**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)) request for the associated token when a consumer deletes a tokenized PAN.

This sequence diagram shows a typical successful scenario:
Diagram delete-card

Detailed steps are explained below:

1. Cardholder deletes a saved card stored on file.
2. Make a **Delete Card** ([**DELETE /cards/{cardId}**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)) request containing the `srcdigitalcardId` for the card the consumer has chosen to delete.
3. Mastercard Checkout Solutions sends the issuer a Tokenization Event Notification request to deactivate the tokenized card.
4. Issuer sends deactivate response to Mastercard Checkout Solutions.
5. Mastercard Checkout Solutions deactivates token mapping.
6. Mastercard Checkout Solutions responds back to Integrator to delete card. If the request is successful, archive the information associated with this token based on your internal policies and update the token status stored in your system to CANCELLED.
7. You could then update the cardholder that the saved card is removed.

Tip: Mastercard recommends that you delete the token, token information and cryptograms related to the deleted card. Based on your own internal policies and any regulatory requirements, you can delete all archived information about this token when a certain amount of time has passed, such as 2 years.

## Get Transactions List for a Given Token {#get-transactions-list-for-a-given-token}

* You can retrieve recent transactions for the specified card identifier via the Get transactions by Card Id ([**GET /cards/{cardId}/transactions**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)) API.

* If Issuer of the card does not support the Transaction Detail Service, the above request will return an error.


