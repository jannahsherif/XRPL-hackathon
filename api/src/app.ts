import { createHash, timingSafeEqual } from "node:crypto";

import cors from "@fastify/cors";
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";

import { createSettlementAgent, type SettlementAgent } from "./agent/settlementAgent.js";
import type { Config } from "./config.js";
import { EventBus } from "./events.js";
import { Wallet } from "ethers";

import { AP4M_CONTRACTS, AP4M_NETWORK } from "./ap4m/network.js";
import { encodePaymentSignature } from "./ap4m/x402.js";
import { loadLedger } from "./ledger/index.js";
import { buildMastercardStack } from "./mastercard.js";
import { verifyPaymentRecord, type PaymentRecord } from "./intent/mandate.js";
import { SettleService } from "./settleService.js";
import type { Ledger } from "./types.js";

export interface AppDeps {
  ledger?: Ledger;
  agent?: SettlementAgent;
}

type IdParams = { Params: { id: string } };

/** Ledger (ledger/) and AP4M error codes -> HTTP status. */
export const ERROR_STATUS: Record<string, number> = {
  INVALID_INPUT: 400,
  INSUFFICIENT_FUNDS: 402,
  BUDGET_EXCEEDED: 402,
  OVER_CAP: 402,
  KYA_REJECTED: 403,
  ESCROW_NOT_FOUND: 409,
  CHANNEL_NOT_FOUND: 409,
  CHANNEL_CLOSED: 409,
  LEDGER_REJECTED: 502,
  SERVICE_ERROR: 502,
  LEDGER_TIMEOUT: 504,
};

