import json
from pathlib import Path

import pytest
from pydantic import ValidationError

PAYLOAD = json.loads((Path(__file__).resolve().parents[1] / "test_payload.json").read_text())


def call(module, payload):
    return module.invoke(payload, context=None)


class TestPayloadValidation:
    @pytest.mark.parametrize("missing", ["tab", "member", "policy"])
    def test_rejects_missing_sections(self, agent_module, fake_agent, missing):
        payload = {k: v for k, v in PAYLOAD.items() if k != missing}
        assert call(agent_module, payload) == {"error": "payload must include tab, member and policy objects"}
        assert fake_agent.calls == []

    @pytest.mark.parametrize("bad", [None, "tab", 42, ["x"]])
    def test_rejects_non_object_sections(self, agent_module, fake_agent, bad):
        assert "error" in call(agent_module, {**PAYLOAD, "tab": bad})
        assert fake_agent.calls == []

    def test_rejects_empty_payload(self, agent_module):
        assert "error" in call(agent_module, {})


class TestDecisions:
    @pytest.mark.parametrize("action", ["settle", "split", "hold"])
    def test_returns_the_structured_decision(self, agent_module, fake_agent, action):
        fake_agent.output = {"action": action, "tipPct": 18, "reason": "Typical evening for this member"}
        assert call(agent_module, PAYLOAD) == {"action": action, "tipPct": 18, "reason": "Typical evening for this member"}

    def test_returns_exactly_the_contract_keys(self, agent_module, fake_agent):
        fake_agent.output = {"action": "settle", "tipPct": 20, "reason": "ok"}
        assert set(call(agent_module, PAYLOAD)) == {"action", "tipPct", "reason"}

    def test_result_is_json_serializable(self, agent_module, fake_agent):
        fake_agent.output = {"action": "settle", "tipPct": 20, "reason": "ok"}
        json.dumps(call(agent_module, PAYLOAD))

    def test_holds_when_the_model_cannot_produce_structured_output(self, agent_module, fake_agent, structured_output_exception):
        fake_agent.output = structured_output_exception("no tool call")
        result = call(agent_module, PAYLOAD)
        assert result["action"] == "hold"
        assert result["tipPct"] == PAYLOAD["policy"]["defaultTipPct"]
        assert "review manually" in result["reason"]

    def test_hold_fallback_uses_20_without_a_policy_tip(self, agent_module, fake_agent, structured_output_exception):
        fake_agent.output = structured_output_exception("x")
        policy = {k: v for k, v in PAYLOAD["policy"].items() if k != "defaultTipPct"}
        assert call(agent_module, {**PAYLOAD, "policy": policy})["tipPct"] == 20

    def test_other_errors_propagate(self, agent_module, fake_agent):
        # The API treats a failed invocation as "use the deterministic fallback".
        fake_agent.output = RuntimeError("throttled")
        with pytest.raises(RuntimeError):
            call(agent_module, PAYLOAD)


class TestPromptAndModel:
    def test_prompt_contains_the_tab_member_and_policy(self, agent_module, fake_agent):
        fake_agent.output = {"action": "settle", "tipPct": 20, "reason": "ok"}
        call(agent_module, PAYLOAD)
        prompt = fake_agent.calls[0]["prompt"]
        body = json.loads(prompt.split("\n\n", 1)[1])
        assert body == {"tab": PAYLOAD["tab"], "member": PAYLOAD["member"], "policy": PAYLOAD["policy"]}

    def test_requests_the_settlement_decision_schema(self, agent_module, fake_agent):
        fake_agent.output = {"action": "settle", "tipPct": 20, "reason": "ok"}
        call(agent_module, PAYLOAD)
        assert fake_agent.calls[0]["model"] is agent_module.SettlementDecision

    def test_uses_the_configured_bedrock_model_and_region(self, agent_module, fake_agent):
        fake_agent.output = {"action": "settle", "tipPct": 20, "reason": "ok"}
        call(agent_module, PAYLOAD)
        kwargs = fake_agent.init_kwargs[0]
        assert kwargs["model"].model_id == "anthropic.claude-opus-5-5"
        assert kwargs["model"].region_name == "us-west-2"
        assert kwargs["system_prompt"] == agent_module.SYSTEM_PROMPT
        assert kwargs["callback_handler"] is None

    def test_creates_a_fresh_agent_per_tab(self, agent_module, fake_agent):
        fake_agent.output = {"action": "settle", "tipPct": 20, "reason": "ok"}
        call(agent_module, PAYLOAD)
        call(agent_module, PAYLOAD)
        assert len(fake_agent.init_kwargs) == 2

    def test_system_prompt_defines_all_three_actions(self, agent_module):
        for word in ("settle", "split", "hold", "tipPct"):
            assert word in agent_module.SYSTEM_PROMPT

    def test_registers_the_entrypoint(self, agent_module):
        assert agent_module.app.handler is agent_module.invoke


class TestSettlementDecisionSchema:
    def test_accepts_a_valid_decision(self, agent_module):
        d = agent_module.SettlementDecision(action="split", tipPct=0, reason="Two seats")
        assert d.model_dump() == {"action": "split", "tipPct": 0, "reason": "Two seats"}

    @pytest.mark.parametrize("tip", [-1, 31, 100])
    def test_rejects_tips_out_of_range(self, agent_module, tip):
        with pytest.raises(ValidationError):
            agent_module.SettlementDecision(action="settle", tipPct=tip, reason="r")

    @pytest.mark.parametrize("action", ["refund", "SETTLE", "", "approve"])
    def test_rejects_unknown_actions(self, agent_module, action):
        with pytest.raises(ValidationError):
            agent_module.SettlementDecision(action=action, tipPct=20, reason="r")

    def test_rejects_long_reasons(self, agent_module):
        with pytest.raises(ValidationError):
            agent_module.SettlementDecision(action="hold", tipPct=20, reason="x" * 281)

    def test_requires_every_field(self, agent_module):
        with pytest.raises(ValidationError):
            agent_module.SettlementDecision(action="hold")
