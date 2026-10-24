

# Customize the project’s CDK code
<a name="customize-project-cdk-code"></a>

The AgentCore CLI manages your project’s AWS resources with AWS CDK constructs from the `@aws/agentcore-cdk` package. The resources you declare in `agentcore/agentcore.json` are created by the `AgentCoreApplication` construct. To add other AWS resources, permissions, or configuration, edit the generated CDK stack in `agentcore/cdk/lib/cdk-stack.ts`.

The generated `AgentCoreStack` creates `this.application`, an `AgentCoreApplication`. Its `runtime(name)` and `harness(name)` accessors return the workloads declared in your project, so you can wire your own resources to them. Add your resources in the constructor, after the line that creates `this.application`.

## Add resources to the generated stack
<a name="customize-project-cdk-code-add-resources"></a>

This example adds an Amazon DynamoDB table for a Runtime named `agent`, grants the Runtime access to the table, and passes the table name to the Runtime as an environment variable.

Add the DynamoDB import at the top of `cdk-stack.ts`:

```
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
```

Add the resource and grants in the constructor, after the line that creates `this.application`:

```
const orders = new dynamodb.Table(this, 'Orders', {
  partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
});
const agent = this.application.runtime('agent');
agent.grantReadWrite(orders);
agent.addEnvironmentVariable('ORDERS_TABLE', orders.tableName);
```

The DynamoDB table becomes part of the same AWS CloudFormation stack as the AgentCore project. The `grantReadWrite` method adds the required permissions to the Runtime’s execution role, and your application code reads the discovery value from the `ORDERS_TABLE` environment variable.

To wire a resource to a Harness instead of a Runtime, use `this.application.harness('<harness-name>')`.

## Grant permissions and pass configuration
<a name="customize-project-cdk-code-grant-permissions"></a>

Runtimes and harnesses provide the following methods:
+  `grantRead`, `grantWrite`, and `grantReadWrite` for the AWS resources that support them.
+  `addEnvironmentVariable` to pass a discovery value, such as a resource name or ARN, to the workload.

Runtimes and harnesses also implement the AWS CDK `iam.IGrantable` interface, so you can pass them to standard AWS CDK L2 grant methods:

```
orders.grantReadData(this.application.harness('support'));
```

If a workload uses an imported execution role (`executionRoleArn`), CDK cannot attach permissions to that immutable role. Its owner must add the required permissions. Resources that you add directly to the CDK stack are managed by CloudFormation but do not appear in `agentcore status`, which reports only the resources declared in `agentcore.json`.

## Deploy your changes
<a name="customize-project-cdk-code-deploy"></a>

From the project root, synthesize the updated stack and deploy it:

```
agentcore build
agentcore deploy
```