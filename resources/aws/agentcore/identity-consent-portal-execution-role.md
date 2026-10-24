

# Consent portal execution role
<a name="identity-consent-portal-execution-role"></a>

A consent portal assumes an IAM role that you pass as `executionRoleArn` when you create the portal. The Consent Portal service assumes this role to read the gateway and OAuth2 credential provider configurations and to retrieve the OAuth client secret. Before you create a consent portal, create this execution role with the trust policy and permissions policy described in this topic. You supply the role’s ARN as `executionRoleArn` when you [create a consent portal with the console](identity-create-consent-portal-console.md) or [create a consent portal with the AWS CLI](identity-create-consent-portal.md). For information about creating an IAM role, see [IAM role creation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create.html).

## Trust policy
<a name="consent-portal-execution-role-trust-policy"></a>

The consent portal execution role must include the following trust policy, which allows the Consent Portal service principal, `bedrock-agentcore.amazonaws.com`, to assume the role. The `aws:SourceAccount` and `aws:SourceArn` conditions restrict which account and consent portal can assume the role, protecting against the confused deputy problem.

In the policy, replace:
+  `us-east-1` with the AWS Region that you are using
+  `111122223333` with your AWS account ID
+  {{consent-portal-id}} with the ID of your consent portal

```
{
"Version": "2012-10-17",		 	 	 
  "Statement": [
    {
      "Sid": "ConsentPortalAssumeRolePolicy",
      "Effect": "Allow",
      "Principal": {
        "Service": "bedrock-agentcore.amazonaws.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "aws:SourceAccount": "111122223333"
        },
        "ArnLike": {
          "aws:SourceArn": "arn:aws:bedrock-agentcore:us-east-1:111122223333:consent-portal/consent-portal-id"
        }
      }
    }
  ]
}
```

**Note**  
Because you won’t know the consent portal ARN before you create the portal, you can omit the `Condition` field when you first create the execution role. After you create the consent portal, add the `Condition` field back to the policy as a best security practice and do the following:  
Replace the `aws:SourceAccount` condition key value with the ID of the account that the consent portal belongs to.
Replace the `aws:SourceArn` condition key value with the ARN of the consent portal.

## Permissions policy
<a name="consent-portal-execution-role-permissions-policy"></a>

Attach the following inline permissions policy to the execution role. It grants the actions that the consent portal requires to read the gateway and OAuth2 credential provider configurations and to retrieve the OAuth client secret.

In the policy, replace:
+  `us-east-1` with the AWS Region that you are using
+  `111122223333` with your AWS account ID
+  {{gateway-id}} with the ID of the gateway that the consent portal serves

```
{
"Version": "2012-10-17",		 	 	 
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:GetGateway",
        "bedrock-agentcore:GetGatewayTarget",
        "bedrock-agentcore:ListGatewayTargets"
      ],
      "Resource": "arn:aws:bedrock-agentcore:us-east-1:111122223333:gateway/gateway-id"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:GetOauth2CredentialProvider",
        "bedrock-agentcore:ListOauth2CredentialProviders"
      ],
      "Resource": [
        "arn:aws:bedrock-agentcore:us-east-1:111122223333:token-vault/default/oauth2credentialprovider/*",
        "arn:aws:bedrock-agentcore:us-east-1:111122223333:token-vault/default"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock-agentcore:CompleteResourceTokenAuth",
        "bedrock-agentcore:GetResourceOauth2Token",
        "bedrock-agentcore:GetWorkloadAccessTokenForJWT"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:111122223333:secret:bedrock-agentcore-identity!default/oauth2/*"
      ],
      "Condition": {
        "StringEquals": {
          "aws:ResourceTag/aws:secretsmanager:owningService": "bedrock-agentcore-identity"
        }
      }
    }
  ]
}
```