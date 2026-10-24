# OAuth Keys
source: https://developer.mastercard.com/platform/documentation/credential-management/oauth-key-management/index.md

## Overview {#overview}

OAuth keys are credentials your application uses to authenticate with Mastercard APIs. This guide covers managing OAuth keys: adding, rotating, renewing, revoking, and upgrading.

## OAuth 1.0a and OAuth 2.0 {#oauth-10a-and-oauth-20}

Mastercard Developers supports two versions of OAuth: OAuth 1.0a and OAuth 2.0. The main difference is how they handle authentication:

* OAuth 1.0a signs each API request with your private key. The signature is included in the `Authorization` header along with your consumer key.
* OAuth 2.0 exchanges a signed JWT (JSON Web Token) for a short-lived access token. The JWT includes your client ID and key ID (kid), which identifies the specific public key used for verification.

<br />

Both methods use key pairs. You keep the private key secure on your side and use it to create signatures. Mastercard holds the corresponding public key to verify those signatures.
Note: For detailed information on how OAuth authentication works, see [Using OAuth 1.0a to Access Mastercard APIs](https://developer.mastercard.com/platform/documentation/authentication/using-oauth-1a-to-access-mastercard-apis/index.md) or [Using OAuth 2.0 to Access Mastercard APIs](https://developer.mastercard.com/platform/documentation/authentication/using-oauth-2-to-access-mastercard-apis/index.md).

You can find your OAuth keys in your Mastercard Developers project, along with their identifiers:

* Consumer key: identifies your application in OAuth 1.0a
* Client ID: identifies your application in OAuth 2.0
* Key ID (kid): identifies which specific public key to use for verifying your OAuth 2.0 signatures

## Adding a New Key {#adding-a-new-key}

Adding a key involves creating a private/public key pair. You generate the private key, and Mastercard certifies the public key.

Start by accessing your project:

1. Open your Mastercard Developers project
2. Navigate to **Sandbox credentials** or **Production credentials** , then click **Add project key**

![Add project key button](https://static.developer.mastercard.com/content/platform/img/oauth-keys/add-oauth-key.png)

### Method 1: Generate a New Private Key {#method-1-generate-a-new-private-key}

When you choose this option, your browser generates the private key and downloads it for you. Mastercard never sees your private key.

1. Select **Generate a new private key** and click **Proceed** ![Generate a new private key](https://static.developer.mastercard.com/content/platform/img/oauth-keys/generate-a-new-private-key.png)
2. Enter a key alias and keystore password, then click **Create key** ![Key alias and password](https://static.developer.mastercard.com/content/platform/img/oauth-keys/generate-a-new-private-key-alias-and-password.png)

### Method 2: Use an Existing Private Key (CSR File) {#method-2-use-an-existing-private-key-csr-file}

A CSR (Certificate Signing Request) contains your public key. You generate it locally using your private key, then submit it to Mastercard for certification. For CSR requirements, see [CSR Requirements](https://developer.mastercard.com/platform/documentation/security-and-authentication/csr-requirements/index.md).

1. Select **Use an existing private key** and click **Proceed** ![Use an existing private key](https://static.developer.mastercard.com/content/platform/img/oauth-keys/use-an-existing-private-key.png)
2. Enter a key alias, upload your CSR file, then click **Create key** ![Key alias and CSR](https://static.developer.mastercard.com/content/platform/img/oauth-keys/use-an-existing-private-key-alias-and-csr.png)

### Method 3: Paste in a CSR File {#method-3-paste-in-a-csr-file}

This method is similar to Method 2 but allows you to paste the CSR content directly when you cannot upload a file.

1. Select **Paste in a CSR file** and click **Proceed** ![Paste in a CSR file](https://static.developer.mastercard.com/content/platform/img/oauth-keys/paste-in-a-csr-file.png)
2. Enter a key alias, paste your CSR content, then click **Create key** ![Key alias and CSR](https://static.developer.mastercard.com/content/platform/img/oauth-keys/paste-in-a-csr-file-key-alias-and-csr.png)

Note: A project can have a maximum of 3 OAuth 2.0 keys at any time. If you reach this limit, revoke an unused key before adding a new one.

## Managing an Expiring Key (OAuth 1.0a) {#managing-an-expiring-key-oauth-10a}

Managing your expiring OAuth 1.0a key before it expires helps avoid integration interruptions.

1. Open your Mastercard Developers project with the expiring key
2. Find the expiring key on the credentials screen
3. Click **Rotate key** under the "**⋮** " menu ![Rotate project key action](https://static.developer.mastercard.com/content/platform/img/oauth-keys/rotate-project-key.png)

### Method 1: Rotate Key (Recommended) {#method-1-rotate-key-recommended}

Rotating creates a new key alongside your existing key. You update your application to use the new key before the old one expires, then revoke the old key.

1. Click **Rotate key (recommended)** , click **Proceed** , and follow one of the methods described in [Adding a New Key](https://developer.mastercard.com/platform/documentation/credential-management/oauth-key-management/index.md#adding-a-new-key) ![Rotate key (recommended)](https://static.developer.mastercard.com/content/platform/img/oauth-keys/rotate-key-recommended.png)
2. Save your credentials in a safe place
3. Update your code/configuration to use the new key before the old one expires
4. Revoke the old key after you successfully switched to the new one (see [Revoking a Key](https://developer.mastercard.com/platform/documentation/credential-management/oauth-key-management/index.md#revoking-a-key))

### Method 2: Renew Key {#method-2-renew-key}

Renewing extends the validity of the certificate for your expiring key. This avoids code or configuration changes but is less secure than rotating.

1. Select **Renew key** and click **Proceed** ![Renew key](https://static.developer.mastercard.com/content/platform/img/oauth-keys/renew-key.png)
2. Click **Confirm** to extend the certificate validity

Warning: Reusing a key by extending its certificate is less secure than rotating it. This option is only available for OAuth 1.0a keys. Rotate keys when possible.

## Managing an Expiring Key (OAuth 2.0) {#managing-an-expiring-key-oauth-20}

For OAuth 2.0 keys, there is no rotate option. Instead, you add a new key and switch to it before the old one expires.

1. Open your Mastercard Developers project with the expiring key
2. Navigate to **Sandbox credentials** or **Production credentials** , then click **Add project key** ![Add project key button](https://static.developer.mastercard.com/content/platform/img/oauth-keys/add-oauth-key.png)
3. Follow one of the methods described in [Adding a New Key](https://developer.mastercard.com/platform/documentation/credential-management/oauth-key-management/index.md#adding-a-new-key)
4. Save your credentials in a safe place
5. Update your code/configuration to use the new key before the old one expires
6. Revoke the old key after you successfully switched to the new one (see [Revoking a Key](https://developer.mastercard.com/platform/documentation/credential-management/oauth-key-management/index.md#revoking-a-key))

## Revoking a Key {#revoking-a-key}

Revoking unused keys prevents them from being used after rotation and stops expiration notifications.

To revoke a key:

1. Open your Mastercard Developers project
2. Find the key to revoke on the credentials screen
3. Click **Revoke key** under the "**⋮**" menu
4. Confirm you selected the correct key, then enter "REVOKE" and click **Revoke** ![Revoke project key action](https://static.developer.mastercard.com/content/platform/img/oauth-keys/revoke-project-key.png)

## Upgrading Keys to OAuth 2.0 {#upgrading-keys-to-oauth-20}

If your Mastercard Developers project uses OAuth 1.0a *and* the APIs in your project support OAuth 2.0, you can upgrade your project to support both authentication methods.

To upgrade:

1. Open your Mastercard Developers project
2. Navigate to **Summary**
3. Click **Upgrade to OAuth 2.0** and then **Proceed** ![Upgrade project to OAuth 2.0](https://static.developer.mastercard.com/content/platform/img/oauth-keys/upgrade-project-to-oauth2.png)
4. All existing and future keys in the project can be used with both OAuth 1.0a and OAuth 2.0 ![Upgraded key](https://static.developer.mastercard.com/content/platform/img/oauth-keys/upgraded-key.png)

## Key Formats {#key-formats}

When generated by your browser, your private key is encrypted in a PKCS#12 password-protected file. Here are commands for exporting RSA keys to alternative formats.

### PKCS#1 PEM {#pkcs1-pem}

To export your key to a PKCS#1 PEM file (`BEGIN RSA PRIVATE KEY`):

```bash
openssl pkcs12 -in key.p12 -nodes | openssl rsa -outform pem -out pkcs1-key.pem
```

### PKCS#8 PEM {#pkcs8-pem}

To export your key to a PKCS#8 PEM file (`BEGIN PRIVATE KEY`):

```bash
openssl pkcs12 -in key.p12 -nodes | openssl pkcs8 -topk8 -nocrypt -out pkcs8-key.pem
```

### Binary DER-encoded PKCS#8 {#binary-der-encoded-pkcs8}

To export your key to a raw PKCS#8 file (binary):

```bash
openssl pkcs12 -in key.p12 -nodes | openssl rsa -outform der -out pkcs8-key.der
```

Warning: Always keep your private signing keys safe in a password-protected or hardware key store.

## Frequently Asked Questions {#frequently-asked-questions}

Yes, key owners and project admins will get notifications 90, 60, 30, 15, 7, and 1 day(s) before the key expires. Upon expiration, key owners and project admins will receive an additional email, indicating that the key is no longer valid. OAuth keys generated through Mastercard Developers are valid for 13 months.
