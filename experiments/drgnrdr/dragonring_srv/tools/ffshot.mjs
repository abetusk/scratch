// Headless Firefox screenshot + console capture over WebDriver BiDi.
// No dependencies (Node >= 22 has a global WebSocket).
//
//   node tools/ffshot.mjs URL out.png [waitMs] [w] [h] [js-to-run-before-shot]
//
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const [url, out = "shots/shot.png", waitMs = "2500", W = "1200", H = "900", pre = ""] = process.argv.slice(2);
const port = 9300 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(join(process.cwd(), "shots", "prof."));

// Extra Firefox preferences: FF_PREFS='{"dom.webmidi.enabled": true}'.
//
if (process.env.FF_PREFS) {
  const P = JSON.parse(process.env.FF_PREFS);
  writeFileSync(join(prof, "user.js"), Object.keys(P).map((k) => `user_pref(${JSON.stringify(k)}, ${JSON.stringify(P[k])});`).join("\n") + "\n");
}

const ff = spawn("firefox", ["--headless", "--no-remote", "--profile", prof,
                             "--remote-debugging-port", String(port)], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ws = null;
for (let i = 0; i < 60 && !ws; i++) {
  await sleep(500);
  try {
    const s = new WebSocket(`ws://127.0.0.1:${port}/session`);
    await new Promise((res, rej) => { s.onopen = res; s.onerror = rej; });
    ws = s;
  }
  catch (e) { }
}
if (!ws) { console.error("no BiDi connection"); try { ff.kill(); } catch (e) { } process.exit(1); }

let id = 0;
const pending = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) {
    pending.get(d.id)(d);
    pending.delete(d.id);
  }
  else if (d.method === "log.entryAdded") {
    const p = d.params;
    console.log(`[${p.level}] ${p.text}`);
  }
};
const send = (method, params = {}) => new Promise((res) => {
  const i = ++id;
  pending.set(i, res);
  ws.send(JSON.stringify({ id: i, method, params }));
});

await send("session.new", { capabilities: {} });
await send("session.subscribe", { events: ["log.entryAdded"] });
const tree = await send("browsingContext.getTree", {});
const ctx = tree.result.contexts[0].context;
await send("browsingContext.setViewport", { context: ctx, viewport: { width: +W, height: +H } });
await send("browsingContext.navigate", { context: ctx, url, wait: "complete" });
await sleep(+waitMs);
// 'pre' may hold several snippets separated by "|||"; each one is run
// and followed by its own screenshot (out_0.png, out_1.png, ...).
//
const steps = ( pre ? pre.split("|||") : [""] );
for (let k = 0; k < steps.length; k++) {
  if (steps[k]) {
    const r = await send("script.evaluate", { expression: steps[k], target: { context: ctx }, awaitPromise: true });
    console.log("eval:", JSON.stringify(r.result && r.result.result));
    await sleep(900);
  }
  const shot = await send("browsingContext.captureScreenshot", { context: ctx });
  const name = ( (steps.length > 1) ? out.replace(/\.png$/, "_" + k + ".png") : out );
  if (shot.result) {
    writeFileSync(name, Buffer.from(shot.result.data, "base64"));
    console.log("wrote", name);
  }
  else {
    console.error(JSON.stringify(shot));
  }
}
await send("browser.close", {});
try { ff.kill(); } catch (e) { }
await sleep(1500);
try { rmSync(prof, { recursive: true, force: true }); } catch (e) { }
process.exit(0);
