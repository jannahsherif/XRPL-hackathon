# Insomnia Collection
source: https://developer.mastercard.com/platform/documentation/developer-tools/insomnia-collection/index.md

## Overview {#overview}

[Insomnia](https://insomnia.rest/) is an open-source API client for quickly sending REST requests to Mastercard APIs. Ready-to-use JSON packages in Insomnia allow you to test API calls without writing code.

The following steps will show you how to use Insomnia collections for an API.

## Prerequisites {#prerequisites}

* [Create a project](https://developer.mastercard.com/) on Mastercard Developers with sandbox and/or production credentials.

## Step 1 - Download Insomnia Application {#step-1---download-insomnia-application}

Download [Insomnia](https://insomnia.rest/download) for your operating system, then install and launch the application.

## Step 2 - Install the Mastercard Plugin for Insomnia {#step-2---install-the-mastercard-plugin-for-insomnia}

While integrating with Mastercard APIs, you can also try our plugin for [Insomnia](https://insomnia.rest/). Click the links below to browse the project.

|                      |                                                 ![Insomnia](https://static.developer.mastercard.com/content/platform/img/insomnia.svg)                                                  |                                                                                        |                                                                                        |                                                                                        |                                                                                        |                                                                                        |   |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|---|
| **Download/install** | [![insomnia-version](https://img.shields.io/npm/v/insomnia-plugin-mastercard.svg?style=flat&color=f99f1c&label=)](https://www.npmjs.com/package/insomnia-plugin-mastercard)             | ![blank-image](https://static.developer.mastercard.com/content/platform/img/blank.png) | ![blank-image](https://static.developer.mastercard.com/content/platform/img/blank.png) | ![blank-image](https://static.developer.mastercard.com/content/platform/img/blank.png) | ![blank-image](https://static.developer.mastercard.com/content/platform/img/blank.png) | ![blank-image](https://static.developer.mastercard.com/content/platform/img/blank.png) |   |
| **View on GitHub**   | [![insomnia-github-badge](https://img.shields.io/github/stars/mastercard/insomnia-plugin-mastercard.svg?label=&style=social)](https://github.com/Mastercard/insomnia-plugin-mastercard) |                                                                                        |                                                                                        |                                                                                        |                                                                                        |                                                                                        |   |

You can install the plugin in either of the following ways:
1. Open the [Insomnia plugin page](https://insomnia.rest/plugins/insomnia-plugin-mastercard).
2. Click **Install Plugin**.
3. Click **Open Insomnia** , then click **Install**.
1. Download the latest `insomnia-plugin-mastercard-{version}.zip` package from [GitHub Releases](https://github.com/Mastercard/insomnia-plugin-mastercard/releases).
2. In Insomnia, go to **Application \> Preferences \> Plugins**.
3. Click **Reveal Plugins Folder**.
4. Extract the ZIP file into the `plugins` folder.
5. Click **Reload Plugins**.

After installation, confirm that the Mastercard plugin appears in the Plugins tab.

## Step 3 - Import Data in Insomnia {#step-3---import-data-in-insomnia}

On your Insomnia dashboard, navigate to **Import \> Choose File** and import the Insomnia JSON file or files you downloaded for the API you want to test. If the API provides separate request and environment or workspace JSON files, import each of them.

![Insomnia Import](https://static.developer.mastercard.com/content/platform/img/insomnia/insomnia-import.png "Environment selector in Insomnia")

After the import completes, open the imported collection or workspace in Insomnia before configuring its environment values.
If you prefer to start from a ready-made Mastercard workspace instead of importing local files, you can import one of the published workspace templates.
1. Choose the workspace that matches your use case:
   * [OAuth 1.0a workspace](https://insomnia.rest/run/?label=Import%20Mastercard%20Workspace&uri=https://raw.githubusercontent.com/Mastercard/insomnia-plugin-mastercard/main/workspace/mastercard-apis-insomnia-workspace.json)
   * [JWE encryption workspace](https://insomnia.rest/run/?label=Import%20Mastercard%20Workspace&uri=https://raw.githubusercontent.com/Mastercard/insomnia-plugin-mastercard/main/workspace/mastercard-apis-with-jwe-encryption-insomnia-workspace.json)
2. Click **Run Import Mastercard Workspace**.
3. Open the imported Mastercard workspace in Insomnia.
1. In Insomnia, go to **Application \> Preferences \> Data**.
2. Click **Import Data** and choose **From URL**.
3. Paste one of the following URLs:
   * OAuth 1.0a: `https://raw.githubusercontent.com/Mastercard/insomnia-plugin-mastercard/main/workspace/mastercard-apis-insomnia-workspace.json`
   * JWE encryption: `https://raw.githubusercontent.com/Mastercard/insomnia-plugin-mastercard/main/workspace/mastercard-apis-with-jwe-encryption-insomnia-workspace.json`
4. Click **Fetch and Import**.
5. Open the imported Mastercard workspace in Insomnia.

After importing the workspace template, open the **Environments** menu and choose either **Sandbox** or **Production** before editing values.

![Environment selector in Insomnia](https://static.developer.mastercard.com/content/platform/img/insomnia/insomnia-9.png "Environment selector in Insomnia")

## Step 4 - Configure Environment {#step-4---configure-environment}

Our ready-to-use JSON packages include environment setup for each collection.

1. Click the environment selector and choose either **Sandbox** or **Production**.
2. Choose the template that matches the authentication method used by the API you are testing.
3. Replace the example values in the selected environment with your project-level credentials.

### OAuth 1.0a {#oauth-10a}

Use this template for APIs that use OAuth 1.0a request signing. Replace the example values with your own:
* Json

```json
{
	"mastercard": {
		"oAuth1": {
			"consumerKey": "000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000",
			"keyAlias": "keyalias",
			"keystoreP12Path": "/path/to/sandbox-signing-key.p12",
			"keystorePassword": "keystorepassword"
		},
		"appliesTo": [
			"mastercard.com",
			"api.ethocaweb.com"
		]
	}
}
```

* Json

```json
{
	"mastercard": {
		"oAuth1": {
			"consumerKey": "000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000",
			"keyAlias": "keyalias",
			"keystoreP12Path": "C:\\path\\to\\sandbox-signing-key.p12",
			"keystorePassword": "keystorepassword"
		},
		"appliesTo": [
			"mastercard.com",
			"api.ethocaweb.com"
		]
	}
}
```

OAuth 1.0a fields:

* `consumerKey`: the consumer key from your Mastercard Developers project
* `keyAlias`: the alias of your signing key
* `keystoreP12Path`: the absolute path on your machine to the downloaded `.p12` signing key file
* `keystorePassword`: the password for the `.p12` signing key file

If you also want to use a `host` variable for request URLs such as `{{host}}/resource`, you can keep that as a separate top-level environment variable outside the `mastercard` object.

#### Encryption and Signature Configuration {#encryption-and-signature-configuration}

The plugin can take care of encrypting requests and/or decrypting response payloads. To enable encryption support, configure the `encryptionConfig` property in the environment.

Use the tab that matches the encryption or signature model required by the API you are calling.
* MastercardEncryption
* Jwe
* Signature

```mastercardEncryption
  {
    "mastercard": {
      
      // Auth config here // 
      
      "encryptionConfig": {
        "paths": [
          {
            "path": "/resource",
            "toEncrypt": [
              {
                "element": "path.to.foo",
                "obj": "path.to.encryptedFoo"
              }
            ],
            "toDecrypt": [
              {
                "element": "path.to.encryptedFoo",
                "obj": "path.to.foo"
              }
            ]
          }
        ],
        "oaepPaddingDigestAlgorithm": "SHA-256",
        "ivFieldName": "iv",
        "encryptedKeyFieldName": "encryptedKey",
        "encryptedValueFieldName": "encryptedData",
        "oaepHashingAlgorithmFieldName": "oaepHashingAlgorithm",
        "publicKeyFingerprintFieldName": "publicKeyFingerprint",
        "publicKeyFingerprintType": "certificate",
        "dataEncoding": "hex",
        "encryptionCertificate": "/path/to/the/encryption/certificate",
        "privateKey": "/path/to/private/key"
      }
    }
  }
  
```

```jwe
{
  "mastercard": {
    // Auth config here //
    "encryptionConfig": {
      "paths": [
        {
          "path": "/resource1",
          "toEncrypt": [
            {
              "element": "path.to.foo",
              "obj": "path.to.encryptedFoo"
            }
          ],
          "toDecrypt": [
            {
              "element": "path.to.encryptedFoo",
              "obj": "path.to.foo"
            }
          ]
        }
      ],
      "mode": "JWE",
      "encryptionCertificate": "/path/to/the/encryption/certificate",
      "keyStore": "/path/to/decryption/keystore",
      "keyStoreAlias": "keystorealias",
      "keyStorePassword": "keystorepassword"
    }
  }
}
  
```

```signature
  {
    "mastercard": {
      
      // Auth config here // 
      "extensions":{
      "signatureConfig": {
        "paths": [
          {
            "path": "/resource",
            "signatureGenerationEnabled": true,
            "signatureVerificationEnabled": true
          }
        ],
       "signPrivateKey": "/path/to/private/key",
       "signKeyId": "signatureKID",
       "signVerificationCertificate": "/path/to/the/signing/certificate",
       "signAlgorithm": "RS256",
       "signExpirationSeconds": 300,
       "signAlgorithmConstraints": ["PS256","RS256"]
      }
     }
    }
  }
  
```

### OAuth 2.0 / FAPI 2.0 {#oauth-20--fapi-20}

Use this template for APIs that use OAuth 2.0 / FAPI 2.0. Replace the example values with your own:
* Json

```json
{
	"mastercard": {
		"oAuth2": {
			"clientId": "yourclientid",
			"kid": "yourkeyid",
			"keystoreP12Path": "/path/to/sandbox-signing-key.p12",
			"keyAlias": "keyalias",
			"keystorePassword": "keystorepassword",
			"tokenEndpoint": "https://auth.mastercard.com/oauth2/token",
			"issuer": "https://auth.mastercard.com",
			"scopes": ["service:scope1", "service:scope2"]
		},
		"appliesTo": [
			"mastercard.com",
			"api.ethocaweb.com"
		]
	}
}
```

* Json

```json
{
	"mastercard": {
		"oAuth2": {
			"clientId": "yourclientid",
			"kid": "yourkeyid",
			"keystoreP12Path": "C:\\path\\to\\sandbox-signing-key.p12",
			"keyAlias": "keyalias",
			"keystorePassword": "keystorepassword",
			"tokenEndpoint": "https://auth.mastercard.com/oauth2/token",
			"issuer": "https://auth.mastercard.com",
			"scopes": ["service:scope1", "service:scope2"]
		},
		"appliesTo": [
			"mastercard.com",
			"api.ethocaweb.com"
		]
	}
}
```

Replace the example values with your Mastercard Developers OAuth 2.0 credentials:

* `clientId`: your OAuth 2.0 client ID
* `kid`: your key ID
* `keystoreP12Path`: the absolute path to your downloaded authentication key `.p12` file
* `keyAlias`: the alias of your authentication key
* `keystorePassword`: the password for the `.p12` file
* `scopes`: the service scopes assigned to your project

If you also want to use a `host` variable for request URLs such as `{{host}}/resource`, you can keep that as a separate top-level environment variable outside the `mastercard` object.

For more detail on the OAuth 2.0 values and flow, see [Using OAuth 2.0 to Access Mastercard APIs](https://developer.mastercard.com/platform/documentation/authentication/using-oauth-2-to-access-mastercard-apis/index.md).
Tip: Keep separate values in the **Sandbox** and **Production** environments so you can switch between them without re-entering credentials each time.

If the collection uses a `host` environment variable as the base URL for requests, set it to the correct value for the environment you selected:

| Environment |             `host` value             |
|-------------|--------------------------------------|
| Sandbox     | `https://sandbox.api.mastercard.com` |
| Production  | `https://api.mastercard.com`         |

Note: Make sure the request **Auth** setting is set to **None** so that Insomnia's built-in authentication does not interfere with the Mastercard plugin.

When you finish updating the environment, save the changes and return to the collection.

## Step 5 - Run an API Endpoint {#step-5---run-an-api-endpoint}

After configuring the environment, select a request from the imported collection or workspace. If you do not yet have a request to run, use one of the optional methods below to import or create one first.

Once you have a request, review any required query parameters or request body values and click **Send** When the environment is configured correctly, the Mastercard plugin automatically adds the authentication header for the request.
You can also build out your requests in Insomnia in other ways.
1. Export a Postman collection to a file. You can use collections from the [Mastercard Postman Workspace](https://www.postman.com/mastercard/workspace/mastercard-developers/overview).
2. In Insomnia, import that file into your Mastercard workspace.
3. Review the imported requests and run them with the environment you configured earlier.

![Importing a Postman collection into Insomnia](https://static.developer.mastercard.com/content/platform/img/insomnia/insomnia-26.png "Importing a Postman collection into Insomnia")
1. Download the OpenAPI specification file for the Mastercard API you want to test. On Mastercard Developers, you can open the API reference and click **Open Specification**.
2. In Insomnia, click **Import** and choose the downloaded OpenAPI file.
3. Let Insomnia generate the requests from the specification.
4. Review the imported requests and run them with the environment you configured earlier.
1. Add a new request by selecting **HTTP Request** from the request menu.
2. In the request URL field, start with `{{host}}` if your environment includes a host variable.
3. Complete the full endpoint path. For example: `{{host}}/oauth-petstore/pets/dogs`.
4. Add query parameters in **Params** and any request body content in **Body**, if the API requires it.
5. Click **Send** to submit the request and review the response.

![Creating a request manually in Insomnia](https://static.developer.mastercard.com/content/platform/img/insomnia/insomnia-new-request4.png "Creating a request manually in Insomnia")
