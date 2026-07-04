"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import MagneticButton from "./MagneticButton";

type Project = {
    index: string;
    title: string;
    year: string;
    role: string;
    description: string;
    outcomes: string[];
    stack: string[];
    figure: ReactNode;
    figCaption: string;
    links: { label: string; href: string }[];
};

/* ── Schematic figures — stroke-only so DrawSVG can trace them in ── */

const INK = "var(--ink-dim)";
const ACCENT = "var(--accent)";

function RoverSchematic() {
    return (
        <svg viewBox="0 0 400 300" fill="none">
            {/* ground */}
            <line className="sch" x1="20" y1="262" x2="380" y2="262" stroke={INK} strokeWidth="1.5" />
            {/* chassis */}
            <rect className="sch" x="95" y="168" width="215" height="42" stroke={INK} strokeWidth="1.5" />
            <line className="sch" x1="95" y1="189" x2="310" y2="189" stroke={INK} strokeWidth="1" />
            {/* wheels */}
            {[132, 202, 272].map((cx) => (
                <g key={cx}>
                    <circle className="sch" cx={cx} cy="232" r="27" stroke={INK} strokeWidth="1.5" />
                    <circle className="sch" cx={cx} cy="232" r="9" stroke={INK} strokeWidth="1" />
                    <line className="sch" x1={cx - 19} y1="213" x2={cx + 19} y2="251" stroke={INK} strokeWidth="1" />
                    <line className="sch" x1={cx + 19} y1="213" x2={cx - 19} y2="251" stroke={INK} strokeWidth="1" />
                </g>
            ))}
            {/* mast + camera */}
            <line className="sch" x1="150" y1="168" x2="150" y2="98" stroke={INK} strokeWidth="1.5" />
            <rect className="sch" x="132" y="70" width="52" height="30" stroke={INK} strokeWidth="1.5" />
            <circle className="sch" cx="176" cy="85" r="6" stroke={ACCENT} strokeWidth="1.5" />
            {/* sensor cone */}
            <line className="sch" x1="184" y1="85" x2="330" y2="52" stroke={ACCENT} strokeWidth="1" strokeDasharray="5 5" />
            <line className="sch" x1="184" y1="85" x2="330" y2="126" stroke={ACCENT} strokeWidth="1" strokeDasharray="5 5" />
            <path className="sch" d="M330 52 A 84 84 0 0 1 330 126" stroke={ACCENT} strokeWidth="1" strokeDasharray="5 5" />
            {/* antenna */}
            <line className="sch" x1="290" y1="168" x2="290" y2="96" stroke={INK} strokeWidth="1.5" />
            <path className="sch" d="M278 96 A 14 14 0 0 1 302 96" stroke={INK} strokeWidth="1" />
            <path className="sch" d="M270 88 A 24 24 0 0 1 310 88" stroke={INK} strokeWidth="1" />
            {/* dimension line (kept clear of the figure caption) */}
            <line className="sch" x1="332" y1="168" x2="332" y2="210" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="326" y1="168" x2="338" y2="168" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="326" y1="210" x2="338" y2="210" stroke={INK} strokeWidth="1" />
            <text className="sch-label" x="344" y="192" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                H
            </text>
            <text className="sch-label" x="132" y="62" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                VISION
            </text>
        </svg>
    );
}

function FinanceSchematic() {
    return (
        <svg viewBox="0 0 400 300" fill="none">
            {/* axes */}
            <line className="sch" x1="52" y1="30" x2="52" y2="252" stroke={INK} strokeWidth="1.5" />
            <line className="sch" x1="52" y1="252" x2="368" y2="252" stroke={INK} strokeWidth="1.5" />
            {/* y ticks */}
            {[70, 115, 160, 205].map((y) => (
                <line key={y} className="sch" x1="46" y1={y} x2="52" y2={y} stroke={INK} strokeWidth="1" />
            ))}
            {/* candles */}
            {[
                { x: 84, top: 150, bot: 215, wt: 135, wb: 228 },
                { x: 124, top: 165, bot: 205, wt: 150, wb: 218 },
                { x: 164, top: 130, bot: 185, wt: 118, wb: 198 },
                { x: 204, top: 145, bot: 190, wt: 132, wb: 202 },
                { x: 244, top: 105, bot: 160, wt: 92, wb: 172 },
            ].map((c) => (
                <g key={c.x}>
                    <line className="sch" x1={c.x + 8} y1={c.wt} x2={c.x + 8} y2={c.wb} stroke={INK} strokeWidth="1" />
                    <rect className="sch" x={c.x} y={c.top} width="16" height={c.bot - c.top} stroke={INK} strokeWidth="1.5" />
                </g>
            ))}
            {/* forecast line */}
            <path
                className="sch"
                d="M60 210 C 110 195, 150 175, 200 160 S 300 105, 356 68"
                stroke={ACCENT}
                strokeWidth="2"
            />
            <path className="sch" d="M344 64 L 356 68 L 349 79" stroke={ACCENT} strokeWidth="2" />
            {/* confidence band */}
            <path
                className="sch"
                d="M262 118 C 300 96, 330 76, 356 52"
                stroke={ACCENT}
                strokeWidth="1"
                strokeDasharray="4 5"
            />
            <path
                className="sch"
                d="M262 138 C 300 122, 332 104, 356 88"
                stroke={ACCENT}
                strokeWidth="1"
                strokeDasharray="4 5"
            />
            <text className="sch-label" x="284" y="44" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                FORECAST
            </text>
            <text className="sch-label" x="60" y="26" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                SPEND / T
            </text>
        </svg>
    );
}

