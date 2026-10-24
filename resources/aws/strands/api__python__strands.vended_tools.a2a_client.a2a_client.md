A2A client tool for communicating with remote A2A-protocol agents.

Provides :func:`make_a2a_client`, a factory that requires an explicit list of permitted endpoints (with optional :class:`~a2a.client.ClientConfig`).

The tool is a stateless shim over :class:`~strands.agent.a2a_agent.A2AAgent`. A fresh `A2AAgent` is constructed on every call so the tool carries no session state between invocations. Each endpoint may carry its own :class:`~a2a.client.ClientConfig` to support per-endpoint authentication (bearer tokens, SigV4, OAuth).

## A2AClientError

```python
class A2AClientError(RuntimeError)
```

Defined in: [src/strands/vended\_tools/a2a\_client/a2a\_client.py:38](https://github.com/strands-agents/harness-sdk/blob/main/strands-py/src/strands/vended_tools/a2a_client/a2a_client.py#L38)

Raised when an A2A operation fails.

#### AllowedEndpoint

A permitted endpoint: a bare URL string, or a `(url, ClientConfig)` tuple.

#### make\_a2a\_client

```python
def make_a2a_client(
        *,
        name: str = "a2a_client",
        description: str | None = None,
        allowed_endpoints: list[AllowedEndpoint]) -> DecoratedFunctionTool
```

Defined in: [src/strands/vended\_tools/a2a\_client/a2a\_client.py:46](https://github.com/strands-agents/harness-sdk/blob/main/strands-py/src/strands/vended_tools/a2a_client/a2a_client.py#L46)

Create an A2A client tool.

**Arguments**:

-   `name` - Tool name shown to the model.
-   `description` - Tool description shown to the model. When `None`, generated from `DEFAULT_A2A_CLIENT_DESCRIPTION` plus the permitted endpoints list.
-   `allowed_endpoints` - Permitted base URLs. Each entry is either a bare URL string (no custom config) or a `(url, ClientConfig)` tuple for per-endpoint authentication. Any endpoint not in this list is rejected before a network connection is made.

**Returns**:

A decorated tool that communicates with A2A agents.