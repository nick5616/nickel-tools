"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Rnd } from "react-rnd";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, Copy, Check } from "lucide-react";
import type { WindowState, Rect } from "@/app/store/appStore";
import { useAppStore, MENU_BAR_HEIGHT } from "@/app/store/appStore";
import { WindowControls } from "./WindowControls";
import { ContentRenderer } from "@/components/shared/ContentRenderer";
import { AppTile } from "@/components/shared/AppTile";
import { ContentfulDescriptionRenderer } from "@/components/shared/ContentfulDescriptionRenderer";
import { ContentInfoPopover } from "./ContentInfoPopover";
import { springs } from "@/components/shared/motion";

interface AppWindowProps {
    window: WindowState;
    isActive: boolean;
    onClose: () => void;
    onMinimize: () => void;
    onFocus: () => void;
}

const EDGE = 6; // px from a screen edge that triggers snapping

function getSnapRect(clientX: number, clientY: number): Rect | null {
    const vw = globalThis.window.innerWidth;
    const areaH = globalThis.window.innerHeight - MENU_BAR_HEIGHT;
    const y = clientY - MENU_BAR_HEIGHT;
    const half = Math.round(vw / 2);
    const halfH = Math.round(areaH / 2);
    const nearLeft = clientX <= EDGE;
    const nearRight = clientX >= vw - EDGE;

    if (nearLeft || nearRight) {
        const x = nearLeft ? 0 : half;
        if (y < areaH * 0.22) return { x, y: 0, width: half, height: halfH };
        if (y > areaH * 0.78)
            return { x, y: halfH, width: half, height: areaH - halfH };
        return { x, y: 0, width: half, height: areaH };
    }
    if (clientY <= MENU_BAR_HEIGHT + EDGE) {
        return { x: 0, y: 0, width: vw, height: areaH };
    }
    return null;
}

// Screen-space centre of this app's dock icon, the target for minimize.
function getDockTarget(contentId: string): { x: number; y: number } {
    const el = document.querySelector(`[data-dock-id="${contentId}"]`);
    if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return {
        x: globalThis.window.innerWidth / 2,
        y: globalThis.window.innerHeight - 30,
    };
}

