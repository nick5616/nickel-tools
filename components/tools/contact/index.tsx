"use client";

import React from "react";
import { Mail, Github, Linkedin, ExternalLink } from "lucide-react";

export default function Contact() {
    return (
        <div className="h-full w-full overflow-auto bg-[rgb(var(--bg-window))] p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-6">
                    Contact
                </h1>

                <div className="space-y-6 text-[rgb(var(--text-primary))]">
                    <p className="text-lg leading-relaxed">
                        Get in touch! I'm always open to discussing new
                        projects, creative ideas, or opportunities.
                    </p>

                    <div className="space-y-4">
                        <div className="bg-[rgb(var(--bg-button))] rounded-lg p-6 border border-[rgb(var(--border-window))]">
                            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">
                                Contact Methods
                            </h2>

                            <div className="space-y-3">
                                <a
                                    href="mailto:your-email@example.com"
                                    className="flex items-center gap-3 p-3 bg-[rgb(var(--bg-window))] rounded-lg hover:bg-[rgb(var(--bg-button-hover))] transition-colors group"
                                >
                                    <div className="w-10 h-10 bg-[rgb(var(--bg-button))] rounded-lg flex items-center justify-center group-hover:bg-[rgb(var(--bg-button-hover))] transition-colors">
                                        <Mail
                                            size={20}
                                            className="text-[rgb(var(--text-primary))]"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-[rgb(var(--text-primary))]">
                                            Email
                                        </div>
                                        <div className="text-sm text-[rgb(var(--text-secondary))]">
                                            nicolasbelovoskey@gmail.com
                                        </div>
                                    </div>
                                </a>

                                <a
                                    href="https://github.com/nick5616"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-[rgb(var(--bg-window))] rounded-lg hover:bg-[rgb(var(--bg-button-hover))] transition-colors group"
                                >
                                    <div className="w-10 h-10 bg-[rgb(var(--bg-button))] rounded-lg flex items-center justify-center group-hover:bg-[rgb(var(--bg-button-hover))] transition-colors">
                                        <Github
                                            size={20}
                                            className="text-[rgb(var(--text-primary))]"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-[rgb(var(--text-primary))]">
                                            GitHub
                                        </div>
                                        <div className="text-sm text-[rgb(var(--text-secondary))]">
                                            github.com/nick5616
                                        </div>
                                    </div>
                                    <ExternalLink
                                        size={16}
                                        className="text-[rgb(var(--text-secondary))]"
                                    />
                                </a>

                                <a
                                    href="https://linkedin.com/in/nicolasbelovoskey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-[rgb(var(--bg-window))] rounded-lg hover:bg-[rgb(var(--bg-button-hover))] transition-colors group"
                                >
                                    <div className="w-10 h-10 bg-[rgb(var(--bg-button))] rounded-lg flex items-center justify-center group-hover:bg-[rgb(var(--bg-button-hover))] transition-colors">
                                        <Linkedin
                                            size={20}
                                            className="text-[rgb(var(--text-primary))]"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-[rgb(var(--text-primary))]">
                                            LinkedIn
                                        </div>
                                        <div className="text-sm text-[rgb(var(--text-secondary))]">
                                            linkedin.com/in/nicolasbelovoskey
                                        </div>
                                    </div>
                                    <ExternalLink
                                        size={16}
                                        className="text-[rgb(var(--text-secondary))]"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[rgb(var(--border-window))]">
                        <p className="text-sm text-[rgb(var(--text-secondary))]">
                            I typically respond within 24-48 hours.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
