"use client";

// What lands on the "lens" in About, where we're facing up into the sky:
//  • rain — water beads with a dark rim, a bright caustic crescent and a specular glint; big drops
//    hold, then slide down in stop-start bursts, stretching as they run and leaving a trail of
//    tiny beads; a fine mist of micro-droplets sits on the glass. Lightning flashes the view.
//  • snow — soft specks, turning six-armed crystals and big out-of-focus flakes near the lens,
//    drifting down at their own speeds and swaying as they fall.
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { environment as env } from "@/lib/environment";
import { signals } from "@/lib/signals";

type Drop = { x: number; y: number; r: number; life: number; age: number; vy: number; hold: number; moving: boolean; trail: number; seed: number };
type Flake = { x: number; y: number; s: number; vy: number; sway: number; phase: number; rot: number; vr: number; kind: 0 | 1 | 2 };

export function LensRain() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const flash = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, devicePixelRatio);
    const resize = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
    };
    resize();
    addEventListener("resize", resize);
    const drops: Drop[] = [];
    const flakes: Flake[] = [];
    let spawn = 0;
    let snowSpawn = 0;

    const newDrop = (x: number, y: number, r: number, still = false): Drop => ({
      x, y, r, life: still ? 1.5 + Math.random() * 2.5 : 3 + Math.random() * 5, age: 0,
      vy: 0, hold: 0.4 + Math.random() * 1.6, moving: false, trail: 0, seed: Math.random() * 10,
    });

    const drawDrop = (d: Drop, a: number) => {
      const stretch = d.moving ? 1 + Math.min(0.6, d.vy / (400 * dpr)) : 1;
      const rx = d.r * 0.92;
      const ry = d.r * stretch;
      ctx.save();
      ctx.translate(d.x, d.y);
      // the water itself: nearly clear, a little darker than what's behind at the rim
      const body = ctx.createRadialGradient(0, ry * 0.2, rx * 0.1, 0, 0, Math.max(rx, ry));
      body.addColorStop(0, `rgba(215,228,250,${0.16 * a})`);
      body.addColorStop(0.75, `rgba(120,140,175,${0.08 * a})`);
      body.addColorStop(0.92, `rgba(12,16,28,${0.6 * a})`);
      body.addColorStop(1, `rgba(12,16,28,0)`);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      // caustic: light focused through the drop pools as a crescent low down
      ctx.fillStyle = `rgba(255,255,255,${0.38 * a})`;
      ctx.beginPath();
      ctx.ellipse(0, ry * 0.42, rx * 0.62, ry * 0.26, 0, 0, Math.PI);
      ctx.fill();
      // specular glint up and to the left
      ctx.fillStyle = `rgba(255,255,255,${0.9 * a})`;
      ctx.beginPath();
      ctx.ellipse(-rx * 0.32, -ry * 0.38, rx * 0.16, ry * 0.11, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawFlake = (f: Flake, a: number) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      if (f.kind === 0) {
        // a speck of snow: soft round
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, f.s);
        g.addColorStop(0, `rgba(255,255,255,${0.95 * a})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, f.s, 0, Math.PI * 2);
        ctx.fill();
      } else if (f.kind === 1) {
        // a crystal: six arms with side branches, turning as it falls
        ctx.rotate(f.rot);
        ctx.strokeStyle = `rgba(255,255,255,${0.9 * a})`;
        ctx.lineWidth = Math.max(1, f.s * 0.12);
        ctx.lineCap = "round";
        for (let k = 0; k < 6; k++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -f.s);
          ctx.moveTo(0, -f.s * 0.55);
          ctx.lineTo(f.s * 0.22, -f.s * 0.75);
          ctx.moveTo(0, -f.s * 0.55);
          ctx.lineTo(-f.s * 0.22, -f.s * 0.75);
          ctx.stroke();
        }
      } else {
        // out of focus, right by the lens: a big soft disc
        const g = ctx.createRadialGradient(0, 0, f.s * 0.3, 0, 0, f.s);
        g.addColorStop(0, `rgba(255,255,255,${0.28 * a})`);
        g.addColorStop(0.8, `rgba(255,255,255,${0.2 * a})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, f.s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const tick = (_: number, dtMs: number) => {
      const dt = Math.min(0.05, dtMs / 1000);
      const rain = signals.skyward * env.rain;
      const snow = signals.skyward * env.snowfall;
      c.style.opacity = String(Math.min(1, Math.max(rain, snow) * 1.4));
      if (flash.current) flash.current.style.opacity = String(env.flash * signals.skyward * 0.45);
      if (rain < 0.02 && snow < 0.02 && drops.length === 0 && flakes.length === 0) return;
      ctx.clearRect(0, 0, c.width, c.height);

      // ── rain
      spawn += dt * 60 * rain;
      while (spawn > 1) {
        spawn -= 1;
        const big = Math.random() < 0.22;
        const r = (big ? 6 + Math.random() * 9 : 1 + Math.random() ** 2 * 4) * dpr;
        drops.push(newDrop(Math.random() * c.width, Math.random() * c.height * 0.9, r, !big));
      }
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.age += dt;
        // big drops cling, then run: stop-start, speed grows with size, a slight wander
        if (d.r > 5 * dpr) {
          d.hold -= dt;
          if (!d.moving && d.hold <= 0) {
            d.moving = true;
            d.hold = 0.25 + Math.random() * 0.8;
          } else if (d.moving && d.hold <= 0) {
            d.moving = Math.random() < 0.55; // sometimes it catches and stops for a moment
            d.hold = d.moving ? 0.3 + Math.random() * 0.9 : 0.15 + Math.random() * 0.5;
          }
          const target = d.moving ? (60 + d.r * 18) * dpr * 0.5 : 0;
          d.vy += (target - d.vy) * Math.min(1, dt * (d.moving ? 6 : 14));
          const dy = d.vy * dt;
          d.y += dy;
          d.x += Math.sin(d.age * 3.1 + d.seed) * 0.35 * dpr * (d.moving ? 1 : 0);
          // leave tiny beads behind as it runs
          d.trail += dy;
          if (d.trail > d.r * 1.3) {
            d.trail = 0;
            if (Math.random() < 0.7) drops.push(newDrop(d.x + (Math.random() - 0.5) * d.r * 0.4, d.y - d.r * 1.2, (0.6 + Math.random() * 1.2) * dpr, true));
            d.r *= 0.985; // it loses a little water each time
          }
          if (d.moving) d.life = Math.max(d.life, d.age + 0.5);
        }
        const a = Math.min(1, d.age * 10) * (1 - Math.max(0, (d.age - d.life) / 0.8));
        if (a <= 0 || d.y - d.r > c.height) {
          drops.splice(i, 1);
          continue;
        }
        drawDrop(d, a);
      }

      // ── snow
      snowSpawn += dt * 48 * snow;
      while (snowSpawn > 1) {
        snowSpawn -= 1;
        const roll = Math.random();
        const kind: 0 | 1 | 2 = roll < 0.62 ? 0 : roll < 0.9 ? 1 : 2;
        const s = (kind === 0 ? 1.2 + Math.random() * 2.5 : kind === 1 ? 4 + Math.random() * 6 : 14 + Math.random() * 16) * dpr;
        flakes.push({
          x: Math.random() * c.width, y: -s * 2, s,
          vy: (kind === 2 ? 90 : 25 + s * 4) * dpr * (0.7 + Math.random() * 0.6) * 0.5,
          sway: (6 + Math.random() * 18) * dpr, phase: Math.random() * 6.28,
          rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 1.2, kind,
        });
      }
      for (let i = flakes.length - 1; i >= 0; i--) {
        const f = flakes[i];
        f.phase += dt * (0.8 + f.s * 0.02);
        f.y += f.vy * dt;
        f.x += Math.cos(f.phase) * f.sway * dt;
        f.rot += f.vr * dt;
        if (f.y - f.s > c.height) {
          flakes.splice(i, 1);
          continue;
        }
        drawFlake(f, Math.min(1, snow * 1.4));
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} className="lens-rain" aria-hidden />
      <div ref={flash} className="lens-flash" aria-hidden />
    </>
  );
}
