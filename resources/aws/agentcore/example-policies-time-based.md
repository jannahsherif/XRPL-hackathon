

# Time-based policies
<a name="example-policies-time-based"></a>

The policies in this section decide from **wall-clock time** — a promotional window, business hours, or a combination of the two. They read `context.system.now`, which the service supplies on every request.

Time-based conditions are ordinary Cedar `when` clauses, so they compose with everything else on these pages. A principal check, an input condition, a guardrail, or a temporal condition can all sit in the same policy.

Like the rest of the authoring guide, these examples are written against the reference gateway described in [Resource configuration for examples](example-policies-reference.md), so you can combine them with the other examples on one policy engine.

**Note**  
Time-based is not the same as **temporal**. A time-based condition asks what time it is now; a temporal condition asks what has already happened in this session. For more information, see [Temporal policy examples](example-policies-temporal.md).

## How it works
<a name="example-policies-time-based-how"></a>

During policy evaluation, the current UTC timestamp is provided as part of evaluation context:

```
// Current datetime in UTC
context.system.now
```

You can use Cedar’s datetime functions to create time-based conditions:
+  `datetime("YYYY-MM-DDTHH:MM:SSZ")` — Create a datetime value
+  `duration("Xh")` — Create a duration (hours, minutes, seconds)
+  `.toTime()` — Extract time of day from datetime
+ Comparison operators: `<` , `⇐` , `>` , `>=` , `==` 

## Absolute date and time range restrictions
<a name="example-policies-time-absolute"></a>

Enforce policies within specific calendar periods.

### Example: Open-enrollment window
<a name="example-policies-time-absolute-example"></a>

```
permit (
  principal,
  action == AgentCore::Action::"InsuranceAPI___calculate_premium",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  context.system.now >= datetime("2025-01-01T00:00:00Z") &&
  context.system.now < datetime("2025-02-01T00:00:00Z")
};
```

 **Use case:** Quote premiums only during the January 2025 open-enrollment window.

## Daily recurring time restrictions
<a name="example-policies-time-daily"></a>

Enforce policies based on time of day that recur daily.

### Example: Business hours policy
<a name="example-policies-time-daily-example"></a>

```
permit (
  principal,
  action == AgentCore::Action::"InsuranceAPI___disburse_payment",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  duration("9h") <= context.system.now.toTime() &&
  context.system.now.toTime() <= duration("17h")
};
```

 **Use case:** Disburse payments only during business hours (9 AM–5 PM UTC daily).

## Combined date and time restrictions
<a name="example-policies-time-combined"></a>

Combine absolute dates with daily time restrictions.

### Example: Enrollment window with daily hours
<a name="example-policies-time-combined-example"></a>

```
permit (
  principal,
  action == AgentCore::Action::"InsuranceAPI___update_coverage",
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-west-2:123456789012:gateway/insurance-gw-a1b2c3d4e5"
)
when {
  // Valid dates: February 2025
  context.system.now >= datetime("2025-02-01T00:00:00Z") &&
  context.system.now < datetime("2025-03-01T00:00:00Z") &&
  // Valid hours: 9am-9pm UTC daily
  duration("9h") <= context.system.now.toTime() &&
  context.system.now.toTime() <= duration("21h")
};
```

 **Use case:** Allow coverage changes only during February 2025, between 9 AM and 9 PM UTC daily.

## Timezone handling
<a name="example-policies-time-timezone"></a>

All datetime values must be in UTC. The Policy Engine does not support timezone conversions or timezone-aware policies.

When specifying times in your policies, always use UTC. If your business operates in a different timezone, convert your local times to UTC before creating the policy.