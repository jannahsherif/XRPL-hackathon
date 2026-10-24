// Writes the GET /state snapshot to seed.json so the frontend can build
// against real shapes before the API is running (plan: "Build against Liam's seed JSON").
import { writeFileSync } from "node:fs";

import { buildApp } from "../src/app.js";
import { config } from "../src/config.js";

const { app, service } = await buildApp({ ...config, ledgerMode: "stub", agentMode: "local" });
const out = new URL("../seed.json", import.meta.url);
writeFileSync(out, JSON.stringify(service.snapshot(), null, 2) + "\n");
await app.close();
console.log(`wrote ${out.pathname}`);
