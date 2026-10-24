#!/usr/bin/env bash
# Deploy the Settle backend from a laptop (CI runs the same steps).
#
# Requires: aws CLI v2, docker (buildx), uv, zip, and AWS credentials for an
# account where infra/bootstrap.yaml is already deployed.
#
#   STAGE=dev ARTIFACT_BUCKET=<bucket> scripts/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."
STAGE="${STAGE:-dev}"
REGION="${AWS_REGION:-us-east-1}"
: "${ARTIFACT_BUCKET:?set ARTIFACT_BUCKET (bootstrap stack output)}"
MODEL_ID="${MODEL_ID:-anthropic.claude-opus-5-5}"
LEDGER_MODE="${LEDGER_MODE:-stub}"
DEMO="${DEMO:-1}"
CORS_ORIGIN="${CORS_ORIGIN:-*}"
AP4M_NETWORK="${AP4M_NETWORK:-simulated}"
INTENT_MODE="${INTENT_MODE:-on}"
VERSION="${VERSION:-$(git rev-parse --short=12 HEAD)-$(date +%s)}"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
REPO_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/settle-api"

echo "==> 1/4 agent package"
scripts/build-agent.sh build/agent.zip
AGENT_KEY="agent/${STAGE}/${VERSION}.zip"
aws s3 cp build/agent.zip "s3://${ARTIFACT_BUCKET}/${AGENT_KEY}" --region "$REGION"

echo "==> 2/4 agent stack (AgentCore Runtime)"
aws cloudformation deploy \
  --region "$REGION" \
  --stack-name "settle-${STAGE}-agent" \
  --template-file infra/agent.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset \
  --parameter-overrides Stage="$STAGE" AgentCodeBucket="$ARTIFACT_BUCKET" AgentCodeKey="$AGENT_KEY" ModelId="$MODEL_ID"

echo "==> 3/4 API image (linux/arm64)"
mkdir -p ../ledger && touch ../ledger/.keep
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "${REPO_URI%%/*}"
docker buildx build --platform linux/arm64 -f Dockerfile -t "${REPO_URI}:${VERSION}" --push ..

echo "==> 4/4 API stack (Fargate + ALB + CloudFront)"
aws cloudformation deploy \
  --region "$REGION" \
  --stack-name "settle-${STAGE}-api" \
  --template-file infra/api.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset \
  --parameter-overrides Stage="$STAGE" ImageUri="${REPO_URI}:${VERSION}" Demo="$DEMO" LedgerMode="$LEDGER_MODE" CorsOrigin="$CORS_ORIGIN" Ap4mNetwork="$AP4M_NETWORK" IntentMode="$INTENT_MODE"

API_URL="$(aws cloudformation describe-stacks --region "$REGION" --stack-name "settle-${STAGE}-api" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)"
echo "API: ${API_URL}  (try ${API_URL}/state and ${API_URL}/events)"
