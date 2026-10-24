```ts
type McpDirectCallToolResult = CallToolResult & {
  resultType?: never;
};
```

Defined in: [src/mcp/task-types.ts:104](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L104)

Direct tool result whose wire-only task discriminator has been removed.

## Type Declaration

| Name | Type | Defined in |
| --- | --- | --- |
| `resultType?` | `never` | [src/mcp/task-types.ts:105](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L105) |