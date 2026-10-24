

# Breaking changes
<a name="agentcore-cli-migration-breaking-changes"></a>

AgentCore CLI v1 keeps project workflows at the top level, groups evaluation workflows under `agentcore eval`, and adds resource commands that work with individual resources outside your project. It has the following breaking changes:
+ Project workflows keep their top-level command paths, such as `agentcore create`, `agentcore add`, `agentcore dev`, `agentcore deploy`, `agentcore invoke`, and `agentcore status`. Use `build` instead of `package` or `validate`. Logs remain under `agentcore logs`, with separate `runtime` and `harness` subcommands.
+ Evaluation workflows moved to `agentcore eval`, including batch evaluations, insights, recommendations, A/B tests, datasets, and configuration bundles.
+ The resource command families `gateway`, `harness`, `identity`, `memory`, `payment`, and `runtime` work directly with individual deployed resources outside a project.
+ Some v0 commands aren’t available in v1. See [Removed commands](#removed-commands).
+ Installing v1 doesn’t convert a v0 project’s files. Use `agentcore migrate` from the existing project directory. See [Migrate an existing project](agentcore-cli-migrate-project.md).

## Project configuration
<a name="breaking-changes_project-format"></a>

The v0 CLI uses `"version": 1` in `agentcore/agentcore.json`. The v1 project format uses `"version": 2`. Use `agentcore migrate` to convert the project instead of editing the version number or copying files into a new project. Migrate before using v1’s project `add` or `remove` workflows.

Harness configuration moves from `harness.json` to `harness.yaml`. The YAML uses nested service API fields, such as `model.bedrockModelConfig`, rather than the flat `provider` and `modelId` keys accepted by `--model`. See [Models and instructions](harness-models.md).

If the CLI reports outdated v0 CDK dependencies, follow its guidance to run `npx @aws/agentcore@0 deploy` once from the original project, then retry migration. Updating those dependencies doesn’t convert the project to the v1 format.

### Resource discovery environment variables
<a name="breaking-changes_resource-environment"></a>

The CDK application uses the v0 discovery names for project Memory, credential providers, and connections:


| Resource | Environment variables | 
| --- | --- | 
| Project Memory |  `MEMORY_<NAME>_ID`, `MEMORY_<NAME>_ARN`  | 
| Credential provider |  `CREDENTIAL_<NAME>_NAME`  | 
| Memory connection |  `MEMORY_<TOKEN>_ID`, `MEMORY_<TOKEN>_ARN`  | 
| Gateway connection |  `GATEWAY_<TOKEN>_URL`, `GATEWAY_<TOKEN>_ARN`, `GATEWAY_<TOKEN>_AUTH_TYPE`, `GATEWAY_<TOKEN>_CREDENTIAL_PROVIDER`  | 
| Runtime connection |  `RUNTIME_<TOKEN>_ARN`  | 
| Browser or code interpreter connection |  `BROWSER_<TOKEN>_ID`, `CODE_INTERPRETER_<TOKEN>_ID`  | 

Don’t add an `AGENTCORE_` prefix to these names when updating v0 agent code. If your code used the prefixed discovery names from a v1 prerelease, update it to the names above. Project Gateway variables (`AGENTCORE_GATEWAY_<NAME>_*`), payment variables (`AGENTCORE_PAYMENT_*`), and explicit binding `envVarName` values are unchanged.

## `agentcore create`
<a name="breaking-changes_agentcore-create"></a>

 `agentcore create` keeps the same command path in v1. Its project-specific flags are `--name`, `--template`, `--skip-install`, and `--skip-git`. Instead of combining `--language`, `--framework`, `--build`, and `--protocol`, choose a complete `--template` to create a project with a runtime.

```
agentcore create --name {{Demo}} --template agent-python-strands # old: agentcore create --name Demo --language Python --framework Strands
```

### Available templates
<a name="breaking-changes_available-templates"></a>


| Template | Language | Framework | Protocol | Build | AgentCore Memory | Model selection in interactive `create`  | 
| --- | --- | --- | --- | --- | --- | --- | 
|  `empty`  | — | — | — | — | — | — | 
|  `agent-python-minimal`  | Python | None | HTTP | CodeZip | — | — | 
|  `agent-python-strands`  | Python | Strands | HTTP | CodeZip | ✓ | ✓ | 
|  `agent-python-strands-container`  | Python | Strands | HTTP | Container | ✓ | ✓ | 
|  `agent-typescript-strands`  | TypeScript | Strands | HTTP | CodeZip | ✓ | ✓ | 
|  `agent-python-langchain`  | Python | LangChain | HTTP | CodeZip | — | — | 
|  `agent-typescript-vercel`  | TypeScript | Vercel AI SDK | HTTP | CodeZip | — | — | 
|  `environment-python-bma`  | Python | Bedrock Managed Agents | HTTP | Container | — | — | 
|  `mcp-python-fastmcp`  | Python | FastMCP | MCP | CodeZip | — | — | 
|  `a2a-python-strands`  | Python | Strands | A2A | CodeZip | ✓ | ✓ | 
|  `agui-python-strands`  | Python | Strands | AG-UI | CodeZip | ✓ | ✓ | 

The GoogleADK and OpenAIAgents frameworks from v0 don’t have v1 templates.

To select another model provider or model, run `agentcore create` interactively. The wizard collects the provider, model, endpoint, and API-key file for templates that support model selection. The noninteractive `agentcore create --template <template>` command uses the template’s default provider and doesn’t accept model flags. TypeScript Strands supports the same model providers as Python Strands except LiteLLM. Use an OpenAI-compatible endpoint instead.

Advanced runtime options, such as `--network-mode`, `--subnets`, `--idle-timeout`, and `--session-storage-mount-path`, aren’t available on `agentcore create`. To register code that you write yourself with advanced settings, use `agentcore add runtime`, which accepts `--network-mode`, `--network-config`, `--lifecycle-configuration`, and `--filesystem-configurations`.

To create a project with a harness, create an empty project and add the harness:

```
agentcore create --name {{CustomerSupport}} --template empty
cd {{CustomerSupport}}
agentcore add harness --name {{Assistant}} # old: agentcore create --name CustomerSupport --defaults
```

To create a harness with advanced settings, use `agentcore add harness`.

## `agentcore add`
<a name="breaking-changes_agentcore-add"></a>

Resource-add workflows keep the `agentcore add` command path. Some command names and inputs changed. The following sections describe each change.

## `agentcore add agent`
<a name="breaking-changes_agentcore-add-agent"></a>

The `agent` resource is now called `runtime`. Use `agentcore add runtime`.

To simplify the flags, AgentCore CLI v1 groups related settings into configuration objects:

```
agentcore add runtime --name {{ConfiguredAssistant}} \
  --language python \
  --protocol HTTP \
  --network-mode VPC \
  --network-config '{"subnets":["subnet-0123456789abcdef0"],"securityGroups":["sg-0123456789abcdef0"],"vpcId":"vpc-0123456789abcdef0"}' \
  --authorizer-type CUSTOM_JWT \
  --authorizer-configuration '{"customJwtAuthorizer":{"discoveryUrl":"https://example.com/.well-known/openid-configuration","allowedClients":["client-id"]}}' \
  --lifecycle-configuration '{"idleRuntimeSessionTimeout":300,"maxLifetime":3600}' \
  --filesystem-configurations '[{"sessionStorage":{"mountPath":"/mnt/data"}}]' \
  --request-header-allowlist {{X-Tenant}}
         {{Authorization}}

# old: agentcore add agent --name ConfiguredAssistant \
#   --language Python --framework Strands --build Container \
#   --network-mode VPC \
#   --subnets subnet-0123456789abcdef0 \
#   --security-groups sg-0123456789abcdef0 \
#   --vpc-id vpc-0123456789abcdef0 \
#   --authorizer-type CUSTOM_JWT \
#   --discovery-url https://example.com/.well-known/openid-configuration \
#   --allowed-clients client-id \
#   --idle-timeout 300 \
#   --max-lifetime 3600 \
#   --session-storage-mount-path /mnt/data \
#   --request-header-allowlist X-Tenant,Authorization
```

The old command uses `--build Container`. To preserve that build type, add a `Dockerfile` to `app/ConfiguredAssistant/` after you run the new command.

 `agentcore add runtime` is the bring-your-own-code workflow. It creates `app/<name>/README.md` and `AGENTS.md` with the contract for the selected `--language` and `--protocol`, but it does not generate application code or dependencies. A new runtime starts as a `CodeZip` build. Add a `Dockerfile` to the runtime directory to switch it to a container build. The `dev`, `build`, and `deploy` commands synchronize the build type, managed runtime version, and entrypoint in `agentcore.json` with the files in the runtime directory.

 `--with-config-bundle` no longer configures both the resource and its consumer integration. Add the bundle separately and configure the application to use it.

## `agentcore add runtime-endpoint`
<a name="breaking-changes_agentcore-add-runtime-endpoint"></a>

 `agentcore add runtime-endpoint` keeps the same command path in v1. The endpoint-name flag changes from `--endpoint` to `--name`.

```
agentcore add runtime-endpoint --runtime {{Assistant}} --name {{prod}} --version {{1}} # old: agentcore add runtime-endpoint --runtime Assistant --endpoint prod --version 1
```

## `agentcore add harness`
<a name="breaking-changes_agentcore-add-harness"></a>

 `agentcore add harness` keeps the same command path in v1.

```
agentcore add harness --name {{Helper}} \
  --model '{"provider":"bedrock","modelId":"global.anthropic.claude-sonnet-4-6"}' \
  --memory '{"mode":"disabled"}' --timeout-seconds 120 # old: agentcore add harness --name Helper --model-provider bedrock --model-id global.anthropic.claude-sonnet-4-6 --no-memory --timeout 120
```

Use `agentcore migrate` to convert an existing project’s Harness configuration. For the v1 YAML format and model credential options, see [Models and instructions](harness-models.md). A project Harness can use a key file or stdin with `--api-key`, a named project credential with `apiKeyCredentialName`, or an existing provider ARN with `apiKeyArn`. Use only one of these credential sources.

## `agentcore add tool`
<a name="breaking-changes_agentcore-add-tool"></a>

AgentCore CLI v1 doesn’t have a command to add an individual tool to a harness. Edit the complete `tools` collection in `app/<harness-name>/harness.yaml`, including any existing tools you want to keep.

For example:

```
tools:
  - name: code_interpreter
    type: agentcore_code_interpreter
  - name: research
    type: remote_mcp
    config:
      remoteMcp:
        url: https://mcp.example.com/mcp

# old: agentcore add tool --harness Assistant \
#   --type remote_mcp --name research \
#   --url https://mcp.example.com/mcp
```

## `agentcore add skill`
<a name="breaking-changes_agentcore-add-skill"></a>

AgentCore CLI v1 doesn’t have a command to add an individual skill to a harness. Edit the complete `skills` collection in `app/<harness-name>/harness.yaml`, including any existing skills you want to keep.

For example:

```
skills:
  - path: /opt/skills/research
  - s3:
      uri: s3://your-skills-bucket/skills/support/

# old: agentcore add skill --harness Assistant \
#   --s3 s3://your-skills-bucket/skills/support/
```

## `agentcore add memory`
<a name="breaking-changes_agentcore-add-memory"></a>

 `agentcore add memory` keeps the same command path in v1.

```
agentcore add memory --name {{Facts}} --event-expiry-duration 30 \
  --strategies SEMANTIC,SUMMARIZATION # old: agentcore add memory --name Facts --expiry 30 --strategies SEMANTIC,SUMMARIZATION
```

## `agentcore add credential`
<a name="breaking-changes_agentcore-add-credential"></a>

Use `agentcore add credentials`. The credential type is now selected with a subcommand instead of the `--type` option.

```
agentcore add credentials api-key --name {{ExternalApi}} # old: agentcore add credential --name ExternalApi --type api-key
```

Use `credentials oauth` for OAuth credentials. API keys and client secrets now take `file://path` or stdin `-`, not literal secret values. OAuth scopes change from `--scopes read,write` to `--scopes read write`. The discovery URL and client ID are still inputs.

Credential names require at least three characters and cannot collide after normalization to environment names. OAuth client IDs are now saved in `agentcore.json` instead of `.env.local`.

Running the add command again with the same credential name is rejected. To rotate a project-managed credential, update its value in `agentcore/.env.local` or its referenced external secret, then deploy the project again. If you omit `--api-key`, the CLI creates an empty entry in `agentcore/.env.local` that you must fill before deployment.

The CLI reads existing v0 encrypted secrets and encrypts local project secrets at rest. Treat values beginning with `enc:v1:` as encrypted data, not as API keys to pass to a flag or service API. Keep access to the local encryption key when using an existing `.env.local` file, and don’t commit that key or the environment file.

## `agentcore add gateway`
<a name="breaking-changes_agentcore-add-gateway"></a>

 `agentcore add gateway` keeps the same command path in v1. Semantic search is no longer enabled by default. To enable it, pass `--enable-semantic-search`:

```
agentcore add gateway --name {{Tools}} --protocol-type MCP \
  --enable-semantic-search --authorizer-type AWS_IAM
```

 `agentcore add gateway` no longer accepts `--client-id` and `--client-secret`, and it no longer stores them as an OAuth credential for the gateway. For JWT authorization, pass `--authorizer-type CUSTOM_JWT` and set `discoveryUrl` and `allowedClients` in `--authorizer-configuration` JSON under `customJwtAuthorizer`. Callers must get their own bearer token from your identity provider.

## `agentcore add gateway-target`
<a name="breaking-changes_agentcore-add-gateway-target"></a>

 `agentcore add gateway-target` keeps the same command path in v1. The common MCP and runtime workflows now use shortcuts instead of a type flag:

```
agentcore add gateway-target --gateway {{Tools}} --name {{RemoteTools}} \
  --endpoint {{https://example.com/mcp}} # old: agentcore add gateway-target ... --type mcp-server --endpoint https://example.com/mcp
```

The MCP endpoint must use HTTPS. For an HTTP runtime target, drop `--type http-runtime` and pass `--runtime`. Select the Runtime endpoint with `--runtime-endpoint`. In v1, `--endpoint` always creates an MCP server target, so don’t use it for the Runtime endpoint. For other target types, pass the complete target object with `--target-configuration`, including its name and authentication. Use only one of `--endpoint`, `--runtime`, or `--target-configuration`.

OAuth scopes move from `--oauth-scopes` CSV to separate `--scope` values or the full JSON authentication configuration.

Knowledge-base connectors move to `agentcore add gateway-connector --connector bedrock-knowledge-bases --knowledge-base …​`. The `--knowledge-base` shortcut requires `--name` and exposes only the Retrieve tool. To also expose AgenticRetrieveStream, pass the full connector definition with `--connector-configuration`. The knowledge base must already exist.

For web search, `--exclude-domains` moves to full connector JSON at `configurations[].parameterValues.domainFilter.exclude`. The shortcut explicitly sets `maxResults:10`.

## `agentcore add policy-engine`
<a name="breaking-changes_agentcore-add-policy-engine"></a>

 `agentcore add policy-engine` keeps the same command path in v1. Gateway attachments take separate values instead of CSV, and **the omitted attachment mode now defaults to ENFORCE instead of LOG\_ONLY**.

To retain a log-only rollout:

```
agentcore add policy-engine --name {{Guardrails}} \
  --attach-to-gateways {{Api}} --attach-mode log-only # old: agentcore add policy-engine --name Guardrails --attach-to-gateways Api
```

The attachment now rejects nonexistent gateways. Name, description, and encryption-key inputs remain. Mode values are `log-only` and `enforce`.

## `agentcore add policy`
<a name="breaking-changes_agentcore-add-policy"></a>

 `agentcore add policy` keeps the same command path in v1. A policy file moves from `--source PATH` to `--statement file://PATH`.

```
--statement {{file://policies/allow.cedar}} # old: --source policies/allow.cedar
```

 `agentcore add policy` doesn’t generate policies or accept form-policy options. To generate a Cedar policy from a natural-language description, run `agentcore gateway policy generate` against the deployed Gateway. Save the generated statement to a file, then add it with `agentcore add policy`.

```
agentcore gateway policy generate --gateway-id {{gateway-id}} \
  --prompt {{'Allow refunds under 100 USD'}} # old: agentcore add policy --generate ...

agentcore add policy --engine {{Guardrails}} --name {{AllowRefunds}} \
  --statement file://{{policies/allow.cedar}}
```

Validation and enforcement values become lowercase and hyphenated. The CLI infers the authorization phase from the statement. A statement that references `suppressOutput` or `context.output` gets `return-output`. Other statements get `initiate`. To always use the INITIATE phase, as v0 did, pass `--authorization-phase initiate`.

## `agentcore add payment-manager`
<a name="breaking-changes_agentcore-add-payment-manager"></a>

 `agentcore add payment-manager` keeps the same command path in v1. Disable automatic payment with a negative flag rather than a boolean argument:

```
agentcore add payment-manager --name {{Checkout}} --no-auto-payment # old: agentcore add payment-manager --name Checkout --auto-payment false
```

Omitting the flag still enables automatic payment. The default spend limit is still `"10.00"`. The CLI rejects a limit that is blank, not a finite number, or negative. Audience, client, scope, tool, and network lists take separate values rather than CSV. Description and JWT inputs have stricter format checks.

The command no longer changes your Runtime code. Add the AgentCore SDK payments integration for your framework to your agent yourself, for example `AgentCorePaymentsPlugin` for Strands Agents. For details, see [Framework integrations](payments-framework-integrations.md).

## `agentcore add payment-connector`
<a name="breaking-changes_agentcore-add-payment-connector"></a>

 `agentcore add payment-connector` keeps the same command path in v1. Coinbase Quick Create uses `--quick-create` instead of `--provision-mode QUICK_CREATE`.

Manual connectors become a two-step workflow: run `agentcore add credentials payment` first, then reference that credential from the connector using `--credential NAME`. Provider identifiers are still literal values. Secrets use files or stdin.

Coinbase and StripePrivy manual connectors remain available. Choose credential names explicitly. CDP API-key secrets must decode to exactly 32 or 64 bytes.

## `agentcore add evaluator`
<a name="breaking-changes_agentcore-add-evaluator"></a>

The evaluator type becomes a child command: `agentcore add evaluator llm-as-a-judge` or `agentcore add evaluator code-based`. LLM evaluator creation now requires a rating scale.

```
agentcore add evaluator llm-as-a-judge --name {{Helpful}} \
  --level SESSION --model global.anthropic.claude-sonnet-4-6 \
  --instructions 'Evaluate whether the assistant helped the user. Context: {context}' \
  --rating-scale '{"categorical":[{"label":"Pass","definition":"Meets the evaluation criteria"},{"label":"Fail","definition":"Does not meet the evaluation criteria"}]}'
```

Custom scales use numerical or categorical JSON instead of colon-delimited input. **Preset names do not preserve the old rubric.** For example, `pass-fail` changes labels from `Pass` / `Fail` to `pass` / `fail`. Preserve the old expanded JSON when scoring definitions or downstream label matching must remain unchanged.

Choose the judge model provider with `--model-provider` (`Bedrock` or `OpenResponses`). The v0 `--config` file option isn’t available, so pass each setting as its own option. For code-based evaluators, use `--timeout-seconds` instead of `--timeout`. The v0 `--3p-template-json` and `--3p-template-json-file` options aren’t available. Implement third-party metrics in your evaluator code instead.

## `agentcore add online-eval`
<a name="breaking-changes_agentcore-add-online-eval"></a>

 `agentcore add online-eval` keeps the same command path in v1. Select the Runtime with `--agent` instead of `-r, --runtime`, and pass evaluator names, `Builtin.*` IDs, or ARNs to `--evaluators` instead of `--evaluator` or `--evaluator-arn`. `--enable-on-create` takes `true` or `false` and defaults to `true`. To add the config paused, pass `--enable-on-create false`.

```
agentcore add online-eval --name {{QualityMonitor}} --agent {{customer_support}} \
  --evaluators Builtin.Helpfulness --sampling-rate 10 # old: agentcore add online-eval --name QualityMonitor -r customer_support -e Builtin.Helpfulness --sampling-rate 10
```

## `agentcore add online-insights`
<a name="breaking-changes_agentcore-add-online-insights"></a>

Use `agentcore add online-insight`. Select the Runtime with `--agent` instead of `-r, --runtime`, and pass insight IDs to `--insight` instead of `--insights`.

## `agentcore add config-bundle`
<a name="breaking-changes_agentcore-add-config-bundle"></a>

 `agentcore add config-bundle` keeps the same command path in v1.

```
agentcore add config-bundle --name {{AssistantConfig}} --branch-name {{mainline}} \
  --components {{file://./bundle-components.json}}

# old: agentcore add config-bundle --name AssistantConfig --branch mainline \
#   --components-file ./bundle-components.json
```

If you omit `--branch-name`, the bundle uses the `mainline` branch. `--components` must contain at least one component. Adding a bundle doesn’t change your application code, so update the application to read the bundle.

## `agentcore add dataset`
<a name="breaking-changes_agentcore-add-dataset"></a>

```
agentcore eval dataset create --name {{OrdersRegression}} \
  --source {{file://./datasets/orders.jsonl}} \
  --schema-type predefined # old: agentcore add dataset --name OrdersRegression --schema-type AGENTCORE_EVALUATION_PREDEFINED_V1
```

## `agentcore add knowledge-base`
<a name="breaking-changes_agentcore-add-knowledge-base"></a>

Knowledge bases are no longer managed by AgentCore CLI. Use the AWS CLI instead:

```
aws bedrock-agent create-knowledge-base \
  --cli-input-json {{file://./knowledge-base.json}}
```

## `agentcore dev`
<a name="breaking-changes_agentcore-dev"></a>

 `agentcore dev` keeps the same command path in v1.

```
agentcore dev --agent {{customer_support}} # old: agentcore dev --runtime customer_support
```

In v0, `agentcore dev` also accepted a prompt to send to a running development server. In v1, use `agentcore invoke --runtime` with `--local`. As in v0, the development server must be running, so start it with `agentcore dev --agent customer_support` in another terminal first.

```
agentcore invoke --runtime {{customer_support}} --local --payload '{"prompt":"Summarize open support tickets"}' # old: agentcore dev 'Summarize open support tickets'
```

Use `--mode browser` to open Agent Inspector. For Harnesses, `dev` deploys the selected Harness rather than running it locally. Use `--skip-deploy` to test an already-deployed Harness. If a project has both Runtimes and Harnesses, select one with `--agent`.

## `agentcore package`
<a name="breaking-changes_agentcore-package"></a>

Use `agentcore build`.

```
agentcore build # old: agentcore package
```

The `--runtime` and `--directory` options are not available in v1.

## `agentcore deploy`
<a name="breaking-changes_agentcore-deploy"></a>

 `agentcore deploy` keeps the same command path in v1. It doesn’t ask for confirmation before a deployment, so you don’t need v0’s `-y`. The v1 `--yes` option has a different purpose. It confirms removing the deployed stack when the project declares no resources.

```
agentcore deploy --target {{default}} # old: agentcore deploy --target prod -y
```

New projects don’t define deployment targets. The first `agentcore deploy` creates a target named `default` from your current account and Region. To use another target, such as `prod`, add an entry to the array in `agentcore/aws-targets.json` before you use it with `deploy` or `status`, for example `{"name":"prod","account":"111122223333","region":"us-east-1"}`. Target names must start with a letter and can contain only letters and digits.

 `--dry-run` isn’t a v1 deployment option. Use `agentcore build` to synthesize the project without deploying. A successful build isn’t a deployment preview and doesn’t prove that an update won’t replace resources.

 `--diff` showed the CDK diff without deploying. In v1, run the CDK command from the generated project:

```
cd agentcore/cdk
npm run cdk -- diff
```

## `agentcore remove`
<a name="breaking-changes_agentcore-remove"></a>

 `agentcore remove` keeps the same command path in v1.

```
agentcore remove runtime --name {{customer_support}} # old: agentcore remove agent --name customer_support
```

```
agentcore remove all --yes # old: agentcore remove all -y
```

## `agentcore invoke`
<a name="breaking-changes_agentcore-invoke"></a>

 `agentcore invoke` keeps the same command path in v1 and invokes a Runtime, harness, or Gateway. Select the resource with `--runtime`, `--harness`, or `--gateway`, even if the project has only one resource. Each option accepts the resource name in the project, its ID, or its ARN.

For a Runtime, send the request body as JSON with `--payload`. The `--prompt` option applies only to harnesses.

```
agentcore invoke --runtime {{customer_support}} --payload '{"prompt":"Which orders are delayed?"}' # old: agentcore invoke --runtime customer_support --prompt 'Which orders are delayed?'
```

For a harness, `--prompt` works the same as in v0. Omit it to start interactive chat, and use `--session-id` to continue a session. Pass `--user-id` when the Harness needs an end-user identity for user-scoped credentials.

```
agentcore invoke --harness {{release_checks}} --prompt 'Run the pre-deployment checks' # old: agentcore invoke --harness release_checks --prompt 'Run the pre-deployment checks'
```

For a Gateway, set the request path relative to the Gateway origin with `--path`, and send the request body with `--payload`. The `--gateway-target-name` option isn’t available in v1.

```
agentcore invoke --gateway {{orders_gateway}} --path {{order_tools/invocations}} --payload '{"prompt":"Track order A12345"}' # old: agentcore invoke --gateway orders_gateway --gateway-target-name order_tools --prompt 'Track order A12345'
```

## `agentcore logs`
<a name="breaking-changes_agentcore-logs"></a>

Use `agentcore logs runtime` or `agentcore logs harness`.

To tail a runtime, run:

```
agentcore logs runtime --name {{customer_support}} --tail # old: agentcore logs --runtime customer_support
```

For a Harness, use:

```
agentcore logs harness --name {{release_checks}} --tail
```

 `agentcore logs evals` isn’t a v1 command. Use `aws logs tail <log-group-name> --follow` for the online evaluation log group.

## `agentcore status`
<a name="breaking-changes_agentcore-status"></a>

 `agentcore status` keeps the same command path in v1.

To see the status for a specific target, run:

```
agentcore status --target {{default}} # old: agentcore status --target prod
```

Status filtering by runtime, state, type, or resource name is not available in v1.

## `agentcore export`
<a name="breaking-changes_agentcore-export"></a>

Use `agentcore export harness`.

The exported agent is always a CodeZip Runtime. A container image or Dockerfile that the harness used isn’t carried over.

## `agentcore exec`
<a name="breaking-changes_agentcore-exec"></a>

Use `agentcore runtime shell` for an interactive Runtime shell, `agentcore runtime exec` to run one command in a Runtime, or `agentcore harness exec` for harnesses.

```
agentcore runtime shell --id {{checkout-AbCdEf1234}} # old: agentcore exec --runtime checkout --it
```

The shell command prints the runtime session ID, shell ID, and a complete reconnect command. Press Ctrl\+] to detach without ending the remote shell. Use the printed command to reconnect, including both `--session-id` and `--shell-id`. Enter `exit` or press Ctrl\+D to close the shell.

