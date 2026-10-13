"use client";

import React from "react";
import { Mail, Github, Linkedin, ChevronRight, type LucideIcon } from "lucide-react";
import { paletteColor } from "@/app/utils/nickelPalette";

const LINKS: {
    label: string;
    detail: string;
    href: string;
    Icon: LucideIcon;
    slot: number;
    external?: boolean;
}[] = [
    {
        label: "Email",
        detail: "nicolebelovoskey@gmail.com",
        href: "mailto:nicolebelovoskey@gmail.com",
        Icon: Mail,
        slot: 1,
    },
    {
        label: "GitHub",
        detail: "github.com/nick5616",
        href: "https://github.com/nick5616",
        Icon: Github,
        slot: 2,
        external: true,
    },
    {
        label: "LinkedIn",
        detail: "linkedin.com/in/nicolebelovoskey",
        href: "https://linkedin.com/in/nicolebelovoskey",
        Icon: Linkedin,
        slot: 3,
        external: true,
    },
];

export default function Contact() {
    return (
        <div className="w-full p-1 sm:p-4 space-y-4">
            <div>
                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                    Contact
                </h2>
                <p className="mt-1 text-[15px] leading-relaxed text-[rgb(var(--text-secondary))]">
                    Get in touch! I&apos;m always open to discussing new
                    projects, creative ideas, or opportunities.
                </p>
            </div>

            <div className="nk-group !p-1.5">
                {LINKS.map(({ label, detail, href, Icon, slot, external }) => (
                    <a
                        key={label}
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="nk-row touch-manipulation"
                    >
                        <span
                            className="w-9 h-9 rounded-[30%] flex items-center justify-center shrink-0"
                            style={{
                                background: paletteColor(slot, "fg"),
                                color: paletteColor(slot, "bg"),
                            }}
                        >
                            <Icon size={18} />
                        </span>
                        <span className="flex-1 min-w-0">
                            <span className="block text-[15px] font-semibold text-[rgb(var(--text-primary))]">
                                {label}
                            </span>
                            <span className="block text-sm truncate text-[rgb(var(--text-secondary))]">
                                {detail}
                            </span>
                        </span>
                        <ChevronRight
                            size={18}
                            className="shrink-0 text-[rgb(var(--text-secondary))] opacity-60"
                        />
                    </a>
                ))}
            </div>

            <p className="text-sm text-[rgb(var(--text-secondary))]">
                I typically respond within 24–48 hours.
            </p>
        </div>
    );
}
