"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function About() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const heading = new SplitText("h2", { type: "chars" });
            const body = new SplitText("p", { type: "lines" });

            gsap.from(heading.chars, {
                opacity: 0,
                y: 20,
                duration: 0.5,
                stagger: 0.04,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 85%",
                },
            });

            gsap.from(body.lines, {
                opacity: 0,
                y: 20,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 75%",
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="about" className="py-20 px-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">About Me</h2>
            <p className="text-gray-400 leading-relaxed">
                I am a final-year BTech student aspiring to become a Data Scientist.
                I have experience building AI-powered applications, autonomous rover systems,
                and full-stack web applications. My interests include machine learning,
                robotics, and scalable backend systems.
            </p>
        </section>
    );
}