```
agentcore runtime exec --id {{checkout-AbCdEf1234}} --command 'ls /tmp' # old: agentcore exec --runtime checkout 'ls /tmp'
```

```
agentcore harness exec --id {{ReleaseChecks-AbCdEf1234}} --command 'pytest tests/integration -q' # old: agentcore exec --harness ReleaseChecks 'pytest tests/integration -q'
```

## `agentcore traces`
<a name="breaking-changes_agentcore-traces"></a>

Use `agentcore traces runtime`.

```
agentcore traces runtime list --name {{checkout}} # old: agentcore traces list --runtime checkout
```

```
agentcore traces runtime get {{abc123def456}} --name {{checkout}} --output {{./traces/abc123def456.json}} # old: agentcore traces get abc123def456 --runtime checkout --output ./traces/abc123def456.json
```

## `agentcore run batch-evaluation`
<a name="breaking-changes_agentcore-run-batch-evaluation"></a>

 `agentcore run batch-evaluation` was split into two commands in v1.

To evaluate historical sessions, use `agentcore eval batch-evaluation evaluate`.

```
agentcore eval batch-evaluation evaluate \
  --agent {{checkout-AbCdEf1234}} \
  --session-ids {{12345678-1234-1234-1234-123456789012}} \
  --evaluators Builtin.Helpfulness \
  --name {{customer_support_history}} # old: agentcore run batch-evaluation -r customer_support -s 12345678-1234-1234-1234-123456789012 -e Builtin.Helpfulness -n customer-support-history
```

