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

/* A strip of instrument tape: mono capability readouts drifting left,
   accelerating with scroll velocity, over a printed ruler edge. */
export default function Tape() {
    const rowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const row = rowRef.current;
        if (!row) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const wrap = gsap.utils.wrap(-50, 0);
        const setX = gsap.quickSetter(row, "xPercent");

        let x = 0;
        let lastScroll = window.scrollY;
        let velocity = 0;

        const tick = (_t: number, delta: number) => {
            const scroll = window.scrollY;
            const raw = (scroll - lastScroll) / Math.max(delta, 1);
            lastScroll = scroll;
            velocity += (raw - velocity) * 0.12;
            velocity *= 0.96;

            const boost = gsap.utils.clamp(-10, 10, velocity * 4);
            const base = 0.0032 * delta;
            x = wrap(x - base * (1 + Math.abs(boost) * 0.4) - boost * 0.045);
            setX(x);
        };

        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
    }, []);

    const Chunk = () => (
        <div className="tape__chunk" aria-hidden="true">
            {items.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-[2.4rem]">
                    <span className="tape__item">{item}</span>
                    <span className="tape__tick">+</span>
                </span>
            ))}
        </div>
    );

    return (
        <section className="tape" aria-label="Technologies">
            <div ref={rowRef} className="tape__row">
                <Chunk />
                <Chunk />
            </div>
            <div className="tape__ruler" aria-hidden="true" />
        </section>
    );
}
