"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import { signals } from "@/lib/signals";

// Infinite marquee whose speed and direction follow scroll velocity.
export function Marquee({ items, className, style }: { items: string[]; className?: string; style?: CSSProperties }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let dir = -1;
    const tick = (_: number, dtMs: number) => {
      const half = el.scrollWidth / 2;
      const v = signals.scroll.velocity;
      if (Math.abs(v) > 0.5) dir = v > 0 ? -1 : 1;
      const speed = 60 + Math.min(Math.abs(v) * 25, 900);
      x += dir * speed * (dtMs / 1000);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const row = (hidden: boolean) =>
    items.map((t, i) => (
      <span key={`${hidden}-${i}`} aria-hidden={hidden || undefined} className="flex items-center">
        <span className="px-[0.35em]">{t}</span>
        <span className="accent px-[0.15em]" aria-hidden>
          ✳
        </span>
      </span>
    ));

  return (
    <div className={`overflow-clip ${className ?? ""}`} style={style}>
      <div ref={track} className="marquee">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
