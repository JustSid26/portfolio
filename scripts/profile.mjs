// CPU-profile the scroll into the work section and print top self-time functions.
import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:4317/", { waitUntil: "networkidle" });
await page.waitForFunction(() => !document.querySelector("[aria-label=Loading]"), null, { timeout: 30000 });
await page.waitForTimeout(2500);
const cdp = await page.context().newCDPSession(page);
await cdp.send("Profiler.enable");
await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
await cdp.send("Profiler.start");
await page.mouse.move(5, 5);
for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(120); }
await page.waitForTimeout(1500);
const { profile } = await cdp.send("Profiler.stop");
const self = new Map();
const dt = profile.timeDeltas; const byId = new Map(profile.nodes.map((n) => [n.id, n]));
profile.samples.forEach((id, i) => { const n = byId.get(id); const k = `${n.callFrame.functionName || "(anon)"} ${n.callFrame.url.split("/").pop()}:${n.callFrame.lineNumber}`; self.set(k, (self.get(k) || 0) + (dt[i] || 0)); });
[...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([k, v]) => console.log((v / 1000).toFixed(0).padStart(6), "ms", k));
await b.close();
