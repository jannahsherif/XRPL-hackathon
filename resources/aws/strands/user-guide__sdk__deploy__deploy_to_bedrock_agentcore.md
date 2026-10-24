Amazon Bedrock AgentCore Runtime is a serverless runtime for deploying and scaling agents built on any framework, including Strands Agents, LangChain, LangGraph, and CrewAI. It carries any protocol (MCP, A2A) and any model from any provider (Amazon Bedrock, OpenAI, Gemini), and runs multi-modal, real-time, and long-running agents alike.

Each user session gets its own dedicated microVM, so state and privileged operations stay isolated between users. Sessions persist, the runtime scales to thousands of concurrent sessions in seconds, and you pay only for actual usage rather than provisioned infrastructure. Through AgentCore Identity, it integrates with identity providers such as Amazon Cognito, Microsoft Entra ID, and Okta, and OAuth providers such as Google and GitHub, so you authenticate with OAuth tokens, API keys, or IAM roles without building custom security infrastructure.

## Prerequisites

Before you start, you need:

-   An AWS account with appropriate [permissions](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-permissions.html)
-   Python 3.10+ or Node.js 22+
-   Optional: A container engine (Docker, Finch, or Podman) - only required for local testing and advanced deployment scenarios

---

## Choose Your Language

Pick the language your agent is written in to continue:

[Python Deployment](python/index.md)Deploy your Python Strands agent to AgentCore Runtime!

[TypeScript Deployment](typescript/index.md)Deploy your TypeScript Strands agent to AgentCore Runtime!

## Additional Resources

-   [Amazon Bedrock AgentCore Runtime Documentation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html)
-   [Strands Documentation](https://strandsagents.com/latest/)
-   [AWS IAM Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
-   [Docker Documentation](https://docs.docker.com/)
-   [Amazon Bedrock AgentCore Observability](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability.html)

## Related pages

- [Python Deployment to Amazon Bedrock AgentCore Runtime](/docs/user-guide/sdk/deploy/deploy_to_bedrock_agentcore/python/index.md) (4 shared tags)
- [TypeScript Deployment to Amazon Bedrock AgentCore Runtime](/docs/user-guide/sdk/deploy/deploy_to_bedrock_agentcore/typescript/index.md) (4 shared tags)
- [AgentCore evaluations](/docs/user-guide/evals-sdk/how-to/agentcore_evaluation_dashboard/index.md) (3 shared tags)
- [Deploying Strands Agents SDK Agents to Amazon EC2](/docs/user-guide/sdk/deploy/deploy_to_amazon_ec2/index.md) (2 shared tags)
- [Deploying Strands Agents SDK Agents to Amazon EKS](/docs/user-guide/sdk/deploy/deploy_to_amazon_eks/index.md) (2 shared tags)
- [Deploying Strands Agents SDK Agents to AWS App Runner](/docs/user-guide/sdk/deploy/deploy_to_aws_apprunner/index.md) (2 shared tags)
- [Deploying Strands Agents SDK Agents to AWS Fargate](/docs/user-guide/sdk/deploy/deploy_to_aws_fargate/index.md) (2 shared tags)
- [Deploying Strands Agents SDK Agents to AWS Lambda](/docs/user-guide/sdk/deploy/deploy_to_aws_lambda/index.md) (2 shared tags)
- [Guardrails](/docs/user-guide/sdk/safety-security/guardrails/index.md) (2 shared tags)
- [Bedrock Nova Sonic](/docs/user-guide/sdk/bidi/models/bedrock/index.md) (2 shared tags)
