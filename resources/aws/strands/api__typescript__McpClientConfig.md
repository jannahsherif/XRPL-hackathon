```ts
type McpClientConfig = McpClientOptions & {
  transport?: McpTransport;
  url?: string | URL;
  auth?: McpClientCredentials;
  authProvider?: OAuthClientProvider;
  headers?: Record<string, string>;
};
```

Defined in: [src/mcp/client.ts:293](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L293)

Arguments for configuring an MCP Client.

## Type Declaration

| Name | Type | Description | Defined in |
| --- | --- | --- | --- |
| `transport?` | [`McpTransport`](/docs/api/typescript/McpTransport/index.md) | Pre-constructed transport. Mutually exclusive with `url`. Reconnecting requires a transport that can start again. | [src/mcp/client.ts:295](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L295) |
| `url?` | `string` | `URL` | Server URL. When provided, a StreamableHTTP transport is constructed automatically. | [src/mcp/client.ts:298](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L298) |
| `auth?` | [`McpClientCredentials`](/docs/api/typescript/McpClientCredentials/index.md) | Client credentials for OAuth machine-to-machine auth. Requires `url`. | [src/mcp/client.ts:301](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L301) |
| `authProvider?` | `OAuthClientProvider` | Custom OAuth provider for advanced auth flows. Requires `url`. Mutually exclusive with `auth`. | [src/mcp/client.ts:304](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L304) |
| `headers?` | `Record`<`string`, `string`\> | Custom headers to include on every request to the server. Requires `url`. | [src/mcp/client.ts:307](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/mcp/client.ts#L307) |