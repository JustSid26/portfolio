"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap, { SplitText } from "@/lib/gsap";

const modules = [
    {
        n: "M-01",
        title: "Data & Machine Learning",
        body: "Turning messy data into decisions — EDA, feature engineering, model training and evaluation across supervised and unsupervised problems.",
        tools: ["Python", "TensorFlow", "Pandas", "scikit-learn"],
    },
    {
        n: "M-02",
        title: "Embedded & Robotics",
        body: "Bringing software into the physical world — sensor fusion, real-time control and autonomous navigation on constrained hardware.",
        tools: ["ESP32", "STM32", "ROS", "C++"],
    },
    {
        n: "M-03",
        title: "Full-Stack Engineering",
        body: "Shipping the whole product — typed APIs, real-time data and polished interfaces that make complex systems usable.",
        tools: ["Next.js", "Django", "PostgreSQL", "Redis"],
    },
];

/* Keyword with a hand-drawn orange underline that draws in on scroll. */
function Marked({ children }: { children: ReactNode }) {
    return (
        <span className="relative inline-block whitespace-nowrap">
            {children}
            <svg
                className="marked-line absolute left-0 -bottom-1 w-full h-[6px]"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path
                    d="M2 5 C 60 2.5, 140 7, 198 4"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                />
            </svg>
        </span>
    );
}

export default function About() {
    const ref = useRef<HTMLElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let split: SplitText | null = null;

        const ctx = gsap.context(() => {
            gsap.from(".about-reveal", {
                opacity: 0,
                y: 30,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
            });

            if (!reduced && headlineRef.current) {
                // Masked line reveal — lines slide up from behind their own rule
                split = new SplitText(headlineRef.current, { type: "lines", mask: "lines" });
                gsap.from(split.lines, {
                    yPercent: 110,
                    duration: 0.9,
                    stagger: 0.09,
                    ease: "expo.out",
                    scrollTrigger: { trigger: headlineRef.current, start: "top 78%", once: true },
                });
            }

            // Orange pen underlines draw once the paragraph is in view
            gsap.from(".marked-line path", {
                drawSVG: 0,
                duration: 0.7,
                stagger: 0.3,
                ease: "power2.inOut",
                scrollTrigger: { trigger: ".about-copy", start: "top 70%", once: true },
            });

            gsap.from(".module-row", {
                opacity: 0,
                y: 34,
                duration: 0.7,
                stagger: 0.12,
                ease: "power3.out",
                scrollTrigger: { trigger: ".module-list", start: "top 82%", once: true },
            });
        }, ref);

        return () => {
            ctx.revert();
            split?.revert();
        };
    }, []);

    return (
        <section ref={ref} id="about" className="section">
            <div className="shell">
                <div className="sec-head about-reveal">
                    <span className="sec-no">SEC.01</span>
                    <span className="sec-name">Profile</span>
                    <span className="sec-note hidden sm:block">Subject overview / 3 modules</span>
                </div>

                <h2 ref={headlineRef} className="display section-title max-w-5xl">
                    Final-year BTech engineer aspiring to be a data scientist — with a
                    habit of building things that move.
                </h2>

                <div
                    className="about-copy about-reveal mt-10 max-w-2xl space-y-5 text-lg"
                    style={{ color: "var(--ink-dim)" }}
                >
                    <p>
                        I work across the stack of intelligent systems — from{" "}
                        <Marked>machine learning</Marked> and{" "}
                        <Marked>autonomous rovers</Marked> to full-stack web apps. I like
                        problems where data, hardware and software have to agree with each
                        other.
                    </p>
                    <p>
                        Right now: sharpening the data-science craft while shipping
                        end-to-end projects that are reliable, fast, and a little bit
                        delightful.
                    </p>
                </div>

                <div className="module-list mt-20 bom">
                    {modules.map((m) => (
                        <div key={m.n} className="module-row bom-row" data-cursor={m.n}>
                            <span className="bom-ref">{m.n}</span>
                            <div>
                                <h3 className="bom-cat">{m.title}</h3>
                            </div>
                            <div className="bom-items">
                                <p className="font-sans text-sm leading-relaxed" style={{ color: "var(--ink-dim)" }}>
                                    {m.body}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {m.tools.map((t) => (
                                        <span key={t} className="chip">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
