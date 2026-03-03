"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const roles: string[] = [
    "Data Analyst",
    "Machine Learning Engineer",
    "Embedded Systems Engineer",
    "Autonomous Systems Developer",
];

export default function Hero() {
    const sectionRef = useRef<HTMLElement>(null);
    const nameRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement>(null);

    const [text, setText] = useState("");
    const [roleIndex, setRoleIndex] = useState<number>(0);
    const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

    // Typewriter effect
    useEffect(() => {
        const current = roles[roleIndex];
        let timeout: NodeJS.Timeout;

        if (phase === "typing") {
            if (text.length < current.length) {
                timeout = setTimeout(() => {
                    setText(current.slice(0, text.length + 1));
                }, 70);
            } else {
                timeout = setTimeout(() => setPhase("pausing"), 1200);
            }
        }

        if (phase === "pausing") {
            timeout = setTimeout(() => setPhase("deleting"), 300);
        }

        if (phase === "deleting") {
            if (text.length > 0) {
                timeout = setTimeout(() => {
                    setText(current.slice(0, text.length - 1));
                }, 40);
            } else {
                timeout = setTimeout(() => {
                    setRoleIndex((prev) => (prev + 1) % roles.length);
                    setPhase("typing");
                }, 100);
            }
        }

        return () => clearTimeout(timeout);
    }, [text, phase, roleIndex]);

    // GSAP Entrance Timeline + Particles
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 0.4 });

            // Animate each character of the name
            const nameChars = nameRef.current?.querySelectorAll(".name-char");
            if (nameChars) {
                tl.from(nameChars, {
                    opacity: 0,
                    y: 80,
                    rotationX: -90,
                    duration: 0.8,
                    stagger: 0.04,
                    ease: "back.out(1.7)",
                });
            }

            // Subtitle line
            tl.from(
                subtitleRef.current,
                {
                    opacity: 0,
                    y: 30,
                    duration: 0.8,
                    ease: "power3.out",
                },
                "-=0.3"
            );

            // Scroll CTA
            tl.from(
                ctaRef.current,
                {
                    opacity: 0,
                    y: 20,
                    duration: 0.6,
                    ease: "power2.out",
                },
                "-=0.2"
            );

            // Bobbing scroll CTA
            gsap.to(ctaRef.current, {
                y: -8,
                duration: 1.5,
                ease: "power1.inOut",
                yoyo: true,
                repeat: -1,
            });

            // Floating particles
            const particles = particlesRef.current?.querySelectorAll(".particle");
            if (particles) {
                particles.forEach((p) => {
                    gsap.set(p, {
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                    });

                    gsap.to(p, {
                        y: `+=${Math.random() * 100 - 50}`,
                        x: `+=${Math.random() * 60 - 30}`,
                        opacity: Math.random() * 0.6 + 0.1,
                        duration: Math.random() * 4 + 3,
                        ease: "sine.inOut",
                        yoyo: true,
                        repeat: -1,
                    });
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const nameText = "Siddharth Lama";

    return (
        <section
            ref={sectionRef}
            id="hero"
            className="relative h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden"
        >
            {/* Floating particles */}
            <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="particle" />
                ))}
            </div>

            {/* Radial glow behind text */}
            <div
                className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
                style={{
                    background: "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
                    filter: "blur(40px)",
                }}
            />

            <h1
                ref={nameRef}
                className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight"
                style={{ perspective: 600 }}
            >
                {nameText.split("").map((char, i) => (
                    <span
                        key={i}
                        className="name-char inline-block gradient-heading"
                        style={{
                            whiteSpace: char === " " ? "pre" : "normal",
                        }}
                    >
                        {char}
                    </span>
                ))}
            </h1>

            <p
                ref={subtitleRef}
                className="text-lg md:text-xl font-light mb-10 h-8 flex items-center justify-center"
                style={{ color: "var(--text-secondary)" }}
            >
                <span className="gradient-content">{text}</span>
                <span
                    className="ml-1 inline-block w-[2px] h-6"
                    style={{
                        background: "var(--accent-cyan)",
                        animation: "pulse-glow 1.2s ease-in-out infinite",
                    }}
                />
            </p>

            {/* Scroll CTA */}
            <div ref={ctaRef} className="absolute bottom-12">
                <div className="flex flex-col items-center gap-2 cursor-pointer opacity-50 hover:opacity-80 transition-opacity">
                    <span className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
                        Scroll
                    </span>
                    <div
                        className="w-[1px] h-8"
                        style={{
                            background: "linear-gradient(180deg, var(--accent-cyan), transparent)",
                        }}
                    />
                </div>
            </div>
        </section>
    );
}