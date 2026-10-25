const env = process.env;

const demo = env.DEMO === "1" || env.DEMO === "true";

export const config = {
  port: Number(env.PORT ?? 8080),
  host: env.HOST ?? "0.0.0.0",
  /** DEMO=1 shortens the grace timer to 10 s and seeds the wireframe data. */
  demo,
  graceSeconds: Number(env.GRACE_SECONDS ?? (demo ? 10 : 120)),
  /**
   * "stub" fakes hashes after a delay; "module" imports Alex's ledger module;
   * "ap4m" settles over Mastercard Agent Pay for Machines (Channel + x402 Voucher + RLUSD on XRPL EVM).
   */
  ledgerMode: (env.LEDGER_MODE ?? "stub") as "stub" | "module" | "ap4m",
  ledgerModule: env.LEDGER_MODULE ?? "../ledger/src/index.ts",
  ledgerStubDelayMs: Number(env.LEDGER_STUB_DELAY_MS ?? 3000),
  /** Stub only: replay the real testnet hashes in this file (ledger demo:happy-path writes it) when it exists. */
  ledgerFixture: env.LEDGER_FIXTURE ?? "../ledger/fixtures/happy-path.json",
  /** Open real escrows for the two stage tabs (t1, t5) at boot and after every reset (only with LEDGER_MODE=module). */
  seedLiveEscrows: env.SEED_LIVE_ESCROWS === "1",
  /** "local" uses the deterministic fallback; "agentcore" invokes the AgentCore Runtime. */
  agentMode: (env.AGENT_MODE ?? "local") as "local" | "agentcore",
  agentRuntimeArn: env.AGENT_RUNTIME_ARN ?? "",
  agentQualifier: env.AGENT_QUALIFIER ?? "DEFAULT",
  agentTimeoutMs: Number(env.AGENT_TIMEOUT_MS ?? 8000),
  awsRegion: env.AWS_REGION ?? "us-east-1",
  corsOrigin: env.CORS_ORIGIN ?? "*",
  /** Shared staff secret, sent as X-Staff-Token on approve, reject, close, PATCH /policy, fund and /demo/reset. Unset = open. */
  staffToken: env.STAFF_TOKEN ?? "",
  outstandingSeedCents: Number(env.OUTSTANDING_SEED_CENTS ?? 34_218_000),

  // Mastercard integration ----------------------------------------------------
  /** Verifiable Intent mandates: member authorizes the agent per tab; settlement must fit the mandate. Off for the demo. */
  intentMode: (env.INTENT_MODE ?? "off") as "on" | "off",
  /** With LEDGER_MODE=ap4m: "simulated" runs the AP4M rules in memory; "live" uses the XRPL EVM Testnet. */
  ap4mNetwork: (env.AP4M_NETWORK ?? "simulated") as "simulated" | "live",
  ap4mApiUrl: env.AP4M_API_URL ?? "https://hackathon.ap4m.build",
  ap4mTeamName: env.AP4M_TEAM_NAME ?? env.TEAM_NAME ?? "",
  /** Agent payment key (signs Vouchers). Never the funding key. */
  ap4mAgentKey: env.AP4M_AGENT_PRIVATE_KEY ?? env.AGENT_PRIVATE_KEY ?? "",
  /** Merchant-side key that submits redeemVoucher and pays XRP gas. */
  ap4mSubmitterKey: env.AP4M_MERCHANT_SUBMITTER_KEY ?? env.MERCHANT_SUBMITTER_KEY ?? "",
  ap4mMerchantId: env.AP4M_MERCHANT_ID ?? env.MERCHANT_ID ?? "",
  ap4mPayout: env.AP4M_MERCHANT_PAYOUT ?? env.MERCHANT_PAYOUT ?? "",
  ap4mRpcUrl: env.AP4M_RPC_URL ?? "https://rpc.testnet.xrplevm.org",
  /** Demo scaling: the hackathon budget is 20 RLUSD, so $100 = 1 RLUSD by default. Use 1 in production. */
  usdPerRlusd: Number(env.AP4M_USD_PER_RLUSD ?? 100),
  ap4mSimBudgetRlusd: Number(env.AP4M_SIM_BUDGET_RLUSD ?? 20),
  /** Base URL other agents use to reach this API's x402 resources. */
  publicBaseUrl: env.PUBLIC_BASE_URL ?? `http://127.0.0.1:${env.PORT ?? 8080}`,
};

export type Config = typeof config;

/**
 * On AWS the API is public, so staff routes must be locked: refuse to start without STAFF_TOKEN.
 * ECS sets AWS_EXECUTION_ENV (AWS_ECS_FARGATE) in every task; locally it is unset and the routes stay open.
 */
export function requireStaffTokenOnAws(cfg: Pick<Config, "staffToken">, env: NodeJS.ProcessEnv = process.env): void {
  if (!cfg.staffToken && env.AWS_EXECUTION_ENV) {
    throw new Error(`STAFF_TOKEN is required on AWS (${env.AWS_EXECUTION_ENV}): add it to the settle/<stage>/ledger-env secret`);
  }
}
