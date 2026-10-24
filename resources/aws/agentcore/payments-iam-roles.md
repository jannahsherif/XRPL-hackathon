

# IAM roles for AgentCore payments
<a name="payments-iam-roles"></a>

## Role summary
<a name="payments-iam-role-summary"></a>

AgentCore payments uses a five-role IAM model that separates administrative, management, agent execution, service operations, and AWS Marketplace subscription (Coinbase only). Set up IAM permissions based on the persona that matches your role.


| Role | Purpose | 
| --- | --- | 
| Administrator (ControlPlaneRole) | Manages payment managers, connectors, and credential providers. For Coinbase, this role also requires the AWS managed policy `AWSMarketplaceManageSubscriptions` to subscribe in AWS Marketplace | 
| Agent developer (ManagementRole) | Manages payment instruments and sessions, cannot execute payments | 
| Payment execution (ProcessPaymentRole) | Executes payment transactions on behalf of agents | 
| Service role (ResourceRetrievalRole) | Assumed by AgentCore payments at runtime to retrieve credentials | 
| Marketplace subscription (`AWSMarketplaceManageSubscriptions` on the Administrator) | For Coinbase, subscribes the account to the **Coinbase Wallets for AgentCore Payments** listing in AWS Marketplace. This is an AWS managed policy attached to the Administrator identity, not a separate assumable role. | 

