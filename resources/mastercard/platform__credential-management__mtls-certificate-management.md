# mTLS Certificates
source: https://developer.mastercard.com/platform/documentation/credential-management/mtls-certificate-management/index.md

## Overview {#overview}

This guide walks through the basics of managing mTLS certificates for a Mastercard Developers project. This includes adding, rotating, and revoking certificates.

For more technical details about mTLS on Mastercard Developers, check out our [Using mTLS to Access Mastercard APIs](https://developer.mastercard.com/platform/documentation/authentication/using-mtls-to-access-mastercard-apis/index.md) guide.

## Add mTLS Certificate {#add-mtls-certificate}

You can add mTLS certificates to your Mastercard Developers project, using the four methods below. In all four methods, the new mTLS certificate will be signed by the Mastercard Certificate Authority or one of our Trusted Certificate Authorities.

### Method 1 - Generate a new private key {#method-1---generate-a-new-private-key}

If you choose to have Mastercard generate a private key for you, a new private key and CSR will be generated in your browser for obtaining an mTLS certificate from the Mastercard Certificate Authority.

Here are the steps:

1. Open your Mastercard Developers project   

2. Open the "Sandbox credentials" or "Production credentials" screen, depending on which environment the certificate will be used for, and click the *Add certificate* button.  
   ![Step 2: Add mTLS cert button](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-add-mtls-cert-1.png)
3. Select the *Generate a new private key* option.  
   ![Step 3: Generate a new private key](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-add-mtls-cert-2.png)
4. Enter a certificate alias and keystore password and create the certificate.  
   ![Step 4: Add cert alias and keystore password](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-add-mtls-cert-3.png)
5. Find the new certificate on the "Sandbox credentials" or "Production credentials" screen.  

### Method 2 - Upload a CSR {#method-2---upload-a-csr}

You can choose to upload a CSR to obtain a mTLS certificate from the Mastercard Certificate Authority.

Here are the steps:

1. Open your Mastercard Developers project   

2. Open the "Sandbox credentials" or "Production credentials" screen, depending on which environment the certificate will be used for, and click the *Add certificate* button.  
   ![Step 2: Add mTLS cert button](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-add-mtls-cert-1.png)
3. Select the *Upload a CSR* option.  
   ![Step 3: Upload a CSR](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-add-mtls-cert-4.png)
4. Enter a certificate alias, upload your CSR file, and create the certificate.  
   ![Step 4: Add certificate alias and upload CSR file](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-add-mtls-cert-5.png)
5. Find the new certificate on the "Sandbox credentials" or "Production credentials" screen.  

### Method 3 - Paste in a CSR {#method-3---paste-in-a-csr}

If you want to use an existing mTLS certificate but are not able to upload it, you can choose to paste in a CSR to obtain a mTLS certificate from the Mastercard Certificate Authority.

Here are the steps:

1. Open your Mastercard Developers project   

2. Open the "Sandbox credentials" or "Production credentials" screen, depending on which environment the certificate will be used for, and click the *Add certificate* button.  
   ![Step 2: Add mTLS cert button](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-add-mtls-cert-1.png)
3. Select the *Paste in a CSR* option.  
   ![Step 3: Paste in a CSR](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-add-mtls-cert-6.png)
4. Enter a certificate alias, paste in your CSR, and create the certificate.  
   ![Step 4: Add certificate alias and paste in CSR](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-add-mtls-cert-7.png)
5. Find the new certificate on the "Sandbox credentials" or "Production credentials" screen.  

### Method 4 - Upload an Existing mTLS Certificate {#method-4---upload-an-existing-mtls-certificate}

You can choose to upload an existing mTLS certificate that is signed by one of [Mastercard's Trusted Certificate Authorities.](https://developer.mastercard.com/platform/documentation/authentication/using-mtls-to-access-mastercard-apis/index.md#3-uploading-a-certificate-from-a-supported-ca)

Here are the steps:

1. Open your Mastercard Developers project   

2. Open the "Sandbox credentials" or "Production credentials" screen, depending on which environment the certificate will be used for, and click the *Add certificate* button.  
   ![Step 2: Add mTLS cert button](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-add-mtls-cert-1.png)
3. Select the *Upload mTLS certificate* option.  
   ![Step 3: Upload mTLS certificate](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-add-mtls-cert-8.png)
4. Enter a certificate alias, upload your certificate, and add the certificate.  
   ![Step 4: Add certificate alias and paste in CSR](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-add-mtls-cert-9.png)
5. Find the new certificate on the "Sandbox credentials" or "Production credentials" screen.  

## Manage Expiring Certificate {#manage-expiring-certificate}

When you have an expiring mTLS certificate, you must rotate the certificate by creating a new one and updating your application to use the new certificate. You will need to rotate your certificate before it expires to prevent your integration from being interrupted.

1. Open your Mastercard Developers project with the expiring mTLS certificate   

2. Follow the steps above to [add the new mTLS certificate](https://developer.mastercard.com/platform/documentation/credential-management/mtls-certificate-management/index.md#add-mtls-certificate). Any of the four add certificate methods are acceptable.   

3. Update your code to use the new certificate. To avoid service interruptions, make sure to update your code before the existing certificate expires.
4. Finally, we recommend revoking the unused certificate after you have successfully switched to the new certificate.

### Renewing Expiring Certificates Obtained Outside Mastercard Developers {#renewing-expiring-certificates-obtained-outside-mastercard-developers}

When renewing an expiring certificate obtained through Mastercard's Key Management Portal (KMP) or another external portal from a valid issuing CA, you must change one or more attributes in the Distinguished Name (DN) so it does not match the DN of the expiring certificate.

* Example: The Common Name (CN) value could change from `example-1682563200` in the expiring certificate to `example-1682566800` in the renewed certificate.   

After renewal, you must follow the certificate rotation steps above to upload the certificate to your project and update your code to use it. If the DN is not unique, the upload will fail with a duplicate certificate error.

## Revoke mTLS Certificate {#revoke-mtls-certificate}

If you have an mTLS certificate you're no longer using, you can revoke it to ensure it's not usable and you don't receive the expiration notifications.

You can revoke an mTLS certificate using the following steps:

1. Open your Mastercard Developers project with the mTLS certificate you want to revoke.   

2. Find the certificate on the "Sandbox credentials" or "Production credentials" screen and click *Revoke certificate* under the *Manage* menu. ![Step 2: Revoke Cert in dropdown](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-revoke-mtls-cert-1.png)
3. Confirm you've selected the correct certificate, enter "REVOKE" in the text field and click the *Revoke* button.  
   ![Step 3: Confirm revoke cert](https://static.developer.mastercard.com/content/platform/img/keyrenewaldocs/20250711-revoke-mtls-cert-2.png)
4. Your certificate has now been revoked.

## FAQs {#faqs}

mTLS certificates generated through Mastercard Developers are valid for about 13 months. Exact dates may vary, so please make sure to check the expiration date on the Credential Management screen after you generate your certificate.
