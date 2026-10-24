

# Provider setup and configuration
<a name="identity-idps"></a>

Amazon Bedrock AgentCore Identity provides managed OAuth 2.0 supported providers for both inbound and outbound authentication. Each provider encapsulates the specific authentication protocols, endpoint configurations, and credential formats required for a particular service or identity system. The service provides built-in providers for popular services including Google, GitHub, Slack, and Salesforce with authorization server endpoints and provider-specific parameters pre-configured to reduce development effort. The providers abstract away the complexity of different OAuth 2.0 implementations, API authentication schemes, and token formats, presenting a unified interface to agents while handling the underlying protocol variations and edge cases.

Built-in providers are maintained by the AgentCore Identity team and automatically updated to handle changes in external service APIs, security requirements, and best practices.

Supported providers include:

**Topics**
+ [Amazon Cognito](identity-idp-cognito.md)
+ [Auth0 by Okta](identity-idp-auth0.md)
+ [Atlassian](identity-idp-atlassian.md)
+ [CyberArk](identity-idp-cyberark.md)
+ [Dropbox](identity-idp-dropbox.md)
+ [Facebook](identity-idp-facebook.md)
+ [FusionAuth](identity-idp-fusionauth.md)
+ [GitHub](identity-idp-github.md)
+ [Google](identity-idp-google.md)
+ [HubSpot](identity-idp-hubspot.md)
+ [LinkedIn](identity-idp-linkedin.md)
+ [Microsoft](identity-idp-microsoft.md)
+ [Notion](identity-idp-notion.md)
+ [Okta](identity-idp-okta.md)
+ [OneLogin](identity-idp-onelogin.md)
+ [Ping Identity](identity-idp-pingidentity.md)
+ [Reddit](identity-idp-reddit.md)
+ [Salesforce](identity-idp-salesforce.md)
+ [Slack](identity-idp-slack.md)
+ [Spotify](identity-idp-spotify.md)
+ [Twitch](identity-idp-twitch.md)
+ [X](identity-idp-x.md)
+ [Yandex](identity-idp-yandex.md)
+ [Zoom](identity-idp-zoom.md)