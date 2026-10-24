

# Direct code deployment for Python
<a name="runtime-get-started-code-deploy-python"></a>

With direct code deployment, you package your Python agent code and its dependencies in a .zip file archive and deploy it to AgentCore Runtime. Your agent still needs to follow [AgentCore Runtime requirements](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-service-contract.html) : have an entrypoint .py file that either uses the `@app.entrypoint` annotation from [Amazon Bedrock AgentCore Python SDK](https://github.com/aws/bedrock-agentcore-sdk-python) or implements `/invocations` POST and `/ping` GET server endpoints.

This page includes a concise AgentCore CLI path and detailed instructions for packaging and deploying the .zip file manually with `uv`, Boto3, or the AWS Management Console. For the complete CLI workflow, see [Get started with AgentCore Runtime using the AgentCore CLI](runtime-get-started-cli.md).

## Prerequisites
<a name="runtime-code-deploy-python-prerequisites"></a>

Before you begin, ensure you have:
+  ** AWS Account** with credentials configured. To configure your AWS credentials, see [Configuration and credential file settings in the AWS CLI.](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) 
+  [Uv](https://docs.astral.sh/uv/getting-started/installation/) **installed** and [Python 3.10\+](https://docs.astral.sh/uv/guides/install-python/) installed
+  ** AWS Permissions** : To create and deploy an agent, you must have appropriate permissions. For more information, see [AgentCore Runtime permissions](runtime-permissions.md).
+  **Model access** : Amazon Bedrock enables access to foundation models by default. To use a non-foundation model, follow the [model access steps](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html#model-access-sdk-step4).
+ An existing Python agent with a `main.py` entry point and a `pyproject.toml` file that declares its dependencies.

## Step 1: Prepare and test your Python agent
<a name="step-1-setup"></a>

Your project should contain the files that you will add to the deployment package:

```
my-agent/
├── main.py
└── pyproject.toml
```

Run the agent locally using the command for your application. For an entry point that starts its server from `main.py`, run:

```
uv run main.py
```

In another terminal, test the `/invocations` endpoint:

```
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello!"}'
```

 **Success:** You should see a response like `{"result": "Hello! I’m here to help…​"}` . In the terminal window that’s running the agent, enter `Ctrl+C` to stop the agent.

Optionally, run `uv add aws-opentelemetry-distro` to enable [Amazon Bedrock AgentCore observability traces](https://docs.aws.amazon.com/xray/latest/devguide/xray-services-adot.html).

## Step 2: Enable observability for your agent
<a name="step-4-enable-observability"></a>

 [Amazon Bedrock AgentCore Observability](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability.html) helps you trace, debug, and monitor agents that you host in AgentCore Runtime. First enable CloudWatch Transaction Search by following the instructions at [Enabling Amazon Bedrock AgentCore runtime observability](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-configure.html#observability-configure-builtin) . To observe your agent, see [View observability data for your Amazon Bedrock AgentCore agents](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-view.html).

## Step 3: Package, deploy, and invoke
<a name="step-5-deploy"></a>

Package and deploy your agent using one of the following methods:

**Example**  

1. For a CLI-managed `CodeZip` project, the AgentCore CLI packages and deploys the project for you. To deploy your existing agent with the AgentCore CLI, create a project from the minimal template:

   ```
   agentcore create --name DirectDeployProject --template agent-python-minimal
   cd DirectDeployProject
   ```

   Copy your `main.py` and `pyproject.toml` into `app/agent/`, replacing the generated files. Then deploy the project:

   ```
   agentcore deploy
   ```

   Optionally, run `agentcore build` first to synthesize and check the project without deploying.

   Invoke the deployed Runtime:

   ```
   agentcore invoke --runtime agent \
     --payload '{"prompt":"Hello!"}'
   ```

   You can also run `agentcore` with no arguments to open the interactive terminal UI, then choose **deploy** to watch deployment progress. For local testing, see [Get started with AgentCore Runtime using the AgentCore CLI](runtime-get-started-cli.md).

1. To download a wheel that’s compatible with AgentCore Runtime, you use the uv pip `--python-platform` option. AgentCore Runtime supports only the **arm64** architecture. Run the following command, and replace `3.13` in `--python-version` with your Python version.

   ```
   uv pip install \
   --python-platform aarch64-manylinux2014 \
   --python-version 3.13 \
   --target=deployment_package \
   --only-binary=:all: \
   -r pyproject.toml
   ```

   Create a .zip file with the installed libraries at the project root.

   ```
   cd deployment_package
   zip -r ../deployment_package.zip .
   ```

   Add the `main.py` file and other files in your package to the root of the .zip file.

   ```
   cd ..
   zip deployment_package.zip main.py
   ```

   After you have created your .zip deployment package, you can use it to create a new AgentCore Runtime or update an existing one. You can deploy your .zip package using the AgentCore Runtime API, the AgentCore Runtime console, or the AWS Command Line Interface.
**Note**  
The maximum size for a .zip deployment package for AgentCore Runtime is 250 MB (zipped) and 750 MB (unzipped). This limit applies to the combined size of all the files you upload.
**Note**  
The AgentCore Runtime needs permission to read the files in your deployment package. In Linux permissions octal notation, AgentCore Runtime needs 644 permissions for non-executable files (rw-r—​r--) and 755 permissions (rwxr-xr-x) for directories and executable files. In Linux and MacOS, use the `chmod` command to change file permissions on files and directories in your deployment package. For example, to give a non-executable file the correct permissions, run `chmod 644 <filepath>`. To change file permissions in Windows, see [Set, View, Change, or Remove Permissions on an Object](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc731667(v=ws.10)) in the Microsoft Windows documentation. If you don’t grant AgentCore Runtime the permissions it needs to access directories in your deployment package, AgentCore Runtime sets the permissions for those directories to 755 (rwxr-xr-x).

   A ZIP archive containing Linux **arm64** dependencies needs to be uploaded to S3 as a pre-requisite to Create Agent Runtime. The below code requires the specified S3 bucket to already exist. To create a bucket, see [create\_bucket](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/client/create_bucket.html) in the Boto3 documentation. Following boto3 code will upload .zip file archive to a s3 and create Amazon Bedrock AgentCore runtime.

   ```
   import boto3
   
   account_id = "your aws account id"
   agent_name = "strands_10_23"
   
   s3_client = boto3.client('s3', region_name='us-west-2')
   print("Uploading deployment.zip to S3...")
   s3_client.upload_file(
       'deployment_package.zip', # archive on file system
       f"bedrock-agentcore-code-{account_id}-us-west-2", # bucket name
       f"{agent_name}/deployment_package.zip", # prefix
       ExtraArgs={'ExpectedBucketOwner': account_id} # ownership check
   )
   print("Upload completed successfully!")
   print(f"S3 Location: s3://bedrock-agentcore-code-{account_id}-us-west-2/{agent_name}/deployment_package.zip")
   
   agentcore_client = boto3.client('bedrock-agentcore-control', region_name='us-west-2')
   response = agentcore_client.create_agent_runtime(
       agentRuntimeName=agent_name,
       agentRuntimeArtifact={
           'codeConfiguration': {
               'code': {
                   's3': {
                       'bucket': f"bedrock-agentcore-code-{account_id}-us-west-2",
                       'prefix': f"{agent_name}/deployment_package.zip"
                   }
               },
               'runtime': 'PYTHON_3_13',
               'entryPoint': ['opentelemetry-instrument', 'main.py']
           } # if not adding otel dependency, remove opentelemetry-instrument from entrypoint array
       },
       networkConfiguration={"networkMode": "PUBLIC"},
       roleArn=f"arn:aws:iam::{account_id}:role/AmazonBedrockAgentCoreSDKRuntime-us-west-2",
       lifecycleConfiguration={
           'idleRuntimeSessionTimeout': 300,  # 5 min, configurable
           'maxLifetime': 1800                # 30 minutes, configurable
       },
   )
   print(f"Agent Runtime created successfully!")
   print(f"Agent Runtime ARN: {response['agentRuntimeArn']}")
   print(f"Status: {response['status']}")
   ```

   For more information about invoking an agent programmatically, see [Invoke streaming agents](runtime-invoke-agent.md#runtime-invoke-streaming-example).

1. You can deploy your agent using the Amazon Bedrock AgentCore console with managed runtime support.

   To deploy using the console, first create your deployment package following the steps in the *Boto3* tab above.

    **Create agent through console** 

   To create your agent:

1. From the Agents home page, choose **Host Agent** 

1. Choose your source selection:
   +  **S3 Source** - Upload from S3 bucket
   +  **Local Upload** - Upload ZIP file from your computer
   +  **Templates** - Use pre-built agent templates

1. Configure your agent settings:
   + Agent name
   + Runtime version (Python 3.13 recommended)
   + Entry point (e.g., `main.py` )
   + Execution role (create new or use existing)

1. Choose **Create Agent** to deploy

    **Create endpoint** 

   Choose **Create Endpoint** to create a new endpoint for your agent. The endpoint name and associated version will be pre-filled.

    **Test endpoint** 

   Select an endpoint and choose **Test Endpoint** to navigate to the Playground/Sandbox for testing.

    **Execution role requirements** 

   Your agent requires an execution role with appropriate permissions. For detailed information about execution roles and permissions, see [AgentCore Runtime permissions](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-permissions.html) . The execution role must include basic Amazon Bedrock AgentCore runtime permissions, S3 access permissions for your deployment package, and CloudWatch Logs permissions for observability.

## Step 4: Stop a session, update, or clean up
<a name="step-6-update-cleanup"></a>

Stop your runtime session, update, or cleanup your agent using one of the following methods:

**Example**  

1. Deploy the project again to update the Runtime:

   ```
   agentcore deploy
   ```

   To delete the project’s deployed resources, remove the resources from the project and deploy the updated configuration:

   ```
   agentcore remove all --yes
   agentcore deploy --yes
   ```

   To stop an active Runtime session, use the [StopRuntimeSession](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_StopRuntimeSession.html) API operation.

1. Following boto3 code will update an AgentCore Runtime.

   ```
   import boto3
   
   account_id = "your aws account id"
   agent_name = "strands_10_23"
   
   s3_client = boto3.client('s3', region_name='us-west-2')
   print("Uploading deployment.zip to S3...")
   s3_client.upload_file(
       'deployment_package.zip', # archive on file system
       f"bedrock-agentcore-code-{account_id}-us-west-2", # bucket name
       f"{agent_name}/deployment_package.zip", # prefix
       ExtraArgs={'ExpectedBucketOwner': account_id} # ownership check
   )
   print("Upload completed successfully!")
   print(f"S3 Location: s3://bedrock-agentcore-code-{account_id}-us-west-2/{agent_name}/deployment_package.zip")
   
   bedrock_agentcore_client = boto3.client('bedrock-agentcore-control', region_name='us-west-2')
   response = bedrock_agentcore_client.update_agent_runtime(
       agentRuntimeId='<your-agent-id>',
       agentRuntimeArtifact={
           'codeConfiguration': {
               'code': {
                   's3': {
                       'bucket': f"bedrock-agentcore-code-{account_id}-us-west-2",
                       'prefix': f"{agent_name}/deployment_package.zip"
                   }
               },
               'runtime': 'PYTHON_3_13',
               'entryPoint': ['opentelemetry-instrument', 'main.py']
           } # if not adding otel dependency, remove opentelemetry-instrument from entrypoint array
       },
       networkConfiguration={"networkMode": "PUBLIC"},
       roleArn=f"arn:aws:iam::{account_id}:role/AmazonBedrockAgentCoreSDKRuntime-us-west-2"
   )
   
   print(f"Agent Runtime updated successfully!")
   print(f"Agent Runtime ARN: {response['agentRuntimeArn']}")
   print(f"Status: {response['status']}")
   ```

   To stop the running session before the configurable `IdleRuntimeSessionTimeout` (defaulted at 15 minutes) and save on any potential runaway costs, use the following boto3 code:

   ```
   import boto3
   
   agent_core_client = boto3.client('bedrock-agentcore', region_name='us-west-2')
   response = agent_core_client.stop_runtime_session(
       agentRuntimeArn='arn:aws:bedrock-agentcore:us-west-2:account-id:runtime/agent-name-suffix',
       runtimeSessionId='your-session-id',
       qualifier="DEFAULT"
   )
   ```

   Following boto3 code will delete Amazon Bedrock AgentCore runtime and .zip archive file in s3.

   ```
   import boto3
   
   account_id = "your aws account id"
   agent_name = "strands_10_23"
   
   bedrock_agentcore_client = boto3.client('bedrock-agentcore-control', region_name='us-west-2')
   print("Deleting Agent from Amazon Bedrock AgentCore Runtime!")
   response = bedrock_agentcore_client.delete_agent_runtime(
       agentRuntimeId='<agent-id>'
   )
   print(f"Agent Runtime delete successfully!")
   print(f"Status: {response['status']}")
   
   s3_client = boto3.client('s3', region_name='us-west-2')
   print("Deleting deployment archive from S3...")
   s3_client.delete_object(
       Bucket=f"bedrock-agentcore-code-{account_id}-us-west-2",
       Key=f"{agent_name}/deployment_package.zip",
       ExpectedBucketOwner=account_id
   )
   print("Archive deleted successfully from S3!")
   ```

1.  **Update agent** 

   From the Agent details page, choose **Update hosting** to create a new version with updated code or configuration.

    **Update endpoint** 

   Select an endpoint from the Endpoints table and choose **Edit** to update the description or associated version.

    **Delete endpoint** 

   Select an endpoint and choose **Delete** . You’ll need to type "delete" to confirm the deletion.

    **Delete agent** 

   From the agent list or details page, select your agent and choose **Delete** to remove the agent and all associated resources.

## Python-specific concepts for direct code deployment
<a name="runtime-code-deploy-python-concepts"></a>

Learn about Python-specific concepts when using direct code deployment with Amazon Bedrock AgentCore Runtime.

**Topics**

### Dependency search path and runtime-included libraries
<a name="concept-dependency-search"></a>

When you use an `import` statement in your code, the Python runtime searches the directories in its search path until it finds the module or package. By default, the first location the runtime searches is the directory into which your .zip deployment package is decompressed and mounted ( `/var/task` ).

You can see the full search path for your AgentCore Runtime agent by adding the following code snippet.

```
import sys
search_path = sys.path
print(search_path)
```

You can also add dependencies in a separate folder inside your .zip package. For example, you might add a version of the Boto3 SDK to a folder in your .zip package called `common` . When your .zip package is decompressed and mounted, this folder is placed inside the `/var/task` directory. To use a dependency from a folder in your .zip deployment package in your code, use an `import from` statement. For example, to use a version of Boto3 from a folder named `common` in your .zip package, use the following statement.

```
from common import boto3
```

### Python bytecode and *pycache* folders
<a name="concept-pycache"></a>

We recommend that you don’t include ` pycache ` folders in your agent’s deployment package. Python bytecode that’s compiled on a build machine with a different architecture or operating system might not be compatible with the AgentCore Runtime execution environment.

### Deployment packages with native libraries
<a name="concept-native-libraries"></a>

If your function uses only pure Python packages and modules, you can use the `uv pip install` command to install your dependencies on any local build machine and create your .zip file. Many popular Python libraries, including NumPy and Pandas, are not pure Python and contain code written in C or C. When you add libraries containing C/C code to your deployment package, you must build your package correctly to make it compatible with the AgentCore Runtime execution environment.

Most packages available on the Python Package Index ( [PyPI](https://pypi.org/) ) are available as "wheels" (.whl files). A .whl file is a type of ZIP file which contains a built distribution with pre-compiled binaries for a particular operating system and instruction set architecture. To make your deployment package compatible with Amazon Bedrock AgentCore Runtime, you install the wheel for Linux operating systems and **arm64** instruction set architecture.

Some packages may only be available as source distributions. For these packages, you need to compile and build the C/C\+\+ components yourself.

To see what distributions are available for your required package, do the following:

1. Search for the name of the package on the [Python Package Index main page](https://pypi.org/).

1. Choose the version of the package you want to use.

1. Choose **Download files**.

### Working with source distributions
<a name="concept-source-distributions"></a>

If your package is only available as a source distribution, you need to build the C/C\+\+ libraries yourself. To make your package compatible with the Amazon Bedrock AgentCore Runtime execution environment, you need to build it in an environment that uses the same Amazon Linux operating system with **arm64** instruction set. You can do this by building your package in an Amazon Elastic Compute Cloud (Amazon EC2) Linux instance.

To learn how to launch and connect to an Amazon EC2 Linux instance, see [Get started with Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html) in the *Amazon EC2 User Guide*.