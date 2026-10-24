

# Consent portal prerequisites
<a name="identity-consent-portal-prerequisites"></a>

Before you create a consent portal, create the OAuth2 credential provider whose ARN you supply in `idpConfig.credentialProviderArn`, configure the gateway that the portal serves, and create the execution role that the portal assumes. This topic describes each prerequisite.

## OAuth2 credential provider
<a name="consent-portal-credential-provider-prereq"></a>

A consent portal requires an OAuth2 credential provider for your JWT-issuing OIDC identity provider. This is the **primary IdP** that your end users sign in to; it is separate from any outbound (per-target) credential providers that the agent uses to act on a resource. You must create this OAuth2 credential provider before you create the portal, and you supply its ARN as `idpConfig.credentialProviderArn` when you call `create-consent-portal`. The OAuth2 credential provider must reference the same OIDC issuer as the gateway’s JWT authorizer, and the scopes permitted on the IdP application that backs it must include `openid`. For more information about creating an OAuth2 credential provider, see [Manage credential providers with AgentCore Identity](identity-outbound-credential-provider.md).

When you create the IdP application that backs this credential provider, use an OIDC web application that uses the authorization-code grant and has a client secret. Do not set a real redirect URI yet — the portal’s callback URL does not exist until after you create the portal. Leave the redirect URI list empty or set a placeholder value, and also create at least one active test user that you can sign in as. You register the real redirect URI and complete the sign-in after the portal is `ACTIVE`, as described in [Create a consent portal with the AWS CLI](identity-create-consent-portal.md).

The consent portal supports only primary IdPs that issue JWT access tokens. OAuth2-only vendors that issue no ID token and publish no OIDC discovery document (for example, GitHub, Slack, Salesforce, Atlassian, and LinkedIn) cannot be used as the primary IdP, though they remain valid as outbound providers for gateway targets.

## Gateway with JWT inbound authentication
<a name="consent-portal-gateway-prereq"></a>

A consent portal attaches to exactly one Amazon Bedrock AgentCore Gateway as its single source of type `agentcore-gateway`. The gateway must be configured with an inbound authentication type of JWT so that its authorizer references an OIDC identity provider. When you create the consent portal, AWS validates that the gateway’s authorizer and the OAuth2 credential provider you supply in `idpConfig` reference the same OIDC issuer. For more information about configuring credential providers and identity providers, see [Manage credential providers with AgentCore Identity](identity-outbound-credential-provider.md) and [Provider setup and configuration](identity-idps.md).

The consent portal supports only IdPs that issue JWT access tokens. IdPs that issue opaque access tokens, and OAuth2-only vendors, are not supported as the primary IdP for a consent portal.

The gateway must exist before you create the consent portal, but you do not need to add its outbound-authentication targets yet. Targets determine what appears on the portal’s Connections page, and their return URL depends on the portal’s `portalUrl`, which does not exist until the portal is `ACTIVE`. Add targets as a post-creation step, described in [Create a consent portal with the AWS CLI](identity-create-consent-portal.md).

## Execution role
<a name="consent-portal-execution-role-prereq"></a>

A consent portal assumes an IAM role that you pass as `executionRoleArn` when you create the portal. The Consent Portal service assumes this role to read the gateway and OAuth2 credential provider configurations and to retrieve the OAuth client secret. The role requires a specific trust policy and permissions policy. For the required policies and instructions, see [Consent portal execution role](identity-consent-portal-execution-role.md).