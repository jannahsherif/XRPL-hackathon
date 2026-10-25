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

  it("stores ledger amounts with 2 decimals (the real ledger trims trailing zeros)", async () => {
    await built.app.close();
    const settleTab = vi.fn(async () => ({ finishTxHash: "F", refundTxHash: "R", toVenue: "45.6", toMember: "554.4", elapsedMs: 1, explorerUrls: [] }));
    await start({ ledger: fakeLedger({ settleTab }) });
    const { id } = await openTab();
    await post(`/tabs/${id}/items`, { menuItemId: "salmon" });
    await post(`/tabs/${id}/exit`);
    await new Promise((r) => setTimeout(r, 1300));
    const tab = (await get("/state")).json().tabs.find((t: { id: string }) => t.id === id);
    expect(tab.settlement).toMatchObject({ toVenue: "45.60", toMember: "554.40" });
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

  it.each([
    ["LEDGER_TIMEOUT", 504],
    ["LEDGER_REJECTED", 502],
    ["ESCROW_NOT_FOUND", 409],
  ])("close and reject map a %s cancel failure to %i and leave the tab as it was", async (code, status) => {
    await built.app.close();
    await start({ ledger: fakeLedger({ cancelTab: vi.fn().mockRejectedValue(Object.assign(new Error("boom"), { code })) }) });
    const { id } = await openTab();
    const closed = await post(`/tabs/${id}/close`);
    expect(closed.statusCode).toBe(status);
    expect(closed.json()).toEqual({ code, error: `Could not cancel escrow (${code})` });
    await post(`/tabs/${id}/dispute`);
    const rejected = await post(`/tabs/${id}/reject`);
    expect(rejected.statusCode).toBe(status);
    expect((await get(`/tabs/${id}`)).json().status).toBe("held");
  });

  it.each([
    ["no code", new Error("socket hang up")],
    ["an unknown code", Object.assign(new Error("internal detail"), { code: "SOMETHING_ELSE" })],
  ])("close is 409 when the cancel fails with %s", async (_label, err) => {
    await built.app.close();
    await start({ ledger: fakeLedger({ cancelTab: vi.fn().mockRejectedValue(err) }) });
    const { id } = await openTab();
    const res = await post(`/tabs/${id}/close`);
    expect(res.statusCode).toBe(409);
    expect(res.json().error).not.toMatch(/socket hang up|internal detail/);
  });

  it.each(["exit", "tip", "dispute", "approve", "reject", "close"])("%s is 404 for an unknown tab", async (action) => {
    expect((await post(`/tabs/ghost/${action}`, { pct: 10 })).statusCode).toBe(404);
  });
});

describe("credentials (L7)", () => {
  it("/state says who is credentialed: m1-m5, not m6", async () => {
    const members = (await get("/state")).json().members as { id: string; credentialed: boolean }[];
    expect(Object.fromEntries(members.map((m) => [m.id, m.credentialed]))).toEqual({ m1: true, m2: true, m3: true, m4: true, m5: true, m6: false });
  });

  it("POST /tabs for an uncredentialed member is 403 NOT_CREDENTIALED and never reaches the ledger", async () => {
    await built.app.close();
    const ledger = fakeLedger();
    await start({ ledger });
    const res = await post("/tabs", { memberId: "m6" });
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: "Casey Moreau is not a credentialed member", code: "NOT_CREDENTIALED" });
    expect(ledger.openTab).not.toHaveBeenCalled();
  });

  it("maps the ledger's refusal (a credential revoked since boot) to 403 and marks the member", async () => {
    await built.app.close();
    const refuse = vi.fn().mockRejectedValue(Object.assign(new Error("member is not credentialed"), { code: "INVALID_INPUT" }));
    await start({ ledger: fakeLedger({ openTab: refuse }) });
    expect((await post("/tabs", { memberId: "m4" })).json()).toMatchObject({ code: "NOT_CREDENTIALED" });
    expect((await get("/state")).json().members.find((m: { id: string }) => m.id === "m4").credentialed).toBe(false);
  });

  it("re-checks a member last seen uncredentialed, so a re-issued credential counts at once", async () => {
    await built.app.close();
    await start({ ledger: fakeLedger({ getBalances: vi.fn(async () => ({ venue: "0", members: {}, credentialed: { m6: true } })) }) });
    expect((await post("/tabs", { memberId: "m6" })).statusCode).toBe(201);
  });
});

describe("GET /balances", () => {
  it("returns every amount with 2 decimals", async () => {
    await built.app.close();
    await start({ ledger: fakeLedger({ getBalances: vi.fn(async () => ({ venue: "99.4", members: { m1: "5000", m2: "800.5" } })) }) });
    expect((await get("/balances")).json()).toEqual({ venue: "99.40", members: { m1: "5000.00", m2: "800.50" } });
  });

  it("passes non-amounts and extra fields through (AP4M mode)", async () => {
    await built.app.close();
    await start({ ledger: fakeLedger({ getBalances: vi.fn(async () => ({ venue: "n/a", members: {}, budgetRlusd: "20" })) }) });
    expect((await get("/balances")).json()).toEqual({ venue: "n/a", members: {}, budgetRlusd: "20" });
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

describe("staff token (STAFF_TOKEN)", () => {
  const TOKEN = "staff-secret";
  const asStaff = (method: "POST" | "PATCH", url: string, token?: string, payload?: object) =>
    built.app.inject({ method, url, payload, headers: token === undefined ? {} : { "x-staff-token": token } });

  beforeEach(async () => {
    await built.app.close();
    await start({}, { staffToken: TOKEN });
  });

  it("approve needs the header: 401 without it or with the wrong one, 200 with it", async () => {
    const { id } = await openTab();
    await post(`/tabs/${id}/dispute`);
    for (const token of [undefined, "wrong", ""]) {
      const res = await asStaff("POST", `/tabs/${id}/approve`, token);
      expect(res.statusCode).toBe(401);
      expect(res.json()).toMatchObject({ code: "UNAUTHORIZED" });
    }
    expect((await get(`/tabs/${id}`)).json().status).toBe("held");
    const res = await asStaff("POST", `/tabs/${id}/approve`, TOKEN);
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("settled");
  });

  it.each([
    ["POST", "/tabs/t1/reject"],
    ["POST", "/tabs/t1/close"],
    ["PATCH", "/policy"],
    ["POST", "/members/m1/fund"],
    ["POST", "/demo/reset"],
  ] as const)("%s %s is 401 without the header", async (method, url) => {
    const res = await asStaff(method, url, undefined, { amountCents: 100 });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("member, POS and read routes stay open", async () => {
    const { id } = await openTab();
    expect((await post(`/tabs/${id}/items`, { menuItemId: "espresso" })).statusCode).toBe(200);
    expect((await post(`/tabs/${id}/exit`)).statusCode).toBe(200);
    expect((await post(`/tabs/${id}/tip`, { pct: 18 })).statusCode).toBe(200);
    expect((await post(`/tabs/${id}/dispute`)).statusCode).toBe(200);
    expect((await get("/state")).statusCode).toBe(200);
    expect((await get("/policy")).statusCode).toBe(200);
  });
});

describe("DEMO=0", () => {
  it("does not register /demo/* routes", async () => {
    await built.app.close();
    await start({}, { demo: false });
    expect((await post("/demo/reset")).statusCode).toBe(404);
    expect((await post("/demo/ap4m/over-cap/t1")).statusCode).toBe(404);
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
