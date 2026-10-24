# Mastercard Agent Pay
Source: https://www.mastercard.com/us/en/business/artificial-intelligence/mastercard-agent-pay.html
> The official page returned HTTP 403 to automated fetches. This was built from secondary sources (listed below). Check it against the official page before relying on specifics.

## Building blocks
- **Know Your Agent (KYA):** a trust and registration framework, not a payment protocol. Agents are registered and verified, like KYC, before they can get tokens.
- **Agentic Tokens:** tokenized card credentials scoped to an agent. The agent never sees the PAN. The network enforces scope (spend caps, merchant limits), and a user can revoke one agent's token without affecting the card.
- **Verifiable Intent:** a signed record of what the user asked for (an "Intent Artifact"). Transactions reference it, so the issuer can check that the cart matches the request.
- **Payment Passkeys:** biometric consumer authentication where consent is required.
- **Agent Pay Acceptance Framework:** lets merchants recognize trusted agents. Uses **Web Bot Auth** (signed HTTP messages) and card-format credentials, so existing checkout fields work.
- **Settlement:** existing card rails.

## Participants
Agent platform · Agent · Consumer · Merchant · Issuer · Acquirer · Processor · Infrastructure provider

## Flow
1. The agent is registered (KYA).
2. The agent is issued an Agentic Token.
3. Verifiable Intent captures the user's mandate.
4. Passkey authentication, where required.
5. The merchant, issuer and others recognize the transaction as agent-mediated.
6. Settlement.

## Adjacent protocols (each works at a different layer)
x402 (HTTP payment negotiation) · MCP (tools) · A2A (agent comms) · AP2 (payment intent/authorization) · ACP (merchant interactions)

Sources: [Nevermined review](https://nevermined.ai/blog/mastercard-agent-pay-review) · [Checkout.com](https://www.checkout.com/blog/mastercard-checkout-discuss-agentic-commerce-agent-pay) · [GovInfoSecurity](https://www.govinfosecurity.com/agentic-commerce-technology-shaping-future-payments-a-29800)
