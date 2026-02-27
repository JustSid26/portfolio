import "./globals.css";
import { ReactNode } from "react";
import ScrollProgress from "@/components/ScrollProgress";
export const metadata = {
    title: "Siddharth Lama | Portfolio",
    description: "BTech Student | Data Science Aspirant | Rover Developer",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: ReactNode;
}) {
    return (
        <html lang="en">
        <body className="text-white">
        <ScrollProgress />
        {children}
        </body>
        </html>
    );
}