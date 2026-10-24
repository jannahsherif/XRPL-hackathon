

# Configure a consent portal
<a name="identity-consent-portal"></a>

A consent portal is a hosted, AWS-managed portal that authenticates your end users to an OpenID Connect (OIDC) identity provider (IdP) and gathers their consent before your agent accesses a downstream resource on their behalf. Each consent portal attaches to a single Amazon Bedrock AgentCore Gateway (its source) and uses an OAuth2 credential provider to reference the same IdP that the gateway’s inbound JWT authorizer trusts. The portal keeps the OAuth flow server-side: the browser never holds a token.

The following topics describe how to set up and manage a consent portal. Before you create a portal, review and complete the prerequisites.

**Topics**
+ [Consent portal prerequisites](identity-consent-portal-prerequisites.md)
+ [Consent portal execution role](identity-consent-portal-execution-role.md)
+ [Create a consent portal with the console](identity-create-consent-portal-console.md)
+ [Create a consent portal with the AWS CLI](identity-create-consent-portal.md)
+ [Configure a consent portal target](identity-configure-consent-portal-target.md)
+ [Update a consent portal](identity-update-consent-portal.md)
+ [Delete a consent portal](identity-delete-consent-portal.md)