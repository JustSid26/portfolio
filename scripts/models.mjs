// Screenshot each project's pin model in the work section.
import { chromium } from "playwright";
const vp = process.argv[2] === "mobile" ? { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { width: 1440, height: 900 };
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: vp.width, height: vp.height }, ...vp });
p.on("pageerror", (e) => console.log("pageerror", e.message));
await p.goto("http://localhost:4317/?c=pinscreen", { waitUntil: "networkidle" });
await p.waitForFunction(() => !document.querySelector("[aria-label=Loading]"));
await p.waitForTimeout(2000);
for (let i = 0; i < 5; i++) {
  await p.evaluate((i) => {
    const el = document.querySelector("#work > div");
    const top = el.getBoundingClientRect().top + scrollY;
    window.scrollTo(0, top + ((el.offsetHeight - innerHeight) * i) / 4 + 2);
  }, i);
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `shots/model-${process.argv[2] ?? "desktop"}-${i + 1}.png` });
}
await b.close();
