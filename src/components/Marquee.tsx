"use client";

const items = [
    "Python",
    "Machine Learning",
    "TensorFlow",
    "ROS",
    "Next.js",
    "Embedded C++",
    "Data Viz",
    "ESP32",
    "Django",
    "PostgreSQL",
    "Rust",
    "Computer Vision",
];

/* An infinite ticker of capabilities — two identical tracks for a seamless loop. */
export default function Marquee() {
    const Track = () => (
        <div className="marquee__track" aria-hidden="true">
            {items.map((item, i) => (
                <span key={i} className="marquee__item">
                    {item}
                    <span className="marquee__dot" />
                </span>
            ))}
        </div>
    );

    return (
        <section className="py-10 border-y" style={{ borderColor: "var(--line)" }} aria-label="Technologies">
            <div className="marquee">
                <Track />
                <Track />
            </div>
        </section>
    );
}
