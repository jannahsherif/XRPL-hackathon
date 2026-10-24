Amazon Bedrock AgentCore Evaluations is AWS’s managed service for evaluating agents. It scores agent traces with built-in and custom LLM-as-a-judge evaluators, evaluates production traffic continuously or past sessions on demand, and renders the results in the CloudWatch GenAI Observability dashboard. Strands is a supported framework: an agent instrumented with the Strands Harness SDK’s OpenTelemetry tracing emits traces that AgentCore Evaluations can score directly, with no evaluation code in your application.

Choose between the two based on where you want evaluation to run:

-   **AgentCore Evaluations** when you want managed, continuous evaluation of deployed agents, with results in a hosted dashboard.
-   **Strands Evals SDK** when you want evaluation in code: local experiments, CI gates, custom evaluators, simulators, and chaos testing.

The AWS documentation covers setup end to end:

-   [Amazon Bedrock AgentCore Evaluations](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/evaluations.html): what the service provides and how it works.
-   [Supported agent frameworks](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/supported-frameworks.html): instrumentation requirements for Strands and other frameworks.
-   [Built-in evaluators](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/built-in-evaluators-overview.html): the managed evaluator catalog.
-   [Online evaluation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/online-evaluations.html) and [on-demand evaluation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/on-demand-evaluations.html): continuous scoring of live traffic and evaluation of past sessions.

## Sending SDK results to the dashboard

Results produced by the Strands Evals SDK itself can land in the same dashboard. When the `AGENT_OBSERVABILITY_ENABLED` environment variable is `true`, `Experiment` writes each evaluation result to CloudWatch Logs, using the `EVALUATION_RESULTS_LOG_GROUP` environment variable as the destination log group. Run your evaluation script with ADOT auto-instrumentation configured for Bedrock AgentCore, as described in [Add observability to your Amazon Bedrock AgentCore resources](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-configure.html), and the scores appear in the GenAI Observability dashboard alongside your agent traces.

## Related documentation

-   [Evaluating remote traces](/docs/user-guide/evals-sdk/how-to/trace_providers/index.md): score existing CloudWatch traces with SDK evaluators
-   [Quickstart](/docs/user-guide/evals-sdk/quickstart/index.md): run your first SDK evaluation

## Related pages

- [Deploying Strands Agents to Amazon Bedrock AgentCore Runtime](/docs/user-guide/sdk/deploy/deploy_to_bedrock_agentcore/index.md) (3 shared tags)
- [Python Deployment to Amazon Bedrock AgentCore Runtime](/docs/user-guide/sdk/deploy/deploy_to_bedrock_agentcore/python/index.md) (3 shared tags)
- [TypeScript Deployment to Amazon Bedrock AgentCore Runtime](/docs/user-guide/sdk/deploy/deploy_to_bedrock_agentcore/typescript/index.md) (3 shared tags)
- [Guardrails](/docs/user-guide/sdk/safety-security/guardrails/index.md) (2 shared tags)
- [Bedrock Nova Sonic](/docs/user-guide/sdk/bidi/models/bedrock/index.md) (2 shared tags)
- [Amazon Nova](/docs/user-guide/sdk/model-providers/amazon-nova/index.md) (2 shared tags)
- [Bedrock Knowledge Base Store](/docs/user-guide/sdk/memory/bedrock-knowledge-base/index.md) (2 shared tags)
- [PII Redaction](/docs/user-guide/sdk/safety-security/pii-redaction/index.md) (2 shared tags)
- [Amazon Bedrock](/docs/user-guide/sdk/model-providers/amazon-bedrock/index.md) (2 shared tags)
- [Evaluating remote traces](/docs/user-guide/evals-sdk/how-to/trace_providers/index.md) (1 shared tag)
