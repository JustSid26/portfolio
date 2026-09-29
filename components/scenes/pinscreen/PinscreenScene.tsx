"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  HalfFloatType,
  InstancedBufferAttribute,
  InstancedMesh,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  RGBAFormat,
  Ray,
  Plane,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  VideoTexture,
  SRGBColorSpace,
  WebGLRenderTarget,
  type Texture,
} from "three";
import { useStore } from "@/lib/store";
import { signals, readRect } from "@/lib/signals";
import { damp, readInputs, rectToWorld, smoothstep, useProjectTextures, PROJECT_COUNT } from "../shared";
import { pinFragment, pinVertex, simFragment, simVertex } from "./shaders";
import { makeModelTextures } from "./models";
import { generateCity } from "./city";
import { Planes } from "./Planes";
import { Sky } from "./Sky";
import { Trucks } from "./Trucks";
import { PinClouds } from "./PinClouds";
import { Zenith } from "./Zenith";
import { PinBillboard, SCREEN_BOTTOM, SCREEN_H } from "./PinBillboard";
import { Precipitation } from "./Precipitation";
import { Traffic } from "./Traffic";
import { ParkLamps } from "./ParkLamps";
import { environment } from "@/lib/environment";
import { LANDMARKS, makeLogoAtlas } from "./landmarks";
import { projects } from "@/content/projects";

const WALL_H = 13;
const DEPTH = 2.0; // long enough that tall model pins never lift off the wall
const FRONT_Z = 10; // frontal camera distance: DOM rects are mapped with this pose

