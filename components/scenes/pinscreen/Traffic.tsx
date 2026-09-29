"use client";

// Real vehicles on the pin city: cars (sedans, hatchbacks, vans, taxis) on every lane and
// along the curved promenade, and multi-carriage local trains on the elevated lines.
// Each is one InstancedMesh; motion, heading and lights are computed in the vertex shader.
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedMesh,
  ShaderMaterial,
  Vector4,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { environment as env } from "@/lib/environment";
import { useStore } from "@/lib/store";
import type { Lane } from "./city";

type Rect = { x0: number; y0: number; x1: number; y1: number };
type Coast = { rows: number; cols: number; wallW: number; wallH: number };

// Tag every vertex of a part: 0 body, 1 glass, 2 headlight, 3 tail-light, 4 roof/stripe
const part = (g: BufferGeometry, id: number) => {
  g.setAttribute("aPart", new Float32BufferAttribute(new Array(g.attributes.position.count).fill(id), 1));
  return g.toNonIndexed();
};

// Car: nose along +x, units in metres-ish scaled to the pin grid (lane ≈ 0.05 wide).
function carGeometry() {
  const L = 0.085;
  const W = 0.036;
  return mergeGeometries([
    part(new BoxGeometry(L, W, 0.014).translate(0, 0, 0.011), 0), // chassis
    part(new BoxGeometry(L * 0.52, W * 0.9, 0.013).translate(-L * 0.06, 0, 0.0245), 1), // cabin glass
    part(new BoxGeometry(L * 0.48, W * 0.84, 0.003).translate(-L * 0.06, 0, 0.0315), 4), // roof
    // Lamps sit proud of the bonnet/boot so they read from the aerial camera too
    part(new BoxGeometry(0.008, W * 0.3, 0.006).translate(L / 2 - 0.003, W * 0.3, 0.016), 2), // headlights
    part(new BoxGeometry(0.008, W * 0.3, 0.006).translate(L / 2 - 0.003, -W * 0.3, 0.016), 2),
    part(new BoxGeometry(0.007, W * 0.34, 0.005).translate(-L / 2 + 0.003, W * 0.3, 0.017), 3), // tail-lights
    part(new BoxGeometry(0.007, W * 0.34, 0.005).translate(-L / 2 + 0.003, -W * 0.3, 0.017), 3),
    part(new BoxGeometry(0.07, W * 0.9, 0.001).translate(L / 2 + 0.04, 0, 0.0008), 6), // light pool on the road (night)
    part(new BoxGeometry(0.018, W * 1.04, 0.009).translate(L * 0.3, 0, 0.0055), 5), // wheels (dark)
    part(new BoxGeometry(0.018, W * 1.04, 0.009).translate(-L * 0.3, 0, 0.0055), 5),
  ])!;
}

// Train carriage: long, slab-sided, window band, lights on the ends.
function carriageGeometry() {
  const L = 0.2;
  const W = 0.042;
  return mergeGeometries([
    part(new BoxGeometry(L * 0.97, W, 0.034).translate(0, 0, 0.022), 0), // body
    part(new BoxGeometry(L * 0.9, W * 1.02, 0.011).translate(0, 0, 0.026), 1), // window band
    part(new BoxGeometry(L * 0.94, W * 0.7, 0.004).translate(0, 0, 0.041), 4), // roof
    part(new BoxGeometry(0.006, W * 0.6, 0.008).translate(L * 0.485, 0, 0.018), 2),
    part(new BoxGeometry(0.006, W * 0.6, 0.008).translate(-L * 0.485, 0, 0.018), 3),
  ])!;
}

