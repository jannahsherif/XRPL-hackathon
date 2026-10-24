

# Get started with Amazon Bedrock Managed Agents (with OpenAI) on AgentCore Runtime
<a name="runtime-get-started-bma"></a>

**Note**  
Amazon Bedrock Managed Agents (with OpenAI) is in preview. Features and APIs may change before general availability.

Amazon Bedrock Managed Agents runs the OpenAI Codex harness on AWS. The harness runs the loop between the model and the tools, keeps the session, and compacts context as the conversation grows. When the agent must run a command or work with files, Bedrock Managed Agents sends the work to an environment. You decide where that environment runs.

You can run the Codex exec-server on your own computer for local development. For other workloads, Bedrock Managed Agents invokes an AgentCore Runtime in your account. The Runtime gives each session its own microVM. The session runs under an execution role that you control, and the Runtime can connect to your VPC so that the agent can reach private resources. The model calls stay in Bedrock Managed Agents, so the container runs only the commands that the agent sends.

In this tutorial, you do these tasks:
+ Create and deploy the Runtime with the AgentCore CLI.
+ Start a session with the OpenAI SDK. The agent uses a sample skill in your Runtime.
+ (Optional) Add your own skills.

Steps 1 to 4 take about 15 minutes.

The AWS resources that you create in this tutorial might result in charges to your AWS account. These resources include the Runtime, the AWS CodeBuild image builds, and the Bedrock Managed Agents model calls. For more information, see [AgentCore pricing](https://aws.amazon.com/bedrock/agentcore/pricing/). To stop the charges, remove the resources in [Step 8: Clean up](#runtime-get-started-bma-clean-up).

## Prerequisites
<a name="runtime-get-started-bma-prerequisites"></a>
+  **Node.js 20.12 or later.** The AgentCore CLI is distributed as an npm package. Check with `node --version`.
+  **uv.** The sample client uses [uv](https://docs.astral.sh/uv/) to run with Python 3.12 or later and to install its Python dependencies.
+  **An AWS account with credentials configured.** To create an account, see [Getting started with an AWS account](https://docs.aws.amazon.com/accounts/latest/reference/getting-started.html). To configure credentials, see [Configuring the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).
+  **IAM permissions.** Your identity needs permissions to make AgentCore API calls and to assume the CDK bootstrap roles used during deployment. See [Use the AgentCore CLI](runtime-permissions.md#runtime-permissions-cli). The sample client also needs IAM permissions. See [The session role](#runtime-get-started-bma-session-role).
+  **Model access.** Your account needs access to the Bedrock Managed Agents model `openai.gpt-5.6-luna`.

The CLI builds the container image with AWS CodeBuild in your account, so you do not need Docker.

## Step 1: Create the project
<a name="runtime-get-started-bma-create"></a>

Install the AgentCore CLI, and set your credentials and Region:

```
npm install -g @aws/agentcore
agentcore --version

export AWS_PROFILE=your-profile
export AWS_REGION=us-east-1
```

Create the project from the `environment-python-bma` template:

```
agentcore create --name MyManagedAgent --template environment-python-bma
cd MyManagedAgent
```

You can also run `agentcore create` with no flags. Choose **code-based**, and then choose the `environment-python-bma` template.

The project has the Runtime configuration in `agentcore/agentcore.json` and the container source in `app/agent/`. The Runtime is named `agent`. The container runs `codex exec-server`, which connects out to Bedrock Managed Agents and runs the commands of the agent.

The template configures the Runtime with these defaults:
+ A 30 minute idle timeout and an 8 hour maximum lifetime. See [Configure lifecycle settings](runtime-lifecycle-settings.md).
+ An execution role with the permissions in `policies/bma-acr-policy.json`.

If you set `executionRoleArn` on the runtime in `agentcore/agentcore.json`, the CLI uses your existing role. It cannot attach `policies/bma-acr-policy.json` to that role. Grant the role `bedrock-mantle:RegisterEnvironment` and `bedrock-mantle:ConnectEnvironment` before you deploy.

### Project structure
<a name="runtime-get-started-bma-project-structure"></a>

```
MyManagedAgent/
├── agentcore/
│   ├── agentcore.json
│   ├── aws-targets.json
│   └── cdk/
└── app/agent/
    ├── Dockerfile
    ├── lifecycle/server.py
    ├── otel/collector.yaml
    ├── plugins/acr-report/
    ├── policies/
    │   ├── bma-acr-policy.json
    │   ├── bma-session-trust.json
    │   └── bma-session-policy.json
    ├── pyproject.toml
    ├── client.py
    └── README.md
```

Key files:
+  `lifecycle/server.py` - The lifecycle server. Bedrock Managed Agents calls it to start `codex exec-server` in your Runtime session. Do not change this file.
+  `Dockerfile` - Installs Codex, the CloudWatch agent, and Python, and copies `lifecycle/`, `otel/`, and `plugins/` to `/opt/bma`.
+  `otel/collector.yaml` - Sends the spans and logs of the exec-server to X-Ray and CloudWatch Logs.
+  `plugins/acr-report/` - A sample plugin with one skill. The skill saves `acr-report.txt` in the workspace.
+  `policies/bma-acr-policy.json` - The policy of the Runtime execution role. Allows `bedrock-mantle:RegisterEnvironment` and `bedrock-mantle:ConnectEnvironment`. To limit it to one project, change `Resource` to `arn:aws:bedrock-mantle:<region>:<account-id>:project/<project-id>`.
+  `pyproject.toml` - The Python dependencies. The `dev` group is for `client.py` only.
+  `policies/bma-session-trust.json` and `policies/bma-session-policy.json` - The trust policy and the permissions of the session role. See [The session role](#runtime-get-started-bma-session-role).
+  `client.py` - A sample client that starts a session. You run it in Step 3.

### Deploy the Runtime in a VPC
<a name="runtime-get-started-bma-vpc"></a>

Create the project from the `environment-python-bma` template as shown above. Then add the following fields to the `agent` Runtime entry in `agentcore/agentcore.json`:

```
{
  "networkMode": "VPC",
  "networkConfig": {
    "vpcId": "vpc-0123456789abcdef0",
    "subnets": ["subnet-0123456789abcdef0"],
    "securityGroups": ["sg-0123456789abcdef0"]
  }
}
```

Replace the IDs with the IDs of your VPC, subnets, and security groups. A container build in VPC mode needs `vpcId`.

The subnets must have a route to the Bedrock Managed Agents endpoint, because the exec-server connects out to it. The image build runs in the same subnets and downloads Codex and Python, so the subnets also need a route to the internet. See [Configure AgentCore for VPC](agentcore-vpc.md).

### Configure the Bedrock Managed Agents session role
<a name="runtime-get-started-bma-provision-session-role"></a>

The Runtime execution role registers and connects the environment. The session role is different: Bedrock Managed Agents assumes it to call the model and invoke or stop your Runtime. The CLI template does not automatically create or select this session role.

To provision the session role with the generated CDK application, edit `agentcore/cdk/lib/cdk-stack.ts`. Replace the constructor’s existing assignment to `this.application` with the following code:

```
const applicationProps = {
  ...props.application,
  spec: {
    ...props.application.spec,
    runtimes: (props.application.spec.runtimes ?? []).map(runtime =>
      runtime.name === 'agent'
        ? { ...runtime, bedrockManagedAgents: true }
        : runtime
    ),
  },
};
this.application = new AgentCoreApplication(this, 'Application', applicationProps);
```

This sets the L3 construct’s activation marker after the project has been loaded. Do not add `bedrockManagedAgents` to `agentcore.json`; it is not a supported CLI Runtime field. If you renamed the Runtime, replace `agent` in the snippet with its logical name.

The L3 session role trusts `bedrock-mantle.amazonaws.com`, with source-account and source-ARN conditions for sessions and projects in the deployment account and Region. It grants `bedrock-mantle:CreateInference`, and `bedrock-agentcore:InvokeAgentRuntime` and `bedrock-agentcore:StopRuntimeSession` for the marked Runtime and its endpoints. It also grants `bedrock-agentcore:InvokeGateway` for Gateways throughout that account and Region, not just this project’s Gateways. Review those grants for your workload.

Alternatively, create or obtain a session role with the trust and permissions in the [Bedrock Managed Agents security guide](https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-managed-agents-openai-security.html). In either case, the role must be in the calling account, and your client identity must be authorized to pass that specific role to Bedrock Managed Agents.

## Step 2: Deploy
<a name="runtime-get-started-bma-deploy"></a>

```
agentcore deploy
agentcore status --json
```

The CLI builds the image with AWS CodeBuild in your account, and deploys the Runtime and its execution role. Bedrock Managed Agents invokes the Runtime for you.

**Note**  
 `agentcore dev` does not support the `environment-python-bma` template. In a project with other supported Runtimes, it skips this Runtime unless you select it explicitly, in which case it reports that local development is unsupported. Deploy the environment and use `client.py` as shown in Step 3. This limitation does not prevent running the Codex exec-server independently on your own computer.

Save the `arn` of the `agent` Runtime from the output of `agentcore status --json`:

```
{
  "resourceType": "runtime",
  "name": "agent",
  "deploymentState": "deployed",
  "arn": "arn:aws:bedrock-agentcore:us-east-1:111122223333:runtime/MyManagedAgent_agent-a1b2c3d4e5"
}
```

The CDK session-role setup above also produces a CloudFormation output described as `IAM role ARN for Bedrock Managed Agents sessions`. Read it from the deployed stack’s **Outputs** tab, or use the stack name shown during deployment:

```
aws cloudformation describe-stacks \
  --stack-name <stack-name> \
  --query "Stacks[0].Outputs[?Description=='IAM role ARN for Bedrock Managed Agents sessions'].OutputValue" \
  --output text
```

Save this ARN for `SESSION_ROLE_ARN` in the client. It is not the Runtime execution-role ARN, and `agentcore status` does not report this session-role output. Authorize your client identity for `iam:PassRole` on this ARN, with `iam:PassedToService` set to `bedrock-mantle.amazonaws.com`, in addition to the session/event permissions in the Bedrock Managed Agents security guide.

## Step 3: Run a session
<a name="runtime-get-started-bma-client"></a>

Bedrock Managed Agents uses a session role to call the model and to invoke your Runtime. The session role is not the Runtime execution role. **When you run `client.py`, it creates the session role in your account.** `agentcore deploy` does not create the session role, and `agentcore remove` does not delete it. See [The session role](#runtime-get-started-bma-session-role).

Run the client from the Runtime directory:

```
cd app/agent
uv run client.py --runtime <runtime-arn>
```

 `uv run` installs the dependencies and the `dev` group from `pyproject.toml` in `.venv`. The client creates a session and prints the session ID, each command with its output, and the answer of the agent. By default, the agent uses the `acr-report` skill to save `acr-report.txt` in the workspace.

The next section tells you how the client manages the session role, and which IAM permissions you need to run the client.

### The session role
<a name="runtime-get-started-bma-session-role"></a>

The session role is not the Runtime execution role. `agentcore deploy` creates the execution role with `policies/bma-acr-policy.json`. The client gives the session role to Bedrock Managed Agents in the `role_arn` field when it creates a session.

When you start a new session and do not give `--role-arn`, the client does these steps:

1. If the role `BmaSessionRole-<region>` does not exist, the client creates it.

1. The client compares the trust policy and the inline policy `BmaSession` of the role with `policies/bma-session-trust.json` and `policies/bma-session-policy.json`. If a policy is not the same, the client writes the file to the role. The files are limited to the account and the Region of the Runtime.

1. If the client changed the role, it waits 15 seconds. IAM needs this time before Bedrock Managed Agents can use the change.

To change the role, change the files. The client does not remove other policies that someone adds to the role. It does not check the role when you give `--session-id`, and it does not change a role that you give with `--role-arn`.

For production, give the client a role for one Runtime and one gateway with `--role-arn`. To make the role, use the two files in `policies/`. Put in your partition, Region, and account ID, and change the ` ` in `runtime/` and `gateway/*` to your Runtime ID and gateway ID. Do not change the files in the project, because all the projects in the Region share `BmaSessionRole-<region>`.

The identity that runs the client needs the Bedrock Managed Agents client permissions, `bedrock-mantle:CallWithBearerToken`, and `iam:PassRole` on the session role. To let the client create and repair the role, also give `iam:GetRole`, `iam:CreateRole`, `iam:UpdateAssumeRolePolicy`, `iam:GetRolePolicy`, and `iam:PutRolePolicy` on `arn:aws:iam::<account-id>:role/BmaSessionRole-*`. If you give `--role-arn`, the client does not need these five permissions.

For the trust policy, the permissions of the session role, and the client permissions, see [Security and IAM roles](https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-managed-agents-openai-security.html) in the *Amazon Bedrock User Guide*.

### How the client works
<a name="runtime-get-started-bma-client-code"></a>

The client uses the `client.beta.agents` resources of the `openai` package. Bedrock Managed Agents runs the agent loop.

When the client creates the session, it sets these values in `environment`:
+  `type` - `aws_bedrock_agentcore`, which tells Bedrock Managed Agents to use an AgentCore Runtime.
+  `runtime_arn` - Your Runtime. The session runs in the Region of the Runtime.
+  `workspace_directory` - The directory where the agent runs its commands. The client uses `/home/app/workspace`. The lifecycle server creates the directory.
+  `runtime_qualifier` - The endpoint of the Runtime. The client uses `DEFAULT`.
+  `capability_directories` - The directories where Bedrock Managed Agents finds skills. The client uses `/opt/bma/plugins`.

The client also sets `role_arn` in `extra_body` to the session role. The `openai` package does not have a parameter for this field.

The `provide_token` helper uses your AWS credentials to get a short-lived Amazon Bedrock bearer token for each request.

If you add a gateway to the project, give its ARN from the output of `agentcore deploy` with `--gateway`. Use the flag only for a new session. The client adds the gateway as an `mcp` tool with the ARN in `connector_id`. Bedrock Managed Agents calls the gateway with the session role. The gateway must support MCP version `2025-03-26`. If it does not, the agent gets no gateway tools, and Bedrock Managed Agents does not show an error.

```
"""Send an input to a Bedrock Managed Agents session that uses this project's ACR."""

import argparse
import json
import time
from pathlib import Path
from typing import Any

import boto3
from aws_bedrock_token_generator import provide_token
from botocore.exceptions import ClientError
from openai import NotFoundError, OpenAI

BMA_MODEL_ID = "openai.gpt-5.6-luna"
SESSION_ROLE_ARN = "arn:aws:iam::111122223333:role/your-bma-session-role"
WORKSPACE_DIRECTORY = "/home/app/workspace"
CAPABILITY_DIRECTORIES = ["/opt/bma/plugins"]
TURN_END = ("completed", "failed", "cancelled")
TOOL_CALLS = ("mcp_call", "function_call", "web_search_call")
POLICIES = Path(__file__).parent / "policies"
SESSION_ROLE = "BmaSessionRole-{region}"
SESSION_POLICY = "BmaSession"


def show(data: dict[str, Any]) -> None:
    """Prints the session ID, the commands, the tool calls, and the answer."""
    kind = data["type"].removeprefix("agent.session.")
    item = data.get("item") or {}
    if kind == "created":
        print(f"Session {data['session']['id']}")
    elif kind == "turn.output_text.delta":
        print(data["delta"], end="", flush=True)
    elif kind == "turn.item.done" and item.get("type") == "command_execution":
        print(f"\n$ {item['command']}\n{item.get('output') or ''}".rstrip())
    elif kind == "turn.item.done" and item.get("type") in TOOL_CALLS:
        print(f"\nTool {item.get('name') or item['type']} {item.get('status')}")
    elif kind == "error" or kind.split(".")[-1] in TURN_END:
        source = data.get("turn") or data.get("environment") or data.get("session")
        print(f"\n{kind} {(source or data).get('error') or ''}".rstrip())


def load_policy(name: str, partition: str, region: str, account: str) -> str:
    """Reads a policy file and puts in the partition, the Region, and the account."""
    text = (POLICIES / name).read_text()
    for key, value in (("Partition", partition), ("Region", region), ("AccountId", account)):
        text = text.replace("${AWS::" + key + "}", value)
    return text


def session_role(runtime_arn: str) -> str:
    """Creates or repairs the session role, and returns its ARN.

    If the trust policy or the policy of the role is not the same as the file in `policies/`,
    the client writes the file to the role.
    """
    _, partition, _, region, account = runtime_arn.split(":")[:5]
    name = SESSION_ROLE.format(region=region)
    trust = load_policy("bma-session-trust.json", partition, region, account)
    policy = load_policy("bma-session-policy.json", partition, region, account)
    iam = boto3.client("iam")
    changed = False
    try:
        role = iam.get_role(RoleName=name)["Role"]
    except iam.exceptions.NoSuchEntityException:
        role = iam.create_role(RoleName=name, AssumeRolePolicyDocument=trust)["Role"]
        print(f"Created the session role {name}")
        changed = True
    else:
        if role["AssumeRolePolicyDocument"] != json.loads(trust):
            iam.update_assume_role_policy(RoleName=name, PolicyDocument=trust)
            print(f"Updated the trust policy of {name}")
            changed = True
    try:
        current = iam.get_role_policy(RoleName=name, PolicyName=SESSION_POLICY)["PolicyDocument"]
    except iam.exceptions.NoSuchEntityException:
        current = None
    if current != json.loads(policy):
        iam.put_role_policy(RoleName=name, PolicyName=SESSION_POLICY, PolicyDocument=policy)
        if not changed:
            print(f"Updated the policy of {name}")
        changed = True
    if changed:
        # IAM needs some seconds before Bedrock Managed Agents can use a new or changed role.
        time.sleep(15)
    return role["Arn"]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--runtime", required=True, help="The ACR ARN.")
    parser.add_argument(
        "--session-id",
        help="The BMA session ID. If it does not exist, the client creates a session.",
    )
    parser.add_argument(
        "--input",
        default="Use the acr-report skill to save an ACR report in the workspace.",
    )
    parser.add_argument(
        "--gateway",
        help="The Gateway ARN from the output of `agentcore deploy`.",
    )
    parser.add_argument(
        "--role-arn",
        help="The session role that BMA assumes. If you do not give it, the client creates a role.",
    )
    parser.add_argument("--delete", action="store_true", help="Delete the session.")
    parser.add_argument("--raw", action="store_true", help="Print events as JSON.")
    args = parser.parse_args()
    # BMA must run in the Region of the ACR.
    region = args.runtime.split(":")[3]

    with OpenAI(
        api_key=lambda: provide_token(region=region),
        base_url=f"https://bedrock-mantle.{region}.api.aws/openai/v1",
    ) as client:
        sessions = client.beta.agents.sessions
        session_id = args.session_id
        if session_id:
            try:
                session = sessions.retrieve(session_id).model_dump(warnings=False)
            except NotFoundError:
                print(f"Session {session_id} does not exist.")
                session_id = None
            else:
                if session["environment"].get("runtime_arn") != args.runtime:
                    raise ValueError(f"Session {session_id} uses another ACR.")
        if not session_id and not args.role_arn:
            try:
                args.role_arn = session_role(args.runtime)
            except ClientError as error:
                parser.error(
                    f"The client cannot create or check the session role: {error}. "
                    "Get the IAM permissions in README.md, or give --role-arn."
                )
            print(f"Session role {args.role_arn}")

        if session_id:
            # BMA opens the stream only with stream=true, and the SDK does not send it.
            events = sessions.events.stream(session_id, extra_query={"stream": "true"})
            message = {
                "role": "user",
                "content": [{"type": "input_text", "text": args.input}],
            }
            sessions.events.create(
                session_id,
                events=[{"type": "agent.session.input.message", "input": [message]}],
            )
        else:
            agent: dict[str, Any] = {
                "model": BMA_MODEL_ID,
                "instructions": "Use the available tools to complete the task.",
            }
            if args.gateway:
                # Bedrock Managed Agents calls Gateway with the session role from the service side.
                agent["tools"] = [
                    {"type": "mcp", "server_label": "team_tools", "connector_id": args.gateway}
                ]
                args.input += " Then list the tools that the Gateway gives you."
            events = sessions.create(
                agent=agent,
                environment={
                    "type": "aws_bedrock_agentcore",
                    "runtime_arn": args.runtime,
                    "runtime_qualifier": "DEFAULT",
                    "workspace_directory": WORKSPACE_DIRECTORY,
                    "capability_directories": CAPABILITY_DIRECTORIES,
                },
                input=args.input,
                stream=True,
                # The SDK has no role_arn parameter. BMA assumes this role to call the ACR.
                extra_body={"role_arn": args.role_arn},
            )

        with events:
            for event in events:
                data = event.model_dump(mode="json", warnings=False)
                session_id = session_id or (data.get("session") or {}).get("id")
                if args.raw:
                    print(json.dumps(data), flush=True)
                else:
                    show(data)
                if data["type"].removeprefix("agent.session.turn.") in TURN_END:
                    break

        if args.delete:
            sessions.delete(session_id)
            print(f"\nDeleted session {session_id}")


if __name__ == "__main__":
    main()
```

## Step 4: Continue the session
<a name="runtime-get-started-bma-continue"></a>

To send another input to the same session, add the session ID. The turn uses the same workspace. To keep the workspace after an idle stop, add session storage as in [Keep files after an idle stop](#runtime-get-started-bma-keep-files).

```
uv run client.py --runtime <runtime-arn> --session-id <session-id> \
  --input "Run cat acr-report.txt and show the output."
```

If the session does not exist, the client creates a new session and prints its ID. Add `--delete` to delete the session after the turn, or `--raw` to print each event as JSON.

### Keep files after an idle stop
<a name="runtime-get-started-bma-keep-files"></a>

Files in the home directory are removed when the Runtime session stops after the idle timeout. On a microVM Runtime, put the home directory of the exec-server on session storage. Then the workspace, the connection state, and `CODEX_HOME` stay after an idle stop.

1. Create the project from the `environment-python-bma` template as shown in Step 1. Then add the following fields to the `agent` Runtime entry in `agentcore/agentcore.json`. The `BMA_HOME_DIR` variable moves the home directory of the exec-server to the session storage mounted at `/mnt/home`.

   ```
   {
     "filesystemConfigurations": [
       {
         "sessionStorage": {
           "mountPath": "/mnt/home"
         }
       }
     ],
     "envVars": [
       {
         "name": "BMA_HOME_DIR",
         "value": "/mnt/home"
       }
     ]
   }
   ```

1. In `client.py`, set `WORKSPACE_DIRECTORY = "/mnt/home/workspace"`.

1. Deploy, and run the client.

A workspace directory on session storage works only on a Runtime that has session storage. For more information about session storage, see [File system configurations for AgentCore Runtime](runtime-filesystem-configurations.md).

## Step 5: (Optional) Add skills
<a name="runtime-get-started-bma-skills"></a>

To add a skill to the image, add a plugin under `plugins/` and deploy. A plugin has a `.codex-plugin/plugin.json` file and a `skills/` directory. The `skills/` directory has one subdirectory for each skill, with a `SKILL.md` file in it. The image copies it to `/opt/bma/plugins`, which the client already gives to Bedrock Managed Agents.

To start, copy `plugins/acr-report/`, and rename the plugin directory and `skills/acr-report/` to the name of your plugin and your skill. In `plugin.json`, set `name`, `version`, `description`, and `"skills": "./skills/"`. Each `SKILL.md` starts with front matter that has `name` and `description`. After the deploy, start a new session with `--input "Use the <skill-name> skill to …​"`.

### Share skills from an Amazon S3 bucket
<a name="runtime-get-started-bma-skills-s3"></a>

Mount an S3 Files access point in the Runtime. Then the skills change when the bucket changes, and the image stays the same. For the S3 Files file system, the access point, and the security group rules, see [File system configurations for AgentCore Runtime](runtime-filesystem-configurations.md).

An S3 Files mount needs a Runtime in VPC network mode. Configure the Runtime with the network options in [Deploy the Runtime in a VPC](#runtime-get-started-bma-vpc).

In the bucket, put each plugin in its own directory under the root directory of the access point. Use the same layout as `plugins/acr-report/`: `<plugin>/.codex-plugin/plugin.json` and `<plugin>/skills/<skill>/SKILL.md`.

Add the mount to the entry for the Runtime in `agentcore/agentcore.json`:

```
{
  "filesystemConfigurations": [
    {
      "s3FilesAccessPoint": {
        "accessPointArn": "arn:aws:s3files:us-east-1:111122223333:file-system/fs-0123456789abcdef0/access-point/fsap-0123456789abcdef0",
        "mountPath": "/mnt/skills"
      }
    }
  ]
}
```

Then set `CAPABILITY_DIRECTORIES` in `client.py` to `["/opt/bma/plugins", "/mnt/skills"]`, and deploy.

## Step 6: View logs and traces
<a name="runtime-get-started-bma-observe"></a>

Search the Runtime logs from the last 15 minutes, and list the recent traces:

```
agentcore logs runtime --since 15m
agentcore traces runtime list --since 30m
```

 `agentcore deploy` turns on CloudWatch Transaction Search in your account. The traces show after about 10 minutes. To see the traces in the console, open the CloudWatch console and choose **GenAI Observability**. Each call from Bedrock Managed Agents to the lifecycle server has one `bma.invocation` span. For more information, see [View observability data for your Amazon Bedrock AgentCore agents](observability-view.md).

**Transaction Search settings apply to the entire account**  
Transaction Search and its span indexing apply to the entire account in the Region, and additional charges might apply. To keep your current settings, add `"disableTransactionSearch": true` to `~/.agentcore/config.json` before you deploy.

## Step 7: Update and redeploy
<a name="runtime-get-started-bma-update"></a>

Change the Runtime settings in `agentcore/agentcore.json`, or the files of the image, and deploy again. For example, this setting stops an idle session after 10 minutes. The values are in seconds.

```
{
  "lifecycleConfiguration": {
    "idleRuntimeSessionTimeout": 600,
    "maxLifetime": 28800
  }
}
```

```
agentcore deploy
```

The changes apply to new sessions.

### Environment variables of the lifecycle server
<a name="runtime-get-started-bma-env-vars"></a>

Add a variable to `envVars` in the entry for the Runtime, for example:

```
{
  "envVars": [
    { "name": "DISABLE_ADOT_OBSERVABILITY", "value": "true" }
  ]
}
```


| Variable | Default | Description | 
| --- | --- | --- | 
|  `DISABLE_ADOT_OBSERVABILITY`  | Not set | Set to `true` to turn off the traces and the exec-server logs. The lifecycle server still writes its own logs to the log group of the Runtime. | 
|  `BMA_HOME_DIR`  |  `/home/app`  |  `HOME` of the exec-server. | 
|  `BMA_STATE_DIR`  |  `.bma` in `BMA_HOME_DIR`  | The directory of `state.json`, which keeps the connection state of the session. | 
|  `BMA_CODEX_HOME`  |  `.codex` in `BMA_HOME_DIR`  |  `CODEX_HOME` of the exec-server. | 
|  `BMA_CODEX_BINARY`  |  `/opt/bma/bin/codex`  | The Codex binary. | 
|  `BMA_MAX_TURN_LEASE`  |  `300`  | The longest turn lease, in seconds. The lifecycle server changes a longer request to this value. | 

Each image build installs the latest Codex release. The lifecycle server needs Codex 0.154.0 or later. To pin a release, add `CODEX_RELEASE=<version>` next to `CODEX_NON_INTERACTIVE=1` in the `Dockerfile`.

## Step 8: Clean up
<a name="runtime-get-started-bma-clean-up"></a>

To delete a session, add `--delete` to the last run of the client for that session. Then remove the resources of the project, and deploy to delete the Runtime, its execution role, and the stack.

```
agentcore remove all --yes
agentcore deploy --yes
```

The deploy does not delete these resources:
+ The CloudWatch Logs log groups of the Runtime, of the CodeBuild project that builds the image, and of the Lambda function that starts the build.
+ The AWS KMS key of the Amazon ECR repository. The key stays in the **Pending deletion** state for 30 days, and then AWS KMS deletes it.
+ The `CDKToolkit` stack, if the first deploy bootstrapped the account and Region. Other AWS CDK apps can use this stack. Delete it only if no other app uses it.
+ The Transaction Search settings from Step 6.
+ The session role that `client.py` created in Step 3.

To delete the session role, run these commands:

```
aws iam delete-role-policy --role-name BmaSessionRole-<region> --policy-name BmaSession
aws iam delete-role --role-name BmaSessionRole-<region>
```

To find the log groups, run these commands. Then delete each log group.

```
aws logs describe-log-groups --log-group-name-prefix /aws/bedrock-agentcore/runtimes/<project-name>_<agent-name>- --query 'logGroups[].logGroupName'
aws logs describe-log-groups --log-group-name-prefix /aws/codebuild/AgentCore-<project-name>-<target-name>- --query 'logGroups[].logGroupName'
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/AgentCore- --query 'logGroups[].logGroupName'
aws logs delete-log-group --log-group-name <log-group-name>
```

Replace these values:
+  `<project-name>` - The name of the project. In Step 1, it is `MyManagedAgent`.
+  `<agent-name>` - The name of the agent. In Step 1, it is also `MyManagedAgent`.
+  `<target-name>` - The name of the deploy target in `agentcore/aws-targets.json`. The default is `default`. In the CodeBuild names, each underscore (`_`) in the project name and the target name changes to a hyphen (`-`).

The name of the Lambda log group is shortened, as in this example:

```
/aws/lambda/AgentCore-MyManagedAgent--ApplicationAgentMyManage-<suffix>
```

The command lists the Lambda log groups of all AgentCore CLI projects in the Region. Delete only the log groups of your project.

If you added other resources to the project, such as a gateway or a memory, check that the deploy deleted them.

## Related resources
<a name="runtime-get-started-bma-related"></a>
+  [Use the AgentCore CLI](runtime-permissions.md#runtime-permissions-cli) 
+  [Configure lifecycle settings](runtime-lifecycle-settings.md) 
+  [File system configurations for AgentCore Runtime](runtime-filesystem-configurations.md) 
+  [Configure AgentCore for VPC](agentcore-vpc.md) 
+  [View observability data for your Amazon Bedrock AgentCore agents](observability-view.md) 