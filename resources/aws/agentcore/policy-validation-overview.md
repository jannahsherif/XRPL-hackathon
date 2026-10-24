

# Validation and analysis overview
<a name="policy-validation-overview"></a>

## Schema checks
<a name="policy-schema-checks"></a>

Schema checks verify that policies comply with the Cedar schema for your gateways:
+  **Schema compliance** — Checks that policies reference valid actions (tools), use correct data types, and access only defined context fields
+  **Type safety** — Ensures parameter types match the gateway’s tool definitions

## Semantic validation (automated reasoning)
<a name="policy-semantic-validation"></a>

Semantic validation uses automated reasoning to detect potential security and logic issues:
+  **Overly permissive policies** — If created, the policy engine will allow all requests for the specified principal, action, and resource combination
+  **Overly restrictive policies** — If created, the policy engine will deny all requests for the specified principal, action, and resource combination
+  **Ineffective policies** — If created, the policy has no impact: a Permit policy does not allow any requests, or a Forbid policy does not deny any requests. This applies at the policy level during generation, not at the policy engine level

## Validation modes
<a name="policy-validation-modes"></a>

The `validationMode` parameter controls whether semantic validation runs during policy creation and updates. It does **not** affect schema checks, which always run.
+  `FAIL_ON_ANY_FINDINGS` (default) — Both schema checks and semantic validation run. If either produces findings, the policy is rejected.
+  `IGNORE_ALL_FINDINGS` — Only schema checks run. Policies are accepted as long as they pass the schema checks. This is not recommended for production because semantic validation catches security and logic issues that schema checks alone cannot detect.