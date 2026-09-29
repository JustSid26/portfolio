"use client";

// The sky straight overhead, for About (the camera faces up). Follows the weather:
// stars that twinkle at evening/night, blue sky with drifting cloud patches by day/autumn,
// a heavy grey deck with lightning in the rain, a pale snowy sky in winter.
import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Mesh, PlaneGeometry, ShaderMaterial } from "three";
import { environment as env } from "@/lib/environment";
import { signals } from "@/lib/signals";
import { useStore } from "@/lib/store";

export function Zenith() {
  const { size } = useThree();
  const reducedMotion = useStore((s) => s.reducedMotion);
  const { mesh, mat } = useMemo(() => {
    const mat = new ShaderMaterial({
      // behind everything by depth (z ≈ far plane), so the laptop and planes draw over it
      depthTest: true,
      depthWrite: false,
      transparent: true,
      uniforms: {
        uAmt: { value: 0 }, uTime: { value: 0 }, uAspect: { value: 1 },
        uZenith: { value: env.skyZenith }, uMid: { value: env.skyMid }, uLow: { value: env.skyLow },
        uStars: { value: 0 }, uOvercast: { value: 0 }, uFlash: { value: 0 }, uExposure: { value: 0 }, uSnow: { value: 0 },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.998, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uAmt, uTime, uAspect, uStars, uOvercast, uFlash, uExposure, uSnow;
        uniform vec3 uZenith, uMid, uLow;
        varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        float noise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
        float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }
        void main() {
          vec2 p = vec2((vUv.x - 0.5) * uAspect, vUv.y - 0.5);
          // overhead: deepest at the centre, a touch lighter towards the edges of view
          vec3 sky = mix(uZenith, uMid, smoothstep(0.1, 0.9, length(p)) * 0.6);
          // stars, twinkling (evening, night)
          vec2 g = floor(vUv * vec2(220.0 * uAspect, 220.0));
          float h = hash(g);
          float tw = 0.55 + 0.45 * sin(uTime * (1.5 + h * 4.0) + h * 60.0);
          float star = step(0.994, h) * tw;
          float bright = step(0.9985, h) * (0.6 + 0.4 * sin(uTime * 3.0 + h * 90.0));
          sky += vec3(0.85, 0.9, 1.0) * (star * 0.8 + bright * 1.2) * uStars * (1.0 - uOvercast);
          // cloud patches drifting across (day, autumn); a full deck when overcast
          vec2 cp = p * 2.2 + vec2(uTime * 0.02, uTime * 0.012);
          float c = fbm(cp);
          float patches = smoothstep(0.52, 0.7, c) * (1.0 - uStars) * smoothstep(0.35, 0.7, uExposure);
          vec3 cloudCol = mix(vec3(1.0), uLow, 0.25) * (0.85 + 0.25 * fbm(cp * 2.0));
          sky = mix(sky, cloudCol, patches * 0.9);
          float deck = smoothstep(0.25, 0.6, c + 0.15);
          vec3 deckCol = mix(uZenith * 1.3, uMid * 1.1, fbm(cp * 1.5 + 3.0));
          sky = mix(sky, deckCol, uOvercast * deck);
          // lightning lights the whole deck from inside
          sky += vec3(0.75, 0.8, 1.0) * uFlash * (0.4 + 0.6 * deck) * uOvercast;
          // snow sky: pale and soft
          sky = mix(sky, vec3(0.82, 0.86, 0.93) * (0.8 + 0.2 * fbm(cp)), uSnow * 0.5);
          gl_FragColor = vec4(sky, uAmt);
          #include <colorspace_fragment>
        }`,
    });
    const mesh = new Mesh(new PlaneGeometry(2, 2), mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = -9;
    return { mesh, mat };
  }, []);

  useFrame((state) => {
    const k = signals.skyward;
    mesh.visible = k > 0.01;
    if (!mesh.visible) return;
    const u = mat.uniforms;
    u.uAmt.value = Math.min(1, k * 1.3);
    u.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime;
    u.uAspect.value = size.width / size.height;
    // evening counts as starry too: the first stars are out overhead before they show at the horizon
    u.uStars.value = Math.max(env.stars, env.exposure < 0.3 && env.overcast < 0.5 ? 0.8 : 0);
    u.uOvercast.value = env.overcast > 0.6 ? 1 : env.overcast * 0.6;
    u.uFlash.value = env.flash;
    u.uExposure.value = env.exposure;
    u.uSnow.value = env.snowfall;
  });

  return <primitive object={mesh} />;
}
