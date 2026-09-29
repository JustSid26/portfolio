"use client";

import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { useStore } from "@/lib/store";

type Props = {
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  by?: "chars" | "words" | "lines";
  trigger?: "load" | "scroll" | "none";
  delay?: number;
  stagger?: number;
  duration?: number;
  id?: string;
};

// Masked SplitText reveal. `load` waits for the preloader, `scroll` fires on enter.
export function SplitReveal({
  as = "div",
  children,
  className,
  style,
  by = "lines",
  trigger = "scroll",
  delay = 0,
  stagger,
  duration = 1.2,
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const loaded = useStore((s) => s.loaded);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.visibility = "";
    if (reducedMotion || trigger === "none") return;
    if (trigger === "load" && !loaded) {
      el.style.visibility = "hidden";
      return;
    }

    let ctx: gsap.Context | undefined;
    const split = SplitText.create(el, {
      type: by === "chars" ? "lines,words,chars" : by === "words" ? "lines,words" : "lines",
      mask: "lines",
      linesClass: "split-line",
      autoSplit: true,
      aria: "auto",
      onSplit(self) {
        ctx?.revert();
        ctx = gsap.context(() => {
          const targets = by === "chars" ? self.chars : by === "words" ? self.words : self.lines;
          if (played.current) return; // re-split after resize: no replay
          const vars: gsap.TweenVars = {
            yPercent: 110,
            rotate: by === "chars" ? 6 : 0,
            duration,
            ease: "expo.site",
            stagger: stagger ?? (by === "chars" ? 0.025 : by === "words" ? 0.04 : 0.08),
            delay,
            onComplete: () => {
              played.current = true;
            },
          };
          if (trigger === "scroll") vars.scrollTrigger = { trigger: el, start: "top 88%", once: true };
          gsap.from(targets, vars);
        });
      },
    });

    return () => {
      ctx?.revert();
      split.revert();
    };
  }, [loaded, reducedMotion, trigger, by, delay, stagger, duration]);

  return createElement(as, { ref, className, style, id }, children);
}
