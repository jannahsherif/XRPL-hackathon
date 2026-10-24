Terraform provisions the infrastructure your agent runs on as code, so each deployment is consistent and repeatable across cloud providers. This guide deploys a containerized Strands agent through one Terraform workflow, with a tab for each of four targets:

-   **AWS App Runner**: a containerized web service that scales automatically
-   **AWS Lambda**: serverless invocations for event-driven workloads
-   **Google Cloud Run**: managed serverless containers
-   **Azure Container Instances**: a single container with a public endpoint

Pick your target in the tabs below and follow the same steps end to end. The agent behind each target is the one you already built: only the packaging around it changes.

## Prerequisites

-   **Docker deployment guide completed** - You need a working containerized agent before proceeding:
    -   [Python Docker guide](/docs/user-guide/sdk/deploy/deploy_to_docker/python/index.md)
    -   [TypeScript Docker guide](/docs/user-guide/sdk/deploy/deploy_to_docker/typescript/index.md)
-   [Terraform](https://www.terraform.io/downloads.html) installed
-   Cloud provider CLI configured:
    -   AWS: [AWS CLI credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)
    -   GCP: [gcloud CLI](https://cloud.google.com/sdk/docs/install)
    -   Azure: [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

## Step 1: Container Registry Deployment

Cloud deployment requires your containerized agent to be available in a container registry. The following assumes you have completed the [Docker deployment guide](/docs/user-guide/sdk/deploy/deploy_to_docker/index.md) and pushed your image to the appropriate registry:

**Docker Tutorial Project Structure:**

Project Structure (Python):

```plaintext
my-python-app/
├── agent.py                # FastAPI application (from Docker tutorial)
├── Dockerfile              # Container configuration (from Docker tutorial)
├── pyproject.toml          # Created by uv init
├── uv.lock                 # Created automatically by uv
```

Project Structure (TypeScript):

```plaintext
my-typescript-app/
├── index.ts                # Express application (from Docker tutorial)
├── Dockerfile              # Container configuration (from Docker tutorial)
├── package.json            # Created by npm init
├── tsconfig.json           # TypeScript configuration
├── package-lock.json       # Created automatically by npm
```

**Deploy-specific Docker configurations**

(( tab "AWS App Runner" ))
**Image Requirements:**

-   Standard Docker images supported

**Container Registry Requirements:**

-   Amazon Elastic Container Registry ([See documentation to push Docker image to ECR](https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html))

**Docker Deployment Guide Modifications:**

-   No special base image required (standard Docker images work)
-   Ensure your app listens on port 8080 (or configure port in terraform)
-   Build with: `docker build --platform linux/amd64 -t my-agent .`
(( /tab "AWS App Runner" ))

(( tab "AWS Lambda" ))
**Image Requirements:**

-   Must use Lambda-compatible base images:
    -   Python: `public.ecr.aws/lambda/python:3.11`
    -   TypeScript/Node.js: `public.ecr.aws/lambda/nodejs:20`

**Container Registry Requirements:**

-   Amazon Elastic Container Registry ([See documentation to push Docker image to ECR](https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html))

**Docker Deployment Guide Modifications:**

-   Update Dockerfile base image to Lambda-compatible version
-   Change CMD to Lambda handler format: `CMD ["index.handler"]` or `CMD ["app.lambda_handler"]`
-   Build with Lambda flags: `docker build --platform linux/amd64 --provenance=false --sbom=false -t my-agent .`
-   Add Lambda handler to your code:
    -   **Python FastAPI (Recommended):** Use [Mangum](https://mangum.io/): `lambda_handler = Mangum(app)`
    -   **Manual handlers:** Accept `(event, context)` parameters and return Lambda-compatible responses

**Lambda Handler Examples:**

Python with Mangum:

```python
from mangum import Mangum
from your_app import app  # Your existing FastAPI app

lambda_handler = Mangum(app)
```

TypeScript:

```typescript
export const handler = async (event: any, context: any) => {
    // Your existing agent logic here
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Agent response" })
    };
};
```

Python:

```python
def lambda_handler(event, context):
    # Your existing agent logic here
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Agent response'})
    }
```
(( /tab "AWS Lambda" ))

(( tab "Google Cloud Run" ))
**Image Requirements:**

-   Standard Docker images supported

**Container Registry Requirements:**

-   Google Artifact Registry ([See documentation to push Docker image to GAR](https://cloud.google.com/container-registry/docs/pushing-and-pulling))

**Docker Deployment Guide Modifications:**

-   No special base image required (standard Docker images work)
-   Ensure your app listens on the port specified by `PORT` environment variable
-   Build with: `docker build --platform linux/amd64 -t my-agent .`
(( /tab "Google Cloud Run" ))

(( tab "Azure Container Instances" ))
**Image Requirements:**

-   Standard Docker images supported

**Container Registry Requirements:**

-   Azure Container Registry ([See documentation to push Docker image to ACR](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-get-started-docker-cli))

**Docker Deployment Guide Modifications:**

-   No special base image required (standard Docker images work)
-   Ensure your app exposes the correct port (typically 8080)
-   Build with: `docker build --platform linux/amd64 -t my-agent .`
(( /tab "Azure Container Instances" ))

## Step 2: Cloud Deployment Setup

Create a `terraform` directory, then add three files to it: `main.tf` defines the infrastructure, `variables.tf` declares the inputs, and `outputs.tf` exposes the deployed URL.

```bash
mkdir terraform
cd terraform
```

(( tab "AWS App Runner" ))
Create `main.tf`

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_iam_role" "apprunner_ecr_access_role" {
  name = "apprunner-ecr-access-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_ecr_access_policy" {
  role       = aws_iam_role.apprunner_ecr_access_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

resource "aws_apprunner_service" "agent" {
  service_name = "strands-agent"

  source_configuration {
    image_repository {
      image_identifier      = var.agent_image
      image_configuration {
        port = "8080"
        runtime_environment_variables = {
          OPENAI_API_KEY = var.openai_api_key
        }
      }
      image_repository_type = "ECR"
    }
    auto_deployments_enabled = false
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr_access_role.arn
    }
  }

  instance_configuration {
    cpu    = "0.25 vCPU"
    memory = "0.5 GB"
  }
}
```

Create `variables.tf`

```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "agent_image" {
  description = "Container image for Strands agent"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}
```

Create `outputs.tf`

```hcl
output "agent_url" {
  description = "AWS App Runner service URL"
  value       = aws_apprunner_service.agent.service_url
}
```
(( /tab "AWS App Runner" ))

(( tab "AWS Lambda" ))
Create `main.tf`

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_lambda_function" "agent" {
  function_name = "strands-agent"
  role          = aws_iam_role.lambda.arn
  image_uri     = var.agent_image
  package_type  = "Image"
  architectures = ["x86_64"]
  timeout       = 30
  memory_size   = 512

  environment {
    variables = {
      OPENAI_API_KEY = var.openai_api_key
    }
  }
}

resource "aws_lambda_function_url" "agent" {
  function_name      = aws_lambda_function.agent.function_name
  authorization_type = "NONE"
}

resource "aws_iam_role" "lambda" {
  name = "strands-agent-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
```

Create `variables.tf`

```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "agent_image" {
  description = "Container image for Strands agent"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}
```

Create `outputs.tf`

```hcl
output "agent_url" {
  description = "AWS Lambda function URL"
  value       = aws_lambda_function_url.agent.function_url
}
```
(( /tab "AWS Lambda" ))

(( tab "Google Cloud Run" ))
Create `main.tf`

```hcl
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

resource "google_cloud_run_service" "agent" {
  name     = "strands-agent"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = var.agent_image
        env {
          name  = "OPENAI_API_KEY"
          value = var.openai_api_key
        }
      }
    }
  }
}

resource "google_cloud_run_service_iam_member" "public" {
  service  = google_cloud_run_service.agent.name
  location = google_cloud_run_service.agent.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
```

Create `variables.tf`

```hcl
variable "gcp_project" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "agent_image" {
  description = "Container image for Strands agent"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}
```

Create `outputs.tf`

```hcl
output "agent_url" {
  description = "Google Cloud Run service URL"
  value       = google_cloud_run_service.agent.status[0].url
}
```
(( /tab "Google Cloud Run" ))

(( tab "Azure Container Instances" ))
Create `main.tf`

```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = var.acr_resource_group
}

resource "azurerm_resource_group" "main" {
  name     = "strands-agent"
  location = var.azure_location
}

resource "azurerm_container_group" "agent" {
  name                = "strands-agent"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  ip_address_type     = "Public"
  os_type             = "Linux"

  image_registry_credential {
    server   = "${var.acr_name}.azurecr.io"
    username = var.acr_name
    password = data.azurerm_container_registry.acr.admin_password
  }

  container {
    name   = "agent"
    image  = var.agent_image
    cpu    = "0.5"
    memory = "1.5"

    ports {
      port = 8080
    }

    environment_variables = {
      OPENAI_API_KEY = var.openai_api_key
    }
  }
}
```

Create `variables.tf`

```hcl
variable "azure_location" {
  description = "Azure location"
  type        = string
  default     = "East US"
}

variable "agent_image" {
  description = "Container image for Strands agent"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}

variable "acr_name" {
  description = "Azure Container Registry name"
  type        = string
}

variable "acr_resource_group" {
  description = "Azure Container Registry resource group"
  type        = string
}
```

Create `outputs.tf`

```hcl
output "agent_url" {
  description = "Azure Container Instance URL"
  value       = "http://${azurerm_container_group.agent.ip_address}:8080"
}
```
(( /tab "Azure Container Instances" ))

## Step 3: Configure Variables

Create `terraform/terraform.tfvars` with the values for your chosen provider:

(( tab "AWS App Runner" ))
```hcl
agent_image = "your-account.dkr.ecr.us-east-1.amazonaws.com/my-image:latest"
openai_api_key = "<your-openai-api-key>"
```

This example uses OpenAI, but any supported model provider can be configured. See the [Strands documentation](https://strandsagents.com/latest/documentation/docs/user-guide/sdk/model-providers) for all supported model providers.

**Note:** Bedrock model provider credentials are passed automatically through App Runner’s IAM role, so you don’t specify them in Terraform.
(( /tab "AWS App Runner" ))

(( tab "AWS Lambda" ))
```hcl
agent_image = "your-account.dkr.ecr.us-east-1.amazonaws.com/my-image:latest"
openai_api_key = "<your-openai-api-key>"
```

This example uses OpenAI, but any supported model provider can be configured. See the [Strands documentation](https://strandsagents.com/latest/documentation/docs/user-guide/sdk/model-providers) for all supported model providers.

**Note:** Bedrock model provider credentials are passed automatically through Lambda’s IAM role, so you don’t specify them in Terraform.
(( /tab "AWS Lambda" ))

(( tab "Google Cloud Run" ))
```hcl
gcp_project = "your-project-id"
agent_image = "gcr.io/your-project/my-image:latest"
openai_api_key = "<your-openai-api-key>"
```

This example uses OpenAI, but any supported model provider can be configured. See the [Strands documentation](https://strandsagents.com/latest/documentation/docs/user-guide/sdk/model-providers) for all supported model providers. To use Bedrock instead, pass AWS credentials as environment variables in `main.tf`:

```hcl
aws_access_key_id = "<your-aws-access-key-id>"
aws_secret_access_key = "<your-aws-secret-key>"
```
(( /tab "Google Cloud Run" ))

(( tab "Azure Container Instances" ))
```hcl
agent_image = "your-registry.azurecr.io/my-image:latest"
openai_api_key = "<your-openai-api-key>"
acr_name = "<your-registry>"
acr_resource_group = "<your-resource-group>"
```

This example uses OpenAI, but any supported model provider can be configured. See the [Strands documentation](https://strandsagents.com/latest/documentation/docs/user-guide/sdk/model-providers) for all supported model providers. To use Bedrock instead, pass AWS credentials as environment variables in `main.tf`:

```hcl
aws_access_key_id = "<your-aws-access-key-id>"
aws_secret_access_key = "<your-aws-secret-key>"
```
(( /tab "Azure Container Instances" ))

## Step 4: Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Review the deployment plan
terraform plan

# Deploy the infrastructure
terraform apply

# Get the endpoints
terraform output
```

## Step 5: Test Your Deployment

Test the endpoints using the output URLs:

```bash
# Health check
curl http://<your-service-url>/ping

# Test agent invocation
curl -X POST http://<your-service-url>/invocations \
  -H "Content-Type: application/json" \
  -d '{"input": {"prompt": "What is artificial intelligence?"}}'
```

## Step 6: Making Changes

When you change your code, rebuild the image and reapply:

```bash
# Rebuild and push image
docker build -t <your-registry>/my-image:latest .
docker push <your-registry>/my-image:latest

# Update infrastructure
terraform apply
```

## Cleanup

Remove the infrastructure when you’re done:

```bash
terraform destroy
```

## Additional Resources

-   [Strands Docker Deploy Documentation](/docs/user-guide/sdk/deploy/deploy_to_docker/index.md)
-   [Terraform Documentation](https://www.terraform.io/docs/)
-   [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
-   [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
-   [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)

## Related pages

- [Deploy to Kubernetes](/docs/user-guide/sdk/deploy/deploy_to_kubernetes/index.md) (1 shared tag)
- [Deploy to production](/docs/user-guide/sdk/deploy/index.md) (1 shared tag)
- [Deploy with Nx Plugin for AWS](/docs/user-guide/sdk/deploy/deploy_with_nx_plugin_for_aws/index.md) (1 shared tag)
- [Deploying Strands Agents to Docker](/docs/user-guide/sdk/deploy/deploy_to_docker/index.md) (1 shared tag)
- [Python Deployment to Docker](/docs/user-guide/sdk/deploy/deploy_to_docker/python/index.md) (1 shared tag)
- [TypeScript Deployment to Docker](/docs/user-guide/sdk/deploy/deploy_to_docker/typescript/index.md) (1 shared tag)
- [Deploying Strands Agents SDK Agents to Amazon EC2](/docs/user-guide/sdk/deploy/deploy_to_amazon_ec2/index.md) (1 shared tag)
- [Deploying Strands Agents SDK Agents to Amazon EKS](/docs/user-guide/sdk/deploy/deploy_to_amazon_eks/index.md) (1 shared tag)
- [Deploying Strands Agents SDK Agents to AWS App Runner](/docs/user-guide/sdk/deploy/deploy_to_aws_apprunner/index.md) (1 shared tag)
- [Deploying Strands Agents SDK Agents to AWS Fargate](/docs/user-guide/sdk/deploy/deploy_to_aws_fargate/index.md) (1 shared tag)
