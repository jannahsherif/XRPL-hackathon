

# Migrating to v1
<a name="agentcore-cli-migration"></a>

Use `agentcore migrate` from your existing project’s directory to upgrade a project created with AgentCore CLI v0 to the v1 project format. You don’t need to create a second project or manually import resources into a new stack. See [Migrate an existing project](agentcore-cli-migrate-project.md) for the steps.

AgentCore CLI v1 keeps project workflows such as `deploy`, `invoke`, and `status` at the top level. Evaluation workflows move under `agentcore eval`, and resource command families work directly with deployed resources by ID or ARN. Review [Breaking changes](agentcore-cli-migration-breaking-changes.md) when updating your commands, scripts, and application configuration.

**Topics**
+ [Breaking changes](agentcore-cli-migration-breaking-changes.md)
+ [Migrate an existing project](agentcore-cli-migrate-project.md)