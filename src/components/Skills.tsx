"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reveal from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

const skillCategories = [
    {
        category: "Languages",
        skills: ["Python", "Java", "C++", "Rust", "JavaScript", "TypeScript"],
    },
    {
        category: "Database",
        skills: ["MySQL", "MongoDB", "Redis"],
    },
    {
        category: "Frameworks",
        skills: ["Django", "Flask", "NextJS", "React", "SpringBoot"],
    },
    {
        category: "ML & Data Science",
        skills: [
            "Supervised & Unsupervised Learning",
            "Model Evaluation",
            "Feature Engineering",
            "EDA",
            "Data Visualization",
        ],
    },
    {
        category: "Electronics",
        skills: ["Arduino", "ESP32", "RaspberryPI", "STM32", "Embedded Systems"],
    },
    {
        category: "Tools & DevOps",
        skills: [
            "NeoVim",
            "WebStorm",
            "PyCharm",
            "VS Code",
            "TinkerCAD",
            "GitHub",
            "GitLab",
            "Jenkins",
            "n8n",
            "ngrok",
            "MATLAB",
            "Unity",
            "Desmos",
        ],
    },
];

const skillIconMap: Record<string, ReactNode> = {
    Python: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M9 9h4.5a2.5 2.5 0 0 1 0 5H11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M11 14H9v-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    ),
    Java: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M7 17c1.2.8 2.9 1.2 5 1.2s3.8-.4 5-1.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M9 7c0 1.2 1.5 1.6 1.5 2.6S9 11.2 9 12.4 10.3 15 12 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    ),
    "C++": (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M15 10h4M15 14h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    Rust: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 15V9h3a2 2 0 0 1 0 4h-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    MySQL: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <ellipse cx="12" cy="7" rx="6" ry="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 7v10c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    MongoDB: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M12 4s-3 2.4-3 6.2C9 14 10.5 16 12 19c1.5-3 3-5 3-8.8C15 6.4 12 4 12 4Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ),
    Redis: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="6" width="14" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="5" y="11" width="14" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    HTML: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 4h14l-1.2 13L12 20l-5-3L5 4Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    CSS: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 4h14l-2 12-6 2-6-2 1-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    JavaScript: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 9v6M14 9.5a2 2 0 0 1 2 2V13a2 2 0 0 1-2 2h-1" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    TypeScript: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 9h6M12 9v6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    Django: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="5" width="6" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M15 9h2v7a2 2 0 0 1-2 2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    NextJS: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 9h2v6M13 9l3 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    SpringBoot: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M7.2 6 5 10.3a2 2 0 0 0 0 1.8L7.2 16l4.8 2 4.8-2 2.2-3.9a2 2 0 0 0 0-1.8L16.8 6 12 4 7.2 6Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
            />
        </svg>
    ),
    Arduino: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M7 12c1.5-2 3-3 5-3s3.5 1 5 3M7 12c1.5 2 3 3 5 3s3.5-1 5-3M6 12h2M16 12h2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    ),
    ESP32: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="7" y="5" width="10" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 8h6M9 11h4M9 14h3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    RaspberryPI: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    STM32: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="7" y="7" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 9h2M5 15h2M17 5v2M13 5v2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    NeoVim: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l4-4 4 4V5l-4 4-4-4Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    "VS Code": (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M7 9 5 11l2 2 4.5-4.5L17 7v10l-5.5-1.5L7 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ),
    GitHub: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M12 4a8 8 0 0 0-2.5 15.6c.4.1.5-.2.5-.4v-1.4c-2 .4-2.4-.9-2.4-.9-.3-.8-.8-1-.8-1-.7-.4.1-.4.1-.4.8.1 1.2.9 1.2.9.7 1.2 1.9.8 2.4.6a2 2 0 0 1 .6-1.2c-1.6-.2-3.3-.8-3.3-3.6A2.8 2.8 0 0 1 9 8.4a2.6 2.6 0 0 1 .1-1.9s.6-.2 2 .8a6.7 6.7 0 0 1 3.8 0c1.4-1 2-.8 2-.8.2.5.3 1.2.1 1.9a2.8 2.8 0 0 1 .7 1.9c0 2.8-1.7 3.4-3.4 3.6a2.2 2.2 0 0 1 .6 1.7v2.5c0 .2.1.5.5.4A8 8 0 0 0 12 4Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
            />
        </svg>
    ),
    GitLab: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M5 4 7 11l5 7 5-7 2-7-4 3-3-3-3 3-4-3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
        </svg>
    ),
    Jenkins: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 18c.7-2 2.4-3 5-3s4.3 1 5 3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    MATLAB: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M4 16 9 8l3 8 3-4 4 4-6 2-3-1-4 1Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
        </svg>
    ),
    Unity: (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <polygon
                points="12 4 7 7 9 12 7 17 12 20 17 17 15 12 17 7 12 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
            />
        </svg>
    ),
    "Arduino IDE": (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="6" width="14" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 11h2M10 10v2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
};

export default function Skills() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const ctx = gsap.context(() => {
            const groups = section.querySelectorAll(".skill-category");

            // Ensure groups are hidden until the section scrolls into view
            gsap.set(groups, { opacity: 0, y: 24 });

            // Stagger skill groups one by one as section enters viewport
            gsap.to(groups, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%",
                    once: true,
                },
            });
        }, section);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="skills" className="py-32 px-6 max-w-5xl mx-auto">
            <Reveal>
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold gradient-heading">
                        Skills
                    </h2>
                </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
                {skillCategories.map((cat, ci) => (
                    <div key={ci} className="skill-category flex flex-col items-center md:items-start">
                        <h3
                            className="text-sm font-semibold uppercase tracking-[0.2em] mb-5"
                            style={{ color: "#e0e0e0" }}
                        >
                            {cat.category}
                        </h3>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            {cat.skills.map((skill, si) => (
                                <span key={si} className="skill-badge inline-flex items-center gap-2">
                                    {skillIconMap[skill] && (
                                        <span className="text-xs text-gray-200" aria-hidden="true">
                                            {skillIconMap[skill]}
                                        </span>
                                    )}
                                    <span>{skill}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}