To run a dataset, use `agentcore eval batch-evaluation simulate`. Use the dataset ID returned by `agentcore eval dataset create`, not the v0 project dataset name.

```
agentcore eval batch-evaluation simulate \
  --runtime-id {{checkout-AbCdEf1234}} \
  --payload-template '{"prompt":"{input}"}' \
  --dataset {{dataset-id}} \
  --dataset-version {{7}} \
  --evaluators Builtin.Helpfulness \
  --name {{customer_support_dataset}} # old: agentcore run batch-evaluation -r customer_support --dataset customer-support-scenarios --dataset-version 7 -e Builtin.Helpfulness -n customer-support-dataset
```

## `agentcore run insights`
<a name="breaking-changes_agentcore-run-insights"></a>

Use `agentcore eval batch-insights run`.

## `agentcore run recommendation`
<a name="breaking-changes_agentcore-run-recommendation"></a>

Use `agentcore eval recommendation start`.

```
agentcore eval recommendation start \
  --name improve-customer-support \
  --type SYSTEM_PROMPT_RECOMMENDATION \
  --recommendation-config '{
    "systemPromptRecommendationConfig": {
      "systemPrompt": {
        "text": "You are a concise customer support assistant."
      },
      "agentTraces": {
        "batchEvaluation": {
          "batchEvaluationArn": "arn:aws:bedrock-agentcore:us-east-1:111122223333:batch-evaluate/MyBatchEvaluation-AB1CD2EF3G"
        }
      },
      "evaluationConfig": {
        "evaluators": [
          {
            "evaluatorArn": "arn:aws:bedrock-agentcore:::evaluator/Builtin.GoalSuccessRate"
          }
        ]
      }
    }
  }' \
  --kms-key-arn {{arn:aws:kms:us-east-1:111122223333:key/12345678-1234-1234-1234-123456789012}}

# old: agentcore run recommendation \
#   --run improve-customer-support \
#   --type system-prompt \
#   --inline "You are a concise customer support assistant." \
#   --batch-evaluation-arn arn:aws:bedrock-agentcore:us-east-1:111122223333:batch-evaluate/example \
#   --kms-key arn:aws:kms:us-east-1:111122223333:key/12345678-1234-1234-1234-123456789012
```

