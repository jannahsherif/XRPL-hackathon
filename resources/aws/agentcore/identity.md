

# Provide identity and credential management for agent applications with Amazon Bedrock AgentCore Identity
<a name="identity"></a>

Amazon Bedrock AgentCore Identity is an identity and credential management service designed specifically for AI agents and automated workloads. It provides secure authentication, authorization, and credential management capabilities that enable agents and tools to access AWS resources and third-party services on behalf of users while helping to maintain strict security controls and audit trails. Agent identities are implemented as workload identities with specialized attributes that enable agent-specific capabilities while helping to maintain compatibility with industry-standard workload identity patterns. The service integrates natively with Amazon Bedrock AgentCore to provide identity and credential management for agent applications, including [Host agent or tools with Amazon Bedrock AgentCore Runtime](agents-tools-runtime.md) and [Amazon Bedrock AgentCore Gateway: Securely connect tools and other resources to your Gateway](gateway.md).

**Topics**
+ [Overview of Amazon Bedrock AgentCore Identity](identity-overview.md)
+ [Get started with AgentCore Identity](identity-getting-started.md)
+ [Using the AgentCore Identity console](identity-how-to.md)
+ [Manage workload identities with AgentCore Identity](identity-manage-agent-ids.md)
+ [Configure inbound JWT authorizer](inbound-jwt-authorizer.md)
+ [Manage credential providers with AgentCore Identity](identity-outbound-credential-provider.md)
+ [Provider setup and configuration](identity-idps.md)
+ [Configure a consent portal](identity-consent-portal.md)
+ [Connect to private identity providers](identity-private-idp.md)
+ [Data protection in Amazon Bedrock AgentCore Identity](identity-data-protection.md)
+ [Tagging AgentCore Identity resources](identity-tagging.md)