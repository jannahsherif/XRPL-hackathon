#!/bin/bash
# Call a tool on the public Mastercard Developers MCP server (no auth).
# usage: tools/mc-mcp.sh <tool> '<json args>'
#   tools/mc-mcp.sh list                                   # list tools
#   tools/mc-mcp.sh get-services-list '{}'
#   tools/mc-mcp.sh get-documentation '{"serviceId":"mastercard-checkout-solutions"}'
#   tools/mc-mcp.sh get-documentation-page '{"pagePath":"/platform/documentation/test-cards/index.md"}'
#   tools/mc-mcp.sh get-api-operation-list '{"apiSpecificationPath":"/mastercard-checkout-solutions/swagger/checkout_mvct_v1.yaml"}'
#   tools/mc-mcp.sh get-oauth10a-integration-guide '{"language":"python"}'
set -euo pipefail
URL=https://developer.mcp.mastercard.com
if [ "${1:-list}" = list ]; then
  body='{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
else
  body="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"$1\",\"arguments\":${2:-{\}}}}"
fi
curl -s -X POST "$URL" -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -d "$body" |
  python3 -c 'import sys,json; r=json.load(sys.stdin)["result"]; print("\n".join(c.get("text","") for c in r["content"]) if "content" in r else json.dumps(r,indent=2))'
