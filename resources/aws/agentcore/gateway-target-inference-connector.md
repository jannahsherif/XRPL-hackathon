

# Inference connector targets
<a name="gateway-target-inference-connector"></a>

Inference connector targets provide preconfigured setup for supported model providers. When you use a connector, the gateway automatically handles operations, model discovery, model ID translation, and path rewriting based on built-in knowledge of the provider’s API, so you don’t need to specify them manually.

Connectors are recommended when you want to quickly add a supported model provider without manually configuring endpoints, operations, or model mappings.

**Topics**
+ [Target configuration](#gateway-target-inference-connector-config)
+ [Creating a connector inference target](#gateway-target-inference-connector-create)
+ [Invoking a connector inference target](#gateway-target-inference-connector-invoke)
+ [Listing available models](#gateway-target-inference-connector-list-models)
+ [Model-based routing](#gateway-target-inference-connector-routing)
+ [Streaming](#gateway-target-inference-connector-streaming)
+ [Outbound authorization](#gateway-target-inference-connector-auth)

## Target configuration
<a name="gateway-target-inference-connector-config"></a>

The target configuration for an inference connector target uses the following structure:

```
{
    "inference": {
        "connector": {
            "source": {
                "connectorId": "bedrock-mantle"
            }
        }
    }
}
```
+  **connectorId** (required) – Identifier for the built-in connector. Supported values are `bedrock-mantle`, `bedrock-runtime`, `openai`, and `anthropic`. The `bedrock-runtime` connector configures a target for the native Amazon Bedrock `InvokeModel` API; for details, see [Use the Amazon Bedrock InvokeModel API with inference targets](gateway-target-inference-invokemodel.md).

Each connector provides built-in defaults equivalent to a fully-specified provider configuration. For example, the `bedrock-mantle` connector automatically configures:
+  **Model ID prefix stripping** – Clients can omit the provider prefix from model IDs (for example, use `claude-opus-4-7` instead of `anthropic.claude-opus-4-7`).
+  **Path rewriting** – Inbound inference request paths are mapped to the provider’s API paths.
+  **Supported operations** – The set of inference operations the connector exposes, such as chat completions and messages.

## Creating a connector inference target
<a name="gateway-target-inference-connector-create"></a>

The following example shows how to create an inference target using the Bedrock Mantle connector:

```
aws bedrock-agentcore-control create-gateway-target --cli-input-json '{
    "gatewayIdentifier": "GATEWAY_ID",
    "name": "bedrock-mantle",
    "targetConfiguration": {
        "inference": {
            "connector": {
                "source": {
                    "connectorId": "bedrock-mantle"
                }
            }
        }
    },
    "credentialProviderConfigurations": [
        {"credentialProviderType": "GATEWAY_IAM_ROLE"}
    ]
}'
```

The following example shows how to create an inference target using the OpenAI connector:

```
aws bedrock-agentcore-control create-gateway-target --cli-input-json '{
    "gatewayIdentifier": "GATEWAY_ID",
    "name": "openai",
    "targetConfiguration": {
        "inference": {
            "connector": {
                "source": {
                    "connectorId": "openai"
                }
            }
        }
    },
    "credentialProviderConfigurations": [
        {
            "credentialProviderType": "API_KEY",
            "credentialProvider": {
                "apiKeyCredentialProvider": {
                    "providerArn": "arn:aws:bedrock-agentcore:us-west-2:111122223333:token-vault/default/apikeycredentialprovider/openai-key",
                    "credentialLocation": "HEADER",
                    "credentialParameterName": "Authorization",
                    "credentialPrefix": "Bearer "
                }
            }
        }
    ]
}'
```

The following example shows how to create an inference target using the Anthropic connector:

```
aws bedrock-agentcore-control create-gateway-target --cli-input-json '{
    "gatewayIdentifier": "GATEWAY_ID",
    "name": "anthropic",
    "targetConfiguration": {
        "inference": {
            "connector": {
                "source": {
                    "connectorId": "anthropic"
                }
            }
        }
    },
    "credentialProviderConfigurations": [
        {
            "credentialProviderType": "API_KEY",
            "credentialProvider": {
                "apiKeyCredentialProvider": {
                    "providerArn": "arn:aws:bedrock-agentcore:us-west-2:111122223333:token-vault/default/apikeycredentialprovider/anthropic-key",
                    "credentialLocation": "HEADER",
                    "credentialParameterName": "x-api-key"
                }
            }
        }
    ]
}'
```

## Invoking a connector inference target
<a name="gateway-target-inference-connector-invoke"></a>

To invoke an inference target, send requests to the gateway’s `/inference` path. The gateway routes each request to the correct target based on the `model` field in the request body. The `model` value can be either a plain model ID (for example, `gpt-5.5`) or a target-qualified model ID in the form `{targetName}/{modelId}` (for example, `openai/gpt-5.5`). For details on how the `model` value is matched to a target, see [Model-based routing](#gateway-target-inference-connector-routing).

The URL format is:

```
https://{gatewayId}.gateway.bedrock-agentcore.{region}.amazonaws.com/inference/{path}
```

Replace `{path}` with the inference operation path (for example, `v1/chat/completions`, `v1/responses`, or `v1/messages`).

### Using the OpenAI SDK
<a name="_using_the_openai_sdk"></a>

Set the gateway’s `/inference/v1` path as the `base_url`:

```
from openai import OpenAI

client = OpenAI(
    base_url="https://<gateway-id>.gateway.bedrock-agentcore.us-west-2.amazonaws.com/inference/v1",
    api_key="<gateway-auth-token>"
)

response = client.chat.completions.create(
    model="gpt-5.5",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### Using the Anthropic SDK
<a name="_using_the_anthropic_sdk"></a>

Set the gateway’s `/inference` path as the `base_url`:

```
import anthropic

client = anthropic.Anthropic(
    base_url="https://<gateway-id>.gateway.bedrock-agentcore.us-west-2.amazonaws.com/inference",
    api_key="<gateway-auth-token>"
)

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### Using awscurl
<a name="_using_awscurl"></a>

```
awscurl --service bedrock-agentcore --region us-west-2 -X POST \
    "https://<gateway-id>.gateway.bedrock-agentcore.us-west-2.amazonaws.com/inference/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -d '{"model": "gpt-5.5", "messages": [{"role": "user", "content": "Hello!"}]}'
```

## Listing available models
<a name="gateway-target-inference-connector-list-models"></a>

To discover models available across all inference targets, call the list models endpoint:

```
awscurl --service bedrock-agentcore --region us-west-2 \
    "https://<gateway-id>.gateway.bedrock-agentcore.us-west-2.amazonaws.com/inference/v1/models"
```

The response is in OpenAI’s `/v1/models` format with model IDs prefixed by target name:

```
{
    "data": [
        {"id": "bedrock-mantle/anthropic.claude-opus-4-7", "object": "model", "owned_by": "system"},
        {"id": "openai/gpt-5.5", "object": "model", "owned_by": "openai"},
        {"id": "anthropic/claude-sonnet-4-6", "object": "model", "owned_by": "anthropic"}
    ]
}
```

The `owned_by` field indicates the model’s provider. A value of `system` indicates a model hosted by Amazon Bedrock, while `openai` and `anthropic` indicate models served directly by those providers.

## Model-based routing
<a name="gateway-target-inference-connector-routing"></a>

The gateway routes inference requests based on the `model` field in the request body:

1.  **Qualified routing** – If the model ID contains a `/` and the prefix matches a target name, the request is routed to that target (for example, `openai/gpt-5.5` routes to the `openai` target).

1.  **Unqualified routing** – If the model ID does not contain a `/`, the gateway matches it against all configured targets. An exact match takes priority over glob patterns. If exactly one target matches, the request is routed to it.

1.  **Collision handling** – When multiple targets match the same model at the same specificity, the gateway defaults to the Amazon Bedrock target if one is among the matches. Otherwise, it selects one of the matching targets at random on each request, so requests for the same model can land on different targets. To pin requests to a specific target, qualify the model with the target name as a prefix (for example, `bedrock/claude-opus-4-7`).

To customize or override the target that a model routes to, you can rewrite the `model` field in a request interceptor. For more information, see [Customize model routing with a request interceptor](gateway-interceptors-examples.html#gateway-interceptors-examples-model-routing).

## Streaming
<a name="gateway-target-inference-connector-streaming"></a>

Streaming follows the OpenAI SSE convention. Set `"stream": true` in the request body, and the gateway passes through the SSE stream from the provider without transformation:

```
stream = client.chat.completions.create(
    model="gpt-5.5",
    messages=[{"role": "user", "content": "Write a story."}],
    stream=True
)

for chunk in stream:
    print(chunk.choices[0].delta.content, end="")
```

### Response stream limits
<a name="gateway-target-inference-connector-streaming-limits"></a>

**Important**  
AgentCore Gateway does not enforce a service-level maximum on response stream duration or response size. If you do not configure a token limit policy on your gateway target, each request can generate an unbounded streaming response.

Without a configured token limit policy, unbounded responses can cause the following issues:
+  **Gateway resource exhaustion** – The gateway holds compute resources (memory, HTTP connection pool slots, and CPU for policy evaluation) open for the duration of each streaming response. Large concurrent streams can exhaust gateway task resources.
+  **Cost amplification on shared credentials** – All users that route through the same target share one set of provider credentials. A single user sending high-`max_tokens` requests can consume the provider’s tokens-per-minute (TPM) quota for all users of that target.
+  **Noisy neighbor effects** – Requests-per-minute (RPM) throttling limits request count but not per-request cost. A single user can generate maximum-cost requests within the RPM limit, degrading performance for other users.

To mitigate these risks, configure a token limit policy on your gateway targets. For more information, see [Gateway policies](gateway-policies.html).

## Outbound authorization
<a name="gateway-target-inference-connector-auth"></a>

Inference connector targets support the following outbound authorization types:
+  **IAM (SigV4)** – Use `GATEWAY_IAM_ROLE` for providers that accept IAM authentication (such as Amazon Bedrock).
+  **API key** – Use `API_KEY` for providers that require an API key (such as OpenAI and Anthropic). The gateway injects the stored API key into outbound requests.