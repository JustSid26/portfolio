"use client";

import { ReactNode, useRef } from "react";
import gsap from "@/lib/gsap";

interface TiltCardProps {
    children: ReactNode;
    className?: string;
    max?: number; // max tilt in degrees
}

/* Pointer-driven 3D tilt with a moving glare (driven by CSS vars --mx/--my). */
export default function TiltCard({ children, className = "", max = 9 }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    const onMove = (e: React.MouseEvent) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rotY = (px - 0.5) * max * 2;
        const rotX = -(py - 0.5) * max * 2;

        el.style.setProperty("--mx", `${px * 100}%`);
        el.style.setProperty("--my", `${py * 100}%`);
        gsap.to(el, {
            rotateX: rotX,
            rotateY: rotY,
            duration: 0.4,
            ease: "power2.out",
            transformPerspective: 900,
        });
    };

    const onLeave = () => {
        const el = ref.current;
        if (!el) return;
        gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.7, ease: "power3.out" });
    };

    return (
        <div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className={`tilt-card ${className}`}
        >
            {children}
        </div>
    );
}
