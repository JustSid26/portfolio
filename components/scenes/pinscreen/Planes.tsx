"use client";

// Voxel aeroplanes crossing above the pin city: nav lights, a strobe, and a fading contrail.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  Points,
  ShaderMaterial,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useStore } from "@/lib/store";
import { environment as env } from "@/lib/environment";

const TRAIL = 70;
const FLIGHTS = [
  { heading: 0.32, alt: 1.75, speed: 1.0, offset: 0.0 },
  { heading: Math.PI + 0.18, alt: 2.05, speed: 0.8, offset: 0.45 },
  { heading: -0.55, alt: 1.6, speed: 1.15, offset: 0.75 },
];

const bodyMaterial = () =>
  new ShaderMaterial({
    uniforms: { uColor: { value: new Color("#c9d3df") }, uSunDir: { value: env.sunDir }, uSunCol: { value: env.sunColor }, uSkyCol: { value: env.skyColor } },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      void main() {
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uSunDir, uSunCol, uSkyCol;
      varying vec3 vN;
      void main() {
        vec3 n = normalize(vN);
        float d = max(dot(n, normalize(uSunDir)), 0.0);
        gl_FragColor = vec4(uColor * (uSkyCol * (0.6 + 0.3 * n.z) + uSunCol * 0.6 * d), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });

const trailMaterial = () =>
  new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uColor: { value: new Color("#bff8f2") } },
    vertexShader: /* glsl */ `
      attribute float aAge;
      varying float vAge;
      void main() {
        vAge = aAge;
        vec4 mv = viewMatrix * vec4(position, 1.0);
        gl_PointSize = (1.0 + (1.0 - aAge) * 5.0) * (10.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vAge;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * (1.0 - vAge) * 0.35;
        gl_FragColor = vec4(uColor * a, a);
      }`,
  });

function planeGeometry() {
  const parts = [
    new BoxGeometry(0.62, 0.09, 0.09), // fuselage (nose along +x)
    new BoxGeometry(0.16, 0.72, 0.025).translate(0.02, 0, 0), // wings
    new BoxGeometry(0.1, 0.26, 0.02).translate(-0.27, 0, 0.02), // tailplane
    new BoxGeometry(0.1, 0.02, 0.14).translate(-0.27, 0, 0.08), // fin
    new BoxGeometry(0.1, 0.05, 0.05).translate(0.04, 0.2, -0.05), // engines
    new BoxGeometry(0.1, 0.05, 0.05).translate(0.04, -0.2, -0.05),
  ];
  return mergeGeometries(parts)!;
}

export function Planes({ wallW, wallH, amount }: { wallW: number; wallH: number; amount: () => number }) {
  const reducedMotion = useStore((s) => s.reducedMotion);
  const root = useRef<Group>(null);

  const assets = useMemo(() => {
    const geo = planeGeometry();
    const body = bodyMaterial();
    const light = new BoxGeometry(0.05, 0.05, 0.05);
    const red = new MeshBasicMaterial({ color: new Color(2.2, 0.25, 0.3), toneMapped: false });
    const green = new MeshBasicMaterial({ color: new Color(0.3, 2.2, 0.9), toneMapped: false });
    const white = new MeshBasicMaterial({ color: new Color(2.5, 2.5, 2.5), toneMapped: false });
    const trailMat = trailMaterial();
    const flights = FLIGHTS.map(() => {
      const g = new Group();
      g.add(new Mesh(geo, body));
      const l = new Mesh(light, red);
      l.position.set(0.02, 0.37, 0);
      const r = new Mesh(light, green);
      r.position.set(0.02, -0.37, 0);
      const strobe = new Mesh(light, white);
      strobe.position.set(-0.3, 0, 0.16);
      g.add(l, r, strobe);
      const tg = new BufferGeometry();
      const pos = new Float32Array(TRAIL * 3);
      const age = new Float32Array(TRAIL).map((_, i) => i / (TRAIL - 1));
      tg.setAttribute("position", new BufferAttribute(pos, 3));
      tg.setAttribute("aAge", new BufferAttribute(age, 1));
      const trail = new Points(tg, trailMat);
      trail.frustumCulled = false;
      return { g, strobe, trail, pos, filled: false };
    });
    return { geo, body, light, red, green, white, trailMat, flights };
  }, []);

  useEffect(
    () => () => {
      const a = assets;
      [a.geo, a.light, ...a.flights.map((f) => f.trail.geometry)].forEach((g) => g.dispose());
      [a.body, a.red, a.green, a.white, a.trailMat].forEach((m) => m.dispose());
    },
    [assets],
  );

  const time = useRef(0);
  useFrame((_, rawDt) => {
    const k = amount();
    const g = root.current;
    if (!g) return;
    g.visible = k > 0.02;
    if (!g.visible) return;
    time.current += reducedMotion ? 0 : Math.min(rawDt, 1 / 30);
    const t = time.current;
    const span = wallW + 6;
    assets.flights.forEach((f, i) => {
      const fl = FLIGHTS[i];
      // Travel along the heading, wrapping across the city.
      const d = (((t * fl.speed) / span + fl.offset) % 1) * span - span / 2;
      const cx = Math.cos(fl.heading);
      const cy = Math.sin(fl.heading);
      const lateral = (i - 1) * wallH * 0.12 + wallH * 0.06;
      const x = cx * d - cy * lateral;
      const y = cy * d + cx * lateral + wallH * 0.05;
      const z = fl.alt + Math.sin(t * 0.6 + i) * 0.08;
      const jumped = f.filled && Math.hypot(f.g.position.x - x, f.g.position.y - y) > 1;
      f.g.position.set(x, y, z);
      f.g.rotation.set(Math.sin(t * 0.5 + i) * 0.12, 0, fl.heading);
      f.g.scale.setScalar(k * 0.55);
      f.strobe.visible = (t * 1.3 + i * 0.37) % 1 < 0.08;

      // Contrail: shift the ring of points, newest at the tail.
      const p = f.pos;
      if (!f.filled || jumped) {
        for (let j = 0; j < TRAIL; j++) p.set([x, y, z], j * 3);
        f.filled = true;
      } else {
        p.copyWithin(3, 0, (TRAIL - 1) * 3);
        p.set([x - cx * 0.32, y - cy * 0.32, z], 0);
      }
      (f.trail.geometry.attributes.position as BufferAttribute).needsUpdate = true;
    });
  });

  return (
    <group ref={root}>
      {assets.flights.map((f, i) => (
        <group key={i}>
          <primitive object={f.g} />
          <primitive object={f.trail} />
        </group>
      ))}
    </group>
  );
}
