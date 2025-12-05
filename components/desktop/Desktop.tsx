"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Content } from "@/app/data/content";
import { DesktopIcon } from "./DesktopIcon";
import { useAppStore } from "@/app/store/appStore";

interface DesktopProps {
    content: Content[];
    onOpenContent: (content: Content) => void;
    onContextMenu?: (e: React.MouseEvent, content: Content) => void;
}

// Responsive icon positioning with wrapping
const getDefaultIconPositions = (
    content: Content[],
    viewportWidth: number,
    sortMethod: "date" | "category" | "name"
): Map<string, { x: number; y: number }> => {
    const positions = new Map<string, { x: number; y: number }>();

    // Fixed spacing values
    const iconWidth = 96; // Icon width
    const columnWidth = 200; // Horizontal spacing between icons
    const rowHeight = 150; // Vertical spacing between rows
    const startX = 50;
    const startY = 100;
    const padding = 10; // Padding from edges (reduced to fit more icons)

    // Calculate how many columns fit per row
    // Be more aggressive - check if we can fit one more column
    const availableWidth = viewportWidth - startX * 2 - padding;
    let columnsPerRow = Math.floor(availableWidth / columnWidth);

    // Try to fit one more column if there's enough space for the icon itself
    const spaceForOneMore = availableWidth - columnsPerRow * columnWidth;
    if (spaceForOneMore >= iconWidth) {
        columnsPerRow++;
    }

    // Sort and organize content based on sort method
    let organizedContent: Content[];

    if (sortMethod === "category") {
        // Group content by category to keep related items together
        const contentByCategory = content.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {} as Record<string, typeof content>);

        organizedContent = Object.entries(contentByCategory)
            .sort(([a], [b]) => a.localeCompare(b))
            .flatMap(([, items]) => items);
    } else if (sortMethod === "date") {
        // Sort by date (newest first)
        organizedContent = [...content].sort(
            (a, b) =>
                new Date(b.dateAdded).getTime() -
                new Date(a.dateAdded).getTime()
        );
    } else {
        // Sort by name (alphabetically)
        organizedContent = [...content].sort((a, b) =>
            a.title.localeCompare(b.title)
        );
    }

    // Position icons with wrapping
    let currentRow = 0;
    let currentCol = 0;

    organizedContent.forEach((item) => {
        // Check if we need to wrap to next row
        if (currentCol >= columnsPerRow) {
            currentRow++;
            currentCol = 0;
        }

        const x = startX + currentCol * columnWidth;
        const y = startY + currentRow * rowHeight;

        // Ensure position doesn't exceed viewport
        const constrainedX = Math.min(x, viewportWidth - iconWidth - padding);

        positions.set(item.id, {
            x: constrainedX,
            y: y,
        });

        currentCol++;
    });

    return positions;
};

export function Desktop({
    content,
    onOpenContent,
    onContextMenu,
}: DesktopProps) {
    const [viewportWidth, setViewportWidth] = useState(0);
    const { menu } = useAppStore();

    useEffect(() => {
        const updateWidth = () => {
            setViewportWidth(window.innerWidth);
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    // Filter content based on viewFilter
    const filteredContent = useMemo(() => {
        if (menu.viewFilter === "all") {
            return content;
        }

        if (menu.viewFilter === "tools-only") {
            return content.filter((item) => item.type === "internal");
        }

        // Map filter names to category names
        const categoryMap: Record<string, string> = {
            engineering: "Engineering",
            music: "Music",
            art: "Art",
            "immersive-web": "Immersive Web",
            "social-tools": "Social Tools",
        };

        const targetCategory = categoryMap[menu.viewFilter];
        if (!targetCategory) {
            return content;
        }

        return content.filter((item) => item.category === targetCategory);
    }, [content, menu.viewFilter]);

    // Use viewport width once available, or fallback to a reasonable default
    const effectiveWidth = viewportWidth || 1920;
    const iconPositions = getDefaultIconPositions(
        filteredContent,
        effectiveWidth,
        menu.sortMethod
    );

    return (
        <div
            className="relative h-full overflow-hidden bg-[rgb(var(--bg-desktop))]"
            style={{
                width: "100%",
                maxWidth: "100vw",
                position: "relative",
                zIndex: 1,
            }}
        >
            <AnimatePresence mode="popLayout">
                {filteredContent.map((item) => {
                    const position = iconPositions.get(item.id) || {
                        x: 50,
                        y: 100,
                    };
                    return (
                        <DesktopIcon
                            key={item.id}
                            content={item}
                            position={position}
                            onClick={onOpenContent}
                            onContextMenu={onContextMenu}
                        />
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
