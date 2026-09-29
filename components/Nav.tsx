"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "./TransitionLink";
import { scrollToTarget } from "@/lib/scroll";
import { useStore } from "@/lib/store";
import { gsap } from "@/lib/gsap";
import { site } from "@/content/projects";

const links = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const loaded = useStore((s) => s.loaded);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const ref = useRef<HTMLElement>(null);
  const home = pathname === "/";

  useEffect(() => {
    if (!loaded || !ref.current || reducedMotion) return;
    gsap.fromTo(
      ref.current.querySelectorAll("[data-nav-item]"),
      { yPercent: -120 },
      { yPercent: 0, duration: 1.1, ease: "expo.site", stagger: 0.06, delay: 0.5 },
    );
  }, [loaded, reducedMotion]);

  return (
    <header
      ref={ref}
      data-nav
      className="fixed inset-x-0 top-0 z-[100] flex items-start justify-between t-meta"
      style={{ padding: "var(--gutter)", color: "var(--fg)", textShadow: "0 1px 2px rgb(0 0 0 / 0.55), 0 0 16px rgb(0 0 0 / 0.45)" }}
    >
      <span className="overflow-clip">
        <TransitionLink href="/" data-nav-item className="block" aria-label={`${site.name} — home`}>
          {site.name}
        </TransitionLink>
      </span>
      <nav aria-label="Primary" className="flex gap-5 sm:gap-8">
        {links.map((l) => (
          <span key={l.id} className="overflow-clip">
            {home ? (
              <a
                data-nav-item
                href={`#${l.id}`}
                className="link-line block"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget(`#${l.id}`);
                }}
              >
                {l.label}
              </a>
            ) : (
              <TransitionLink data-nav-item href={`/#${l.id}`} className="link-line block">
                {l.label}
              </TransitionLink>
            )}
          </span>
        ))}
      </nav>
    </header>
  );
}
