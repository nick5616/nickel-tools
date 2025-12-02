"use client";

import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { motion, AnimatePresence } from "framer-motion";
import { Info, ArrowUpRight } from "lucide-react";
import type { WindowState } from "@/app/store/appStore";
import { useAppStore } from "@/app/store/appStore";
import { WindowControls } from "./WindowControls";
import { ContentRenderer } from "@/components/shared/ContentRenderer";
import { IconRenderer } from "@/components/shared/IconRenderer";

interface AppWindowProps {
    window: WindowState;
    onClose: () => void;
    onMinimize: () => void;
    onFocus: () => void;
}

export function AppWindow({
    window,
    onClose,
    onMinimize,
    onFocus,
}: AppWindowProps) {
    const { updateWindowPosition, updateWindowSize } = useAppStore();
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStop = (_e: any, d: { x: number; y: number }) => {
        updateWindowPosition(window.id, { x: d.x, y: d.y });
        setIsDragging(false);
    };

    const handleResizeStop = (
        _e: any,
        _direction: any,
        ref: HTMLElement,
        _delta: any,
        position: { x: number; y: number }
    ) => {
        updateWindowSize(window.id, {
            width: ref.offsetWidth,
            height: ref.offsetHeight,
        });
        updateWindowPosition(window.id, position);
    };

    const handleOpenInNewTab = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.content.type === "external") {
            globalThis.window.open(
                window.content.url,
                "_blank",
                "noopener,noreferrer"
            );
        } else if (window.content.type === "internal") {
            globalThis.window.open(window.content.route, "_blank");
        }
    };

    return (
        <AnimatePresence>
            <Rnd
                size={{ width: window.size.width, height: window.size.height }}
                position={{ x: window.position.x, y: window.position.y }}
                onDragStart={() => {
                    setIsDragging(true);
                    onFocus();
                }}
                onDragStop={handleDragStop}
                onResizeStop={handleResizeStop}
                minWidth={400}
                minHeight={300}
                bounds="window"
                style={{ zIndex: window.zIndex, position: "absolute" }}
                className="app-window"
                dragHandleClassName="window-titlebar"
            >
                <motion.div
                    className="h-full w-full bg-zinc-800 dark:bg-zinc-800 border border-zinc-700 dark:border-zinc-700 rounded-lg shadow-2xl overflow-hidden flex flex-col"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={onFocus}
                >
                    {/* Title Bar */}
                    <div
                        className="window-titlebar bg-zinc-900 dark:bg-zinc-900 border-b border-zinc-700 dark:border-zinc-700 px-4 py-2 flex items-center justify-between cursor-move select-none overflow-visible"
                        onMouseDown={onFocus}
                    >
                        <div className="flex items-center gap-2">
                            <IconRenderer
                                content={window.content}
                                size="sm"
                                className="text-zinc-300"
                            />
                            <span className="text-sm text-white font-medium">
                                {window.content.title}
                            </span>
                            <div className="relative group overflow-visible">
                                <Info
                                    size={14}
                                    className="text-zinc-400 hover:text-zinc-300 cursor-help transition-colors"
                                />
                                <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-[9999] pointer-events-none w-96">
                                    <div className="bg-zinc-800 text-zinc-200 text-xs rounded px-2 py-1 shadow-lg border border-zinc-700 whitespace-normal">
                                        {window.content.description}
                                    </div>
                                    <div className="absolute left-2 -top-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-zinc-800"></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleOpenInNewTab}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="w-6 h-6 rounded hover:bg-zinc-700 dark:hover:bg-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                                aria-label="Open in new tab"
                                title="Open in new tab"
                            >
                                <ArrowUpRight size={14} />
                            </button>
                            <WindowControls
                                onMinimize={onMinimize}
                                onClose={onClose}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden bg-zinc-900 dark:bg-zinc-900">
                        <ContentRenderer content={window.content} />
                    </div>
                </motion.div>
            </Rnd>
        </AnimatePresence>
    );
}
