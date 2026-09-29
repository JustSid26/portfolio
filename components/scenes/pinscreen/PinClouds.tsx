"use client";

// Contact: a cloud made of pins floats above each social tower. The pins gather into a puffy
// shape as Contact arrives, the cloud bobs and always faces the camera, and its message (real DOM
// text, see ContactClouds.tsx) is pinned to the cloud's centre on screen.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BoxGeometry, Group, InstancedBufferAttribute, InstancedMesh, ShaderMaterial, Vector3 } from "three";
import { environment as env } from "@/lib/environment";
import { signals } from "@/lib/signals";
import { useStore } from "@/lib/store";

const S = 0.06; // pin pitch
const W = 2.5;
const H = 0.62;

function cloudPins(seed0: number) {
  let seed = seed0;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  // a body of overlapping puffs on a flat base, plus a little tail pointing at the tower
  const puffs: [number, number, number][] = [
    [-0.85, -0.02, 0.28], [-0.45, 0.1, 0.36], [0.0, 0.14, 0.4], [0.45, 0.08, 0.36], [0.85, -0.03, 0.27], [0.0, -0.06, 0.34],
  ];
  const pos: number[] = [];
  const rand: number[] = [];
  for (let x = -W / 2; x <= W / 2; x += S)
    for (let y = -H / 2; y <= H / 2 + 0.25; y += S)
      for (let z = -0.2; z <= 0.2; z += S) {
        let inside = false;
        for (const [px, py, r] of puffs) {
          const d = Math.hypot((x - px) / 1.1, y - py, z / 0.55);
          if (d < r && y > -0.2) inside = true;
        }
        // flat underside
        if (y < -0.2) inside = false;
        // tail
        if (Math.abs(x) < 0.07 && y < -0.2 && y > -0.36 && Math.abs(z) < 0.06 && Math.abs(x) < 0.07 - (-0.2 - y) * 0.3) inside = true;
        if (inside) {
          pos.push(x, y, z);
          rand.push(rnd());
        }
      }
  return { pos: new Float32Array(pos), rand: new Float32Array(rand), count: rand.length };
}

const vertex = /* glsl */ `
attribute vec3 aPos; attribute float aRand;
uniform float uIn, uTime;
varying vec3 vN; varying float vY;
void main() {
  float t = clamp(uIn * 1.6 - aRand * 0.6, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - t, 3.0);
  vec3 p = aPos * (0.4 + 0.6 * e) + vec3(0.0, (1.0 - e) * 0.5, 0.0);
  p += vec3(sin(uTime * 0.8 + aRand * 20.0), cos(uTime * 0.7 + aRand * 13.0), 0.0) * 0.004;
  vN = normalize(mat3(modelMatrix) * normal);
  vY = aPos.y;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p + position * e, 1.0);
}`;
const fragment = /* glsl */ `
uniform vec3 uSunDir, uSunCol, uSkyCol;
varying vec3 vN; varying float vY;
void main() {
  vec3 n = normalize(vN);
  float d = max(dot(n, normalize(uSunDir)), 0.0);
  // clouds stay bright enough to read the message on, day or night; tops brighter than bellies
  vec3 base = vec3(0.97, 0.96, 1.0);
  vec3 lit = base * (0.72 + 0.18 * smoothstep(-0.2, 0.3, vY)) + uSunCol * d * 0.08 + uSkyCol * 0.08;
  gl_FragColor = vec4(lit, 1.0);
  #include <colorspace_fragment>
}`;

export function PinClouds({ anchors, amount }: { anchors: Vector3[]; amount: () => number }) {
  const { camera, size } = useThree();
  const reducedMotion = useStore((s) => s.reducedMotion);
  const groups = useRef<(Group | null)[]>([]);

  const clouds = useMemo(
    () =>
      anchors.map((_, i) => {
        const c = cloudPins(11 + i * 97);
        const g = new BoxGeometry(S * 0.9, S * 0.9, S * 0.9);
        g.setAttribute("aPos", new InstancedBufferAttribute(c.pos, 3));
        g.setAttribute("aRand", new InstancedBufferAttribute(c.rand, 1));
        const m = new ShaderMaterial({
          vertexShader: vertex,
          fragmentShader: fragment,
          uniforms: { uIn: { value: 0 }, uTime: { value: 0 }, uSunDir: { value: env.sunDir }, uSunCol: { value: env.sunColor }, uSkyCol: { value: env.skyColor } },
        });
        const mesh = new InstancedMesh(g, m, c.count);
        mesh.frustumCulled = false;
        mesh.renderOrder = 30;
        return { mesh, m, g };
      }),
    [anchors],
  );
  useEffect(() => () => clouds.forEach((c) => (c.g.dispose(), c.m.dispose())), [clouds]);

  const tmp = useMemo(() => new Vector3(), []);
  const inn = useRef(0);
  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const k = amount();
    inn.current += (k - inn.current) * Math.min(1, dt * (reducedMotion ? 60 : 3));
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    clouds.forEach((c, i) => {
      const g = groups.current[i];
      if (!g) return;
      g.visible = inn.current > 0.02;
      const a = anchors[i];
      g.position.set(a.x + Math.sin(t * 0.3 + i) * 0.08, a.y, a.z + Math.sin(t * 0.9 + i * 1.7) * 0.05);
      g.quaternion.copy(camera.quaternion);
      g.scale.setScalar(size.width < size.height ? 0.55 : 1);
      c.m.uniforms.uIn.value = reducedMotion ? (k > 0.5 ? 1 : 0) : inn.current;
      c.m.uniforms.uTime.value = t;
      // where the cloud's centre is on screen, for its message
      tmp.copy(g.position).project(camera);
      const out = signals.cloudScreen[i];
      if (out) {
        out.x = (tmp.x * 0.5 + 0.5) * size.width;
        out.y = (-tmp.y * 0.5 + 0.5) * size.height;
        out.on = inn.current > 0.6 && tmp.z < 1;
      }
    });
  });

  return (
    <>
      {clouds.map((c, i) => (
        <group key={i} ref={(el) => { groups.current[i] = el; }}>
          <primitive object={c.mesh} />
        </group>
      ))}
    </>
  );
}
