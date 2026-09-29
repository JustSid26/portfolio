import { create } from "zustand";
import { DEFAULT_WEATHER, type Weather } from "./weather";

export type Route = { kind: "home" } | { kind: "case"; index: number };
export type TransitionPhase = "idle" | "out" | "in";

type State = {
  // Preloader
  sceneReady: boolean;
  loaded: boolean; // preloader finished, intro may play
  // Routing
  route: Route;
  transition: TransitionPhase;
  // Work section
  hovered: number; // project index under cursor, -1 none
  // Environment
  reducedMotion: boolean;
  lowPower: boolean;
  // City weather / time of day
  weather: Weather;
  // About: the pin laptop shows skills.json when clicked
  skillsOpen: boolean;

  set: (partial: Partial<Omit<State, "set">>) => void;
};

export const useStore = create<State>((set) => ({
  sceneReady: false,
  loaded: false,
  route: { kind: "home" },
  transition: "idle",
  hovered: -1,
  reducedMotion: false,
  lowPower: false,
  weather: DEFAULT_WEATHER,
  skillsOpen: false,
  set: (partial) => set(partial),
}));
