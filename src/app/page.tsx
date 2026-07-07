import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Tape from "@/components/Tape";
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
                <Tape />
                <Projects />
                <Skills />
                <Contact />
            </main>
        </>
    );
}
