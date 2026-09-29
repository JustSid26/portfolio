"use client";

// The billboard, built from pins — and the MacBook it turns into.
//
// Every pin has three homes: scattered in the sky (the intro builds the billboard out of them as
// the site loads), a place in the billboard (a 64 × 36 pin screen, plus the frame, posts, catwalk
// and back panel), and a place in a giant MacBook standing in the street (the same screen pins
// become its lid; the rest become its silver deck and keyboard). The screen pins take their colour
// from whatever is showing — a "?" until you reach the work, the project reels in Work, the
// laptop's code in About — and push out by its brightness, like the old pin models.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BoxGeometry,
  Mesh,
  PlaneGeometry,
  Matrix4,
  Quaternion,
  Euler,
  Color,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
  VideoTexture,
  type Texture,
} from "three";
import { projects } from "@/content/projects";
import { environment as env } from "@/lib/environment";
import { signals } from "@/lib/signals";
import { useStore } from "@/lib/store";
import { PROJECT_COUNT, smoothstep } from "../shared";
import { CODE, createLaptopScreen, createQuestionTexture } from "./laptopScreen";

const COLS = 64;
const ROWS = 36;
export const SCREEN_W = 1.5;
const P = SCREEN_W / COLS; // pin pitch
export const SCREEN_H = ROWS * P;
export const SCREEN_BOTTOM = 0.62;
const DECK_ROWS = 40;
const EXTRA = COLS * DECK_ROWS; // pins that are frame/posts/panel on the billboard, the deck on the laptop
const LID_TILT = 0.2; // lid leans back past vertical
const HINGE_Y = 0.22; // the laptop stands on its own pin plinth, clear of the buildings around it

type Layout = { bill: Float32Array; lap: Float32Array; start: Float32Array; uv: Float32Array; kind: Float32Array; key: Float32Array; rand: Float32Array; count: number };

