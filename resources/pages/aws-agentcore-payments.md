# Amazon Bedrock AgentCore Payments (preview, May 2026)
Source: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/payments.md. Not in the original link list; added because `agentcore payment` shows up in the CLI README and it is directly relevant.

- A managed service for agent **microtransactions** to paid APIs, MCP servers, content and other agents.
- **Protocols:** **x402** and **MPP** (Machine Payments Protocol). Both use HTTP **402 Payment Required**. AgentCore handles the whole agent-side flow: receive the payment request, sign with the wallet, return proof.
- **PaymentSession:** budget (`maxSpendAmount`, currency) plus an expiry. Requests are denied once either is hit. A failed signing does not use up budget.
- **Wallet providers:** Coinbase CDP and Stripe (Privy) embedded stablecoin wallets. Secrets are stored as an AgentCore Identity **PaymentCredentialProvider**.
- **Discovery:** the Coinbase **x402 Bazaar** MCP server (10k+ pay-per-use endpoints) through AgentCore Gateway.
- **Observability:** CloudWatch vended logs and X-Ray spans.
- **Access:** AWS CLI/SDKs, AgentCore SDK, AgentCore CLI (`agentcore payment`), the "AgentCore Payments" skill in the Agent Toolkit for AWS, and the [Strands AgentCore Payments plugin](https://strandsagents.com/docs/community/plugins/agentcore-payments/) (catches 402 responses and retries with payment headers).
- Sample: `aws-samples/sample-agentcore-cloudfront-x402-payments` (a CloudFront + Lambda@Edge paywalled seller).
- **XRPL note:** the documented wallets and chains are Coinbase CDP and Privy (EVM/Solana-oriented). XRPL / RLUSD is not listed, which leaves a possible gap to fill.
