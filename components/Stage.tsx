"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";
import { useStore } from "@/lib/store";
import { signals } from "@/lib/signals";
import { PinscreenScene } from "./scenes/pinscreen/PinscreenScene";

// Smooths shared inputs once per frame for every scene.
function Inputs() {
  const invalidate = useThree((s) => s.invalidate);
  const reducedMotion = useStore((s) => s.reducedMotion);
  useFrame((_, dt) => {
    const p = signals.pointer;
    p.sx = MathUtils.damp(p.sx, p.x, 4, dt);
    p.sy = MathUtils.damp(p.sy, p.y, 4, dt);
    p.speed = MathUtils.damp(p.speed, 0, 3, dt);
    if (dt > 0) signals.fps = MathUtils.damp(signals.fps, Math.min(240, 1 / dt), 2, dt);
  });
  // With frameloop="demand" (reduced motion) re-render on scroll & route changes.
  useEffect(() => {
    if (!reducedMotion) return;
    const onScroll = () => invalidate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const unsub = useStore.subscribe(() => invalidate());
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      unsub();
    };
  }, [reducedMotion, invalidate]);
  return null;
}

// Compiles every material before the preloader lets go, so the reveal never hitches.
function WarmUp() {
  const { gl, scene, camera } = useThree();
  const set = useStore((s) => s.set);
  useEffect(() => {
    let alive = true;
    gl.compileAsync(scene, camera).then(() => {
      if (alive) set({ sceneReady: true });
    });
    return () => {
      alive = false;
    };
  }, [gl, scene, camera, set]);
  return null;
}

export function Stage() {
  const lowPower = useStore((s) => s.lowPower);
  const reducedMotion = useStore((s) => s.reducedMotion);

  useEffect(() => {
    const c = document.createElement("canvas");
    if (!c.getContext("webgl2")) {
      document.documentElement.classList.add("no-webgl");
      useStore.getState().set({ sceneReady: true });
    }
  }, []);

  return (
    <Canvas
      dpr={lowPower ? [1, 1.25] : [1, 1.75]}
      gl={{ antialias: !lowPower, powerPreference: "high-performance", alpha: false, stencil: false }}
      frameloop={reducedMotion ? "demand" : "always"}
      camera={{ fov: 35, near: 0.1, far: 200, position: [0, 0, 10] }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Inputs />
      <Suspense fallback={null}>
        <PinscreenScene />
        <WarmUp />
      </Suspense>
    </Canvas>
  );
}
