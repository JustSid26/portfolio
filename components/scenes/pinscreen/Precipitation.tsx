"use client";

// Rain streaks and snowflakes falling over the pin city. One draw call each; all motion in
// the vertex shader. Amounts come from lib/environment (rain / snowfall), so they fade with
// weather transitions.
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, LineSegments, NormalBlending, Points, ShaderMaterial } from "three";
import { environment as env } from "@/lib/environment";
import { useStore } from "@/lib/store";

const TOP = 4.2; // fall from this height to the ground

function seedAttr(count: number, verts: number, wallW: number, wallH: number) {
  const pos = new Float32Array(count * verts * 3);
  const end = new Float32Array(count * verts);
  const rnd = new Float32Array(count * verts);
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * wallW * 1.1;
    const y = (Math.random() - 0.5) * wallH * 1.1;
    const z = Math.random() * TOP;
    const r = Math.random();
    for (let v = 0; v < verts; v++) {
      pos.set([x, y, z], (i * verts + v) * 3);
      end[i * verts + v] = v;
      rnd[i * verts + v] = r;
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(pos, 3));
  g.setAttribute("aEnd", new BufferAttribute(end, 1));
  g.setAttribute("aRnd", new BufferAttribute(rnd, 1));
  return g;
}

export function Precipitation({ wallW, wallH, amount }: { wallW: number; wallH: number; amount: () => number }) {
  const lowPower = useStore((s) => s.lowPower);
  const reducedMotion = useStore((s) => s.reducedMotion);

  const { rain, snow } = useMemo(() => {
    const rainMat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uAmt: { value: 0 }, uFlash: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float aEnd; attribute float aRnd;
        uniform float uTime;
        varying float vA; varying float vEnd;
        void main() {
          vec3 p = position;
          float speed = 7.0 + aRnd * 3.0;
          p.z = mod(p.z - uTime * speed, ${TOP.toFixed(1)});
          // wind slant; the tail trails up and back
          p.x += p.z * 0.18;
          p += aEnd * vec3(0.03, 0.0, 0.22);
          vA = step(aRnd, 1.0); vEnd = aEnd;
          gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uAmt; uniform float uFlash;
        varying float vEnd;
        void main() {
          float a = (1.0 - vEnd) * 0.5 * uAmt;
          gl_FragColor = vec4(vec3(0.7, 0.78, 0.9) * (1.0 + uFlash * 2.0) * a, a);
        }`,
    });
    const snowMat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: NormalBlending,
      uniforms: { uTime: { value: 0 }, uAmt: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float aRnd;
        uniform float uTime;
        void main() {
          vec3 p = position;
          p.z = mod(p.z - uTime * (0.45 + aRnd * 0.35), ${TOP.toFixed(1)});
          p.x += sin(uTime * (0.6 + aRnd) + aRnd * 40.0) * 0.12;
          p.y += cos(uTime * (0.4 + aRnd) + aRnd * 17.0) * 0.08;
          vec4 mv = viewMatrix * vec4(p, 1.0);
          gl_PointSize = (2.0 + aRnd * 3.0) * (12.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uAmt;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.15, d) * 0.9 * uAmt;
          gl_FragColor = vec4(vec3(0.97, 0.98, 1.0), a);
        }`,
    });
    const rainCount = lowPower ? 2200 : 7000;
    const snowCount = lowPower ? 1800 : 5000;
    const rain = new LineSegments(seedAttr(rainCount, 2, wallW, wallH), rainMat);
    const snow = new Points(seedAttr(snowCount, 1, wallW, wallH), snowMat);
    rain.frustumCulled = snow.frustumCulled = false;
    rain.renderOrder = snow.renderOrder = 5;
    return { rain, snow };
  }, [lowPower, wallW, wallH]);

  useEffect(
    () => () => {
      rain.geometry.dispose();
      (rain.material as ShaderMaterial).dispose();
      snow.geometry.dispose();
      (snow.material as ShaderMaterial).dispose();
    },
    [rain, snow],
  );

  useFrame((state) => {
    const k = amount();
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    const rm = rain.material as ShaderMaterial;
    const sm = snow.material as ShaderMaterial;
    rain.visible = env.rain * k > 0.01;
    snow.visible = env.snowfall * k > 0.01;
    rm.uniforms.uTime.value = t;
    rm.uniforms.uAmt.value = env.rain * k;
    rm.uniforms.uFlash.value = env.flash;
    sm.uniforms.uTime.value = t;
    sm.uniforms.uAmt.value = env.snowfall * k;
  });

  return (
    <>
      <primitive object={rain} />
      <primitive object={snow} />
    </>
  );
}
