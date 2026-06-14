"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Drives Lenis smooth scroll and keeps GSAP ScrollTrigger in sync. */
export default function SmoothScroll() {
    useEffect(() => {
        // Respect reduced-motion: skip smooth scrolling entirely
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 1.5,
        });

        lenis.on("scroll", ScrollTrigger.update);

        const raf = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);

        // Anchor links / programmatic scrolls go through Lenis
        const onAnchor = (e: Event) => {
            const target = (e.target as HTMLElement).closest("a[href^='#'], [data-scroll-to]");
            if (!target) return;
            const sel =
                target.getAttribute("data-scroll-to") ||
                target.getAttribute("href");
            if (!sel || sel === "#") return;
            const el = document.querySelector(sel);
            if (el) {
                e.preventDefault();
                lenis.scrollTo(el as HTMLElement, { offset: -10 });
            }
        };
        document.addEventListener("click", onAnchor);

        // Expose for imperative scrolls elsewhere
        (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

        return () => {
            document.removeEventListener("click", onAnchor);
            gsap.ticker.remove(raf);
            lenis.destroy();
            delete (window as unknown as { __lenis?: Lenis }).__lenis;
        };
    }, []);

    return null;
}
