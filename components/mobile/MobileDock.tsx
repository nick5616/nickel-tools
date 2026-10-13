"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { getContentById, type Content } from "@/app/data/content";
import type { OriginRect } from "@/components/shared/motion";
import { springs } from "@/components/shared/motion";
import { AppIcon } from "./AppIcon";

const DOCK_IDS = ["portfolio", "art-digital-art", "settings"];

interface MobileDockProps {
    onOpenItem: (content: Content, rect?: OriginRect) => void;
    onLongPress: (content: Content, rect?: OriginRect) => void;
    onSearch: () => void;
}

export function MobileDock({ onOpenItem, onLongPress, onSearch }: MobileDockProps) {
    const apps = DOCK_IDS.map(getContentById).filter(
        (app): app is Content => app !== undefined
    );

    return (
        <motion.div
            className="absolute inset-x-0 bottom-0 z-20 px-3"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 10px)" }}
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={springs.window}
        >
            <div className="nk-material rounded-[34px] px-4 py-3.5 grid grid-cols-4 gap-3 items-center">
                {apps.map((app) => (
                    <AppIcon
                        key={app.id}
                        content={app}
                        onOpen={onOpenItem}
                        onLongPress={onLongPress}
                        showLabel={false}
                    />
                ))}
                <motion.button
                    onClick={onSearch}
                    whileTap={{ scale: 0.9 }}
                    className="nk-material-thin mx-auto w-[60px] h-[60px] rounded-[26%] flex items-center justify-center text-[rgb(var(--text-primary))]"
                    aria-label="Search"
                >
                    <Search size={26} />
                </motion.button>
            </div>
        </motion.div>
    );
}
