"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { Palette, Monitor, Image as ImageIcon } from "lucide-react";
import { ColorSchemeGenerator } from "./ColorSchemeGenerator";

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const [defaultWindowWidth, setDefaultWindowWidth] = useState(800);
    const [defaultWindowHeight, setDefaultWindowHeight] = useState(600);

    // Placeholder wallpapers - replace with actual artwork paths
    const wallpapers = [
        { id: "default", name: "Default", color: "bg-zinc-900" },
        { id: "blue", name: "Ocean Blue", color: "bg-blue-900" },
        { id: "purple", name: "Purple Haze", color: "bg-purple-900" },
        { id: "green", name: "Forest Green", color: "bg-green-900" },
    ];

    return (
        <div className="h-full w-full overflow-auto bg-[rgb(var(--bg-window))] p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-6">
                    Settings
                </h1>

                <div className="space-y-6 text-[rgb(var(--text-primary))]">
                    <div className="bg-[rgb(var(--bg-button))] rounded-lg ">
                        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-2 flex items-center gap-2">
                            Color Scheme Generator
                        </h2>
                        <ColorSchemeGenerator />
                    </div>

                    <hr className="border-t border-[rgb(var(--border-window))] dark:border-[rgb(var(--border-window))] my-4" />

                    <div className="bg-[rgb(var(--bg-button))] ">
                        <h2 className="text-l font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                            <Monitor size={20} />
                            Default Window Size
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                    Width: {defaultWindowWidth}px
                                </label>
                                <input
                                    type="range"
                                    min="400"
                                    max="1600"
                                    step="50"
                                    value={defaultWindowWidth}
                                    onChange={(e) =>
                                        setDefaultWindowWidth(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                    Height: {defaultWindowHeight}px
                                </label>
                                <input
                                    type="range"
                                    min="300"
                                    max="1200"
                                    step="50"
                                    value={defaultWindowHeight}
                                    onChange={(e) =>
                                        setDefaultWindowHeight(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="w-full"
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
        </div>
    );
}
