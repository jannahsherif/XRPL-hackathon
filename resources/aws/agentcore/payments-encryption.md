

# Encryption at rest for AgentCore payments
<a name="payments-encryption"></a>

Amazon Bedrock AgentCore payments encrypts all customer data at rest by default. You don’t need to perform any additional configuration to protect your data. AgentCore payments also provides advanced encryption mechanisms that give you more control over how your data is protected.

## Options for encryption at rest
<a name="payments-encryption-options"></a>

By default, AgentCore payments uses an AWS owned key to encrypt your data at rest. You can’t view, manage, or audit the use of an AWS owned key.

Optionally, you can encrypt sensitive fields using a **customer managed key** that you create, own, and manage in AWS Key Management Service (AWS KMS). When you configure a customer managed key, the service encrypts the following fields with your key:
+  **Payment manager:** `name`, `description` 
+  **Payment connector:** `name`, `description` 

With a customer managed key, you have more control. You can:
+ Create and manage the key, including setting key policies, IAM policies, and grants
+ Rotate the cryptographic material on your schedule
+ Disable or revoke access to the key at any time
+ Audit key usage through AWS CloudTrail

When you use a customer managed key, AWS can’t access your encrypted data. Only principals with access to your key can decrypt the protected fields.

For more information, see [Customer managed keys](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#customer-cmk) in the * AWS Key Management Service Developer Guide*.

## Encrypting data using customer managed KMS keys
<a name="payments-encryption-cmk"></a>

The following sections describe how AgentCore payments uses a customer managed AWS KMS key and how to configure one.

### How AgentCore payments uses a customer managed KMS key
<a name="payments-encryption-cmk-how-it-works"></a>

During payment manager creation, provide a KMS key ARN and an execution role ARN. AgentCore payments then uses **envelope encryption** through the AWS Encryption SDK to encrypt sensitive fields before storing them in Amazon DynamoDB.

The encryption workflow uses the following steps:

1.  **FAS authorization check** — At creation time, AgentCore payments uses your IAM caller credentials through [Forward Access Sessions (FAS)](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_forward_access_sessions.html) to verify your key permissions. It calls `kms:DescribeKey`, `kms:GenerateDataKey`, and `kms:Decrypt` on your key. This check prevents confused deputy scenarios.

1.  **Envelope encryption** — AgentCore payments assumes the execution role you provide (`roleArn`). Using those role credentials, the AWS Encryption SDK calls `kms:GenerateDataKey` to obtain a unique data encryption key. The SDK encrypts the sensitive field with that data key and stores the encrypted data key alongside the ciphertext.

1.  **Decryption** — When reading encrypted fields, the service assumes your execution role and calls `kms:Decrypt` (through the AWS Encryption SDK) to unwrap the data key, then decrypts the field locally.

AgentCore payments binds an **encryption context** containing the payment manager ARN to every encrypt and decrypt operation. This makes sure that ciphertext can’t be decrypted outside the context of the associated payment manager.

AgentCore payments doesn’t use KMS grants. All cryptographic operations use the customer-provided execution role.

### Configuring a customer managed KMS key
<a name="payments-encryption-cmk-configure"></a>

Use a **symmetric encryption KMS key** (`SYMMETRIC_DEFAULT` key spec with `ENCRYPT_DECRYPT` key usage) with AgentCore payments.

To create a customer managed key, see [Creating keys](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html) in the * AWS Key Management Service Developer Guide*.

#### Prerequisites
<a name="payments-encryption-cmk-prerequisites"></a>

Before you configure a customer managed key for AgentCore payments, make sure that your key meets the following requirements:
+ The key spec is `SYMMETRIC_DEFAULT` (symmetric encryption).
+ The key usage is `ENCRYPT_DECRYPT`.
+ The key state is `Enabled`.
+ The key is a single-Region key.

#### Configuring permissions to use a customer managed KMS key
<a name="payments-encryption-cmk-permissions"></a>

To use a customer managed key with AgentCore payments, you must configure the following permissions:

 **Caller permissions (your IAM identity):** 

Your IAM principal must have `kms:DescribeKey`, `kms:GenerateDataKey`, and `kms:Decrypt` permissions on the key. AgentCore payments checks these permissions at resource creation or update time through Forward Access Sessions (FAS).

 **Execution role permissions:** 

The execution role you provide in `roleArn` must have permission to call `kms:GenerateDataKey`, `kms:Decrypt`, and `kms:DescribeKey` on the key. AgentCore payments assumes this role to perform encryption and decryption.

 **Key policy:** 

The following is a least-privilege key policy example for use with AgentCore payments. It contains four statements:

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCallerFasAccessViaService",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111122223333:role/CallerRole"
      },
      "Action": [
        "kms:GenerateDataKey",
        "kms:Decrypt"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "kms:ViaService": "bedrock-agentcore.REGION.amazonaws.com"
        },
        "StringLike": {
          "kms:EncryptionContext:aws:payments-manager:arn": "arn:aws:bedrock-agentcore:REGION:111122223333:payment-manager/*"
        }
      }
    },
    {
      "Sid": "AllowCallerFasDescribeKey",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111122223333:role/CallerRole"
      },
      "Action": "kms:DescribeKey",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "kms:ViaService": "bedrock-agentcore.REGION.amazonaws.com"
        }
      }
    },
    {
      "Sid": "AllowExecutionRoleCryptoOperations",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111122223333:role/PaymentManagerExecutionRole"
      },
      "Action": [
        "kms:GenerateDataKey",
        "kms:Decrypt"
      ],
      "Resource": "*",
      "Condition": {
        "StringLike": {
          "kms:EncryptionContext:aws:payments-manager:arn": "arn:aws:bedrock-agentcore:REGION:111122223333:payment-manager/*"
        }
      }
    },
    {
      "Sid": "AllowExecutionRoleDescribeKey",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111122223333:role/PaymentManagerExecutionRole"
      },
      "Action": "kms:DescribeKey",
      "Resource": "*"
    }
  ]
}
```

The following table describes the purpose of each statement:


| Sid | Purpose | 
| --- | --- | 
|  `AllowCallerFasAccessViaService`  | Allows the calling principal to perform the FAS authorization check (GenerateDataKey, Decrypt) when the request arrives through AgentCore payments. The `kms:ViaService` condition makes sure that this permission applies only to requests made through AgentCore payments. The `kms:EncryptionContext` condition restricts usage to operations associated with your payment managers. | 
|  `AllowCallerFasDescribeKey`  | Allows the calling principal to describe the key during the FAS authorization check. This is a separate statement because `kms:DescribeKey` doesn’t accept encryption context. The `kms:ViaService` condition makes sure that this permission applies only to requests made through AgentCore payments. | 
|  `AllowExecutionRoleCryptoOperations`  | Grants the execution role permission to perform envelope encryption and decryption. The `kms:EncryptionContext` condition restricts usage to operations associated with your payment managers. | 
|  `AllowExecutionRoleDescribeKey`  | Allows the execution role to describe the key for validation and troubleshooting. This is a separate statement because `kms:DescribeKey` doesn’t accept encryption context. | 

**Note**  
Replace `REGION` with the AWS Region where you created your payment manager (for example, `us-west-2`). Replace `111122223333` with your AWS account ID.

#### Creating a payment manager with a customer managed KMS key
<a name="payments-encryption-cmk-create"></a>

To encrypt a payment manager with a customer managed key, specify the `kmsKeyArn` parameter in the `CreatePaymentManager` API.

 ** AWS CLI:** 

```
aws bedrock-agentcore-payments create-payment-manager \
    --name "MyPaymentManager" \
    --role-arn "arn:aws:iam::111122223333:role/PaymentManagerExecutionRole" \
    --authorizer-type "AWS_IAM" \
    --kms-key-arn "arn:aws:kms:us-west-2:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab"
