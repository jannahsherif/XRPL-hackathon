# Strands Agents SDK: technical deep dive (AWS ML Blog, 2025-07-31)
Source: https://aws.amazon.com/blogs/machine-learning/strands-agents-sdk-a-technical-deep-dive-into-agent-architectures-and-observability/ (summarized capture)

- **Model-driven:** Agent = Model + System prompt + Tools. The LLM does the planning; there are no hard-coded flows.
- **Agent loop:** read context, plan, (call tool, incorporate result), repeat until the final answer.
- **Tools:** the `@tool` decorator, hot reload, `strands-agents-tools`, MCP, and A2A (agents as tools).
- **Models:** Bedrock (default), Anthropic, OpenAI, Ollama, LlamaAPI, others.
- **Patterns:** Single agent · Swarm (peer mesh/blackboard) · Supervisor (agents-as-tools) · Hierarchical · Graph. They can be combined.
- **Observability:** OpenTelemetry traces (model and tool spans), metrics (tokens, latency, tool success, loop turns) and logs, sent to X-Ray, CloudWatch or Jaeger.
- **Deploy:** Lambda · Fargate/ECS/EKS · hybrid return-of-control · **AgentCore Runtime** (up to 8h tasks).
- **Security:** least-privilege tools, Bedrock Guardrails, IAM/Cognito/OAuth, MAESTRO threat modeling.

```python
from strands import Agent, tool
from strands_tools import calculator

@tool
def research_assistant(query: str) -> str:
    """Delegate research to a specialist agent."""
    return str(Agent(system_prompt="Research assistant. Cite sources.")(query))

orchestrator = Agent(tools=[research_assistant, calculator])
```
