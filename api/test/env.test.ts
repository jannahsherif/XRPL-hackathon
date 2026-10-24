import { afterEach, describe, expect, it, vi } from "vitest";

import { expandLedgerEnv } from "../src/env.js";

describe("expandLedgerEnv", () => {
  it("does nothing without LEDGER_ENV_JSON", () => {
    const env: NodeJS.ProcessEnv = { A: "1" };
    expect(expandLedgerEnv(env)).toEqual([]);
    expect(env).toEqual({ A: "1" });
  });

  it("expands keys and removes the JSON blob", () => {
    const env: NodeJS.ProcessEnv = { LEDGER_ENV_JSON: JSON.stringify({ VENUE_SEED: "sXYZ", MEMBER_COUNT: 4 }) };
    expect(expandLedgerEnv(env).sort()).toEqual(["MEMBER_COUNT", "VENUE_SEED"]);
    expect(env.VENUE_SEED).toBe("sXYZ");
    expect(env.MEMBER_COUNT).toBe("4");
    expect(env.LEDGER_ENV_JSON).toBeUndefined();
  });

  it("never overrides variables that are already set", () => {
    const env: NodeJS.ProcessEnv = { VENUE_SEED: "local", LEDGER_ENV_JSON: JSON.stringify({ VENUE_SEED: "secret" }) };
    expect(expandLedgerEnv(env)).toEqual([]);
    expect(env.VENUE_SEED).toBe("local");
  });

  it.each(["not json", "[1,2]", "null", '"string"'])("rejects %j", (raw) => {
    expect(() => expandLedgerEnv({ LEDGER_ENV_JSON: raw })).toThrow(/LEDGER_ENV_JSON/);
  });
});

describe("config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  const load = async () => (await import("../src/config.js")).config;

  it("defaults to demo off, stub ledger, local agent and a 120 s grace", async () => {
    vi.stubEnv("DEMO", "");
    vi.stubEnv("GRACE_SECONDS", undefined as unknown as string);
    const config = await load();
    expect(config.demo).toBe(false);
    expect(config.graceSeconds).toBe(120);
    expect(config.ledgerMode).toBe("stub");
    expect(config.agentMode).toBe("local");
    expect(config.outstandingSeedCents).toBe(34_218_000);
  });

  it("DEMO=1 shortens the grace timer to 10 s", async () => {
    vi.stubEnv("DEMO", "1");
    expect((await load()).graceSeconds).toBe(10);
  });

  it("DEMO=true is accepted too", async () => {
    vi.stubEnv("DEMO", "true");
    expect((await load()).demo).toBe(true);
  });

  it("GRACE_SECONDS overrides the demo default", async () => {
    vi.stubEnv("DEMO", "1");
    vi.stubEnv("GRACE_SECONDS", "4");
    expect((await load()).graceSeconds).toBe(4);
  });

  it("reads ledger and agent settings", async () => {
    vi.stubEnv("LEDGER_MODE", "module");
    vi.stubEnv("LEDGER_MODULE", "/opt/ledger/index.js");
    vi.stubEnv("AGENT_MODE", "agentcore");
    vi.stubEnv("AGENT_RUNTIME_ARN", "arn:aws:bedrock-agentcore:us-east-1:123:runtime/x");
    vi.stubEnv("AGENT_QUALIFIER", "live");
    vi.stubEnv("AGENT_TIMEOUT_MS", "2500");
    vi.stubEnv("PORT", "9000");
    const config = await load();
    expect(config).toMatchObject({
      ledgerMode: "module",
      ledgerModule: "/opt/ledger/index.js",
      agentMode: "agentcore",
      agentQualifier: "live",
      agentTimeoutMs: 2500,
      port: 9000,
    });
  });
});
