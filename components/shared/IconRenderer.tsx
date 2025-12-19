"use client";

import React from "react";
import type { Content, Category } from "@/app/data/content";
import { getCategoryIcon } from "@/app/data/content";
import { Favicon } from "./Favicon";
import { useArtGalleryThumbnail } from "@/app/hooks/useArtGalleryThumbnail";
import {
    FileText,
    Gamepad2,
    Layers,
    BookOpen,
    Users,
    Palette,
    Cpu,
    Music,
    Brain,
    Video,
    Info,
    Mail,
    Settings,
    Image,
    Paintbrush,
    PenTool,
} from "lucide-react";

interface IconRendererProps {
    content: Content;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const getSizeConfig = (size: "sm" | "md" | "lg", isArtThumbnail: boolean) => {
    return {
        class: `w-${size} h-${size}`,
        pixels: getPixels(size, isArtThumbnail),
    };
};

const getPixels = (size: "sm" | "md" | "lg", isArtThumbnail: boolean) => {
    switch (size) {
        case "sm":
            if (isArtThumbnail) {
                return 32;
            }
            return 16;
        case "md":
            if (isArtThumbnail) {
                return 48;
            }
            return 24;
        case "lg":
            if (isArtThumbnail) {
                return 64;
            }
            return 48;
    }
};

const iconComponentMap: Record<
    string,
    React.ComponentType<{ className?: string }>
> = {
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
    // System windows
    about: Info,
    contact: Mail,
    settings: Settings,
    // Art galleries
    "art-digital-art": Image,
    "art-paintings": Paintbrush,
    "art-sketches": PenTool,
};

export function IconRenderer({
    content,
    size = "md",
    className = "",
}: IconRendererProps) {
    // Check if this is an art gallery and get thumbnail
    const artGalleryThumbnail = useArtGalleryThumbnail(content.id);

    const sizeConfig = getSizeConfig(size, !!artGalleryThumbnail);
    const sizeClass = sizeConfig.class;

    // For external links, use favicon
    if (content.type === "external") {
        const fallback = (() => {
            const IconComponent = iconComponentMap[content.id];
            if (IconComponent) {
                return <IconComponent className={sizeClass} />;
            }
            const emoji = getCategoryIcon(content.category);
            return (
                <span
                    className={`${sizeClass} flex items-center justify-center text-2xl`}
                >
                    {emoji}
                </span>
            );
        })();

        return (
            <Favicon
                url={content.url}
                size={sizeConfig.pixels}
                className={className}
                fallback={fallback}
            />
        );
    }

    // For art galleries, use thumbnail if available
    if (artGalleryThumbnail) {
        return (
            <img
                src={artGalleryThumbnail}
                alt={content.title}
                className={`${sizeClass} ${className} object-cover rounded-2xl`}
                style={{ width: sizeConfig.pixels, height: sizeConfig.pixels }}
            />
        );
    }

    // For internal apps and other types, use the icon component map
    const IconComponent = iconComponentMap[content.id];
    if (IconComponent) {
        return (
            <IconComponent
                className={`${sizeClass} ${className} rounded-2xl text-[rgb(var(--text-primary))]`}
            />
        );
    }

    // Fallback to emoji based on category
    const emoji = getCategoryIcon(content.category);
    return (
        <span
            className={`${sizeClass} ${className} flex items-center justify-center text-2xl text-[rgb(var(--text-secondary))]`}
        >
            {emoji}
        </span>
    );
}
