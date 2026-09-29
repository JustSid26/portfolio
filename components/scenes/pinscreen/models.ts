// Pin "models" of each project: grayscale heightmaps (white = tallest pin) drawn at the
// frame's 16:9 aspect. The pin wall sculpts these in the work section.
// New projects without a model fall back to a relief of their cover image.
import { CanvasTexture, LinearFilter, type Texture } from "three";
import type { Project } from "@/content/projects";

const W = 320;
const H = 180;

type Ctx = CanvasRenderingContext2D;
const g = (v: number) => {
  const c = Math.round(Math.max(0, Math.min(1, v)) * 255);
  return `rgb(${c},${c},${c})`;
};
const box = (c: Ctx, x: number, y: number, w: number, h: number, v: number, r = 2) => {
  c.fillStyle = g(v);
  c.beginPath();
  c.roundRect(x * W, y * H, w * W, h * H, r);
  c.fill();
};
// Rounded "pill" profile: bright ridge, falling off to the edges.
const dome = (c: Ctx, cx: number, cy: number, r: number, v: number) => {
  const grd = c.createRadialGradient(cx * W, cy * H, 0, cx * W, cy * H, r * H);
  grd.addColorStop(0, g(v));
  grd.addColorStop(0.7, g(v * 0.82));
  grd.addColorStop(1, g(0));
  c.fillStyle = grd;
  c.beginPath();
  c.arc(cx * W, cy * H, r * H, 0, Math.PI * 2);
  c.fill();
};

const rand = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const models: Record<string, (c: Ctx) => void> = {
  // Eternity AI: a brilliant-cut diamond — flat table, faceted crown, girdle.
  "lead-gen": (c) => {
    const cx = 0.5 * W;
    const cy = 0.52 * H;
    const R = 0.44 * H;
    const poly = (pts: [number, number][], v: number) => {
      c.fillStyle = g(v);
      c.beginPath();
      pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.closePath();
      c.fill();
    };
    const ring = (r: number, k: number, off = 0): [number, number][] =>
      Array.from({ length: k }, (_, i) => {
        const a = ((i + off) / k) * Math.PI * 2 - Math.PI / 2;
        return [cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r];
      });
    // girdle
    poly(ring(R, 16), 0.3);
    // crown facets: 8 kites alternating in height so light breaks across them
    const outer = ring(R * 0.96, 16);
    const inner = ring(R * 0.5, 8, 0.5);
    for (let i = 0; i < 8; i++) {
      const a = outer[i * 2];
      const b = outer[i * 2 + 1];
      const d = outer[(i * 2 + 2) % 16];
      const t0 = inner[(i + 7) % 8];
      const t1 = inner[i];
      poly([a, b, t1, t0], 0.55 + (i % 2) * 0.12);
      poly([b, d, t1], 0.62 + ((i + 1) % 2) * 0.12);
    }
    // table
    poly(inner, 1);
  },
  // Ledger: two matching columns of entries bridged when reconciled; one row unmatched.
  "payment-recon": (c) => {
    const r = rand(11);
    for (let i = 0; i < 8; i++) {
      const y = 0.08 + i * 0.105;
      const v = 0.3 + r() * 0.45;
      const unmatched = i === 5;
      box(c, 0.08, y, 0.34, 0.075, v);
      box(c, 0.58, y, 0.34, 0.075, unmatched ? v * 0.35 : v);
      if (!unmatched) box(c, 0.42, y + 0.028, 0.16, 0.02, v * 0.55, 1);
      else dome(c, 0.5, y + 0.038, 0.05, 0.95);
    }
  },
  // Bench: a 3D bar chart — pins are born for this.
  databench: (c) => {
    const r = rand(29);
    box(c, 0.06, 0.8, 0.88, 0.1, 0.08);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const v = i === 6 ? 1 : 0.2 + r() * 0.6;
      box(c, 0.08 + i * 0.096, 0.18, 0.07, 0.58, v, 1);
    }
  },
  // Study Desk: its activity heatmap — "the only bright thing is your own data".
  studydesk: (c) => {
    const r = rand(53);
    const cols = 10;
    const rows = 6;
    const cw = 0.84 / cols;
    const ch = 0.8 / rows;
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const v = r();
        box(c, 0.08 + x * cw + cw * 0.08, 0.1 + y * ch + ch * 0.08, cw * 0.84, ch * 0.84, v < 0.15 ? 0.04 : v, 5);
      }
  },

};

export function makeModelTextures(projects: Project[], covers: Texture[]): CanvasTexture[] {
  return projects.map((p, i) => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#000";
    c.fillRect(0, 0, W, H);
    const draw = models[p.slug];
    if (draw) draw(c);
    else {
      // Fallback: soft relief of the cover image's luminance.
      const img = covers[i]?.image as CanvasImageSource | undefined;
      if (img) {
        c.filter = "grayscale(1) blur(2px) contrast(1.2)";
        c.drawImage(img, 0, 0, W, H);
      }
    }
    const t = new CanvasTexture(canvas);
    t.minFilter = LinearFilter;
    t.magFilter = LinearFilter;
    t.generateMipmaps = false;
    return t;
  });
}
