

# Get started without the AgentCore CLI
<a name="getting-started-custom"></a>

You can create an AgentCore Runtime agent without the AgentCore CLI. Instead, you can use a combination of command line tools to configure and deploy your agent to an AgentCore Runtime. If you prefer a CLI-managed workflow, see [Get started with AgentCore Runtime using the AgentCore CLI](runtime-get-started-cli.md).

This tutorial shows how to deploy a custom agent without using the AgentCore CLI. A custom agent is an agent built without using the AgentCore Python SDK. In this tutorial, the custom agent is built using FastAPI and Docker. The custom agent follows the [AgentCore Runtime requirements](runtime-service-contract.md) , meaning the agent must expose `/invocations` POST and `/ping` GET endpoints and be packaged in a Docker container. Amazon Bedrock AgentCore requires ARM64 architecture for all deployed agents.

**Note**  
You can also use this approach for agents that you build with the AgentCore Python SDK.

## Quick start setup
<a name="quick-start-setup"></a>

### Enable observability for your agent
<a name="runtime-enable-observability-custom"></a>

 [Amazon Bedrock AgentCore Observability](observability.md) helps you trace, debug, and monitor agents that you host in AgentCore Runtime. To observe an agent, first enable CloudWatch Transaction Search by following the instructions at [Enabling AgentCore observability](observability-configure.md#observability-configure-builtin).

### Install uv
<a name="install-uv"></a>

For this example, we’ll use the `uv` package manager, though you can use any Python utility or package manager. To install `uv` on macOS:

```
curl -LsSf https://astral.sh/uv/install.sh | sh
```

For installation instructions on other platforms, refer to the [uv documentation](https://docs.astral.sh/uv/getting-started/installation/).

### Create your agent project
<a name="create-agent-project"></a>

<a name="create-agent-project"></a> **Setting up your project** 

1. Create and navigate to your project directory:

   ```
   mkdir my-custom-agent && cd my-custom-agent
   ```

1. Initialize the project with Python 3.11:

   ```
   uv init --python 3.11
   ```

1. Add the required dependencies (uv automatically creates a .venv):

   ```
   uv add fastapi 'uvicorn[standard]' pydantic httpx strands-agents
   ```

## Agent contract requirements
<a name="agent-contract-requirements"></a>

Your custom agent must fulfill these core requirements:
+  **/invocations Endpoint** : POST endpoint for agent interactions (REQUIRED)
+  **/ping Endpoint** : GET endpoint for health checks (REQUIRED)
+  **Docker Container** : ARM64 containerized deployment package

## Project structure
<a name="project-structure"></a>

 **Note:** For convenience, the example below uses **FastAPI Server** as the Web server framework for handling requests.

Your project should have the following structure:

```
my-custom-agent/
├── agent.py                 # FastAPI application
├── Dockerfile               # ARM64 container configuration
├── pyproject.toml           # Created by uv init
└── uv.lock                  # Created automatically by uv
```

## Complete strands agent example
<a name="complete-strands-agent-example"></a>

Create `agent.py` in your project root with the following content:

 **Example agent.py** 

```
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime
from strands import Agent

app = FastAPI(title="Strands Agent Server", version="1.0.0")

# Initialize Strands agent
strands_agent = Agent()

class InvocationRequest(BaseModel):
    input: Dict[str, Any]

class InvocationResponse(BaseModel):
    output: Dict[str, Any]

@app.post("/invocations", response_model=InvocationResponse)
async def invoke_agent(request: InvocationRequest):
    try:
        user_message = request.input.get("prompt", "")
        if not isinstance(user_message, str) or not user_message.strip():
            raise HTTPException(
                status_code=400,
                detail="Invalid input: 'prompt' must be a non-empty string"
            )

        result = strands_agent(user_message)
        response = {
            "message": result.message,
            "timestamp": datetime.utcnow().isoformat()
        }

        return InvocationResponse(output=response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent processing failed: {str(e)}")

@app.get("/ping")
async def ping():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

This implementation:
+ Creates a FastAPI application with the required endpoints
+ Initializes a Strands agent for processing user messages
+ Implements the `/invocations` POST endpoint for agent interactions
+ Implements the `/ping` GET endpoint for health checks
+ Configures the server to run on host `0.0.0.0` and port `8080` 

## Test locally
<a name="test-locally"></a>

<a name="test-locally"></a> **Testing your agent** 

1. Run the application:

   ```
   uv run uvicorn agent:app --host 0.0.0.0 --port 8080
   ```

1. Test the `/ping` endpoint (in another terminal):

   ```
   curl http://localhost:8080/ping
   ```

1. Test the `/invocations` endpoint:

   ```
   curl -X POST http://localhost:8080/invocations \
     -H "Content-Type: application/json" \
     -d '{
       "input": {"prompt": "What is artificial intelligence?"}
     }'
   ```

## Create dockerfile
<a name="create-dockerfile"></a>

Create `Dockerfile` in your project root with the following content:

 **Example Dockerfile** 

```
# Use uv's ARM64 Python base image
FROM --platform=linux/arm64 ghcr.io/astral-sh/uv:python3.11-bookworm-slim

WORKDIR /app

# Copy uv files
COPY pyproject.toml uv.lock ./

# Install dependencies (including strands-agents)
RUN uv sync --frozen --no-cache

# Copy agent file
COPY agent.py ./

# Expose port
EXPOSE 8080

# Run application
CMD ["uv", "run", "uvicorn", "agent:app", "--host", "0.0.0.0", "--port", "8080"]
```

This Dockerfile:
+ Uses an ARM64 Python base image (required by Amazon Bedrock AgentCore)
+ Sets up the working directory
+ Copies the dependency files and installs dependencies
+ Copies the agent code
+ Exposes port 8080
+ Configures the command to run the application

## Build and deploy ARM64 image
<a name="build-and-deploy-arm64-image"></a>

### Setup docker buildx
<a name="setup-docker-buildx"></a>

Docker buildx lets you build images for different architectures. Set it up with:

```
docker buildx create --use
```

### Build for ARM64 and test locally
<a name="build-for-arm64-and-test-locally"></a>

<a name="build-for-arm64-and-test-locally"></a> **Building and testing your image** 

1. Build the image locally for testing:

   ```
   docker buildx build --platform linux/arm64 -t my-agent:arm64 --load .
   ```

1. Test locally with credentials (Strands agents need AWS credentials):

   ```
   docker run --platform linux/arm64 -p 8080:8080 \
     -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
     -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
     -e AWS_SESSION_TOKEN="$AWS_SESSION_TOKEN" \
     -e AWS_REGION="$AWS_REGION" \
     my-agent:arm64
   ```

### Create ECR repository and deploy
<a name="create-ecr-repository-and-deploy"></a>

<a name="create-ecr-repository-and-deploy"></a> **Deploying to ECR** 

1. Create an ECR repository:

   ```
   aws ecr create-repository --repository-name my-strands-agent --region us-west-2
   ```

1. Log in to ECR:

   ```
   aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin account-id.dkr.ecr.us-west-2.amazonaws.com
   ```

1. Build and push to ECR:

   ```
   docker buildx build --platform linux/arm64 -t account-id.dkr.ecr.us-west-2.amazonaws.com/my-strands-agent:latest --push .
   ```

1. Verify the image was pushed:

   ```
   aws ecr describe-images --repository-name my-strands-agent --region us-west-2
   ```

## Deploy agent runtime
<a name="deploy-agent-runtime"></a>

Create a file named `deploy_agent.py` with the following content:

 **Example deploy\_agent.py** 

```
import boto3

client = boto3.client('bedrock-agentcore-control', region_name='us-west-2')

response = client.create_agent_runtime(
    agentRuntimeName='strands_agent',
    agentRuntimeArtifact={
        'containerConfiguration': {
            'containerUri': 'account-id.dkr.ecr.us-west-2.amazonaws.com/my-strands-agent:latest'
        }
    },
    networkConfiguration={"networkMode": "PUBLIC"},
    roleArn='arn:aws:iam::account-id:role/AgentRuntimeRole',
    lifecycleConfiguration={
        'idleRuntimeSessionTimeout': 300,  # 5 min, configurable
        'maxLifetime': 1800                # 30 minutes, configurable
    },
)

print(f"Agent Runtime created successfully!")
print(f"Agent Runtime ARN: {response['agentRuntimeArn']}")
print(f"Status: {response['status']}")
```

Run the script to deploy your agent:

```
uv run deploy_agent.py
```

This script uses the `create_agent_runtime` operation to deploy your agent to Amazon Bedrock AgentCore. Make sure to replace {{account-id}} with your actual AWS account ID and ensure the IAM role has the necessary permissions. For more information, see [IAM Permissions for AgentCore Runtime](runtime-permissions.md).

## Invoke your agent
<a name="invoke-your-agent"></a>

Create a file named `invoke_agent.py` with the following content:

 **Example invoke\_agent.py** 

```
import boto3
import json

agent_core_client = boto3.client('bedrock-agentcore', region_name='us-west-2')
payload = json.dumps({
    "input": {"prompt": "Explain machine learning in simple terms"}
})

response = agent_core_client.invoke_agent_runtime(
    agentRuntimeArn='arn:aws:bedrock-agentcore:us-west-2:account-id:runtime/strands_agent-suffix',
    runtimeSessionId='dfmeoagmreaklgmrkleafremoigrmtesogmtrskhmtkrlshmt',  # Must be 33+ chars
    payload=payload,
    qualifier="DEFAULT"
)

response_body = response['response'].read()
response_data = json.loads(response_body)
print("Agent Response:", response_data)
```

Run the script to invoke your agent:

```
uv run invoke_agent.py
```

This script uses the [InvokeAgentRuntime](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_InvokeAgentRuntime.html) AWS SDK operation to send a request to your deployed agent. Replace the `agentRuntimeArn` value with the Agent Runtime ARN that `deploy_agent.py` printed.

If you plan on integrating your agent with OAuth, you can’t use the AWS SDK to call `InvokeAgentRuntime` . Instead, make a HTTPS request to InvokeAgentRuntime. For more information, see [Authenticate and authorize with Inbound Auth and Outbound Auth](runtime-oauth.md).

## Expected response format
<a name="expected-response-format"></a>

When you invoke your agent, you’ll receive a response like this:

 **Example Sample response** 

```
{
  "output": {
    "message": {
      "role": "assistant",
      "content": [
        {
          "text": "# Artificial Intelligence in Simple Terms\n\nArtificial Intelligence (AI) is technology that allows computers to do tasks that normally need human intelligence. Think of it as teaching machines to:\n\n- Learn from information (like how you learn from experience)\n- Make decisions based on what they've learned\n- Recognize patterns (like identifying faces in photos)\n- Understand language (like when I respond to your questions)\n\nInstead of following specific step-by-step instructions for every situation, AI systems can adapt to new information and improve over time.\n\nExamples you might use every day include voice assistants like Siri, recommendation systems on streaming services, and email spam filters that learn which messages are unwanted."
        }
      ]
    },
    "timestamp": "2025-07-13T01:48:06.740668"
  }
}
```

## Stop runtime session
<a name="stop-runtime-session"></a>

To stop the running session before the configurable `IdleRuntimeSessionTimeout` (defaulted at 15 minutes) and save on any potential runaway costs, execute: `stop_runtime_session` 

Create a file named `stop_runtime_session.py` with the following content:

 **Example stop\_runtime\_session.py** 

```
import boto3

agent_core_client = boto3.client('bedrock-agentcore', region_name='us-west-2')
response = agent_core_client.stop_runtime_session(
    agentRuntimeArn='arn:aws:bedrock-agentcore:us-west-2:account-id:runtime/strands_agent-suffix',
    runtimeSessionId='dfmeoagmreaklgmrkleafremoigrmtesogmtrskhmtkrlshmt',
    qualifier="DEFAULT"
)
```

## Amazon Bedrock AgentCore requirements summary
<a name="bedrock-agentcore-runtime-requirements"></a>
+  **Platform** : Must be `linux/arm64` 
+  **Endpoints** : `/invocations` POST and `/ping` GET are mandatory
+  **ECR** : Images must be deployed to ECR
+  **Port** : Application runs on port 8080
+  **Strands Integration** : Uses Strands Agent for AI processing
+  **Credentials** : Strands agents require AWS credentials for operation

## Conclusion
<a name="conclusion"></a>

In this guide, you’ve learned how to:
+ Set up a development environment for building custom agents
+ Create a FastAPI application that implements the required endpoints
+ Containerize your agent for ARM64 architecture
+ Test your agent locally
+ Deploy your agent to ECR
+ Create an agent runtime in Amazon Bedrock AgentCore
+ Invoke your deployed agent
+ Stop agent runtime session