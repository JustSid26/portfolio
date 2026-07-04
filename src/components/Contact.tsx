"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import MagneticButton from "./MagneticButton";

const socials = [
    { label: "GitHub", handle: "@JustSid26", href: "https://github.com/JustSid26" },
    { label: "LinkedIn", handle: "in/sid2005", href: "https://www.linkedin.com/in/sid2005/" },
    { label: "Instagram", handle: "@_ecs_t_asy_", href: "https://www.instagram.com/_ecs_t_asy_/" },
];

const EMAIL = "siddharth.l@dizrupt.in";

export default function Contact() {
    const ref = useRef<HTMLElement>(null);
    const giantRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".contact-reveal", {
                opacity: 0,
                y: 44,
                duration: 0.9,
                stagger: 0.12,
                ease: "power3.out",
                scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
            });

            // Giant name drifts sideways as the footer scrolls into view
            gsap.fromTo(
                giantRef.current,
                { xPercent: 6 },
                {
                    xPercent: -6,
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
        return () => ctx.revert();
    }, []);

    return (
        <section ref={ref} id="contact" className="section pb-0 overflow-hidden">
            <div className="shell">
                <div className="grid gap-14 md:grid-cols-[1.2fr_1fr] md:gap-20 items-start">
                    <div>
                        <p className="eyebrow contact-reveal">04 — Contact</p>

                        <h2
                            className="contact-reveal mt-6 font-bold tracking-tight leading-[1.02]"
                            style={{ fontSize: "clamp(2.4rem, 6vw, 4.6rem)" }}
                        >
                            <span className="gradient-heading">Let&apos;s build</span>
                            <br />
                            <span className="aurora-text">something good.</span>
                        </h2>

                        <p
                            className="contact-reveal mt-7 max-w-xl text-lg"
                            style={{ color: "var(--ink-dim)" }}
                        >
                            Open to internships, collaborations and interesting problems in data,
                            ML and robotics. The fastest way to reach me is email.
                        </p>

                        <div className="contact-reveal mt-9">
                            <MagneticButton href={`mailto:${EMAIL}`} className="btn btn-primary" strength={0.3}>
                                {EMAIL}
                                <span aria-hidden="true">→</span>
                            </MagneticButton>
                        </div>
                    </div>

                    <div className="contact-reveal">
                        <p className="label mb-2">Elsewhere</p>
                        {socials.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ledger-link"
                            >
                                <span>{s.label}</span>
                                <span className="flex items-center gap-3">
                                    <span className="font-mono text-sm" style={{ color: "var(--ink-mute)" }}>
                                        {s.handle}
                                    </span>
                                    <span className="ledger-arrow" aria-hidden="true">↗</span>
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Giant outlined signature */}
            <div className="mt-24 md:mt-32" aria-hidden="true">
                <div ref={giantRef} className="footer-giant text-center">
                    SIDDHARTH&nbsp;LAMA
                </div>
            </div>

            <div className="shell">
                <div className="divider" />
                <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 py-8">
                    <p className="label">© 2026 Siddharth Lama</p>
                    <p className="label">Built with Next.js · Three.js · GSAP</p>
                    <a href="#hero" className="label link-underline">
                        Back to top ↑
                    </a>
                </footer>
            </div>
        </section>
    );
}
