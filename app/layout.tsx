import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Experience } from "@/components/Experience";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--f-archivo", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--f-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "Siddharth Lama — Builds things that ship",
  description:
    "Siddharth Lama builds production websites, WebGL and product for real brands at Dizrupt, plus his own tools.",
};

export const viewport: Viewport = {
  themeColor: "#060A12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fonts = [archivo, jetbrains].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={fonts}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Experience>{children}</Experience>
      </body>
    </html>
  );
}
