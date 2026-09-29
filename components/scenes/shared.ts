"use client";

import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { MathUtils, SRGBColorSpace, type PerspectiveCamera, type Texture } from "three";
import { projects } from "@/content/projects";
import { signals, type Rect } from "@/lib/signals";
import { useStore } from "@/lib/store";

export const PROJECT_COUNT = projects.length;
export const damp = MathUtils.damp;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Cover images for every project, suspends until loaded (drives the preloader counter).
export function useProjectTextures(): Texture[] {
  const urls = useMemo(() => projects.map((p) => p.images[0]), []);
  const textures = useTexture(urls) as Texture[];
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    textures.forEach((t) => {
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = 4;
      t.needsUpdate = true;
      gl.initTexture(t); // upload now, during the preloader, not on first scroll
    });
  }, [textures, gl]);
  return textures;
}

// Snapshot of everything a scene reacts to, read once per frame.
export type SceneInputs = {
  intro: number;
  leave: number;
  hero: number;
  workIn: number;
  workIndex: number;
  about: number;
  contact: number;
  caseProgress: number;
  isCase: boolean;
  caseIndex: number;
  hovered: number;
  pointer: typeof signals.pointer;
  velocity: number;
  reducedMotion: boolean;
};

export function readInputs(): SceneInputs {
  const s = useStore.getState();
  const reduced = s.reducedMotion;
  return {
    intro: reduced ? 1 : signals.intro,
    leave: signals.leave,
    hero: signals.scroll.hero,
    workIn: signals.scroll.workIn,
    workIndex: signals.scroll.workIndex,
    about: signals.scroll.about,
    contact: signals.scroll.contact,
    caseProgress: signals.scroll.case,
    isCase: s.route.kind === "case",
    caseIndex: s.route.kind === "case" ? s.route.index : -1,
    hovered: s.hovered,
    pointer: signals.pointer,
    velocity: signals.scroll.velocity,
    reducedMotion: reduced,
  };
}

// Converts a DOM rect to a world-space rect on the plane z = planeZ,
// for an un-rotated perspective camera looking down -Z.
export function rectToWorld(
  rect: Rect,
  camera: PerspectiveCamera,
  size: { width: number; height: number },
  planeZ = 0,
) {
  const dist = camera.position.z - planeZ;
  const vh = 2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * dist;
  const vw = vh * (size.width / size.height);
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  return {
    x: camera.position.x + (cx / size.width - 0.5) * vw,
    y: camera.position.y - (cy / size.height - 0.5) * vh,
    w: (rect.w / size.width) * vw,
    h: (rect.h / size.height) * vh,
    vw,
    vh,
  };
}
