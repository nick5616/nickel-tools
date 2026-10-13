"use client";

import React, { useMemo } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import type { Content } from "@/app/data/content";
import { DesktopIcon } from "./DesktopIcon";
import { Stack } from "./Stack";
import { ClockWidget, LatestWidget, PaletteWidget } from "./Widgets";
import { useAppStore, type SortMethod } from "@/app/store/appStore";
import { useSystemStore } from "@/app/store/systemStore";
import type { OriginRect } from "@/components/shared/motion";

interface DesktopProps {
    content: Content[];
    onOpenContent: (content: Content, rect?: OriginRect) => void;
    onContextMenu?: (e: React.MouseEvent, content?: Content) => void;
}

const CATEGORY_FILTERS: Record<string, string> = {
    engineering: "Engineering",
    music: "Music",
    art: "Art",
    "immersive-web": "Immersive Web",
    "social-tools": "Social Tools",
    "ai-tools": "AI / Productivity",
};

const time = (item: Content) => new Date(item.date ?? 0).getTime() || 0;

function sortItems(items: Content[], method: SortMethod): Content[] {
    const sorted = [...items];
    if (method === "date") sorted.sort((a, b) => time(b) - time(a));
    else if (method === "category")
        sorted.sort(
            (a, b) =>
                a.category.localeCompare(b.category) ||
                a.title.localeCompare(b.title)
        );
    else sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
}

export function Desktop({ content, onOpenContent, onContextMenu }: DesktopProps) {
    const menu = useAppStore((s) => s.menu);
    const useStacks = useSystemStore((s) => s.useStacks);

    const filtered = useMemo(() => {
        if (menu.viewFilter === "all") return content;
        if (menu.viewFilter === "tools-only")
            return content.filter((item) => item.type === "internal");
        const category = CATEGORY_FILTERS[menu.viewFilter];
        return category
            ? content.filter((item) => item.category === category)
            : content;
    }, [content, menu.viewFilter]);

    const sorted = useMemo(
        () => sortItems(filtered, menu.sortMethod),
        [filtered, menu.sortMethod]
    );

    // Stacks: one pile per category; lone apps stay loose
    const entries = useMemo(() => {
        if (!useStacks) {
            return sorted.map((item) => ({ kind: "icon" as const, item }));
        }
        const groups = new Map<string, Content[]>();
        sorted.forEach((item) => {
            const list = groups.get(item.category) ?? [];
            list.push(item);
            groups.set(item.category, list);
        });
        const ordered = [...groups.entries()];
        if (menu.sortMethod === "date") {
            ordered.sort(
                (a, b) =>
                    Math.max(...b[1].map(time)) - Math.max(...a[1].map(time))
            );
        } else {
            ordered.sort(([a], [b]) => a.localeCompare(b));
        }
        return ordered.map(([label, items]) =>
            items.length === 1
                ? { kind: "icon" as const, item: items[0] }
                : { kind: "stack" as const, label, items }
        );
    }, [sorted, useStacks, menu.sortMethod]);

    return (
        <div
            className="absolute inset-0 flex"
            onContextMenu={(e) => {
                if (e.target === e.currentTarget || (e.target as Element).closest("[data-desktop-surface]")) {
                    e.preventDefault();
                    onContextMenu?.(e);
                }
            }}
        >
            {/* Icons flow down columns, left to right, like a real desktop */}
            <div
                data-desktop-surface
                className="flex-1 min-w-0 p-4 pb-28 overflow-x-auto overflow-y-hidden"
            >
                <LayoutGroup>
                    <div
                        className="grid gap-x-2 gap-y-1 h-full content-start justify-start"
                        style={{
                            gridAutoFlow: "column",
                            gridTemplateRows: "repeat(auto-fill, 112px)",
                            gridAutoColumns: "96px",
                        }}
                    >
                        <AnimatePresence mode="popLayout">
                            {entries.map((entry) =>
                                entry.kind === "stack" ? (
                                    <Stack
                                        key={`stack-${entry.label}`}
                                        label={entry.label}
                                        items={entry.items}
                                        onOpen={onOpenContent}
                                        onContextMenu={onContextMenu}
                                    />
                                ) : (
                                    <DesktopIcon
                                        key={entry.item.id}
                                        content={entry.item}
                                        onOpen={onOpenContent}
                                        onContextMenu={onContextMenu}
                                    />
                                )
                            )}
                        </AnimatePresence>
                    </div>
                </LayoutGroup>
            </div>

            {/* Widgets */}
            {/* Scrolling clips overflow, so the column pads itself wide enough
                for the widgets' soft shadows and pulls back with a negative margin */}
            <aside className="hidden xl:flex flex-col gap-3 w-[348px] shrink-0 -ml-8 px-6 pt-4 pb-28 overflow-y-auto">
                <ClockWidget />
                <PaletteWidget />
                <LatestWidget onOpen={onOpenContent} />
            </aside>
        </div>
    );
}
