# First Time User
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/use-cases/click-to-pay/firsttimeuser_usecase/index.md

Integrators can provide Click to Pay checkout for their consumers at multiple stages in a consumer's shopping journey. They can pass [consumer](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#consumer) and [billing information](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#address) along with `customInputData` and `confirmPayment` parameters of [init()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/init/index.md) to provide the most frictionless checkout experience.

In the scenario below, Mastercard DCF displays the consumer profile after performing necessary authentication to finish checkout without any consumer intervention.

![Passkey authentication for a new consumer](https://static.developer.mastercard.com/content/mastercard-checkout-solutions/documentation/images/clicktopay_newuser_passkey5.png "Passkey authentication for a new consumer")
Note:   

* The above use case is an example of an optimized checkout experience. You can tailor these recommendations to best suit your UI.  
* The passkey enrollment screen will display the consent-collection layout that is compliant to the specific country's legal regulation.

Integrator must perform the following actions after [setting up the JavaScript library](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step2/index.md).

## Step 1: Initialize the JS library and Check if Consumer is Recognized {#step-1-initialize-the-js-library-and-check-if-consumer-is-recognized}

1. DPA interacts with the Integrator(SRCI). Integrator invokes the methods of the JS library listed below.

2. On page load, call the [init()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/init/index.md) method to initialize the JS Library of each participating SRC network in Click to Pay.

3. Call the [isRecognized()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/is-recognized/index.md) method for each participating SRC network.

4. As this is the consumer's first time with Click to Pay, the consumer or the device are not recognized. A **'not recognized'** message is sent back to the Integrator.

Diagram initandisrecognized_2

## Step 2: Identity Lookup and Card Enrollment {#step-2-identity-lookup-and-card-enrollment}

1. Consumer chooses merchant's checkout and enters their email address, mobile number and shipping address for their Click to Pay profile.

2. Call the [identityLookup()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/identity-lookup/index.md) method of each participating SRC network. This method checks whether a specified Consumer Identity (email address or mobile phone number) is known to the Click to Pay System.

3. Once the Click to Pay System responds with `consumerPresent = false`, display the card enrollment screen.

4. The consumer enters their card number along with expiration date and security code (where required). Use the card PAN to determine which network the card belongs.

5. For Click to Pay-supported card brand, dynamically display Click to Pay trigger. Consumer selects Click to Pay and provides consent to be remembered on a device/browser in a merchant/shopping website. Capture the consumer's consent in [complianceSettings](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#compliance-settings) object.

Diagram identitylookup

## Step 3: Encrypt Card and Checkout {#step-3-encrypt-card-and-checkout}

1. Encrypt the card with [FPAN encryption key](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/key-management/index.md) using the steps outlined in this [tutorial](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/perform-encryption/index.md). Call the [checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) method to enroll the card and launch DCF.   

2. Use the `maskedcard` and `srcCorrelationId` to call the [checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) method of the JS Library which will load the network specific DCF. Choose from either of the following screens:   

   Opt for Transaction Authentication by passing `payloadRequested` = 'AUTHENTICATED' under [authenticationPreferences](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#authentication-preferences). Open a center-aligned pop-up (new window) and pass the `windowRef` to Mastercard. If opted, the user will complete the bank challenge to create a passkey, and go through the passkey-based authentication to verify the transaction.
   * Read the Transaction Authentication [use cases](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/click-to-pay/use-case1/index.md).  
   * Follow the integration steps in the [tutorial](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step5/index.md).
   * Depending on the values set in `com.mastercard.dcfExperience` in [customInputData](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#custom-input-data) object, either a DCF screen, or a loading screen will show up.   
   * When calling the [checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) method, pass [consumer](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/common-objects/index.md#consumer) information in the DCF screen without the need for the consumer to re-enter the same details.
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

Note: Ensure to review the various integration best practices and steps available in the [UI guide](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/first_time_ui/index.md). Diagram enrollacard_2

## Step 4: Confirm Consumer Details and Complete Checkout {#step-4-confirm-consumer-details-and-complete-checkout}

1. DCF will respond to the [checkout()](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/sdk-reference/checkout-method/index.md) method with `dcfActionCode` as `COMPLETE` and return the `checkoutResponse`, along with [recognition token](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/support/index.md#click-to-pay) to the Integrator. Secure the recognition token for future recognized checkouts.

2. Cardholder confirms the payment and once the transaction is authenticated, the order gets placed.

Diagram dcflaunchwithenrolledcard_2-TAS

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

