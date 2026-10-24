

# Get started with Instances using the console
<a name="runtime-instances-get-started-console"></a>

This tutorial walks through hosting an agent on the **Instances** compute type using the AWS Management Console. You first create a [capacity provider](runtime-instances-how-it-works.md#runtime-instances-capacity-provider) that defines the EC2 infrastructure, then create an agent runtime that uses it, and finally invoke and monitor the agent.

For the prerequisites, see [Get started with Instances](runtime-instances-getting-started.md).

## Step 1: Create a capacity provider
<a name="runtime-instances-console-create-cp"></a>

1. Open the Amazon Bedrock AgentCore console and choose **Runtime**.

1. On the **Capacity providers** tab, choose **Create capacity provider**.

1. Under **Capacity provider detail**, enter a **Name**. Valid characters are letters, digits, and underscores; the name must start with a letter and can have up to 48 characters.

1. For **Operating system**, choose the operating system for your EC2 instances (for example, **Linux (64-bit x86)**). This determines which software and applications are compatible with your environment.

1. For **Allowed instance types**, choose up to 30 EC2 instance types that meet your workload requirements. Filter by vCPU, memory, and CPU manufacturer to find a match.

1. Under **Security**, choose the **VPC** that controls network access for your instances. Optionally, configure subnets and the container network mode under **Additional details**.

1. (Optional) Under **Storage configuration**, choose **Add volume** to attach an Amazon EBS volume for persistent storage. Configure the volume type, size, throughput, IOPS, and encryption. This saves the volume configuration; AgentCore creates each volume on the session’s first launch.

1. Under **Service access**, choose the instance profile attached to the EC2 instance (used by AgentCore to collect system logs; it does not grant permissions to your agent code) and the **Infrastructure role** (used by AgentCore to manage EC2 instances on your behalf). You can use existing roles or let the console create new ones.

1. Choose **Create capacity provider**. The capacity provider starts in a `CREATING` state and becomes `ACTIVE` after its configuration is validated.

**Note**  
After a capacity provider is created, only its description can be edited. To change other configurations such as instance types, networking, or storage, duplicate the capacity provider and make your updates in the duplicate flow.

## Step 2: Create an agent runtime that uses the capacity provider
<a name="runtime-instances-console-create-runtime"></a>

1. On the **Runtime** page, choose **Create runtime** (or, from the capacity provider’s detail page, choose **Host agent/tool**).

1. Enter a **Name** for the agent or tool.

1. For **Compute type**, choose **Instances**.

1. For **Capacity provider**, choose an existing capacity provider, or choose **Quick create** to create one with pre-configured defaults inline.

1. Under **Agent/tool source**, choose your source type and provide the artifact:
   +  **S3 source** – Start from a template, upload a `.zip` file, or choose an existing object in an S3 bucket.
   +  **ECR container** – Provide an Amazon ECR container image URI.

1. (Optional) Configure **Inbound auth**, **Advanced configurations** (security, environment variables), and **Permissions** (IAM execution role and KMS encryption).

1. Choose **Create runtime**. AgentCore creates version 1 and a `DEFAULT` endpoint that points to it.

**Note**  
You can’t change the compute type after you create the runtime.

## Step 3: Invoke and monitor
<a name="runtime-instances-console-invoke"></a>

1. From the runtime’s detail page, choose **Test** and provide a payload, or use the **View invocation code** snippet to call the agent from your own application.

1. The first invocation for a new session provisions an EC2 instance in your account and launches the agent, so it typically takes longer than later invocations. Subsequent invocations to the same session are much faster. AgentCore provisions the instance as an [Amazon EC2 managed instance](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-ec2-managed-instances.html), which is hidden from your EC2 console views and `DescribeInstances` by default. For more information about managed instance visibility, see the [managed resource visibility setting](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-ec2-managed-instances.html#managed-resource-visibility-settings).

1. Use the **Observability** metrics and **Logs and tracing** on the runtime’s detail page to monitor sessions, invocations, error rate, and resource consumption.

## Step 4: Clean up
<a name="runtime-instances-console-cleanup"></a>

To avoid ongoing charges for the Amazon EC2 instances and Amazon EBS volumes provisioned in your account, clean up the resources you created for this tutorial when you’re done:

1. Delete the session so that AgentCore deprovisions the EC2 instance and its persistent volumes. Stopping a single agent runtime on a session does not terminate the instance. For more information about the API operations, see [Get started with Instances using the AWS CLI or SDK](runtime-instances-get-started-cli.md).

1. Disassociate the runtime from the capacity provider by deleting the runtime, its endpoints, or its versions.

1. Delete the capacity provider once no runtimes reference it.

## Next steps
<a name="runtime-instances-console-next-steps"></a>
+  [Instances](runtime-instances-how-it-works.md) 
+  [Compare compute types](runtime-instances-how-it-works.md#runtime-instances-compute-comparison) 
+  [Security model and permissions for Runtime Instances](runtime-instances-security.md) 