const vertex = /* glsl */ `
attribute float aPart;
attribute vec4 aLane;   // axis (0 x, 1 y, 2 coast curve), coord, dir, speed
attribute vec3 aRange;  // min, max, phase 0..1
attribute vec3 aColor;
attribute float aSlot;  // carriage index within a train (0 for cars)
uniform float uTime;
uniform float uAmt;
uniform float uLen;     // vehicle pitch along the lane (carriages)
uniform vec4 uHide[5];  // footprints vehicles never enter (HQ, social towers)
uniform vec4 uCoast;    // rows, cols, wallW, wallH
uniform float uLift;
varying vec3 vN;
varying vec3 vCol;
varying float vPart;
varying vec3 vWorld;

float coastY(float x) {
  float cx = (x / uCoast.z + 0.5) * uCoast.y;
  float row = floor(uCoast.x * (0.87 + 0.055 * cos((cx / uCoast.y - 0.42) * 3.14159 * 1.5)));
  return ((row + 0.5) / uCoast.x - 0.5) * uCoast.w;
}

void main() {
  float axis = aLane.x, coord = aLane.y, dir = aLane.z, speed = aLane.w;
  float len = aRange.y - aRange.x;
  float along = aRange.x + mod(aRange.z * len + dir * uTime * speed - aSlot * uLen * dir, len);
  vec2 p;
  vec2 fwd;
  if (axis < 0.5) { p = vec2(along, coord); fwd = vec2(dir, 0.0); }
  else if (axis < 1.5) { p = vec2(coord, along); fwd = vec2(0.0, dir); }
  else {
    // Promenade: ride the coast curve, 1 or 2 pins inland
    float y0 = coastY(along) + coord * uCoast.w / uCoast.x;
    float y1 = coastY(along + 0.05 * dir) + coord * uCoast.w / uCoast.x;
    p = vec2(along, y0);
    fwd = normalize(vec2(0.05 * dir, y1 - y0));
  }
  vec2 side = vec2(-fwd.y, fwd.x);

  float hidden = 0.0;
  for (int i = 0; i < 5; i++) {
    vec4 r = uHide[i];
    hidden += step(r.x, p.x) * step(p.x, r.z) * step(r.y, p.y) * step(p.y, r.w);
  }
  // Fade out at lane ends so vehicles don't pop.
  float edge = smoothstep(0.0, 0.25, min(along - aRange.x, aRange.y - along));
  float s = uAmt * edge * (1.0 - step(0.5, hidden));

  vec3 lp = position * s;
  vec3 world = vec3(p + fwd * lp.x + side * lp.y, lp.z + uLift);
  vN = vec3(fwd * normal.x + side * normal.y, normal.z);
  vCol = aColor;
  vPart = aPart;
  vWorld = world;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`;

