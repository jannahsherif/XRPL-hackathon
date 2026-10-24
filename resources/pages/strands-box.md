# Strands Box
Source: https://strandsagents.com/docs/user-guide/box/ (summarized capture). See also raw/strands-agents_box.README.md

- Pre-release (0.1.x) local agent **sandbox**. macOS 15+ on Apple silicon only; Linux is planned. Works with any harness (Strands CLI, Claude Code, Codex CLI).
- **Layer 1, OS grants:** `box.toml`, enforced by Seatbelt, controls files, programs and network egress.
- **Layer 2, policy:** `policy.dw` in **Dogwood** (Cedar-compatible, with temporal operators). Deny by default.
- **Components:** Workload · Strands Shell + Monty (policy-checked zsh/bash/python) · Tools (separately sandboxed host binaries) · Credentials (the box is the credential boundary) · **Egress gateway** (terminates TLS, checks policy per request, injects real credentials in place of placeholders) · **MCP broker** · decision records (OTLP JSON).
- **Temporal rule example:** deny `http:request` to anything except the model endpoint if `fs:read` touched customer data in the last hour.
- **Caveat:** an agent's built-in Read/Write tools bypass policy.
