// Pinscreen shaders.
// Sim pass: one texel per pin. R = height, G = velocity. Heights spring toward a target
// composed from the current section, so every change (cursor, scroll, route) has physical overshoot.

export const simVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const simFragment = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform sampler2D uState;
uniform float uDt;
uniform float uTime;
uniform float uSnap;
uniform vec2 uWall;

uniform vec2 uPointer;
uniform float uPointerForce;

uniform float uIntro;
uniform float uHero;
uniform float uWork;
uniform float uAbout;
uniform float uContact;
uniform float uCase;
uniform float uLeave;
uniform float uHover;
uniform float uMix;

uniform sampler2D uGlyph;
uniform vec4 uGlyphRect;
uniform vec4 uFrame;
uniform vec4 uAboutRect;
uniform vec2 uAboutPointer;
uniform vec2 uContactCenter;
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform sampler2D uTexCase;
uniform float uCaseScroll;
uniform sampler2D uModelA;
uniform sampler2D uModelB;
uniform sampler2D uCaseModel;
uniform float uFlat;
uniform sampler2D uCity;
uniform float uCityAmt;
uniform float uLoad;
uniform vec2 uDims;
uniform vec4 uLand[4];
uniform float uLandH[4];
uniform float uLandF[4];
uniform float uLandType[4];

float hash(float n) { return fract(sin(n) * 43758.5453); }
float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
float inside(vec2 u) { return step(0.0, u.x) * step(u.x, 1.0) * step(0.0, u.y) * step(u.y, 1.0); }

