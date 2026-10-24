

# Guardrail policy examples
<a name="example-policies-guardrails"></a>

The policies in this section decide from a signal that a Bedrock guardrail computes while the request is being authorized. The guardrail reads the content you point it at, returns a confidence score per category, and the policy compares that score against a threshold.

Guardrails let a policy act on content that no static condition can describe — a prompt injection attempt, hate speech, or an account number in a model’s response. Because the underlying model is non-deterministic, the same input can score differently on different calls, unlike the rest of policy evaluation.

Every example authorizes the gateway described in [Resource configuration for examples](example-policies-reference.md). For the guardrail categories, thresholds, required IAM permissions, and Region availability, see [Guardrails in policies](policy-guardrails-in-policies.md).

## Rules these examples follow
<a name="example-policies-guardrails-rules"></a>

Five rules govern where a guardrail call is valid. Four are enforced synchronously, with `CreatePolicy` returning a `ValidationException` immediately. The base-permit rule is not enforced at all: a guardrail policy with no accompanying permit is valid, and simply never runs.

 **A guardrail policy needs a base permit**   
Policy evaluation is deny-by-default: a request is allowed only when some `permit` matches it. A guardrail `forbid` only ever **removes** access, and a `suppressOutput` acts on an action that already ran, so neither makes an action reachable. With a guardrail policy alone the action is denied before the guardrail is ever consulted, so the request is denied with nothing screened. Pair every guardrail policy with a plain `permit` for the same action.

 **The effect decides which side you may read**   
An authorization effect — `permit` or `forbid` — may only read the inbound payload. The `suppressOutput` effect may only read the outbound one. Using `context.output` with `permit` or `forbid` is rejected with `Guardrail '<name>' references 'context.output' but the policy has an authorization effect`.

 **One call reads one side**   
A single guardrail call cannot mix inbound and outbound paths. To screen both directions, write two policies.

 ** `SensitiveInformation` requires an aggregation**   
 `ContentFilter` and `PromptAttack` support per-category indexing, such as `["VIOLENCE"].confidenceScore`. `SensitiveInformation` does not: it requires `count()`, `categories()`, `maxConfidenceScore()`, or `minConfidenceScore()`. Indexing it by category is rejected with `Per-category indexing is not supported for SensitiveInformation`.

 **Only the published categories are accepted**   
