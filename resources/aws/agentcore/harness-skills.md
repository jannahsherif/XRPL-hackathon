

# Skills
<a name="harness-skills"></a>

 [Agent Skills](https://strandsagents.com/docs/user-guide/concepts/plugins/skills/) are bundles of markdown and scripts that give the agent domain knowledge on demand. Each skill follows the open [AgentSkills.io](https://agentskills.io/specification) standard: a `SKILL.md` file with YAML frontmatter (name, description) and markdown instructions, plus optional `scripts/`, `references/`, and `assets/` directories.

Skills use progressive disclosure: metadata is injected into the system prompt upfront (\~100 tokens), and full instructions are loaded on demand via a tool call. This avoids flooding the context window with instructions the agent may not need.

The harness supports four skill sources:


| Source | Description | When to use | 
| --- | --- | --- | 
|  ** AWS Skills**  | Pre-built skills for AWS services from the [AWS Agent Toolkit](https://github.com/aws/agent-toolkit-for-aws/tree/main/skills). Enable with glob patterns. | You want ready-made AWS expertise with zero setup. | 
|  **Git (HTTPS)**  | Clone a skill from any public or private Git repository. Supports subdirectories. | You want to reference skills from GitHub, GitLab, or any git host without uploading to S3. | 
|  **Amazon S3**  | Fetch a skill from a customer-owned S3 bucket using the execution role. | You want full control over versioning, encryption, and access governance. | 
|  **Path (filesystem)**  | Reference a skill already present on the harness filesystem (baked into the container image or installed via `InvokeAgentRuntimeCommand`). | The skill is part of your container image or was installed at session start. | 

Skills are fetched once per session on the first invocation. Within a session, skills persist on disk across multiple invocations. When the VM expires and a new session starts, skills are re-fetched to guarantee freshness.

When you use a custom container image with Git, Amazon S3, or AWS skills, include `tar` in the image. Give the container user write access to `/tmp`. For details, see [Custom environment (container images)](harness-environment.md#harness-custom-container).

You can set `skills` as a default on the harness (via `CreateHarness` or `UpdateHarness`), or override per invocation. Invoke-time skills are appended after create-time skills; if both define a skill with the same name, the invoke-time version wins.

**Note**  
The `agentcore add harness` wizard does not configure skills. With the AgentCore CLI, pass skills in the `--skills` JSON, as shown in the **AgentCore CLI** tabs in the following sections, or edit the `skills` list in `app/<harness-name>/harness.yaml`.

## AWS Skills
<a name="harness-aws-skills"></a>

 AWS skills are pre-built skills that enable your agents to interact with AWS services. They are organized hierarchically and selected via glob patterns. View their source on [GitHub](https://github.com/aws/agent-toolkit-for-aws/tree/main/skills).


| Category | Pattern | Typical skills | 
| --- | --- | --- | 
| Core skills |  `core-skills/*`  | EC2, S3, Lambda, DynamoDB, CloudWatch, IAM operations. | 
| Analytics skills |  `specialized-skills/analytics-skills/*`  | Athena, Glue, QuickSight, data lake operations. | 
| Operations skills |  `specialized-skills/operations-skills/*`  | Troubleshooting, diagnostics, log analysis. | 
| Storage skills |  `specialized-skills/storage-skills/*`  | S3, EFS, FSx, Backup operations. | 

### Enable all AWS skills
<a name="enable_all_shared_aws_skills"></a>

**Example**  

```
aws bedrock-agentcore-control create-harness \
  --harness-name "MyHarness" \
  --execution-role-arn "${ROLE_ARN}" \
  --skills '[{"awsSkills": {}}]'
```
Or at invoke time:  

```
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    skills=[{"awsSkills": {}}],
    messages=[{"role": "user", "content": [{"text": "List my EC2 instances and their status."}]}],
)
```

```
agentcore add harness \
  --name my_harness \
  --skills '[{"awsSkills":{}}]'

agentcore deploy
```

### Enable skills by category
<a name="_enable_skills_by_category"></a>

Use glob patterns to enable specific skill categories:

**Example**  

```
aws bedrock-agentcore-control create-harness \
  --harness-name "MyHarness" \
  --execution-role-arn "${ROLE_ARN}" \
  --skills '[{"awsSkills": {"paths": ["core-skills/*", "specialized-skills/operations-skills/*"]}}]'
```

```
agentcore add harness \
  --name my_harness \
  --skills '[{"awsSkills":{"paths":["core-skills/*","specialized-skills/operations-skills/*"]}}]'

agentcore deploy
```

### Enable a single specific skill
<a name="_enable_a_single_specific_skill"></a>

```
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    skills=[{"awsSkills": {"paths": ["core-skills/aws-cdk"]}}],
    messages=[{"role": "user", "content": [{"text": "Create a CDK stack for a Lambda function."}]}],
)
```

### Combine multiple patterns
<a name="_combine_multiple_patterns"></a>

```
skills=[{"awsSkills": {"paths": ["core-skills/aws-cdk", "core-skills/aws-serverless", "specialized-skills/storage-skills/*"]}}]
```

**Note**  
Paths must be relative (no leading `/` or `..`). Absolute paths and path traversal are rejected.
If a glob pattern matches no skills, the invocation fails with a descriptive error.
Multiple `awsSkills` entries in the same payload are merged.

## Git (HTTPS) skills
<a name="harness-skills-git"></a>

Clone a skill from any public or private Git repository. Supports subdirectories within monorepos using sparse checkout.

**Example**  
Public repository:  

```
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    skills=[
        {"git": {"url": "https://github.com/anthropics/skills", "path": "skills/docx"}},
    ],
    messages=[{"role": "user", "content": [{"text": "Summarize the attached DOCX file."}]}],
)
```
Private repository (requires a personal access token stored in [AgentCore Identity](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html)):  

```
skills=[
    {
        "git": {
            "url": "https://github.com/my-org/internal-skills",
            "path": "excel",
            "auth": {
                "credentialArn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:token-vault/default/apikeycredentialprovider/my-github-pat"
            },
        }
    }
]
```
Set Git skills in the `--skills` JSON when you add the harness. Use `path` to select a subdirectory:  

```
agentcore add harness \
  --name my_harness \
  --skills '[{"gitUrl":"https://github.com/anthropics/skills","path":"skills/docx"}]'
agentcore deploy
```
For a private repository, add an API key credential containing the personal access token, then reference its project name in `auth.credentialName`:  

```
agentcore add credentials api-key \
  --name my-github-pat \
  --api-key file://github-pat.txt
agentcore add harness \
  --name private_skills \
  --skills '[{"gitUrl":"https://github.com/my-org/internal-skills","path":"excel","auth":{"credentialName":"my-github-pat","username":"oauth2"}}]'
agentcore deploy
```
To change the configured skills, edit the `skills` list in `app/<harness-name>/harness.yaml`, then run `agentcore deploy`. The YAML file uses the API field names (`git.url`, `git.path`, `git.auth`, `s3.uri`), not the `--skills` flag names `gitUrl` and `s3Uri`. Use the SDK when you need invocation-time skill overrides.
+  `url` (required) - HTTPS URL of the Git repository.
+  `path` (optional) - subdirectory within the repo containing the skill. If omitted, the repository root is used.
+  `auth.credentialArn` (optional) - ARN of an API key credential provider holding a personal access token for private repos.
+  `auth.username` (optional) - git username, defaults to `oauth2`.

Git fetch must complete within 60 seconds. If the repository requires internet egress, ensure your VPC has a NAT gateway (same requirement as remote MCP servers and custom container pulls).

## Amazon S3 skills
<a name="harness-skills-s3"></a>

Fetch a skill from a customer-owned S3 bucket. Uses the harness execution role credentials.

**Example**  

```
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    skills=[
        {"s3": {"uri": "s3://my-skills-bucket/skills/company-style/"}},
    ],
    messages=[{"role": "user", "content": [{"text": "Draft a summary following our style guide."}]}],
)
```
Set the S3 skill in the `--skills` JSON:  

```
agentcore add harness \
  --name my_harness \
  --skills '[{"s3Uri":"s3://my-skills-bucket/skills/company-style/"}]'
agentcore deploy
```
The execution role needs `s3:GetObject` and `s3:ListBucket` on the bucket. See [Security and access controls](harness-security.md).
+  `uri` (required) - S3 URI pointing to the skill directory (e.g., `s3://bucket/prefix/`).
+ The execution role must have `s3:GetObject` and `s3:ListBucket` permissions on the bucket. See [Security and access controls](harness-security.md).
+ Each S3 skill must be 1 GB or smaller.
+ S3 sources work with S3 VPC endpoints (no NAT gateway required).

## Filesystem path skills
<a name="harness-skills-path"></a>

Reference a skill already on the harness filesystem - baked into the container image or installed at session start via `InvokeAgentRuntimeCommand`.

**Example**  

```
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    skills=[{"path": ".agents/skills/xlsx"}],
    messages=[{"role": "user", "content": [{"text": "Find errors in the Excel files."}]}],
)
```

```
agentcore add harness \
  --name my_harness \
  --skills '[{"path":".agents/skills/xlsx"}]'
agentcore deploy
```

### Bake into the container image
<a name="_bake_into_the_container_image"></a>

Include the skill directory in your custom image:

```
COPY skills/xlsx .agents/skills/xlsx
```

### Install at session start
<a name="_install_at_session_start"></a>

Use `InvokeAgentRuntimeCommand` before the first agent invocation. The AgentCore CLI wraps it in `agentcore harness exec`. Pass the harness ID, which is the part of the harness ARN after `harness/`. `agentcore status` shows the harness ARN. The session ID must be 33 to 100 characters. Use the same session ID when you invoke the harness. The harness must already list the path skill, as shown in [Filesystem path skills](#harness-skills-path).

```
SESSION_ID="$(uuidgen)"

agentcore harness exec \
  --id "<harness-id>" \
  --session-id "$SESSION_ID" \
  --command "git clone --depth 1 https://github.com/anthropics/skills /tmp/skills && cp -r /tmp/skills/skills/xlsx .agents/skills/xlsx"

agentcore invoke \
  --harness my_harness \
  --session-id "$SESSION_ID" \
  --prompt "Find errors in the Excel files."
```

## Combine multiple skill sources
<a name="harness-skills-combine"></a>

All four source types can coexist in a single payload:

```
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    skills=[
        {"awsSkills": {"paths": ["core-skills/aws-cdk"]}},
        {"git": {"url": "https://github.com/anthropics/skills", "path": "skills/docx"}},
        {"s3": {"uri": "s3://my-bucket/skills/company-style/"}},
        {"path": ".agents/skills/xlsx"},
    ],
    messages=[{"role": "user", "content": [{"text": "Help me with this project."}]}],
)
```

## Error handling
<a name="harness-skills-errors"></a>

All fetch failures fail the invocation with a descriptive error. Skills are never silently skipped.


| Failure | Error message | 
| --- | --- | 
| S3 access denied |  `Failed to fetch skill: AccessDeniedException. Ensure execution role has s3:GetObject permission.`  | 
| S3 object not found |  `Skill source not found: s3://…​`  | 
| Git clone fails (network) |  `Failed to clone skill: could not resolve host`  | 
| Git auth denied |  `Failed to clone skill: authentication failed`  | 
| Git path not found in repo |  `Skill path 'x' not found in repository`  | 
| Git timeout (60s) |  `Failed to clone skill: operation timed out after 60s`  | 
| Skill exceeds 1 GB limit |  `Skill exceeds 1GB size limit`  | 
|  AWS skill path matches nothing |  `AWS skill path 'x' matched no skills`  | 
| Path traversal (`..`) |  `Invalid AWS skill path: must be a relative path without '..'`  | 
|  AWS skills bundle missing |  `AWS Skills are not available in this runtime (missing directory: /opt/amazon/skills)`  | 

## Related topics
<a name="_related_topics"></a>
+  [Tools](harness-tools.md) - connect MCP servers, Gateway, Browser, and Code Interpreter
+  [Environment and filesystem](harness-environment.md) - custom container images and environment configuration
+  [Memory](harness-memory.md) - persist conversations across sessions
+  [Security and access controls](harness-security.md) - execution role policies for skill sources
+  [API Documentation](harness-get-started.md#api-documentation) 