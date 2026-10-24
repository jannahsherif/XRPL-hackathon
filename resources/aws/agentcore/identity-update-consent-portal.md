

# Update a consent portal
<a name="identity-update-consent-portal"></a>

You can update an existing consent portal from the AgentCore console or with the AWS CLI. You can change the execution role, the IdP credential configurations (the identity provider credential provider, scopes, and audiences), and the description. The consent portal name and the attached gateway are set when you create the portal and can’t be changed.

**Note**  
When you change the scopes, the list must include the `openid` scope. A consent portal always requests `openid` in addition to the scopes you configure, and every configured scope, plus `openid`, must be defined and permitted on the IdP, or authorization fails with an `invalid_scope` error.

When you update the IdP credential configurations, the consent portal transitions to the `UPDATING` status while AWS applies the change, and then returns to `ACTIVE`. If the update fails, the portal transitions to `UPDATE_FAILED`; view the status reason on the consent portal details to diagnose the problem.

## Update a consent portal with the console
<a name="update-consent-portal-console"></a>

 **To update a consent portal** 

1. Open the [AgentCore](https://console.aws.amazon.com/bedrock-agentcore/home#) console.

1. From the left navigation pane, choose **Identity**.

1. Select the consent portal that you want to update.

1. On the consent portal page, choose **Edit**.

1. Update the information as needed:

   1. In the **IdP credential configurations** section, change the **IdP credential provider**, **Scopes**, or **Audiences**. The identity provider is editable.

   1. In the **Permissions** section, change the execution role under **IAM Permissions**.

   1. (Optional) Update the **Description**.
**Note**  
The attached **Gateway** is shown on the page but is not editable. To use a different gateway, delete the consent portal and create a new one.

1. Choose **Save** to apply your changes.

## Update a consent portal with the AWS CLI
<a name="update-consent-portal-cli"></a>

Update a consent portal with the `update-consent-portal` command. Identify the consent portal with the required `--consent-portal-identifier` parameter, which accepts either the consent portal ID or its full ARN. You can update the `executionRoleArn`, the `idpConfig`, and the `description`. The `name` and `sources` of a consent portal are not updatable.

The following command updates the execution role of a consent portal. Replace the {{highlighted}} values with your own.

```
aws bedrock-agentcore-control update-consent-portal \
    --consent-portal-identifier "<consent-portal-id>" \
    --execution-role-arn "arn:aws:iam::<account-id>:role/<execution-role-name>"
```