void main() {
  vec4 s = texture2D(uState, vUv);
  float h = s.r;
  float v = s.g;
  vec2 p = (vUv - 0.5) * uWall;
  float target = 0.0;
  float light = 0.0; // what this pin emits: 1 headlight, 2 taillight, 3 train, 4 sea, 5 lamp, 6 park
  float pdCity = length(p - uPointer);

  // ── The city ──────────────────────────────────────────────
  float mat = -1.0; // facade material for the renderer (lots only)
  if (uCityAmt > 0.001) {
    vec4 c = texture2D(uCity, vUv);
    float code = c.g;
    vec2 cell = vUv * uDims;
    // During load, lots rise in a random order as the counter climbs.
    float rise = smoothstep(c.a * 0.75, c.a * 0.75 + 0.2, uLoad);
    float cityH = 0.0;
    if (code < 0.5) {
      // Building: the height profile (setbacks, roofs, tanks) is baked per pin.
      float depthScale = mix(0.35, 1.0, smoothstep(0.15, 0.6, vUv.y)); // low-rise near the camera
      float lift = exp(-pdCity * pdCity / 0.9) * step(0.04, c.r);
      cityH = (c.r * depthScale + lift * 0.18) * rise;
      mat = c.b;
    } else if (code < 4.5) {
      // Road lane: flat asphalt (the cars are real meshes — see Traffic.tsx).
      cityH = 0.0;
    } else if (code < 6.5) {
      // Elevated rail: the viaduct deck (trains are meshes riding on top).
      cityH = 0.08 * rise;
      mat = 0.75; // concrete-grey industrial finish
    } else if (code < 7.5) {
      // Sea: low, rolling.
      cityH = -0.04 + 0.02 * sin(cell.x * 0.25 + uTime * 1.3) * sin(cell.y * 0.31 - uTime * 0.9);
      light = 4.0;
    } else if (code < 8.5) {
      // Greenery: trees grow in clumps with rounded canopies; lawn between.
      vec2 k = floor(cell / 3.0);
      float clump = hash(k.x * 7.1 + k.y * 3.7 + 1.0);
      float r = length(fract(cell / 3.0) - 0.5);
      float tree = step(0.45, clump) * smoothstep(0.55, 0.15, r);
      cityH = (c.r + tree * (0.04 + clump * 0.05)) * rise;
      light = 6.0;
      // Parks and the HQ plaza get a low fence with tall lamp posts; trees near the
      // fence catch the lamplight (encoded as a fraction on top of light code 6).
      bool fencedHere = c.b < 0.001 && (c.r < 0.001 || abs(c.r - 0.006) < 0.0008);
      if (fencedHere) {
        vec2 px = 1.0 / uDims;
        float dist = 9.0; // cells to the fence line (0 = on it)
        for (int r = 1; r <= 4; r++) {
          for (int k = 0; k < 4; k++) {
            vec2 o = (k == 0 ? vec2(px.x, 0.0) : k == 1 ? vec2(-px.x, 0.0) : k == 2 ? vec2(0.0, px.y) : vec2(0.0, -px.y)) * float(r);
            vec4 nb = texture2D(uCity, vUv + o);
            float park = step(abs(nb.g - 8.0), 0.5) * step(nb.b, 0.001) * max(step(nb.r, 0.001), step(abs(nb.r - 0.006), 0.0008));
            if (park < 0.5) dist = min(dist, float(r - 1));
          }
        }
        if (dist < 0.5) {
          float post = step(mod(cell.x + cell.y, 5.0), 0.5);
          cityH = (0.012 + post * 0.09) * rise;
          light = post > 0.5 ? 12.0 : 13.0;
        } else if (dist < 1.5) {
          cityH = 0.0; // clear lawn strip just inside the fence
          light = 14.0;
        } else {
          light = 6.0 + clamp(1.0 - (dist - 2.0) / 3.0, 0.0, 1.0) * 0.45; // 6.45 near the fence → 6.0 deep inside
        }
      }
    } else {
      // Promenade: a lamp every 7 pins (traffic is meshes).
      cityH = 0.0;
      light = mod(cell.x, 7.0) < 1.0 && c.b < 0.5 ? 5.0 : 0.0;
    }
    target += cityH * uCityAmt;
    light *= step(0.3, uCityAmt);
  }

  // Idle swell — the wall is never fully still.
  float idle = sin(p.x * 0.9 + uTime * 0.55) * sin(p.y * 1.2 - uTime * 0.4) * 0.035;
  target += idle * (1.0 - uWork * 0.85) * uIntro * (1.0 - uCityAmt);

  // Hero: "SL" pressed up from behind, breathing.
  vec2 gu = (vUv - uGlyphRect.xy) / uGlyphRect.zw;
  float g = texture2D(uGlyph, clamp(gu, 0.0, 1.0)).r * inside(gu);
  float breathe = 0.82 + 0.18 * sin(uTime * 0.9 - p.x * 0.35);
  // In the city the SL becomes the HQ: a crisp two-tower building with a stepped crown.
  // HQ footprint: a slab tower across the plaza, with a setback crown.
  vec2 hq = (vUv - uGlyphRect.xy) / uGlyphRect.zw;
  float inHQ = step(0.27, hq.x) * step(hq.x, 0.73) * step(0.4, hq.y) * step(hq.y, 0.66);
  float crownHQ = step(0.31, hq.x) * step(hq.x, 0.69) * step(0.45, hq.y) * step(hq.y, 0.61);
  float spire = step(0.47, hq.x) * step(hq.x, 0.53) * step(0.51, hq.y) * step(hq.y, 0.57);
  float tower = inHQ * 1.05 + crownHQ * 0.12 + spire * 0.3;
  float slH = mix(g * 0.62 * breathe, tower, uCityAmt);
  target += slH * uHero * smoothstep(0.1, 0.7, max(uIntro, uLoad));
  if (uCityAmt > 0.5 && inHQ > 0.5) { light = 7.0; mat = -1.0; }

  // Social skyscrapers: slim towers with a stepped crown, rising late in the load.
  if (uCityAmt > 0.001) {
    for (int i = 0; i < 4; i++) {
      vec2 lq = (vUv - uLand[i].xy) / (uLand[i].zw - uLand[i].xy);
      if (inside(lq) > 0.5) {
        float H = uLandH[i];
        float F = uLandF[i];
        float t = uLandType[i];
        float e = min(min(lq.x, 1.0 - lq.x), min(lq.y, 1.0 - lq.y)); // 0 at the edge → 0.5 centre
        float c = max(abs(lq.x - 0.5), abs(lq.y - 0.5)) * 2.0;         // 1 at the edge → 0 centre
        float mast = step(max(abs(lq.x - 0.5), abs(lq.y - 0.5)), 0.07);
        float lh;
        if (t < 0.5) {
          // Tiered needle: podium, shaft, crown, antenna
          lh = e < 0.12 ? F : e < 0.26 ? mix(F, H, 0.62) : H;
          lh += mast * 0.28;
        } else if (t < 1.5) {
          // Stepped ziggurat
          lh = F + floor(e / 0.1) * (H - F) / 4.0;
        } else if (t < 2.5) {
          // Twin slabs split by a notch; the right slab is taller
          float notch = step(0.44, lq.x) * step(lq.x, 0.56) * step(0.16, lq.y);
          lh = lq.x < 0.5 ? F + (H - F) * 0.35 : H;
          lh = lq.y < 0.16 ? F : lh;
          lh = mix(lh, F * 0.55, notch);
        } else {
          // Tapered tower with a spire
          lh = lq.y < 0.14 ? F : mix(H, F, floor(c * 4.0) / 4.0);
          lh += mast * 0.4;
        }
        float lr = smoothstep(0.45 + float(i) * 0.08, 0.7 + float(i) * 0.08, max(uLoad, uIntro));
        target = lh * lr * uCityAmt;
        light = 8.0 + float(i);
        mat = -1.0;
      }
    }
  }

  // Intro: a single wave rolls up the wall as the preloader opens.
  float front = mix(-0.3, 1.3, uIntro);
  target += exp(-pow((vUv.y - front) * 9.0, 2.0)) * 0.5 * (1.0 - uIntro) * step(0.001, uIntro);

  // Work: frame shows project A → B. The flip wave travels left to right.
  vec2 fu = (vUv - uFrame.xy) / (uFrame.zw - uFrame.xy);
  float inF = inside(fu);
  if (inF > 0.0 && uWork > 0.001) {
    float wf = uMix * 1.5 - 0.25 + (fu.y - 0.5) * 0.3;
    float mid = step(0.001, uMix) * step(uMix, 0.999);
    float wave = exp(-pow((fu.x - wf) * 6.0, 2.0)) * 0.5 * mid;
    bool useB = fu.x < wf;
    vec3 c = useB ? texture2D(uTexB, fu).rgb : texture2D(uTexA, fu).rgb;
    // The project's pin model; flattens into the screenshot on hover.
    float m = useB ? texture2D(uModelB, fu).r : texture2D(uModelA, fu).r;
    float modelH = m * 1.35 + 0.02 * sin(uTime * 1.3 + fu.x * 9.0) * m;
    target += uWork * (wave + modelH * (1.0 - uFlat) + lum(c) * 0.05 * uFlat);
  }
  // Frame edges lift slightly — a bezel made of pins.
  vec2 fe = abs(fu - 0.5);
  float bezel = smoothstep(0.515, 0.5, max(fe.x, fe.y)) - smoothstep(0.5, 0.485, max(fe.x, fe.y));
  target += bezel * 0.12 * uWork;

  // About: a dome that leans toward the cursor.
  vec2 ac = (uAboutRect.xy + uAboutRect.zw) * 0.5;
  vec2 as = (uAboutRect.zw - uAboutRect.xy) * 0.5;
  vec2 ad = (vUv - ac - uAboutPointer * as * 0.35) / as;
  float r2 = dot(ad, ad);
  float dome = sqrt(max(0.0, 1.0 - r2));
  float ang = atan(ad.y, ad.x);
  float ridges = 0.9 + 0.1 * sin(ang * 8.0 + uTime * 1.2 + r2 * 6.0);
  // The laptop floats in front; the wall only lifts a soft plinth of light beneath it.
  target += smoothstep(1.0, 0.2, r2) * 0.12 * uAbout + dome * ridges * 0.0;

  // Contact: two flowing zigzag ridges — ♒, the water bearer's sign, pressed into the wall.
  vec2 q = p - uContactCenter;
  float zig = abs(fract(q.x * 0.32 - uTime * 0.12) - 0.5) * 2.0 - 0.5; // triangle wave, -0.5..0.5
  float ridgeA = exp(-pow((q.y - 0.55 - zig * 0.9) * 3.2, 2.0));
  float ridgeB = exp(-pow((q.y + 0.55 - zig * 0.9) * 3.2, 2.0));
  float span = smoothstep(7.5, 4.5, abs(q.x));
  target += (ridgeA + ridgeB) * 0.55 * span * uContact;

  // Case study: the project's model, beside the headline.
  // Sits right of the headline, then settles flat once you start reading.
  vec2 cr = vec2(0.66, 0.6);
  vec2 cs = vec2(0.2, 0.2 * (uWall.x / uWall.y) * (9.0 / 16.0));
  vec2 cu = (vUv - cr) / cs + 0.5;
  float settle = 1.0 - smoothstep(0.04, 0.16, uCaseScroll);
  target += texture2D(uCaseModel, clamp(cu, 0.0, 1.0)).r * inside(cu) * 0.9 * uCase * settle;

  // Leaving a route: flatten everything.
  target *= 1.0 - uLeave * 0.9;

  // Cursor presses pins in; the spring throws them back.
  float pd = length(p - uPointer);
  float touch = exp(-pd * pd / 0.1);
  target -= touch * 0.16 * uIntro * (1.0 - uCityAmt); // resting hand: a shallow dent (not in the city)
  v -= uPointerForce * touch * 16.0 * uDt;        // moving hand: an impulse that rebounds

  float k = 70.0;
  float damping = 6.5;
  v += (target - h) * k * uDt;
  v *= exp(-damping * uDt);
  h += v * uDt;
  if (uSnap > 0.5) { h = target; v = 0.0; }

  gl_FragColor = vec4(h, v, light, mat);
}
`;

export const pinVertex = /* glsl */ `
attribute vec2 aUv;
uniform sampler2D uState;
uniform vec2 uWall;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vPinUv;
varying float vH;
varying float vDepth;
varying float vLight;
varying float vMat;

