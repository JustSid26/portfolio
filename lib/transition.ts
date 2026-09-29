"use client";

import { gsap, Flip, ScrollTrigger } from "./gsap";
import { signals } from "./signals";
import { useStore } from "./store";
import { getLenis, scrollToTarget } from "./scroll";

type Router = { push: (href: string, opts?: { scroll?: boolean }) => void };

// A DOM "ghost" of the clicked media, carried across the route change and
// flipped onto the destination's [data-flip-target].
let ghost: HTMLElement | null = null;
let pendingHash: string | null = null;
let navigating = false;
let enterActive = false; // an animated enter is running

const main = () => document.getElementById("main");

export async function navigate(
  router: Router,
  href: string,
  opts: { from?: HTMLElement | null; image?: string } = {},
) {
  const url = new URL(href, location.href);
  if (navigating) return;
  if (url.pathname === location.pathname) {
    if (url.hash) scrollToTarget(url.hash);
    return;
  }
  navigating = true;
  const { reducedMotion } = useStore.getState();
  useStore.getState().set({ transition: "out", hovered: -1 });
  getLenis()?.stop();
  pendingHash = url.hash || null;

  const tl = gsap.timeline();
  const d = reducedMotion ? 0.01 : 1;

  if (opts.from && opts.image && !reducedMotion) {
    const r = opts.from.getBoundingClientRect();
    const g = document.createElement("div");
    g.className = "ghost";
    Object.assign(g.style, {
      position: "fixed",
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
      zIndex: "80",
      backgroundImage: `url(${opts.image})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      opacity: "0",
      pointerEvents: "none",
    } as CSSStyleDeclaration);
    document.body.appendChild(g);
    ghost = g;
    tl.to(g, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0.25);
  }

  tl.to(signals, { leave: 1, duration: 0.9 * d, ease: "inout.site" }, 0);
  tl.to(main(), { opacity: 0, y: -24, duration: 0.55 * d, ease: "power2.in" }, 0);

  await tl.then();
  router.push(url.pathname + url.search, { scroll: false });
}

// Called by every page on mount.
export function enterPage() {
  const { reducedMotion, transition } = useStore.getState();
  if (transition === "in" && !navigating && enterActive) return; // StrictMode double-mount
  const m = main();
  const fromNav = transition === "out";
  navigating = false;

  // Reset scroll to top instantly for the new page.
  getLenis()?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
  getLenis()?.start();
  // Refresh after the new page's triggers exist. (refresh() restores the scroll it
  // measured, so it must run once we're already at the top.)
  requestAnimationFrame(() => ScrollTrigger.refresh());

  const done = () => {
    enterActive = false;
    useStore.getState().set({ transition: "idle" });
    if (pendingHash) {
      const h = pendingHash;
      pendingHash = null;
      requestAnimationFrame(() => scrollToTarget(h));
    }
  };

  if (!fromNav) {
    // First load or back/forward: gentle fade only.
    if (m && transition !== "idle") gsap.fromTo(m, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    gsap.to(signals, { leave: 0, duration: reducedMotion ? 0.01 : 1.2, ease: "expo.site" });
    done();
    return;
  }

  enterActive = true;
  useStore.getState().set({ transition: "in" });
  const d = reducedMotion ? 0.01 : 1;
  const tl = gsap.timeline({ onComplete: done });
  tl.set(m, { y: 0 });
  tl.fromTo(m, { opacity: 0 }, { opacity: 1, duration: 0.8 * d, ease: "power2.out" }, 0.15);
  tl.to(signals, { leave: 0, duration: 1.4 * d, ease: "expo.site" }, 0.1);

  const target = document.querySelector<HTMLElement>("[data-flip-target]");
  if (ghost && target) {
    const g = ghost;
    ghost = null;
    gsap.set(target, { opacity: 0 });
    tl.add(
      Flip.fit(g, target, { duration: 1.1, ease: "inout.site", absolute: true }) as gsap.core.Tween,
      0,
    );
    tl.to(target, { opacity: 1, duration: 0.01 }, 1.1);
    tl.to(g, { opacity: 0, duration: 0.3, onComplete: () => g.remove() }, 1.1);
  } else if (ghost) {
    const g = ghost;
    ghost = null;
    tl.to(g, { opacity: 0, duration: 0.4, onComplete: () => g.remove() }, 0);
  }
}