function VoiceSchematic() {
    return (
        <svg viewBox="0 0 400 300" fill="none">
            {/* mic */}
            <rect className="sch" x="58" y="72" width="44" height="78" rx="22" stroke={INK} strokeWidth="1.5" />
            <path className="sch" d="M44 128 A 36 36 0 0 0 116 128" stroke={INK} strokeWidth="1.5" />
            <line className="sch" x1="80" y1="164" x2="80" y2="186" stroke={INK} strokeWidth="1.5" />
            <line className="sch" x1="58" y1="186" x2="102" y2="186" stroke={INK} strokeWidth="1.5" />
            {/* waveform */}
            <path
                className="sch"
                d="M128 128 L138 128 L146 100 L156 156 L166 88 L176 168 L186 108 L196 148 L206 118 L216 138 L226 128 L238 128"
                stroke={ACCENT}
                strokeWidth="1.8"
            />
            {/* arrow into pipeline */}
            <line className="sch" x1="238" y1="128" x2="262" y2="128" stroke={INK} strokeWidth="1.5" />
            <path className="sch" d="M254 121 L 262 128 L 254 135" stroke={INK} strokeWidth="1.5" />
            {/* orchestration boxes */}
            <rect className="sch" x="270" y="48" width="96" height="40" stroke={INK} strokeWidth="1.5" />
            <rect className="sch" x="270" y="108" width="96" height="40" stroke={ACCENT} strokeWidth="1.5" />
            <rect className="sch" x="270" y="168" width="96" height="40" stroke={INK} strokeWidth="1.5" />
            {/* connectors */}
            <line className="sch" x1="262" y1="128" x2="270" y2="68" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="262" y1="128" x2="270" y2="128" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="262" y1="128" x2="270" y2="188" stroke={INK} strokeWidth="1" />
            <text className="sch-label" x="282" y="72" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                INTENT
            </text>
            <text className="sch-label" x="282" y="132" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                TOOLS/API
            </text>
            <text className="sch-label" x="282" y="192" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                SPEECH OUT
            </text>
            <text className="sch-label" x="128" y="90" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                48 KHZ
            </text>
        </svg>
    );
}

const projects: Project[] = [
    {
        index: "REC.01",
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
        figure: <RoverSchematic />,
        figCaption: "FIG.01 — Chassis & sensor layout",
        links: [{ label: "Source", href: "https://github.com/JustSid26" }],
    },
    {
        index: "REC.02",
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
        figure: <FinanceSchematic />,
        figCaption: "FIG.02 — Spend series & forecast",
        links: [{ label: "Source", href: "https://github.com/JustSid26" }],
    },
    {
        index: "REC.03",
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
        figure: <VoiceSchematic />,
        figCaption: "FIG.03 — Signal path & orchestration",
        links: [{ label: "Source", href: "https://github.com/JustSid26" }],
    },
];

