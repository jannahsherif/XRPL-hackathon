# Agent Toolkit for AWS
Source: https://aws.amazon.com/products/developer-tools/agent-toolkit-for-aws/ (summarized capture)

- Gives coding agents tools, knowledge and guardrails for building on AWS. Install with `aws configure agent-toolkit` (AWS CLI 2.35+). No extra charge.
- **AWS MCP Server** (remote, managed): `https://aws-mcp.us-east-1.api.aws/mcp` via `uvx mcp-proxy-for-aws@1.6.3`. Covers 300+ services and 15k+ API actions. Tools: `aws___run_script`, `aws___search_documentation`, `aws___read_documentation`, `aws___retrieve_skill`.
- **Agent Skills:** on-demand instruction packages (aws-serverless, aws-cloudformation, aws-networking, aws-database, aws-observability, 75+ more, including AgentCore Payments).
- **Agent Plugins:** bundles of MCP config plus skills (aws-core, aws-agents, aws-data-analytics, aws-agents-for-devsecops) for Kiro, Claude Code, Cursor, Codex, Devin.
  - Claude Code: `/plugin install aws-core@claude-plugins-official`
- **Rule files:** a project rules file that tells agents to use the MCP server and skills and to prefer IaC.
- **Governance:** CloudWatch/CloudTrail, plus IAM condition keys `aws:ViaAWSMCPService` and `aws:CalledViaAWSMCP`.
- Repo: https://github.com/aws/agent-toolkit-for-aws
