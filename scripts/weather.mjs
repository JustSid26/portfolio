// Screenshot the hero under every weather preset (clicks the real toggle).
import { chromium } from "playwright";
const vp = process.argv[2] === "mobile" ? { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { width: 1440, height: 900 };
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: vp.width, height: vp.height }, ...vp });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => ["error", "warning"].includes(m.type()) && !/glGetProgramiv|THREE.Clock/.test(m.text()) && errs.push(m.text()));
await p.goto("http://localhost:4317/", { waitUntil: "networkidle" });
await p.waitForFunction(() => !document.querySelector("[aria-label=Loading]"), null, { timeout: 30000 });
await p.waitForTimeout(3000);
for (const w of ["Day", "Evening", "Night", "Rain", "Autumn", "Winter"]) {
  await p.click(`.weather-toggle button[aria-label="${w}"]`);
  await p.waitForTimeout(2200);
  if (w === "Rain") await p.evaluate(() => { window.__env.flash = 1; });
  await p.waitForTimeout(w === "Rain" ? 60 : 0);
  await p.screenshot({ path: `shots/weather-${process.argv[2] ?? "desktop"}-${w.toLowerCase()}.png` });
}
console.log(errs.length ? errs.join("\n") : "weather ok");
await b.close();