export async function buildApp(config: Config, deps: AppDeps = {}) {
  const bus = new EventBus();
  const mastercard = buildMastercardStack(config, (type, data) => bus.publish(type, data));
  const ledger = deps.ledger ?? mastercard.ap4m ?? (await loadLedger(config));
  const agent = deps.agent ?? createSettlementAgent(config);
  const service = new SettleService(ledger, agent, bus, config, { intent: mastercard.intent });

  const app: FastifyInstance = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "info" } });
  await app.register(cors, { origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",") });

  app.setErrorHandler((err: Error & { statusCode?: number; code?: string }, _req, reply) => {
    const byCode = err.code ? ERROR_STATUS[err.code] : undefined;
    const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : (byCode ?? 500);
    if (status >= 500) app.log.error(err);
    reply.status(status).send({ error: err.message, ...(byCode ? { code: err.code } : {}) });
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

  // Staff actions. Member and POS routes stay open: they only act on the caller's own tab.
  const staffOnly = { preHandler: staffGuard(config.staffToken) };
  app.post<IdParams>("/tabs/:id/approve", staffOnly, async (req) => service.approve(req.params.id));
  app.post<IdParams>("/tabs/:id/reject", staffOnly, async (req) => service.reject(req.params.id));
  app.post<IdParams>("/tabs/:id/close", staffOnly, async (req) => service.close(req.params.id));

  app.get("/metrics", async () => service.metrics());

  /** Ledger balances (venue + members) in token units, straight from the ledger module. */
  app.get("/balances", async () => ledger.getBalances());

  app.get("/policy", async () => service.snapshot().policy);
  app.patch<{ Body: Record<string, unknown> }>("/policy", staffOnly, async (req) => service.updatePolicy(req.body ?? {}));

  // Mastercard: card funding (SIMULATED rail) -----------------------------------
  app.post<IdParams & { Body: { amountCents?: number } }>("/members/:id/fund", staffOnly, async (req, reply) => {
    if (req.body?.amountCents === undefined) return reply.status(400).send({ error: "amountCents is required" });
    return reply.status(201).send(service.fundMember(req.params.id, Number(req.body.amountCents)));
  });

  // Mastercard: Verifiable Intent ------------------------------------------------
  app.get<IdParams>("/intent/tabs/:id", async (req, reply) => {
    const tab = service.getTab(req.params.id);
    if (!service.intent || !tab.mandate) return reply.status(404).send({ error: "No Verifiable Intent mandate for this tab" });
    return {
      mandate: tab.mandate,
      jws: service.intent.getJws(tab.mandate.hash),
      memberKey: service.intent.publicJwk(tab.memberId),
      verify: "ES256 JWS over the mandate payload with the member's P-256 key (memberKey)",
    };
  });

  app.post<{ Body: { record?: PaymentRecord } }>("/intent/verify-payment-record", async (req, reply) => {
    if (!req.body?.record) return reply.status(400).send({ error: "record is required" });
    return { valid: verifyPaymentRecord(req.body.record) };
  });

  // Mastercard AP4M: x402 resource (venue = Merchant / payee facilitator) -------------
  app.get<IdParams>("/x402/tabs/:id/resource", async (req, reply) => {
    if (!mastercard.ap4m) return reply.status(404).send({ error: "AP4M is not enabled (LEDGER_MODE=ap4m)" });
    const header = (name: string) => {
      const v = req.headers[name];
      return Array.isArray(v) ? undefined : v;
    };
    const out = await mastercard.ap4m.merchant.handle({
      tabId: req.params.id,
      channelId: header("x-ap4m-channel-id"),
      paymentSignature: header("payment-signature"),
    });
    reply.header("cache-control", "no-store, private").header("vary", "PAYMENT-SIGNATURE, X-AP4M-CHANNEL-ID");
    for (const [k, v] of Object.entries(out.headers)) reply.header(k, v);
    return reply.status(out.status).send(out.body);
  });

  app.get("/ap4m", async (_req, reply) => {
    if (!mastercard.ap4m) return reply.status(404).send({ error: "AP4M is not enabled (LEDGER_MODE=ap4m)" });
    const net = mastercard.ap4m.network;
    const budget = await net.budget();
    return {
      mode: net.mode,
      network: { ...AP4M_NETWORK },
      contracts: { ...AP4M_CONTRACTS },
      eip712Domain: net.domain,
      agent: net.agentAddress(),
      merchant: net.merchant(),
      participants: await net.participants(),
      budget: budget && { depositWei: budget.depositWei.toString(), allocatedWei: budget.allocatedWei.toString(), availableWei: budget.availableWei.toString() },
      usdPerRlusd: config.usdPerRlusd,
    };
  });

  // Demo-only routes exist only with DEMO=1.
  if (config.demo) {
    /** Proof: spending past the funded cap is refused by the Agent and by the PaymentLedger. */
    app.post<IdParams>("/demo/ap4m/over-cap/:id", async (req, reply) => {
      if (!mastercard.ap4m) return reply.status(404).send({ error: "AP4M is not enabled (LEDGER_MODE=ap4m)" });
      return mastercard.ap4m.attemptOverCap(service.getTab(req.params.id));
    });

    /** Proof: a Voucher from an agent that is not the Channel's KYA-registered Agent is refused. */
    app.post<IdParams>("/demo/ap4m/unverified-agent/:id", async (req, reply) => {
      if (!mastercard.ap4m) return reply.status(404).send({ error: "AP4M is not enabled (LEDGER_MODE=ap4m)" });
      const tab = service.getTab(req.params.id);
      if (!tab.ap4m) return reply.status(409).send({ error: "Tab has no AP4M Channel" });
      const net = mastercard.ap4m.network;
      const invoice = mastercard.ap4m.merchant.createInvoice({
        tabId: `${tab.id}-impostor`,
        invoiceId: `IMPOSTOR-${tab.id}`,
        channelId: tab.ap4m.channelId,
        amountWei: 1n,
        resourceUrl: `${config.publicBaseUrl}/x402/tabs/${tab.id}-impostor/resource`,
        content: { note: "impostor probe" },
      });
      const required = await mastercard.ap4m.merchant.requirement(invoice);
      const channel = await net.getChannel(tab.ap4m.channelId);
      const voucher = { channelId: tab.ap4m.channelId, cumulativeAmount: channel.redeemedWei + 1n };
      const impostor = Wallet.createRandom();
      const signature = await impostor.signTypedData(net.domain, { Voucher: [{ name: "channelId", type: "bytes32" }, { name: "cumulativeAmount", type: "uint256" }] }, voucher);
      const out = await mastercard.ap4m.merchant.handle({
        tabId: invoice.tabId,
        channelId: tab.ap4m.channelId,
        paymentSignature: encodePaymentSignature({
          x402Version: 2,
          accepted: required.accepts[0],
          payload: { voucher: { channelId: voucher.channelId, cumulativeAmount: voucher.cumulativeAmount.toString() }, agentSignature: signature },
        }),
      });
      bus.publish("ap4m.rejected", { tabId: tab.id, probe: "unverified-agent", impostor: impostor.address, status: out.status, body: out.body });
      return { impostor: impostor.address, merchantStatus: out.status, merchantResponse: out.body };
    });

    app.post("/demo/reset", staffOnly, async () => {
      await service.reset();
      return service.snapshot();
    });
  }

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

  // The Agent reaches the venue's x402 endpoint in-process (same HTTP routing, no network hop).
  mastercard.ap4m?.setFetch(async (url, headers) => {
    const res = await app.inject({ method: "GET", url: new URL(url).pathname, headers });
    return { status: res.statusCode, header: (name) => res.headers[name.toLowerCase()] as string | undefined, body: res.json() };
  });

  if (service.seedsLiveEscrows) void service.openSeedEscrows();

  return { app, service, bus, mastercard };
}

function corsHeaders(origin: string | undefined, allowed: string): Record<string, string> {
  if (allowed === "*") return { "access-control-allow-origin": origin ?? "*" };
  return origin && allowed.split(",").includes(origin) ? { "access-control-allow-origin": origin } : {};
}

/** preHandler for staff routes: 401 unless X-Staff-Token matches STAFF_TOKEN. With no STAFF_TOKEN set, the routes are open. */
function staffGuard(token: string) {
  const expected = sha256(token);
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!token) return;
    const given = req.headers["x-staff-token"];
    if (typeof given !== "string" || !timingSafeEqual(sha256(given), expected)) {
      return reply.status(401).send({ error: "Missing or wrong X-Staff-Token", code: "UNAUTHORIZED" });
    }
  };
}

// Hashing first gives timingSafeEqual equal-length inputs whatever was sent.
const sha256 = (value: string) => createHash("sha256").update(value).digest();
