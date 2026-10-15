"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { AppIcon } from "./AppIcon";
import { AppTile } from "@/components/shared/AppTile";
import { getAllContent, type Content } from "@/app/data/content";
import { springs, type OriginRect } from "@/components/shared/motion";

interface RightPanelProps {
    onOpenItem: (content: Content, rect?: OriginRect) => void;
    onSearch: () => void;
}

/** The App Library: every app, foldered by category. */
export function RightPanel({ onOpenItem, onSearch }: RightPanelProps) {
    const allContent = getAllContent();
    const [openFolder, setOpenFolder] = useState<string | null>(null);

    const folders = useMemo(() => {
        const groups = new Map<string, Content[]>();
        allContent.forEach((item) => {
            const list = groups.get(item.category) ?? [];
            list.push(item);
            groups.set(item.category, list);
        });
        return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
    }, [allContent]);

    const folderItems = folders.find(([name]) => name === openFolder)?.[1] ?? [];

    return (
        <div
            className="relative h-full w-full overflow-y-auto overflow-x-hidden px-5 pt-2 pb-32"
            style={{ touchAction: "pan-y", overscrollBehavior: "contain" }}
        >
            <button
                onClick={onSearch}
                className="nk-material w-full h-11 rounded-2xl flex items-center gap-2 px-3 text-[rgb(var(--text-secondary))] text-[15px]"
            >
                <Search size={18} />
                App Library
            </button>

            <div className="mt-4 grid grid-cols-2 gap-4">
                {folders.map(([name, items]) => (
                    <div key={name}>
                        <button
                            onClick={() => setOpenFolder(name)}
                            className="nk-material w-full aspect-square rounded-[28px] p-3 grid grid-cols-2 gap-2.5"
                            aria-label={`${name}, ${items.length} apps`}
                        >
                            {items.slice(0, 4).map((item) => (
                                <span key={item.id} className="flex items-center justify-center">
                                    <AppTile content={item} size={52} showNumber={false} />
                                </span>
                            ))}
                        </button>
                        <div className="nk-label mt-1.5 text-xs font-medium text-center truncate">
                            {name}
                        </div>
                    </div>
                ))}
            </div>

            {typeof document !== "undefined" &&
                createPortal(
            <AnimatePresence>
                {openFolder && (
                    <motion.div
                        className="fixed inset-0 z-[15000] flex items-center justify-center p-6 bg-black/25 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpenFolder(null)}
                    >
                        <motion.div
                            className="nk-material-thick w-full max-w-sm rounded-[32px] p-5"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={springs.window}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center mb-4">
                                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                                    {openFolder}
                                </h2>
                                <button
                                    onClick={() => setOpenFolder(null)}
                                    className="ml-auto w-8 h-8 rounded-full flex items-center justify-center bg-[rgb(var(--text-primary)/0.08)] text-[rgb(var(--text-primary))]"
                                    aria-label="Close folder"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-x-3 gap-y-5 max-h-[60vh] overflow-y-auto">
                                {folderItems.map((item) => (
                                    <AppIcon
                                        key={item.id}
                                        content={item}
                                        onOpen={(content, rect) => {
                                            setOpenFolder(null);
                                            onOpenItem(content, rect);
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>,
                    document.body
                )}
        </div>
    );
}
