"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { signals } from "@/lib/signals";
import { useStore } from "@/lib/store";
import { site } from "@/content/projects";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { Marquee } from "@/components/ui/Marquee";

// About holds on one frame while the billboard's pins fly into a giant MacBook in the street
// (the canvas does that); the copy sits on the right. Click the laptop for the skills.
export function About() {
  const section = useRef<HTMLElement>(null);
  const hit = useRef<HTMLButtonElement>(null);
  const skillsOpen = useStore((s) => s.skillsOpen);
  const set = useStore((s) => s.set);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        signals.scroll.about = self.progress;
      },
    });
    // the button rides on the laptop's screen; leaving About closes the skills again
    const tick = () => {
      const el = hit.current;
      if (!el) return;
      const r = signals.billboard;
      const on = r.laptop && r.w > 20;
      el.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
      el.style.width = `${r.w}px`;
      el.style.height = `${r.h}px`;
      el.style.visibility = on ? "visible" : "hidden";
      if (!on && useStore.getState().skillsOpen) set({ skillsOpen: false });
    };
    gsap.ticker.add(tick);
    return () => {
      st.kill();
      gsap.ticker.remove(tick);
    };
  }, [set]);

  const blocks = [
    { k: "Studying", v: site.about.studying },
    { k: "At Dizrupt", v: site.about.dizrupt },
    { k: "Next", v: site.about.next },
  ];

  return (
    <section ref={section} id="about" aria-labelledby="about-title" className="relative">
      <div style={{ height: "260svh" }}>
        <div className="sticky top-0 flex h-svh items-center" style={{ padding: "0 var(--gutter)" }}>
          <div className="about-copy ml-auto w-full md:w-[46%]">
            <h2 id="about-title" className="t-meta">
              <span className="idx">[02]</span>About
            </h2>
            <dl className="mt-8 flex flex-col gap-8">
              {blocks.map((b) => (
                <div key={b.k} className="grid grid-cols-1 gap-3 border-t pt-4 hairline md:grid-cols-6">
                  <dt className="t-meta accent md:col-span-2">{b.k}</dt>
                  <dd className="t-body md:col-span-4">
                    <SplitReveal as="span" className="block">
                      {b.v}
                    </SplitReveal>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="t-meta muted mt-8">
              <span className="accent">←</span> Click the laptop to open it
            </p>
          </div>
          <button
            ref={hit}
            type="button"
            className="laptop-hit"
            aria-pressed={skillsOpen}
            aria-label="Open the laptop to see my skills"
            data-cursor="view"
            data-cursor-label="Open"
            onClick={() => set({ skillsOpen: !skillsOpen })}
          />
          <ul className="sr-only" aria-label="Skills">
            {site.tools.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <Marquee items={site.marquee} className="t-display py-6" style={{ fontSize: "var(--step-4)" }} />
    </section>
  );
}
