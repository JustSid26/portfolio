"use client";

import { useEffect } from "react";
import { GoogleAnalytics, sendGAEvent } from "@next/third-parties/google";

/* Google Analytics 4, on the live site only (not local dev, not Vercel previews), so visits are
   real visits. Page views, route changes included, come from the tag itself; the few things a
   portfolio actually wants to know are sent as events, from one listener each rather than wired
   into every component:
     project_open   a project's case page link was followed       { project }
     video_play     a reel on a case page started playing          { video }
     contact_click  the email or a social link was followed        { channel }
     outbound_click any other link off the site                    { url }
     section_view   a home section came into view, once per visit   { section } */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-09311ZH9S4";
const LIVE = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

export function Analytics() {
  useEffect(() => {
    if (!LIVE) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (!a || !href) return;
      if (href.startsWith("/work/")) sendGAEvent("event", "project_open", { project: href.slice(6) });
      else if (href.startsWith("mailto:")) sendGAEvent("event", "contact_click", { channel: "email" });
      else if (/^https?:\/\//.test(href) && !href.includes(location.host)) {
        const host = new URL(href).hostname.replace(/^www\./, "");
        const social = /linkedin|github|instagram|twitter|x\.com|behance|dribbble/.exec(host)?.[0];
        if (social) sendGAEvent("event", "contact_click", { channel: social });
        else sendGAEvent("event", "outbound_click", { url: href });
      }
    };
    // play doesn't bubble: listen in the capture phase to hear every video on the page
    const onPlay = (e: Event) => {
      const v = e.target as HTMLVideoElement;
      if (v.tagName !== "VIDEO" || v.dataset.gaPlayed) return;
      v.dataset.gaPlayed = "1"; // once per video, not once per loop
      sendGAEvent("event", "video_play", { video: (v.currentSrc || v.src).split("/").slice(-2).join("/") });
    };
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((en) => {
          const id = (en.target as HTMLElement).id;
          if (!en.isIntersecting || !id || seen.has(id)) return;
          seen.add(id);
          sendGAEvent("event", "section_view", { section: id });
        }),
      { threshold: 0.3 },
    );
    const watch = () => document.querySelectorAll("main section[id]").forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch); // sections mount as routes change
    mo.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", onClick, true);
    document.addEventListener("play", onPlay, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("play", onPlay, true);
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return LIVE ? <GoogleAnalytics gaId={GA_ID} /> : null;
}