function buildLayout(): Layout {
  const count = COLS * ROWS + EXTRA;
  const bill = new Float32Array(count * 3);
  const lap = new Float32Array(count * 3);
  const start = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2).fill(-1);
  const kind = new Float32Array(count);
  const key = new Float32Array(count);
  const rand = new Float32Array(count);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const x0 = -SCREEN_W / 2 + P / 2;

  // screen pins: billboard screen ⇄ laptop lid
  for (let j = 0; j < ROWS; j++)
    for (let i = 0; i < COLS; i++) {
      const n = j * COLS + i;
      bill.set([x0 + i * P, SCREEN_BOTTOM + (j + 0.5) * P, 0], n * 3);
      const v = 0.04 + (j + 0.5) * P; // distance up the lid from the hinge
      lap.set([x0 + i * P, HINGE_Y + v * Math.cos(LID_TILT), -v * Math.sin(LID_TILT)], n * 3);
      uv.set([(i + 0.5) / COLS, (j + 0.5) / ROWS], n * 2);
      kind[n] = 0;
    }

  // the rest: frame, posts, catwalk, back panel on the billboard — the deck on the laptop
  const billExtra: [number, number, number, number][] = [];
  for (let i = -1; i <= COLS; i++) {
    billExtra.push([x0 + i * P, SCREEN_BOTTOM - P / 2, -P * 0.2, 1]);
    billExtra.push([x0 + i * P, SCREEN_BOTTOM + SCREEN_H + P / 2, -P * 0.2, 1]);
  }
  for (let j = 0; j < ROWS; j++) {
    billExtra.push([x0 - P, SCREEN_BOTTOM + (j + 0.5) * P, -P * 0.2, 1]);
    billExtra.push([x0 + COLS * P, SCREEN_BOTTOM + (j + 0.5) * P, -P * 0.2, 1]);
  }
  const postRows = Math.floor(SCREEN_BOTTOM / P);
  for (const px of [-SCREEN_W * 0.3, SCREEN_W * 0.3])
    for (let r = 0; r < postRows; r++)
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) billExtra.push([px + (a - 0.5) * P, (r + 0.5) * P, -P * 1.2 - b * P, 2]);
  for (let i = 0; i < Math.floor((SCREEN_W * 0.7) / P); i++)
    for (let d = 0; d < 2; d++) billExtra.push([-SCREEN_W * 0.35 + (i + 0.5) * P, SCREEN_BOTTOM - P * 3, P * (0.5 + d), 2]);
  for (let j = 0; j < ROWS && billExtra.length < EXTRA; j++)
    for (let i = 0; i < COLS && billExtra.length < EXTRA; i++) billExtra.push([x0 + i * P, SCREEN_BOTTOM + (j + 0.5) * P, -P * 1.3, 3]);
  while (billExtra.length < EXTRA) billExtra.push([0, SCREEN_BOTTOM + SCREEN_H / 2, -P * 1.3, 3]);

  for (let e = 0; e < EXTRA; e++) {
    const n = COLS * ROWS + e;
    const [bx, by, bz, k] = billExtra[e];
    bill.set([bx, by, bz], n * 3);
    kind[n] = k;
    // laptop deck: 64 × 40 pins in front of the hinge; keys in the back half, a trackpad in front
    const i = e % COLS;
    const r = Math.floor(e / COLS);
    // MacBook Pro deck: speaker grilles either side of a black keyboard well, a wide trackpad
    const isKey = r >= 5 && r <= 22 && i >= 8 && i <= 55;
    const isGrille = r >= 5 && r <= 22 && ((i >= 2 && i <= 5) || (i >= 58 && i <= 61)) && (i + r) % 2 === 0;
    const isPad = r >= 25 && r <= 37 && i >= 17 && i <= 46;
    key[n] = isKey ? 1 : isPad ? 2 : isGrille ? 3 : 0;
    lap.set([x0 + i * P, HINGE_Y - P * 0.4 + (isKey ? P * 0.12 : 0), (r + 0.5) * P], n * 3);
  }

  // intro: every pin starts up in the sky around the spot and falls into place
  const v = new Vector3();
  for (let n = 0; n < count; n++) {
    v.set(rnd() - 0.5, rnd(), rnd() - 0.5).normalize().multiplyScalar(1.5 + rnd() * 2.5);
    start.set([v.x, 1.2 + v.y * 2.2, v.z], n * 3);
    rand[n] = rnd();
  }
  return { bill, lap, start, uv, kind, key, rand, count };
}

