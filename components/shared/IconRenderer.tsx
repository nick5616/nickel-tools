"use client";

import React from "react";
import type { Content, Category } from "@/app/data/content";
import { getCategoryIcon } from "@/app/data/content";
import { Favicon } from "./Favicon";
import { useArtGalleryThumbnail } from "@/app/hooks/useArtGalleryThumbnail";
import { useImageLoader } from "@/app/hooks/useImageLoader";
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
            return 32;
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
    const { registerImage, markImageLoaded, markImageError } = useImageLoader();

    // Check if this is an art gallery content type
    const isArtGallery = [
        "art-digital-art",
        "art-paintings",
        "art-sketches",
        "art-lefthanded",
        "art-miscellaneous",
        "art-notesappart",
    ].includes(content.id);

    // Always call hooks at the top level - never conditionally
    const imageRef = React.useRef<HTMLImageElement | null>(null);
    const hasReportedRef = React.useRef(false);
    const thumbnailFetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const sizeConfig = getSizeConfig(size, !!artGalleryThumbnail);
    const sizeClass = sizeConfig.class;

    // Register image loading for art galleries IMMEDIATELY (don't wait for thumbnail URL)
    React.useEffect(() => {
        if (isArtGallery) {
            // Register immediately so the image loader knows to wait for this image
            registerImage(`art-thumbnail-${content.id}`);
        }
    }, [isArtGallery, content.id, registerImage]);

    // Handle thumbnail fetch state - wait for thumbnail to be fetched
    React.useEffect(() => {
        if (!isArtGallery) return;

        // Clear any existing timeout
        if (thumbnailFetchTimeoutRef.current) {
            clearTimeout(thumbnailFetchTimeoutRef.current);
            thumbnailFetchTimeoutRef.current = null;
        }

        // If thumbnail is null, wait for it to be fetched (or timeout if it fails)
        if (artGalleryThumbnail === null) {
            // Give it time to fetch - if still null after 5 seconds, mark as error
            thumbnailFetchTimeoutRef.current = setTimeout(() => {
                // Re-check if thumbnail is still null after timeout
                // If it's still null, there's no image to load (fetch failed or no images available)
                markImageError(`art-thumbnail-${content.id}`);
            }, 5000); // Give it 5 seconds for the fetch to complete
        }
        // If thumbnail is available, the img tag's onLoad/onError will handle it

        return () => {
            if (thumbnailFetchTimeoutRef.current) {
                clearTimeout(thumbnailFetchTimeoutRef.current);
            }
        };
    }, [isArtGallery, artGalleryThumbnail, content.id, markImageError]);

    // Reset refs when content changes
    React.useEffect(() => {
        hasReportedRef.current = false;
    }, [content.id]);

    // Check if image is already loaded when thumbnail becomes available (for art galleries)
    // This handles cases where the image is cached and loads instantly
    React.useEffect(() => {
        if (!isArtGallery || !artGalleryThumbnail) return;

        // Give the image element a moment to render and start loading
        const checkImageLoaded = () => {
            if (imageRef.current?.complete && !hasReportedRef.current) {
                hasReportedRef.current = true;
                markImageLoaded(`art-thumbnail-${content.id}`);
            }
        };

        // Check immediately (in case it's already loaded from cache)
        checkImageLoaded();

        // Also check after a short delay to catch images that load very quickly
        const timeoutId = setTimeout(checkImageLoaded, 100);

        return () => clearTimeout(timeoutId);
    }, [isArtGallery, artGalleryThumbnail, content.id, markImageLoaded]);

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
                contentId={content.id}
            />
        );
    }

    // For art galleries, use thumbnail if available
    if (artGalleryThumbnail) {
        return (
            <img
                ref={imageRef}
                src={artGalleryThumbnail}
                alt={content.title}
                className={`${sizeClass} ${className} object-cover rounded-2xl`}
                style={{ width: sizeConfig.pixels, height: sizeConfig.pixels }}
                onLoad={() => {
                    if (!hasReportedRef.current) {
                        hasReportedRef.current = true;
                        markImageLoaded(`art-thumbnail-${content.id}`);
                    }
                }}
                onError={() => {
                    if (!hasReportedRef.current) {
                        hasReportedRef.current = true;
                        markImageError(`art-thumbnail-${content.id}`);
                    }
                }}
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