**Tip**  
You can automate the steps on this page with the AgentCore Payments skill in the AWS agent toolkit. The skill is part of the **aws-agents** plugin and lets an AI coding agent create your Payment Manager, connector, and credential provider with the AgentCore CLI, create a payment instrument and session using the AgentCore SDK, and add a process payment tool to your agent. For details, see the [quickstart](payments-getting-started.md) and the [AWS agent toolkit on GitHub](https://github.com/aws/agent-toolkit-for-aws/tree/main).

## Why role separation matters
<a name="payments-iam-why-separation"></a>

Separating payment management from payment execution prevents a single compromised identity from both creating sessions with unlimited budgets and executing payments against those sessions. The explicit `Deny` on `ProcessPayment` in the management role enforces this boundary. This also ensures that audit trails clearly distinguish who configured payment resources from who executed transactions.

## Administrator permissions (ControlPlaneRole)
<a name="payments-iam-admin"></a>

For administrators who manage payment managers, connectors, and credential providers:

**Note**  
To use Coinbase as a payment provider, the administrator must also subscribe the account to the **Coinbase Wallets for AgentCore Payments** listing in AWS Marketplace. This requires the AWS managed policy [AWSMarketplaceManageSubscriptions](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSMarketplaceManageSubscriptions.html). With this subscription, your Coinbase wallet usage charges are consolidated into your monthly AWS bill based on Coinbase’s [pricing](https://docs.cdp.coinbase.com/wallets/pricing) on the Coinbase website. There are no additional charges or obligations for the subscription. For more information, see [Subscribe to Coinbase Wallets for AgentCore Payments in AWS Marketplace](payments-marketplace-subscription.md).

```
{
    "Version": "2012-10-17",		 	 	 
    "Statement": [
        {
            "Sid": "AllowPaymentManagerOperations",
            "Effect": "Allow",
            "Action": [
                "bedrock-agentcore:CreatePaymentManager",
                "bedrock-agentcore:GetPaymentManager",
                "bedrock-agentcore:ListPaymentManagers",
                "bedrock-agentcore:DeletePaymentManager",
                "bedrock-agentcore:UpdatePaymentManager"
            ],
            "Resource": [
                "arn:aws:bedrock-agentcore:*:111122223333:payment-manager/*"
            ]
        },
        {
            "Sid": "AllowPaymentConnectorOperations",
            "Effect": "Allow",
            "Action": [
                "bedrock-agentcore:CreatePaymentConnector",
                "bedrock-agentcore:GetPaymentConnector",
                "bedrock-agentcore:ListPaymentConnectors",
                "bedrock-agentcore:DeletePaymentConnector",
                "bedrock-agentcore:UpdatePaymentConnector"
            ],
            "Resource": [
                "arn:aws:bedrock-agentcore:*:111122223333:payment-manager/*/connector/*"
            ]
        },
        {
            "Sid": "AllowCredentialProviderOperations",
            "Effect": "Allow",
            "Action": [
                "bedrock-agentcore:CreatePaymentCredentialProvider",
                "bedrock-agentcore:GetPaymentCredentialProvider",
                "bedrock-agentcore:ListPaymentCredentialProviders",
                "bedrock-agentcore:DeletePaymentCredentialProvider",
                "bedrock-agentcore:UpdatePaymentCredentialProvider"
            ],
            "Resource": [
                "arn:aws:bedrock-agentcore:*:111122223333:token-vault/*/paymentcredentialprovider/*"
            ]
        },
        {
            "Sid": "AllowVendedLogDelivery",
            "Effect": "Allow",
            "Action": [
                "bedrock-agentcore:AllowVendedLogDeliveryForResource"
            ],
            "Resource": [
                "arn:aws:bedrock-agentcore:*:111122223333:payment-manager/*"
            ]
        },
        {
            "Sid": "AllowPassResourceRetrievalRole",
            "Effect": "Allow",
            "Action": "iam:PassRole",
            "Resource": "arn:aws:iam::111122223333:role/AgentCorePaymentsResourceRetrievalRole",
            "Condition": {
                "StringEquals": {
                    "iam:PassedToService": "bedrock-agentcore.amazonaws.com"
                }
            }
        }
    ]
}
```

To subscribe to the **Coinbase Wallets for AgentCore Payments** listing in AWS Marketplace, the administrator identity also needs the AWS managed policy [AWSMarketplaceManageSubscriptions](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSMarketplaceManageSubscriptions.html). Attach it to the administrator’s IAM role (or user). For example, with the AWS CLI:

```
aws iam attach-role-policy \
  --role-name <administrator-role-name> \
  --policy-arn <AWSMarketplaceManageSubscriptions-policy-arn>
```

## Agent developer permissions (ManagementRole)
<a name="payments-iam-developer"></a>

For deterministic/human-in-the-loop (HITL) code that manages payment instruments and sessions but does not execute payments directly:

```
{
    "Version": "2012-10-17",		 	 	 
    "Statement": [
        {
            "Sid": "AllowPaymentManagement",
            "Effect": "Allow",
            "Action": [
                "bedrock-agentcore:CreatePaymentInstrument",
                "bedrock-agentcore:GetPaymentInstrument",
                "bedrock-agentcore:ListPaymentInstruments",
                "bedrock-agentcore:DeletePaymentInstrument",
                "bedrock-agentcore:CreatePaymentSession",
                "bedrock-agentcore:GetPaymentSession",
                "bedrock-agentcore:ListPaymentSessions",
                "bedrock-agentcore:DeletePaymentSession"
            ],
            "Resource": [
                "arn:aws:bedrock-agentcore:*:111122223333:payment-manager/*"
            ]
        },
        {
            "Sid": "DenyProcessPayment",
            "Effect": "Deny",
            "Action": "bedrock-agentcore:ProcessPayment",
            "Resource": "*"
        }
    ]
}
```

**Note**  
This policy explicitly denies `ProcessPayment` to enforce separation of duties between management operations and payment execution. This ensures only deterministic code paths can set control plane operations, while agentic execution is only able to process payment without overriding budgets or creating payment instruments to work around this.

## Payment execution permissions (ProcessPaymentRole)
<a name="payments-iam-execution"></a>

For deterministic code paths that execute payment transactions on behalf of agents:

```
{
    "Version": "2012-10-17",		 	 	 
    "Statement": [
        {
            "Sid": "AllowProcessPayment",
            "Effect": "Allow",
            "Action": "bedrock-agentcore:ProcessPayment",
            "Resource": [
                "arn:aws:bedrock-agentcore:*:111122223333:payment-manager/*"
            ]
        },
        {
            "Sid": "AllowPaymentReadOperations",
            "Effect": "Allow",
            "Action": [
                "bedrock-agentcore:GetPaymentInstrument",
                "bedrock-agentcore:GetPaymentInstrumentBalance",
                "bedrock-agentcore:GetPaymentSession"
            ],
            "Resource": [
                "arn:aws:bedrock-agentcore:*:111122223333:payment-manager/*"
            ]
        }
    ]
}
```

**Important**  
Do not include PaymentSession *write* permissions (for example, `CreatePaymentSession`) and `ProcessPayment` in the same role, or the caller can bypass payment limits by creating new sessions with elevated budgets.

## Service role permissions (ResourceRetrievalRole)
<a name="payments-iam-service-role"></a>

The following service role is assumed by AgentCore payments at runtime to retrieve credentials and manage workload identities. It is not assigned to human users.

### Trust policy
<a name="payments-iam-service-role-trust"></a>

The service role must trust the `bedrock-agentcore.amazonaws.com` service principal. The following trust policy scopes access to a specific account and Payment Manager:

```
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
                    "aws:SourceAccount": "<account>"
                },
                "ArnLike": {
                    "aws:SourceArn": "arn:aws:bedrock-agentcore:<region>:<account>:payment-manager/<payment-manager-name>-*"
                }
            }
        }
    ]
}
```

### Base permissions (attached on Payment Manager creation)
<a name="payments-iam-service-role-base"></a>

When a Payment Manager is created, the following permissions are attached to the service role. These grant the Payment Manager access to workload identity and payment token operations:

```
{
    "Version": "2012-10-17",		 	 	 
    "Statement": [
        {
            "Sid": "WorkloadIdentityManagement",
            "Effect": "Allow",
            "Action": [
                "bedrock-agentcore:CreateWorkloadIdentity",
                "bedrock-agentcore:DeleteWorkloadIdentity"
            ],
            "Resource": [
                "arn:aws:bedrock-agentcore:<region>:<account>:workload-identity-directory/default",
                "arn:aws:bedrock-agentcore:<region>:<account>:workload-identity-directory/default/workload-identity/*"
            ]
        },
        {
            "Sid": "WorkloadIdentityAccess",
            "Effect": "Allow",
            "Action": [
                "bedrock-agentcore:GetWorkloadAccessToken"
            ],
            "Resource": [
                "arn:aws:bedrock-agentcore:<region>:<account>:workload-identity-directory/default",
                "arn:aws:bedrock-agentcore:<region>:<account>:workload-identity-directory/default/workload-identity/<payment-manager-name>-*"
            ]
        },
        {
            "Sid": "PaymentTokenBaseAccess",
            "Effect": "Allow",
            "Action": [
                "bedrock-agentcore:GetResourcePaymentToken"
            ],
            "Resource": [
                "arn:aws:bedrock-agentcore:<region>:<account>:token-vault/default",
                "arn:aws:bedrock-agentcore:<region>:<account>:workload-identity-directory/default",
                "arn:aws:bedrock-agentcore:<region>:<account>:workload-identity-directory/default/workload-identity/<payment-manager-name>-*"
            ]
        },
        {
            "Sid": "PaymentCredentialProviderProvisioning",
            "Effect": "Allow",
            "Action": [
                "bedrock-agentcore:CreatePaymentCredentialProvider",
                "bedrock-agentcore:GetPaymentCredentialProvider",
                "bedrock-agentcore:TagResource"
            ],
            "Resource": [
                "arn:aws:bedrock-agentcore:<region>:<account>:token-vault/<token-vault-id>",
                "arn:aws:bedrock-agentcore:<region>:<account>:token-vault/<token-vault-id>/paymentcredentialprovider/*"
            ]
        }
    ]
}
```

### KMS permissions
<a name="payments-iam-service-role-kms"></a>

If you configure a customer-managed AWS KMS key on your Payment Manager, add the following permissions to the service role:

```
{
    "Version": "2012-10-17",		 	 	 
    "Statement": [
        {
            "Sid": "KMSPermissions",
            "Effect": "Allow",
            "Action": [
                "kms:Decrypt",
                "kms:GenerateDataKey"
            ],
            "Resource": [
                "arn:aws:kms:<region>:<account>:key/<key-id>"
            ],
            "Condition": {
                "StringEquals": {
                    "aws:ResourceAccount": "<account>"
                },
                "StringLike": {
                    "kms:EncryptionContext:aws:payments-manager:arn": "arn:aws:bedrock-agentcore:<region>:<account>:payment-manager/*"
                }
            }
        }
    ]
}
```

### Per-connector permissions
<a name="payments-iam-service-role-connector"></a>

Each time a payment connector is added to the Payment Manager, the following permissions are appended to the service role. These grant access to the specific payment credential provider and its backing secrets:

```
{
    "Version": "2012-10-17",		 	 	 
    "Statement": [
        {
            "Sid": "PaymentTokenAccess",
            "Effect": "Allow",
            "Action": [
                "bedrock-agentcore:GetResourcePaymentToken"
            ],
            "Resource": [
                "<payment-credential-provider-arn>"
            ]
        },
        {
            "Sid": "SecretsManagerAccess",
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": [
                "<secret-arns>"
            ],
            "Condition": {
                "StringEquals": {
                    "aws:ResourceAccount": "<account>"
                }
            }
        }
    ]
}
```

## Using an existing role
<a name="payments-iam-existing-role"></a>

If you choose to use an existing service role instead of creating a new one, ensure that the role has:

1. The trust policy shown above, with `bedrock-agentcore.amazonaws.com` as the trusted principal.

1. The base permissions for workload identity and payment token access.

1. Per-connector permissions for each payment credential provider that the Payment Manager’s connectors reference.

**Note**  
The Administrator, Agent developer, and Payment execution roles use a standard account trust policy allowing `arn:aws:iam::111122223333:root` to assume them.

For example IAM policies, see [Identity and access management for Amazon Bedrock AgentCore](security-iam.md).