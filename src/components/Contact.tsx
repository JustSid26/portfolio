import Reveal from "@/components/Reveal";
export default function Contact() {
    return (
        <section id="contact" className="py-20 px-6 text-center">
            <Reveal>
            <h2 className="text-3xl font-bold mb-6">Contact</h2>
            <p className="text-gray-400 mb-6">
                Interested in collaborating or hiring? Let's connect.
            </p>
            <a
                href="mailto:your-email@example.com"
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:opacity-80"
            >
                Email Me
            </a>
            </Reveal>
        </section>
    );
}