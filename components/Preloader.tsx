"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { gsap } from "@/lib/gsap";
import { useStore } from "@/lib/store";
import { signals } from "@/lib/signals";
import { getLenis } from "@/lib/scroll";
import { site } from "@/content/projects";

// Long enough for the skyline to rise on a fast connection.
const MIN_MS = 3000;

// Boot log: each line appears once loading passes its threshold. Numbers are real
// (read from the generated city), filled in when the line prints.
const LOG: [number, string][] = [
  [0, "boot     sl/os 26.9 · aquarius build"],
  [12, "alloc    pin array ............ {pins}"],
  [24, "zone     {blocks} blocks · {buildings} towers"],
  [38, "zone     {houses} houses · parks planted"],
  [52, "traffic  {cars} cars ......... moving"],
  [64, "freight  {tools} tool trucks → sl hq"],
  [76, "rail     2 lines · air 3 flights · ok"],
  [90, "compile  shaders ................ ok"],
  [100, "♒        welcome to the city"],
];
const fill = (line: string) =>
  line
    .replace("{pins}", signals.pinCount ? signals.pinCount.toLocaleString("en-US") : "—")
    .replace("{blocks}", String(signals.city.blocks || "—"))
    .replace("{cars}", signals.city.cars ? signals.city.cars.toLocaleString("en-US") : "—")
    .replace("{buildings}", String(signals.city.buildings || "—"))
    .replace("{houses}", signals.city.houses ? signals.city.houses.toLocaleString("en-US") : "—")
    .replace("{tools}", String(site.tools.length));

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const logRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [gone, setGone] = useState(false);
  const { progress } = useProgress();
  const sceneReady = useStore((s) => s.sceneReady);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const [fontsReady, setFontsReady] = useState(false);
  const real = useRef(0);

  // Real progress: assets (70%), fonts (10%), compiled shaders (20%).
  // sceneReady implies every texture resolved, even if the loading manager never reported.
  real.current = (sceneReady ? 100 : progress) * 0.7 + (fontsReady ? 10 : 0) + (sceneReady ? 20 : 0);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
    getLenis()?.stop();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const start = performance.now();
    const minMs = reducedMotion ? 400 : MIN_MS;
    let shown = 0;
    let finished = false;
    const set = useStore.getState().set;

    const finish = () => {
      finished = true;
      gsap.ticker.remove(tick);
      const el = root.current!;
      if (reducedMotion) {
        signals.intro = 1;
        set({ loaded: true });
        getLenis()?.start();
        gsap.to(el, { opacity: 0, duration: 0.4, onComplete: () => setGone(true) });
        return;
      }
      const tl = gsap.timeline({ onComplete: () => setGone(true) });
      tl.to(el.querySelectorAll("[data-pre-out]"), { yPercent: -110, duration: 0.8, ease: "inout.site", stagger: 0.03 }, 0.25)
        .to(el.querySelectorAll("[data-pre-fade]"), { opacity: 0, duration: 0.5 }, 0.25)
        .to(bar.current, { scaleX: 0, transformOrigin: "right", duration: 0.7, ease: "inout.site" }, 0.2)
        // The light wave sweeps the city; the camera lifts into the hero view.
        .to(signals, { intro: 1, duration: 3.4, ease: "power2.inOut" }, 0.3)
        .add(() => {
          set({ loaded: true });
          getLenis()?.start();
        }, 1.3);
    };

    const tick = (_: number, dtMs: number) => {
      if (finished) return;
      const elapsed = performance.now() - start;
      const cap = Math.min(100, (elapsed / minMs) * 100);
      const target = Math.min(real.current, cap);
      shown += (target - shown) * Math.min(1, (dtMs / 1000) * 5);
      if (target - shown < 0.3) shown = target;
      signals.loadProgress = shown / 100;
      if (bar.current) bar.current.style.transform = `scaleX(${shown / 100})`;
      logRefs.current.forEach((li, i) => {
        if (li && shown >= LOG[i][0] && li.dataset.on !== "1") {
          li.dataset.on = "1";
          li.textContent = fill(LOG[i][1]);
          gsap.fromTo(li, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" });
        }
      });
      if (shown >= 99.9 && real.current >= 99.9) finish();
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [reducedMotion]);

  if (gone) return null;

  return (
    <div
      ref={root}
      className="preloader fixed inset-0 z-[120] flex flex-col justify-between"
      style={{ padding: "var(--gutter)" }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <span className="pre-corner tl" aria-hidden data-pre-fade />
      <span className="pre-corner tr" aria-hidden data-pre-fade />
      <span className="pre-corner bl" aria-hidden data-pre-fade />
      <span className="pre-corner br" aria-hidden data-pre-fade />

      <div className="flex justify-between t-meta">
        <span className="overflow-clip">
          <span data-pre-out className="inline-block">
            Siddharth Lama <span className="muted">/ portfolio {new Date().getFullYear()}</span>
          </span>
        </span>
        <span className="overflow-clip text-right">
          <span data-pre-out className="inline-block">
            <span className="accent">♒</span> 19.0760°N 72.8777°E
          </span>
        </span>
      </div>

      <p className="pre-caption t-meta muted" data-pre-fade aria-hidden>
        raising the city <span className="accent">·</span> golden hour
      </p>

      <div>
        <div className="flex items-end justify-between gap-6">
          <span className="t-meta overflow-clip pb-3">
            <span data-pre-out className="inline-block">
              <span className="accent">●</span> building the city
            </span>
          </span>
          <ol className="pre-log t-meta hidden pb-3 md:block" aria-hidden data-pre-fade>
            {LOG.map((_, i) => (
              <li
                key={i}
                ref={(el) => {
                  logRefs.current[i] = el;
                }}
                style={{ opacity: 0 }}
              >
                &nbsp;
              </li>
            ))}
          </ol>
        </div>
        <div
          ref={bar}
          className="mt-4 h-px w-full origin-left"
          style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-2))", transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}