const vertex = /* glsl */ `
attribute vec3 aBill, aLap, aStart;
attribute vec2 aUv;
attribute float aKind, aKey, aRand;
uniform float uBuild, uMorph, uMix, uQ, uCode, uTime, uRelief;
uniform mat4 uLapToBoard;
uniform float uHideScreen;
uniform float uLapScale; // laptop-local → billboard-local: the laptop floats in the air in front of the camera
uniform sampler2D uA, uB, uQTex, uCodeTex;
varying vec3 vN;
varying vec3 vCol;
varying float vScreen;
varying float vFront;
varying vec2 vUvF;
varying float vCapF;
varying float vBulb;
varying float vTop;
varying vec2 vLocal;
varying float vRand;
varying float vEm;

float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
  // build (intro): pins fall into the billboard in a random order, landing with a little bounce
  float tb = clamp((uBuild * 1.3 - aRand * 0.3), 0.0, 1.0);
  float eb = 1.0 - pow(1.0 - tb, 3.0);
  // morph: billboard ⇄ laptop, pins staggered, arcing up as they fly across
  float tm = clamp(uMorph * 1.5 - aRand * 0.5, 0.0, 1.0);
  float em = tm * tm * (3.0 - 2.0 * tm);
  vec3 lapHome = (uLapToBoard * vec4(aLap, 1.0)).xyz;
  vec3 home = mix(aBill, lapHome, em);
  home += vec3(0.0, 1.0, 0.0) * sin(em * 3.14159) * (0.4 + aRand * 0.9); // pins arc up as they fly
  vec3 p = mix(aStart, home, eb);

  vScreen = step(0.0, aUv.x);
  // marquee bulbs: every third pin round the frame rails, gone once the pins become the laptop
  float along = floor((aBill.x + aBill.y) / 0.0234375 + 0.5);
  vBulb = step(abs(aKind - 1.0), 0.5) * step(mod(along, 3.0), 0.5) * (1.0 - em);
  vTop = aUv.y;
  vLocal = position.xy / vec2(0.0103125);
  vRand = aRand;
  vEm = em; // screen pins: 1 at the top, where the floodlights hang
  // the front face samples the picture per fragment, so flat pins read as one crisp screen
  vUvF = aUv + position.xy / vec2(64.0 * 0.0234375, 36.0 * 0.0234375);
  vCapF = step(0.5, normal.z);
  vec3 col;
  if (vScreen > 0.5) {
    // which picture this pin shows: the "?", the projects (next one scanning in from the top), or the code
    float front = uMix * 1.15 - 0.05;
    float useB = step(1.0 - aUv.y, front);
    vec3 proj = mix(texture2D(uA, aUv).rgb, texture2D(uB, aUv).rgb, useB);
    vFront = exp(-pow((1.0 - aUv.y - front) * 18.0, 2.0)) * step(0.001, uMix) * step(uMix, 0.999);
    col = mix(proj, texture2D(uQTex, aUv).rgb, uQ);
    col = mix(col, texture2D(uCodeTex, aUv).rgb, uCode);
    // bright pins stand proud, like the old pin models
    p.z += (lum(col) * uRelief + vFront * 0.06) * (1.0 - em * 0.7);
  } else {
    vFront = 0.0;
    vec3 steel = aKind < 1.5 ? vec3(0.16, 0.18, 0.22) : aKind < 2.5 ? vec3(0.24, 0.26, 0.3) : vec3(0.1, 0.11, 0.14);
    vec3 alu = aKey > 2.5 ? vec3(0.18, 0.19, 0.21) : aKey > 1.5 ? vec3(0.56, 0.58, 0.62) : aKey > 0.5 ? vec3(0.025, 0.027, 0.03) : vec3(0.74, 0.76, 0.79);
    col = mix(steel, alu, em);
  }
  vCol = col;
  vN = normalize(mat3(modelMatrix) * normal);
  float hide = 1.0 - step(0.0, aUv.x) * uHideScreen; // screen pins step aside for the smooth screen
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p + position * mix(1.0, uLapScale, em) * hide, 1.0);
}`;

