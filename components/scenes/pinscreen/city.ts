// Procedural city laid out one texel per pin. Loosely Mumbai: a street grid, a CBD of
// glass towers around the SL HQ, mid-rise blocks, brick-house neighbourhoods, industrial
// sheds by the rail, two elevated rail lines, and a curved seafront promenade.
//
// Texture channels (float):
//   R  height of this pin (building profile incl. setbacks, roofs, rooftop tanks)
//   G  cell code  (see CODE)
//   B  road/track id for roads; material for lots (see MAT)
//   A  lot random 0..1 (rise order during load, window seed)
import { DataTexture, FloatType, NearestFilter, RGBAFormat } from "three";

export const CODE = {
  lot: 0,
  roadEast: 1,
  roadWest: 2,
  roadNorth: 3,
  roadSouth: 4,
  railH: 5,
  railV: 6,
  sea: 7,
  park: 8,
  promenade: 9,
} as const;

export const MAT = { concrete: 0, glass: 0.25, brick: 0.5, industrial: 0.75, pavement: 1 } as const;

export type CityStats = { blocks: number; buildings: number; houses: number; lanes: number; cars: number };
// A straight lane (or rail track) in world units. axis x: runs along x at y = coord.
export type Lane = { axis: 0 | 1 | 2; coord: number; dir: 1 | -1; min: number; max: number };
export type TruckRoad = { axis: "x" | "y"; lane: [number, number]; along: [number, number] }; // world units

type Plaza = { x0: number; y0: number; x1: number; y1: number };

