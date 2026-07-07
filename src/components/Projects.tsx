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

function PipelineSchematic() {
    return (
        <svg viewBox="0 0 400 300" fill="none">
            {/* globe — discovery */}
            <circle className="sch" cx="80" cy="110" r="44" stroke={INK} strokeWidth="1.5" />
            <path className="sch" d="M80 66 C 104 88, 104 132, 80 154" stroke={INK} strokeWidth="1" />
            <path className="sch" d="M80 66 C 56 88, 56 132, 80 154" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="40" y1="110" x2="120" y2="110" stroke={INK} strokeWidth="1" />
            {/* arrow to enrich */}
            <line className="sch" x1="128" y1="110" x2="158" y2="110" stroke={INK} strokeWidth="1.5" />
            <path className="sch" d="M150 103 L 158 110 L 150 117" stroke={INK} strokeWidth="1.5" />
            {/* enrich box */}
            <rect className="sch" x="162" y="88" width="84" height="44" stroke={INK} strokeWidth="1.5" />
            {/* arrow to outreach */}
            <line className="sch" x1="250" y1="110" x2="278" y2="110" stroke={INK} strokeWidth="1.5" />
            <path className="sch" d="M270 103 L 278 110 L 270 117" stroke={INK} strokeWidth="1.5" />
            {/* outreach box — accent */}
            <rect className="sch" x="282" y="88" width="96" height="44" stroke={ACCENT} strokeWidth="1.5" />
            {/* queue cylinder under enrich */}
            <line className="sch" x1="204" y1="132" x2="204" y2="168" stroke={INK} strokeWidth="1" />
            <ellipse className="sch" cx="204" cy="180" rx="34" ry="10" stroke={INK} strokeWidth="1.5" />
            <line className="sch" x1="170" y1="180" x2="170" y2="216" stroke={INK} strokeWidth="1.5" />
            <line className="sch" x1="238" y1="180" x2="238" y2="216" stroke={INK} strokeWidth="1.5" />
            <path className="sch" d="M170 216 A 34 10 0 0 0 238 216" stroke={INK} strokeWidth="1.5" />
            <text className="sch-label" x="36" y="48" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                123 COUNTRIES
            </text>
            <text className="sch-label" x="174" y="114" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                ENRICH
            </text>
            <text className="sch-label" x="292" y="114" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                OUTREACH
            </text>
            <text className="sch-label" x="168" y="246" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                JOB QUEUE
            </text>
        </svg>
    );
}

function RouteSchematic() {
    return (
        <svg viewBox="0 0 400 300" fill="none">
            {/* faint map grid */}
            {[80, 140, 200].map((y) => (
                <line key={y} className="sch" x1="40" y1={y} x2="368" y2={y} stroke={INK} strokeWidth="0.5" strokeDasharray="2 8" />
            ))}
            {[120, 220, 320].map((x) => (
                <line key={x} className="sch" x1={x} y1="44" x2={x} y2="256" stroke={INK} strokeWidth="0.5" strokeDasharray="2 8" />
            ))}
            {/* depot */}
            <rect className="sch" x="58" y="196" width="28" height="28" stroke={ACCENT} strokeWidth="1.5" />
            {/* optimized tour */}
            <path
                className="sch"
                d="M86 200 L140 84 L224 62 L302 112 L330 190 L250 232 L150 164 L86 210"
                stroke={ACCENT}
                strokeWidth="1.8"
            />
            {/* stops */}
            {[
                [140, 84],
                [224, 62],
                [302, 112],
                [330, 190],
                [250, 232],
                [150, 164],
            ].map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} className="sch" cx={cx} cy={cy} r="7" stroke={INK} strokeWidth="1.5" />
            ))}
            <text className="sch-label" x="48" y="246" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                DEPOT
            </text>
            <text className="sch-label" x="292" y="48" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                CVRP
            </text>
        </svg>
    );
}

