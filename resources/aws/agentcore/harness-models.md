

# Models and instructions
<a name="harness-models"></a>

Define a harness once with defaults for model, system prompt, tools, memory, and execution limits. Override any of those on a single invocation when you want to experiment. The harness resource stays unchanged; only that call uses the overrides.

This is the core of the config-based model: **defaults at creation time, overrides at invocation time.** You can test N model/prompt/tool combinations in the time it would take to redeploy once.

**Example**  
Defaults on `create-harness`:  

```
aws bedrock-agentcore-control create-harness \
  --harness-name "research_agent" \
  --execution-role-arn "arn:aws:iam::123456789012:role/MyHarnessRole" \
  --system-prompt '[{"text": "You are a research assistant."}]' \
  --tools '[{"type": "agentcore_browser", "name": "browser"}]'
```
Overrides per invocation:  

```
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    # These apply only to this call; the harness defaults stay intact
    model={"bedrockModelConfig": {"modelId": "us.anthropic.claude-opus-4-5-20251101-v1:0"}},
    systemPrompt=[{"text": "You are a terse research assistant. One paragraph answers only."}],
    tools=[
        {"type": "agentcore_browser", "name": "browser"},
        {"type": "agentcore_code_interpreter", "name": "code_interpreter"},
    ],
    messages=[{"role": "user", "content": [{"text": "Summarize this paper as a bullet list."}]}],
)
```
To change defaults permanently, use `update-harness`.
Set defaults when you create or update the harness:  

```
# Create an empty project if one does not already exist
agentcore create --name ResearchAgentProject --template empty
cd ResearchAgentProject

# Add a harness to the project
agentcore add harness \
  --name researcher \
  --model '{"provider":"bedrock","modelId":"global.anthropic.claude-sonnet-4-6"}' \
  --system-prompt "You are a research assistant." \
  --tools '[{"type":"agentcore_browser","name":"browser"}]'

agentcore deploy
```
Invoke the deployed harness:  

