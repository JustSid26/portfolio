"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const sections = ["about", "projects", "skills", "contact"];

export default function Navbar() {
    const [active, setActive] = useState<string>("");
    const [scrolled, setScrolled] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const linksRef = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Stagger nav links (no vertical offset to avoid off-screen issues)
            gsap.from(".nav-link", {
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.2,
            });
        });

        // Scroll detection for glassmorphism enhancement
        const onScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        // Section observers
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
                { threshold: 0.25 }
            );

            observer.observe(element);
            observers.push(observer);
        });

        return () => {
            ctx.revert();
            window.removeEventListener("scroll", onScroll);
            observers.forEach((obs) => obs.disconnect());
        };
    }, []);

    // Animate indicator position
    useEffect(() => {
        const idx = sections.indexOf(active);
        const btn = linksRef.current[idx];
        const indicator = indicatorRef.current;
        if (!btn || !indicator) return;

        gsap.to(indicator, {
            x: btn.offsetLeft,
            width: btn.offsetWidth,
            duration: 0.4,
            ease: "power2.inOut",
        });
    }, [active]);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <nav
            ref={navRef}
            className={`fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-8 py-5 transition-all duration-500 ${scrolled
                ? "glass shadow-[0_4px_30px_rgba(255,255,255,0.08)]"
                : "bg-transparent"
                }`}
        >
            <h1
                className="text-xl font-bold cursor-pointer tracking-tight"
                onClick={() => scrollToSection("hero")}
                style={{
                    background: "linear-gradient(135deg, #ffffff, #b0b0b0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                {"<Sid/>"}
            </h1>

            <div className="space-x-8 hidden md:flex relative">
                {/* Animated underline indicator */}
                <div
                    ref={indicatorRef}
                    className="absolute -bottom-1 h-[2px] rounded-full"
                    style={{
                        background: "linear-gradient(90deg, #ffffff, #b0b0b0)",
                        boxShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
                        width: 0,
                    }}
                />

                {sections.map((section, i) => (
                    <button
                        key={section}
                        ref={(el) => { linksRef.current[i] = el; }}
                        onClick={() => scrollToSection(section)}
                        className={`nav-link relative text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${active === section
                            ? "text-gray-100"
                            : "text-gray-400 hover:text-gray-100"
                            }`}
                    >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                ))}
            </div>
        </nav>
    );
}