function makeGlyph(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, c.width, c.height);
  const family = getComputedStyle(document.documentElement).getPropertyValue("--f-archivo").trim() || "sans-serif";
  ctx.filter = "blur(2px)";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Canvas font-stretch keyword gives us the same expanded cut as the DOM.
  (ctx as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = "expanded";
  ctx.font = `600 430px ${family}`; // lighter cut keeps the S counters open as architecture
  ctx.fillText("SL", c.width / 2, c.height / 2 + 20);
  const t = new CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

export function PinscreenScene() {
  const { gl, size, camera, scene } = useThree();
  const lowPower = useStore((s) => s.lowPower);
  const textures = useProjectTextures();
  const cam = camera as PerspectiveCamera;
  const models = useMemo(() => makeModelTextures(projects, textures), [textures]);
  const accents = useMemo(() => projects.map((p) => new Color(p.accent ?? "#3cf0e0")), []);
  useEffect(() => () => models.forEach((m) => m.dispose()), [models]);

  // Wall dimensions follow the viewport aspect so portrait phones don't waste pins.
  const layout = useMemo(() => {
    const aspect = size.width / size.height;
    const wallW = Math.max(8, WALL_H * aspect * 1.15);
    // Fine pins read as architecture; phones get a coarser grid to hold frame rate.
    const spacing = lowPower ? 0.075 : 0.05;
    const cols = Math.round(wallW / spacing);
    const rows = Math.round(WALL_H / spacing);
    // Where the hero "SL" sits (same maths as the per-frame glyph rect) — the city keeps it clear.
    const visW = 2 * Math.tan((35 * Math.PI) / 360) * FRONT_Z * aspect;
    const gw = Math.min(0.5, (0.6 * visW) / wallW);
    const gh = (gw * wallW) / 2 / WALL_H;
    const gx = 0.5 - gw / 2 + (aspect > 1 ? 0.03 : 0);
    const plaza = { x0: gx + gw * 0.08, y0: 0.555 + gh * 0.12, x1: gx + gw * 0.92, y1: 0.555 + gh * 0.88 };
    // Social skyscrapers, placed in glyph-rect units around the HQ.
    // Portrait: pull them in and widen them so the logos stay legible on a phone.
    const portrait = aspect < 1;
    const landmarks = LANDMARKS.map((l) => {
      const cx = portrait ? 0.5 + (l.cx - 0.5) * 0.7 : l.cx;
      const w = portrait ? l.w * 1.45 : l.w;
      return {
      x0: gx + (cx - w / 2) * gw,
      x1: gx + (cx + w / 2) * gw,
      y0: 0.555 + (l.cy - l.d / 2) * gh,
      y1: 0.555 + (l.cy + l.d / 2) * gh,
      };
    });
    return { wallW, wallH: WALL_H, spacing, cols, rows, plaza, landmarks };
    // Recompute only on big aspect changes (orientation), not every resize.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lowPower, size.width / size.height > 1]);

  const city = useMemo(() => {
    const c = generateCity(layout.cols, layout.rows, layout.plaza, layout.spacing, layout.wallW, layout.wallH, layout.landmarks);
    signals.city = c.stats;
    return c;
  }, [layout]);
  useEffect(() => () => city.texture.dispose(), [city]);
  // SL HQ footprint in world units (the trucks' loading bay).
  const hqBox = useMemo(() => {
    const { plaza, wallW, wallH } = layout;
    return {
      x0: (plaza.x0 - 0.5) * wallW,
      x1: (plaza.x1 - 0.5) * wallW,
      y0: (plaza.y0 - 0.5) * wallH,
      y1: (plaza.y1 - 0.5) * wallH,
    };
  }, [layout]);
  // Work's billboard: beside the north–south road nearest x ≈ −1.3, in the low-rise foreground,
  // turned to face the street-level camera that looks at it.
  const board = useMemo(() => {
    // right of centre, so in the hero it stands clear of the name (bottom-left)
    const roads = city.lanes.filter((l) => l.axis === 1);
    const road = roads.reduce((m, l) => (Math.abs(l.coord - 1.5) < Math.abs(m.coord - 1.5) ? l : m), roads[0]);
    const at = new Vector3((road?.coord ?? 1.5) + 0.22, -2.9, 0);
    const camAt = new Vector3(at.x + 0.7, at.y - 4.1, 0.95);
    const yaw = Math.atan2(camAt.x - at.x, -(camAt.y - at.y));
    return { at, camAt, yaw };
  }, [city]);

  // Contact clouds float above each social tower
  const cloudAnchors = useMemo(
    () =>
      layout.landmarks.map((r, i) => new Vector3(((r.x0 + r.x1) / 2 - 0.5) * layout.wallW, (r.y0 - 0.5) * layout.wallH, LANDMARKS[i].height + 0.5)),
    [layout],
  );

  // Footprints vehicles never drive through: the HQ and the four social towers.
  const noGo = useMemo(
    () => [
      hqBox,
      ...layout.landmarks.map((r) => ({
        x0: (r.x0 - 0.5) * layout.wallW - 0.06,
        x1: (r.x1 - 0.5) * layout.wallW + 0.06,
        y0: (r.y0 - 0.5) * layout.wallH - 0.06,
        y1: (r.y1 - 0.5) * layout.wallH + 0.06,
      })),
    ],
    [hqBox, layout],
  );

  // Ping-pong spring simulation.
  const sim = useMemo(() => {
    const opts = { type: HalfFloatType, format: RGBAFormat, minFilter: NearestFilter, magFilter: NearestFilter, depthBuffer: false };
    const a = new WebGLRenderTarget(layout.cols, layout.rows, opts);
    const b = new WebGLRenderTarget(layout.cols, layout.rows, opts);
    const material = new ShaderMaterial({
      vertexShader: simVertex,
      fragmentShader: simFragment,
      uniforms: {
        uState: { value: a.texture },
        uDt: { value: 0.016 },
        uTime: { value: 0 },
        uSnap: { value: 0 },
        uWall: { value: new Vector2(layout.wallW, layout.wallH) },
        uPointer: { value: new Vector2(99, 99) },
        uPointerForce: { value: 0 },
        uIntro: { value: 0 },
        uHero: { value: 1 },
        uWork: { value: 0 },
        uAbout: { value: 0 },
        uContact: { value: 0 },
        uCase: { value: 0 },
        uLeave: { value: 0 },
        uHover: { value: 0 },
        uMix: { value: 0 },
        uGlyph: { value: null as Texture | null },
        uGlyphRect: { value: new Vector4(0.3, 0.5, 0.52, 0.24) },
        uFrame: { value: new Vector4(-1, -1, -1, -1) },
        uAboutRect: { value: new Vector4(-1, -1, -1, -1) },
        uAboutPointer: { value: new Vector2() },
        uContactCenter: { value: new Vector2(0, -0.9) },
        uTexA: { value: textures[0] },
        uTexB: { value: textures[1] },
        uTexCase: { value: textures[0] },
        uCaseScroll: { value: 0 },
        uModelA: { value: models[0] },
        uModelB: { value: models[1] },
        uCaseModel: { value: models[0] },
        uFlat: { value: 0 },
        uCity: { value: city.texture },
        uCityAmt: { value: 1 },
        uLoad: { value: 0 },
        uDims: { value: new Vector2(layout.cols, layout.rows) },
        uLand: { value: layout.landmarks.map((r) => new Vector4(r.x0, r.y0, r.x1, r.y1)) },
        uLandH: { value: LANDMARKS.map((l) => l.height) },
        uLandF: { value: LANDMARKS.map((l) => l.front) },
        uLandType: { value: LANDMARKS.map((l) => l.type) },
      },
      depthTest: false,
      depthWrite: false,
    });
    const quad = new Mesh(new PlaneGeometry(2, 2), material);
    const simScene = new Scene();
    simScene.add(quad);
    const simCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return { a, b, material, simScene, simCam, read: a, write: b };
  }, [layout, textures, models, city]);

  // Pins
  const logos = useMemo(() => makeLogoAtlas(), []);
  useEffect(() => () => logos.dispose(), [logos]);

  const pins = useMemo(() => {
    const { cols, rows, spacing } = layout;
    const s = spacing * 0.93;
    const box = new BoxGeometry(s, s, DEPTH);
    box.translate(0, 0, -DEPTH / 2); // front face sits at z = 0
    // Drop the back face (never visible): 20 verts / 10 tris per pin instead of 24 / 12.
    const geo = box; // face order: +x −x +y −y +z −z
    geo.setIndex(Array.from(geo.index!.array).filter((_, i) => Math.floor(i / 6) !== 5));
    geo.clearGroups();
    const uvs = new Float32Array(cols * rows * 2);
    let i = 0;
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        uvs[i++] = (x + 0.5) / cols;
        uvs[i++] = (y + 0.5) / rows;
      }
    geo.setAttribute("aUv", new InstancedBufferAttribute(uvs, 2));
    const material = new ShaderMaterial({
      vertexShader: pinVertex,
      fragmentShader: pinFragment,
      uniforms: {
        uState: { value: sim.a.texture },
        uWall: { value: new Vector2(layout.wallW, layout.wallH) },
        uCam: { value: new Vector3() },
        uLightDir: { value: new Vector3(-0.55, 0.75, 0.38) },
        uBase: { value: new Color("#4a5567") }, // silver-steel
        uBg: { value: new Color("#060a12") },
        uAccent: { value: new Color("#3cf0e0") }, // electric aquamarine
        uAccent2: { value: new Color("#9d7bff") }, // amethyst
        uWork: { value: 0 },
        uHover: { value: 0 },
        uMix: { value: 0 },
        uCase: { value: 0 },
        uFrame: { value: sim.material.uniforms.uFrame.value },
        uTexA: { value: textures[0] },
        uTexB: { value: textures[1] },
        uTexCase: { value: textures[0] },
        uCaseScroll: { value: 0 },
        uPointer: { value: new Vector2(99, 99) },
        uFlat: { value: 0 },
        uAccentA: { value: new Color() },
        uAccentB: { value: new Color() },
        uVideo: { value: textures[0] as Texture },
        uVideoAmt: { value: 0 },
        uCaseAccent: { value: new Color() },
        uTime: { value: 0 },
        uIntro: { value: 0 },
        uCityAmt: { value: 1 },
        uGlyph: sim.material.uniforms.uGlyph,
        uGlyphRect: sim.material.uniforms.uGlyphRect,
        uLand: sim.material.uniforms.uLand,
        uLandH: sim.material.uniforms.uLandH,
        uLandF: sim.material.uniforms.uLandF,
        uLandColor: { value: LANDMARKS.map((l) => new Color(l.color)) },
        uLogos: { value: logos },
        uLandHover: { value: -1 },
        uSunDir: { value: environment.sunDir },
        uSunCol: { value: environment.sunColor },
        uSkyCol: { value: environment.skyColor },
        uWet: { value: environment.wetness },
        uExposure: { value: environment.exposure },
        uSunX: { value: environment.sunX },
        uFence: { value: 0 },
        uWindows: { value: environment.windows },
        uSnow: { value: environment.snow },
        uFlash: { value: environment.flash },
        uLeafA: { value: environment.leafA },
        uLeafB: { value: environment.leafB },
        uLawn: { value: environment.lawn },
        uHazeNear: { value: environment.hazeNear },
        uHazeFar: { value: environment.hazeFar },
      },
    });
    const mesh = new InstancedMesh(geo, material, cols * rows);
    signals.pinCount = cols * rows;
    mesh.frustumCulled = false;
    return { mesh, material, geo };
  }, [layout, sim, textures, logos]);

  useEffect(() => {
    scene.background = new Color("#060a12");
    let glyph: CanvasTexture | null = null;
    document.fonts.load(`800 100px ${getComputedStyle(document.documentElement).getPropertyValue("--f-archivo")}`).finally(() => {
      glyph = makeGlyph();
      sim.material.uniforms.uGlyph.value = glyph;
    });
    return () => {
      glyph?.dispose();
    };
  }, [scene, sim]);

  useEffect(
    () => () => {
      sim.a.dispose();
      sim.b.dispose();
      sim.material.dispose();
      pins.geo.dispose();
      pins.material.dispose();
    },
    [sim, pins],
  );

  // Project reels, created on first hover and kept paused when not shown.
  const videos = useRef(new Map<number, { el: HTMLVideoElement; tex: VideoTexture }>());
  useEffect(() => {
    const map = videos.current;
    return () => {
      map.forEach(({ el, tex }) => {
        el.pause();
        el.removeAttribute("src");
        el.load();
        tex.dispose();
      });
      map.clear();
    };
  }, []);
  const reel = (i: number) => {
    const src = projects[i]?.video;
    if (!src) return null;
    let v = videos.current.get(i);
    if (!v) {
      const el = document.createElement("video");
      el.crossOrigin = "anonymous";
      Object.assign(el, { muted: true, loop: true, playsInline: true, preload: "auto" });
      el.src = src;
      const tex = new VideoTexture(el);
      tex.colorSpace = SRGBColorSpace;
      v = { el, tex };
      videos.current.set(i, v);
    }
    return v;
  };

  const st = useRef({ skyward: 0, morph: 0, aboutCam: 0, leaveAmt: 0, city: 1, video: 0, videoIdx: -1, flat: 0, work: 0, hover: 0, about: 0, contact: 0, caseAmt: 0, front: 0, time: 0, idx: 0 });
  const tmp = useMemo(
    () => ({ ray: new Ray(), plane: new Plane(new Vector3(0, 0, 1), 0), hit: new Vector3(), look: new Vector3(), pos: new Vector3(), v: new Vector3() }),
    [],
  );
  const frontCam = useMemo(() => new PerspectiveCamera(35, 1, 0.1, 200), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const inp = readInputs();
    const s = st.current;
    s.time += dt;
    const su = sim.material.uniforms;
    const pu = pins.material.uniforms;

    // Reduced motion renders on demand: snap instead of easing.
    const L = inp.reducedMotion ? 1000 : 1;

    // ── Section weights
    const aboutFront = smoothstep(0.05, 0.3, inp.about) * (1 - smoothstep(0.7, 0.95, inp.about));
    const caseTarget = inp.isCase ? 1 : 0;
    s.caseAmt = damp(s.caseAmt, caseTarget, 2.5 * L, dt);
    s.work = damp(s.work, inp.isCase ? 0 : inp.workIn, 6 * L, dt);
    s.about = damp(s.about, inp.isCase ? 0 : aboutFront, 4 * L, dt);
    s.contact = damp(s.contact, inp.isCase ? 0 : smoothstep(0.35, 1, inp.contact), 4 * L, dt);
    signals.contactAmt = s.contact;
    s.hover = damp(s.hover, inp.hovered >= 0 ? 1 : 0, 5 * L, dt);
    s.front = 0; // everything stays in the city now: the billboard (Work) and its MacBook (About)
    // About: the billboard turns into a MacBook, holds, and turns back before Contact
    const morphT = smoothstep(0.1, 0.3, inp.about) * (1 - smoothstep(0.72, 0.9, inp.about));
    s.morph = inp.isCase ? 0 : inp.reducedMotion ? morphT : damp(s.morph, morphT, 3, dt);
    const aboutCam = inp.isCase ? 0 : smoothstep(0.02, 0.22, inp.about) * (1 - smoothstep(0.78, 0.97, inp.about));
    // About keeps the aerial view (the laptop floats in the air in front of it)
    s.aboutCam = damp(s.aboutCam, 0, 3 * L, dt);
    // About looks up into the sky (planes overhead, towards the sun — or the moon at night)
    s.skyward = damp(s.skyward, aboutCam, 2.2 * L, dt);
    signals.skyward = s.skyward;
    s.leaveAmt = inp.leave;
    // The city owns the hero, the load and contact; it recedes for work, about and case studies.
    s.city = damp(s.city, (1 - s.front) * (1 - s.caseAmt), 3 * L, dt);
    // Models flatten into the screenshot on hover, and while leaving for a case study
    // so the shared-element ghost picks up an identical image.
    s.flat = damp(s.flat, inp.hovered >= 0 || inp.leave > 0.01 ? 1 : 0, 4 * L, dt);
    const modelAmt = 0; // pin models retired: Work is the billboard

    // Frame centre in world space (frontal pose) — the model camera orbits it.
    frontCam.aspect = size.width / size.height;
    frontCam.position.set(0, 0, FRONT_Z);
    const fr = readRect(signals.els.workFrame);
    const fw = fr ? rectToWorld(fr, frontCam, size, 0) : null;
    signals.els.workFrame?.style.setProperty("--flat", s.flat.toFixed(3));

    // ── Camera: grazing (hero) ⇄ frontal (work/about) ⇄ high grazing (contact), drifting in case
    const px = inp.reducedMotion ? 0 : inp.pointer.sx;
    const py = inp.reducedMotion ? 0 : inp.pointer.sy;
    const intro = inp.intro;
    // While loading, drift slowly across the rising skyline.
    const orbit = Math.sin(s.time * 0.22) * 1.6 * (1 - intro);
    // Wide aerial over the city; the loading shot starts lower and swoops up into it.
    const heroPos = tmp.pos.set(px * 0.7 + orbit, -8.6 + py * 0.35 + (1 - intro) * 0.8, 7.2 - (1 - intro) * 3.4);
    const heroLook = tmp.look.set(px * 0.2, 1.3 + (1 - intro) * 0.6, 0);
    const pos = heroPos.clone();
    const look = heroLook.clone();
    // contact: back over the same city, the social towers front and centre
    // frontal
    pos.lerp(tmp.v.set(0, 0, FRONT_Z), s.front);
    look.lerp(tmp.v.set(0, 0, 0), s.front);
    // work model: look up at the sculpture from below, a little off-axis
    if (fw) {
      const far = size.width < size.height ? 1.55 : 1; // portrait: step back so the model fits
      pos.lerp(tmp.v.set(fw.x + px * 1.1, fw.y - 5.4 * far + py * 0.5, 7.2 * far), modelAmt);
      look.lerp(tmp.v.set(fw.x, fw.y - 0.55, 0.55), modelAmt);
    }
    // work: down to street level, looking up at the billboard with the skyline behind it
    // desktop: aim left of the board so it stands on the right with the street and skyline around
    // it, leaving the left for the copy; phones: step back and centre it
    const tall = size.width < size.height;
    const back = tall ? 3.2 : 0;
    const camX = tall ? board.at.x + 0.2 : board.camAt.x;
    pos.lerp(tmp.v.set(camX + px * 0.2, board.camAt.y - back + py * 0.06, board.camAt.z + back * 0.15 + py * 0.05), s.work);
    // phones: aim below the board so it rides in the top half, above the copy
    look.lerp(tmp.v.set(board.at.x - (tall ? 0 : 1.05) - px * 0.05, board.at.y, tall ? SCREEN_BOTTOM * 0.35 : SCREEN_BOTTOM + SCREEN_H * 0.55), s.work);
    // about: in front of the giant MacBook it became, a little above, the laptop left of the copy
    // (plain numbers: tmp.v is reused below and would clobber the direction)
    const tcl = Math.hypot(board.camAt.x - board.at.x, board.camAt.y - board.at.y);
    const toCam = { x: (board.camAt.x - board.at.x) / tcl, y: (board.camAt.y - board.at.y) / tcl };
    const dist = tall ? 6.4 : 5.0;
    const ax = board.at.x + toCam.x * dist;
    const ay = board.at.y + toCam.y * dist;
    pos.lerp(tmp.v.set(ax + px * 0.15, ay + py * 0.05, (tall ? 2.8 : 2.1) + py * 0.04), s.aboutCam);
    // aim right of the laptop so it stands in the left half, clear of the copy
    // offset the aim to the camera's right so the laptop sits in the left half, clear of the copy
    const side = tall ? 0 : -1.3;
    look.lerp(tmp.v.set(board.at.x + side * toCam.y - px * 0.04, board.at.y - side * toCam.x, tall ? -0.2 : 0.38), s.aboutCam);
    // at street level "up" is the sky (z), not north on the wall (y)
    {
      // low among the rooftops, looking up past the skyline; yawed to the side the sun/moon is on
      // lying back among the rooftops, facing (almost) straight up into the sky
      pos.lerp(tmp.v.set(px * 0.3, -3.2, 0.7), s.skyward);
      look.lerp(tmp.v.set(px * 1.2, -2.2 + py * 0.8, 7.5), s.skyward);
    }
    const street = Math.max(s.work, s.aboutCam, s.skyward);
    cam.up.set(0, 1 - street, street).normalize();
    // case
    const drift = Math.sin(s.time * 0.12) * 1.2;
    pos.lerp(tmp.v.set(drift + px * 0.5, -4.6 + py * 0.3, 7.4), s.caseAmt);
    look.lerp(tmp.v.set(drift * 0.4, 1.2, 0), s.caseAmt);
    // route leave: push toward the wall
    pos.z -= inp.leave * 1.6;
    cam.position.copy(pos);
    cam.lookAt(look);
    // Shift the principal point so the model sits where the DOM frame is, not mid-screen.
    if (fr && modelAmt > 0.001) {
      const dx = fr.x + fr.w / 2 - size.width / 2;
      const dy = fr.y + fr.h / 2 - size.height / 2;
      cam.setViewOffset(size.width, size.height, -dx * modelAmt, -dy * modelAmt, size.width, size.height);
    } else if (cam.view?.enabled) cam.clearViewOffset();

    // ── Pointer onto the wall
    tmp.ray.origin.copy(cam.position);
    tmp.v.set(inp.pointer.x, inp.pointer.y, 0.5).unproject(cam).sub(cam.position).normalize();
    tmp.ray.direction.copy(tmp.v);
    const hit = tmp.ray.intersectPlane(tmp.plane, tmp.hit);
    if (hit) {
      su.uPointer.value.set(hit.x, hit.y);
      pu.uPointer.value.set(hit.x, hit.y);
    }
    su.uPointerForce.value = inp.reducedMotion ? 0 : inp.pointer.speed;

    // ── DOM-aligned rects, mapped with the frontal pose
    const toUv = (el: HTMLElement | null, out: Vector4) => {
      const r = readRect(el);
      if (!r) return out.set(-1, -1, -1, -1);
      const w = rectToWorld(r, frontCam, size, 0);
      return out.set(
        (w.x - w.w / 2) / layout.wallW + 0.5,
        (w.y - w.h / 2) / layout.wallH + 0.5,
        (w.x + w.w / 2) / layout.wallW + 0.5,
        (w.y + w.h / 2) / layout.wallH + 0.5,
      );
    };
    toUv(signals.els.workFrame, su.uFrame.value);
    toUv(signals.els.aboutObject, su.uAboutRect.value);
    const ar = readRect(signals.els.aboutObject);
    if (ar) {
      const ax = ((inp.pointer.px - (ar.x + ar.w / 2)) / (ar.w / 2)) || 0;
      const ay = (-(inp.pointer.py - (ar.y + ar.h / 2)) / (ar.h / 2)) || 0;
      su.uAboutPointer.value.set(Math.max(-1.5, Math.min(1.5, ax)), Math.max(-1.5, Math.min(1.5, ay)));
    }

    // ── Project textures: A → B by fractional scroll index
    const wi = Math.max(0, Math.min(PROJECT_COUNT - 1, inp.workIndex));
    const a = Math.min(PROJECT_COUNT - 1, Math.floor(wi));
    const b = Math.min(PROJECT_COUNT - 1, a + 1);
    const mix = wi - a;
    su.uTexA.value = pu.uTexA.value = textures[a];
    su.uTexB.value = pu.uTexB.value = textures[b];
    su.uMix.value = pu.uMix.value = mix;
    su.uModelA.value = models[a];
    su.uModelB.value = models[b];
    pu.uAccentA.value.copy(accents[a]);
    pu.uAccentB.value.copy(accents[b]);
    su.uFlat.value = pu.uFlat.value = s.flat;

    // ── Live reel on hover (skipped for reduced motion: stills only)
    const wantVideo = !inp.reducedMotion && inp.hovered >= 0 && s.work > 0.5 && mix < 0.02;
    const v = wantVideo ? reel(a) : null;
    if (v) {
      if (s.videoIdx !== a) {
        s.video = 0;
        s.videoIdx = a;
      }
      if (v.el.paused) v.el.play().catch(() => {});
      pu.uVideo.value = v.tex;
    }
    s.video = damp(s.video, v && v.el.readyState >= 2 ? 1 : 0, 6 * L, dt);
    pu.uVideoAmt.value = s.video;
    if (!v && s.video < 0.01) videos.current.forEach(({ el }) => !el.paused && el.pause());
    if (inp.caseIndex >= 0) {
      su.uTexCase.value = pu.uTexCase.value = textures[inp.caseIndex];
      su.uCaseModel.value = models[inp.caseIndex];
      pu.uCaseAccent.value.copy(accents[inp.caseIndex]);
    }
    su.uCaseScroll.value = pu.uCaseScroll.value = inp.caseProgress;

    // ── Hero glyph spans ~60% of what the camera can see, centred
    const visW = 2 * Math.tan((35 * Math.PI) / 360) * FRONT_Z * (size.width / size.height);
    const gw = Math.min(0.5, (0.6 * visW) / layout.wallW);
    const gh = (gw * layout.wallW) / 2 / layout.wallH;
    su.uGlyphRect.value.set(0.5 - gw / 2 + 0.03 * (size.width > size.height ? 1 : 0), 0.555, gw, gh);

    // ── Section uniforms
    const heroAmt = (1 - s.front) * (1 - s.caseAmt);
    su.uTime.value = pu.uTime.value = s.time;
    su.uDt.value = dt;
    su.uSnap.value = inp.reducedMotion ? 1 : 0;
    su.uIntro.value = pu.uIntro.value = intro;
    su.uCityAmt.value = pu.uCityAmt.value = s.city;
    pu.uLandHover.value = signals.landmarkHover;
    pu.uWet.value = environment.wetness; // vectors/colours are shared by reference
    pu.uExposure.value = environment.exposure;
    pu.uSunX.value = environment.sunX;
    // Fence lamps switch on as it gets dark: evening, night and rain; off by day.
    pu.uFence.value = 1 - Math.min(1, Math.max(0, (environment.exposure - 0.32) / 0.2));
    pu.uWindows.value = environment.windows;
    pu.uSnow.value = environment.snow;
    pu.uFlash.value = environment.flash;

    // Screen rects of each tower's logo, for the DOM links that sit over them.
    layout.landmarks.forEach((r, i) => {
      const out = signals.landmarks[i];
      const H = LANDMARKS[i].front;
      const x0 = (r.x0 - 0.5) * layout.wallW;
      const x1 = (r.x1 - 0.5) * layout.wallW;
      const y = (r.y0 - 0.5) * layout.wallH;
      const lw = x1 - x0;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [px, pz] of [[x0, H * 0.95 - lw], [x1, H * 0.95 - lw], [x0, H * 0.97], [x1, H * 0.97]]) {
        tmp.v.set(px, y, pz).project(cam);
        const sx = (tmp.v.x * 0.5 + 0.5) * size.width;
        const sy = (-tmp.v.y * 0.5 + 0.5) * size.height;
        minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
        minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
      }
      out.x = minX; out.y = minY; out.w = maxX - minX; out.h = maxY - minY;
      out.on = s.city > 0.6 && intro > 0.9 && tmp.v.z < 1;
    });
    su.uLoad.value = inp.reducedMotion ? 1 : Math.max(signals.loadProgress, intro);
    su.uHero.value = heroAmt;
    su.uWork.value = pu.uWork.value = 0; // no pin frame in Work any more
    su.uHover.value = pu.uHover.value = s.hover;
    su.uAbout.value = 0; // the dome is gone: About is the MacBook in the street
    su.uContact.value = 0; // the ♒ waves gave way to the city
    su.uCase.value = pu.uCase.value = s.caseAmt;
    su.uLeave.value = inp.leave;
    pu.uCam.value.copy(cam.position);

    // ── Step the spring sim
    su.uState.value = sim.read.texture;
    gl.setRenderTarget(sim.write);
    gl.render(sim.simScene, sim.simCam);
    gl.setRenderTarget(null);
    pu.uState.value = sim.write.texture;
    const t = sim.read;
    sim.read = sim.write;
    sim.write = t;
  });

  return (
    <>
      <primitive object={pins.mesh} />
      <Sky wallH={layout.wallH} amount={() => st.current.city} />
      <Planes wallW={layout.wallW} wallH={layout.wallH} amount={() => st.current.city} />
      <ParkLamps lamps={city.lamps} amount={() => st.current.city} />
      <Traffic lanes={city.lanes} rails={city.rails} coast={city.coast} hide={noGo} amount={() => st.current.city} />
      <Precipitation wallW={layout.wallW} wallH={layout.wallH} amount={() => st.current.city} />
      <Zenith />
      <PinClouds anchors={cloudAnchors} amount={() => signals.contactAmt * st.current.city} />
      <PinBillboard
        at={board.at}
        yaw={board.yaw}
        stills={textures}
        state={() => ({
          build: useStore.getState().reducedMotion ? 1 : Math.max(signals.loadProgress, signals.intro),
          work: st.current.work,
          morph: st.current.morph,
          skills: false, // skills open in the macOS window instead
        })}
      />
      <Trucks roads={city.truckRoads} hq={hqBox} amount={() => st.current.city * (1 - st.current.leaveAmt) * (1 - st.current.work)} />
    </>
  );
}
