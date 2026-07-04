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

const STEPS = [
    "LOADING TYPEFACES",
    "CALIBRATING GRID",
    "ALIGNING FIGURES",
    "READY",
];

/* Calibration screen: counter runs to 100 while status lines tick by,
   then the sheet wipes upward. Skipped on repeat visits this session. */
export default function Preloader() {
    const [count, setCount] = useState(0);
    const [step, setStep] = useState(0);
    const [show, setShow] = useState<boolean | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
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
            duration: 1.3,
            ease: "power3.inOut",
            onUpdate: () => {
                const v = Math.round(obj.v);
                setCount(v);
                setStep(Math.min(STEPS.length - 1, Math.floor((v / 100) * STEPS.length)));
            },
        });
        tl.to(barRef.current, { scaleX: 1, duration: 1.3, ease: "power3.inOut" }, 0);
        tl.add(announceReady, "+=0.1");
        tl.to(
            rootRef.current,
            {
                yPercent: -100,
                duration: 0.7,
                ease: "expo.inOut",
                onComplete: () => setShow(false),
            },
            "-=0.05"
        );

        return () => {
            tl.kill();
        };
    }, [show]);

    if (!show) return null;

    return (
        <div ref={rootRef} className="preloader">
            <div className="shell w-full">
                <div className="flex items-end justify-between gap-6">
                    <div>
                        <p className="label mb-2" style={{ color: "var(--ink)" }}>
                            SL-2026 · Calibration
                        </p>
                        <p className="label" style={{ color: "var(--accent-ink)" }}>
                            {STEPS[step]}
                            <span className="blink">_</span>
                        </p>
                    </div>
                    <div className="preloader-counter text-7xl md:text-9xl">
                        {String(count).padStart(3, "0")}
                        <span className="text-2xl md:text-4xl" style={{ color: "var(--ink-mute)" }}>%</span>
                    </div>
                </div>
                <div className="mt-8 w-full h-[3px] overflow-hidden" style={{ background: "var(--paper-dim)" }}>
                    <div
                        ref={barRef}
                        className="h-full origin-left"
                        style={{ transform: "scaleX(0)", background: "var(--accent)" }}
                    />
                </div>
            </div>
        </div>
    );
}
