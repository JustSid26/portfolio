"use client";

// Clicking the floating laptop "opens" it: a macOS-style desktop grows out of the laptop's screen —
// menu bar, a Finder-like window titled Skills with each tool as an app icon, and a dock.
import { useEffect, useRef, useState } from "react";
import {
  siTypescript, siReact, siNextdotjs, siThreedotjs, siGsap, siNodedotjs, siPython, siOpenjdk,
  siPostgresql, siTailwindcss, siFigma, siOpengl, siGit, siBlender,
} from "simple-icons";
import { gsap } from "@/lib/gsap";
import { signals } from "@/lib/signals";
import { useStore } from "@/lib/store";

type Icon = { title: string; path: string; hex: string };
// PLACEHOLDER — edit to match what you actually use
const SKILLS: { name: string; icon: Icon; group: string }[] = [
  { name: "TypeScript", icon: siTypescript, group: "Languages" },
  { name: "Python", icon: siPython, group: "Languages" },
  { name: "Java", icon: siOpenjdk, group: "Languages" },
  { name: "GLSL", icon: siOpengl, group: "Languages" },
  { name: "React", icon: siReact, group: "Frontend" },
  { name: "Next.js", icon: siNextdotjs, group: "Frontend" },
  { name: "Tailwind", icon: siTailwindcss, group: "Frontend" },
  { name: "Three.js", icon: siThreedotjs, group: "3D & Motion" },
  { name: "GSAP", icon: siGsap, group: "3D & Motion" },
  { name: "Blender", icon: siBlender, group: "3D & Motion" },
  { name: "Node.js", icon: siNodedotjs, group: "Backend" },
  { name: "PostgreSQL", icon: siPostgresql, group: "Backend" },
  { name: "Git", icon: siGit, group: "Tools" },
  { name: "Figma", icon: siFigma, group: "Tools" },
];
const GROUPS = ["All", ...Array.from(new Set(SKILLS.map((s) => s.group)))];

// dark brand marks (Next.js, Three.js…) get a light tile so they stay visible
const tileFor = (hex: string) => {
  const n = parseInt(hex, 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum < 0.25 ? { bg: "#f2f3f5", fg: `#${hex}` } : { bg: `#${hex}`, fg: "#ffffff" };
};

export function MacWindow() {
  const open = useStore((s) => s.skillsOpen);
  const set = useStore((s) => s.set);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const root = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const [group, setGroup] = useState("All");
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState("");
  // desktop → Spotlight types "skills" → the Skills window opens
  const [stage, setStage] = useState<"desktop" | "spotlight" | "result" | "window">("desktop");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", hour: "2-digit", minute: "2-digit" });
    const t = () => setTime(f.format(new Date()));
    t();
    const id = setInterval(t, 20000);
    return () => clearInterval(id);
  }, []);

  // grow out of the laptop screen, shrink back into it
  useEffect(() => {
    const el = root.current;
    const w = win.current;
    if (!el || !w) return;
    const r = signals.billboard;
    const from = () => {
      const box = el.getBoundingClientRect();
      const sx = Math.max(0.05, r.w / box.width);
      const sy = Math.max(0.05, r.h / box.height);
      return { x: r.x + r.w / 2 - (box.left + box.width / 2), y: r.y + r.h / 2 - (box.top + box.height / 2), scaleX: sx, scaleY: sy };
    };
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => {
        if (reducedMotion) return gsap.set(el, { opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1 });
        gsap.fromTo(el, { opacity: 0.2, ...from() }, { opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.75, ease: "expo.site" });
        (el.querySelector(".mac-close") as HTMLElement | null)?.focus({ preventScroll: true });
      });
    } else if (visible) {
      if (reducedMotion) return setVisible(false);
      gsap.to(el, { opacity: 0, ...from(), duration: 0.5, ease: "power3.in", onComplete: () => setVisible(false) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) {
      setStage("desktop");
      setQuery("");
      return;
    }
    if (reducedMotion) {
      setStage("window");
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    setStage("desktop");
    setQuery("");
    at(1100, () => setStage("spotlight"));
    "skills".split("").forEach((_, i) => at(1500 + i * 120, () => setQuery("skills".slice(0, i + 1))));
    at(2350, () => setStage("result"));
    at(2950, () => setStage("window"));
    return () => timers.forEach(clearTimeout);
  }, [open, reducedMotion]);

  // the Finder window animates in when its stage arrives
  useEffect(() => {
    if (stage !== "window" || !win.current || reducedMotion) return;
    gsap.fromTo(win.current, { opacity: 0, scale: 0.92, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "expo.site" });
    gsap.fromTo(root.current!.querySelectorAll(".mac-app"), { opacity: 0, y: 14, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.03, delay: 0.15, ease: "back.out(1.6)" });
  }, [stage, reducedMotion]);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && set({ skillsOpen: false });
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [open, set]);

  const shown = SKILLS.filter((s) => group === "All" || s.group === group);

  return (
    <div className="mac-layer" data-open={visible || undefined} onClick={() => set({ skillsOpen: false })}>
      <div ref={root} className="mac-desktop" role="dialog" aria-modal="true" aria-label="Skills" onClick={(e) => e.stopPropagation()}>
        {/* close is always reachable, even before the window is up */}
        <button type="button" className="sr-only" onClick={() => set({ skillsOpen: false })}>
          Close
        </button>
        <div className="mac-menubar">
          <span className="mac-apple" aria-hidden></span>
          <strong>Finder</strong>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span className="mac-menubar-right">{time} IST</span>
        </div>
        {(stage === "spotlight" || stage === "result") && (
          <div className="mac-spotlight" aria-live="polite">
            <div className="mac-spot-bar">
              <svg viewBox="0 0 24 24" aria-hidden>
                <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
                <path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <span className="mac-spot-text">
                {query || <span className="mac-spot-ph">Spotlight Search</span>}
                <i className="mac-caret" />
              </span>
            </div>
            {query.length >= 3 && (
              <div className="mac-spot-results">
                <p>Top Hit</p>
                <div className="mac-spot-row" data-active={stage === "result" || undefined}>
                  <span className="mac-folder" aria-hidden />
                  <span>
                    <strong>skills</strong>
                    <small>Folder — ~/siddharth</small>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={win} className="mac-window" hidden={stage !== "window"}>
          <div className="mac-titlebar">
            <div className="mac-lights">
              <button type="button" className="mac-close" aria-label="Close skills" onClick={() => set({ skillsOpen: false })} />
              <i />
              <i />
            </div>
            <span className="mac-title">~/siddharth/skills</span>
          </div>
          <div className="mac-body">
            <nav className="mac-sidebar" aria-label="Skill groups">
              <p>Favourites</p>
              {GROUPS.map((g) => (
                <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)}>
                  {g}
                </button>
              ))}
            </nav>
            <ul className="mac-grid">
              {shown.map((s) => {
                const t = tileFor(s.icon.hex);
                return (
                  <li key={s.name} className="mac-app">
                    <span className="mac-icon" style={{ background: t.bg }}>
                      <svg viewBox="0 0 24 24" aria-hidden>
                        <path d={s.icon.path} fill={t.fg} />
                      </svg>
                    </span>
                    <span className="mac-label">{s.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="mac-dock" aria-hidden>
          {SKILLS.slice(0, 8).map((s) => {
            const t = tileFor(s.icon.hex);
            return (
              <span key={s.name} className="mac-icon" style={{ background: t.bg }}>
                <svg viewBox="0 0 24 24">
                  <path d={s.icon.path} fill={t.fg} />
                </svg>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
