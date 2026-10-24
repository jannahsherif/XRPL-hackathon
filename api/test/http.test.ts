import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildApp } from "../src/app.js";
import { fakeLedger, fixedAgent, testConfig } from "./helpers.js";

type Built = Awaited<ReturnType<typeof buildApp>>;
let built: Built;

// Frozen contract fields plus the two additive Mastercard fields (mandate, ap4m).
const TAB_KEYS = [
  "allowance", "ap4m", "escrow", "graceEndsAt", "hold", "id", "items", "mandate", "memberId", "memberName",
  "openedAt", "seat", "settlement", "status", "tipCents", "totalCents",
].sort();

async function start(opts: Parameters<typeof buildApp>[1] = {}, config = {}) {
  built = await buildApp(testConfig({ graceSeconds: 1, ...config }), { ledger: fakeLedger(), agent: fixedAgent(), ...opts });
  return built.app;
}

const post = (url: string, payload?: unknown) => built.app.inject({ method: "POST", url, payload: payload as object });
const get = (url: string) => built.app.inject({ method: "GET", url });

beforeEach(async () => {
  await start();
});
afterEach(async () => {
  await built.app.close();
  vi.useRealTimers();
});

async function openTab(memberId = "m2") {
  const res = await post("/tabs", { memberId, seat: "Table 9" });
  return res.json() as { id: string };
}

describe("GET /health and /state", () => {
  it("health returns ok", async () => {
    const res = await get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ ok: true });
  });

  it("state returns the full snapshot with contract-shaped tabs", async () => {
    const body = (await get("/state")).json();
    expect(Object.keys(body).sort()).toEqual(["members", "menu", "metrics", "mode", "policy", "tabs"]);
    for (const tab of body.tabs) expect(Object.keys(tab).sort()).toEqual(TAB_KEYS);
    expect(body.metrics).toEqual({ outstandingCents: 34218000, openTabs: 6, settledCount: 0, avgSettleMs: 0 });
  });

  it("returns JSON content type", async () => {
    expect((await get("/state")).headers["content-type"]).toMatch(/application\/json/);
  });
});

describe("POST /tabs", () => {
  it("opens a tab (201) with an escrow", async () => {
    const res = await post("/tabs", { memberId: "m3" });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ id: "t101", status: "open", allowance: "600.00", escrow: { txHash: expect.any(String) } });
  });

  it.each([[undefined], [{}], [{ memberId: "" }]])("400 without memberId (%j)", async (payload) => {
    const res = await post("/tabs", payload);
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: "memberId is required" });
  });

  it("404 for an unknown member", async () => {
    expect((await post("/tabs", { memberId: "ghost" })).statusCode).toBe(404);
  });

  it("500 with a message when the ledger fails unexpectedly", async () => {
    await built.app.close();
    await start({ ledger: fakeLedger({ openTab: vi.fn().mockRejectedValue(new Error("testnet unreachable")) }) });
    built.app.log.level = "silent";
    const res = await post("/tabs", { memberId: "m2" });
    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({ error: "testnet unreachable" });
  });
});

describe("GET /tabs/:id", () => {
  it("returns a tab", async () => {
    expect((await get("/tabs/t1")).json()).toMatchObject({ id: "t1", memberId: "m1" });
  });

  it("404 for an unknown tab", async () => {
    const res = await get("/tabs/zzz");
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: "Unknown tab zzz" });
  });
});

describe("POST /tabs/:id/items", () => {
  it("adds an item and returns the tab", async () => {
    const { id } = await openTab();
    const res = await post(`/tabs/${id}/items`, { menuItemId: "steak", qty: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: "ordering", totalCents: 13600, items: [{ name: "Dry-Aged Ribeye", qty: 2 }] });
  });

  it("defaults qty to 1", async () => {
    const { id } = await openTab();
    expect((await post(`/tabs/${id}/items`, { menuItemId: "espresso" })).json().items[0].qty).toBe(1);
  });

  it("400 without menuItemId", async () => {
    const { id } = await openTab();
    expect((await post(`/tabs/${id}/items`, {})).statusCode).toBe(400);
  });

  it("404 for an unknown menu item or tab", async () => {
    const { id } = await openTab();
    expect((await post(`/tabs/${id}/items`, { menuItemId: "caviar" })).statusCode).toBe(404);
    expect((await post(`/tabs/nope/items`, { menuItemId: "steak" })).statusCode).toBe(404);
  });

  it("409 after exit", async () => {
    const { id } = await openTab();
    await post(`/tabs/${id}/exit`);
    expect((await post(`/tabs/${id}/items`, { menuItemId: "steak" })).statusCode).toBe(409);
  });
});

describe("exit -> settle over HTTP", () => {
  it("exit returns the tab in grace with graceEndsAt", async () => {
    const { id } = await openTab();
    const res = await post(`/tabs/${id}/exit`);
    expect(res.json()).toMatchObject({ status: "grace", graceEndsAt: expect.any(String) });
  });

  it("settles after the grace period", async () => {
    const { id } = await openTab();
    await post(`/tabs/${id}/items`, { menuItemId: "salmon" });
    await post(`/tabs/${id}/exit`);
    await new Promise((r) => setTimeout(r, 1300));
    const tab = (await get(`/tabs/${id}`)).json();
    expect(tab.status).toBe("settled");
    expect(tab.settlement).toMatchObject({ finishTxHash: expect.any(String), toVenue: "45.60" });
    expect((await get("/metrics")).json()).toMatchObject({ settledCount: 1, outstandingCents: 34218000 - 4560 });
  });

  it("409 when exiting twice", async () => {
    const { id } = await openTab();
    await post(`/tabs/${id}/exit`);
    const res = await post(`/tabs/${id}/exit`);
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toMatch(/Cannot move tab from grace to exit_detected/);
  });
});

