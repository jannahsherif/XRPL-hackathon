#!/usr/bin/env bash
# Package the settlement agent as an AgentCore Runtime code zip (Linux arm64).
# Usage: scripts/build-agent.sh [output-zip]   (default: build/agent.zip)
set -euo pipefail

cd "$(dirname "$0")/.."
OUT="${1:-build/agent.zip}"
PY_VERSION="${AGENT_PYTHON_VERSION:-3.13}"
STAGE="build/agent-package"

rm -rf "$STAGE" "$OUT"
mkdir -p "$STAGE" "$(dirname "$OUT")"

# AgentCore Runtime only runs arm64; fetch manylinux aarch64 wheels.
uv pip install \
  --python-platform aarch64-manylinux2014 \
  --python-version "$PY_VERSION" \
  --target "$STAGE" \
  --only-binary=:all: \
  -r agent/requirements.txt

cp agent/main.py "$STAGE/"
# Runtime needs 644 files / 755 dirs.
find "$STAGE" -type d -exec chmod 755 {} +
find "$STAGE" -type f -exec chmod 644 {} +

OUT_ABS="$(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"
(cd "$STAGE" && zip -qr "$OUT_ABS" .)
echo "agent package: $OUT ($(du -h "$OUT" | cut -f1))"
