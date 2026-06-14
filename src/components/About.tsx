"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const pillars = [
    {
        n: "01",
        title: "Data & Machine Learning",
        body: "Turning messy data into decisions — EDA, feature engineering, model training and evaluation across supervised and unsupervised problems.",
        tools: ["Python", "TensorFlow", "Pandas", "scikit-learn"],
    },
    {
        n: "02",
        title: "Embedded & Robotics",
        body: "Bringing software into the physical world — sensor fusion, real-time control and autonomous navigation on constrained hardware.",
        tools: ["ESP32", "STM32", "ROS", "C++"],
    },
    {
        n: "03",
        title: "Full-Stack Engineering",
        body: "Shipping the whole product — typed APIs, real-time data and polished interfaces that make complex systems usable.",
        tools: ["Next.js", "Django", "PostgreSQL", "Redis"],
    },
];

export default function About() {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".about-reveal", {
                opacity: 0,
                y: 40,
                duration: 0.9,
                stagger: 0.12,
                ease: "power3.out",
                scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
            });

            gsap.from(".pillar", {
                opacity: 0,
                y: 50,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: { trigger: ".pillar-grid", start: "top 80%", once: true },
            });

            ScrollTrigger.create({
                trigger: ref.current,
                start: "top 60%",
                once: true,
                onEnter: () =>
                    document
                        .querySelectorAll(".keyword-highlight")
                        .forEach((k) => k.classList.add("active")),
            });
        }, ref);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={ref} id="about" className="section">
            <div className="shell">
                <p className="eyebrow about-reveal">01 — About</p>

                <h2 className="about-reveal section-title max-w-4xl">
                    Final-year BTech engineer aspiring to be a{" "}
                    <span className="keyword-highlight">Data Scientist</span>, with a habit of
                    building things that <span className="keyword-highlight">move</span> in the
                    real world.
                </h2>

                <div className="about-reveal mt-8 max-w-2xl space-y-5 text-lg" style={{ color: "var(--ink-dim)" }}>
                    <p>
                        I work across the stack of intelligent systems — from{" "}
                        <span className="keyword-highlight">machine learning</span> and{" "}
                        <span className="keyword-highlight">autonomous rovers</span> to full-stack
                        web apps. I like problems where data, hardware and software have to agree
                        with each other.
                    </p>
                    <p>
                        My focus right now is sharpening the data-science craft while shipping
                        end-to-end projects that are reliable, fast, and a little bit delightful.
                    </p>
                </div>

                <div className="pillar-grid mt-20 grid gap-5 md:grid-cols-3">
                    {pillars.map((p) => (
                        <div key={p.n} className="pillar card p-7">
                            <span className="font-mono text-sm" style={{ color: "var(--ice)" }}>
                                {p.n}
                            </span>
                            <h3 className="mt-4 text-xl font-semibold" style={{ color: "var(--ink)" }}>
                                {p.title}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-dim)" }}>
                                {p.body}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {p.tools.map((t) => (
                                    <span key={t} className="chip">{t}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
