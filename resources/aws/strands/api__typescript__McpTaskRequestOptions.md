Defined in: [src/mcp/client.ts:246](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L246)

Options for an explicit SEP-2663 lifecycle request.

## Properties

### signal?

```ts
optional signal?: AbortSignal;
```

Defined in: [src/mcp/client.ts:248](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L248)

AbortSignal to cancel the lifecycle request.

---

### timeoutMs?

```ts
optional timeoutMs?: number;
```

Defined in: [src/mcp/client.ts:250](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L250)

Overrides the configured per-request timeout in milliseconds.