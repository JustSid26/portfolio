import { Hero } from "@/components/home/Hero";
import { Work } from "@/components/home/Work";
import { About } from "@/components/home/About";
import { Contact } from "@/components/home/Contact";
import { PageEnter } from "@/components/PageEnter";

export default function Home() {
  return (
    <>
      <PageEnter route={{ kind: "home" }} />
      <Hero />
      <Work />
      <About />
      <Contact />
    </>
  );
}
