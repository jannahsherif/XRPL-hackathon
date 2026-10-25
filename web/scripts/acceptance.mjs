// Acceptance run against a live API: reset, then the two stage scenarios, printing every SSE event
// with its timing. Exits 1 if a step fails or an expected event doesn't arrive in time.
//
//   1. m1 opens a tab, orders five items, exits, and the tab settles.
//   2. m5 opens a tab, orders the $900 bottle, exits, the agent holds it, a manager approves, it settles.
//
// Usage: node scripts/acceptance.mjs [--api http://localhost:8080] [--out run.json] [--fixture path]
// --fixture (module mode only) writes scenario 1 in the shape of ledger/fixtures/happy-path.json,
// which the API's stub ledger replays.
// Env: API_URL, STAFF_TOKEN (sent as X-Staff-Token when the API has one).
// In module mode (real ledger) it waits until 32 s after each open before exiting, because an escrow
// can't be finished before FinishAfter (20 s after open, plus ledger close-time rounding).
import { writeFile } from "node:fs/promises";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const API = (flag("api") ?? process.env.API_URL ?? "http://localhost:8080").replace(/\/+$/, "");
const OUT = flag("out");
const FIXTURE = flag("fixture");
const STAFF_TOKEN = process.env.STAFF_TOKEN ?? "";
const FIVE_ITEMS = ["martini", "old-fashioned", "oysters", "burger", "fries"];

const t0 = Date.now();
const elapsed = () => `+${((Date.now() - t0) / 1000).toFixed(3).padStart(7)}s`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const money = (cents) => `$${(cents / 100).toFixed(2)}`;

// HTTP -----------------------------------------------------------------------------------

async function call(method, path, body) {
  const headers = { "content-type": "application/json", ...(STAFF_TOKEN ? { "x-staff-token": STAFF_TOKEN } : {}) };
  const res = await fetch(`${API}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${json?.code ?? ""} ${json?.error ?? text}`.trim());
  return json;
}
const post = (path, body = {}) => call("POST", path, body);
const get = (path) => call("GET", path);

// SSE ------------------------------------------------------------------------------------

const events = [];
const waiters = new Set();
const stream = new AbortController();

function describe(e) {
  const d = e.data ?? {};
  const tab = d.tab;
  switch (e.type) {
    case "tab.opened":
      return `${tab.id} ${tab.memberName} allowance ${tab.allowance} ledger ${d.ledgerIndex} escrow ${tab.escrow.txHash ?? "-"}`;
    case "tab.item_added":
      return `${tab.id} + ${d.item.name} → ${money(tab.totalCents)} (headroom ${money(d.headroomCents)})`;
    case "tab.exit_detected":
      return tab.id;
    case "member.push":
      return `${d.tabId} ${money(d.totalCents)}, grace ${d.secondsLeft} s`;
    case "tab.grace_tick":
      return `${d.tabId} ${d.secondsLeft}`;
    case "agent.decision":
      return `${d.tabId} ${d.action} tip ${d.tipPct}% (${d.source}${d.code ? ` ${d.code}` : ""}) ${d.reason}`;
    case "tab.held":
      return `${tab.id} ${d.hold.code} (${d.hold.source}) ${d.hold.reason}`;
    case "tab.settled":
      return `${tab.id} ${d.settlement.toVenue} to venue, ${d.settlement.toMember} back, ${d.settlement.elapsedMs} ms (${d.settlement.mode ?? "?"})`;
    case "metrics.updated":
      return `outstanding ${money(d.outstandingCents)}, open ${d.openTabs}, settled ${d.settledCount}`;
    case "tab.updated":
      return `${tab?.id ?? ""} ${d.change}`.trim();
    default:
      return "";
  }
}

async function follow() {
  const res = await fetch(`${API}/events`, { headers: { accept: "text/event-stream" }, signal: stream.signal });
  if (!res.ok) throw new Error(`GET /events → ${res.status}`);
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of res.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let cut;
    while ((cut = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, cut);
      buffer = buffer.slice(cut + 2);
      const data = block.split("\n").find((l) => l.startsWith("data: "));
      if (!data) continue; // heartbeat
      const event = JSON.parse(data.slice(6));
      if (event.type === "snapshot") continue;
      events.push({ ...event, receivedMs: Date.now() - t0 });
      console.log(`${elapsed()}  ${event.type.padEnd(18)} ${describe(event)}`);
      for (const w of waiters) w(event);
    }
  }
}

/** Resolves with the first event (from now on) that matches; rejects after `seconds`. */
function waitFor(label, match, seconds) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      waiters.delete(check);
      reject(new Error(`timed out after ${seconds} s waiting for ${label}`));
    }, seconds * 1000);
    const check = (event) => {
      if (!match(event)) return;
      clearTimeout(timer);
      waiters.delete(check);
      resolve(event);
    };
    waiters.add(check);
  });
}

const forTab = (type, tabId) => (e) => e.type === type && (e.data?.tab?.id ?? e.data?.tabId) === tabId;

// Run ------------------------------------------------------------------------------------

const results = {};

async function waitPastFinishAfter(tab, minOpenSeconds) {
  const wait = Date.parse(tab.openedAt) + minOpenSeconds * 1000 - Date.now();
  if (wait <= 0) return;
  console.log(`${elapsed()}  …                  waiting ${Math.ceil(wait / 1000)} s for FinishAfter before exiting ${tab.id}`);
  await sleep(wait);
}

