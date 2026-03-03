"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projects = [
    {
        title: "Mantis Rover",
        description:
            "An autonomous rover system with real-time obstacle avoidance, GPS navigation, and telemetry streaming. Built for competitive robotics events.",
        tags: ["Arduino", "ESP32", "Python", "ROS"],
        accent: "var(--accent-cyan)",
    },
    {
        title: "AI Finance App",
        description:
            "Full-stack AI-powered financial advisor that analyzes spending patterns, predicts trends, and provides personalized savings recommendations.",
        tags: ["Next.js", "Python", "TensorFlow", "PostgreSQL"],
        accent: "var(--accent-purple)",
    },
    {
        title: "Voice Agent",
        description:
            "A conversational AI voice agent capable of natural speech understanding and task automation. Integrates with multiple APIs for real-world actions.",
        tags: ["Flask", "Whisper", "GPT-4", "Docker"],
        accent: "var(--accent-violet)",
    },
];

export default function Projects() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Heading whole-element animation
            gsap.fromTo(
                headingRef.current,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: wrapperRef.current,
                        start: "top 80%",
                        once: true,
                    },
                }
            );

            // Horizontal scroll
            const panels = gsap.utils.toArray<HTMLElement>(".project-panel");

            const scrollTween = gsap.to(panels, {
                xPercent: -100 * (panels.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    pin: true,
                    scrub: 1,
                    snap: 1 / (panels.length - 1),
                    end: () => "+=" + containerRef.current!.offsetWidth,
                },
            });

            // Animate each project section content as it enters
            panels.forEach((panel) => {
                const layout = panel.querySelector(".project-layout");
                const tags = panel.querySelectorAll(".project-tag");

                if (layout) {
                    gsap.fromTo(
                        layout,
                        { opacity: 0, y: 60, scale: 0.9 },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.8,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: scrollTween,
                                start: "left 70%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                }

                if (tags.length > 0) {
                    gsap.fromTo(
                        tags,
                        { opacity: 0, y: 20 },
                        {
                            opacity: 1,
                            y: 0,
                            stagger: 0.08,
                            duration: 0.5,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: scrollTween,
                                start: "left 60%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                }
            });

            // Progress bar
            gsap.to(progressRef.current, {
                scaleX: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: () => "+=" + containerRef.current!.offsetWidth,
                    scrub: true,
                },
            });
        }, wrapperRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={wrapperRef} id="projects">
            {/* Section heading */}
            <div className="py-20 px-6 text-center">
                <h2
                    ref={headingRef}
                    className="text-4xl md:text-5xl font-bold gradient-heading"
                >
                    Projects
                </h2>
                <p className="mt-4 text-sm uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
                    Scroll to explore →
                </p>
            </div>

            {/* Progress indicator */}
            <div className="max-w-xs mx-auto mb-8 h-[2px] bg-white/5 rounded-full overflow-hidden">
                <div
                    ref={progressRef}
                    className="h-full origin-left rounded-full"
                    style={{
                        transform: "scaleX(0)",
                        background: "linear-gradient(90deg, #ffffff, #b0b0b0)",
                    }}
                />
            </div>

            {/* Horizontal scroll container */}
            <div
                ref={containerRef}
                className="flex overflow-hidden"
                style={{ width: `${projects.length * 100}vw` }}
            >
                {projects.map((project, i) => (
                    <section
                        key={i}
                        className="project-panel w-screen h-screen flex items-center justify-center px-6"
                    >
                        <div className="project-layout relative w-full max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-10 md:gap-16">
                            {/* Left: project meta */}
                            <div className="flex-1 space-y-4">
                                <div
                                    className="text-xs uppercase tracking-[0.35em]"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    / {String(i + 1).padStart(2, "0")}
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold text-left">
                                    {project.title}
                                </h3>
                                <p
                                    className="text-base leading-relaxed max-w-xl"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {project.description}
                                </p>
                            </div>

                            {/* Right: tools used */}
                            <div className="w-full md:w-64">
                                <p
                                    className="text-xs font-semibold tracking-[0.25em] uppercase mb-3"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    Tools Used
                                </p>
                                <div className="flex flex-wrap md:flex-col gap-2">
                                    {project.tags.map((tag, j) => (
                                        <span key={j} className="project-tag">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}