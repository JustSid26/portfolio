import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import VelocityMarquee from "@/components/VelocityMarquee";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Preloader from "@/components/Preloader";
import ClickSpark from "@/components/ClickSpark";

export default function Home() {
    return (
        <>
            <Preloader />
            <Cursor />
            <ClickSpark />
            <Navbar />
            <main>
                <Hero />
                <About />
                <VelocityMarquee />
                <Projects />
                <Skills />
                <Contact />
            </main>
        </>
    );
}
