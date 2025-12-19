"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Content } from "@/app/data/content";
import { IconRenderer } from "@/components/shared/IconRenderer";
import { RevolvingText } from "@/components/shared/RevolvingText";

interface AppIconProps {
    content: Content;
    onClick: () => void;
}

export function AppIcon({ content, onClick }: AppIconProps) {
    return (
        <motion.button
            onClick={onClick}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-[rgb(var(--bg-button-hover))] transition-colors w-full"
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            <div className="w-16 h-16 bg-[rgb(var(--bg-button))] rounded-2xl flex items-center justify-center">
                <IconRenderer
                    content={content}
                    size="lg"
                    className="text-[rgb(var(--text-primary))]"
                />
            </div>
            <div className="w-16 text-xs text-center leading-tight text-[rgb(var(--text-primary))] relative">
                <RevolvingText
                    text={content.title}
                    containerWidth={64}
                    className="text-[rgb(var(--text-primary))]"
                />
            </div>
        </motion.button>
    );
}
