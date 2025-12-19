"use client";

import React, { useRef, useEffect, useState } from "react";

interface RevolvingTextProps {
    text: string;
    containerWidth: number; // Width of the container in pixels
    className?: string;
}

export function RevolvingText({
    text,
    containerWidth,
    className = "",
}: RevolvingTextProps) {
    const measureRef = useRef<HTMLDivElement>(null);
    const [needsRevolving, setNeedsRevolving] = useState(false);
    const [textWidth, setTextWidth] = useState(0);
    const spacing = 32; // ml-8 = 32px spacing between duplicated text

    useEffect(() => {
        if (measureRef.current) {
            const width = measureRef.current.scrollWidth;
            setTextWidth(width);
            setNeedsRevolving(width > containerWidth);
        }
    }, [text, containerWidth]);

    // Calculate animation duration based on text length
    // Speed: roughly 25px per second for readability (half speed)
    const animationDuration = needsRevolving
        ? Math.max(6, (textWidth + spacing) / 25)
        : 0;

    return (
        <div
            className="overflow-hidden relative"
            style={{ width: containerWidth }}
        >
            {/* Hidden element to measure text width with same styling */}
            <div
                ref={measureRef}
                className={`absolute opacity-0 pointer-events-none whitespace-nowrap ${className}`}
                style={{ visibility: "hidden", position: "absolute" }}
            >
                {text}
            </div>
            <div
                className={`whitespace-nowrap ${className}`}
                style={
                    needsRevolving
                        ? {
                              animation: `revolveContinuous ${animationDuration}s linear infinite`,
                              ["--text-width" as string]: `${
                                  textWidth + spacing
                              }px`,
                          }
                        : {}
                }
            >
                {text}
                {needsRevolving && <span className="ml-8">{text}</span>}
            </div>
        </div>
    );
}
