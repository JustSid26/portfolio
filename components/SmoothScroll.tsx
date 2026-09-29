"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";
import { signals } from "@/lib/signals";
import { useStore } from "@/lib/store";

export function SmoothScroll() {
  const reducedMotion = useStore((s) => s.reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      const onScroll = () => ScrollTrigger.update();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, syncTouch: false });
    setLenis(lenis);
    lenis.on("scroll", (l: Lenis) => {
      signals.scroll.velocity = l.velocity;
      ScrollTrigger.update();
    });
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, [reducedMotion]);

  return null;
}
