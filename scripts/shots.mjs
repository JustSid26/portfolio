// Screenshot + console check for each concept at desktop and mobile widths.
// Usage: node scripts/shots.mjs [concept|all] [desktop|mobile|both] [baseUrl]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [conceptArg = "all", vpArg = "both", base = "http://localhost:4317"] = process.argv.slice(2);
const concepts = conceptArg === "all" ? ["pinscreen"] : [conceptArg];
const viewports = {
  desktop: { width: 1440, height: 900, isMobile: false, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};
const vps = vpArg === "both" ? ["desktop", "mobile"] : [vpArg];
const out = "shots";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
});
const problems = [];

for (const concept of concepts) {
  for (const vp of vps) {
    const ctx = await browser.newContext({ viewport: { width: viewports[vp].width, height: viewports[vp].height }, ...viewports[vp] });
    const page = await ctx.newPage();
    const log = (m) => problems.push(`[${concept}/${vp}] ${m}`);
    page.on("console", (msg) => {
      if (["error", "warning"].includes(msg.type()) && !/THREE\.Clock|React DevTools/.test(msg.text())) log(`${msg.type()}: ${msg.text()}`);
    });
    page.on("pageerror", (e) => log(`pageerror: ${e.message}`));

    await page.goto(`${base}/?c=${concept}`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => !document.querySelector("[aria-label=Loading]"), null, { timeout: 30000 }).catch(() => log("never finished loading"));
    await page.waitForTimeout(2800);
    const shot = (name) => page.screenshot({ path: `${out}/${concept}-${vp}-${name}.png` });
    await shot("1-hero");

    const scrollTo = async (sel, frac = 0) => {
      await page.evaluate(
        ([s, f]) => {
          const el = document.querySelector(s);
          const top = el.getBoundingClientRect().top + window.scrollY;
          window.scrollTo(0, top + (el.offsetHeight - (f ? window.innerHeight : 0)) * f);
        },
        [sel, frac],
      );
      await page.waitForTimeout(1800);
    };
    await scrollTo("#work", 0);
    await shot("2-work-head");
    await scrollTo("#work > div", 0.01);
    await shot("3-work-01");
    if (vp === "desktop") {
      await page.mouse.move(1000, 450);
      await page.waitForTimeout(2500);
      await shot("3b-work-hover");
      await page.mouse.move(200, 200);
    }
    await scrollTo("#work > div", 0.5);
    await shot("4-work-mid");
    await scrollTo("#about", 0.0);
    await shot("5-about-a");
    await scrollTo("#about > div", 0.35);
    await page.waitForTimeout(1500);
    await shot("6-about-object");
    await scrollTo("#contact", 1);
    await shot("7-contact");

    // Case study via the transition (click the frame)
    await scrollTo("#work > div", 0.01);
    await page.click("[data-work-frame] a");
    await page.waitForURL(/\/work\//, { timeout: 10000 }).catch(() => log("case navigation failed"));
    await page.waitForTimeout(2600);
    await shot("8-case-top");
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.6));
    await page.waitForTimeout(1600);
    await shot("9-case-body");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1600);
    await shot("10-case-next");

    await ctx.close();
  }
}
await browser.close();
console.log(problems.length ? problems.join("\n") : "no console errors/warnings");
