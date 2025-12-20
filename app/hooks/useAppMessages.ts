"use client";

import { useMemo } from "react";
import { getAllContent } from "@/app/data/content";

/**
 * Hook that generates revolving messages about apps from the content list
 * Returns an array of messages that can be cycled through
 * Used by both the splash screen and About component
 */
export function useAppMessages(): string[] {
    const messages = useMemo(() => {
        const allContent = getAllContent();
        
        // Filter to only operational apps (exclude system windows like about, contact, settings)
        const apps = allContent.filter(
            (item) =>
                item.status === "operational" &&
                !["about", "contact", "settings"].includes(item.id)
        );

        // Generate messages about each app with varied phrasing
        const appMessages = apps.flatMap((app) => {
            // Create different message variations for each app
            const variations = [
                `Check out ${app.title}`,
                `Explore ${app.title}`,
                `Try ${app.title}`,
                `Discover ${app.title}`,
                `Visit ${app.title}`,
            ];
            
            // Return all variations so we can cycle through them
            // This gives more variety in the messages
            return variations;
        });

        // Shuffle the messages for more variety
        const shuffled = [...appMessages].sort(() => Math.random() - 0.5);

        return shuffled;
    }, []);

    return messages;
}

