"use client";

import { useMemo } from "react";
import { getAllContent } from "@/app/data/content";

export interface AppMessage {
    title: string;
    description: string;
}

/**
 * Hook that generates revolving messages about apps from the content list
 * Returns an array of messages with title and description components
 * Used by both the splash screen and About component
 */
export function useAppMessages(): AppMessage[] {
    const messages = useMemo(() => {
        const allContent = getAllContent();

        // Filter to only operational apps (exclude system windows like about, contact, settings)
        const apps = allContent.filter(
            (item) =>
                item.status === "operational" &&
                !["about", "contact", "settings"].includes(item.id)
        );

        // Generate messages about each app with separate title and description
        const appMessages: AppMessage[] = apps.map((app) => ({
            title: app.title,
            description: app.description,
        }));

        // Shuffle the messages for more variety
        const shuffled = [...appMessages].sort(() => Math.random() - 0.5);

        return shuffled;
    }, []);

    return messages;
}
