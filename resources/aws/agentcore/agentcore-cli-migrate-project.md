

# Migrate an existing project
<a name="agentcore-cli-migrate-project"></a>

Use `agentcore migrate` to upgrade an AgentCore CLI v0 project in place.

## 1. Prepare the project
<a name="migrate-project-prepare"></a>

Install AgentCore CLI v1. See [Install the AgentCore CLI](agentcore-get-started-cli.md#agentcore-get-started-cli-install).

Before you migrate:
+ Install Git and make sure the project is in a Git working tree.
+ Commit the project files, including `agentcore/agentcore.json`.
+ Commit or stash any pending changes. The project directory must have no uncommitted changes, including untracked files.

If the CLI reports that the project’s CDK dependencies are older than v0.24.2, run:

```
npx @aws/agentcore@0 deploy
```

## 2. Run the migration
<a name="migrate-project-run"></a>

Run:

```
agentcore migrate
```