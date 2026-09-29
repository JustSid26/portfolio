// Mutable per-frame values shared between DOM and WebGL.
// Written by DOM listeners / ScrollTriggers, read inside useFrame. Never triggers React renders.

export type Rect = { x: number; y: number; w: number; h: number };

export const signals = {
  pointer: { x: 0, y: 0, sx: 0, sy: 0, px: 0, py: 0, speed: 0 }, // ndc (-1..1), smoothed, pixels, speed
  scroll: {
    velocity: 0,
    hero: 0, // 0 at top → 1 when hero has scrolled out
    work: 0, // 0..1 progress through pinned work section
    workIndex: 0, // float index of the active project
    workIn: 0, // 0..1 how much the work section is on screen
    about: 0, // 0..1 progress through about
    contact: 0, // 0..1 progress through contact
    case: 0, // 0..1 progress through a case study page
  },
  // DOM elements the scenes align to (read rect each frame)
  els: {
    workFrame: null as HTMLElement | null,
    caseMedia: null as HTMLElement | null,
    aboutObject: null as HTMLElement | null,
  },
  // 0 → 1 as the preloader counter climbs (drives the intro model's assembly)
  loadProgress: 0,
  // 0 → 1 as the intro reveal plays after the preloader
  intro: 0,
  // Live stats for the HUD readouts
  pinCount: 0,
  city: { blocks: 0, buildings: 0, houses: 0, lanes: 0, cars: 0 },
  // Screen rects of the social skyscrapers' logos (DOM links track these)
  landmarks: Array.from({ length: 4 }, () => ({ x: 0, y: 0, w: 0, h: 0, on: false })),
  landmarkHover: -1,
  skyward: 0,
  // Contact: screen centre of each pin cloud (PinClouds writes, ContactClouds places the text)
  cloudScreen: Array.from({ length: 4 }, () => ({ x: 0, y: 0, on: false })), // About looks up at the sky: the sun/moon swings to sit above the laptop
  // Work billboard's screen rect on the page (Billboard.tsx writes, Work.tsx places the link)
  billboard: { x: 0, y: 0, w: 0, h: 0, on: false, laptop: false },
  contactAmt: 0, // 0..1 how far the contact section has arrived
  fps: 60,
  // 0 → 1 while leaving a route, 1 → 0 while entering
  leave: 0,
};

export const readRect = (el: HTMLElement | null): Rect | null => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};