## `agentcore run ab-test`
<a name="breaking-changes_agentcore-run-ab-test"></a>

Use `agentcore eval ab-test config-based run` for configuration bundles:

```
agentcore eval ab-test config-based run \
  --name {{customer_support_test}} \
  --gateway {{gateway-id}} \
  --control '{"config-bundle":"control-bundle-id","bundle-version":"control-bundle-version-id"}' \
  --treatment '{"config-bundle":"treatment-bundle-id","bundle-version":"treatment-bundle-version-id"}' \
  --online-eval {{online-eval-id}} \
  --treatment-weight 20 \
  --gateway-filter '{"targetPaths":["/customer-support/*"]}' \
  --enable-on-create false

# old: agentcore run ab-test \
#   --mode config-bundle \
#   --name customer-support-test \
#   --gateway csGateway \
#   --runtime csAgent \
#   --control-bundle customerSupport \
#   --control-version 12 \
#   --treatment-bundle customerSupport \
#   --treatment-version 13 \
#   --online-eval customerSupportEval \
#   --control-weight 80 \
#   --treatment-weight 20 \
#   --disable-on-create
```

Use `agentcore eval ab-test target-based run` for Gateway targets:

```
agentcore eval ab-test target-based run \
  --name {{customer_support_target_test}} \
  --gateway {{gateway-id}} \
  --control '{"gateway-target":"customer-support-control","online-eval":"control-online-eval-id"}' \
  --treatment '{"gateway-target":"customer-support-treatment","online-eval":"treatment-online-eval-id"}' \
  --treatment-weight 20 \
  --gateway-filter '{"targetPaths":["/customer-support-control/*"]}' \
  --enable-on-create false

# old: agentcore run ab-test \
#   --mode target-based \
#   --name customer-support-target-test \
#   --gateway csGateway \
#   --runtime csAgent \
#   --control-target customer-support-control \
#   --treatment-target customer-support-treatment \
#   --control-online-eval controlEval \
#   --treatment-online-eval treatmentEval \
#   --control-weight 80 \
#   --treatment-weight 20 \
#   --disable-on-create
```

