

# Configure a consent portal target
<a name="identity-configure-consent-portal-target"></a>

The consent portal’s **Connections** page lists the resources that an end user can grant your agent consent to access. This list is driven by the **targets** attached to the consent portal’s gateway, so a consent portal whose gateway has no eligible targets shows an empty Connections page. This topic describes how to configure an outbound OAuth2 credential provider and a gateway target so that a connection appears on the consent portal, and how a user connects to it.

Complete these steps after the consent portal is `ACTIVE` and has a `portalUrl` (see [Create a consent portal with the AWS CLI](identity-create-consent-portal.md)). The target’s return URL depends on the consent portal’s `portalUrl`, so the consent portal must be `ACTIVE` before you add the target.

An outbound credential provider is separate from the consent portal’s **primary IdP** credential provider. The primary IdP is the identity that users sign in to; an outbound provider represents a downstream resource that the agent acts on. One outbound provider can back multiple targets, and outbound providers may be any supported vendor, including OAuth2-only vendors (for example, GitHub, Slack, Salesforce, Atlassian, and LinkedIn) that cannot serve as the primary IdP.

## Create the outbound OAuth2 credential provider
<a name="configure-target-outbound-provider"></a>

Create an OAuth2 credential provider for the downstream resource that the agent accesses. For full instructions, see [Manage credential providers with AgentCore Identity](identity-outbound-credential-provider.md).

The [CreateOauth2CredentialProvider](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreateOauth2CredentialProvider.html) response includes a `callbackUrl` field that is unique to the credential provider. Register this `callbackUrl` as an authorized redirect URI in the outbound provider’s own application configuration. This is distinct from the consent portal’s callback URLs; it is the redirect that AgentCore Identity uses when it exchanges the authorization code with the outbound provider.

Note the credential provider’s ARN. You reference it as `providerArn` when you add the gateway target.

## Add the gateway target
<a name="configure-target-add-target"></a>

Add a target to the consent portal’s gateway and configure it to use the outbound credential provider. For general instructions about adding targets and configuring their outbound authorization, see [Add targets to an existing AgentCore gateway](gateway-building-adding-targets.md) and [Set up outbound authorization for your gateway](gateway-outbound-auth.md).

For the target to appear as a connection that a user can grant per-user consent to, configure its `credentialProviderConfigurations` as follows:
+ Set `providerArn` to the ARN of the outbound OAuth2 credential provider that you created.
+ Set `grantType` to `AUTHORIZATION_CODE` so that the target uses three-legged OAuth (3LO). Targets that use `CLIENT_CREDENTIALS` (two-legged, machine-to-machine) require no per-user consent and do not appear on the Connections page.
+ Set `defaultReturnUrl` to exactly `<portalUrl>/connect/callback`. This is the consent leg of the flow and is distinct from the primary IdP callback (`<portalUrl>/callback`). If `defaultReturnUrl` is missing or incorrect, the outbound provider returns the user somewhere other than the consent portal and the consent never binds to the session.

**Note**  
The `defaultReturnUrl` requirement applies to **existing** gateway targets as well as new ones. If the gateway already has targets that you want to include in the consent portal, update each of those targets so that its outbound credential provider’s `defaultReturnUrl` is `<portalUrl>/connect/callback`. A target that was created before the consent portal existed has a different `defaultReturnUrl` (or none), so its consent won’t bind to the portal session until you update it. To update a target’s outbound authorization, see [Set up outbound authorization for your gateway](gateway-outbound-auth.md).

**Note**  
After you add or update a target, it does not appear on the consent portal’s Connections page immediately. The connections list is cached for up to 5 minutes.

**Important**  
The consent portal displays target and credential provider names exactly as you define them during setup. The names you choose for the target and its outbound credential provider are shown to your end users on the consent portal’s Connections page, so choose names that are clear and appropriate for that audience.

## Connect on the consent portal
<a name="configure-target-connect"></a>

After the target is added and the connections cache refreshes, an end user can grant consent:

1. Open the `portalUrl` in a browser and sign in as the primary IdP user.

1. On the Connections page, locate the connection for the target you added and choose **Connect**.

1. Complete the sign-in and consent prompt at the outbound provider. The provider returns the user to `<portalUrl>/connect/callback`, which binds the consent to the session. On success, the connection shows as connected, and the agent can access the resource on the user’s behalf.

**Note**  
When a target is called directly without a valid stored credential, AgentCore Identity returns an authorization URL for the user to navigate to and grant consent, rather than returning an access token. This happens, for example, when a user invokes a target directly (such as through a coding agent) without first granting consent on the consent portal, or when a previously obtained token expires. To grant consent and let AgentCore Identity fetch and store a new access token, the user must return to the consent portal. This direct authorization URL is subject to the same session-binding requirements as any authorization URL that AgentCore Identity generates. For more information, see [OAuth 2.0 authorization URL session binding](oauth2-authorization-url-session-binding.md).