Each safeguard accepts a fixed category list. Bedrock Guardrails documents more sensitive-information types than Policy in AgentCore accepts, so take the category names from [Supported guardrails](policy-guardrails-in-policies.md#supported-guardrails) rather than from the Bedrock documentation.

**Note**  
 `when guardrails { …​ }` is equivalent to a plain `when { …​ }` whose body calls a guardrail. The `guardrails` tag documents intent rather than restricting the policy. Under an authorization effect, a guardrail composes with ordinary Cedar conditions in the same policy: put the guardrail call in `when` and the request or principal conditions in `unless`, or alongside a `temporal` block. For more information, see [Combine a guardrail with request conditions](#example-policies-guardrails-combined) and [Combine temporal, guardrail, and request conditions](example-policies-temporal.md#example-policies-temporal-mixed).

## Reaching text inside arrays with a JSONPath
<a name="example-policies-guardrails-jsonpath"></a>

A guardrail’s content argument is a set of **strings**, which is straightforward for a scalar field. The text you most want to screen is not: a conversation or a list of content blocks is nested inside arrays and records, where a bare field path cannot reach it.

Naming the array itself is a type error, because the argument must be a string:

```
argument `context.input.messages` has type `Set<record>` ... but the provider
declares argument type `string`
```

Nor can you index into it. Dogwood has no array-projection operator, so `messages[*].content` and `messages[].content` are parse errors, while `messages[0]` and `messages.items.content` resolve to nothing.

Instead, write the content argument as a **string literal beginning with `$` **, which Policy in AgentCore resolves as a JSONPath:

```
BedrockGuardrails::ContentFilter(["VIOLENCE"], ["$.messages[*].content"])
```

A `$`-path has four properties worth knowing.

 **It is rooted at the raw payload, not at `context` **   
Write `$.messages[*].content`, never `$.context.input.messages[*].content`. The `context.input.` and `context.output.` prefixes are direction markers for field paths and have no place in a JSONPath.

 **Its direction comes from the effect**   
A JSONPath carries no direction marker, so `suppressOutput` makes it read the outbound payload and **any other effect** makes it read the inbound one. An outbound guardrail therefore must be a `suppressOutput`, while an inbound one can be either a `forbid` or a `permit` — both read the request.

 **Every match is concatenated**   
All wildcard matches are joined into one string with no separator, so a phrase split across several content blocks stays contiguous and cannot slip past a detector by being fragmented.

 **A path that matches nothing contributes nothing**   
This lets you list several candidate shapes in one call and let whichever exists resolve, which is how the following examples cover both the string and block forms of a message body.

**Warning**  
 **A JSONPath is not validated at creation.** Neither its syntax nor its fit to your schema is checked, so a mistyped or wrong path reaches `ACTIVE` like any other. At evaluation time it **fails closed**: the path yields no text, the guardrail cannot run, and the request is denied with `Authorization denied: request missing field(s) required for guardrail evaluation`, naming the field it could not find. Check the JSONPath first when you encounter this error.  
Test each guardrail policy against content it should catch, and take paths from [Text locations for each path](example-policies-reference.md#example-policies-reference-inference-fields) rather than adapting them from another API.

**Important**  
Do not mix a `$`-path and a bare `context.input.*` field in the same guardrail call under `suppressOutput`. The `$`-path is inferred as output while the explicit field is input, and the call is rejected immediately:  

```
Guardrail 'BedrockGuardrails::ContentFilter' mixes 'context.input.*' and 'context.output.*'
paths; all paths in a single call must be on the same side.
```
Naming an array as a bare field path is rejected too, but **asynchronously** — the policy returns 202 and then settles into `CREATE_FAILED`:  

```
provider `BedrockGuardrails::ContentFilter`: argument `context.input.messages` has type
`Set<record>` on action `...___POST:/v1/chat/completions` but the provider declares
argument type `string`
```
Writing an array projection in a field path, such as `context.input.messages[*].content`, fails at the call instead with `unexpected token '*', expected expression`.

For the text location on each inference API path, see [Text locations for each path](example-policies-reference.md#example-policies-reference-inference-fields).

## Screen a runtime target
<a name="example-policies-guardrails-runtime"></a>

 **Intent:** Reject any invocation of the claims assistant whose prompt looks like a prompt-injection attempt.

The base permit makes the runtime action reachable; the `forbid` removes access when the guardrail detects a prompt-injection attempt. The runtime target’s `prompt` is a scalar string, so a bare `context.input.prompt` field path works and no JSONPath is needed. The first argument lists the categories to evaluate, the second lists the content, and the result is indexed by category to read that category’s score.

```
// Base permit: makes the action reachable at all
permit(
  principal,
  action == AgentCore::Action::"ClaimsAgent___POST:/invocations",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);

// Inbound: reject prompt-injection attempts
forbid(
  principal,
  action == AgentCore::Action::"ClaimsAgent___POST:/invocations",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when guardrails {
  BedrockGuardrails::PromptAttack(["PROMPT_INJECTION"], [context.input.prompt])["PROMPT_INJECTION"]
    .confidenceScore
    .greaterThan(decimal("0.4"))
};
```

Content-filter and prompt-attack scores are discrete — one of 0, 0.2, 0.4, 0.6, 0.8, or 1.0 — so a threshold of `0.4` with `greaterThan` fires at 0.6 and above. The default threshold for prompt attack detection is 0.4.

Screening the outbound side works the same way, against the runtime target’s scalar `completion`:

```
suppressOutput(
  principal,
  action == AgentCore::Action::"ClaimsAgent___POST:/invocations",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when guardrails {
  BedrockGuardrails::ContentFilter(["VIOLENCE", "HATE"], [context.output.completion])
    .maxConfidenceScore().greaterThan(decimal("0.2"))
};
```

 `maxConfidenceScore()` takes the highest score across every category evaluated, so one threshold covers both without a clause per category. Use `minConfidenceScore()` when you need every category to score highly, and `count()` when you care how many categories were flagged rather than how strongly.

## Screen chat completions
<a name="example-policies-guardrails-inference-chat"></a>

 **Intent:** Screen the conversation sent to, and returned by, the `POST /v1/chat/completions` target.

 `$.messages[*].content` collects every message in the conversation, system and user alike, and `$.choices[*].message.content` collects every completion the model returned. Screening both directions takes three policies in total: the base permit, the inbound `forbid`, and the outbound `suppressOutput`.

```
// Base permit: makes the action reachable at all
permit(
  principal,
  action == AgentCore::Action::"ClaimsChat___POST:/v1/chat/completions",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);

// Inbound: what the caller sent
forbid(
  principal,
  action == AgentCore::Action::"ClaimsChat___POST:/v1/chat/completions",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when guardrails {
  BedrockGuardrails::ContentFilter(
    ["INSULTS", "MISCONDUCT"],
    ["$.messages[*].content"]
  ).maxConfidenceScore().greaterThan(decimal("0.2"))
};

// Outbound: what the model returned
suppressOutput(
  principal,
  action == AgentCore::Action::"ClaimsChat___POST:/v1/chat/completions",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when guardrails {
  BedrockGuardrails::ContentFilter(
    ["INSULTS", "MISCONDUCT"],
    ["$.choices[*].message.content"]
  ).maxConfidenceScore().greaterThan(decimal("0.2"))
};
```

## Screen the Responses API
<a name="example-policies-guardrails-inference-responses"></a>

 **Intent:** Screen the `POST /v1/responses` target, whose prompt has two possible wire shapes and a separate system prompt.

Three paths appear in the inbound call because `input` is either a bare string or a list of items holding content blocks, and `instructions` carries the system prompt. Whichever shape the caller sent resolves; the others match nothing and contribute nothing. Listing all three is what makes the policy correct for either wire form without your having to know which one arrives.

```
permit(
  principal,
  action == AgentCore::Action::"ClaimsResponses___POST:/v1/responses",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);

forbid(
  principal,
  action == AgentCore::Action::"ClaimsResponses___POST:/v1/responses",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when guardrails {
  BedrockGuardrails::ContentFilter(
    ["VIOLENCE", "MISCONDUCT"],
    ["$.instructions", "$.input", "$.input[*].content[*].text"]
  ).maxConfidenceScore().greaterThan(decimal("0.15"))
};

suppressOutput(
  principal,
  action == AgentCore::Action::"ClaimsResponses___POST:/v1/responses",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when guardrails {
  BedrockGuardrails::ContentFilter(
    ["VIOLENCE", "MISCONDUCT"],
    ["$.output[*].content[*].text"]
  ).maxConfidenceScore().greaterThan(decimal("0.15"))
};
```

Including `$.instructions` matters: the system prompt is a place an injected instruction can hide, and on this API it is a separate inbound member rather than a message in the conversation.

## Screen the Messages API
<a name="example-policies-guardrails-inference-messages"></a>

 **Intent:** Screen the `POST /v1/messages` target, whose message content may be a string or typed blocks.

 `$.messages[*].content` covers a message whose content is a plain string, while `$.messages[*].content[*].text` covers one whose content is an array of typed blocks. `$.system` covers the top-level system prompt, which on this API is not a message. On the outbound side, the Anthropic envelope returns content blocks at the top level, so the path is `$.content[*].text` rather than anything under `choices`.

```
permit(
  principal,
  action == AgentCore::Action::"ClaimsMessages___POST:/v1/messages",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);

forbid(
  principal,
  action == AgentCore::Action::"ClaimsMessages___POST:/v1/messages",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when guardrails {
  BedrockGuardrails::ContentFilter(
    ["VIOLENCE", "HATE"],
    ["$.messages[*].content", "$.messages[*].content[*].text", "$.system"]
  ).maxConfidenceScore().greaterThan(decimal("0.1"))
};

suppressOutput(
  principal,
  action == AgentCore::Action::"ClaimsMessages___POST:/v1/messages",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when guardrails {
  BedrockGuardrails::ContentFilter(
    ["VIOLENCE", "HATE"],
    ["$.content[*].text"]
  ).maxConfidenceScore().greaterThan(decimal("0.1"))
};
```

**Note**  
Take the paths for each API from [Text locations for each path](example-policies-reference.md#example-policies-reference-inference-fields) rather than adapting them from another path. The three envelopes differ enough that a path copied from one API silently matches nothing on another — which for a `forbid` means the traffic goes unscreened rather than being denied.

## Screen an MCP tool argument
<a name="example-policies-guardrails-mcp"></a>

 **Intent:** Reject a claim whose free-text description contains payment card or bank details.

An MCP tool’s arguments are declared in its schema, so a scalar argument such as `description` is reached with a bare field path. `count()` returns the number of categories detected, as a `Long`, so it is compared with an ordinary integer operator rather than a `decimal` method. Any detection at all denies the request.

```
// Base permit: makes the action reachable at all
permit(
  principal,
  action == AgentCore::Action::"InsuranceAPI___file_claim",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);

// Inbound: reject payment card or bank details
forbid(
  principal,
  action == AgentCore::Action::"InsuranceAPI___file_claim",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when guardrails {
  BedrockGuardrails::SensitiveInformation(
    ["CREDIT_DEBIT_CARD_NUMBER", "US_BANK_ACCOUNT_NUMBER", "US_BANK_ROUTING_NUMBER"],
    [context.input.description]
  ).count() > 0
};
```

Note the category names. `ACCOUNT_NUMBER` is not a valid category; the accepted names are `US_BANK_ACCOUNT_NUMBER` and `INTERNATIONAL_BANK_ACCOUNT_NUMBER`. A category the service does not recognize fails validation when you create the policy.

Several scalar fields can go in one call, and the guardrail evaluates all of them together. The base permit shown earlier applies to this variant too:

```
forbid(
  principal,
  action == AgentCore::Action::"InsuranceAPI___file_claim",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when guardrails {
  BedrockGuardrails::ContentFilter(
    ["INSULTS", "HATE"],
    [context.input.description, context.input.claimType]
  ).maxConfidenceScore().greaterThan(decimal("0.4"))
};
```

**Important**  
 `description` is an optional parameter, so a claim filed without it carries nothing at the guardrail’s data path. The guardrail cannot run, and the request is denied for a missing field rather than screened. Prefer guardrails on required parameters. If the field must stay optional, pair this policy with the `forbid …​ unless context.input has description` policy from [Require an optional parameter](example-policies-action-resource.md#example-policies-action-resource-optional) so the requirement is explicit and the denial reason names it.

## Suppress an MCP tool response
<a name="example-policies-guardrails-suppress-mcp"></a>

 **Intent:** Suppress the entire claim status response when it contains a social security number, so the caller receives nothing rather than the sensitive value.

 `suppressOutput` runs after the action has been authorized and has produced a result, and it acts on that result rather than on the decision to allow the call. The tool still runs; what the caller receives is suppressed.

```
// Base permit: makes the action reachable at all
permit(
  principal,
  action == AgentCore::Action::"InsuranceAPI___get_claim_status",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);

// Outbound: suppress the whole response when it carries a social security number
suppressOutput(
  principal,
  action == AgentCore::Action::"InsuranceAPI___get_claim_status",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when guardrails {
  BedrockGuardrails::SensitiveInformation(
    ["US_SOCIAL_SECURITY_NUMBER", "CREDIT_DEBIT_CARD_NUMBER"],
    [context.output.status]
  ).count() > 0
};
```

This example uses `count()` because `SensitiveInformation` requires an aggregation. For a content filter, where indexing is allowed, either form works.

**Warning**  
Output-phase evaluation changes how a response is delivered. The gateway holds the response until the guardrail returns a verdict, so a streaming response is buffered rather than streamed. The caller receives nothing until evaluation finishes, then either the whole response at once or nothing. Account for the added latency, and for the memory a large response occupies while it is held, before you enable `suppressOutput` on a high-throughput or streaming target.

## Combine a guardrail with request conditions
<a name="example-policies-guardrails-combined"></a>

 **Intent:** Screen prompts for injection attempts, but only for callers outside the trusted internal role.

A guardrail call is an ordinary function call, so it composes with Cedar conditions: here a `when` holds the guardrail check and an `unless` exempts a trusted role. Writing `when { …​ }` instead of `when guardrails { …​ }` is equivalent.

```
// Base permit: makes the action reachable at all
permit(
  principal,
  action == AgentCore::Action::"ClaimsAgent___POST:/invocations",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
);

// Inbound: screen external callers for injection attempts
forbid(
  principal is AgentCore::OAuthUser,
  action == AgentCore::Action::"ClaimsAgent___POST:/invocations",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  BedrockGuardrails::PromptAttack(["PROMPT_INJECTION", "JAILBREAK"], [context.input.prompt])
    .maxConfidenceScore().greaterThan(decimal("0.4"))
}
unless {
  principal.hasTag("role") &&
  principal.getTag("role") == "internal-service"
};
```

Ordering matters for cost rather than correctness. A guardrail call invokes Bedrock on every request the policy’s scope matches. Narrow the scope by action, and by principal where you can, rather than writing one broad policy that screens all traffic.

## Creating these policies
<a name="example-policies-guardrails-validation"></a>

Create guardrail policies with `--validation-mode IGNORE_ALL_FINDINGS`. This is **not** the default: the `validationMode` parameter defaults to `FAIL_ON_ANY_FINDINGS`.

The semantic analyzer reasons about a policy’s breadth, and the shape a guardrail policy takes trips it: a `permit` naming one action is reported as **overly permissive**, and a `forbid` naming one action as **overly restrictive**. Both are the intended shape here — a base permit plus a narrowly targeted guardrail — so the default mode rejects a correct policy set. Treat `FAIL_ON_ANY_FINDINGS` as a design review for broad authorization policies rather than a gate for guardrail policies. For what each mode checks, see [Validation and analysis overview](policy-validation-overview.md).

The rejection is asynchronous. `CreatePolicy` returns 202 with status `CREATING`, and the policy then settles into `CREATE_FAILED` with the reason in `statusReasons`, so poll for the terminal status.

## Choosing a threshold
<a name="example-policies-guardrails-thresholds"></a>

Start from the defaults — 0.2 for content filters, 0.4 for prompt attack detection, 0.2 for sensitive information — then calibrate against your own traffic rather than reasoning about the numbers.

Because scores are discrete, a threshold only matters where it falls between two adjacent score values. With `greaterThan`, any threshold in the interval [0.4, 0.6) behaves identically, so moving from 0.4 to 0.5 changes nothing.

To calibrate, attach the policy engine in `LOG_ONLY` mode, or set the individual policy’s `enforcementMode` to `LOG_ONLY`, and read the scores the guardrail returned from the policy log before you enforce. For the full procedure, including how to build a confusion matrix from logged scores, see [How to choose a threshold](policy-guardrails-in-policies.md#how-to-choose-a-threshold). For running a single policy in log-only mode while the rest of the engine enforces, see [Policy enforcement modes](policy-enforcement-modes.md).

**Important**  
Guardrails are non-deterministic: the same content can score differently on separate calls, so a request near your threshold may be allowed once and denied the next time. Treat a guardrail as a probabilistic control layered on top of your deterministic policies, not as a replacement for them. Where a rule can be expressed as a condition on the request — a role, a claim type, an amount — express it that way instead.