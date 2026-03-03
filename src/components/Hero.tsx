"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";
const roles: string[] = [
    "Data Analyst",
    "Machine Learning Engineer",
    "Embedded Systems Engineer",
    "Autonomous Systems Developer",
];

export default function Hero() {
    const [text, setText] = useState("");
    const [roleIndex, setRoleIndex] = useState<number>(0);
    const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

    useEffect(() => {
        const current = roles[roleIndex];

        let timeout: NodeJS.Timeout;

        if (phase === "typing") {
            if (text.length < current.length) {
                timeout = setTimeout(() => {
                    setText(current.slice(0, text.length + 1));
                }, 70);
            } else {
                timeout = setTimeout(() => {
                    setPhase("pausing");
                }, 300); // smooth pause before delete
            }
        }

        if (phase === "pausing") {
            timeout = setTimeout(() => {
                setPhase("deleting");
            }, 300);
        }

        if (phase === "deleting") {
            if (text.length > 0) {
                timeout = setTimeout(() => {
                    setText(current.slice(0, text.length - 1));
                }, 40);
            } else {
                timeout = setTimeout(() => {
                    setRoleIndex((prev) => (prev + 1) % roles.length);
                    setPhase("typing");
                }, 100);
            }
        }

        return () => clearTimeout(timeout);
    }, [text, phase, roleIndex]);

    return (

        <section
            id="hero"
            className="h-screen flex flex-col justify-center items-center text-center px-6"
        >

            <Reveal>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-heading">
                Siddharth Lama
            </h1>
            </Reveal>
            <p className="text-xl text-gray-400 mb-6 h-8 flex items-center gradient-content">
                {text}
                <span className="ml-1 animate-pulse">|</span>
            </p>
        </section>
    );
}