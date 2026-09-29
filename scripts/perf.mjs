// Frame-timing probe (stand-in for a DevTools trace): measures rAF frame times
// on the hero (cursor moving) and through the work section (scrolling).
// Usage: node scripts/perf.mjs [concept] [--headed]
import { chromium } from "playwright";

const concept = process.argv[2] ?? "pinscreen";
const headed = process.argv.includes("--headed");
const browser = await chromium.launch({
  headless: !headed,
  args: ["--use-angle=metal", "--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--disable-frame-rate-limit"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:4317/?c=${concept}`, { waitUntil: "networkidle" });
await page.waitForFunction(() => !document.querySelector("[aria-label=Loading]"), null, { timeout: 30000 });
await page.waitForTimeout(3000);

const renderer = await page.evaluate(() => {
  const gl = document.querySelector("canvas").getContext("webgl2");
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unknown";
});

const measure = (ms) =>
  page.evaluate(
    (ms) =>
      new Promise((resolve) => {
        const times = [];
        let last = performance.now();
        const start = last;
        const f = (t) => {
          times.push(t - last);
          last = t;
          if (t - start < ms) requestAnimationFrame(f);
          else {
            const long = [];
            let acc = 0;
            times.forEach((d) => { acc += d; if (d > 50) long.push([Math.round(acc), Math.round(d)]); });
            times.sort((a, b) => a - b);
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            resolve({
              frames: times.length,
              fps: +(1000 / avg).toFixed(1),
              p50: +times[Math.floor(times.length * 0.5)].toFixed(2),
              p95: +times[Math.floor(times.length * 0.95)].toFixed(2),
              worst: +times[times.length - 1].toFixed(2),
              long,
            });
          }
        };
        requestAnimationFrame(f);
      }),
    ms,
  );

// Hero with a moving cursor
const heroP = measure(4000);
for (let i = 0; i < 40; i++) {
  await page.mouse.move(300 + Math.sin(i / 4) * 400 + i * 10, 400 + Math.cos(i / 3) * 200);
  await page.waitForTimeout(90);
}
const hero = await heroP;

// Scroll through work
await page.evaluate(() => window.scrollTo(0, document.querySelector("#work > div").getBoundingClientRect().top + scrollY));
await page.waitForTimeout(1200);
await page.mouse.move(5, 5);
const workP = measure(4000);
for (let i = 0; i < 30; i++) {
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(120);
}
const work = await workP;

console.log(JSON.stringify({ concept, renderer, hero, work }, null, 2));
await browser.close();
