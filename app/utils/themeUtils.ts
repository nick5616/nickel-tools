/**
 * Theme application and localStorage management for color schemes
 */

import type { HSL, ColorSchemeType } from "./colorUtils";
import {
    hslToRgb,
    rgbToCssVariable,
    adjustForMode,
    getHighContrastVariant,
    generateColorScheme,
    adjustLightness,
} from "./colorUtils";

export interface ThemeConfig {
    baseColor: HSL | null;
    schemeType: ColorSchemeType | null;
    contrastThreshold: "AA" | "AAA" | number;
    useBlackWhiteText: boolean;
    allowMixMatch: boolean;
    saturation: number;
    hueOffset: number;
}

const THEME_STORAGE_KEY = "nickel-color-theme";

const DEFAULT_THEME: ThemeConfig = {
    baseColor: null,
    schemeType: null,
    contrastThreshold: "AAA",
    useBlackWhiteText: false,
    allowMixMatch: false,
    saturation: 50,
    hueOffset: 0,
};

/**
 * Load theme from localStorage
 */
export function loadTheme(): ThemeConfig {
    if (typeof window === "undefined") {
        return DEFAULT_THEME;
    }

    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (!stored) {
            return DEFAULT_THEME;
        }

        const parsed = JSON.parse(stored);
        return { ...DEFAULT_THEME, ...parsed };
    } catch (error) {
        console.error("Failed to load theme from localStorage:", error);
        return DEFAULT_THEME;
    }
}

/**
 * Save theme to localStorage
 */
export function saveTheme(theme: ThemeConfig): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (error) {
        console.error("Failed to save theme to localStorage:", error);
    }
}

/**
 * Clear theme from localStorage (reset to default)
 */
export function clearTheme(): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        localStorage.removeItem(THEME_STORAGE_KEY);
        // Reset CSS variables to defaults
        resetCssVariables();
    } catch (error) {
        console.error("Failed to clear theme from localStorage:", error);
    }
}

/**
 * Check if custom theme is active
 */
export function isCustomThemeActive(): boolean {
    const theme = loadTheme();
    return theme.baseColor !== null;
}

/**
 * Apply color scheme to CSS variables
 */
