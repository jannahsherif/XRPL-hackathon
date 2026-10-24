

# Google
<a name="identity-idp-google"></a>

Google can be configured as an AgentCore Identity credential provider for outbound resource access. This allows your agents to authenticate users through Google’s OAuth2 service and obtain access tokens for Google API resources.

## Outbound
<a name="identity-idp-google-outbound"></a>

**Note**  
AgentCore Identity issues a unique OAuth2 callback URL for each credential provider you create. The unique callback URL enables session binding, which protects the OAuth2 authorization-code exchange against cross-provider replay and CSRF-style attacks by ensuring an authorization response can only be redeemed against the specific credential provider that initiated it. Because the URL is unique per provider, you won’t know it until **after** you call `CreateOauth2CredentialProvider`. Create your Google OAuth2 client first, then return to the Google developer console to register the callback URL once AgentCore Identity has issued it.

 **Step 1: Create the Google OAuth2 client** 

Use the following procedure to set up a Google OAuth2 application and obtain the necessary client credentials for AgentCore Identity. You will register the redirect URI in Step 3, after AgentCore Identity issues the unique callback URL.

 **To configure a Google OAuth2 application** 

1. Create a [developer account with Google](https://developers.google.com/identity).

1. Sign in to the [Google Cloud Platform console](https://console.cloud.google.com/home/dashboard).

1. From the top navigation bar, choose **Select a project** . If you already have a project in the Google platform, this menu displays your default project instead.

1. Choose **NEW PROJECT**.

1. Enter a name for your product and then choose **CREATE**.

1. Choose **APIs and Services** , and then choose **OAuth consent screen**.

1. Enter the app information, an **App domain** , **Authorized domains** , and **Developer contact information** . Your **Authorized domains** must include `bedrock-agentcore.region.amazonaws.com` . Choose **SAVE AND CONTINUE**.

1. Under **Scopes** , choose **Add or remove scopes** , and then choose the scopes necessary for your application.

1. In the navigation bar, choose **APIs and Services** , and then choose **Credentials**.

1. Choose **CREATE CREDENTIALS** , and then choose **OAuth client ID**.

1. Choose an **Application type** and give your client a **Name**. Leave **Authorized redirect URIs** empty for now — you will add the unique callback URL in Step 3.

1. Choose **CREATE**.

1. Securely store the values that Google displays under **Your client ID** and **Your client secret** . Provide these values to AgentCore Identity when you add a Google credential provider.

 **Step 2: Create the AgentCore Identity credential provider** 

To configure the outbound Google resource provider, use the following:

```
{
        "name": "NAME",
        "credentialProviderVendor": "GoogleOauth2",
        "oauth2ProviderConfigInput": {
            "GoogleOauth2ProviderConfigInput": {
                "clientId": "your-client-id",
                "clientSecret": "your-client-secret",
            }
        },
    }
```

The [CreateOauth2CredentialProvider](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreateOauth2CredentialProvider.html) response includes a `callbackUrl` field. This URL is unique to this credential provider and looks like: `https://bedrock-agentcore.us-east-1.amazonaws.com/identities/oauth2/callback/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`. Save this value for the next step.

 **Step 3: Register the unique callback URL with Google** 

Return to the Google developer console and add the unique callback URL to your OAuth2 application’s redirect URI list.

1. Sign in to the Google developer console and open the OAuth2 application you created in Step 1.

1. Add the `callbackUrl` value returned by `CreateOauth2CredentialProvider` to the application’s redirect URI configuration.

1. Save your changes.