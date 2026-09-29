"use client";

// Glowing park lamps: a bright bulb and a soft warm halo at every fence post, plus a pool of
// light on the ground. Additive points, one draw call. They fade in as it gets dark
// (evening, night, rain) and are off by day.
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial } from "three";
import { environment as env } from "@/lib/environment";

const POST_TOP = 0.108; // lamp heads sit on the tall fence posts, above the tree canopies

export function ParkLamps({ lamps, amount }: { lamps: Float32Array; amount: () => number }) {
  const points = useMemo(() => {
    const n = lamps.length / 2;
    // Two sprites per lamp: the bulb/halo up on the post, and the pool on the grass.
    const pos = new Float32Array(n * 2 * 3);
    const kind = new Float32Array(n * 2);
    const seed = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const x = lamps[i * 2];
      const y = lamps[i * 2 + 1];
      pos.set([x, y, POST_TOP], i * 6);
      pos.set([x, y, 0.004], i * 6 + 3);
      kind[i * 2] = 0;
      kind[i * 2 + 1] = 1;
      seed[i * 2] = seed[i * 2 + 1] = Math.random();
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("aKind", new BufferAttribute(kind, 1));
    g.setAttribute("aSeed", new BufferAttribute(seed, 1));
    const m = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uOn: { value: 0 }, uTime: { value: 0 }, uWet: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float aKind; attribute float aSeed;
        uniform float uOn; uniform float uTime;
        varying float vKind; varying float vI;
        void main() {
          vKind = aKind;
          // a gentle flicker, different per lamp
          vI = uOn * (0.9 + 0.1 * sin(uTime * (2.0 + aSeed * 3.0) + aSeed * 40.0));
          vec4 mv = viewMatrix * vec4(position, 1.0);
          float size = aKind < 0.5 ? 26.0 : 60.0;
          gl_PointSize = size * uOn * (10.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uWet;
        varying float vKind; varying float vI;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          vec3 warm = vec3(1.0, 0.72, 0.38);
          float a;
          vec3 c;
          if (vKind < 0.5) {
            float core = smoothstep(0.22, 0.0, d);
            float halo = exp(-d * d * 5.0) * 0.55;
            c = mix(warm, vec3(1.0, 0.95, 0.85), core) * (core * 2.2 + halo);
            a = 1.0;
          } else {
            // pool of light on the grass (brighter and sharper on wet ground)
            float pool = exp(-d * d * mix(4.0, 7.0, uWet)) * mix(0.28, 0.45, uWet);
            c = warm * pool;
            a = 1.0;
          }
          gl_FragColor = vec4(c * vI, a);
        }`,
    });
    const p = new Points(g, m);
    p.frustumCulled = false;
    p.renderOrder = 6;
    return p;
  }, [lamps]);

  useEffect(
    () => () => {
      points.geometry.dispose();
      (points.material as ShaderMaterial).dispose();
    },
    [points],
  );

  useFrame((state) => {
    const k = amount();
    // Same darkness curve as the fence posts in the pin shader.
    const dark = 1 - Math.min(1, Math.max(0, (env.exposure - 0.32) / 0.2));
    const on = dark * k;
    points.visible = on > 0.01;
    const u = (points.material as ShaderMaterial).uniforms;
    u.uOn.value = on;
    u.uTime.value = state.clock.elapsedTime;
    u.uWet.value = env.wetness;
  });

  return <primitive object={points} />;
}
