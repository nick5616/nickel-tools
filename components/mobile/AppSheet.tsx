"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
    animate,
    motion,
    useMotionValue,
    useTransform,
    type PanInfo,
} from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { Content } from "@/app/data/content";
import { ContentRenderer } from "@/components/shared/ContentRenderer";
import { AppTile } from "@/components/shared/AppTile";
import { springs, type OriginRect } from "@/components/shared/motion";

interface AppSheetProps {
    content: Content;
    originRect?: OriginRect;
    onClose: () => void;
    onSwitcher: () => void;
}

function rectTransform(rect: OriginRect | undefined) {
    if (typeof window === "undefined" || !rect) {
        return { opacity: 0, scale: 0.92, x: 0, y: 0, borderRadius: 40 };
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
        opacity: 0.4,
        x: rect.x + rect.width / 2 - vw / 2,
        y: rect.y + rect.height / 2 - vh / 2,
        scaleX: rect.width / vw,
        scaleY: rect.height / vh,
        borderRadius: 120,
    };
}

export type SheetExit = "home" | "switcher";

export function AppSheet({ content, originRect, onClose, onSwitcher }: AppSheetProps) {
    const from = useMemo(() => rectTransform(originRect), [originRect]);

    // Home-indicator gesture
    const progress = useMotionValue(0); // 0 = open, 1 = fully pulled up
    const scale = useTransform(progress, [0, 1], [1, 0.55]);
    const y = useTransform(progress, [0, 1], [0, -120]);
    const radius = useTransform(progress, [0, 0.15], [0, 44]);

    // The in-progress gesture, so it can still be finished if the browser
    // hands the pointer to the app's iframe before we see it lift.
    const lastPan = useRef<PanInfo | null>(null);

    const finishGesture = (info: PanInfo) => {
        lastPan.current = null;
        document.body.classList.remove("nk-interacting");
        const pulled = -info.offset.y;
        const fastFlick = info.velocity.y < -600;
        if (!fastFlick && pulled > window.innerHeight * 0.28) {
            onSwitcher();
        } else if (fastFlick || pulled > 90) {
            onClose();
        } else {
            animate(progress, 0, springs.window);
        }
    };

    const abandonGesture = () => {
        if (lastPan.current) finishGesture({ ...lastPan.current, velocity: { x: 0, y: 0 } });
    };

    // Window listeners are attached once; they call the latest handlers.
    // (Re-attaching on every parent render would strip the iframe guard
    // class mid-gesture.)
    const latest = useRef({ onClose, abandonGesture });
    useEffect(() => {
        latest.current = { onClose, abandonGesture };
    });
    useEffect(() => {
        const onKey = (e: KeyboardEvent) =>
            e.key === "Escape" && latest.current.onClose();
        const onBlur = () => latest.current.abandonGesture();
        window.addEventListener("keydown", onKey);
        window.addEventListener("blur", onBlur);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("blur", onBlur);
            document.body.classList.remove("nk-interacting");
        };
    }, []);

    const onPan = (_e: PointerEvent, info: PanInfo) => {
        lastPan.current = info;
        const p = Math.max(0, Math.min(1, -info.offset.y / (window.innerHeight * 0.7)));
        progress.set(p);
    };

    const onPanEnd = (_e: PointerEvent, info: PanInfo) => {
        if (lastPan.current) finishGesture(info);
    };

    return (
        <motion.div
            className="fixed inset-0 z-[12000] pointer-events-auto"
            style={{ originX: 0.5, originY: 0.5 }}
            initial={from}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, borderRadius: 0 }}
            // The parent's AnimatePresence passes `custom` = how we're leaving
            variants={{
                exit: (mode: SheetExit) =>
                    mode === "switcher"
                        ? { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
                        : { ...from, opacity: 0 },
            }}
            exit="exit"
            transition={springs.window}
        >
            <motion.div
                className="absolute inset-0 overflow-hidden flex flex-col bg-[rgb(var(--bg-window))] shadow-2xl"
                style={{ scale, y, borderRadius: radius }}
            >
                {/* Header */}
                <div
                    className="nk-material-thick !border-0 !border-b flex items-center gap-3 px-4 shrink-0 !rounded-none"
                    style={{
                        paddingTop: "max(env(safe-area-inset-top, 0px), 10px)",
                        height: "calc(max(env(safe-area-inset-top, 0px), 10px) + 48px)",
                    }}
                >
                    <button
                        onClick={onClose}
                        className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-[rgb(var(--text-primary))] active:bg-[rgb(var(--text-primary)/0.1)]"
                        aria-label="Close app"
                    >
                        <ChevronDown size={22} />
                    </button>
                    <AppTile content={content} size={26} showNumber={false} />
                    <h1 className="flex-1 min-w-0 truncate text-[15px] font-semibold text-[rgb(var(--text-primary))]">
                        {content.title}
                    </h1>
                    {(content.type === "external" || content.type === "internal") && (
                        <a
                            href={content.type === "external" ? content.url : content.route}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[rgb(var(--text-primary))] active:bg-[rgb(var(--text-primary)/0.1)]"
                            aria-label="Open in new tab"
                        >
                            <ArrowUpRight size={18} />
                        </a>
                    )}
                </div>

                <div
                    className="flex-1 min-h-0 overflow-auto"
                    style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)" }}
                >
                    <ContentRenderer content={content} />
                </div>

                {/* Home indicator */}
                <motion.div
                    className="absolute bottom-0 inset-x-0 flex justify-center items-end z-10"
                    style={{
                        height: "calc(env(safe-area-inset-bottom, 0px) + 26px)",
                        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
                        touchAction: "none",
                    }}
                    // Keep the gesture once the finger/pointer leaves the
                    // handle; otherwise the app's iframe swallows the moves.
                    onPointerDown={(e) => {
                        e.currentTarget.setPointerCapture(e.pointerId);
                        document.body.classList.add("nk-interacting");
                    }}
                    onPointerUp={() => document.body.classList.remove("nk-interacting")}
                    onPointerCancel={abandonGesture}
                    onLostPointerCapture={abandonGesture}
                    onPan={onPan}
                    onPanEnd={onPanEnd}
                    aria-label="Swipe up to go home"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && onClose()}
                >
                    <span className="w-[134px] h-[5px] rounded-full bg-[rgb(var(--text-primary)/0.75)]" />
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
