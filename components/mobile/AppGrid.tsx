"use client";

import React from "react";
import type { Content } from "@/app/data/content";
import type { OriginRect } from "@/components/shared/motion";
import { AppIcon } from "./AppIcon";

interface AppGridProps {
    content: Content[];
    onOpenItem: (content: Content, rect?: OriginRect) => void;
    onLongPress: (content: Content, rect?: OriginRect) => void;
}

export function AppGrid({ content, onOpenItem, onLongPress }: AppGridProps) {
    return (
        <div className="h-full px-5 pt-3">
            <div className="grid grid-cols-4 gap-x-3 gap-y-5 content-start">
                {content.map((item) => (
                    <AppIcon
                        key={item.id}
                        content={item}
                        onOpen={onOpenItem}
                        onLongPress={onLongPress}
                    />
                ))}
            </div>
        </div>
    );
}
