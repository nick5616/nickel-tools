"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { Copy, Check } from "lucide-react";
import type { HSL, ColorSchemeType } from "@/app/utils/colorUtils";
import {
    generateColorSwatch,
    generateColorScheme,
    validateContrast,
    hslToCss,
    getHighContrastVariant,
    adjustForMode,
    hslToRgb,
    getContrastRatio,
    adjustLightness,
    adjustPairForContrast,
    rgbToCssVariable,
} from "@/app/utils/colorUtils";

type ContrastThreshold = "AA" | "AAA" | number;

interface ThemeJson {
    baseColor: HSL;
    schemeType: ColorSchemeType;
    contrastThreshold: "AA" | "AAA" | number;
    useBlackWhiteText: boolean;
    allowMixMatch: boolean;
    saturation: number;
    hueOffset: number;
    cssVariables: Record<string, string>;
    colors: {
        hsl: HSL;
        rgb: { r: number; g: number; b: number };
        hex: string;
    }[];
}

export default function AdvancedColorSchemeGenerator() {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const isDarkMode =
        theme === "dark" || (theme === "system" && systemTheme === "dark");

    // Part 1: Base Color Selection
    const [selectedColor, setSelectedColor] = useState<HSL | null>(null);
    const [saturation, setSaturation] = useState(50);
    const [hueOffset, setHueOffset] = useState(0);
    const [visibleRowStart, setVisibleRowStart] = useState(0);
    const [selectedGridPosition, setSelectedGridPosition] = useState<{
        row: number;
        col: number;
    } | null>(null);

    // Part 2: Configuration
    const [contrastThreshold, setContrastThreshold] =
        useState<ContrastThreshold>("AAA");
    const [customThreshold, setCustomThreshold] = useState(7);
    const [useBlackWhiteText, setUseBlackWhiteText] = useState(false);
    const [allowMixMatch, setAllowMixMatch] = useState(false);

    // Part 3: Color Scheme Selection
    const [selectedScheme, setSelectedScheme] =
        useState<ColorSchemeType | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [validationDetails, setValidationDetails] = useState<{
        allPairs: Array<{ fg: HSL; bg: HSL; contrast: number; label: string }>;
        failedPairs: Array<{ fg: HSL; bg: HSL; contrast: number }>;
        threshold: number;
        thresholdLabel: string;
    } | null>(null);

    // JSON output and copy state
    const [themeJson, setThemeJson] = useState<string>("");
    const [copied, setCopied] = useState(false);

    // Track if we're in initial load
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        setMounted(true);
        setTimeout(() => setIsInitialLoad(false), 100);
    }, []);

    // Generate color swatch
    const colorSwatch = generateColorSwatch(saturation, hueOffset);
    const lightnesses = [10, 25, 40, 55, 70, 90];
    const baseHues = [0, 60, 120, 180, 240, 300];

    // Auto-select color at same grid position when swatch changes
    useEffect(() => {
        if (selectedGridPosition && colorSwatch.length > 0 && !isInitialLoad) {
            const { row, col } = selectedGridPosition;
            if (row < colorSwatch.length && col < colorSwatch[row].length) {
                const newColor = colorSwatch[row][col];
                if (
                    !selectedColor ||
                    selectedColor.h !== newColor.h ||
                    selectedColor.s !== newColor.s ||
                    selectedColor.l !== newColor.l
                ) {
                    setSelectedColor(newColor);
                }
            }
        }
    }, [hueOffset, saturation, selectedGridPosition]);

    // Handle color selection
    const handleColorSelect = (hsl: HSL, row: number, col: number) => {
        setSelectedColor(hsl);
        setSelectedGridPosition({ row, col });
        if (row < 3) {
            setVisibleRowStart(0);
        } else {
            setVisibleRowStart(3);
        }
        setValidationError(null);
    };

    // Get foreground color for a given background color
    const getForegroundColor = (bgColor: HSL): HSL => {
        if (useBlackWhiteText) {
            return isDarkMode ? { h: 0, s: 0, l: 100 } : { h: 0, s: 0, l: 0 };
        }
        const adjustedBg = adjustForMode(bgColor, isDarkMode, true);
        return getHighContrastVariant(adjustedBg, isDarkMode);
    };

    // Generate theme JSON
    const generateThemeJson = useMemo(() => {
        if (!selectedColor || !selectedScheme) {
            return null;
        }

        const colors = generateColorScheme(selectedColor, selectedScheme);
        const threshold =
            contrastThreshold === "AA" || contrastThreshold === "AAA"
                ? contrastThreshold
                : customThreshold;

        const thresholdValue =
            threshold === "AA" ? 4.5 : threshold === "AAA" ? 7 : threshold;

        // Generate CSS variables (same logic as applyTheme but return object)
        const cssVars: Record<string, string> = {};
        const numColors = colors.length;

        if (numColors === 1) {
            const base = colors[0];
            const bgDesktop = adjustForMode(base, isDarkMode, true);
            const bgWindow = adjustLightness(bgDesktop, isDarkMode ? -10 : 10);
            const textPrimary = useBlackWhiteText
                ? isDarkMode
                    ? { h: 0, s: 0, l: 100 }
                    : { h: 0, s: 0, l: 0 }
                : getHighContrastVariant(bgDesktop, isDarkMode, thresholdValue);
            const textSecondary = adjustLightness(
                textPrimary,
                isDarkMode ? -20 : 20
            );

            cssVars["--bg-primary"] = rgbToCssVariable(hslToRgb(bgDesktop));
            cssVars["--bg-secondary"] = rgbToCssVariable(hslToRgb(bgWindow));
            cssVars["--text-primary"] = rgbToCssVariable(hslToRgb(textPrimary));
            cssVars["--text-secondary"] = rgbToCssVariable(
                hslToRgb(textSecondary)
            );
            cssVars["--accent-primary"] = rgbToCssVariable(hslToRgb(base));
            cssVars["--border-primary"] = rgbToCssVariable(
                hslToRgb(adjustLightness(base, isDarkMode ? 10 : -10))
            );
        } else if (numColors === 2) {
            const color1 = adjustForMode(colors[0], isDarkMode, true);
            const color2 = adjustForMode(colors[1], isDarkMode, true);
            const textPrimary = useBlackWhiteText
                ? isDarkMode
                    ? { h: 0, s: 0, l: 100 }
                    : { h: 0, s: 0, l: 0 }
                : getHighContrastVariant(color1, isDarkMode);
            const textSecondary = adjustLightness(
                textPrimary,
                isDarkMode ? -20 : 20
            );

            cssVars["--bg-primary"] = rgbToCssVariable(hslToRgb(color1));
            cssVars["--bg-secondary"] = rgbToCssVariable(hslToRgb(color2));
            cssVars["--text-primary"] = rgbToCssVariable(hslToRgb(textPrimary));
            cssVars["--text-secondary"] = rgbToCssVariable(
                hslToRgb(textSecondary)
            );
            cssVars["--accent-primary"] = rgbToCssVariable(hslToRgb(colors[1]));
            cssVars["--border-primary"] = rgbToCssVariable(
                hslToRgb(adjustLightness(color1, isDarkMode ? 10 : -10))
            );
        } else if (numColors === 3) {
            const color1 = adjustForMode(colors[0], isDarkMode, true);
            const color2 = adjustForMode(colors[1], isDarkMode, true);
            const color3 = useBlackWhiteText
                ? isDarkMode
                    ? { h: 0, s: 0, l: 100 }
                    : { h: 0, s: 0, l: 0 }
                : adjustForMode(colors[2], isDarkMode, false);
            const textSecondary = adjustLightness(
                color3,
                isDarkMode ? -20 : 20
            );

            cssVars["--bg-primary"] = rgbToCssVariable(hslToRgb(color1));
            cssVars["--bg-secondary"] = rgbToCssVariable(hslToRgb(color2));
            cssVars["--text-primary"] = rgbToCssVariable(hslToRgb(color3));
            cssVars["--text-secondary"] = rgbToCssVariable(
                hslToRgb(textSecondary)
            );
            cssVars["--accent-primary"] = rgbToCssVariable(hslToRgb(colors[2]));
            cssVars["--border-primary"] = rgbToCssVariable(
                hslToRgb(adjustLightness(color2, isDarkMode ? 10 : -10))
            );
        } else if (numColors === 4) {
            const color1 = adjustForMode(colors[0], isDarkMode, true);
            const color2 = adjustForMode(colors[1], isDarkMode, true);
            const color3 = useBlackWhiteText
                ? isDarkMode
                    ? { h: 0, s: 0, l: 100 }
                    : { h: 0, s: 0, l: 0 }
                : adjustForMode(colors[2], isDarkMode, false);
            const color4 = colors[3];
            const textSecondary = adjustLightness(
                color3,
                isDarkMode ? -20 : 20
            );

            cssVars["--bg-primary"] = rgbToCssVariable(hslToRgb(color1));
            cssVars["--bg-secondary"] = rgbToCssVariable(hslToRgb(color2));
            cssVars["--text-primary"] = rgbToCssVariable(hslToRgb(color3));
            cssVars["--text-secondary"] = rgbToCssVariable(
                hslToRgb(textSecondary)
            );
            cssVars["--border-primary"] = rgbToCssVariable(hslToRgb(color4));
            cssVars["--accent-primary"] = rgbToCssVariable(hslToRgb(color4));
            cssVars["--accent-glow"] = `${rgbToCssVariable(
                hslToRgb(color4)
            )} / 0.2`;
        }

        // Convert colors to RGB and hex for JSON
        const colorData = colors.map((color) => {
            const rgb = hslToRgb(color);
            const hex = `#${rgb.r.toString(16).padStart(2, "0")}${rgb.g
                .toString(16)
                .padStart(2, "0")}${rgb.b.toString(16).padStart(2, "0")}`;
            return {
                hsl: color,
                rgb,
                hex: hex.toUpperCase(),
            };
        });

        const themeJson: ThemeJson = {
            baseColor: selectedColor,
            schemeType: selectedScheme,
            contrastThreshold: threshold,
            useBlackWhiteText,
            allowMixMatch,
            saturation,
            hueOffset,
            cssVariables: cssVars,
            colors: colorData,
        };

        return themeJson;
    }, [
        selectedColor,
        selectedScheme,
        contrastThreshold,
        customThreshold,
        useBlackWhiteText,
        allowMixMatch,
        saturation,
        hueOffset,
        isDarkMode,
    ]);

    // Update JSON string when theme changes
    useEffect(() => {
        if (generateThemeJson) {
            setThemeJson(JSON.stringify(generateThemeJson, null, 2));
        } else {
            setThemeJson("");
        }
    }, [generateThemeJson]);

    // Validation logic (simplified version from ColorSchemeGenerator)
    const validateActualPairs = (
        colors: HSL[],
        threshold: number
    ): {
        isValid: boolean;
        allPairs: Array<{ fg: HSL; bg: HSL; contrast: number; label: string }>;
        failedPairs: Array<{ fg: HSL; bg: HSL; contrast: number }>;
    } => {
        const allPairs: Array<{
            fg: HSL;
            bg: HSL;
            contrast: number;
            label: string;
        }> = [];
        const failedPairs: Array<{ fg: HSL; bg: HSL; contrast: number }> = [];
        const numColors = colors.length;

        if (numColors === 1) {
            const base = colors[0];
            const bgDesktop = adjustForMode(base, isDarkMode, true);
            const safeBgDesktop = {
                ...bgDesktop,
                l: Math.max(2, Math.min(98, bgDesktop.l)),
            };
            const textPrimary = useBlackWhiteText
                ? isDarkMode
                    ? { h: 0, s: 0, l: 100 }
                    : { h: 0, s: 0, l: 0 }
                : getHighContrastVariant(safeBgDesktop, isDarkMode, threshold);
            const textSecondary = adjustLightness(
                textPrimary,
                isDarkMode ? -20 : 20
            );

            let testFg1 = textPrimary;
            let testBg1 = safeBgDesktop;
            let contrast1 = getContrastRatio(
                hslToRgb(testFg1),
                hslToRgb(testBg1)
            );
            if (contrast1 < threshold) {
                const adjusted = adjustPairForContrast(
                    testFg1,
                    testBg1,
                    isDarkMode,
                    threshold
                );
                testFg1 = adjusted.fg;
                testBg1 = adjusted.bg;
                contrast1 = getContrastRatio(
                    hslToRgb(testFg1),
                    hslToRgb(testBg1)
                );
            }
            allPairs.push({
                fg: testFg1,
                bg: testBg1,
                contrast: contrast1,
                label: "Text Primary on Primary Background",
            });
            if (contrast1 < threshold) {
                failedPairs.push({
                    fg: testFg1,
                    bg: testBg1,
                    contrast: contrast1,
                });
            }

            let testFg2 = textSecondary;
            let testBg2 = safeBgDesktop;
            let contrast2 = getContrastRatio(
                hslToRgb(testFg2),
                hslToRgb(testBg2)
            );
            if (contrast2 < threshold) {
                const adjusted = adjustPairForContrast(
                    testFg2,
                    testBg2,
                    isDarkMode,
                    threshold
                );
                testFg2 = adjusted.fg;
                testBg2 = adjusted.bg;
                contrast2 = getContrastRatio(
                    hslToRgb(testFg2),
                    hslToRgb(testBg2)
                );
            }
            allPairs.push({
                fg: testFg2,
                bg: testBg2,
                contrast: contrast2,
                label: "Text Secondary on Primary Background",
            });
            if (contrast2 < threshold) {
                failedPairs.push({
                    fg: testFg2,
                    bg: testBg2,
                    contrast: contrast2,
                });
            }
        } else if (numColors >= 2) {
            // Simplified validation for multi-color schemes
            const color1 = adjustForMode(colors[0], isDarkMode, true);
            const color2 = adjustForMode(colors[1], isDarkMode, true);
            const safeColor1 = {
                ...color1,
                l: Math.max(2, Math.min(98, color1.l)),
            };
            const safeColor2 = {
                ...color2,
                l: Math.max(2, Math.min(98, color2.l)),
            };

            const textPrimary = useBlackWhiteText
                ? isDarkMode
                    ? { h: 0, s: 0, l: 100 }
                    : { h: 0, s: 0, l: 0 }
                : getHighContrastVariant(safeColor1, isDarkMode, threshold);

            // Test primary pairs
            const pairs = [
                {
                    fg: textPrimary,
                    bg: safeColor1,
                    label: "Text Primary on Primary Background",
                },
                {
                    fg: textPrimary,
                    bg: safeColor2,
                    label: "Text Primary on Secondary Background",
                },
            ];

            pairs.forEach(({ fg, bg, label }) => {
                let testFg = fg;
                let testBg = bg;
                let contrast = getContrastRatio(
                    hslToRgb(testFg),
                    hslToRgb(testBg)
                );
                if (contrast < threshold) {
                    const adjusted = adjustPairForContrast(
                        testFg,
                        testBg,
                        isDarkMode,
                        threshold
                    );
                    testFg = adjusted.fg;
                    testBg = adjusted.bg;
                    contrast = getContrastRatio(
                        hslToRgb(testFg),
                        hslToRgb(testBg)
                    );
                }
                allPairs.push({ fg: testFg, bg: testBg, contrast, label });
                if (contrast < threshold) {
                    failedPairs.push({ fg: testFg, bg: testBg, contrast });
                }
            });
        }

        return {
            isValid: failedPairs.length === 0,
            allPairs,
            failedPairs,
        };
    };

    // Recalculate color scheme and validation
    const recalculateColorScheme = React.useCallback(() => {
        if (!selectedColor || !selectedScheme) {
            setValidationError(null);
            setValidationDetails(null);
            return;
        }

        const colors = generateColorScheme(selectedColor, selectedScheme);
        const threshold =
            contrastThreshold === "AA" || contrastThreshold === "AAA"
                ? contrastThreshold
                : customThreshold;

        const thresholdValue =
            threshold === "AA" ? 4.5 : threshold === "AAA" ? 7 : threshold;

        const validation = allowMixMatch
            ? validateContrast(colors, threshold, false, true)
            : validateActualPairs(colors, thresholdValue);

        if (!validation.isValid) {
            const thresholdLabel =
                threshold === "AA"
                    ? "AA (4.5:1)"
                    : threshold === "AAA"
                    ? "AAA (7:1)"
                    : `${threshold}:1`;

            if ("allPairs" in validation) {
                setValidationDetails({
                    allPairs: validation.allPairs,
                    failedPairs: validation.failedPairs,
                    threshold: thresholdValue,
                    thresholdLabel,
                });
            }

            setValidationError(
                `Contrast validation failed. ${
                    "failedPairs" in validation
                        ? validation.failedPairs.length
                        : 0
                } color pair(s) do not meet the ${thresholdLabel} threshold.`
            );
            return;
        }

        const thresholdLabel =
            threshold === "AA"
                ? "AA (4.5:1)"
                : threshold === "AAA"
                ? "AAA (7:1)"
                : `${threshold}:1`;

        if ("allPairs" in validation) {
            setValidationDetails({
                allPairs: validation.allPairs,
                failedPairs: validation.failedPairs,
                threshold: thresholdValue,
                thresholdLabel,
            });
        }

        setValidationError(null);
    }, [
        selectedColor,
        selectedScheme,
        contrastThreshold,
        customThreshold,
        useBlackWhiteText,
        allowMixMatch,
        isDarkMode,
    ]);

    useEffect(() => {
        if (!isInitialLoad) {
            recalculateColorScheme();
        }
    }, [recalculateColorScheme, isInitialLoad]);

    // Handle scheme selection
    const handleSchemeSelect = (schemeType: ColorSchemeType) => {
        if (!selectedColor) {
            setValidationError("Please select a base color first");
            return;
        }
        setSelectedScheme(schemeType);
    };

    // Copy to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(themeJson);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    if (!mounted) {
        return <div>Loading...</div>;
    }

    const schemeTypes: Array<{
        type: ColorSchemeType;
        label: string;
        description: string;
    }> = [
        {
            type: "monochromatic",
            label: "Monochromatic",
            description: "Single color, varying lightness",
        },
        {
            type: "analogous",
            label: "Analogous",
            description: "Adjacent colors (±30°)",
        },
        {
            type: "complementary",
            label: "Complementary",
            description: "Opposite colors (180°)",
        },
        {
            type: "split-complementary",
            label: "Split-Complementary",
            description: "Base + two adjacent to complement",
        },
        {
            type: "triadic",
            label: "Triadic",
            description: "Three evenly spaced colors (120°)",
        },
        {
            type: "square",
            label: "Square",
            description: "Four evenly spaced colors (90°)",
        },
        {
            type: "rectangular",
            label: "Rectangular",
            description: "Four colors (60° and 180°)",
        },
    ];

    return (
        <div className="w-full bg-transparent">
            {/* Part 1: Base Color Selection */}
            <div className="bg-[rgb(var(--bg-button))] rounded-lg p-4">
                <h2 className="text-l font-semibold text-[rgb(var(--text-primary))] mb-4">
                    Select Base Color
                </h2>

                <div className="grid grid-cols-6 gap-2">
                    {colorSwatch
                        .slice(visibleRowStart, visibleRowStart + 3)
                        .map((row, rowIdx) =>
                            row.map((color, colIdx) => {
                                const actualRowIdx = visibleRowStart + rowIdx;
                                const isSelected =
                                    selectedGridPosition &&
                                    selectedGridPosition.row === actualRowIdx &&
                                    selectedGridPosition.col === colIdx;

                                return (
                                    <button
                                        key={`${actualRowIdx}-${colIdx}`}
                                        onClick={() =>
                                            handleColorSelect(
                                                color,
                                                actualRowIdx,
                                                colIdx
                                            )
                                        }
                                        className={`aspect-square rounded border-2 transition-all relative ${
                                            isSelected
                                                ? "border-[rgb(var(--text-primary))] scale-110 z-10"
                                                : "border-[rgb(var(--border-window))] hover:scale-105"
                                        }`}
                                        style={{
                                            backgroundColor: hslToCss(color),
                                        }}
                                        title={`H: ${color.h}°, S: ${color.s}%, L: ${color.l}%`}
                                    >
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 z-20 pointer-events-none">
                                                <div className="bg-[rgb(var(--bg-window))] border border-[rgb(var(--border-window))] rounded px-1.5 py-0.5 shadow-lg">
                                                    <div className="text-[9px] font-mono text-[rgb(var(--text-primary))] leading-tight whitespace-nowrap">
                                                        <div className="text-[8px]">
                                                            {color.h}° {color.s}
                                                            % {color.l}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                </div>

                <div className="mb-4 flex items-center gap-4">
                    <div className="flex items-center gap-2 mt-4">
                        <button
                            onClick={() =>
                                setHueOffset((prev) => (prev - 10 + 360) % 360)
                            }
                            className="px-3 py-1 bg-[rgb(var(--bg-button))] hover:bg-[rgb(var(--bg-button-hover))] border border-[rgb(var(--border-window))] rounded text-[rgb(var(--text-primary))] text-sm font-medium transition-colors"
                        >
                            ← -10°
                        </button>
                        <span className="text-sm text-[rgb(var(--text-primary))] min-w-[80px] text-center">
                            Hue: {hueOffset}°
                        </span>
                        <button
                            onClick={() =>
                                setHueOffset((prev) => (prev + 10) % 360)
                            }
                            className="px-3 py-1 bg-[rgb(var(--bg-button))] hover:bg-[rgb(var(--bg-button-hover))] border border-[rgb(var(--border-window))] rounded text-[rgb(var(--text-primary))] text-sm font-medium transition-colors"
                        >
                            +10° →
                        </button>
                    </div>
                </div>

                <div className="mb-4 flex items-center gap-2">
                    <button
                        onClick={() => setVisibleRowStart(0)}
                        disabled={visibleRowStart === 0}
                        className="px-3 py-1 bg-[rgb(var(--bg-button))] hover:bg-[rgb(var(--bg-button-hover))] disabled:opacity-50 disabled:cursor-not-allowed border border-[rgb(var(--border-window))] rounded text-[rgb(var(--text-primary))] text-sm font-medium transition-colors"
                    >
                        Rows 1-3
                    </button>
                    <button
                        onClick={() => setVisibleRowStart(3)}
                        disabled={visibleRowStart === 3}
                        className="px-3 py-1 bg-[rgb(var(--bg-button))] hover:bg-[rgb(var(--bg-button-hover))] disabled:opacity-50 disabled:cursor-not-allowed border border-[rgb(var(--border-window))] rounded text-[rgb(var(--text-primary))] text-sm font-medium transition-colors"
                    >
                        Rows 4-6
                    </button>
                </div>
            </div>

            {/* Part 2: Configuration */}
            {selectedColor && (
                <div className="bg-[rgb(var(--bg-button))] rounded-lg p-4">
                    <h2 className="text-l font-semibold text-[rgb(var(--text-primary))] mb-4">
                        Configure Accessibility
                    </h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Contrast Ratio Threshold
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="threshold"
                                    value="AA"
                                    checked={contrastThreshold === "AA"}
                                    onChange={() => setContrastThreshold("AA")}
                                    className="w-4 h-4"
                                />
                                <span className="text-[rgb(var(--text-primary))]">
                                    AA (4.5:1 for normal text, 3:1 for large
                                    text)
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="threshold"
                                    value="AAA"
                                    checked={contrastThreshold === "AAA"}
                                    onChange={() => setContrastThreshold("AAA")}
                                    className="w-4 h-4"
                                />
                                <span className="text-[rgb(var(--text-primary))]">
                                    AAA (7:1 for normal text, 4.5:1 for large
                                    text) - Recommended
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="threshold"
                                    value="custom"
                                    checked={
                                        typeof contrastThreshold === "number"
                                    }
                                    onChange={() =>
                                        setContrastThreshold(customThreshold)
                                    }
                                    className="w-4 h-4"
                                />
                                <span className="text-[rgb(var(--text-primary))]">
                                    Custom
                                </span>
                            </label>
                            {typeof contrastThreshold === "number" && (
                                <div className="ml-7">
                                    <input
                                        type="range"
                                        min="3"
                                        max="10"
                                        step="0.1"
                                        value={customThreshold}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setCustomThreshold(val);
                                            setContrastThreshold(val);
                                        }}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-[rgb(var(--text-secondary))]">
                                        {customThreshold}:1
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useBlackWhiteText}
                                onChange={(e) =>
                                    setUseBlackWhiteText(e.target.checked)
                                }
                                className="w-4 h-4"
                            />
                            <span className="text-[rgb(var(--text-primary))]">
                                Use black/white text only (disables text color
                                theming)
                            </span>
                        </label>
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={allowMixMatch}
                                onChange={(e) =>
                                    setAllowMixMatch(e.target.checked)
                                }
                                className="w-4 h-4"
                            />
                            <span className="text-[rgb(var(--text-primary))]">
                                Allow mix-and-match color pairs (validates all
                                possible foreground/background combinations)
                            </span>
                        </label>
                    </div>
                </div>
            )}

            {/* Part 3: Color Scheme Selection */}
            {selectedColor && (
                <div className="bg-[rgb(var(--bg-button))] rounded-lg p-4">
                    <h2 className="text-l font-semibold text-[rgb(var(--text-primary))] mb-4">
                        Select Color Scheme
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {schemeTypes.map((scheme) => {
                            const colors = generateColorScheme(
                                selectedColor,
                                scheme.type
                            );
                            const isSelected = selectedScheme === scheme.type;

                            return (
                                <button
                                    key={scheme.type}
                                    onClick={() =>
                                        handleSchemeSelect(scheme.type)
                                    }
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                                        isSelected
                                            ? "border-[rgb(var(--text-primary))] bg-[rgb(var(--bg-button-hover))]"
                                            : "border-[rgb(var(--border-window))] hover:border-[rgb(var(--accent-nickel))]"
                                    }`}
                                >
                                    <div className="flex gap-2 mb-2">
                                        {colors.map((color, idx) => {
                                            const bgColor = adjustForMode(
                                                color,
                                                isDarkMode,
                                                true
                                            );
                                            const fgColor =
                                                getForegroundColor(color);
                                            const bgRgb = hslToRgb(bgColor);
                                            const fgRgb = hslToRgb(fgColor);
                                            const contrast = getContrastRatio(
                                                fgRgb,
                                                bgRgb
                                            );
                                            const thresholdValue =
                                                contrastThreshold === "AA"
                                                    ? 4.5
                                                    : contrastThreshold ===
                                                      "AAA"
                                                    ? 7
                                                    : customThreshold;
                                            const meetsThreshold =
                                                contrast >= thresholdValue;

                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex-1 aspect-square rounded relative overflow-hidden"
                                                    style={{
                                                        backgroundColor:
                                                            hslToCss(bgColor),
                                                    }}
                                                    title={`Background: HSL(${
                                                        bgColor.h
                                                    }°, ${bgColor.s}%, ${
                                                        bgColor.l
                                                    }%), Foreground: HSL(${
                                                        fgColor.h
                                                    }°, ${fgColor.s}%, ${
                                                        fgColor.l
                                                    }%), Contrast: ${contrast.toFixed(
                                                        2
                                                    )}:1${
                                                        !meetsThreshold
                                                            ? " (FAILS)"
                                                            : ""
                                                    }`}
                                                >
                                                    <div
                                                        className="absolute top-0 left-0 w-full h-full"
                                                        style={{
                                                            backgroundColor:
                                                                hslToCss(
                                                                    fgColor
                                                                ),
                                                            clipPath:
                                                                "polygon(0 0, 100% 0, 0 100%)",
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm mb-1">
                                        {scheme.label}
                                    </h3>
                                    <p className="text-xs text-[rgb(var(--text-secondary))]">
                                        {scheme.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* JSON Output */}
            {selectedColor && selectedScheme && (
                <div className="bg-[rgb(var(--bg-button))] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-l font-semibold text-[rgb(var(--text-primary))]">
                            Theme JSON
                        </h2>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg-button))] hover:bg-[rgb(var(--bg-button-hover))] border border-[rgb(var(--border-window))] rounded text-[rgb(var(--text-primary))] text-sm font-medium transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check size={16} />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy size={16} />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                    <textarea
                        readOnly
                        value={themeJson}
                        className="w-full h-64 p-4 bg-[rgb(var(--bg-window))] border border-[rgb(var(--border-window))] rounded font-mono text-xs text-[rgb(var(--text-primary))] resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-nickel))]"
                        style={{ fontFamily: "monospace" }}
                    />
                    {validationError && (
                        <div className="mt-4 p-3 bg-[rgb(var(--bg-window))] border border-[rgb(var(--border-window))] rounded text-sm text-[rgb(var(--text-primary))]">
                            <strong>Note:</strong> {validationError}
                        </div>
                    )}
                </div>
            )}

            {/* Validation Report (simplified) */}
            {validationDetails && (
                <div className="bg-[rgb(var(--bg-button))] rounded-lg p-4">
                    <h2 className="text-l font-semibold text-[rgb(var(--text-primary))] mb-4">
                        Validation Report
                    </h2>
                    {validationError ? (
                        <div className="text-sm text-[rgb(var(--text-primary))]">
                            {validationError}
                        </div>
                    ) : (
                        <div className="text-sm text-[rgb(var(--text-primary))]">
                            All color pairs meet the{" "}
                            {validationDetails.thresholdLabel} threshold.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
