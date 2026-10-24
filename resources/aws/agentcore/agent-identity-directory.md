

# Understanding the agent identity directory
<a name="agent-identity-directory"></a>

The agent identity directory is a centralized collection of all workload identities within your AWS account. It serves as the authoritative registry for managing and organizing agent identities, providing a unified view of all identities whether they were created automatically by AgentCore Runtime and Gateway or manually through the AWS CLI and SDK. For information about creating workload identities, see [Create and manage workload identities](creating-agent-identities.md).

**Topics**
+ [Directory concepts and structure](#directory-concepts)
+ [Directory management best practices](#directory-management-best-practices)
+ [Listing and viewing directory contents](#listing-directory-contents)
+ [Directory access control and permissions](#directory-access-control)

## Directory concepts and structure
<a name="directory-concepts"></a>

Understanding the fundamental concepts and organizational structure of the agent identity directory helps you effectively manage workload identities at scale.

 **Key characteristics** 
+  **Single directory per account** – Each AWS account has exactly one agent identity directory
+  **Automatic creation** – The directory is automatically created when the first workload identity is created in your account
+  **Centralized management** – All workload identities, regardless of how they were created, are stored in this directory
+  **Cross-service visibility** – The directory provides visibility into identities created by Runtime, Gateway, and manual processes

 **Directory structure** 

```
arn:aws:bedrock-agentcore:region:account-id:workload-identity-directory/default
├── workload-identity/runtime-created-agent-1
├── workload-identity/runtime-created-agent-2
├── workload-identity/gateway-created-agent-1
├── workload-identity/manually-created-agent-1
└── workload-identity/manually-created-agent-2
```

## Directory management best practices
<a name="directory-management-best-practices"></a>

Following established best practices for directory management helps maintain organization, security, and operational efficiency as your workload identity usage grows.

 **Naming conventions** 
+ Use descriptive names that indicate the agent’s purpose (such as "customer-support-agent", "data-analysis-agent")
+ Include environment indicators for multi-environment deployments (such as "prod-chatbot", "dev-chatbot")
+ Consider team or project prefixes for large organizations (such as "marketing-content-agent")

 **Organization strategies** 
+ Regularly audit your directory to identify unused or obsolete workload identities
+ Document the purpose and ownership of each workload identity
+ Implement consistent tagging strategies for workload identities when available. For more information, see [Tagging AgentCore Identity resources](identity-tagging.md).
+ Monitor directory growth and establish governance processes for identity creation

 **Security considerations** 
+ Regularly review IAM policies that grant access to the directory
+ Use least-privilege principles when granting directory access
+ Monitor directory access through AWS CloudTrail logs
+ Implement automated alerts for unauthorized directory modifications

## Listing and viewing directory contents
<a name="listing-directory-contents"></a>

You can view all workload identities in your directory using the AWS CLI:

 **List all workload identities** 

```
aws bedrock-agentcore-control list-workload-identities
```

This command returns information about all workload identities in your account, including:
+ Workload identity names and ARNs
+ Creation timestamps
+ Associated metadata
+ Creation source (Runtime, Gateway, or manual)

 **Example output** 

```
{
  "workloadIdentities": [
    {
      "workloadIdentityArn": "arn:aws:bedrock-agentcore:us-east-1:123456789012:workload-identity-directory/default/workload-identity/my-runtime-agent",
      "workloadIdentityName": "my-runtime-agent",
      "createdAt": "2024-01-15T10:30:00Z",
      "createdBy": "AgentCore Runtime"
    },
    {
      "workloadIdentityArn": "arn:aws:bedrock-agentcore:us-east-1:123456789012:workload-identity-directory/default/workload-identity/my-custom-agent",
      "workloadIdentityName": "my-custom-agent",
      "createdAt": "2024-01-16T14:20:00Z",
      "createdBy": "Manual"
    }
  ]
}
```

 **Get details about a specific workload identity** 

```
aws bedrock-agentcore-control get-workload-identity \
    --workload-identity-name my-agent-name
```

## Directory access control and permissions
<a name="directory-access-control"></a>

The agent identity directory integrates with IAM to provide fine-grained access control over workload identities and their associated resources. For information about using workload identities to control access to credential providers, see [Scope down access to credential providers by workload identity](scope-credential-provider-access.md).

 **Directory-level permissions** 
+  **List permissions** – Control who can view the directory contents
+  **Create permissions** – Control who can create new workload identities
+  **Read permissions** – Control who can view specific workload identity details
+  **Delete permissions** – Control who can remove workload identities

 **Example IAM policy for directory access** 

```
{
"Version": "2012-10-17",		 	 	 
  "Statement": [
    {
      "Sid": "ListWorkloadIdentities",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:ListWorkloadIdentities"
      ],
      "Resource": [
        "arn:aws:bedrock-agentcore:*:*:workload-identity-directory/default"
      ]
    },
    {
      "Sid": "ManageSpecificWorkloadIdentity",
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:GetWorkloadIdentity",
        "bedrock-agentcore:CreateWorkloadIdentity",
        "bedrock-agentcore:DeleteWorkloadIdentity"
      ],
      "Resource": [
        "arn:aws:bedrock-agentcore:*:*:workload-identity-directory/default/workload-identity/my-agent-*"
      ]
    }
  ]
}
```