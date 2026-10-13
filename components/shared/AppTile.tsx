"use client";

import React, { forwardRef } from "react";
import {
    Clapperboard,
    Code2,
    FlaskConical,
    Gamepad2,
    Globe,
    GraduationCap,
    LayoutDashboard,
    Music,
    Palette,
    Shapes,
    Smartphone,
    Sparkles,
    Users,
    Wrench,
    BrainCircuit,
    FileText,
    Layers,
    BookOpen,
    Cpu,
    Brain,
    Video,
    Info,
    Mail,
    Settings,
    Image,
    Paintbrush,
    PenTool,
    Grid,
    Hand,
    Folder,
    type LucideIcon,
} from "lucide-react";
import type { Category, Content } from "@/app/data/content";
import { Favicon } from "./Favicon";
import { IconRenderer } from "./IconRenderer";
import { useArtGalleryThumbnail } from "@/app/hooks/useArtGalleryThumbnail";
import { getAtomicNumber, tileStyle } from "@/app/utils/nickelPalette";

const CATEGORY_GLYPHS: Record<Category, LucideIcon> = {
    Engineering: Code2,
    Music: Music,
    Art: Palette,
    "Immersive Web": Globe,
    "Social Tools": Users,
    "AI / Productivity": Sparkles,
    Games: Gamepad2,
    Gaming: Gamepad2,
    Experiments: FlaskConical,
    "Design System": Shapes,
    Utility: Wrench,
    "Creative Productivity": LayoutDashboard,
    Education: GraduationCap,
    "Machine Learning": BrainCircuit,
    Video: Clapperboard,
    "Social App": Smartphone,
};

const APP_GLYPHS: Record<string, LucideIcon> = {
    "resume-builder": FileText,
    portfolio: Gamepad2,
    tierlistify: Layers,
    videogamequest: BookOpen,
    friendex: Users,
    "color-engine": Palette,
    "choice-engine": Cpu,
    "smart-piano": Music,
    "brains-games-gauntlet": Brain,
    chaos: Video,
    "saucedog-art": Palette,
    passionfruit: Layers,
    "batch-analyzer": Grid,
    about: Info,
    contact: Mail,
    settings: Settings,
    "art-digital-art": Image,
    "art-paintings": Paintbrush,
    "art-sketches": PenTool,
    "art-lefthanded": Hand,
    "art-miscellaneous": Folder,
    "art-notesappart": FileText,
};

export function getGlyph(content: Content): LucideIcon {
    return APP_GLYPHS[content.id] ?? CATEGORY_GLYPHS[content.category] ?? Shapes;
}

interface AppTileProps {
    content: Content;
    size?: number;
    showNumber?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * An app icon: a squircle tinted by the app's category color from the active
 * palette, with a glyph, favicon, or artwork, a specular sheen that follows
 * the light, and the app's "atomic number" in the corner.
 */
export const AppTile = forwardRef<HTMLDivElement, AppTileProps>(
    function AppTile(
        { content, size = 56, showNumber, className = "", style },
        ref
    ) {
        const glyphIcon = getGlyph(content);
        const thumbnail = useArtGalleryThumbnail(content.id);
        const numbered = showNumber ?? size >= 52;

        const glyph = React.createElement(glyphIcon, {
            size: Math.round(size * 0.48),
            strokeWidth: 1.75,
            className: "relative z-[1]",
        });

        let face: React.ReactNode = glyph;
        if (thumbnail) {
            face = (
                <div className="absolute inset-0">
                    <IconRenderer
                        content={content}
                        px={size}
                        className="!rounded-none w-full h-full"
                    />
                </div>
            );
        } else if (content.type === "external") {
            // Favicons sit on a background-role plate of the tile's hue.
            const plate = Math.round(size * 0.64);
            face = (
                <div
                    className="relative z-[1] flex items-center justify-center shadow-[0_1px_3px_rgb(0_0_0/0.2)]"
                    style={{
                        width: plate,
                        height: plate,
                        borderRadius: "28%",
                        background:
                            "hsl(var(--tile-hue) var(--nk-s) var(--nk-bg-l))",
                    }}
                >
                    <Favicon
                        url={content.url}
                        size={Math.round(plate * 0.72)}
                        contentId={content.id}
                        className="!rounded-[22%]"
                        fallback={React.createElement(glyphIcon, {
                            size: Math.round(plate * 0.62),
                            strokeWidth: 1.75,
                            style: {
                                color: "hsl(var(--tile-hue) var(--nk-s) var(--nk-fg-l))",
                            },
                        })}
                    />
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={`nk-tile flex items-center justify-center shrink-0 ${className}`}
                data-dormant={content.status !== "operational"}
                style={{
                    ...tileStyle(content.category),
                    width: size,
                    height: size,
                    ...style,
                }}
            >
                {face}
                {numbered && (
                    <span
                        className="absolute z-[3] font-mono font-semibold leading-none opacity-80 pointer-events-none"
                        style={{
                            top: size * 0.09,
                            left: size * 0.11,
                            fontSize: Math.max(7, size * 0.14),
                            // Over artwork the role color can't be trusted
                            color: thumbnail ? "white" : undefined,
                            textShadow: thumbnail
                                ? "0 1px 2px rgb(0 0 0 / 0.6)"
                                : undefined,
                        }}
                    >
                        {getAtomicNumber(content)}
                    </span>
                )}
            </div>
        );
    }
);
