"use client";

import React from "react";
import type { Content } from "@/app/data/content";

interface ContentfulDescriptionRendererProps {
    content: Content;
}

export function ContentfulDescriptionRenderer({
    content,
}: ContentfulDescriptionRendererProps) {
    // Use the contentfulDescription component from the content config
    if (content.contentfulDescription) {
        const DescriptionComponent = content.contentfulDescription;
        return <DescriptionComponent content={content} />;
    }

    // Fallback to plain description if no component is provided
    return (
        <div>
            <p className="text-sm text-[rgb(var(--text-primary))] whitespace-pre-wrap">
                {content.description}
            </p>
        </div>
    );
}