```

You can also add a customer managed key to an existing payment manager that you created without one by specifying `kmsKeyArn` in the `UpdatePaymentManager` API. The service encrypts new data written after the update. Existing unencrypted data remains readable.

#### Changing encryption configuration on an existing payment manager
<a name="payments-encryption-cmk-change"></a>

The customer managed key that you configure on a payment manager stays with that payment manager. To use a different customer managed key or an AWS owned key, delete the existing payment manager and create a new one with the desired key.

AgentCore payments supports AWS KMS [automatic key rotation](https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html), and we recommend enabling it. Because automatic rotation preserves the key ID and retains prior key material, existing ciphertext remains decryptable without any service-side changes.

#### Scoping down access to the customer managed KMS key
<a name="payments-encryption-cmk-scope"></a>

You can further restrict access to your customer managed key using the following mechanisms:

 **Encryption context conditions** 

AgentCore payments includes the following encryption context on every `kms:GenerateDataKey` and `kms:Decrypt` call:


| Key | Value | 
| --- | --- | 
|  `aws:payments-manager:arn`  | The full ARN of the payment manager | 

You can add a `kms:EncryptionContext` condition to your key policy to restrict usage to specific payment managers:

```
"Condition": {
  "StringEquals": {
    "kms:EncryptionContext:aws:payments-manager:arn": "arn:aws:bedrock-agentcore:us-west-2:111122223333:payment-manager/pm-abc123"
  }
}
```

Or use a wildcard to allow all payment managers in the account:

```
"Condition": {
  "StringLike": {
    "kms:EncryptionContext:aws:payments-manager:arn": "arn:aws:bedrock-agentcore:us-west-2:111122223333:payment-manager/*"
  }
}
```

 **kms:ViaService condition** 

The `kms:ViaService` condition key limits use of the KMS key to requests that originate from AgentCore payments and are routed through Forward Access Sessions (FAS). Add the following condition to restrict the caller’s FAS statement:

```
"Condition": {
  "StringEquals": {
    "kms:ViaService": "bedrock-agentcore.us-west-2.amazonaws.com"
  }
}
```

This condition makes sure that the key can only be used when the request originates from AgentCore payments in the specified Region.

**Note**  
The `kms:ViaService` condition applies only to the FAS authorization check (the caller’s statement). It doesn’t apply to the execution role’s statement because the execution role calls KMS directly, not through FAS.

## Monitoring AgentCore payments interaction with AWS KMS
<a name="payments-encryption-monitoring"></a>

You can use AWS CloudTrail to monitor the KMS API calls that AgentCore payments makes on your behalf. The following events appear in your CloudTrail logs:


| Event name | When it occurs | Initiated by | 
| --- | --- | --- | 
|  `DescribeKey`  | When you create or update a payment manager with a customer managed key (FAS authorization check) | Caller’s FAS credentials | 
|  `GenerateDataKey`  | When you create or update a payment manager with a customer managed key (FAS authorization check); when the service encrypts fields | Caller’s FAS credentials (auth check); Execution role (encryption) | 
|  `Decrypt`  | When you create or update a payment manager with a customer managed key (FAS authorization check); when the service decrypts fields | Caller’s FAS credentials (auth check); Execution role (decryption) | 

In CloudTrail, FAS-initiated events show:
+  **userIdentity.invokedBy:** The caller’s identity
+  **requestParameters.encryptionContext:** `{"aws:payments-manager:arn": "<payment-manager-arn>"}` 

Events initiated by the execution role show:
+  **userIdentity.arn:** The execution role ARN
+  **requestParameters.encryptionContext:** `{"aws:payments-manager:arn": "<payment-manager-arn>"}` 

For more information about monitoring KMS API calls, see [Logging AWS KMS API calls with AWS CloudTrail](https://docs.aws.amazon.com/kms/latest/developerguide/logging-using-cloudtrail.html) in the * AWS Key Management Service Developer Guide*.

## What happens when the key is unavailable
<a name="payments-encryption-key-unavailable"></a>

If your customer managed key becomes unavailable (disabled, scheduled for deletion, or permissions revoked), AgentCore payments handles it in the following way:


| Operation | Behavior | 
| --- | --- | 
|  `GetPaymentManager`  | Returns an error that indicates the key can’t be accessed | 
|  `ListPaymentManagers`  | Returns the manager with encrypted fields set to `[UNAVAILABLE]`  | 
|  `CreatePaymentConnector`  | Fails because connector fields can’t be encrypted | 
|  `GetPaymentConnector`  | Returns an error that indicates the key can’t be accessed | 
|  `ListPaymentConnectors`  | Returns connectors with encrypted fields set to `[UNAVAILABLE]`  | 
|  `DeletePaymentManager`  | Succeeds because deletion doesn’t require decryption | 
|  `DeletePaymentConnector`  | Succeeds because deletion doesn’t require decryption | 

To restore access, re-enable the key or restore the required permissions on the execution role.