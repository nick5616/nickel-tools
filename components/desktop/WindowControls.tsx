"use client";

import React from "react";
import { X, Minus, Maximize2 } from "lucide-react";
import { paletteColor } from "@/app/utils/nickelPalette";

interface WindowControlsProps {
    onMinimize: () => void;
    onMaximize?: () => void;
    onClose: () => void;
}

// Nickel's take on traffic lights: three foreground-role dots in the
// scheme's first three hues, with glyphs on hover.
export function WindowControls({ onMinimize, onMaximize, onClose }: WindowControlsProps) {
    const buttons = [
        { label: "Close", onClick: onClose, Icon: X, slot: 1 },
        { label: "Minimize", onClick: onMinimize, Icon: Minus, slot: 2 },
        ...(onMaximize
            ? [{ label: "Maximize / Restore", onClick: onMaximize, Icon: Maximize2, slot: 3 }]
            : []),
    ];

    return (
        <div
            className="group/controls flex items-center gap-2"
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
        >
            {buttons.map(({ label, onClick, Icon, slot }) => (
                <button
                    key={label}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                    }}
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-nickel))]"
                    style={{
                        background: paletteColor(slot, "fg"),
                        color: paletteColor(slot, "bg"),
                    }}
                    aria-label={label}
                    title={label}
                >
                    <Icon
                        size={9}
                        strokeWidth={3}
                        className="opacity-0 group-hover/controls:opacity-100 transition-opacity"
                    />
                </button>
            ))}
        </div>
    );
}