```
agentcore invoke --harness researcher \
  --prompt "Summarize this research paper"
```
 `agentcore invoke --harness` accepts the prompt (`--prompt`), session ID (`--session-id`), optional end-user ID (`--user-id`), and endpoint qualifier (`--qualifier`). Omit `--prompt` for interactive chat. See [Supply an end-user ID](harness-get-started.md#harness-invoke-user-id). Use the SDK when you need per-invocation model, prompt, tool, skill, or limit overrides.  
To change defaults permanently, edit `app/<name>/harness.yaml` (the system prompt is in `app/<name>/system-prompt.md`) and run `agentcore deploy`. The `harness.yaml` file uses the `CreateHarness` API field names, with CLI extensions for project credential references. For example, the model is under `model.bedrockModelConfig` rather than the `provider` and `modelId` keys of the `--model` JSON.
To add a harness to an existing project, run `agentcore add harness` without flags in the project directory.  

1. Enter the harness name.

1. Enter the system prompt, and then press Ctrl\+D to continue.

1. Choose the model provider and enter the model ID. For OpenAI and Google Gemini, enter a `file://` path to a key file or an existing API key credential provider ARN. LiteLLM accepts an optional key file or ARN and an optional API base URL.

1. Review the summary and confirm. Then run `agentcore deploy`.
To create a new project with a harness, run `agentcore create` without flags to open the project wizard.  

1. Enter a project name.

1. Choose **config-based** to create a project with a harness.

1. Choose your model provider. Amazon Bedrock, OpenAI, Google Gemini, and any LiteLLM-compatible provider are supported, each with a default model ID.

1. Enter the model ID. For OpenAI and Google Gemini, enter a `file://` path to a key file or an existing API key credential provider ARN. LiteLLM accepts an optional key file or ARN and an optional API base URL.

1. Review the summary and confirm. Then run `agentcore deploy` from the project directory.
To set the API format, edit `app/<name>/harness.yaml` after the project is created and set `apiFormat` in the model configuration, for example `model.bedrockModelConfig.apiFormat`. For key-input examples, see [Configure project model credentials](#harness-model-credentials).

## Configure project model credentials
<a name="harness-model-credentials"></a>

For a project Harness, the CLI can manage the model key alongside the Harness. Supply a key file or stdin when creating the project:

```
agentcore create --name OpenAIHarness \
  --model-provider open_ai \
  --api-key file://./openai-key.txt
```

Or add a Harness to an existing project and pipe the key to `--api-key -`:

```
printf '%s' "$OPENAI_API_KEY" | agentcore add harness \
  --name openai \
  --model '{"provider":"open_ai","modelId":"gpt-5.4"}' \
  --api-key -
agentcore deploy
```

The CLI declares a named project credential, stores the key in `agentcore/.env.local`, and writes `apiKeyCredentialName` in the Harness model configuration. At deployment, it creates the AgentCore Identity provider, resolves the reference to its ARN, and grants the generated Harness role access. Do not commit the local secret or key file.

To reuse a project credential that you declared with `agentcore add credentials api-key`, set `apiKeyCredentialName` to its logical name in `--model`. You do not need an earlier credential-only deployment or to copy a deployed ARN:

```
agentcore add harness \
  --name shared_key \
  --model '{"provider":"open_ai","modelId":"gpt-5.4","apiKeyCredentialName":"my-openai-key"}'
agentcore deploy
```

An existing credential provider ARN remains supported through `apiKeyArn`. Choose one route: `apiKeyArn`, `apiKeyCredentialName`, or `--api-key`. `--api-key` cannot be combined with either reference in `--model`, and the two reference fields are mutually exclusive. Bedrock uses the execution role and does not accept a model API key.

Both flags and wizards reject inline secrets. The CLI flags accept files or stdin; the interactive wizard accepts a key file or a credential provider ARN, not stdin. `apiKeyCredentialName` is a CLI project extension, not a field to send directly to the service API. For imported execution roles, add the credential-read permissions to the role yourself. See [Harness security](harness-security.md).

## Use any model, switch mid-session
<a name="harness-model-switching"></a>

Use models from Amazon Bedrock, OpenAI, Google Gemini, or other providers through LiteLLM, including OpenAI-compatible endpoints. Switch providers between turns of the same session and the conversation continues. Context carries over.

If you create a harness with the API or `agentcore harness create` and omit the model, the service uses `global.anthropic.claude-sonnet-4-6`. If you omit `--model`, `agentcore add harness` writes `global.anthropic.claude-sonnet-5-5` to `harness.yaml`.

The CLI’s create/add wizards prefill provider-specific model IDs: `global.anthropic.claude-sonnet-5-5` for Bedrock, `gpt-6.1-sol` for OpenAI, `gemini-3.8-flash` for Gemini, and `bedrock/global.anthropic.claude-sonnet-5-5` for LiteLLM. These are CLI defaults, not a guarantee of model access or a change to the service’s default. You can change the configured model or use the SDK to override it per invocation.

Store third-party API keys in [AgentCore Identity’s](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html) token vault as an API key credential provider. The harness pulls the key at invocation time. Your agent code never sees raw credentials.

**Example**  
Register an API key with [AgentCore Identity](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html):  

```
aws bedrock-agentcore-control create-api-key-credential-provider \
  --name my-openai-key \
  --api-key "$OPENAI_API_KEY"
```
Switch providers across turns of the same session:  

```
# Turn 1: Bedrock (native Converse API)
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    model={"bedrockModelConfig": {"modelId": "us.anthropic.claude-sonnet-4-5-20250514-v1:0"}},
    messages=[{"role": "user", "content": [{"text": "Analyze this codebase."}]}],
)

# Turn 2: Bedrock Mantle (OpenAI Responses format, no API key needed)
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    model={
        "bedrockModelConfig": {
            "modelId": "openai.gpt-oss-120b",
            "apiFormat": "responses",
            "additionalParams": {"reasoning": {"effort": "high"}},
        }
    },
    messages=[{"role": "user", "content": [{"text": "Now suggest fixes for the top three issues."}]}],
)

# Turn 3: OpenAI directly, with the API key from AgentCore Identity
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    model={
        "openAiModelConfig": {
            "modelId": "gpt-5.4",
            "apiKeyArn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:token-vault/default/apikeycredentialprovider/my-openai-key",
            "apiFormat": "responses",
        }
    },
    messages=[{"role": "user", "content": [{"text": "Summarize the fixes as a bullet list."}]}],
)
```
To route a direct OpenAI request through an OpenAI-compatible gateway, proxy, self-hosted endpoint, or regional endpoint, set `apiBase`. The harness sends the API key referenced by `apiKeyArn` to this endpoint, so use only trusted endpoints. If you omit `apiBase`, the harness uses the default OpenAI endpoint.  

```
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    model={
        "openAiModelConfig": {
            "modelId": "gpt-5.4",
            "apiKeyArn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:token-vault/default/apikeycredentialprovider/my-openai-key",
            "apiBase": "https://gateway.example.com/v1",
            "apiFormat": "responses",
        }
    },
    messages=[{"role": "user", "content": [{"text": "Summarize this report."}]}],
)
```
Add an API key to [AgentCore Identity](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html):  

```
printf '%s' "$OPENAI_API_KEY" | agentcore add credentials api-key \
  --name my-openai-key \
  --api-key -
```
From the AgentCore project directory that you created earlier, add a second harness that uses the Responses format. Then deploy the project. This harness calls Amazon Bedrock with the execution role and does not use the API key. The OpenAI harness in [Select the model API format](#harness-model-api-format) uses it.  

```
agentcore add harness \
  --name my_agent \
  --model '{"provider":"bedrock","modelId":"openai.gpt-oss-120b","apiFormat":"responses"}'
agentcore deploy
```
Invoke with Bedrock Mantle:  

```
SESSION_ID="$(uuidgen)"

# Turn 1: Bedrock Mantle (Responses format)
agentcore invoke --harness my_agent \
  --session-id "$SESSION_ID" \
  --prompt "Analyze this codebase and identify performance bottlenecks."
```
Use the SDK examples in the preceding tab to switch model providers between turns without changing the deployed harness defaults.

Learn more: [AgentCore Identity](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html), [API key credential providers](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity-api-key.html).

### Select the model API format
<a name="harness-model-api-format"></a>

The Amazon Bedrock and OpenAI model configurations each accept an optional `apiFormat` field that selects which API protocol the harness uses to call the model.

For `bedrockModelConfig`, `apiFormat` selects both the API protocol and the Amazon Bedrock endpoint the harness calls:
+  `converse_stream` - the Amazon Bedrock Converse API, served by the `bedrock-runtime` endpoint. This is the default.
+  `responses` - the OpenAI-compatible Responses API, served by the `bedrock-mantle` endpoint.
+  `chat_completions` - the OpenAI-compatible Chat Completions API, served by the `bedrock-mantle` endpoint.

The `bedrock-mantle` endpoint supports a different set of models and capabilities than the default `bedrock-runtime` endpoint. For details, see [Endpoints supported by Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/endpoints.html).

For `openAiModelConfig`, `apiFormat` can be one of:
+  `responses` - the OpenAI Responses API. This is the default.
+  `chat_completions` - the OpenAI Chat Completions API.

Both configurations also accept an optional `additionalParams` field. Provider-specific parameters in `additionalParams` are passed through to the model provider unchanged.

**Important**  
Parameters in `additionalParams` can alter provider behavior including endpoint routing, credential handling, and region selection. If your application forwards caller-supplied model configuration to `InvokeHarness`, validate these fields before invocation. See [Shared responsibility model](harness-security.md#harness-shared-responsibility).

**Example**  
Set the API format in the `--model` JSON when you add the harness:  

```
# Bedrock model through the OpenAI-compatible Responses API (bedrock-mantle endpoint)
agentcore add harness \
  --name mantle_api \
  --model '{"provider":"bedrock","modelId":"openai.gpt-oss-120b","apiFormat":"responses"}'
agentcore deploy
```
For OpenAI, reference the `my-openai-key` project credential that you added earlier with `apiKeyCredentialName`. Deployment resolves the provider ARN and grants the generated role access. Alternatively, use `apiKeyArn` for an existing provider, or supply a key file or stdin as described in [Configure project model credentials](#harness-model-credentials):  

```
# OpenAI model using the Chat Completions API
agentcore add harness \
  --name openai \
  --model '{"provider":"open_ai","modelId":"gpt-5.4","apiKeyCredentialName":"my-openai-key","apiFormat":"chat_completions"}'
agentcore deploy
```
 `apiFormat` accepts `converse_stream`, `responses`, or `chat_completions` for the `bedrock` provider, and `responses` or `chat_completions` for `open_ai`. For the `bedrock` provider, use `responses` or `chat_completions` only with a model supported by the Bedrock Mantle endpoint, such as `openai.gpt-oss-120b`; use `converse_stream` for Claude model IDs. `apiFormat` does not apply to `gemini` or `lite_llm`.

### Apply Amazon Bedrock Guardrails
<a name="harness-model-guardrails"></a>

Use Amazon Bedrock Guardrails to filter harmful content or block denied topics in model inputs and outputs. To apply a guardrail to each model request, add a `guardrailConfig` object to `bedrockModelConfig.additionalParams`. The harness passes this object to Amazon Bedrock with each model request.

To use Amazon Bedrock Guardrails with the harness, configure `bedrockModelConfig` with the `converse_stream` API format. If you omit `apiFormat`, the harness uses `converse_stream` by default. Set this configuration in `CreateHarness` or `UpdateHarness`, or override it for one call in `InvokeHarness`.

The following Python example calls `InvokeHarness` with a guardrail configuration. Replace {{HARNESS\_ARN}} with your harness ARN and {{SESSION\_ID}} with a unique runtime session ID.

```
import boto3

client = boto3.client("bedrock-agentcore")
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    model={
        "bedrockModelConfig": {
            "modelId": "us.amazon.nova-micro-v1:0",
            "apiFormat": "converse_stream",
            "additionalParams": {
                "guardrailConfig": {
                    "guardrailIdentifier": "arn:aws:bedrock:us-west-2:111122223333:guardrail/abc123def456",
                    "guardrailVersion": "1",
                    "trace": "enabled_full",
                }
            },
        }
    },
    messages=[{"role": "user", "content": [{"text": "Help me plan a trip."}]}],
)
```

For the baseline model permissions, see the [execution role policy](harness-security.md#harness-execution-role-policy). Add the following JSON statement to the harness execution role policy:

```
{
  "Effect": "Allow",
  "Action": "bedrock:ApplyGuardrail",
  "Resource": "arn:aws:bedrock:us-west-2:111122223333:guardrail/abc123def456"
}
```

Use a guardrail in the same AWS Region as the model request. When a guardrail intervenes, the response stream reports `guardrail_intervened` as the stop reason.

For more information about guardrail configuration fields, see [Use a guardrail with the Converse API](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-use-converse-api.html). For more information about IAM permissions, see [Set up permissions to use Amazon Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-permissions.html).

### Use a model through LiteLLM
<a name="harness-model-litellm"></a>

Use `liteLlmModelConfig` to reach any provider that [LiteLLM](https://docs.litellm.ai/) supports, including OpenAI-compatible endpoints. Set `modelId` to a LiteLLM provider-prefixed model ID, such as `gemini/gemini-2.5-pro` or `anthropic/claude-sonnet-4-6`.

Providers that authenticate with an API key (such as Google or Anthropic) require `apiKeyArn`. Amazon Bedrock models accessed with the `bedrock/` prefix use the harness execution role’s permissions and don’t need an API key.
+  `modelId` (required) - the LiteLLM provider-prefixed model ID.
+  `apiKeyArn` - the ARN of the provider’s API key, stored in [AgentCore Identity](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html) as an API key credential provider. The endpoint must accept this API key.
+  `apiBase` - a custom endpoint URL for an OpenAI-compatible gateway, such as a proxy or self-hosted endpoint.
+  `additionalParams` - provider-specific parameters passed through to LiteLLM unchanged. This includes parameters that can override endpoints (`aws_bedrock_runtime_endpoint`), assume IAM roles (`aws_role_name`), or alter request routing. See [Shared responsibility model](harness-security.md#harness-shared-responsibility).

 `liteLlmModelConfig` also accepts the optional `maxTokens`, `temperature`, and `topP` fields.

**Example**  
Configure a LiteLLM model:  

```
response = client.invoke_harness(
    harnessArn=HARNESS_ARN,
    runtimeSessionId=SESSION_ID,
    model={
        "liteLlmModelConfig": {
            "modelId": "gemini/gemini-2.5-pro",
            "apiKeyArn": "arn:aws:bedrock-agentcore:us-west-2:123456789012:token-vault/default/apikeycredentialprovider/my-gemini-key",
        }
    },
    messages=[{"role": "user", "content": [{"text": "Summarize this paper."}]}],
)
```
Configure a LiteLLM model in the `--model` JSON:  

```
agentcore add harness \
  --name gemini \
  --model '{"provider":"lite_llm","modelId":"gemini/gemini-2.5-pro","apiKeyArn":"arn:aws:bedrock-agentcore:us-west-2:123456789012:token-vault/default/apikeycredentialprovider/my-gemini-key"}'
agentcore deploy
```
Reach an OpenAI-compatible gateway with `apiBase`, and pass provider-specific values with `additionalParams`:  

```
agentcore add harness \
  --name proxy_agent \
  --model '{"provider":"lite_llm","modelId":"openai/gpt-5.4","apiBase":"https://my-llm-gateway.example.com/v1","apiKeyArn":"arn:aws:bedrock-agentcore:us-west-2:123456789012:token-vault/default/apikeycredentialprovider/my-gateway-key","additionalParams":{"timeout":30}}'
agentcore deploy
```
 `apiBase` and `additionalParams` apply only to the `lite_llm` provider. Amazon Bedrock models reached with the `bedrock/` prefix use the execution role’s permissions and don’t need `apiKeyArn`.

When your harness uses an API key credential provider, grant the execution role permission to read the key. See [Security and access controls](harness-security.md).

For more information about harness configuration, see [API Documentation](harness-get-started.md#api-documentation).

#### Related topics
<a name="_related_topics"></a>
+  [Tools](harness-tools.md) - connect tools to your harness
+  [Memory](harness-memory.md) - persist conversations across sessions
+  [Control cost with limits](harness-operations.md#harness-limits) - set execution limits and truncation strategies