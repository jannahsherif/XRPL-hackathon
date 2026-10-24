import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";

import { createSettlementAgent, type SettlementAgent } from "./agent/settlementAgent.js";
import type { Config } from "./config.js";
import { EventBus } from "./events.js";
import { loadLedger } from "./ledger/index.js";
import { SettleService } from "./settleService.js";
import type { Ledger } from "./types.js";

export interface AppDeps {
  ledger?: Ledger;
  agent?: SettlementAgent;
}

type IdParams = { Params: { id: string } };

export async function buildApp(config: Config, deps: AppDeps = {}) {
  const ledger = deps.ledger ?? (await loadLedger(config));
  const agent = deps.agent ?? createSettlementAgent(config);
  const bus = new EventBus();
  const service = new SettleService(ledger, agent, bus, config);

  const app: FastifyInstance = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "info" } });
  await app.register(cors, { origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",") });

  app.setErrorHandler((err: Error & { statusCode?: number }, _req, reply) => {
    const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
    if (status >= 500) app.log.error(err);
    reply.status(status).send({ error: err.message });
  });

  app.get("/health", async () => ({ ok: true, at: new Date().toISOString() }));

  app.get("/state", async () => service.snapshot());

  app.post<{ Body: { memberId?: string; seat?: string } }>("/tabs", async (req, reply) => {
    if (!req.body?.memberId) return reply.status(400).send({ error: "memberId is required" });
    return reply.status(201).send(await service.openTab(req.body.memberId, req.body.seat));
  });

  app.get<IdParams>("/tabs/:id", async (req) => service.getTab(req.params.id));

  app.post<IdParams & { Body: { menuItemId?: string; qty?: number } }>("/tabs/:id/items", async (req, reply) => {
    if (!req.body?.menuItemId) return reply.status(400).send({ error: "menuItemId is required" });
    return service.addItem(req.params.id, req.body.menuItemId, req.body.qty ?? 1);
  });

  app.post<IdParams>("/tabs/:id/exit", async (req) => service.exit(req.params.id));

  app.post<IdParams & { Body: { pct?: number } }>("/tabs/:id/tip", async (req, reply) => {
    if (req.body?.pct === undefined) return reply.status(400).send({ error: "pct is required" });
    return service.setTip(req.params.id, req.body.pct);
  });

  app.post<IdParams & { Body: { note?: string } }>("/tabs/:id/dispute", async (req) =>
    service.dispute(req.params.id, req.body?.note),
  );

  app.post<IdParams>("/tabs/:id/approve", async (req) => service.approve(req.params.id));
  app.post<IdParams>("/tabs/:id/reject", async (req) => service.reject(req.params.id));
  app.post<IdParams>("/tabs/:id/close", async (req) => service.close(req.params.id));

  app.get("/metrics", async () => service.metrics());

  app.get("/policy", async () => service.snapshot().policy);
  app.patch<{ Body: Record<string, unknown> }>("/policy", async (req) => service.updatePolicy(req.body ?? {}));

  app.post("/demo/reset", async () => {
    await service.reset();
    return service.snapshot();
  });

  // Server-Sent Events. Each event is sent with its type as the SSE event name.
  app.get<{ Querystring: { replay?: string } }>("/events", (req, reply) => {
    reply.raw.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
      ...corsHeaders(req.headers.origin, config.corsOrigin),
    });
    const send = (type: string, data: unknown) => reply.raw.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
    send("snapshot", service.snapshot());
    if (req.query.replay === "1") for (const event of bus.history()) send(event.type, event);
    const unsubscribe = bus.subscribe((event) => send(event.type, event));
    // Heartbeats keep ALB/CloudFront from closing an idle stream.
    const heartbeat = setInterval(() => reply.raw.write(`: keep-alive ${Date.now()}\n\n`), 15_000);
    req.raw.on("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
    reply.hijack();
  });

  if (config.ledgerMode === "module" && config.seedLiveEscrows) {
    void service.openSeedEscrows();
  }

  return { app, service, bus };
}

function corsHeaders(origin: string | undefined, allowed: string): Record<string, string> {
  if (allowed === "*") return { "access-control-allow-origin": origin ?? "*" };
  return origin && allowed.split(",").includes(origin) ? { "access-control-allow-origin": origin } : {};
}
