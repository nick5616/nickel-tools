"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { Content } from "@/app/data/content";
import { AppTile } from "@/components/shared/AppTile";
import { springs, type OriginRect } from "@/components/shared/motion";
import { DesktopIcon } from "./DesktopIcon";

interface StackProps {
    label: string;
    items: Content[];
    onOpen: (content: Content, rect?: OriginRect) => void;
    onContextMenu?: (e: React.MouseEvent, content: Content) => void;
}

const FAN = [
    { rotate: -9, x: -7, y: 3 },
    { rotate: 7, x: 7, y: 2 },
    { rotate: 0, x: 0, y: 0 },
];

/** A category folded into a fanned pile; click to spread it out. */
export function Stack({ label, items, onOpen, onContextMenu }: StackProps) {
    const [open, setOpen] = useState(false);
    const [anchor, setAnchor] = useState<DOMRect | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const preview = items.slice(0, 3).reverse();

    useEffect(() => {
        if (!open) return;
        const onDown = (e: PointerEvent) => {
            const t = e.target as Node;
            if (panelRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
            setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("pointerdown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const toggle = () => {
        setAnchor(buttonRef.current?.getBoundingClientRect() ?? null);
        setOpen((o) => !o);
    };

    // Panel opens beside the stack, kept on screen
    const columns = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(items.length))));
    const panelWidth = columns * 100 + 24;
    const panelPos = anchor
        ? {
              left: Math.min(anchor.right + 8, window.innerWidth - panelWidth - 12),
              top: Math.max(52, Math.min(anchor.top - 8, window.innerHeight - 420)),
          }
        : { left: 0, top: 0 };

    return (
        <>
            <motion.button
                ref={buttonRef}
                layout
                className={`group flex flex-col items-center gap-1.5 w-[96px] p-1.5 rounded-xl select-none focus:outline-none focus-visible:bg-[rgb(var(--text-primary)/0.12)] transition-colors ${
                    open ? "bg-[rgb(var(--text-primary)/0.12)]" : "hover:bg-[rgb(var(--text-primary)/0.07)]"
                }`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={springs.snappy}
                whileTap={{ scale: 0.94 }}
                onClick={toggle}
                aria-expanded={open}
                title={`${label} (${items.length})`}
            >
                <span className="relative w-[60px] h-[60px]">
                    {preview.map((item, i) => {
                        const fan = FAN[i + (3 - preview.length)];
                        return (
                            <motion.span
                                key={item.id}
                                className="absolute inset-0"
                                animate={
                                    open
                                        ? { rotate: fan.rotate * 1.8, x: fan.x * 2.2, y: fan.y - 4 }
                                        : { rotate: fan.rotate, x: fan.x, y: fan.y }
                                }
                                whileHover={{ rotate: fan.rotate * 1.4, x: fan.x * 1.6 }}
                                transition={springs.press}
                            >
                                <AppTile content={item} size={60} showNumber={false} />
                            </motion.span>
                        );
                    })}
                    <span className="absolute -top-1.5 -right-2 z-10 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center bg-[hsl(var(--nk-h1)_var(--nk-s)_var(--nk-fg-l))] text-[hsl(var(--nk-h1)_var(--nk-s)_var(--nk-bg-l))] shadow">
                        {items.length}
                    </span>
                </span>
                <span className="nk-label text-[12px] font-medium leading-tight text-center line-clamp-2 w-full">
                    {label}
                </span>
            </motion.button>

            {typeof document !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {open && anchor && (
                            <motion.div
                                ref={panelRef}
                                className="nk-material fixed z-[9000] rounded-3xl p-3"
                                style={{
                                    ...panelPos,
                                    width: panelWidth,
                                    transformOrigin: `${anchor.left + anchor.width / 2 - panelPos.left}px ${anchor.top + anchor.height / 2 - panelPos.top}px`,
                                }}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={springs.window}
                            >
                                <div className="px-2 pb-2 flex items-baseline justify-between">
                                    <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                                        {label}
                                    </h3>
                                    <span className="text-xs text-[rgb(var(--text-secondary))]">
                                        {items.length} apps
                                    </span>
                                </div>
                                <div
                                    className="grid gap-1 max-h-[360px] overflow-y-auto"
                                    style={{ gridTemplateColumns: `repeat(${columns}, 96px)` }}
                                >
                                    {items.map((item) => (
                                        <DesktopIcon
                                            key={item.id}
                                            content={item}
                                            onContextMenu={onContextMenu}
                                            onOpen={(content, rect) => {
                                                setOpen(false);
                                                onOpen(content, rect);
                                            }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </>
    );
}
