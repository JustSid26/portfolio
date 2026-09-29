"use client";

import { Color } from "three";
import { gsap } from "./gsap";
import { environment } from "./environment";

export const WEATHERS = ["day", "evening", "night", "rain", "autumn", "winter"] as const;
export type Weather = (typeof WEATHERS)[number];
export const DEFAULT_WEATHER: Weather = "evening";

export const WEATHER_LABEL: Record<Weather, string> = {
  day: "Day",
  evening: "Evening",
  night: "Night",
  rain: "Rain",
  autumn: "Autumn",
  winter: "Winter",
};

type Preset = {
  sunDir: [number, number, number];
  sunColor: [number, number, number];
  skyColor: [number, number, number];
  exposure: number;
  windows: number;
  wetness: number;
  snow: number;
  rain: number;
  snowfall: number;
  leafA: [number, number, number];
  leafB: [number, number, number];
  lawn: [number, number, number];
  hazeNear: [number, number, number];
  hazeFar: [number, number, number];
  skyHorizon: [number, number, number];
  skyLow: [number, number, number];
  skyMid: [number, number, number];
  skyZenith: [number, number, number];
  sunDisc: [number, number, number];
  sunVisible: number;
  sunX: number;
  sunHeight: number;
  sunSize: number;
  stars: number;
  overcast: number;
};

type RGB = [number, number, number];
const GREEN: { leafA: RGB; leafB: RGB; lawn: RGB } = { leafA: [0.1, 0.3, 0.12], leafB: [0.2, 0.42, 0.14], lawn: [0.18, 0.34, 0.14] };

export const PRESETS: Record<Weather, Preset> = {
  evening: {
    sunDir: [-0.82, 0.38, 0.3],
    sunColor: [1.55, 0.87, 0.47],
    skyColor: [0.32, 0.26, 0.5],
    exposure: 0.22,
    windows: 0.3,
    wetness: 0,
    snow: 0,
    rain: 0,
    snowfall: 0,
    ...GREEN,
    hazeNear: [0.62, 0.34, 0.36],
    hazeFar: [0.95, 0.52, 0.32],
    skyHorizon: [1.0, 0.64, 0.3],
    skyLow: [0.95, 0.42, 0.38],
    skyMid: [0.36, 0.2, 0.46],
    skyZenith: [0.07, 0.06, 0.2],
    sunDisc: [1.0, 0.8, 0.5],
    sunVisible: 1,
    sunX: 0.2,
    sunHeight: 0.035,
    sunSize: 0.032,
    stars: 0.7,
    overcast: 0,
  },
  day: {
    sunDir: [-0.45, 0.35, 0.82],
    sunColor: [1.6, 1.52, 1.4],
    skyColor: [0.42, 0.56, 0.82],
    exposure: 0.8,
    windows: 0.04,
    wetness: 0,
    snow: 0,
    rain: 0,
    snowfall: 0,
    ...GREEN,
    hazeNear: [0.66, 0.76, 0.88],
    hazeFar: [0.8, 0.88, 0.96],
    skyHorizon: [0.86, 0.92, 0.98],
    skyLow: [0.66, 0.8, 0.95],
    skyMid: [0.38, 0.6, 0.92],
    skyZenith: [0.16, 0.36, 0.78],
    sunDisc: [1.0, 0.98, 0.9],
    sunVisible: 1,
    sunX: 0.45,
    sunHeight: 0.3,
    sunSize: 0.026,
    stars: 0,
    overcast: 0,
  },
  night: {
    sunDir: [0.45, 0.45, 0.77], // moonlight from the east
    sunColor: [0.26, 0.32, 0.5],
    skyColor: [0.08, 0.1, 0.22],
    exposure: 0.12,
    windows: 0.55,
    wetness: 0,
    snow: 0,
    rain: 0,
    snowfall: 0,
    leafA: [0.05, 0.14, 0.08],
    leafB: [0.08, 0.2, 0.1],
    lawn: [0.06, 0.13, 0.07],
    hazeNear: [0.08, 0.08, 0.17],
    hazeFar: [0.16, 0.12, 0.24],
    skyHorizon: [0.2, 0.14, 0.3],
    skyLow: [0.1, 0.08, 0.2],
    skyMid: [0.04, 0.05, 0.13],
    skyZenith: [0.01, 0.015, 0.05],
    sunDisc: [0.85, 0.9, 1.0], // moon
    sunVisible: 1,
    sunX: 0.8,
    sunHeight: 0.12,
    sunSize: 0.02,
    stars: 1,
    overcast: 0,
  },
  rain: {
    sunDir: [-0.3, 0.4, 0.86],
    sunColor: [0.45, 0.5, 0.6],
    skyColor: [0.28, 0.31, 0.38],
    exposure: 0.3,
    windows: 0.42,
    wetness: 1,
    snow: 0,
    rain: 1,
    snowfall: 0,
    leafA: [0.07, 0.22, 0.12],
    leafB: [0.12, 0.3, 0.14],
    lawn: [0.12, 0.26, 0.12],
    hazeNear: [0.3, 0.32, 0.38],
    hazeFar: [0.4, 0.42, 0.48],
    skyHorizon: [0.44, 0.46, 0.52],
    skyLow: [0.34, 0.36, 0.42],
    skyMid: [0.22, 0.24, 0.3],
    skyZenith: [0.1, 0.11, 0.15],
    sunDisc: [0.7, 0.72, 0.76],
    sunVisible: 0,
    sunX: 0.5,
    sunHeight: 0.1,
    sunSize: 0.03,
    stars: 0,
    overcast: 1,
  },
  autumn: {
    sunDir: [-0.72, 0.4, 0.52],
    sunColor: [1.55, 1.08, 0.62],
    skyColor: [0.44, 0.38, 0.4],
    exposure: 0.5,
    windows: 0.15,
    wetness: 0,
    snow: 0,
    rain: 0,
    snowfall: 0,
    leafA: [0.72, 0.28, 0.06],
    leafB: [0.92, 0.6, 0.12],
    lawn: [0.42, 0.34, 0.14],
    hazeNear: [0.78, 0.6, 0.46],
    hazeFar: [0.98, 0.78, 0.5],
    skyHorizon: [1.0, 0.8, 0.5],
    skyLow: [0.95, 0.66, 0.42],
    skyMid: [0.6, 0.56, 0.62],
    skyZenith: [0.28, 0.34, 0.56],
    sunDisc: [1.0, 0.88, 0.6],
    sunVisible: 1,
    sunX: 0.28,
    sunHeight: 0.12,
    sunSize: 0.03,
    stars: 0,
    overcast: 0.2,
  },
  winter: {
    sunDir: [-0.5, 0.4, 0.62],
    sunColor: [1.1, 1.14, 1.25],
    skyColor: [0.56, 0.62, 0.74],
    exposure: 0.5,
    windows: 0.32,
    wetness: 0,
    snow: 1,
    rain: 0,
    snowfall: 1,
    leafA: [0.62, 0.68, 0.72],
    leafB: [0.8, 0.84, 0.9],
    lawn: [0.86, 0.9, 0.95],
    hazeNear: [0.78, 0.82, 0.9],
    hazeFar: [0.88, 0.9, 0.95],
    skyHorizon: [0.9, 0.92, 0.96],
    skyLow: [0.78, 0.82, 0.9],
    skyMid: [0.58, 0.64, 0.78],
    skyZenith: [0.34, 0.4, 0.58],
    sunDisc: [1.0, 0.97, 0.92],
    sunVisible: 0.5,
    sunX: 0.35,
    sunHeight: 0.08,
    sunSize: 0.028,
    stars: 0,
    overcast: 0.5,
  },
};

