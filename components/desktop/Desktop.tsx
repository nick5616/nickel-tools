"use client";

import React, { useState, useEffect } from "react";
import type { Content } from "@/app/data/content";
import { DesktopIcon } from "./DesktopIcon";

interface DesktopProps {
    content: Content[];
    onOpenContent: (content: Content) => void;
    onContextMenu?: (e: React.MouseEvent, content: Content) => void;
}

// Responsive icon positioning with wrapping
const getDefaultIconPositions = (
    content: Content[],
    viewportWidth: number
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

    // Group content by category to keep related items together
    const contentByCategory = content.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof content>);

    // Position icons with wrapping
    let currentRow = 0;
    let currentCol = 0;

    Object.entries(contentByCategory).forEach(([category, items]) => {
        items.forEach((item) => {
            // Check if we need to wrap to next row
            if (currentCol >= columnsPerRow) {
                currentRow++;
                currentCol = 0;
            }

            const x = startX + currentCol * columnWidth;
            const y = startY + currentRow * rowHeight;

            // Ensure position doesn't exceed viewport
            const constrainedX = Math.min(
                x,
                viewportWidth - iconWidth - padding
            );

            positions.set(item.id, {
                x: constrainedX,
                y: y,
            });

            currentCol++;
        });

        // Add a small gap between categories (optional - can be removed if you want tighter packing)
        // currentCol++; // Uncomment to add gap between categories
    });

    return positions;
};

export function Desktop({
    content,
    onOpenContent,
    onContextMenu,
}: DesktopProps) {
    const [viewportWidth, setViewportWidth] = useState(0);

    useEffect(() => {
        const updateWidth = () => {
            setViewportWidth(window.innerWidth);
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    // Use viewport width once available, or fallback to a reasonable default
    const effectiveWidth = viewportWidth || 1920;
    const iconPositions = getDefaultIconPositions(content, effectiveWidth);

    return (
        <div
            className="relative h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950"
            style={{
                width: "100%",
                maxWidth: "100vw",
                position: "relative",
                zIndex: 1,
            }}
        >
            {content.map((item) => {
                const position = iconPositions.get(item.id) || {
                    x: 50,
                    y: 100,
                };
                return (
                    <DesktopIcon
                        key={item.id}
                        content={item}
                        position={position}
                        onDoubleClick={onOpenContent}
                        onContextMenu={onContextMenu}
                    />
                );
            })}
        </div>
    );
}
