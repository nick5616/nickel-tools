"use client";

import React, { useRef, useState } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    AnimatePresence,
    type MotionValue,
} from "framer-motion";
import { Search } from "lucide-react";
import type { Content } from "@/app/data/content";
import type { WindowState } from "@/app/store/appStore";
import { getFocusedWindow, useAppStore } from "@/app/store/appStore";
import { useSystemStore } from "@/app/store/systemStore";
import { getContentById } from "@/app/data/content";
import { AppTile } from "@/components/shared/AppTile";
import { springs, rectOf } from "@/components/shared/motion";

const BASE = 48;
const MAX = 76;
const REACH = 150;

const PINNED_IDS = ["portfolio", "art-digital-art", "settings"];

export function Dock() {
    const windows = useAppStore((s) => s.windows);
    const toggleWindowFromDock = useAppStore((s) => s.toggleWindowFromDock);
    const setSpotlightOpen = useSystemStore((s) => s.setSpotlightOpen);
    const mouseX = useMotionValue(Infinity);
    const [revealed, setRevealed] = useState(false);

    const pinned = PINNED_IDS.map(getContentById).filter(
        (app): app is Content => app !== undefined
    );
    const running = windows
        .map((w) => w.content)
        .filter((c) => !PINNED_IDS.includes(c.id));

    // Get out of the way of a maximized window, like a fullscreen app
    const focused = getFocusedWindow(windows);
    const autoHide = !!focused?.maximized;
    const hidden = autoHide && !revealed;

    return (
        <>
            {autoHide && (
                <div
                    className="fixed bottom-0 left-0 right-0 h-2 z-[9998]"
                    onMouseEnter={() => setRevealed(true)}
                />
            )}
            <div
                className="fixed bottom-3 left-0 right-0 flex justify-center z-[9999] pointer-events-none"
                onMouseLeave={() => setRevealed(false)}
            >
                <motion.div
                    className="nk-material flex items-end gap-2 px-2 pb-2 pt-2 rounded-[22px] pointer-events-auto"
                    style={{ height: BASE + 16 }}
                    initial={{ y: 90, opacity: 0 }}
                    animate={{ y: hidden ? 100 : 0, opacity: hidden ? 0 : 1 }}
                    transition={springs.window}
                    onMouseMove={(e) => mouseX.set(e.clientX)}
                    onMouseLeave={() => mouseX.set(Infinity)}
                >
                    {pinned.map((app) => (
                        <DockItem
                            key={app.id}
                            content={app}
                            window={windows.find((w) => w.content.id === app.id)}
                            mouseX={mouseX}
                            onClick={(rect) => toggleWindowFromDock(app, rect)}
                        />
                    ))}

                    <AnimatePresence initial={false}>
                        {running.length > 0 && (
                            <motion.div
                                key="sep"
                                className="w-px self-stretch my-2 bg-[rgb(var(--text-primary)/0.15)]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                        )}
                        {running.map((app) => (
                            <motion.div
                                key={app.id}
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "auto", opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={springs.snappy}
                            >
                                <DockItem
                                    content={app}
                                    window={windows.find(
                                        (w) => w.content.id === app.id
                                    )}
                                    mouseX={mouseX}
                                    onClick={(rect) =>
                                        toggleWindowFromDock(app, rect)
                                    }
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div className="w-px self-stretch my-2 bg-[rgb(var(--text-primary)/0.15)]" />
                    <DockButton
                        label="Search  ⌘K"
                        mouseX={mouseX}
                        onClick={() => setSpotlightOpen(true)}
                    >
                        <Search className="w-[45%] h-[45%]" strokeWidth={2} />
                    </DockButton>
                </motion.div>
            </div>
        </>
    );
}

function useMagnify(mouseX: MotionValue<number>, ref: React.RefObject<HTMLElement | null>) {
    const distance = useTransform(mouseX, (x) => {
        const r = ref.current?.getBoundingClientRect();
        return r ? x - (r.left + r.width / 2) : Infinity;
    });
    const target = useTransform(distance, [-REACH, 0, REACH], [BASE, MAX, BASE]);
    return useSpring(target, springs.dock);
}

function DockItem({
    content,
    window,
    mouseX,
    onClick,
}: {
    content: Content;
    window?: WindowState;
    mouseX: MotionValue<number>;
    onClick: (rect: ReturnType<typeof rectOf>) => void;
}) {
    const ref = useRef<HTMLButtonElement>(null);
    const size = useMagnify(mouseX, ref);
    // Render the tile once at full size and scale it, rather than re-render per frame
    const scale = useTransform(size, (s) => s / MAX);

    return (
        <motion.button
            ref={ref}
            data-dock-id={content.id}
            className="group relative flex flex-col items-center focus:outline-none"
            style={{ width: size, height: size }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onClick(rectOf(ref.current))}
            aria-label={content.title}
        >
            <motion.div
                className="absolute bottom-0 left-1/2"
                style={{
                    width: MAX,
                    height: MAX,
                    x: "-50%",
                    scale,
                    originY: 1,
                }}
            >
                <AppTile content={content} size={MAX} showNumber={false} />
            </motion.div>
            <Tooltip label={content.title} />
            {window && (
                <span
                    className={`absolute -bottom-1.5 w-1 h-1 rounded-full bg-[rgb(var(--text-primary))] ${
                        window.minimized ? "opacity-40" : "opacity-80"
                    }`}
                />
            )}
        </motion.button>
    );
}

function DockButton({
    label,
    mouseX,
    onClick,
    children,
}: {
    label: string;
    mouseX: MotionValue<number>;
    onClick: () => void;
    children: React.ReactNode;
}) {
    const ref = useRef<HTMLButtonElement>(null);
    const size = useMagnify(mouseX, ref);
    return (
        <motion.button
            ref={ref}
            className="group relative nk-material-thin rounded-[26%] flex items-center justify-center text-[rgb(var(--text-primary))] focus:outline-none"
            style={{ width: size, height: size }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            aria-label={label}
        >
            {children}
            <Tooltip label={label} />
        </motion.button>
    );
}

function Tooltip({ label }: { label: string }) {
    return (
        <span className="nk-material-thick absolute bottom-full mb-3 px-2.5 py-1 rounded-lg text-xs font-medium text-[rgb(var(--text-primary))] whitespace-nowrap opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none">
            {label}
        </span>
    );
}
