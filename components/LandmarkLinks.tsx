"use client";

// Real <a> links that ride on top of the social skyscrapers in the city. They follow each
// tower's projected logo every frame, light the tower on hover/focus, and are skipped by
// keyboard and screen readers whenever the city isn't on screen.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { signals } from "@/lib/signals";
import { LANDMARKS } from "./scenes/pinscreen/landmarks";

export function LandmarkLinks() {
  const pathname = usePathname();
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const home = pathname === "/";

  useEffect(() => {
    if (!home) return;
    const tick = () => {
      refs.current.forEach((a, i) => {
        if (!a) return;
        const r = signals.landmarks[i];
        const pad = 10;
        const on = r.on && r.w > 8;
        a.style.transform = `translate3d(${r.x - pad}px, ${r.y - pad}px, 0)`;
        a.style.width = `${r.w + pad * 2}px`;
        a.style.height = `${r.h + pad * 2}px`;
        if (a.dataset.on !== String(on)) {
          a.dataset.on = String(on);
          a.tabIndex = on ? 0 : -1;
          a.setAttribute("aria-hidden", String(!on));
          a.style.pointerEvents = on ? "auto" : "none";
        }
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [home]);

  if (!home) return null;

  return (
    <nav aria-label="Social links in the city" className="landmark-links fixed inset-0 overflow-hidden">
      {LANDMARKS.map((l, i) => {
        const external = !l.href.startsWith("mailto:");
        return (
          <a
            key={l.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            href={l.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            aria-label={`${l.label}${external ? " (opens in a new tab)" : ""}`}
            data-cursor="view"
            data-cursor-label={`${l.label} ↗`}
            data-on="false"
            tabIndex={-1}
            aria-hidden
            onPointerEnter={() => (signals.landmarkHover = i)}
            onPointerLeave={() => (signals.landmarkHover = -1)}
            onFocus={() => (signals.landmarkHover = i)}
            onBlur={() => (signals.landmarkHover = -1)}
          />
        );
      })}
    </nav>
  );
}
