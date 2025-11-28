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
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${inter.variable} ${mono.variable} font-sans min-h-screen flex flex-col antialiased bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    {/* Noise Overlay for Industrial Texture */}
                    <div className="bg-noise"></div>

                    {/* Navigation - The "Control Panel" */}
                    <nav className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between h-16 items-center">
                                {/* Logo Area */}
                                <div className="flex items-center gap-2">
                                    <a
                                        href="/"
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className="relative flex items-center justify-center w-9 h-9 bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-800 dark:to-black rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-sm group-hover:shadow-md transition-all">
                                            <Hexagon
                                                size={18}
                                                className="text-zinc-600 dark:text-zinc-300"
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <div className="flex flex-col leading-none">
                                            <span className="text-lg font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
                                                NICKEL
                                            </span>
                                            <span className="text-[9px] font-mono text-zinc-400 tracking-widest uppercase">
                                                Element 28 / Foundry
                                            </span>
                                        </div>
                                    </a>
                                </div>

                                {/* Right Side Controls */}
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex items-center gap-6 text-xs font-mono font-medium text-zinc-500 uppercase tracking-wide">
                                        <a
                                            href="/"
                                            className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                                        >
                                            Modules
                                        </a>
                                        <a
                                            href="https://github.com"
                                            className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                                        >
                                            Source
                                        </a>
                                    </div>

                                    {/* Vertical Divider */}
                                    <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 mx-2"></div>

                                    <ThemeToggle />
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Main Content */}
                    <main className="flex-grow relative z-10">{children}</main>

                    {/* Footer */}
                    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-10 relative">
                        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-zinc-400 text-xs font-mono uppercase tracking-wider">
                                Nickel Tools © {new Date().getFullYear()}
                            </p>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                    ALL SYSTEMS OPERATIONAL
                                </span>
                            </div>
                        </div>
                    </footer>
                </ThemeProvider>
            </body>
        </html>
    );
}
