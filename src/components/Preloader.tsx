"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "@/lib/gsap";

/* First-load preloader: a counter races to 100, then the curtain wipes away. */
export default function Preloader() {
    const [count, setCount] = useState(0);
    const [done, setDone] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const counterRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const obj = { v: 0 };
        const tl = gsap.timeline();

        tl.to(obj, {
            v: 100,
            duration: 2,
            ease: "power2.inOut",
            onUpdate: () => setCount(Math.round(obj.v)),
        });

        tl.to(barRef.current, { scaleX: 1, duration: 2, ease: "power2.inOut" }, 0);

        tl.to(counterRef.current, {
            y: -30,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
        });

        tl.to(
            rootRef.current,
            {
                yPercent: -100,
                duration: 0.9,
                ease: "expo.inOut",
                onComplete: () => setDone(true),
            },
            "-=0.1"
        );

        return () => {
            tl.kill();
        };
    }, []);

    if (done) return null;

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
