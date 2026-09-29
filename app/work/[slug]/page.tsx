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
  return p ? { title: `${p.name} — Siddharth Lama`, description: p.oneLiner } : {};
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
