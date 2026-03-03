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
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="text-white">
                <ScrollProgress />
                {children}
            </body>
        </html>
    );
}