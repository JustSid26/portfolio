"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";

export default function Projects() {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const panels = gsap.utils.toArray<HTMLElement>(".project-panel");

            gsap.to(panels, {
                xPercent: -100 * (panels.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: container.current,
                    pin: true,
                    scrub: 1,
                    snap: 1 / (panels.length - 1),
                    end: () => "+=" + container.current!.offsetWidth,
                },
            });
        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={container} className="flex w-[300vw]">
            <section className="project-panel w-screen h-screen flex items-center justify-center bg-black">
                Mantis Rover
            </section>
            <section className="project-panel w-screen h-screen flex items-center justify-center bg-gray-800">
                AI Finance App
            </section>
            <section className="project-panel w-screen h-screen flex items-center justify-center bg-black">
                Voice Agent
            </section>
        </div>
    );
}