import type { AddressInfo } from "node:net";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildApp } from "../src/app.js";
import { fakeLedger, fixedAgent, testConfig } from "./helpers.js";

type Built = Awaited<ReturnType<typeof buildApp>>;
let built: Built;
let base: string;
const controllers: AbortController[] = [];

interface SseMessage {
  event: string;
  data: unknown;
}

/** Minimal SSE client over fetch that collects parsed messages. */
async function connect(path = "/events", headers: Record<string, string> = {}) {
  const controller = new AbortController();
  controllers.push(controller);
  const res = await fetch(`${base}${path}`, { signal: controller.signal, headers });
  const messages: SseMessage[] = [];
  const comments: string[] = [];
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  void (async () => {
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) return;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n\n")) >= 0) {
          const block = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          if (block.startsWith(":")) {
            comments.push(block);
            continue;
          }
          const event = /^event: (.*)$/m.exec(block)?.[1] ?? "message";
          const data = /^data: (.*)$/m.exec(block)?.[1];
          messages.push({ event, data: data ? JSON.parse(data) : null });
        }
      }
    } catch {
      /* aborted */
    }
  })();
  const waitFor = async (event: string, count = 1, timeoutMs = 4000) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const found = messages.filter((m) => m.event === event);
      if (found.length >= count) return found;
      await new Promise((r) => setTimeout(r, 20));
    }
    throw new Error(`timed out waiting for ${count}x ${event}; got ${messages.map((m) => m.event).join(", ")}`);
  };
  return { res, messages, comments, waitFor, close: () => controller.abort() };
}

const post = (url: string, body?: unknown) =>
  fetch(`${base}${url}`, {
    method: "POST",
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

beforeEach(async () => {
  built = await buildApp(testConfig({ graceSeconds: 1 }), { ledger: fakeLedger(), agent: fixedAgent() });
  built.app.log.level = "silent";
  await built.app.listen({ port: 0, host: "127.0.0.1" });
  base = `http://127.0.0.1:${(built.app.server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  controllers.splice(0).forEach((c) => c.abort());
  await built.app.close();
});

describe("GET /events (SSE)", () => {
  it("responds with an event stream and the right headers", async () => {
    const sse = await connect();
    expect(sse.res.status).toBe(200);
    expect(sse.res.headers.get("content-type")).toBe("text/event-stream");
    expect(sse.res.headers.get("cache-control")).toBe("no-cache, no-transform");
    expect(sse.res.headers.get("x-accel-buffering")).toBe("no");
  });

  it("sends a snapshot first", async () => {
    const sse = await connect();
    const [snapshot] = await sse.waitFor("snapshot");
    expect(snapshot.data).toMatchObject({ tabs: expect.any(Array), metrics: { outstandingCents: 34218000 } });
    expect(sse.messages[0].event).toBe("snapshot");
  });

  it("streams the whole happy path with named events", async () => {
    const sse = await connect();
    await sse.waitFor("snapshot");
    const tab = (await (await post("/tabs", { memberId: "m2" })).json()) as { id: string };
    await post(`/tabs/${tab.id}/items`, { menuItemId: "steak" });
    await post(`/tabs/${tab.id}/exit`);
    await sse.waitFor("tab.settled");

    const order = sse.messages.map((m) => m.event).filter((e) => e !== "metrics.updated" && e !== "tab.grace_tick");
    expect(order).toEqual(["snapshot", "tab.opened", "tab.item_added", "tab.exit_detected", "member.push", "tab.updated", "agent.decision", "tab.settled"]);
    const settled = sse.messages.find((m) => m.event === "tab.settled")!.data as { type: string; at: string; data: { tab: { id: string } } };
    expect(settled.type).toBe("tab.settled");
    expect(settled.at).toMatch(/Z$/);
    expect(settled.data.tab.id).toBe(tab.id);
  });

  it("broadcasts to every connected client", async () => {
    const a = await connect();
    const b = await connect();
    await Promise.all([a.waitFor("snapshot"), b.waitFor("snapshot")]);
    await post("/tabs", { memberId: "m3" });
    await Promise.all([a.waitFor("tab.opened"), b.waitFor("tab.opened")]);
  });

  it("stops sending to a client after it disconnects", async () => {
    const a = await connect();
    await a.waitFor("snapshot");
    a.close();
    await new Promise((r) => setTimeout(r, 100));
    await post("/tabs", { memberId: "m3" });
    const b = await connect();
    await b.waitFor("snapshot");
    expect(a.messages.some((m) => m.event === "tab.opened")).toBe(false);
  });

  it("replays recent events with ?replay=1", async () => {
    await post("/tabs", { memberId: "m3" });
    const sse = await connect("/events?replay=1");
    const [opened] = await sse.waitFor("tab.opened");
    expect((opened.data as { type: string }).type).toBe("tab.opened");
  });

  it("does not replay without the flag", async () => {
    await post("/tabs", { memberId: "m3" });
    const sse = await connect();
    await sse.waitFor("snapshot");
    await new Promise((r) => setTimeout(r, 100));
    expect(sse.messages.some((m) => m.event === "tab.opened")).toBe(false);
  });

  it("echoes the request origin for CORS", async () => {
    const sse = await connect("/events", { origin: "http://localhost:5173" });
    expect(sse.res.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
  });

  it("emits a held event for the anomaly path", async () => {
    await built.app.close();
    const { createSettlementAgent } = await import("../src/agent/settlementAgent.js");
    built = await buildApp(testConfig({ graceSeconds: 1 }), { ledger: fakeLedger(), agent: createSettlementAgent(testConfig()) });
    built.app.log.level = "silent";
    await built.app.listen({ port: 0, host: "127.0.0.1" });
    base = `http://127.0.0.1:${(built.app.server.address() as AddressInfo).port}`;

    const sse = await connect();
    await sse.waitFor("snapshot");
    const tab = (await (await post("/tabs", { memberId: "m5" })).json()) as { id: string };
    await post(`/tabs/${tab.id}/items`, { menuItemId: "bottle-900" });
    await post(`/tabs/${tab.id}/exit`);
    const [held] = await sse.waitFor("tab.held");
    expect((held.data as { data: { hold: { reason: string } } }).data.hold.reason).toMatch(/typical/);
    await post(`/tabs/${tab.id}/approve`);
    await sse.waitFor("tab.settled");
  });
});
