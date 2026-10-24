Defined in: [src/mcp/client.ts:235](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L235)

Options for MCP tool invocation.

## Properties

### signal?

```ts
optional signal?: AbortSignal;
```

Defined in: [src/mcp/client.ts:237](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L237)

AbortSignal to cancel the in-flight request.

---

### timeoutMs?

```ts
optional timeoutMs?: number;
```

Defined in: [src/mcp/client.ts:239](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L239)

Overall time limit in milliseconds for this call. Overrides `tasksConfig.pollTimeout` when tasks are configured.

---

### progressCallback?

```ts
optional progressCallback?: McpProgressCallback;
```

Defined in: [src/mcp/client.ts:242](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L242)

Callback for progress notifications during this call. Takes precedence over the client’s callback.