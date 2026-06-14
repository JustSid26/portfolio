"use client";

import { useEffect, useRef } from "react";

/* A glowing dot + lagging ring that grows over interactive elements. */
export default function Cursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only enable on devices with a real pointer
        const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
        if (!canHover.matches) return;

        document.body.classList.add("custom-cursor");

        const dot = dotRef.current!;
        const ring = ringRef.current!;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let raf = 0;

        const onMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        };

        const render = () => {
            // Ring trails the dot with easing
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            raf = requestAnimationFrame(render);
        };
        raf = requestAnimationFrame(render);

        const interactiveSel = 'a, button, [role="button"], input, textarea, .skill-badge, .tilt-card, .chip, .social-link';
        const onOver = (e: Event) => {
            if ((e.target as HTMLElement).closest(interactiveSel)) {
                ring.classList.add("is-hovering");
            }
        };
        const onOut = (e: Event) => {
            if ((e.target as HTMLElement).closest(interactiveSel)) {
                ring.classList.remove("is-hovering");
            }
        };

        window.addEventListener("mousemove", onMove);
        document.addEventListener("mouseover", onOver);
        document.addEventListener("mouseout", onOut);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseover", onOver);
            document.removeEventListener("mouseout", onOut);
            document.body.classList.remove("custom-cursor");
        };
    }, []);

    return (
        <>
            <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
            <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
        </>
    );
}
