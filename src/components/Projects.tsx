"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import TiltCard from "./TiltCard";
import MagneticButton from "./MagneticButton";

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
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(120% 90% at 25% 15%, color-mix(in srgb, ${accent} 22%, transparent), transparent 55%),
                                 radial-gradient(120% 100% at 85% 90%, color-mix(in srgb, var(--violet) 16%, transparent), transparent 55%),
                                 linear-gradient(160deg, #0e1219, #090b10)`,
                }}
            />
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
            <div
                className="absolute -top-10 -right-10 w-52 h-52 rounded-full blur-3xl opacity-40"
                style={{ background: accent }}
            />
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
            <div
                className="absolute top-6 right-6 w-12 h-12 rounded-full border"
                style={{ borderColor: accent, boxShadow: `0 0 24px ${accent}` }}
            />
        </div>
    );
}

function Panel({ p }: { p: Project }) {
    return (
        <article className="work-panel">
            <div className="card h-full p-6 md:p-9 grid items-center gap-8 md:gap-12 md:grid-cols-[1.05fr_1fr]">
                <TiltCard className="p-2" max={6}>
                    <Cover accent={p.accent} index={p.index} />
                </TiltCard>

                <div>
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

                    <p className="mt-4 text-base md:text-lg leading-relaxed" style={{ color: "var(--ink-dim)" }}>
                        {p.description}
                    </p>

                    <ul className="mt-5 space-y-2">
                        {p.outcomes.map((o) => (
                            <li key={o} className="flex gap-3 text-sm" style={{ color: "var(--ink-dim)" }}>
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
            </div>
        </article>
    );
}

/* Final panel: a quiet CTA to the full archive. */
function EndPanel() {
    return (
        <article className="work-panel" style={{ width: "min(520px, 78vw)" }}>
            <div className="card h-full flex flex-col items-start justify-center gap-6 p-10">
                <p className="label">More where that came from</p>
                <h3 className="text-3xl font-bold gradient-heading">
                    Experiments, coursework &amp; everything in between.
                </h3>
                <MagneticButton
                    href="https://github.com/JustSid26"
                    className="btn btn-ghost"
                    strength={0.3}
                >
                    Browse GitHub
                    <span aria-hidden="true">↗</span>
                </MagneticButton>
            </div>
        </article>
    );
}

const PANEL_COUNT = projects.length + 1;

export default function Projects() {
    const ref = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const counterRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const section = ref.current;
        const track = trackRef.current;
        if (!section || !track) return;

        const mm = gsap.matchMedia();

        // Desktop: pin the section and scrub the track horizontally
        mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
            const getDistance = () => track.scrollWidth - track.parentElement!.clientWidth;

            gsap.to(track, {
                x: () => -getDistance(),
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: () => `+=${getDistance()}`,
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        if (progressRef.current)
                            progressRef.current.style.transform = `scaleX(${self.progress})`;
                        if (counterRef.current) {
                            const i = Math.min(
                                PANEL_COUNT,
                                Math.floor(self.progress * PANEL_COUNT) + 1
                            );
                            counterRef.current.textContent = String(i).padStart(2, "0");
                        }
                    },
                },
            });

            gsap.from(".work-head", {
                opacity: 0,
                y: 36,
                duration: 0.9,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: { trigger: section, start: "top 75%", once: true },
            });
        });

        // Mobile / reduced motion: vertical stack with simple reveals
        mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
            gsap.from(".work-panel", {
                opacity: 0,
                y: 50,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: { trigger: track, start: "top 85%", once: true },
            });
        });

        return () => mm.revert();
    }, []);

    return (
        <section ref={ref} id="work" className="section md:min-h-screen md:flex md:flex-col md:justify-center">
            <div className="shell w-full">
                <div className="flex items-end justify-between flex-wrap gap-4">
                    <div>
                        <p className="eyebrow work-head">02 — Selected Work</p>
                        <h2 className="work-head section-title">Things I&apos;ve built</h2>
                    </div>
                    <p className="work-head label max-w-xs text-right hidden md:block">
                        Scroll — the gallery moves sideways.
                    </p>
                </div>
            </div>

            <div className="work-stage mt-12 md:mt-16">
                <div ref={trackRef} className="work-track">
                    {projects.map((p) => (
                        <Panel key={p.index} p={p} />
                    ))}
                    <EndPanel />
                </div>
            </div>

            <div className="shell w-full hidden md:block">
                <div className="mt-12 flex items-center gap-6">
                    <div className="work-progress flex-1">
                        <div ref={progressRef} className="work-progress__bar" />
                    </div>
                    <p className="label" style={{ color: "var(--ink-dim)" }}>
                        <span ref={counterRef}>01</span>
                        <span style={{ color: "var(--ink-faint)" }}> / {String(PANEL_COUNT).padStart(2, "0")}</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
