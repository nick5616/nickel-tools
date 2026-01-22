"use client";

import React from "react";

interface ProjectIframeProps {
    src: string;
    title: string;
    mobileDimensions?: boolean;
}

export default function ProjectIframe({
    src,
    title,
    mobileDimensions = true,
}: ProjectIframeProps) {
    const heightClass = mobileDimensions
        ? "h-[400px] md:h-[600px] w-[300px] md:w-[400px]"
        : "h-[600px]";

    return (
        <iframe
            src={src}
            className={`w-full ${heightClass} border-0 rounded-lg shadow-xl`}
            title={title}
            loading="lazy"
        />
    );
}
