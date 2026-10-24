```ts
type McpToolFilterCallback = (tool) => boolean;
```

Defined in: [src/mcp/client.ts:112](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L112)

Decides whether a tool matches a filter. Receives the tool under its agent-facing name.

## Parameters

| Parameter | Type |
| --- | --- |
| `tool` | `McpTool` |

## Returns

`boolean`