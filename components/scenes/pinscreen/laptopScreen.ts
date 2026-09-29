// What the laptop shows: live-typed code from this site, or skills.json when it's clicked.
// Drawn to a canvas that the pin laptop samples pin by pin.
import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";

export const CODE = `// PinscreenScene.tsx — every pin is a spring
useFrame((state, dt) => {
  const inp = readInputs();
  s.city = damp(s.city, 1 - s.front, 3, dt);

  // step the simulation on the GPU
  gl.setRenderTarget(sim.write);
  gl.render(sim.scene, sim.camera);
  gl.setRenderTarget(null);
  [sim.read, sim.write] = [sim.write, sim.read];
});

// shaders.ts
float k = 70.0;
float damping = 6.5;
v += (target - h) * k * uDt;
v *= exp(-damping * uDt);
h += v * uDt;
`;

// PLACEHOLDER levels — set these to how you'd rate yourself (0–1).
export const SKILLS = [
  { name: "TypeScript", level: 0.9 }, { name: "React", level: 0.9 },
  { name: "Next.js", level: 0.85 }, { name: "Three.js / R3F", level: 0.8 },
  { name: "GLSL", level: 0.7 }, { name: "GSAP", level: 0.85 },
  { name: "Node.js", level: 0.75 }, { name: "Python", level: 0.7 },
  { name: "Java", level: 0.7 }, { name: "PostgreSQL", level: 0.65 },
  { name: "Tailwind", level: 0.85 }, { name: "Figma", level: 0.7 },
];

const KEYWORDS = /\b(const|let|float|export|return|import|from|new|function|if|else)\b/g;

export function createLaptopScreen() {
  // the pins sample this coarsely, so it's drawn big and bold
  const c = document.createElement("canvas");
  c.width = 960;
  c.height = 540;
  const ctx = c.getContext("2d")!;
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearFilter;
  tex.generateMipmaps = false;
  const mono = getComputedStyle(document.documentElement).getPropertyValue("--f-jetbrains").trim() || "monospace";

  // the desktop wallpaper, behind a translucent editor window
  const wall = new Image();
  wall.src = "/mac/wallpaper.jpg";
  const chrome = (title: string) => {
    ctx.fillStyle = "#0b0f18";
    ctx.fillRect(0, 0, c.width, c.height);
    if (wall.complete && wall.naturalWidth) {
      const sc = Math.max(c.width / wall.naturalWidth, c.height / wall.naturalHeight);
      const w = wall.naturalWidth * sc, h = wall.naturalHeight * sc;
      ctx.drawImage(wall, (c.width - w) / 2, (c.height - h) / 2, w, h);
      ctx.fillStyle = "rgba(11,15,24,0.62)"; // the editor window over it
      ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.fillStyle = "#121826";
    ctx.fillRect(0, 0, c.width, 46);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(26 + i * 26, 23, 9, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.font = `600 22px ${mono}`;
    ctx.fillStyle = "#e4ecf4";
    ctx.fillText(title, 120, 31);
  };

  const draw = (chars: number, t: number) => {
    chrome("PinscreenScene.tsx");
    const lines = CODE.slice(0, chars).split("\n");
    const lh = 34;
    const maxLines = 13;
    const start = Math.max(0, lines.length - maxLines);
    ctx.font = `600 26px ${mono}`;
    lines.slice(start).forEach((line, i) => {
      const y = 88 + i * lh;
      let x = 24;
      if (line.trim().startsWith("//")) {
        ctx.fillStyle = "#6b7c99";
        ctx.fillText(line, x, y);
        return;
      }
      for (const tok of line.split(/(".*?"|\b\d+\.?\d*\b|\b[A-Za-z_]+\b)/)) {
        if (!tok) continue;
        ctx.fillStyle = /^\d/.test(tok) ? "#ffb36b" : KEYWORDS.test(tok) ? "#3cf0e0" : /^[A-Z]/.test(tok) ? "#7cc4ff" : "#dce4ee";
        KEYWORDS.lastIndex = 0;
        ctx.fillText(tok, x, y);
        x += ctx.measureText(tok).width;
      }
      if (start + i === lines.length - 1 && Math.floor(t * 2) % 2 === 0) {
        ctx.fillStyle = "#3cf0e0";
        ctx.fillRect(x + 2, y - 24, 14, 30);
      }
    });
    ctx.fillStyle = "#3cf0e0";
    ctx.fillRect(0, c.height - 30, c.width, 30);
    ctx.fillStyle = "#04121a";
    ctx.font = `700 18px ${mono}`;
    ctx.fillText(chars >= CODE.length ? "✓ compiled · click to open" : "● typing… · click to open", 14, c.height - 9);
    tex.needsUpdate = true;
  };

  const drawSkills = (t: number) => {
    chrome("skills.json");
    ctx.font = `700 30px ${mono}`;
    ctx.fillStyle = "#3cf0e0";
    ctx.fillText("$ cat skills.json", 24, 96);
    SKILLS.forEach((sk, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 24 + col * 470;
      const y = 150 + row * 58;
      const appear = Math.min(1, Math.max(0, t * 3 - i * 0.12));
      ctx.globalAlpha = appear;
      ctx.font = `600 24px ${mono}`;
      ctx.fillStyle = "#e4ecf4";
      ctx.fillText(sk.name, x, y);
      ctx.fillStyle = "#1a2233";
      ctx.fillRect(x, y + 10, 410, 12);
      const grad = ctx.createLinearGradient(x, 0, x + 410, 0);
      grad.addColorStop(0, "#3cf0e0");
      grad.addColorStop(1, "#9d7bff");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y + 10, 410 * sk.level * Math.min(1, appear * 1.2), 12);
      ctx.globalAlpha = 1;
    });
    ctx.fillStyle = "#9d7bff";
    ctx.fillRect(0, c.height - 30, c.width, 30);
    ctx.fillStyle = "#0b0f18";
    ctx.font = `700 18px ${mono}`;
    ctx.fillText("click again for the code", 14, c.height - 9);
    tex.needsUpdate = true;
  };

  draw(0, 0);
  return { tex, draw, drawSkills };
}

// The "?" the billboard shows before you reach the work.
export function createQuestionTexture() {
  const c = document.createElement("canvas");
  c.width = 480;
  c.height = 270;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 480, 270);
  g.addColorStop(0, "#0c1424");
  g.addColorStop(1, "#140c24");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 480, 270);
  const family = getComputedStyle(document.documentElement).getPropertyValue("--f-archivo").trim() || "sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 230px ${family}`;
  const qg = ctx.createLinearGradient(160, 40, 320, 240);
  qg.addColorStop(0, "#3cf0e0");
  qg.addColorStop(1, "#9d7bff");
  ctx.fillStyle = qg;
  ctx.fillText("?", 240, 150);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.minFilter = LinearFilter;
  t.generateMipmaps = false;
  return t;
}
