// Demo autopilot: drives DEMO.md scenarios A and B through /present in a real browser window so the
// video can be recorded hands-free. It waits for each settle and hold to appear (no fixed sleeps on the
// ledger) and pauses where you narrate. Run DEMO.md section 0 (pre-flight) first.
//
//   cd web && npm run demo:autopilot -- [options]
//
//   --base <url>      web app (default http://localhost:5173)
//   --api <url>       API, checked before starting (default VITE_API_URL or http://localhost:8080)
//   --step            wait for Enter at each narration point instead of a timed pause
//   --pause <x>       scale the timed pauses (default 1; 0.5 is faster, 2 slower)
//   --only a|b        run one scenario
//   --video <dir>     also save Playwright's own recording (.webm, 1920x1080); needs a one-time
//                     npx playwright@1.64.1 install ffmpeg
//   --shots <dir>     save a screenshot at each narration point
//   --headless        no window (to test the script)
//   --force           start even if t1/t5 aren't fresh and escrowed
//   --browser <path>  Chrome/Chromium to drive (default: Playwright's cached Chromium, then Chrome, then Brave)
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import readline from "node:readline/promises";

import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const BASE = opt("base", "http://localhost:5173").replace(/\/+$/, "");
const API = opt("api", process.env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");
const STEP = flag("step");
const PAUSE = Number(opt("pause", "1"));
const ONLY = opt("only", "");
const VIDEO = opt("video", "");
const SHOTS = opt("shots", "");
const HEADLESS = flag("headless");

const t0 = Date.now();
const say = (msg) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1).padStart(6)}s] ${msg}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findBrowser() {
  const given = opt("browser", process.env.DEMO_BROWSER);
  if (given) return given;
  const cache = path.join(homedir(), "Library/Caches/ms-playwright");
  const builds = existsSync(cache) ? readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse() : [];
  const candidates = [
    ...builds.map((b) => path.join(cache, b, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing")),
    ...builds.map((b) => path.join(cache, b, "chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing")),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error("No Chrome/Chromium found: pass --browser <path>, or run npx playwright@1.64.1 install chromium");
  return found;
}

/** Stops unless t1 and t5 are as pre-flight leaves them (and escrowed on the real ledger). */
async function preflight() {
  const state = await fetch(`${API}/state`).then((r) => r.json()).catch(() => null);
  if (!state) throw new Error(`API not reachable at ${API}: boot it first (DEMO.md section 0)`);
  const live = state.mode.ledger !== "stub";
  const problems = [];
  for (const [id, total] of [["t1", 6200], ["t5", 4400]]) {
    const tab = state.tabs.find((t) => t.id === id);
    if (!tab) problems.push(`${id} is missing`);
    else if (tab.status !== "ordering" || tab.totalCents !== total) problems.push(`${id} is ${tab.status}, $${(tab.totalCents / 100).toFixed(2)} (expected fresh)`);
    else if (live && !tab.escrow.txHash) problems.push(`${id} has no escrow yet (wait for the seed EscrowCreates)`);
  }
  say(`API ${API} · ledger ${state.mode.ledger}${problems.length ? ` · ${problems.join("; ")}` : " · t1 and t5 ready"}`);
  if (problems.length && !flag("force")) throw new Error("Run pre-flight (DEMO.md section 0) first, or pass --force");
}

// A visible cursor, a ripple on every click and a badge for each hotkey, so viewers can follow along.
function overlays() {
  const install = () => {
    if (document.getElementById("__demo_cursor")) return;
    const cursor = document.createElement("div");
    cursor.id = "__demo_cursor";
    cursor.style.cssText = "position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px)";
    cursor.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2l7 19 2.6-7.4L21 11z" fill="#0F1F1D" stroke="#F7F4EE" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.body.appendChild(cursor);
    addEventListener("mousemove", (e) => (cursor.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 2}px)`), true);
    addEventListener(
      "mousedown",
      (e) => {
        const ring = document.createElement("div");
        ring.style.cssText = `position:fixed;left:${e.clientX - 20}px;top:${e.clientY - 20}px;width:40px;height:40px;border-radius:50%;border:3px solid #6F8F7E;z-index:2147483646;pointer-events:none;transition:transform .5s ease-out,opacity .5s ease-out`;
        document.body.appendChild(ring);
        requestAnimationFrame(() => ((ring.style.transform = "scale(1.9)"), (ring.style.opacity = "0")));
        setTimeout(() => ring.remove(), 550);
      },
      true,
    );
    window.__demoKey = (label) => {
      const badge = document.createElement("div");
      badge.textContent = label;
      badge.style.cssText = "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);padding:8px 18px;border-radius:12px;background:rgba(15,31,29,.88);color:#F7F4EE;font:600 20px Inter,system-ui,sans-serif;z-index:2147483647;pointer-events:none;transition:opacity .4s";
      document.body.appendChild(badge);
      setTimeout(() => (badge.style.opacity = "0"), 900);
      setTimeout(() => badge.remove(), 1300);
    };
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", install);
  else install();
}

async function main() {
  await preflight();
  const executablePath = findBrowser();
  say(`browser ${executablePath}`);
  const browser = await chromium.launch({ executablePath, headless: HEADLESS, args: ["--window-size=1920,1080", "--window-position=0,0", "--hide-scrollbars"] });
  if (VIDEO) mkdirSync(VIDEO, { recursive: true });
  if (SHOTS) mkdirSync(SHOTS, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, ...(VIDEO ? { recordVideo: { dir: VIDEO, size: { width: 1920, height: 1080 } } } : {}) });
  await context.addInitScript(overlays);
  const page = await context.newPage();
  page.on("pageerror", (e) => say(`page error: ${e.message}`));
  const rl = STEP ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
  let shot = 0;

  /** A narration point: a timed pause, or Enter with --step. */
  const narrate = async (cue, seconds) => {
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${String(++shot).padStart(2, "0")}.png`) });
    if (rl) await rl.question(`  ▸ ${cue}  [Enter] `);
    else {
      say(`  ▸ ${cue}`);
      await sleep(seconds * 1000 * PAUSE);
    }
  };
  const key = async (k, label) => {
    await page.evaluate((l) => window.__demoKey?.(l), `${k.toUpperCase()} · ${label}`);
    await page.keyboard.press(k);
    await sleep(700);
  };
  const click = async (locator) => {
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    if (!box) throw new Error(`nothing to click for ${locator}`);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 24 });
    await sleep(180);
    await page.mouse.down();
    await page.mouse.up();
    await sleep(350);
  };
  const waitFor = async (selector, seconds, what) => {
    const started = Date.now();
    await page.waitForSelector(selector, { timeout: seconds * 1000 });
    say(`${what} (${((Date.now() - started) / 1000).toFixed(1)} s)`);
  };
  const tile = (name) => page.locator(`main section .grid > button:has-text("${name}")`);
  const row = (text) => page.locator(`tbody tr:has-text("${text}")`).first();

  await page.goto(`${BASE}/present`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Tonight");
  await page.mouse.move(960, 540);
  await narrate("Intro: tonight at The House", 3);

  if (ONLY !== "b") {
    say("Scenario A: E. Vance walks out");
    await key("p", "POS");
    await page.locator("aside select").first().selectOption("t1");
    await sleep(400);
    for (const item of ["Old Fashioned", "Old Fashioned", "Club Burger", "Truffle Fries"]) {
      await click(tile(item));
      await sleep(800); // past the 600 ms tap debounce
    }
    await page.waitForSelector('aside:has-text("$142.00")', { timeout: 10_000 });
    await narrate("No card, no pre-auth: $142.00 streamed to Settle", 4);
    await key("1", "Member phone");
    await key("d", "Dashboard");
    await click(row("Bar 3"));
    await narrate("The allowance is escrowed on XRPL", 5);
    await click(page.locator("text=Simulate exit · DEMO"));
    await waitFor("text=Looks like you've left", 10, "push on the member's phone");
    await narrate("The member left: 10 s to tip or dispute", 0);
    await waitFor("text=Settling…", 20, "grace over, settling");
    await waitFor("text=Settled with The House", 120, "settled on XRPL");
    await sleep(1500); // ledger fee and index fill in
    await narrate("Settled: to venue, back to member, validated in seconds", 7);
  }

  if (ONLY !== "a") {
    say("Scenario B: the $900 bottle");
    await key("p", "POS");
    await page.locator("aside select").first().selectOption("t5");
    await sleep(400);
    await click(tile("Dom Pérignon"));
    await page.waitForSelector('aside:has-text("$944.00")', { timeout: 10_000 });
    await narrate("A $900 bottle on a member who usually spends $120", 3);
    await key("d", "Dashboard");
    await click(row("J. Pike"));
    await click(page.locator("text=Simulate exit · DEMO"));
    await waitFor('tbody tr:has-text("J. Pike") >> text=manager review', 40, "held for review");
    await key("2", "Manager phone");
    await page.waitForSelector("text=Why the agent held it", { timeout: 10_000 });
    await narrate("Nothing moves on-ledger until a human approves", 6);
    await click(page.locator('button:has-text("Approve")'));
    await waitFor("text=Approved · settled on XRPL", 180, "approved and settled");
    await narrate("Settled for what the escrow holds; the tip is trimmed to fit", 6);
  }

  say("Done. Stop recording now, and don't press R: the next take starts with pre-flight.");
  if (rl) {
    await rl.question("  [Enter] to close the browser ");
    rl.close();
  } else if (!HEADLESS) await sleep(5000);
  const video = page.video();
  await context.close();
  if (video) say(`video: ${await video.path()}`);
  await browser.close();
}

main().catch((err) => {
  console.error(`\nautopilot stopped: ${err.message}`);
  process.exit(1);
});
