"use client";

import { useEffect, useRef } from "react";
import gsap, { SplitText } from "@/lib/gsap";
import MagneticButton from "./MagneticButton";

const socials = [
    { label: "GitHub", handle: "@JustSid26", href: "https://github.com/JustSid26" },
    { label: "LinkedIn", handle: "in/sid2005", href: "https://www.linkedin.com/in/sid2005/" },
    { label: "Instagram", handle: "@_ecs_t_asy_", href: "https://www.instagram.com/_ecs_t_asy_/" },
];

const EMAIL = "lamasidharth25@gmail.com";

export default function Contact() {
    const ref = useRef<HTMLElement>(null);
    const headRef = useRef<HTMLHeadingElement>(null);
    const giantRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let split: SplitText | null = null;

        const ctx = gsap.context(() => {
            gsap.from(".contact-reveal", {
                opacity: 0,
                y: 34,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
            });

            if (!reduced && headRef.current) {
                split = new SplitText(headRef.current, { type: "lines", mask: "lines" });
                gsap.from(split.lines, {
                    yPercent: 110,
                    duration: 0.9,
                    stagger: 0.1,
                    ease: "expo.out",
                    scrollTrigger: { trigger: headRef.current, start: "top 82%", once: true },
                });
            }

            gsap.fromTo(
                giantRef.current,
                { xPercent: 5 },
                {
                    xPercent: -5,
                    ease: "none",
                    scrollTrigger: {
                        trigger: giantRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    },
                }
            );
        }, ref);

        return () => {
            ctx.revert();
            split?.revert();
        };
    }, []);

    return (
        <section ref={ref} id="contact" className="section pb-0 overflow-hidden">
            <div className="shell">
                <div className="sec-head contact-reveal">
                    <span className="sec-no">SEC.04</span>
                    <span className="sec-name">Transmission</span>
                    <span className="sec-note hidden sm:block">Response time: fast</span>
                </div>

                <div className="mt-2 grid gap-14 md:grid-cols-[1.25fr_1fr] md:gap-20 items-start">
                    <div>
                        <h2
                            ref={headRef}
                            className="display section-title"
                            style={{ fontSize: "clamp(2.6rem, 7vw, 5.6rem)" }}
                        >
                            Let&apos;s build something good.
                        </h2>

                        <p
                            className="contact-reveal mt-7 max-w-xl text-lg"
                            style={{ color: "var(--ink-dim)" }}
                        >
                            Open to internships, collaborations and interesting problems in
                            software, AI and data. The fastest way to reach me is email.
                        </p>

                        <div className="contact-reveal mt-9">
                            <MagneticButton
                                href={`mailto:${EMAIL}`}
                                className="btn btn-primary"
                                strength={0.25}
                            >
                                {EMAIL} →
                            </MagneticButton>
                        </div>

                    </div>

                    <div className="contact-reveal md:pt-24">
                        <p className="label mb-2">Elsewhere</p>
                        {socials.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ledger-link"
                                data-cursor="OPEN ↗"
                            >
                                <span>{s.label}</span>
                                <span className="flex items-center gap-3">
                                    <span className="font-mono text-xs" style={{ color: "var(--ink-mute)" }}>
                                        {s.handle}
                                    </span>
                                    <span className="ledger-arrow" aria-hidden="true">↗</span>
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Giant outlined sign-off */}
            <div className="mt-20 md:mt-28" aria-hidden="true">
                <div ref={giantRef} className="footer-giant text-center">
                    Siddharth&nbsp;Lama
                </div>
            </div>

            <div className="shell">
                <div className="divider" />
                <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 py-7">
                    <p className="label">© 2026 Siddharth Lama</p>
                    <p className="label">DOC SL-2026 · REV 3.0 · End of document</p>
                    <a href="#hero" className="label link-underline" data-cursor="TOP ↑">
                        Back to top ↑
                    </a>
                </footer>
            </div>
        </section>
    );
}
