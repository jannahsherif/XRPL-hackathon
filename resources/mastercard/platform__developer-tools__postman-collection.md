# Postman Collection
source: https://developer.mastercard.com/platform/documentation/developer-tools/postman-collection/index.md

## Overview {#overview}

Postman is an API platform for building and using APIs. You can use it for functional tests, integration tests, regression tests, and more. This tutorial shows how to use Postman collections in the [Mastercard workspace on Postman](https://www.postman.com/mastercard/workspace/mastercard-developers/overview).

## Prerequisites {#prerequisites}

1. [Postman account](https://www.postman.com/) (Sign up or Log in),
2. [Mastercard Developers Project](https://developer.mastercard.com/account/log-in) with sandbox and/or production credentials.

## What You Will Learn {#what-you-will-learn}

* Set up the Postman Environment for Mastercard APIs
* Configure Authentication for Mastercard APIs
* Configure Payload Encryption for Mastercard APIs
* Invoke a Mastercard API from Postman

## Step 1 - Set Up the Postman Collection {#step-1---set-up-the-postman-collection}

Setting up a Postman collection for Mastercard's APIs can be done in 2 different ways.

1. Forking one of the collections hosted in the official Mastercard Postman workspace.
2. Importing one of Mastercard's API specifications into your local workspace.

You can choose either of these 2 methods:
* Navigate to the Postman Collection page in the documentation section of the Mastercard API you are interested in. Click: 'Run in Postman'. It will take you to the API in the Mastercard Postman workspace.

![Run in Postman button on the Mastercard API documentation page](https://static.developer.mastercard.com/content/platform/img/postmanwebapp/postman01.png "Run in Postman button")

* Click on '...' adjacent to the API's collection and select 'Create a Fork'.
* Add a label to your fork and the workspace in which you want to create the fork. Click 'Fork Collection'.
* This will fork the Mastercard API to your personal Postman workspace.
* Download the OpenAPI specification (.YAML) file. Here we are using the spec for Locations from [Mastercard Developers](https://developer.mastercard.com/locations/documentation/api-reference/).

![Downloaded Open API specification YAML file ready for import](https://static.developer.mastercard.com/content/platform/img/postmanapplication/postman05.png "Download API specification")

* In your Postman application, select "Import".

![Postman Import button in the application toolbar](https://static.developer.mastercard.com/content/platform/img/postmanapplication/postman_06.png "Postman Import button")

* From "File", click on the " Upload Files" option.

![Upload Files option in the Postman Import dialog](https://static.developer.mastercard.com/content/platform/img/postmanapplication/postman07.png "Upload Files option")

* "Import" your .YAML file. Postman automatically creates a collection from this file.

![YAML file imported as a Postman collection](https://static.developer.mastercard.com/content/platform/img/postmanapplication/postman08.png "Imported collection")

## Step 2 - Configure the Postman Environment {#step-2---configure-the-postman-environment}

Once the collection has been imported into your Postman workspace, you will need to set up the Postman environment.

* Go to the Environments tab of the Mastercard Developer Postman workspace. ![Environments tab in the Mastercard Developer Postman workspace](https://static.developer.mastercard.com/content/platform/img/postmanwebapp/postman_01.png "Postman Environments tab")
* If the API uses:
  * Mastercard encryption: Search for 'Mastercard API Sandbox Environment with Encryption'.
  * JWE encryption: Search for 'Mastercard API Sandbox Environment with JWE Encryption'.
  * No encryption: Search for 'Mastercard API Sandbox Environment'.
* Click on '...' adjacent to the API's environment and select 'Create a Fork'.
* Add a label to your fork and the workspace in which you want to create the fork. Click 'Fork Environment'.
* This will fork the "Mastercard API Sandbox Environment" to your personal Postman workspace.

## Step 3 - Setting Up the Base URL {#step-3---setting-up-the-base-url}

* Select the forked environment from the dropdown.

![Forked environment selected in the Postman environment dropdown](https://static.developer.mastercard.com/content/platform/img/encryption/config-env.png "Select forked environment")

* Set the `baseUrl` with the Sandbox URL value from your API specification under the 'Current value' field.

![baseUrl field set to the Sandbox URL in the Postman environment editor](https://static.developer.mastercard.com/content/platform/img/encryption/select-env.png "Set baseUrl value")

## Step 4 - Enabling Authentication {#step-4---enabling-authentication}

Mastercard supports 3 different authentication mechanisms, OAuth 1.0a, OAuth 2.0 / FAPI 2.0, and Mutual Transport Layer Security (MTLS). The type of authentication that is used will differ from service to service.
The authentication mechanism used by each service can be found in their respective documentation pages.

Depending on the authentication mechanism used by the service you wish to call, choose the relevant set of instructions from the following sections.

### If you imported an OpenAPI specification {#if-you-imported-an-openapi-specification}

If you imported an OpenAPI specification in Step 1 instead of forking from the Mastercard workspace, click on your collection, open the Authorization tab, and configure it with the following values:

```text
Type = OAuth 1.0
Add auth data to = Request Headers
Signature Method = RSA-SHA256
Consumer Key = {{consumerKey}}
Private Key = {{privateKey}}
In the Advanced section, check "Include body hash"
```

![OAuth 1.0a authorization settings configured in the Postman collection](https://static.developer.mastercard.com/content/platform/img/postmanapplication/postman13.png "OAuth 1.0a authorization configuration")

### Extract the private RSA key {#extract-the-private-rsa-key}

Run the following command to extract the private RSA key from the .p12 certificate that you downloaded as part of creating the project in Mastercard Developers.

```bash
openssl pkcs12 -in 'mykey.p12' | openssl rsa -out myrsa.key
```

When prompted, use the password or passphrase values of your .p12 file.

### Configure your Postman environment {#configure-your-postman-environment}

![Postman environment variables editor showing baseUrl, consumerKey, and privateKey fields](https://static.developer.mastercard.com/content/platform/img/postmanwebapp/postman_02.png "Postman environment variables")

* Set the `baseUrl` with the Sandbox URL value from your API specification under the 'Current value' field.

![consumerKey and privateKey fields populated in the Postman environment editor](https://static.developer.mastercard.com/content/platform/img/postmanwebapp/postman_04.png "Set consumerKey and privateKey")

* Set the `consumerKey` copied from your project dashboard under the 'Current value' field.
* Copy the contents of `myrsa.key` and paste them into the `privateKey` under the 'Current value' field.

### Understand the Postman flow {#understand-the-postman-flow}

Mastercard OAuth 2.0 uses FAPI 2.0 with `private_key_jwt` and DPoP. This means you must generate:

* a signed client assertion (`private_key_jwt`) to request the token
* a DPoP proof for the token request
* a new DPoP proof for every API call

Because of this, Postman's built-in OAuth 2.0 helper does not cover the full Mastercard flow by itself.

### Practical setup in Postman {#practical-setup-in-postman}

1. In Mastercard Developers, copy your `clientId`, `kid`, and service scopes, and download your authentication key.
2. Use the guidance in [Using OAuth 2.0 to Access Mastercard APIs](https://developer.mastercard.com/platform/documentation/authentication/using-oauth-2-to-access-mastercard-apis/index.md) or one of the OAuth 2.0 client libraries to generate:
   * a DPoP key pair
   * a signed `private_key_jwt`
   * a DPoP proof for the token request
   * a DPoP-bound access token
3. In Postman, store the resulting values in environment variables such as `accessToken` and, if needed for your workflow, the latest `dpopNonce`.
4. For requests that use OAuth 2.0, set the request authorization to **No Auth** and send the required headers directly.

Use these headers on the API request:

```text
Authorization = DPoP {{accessToken}}
DPoP = <signed_dpop_proof_for_this_request>
```

### Important notes {#important-notes}

* The access token must be sent with the `DPoP` scheme, not `Bearer`.
* You must generate a fresh DPoP proof for each request.
* If the API or authorization server returns a `DPoP-Nonce` header, use that nonce when generating the next DPoP proof.

For the full token request flow, DPoP proof requirements, and troubleshooting steps, see [Using OAuth 2.0 to Access Mastercard APIs](https://developer.mastercard.com/platform/documentation/authentication/using-oauth-2-to-access-mastercard-apis/index.md).

### Add your client certificate to Postman {#add-your-client-certificate-to-postman}

Note: MTLS is not currently supported through the Postman webapp, you must use the Postman application.

* Open the settings within the Postman application and select 'Certificates'

![Postman application settings with the Certificates tab selected](https://static.developer.mastercard.com/content/platform/img/postmanwebapp/postman_05.png "Postman Certificates settings")

* Under 'Client Certificates', click 'Add Certificate'

![Add Certificate form under Client Certificates in Postman settings](https://static.developer.mastercard.com/content/platform/img/postmanwebapp/postman_06.png "Add Client Certificate form")

* Enter the hostname (Host) for the service you wish to test (e.g. sandbox.api.mastercard.com)
* Select the CRT file and the Key file OR select the PFX file for the certificate you uploaded to Mastercard Developers while creating your project.
* Enter the passphrase of your certificate and click 'Add'.

## Step 5 - Enabling Encryption {#step-5---enabling-encryption}

Note: Not all Mastercard services use encryption. If the service you are trying to call does not use encryption, this step can be skipped.

Mastercard supports 2 different types of encryption, Mastercard encryption and JWE encryption. The type of encryption that is used will differ from service to service.
The type of encryption used by each service can be found in their respective documentation pages.
If you imported an OpenAPI specification in Step 1 instead of forking from the Mastercard workspace, then do the following:

1. Click on your collection, navigate to the `Pre-request Script` tab and paste the following code:

* Js

```js
const { v4: uuidv4 } = require('uuid');
const nonce = uuidv4();
var timestamp = (new Date().getTime() / 1000).toFixed(0);
pm.environment.set("nonce", nonce);
pm.environment.set("timestamp", timestamp);
// Fetch the Mastercard encryption library and store it in the environment.
if(!pm.environment.get("encryptionScript")){
  pm.sendRequest("https://github.com/Mastercard/postman-encryption-lib/releases/latest/download/mastercard-postman-encryption-lib.min.js", function (err, response) {
    if (err) {
      console.log(`Error downloading script: ${err}`);
      return;
    }
    pm.environment.set("encryptionScript", response.text());
    console.log("Encryption script downloaded")
  })
}
```

2. Now, click on the request/folder that needs encryption, navigate to the `Pre-request Script` tab and paste the following code:

* Js

```js
eval(pm.environment.get("encryptionScript"));
encryptRequest(pm.environment.get("encryptionType"), pm);
```

Depending on the type of encryption used by the service you wish to call, choose the relevant set of instructions from the following sections.
* Navigate to the forked environment from step 2.
* Set the `consumerKey` copied from your project dashboard under the 'Current value' field.
* Copy the contents of the `myrsa.key` file into `privateKey` under the 'Current value' field.
* Set the `publicKeyFingerprint` copied from your project dashboard from the `fingerprint` section.
* Copy the contents of the encryption certificate created during project creation to `encryptionCert`.
* Set `encryptionType` to `mce`.
* Set `pathToRawData`, `pathToEncryptedData`, `encryptedValueFieldName`, `ivFieldName`, `dataEncoding`, `resourcePath` and `oaepPadding` according to the project documentation.
* Navigate to the forked environment from step 2.
* Set the `consumerKey` copied from your project dashboard under the 'Current value' field.
* Copy the contents of the `myrsa.key` file into `privateKey` under the 'Current value' field.
* Set the `publicKeyFingerprint` copied from your project dashboard from the `fingerprint` section.
* Copy the contents of the encryption certificate created during project creation to `encryptionCert`.
* Set `encryptionType` to `jwe`.
* Set `pathToRawData`, `pathToEncryptedData` and `encryptedValueFieldName` according to the project documentation.

## Step 6 - Invoke a Mastercard API from Postman {#step-6---invoke-a-mastercard-api-from-postman}

Choose any request in the collection and click **Send**. If your environment, authentication, and encryption settings are configured correctly, you should receive a successful response.

![Successful Postman API request response](https://static.developer.mastercard.com/content/platform/img/postmanwebapp/postman_03.png "Successful Postman API request response")

If the request fails, re-check the selected environment, base URL, authentication method, and any encryption-specific values required by the API.
