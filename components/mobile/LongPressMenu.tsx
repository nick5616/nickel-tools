"use client";

import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Link2, Play } from "lucide-react";
import type { Content } from "@/app/data/content";
import { AppTile } from "@/components/shared/AppTile";
import { springs, type OriginRect } from "@/components/shared/motion";

interface LongPressMenuProps {
    content: Content;
    rect?: OriginRect;
    onOpen: (content: Content) => void;
    onClose: () => void;
}

/** Haptic-touch style preview: the icon lifts over a blurred home screen. */
export function LongPressMenu({ content, rect, onOpen, onClose }: LongPressMenuProps) {
    if (typeof document === "undefined") return null;

    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const tileSize = 72;
    const tile = rect ?? { x: vw / 2 - 30, y: vh / 3, width: 60, height: 60 };
    const below = tile.y < vh * 0.55;
    const menuWidth = Math.min(280, vw - 32);
    const left = Math.max(16, Math.min(tile.x + tile.width / 2 - menuWidth / 2, vw - menuWidth - 16));

    const href = content.type === "external" ? content.url : content.type === "internal" ? content.route : null;

    const share = async () => {
        const url = `${window.location.origin}/desktop/${content.id}`;
        try {
            if (navigator.share) await navigator.share({ title: content.title, url });
            else await navigator.clipboard?.writeText(url);
        } catch {
            // Share sheet dismissed
        }
        onClose();
    };

    const actions = [
        { label: "Open", Icon: Play, run: () => onOpen(content) },
        ...(href
            ? [{ label: "Open in New Tab", Icon: ArrowUpRight, run: () => { window.open(href, "_blank", "noopener,noreferrer"); onClose(); } }]
            : []),
        { label: "Share", Icon: Link2, run: share },
    ];

    return createPortal(
        <motion.div
            className="fixed inset-0 z-[14000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-xl" />

            <motion.div
                className="absolute"
                style={{ left: tile.x + tile.width / 2 - tileSize / 2, top: tile.y + tile.height / 2 - tileSize / 2 }}
                initial={{ scale: tile.width / tileSize }}
                animate={{ scale: 1 }}
                transition={springs.press}
            >
                <AppTile content={content} size={tileSize} />
            </motion.div>

            <motion.div
                className="nk-material-thick absolute rounded-2xl overflow-hidden text-[rgb(var(--text-primary))]"
                style={{
                    left,
                    width: menuWidth,
                    ...(below
                        ? { top: tile.y + tile.height / 2 + tileSize / 2 + 14 }
                        : { bottom: vh - (tile.y + tile.height / 2 - tileSize / 2) + 14 }),
                    transformOrigin: below ? "top center" : "bottom center",
                }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={springs.snappy}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-4 py-3 border-b border-[rgb(var(--text-primary)/0.08)]">
                    <div className="text-sm font-semibold">{content.title}</div>
                    <p className="mt-1 text-xs text-[rgb(var(--text-secondary))] line-clamp-3">
                        {content.description}
                    </p>
                </div>
                {actions.map(({ label, Icon, run }) => (
                    <button
                        key={label}
                        onClick={run}
                        className="w-full flex items-center justify-between px-4 h-11 text-[15px] border-b last:border-b-0 border-[rgb(var(--text-primary)/0.08)] active:bg-[rgb(var(--text-primary)/0.08)]"
                    >
                        {label}
                        <Icon size={17} />
                    </button>
                ))}
            </motion.div>
        </motion.div>,
        document.body
    );
}
