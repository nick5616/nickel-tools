"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ChevronRight, Palette } from "lucide-react";
import { getContentById, type Content } from "@/app/data/content";
import {
    AppearancePicker,
    PalettePresetPicker,
    WallpaperPicker,
} from "@/components/shared/SystemPickers";

const Contact = dynamic(() => import("@/components/tools/contact"), {
    loading: () => <div className="p-2 text-sm text-[rgb(var(--text-secondary))]">Loading…</div>,
    ssr: false,
});

const About = dynamic(() => import("@/components/tools/about"), {
    loading: () => <div className="p-2 text-sm text-[rgb(var(--text-secondary))]">Loading…</div>,
    ssr: false,
});

interface LeftPanelProps {
    onOpenItem: (content: Content) => void;
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <section className="nk-material rounded-3xl p-4 text-[rgb(var(--text-primary))]">
            {title && (
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))] mb-3">
                    {title}
                </h2>
            )}
            {children}
        </section>
    );
}

/** The "Today" page to the left of the home screen. */
export function LeftPanel({ onOpenItem }: LeftPanelProps) {
    const settings = getContentById("settings");

    return (
        <div
            className="h-full w-full overflow-y-auto overflow-x-hidden px-4 pt-2 pb-32 space-y-3"
            style={{ touchAction: "pan-y", overscrollBehavior: "contain" }}
        >
            <div className="flex items-center gap-3 px-1 py-2">
                <span
                    className="nk-tile flex flex-col items-center justify-center w-12 h-12 font-sans font-black tracking-tight"
                    style={{ ["--tile-hue" as string]: "var(--nk-h1)" }}
                >
                    <span className="absolute top-1 left-1.5 text-[8px] font-mono opacity-80">28</span>
                    <span className="text-lg mt-1">Ni</span>
                </span>
                <div className="nk-label">
                    <div className="font-bbh-bartle text-xl leading-none">Nickel</div>
                    <div className="text-xs font-mono opacity-70 mt-1">ELEMENT 28 · 58.693</div>
                </div>
            </div>

            <Card title="Palette">
                <PalettePresetPicker columns={4} />
                {settings && (
                    <button
                        onClick={() => onOpenItem(settings)}
                        className="mt-3 w-full h-10 rounded-2xl flex items-center gap-2 px-3 text-sm font-medium bg-[rgb(var(--text-primary)/0.06)] active:bg-[rgb(var(--text-primary)/0.12)]"
                    >
                        <Palette size={16} />
                        Open Color Engine
                        <ChevronRight size={16} className="ml-auto opacity-50" />
                    </button>
                )}
            </Card>

            <Card title="Appearance">
                <AppearancePicker />
            </Card>

            <Card title="Wallpaper">
                <WallpaperPicker columns={2} />
            </Card>

            <Card>
                <Contact />
            </Card>

            <Card>
                <About />
            </Card>
        </div>
    );
}
