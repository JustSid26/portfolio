"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "./MagneticButton";

gsap.registerPlugin(ScrollTrigger);

const CrystalScene = dynamic(() => import("./three/CrystalScene"), { ssr: false });

const roles = [
    "Data Science",
    "Machine Learning",
    "Embedded Systems",
    "Autonomous Robotics",
];

export default function Hero() {
    const sectionRef = useRef<HTMLElement>(null);
    const nameRef = useRef<HTMLHeadingElement>(null);

    const [text, setText] = useState("");
    const [roleIndex, setRoleIndex] = useState(0);
    const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

    // Typewriter
    useEffect(() => {
        const current = roles[roleIndex];
        let t: NodeJS.Timeout;
        if (phase === "typing") {
            if (text.length < current.length)
                t = setTimeout(() => setText(current.slice(0, text.length + 1)), 65);
            else t = setTimeout(() => setPhase("pausing"), 1400);
        } else if (phase === "pausing") {
            t = setTimeout(() => setPhase("deleting"), 300);
        } else {
            if (text.length > 0)
                t = setTimeout(() => setText(current.slice(0, text.length - 1)), 35);
            else
                t = setTimeout(() => {
                    setRoleIndex((p) => (p + 1) % roles.length);
                    setPhase("typing");
                }, 120);
        }
        return () => clearTimeout(t);
    }, [text, phase, roleIndex]);

    // Entrance + scroll parallax
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 2.5 }); // after preloader
            const chars = nameRef.current?.querySelectorAll(".name-char");
            if (chars) {
                tl.from(chars, {
                    yPercent: 120,
                    opacity: 0,
                    rotateX: -80,
                    duration: 1,
                    stagger: 0.04,
                    ease: "expo.out",
                });
            }
            tl.from(
                ".hero-stagger",
                { opacity: 0, y: 26, duration: 0.8, stagger: 0.12, ease: "power3.out" },
                "-=0.6"
            );

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
        }, sectionRef);
        return () => ctx.revert();
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
                            <span key={wi} className="block overflow-hidden">
                                <span className="inline-block">
                                    {word.split("").map((c, i) => (
                                        <span key={i} className="name-char inline-block aurora-text">
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

                    <p className="hero-stagger mt-5 font-mono text-sm h-6 flex items-center" style={{ color: "var(--ink-mute)" }}>
                        <span style={{ color: "var(--ice)" }}>&gt;</span>
                        <span className="ml-2" style={{ color: "var(--ink-dim)" }}>{text}</span>
                        <span
                            className="ml-0.5 inline-block w-[8px] h-4"
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
