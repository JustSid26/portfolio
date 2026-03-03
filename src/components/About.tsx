"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
    const sectionRef = useRef<HTMLElement>(null);
    const accentRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Accent line slides in
            gsap.fromTo(
                accentRef.current,
                { scaleX: 0 },
                {
                    scaleX: 1,
                    duration: 0.8,
                    ease: "power3.inOut",
                    transformOrigin: "left center",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 85%",
                        once: true,
                    },
                }
            );

            // Heading whole-element reveal
            gsap.fromTo(
                headingRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                        once: true,
                    },
                }
            );

            // Body lines stagger in
            gsap.fromTo(
                ".about-line",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                        once: true,
                    },
                }
            );

            // Keyword highlights activate
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: "top 60%",
                once: true,
                onEnter: () => {
                    document.querySelectorAll(".keyword-highlight").forEach((kw) => {
                        kw.classList.add("active");
                    });
                },
            });

            // Parallax heading vs body
            if (headingRef.current) {
                gsap.to(headingRef.current, {
                    y: -20,
                    ease: "none",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1,
                    },
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="about"
            className="relative py-32 px-6 max-w-4xl mx-auto"
        >
            {/* Decorative accent line */}
            <div
                ref={accentRef}
                className="w-16 h-[3px] mb-8 rounded-full"
                style={{
                    background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))",
                    boxShadow: "0 0 12px var(--glow-cyan)",
                }}
            />

            <h2
                ref={headingRef}
                className="text-4xl md:text-5xl font-bold mb-8 gradient-heading"
            >
                About Me
            </h2>

            <div className="space-y-5">
                <p className="about-line text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    I am a final-year BTech student aspiring to become a{" "}
                    <span className="keyword-highlight">Data Scientist</span>.
                </p>
                <p className="about-line text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    I have experience building{" "}
                    <span className="keyword-highlight">AI-powered applications</span>,{" "}
                    <span className="keyword-highlight">autonomous rover systems</span>,
                    and full-stack web applications.
                </p>
                <p className="about-line text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    My interests include{" "}
                    <span className="keyword-highlight">machine learning</span>,{" "}
                    <span className="keyword-highlight">robotics</span>, and{" "}
                    <span className="keyword-highlight">scalable backend systems</span>.
                </p>
            </div>
        </section>
    );
}