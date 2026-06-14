import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Marquee from "@/components/Marquee";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Preloader from "@/components/Preloader";

export default function Home() {
    return (
        <>
            <Preloader />
            <Cursor />
            <Navbar />
            <main>
                <Hero />
                <About />
                <Marquee />
                <Projects />
                <Skills />
                <Contact />
            </main>
        </>
    );
}
