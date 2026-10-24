

# Use the Amazon Bedrock InvokeModel API with inference targets
<a name="gateway-target-inference-invokemodel"></a>

Amazon Bedrock AgentCore Gateway inference targets support the Amazon Bedrock `InvokeModel` and `InvokeModelWithResponseStream` application programming interface (API) wire format on the aggregated `/inference` endpoint. With this support, you can keep your existing Amazon Bedrock SDK integration and reach any model provider through one governed endpoint. You don’t need to rewrite client code for each provider. The gateway supports `InvokeModel` in two directions:
+ A client that uses the Amazon Bedrock SDK (for example, the Boto3 `bedrock-runtime` client) can send `InvokeModel` requests to the gateway. The gateway forwards them to a Bedrock target unchanged, or translates them to a non-Bedrock provider (such as OpenAI or Anthropic) when the `InvokeModel` body already matches that provider’s payload schema. For the supported translations, see [Request routing and translation](#gateway-target-inference-invokemodel-how).
+ A client that uses the OpenAI SDK or Anthropic SDK can reach an Amazon Bedrock model that Bedrock serves only through the `InvokeModel` API. The gateway translates the request to `InvokeModel` and translates the response back to the client’s dialect. If the model is also available on the Bedrock Runtime OpenAI-compatible or Anthropic-compatible APIs, you can reach it without translation.

In both directions, the client keeps speaking its own API dialect. When the target serves a different dialect, the gateway translates the request and the streamed response so that your SDK works unchanged. Amazon Bedrock AgentCore Policy and token-based rate limiting apply to `InvokeModel` requests as they do to other inference traffic.

The gateway supports the following Amazon Bedrock APIs on a Bedrock Runtime target:


| Amazon Bedrock API | Operation path | 
| --- | --- | 
|  `InvokeModel`  |  `/model/{model}/invoke`  | 
|  `InvokeModelWithResponseStream`  |  `/model/{model}/invoke-with-response-stream`  | 

Before you begin, [create a gateway](gateway-create.md) and [configure inbound authentication](gateway-inbound-auth.md) so that clients can call it.

This topic describes how to configure a Bedrock Runtime target and how to call it. For more information about general inference-target concepts, such as model-based routing and outbound authorization, see [Inference connector targets](gateway-target-inference-connector.md) and [Inference provider targets](gateway-target-inference-provider.md).

**Topics**
+ [Request routing and translation](#gateway-target-inference-invokemodel-how)
+ [Create a Bedrock Runtime target](#gateway-target-inference-invokemodel-create)
+ [Call the gateway with the Amazon Bedrock SDK](#gateway-target-inference-invokemodel-call)
+ [Route an OpenAI or Anthropic client to a Bedrock Runtime target](#gateway-target-inference-invokemodel-reverse)
+ [Discover available models](#gateway-target-inference-invokemodel-discovery)
+ [Guardrails](#gateway-target-inference-invokemodel-guardrails)
+ [Errors](#gateway-target-inference-invokemodel-errors)

## Request routing and translation
<a name="gateway-target-inference-invokemodel-how"></a>

The gateway determines the client’s dialect from the request path and the target’s dialect from the target configuration:
+  `/inference/model/{model}/invoke` and `/inference/model/{model}/invoke-with-response-stream` are the Amazon Bedrock `InvokeModel` dialect.
+  `/inference/v1/chat/completions` is the OpenAI Chat Completions dialect.
+  `/inference/v1/responses` is the OpenAI Responses dialect.
+  `/inference/v1/messages` is the Anthropic Messages dialect.

The gateway selects the target for the requested model with [model-based routing](gateway-target-inference-connector.md#gateway-target-inference-connector-routing). For a target-qualified model ID (for example, `bedrock/us.anthropic.claude-sonnet-5-5`), the gateway uses the named target.

After the gateway selects the target, it decides whether to translate, based on the dialects that the target serves for the model:
+  **Passthrough** – If the target serves the model in the client’s dialect, the gateway forwards the request unchanged. When a target serves the model in both the client’s dialect and a translation-supported dialect, the gateway prefers passthrough. An `InvokeModel` client reaching a Bedrock Runtime target is the common case.
+  **Translate** – If the target serves the model only in a different, translation-supported dialect, the gateway translates the request. It relocates the model ID between the URI path and the request body, rewrites the request path, adjusts the `anthropic-version` header for Anthropic routes, and re-frames the streamed response between the Amazon Bedrock event-stream format and server-sent events (SSE).
+  **Not supported** – If the target serves the model in neither the client’s dialect nor a translation-supported dialect, the request fails. This happens, for example, when a target-qualified model ID names a target that cannot serve the request.

The gateway does not convert one payload schema into another. An `InvokeModel` request body is the payload format of the model it names: an OpenAI-family model carries an OpenAI Chat Completions payload, and an Anthropic model carries an Anthropic Messages payload. The gateway therefore translates only between a request and a target dialect that use the same payload schema. A request whose payload schema does not match the target dialect is not supported.

The following table shows how the gateway handles each combination of client request and target dialect for `InvokeModel` traffic.


| Client request | Target dialect | Gateway action | 
| --- | --- | --- | 
|  `InvokeModel` (any Bedrock model) |  `InvokeModel`  | Passthrough | 
|  `InvokeModel` with a Chat Completions payload (OpenAI-family model) | OpenAI Chat Completions (`/v1/chat/completions`) | Translate | 
|  `InvokeModel` with a Messages payload (Anthropic model) | Anthropic Messages (`/v1/messages`) | Translate | 
| OpenAI Chat Completions |  `InvokeModel` (OpenAI-family model) | Translate | 
| Anthropic Messages |  `InvokeModel` (Anthropic model) | Translate | 
|  `InvokeModel` with a Chat Completions payload | Anthropic Messages (`/v1/messages`) | Not supported. The payload schemas differ. | 
|  `InvokeModel` with a Messages payload | OpenAI Chat Completions (`/v1/chat/completions`) | Not supported. The payload schemas differ. | 

The OpenAI Responses API (`/v1/responses`) is supported as passthrough only. A Responses request routes to a target that serves Responses, and the gateway does not translate between Responses and `InvokeModel`, because no `InvokeModel` body uses the Responses schema.

When the gateway cannot serve a request — an unsupported dialect pair, or a payload that the destination rejects — it returns a `400` error in the client’s dialect (for an `InvokeModel` client, a Bedrock `ValidationException`).

**Note**  
The gateway relocates the model ID and re-frames the stream; it does not rewrite the body to fit a different schema. The body you send must already be the payload schema that the destination model’s API expects. If it is not, the destination rejects the request. For this reason, name a model whose payload schema matches the body your client sends.

## Create a Bedrock Runtime target
<a name="gateway-target-inference-invokemodel-create"></a>

You can create a target for the native `InvokeModel` API in one of two ways.

 **Connector** – Use the `bedrock-runtime` connector for zero-configuration setup. The gateway resolves the regional `bedrock-runtime` endpoint, discovers available models from the Amazon Bedrock model catalog, and configures the `InvokeModel` operations for you.

The following command creates a Bedrock Runtime target by using the connector. Replace `GATEWAY_ID` with your gateway’s identifier:

```
aws bedrock-agentcore-control create-gateway-target --cli-input-json '{
    "gatewayIdentifier": "GATEWAY_ID",
    "name": "bedrock",
    "targetConfiguration": {
        "inference": {
            "connector": {
                "source": {
                    "connectorId": "bedrock-runtime"
                }
            }
        }
    },
    "credentialProviderConfigurations": [
        {"credentialProviderType": "GATEWAY_IAM_ROLE"}
    ]
}'
```

 **Provider** – Use a provider configuration when you want explicit control over the endpoint and operations. Set the endpoint to the regional `bedrock-runtime` host and declare the operation paths you want to serve. The `bedrock-runtime` endpoint serves the native `InvokeModel` API at `/model/{model}/invoke` and `/model/{model}/invoke-with-response-stream`, and also serves the OpenAI Chat Completions, OpenAI Responses, and Anthropic Messages operations. The `bedrock-runtime` connector configures all of these for you; declare them explicitly only when you use a provider configuration.

The following command creates a Bedrock Runtime target by using a provider configuration. Replace `GATEWAY_ID` with your gateway’s identifier and `<region>` with your AWS Region:

```
aws bedrock-agentcore-control create-gateway-target --cli-input-json '{
    "gatewayIdentifier": "GATEWAY_ID",
    "name": "bedrock",
    "targetConfiguration": {
        "inference": {
            "provider": {
                "endpoint": "https://bedrock-runtime.<region>.amazonaws.com",
                "operations": [
                    {
                        "path": "/model/{model}/invoke",
                        "models": [{"model": "anthropic.*"}, {"model": "openai.*"}]
                    },
                    {
                        "path": "/model/{model}/invoke-with-response-stream",
                        "models": [{"model": "anthropic.*"}, {"model": "openai.*"}]
                    }
                ]
            }
        }
    },
    "credentialProviderConfigurations": [
        {"credentialProviderType": "GATEWAY_IAM_ROLE"}
    ]
}'
```

A Bedrock Runtime target supports the following outbound authorization types:
+  **IAM (SigV4)** – Use `GATEWAY_IAM_ROLE`. The gateway signs outbound requests to Amazon Bedrock with the gateway’s execution role. No signing-service configuration is required.
+  **API key** – Use `API_KEY` with an Amazon Bedrock API key.

**Note**  
The gateway’s execution role must grant `bedrock:InvokeModel` (and `bedrock:InvokeModelWithResponseStream` for streaming). A Bedrock Runtime target discovers its available models from the Amazon Bedrock model catalog rather than from a `GET /v1/models` call, so the role must also grant the Bedrock list permissions that the catalog scan uses. If the role is denied any of these permissions, discovery fails and the target does not reach the `Ready` state, so grant the complete set:  
 `bedrock:ListFoundationModels` 
 `bedrock:ListInferenceProfiles` 
 `bedrock:ListProvisionedModelThroughputs` 
 `bedrock:ListCustomModelDeployments` 
 `bedrock:ListImportedModels` 
 `bedrock:ListMarketplaceModelEndpoints` 
 `bedrock:ListPromptRouters` 
Alternatively, grant `bedrock:List*`. A list API that Amazon Bedrock does not offer in your AWS Region is skipped during discovery, so granting the full set is safe in every Region. For more information about the gateway execution role, see [Gateway permissions](gateway-prerequisites-permissions.md).

## Call the gateway with the Amazon Bedrock SDK
<a name="gateway-target-inference-invokemodel-call"></a>

To call the gateway with the Amazon Bedrock SDK, set the client’s `endpoint_url` to the gateway’s `/inference` path. Alternatively, set the `AWS_ENDPOINT_URL_BEDROCK_RUNTIME` environment variable to that URL and omit `endpoint_url` from your code; the SDK resolves the endpoint from the variable. No other code change is required: the gateway accepts the `bedrock` SigV4 signing name that the stock `bedrock-runtime` client uses, so you do not need to register a signing-name override.

In the following example, replace `<gateway-id>` with your gateway’s identifier and `<region>` with your AWS Region:

```
import boto3
import json

client = boto3.client(
    "bedrock-runtime",
    region_name="<region>",
    endpoint_url="https://<gateway-id>.gateway.bedrock-agentcore.<region>.amazonaws.com/inference",
)

body = json.dumps({
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Write a haiku."}],
})

response = client.invoke_model(
    modelId="us.anthropic.claude-sonnet-5-5",
    body=body,
    contentType="application/json",
)
print(json.loads(response["body"].read()))
```

You authenticate to the gateway, not to Amazon Bedrock. Your credentials need `bedrock-agentcore:InvokeGateway` on the gateway. When the target uses `GATEWAY_IAM_ROLE` outbound authorization, the gateway’s execution role holds the Amazon Bedrock permissions, so you do not need direct Amazon Bedrock model access. When the target uses an API key, the gateway sends that key to Amazon Bedrock instead. The credential you send to the gateway depends on the gateway’s inbound authorizer: SigV4 request signing when the gateway uses IAM authorization (as in the preceding example), or a bearer token passed as the SDK’s API key when it uses JWT authorization. For more information, see [inbound authentication](gateway-inbound-auth.md).

**Note**  
On a translated route, always set `contentType="application/json"` on the `InvokeModel` call. Amazon Bedrock treats `contentType` as optional, but the provider the gateway translates to requires the `Content-Type` header, and the gateway forwards the client’s headers without adding one. A request that omits it on a translated route fails with `400 ValidationException: Expected request with Content-Type: application/json`.

For streaming, use `invoke_model_with_response_stream`. The gateway delivers the response to the SDK as a native Amazon Bedrock event-stream, so the SDK’s built-in response-stream iterator (iterating `response["body"]`) works whether the target served the response natively or the gateway re-framed it from SSE.

```
response = client.invoke_model_with_response_stream(
    modelId="us.anthropic.claude-sonnet-5-5",
    body=body,
    contentType="application/json",
)
for event in response["body"]:
    chunk = json.loads(event["chunk"]["bytes"])
    # process each chunk as it arrives
```

## Route an OpenAI or Anthropic client to a Bedrock Runtime target
<a name="gateway-target-inference-invokemodel-reverse"></a>

An OpenAI SDK or Anthropic SDK client can name an Amazon Bedrock model ID that a Bedrock Runtime target serves. The gateway calls the native `InvokeModel` API and returns the response in the client’s dialect, re-framing a streamed event-stream response back into SSE.

```
from openai import OpenAI

client = OpenAI(
    base_url="https://<gateway-id>.gateway.bedrock-agentcore.<region>.amazonaws.com/inference/v1",
    api_key="<gateway-auth-token>",
)

response = client.chat.completions.create(
    model="openai.gpt-oss-120b-1:0",
    messages=[{"role": "user", "content": "Write a haiku."}],
)
```

The Anthropic SDK works the same way against a model that the target serves through the Anthropic Messages API:

```
from anthropic import Anthropic

client = Anthropic(
    base_url="https://<gateway-id>.gateway.bedrock-agentcore.<region>.amazonaws.com/inference",
    api_key="<gateway-auth-token>",
)

response = client.messages.create(
    model="us.anthropic.claude-sonnet-5-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Write a haiku."}],
)
```

## Discover available models
<a name="gateway-target-inference-invokemodel-discovery"></a>

Amazon Bedrock models that a Bedrock Runtime target discovers appear in the aggregated list-models response, with each model ID prefixed by the target name:

```
awscurl --service bedrock-agentcore --region <region> \
    "https://<gateway-id>.gateway.bedrock-agentcore.<region>.amazonaws.com/inference/v1/models"
```

```
{
    "data": [
        {"id": "bedrock/anthropic.claude-sonnet-5-5", "object": "model", "owned_by": "system"},
        {"id": "bedrock/us.anthropic.claude-sonnet-5-5", "object": "model", "owned_by": "system"},
        {"id": "bedrock/openai.gpt-oss-120b-1:0", "object": "model", "owned_by": "system"}
    ]
}
```

The response lists foundation models and inference profiles. In this example, `us.anthropic.claude-sonnet-5-5` is a cross-Region inference profile. Discovery also surfaces other invocable resources by Amazon Resource Name (ARN), including provisioned throughputs, imported models, custom model deployments, Amazon Bedrock Marketplace model endpoints, and prompt routers. Use a listed model ID (with or without the `bedrock/` target prefix) in your request.

**Note**  
The model IDs in this topic are examples. The models that a target exposes depend on what Amazon Bedrock offers in your AWS Region, and a model provider might deprecate or remove a model over time. Call the list-models endpoint to see the models currently available through your gateway. For model availability by AWS Region, and for whether a model is invocable directly or only through an inference profile, see [Model support by AWS Region](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html) in the *Amazon Bedrock User Guide*.

## Guardrails
<a name="gateway-target-inference-invokemodel-guardrails"></a>

When an `InvokeModel` request sets the `guardrailIdentifier` and `guardrailVersion` parameters, it relies on an Amazon Bedrock guardrail. The gateway handles a Bedrock guardrail as follows:
+ On a **passthrough** route (an `InvokeModel` client reaching a Bedrock Runtime target), Amazon Bedrock applies the guardrail.
+ On a **translated** route (where the gateway converts the request to a different provider’s dialect), the gateway cannot carry an Amazon Bedrock guardrail to a non-Bedrock provider. Rather than silently dropping the guardrail, the gateway rejects the request with `400 ValidationException: Cannot translate a Bedrock InvokeModel request with a customer guardrail configured.` 

Because a Bedrock guardrail applies only on a passthrough route, we recommend applying guardrails through Amazon Bedrock AgentCore Policy instead. Amazon Bedrock AgentCore Policy evaluates traffic in the gateway, so its guardrails apply on both passthrough and translated routes and across providers. For more information, see [Use guardrails in Amazon Bedrock AgentCore Policy](policy-guardrails-in-policies.md).

## Errors
<a name="gateway-target-inference-invokemodel-errors"></a>

The gateway returns errors in the client’s own dialect. An `InvokeModel` client receives the Amazon Bedrock JSON error body with the `x-amzn-errortype` header, so the Amazon Bedrock SDK builds its typed exceptions and applies its built-in retry behavior, which retries throttling and transient server errors and does not retry validation errors. Governance outcomes surface the same way: a Amazon Bedrock AgentCore Policy denial is an access-denied error, and a token-rate-limit rejection is a throttling error, each in the client’s format.