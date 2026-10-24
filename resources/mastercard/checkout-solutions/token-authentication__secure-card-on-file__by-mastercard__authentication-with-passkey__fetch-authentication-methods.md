# Fetch Authentication Methods
source: https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-mastercard/authentication-with-passkey/fetch-authentication-methods/index.md

To initiate authentication, you must retrieve the list of authentication methods applicable for a payment card.

Use [Lookup Cardholder Authentication Methods](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#authentication) API to retrieve the supported authentication methods, and determine the eligibility for Multi-factor Authentication (MFA) and merchant Fraud Liability Protection (FLP).
Diagram taf-lookup-auth-methods

The `authenticationMethodType` field can take one of the following values:

|        **Value**         |                                                                  **Description**                                                                  |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `SMS_OTP`                | A one-time password (OTP) is sent to the cardholder's phone number registered with the issuer.                                                    |
| `EMAIL_OTP`              | A one-time password (OTP) is sent to the cardholder's email address registered with the issuer.                                                   |
| `ISSUER_RBA`             | Risk-based authentication evaluated by the issuer. This may result in a frictionless approval or the issuer declining the authentication request. |
| `APP_AUTHENTICATION`     | The issuer's mobile banking app is launched by the integrator using a deep link or Android intent, with an appended integrator callback URL.      |
| `APP_PUSH_NOTIFICATION`  | The issuer's mobile banking app is launched when the cardholder interacts with a push notification sent by the issuer.                            |
| `ONBEHALF_ISSUER_IDV`    | A Mastercard-hosted experience that facilitates identity verification (ID\&V) based on the consumer's interaction channel.                        |
| `MANAGED_AUTHENTICATION` | Authentication facilitated by Mastercard.                                                                                                         |
| `FIDO2`                  | Authentication using FIDO2 standards, typically leveraging passkeys or other device-based authenticators.                                         |
| `3DS`                    | Authentication conducted through the 3-D Secure protocol.                                                                                         |

## Probabilistic Mastercard Passkey Availability Assessment {#probabilistic-mastercard-passkey-availability-assessment}

When the `authenticationMethodType` is set to **FIDO2 (Mastercard Passkeys)** , the [Lookup API](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/api-reference/apis/index.md#lookupAccountHolderAuthenticationProfile) response includes an additional object called `authenticators`.

This object contains a child property named `status`, which can return one of the following values:

* `LIKELY_AVAILABLE`

* `PENDING_VERIFICATION`

Based on the returned status, the integrator should determine the appropriate next step in the user journey as outlined below:

| **Probabilistic Assessment `status`** |                                                                                                                                                                      **Recommended Next Steps for User Journey**                                                                                                                                                                      |
|---------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `PENDING_VERIFICATION`                | The cardholder is a good candidate to **register MFA** by invoking the **Auth UI** with `AUTHENTICATOR_REGISTRATION`, followed by completing **Cardholder ID\&V** . *(See [ID\&V guidance](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-mastercard/authentication-with-passkey/create-passkey/index.md))* |
| `LIKELY_AVAILABLE`                    | The cardholder is a good candidate to **proceed with TRANSACTION_AUTHENTICATION** . *(See [Using Passkey](https://developer.mastercard.com/mastercard-checkout-solutions/documentation/token-authentication/secure-card-on-file/by-mastercard/authentication-with-passkey/use-passkey-for-ta/index.md))*                                                                              |

