```ts
type McpToolMatcher = string | RegExp | McpToolFilterCallback;
```

Defined in: [src/mcp/client.ts:118](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L118)

Matches a tool for filtering. A string matches the server-side tool name exactly; a `RegExp` matches it from the start (as Python’s `Pattern.match` does); a callback receives the tool.