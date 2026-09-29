# Portfolio Site — Build Brief

You are building my personal portfolio site. Target: Awwwards Site of the Day / SOTY-tier. Treat this as a creative-tech studio project, not a template.

## Who this is for
Siddharth Lama — third-year Btech student. Positioning: a student who already ships real work — production sites and campaigns for actual brands at Dizrupt (a Mumbai digital marketing agency + product incubator), plus personal builds and academic projects. Don't frame it as "student portfolio"; frame it as a builder with a track record. Voice: direct, confident, no fluff. No "aspiring" language anywhere.

Work section mixes two buckets, presented equally:
- **Agency work at Dizrupt:** lead gen, payment recon, runaya.com website — credit as "at Dizrupt", show my specific role on each (e.g. "frontend build", "WebGL scene", "content system")
- **Own projects:** databench, studydesk and choose one more

About section: what I'm studying, what I actually do at Dizrupt, what I want to build next.

## Stack (non-negotiable)
- Next.js 15 (App Router) + TypeScript
- React Three Fiber + drei + @react-three/postprocessing
- GSAP (ScrollTrigger, SplitText, Flip) + Lenis smooth scroll
- Tailwind for layout only; all motion is custom
- Draco-compressed GLBs from `/public/models` (procedural geometry if none present)
- Custom GLSL shaders where it earns it (hero, image distortion)

## Tools available to you
- **typescript-lsp** — use it; never ship code with type errors
- **Playwright** — after every phase, screenshot desktop (1440px) and mobile (390px) viewports at each section and capture console errors; fix all before moving on
- **Chrome DevTools MCP** — run a performance trace on the hero and work section; report frame timing
- **Context7** — pull current docs for R3F, drei, GSAP, Lenis and Next 15 before using any API; do not rely on memory for these libraries
- **Blender MCP** — model or refine simple 3D assets, export as Draco GLB into `/public/models`
- **Vercel** — deploy a preview after each phase and give me the URL

## Creative concept — commit to ONE and carry it end-to-end
Propose 3 distinct concepts first (name, one-line idea, hero description, how transitions work, colour/type). Wait for me to pick. Each must have a single persistent WebGL canvas behind the DOM that reacts to scroll, cursor, and route changes — the 3D world is the site, not decoration.

## Required moments
1. **Preloader:** counter + WebGL warm-up, ends in a reveal that hands off to the hero without a cut
2. **Hero:** 3D centrepiece + oversized typography with staggered SplitText reveal, mouse parallax, idle motion
3. **Selected Work:** 5–6 projects, WebGL image/mesh hover distortion, scroll-driven camera or scene morph between items
4. **Case study pages:** shared-element transition from the card (Flip or canvas-based), sticky media, kinetic numbers, my role clearly shown, next-project transition at the bottom
5. **About:** text reveals, marquee, a 3D element that reacts to cursor
6. **Contact:** magnetic buttons, big CTA, footer with time-of-day in Mumbai and an "open to roles from [date]" availability tag
7. **Route transitions:** no hard cuts anywhere; canvas persists across pages
8. Custom cursor with hover states; film grain + subtle vignette overlay

## Quality bar
- 60fps on M1 MacBook Air; degrade gracefully (fewer particles, no postprocessing) on mobile
- `prefers-reduced-motion` fully respected with a static-but-beautiful fallback
- Lighthouse ≥ 90 performance, 100 accessibility; semantic HTML under the canvas
- Typography: one display + one text face (Google Fonts or self-hosted), fluid type scale, tight leading on display sizes
- No default drei helpers, no Bootstrap-looking anything, no gradient-blob clichés
- Reference taste level: Lusion, Igloo Inc, Active Theory, Locomotive — study the pacing, don't copy

## Content
Put all projects in `/content/projects.ts` with fields: `name`, `bucket` ("dizrupt" | "own"), `category`, `year`, `role`, `oneLiner`, `images[]`, `link`. Use placeholders so I can swap real work in. Page structure: Hero → Selected Work → About → Contact.

## Process
1. Propose the 3 concepts and stop.
2. After I pick: write a short build plan (file structure, scene graph, animation timeline map) and stop.
3. Build in phases: shell + canvas + smooth scroll → preloader + hero → work section → case study + transitions → about/contact → polish + perf pass.
4. After each phase: run the dev server, run the Playwright screenshot + console check, fix every error/warning, deploy a Vercel preview, commit with a clear message.
5. Flag every place where a real asset (GLB, image, copy) would materially change the result.
