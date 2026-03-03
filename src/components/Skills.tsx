"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const skills = [
    "Python", "Machine Learning", "Next.js", "TypeScript",
    "Flask", "Arduino", "ESP32", "Raspberry Pi", "SQL", "Docker"
];

export default function Skills() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".skill-badge", {
                opacity: 0,
                y: 20,
                duration: 0.4,
                stagger: 0.07,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                },
            });

            gsap.from("h2", {
                opacity: 0,
                y: 30,
                duration: 0.5,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 85%",
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="skills" className="py-20 px-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center gradient-heading">Skills</h2>
            <div className="flex flex-wrap gap-4 justify-center">
                {skills.map((skill, index) => (
                    <span
                        key={index}
                        className="skill-badge px-4 py-2 border border-gray-700 rounded-lg gradient-content"
                    >
                        {skill}
                    </span>
                ))}
            </div>
        </section>
    );
}