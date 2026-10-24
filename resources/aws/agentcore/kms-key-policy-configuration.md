

# Set customer managed key policy
<a name="kms-key-policy-configuration"></a>

**Note**  
To configure a customer managed key on the token vault, use the `SetTokenVaultCMK` API operation or an AWS SDK, as described in [Configure with API operations or an AWS SDK](api-configuration-encryption.md).

To use a customer managed key, your key must trust an Amazon Bedrock AgentCore Identity service principal to perform encryption and decryption operations on the key. Configure the [key policy](https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html) of your KMS key as shown in the following example. The IAM principal that writes this policy must have write access to your KMS key, with `kms:PutKeyPolicy` permission.

```
{
    "Id": "identity-service-cmk-policy",
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "BedrockAgentCoreIdentityKMSAccess",
            "Effect": "Allow",
            "Action": [
                "kms:Encrypt",
                "kms:Decrypt",
                "kms:GenerateDataKeyWithoutPlaintext"
            ],
            "Resource": "*",
            "Condition": {
                "StringLike": {
                    "kms:ViaService": "bedrock-agentcore-identity.*.amazonaws.com"
                },
                "StringEquals": {
                    "aws:ResourceAccount": "${aws:PrincipalAccount}"
                },
                "ArnLike": {
                    "kms:EncryptionContext:aws-crypto-ec:aws:bedrock-agentcore-identity:token-vault-arn": "arn:aws:bedrock-agentcore:*:*:token-vault/default"
                }
            }
        },
        {
            "Sid": "BedrockAgentCoreIdentityDescribeKeyKMSAccess",
            "Effect": "Allow",
            "Action": [
                "kms:DescribeKey"
            ],
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                    "aws:ResourceAccount": "${aws:PrincipalAccount}"
                },
                "StringLike": {
                    "kms:ViaService": "bedrock-agentcore-identity.*.amazonaws.com"
                }
            }
        }
    ]
}
```