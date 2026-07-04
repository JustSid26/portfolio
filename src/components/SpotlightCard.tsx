"use client";

import { ReactNode, useRef } from "react";

interface SpotlightCardProps {
    children: ReactNode;
    className?: string;
}

/* Card whose border + interior glow track the pointer (via --mx/--my). */
export default function SpotlightCard({ children, className = "" }: SpotlightCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    const onMove = (e: React.MouseEvent) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
        el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
    };

    return (
        <div ref={ref} onMouseMove={onMove} className={`spotlight-card ${className}`}>
            {children}
        </div>
    );
}
