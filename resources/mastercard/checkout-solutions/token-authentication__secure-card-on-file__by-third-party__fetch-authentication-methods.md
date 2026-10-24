# Fetch Authentication Methods
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-third-party/fetch-authentication-methods/index.md

To initiate authentication, you must retrieve the list of authentication methods applicable for a payment card.

Use [Lookup Cardholder Authentication Methods](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) API to retrieve the supported authentication methods, and determine the eligibility for Multi-factor Authentication (MFA) and merchant Fraud Liability Protection (FLP).
Diagram taf-lookup-auth-methods

The possible values for `authenticationMethodType` are SMS_OTP, EMAIL_OTP, ONBEHALF_ISSUER_IDV, MANAGED_AUTHENTICATION, FIDO2, and 3DS.

For example, `authenticationMethodType`= SMS_OTP indicates that you can perform authentication for this card with Issuer-facilitated OTP sent over SMS (via MDES).
Note: To determine the eligibility for Multi-factor Authentication (MFA) and merchant Fraud Liability Protection (FLP), you can also leverage our [Enroll Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) and [Get Card](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#card) APIs.
