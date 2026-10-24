Defined in: [src/mcp/task-types.ts:87](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L87)

Task that was cancelled before completion.

## Extends

-   [`McpTask`](/docs/api/typescript/McpTask/index.md)

## Properties

### taskId

```ts
taskId: string;
```

Defined in: [src/mcp/task-types.ts:19](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L19)

Stable server-generated task identifier.

#### Inherited from

[`McpTask`](/docs/api/typescript/McpTask/index.md).[`taskId`](/docs/api/typescript/McpTask/index.md#taskid)

---

### statusMessage?

```ts
optional statusMessage?: string;
```

Defined in: [src/mcp/task-types.ts:21](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L21)

#### Inherited from

[`McpTask`](/docs/api/typescript/McpTask/index.md).[`statusMessage`](/docs/api/typescript/McpTask/index.md#statusmessage)

---

### createdAt

```ts
createdAt: string;
```

Defined in: [src/mcp/task-types.ts:23](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L23)

ISO 8601 timestamp at which the task was created.

#### Inherited from

[`McpTask`](/docs/api/typescript/McpTask/index.md).[`createdAt`](/docs/api/typescript/McpTask/index.md#createdat)

---

### lastUpdatedAt

```ts
lastUpdatedAt: string;
```

Defined in: [src/mcp/task-types.ts:25](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L25)

ISO 8601 timestamp at which the task was last updated.

#### Inherited from

[`McpTask`](/docs/api/typescript/McpTask/index.md).[`lastUpdatedAt`](/docs/api/typescript/McpTask/index.md#lastupdatedat)

---

### ttlMs

```ts
ttlMs: number;
```

Defined in: [src/mcp/task-types.ts:27](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L27)

Retention duration from creation in milliseconds, or `null` for unlimited retention.

#### Inherited from

[`McpTask`](/docs/api/typescript/McpTask/index.md).[`ttlMs`](/docs/api/typescript/McpTask/index.md#ttlms)

---

### pollIntervalMs?

```ts
optional pollIntervalMs?: number;
```

Defined in: [src/mcp/task-types.ts:29](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L29)

Server-suggested polling interval in milliseconds.

#### Inherited from

[`McpTask`](/docs/api/typescript/McpTask/index.md).[`pollIntervalMs`](/docs/api/typescript/McpTask/index.md#pollintervalms)

---

### status

```ts
status: "cancelled";
```

Defined in: [src/mcp/task-types.ts:88](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L88)

#### Overrides

[`McpTask`](/docs/api/typescript/McpTask/index.md).[`status`](/docs/api/typescript/McpTask/index.md#status)