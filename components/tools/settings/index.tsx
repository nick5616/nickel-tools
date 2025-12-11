"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Palette, Monitor, Image as ImageIcon } from "lucide-react";
import { ColorSchemeGenerator } from "./ColorSchemeGenerator";

const WINDOW_SIZE_STORAGE_KEY = "nickel-default-window-size";

export default function Settings() {
    const { theme, setTheme } = useTheme();
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

    // Placeholder wallpapers - replace with actual artwork paths
    const wallpapers = [
        { id: "default", name: "Default", color: "bg-zinc-900" },
        { id: "blue", name: "Ocean Blue", color: "bg-blue-900" },
        { id: "purple", name: "Purple Haze", color: "bg-purple-900" },
        { id: "green", name: "Forest Green", color: "bg-green-900" },
    ];

    return (
        <div className="w-full bg-transparent">
            <div className="w-full p-4">
                <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                    Color Scheme Generator
                </h2>
                <ColorSchemeGenerator />

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
