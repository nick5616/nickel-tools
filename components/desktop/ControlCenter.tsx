"use client";

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Palette } from "lucide-react";
import { useSystemStore } from "@/app/store/systemStore";
import { useAppStore, MENU_BAR_HEIGHT } from "@/app/store/appStore";
import { getContentById } from "@/app/data/content";
import { springs } from "@/components/shared/motion";
import {
    AppearancePicker,
    PalettePresetPicker,
    WallpaperPicker,
} from "@/components/shared/SystemPickers";

export function ControlCenter() {
    const { controlCenterOpen: open, setControlCenterOpen } = useSystemStore();
    const openWindow = useAppStore((s) => s.openWindow);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as Element;
            if (panelRef.current?.contains(target)) return;
            if (target.closest("[data-control-center-trigger]")) return;
            setControlCenterOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setControlCenterOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, setControlCenterOpen]);

    const openColorEngine = () => {
        const settings = getContentById("settings");
        if (settings) openWindow(settings);
        setControlCenterOpen(false);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={panelRef}
                    className="nk-material-thick fixed right-2 w-[340px] rounded-2xl p-3 space-y-3 origin-top-right text-[rgb(var(--text-primary))]"
                    style={{ top: MENU_BAR_HEIGHT + 6 }}
                    initial={{ opacity: 0, scale: 0.94, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                    transition={springs.snappy}
                    role="dialog"
                    aria-label="Control Center"
                >
                    <Section title="Appearance">
                        <AppearancePicker />
                    </Section>
                    <Section title="Palette">
                        <PalettePresetPicker columns={4} />
                        <button
                            onClick={openColorEngine}
                            className="mt-2 w-full h-8 rounded-lg flex items-center justify-center gap-2 text-xs font-medium bg-[rgb(var(--text-primary)/0.06)] hover:bg-[rgb(var(--text-primary)/0.1)] transition-colors"
                        >
                            <Palette size={13} />
                            Open Color Engine…
                        </button>
                    </Section>
                    <Section title="Wallpaper">
                        <WallpaperPicker columns={2} />
                    </Section>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="rounded-xl p-3 bg-[rgb(var(--bg-window)/0.5)] shadow-[inset_0_0_0_1px_rgb(var(--glass-border))]">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))] mb-2">
                {title}
            </h3>
            {children}
        </section>
    );
}
