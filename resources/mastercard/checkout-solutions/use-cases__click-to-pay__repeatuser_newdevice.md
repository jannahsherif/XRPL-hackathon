# User Recognized through Email or Mobile Lookup
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/repeatuser_newdevice/index.md

Integrators can recognize Click to Pay enrolled consumers in their shopping experience and offer a faster way to complete checkout. For example, Integrators can recognize the consumer based on the email address or phone number provided by the consumer at checkout or through an email address or mobile number that already exists with the merchant.

![Passkey authentication for a returning consumer on a new device](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/clicktopay_user_recognized_through_email_or_mobilelookup1.png "Passkey authentication for a returning consumer on a new device")

The following steps break down the checkout flow for a user recognized by their email address or mobile number on a new device.
Integrator must perform the following actions after [setting up the JavaScript library](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step2/index.md).

## Step 1: Initialize the SDK and Check if Consumer is Recognized {#step-1-initialize-the-sdk-and-check-if-consumer-is-recognized}

1. DPA (Digital Payment Application) interacts with the Integrator (SRCI), and the Integrator invokes the JS methods.

2. If you've already [initialized the JS Library](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step3/index.md), directly call the [isRecognized()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md) method of each participating SRC network in Click to Pay.

3. The [isRecognized()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md) method checks if the consumer is recognized by any of the participating SRC networks.

4. A **'not recognized'** message is sent back to the Integrator if the consumer is not recognized by the information provided.

Diagram initandisrecognized_2

## Step 2: Look Up and Validate Consumer's Identity {#step-2-look-up-and-validate-consumers-identity}

The next step is to check if the consumer is recognized by any of the SRC networks and, if so, validate their identity.

### Identity Lookup {#identity-lookup}

1. Consumer clicks **Checkout** , enters their email address or mobile number associated with Click to Pay, and then clicks **Continue**.

2. Call the [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) method of each participating SRC network to check if a specified Consumer Identity (email address or mobile phone number) is known to the Click to Pay System.

3. Optionally, to check which authentication validation channels are available for the consumer, include the `returnValidationChannels` parameter with a value of `true`.

4. If the consumer is known to one or more Click to Pay Systems, the associated SRC returns a response of `consumerPresent` is `true`, with a `lastUsedCardTimestamp` of when the card was last used with that SRC. If relevant, the response also includes a list of `supportedValidationChannels` that are available for authenticating the consumer's identity---email, SMS, and passkey (FIDO2).

5. Integrator proceeds with consumer authentication using the SDK of the SRC that returned the most recent last used card timestamp.

### Authenticate Consumer {#authenticate-consumer}

The [authenticate()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_clicktopay/index.md) method allows Integrators to validate the consumer's identity using Mastercard's hosted UI. It consolidates the user flow for passkey for login, one-time password (OTP), and if desired, 'Remember me' consent capture.

* **Mastercard-hosted consumer authentication** - Mastercard generates the authenticaion UI and content. Integrator calls [authenticate()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_clicktopay/index.md) with the `authenticationMethodType` of `MANAGED_AUTHENTICATION`, including the `windowRef` and parameter in their request.

* **Integrator hosted consumer authentication** - Integrator handles the UI design and content for OTP capture, while Mastercard manages passkey authentication, if available. If a passkey exists, the identity lookup response includes the value of `FIDO2` in the `supportedValidationChannels` list.

  * If a passkey exists, call [authenticate()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_clicktopay/index.md) (see Authenticate steps below).
  * If a passkey does not exist, use the legacy [initiateIdentityValidation()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/initiate-id-validation/) methods (see Identity Validation steps below).   

1. If a passkey is available on the device, the consumer is prompted to validate the passkey.

