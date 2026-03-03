"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollProgress() {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(barRef.current, {
                scaleX: 1,
                ease: "none",
                scrollTrigger: {
                    start: 0,
                    end: () => ScrollTrigger.maxScroll(window),
                    scrub: true,
                },
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={barRef}
            className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
            style={{
                transform: "scaleX(0)",
                background: "linear-gradient(90deg, #ffffff, #b0b0b0, #808080)",
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.2)",
            }}
        />
    );
}