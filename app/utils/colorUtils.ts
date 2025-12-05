/**
 * Color utility functions for HSL color theory, WCAG accessibility, and color scheme generation
 */

export interface HSL {
    h: number; // 0-360
    s: number; // 0-100
    l: number; // 0-100
}

export interface RGB {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
}

export type ColorSchemeType =
    | "monochromatic"
    | "analogous"
    | "complementary"
    | "split-complementary"
    | "triadic"
    | "square"
    | "rectangular";

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r: number, g: number, b: number;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            default:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

/**
 * Convert RGB to CSS rgb() string
 */
export function rgbToCss(rgb: RGB): string {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Convert HSL to CSS hsl() string
 */
export function hslToCss(hsl: HSL): string {
    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

/**
 * Convert RGB to CSS variable format (space-separated values)
 */
export function rgbToCssVariable(rgb: RGB): string {
    return `${rgb.r} ${rgb.g} ${rgb.b}`;
}

/**
 * Calculate relative luminance according to WCAG 2.1
 * Formula: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(rgb: RGB): number {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
        const normalized = val / 255;
        return normalized <= 0.03928
            ? normalized / 12.92
            : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors (WCAG 2.1)
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: RGB, color2: RGB): number {
    const lum1 = getRelativeLuminance(color1);
    const lum2 = getRelativeLuminance(color2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard (4.5:1 for normal text, 3:1 for large text)
 */
export function meetsAA(
    contrastRatio: number,
    isLargeText: boolean = false
): boolean {
    return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standard (7:1 for normal text, 4.5:1 for large text)
 */
export function meetsAAA(
    contrastRatio: number,
    isLargeText: boolean = false
): boolean {
    return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
}

/**
 * Adjust lightness of an HSL color
 */
export function adjustLightness(hsl: HSL, delta: number): HSL {
    return {
        ...hsl,
        l: Math.max(0, Math.min(100, hsl.l + delta)),
    };
}

/**
 * Adjust saturation of an HSL color
 */
export function adjustSaturation(hsl: HSL, delta: number): HSL {
    return {
        ...hsl,
        s: Math.max(0, Math.min(100, hsl.s + delta)),
    };
}

/**
 * Normalize hue to 0-360 range
 */
function normalizeHue(hue: number): number {
    return ((hue % 360) + 360) % 360;
}

/**
 * Generate monochromatic color scheme
 */
export function generateMonochromatic(baseColor: HSL): HSL[] {
    return [baseColor];
}

/**
 * Generate analogous color scheme (±30°)
 */
export function generateAnalogous(baseColor: HSL): HSL[] {
    return [
        { ...baseColor, h: normalizeHue(baseColor.h - 30) },
        baseColor,
        { ...baseColor, h: normalizeHue(baseColor.h + 30) },
    ];
}

/**
 * Generate complementary color scheme (180°)
 */
export function generateComplementary(baseColor: HSL): HSL[] {
    return [baseColor, { ...baseColor, h: normalizeHue(baseColor.h + 180) }];
}

/**
 * Generate split-complementary color scheme (150° and 210°)
 */
export function generateSplitComplementary(baseColor: HSL): HSL[] {
    return [
        baseColor,
        { ...baseColor, h: normalizeHue(baseColor.h + 150) },
        { ...baseColor, h: normalizeHue(baseColor.h + 210) },
    ];
}

/**
 * Generate triadic color scheme (120° intervals)
 */
export function generateTriadic(baseColor: HSL): HSL[] {
    return [
        baseColor,
        { ...baseColor, h: normalizeHue(baseColor.h + 120) },
        { ...baseColor, h: normalizeHue(baseColor.h + 240) },
    ];
}

/**
 * Generate square color scheme (90° intervals)
 */
export function generateSquare(baseColor: HSL): HSL[] {
    return [
        baseColor,
        { ...baseColor, h: normalizeHue(baseColor.h + 90) },
        { ...baseColor, h: normalizeHue(baseColor.h + 180) },
        { ...baseColor, h: normalizeHue(baseColor.h + 270) },
    ];
}

/**
 * Generate rectangular color scheme (60° and 180° shifts)
 */
export function generateRectangular(baseColor: HSL): HSL[] {
    return [
        baseColor,
        { ...baseColor, h: normalizeHue(baseColor.h + 60) },
        { ...baseColor, h: normalizeHue(baseColor.h + 180) },
        { ...baseColor, h: normalizeHue(baseColor.h + 240) },
    ];
}

/**
 * Generate color scheme based on type
 */
export function generateColorScheme(
    baseColor: HSL,
    schemeType: ColorSchemeType
): HSL[] {
    switch (schemeType) {
        case "monochromatic":
            return generateMonochromatic(baseColor);
        case "analogous":
            return generateAnalogous(baseColor);
        case "complementary":
            return generateComplementary(baseColor);
        case "split-complementary":
            return generateSplitComplementary(baseColor);
        case "triadic":
            return generateTriadic(baseColor);
        case "square":
            return generateSquare(baseColor);
        case "rectangular":
            return generateRectangular(baseColor);
        default:
            return [baseColor];
    }
}

/**
 * Adjust colors for light/dark mode
 * Light mode: lighter backgrounds, darker text
 * Dark mode: darker backgrounds, lighter text
 */
export function adjustForMode(
    color: HSL,
    isDarkMode: boolean,
    isBackground: boolean = true
): HSL {
    if (isBackground) {
        // Backgrounds: lighter in light mode, darker in dark mode
        return isDarkMode
            ? adjustLightness(color, -20)
            : adjustLightness(color, 20);
    } else {
        // Text: darker in light mode, lighter in dark mode
        return isDarkMode
            ? adjustLightness(color, 30)
            : adjustLightness(color, -30);
    }
}

/**
 * Get high contrast variant of a color (for text on backgrounds)
 * Automatically adjusts until contrast meets threshold
 * Uses the user's logic: adjust whichever is closer to 50% (middle)
 * More aggressive: allows text to go to 2-98% and adjusts more aggressively
 */
export function getHighContrastVariant(
    background: HSL,
    isDarkMode: boolean,
    threshold: number = 7
): HSL {
    const bgRgb = hslToRgb(background);

    // Determine if background is light or dark
    const isBackgroundLight = background.l > 50;

    // Start with opposite extreme - more aggressive bounds (2-98%)
    let textLightness = isBackgroundLight ? 2 : 98;
    let textRgb = hslToRgb({ ...background, l: textLightness });
    let contrast = getContrastRatio(textRgb, bgRgb);

    // Safety: limit iterations to prevent infinite loops
    let iterations = 0;
    const maxIterations = 200; // Increased for more aggressive adjustment

    // If contrast is too low, adjust the color that's closer to 50% (middle)
    // Keep adjusting 1% at a time until contrast is met
    while (contrast < threshold && iterations < maxIterations) {
        iterations++;

        const bgDistanceFromMiddle = Math.abs(background.l - 50);
        const textDistanceFromMiddle = Math.abs(textLightness - 50);

        // Determine which direction to adjust
        let adjustment = 0;

        if (bgDistanceFromMiddle < textDistanceFromMiddle) {
            // Background is closer to middle - but we can't change background,
            // so adjust text in the direction that increases contrast
            if (isBackgroundLight) {
                // Light background - make text darker (decrease lightness)
                if (textLightness > 2) {
                    adjustment = -1;
                } else {
                    break; // Can't adjust further
                }
            } else {
                // Dark background - make text lighter (increase lightness)
                if (textLightness < 98) {
                    adjustment = 1;
                } else {
                    break; // Can't adjust further
                }
            }
        } else {
            // Text is closer to middle - adjust it
            if (isBackgroundLight) {
                // Light background - make text darker
                if (textLightness > 2) {
                    adjustment = -1;
                } else {
                    break; // Can't adjust further
                }
            } else {
                // Dark background - make text lighter
                if (textLightness < 98) {
                    adjustment = 1;
                } else {
                    break; // Can't adjust further
                }
            }
        }

        // Apply adjustment with more aggressive bounds (2-98%)
        if (adjustment !== 0) {
            textLightness = Math.max(
                2,
                Math.min(98, textLightness + adjustment)
            );
            textRgb = hslToRgb({ ...background, l: textLightness });
            contrast = getContrastRatio(textRgb, bgRgb);
        } else {
            break; // No adjustment possible
        }
    }

    // Final bounds check with more aggressive bounds
    return { ...background, l: Math.max(2, Math.min(98, textLightness)) };
}

/**
 * Adjust a color pair (foreground and background) to meet contrast threshold
 * More aggressive: allows backgrounds to go to 2-98% and adjusts both colors
 */
export function adjustPairForContrast(
    foreground: HSL,
    background: HSL,
    isDarkMode: boolean,
    threshold: number
): { fg: HSL; bg: HSL } {
    let fg = { ...foreground };
    let bg = { ...background };

    // Determine if background is light or dark
    const isBackgroundLight = bg.l > 50;

    // Start with more aggressive bounds
    if (isBackgroundLight) {
        // Light background - make text darker, background lighter
        fg.l = Math.max(2, Math.min(98, fg.l));
        bg.l = Math.max(2, Math.min(98, bg.l));
    } else {
        // Dark background - make text lighter, background darker
        fg.l = Math.max(2, Math.min(98, fg.l));
        bg.l = Math.max(2, Math.min(98, bg.l));
    }

    let fgRgb = hslToRgb(fg);
    let bgRgb = hslToRgb(bg);
    let contrast = getContrastRatio(fgRgb, bgRgb);

    let iterations = 0;
    const maxIterations = 200;

    // Adjust both colors to maximize contrast
    while (contrast < threshold && iterations < maxIterations) {
        iterations++;

        const bgDistanceFromMiddle = Math.abs(bg.l - 50);
        const fgDistanceFromMiddle = Math.abs(fg.l - 50);

        // Adjust the color closer to middle first
        if (bgDistanceFromMiddle < fgDistanceFromMiddle) {
            // Adjust background
            if (isBackgroundLight) {
                // Light background - make it lighter (increase lightness)
                if (bg.l < 98) {
                    bg.l = Math.min(98, bg.l + 1);
                } else if (fg.l > 2) {
                    // If background can't go lighter, make text darker
                    fg.l = Math.max(2, fg.l - 1);
                } else {
                    break;
                }
            } else {
                // Dark background - make it darker (decrease lightness)
                if (bg.l > 2) {
                    bg.l = Math.max(2, bg.l - 1);
                } else if (fg.l < 98) {
                    // If background can't go darker, make text lighter
                    fg.l = Math.min(98, fg.l + 1);
                } else {
                    break;
                }
            }
        } else {
            // Adjust foreground
            if (isBackgroundLight) {
                // Light background - make text darker
                if (fg.l > 2) {
                    fg.l = Math.max(2, fg.l - 1);
                } else if (bg.l < 98) {
                    // If text can't go darker, make background lighter
                    bg.l = Math.min(98, bg.l + 1);
                } else {
                    break;
                }
            } else {
                // Dark background - make text lighter
                if (fg.l < 98) {
                    fg.l = Math.min(98, fg.l + 1);
                } else if (bg.l > 2) {
                    // If text can't go lighter, make background darker
                    bg.l = Math.max(2, bg.l - 1);
                } else {
                    break;
                }
            }
        }

        fgRgb = hslToRgb(fg);
        bgRgb = hslToRgb(bg);
        contrast = getContrastRatio(fgRgb, bgRgb);
    }

    return { fg, bg };
}

/**
 * Validate accessibility for all foreground/background combinations
 */
export interface ContrastValidationResult {
    isValid: boolean;
    failedPairs: Array<{
        foreground: HSL;
        background: HSL;
        contrastRatio: number;
        threshold: number;
    }>;
}

export function validateContrast(
    colors: HSL[],
    threshold: number | "AA" | "AAA",
    isLargeText: boolean = false,
    allowMixMatch: boolean = false
): ContrastValidationResult {
    const thresholdValue =
        threshold === "AA"
            ? isLargeText
                ? 3
                : 4.5
            : threshold === "AAA"
            ? isLargeText
                ? 4.5
                : 7
            : threshold;

    const failedPairs: ContrastValidationResult["failedPairs"] = [];

    if (allowMixMatch) {
        // Test ALL possible foreground/background combinations
        for (let i = 0; i < colors.length; i++) {
            for (let j = 0; j < colors.length; j++) {
                if (i === j) continue; // Skip same color pairs

                const fgRgb = hslToRgb(colors[i]);
                const bgRgb = hslToRgb(colors[j]);
                const contrast = getContrastRatio(fgRgb, bgRgb);

                if (contrast < thresholdValue) {
                    failedPairs.push({
                        foreground: colors[i],
                        background: colors[j],
                        contrastRatio: contrast,
                        threshold: thresholdValue,
                    });
                }
            }
        }
    } else {
        // Only test predefined mappings (simplified for now)
        // In practice, this would test the actual UI element combinations
        for (let i = 0; i < colors.length; i++) {
            const fgRgb = hslToRgb(colors[i]);
            // Test against a typical background (use first color as background)
            const bgRgb = hslToRgb(colors[0]);
            const contrast = getContrastRatio(fgRgb, bgRgb);

            if (contrast < thresholdValue) {
                failedPairs.push({
                    foreground: colors[i],
                    background: colors[0],
                    contrastRatio: contrast,
                    threshold: thresholdValue,
                });
            }
        }
    }

    return {
        isValid: failedPairs.length === 0,
        failedPairs,
    };
}

/**
 * Generate color swatch grid (6x6: 6 hues x 6 lightness values)
 */
export function generateColorSwatch(
    saturation: number,
    hueOffset: number = 0
): HSL[][] {
    // Base hues: 0, 60, 120, 180, 240, 300
    // Add hueOffset to shift all hues
    const baseHues = [0, 60, 120, 180, 240, 300];
    const hues = baseHues.map((h) => (h + hueOffset) % 360);
    const lightnesses = [10, 25, 40, 55, 70, 90];

    return hues.map((hue) =>
        lightnesses.map((lightness) => ({
            h: hue,
            s: saturation,
            l: lightness,
        }))
    );
}
