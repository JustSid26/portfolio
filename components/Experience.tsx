"use client";

import dynamic from "next/dynamic";
import { useEffect, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { signals } from "@/lib/signals";
import { environment } from "@/lib/environment";
import { SmoothScroll } from "./SmoothScroll";
import { Cursor } from "./Cursor";
import { Preloader } from "./Preloader";
import { Nav } from "./Nav";
import { ScrollRail } from "./ScrollRail";
import { LandmarkLinks } from "./LandmarkLinks";
import { ContactClouds } from "./ContactClouds";
import { WeatherToggle } from "./WeatherToggle";
import { MacWindow } from "./MacWindow";
import { LensRain } from "./LensRain";

const Stage = dynamic(() => import("./Stage").then((m) => m.Stage), { ssr: false });

export function Experience({ children }: { children: ReactNode }) {
  const set = useStore((s) => s.set);
  const loaded = useStore((s) => s.loaded);

  useEffect(() => {
    document.documentElement.classList.toggle("is-loaded", loaded);
  }, [loaded]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __store: useStore, __signals: signals, __env: environment });

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const sync = () => {
      const cores = navigator.hardwareConcurrency ?? 8;
      set({ reducedMotion: rm.matches, lowPower: small.matches || cores <= 4 });
    };
    sync();
    rm.addEventListener("change", sync);
    small.addEventListener("change", sync);

    // Pointer → normalised device coords for the scenes.
    const p = signals.pointer;
    let lastX = 0;
    let lastY = 0;
    const move = (e: PointerEvent) => {
      p.px = e.clientX;
      p.py = e.clientY;
      p.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.y = -((e.clientY / window.innerHeight) * 2 - 1);
      p.speed = Math.min(1, Math.hypot(e.clientX - lastX, e.clientY - lastY) / 60);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    window.addEventListener("pointermove", move, { passive: true });

    // Back/forward: let the next page fade in rather than cut.
    const pop = () => useStore.getState().set({ transition: "in" });
    window.addEventListener("popstate", pop);

    return () => {
      rm.removeEventListener("change", sync);
      small.removeEventListener("change", sync);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("popstate", pop);
    };
  }, [set]);

  return (
    <>
      <SmoothScroll />
      <div className="stage" aria-hidden>
        <Stage />
      </div>
      <Nav />
      <ScrollRail />
      <LandmarkLinks />
      <ContactClouds />
      <main id="main" className="relative z-10">
        {children}
      </main>
      <WeatherToggle />
      <MacWindow />
      <LensRain />
      <Cursor />
      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />
      <Preloader />
    </>
  );
}
