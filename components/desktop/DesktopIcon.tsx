"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import type { Content } from "@/app/data/content";
import { AppTile } from "@/components/shared/AppTile";
import { rectOf, springs, type OriginRect } from "@/components/shared/motion";

interface DesktopIconProps {
    content: Content;
    onOpen: (content: Content, rect?: OriginRect) => void;
    onContextMenu?: (e: React.MouseEvent, content: Content) => void;
    size?: number;
}

export function DesktopIcon({
    content,
    onOpen,
    onContextMenu,
    size = 60,
}: DesktopIconProps) {
    const tileRef = useRef<HTMLDivElement>(null);
    const operational = content.status === "operational";

    return (
        <motion.button
            layout
            className="group flex flex-col items-center gap-1.5 w-[96px] p-1.5 rounded-xl select-none focus:outline-none focus-visible:bg-[rgb(var(--text-primary)/0.12)] hover:bg-[rgb(var(--text-primary)/0.07)] transition-colors"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={springs.snappy}
            whileTap={operational ? { scale: 0.94 } : undefined}
            onClick={() => operational && onOpen(content, rectOf(tileRef.current))}
            onContextMenu={(e) => onContextMenu?.(e, content)}
            aria-disabled={!operational}
            title={operational ? content.title : `${content.title} (${content.status})`}
        >
            <AppTile ref={tileRef} content={content} size={size} />
            <span className="nk-label text-[12px] font-medium leading-tight text-center line-clamp-2 break-words w-full">
                {content.title}
            </span>
        </motion.button>
    );
}
