

# AgentCore Gateway and Policy in AgentCore IAM Permissions
<a name="policy-permissions"></a>

This guide provides the required IAM permissions for using Amazon Bedrock AgentCore Gateway with Policy in AgentCore for fine-grained authorization control using Cedar policies.

## Overview
<a name="policy-permissions-overview"></a>

When integrating Amazon Bedrock AgentCore Gateway with Policy in AgentCore, two distinct IAM roles are required:

1.  **Gateway Execution Role** - The IAM role that Amazon Bedrock AgentCore Gateway assumes at runtime to invoke targets and evaluate Cedar policies

1.  **Resource Management Role** - The IAM role that administrators use to create and manage Amazon Bedrock AgentCore Gateway and Policy in AgentCore resources

Both roles serve different purposes and require specific permissions. The Gateway Execution Role needs permissions to run Amazon Bedrock AgentCore Gateway operations, while the Resource Management Role needs permissions to configure and manage Amazon Bedrock AgentCore Gateway and Policy in AgentCore resources.

## Gateway Execution Role
<a name="policy-permissions-execution-role"></a>

The Gateway Execution Role is assumed by the Amazon Bedrock AgentCore Gateway service when processing requests. This role requires permissions to:
+ Evaluate Cedar policies through Policy in AgentCore
+ Invoke targets such as Lambda functions and API Gateway endpoints
+ Write logs and traces to CloudWatch and X-Ray
+ Access secrets for authentication configurations

**Important**  
The execution role must include these three permissions to use Amazon Bedrock AgentCore Gateway with Policy in AgentCore: . `bedrock-agentcore:AuthorizeAction` - Evaluates Cedar policies for authorization decisions . `bedrock-agentcore:PartiallyAuthorizeActions` - Lists tools the caller is authorized to invoke . `bedrock-agentcore:GetPolicyEngine` - Retrieves the policy engine configuration Without these permissions, the Gateway cannot perform policy authorization. This manifests in two ways: attaching a Policy Engine to an existing Gateway will result in an InternalServerException, and all tool invocations will be denied by default even if you have permit policies configured.

### Trust Policy
<a name="policy-permissions-execution-trust"></a>

The Gateway Execution Role must trust the `bedrock-agentcore.amazonaws.com` service principal.

**Important**  
Replace the following placeholders:  
 {{us-east-1}} with the AWS Region
 {{123456789012}} with the AWS account ID

```
{
"Version": "2012-10-17",		 	 	 
  "Statement": [
    {
      "Sid": "AllowBedrockAgentCoreAssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "bedrock-agentcore.amazonaws.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "aws:SourceAccount": "123456789012"
        },
        "ArnLike": {
          "aws:SourceArn": "arn:aws:bedrock-agentcore:us-east-1:123456789012:*"
        }
      }
    }
  ]
}
```

### Permission Policy
<a name="policy-permissions-execution-permissions"></a>

This policy grants the Amazon Bedrock AgentCore Gateway the necessary permissions to evaluate Cedar policies through Policy in AgentCore. The permissions are split into two statements following least-privilege principles.

**Important**  
Replace these placeholders:  
 {{us-east-1}} with the AWS Region
 {{123456789012}} with the AWS account ID
 {{<gateway-id>}} with the Gateway ID, or \* for all gateways
 {{<policy-engine-id>}} with the policy engine ID, or \* for all policy engines

```
{
"Version": "2012-10-17",		 	 	 
  "Statement": [
    {
      "Sid": "PolicyEngineConfiguration",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:GetPolicyEngine"
      ],
      "Resource": [
        "arn:aws:bedrock-agentcore:us-east-1:123456789012:policy-engine/<policy-engine-id>"
      ]
    },
    {
      "Sid": "PolicyEngineAuthorization",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:AuthorizeAction",
        "bedrock-agentcore:PartiallyAuthorizeActions"
      ],
      "Resource": [
        "arn:aws:bedrock-agentcore:us-east-1:123456789012:policy-engine/<policy-engine-id>",
        "arn:aws:bedrock-agentcore:us-east-1:123456789012:gateway/<gateway-id>"
      ]
    }
  ]
}
```