export function applyTheme(theme: ThemeConfig, isDarkMode: boolean): void {
    if (!theme.baseColor || !theme.schemeType) {
        resetCssVariables();
        return;
    }

    const colors = generateColorScheme(theme.baseColor, theme.schemeType);
    const numColors = colors.length;

    // Map colors to CSS variables based on scheme type and number of colors
    const cssVars: Record<string, string> = {};

    if (numColors === 1) {
        // Monochromatic
        const base = colors[0];
        const bgDesktop = adjustForMode(base, isDarkMode, true);
        const bgWindow = adjustLightness(bgDesktop, isDarkMode ? -10 : 10);
        const thresholdValue =
            theme.contrastThreshold === "AA"
                ? 4.5
                : theme.contrastThreshold === "AAA"
                ? 7
                : typeof theme.contrastThreshold === "number"
                ? theme.contrastThreshold
                : 7;
        const textPrimary = theme.useBlackWhiteText
            ? isDarkMode
                ? { h: 0, s: 0, l: 100 }
                : { h: 0, s: 0, l: 0 }
            : getHighContrastVariant(bgDesktop, isDarkMode, thresholdValue);
        const textSecondary = adjustLightness(
            textPrimary,
            isDarkMode ? -20 : 20
        );

        cssVars["--bg-desktop"] = rgbToCssVariable(hslToRgb(bgDesktop));
        cssVars["--bg-window"] = rgbToCssVariable(hslToRgb(bgWindow));
        cssVars["--text-primary"] = rgbToCssVariable(hslToRgb(textPrimary));
        cssVars["--text-secondary"] = rgbToCssVariable(hslToRgb(textSecondary));
        cssVars["--accent-nickel"] = rgbToCssVariable(hslToRgb(base));
        cssVars["--border-window"] = rgbToCssVariable(
            hslToRgb(adjustLightness(base, isDarkMode ? 10 : -10))
        );
    } else if (numColors === 2) {
        // 2 colors
        const color1 = adjustForMode(colors[0], isDarkMode, true);
        const color2 = adjustForMode(colors[1], isDarkMode, true);
        const textPrimary = theme.useBlackWhiteText
            ? isDarkMode
                ? { h: 0, s: 0, l: 100 }
                : { h: 0, s: 0, l: 0 }
            : getHighContrastVariant(color1, isDarkMode);
        const textSecondary = adjustLightness(
            textPrimary,
            isDarkMode ? -20 : 20
        );

        cssVars["--bg-desktop"] = rgbToCssVariable(hslToRgb(color1));
        cssVars["--bg-window"] = rgbToCssVariable(hslToRgb(color2));
        cssVars["--text-primary"] = rgbToCssVariable(hslToRgb(textPrimary));
        cssVars["--text-secondary"] = rgbToCssVariable(hslToRgb(textSecondary));
        cssVars["--accent-nickel"] = rgbToCssVariable(hslToRgb(colors[1]));
        cssVars["--border-window"] = rgbToCssVariable(
            hslToRgb(adjustLightness(color1, isDarkMode ? 10 : -10))
        );
    } else if (numColors === 3) {
        // 3 colors
        const color1 = adjustForMode(colors[0], isDarkMode, true);
        const color2 = adjustForMode(colors[1], isDarkMode, true);
        const color3 = theme.useBlackWhiteText
            ? isDarkMode
                ? { h: 0, s: 0, l: 100 }
                : { h: 0, s: 0, l: 0 }
            : adjustForMode(colors[2], isDarkMode, false);
        const textSecondary = adjustLightness(color3, isDarkMode ? -20 : 20);

        cssVars["--bg-desktop"] = rgbToCssVariable(hslToRgb(color1));
        cssVars["--bg-window"] = rgbToCssVariable(hslToRgb(color2));
        cssVars["--text-primary"] = rgbToCssVariable(hslToRgb(color3));
        cssVars["--text-secondary"] = rgbToCssVariable(hslToRgb(textSecondary));
        cssVars["--accent-nickel"] = rgbToCssVariable(hslToRgb(colors[2]));
        cssVars["--border-window"] = rgbToCssVariable(
            hslToRgb(adjustLightness(color2, isDarkMode ? 10 : -10))
        );
    } else if (numColors === 4) {
        // 4 colors
        const color1 = adjustForMode(colors[0], isDarkMode, true);
        const color2 = adjustForMode(colors[1], isDarkMode, true);
        const color3 = theme.useBlackWhiteText
            ? isDarkMode
                ? { h: 0, s: 0, l: 100 }
                : { h: 0, s: 0, l: 0 }
            : adjustForMode(colors[2], isDarkMode, false);
        const color4 = colors[3];
        const textSecondary = adjustLightness(color3, isDarkMode ? -20 : 20);

        cssVars["--bg-desktop"] = rgbToCssVariable(hslToRgb(color1));
        cssVars["--bg-window"] = rgbToCssVariable(hslToRgb(color2));
        cssVars["--text-primary"] = rgbToCssVariable(hslToRgb(color3));
        cssVars["--text-secondary"] = rgbToCssVariable(hslToRgb(textSecondary));
        cssVars["--border-window"] = rgbToCssVariable(hslToRgb(color4));
        cssVars["--accent-nickel"] = rgbToCssVariable(hslToRgb(color4));
        cssVars["--accent-glow"] = `${rgbToCssVariable(
            hslToRgb(color4)
        )} / 0.2`;
    }

    // Apply additional UI element variables
    applyAdditionalVariables(
        cssVars,
        colors,
        isDarkMode,
        theme.useBlackWhiteText
    );

    // Inject CSS variables into document root
    injectCssVariables(cssVars);
}

/**
 * Apply additional CSS variables for UI elements
 */