const fragment = /* glsl */ `
uniform vec3 uSunDir, uSunCol, uSkyCol, uAccent;
uniform float uNight, uHover, uMix, uQ, uCode;
uniform sampler2D uA, uB, uQTex, uCodeTex;
varying vec2 vUvF;
varying float vCapF;
varying vec3 vN;
varying vec3 vCol;
varying float vScreen;
varying float vFront;
varying float vBulb;
varying float vTop;
varying vec2 vLocal;
varying float vRand;
varying float vEm;
uniform float uTime;
void main() {
  vec3 n = normalize(vN);
  vec3 lit = vCol * (uSkyCol * (0.55 + 0.35 * n.z) + uSunCol * 0.75 * max(dot(n, normalize(uSunDir)), 0.0));
  // the laptop is silver anodised aluminium: bright, cool and a little glossy whatever the sky is
  if (vEm > 0.5 && vScreen < 0.5) {
    vec3 V = normalize(cameraPosition - vec3(0.0)); // approx: facing us
    float isBody = step(0.2, dot(vCol, vec3(0.333)));
    vec3 silver = vec3(0.78, 0.8, 0.83) * (0.72 + 0.28 * max(dot(n, normalize(uSunDir)), 0.0)) + uSkyCol * 0.08;
    silver += vec3(1.0) * pow(max(n.z, 0.0), 8.0) * 0.06;
    lit = mix(lit, silver, isBody * vEm);
  }
  // keep the body reading as pins: each pin a touch different, with a bevelled edge on its face
  float bevel = smoothstep(0.7, 1.0, max(abs(vLocal.x), abs(vLocal.y)));
  float jitter = 0.9 + 0.2 * vRand;
  lit *= jitter * (1.0 - bevel * 0.45);
  lit += vec3(0.06) * bevel * step(dot(vCol, vec3(0.333)), 0.1); // black keys: faint light seams
  // screen pins are light sources: their front faces glow with the picture
  vec3 picture = vCol;
  if (vScreen > 0.5 && vCapF > 0.5) {
    vec2 uv = clamp(vUvF, 0.0, 1.0);
    float front = uMix * 1.15 - 0.05;
    float useB = step(1.0 - uv.y, front);
    vec3 proj = mix(texture2D(uA, uv).rgb, texture2D(uB, uv).rgb, useB);
    picture = mix(mix(proj, texture2D(uQTex, uv).rgb, uQ), texture2D(uCodeTex, uv).rgb, uCode);
  }
  // at dusk the floodlights on the lamp arms wash the top of the screen warm
  float flood = uNight * smoothstep(0.55, 1.0, vTop) * 0.35;
  vec3 emit = picture * vScreen * (1.1 + uNight * 0.4 + uHover * 0.15 + flood) * mix(0.3, 1.0, vCapF);
  emit += uAccent * vFront * 1.4 * vScreen;
  vec3 col = mix(lit, emit, vScreen);
  // bulbs chase slowly round the frame once it's dark
  float chase = 0.75 + 0.25 * sin(uTime * 3.0 + gl_FragCoord.x * 0.02 + gl_FragCoord.y * 0.02);
  col = mix(col, vec3(1.0, 0.45, 0.1) * (0.65 + chase * 0.45), vBulb * uNight); // warm amber, not blown to white
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export type BoardState = { build: number; work: number; morph: number; skills: boolean };

export function PinBillboard({ at, yaw, stills, state }: { at: Vector3; yaw: number; stills: Texture[]; state: () => BoardState }) {
  const { camera, size } = useThree();
  const reducedMotion = useStore((s) => s.reducedMotion);

  const { mesh, mat, laptop, question, screenMat, boardScreen, lidScreen } = useMemo(() => {
    const L = buildLayout();
    const box = new BoxGeometry(P * 0.88, P * 0.88, P * 1.1);
    box.setAttribute("aBill", new InstancedBufferAttribute(L.bill, 3));
    box.setAttribute("aLap", new InstancedBufferAttribute(L.lap, 3));
    box.setAttribute("aStart", new InstancedBufferAttribute(L.start, 3));
    box.setAttribute("aUv", new InstancedBufferAttribute(L.uv, 2));
    box.setAttribute("aKind", new InstancedBufferAttribute(L.kind, 1));
    box.setAttribute("aKey", new InstancedBufferAttribute(L.key, 1));
    box.setAttribute("aRand", new InstancedBufferAttribute(L.rand, 1));
    const laptop = createLaptopScreen();
    const question = createQuestionTexture();
    const mat = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uBuild: { value: 0 }, uMorph: { value: 0 }, uMix: { value: 0 }, uQ: { value: 1 }, uCode: { value: 0 }, uTime: { value: 0 },
        uRelief: { value: 0 },
        uA: { value: stills[0] }, uB: { value: stills[1] }, uQTex: { value: question }, uCodeTex: { value: laptop.tex },
        uSunDir: { value: env.sunDir }, uSunCol: { value: env.sunColor }, uSkyCol: { value: env.skyColor },
        uAccent: { value: new Color("#3cf0e0") }, uNight: { value: 0 }, uHover: { value: 0 },
        uLapToBoard: { value: new Matrix4() }, uLapScale: { value: 1 }, uHideScreen: { value: 0 },
      },
    });
    const mesh = new InstancedMesh(box, mat, L.count);
    mesh.frustumCulled = false;
    // The finished screens are a normal smooth display (the pins are only for building/morphing),
    // so the project reels stay sharp. Shares the pins' picture uniforms.
    const screenMat = new ShaderMaterial({
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uA, uB, uQTex, uCodeTex;
        uniform float uMix, uQ, uCode, uNight, uHover;
        uniform vec3 uAccent;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          float front = uMix * 1.15 - 0.05;
          float useB = step(1.0 - uv.y, front);
          float edge = exp(-pow((1.0 - uv.y - front) * 30.0, 2.0)) * step(0.001, uMix) * step(uMix, 0.999);
          vec3 proj = mix(texture2D(uA, uv).rgb, texture2D(uB, uv).rgb, useB);
          vec3 pic = mix(mix(proj, texture2D(uQTex, uv).rgb, uQ), texture2D(uCodeTex, uv).rgb, uCode);
          float flood = uNight * smoothstep(0.55, 1.0, uv.y) * 0.3 * (1.0 - uCode);
          vec3 col = pic * (1.02 + uHover * 0.1 + flood) + uAccent * edge * 1.2;
          // on the laptop: thin black bezels and the camera notch at the top, like a MacBook Pro
          vec2 b = vec2(0.018, 0.028);
          float bezel = 1.0 - step(b.x, uv.x) * step(uv.x, 1.0 - b.x) * step(b.y, uv.y) * step(uv.y, 1.0 - b.y);
          float notch = step(abs(uv.x - 0.5), 0.045) * step(1.0 - 0.055, uv.y);
          col = mix(col, vec3(0.012), max(bezel, notch) * uCode);
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }`,
      uniforms: mat.uniforms,
      toneMapped: false,
    });
    const boardScreen = new Mesh(new PlaneGeometry(SCREEN_W, SCREEN_H).translate(0, SCREEN_BOTTOM + SCREEN_H / 2, P * 0.58), screenMat);
    const vc = 0.04 + SCREEN_H / 2;
    const lidGeo = new PlaneGeometry(SCREEN_W, SCREEN_H).applyMatrix4(new Matrix4().makeRotationX(-LID_TILT));
    lidGeo.translate(0, HINGE_Y + vc * Math.cos(LID_TILT) + Math.sin(LID_TILT) * P * 0.6, -vc * Math.sin(LID_TILT) + Math.cos(LID_TILT) * P * 0.6);
    const lidScreen = new Mesh(lidGeo, screenMat);
    lidScreen.matrixAutoUpdate = false;
    boardScreen.frustumCulled = lidScreen.frustumCulled = false;
    return { mesh, mat, laptop, question, screenMat, boardScreen, lidScreen };
  }, [stills]);

  const accents = useMemo(() => projects.map((p) => new Color(p.accent ?? "#3cf0e0")), []);
  const reels = useMemo(
    () =>
      projects.map((p) => {
        if (!p.video) return null;
        const el = document.createElement("video");
        // no preload: four reels holding a connection each can starve the page; each loads when it plays
        el.crossOrigin = "anonymous";
        Object.assign(el, { muted: true, loop: true, playsInline: true, preload: "none" });
        el.src = p.video;
        const tex = new VideoTexture(el);
        tex.colorSpace = SRGBColorSpace;
        return { el, tex, src: p.video };
      }),
    [],
  );
  // the reels live as long as the component: their own cleanup, so rebuilding the board (when the
  // stills arrive) doesn't strip their sources and leave them empty
  useEffect(() => {
    // (re)attach their sources: in development React runs this cleanup once straight after mounting
    reels.forEach((r) => r && !r.el.getAttribute("src") && (r.el.src = r.src));
    return () =>
      reels.forEach((r) => {
        if (!r) return;
        r.el.pause();
        r.el.removeAttribute("src");
        r.el.load();
      });
  }, [reels]);
  useEffect(
    () => () => {
      mesh.geometry.dispose();
      mat.dispose();
      laptop.tex.dispose();
      question.dispose();
      screenMat.dispose();
      boardScreen.geometry.dispose();
      lidScreen.geometry.dispose();
    },
    [mesh, mat, laptop, question, screenMat, boardScreen, lidScreen],
  );

  const st = useRef({ q: 1, code: 0, hover: 0, chars: 0, t: 0, skillsT: 0, skills: false, drawn: -1 });
  const tmp = useMemo(
    () => ({ v: new Vector3(), a: new Vector3(), b: new Vector3(), fwd: new Vector3(), right: new Vector3(), up: new Vector3(),
      lapWorld: new Matrix4(), inv: new Matrix4(), q: new Quaternion(), q2: new Quaternion(), e: new Euler(), pos: new Vector3(), scl: new Vector3() }),
    [],
  );
  const lapSt = useRef({ tx: 0, ty: 0 });
  const inner = useRef<Group>(null);

  useFrame((clock, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const s = st.current;
    const bs = state();
    const u = mat.uniforms;
    const k = reducedMotion ? 60 : 4;
    // what the screen shows: projects while in Work, the code when it's a laptop, a "?" otherwise
    s.q += ((bs.work > 0.5 || bs.morph > 0.5 ? 0 : 1) - s.q) * Math.min(1, dt * k);
    s.code += ((bs.morph > 0.55 ? 1 : 0) - s.code) * Math.min(1, dt * k);
    u.uQ.value = s.q;
    u.uCode.value = s.code;
    u.uBuild.value = reducedMotion ? 1 : bs.build;
    u.uMorph.value = bs.morph;
    u.uTime.value = clock.clock.elapsedTime;

    const wi = Math.max(0, Math.min(PROJECT_COUNT - 1, signals.scroll.workIndex));
    const a = Math.floor(wi);
    const b = Math.min(PROJECT_COUNT - 1, a + 1);
    const mix = wi - a;
    const showing = bs.work > 0.3 && s.q < 0.5;
    reels.forEach((r, i) => {
      if (!r) return;
      const want = showing && !reducedMotion && (i === a || i === b);
      if (want && r.el.paused) r.el.play().catch(() => {});
      if (!want && !r.el.paused) r.el.pause();
    });
    const pick = (i: number): Texture => {
      const r = reels[i];
      return r && !reducedMotion && r.el.readyState >= 2 ? r.tex : stills[i];
    };
    u.uA.value = pick(a);
    u.uB.value = b === a ? u.uA.value : pick(b);
    u.uMix.value = showing ? mix : 0;
    (u.uAccent.value as Color).copy(accents[a]).lerp(accents[b], mix);
    u.uNight.value = 1 - Math.min(1, Math.max(0, (env.exposure - 0.15) / 0.5));
    s.hover += ((useStore.getState().hovered >= 0 ? 1 : 0) - s.hover) * Math.min(1, dt * 6);
    u.uHover.value = s.hover;

    // the laptop types; clicking it switches to the skills
    if (s.code > 0.01) {
      s.t += reducedMotion ? 0 : dt;
      if (bs.skills) {
        if (!s.skills) s.skillsT = 0;
        s.skillsT += dt;
        laptop.drawSkills(reducedMotion ? 10 : s.skillsT);
        s.drawn = -1;
      } else {
        s.chars = reducedMotion ? CODE.length : s.chars + dt * 40;
        if (s.chars > CODE.length + 120) s.chars = 0;
        const n = Math.min(CODE.length, Math.floor(s.chars));
        if (n !== s.drawn || Math.floor(s.t * 2) !== Math.floor((s.t - dt) * 2)) {
          laptop.draw(n, s.t);
          s.drawn = n;
        }
      }
    }
    s.skills = bs.skills;

    const g = inner.current;
    if (!g) return;
    g.updateMatrixWorld();
    // The laptop hangs in the air in front of whatever the camera is doing (the aerial city view),
    // left of centre, deck tipped towards you; it leans and drifts with the cursor.
    const ls = lapSt.current;
    ls.tx += ((reducedMotion ? 0 : signals.pointer.sx) - ls.tx) * Math.min(1, dt * 4);
    ls.ty += ((reducedMotion ? 0 : signals.pointer.sy) - ls.ty) * Math.min(1, dt * 4);
    const portrait = size.width < size.height;
    const D = portrait ? 5.2 : 4.4;
    const LS = portrait ? 0.56 : 0.9;
    tmp.fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
    tmp.right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    tmp.up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    tmp.pos.copy(camera.position).addScaledVector(tmp.fwd, D)
      .addScaledVector(tmp.right, (portrait ? 0 : -0.78) + ls.tx * 0.18)
      .addScaledVector(tmp.up, (portrait ? 0.42 : -0.12) + ls.ty * 0.1 + Math.sin(clock.clock.elapsedTime * 0.8) * (reducedMotion ? 0 : 0.03));
    // face the camera (laptop local +z toward the viewer, +y up), tip the deck up, lean with the cursor
    tmp.e.set(0.55 - ls.ty * 0.2, ls.tx * 0.45 + (portrait ? 0 : 0.25), 0, "YXZ");
    tmp.q.copy(camera.quaternion).multiply(tmp.q2.setFromEuler(tmp.e));
    tmp.lapWorld.compose(tmp.pos, tmp.q, tmp.scl.setScalar(LS));
    tmp.inv.copy(g.matrixWorld).invert();
    (u.uLapToBoard.value as Matrix4).multiplyMatrices(tmp.inv, tmp.lapWorld);
    u.uLapScale.value = LS / 1; // board local scale is 1
    // smooth screens once the pins have settled; pins show only while building / morphing
    const built = (reducedMotion ? 1 : bs.build) >= 0.999;
    const onBoard = built && bs.morph <= 0.002;
    const onLid = bs.morph >= 0.995;
    boardScreen.visible = onBoard;
    lidScreen.visible = onLid;
    lidScreen.matrix.copy(u.uLapToBoard.value as Matrix4);
    u.uHideScreen.value = onBoard || onLid ? 1 : 0;
    // where the screen is on the page (billboard or laptop lid), for the DOM links
    const em = smoothstep(0, 1, Math.min(1, Math.max(0, bs.morph * 1.5 - 0.25)));
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [cx, cy] of [[-1, 0], [1, 0], [-1, 1], [1, 1]]) {
      const x = (cx * SCREEN_W) / 2;
      tmp.a.set(x, SCREEN_BOTTOM + cy * SCREEN_H, 0).applyMatrix4(g.matrixWorld);
      const v = 0.04 + cy * SCREEN_H;
      tmp.b.set(x, HINGE_Y + v * Math.cos(LID_TILT), -v * Math.sin(LID_TILT)).applyMatrix4(tmp.lapWorld);
      tmp.v.copy(tmp.a).lerp(tmp.b, em).project(camera);
      const sx = (tmp.v.x * 0.5 + 0.5) * size.width;
      const sy = (-tmp.v.y * 0.5 + 0.5) * size.height;
      minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
      minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
    }
    Object.assign(signals.billboard, { x: minX, y: minY, w: maxX - minX, h: maxY - minY, on: showing, laptop: bs.morph > 0.85 });
  });

  return (
    <group position={at} rotation={[0, 0, yaw]}>
      <group ref={inner} rotation={[Math.PI / 2, 0, 0]}>
        <primitive object={mesh} />
        <primitive object={boardScreen} />
        <primitive object={lidScreen} />
      </group>
    </group>
  );
}
