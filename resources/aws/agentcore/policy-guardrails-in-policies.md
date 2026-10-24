

# Guardrails in policies
<a name="policy-guardrails-in-policies"></a>

This section explains how to put guardrails in policies, so that a policy’s decision depends on whether request or response content holds unsafe material. The content check itself is performed by a *guardrail*, which Policy in AgentCore calls during evaluation. Today guardrails are backed by [Amazon Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html).

A guardrail condition names three things: the **guardrail type**, the **categories** that type should assess, and the **content** to assess. The guardrail returns a confidence score, and your policy decides what to do with it.

If you are new to guardrails in policies, start with [Getting started with guardrails](policy-guardrails-getting-started.md), which will walk you through creating one end to end. For example policies covering MCP, runtime, and each inference API, see [Guardrail policy examples](example-policies-guardrails.md).

**Topics**
+ [Building blocks of a guardrail condition](#guardrail-building-blocks)
+ [Guardrails regional availability](#guardrails-regional-availability)
+ [Before you begin](#policy-guardrails-before-you-begin)
+ [Writing guardrails in policies](#defining-guardrails-in-policies)
+ [How guardrails work in a policy](#how-guardrails-works-with-policy)
+ [Limitations](#guardrails-in-policy-limitations)
+ [Getting started with guardrails](policy-guardrails-getting-started.md)

## Building blocks of a guardrail condition
<a name="guardrail-building-blocks"></a>

Policy in AgentCore supports three guardrail types. Each takes a set of categories to assess and returns its result differently.

 `ContentFilter`   
Harmful-content categories such as `VIOLENCE` or `HATE`. Returns a confidence score for every category you name, whether or not the content exhibits it.

 `PromptAttack`   
Prompt-manipulation categories such as `JAILBREAK` or `PROMPT_INJECTION`. Returns a confidence score for every category you name.

 `SensitiveInformation`   
Sensitive entities such as `EMAIL` or `US_SOCIAL_SECURITY_NUMBER`. Returns a detection per entity found rather than a score per category, so it has no per-category score and requires an aggregation.

For the categories each type accepts, see [Supported guardrails](#supported-guardrails). For the content to assess, see [Passing context to your guardrail](#passing-context-to-your-guardrail).

A confidence score is a decimal between 0 and 1 expressing how strongly the content exhibits the assessed property. You decide what to do with that score, and the policy expresses your decision as a condition on the guardrail result — most often a threshold comparison, such as `.confidenceScore.greaterThan(decimal("0.4"))`. For thresholds and the comparison operators, see [Thresholds for guardrails](#thresholds-for-guardrails).

Scores can also be reduced across categories instead of compared one at a time. An *aggregation* does this: `maxConfidenceScore()` and `minConfidenceScore()` return a score, while `count()` returns how many detections there were and `categories()` returns the set of categories detected, so those two need no threshold. For the full list, see [Aggregations](#guardrail-aggregations).

## Guardrails regional availability
<a name="guardrails-regional-availability"></a>

The following table shows which AWS Regions support guardrails in policies.


| Region name | Guardrails in policies | 
| --- | --- | 
| US East (N. Virginia) | ✓ Yes | 
| US East (Ohio) | ✓ Yes | 
| US West (N. California) | No | 
| US West (Oregon) | ✓ Yes | 
| Asia Pacific (Hyderabad) | No | 
| Asia Pacific (Malaysia) | No | 
| Asia Pacific (Mumbai) | No | 
| Asia Pacific (Seoul) | No | 
| Asia Pacific (Singapore) | No | 
| Asia Pacific (Sydney) | ✓ Yes | 
| Asia Pacific (Thailand) | No | 
| Asia Pacific (Tokyo) | ✓ Yes | 
| Canada (Central) | No | 
| Europe (Frankfurt) | No | 
| Europe (Ireland) | No | 
| Europe (London) | ✓ Yes | 
| Europe (Milan) | No | 
| Europe (Paris) | No | 
| Europe (Spain) | No | 
| Europe (Stockholm) | ✓ Yes | 
| South America (São Paulo) | No | 
|  AWS GovCloud (US-West) | No | 

## Before you begin
<a name="policy-guardrails-before-you-begin"></a>

Before you start, you need to properly configure your IAM role.

### Permissions
<a name="policy-guardrails-permissions"></a>

The gateway’s execution role needs `bedrock:InvokeGuardrailChecks` in addition to the AgentCore permissions it already carries. For the latter, see [AgentCore Gateway and Policy in AgentCore IAM Permissions](policy-permissions.md).

Policy in AgentCore uses [forward access session (FAS)](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_forward_access_sessions.html) credentials derived from the gateway’s execution role to call the Bedrock Guardrails API on your behalf, which is why the permission belongs on that role.

```
{
  "Version": "2012-10-17", 
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "bedrock:InvokeGuardrailChecks",
      "Resource": "arn:aws:bedrock:us-west-2:123456789012:guardrail/abc123"
    }
  ]
}
```

### Supported guardrails
<a name="supported-guardrails"></a>



- ** Content filter **
  - **Entity type:**  `ContentFilter` 
  - **Categories:**  `VIOLENCE`, `HATE`, `SEXUAL`, `MISCONDUCT`, `INSULTS` 

- ** Prompt attack detection **
  - **Entity type:**  `PromptAttack` 
  - **Categories:**  `JAILBREAK`, `PROMPT_INJECTION`, `PROMPT_LEAKAGE` 

- ** Sensitive information **
  - **Entity type:**  `SensitiveInformation` 
  - **Categories:**
    -  **Personal identity** — `ADDRESS`, `AGE`, `NAME`, `EMAIL`, `PHONE`, `USERNAME`, `PASSWORD`, `PIN`, `DRIVER_ID`, `LICENSE_PLATE`, `VEHICLE_IDENTIFICATION_NUMBER` 
    -  **Financial** — `CREDIT_DEBIT_CARD_NUMBER`, `CREDIT_DEBIT_CARD_CVV`, `CREDIT_DEBIT_CARD_EXPIRY`, `US_BANK_ACCOUNT_NUMBER`, `US_BANK_ROUTING_NUMBER`, `INTERNATIONAL_BANK_ACCOUNT_NUMBER`, `SWIFT_CODE` 
    -  **Government and health identifiers** — `US_SOCIAL_SECURITY_NUMBER`, `US_PASSPORT_NUMBER`, `US_INDIVIDUAL_TAX_IDENTIFICATION_NUMBER`, `CA_SOCIAL_INSURANCE_NUMBER`, `CA_HEALTH_NUMBER`, `UK_NATIONAL_INSURANCE_NUMBER`, `UK_NATIONAL_HEALTH_SERVICE_NUMBER`, `UK_UNIQUE_TAXPAYER_REFERENCE_NUMBER` 
    -  **Credentials and network** — `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `IP_ADDRESS`, `MAC_ADDRESS`, `URL` 



**Note**  
This table is the current list of guardrails and categories that Policy in AgentCore supports. A category outside it fails validation when you create the policy. In particular there is no `ACCOUNT_NUMBER` category — use `US_BANK_ACCOUNT_NUMBER` or `INTERNATIONAL_BANK_ACCOUNT_NUMBER`.

## Writing guardrails in policies
<a name="defining-guardrails-in-policies"></a>

To put a guardrail in a policy, you can either author the policy as code or describe it in natural language. As with other policies, specify an effect, such as `permit`, with a condition (`when guardrails`). In the condition, provide the guardrail to enable, the categories to assess, the content to evaluate, and the score comparison you want.

 **Example guardrail definition** 

```
suppressOutput (principal, action == AgentCore::Action::"<TargetName>___<METHOD>:<uri>", resource == AgentCore::Gateway::"<gateway-arn>")
when guardrails {
    BedrockGuardrails::ContentFilter(["HATE"],[context.output.message])["HATE"]
    .confidenceScore
    .greaterThan(decimal("0.2"))
};
```

**Note**  
 `suppressOutput` runs after the tool has produced a result and withholds the response from the caller. The tool still runs; only the response is suppressed.  
 `suppressOutput` works only with guardrail conditions. Its condition must consist solely of guardrail checks. Write those checks in either a `when guardrails {…​}` block or a plain `when {…​}` block. `suppressOutput` does not support standard Cedar or `temporal {…​}` conditions.

Note the three underscores that separate the target name from the method and URI. For examples against a complete reference gateway, see [Guardrail policy examples](example-policies-guardrails.md).

### Creating a policy with guardrails
<a name="creating-a-guardrail-policy"></a>

To create the policy, put the statement in the `policy` field of the `definition` property. For more information, see [Create a policy](policy-create-policies.md). Otherwise it is created like any other policy.

**Example**  
The interactive wizard is the easiest way to add a guardrail, because it builds the statement for you.  

1. Run `agentcore add policy` with no flags:

   ```
   agentcore add policy
   ```

   The wizard prompts for the gateway, target, engine, and policy name. Choose the guardrail form as the source, and it then prompts for the effect, guardrail category, filters, and data path, and shows you the statement it built before creating it.

1. Deploy the project:

   ```
   agentcore deploy --yes
   ```

   To script the same thing non-interactively, pass the form flags — `--form-category`, `--form-filters`, `--form-effect`, and `--form-data-path`. Supplying any of them skips the wizard. To supply a statement you wrote yourself, save it to a file and pass `--source`:

   ```
   agentcore add policy --name BlockViolentReason \
     --engine my_policy_engine \
     --source block_violent_reason.dw \
     --validation-mode IGNORE_ALL_FINDINGS
   ```

   For more information, see [Getting started with guardrails](policy-guardrails-getting-started.md).

1. Run the following AWS CLI command in a terminal to create the policy:

   ```
   aws bedrock-agentcore-control create-policy \
     --policy-engine-id my_policy_engine-a1b2c3d4e5 \
     --name BlockViolentReason \
     --validation-mode IGNORE_ALL_FINDINGS \
     --definition '{
       "policy": {
         "statement": "forbid (principal, action == AgentCore::Action::\"RefundTool___process_refund\", resource == AgentCore::Gateway::\"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/my-gateway-a1b2c3d4e5\") when guardrails { BedrockGuardrails::ContentFilter([\"VIOLENCE\"], [context.input.reason])[\"VIOLENCE\"].confidenceScore.greaterThan(decimal(\"0.4\")) };"
       }
     }'
   ```

1. Run the following Python code to create the policy using the AWS SDK for Python:

   ```
   import boto3
   
   client = boto3.client("bedrock-agentcore-control")
   
   GATEWAY_ARN = "arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/my-gateway-a1b2c3d4e5"
   
   statement = (
       'forbid (principal, '
       'action == AgentCore::Action::"RefundTool___process_refund", '
       f'resource == AgentCore::Gateway::"{GATEWAY_ARN}") '
       'when guardrails { '
       'BedrockGuardrails::ContentFilter(["VIOLENCE"], [context.input.reason])["VIOLENCE"]'
       '.confidenceScore.greaterThan(decimal("0.4")) };'
   )
   
   response = client.create_policy(
       policyEngineId="my_policy_engine-a1b2c3d4e5",
       name="BlockViolentReason",
       validationMode="IGNORE_ALL_FINDINGS",
       definition={"policy": {"statement": statement}},
   )
   # CreatePolicy returns 202 - wait for the terminal status
   client.get_waiter("policy_active").wait(
       policyEngineId="my_policy_engine-a1b2c3d4e5",
       policyId=response["policyId"],
   )
   print(response["policyId"])
   ```

Whichever surface you use, prefer expressing the rule as a `permit` with the inverse comparison. Policy evaluation is deny-by-default, so a single `permit` that holds only while the score stays low both grants the action and gates it:

```
permit (principal, action == AgentCore::Action::"RefundTool___process_refund", resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/my-gateway-a1b2c3d4e5")
when guardrails {
  BedrockGuardrails::ContentFilter(["VIOLENCE"], [context.input.reason])["VIOLENCE"]
    .confidenceScore.lessThanOrEqual(decimal("0.4"))
};
```

Use `forbid` when you want to constrain a permission that already exists — an action that some other policy permits, say on its input values. A `forbid` overrides any `permit`, so it subtracts from that existing grant. On its own it grants nothing: the action stays denied by default and the guardrail is never consulted, so a lone `forbid` needs a companion `permit` for the same action.

**Important**  
Policy validation analyzes the whole policy set in your engine, and it cannot interpret a guardrail condition. A `forbid` whose only gate is a guardrail therefore looks unconditional to it, so if nothing else in the engine permits that principal, action, and resource, the set is reported as **Overly Restrictive**: `Overly Restrictive: Policy Engine will deny every request for the specified principal (…​), action (…​) and resource (…​) combination if the policy is added or updated`. Under the default `--validation-mode FAIL_ON_ANY_FINDINGS` the policy is refused. Pass `--validation-mode IGNORE_ALL_FINDINGS` to create it anyway.  
Because the finding is a property of the policy set rather than of any one statement, whether you see it depends on what the engine already holds.  
The refusal is asynchronous. The call returns 202 with `CREATING`, and the policy then settles into `CREATE_FAILED` with the reason in `statusReasons`, so poll for the terminal status rather than treating the 202 as success.

For an end-to-end walkthrough using the AgentCore CLI instead, see [Getting started with guardrails](policy-guardrails-getting-started.md). For statements on every target type, see [Guardrail policy examples](example-policies-guardrails.md).

### Specifying a guardrail type
<a name="specifying-a-guardrail-safeguard"></a>

To choose a specific guardrail type, use the BedrockGuardrails namespace:


| Guardrail type | Guardrail function name | 
| --- | --- | 
| Content Filter |  `BedrockGuardrails::ContentFilter`  | 
| Prompt Attack |  `BedrockGuardrails::PromptAttack`  | 
| Sensitive Information |  `BedrockGuardrails::SensitiveInformation`  | 

### Selecting a guardrail category
<a name="selecting-a-safeguard-category"></a>

Select a category for the chosen guardrail type (see [Supported guardrails](#supported-guardrails)).

For example: `BedrockGuardrails::ContentFilter(["HATE"],[context.output.message])` 

### Effects for guardrails
<a name="effects-for-guardrails"></a>

To gate an authorization request on a guardrail, use the `permit` and `forbid` effects. These continue to govern request authorization.

```
forbid (principal, action == AgentCore::Action::"<TargetName>___POST:/invocations", resource == AgentCore::Gateway::"<gateway-arn>") when guardrails {
  BedrockGuardrails::PromptAttack(["PROMPT_INJECTION"], [context.input.prompt])["PROMPT_INJECTION"].confidenceScore.greaterThan(decimal("0.6"))
};
```

To suppress outputs from tools, agents, or models, use the `suppressOutput` effect. `suppressOutput` operates on the data an action returns. After an authorized action is completed, it evaluates the outputs against the guardrail and suppresses the output when the guardrail is violated.

```
suppressOutput (principal, action == AgentCore::Action::"<TargetName>___POST:/invocations", resource == AgentCore::Gateway::"<gateway-arn>") when guardrails {
  BedrockGuardrails::SensitiveInformation(["US_SOCIAL_SECURITY_NUMBER"], [context.output.text])
    .count() > 0
};
```

**Important**  
Two rules constrain which side of the request a guardrail may read, and both are enforced when you create the policy.  
An authorization effect — `permit` or `forbid` — may read only `context.input.*` paths. The `suppressOutput` effect may read only `context.output.*` paths. Using `context.output` with `permit` or `forbid` is rejected with `Guardrail '<name>' references 'context.output' but the policy has an authorization effect`.
A single guardrail call cannot mix `context.input.*` and `context.output.*` paths; every path in one call must be on the same side. To screen both a request and its response, write **two guardrail calls** in the same `suppressOutput` policy — one on each side. The restriction is per call, not per policy.
Because a policy names a specific action, it must also name a specific gateway ARN with `resource ==`. Leaving the resource unconstrained is rejected. For more information, see [Resource specificity requirements](policy-scope.md#policy-resource-specificity).

### Passing context to your guardrail
<a name="passing-context-to-your-guardrail"></a>

In a guardrail condition, specify data paths, such as `context.input.message`, that identify the values to extract from the action’s payload. The guardrail evaluates the extracted values. You can specify one or more paths based on your request or response schema.

For example: `[context.input.message, context.input.systemPrompt]` 

You can provide a data path in one of two ways:

 **A field path** — `context.input.<field>` or `context.output.<field>`   
Use this when the value you want is a single string, such as a tool argument or a scalar field of a request body. A field path must resolve to a string; pointing one at an object or a list is rejected when you create the policy.

 **A JSONPath** — a string literal beginning with `$`   
Use this when the text is **inside** a list or an object, which a field path cannot reach — a conversation, or a list of content blocks. Write it rooted at the payload, with no `context.input.` prefix: for example `"$.messages[*].content"`. A JSONPath is evaluated as a query, so a wildcard can match many values, including values nested at different depths. Those matches are flattened into a single sequence of text rather than preserved as a list.

You can give each call several data paths. Each path is extracted independently and sent to the guardrail as its own content block, so to have a list evaluated as distinct items, name the items with separate paths rather than one wildcard path.

**Important**  
A JSONPath carries no direction marker, so the policy’s effect determines its direction: `suppressOutput` reads the response, and any other effect reads the request. An output guardrail using a JSONPath must therefore be a `suppressOutput`, while an input one can be either a `forbid` or a `permit` — both read the request. Do not mix a JSONPath and a bare `context.input.*` field in the same call under `suppressOutput` — the two imply opposite directions and the request is rejected as a side conflict.  
All matches of a single JSONPath are concatenated into one string, with no separating character between them. This is deliberate: a pattern split across two content blocks, such as the social security number `123-` followed by `45-6789`, stays contiguous and cannot slip past a detector that looks for the whole pattern. It also means text from adjacent matches runs together, so a path that sweeps up unrelated fields can produce a value no single field contained.  
A path that matches nothing contributes nothing, as long as at least one other configured path does resolve. This lets you name several candidate shapes in one call, for payloads whose structure varies, and have whichever one exists be the path that is used.

**Warning**  
 **A JSONPath is not validated when you create the policy.** Unlike a field path, AgentCore checks neither its syntax nor its fit to your schema. A malformed path, or one naming a field your payload never sends, still reaches `ACTIVE`. What happens at evaluation time depends on whether anything else resolves.  
 **If no configured data path resolves anywhere in scope,** evaluation **fails closed**. No guardrail can run, so the request is denied with `Authorization denied: request missing field(s) required for guardrail evaluation`, naming the paths it could not resolve. Traffic that was working stops. Check the JSONPath first when you encounter this error.  
 **If at least one configured path does resolve,** the guardrails that have content run and decide normally, and only the check whose path did not resolve is skipped. That check contributes nothing and raises no finding, so a single mistyped path among several working ones fails silently rather than loudly.  
Test each JSONPath guardrail against content it should catch, and take paths from [Reaching text inside arrays with a JSONPath](example-policies-guardrails.md#example-policies-guardrails-jsonpath) rather than adapting them from another API.

For examples on each inference API path, see [Reaching text inside arrays with a JSONPath](example-policies-guardrails.md#example-policies-guardrails-jsonpath).

### Thresholds for guardrails
<a name="thresholds-for-guardrails"></a>

With content filters and prompt attack detection, the guardrail returns a confidence score, which is a numeric value in the range [0, 1], where 0 is low confidence and 1 is high confidence. The score represents how confidently the guardrail detected a violation. Current possible scores are the discrete values {0.0, 0.2, 0.4, 0.6, 0.8, 1.0}.

To set a threshold, provide the decimal value to the comparison operator, such as `greaterThan(decimal("0.4"))`.

 **Score comparison operators** 

You can apply the following comparison operators to `confidenceScore`, `maxConfidenceScore()`, or `minConfidenceScore()`:


| Operator | Usage | 
| --- | --- | 
|  `.greaterThan(decimal("X.X"))`  | Score > threshold | 
|  `.greaterThanOrEqual(decimal("X.X"))`  | Score ≥ threshold | 
|  `.lessThan(decimal("X.X"))`  | Score < threshold | 
|  `.lessThanOrEqual(decimal("X.X"))`  | Score ≤ threshold | 

You can use an aggregation in your policy to extract and compare scores returned by guardrails:

<a name="guardrail-aggregations"></a> **Aggregations** 


| Aggregation | Description | Example | 
| --- | --- | --- | 
|  `[<category>].confidenceScore`  | Access the confidence score for a specific category ([decimal](https://docs.cedarpolicy.com/policies/syntax-datatypes.html#datatype-decimal)). Not available for `SensitiveInformation`. |  `["HATE"].confidenceScore`  | 
|  `maxConfidenceScore()`  | Maximum confidence across all scanned categories ([decimal](https://docs.cedarpolicy.com/policies/syntax-datatypes.html#datatype-decimal)) |  `.maxConfidenceScore()`  | 
|  `minConfidenceScore()`  | Minimum confidence across all scanned categories ([decimal](https://docs.cedarpolicy.com/policies/syntax-datatypes.html#datatype-decimal)) |  `.minConfidenceScore()`  | 
|  `count()`  | Number of findings detected ([Long](https://docs.cedarpolicy.com/policies/syntax-datatypes.html#datatype-long)). Compare it with an integer operator, not a `decimal` method. |  `.count() > 0`  | 
|  `categories()`  | The set of categories the guardrail detected ([Set](https://docs.cedarpolicy.com/policies/syntax-datatypes.html#datatype-set) of [String](https://docs.cedarpolicy.com/policies/syntax-datatypes.html#datatype-string)) |  `.categories().contains("HATE")`  | 

**Important**  
 `SensitiveInformation` requires one of the aggregation methods and does not support per-category indexing. A statement such as `BedrockGuardrails::SensitiveInformation(["EMAIL"], [context.input.text])["EMAIL"].confidenceScore` is rejected when you create the policy, with `Per-category indexing is not supported for SensitiveInformation`. Use `count()`, `categories()`, `maxConfidenceScore()`, or `minConfidenceScore()` instead. `ContentFilter` and `PromptAttack` support both forms.

#### How to choose a threshold
<a name="how-to-choose-a-threshold"></a>

If you do not specify a threshold when prompting the authoring service, AgentCore sets a default value. If you write your policies without the help of the authoring service, you must provide the threshold value.

The following defaults are calibrated to provide broad coverage with acceptable precision for most workloads:


| Guardrail type | Default threshold | 
| --- | --- | 
| Content Filter | 0.2 | 
| Prompt Attack Detection | 0.4 | 
| Sensitive Information | 0.2 | 

##### Choosing a custom threshold
<a name="_choosing_a_custom_threshold"></a>

If the default thresholds do not meet your requirements, you can determine the optimal threshold for your workload using one of the following approaches.

 **Option 1: Evaluate against a golden test set** 

Use this approach when you have a curated set of test inputs with clear expected outcomes.

1. Create your policies and set your policy engine mode to LOG\_ONLY.

1. Run your test set through the gateway your policy engine is attached to.

1. Review the logs for each evaluation. Each log entry includes the content evaluated and the confidence score returned by the guardrail.

1. For each result, label whether the guardrail should have flagged the content or done nothing (true and false respectively).

1. Using these labels, combined with the confidence scores available in your logs, build a confusion matrix at multiple threshold values. Compare precision and recall at each threshold to select the value that aligns with your tolerance for false positives versus missed detections.

 **Option 2: Evaluate against production traffic** 

Use this approach when you do not have a pre-built test set and want to calibrate using real traffic patterns.

1. Create your policies and set your policy engine mode to LOG\_ONLY.

1. Allow the policy engine to evaluate production traffic. Each log entry includes the content evaluated and the confidence score returned by the guardrail.

1. Use an LLM-as-a-judge to label each logged result as true (the guardrail should have flagged the content) or false (the guardrail should not have flagged the content).

1. Using these labels, build a confusion matrix at multiple threshold values. Compare precision and recall at each threshold to select the value that aligns with your tolerance for false positives versus missed detections.

### Testing guardrails in a policy
<a name="_testing_guardrails_in_a_policy"></a>

AgentCore provides multiple mechanisms for testing guardrails before enforcing them on production traffic. You can control enforcement at the policy engine level, at the individual policy level, or both, allowing you to validate guardrail behavior incrementally. For more information, see [Test a policy in LOG\_ONLY mode](policy-test-a-policy.md).

## How guardrails work in a policy
<a name="how-guardrails-works-with-policy"></a>

You can put a guardrail in a policy on any gateway target. Guardrails run on:
+  **MCP targets** — action `<TargetName>___<ToolName>`, reached through `POST /mcp` (JSON-RPC `tools/call`)
+  **AgentCore Runtime targets** — action `<TargetName>___POST:/invocations` 
+  **Inference targets** — one target per API shape, so one action per API:
  +  `<TargetName>___POST:/v1/chat/completions` 
  +  `<TargetName>___POST:/v1/responses` 
  +  `<TargetName>___POST:/v1/messages` 
  +  `<TargetName>___GET:/v1/models` 
+  **HTTP proxy targets** — action `<TargetName>___<METHOD>:<uri>` 

When a call arrives at your gateway, the Policy Evaluator performs the following:

1.  **Matches scope** — Identifies which policies with guardrails apply to this request

1.  **Extracts content** — Pulls the field specified by `dataPath` (e.g., `context.input.message`) from the request body

1.  **Calls Bedrock InvokeGuardrailChecks API** — Evaluates the content and injects the returned confidence scores into the policy evaluation context

1.  **Evaluates the policy using guardrail scores** — Compares the returned confidence scores against the threshold defined in the policy

1.  **Returns a decision** — `ALLOW` or `DENY` with policy annotations back to the gateway

Note: Guardrails are non-deterministic, so the same input can result in different outputs. Policies are deterministic; the same evaluation context will always result in the same policy decision.

## Limitations
<a name="guardrails-in-policy-limitations"></a>
+  **No support for regex or pattern matching** — guardrails use ML scoring, not regular expressions
+  **A guardrail is required in a `when guardrails {…​}` block** — guardrails blocks must have at least one guardrail defined within
+  **A guardrail call cannot read both sides of a request** — all data paths in one call must be either `context.input.*` or `context.output.*`. A `suppressOutput` policy can read both sides, but not from the same call
+  **Guardrails are non-deterministic** — the same content can score differently on separate calls, so a request near your threshold may be allowed once and denied the next time
+  ** `suppressOutput` requires a guardrail condition** — its condition must consist solely of guardrail checks. It does not support standard Cedar or `temporal {…​}` conditions
+  **A `$`-JSONPath data path is not validated at creation** — neither its syntax nor its fit to your schema is checked. If it is the only path and it resolves to nothing, the request is denied rather than screened, and the denial names the unresolved path. If another path does resolve, the unresolved check is skipped silently. See [Passing context to your guardrail](#passing-context-to-your-guardrail) 

**Note**  
Under an **authorization** effect — `permit` or `forbid` — you **can** combine a guardrail with ordinary Cedar conditions in one policy. `when guardrails { E }` is equivalent to a plain `when { E }` whose body calls a guardrail; the `guardrails` tag documents intent rather than restricting the policy. Put the guardrail call in `when` and the request or principal conditions in `unless`. A single policy can carry a guardrail call, a Cedar condition, and a temporal condition this way — see [Combine a guardrail with request conditions](example-policies-guardrails.md#example-policies-guardrails-combined) and [Combine temporal, guardrail, and request conditions](example-policies-temporal.md#example-policies-temporal-mixed).  
 `suppressOutput` is the exception: its condition must consist solely of guardrail checks. For more information, see [Writing guardrails in policies](#defining-guardrails-in-policies).