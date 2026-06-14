import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const jetbrains = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono-jb",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://siddharthlama.dev"),
    title: "Siddharth Lama — Data Science & Autonomous Systems",
    description:
        "BTech engineer building systems that sense, decide, and act — across data science, machine learning, embedded systems, and autonomous robotics.",
    keywords: [
        "Siddharth Lama",
        "Data Scientist",
        "Machine Learning",
        "Embedded Systems",
        "Robotics",
        "Portfolio",
    ],
    authors: [{ name: "Siddharth Lama" }],
    openGraph: {
        title: "Siddharth Lama — Data Science & Autonomous Systems",
        description:
            "Building systems that sense, decide, and act — data science, ML, embedded, and autonomous robotics.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Siddharth Lama — Data Science & Autonomous Systems",
        description:
            "Building systems that sense, decide, and act — data science, ML, embedded, and autonomous robotics.",
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
            <body>
                <div className="bg-aurora" aria-hidden="true" />
                <div className="bg-grain" aria-hidden="true" />
                <SmoothScroll />
                <ScrollProgress />
                {children}
            </body>
        </html>
    );
}
