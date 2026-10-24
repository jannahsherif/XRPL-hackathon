

# Environment and filesystem
<a name="harness-environment"></a>

Every harness session runs in an isolated microVM with its own filesystem and shell. This page covers configuring the execution environment (default or custom container), running commands directly on the VM, setting environment variables, and mounting persistent filesystems.

For development, [use the Agent Inspector](harness-get-started.md#harness-development) to invoke a deployed Harness from a local UI, or [open an interactive Harness shell](harness-command-shell.md#harness-command-shell-cli). Neither path runs the Harness environment locally.

## Run commands on the environment
<a name="harness-execute-command"></a>

Not everything needs to go through the agent loop. `InvokeAgentRuntimeCommand` gives you direct shell access to the harness microVM: deterministic command execution with no model reasoning, no token cost, no ambiguity.

Use it to:
+ Run deterministic pre-invocation or post-invocation scripts.
+ Prepare the environment before an invocation: clone a repo, install dependencies, copy input files.
+ Act on what the agent produced: run tests, commit and push, extract build artifacts.
+ Inspect the VM during development: `ls`, `cat`, `env`, `python --version` without a round trip through the model.

**Example**  

```
response = client.invoke_agent_runtime_command(
    agentRuntimeArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    body={"command": "ls -la /workspace"},
)

for event in response["stream"]:
    chunk = event.get("chunk", {})
    if "contentDelta" in chunk:
        delta = chunk["contentDelta"]
        if "stdout" in delta:
            print(delta["stdout"], end="", flush=True)
        if "stderr" in delta:
            print(delta["stderr"], end="", flush=True)
    elif "contentStop" in chunk:
        print(f"\n[exit code: {chunk['contentStop']['exitCode']}]")
```

```
# The harness ID is the part of the harness ARN after "harness/"
HARNESS_ID="<harness-id>"
SESSION_ID="$(uuidgen)"

# Install dependencies before the agent starts
agentcore harness exec \
  --id "$HARNESS_ID" \
  --session-id "$SESSION_ID" \
  --command "pip install pandas matplotlib"

# After the agent finishes, inspect what it created
agentcore harness exec \
  --id "$HARNESS_ID" \
  --session-id "$SESSION_ID" \
  --command "ls -la /tmp && cat /tmp/results.csv"
```
The base environment includes Python and bash. For tools like `git`, `node`, or other runtimes, install them at session start (e.g. `apt-get install -y git`) or use a [custom environment](#harness-custom-container).
Run `agentcore status --json` to find the deployed harness ARN. The harness ID is the part of the ARN after `harness/`. The session ID must be 33 to 100 characters. Run `agentcore harness exec --id <harness-id>` without `--command` to open the interactive exec experience. In the chat that `agentcore invoke --harness <name>` opens, press Ctrl\+E to switch between chat mode and exec mode.
See [InvokeAgentRuntimeCommand API](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_InvokeAgentRuntimeCommand.html) for details.

**Note**  
Commands run as root (uid 0) within the microVM. This is analogous to root on your own EC2 instance - the IAM permission is the access gate, not the in-VM privilege level. If your Dockerfile includes a `USER` directive, it applies to the agent process only (the container’s main entrypoint). `InvokeAgentRuntimeCommand` runs at a higher privilege level for operational purposes, similar to how `docker exec` defaults to root even when the container runs as a non-root user. See [Execute shell commands in AgentCore Runtime sessions](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-execute-command.html) for full details on security, error handling, and best practices.

## Custom environment (container images)
<a name="harness-custom-container"></a>

The base environment includes Python and bash, enough for most tasks. When you need more, package your source code, dependencies, runtimes, and tools into a container image, push it to ECR, and reference it on the harness. Your agent runs in that exact environment. Pair custom images with `InvokeAgentRuntimeCommand` for session-specific setup that varies per invocation.

Container images must be built for the `linux/arm64` platform.

Include the following programs in your image:
+ Include `/bin/bash`. The harness uses it for the shell tool, commands, and interactive terminals.
+ Include `/bin/sh` and `sleep`. The harness uses them to keep the container running.
+ Include `base64`, `cat`, `dirname`, `env`, `ls`, `mkdir`, and `rm`. The file tools use them to read and write files.
+ Include `tar` when you configure Git, Amazon S3, or AWS skills. The harness uses it to copy these skills into the container.

When you configure Git, Amazon S3, or AWS skills, give the container user write access to `/tmp`. The harness copies these skills into `/tmp` before the agent starts.

Most general-purpose base images include these programs, but some minimal images don’t. For example, `amazonlinux:2023` and `amazonlinux:2` don’t include `tar`. Alpine and BusyBox images don’t include `/bin/bash`. To install `tar` on Amazon Linux, add `RUN dnf install -y tar` to your Dockerfile.

If you omit `tar` or write access to `/tmp`, invocations that use fetched skills fail. This applies to Git, Amazon S3, and AWS skills. The error is `Unable to copy configured skills to the customer container`. Add the missing program or permission to resolve the error. You don’t need `tar` for path skills because the harness reads them in place.

For more information about skill sources, see [Skills](harness-skills.md).

The harness overrides your container’s `ENTRYPOINT` and `CMD` to keep it running as an environment. Your installed software, filesystem, and environment variables are available to the agent; your container’s startup command is not executed. If you need a background process (such as a dev server), start it via `InvokeAgentRuntimeCommand` after the session begins.

**Example**  

```
aws bedrock-agentcore-control create-harness \
  --harness-name "CodingAgent" \
  --execution-role-arn "arn:aws:iam::123456789012:role/MyHarnessRole" \
  --environment-artifact '{"containerConfiguration": {"containerUri": "123456789012.dkr.ecr.us-west-2.amazonaws.com/my-dev-env:latest"}}' \
  --system-prompt '[{"text": "You are an expert TypeScript developer."}]'
```
The execution role needs ECR pull permissions. See the [execution role policy](harness-security.md#harness-execution-role-policy) for details.
Scaffold a harness with a Dockerfile. The Dockerfile must exist before you run `agentcore add harness`. The CLI copies it to `app/<name>/Dockerfile`.  

```
agentcore create --name CodingAgentProject --template empty
cd CodingAgentProject
# Create ./Dockerfile before you add the harness
agentcore add harness \
  --name coding_agent \
  --dockerfile ./Dockerfile
agentcore deploy
```
At deploy, AWS CodeBuild builds the image in your account, pushes it to ECR, and attaches it to the harness. This cloud build does not require a local Docker daemon.  
Or reference a pre-built image:  

```
agentcore add harness \
  --name node_agent \
  --container-uri public.ecr.aws/docker/library/node:slim
agentcore deploy
```

## Environment variables
<a name="harness-env-vars"></a>

Set environment variables that are passed to the runtime container. Environment variables are available to the agent and any custom container running in the session.

**Example**  

```
aws bedrock-agentcore-control create-harness \
  --harness-name "MyHarness" \
  --execution-role-arn "arn:aws:iam::123456789012:role/MyHarnessRole" \
  --environment-variables '{"MY_API_URL": "https://api.example.com", "LOG_LEVEL": "debug"}'
```
Set environment variables when you add the harness:  

```
agentcore add harness \
  --name MyHarness \
  --environment-variables '{"MY_API_URL":"https://api.example.com","LOG_LEVEL":"debug"}'
agentcore deploy
```

## Filesystem
<a name="harness-filesystem"></a>

The harness mounts persistent storage at paths you specify. Files written to these mounts survive session termination and are visible to later invocations.

A harness supports three filesystem types:
+  **Session storage** - service-managed, per-session storage that persists across stop/resume cycles for the same `runtimeSessionId`. No VPC required.
+  **Amazon EFS access point** - bring-your-own EFS file system, shared across sessions and agents. VPC required.
+  **Amazon S3 Files access point** - bring-your-own S3 Files file system that syncs bidirectionally with an S3 bucket. VPC required.

For prerequisites (VPC networking, IAM permissions, security groups), type comparison, limits, and lifecycle behavior, see [File system configurations for AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-filesystem-configurations.html). The same requirements apply to harnesses.

### Session storage
<a name="_session_storage"></a>

Files written to the mount path persist across stop/resume cycles when you invoke with the same `runtimeSessionId`.

**Example**  

```
aws bedrock-agentcore-control update-harness \
  --harness-id "MyHarness-UuFdkQoXSL" \
  --environment '{"agentCoreRuntimeEnvironment": {"filesystemConfigurations": [{"sessionStorage": {"mountPath": "/mnt/data/"}}]}}'
```

```
agentcore add harness \
  --name my_agent \
  --session-storage-path /mnt/data/
agentcore deploy
```

### Amazon EFS access point
<a name="_amazon_efs_access_point"></a>

Attach an EFS access point ARN at a mount path under `/mnt`. Data persists in your account and can be shared with other harnesses or agent runtimes that mount the same access point.

**Example**  

```
aws bedrock-agentcore-control create-harness \
  --harness-name "SharedToolsAgent" \
  --execution-role-arn "arn:aws:iam::123456789012:role/MyHarnessRole" \
  --environment '{
    "agentCoreRuntimeEnvironment": {
      "networkConfiguration": {
        "networkMode": "VPC",
        "networkModeConfig": {
          "subnets": ["subnet-abc123", "subnet-def456"],
          "securityGroups": ["sg-abc123"]
        }
      },
      "filesystemConfigurations": [
        {
          "efsAccessPoint": {
            "accessPointArn": "arn:aws:elasticfilesystem:us-west-2:123456789012:access-point/fsap-0123456789abcdef0",
            "mountPath": "/mnt/efs"
          }
        }
      ]
    }
  }'
```
Attach an EFS access point with `--efs-access-points`. EFS requires VPC network mode:  

```
agentcore add harness \
  --name shared_tools \
  --network-mode VPC \
  --network-config '{"subnets":["subnet-0123456789abcdef0","subnet-0123456789abcdef1"],"securityGroups":["sg-0123456789abcdef0"]}' \
  --efs-access-points '[{"accessPointArn":"arn:aws:elasticfilesystem:us-west-2:123456789012:access-point/fsap-0123456789abcdef0","mountPath":"/mnt/efs"}]'
agentcore deploy
```
The mount path must be under `/mnt`. You can configure up to two EFS mounts. EFS and S3 Files mounts require `--network-mode VPC` and `--network-config`.

### Amazon S3 Files access point
<a name="_amazon_s3_files_access_point"></a>

Attach an S3 Files access point ARN at a mount path under `/mnt`. Files at the mount path sync bidirectionally with the backing S3 bucket.

**Example**  

```
aws bedrock-agentcore-control create-harness \
  --harness-name "DataAgent" \
  --execution-role-arn "arn:aws:iam::123456789012:role/MyHarnessRole" \
  --environment '{
    "agentCoreRuntimeEnvironment": {
      "networkConfiguration": {
        "networkMode": "VPC",
        "networkModeConfig": {
          "subnets": ["subnet-abc123", "subnet-def456"],
          "securityGroups": ["sg-abc123"]
        }
      },
      "filesystemConfigurations": [
        {
          "s3FilesAccessPoint": {
            "accessPointArn": "arn:aws:s3files:us-west-2:123456789012:file-system/fs-0123456789abcdef0/access-point/fsap-0123456789abcdef0",
            "mountPath": "/mnt/s3data"
          }
        }
      ]
    }
  }'
```
Attach an S3 Files access point with `--s3-access-points`. S3 Files requires VPC network mode:  

```
agentcore add harness \
  --name data_agent \
  --network-mode VPC \
  --network-config '{"subnets":["subnet-0123456789abcdef0","subnet-0123456789abcdef1"],"securityGroups":["sg-0123456789abcdef0"]}' \
  --s3-access-points '[{"accessPointArn":"arn:aws:s3files:us-west-2:123456789012:file-system/fs-0123456789abcdef0/access-point/fsap-0123456789abcdef0","mountPath":"/mnt/s3data"}]'
agentcore deploy
```
You can configure up to two S3 Files mounts.

**Important**  
 `UpdateHarness` replaces the entire `filesystemConfigurations` list. To add a new mount to a harness that already has filesystems configured, call `GetHarness` first, then send the full desired list (existing entries plus the new one) in `UpdateHarness`.

Learn more: [File system configurations for AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-filesystem-configurations.html).

#### Related topics
<a name="_related_topics"></a>
+  [Skills](harness-skills.md) - attach skills from Git, S3, or AWS Skills
+  [Memory](harness-memory.md) - persist conversations across sessions
+  [Tools](harness-tools.md) - connect tools to your harness
+  [Security and access controls](harness-security.md) - execution role policies and VPC configuration
+  [API Documentation](harness-get-started.md#api-documentation) 