"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getAllContent, formatDate, type Content } from "@/app/data/content";
import { AppTile } from "@/components/shared/AppTile";
import { useActiveScheme } from "@/components/shared/SystemPickers";
import { useSystemStore } from "@/app/store/systemStore";
import { paletteColor } from "@/app/utils/nickelPalette";
import { rectOf, springs, type OriginRect } from "@/components/shared/motion";

function Widget({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.section
            className={`nk-material rounded-3xl p-4 text-[rgb(var(--text-primary))] ${className}`}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...springs.window, delay }}
        >
            {children}
        </motion.section>
    );
}

export function ClockWidget() {
    const [now, setNow] = useState<Date | null>(null);
    useEffect(() => {
        setNow(new Date());
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <Widget>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))]">
                {now?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) ?? " "}
            </div>
            <div className="mt-1 text-5xl font-bbh-bartle tabular-nums leading-none">
                {now?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/, "") ?? " "}
                <span className="ml-1 text-base font-sans font-semibold text-[rgb(var(--text-secondary))]">
                    {now && (now.getHours() < 12 ? "AM" : "PM")}
                </span>
            </div>
        </Widget>
    );
}

/** The live palette: each scheme hue as its background/foreground role pair. */
export function PaletteWidget() {
    const { scheme, presetId } = useActiveScheme();
    const setControlCenterOpen = useSystemStore((s) => s.setControlCenterOpen);

    return (
        <Widget delay={0.05}>
            <div className="flex items-baseline justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))]">
                    Palette
                </h3>
                <span className="text-xs text-[rgb(var(--text-secondary))]">
                    {presetId ? scheme : `Custom · ${scheme}`}
                </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((slot) => (
                    <div
                        key={slot}
                        className="aspect-square rounded-[28%] flex items-center justify-center shadow-[inset_0_0_0_1px_rgb(var(--glass-border))]"
                        style={{ background: paletteColor(slot, "bg") }}
                        title={`Slot ${slot}: background and foreground roles`}
                    >
                        <span
                            className="w-1/2 aspect-square rounded-full"
                            style={{ background: paletteColor(slot, "fg") }}
                        />
                    </div>
                ))}
            </div>
            <button
                data-control-center-trigger
                onClick={() => setControlCenterOpen(true)}
                className="mt-3 w-full h-8 rounded-xl text-xs font-semibold transition-transform active:scale-[0.98]"
                style={{
                    background: paletteColor(1, "fg"),
                    color: paletteColor(1, "bg"),
                }}
            >
                Customize
            </button>
        </Widget>
    );
}

export function LatestWidget({
    onOpen,
}: {
    onOpen: (content: Content, rect?: OriginRect) => void;
}) {
    const latest = useMemo(
        () =>
            [...getAllContent()]
                .filter((c) => c.date && c.status === "operational")
                .sort(
                    (a, b) =>
                        (new Date(b.date!).getTime() || 0) -
                        (new Date(a.date!).getTime() || 0)
                )
                .slice(0, 4),
        []
    );

    return (
        <Widget delay={0.1}>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))]">
                Latest
            </h3>
            <ul className="mt-2 -mx-2">
                {latest.map((item) => (
                    <li key={item.id}>
                        <button
                            onClick={(e) =>
                                onOpen(item, rectOf(e.currentTarget.querySelector(".nk-tile")))
                            }
                            className="w-full flex items-center gap-3 px-2 py-1.5 rounded-xl text-left hover:bg-[rgb(var(--text-primary)/0.07)] transition-colors"
                        >
                            <AppTile content={item} size={32} showNumber={false} />
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium truncate">
                                    {item.title}
                                </span>
                                <span className="block text-xs text-[rgb(var(--text-secondary))]">
                                    {formatDate(item.date!)}
                                </span>
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </Widget>
    );
}
