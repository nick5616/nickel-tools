"use client";

import React, { useMemo } from "react";
import { Github, Linkedin, Mail, ChevronRight, ArrowUpRight } from "lucide-react";
import { getAllContent, NICKEL_SYSTEM, type Content, type Category } from "@/app/data/content";
import { useAppStore } from "@/app/store/appStore";
import { AppTile } from "@/components/shared/AppTile";
import { useActiveScheme } from "@/components/shared/SystemPickers";

function getStatusLabel(status: Content["status"]): string {
    switch (status) {
        case "operational":
            return "Operational";
        case "in-development":
            return "In Development";
        case "experimental":
            return "Experimental";
        case "archived":
            return "Archived";
        default:
            return status;
    }
}

export default function About() {
    const openWindow = useAppStore((state) => state.openWindow);
    const { scheme } = useActiveScheme();
    const allContent = getAllContent();

    const contentByCategory = useMemo(() => {
        const grouped = new Map<Category, Content[]>();
        allContent.forEach((item) => {
            grouped.set(item.category, [...(grouped.get(item.category) ?? []), item]);
        });
        return [...grouped.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => [
                category,
                [...items].sort((a, b) => a.title.localeCompare(b.title)),
            ] as const);
    }, [allContent]);

    return (
        <div className="w-full p-1 sm:p-6 space-y-6">
            {/* System hero */}
            <div className="flex flex-col items-center text-center gap-3 pt-2">
                <span
                    className="nk-tile relative flex flex-col items-center justify-center w-24 h-24 font-sans font-black tracking-tight"
                    style={{ ["--tile-hue" as string]: "var(--nk-h1)" }}
                >
                    <span className="absolute top-2 left-2.5 text-[11px] font-mono opacity-80">28</span>
                    <span className="text-4xl mt-1">Ni</span>
                </span>
                <div>
                    <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                        Nickel OS
                    </h2>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                        Version {NICKEL_SYSTEM.version} · {allContent.length} apps · {scheme} palette
                    </p>
                </div>
                <p className="max-w-md text-[15px] leading-relaxed text-[rgb(var(--text-primary))]">
                    I made this website to chuck anything I want onto it. Every
                    app is an element on the Nickel periodic table. Enjoy!
                </p>
            </div>

            {/* Apps by category */}
            {contentByCategory.map(([category, items]) => (
                <section key={category}>
                    <h3 className="nk-section-title px-1 mb-2">
                        {category} · {items.length}
                    </h3>
                    <div className="nk-group !p-1.5">
                        {items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => openWindow(item)}
                                className="nk-row w-full text-left items-start"
                            >
                                <AppTile content={item} size={40} showNumber={false} />
                                <span className="flex-1 min-w-0">
                                    <span className="flex items-center gap-2">
                                        <span className="text-[15px] font-semibold text-[rgb(var(--text-primary))] truncate">
                                            {item.title}
                                        </span>
                                        {item.status !== "operational" && (
                                            <span className="nk-badge">
                                                {getStatusLabel(item.status)}
                                            </span>
                                        )}
                                    </span>
                                    <span className="block text-[13px] text-[rgb(var(--text-secondary))] line-clamp-2">
                                        {item.description}
                                    </span>
                                    {item.tags && item.tags.length > 0 && (
                                        <span className="flex flex-wrap gap-1 mt-1.5">
                                            {item.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[11px] px-1.5 py-0.5 rounded-md bg-[rgb(var(--text-primary)/0.06)] text-[rgb(var(--text-secondary))]"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </span>
                                    )}
                                </span>
                                {item.type === "external" ? (
                                    <ArrowUpRight size={16} className="shrink-0 mt-1 text-[rgb(var(--text-secondary))] opacity-60" />
                                ) : (
                                    <ChevronRight size={16} className="shrink-0 mt-1 text-[rgb(var(--text-secondary))] opacity-60" />
                                )}
                            </button>
                        ))}
                    </div>
                </section>
            ))}

            {/* Connect */}
            <section>
                <h3 className="nk-section-title px-1 mb-2">Connect</h3>
                <div className="flex flex-wrap gap-2">
                    <a href="https://github.com/nick5616" target="_blank" rel="noopener noreferrer" className="nk-btn">
                        <Github size={15} /> GitHub
                    </a>
                    <a href="https://linkedin.com/in/nicolebelovoskey" target="_blank" rel="noopener noreferrer" className="nk-btn">
                        <Linkedin size={15} /> LinkedIn
                    </a>
                    <a href="mailto:nicolebelovoskey@gmail.com" className="nk-btn nk-btn-primary">
                        <Mail size={15} /> Email
                    </a>
                </div>
            </section>

            <p className="text-center text-xs text-[rgb(var(--text-secondary))]">
                Built for fun
            </p>
        </div>
    );
}
