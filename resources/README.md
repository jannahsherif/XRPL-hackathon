# Hackathon Resources

Reference material on agentic payments (Mastercard), agent platforms (AWS Bedrock AgentCore) and agent frameworks (Strands Agents). Captured 2026-10-24.

- [ONTOLOGY.md](ONTOLOGY.md): a rough concept map across all sources. Start here.
- [aws/BUILD-GUIDE.md](aws/BUILD-GUIDE.md): **AgentCore + Strands**: deploying agents, AgentCore Payments (EVM/Solana only), Gateway/Identity/Policy guardrails, and 5 patterns for adding XRPL. Raw docs are in `aws/agentcore/` (306 pages) and `aws/strands/` (139).
- [xrpl/BUILD-GUIDE.md](xrpl/BUILD-GUIDE.md): **XRPL agentic payments**: x402 on XRPL (`x402-xrpl`, hosted facilitators), the XRPL Claude skills, a table mapping ledger primitives to agent-payment concepts, and payment-channel vouchers. Raw docs are in `xrpl/docs/` (123 pages) and `xrpl/skills/`.
- [mastercard/BUILD-GUIDE.md](mastercard/BUILD-GUIDE.md): **how to build on Mastercard agentic payments**, with build tracks, auth, API specs and XRPL mapping. The folder also holds the raw Mastercard docs, OpenAPI specs and an MCP client script.
- [raw/](raw/): GitHub READMEs, verbatim.
- [pages/](pages/): web pages as summarized captures. These are not verbatim; the source URL is at the top of each file.

## Sources

| Source | Capture | Notes |
|---|---|---|
| [Mastercard Agent Toolkit](https://developer.mastercard.com/platform/documentation/agent-toolkit/) | [pages/mastercard-agent-toolkit.md](pages/mastercard-agent-toolkit.md) | |
| [Mastercard Agent Pay](https://www.mastercard.com/us/en/business/artificial-intelligence/mastercard-agent-pay.html) | [pages/mastercard-agent-pay.md](pages/mastercard-agent-pay.md) | 403 to fetch; built from secondary sources |
| [Agent Pay for Machines PR](https://www.mastercard.com/global/en/news-and-trends/press/2026/june/mastercard-launches-agent-pay-for-machines.html) | [pages/mastercard-agent-pay-for-machines.md](pages/mastercard-agent-pay-for-machines.md) | 403 to fetch; built from press coverage |
| [aws/bedrock-agentcore-sdk-python](https://github.com/aws/bedrock-agentcore-sdk-python) | [raw/aws_bedrock-agentcore-sdk-python.README.md](raw/aws_bedrock-agentcore-sdk-python.README.md) | |
| [aws/agentcore-cli](https://github.com/aws/agentcore-cli) | [raw/aws_agentcore-cli.README.md](raw/aws_agentcore-cli.README.md) | |
| [Strands: AgentCore Tool Search](https://strandsagents.com/docs/integrations/plugins/agentcore-tool-search/) | [pages/strands-agentcore-tool-search.md](pages/strands-agentcore-tool-search.md) | |
| [github.com/strands-agents](https://github.com/strands-agents) | `raw/strands-agents_*.README.md` | harness-sdk, tools, agent-sop, samples, sdk-typescript, box, shell, evals, mcp-server, agent-builder |
| [Strands deep-dive blog](https://aws.amazon.com/blogs/machine-learning/strands-agents-sdk-a-technical-deep-dive-into-agent-architectures-and-observability/) | [pages/strands-deep-dive-blog.md](pages/strands-deep-dive-blog.md) | |
| [Strands Box](https://strandsagents.com/docs/user-guide/box/) | [pages/strands-box.md](pages/strands-box.md) | |
| [awslabs/agentcore-samples](https://github.com/awslabs/agentcore-samples) | [raw/awslabs_agentcore-samples.README.md](raw/awslabs_agentcore-samples.README.md) | |
| [Agent Toolkit for AWS](https://aws.amazon.com/products/developer-tools/agent-toolkit-for-aws/) | [pages/aws-agent-toolkit.md](pages/aws-agent-toolkit.md) | |
| [AWS Workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/f2827c9d-9206-40ca-8fec-956238c0d0ac/en-US) | [pages/aws-workshop.md](pages/aws-workshop.md) | JS app; content not captured |
| *(added)* [AgentCore Payments docs](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/payments.md) | [pages/aws-agentcore-payments.md](pages/aws-agentcore-payments.md) | x402/MPP agent payments; directly relevant |
