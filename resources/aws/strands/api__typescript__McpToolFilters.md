Defined in: [src/mcp/client.ts:121](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L121)

Filters controlling which MCP tools a client exposes.

## Properties

### allowed?

```ts
optional allowed?: McpToolMatcher[];
```

Defined in: [src/mcp/client.ts:123](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L123)

When present, only tools matching at least one matcher are exposed.

---

### rejected?

```ts
optional rejected?: McpToolMatcher[];
```

Defined in: [src/mcp/client.ts:125](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L125)

Tools matching at least one matcher are excluded, even when also allowed.