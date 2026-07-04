"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "@/lib/gsap";

const bom = [
    {
        ref: "U1",
        category: "Languages",
        items: ["Python", "Java", "C++", "Rust", "JavaScript", "TypeScript"],
    },
    {
        ref: "U2",
        category: "ML & Data Science",
        items: [
            "Supervised & Unsupervised Learning",
            "Model Evaluation",
            "Feature Engineering",
            "EDA",
            "Data Visualization",
        ],
    },
    {
        ref: "U3",
        category: "Frameworks",
        items: ["Django", "Flask", "Next.js", "React", "Spring Boot"],
    },
    {
        ref: "U4",
        category: "Databases",
        items: ["MySQL", "MongoDB", "Redis"],
    },
    {
        ref: "U5",
        category: "Electronics",
        items: ["Arduino", "ESP32", "Raspberry Pi", "STM32", "Embedded Systems"],
    },
    {
        ref: "U6",
        category: "Tools & DevOps",
        items: [
            "NeoVim",
            "JetBrains IDEs",
            "VS Code",
            "GitHub",
            "GitLab",
            "Jenkins",
            "n8n",
            "ngrok",
            "MATLAB",
            "Unity",
            "TinkerCAD",
        ],
    },
];

const TOTAL = bom.reduce((n, row) => n + row.items.length, 0);

export default function Skills() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const ctx = gsap.context(() => {
            gsap.from(".skills-head", {
                opacity: 0,
                y: 30,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: { trigger: section, start: "top 78%", once: true },
            });

            gsap.from(".bom-row", {
                opacity: 0,
                y: 24,
                duration: 0.55,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: { trigger: ".bom", start: "top 82%", once: true },
            });
        }, section);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="skills" className="section">
            <div className="shell">
                <div className="sec-head skills-head">
                    <span className="sec-no">SEC.03</span>
                    <span className="sec-name">Instrumentation</span>
                    <span className="sec-note hidden sm:block">
                        Bill of materials — {TOTAL} components
                    </span>
                </div>

                <h2 className="skills-head display section-title max-w-3xl">
                    The stack I reach for
                </h2>

                <div className="bom mt-14">
                    {bom.map((row) => (
                        <div key={row.ref} className="bom-row" data-cursor={row.ref}>
                            <span className="bom-ref">{row.ref}</span>
                            <h3 className="bom-cat">{row.category}</h3>
                            <p className="bom-items">
                                {row.items.map((item, i) => (
                                    <Fragment key={item}>
                                        {i > 0 && <span className="sep">/</span>}
                                        {item}
                                    </Fragment>
                                ))}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
