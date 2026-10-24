

# Policy in Amazon Bedrock AgentCore: Control Agent Interactions
<a name="policy"></a>

Policy in Amazon Bedrock AgentCore enables developers to define and enforce security controls for AI agent interactions with tools by creating a protective boundary around agent operations. AI agents can dynamically adapt to solve complex problems - from processing customer inquiries to automating workflows across multiple tools and systems. However, this flexibility introduces new security challenges, as agents may inadvertently misinterpret business rules, or act outside their intended authority.

With Policy in AgentCore, developers can create policy engines, create and store deterministic policies in them and associate policy engines with gateways. Policy in AgentCore intercepts all agent traffic through Amazon Bedrock AgentCore Gateways and evaluates each request against defined policies in the policy engine before allowing tool access.

Policies are constructed using [Cedar language](https://www.cedarpolicy.com/en) , an open source language for writing and enforcing authorization policies. This allows developers to precisely specify what agents can access and what actions they can perform. Policy in AgentCore also provides the capability to author policies using natural language by allowing developers to describe rules in plain English instead of writing formal policy code in Cedar. Natural language-based policy authoring interprets what the user intends, generates candidate policies, validates them against the tool schema, and uses automated reasoning to check safety conditions such as identifying policies that are overly permissive, overly restrictive, or contain conditions that can never be satisfied - ensuring customers catch these issues before enforcing policies.

Policy in AgentCore also supports authoring policies in [Dogwood](https://dogwood-policy.github.io/dogwood/index.html) on the Dogwood Policy website, an open-source policy language. A single Dogwood policy can combine several kinds of authorization conditions. At the simplest level, you write input-based rules that permit or forbid a tool call based on the current request itself — who the principal is, which tool they are calling, the resource involved, and the input parameters of that call. You can then add session-aware temporal conditions that decide based on what has already happened earlier in the same session — for example, requiring that an approval was granted before a transfer, blocking an action after it has run a set number of times, or keeping a running total under a budget. You can also consult information providers, such as Guardrails, that emit a signal at evaluation time — such as a content-safety or prompt-attack score — and make decisions based on the emitted score. Because input-based, temporal, and provider-based conditions all compose within one policy under the same permit and forbid model, you can layer them to express the control your agents need — from a simple access rule to a multi-step, session-aware safeguard.

Policy in AgentCore supports fine-grained permissions based on user identity and tool input parameters, making it possible to safely deploy autonomous agents at enterprise scale. By moving security controls outside of agent code, developers can focus on building innovative agent capabilities while maintaining strong security guarantees - eliminating the need for custom security implementation and reducing the risk of policy bypass through agent manipulation.

**Topics**
+ [Key benefits](#policy-benefits)
+ [Key features](#policy-features)
+ [Getting started with Policy in AgentCore](policy-getting-started.md)
+ [Core concepts](policy-core-concepts.md)
+ [AgentCore Gateway and Policy in AgentCore IAM Permissions](policy-permissions.md)
+ [Create a policy engine](policy-create-engine.md)
+ [Create a policy](policy-create-policies.md)
+ [Guardrails in policies](policy-guardrails-in-policies.md)
+ [Temporal policies](policy-temporal.md)
+ [Writing policies in natural language](policy-natural-language.md)
+ [Validate and test policies](policy-validate-policies.md)
+ [Use policies](policy-use-policies.md)
+ [Policy authoring guide](policy-authoring-guide.md)
+ [Advanced features and topics for Policy in AgentCore](policy-advanced.md)

## Key benefits
<a name="policy-benefits"></a>

Policy in AgentCore provides three key benefits that enable secure, scalable deployment of AI agents in enterprise environments:

 **Fine-grained control over agent actions**   
Define what actions an agent is allowed to perform - including which tools it can call and the precise conditions under which those actions are permitted.

 **Deterministic enforcement with strong guarantees**   
Every agent action through Amazon Bedrock AgentCore Gateway is intercepted and evaluated at the boundary outside of agent’s code - ensuring consistent, deterministic enforcement that remains reliable regardless of how the agent is implemented.

 **Simple, accessible authoring with organization-wide consistency**   
Write policies using natural language prompts or directly in Cedar (AWS's open-source policy language for fine-grained permissions), making it easy for builders with varying degree of expertise to define rules for their agents. Teams can set boundaries once and have them applied consistently across all agents and tools, with every enforcement decision logged through CloudWatch metrics and logs, so security and compliance teams can audit and validate behavior.

## Key features
<a name="policy-features"></a>

Policy in AgentCore offers comprehensive capabilities for policy-based governance of agent interactions, including the following key features:
+  **Policy Enforcement** - Intercepts and evaluates all agent requests against defined policies before allowing tool access
+  **Access Controls** - Enables fine-grained based on user identity and tool input parameters
+  **Policy Authoring** - Provides Cedar policy language support for writing clear, validated policies. Policies can also be authored in natural language using English prompts which are translated into Cedar policies and validated
+  **Policy Monitoring** - Offers CloudWatch integration for monitoring policy evaluations and decisions
+  **Infrastructure Integration** - Integrates with VPC security groups and other AWS security infrastructure
+  **Audit Logging** - Maintains detailed logs of policy decisions for compliance and troubleshooting
+  **Temporal Policies** - Session-scoped rules that reason over the history of actions within a conversation. For more information, see [Temporal policies](policy-temporal.md).