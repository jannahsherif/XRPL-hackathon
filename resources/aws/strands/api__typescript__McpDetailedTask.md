```ts
type McpDetailedTask =
  | McpWorkingTask
  | McpInputRequiredTask
  | McpCompletedTask
  | McpFailedTask
  | McpCancelledTask;
```

Defined in: [src/mcp/task-types.ts:92](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L92)

Status-specific task state returned by `tasks/get` and task notifications.