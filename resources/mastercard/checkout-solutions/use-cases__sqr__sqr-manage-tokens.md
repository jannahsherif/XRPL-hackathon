# Manage Tokens
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/sqr-manage-tokens/index.md

Manage the tokens generated in the following different scenarios:

|                                                                                                 Scenario                                                                                                 |                                                              Details                                                              |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| [Issuer-Initiated Status Updates](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/sqr-manage-tokens/index.md#issuer-initiated-status-updates)                 | Updates related to the card and the underlying token if the card expires, or a consumer loses their card, or a fraud is reported. |
| [Events which Trigger a Notification](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/sqr-manage-tokens/index.md#events-which-trigger-a-notification)         | Card and token notifications when their status changes to Cancelled, Suspended or Active.                                         |
| [Consumer Deletes a Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/sqr-manage-tokens/index.md#consumer-deletes-a-card)                                 | Delete the token associated with the PAN when consumer deletes a card.                                                            |
| [Consumer Deletes Their Profile](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/sqr-manage-tokens/index.md#consumer-deletes-their-profile)                   | Delete the tokens associated with all the cards within a consumer's profile if the consumer deletes their profile.                |
| [Get Transactions List for a Given Token](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/sqr/sqr-manage-tokens/index.md#get-transactions-list-for-a-given-token) | Retrieve recent transactions for the specified card identifier using an API.                                                      |

## Issuer-Initiated Status Updates {#issuer-initiated-status-updates}

An issuer issues a new card if the card expires, or a consumer loses their card, or a fraud is reported.   
In these instances, Mastercard Checkout Solutions updates the PAN it associates with a consumer's token and you receive change notifications relating to a token or the underlying payment account.

This sequence diagram shows a typical successful scenario:
Diagram issuer-initiated-status-updates-sqr

Detailed steps are explained below:

1. Issuer sends a PAN update to Mastercard Checkout Solutions.
2. Mastercard Checkout Solutions update the token mapping.
3. If your server receives a **Card Notification** ([**POST /notifications/card**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/index.md#card-notifications)) request from Mastercard Checkout Solutions, you can use the data received to update the details and the state you are storing for the appropriate token in your system. For example, the issuer or consumer could close their card account, causing the token status to change to `CANCELLED`.

Note: After receiving the notification update from Mastercard Checkout Solutions, Integrator should send an acknowledgement response to Mastercard Checkout Solutions.

## Events that Trigger a Notification {#events-that-trigger-a-notification}

Use the **Card Notification** ([**POST /notifications/card**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications)) API to send token update notifications in the following circumstances:

* Issuer initiated Token lifecycle events: `CANCELLED` (when issuer deletes the token) and `SUSPENDED`(when issuer suspends the token).
* Token activated by Mastercard Checkout Solutions: `ACTIVE`.
* Card art changes, represented in `artUri` in the [maskedCard.digitalCardData](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#masked-card) object.
* Token info changes, for example, a PAN change resulting in a change to `tokenLastFour` in the [maskedCard](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#masked-card) object.

Note: Notifications are not sent for Integrator initiated lifecycle events, for example, Delete.

## Consumer Deletes a Card {#consumer-deletes-a-card}

You must send a **Delete Card** ([**DELETE /cards/{cardId}**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)) request for the associated token when a consumer deletes a tokenized PAN.

This sequence diagram shows a typical successful scenario:
Diagram delete-card-sqr

Detailed steps are explained below:

1. Cardholder deletes a saved card stored on file.
2. Make a **Delete Card** ([**DELETE /cards/{cardId}**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/index.md#delete-card)) request containing the `srcdigitalcardId` for the card the consumer has chosen to delete.
3. Secure Card on File sends the issuer a Tokenization Event Notification request to deactivate the tokenized card.
4. Issuer sends deactivate response to Secure Card on File
5. After getting the deactivate response, Secure Card on File will deactivate token mapping.
6. Secure Card on File responses back to the Integrator to delete card. If the request is successful, archive the information associated with this token based on your internal policies and update the token status stored in your system to CANCELLED.
7. You could then update the cardholder that the saved card is removed.

Tip: Mastercard recommends you delete any cryptograms you may be storing for this token as well as the token itself. Based on your own internal policies and any regulatory requirements, you can delete all archived information about this token when a certain amount of time has passed, such as two years.

## Consumer Deletes Their Profile {#consumer-deletes-their-profile}

* A consumer can delete their merchant profile and all associated tokenized cards.

* In this scenario, call **Delete Card** ([**DELETE /cards/{cardId}**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)) with the `srcdigitalcardId` value for the card associated with the consumer's profile.

Note: You are required to make Delete requests for all associated tokens when a consumer deletes their profile from your website.

* Once you have completed all the delete requests for all the cards associated with the consumer's profile, update the user interface to remove the consumer's profile.

## Get Transactions List for a Given Token {#get-transactions-list-for-a-given-token}

* You can retrieve recent transactions for the specified card identifier via the Get transactions by Card Id ([**GET /cards/{cardId}/transactions**](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card)) API.

* If Issuer of the card does not support the Transaction Detail Service, the above request will return an error.

