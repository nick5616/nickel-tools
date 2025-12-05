"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
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
} from "@/app/utils/colorUtils";
import {
    loadTheme,
    saveTheme,
    applyTheme,
    clearTheme,
} from "@/app/utils/themeUtils";

type ContrastThreshold = "AA" | "AAA" | number;

export function ColorSchemeGenerator() {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const isDarkMode =
        theme === "dark" || (theme === "system" && systemTheme === "dark");

    // Part 1: Base Color Selection
    const [selectedColor, setSelectedColor] = useState<HSL | null>(null);
    const [saturation, setSaturation] = useState(50);
    const [hueOffset, setHueOffset] = useState(0);
    const [visibleRowStart, setVisibleRowStart] = useState(0); // Which row group is visible (0, 3)

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
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [validationDetails, setValidationDetails] = useState<{
        allPairs: Array<{ fg: HSL; bg: HSL; contrast: number; label: string }>;
        failedPairs: Array<{ fg: HSL; bg: HSL; contrast: number }>;
        threshold: number;
        thresholdLabel: string;
    } | null>(null);

    // Track if we're in initial load to prevent unnecessary recalculations
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Load saved theme on mount
    useEffect(() => {
        setMounted(true);
        const savedTheme = loadTheme();
        if (savedTheme.baseColor) {
            setSelectedColor(savedTheme.baseColor);
            setSaturation(savedTheme.saturation);
            setHueOffset(savedTheme.hueOffset || 0);
            setContrastThreshold(savedTheme.contrastThreshold);
            setUseBlackWhiteText(savedTheme.useBlackWhiteText);
            setAllowMixMatch(savedTheme.allowMixMatch);
            if (savedTheme.schemeType) {
                setSelectedScheme(savedTheme.schemeType);
                // Apply theme immediately on initial load
                applyTheme(savedTheme, isDarkMode);
            }
        }
        // Mark initial load as complete after a brief delay to allow state to settle
        setTimeout(() => setIsInitialLoad(false), 100);
    }, []);

    // Re-apply theme when dark/light mode changes
    useEffect(() => {
        if (selectedColor && selectedScheme) {
            const savedTheme = loadTheme();
            if (savedTheme.baseColor && savedTheme.schemeType) {
                applyTheme(savedTheme, isDarkMode);
            }
        }
    }, [isDarkMode, selectedColor, selectedScheme]);

    // Generate color swatch
    const colorSwatch = generateColorSwatch(saturation, hueOffset);

    // Handle color selection
    const handleColorSelect = (hsl: HSL) => {
        setSelectedColor(hsl);
        setValidationError(null);
        setSuccessMessage(null);
    };

    // Get foreground color for a given background color
    const getForegroundColor = (bgColor: HSL): HSL => {
        if (useBlackWhiteText) {
            return isDarkMode
                ? { h: 0, s: 0, l: 100 } // White
                : { h: 0, s: 0, l: 0 }; // Black
        }
        const adjustedBg = adjustForMode(bgColor, isDarkMode, true);
        return getHighContrastVariant(adjustedBg, isDarkMode);
    };

    // Validate actual UI color pairs that will be used
    // Note: In multi-color schemes, colors have different hues (that's the point!).
    // "Mix-and-match off" means we only test the predefined pairs used in the UI,
    // not all possible combinations. The hues being different is correct.
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

        // Test the actual pairs that will be used based on theme mapping
        if (numColors === 1) {
            const base = colors[0];
            const bgDesktop = adjustForMode(base, isDarkMode, true);
            // Ensure background doesn't go to extremes
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

            // Test text-primary on bg-desktop (main text on desktop background)
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
                label: "Text Primary on Desktop Background",
            });
            if (contrast1 < threshold) {
                failedPairs.push({
                    fg: testFg1,
                    bg: testBg1,
                    contrast: contrast1,
                });
            }

            // Test text-secondary on bg-desktop
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
                label: "Text Secondary on Desktop Background",
            });
            if (contrast2 < threshold) {
                failedPairs.push({
                    fg: testFg2,
                    bg: testBg2,
                    contrast: contrast2,
                });
            }
        } else if (numColors === 2) {
            // For 2-color schemes: color1 = desktop bg, color2 = window bg
            const color1 = adjustForMode(colors[0], isDarkMode, true);
            const color2 = adjustForMode(colors[1], isDarkMode, true);
            // More aggressive bounds: allow 2-98% for better contrast adjustment
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
            const textSecondary = adjustLightness(
                textPrimary,
                isDarkMode ? -20 : 20
            );

            // Test text-primary on bg-desktop (color1)
            // Try adjusting the pair for better contrast
            let testFg1 = textPrimary;
            let testBg1 = safeColor1;
            let contrast1 = getContrastRatio(
                hslToRgb(testFg1),
                hslToRgb(testBg1)
            );
            if (contrast1 < threshold) {
                // Try adjusting both colors more aggressively
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
                label: "Text Primary on Desktop Background",
            });
            if (contrast1 < threshold) {
                failedPairs.push({
                    fg: testFg1,
                    bg: testBg1,
                    contrast: contrast1,
                });
            }

            // Test text-primary on bg-window (color2)
            let testFg2 = textPrimary;
            let testBg2 = safeColor2;
            let contrast2 = getContrastRatio(
                hslToRgb(testFg2),
                hslToRgb(testBg2)
            );
            if (contrast2 < threshold) {
                // Try adjusting both colors more aggressively
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
                label: "Text Primary on Window Background",
            });
            if (contrast2 < threshold) {
                failedPairs.push({
                    fg: testFg2,
                    bg: testBg2,
                    contrast: contrast2,
                });
            }

            // Test text-secondary on bg-desktop (color1)
            let testFg3 = textSecondary;
            let testBg3 = safeColor1;
            let contrast3 = getContrastRatio(
                hslToRgb(testFg3),
                hslToRgb(testBg3)
            );
            if (contrast3 < threshold) {
                const adjusted = adjustPairForContrast(
                    testFg3,
                    testBg3,
                    isDarkMode,
                    threshold
                );
                testFg3 = adjusted.fg;
                testBg3 = adjusted.bg;
                contrast3 = getContrastRatio(
                    hslToRgb(testFg3),
                    hslToRgb(testBg3)
                );
            }
            allPairs.push({
                fg: testFg3,
                bg: testBg3,
                contrast: contrast3,
                label: "Text Secondary on Desktop Background",
            });
            if (contrast3 < threshold) {
                failedPairs.push({
                    fg: testFg3,
                    bg: testBg3,
                    contrast: contrast3,
                });
            }

            // Test text-secondary on bg-window (color2)
            let testFg4 = textSecondary;
            let testBg4 = safeColor2;
            let contrast4 = getContrastRatio(
                hslToRgb(testFg4),
                hslToRgb(testBg4)
            );
            if (contrast4 < threshold) {
                const adjusted = adjustPairForContrast(
                    testFg4,
                    testBg4,
                    isDarkMode,
                    threshold
                );
                testFg4 = adjusted.fg;
                testBg4 = adjusted.bg;
                contrast4 = getContrastRatio(
                    hslToRgb(testFg4),
                    hslToRgb(testBg4)
                );
            }
            allPairs.push({
                fg: testFg4,
                bg: testBg4,
                contrast: contrast4,
                label: "Text Secondary on Window Background",
            });
            if (contrast4 < threshold) {
                failedPairs.push({
                    fg: testFg4,
                    bg: testBg4,
                    contrast: contrast4,
                });
            }
        } else if (numColors === 3) {
            // For 3-color schemes: color1 = desktop bg, color2 = window bg, color3 = text
            const color1 = adjustForMode(colors[0], isDarkMode, true);
            const color2 = adjustForMode(colors[1], isDarkMode, true);
            // More aggressive bounds: allow 2-98% for better contrast adjustment
            const safeColor1 = {
                ...color1,
                l: Math.max(2, Math.min(98, color1.l)),
            };
            const safeColor2 = {
                ...color2,
                l: Math.max(2, Math.min(98, color2.l)),
            };

            const color3 = useBlackWhiteText
                ? isDarkMode
                    ? { h: 0, s: 0, l: 100 }
                    : { h: 0, s: 0, l: 0 }
                : getHighContrastVariant(safeColor1, isDarkMode, threshold);
            const textSecondary = adjustLightness(
                color3,
                isDarkMode ? -20 : 20
            );

            // Test text-primary (color3) on bg-desktop (color1)
            // Try adjusting the pair for better contrast
            let testFg1 = color3;
            let testBg1 = safeColor1;
            let contrast1 = getContrastRatio(
                hslToRgb(testFg1),
                hslToRgb(testBg1)
            );
            if (contrast1 < threshold) {
                // Try adjusting both colors more aggressively
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
                label: "Text Primary on Desktop Background",
            });
            if (contrast1 < threshold) {
                failedPairs.push({
                    fg: testFg1,
                    bg: testBg1,
                    contrast: contrast1,
                });
            }

            // Test text-primary (color3) on bg-window (color2)
            let testFg2 = color3;
            let testBg2 = safeColor2;
            let contrast2 = getContrastRatio(
                hslToRgb(testFg2),
                hslToRgb(testBg2)
            );
            if (contrast2 < threshold) {
                // Try adjusting both colors more aggressively
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
                label: "Text Primary on Window Background",
            });
            if (contrast2 < threshold) {
                failedPairs.push({
                    fg: testFg2,
                    bg: testBg2,
                    contrast: contrast2,
                });
            }

            // Test text-secondary on bg-desktop (color1)
            let testFg3 = textSecondary;
            let testBg3 = safeColor1;
            let contrast3 = getContrastRatio(
                hslToRgb(testFg3),
                hslToRgb(testBg3)
            );
            if (contrast3 < threshold) {
                // Try adjusting both colors more aggressively
                const adjusted = adjustPairForContrast(
                    testFg3,
                    testBg3,
                    isDarkMode,
                    threshold
                );
                testFg3 = adjusted.fg;
                testBg3 = adjusted.bg;
                contrast3 = getContrastRatio(
                    hslToRgb(testFg3),
                    hslToRgb(testBg3)
                );
            }
            allPairs.push({
                fg: testFg3,
                bg: testBg3,
                contrast: contrast3,
                label: "Text Secondary on Desktop Background",
            });
            if (contrast3 < threshold) {
                failedPairs.push({
                    fg: testFg3,
                    bg: testBg3,
                    contrast: contrast3,
                });
            }

            // Test text-secondary on bg-window (color2)
            let testFg4 = textSecondary;
            let testBg4 = safeColor2;
            let contrast4 = getContrastRatio(
                hslToRgb(testFg4),
                hslToRgb(testBg4)
            );
            if (contrast4 < threshold) {
                // Try adjusting both colors more aggressively
                const adjusted = adjustPairForContrast(
                    testFg4,
                    testBg4,
                    isDarkMode,
                    threshold
                );
                testFg4 = adjusted.fg;
                testBg4 = adjusted.bg;
                contrast4 = getContrastRatio(
                    hslToRgb(testFg4),
                    hslToRgb(testBg4)
                );
            }
            allPairs.push({
                fg: testFg4,
                bg: testBg4,
                contrast: contrast4,
                label: "Text Secondary on Window Background",
            });
            if (contrast4 < threshold) {
                failedPairs.push({
                    fg: testFg4,
                    bg: testBg4,
                    contrast: contrast4,
                });
            }
        } else if (numColors === 4) {
            // For 4-color schemes: color1 = desktop bg, color2 = window bg, color3 = text, color4 = border/accent
            const color1 = adjustForMode(colors[0], isDarkMode, true);
            const color2 = adjustForMode(colors[1], isDarkMode, true);
            const color4 = colors[3];
            // More aggressive bounds: allow 2-98% for better contrast adjustment
            const safeColor1 = {
                ...color1,
                l: Math.max(2, Math.min(98, color1.l)),
            };
            const safeColor2 = {
                ...color2,
                l: Math.max(2, Math.min(98, color2.l)),
            };
            const safeColor4 = {
                ...color4,
                l: Math.max(2, Math.min(98, color4.l)),
            };

            const color3 = useBlackWhiteText
                ? isDarkMode
                    ? { h: 0, s: 0, l: 100 }
                    : { h: 0, s: 0, l: 0 }
                : getHighContrastVariant(safeColor1, isDarkMode, threshold);

            // Test text-primary (color3) on bg-desktop (color1)
            let testFg1 = color3;
            let testBg1 = safeColor1;
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
                label: "Text Primary on Desktop Background",
            });
            if (contrast1 < threshold) {
                failedPairs.push({
                    fg: testFg1,
                    bg: testBg1,
                    contrast: contrast1,
                });
            }

            // Test text-primary (color3) on bg-window (color2)
            let testFg2 = color3;
            let testBg2 = safeColor2;
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
                label: "Text Primary on Window Background",
            });
            if (contrast2 < threshold) {
                failedPairs.push({
                    fg: testFg2,
                    bg: testBg2,
                    contrast: contrast2,
                });
            }

            // Test text-primary (color3) on border/accent (color4)
            let testFg3 = color3;
            let testBg3 = safeColor4;
            let contrast3 = getContrastRatio(
                hslToRgb(testFg3),
                hslToRgb(testBg3)
            );
            if (contrast3 < threshold) {
                const adjusted = adjustPairForContrast(
                    testFg3,
                    testBg3,
                    isDarkMode,
                    threshold
                );
                testFg3 = adjusted.fg;
                testBg3 = adjusted.bg;
                contrast3 = getContrastRatio(
                    hslToRgb(testFg3),
                    hslToRgb(testBg3)
                );
            }
            allPairs.push({
                fg: testFg3,
                bg: testBg3,
                contrast: contrast3,
                label: "Text Primary on Border/Accent",
            });
            if (contrast3 < threshold) {
                failedPairs.push({
                    fg: testFg3,
                    bg: testBg3,
                    contrast: contrast3,
                });
            }

            // Test text-secondary on desktop background (color1)
            const textSecondary = adjustLightness(
                color3,
                isDarkMode ? -20 : 20
            );
            let testFgSecondary1 = textSecondary;
            let testBgSecondary1 = safeColor1;
            let contrastSecondary1 = getContrastRatio(
                hslToRgb(testFgSecondary1),
                hslToRgb(testBgSecondary1)
            );
            if (contrastSecondary1 < threshold) {
                const adjusted = adjustPairForContrast(
                    testFgSecondary1,
                    testBgSecondary1,
                    isDarkMode,
                    threshold
                );
                testFgSecondary1 = adjusted.fg;
                testBgSecondary1 = adjusted.bg;
                contrastSecondary1 = getContrastRatio(
                    hslToRgb(testFgSecondary1),
                    hslToRgb(testBgSecondary1)
                );
            }
            allPairs.push({
                fg: testFgSecondary1,
                bg: testBgSecondary1,
                contrast: contrastSecondary1,
                label: "Text Secondary on Desktop Background",
            });
            if (contrastSecondary1 < threshold) {
                failedPairs.push({
                    fg: testFgSecondary1,
                    bg: testBgSecondary1,
                    contrast: contrastSecondary1,
                });
            }

            // Test text-secondary on window background (color2)
            let testFgSecondary2 = textSecondary;
            let testBgSecondary2 = safeColor2;
            let contrastSecondary2 = getContrastRatio(
                hslToRgb(testFgSecondary2),
                hslToRgb(testBgSecondary2)
            );
            if (contrastSecondary2 < threshold) {
                const adjusted = adjustPairForContrast(
                    testFgSecondary2,
                    testBgSecondary2,
                    isDarkMode,
                    threshold
                );
                testFgSecondary2 = adjusted.fg;
                testBgSecondary2 = adjusted.bg;
                contrastSecondary2 = getContrastRatio(
                    hslToRgb(testFgSecondary2),
                    hslToRgb(testBgSecondary2)
                );
            }
            allPairs.push({
                fg: testFgSecondary2,
                bg: testBgSecondary2,
                contrast: contrastSecondary2,
                label: "Text Secondary on Window Background",
            });
            if (contrastSecondary2 < threshold) {
                failedPairs.push({
                    fg: testFgSecondary2,
                    bg: testBgSecondary2,
                    contrast: contrastSecondary2,
                });
            }

            // Test text-secondary on border/accent (color4)
            let testFgSecondary3 = textSecondary;
            let testBgSecondary3 = safeColor4;
            let contrastSecondary3 = getContrastRatio(
                hslToRgb(testFgSecondary3),
                hslToRgb(testBgSecondary3)
            );
            if (contrastSecondary3 < threshold) {
                const adjusted = adjustPairForContrast(
                    testFgSecondary3,
                    testBgSecondary3,
                    isDarkMode,
                    threshold
                );
                testFgSecondary3 = adjusted.fg;
                testBgSecondary3 = adjusted.bg;
                contrastSecondary3 = getContrastRatio(
                    hslToRgb(testFgSecondary3),
                    hslToRgb(testBgSecondary3)
                );
            }
            allPairs.push({
                fg: testFgSecondary3,
                bg: testBgSecondary3,
                contrast: contrastSecondary3,
                label: "Text Secondary on Border/Accent",
            });
            if (contrastSecondary3 < threshold) {
                failedPairs.push({
                    fg: testFgSecondary3,
                    bg: testBgSecondary3,
                    contrast: contrastSecondary3,
                });
            }

            // Test border/accent (color4) on desktop background (color1)
            let testFg4 = color4;
            let testBg4 = safeColor1;
            let contrast4 = getContrastRatio(
                hslToRgb(testFg4),
                hslToRgb(testBg4)
            );
            if (contrast4 < threshold) {
                const adjusted = adjustPairForContrast(
                    testFg4,
                    testBg4,
                    isDarkMode,
                    threshold
                );
                testFg4 = adjusted.fg;
                testBg4 = adjusted.bg;
                contrast4 = getContrastRatio(
                    hslToRgb(testFg4),
                    hslToRgb(testBg4)
                );
            }
            allPairs.push({
                fg: testFg4,
                bg: testBg4,
                contrast: contrast4,
                label: "Border/Accent on Desktop Background",
            });
            if (contrast4 < threshold) {
                failedPairs.push({
                    fg: testFg4,
                    bg: testBg4,
                    contrast: contrast4,
                });
            }

            // Test border/accent (color4) on window background (color2)
            let testFg5 = color4;
            let testBg5 = safeColor2;
            let contrast5 = getContrastRatio(
                hslToRgb(testFg5),
                hslToRgb(testBg5)
            );
            if (contrast5 < threshold) {
                const adjusted = adjustPairForContrast(
                    testFg5,
                    testBg5,
                    isDarkMode,
                    threshold
                );
                testFg5 = adjusted.fg;
                testBg5 = adjusted.bg;
                contrast5 = getContrastRatio(
                    hslToRgb(testFg5),
                    hslToRgb(testBg5)
                );
            }
            allPairs.push({
                fg: testFg5,
                bg: testBg5,
                contrast: contrast5,
                label: "Border/Accent on Window Background",
            });
            if (contrast5 < threshold) {
                failedPairs.push({
                    fg: testFg5,
                    bg: testBg5,
                    contrast: contrast5,
                });
            }
        }

        return {
            isValid: failedPairs.length === 0,
            allPairs,
            failedPairs,
        };
    };

    // Recalculate color scheme and validation whenever form state changes
    const recalculateColorScheme = React.useCallback(() => {
        if (!selectedColor || !selectedScheme) {
            // Clear validation if we don't have both color and scheme
            setValidationError(null);
            setValidationDetails(null);
            setSuccessMessage(null);
            return;
        }

        const colors = generateColorScheme(selectedColor, selectedScheme);
        const threshold =
            contrastThreshold === "AA" || contrastThreshold === "AAA"
                ? contrastThreshold
                : customThreshold;

        // Use actual pair validation instead of generic validation
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

            // Store validation details for display
            if ("allPairs" in validation) {
                setValidationDetails({
                    allPairs: validation.allPairs,
                    failedPairs: validation.failedPairs,
                    threshold: thresholdValue,
                    thresholdLabel,
                });
            } else {
                // For mix-and-match validation, we need to test all combinations
                const allPairs: Array<{
                    fg: HSL;
                    bg: HSL;
                    contrast: number;
                    label: string;
                }> = [];
                const failedPairs: Array<{
                    fg: HSL;
                    bg: HSL;
                    contrast: number;
                }> = [];

                // Test all possible foreground/background combinations
                for (let i = 0; i < colors.length; i++) {
                    for (let j = 0; j < colors.length; j++) {
                        if (i === j) continue; // Skip same color pairs

                        const fgRgb = hslToRgb(colors[i]);
                        const bgRgb = hslToRgb(colors[j]);
                        const contrast = getContrastRatio(fgRgb, bgRgb);

                        allPairs.push({
                            fg: colors[i],
                            bg: colors[j],
                            contrast,
                            label: `Color ${i + 1} on Color ${j + 1}`,
                        });

                        if (contrast < thresholdValue) {
                            failedPairs.push({
                                fg: colors[i],
                                bg: colors[j],
                                contrast,
                            });
                        }
                    }
                }

                setValidationDetails({
                    allPairs,
                    failedPairs,
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
            setSuccessMessage(null);
            return;
        }

        // Store validation details for success case too
        const thresholdLabel =
            threshold === "AA"
                ? "AA (4.5:1)"
                : threshold === "AAA"
                ? "AAA (7:1)"
                : `${threshold}:1`;

        // Get validation details for display
        let validationDetailsForDisplay: {
            allPairs: Array<{
                fg: HSL;
                bg: HSL;
                contrast: number;
                label: string;
            }>;
            failedPairs: Array<{ fg: HSL; bg: HSL; contrast: number }>;
            threshold: number;
            thresholdLabel: string;
        };

        if ("allPairs" in validation) {
            validationDetailsForDisplay = {
                allPairs: validation.allPairs,
                failedPairs: validation.failedPairs,
                threshold: thresholdValue,
                thresholdLabel,
            };
        } else {
            // For mix-and-match validation, build the pairs list
            const allPairs: Array<{
                fg: HSL;
                bg: HSL;
                contrast: number;
                label: string;
            }> = [];
            const failedPairs: Array<{
                fg: HSL;
                bg: HSL;
                contrast: number;
            }> = [];

            // Test all possible foreground/background combinations
            for (let i = 0; i < colors.length; i++) {
                for (let j = 0; j < colors.length; j++) {
                    if (i === j) continue; // Skip same color pairs

                    const fgRgb = hslToRgb(colors[i]);
                    const bgRgb = hslToRgb(colors[j]);
                    const contrast = getContrastRatio(fgRgb, bgRgb);

                    allPairs.push({
                        fg: colors[i],
                        bg: colors[j],
                        contrast,
                        label: `Color ${i + 1} on Color ${j + 1}`,
                    });

                    if (contrast < thresholdValue) {
                        failedPairs.push({
                            fg: colors[i],
                            bg: colors[j],
                            contrast,
                        });
                    }
                }
            }

            validationDetailsForDisplay = {
                allPairs,
                failedPairs,
                threshold: thresholdValue,
                thresholdLabel,
            };
        }

        // Save and apply theme
        const themeConfig = {
            baseColor: selectedColor,
            schemeType: selectedScheme,
            contrastThreshold: threshold,
            useBlackWhiteText,
            allowMixMatch,
            saturation,
            hueOffset,
        };

        saveTheme(themeConfig);
        applyTheme(themeConfig, isDarkMode);
        setValidationError(null);
        setValidationDetails(validationDetailsForDisplay);
        setSuccessMessage("Color scheme applied successfully!");
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

    // Recalculate whenever form state changes (but not during initial load)
    useEffect(() => {
        if (!isInitialLoad) {
            recalculateColorScheme();
        }
    }, [recalculateColorScheme, isInitialLoad]);

    // Handle scheme selection and application
    const handleSchemeSelect = (schemeType: ColorSchemeType) => {
        if (!selectedColor) {
            setValidationError("Please select a base color first");
            return;
        }

        setSelectedScheme(schemeType);
        // Recalculation will happen automatically via useEffect
    };

    // Handle reset
    const handleReset = () => {
        clearTheme();
        setSelectedColor(null);
        setSelectedScheme(null);
        setSaturation(50);
        setHueOffset(0);
        setVisibleRowStart(0);
        setContrastThreshold("AAA");
        setCustomThreshold(7);
        setUseBlackWhiteText(false);
        setAllowMixMatch(false);
        setValidationError(null);
        setSuccessMessage("Theme reset to default");
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
        <div className="space-y-8">
            {/* Part 1: Base Color Selection */}
            <div className="bg-[rgb(var(--bg-button))] rounded-lg">
                <h2 className="text-l font-semibold text-[rgb(var(--text-primary))] mb-4">
                    Select Base Color
                </h2>

                {/* Hue Shift Controls */}
                <div className="mb-4 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                setHueOffset((prev) => (prev - 10 + 360) % 360)
                            }
                            className="px-3 py-1 bg-[rgb(var(--bg-button))] hover:bg-[rgb(var(--bg-button-hover))] border border-[rgb(var(--border-window))] rounded text-[rgb(var(--text-primary))] text-sm font-medium transition-colors"
                            title="Shift hues -10°"
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
                            title="Shift hues +10°"
                        >
                            +10° →
                        </button>
                    </div>
                </div>

                {/* Row Navigation */}
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

                {/* Color Swatch Grid - Show only 3 rows at a time */}
                <div className="grid grid-cols-6 gap-2 mb-4">
                    {colorSwatch
                        .slice(visibleRowStart, visibleRowStart + 3)
                        .map((row, rowIdx) =>
                            row.map((color, colIdx) => {
                                const isSelected =
                                    selectedColor &&
                                    selectedColor.h === color.h &&
                                    selectedColor.s === color.s &&
                                    selectedColor.l === color.l;

                                return (
                                    <button
                                        key={`${
                                            visibleRowStart + rowIdx
                                        }-${colIdx}`}
                                        onClick={() => handleColorSelect(color)}
                                        className={`aspect-square rounded border-2 transition-all ${
                                            isSelected
                                                ? "border-[rgb(var(--text-primary))] scale-110 z-10"
                                                : "border-[rgb(var(--border-window))] hover:scale-105"
                                        }`}
                                        style={{
                                            backgroundColor: hslToCss(color),
                                        }}
                                        title={`H: ${color.h}°, S: ${color.s}%, L: ${color.l}%`}
                                    />
                                );
                            })
                        )}
                </div>

                {/* Selected Color Preview */}
                {selectedColor && (
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded border-2 border-[rgb(var(--border-window))]"
                            style={{ backgroundColor: hslToCss(selectedColor) }}
                        />
                        <div>
                            <p className="text-sm font-mono text-[rgb(var(--text-primary))]">
                                HSL: {selectedColor.h}°, {selectedColor.s}%,{" "}
                                {selectedColor.l}%
                            </p>
                            <p className="text-xs text-[rgb(var(--text-secondary))]">
                                {hslToCss(selectedColor)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Part 2: Configuration */}
            {selectedColor && (
                <div className="bg-[rgb(var(--bg-button))] rounded-lg ">
                    <h2 className="text-l font-semibold text-[rgb(var(--text-primary))] mb-4">
                        Configure Accessibility
                    </h2>

                    {/* Contrast Threshold */}
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

                    {/* Use Black/White Text Only */}
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

                    {/* Allow Mix-and-Match */}
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
                <div className="bg-[rgb(var(--bg-button))] ">
                    <h2 className="text-l font-semibold text-[rgb(var(--text-primary))] mb-4">
                        Select Color Scheme
                    </h2>

                    {/* Validation Report */}
                    {validationDetails && (
                        <div
                            className={`mb-4 p-4 border rounded border-[rgb(var(--border-window))] ${
                                validationError
                                    ? "bg-[rgb(var(--bg-window))] opacity-90"
                                    : "bg-[rgb(var(--bg-window))] opacity-90"
                            }`}
                        >
                            {validationError && (
                                <div className="text-[rgb(var(--text-primary))] text-sm font-semibold mb-3">
                                    {validationError}
                                </div>
                            )}
                            {successMessage && !validationError && (
                                <div className="text-[rgb(var(--text-primary))] text-sm font-semibold mb-3">
                                    {successMessage}
                                </div>
                            )}

                            {/* All Color Pairs */}
                            <div className="space-y-3">
                                {/* Passing Pairs - Show first when validation succeeds */}
                                {validationDetails.allPairs.filter(
                                    (p) =>
                                        !validationDetails.failedPairs.some(
                                            (fp) =>
                                                fp.fg.h === p.fg.h &&
                                                fp.fg.s === p.fg.s &&
                                                fp.fg.l === p.fg.l &&
                                                fp.bg.h === p.bg.h &&
                                                fp.bg.s === p.bg.s &&
                                                fp.bg.l === p.bg.l
                                        )
                                ).length > 0 && (
                                    <div>
                                        <div className="text-[rgb(var(--text-primary))] text-xs font-semibold mb-2">
                                            Passing Pairs (
                                            {
                                                validationDetails.allPairs.filter(
                                                    (p) =>
                                                        !validationDetails.failedPairs.some(
                                                            (fp) =>
                                                                fp.fg.h ===
                                                                    p.fg.h &&
                                                                fp.fg.s ===
                                                                    p.fg.s &&
                                                                fp.fg.l ===
                                                                    p.fg.l &&
                                                                fp.bg.h ===
                                                                    p.bg.h &&
                                                                fp.bg.s ===
                                                                    p.bg.s &&
                                                                fp.bg.l ===
                                                                    p.bg.l
                                                        )
                                                ).length
                                            }
                                            ):
                                        </div>
                                        <div className="space-y-2">
                                            {validationDetails.allPairs
                                                .filter(
                                                    (p) =>
                                                        !validationDetails.failedPairs.some(
                                                            (fp) =>
                                                                fp.fg.h ===
                                                                    p.fg.h &&
                                                                fp.fg.s ===
                                                                    p.fg.s &&
                                                                fp.fg.l ===
                                                                    p.fg.l &&
                                                                fp.bg.h ===
                                                                    p.bg.h &&
                                                                fp.bg.s ===
                                                                    p.bg.s &&
                                                                fp.bg.l ===
                                                                    p.bg.l
                                                        )
                                                )
                                                .map((pair, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-3 p-2 bg-[rgb(var(--bg-desktop))] rounded border border-[rgb(var(--border-window))]"
                                                    >
                                                        <div className="flex gap-2">
                                                            <div
                                                                className="w-8 h-8 rounded relative overflow-hidden"
                                                                style={{
                                                                    backgroundColor:
                                                                        hslToCss(
                                                                            pair.bg
                                                                        ),
                                                                }}
                                                            >
                                                                <div
                                                                    className="absolute top-0 left-0 w-full h-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            hslToCss(
                                                                                pair.fg
                                                                            ),
                                                                        clipPath:
                                                                            "polygon(0 0, 100% 0, 0 100%)",
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 text-xs text-[rgb(var(--text-primary))]">
                                                            <div className="font-medium">
                                                                {pair.label}
                                                            </div>
                                                            <div className="text-[rgb(var(--text-secondary))] space-y-1">
                                                                <div>
                                                                    Contrast:{" "}
                                                                    <span className="font-mono">
                                                                        {pair.contrast.toFixed(
                                                                            2
                                                                        )}
                                                                        :1
                                                                    </span>
                                                                </div>
                                                                <div className="font-mono text-[rgb(var(--text-secondary))]">
                                                                    FG: HSL(
                                                                    {pair.fg.h}
                                                                    °,{" "}
                                                                    {pair.fg.s}
                                                                    %,{" "}
                                                                    {pair.fg.l}
                                                                    %)
                                                                </div>
                                                                <div className="font-mono text-[rgb(var(--text-secondary))]">
                                                                    BG: HSL(
                                                                    {pair.bg.h}
                                                                    °,{" "}
                                                                    {pair.bg.s}
                                                                    %,{" "}
                                                                    {pair.bg.l}
                                                                    %)
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Failing Pairs */}
                                {validationDetails.failedPairs.length > 0 && (
                                    <div>
                                        <div className="text-[rgb(var(--text-primary))] text-xs font-semibold mb-2">
                                            Failing Pairs (
                                            {
                                                validationDetails.failedPairs
                                                    .length
                                            }
                                            ):
                                        </div>
                                        <div className="space-y-2">
                                            {validationDetails.failedPairs.map(
                                                (pair, idx) => {
                                                    const pairInfo =
                                                        validationDetails.allPairs.find(
                                                            (p) =>
                                                                p.fg.h ===
                                                                    pair.fg.h &&
                                                                p.fg.s ===
                                                                    pair.fg.s &&
                                                                p.fg.l ===
                                                                    pair.fg.l &&
                                                                p.bg.h ===
                                                                    pair.bg.h &&
                                                                p.bg.s ===
                                                                    pair.bg.s &&
                                                                p.bg.l ===
                                                                    pair.bg.l
                                                        );
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-3 p-2 bg-[rgb(var(--bg-desktop))] rounded border border-[rgb(var(--border-window))]"
                                                        >
                                                            <div className="flex gap-2">
                                                                <div
                                                                    className="w-8 h-8 rounded relative overflow-hidden"
                                                                    style={{
                                                                        backgroundColor:
                                                                            hslToCss(
                                                                                pair.bg
                                                                            ),
                                                                    }}
                                                                >
                                                                    <div
                                                                        className="absolute top-0 left-0 w-full h-full"
                                                                        style={{
                                                                            backgroundColor:
                                                                                hslToCss(
                                                                                    pair.fg
                                                                                ),
                                                                            clipPath:
                                                                                "polygon(0 0, 100% 0, 0 100%)",
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 text-xs text-[rgb(var(--text-primary))]">
                                                                <div className="font-medium">
                                                                    {pairInfo?.label ||
                                                                        "Color Pair"}
                                                                </div>
                                                                <div className="text-[rgb(var(--text-secondary))] space-y-1">
                                                                    <div>
                                                                        Contrast:{" "}
                                                                        <span className="font-mono">
                                                                            {pair.contrast.toFixed(
                                                                                2
                                                                            )}
                                                                            :1
                                                                        </span>{" "}
                                                                        (needs{" "}
                                                                        {
                                                                            validationDetails.threshold
                                                                        }
                                                                        :1)
                                                                    </div>
                                                                    <div className="font-mono text-[rgb(var(--text-secondary))]">
                                                                        FG: HSL(
                                                                        {
                                                                            pair
                                                                                .fg
                                                                                .h
                                                                        }
                                                                        °,{" "}
                                                                        {
                                                                            pair
                                                                                .fg
                                                                                .s
                                                                        }
                                                                        %,{" "}
                                                                        {
                                                                            pair
                                                                                .fg
                                                                                .l
                                                                        }
                                                                        %)
                                                                    </div>
                                                                    <div className="font-mono text-[rgb(var(--text-secondary))]">
                                                                        BG: HSL(
                                                                        {
                                                                            pair
                                                                                .bg
                                                                                .h
                                                                        }
                                                                        °,{" "}
                                                                        {
                                                                            pair
                                                                                .bg
                                                                                .s
                                                                        }
                                                                        %,{" "}
                                                                        {
                                                                            pair
                                                                                .bg
                                                                                .l
                                                                        }
                                                                        %)
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bypass Button - Only show when there are errors */}
                            {validationError &&
                                validationDetails.failedPairs.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-[rgb(var(--border-window))]">
                                        <button
                                            onClick={() => {
                                                if (
                                                    !selectedColor ||
                                                    !selectedScheme
                                                )
                                                    return;
                                                const themeConfig = {
                                                    baseColor: selectedColor,
                                                    schemeType: selectedScheme,
                                                    contrastThreshold:
                                                        contrastThreshold ===
                                                            "AA" ||
                                                        contrastThreshold ===
                                                            "AAA"
                                                            ? contrastThreshold
                                                            : customThreshold,
                                                    useBlackWhiteText,
                                                    allowMixMatch,
                                                    saturation,
                                                    hueOffset,
                                                };
                                                saveTheme(themeConfig);
                                                applyTheme(
                                                    themeConfig,
                                                    isDarkMode
                                                );
                                                setValidationError(null);
                                                // Keep validation details but clear error
                                                setValidationDetails({
                                                    ...validationDetails,
                                                    failedPairs: [],
                                                });
                                                setSuccessMessage(
                                                    "Color scheme applied (accessibility warnings bypassed)"
                                                );
                                            }}
                                            className="w-full px-4 py-2 bg-[rgb(var(--bg-button))] hover:bg-[rgb(var(--bg-button-hover))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border-window))] rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Apply Theme Anyway (Bypass
                                            Validation)
                                        </button>
                                    </div>
                                )}
                        </div>
                    )}

                    {/* Scheme Tiles */}
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
                                                    {/* Diagonal split: top-left shows foreground, bottom-right shows background */}
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

            {/* Reset Button */}
            {selectedColor && (
                <div className="flex justify-end">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-[rgb(var(--bg-button))] text-[rgb(var(--text-primary))] rounded-lg hover:bg-[rgb(var(--bg-button-hover))] transition-colors border border-[rgb(var(--border-window))]"
                    >
                        Reset to Default
                    </button>
                </div>
            )}
        </div>
    );
}
