import Reveal from "@/components/Reveal";
const skills = [
    "Python",
    "Machine Learning",
    "Next.js",
    "TypeScript",
    "Flask",
    "Arduino",
    "ESP32",
    "Raspberry Pi",
    "SQL",
    "Docker"
];

export default function Skills() {
    return (
        <section id="skills" className="py-20 px-6 max-w-4xl mx-auto">
            <Reveal>
            <h2 className="text-3xl font-bold mb-10">Skills</h2>
            <div className="flex flex-wrap gap-4">
                {skills.map((skill, index) => (
                    <span
                        key={index}
                        className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300"
                    >
            {skill}
          </span>
                ))}
            </div>
            </Reveal>
        </section>
    );
}