async function main() {
  const health = await get("/health").catch((err) => {
    throw new Error(`API not reachable at ${API}: ${err.message}`);
  });
  const state = await get("/state");
  const live = state.mode.ledger !== "stub";
  const minOpenSeconds = live ? 32 : 0;
  // Settling on testnet takes 4-10 s after grace; the stub takes LEDGER_STUB_DELAY_MS (3 s).
  const settleSeconds = state.policy.graceSeconds + (live ? 60 : 20);
  console.log(`acceptance against ${API} · ledger ${state.mode.ledger} · grace ${state.policy.graceSeconds} s · API up ${health.at}`);

  void follow().catch((err) => {
    if (err.name !== "AbortError") console.error(`event stream failed: ${err.message}`);
  });
  await sleep(500);

  console.log(`${elapsed()}  ▶ reset`);
  await post("/demo/reset");

  // Scenario 1: the happy path.
  console.log(`${elapsed()}  ▶ scenario 1: m1 opens a tab, five items, exit, settle`);
  const a = await post("/tabs", { memberId: "m1", seat: "Bar 4" });
  results.happy = { tabId: a.id, escrow: a.escrow, openedAt: a.openedAt };
  for (const id of FIVE_ITEMS) await post(`/tabs/${a.id}/items`, { menuItemId: id });
  await waitPastFinishAfter(a, minOpenSeconds);
  const settledA = waitFor(`tab.settled for ${a.id}`, forTab("tab.settled", a.id), settleSeconds);
  await post(`/tabs/${a.id}/exit`);
  results.happy.settlement = (await settledA).data.settlement;

  // Scenario 2: the anomaly, held, approved, settled.
  console.log(`${elapsed()}  ▶ scenario 2: m5 opens a tab, the $900 bottle, exit, hold, approve, settle`);
  const b = await post("/tabs", { memberId: "m5", seat: "Library 2" });
  results.anomaly = { tabId: b.id, escrow: b.escrow, openedAt: b.openedAt };
  await post(`/tabs/${b.id}/items`, { menuItemId: "bottle-900" });
  await waitPastFinishAfter(b, minOpenSeconds);
  const heldB = waitFor(`tab.held for ${b.id}`, forTab("tab.held", b.id), state.policy.graceSeconds + 20);
  await post(`/tabs/${b.id}/exit`);
  results.anomaly.hold = (await heldB).data.hold;
  const settledB = waitFor(`tab.settled for ${b.id}`, forTab("tab.settled", b.id), live ? 60 : 20);
  console.log(`${elapsed()}  ▶ manager approves ${b.id}`);
  await post(`/tabs/${b.id}/approve`);
  results.anomaly.settlement = (await settledB).data.settlement;

  const s1 = results.happy.settlement;
  const s2 = results.anomaly.settlement;
  console.log("");
  console.log(`PASS in ${((Date.now() - t0) / 1000).toFixed(1)} s · ledger ${state.mode.ledger}`);
  console.log(`  happy   ${a.id}: ${s1.toVenue} to venue, ${s1.toMember} back, validated in ${s1.elapsedMs} ms`);
  for (const url of s1.explorerUrls) console.log(`          ${url}`);
  console.log(`  anomaly ${b.id}: held ${results.anomaly.hold.code} (${results.anomaly.hold.source}), approved, ${s2.toVenue} to venue, ${s2.toMember} back`);
  for (const url of s2.explorerUrls) console.log(`          ${url}`);
  if (a.escrow.explorerUrl) console.log(`  escrows  ${a.escrow.explorerUrl}\n          ${b.escrow.explorerUrl}`);
  return state.mode.ledger;
}

/** Scenario 1 as a replay fixture: the same shape ledger's demo:happy-path writes. */
function happyPathFixture() {
  const { tabId, escrow, settlement } = results.happy;
  const forHappy = events.filter((e) => (e.data?.tab?.id ?? e.data?.tabId) === tabId && e.type !== "tab.grace_tick");
  const opened = forHappy.find((e) => e.type === "tab.opened");
  return {
    source: "web/scripts/acceptance.mjs (scenario 1, LEDGER_MODE=module)",
    network: "testnet",
    capturedAt: new Date().toISOString(),
    memberId: "member-1",
    openTab: {
      submittedAt: escrow.submittedAt,
      validatedAt: escrow.validatedAt,
      escrowSeq: escrow.seq,
      txHash: escrow.txHash,
      explorerUrl: escrow.explorerUrl,
      ledgerIndex: opened?.data.ledgerIndex,
    },
    settleTab: settlement,
    events: forHappy.map((e) => ({ at: e.at, event: e.type, ...(e.type === "tab.settled" ? { txHash: settlement.batchTxHash ?? settlement.finishTxHash } : {}) })),
  };
}

let ledgerMode = "unknown";
try {
  ledgerMode = await main();
  process.exitCode = 0;
} catch (err) {
  console.error(`\nFAIL ${err.message}`);
  // /demo/reset reseeds tabs but not balances; approving the $900 tab leaves m5 with 200 of 1200.
  if (/INSUFFICIENT_FUNDS/.test(err.message)) {
    console.error("     Restore balances before each run: module mode `npm run demo:reset` in ledger/; stub mode restart the API.");
  }
  process.exitCode = 1;
} finally {
  stream.abort();
  if (OUT) {
    const run = { api: API, ledger: ledgerMode, passed: process.exitCode === 0, finishedAt: new Date().toISOString(), results, events };
    await writeFile(OUT, `${JSON.stringify(run, null, 2)}\n`);
    console.log(`wrote ${OUT}`);
  }
  if (FIXTURE && process.exitCode === 0 && ledgerMode === "module") {
    await writeFile(FIXTURE, `${JSON.stringify(happyPathFixture(), null, 2)}\n`);
    console.log(`wrote fixture ${FIXTURE}`);
  } else if (FIXTURE) {
    console.log(`fixture not written: it needs a passing run against LEDGER_MODE=module (this was ${ledgerMode})`);
  }
}