**Note**  
A gateway target needs its own permissions on top of these, and they differ by target type. For the permissions each type requires, see [Permissions to access AWS resources](gateway-prerequisites-permissions.md#gateway-service-role-permissions-resources).
In production, replace the placeholders with specific resource IDs, such as `policy-engine/my_policy_engine-a1b2c3d4e5` in place of `policy-engine/<policy-engine-id>`, to follow least-privilege principles. Use a wildcard ( \* ) only where you intend to allow every resource of that type.

### IAM permissions for temporal policies
<a name="policy-permissions-session-temporal"></a>

Temporal policies require the Gateway to propagate the caller’s session identity across the request by minting a Workload Access Token (WAT). On the AWS IAM inbound flow, this mint calls `GetWorkloadAccessToken`. Grant the Gateway Execution Role `bedrock-agentcore:GetWorkloadAccessToken`, scoped to the Gateway’s workload-identity directory. Add this permission in addition to the three Policy permissions (`AuthorizeAction`, `PartiallyAuthorizeActions`, `GetPolicyEngine`) already documented on this page. This permission is only required when temporal policy is active (a policy session ID is supplied and a Policy Engine is attached); it is not needed when temporal policy is disabled.

Add the following statement to the Gateway Execution Role permission policy:

```
{
  "Sid": "PolicySessionWorkloadIdentity",
  "Effect": "Allow",
  "Action": [
    "bedrock-agentcore:GetWorkloadAccessToken"
  ],
  "Resource": [
    "arn:aws:bedrock-agentcore:us-east-1:123456789012:workload-identity-directory/default",
    "arn:aws:bedrock-agentcore:us-east-1:123456789012:workload-identity-directory/default/workload-identity/<gatewayId>*"
  ]
}
```

Without this permission, tool invocations fail at the token-mint step (`AccessDenied` on `GetWorkloadAccessToken`) once temporal policy is enabled. For production, replace `<gatewayId>` with the specific Gateway ID to follow least-privilege principles.

For an overview of this requirement in the context of temporal policy considerations, see [Required IAM permissions](policy-temporal.md#policy-temporal-iam-permissions).

## Resource Management Role
<a name="policy-permissions-management-role"></a>

The Resource Management Role is used by administrators to create and manage Amazon Bedrock AgentCore Gateway and Policy in AgentCore resources. This role requires permissions to:

**Important**  
Grant the four summary actions in addition to the list and get actions: `ListPolicyEngineSummaries`, `GetPolicyEngineSummary`, `ListPolicySummaries`, and `GetPolicySummary`. These actions let you enumerate policy engines and policies while a customer managed key is unusable. Granting them in advance is what makes that recovery possible. For more information, see [Key unavailable: you cannot list or read your policies](policy-encryption.md#policy-encryption-error-key-unavailable).

For the managed policy that grants full access to AgentCore, see [AWS managed policies for Amazon Bedrock AgentCore](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/security-iam-awsmanpol.html). For the AWS KMS permissions an encrypted policy engine additionally requires, see [Customize your policy engine’s encryption](policy-encryption.md).
+ Create, update, and delete Gateways and Gateway targets
+ Create, update, and delete Policy Engines and Cedar policies
+ Call the Gateway during policy creation (`InvokeGateway`) so Policy in AgentCore can validate the actions in a Cedar statement against the target Gateway’s capabilities
+ Pass the Gateway Execution Role to Amazon Bedrock AgentCore Gateway resources during creation
+ Tag resources for organization and management
+ Read IAM role information to validate execution role configurations

This role is separate from the Gateway Execution Role and is only needed when setting up or modifying Amazon Bedrock AgentCore Gateway and Policy in AgentCore configurations.

### Permission Policy
<a name="policy-permissions-management-permissions"></a>

**Important**  
Replace these placeholders:  
 {{us-east-1}} with the AWS Region
 {{123456789012}} with the AWS account ID

```
{
"Version": "2012-10-17",		 	 	 
  "Statement": [
    {
      "Sid": "GatewayManagement",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:CreateGateway",
        "bedrock-agentcore:UpdateGateway",
        "bedrock-agentcore:GetGateway",
        "bedrock-agentcore:DeleteGateway",
        "bedrock-agentcore:ListGateways",
        "bedrock-agentcore:InvokeGateway",
        "bedrock-agentcore:CreateGatewayTarget",
        "bedrock-agentcore:UpdateGatewayTarget",
        "bedrock-agentcore:GetGatewayTarget",
        "bedrock-agentcore:DeleteGatewayTarget",
        "bedrock-agentcore:ListGatewayTargets"
      ],
      "Resource": [
        "arn:aws:bedrock-agentcore:us-east-1:123456789012:gateway/*"
      ]
    },
    {
      "Sid": "PolicyEngineManagement",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:CreatePolicyEngine",
        "bedrock-agentcore:UpdatePolicyEngine",
        "bedrock-agentcore:GetPolicyEngine",
        "bedrock-agentcore:DeletePolicyEngine",
        "bedrock-agentcore:ListPolicyEngines",
        "bedrock-agentcore:ListPolicyEngineSummaries",
        "bedrock-agentcore:GetPolicyEngineSummary"
      ],
      "Resource": [
        "arn:aws:bedrock-agentcore:us-east-1:123456789012:policy-engine/*"
      ]
    },
    {
      "Sid": "PolicyManagement",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:CreatePolicy",
        "bedrock-agentcore:UpdatePolicy",
        "bedrock-agentcore:GetPolicy",
        "bedrock-agentcore:DeletePolicy",
        "bedrock-agentcore:ListPolicies",
        "bedrock-agentcore:ListPolicySummaries",
        "bedrock-agentcore:GetPolicySummary"
      ],
      "Resource": [
        "arn:aws:bedrock-agentcore:us-east-1:123456789012:policy-engine/*/policy/*"
      ]
    },
    {
      "Sid": "PolicyGeneration",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:StartPolicyGeneration",
        "bedrock-agentcore:GetPolicyGeneration",
        "bedrock-agentcore:ListPolicyGenerations",
        "bedrock-agentcore:ListPolicyGenerationAssets"
      ],
      "Resource": [
        "arn:aws:bedrock-agentcore:us-east-1:123456789012:policy-engine/*/policy-generation/*"
      ]
    },
    {
      "Sid": "IAMPassRole",
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::123456789012:role/*BedrockAgentCore*"
      ],
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": "bedrock-agentcore.amazonaws.com"
        }
      }
    },
    {
      "Sid": "IAMReadAccess",
      "Effect": "Allow",
      "Action": [
        "iam:GetRole",
        "iam:GetRolePolicy",
        "iam:ListAttachedRolePolicies",
        "iam:ListRolePolicies"
      ],
      "Resource": [
        "arn:aws:iam::123456789012:role/*"
      ]
    },
    {
      "Sid": "PolicyScopeManagement",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:ManageResourceScopedPolicy",
        "bedrock-agentcore:ManageAdminPolicy"
      ],
      "Resource": [
        "arn:aws:bedrock-agentcore:us-east-1:123456789012:gateway/*"
      ]
    }
  ]
}
```

**Important**  
 `bedrock-agentcore:InvokeGateway` is required to create or update Cedar policies, not just to invoke the Gateway at runtime. `CreatePolicy` and `UpdatePolicy` validate the actions in your Cedar statement against the Gateway, an operation authorized as `InvokeGateway` on the Gateway ARN. Without it, the policy transitions to `CREATE_FAILED` with `Insufficient permissions to call gateway with ID <gateway-id>`.

**Important**  
The `ManageResourceScopedPolicy` and `ManageAdminPolicy` actions are permission-only gates that control what types of Cedar policies administrators can create: \* `ManageResourceScopedPolicy` - Grants permission to create Cedar policies that target specific gateway ARNs (e.g., policies applying to `gateway/my-gateway-123` ) \* `ManageAdminPolicy` - Grants permission to create Cedar policies with wildcards (e.g., policies applying to gateway/\* ) Both permissions are required for full policy management capability. These are not API operations but rather authorization checks that determine the scope of Cedar policies that can be created through the Policy Management APIs.

**Note**  
While the Resource field is included for consistency, these permission-only actions primarily gate capability at the action level rather than at the resource level.

## When Are Role Updates Required?
<a name="policy-permissions-when-required"></a>

Determine whether Policy in AgentCore permissions need to be added to the Amazon Bedrock AgentCore Gateway execution role based on how the Amazon Bedrock AgentCore Gateway was created.

 **Scenario 1: Gateway Created with AgentCore CLI**   
 **Status:** No action required  
When you attach a policy engine from your project with `agentcore add gateway --policy-engine-name`, the gateway execution role that the AgentCore CLI creates includes the `AuthorizeAction`, `PartiallyAuthorizeActions`, and `GetPolicyEngine` permissions. If you supply your own role with `--role-arn`, follow Scenario 2.

 **Scenario 2: Custom Execution Role**   
 **Status:** Action required  
Custom IAM roles require the Policy in AgentCore permissions documented in this guide to be added manually. Follow the permission policies in the sections above.

 **Scenario 3: Production Least-Privilege Configuration**   
 **Status:** Action required  
For production environments, scope the Policy in AgentCore permissions to specific resource ARNs rather than using wildcards. Replace policy-engine/\* and gateway/\* with the specific policy engine and gateway IDs in your permission policies.

## Troubleshooting
<a name="policy-permissions-troubleshooting"></a>

This section covers common issues when configuring IAM permissions for Amazon Bedrock AgentCore Gateway with Policy in AgentCore.

### InternalServerException During Policy Evaluation
<a name="policy-permissions-error-403"></a>

 **Symptom:** Gateway returns `InternalServerException - Policy evaluation failed` when attaching a Policy Engine to an existing Gateway, and all tool invocations are denied by default even with permit policies configured.

 **Root Cause:** The Gateway Execution Role is missing the required Policy in AgentCore permissions. Without these permissions, the Gateway cannot perform policy authorization.

 **Solution:** Ensure the Gateway Execution Role includes these three permissions:

```
{
  "Effect": "Allow",
  "Action": [
    "bedrock-agentcore:PartiallyAuthorizeActions",
    "bedrock-agentcore:AuthorizeAction",
    "bedrock-agentcore:GetPolicyEngine"
  ],
  "Resource": [
    "arn:aws:bedrock-agentcore:REGION:ACCOUNT:policy-engine/*",
    "arn:aws:bedrock-agentcore:REGION:ACCOUNT:gateway/*"
  ]
}
```

**Note**  
If you attach a Policy Engine to an existing Gateway using the Policy Engine console, the IAM permissions may not be automatically updated. You must manually add these permissions to the Gateway’s Service-Linked Role.

### "Insufficient permissions to call gateway" on CreatePolicy
<a name="policy-permissions-error-create-policy-invoke"></a>

 **Symptom:** `CreatePolicy` returns a `policyId`, but the policy then transitions to `CREATE_FAILED` with `Insufficient permissions to call gateway with ID <gateway-id>` — even when the Gateway Execution Role has `AuthorizeAction`, `PartiallyAuthorizeActions`, and `GetPolicyEngine`.

 **Root Cause:** The gap is on the Resource Management Role that calls `CreatePolicy`, not the Gateway Execution Role. Policy validation calls the Gateway (authorized as `bedrock-agentcore:InvokeGateway`); the error names the Gateway but the fix is on the policy-creation role.

 **Solution:** Add `bedrock-agentcore:InvokeGateway` (scoped to the Gateway ARN) to the Resource Management Role:

```
{
  "Effect": "Allow",
  "Action": [
    "bedrock-agentcore:InvokeGateway"
  ],
  "Resource": [
    "arn:aws:bedrock-agentcore:us-east-1:123456789012:gateway/<gateway-id>"
  ]
}
```

### Silent Failures in LOG\_ONLY Mode
<a name="policy-permissions-error-silent"></a>

 **Symptom:** Policy engine appears to work in LOG\_ONLY mode but fails silently without proper error messages.

 **Root Cause:** Missing `bedrock-agentcore:GetPolicyEngine` permission causes silent failures that only surface when switching to ENFORCED mode.

 **Solution:** Always include `bedrock-agentcore:GetPolicyEngine` in the Gateway Execution Role, even when using LOG\_ONLY mode for testing.

### Policy Engine Not Found Error
<a name="policy-permissions-error-not-found"></a>

 **Symptom:** Amazon Bedrock AgentCore Gateway returns errors indicating it cannot find or access the policy engine.

 **Root Cause:** The Gateway Execution Role’s policy uses incorrect ARN patterns or is missing the policy-engine resource.

 **Solution:** Ensure both the policy-engine AND gateway ARNs are included in the Resource array:

```
"Resource": [
  "arn:aws:bedrock-agentcore:us-east-1:123456789012:policy-engine/<policy-engine-id>",
  "arn:aws:bedrock-agentcore:us-east-1:123456789012:gateway/<gateway-id>"
]
```

**Note**  
Both `AuthorizeAction` and `PartiallyAuthorizeActions` require access to BOTH the policy-engine and gateway resources.

### Debugging Tips
<a name="policy-permissions-debugging-tips"></a>

1.  **Enable CloudWatch Logs** - Configure detailed logging for the Amazon Bedrock AgentCore Gateway to capture policy evaluation details

1.  **Review X-Ray Traces** - Check AWS X-Ray traces to identify where authorization checks are failing

1.  **Start with LOG\_ONLY Mode** - Use LOG\_ONLY mode initially to test Cedar policies without blocking requests

1.  **Verify All Four Permissions** - Ensure `AuthorizeAction` , `PartiallyAuthorizeActions` , AND `GetPolicyEngine` are all present

1.  **Switch to ENFORCED Mode** - Only after verifying all permissions work in LOG\_ONLY mode, switch to ENFORCED mode

## Example: Creating Both IAM Roles
<a name="policy-permissions-example"></a>

The following example demonstrates how to create both required IAM roles using the AWS CLI.

### Step 1: Create Gateway Execution Role
<a name="policy-permissions-example-execution"></a>

```
# Create the trust policy file
cat > gateway-trust-policy.json <<EOF
{
"Version": "2012-10-17",		 	 	 
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "bedrock-agentcore.amazonaws.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "aws:SourceAccount": "123456789012"
        },
        "ArnLike": {
          "aws:SourceArn": "arn:aws:bedrock-agentcore:us-east-1:123456789012:*"
        }
      }
    }
  ]
}
EOF

# Create the IAM role
aws iam create-role \
  --role-name MyGatewayExecutionRole \
  --assume-role-policy-document file://gateway-trust-policy.json
```

### Step 2: Attach Permissions to Gateway Execution Role
<a name="policy-permissions-example-attach"></a>

```
# Create the permission policy file
cat > gateway-permissions.json <<EOF
{
"Version": "2012-10-17",		 	 	 
  "Statement": [
    {
      "Sid": "PolicyEngineConfiguration",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:GetPolicyEngine"
      ],
      "Resource": [
        "arn:aws:bedrock-agentcore:us-east-1:123456789012:policy-engine/*"
      ]
    },
    {
      "Sid": "PolicyEngineAuthorization",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:AuthorizeAction",
        "bedrock-agentcore:PartiallyAuthorizeActions"
      ],
      "Resource": [
        "arn:aws:bedrock-agentcore:us-east-1:123456789012:policy-engine/*",
        "arn:aws:bedrock-agentcore:us-east-1:123456789012:gateway/*"
      ]
    }
  ]
}
EOF

# Attach the policy to the role
aws iam put-role-policy \
  --role-name MyGatewayExecutionRole \
  --policy-name GatewayPolicyEnginePermissions \
  --policy-document file://gateway-permissions.json
```

**Note**  
This example shows only the Policy in AgentCore permissions. Additional permissions for Amazon Bedrock AgentCore Gateway targets (Lambda, API Gateway, etc.) should be added based on your specific integration requirements.

### Step 3: Next Steps
<a name="policy-permissions-example-next"></a>

After configuring the execution role with the required Policy in AgentCore permissions, proceed to create and configure Policy resources. For detailed guidance, refer to:
+ Creating a Policy Engine - See the [Create a policy engine](policy-create-engine.md) 
+ Writing Cedar Policies - See the [Cedar Policy Language Reference](https://docs.cedarpolicy.com) 

## Best Practices
<a name="policy-permissions-best-practices"></a>

1.  **Use Separate Roles** - Maintain distinct roles for Amazon Bedrock AgentCore Gateway execution and resource management

1.  **Apply Least Privilege** - Start with specific resource ARNs rather than wildcards in production

1.  **Test with LOG\_ONLY Mode** - Always test policy engine integration in LOG\_ONLY mode before enforcing policies

1.  **Enable Monitoring** - Configure CloudWatch Logs and X-Ray tracing for troubleshooting and observability

1.  **Version Control Policies** - Store Cedar policies in version control alongside infrastructure code

1.  **Use Resource Tags** - Apply tags to organize and manage Amazon Bedrock AgentCore Gateway and Policy in AgentCore resources

1.  **Regular Security Audits** - Periodically review IAM policies to ensure they follow least privilege principles