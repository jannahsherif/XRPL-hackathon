

# Rate limit dimensions
<a name="gateway-rate-limits-dimensions"></a>

Dimension keys determine how the gateway groups traffic into rate limit buckets. Each dimension key references a value from the request context. The gateway resolves these values at runtime to find the matching rate limit entry.

## Supported dimensions
<a name="gateway-rate-limits-dimensions-supported"></a>


| Dimension key | Description | Example value | 
| --- | --- | --- | 
|  `targetName`  | The name of the target being invoked. Resolved from the request path. |  `my-llm-target`  | 
|  `toolName`  | The fully-qualified name of the tool being invoked, in the format `targetName___toolName`. Available for MCP tool-use requests. |  `my-mcp-target___get_weather`  | 
|  `qualifiedModelId`  | The fully qualified model identifier for inference targets. |  `anthropic.claude-3-sonnet-20240229-v1:0`  | 
|  `$.context.jwt.<claim>`  | A claim extracted from the caller’s JWT token. Replace `<claim>` with the claim name (for example, `$.context.jwt.sub`, `$.context.jwt.team`). |  `user-123`  | 
|  `$.context.iam.principal`  | The IAM principal ARN of the caller. |  `arn:aws:iam::123456789012:role/MyRole`  | 
|  `$.context.iam.sourceIdentity`  | The source identity set by the caller when assuming a role. |  `developer@example.com`  | 
|  `$.context.request.header.<name>`  | The value of a caller-supplied request header. Replace `<name>` with the header name (for example, `$.context.request.header.X-Customer-Id`). Header name matching is case-insensitive. Requires a trusted identity co-dimension in the same rate limit — see [Custom request header and body dimensions](#gateway-rate-limits-dimensions-custom-context). |  `premium`  | 
|  `$.context.request.body.<path>`  | The value of a field in the JSON request body, addressed by a simple dotted path. Replace `<path>` with the dotted field path (for example, `$.context.request.body.metadata.tier`). Requires a trusted identity co-dimension in the same rate limit — see [Custom request header and body dimensions](#gateway-rate-limits-dimensions-custom-context). |  `batch`  | 

## Custom request header and body dimensions
<a name="gateway-rate-limits-dimensions-custom-context"></a>

The `$.context.request.header.<name>` dimension groups traffic by a caller-supplied request header. The `$.context.request.body.<path>` dimension groups traffic by a field in the JSON request body. For example, you can rate limit by a tenant tier passed in an `X-Customer-Id` header, or by a `workload_type` field in the request body.

### Required identity co-dimension
<a name="gateway-rate-limits-dimensions-custom-context-codimension"></a>

Because the caller supplies the header or body value, a custom request header or body dimension cannot be used on its own. Each rate limit that uses one of these dimensions must also include a trusted identity co-dimension in the same rate limit, so that each bucket is scoped to an authenticated identity:
+ For a gateway with IAM (SigV4) inbound authentication, include an `$.context.iam.*` dimension (for example, `$.context.iam.principal`).
+ For a gateway with OAuth (JWT) inbound authentication, include a `$.context.jwt.<claim>` dimension (for example, `$.context.jwt.sub`).

The gateway rejects a rate limit that specifies a custom request header or body dimension without a matching identity co-dimension, returning a `ValidationException` at creation. A gateway’s inbound authentication must be bindable to an IAM or JWT identity to use these dimensions. For example, a gateway configured with no inbound authentication cannot use custom request header or body dimensions.

**Note**  
The identity co-dimension can appear in any position in `dimensionKeys` relative to the header or body dimension; it only has to be present in the same rate limit.

### Selector syntax and value constraints
<a name="gateway-rate-limits-dimensions-custom-context-syntax"></a>

Custom request header and body selectors use a fixed field-pointer grammar — JSONPath operators (such as filters, wildcards, or array slices) are not supported:
+ A header selector is `$.context.request.header.<name>`, where `<name>` is a single HTTP header name.
+ A body selector is `$.context.request.body.<path>`, where `<path>` is a dotted path of object field names (for example, `metadata.customer.tier`). Each segment addresses a nested JSON object field; the final segment must resolve to a scalar (string, number, or boolean) value.
+ A selector can be at most 128 characters.

At runtime, the gateway resolves the value and applies the following rules before using it as a bucket key:
+ Leading and trailing whitespace is removed. Values are case-sensitive and are otherwise used exactly as supplied (for example, `gold` and `Gold` are distinct values).
+ A resolved value can be at most 256 characters and must not contain `/`, `|`, `,`, the `*` character, or control characters. A value that violates these rules causes the dimension to be skipped for that request (see [Dimension resolution behavior](#gateway-rate-limits-dimensions-resolution)).

## The default value (`*`)
<a name="gateway-rate-limits-dimensions-default-value"></a>

Rate limit entries support the special value `*` as a catch-all default for a dimension.
+ An entry with `*` for a dimension means "apply this rate to all values of this dimension."
+ If a more specific entry exists for the actual value, the specific entry takes precedence (most-specific match wins).
+  `*` creates independent per-entity buckets — each distinct value that matches gets its own rate bucket at the configured rate.

 **Trailing-only constraint for multi-dimension rate limits:** 

When a rate limit has multiple dimension keys, ` ` can only appear in trailing positions. If you use `` at position N, all subsequent positions must also be `*`.

For example, with `dimensionKeys: ["targetName", "toolName", "$.context.jwt.sub"]`:


| Entry dimensions | Valid | Why | 
| --- | --- | --- | 
|  `["target1", "readData", "alice"]`  | Yes | All positions are specific values. | 
|  `["target1", "readData", "*"]`  | Yes | Only the last position is `*`. | 
|  `["target1", "*", "*"]`  | Yes | Trailing positions are `*`. | 
|  `["*", "*", "*"]`  | Yes | All positions are `*` (default for any combination). | 
|  `["*", "readData", "alice"]`  | No |  `*` at position 1 followed by specific values. | 
|  `["*", "*", "alice"]`  | No |  `*` at positions 1-2 followed by specific value. | 
|  `["target1", "*", "alice"]`  | No |  `*` at position 2 followed by specific value at position 3. | 

 **How matching works:** 

When a request arrives, the gateway resolves the actual dimension values and looks for the most specific matching entry. For example, if the resolved values are `["target1", "readData", "alice"]`, the gateway checks entries in this order:

1.  `["target1", "readData", "alice"]` — exact match (most specific)

1.  `["target1", "readData", "*"]` — last dimension uses default

1.  `["target1", "*", "*"]` — last two dimensions use default

1.  `["*", "*", "*"]` — fully default (least specific)

The first match wins.

**Tip**  
Use specific entries for known high-value or restricted entities, and `*` entries as default rate tiers for everything else.

## Dimension resolution behavior
<a name="gateway-rate-limits-dimensions-resolution"></a>

When the gateway evaluates a rate limit, it resolves each dimension key from the request context:
+ If a dimension key cannot be resolved from the request (for example, `toolName` on a non-tool request, or a JWT claim that does not exist), the gateway skips that rate limit entirely. The request is not throttled by that rate limit.
+ A custom request header or body dimension is skipped the same way when the value cannot be resolved to a usable value. This happens when the header is absent, the request body is not valid JSON, the dotted path does not exist or does not resolve to a scalar, or the resolved value violates the value constraints (see [Selector syntax and value constraints](#gateway-rate-limits-dimensions-custom-context-syntax)).
+ Only validated context is used for resolution. JWT claims are extracted from tokens that have been validated by the gateway’s authentication configuration. IAM context is available only for SigV4-authenticated requests.

## Shared vs individual limits
<a name="gateway-rate-limits-dimensions-shared-vs-individual"></a>

The combination of dimension keys and entry values determines whether traffic shares a single rate bucket or each entity gets its own independent bucket.


| dimensionKeys | Entry dimensions | Behavior | 
| --- | --- | --- | 
|  `["targetName"]`  |  `{"targetName": "my-target"}`  | All traffic to `my-target` shares one bucket (shared limit for that target). | 
|  `["targetName"]`  |  `{"targetName": "*"}`  | Each target gets its own independent bucket at this rate (per-entity). | 
|  `["$.context.jwt.sub"]`  |  `{"$.context.jwt.sub": "*"}`  | Each unique caller gets their own bucket (individual per-caller limit). | 
|  `["targetName", "$.context.jwt.sub"]`  |  `{"targetName": "my-target", "$.context.jwt.sub": "*"}`  | Each caller gets their own bucket, scoped to `my-target`. | 
|  `["targetName", "$.context.jwt.sub"]`  |  `{"targetName": "*", "$.context.jwt.sub": "*"}`  | Each unique target-and-caller combination gets its own bucket. | 

**Warning**  
Avoid using high-cardinality or unbounded dimension values as dimension keys — for example JWT claims such as `$.context.jwt.jti` or `$.context.jwt.nonce`, or custom request header/body selectors that carry per-request-unique values such as a request ID, trace ID, or UUID (for example, `$.context.request.header.X-Request-Id`). These create an unbounded number of rate buckets, which might reduce the effectiveness of rate limiting. Use stable, bounded identifiers such as `sub`, `team`, or `tier` instead.