Defined in: [src/mcp/task-types.ts:96](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L96)

Common result envelope used by the MCP tasks extension.

## Extended by

-   [`McpCancelTaskResult`](/docs/api/typescript/McpCancelTaskResult/index.md)
-   [`McpUpdateTaskResult`](/docs/api/typescript/McpUpdateTaskResult/index.md)

## Properties

### resultType

```ts
resultType: "task" | "complete";
```

Defined in: [src/mcp/task-types.ts:98](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L98)

Wire discriminator for task handles and completed task operations.

---

### \_meta?

```ts
optional _meta?: Record<string, unknown>;
```

Defined in: [src/mcp/task-types.ts:100](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L100)

Optional MCP result metadata.