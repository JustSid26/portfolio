// Social skyscrapers around the SL HQ. Each carries its brand mark lit across the facade
// that faces the city; DOM links are tracked over them so they're clickable and focusable.
import { CanvasTexture, LinearFilter } from "three";
import { siGithub, siInstagram } from "simple-icons";
import { site } from "@/content/projects";

export type Landmark = {
  key: "instagram" | "github" | "linkedin" | "mail";
  label: string;
  href: string;
  color: string; // brand colour for edge lights / crown
  // Footprint centre + size in glyph-rect units (the HQ occupies x 0.27–0.73, y 0.4–0.66)
  cx: number;
  cy: number;
  w: number;
  d: number;
  type: 0 | 1 | 2 | 3; // 0 tiered needle · 1 stepped ziggurat · 2 twin slabs · 3 tapered spire
  front: number; // height of the street-facing facade (the logo sits near its top)
  height: number; // tallest point
  cloud: string; // what its cloud says in the Contact section
};

const social = (name: string) => site.socials.find((s) => s.label.toLowerCase() === name)?.href ?? "#";

// Scattered, not lined up: different distances from the HQ, sizes and silhouettes.
export const LANDMARKS: Landmark[] = [
  { key: "instagram", label: "Instagram", href: social("instagram"), color: "#E1306C", cx: -0.06, cy: 0.74, w: 0.11, d: 0.1, type: 0, front: 1.3, height: 2.15, cloud: "Something cool lives here" },
  { key: "github", label: "GitHub", href: social("github"), color: "#f0f6fc", cx: -0.3, cy: 0.08, w: 0.1, d: 0.12, type: 1, front: 1.2, height: 1.55, cloud: "Check out my work" },
  { key: "linkedin", label: "LinkedIn", href: social("linkedin"), color: "#0A66C2", cx: 1.0, cy: 1.0, w: 0.15, d: 0.1, type: 2, front: 1.25, height: 1.7, cloud: "Connect with me on LinkedIn" },
  { key: "mail", label: "Email", href: `mailto:${site.email}`, color: "#3CF0E0", cx: 1.03, cy: -0.3, w: 0.085, d: 0.09, type: 3, front: 1.15, height: 1.75, cloud: "Or just drop me a mail" },
];

const CELL = 256;

function drawIcon(ctx: CanvasRenderingContext2D, path: string, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.fill(new Path2D(path));
  ctx.restore();
}

// 4×1 atlas; each cell is one tower's facade sign (brand tile + mark).
export function makeLogoAtlas(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = CELL * 4;
  c.height = CELL;
  const ctx = c.getContext("2d")!;
  const pad = 20;
  const tile = (i: number, fill: string | CanvasGradient) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(i * CELL + pad, pad, CELL - pad * 2, CELL - pad * 2, 44);
    ctx.fill();
  };

  // Instagram: the brand gradient with the white glyph
  const ig = ctx.createLinearGradient(pad, CELL - pad, CELL - pad, pad);
  ig.addColorStop(0, "#FEDA75");
  ig.addColorStop(0.3, "#FA7E1E");
  ig.addColorStop(0.6, "#D62976");
  ig.addColorStop(0.8, "#962FBF");
  ig.addColorStop(1, "#4F5BD5");
  tile(0, ig);
  ctx.fillStyle = "#fff";
  drawIcon(ctx, siInstagram.path, 0 * CELL + 58, 58, 140);

  // GitHub: white octocat on GitHub dark
  tile(1, "#181717");
  ctx.fillStyle = "#fff";
  drawIcon(ctx, siGithub.path, 1 * CELL + 58, 58, 140);

  // LinkedIn: "in" on LinkedIn blue
  tile(2, "#0A66C2");
  ctx.fillStyle = "#fff";
  const lx = 2 * CELL;
  ctx.fillRect(lx + 66, 108, 30, 90); // i stem
  ctx.beginPath();
  ctx.arc(lx + 81, 78, 18, 0, Math.PI * 2); // i dot
  ctx.fill();
  ctx.fillRect(lx + 112, 108, 30, 90); // n stem
  ctx.beginPath();
  ctx.moveTo(lx + 112, 130);
  ctx.bezierCurveTo(lx + 124, 96, lx + 196, 88, lx + 196, 140);
  ctx.lineTo(lx + 196, 198);
  ctx.lineTo(lx + 166, 198);
  ctx.lineTo(lx + 166, 146);
  ctx.bezierCurveTo(lx + 166, 118, lx + 128, 118, lx + 142, 150);
  ctx.lineTo(lx + 142, 198);
  ctx.lineTo(lx + 112, 198);
  ctx.closePath();
  ctx.fill();

  // Mail: envelope in the site's aquamarine
  tile(3, "#0f5560");
  const mx = 3 * CELL;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 16;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.roundRect(mx + 56, 80, 144, 100, 12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mx + 62, 90);
  ctx.lineTo(mx + 128, 140);
  ctx.lineTo(mx + 194, 90);
  ctx.stroke();

  const t = new CanvasTexture(c);
  t.minFilter = LinearFilter;
  t.generateMipmaps = false;
  return t;
}
