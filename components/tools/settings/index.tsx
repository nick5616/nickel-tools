"use client";

import React, { useState, useEffect } from "react";
import { Palette, Monitor, Image as ImageIcon, SunMoon } from "lucide-react";
import { ColorSchemeGenerator } from "./ColorSchemeGenerator";
import {
    AppearancePicker,
    PalettePresetPicker,
    WallpaperPicker,
} from "@/components/shared/SystemPickers";

const WINDOW_SIZE_STORAGE_KEY = "nickel-default-window-size";

export default function Settings() {
    const [defaultWindowWidth, setDefaultWindowWidth] = useState(800);
    const [defaultWindowHeight, setDefaultWindowHeight] = useState(600);

    // Load window size from localStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const stored = localStorage.getItem(WINDOW_SIZE_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.width) setDefaultWindowWidth(parsed.width);
                if (parsed.height) setDefaultWindowHeight(parsed.height);
            }
        } catch (error) {
            console.error(
                "Failed to load window size from localStorage:",
                error
            );
        }
    }, []);

    // Save window size to localStorage when changed
    const handleWidthChange = (width: number) => {
        setDefaultWindowWidth(width);
        saveWindowSize({ width, height: defaultWindowHeight });
    };

    const handleHeightChange = (height: number) => {
        setDefaultWindowHeight(height);
        saveWindowSize({ width: defaultWindowWidth, height });
    };

    const saveWindowSize = (size: { width: number; height: number }) => {
        if (typeof window === "undefined") return;

        try {
            localStorage.setItem(WINDOW_SIZE_STORAGE_KEY, JSON.stringify(size));
        } catch (error) {
            console.error("Failed to save window size to localStorage:", error);
        }
    };

    return (
        <div className="w-full bg-transparent">
            <div className="w-full p-4">
                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-3 flex items-center gap-2">
                    <SunMoon size={18} />
                    Appearance
                </h2>
                <div className="max-w-sm">
                    <AppearancePicker />
                </div>

                <hr className="border-t border-[rgb(var(--border-window))] my-6" />

                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-1 flex items-center gap-2">
                    <Palette size={18} />
                    Color Engine
                </h2>
                <p className="text-sm text-[rgb(var(--text-secondary))] mb-4 max-w-prose">
                    Nickel is themed by color scheme. The scheme decides the
                    hues (complementary, triadic, and so on). Saturation and
                    lightness follow each color&apos;s role, so every background
                    shares one lightness and every foreground shares another.
                    Start from a preset or build your own below.
                </p>
                <div className="max-w-md mb-6">
                    <PalettePresetPicker columns={7} />
                </div>
                <ColorSchemeGenerator />

                <hr className="border-t border-[rgb(var(--border-window))] my-6" />

                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-3 flex items-center gap-2">
                    <ImageIcon size={18} />
                    Wallpaper
                </h2>
                <p className="text-sm text-[rgb(var(--text-secondary))] mb-3 max-w-prose">
                    Every wallpaper is drawn from your palette, in the
                    background role.
                </p>
                <div className="max-w-xl">
                    <WallpaperPicker columns={4} />
                </div>

                <hr className="border-t border-[rgb(var(--border-window))] my-6" />

                <div>
                    <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                        <Monitor size={18} />
                        Default Window Size
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-3">
                                Width: {defaultWindowWidth}px
                            </label>
                            <input
                                type="range"
                                min="400"
                                max="1600"
                                step="50"
                                value={defaultWindowWidth}
                                onChange={(e) =>
                                    handleWidthChange(Number(e.target.value))
                                }
                                className="w-full h-2 touch-none"
                                style={{
                                    accentColor: `rgb(var(--accent-nickel))`,
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-3">
                                Height: {defaultWindowHeight}px
                            </label>
                            <input
                                type="range"
                                min="300"
                                max="1200"
                                step="50"
                                value={defaultWindowHeight}
                                onChange={(e) =>
                                    handleHeightChange(Number(e.target.value))
                                }
                                className="w-full h-2 touch-none"
                                style={{
                                    accentColor: `rgb(var(--accent-nickel))`,
                                }}
                            />
                        </div>
                        <p className="text-xs text-[rgb(var(--text-secondary))]">
                            This setting will apply to new windows. Existing
                            windows keep their current size.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
