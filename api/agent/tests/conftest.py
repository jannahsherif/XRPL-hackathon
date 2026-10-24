"""Stub the AgentCore and Strands SDKs so the agent's logic is tested without AWS.

Each test controls what the fake Strands agent returns through `fake_agent`.
"""

import importlib
import sys
import types
from pathlib import Path

import pytest

AGENT_DIR = Path(__file__).resolve().parents[1]


class StructuredOutputException(Exception):
    pass


class FakeResult:
    def __init__(self, structured_output):
        self.structured_output = structured_output


class FakeAgentState:
    """What the next Agent(...)(...) call returns, and what it was called with."""

    def __init__(self):
        self.reset()

    def reset(self):
        self.output = None  # a dict for the model to build, or an exception to raise
        self.calls = []
        self.init_kwargs = []


STATE = FakeAgentState()


class FakeAgent:
    def __init__(self, **kwargs):
        STATE.init_kwargs.append(kwargs)

    def __call__(self, prompt, structured_output_model=None):
        STATE.calls.append({"prompt": prompt, "model": structured_output_model})
        if isinstance(STATE.output, Exception):
            raise STATE.output
        return FakeResult(structured_output_model(**STATE.output))


class FakeBedrockModel:
    def __init__(self, model_id, region_name):
        self.model_id = model_id
        self.region_name = region_name


class FakeApp:
    def entrypoint(self, fn):
        self.handler = fn
        return fn

    def run(self):  # pragma: no cover - never called in tests
        raise AssertionError("app.run() must only run under __main__")


def _install_stubs():
    bac = types.ModuleType("bedrock_agentcore")
    bac_runtime = types.ModuleType("bedrock_agentcore.runtime")
    bac_runtime.BedrockAgentCoreApp = FakeApp
    strands = types.ModuleType("strands")
    strands.Agent = FakeAgent
    strands_models = types.ModuleType("strands.models")
    strands_models.BedrockModel = FakeBedrockModel
    strands_types = types.ModuleType("strands.types")
    strands_exc = types.ModuleType("strands.types.exceptions")
    strands_exc.StructuredOutputException = StructuredOutputException
    sys.modules.update({
        "bedrock_agentcore": bac,
        "bedrock_agentcore.runtime": bac_runtime,
        "strands": strands,
        "strands.models": strands_models,
        "strands.types": strands_types,
        "strands.types.exceptions": strands_exc,
    })


@pytest.fixture
def fake_agent():
    STATE.reset()
    return STATE


@pytest.fixture
def agent_module(monkeypatch, fake_agent):
    _install_stubs()
    monkeypatch.syspath_prepend(str(AGENT_DIR))
    monkeypatch.setenv("SETTLE_MODEL_ID", "anthropic.claude-opus-5-5")
    monkeypatch.setenv("AWS_REGION", "us-west-2")
    sys.modules.pop("main", None)
    module = importlib.import_module("main")
    yield module
    sys.modules.pop("main", None)


@pytest.fixture
def structured_output_exception():
    return StructuredOutputException
