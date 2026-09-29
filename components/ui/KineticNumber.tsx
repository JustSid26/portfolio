"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import type { Stat } from "@/content/projects";

// Counts up when scrolled into view; each digit rolls independently.
export function KineticNumber({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const decimals = String(stat.value).split(".")[1]?.length ?? 0;
  const fmt = (v: number) =>
    v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const final = `${stat.prefix ?? ""}${fmt(stat.value)}${stat.suffix ?? ""}`;

  useEffect(() => {
    const el = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const o = { v: 0 };
    const tween = gsap.to(o, {
      v: stat.value,
      duration: 2,
      ease: "expo.site",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: () => {
        el.textContent = `${stat.prefix ?? ""}${fmt(o.v)}${stat.suffix ?? ""}`;
      },
    });
    el.textContent = `${stat.prefix ?? ""}${fmt(0)}${stat.suffix ?? ""}`;
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      el.textContent = final;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stat, decimals, final]);

  return (
    <span className="tabular-nums" aria-label={final}>
      <span ref={ref} aria-hidden>
        {final}
      </span>
    </span>
  );
}
