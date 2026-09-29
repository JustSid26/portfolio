// Verify the social skyscraper links: visible, positioned over towers, correct hrefs, hover works.
import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("http://localhost:4317/", { waitUntil: "networkidle" });
await p.waitForFunction(() => !document.querySelector("[aria-label=Loading]"), null, { timeout: 30000 });
await p.waitForTimeout(3500);
const links = await p.$$eval(".landmark-links a", (as) =>
  as.map((a) => ({ label: a.getAttribute("aria-label"), href: a.getAttribute("href"), on: a.dataset.on, rect: a.getBoundingClientRect().toJSON() })),
);
console.log(JSON.stringify(links.map((l) => ({ ...l, rect: [l.rect.x, l.rect.y, l.rect.width, l.rect.height].map(Math.round) })), null, 1));
const first = links.find((l) => l.on === "true");
if (first) {
  await p.mouse.move(first.rect.x + first.rect.width / 2, first.rect.y + first.rect.height / 2);
  await p.waitForTimeout(700);
}
await p.screenshot({ path: "shots/landmarks-hover.png" });
console.log(errs.length ? errs.join("\n") : "no errors");
await b.close();
