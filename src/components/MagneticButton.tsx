"use client";

import { ReactNode, useRef } from "react";
import gsap from "@/lib/gsap";

interface MagneticButtonProps {
    children: ReactNode;
    href?: string;
    onClick?: () => void;
    className?: string;
    strength?: number;
}

/* A control that's gently pulled toward the cursor while hovered.
   Renders an <a> when href is given (so SmoothScroll's anchor handler runs). */
export default function MagneticButton({
    children,
    href,
    onClick,
    className = "",
    strength = 0.4,
}: MagneticButtonProps) {
    const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

    const onMove = (e: React.MouseEvent) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        gsap.to(el, {
            x: x * strength,
            y: y * (strength + 0.1),
            duration: 0.4,
            ease: "power3.out",
        });
    };

    const onLeave = () => {
        const el = ref.current;
        if (!el) return;
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    };

    const shared = {
        ref,
        onMouseMove: onMove,
        onMouseLeave: onLeave,
        className,
    };

    if (href) {
        return (
            <a href={href} {...shared}>
                {children}
            </a>
        );
    }
    return (
        <button onClick={onClick} {...shared}>
            {children}
        </button>
    );
}
