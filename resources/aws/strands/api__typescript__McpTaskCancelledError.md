Defined in: [src/mcp/client.ts:205](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L205)

Error thrown when a server reports a task as cancelled.

## Extends

-   `Error`

## Constructors

### Constructor

```ts
new McpTaskCancelledError(statusMessage?): McpTaskCancelledError;
```

Defined in: [src/mcp/client.ts:209](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L209)

#### Parameters

| Parameter | Type |
| --- | --- |
| `statusMessage?` | `string` |

#### Returns

`McpTaskCancelledError`

#### Overrides

```ts
Error.constructor
```

## Properties

### statusMessage

```ts
readonly statusMessage: string;
```

Defined in: [src/mcp/client.ts:207](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L207)

Optional server-provided context for the cancellation.