## `agentcore promote ab-test`
<a name="breaking-changes_agentcore-promote-ab-test"></a>

 `agentcore promote ab-test` isn’t available in AgentCore CLI v1. Stop the A/B test, then use the AWS CLI to create a Gateway rule that routes traffic to the winning variant. The following examples assume that the treatment won. If the control won, stopping the test restores the control behavior.

For a target-based A/B test:

```
agentcore eval ab-test stop --id <ab-test-id>

aws bedrock-agentcore-control create-gateway-rule \
  --gateway-identifier <gateway-id> \
  --priority 100 \
  --conditions '[{"matchPaths":{"anyOf":["/customer-support-control/*"]}}]' \
  --actions '[{"routeToTarget":{"staticRoute":{"targetName":"customer-support-treatment"}}}]'

# old: agentcore promote ab-test -i ab-test-id
```

For a configuration-bundle A/B test:

```
agentcore eval ab-test stop --id <ab-test-id>

aws bedrock-agentcore-control create-gateway-rule \
  --gateway-identifier <gateway-id> \
  --priority 100 \
  --conditions '[{"matchPaths":{"anyOf":["/customer-support/*"]}}]' \
  --actions '[{"configurationBundle":{"staticOverride":{"bundleArn":"<treatment-bundle-arn>","bundleVersion":"<treatment-bundle-version-id>"}}}]'

# old: agentcore promote ab-test -i ab-test-id
```

