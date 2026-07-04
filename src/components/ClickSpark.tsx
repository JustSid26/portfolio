"use client";

import { useEffect, useRef } from "react";

type Spark = { x: number; y: number; angle: number; start: number };

const SPARK_COUNT = 8;
const DURATION = 450; // ms
const RADIUS = 26; // travel distance
const LENGTH = 9; // spark line length

/* Tiny radial spark burst wherever the user clicks. */
export default function ClickSpark() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        let sparks: Spark[] = [];
        let raf = 0;
        let running = false;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

        const draw = (now: number) => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            sparks = sparks.filter((s) => now - s.start < DURATION);

            for (const s of sparks) {
                const t = easeOut((now - s.start) / DURATION);
                const d0 = t * RADIUS;
                const d1 = d0 + LENGTH * (1 - t);
                ctx.strokeStyle = `rgba(121, 230, 255, ${1 - t})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(s.x + Math.cos(s.angle) * d0, s.y + Math.sin(s.angle) * d0);
                ctx.lineTo(s.x + Math.cos(s.angle) * d1, s.y + Math.sin(s.angle) * d1);
                ctx.stroke();
            }

            if (sparks.length) {
                raf = requestAnimationFrame(draw);
            } else {
                running = false;
            }
        };

        const onClick = (e: MouseEvent) => {
            const start = performance.now();
            for (let i = 0; i < SPARK_COUNT; i++) {
                sparks.push({
                    x: e.clientX,
                    y: e.clientY,
                    angle: (Math.PI * 2 * i) / SPARK_COUNT,
                    start,
                });
            }
            if (!running) {
                running = true;
                raf = requestAnimationFrame(draw);
            }
        };

        window.addEventListener("click", onClick);
        window.addEventListener("resize", resize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("click", onClick);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="fixed inset-0 z-[9998] pointer-events-none"
        />
    );
}
