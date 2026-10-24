```ts
type McpInputRequest =
  | CreateMessageRequest
  | ListRootsRequest
  | Omit<ElicitRequest, "params"> & {
  params:   | ElicitRequestFormParams
     | Omit<ElicitRequestURLParams, "elicitationId">;
};
```

Defined in: [src/mcp/task-types.ts:33](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L33)

Server-to-client request that can be surfaced by an input-required task.