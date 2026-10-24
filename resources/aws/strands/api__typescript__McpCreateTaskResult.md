```ts
type McpCreateTaskResult = McpTaskResult & McpTask & {
  resultType: "task";
};
```

Defined in: [src/mcp/task-types.ts:109](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L109)

Task handle returned instead of an immediate tool result.

## Type Declaration

| Name | Type | Defined in |
| --- | --- | --- |
| `resultType` | `"task"` | [src/mcp/task-types.ts:109](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L109) |