export function AppWindow({
    window,
    isActive,
    onClose,
    onMinimize,
    onFocus,
}: AppWindowProps) {
    const {
        updateWindowPosition,
        updateWindowSize,
        toggleMaximizeWindow,
        snapWindow,
    } = useAppStore();
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [snapPreview, setSnapPreview] = useState<Rect | null>(null);
    const [frameAnimating, setFrameAnimating] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const frameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { width, height } = window.size;
    const { x, y } = window.position;

    // Smoothly animate the frame for programmatic size changes (maximize,
    // snap) but never while the user is dragging or resizing.
    const animateFrame = () => {
        setFrameAnimating(true);
        if (frameTimer.current) clearTimeout(frameTimer.current);
        frameTimer.current = setTimeout(() => setFrameAnimating(false), 320);
    };
    useEffect(
        () => () => {
            if (frameTimer.current) clearTimeout(frameTimer.current);
            document.body.classList.remove("nk-interacting");
        },
        []
    );

    const toggleMaximize = () => {
        animateFrame();
        toggleMaximizeWindow(window.id);
    };

    // Zoom out of the icon the window was launched from
    const initial = useMemo(() => {
        const o = window.originRect;
        if (!o) return { opacity: 0, scale: 0.94, x: 0, y: 0 };
        return {
            opacity: 0,
            scale: Math.max(0.08, o.width / width),
            x: o.x + o.width / 2 - (x + width / 2),
            y: o.y + o.height / 2 - (y + MENU_BAR_HEIGHT + height / 2),
        };
        // Only the first frame matters
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Genie into the dock slot when minimized
    const minimizedTarget = useMemo(() => {
        if (!window.minimized) return null;
        const t = getDockTarget(window.content.id);
        return {
            opacity: 0,
            scale: 0.1,
            x: t.x - (x + width / 2),
            y: t.y - (y + MENU_BAR_HEIGHT + height / 2),
        };
    }, [window.minimized, window.content.id, x, y, width, height]);

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

    const pointerOf = (e: MouseEvent | TouchEvent) =>
        "touches" in e
            ? e.touches[0] ?? e.changedTouches[0]
            : (e as MouseEvent);

    return (
        <>
            <Rnd
                size={{ width, height }}
                position={{ x, y }}
                disableDragging={!!window.maximized || window.minimized}
                enableResizing={!window.maximized && !window.minimized}
                onDragStart={() => {
                    document.body.classList.add("nk-interacting");
                    onFocus();
                }}
                onDrag={(e) => {
                    const p = pointerOf(e as MouseEvent | TouchEvent);
                    if (p) setSnapPreview(getSnapRect(p.clientX, p.clientY));
                }}
                onDragStop={(_e, d) => {
                    document.body.classList.remove("nk-interacting");
                    if (snapPreview) {
                        animateFrame();
                        if (
                            snapPreview.width ===
                                globalThis.window.innerWidth &&
                            snapPreview.y === 0
                        ) {
                            // Remember where it was dragged from, then maximize
                            updateWindowPosition(window.id, { x: d.x, y: d.y });
                            toggleMaximizeWindow(window.id);
                        } else {
                            snapWindow(window.id, snapPreview);
                        }
                        setSnapPreview(null);
                        return;
                    }
                    updateWindowPosition(window.id, { x: d.x, y: d.y });
                }}
                onResizeStart={() => {
                    document.body.classList.add("nk-interacting");
                    onFocus();
                }}
                onResizeStop={(_e, _dir, ref, _delta, position) => {
                    document.body.classList.remove("nk-interacting");
                    updateWindowSize(window.id, {
                        width: ref.offsetWidth,
                        height: ref.offsetHeight,
                    });
                    updateWindowPosition(window.id, position);
                }}
                minWidth={400}
                minHeight={300}
                bounds={window.maximized ? undefined : "parent"}
                style={{
                    zIndex: window.zIndex,
                    position: "absolute",
                    pointerEvents: window.minimized ? "none" : undefined,
                    transition: frameAnimating
                        ? "transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1), width 0.3s cubic-bezier(0.2, 0.9, 0.3, 1), height 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)"
                        : undefined,
                }}
                dragHandleClassName="nk-titlebar"
            >
                <motion.div
                    className={`nk-window h-full w-full bg-[rgb(var(--bg-window))] overflow-hidden flex flex-col ${
                        window.maximized ? "rounded-none" : "rounded-xl"
                    }`}
                    data-active={isActive}
                    initial={initial}
                    animate={
                        minimizedTarget ?? { opacity: 1, scale: 1, x: 0, y: 0 }
                    }
                    exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.16 } }}
                    transition={springs.window}
                    onMouseDownCapture={onFocus}
                >
                    {/* Title Bar */}
                    <div
                        className="nk-titlebar relative bg-[rgb(var(--bg-titlebar))] border-b border-[rgb(var(--border-window))] h-10 px-3 flex items-center gap-3 cursor-default select-none shrink-0 transition-opacity"
                        onDoubleClick={toggleMaximize}
                    >
                        <WindowControls
                            onClose={onClose}
                            onMinimize={onMinimize}
                            onMaximize={toggleMaximize}
                        />
                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 max-w-[60%] pointer-events-none">
                            <AppTile
                                content={window.content}
                                size={18}
                                showNumber={false}
                            />
                            <span className="text-[13px] font-semibold text-[rgb(var(--text-titlebar))] truncate">
                                {window.content.title}
                            </span>
                        </div>
                        <div
                            className="ml-auto flex items-center gap-1"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <ContentInfoPopover
                                content={window.content}
                                onTriggerClick={
                                    window.content.hasContentfulDescription
                                        ? handleInfoClick
                                        : undefined
                                }
                            />
                            <button
                                onClick={handleOpenInNewTab}
                                className="w-7 h-7 rounded-md hover:bg-[rgb(var(--bg-titlebar-hover))] flex items-center justify-center text-[rgb(var(--text-titlebar))]/70 hover:text-[rgb(var(--text-titlebar))] transition-colors"
                                aria-label="Open in new tab"
                                title="Open in new tab"
                            >
                                <ArrowUpRight size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative flex-1 overflow-hidden bg-[rgb(var(--bg-window))]">
                        <ContentRenderer content={window.content} />
                        {/* Iframes swallow clicks; this lets a click focus a background window */}
                        {!isActive && (
                            <div
                                className="absolute inset-0"
                                onMouseDown={onFocus}
                            />
                        )}
                    </div>
                </motion.div>
            </Rnd>

            {/* Snap preview, in the desktop area just beneath this window */}
            {typeof document !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {snapPreview && (
                            <motion.div
                                key="snap"
                                className="nk-material-thin absolute rounded-xl pointer-events-none"
                                style={{ zIndex: window.zIndex - 1 }}
                                initial={{
                                    opacity: 0,
                                    left: snapPreview.x + 24,
                                    top: snapPreview.y + 24,
                                    width: snapPreview.width - 48,
                                    height: snapPreview.height - 48,
                                }}
                                animate={{
                                    opacity: 1,
                                    left: snapPreview.x + 6,
                                    top: snapPreview.y + 6,
                                    width: snapPreview.width - 12,
                                    height: snapPreview.height - 12,
                                }}
                                exit={{ opacity: 0 }}
                                transition={springs.snappy}
                            />
                        )}
                    </AnimatePresence>,
                    document.getElementById("nk-desktop-area") ?? document.body
                )}

            {/* Info Modal */}
            {typeof document !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {isInfoModalOpen && (
                            <>
                                <motion.div
                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsInfoModalOpen(false)}
                                />
                                <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
                                    <motion.div
                                        ref={modalRef}
                                        className="nk-material-thick rounded-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto"
                                        initial={{ opacity: 0, scale: 0.94, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={springs.snappy}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="border-b border-[rgb(var(--border-window))] px-4 py-3 flex items-center gap-3">
                                            <AppTile
                                                content={window.content}
                                                size={28}
                                                showNumber={false}
                                            />
                                            <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                                                {window.content.title}
                                            </h3>
                                            <button
                                                onClick={() =>
                                                    setIsInfoModalOpen(false)
                                                }
                                                className="ml-auto w-7 h-7 rounded-md hover:bg-[rgb(var(--bg-titlebar-hover))] flex items-center justify-center text-[rgb(var(--text-primary))]/70 hover:text-[rgb(var(--text-primary))] transition-colors"
                                                aria-label="Close"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-auto p-4">
                                            {window.content
                                                .hasContentfulDescription ? (
                                                <ContentfulDescriptionRenderer
                                                    content={window.content}
                                                />
                                            ) : (
                                                <div className="space-y-2">
                                                    <p className="text-sm text-[rgb(var(--text-primary))] whitespace-pre-wrap break-words">
                                                        {window.content.description}
                                                    </p>
                                                    <button
                                                        onClick={
                                                            handleCopyDescription
                                                        }
                                                        className="flex items-center gap-2 text-xs text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                                                    >
                                                        {copied ? (
                                                            <>
                                                                <Check size={14} />
                                                                <span>Copied!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy size={14} />
                                                                <span>
                                                                    Copy description
                                                                </span>
                                                            </>
                                                        )}
                                                    </button>
                                                    {window.content.description.includes(
                                                        "sk-"
                                                    ) && (
                                                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
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
                    </AnimatePresence>,
                    document.body
                )}
        </>
    );
}
