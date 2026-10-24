

# Inference targets
<a name="gateway-targets-inference"></a>

You can add inference targets to your gateway to route LLM traffic to model providers. The gateway acts as a unified LLM proxy layer, allowing clients to connect to a single endpoint and route requests to the correct model provider based on the model specified in the request. Inference targets provide model-based routing, credential abstraction, and centralized governance for LLM traffic across multiple providers.

Adding inference targets to your gateway is useful when you want to:
+ Provide a single endpoint that routes to multiple model providers (such as Amazon Bedrock, OpenAI, Anthropic, or other OpenAI-compatible services) without requiring clients to manage provider-specific configurations.
+ Abstract credential management so that clients authenticate to the gateway while the gateway authenticates to providers on their behalf.
+ Apply centralized governance through Amazon Bedrock Guardrails and Amazon Bedrock AgentCore Policy consistently across all LLM calls regardless of provider.
+ Use OpenAI SDK or Anthropic SDK directly with the gateway endpoint, switching between models by changing the model string.
+ List available models across all configured providers through a single aggregated endpoint.

Inference targets use the `inference` key in the target configuration. You can configure an inference target in one of two ways:
+  **Connector** – Zero-configuration setup for supported model providers. Recommended for most use cases.
+  **Provider** – Explicit control over the endpoint, model mappings, and operations. Use when you need to customize routing behavior.

Inference targets also support the Amazon Bedrock `InvokeModel` API wire format, and translate requests and responses between the Amazon Bedrock, OpenAI, and Anthropic dialects so that a client can reach a provider that speaks a different dialect. For more information, see [Use the Amazon Bedrock InvokeModel API with inference targets](gateway-target-inference-invokemodel.md).

The following topics describe each configuration type in detail.

**Topics**
+ [Inference connector targets](gateway-target-inference-connector.md)
+ [Inference provider targets](gateway-target-inference-provider.md)
+ [Use the Amazon Bedrock InvokeModel API with inference targets](gateway-target-inference-invokemodel.md)