const fragment = /* glsl */ `
uniform vec3 uSunDir, uSunCol, uSkyCol;
uniform float uExposure, uFlash, uWet;
uniform vec3 uGlow;     // train window glow
varying vec3 vN;
varying vec3 vCol;
varying float vPart;
varying vec3 vWorld;
void main() {
  vec3 n = normalize(vN);
  float d = max(dot(n, normalize(uSunDir)), 0.0);
  vec3 light = uSkyCol * (0.45 + 0.4 * n.z) + uSunCol * d * mix(0.5, 1.0, uExposure) + vec3(0.75, 0.8, 1.0) * uFlash * 1.5;
  float night = 1.0 - smoothstep(0.1, 0.7, uExposure);
  vec3 c;
  float p = floor(vPart + 0.5);
  if (p < 0.5) c = vCol * light;                                   // paint
  else if (p < 1.5) c = mix(vec3(0.04, 0.06, 0.09) * light + uSkyCol * 0.25, uGlow, step(0.5, uGlow.r + uGlow.g));  // glass / lit windows
  else if (p < 2.5) c = vec3(1.0, 0.97, 0.88) * (1.2 + night * 1.8); // headlights
  else if (p < 3.5) c = vec3(1.0, 0.12, 0.14) * (0.9 + night * 1.4); // tail-lights
  else if (p < 4.5) c = vCol * light * 1.08;                        // roof
  else if (p < 5.5) c = vec3(0.02) * light;                        // tyres
  else {
    // headlight pool: only after dark, fading away from the car
    if (night < 0.05) discard;
    c = vec3(1.0, 0.86, 0.6) * night * 0.55;
  }
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const CAR_COLORS = ["#e9ecef", "#1d2127", "#8a939e", "#b8212f", "#1f4f9c", "#c7cdd4", "#2c6e49", "#f2c230"];
const TAXI = "#f5c518"; // Mumbai kaali-peeli roof is yellow over black
const TRAIN_COLORS = ["#8a2d6b", "#d8d2c4"]; // local-train maroon & cream

function laneAttrs(lanes: Lane[], perLane: (l: Lane) => number, speed: (l: Lane, r: number) => number, slots = 1) {
  const L: number[] = [];
  const R: number[] = [];
  const C: number[] = [];
  const S: number[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const col = new Color();
  for (const l of lanes) {
    const n = perLane(l);
    for (let i = 0; i < n; i++) {
      const r = rnd();
      const sp = speed(l, r);
      const phase = (i + rnd() * 0.5) / n;
      const pick = rnd();
      const taxi = pick < 0.14;
      col.set(slots > 1 ? TRAIN_COLORS[0] : taxi ? TAXI : CAR_COLORS[Math.floor(rnd() * CAR_COLORS.length)]);
      for (let k = 0; k < slots; k++) {
        L.push(l.axis, l.coord, l.dir, sp);
        R.push(l.min, l.max, phase);
        if (slots > 1) col.set(TRAIN_COLORS[k % 2 === 0 ? 0 : 1]);
        C.push(col.r, col.g, col.b);
        S.push(k);
      }
    }
  }
  return { L, R, C, S, count: S.length };
}

function makeMesh(geo: BufferGeometry, a: ReturnType<typeof laneAttrs>, uniforms: Record<string, { value: unknown }>) {
  const g = geo.clone();
  g.setAttribute("aLane", new InstancedBufferAttribute(new Float32Array(a.L), 4));
  g.setAttribute("aRange", new InstancedBufferAttribute(new Float32Array(a.R), 3));
  g.setAttribute("aColor", new InstancedBufferAttribute(new Float32Array(a.C), 3));
  g.setAttribute("aSlot", new InstancedBufferAttribute(new Float32Array(a.S), 1));
  const m = new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms });
  const mesh = new InstancedMesh(g, m, a.count);
  mesh.frustumCulled = false;
  return mesh;
}

export function Traffic({
  lanes,
  rails,
  coast,
  hide,
  amount,
}: {
  lanes: Lane[];
  rails: Lane[];
  coast: Coast;
  hide: Rect[];
  amount: () => number;
}) {
  const lowPower = useStore((s) => s.lowPower);
  const reducedMotion = useStore((s) => s.reducedMotion);

  const { cars, trains, geos } = useMemo(() => {
    const shared = () => ({
      uTime: { value: 0 },
      uAmt: { value: 1 },
      uHide: { value: Array.from({ length: 5 }, (_, i) => (hide[i] ? new Vector4(hide[i].x0, hide[i].y0, hide[i].x1, hide[i].y1) : new Vector4(9, 9, 9, 9))) },
      uCoast: { value: new Vector4(coast.rows, coast.cols, coast.wallW, coast.wallH) },
      uSunDir: { value: env.sunDir },
      uSunCol: { value: env.sunColor },
      uSkyCol: { value: env.skyColor },
      uExposure: { value: env.exposure },
      uFlash: { value: 0 },
      uWet: { value: 0 },
    });
    const carGeo = carGeometry();
    const trainGeo = carriageGeometry();
    const density = lowPower ? 0.45 : 1;
    const carA = laneAttrs(
      lanes,
      (l) => Math.max(1, Math.round(((l.max - l.min) / (l.axis === 2 ? 0.28 : 0.42)) * density)),
      (l, r) => (l.axis === 2 ? 0.55 : 0.35 + r * 0.45),
    );
    const trainA = laneAttrs(rails, () => 2, () => 0.9, 6);
    const cars = makeMesh(carGeo, carA, { ...shared(), uLen: { value: 0 }, uLift: { value: 0 }, uGlow: { value: new Color(0, 0, 0) } });
    // Trains ride on top of the viaduct pins (0.08 high) and glow from inside at dusk.
    const trains = makeMesh(trainGeo, trainA, { ...shared(), uLen: { value: 0.205 }, uLift: { value: 0.08 }, uGlow: { value: new Color(0, 0, 0) } });
    return { cars, trains, geos: [carGeo, trainGeo] };
  }, [lanes, rails, coast, hide, lowPower]);

  useEffect(
    () => () => {
      [cars, trains].forEach((m) => {
        m.geometry.dispose();
        (m.material as ShaderMaterial).dispose();
      });
      geos.forEach((g) => g.dispose());
    },
    [cars, trains, geos],
  );

  useFrame((state) => {
    const k = amount();
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    const glow = 1 - Math.min(1, Math.max(0, (env.exposure - 0.1) / 0.5));
    for (const m of [cars, trains]) {
      m.visible = k > 0.02;
      const u = (m.material as ShaderMaterial).uniforms;
      u.uTime.value = t;
      u.uAmt.value = k;
      u.uExposure.value = env.exposure;
      u.uFlash.value = env.flash;
      u.uWet.value = env.wetness;
    }
    // Train window band glows warm once it gets dark.
    ((trains.material as ShaderMaterial).uniforms.uGlow.value as Color).setRGB(1.0 * glow, 0.85 * glow, 0.55 * glow);
  });

  return (
    <>
      <primitive object={cars} />
      <primitive object={trains} />
    </>
  );
}
