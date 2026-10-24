

# Pass custom headers to Amazon Bedrock AgentCore Runtime
<a name="runtime-header-allowlist"></a>

Custom headers let you pass contextual information from your application directly to your agent code without cluttering the main request payload. You can pass any valid HTTP header that is not in the [restricted headers](#runtime-header-restrictions) list, including webhook signatures like `X-Custom-Signature`, API keys like `X-Api-Key`, trace context, or session identifiers. You can also pass the `Authorization` header for JWT-based authentication when your agent is configured with a custom JWT authorizer. Headers prefixed with `X-Amzn-Bedrock-AgentCore-Runtime-Custom-` continue to be supported for backward compatibility. Up to 20 headers can be configured per runtime, and each header value is limited to 4KB.

Amazon Bedrock AgentCore Runtime lets you pass headers in a request to your agent code provided the headers meet the following criteria:
+ Header name is a valid HTTP header (alphanumeric characters, hyphens, and underscores) and is not in the [restricted headers](#runtime-header-restrictions) list.
+ Headers starting with `x-amz-` are not allowed (these are reserved for AWS SigV4 signing).
+ Headers starting with `x-amzn-` are not allowed, except for headers prefixed with `X-Amzn-Bedrock-AgentCore-Runtime-Custom-` .
+ The `Authorization` header requires the agent runtime to be configured with a `customJWTAuthorizer` for OAuth-based inbound access.
+ Header value is not greater than 4KB in size.
+ Up to 20 headers can be configured per runtime.
+ Header names are case-insensitive and duplicates (by case-insensitive comparison) are not allowed.

## Restricted headers
<a name="runtime-header-restrictions"></a>

To maintain security and prevent exposure of sensitive information, the following headers are restricted and cannot be configured for propagation:


| Category | Headers | 
| --- | --- | 
| Authentication & Authorization | Proxy-Authorization, WWW-Authenticate | 
| Content Negotiation | Accept, Accept-Charset, Accept-Encoding, Accept-Language, Content-Type, Content-Length, Content-Encoding, Content-Language, Content-Location, Content-Range | 
| Caching | Cache-Control, ETag, Expires, If-Match, If-Modified-Since, If-None-Match, If-Range, If-Unmodified-Since, Last-Modified, Pragma, Vary | 
| Connection Management | Connection, Keep-Alive, Proxy-Connection, Upgrade | 
| Request Context | Host, User-Agent, Referer, From | 
| Range / Transfer | Range, Accept-Ranges, Transfer-Encoding, TE, Trailer | 
| Server Information | Server, Date, Location, Retry-After | 
| Cookies | Set-Cookie, Cookie | 
| Security | Content-Security-Policy, Content-Security-Policy-Report-Only, Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, Cross-Origin-Embedder-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy | 
| CORS | Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers, Access-Control-Allow-Credentials, Access-Control-Expose-Headers, Access-Control-Max-Age, Access-Control-Request-Method, Access-Control-Request-Headers, Origin | 
| Client Hints | Accept-CH, Accept-CH-Lifetime, DPR, Width, Viewport-Width, Downlink, ECT, RTT, Save-Data | 
| Experimental / Proposed | Clear-Site-Data, Feature-Policy, Expect-CT, Public-Key-Pins, Public-Key-Pins-Report-Only | 
| Proxy | Via, Forwarded, X-Forwarded-For, X-Forwarded-Host, X-Forwarded-Proto, X-Real-IP, X-Requested-With, X-CSRF-Token | 
| IP Spoofing / URL Manipulation | True-Client-IP, X-Client-IP, X-Cluster-Client-IP, X-Originating-IP, X-Source-IP, X-Original-URL, X-Original-Host, X-Rewrite-URL | 
| CDN / Proxy | CF-Ray, CF-Connecting-IP, X-Amz-Cf-Id, X-Cache, X-Served-By | 
| HTTP/2 Pseudo Headers | :method, :path, :scheme, :authority, :status | 
| Server Push | Link | 
| WebSocket | Sec-WebSocket-Key, Sec-WebSocket-Accept, Sec-WebSocket-Version, Sec-WebSocket-Protocol, Sec-WebSocket-Extensions | 

In addition to the restricted headers listed above:
+ All headers starting with `x-amz-` are restricted (for example, `x-amz-security-token` , `x-amz-date` , `x-amz-content-sha256` ). These are reserved for AWS request signing.
+ All headers starting with `x-amzn-` are restricted, except for headers prefixed with `X-Amzn-Bedrock-AgentCore-Runtime-Custom-` .

## Step 1: Create your agent
<a name="create-agent-headers"></a>

Create an empty AgentCore project, then add an agent with the request header allowlist:

```
agentcore create --name MyHeaderProject --template empty
cd MyHeaderProject
agentcore add runtime \
  --name MyHeaderAgent \
  --language python \
  --protocol HTTP \
  --request-header-allowlist \
    X-Custom-Signature \
    X-Api-Key \
    X-Amzn-Bedrock-AgentCore-Runtime-Custom-UserId
```

Initialize the Python project and add its dependencies:

```
cd app/MyHeaderAgent
uv init --bare
uv add \
  "aws-opentelemetry-distro~=0.21.0" \
  "bedrock-agentcore[strands-agents]>=1.18.1,<2" \
  "botocore[crt]~=1.43.0" \
  "strands-agents>=1.15,<2"
cd ../..
```

Create `app/MyHeaderAgent/main.py` to access the custom headers from the request context:

```
import json
from bedrock_agentcore.runtime import BedrockAgentCoreApp, RequestContext
from strands import Agent

app = BedrockAgentCoreApp()
agent = Agent()

@app.entrypoint
def agent_invocation(payload, context: RequestContext):
    """Handler for agent invocation"""
    user_message = payload.get("prompt", "")
    if not isinstance(user_message, str) or not user_message.strip():
        return {"error": "Invalid input: 'prompt' must be a non-empty string"}
    app.logger.info("invoking agent with user message: %s", payload)
    response = agent(user_message)

    # access request headers here
    header_names = ["X-Custom-Signature", "X-Api-Key", "X-Amzn-Bedrock-AgentCore-Runtime-Custom-UserId"]
    request_headers = {name: context.request.headers.get(name) for name in header_names}
    app.logger.info("Headers: %s", json.dumps(request_headers))
    return response

app.run()
```

The `context.request_headers` property contains only the `Authorization` header and headers prefixed with `X-Amzn-Bedrock-AgentCore-Runtime-Custom-`. To read other allowlisted headers, such as `X-Custom-Signature`, use the headers of the underlying request, `context.request.headers`.

## Step 2: Configure and deploy your agent with custom headers
<a name="deploy-agentcore-runtime"></a>

Configure the request header allowlist on your agent runtime so that custom headers are forwarded to your agent code at invocation time.

The `agentcore add runtime` command in Step 1 stores the allowlist in the Runtime’s `requestHeaderAllowlist` field in `agentcore/agentcore.json`. To change the allowlist later, edit that field and deploy again.

Deploy your agent:

```
agentcore deploy
```

Optionally, run `agentcore build` first to synthesize and check the project without deploying.

Run `agentcore status --json`. The Runtime resource’s `arn` field contains its ARN.

If you manage the Runtime with the AWS SDK instead of the AgentCore CLI, set `requestHeaderConfiguration` when you call `CreateAgentRuntime` or `UpdateAgentRuntime`. For more information, see [RequestHeaderConfiguration](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_RequestHeaderConfiguration.html).

## Step 3: Invoke your agent with custom headers
<a name="invoke-custom-headers"></a>

Pass custom headers when invoking your agent so that your agent code can access them through the request context.

**Example**  

1. Use `--header` to pass a custom header with `agentcore invoke`:

   ```
   agentcore invoke --runtime MyHeaderAgent \
     --payload '{"prompt":"Tell me a joke"}' \
     --header "X-Custom-Signature: sha256=abc123def456"
   ```

   You can pass multiple headers by repeating `--header`:

   ```
   agentcore invoke --runtime MyHeaderAgent \
     --payload '{"prompt":"Tell me a joke"}' \
     --header "X-Custom-Signature: sha256=abc123def456" \
     --header "X-Api-Key: my-api-key" \
     --header "X-Amzn-Bedrock-AgentCore-Runtime-Custom-UserId: user-123"
   ```

1. Use boto3 with event handlers to add custom headers to your agent invocation. For more details on botocore events, see [botocore events documentation](https://botocore.amazonaws.com/v1/documentation/api/latest/topics/events.html).

   ```
   import json
   import boto3
   
   agent_arn = 'YOUR_AGENT_ARN_HERE'
   prompt = "Tell me a joke"
   
   agent_core_client = boto3.client('bedrock-agentcore', region_name='us-west-2')
   event_system = agent_core_client.meta.events
   
   EVENT_NAME = 'before-sign.bedrock-agentcore.InvokeAgentRuntime'
   CUSTOM_HEADER_NAME = 'X-Custom-Signature'
   CUSTOM_HEADER_VALUE = 'sha256=abc123def456'
   
   def add_custom_runtime_header(request, **kwargs):
       request.headers.add_header(CUSTOM_HEADER_NAME, CUSTOM_HEADER_VALUE)
   
   handler = event_system.register_first(EVENT_NAME, add_custom_runtime_header)
   
   payload = json.dumps({"prompt": prompt}).encode()
   response = agent_core_client.invoke_agent_runtime(
       agentRuntimeArn=agent_arn,
       payload=payload
   )
   
   event_system.unregister(EVENT_NAME, handler)
   
   content = []
   for chunk in response.get("response", []):
       content.append(chunk.decode('utf-8'))
   print(json.loads(''.join(content)))
   ```

## Step 4: (Optional) Configure inbound JWT authentication
<a name="pass-jwt-token"></a>

To pass the JWT token used for OAuth-based inbound access to your agent, configure `authorizerType` and `authorizerConfiguration` in your agent configuration.

**Example**  

1. To use JWT authentication, run the following command instead of the `agentcore add runtime` command in Step 1:

   ```
   agentcore add runtime \
     --name MyHeaderAgent \
     --language python \
     --protocol HTTP \
     --authorizer-type CUSTOM_JWT \
     --authorizer-configuration \
     '{"customJwtAuthorizer":{"discoveryUrl":"https://cognito-idp.us-east-1.amazonaws.com/user-pool-id/.well-known/openid-configuration","allowedAudience":["your-client-id"],"allowedClients":["your-client-id"]}}' \
     --request-header-allowlist \
       Authorization \
       X-Custom-Signature \
       X-Api-Key \
       X-Amzn-Bedrock-AgentCore-Runtime-Custom-UserId
   ```

   Deploy to apply the configuration:

   ```
   agentcore deploy
   ```

   With this configuration, the `Authorization` header from incoming requests is validated against your OIDC provider and forwarded to your agent code, along with the custom headers.

   When you invoke the agent in Step 3, also pass a JWT from your OIDC provider with `--bearer-token`. Replace `<access-token>` with the token:

   ```
   agentcore invoke --runtime MyHeaderAgent \
     --bearer-token "<access-token>" \
     --payload '{"prompt":"Tell me a joke"}' \
     --header "X-Custom-Signature: sha256=abc123def456"
   ```

1. For information about setting up an agent with OAuth inbound access using the AWS SDK, see [Authenticate and authorize with Inbound Auth and Outbound Auth](runtime-oauth.md).