2. If a passkey is not available on the device, Mastercard sends an OTP to the consumer's registered email address or mobile number and displays the OTP verification UI. The consumer enters the OTP they received, optionally provides 'Remember me' consent for the device or browser, and then selects **Continue** .


   <br />


   If the consumer enters an incorrect OTP multiple times, their account can be temporarily locked and the `authenticate()` call will receive an [error response](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/authenticate/authenticate_clicktopay/index.md#application-errors). In such a scenario, the consumer will receive a notification about the temporary account lock via an email or mobile number from the Click to Pay system. If the consumer's account is locked, the Integrator should provide an alternative way for the consumer to complete checkout.

1. Mastercard sends an OTP to the consumer's registered email address or mobile number and Integrator displays the OTP verification UI. The consumer enters the OTP they received, optionally provides 'Remember me' consent for the device or browser, and then selects **Continue**.

2. Collect the consent details in [complianceSettings](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/sdk-reference/common-objects.md#compliance-settings) object that captures the consent to provide faster checkouts in the future.

3. Call the [completeIdentityValidation()](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/sdk-reference/complete-id-validation.md) method of the same SRC network to complete the validation of a Consumer Identity, by evaluating the supplied OTP.

Diagram repeateduser_newdevice_lookup_2

## Step 3: Get SRC Profiles {#step-3-get-src-profiles}

1. If the consumer validation is successful, the Click to Pay System returns the [federated ID token](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md#id-token) and the [recognition token](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/support/index.md#click-to-pay), which you should secure for future recognized checkouts.

2. Call the [getSrcProfile()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/get-src-profile/index.md) and provide the federated ID token to individual SRC networks to fetch the card list. The [getSrcProfile()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/get-src-profile/index.md) method takes the list of [federated ID(idTokens)](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step4/index.md) and returns Click to Pay profile data to the Integrator along with the `srcCorrelationId`. Where required, the same `srcCorrelationId` must be used in the JS method/API calls for that transaction to link the calls together.

3. Retrieve and display the masked consumer details and masked card details stored with this Click to Pay profile on different Click to Pay Systems.

Diagram repeateduser_newdevice_completevalidation_2 Note: It is a good practice to review the [UI guide](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/returninguser_unrecognized_ui/index.md) which contains the Best Practices and UX recommendations.

## Step 4: Checkout {#step-4-checkout}

1. The consumer selects a card from the list of cards in their Click to Pay profile.

2. Integrator will use the `maskedcard` and `srcCorrelationId` and call the [checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) method of the JS Library which will load the network specific DCF. Choose from one of the following screens:   

   If you have opted into Mastercard Installments Services and the consumer selects a card that has installment plans available, then a list of installment plans display in the loading screen. The consumer may select an installment plan from the list or may defer to the standard 'payment in full' option.  

   For more information, see [Mastercard Installments Services](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/value-added-services/installments-services/index.md). Opt for Transaction Authentication by passing `payloadRequested` = 'AUTHENTICATED' under [authenticationPreferences](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#authentication-preferences). Open a center-aligned pop-up (new window) and pass the `windowRef` to Mastercard. If opted, the user will go through the passkey-based authentication to verify the transaction.
   * Read the Transaction Authentication [use cases](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/click-to-pay/use-case1/index.md).  
   * Follow the integration steps in the [tutorial](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step5/index.md).
   * Depending on the values set in `com.mastercard.dcfExperience` in [customInputData](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#custom-input-data) object, either a DCF screen, or a loading screen will show up.   

   * When calling the [checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) method, the Integrators can pass [consumer](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#consumer) information to populate it in the DCF screen without the need for the consumer to re-enter the same details.

   * When the required address fields are not set, Click to Pay system collects this information from the payload and prompts user to 'Confirm' on a DCF before completing the checkout. The values in the [customInputData](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#custom-input-data) parameter handle this.

3. Choose from one of the following options to receive the full payload in the [checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) response or not:   

   ### Receive full payload in checkout() method {#receive-full-payload-in-checkout-method}

   `payloadTypeIndicatorCheckout` is set to `FULL`.
   * Receive a full payload contained in the `payload` object.
   * Decrypt the payload using the private key from the [Payload Encryption public/private key pair](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md) and send the decrypted payload for authorization.
   * Call the [Confirmations API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#confirmations) to record the result of the transaction.

   ### Receive full payload in Checkout API {#receive-full-payload-in-checkout-api}

   `payloadTypeIndicatorCheckout` is set to `SUMMARY`. This is the default value if not provided by Integrator.
   * Receive the masked card and masked consumer information in `checkoutResponse`.
   * Call the [Checkout API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) to receive the full payload.

   <br />

4. Cardholder confirms the payment and once the transaction is authenticated, the order gets placed.

5. DCF (Digital Card Facilitator) will respond to the [checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) method of the SDK with `dcfActionCode = COMPLETE` and the `checkoutResponse` to the Integrator.

Note: Refer to the various DCF Fall Back Scenarios [here](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/returninguser_unrecognized_ui/index.md) which contains the Best Practices and UX recommendations. Diagram repeateduser_newdevice_checkout_2-TAS

## Step 5: Fetch and Decrypt Payload {#step-5-fetch-and-decrypt-payload}

1. Consumer reviews and confirms the order in the Order Review page.

2. Use the [POST /transactions/credentials](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) API to retrieve the transaction payload from Mastercard Click to Pay.

3. The response contains `encryptedPayload` object within the `checkoutResponseJWS` (a JWE in compact serializable form). The JWE content is signed and encrypted using the public part of the **Payload Encryption** key shared by the client at the time of onboarding. Example of an encryptedPayload object:

    "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.MIq_v15_eowvwX8MRgrb_H1EevZKB9CZSMMD8-lcbTjQvPFwAyx1USZbZRDB3RGfA_of6aDggnbmQmgsUStPQEpzYMma5mxlv5-VT6ry94xyttBFuCjBV0hudmcOEHiQeIiwS5xBb1iBPFaXTEmMpgDv8lvAm_ncbJ0V5FFDUYYVhK0-SbaODY5OKMdP2N3Y9bCkqjLCAcmkkN3mkrJ6WbzJURmNdfPyL344Cxc14NLZW3fk_yHkmjXybIXJWnUUsdxwFWS5ImwaZGEhbeLGGdpsPTkTkwD86uZCYJlx_dsZi02Vbm9AIiPpKE4L8GS_ltmOQ3YfgfxS6UuzYzaxKw.Xi3KLm7BvjSQuPMSVwSepg.U6Yp-DXd55F6jqy8-LIbmxmExzLaZNCF9Rcmg0g7ViUN3ydm_G5IqJmCFgXg1aO50HYJvnxi5OWG_rs6uV-1I2rrpu3bkuSjkj03N82yhFJBbhr8W_ahlgAMv2FPu4k7aeGp5rWm5lEdvH2UpSvKG2Ae111iFtL842Pk0pgPLOv4jnxFaCrvAPZ4vTvHS1RU27XGW7qXfAOtqpZ38oUJFamYueCIycDrsvacPT650O_JM_QS0ReXkH49bgAt1Sog9r2PY7fjU22ff1oGno51uVK_D9EXyHWcD4I5LYdVd6NenPDfycuQZ_wA98nqMCTzrqx5yQjUQDNYOoDF8ztoKVpYsTJeIUcFTpGXfoLLPTWjoIUds3mIyrXtBWO46rqN8c2nQ6FKC04-CBK9RGbWr1q1ENgfmsBvfXPCIUZ5ACzM1UaU2LkgEYlyiaxn-I3MfauP1adsA3ZOhrDHwSNgA0aVejT_9OTOaBUmywKGtdD7E8PhP7JqbMTXH2gM_9xU7t7TRvntE5uXeALKv4EDurn0p5bASwsYie7xWbsMHGF8lN0aGqJhNKiHL_NFGnR0wzPWS3UXFP7wZFbLM9qSPw.XFMSREEcssFqUM5kIwChIA"

4. Decrypt the payload using the private key from the **Payload Encryption** public/private key pair. Refer to [API Keys](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md) for details.

Note: If the Integrator opts for transaction authentication during the checkout() method, they will receive an authenticated payload. To learn more, see the [Integrate with Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step5/index.md) tutorial.

Diagram fetchtransactioncreds_2_TAS

## Step 6: View the Decrypted Payload {#step-6-view-the-decrypted-payload}

1. On decrypting the `encryptedPayload` field, you will see a JSON object containing transaction information.

2. Mastercard returns the payload in the most secure format possible and in accordance with the `DpaTransactionOptions.PaymentOptions.dynamicDataType` parameter passed in the [JavaScript Request](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#payment-options) ([checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) or [init()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/init/index.md) methods). The values in [dynamicDataType](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#payment-options) (`CARD_APPLICATION_SHORT_FORM`, `NONE`) derive the payload format returned by Mastercard. To learn more about the different payload formats, refer to the [Integrate with Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step8/index.md) tutorial.

Diagram encryption_decryption
Note: This information is related to Mastercard. For other networks, contact your PSP or Acquirer.

## Step 7: Payment Authorization {#step-7-payment-authorization}

Note: The API specification does not define requirements for transaction authorization. For more information about DSRP transactions, refer to:

* [DSRP --- Acquirer Implementation Guide](https://trc-techresource.mastercard.com/r/bundle/m_an5843/page/z/ndg1634167211641.html)
* [AN3363 --- Mandatory Use of Digital Payment Data Field for Remote Commerce Transactions with Cryptograms](https://trc-techresource.mastercard.com/r/bundle/m_an3363_en-us/page/d/en-US/jvw1585260985294.html)

1. When the consumer submits the order, the Integrator sends the decrypted payload for authorization to Mastercard Checkout Solutions.

2. For tokenized transactions, the response payload fields are passed in a Payment Authorization. For more details refer to the [Integrate with Click to Pay](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step8/index.md) tutorial.

## Step 8: Send Confirmation {#step-8-send-confirmation}

1. Using [POST /confirmations](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#confirmations) API, make the confirmations request to the Mastercard Checkout Solutions to record the result of the transaction. This call must be made irrespective of the transaction status.

Diagram paymentauthandconfirmation_2

Mastercard recommends the Integrator to send the Confirmation API calls for the below scenarios:

* Payload is received but no authorization is submitted.
* Payload is received and authorization is successfully completed.
* Order cancellation is submitted after successful authorization.
* When payload is received and authorization was declined.
* Refund is submitted.

|      Merchant Action       |               Events for an order               | Merchant Order Status | Confirmation API checkoutEventType | Confirmation API checkoutEventStatus |
|----------------------------|-------------------------------------------------|-----------------------|------------------------------------|--------------------------------------|
| No Authorization Submitted | Authorization will be submitted at a later time | Created               | 01 - Authorize                     | 01 - Created                         |
| Authorization Submitted    | Approval Code received                          | Approved              | 01 - Authorize                     | 02 - Confirmed                       |
| Authorization Submitted    | Order Cancelled -- reversal submitted           | Cancelled             | 04 - Cancel                        | 03 - Cancelled                       |
| Authorization Submitted    | No Approval Code received                       | Cancelled             | 01 - Authorize                     | 03 - Cancelled                       |
| Refund                     | Refund is processed                             | Refund                | 03 - Refund                        | 02 - Confirmed                       |

