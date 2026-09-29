// All project content lives here. Swap placeholder copy/images for real work.
// Media: /public/work/<slug>/ — 01–03.jpg stills (16:9) and reel.mp4. Source videos live in /vids.
// Anything marked PLACEHOLDER is copy you should replace.

export type Bucket = "dizrupt" | "own";

export type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
};

export type Project = {
  slug: string;
  name: string;
  bucket: Bucket;
  category: string;
  year: string;
  role: string;
  oneLiner: string;
  images: string[];
  video?: string; // muted looping reel, 16:9 — plays in the work frame on hover and on the case page
  link: string;
  // Optional extras used by case-study pages
  accent?: string;
  overview?: string;
  stack?: string[];
  stats?: Stat[];
};

export const projects: Project[] = [
  {
    slug: "lead-gen",
    name: "Eternity AI",
    bucket: "dizrupt",
    category: "Lead generation platform",
    year: "2025",
    role: "Frontend build + product UI", // VERIFY — your exact role
    oneLiner: "A diamond-lead command centre: one sentence in, qualified leads, outreach and invoices out.",
    images: ["/work/lead-gen/01.jpg", "/work/lead-gen/02.jpg", "/work/lead-gen/03.jpg"],
    video: "/work/lead-gen/reel.mp4",
    link: "#",
    accent: "#8FD8FF",
    overview:
      "Type a brief like “Find diamond jewelers in Krakow” and Eternity AI finds and scores the leads, builds a contact list, drafts an email per lead and, when one converts, raises the invoice — all from the same record.",
    stack: ["PLACEHOLDER — your stack"],
    stats: [
      { value: 1, label: "Sentence to start a campaign" },
      { value: 4, label: "Steps: find → contact → email → invoice" },
      { value: 24, label: "Personalised drafts in one pass (demo)" },
    ],
  },
  {
    slug: "payment-recon",
    name: "Payment Recon",
    bucket: "dizrupt",
    category: "Fintech · ledger & reconciliation",
    year: "2025",
    role: "Ledger engine + dashboard UI", // VERIFY — your exact role
    oneLiner: "Nothing paid twice. Nothing paid out of thin air. Double-entry reconciliation for CoreServices.",
    images: ["/work/payment-recon/01.jpg", "/work/payment-recon/02.jpg", "/work/payment-recon/03.jpg"],
    video: "/work/payment-recon/reel.mp4",
    link: "#",
    accent: "#6E8BFF",
    overview:
      "Processor CSVs and settlement workbooks go in; every transaction is posted as balanced double-entry events, and live invariant checks run directly against the ledger — append-only, idempotent, and provably balanced.",
    stack: ["PLACEHOLDER — your stack"],
    stats: [
      { value: 4, label: "Ledger invariants checked live" },
      { value: 0, label: "Updates or deletes allowed — append-only" },
      { value: 12480, label: "Transactions reconciled in the demo run" },
    ],
  },
  {
    slug: "databench",
    name: "DataBench",
    bucket: "own",
    category: "ML tooling",
    year: "2025",
    role: "Solo — design + build",
    oneLiner: "Drop in a dataset; get the schema, the problems worth fixing, and a trained leaderboard.",
    images: ["/work/databench/01.jpg", "/work/databench/02.jpg", "/work/databench/03.jpg"],
    video: "/work/databench/reel.mp4",
    link: "#",
    accent: "#9B8CFF",
    overview:
      "DataBench runs ingest → schema → profile → recommend → train. Every column is classified with the reason it was kept or dropped, problems are written for a human rather than a log file, and models are ranked for the dataset's actual size and shape.",
    stack: ["PLACEHOLDER — your stack"],
    stats: [
      { value: 5, label: "Pipeline stages, ingest to train" },
      { value: 156, suffix: "ms", label: "To read a 1M-row CSV (demo)" },
      { value: 0.958, label: "Best ROC AUC on the demo churn set" },
    ],
  },
  {
    slug: "studydesk",
    name: "Study Desk",
    bucket: "own",
    category: "Study app",
    year: "2025",
    role: "Solo — design + build",
    oneLiner: "Notes, subject mastery and LeetCode progress in one place. The only bright thing is your own data.",
    images: ["/work/studydesk/01.jpg", "/work/studydesk/02.jpg", "/work/studydesk/03.jpg"],
    video: "/work/studydesk/reel.mp4",
    link: "#",
    accent: "#DCE4EE",
    overview:
      "Notes are real files — the filesystem is the source of truth. Solve problems in Java and accepted submissions log themselves; errors come back with a line number and a plain sentence, and you can step through code line by line with variables beside it.",
    stack: ["PLACEHOLDER — your stack"],
    stats: [
      { value: 1, label: "Place for notes, timetable and practice" },
      { value: 21, prefix: "JDK ", label: "Run and visualise Java in-app" },
      { value: 0, label: "Lock-in — notes stay plain files" },
    ],
  },

];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const projectIndex = (slug: string) => projects.findIndex((p) => p.slug === slug);

// Site-wide copy. PLACEHOLDER values are yours to replace.
export const site = {
  name: "Siddharth Lama",
  short: "SL",
  email: "hello@PLACEHOLDER.com",
  headline: ["Siddharth", "Lama"],
  tagline: "Builds things that ship.",
  intro:
    "Third-year BTech. Shipping production sites and campaigns for real brands at Dizrupt, plus my own products on the side.",
  about: {
    studying: "PLACEHOLDER — BTech in Computer Engineering, third year, at your college.",
    dizrupt:
      "At Dizrupt, a Mumbai digital marketing agency and product incubator, I build the web side of campaigns and products: landing pages, dashboards, brand sites, and the motion that makes them feel alive.",
    next: "PLACEHOLDER — What you want to build next. One confident sentence.",
  },
  marquee: ["Frontend", "WebGL", "Motion", "Product", "Next.js", "Three.js", "GSAP", "Shipping"],
  // Languages & tools — they drive in and out of the SL HQ as labelled trucks. Edit freely.
  tools: ["TypeScript", "React", "Next.js", "Three.js", "GLSL", "GSAP", "Node.js", "Python", "Java", "PostgreSQL", "Tailwind", "Figma"],
  contactCta: "PLACEHOLDER — Have a project or a role? Let's talk.",
  // Also used by the social skyscrapers in the hero city — paste your real profile URLs.
  socials: [
    { label: "Instagram", href: "https://instagram.com/PLACEHOLDER" },
    { label: "GitHub", href: "https://github.com/PLACEHOLDER" },
    { label: "LinkedIn", href: "https://linkedin.com/in/PLACEHOLDER" },
    { label: "X", href: "#" },
  ],
};
