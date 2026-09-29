"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

// Dot follows exactly, ring trails. Elements opt in with data-cursor="link" | "view"
// and data-cursor-label="…". Plain <a>/<button> get the link state automatically.
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = root.current!;
    document.documentElement.classList.add("has-cursor");

    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3" });

    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      el.dataset.hidden = "false";
    };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button");
      if (!t) {
        el.dataset.state = "default";
        return;
      }
      el.dataset.state = t.dataset.cursor ?? "link";
      label.current!.textContent = t.dataset.cursorLabel ?? "";
    };
    const leave = () => (el.dataset.hidden = "true");

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div ref={root} className="cursor" data-state="default" data-hidden="true" aria-hidden>
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
