"use client";

import React from "react";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";

export default function About() {
    return (
        <div className="w-full bg-transparent">
            <div className="w-full">
                <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">
                    About Nickel OS
                </h2>

                <p className="text-base leading-relaxed text-[rgb(var(--text-primary))] mb-6">
                    I made this website to chuck anything I want onto it.
                    Enjoy!
                </p>

                <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                        Connect
                    </h3>
                    <div className="flex flex-col gap-3">
                        <a
                            href="https://github.com/nick5616"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 bg-[rgb(var(--bg-button))] rounded-lg active:bg-[rgb(var(--bg-button-hover))] transition-colors text-[rgb(var(--text-primary))] touch-manipulation min-h-[52px]"
                        >
                            <Github size={20} />
                            <span className="text-base">GitHub</span>
                            <ExternalLink
                                size={16}
                                className="text-[rgb(var(--text-secondary))] ml-auto"
                            />
                        </a>
                        <a
                            href="https://linkedin.com/in/nicolasbelovoskey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 bg-[rgb(var(--bg-button))] rounded-lg active:bg-[rgb(var(--bg-button-hover))] transition-colors text-[rgb(var(--text-primary))] touch-manipulation min-h-[52px]"
                        >
                            <Linkedin size={20} />
                            <span className="text-base">LinkedIn</span>
                            <ExternalLink
                                size={16}
                                className="text-[rgb(var(--text-secondary))] ml-auto"
                            />
                        </a>
                        <a
                            href="mailto:nicolasbelovoskey@gmail.com"
                            className="flex items-center gap-3 px-4 py-3 bg-[rgb(var(--bg-button))] rounded-lg active:bg-[rgb(var(--bg-button-hover))] transition-colors text-[rgb(var(--text-primary))] touch-manipulation min-h-[52px]"
                        >
                            <Mail size={20} />
                            <span className="text-base">Email</span>
                        </a>
                    </div>
                </div>

                <div className="pt-4 mt-6 border-t border-[rgb(var(--border-window))]">
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                        Built for fun
                    </p>
                </div>
            </div>
        </div>
    );
}
