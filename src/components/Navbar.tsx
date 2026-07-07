"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "@/lib/gsap";
import { APP_READY_EVENT, isAppReady } from "./Preloader";

const sections = [
    { id: "about", label: "Profile" },
    { id: "work", label: "Records" },
    { id: "skills", label: "Toolkit" },
    { id: "contact", label: "Contact" },
];

export default function Navbar() {
    const [active, setActive] = useState<string>("");
    const [clock, setClock] = useState("--:--:--");
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const ctx = gsap.context(() => {
            if (!reduced) {
                gsap.set(".nav-item", { opacity: 0, y: -10 });
                const play = () =>
                    gsap.to(".nav-item", {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.07,
                        ease: "power2.out",
                    });
                if (isAppReady()) play();
                else window.addEventListener(APP_READY_EVENT, play, { once: true });
            }
        }, navRef);

        // Live UTC clock — the document is always current
        const tick = () => {
            const d = new Date();
            setClock(
                [d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()]
                    .map((n) => String(n).padStart(2, "0"))
                    .join(":") + " UTC"
            );
        };
        tick();
        const clockId = setInterval(tick, 1000);

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
            clearInterval(clockId);
            observers.forEach((o) => o.disconnect());
        };
    }, []);

    const onLinkEnter = (e: React.MouseEvent, label: string) => {
        const span = (e.currentTarget as HTMLElement).querySelector(".nav-label");
        if (!span) return;
        gsap.to(span, {
            duration: 0.45,
            scrambleText: { text: label, chars: "01<>/#", speed: 1 },
            ease: "none",
        });
    };

    return (
        <nav ref={navRef} className="topbar fixed top-0 inset-x-0 z-40">
            <div
                className="shell flex items-center justify-between gap-4"
                style={{ height: "var(--topbar-h)" }}
            >
                <a
                    href="#hero"
                    className="nav-item font-mono text-[0.72rem] font-semibold tracking-[0.14em] uppercase"
                    style={{ color: "var(--ink)" }}
                    data-cursor="TOP ↑"
                >
                    DOC: SL-2026
                    <span className="hidden sm:inline" style={{ color: "var(--ink-mute)" }}>
                        {" "}· REV 3.0
                    </span>
                </a>

                <div className="hidden md:flex items-center gap-7">
                    {sections.map(({ id, label }, i) => (
                        <a
                            key={id}
                            href={`#${id}`}
                            onMouseEnter={(e) => onLinkEnter(e, label)}
                            className="nav-item flex items-center gap-1.5 font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors duration-300"
                            style={{ color: active === id ? "var(--ink)" : "var(--ink-mute)" }}
                        >
                            <span style={{ color: active === id ? "var(--accent)" : "var(--ink-faint)" }}>
                                0{i + 1}
                            </span>
                            <span className="nav-label link-underline">{label}</span>
                        </a>
                    ))}
                </div>

                <div className="nav-item flex items-center gap-4">
                    <span
                        className="hidden sm:inline font-mono text-[0.68rem] tracking-[0.12em] tabular-nums"
                        style={{ color: "var(--ink-mute)" }}
                    >
                        {clock}
                    </span>
                    <a
                        href="#contact"
                        className="inline-flex items-center gap-2 font-mono text-[0.66rem] font-semibold tracking-[0.16em] uppercase px-3 py-1.5 border rounded-[3px] transition-colors duration-300"
                        style={{ borderColor: "var(--accent-ink)", color: "var(--accent-ink)" }}
                        data-cursor="CONTACT →"
                    >
                        <span className="relative flex h-1.5 w-1.5">
                            <span
                                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                                style={{ background: "var(--accent)" }}
                            />
                            <span
                                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                                style={{ background: "var(--accent)" }}
                            />
                        </span>
                        Available
                    </a>
                </div>
            </div>
        </nav>
    );
}
