

# Create a consent portal with the AWS CLI
<a name="identity-create-consent-portal"></a>

You create a consent portal with the `create-consent-portal` command. After you create the portal, poll its status until it becomes `ACTIVE` to retrieve the `portalUrl`. Before you begin, complete the steps in [Consent portal prerequisites](identity-consent-portal-prerequisites.md). To create a consent portal with the console instead, see [Create a consent portal with the console](identity-create-consent-portal-console.md).

## Create a consent portal
<a name="create-consent-portal-cli"></a>

The `create-consent-portal` command requires the following parameters:
+  `executionRoleArn` – The ARN of the IAM role that the consent portal assumes.
+  `idpConfig` – The identity provider configuration. It contains a required `credentialProviderArn` (the ARN of a previously created OAuth2 credential provider for your JWT-issuing OIDC identity provider), and optional `scopes` and `audience`.
+  `name` – A name for the consent portal (1–50 characters).
+  `sources` – Exactly one source of type `agentcore-gateway`.

You can also supply the optional `description`, `tags`, and `clientToken` parameters.

**Note**  
The `idpConfig.credentialProviderArn` value must be the ARN of an OAuth2 credential provider that you created before you call `create-consent-portal`. Create the OAuth2 credential provider for your JWT-issuing OIDC identity provider first, then pass its ARN here. For more information, see [Consent portal prerequisites](identity-consent-portal-prerequisites.md) and [Manage credential providers with AgentCore Identity](identity-outbound-credential-provider.md).

**Note**  
A consent portal always requests the `openid` scope in addition to the scopes you configure in `idpConfig.scopes`. Every configured scope, plus `openid`, must be defined and permitted on the IdP, or authorization fails with an `invalid_scope` error. Include `openid` in the `scopes` list.

The following command creates a consent portal. Replace the {{highlighted}} values with your own.

```
aws bedrock-agentcore-control create-consent-portal \
    --name "my-consent-portal" \
    --execution-role-arn "arn:aws:iam::<account-id>:role/<execution-role-name>" \
    --idp-config '{
        "credentialProviderArn": "arn:aws:bedrock-agentcore:<region>:<account-id>:token-vault/default/oauth2credentialprovider/<credential-provider-id>",
        "scopes": ["openid", "email", "profile"],
        "audience": "<audience>"
    }' \
    --sources '[{
        "identifier": "<gateway-id>",
        "type": "agentcore-gateway"
    }]'
```

The response includes the `consentPortalId`, `consentPortalArn`, and the portal `status`. The `portalUrl` and `statusReason` fields may be null while the portal is in the `CREATING` status.

## Poll for the portal URL
<a name="get-consent-portal-cli"></a>

After you create a consent portal, it begins in the `CREATING` status. Use `get-consent-portal` to poll the portal until its status is `ACTIVE`, at which point the `portalUrl` is available. You can pass either the consent portal ID or its full ARN as the `--consent-portal-identifier`.

The following command retrieves a consent portal. Replace {{<consent-portal-id>}} with your value.

```
aws bedrock-agentcore-control get-consent-portal \
    --consent-portal-identifier "<consent-portal-id>"
```

When the returned `status` is `ACTIVE`, retrieve the `portalUrl` from the response and complete the setup steps in [Complete the consent portal setup](#complete-consent-portal-setup). If the status is `FAILED`, inspect the `statusReason` field to diagnose the problem.

## Complete the consent portal setup
<a name="complete-consent-portal-setup"></a>

After the portal is `ACTIVE` and you have its `portalUrl`, complete the following steps so that an end user can sign in to the portal. These steps configure the **primary IdP** — the credential provider you passed in `idpConfig`, which is the identity that users sign in to. To add a resource that users can grant the agent consent to access, see [Configure a consent portal target](identity-configure-consent-portal-target.md).

1.  **Register the portal callback URL on the primary IdP.** On the IdP application that backs the credential provider you passed in `idpConfig`, add `<portalUrl>/callback` as an authorized redirect (callback) URI. Enter the value exactly, with no trailing slash — a trailing slash causes the IdP to reject the callback as unregistered during authentication. Different IdPs label this setting differently; for example, Amazon Cognito calls it **Allowed callback URLs** and Okta calls it **Sign-in redirect URIs**.

1.  **Confirm an active IdP user exists.** Make sure the primary IdP has at least one active user that you can sign in as. For some IdPs the user must also be assigned to the application; for example, in Okta the user must be assigned under the application’s **Assignments**.

1.  **Sign in to the portal.** Open the `portalUrl` in a browser and sign in with an existing IdP user’s credentials. A successful sign-in takes you to the consent portal page and confirms that the primary IdP, the credential provider, and the portal callback URL are configured correctly.

If the portal’s gateway has no targets configured, the consent portal page appears empty because there are no resources to grant consent to. To add a target so that a connection appears on the page, see [Configure a consent portal target](identity-configure-consent-portal-target.md).