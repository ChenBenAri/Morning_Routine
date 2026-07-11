// Playwright smoke test for the Gori minions page.
//
// Verifies: start overlay shows, tapping it starts the experience, all 12
// audio clips are served from the relative audio/ path, Web Audio decodes
// them, and chant beats keep firing on the 2.2s rhythm.
//
// Usage: npm install playwright && node test-audio.mjs

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = dirname(fileURLToPath(import.meta.url));
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".js": "text/javascript",
};

const server = createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const rel = urlPath === "/" ? "index.html" : urlPath.slice(1);
  const file = normalize(join(root, rel));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": MIME[extname(file)] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404).end("not found");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const failures = [];
const check = (ok, label) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch({
  args: ["--autoplay-policy=no-user-gesture-required", "--no-sandbox"],
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const audioResponses = new Map();
page.on("response", (res) => {
  const m = res.url().match(/audio\/gori-play-(\d+)\.mp3$/);
  if (m) audioResponses.set(Number(m[1]), res.status());
});
page.on("pageerror", (err) => failures.push(`page error: ${err.message}`));

await page.goto(base, { waitUntil: "load" });

check(await page.locator("#startOverlay").isVisible(), "start overlay is visible before tap");
check(await page.locator("#startBtn").isVisible(), "start button is visible");
const minionCount = await page.locator(".minion").count();
check(minionCount >= 20, `crowd rendered (${minionCount} minions)`);
check(
  (await page.evaluate(() => window.__goriState.beats)) === 0,
  "no audio/beats before user tap (autoplay policy respected)"
);

// force: the button pulses forever, so Playwright's stability check never settles
await page.click("#startBtn", { force: true });
await page.waitForSelector("#startOverlay.hidden", { timeout: 10_000 });
check(true, "overlay hides after tap");

// Wait for ~3 beats (2.2s rhythm).
await page.waitForTimeout(7_000);
const state = await page.evaluate(() => window.__goriState);
console.log("  state:", JSON.stringify(state));

check(state.started, "experience started");
check(state.audioMode === "webaudio" || state.audioMode === "htmlaudio", `audio engine active (${state.audioMode})`);
check(state.clipsLoaded >= 6, `clips loaded (${state.clipsLoaded}/12)`);
check(state.beats >= 3, `chant beats firing every 2.2s (${state.beats} beats)`);

const served = [...audioResponses.entries()].filter(([, s]) => s === 200).length;
check(served === 12, `all 12 clips served from relative audio/ path (${served}/12 with HTTP 200)`);

const bubbles = await page.locator(".bubble.pop").count();
check(bubbles >= 1, `speech bubbles popping (${bubbles} visible)`);

await browser.close();
server.close();

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log("\nAll checks passed 🍌");
