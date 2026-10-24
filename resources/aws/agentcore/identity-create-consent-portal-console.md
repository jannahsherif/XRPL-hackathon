

# Create a consent portal with the console
<a name="identity-create-consent-portal-console"></a>

You can create a consent portal from the AgentCore console. Before you begin, complete the steps in [Consent portal prerequisites](identity-consent-portal-prerequisites.md). In particular, you need the following:
+ An Amazon Bedrock AgentCore Gateway configured with the **Use JSON Web Tokens (JWT)** inbound authentication type.
+ An OAuth2 credential provider for your OpenID Connect (OIDC) identity provider. For more information, see [Manage credential providers with AgentCore Identity](identity-outbound-credential-provider.md).
+ An execution role, unless you let the console create one for you. For more information, see [Consent portal execution role](identity-consent-portal-execution-role.md).

 **To create a consent portal** 

1. Open the [AgentCore](https://console.aws.amazon.com/bedrock-agentcore/home#) console.

1. From the left navigation pane, choose **Gateways**.

1. Choose the gateway that you configured as a prerequisite.

1. On the gateway details page, choose **Create Consent Portal**.

1. In the **Consent portal details** section, do the following:

   1. Select the **Gateway** to attach to the consent portal.

   1. (Optional) Change the generated **consent portal name**.

   1. (Optional) For **Description**, add a description for your consent portal.

1. In the **IdP credential configurations** section, do the following:

   1. Select the **IdP credential provider** that you created as a prerequisite.

   1. (Optional) Add additional **Scopes**.

   1. (Optional) Add additional **Audiences**.

1. In the **Permissions** section, choose one of the following options under **IAM Permissions**:

   1. To create a default role with the necessary permissions to access your consent portal, choose **Create default role** and, optionally, change the generated **Role name**.

   1. To use an existing service role, choose **Use another service role** and then select a role from the dropdown menu. Make sure that the service role that you choose has the necessary permissions. For more information, see [Consent portal execution role](identity-consent-portal-execution-role.md).

      1. (Optional) Choose **Edit role** to add the necessary permissions to the selected role.

   1. To create a new role yourself, choose **Use another service role** and then choose **Create new role**.

1. Choose **Create Portal**.

1. Wait until the consent portal’s status is `ACTIVE`. When the portal becomes `ACTIVE`, the **Consent portal URL** appears on the consent portal details page. Note this URL, referred to as {{<portalUrl>}} in the following step.

1. On the IdP application that backs the credential provider you selected, register `<portalUrl>/callback` as an authorized callback (redirect) URL. Enter the value exactly, with no trailing slash — a trailing slash causes the IdP to reject the callback as unregistered during authentication. Different IdPs label this setting differently; for example, Amazon Cognito calls it **Allowed callback URLs** and Okta calls it **Sign-in redirect URIs**.

1. Confirm that the primary IdP has at least one active user that you can sign in as. For some IdPs the user must also be assigned to the application; for example, in Okta the user must be assigned under the application’s **Assignments**.

1. Open {{<portalUrl>}} in a browser and sign in with an existing IdP user’s credentials. A successful sign-in takes you to the consent portal page.

If the portal’s gateway has no targets configured, the consent portal page appears empty because there are no resources to grant consent to. To add a target so that a connection appears on the page, see [Configure a consent portal target](identity-configure-consent-portal-target.md).