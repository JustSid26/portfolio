"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "@/lib/gsap";

export const APP_READY_EVENT = "app:ready";

function announceReady() {
    document.documentElement.dataset.appReady = "1";
    window.dispatchEvent(new Event(APP_READY_EVENT));
}

/* True once the preloader has finished (or was skipped) — safe to read
   from effects that may mount after the event already fired. */
export function isAppReady() {
    return typeof document !== "undefined" && document.documentElement.dataset.appReady === "1";
}

/* First-load preloader: a counter races to 100, then the curtain wipes away.
   Skipped on repeat visits within the same session. Fires `app:ready` when
   the hero should start animating. */
export default function Preloader() {
    const [count, setCount] = useState(0);
    // null = undecided (SSR-safe), true = play, false = skip
    const [show, setShow] = useState<boolean | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const counterRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const seen = sessionStorage.getItem("preloader-seen");
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (seen || reduced) {
            setShow(false);
            announceReady();
            return;
        }
        setShow(true);
        sessionStorage.setItem("preloader-seen", "1");
    }, []);

    useEffect(() => {
        if (!show) return;

        const obj = { v: 0 };
        const tl = gsap.timeline();

        tl.to(obj, {
            v: 100,
            duration: 1.4,
            ease: "power3.inOut",
            onUpdate: () => setCount(Math.round(obj.v)),
        });
        tl.to(barRef.current, { scaleX: 1, duration: 1.4, ease: "power3.inOut" }, 0);
        tl.to(counterRef.current, { y: -30, opacity: 0, duration: 0.4, ease: "power2.in" });
        tl.add(announceReady, "-=0.1");
        tl.to(
            rootRef.current,
            {
                yPercent: -100,
                duration: 0.8,
                ease: "expo.inOut",
                onComplete: () => setShow(false),
            },
            "-=0.15"
        );

        return () => {
            tl.kill();
        };
    }, [show]);

    if (!show) return null;

    return (
        <div ref={rootRef} className="preloader">
            <div className="shell w-full">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="label mb-3">Siddharth Lama</p>
                        <p className="label" style={{ color: "var(--ink-faint)" }}>
                            Data · ML · Robotics
                        </p>
                    </div>
                    <div
                        ref={counterRef}
                        className="preloader-counter text-7xl md:text-9xl aurora-text"
                    >
                        {count}
                    </div>
                </div>
                <div className="mt-8 w-full h-[2px] overflow-hidden" style={{ background: "var(--line)" }}>
                    <div
                        ref={barRef}
                        className="h-full origin-left"
                        style={{
                            transform: "scaleX(0)",
                            background: "linear-gradient(90deg, var(--ice), var(--violet))",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