void main() {
  vec4 st = texture2D(uState, aUv);
  float h = st.r;
  vLight = st.b;
  vMat = st.a;
  vec3 world = vec3((aUv - 0.5) * uWall, 0.0) + position + vec3(0.0, 0.0, h);
  vWorld = world;
  vNormal = normal;
  vPinUv = aUv;
  vH = h;
  vDepth = position.z;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`;

export const pinFragment = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vPinUv;
varying float vH;
varying float vDepth;
varying float vLight;
varying float vMat;

uniform vec2 uWall;
uniform vec3 uCam;
uniform vec3 uLightDir;
uniform vec3 uBase;
uniform vec3 uBg;
uniform vec3 uAccent;
uniform vec3 uAccent2;
uniform float uIntro;
uniform float uWork;
uniform float uHover;
uniform float uMix;
uniform float uCase;
uniform vec4 uFrame;
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform sampler2D uTexCase;
uniform float uCaseScroll;
uniform vec2 uPointer;
uniform float uTime;
uniform float uFlat;
uniform vec3 uAccentA;
uniform vec3 uAccentB;
uniform sampler2D uVideo;
uniform vec3 uCaseAccent;
uniform float uVideoAmt;
uniform float uCityAmt;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform vec3 uSkyCol;
uniform float uWet;
uniform float uWindows;
uniform float uSnow;
uniform float uFlash;
uniform vec3 uLeafA;
uniform vec3 uLeafB;
uniform vec3 uLawn;
uniform vec3 uHazeNear;
uniform vec3 uHazeFar;
uniform float uExposure;
uniform float uSunX;
uniform float uFence;
uniform vec4 uLand[4];
uniform float uLandH[4];
uniform float uLandF[4];
uniform vec3 uLandColor[4];
uniform sampler2D uLogos;
uniform float uLandHover;
uniform sampler2D uGlyph;
uniform vec4 uGlyphRect;

float inside(vec2 u) { return step(0.0, u.x) * step(u.x, 1.0) * step(0.0, u.y) * step(u.y, 1.0); }

void main() {
  vec3 n = normalize(vNormal);
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(uCam - vWorld);
  float diff = max(dot(n, L), 0.0);
  vec3 Hv = normalize(L + V);
  float spec = pow(max(dot(n, Hv), 0.0), 56.0);
  float cap = step(0.5, n.z);
  // Deeper along a pin's shaft = less light reaches it.
  float ao = mix(0.08, 1.0, smoothstep(-0.9, 0.0, vDepth + vH * 0.6));

  vec3 col = uBase * (0.14 + diff * 1.05) * ao + spec * 0.45 * ao;
  // Tall pins catch an aquamarine → amethyst sweep on their caps, like a shifting aurora.
  float sweep = smoothstep(0.25, 0.8, vPinUv.x + 0.12 * sin(uTime * 0.35 + vPinUv.y * 5.0));
  vec3 aurora = mix(uAccent, uAccent2, sweep);
  // In the city only the SL landmark keeps the aurora; roofs stay dark so the copy reads.
  vec2 gu = (vPinUv - uGlyphRect.xy) / uGlyphRect.zw;
  float sl = texture2D(uGlyph, clamp(gu, 0.0, 1.0)).r * inside(gu);
  float auroraAmt = mix(1.0, smoothstep(0.2, 0.6, sl), uCityAmt);
  col += aurora * smoothstep(0.3, 0.6, vH) * cap * 0.75 * auroraAmt;
  // Cursor casts a faint amethyst glow.
  float pd = length(vWorld.xy - uPointer);
  col += uAccent2 * 0.07 * exp(-pd * pd * 2.0) * cap;

  // ── The city at sunset ────────────────────────────────────
  vec3 cityEmit = vec3(0.0);
  if (uCityAmt > 0.001) {
    float seed = fract(sin(dot(vPinUv, vec2(12.9898, 78.233))) * 43758.5453);
    // Low sun from the west, violet sky fill, warm bounce off the ground.
    vec3 sunDir = normalize(uSunDir);
    vec3 sunCol = uSunCol;
    vec3 skyCol = uSkyCol;
    float sunD = max(dot(n, sunDir), 0.0);
    vec3 amb = skyCol * (0.45 + 0.35 * n.z) + vec3(0.18, 0.1, 0.08) * (1.0 - n.z) * 0.4;
    // Pins deep in a canyon get less sun (cheap occlusion by depth below the top).
    float sunVis = mix(0.25, 1.0, smoothstep(-0.5, 0.0, vDepth + vH * 0.8));
    vec3 lightIn = amb * ao + sunCol * sunD * sunVis;
    lightIn += vec3(0.75, 0.8, 1.0) * uFlash * (0.4 + 0.6 * n.z) * 2.5; // lightning

    float lc = floor(vLight + 0.5);
    vec3 surf;
    if (lc < 0.5 && vMat > -0.5) {
      // Buildings
      vec3 matCol = vMat < 0.12 ? vec3(0.62, 0.6, 0.58)       // concrete
                  : vMat < 0.37 ? vec3(0.22, 0.3, 0.4)        // glass
                  : vMat < 0.62 ? vec3(0.62, 0.36, 0.27)      // brick
                  : vMat < 0.87 ? vec3(0.46, 0.47, 0.43)      // industrial
                  : vec3(0.4, 0.38, 0.36);                     // pavement
      surf = matCol * lightIn;
      if (vMat > 0.12 && vMat < 0.37) {
        // Glass catches the sunset
        float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
        vec3 refl = mix(vec3(0.95, 0.5, 0.35), vec3(0.4, 0.3, 0.6), clamp(reflect(-V, n).z, 0.0, 1.0));
        surf = mix(surf, refl, 0.25 + fres * 0.5) + sunCol * pow(max(dot(reflect(-sunDir, n), V), 0.0), 40.0) * 0.8;
      }
      if (vMat > 0.37 && vMat < 0.62 && cap > 0.5) surf *= vec3(0.85, 0.6, 0.55); // terracotta roofs
      // Windows on facades: one per pin per floor, a few already lit at dusk.
      if (cap < 0.5 && vH > 0.03 && vMat < 0.87) {
        float z = vWorld.z;
        float floorH = 1.0 / 26.0;
        float gap = step(0.3, fract(z / floorH)) * step(0.015, z) * step(z, vH - 0.012);
        float litP = (vMat < 0.37 ? 0.38 : vMat < 0.62 ? 0.25 : 0.3) * uWindows / 0.3;
        float lit = step(1.0 - litP, fract(sin(seed * 91.7 + floor(z / floorH) * 13.1) * 4375.85));
        lit = max(lit, exp(-pd * pd / 1.2) * step(0.3, seed)); // the cursor switches a district on
        vec3 wc = mix(vec3(1.0, 0.78, 0.48), vec3(0.75, 0.95, 1.0), step(0.8, seed));
        surf = mix(surf, surf * 0.55, gap * (1.0 - lit));
        cityEmit += wc * lit * gap * 0.75;
      }
      cityEmit += vec3(1.0, 0.2, 0.25) * step(0.72, vH) * cap * step(0.55, fract(uTime * 0.7 + seed)) * 0.9; // beacons
    } else if (lc < 0.5) {
      // Empty road / rail bed: near-black asphalt lit by the current sun and sky.
      // Wet roads darken and pick up mirror reflections of the sky and a sun glare streak.
      float dryK = mix(1.0, 0.55, uWet);
      vec3 asphalt = vec3(0.035, 0.035, 0.04) * lightIn * dryK;
      float glare = pow(max(dot(reflect(-sunDir, n), V), 0.0), mix(20.0, 90.0, uWet));
      float fresR = pow(1.0 - max(dot(n, V), 0.0), 4.0);
      surf = asphalt + sunCol * glare * mix(0.04, 0.9, uWet) + skyCol * fresR * uWet * 0.6;
    } else if (lc < 1.5) {
      surf = vec3(0.12, 0.12, 0.14) * lightIn;
      cityEmit += vec3(0.95, 0.98, 1.0) * 1.4 * cap; // headlights
    } else if (lc < 2.5) {
      surf = vec3(0.12, 0.12, 0.14) * lightIn;
      cityEmit += vec3(1.0, 0.18, 0.2) * 1.2 * cap; // tail-lights
    } else if (lc < 3.5) {
      surf = vec3(0.55, 0.58, 0.6) * lightIn;
      cityEmit += uAccent * step(0.5, fract(vWorld.z * 40.0)) * (1.0 - cap) * 0.6; // train windows
    } else if (lc < 4.5) {
      // Sea: violet water with a sun path glittering toward the camera
      surf = mix(uSkyCol * 0.3 + vec3(0.02, 0.03, 0.06), uHazeNear * 0.45, smoothstep(0.85, 1.0, vPinUv.y)) * mix(1.0, 0.6, uSnow);
      float path = exp(-pow((vPinUv.x - uSunX) * 4.0, 2.0));
      float glint = step(0.93 - path * 0.25, fract(seed * 7.0 + uTime * 0.6 * (0.5 + seed)));
      cityEmit += vec3(1.0, 0.62, 0.32) * glint * (0.3 + path) * cap * 0.9;
    } else if (lc < 5.5) {
      surf = vec3(0.2) * lightIn;
      cityEmit += vec3(1.0, 0.82, 0.55) * 1.2 * cap; // promenade lamps
    } else if (lc < 6.5) {
      // Greenery: lawn, and canopies that go gold where the sun hits.
      vec3 lawn = uLawn;
      vec3 leaf = mix(uLeafA, uLeafB, seed);
      vec3 g = mix(lawn, leaf, smoothstep(0.02, 0.06, vH));
      surf = g * lightIn;
      // Lamplight on nearby trees: warm on the canopy with a green sheen and a glint on top.
      float lampNear = clamp((vLight - 6.0) / 0.45, 0.0, 1.0) * uFence;
      if (lampNear > 0.001) {
        float canopy = smoothstep(0.02, 0.06, vH);
        vec3 warmLeaf = mix(leaf, vec3(0.55, 0.62, 0.2), 0.45) * vec3(1.0, 0.85, 0.55);
        cityEmit += warmLeaf * lampNear * (0.28 + 0.22 * canopy) * mix(0.6, 1.0, cap);
        cityEmit += vec3(0.95, 0.9, 0.55) * lampNear * canopy * cap * step(0.7, seed) * 0.3; // leaf glint
      }
      // Plaza forecourt reads as pale stone
      vec2 gp = (vPinUv - uGlyphRect.xy) / uGlyphRect.zw;
      surf = mix(surf, vec3(0.55, 0.5, 0.47) * lightIn, inside((gp - 0.5) * 0.85 + 0.5) * step(vH, 0.02));
    } else if (lc < 7.5) {
      // The SL HQ: dark glass, every floor lit, a scan of light climbing the tower.
      surf = vec3(0.1, 0.12, 0.18) * lightIn + sunCol * pow(max(dot(reflect(-sunDir, n), V), 0.0), 30.0) * 0.6;
      float z = vWorld.z;
      float floorGap = step(0.3, fract(z * 26.0)) * step(0.02, z) * (1.0 - cap);
      float scan = smoothstep(0.12, 0.0, abs(fract(z * 0.8 - uTime * 0.35) - 0.5) - 0.38);
      cityEmit += mix(uAccent, uAccent2, sweep) * floorGap * (0.22 + scan * 0.8);
      cityEmit += mix(uAccent, uAccent2, sweep) * cap * 0.35; // lit crown
      // The SL sign across the facade facing the city (−y), letters as tall as the tower.
      if (n.y < -0.5) {
        vec2 hq = (vPinUv - uGlyphRect.xy) / uGlyphRect.zw;
        vec2 su = vec2((hq.x - 0.27) / 0.46, clamp((z - 0.12) / 0.85, 0.0, 1.0));
        float sign = smoothstep(0.45, 0.6, texture2D(uGlyph, vec2(0.27 + su.x * 0.46, 0.14 + su.y * 0.72)).r);
        surf *= 1.0 - sign * 0.6;
        cityEmit += mix(uAccent, uAccent2, su.x) * sign * 1.6;
      }
    } else if (lc < 11.5) {
      // Social skyscrapers: dark glass, brand-coloured edge lights, and the logo lit on the facade.
      int li = int(lc - 8.0);
      vec4 r = uLand[0]; float H = uLandH[0]; float F = uLandF[0]; vec3 bc = uLandColor[0];
      if (li == 1) { r = uLand[1]; H = uLandH[1]; F = uLandF[1]; bc = uLandColor[1]; }
      if (li == 2) { r = uLand[2]; H = uLandH[2]; F = uLandF[2]; bc = uLandColor[2]; }
      if (li == 3) { r = uLand[3]; H = uLandH[3]; F = uLandF[3]; bc = uLandColor[3]; }
      float hover = 1.0 - step(0.5, abs(uLandHover - float(li)));
      vec2 lq = (vPinUv - r.xy) / (r.zw - r.xy);
      float z = vWorld.z;
      surf = vec3(0.08, 0.1, 0.14) * lightIn + sunCol * pow(max(dot(reflect(-sunDir, n), V), 0.0), 30.0) * 0.5;
      // the logo panel first, so the windows can stop where it is
      float on = 0.0;
      vec3 logoCol = vec3(0.0);
      if (n.y < -0.5 && lq.y < 0.2) {
        float lw = (r.z - r.x) * uWall.x;
        float v = (z - (F * 0.95 - lw)) / lw;
        vec2 lqF = ((vWorld.xy / uWall + 0.5) - r.xy) / (r.zw - r.xy);
        vec4 logo = texture2D(uLogos, vec2((float(li) + clamp(lqF.x, 0.02, 0.98)) / 4.0, v));
        on = logo.a * step(0.0, v) * step(v, 1.0);
        // a touch of extra saturation so the brand colours survive the tone mapping and haze
        logoCol = mix(vec3(dot(logo.rgb, vec3(0.299, 0.587, 0.114))), logo.rgb, 1.35);
      }
      float floors = step(0.35, fract(z * 26.0)) * (1.0 - cap) * step(0.6, fract(seed * 13.0 + floor(z * 26.0) * 0.37)) * (1.0 - on);
      cityEmit += vec3(1.0, 0.85, 0.6) * floors * 0.25;
      float edgeL = step(lq.x, 0.1) + step(0.9, lq.x);
      cityEmit += bc * edgeL * (1.0 - cap) * (0.5 + hover * 0.8 * (0.6 + 0.4 * sin(uTime * 6.0)));
      cityEmit += bc * cap * step(H * 0.97, vH) * (0.6 + hover); // topmost crown
      surf = mix(surf, vec3(0.0), on);
      cityEmit += max(logoCol, 0.0) * on * (2.1 + hover * 0.9);
    } else if (lc < 12.5) {
      // Park fence lamp post: dark iron, warm globe on top once it gets dark.
      surf = vec3(0.06, 0.06, 0.07) * lightIn;
      cityEmit += vec3(1.0, 0.7, 0.36) * (cap * 0.9 + (1.0 - cap) * 0.06) * uFence; // lamp head; the post stays dark iron
    } else if (lc < 13.5) {
      // Fence rail between posts, catching the lamp glow.
      surf = vec3(0.1, 0.1, 0.11) * lightIn;
      cityEmit += vec3(1.0, 0.72, 0.4) * 0.06 * uFence;
    } else if (lc < 14.5) {
      // Lawn inside the fence, lit warm by the lamps.
      float seedL = fract(sin(dot(vPinUv, vec2(3.1, 7.7))) * 437.5);
      surf = mix(uLawn, uLeafA, step(0.6, seedL)) * lightIn;
      cityEmit += vec3(1.0, 0.75, 0.42) * 0.16 * uFence * cap;
    } else {
      surf = vec3(0.24, 0.23, 0.25) * lightIn; // asphalt
    }
    // Snow settles on every upward face except the sea; windows and lights stay emissive.
    if (lc < 3.5 || lc > 4.5) {
      float drift = smoothstep(0.2, 0.7, fract(sin(seed * 51.3) * 913.1));
      float cover = uSnow * cap * mix(0.75, 1.0, drift);
      surf = mix(surf, vec3(0.86, 0.9, 0.97) * (lightIn * 0.9 + 0.08), cover);
    }
    col = mix(col, surf, uCityAmt);
    cityEmit *= uCityAmt;
  }

  // Recede behind copy while a project or case study is on screen.
  col *= 1.0 - 0.45 * max(uWork, uCase);

  // Project image, sampled per fragment on the caps so flat pins read as one crisp picture.
  vec2 wuv = vWorld.xy / uWall + 0.5;
  vec2 fu = (wuv - uFrame.xy) / (uFrame.zw - uFrame.xy);
  vec2 pfu = (vPinUv - uFrame.xy) / (uFrame.zw - uFrame.xy);
  if (inside(pfu) > 0.0 && uWork > 0.001) {
    float wf = uMix * 1.5 - 0.25 + (pfu.y - 0.5) * 0.3;
    bool useB = pfu.x < wf;
    vec2 su = clamp(fu, 0.0, 1.0);
    vec3 img = useB ? texture2D(uTexB, su).rgb : texture2D(uTexA, su).rgb;
    // Hovered + flat: the pins become a screen playing the project's reel.
    if (!useB) img = mix(img, texture2D(uVideo, su).rgb, uVideoAmt);
    float relief = smoothstep(0.015, 0.2, abs(vH));
    vec3 lit = img * mix(1.0, 0.45 + diff * 0.9, relief) + spec * 0.25 * relief;

    // Model shading: graphite at the base, the project's accent toward the top,
    // flecked with the screenshot's own colour per pin.
    vec3 pinImg = useB ? texture2D(uTexB, clamp(pfu, 0.0, 1.0)).rgb : texture2D(uTexA, clamp(pfu, 0.0, 1.0)).rgb;
    vec3 accent = useB ? uAccentB : uAccentA;
    vec3 body = mix(uBase * 0.8, accent, smoothstep(0.08, 1.3, vH) * 0.9) + pinImg * 0.2 * smoothstep(0.05, 0.5, vH);
    vec3 model = body * (0.12 + diff * 1.15) * ao + spec * 0.5 * ao;
    model += accent * 0.25 * cap * smoothstep(0.9, 1.35, vH);

    vec3 shown = mix(model, lit * mix(0.35, 1.0, cap), uFlat);
    col = mix(col, shown, uWork);
  }

  // Case: tint the emboss with the project's own colours.
  if (uCase > 0.001) {
    vec3 cm = mix(uBase * 0.8, uCaseAccent, smoothstep(0.08, 1.3, vH) * 0.85) * (0.12 + diff * 1.1) * ao + spec * 0.4 * ao;
    col = mix(col, cm * 0.65, uCase * smoothstep(0.03, 0.2, vH));
  }

  // Intro: pins switch on row by row behind the rising wave, with a bright crest.
  float front = mix(-0.3, 1.3, uIntro);
  float on = 1.0 - smoothstep(front - 0.03, front + 0.1, vPinUv.y);
  float crest = exp(-pow((vPinUv.y - front) * 28.0, 2.0)) * (1.0 - smoothstep(0.85, 1.0, uIntro));
  // Before the wave the city is a dark silhouette lit only by its traffic and windows.
  // After the wave the city stays at dusk exposure (only in the city; work/about are unaffected).
  float exposure = mix(1.0, uExposure, uCityAmt);
  col = col * mix(0.16, exposure, on) + cityEmit;
  col += mix(uAccent, uAccent2, vPinUv.x) * crest * 0.9 * cap;

  // Wall edges dissolve into the dark.
  float edge = smoothstep(0.0, 0.1, wuv.x) * smoothstep(1.0, 0.9, wuv.x) * smoothstep(0.0, 0.1, wuv.y) * smoothstep(1.0, 0.9, wuv.y);
  float fog = smoothstep(9.0, 22.0, length(uCam - vWorld));

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  // Blend to the background after tone mapping so faded pins match the clear colour exactly.
  // In the city the far edge dissolves into sunset haze instead, meeting the sky at the horizon.
  float far = smoothstep(0.55, 1.0, wuv.y);
  vec3 haze = mix(uHazeNear, uHazeFar, smoothstep(0.85, 1.0, wuv.y)) + vec3(0.6, 0.65, 0.8) * uFlash * 0.4;
  vec3 fadeTo = mix(uBg, haze, uCityAmt * far);
  gl_FragColor.rgb = mix(fadeTo, gl_FragColor.rgb, edge * (1.0 - fog));
  gl_FragColor.rgb = mix(gl_FragColor.rgb, haze, uCityAmt * far * far * 0.3);
  #include <colorspace_fragment>
}
`;
