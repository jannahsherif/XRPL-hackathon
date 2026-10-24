```ts
type McpSubmitToolResult =
  | McpDirectCallToolResult
  | McpCreateTaskResult;
```

Defined in: [src/mcp/task-types.ts:112](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L112)

Direct result or task handle returned by `submitTool`.