function AgentsSchematic() {
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
            {/* arrow into orchestrator */}
            <line className="sch" x1="238" y1="128" x2="262" y2="128" stroke={INK} strokeWidth="1.5" />
            <path className="sch" d="M254 121 L 262 128 L 254 135" stroke={INK} strokeWidth="1.5" />
            {/* agent boxes */}
            <rect className="sch" x="270" y="48" width="96" height="40" stroke={INK} strokeWidth="1.5" />
            <rect className="sch" x="270" y="108" width="96" height="40" stroke={ACCENT} strokeWidth="1.5" />
            <rect className="sch" x="270" y="168" width="96" height="40" stroke={INK} strokeWidth="1.5" />
            {/* connectors */}
            <line className="sch" x1="262" y1="128" x2="270" y2="68" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="262" y1="128" x2="270" y2="128" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="262" y1="128" x2="270" y2="188" stroke={INK} strokeWidth="1" />
            <text className="sch-label" x="278" y="72" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                INTERVIEWER
            </text>
            <text className="sch-label" x="282" y="132" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                EVALUATOR
            </text>
            <text className="sch-label" x="294" y="192" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                COACH
            </text>
            <text className="sch-label" x="128" y="90" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                Q&amp;A LOOP
            </text>
        </svg>
    );
}

function AppSchematic() {
    return (
        <svg viewBox="0 0 400 300" fill="none">
            {/* TMDb feed */}
            <rect className="sch" x="42" y="104" width="72" height="32" stroke={INK} strokeWidth="1.5" />
            <line className="sch" x1="114" y1="120" x2="146" y2="120" stroke={INK} strokeWidth="1.5" />
            <path className="sch" d="M138 113 L 146 120 L 138 127" stroke={INK} strokeWidth="1.5" />
            {/* phone */}
            <rect className="sch" x="150" y="40" width="110" height="220" rx="18" stroke={INK} strokeWidth="1.5" />
            <line className="sch" x1="150" y1="70" x2="260" y2="70" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="150" y1="228" x2="260" y2="228" stroke={INK} strokeWidth="1" />
            {/* posters */}
            <rect className="sch" x="162" y="82" width="40" height="58" stroke={INK} strokeWidth="1.5" />
            <rect className="sch" x="210" y="82" width="40" height="58" stroke={INK} strokeWidth="1.5" />
            {/* stats bars */}
            <line className="sch" x1="162" y1="214" x2="250" y2="214" stroke={INK} strokeWidth="1" />
            <rect className="sch" x="166" y="182" width="14" height="32" stroke={INK} strokeWidth="1.5" />
            <rect className="sch" x="188" y="168" width="14" height="46" stroke={INK} strokeWidth="1.5" />
            <rect className="sch" x="210" y="188" width="14" height="26" stroke={INK} strokeWidth="1.5" />
            <rect className="sch" x="232" y="156" width="14" height="58" stroke={ACCENT} strokeWidth="1.5" />
            {/* on-device recs loop */}
            <path className="sch" d="M292 96 A 40 40 0 1 1 292 176" stroke={ACCENT} strokeWidth="1.5" />
            <path className="sch" d="M285 168 L 292 176 L 300 170" stroke={ACCENT} strokeWidth="1.5" />
            <text className="sch-label" x="46" y="96" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                TMDB API
            </text>
            <text className="sch-label" x="290" y="60" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                ON-DEVICE
            </text>
            <text className="sch-label" x="298" y="140" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                RECS
            </text>
        </svg>
    );
}

function ContractSchematic() {
    return (
        <svg viewBox="0 0 400 300" fill="none">
            {/* source document with folded corner */}
            <path className="sch" d="M70 50 H160 L190 80 V210 H70 Z" stroke={INK} strokeWidth="1.5" />
            <path className="sch" d="M160 50 V80 H190" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="84" y1="104" x2="176" y2="104" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="84" y1="124" x2="176" y2="124" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="84" y1="144" x2="176" y2="144" stroke={ACCENT} strokeWidth="1.5" />
            <line className="sch" x1="84" y1="164" x2="176" y2="164" stroke={INK} strokeWidth="1" />
            {/* magnifier over flagged line */}
            <circle className="sch" cx="176" cy="144" r="22" stroke={ACCENT} strokeWidth="1.5" />
            <line className="sch" x1="192" y1="160" x2="214" y2="182" stroke={ACCENT} strokeWidth="1.5" />
            {/* AST tree */}
            <circle className="sch" cx="300" cy="70" r="9" stroke={INK} strokeWidth="1.5" />
            <circle className="sch" cx="266" cy="140" r="9" stroke={INK} strokeWidth="1.5" />
            <circle className="sch" cx="334" cy="140" r="9" stroke={INK} strokeWidth="1.5" />
            <circle className="sch" cx="248" cy="206" r="9" stroke={ACCENT} strokeWidth="1.5" />
            <circle className="sch" cx="290" cy="206" r="9" stroke={INK} strokeWidth="1.5" />
            <line className="sch" x1="296" y1="78" x2="270" y2="131" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="305" y1="78" x2="330" y2="131" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="262" y1="148" x2="250" y2="197" stroke={INK} strokeWidth="1" />
            <line className="sch" x1="272" y1="148" x2="286" y2="197" stroke={INK} strokeWidth="1" />
            <text className="sch-label" x="70" y="40" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                SOLIDITY SRC
            </text>
            <text className="sch-label" x="320" y="44" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                AST
            </text>
            <text className="sch-label" x="224" y="242" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                FLAGGED NODE
            </text>
        </svg>
    );
}

