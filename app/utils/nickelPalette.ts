/**
 * Nickel palette helpers: how the color engine's scheme reaches app tiles,
 * wallpapers, and theme presets.
 *
 * The engine (themeUtils.applyTheme) writes four palette hues to
 * --nk-h1..--nk-h4 and a saturation to --nk-s. Everything colorful in the OS
 * (tiles, wallpapers, widgets) is drawn from those variables in CSS, so a new
 * scheme recolors the whole system without a React re-render.
 */

import type { CSSProperties } from "react";
import { CATEGORIES, getAllContent } from "@/app/data/content";
import type { Category, Content } from "@/app/data/content";
import type { ColorSchemeType, HSL } from "./colorUtils";
import { generateColorSwatch } from "./colorUtils";
import {
    applyTheme,
    clearTheme,
    saveTheme,
    saveColorEngineUiState,
    clearColorEngineUiState,
    loadTheme,
} from "./themeUtils";
import type { ThemeConfig } from "./themeUtils";

export { THEME_CHANGE_EVENT } from "./themeUtils";

// ---------------------------------------------------------------------------
// Category colors
// ---------------------------------------------------------------------------

// "Gaming" and "Games" are the same thing to a visitor, so they share a color.
const CATEGORY_ALIASES: Partial<Record<Category, Category>> = {
    Gaming: "Games",
};

// Each category takes one of the scheme's hue slots, and nothing else: its
// saturation and lightness come from the role it's drawn in (see globals.css),
// so a complementary scheme gives exactly two tile colors, triadic three, etc.
export function getCategorySlot(category: Category): number {
    const resolved = CATEGORY_ALIASES[category] ?? category;
    return (Math.max(0, CATEGORIES.indexOf(resolved)) % 4) + 1;
}

export function tileStyle(category: Category): CSSProperties {
    return {
        ["--tile-hue" as string]: `var(--nk-h${getCategorySlot(category)})`,
    };
}

export type ColorRole = "bg" | "fg";

// A palette color: hue from scheme slot 1-4, saturation/lightness from role.
export function paletteColor(slot: number, role: ColorRole, alpha?: number): string {
    const a = alpha === undefined ? "" : ` / ${alpha}`;
    return `hsl(var(--nk-h${slot}) var(--nk-s) var(--nk-${role}-l)${a})`;
}

// ---------------------------------------------------------------------------
// Atomic numbers — every app is an element on the Nickel periodic table
// ---------------------------------------------------------------------------

let atomicNumbers: Map<string, number> | null = null;

export function getAtomicNumber(content: Content): number {
    if (!atomicNumbers) {
        atomicNumbers = new Map(
            getAllContent().map((item, index) => [item.id, index + 1])
        );
    }
    return atomicNumbers.get(content.id) ?? 0;
}

// Two-letter element symbol from a title: "Smart Piano" → "Sp".
export function getElementSymbol(title: string): string {
    const words = title
        .replace(/[^A-Za-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
    if (words.length === 0) return "?";
    const first = words[0][0].toUpperCase();
    const second =
        words.length > 1 ? words[1][0] : words[0][1] ?? "";
    return first + second.toLowerCase();
}

// ---------------------------------------------------------------------------
// Presets — one-tap schemes built on the color engine's swatch grid
// ---------------------------------------------------------------------------

export interface PalettePreset {
    id: string;
    name: string;
    scheme: ColorSchemeType | null; // null = the built-in Nickel default
    saturation: number;
    hueOffset: number;
    row: number; // swatch hue row
    col: number; // swatch lightness column
}

export const PALETTE_PRESETS: PalettePreset[] = [
    { id: "nickel", name: "Nickel", scheme: null, saturation: 48, hueOffset: 0, row: 0, col: 0 },
    { id: "verdigris", name: "Verdigris", scheme: "analogous", saturation: 45, hueOffset: 40, row: 2, col: 2 },
    { id: "cobalt", name: "Cobalt", scheme: "complementary", saturation: 60, hueOffset: 40, row: 3, col: 2 },
    { id: "ember", name: "Ember", scheme: "split-complementary", saturation: 65, hueOffset: 20, row: 0, col: 2 },
    { id: "orchid", name: "Orchid", scheme: "triadic", saturation: 45, hueOffset: 50, row: 4, col: 2 },
    { id: "prism", name: "Prism", scheme: "square", saturation: 55, hueOffset: 40, row: 5, col: 2 },
    { id: "graphite", name: "Graphite", scheme: "monochromatic", saturation: 0, hueOffset: 0, row: 0, col: 2 },
];

export function getPresetBaseColor(preset: PalettePreset): HSL {
    return generateColorSwatch(preset.saturation, preset.hueOffset)[preset.row][
        preset.col
    ];
}

export function applyPreset(preset: PalettePreset, isDarkMode: boolean): void {
    if (!preset.scheme) {
        clearTheme();
        clearColorEngineUiState();
        return;
    }
    const current = loadTheme();
    const config: ThemeConfig = {
        ...current,
        baseColor: getPresetBaseColor(preset),
        schemeType: preset.scheme,
        saturation: preset.saturation,
        hueOffset: preset.hueOffset,
    };
    saveTheme(config);
    // Keep the Color Engine's grid in step so opening Settings shows (and
    // doesn't overwrite) the preset.
    saveColorEngineUiState({
        row: preset.row,
        col: preset.col,
        hueOffset: preset.hueOffset,
    });
    applyTheme(config, isDarkMode);
}

export function getActivePresetId(): string | null {
    const theme = loadTheme();
    if (!theme.baseColor || !theme.schemeType) return "nickel";
    const match = PALETTE_PRESETS.find((preset) => {
        if (!preset.scheme || preset.scheme !== theme.schemeType) return false;
        const base = getPresetBaseColor(preset);
        return (
            base.h === theme.baseColor!.h &&
            base.s === theme.baseColor!.s &&
            base.l === theme.baseColor!.l
        );
    });
    return match?.id ?? null;
}
