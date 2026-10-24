import { beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
const constructed: unknown[] = [];

vi.mock("@aws-sdk/client-bedrock-agentcore", () => ({
  BedrockAgentCoreClient: class {
    constructor(opts: unknown) {
      constructed.push(opts);
    }
    send = send;
  },
  InvokeAgentRuntimeCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
}));

const { createSettlementAgent, parseDecision } = await import("../src/agent/settlementAgent.js");
const { SEED_MEMBERS, SEED_POLICY } = await import("../src/seed.js");
const { testConfig } = await import("./helpers.js");

import type { Tab } from "../src/types.js";

const member = SEED_MEMBERS[1]; // m2, typical $180, allowance $600
const tab = (overrides: Partial<Tab> = {}): Tab => ({
  id: "t9",
  memberId: member.id,
  memberName: member.name,
  seat: "Table 12",
  status: "grace",
  items: [{ name: "Dry-Aged Ribeye", qty: 1, priceCents: 6800 }],
  totalCents: 6800,
  tipCents: 0,
  allowance: member.allowance,
  escrow: { seq: 1, txHash: "H", explorerUrl: null },
  settlement: null,
  hold: null,
  graceEndsAt: null,
  openedAt: "",
  mandate: null,
  ap4m: null,
  ...overrides,
});

const reply = (body: string) => ({ response: { transformToString: async () => body } });
const agentcoreConfig = testConfig({
  agentMode: "agentcore",
  agentRuntimeArn: "arn:aws:bedrock-agentcore:us-east-1:111122223333:runtime/settle_dev_settlement-abc",
  agentQualifier: "live",
  agentTimeoutMs: 200,
  awsRegion: "us-west-2",
});

beforeEach(() => {
  send.mockReset();
  constructed.length = 0;
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("parseDecision", () => {
  it.each(["settle", "split", "hold"])("accepts action %s", (action) => {
    expect(parseDecision(JSON.stringify({ action, tipPct: 18, reason: "r" }), SEED_POLICY)).toEqual({
      action,
      tipPct: 18,
      reason: "r",
      source: "agent",
    });
  });

  it.each([
    [-5, 0],
    [0, 0],
    [22, 22],
    [30, 30],
    [99, 30],
  ])("clamps tipPct %i to %i", (tipPct, expected) => {
    expect(parseDecision(JSON.stringify({ action: "settle", tipPct, reason: "r" }), SEED_POLICY).tipPct).toBe(expected);
  });

  it("uses the policy tip when the agent omits it or sends junk", () => {
    expect(parseDecision('{"action":"settle","reason":"r"}', SEED_POLICY).tipPct).toBe(20);
    expect(parseDecision('{"action":"settle","tipPct":"lots","reason":"r"}', SEED_POLICY).tipPct).toBe(20);
  });

  it("defaults and truncates the reason", () => {
    expect(parseDecision('{"action":"hold"}', SEED_POLICY).reason).toBe("No reason given");
    const long = "x".repeat(500);
    expect(parseDecision(JSON.stringify({ action: "hold", reason: long }), SEED_POLICY).reason).toHaveLength(280);
  });

  it.each(['{"action":"refund"}', '{"error":"bad payload"}', "{}", "not json", ""])("rejects %j", (body) => {
    expect(() => parseDecision(body, SEED_POLICY)).toThrow();
  });
});

describe("createSettlementAgent", () => {
  it("in local mode never calls AWS and uses the fallback", async () => {
    const agent = createSettlementAgent(testConfig());
    const decision = await agent.decide(tab(), member, SEED_POLICY);
    expect(decision).toMatchObject({ action: "settle", source: "fallback" });
    expect(constructed).toHaveLength(0);
    expect(send).not.toHaveBeenCalled();
  });

  it("applies hard rules before the model and skips the call", async () => {
    const agent = createSettlementAgent(agentcoreConfig);
    const decision = await agent.decide(
      tab({ items: [{ name: "Bottle", qty: 1, priceCents: 90000 }], totalCents: 90000 }),
      member,
      SEED_POLICY,
    );
    expect(decision).toMatchObject({ action: "hold", source: "rules" });
    expect(send).not.toHaveBeenCalled();
  });

  it("invokes the AgentCore runtime with the tab, member and policy", async () => {
    send.mockResolvedValue(reply('{"action":"settle","tipPct":22,"reason":"Regular, normal spend"}'));
    const agent = createSettlementAgent(agentcoreConfig);
    const decision = await agent.decide(tab(), member, SEED_POLICY);

    expect(decision).toEqual({ action: "settle", tipPct: 22, reason: "Regular, normal spend", source: "agent" });
    expect(constructed).toEqual([{ region: "us-west-2" }]);
    const input = send.mock.calls[0][0].input;
    expect(input.agentRuntimeArn).toBe(agentcoreConfig.agentRuntimeArn);
    expect(input.qualifier).toBe("live");
    expect(input.runtimeSessionId.length).toBeGreaterThanOrEqual(33);
    expect(input.runtimeSessionId).toContain("t9");
    const payload = JSON.parse(new TextDecoder().decode(input.payload));
    expect(payload.tab).toMatchObject({ id: "t9", totalCents: 6800, allowance: "600.00" });
    expect(payload.member).toMatchObject({ id: "m2", typicalSpendCents: 18000 });
    expect(payload.member.name).toBeUndefined(); // no PII beyond what the decision needs
    expect(payload.policy).toEqual(SEED_POLICY);
  });

  it("uses a fresh session id per decision", async () => {
    send.mockResolvedValue(reply('{"action":"settle","tipPct":20,"reason":"ok"}'));
    const agent = createSettlementAgent(agentcoreConfig);
    await agent.decide(tab(), member, SEED_POLICY);
    await agent.decide(tab(), member, SEED_POLICY);
    expect(send.mock.calls[0][0].input.runtimeSessionId).not.toBe(send.mock.calls[1][0].input.runtimeSessionId);
  });

  it("passes through an agent hold", async () => {
    send.mockResolvedValue(reply('{"action":"hold","tipPct":20,"reason":"Duplicate lines"}'));
    const decision = await createSettlementAgent(agentcoreConfig).decide(tab(), member, SEED_POLICY);
    expect(decision).toMatchObject({ action: "hold", reason: "Duplicate lines", source: "agent" });
  });

  it("falls back when the runtime errors", async () => {
    send.mockRejectedValue(new Error("AccessDeniedException"));
    const decision = await createSettlementAgent(agentcoreConfig).decide(tab(), member, SEED_POLICY);
    expect(decision.source).toBe("fallback");
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("AccessDeniedException"));
  });

  it("falls back when the runtime is too slow", async () => {
    send.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(reply('{"action":"hold"}')), 1000)));
    const started = Date.now();
    const decision = await createSettlementAgent(agentcoreConfig).decide(tab(), member, SEED_POLICY);
    expect(decision.source).toBe("fallback");
    expect(Date.now() - started).toBeLessThan(900);
  });

  it("falls back on an invalid or empty response", async () => {
    send.mockResolvedValueOnce(reply('{"action":"refund"}')).mockResolvedValueOnce({ response: undefined });
    const agent = createSettlementAgent(agentcoreConfig);
    expect((await agent.decide(tab(), member, SEED_POLICY)).source).toBe("fallback");
    expect((await agent.decide(tab(), member, SEED_POLICY)).source).toBe("fallback");
  });

  it("falls back when agentcore mode has no runtime ARN", async () => {
    const decision = await createSettlementAgent({ ...agentcoreConfig, agentRuntimeArn: "" }).decide(tab(), member, SEED_POLICY);
    expect(decision.source).toBe("fallback");
    expect(send).not.toHaveBeenCalled();
  });
});
