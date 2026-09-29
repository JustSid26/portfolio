"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { signals } from "@/lib/signals";
import { useStore } from "@/lib/store";
import { projects } from "@/content/projects";
import { TransitionLink } from "@/components/TransitionLink";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { KineticNumber } from "@/components/ui/KineticNumber";
import { Magnetic } from "@/components/ui/Magnetic";

export function CaseStudy({ index }: { index: number }) {
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];
  const root = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const nextFrame = useRef<HTMLDivElement>(null);
  const reducedMotion = useStore((s) => s.reducedMotion);

  useEffect(() => {
    signals.els.caseMedia = hero.current;
    const sts: ScrollTrigger[] = [
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          signals.scroll.case = self.progress;
        },
      }),
    ];

    // Sticky media: crossfade through the images as the copy scrolls past.
    const slides = body.current!.querySelectorAll<HTMLElement>("[data-slide]");
    const n = slides.length;
    sts.push(
      ScrollTrigger.create({
        trigger: body.current,
        start: "top center",
        end: "bottom center",
        onUpdate: (self) => {
          const x = self.progress * (n - 1);
          // Later slides stack on top and fade in over an opaque one — never see-through.
          slides.forEach((s, i) => {
            const o = i === 0 ? 1 : Math.min(1, Math.max(0, (x - i + 0.6) * 2.5));
            s.style.opacity = String(o);
            s.style.transform = reducedMotion ? "" : `scale(${1.08 - o * 0.08})`;
          });
        },
      }),
    );

    // Hero media gets a slow parallax push as it scrolls away.
    const tween = reducedMotion
      ? null
      : gsap.to(hero.current!.querySelector("[data-flip-target]"), {
          yPercent: 12,
          scale: 1.08,
          ease: "none",
          scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: true },
        });

    return () => {
      sts.forEach((s) => s.kill());
      tween?.scrollTrigger?.kill();
      tween?.kill();
      signals.els.caseMedia = null;
    };
  }, [index, reducedMotion]);

  return (
    <article ref={root} aria-labelledby="case-title">
      <header style={{ padding: "calc(var(--gutter) * 5) var(--gutter) var(--gutter)" }}>
        <div className="flex flex-wrap items-center justify-between gap-4 t-meta">
          <TransitionLink href="/#work" className="link-line">
            ← All work
          </TransitionLink>
          <span className="accent">{p.bucket === "dizrupt" ? "Client work at Dizrupt" : "Own project"}</span>
        </div>
        <SplitReveal
          as="h1"
          by="chars"
          trigger="load"
          id="case-title"
          className="t-display mt-[12svh]"
          style={{ fontSize: "var(--step-5)" }}
        >
          {p.name}
        </SplitReveal>

        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-12">
          <div className="case-role col-span-2 md:col-span-5">
            <p className="t-meta muted">My role</p>
            <SplitReveal as="p" trigger="load" delay={0.3} className="t-display mt-2" style={{ fontSize: "var(--step-2)" }}>
              {p.role}
            </SplitReveal>
          </div>
          <dl className="col-span-2 grid grid-cols-3 gap-4 t-meta md:col-span-6 md:col-start-7">
            {[
              ["Type", p.category],
              ["Year", p.year],
              ["For", p.bucket === "dizrupt" ? "Dizrupt client" : "Self-initiated"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="muted">{k}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Shared-element target for the card → case transition */}
      <div ref={hero} className="relative overflow-clip" style={{ margin: "0 var(--gutter)", aspectRatio: "16 / 9" }}>
        {p.video ? (
          <video
            key={p.video}
            data-flip-target
            src={p.video}
            poster={p.images[0]}
            muted
            loop
            playsInline
            autoPlay={!reducedMotion}
            controls={reducedMotion}
            preload="auto"
            aria-label={`${p.name} — product walkthrough`}
            className="h-full w-full object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img data-flip-target src={p.images[0]} alt={`${p.name} — key visual`} className="h-full w-full object-cover" />
        )}
      </div>

      <div
        ref={body}
        className="grid grid-cols-1 gap-12 md:grid-cols-12"
        style={{ padding: "18svh var(--gutter) 10svh" }}
      >
        <div className="md:col-span-7">
          <div className="sticky top-[12svh] aspect-[16/9] w-full overflow-clip" aria-label="Project images" role="group">
            {p.images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                data-slide
                src={src}
                alt={`${p.name} — screen ${i + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ opacity: i === 0 ? 1 : 0 }}
                loading="lazy"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[14svh] md:col-span-4 md:col-start-9">
          <section>
            <h2 className="t-meta muted">Overview</h2>
            <SplitReveal as="p" className="t-body mt-4">
              {p.overview ?? p.oneLiner}
            </SplitReveal>
          </section>

          <section>
            <h2 className="t-meta muted">What I did</h2>
            <SplitReveal as="p" className="t-display mt-4" style={{ fontSize: "var(--step-3)" }}>
              {p.role}
            </SplitReveal>
            <p className="t-meta mt-4 muted">PLACEHOLDER — list the specific pieces you owned, in one or two lines.</p>
          </section>

          {p.stats && (
            <section>
              <h2 className="t-meta muted">Numbers</h2>
              <ul className="mt-4 flex flex-col gap-8">
                {p.stats.map((s) => (
                  <li key={s.label} className="border-t pt-4 hairline">
                    <span className="t-display block" style={{ fontSize: "var(--step-4)" }}>
                      <KineticNumber stat={s} />
                    </span>
                    <span className="t-meta muted">{s.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="t-meta muted">Stack</h2>
            <ul className="mt-4 flex flex-wrap gap-2 t-meta">
              {p.stack?.map((s) => (
                <li key={s} className="pill">
                  {s}
                </li>
              ))}
            </ul>
            {p.link !== "#" && (
              <Magnetic className="mt-8">
                <a href={p.link} target="_blank" rel="noreferrer" className="pill t-meta" data-cursor="link">
                  Visit live ↗
                </a>
              </Magnetic>
            )}
          </section>
        </div>
      </div>

      {/* Next project */}
      <section aria-label="Next project" style={{ padding: "12svh var(--gutter) 22svh" }}>
        <TransitionLink
          href={`/work/${next.slug}`}
          flipFrom={() => nextFrame.current}
          flipImage={next.images[0]}
          data-cursor="view"
          data-cursor-label="Next"
          className="group block border-t pt-6 hairline"
        >
          <span className="t-meta muted">Next project</span>
          <div className="mt-6 grid grid-cols-1 items-end gap-8 md:grid-cols-12">
            <span className="t-display block md:col-span-7" style={{ fontSize: "var(--step-5)" }}>
              {next.name}
            </span>
            <div ref={nextFrame} className="next-frame relative aspect-[16/9] overflow-clip md:col-span-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={next.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </div>
        </TransitionLink>
      </section>
    </article>
  );
}
