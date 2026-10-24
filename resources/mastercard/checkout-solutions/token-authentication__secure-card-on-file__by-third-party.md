# Authentication by Third Party
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/index.md

Apart from Mastercard-provided Token Authentication Service (TAS), Integrators who are Digital Wallet Operators and Digital Authenticators can opt for a Mastercard-approved, third-party authentication solution. In this solution, the Integrator serves as an Authenticating Entity (AE) and uses an Mastercard-approved authentication method to authenticate cardholders in tokenized transactions.

For more information on program eligibility, participant requirements, and authentication standards, refer to the Mastercard [Token Authentication Framework Guide](https://trc-techresource.mastercard.com/r/bundle/m_mc_taf_g_en-us/page/d/en-US/kof1745837091084.html).
Note: In certain use cases, an Integrator may have a separate entity as an [Authenticating Entity](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/authenticating-entity/index.md). Work with your Mastercard Representative to understand if this is valid for your implementation.

![How it works-TAF](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/taf_participants_and_interactions_13.png "How it works-TAF")

Below is the sequence of use cases supported under Third-Party Authentication that an Integrator must follow for a new user who has not been authenticated before:

| Sequence |                                                                                                                                    Use Cases                                                                                                                                    |                                      Description                                      |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| 1        | [Fetch Authentication Methods](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/fetch-authentication-methods/index.md)                                                                      | Retrieve the supported authentication methods for a payment card.                     |
| 2        | [Cardholder Identification and Verification (ID\&V)](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/identification-and-verification/identification-verification-with-mastercard/index.md) | Validate if a cardholder is the owner of a payment card using ID\&V methods.          |
| 3        | [Token Binding](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/token-binding-unbinding/index.md)                                                                                          | Create a binding between a token and the MFA method used to authenticate on a device. |
| 4        | [Transaction Authentication](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/ta-with-3rdparty/index.md)                                                                                    | Use a Mastercard-approved MFA method to authenticate a transaction.                   |
| 5        | [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/checkout-in-taf/index.md)                                                                                                       | Perform checkout with the tokenized card and receive relevant checkout response data. |

For an existing user who has been previously authenticated using ID\&V, the Integrator must follow the sequence of:

* Fetch Authentication Methods
* Perform Transaction Authentication
* Initiate Checkout

Note: **Maintaining Session Affinity**   

* Site identifier `X-Src-Cx-Flow-Id`

  * This parameter is added as a part of all inbound API response headers for resolving site affinity issues on subsequent calls. When making back-to-back API calls, the Integrator must include the `X-Src-Cx-Flow-Id` of the initial API response in the header of the subsequent API requests. This ensures that the consecutive API calls will be sent to the same Mastercard server that returned the initial response.
* `srcCorrelationId`

  * This parameter correlates a series of two or more requests to a single session of activity. Integrators must choose to populate previously used `srcCorrelationId` in subsequent requests to correlate their activity under a single ID.
