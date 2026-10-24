```ts
type McpProgressCallback = (progress) => void;
```

Defined in: [src/mcp/client.ts:101](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L101)

Callback receiving progress notifications during a tool call. May be async. A throw or rejection is logged as a warning.

## Parameters

| Parameter | Type |
| --- | --- |
| `progress` | [`McpProgress`](/docs/api/typescript/McpProgress/index.md) |

## Returns

`void`