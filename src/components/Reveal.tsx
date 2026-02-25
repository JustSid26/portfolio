"use client";

import { useEffect, useRef, ReactNode } from "react";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
    children: ReactNode;
}

export default function Reveal({ children }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            gsap.from(el, {
                opacity: 0,
                y: 40,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
                    toggleActions: "play none none reverse",
                },
            });
        });

        return () => ctx.revert();
    }, []);

    return <div ref={ref}>{children}</div>;
}