describe("POST /tabs/:id/tip", () => {
  it("sets the tip", async () => {
    const { id } = await openTab();
    await post(`/tabs/${id}/items`, { menuItemId: "steak" });
    expect((await post(`/tabs/${id}/tip`, { pct: 15 })).json().tipCents).toBe(1020);
  });

  it("400 without pct", async () => {
    const { id } = await openTab();
    expect((await post(`/tabs/${id}/tip`, {})).statusCode).toBe(400);
  });

  it("409 for a non-numeric pct", async () => {
    const { id } = await openTab();
    expect((await post(`/tabs/${id}/tip`, { pct: "lots" })).statusCode).toBe(409);
  });
});

describe("dispute / approve / reject / close", () => {
  it("dispute holds the tab with the note", async () => {
    const { id } = await openTab();
    await post(`/tabs/${id}/exit`);
    const res = await post(`/tabs/${id}/dispute`, { note: "Wrong table" });
    expect(res.json()).toMatchObject({ status: "held", hold: { reason: "Member disputed: Wrong table" } });
  });

  it("dispute works without a body", async () => {
    const { id } = await openTab();
    expect((await post(`/tabs/${id}/dispute`)).json().status).toBe("held");
  });

  it("approve settles a held tab", async () => {
    const { id } = await openTab();
    await post(`/tabs/${id}/dispute`);
    const res = await post(`/tabs/${id}/approve`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: "settled", hold: null });
  });

  it("reject closes a held tab", async () => {
    const { id } = await openTab();
    await post(`/tabs/${id}/dispute`);
    expect((await post(`/tabs/${id}/reject`)).json().status).toBe("closed_manually");
  });

  it("approve and reject are 409 on a tab that is not held", async () => {
    const { id } = await openTab();
    expect((await post(`/tabs/${id}/approve`)).statusCode).toBe(409);
    expect((await post(`/tabs/${id}/reject`)).statusCode).toBe(409);
  });

  it("close is 200 once, then 409", async () => {
    const { id } = await openTab();
    expect((await post(`/tabs/${id}/close`)).json().status).toBe("closed_manually");
    expect((await post(`/tabs/${id}/close`)).statusCode).toBe(409);
  });

  it.each(["exit", "tip", "dispute", "approve", "reject", "close"])("%s is 404 for an unknown tab", async (action) => {
    expect((await post(`/tabs/ghost/${action}`, { pct: 10 })).statusCode).toBe(404);
  });
});

describe("policy, metrics and reset", () => {
  it("GET /policy returns the contract policy", async () => {
    expect((await get("/policy")).json()).toMatchObject({ defaultTipPct: 20, holdIfTotalOverTypicalX: 3 });
  });

  it("PATCH /policy updates and returns it", async () => {
    const res = await built.app.inject({ method: "PATCH", url: "/policy", payload: { defaultTipPct: 18 } });
    expect(res.json().defaultTipPct).toBe(18);
    expect((await get("/state")).json().policy.defaultTipPct).toBe(18);
  });

  it("PATCH /policy with an empty body is a no-op", async () => {
    const res = await built.app.inject({ method: "PATCH", url: "/policy" });
    expect(res.statusCode).toBe(200);
    expect(res.json().defaultTipPct).toBe(20);
  });

  it("GET /metrics", async () => {
    expect((await get("/metrics")).json()).toEqual({ outstandingCents: 34218000, openTabs: 6, settledCount: 0, avgSettleMs: 0 });
  });

  it("POST /demo/reset reseeds and returns the state", async () => {
    await openTab();
    const res = await post("/demo/reset");
    expect(res.json().tabs).toHaveLength(6);
    expect((await get("/state")).json().tabs).toHaveLength(6);
  });

  it("404 for unknown routes", async () => {
    expect((await get("/nope")).statusCode).toBe(404);
  });
});

describe("CORS", () => {
  it("allows any origin by default", async () => {
    const res = await built.app.inject({ method: "GET", url: "/state", headers: { origin: "http://localhost:5173" } });
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });

  it("answers preflight requests", async () => {
    const res = await built.app.inject({
      method: "OPTIONS",
      url: "/tabs",
      headers: { origin: "http://localhost:5173", "access-control-request-method": "POST" },
    });
    expect(res.statusCode).toBe(204);
  });

  it("restricts origins when configured", async () => {
    await built.app.close();
    await start({}, { corsOrigin: "https://settle.example.com" });
    const allowed = await built.app.inject({ method: "GET", url: "/state", headers: { origin: "https://settle.example.com" } });
    const denied = await built.app.inject({ method: "GET", url: "/state", headers: { origin: "https://evil.example.com" } });
    expect(allowed.headers["access-control-allow-origin"]).toBe("https://settle.example.com");
    expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
