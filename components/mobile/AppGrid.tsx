"use client";

import React from "react";
import type { Content } from "@/app/data/content";
import { AppIcon } from "./AppIcon";

interface AppGridProps {
    content: Content[];
    onOpenItem: (content: Content) => void;
}

export function AppGrid({ content, onOpenItem }: AppGridProps) {
    // Calculate bottom padding to account for base padding (p-4 = 16px) + AppTray height + safe area insets
    // AppTray: minHeight 80px + padding p-2 (8px top/bottom = 16px) + margin m-2 (8px top/bottom = 16px) = ~112px
    const basePadding = 16; // p-4 = 16px
    const appTrayHeight = 112;

    return (
        <div
            className="px-4 pt-4 h-full overflow-y-auto overflow-x-hidden"
            style={{
                pointerEvents: "auto",
                overscrollBehavior: "contain",
                paddingBottom: `calc(${basePadding}px + ${appTrayHeight}px + env(safe-area-inset-bottom, 0px))`,
            }}
        >
            <div className="grid grid-cols-3 gap-4 content-start">
                {content.map((item) => (
                    <AppIcon
                        key={item.id}
                        content={item}
                        onClick={() => onOpenItem(item)}
                    />
                ))}
            </div>
        </div>
    );
}
