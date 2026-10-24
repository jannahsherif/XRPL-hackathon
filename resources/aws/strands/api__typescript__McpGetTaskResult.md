```ts
type McpGetTaskResult = McpTaskResult & McpDetailedTask & {
  resultType: "complete";
};
```

Defined in: [src/mcp/task-types.ts:115](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L115)

Complete status-specific result returned by `tasks/get`.

## Type Declaration

| Name | Type | Defined in |
| --- | --- | --- |
| `resultType` | `"complete"` | [src/mcp/task-types.ts:115](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L115) |