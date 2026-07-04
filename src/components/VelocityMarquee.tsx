"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";

const items = [
    "Python",
    "Machine Learning",
    "TensorFlow",
    "ROS",
    "Next.js",
    "Embedded C++",
    "Data Viz",
    "ESP32",
    "Django",
    "PostgreSQL",
    "Rust",
    "Computer Vision",
];

/* Two counter-scrolling rows that speed up and skew with scroll velocity. */
export default function VelocityMarquee() {
    const rootRef = useRef<HTMLElement>(null);
    const rowARef = useRef<HTMLDivElement>(null);
    const rowBRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const rowA = rowARef.current;
        const rowB = rowBRef.current;
        if (!rowA || !rowB) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        // Each row holds two identical chunks; wrap at -50% for a seamless loop
        const wrap = gsap.utils.wrap(-50, 0);
        const setA = gsap.quickSetter(rowA, "xPercent");
        const setB = gsap.quickSetter(rowB, "xPercent");
        const skewA = gsap.quickSetter(rowA, "skewX", "deg");
        const skewB = gsap.quickSetter(rowB, "skewX", "deg");

        let xA = 0;
        let xB = -25;
        let lastScroll = window.scrollY;
        let velocity = 0;

        const tick = (_t: number, delta: number) => {
            const scroll = window.scrollY;
            // px/ms of scroll, eased toward the new value then decayed
            const raw = (scroll - lastScroll) / Math.max(delta, 1);
            lastScroll = scroll;
            velocity += (raw - velocity) * 0.12;
            velocity *= 0.96;

            const boost = gsap.utils.clamp(-10, 10, velocity * 4);
            const base = 0.0035 * delta; // idle drift, %/tick

            xA = wrap(xA - base * (1 + Math.abs(boost) * 0.35) - boost * 0.05);
            xB = wrap(xB + base * (1 + Math.abs(boost) * 0.35) + boost * 0.05);

            setA(xA);
            setB(xB);
            const skew = gsap.utils.clamp(-6, 6, velocity * 2.5);
            skewA(skew);
            skewB(-skew);
        };

        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
    }, []);

    const Chunk = ({ ghost }: { ghost?: boolean }) => (
        <div className="vmarquee__chunk" aria-hidden="true">
            {items.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-[2.6rem]">
                    <span className={`vmarquee__item ${ghost ? "vmarquee__item--ghost" : ""}`}>
                        {item}
                    </span>
                    <span className="vmarquee__dot" />
                </span>
            ))}
        </div>
    );

    return (
        <section
            ref={rootRef}
            className="py-12 border-y overflow-hidden"
            style={{ borderColor: "var(--line)" }}
            aria-label="Technologies"
        >
            <div className="vmarquee">
                <div ref={rowARef} className="vmarquee__row">
                    <Chunk />
                    <Chunk />
                </div>
            </div>
            <div className="vmarquee mt-4">
                <div ref={rowBRef} className="vmarquee__row">
                    <Chunk ghost />
                    <Chunk ghost />
                </div>
            </div>
        </section>
    );
}
