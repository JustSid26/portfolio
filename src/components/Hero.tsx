"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "@/lib/gsap";
import MagneticButton from "./MagneticButton";
import { APP_READY_EVENT, isAppReady } from "./Preloader";

const CrystalScene = dynamic(() => import("./three/CrystalScene"), { ssr: false });

const roles = [
    "Data Science",
    "Machine Learning",
    "Embedded Systems",
    "Autonomous Robotics",
];

const SCRAMBLE_CHARS = "▮01<>/#+*";

export default function Hero() {
    const sectionRef = useRef<HTMLElement>(null);
    const nameRef = useRef<HTMLHeadingElement>(null);
    const roleRef = useRef<HTMLSpanElement>(null);

    // Entrance (waits for the preloader), role scramble, scroll parallax
    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const ctx = gsap.context(() => {
            const chars = nameRef.current?.querySelectorAll(".name-char");

            const play = () => {
                const tl = gsap.timeline();
                if (chars?.length) {
                    tl.fromTo(
                        chars,
                        { yPercent: 120, opacity: 0, rotateX: -70 },
                        {
                            yPercent: 0,
                            opacity: 1,
                            rotateX: 0,
                            duration: 1,
                            stagger: 0.035,
                            ease: "expo.out",
                        }
                    );
                }
                tl.fromTo(
                    ".hero-stagger",
                    { opacity: 0, y: 26 },
                    { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" },
                    "-=0.55"
                );
                tl.add(startRoles, "-=0.4");
            };

            // Decode one role after another, forever
            const startRoles = () => {
                if (!roleRef.current) return;
                const rolesTl = gsap.timeline({ repeat: -1 });
                roles.forEach((r) => {
                    rolesTl
                        .to(roleRef.current, {
                            duration: 0.9,
                            scrambleText: { text: r, chars: SCRAMBLE_CHARS, speed: 0.5 },
                            ease: "none",
                        })
                        .to({}, { duration: 1.8 });
                });
            };

            if (reduced) {
                // No entrance; just set the first role
                if (roleRef.current) roleRef.current.textContent = roles[0];
            } else {
                // Hide until the preloader hands off
                if (chars?.length) gsap.set(chars, { yPercent: 120, opacity: 0, rotateX: -70 });
                gsap.set(".hero-stagger", { opacity: 0, y: 26 });

                if (isAppReady()) play();
                else window.addEventListener(APP_READY_EVENT, play, { once: true });

                gsap.to(".hero-content", {
                    y: -90,
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

    // "Text pressure": letters near the cursor get heavier and brighter
    useEffect(() => {
        const section = sectionRef.current;
        const nameEl = nameRef.current;
        if (!section || !nameEl) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const chars = Array.from(nameEl.querySelectorAll<HTMLElement>(".name-char"));
        if (!chars.length) return;

        const weights = chars.map(() => ({ current: 700, target: 700 }));
        let centers: { x: number; y: number }[] = [];
        let raf = 0;
        let active = false;

        const measure = () => {
            centers = chars.map((c) => {
                const r = c.getBoundingClientRect();
                return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            });
        };

        const RADIUS = 180;
        const onMove = (e: PointerEvent) => {
            if (!centers.length) measure();
            for (let i = 0; i < chars.length; i++) {
                const dx = e.clientX - centers[i].x;
                const dy = e.clientY - centers[i].y;
                const d = Math.hypot(dx, dy);
                const p = Math.max(0, 1 - d / RADIUS); // 0..1 proximity
                weights[i].target = 700 + p * 200; // wght 700 → 900
            }
            if (!active) {
                active = true;
                raf = requestAnimationFrame(tick);
            }
        };

        const onLeave = () => {
            weights.forEach((w) => (w.target = 700));
        };

        const tick = () => {
            let settled = true;
            for (let i = 0; i < chars.length; i++) {
                const w = weights[i];
                w.current += (w.target - w.current) * 0.16;
                if (Math.abs(w.target - w.current) > 0.5) settled = false;
                chars[i].style.fontVariationSettings = `"wght" ${w.current.toFixed(1)}`;
            }
            if (settled) {
                active = false;
                return;
            }
            raf = requestAnimationFrame(tick);
        };

        // Positions shift on scroll/resize; re-measure lazily
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

    const name = "Siddharth Lama";

    return (
        <section
            ref={sectionRef}
            id="hero"
            className="relative min-h-screen flex items-center overflow-hidden"
        >
            {/* 3D crystal, ambient */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-90">
                <CrystalScene />
            </div>

            <div className="shell relative z-10">
                <div className="hero-content max-w-4xl">
                    <p className="eyebrow hero-stagger mb-6">
                        Mumbai, India · Available 2026
                    </p>

                    <h1
                        ref={nameRef}
                        className="font-bold tracking-tight leading-[0.95]"
                        style={{ fontSize: "clamp(2.8rem, 9vw, 7.5rem)", perspective: 800 }}
                    >
                        {name.split(" ").map((word, wi) => (
                            <span key={wi} className="block overflow-hidden pb-[0.08em]">
                                <span className="hero-name-word">
                                    {word.split("").map((c, i) => (
                                        <span key={i} className="name-char aurora-text">
                                            {c}
                                        </span>
                                    ))}
                                </span>
                            </span>
                        ))}
                    </h1>

                    <p
                        className="hero-stagger mt-8 max-w-2xl text-xl md:text-2xl leading-relaxed"
                        style={{ color: "var(--ink-dim)" }}
                    >
                        I build systems that{" "}
                        <span style={{ color: "var(--ink)" }}>sense, decide &amp; act</span> — from
                        data pipelines and ML models to autonomous rovers.
                    </p>

                    <p
                        className="hero-stagger mt-5 font-mono text-sm h-6 flex items-center"
                        style={{ color: "var(--ink-mute)" }}
                    >
                        <span style={{ color: "var(--ice)" }}>&gt;</span>
                        <span ref={roleRef} className="ml-2" style={{ color: "var(--ink-dim)" }} />
                        <span
                            className="ml-1 inline-block w-[8px] h-4"
                            style={{ background: "var(--ice)", animation: "pulse-glow 1.2s ease-in-out infinite" }}
                        />
                    </p>

                    <div className="hero-stagger mt-10 flex flex-wrap items-center gap-4">
                        <MagneticButton href="#work" className="btn btn-primary">
                            View Selected Work
                            <span aria-hidden="true">→</span>
                        </MagneticButton>
                        <MagneticButton href="#contact" className="btn btn-ghost" strength={0.3}>
                            Get in touch
                        </MagneticButton>
                    </div>
                </div>
            </div>

            {/* Scroll cue */}
            <a
                href="#about"
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
            >
                <span className="label">Scroll</span>
                <span className="block w-[1px] h-8" style={{ background: "linear-gradient(180deg, var(--ice), transparent)" }} />
            </a>
        </section>
    );
}
