import Reveal from "@/components/Reveal";
export default function About() {
    return (
        <section id="about" className="py-20 px-6 max-w-4xl mx-auto">
            <Reveal>
            <h2 className="text-3xl font-bold mb-6">About Me</h2>
            <p className="text-gray-400 leading-relaxed">
                I am a final-year BTech student aspiring to become a Data Scientist.
                I have experience building AI-powered applications, autonomous rover systems,
                and full-stack web applications. My interests include machine learning,
                robotics, and scalable backend systems.
            </p>
            </Reveal></section>
    );
}