"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { signals } from "@/lib/signals";

// Live system readout — the numbers are real: pin count from the scene, fps from the render loop.
export function LiveReadout() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let acc = 0;
    const tick = (_: number, dt: number) => {
      acc += dt;
      if (acc < 250 || !ref.current) return;
      acc = 0;
      const pins = signals.pinCount ? signals.pinCount.toLocaleString("en-US") : "—";
      ref.current.textContent = `${pins} pins · ${Math.round(signals.fps)} fps · spring k=70`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return (
    <span className="tabular-nums" aria-hidden>
      <span className="accent">●</span> <span ref={ref}>— pins · — fps</span>
    </span>
  );
}
