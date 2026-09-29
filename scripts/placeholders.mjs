// Generates placeholder artwork for projects that don't have real media yet into /public/work/<slug>/0N.svg.
// Run: node scripts/placeholders.mjs — replace the output with real screenshots later.
import { mkdirSync, writeFileSync } from "node:fs";

const W = 1600;
const H = 900;

const rand = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const frame = (bg, body, label) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${bg}"/>
${body}
<text x="48" y="${H - 44}" font-family="Menlo, monospace" font-size="22" fill="#ffffff" fill-opacity="0.45" letter-spacing="3">PLACEHOLDER — ${label}</text>
</svg>`;

const motifs = {
  // Unknown: concentric rings
  "project-five": (v, a) => {
    let s = "";
    for (let i = 12; i > 0; i--) {
      s += `<circle cx="${W / 2 + v * 80}" cy="${H / 2}" r="${i * 38}" fill="${i % 2 ? a : "#111"}" fill-opacity="${i % 2 ? 0.9 - i * 0.05 : 1}"/>`;
    }
    s += `<text x="${W / 2 + v * 80}" y="${H / 2 + 60}" text-anchor="middle" font-family="Helvetica, Arial" font-weight="700" font-size="180" fill="#111">?</text>`;
    return s;
  },
};

const accents = {
  "project-five": "#D4FF3A",
};
const bgs = ["#141312", "#1c1b19", "#0f0f0e"];

let seed = 7;
for (const [slug, motif] of Object.entries(motifs)) {
  mkdirSync(`public/work/${slug}`, { recursive: true });
  for (let v = 0; v < 3; v++) {
    const r = rand(seed++ * 997);
    const svg = frame(bgs[v], motif(v, accents[slug], r), `${slug} / 0${v + 1}`);
    writeFileSync(`public/work/${slug}/0${v + 1}.svg`, svg);
  }
}
console.log("placeholders written");
