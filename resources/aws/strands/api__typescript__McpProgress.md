Defined in: [src/mcp/client.ts:89](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L89)

A progress update reported by an MCP server during a tool call.

## Properties

### progress

```ts
progress: number;
```

Defined in: [src/mcp/client.ts:91](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L91)

Amount of work completed so far. Increases even when the total is unknown.

---

### total?

```ts
optional total?: number;
```

Defined in: [src/mcp/client.ts:94](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L94)

Total amount of work, when the server reports one.

---

### message?

```ts
optional message?: string;
```

Defined in: [src/mcp/client.ts:97](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L97)

Human-readable description of the current progress, when the server provides one.