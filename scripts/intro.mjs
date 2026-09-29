// Captures the intro sequence as a filmstrip of frames.
import { chromium } from "playwright";
const mobile = process.argv[2] === "mobile";
const vp = mobile ? { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { width: 1440, height: 900 };
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: vp.width, height: vp.height }, ...vp });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => ["error", "warning"].includes(m.type()) && !/glGetProgramiv|THREE.Clock/.test(m.text()) && errs.push(m.text()));
await p.goto("http://localhost:4317/", { waitUntil: "commit" });
const t0 = Date.now();
const times = [600, 1400, 2200, 3000, 3600, 4200, 5000, 6200];
for (const t of times) {
  await p.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
  await p.screenshot({ path: `shots/intro-${mobile ? "m" : "d"}-${String(t).padStart(4, "0")}.png` });
}
console.log(errs.length ? errs.join("\n") : "intro ok");
await b.close();
