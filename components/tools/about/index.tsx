"use client";

import React, { useMemo } from "react";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";
import {
    NICKEL_SYSTEM,
    getCategoryIcon,
    type Content,
    type Category,
} from "@/app/data/content";
import { useAppStore } from "@/app/store/appStore";
import { IconRenderer } from "@/components/shared/IconRenderer";

function getStatusBadgeColor(status: Content["status"]): string {
    switch (status) {
        case "operational":
            return "bg-green-500/20 text-green-400";
        case "in-development":
            return "bg-yellow-500/20 text-yellow-400";
        case "experimental":
            return "bg-purple-500/20 text-purple-400";
        case "archived":
            return "bg-gray-500/20 text-gray-400";
        default:
            return "bg-gray-500/20 text-gray-400";
    }
}

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

    // Group content by category
    const contentByCategory = useMemo(() => {
        const grouped: Record<Category, Content[]> = {} as Record<
            Category,
            Content[]
        >;

        NICKEL_SYSTEM.content.forEach((item) => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });

        // Sort categories by name, and items within each category by title
        const sorted: Record<Category, Content[]> = {} as Record<
            Category,
            Content[]
        >;
        Object.keys(grouped)
            .sort()
            .forEach((category) => {
                sorted[category as Category] = grouped[
                    category as Category
                ].sort((a, b) => a.title.localeCompare(b.title));
            });

        return sorted;
    }, []);

    const handleItemClick = (item: Content) => {
        openWindow(item);
    };

    return (
        <div className="w-full bg-transparent">
            <div className="w-full p-6">
                <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">
                    About Nickel OS
                </h2>

                <p className="text-base leading-relaxed text-[rgb(var(--text-primary))] mb-6">
                    I made this website to chuck anything I want onto it. So far
                    we have {NICKEL_SYSTEM.content.length} apps and tools.
                    Enjoy!
                </p>

                {/* Table of Contents */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                        Apps & Tools
                    </h3>
                    <div className="space-y-6">
                        {Object.entries(contentByCategory).map(
                            ([category, items]) => (
                                <div key={category} className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">
                                            {getCategoryIcon(
                                                category as Category
                                            )}
                                        </span>
                                        <h4 className="text-base font-semibold text-[rgb(var(--text-primary))]">
                                            {category}
                                        </h4>
                                        <span className="text-sm text-[rgb(var(--text-secondary))]">
                                            ({items.length})
                                        </span>
                                    </div>
                                    <div className="space-y-2 pl-2">
                                        {items.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() =>
                                                    handleItemClick(item)
                                                }
                                                className="w-full text-left p-3 rounded-lg bg-[rgb(var(--bg-button))] hover:bg-[rgb(var(--bg-button-hover))] active:bg-[rgb(var(--bg-button-hover))] transition-colors group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        <IconRenderer
                                                            content={item}
                                                            size="sm"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h5 className="text-sm font-medium text-[rgb(var(--text-primary))] group-hover:underline">
                                                                {item.title}
                                                            </h5>
                                                            <span
                                                                className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeColor(
                                                                    item.status
                                                                )}`}
                                                            >
                                                                {getStatusLabel(
                                                                    item.status
                                                                )}
                                                            </span>
                                                            {item.featured && (
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                                                                    Featured
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-[rgb(var(--text-secondary))] line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                        {item.tags &&
                                                            item.tags.length >
                                                                0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {item.tags.map(
                                                                        (
                                                                            tag
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    tag
                                                                                }
                                                                                className="text-xs px-1.5 py-0.5 rounded bg-[rgb(var(--bg-window))] text-[rgb(var(--text-secondary))]"
                                                                            >
                                                                                {
                                                                                    tag
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        {item.type ===
                                                        "external" ? (
                                                            <ExternalLink
                                                                size={16}
                                                                className="text-[rgb(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity"
                                                            />
                                                        ) : (
                                                            <div className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Connect Section */}
                <div className="pt-4 mt-6 border-t border-[rgb(var(--border-window))]">
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
