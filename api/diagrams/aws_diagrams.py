"""AWS architecture diagrams for the Settle backend, drawn with official AWS icons.

Uses the `diagrams` library (diagrams-as-code, https://diagrams.mingrammer.com)
and Graphviz. Regenerate after changing infra/*.yaml:

    brew install graphviz          # or: apt-get install graphviz
    pip install -r diagrams/requirements.txt
    python diagrams/aws_diagrams.py

Writes PNGs next to this file. AgentCore has no icon in the AWS set yet, so
its resources use the Amazon Bedrock icon.
"""

from pathlib import Path

from diagrams import Cluster, Diagram, Edge
from diagrams.aws.compute import ECR, ElasticContainerServiceService, Fargate
from diagrams.aws.devtools import XRay
from diagrams.aws.general import Client, InternetAlt1, Users
from diagrams.aws.management import Cloudformation, CloudformationStack, CloudwatchLogs
from diagrams.aws.ml import Bedrock
from diagrams.aws.network import CloudFront, ElbApplicationLoadBalancer, InternetGateway
from diagrams.aws.security import IAMRole, SecretsManager
from diagrams.aws.storage import SimpleStorageServiceS3Bucket
from diagrams.onprem.ci import GithubActions

OUT = Path(__file__).parent

GRAPH = {"fontsize": "20", "pad": "0.6", "nodesep": "0.7", "ranksep": "1.1", "splines": "spline"}
NODE = {"fontsize": "12"}
EDGE = {"fontsize": "11"}

data = {"color": "#1f6feb"}
control = {"color": "#8b949e", "style": "dashed"}
deploy = {"color": "#d97706"}


def infrastructure() -> None:
    with Diagram(
        "Settle backend - AWS infrastructure (per stage)",
        filename=str(OUT / "aws-infrastructure"),
        show=False,
        direction="LR",
        graph_attr=GRAPH,
        node_attr=NODE,
        edge_attr=EDGE,
    ):
        frontend = Users("Frontend\n/dashboard /pos\n/member /manager")
        xrpl = InternetAlt1("XRPL Testnet\nEscrowCreate\nEscrowFinish / Payment\n(LEDGER_MODE=module)")
        with Cluster("Mastercard AP4M (LEDGER_MODE=ap4m)"):
            ap4m_service = InternetAlt1("AP4M service\nsign-in, channel requests,\nsettle, receipts")
            evm = InternetAlt1("XRPL EVM Testnet (1449000)\nParticipantRegistry\nPaymentLedger + Vault\nRLUSD")

        with Cluster("AWS account (one region)"):
            with Cluster("Bootstrap (once)"):
                ecr = ECR("ECR\nsettle-api")
                artifacts = SimpleStorageServiceS3Bucket("S3 artifacts\nagent zips")

            with Cluster("Stack settle-<stage>-api"):
                cdn = CloudFront("CloudFront\nHTTPS, no cache")
                with Cluster("VPC 10.42.0.0/16 - 2 public subnets"):
                    igw = InternetGateway("Internet\ngateway")
                    alb = ElbApplicationLoadBalancer("ALB\nidle 3600 s\norigin-header check")
                    with Cluster("ECS cluster settle-<stage>"):
                        service = ElasticContainerServiceService("Service api\ndesired = 1")
                        task = Fargate("Fargate task (ARM64)\nNode API + SSE\n+ ledger module")
                secret = SecretsManager("Secrets Manager\nledger-env\nap4m-env")
                logs = CloudwatchLogs("CloudWatch Logs\n/settle/<stage>/api")
                task_role = IAMRole("Task role\nInvokeAgentRuntime")

            with Cluster("Stack settle-<stage>-agent"):
                runtime = Bedrock("AgentCore Runtime\nsettlement agent\n(Strands, Python 3.13)")
                endpoint = Bedrock("Runtime endpoint\n'live'")
                model = Bedrock("Amazon Bedrock\nClaude")
                traces = XRay("AgentCore\nObservability")

        frontend >> Edge(label="REST + SSE /events", **data) >> cdn >> Edge(**data) >> alb >> Edge(**data) >> task
        igw - Edge(**control) - alb
        service - Edge(**control) - task
        task >> Edge(label="InvokeAgentRuntime\n(during grace)", **data) >> endpoint >> Edge(**data) >> runtime
        runtime >> Edge(**data) >> model
        runtime >> Edge(**control) >> traces
        task >> Edge(label="openTab / settleTab\ncancelTab", **data) >> xrpl
        task >> Edge(label="x402 + EIP-712 Voucher\nredeemVoucher", **data) >> evm
        task >> Edge(label="channel / settle / close", **data) >> ap4m_service
        ap4m_service >> Edge(**control) >> evm
        secret >> Edge(label="LEDGER_ENV_JSON", **control) >> task
        task >> Edge(**control) >> logs
        task_role - Edge(**control) - task
        ecr >> Edge(label="image pull", **control) >> task
        artifacts >> Edge(label="code zip", **control) >> runtime


def pipeline() -> None:
    with Diagram(
        "Settle backend - CI/CD (GitHub Actions to AWS)",
        filename=str(OUT / "ci-cd-pipeline"),
        show=False,
        direction="LR",
        graph_attr=GRAPH,
        node_attr=NODE,
        edge_attr=EDGE,
    ):
        dev = Client("GitHub Release published\npre-release -> dev\nfull release -> prod")

        with Cluster("GitHub Actions: api.yml"):
            test = GithubActions("test\ntypecheck, vitest,\nbuild, cfn-lint\n(also on every PR/push)")
            job = GithubActions("deploy\n(release only,\nenvironment = stage)")

        with Cluster("AWS account"):
            role = IAMRole("OIDC ->\nsettle-github-deploy")
            artifacts = SimpleStorageServiceS3Bucket("S3\nagent/<stage>/<sha>.zip")
            ecr = ECR("ECR\nsettle-api:<sha>")
            cfn = Cloudformation("CloudFormation")
            with Cluster("Stacks"):
                agent_stack = CloudformationStack("settle-<stage>-agent\nAgentCore Runtime")
                api_stack = CloudformationStack("settle-<stage>-api\nVPC, ALB, ECS,\nCloudFront")
            runtime = Bedrock("AgentCore Runtime")
            task = Fargate("Fargate task")

        dev >> test >> Edge(label="tests pass") >> job
        job >> Edge(label="1. assume role", **deploy) >> role
        job >> Edge(label="2. agent zip", **deploy) >> artifacts
        job >> Edge(label="3. deploy agent stack", **deploy) >> cfn
        job >> Edge(label="4. arm64 image", **deploy) >> ecr
        job >> Edge(label="5. deploy api stack\n6. smoke test /health", **deploy) >> cfn
        cfn >> agent_stack >> runtime
        cfn >> api_stack >> task
        artifacts >> Edge(**control) >> runtime
        ecr >> Edge(**control) >> task


if __name__ == "__main__":
    infrastructure()
    pipeline()
    print(f"wrote {OUT / 'aws-infrastructure.png'} and {OUT / 'ci-cd-pipeline.png'}")
