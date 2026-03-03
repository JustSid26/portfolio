"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const socials = [
    { label: "GH", href: "https://github.com/JustSid26", title: "GitHub" },
    { label: "LI", href: "https://www.linkedin.com/in/sid2005/", title: "LinkedIn" },
    { label: "IG", href: "https://www.instagram.com/_ecs_t_asy_/", title: "Instagram" },
];

export default function Contact() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Background glow entrance
            gsap.fromTo(
                glowRef.current,
                { opacity: 0, scale: 0.5 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1.2,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 90%",
                        once: true,
                    },
                }
            );

            // Heading whole-element reveal
            gsap.fromTo(
                headingRef.current,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 85%",
                        once: true,
                    },
                }
            );

            // Subtitle
            gsap.fromTo(
                ".contact-subtitle",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                        once: true,
                    },
                }
            );

            // CTA button
            gsap.fromTo(
                ".contact-cta",
                { opacity: 0, y: 20, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                        once: true,
                    },
                }
            );

            // Social links stagger
            gsap.fromTo(
                ".social-link",
                { opacity: 0, y: 20, scale: 0.8 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                        once: true,
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="contact"
            className="relative py-32 px-6 text-center overflow-hidden"
        >
            {/* Background glow */}
            <div
                ref={glowRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
                style={{
                    background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, rgba(168,85,247,0.04) 40%, transparent 70%)",
                    filter: "blur(60px)",
                }}
            />

            <div className="relative z-10 max-w-2xl mx-auto">
                <h2
                    ref={headingRef}
                    className="text-4xl md:text-5xl font-bold mb-6 gradient-heading"
                >
                    Let&apos;s Connect
                </h2>

                <p
                    className="contact-subtitle text-lg mb-10"
                    style={{ color: "var(--text-secondary)" }}
                >
                    Interested in collaborating or hiring? I&apos;d love to hear from you.
                </p>

                <a href="mailto:your-email@example.com" className="contact-cta btn-glow inline-block">
                    Get In Touch
                </a>

                <div className="flex justify-center gap-4 mt-12">
                    {socials.map((s, i) => (
                        <a
                            key={i}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={s.title}
                            className="social-link"
                        >
                            {s.label}
                        </a>
                    ))}
                </div>

                {/* Footer line */}
                <div className="section-divider mt-16 mb-6" />
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    © 2026 Siddharth Lama. Built with Next.js & GSAP.
                </p>
            </div>
        </section>
    );
}