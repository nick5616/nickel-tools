"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Content } from "@/app/data/content";
import { IconRenderer } from "@/components/shared/IconRenderer";

interface DesktopIconProps {
    content: Content;
    position: { x: number; y: number };
    onClick: (content: Content) => void;
    onContextMenu?: (e: React.MouseEvent, content: Content) => void;
}

export function DesktopIcon({
    content,
    position,
    onClick,
    onContextMenu,
}: DesktopIconProps) {
    return (
        <motion.div
            className="absolute cursor-pointer select-none group z-0"
            style={{
                left: `${Math.max(10, position.x)}px`,
                top: `${position.y}px`,
                maxWidth: "96px",
                right: "auto",
                zIndex: 1,
            }}
            onClick={() => {
                if (content.status !== "operational") {
                    return;
                }
                return onClick(content);
            }}
            onContextMenu={(e) => onContextMenu?.(e, content)}
            whileHover={
                content.status === "operational"
                    ? { scale: 1.1 }
                    : { scale: 0.8 }
            }
            whileTap={content.status === "operational" ? { scale: 0.95 } : {}}
            initial={
                content.status === "operational"
                    ? { opacity: 0, scale: 0.8 }
                    : { opacity: 0.5, scale: 0.8 }
            }
            animate={
                content.status === "operational"
                    ? {
                          opacity: 1,
                          scale: 1,
                          x: 0,
                          y: 0,
                      }
                    : {
                          opacity: 0.5,
                          scale: 0.8,
                          x: 0,
                          y: 0,
                      }
            }
            exit={{ opacity: 0, scale: 0.8 }}
            layout
            transition={{
                duration: 0.3,
                ease: "easeOut",
            }}
        >
            <div className="flex flex-col items-center w-24 p-2 rounded hover:bg-white/10 dark:hover:bg-white/10 transition-colors">
                <div className="text-4xl mb-1 group-hover:scale-110 transition-transform flex items-center justify-center">
                    <IconRenderer
                        content={content}
                        size="lg"
                        className="text-zinc-800 dark:text-zinc-200"
                    />
                </div>
                <div className="text-xs text-center text-zinc-900 dark:text-white/90 leading-tight px-1">
                    {content.title}
                </div>
            </div>
        </motion.div>
    );
}
