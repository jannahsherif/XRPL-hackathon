Defined in: [src/mcp/client.ts:217](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L217)

Error thrown when a server reports a task as failed.

## Extends

-   `Error`

## Constructors

### Constructor

```ts
new McpTaskFailedError(statusMessage?, details?): McpTaskFailedError;
```

Defined in: [src/mcp/client.ts:225](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L225)

#### Parameters

| Parameter | Type |
| --- | --- |
| `statusMessage?` | `string` |
| `details?` | { `code?`: `number`; `data?`: `unknown`; } |
| `details.code?` | `number` |
| `details.data?` | `unknown` |

#### Returns

`McpTaskFailedError`

#### Overrides

```ts
Error.constructor
```

## Properties

### statusMessage

```ts
readonly statusMessage: string;
```

Defined in: [src/mcp/client.ts:219](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L219)

Optional server-provided context for the failure.

---

### code

```ts
readonly code: number;
```

Defined in: [src/mcp/client.ts:221](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L221)

JSON-RPC error code reported by a failed SEP-2663 task.

---

### data

```ts
readonly data: unknown;
```

Defined in: [src/mcp/client.ts:223](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L223)

Sender-defined error details reported by a failed SEP-2663 task.