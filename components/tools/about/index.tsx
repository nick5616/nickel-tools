"use client";

import React from "react";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";

export default function About() {
    return (
        <div className="h-full w-full overflow-auto bg-white dark:bg-zinc-900 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
                    About Nickel OS
                </h1>

                <div className="space-y-6 text-zinc-700 dark:text-zinc-300">
                    <p className="text-lg leading-relaxed">
                        I made this website to chuck anything I want onto it.
                        Enjoy!
                    </p>

                    <div>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                            Connect
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://github.com/nick5616"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-900 dark:text-white"
                            >
                                <Github size={18} />
                                <span>GitHub</span>
                                <ExternalLink
                                    size={14}
                                    className="text-zinc-500"
                                />
                            </a>
                            <a
                                href="https://linkedin.com/in/nicolasbelovoskey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-900 dark:text-white"
                            >
                                <Linkedin size={18} />
                                <span>LinkedIn</span>
                                <ExternalLink
                                    size={14}
                                    className="text-zinc-500"
                                />
                            </a>
                            <a
                                href="mailto:nicolasbelovoskey@gmail.com"
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-900 dark:text-white"
                            >
                                <Mail size={18} />
                                <span>Email</span>
                            </a>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Built for fun
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