function SignalSchematic() {
    return (
        <svg viewBox="0 0 400 300" fill="none">
            {/* axes */}
            <line className="sch" x1="52" y1="30" x2="52" y2="252" stroke={INK} strokeWidth="1.5" />
            <line className="sch" x1="52" y1="252" x2="368" y2="252" stroke={INK} strokeWidth="1.5" />
            {[70, 115, 160, 205].map((y) => (
                <line key={y} className="sch" x1="46" y1={y} x2="52" y2={y} stroke={INK} strokeWidth="1" />
            ))}
            {/* background events — x marks */}
            {[
                [92, 210], [120, 188], [104, 156], [150, 214], [166, 176], [138, 132], [196, 200], [214, 164],
            ].map(([x, y]) => (
                <g key={`${x}-${y}`}>
                    <line className="sch" x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} stroke={INK} strokeWidth="1.2" />
                    <line className="sch" x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} stroke={INK} strokeWidth="1.2" />
                </g>
            ))}
            {/* signal events — circles */}
            {[
                [232, 96], [262, 120], [284, 76], [306, 108], [330, 62], [344, 96], [300, 52],
            ].map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} className="sch" cx={cx} cy={cy} r="6" stroke={ACCENT} strokeWidth="1.5" />
            ))}
            {/* decision boundary */}
            <path
                className="sch"
                d="M96 60 C 160 96, 210 160, 244 244"
                stroke={ACCENT}
                strokeWidth="1.5"
                strokeDasharray="6 5"
            />
            <text className="sch-label" x="296" y="34" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                SIGNAL
            </text>
            <text className="sch-label" x="86" y="246" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                BACKGROUND
            </text>
            <text className="sch-label" x="60" y="26" fontSize="9" letterSpacing="2" fill={INK} fontFamily="var(--font-mono)">
                28 FEATURES
            </text>
        </svg>
    );
}

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

