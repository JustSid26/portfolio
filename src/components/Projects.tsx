import Reveal from "@/components/Reveal";
const projects = [
    {
        title: "Mantis Rover (NASA HERC)",
        desc: "Autonomous rover using ESP32, Arduino, Raspberry Pi 5, and LiDAR with SLAM navigation."
    },
    {
        title: "AI Finance App",
        desc: "Android app providing financial insights using ML models."
    },
    {
        title: "Weather Analysis Website",
        desc: "Full-stack weather app with impact analysis and clothing recommendations."
    },
    {
        title: "Voice Recruitment Agent",
        desc: "AI voice agent for first-round recruitment screening."
    }
];

export default function Projects() {
    return (
        <section id="projects" className="py-20 px-6 max-w-6xl mx-auto">
            <Reveal>
            <h2 className="text-3xl font-bold mb-10">Projects</h2>
            <div className="grid md:grid-cols-2 gap-8">
                {projects.map((project, index) => (
                    <div key={index} className="p-6 border border-gray-800 rounded-xl hover:border-gray-500 transition">
                        <h3 className="text-xl font-semibold mb-3">{project.title}</h3>
                        <p className="text-gray-400">{project.desc}</p>
                    </div>
                ))}
            </div>
            </Reveal>
        </section>
    );
}