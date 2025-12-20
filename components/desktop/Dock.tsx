"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Content } from "@/app/data/content";
import type { WindowState } from "@/app/store/appStore";
import { IconRenderer } from "@/components/shared/IconRenderer";
import { getContentById } from "@/app/data/content";
import { usePathname } from "next/navigation";

interface DockProps {
    items: Content[];
    windows?: WindowState[];
    onOpenItem: (content: Content) => void;
}

export function Dock({ items, windows, onOpenItem }: DockProps) {
    const pathname = usePathname();

    // Get the three pinned apps
    const portfolio = getContentById("portfolio");
    const digitalArt = getContentById("art-digital-art");
    const settings = getContentById("settings");

    const pinnedApps = [portfolio, digitalArt, settings].filter(
        (app): app is NonNullable<typeof app> => app !== undefined
    );

    // Create a map to quickly check if a content item has a minimized window
    const minimizedMap = new Map<string, boolean>();
    if (windows) {
        windows.forEach((w) => {
            minimizedMap.set(w.content.id, w.minimized);
        });
    }

    return (
        <div
            className="fixed bottom-4 left-0 right-0 flex justify-center z-40 pointer-events-none"
            style={{
                width: "100vw",
                maxWidth: "100vw",
            }}
        >
            <motion.div
                className="bg-[rgb(var(--bg-dock))] backdrop-blur-xl border border-[rgb(var(--border-dock))] rounded-2xl px-3 py-2 flex gap-2 shadow-2xl pointer-events-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Pinned Apps - Styled like mobile AppTray */}
                {pinnedApps.map((app) => {
                    // Check if this app has an open window
                    const hasWindow = windows?.some(
                        (w) => w.content.id === app.id
                    );
                    const isMinimized = hasWindow
                        ? minimizedMap.get(app.id) || false
                        : false;
                    const isActive =
                        app.type === "internal" && pathname === app.route;

                    return (
                        <motion.button
                            key={app.id}
                            onClick={() => onOpenItem(app)}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative group ${
                                isActive
                                    ? "bg-zinc-200 dark:bg-zinc-700"
                                    : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            } ${isMinimized ? "opacity-60" : ""}`}
                            title={app.title}
                            style={
                                !isActive
                                    ? {
                                          backgroundColor:
                                              "rgb(var(--bg-window) / 0.7)",
                                      }
                                    : {}
                            }
                            whileHover={{ scale: 1.2, y: -10 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{
                                duration: 0.15,
                                ease: "linear",
                            }}
                        >
                            <IconRenderer
                                content={app}
                                size="md"
                                className="text-zinc-900 dark:text-zinc-100"
                            />
                            {isMinimized && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(var(--text-secondary))] rounded-full" />
                            )}
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-[rgb(var(--bg-dropdown))] text-[rgb(var(--text-dropdown))] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                {app.title}
                            </div>
                        </motion.button>
                    );
                })}

                {/* Separator */}
                {pinnedApps.length > 0 && items.length > 0 && (
                    <div className="w-px h-8 bg-[rgb(var(--border-dock))] opacity-50 self-center" />
                )}

                {/* Regular Dock Items */}
                {items.map((item) => {
                    const isMinimized = minimizedMap.get(item.id) || false;
                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => onOpenItem(item)}
                            className={`w-12 h-12 rounded-xl hover:bg-[rgb(var(--bg-dock-hover))] flex items-center justify-center text-2xl hover:scale-110 transition-all relative group ${
                                isMinimized ? "opacity-60" : ""
                            }`}
                            title={item.title}
                            whileHover={{ scale: 1.2, y: -10 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{
                                duration: 0.15,
                                ease: "linear",
                            }}
                        >
                            <IconRenderer
                                content={item}
                                size="md"
                                className="text-[rgb(var(--text-primary))]"
                            />
                            {isMinimized && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(var(--text-secondary))] rounded-full" />
                            )}
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-[rgb(var(--bg-dropdown))] text-[rgb(var(--text-dropdown))] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                {item.title}
                            </div>
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
}