const projects: Project[] = [
    {
        index: "REC.01",
        title: "Lead Engine",
        year: "2026",
        role: "Dizrupt · AI Intern",
        description:
            "A production, multi-tenant B2B lead-generation and CRM platform for the diamond trade — operating across 123 countries with outreach, invoicing and inventory built in. Source and methods are proprietary.",
        outcomes: [
            "Cut third-party API spend by ~95% through pipeline optimization",
            "SQLite → PostgreSQL + Redis/BullMQ migration with observability",
            "Multilingual AI outreach with back-translation verification",
        ],
        stack: ["Node.js", "Express", "PostgreSQL", "Redis", "BullMQ"],
        figure: <PipelineSchematic />,
        figCaption: "FIG.01 — Discovery & outreach pipeline",
        links: [{ label: "Company", href: "https://www.dizrupt.in/" }],
    },
    {
        index: "REC.02",
        title: "RouteCast",
        year: "2026",
        role: "Full-Stack · Optimization",
        description:
            "A three-service vehicle-routing platform — upload delivery stops and a fleet, get capacity-aware optimized routes on a map, with multi-depot support and priority weighting.",
        outcomes: [
            "Google OR-Tools CVRP solver behind a FastAPI microservice",
            "PostGIS-backed geo storage with travel-time matrices",
            "Usual-vs-optimized route comparison with CSV export",
        ],
        stack: ["Next.js", "TypeScript", "Express", "FastAPI", "OR-Tools", "PostGIS"],
        figure: <RouteSchematic />,
        figCaption: "FIG.02 — Optimized tour over stops",
        links: [{ label: "Source", href: "https://github.com/JustSid26/route-cast" }],
    },
    {
        index: "REC.03",
        title: "Mock Interview AI",
        year: "2026",
        role: "Applied AI · Agents",
        description:
            "A multi-agent interview coach — Interviewer, Evaluator and Coach agents run adaptive interviews through a rule-based orchestrator speaking structured JSON contracts.",
        outcomes: [
            "Adaptive difficulty with probing follow-ups on weak answers",
            "Scoring across 8 dimensions with PDF feedback reports",
            "Behavioral test transcripts: strong, weak & trick candidates",
        ],
        stack: ["Python", "Groq", "Streamlit"],
        figure: <AgentsSchematic />,
        figCaption: "FIG.03 — Agent orchestration loop",
        links: [{ label: "Source", href: "https://github.com/JustSid26/mock-interview-ai" }],
    },
    {
        index: "REC.04",
        title: "Watched",
        year: "2026",
        role: "iOS · SwiftUI",
        description:
            "A native iOS movie & TV tracker — ~6,800 lines of Swift blending Letterboxd-style logging with release tracking, statistics and on-device recommendations.",
        outcomes: [
            "TMDb integration with a transparent offline mock fallback",
            "Actor-based two-tier image cache (NSCache + URLCache)",
            "Release notifications and a Swift Charts stats dashboard",
        ],
        stack: ["Swift", "SwiftUI", "SwiftData", "MVVM"],
        figure: <AppSchematic />,
        figCaption: "FIG.04 — App data flow & stats",
        links: [{ label: "Source", href: "https://github.com/JustSid26/watched" }],
    },
    {
        index: "REC.05",
        title: "Contract Validator",
        year: "2026",
        role: "Systems · Rust",
        description:
            "A multi-chain smart-contract analysis tool — parses Solidity ASTs to flag vulnerability patterns and validates CosmWasm and Solana eBPF bytecode.",
        outcomes: [
            "Solidity AST checks — tx.origin auth and friends",
            "CosmWasm & Solana eBPF bytecode validation",
            "Rust backend on axum/tokio with a Next.js frontend",
        ],
        stack: ["Rust", "axum", "tokio", "Next.js"],
        figure: <ContractSchematic />,
        figCaption: "FIG.05 — Source scan & AST walk",
        links: [{ label: "Source", href: "https://github.com/JustSid26/SmartContract" }],
    },
    {
        index: "REC.06",
        title: "Higgs Detection",
        year: "2026",
        role: "Machine Learning",
        description:
            "Classifying Higgs-signal events against background noise on CERN ATLAS open data — 28 kinematic features, three model families, served as a web app.",
        outcomes: [
            "LogReg / SVM / gradient boosting compared by ROC AUC",
            "Flask JSON API with batch CSV scoring",
            "Physics-annotated UI for single-event classification",
        ],
        stack: ["Python", "scikit-learn", "XGBoost", "Flask"],
        figure: <SignalSchematic />,
        figCaption: "FIG.06 — Signal vs background split",
        links: [{ label: "Source", href: "https://github.com/JustSid26/HiggsBosonDetectionML" }],
    },
    {
        index: "REC.07",
        title: "Mantis Rover",
        year: "2025",
        role: "Robotics · NASA HERC",
        description:
            "Team Mushak's rover for the NASA Human Exploration Rover Challenge 2025 — rebuilt the electronics, PCB and control code. 3rd place, RC Division.",
        outcomes: [
            "Custom PCB with ESP32 wireless controller comms",
            "Motor-driver control with encoded path visualization",
            "Podium finish against international teams",
        ],
        stack: ["ESP32", "Arduino", "C++", "Python"],
        figure: <RoverSchematic />,
        figCaption: "FIG.07 — Chassis & sensor layout",
        links: [{ label: "Source", href: "https://github.com/JustSid26/mushak" }],
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
                    <span className="rec-no">REC.08+</span>
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
