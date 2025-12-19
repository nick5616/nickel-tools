"use client";

import { useState, useEffect } from "react";
import { getRandomArtThumbnail } from "@/app/utils/gcs";

type ArtGalleryFolder =
    | "digital-art"
    | "paintings"
    | "sketches"
    | "lefthanded"
    | "miscellaneous"
    | "notesappart";

/**
 * Maps art gallery content IDs to their folder names
 */
function getFolderFromContentId(contentId: string): ArtGalleryFolder | null {
    const folderMap: Record<string, ArtGalleryFolder> = {
        "art-digital-art": "digital-art",
        "art-paintings": "paintings",
        "art-sketches": "sketches",
        "art-lefthanded": "lefthanded",
        "art-miscellaneous": "miscellaneous",
        "art-notesappart": "notesappart",
    };
    return folderMap[contentId] || null;
}

// Cache for thumbnails to ensure consistency within a session
const thumbnailCache: Record<string, string | null> = {};

/**
 * Hook to get a random thumbnail URL for an art gallery
 * Returns null if not an art gallery or if fetching fails
 * The thumbnail is cached for the session to ensure consistency
 */
export function useArtGalleryThumbnail(contentId: string): string | null {
    const [thumbnail, setThumbnail] = useState<string | null>(
        thumbnailCache[contentId] ?? null
    );

    useEffect(() => {
        // Use cached thumbnail if available
        if (thumbnailCache[contentId] !== undefined) {
            setThumbnail(thumbnailCache[contentId]);
            return;
        }

        const folder = getFolderFromContentId(contentId);
        if (!folder) {
            thumbnailCache[contentId] = null;
            setThumbnail(null);
            return;
        }

        async function fetchThumbnail() {
            try {
                const url = await getRandomArtThumbnail(
                    folder as ArtGalleryFolder
                );
                thumbnailCache[contentId] = url;
                setThumbnail(url);
            } catch (err) {
                console.error(
                    `Error fetching thumbnail for ${contentId}:`,
                    err
                );
                thumbnailCache[contentId] = null;
                setThumbnail(null);
            }
        }

        fetchThumbnail();
    }, [contentId]);

    return thumbnail;
}
