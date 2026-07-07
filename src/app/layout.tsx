import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";

const archivo = Archivo({
    subsets: ["latin"],
    variable: "--font-archivo",
    axes: ["wdth"],
    display: "swap",
});

const plexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-plex-mono",
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
        <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
            <body>
                <div className="bg-grid" aria-hidden="true" />
                <SmoothScroll />
                <ScrollProgress />
                {children}
            </body>
        </html>
    );
}