const COLOR_KEYS = ["sunColor", "skyColor", "leafA", "leafB", "lawn", "hazeNear", "hazeFar", "skyHorizon", "skyLow", "skyMid", "skyZenith", "sunDisc"] as const;
const NUM_KEYS = ["exposure", "windows", "wetness", "snow", "rain", "snowfall", "sunVisible", "sunX", "sunHeight", "sunSize", "stars", "overcast"] as const;

// Blend the environment to a preset. `instant` for first paint and reduced motion.
// Which body is in the sky: the moon only at night.
const isMoon = (w: Weather) => w === "night";
let current: Weather | null = null;

// Blend the environment to a preset. `instant` for first paint and reduced motion.
// Switching between sun and moon plays a real sky transition: the current body sets below
// the horizon where it is, then the other one rises from its own side (moon from the east).
export function applyWeather(w: Weather, instant = false) {
  const p = PRESETS[w];
  const from = current;
  current = w;
  const e = environment;
  const swap = !instant && from !== null && isMoon(from) !== isMoon(w);
  const d = instant ? 0 : swap ? 3.2 : 1.6;
  const ease = "power2.inOut";
  gsap.killTweensOf([e, e.sunDir, ...COLOR_KEYS.map((k) => e[k])]);
  const [x, y, z] = p.sunDir;
  const len = Math.hypot(x, y, z);
  gsap.to(e.sunDir, { x: x / len, y: y / len, z: z / len, duration: d, ease });
  for (const k of COLOR_KEYS) {
    if (swap && k === "sunDisc") continue; // swapped at the horizon instead
    const [r, g, b] = p[k];
    gsap.to(e[k] as Color, { r, g, b, duration: d, ease });
  }
  const nums: Record<string, number> = {};
  const DISC = ["sunX", "sunHeight", "sunSize", "sunVisible"];
  for (const k of NUM_KEYS) if (!(swap && DISC.includes(k))) nums[k] = p[k];
  gsap.to(e, { ...nums, duration: d, ease });

  if (!swap) return;
  const BELOW = -0.09;
  const [r, g, b] = p.sunDisc;
  gsap
    .timeline()
    .to(e, { sunHeight: BELOW, duration: 1.4, ease: "power2.in" }) // set where it is
    .add(() => {
      // Out of sight: become the other body, on its own side of the sky.
      e.sunX = p.sunX;
      e.sunSize = p.sunSize;
      e.sunDisc.setRGB(r, g, b);
    })
    .to(e, { sunVisible: p.sunVisible, duration: 0.3 })
    .to(e, { sunHeight: p.sunHeight, duration: 1.7, ease: "power2.out" }, "<"); // rise
}
