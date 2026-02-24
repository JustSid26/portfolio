"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const sections = ["about", "projects", "skills", "contact"];

export default function Navbar() {
    const [active, setActive] = useState<string>("");

    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        sections.forEach((id) => {
            const element = document.getElementById(id);
            if (!element) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setActive(id);
                    }
                },
                { threshold: 0.5 }
            );

            observer.observe(element);
            observers.push(observer);
        });

        return () => observers.forEach((obs) => obs.disconnect());
    }, []);

    const scrollToSection = (id: string) => {
        document
            .getElementById(id)
            ?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <nav className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-black z-40 backdrop-blur">
            <h1
                className="text-xl font-bold cursor-pointer"
                onClick={() => scrollToSection("hero")}
            >
                Sid.
            </h1>

            <div className="space-x-8 hidden md:flex relative">
                {sections.map((section) => (
                    <button
                        key={section}
                        onClick={() => scrollToSection(section)}
                        className="relative text-gray-400 hover:text-white transition"
                    >
                        {active === section && (
                            <motion.span
                                layoutId="navIndicator"
                                className="absolute -bottom-2 left-0 right-0 h-[2px] bg-white"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span
                            className={
                                active === section ? "text-white" : ""
                            }
                        >
              {section.charAt(0).toUpperCase() +
                  section.slice(1)}
            </span>
                    </button>
                ))}
            </div>
        </nav>
    );
}