export function generateCity(
  cols: number,
  rows: number,
  plaza: Plaza,
  spacing: number,
  wallW: number,
  wallH: number,
  reserved: Plaza[] = [], // landmark footprints: paved and kept clear
) {
  const data = new Float32Array(cols * rows * 4);
  let seed = 20260924;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const U = 1 / spacing; // cells per world unit
  const idx = (x: number, y: number) => (y * cols + x) * 4;
  const set = (x: number, y: number, r: number, g: number, b: number, a: number) => {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return;
    const i = idx(x, y);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  };
  const code = (x: number, y: number) => data[idx(x, y) + 1];

  const coastY = (x: number) => Math.floor(rows * (0.87 + 0.055 * Math.cos((x / cols - 0.42) * Math.PI * 1.5)));

  // Street cuts: 2-cell roads (one lane each way), blocks 0.55–1.1 world units.
  const cuts = (n: number) => {
    const out: number[] = [];
    let p = Math.floor(U * 0.2 + rnd() * U * 0.3);
    while (p < n - 3) {
      out.push(p);
      p += 2 + Math.floor(U * (0.55 + rnd() * 0.55));
    }
    return out;
  };
  const xCuts = cuts(cols);
  const yCuts = cuts(rows);
  const railRow = Math.floor(rows * 0.34);
  const railCol = Math.floor(cols * 0.24);

  const pcx = ((plaza.x0 + plaza.x1) / 2) * cols;
  const pcy = ((plaza.y0 + plaza.y1) / 2) * rows;
  const span = Math.hypot(cols, rows);

  // Truck access: the street row / column nearest the HQ.
  const truckRow = yCuts.reduce((a, b) => (Math.abs(b + 1 - pcy) < Math.abs(a + 1 - pcy) ? b : a), yCuts[0]);
  const truckCol = xCuts.reduce((a, b) => (Math.abs(b + 1 - pcx) < Math.abs(a + 1 - pcx) ? b : a), xCuts[0]);

  let blocks = 0;
  let buildings = 0;
  let houses = 0;

  const fillBox = (x0: number, y0: number, x1: number, y1: number, fn: (x: number, y: number, e: number) => void) => {
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) fn(x, y, Math.min(x - x0, y - y0, x1 - 1 - x, y1 - 1 - y));
  };

  const bounds = (list: number[], n: number) => {
    const b: [number, number][] = [];
    let s = 0;
    for (const c of list) {
      b.push([s, c]);
      s = c + 2;
    }
    b.push([s, n]);
    return b;
  };

  // Split a rectangle into lots.
  const split = (r: [number, number, number, number], minSide: number, times: number) => {
    const lots = [r];
    for (let k = 0; k < times; k++) {
      const i = Math.floor(rnd() * lots.length);
      const [x0, y0, x1, y1] = lots[i];
      const w = x1 - x0;
      const h = y1 - y0;
      if (w >= h && w >= minSide * 2) {
        const m = x0 + minSide + Math.floor(rnd() * (w - minSide * 2 + 1));
        lots.splice(i, 1, [x0, y0, m, y1], [m, y0, x1, y1]);
      } else if (h >= minSide * 2) {
        const m = y0 + minSide + Math.floor(rnd() * (h - minSide * 2 + 1));
        lots.splice(i, 1, [x0, y0, x1, m], [x0, m, x1, y1]);
      }
    }
    return lots;
  };

  for (const [bx0, bx1] of bounds(xCuts, cols))
    for (const [by0, by1] of bounds(yCuts, rows)) {
      if (bx1 - bx0 < 4 || by1 - by0 < 4) continue;
      blocks++;
      // Sidewalk ring with the odd street tree
      fillBox(bx0, by0, bx1, by1, (x, y, e) => {
        if (e === 0) {
          const tree = rnd() < 0.22;
          set(x, y, tree ? 0.05 : 0.008, tree ? CODE.park : CODE.lot, MAT.pavement, rnd());
        }
      });
      const ix0 = bx0 + 1;
      const iy0 = by0 + 1;
      const ix1 = bx1 - 1;
      const iy1 = by1 - 1;
      const cx = (bx0 + bx1) / 2;
      const cy = (by0 + by1) / 2;
      const d = Math.hypot(cx - pcx, (cy - pcy) * 1.3) / span;
      const nearRail = Math.abs(cy - railRow) < U * 0.9 || Math.abs(cx - railCol) < U * 0.9;

      // Parks: more of them out of the core, and a big maidan near the seafront.
      const maidan = cy > rows * 0.66 && cy < rows * 0.8 && Math.abs(cx - cols * 0.62) < U * 1.4;
      if (maidan || rnd() < (d < 0.2 ? 0.05 : 0.15)) {
        fillBox(ix0, iy0, ix1, iy1, (x, y) => set(x, y, 0, CODE.park, 0, rnd()));
        continue;
      }

      if (d < 0.2) {
        // CBD: glass & concrete towers with setbacks and crowns
        for (const [x0, y0, x1, y1] of split([ix0, iy0, ix1, iy1], 4, 3)) {
          buildings++;
          const glass = rnd() < 0.6;
          const h = (0.35 + (1 - d / 0.2) * 0.45) * (0.55 + rnd() * 0.45);
          const setback = rnd() < 0.7;
          const a = rnd();
          const tank = [x0 + 1 + Math.floor(rnd() * Math.max(1, x1 - x0 - 2)), y0 + 1 + Math.floor(rnd() * Math.max(1, y1 - y0 - 2))];
          fillBox(x0, y0, x1, y1, (x, y, e) => {
            let hh = h;
            if (setback && e < 1) hh = h * 0.62; // podium
            if (setback && e >= 2) hh += 0.05; // crown
            if (x === tank[0] && y === tank[1]) hh += 0.03;
            set(x, y, hh, CODE.lot, glass ? MAT.glass : MAT.concrete, a);
          });
        }
      } else if (nearRail && rnd() < 0.7) {
        // Industrial sheds with sawtooth roofs
        for (const [x0, y0, x1, y1] of split([ix0, iy0, ix1, iy1], 5, 1)) {
          buildings++;
          const h = 0.06 + rnd() * 0.04;
          const a = rnd();
          fillBox(x0, y0, x1, y1, (x, y) => set(x, y, h + ((x - x0) % 3 === 0 ? 0.018 : 0), CODE.lot, MAT.industrial, a));
        }
      } else if (d < 0.36) {
        // Mid-rise blocks, sometimes with a courtyard
        for (const [x0, y0, x1, y1] of split([ix0, iy0, ix1, iy1], 4, 2)) {
          buildings++;
          const h = 0.12 + rnd() * 0.2;
          const court = x1 - x0 >= 7 && y1 - y0 >= 7 && rnd() < 0.5;
          const a = rnd();
          const mat = rnd() < 0.5 ? MAT.concrete : MAT.brick;
          fillBox(x0, y0, x1, y1, (x, y, e) => {
            if (court && e >= 2) set(x, y, 0.01, CODE.park, 0, a);
            else set(x, y, h + (rnd() < 0.03 ? 0.025 : 0), CODE.lot, mat, a);
          });
        }
      } else {
        // Houses: small brick homes with pitched roofs and gardens between
        for (const [x0, y0, x1, y1] of split([ix0, iy0, ix1, iy1], 3, 12)) {
          const w = x1 - x0;
          const h = y1 - y0;
          if (w < 3 || h < 3) {
            fillBox(x0, y0, x1, y1, (x, y) => set(x, y, 0.004, CODE.park, 0, rnd()));
            continue;
          }
          houses++;
          const eave = 0.045 + rnd() * 0.035;
          const alongX = w >= h;
          const a = rnd();
          fillBox(x0, y0, x1, y1, (x, y, e) => {
            if (e === 0 && rnd() < 0.5) return set(x, y, 0.004, CODE.park, 0, a); // garden edge
            // Ridge: distance from the long axis centre line
            const t = alongX ? Math.abs(y - (y0 + y1 - 1) / 2) / (h / 2) : Math.abs(x - (x0 + x1 - 1) / 2) / (w / 2);
            set(x, y, eave + (1 - t) * 0.035, CODE.lot, MAT.brick, a);
          });
        }
      }
    }

  // Roads
  let lanes = 0;
  let roadPins = 0;
  for (const c of xCuts) {
    const id = rnd();
    lanes += 2;
    for (let y = 0; y < rows; y++) {
      set(c, y, 0, CODE.roadNorth, id, rnd());
      set(c + 1, y, 0, CODE.roadSouth, id + 0.5, rnd());
      roadPins += 2;
    }
  }
  for (const c of yCuts) {
    const id = rnd();
    lanes += 2;
    for (let x = 0; x < cols; x++) {
      set(x, c, 0, CODE.roadEast, id, rnd());
      set(x, c + 1, 0, CODE.roadWest, id + 0.5, rnd());
      roadPins += 2;
    }
  }

  // Elevated rail
  for (let x = 0; x < cols; x++) {
    set(x, railRow, 0, CODE.railH, 0, 0.1);
    set(x, railRow + 1, 0, CODE.railH, 1, 0.1);
  }
  for (let y = 0; y < rows; y++) {
    set(railCol, y, 0, CODE.railV, 0, 0.1);
    set(railCol + 1, y, 0, CODE.railV, 1, 0.1);
  }

  // Landmark lots: paved forecourts the social towers stand on.
  for (const r of reserved) {
    const x0 = Math.floor((r.x0 - 0.012) * cols);
    const x1 = Math.ceil((r.x1 + 0.012) * cols);
    const y0 = Math.floor((r.y0 - 0.02) * rows);
    const y1 = Math.ceil((r.y1 + 0.02) * rows);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) set(x, y, 0.006, CODE.park, 0, 0);
  }

  // HQ plaza: paved forecourt around the SL tower; the truck roads run straight through.
  const px0 = Math.floor((plaza.x0 - 0.025) * cols);
  const px1 = Math.ceil((plaza.x1 + 0.025) * cols);
  const py0 = Math.floor((plaza.y0 - 0.03) * rows);
  const py1 = Math.ceil((plaza.y1 + 0.03) * rows);
  for (let y = py0; y < py1; y++)
    for (let x = px0; x < px1; x++) {
      const isTruckRoad = y === truckRow || y === truckRow + 1 || x === truckCol || x === truckCol + 1;
      if (isTruckRoad && code(x, y) >= CODE.roadEast && code(x, y) <= CODE.roadSouth) continue;
      set(x, y, 0.006, CODE.park, 0, 0);
    }

  // Sea and promenade
  for (let x = 0; x < cols; x++) {
    const c0 = coastY(x);
    for (let y = c0; y < rows; y++) set(x, y, 0, CODE.sea, 0, rnd());
    set(x, c0 - 1, 0, CODE.promenade, 0.2, rnd());
    set(x, c0 - 2, 0, CODE.promenade, 0.7, rnd());
    roadPins += 2;
  }

  const texture = new DataTexture(data, cols, rows, RGBAFormat, FloatType);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.needsUpdate = true;

  const wx = (cx: number) => ((cx + 0.5) / cols - 0.5) * wallW;
  const wy = (cy: number) => ((cy + 0.5) / rows - 0.5) * wallH;
  const truckRoads: TruckRoad[] = [
    { axis: "x", lane: [wy(truckRow), wy(truckRow + 1)], along: [-wallW / 2, wallW / 2] },
    { axis: "y", lane: [wx(truckCol), wx(truckCol + 1)], along: [-wallH / 2, wy(coastY(truckCol) - 3)] },
  ];

  // Lamp posts: exactly where the sim raises fence posts — on a park/plaza cell with a
  // non-park neighbour, every 5th cell (matches mod(cell.x + cell.y, 5) in the shader,
  // where cell is the texel centre, hence the +1).
  const isFencedPark = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return false;
    const i = idx(x, y);
    const r = data[i];
    return Math.abs(data[i + 1] - CODE.park) < 0.5 && data[i + 2] < 0.001 && (r < 0.001 || Math.abs(r - 0.006) < 0.0008);
  };
  const lampList: number[] = [];
  for (let y = 1; y < rows - 1; y++)
    for (let x = 1; x < cols - 1; x++) {
      if ((x + y + 1) % 5 !== 0 || !isFencedPark(x, y)) continue;
      if (isFencedPark(x + 1, y) && isFencedPark(x - 1, y) && isFencedPark(x, y + 1) && isFencedPark(x, y - 1)) continue;
      lampList.push(wx(x), wy(y));
    }

  // Every drivable lane / track, for the instanced vehicles.
  const coastWorld = (cx: number) => wy(coastY(cx) - 3);
  const laneList: Lane[] = [];
  for (const c of xCuts) {
    const top = coastWorld(c);
    laneList.push({ axis: 1, coord: wx(c), dir: 1, min: -wallH / 2, max: top });
    laneList.push({ axis: 1, coord: wx(c + 1), dir: -1, min: -wallH / 2, max: top });
  }
  for (const c of yCuts) {
    if (c + 1 >= coastY(Math.floor(cols / 2)) - 4) continue; // rows swallowed by the sea
    laneList.push({ axis: 0, coord: wy(c), dir: 1, min: -wallW / 2, max: wallW / 2 });
    laneList.push({ axis: 0, coord: wy(c + 1), dir: -1, min: -wallW / 2, max: wallW / 2 });
  }
  // Promenade: follows the curved coast (axis 2), one lane each way.
  laneList.push({ axis: 2, coord: -1, dir: 1, min: -wallW / 2, max: wallW / 2 });
  laneList.push({ axis: 2, coord: -2, dir: -1, min: -wallW / 2, max: wallW / 2 });
  const rails: Lane[] = [
    { axis: 0, coord: wy(railRow), dir: 1, min: -wallW / 2, max: wallW / 2 },
    { axis: 0, coord: wy(railRow + 1), dir: -1, min: -wallW / 2, max: wallW / 2 },
    { axis: 1, coord: wx(railCol), dir: 1, min: -wallH / 2, max: coastWorld(railCol) },
    { axis: 1, coord: wx(railCol + 1), dir: -1, min: -wallH / 2, max: coastWorld(railCol) },
  ];
  // Coast curve for the promenade lanes: world y of the coast row at world x.
  const coast = { rows, cols, wallW, wallH };

  const stats: CityStats = {
    blocks,
    buildings,
    houses,
    lanes,
    cars: Math.round((roadPins / 8) * 0.65),
  };
  return { texture, stats, truckRoads, lanes: laneList, rails, coast, lamps: new Float32Array(lampList) };
}
