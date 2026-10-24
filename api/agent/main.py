"""Settle settlement agent (plan B5), hosted on Amazon Bedrock AgentCore Runtime.

One structured LLM call per tab: items + member history + policy JSON in,
{action, tipPct, reason} out. The API enforces the hard hold rules *before*
calling this agent and falls back to a deterministic decision if the call is
slow or fails, so the demo never depends on the model.
"""

import json
import os
from typing import Literal

from bedrock_agentcore.runtime import BedrockAgentCoreApp
from pydantic import BaseModel, Field
from strands import Agent
from strands.models import BedrockModel
from strands.types.exceptions import StructuredOutputException

MODEL_ID = os.environ.get("SETTLE_MODEL_ID", "anthropic.claude-opus-5-5")
REGION = os.environ.get("AWS_REGION", "us-east-1")

SYSTEM_PROMPT = """You are the settlement agent for Settle, which settles members' food and beverage tabs
at a private club when they leave. You receive one tab (line items in cents, the escrowed allowance),
the member's tier and recent spend history, and the venue policy.

Decide one action:
- settle: the tab looks normal for this member; release it now.
- split: policy.splitBySeat is true and the tab clearly covers several seats or guests.
- hold: something looks wrong (an unusual item for this member, a spike far above their history,
  duplicate lines, or anything a manager should see before money moves).

Choose tipPct (0-30). Use policy.defaultTipPct unless the history shows this member tips differently.
Give a reason of one short sentence a manager can read on a phone. Hospitable tone; never accusatory.
"""

app = BedrockAgentCoreApp()


class SettlementDecision(BaseModel):
    """Settlement decision for one tab."""

    action: Literal["settle", "split", "hold"] = Field(description="What to do with the tab now")
    tipPct: int = Field(ge=0, le=30, description="Tip percentage to apply")
    reason: str = Field(max_length=280, description="One sentence explaining the decision for the manager")


def _model() -> BedrockModel:
    return BedrockModel(model_id=MODEL_ID, region_name=REGION)


@app.entrypoint
def invoke(payload, context):
    tab, member, policy = payload.get("tab"), payload.get("member"), payload.get("policy")
    if not isinstance(tab, dict) or not isinstance(member, dict) or not isinstance(policy, dict):
        return {"error": "payload must include tab, member and policy objects"}

    prompt = "Decide how to settle this tab.\n\n" + json.dumps({"tab": tab, "member": member, "policy": policy})
    agent = Agent(model=_model(), system_prompt=SYSTEM_PROMPT, callback_handler=None)
    try:
        decision: SettlementDecision = agent(prompt, structured_output_model=SettlementDecision).structured_output
    except StructuredOutputException:
        # The API treats a hold as the safe default for anything we can't parse.
        return {"action": "hold", "tipPct": policy.get("defaultTipPct", 20), "reason": "Agent could not decide; review manually"}
    return decision.model_dump()


if __name__ == "__main__":
    app.run()