function Panel({ p }: { p: Project }) {
    return (
        <article className="work-panel">
            <div className="record">
                <div className="record__head">
                    <span className="rec-no">{p.index}</span>
                    <span>{p.title}</span>
                    <span className="ml-auto">{p.role} · {p.year}</span>
                </div>

                <div className="grid items-center gap-7 md:gap-10 md:grid-cols-[1.05fr_1fr] p-5 md:p-8 flex-1">
                    <div className="figure">
                        {p.figure}
                        <span className="figure__caption">{p.figCaption}</span>
                        <span className="figure__reg border-l border-t" style={{ top: 6, left: 6 }} />
                        <span className="figure__reg border-r border-t" style={{ top: 6, right: 6 }} />
                        <span className="figure__reg border-l border-b" style={{ bottom: 6, left: 6 }} />
                        <span className="figure__reg border-r border-b" style={{ bottom: 6, right: 6 }} />
                    </div>

                    <div>
                        <h3
                            className="display"
                            style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.9rem)" }}
                        >
                            {p.title}
                        </h3>

                        <p className="mt-4 text-[0.98rem] md:text-base leading-relaxed" style={{ color: "var(--ink-dim)" }}>
                            {p.description}
                        </p>

                        <ul className="mt-5 space-y-2">
                            {p.outcomes.map((o) => (
                                <li key={o} className="flex gap-3 text-sm" style={{ color: "var(--ink-dim)" }}>
                                    <span className="font-mono" style={{ color: "var(--accent)" }}>+</span>
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
                                    className="link-underline inline-flex items-center gap-1.5 font-mono text-[0.74rem] tracking-[0.1em] uppercase font-medium"
                                    data-cursor="OPEN ↗"
                                >
                                    {l.label} ↗
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

function EndPanel() {
    return (
        <article className="work-panel" style={{ width: "min(480px, 80vw)" }}>
            <div className="record">
                <div className="record__head">
                    <span className="rec-no">REC.04+</span>
                    <span>Archive</span>
                </div>
                <div className="flex flex-col items-start justify-center gap-6 p-8 md:p-10 flex-1">
                    <p className="label">More where that came from</p>
                    <h3 className="display" style={{ fontSize: "clamp(1.7rem, 2.8vw, 2.4rem)" }}>
                        Experiments, coursework &amp; everything in between
                    </h3>
                    <MagneticButton
                        href="https://github.com/JustSid26"
                        className="btn"
                        strength={0.25}
                    >
                        Browse GitHub ↗
                    </MagneticButton>
                </div>
            </div>
        </article>
    );
}

const PANEL_COUNT = projects.length + 1;

export default function Projects() {
    const ref = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const needleRef = useRef<HTMLDivElement>(null);
    const posRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const section = ref.current;
        const track = trackRef.current;
        if (!section || !track) return;

        const mm = gsap.matchMedia();

        // Desktop: pin and scrub sideways; schematics draw as their panel arrives
        mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
            const getDistance = () => track.scrollWidth - track.parentElement!.clientWidth;

            const horiz = gsap.to(track, {
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
                        if (needleRef.current)
                            needleRef.current.style.left = `${self.progress * 100}%`;
                        if (posRef.current)
                            posRef.current.textContent = String(
                                Math.round(self.progress * 100)
                            ).padStart(3, "0");
                    },
                },
            });

            track.querySelectorAll(".figure").forEach((fig) => {
                const strokes = fig.querySelectorAll(".sch");
                const labels = fig.querySelectorAll(".sch-label");
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: fig,
                        containerAnimation: horiz,
                        start: "left 78%",
                        once: true,
                    },
                });
                tl.from(strokes, {
                    drawSVG: 0,
                    duration: 1.1,
                    stagger: 0.028,
                    ease: "power1.inOut",
                }).from(labels, { opacity: 0, duration: 0.4, stagger: 0.08 }, "-=0.3");
            });

            gsap.from(".work-head", {
                opacity: 0,
                y: 30,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: { trigger: section, start: "top 75%", once: true },
            });
        });

        // Mobile / reduced motion: vertical stack, draw on normal scroll
        mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            gsap.from(".work-panel", {
                opacity: 0,
                y: 40,
                duration: 0.7,
                stagger: 0.08,
                ease: "power3.out",
                scrollTrigger: { trigger: track, start: "top 85%", once: true },
            });

            if (!reduced) {
                track.querySelectorAll(".figure").forEach((fig) => {
                    gsap.from(fig.querySelectorAll(".sch"), {
                        drawSVG: 0,
                        duration: 1.1,
                        stagger: 0.025,
                        ease: "power1.inOut",
                        scrollTrigger: { trigger: fig, start: "top 85%", once: true },
                    });
                });
            }
        });

        return () => mm.revert();
    }, []);

    return (
        <section
            ref={ref}
            id="work"
            className="section md:min-h-screen md:flex md:flex-col md:justify-center"
        >
            <div className="shell w-full">
                <div className="sec-head work-head">
                    <span className="sec-no">SEC.02</span>
                    <span className="sec-name">Field Records</span>
                    <span className="sec-note hidden sm:block">
                        {PANEL_COUNT} entries — scroll moves the reel
                    </span>
                </div>
                <h2 className="work-head display section-title">Things I&apos;ve built</h2>
            </div>

            <div className="work-stage mt-10 md:mt-14">
                <div ref={trackRef} className="work-track">
                    {projects.map((p) => (
                        <Panel key={p.index} p={p} />
                    ))}
                    <EndPanel />
                </div>
            </div>

            <div className="shell w-full hidden md:block">
                <div className="mt-12 flex items-end gap-6">
                    <div className="work-ruler flex-1 relative">
                        <div ref={needleRef} className="work-needle" />
                    </div>
                    <p className="label tabular-nums" style={{ color: "var(--ink-dim)" }}>
                        POS <span ref={posRef} style={{ color: "var(--accent-ink)" }}>000</span>
                        <span style={{ color: "var(--ink-faint)" }}> / 100</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
