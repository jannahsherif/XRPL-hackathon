

# GitHub
<a name="identity-idp-github"></a>

GitHub can be configured as an AgentCore Identity credential provider for outbound resource access. This allows your agents to authenticate users through GitHub’s OAuth2 service and obtain access tokens for GitHub API resources.

## Outbound
<a name="identity-idp-github-outbound"></a>

**Note**  
AgentCore Identity issues a unique OAuth2 callback URL for each credential provider you create. The unique callback URL enables session binding, which protects the OAuth2 authorization-code exchange against cross-provider replay and CSRF-style attacks by ensuring an authorization response can only be redeemed against the specific credential provider that initiated it. Because the URL is unique per provider, you won’t know it until **after** you call `CreateOauth2CredentialProvider`. Create your GitHub OAuth2 client first, then return to the GitHub developer console to register the callback URL once AgentCore Identity has issued it.

 **Step 1: Create the GitHub OAuth2 client** 

Use the following procedure to set up a GitHub OAuth2 application and obtain the necessary client credentials for AgentCore Identity. You will register the redirect URI in Step 3, after AgentCore Identity issues the unique callback URL.

 **To configure a GitHub OAuth2 application** 

1. Choose the profile picture of your github account and choose **Settings**.

1. Choose **Developer settings**.

1. Choose **OAuth Apps**.

1. On the OAuth2 apps page choose **New OAuth App**.

1. Enter the necessary details specific to your application. Leave the **Authorization callback URL** field empty for now — you will add the unique callback URL in Step 3.

1. Choose **Register application** to create your Github OAuth app.

1. On Github’s OAuth Apps page, go to your newly created provider.

1. Under the client secrets section, choose **Generate a new client secret**.

1. Make a note of the newly created client secret. You’ll need this to configure your Github application with AgentCore Identity.
**Note**  
Github only returns the full secret when it is created. If you lose track of it you’ll need to recreate the client secret to configure the provider in AgentCore Identity.

For more details, refer to Github’s documentation [Creating an OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).

 **Step 2: Create the AgentCore Identity credential provider** 

To configure the outbound GitHub resource provider, use the following:

```
{
        "name": "NAME",
        "credentialProviderVendor": "GithubOauth2",
        "oauth2ProviderConfigInput": {
            "GithubOauth2ProviderConfigInput": {
                "clientId": "your-client-id",
                "clientSecret": "your-client-secret",
            }
        },
    }
```

The [CreateOauth2CredentialProvider](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreateOauth2CredentialProvider.html) response includes a `callbackUrl` field. This URL is unique to this credential provider and looks like: `https://bedrock-agentcore.us-east-1.amazonaws.com/identities/oauth2/callback/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`. Save this value for the next step.

 **Step 3: Register the unique callback URL with GitHub** 

Return to the GitHub developer console and add the unique callback URL to your OAuth2 application’s redirect URI list.

1. Sign in to the GitHub developer console and open the OAuth2 application you created in Step 1.

1. Add the `callbackUrl` value returned by `CreateOauth2CredentialProvider` to the application’s redirect URI configuration.

1. Save your changes.