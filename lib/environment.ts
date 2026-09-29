import { Color, Vector3 } from "three";

// Scene lighting & weather, shared (by reference) by every shader that lights the city.
// lib/weather.ts tweens these between presets; shaders pick the new values up next frame.
export const environment = {
  sunDir: new Vector3(-0.82, 0.38, 0.3).normalize(),
  sunColor: new Color(1.0, 0.56, 0.3).multiplyScalar(1.55),
  skyColor: new Color(0.32, 0.26, 0.5), // ambient fill from the sky
  exposure: 0.22, // daylight reaching facades; low = dusk (dark walls, glowing windows)
  windows: 0.3, // fraction of windows lit
  wetness: 0, // wet roads: darker, mirror-like
  snow: 0, // snow cover on roofs, parks, roads
  rain: 0, // falling rain amount
  snowfall: 0, // falling snow amount
  flash: 0, // lightning, 0..1 (driven by the weather controller)
  leafA: new Color(0.1, 0.3, 0.12), // tree canopy colours
  leafB: new Color(0.2, 0.42, 0.14),
  lawn: new Color(0.18, 0.34, 0.14),
  hazeNear: new Color(0.62, 0.34, 0.36), // far-city haze
  hazeFar: new Color(0.95, 0.52, 0.32),
  // Sky gradient, horizon → zenith
  skyHorizon: new Color(1.0, 0.64, 0.3),
  skyLow: new Color(0.95, 0.42, 0.38),
  skyMid: new Color(0.36, 0.2, 0.46),
  skyZenith: new Color(0.07, 0.06, 0.2),
  sunDisc: new Color(1.0, 0.8, 0.5), // sun or moon
  sunVisible: 1,
  sunX: 0.2, // horizontal sky position, 0 left (west) → 1 right (east)
  sunHeight: 0.035, // disc height above the horizon (screen units)
  sunSize: 0.032,
  stars: 0.7,
  overcast: 0,
};

export type Environment = typeof environment;