These commands update the live Gateway immediately. The rule is not part of the project, and `agentcore deploy` doesn’t manage it. To change an existing rule instead, use `aws bedrock-agentcore-control update-gateway-rule` with `--gateway-identifier` and `--rule-id`. To find the rule ID, run `agentcore gateway rule list --gateway-id <gateway-id>`.

## `agentcore run eval`
<a name="breaking-changes_agentcore-run-eval"></a>

 `agentcore run eval` was split into two commands in v1.

To evaluate historical sessions, use `agentcore eval ondemand evaluate`.

```
agentcore eval ondemand evaluate \
  --agent {{checkout-AbCdEf1234}} \
  --session-ids {{12345678-1234-1234-1234-123456789012}} \
  --evaluators Builtin.Helpfulness # old: agentcore run eval -r customer_support -s 12345678-1234-1234-1234-123456789012 -e Builtin.Helpfulness
```

To run a dataset, use `agentcore eval ondemand simulate`. Use the dataset ID returned by `agentcore eval dataset create`, not the v0 project dataset name.

```
agentcore eval ondemand simulate \
  --runtime-id {{checkout-AbCdEf1234}} \
  --payload-template '{"prompt":"{input}"}' \
  --dataset {{dataset-id}} \
  --dataset-version {{7}} \
  --evaluators Builtin.Correctness # old: agentcore run eval -r customer_support --dataset customer-support-scenarios --dataset-version 7 -e Builtin.Correctness
```

