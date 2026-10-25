import { expandLedgerEnv } from "./env.js";

// On AWS the secrets arrive as JSON env vars. Expand them before config.ts reads process.env,
// so STAFF_TOKEN and the AP4M keys from Secrets Manager are seen.
expandLedgerEnv(process.env);
expandLedgerEnv(process.env, "AP4M_ENV_JSON");

const { config, requireStaffTokenOnAws } = await import("./config.js");
const { buildApp } = await import("./app.js");

try {
  requireStaffTokenOnAws(config);
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}

const { app } = await buildApp(config);
if (!config.staffToken) {
  app.log.warn("STAFF_TOKEN is not set: approve, reject, close, PATCH /policy, fund and /demo/reset are open to anyone who can reach this server");
}

const shutdown = async () => {
  await app.close();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

await app.listen({ port: config.port, host: config.host });
app.log.info({ demo: config.demo, ledger: config.ledgerMode, agent: config.agentMode, graceSeconds: config.graceSeconds }, "settle backend up");
