"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import {
    PALETTE_PRESETS,
    applyPreset,
    getActivePresetId,
    getPresetBaseColor,
    type PalettePreset,
} from "@/app/utils/nickelPalette";
import { THEME_CHANGE_EVENT, loadTheme } from "@/app/utils/themeUtils";
import {
    adjustForMode,
    generateColorScheme,
    hslToCss,
    type HSL,
} from "@/app/utils/colorUtils";
import { WALLPAPERS, useSystemStore } from "@/app/store/systemStore";
import { Wallpaper } from "./Wallpaper";

export function useIsDarkMode() {
    const { resolvedTheme } = useTheme();
    return resolvedTheme === "dark";
}

const SCHEME_LABELS: Record<string, string> = {
    monochromatic: "Monochromatic",
    analogous: "Analogous",
    complementary: "Complementary",
    "split-complementary": "Split-complementary",
    triadic: "Triadic",
    square: "Tetradic",
    rectangular: "Rectangular",
};

/** Name of the active scheme type, kept in sync with the engine. */
export function useActiveScheme() {
    const [state, setState] = useState<{ presetId: string | null; scheme: string }>({
        presetId: "nickel",
        scheme: "Analogous",
    });
    useEffect(() => {
        const read = () => {
            const theme = loadTheme();
            setState({
                presetId: getActivePresetId(),
                scheme: theme.schemeType
                    ? SCHEME_LABELS[theme.schemeType] ?? theme.schemeType
                    : "Analogous",
            });
        };
        read();
        window.addEventListener(THEME_CHANGE_EVENT, read);
        return () => window.removeEventListener(THEME_CHANGE_EVENT, read);
    }, []);
    return state;
}

// ---------------------------------------------------------------------------

export function AppearancePicker() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const options = [
        { id: "light", label: "Light", Icon: Sun },
        { id: "dark", label: "Dark", Icon: Moon },
        { id: "system", label: "Auto", Icon: Monitor },
    ];
    return (
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[rgb(var(--text-primary)/0.06)]">
            {options.map(({ id, label, Icon }) => {
                const active = mounted && theme === id;
                return (
                    <button
                        key={id}
                        onClick={() => setTheme(id)}
                        className={`flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-colors ${
                            active
                                ? "bg-[rgb(var(--bg-window))] shadow-sm text-[rgb(var(--text-primary))]"
                                : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                        }`}
                        aria-pressed={active}
                    >
                        <Icon size={13} />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

// ---------------------------------------------------------------------------

// The built-in Nickel default mirrors the CSS defaults in globals.css.
const NICKEL_DEFAULT: { base: HSL; scheme: "analogous" } = {
    base: { h: 152, s: 42, l: 50 },
    scheme: "analogous",
};

function PresetSwatch({ preset, isDark }: { preset: PalettePreset; isDark: boolean }) {
    const base = preset.scheme ? getPresetBaseColor(preset) : NICKEL_DEFAULT.base;
    const scheme = preset.scheme ?? NICKEL_DEFAULT.scheme;
    const hues = generateColorScheme(base, scheme).map((c) => c.h);
    // Same rule as the OS: hue from the scheme, S/L from the role
    const bg = preset.scheme
        ? adjustForMode(base, isDark, true)
        : { ...base, l: isDark ? 20 : 80 };
    const fg = preset.scheme
        ? adjustForMode(base, isDark, false)
        : { ...base, l: isDark ? 70 : 30 };

    return (
        <span
            className="relative flex items-center justify-center gap-[3px] w-full aspect-square rounded-[30%] overflow-hidden"
            style={{ background: hslToCss({ ...bg, h: hues[0] }) }}
        >
            {hues.map((h, i) => (
                <span
                    key={i}
                    className="w-[18%] aspect-square rounded-full"
                    style={{ background: hslToCss({ ...fg, h }) }}
                />
            ))}
        </span>
    );
}

export function PalettePresetPicker({ columns = 4 }: { columns?: number }) {
    const isDark = useIsDarkMode();
    const { presetId, scheme } = useActiveScheme();

    return (
        <div>
            <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
                {PALETTE_PRESETS.map((preset) => {
                    const active = presetId === preset.id;
                    return (
                        <button
                            key={preset.id}
                            onClick={() => applyPreset(preset, isDark)}
                            className="group flex flex-col items-center gap-1 focus:outline-none"
                            aria-pressed={active}
                            title={`${preset.name}${preset.scheme ? ` · ${SCHEME_LABELS[preset.scheme]}` : ""}`}
                        >
                            <span
                                className={`relative w-full rounded-[30%] p-[2px] transition-shadow ${
                                    active
                                        ? "shadow-[0_0_0_2px_rgb(var(--text-primary))]"
                                        : "group-hover:shadow-[0_0_0_2px_rgb(var(--text-primary)/0.3)]"
                                }`}
                            >
                                <PresetSwatch preset={preset} isDark={isDark} />
                                {active && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[rgb(var(--text-primary))] text-[rgb(var(--bg-window))] flex items-center justify-center">
                                        <Check size={10} strokeWidth={3} />
                                    </span>
                                )}
                            </span>
                            <span className="text-[11px] text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--text-primary))]">
                                {preset.name}
                            </span>
                        </button>
                    );
                })}
            </div>
            <p className="mt-2 text-[11px] text-[rgb(var(--text-secondary))]">
                {presetId
                    ? `${scheme} scheme`
                    : `Custom ${scheme.toLowerCase()} scheme from the Color Engine`}
            </p>
        </div>
    );
}

// ---------------------------------------------------------------------------

export function WallpaperPicker({ columns = 2 }: { columns?: number }) {
    const { wallpaper, setWallpaper } = useSystemStore();
    return (
        <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
            {WALLPAPERS.map((w) => {
                const active = wallpaper === w.id;
                return (
                    <button
                        key={w.id}
                        onClick={() => setWallpaper(w.id)}
                        className="group text-left focus:outline-none"
                        aria-pressed={active}
                        title={w.blurb}
                    >
                        <span
                            className={`relative block aspect-[16/10] rounded-xl overflow-hidden transition-shadow ${
                                active
                                    ? "shadow-[0_0_0_2px_rgb(var(--text-primary))]"
                                    : "shadow-[0_0_0_1px_rgb(var(--text-primary)/0.12)] group-hover:shadow-[0_0_0_2px_rgb(var(--text-primary)/0.3)]"
                            }`}
                        >
                            <Wallpaper variant={w.id} preview />
                        </span>
                        <span className="mt-1 block text-[11px] text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--text-primary))]">
                            {w.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
