"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
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
    const columnWidth = 150; // Horizontal spacing between icons
    const rowHeight = 150; // Vertical spacing between rows
    const startX = 20; // Anchor to top-left
    const startY = 20; // Anchor to top-left
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
    const [viewportHeight, setViewportHeight] = useState(0);
    const { menu, desktopPage, setDesktopPage, setDesktopTotalPages } =
        useAppStore();

    useEffect(() => {
        const updateDimensions = () => {
            setViewportWidth(window.innerWidth);
            setViewportHeight(window.innerHeight);
        };
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
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
            "ai-tools": "AI / Productivity",
        };

        const targetCategory = categoryMap[menu.viewFilter];
        if (!targetCategory) {
            return content;
        }

        return content.filter((item) => item.category === targetCategory);
    }, [content, menu.viewFilter]);

    // Use viewport dimensions once available, or fallback to reasonable defaults
    const effectiveWidth = viewportWidth || 1920;
    const effectiveHeight = viewportHeight || 1080;

    // Calculate rows per page based on viewport height
    // Desktop area is h-[calc(100vh-48px)], so we subtract 48px for menu bar
    // Also account for startY padding (20px) and some bottom padding (20px)
    const rowHeight = 150;
    const startY = 20;
    const menuBarHeight = 48;
    const bottomPadding = 20;
    const availableHeight =
        effectiveHeight - menuBarHeight - startY - bottomPadding;
    const rowsPerPage = Math.max(1, Math.floor(availableHeight / rowHeight));

    // Get all icon positions first
    const allIconPositions = getDefaultIconPositions(
        filteredContent,
        effectiveWidth,
        menu.sortMethod
    );

    // Calculate total pages based on the maximum row number
    const iconRows = Array.from(allIconPositions.values()).map((pos) => {
        // Calculate which row this position is on
        return Math.floor((pos.y - startY) / rowHeight);
    });
    const maxRow = iconRows.length > 0 ? Math.max(...iconRows) : -1;
    const totalPages = Math.max(1, Math.ceil((maxRow + 1) / rowsPerPage));

    // Update total pages in store
    useEffect(() => {
        setDesktopTotalPages(totalPages);
    }, [totalPages, setDesktopTotalPages]);

    // Reset to page 1 if current page exceeds total pages (e.g., after filtering)
    useEffect(() => {
        if (desktopPage > totalPages && totalPages > 0) {
            setDesktopPage(1);
        }
    }, [totalPages, desktopPage, setDesktopPage]);

    // Filter icon positions to only show current page
    const currentPageStartRow = (desktopPage - 1) * rowsPerPage;
    const currentPageEndRow = currentPageStartRow + rowsPerPage;

    const iconPositions = new Map<string, { x: number; y: number }>();
    allIconPositions.forEach((pos, id) => {
        const row = Math.floor((pos.y - startY) / rowHeight);
        if (row >= currentPageStartRow && row < currentPageEndRow) {
            // Adjust y position to be relative to the current page
            const adjustedY = pos.y - currentPageStartRow * rowHeight;
            iconPositions.set(id, { x: pos.x, y: adjustedY });
        }
    });

    // Filter content to only show items on current page
    const visibleContent = filteredContent.filter((item) =>
        iconPositions.has(item.id)
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
                {visibleContent.map((item) => {
                    const position = iconPositions.get(item.id) || {
                        x: 20,
                        y: 20,
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
