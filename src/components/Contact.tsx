"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "./MagneticButton";

gsap.registerPlugin(ScrollTrigger);

const socials = [
    { label: "GH", href: "https://github.com/JustSid26", title: "GitHub" },
    { label: "IN", href: "https://www.linkedin.com/in/sid2005/", title: "LinkedIn" },
    { label: "IG", href: "https://www.instagram.com/_ecs_t_asy_/", title: "Instagram" },
];

const EMAIL = "siddharth.l@dizrupt.in";

export default function Contact() {
    const ref = useRef<HTMLElement>(null);

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
        }, ref);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={ref} id="contact" className="section pb-0">
            <div className="shell text-center">
                <p className="eyebrow contact-reveal justify-center" style={{ display: "inline-flex" }}>
                    04 — Contact
                </p>

                <h2
                    className="contact-reveal mx-auto mt-6 font-bold tracking-tight leading-[1.02]"
                    style={{ fontSize: "clamp(2.4rem, 7vw, 5.5rem)" }}
                >
                    <span className="gradient-heading">Let&apos;s build</span>
                    <br />
                    <span className="aurora-text">something good.</span>
                </h2>

                <p
                    className="contact-reveal mx-auto mt-7 max-w-xl text-lg"
                    style={{ color: "var(--ink-dim)" }}
                >
                    Open to internships, collaborations and interesting problems in data,
                    ML and robotics. The fastest way to reach me is email.
                </p>

                <div className="contact-reveal mt-10 flex flex-col items-center gap-6">
                    <MagneticButton href={`mailto:${EMAIL}`} className="btn btn-primary" strength={0.3}>
                        {EMAIL}
                        <span aria-hidden="true">→</span>
                    </MagneticButton>

                    <div className="flex justify-center gap-3">
                        {socials.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={s.title}
                                aria-label={s.title}
                                className="social-link"
                            >
                                {s.label}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="divider contact-reveal mt-24" />
                <footer className="contact-reveal flex flex-col sm:flex-row items-center justify-between gap-3 py-8">
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
