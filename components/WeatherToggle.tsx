"use client";

// Weather & time-of-day switcher for the city, plus the controller that blends presets,
// schedules lightning in the rain, and remembers the visitor's choice.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { environment } from "@/lib/environment";
import { useStore } from "@/lib/store";
import { applyWeather, WEATHERS, WEATHER_LABEL, type Weather } from "@/lib/weather";

const KEY = "city-weather";

const Icon = ({ w }: { w: Weather }) => {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (w) {
    case "day":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "evening":
      return (
        <svg {...common}>
          <path d="M17 18a5 5 0 0 0-10 0M12 9v4M4.2 10.2l1.4 1.4M1 18h2M21 18h2M18.4 11.6l1.4-1.4M23 22H1M16 5l-4 4-4-4" />
        </svg>
      );
    case "night":
      return (
        <svg {...common}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      );
    case "rain":
      return (
        <svg {...common}>
          <path d="M19 16.9A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.3" />
          <path d="M13 11l-4 6h6l-4 6" />
        </svg>
      );
    case "autumn":
      return (
        <svg {...common}>
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z" />
          <path d="M2 21c0-3 1.9-5.4 5.2-6.1 2.5-.5 4.4-1.8 5.8-3.9" />
        </svg>
      );
    case "winter":
      return (
        <svg {...common}>
          <path d="M12 2v20M4.9 6l14.2 12M4.9 18L19.1 6M9 3l3 3 3-3M9 21l3-3 3 3" />
        </svg>
      );
  }
};

export function WeatherToggle() {
  const pathname = usePathname();
  const weather = useStore((s) => s.weather);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const loaded = useStore((s) => s.loaded);
  const set = useStore((s) => s.set);
  const first = useRef(true);

  // Restore the last choice.
  useEffect(() => {
    try {
      const w = localStorage.getItem(KEY) as Weather | null;
      if (w && (WEATHERS as readonly string[]).includes(w)) set({ weather: w });
    } catch {}
  }, [set]);

  // Blend to the chosen preset.
  useEffect(() => {
    applyWeather(weather, first.current || reducedMotion);
    first.current = false;
    try {
      localStorage.setItem(KEY, weather);
    } catch {}
  }, [weather, reducedMotion]);

  // Lightning while it rains: a double flash every 4–9 s. Never under reduced motion,
  // and never more than ~3 flashes a second (photosensitivity).
  useEffect(() => {
    if (weather !== "rain" || reducedMotion) return;
    let call: gsap.core.Tween | null = null;
    const strike = () => {
      gsap
        .timeline()
        .to(environment, { flash: 1, duration: 0.05 })
        .to(environment, { flash: 0.15, duration: 0.12 })
        .to(environment, { flash: 0.85, duration: 0.05 }, "+=0.12")
        .to(environment, { flash: 0, duration: 0.9, ease: "power2.out" });
      call = gsap.delayedCall(4 + Math.random() * 5, strike);
    };
    call = gsap.delayedCall(1.2, strike);
    return () => {
      call?.kill();
      gsap.to(environment, { flash: 0, duration: 0.3 });
    };
  }, [weather, reducedMotion]);

  if (pathname !== "/") return null;

  return (
    <div
      role="radiogroup"
      aria-label="City weather"
      className="weather-toggle t-meta"
      data-show={loaded || undefined}
    >
      {WEATHERS.map((w) => (
        <button
          key={w}
          type="button"
          role="radio"
          aria-checked={weather === w}
          aria-label={WEATHER_LABEL[w]}
          title={WEATHER_LABEL[w]}
          onClick={() => set({ weather: w })}
          className="weather-btn"
        >
          <Icon w={w} />
          <span className="weather-label">{WEATHER_LABEL[w]}</span>
        </button>
      ))}
    </div>
  );
}
