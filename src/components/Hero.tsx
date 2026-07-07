"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "@/lib/gsap";
import MagneticButton from "./MagneticButton";
import { APP_READY_EVENT, isAppReady } from "./Preloader";

const GyroScene = dynamic(() => import("./three/GyroScene"), { ssr: false });

const roles = [
    "FULL-STACK ENGINEERING",
    "AI & LLM SYSTEMS",
    "MACHINE LEARNING",
    "AUTONOMOUS ROBOTICS",
];

const SCRAMBLE_CHARS = "01<>/#+*";

export default function Hero() {
    const sectionRef = useRef<HTMLElement>(null);
    const nameRef = useRef<HTMLHeadingElement>(null);
    const roleRef = useRef<HTMLSpanElement>(null);

    // Entrance (waits for the preloader), role scramble, scroll exit
    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const ctx = gsap.context(() => {
            const chars = nameRef.current?.querySelectorAll(".name-char");

            const startRoles = () => {
                if (!roleRef.current) return;
                const rolesTl = gsap.timeline({ repeat: -1 });
                roles.forEach((r) => {
                    rolesTl
                        .to(roleRef.current, {
                            duration: 0.8,
                            scrambleText: { text: r, chars: SCRAMBLE_CHARS, speed: 0.5 },
                            ease: "none",
                        })
                        .to({}, { duration: 1.7 });
                });
            };

            const play = () => {
                const tl = gsap.timeline();
                if (chars?.length) {
                    tl.fromTo(
                        chars,
                        { yPercent: 110, opacity: 0 },
                        {
                            yPercent: 0,
                            opacity: 1,
                            duration: 0.85,
                            stagger: 0.03,
                            ease: "expo.out",
                        }
                    );
                }
                tl.fromTo(
                    ".hero-stagger",
                    { opacity: 0, y: 22 },
                    { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out" },
                    "-=0.5"
                );
                tl.fromTo(
                    ".hero-dim",
                    { scaleX: 0 },
                    { scaleX: 1, duration: 0.7, ease: "expo.inOut" },
                    "-=0.7"
                );
                tl.add(startRoles, "-=0.4");
            };

            if (reduced) {
                if (roleRef.current) roleRef.current.textContent = roles[0];
            } else {
                if (chars?.length) gsap.set(chars, { yPercent: 110, opacity: 0 });
                gsap.set(".hero-stagger", { opacity: 0, y: 22 });
                gsap.set(".hero-dim", { scaleX: 0 });

                if (isAppReady()) play();
                else window.addEventListener(APP_READY_EVENT, play, { once: true });

                gsap.to(".hero-content", {
                    y: -70,
                    opacity: 0,
                    ease: "none",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top top",
                        end: "bottom top",
                        scrub: true,
                    },
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // "Type pressure": the condensed letters widen near the cursor
    useEffect(() => {
        const section = sectionRef.current;
        const nameEl = nameRef.current;
        if (!section || !nameEl) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const chars = Array.from(nameEl.querySelectorAll<HTMLElement>(".name-char"));
        if (!chars.length) return;

        const BASE = 72;
        const MAX = 118;
        const widths = chars.map(() => ({ current: BASE, target: BASE }));
        let centers: { x: number; y: number }[] = [];
        let raf = 0;
        let active = false;

        const measure = () => {
            centers = chars.map((c) => {
                const r = c.getBoundingClientRect();
                return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            });
        };

        const RADIUS = 190;
        const onMove = (e: PointerEvent) => {
            if (!centers.length) measure();
            for (let i = 0; i < chars.length; i++) {
                const dx = e.clientX - centers[i].x;
                const dy = e.clientY - centers[i].y;
                const p = Math.max(0, 1 - Math.hypot(dx, dy) / RADIUS);
                widths[i].target = BASE + p * (MAX - BASE);
            }
            if (!active) {
                active = true;
                raf = requestAnimationFrame(tick);
            }
        };

        const onLeave = () => widths.forEach((w) => (w.target = BASE));

        const tick = () => {
            let settled = true;
            for (let i = 0; i < chars.length; i++) {
                const w = widths[i];
                w.current += (w.target - w.current) * 0.16;
                if (Math.abs(w.target - w.current) > 0.4) settled = false;
                chars[i].style.fontVariationSettings = `"wdth" ${w.current.toFixed(1)}`;
            }
            if (settled) {
                active = false;
                return;
            }
            raf = requestAnimationFrame(tick);
        };

        // widths changing shifts glyph positions — re-measure lazily
        const invalidate = () => {
            centers = [];
        };

        section.addEventListener("pointermove", onMove);
        section.addEventListener("pointerleave", onLeave);
        window.addEventListener("resize", invalidate);
        window.addEventListener("scroll", invalidate, { passive: true });

        return () => {
            cancelAnimationFrame(raf);
            section.removeEventListener("pointermove", onMove);
            section.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("resize", invalidate);
            window.removeEventListener("scroll", invalidate);
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            id="hero"
            className="relative min-h-screen flex items-center overflow-hidden"
            style={{ paddingTop: "var(--topbar-h)" }}
        >
            {/* Gyroscope, right side */}
            <div
                className="absolute inset-y-0 right-0 z-0 pointer-events-none w-full md:w-[48%] opacity-40 md:opacity-100"
                aria-hidden="true"
            >
                <GyroScene />
            </div>

            <div className="shell relative z-10 w-full">
                <div className="hero-content">
                    <div className="hero-stagger flex items-baseline justify-between gap-4 mb-8">
                        <p className="label" style={{ color: "var(--accent-ink)" }}>
                            FIG.00 — Identity
                        </p>
                        <p className="label hidden sm:block">
                            Mumbai, IN · 19.0760°N 72.8777°E
                        </p>
                    </div>

                    <h1
                        ref={nameRef}
                        className="display"
                        style={{ fontSize: "clamp(3.4rem, 12.5vw, 11rem)" }}
                    >
                        {["Siddharth", "Lama"].map((word) => (
                            <span key={word} className="block overflow-hidden pb-[0.06em]">
                                <span className="hero-name-word">
                                    {word.split("").map((c, i) => (
                                        <span key={i} className="name-char">
                                            {c}
                                        </span>
                                    ))}
                                </span>
                            </span>
                        ))}
                    </h1>

                    <div className="hero-dim dim-line mt-5 max-w-2xl origin-left">
                        <span className="tick-l" />
                        Systems that sense, decide &amp; act
                        <span className="tick-r" />
                    </div>

                    <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16 max-w-4xl">
                        <div>
                            <p
                                className="hero-stagger text-lg md:text-xl leading-relaxed"
                                style={{ color: "var(--ink-dim)" }}
                            >
                                Engineer shipping production systems end to end — AI-driven
                                platforms, backend infrastructure and ML models, with the
                                occasional rover on the side.
                            </p>

                            <p
                                className="hero-stagger mt-5 font-mono text-[0.78rem] tracking-[0.08em] h-6 flex items-center"
                                style={{ color: "var(--ink-mute)" }}
                            >
                                MODE:
                                <span ref={roleRef} className="ml-2" style={{ color: "var(--accent-ink)" }} />
                                <span className="blink ml-1" style={{ color: "var(--accent)" }}>▮</span>
                            </p>

                            <div className="hero-stagger mt-9 flex flex-wrap items-center gap-4">
                                <MagneticButton href="#work" className="btn btn-primary" strength={0.25}>
                                    View field records →
                                </MagneticButton>
                                <MagneticButton href="#contact" className="btn" strength={0.25}>
                                    Get in touch
                                </MagneticButton>
                            </div>
                        </div>

                        <dl className="hero-stagger spec self-end hidden md:block">
                            <div className="spec-row">
                                <dt>Domain</dt>
                                <dd>AI Systems · Backend · Data / ML</dd>
                            </div>
                            <div className="spec-row">
                                <dt>Education</dt>
                                <dd>BTech CSE (AI &amp; ML) &apos;28 · 9.38 CGPA</dd>
                            </div>
                            <div className="spec-row">
                                <dt>Status</dt>
                                <dd style={{ color: "var(--accent-ink)" }}>AI Intern @ Dizrupt</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {/* Scroll cue */}
            <a
                href="#about"
                className="absolute bottom-6 right-6 md:right-10 z-10 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
                data-cursor="SEC.01 ↓"
            >
                <span className="label">Scroll</span>
                <span className="block w-[1px] h-8" style={{ background: "var(--ink-mute)" }} />
            </a>
        </section>
    );
}
