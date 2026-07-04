"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "@/lib/gsap";
import { APP_READY_EVENT, isAppReady } from "./Preloader";

const sections = [
    { id: "about", label: "About" },
    { id: "work", label: "Work" },
    { id: "skills", label: "Skills" },
    { id: "contact", label: "Contact" },
];

export default function Navbar() {
    const [active, setActive] = useState<string>("");
    const [scrolled, setScrolled] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const ctx = gsap.context(() => {
            if (!reduced) {
                gsap.set(".nav-item", { opacity: 0, y: -12 });
                const play = () =>
                    gsap.to(".nav-item", {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        stagger: 0.08,
                        ease: "power2.out",
                    });
                if (isAppReady()) play();
                else window.addEventListener(APP_READY_EVENT, play, { once: true });
            }
        }, navRef);

        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll, { passive: true });

        const observers: IntersectionObserver[] = [];
        sections.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => entry.isIntersecting && setActive(id),
                { threshold: 0.25 }
            );
            obs.observe(el);
            observers.push(obs);
        });

        return () => {
            ctx.revert();
            window.removeEventListener("scroll", onScroll);
            observers.forEach((o) => o.disconnect());
        };
    }, []);

    // Decode-on-hover for nav labels
    const onLinkEnter = (e: React.MouseEvent, label: string) => {
        const span = (e.currentTarget as HTMLElement).querySelector(".nav-label");
        if (!span) return;
        gsap.to(span, {
            duration: 0.5,
            scrambleText: { text: label, chars: "01<>/#", speed: 1 },
            ease: "none",
        });
    };

    return (
        <nav
            ref={navRef}
            className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
                scrolled ? "glass py-3" : "py-5"
            }`}
        >
            <div className="shell flex items-center justify-between">
                <a
                    href="#hero"
                    className="nav-item font-mono text-base font-semibold tracking-tight"
                    style={{ color: "var(--ink)" }}
                >
                    <span style={{ color: "var(--ice)" }}>&lt;</span>
                    Sid
                    <span style={{ color: "var(--ice)" }}>/&gt;</span>
                </a>

                <div className="hidden md:flex items-center gap-8">
                    {sections.map(({ id, label }, i) => (
                        <a
                            key={id}
                            href={`#${id}`}
                            onMouseEnter={(e) => onLinkEnter(e, label)}
                            className="nav-item group flex items-center gap-1.5 text-sm font-medium transition-colors duration-300"
                            style={{ color: active === id ? "var(--ink)" : "var(--ink-mute)" }}
                        >
                            <span
                                className="font-mono text-[0.65rem]"
                                style={{ color: active === id ? "var(--ice)" : "var(--ink-faint)" }}
                            >
                                0{i + 1}
                            </span>
                            <span className="nav-label link-underline">{label}</span>
                        </a>
                    ))}
                </div>

                <a
                    href="#contact"
                    className="nav-item hidden sm:inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all duration-300"
                    style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}
                >
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    Available
                </a>
            </div>
        </nav>
    );
}
