Defined in: [src/mcp/task-types.ts:17](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L17)

Operational metadata shared by every MCP task state.

## Extended by

-   [`McpCancelledTask`](/docs/api/typescript/McpCancelledTask/index.md)
-   [`McpCompletedTask`](/docs/api/typescript/McpCompletedTask/index.md)
-   [`McpFailedTask`](/docs/api/typescript/McpFailedTask/index.md)
-   [`McpInputRequiredTask`](/docs/api/typescript/McpInputRequiredTask/index.md)
-   [`McpWorkingTask`](/docs/api/typescript/McpWorkingTask/index.md)

## Properties

### taskId

```ts
taskId: string;
```

Defined in: [src/mcp/task-types.ts:19](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L19)

Stable server-generated task identifier.

---

### status

```ts
status: McpTaskStatus;
```

Defined in: [src/mcp/task-types.ts:20](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L20)

---

### statusMessage?

```ts
optional statusMessage?: string;
```

Defined in: [src/mcp/task-types.ts:21](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L21)

---

### createdAt

```ts
createdAt: string;
```

Defined in: [src/mcp/task-types.ts:23](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L23)

ISO 8601 timestamp at which the task was created.

---

### lastUpdatedAt

```ts
lastUpdatedAt: string;
```

Defined in: [src/mcp/task-types.ts:25](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L25)

ISO 8601 timestamp at which the task was last updated.

---

### ttlMs

```ts
ttlMs: number;
```

Defined in: [src/mcp/task-types.ts:27](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L27)

Retention duration from creation in milliseconds, or `null` for unlimited retention.

---

### pollIntervalMs?

```ts
optional pollIntervalMs?: number;
```

Defined in: [src/mcp/task-types.ts:29](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L29)

Server-suggested polling interval in milliseconds.