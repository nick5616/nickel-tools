"use client";

import React from "react";
import type { Content } from "@/app/data/content";
import { AppIcon } from "./AppIcon";

interface AppGridProps {
    content: Content[];
    onOpenItem: (content: Content) => void;
}

export function AppGrid({ content, onOpenItem }: AppGridProps) {
    return (
        <div
            className="p-4 h-full overflow-y-auto overflow-x-hidden"
            style={{
                pointerEvents: "auto",
                overscrollBehavior: "contain",
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
