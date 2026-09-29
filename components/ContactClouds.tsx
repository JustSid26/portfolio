"use client";

// Contact section: a small cloud drifts above each social skyscraper and calls out to you.
// Positions come from the towers' projected screen rects; each cloud is also a link.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { signals } from "@/lib/signals";
import { useStore } from "@/lib/store";
import { LANDMARKS } from "./scenes/pinscreen/landmarks";

// Brand colours that are too pale to read on a white cloud get a darker ink.
const INK: Record<string, string> = { github: "#181717", mail: "#0a8f86" };

export function ContactClouds() {
  const pathname = usePathname();
  const reducedMotion = useStore((s) => s.reducedMotion);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const home = pathname === "/";

  useEffect(() => {
    if (!home) return;
    const tick = () => {
      const k = signals.contactAmt;
      refs.current.forEach((a, i) => {
        if (!a) return;
        const c = signals.cloudScreen[i];
        const show = k > 0.5 && c.on;
        // the message sits on its pin cloud (drawn on the canvas), a touch above centre
        a.style.transform = `translate3d(calc(${c.x}px - 50%), calc(${c.y - 6}px - 50%), 0)`;
        a.style.opacity = String(Math.max(0, Math.min(1, (k - 0.4) * 3)));
        if (a.dataset.on !== String(show)) {
          a.dataset.on = String(show);
          a.tabIndex = show ? 0 : -1;
          a.setAttribute("aria-hidden", String(!show));
          a.style.pointerEvents = show ? "auto" : "none";
        }
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [home, reducedMotion]);

  if (!home) return null;

  return (
    <nav aria-label="Ways to reach me" className="contact-clouds">
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
            className="cloud"
            data-cursor="link"
            data-on="false"
            tabIndex={-1}
            aria-hidden
            style={{ ["--brand" as string]: INK[l.key] ?? l.color }}
            onPointerEnter={() => (signals.landmarkHover = i)}
            onPointerLeave={() => (signals.landmarkHover = -1)}
          >
            <span className="cloud-puff" aria-hidden />
            <span className="cloud-text">
              <span className="cloud-name">{l.label}</span>
              {l.cloud}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
