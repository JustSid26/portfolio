// Quick probe: click into a case study and report scroll position over time.
import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on("pageerror", (e) => console.log("pageerror", e.message));
await p.goto("http://localhost:4317/?c=pinscreen", { waitUntil: "networkidle" });
await p.waitForFunction(() => !document.querySelector("[aria-label=Loading]"));
await p.waitForTimeout(2500);
await p.evaluate(() => { const el = document.querySelector("#work > div"); window.scrollTo(0, el.getBoundingClientRect().top + scrollY + 10); });
await p.waitForTimeout(1500);
p.on("console", (m) => m.text().startsWith("DBG") && console.log(m.text()));
await p.evaluate(() => { const o = window.scrollTo.bind(window); window.scrollTo = (...a) => { console.log("DBG scrollTo " + JSON.stringify(a) + " at " + scrollY); o(...a); console.log("DBG after " + scrollY + " h=" + document.documentElement.scrollHeight); }; });
await p.click("[data-work-frame] a");
for (let i = 0; i < 8; i++) { await p.waitForTimeout(400); console.log(i, await p.evaluate(() => [location.pathname, scrollY, window.__store.getState().transition])); }
await b.close();
