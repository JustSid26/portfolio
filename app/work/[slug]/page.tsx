import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, getProject, projectIndex } from "@/content/projects";
import { CaseStudy } from "@/components/case/CaseStudy";
import { PageEnter } from "@/components/PageEnter";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const title = `${p.name} — Siddharth Lama`;
  const url = `/work/${p.slug}`;
  // Overrides the root layout's canonical/openGraph so each case study points at itself.
  return {
    title,
    description: p.oneLiner,
    alternates: { canonical: url },
    openGraph: { type: "article", url, siteName: "Siddharth Lama", locale: "en_IN", title, description: p.oneLiner, images: [p.images[0]] },
    twitter: { card: "summary_large_image", title, description: p.oneLiner, images: [p.images[0]] },
  };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = projectIndex(slug);
  if (index < 0) notFound();
  return (
    <>
      <PageEnter route={{ kind: "case", index }} />
      <CaseStudy index={index} />
    </>
  );
}
