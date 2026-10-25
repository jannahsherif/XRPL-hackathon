import { buildApp } from "./app.js";
import { config } from "./config.js";
import { expandLedgerEnv } from "./env.js";

expandLedgerEnv(process.env);
expandLedgerEnv(process.env, "AP4M_ENV_JSON");

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
