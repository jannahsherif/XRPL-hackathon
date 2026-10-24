# APIs
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md

Warning: For cards issued in **India** , Integrators must use the API URL endpoints applicable for **India region**. Please note that use of incorrect URLs will lead to failure of API calls.

## Registration {#registration}

* Sandbox
* Production

```Sandbox
https://sandbox.api.mastercard.com/src/onboarding
```

```Production
https://api.mastercard.com/src/onboarding
```


API Specification: `https://static.developer.mastercard.com/content/mastercard-checkout-solutions/swagger/dpa_registration_v1.yaml`

Note: The *{src client id}* placeholder in the path should be your SRC Client ID provided in the [Project Dashboard](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/onboarding-sandbox/step6/index.md).

## Card {#card}

* Sandbox-Global
* Production-Global
* Sandbox-India
* Production-India

```Sandbox-Global
https://sandbox.api.mastercard.com/src/api/digital/payments
```

```Production-Global
https://api.mastercard.com/src/api/digital/payments
```

```Sandbox-India
https://sandbox.api.mastercard.co.in/src/api/digital/payments
```

```Production-India
https://api.mastercard.co.in/src/api/digital/payments
```

Note: Refer to [Card Encryption](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/perform-encryption/index.md) tutorial for details on how to encrypt a sample unencrypted **card** object.
API Specification: `https://static.developer.mastercard.com/content/mastercard-checkout-solutions/swagger/card_v1.yaml`

## Cards Batch Enrollment {#cards-batch-enrollment}

* Sandbox
* Production

```Sandbox
https://sandbox.api.mastercard.com/src/api/digital/payments
```

```Production
https://api.mastercard.com/src/api/digital/payments
```


API Specification: `https://static.developer.mastercard.com/content/mastercard-checkout-solutions/swagger/card_batch_enrollment_scof_v1.yaml`

## Notifications {#notifications}


API Specification: `https://static.developer.mastercard.com/content/mastercard-checkout-solutions/swagger/notifications_v1.yaml`

## Checkout {#checkout}

* Sandbox-Global
* Production-Global
* Sandbox-India
* Production-India

```Sandbox-Global
https://sandbox.api.mastercard.com/src/api/digital/payments
```

```Production-Global
https://api.mastercard.com/src/api/digital/payments
```

```Sandbox-India
https://sandbox.api.mastercard.co.in/src/api/digital/payments
```

```Production-India
https://api.mastercard.co.in/src/api/digital/payments
```


API Specification: `https://static.developer.mastercard.com/content/mastercard-checkout-solutions/swagger/checkout_c2p_v1.yaml`


API Specification: `https://static.developer.mastercard.com/content/mastercard-checkout-solutions/swagger/checkout_scof_v1.yaml`


API Specification: `https://static.developer.mastercard.com/content/mastercard-checkout-solutions/swagger/checkout_qr_v1.yaml`

Note: Refer to [Card Encryption](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/perform-encryption/index.md) tutorial for details on how to encrypt a sample unencrypted **card** object.
API Specification: `https://static.developer.mastercard.com/content/mastercard-checkout-solutions/swagger/checkout_gc_v1.yaml`


API Specification: `https://static.developer.mastercard.com/content/mastercard-checkout-solutions/swagger/checkout_mvct_v1.yaml`

## Confirmations {#confirmations}

* Sandbox
* Production

```Sandbox
https://sandbox.api.mastercard.com/src/api
```

```Production
https://api.mastercard.com/src/api
```


API Specification: `https://static.developer.mastercard.com/content/mastercard-checkout-solutions/swagger/checkout1.0.yaml`

View `checkoutEventType` and `checkoutEventStatus` field values required for [different scenarios](https://developer.mastercard.com/mastercard-checkout-solutions/tutorial/integrate_apis/step10/index.md#view-checkouteventtype-and-checkouteventstatus-field-values-required-for-different-scenarios) to be sent for this API call.

## Authentication {#authentication}

<br />

* Sandbox-Global
* Production-Global
* Sandbox-India
* Production-India

```Sandbox-Global
https://sandbox.api.mastercard.com/src/api
```

```Production-Global
https://api.mastercard.com/src/api
```

```Sandbox-India
https://sandbox.api.mastercard.co.in/src/api
```

```Production-India
https://api.mastercard.co.in/src/api
```


API Specification: `https://static.developer.mastercard.com/content/mastercard-checkout-solutions/swagger/authentication_v1.yaml`

<br />

Note: MTLS authentication protocol is currently available for [Enroll Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card), [Get Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card), [Card Notifications](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#notifications) and [Checkout](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#checkout) APIs.   
The domain URLs for MTLS are listed in [API basics](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-basics/index.md) section. Work with your [Mastercard representative](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/support/index.md#get-help) for more details.

## Click to Pay {#click-to-pay}

* Sandbox
* Production

```Sandbox
https://sandbox.api.mastercard.com/src/api/digital
```

```Production
https://api.mastercard.com/src/api/digital
```


API Specification: `https://static.developer.mastercard.com/content/mastercard-checkout-solutions/swagger/precheckout-b2b.yaml`

