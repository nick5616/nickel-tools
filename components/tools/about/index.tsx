"use client";

import React from "react";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";

export default function About() {
    return (
        <div className="h-full w-full overflow-auto bg-[rgb(var(--bg-window))] p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-6">
                    About Nickel OS
                </h1>

                <div className="space-y-6 text-[rgb(var(--text-primary))]">
                    <p className="text-lg leading-relaxed">
                        I made this website to chuck anything I want onto it.
                        Enjoy!
                    </p>

                    <div>
                        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">
                            Connect
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://github.com/nick5616"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg-button))] rounded-lg hover:bg-[rgb(var(--bg-button-hover))] transition-colors text-[rgb(var(--text-primary))]"
                            >
                                <Github size={18} />
                                <span>GitHub</span>
                                <ExternalLink
                                    size={14}
                                    className="text-[rgb(var(--text-secondary))]"
                                />
                            </a>
                            <a
                                href="https://linkedin.com/in/nicolasbelovoskey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg-button))] rounded-lg hover:bg-[rgb(var(--bg-button-hover))] transition-colors text-[rgb(var(--text-primary))]"
                            >
                                <Linkedin size={18} />
                                <span>LinkedIn</span>
                                <ExternalLink
                                    size={14}
                                    className="text-[rgb(var(--text-secondary))]"
                                />
                            </a>
                            <a
                                href="mailto:nicolasbelovoskey@gmail.com"
                                className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg-button))] rounded-lg hover:bg-[rgb(var(--bg-button-hover))] transition-colors text-[rgb(var(--text-primary))]"
                            >
                                <Mail size={18} />
                                <span>Email</span>
                            </a>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[rgb(var(--border-window))]">
                        <p className="text-sm text-[rgb(var(--text-secondary))]">
                            Built for fun
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
