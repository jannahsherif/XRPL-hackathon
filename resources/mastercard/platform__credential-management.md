# Credential Management
source: https://developer.mastercard.com/platform/documentation/credential-management/index.md

Your Mastercard Developers project uses different types of credentials depending on which APIs you integrate with and how you authenticate. This guide covers how to add, rotate, renew, and revoke these credentials.

## OAuth Keys {#oauth-keys}

OAuth keys are signing keys your application uses to authenticate with Mastercard APIs. You can manage OAuth 1.0a and OAuth 2.0 keys through your Mastercard Developers project.

[View OAuth Keys guide](https://developer.mastercard.com/platform/documentation/credential-management/oauth-key-management/index.md)

## Encryption and Signature Verification Keys {#encryption-and-signature-verification-keys}

Some APIs require additional encryption or client signature verification keys to secure sensitive data in API requests and responses.

[View Encryption and Signature Verification Keys guide](https://developer.mastercard.com/platform/documentation/credential-management/encryption-and-sig-ver-key-management/index.md)

## mTLS Certificates {#mtls-certificates}

mTLS (Mutual Transport Layer Security) certificates provide an additional layer of security by requiring both client and server to authenticate each other.

[View mTLS Certificates guide](https://developer.mastercard.com/platform/documentation/credential-management/mtls-certificate-management/index.md)

## FAQs {#faqs}

1. OAuth 1.0a key - follow [these steps](https://developer.mastercard.com/platform/documentation/credential-management/oauth-key-management/index.md#managing-an-expiring-key-oauth-10a)
2. OAuth 2.0 key - follow [these steps](https://developer.mastercard.com/platform/documentation/credential-management/oauth-key-management/index.md#managing-an-expiring-key-oauth-20)
3. mTLS certificate - follow [these steps](https://developer.mastercard.com/platform/documentation/credential-management/mtls-certificate-management/index.md#manage-expiring-certificate)
4. Encryption or signature verification key - follow [these steps](https://developer.mastercard.com/platform/documentation/credential-management/encryption-and-sig-ver-key-management/index.md#manage-expiring-key)
Please go to our main [Support page](https://developer.mastercard.com/support) and click the "Get Help" button to open a support ticket. Our API Support team will assist you in managing your credential to avoid any disruptions to your integration(s). Yes, key owner and project admins will get notifications 90, 60, 30, 15, 7, and 1 day(s) before a credential expires. Upon expiration, key owners and project admins will receive an additional email, indicating that the credential is no longer valid.