## `agentcore view` / `archive` / `pause` / `resume` / `stop`
<a name="breaking-changes_agentcore-view-archive-pause-resume-stop"></a>

The generic v0 lifecycle verbs moved under their resource groups:


| v0 command | v1 replacement | 
| --- | --- | 
|  `agentcore view ab-test [id]`  |  `agentcore eval ab-test list` or `agentcore eval ab-test get --id <id>`  | 
|  `agentcore pause ab-test -i <id>`  |  `agentcore eval ab-test pause --id <id>`  | 
|  `agentcore resume ab-test -i <id>`  |  `agentcore eval ab-test resume --id <id>`  | 
|  `agentcore stop ab-test -i <id>`  |  `agentcore eval ab-test stop --id <id>`  | 
|  `agentcore archive ab-test -i <id>`  |  `agentcore eval ab-test stop --id <id>`, then `agentcore eval ab-test delete --id <id>`  | 
|  `agentcore pause online-eval <name>`  |  `agentcore eval online-eval pause --id <id>`  | 
|  `agentcore resume online-eval <name>`  |  `agentcore eval online-eval resume --id <id>`  | 
|  `agentcore pause online-insights <name>`  |  `agentcore eval online-insight pause --id <id>`  | 
|  `agentcore resume online-insights <name>`  |  `agentcore eval online-insight resume --id <id>`  | 
|  `agentcore view batch-evaluation [id]`  |  `agentcore eval batch-evaluation list` or `agentcore eval batch-evaluation get --id <id>`  | 
|  `agentcore archive batch-evaluation -i <id>`  |  `aws bedrock-agentcore delete-batch-evaluation --batch-evaluation-id <id>`  | 
|  `agentcore view insights [id]`  |  `agentcore eval batch-insights list` or `agentcore eval batch-insights get --id <id>`  | 
|  `agentcore view recommendation [id]`  |  `agentcore eval recommendation list` or `agentcore eval recommendation get --id <id>`  | 
|  `agentcore archive recommendation -i <id>`  |  `agentcore eval recommendation delete --id <id>` after the recommendation reaches `COMPLETED` or `FAILED`  | 

