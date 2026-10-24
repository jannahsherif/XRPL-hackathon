const env = process.env;

const demo = env.DEMO === "1" || env.DEMO === "true";

export const config = {
  port: Number(env.PORT ?? 8080),
  host: env.HOST ?? "0.0.0.0",
  /** DEMO=1 shortens the grace timer to 10 s and seeds the wireframe data. */
  demo,
  graceSeconds: Number(env.GRACE_SECONDS ?? (demo ? 10 : 120)),
  /** "stub" fakes hashes after a delay; "module" imports Alex's ledger module. */
  ledgerMode: (env.LEDGER_MODE ?? "stub") as "stub" | "module",
  ledgerModule: env.LEDGER_MODULE ?? "../ledger/index.js",
  ledgerStubDelayMs: Number(env.LEDGER_STUB_DELAY_MS ?? 3000),
  /** Open real escrows for the six seeded tabs at boot (only with LEDGER_MODE=module). */
  seedLiveEscrows: env.SEED_LIVE_ESCROWS === "1",
  /** "local" uses the deterministic fallback; "agentcore" invokes the AgentCore Runtime. */
  agentMode: (env.AGENT_MODE ?? "local") as "local" | "agentcore",
  agentRuntimeArn: env.AGENT_RUNTIME_ARN ?? "",
  agentQualifier: env.AGENT_QUALIFIER ?? "DEFAULT",
  agentTimeoutMs: Number(env.AGENT_TIMEOUT_MS ?? 8000),
  awsRegion: env.AWS_REGION ?? "us-east-1",
  corsOrigin: env.CORS_ORIGIN ?? "*",
  outstandingSeedCents: Number(env.OUTSTANDING_SEED_CENTS ?? 34_218_000),
};

export type Config = typeof config;
