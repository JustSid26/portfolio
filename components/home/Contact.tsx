"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { signals } from "@/lib/signals";
import { site } from "@/content/projects";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { MumbaiClock } from "@/components/ui/MumbaiClock";

export function Contact() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: (self) => {
        signals.scroll.contact = self.progress;
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section
      ref={section}
      id="contact"
      aria-labelledby="contact-title"
      className="relative flex min-h-svh flex-col justify-end"
      style={{ padding: "0 var(--gutter) calc(var(--gutter) * 3.4)" }}
    >
      <div>
        <p className="t-meta muted">
          <span className="idx">[03]</span>Contact
        </p>
        <h2 id="contact-title" className="t-display mt-4" style={{ fontSize: "var(--hero-size)" }}>
          <SplitReveal as="span" by="chars" className="block">
            Let&apos;s
          </SplitReveal>
          <SplitReveal as="span" by="chars" delay={0.1} className="block contact-line-2">
            build it
          </SplitReveal>
        </h2>

        <div className="mt-12 flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <SplitReveal as="p" className="t-body max-w-[36ch]">
            {site.contactCta}
          </SplitReveal>
          <Magnetic strength={0.4}>
            <a
              href={`mailto:${site.email}`}
              data-cursor="link"
              className="contact-cta t-display inline-flex items-center rounded-full"
              style={{ fontSize: "var(--step-2)" }}
            >
              <span className="inline-block">Contact me ↗</span>
            </a>
          </Magnetic>
        </div>
      </div>

      <footer className="mt-12 grid grid-cols-2 gap-6 border-t pt-5 t-meta hairline md:grid-cols-12">
        <div className="col-span-2 md:col-span-4">
          <MumbaiClock />
        </div>
        <div className="md:col-span-3">
          <a href={`mailto:${site.email}`} className="link-line">
            {site.email}
          </a>
        </div>
        <ul className="flex gap-5 md:col-span-3">
          {site.socials.map((s) => (
            <li key={s.label}>
              <Magnetic strength={0.5}>
                <a href={s.href} className="link-line inline-block" target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </Magnetic>
            </li>
          ))}
        </ul>
        <p className="muted md:col-span-2 md:text-right">© {new Date().getFullYear()} {site.name}</p>
      </footer>
    </section>
  );
}
