

# Atlassian
<a name="identity-idp-atlassian"></a>

Atlassian can be configured as an AgentCore Identity credential provider for outbound resource access. This allows your agents to authenticate users through Atlassian’s OAuth2 service and obtain access tokens for Atlassian API resources.

## Outbound
<a name="identity-idp-atlassian-outbound"></a>

**Note**  
AgentCore Identity issues a unique OAuth2 callback URL for each credential provider you create. The unique callback URL enables session binding, which protects the OAuth2 authorization-code exchange against cross-provider replay and CSRF-style attacks by ensuring an authorization response can only be redeemed against the specific credential provider that initiated it. Because the URL is unique per provider, you won’t know it until **after** you call `CreateOauth2CredentialProvider`. Create your Atlassian OAuth2 client first, then return to the Atlassian developer console to register the callback URL once AgentCore Identity has issued it.

 **Step 1: Create the Atlassian OAuth2 client** 

Use the following procedure to set up an Atlassian OAuth2 application and obtain the necessary client credentials for AgentCore Identity. You will register the redirect URI in Step 3, after AgentCore Identity issues the unique callback URL.

 **To configure an Atlassian OAuth2 application** 

1. Open Atlassian’s developer console and register for a developer account.

1. Create a new application.

1. Select authorization and next to **OAuth 2.0 (3LO)** select **Configure**.

1. Leave the callback URL field empty for now — you will add the unique callback URL in Step 3.

1. Choose **Save changes**.

1. Select **Permissions** and choose the permissions relevant to your application.

For more details, refer to [Atlassian’s OAuth 2.0 (3LO) apps documentation](https://developer.atlassian.com/cloud/confluence/oauth-2-3lo-apps/).

 **Step 2: Create the AgentCore Identity credential provider** 

To configure Atlassian as an outbound resource provider, use the following:

```
{
   "name": "NAME",
   "credentialProviderVendor": "AtlassianOAuth2",
   "oauth2ProviderConfigInput": {
       "atlassianOauth2ProviderConfig": {
           "clientId": "your-client-id",
           "clientSecret": "your-client-secret"
       }
   }
}
```

The [CreateOauth2CredentialProvider](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreateOauth2CredentialProvider.html) response includes a `callbackUrl` field. This URL is unique to this credential provider and looks like: `https://bedrock-agentcore.us-east-1.amazonaws.com/identities/oauth2/callback/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`. Save this value for the next step.

 **Step 3: Register the unique callback URL with Atlassian** 

Return to the Atlassian developer console and add the unique callback URL to your OAuth2 application’s redirect URI list.

1. Sign in to the Atlassian developer console and open the OAuth2 application you created in Step 1.

1. Add the `callbackUrl` value returned by `CreateOauth2CredentialProvider` to the application’s redirect URI configuration.

1. Save your changes.