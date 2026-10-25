// Captures src/fixtures/state.json (GET /state + /balances) and src/fixtures/events.json (the replayed
// event history) from a running API, so every screen renders with VITE_MOCK=1. Run the API with
// `npm run dev` in api/ (stub ledger, DEMO=1), then `npm run fixture` here. It resets the demo first.
//
// What it leaves behind: m1 at Bar 4 settled with five lines and a 20% tip, t5 (m5) held on the
// $900 bottle, t4 mid-grace, everything else as seeded.
import { writeFile } from "node:fs/promises";

const API = (process.env.API_URL ?? "http://localhost:8080").replace(/\/+$/, "");
const headers = { "content-type": "application/json", ...(process.env.STAFF_TOKEN ? { "x-staff-token": process.env.STAFF_TOKEN } : {}) };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(method, path, body) {
  const res = await fetch(`${API}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${JSON.stringify(json)}`);
  return json;
}
const post = (path, body = {}) => call("POST", path, body);
const get = (path) => call("GET", path);

async function waitFor(tabId, status, timeoutMs = 60_000) {
  const until = Date.now() + timeoutMs;
  for (;;) {
    const tab = await get(`/tabs/${tabId}`);
    if (tab.status === status) return tab;
    if (Date.now() > until) throw new Error(`${tabId} stuck in ${tab.status}, wanted ${status}`);
    await sleep(500);
  }
}

async function replayedEvents() {
  const controller = new AbortController();
  const res = await fetch(`${API}/events?replay=1`, { signal: controller.signal });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  setTimeout(() => controller.abort(), 800);
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }
  } catch {
    // aborted: the replay arrives in the first few milliseconds
  }
  return text
    .split("\n\n")
    .map((block) => block.split("\n").find((l) => l.startsWith("data: ")))
    .filter(Boolean)
    .map((line) => JSON.parse(line.slice(6)))
    .filter((e) => e.type !== "snapshot");
}

console.log(`capturing from ${API}`);
await post("/demo/reset");

const tab = await post("/tabs", { memberId: "m1", seat: "Bar 4" });
for (const id of ["martini", "martini", "old-fashioned", "old-fashioned", "oysters", "burger", "fries"]) {
  await post(`/tabs/${tab.id}/items`, { menuItemId: id });
}
await post(`/tabs/${tab.id}/exit`);
await post(`/tabs/${tab.id}/tip`, { pct: 20 });
await waitFor(tab.id, "settled");
console.log(`${tab.id} settled`);

await post("/tabs/t5/items", { menuItemId: "bottle-900" });
await post("/tabs/t5/exit");
await waitFor("t5", "held");
console.log("t5 held");

await post("/tabs/t4/exit");
await sleep(2500);

const events = await replayedEvents();
const state = await get("/state");
const balances = await get("/balances");
const capturedAt = new Date().toISOString();

const dir = new URL("../src/fixtures/", import.meta.url);
await writeFile(new URL("state.json", dir), `${JSON.stringify({ capturedAt, ...state, balances }, null, 2)}\n`);
await writeFile(new URL("events.json", dir), `${JSON.stringify(events, null, 2)}\n`);
console.log(`wrote state.json (${state.tabs.length} tabs) and events.json (${events.length} events)`);
