"use client";

import { useEffect, useRef } from "react";

/* Crosshair cursor: full-viewport hairlines meeting at an orange dot,
   with a mono readout showing live coordinates — or the target's
   data-cursor label when hovering something interactive. */
export default function Cursor() {
    const hRef = useRef<HTMLDivElement>(null);
    const vRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);
    const readRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
        if (!canHover.matches) return;

        document.body.classList.add("custom-cursor");

        const h = hRef.current!;
        const v = vRef.current!;
        const dot = dotRef.current!;
        const read = readRef.current!;

        let label: string | null = null;

        const onMove = (e: MouseEvent) => {
            const x = e.clientX;
            const y = e.clientY;
            h.style.transform = `translateY(${y}px)`;
            v.style.transform = `translateX(${x}px)`;
            dot.style.transform = `translate(${x - 2.5}px, ${y - 2.5}px)`;

            // readout flips to the left/top of the pointer near the edges
            const flipX = x > window.innerWidth - 170;
            const flipY = y > window.innerHeight - 60;
            read.style.transform = `translate(${x + (flipX ? -14 : 14)}px, ${y + (flipY ? -40 : 16)}px) translate(${flipX ? "-100%" : "0"}, 0)`;
            read.textContent =
                label ??
                `X ${String(Math.round(x)).padStart(4, "0")}  Y ${String(Math.round(y)).padStart(4, "0")}`;
        };

        const interactiveSel =
            'a, button, [role="button"], input, textarea, .chip, .bom-row, [data-cursor]';

        const onOver = (e: Event) => {
            const t = (e.target as HTMLElement).closest<HTMLElement>(interactiveSel);
            if (t) {
                label = t.dataset.cursor ?? "ENTER ↵";
                read.classList.add("is-hot");
            }
        };
        const onOut = (e: Event) => {
            if ((e.target as HTMLElement).closest(interactiveSel)) {
                label = null;
                read.classList.remove("is-hot");
            }
        };

        window.addEventListener("mousemove", onMove);
        document.addEventListener("mouseover", onOver);
        document.addEventListener("mouseout", onOut);

        return () => {
            window.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseover", onOver);
            document.removeEventListener("mouseout", onOut);
            document.body.classList.remove("custom-cursor");
        };
    }, []);

    return (
        <>
            <div ref={hRef} className="xhair-h" aria-hidden="true" />
            <div ref={vRef} className="xhair-v" aria-hidden="true" />
            <div ref={dotRef} className="xhair-dot" aria-hidden="true" />
            <div ref={readRef} className="xhair-readout" aria-hidden="true" />
        </>
    );
}
