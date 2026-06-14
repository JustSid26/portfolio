"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TiltCard from "./TiltCard";

gsap.registerPlugin(ScrollTrigger);

type Project = {
    index: string;
    title: string;
    year: string;
    role: string;
    description: string;
    outcomes: string[];
    stack: string[];
    accent: string;
    links: { label: string; href: string }[];
};

const projects: Project[] = [
    {
        index: "01",
        title: "Mantis Rover",
        year: "2025",
        role: "Autonomous Systems · Embedded",
        description:
            "An autonomous rover for competitive robotics — real-time obstacle avoidance, GPS waypoint navigation, and a live telemetry stream to a ground station.",
        outcomes: [
            "Sensor-fusion pipeline for stable navigation on rough terrain",
            "Sub-second telemetry over a custom radio link",
            "Modular firmware that survives field debugging",
        ],
        stack: ["ESP32", "Arduino", "Python", "ROS"],
        accent: "var(--ice)",
        links: [{ label: "Source", href: "https://github.com/JustSid26" }],
    },
    {
        index: "02",
        title: "AI Finance Advisor",
        year: "2025",
        role: "Full-Stack · Machine Learning",
        description:
            "A financial advisor that reads spending patterns, forecasts trends, and gives personalized savings recommendations — wrapped in a clean, typed web app.",
        outcomes: [
            "Forecasting models surfaced as plain-language advice",
            "End-to-end typed stack from model to UI",
            "Interactive dashboards for spend breakdowns",
        ],
        stack: ["Next.js", "Python", "TensorFlow", "PostgreSQL"],
        accent: "var(--violet)",
        links: [{ label: "Source", href: "https://github.com/JustSid26" }],
    },
    {
        index: "03",
        title: "Voice Agent",
        year: "2024",
        role: "Applied ML · Backend",
        description:
            "A conversational voice agent that understands natural speech and automates real-world tasks by orchestrating multiple APIs behind the scenes.",
        outcomes: [
            "Speech-to-intent pipeline with low latency",
            "Pluggable tool/API orchestration layer",
            "Containerized for one-command deploys",
        ],
        stack: ["Flask", "Whisper", "LLMs", "Docker"],
        accent: "var(--blue)",
        links: [{ label: "Source", href: "https://github.com/JustSid26" }],
    },
];

/* Generative abstract cover — layered gradients, grid, and the index. */
function Cover({ accent, index }: { accent: string; index: string }) {
    return (
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[18px]">
            {/* base */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(120% 90% at 25% 15%, color-mix(in srgb, ${accent} 22%, transparent), transparent 55%),
                                 radial-gradient(120% 100% at 85% 90%, color-mix(in srgb, var(--violet) 16%, transparent), transparent 55%),
                                 linear-gradient(160deg, #0e1219, #090b10)`,
                }}
            />
            {/* grid */}
            <div
                className="absolute inset-0 opacity-[0.35]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                    maskImage: "radial-gradient(110% 110% at 50% 40%, #000 40%, transparent 85%)",
                    WebkitMaskImage: "radial-gradient(110% 110% at 50% 40%, #000 40%, transparent 85%)",
                }}
            />
            {/* glow orb */}
            <div
                className="absolute -top-10 -right-10 w-52 h-52 rounded-full blur-3xl opacity-40"
                style={{ background: accent }}
            />
            {/* big index */}
            <span
                className="absolute bottom-3 left-6 font-bold leading-none select-none"
                style={{
                    fontSize: "9rem",
                    color: "transparent",
                    WebkitTextStroke: "1px rgba(255,255,255,0.10)",
                }}
                aria-hidden="true"
            >
                {index}
            </span>
            {/* accent ring */}
            <div
                className="absolute top-6 right-6 w-12 h-12 rounded-full border"
                style={{ borderColor: accent, boxShadow: `0 0 24px ${accent}` }}
            />
        </div>
    );
}

export default function Projects() {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".work-head", {
                opacity: 0,
                y: 40,
                duration: 0.9,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
            });

            gsap.utils.toArray<HTMLElement>(".project-row").forEach((row) => {
                const cover = row.querySelector(".project-cover");
                const content = row.querySelector(".project-content");
                gsap.from([cover, content], {
                    opacity: 0,
                    y: 60,
                    duration: 0.9,
                    stagger: 0.12,
                    ease: "power3.out",
                    scrollTrigger: { trigger: row, start: "top 78%", once: true },
                });
                // subtle parallax on the cover
                gsap.to(cover, {
                    yPercent: -8,
                    ease: "none",
                    scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true },
                });
            });
        }, ref);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={ref} id="work" className="section">
            <div className="shell">
                <div className="flex items-end justify-between flex-wrap gap-4">
                    <div>
                        <p className="eyebrow work-head">02 — Selected Work</p>
                        <h2 className="work-head section-title">Things I&apos;ve built</h2>
                    </div>
                    <p className="work-head label max-w-xs text-right hidden md:block">
                        A few projects that span data, hardware &amp; the web.
                    </p>
                </div>

                <div className="mt-20 space-y-24 md:space-y-32">
                    {projects.map((p, i) => (
                        <article
                            key={p.index}
                            className="project-row grid items-center gap-10 md:gap-16 md:grid-cols-2"
                        >
                            <div className={`project-cover ${i % 2 === 1 ? "md:order-2" : ""}`}>
                                <TiltCard className="p-2" max={7}>
                                    <Cover accent={p.accent} index={p.index} />
                                </TiltCard>
                            </div>

                            <div className="project-content">
                                <div className="flex items-center gap-3">
                                    <span
                                        className="h-[2px] w-10 rounded-full"
                                        style={{ background: p.accent, boxShadow: `0 0 12px ${p.accent}` }}
                                    />
                                    <span className="label">
                                        {p.role} · {p.year}
                                    </span>
                                </div>

                                <h3 className="mt-4 text-3xl md:text-4xl font-bold gradient-heading">
                                    {p.title}
                                </h3>

                                <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--ink-dim)" }}>
                                    {p.description}
                                </p>

                                <ul className="mt-5 space-y-2">
                                    {p.outcomes.map((o) => (
                                        <li
                                            key={o}
                                            className="flex gap-3 text-sm"
                                            style={{ color: "var(--ink-dim)" }}
                                        >
                                            <span style={{ color: p.accent }}>▹</span>
                                            {o}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    {p.stack.map((s) => (
                                        <span key={s} className="chip">{s}</span>
                                    ))}
                                </div>

                                <div className="mt-7 flex gap-5">
                                    {p.links.map((l) => (
                                        <a
                                            key={l.label}
                                            href={l.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="link-underline inline-flex items-center gap-1.5 text-sm font-medium"
                                        >
                                            {l.label}
                                            <span aria-hidden="true">↗</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