function applyAdditionalVariables(
    cssVars: Record<string, string>,
    colors: HSL[],
    isDarkMode: boolean,
    useBlackWhiteText: boolean
): void {
    const baseBg = cssVars["--bg-desktop"] || "250 250 250";
    const baseText = cssVars["--text-primary"] || "24 24 27";
    const windowBg = cssVars["--bg-window"] || "255 255 255";

    // MenuBar
    cssVars["--bg-menubar"] = baseBg;
    cssVars["--bg-menubar-hover"] = isDarkMode
        ? lightenRgb(baseBg, 10)
        : darkenRgb(baseBg, 10);
    cssVars["--text-menubar"] = baseText;

    // Titlebar
    cssVars["--bg-titlebar"] = windowBg;
    cssVars["--bg-titlebar-hover"] = isDarkMode
        ? lightenRgb(windowBg, 10)
        : darkenRgb(windowBg, 10);
    cssVars["--text-titlebar"] = baseText;

    // Dropdown
    cssVars["--bg-dropdown"] = baseBg;
    cssVars["--bg-dropdown-hover"] = isDarkMode
        ? lightenRgb(baseBg, 5)
        : darkenRgb(baseBg, 5);
    cssVars["--text-dropdown"] = baseText;
    cssVars["--border-dropdown"] = cssVars["--border-window"] || "212 212 216";

    // Dock
    cssVars["--bg-dock"] = isDarkMode ? `${baseBg} / 0.8` : `${baseBg} / 0.9`;
    cssVars["--bg-dock-hover"] = isDarkMode
        ? lightenRgb(baseBg, 5)
        : darkenRgb(baseBg, 5);
    cssVars["--border-dock"] = cssVars["--border-window"] || "212 212 216";

    // Buttons
    cssVars["--bg-button"] = windowBg;
    cssVars["--bg-button-hover"] = isDarkMode
        ? lightenRgb(windowBg, 10)
        : darkenRgb(windowBg, 10);
}

/**
 * Helper to lighten RGB string
 * Ensures values stay within 0-255 bounds
 */
function lightenRgb(rgbString: string, amount: number): string {
    const parts = rgbString.split(" ");
    if (parts.length < 3) {
        // Handle opacity format like "255 255 255 / 0.8"
        const rgbParts = rgbString.split(" / ");
        if (rgbParts.length === 2) {
            const [r, g, b] = rgbParts[0].split(" ").map(Number);
            return `${Math.min(255, Math.max(0, r + amount))} ${Math.min(
                255,
                Math.max(0, g + amount)
            )} ${Math.min(255, Math.max(0, b + amount))} / ${rgbParts[1]}`;
        }
    }
    const [r, g, b] = parts.map(Number);
    // Clamp values to 0-255 range
    return `${Math.min(255, Math.max(0, r + amount))} ${Math.min(
        255,
        Math.max(0, g + amount)
    )} ${Math.min(255, Math.max(0, b + amount))}`;
}

/**
 * Helper to darken RGB string
 * Ensures values stay within 0-255 bounds
 */
function darkenRgb(rgbString: string, amount: number): string {
    const parts = rgbString.split(" ");
    if (parts.length < 3) {
        // Handle opacity format like "255 255 255 / 0.8"
        const rgbParts = rgbString.split(" / ");
        if (rgbParts.length === 2) {
            const [r, g, b] = rgbParts[0].split(" ").map(Number);
            return `${Math.min(255, Math.max(0, r - amount))} ${Math.min(
                255,
                Math.max(0, g - amount)
            )} ${Math.min(255, Math.max(0, b - amount))} / ${rgbParts[1]}`;
        }
    }
    const [r, g, b] = parts.map(Number);
    // Clamp values to 0-255 range
    return `${Math.min(255, Math.max(0, r - amount))} ${Math.min(
        255,
        Math.max(0, g - amount)
    )} ${Math.min(255, Math.max(0, b - amount))}`;
}

/**
 * Inject CSS variables into document root
 */
function injectCssVariables(vars: Record<string, string>): void {
    if (typeof document === "undefined") {
        return;
    }

    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });
}

/**
 * Reset CSS variables to defaults
 */
function resetCssVariables(): void {
    if (typeof document === "undefined") {
        return;
    }

    const root = document.documentElement;
    // Remove custom theme variables (they'll fall back to CSS defaults)
    const customVars = [
        "--bg-desktop",
        "--bg-window",
        "--border-window",
        "--text-primary",
        "--text-secondary",
        "--accent-nickel",
        "--accent-glow",
        "--bg-menubar",
        "--bg-menubar-hover",
        "--bg-titlebar",
        "--bg-titlebar-hover",
        "--bg-dropdown",
        "--bg-dropdown-hover",
        "--bg-dock",
        "--bg-dock-hover",
        "--bg-button",
        "--bg-button-hover",
        "--border-dropdown",
        "--border-dock",
        "--text-menubar",
        "--text-titlebar",
        "--text-dropdown",
    ];

    customVars.forEach((varName) => {
        root.style.removeProperty(varName);
    });
}
