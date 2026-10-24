

# Get started with AgentCore Identity
<a name="identity-getting-started"></a>

If you’re building AI agents that need to access external services like Google Drive, Slack, or GitHub, Amazon Bedrock AgentCore Identity provides the secure authentication infrastructure you need. This section offers two practical getting started tutorials that demonstrate how to implement identity features in your agents. Depending on your specific business needs, you can start with a complete end-to-end agent deployment, or focus on OAuth2 integration patterns with Google Drive to understand the core authentication flows.

**Topics**
+ [Primary getting started tutorial](#primary-tutorial)
+ [OAuth2 integration getting started tutorial](#additional-tutorial)
+ [Common prerequisites](#common-prerequisites)
+ [Build your first authenticated agent](identity-getting-started-cognito.md)
+ [Integrate with Google Drive using OAuth2](identity-getting-started-google.md)

## Primary getting started tutorial
<a name="primary-tutorial"></a>

Start here for a complete end-to-end walkthrough of AgentCore Identity features:

 [Build your first authenticated agent](identity-getting-started-cognito.md)   
 **Recommended starting point** for new users  
 **What you’ll build:** A complete working agent with authentication, deployed to AgentCore Runtime  
 **What you’ll learn:** Create Cognito user pools, configure credential providers, deploy agents, set up IAM policies, and test authentication flows  
 **Outcome:** Fully deployed agent that can authenticate users and obtain access tokens

## OAuth2 integration getting started tutorial
<a name="additional-tutorial"></a>

After completing the primary tutorial, explore OAuth2 patterns with external services:

 [Integrate with Google Drive using OAuth2](identity-getting-started-google.md)   
 **Focus:** OAuth2 flows and Google Drive integration  
 **What you’ll learn:** Set up OAuth2 credential providers, obtain access tokens, and integrate with Google services  
 **Best for:** Understanding OAuth2 authentication patterns with real external services

## Common prerequisites
<a name="common-prerequisites"></a>

Both tutorials require the following:
+ An AWS account with appropriate permissions
+ Basic familiarity with Python programming
+ Understanding of OAuth2 concepts (recommended)

Each tutorial includes specific setup instructions and additional prerequisites as needed.