To find an online evaluation or online insight config ID, run `agentcore eval online-eval list` or `agentcore eval online-insight list`.

## `agentcore stop batch-evaluation`
<a name="breaking-changes_agentcore-stop-batch-evaluation"></a>

Use `agentcore eval batch-evaluation stop`.

```
agentcore eval batch-evaluation stop --id {{batch-evaluation-id}} # old: agentcore stop batch-evaluation -i batch-evaluation-id
```

## `agentcore dataset`
<a name="breaking-changes_agentcore-dataset"></a>

Use `agentcore eval dataset`.

To download a dataset version, use:

```
agentcore eval dataset get \
  --id {{dataset-orders-abc123}} \
  --version {{3}} \
  --file-path {{./datasets/orders-regression.jsonl}} # old: agentcore dataset download --name orders-regression --version 3 --yes --json
```

To publish the current draft, use:

```
agentcore eval dataset publish --id {{dataset-orders-abc123}} # old: agentcore dataset publish-version --name orders-regression --json
```

To delete a published version, use:

```
agentcore eval dataset delete --id {{dataset-orders-abc123}} --version {{2}} # old: agentcore dataset remove-version 2 --name orders-regression --json
```

## `agentcore config-bundle`
<a name="breaking-changes_agentcore-config-bundle"></a>

Use `agentcore eval config-bundle`. The new commands use the bundle ID instead of its project name.

To list bundle versions, use:

```
agentcore eval config-bundle version list --id {{CustomerSupport-AbCdEf1234}} # old: agentcore config-bundle versions --name customer-support
```

To create a version on a branch, use:

```
agentcore eval config-bundle update \
  --id {{CustomerSupport-AbCdEf1234}} \
  --components {{file://config/customer-support.json}} \
  --branch-name {{experiment}} \
  --commit-message 'Test concise responses' # old: agentcore config-bundle create-branch --name customer-support --branch experiment --from version-7 --commit-message 'Test concise responses'
```

Selecting a parent version with `--from` isn’t available in v1. The v1 command records the latest version on the branch as the parent of the new version. To choose a different parent version, call the `UpdateConfigurationBundle` API with `parentVersionIds`.

## `agentcore config-bundle diff`
<a name="breaking-changes_agentcore-config-bundle-diff"></a>

 `agentcore config-bundle diff` compared two versions of a configuration bundle and displayed the differences between their components. This command isn’t available in AgentCore CLI v1.

## `agentcore config`
<a name="breaking-changes_agentcore-config"></a>

 `agentcore config` keeps the same command path in v1, but its output is JSON.

```
agentcore config telemetry.enabled # old: agentcore config telemetry.enabled
```

```
agentcore config telemetry.enabled false # old: agentcore config telemetry.enabled false
```

## `agentcore telemetry`
<a name="breaking-changes_agentcore-telemetry"></a>

Use `agentcore config telemetry.enabled`.

```
agentcore config telemetry.enabled # old: agentcore telemetry status
```

## `agentcore update cli`
<a name="breaking-changes_agentcore-update-cli"></a>

Use `agentcore update`.

```
agentcore update # old: agentcore update cli
```

## `agentcore feedback`
<a name="breaking-changes_agentcore-feedback"></a>

 `agentcore feedback` keeps the same command path in v1.

## Removed commands
<a name="removed-commands"></a>

The following v0 commands and workflows aren’t available in v1:
+  `agentcore import`, `agentcore validate`, and `agentcore fetch`. To translate a Bedrock Agent, use `agentcore add runtime --agent-id <agent-id>`. Optionally pass `--agent-alias-id` to select a prepared version and `--framework strands|langgraph`. This workflow doesn’t adopt existing AgentCore resources.
+  `agentcore promote ab-test`.
+  `agentcore config-bundle diff`.
+  `agentcore add knowledge-base`.
+ Capacity-provider workflows (`agentcore add capacity-provider`).
+  `agentcore evals history`.
+  `agentcore archive insights`.
+  `agentcore run ingest`. To start an ingestion job, run `aws bedrock-agent start-ingestion-job --knowledge-base-id <id> --data-source-id <id>` once for each data source. To find the data source IDs, run `aws bedrock-agent list-data-sources --knowledge-base-id <id>`.