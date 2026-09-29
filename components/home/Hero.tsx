"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { signals } from "@/lib/signals";
import { useStore } from "@/lib/store";
import { site } from "@/content/projects";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { LiveReadout } from "@/components/ui/LiveReadout";

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const type = useRef<HTMLDivElement>(null);
  const reducedMotion = useStore((s) => s.reducedMotion);

  // Scroll-out progress for the scene + a slow drift of the headline.
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        signals.scroll.hero = self.progress;
      },
    });
    const drift = reducedMotion
      ? null
      : gsap.to(type.current, {
          yPercent: -18,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true },
        });
    return () => {
      st.kill();
      drift?.scrollTrigger?.kill();
      drift?.kill();
    };
  }, [reducedMotion]);

  // Mouse parallax on the headline lines, opposite directions for depth.
  useEffect(() => {
    if (reducedMotion) return;
    const lines = type.current!.querySelectorAll<HTMLElement>("[data-parallax]");
    const tick = () => {
      lines.forEach((l, i) => {
        const k = (i % 2 ? -1 : 1) * (10 + i * 6);
        l.style.transform = `translate3d(${signals.pointer.sx * k}px, ${-signals.pointer.sy * k * 0.4}px, 0)`;
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [reducedMotion]);

  return (
    <section
      ref={section}
      id="top"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh flex-col justify-end"
      style={{ padding: "var(--gutter)", paddingBottom: "calc(var(--gutter) * 3.2)" }}
    >
      <div ref={type} className="hero-type">
        <h1 id="hero-title" className="t-display whitespace-nowrap" style={{ fontSize: "var(--hero-size)" }}>
          <span className="sr-only">
            {site.name} — {site.tagline}
          </span>
          {site.headline.map((word, i) => (
            <span key={word} data-parallax aria-hidden className={`block ${i === 1 ? "hero-line-2" : ""}`}>
              <SplitReveal as="span" by="chars" trigger="load" delay={0.15 + i * 0.12} className="block">
                {word}
              </SplitReveal>
            </span>
          ))}
        </h1>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-12">
        <SplitReveal as="p" trigger="load" delay={0.6} className="t-body col-span-2 max-w-[34ch] md:col-span-5">
          {site.intro}
        </SplitReveal>
        <div className="md:col-span-3 md:col-start-8">
          <SplitReveal as="p" trigger="load" delay={0.75} className="t-meta muted">
            Frontend · WebGL · Motion
            <br />
            at Dizrupt, Mumbai
          </SplitReveal>
          <p className="hero-readout t-meta muted mt-3 md:whitespace-nowrap">
            <LiveReadout />
          </p>
        </div>
        <SplitReveal as="p" trigger="load" delay={0.85} className="t-meta md:col-span-2 md:col-start-11 md:text-right">
          <span className="accent">↓</span> Scroll to work
        </SplitReveal>
      </div>
    </section>
  );
}
