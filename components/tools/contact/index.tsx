"use client";

import React from "react";
import { Mail, Github, Linkedin, ExternalLink } from "lucide-react";

export default function Contact() {
    return (
        <div className="w-full bg-transparent">
            <div className="w-full">
                <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">
                    Contact
                </h2>

                <p className="text-base leading-relaxed text-[rgb(var(--text-primary))] mb-6">
                    Get in touch! I'm always open to discussing new
                    projects, creative ideas, or opportunities.
                </p>

                <div className="space-y-3">
                    <a
                        href="mailto:nicolasbelovoskey@gmail.com"
                        className="flex items-center gap-3 p-4 bg-[rgb(var(--bg-button))] rounded-lg active:bg-[rgb(var(--bg-button-hover))] transition-colors touch-manipulation min-h-[60px]"
                    >
                        <div className="w-12 h-12 bg-[rgb(var(--bg-window))] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Mail
                                size={22}
                                className="text-[rgb(var(--text-primary))]"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-[rgb(var(--text-primary))] text-base">
                                Email
                            </div>
                            <div className="text-sm text-[rgb(var(--text-secondary))] truncate">
                                nicolasbelovoskey@gmail.com
                            </div>
                        </div>
                    </a>

                    <a
                        href="https://github.com/nick5616"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-[rgb(var(--bg-button))] rounded-lg active:bg-[rgb(var(--bg-button-hover))] transition-colors touch-manipulation min-h-[60px]"
                    >
                        <div className="w-12 h-12 bg-[rgb(var(--bg-window))] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Github
                                size={22}
                                className="text-[rgb(var(--text-primary))]"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-[rgb(var(--text-primary))] text-base">
                                GitHub
                            </div>
                            <div className="text-sm text-[rgb(var(--text-secondary))] truncate">
                                github.com/nick5616
                            </div>
                        </div>
                        <ExternalLink
                            size={18}
                            className="text-[rgb(var(--text-secondary))] flex-shrink-0"
                        />
                    </a>

                    <a
                        href="https://linkedin.com/in/nicolasbelovoskey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-[rgb(var(--bg-button))] rounded-lg active:bg-[rgb(var(--bg-button-hover))] transition-colors touch-manipulation min-h-[60px]"
                    >
                        <div className="w-12 h-12 bg-[rgb(var(--bg-window))] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Linkedin
                                size={22}
                                className="text-[rgb(var(--text-primary))]"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-[rgb(var(--text-primary))] text-base">
                                LinkedIn
                            </div>
                            <div className="text-sm text-[rgb(var(--text-secondary))] truncate">
                                linkedin.com/in/nicolasbelovoskey
                            </div>
                        </div>
                        <ExternalLink
                            size={18}
                            className="text-[rgb(var(--text-secondary))] flex-shrink-0"
                        />
                    </a>
                </div>

                <div className="pt-4 mt-6 border-t border-[rgb(var(--border-window))]">
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                        I typically respond within 24-48 hours.
                    </p>
                </div>
            </div>
        </div>
    );
}
