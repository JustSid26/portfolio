"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/scroll";

const SECTIONS = [
  { id: "top", label: "Intro" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

// Thin progress rail on the right edge: page progress plus a tick per section.
export function ScrollRail() {
  const pathname = usePathname();
  const fill = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("top");
  const home = pathname === "/";

  useEffect(() => {
    if (!home) return;
    let last = "";
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
      let current = "top";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) current = s.id;
      }
      if (current !== last) {
        last = current;
        setActive(current);
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [home]);

  if (!home) return null;

  return (
    <nav className="rail t-meta" aria-label="Page sections">
      <div className="rail-ticks">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-current={active === s.id}
            onClick={() => scrollToTarget(s.id === "top" ? 0 : `#${s.id}`)}
          >
            {String(i).padStart(2, "0")} {s.label}
          </button>
        ))}
      </div>
      <div className="rail-track" aria-hidden>
        <div ref={fill} className="rail-fill" />
      </div>
    </nav>
  );
}
