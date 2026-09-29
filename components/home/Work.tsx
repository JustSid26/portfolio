"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { signals } from "@/lib/signals";
import { useStore } from "@/lib/store";
import { projects } from "@/content/projects";
import { TransitionLink } from "@/components/TransitionLink";
import { scrollToTarget } from "@/lib/scroll";

const N = projects.length;
const pad = (n: number) => String(n).padStart(2, "0");
const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

export function Work() {
  const outer = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const prev = useRef(0);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const set = useStore((s) => s.set);

  useEffect(() => {
    signals.els.workFrame = frame.current;
    let enter = 0;
    let exit = 0;
    const sts = [
      ScrollTrigger.create({
        trigger: outer.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const x = self.progress * (N - 1);
          const i = Math.min(N - 2, Math.floor(x));
          // Dwell on each project, then glide to the next.
          const idx = i + smooth(0.2, 0.8, x - i);
          signals.scroll.work = self.progress;
          signals.scroll.workIndex = idx;
          const a = Math.round(idx);
          if (a !== prev.current) setActive(a);
        },
      }),
      ScrollTrigger.create({
        trigger: outer.current,
        start: "top bottom",
        end: "top top",
        onUpdate: (self) => {
          enter = self.progress;
          signals.scroll.workIn = enter * (1 - exit);
        },
      }),
      ScrollTrigger.create({
        trigger: outer.current,
        start: "bottom bottom",
        end: "bottom top",
        onUpdate: (self) => {
          exit = self.progress;
          signals.scroll.workIn = enter * (1 - exit);
        },
      }),
    ];
    return () => {
      sts.forEach((s) => s.kill());
      signals.els.workFrame = null;
    };
  }, []);

  // Swap the project copy: old lines out upward, new lines in from below.
  useEffect(() => {
    const from = items.current[prev.current];
    const to = items.current[active];
    const dir = active > prev.current ? 1 : -1;
    prev.current = active;
    if (!to || from === to) return;
    const d = reducedMotion ? 0.01 : 1;
    const fromLines = from?.querySelectorAll("[data-line]") ?? [];
    const toLines = to.querySelectorAll("[data-line]");
    gsap.killTweensOf([fromLines, toLines]);
    if (from) {
      gsap.to(fromLines, { yPercent: -110 * dir, duration: 0.6 * d, ease: "power3.in", stagger: 0.03 });
      gsap.set(from, { visibility: "hidden", delay: 0.6 * d });
    }
    gsap.set(to, { visibility: "visible" });
    gsap.fromTo(
      toLines,
      { yPercent: 110 * dir },
      { yPercent: 0, duration: 1.1 * d, ease: "expo.site", stagger: 0.05, delay: 0.35 * d },
    );
  }, [active, reducedMotion]);

  useEffect(() => {
    const tick = () => {
      const el = frame.current;
      if (!el) return;
      const r = signals.billboard;
      el.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
      el.style.width = `${r.w}px`;
      el.style.height = `${r.h}px`;
      el.style.visibility = r.on && r.w > 20 ? "visible" : "hidden";
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const goTo = (i: number) => {
    const el = outer.current!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    scrollToTarget(top + (span * i) / (N - 1) + 2);
  };

  const p = projects[active];

  return (
    <section id="work" aria-labelledby="work-title" className="relative">
      <header
        className="flex items-end justify-between t-meta"
        style={{ padding: "calc(var(--gutter) * 3) var(--gutter) var(--gutter)" }}
      >
        <h2 id="work-title">
          <span className="idx">[01]</span>Selected work <span className="muted">({pad(N)})</span>
        </h2>
        <p className="muted hidden max-w-[36ch] text-right md:block">
          Agency work at Dizrupt and my own products, side by side.
        </p>
      </header>

      <div ref={outer} style={{ height: `${N * 90}svh` }}>
        <div className="sticky top-0 h-svh w-full overflow-clip">
          {/* The billboard is on the canvas; this link rides exactly on its screen */}
          <div
            ref={frame}
            data-work-frame
            data-cursor="view"
            data-cursor-label="View case"
            className="billboard-hit"
            onPointerEnter={() => set({ hovered: active })}
            onPointerLeave={() => set({ hovered: -1 })}
          >
            <TransitionLink
              href={`/work/${p.slug}`}
              flipFrom={() => frame.current}
              flipImage={p.images[0]}
              className="absolute inset-0 block"
              aria-label={`View case study: ${p.name}`}
              data-cursor="view"
              data-cursor-label="View case"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[0]} alt="" className="work-fallback h-full w-full object-cover" />
            </TransitionLink>
          </div>

          {/* Project copy, one stacked block per project */}
          <div className="work-copy absolute">
            {projects.map((proj, i) => (
              <article
                key={proj.slug}
                ref={(el) => {
                  items.current[i] = el;
                }}
                aria-hidden={i !== active}
                className="absolute inset-x-0 bottom-0"
                style={{ visibility: i === 0 ? "visible" : "hidden" }}
              >
                <div className="t-meta flex gap-4">
                  <span className="overflow-clip">
                    <span data-line className="block">
                      {pad(i + 1)} / {pad(N)}
                    </span>
                  </span>
                  <span className="overflow-clip">
                    <span data-line className="block accent">
                      {proj.bucket === "dizrupt" ? "at Dizrupt" : "Own project"}
                    </span>
                  </span>
                </div>
                <h3 className="t-display mt-4" style={{ fontSize: "var(--work-title)" }}>
                  <span className="block overflow-clip pb-[0.05em]">
                    <span data-line className="block">
                      {proj.name}
                    </span>
                  </span>
                </h3>
                <dl className="t-meta mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                  {[
                    ["Role", proj.role],
                    ["Type", proj.category],
                    ["Year", proj.year],
                  ].map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="overflow-clip muted">
                        <span data-line className="block">
                          {k}
                        </span>
                      </dt>
                      <dd className="overflow-clip">
                        <span data-line className="block">
                          {v}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="t-body mt-6 max-w-[38ch] overflow-clip">
                  <span data-line className="block">
                    {proj.oneLiner}
                  </span>
                </p>
              </article>
            ))}
          </div>

          {/* Index — every project reachable by keyboard */}
          <nav aria-label="Projects" className="work-index absolute t-meta">
            <ol className="flex flex-wrap gap-x-5 gap-y-1">
              {projects.map((proj, i) => (
                <li key={proj.slug}>
                  <TransitionLink
                    href={`/work/${proj.slug}`}
                    onFocus={() => goTo(i)}
                    className={`link-line ${i === active ? "" : "muted"}`}
                  >
                    <span className="tabular-nums">{pad(i + 1)}</span> {proj.name}
                  </TransitionLink>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
