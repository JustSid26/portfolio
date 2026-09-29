"use client";

import { useEffect } from "react";
import { enterPage } from "@/lib/transition";
import { useStore, type Route } from "@/lib/store";

// Mounted by each page: tells the canvas which route it is on and runs the enter animation.
export function PageEnter({ route }: { route: Route }) {
  const set = useStore((s) => s.set);
  const kind = route.kind;
  const index = route.kind === "case" ? route.index : -1;

  useEffect(() => {
    set({ route: kind === "case" ? { kind, index } : { kind: "home" } });
    enterPage();
  }, [kind, index, set]);

  return null;
}
