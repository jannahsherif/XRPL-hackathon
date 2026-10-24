Defined in: [src/mcp/task-types.ts:123](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L123)

Empty acknowledgement returned by `tasks/cancel`.

## Extends

-   [`McpTaskResult`](/docs/api/typescript/McpTaskResult/index.md)

## Properties

### \_meta?

```ts
optional _meta?: Record<string, unknown>;
```

Defined in: [src/mcp/task-types.ts:100](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L100)

Optional MCP result metadata.

#### Inherited from

[`McpTaskResult`](/docs/api/typescript/McpTaskResult/index.md).[`_meta`](/docs/api/typescript/McpTaskResult/index.md#_meta)

---

### resultType

```ts
resultType: "complete";
```

Defined in: [src/mcp/task-types.ts:124](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/task-types.ts#L124)

Wire discriminator for task handles and completed task operations.

#### Overrides

[`McpTaskResult`](/docs/api/typescript/McpTaskResult/index.md).[`resultType`](/docs/api/typescript/McpTaskResult/index.md#resulttype)