// Films the pin billboard: intro build-up with "?", hero, work reels, the morph into the MacBook,
// the skills click, the morph back, and contact.
import { chromium } from "playwright";
const vpArg = process.argv[2] ?? "desktop";
const vp = vpArg === "mobile" ? { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { width: 1440, height: 900 };
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: vp.width, height: vp.height }, ...vp });
const logs = []; p.on("pageerror", (e) => logs.push(e.message)); p.on("console", (m) => m.type() === "error" && logs.push(m.text()));
await p.goto("http://localhost:4317/", { waitUntil: "commit" });
const t0 = Date.now();
for (const t of [1800, 3200, 4600]) { await p.waitForTimeout(t - (Date.now() - t0)); await p.screenshot({ path: `shots/board-${vpArg}-intro-${t}.png` }); }
await p.waitForFunction(() => !document.querySelector("[aria-label=Loading]"), null, { timeout: 40000 });
await p.waitForTimeout(3000);
await p.screenshot({ path: `shots/board-${vpArg}-hero.png` });
const y = async (sel, f) => p.evaluate(([s, f]) => { const el = document.querySelector(s); return el.getBoundingClientRect().top + scrollY + (el.offsetHeight - innerHeight) * f; }, [sel, f]);
const go = async (v, name) => { await p.evaluate((v) => window.scrollTo(0, v), v); await p.waitForTimeout(2600); await p.screenshot({ path: `shots/board-${vpArg}-${name}.png` }); };
await go(await y("#work > div", 0.01), "work");
await go(await y("#about > div", 0.08), "morphing");
await go(await y("#about > div", 0.4), "laptop");
await p.evaluate(() => document.querySelector(".laptop-hit")?.click()); await p.waitForTimeout(2000);
await p.screenshot({ path: `shots/board-${vpArg}-skills.png` });
await go(await y("#about > div", 0.92), "unmorph");
await go(await p.evaluate(() => document.documentElement.scrollHeight), "contact");
console.log(logs.join("\n") || "no errors");
await b.close();
