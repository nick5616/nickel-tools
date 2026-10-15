"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import type { Content } from "@/app/data/content";
import { AppTile } from "@/components/shared/AppTile";
import { rectOf, springs, type OriginRect } from "@/components/shared/motion";

interface AppIconProps {
    content: Content;
    onOpen: (content: Content, rect?: OriginRect) => void;
    onLongPress?: (content: Content, rect?: OriginRect) => void;
    size?: number;
    showLabel?: boolean;
}

const HOLD_MS = 450;
const MOVE_TOLERANCE = 8;

export function AppIcon({
    content,
    onOpen,
    onLongPress,
    size = 60,
    showLabel = true,
}: AppIconProps) {
    const tileRef = useRef<HTMLDivElement>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const start = useRef<{ x: number; y: number } | null>(null);
    const held = useRef(false);

    const cancel = () => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        start.current = null;
    };

    return (
        <motion.button
            className="flex flex-col items-center gap-1.5 w-full select-none focus:outline-none [-webkit-touch-callout:none]"
            whileTap={{ scale: 0.9 }}
            transition={springs.press}
            onPointerDown={(e) => {
                held.current = false;
                start.current = { x: e.clientX, y: e.clientY };
                if (!onLongPress) return;
                timer.current = setTimeout(() => {
                    held.current = true;
                    navigator.vibrate?.(10);
                    onLongPress(content, rectOf(tileRef.current));
                }, HOLD_MS);
            }}
            onPointerMove={(e) => {
                // A swipe between pages is not a long-press
                if (
                    start.current &&
                    Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) >
                        MOVE_TOLERANCE
                ) {
                    cancel();
                }
            }}
            onPointerUp={cancel}
            onPointerCancel={cancel}
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => {
                if (held.current) return;
                if (content.status !== "operational") return;
                onOpen(content, rectOf(tileRef.current));
            }}
            aria-label={content.title}
        >
            <AppTile ref={tileRef} content={content} size={size} showNumber={size >= 56} />
            {showLabel && (
                <span className="nk-label w-full px-0.5 text-[11px] font-medium leading-tight text-center truncate">
                    {content.title}
                </span>
            )}
        </motion.button>
    );
}
