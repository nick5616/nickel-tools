"use client";

import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { motion, AnimatePresence } from "framer-motion";
import { Info, ArrowUpRight, X, Copy, Check } from "lucide-react";
import type { WindowState } from "@/app/store/appStore";
import { useAppStore } from "@/app/store/appStore";
import { WindowControls } from "./WindowControls";
import { ContentRenderer } from "@/components/shared/ContentRenderer";
import { IconRenderer } from "@/components/shared/IconRenderer";
import { ContentfulDescriptionRenderer } from "@/components/shared/ContentfulDescriptionRenderer";

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
    const { updateWindowPosition, updateWindowSize, toggleMaximizeWindow } =
        useAppStore();
    const [isDragging, setIsDragging] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

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

    const handleInfoClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsInfoModalOpen(true);
    };

    const handleCopyDescription = async () => {
        try {
            await navigator.clipboard.writeText(window.content.description);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                setIsInfoModalOpen(false);
            }
        };

        if (isInfoModalOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isInfoModalOpen]);

    return (
        <AnimatePresence>
            <Rnd
                size={{ width: window.size.width, height: window.size.height }}
                position={{ x: window.position.x, y: window.position.y }}
                disableDragging={!!window.maximized}
                enableResizing={!window.maximized}
                onDragStart={() => {
                    setIsDragging(true);
                    onFocus();
                }}
                onDragStop={handleDragStop}
                onResizeStop={handleResizeStop}
                minWidth={400}
                minHeight={300}
                bounds={window.maximized ? undefined : "parent"}
                style={{
                    zIndex: window.zIndex,
                    position: "absolute",
                }}
                className="app-window"
                dragHandleClassName="window-titlebar"
            >
                <motion.div
                    className="h-full w-full bg-[rgb(var(--bg-window))] border border-[rgb(var(--border-window))] rounded-lg shadow-2xl overflow-hidden flex flex-col"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={onFocus}
                >
                    {/* Title Bar */}
                    <div
                        className="window-titlebar bg-[rgb(var(--bg-titlebar))] border-b border-[rgb(var(--border-window))] px-4 py-2 flex items-center justify-between cursor-move select-none overflow-visible"
                        onMouseDown={onFocus}
                    >
                        <div className="flex items-center gap-2">
                            <IconRenderer
                                content={window.content}
                                size="sm"
                                className="text-[rgb(var(--text-titlebar))]"
                            />
                            <span className="text-sm text-[rgb(var(--text-titlebar))] font-medium">
                                {window.content.title}
                            </span>
                            <div className="relative group overflow-visible">
                                <span
                                    title={
                                        window.content.hasContentfulDescription
                                            ? "Click me for more info!"
                                            : undefined
                                    }
                                >
                                    <Info
                                        size={14}
                                        onClick={
                                            window.content
                                                .hasContentfulDescription
                                                ? handleInfoClick
                                                : undefined
                                        }
                                        className={`text-[rgb(var(--text-titlebar))]/70 hover:text-[rgb(var(--text-titlebar))] transition-colors ${
                                            window.content
                                                .hasContentfulDescription
                                                ? "cursor-pointer"
                                                : "cursor-help"
                                        }`}
                                    />
                                </span>
                                {!window.content.hasContentfulDescription && (
                                    <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-[9999] pointer-events-none w-96">
                                        <div className="bg-[rgb(var(--bg-window))] text-[rgb(var(--text-primary))] text-xs rounded px-2 py-1 shadow-lg border border-[rgb(var(--border-window))] whitespace-normal">
                                            {window.content.description}
                                        </div>
                                        <div className="absolute left-2 -top-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[rgb(var(--bg-window))]"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleOpenInNewTab}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="w-6 h-6 rounded hover:bg-[rgb(var(--bg-titlebar-hover))] flex items-center justify-center text-[rgb(var(--text-titlebar))]/70 hover:text-[rgb(var(--text-titlebar))] transition-colors"
                                aria-label="Open in new tab"
                                title="Open in new tab"
                            >
                                <ArrowUpRight size={14} />
                            </button>
                            <WindowControls
                                onMinimize={onMinimize}
                                onMaximize={() =>
                                    toggleMaximizeWindow(window.id)
                                }
                                onClose={onClose}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden bg-[rgb(var(--bg-window))]">
                        <ContentRenderer content={window.content} />
                    </div>
                </motion.div>

                {/* Info Modal */}
                <AnimatePresence>
                    {isInfoModalOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                className="fixed inset-0 bg-black/50 z-[9999]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setIsInfoModalOpen(false)}
                            />
                            {/* Modal */}
                            <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
                                <motion.div
                                    ref={modalRef}
                                    className="bg-[rgb(var(--bg-window))] border border-[rgb(var(--border-window))] rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Modal Header */}
                                    <div className="bg-[rgb(var(--bg-titlebar))] border-b border-[rgb(var(--border-window))] px-4 py-3 flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-[rgb(var(--text-titlebar))]">
                                            {window.content.title}
                                        </h3>
                                        <button
                                            onClick={() =>
                                                setIsInfoModalOpen(false)
                                            }
                                            className="w-6 h-6 rounded hover:bg-[rgb(var(--bg-titlebar-hover))] flex items-center justify-center text-[rgb(var(--text-titlebar))]/70 hover:text-[rgb(var(--text-titlebar))] transition-colors"
                                            aria-label="Close"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Modal Content */}
                                    <div className="flex-1 overflow-auto p-4">
                                        {window.content
                                            .hasContentfulDescription ? (
                                            <ContentfulDescriptionRenderer
                                                content={window.content}
                                            />
                                        ) : (
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                                        Description
                                                    </h4>
                                                    <div className="bg-[rgb(var(--bg-desktop))] rounded p-3 border border-[rgb(var(--border-window))]">
                                                        <p className="text-sm text-[rgb(var(--text-primary))] whitespace-pre-wrap break-words">
                                                            {
                                                                window.content
                                                                    .description
                                                            }
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={
                                                            handleCopyDescription
                                                        }
                                                        className="mt-2 flex items-center gap-2 text-xs text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                                                    >
                                                        {copied ? (
                                                            <>
                                                                <Check
                                                                    size={14}
                                                                />
                                                                <span>
                                                                    Copied!
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy
                                                                    size={14}
                                                                />
                                                                <span>
                                                                    Copy
                                                                    description
                                                                </span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Security Warning */}
                                                {window.content.description.includes(
                                                    "sk-"
                                                ) && (
                                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                                                        <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                                                            ⚠️ Security Warning
                                                        </h4>
                                                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                                            This description
                                                            contains an API key.
                                                            Sending API keys
                                                            through client-side
                                                            code is inherently
                                                            insecure and should
                                                            never be done in
                                                            production
                                                            applications. API
                                                            keys can be easily
                                                            extracted from
                                                            client code and used
                                                            maliciously. Always
                                                            use server-side
                                                            endpoints or
                                                            environment
                                                            variables for
                                                            sensitive
                                                            credentials.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </>
                    )}
                </AnimatePresence>
            </Rnd>
        </AnimatePresence>
    );
}
