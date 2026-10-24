

# IAM Permissions for AgentCore Runtime
<a name="runtime-permissions"></a>

The following are IAM permissions you need to create an agent in an AgentCore Runtime and the execution role permissions that an agent needs to run in an AgentCore Runtime. You can also use resource-based policies to control access to your runtime resources.

For information about using resource-based policies to control access to your AgentCore Runtime resources, see [Resource-based policies for Amazon Bedrock AgentCore](resource-based-policies.md).

**Topics**
+ [Use Amazon Bedrock AgentCore](#runtime-permissions-use-agentcore)
+ [Use the AgentCore CLI](#runtime-permissions-cli)
+ [User permissions for Amazon Bedrock AgentCore Console](#runtime-permissions-console)
+ [Execution role for running an agent in AgentCore Runtime](#runtime-permissions-execution)

## Use Amazon Bedrock AgentCore
<a name="runtime-permissions-use-agentcore"></a>

To use Amazon Bedrock AgentCore, you can attach the [BedrockAgentCoreFullAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/BedrockAgentCoreFullAccess.html) AWS managed policy to your IAM user or IAM role. This AWS managed policy grants broad permissions including `GetWorkloadAccessTokenForUserId`, which allows issuing workload access tokens using caller-supplied user identifier strings without IdP token verification. We recommend creating a custom policy with only the permissions your application requires by copying the relevant statements and restricting the resources to your specific use case. For production deployments where your application has JWT tokens available, explicitly deny `GetWorkloadAccessTokenForUserId` and grant only `GetWorkloadAccessTokenForJWT`. For more information, see [Get workload access token](get-workload-access-token.md). To use the AgentCore CLI, you need [additional](#runtime-permissions-cli) permissions.

## Use the AgentCore CLI
<a name="runtime-permissions-cli"></a>

The AgentCore CLI uses AWS CDK and AWS CloudFormation to deploy projects. The permissions required by a deployment depend on the Runtime, Harness, Memory, Gateway, and other resources in the project, so there isn’t one least-privilege policy that applies to every project.

The IAM identity that runs `agentcore deploy` needs permission to:
+ Call `sts:GetCallerIdentity` and read the `CDKToolkit` and `AgentCore-<project-name>-<target-name>` CloudFormation stacks.
+ Bootstrap the target account and Region if the `CDKToolkit` stack is missing or outdated. If the environment is already bootstrapped, the identity must be able to assume the CDK deployment and file-publishing roles.
+ Create, update, and delete the CloudFormation stack and provision the AWS resources declared by the project. This can include passing or creating IAM roles and using Amazon S3, Amazon ECR, AWS CodeBuild, CloudWatch Logs, and Amazon Bedrock AgentCore.
+ Enable CloudWatch Transaction Search. `agentcore deploy` turns on Transaction Search in the target account and Region if it is not already active. If the identity lacks the following permissions, the deploy skips this step and continues. To turn off this step, run `agentcore config transactionSearch false`.
  +  `xray:GetTraceSegmentDestination` 
  +  `xray:UpdateTraceSegmentDestination` 
  +  `xray:UpdateIndexingRule` 
  +  `logs:DescribeResourcePolicies` 
  +  `logs:PutResourcePolicy` 
  +  `application-signals:StartDiscovery` 

For information about the roles and resources created during bootstrap, see [Bootstrapping your environment for use with the AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping-env.html).

**Important**  
Use broad deployment permissions only for development and testing. For production deployments, pre-bootstrap the environment and create custom policies for the CDK roles and project resources that follow the principle of least privilege. For complete IAM security guidance, see [Security best practices for AgentCore Runtime](runtime-security-best-practices.md).

## User permissions for Amazon Bedrock AgentCore Console
<a name="runtime-permissions-console"></a>

Attach the [BedrockAgentCoreFullAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/BedrockAgentCoreFullAccess.html) policy to the console role. Additionally, add the following permissions for IAM if you want service console to auto-create the execution role.

```
{
"Version": "2012-10-17",		 	 	 
  "Statement": [{
    "Sid": "IAMRoleAccess",
    "Effect": "Allow",
    "Action": ["iam:CreateRole"],
    "Resource": ["arn:aws:iam::*:role/service-role/AmazonBedrockAgentCoreRuntimeDefaultServiceRole-*"]
  }, {
    "Sid": "IAMPolicyAccess",
    "Effect": "Allow",
    "Action": ["iam:CreatePolicy"],
    "Resource": ["arn:aws:iam::*:policy/service-role/AmazonBedrockAgentCoreRuntimeExecutionPolicy_*"]
  }, {
    "Sid": "IAMRolePolicyAccess",
    "Effect": "Allow",
    "Action": ["iam:AttachRolePolicy"],
    "Resource": ["arn:aws:iam::*:role/service-role/AmazonBedrockAgentCoreRuntimeDefaultServiceRole-*"],
    "Condition": {
      "ArnLike": {
        "iam:PolicyARN": "arn:aws:iam::*:policy/service-role/AmazonBedrockAgentCoreRuntimeExecutionPolicy_*"
      }
    }
  }]
}
```

## Execution role for running an agent in AgentCore Runtime
<a name="runtime-permissions-execution"></a>

To run agent or tool in AgentCore Runtime you need an AWS Identity and Access Management execution role. For information about creating an IAM role, see [IAM role creation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create.html).

**Note**  
If role manager is enabled in your account, AgentCore attaches the role for you, and the role-selection step described here is replaced by a **Customize** option. To use a different role, choose **Customize**. For more information, see [IAM role creation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create.html) in the *IAM User Guide*.

### Amazon Bedrock AgentCore direct deploy execution role
<a name="runtime-permissions-direct-deploy-execution"></a>

The Amazon Bedrock AgentCore direct deploy execution role is an IAM role that Amazon Bedrock AgentCore assumes to run an agent. Replace the following:
+  `us-east-1` with the AWS Region that you are using
+  `123456789012` with your AWS account ID
+  {{agentName}} with the name of your agent. You’ll need to decide the agent name before creating the role and AgentCore Runtime.

```
{
"Version": "2012-10-17",		 	 	 
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "logs:DescribeLogStreams",
      "logs:CreateLogGroup"
    ],
    "Resource": [
      "arn:aws:logs:us-east-1:123456789012:log-group:/aws/bedrock-agentcore/runtimes/*"
    ]
  }, {
    "Effect": "Allow",
    "Action": [
      "logs:PutResourcePolicy"
    ],
    "Resource": [
      "arn:aws:logs:us-east-1:123456789012:log-group:/aws/bedrock-agentcore/runtimes/agentName-*"
    ]
  }, {
    "Effect": "Allow",
    "Action": ["logs:DescribeLogGroups"],
    "Resource": ["arn:aws:logs:us-east-1:123456789012:log-group:*"]
  }, {
    "Effect": "Allow",
    "Action": [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ],
    "Resource": [
      "arn:aws:logs:us-east-1:123456789012:log-group:/aws/bedrock-agentcore/runtimes/*:log-stream:*"
    ]
  }, {
    "Effect": "Allow",
    "Action": [
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords",
      "xray:GetSamplingRules",
      "xray:GetSamplingTargets"
    ],
    "Resource": ["*"]
  }, {
    "Effect": "Allow",
    "Resource": "*",
    "Action": "cloudwatch:PutMetricData",
    "Condition": {
      "StringEquals": {
        "cloudwatch:namespace": "bedrock-agentcore"
      }
    }
  }, {
    "Sid": "BedrockModelInvocation",
    "Effect": "Allow",
    "Action": [
      "bedrock:InvokeModel",
      "bedrock:InvokeModelWithResponseStream"
    ],
    "Resource": [
      "arn:aws:bedrock:*::foundation-model/*",
      "arn:aws:bedrock:us-east-1:123456789012:*"
    ]
  }]
}
```

### AgentCore Runtime execution role
<a name="runtime-permissions-execution-role"></a>

The AgentCore Runtime execution role is an IAM role that AgentCore Runtime assumes to run an agent. Replace the following:
+  `us-east-1` with the AWS Region that you are using
+  `123456789012` with your AWS account ID
+  {{agentName}} with the name of your agent. You’ll need to decide the agent name before creating the role and AgentCore Runtime.

```
{
"Version":"2012-10-17",		 	 	 
    "Statement": [
        {
            "Sid": "ECRImageAccess",
            "Effect": "Allow",
            "Action": [
                "ecr:BatchGetImage",
                "ecr:GetDownloadUrlForLayer"
            ],
            "Resource": [
                "arn:aws:ecr:us-east-1:123456789012:repository/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:DescribeLogStreams",
                "logs:CreateLogGroup"
            ],
            "Resource": [
                "arn:aws:logs:us-east-1:123456789012:log-group:/aws/bedrock-agentcore/runtimes/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:PutResourcePolicy"
            ],
            "Resource": [
                "arn:aws:logs:us-east-1:123456789012:log-group:/aws/bedrock-agentcore/runtimes/agentName-*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:DescribeLogGroups"
            ],
            "Resource": [
                "arn:aws:logs:us-east-1:123456789012:log-group:*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": [
                "arn:aws:logs:us-east-1:123456789012:log-group:/aws/bedrock-agentcore/runtimes/*:log-stream:*"
            ]
        },
        {
            "Sid": "ECRTokenAccess",
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken"
            ],
            "Resource": "*"
        },
        {
        "Effect": "Allow",
        "Action": [
            "xray:PutTraceSegments",
            "xray:PutTelemetryRecords",
            "xray:GetSamplingRules",
            "xray:GetSamplingTargets"
            ],
         "Resource": [ "*" ]
         },
         {
            "Effect": "Allow",
            "Resource": "*",
            "Action": "cloudwatch:PutMetricData",
            "Condition": {
                "StringEquals": {
                    "cloudwatch:namespace": "bedrock-agentcore"
                }
            }
        },
        {
            "Sid": "GetAgentAccessToken",
            "Effect": "Allow",
            "Action": [
                "bedrock-agentcore:GetWorkloadAccessToken",
                "bedrock-agentcore:GetWorkloadAccessTokenForJWT",
                "bedrock-agentcore:GetWorkloadAccessTokenForUserId"
            ],
            "Resource": [
              "arn:aws:bedrock-agentcore:us-east-1:123456789012:workload-identity-directory/default",
              "arn:aws:bedrock-agentcore:us-east-1:123456789012:workload-identity-directory/default/workload-identity/agentName-*"
            ]
        },
         {"Sid": "BedrockModelInvocation",
         "Effect": "Allow",
         "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
              ],
        "Resource": [
            "arn:aws:bedrock:*::foundation-model/*",
            "arn:aws:bedrock:us-east-1:123456789012:*"
        ]
        }
    ]
}
```

### AgentCore Runtime trust policy
<a name="runtime-permissions-trust-policy"></a>

The AgentCore Runtime execution role must include the following trust policy which allows the AgentCore Runtime to assume the role.

In the policy, replace:
+  `us-east-1` with the AWS Region that you are using
+  `123456789012` with your AWS account ID

To add the trust policy to the AgentCore Runtime execution role, go to the AWS Management Console, navigate to the role, choose the **Trust relationships** tab, and choose **Edit trust policy**.

```
{
"Version":"2012-10-17",		 	 	 
  "Statement": [
    {
      "Sid": "AssumeRolePolicy",
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