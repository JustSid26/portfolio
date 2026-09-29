"use client";

// Tool trucks: each one hauls a language/tool from content/projects.ts along the HQ's access
// roads, drives into the SL tower, and a moment later another rolls out the other side.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { site } from "@/content/projects";
import { useStore } from "@/lib/store";
import { environment as env } from "@/lib/environment";
import type { TruckRoad } from "./city";

type Box = { x0: number; x1: number; y0: number; y1: number };

const shade = (color: string) =>
  new ShaderMaterial({
    uniforms: { uColor: { value: new Color(color) }, uSunDir: { value: env.sunDir }, uSunCol: { value: env.sunColor }, uSkyCol: { value: env.skyColor } },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      void main() { vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uSunDir, uSunCol, uSkyCol; varying vec3 vN;
      void main() {
        vec3 n = normalize(vN);
        vec3 c = uColor * (uSkyCol * (0.5 + 0.4 * n.z) + uSunCol * 0.9 * max(dot(n, normalize(uSunDir)), 0.0));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });

function labelTexture(text: string) {
  const c = document.createElement("canvas");
  const font = getComputedStyle(document.documentElement).getPropertyValue("--f-jetbrains").trim() || "monospace";
  const ctx = c.getContext("2d")!;
  ctx.font = `600 44px ${font}`;
  const w = Math.ceil(ctx.measureText(text).width) + 56;
  c.width = w;
  c.height = 72;
  ctx.font = `600 44px ${font}`;
  ctx.fillStyle = "rgba(6,10,18,0.82)";
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, 68, 34);
  ctx.fill();
  ctx.strokeStyle = "#3cf0e0";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#3cf0e0";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 28, 38);
  const t = new CanvasTexture(c);
  t.minFilter = LinearFilter;
  t.generateMipmaps = false;
  return { t, aspect: w / 72 };
}

export function Trucks({ roads, hq, amount }: { roads: TruckRoad[]; hq: Box; amount: () => number }) {
  const reducedMotion = useStore((s) => s.reducedMotion);
  const root = useRef<Group>(null);

  const fleet = useMemo(() => {
    const cab = new BoxGeometry(0.07, 0.055, 0.05).translate(0.1, 0, 0.025);
    const box = new BoxGeometry(0.15, 0.06, 0.065).translate(0, 0, 0.0325);
    const wheels = new BoxGeometry(0.2, 0.062, 0.012).translate(0.02, 0, 0.006);
    const body = mergeGeometries([cab, wheels])!;
    const cabMat = shade("#d9dde3");
    const lamp = new MeshBasicMaterial({ color: new Color(2, 2, 1.8), toneMapped: false });
    const lampGeo = new BoxGeometry(0.01, 0.05, 0.015).translate(0.137, 0, 0.02);
    const containerColors = ["#3cf0e0", "#9d7bff", "#ffb36b", "#ff6f91", "#7cc4ff"];
    const trucks = site.tools.map((tool, i) => {
      const g = new Group();
      const container = new Mesh(box, shade(containerColors[i % containerColors.length]));
      g.add(new Mesh(body, cabMat), container, new Mesh(lampGeo, lamp));
      const { t, aspect } = labelTexture(tool);
      const sprite = new Sprite(new SpriteMaterial({ map: t, depthTest: false, transparent: true }));
      sprite.scale.set(0.15 * aspect, 0.15, 1);
      sprite.position.set(0, 0, 0.28);
      sprite.renderOrder = 20;
      g.add(sprite);
      const road = roads[i % roads.length];
      const dir = Math.floor(i / roads.length) % 2 === 0 ? 1 : -1;
      return { g, sprite, container, road, dir, phase: i / site.tools.length, speed: 0.55 + (i % 3) * 0.08 };
    });
    return { trucks, cab, box, wheels, body, cabMat, lamp, lampGeo };
  }, [roads]);

  useEffect(
    () => () => {
      const f = fleet;
      [f.cab, f.box, f.wheels, f.body, f.lampGeo].forEach((g) => g.dispose());
      f.cabMat.dispose();
      f.lamp.dispose();
      f.trucks.forEach((t) => {
        (t.container.material as ShaderMaterial).dispose();
        t.sprite.material.map?.dispose();
        t.sprite.material.dispose();
      });
    },
    [fleet],
  );

  const time = useRef(0);
  useFrame((_, rawDt) => {
    const k = amount();
    const g = root.current;
    if (!g) return;
    g.visible = k > 0.05;
    if (!g.visible) return;
    time.current += reducedMotion ? 0 : Math.min(rawDt, 1 / 30);
    fleet.trucks.forEach((t) => {
      const [a0, a1] = t.road.along;
      const len = a1 - a0;
      const u = (time.current * t.speed) / len + t.phase;
      const s = t.dir > 0 ? a0 + (u % 1) * len : a1 - (u % 1) * len;
      // Keep right: eastbound/northbound in lane 0, the return in lane 1.
      const lane = t.road.lane[t.dir > 0 ? 0 : 1];
      const x = t.road.axis === "x" ? s : lane;
      const y = t.road.axis === "x" ? lane : s;
      t.g.position.set(x, y, 0.012);
      t.g.rotation.z = t.road.axis === "x" ? (t.dir > 0 ? 0 : Math.PI) : t.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      // Inside the HQ footprint: the truck is in the loading bay — hidden.
      const inside = x > hq.x0 && x < hq.x1 && y > hq.y0 && y < hq.y1;
      const edge = Math.min(Math.abs(s - a0), Math.abs(a1 - s));
      const fade = Math.min(1, edge / 0.6);
      t.g.visible = !inside;
      t.g.scale.setScalar(k * fade);
      // Labels only near the HQ, so the foreground never fills with tags.
      const cx = (hq.x0 + hq.x1) / 2;
      const cy = (hq.y0 + hq.y1) / 2;
      // …and never in the foreground below the HQ, where the hero copy sits.
      const behind = Math.min(1, Math.max(0, (y - (hq.y0 - 0.6)) / 0.4));
      const near = behind * (1 - Math.min(1, Math.max(0, (Math.abs(x - cx) - 2.2) / 1.2)));
      void cy;
      t.sprite.material.opacity = k * fade * near;
      t.sprite.visible = near > 0.01;
    });
  });

  return (
    <group ref={root}>
      {fleet.trucks.map((t, i) => (
        <primitive key={i} object={t.g} />
      ))}
    </group>
  );
}
