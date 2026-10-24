

# Manage workload identities with AgentCore Identity
<a name="identity-manage-agent-ids"></a>

Agent identities in AgentCore Identity are implemented as workload identities with specialized attributes that enable agent-specific capabilities. This approach follows established industry patterns where workloads have granular properties that indicate their specific type and purpose. Unlike traditional service accounts that are tied to specific infrastructure, agent identities are designed to be environment-agnostic and can support multiple authentication credentials simultaneously. The AgentCore Identity directory acts as a centralized registry and management system for all agent identities. For information about workload identity limits, see [AgentCore Identity Service Quotas](bedrock-agentcore-limits.md#identity-service-limits).

**Topics**
+ [Understanding workload identities](understanding-agent-identities.md)
+ [Understanding the agent identity directory](agent-identity-directory.md)
+ [Create and manage workload identities](creating-agent-identities.md)