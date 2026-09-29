"use client";

// Sky behind the city, driven entirely by lib/environment (so every weather preset works):
// gradient horizon → zenith, sun or moon, cloud streaks or an overcast deck, stars, and
// lightning bolts. Screen-space; the horizon tracks the far edge of the pin wall.
import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Mesh, PlaneGeometry, ShaderMaterial, Vector3 } from "three";
import { environment as env } from "@/lib/environment";

export function Sky({ wallH, amount }: { wallH: number; amount: () => number }) {
  const { camera, size } = useThree();
  const { mesh, material } = useMemo(() => {
    const material = new ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uAmt: { value: 1 },
        uHorizon: { value: 0.75 },
        uAspect: { value: 1 },
        uTime: { value: 0 },
        uBg: { value: new Color("#060a12") },
        uSkyHorizon: { value: env.skyHorizon },
        uSkyLow: { value: env.skyLow },
        uSkyMid: { value: env.skyMid },
        uSkyZenith: { value: env.skyZenith },
        uSunDisc: { value: env.sunDisc },
        uSunVisible: { value: env.sunVisible },
        uSunHeight: { value: env.sunHeight },
        uSunX: { value: env.sunX },
        uSunSize: { value: env.sunSize },
        uStars: { value: env.stars },
        uOvercast: { value: env.overcast },
        uFlash: { value: 0 },
        uBoltX: { value: 0.5 },
        uBoltSeed: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uAmt, uHorizon, uAspect, uTime;
        uniform vec3 uBg, uSkyHorizon, uSkyLow, uSkyMid, uSkyZenith, uSunDisc;
        uniform float uSunVisible, uSunX, uSunHeight, uSunSize, uStars, uOvercast, uFlash, uBoltX, uBoltSeed;
        varying vec2 vUv;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
        }
        float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }

        void main() {
          float y = vUv.y - uHorizon;
          vec3 sky = mix(uSkyHorizon, uSkyLow, smoothstep(0.0, 0.05, y));
          sky = mix(sky, uSkyMid, smoothstep(0.04, 0.16, y));
          sky = mix(sky, uSkyZenith, smoothstep(0.14, 0.4, y));

          // Sun (or moon), hidden behind overcast
          vec2 sp = vec2((vUv.x - uSunX) * uAspect, y - uSunHeight);
          float d = length(sp);
          float vis = uSunVisible * (1.0 - uOvercast * 0.9);
          sky += uSunDisc * smoothstep(uSunSize + 0.004, uSunSize, d) * 1.2 * vis;
          sky += uSunDisc * vec3(1.0, 0.7, 0.45) * exp(-d * 9.0) * 0.55 * vis;

          // Stars up high
          vec2 g = floor(vUv * vec2(160.0 * uAspect, 160.0));
          float star = step(0.9965, hash(g)) * (0.6 + 0.4 * sin(uTime * 2.0 + hash(g + 3.1) * 20.0));
          sky += vec3(0.8, 0.85, 1.0) * star * smoothstep(0.08, 0.35, y) * uStars * (1.0 - uOvercast);

          // Thin streaks on clear days; a rolling cloud deck when overcast
          float streak = smoothstep(0.012, 0.0, abs(y - 0.07 - 0.01 * sin(vUv.x * 9.0 + uTime * 0.05)))
                       * smoothstep(0.2, 0.6, sin(vUv.x * 13.0 + 1.3) * 0.5 + 0.5);
          sky = mix(sky, mix(uSkyLow, vec3(1.0), 0.35), streak * 0.45 * (1.0 - uOvercast));
          float deck = fbm(vec2(vUv.x * uAspect * 2.2 + uTime * 0.02, y * 5.0 - uTime * 0.01));
          vec3 cloudCol = mix(uSkyZenith * 1.4, uSkyLow * 1.1, smoothstep(0.35, 0.8, deck));
          sky = mix(sky, cloudCol, uOvercast * smoothstep(0.3, 0.55, deck) * smoothstep(-0.02, 0.06, y));

          // Lightning: the cloud deck lights up, and a jagged bolt drops to the horizon
          sky += vec3(0.7, 0.75, 0.95) * uFlash * 0.55 * smoothstep(0.3, 0.7, deck);
          float bx = uBoltX;
          float t = clamp(y / 0.35, 0.0, 1.0);
          float jag = (noise(vec2(t * 9.0, uBoltSeed)) - 0.5) * 0.08 + (noise(vec2(t * 30.0, uBoltSeed + 7.0)) - 0.5) * 0.02;
          float bolt = smoothstep(0.004, 0.0, abs((vUv.x - bx - jag) * uAspect)) * step(0.0, y) * step(y, 0.35);
          sky += vec3(0.9, 0.93, 1.0) * bolt * step(0.55, uFlash) * 2.0;

          gl_FragColor = vec4(mix(uBg, sky, uAmt), 1.0);
          #include <colorspace_fragment>
        }`,
    });
    const mesh = new Mesh(new PlaneGeometry(2, 2), material);
    mesh.frustumCulled = false;
    mesh.renderOrder = -10;
    return { mesh, material };
  }, []);

  const tmp = useMemo(() => new Vector3(), []);
  useFrame((state) => {
    const k = amount();
    mesh.visible = k > 0.01;
    if (!mesh.visible) return;
    tmp.set(camera.position.x, wallH * 0.47, 0).project(camera);
    const u = material.uniforms;
    u.uHorizon.value = Math.min(0.98, Math.max(0.3, tmp.y * 0.5 + 0.5));
    u.uAmt.value = k;
    u.uAspect.value = size.width / size.height;
    u.uTime.value = state.clock.elapsedTime;
    u.uSunVisible.value = env.sunVisible;
    // in About's skyward view the sun or moon hangs up and to the left, above the floating laptop
    u.uSunHeight.value = env.sunHeight;
    u.uSunX.value = env.sunX;
    u.uSunSize.value = env.sunSize;
    u.uStars.value = env.stars;
    u.uOvercast.value = env.overcast;
    // A new bolt position each time a flash starts
    if (env.flash > 0.55 && u.uFlash.value <= 0.55) {
      u.uBoltX.value = 0.25 + Math.random() * 0.6;
      u.uBoltSeed.value = Math.random() * 100;
    }
    u.uFlash.value = env.flash;
  });

  return <primitive object={mesh} />;
}
