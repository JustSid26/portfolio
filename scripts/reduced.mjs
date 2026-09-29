// Reduced-motion check: page must load, render a static scene, and show all text.
import { chromium } from "playwright";
const concept = process.argv[2] ?? "pinscreen";
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto(`http://localhost:4317/?c=${concept}`, { waitUntil: "networkidle" });
await p.waitForFunction(() => !document.querySelector("[aria-label=Loading]"), null, { timeout: 20000 }).catch(() => errs.push("never loaded"));
await p.waitForTimeout(800);
await p.screenshot({ path: `shots/${concept}-reduced-hero.png` });
await p.evaluate(() => window.scrollTo(0, document.querySelector("#work > div").getBoundingClientRect().top + scrollY + 5));
await p.waitForTimeout(800);
await p.screenshot({ path: `shots/${concept}-reduced-work.png` });
console.log(errs.length ? errs.join("\n") : "reduced ok");
await b.close();
