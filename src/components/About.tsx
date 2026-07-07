"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap, { SplitText } from "@/lib/gsap";

const modules = [
    {
        n: "M-01",
        title: "Backend & Production Systems",
        body: "Shipping systems that survive real users — job queues, double-entry ledgers, route optimizers, and the deploys, backups and observability that keep them alive.",
        tools: ["Node.js", "FastAPI", "PostgreSQL", "Redis", "Docker"],
    },
    {
        n: "M-02",
        title: "AI & LLM Systems",
        body: "Multi-agent orchestration, structured outputs and AI features that do real work — outreach that writes itself, interviews that adapt, pipelines that classify.",
        tools: ["OpenAI", "Claude", "Gemini", "Groq"],
    },
    {
        n: "M-03",
        title: "Data & Machine Learning",
        body: "Turning messy data into decisions — EDA, feature engineering, model training and evaluation, from CERN open data to production scoring APIs.",
        tools: ["Python", "scikit-learn", "XGBoost", "pandas"],
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
                    Third-year BTech engineer who learns by shipping — production
                    platforms by day, side projects by night.
                </h2>

                <div
                    className="about-copy about-reveal mt-10 max-w-2xl space-y-5 text-lg"
                    style={{ color: "var(--ink-dim)" }}
                >
                    <p>
                        Currently an AI Intern at Dizrupt, where I&apos;ve built and deployed a{" "}
                        <Marked>multi-tenant lead-gen platform</Marked>, a payment-gateway
                        settlement ledger, and a <Marked>vehicle-routing engine</Marked> —
                        all running in production.
                    </p>
                    <p>
                        Before that: a podium at NASA HERC 2025 with Team Mushak&apos;s rover,
                        a top-15 finish at MumbaiHacks, and heading the coding department
                        at SPARC, my university&apos;s tech council.
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
