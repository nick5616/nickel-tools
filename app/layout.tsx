"use client"; // Must be client for ThemeProvider

import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Hexagon, Moon, Sun, Monitor } from "lucide-react";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

// Separate component to prevent hydration mismatch on the toggle
function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="w-8 h-8" />; // Placeholder

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            aria-label="Toggle Theme"
        >
            {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
    );
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className="h-full w-full overflow-hidden"
        >
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
                />
            </head>
            <body
                className={`${inter.variable} ${mono.variable} font-sans h-full w-full overflow-hidden flex flex-col antialiased bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    {/* Noise Overlay for Industrial Texture */}
                    <div className="bg-noise"></div>

                    {/* Main Content - OS interface handles its own layout */}
                    <main className="h-full w-full overflow-hidden relative z-10">
                        {children}
                    </main>
                </ThemeProvider>
            </body>
        </html>
    );
}
