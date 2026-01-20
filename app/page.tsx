"use client";

import React from "react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-8">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                        Nick Iannuzzi
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400">
                        Designer, Developer, Creator
                    </p>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none text-center">
                    <p className="text-lg text-zinc-700 dark:text-zinc-300">
                        Welcome to my digital space. I build interactive experiences,
                        design systems, and creative tools.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <Link
                        href="/portfolio"
                        className="p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors group"
                    >
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                            Portfolio
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Explore my work in UI/UX Design, Software Development, and Art
                        </p>
                    </Link>

                    <Link
                        href="/desktop"
                        className="p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors group"
                    >
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                            Tools & Apps
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Interactive desktop experience with all my tools and projects
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
